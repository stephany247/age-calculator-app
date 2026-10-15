const form = document.querySelector("#age-form");
const dayInput = document.querySelector("#day");
const monthInput = document.querySelector("#month");
const yearInput = document.querySelector("#year");

const inputs = {
  day: dayInput,
  month: monthInput,
  year: yearInput,
};

const errorElements = {
  day: document.querySelector("#day-error"),
  month: document.querySelector("#month-error"),
  year: document.querySelector("#year-error"),
};

const resultElements = {
  years: document.querySelector("#years"),
  months: document.querySelector("#months"),
  days: document.querySelector("#days"),
};

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function setError(fieldName, message) {
  const field = inputs[fieldName].closest(".field");
  field.classList.toggle("has-error", Boolean(message));
  errorElements[fieldName].textContent = message;
  inputs[fieldName].setAttribute("aria-invalid", message ? "true" : "false");
}

function clearErrors() {
  Object.keys(inputs).forEach((name) => setError(name, ""));
}

function validateDate(day, month, year) {
  const errors = { day: "", month: "", year: "" };
  const raw = {
    day: dayInput.value.trim(),
    month: monthInput.value.trim(),
    year: yearInput.value.trim(),
  };

  Object.keys(raw).forEach((name) => {
    if (!raw[name]) errors[name] = "This field is required";
  });

  if (raw.day && (!Number.isInteger(day) || day < 1 || day > 31)) {
    errors.day = "Must be a valid day";
  }

  if (raw.month && (!Number.isInteger(month) || month < 1 || month > 12)) {
    errors.month = "Must be a valid month";
  }

  const currentYear = new Date().getFullYear();
  if (raw.year && (!Number.isInteger(year) || year < 1)) {
    errors.year = "Must be a valid year";
  } else if (raw.year && year > currentYear) {
    errors.year = "Must be in the past";
  }

  // Check the full calendar date only after day, month and year are in range.
  if (!errors.day && !errors.month && !errors.year && raw.day && raw.month && raw.year) {
    const candidate = new Date(year, month - 1, day);
    const isRealDate =
      candidate.getFullYear() === year &&
      candidate.getMonth() === month - 1 &&
      candidate.getDate() === day;

    if (!isRealDate) {
      errors.day = "Must be a valid date";
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      candidate.setHours(0, 0, 0, 0);
      if (candidate > today) errors.year = "Must be in the past";
    }
  }

  return errors;
}

function calculateAge(birthDate, today = new Date()) {
  let years = today.getFullYear() - birthDate.getFullYear();
  let months = today.getMonth() - birthDate.getMonth();
  let days = today.getDate() - birthDate.getDate();

  if (days < 0) {
    // Borrow the number of days in the previous month.
    const previousMonthLastDay = new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    days += previousMonthLastDay;
    months -= 1;
  }

  if (months < 0) {
    months += 12;
    years -= 1;
  }

  return { years, months, days };
}

function animateNumber(element, target) {
  if (reducedMotion) {
    element.textContent = String(target);
    return;
  }

  const duration = 650;
  const startTime = performance.now();

  function frame(now) {
    const progress = Math.min((now - startTime) / duration, 1);
    // Ease out so the number slows as it approaches its final value.
    const eased = 1 - Math.pow(1 - progress, 3);
    element.textContent = String(Math.floor(target * eased));

    if (progress < 1) requestAnimationFrame(frame);
    else element.textContent = String(target);
  }

  requestAnimationFrame(frame);
}

function showAge(age) {
  animateNumber(resultElements.years, age.years);
  animateNumber(resultElements.months, age.months);
  animateNumber(resultElements.days, age.days);
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const day = Number(dayInput.value);
  const month = Number(monthInput.value);
  const year = Number(yearInput.value);
  const errors = validateDate(day, month, year);

  Object.entries(errors).forEach(([name, message]) => setError(name, message));

  if (Object.values(errors).some(Boolean)) return;

  const age = calculateAge(new Date(year, month - 1, day));
  showAge(age);
});

// Clear an individual field's error as the user edits it; full validation runs on submit.
Object.entries(inputs).forEach(([name, input]) => {
  input.addEventListener("input", () => {
    if (input.closest(".field").classList.contains("has-error")) {
      setError(name, "");
    }
  });
});

/**
 * v0.1.1
 */

define(["utils/requests", "utils/cycle"], function (utilsRequests, utilsCycle) {
  var config = {
    LANGUAGES: {
      RU: "ru",
      EN: "en",
    },

    LOCALIZATIONS_PATH: "./json/localizations.json",

    INNER_HTML: "innerHTML",
    PLACEHOLDER: "placeholder",
  };

  var localizations = undefined;

  var language = undefined;

  function isAllLocalizationsDownloaded() {
    if (localizations) {
      return true;
    }

    return false;
  }

  function localizePage(pageName) {
    if (!localizations[pageName]) {
      return;
    }

    var pageNames = Object.keys(localizations[pageName]);

    for (var i = 0; i < pageNames.length; ++i) {
      var dataId = pageNames[i];

      var element = document.querySelector(
        '[data-localizator-id="' + dataId + '"]'
      );

      if (!element) {
        return;
      }

      var elementTranslationData = localizations[pageName][dataId];

      if (!(language in elementTranslationData)) {
        return;
      }

      switch (elementTranslationData.type) {
        case config.INNER_HTML:
          element.innerHTML = elementTranslationData[language];
          break;
        case config.PLACEHOLDER:
          element.placeholder = elementTranslationData[language];
      }
    }
  }

  function determineLanguage() {
    if (!navigator.language) {
      language = config.LANGUAGES.EN;

      return;
    }

    var navigatorLanguage = navigator.language.split("-")[0];

    if (
      navigatorLanguage === config.LANGUAGES.EN ||
      navigatorLanguage === config.LANGUAGES.RU
    ) {
      language = navigatorLanguage;
    } else {
      language = config.LANGUAGES.EN;
    }
  }

  return {
    localizeHandler: function (pageName) {
      if (isAllLocalizationsDownloaded()) {
        localizePage(pageName);
      } else {
        var waiterId = utilsCycle.startWaiter(function () {
          if (isAllLocalizationsDownloaded()) {
            localizePage(pageName);

            utilsCycle.endWaiter(waiterId);
          }
        });
      }
    },

    getLanguage: function () {
      return language;
    },

    getLocalizations: function () {
      return localizations;
    },

    init: function () {
      determineLanguage();

      utilsRequests.loadJSON(config.LOCALIZATIONS_PATH, function (result) {
        localizations = result;
      });
    },
  };
});

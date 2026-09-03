# openbenchmarks/autobound-news

## Resumen

El repositorio `openbenchmarks/autobound-news` no contiene un modelo de inteligencia artificial generativa, sino un *stub* de model card creado por OpenBenchmarks para que una API de búsqueda de noticias empresariales pueda aparecer en el leaderboard oficial del benchmark OB News Websearch. Se trata de un artefacto de metadatos, sin pesos ni arquitectura, que documenta un endpoint de la API de Autobound (https://www.autobound.ai) especializado en la recuperación de señales de noticias sobre empresas.

La relevancia de esta entrada radica en que forma parte de un esfuerzo más amplio de OpenBenchmarks (YC F24) por publicar benchmarks independientes, verificables y reproducibles para decisiones de *build-vs-buy* en el ámbito de la inteligencia de datos empresariales. En concreto, este *stub* referencia una configuración de búsqueda con dominio, tipos de señal (`news`), subtipos y un límite de 10 resultados, que se evalúa en el contexto del leaderboard de búsqueda web de noticias. No es un modelo que se pueda descargar, ejecutar o cuantizar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es una API de búsqueda) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no hay pesos; solo metadatos de API) |

## Arquitectura y entrenamiento

No aplica. Este repositorio no contiene un modelo entrenado. Se trata de una *model card* de tipo *stub* cuyo único propósito es registrar un endpoint de la API de Autobound en el leaderboard de OpenBenchmarks. La configuración indicada (`domain · signal_types=news · signal_subtypes · limit=10`) describe una llamada a la API REST `POST /v1/companies/enrich` que devuelve noticias de empresas con un límite de 10 resultados. No hay información sobre datos de entrenamiento, arquitectura de red, ni procesos de alineación como RLHF o DPO.

## Capacidades

- Búsqueda de noticias de empresas a través de una API REST (endpoint `POST /v1/companies/enrich`).
- Recuperación de señales de tipo `news` con subtipos configurables y límite de resultados (10 en la configuración documentada).
- Integración con el benchmark OB News Websearch para evaluación objetiva de la calidad de los resultados.
- Documentación de la API disponible en https://autobound-api.readme.io/docs/news-event.
- No es un modelo de lenguaje: no genera texto, no razona, no ejecuta código ni admite *tool calling*.

## Casos de uso

- Monitoreo de noticias empresariales: integrar la API en un pipeline que consulte periódicamente noticias sobre empresas objetivo, usando la configuración de subtipos para filtrar por tipo de evento (lanzamientos, financiación, etc.).
- Inteligencia competitiva: alimentar un dashboard de seguimiento de competidores con las señales de noticias devueltas por el endpoint, limitando a 10 resultados por consulta para mantener la relevancia.
- Evaluación de proveedores de datos: utilizar el benchmark OB News Websearch para comparar el coste por respuesta correcta de Autobound frente a otras fuentes de noticias, como se menciona en el post de LinkedIn de OpenBenchmarks.
- Enriquecimiento de registros CRM: enriquecer fichas de clientes o prospectos con noticias recientes mediante la llamada a la API, aunque el límite de 10 resultados puede ser suficiente para casos de uso ligeros.
- Investigación de mercado: recopilar señales de noticias sobre un sector o conjunto de empresas para análisis cualitativos, aprovechando los subtipos disponibles en la versión v4 (39 subtipos según el blog de Autobound).
- Validación de datos en pipelines de *data engineering*: comprobar la disponibilidad y latencia de la API como parte de un proceso de integración de datos externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio es un *stub* para el leaderboard de OpenBenchmarks, pero no se incluyen métricas concretas (precisión, recall, coste por respuesta correcta, etc.) en la model card ni en los resultados de búsqueda web proporcionados. Se recomienda consultar el leaderboard oficial en https://huggingface.co/datasets/openbenchmarks/OB-News-Websearch para datos actualizados.

## Requisitos de hardware

No aplica. Al ser una API alojada externamente, no se requieren recursos de hardware locales para su uso. El consumo de recursos se limita a las llamadas HTTP al endpoint. No hay información sobre latencia, throughput ni requisitos de GPU en la documentación disponible.

## Comparativa con modelos similares

No disponible. Este repositorio no representa un modelo de IA comparable con otros LLMs o modelos de búsqueda. Se trata de una API de búsqueda de noticias, y no se dispone de información sobre alternativas equivalentes en el contexto de este *stub*.

## Limitaciones y advertencias

- No es un modelo de IA: no contiene pesos, no se puede descargar ni ejecutar localmente. Cualquier intento de usarlo como un LLM será infructuoso.
- Dependencia de un servicio externo: el funcionamiento depende de la disponibilidad de la API de Autobound y de su documentación, que puede cambiar sin previo aviso.
- Alcance limitado: la configuración documentada solo cubre noticias de empresas con un límite de 10 resultados; no es una solución general de búsqueda web.
- Licencia no especificada: no se indica bajo qué términos se puede utilizar la API o los datos obtenidos. Se debe consultar directamente con Autobound.
- Sin garantías de rendimiento: al no haber benchmarks publicados en la información proporcionada, no se puede evaluar la calidad de los resultados frente a otras fuentes.
- Posibles sesgos en los datos: al ser un servicio de noticias, los resultados pueden reflejar sesgos de cobertura mediática o de las fuentes indexadas, aunque no se detalla en la documentación.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/openbenchmarks/autobound-news
- Dataset del benchmark OB News Websearch: https://huggingface.co/datasets/openbenchmarks/OB-News-Websearch
- Documentación de la API de Autobound: https://autobound-api.readme.io/docs/news-event
- Sitio web de Autobound: https://www.autobound.ai
- Blog de Autobound sobre News Intelligence v4: https://www.autobound.ai/blog/news-intelligence-v4-40-subtypes-daily-cadence
- Sitio web de OpenBenchmarks: https://openbenchmarks.com/
- Post de LinkedIn sobre el benchmark de noticias: https://www.linkedin.com/posts/sudheenair_openbenchmarks-yc-f24-just-published-a-activity-7500944519429824513-JeqS

# openbenchmarks/brave-web

## Resumen

`openbenchmarks/brave-web` no es un modelo de inteligencia artificial generativa, sino un *stub* de model card creado por el equipo de OpenBenchmarks para representar la **API de búsqueda web de Brave Search** dentro del leaderboard oficial del benchmark `OB-News-Websearch`. Su propósito es permitir que un servicio externo de búsqueda (no un LLM) aparezca en una tabla comparativa de rendimiento junto a otros sistemas, evaluando la calidad de los resultados de búsqueda para tareas de recuperación de información.

Este "modelo" no contiene pesos, arquitectura ni parámetros entrenables; es una interfaz hacia el endpoint `GET /res/v1/web/search` de Brave Search, configurado con `count=10` y `result_filter=web`. Su relevancia radica en que los benchmarks modernos de agentes y sistemas de recuperación necesitan comparar no solo modelos generativos, sino también APIs de búsqueda que actúan como herramientas externas. Al publicar este stub, OpenBenchmarks facilita que la comunidad evalúe y compare proveedores de búsqueda de forma reproducible y estandarizada.

Dado que no se trata de un modelo de lenguaje, las secciones habituales de una ficha técnica (arquitectura, entrenamiento, capacidades generativas) se adaptan para describir las características de la API subyacente. Toda la información disponible proviene de la model card y de la documentación pública de Brave Search.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (API de búsqueda web, sin pesos) |
| Parametros totales | No aplica |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | No disponibles (depende de la API de Brave Search) |
| Licencia | No disponible |
| Formato de pesos | No aplica (no hay pesos) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento, ya que este identificador representa un servicio externo de búsqueda. La API de Brave Search utiliza un índice web propio y algoritmos de ranking propietarios, pero los detalles técnicos internos no se han publicado en la información proporcionada. El stub simplemente define la configuración de consulta (`count=10`, `result_filter=web`) y el endpoint REST que se invoca durante la evaluación del benchmark.

## Capacidades

- **Búsqueda web**: recupera resultados de páginas web a partir de una consulta de texto, devolviendo un conjunto de resultados con títulos, URLs y fragmentos.
- **Filtrado por tipo de resultado**: la configuración `result_filter=web` limita los resultados exclusivamente a páginas web, excluyendo noticias, imágenes, vídeos u otros tipos.
- **Número de resultados configurable**: el parámetro `count=10` fija el número máximo de resultados devueltos por consulta.
- **Integración como herramienta**: puede ser utilizada por agentes de IA o pipelines de recuperación como una herramienta externa de búsqueda, siguiendo el protocolo de la API de Brave.
- **Sin capacidades generativas**: no genera texto, código ni respuestas; solo devuelve resultados de búsqueda estructurados.

## Casos de uso

- **Evaluación de sistemas de recuperación**: investigadores pueden incluir esta API como referencia en benchmarks de búsqueda web, comparando la calidad de sus resultados frente a otros proveedores o modelos generativos con acceso a búsqueda.
- **Construcción de agentes con búsqueda en vivo**: desarrolladores de agentes de IA pueden integrar la API de Brave Search como herramienta de recuperación de información actualizada, usando el stub como referencia de configuración.
- **Pruebas de pipelines de RAG**: en sistemas de generación aumentada por recuperación, esta API puede servir como fuente de documentos externos, y el stub permite reproducir experimentos con una configuración fija.
- **Monitorización de cambios en resultados de búsqueda**: al fijar `count=10` y `result_filter=web`, se puede auditar periódicamente la estabilidad y relevancia de los resultados de Brave Search para consultas específicas.
- **Comparativa de APIs de búsqueda**: el stub facilita la creación de tablas comparativas entre Brave Search y otras APIs (p. ej., Bing, Google Custom Search) en términos de precisión, latencia y cobertura.
- **Investigación sobre sesgos en buscadores**: al ser un punto de acceso estandarizado, permite estudiar cómo varían los resultados según la consulta, la región o el tiempo, contribuyendo a análisis de sesgo algorítmico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este stub no tiene métricas propias de rendimiento de modelos; su función es servir como participante en el leaderboard del benchmark `OB-News-Websearch`, donde se evalúa la calidad de los resultados de búsqueda. Los datos de rendimiento (precisión, recall, etc.) dependerán de las evaluaciones realizadas por OpenBenchmarks y no se incluyen en la model card.

## Requisitos de hardware

No aplica. Al ser una API externa, no requiere hardware local para su ejecución. El consumo de recursos se limita a las llamadas HTTP realizadas desde el entorno de evaluación. Para usarla en producción, solo se necesita acceso a internet y una clave de API de Brave Search. No hay requisitos de GPU, VRAM ni despliegue local.

## Comparativa con modelos similares

Dado que no es un modelo de lenguaje, la comparativa debe establecerse con otras APIs de búsqueda web que podrían aparecer en el mismo leaderboard. No se dispone de datos de rendimiento comparativos en la información proporcionada, por lo que la comparación se limita a características generales:

| Proveedor | Tipo | Configuración típica | Licencia | Disponibilidad |
|---|---|---|---|---|
| Brave Search (este stub) | API de búsqueda | `count=10`, `result_filter=web` | No disponible | API pública con clave |
| Bing Web Search API | API de búsqueda | Parámetros configurables | Comercial | API de pago |
| Google Custom Search JSON API | API de búsqueda | Parámetros configurables | Comercial | API de pago |
| Serper.dev (Google Search API) | API de búsqueda | Parámetros configurables | Comercial | API de pago |

No se dispone de información sobre otros stubs similares en el mismo benchmark, por lo que la comparativa se limita a proveedores conocidos.

## Limitaciones y advertencias

- **No es un modelo de IA**: cualquier uso que asuma capacidades generativas o de razonamiento es incorrecto; solo proporciona resultados de búsqueda.
- **Dependencia de un servicio externo**: la disponibilidad, latencia y calidad de los resultados dependen de Brave Search, no de este stub.
- **Configuración fija**: el número de resultados y el filtro están fijados en `count=10` y `result_filter=web`; no se pueden modificar sin cambiar el stub.
- **Sin datos de rendimiento**: no hay métricas publicadas de precisión, recall o latencia en la model card.
- **Licencia no especificada**: no se indica bajo qué términos se distribuye este stub ni si el uso de la API de Brave Search tiene restricciones comerciales.
- **Idiomas no definidos**: la cobertura de idiomas depende de la API de Brave Search y no se documenta en este stub.
- **Riesgo de resultados no relevantes**: como cualquier buscador, puede devolver resultados sesgados, desactualizados o irrelevantes para consultas ambiguas.

## Enlaces

- HuggingFace: https://huggingface.co/openbenchmarks/brave-web
- Documentación de la API de Brave Search: https://api-dashboard.search.brave.com/documentation/services/web-search
- Página de estado del servicio de Brave Search: https://brave.com/search/api/
- Benchmark OB-News-Websearch (dataset): https://huggingface.co/datasets/openbenchmarks/OB-News-Websearch
- Sitio de OpenBenchmarks: https://openbenchmarks.com/

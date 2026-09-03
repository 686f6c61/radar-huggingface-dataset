# openbenchmarks/seltz-news

## Resumen

Seltz (scope=news) es un identificador publicado en HuggingFace por el usuario openbenchmarks que, en realidad, no contiene un modelo de inteligencia artificial con pesos, sino un *stub* o marcador de posición para que una API de búsqueda web de noticias pueda aparecer en el leaderboard oficial del benchmark OB News Websearch. La propia model card lo declara explícitamente: "Stub model card so this search API can appear on the OB News Websearch Official Benchmark leaderboard. There are no weights here."

Se trata, por tanto, de una API de búsqueda de noticias en tiempo real, orientada a sistemas de IA como agentes autónomos, pipelines RAG o aplicaciones de LLM que necesitan acceso a información web actualizada. El servicio es ofrecido por la empresa Seltz, que documenta un endpoint `POST /v1/search` con configuración `scope=news`. No hay arquitectura de modelo, parámetros ni contexto que describir, ya que no existe un modelo subyacente en este repositorio.

La relevancia de esta entrada radica en su papel dentro del ecosistema de evaluación de proveedores de búsqueda para IA, no como un modelo generativo. Para desarrolladores que buscan un LLM, esta ficha no aplica; para quienes evalúan APIs de búsqueda, puede servir como referencia de un proveedor concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo con pesos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no hay pesos) |

Datos adicionales conocidos de la API:

| Parametro | Valor |
|---|---|
| Tipo de recurso | API de búsqueda web (search API) |
| Endpoint | `POST /v1/search` |
| Configuracion | `scope=news` |
| Documentacion | https://docs.seltz.ai/ |
| Leaderboard | https://seltz.ai |

## Arquitectura y entrenamiento

No existe una arquitectura de modelo que describir, ya que este repositorio no contiene pesos ni código de un modelo de lenguaje. Se trata de una API de búsqueda de noticias ofrecida por Seltz, que internamente puede utilizar algoritmos de indexación y recuperación de información, pero no se proporcionan detalles técnicos sobre su implementación. Tampoco hay información sobre datos de entrenamiento, técnicas de RLHF o innovaciones en arquitectura, porque no es un modelo generativo.

## Capacidades

- Búsqueda de noticias en tiempo real: la API permite consultar un índice de noticias con la configuración `scope=news`.
- Integración con agentes de IA: diseñada para ser consumida por sistemas LLM, RAG y agentes autónomos que necesitan información web actualizada.
- Respuesta estructurada: el endpoint devuelve resultados en un formato JSON (presumiblemente), aunque no se especifican los campos exactos en la información disponible.
- Parámetro de modelo: la documentación menciona un parámetro `model` que selecciona el nivel de trabajo que Seltz realiza para responder, con valores como `seltz-base` por defecto, aunque no se detallan las diferencias.
- No es un modelo de lenguaje: no genera texto, no razona, no ejecuta código ni tiene capacidades de visión o audio.

## Casos de uso

- Agentes de IA que necesitan consultar noticias recientes: un agente puede llamar a la API para obtener titulares o artículos sobre un tema concreto antes de generar una respuesta.
- Pipelines RAG con información actualizada: integrar la API como fuente de recuperación en un sistema de generación aumentada por recuperación, permitiendo que el LLM cite noticias frescas.
- Monitorización de empresas: dado el tag `company-news`, la API puede usarse para seguir novedades de compañías específicas, alimentando alertas o resúmenes automáticos.
- Verificación de hechos en tiempo real: un sistema de fact-checking puede consultar la API para contrastar afirmaciones con noticias recientes.
- Búsqueda vertical en aplicaciones de noticias: desarrollar un buscador especializado en prensa, con filtros por fecha o relevancia, usando la API como backend.
- Evaluación comparativa de proveedores de búsqueda: el benchmark OB News Websearch utiliza esta API como uno de los candidatos, por lo que los investigadores pueden comparar su rendimiento frente a otros buscadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la API participa en el leaderboard del benchmark OB News Websearch, pero no se incluyen métricas concretas (precisión, recall, latencia, etc.) en los datos proporcionados.

## Requisitos de hardware

- No aplica: al ser una API externa, el usuario no necesita gestionar hardware para su uso.
- El consumo de recursos se limita a las llamadas HTTP desde el cliente (por ejemplo, un servidor de aplicaciones o un agente).
- No se requiere GPU ni VRAM.
- El despliegue se realiza mediante peticiones a `https://docs.seltz.ai/` (endpoint `POST /v1/search`), sin necesidad de instalar vLLM, llama.cpp u otras herramientas de inferencia local.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre otros proveedores de búsqueda de noticias comparables en términos de rendimiento, precio o características. La entrada en HuggingFace es un stub, y la documentación de Seltz no ofrece tablas comparativas.

## Limitaciones y advertencias

- No es un modelo de IA: este repositorio no contiene pesos ni un modelo ejecutable; es solo un marcador para un leaderboard.
- Dependencia de un servicio externo: el uso de la API requiere conexión a internet y está sujeto a la disponibilidad y políticas de Seltz.
- Licencia desconocida: no se especifica la licencia de uso de la API ni las condiciones comerciales.
- Sin datos de rendimiento: no hay métricas publicadas que permitan evaluar la calidad de las búsquedas.
- Fecha de creación futura: el registro indica una fecha de creación en 2026, lo que sugiere que el proyecto puede estar en fase temprana o que la fecha es incorrecta.
- Riesgo de alucinación: al ser una API de búsqueda, no genera contenido, pero los resultados pueden ser incompletos o sesgados según el índice de noticias.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/openbenchmarks/seltz-news
- Sitio oficial de Seltz: https://seltz.ai/
- Documentación de la API: https://docs.seltz.ai/
- Blog sobre el benchmark de búsqueda de noticias: https://seltz.ai/blog/seltz-news-benchmark
- Repositorio de benchmark en GitHub: https://github.com/openbenchmarks-labs/factual-lookup-company-news-search
- Dataset del benchmark: https://huggingface.co/datasets/openbenchmarks/OB-News-Websearch

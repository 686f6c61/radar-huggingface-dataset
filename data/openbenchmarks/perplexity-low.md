# openbenchmarks/perplexity-low

## Resumen

Perplexity (search_context_size=low) es un stub de model card publicado en HuggingFace por el equipo de OpenBenchmarks. No contiene pesos de modelo, sino que representa un endpoint de la API de búsqueda de Perplexity para que pueda aparecer en el leaderboard oficial del benchmark OB News Websearch. Su propósito es permitir la evaluación comparativa de capacidades de búsqueda web en tiempo real, no la generación de texto.

El modelo se enmarca en la categoría de "web search" y utiliza una configuración específica de contexto de búsqueda (`search_context_size=low`). Es relevante porque permite a desarrolladores e investigadores comparar la calidad de respuestas basadas en búsqueda web de Perplexity frente a otros sistemas en un benchmark estandarizado, sin necesidad de desplegar infraestructura local.

Al tratarse de un stub, no hay arquitectura, parámetros ni pesos disponibles. La ficha se centra en las capacidades del endpoint de búsqueda y su integración en el ecosistema de evaluación de OpenBenchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (stub de API, sin pesos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (endpoint API) |

## Arquitectura y entrenamiento

No aplica. Este repositorio no contiene un modelo entrenado, sino un stub de model card que referencia un endpoint de la API de búsqueda de Perplexity. La documentación oficial apunta a `POST /search` con la configuración `search_context_size=low`. No hay información sobre arquitectura, datos de entrenamiento ni innovaciones técnicas, ya que el servicio subyacente es propietario y no se detalla en la model card.

## Capacidades

- Búsqueda web en tiempo real a través de la API de Perplexity.
- Configuración de contexto de búsqueda limitada (`low`), que afecta a la cantidad de información recuperada por consulta.
- Integración con el benchmark OB News Websearch para evaluación estandarizada.
- Endpoint REST documentado en https://docs.perplexity.ai/api-reference/search-post.
- No incluye generación de texto, tool calling, agentes, visión ni otras capacidades de modelos de lenguaje.

## Casos de uso

- Evaluación comparativa de sistemas de búsqueda web: el endpoint puede utilizarse como referencia en el leaderboard de OB News Websearch para medir la calidad de respuestas basadas en búsqueda frente a otros modelos o APIs.
- Prototipado rápido de aplicaciones que requieran búsqueda web: los desarrolladores pueden integrar el endpoint en aplicaciones de prueba sin necesidad de entrenar o alojar un modelo propio.
- Monitorización de la calidad de búsqueda de Perplexity: permite verificar de forma periódica si el servicio mantiene un nivel de precisión adecuado para un caso de uso concreto.
- Investigación académica sobre recuperación de información: el benchmark proporciona un entorno controlado para estudiar el comportamiento de sistemas de búsqueda en dominios de noticias.
- Comparación de configuraciones de contexto: al existir variantes con distinto `search_context_size`, se puede analizar cómo afecta el tamaño del contexto a la calidad de las respuestas.
- Validación de pipelines de integración: sirve como punto de prueba para verificar que una aplicación consume correctamente la API de Perplexity antes de pasar a producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el stub existe para que el endpoint aparezca en el leaderboard oficial de OB News Websearch, pero no se proporcionan puntuaciones ni comparativas.

## Requisitos de hardware

- No requiere hardware local: al ser un endpoint de API, la inferencia se realiza en los servidores de Perplexity.
- Necesita conexión a internet y una clave de API válida para realizar peticiones.
- El rendimiento depende de la latencia del servicio externo y del plan de suscripción contratado.
- No aplica despliegue local con vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

No disponible. Al tratarse de un stub de API sin pesos, no es comparable directamente con modelos de lenguaje tradicionales. Podría compararse con otros servicios de búsqueda web como Google Custom Search JSON API o Bing Web Search API, pero no se dispone de datos de rendimiento en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo descargable: no hay pesos, por lo que no puede ejecutarse localmente ni fine-tuning.
- Dependencia de un servicio externo: la disponibilidad y latencia dependen de Perplexity, no del usuario.
- Configuración de contexto limitada: el valor `low` puede restringir la cantidad de información recuperada, afectando a la exhaustividad de las respuestas.
- Coste asociado: el uso de la API puede generar costes según el plan contratado.
- Sin garantías de rendimiento: al ser un stub, no hay datos de calidad ni benchmarks publicados.
- Restricciones de uso: la licencia y términos de servicio de Perplexity se aplican al endpoint, no se detallan en la model card.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/openbenchmarks/perplexity-low
- Documentación de la API de Perplexity: https://docs.perplexity.ai/api-reference/search-post
- Benchmark OB News Websearch: https://huggingface.co/datasets/openbenchmarks/OB-News-Websearch
- Servicio en vivo de Perplexity: https://www.perplexity.ai

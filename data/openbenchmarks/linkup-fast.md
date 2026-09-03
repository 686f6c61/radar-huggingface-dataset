# openbenchmarks/linkup-fast

## Resumen

Este repositorio de Hugging Face, identificado como `openbenchmarks/linkup-fast`, no contiene un modelo de inteligencia artificial con pesos, sino un *stub* de model card creado por el equipo de OpenBenchmarks para que la API de búsqueda web de Linkup pueda aparecer en el leaderboard oficial del benchmark OB News Websearch. Se trata de una entrada de metadatos que referencia un endpoint de búsqueda con una configuración concreta (`depth=fast` y `outputType=searchResults`), sin ningún artefacto descargable.

La relevancia de esta entrada radica en que documenta la participación de un proveedor de búsqueda web en un benchmark independiente y verificable, orientado a decisiones de compra frente a alternativas de construcción interna. Al no existir pesos, arquitectura ni parámetros, esta ficha se centra en describir la naturaleza del recurso, sus capacidades como API y los resultados publicados por el proveedor en sus propios benchmarks.

Es importante señalar que, aunque el identificador sugiere un modelo, se trata de una API propietaria de búsqueda web. Toda la información técnica sobre arquitectura, entrenamiento o cuantización no está disponible, y así se indica en las secciones correspondientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (API de búsqueda web, sin modelo de pesos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no hay pesos) |

## Arquitectura y entrenamiento

No se dispone de información sobre arquitectura, datos de entrenamiento o técnicas de optimización, ya que este repositorio no contiene un modelo entrenado. Se trata de un *stub* de model card que referencia una API de búsqueda web externa, operada por Linkup. La configuración indicada (`depth=fast`, `outputType=searchResults`) sugiere que la API devuelve resultados de búsqueda en formato estructurado, pero los detalles internos del motor de búsqueda, su indexación o sus algoritmos de ranking no son públicos en esta fuente.

El único dato técnico disponible es el endpoint documentado: `POST /v1/search`, con los parámetros de configuración mencionados. No hay información sobre el volumen de datos indexados, la latencia interna o los mecanismos de recuperación.

## Capacidades

- Búsqueda web en tiempo real: la API permite realizar consultas de búsqueda y obtener resultados en formato `searchResults`, adecuado para integrarse en sistemas de recuperación aumentada (RAG).
- Configuración de profundidad: el parámetro `depth=fast` indica un modo de búsqueda rápida, presumiblemente con menor latencia a costa de exhaustividad.
- Integración con benchmarks: la API está diseñada para ser evaluada en el benchmark OB News Websearch, lo que implica que puede procesar consultas sobre noticias de empresas y devolver resultados relevantes.
- No se documentan capacidades de generación de texto, razonamiento, tool calling, visión o audio, ya que no es un modelo generativo.

## Casos de uso

- Recuperación de noticias corporativas: la API puede utilizarse para obtener noticias recientes sobre empresas concretas, útil para sistemas de monitorización de prensa o análisis de sentimiento.
- Aumento de conocimiento en asistentes conversacionales: un sistema de IA generativa puede consultar esta API para obtener información actualizada antes de responder, reduciendo la dependencia de datos de entrenamiento desactualizados.
- Verificación de hechos: al devolver resultados de búsqueda, puede emplearse como fuente de evidencia en pipelines de verificación automática de afirmaciones.
- Investigación de mercado: consultas sobre tendencias, productos o competidores pueden alimentar informes automatizados.
- Automatización de alertas: combinada con un sistema de reglas, puede generar alertas cuando aparecen noticias relevantes sobre un tema o empresa.
- Evaluación comparativa de proveedores de búsqueda: al estar integrada en un benchmark abierto, sirve como referencia para comparar el rendimiento de distintas APIs de búsqueda en tareas de recuperación factual.

## Benchmarks y rendimiento

Según la información publicada por Linkup en su sitio web, la API de búsqueda de Linkup alcanza un 90,10% en el benchmark SimpleQA de OpenAI, superando a modelos tradicionales como Grok 3 y a soluciones conectadas a web como Perplexity. También se menciona liderazgo en SealQA-0 y en resultados de precisión para dominios GTM, Legal y Finanzas. Sin embargo, estos datos corresponden a la API general de Linkup, no específicamente a la configuración `depth=fast` documentada en este repositorio. No se han publicado resultados desglosados por configuración en la información disponible.

| Benchmark | Resultado (API Linkup general) |
|---|---|
| SimpleQA (OpenAI) | 90,10% |
| SealQA-0 | Lidera (dato no cuantificado) |
| Precisión GTM, Legal, Finanzas | Lidera (datos no cuantificados) |

No se dispone de resultados específicos para la configuración `depth=fast` ni de comparativas con otras APIs en el contexto de este repositorio.

## Requisitos de hardware

No aplica, ya que no existe un modelo local que ejecutar. La API se consume de forma remota mediante peticiones HTTP. Los requisitos de hardware se limitan al cliente que realiza las llamadas, que puede ser cualquier servidor con acceso a internet. No se requiere GPU ni VRAM. Para despliegues en producción, se recomienda un servidor con capacidad para manejar el volumen de peticiones esperado, pero no hay especificaciones concretas disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos o APIs de búsqueda en términos de parámetros, contexto o rendimiento. La entrada no proporciona datos técnicos comparables. Se puede mencionar que, según los benchmarks publicados por Linkup, su API supera a Perplexity en SimpleQA, pero no hay datos verificables de otras configuraciones o proveedores en esta fuente.

## Limitaciones y advertencias

- No es un modelo de IA con pesos: no se puede descargar, ejecutar localmente ni fine-tunear. Es una API propietaria.
- La licencia no está especificada en el repositorio, por lo que se desconoce si su uso comercial está permitido o restringido.
- Los resultados de búsqueda dependen de la calidad del índice de Linkup y de su política de actualización; no hay garantía de cobertura completa o actualidad.
- El modo `depth=fast` puede sacrificar exhaustividad en favor de latencia, lo que podría afectar a la calidad de los resultados en consultas complejas.
- No se han publicado detalles sobre sesgos, alucinaciones o limitaciones idiomáticas, ya que no es un modelo generativo.
- La dependencia de un servicio externo introduce riesgos de disponibilidad, coste y privacidad de los datos enviados en las consultas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/openbenchmarks/linkup-fast
- Documentación de la API de Linkup: https://docs.linkup.so/pages/documentation/endpoints/search/overview
- Benchmarks de Linkup: https://www.linkup.so/benchmarks
- Blog de Linkup sobre SOTA en SimpleQA: https://www.linkup.so/blog/linkup-establishes-sota-performance-on-simpleqa
- Sitio de OpenBenchmarks: https://openbenchmarks.com/
- Repositorio GitHub del benchmark de noticias: https://github.com/openbenchmarks-labs/factual-lookup-company-news-search/blob/main/data/websearch-runs/company-news-public-119/news-nyb-product/linkup_fast.json
- Leaderboard general de modelos (septiembre 2026): https://benchlm.ai/

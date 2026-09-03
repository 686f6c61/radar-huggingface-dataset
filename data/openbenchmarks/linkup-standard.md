# openbenchmarks/linkup-standard

## Resumen

Linkup Standard es un servicio de búsqueda web con respuestas generadas por IA, desarrollado por Linkup y publicado en Hugging Face bajo el identificador `openbenchmarks/linkup-standard`. No se trata de un modelo de lenguaje con pesos descargables, sino de un punto de acceso a una API de búsqueda que combina recuperación de información en tiempo real con síntesis de respuestas detalladas. Su presencia en Hugging Face responde a la necesidad de incluirlo en el leaderboard oficial del benchmark OB News Websearch, no a la distribución de un modelo.

El servicio se configura con los parámetros `depth=standard` y `outputType=searchResults`, lo que indica que devuelve resultados de búsqueda estructurados en lugar de una respuesta conversacional libre. Según la documentación de EmpirioLabs y Poe, Linkup Standard es más rápido que su variante Deep Search y afirma ocupar la primera posición en el benchmark SimpleQA de OpenAI en cuanto a exactitud factual. La ventana de contexto declarada en Poe es de 100.000 tokens, aunque este dato no está confirmado en la documentación oficial de Linkup.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (servicio de búsqueda web propietario, sin pesos publicados) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 100.000 tokens (según Poe, no confirmado oficialmente) |
| Tipos de cuantizacion | no aplica (servicio API, sin pesos locales) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no aplica (API REST, sin archivos de pesos) |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo que subyace a Linkup Standard. Al tratarse de un servicio de búsqueda web, es probable que combine un motor de recuperación de documentos con un modelo de lenguaje para sintetizar respuestas, pero los detalles técnicos (tipo de transformer, uso de MoE, datos de entrenamiento, técnicas de alineación como RLHF o DPO) no han sido publicados. La documentación oficial se limita a describir el endpoint `POST /v1/search` y los parámetros de configuración, sin revelar el modelo subyacente ni el proceso de entrenamiento.

## Capacidades

- Búsqueda web en tiempo real con síntesis de respuestas detalladas y citadas.
- Generación de resúmenes y overviews a partir de resultados de búsqueda.
- Mayor velocidad de respuesta que la variante Deep Search del mismo proveedor.
- Exactitud factual destacada: según fuentes de terceros, ocupa la primera posición en el benchmark SimpleQA de OpenAI.
- Integración mediante API REST, lo que permite su uso en pipelines automatizados.
- Soporte de contexto largo (100.000 tokens según Poe), útil para consultas con múltiples documentos o historial extenso.

## Casos de uso

- Monitorización de noticias empresariales: el servicio puede consultar fuentes web en tiempo real y resumir novedades de una empresa, útil para equipos de inteligencia competitiva o relaciones con inversores.
- Verificación de hechos y datos factuales: gracias a su rendimiento en SimpleQA, puede emplearse como herramienta de comprobación de afirmaciones en artículos periodísticos o informes técnicos.
- Asistentes de investigación académica: permite recopilar y sintetizar información de múltiples fuentes web sobre un tema concreto, acelerando la revisión bibliográfica preliminar.
- Automatización de informes de mercado: integrado en un pipeline de datos, puede generar resúmenes diarios de noticias sectoriales con citas a las fuentes originales.
- Chatbots con acceso a información actualizada: al ser una API de búsqueda, puede conectarse a un modelo conversacional para proporcionar respuestas con datos recientes sin necesidad de reentrenar el modelo.
- Análisis de sentimiento y tendencias: consultando resultados de búsqueda sobre una marca o producto, se pueden extraer patrones de opinión pública y tendencias emergentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Fuentes de terceros (EmpirioLabs y Poe) afirman que Linkup Standard ocupa la primera posición en el benchmark SimpleQA de OpenAI, pero no se proporcionan cifras numéricas concretas ni comparaciones con otros sistemas. Tampoco hay datos públicos sobre latencia, throughput o tasas de error en el servicio.

## Requisitos de hardware

- No aplica: Linkup Standard es un servicio alojado en la nube, accesible mediante API REST. No requiere hardware local para su uso.
- El consumo de recursos se limita a las llamadas HTTP desde el cliente, por lo que cualquier máquina con conexión a internet puede utilizarlo.
- Para integraciones en producción, se recomienda un servidor con capacidad para manejar las respuestas JSON y gestionar la concurrencia de peticiones, aunque esto depende del volumen de uso.
- No existen opciones de despliegue local (vLLM, llama.cpp, Ollama, TGI) porque no se distribuyen pesos del modelo.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos o servicios de búsqueda. La única referencia directa es la variante Deep Search del propio Linkup, que según la documentación es más lenta pero posiblemente más exhaustiva. Otros servicios de búsqueda con IA como Perplexity o You.com podrían considerarse comparables, pero no hay datos públicos que permitan una comparación objetiva en términos de rendimiento, latencia o exactitud.

| Servicio | Tipo | Contexto | Exactitud (SimpleQA) | Licencia |
|---|---|---|---|---|
| Linkup Standard | API de búsqueda | 100k (según Poe) | #1 (según terceros) | no disponible |
| Linkup Deep Search | API de búsqueda | no disponible | no disponible | no disponible |
| Perplexity API | API de búsqueda | no disponible | no disponible | propietaria |

## Limitaciones y advertencias

- No es un modelo de lenguaje descargable: no se pueden ejecutar inferencias locales ni adaptar los pesos a casos de uso específicos.
- Dependencia total de la API: cualquier interrupción del servicio o cambio en los términos de uso afecta directamente a las aplicaciones que lo integran.
- Información sobre arquitectura y entrenamiento no disponible: no es posible auditar el modelo subyacente ni evaluar sus sesgos internos.
- Licencia no especificada: se desconoce si el uso comercial está permitido o si existen restricciones de atribución o volumen de peticiones.
- Riesgo de alucinaciones inherente a cualquier sistema de generación de lenguaje: aunque se afirma una alta exactitud factual, no hay garantías de que todas las respuestas sean correctas.
- El dato de contexto de 100.000 tokens proviene de una fuente de terceros (Poe) y no está confirmado en la documentación oficial de Linkup.

## Enlaces

- Hugging Face: https://huggingface.co/openbenchmarks/linkup-standard
- Documentación oficial de Linkup: https://docs.linkup.so/pages/documentation/endpoints/search/overview
- Panel en vivo de Linkup: https://www.linkup.so
- Ficha en EmpirioLabs: https://docs.empiriolabs.ai/models/linkup-standard
- Página de EmpirioLabs con pricing y playground: https://empiriolabs.ai/models/linkup-standard
- Página en Poe: https://poe.com/Linkup-Standard

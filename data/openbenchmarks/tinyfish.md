# openbenchmarks/tinyfish

## Resumen

TinyFish es un servicio de infraestructura web para agentes de inteligencia artificial, presentado en Hugging Face bajo el identificador `openbenchmarks/tinyfish`. No se trata de un modelo de lenguaje con pesos, sino de una API de búsqueda web, fetch y automatización de navegación, diseñada para que agentes de IA puedan acceder a información en tiempo real y ejecutar flujos de trabajo web de forma programática. La model card publicada es un stub creado para que el servicio aparezca en el leaderboard oficial del benchmark OB News Websearch de OpenBenchmarks, y no contiene ningún artefacto de modelo.

El servicio ofrece un endpoint REST (`GET api.search.tinyfish.ai`) con un límite gratuito de 30 peticiones por minuto. Según la documentación oficial, TinyFish permite ejecutar búsquedas, extraer datos de sitios web y operar como un agente web completo, con arquitectura serverless y orientación empresarial. Su relevancia actual radica en la creciente demanda de herramientas de búsqueda y navegación web fiables para agentes autónomos, donde la latencia y el coste por respuesta correcta son factores críticos. Aunque no hay información pública sobre arquitectura interna, parámetros o entrenamiento, el servicio se posiciona como una alternativa a otras APIs de búsqueda como Tavily, Exa o Firecrawl.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (servicio API, sin pesos de modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no aplica (API sin pesos) |
| Tipo de servicio | API de búsqueda web, fetch y agente web |
| Endpoint | `GET api.search.tinyfish.ai` |
| Límite de uso | 30 peticiones por minuto (plan gratuito) |
| Despliegue | serverless, en la nube |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del servicio. TinyFish no es un modelo de lenguaje entrenado, sino una infraestructura de software que probablemente combina motores de búsqueda, rastreadores web y posiblemente modelos de IA para interpretar y ejecutar tareas de navegación. No hay datos públicos sobre el entrenamiento de ningún componente, ni sobre el volumen de datos utilizado. La documentación oficial se centra en las capacidades funcionales y en los benchmarks comparativos, no en detalles técnicos de implementación.

## Capacidades

- Búsqueda web en tiempo real: permite consultar información actualizada de internet mediante una API REST.
- Fetch de páginas web: recupera el contenido de URLs específicas, probablemente con procesamiento para extraer texto relevante.
- Agente web automatizado: puede navegar por sitios web, autenticarse, extraer datos estructurados y ejecutar flujos de trabajo complejos.
- Integración con agentes de IA: diseñado para ser utilizado como herramienta externa por modelos de lenguaje, con soporte para llamadas a funciones.
- Comparación con otras APIs: según su web, se evalúa frente a Tavily, Exa, Firecrawl, Parallel, OpenAI Operator, Gemini y Claude en precisión y finalización de tareas.
- Coste optimizado: se destaca su liderazgo en "coste por respuesta correcta" en benchmarks de noticias empresariales, lo que sugiere eficiencia económica.

## Casos de uso

- Agentes de atención al cliente: un agente conversacional puede usar TinyFish para buscar información actualizada de productos, políticas o incidencias en tiempo real, respondiendo con datos verificados.
- Investigación de mercado: automatizar la extracción de noticias, precios o reseñas de múltiples sitios web para generar informes periódicos sin intervención manual.
- Monitorización de competencia: programar consultas periódicas a sitios de competidores para detectar cambios en precios, lanzamientos o contenido.
- Automatización de procesos de negocio: extraer datos de portales internos o externos que requieren autenticación, como paneles de administración o sistemas de gestión.
- Generación de contenido con fuentes: un modelo de lenguaje puede usar TinyFish para citar fuentes actuales y enlazar a artículos relevantes en artículos o informes.
- Verificación de hechos: agentes de fact-checking pueden consultar múltiples fuentes web para contrastar afirmaciones y devolver resultados con referencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La web oficial de TinyFish menciona una página de benchmarks comparativos con otras APIs, pero no se proporcionan valores numéricos concretos en los resultados de búsqueda. Se indica que lideró en "coste por respuesta correcta" en el benchmark de noticias de empresas de OpenBenchmarks, pero sin cifras específicas. Por tanto, no es posible presentar una tabla de rendimiento verificable.

## Requisitos de hardware

- No requiere hardware local: al ser un servicio API en la nube, el usuario solo necesita realizar peticiones HTTP.
- No hay requisitos de VRAM ni GPU: la inferencia y el procesamiento ocurren en los servidores de TinyFish.
- Compatible con cualquier lenguaje que soporte HTTP: Python, JavaScript, Go, etc.
- Para integración con modelos de lenguaje, se recomienda usar frameworks como LangChain o llamadas a funciones nativas de modelos como GPT o Claude.
- La latencia depende de la red y de la carga del servicio; no se dispone de datos de throughput.

## Comparativa con modelos similares

No se dispone de datos cuantitativos para una comparación rigurosa. TinyFish compite con otras APIs de búsqueda web para agentes, como Tavily, Exa, Firecrawl y Parallel. Según la información de su web, se evalúa frente a estas y también contra agentes de OpenAI y Gemini, pero no se publican los resultados numéricos en los materiales disponibles. La comparación cualitativa indica que TinyFish se enfoca en coste por respuesta correcta y en automatización de flujos web complejos, mientras que otras APIs pueden priorizar la velocidad o la cobertura. No hay datos de licencia ni de precios más allá del límite gratuito de 30 req/min.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no puede generar texto ni razonar por sí mismo; depende de un modelo externo que lo invoque.
- Límite de uso gratuito: 30 peticiones por minuto, insuficiente para aplicaciones de alto tráfico sin plan de pago.
- Dependencia de la disponibilidad del servicio: al ser una API externa, cualquier caída o cambio en el servicio afecta a las aplicaciones que lo usan.
- Sin información sobre sesgos o alucinaciones: al ser una herramienta de búsqueda, la calidad de los resultados depende de las fuentes web, que pueden contener información errónea o sesgada.
- Licencia no especificada: no se indica si el uso comercial está permitido o si hay restricciones.
- Sin datos de privacidad: no se detalla cómo se manejan los datos de las peticiones ni si se almacenan registros.
- Fecha de creación inusual: la model card está fechada en 2026, lo que podría indicar un error o un proyecto experimental.

## Enlaces

- Hugging Face: https://huggingface.co/openbenchmarks/tinyfish
- Sitio web oficial: https://www.tinyfish.ai/
- Página de benchmarks: https://www.tinyfish.ai/benchmarks
- Documentación de la API: https://docs.tinyfish.ai/search-api
- Benchmark OB News Websearch: https://huggingface.co/datasets/openbenchmarks/OB-News-Websearch
- OpenBenchmarks: https://openbenchmarks.com/

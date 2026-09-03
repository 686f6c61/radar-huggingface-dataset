# openbenchmarks/firecrawl

## Resumen

Firecrawl no es un modelo de inteligencia artificial, sino una API de búsqueda web y extracción de datos diseñada para que sistemas de IA (agentes, chatbots, pipelines de RAG) accedan a información del web en tiempo real. La model card publicada en HuggingFace es un "stub" creado por el equipo de OpenBenchmarks para que esta API aparezca en el leaderboard oficial de búsqueda web del benchmark OB News Websearch. No contiene pesos ni arquitectura de modelo alguno.

La relevancia de Firecrawl radica en que resuelve el problema de conectar modelos de lenguaje con contenido web vivo: búsqueda, scraping, renderizado de JavaScript, extracción estructurada e indexación. Su endpoint principal es `POST /v2/search` con configuración `default`, y se documenta en https://docs.firecrawl.dev/api-reference/endpoint/search. Aunque no es un modelo, compite en la misma categoría de herramientas que los modelos con capacidades de búsqueda integrada, por lo que esta ficha lo trata como un servicio de infraestructura para IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | API de búsqueda web (sin modelo de IA) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (no especificado) |
| Licencia | no disponible (servicio comercial) |
| Formato de pesos | no disponible (no hay pesos) |

## Arquitectura y entrenamiento

Al no ser un modelo de lenguaje, no existe arquitectura neuronal ni proceso de entrenamiento. Firecrawl se compone de una infraestructura de backend que incluye un rastreador web, un motor de renderizado (para páginas con JavaScript), un sistema de extracción de datos (convierte HTML en Markdown o JSON) y un índice de búsqueda. La documentación oficial describe estos componentes como una capa de "infraestructura profunda de datos web" que permite a los agentes de IA buscar, leer y actuar sobre el contenido en línea.

No hay información pública sobre el entrenamiento de modelos internos, ya que la empresa no ha revelado si utiliza algún modelo de lenguaje para la extracción semántica. La API se consume mediante peticiones HTTP y devuelve resultados estructurados, sin que el usuario necesite gestionar hardware ni pesos.

## Capacidades

- Búsqueda web en tiempo real con endpoint `POST /v2/search`.
- Scraping de páginas individuales con extracción de contenido limpio (Markdown, HTML, JSON).
- Renderizado de JavaScript para sitios dinámicos.
- Extracción estructurada de datos (tablas, listas, campos específicos).
- Indexación de contenido para búsquedas posteriores.
- Integración con agentes de IA mediante API REST.
- Soporte para búsqueda en dominios específicos o con filtros personalizados.
- Capacidad de interactuar con páginas (rellenar formularios, hacer clic) según la documentación.

## Casos de uso

- **Monitoreo de noticias empresariales**: un agente de IA puede consultar Firecrawl periódicamente para buscar noticias recientes sobre una empresa, extraer el contenido relevante y resumirlo. La API devuelve resultados frescos y estructurados, lo que facilita el pipeline de resumen automático.
- **Investigación de mercado**: equipos de producto pueden usar Firecrawl para recopilar precios, reseñas y especificaciones de competidores desde múltiples sitios web, sin necesidad de mantener scrapers propios frágiles.
- **Generación de informes con RAG**: un sistema de generación aumentada por recuperación puede usar Firecrawl como herramienta de búsqueda para obtener documentos actualizados y pasarlos al modelo de lenguaje para responder preguntas con fuentes verificables.
- **Automatización de atención al cliente**: un chatbot puede buscar en la documentación oficial de un producto, extraer pasos de solución de problemas y responder al usuario con instrucciones precisas, todo en tiempo real.
- **Análisis de sentimiento en redes sociales**: aunque no es específico de redes, Firecrawl puede extraer comentarios y publicaciones de foros o sitios de reseñas, que luego un modelo de IA clasifica por sentimiento.
- **Verificación de hechos**: un asistente de verificación puede buscar afirmaciones en múltiples fuentes web, extraer los pasajes relevantes y compararlos con la afirmación original, reduciendo el riesgo de alucinación al citar fuentes reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La página https://www.firecrawl.dev/benchmarks menciona "Open Retrieval Evaluations" con metodología reproducible, pero no se incluyen números concretos en los datos proporcionados. El leaderboard de OpenBenchmarks (https://huggingface.co/datasets/openbenchmarks/OB-News-Websearch) es el lugar donde se publican las puntuaciones, pero no se dispone de los valores actuales.

## Requisitos de hardware

- No requiere hardware propio: es un servicio gestionado por API.
- El usuario solo necesita un cliente HTTP (curl, Python, etc.) y una clave de API.
- No hay requisitos de VRAM, GPU ni CPU específicos.
- El despliegue se limita a integrar la API en la aplicación existente.
- La latencia depende del servicio externo y de la complejidad de la página a procesar; no se dispone de cifras oficiales.

## Comparativa con modelos similares

Firecrawl compite con otras APIs de búsqueda y scraping orientadas a IA, no con modelos de lenguaje. La comparación se hace en términos de funcionalidad y modelo de negocio.

| Servicio | Tipo | Búsqueda | Scraping | Extracción | Precio |
|---|---|---|---|---|---|
| Firecrawl | API de búsqueda y scraping | Sí | Sí | Sí | Comercial (no disponible) |
| SerpAPI | API de resultados de Google | Sí | No | Parcial | Comercial |
| Tavily | API de búsqueda para IA | Sí | No | Sí | Comercial |
| ScraperAPI | API de scraping | No | Sí | Parcial | Comercial |

Firecrawl se diferencia por combinar búsqueda, scraping y extracción en una sola API, mientras que otros servicios suelen especializarse en una sola función. No hay datos públicos sobre precios ni límites de uso en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de IA: no puede generar texto ni razonar; solo recupera y estructura contenido web.
- Dependencia de un servicio externo: la disponibilidad y latencia dependen de Firecrawl, no del usuario.
- Costes asociados: al ser un servicio comercial, el uso intensivo puede generar facturación.
- Límites de uso: no se han publicado los límites de tasa ni cuotas en la información disponible.
- Posible bloqueo por parte de sitios web: aunque Firecrawl gestiona rotación de IPs y renderizado, algunos sitios pueden bloquear el acceso automatizado.
- Sin garantía de exactitud: el contenido extraído puede contener errores de parseo o información desactualizada.
- Licencia no especificada: no se indica si el uso comercial está restringido, aunque al ser un servicio de pago se asume que es para uso comercial.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/openbenchmarks/firecrawl
- Documentación de la API: https://docs.firecrawl.dev/api-reference/endpoint/search
- Página oficial: https://www.firecrawl.dev/
- Benchmarks de Firecrawl: https://www.firecrawl.dev/benchmarks
- Repositorio de GitHub: https://github.com/firecrawl/firecrawl
- Leaderboard de OpenBenchmarks: https://huggingface.co/datasets/openbenchmarks/OB-News-Websearch
- Sitio de OpenBenchmarks: https://openbenchmarks.com/

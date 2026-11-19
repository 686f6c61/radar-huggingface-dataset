# shephouse/shephouse-yt-mcp

## Resumen

`shephouse-yt-mcp` no es un modelo de lenguaje, sino un servidor MCP (Model Context Protocol) empaquetado y publicado en Hugging Face bajo el identificador `shephouse/shephouse-yt-mcp`. Su funcion es exponer herramientas de obtencion de transcripciones de YouTube a clientes compatibles con MCP como Claude Desktop, Cursor o Cline. El paquete esta desarrollado por ShepHouse, un negocio operado por agentes de IA segun declara el propio autor, y su codigo fuente es de aproximadamente 70 lineas con licencia MIT.

El problema que resuelve es concreto: las librerias habituales de transcripciones de YouTube (como `youtube-transcript-api`) y la mayoria de servidores MCP equivalentes acceden a YouTube directamente, lo que provoca errores `RequestBlocked` o `IpBlocked` cuando se ejecutan desde direcciones IP de proveedores cloud (AWS, GCP, Fly, Railway, entornos de CI). Este servidor delega la extraccion en un Actor de Apify (`shephouse/youtube-transcript-scraper-bulk`), de modo que funciona independientemente de donde se ejecute el agente.

Es relevante para desarrolladores que construyen pipelines de RAG sobre contenido de YouTube o asistentes que necesitan consultar transcripciones de video de forma programatica desde infraestructura cloud. No incluye pesos, arquitectura de red neuronal ni parametros: es una herramienta de integracion, no un modelo generativo. El coste se factura a la cuenta de Apify del usuario (0,0025 USD por transcripcion entregada, sin cargo por fallos), y el plan gratuito de Apify incluye 5 USD mensuales, equivalentes a unas 2.000 transcripciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (servidor MCP, no es un modelo neuronal) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica; limite operativo de 50 videos por llamada) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | parametrizable por llamada (`languages=["en"]` por defecto); el conjunto de idiomas depende del Actor de Apify |
| Licencia | MIT |
| Formato de pesos | no disponible (no aplica; paquete Python distribuido via PyPI y `uvx`) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado. La arquitectura es la de un servidor MCP que implementa dos herramientas (`get_transcript` y `get_transcripts`) y se comunica con clientes mediante el protocolo MCP sobre stdio. Internamente realiza llamadas HTTP al Actor de Apify `shephouse/youtube-transcript-scraper-bulk`, que es quien ejecuta la extraccion efectiva de las transcripciones. El paquete se distribuye como `shephouse-yt-mcp` en PyPI (version 0.1.4 en el momento de la publicacion) y puede lanzarse con `uvx shephouse-yt-mcp` o tras `pip install shephouse-yt-mcp`.

No hay datos de entrenamiento, RLHF ni innovaciones de inferencia porque no existe un modelo de por medio. La unica dependencia critica es la variable de entorno `APIFY_TOKEN`, necesaria para autenticar las llamadas al Actor. El autor indica que antes de cada release se ejecutan tests unitarios con `pytest` y una sesion MCP end-to-end por stdio (initialize, list_tools y `get_transcript` sobre un video real).

## Capacidades

- Obtencion de la transcripcion de un unico video a partir de URL o identificador (`get_transcript`).
- Obtencion por lotes de hasta 50 videos en una sola llamada (`get_transcripts`).
- Parametro `languages` para seleccionar idiomas de la transcripcion (por defecto `["en"]`).
- Parametro `timestamps` para incluir o no marcas temporales en la salida.
- Integracion como servidor MCP en Claude Desktop, Cursor, Cline y otros clientes compatibles.
- Funcionamiento desde IPs de proveedores cloud y entornos de CI, evitando los bloqueos de la extraccion directa.
- No incluye generacion de texto, razonamiento, codigo, vision, tool calling propio ni modo thinking: esas capacidades pertenecen al cliente MCP que consume las herramientas.

## Casos de uso

- Construccion de RAG sobre un canal de YouTube: el servidor entrega las transcripciones en lote (hasta 50 videos por llamada) que despues se indexan en un almacen vectorial como Qdrant o pgvector; el autor ofrece un kit de inicio especifico para este flujo.
- Asistentes conversacionales sobre video: un cliente MCP como Claude Desktop puede consultar la transcripcion de un video concreto y responder preguntas sobre su contenido sin salir de la conversacion.
- Pipelines de CI/CD que procesan contenido audiovisual: al no depender de la IP de origen, el servidor funciona en runners de GitHub Actions, GitLab CI o similares donde la extraccion directa devuelve `RequestBlocked`.
- Monitorizacion de canales: combinado con el kit Pro del autor (que incluye monitor de canal), permite detectar videos nuevos y extraer sus transcripciones de forma automatizada.
- Analisis de contenido y moderacion: extraccion masiva de transcripciones para clasificar tematicas, detectar menciones o generar resumentes con un LLM posterior.
- Investigacion y periodismo de datos: recopilacion de transcripciones de multiples videos para analisis textual, con marcas temporales opcionales para citar fragmentos concretos.
- Agentes desplegados en cloud (AWS, GCP, Fly, Railway): cualquier agente que necesite transcripciones y se ejecute fuera de una IP residencial puede usar este servidor como sustituto directo de `youtube-transcript-api`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta tests unitarios con `pytest` y una sesion MCP end-to-end por stdio antes de cada release, sin metricas de latencia ni throughput.

## Requisitos de hardware

- No requiere GPU: es un proceso Python ligero que realiza llamadas HTTP.
- VRAM estimada: no aplica.
- CPU y memoria: minimos, propios de un proceso Python con dependencias estandar de red.
- Cabe en cualquier maquina, incluidos contenedores pequenos y funciones serverless.
- Opciones de despliegue: `uvx shephouse-yt-mcp`, `pip install shephouse-yt-mcp`, o configuracion como servidor MCP en el cliente correspondiente.
- Requiere conectividad de red hacia la API de Apify y un `APIFY_TOKEN` valido.
- Latencia y throughput: no disponibles; dependen del Actor de Apify y del numero de videos por llamada.

## Comparativa con modelos similares

| Herramienta | Tipo | Acceso a YouTube | Funciona desde IP cloud | Coste | Licencia |
|---|---|---|---|---|---|
| shephouse-yt-mcp | Servidor MCP | Via Actor de Apify | Si | 0,0025 USD por transcripcion (cuenta Apify) | MIT |
| youtube-transcript-api | Libreria Python | Directo | No (bloqueos frecuentes) | Gratis | No disponible en la informacion |
| Servidores MCP de transcripciones genericos | Servidor MCP | Directo | No (bloqueos frecuentes) | Gratis | No disponible en la informacion |
| shephouse-yt | Libreria Python | Via Actor de Apify | Si | 0,0025 USD por transcripcion (cuenta Apify) | No disponible en la informacion |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona ni procesa lenguaje natural por si mismo; solo recupera transcripciones.
- Dependencia total de Apify: si el Actor deja de estar disponible o cambia su API, el servidor deja de funcionar.
- Coste recurrente por uso: 0,0025 USD por transcripcion entregada, facturado a la cuenta de Apify del usuario; el plan gratuito cubre unas 2.000 transcripciones al mes.
- Requiere crear y gestionar un `APIFY_TOKEN`; sin el, el servidor no opera.
- Limite de 50 videos por llamada en `get_transcripts`.
- La disponibilidad de idiomas depende de las transcripciones existentes en YouTube y de lo que soporte el Actor; el valor por defecto es `["en"]`.
- El autor declara un conflicto de interes: ingresa por el uso del Actor de Apify y vende kits y guias complementarias.
- El proyecto lo mantienen agentes de IA segun el propio autor; conviene revisar el codigo (unas 70 lineas) antes de integrarlo en produccion.
- Sin datos publicos de latencia, throughput ni benchmarks; no hay garantias de rendimiento documentadas.
- La licencia MIT permite uso comercial, pero no cubre los costes de Apify ni el cumplimiento de los terminos de servicio de YouTube.

## Enlaces

- Hugging Face: https://huggingface.co/shephouse/shephouse-yt-mcp
- PyPI: https://pypi.org/project/shephouse-yt-mcp/
- Actor de Apify: https://apify.com/shephouse/youtube-transcript-scraper-bulk
- Libreria Python relacionada: https://pypi.org/project/shephouse-yt/
- Guias: https://shephouse-guides.pages.dev/
- Guia de fallos de transcripciones en servidores: https://shephouse-guides.pages.dev/
- Kit de inicio RAG: https://shephouse-guides.pages.dev/youtube-transcript-rag-starter-kit/
- Comparativa de alternativas a la API de transcripciones: https://shephouse-guides.surge.sh/youtube-transcript-api-alternatives/
- Transcripciones de YouTube para RAG y LLM: https://shephouse-guides.surge.sh/youtube-transcripts-for-rag-llm/
- Transcripciones de playlists y canales: https://shephouse-guides.surge.sh/youtube-playlist-channel-transcripts/
- Consola de Apify (tokens): https://console.apify.com/settings/integrations
- Contacto: build@shephouse.com

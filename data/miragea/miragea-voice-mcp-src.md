# miragea/miragea-voice-mcp-src

## Resumen

Miragea Voice MCP es un servidor del Model Context Protocol (MCP) de código abierto desarrollado por Miragea que permite a agentes de IA como Claude Desktop, Claude Code, Cursor u OpenAI Codex generar voces en off y subtítulos a través de la API de Miragea. No se trata de un modelo de pesos abiertos, sino de una herramienta de orquestación (un servidor MCP en Python) que expone herramientas para convertir guiones en audio narrado con subtítulos sincronizados, clonar voces a partir de una URL de audio de referencia y transcribir ficheros locales de audio o vídeo.

El servidor actúa como puente entre el agente y el servicio en la nube de Miragea: recibe un guion, invoca la API de síntesis de voz y reconocimiento de voz, y devuelve ficheros MP3, WAV, FLAC, Opus, AAC o PCM junto con subtítulos SRT y WebVTT en una sola llamada. Está publicado bajo licencia MIT y su único idioma declarado es el inglés.

Es relevante para desarrolladores que construyen flujos de producción de vídeo (YouTube, TikTok, Reels, Shorts) con agentes de IA, porque estandariza la integración mediante MCP, gestiona idempotencia para evitar cargos duplicados y valida los argumentos antes de consumir créditos de la cuenta. El paquete en PyPI aún no está publicado, por lo que la instalación se realiza desde el repositorio de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (servidor MCP en Python; no es un modelo neuronal) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no aplica; el modelo de voz corre en la API de Miragea) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | no disponible (no aplica; el proyecto es código fuente Python) |

## Arquitectura y entrenamiento

El proyecto no es un modelo de lenguaje ni de voz entrenado por el autor, sino un servidor MCP escrito en Python que depende únicamente de las librerías `mcp` y `httpx`. Se ejecuta sobre el transporte stdio de MCP y es compatible con las versiones 1.x y 2.x del SDK de Python de MCP, en Python 3.10 a 3.13, sobre macOS, Windows y Linux. La síntesis de voz, el clonado de voz y la transcripción son realizados por la API remota de Miragea, de modo que no hay datos públicos sobre arquitectura de red neuronal, tokens de entrenamiento ni técnicas de ajuste (RLHF/DPO) en la información disponible.

Las innovaciones técnicas destacables están en la capa de orquestación: las opciones de modelos expresivos o estándar, etiquetas de emoción y velocidad (0,25× a 4×) se leen en vivo desde el endpoint `/capabilities`; cada trabajo lleva una `Idempotency-Key` que se reutiliza en reintentos ante errores de red y respuestas 502/503/504 para no crear trabajos de pago duplicados; los tiempos de espera devuelven el `task_id` para reanudar con `miragea_get_task`; y las salidas nunca sobrescriben ficheros existentes (se añaden sufijos `-2`, `-3`…). La clave de API se lee del entorno, nunca se registra ni se devuelve en errores, no se envía al host de descarga de audio y no se siguen redirecciones de la API.

## Capacidades

- Generación de voz en off a partir de un guion, con salida en MP3, WAV, FLAC, Opus, AAC o PCM.
- Generación simultánea de subtítulos SRT y WebVTT sincronizados, usando reconocimiento de voz sobre el audio recién generado.
- Corrección de la grafía de los subtítulos: por defecto conserva los tiempos reconocidos pero restaura el texto exacto del guion, ajustando los cortes a finales de frase.
- Control de longitud de los subtítulos mediante `max_caption_chars` (42 caracteres por defecto para guiones), con reparto proporcional del tiempo entre fragmentos.
- Dos fuentes de voz: un `actor_id` guardado en la cuenta de Miragea o clonado desde una URL pública de audio de referencia (`reference_audio_url`, con `reference_text` opcional).
- Selección entre modelos expresivos o estándar, etiquetas de emoción y velocidad de 0,25× a 4×.
- Transcripción de ficheros locales de audio o vídeo (mp3, wav, m4a, mp4, mov…) a SRT, VTT, TXT o JSON con texto, idioma y segmentos temporizados.
- Integración como servidor MCP con Claude Desktop, Claude Code, Cursor, OpenAI Codex, VS Code y Windsurf.
- Arranque sin clave de API para listar herramientas (útil para registros e inspectores).
- Verificación de instalación sin consumo de créditos mediante `--check`.

## Casos de uso

- Producción de vídeo corto para YouTube Shorts, TikTok y Reels: el agente convierte un guion en narración MP3 y subtítulos SRT/VTT listos para CapCut, Premiere Pro o DaVinci Resolve, con longitudes de subtítulo adaptadas a vídeo vertical gracias a `max_caption_chars`.
- Automatización de canales de contenido: un agente puede recibir el guion de un episodio, generar la voz en off con una voz guardada en la cuenta (`actor_id`) y entregar los ficheros con nombres derivados del guion, sin sobrescribir versiones anteriores.
- Clonado de voz para marca o presentador: usando `reference_audio_url` con una muestra corta, se genera narración con una voz consistente en toda la serie de vídeos o pódcast.
- Subtitulado de material existente: `miragea_transcribe` procesa ficheros locales mp4/mov/mp3 y devuelve SRT, VTT, TXT o JSON, útil para accesibilidad, archivo o reedición.
- Integración en pipelines de agentes con MCP: al exponerse como servidor stdio, se añade a Claude Desktop, Claude Code, Cursor o Codex con un comando y una variable de entorno, permitiendo que el agente encadene guion, voz y subtítulos en una sola llamada.
- Flujos con control de costes: la idempotencia y la validación previa de argumentos evitan trabajos de pago duplicados y llamadas inválidas, adecuado para automatizaciones que reintentan ante fallos de red.
- Generación de audio multiformato para distribución: la elección entre MP3, WAV, FLAC, Opus, AAC o PCM permite adaptar la salida a pódcast, vídeo o integración en sistemas de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No requiere GPU: es un servidor MCP en Python que delega la síntesis y el reconocimiento de voz en la API remota de Miragea.
- Requisitos de entorno: Python 3.10 a 3.13, `uv` (o `pip`), y `git` en el PATH si se instala desde el repositorio de Hugging Face.
- Dependencias: únicamente `mcp` y `httpx`.
- Sistemas operativos: macOS, Windows y Linux.
- Despliegue: ejecución local vía `uvx` o `pip install`, con transporte stdio; no aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen de la API de Miragea y del tamaño del guion o del fichero a transcribir.

## Comparativa con modelos similares

| Proyecto | Tipo | Idiomas | Licencia | Integración | Coste |
|---|---|---|---|---|---|
| Miragea Voice MCP | Servidor MCP sobre API de voz | en | MIT | Claude Desktop, Claude Code, Cursor, Codex, VS Code, Windsurf | Créditos de la cuenta de Miragea |
| Servidores MCP de TTS alternativos | Servidor MCP sobre API de terceros | no disponible | no disponible | Clientes MCP compatibles | Según proveedor |
| Modelos TTS locales de pesos abiertos (p. ej. familia Coqui/Piper) | Modelo neuronal local | variable | variable | Ejecución local, sin MCP nativo | Gratuito, requiere GPU/CPU |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El proyecto no incluye pesos de modelo: toda la síntesis y el reconocimiento dependen de la API de Miragea y de una `MIRAGEA_API_KEY` válida; sin clave, las llamadas devuelven un mensaje de error claro.
- El único idioma declarado es el inglés; no hay información sobre soporte multilingüe en esta ficha.
- El paquete en PyPI no está publicado todavía; la instalación debe hacerse desde el repositorio de Hugging Face con `uvx --from git+...` o `pip install git+...`, lo que requiere `git` en el PATH.
- El consumo de créditos de audio de la cuenta es real: aunque la idempotencia evita duplicados en reintentos, cada trabajo válido consume créditos.
- La corrección de subtítulos restaura el texto del guion, pero los tiempos provienen del reconocimiento de voz; pueden existir desajustes en guiones con pausas largas o marcas no habladas.
- Riesgo de dependencia de un proveedor externo: cambios en la API de Miragea o en `/capabilities` pueden afectar al comportamiento del servidor.
- Licencia MIT: permite uso comercial, pero no cubre los términos del servicio de la API de Miragea, que deben revisarse por separado.
- No se han publicado datos sobre sesgos del modelo de voz subyacente ni sobre tasas de alucinación en la transcripción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/miragea/miragea-voice-mcp-src
- Página del proyecto (Space): https://huggingface.co/spaces/miragea/miragea-voice-mcp
- Sitio de Miragea: https://miragea.ai/
- Gestión de claves de API: https://miragea.ai/workspace/api
- Documentación de Model Context Protocol: https://modelcontextprotocol.io
- Instalador de uv (macOS/Linux): https://astral.sh/uv/install.sh
- Instalador de uv (Windows): https://astral.sh/uv/install.ps1

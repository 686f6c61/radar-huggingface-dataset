# mohameddalii/ocr-mt-asr-5090

## Resumen

`mohameddalii/ocr-mt-asr-5090` no es un modelo de pesos, sino un kit de despliegue que orquesta tres modelos de IA en una única GPU RTX 5090: Qwen3-4B-Instruct-2507 para traducción automática, PaddleOCR-VL para reconocimiento óptico de caracteres (OCR) y Cohere Transcribe Arabic para transcripción de audio. El repositorio incluye scripts de arranque, configuración de vLLM y un gateway FastAPI con interfaz Swagger que expone endpoints REST unificados para los tres servicios.

El problema que resuelve es la integración de un pipeline multimodal (imagen, texto y audio) en un solo equipo de consumo, sin necesidad de un clúster. Al colocar los tres motores en la misma GPU mediante fracciones de memoria (0.36, 0.38 y 0.16), se aprovechan los 32 GB de la RTX 5090 sin saturarla. La relevancia actual radica en la creciente demanda de soluciones de traducción y extracción de información en entornos con recursos limitados, y este kit demuestra una configuración viable y reproducible.

La arquitectura se basa en vLLM como motor de inferencia para los tres modelos, con un gateway FastAPI que actúa como capa de abstracción. El repositorio está pensado para uso en servidores genéricos con RTX 5090 o en instancias de Vast.ai, y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

La siguiente tabla resume las características del kit. Al tratarse de un orquestador de varios modelos, algunos parámetros se refieren al conjunto o a los modelos subyacentes.

| Parametro | Valor |
|---|---|
| Arquitectura | Orquestacion de tres modelos vLLM + gateway FastAPI |
| Parametros totales | No disponible (kit, no modelo unico; Qwen3-4B ~4B, PaddleOCR-VL y Cohere ASR no especificados) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | 2048 (Qwen3-MT), 8192 (PaddleOCR-VL), 128 (Cohere ASR) |
| Tipos de cuantizacion | bf16 (sin cuantizacion, recomendado por el autor) |
| Idiomas soportados | Traduccion hacia arabe, ingles, frances (ISO 639-1: ar, en, fr); ASR solo arabe; OCR multilingue (no especificado) |
| Licencia | apache-2.0 |
| Formato de pesos | No aplica (no contiene pesos; los modelos se descargan de sus repos oficiales) |

## Arquitectura y entrenamiento

El kit no entrena ningún modelo; se limita a coordinar tres modelos preentrenados mediante vLLM. Cada modelo se ejecuta como un proceso independiente con una fracción de GPU asignada mediante variables de entorno (`MT_GPU_UTIL=0.36`, `OCR_GPU_UTIL=0.38`, `ASR_GPU_UTIL=0.16`). La comunicación entre procesos se realiza a través de puertos locales (8091, 8092, 8093) y el gateway FastAPI (puerto 18000) actúa como intermediario.

Los modelos subyacentes son:
- **Qwen3-4B-Instruct-2507**: un modelo de lenguaje de 4.000 millones de parámetros, optimizado para instrucciones y traducción, con soporte de contexto de 2048 tokens en esta configuración.
- **PaddleOCR-VL**: un modelo de visión-lenguaje especializado en OCR, capaz de procesar imágenes completas y recortes de diseño.
- **Cohere Transcribe Arabic**: un modelo de reconocimiento de voz automático (ASR) especializado en árabe, con contexto de 128 tokens.

No hay datos de entrenamiento disponibles para el kit en sí, ya que no constituye un modelo entrenado. La innovación técnica reside en la orquestación eficiente de tres cargas de trabajo en una sola GPU, con ajuste fino de las fracciones de memoria para evitar OOM (out-of-memory).

## Capacidades

- **Traducción automática**: el endpoint `/translate` acepta contenido de texto y un idioma destino (`ar`, `en`, `fr`) y devuelve la traducción generada por Qwen3-4B-Instruct.
- **Reconocimiento óptico de caracteres (OCR)**: el endpoint `/ocr` procesa imágenes (multipart) y extrae el texto mediante PaddleOCR-VL, con soporte para recortes de diseño.
- **Transcripción de audio (ASR)**: el endpoint `/transcribe` acepta archivos de audio (mp3, mp4, wav, etc.) y devuelve la transcripción en árabe usando Cohere Transcribe Arabic.
- **Detección de idioma**: el endpoint `/detect` identifica el idioma de un archivo de texto o audio.
- **Extracción de texto de archivos**: `/file2text` convierte PDF, DOCX, XLSX o TXT a texto y, opcionalmente, lo traduce al idioma destino.
- **Interfaz Swagger**: el gateway expone documentación interactiva en `/docs` para probar los endpoints.
- **Healthcheck**: `/health` devuelve el estado del servicio.
- **Soporte de agentes y tool calling**: no aplicable directamente, aunque el gateway actúa como una herramienta unificada para consumidores externos.

## Casos de uso

- **Digitalización de facturas y recibos**: el pipeline OCR extrae el texto de imágenes o PDFs escaneados y el endpoint `/file2text` lo convierte a texto plano, permitiendo su integración en sistemas de contabilidad. La combinación de OCR y traducción facilita el procesamiento de documentos en varios idiomas.
- **Traducción de documentos multilingües**: un usuario sube un PDF en inglés y recibe la versión traducida al francés o árabe mediante `/file2text` con `target_lang`. La baja latencia de Qwen3-4B en una RTX 5090 permite procesar documentos de varias páginas en segundos.
- **Transcripción de reuniones en árabe**: el endpoint `/transcribe` convierte grabaciones de audio a texto, útil para actas de reuniones, entrevistas o contenido audiovisual. El modelo Cohere está especializado en árabe, lo que garantiza una transcripción precisa.
- **Asistente de atención al cliente**: una aplicación puede recibir consultas de voz en árabe, transcribirlas con ASR, traducirlas al inglés para un agente y devolver la respuesta traducida al árabe. El gateway unifica estos pasos en una sola API.
- **Extracción de información de imágenes médicas o técnicas**: el OCR de PaddleOCR-VL permite digitalizar informes, etiquetas o diagramas, y el texto resultante puede traducirse o procesarse automáticamente.
- **Pipeline de automatización de contenido**: un bot puede ingerir archivos (imágenes, audio, PDFs), extraer texto, traducirlo y almacenarlo en una base de datos, todo mediante llamadas REST al gateway.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que el kit fue probado en una RTX 5090 con bf16 y sin cuantización, con una utilización total de GPU de 0.90 (los tres procesos suman 0.36 + 0.38 + 0.16). No se proporcionan métricas de latencia, throughput ni precisión de los modelos individuales.

## Requisitos de hardware

- **VRAM estimada**: 32 GB en total (la RTX 5090 tiene 32 GB). Los tres procesos utilizan aproximadamente 11.4 GB (Qwen3-MT), 12.2 GB (PaddleOCR-VL) y 5.5 GB (Cohere ASR), sumando unos 29 GB.
- **GPU recomendada**: RTX 5090 (Blackwell) con 32 GB. No se recomienda usar GPUs con menos memoria ni activar cuantización de 4 bits.
- **Compatibilidad con GPUs de consumo**: sí, la RTX 5090 es una GPU de consumo, pero el kit requiere al menos 32 GB de VRAM. No funcionará en GPUs de 16 GB o inferiores sin modificar las fracciones y probablemente sin OOM.
- **Opciones de despliegue**: vLLM para los tres motores, FastAPI para el gateway. El autor proporciona scripts para Vast.ai y para servidores Linux genéricos. También se incluye un túnel Cloudflare para acceso público.
- **Latencia y throughput**: no se han publicado datos específicos. La configuración con `parallel_seqs=8` para MT y OCR, y `128` para ASR, sugiere un throughput moderado para uso concurrente.

## Comparativa con modelos similares

No existe una comparativa directa disponible, ya que este repositorio es un kit de orquestación y no un modelo único. La alternativa más cercana es el repositorio hermano [`mohameddalii/ocr-mt-5090`](https://huggingface.co/mohameddalii/ocr-mt-5090), que incluye solo OCR y traducción (sin ASR ni gateway). Otras soluciones multimodales como TurboOCR (mencionado en la búsqueda) ofrecen OCR a alta velocidad (>200 img/s) pero no integran traducción ni ASR. La comparativa en términos de rendimiento no es posible sin datos publicados.

## Limitaciones y advertencias

- **Dependencia de hardware específico**: el kit está diseñado para RTX 5090 de 32 GB. No se garantiza su funcionamiento en otras GPUs sin ajustes.
- **ASR limitado al árabe**: el modelo Cohere Transcribe Arabic solo transcribe audio en árabe; no soporta otros idiomas.
- **Riesgo de OOM**: el autor advierte explícitamente que no se debe subir la utilización de MT y OCR por encima de 0.90 combinado con ASR, ni cambiar a cuantización de 4 bits, ya que podría provocar fallos de memoria.
- **Orden de arranque obligatorio**: los tres servicios deben iniciarse en el orden MT → OCR → ASR; de lo contrario, pueden producirse conflictos de puertos o de recursos.
- **Sin cuantización**: el kit está optimizado para bf16; no se recomienda usar otras precisiones.
- **Licencia**: Apache 2.0, pero los modelos subyacentes (Qwen3, PaddleOCR-VL, Cohere) tienen sus propias licencias que deben revisarse antes de uso comercial. Cohere Transcribe Arabic puede tener restricciones adicionales no especificadas en este repositorio.
- **Sin soporte de producción garantizado**: el autor no ofrece garantías de estabilidad ni mantenimiento; es un kit de demostración.
- **Riesgo de alucinación en traducción**: como cualquier LLM, Qwen3-4B puede generar traducciones incorrectas en contextos ambiguos. Se recomienda validación humana en aplicaciones críticas.

## Enlaces

- [Repositorio HuggingFace: mohameddalii/ocr-mt-asr-5090](https://huggingface.co/mohameddalii/ocr-mt-asr-5090)
- [Modelo Qwen3-4B-Instruct-2507](https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507)
- [Modelo PaddleOCR-VL](https://huggingface.co/PaddlePaddle/PaddleOCR-VL)
- [Modelo Cohere Transcribe Arabic](https://huggingface.co/CohereLabs/cohere-transcribe-arabic-07-2026)
- [Kit hermano sin ASR: mohameddalii/ocr-mt-5090](https://huggingface.co/mohameddalii/ocr-mt-5090)
- [Repositorio Qwen3-ASR en GitHub](https://github.com/QwenLM/Qwen3-ASR) (referencia de modelos ASR relacionados)
- [OCRBench Leaderboard](https://llm-stats.com/benchmarks/ocrbench) (referencia de benchmarks OCR)
- [TurboOCR en GitHub](https://github.com/aiptimizer/TurboOCR) (alternativa de OCR de alta velocidad)

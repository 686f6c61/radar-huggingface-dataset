# litert-community/gemma-4-31B-it-litert-lm

## Resumen

Gemma 4 31B IT en formato LiteRT-LM es una distribución cuantizada del modelo Gemma 4 31B instruction-tuned de Google, empaquetada por la comunidad litert-community para su despliegue en web y escritorio mediante el framework LiteRT-LM. LiteRT-LM es una capa de orquestación construida sobre LiteRT, el runtime multiplataforma de Google que proporciona aceleración por hardware mediante XNNPack (CPU) y ML Drift (GPU), e incluye gestión de KV-cache, plantillas de prompt y soporte de function calling.

El modelo resuelve el problema de ejecutar un LLM de 31 000 millones de parámetros de forma local y privada, sin conexión a internet, en hardware de consumo y estaciones de trabajo. Está cuantizado con QAT (quantization-aware training) en pesos int4 por bloques con activaciones en float, una configuración optimizada específicamente para inferencia en GPU. El artefacto ocupa aproximadamente 19,8 GB en disco.

La relevancia actual radica en que permite acceso offline a IA generativa de tamaño medio con capacidades de texto y visión, orientado a casos de escritorio. Esta versión de LiteRT-LM soporta texto y visión; la predicción multi-token (multitoken prediction) se anuncia para una actualización futura. Requiere LiteRT-LM v0.17.1 o superior en escritorio, y v0.19.1 o superior para visión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, derivada de la tecnología de Gemini); detalles internos no disponibles en la información proporcionada |
| Parametros totales | 31B (según el nombre del modelo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | Hasta 80k tokens en web; benchmarks de escritorio realizados con contexto de 16384 tokens |
| Tipos de cuantizacion | QAT con pesos int4 por bloques y activaciones float; Q4_0 en el benchmark web |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM) |
| Tamano en disco | ~19 835 MB |
| Modelo base | google/gemma-4-31B-it |
| Modalidades | Texto y visión |
| Runtime requerido | LiteRT-LM v0.17.1+ (escritorio); v0.19.1+ para visión |

## Arquitectura y entrenamiento

El modelo es una cuantización del Gemma 4 31B instruction-tuned de Google, que pertenece a la familia Gemma construida con la misma investigación y tecnología empleada en los modelos Gemini. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en el modelo base.

La innovación técnica principal de esta distribución es el pipeline de despliegue: el modelo se sirve mediante LiteRT-LM, que gestiona KV-cache, plantillas de prompt y function calling sobre el runtime LiteRT. La cuantización es QAT (quantization-aware training) con pesos int4 por bloques y activaciones en float, optimizada para GPU. El stack LiteRT-LM es el mismo que alimenta la aplicación de demostración Google AI Edge Gallery. La predicción multi-token aún no está disponible en esta versión.

## Capacidades

- Generación de texto y razonamiento conversacional en formato instruction-tuned.
- Procesamiento de imágenes (visión) a partir de LiteRT-LM v0.19.1.
- Soporte de function calling / tool calling integrado en LiteRT-LM.
- Gestión de KV-cache y plantillas de prompt para conversaciones multi-turno.
- Ejecución local y privada sin conexión a internet.
- Despliegue en web (Chrome) y escritorio (Linux, macOS).
- Predicción multi-token: anunciada para una actualización futura, no disponible en esta versión.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente de escritorio offline: el modelo se ejecuta localmente con LiteRT-LM en Linux o macOS, ofreciendo generación de texto privada sin conexión, adecuado para entornos con requisitos de confidencialidad de datos.
- Análisis de documentos con imágenes: gracias al soporte de visión (v0.19.1+), se puede usar para describir o extraer información de capturas y documentos escaneados en aplicaciones de escritorio.
- Automatización con function calling: LiteRT-LM incluye soporte de llamadas a funciones, lo que permite integrar el modelo en flujos que consultan APIs o ejecutan acciones estructuradas.
- Aplicaciones web en el navegador: con hasta 80k tokens de contexto y ejecución en Chrome mediante backend GPU, es viable para asistentes embebidos en páginas web que procesan contexto largo.
- Prototipado de agentes locales: la combinación de instrucciones, contexto amplio y tool calling permite construir agentes multi-paso en estaciones de trabajo sin depender de servicios en la nube.
- Chat multi-turno con contexto extenso: los 80k tokens de contexto permiten mantener conversaciones largas o procesar corpus de tamaño medio en una sola sesión local.

## Benchmarks y rendimiento

Rendimiento de inferencia publicado en la model card (no son benchmarks de calidad de tarea):

| Dispositivo | Backend | Prefill (tok/s) | Decode (tok/s) | Init (s) | Tamano (MB) |
|---|---|---|---|---|---|
| NVIDIA 4090 24GB (Linux) | GPU | 1183 | 28 | 31,30 | 19835 |
| MacBook Pro 2024 M4 Max 48GB (macOS) | GPU | 215 | 18 | 14,49 | 19835 |
| MacBook Pro 2024 M4 Max 48GB (Web, Chrome, Q4_0) | GPU | 148 | 7 | TTFT 17,1 s | 19835 |

Los benchmarks de escritorio se tomaron con 8192 tokens de prefill y 512 de decode con contexto de 16384; los web con 1024 de prefill y 256 de decode con contexto de 1280.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~19,6-21,2 GB de memoria GPU según el benchmark (M4 Max reporta ~21 170 MB en escritorio y ~19 600 MB en web).
- GPU recomendadas: NVIDIA RTX 4090 24GB (prefill 1183 tok/s, decode 28 tok/s); Apple M4 Max 48GB (prefill 215 tok/s, decode 18 tok/s).
- Cabe en GPU de consumo de gama alta con 24 GB o más de VRAM; el tamaño de ~19,8 GB deja margen ajustado en tarjetas de 24 GB.
- Memoria CPU pico en web: ~4500 MB.
- Despliegue: LiteRT-LM CLI y framework LiteRT-LM; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato `.litertlm`.
- Latencia: time-to-first-token de 17,1 s en el benchmark web con contexto de 1280; init de 31,30 s en RTX 4090 y 14,49 s en M4 Max.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| gemma-4-31B-it-litert-lm (este) | 31B | hasta 80k (web) | `.litertlm` int4 QAT | Apache 2.0 | Optimizado para LiteRT-LM en escritorio/web |
| google/gemma-4-31B-it | 31B | no disponible | safetensors (presumible) | según modelo base | Modelo base sin cuantizar; requiere otro runtime |
| Alternativas de 30B-32B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la información proporcionada |

No se dispone en la información proporcionada de datos de rendimiento de calidad para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- La predicción multi-token no está disponible en esta versión; se anuncia para una actualización futura.
- El soporte de visión requiere LiteRT-LM v0.19.1 o superior; en escritorio general se exige v0.17.1 o superior.
- El formato `.litertlm` está atado al framework LiteRT-LM; no es directamente compatible con vLLM, llama.cpp, Ollama o TGI.
- El tamaño de ~19,8 GB limita el despliegue a GPU con 24 GB o más de VRAM; en tarjetas de 24 GB el margen es estrecho.
- Idiomas soportados no documentados en la información disponible; no se puede garantizar cobertura multilingüe.
- Riesgo de alucinación y sesgos: propios de un LLM instruction-tuned; no se documentan evaluaciones de sesgo en la información proporcionada.
- Licencia Apache 2.0 declarada en el repositorio, pero conviene verificar las condiciones del modelo base google/gemma-4-31B-it para uso comercial.
- El rendimiento medido corresponde a hardware concreto (RTX 4090, M4 Max); en equipos inferiores el decode puede ser notablemente más lento.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/gemma-4-31B-it-litert-lm
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Documentación LiteRT-LM: https://ai.google.dev/edge/litert-lm/overview
- CLI LiteRT-LM: https://ai.google.dev/edge/litert-lm/cli
- Demo web: https://huggingface.co/spaces/tylermullen/Gemma4
- Ejemplos: https://github.com/google-ai-edge/litert-samples

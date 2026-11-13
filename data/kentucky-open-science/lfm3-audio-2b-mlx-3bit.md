# Kentucky-Open-Science/LFM3-Audio-2B-MLX-3bit

## Resumen

LFM3-Audio-2B-MLX-3bit es una cuantización de 3 bits del modelo LFM3-Audio-2B de Liquid AI, publicada por Kentucky Open Science para inferencia local en Apple Silicon mediante la librería MLX Audio. El modelo original es un sistema any-to-any de aproximadamente 1.977 millones de parámetros (1,98 B) que combina un backbone de lenguaje con componentes de audio, y esta versión reduce el peso del repositorio a unos 1,42 GB aplicando cuantización afín de 3 bits con tamaño de grupo 64 únicamente al backbone de lenguaje.

La relevancia de esta ficha radica en que permite ejecutar tareas de reconocimiento de voz, síntesis de voz (TTS), preguntas sobre audio y chat voz-a-voz en hardware de Apple sin GPU dedicada, manteniendo los componentes de habla en su precisión original y conservando el códec de audio en el directorio `audio_tokenizer/`. El pipeline declarado es `any-to-any` y la librería de ejecución es `mlx`, con pesos en formato safetensors.

El modelo hereda la licencia LFM Open License v1.0 del modelo base de Liquid AI, que incluye condiciones de redistribución y términos de uso comercial. La validación publicada por el autor se limita a una prueba de humo de TTS en inglés que generó un WAV mono a 24 kHz; no se incluyen benchmarks comparativos de calidad ni de rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Backbone de lenguaje con componentes de audio (modelo any-to-any); detalles arquitectónicos del modelo base no disponibles |
| Parámetros totales | 1.977.548.032 (≈1,98 B) |
| Parámetros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Afín de 3 bits, tamaño de grupo 64, aplicada al backbone de lenguaje; componentes de habla en precisión original |
| Idiomas soportados | No disponibles a nivel general; el chat de voz intercalado en el runtime MLX Audio validado es solo en inglés |
| Licencia | LFM Open License v1.0 (`lfm1.0`) |
| Formato de pesos | safetensors (MLX), con códec y tokenizer incluidos en el repositorio |

## Arquitectura y entrenamiento

El modelo base LFM3-Audio-2B de Liquid AI es un sistema any-to-any que integra un backbone de lenguaje con módulos de audio y un códec de voz incluido en el paquete (`audio_tokenizer/`). La información proporcionada no detalla la arquitectura interna del backbone (tipo de transformer, mecanismos de atención, número de capas o dimensión oculta), ni los datos de entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF/DPO). Tampoco se especifican innovaciones técnicas como decodificación especulativa o atención lineal.

Esta versión concreta es una conversión de cuantización: se aplicó cuantización afín de 3 bits con tamaño de grupo 64 al backbone de lenguaje, manteniendo los componentes de habla en su precisión de origen. Los archivos modificados respecto al modelo fuente son `model.safetensors`, `model.safetensors.index.json` y `config.json`; la configuración registra la cuantización y elimina los mapeos de código remoto del runtime nativo de MLX Audio. El resto de activos (códec, tokenizer, ajustes de generación y licencia) coinciden con la revisión fijada del modelo fuente `LiquidAI/LFM3-Audio-2B-MLX-bf16` (revisión `452469a1afe66dd4932d0e9237603229fa606c0d`).

## Capacidades

- Reconocimiento de voz (speech recognition) según el runtime MLX Audio.
- Síntesis de voz (TTS) a partir de texto, con salida WAV mono a 24 kHz.
- Preguntas sobre audio (audio questions).
- Chat voz-a-voz (speech-to-speech) con respuestas intercaladas de texto y audio.
- Generación de texto y audio en un mismo pipeline any-to-any.
- Soporte de system prompt para controlar el estilo de respuesta (por ejemplo, respuestas breves de una o dos frases).
- Entrada de audio en formatos WAV, MP3 y FLAC mediante el runtime retenido; otros formatos pueden requerir ffmpeg.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agentes y razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles; el chat de voz intercalado validado es solo en inglés.
- Modo thinking, visión o audio de entrada adicional: no disponible en la información proporcionada.

## Casos de uso

- Síntesis de voz local en macOS: generar audios WAV a 24 kHz desde texto con el comando `mlx_audio.sts.generate --task tts`, útil para prototipos de narración o accesibilidad sin depender de servicios en la nube, gracias al tamaño reducido de 1,42 GB.
- Asistentes de voz conversacionales en Apple Silicon: usar el modo `sts` para responder a grabaciones con texto y audio intercalados, adecuado para demos de asistentes locales con baja huella de memoria.
- Transcripción y respuesta a notas de voz: procesar archivos WAV, MP3 o FLAC como entrada de audio y devolver una respuesta hablada, por ejemplo en aplicaciones de mensajería o dictado.
- Preguntas sobre contenido de audio: integrar el modelo en herramientas que reciben un clip y formulan preguntas sobre él, aprovechando el pipeline any-to-any.
- Prototipado de interfaces voz-a-voz en investigación: validar pipelines de chat hablado en inglés sobre MLX Audio con un modelo cuantizado de menos de 2 GB de pesos.
- Evaluación de cuantización en audio: comparar la calidad de salida de TTS y STT frente al modelo base en bf16 (`LiquidAI/LFM3-Audio-2B-MLX-bf16`) para estudiar el impacto de 3 bits en componentes de habla.
- Despliegue en entornos con memoria limitada: ejecutar tareas de audio en equipos Apple con recursos restringidos, ya que el paquete completo, incluidos tokenizer y códec, ocupa aproximadamente 1,42 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta una prueba de humo de TTS en inglés que generó un WAV mono a 24 kHz con el runtime fijado (Python 3.12, MLX 0.32.4, MLX Audio 0.6.5), sin evaluación de calidad de voz, precisión de transcripción ni comparación con el modelo base.

## Requisitos de hardware

- VRAM/RAM unificada estimada: el repositorio pesa aproximadamente 1,42 GB, por lo que se necesita al menos esa cantidad de memoria unificada más el overhead del runtime MLX Audio y del códec.
- Plataforma objetivo: Apple Silicon (MLX). La compatibilidad con otras plataformas o runtimes no ha sido validada.
- GPU recomendadas: no disponibles de forma explícita; el modelo está pensado para chips de Apple con memoria unificada, no para A100, H100 o RTX 4090.
- ¿Cabe en GPU consumer? El modelo está orientado a Apple Silicon; no se indica compatibilidad con GPU consumer NVIDIA.
- Opciones de despliegue: MLX Audio 0.6.5 con MLX 0.32.4 en Python 3.12; descarga mediante `hf download`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor no publica mediciones de velocidad.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Plataforma |
|---|---|---|---|---|---|
| LFM3-Audio-2B-MLX-3bit (esta ficha) | ≈1,98 B | No disponible | 3 bits afín, grupo 64 | LFM Open License v1.0 | Apple Silicon / MLX Audio |
| LiquidAI/LFM3-Audio-2B-MLX-bf16 | ≈1,98 B | No disponible | bf16 | LFM Open License v1.0 | Apple Silicon / MLX Audio |
| LiquidAI/LFM3-Audio-2B | ≈1,98 B | No disponible | Precisión original | LFM Open License v1.0 | No disponible |
| Otros modelos de audio de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada; la única diferencia documentada es la cuantización del backbone de lenguaje y el tamaño resultante del paquete.

## Limitaciones y advertencias

- La cuantización a 3 bits puede afectar a la calidad de salida; el autor no cuantifica esa degradación.
- La validación publicada es una única prueba de humo de TTS en inglés; no cubre calidad de voz, precisión de transcripción ni el resto de tareas e idiomas.
- El chat de voz intercalado en el runtime MLX Audio validado es solo en inglés.
- No se han validado otros runtimes distintos de MLX Audio; la portabilidad a vLLM, llama.cpp u otros entornos no está confirmada.
- El modelo está orientado exclusivamente a Apple Silicon; no se documenta soporte para GPU NVIDIA u otras plataformas.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada, aunque son inherentes a los modelos de lenguaje y audio.
- Licencia LFM Open License v1.0: incluye condiciones de redistribución y términos de uso comercial que deben revisarse antes de un despliegue en producción; es obligatorio preservar los avisos de licencia y atribución.
- Los formatos de audio distintos de WAV, MP3 y FLAC pueden requerir ffmpeg.
- No se dispone de información sobre longitud de contexto, idiomas soportados globalmente ni datos de entrenamiento del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Kentucky-Open-Science/LFM3-Audio-2B-MLX-3bit
- Modelo base (bf16 MLX): https://huggingface.co/LiquidAI/LFM3-Audio-2B-MLX-bf16
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM3-Audio-2B
- Autor de la cuantización: https://huggingface.co/Kentucky-Open-Science
- Licencia LFM Open License v1.0: incluida en el repositorio (`LICENSE`)
- Aviso de publicación: incluido en el repositorio (`NOTICE`)
- Runtime MLX Audio: no se proporciona enlace directo en la información disponible

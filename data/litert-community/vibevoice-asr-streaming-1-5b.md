# litert-community/VibeVoice-ASR-Streaming-1.5B

## Resumen

VibeVoice-ASR-Streaming-1.5B es un modelo de reconocimiento automatico del habla (ASR) en modo streaming desarrollado originalmente por Microsoft y empaquetado por la comunidad litert-community en formato LiteRT-LM (`.litertlm`) para inferencia en dispositivo (on-device) mediante el runtime LiteRT-LM de Google. El modelo combina un codificador de audio basado en tokenizadores σ-VAE acusticos y semanticos (que convierten audio a 24 kHz en 7.5 tramas latentes por segundo) con un modelo de lenguaje de forma Qwen2.5-1.5B que genera la transcripcion. El resultado es un sistema audio-a-texto que transcribe fragmentos de 2.93 segundos con 0.53 segundos de look-ahead y etiqueta cada segmento con el hablante (`Speaker 0: ...`).

La relevancia de este empaquetado reside en su orientacion a entornos de borde: el bundle int4 ocupa 1.99 GB y el int8 2.77 GB, lo que permite ejecutar ASR con atribucion de hablante en moviles (Pixel 8a, Galaxy S26) y portatiles (Apple M4 Max) sin conexion a servicios en la nube. Soporta 10 idiomas (ingles, chino, espanol, portugues, aleman, japones, coreano, frances, ruso e italiano) bajo licencia MIT.

El modelo se disena para funcionar como una conversacion multi-turno, un turno por ventana de audio: es la unica forma en que transcribe correctamente, ya que alimentado con un clip completo en un solo turno solo devuelve los ultimos 3.5 segundos. La cache KV crece aproximadamente 40 tokens por cada 2.93 segundos de habla, con un presupuesto de 2048 tokens que equivale a unos 2.5 minutos de audio continuo por conversacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de audio σ-VAE (acustico + semantico) + LLM tipo Qwen2.5-1.5B (transformer decoder) |
| Parametros totales | 1.5B (modelo de lenguaje); codificador de audio no especificado en detalle |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens de presupuesto KV (≈ 2.5 minutos de audio continuo por conversacion) |
| Tipos de cuantizacion | LM int4 blockwise-128 (min-max) con embedding int8; LM int8 dinamico; codificador de audio int8 con lineales dinamicas y convoluciones fp32 |
| Idiomas soportados | en, zh, es, pt, de, ja, ko, fr, ru, it |
| Licencia | MIT |
| Formato de pesos | `.litertlm` (LiteRT-LM); variantes int4 (1.99 GB) e int8 (2.77 GB) |
| Ventana de audio por turno | 83 200 muestras a 24 kHz (26 tramas × 3200 = 3.467 s) |
| Avance entre turnos | 70 400 muestras (22 tramas = 2.933 s), con 4 tramas de look-ahead |
| Tamano del repositorio | 9.5 GB |
| Modelo base | microsoft/VibeVoice-ASR-Streaming-1.5B |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos etapas: un codificador de audio que procesa la senal PCM a 24 kHz y la comprime en tramas latentes mediante tokenizadores σ-VAE acusticos y semanticos (7.5 tramas latentes por segundo), y un modelo de lenguaje con forma de Qwen2.5-1.5B que recibe esas representaciones y emite el texto transcrito. El bundle LiteRT-LM incluye ambas partes en un unico archivo: seccion de prefill/decode (802 MB en int4), embedder (237 MB), codificador de audio (951 MB) y tokenizador. En la variante int8 la seccion de prefill/decode crece hasta 1581 MB.

El protocolo de inferencia replica el entrenamiento del modelo de Microsoft: un prompt de sistema que instruye la transcripcion con las claves `speaker` y `content`, seguido por turnos que contienen `<|object_ref_start|>`, 26 embeddings de audio y `<|object_ref_end|>`. El modelo escribe el texto del fragmento y se detiene en `<|text_chunk_end|>`, que el runtime anade al historial antes del siguiente turno. No se re-codifica audio entre turnos. Los hotwords (palabras clave) se inyectan en un mensaje de sistema con la sintaxis `... and extra info: <palabras separadas por comas>`. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Transcripcion de voz a texto en modo streaming con baja latencia (ventana de 3.467 s y avance de 2.933 s).
- Atribucion de hablante por segmento mediante etiquetas `Speaker N:`.
- Soporte multilingue en 10 idiomas: ingles, chino, espanol, portugues, aleman, japones, coreano, frances, ruso e italiano.
- Procesamiento de audio en bruto a 24 kHz mono, con padding a cero para la ventana final.
- Inyeccion de hotwords o vocabulario personalizado mediante mensaje de sistema.
- Conversacion multi-turno con cache KV incremental, sin re-codificacion entre turnos.
- Ejecucion on-device en CPU, GPU Metal (Apple) y GPU OpenCL (Android).
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio generativo.

## Casos de uso

- Subtitulado en directo en movil: el modelo procesa ventanas de 3.467 s con 0.53 s de look-ahead, lo que permite generar subtitulos con un retardo inferior a un segundo en un Pixel 8a o Galaxy S26 sin conexion.
- Transcripcion de reuniones con separacion de hablantes: las etiquetas `Speaker N:` permiten diferenciar interlocutores en grabaciones largas, gestionando hasta 2.5 minutos de audio continuo por conversacion antes de reiniciar el contexto.
- Notas de voz a texto en aplicaciones de productividad: el bundle int4 de 1.99 GB cabe en el almacenamiento de un telefono de gama media-alta y permite dictado offline en diez idiomas.
- Asistentes de voz para entornos sin conectividad: despliegue en dispositivos de borde (kioscos, wearables, equipos industriales) donde no se puede depender de APIs en la nube.
- Transcripcion de llamadas de atencion al cliente: la atribucion de hablante y los hotwords permiten identificar terminos de negocio (nombres de productos, codigos) y separar agente de cliente en la transcripcion.
- Accesibilidad para personas con discapacidad auditiva: conversion de conversaciones presenciales en texto en tiempo real en un dispositivo personal, con soporte multilingue para entornos bilingues.
- Analisis de audio en pipelines de datos: integracion en el runtime LiteRT-LM mediante la API de conversacion en Python, Kotlin o Swift para procesar lotes de clips con el modo `--multi_turns` de la CLI.

## Benchmarks y rendimiento

Resultados de WER sobre 20 clips de LibriSpeech dev-clean (448 palabras, 2-29 s, 73 ventanas), decodificacion greedy, tras aplicar mayusculas, eliminar puntuacion y quitar la etiqueta `Speaker N:`:

| Configuracion | Archivo int4 | Archivo int8 |
|---|---|---|
| Referencia PyTorch fp32 (streaming_generate del proveedor, latentes medios) | 7.59 % (34/448) | 7.59 % (34/448) |
| LiteRT-LM 0.16.1, Apple M4 Max, CPU | 7.81 % (35/448) | 7.14 % (32/448) |
| LiteRT-LM 0.16.1, Apple M4 Max, LM en GPU Metal, audio en CPU | 6.92 % (31/448) | 7.37 % (33/448) |
| LiteRT-LM v0.16.1 CLI `--multi_turns`, Galaxy S26 (SM-S942Q), CPU | 7.81 % (35/448) | 7.14 % (32/448) |
| LiteRT-LM v0.16.1 CLI, Galaxy S26, LM en GPU OpenCL, audio en CPU | 7.14 % (32/448) | 6.92 % (31/448) |
| LiteRT-LM v0.16.1 CLI `--multi_turns`, Pixel 8a (Tensor G3), CPU | 7.81 % (35/448) | no medido |
| LiteRT-LM v0.16.1 CLI, Pixel 8a, LM en GPU Mali, audio en CPU | 7.37 % (33/448) | no medido |

Las filas del runtime se mantienen dentro de ±0.7 puntos porcentuales de la referencia fp32 en ambas direcciones. El residuo de ~7 % es el compromiso propio del modo streaming: el bundle no-streaming VibeVoice-ASR-BitNet obtiene 2.68 % en los mismos 20 clips con una ventana de 30 s. La model card de Microsoft no publica cifras de LibriSpeech para el modelo streaming. LiteRT-LM 0.17.1 (Python) produjo transcripciones identicas a 0.16.1 en los clips comprobados.

## Requisitos de hardware

- VRAM/RAM estimada: el bundle int4 ocupa 1.99 GB en disco y el int8 2.77 GB; el modelo puede residir en memoria unificada o RAM del dispositivo.
- Desglose de secciones (int4): prefill/decode 802 MB, embedder 237 MB, codificador de audio 951 MB, tokenizador. La variante int8 sustituye el prefill/decode por 1581 MB.
- GPU recomendadas: no se especifican modelos de datacenter (A100, H100); el empaquetado esta orientado a GPU integradas moviles (Metal en Apple M4 Max, OpenCL en Mali de Pixel 8a, OpenCL en Galaxy S26) y CPU.
- Cabe en dispositivos de consumo: validado en Pixel 8a (Tensor G3), Galaxy S26 (SM-S942Q) y Apple M4 Max.
- Opciones de despliegue: runtime LiteRT-LM (CLI con modo `--multi_turns`, API de conversacion en Python via `pip install litert-lm-api`, Kotlin y Swift). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras de latencia ni de throughput; la ventana de 3.467 s con avance de 2.933 s implica un procesamiento en tiempo real o superior, pero no se cuantifica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | WER LibriSpeech (20 clips) | Licencia | Formato |
|---|---|---|---|---|---|
| VibeVoice-ASR-Streaming-1.5B (LiteRT-LM) | 1.5B (LM) | 3.467 s por turno, 2048 tokens KV | 6.92-7.81 % (segun backend y cuantizacion) | MIT | `.litertlm` |
| VibeVoice-ASR-BitNet (LiteRT-LM, no streaming) | no disponible | ventana de 30 s | 2.68 % | MIT (segun repo litert-community) | `.litertlm` |
| VibeVoice-ASR-Streaming-1.5B (original Microsoft) | 1.5B (LM) | streaming | no publicado | MIT | pesos originales |
| Whisper large-v3 (referencia de la categoria) | 1.55B | ventana de 30 s, no streaming | no disponible en esta informacion | MIT | safetensors, GGUF, etc. |

La comparativa directa con alternativas de la misma categoria queda limitada por la ausencia de cifras publicadas para el modelo original de Microsoft y para Whisper en la informacion disponible. El dato mas relevante es la diferencia interna entre el modo streaming (~7 %) y el no streaming BitNet (2.68 %) sobre el mismo conjunto de evaluacion.

## Limitaciones y advertencias

- El modelo solo transcribe correctamente en modo multi-turno, un turno por ventana de audio; si se le pasa un clip completo en un solo turno devuelve unicamente los ultimos 3.5 segundos.
- No es adecuado para aplicaciones de chat que envian un clip por mensaje (por ejemplo, AI Edge Gallery); requiere un bucle de conversacion explicito.
- El WER de ~7 % en LibriSpeech dev-clean es sensiblemente superior al 2.68 % del bundle no streaming, lo que refleja el compromiso de precision del modo streaming.
- El presupuesto de 2048 tokens de cache KV limita cada conversacion a unos 2.5 minutos de audio continuo; para grabaciones mas largas es necesario reiniciar el contexto.
- La ventana final debe rellenarse con ceros hasta 83 200 muestras para evitar errores de forma.
- No se documentan sesgos conocidos, tasas de alucinacion ni comportamiento en dominios con ruido, acentos o audio telefonico.
- La licencia MIT permite uso comercial, pero el modelo base y el empaquetado deben verificarse por separado; el repositorio tiene 9.5 GB y solo 428 descargas y 2 likes en el momento de la consulta, lo que indica una adopcion temprana y poca validacion externa.
- La API de `litert-lm-api` cambio entre versiones (0.15-0.17.1 devuelven un diccionario de partes de contenido; versiones posteriores devuelven un `Message`), lo que exige codigo defensivo en produccion.
- No se documentan capacidades de tool calling, agentes ni vision; el modelo es exclusivamente audio-a-texto.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/VibeVoice-ASR-Streaming-1.5B
- Modelo base: https://huggingface.co/microsoft/VibeVoice-ASR-Streaming-1.5B
- Bundle no streaming VibeVoice-ASR-BitNet: https://huggingface.co/litert-community/VibeVoice-ASR-BitNet
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM

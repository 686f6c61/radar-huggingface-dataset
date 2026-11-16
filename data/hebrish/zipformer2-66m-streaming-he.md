# Hebrish/Zipformer2-66M-Streaming-He

## Resumen

Zipformer2-66M-Streaming-He es un modelo de reconocimiento automático del habla (ASR) en hebreo de tipo transducer, con arquitectura Zipformer2 y 66 millones de parámetros. Lo desarrolló originalmente Yakov Kolani y se entrenó sobre audio hebreo de ivrit.ai, partiendo de un Zipformer en inglés de icefall afinado para hebreo. Esta ficha corresponde al fork del proyecto Hebrish, publicado el 16 de noviembre de 2026, que en su primer commit es byte a byte idéntico al modelo upstream `ivrit-ai/zipformer2-66m-streaming-he` (a su vez espejo de `thewh1teagle/zipformer2-66m-streaming-he`); solo se ha añadido la sección de fork en la model card.

Su relevancia radica en que ofrece transcripción en streaming real, con decodificación en trozos de 1,28 s (64 frames) y contexto izquierdo de 256 frames, a un coste computacional muy bajo. Con 66 M de parámetros y exportaciones ONNX en int8 y fp16, está pensado para ejecutarse en dispositivos: navegador mediante onnxruntime-web y WASM, GPU integradas por WebGPU, Android y escritorio. Es el motor que usan las aplicaciones de Hebrish y live-transcribe.ivrit.ai para transcripción en el dispositivo.

La arquitectura es un transducer (encoder Zipformer2, predictor y joiner) con vocabulario SentencePiece de 1493 tokens y entrada de features fbank de 80 dimensiones a 16 kHz mono. La licencia es CC BY 4.0, igual que la del upstream, lo que permite uso comercial con atribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Zipformer2 transducer (encoder + decoder/predictor + joiner), causal, streaming |
| Parámetros totales | 66 M (aproximado, según el nombre del modelo) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | contexto izquierdo de 256 frames; chunk de 64 frames (1,28 s) |
| Tipos de cuantización | int8 (export sherpa-onnx), fp32 y fp16 (export ONNX adicional) |
| Idiomas soportados | hebreo (he); inglés muy limitado |
| Licencia | CC BY 4.0 |
| Formato de pesos | `model.pt` (checkpoint icefall/PyTorch), ONNX (encoder, decoder, joiner en int8, fp32 y fp16), `tokens.txt`, `config.json` |

## Arquitectura y entrenamiento

El modelo es un transducer Zipformer2 con configuración de seis etapas de encoder: `num_encoder_layers` de 2,2,3,4,3,2; `downsampling_factor` de 1,2,4,8,4,2; `feedforward_dim` de 512,768,1024,1536,1024,768; `num_heads` de 4,4,4,8,4,4; `encoder_dim` de 192,256,384,512,384,256; y `encoder_unmasked_dim` de 192,192,256,256,256,192. El kernel del módulo CNN es de 31,31,15,15,15,31. Las dimensiones por cabeza son 32 (query), 12 (value), 4 (posición) y 48 (pos_dim). El predictor tiene `decoder_dim` 512, el joiner 512 y `context_size` 2. El vocabulario SentencePiece es de 1493 tokens con blank en 0.

El entrenamiento parte de un Zipformer en inglés de icefall (el checkpoint streaming de LibriSpeech de Zengwei) y se afina sobre audio hebreo de ivrit.ai. El modelo es causal, con chunk de 64 frames (1,28 s) y contexto izquierdo de 256 frames, lo que permite decodificar mientras llega el audio. La model card no detalla el número de horas de audio, la composición exacta del dataset ni si hubo etapas de RLHF o DPO; esos datos no están disponibles. Las exportaciones ONNX adicionales (fp32 y fp16) las añadió ivrit.ai sobre el mismo `model.pt`, con entradas y salidas idénticas a las del export int8 de sherpa-onnx, de modo que son intercambiables.

## Capacidades

- Reconocimiento de voz en hebreo en modo streaming, con decodificación por chunks de 1,28 s.
- Transcripción offline de utterances completas (los resultados de WER publicados son offline salvo indicación).
- Exportaciones ONNX listas para sherpa-onnx y onnxruntime, incluidas variantes fp32 y fp16 para WebGPU y CUDA.
- Ejecución en navegador con onnxruntime-web y backend WASM (int8) o WebGPU (fp16).
- Ejecución en Android y escritorio a través de las aplicaciones de Hebrish.
- Salida de texto con tokenizador SentencePiece; no se documentan capacidades de puntuación, diarización ni timestamps.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente ASR.
- Capacidad multilingüe muy limitada: solo hebreo; el inglés se transcribe débilmente, deletreando letra a letra.

## Casos de uso

- Transcripción en vivo en el navegador: live-transcribe.ivrit.ai usa el export int8 con WASM para transcribir audio del micrófono sin enviar datos a un servidor, gracias al chunk de 1,28 s y al bajo coste del modelo.
- Teclado y dictado en Android y escritorio: las aplicaciones de Hebrish cargan los ficheros int8 de `sherpa-onnx/` como modelo exclusivo de hebreo cuando el teclado está configurado en ese idioma, descargándolos desde su CDN.
- Subtitulado en directo de reuniones o clases en hebreo: el modo causal y el contexto izquierdo de 256 frames permiten emitir texto parcial mientras se habla, con latencia de aproximadamente un chunk.
- Transcripción de notas de voz de WhatsApp: el modelo obtiene 8,9 % de WER en eval-whatsapp, por lo que es adecuado para convertir mensajes de voz en texto en aplicaciones de mensajería.
- Procesamiento por lotes de archivos de audio en hebreo: con el export fp32 o fp16 en onnxruntime y GPU, se puede transcribir un corpus completo con una calidad (5,1 % de WER en eval-d1) cercana a la de sistemas comerciales como Soniox.
- Integración en dispositivos de bajo consumo: con 66 M de parámetros y cuantización int8, cabe en GPUs integradas y en móviles, lo que habilita asistentes de voz locales sin conexión.
- Preprocesado de audio para pipelines de NLP en hebreo: la transcripción sirve como entrada para búsqueda, resumen o análisis de sentimiento sobre contenido hablado.

## Benchmarks y rendimiento

WER en porcentaje (menor es mejor) sobre los conjuntos de test de ivrit.ai con la normalización del leaderboard. Todas las cifras son offline (utterance completa) salvo donde se indica streaming.

| Modelo | eval-d1 ↓ | eval-whatsapp ↓ |
|---|---|---|
| Soniox | 4,8 | 9,0 |
| zipformer2-66m-streaming-he (este modelo) | 5,1 | 8,9 |
| ivrit-ai/whisper-large-v3-turbo | 5,3 | 7,1 |
| parakeet-tdt-0.6b-v3-he | 6,1 | 8,8 |
| openai/whisper-large-v3-turbo | 8,4 | 12,8 |
| NVIDIA nemotron-3.5-asr-streaming-0.6b (streaming) | 17,1 | 36,5 |

El export int8 de sherpa-onnx obtiene 5,3 / 8,8. En 15 clips de eval-whatsapp, int8 y fp32 puntuaron 9,31 % y 9,40 % de WER respectivamente, por lo que la cuantización int8 no introduce pérdida medible. En navegador (onnxruntime-web 1.30), el export int8 sobre WASM fue aproximadamente tan rápido como fp16 sobre WebGPU en una GPU integrada, con la mitad de descarga.

## Requisitos de hardware

- VRAM estimada: muy baja; con 66 M de parámetros, el modelo en fp32 ocupa del orden de 0,26 GB y en int8 alrededor de 0,07 GB, más el estado del encoder en streaming. No se publican cifras exactas de memoria en la model card.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU y en GPUs integradas. Para fp16 se recomienda una GPU con soporte WebGPU o CUDA.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, etc.) y en hardware móvil; el despliegue principal es en dispositivo.
- Opciones de despliegue: sherpa-onnx (recomendado, con los ficheros int8), onnxruntime (fp32/fp16), onnxruntime-web con WASM o WebGPU, y aplicaciones de Hebrish en Android y escritorio. El checkpoint `model.pt` se puede usar con icefall.
- Latencia y throughput: la decodificación es por chunks de 1,28 s con contexto izquierdo de 256 frames; no se publican cifras de latencia ni de RTF en la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / modo | WER eval-d1 | WER eval-whatsapp | Licencia |
|---|---|---|---|---|---|
| zipformer2-66m-streaming-he (este) | 66 M | streaming, chunk 1,28 s | 5,1 | 8,9 | CC BY 4.0 |
| ivrit-ai/whisper-large-v3-turbo | no disponible (turbo) | offline | 5,3 | 7,1 | no disponible |
| parakeet-tdt-0.6b-v3-he | 0,6 B | no disponible | 6,1 | 8,8 | no disponible |
| NVIDIA nemotron-3.5-asr-streaming-0.6b | 0,6 B | streaming | 17,1 | 36,5 | no disponible |

Frente a los modelos de 0,6 B, este Zipformer2 obtiene mejor WER con un orden de magnitud menos de parámetros, lo que lo hace adecuado para ejecución en dispositivo. Frente a whisper-large-v3-turbo de ivrit.ai, la calidad es comparable en eval-d1 y algo peor en eval-whatsapp, pero con un coste muy inferior y capacidad de streaming nativa.

## Limitaciones y advertencias

- El inglés es débil: se transcribe deletreando letra a letra.
- Los números aparecen de forma inconsistente, como palabras o como dígitos.
- Solo cubre hebreo; no es un modelo multilingüe.
- No se documentan sesgos concretos ni tasas de alucinación; como todo ASR, puede producir transcripciones plausibles pero incorrectas en audio ruidoso o con acentos no vistos.
- La licencia CC BY 4.0 permite uso comercial con atribución; es necesario citar al autor original (Yakov Kolani) y a ivrit.ai.
- Este fork no introduce cambios en los pesos en su primer commit; cualquier fine-tune futuro del proyecto Hebrish se listará en la model card.
- La información sobre datos de entrenamiento (horas de audio, composición) no está disponible en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hebrish/Zipformer2-66M-Streaming-He
- Modelo base (upstream): https://huggingface.co/ivrit-ai/zipformer2-66m-streaming-he
- Repositorio original de Yakov Kolani: https://huggingface.co/thewh1teagle/zipformer2-66m-streaming-he
- Checkpoint inglés de icefall: https://huggingface.co/Zengwei/icefall-asr-librispeech-streaming-zipformer-2023-05-17
- ivrit.ai: https://www.ivrit.ai
- Leaderboard de transcripción en hebreo: https://huggingface.co/spaces/ivrit-ai/hebrew-transcription-leaderboard
- Transcripción en vivo: https://live-transcribe.ivrit.ai
- Aplicaciones de Hebrish: https://hebrish.app
- icefall (código de entrenamiento): https://github.com/k2-fsa/icefall
- CDN de modelos de Hebrish: https://cdn.hebrish.app/models/ivrit-zipformer-he/latest.json

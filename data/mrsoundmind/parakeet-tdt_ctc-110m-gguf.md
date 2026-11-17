# mrsoundmind/parakeet-tdt_ctc-110m-gguf

## Resumen

`parakeet-tdt_ctc-110m-gguf` es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) `nvidia/parakeet-tdt_ctc-110m`, desarrollado originalmente por los equipos de NVIDIA NeMo y Suno.ai. El modelo realiza transcripción de voz a texto en inglés con puntuación y mayúsculas, y está pensado para ejecutarse de forma totalmente offline y local mediante la librería transcribe.cpp, sin necesidad de Python ni de la pila de NeMo.

La relevancia de esta conversión radica en que reduce un modelo ASR de 114 millones de parámetros a ficheros de entre 90 MB y 457 MB según cuantización, manteniendo un WER de 2,43 % en LibriSpeech test-clean en F32, F16 y Q8_0, y degradando solo hasta 2,53 % en Q4_K_M. Esto lo convierte en una opción práctica para transcripción en dispositivos de gama baja, incluyendo CPU y GPU integradas, con factores de tiempo real (RTF) muy elevados.

El modelo base emplea una arquitectura FastConformer con atención completa y un decodificador transducer TDT/RNNT (la cabeza CTC auxiliar del checkpoint híbrido original se descarta durante la conversión). No es un modelo de streaming, no traduce y solo soporta inglés. La licencia heredada del modelo base es CC-BY-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + TDT/RNNT transducer (decoder); cabeza CTC descartada en la conversion |
| Parametros totales | 114.113.670 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en tokens; el modelo base transcribe hasta 20 minutos de audio en una sola pasada (atencion completa) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo base es un FastConformer híbrido TDT-CTC de aproximadamente 114 M de parámetros, entrenado por NVIDIA NeMo y Suno.ai. El encoder FastConformer utiliza atención completa, lo que permite procesar hasta 20 minutos de audio en una única pasada sin segmentación. El decodificador es un transducer TDT (Token-and-Duration Transducer) con una cabeza CTC auxiliar en el checkpoint original; la conversión a GGUF conserva únicamente el decodificador TDT/RNNT y elimina la cabeza CTC. El modelo transcribe con puntuación y mayúsculas (PnC) para inglés.

La conversión fue realizada por mrsoundmind a partir del commit upstream `431a349` (fijado el 2026-05-10) y validada contra la referencia de NeMo en el commit `42528dd` de transcribe.cpp el 2026-05-10. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. El modelo base reporta un RTFx medio de aproximadamente 5300 en los conjuntos de evaluación del leaderboard de Hugging Face sobre A100.

## Capacidades

- Transcripción de voz a texto en inglés con puntuación y mayúsculas automáticas.
- Reconocimiento de habla offline, sin dependencia de servicios en la nube.
- Procesamiento de audio de hasta 20 minutos en una sola pasada (según el modelo base, gracias a la atención completa del FastConformer).
- Generación de timestamps a nivel de token (según la configuración `timestamps: token` de transcribe.cpp).
- Ejecución en CPU y GPU mediante transcribe.cpp (backend Metal en Apple Silicon, Vulkan en GPUs compatibles, CPU nativa).
- No soporta streaming (`streaming: false`).
- No soporta traducción (`translate: false`).
- No soporta detección de idioma (`lang_detect: false`).
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de capacidades multimodales más allá del audio de entrada.

## Casos de uso

- Transcripción de reuniones y notas de voz en local: el modelo procesa audio de hasta 20 minutos en una sola pasada y genera texto con puntuación y mayúsculas, adecuado para actas automáticas sin enviar datos a la nube.
- Subtitulado de vídeos y podcasts en inglés: gracias a los timestamps a nivel de token y al bajo WER (2,43 % en LibriSpeech test-clean), se pueden generar subtítulos sincronizados con precisión aceptable para contenido en inglés.
- Transcripción en dispositivos de gama baja: la cuantización Q4_K_M ocupa 90 MB y mantiene un WER de 2,53 %, lo que permite ejecutarlo en CPUs modestas (RTF 23,5 en Ryzen 4750U) o en GPUs integradas con Vulkan (RTF 32,5).
- Procesamiento por lotes de archivos de audio: la CLI de transcribe.cpp acepta ficheros WAV de 16 kHz mono, lo que facilita pipelines de conversión masiva con ffmpeg como preprocesado.
- Aplicaciones de accesibilidad: dictado y transcripción en tiempo casi real en equipos sin GPU dedicada, gracias a los RTF elevados en CPU (116 en Apple M4 Max) y en Metal (347,5).
- Integración en herramientas de escritorio y edge computing: el formato GGUF y la ausencia de dependencias de Python permiten embeber el modelo en aplicaciones nativas o contenedores ligeros.
- Investigación y evaluación de ASR: como conversión fiel del checkpoint de NVIDIA con WER validado contra la referencia de NeMo, sirve para reproducir resultados y comparar cuantizaciones en entornos sin NeMo.

## Benchmarks y rendimiento

WER medido sobre la totalidad de LibriSpeech test-clean (2620 utterances) con decodificación greedy TDT/RNN-T y sin LM externo. La referencia F32 es 2,43 %; NVIDIA reporta 2,40 % en la misma partición.

| Cuantizacion | Tamano | WER LibriSpeech test-clean |
|---|---:|---:|
| F32 | 457 MB | 2,43 % |
| F16 | 229 MB | 2,43 % |
| Q8_0 | 135 MB | 2,43 % |
| Q6_K | 112 MB | 2,44 % |
| Q5_K_M | 101 MB | 2,47 % |
| Q4_K_M | 90 MB | 2,53 % |

Factores de tiempo real (RTF) reportados por el autor:

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 347,5 |
| Apple M4 Max | CPU | 116 |
| AMD Ryzen 4750U | Vulkan | 32,5 |
| AMD Ryzen 4750U | CPU | 23,5 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, al tratarse de un modelo ASR.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: entre 90 MB (Q4_K_M) y 457 MB (F32) de pesos; el consumo real añade overhead del runtime y buffers de audio, por lo que conviene reservar al menos 0,5-1 GB.
- GPU recomendadas: cualquier GPU compatible con Vulkan o Metal; no se requieren GPU de datacenter. El modelo base reporta RTFx de ~5300 sobre A100 con NeMo, pero la conversión GGUF está orientada a ejecución local.
- Cabe en cualquier GPU consumer e integrada: los pesos Q4_K_M (90 MB) y Q8_0 (135 MB) son compatibles con iGPUs y GPUs de gama baja.
- Opciones de despliegue: transcribe.cpp (CLI `transcribe-cli`), con backends Metal, Vulkan y CPU. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: RTF de 347,5 en Metal (M4 Max), 116 en CPU (M4 Max), 32,5 en Vulkan (Ryzen 4750U) y 23,5 en CPU (Ryzen 4750U); valores superiores a 1 indican procesamiento más rápido que tiempo real.
- Requisito de entrada: audio WAV mono a 16 kHz; para otros formatos hay que convertir con ffmpeg (`-ar 16000 -ac 1`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | Formato | WER LibriSpeech test-clean |
|---|---|---|---:|---|---|---:|
| parakeet-tdt_ctc-110m-gguf (esta ficha) | 114 M | hasta 20 min (modelo base) | en | CC-BY-4.0 | GGUF | 2,43 % (F32) |
| nvidia/parakeet-tdt_ctc-110m (original) | 114 M | hasta 20 min | en | CC-BY-4.0 | NeMo (.nemo) | 2,40 % (reportado por NVIDIA) |
| Whisper large-v3 | no disponible en la informacion | no disponible en la informacion | multilingue | MIT (segun el proyecto Whisper) | no disponible en la informacion | no disponible en la informacion |
| Whisper small | no disponible en la informacion | no disponible en la informacion | multilingue | MIT (segun el proyecto Whisper) | no disponible en la informacion | no disponible en la informacion |

Nota: los datos de Whisper no se han incluido con cifras porque no aparecen en la información proporcionada; se citan solo como alternativas de categoría. La comparación cuantitativa fiable disponible es únicamente frente al checkpoint original de NVIDIA.

## Limitaciones y advertencias

- Solo soporta inglés; no traduce ni detecta idioma automáticamente.
- No es un modelo de streaming: requiere el audio completo (o segmentos) antes de transcribir.
- Riesgo de errores en nombres propios, acrónimos, jerga y audio con ruido o acentos no representados en el entrenamiento; el WER de 2,43 % corresponde a LibriSpeech test-clean, un conjunto relativamente limpio.
- La cuantización Q4_K_M degrada el WER de 2,43 % a 2,53 %; para producción con requisitos estrictos se recomienda Q8_0 o superior.
- No dispone de detección de idioma, tool calling ni capacidades de agente; no debe presentarse como un modelo conversacional.
- Licencia CC-BY-4.0: permite uso comercial con atribución; es necesario citar al autor original (NVIDIA/Suno.ai) y respetar los términos del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la ficha, y la conversión es de un tercero (mrsoundmind), no oficial de NVIDIA; conviene validar el comportamiento en el dominio propio antes de desplegar.
- Requiere audio WAV mono a 16 kHz; no acepta directamente MP3, estéreo ni otras frecuencias sin preprocesado.
- La fecha de creación del repositorio (2026-11-17) y los commits referenciados son posteriores a la información de entrenamiento del modelo base; verificar la vigencia de los enlaces.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/mrsoundmind/parakeet-tdt_ctc-110m-gguf
- Modelo base en Hugging Face: https://huggingface.co/nvidia/parakeet-tdt_ctc-110m
- Commit upstream del modelo base: https://huggingface.co/nvidia/parakeet-tdt_ctc-110m/commit/431a349
- Repositorio transcribe.cpp: https://github.com/mrsoundmind/transcribe.cpp
- NVIDIA NeMo: https://github.com/NVIDIA/NeMo
- Documentación de FastConformer en NeMo: https://docs.nvidia.com/deeplearning/nemo/user-guide/docs/en/main/asr/models.html#fast-conformer
- Suno.ai: https://www.suno.ai/
- Paper FastConformer (arxiv:2305.05084): https://arxiv.org/abs/2305.05084
- Paper TDT (arxiv:2304.06795): https://arxiv.org/abs/2304.06795
- Paper RNNT (arxiv:2104.02821): https://arxiv.org/abs/2104.02821
- Descarga directa F32: https://huggingface.co/mrsoundmind/parakeet-tdt_ctc-110m-gguf/resolve/main/parakeet-tdt_ctc-110m-F32.gguf
- Descarga directa F16: https://huggingface.co/mrsoundmind/parakeet-tdt_ctc-110m-gguf/resolve/main/parakeet-tdt_ctc-110m-F16.gguf
- Descarga directa Q8_0: https://huggingface.co/mrsoundmind/parakeet-tdt_ctc-110m-gguf/resolve/main/parakeet-tdt_ctc-110m-Q8_0.gguf
- Descarga directa Q6_K: https://huggingface.co/mrsoundmind/parakeet-tdt_ctc-110m-gguf/resolve/main/parakeet-tdt_ctc-110m-Q6_K.gguf
- Descarga directa Q5_K_M: https://huggingface.co/mrsoundmind/parakeet-tdt_ctc-110m-gguf/resolve/main/parakeet-tdt_ctc-110m-Q5_K_M.gguf
- Descarga directa Q4_K_M: https://huggingface.co/mrsoundmind/parakeet-tdt_ctc-110m-gguf/resolve/main/parakeet-tdt_ctc-110m-Q4_K_M.gguf

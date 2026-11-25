# GhaythMahadin/multitalker-parakeet-streaming-0.6b-v1-gguf

## Resumen

multitalker-parakeet-streaming-0.6b-v1 en formato GGUF es una conversión del modelo de reconocimiento automático del habla (ASR) `nvidia/multitalker-parakeet-streaming-0.6b-v1`, publicada por el usuario GhaythMahadin para su uso con el runtime `transcribe.cpp`. Se trata de un sistema de transcripción de voz a texto en inglés, con puntuación y capitalización, que combina un encoder FastConformer cache-aware (pensado para streaming de baja latencia) con un decoder transducer RNN-T. El modelo base fue ajustado a partir de `nvidia/nemotron-speech-streaming-en-0.6b` y suma 739.989.513 parámetros.

La particularidad del modelo es el soporte de diarización integrada: las variantes "bundle" incorporan además el diarizador `nvidia/diar_streaming_sortformer_4spk-v2.1`, lo que permite transcribir hasta cuatro hablantes solapados y etiquetar cada segmento con su interlocutor. El encoder conserva la máscara de atención cache-aware original con `att_context_size=[70, 13]` (1,12 s de contexto), y las cuatro configuraciones de lookahead de latencia del modelo upstream son seleccionables.

Es relevante para desarrolladores porque ofrece un pipeline ASR completo (transcripción, marcas de tiempo a nivel de token y diarización) en un único fichero GGUF de entre 617 MB y 2,96 GB, ejecutable en CPU con `transcribe.cpp` y con rendimiento en tiempo real muy por encima de 1x. La licencia es la NVIDIA Open Model License, no una licencia de código abierto permisiva estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer cache-aware (encoder) + RNN-T transducer (decoder); diarizador Sortformer en variantes bundle |
| Parametros totales | 739.989.513 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Atención cache-aware con `att_context_size=[70, 13]` (1,12 s de contexto efectivo); cuatro ajustes de lookahead seleccionables |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | Inglés (en) |
| Licencia | NVIDIA Open Model License (nvidia-open-model-license) |
| Formato de pesos | GGUF (runtime transcribe.cpp) |
| Tamano del repo | 1,5 GB |
| Pipeline | automatic-speech-recognition |
| Modelo base | nvidia/multitalker-parakeet-streaming-0.6b-v1 (commit 8749fc7, fijado 2026-07-12) |
| Streaming | Sí (cache-aware) |
| Diarizacion | Sí, hasta 4 hablantes (variantes bundle con `--diarize`) |
| Marcas de tiempo | A nivel de token |
| Traduccion | No |
| Deteccion de idioma | No |

## Arquitectura y entrenamiento

El modelo es un sistema ASR híbrido de dos componentes. El encoder es un FastConformer con atención cache-aware: mantiene un estado de caché que permite procesar audio de forma incremental sin recalcular el contexto completo, con una ventana de atención de `[70, 13]` que corresponde a 1,12 s. Esto habilita transcripción en streaming con latencia controlada y cuatro niveles de lookahead seleccionables. El decoder es un transducer RNN-T, que modela conjuntamente alineamiento y emisión de tokens, lo que permite decodificación greedy token a token y marcas de tiempo a nivel de token.

El modelo base fue ajustado desde `nvidia/nemotron-speech-streaming-en-0.6b`. La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; esos datos no están disponibles en la información proporcionada. La innovación destacable es la integración de diarización streaming mediante Sortformer en las variantes bundle, que se ejecutan con el flag `--diarize` y producen transcripciones etiquetadas por hablante para hasta cuatro interlocutores solapados. La conversión a GGUF fue validada contra la referencia NeMo en el commit 3083021 de transcribe.cpp el 2026-08-03.

## Capacidades

- Transcripción de voz a texto en inglés con puntuación y capitalización automáticas (PnC).
- Streaming cache-aware: procesa audio incrementalmente con latencia configurable mediante cuatro ajustes de lookahead.
- Diarización de hablantes hasta 4 interlocutores solapados (solo variantes bundle, con `--diarize`).
- Marcas de tiempo a nivel de token.
- Decodificación greedy RNN-T.
- Modo `single_speaker_mode` para transcripción de un único hablante sin diarización.
- Ejecución en CPU y aceleración por GPU (Metal, Vulkan) a través de transcribe.cpp.
- No soporta traducción ni detección de idioma.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente ASR.

## Casos de uso

- Transcripción de reuniones con múltiples participantes: usando la variante bundle con `--diarize`, el modelo genera una transcripción etiquetada por hablante (hasta cuatro) en reuniones grabadas o en directo, con un cpWER de 19,35% en AMI-IHM test en modo kernel.
- Subtitulado en directo de baja latencia: el encoder cache-aware con lookahead configurable y marcas de tiempo a nivel de token permite generar subtítulos sincronizados en emisiones o videollamadas.
- Actas automáticas de entrevistas: la combinación de PnC y diarización facilita actas legibles con atribución de intervenciones sin post-procesado manual.
- Dictado y notas de voz en aplicaciones de escritorio: la cuantización Q4_K_M (617 MB) cabe en cualquier equipo y se ejecuta en CPU con un RTF de 13,41 en Ryzen 4750U (unas 13 veces más rápido que tiempo real).
- Transcripción por lotes de archivos de audio en pipelines de datos: el modelo offline con WER del 2,18% en LibriSpeech test-clean es adecuado para generar corpus etiquetados o indexar archivos de audio.
- Asistentes de voz locales y privados: al ejecutarse con transcribe.cpp en CPU o GPU de consumo, permite transcripción on-device sin enviar audio a servicios externos.
- Análisis de llamadas de atención al cliente: la diarización permite separar agente y cliente en grabaciones y alimentar analítica de conversaciones.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| WER LibriSpeech test-clean, F32 | 2,19% |
| WER LibriSpeech test-clean, F16 | 2,19% |
| WER LibriSpeech test-clean, Q8_0 | 2,18% |
| WER LibriSpeech test-clean, Q6_K | 2,20% |
| WER LibriSpeech test-clean, Q5_K_M | 2,18% |
| WER LibriSpeech test-clean, Q4_K_M | 2,18% |
| WER FLEURS en, Q8_0 | 6,52% |
| cpWER AMI-IHM test, modo kernel, bundle F32 | 19,35% |
| cpWER AMI-IHM test, modo masked, bundle F32 | 23,73% |
| RTF en M4 Max, CPU | 32,72 |
| RTF en M4 Max, Metal | 217,47 |
| RTF en Ryzen 4750U, CPU | 13,41 |
| RTF en Ryzen 4750U, Vulkan | 26,34 |

Los WER de LibriSpeech se midieron sobre la partición completa test-clean (2.620 utterances), batch size 1, sin marcas de tiempo, decodificación greedy RNN-T y normalización whisper (sin PnC). La referencia NeMo en `single_speaker_mode` y el dato autodeclarado por NVIDIA coinciden ambos en 2,19%. Para AMI-IHM, la referencia NeMo equivalente obtiene 21,39% en modo kernel y 24,00% en modo masked, ligeramente peores que esta conversión. El RTF se expresa como múltiplo de tiempo real: valores más altos indican mayor velocidad.

## Requisitos de hardware

- VRAM estimada: no disponible como cifra de VRAM; el tamaño del fichero GGUF es la referencia práctica: 2,96 GB (F32), 1,48 GB (F16), 873 MB (Q8_0), 743 MB (Q6_K), 681 MB (Q5_K_M), 617 MB (Q4_K_M). Las variantes bundle añaden el diarizador embebido (F32, F16 o Q8_0 según el tier).
- GPU recomendadas: no se especifican modelos concretos en la información disponible. Se documenta aceleración Metal (Apple Silicon, M4 Max) y Vulkan (AMD Ryzen 4750U).
- Cabe en GPU de consumo: sí, todas las cuantizaciones caben holgadamente en GPUs de consumo; incluso la F32 de 2,96 GB es apta para tarjetas con 4 GB o más.
- Opciones de despliegue: `transcribe.cpp` (runtime principal, con backend CPU, Metal y Vulkan). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: RTF de 13,41 (CPU Ryzen 4750U), 26,34 (Vulkan Ryzen 4750U), 32,72 (CPU M4 Max) y 217,47 (Metal M4 Max). En el peor caso documentado, la transcripción es más de 13 veces más rápida que tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / streaming | WER LibriSpeech test-clean | Diarizacion | Licencia | Formato |
|---|---|---|---|---|---|---|
| multitalker-parakeet-streaming-0.6b-v1 (este, GGUF) | 739,99 M | Cache-aware, 1,12 s, streaming | 2,18% (Q4_K_M) | Sí, hasta 4 hablantes | NVIDIA Open Model License | GGUF |
| nvidia/multitalker-parakeet-streaming-0.6b-v1 (original) | 739,99 M | Cache-aware, streaming | 2,19% (referencia NeMo) | Sí, hasta 4 hablantes | NVIDIA Open Model License | NeMo |
| nvidia/nemotron-speech-streaming-en-0.6b | no disponible | Streaming | no disponible | No | NVIDIA Open Model License | NeMo |
| nvidia/diar_streaming_sortformer_4spk-v2.1 | no disponible | Streaming | No aplica (diarizador) | Sí, hasta 4 hablantes | NVIDIA Open Model License | NeMo |

La comparativa se limita a los modelos citados en la información disponible; no se aportan datos de alternativas de otros fabricantes (Whisper, etc.) porque no están documentados en la fuente.

## Limitaciones y advertencias

- Solo soporta inglés; no hay detección de idioma ni traducción.
- El WER se degrada en audio con ruido o conversaciones solapadas: en AMI-IHM (reuniones reales) el cpWER sube al 19,35% en modo kernel y al 23,73% en modo masked, frente al 2,18% en LibriSpeech limpio.
- La diarización está limitada a cuatro hablantes como máximo.
- La licencia NVIDIA Open Model License no es una licencia de código abierto permisiva estándar; conviene revisar sus términos antes de uso comercial o redistribución.
- No se documentan sesgos específicos ni tasas de alucinación en la información proporcionada.
- El modelo está validado contra NeMo en un commit concreto de transcribe.cpp; cambios de versión del runtime pueden alterar resultados.
- Las cifras de WER sin commit asociado fueron publicadas antes de registrar la procedencia, según la propia model card.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de adopción en producción.
- El modelo es puramente ASR: no soporta tool calling, agentes ni razonamiento multi-paso.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/GhaythMahadin/multitalker-parakeet-streaming-0.6b-v1-gguf
- Modelo base: https://huggingface.co/nvidia/multitalker-parakeet-streaming-0.6b-v1
- Commit del modelo base usado: https://huggingface.co/nvidia/multitalker-parakeet-streaming-0.6b-v1/commit/8749fc7
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/3083021
- Diarizador Sortformer: https://huggingface.co/nvidia/diar_streaming_sortformer_4spk-v2.1
- Licencia NVIDIA Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-open-model-license/
- Papers referenciados en los tags: arXiv:2506.22646, arXiv:2408.13106, arXiv:2305.05084, arXiv:2409.06656, arXiv:2507.18446, arXiv:1706.03762, arXiv:2310.12371

# lipik/Voxtral-Mini-4B-Realtime-2602-gguf

## Resumen

Voxtral-Mini-4B-Realtime-2602 es un modelo de reconocimiento automatico del habla (ASR) nativamente en streaming desarrollado por Mistral AI. Esta ficha concreta corresponde a la conversion a formato GGUF publicada por el usuario lipik (con pesos alojados en el repositorio handy-computer) para su uso con transcribe.cpp, un runtime de inferencia en C/C++ orientado a modelos de transcripcion. El modelo resuelve el problema de la transcripcion de voz con baja latencia: es capaz de emitir texto de forma incremental mientras se recibe el audio, con retardos configurables entre 240 ms y 2,4 s.

La arquitectura combina un codificador de audio causal de aproximadamente 970M parametros (stem convolucional causal con left-pad, transformer de 32 capas con RoPE de ventana deslizante) y un proyector que agrupa 4 tramas, cuyas embeddings se suman a un decodificador Ministral de aproximadamente 3,4B parametros (26 capas, GQA 32/8, RoPE NEOX) con condicionamiento por tokens de retardo. El resultado son 4.429.707.024 parametros totales que emiten un token de texto por cada franja de audio de 80 ms (12,5 Hz).

Es relevante ahora porque, segun la model card original, es una de las primeras soluciones abiertas que alcanza precision comparable a sistemas offline con un retardo inferior a 500 ms, soporta 13 idiomas con deteccion automatica y esta publicada bajo licencia Apache-2.0, lo que permite uso comercial. La conversion GGUF anade la posibilidad de ejecutarlo en hardware de consumo mediante cuantizacion, manteniendo el WER practicamente intacto hasta Q4_K_M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio-LLM en streaming: codificador de audio causal (~970M, stem conv causal + 32 capas transformer con RoPE de ventana deslizante) + proyector de 4 tramas + decodificador Ministral (~3,4B, 26 capas, GQA 32/8, RoPE NEOX) con condicionamiento por tokens de retardo |
| Parametros totales | 4.429.707.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en, fr, es, de, ru, zh, ja, it, pt, nl, ar, hi, ko (13 idiomas, deteccion automatica) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (para transcribe.cpp) |

## Arquitectura y entrenamiento

El modelo es un audio-LLM con arquitectura nativamente streaming, distinta de la familia Voxtral 2507 offline: tiene arquitectura propia, frontend de streaming, codificador causal y fusion aditiva de audio. El codificador procesa audio de 16 kHz mono mediante un stem convolucional causal con left-pad y un transformer de 32 capas con RoPE de ventana deslizante; sus salidas se agrupan en el proyector en grupos de 4 tramas y las embeddings resultantes se suman (fusion aditiva) a las del decodificador de texto Ministral de 26 capas. El decodificador incorpora condicionamiento por tokens de retardo, lo que permite ajustar el equilibrio entre latencia y precision, y emite un token de texto por cada franja de audio de 80 ms (12,5 Hz).

El modelo admite tanto transcripcion incremental en streaming (con parametros `--stream-chunk-ms` y `--stream-voxtral-delay` para configurar latencia y calidad) como transcripcion offline, con transcripcion final identica byte a byte entre ambos modos. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La conversion GGUF esta anclada al commit upstream 2769294 (fijado el 2026-06-06) y validada contra la referencia de Transformers en el commit 483c122 de transcribe.cpp.

## Capacidades

- Transcripcion de voz a texto en streaming con latencia configurable entre 240 ms y 2,4 s.
- Transcripcion offline con transcripcion final identica a la del modo streaming.
- Deteccion automatica de idioma entre 13 idiomas: ingles, frances, espanol, aleman, ruso, chino, japones, italiano, portugues, neerlandes, arabe, hindi y coreano.
- Entrada de audio en WAV mono a 16 kHz (conversion previa desde otros formatos mediante ffmpeg).
- Emision de un token de texto cada 80 ms de audio (12,5 Hz), con throughput superior a 12,5 tokens por segundo segun la model card original.
- No soporta traduccion (`translate: false` en la metadata de transcribe.cpp).
- No genera marcas de tiempo (`timestamps: none` en la metadata de transcribe.cpp).
- No se documentan en la informacion disponible capacidades de tool calling, agentes ni vision.

## Casos de uso

- Subtitulado en directo: el modelo puede generar subtitulos incrementales con un retardo de 480 ms, suficiente para retransmisiones en vivo, y ajustar la latencia con `--stream-voxtral-delay` segun la tolerancia del evento.
- Asistentes de voz: al emitir texto cada 80 ms y operar con latencia inferior a 500 ms, permite conversaciones por turnos con respuesta casi inmediata en aplicaciones de voz integradas.
- Transcripcion de reuniones multilingues: la deteccion automatica de idioma entre 13 lenguas permite procesar sesiones donde los participantes alternan idiomas sin configurar el idioma manualmente.
- Atencion al cliente telefonica: la transcripcion en tiempo real del audio de la llamada facilita el analisis y la generacion de resumenes posteriores, ejecutable en hardware modesto gracias a la cuantizacion Q4_K_M de 2,83 GB.
- Despliegue en dispositivo: con Q4_K_M (2,83 GB) o Q5_K_M (3,28 GB) el modelo cabe en equipos de consumo; la model card reporta RTF de 8,6 en Metal sobre un M4 Max y 0,9 en Vulkan sobre un Ryzen 4750U, es decir, mas rapido que tiempo real en ambos casos.
- Procesamiento por lotes de archivos de audio: el modo offline con tamano de lote 8 permite transcribir grandes volumenes de grabaciones manteniendo la misma calidad que el modo streaming.
- Accesibilidad: generacion de transcripciones en vivo para personas con discapacidad auditiva en entornos presenciales o videoconferencias, con la ventaja de que el modelo puede ejecutarse localmente sin enviar audio a servicios externos.

## Benchmarks y rendimiento

WER sobre LibriSpeech test-clean completo (2620 enunciados, normalizador de texto en ingles de Whisper, ruta offline, lote de tamano 8 en una NVIDIA L40S):

| Cuantizacion | Tamano | WER (LibriSpeech test-clean) |
|---|---:|---:|
| BF16 | 8,87 GB | 2,08% |
| F16 | 8,88 GB | 2,09% |
| Q8_0 | 4,73 GB | 2,07% |
| Q6_K | 3,66 GB | 2,08% |
| Q5_K_M | 3,28 GB | 2,08% |
| Q4_K_M | 2,83 GB | 2,08% |

La referencia de HuggingFace Transformers en la misma maquina (VoxtralRealtimeForConditionalGeneration, BF16, greedy) obtiene 2,08%, identico al GGUF BF16. Todas las cuantizaciones publicadas quedan dentro del ruido bootstrap (2,07-2,09%), por lo que la escalera de cuantizacion es neutra en WER hasta Q4_K_M. El WER publicado es solo para ingles; no se han publicado resultados de benchmarks para los otros 12 idiomas en la informacion disponible.

Rendimiento de velocidad (RTF, factor de tiempo real):

| Hardware | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 8,6 |
| Apple M4 Max | CPU | 2,5 |
| AMD Ryzen 4750U | Vulkan | 0,9 |
| AMD Ryzen 4750U | CPU | 0,6 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8,9 GB en BF16/F16, 4,7 GB en Q8_0, 3,7 GB en Q6_K, 3,3 GB en Q5_K_M y 2,8 GB en Q4_K_M (tamanos de archivo como cota inferior; el consumo real de memoria es algo superior).
- GPU recomendadas: NVIDIA L40S (usada para la medicion de WER), A100 o H100 para despliegues de alta concurrencia; Apple Silicon con Metal para estaciones de trabajo.
- Cabe en GPU de consumo: si, con cuantizaciones Q4_K_M a Q8_0 en tarjetas de 8 GB o mas; la model card original indica que esta optimizado para despliegue en dispositivo.
- Opciones de despliegue: transcribe.cpp (runtime oficial de esta conversion, con backends CPU, Metal y Vulkan). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: RTF de 8,6 (Metal, M4 Max), 2,5 (CPU, M4 Max), 0,9 (Vulkan, Ryzen 4750U) y 0,6 (CPU, Ryzen 4750U); throughput superior a 12,5 tokens por segundo segun la model card original. Retardo de transcripcion configurable entre 240 ms y 2,4 s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Streaming | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| Voxtral-Mini-4B-Realtime-2602 (esta ficha, GGUF) | 4,43B | no disponible | Si, 240 ms-2,4 s | 13 | Apache-2.0 | GGUF |
| Voxtral Mini 4B Realtime 2602 (original) | 4,43B | no disponible | Si, 240 ms-2,4 s | 13 | Apache-2.0 | BF16 (Transformers) |
| Voxtral 2507 (familia offline) | no disponible | no disponible | No | no disponible | no disponible | no disponible |
| Otros modelos ASR abiertos | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card original afirma que, con un retardo de 480 ms, el modelo iguala el rendimiento de los principales modelos de transcripcion offline de codigo abierto y de las APIs en tiempo real, y que supera a las lineas base abiertas existentes en diversas tareas, pero no se incluyen en la informacion proporcionada los nombres ni las cifras concretas de esos sistemas comparados.

## Limitaciones y advertencias

- El unico WER publicado corresponde a ingles (LibriSpeech test-clean); no hay datos de precision para los otros 12 idiomas.
- No soporta traduccion: transcribe en el idioma hablado, no traduce a otro idioma.
- No genera marcas de tiempo, lo que limita su uso en tareas que requieran alineacion temporal por palabra o segmento.
- La entrada debe ser WAV mono a 16 kHz; es necesario convertir el audio previamente con ffmpeg u otra herramienta.
- La model card no documenta sesgos conocidos, tasas de alucinacion ni el comportamiento en audio con ruido, acentos o solapamiento de hablantes; conviene validar estos aspectos en el dominio de produccion.
- La licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y conviene consultar la model card upstream para los terminos completos.
- Esta conversion GGUF esta anclada a un commit concreto del modelo base (2769294) y validada contra un commit concreto de transcribe.cpp (483c122); versiones posteriores del runtime pueden requerir reconversion.
- El ecosistema de despliegue esta limitado a transcribe.cpp; no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- El repositorio tiene un volumen de descargas muy bajo (35 en el momento de la consulta) y ningun "like", por lo que la validacion por parte de la comunidad es practicamente inexistente.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/lipik/Voxtral-Mini-4B-Realtime-2602-gguf
- Modelo base: https://huggingface.co/mistralai/Voxtral-Mini-4B-Realtime-2602
- Commit upstream del modelo base: https://huggingface.co/mistralai/Voxtral-Mini-4B-Realtime-2602/commit/2769294
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validacion de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/483c122
- Documentacion del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/voxtral-realtime.md
- Pesos GGUF (repositorio handy-computer): https://huggingface.co/handy-computer/Voxtral-Mini-4B-Realtime-2602-gguf
- Paper referenciado en los tags: arXiv:2602.11298 (no se dispone de URL directa en la informacion proporcionada)

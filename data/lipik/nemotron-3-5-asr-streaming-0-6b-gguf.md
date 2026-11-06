# lipik/nemotron-3.5-asr-streaming-0.6b-gguf

## Resumen

Nemotron 3.5 ASR Streaming 0.6B es un modelo de reconocimiento automático del habla (ASR) desarrollado por NVIDIA, publicado originalmente bajo el identificador `nvidia/nemotron-3.5-asr-streaming-0.6b`. Esta ficha describe la conversión a formato GGUF realizada por el usuario `lipik` para su uso con la librería `transcribe.cpp`, una implementación en C++ orientada a inferencia local y eficiente. El modelo resuelve el problema de la transcripción de voz a texto multilingüe en tiempo real, con soporte para 32 locales de idioma y puntuación y capitalización automáticas.

La arquitectura combina un codificador FastConformer "cache-aware" de 0,6 mil millones de parámetros con un decodificador transducer RNN-T condicionado por prompt. Esta combinación permite dos modos de operación: un modo offline de alta precisión (`att_context_size=[56, 13]`, latencia de 1,12 s) y un modo de streaming por chunks seleccionable en tiempo de ejecución. El modelo está pensado para aplicaciones donde la latencia y el consumo de recursos son críticos, como subtitulado en vivo, asistentes de voz o transcripción en dispositivos de gama media.

La relevancia actual de esta ficha radica en que ofrece una ruta de despliegue práctica: los pesos GGUF (desde 473 MB en Q4_K_M hasta 2,38 GB en F32) permiten ejecutar el modelo en CPU y GPU de consumo, con un rendimiento medido en factores de tiempo real (RTF) muy favorables. La licencia OpenMDW-1.1 heredada del modelo base condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer cache-aware (encoder) + RNN-T transducer (decoder) |
| Parametros totales | 637.991.968 (0,64 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de atención `att_context_size=[56, 13]` en modo offline; streaming por chunks de 1120 ms) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 32 locales: en, es, fr, it, pt, nl, de, tr, ru, ar, hi, ja, ko, vi, uk, pl, sv, cs, nb, da, bg, fi, hr, sk, zh, hu, ro, et (el tokenizer reconoce 40, 8 pendientes de fine-tuning) |
| Licencia | OpenMDW-1.1 (heredada del modelo base) |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

El modelo emplea un codificador FastConformer con mecanismo de atención cache-aware, diseñado específicamente para streaming. La atención cache-aware permite que el codificador procese audio de forma incremental sin recalcular todo el contexto, lo que reduce la latencia y el coste computacional en escenarios en vivo. El decodificador es un transducer RNN-T condicionado por prompt, donde el idioma objetivo se selecciona por llamada (`--language en-US`, `fr-FR`, etc.) o mediante un modo automático que emite una etiqueta `<lang-XX>`.

El modelo soporta dos rutas de inferencia: offline, con `att_context_size=[56, 13]` y una latencia de 1,12 s, que ofrece la máxima precisión; y streaming por chunks, configurable con `--stream-chunk-ms 1120` y `--stream-att-right {0,3,6,13}`, que permite ajustar el compromiso entre latencia y precisión. El modelo base fue entrenado por NVIDIA; los detalles sobre el número de tokens de entrenamiento, la composición del dataset o el uso de RLHF/DPO no están disponibles en la información proporcionada. La conversión a GGUF fue validada contra la referencia NeMo en el commit `909e94e` de `transcribe.cpp` el 2026-06-08, y portada desde el commit upstream `24b151a` del modelo base.

## Capacidades

- Transcripción de voz a texto multilingüe en 32 locales, con puntuación y capitalización automáticas.
- Detección automática de idioma mediante etiqueta `<lang-XX>` en modo auto.
- Selección explícita de idioma por llamada (`--language en-US`, `fr-FR`, `de-DE`, etc.).
- Streaming en tiempo real con chunks configurables de 1120 ms y ventana de atención derecha ajustable (`0, 3, 6, 13`).
- Modo offline de alta precisión con `att_context_size=[56, 13]`.
- Marcas de tiempo a nivel de token (timestamps token).
- No soporta traducción (`translate: false`).
- No se mencionan capacidades de tool calling, agentes ni razonamiento multi-paso (no aplicables a un modelo ASR).

## Casos de uso

- Subtitulado en vivo: el modo streaming con chunks de 1120 ms permite generar subtítulos con latencia de aproximadamente un segundo, adecuado para retransmisiones, reuniones o eventos presenciales.
- Transcripción de reuniones y actas: el modo offline con `att_context_size=[56, 13]` ofrece la máxima precisión (WER de 7,97 % en FLEURS en y 3,04 % en LibriSpeech test-clean) para procesar grabaciones completas y generar actas con puntuación.
- Asistentes de voz locales: al ejecutarse con `transcribe.cpp` en CPU o GPU de consumo, el modelo puede integrarse en asistentes que funcionan sin conexión, preservando la privacidad del audio.
- Atención al cliente automatizada: la transcripción multilingüe con detección automática de idioma permite enrutar llamadas o chats de voz según el idioma detectado y generar transcripciones para análisis posterior.
- Accesibilidad: generación de subtítulos para vídeos y contenido audiovisual en 32 idiomas, con marcas de tiempo a nivel de token que facilitan la sincronización.
- Investigación en ASR: el modelo sirve como referencia ligera (0,6 B) para experimentos de streaming, comparación de cuantizaciones y validación de pipelines de inferencia en C++.
- Procesamiento por lotes en servidores modestos: las cuantizaciones Q4_K_M (473 MB) y Q5_K_M (534 MB) permiten desplegar transcripción multilingüe en máquinas sin GPU dedicada.

## Benchmarks y rendimiento

| Benchmark | F32 | F16 | Q8_0 | Q6_K | Q5_K_M | Q4_K_M |
|---|---:|---:|---:|---:|---:|---:|
| WER FLEURS test en (en-US) | 7,97 % | 7,97 % | 7,88 % | 8,02 % | 8,15 % | 8,49 % |
| WER LibriSpeech test-clean | 3,04 % | 3,03 % | 3,06 % | 3,07 % | 3,10 % | 3,28 % |

Referencia NeMo en el mismo manifiesto: 7,99 % en FLEURS en (NVIDIA reporta 7,91 % en-US) y 3,03 % en LibriSpeech test-clean. Las mediciones se realizaron con decodificación RNN-T greedy, `--language en-US` y normalizador whisper.

Rendimiento en tiempo real (RTF):

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 98 |
| Apple M4 Max | CPU | 29 |
| AMD Ryzen 4750U | Vulkan | 14,5 |
| AMD Ryzen 4750U | CPU | 7,5 |

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en todas las cuantizaciones; F32 requiere 2,38 GB de almacenamiento, Q4_K_M 473 MB.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple M4 Max alcanza RTF 98) o Vulkan (Ryzen 4750U con iGPU alcanza RTF 14,5); no se requieren A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier GPU integrada o dedicada con al menos 1 GB de memoria disponible.
- Opciones de despliegue: `transcribe.cpp` (compilación con CMake, binario `transcribe-cli`); no se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: RTF de 98 en Metal (M4 Max), 29 en CPU (M4 Max), 14,5 en Vulkan (Ryzen 4750U) y 7,5 en CPU (Ryzen 4750U); latencia de streaming de 1120 ms por chunk.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron 3.5 ASR Streaming 0.6B (esta ficha) | 0,64 B | ventana `[56, 13]` offline; chunks 1120 ms | 32 locales | OpenMDW-1.1 | GGUF, safetensors |
| Whisper large-v3 | no disponible en la información | no disponible | no disponible | no disponible | no disponible |
| Parakeet (familia NVIDIA) | no disponible en la información | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de benchmarks frente a alternativas en la información proporcionada. La comparativa se limita a la disponibilidad de formatos y licencia; para el resto de filas se indica "no disponible".

## Limitaciones y advertencias

- El modelo no realiza traducción (`translate: false`); solo transcribe en el idioma de origen.
- El tokenizer reconoce 40 idiomas, pero 8 de ellos están en estado "adaptation-ready" y requieren fine-tuning para un rendimiento adecuado; los 32 locales listados son los plenamente soportados.
- Los sesgos conocidos del modelo base no se detallan en la información proporcionada; al ser un modelo entrenado por NVIDIA, puede heredar sesgos de sus datos de entrenamiento.
- Riesgo de alucinación en audio con ruido, acentos no representados o solapamiento de hablantes; no se han publicado métricas específicas en la información disponible.
- La licencia OpenMDW-1.1 condiciona el uso comercial; es necesario revisar los términos completos en la model card del modelo base antes de desplegarlo en producción.
- El rendimiento en streaming depende de la configuración de `--stream-att-right`; valores bajos reducen la latencia pero pueden degradar la precisión.
- La inferencia requiere audio de entrada en WAV mono a 16 kHz; es necesario remuestrear con herramientas externas como ffmpeg.
- El repositorio GGUF tiene 46 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria limitada.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/lipik/nemotron-3.5-asr-streaming-0.6b-gguf
- Modelo base en Hugging Face: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Commit upstream del modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b/commit/24b151a
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/909e94e
- Documentación del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/nemotron-3.5-asr-streaming-0.6b.md
- Paper FastConformer (arXiv:2305.05084): https://arxiv.org/abs/2305.05084
- Paper RNNT (arXiv:2312.17279): https://arxiv.org/abs/2312.17279

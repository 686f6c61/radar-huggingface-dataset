# avericaai/nemotron-3.5-asr-streaming-0.6b-gguf

## Resumen

Nemotron 3.5 ASR Streaming 0.6B es un modelo de reconocimiento automático del habla (ASR) multilingüe desarrollado por NVIDIA, aquí distribuido en formato GGUF por el usuario `avericaai` para su uso con la librería `transcribe.cpp`. Se trata de la extensión multilingüe de `nvidia/nemotron-speech-streaming-en-0.6b`, a la que se añade condicionamiento por prompt de identificación de idioma para cubrir 40 locales de idioma (32 totalmente soportados y 8 listos para adaptación mediante fine-tuning) con un único modelo de aproximadamente 638 millones de parámetros.

El modelo resuelve el problema de la transcripción de voz en tiempo real y en lote con una única arquitectura: un encoder FastConformer con atención cache-aware que permite streaming por fragmentos, acoplado a un decodificador transducer RNN-T condicionado por prompt de idioma. Esta combinación ofrece rutas de inferencia seleccionables en tiempo de ejecución: una ruta offline de máxima precisión (`att_context_size=[56, 13]`, ventana de 1,12 s) y una ruta de streaming por chunks configurables (`--stream-chunk-ms 1120 --stream-att-right {0,3,6,13}`).

Su relevancia actual radica en que permite desplegar ASR multilingüe de calidad cercana al estado del arte en hardware modesto (desde 496 MB en Q4_K_M hasta 2,55 GB en F32), con soporte de detección automática de idioma, puntuación, mayúsculas y timestamps a nivel de token, todo ello bajo licencia OpenMDW-1.1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder cache-aware streaming) + RNN-T transducer con decodificador condicionado por prompt de idioma |
| Parametros totales | 637.991.968 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de atención offline `att_context_size=[56, 13]`, equivalente a 1,12 s de audio; streaming por chunks de 1120 ms con `att_right` configurable en {0, 3, 6, 13}) |
| Tipos de cuantizacion | F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 32 locales totalmente soportados: en (US/GB), es (US/ES), fr (FR/CA), it, pt (BR/PT), nl, de, tr, ru, ar, hi, ja, ko, vi, uk, pl, sv, cs, nb, da, bg, fi, hr, sk, zh, hu, ro, et; el tokenizer reconoce 40 locales, 8 adicionales listos para adaptación |
| Licencia | OpenMDW-1.1 (heredada del modelo base) |
| Formato de pesos | GGUF (F32, F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M) |

## Arquitectura y entrenamiento

El modelo emplea un encoder FastConformer con atención cache-aware, diseñado específicamente para streaming: mantiene una caché de estados de atención que permite procesar audio de forma incremental sin recalcular el contexto pasado. El decodificador es un transducer RNN-T condicionado por prompt, donde el idioma objetivo se selecciona por llamada (`--language en-US`, `fr-FR`, `de-DE`, etc.) o mediante modo automático que emite una etiqueta `<lang-XX>`. Esta es la principal innovación respecto al modelo monolingüe inglés del que deriva: un único conjunto de pesos sirve para 40 locales mediante condicionamiento por prompt.

El modelo base fue portado desde el commit upstream `24b151a` (fijado el 2026-06-08) y validado numéricamente contra la referencia NeMo en el commit `909e94e` de `transcribe.cpp`. No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; estos datos corresponden a la model card de NVIDIA y no se detallan aquí. La decodificación es greedy RNN-T con normalizador de scoring tipo whisper-normalizer.

## Capacidades

- Transcripción de voz a texto multilingüe en 32 locales totalmente soportados, con selección de idioma por llamada o detección automática.
- Streaming en tiempo real mediante chunks configurables (`--stream-chunk-ms 1120`) con control del contexto de atención derecho (`--stream-att-right {0,3,6,13}`).
- Ruta offline de alta precisión con `att_context_size=[56, 13]` para transcripción por lotes.
- Puntuación y mayúsculas en la salida.
- Timestamps a nivel de token.
- Detección automática de idioma con emisión de etiqueta `<lang-XX>`.
- No soporta traducción (`translate: false`): transcribe en el idioma hablado, no traduce entre idiomas.
- No es un modelo de lenguaje: no soporta tool calling, function calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Subtitulado en directo de reuniones y videoconferencias: la ruta de streaming con chunks de 1120 ms y timestamps por token permite generar subtítulos incrementales con latencia controlada, seleccionando el idioma por participante o dejando la detección automática.
- Transcripción por lotes de archivos de audio: la ruta offline (`att_context_size=[56, 13]`) ofrece la máxima precisión (WER 7,90 % en FLEURS en con Q8_0) para procesar grandes volúmenes de grabaciones sin requisito de latencia.
- Atención al cliente con análisis de llamadas: el soporte de 32 locales permite transcribir conversaciones telefónicas en español (WER 6,30 % en FLEURS es) e italiano (5,78 %) para alimentar sistemas de análisis de calidad, búsqueda en grabaciones y cumplimiento normativo.
- Asistentes de voz embebidos en dispositivos: con Q4_K_M (496 MB) o Q5_K_M (560 MB) el modelo cabe en hardware de consumo y puede ejecutarse vía CPU o Metal/Vulkan, habilitando dictado y comandos de voz locales sin conexión.
- Generación de actas y notas de reuniones multilingües: la detección automática de idioma y las etiquetas `<lang-XX>` permiten transcribir sesiones donde se alternan idiomas, con puntuación y mayúsculas listas para revisión humana.
- Investigación en ASR y evaluación de cuantizaciones: la disponibilidad de seis niveles de cuantización (F32 a Q4_K_M) con métricas WER/CER publicadas por idioma permite estudiar el impacto de la compresión en distintos idiomas y locales.
- Accesibilidad y documentación de audio: transcripción de podcasts, clases y material audiovisual en 32 locales con timestamps por token para sincronizar con el audio original.

## Benchmarks y rendimiento

WER (%) en FLEURS test con cuantización Q8_0 y ruta offline (`att_context_size=[56, 13]`), salvo indicación contraria. Para ja, ko y zh se reporta CER en lugar de WER.

| Idioma / prueba | Q8_0 | F32 | F16 | Q6_K | Q5_K_M | Q4_K_M |
|---|---|---|---|---|---|---|
| FLEURS en | 7,90 | 7,97 | 7,97 | 8,02 | 8,15 | 8,49 |
| FLEURS es | 6,30 | no disponible | no disponible | no disponible | no disponible | no disponible |
| FLEURS it | 5,78 | no disponible | no disponible | no disponible | no disponible | no disponible |
| FLEURS pt | 8,52 | no disponible | no disponible | no disponible | no disponible | no disponible |
| FLEURS hi | 8,61 | no disponible | no disponible | no disponible | no disponible | no disponible |
| FLEURS de | 10,33 | no disponible | no disponible | no disponible | no disponible | no disponible |
| FLEURS fr | 10,78 | no disponible | no disponible | no disponible | no disponible | no disponible |
| FLEURS ru | 12,61 | no disponible | no disponible | no disponible | no disponible | no disponible |
| FLEURS nl | 13,61 | no disponible | no disponible | no disponible | no disponible | no disponible |
| FLEURS vi | 13,96 | no disponible | no disponible | no disponible | no disponible | no disponible |
| FLEURS uk | 14,88 | no disponible | no disponible | no disponible | no disponible | no disponible |
| FLEURS tr | 15,40 | no disponible | no disponible | no disponible | no disponible | no disponible |
| FLEURS ar | 15,93 | no disponible | no disponible | no disponible | no disponible | no disponible |
| FLEURS pl | 17,54 | no disponible | no disponible | no disponible | no disponible | no disponible |
| FLEURS nb | 19,24 | no disponible | no disponible | no disponible | no disponible | no disponible |
| FLEURS fi | 21,91 | no disponible | no disponible | no disponible | no disponible | no disponible |
| FLEURS bg | 22,02 | no disponible | no disponible | no disponible | no disponible | no disponible |
| FLEURS cs | 23,00 | no disponible | no disponible | no disponible | no disponible | no disponible |
| FLEURS sk | 23,25 | no disponible | no disponible | no disponible | no disponible | no disponible |
| FLEURS sv | 24,32 | no disponible | no disponible | no disponible | no disponible | no disponible |
| FLEURS hr | 26,21 | no disponible | no disponible | no disponible | no disponible | no disponible |
| FLEURS ro | 28,28 | no disponible | no disponible | no disponible | no disponible | no disponible |
| FLEURS da | 28,51 | no disponible | no disponible | no disponible | no disponible | no disponible |
| FLEURS et | 31,84 | no disponible | no disponible | no disponible | no disponible | no disponible |
| FLEURS hu | 32,12 | no disponible | no disponible | no disponible | no disponible | no disponible |
| CER FLEURS ja | 13,52 | no disponible | no disponible | no disponible | no disponible | no disponible |
| CER FLEURS ko | 8,89 | no disponible | no disponible | no disponible | no disponible | no disponible |
| CER FLEURS zh | 18,87 | no disponible | no disponible | no disponible | no disponible | no disponible |
| LibriSpeech test-clean | 3,06 | 3,04 | 3,03 | 3,07 | 3,10 | 3,28 |

Referencia NeMo sobre el mismo manifiesto: 7,99 % en FLEURS en (NVIDIA reporta 7,91 % en en-US) y 3,03 % en LibriSpeech test-clean. El WER en FLEURS en se calculó sobre las 647 utterances completas, con batch sizes 1 y 8 y timestamps desactivados.

Rendimiento en tiempo real (RTF, factor de tiempo real; mayor es mejor):

| Plataforma | Backend | RTF |
|---|---|---|
| Apple M4 Max | CPU | 30,25 |
| Apple M4 Max | Metal | 141,1 |
| AMD Ryzen 7 4750U | CPU | 10,59 |
| AMD Ryzen 7 4750U | Vulkan | 17,13 |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia según cuantización: F32 2,55 GB, F16 1,28 GB, Q8_0 751 MB, Q6_K 621 MB, Q5_K_M 560 MB, Q4_K_M 496 MB (tamaños de archivo; el consumo en ejecución añade el estado de caché del encoder y buffers de audio).
- GPU recomendadas: no se especifican modelos concretos en la información disponible; el modelo se ha validado en Apple M4 Max (Metal) y AMD Ryzen 7 4750U (Vulkan). Por su tamaño, cualquier GPU consumer con al menos ~1 GB de VRAM libre puede ejecutar las cuantizaciones Q4_K_M a Q8_0.
- Cabe en GPU de consumo: sí, en todas las cuantizaciones; incluso F16 (1,28 GB) y F32 (2,55 GB) son viables en tarjetas con 4 GB o más.
- Opciones de despliegue: `transcribe.cpp` (compilación desde fuente con CMake; binario `transcribe-cli`). No se mencionan otros runtimes (vLLM, llama.cpp, Ollama, TGI) en la información disponible.
- Latencia y throughput: RTF de 30,25 (CPU) y 141,1 (Metal) en M4 Max; 10,59 (CPU) y 17,13 (Vulkan) en Ryzen 7 4750U. La ruta de streaming usa chunks de 1120 ms, lo que fija la latencia mínima de emisión en ese orden.
- Requisito de entrada: audio WAV mono a 16 kHz (convertible con `ffmpeg -i input.mp3 -ar 16000 -ac 1 output.wav`).

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Streaming | Formatos | Licencia |
|---|---|---|---|---|---|
| nemotron-3.5-asr-streaming-0.6b (este GGUF) | 638 M | 32 soportados (40 en tokenizer) | Sí, cache-aware | GGUF (F32–Q4_K_M) | OpenMDW-1.1 |
| nvidia/nemotron-speech-streaming-en-0.6b | ~600 M | Solo inglés | Sí, cache-aware | no disponible en la información | no disponible en la información |
| nvidia/nemotron-3.5-asr-streaming-0.6b (original NeMo) | 638 M | 40 locales | Sí | NeMo (no GGUF) | OpenMDW-1.1 |

No se dispone en la información proporcionada de datos de benchmarks de modelos competidores comparables (por ejemplo, Whisper large-v3 o Parakeet de otros tamaños) para establecer una comparación cuantitativa; los únicos puntos de referencia son la propia implementación NeMo del mismo modelo (7,99 % WER en FLEURS en, 3,03 % en LibriSpeech test-clean).

## Limitaciones y advertencias

- No traduce: `translate: false`. Solo transcribe en el idioma hablado.
- Diferencias de calidad muy acusadas entre idiomas: el WER oscila entre 5,78 % (it) y 32,12 % (hu) en FLEURS con Q8_0; los idiomas eslavos, nórdicos y ugrofineses (et, hu, da, ro, hr) presentan tasas de error elevadas que pueden ser inaceptables en producción sin fine-tuning.
- 8 de los 40 locales del tokenizer están "listos para adaptación" y requieren fine-tuning para un rendimiento utilizable.
- La cuantización degrada ligeramente la precisión: en FLEURS en, el WER pasa de 7,90 % (Q8_0) a 8,49 % (Q4_K_M); en LibriSpeech test-clean, de 3,06 % a 3,28 %.
- La ruta de streaming introduce una latencia mínima de 1120 ms por chunk y su precisión no se reporta de forma desglosada en la información disponible; los benchmarks publicados corresponden a la ruta offline.
- Riesgo de alucinación inherente a los modelos transducer en segmentos de silencio o ruido; no se documentan mecanismos específicos de mitigación en la información disponible.
- Sesgos: no se documentan análisis de sesgo por acento, dialecto, edad o género en la información proporcionada.
- Licencia OpenMDW-1.1: es una licencia de pesos abiertos de NVIDIA, no equivalente a Apache 2.0 ni MIT; conviene revisar sus términos antes de uso comercial. El repositorio figura además con `license: other` en los metadatos de Hugging Face.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-08); es una conversión de terceros, no oficial de NVIDIA, aunque declara validación numérica contra la referencia NeMo.
- Dependencia de `transcribe.cpp`: requiere compilar desde fuente y no hay soporte documentado para otros runtimes de inferencia.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/avericaai/nemotron-3.5-asr-streaming-0.6b-gguf
- Modelo base en Hugging Face: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Modelo monolingüe inglés del que deriva: https://huggingface.co/nvidia/nemotron-speech-streaming-en-0.6b
- Repositorio de transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Página del modelo en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/nemotron-3.5-asr-streaming-0.6b.md
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/909e94e
- Commit upstream del modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b/commit/24b151a
- Model card en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-asr-streaming/modelcard
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Paper de referencia (arXiv:2312.17279): https://arxiv.org/abs/2312.17279
- Paper de referencia (arXiv:2305.05084): https://arxiv.org/abs/2305.05084

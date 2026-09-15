# smajji/nemotron-hinglish-v1

## Resumen

Nemotron Hinglish v1 es un modelo de reconocimiento automático del habla (ASR) publicado por el usuario smajji en HuggingFace, afinado a partir de nvidia/nemotron-3.5-asr-streaming-0.6b. Está especializado en inglés, hindi y Hinglish (alternancia de código hindi-inglés), un fenómeno lingüístico muy extendido en India y prácticamente ausente en los corpus ASR convencionales. El modelo conserva la arquitectura FastConformer-Transducer (RNNT) con cache-aware streaming del modelo base: 24 capas, 1024 dimensiones ocultas y aproximadamente 600 millones de parámetros.

La relevancia del modelo está en su enfoque de streaming: permite transcripción incremental con chunks de 80, 160, 320, 560 y 1120 ms, lo que lo hace apto para subtitulado en vivo, asistentes de voz y analítica de contact center en tiempo real. Además mantiene el vocabulario BPE de 13088 tokens y los 128 prompts de idioma del modelo base, incluido el prompt `auto` de detección automática, clave para manejar frases que mezclan hindi e inglés sin forzar un idioma.

El ajuste se realizó sobre una mezcla bilingüe y code-mixed de aproximadamente 590 horas en este checkpoint, con SPGISpeech, IISc_SPICOR, SPRING Hindi, Shrutilipi-hi y UJS Hinglish. La model card reporta WER de 3,1 % en inglés, 12,4 % en hindi y 22,6 % en Hinglish sobre clips reservados, muy por debajo de la referencia de fine-tune con la que se compara. La licencia es Apache 2.0 y el repositorio ocupa 2,6 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer-Transducer (RNNT), cache-aware streaming, subsampling 8x |
| Parámetros totales | ~600 M (24 capas, 1024 dimensiones ocultas) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica como ventana de tokens; procesa audio en chunks de 80/160/320/560/1120 ms con caché de streaming |
| Tipos de cuantización | no disponible (la model card no documenta cuantizaciones) |
| Idiomas soportados | inglés (`en`), hindi (`hi`) y Hinglish (code-switching hindi-inglés mediante prompt `auto`) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoint `.nemo` de NeMo (no se documentan safetensors, GGUF ni ONNX) |
| Vocabulario | 13088 BPE + 128 prompts de idioma, incluido `auto` |
| Frecuencia de muestreo | 16 kHz mono |
| Modelo base | nvidia/nemotron-3.5-asr-streaming-0.6b |
| Tamaño del repositorio | 2,6 GB |
| Librería | NeMo (`nemo.collections.asr`) |
| Pipeline | automatic-speech-recognition |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura FastConformer-Transducer (RNNT), una variante eficiente del Conformer que aplica subsampling 8x sobre las características de audio para reducir la longitud de la secuencia antes del codificador. El decodificador es un transductor recurrente, lo que permite decodificación en streaming sin necesidad de lookahead completo. La variante cache-aware mantiene un estado de caché de atención y convolución entre chunks, de modo que el modelo puede procesar audio de forma continua con latencias configurables de 80 a 1120 ms sin recalcular el contexto completo. Conserva el vocabulario de 13088 tokens BPE y los 128 prompts de idioma del modelo base, que condicionan la decodificación según el idioma esperado.

El ajuste fino se hizo con `EncDecRNNTBPEModelWithPrompt` de NeMo, la implementación de RNNT condicionada por prompt. Los datos de entrenamiento suman unas 590 horas en este checkpoint: SPGISpeech (300 h, inglés), IISc_SPICOR (97 h, inglés con acento indio), SPRING Hindi-1482Hrs (228 h, hindi), Shrutilipi-hi (1000 h, en ejecuciones mayores) y UJS Hinglish (44 h, code-mixed). El entrenamiento preserva puntuación y mayúsculas para mantener el estilo de texto del modelo base, y combina prompts forzados de `langID` con el prompt `auto` de autodetección, lo que permite alternar idioma dentro de una misma emisión. No se documentan fases de RLHF ni DPO, algo esperable en un modelo ASR.

## Capacidades

- Transcripción de voz a texto en inglés, hindi y Hinglish con alternancia de código dentro de la misma frase.
- Reconocimiento en streaming con chunks de 80, 160, 320, 560 y 1120 ms, apto para aplicaciones en tiempo real.
- Detección automática de idioma mediante el prompt `auto`, sin necesidad de especificar el idioma de entrada.
- Salida con puntuación y mayúsculas, según el estilo de texto heredado del modelo base.
- Manejo de inglés con acento indio, cubierto explícitamente por IISc_SPICOR en el entrenamiento.
- Decodificación greedy y por lotes (`batch_size`) a través de la API `transcribe` de NeMo.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente acústico, no un LLM.
- No dispone de capacidades de visión, audio generation ni thinking mode.

## Casos de uso

- Subtitulado en vivo para retransmisiones indias: el modo streaming con chunks de 80 a 320 ms permite emitir subtítulos con latencia baja en contenido donde los hablantes alternan hindi e inglés, un escenario donde los modelos monolingües fallan al cambiar de idioma a mitad de frase.
- Analítica de contact center: transcripción por lotes de llamadas de soporte en India para generar métricas de sentimiento, cumplimiento y calidad, usando el prompt `auto` para no tener que etiquetar previamente el idioma de cada llamada.
- Asistentes de voz e IVR: reconocimiento incremental de comandos y consultas en aplicaciones de banca, comercio electrónico o telecomunicaciones, donde el usuario mezcla términos técnicos en inglés con gramática hindi.
- Indexación y búsqueda de archivos de audio: transcripción de podcasts, vídeos y repositorios de audio para hacerlos buscables por texto, con soporte de puntuación que mejora la legibilidad del índice.
- Accesibilidad y documentación de reuniones: generación de actas y transcripciones de reuniones bilingües celebradas en inglés con intervenciones en hindi, ejecutando el modelo en modo offline con chunks grandes para maximizar la precisión.
- Moderación de contenido en plataformas: transcripción de audio generado por usuarios para detección automática de discurso de odio o spam, aprovechando el soporte de Hinglish que los sistemas basados solo en inglés no cubren.
- Dictado y notas de voz en aplicaciones móviles: el tamaño de ~600 M permite ejecución en servidores modestos o en el dispositivo con exportación a ONNX/TensorRT, aunque esta ruta no está documentada por el autor y requiere validación propia.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre clips reservados, con el mismo audio, prompt `auto`, decodificación greedy y WER insensible a puntuación, comparados con el fine-tune de referencia `sampathlonka/svarupa_asr_0.6b_v1`:

| Idioma | Nemotron Hinglish v1 | Svarupa ASR v1 |
|---|---|---|
| Inglés | 3,1 % WER | 10,0 % WER |
| Hindi | 12,4 % WER | 36,1 % WER |
| Hinglish | 22,6 % WER | 45,0 % WER |

No se han publicado en la información disponible resultados de benchmarks estándar tipo LibriSpeech, Common Voice, Fleurs ni comparativas con Whisper.

## Requisitos de hardware

- Peso de los parámetros: ~2,4 GB en FP32, ~1,2 GB en FP16/BF16 y ~0,6 GB en INT8 (estimación a partir de los ~600 M de parámetros, no confirmada por el autor).
- VRAM estimada para inferencia: del orden de 2 a 4 GB en FP16 con lotes pequeños, incluyendo cachés de streaming y buffers de decodificación.
- GPU recomendadas: NVIDIA T4, L4, RTX 3060 12 GB, RTX 4090. Una A100 o H100 está sobredimensionada para un modelo de 600 M salvo que se sirvan muchos flujos concurrentes.
- Cabe en GPU de consumo: sí, en cualquier GPU con 4 GB o más de VRAM; también es viable en CPU para escenarios de baja concurrencia.
- Opciones de despliegue: NeMo (`ASRModel.restore_from`), NVIDIA RIVA y Triton Inference Server son las rutas naturales. No hay soporte documentado de llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje y no existe formato GGUF.
- Latencia: en streaming, la latencia mínima está acotada por el tamaño de chunk seleccionado (80 ms como valor más bajo, 1120 ms el mayor); no se publica latencia de cómputo ni throughput (RTFx) medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Idiomas | WER inglés | WER hindi | WER Hinglish | Licencia |
|---|---|---|---|---|---|---|---|
| smajji/nemotron-hinglish-v1 | ~600 M | FastConformer-RNNT, streaming | en, hi, Hinglish | 3,1 % | 12,4 % | 22,6 % | Apache 2.0 |
| nvidia/nemotron-3.5-asr-streaming-0.6b | ~600 M | FastConformer-RNNT, streaming | multilingüe (13088 BPE, 128 prompts) | no disponible | no disponible | no disponible | no disponible |
| sampathlonka/svarupa_asr_0.6b_v1 | ~600 M | no disponible | en, hi, Hinglish | 10,0 % | 36,1 % | 45,0 % | no disponible |

No se dispone de datos comparativos con Whisper large-v3 ni con otros modelos multilingües en la información proporcionada.

## Limitaciones y advertencias

- El WER en Hinglish es del 22,6 %, claramente superior al de inglés (3,1 %) y hindi (12,4 %); para producción en code-switching conviene validar con audio propio del dominio antes de fijar expectativas de calidad.
- El checkpoint se entrenó con unas 590 horas, pero la propia model card indica que el conjunto crece en ejecuciones mayores (Shrutilipi-hi aparece con 1000 h "en ejecuciones mayores"), por lo que este checkpoint no incorpora necesariamente todo el volumen descrito.
- La model card no documenta sesgos demográficos, acentos regionales distintos del indio ni comportamiento con audio ruidoso o con solapamiento de hablantes.
- Riesgo de alucinación en ASR: en segmentos con silencio, ruido o habla ininteligible, los modelos transductores pueden emitir texto plausible no presente en el audio.
- El ejemplo de uso de la model card invoca `restore_from("nvidia/nemotron-hinglish-v1")`, pero el identificador real del repositorio es `smajji/nemotron-hinglish-v1`; hay que corregir la ruta o descargar el checkpoint localmente para que la llamada funcione.
- No se documentan formatos de cuantización, exportación a ONNX/TensorRT ni compatibilidad con runtimes distintos de NeMo, lo que limita el despliegue fuera del ecosistema NVIDIA.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: es un modelo recién publicado y sin validación independiente por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial y modificación, pero exige conservar el aviso de licencia y no ofrece garantías; conviene revisar las licencias del modelo base y de los corpus de entrenamiento (SPGISpeech, Shrutilipi, UJS Hinglish) si el uso es comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/smajji/nemotron-hinglish-v1
- Modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Fine-tune de referencia usado en la comparativa: https://huggingface.co/sampathlonka/svarupa_asr_0.6b_v1
- Resultados de búsqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a páginas de Vinted sin relación con el modelo.

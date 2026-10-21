# ConwayResearch/Underdog-Bark-3.0-Clean

## Resumen

Underdog Bark 3.0 Clean es un modelo de reconocimiento automático del habla (ASR) en inglés de 0,6 mil millones de parámetros, publicado por ConwayResearch como un ajuste fino (finetune) de nvidia/parakeet-tdt-0.6b-v3. Su particularidad es que integra la limpieza de disfluencias en el propio modelo: elimina muletillas ("um", "uh"), fórmulas de relleno ("you know", "I mean"), arranques falsos y palabras repetidas, de modo que la salida es texto directamente utilizable para dictado o notas de reunión, sin necesidad de un segundo modelo de posprocesado.

El modelo se distribuye en una descarga de 180 MB y ocupa 1,25 GB en memoria una vez descomprimido, lo que lo sitúa en la gama de ejecución local y en dispositivo (Mac, iPhone) dentro de la aplicación Underdog, donde el audio no abandona el dispositivo. Es la variante "clean" de Bark 3.0 Plus; frente a la versión verbatim, sacrifica fidelidad literal a cambio de legibilidad.

Su relevancia actual radica en la relación precisión/tamaño: con 180 MB obtiene 4,08 % de WER sobre transcripciones limpias de DisfluencySpeech y 1,71 % en LibriSpeech clean, y su modelo base Plus promedia 4,76 % en los siete conjuntos ingleses del Open ASR Leaderboard, por delante de Parakeet TDT 0.6B v3 (4,94 %), Qwen3-ASR-0.6B (5,16 %) y Whisper large-v3 (6,04 %) según la comparativa publicada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transducer TDT (token-and-duration transducer) heredada de Parakeet TDT 0.6B v3, ajustada mediante finetune |
| Parametros totales | 0,6 mil millones (0,6B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no se especifica duración máxima de audio ni ventana de contexto) |
| Tipos de cuantizacion | Pesos de bajos bits (etiqueta "low-bit"); el autor no detalla el esquema exacto de cuantización |
| Idiomas soportados | Inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | No disponible (repositorio de 0,2 GB, compatible con transformers; no se explicita safetensors/GGUF) |

## Arquitectura y entrenamiento

El modelo parte de nvidia/parakeet-tdt-0.6b-v3, un transducer TDT (token-and-duration transducer) de 0,6B parámetros. La arquitectura TDT predice conjuntamente tokens y duraciones, lo que permite una decodificación eficiente sin modelo de lenguaje externo y resulta adecuada para inferencia de baja latencia en dispositivo. Sobre esa base, ConwayResearch aplica un ajuste fino orientado a dictado que modifica el estilo de salida: en lugar de transcribir literalmente, el modelo normaliza el habla espontánea eliminando hesitaciones, repeticiones y arranques falsos. El resultado se empaqueta en cuantización de bajos bits, con 180 MB de descarga y 1,25 GB en memoria desempaquetado.

No se han publicado en la información disponible detalles sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni otras innovaciones técnicas del ajuste fino. Las etiquetas del repositorio indican soporte para MLX y Apple Silicon, además de compatibilidad con endpoints.

## Capacidades

- Transcripción de voz a texto en inglés con reconocimiento verbatim de contenido, pero con eliminación integrada de disfluencias.
- Limpieza de habla espontánea: elimina "um", "uh", "you know", "I mean", arranques falsos y palabras repetidas.
- Dictado: convierte el habla en texto listo para usar sin modelo secundario de limpieza.
- Generación de notas de reunión a partir de audio, integrada en la aplicación Underdog (Speak y notas de reunión).
- Ejecución en dispositivo: pensado para Mac e iPhone, con el audio sin salir del dispositivo.
- Inferencia de bajos bits con 180 MB de descarga y 1,25 GB en memoria.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio más allá de ASR, traducción ni detección de idioma.

## Casos de uso

- Dictado personal en Mac o iPhone: el modelo transcribe directamente lo que el usuario dicta y elimina las muletillas, de modo que el texto se puede pegar en un correo o un documento sin edición posterior; su tamaño de 180 MB y 1,25 GB en memoria permite ejecutarlo localmente.
- Generación de notas de reunión: la variante Clean está pensada para actas legibles, donde las hesitaciones de los participantes no aportan información; el autor reporta 12,12 % de WER en AMI (referencias verbatim, por lo que las eliminaciones intencionadas cuentan como error).
- Transcripción de entrevistas y conversación no guionizada para análisis cualitativo: sobre DisfluencySpeech obtiene 4,08 % de WER frente a transcripciones limpias, lo que reduce el trabajo de limpieza manual previo al análisis.
- Subtitulado y documentación de contenido grabado donde se prioriza legibilidad sobre literalidad: la salida evita repeticiones y falsos arranques, útil en formación interna, pódcast o vídeos corporativos.
- Procesamiento por lotes en pipelines de transcripción en servidores con GPU modesta: al ocupar 1,25 GB en memoria, permite varias instancias concurrentes en una sola GPU consumer.
- Aplicaciones de accesibilidad y entrada por voz en tiempo real: la arquitectura TDT y el tamaño reducido hacen viable la decodificación de baja latencia en hardware de gama media y en Apple Silicon vía MLX.
- Transcripción de audio con contenido limpio y leído (por ejemplo, audiolibros o ponencias): 1,71 % de WER en LibriSpeech clean y 2,23 % en VoxPopuli según la tabla del autor.

## Benchmarks y rendimiento

Limpieza de disfluencias. DisfluencySpeech (250 clips de conversación no guionizada), WER en %, menor es mejor; las muletillas cuentan como error:

| Modelo | Descarga | Frente a transcripciones limpias | Frente a transcripciones verbatim |
|---|---:|---:|---:|
| Bark 3.0 Clean | 180 MB | 4,08 | 13,85 |
| Bark 2.0 | 472 MB | 3,83 | 13,01 |
| Bark 3.0 (verbatim) | 163 MB | 16,53 | 3,15 |

Habla ordinaria. WER en % sobre los conjuntos de test completos de los siete conjuntos ingleses del Open ASR Leaderboard:

| Modelo | Descarga | LS clean | LS other | AMI | Earnings-22 | GigaSpeech | SPGISpeech | VoxPopuli | Media |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Bark 3.0 Clean | 180 MB | 1,71 | 3,78 | 12,12 | 8,55 | 9,76 | 2,66 | 2,23 | 5,83 |
| Bark 2.0 | 472 MB | 2,94 | 5,21 | 16,16 | 11,08 | 10,56 | 3,47 | 2,90 | 7,48 |

Base verbatim (Bark 3.0 Plus) y referencias publicadas por el autor, WER en %:

| Modelo | Descarga | LS clean | LS other | AMI | Earnings-22 | GigaSpeech | SPGISpeech | VoxPopuli | Media |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Bark 3.0 Pro | 1.254 MB | 1,38 | 3,11 | 7,16 | 5,65 | 7,46 | 3,54 | 1,70 | 4,29 |
| Bark 3.0 Plus | 180 MB | 1,71 | 3,82 | 7,76 | 6,70 | 7,77 | 3,64 | 1,92 | 4,76 |
| Bark 3.0 | 163 MB | 1,89 | 4,08 | 7,82 | 7,05 | 7,95 | 3,72 | 2,05 | 4,94 |
| Phonon-2 | 164 MB | 1,73 | 3,92 | 9,32 | 6,96 | 8,35 | 3,70 | 2,46 | 5,21 |
| Parakeet TDT 0.6B v3 | 2.508 MB | 1,52 | 3,13 | 9,42 | 5,85 | 7,99 | 3,63 | 3,05 | 4,94 |
| Qwen3-ASR-0.6B | 1.876 MB | 1,70 | 4,01 | 9,33 | 7,83 | 7,62 | 2,74 | 2,90 | 5,16 |
| Whisper large-v3 | 9.261 MB | 1,56 | 3,52 | 13,63 | 7,99 | 8,35 | 2,71 | 4,53 | 6,04 |
| Whisper large-v3-turbo | 1.618 MB | 2,13 | 3,71 | 13,88 | 8,09 | 8,47 | 2,79 | 7,02 | 6,58 |

Advertencia del autor: las referencias de AMI, GigaSpeech y Earnings-22 son verbatim, por lo que cada muletilla o repetición que Bark 3.0 Clean elimina de forma deliberada penaliza su WER en esos conjuntos. Para transcripción verbatim deben usarse Bark 3.0 (4,94) o Bark 3.0 Plus (4,76).

## Requisitos de hardware

- Descarga: 180 MB; memoria una vez descomprimido: 1,25 GB según el autor.
- VRAM estimada para inferencia en GPU: no publicada de forma explícita; el peso descomprimido (1,25 GB) marca el orden de magnitud, y el pico real con transformers no está documentado.
- Cabe en cualquier GPU consumer con 4 GB o más de VRAM del mercado actual (por ejemplo RTX 3060, RTX 4060, RTX 4090); no se han publicado medidas de latencia por GPU.
- Ejecución en dispositivo: soporte declarado para Apple Silicon vía MLX y para Mac e iPhone en la aplicación Underdog.
- Opciones de despliegue: biblioteca transformers con pipeline automatic-speech-recognition, MLX para Apple Silicon y endpoints compatibles (etiqueta endpoints_compatible). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Descarga | WER medio (7 conjuntos) | WER AMI | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Bark 3.0 Clean | 0,6B | 180 MB | 5,83 (con limpieza de disfluencias) | 12,12 | CC-BY-4.0 | HuggingFace (ConwayResearch) |
| Bark 3.0 Plus | 0,6B | 180 MB | 4,76 (verbatim) | 7,76 | No disponible en la información | HuggingFace (ConwayResearch) |
| Parakeet TDT 0.6B v3 | 0,6B | 2.508 MB | 4,94 | 9,42 | No disponible en la información | HuggingFace (nvidia) |
| Whisper large-v3 | No disponible | 9.261 MB | 6,04 | 13,63 | No disponible en la información | HuggingFace (openai) |
| Qwen3-ASR-0.6B | 0,6B | 1.876 MB | 5,16 | 9,33 | No disponible en la información | HuggingFace |

La comparación no es homogénea: Bark 3.0 Clean modifica el estilo de salida (elimina disfluencias) y por tanto su WER sube en conjuntos con referencias verbatim, mientras que el resto de modelos comparados transcriben literalmente. La comparación justa frente a Bark 3.0 Plus es en LibriSpeech clean (1,71 % en ambos).

## Limitaciones y advertencias

- Solo admite inglés; no se declara soporte multilingüe.
- La limpieza de disfluencias es intencionada y penaliza cualquier evaluación con referencias verbatim: 12,12 % en AMI frente a 7,76 % de Bark 3.0 Plus, y 9,76 % en GigaSpeech frente a 7,77 %.
- Riesgo de eliminar contenido legítimo: al borrar repeticiones y fórmulas de relleno, pueden desaparecer palabras que en un contexto concreto sí aportaban significado; no se documenta ningún mecanismo de control para desactivar la limpieza.
- Riesgo de alucinación inherente a los modelos ASR, especialmente en audio con ruido, solapamiento de hablantes o acentos no cubiertos por el entrenamiento; no se publican análisis de sesgos por acento, género o edad.
- No se documentan marcas de tiempo, diarización de hablantes, puntuación configurable ni detección de idioma.
- No se especifica la duración máxima de audio soportada ni el comportamiento en fragmentos largos.
- Licencia CC-BY-4.0: permite uso comercial con atribución; debe conservarse la atribución a ConwayResearch y respetarse la licencia del modelo base nvidia/parakeet-tdt-0.6b-v3, cuyos términos no se detallan en la información disponible.
- El repositorio registra 0 descargas en el momento de la consulta y fue creado el 2026-10-15, por lo que la validación por parte de terceros es aún inexistente.
- Los resultados de benchmarks proceden del propio autor; no se han verificado de forma independiente en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ConwayResearch/Underdog-Bark-3.0-Clean
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Bark 3.0 Plus (base verbatim de esta variante): https://huggingface.co/ConwayResearch/Underdog-Bark-3.0-Plus
- Bark 3.0 Pro: https://huggingface.co/ConwayResearch/Underdog-Bark-3.0-Pro
- Bark 2.0: https://huggingface.co/ConwayResearch/bark-0.6B-4bit-v2.0
- Aplicación Underdog: https://underdog.ai
- Paper de DisfluencySpeech: https://arxiv.org/abs/2406.08820
- Open ASR Leaderboard: https://huggingface.co/spaces/hf-audio/open_asr_leaderboard

Nota: la búsqueda web realizada no devolvió enlaces relevantes sobre este modelo; los resultados obtenidos correspondían a servicios de correo electrónico sin relación con el contenido de la ficha.

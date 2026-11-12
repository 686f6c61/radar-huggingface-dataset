# Johnwick0007/openflow-telugish

## Resumen

OpenFlow-Telugish es un motor de reconocimiento automático del habla (ASR) especializado en "telugish", el fenómeno de cambio de código entre telugu e inglés que se da de forma natural en hablantes bilingües de la India. Lo desarrolla el usuario Johnwick0007 y se distribuye como un derivado de `openai/whisper-small` y `openai/whisper-tiny`, convertido a CTranslate2 en cuantización INT8 para ejecución offline en CPU y dispositivos de borde. Su propuesta es sustituir herramientas comerciales de dictado por voz (el autor cita Wispr Flow, de 15 USD al mes) sin depender de la nube.

El modelo aborda dos carencias concretas: los Whisper originales sufren tasas de error de palabra (WER) de entre el 65,6 % y el 72,8 % en telugu hablado con mezcla de inglés, y los modelos ASR de telugu existentes emiten escritura telugu literaria que malinterpreta los términos técnicos en inglés y trunca grabaciones largas por la expansión de tokens BPE del alfabeto telugu. La solución combina dos arquitecturas: un ensamblado de pesos tipo WiSE-FT que fusiona pesos de telugu con pesos de inglés y un ajuste fino neuronal directo que emite telugish romanizado.

El resultado son artefactos muy ligeros (entre 38,6 MB y 236,7 MB en INT8) que, según los datos del autor, alcanzan un 6,79 % de WER en el conjunto técnico de 82 clips y un 18,06 % en el conjunto de 120 clips de habla real. La relevancia actual está en el nicho de ASR multilingüe con cambio de código para mercados indios y en el despliegue en hardware modesto sin conexión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), destilado a CTranslate2 INT8; variante híbrida con ensamblado de pesos WiSE-FT |
| Parametros totales | No disponible (deriva de `whisper-tiny` y `whisper-small`; el autor no publica el recuento) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (ventana de audio de Whisper, 30 s por segmento; el autor menciona segmentación por pausas para grabaciones largas) |
| Tipos de cuantizacion | INT8 (CTranslate2); los modelos base de referencia se distribuyen en FP16 |
| Idiomas soportados | Telugu (te) e inglés (en), con salida en escritura telugu o en telugish romanizado |
| Licencia | Apache 2.0 |
| Formato de pesos | CTranslate2 (INT8); modelos base en safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Whisper (transformer encoder-decoder con atención completa) y se distribuye en dos variantes. La Arquitectura A es un ensamblado de pesos en el espacio de parámetros (WiSE-FT) que combina un 92 % de pesos de un modelo telugu entrenado con 1.000 horas (vasista22/whisper-telugu) y un 8 % de pesos de OpenAI o de un modelo inglés ajustado, seguido de cuantización INT8 con CTranslate2 (reducción de tamaño de 3,8x) y un posprocesado de segmentación por valles de pausa más una transducción fonética a romano. La Arquitectura B es un ajuste fino neuronal extremo a extremo de `whisper-tiny` y `whisper-small` que emite directamente telugish romanizado sin reglas de posprocesado.

El conjunto de entrenamiento de la Arquitectura B son 9,78 horas (4.317 enunciados): 3.120 grabaciones reales de micrófono procedentes de Google FLEURS (`te_in`), OpenSLR SLR66, IIIT-B / Chai Bisket en YouTube y AI4Bharat Svarah, más 1.197 clips de telugish con cambio de código en cuatro condiciones acústicas (limpio, ruido ambiente, reverberación de sala y paso banda telefónico de 8 kHz). El ajuste fino se realizó en una GPU NVIDIA L4 con precisión mixta bf16. No se documenta en la información disponible el uso de RLHF o DPO, ni el número total de tokens de entrenamiento.

## Capacidades

- Reconocimiento de voz en telugu e inglés con cambio de código intra-frase (telugish), incluyendo vocabulario técnico, financiero y cotidiano en inglés insertado en gramática telugu.
- Salida dual: escritura telugu nativa o telugish romanizado directo desde el decodificador neuronal (Arquitectura B) o mediante transducción fonética (Arquitectura A).
- Manejo de grabaciones largas mediante segmentación por valles de pausa (probado con monólogos de hasta 33,5 s).
- Robustez a condiciones acústicas degradadas: ruido ambiente, reverberación y banda telefónica de 8 kHz.
- Ejecución 100 % offline en CPU y dispositivos de borde gracias a la cuantización INT8.
- Inglés con acento indio como idioma secundario soportado.
- No se documenta soporte de tool calling, agentes, visión, audio de entrada más allá del ASR ni modo de razonamiento; es un modelo exclusivamente de transcripción.

## Casos de uso

- Dictado por voz offline para desarrolladores: el modelo transcribe frases como "deploy chesaka Cloud Run logs check chesi GCP logging chusi naku cheppu" en un portátil sin conexión, adecuado por su tamaño de 38,6 MB en INT8 y su velocidad de 17,3x tiempo real en CPU.
- Documentación clínica bilingüe: un profesional sanitario que alterna telugu e inglés puede dictar notas y obtener texto romanizado directamente, gracias al ajuste específico sobre vocabulario médico del conjunto de 82 clips de dominio.
- Atención al cliente en mercados indios: transcripción de conversaciones de soporte con mezcla de idiomas para su posterior análisis, usando la variante `small` (18,06 % de WER en habla real) cuando se requiere mayor precisión.
- Subtitulado y actas de reuniones: la segmentación por valles de pausa permite procesar intervenciones largas y generar transcripciones en telugish romanizado legibles para equipos que no leen escritura telugu.
- Integración en aplicaciones móviles de borde: los artefactos INT8 de 38,6 MB y 236,7 MB caben en dispositivos con recursos limitados y se ejecutan con faster-whisper y CTranslate2 sin GPU.
- Análisis de encuestas y entrevistas de campo: el corpus de entrenamiento incluye grabaciones reales de micrófono de FLEURS y Svarah, lo que lo hace adecuado para audio capturado en condiciones no controladas.
- Transcripción de contenido audiovisual en YouTube: el autor entrenó con clips de IIIT-B / Chai Bisket, por lo que el dominio de vídeo conversacional informal está representado en los datos.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. El conjunto técnico son 82 clips de cinco dominios (tecnología, fintech, medicina); el conjunto de habla real son 120 clips con cambio de código.

| Modelo | Tamano INT8 | Dispositivo | WER 82 clips tecnicos | Precision de caracteres 82 clips | WER 120 clips habla real | Precision de caracteres 120 clips | Velocidad CPU |
|---|---|---|---|---|---|---|---|
| `openai/whisper-tiny` base | 147,8 MB (FP16) | GPU | 65,63 % | 64,25 % | no disponible | no disponible | no disponible |
| `openai/whisper-small` base | 464,9 MB (FP16) | GPU | no disponible | no disponible | 72,84 % | 57,66 % | no disponible |
| `telugish-whisper-tiny-int8` (extremo a extremo) | 38,6 MB | CPU | 12,12 % | 96,05 % | 31,71 % | 88,30 % | 17,3x tiempo real (277 ms) |
| `telugish-whisper-small-int8` (extremo a extremo) | 236,7 MB | CPU/GPU | 6,79 % | 97,94 % | 18,06 % | 94,33 % | 15,2x tiempo real (370 ms) |

El autor reporta además una precisión de micrófono en vivo del 90-93 % para la Arquitectura A híbrida y del 94,3 % de precisión de caracteres en el benchmark para la Arquitectura B. No se han publicado resultados en benchmarks estándar de la literatura (MMLU, HumanEval, GSM8K) porque el modelo no es de lenguaje.

## Requisitos de hardware

- VRAM estimada: no aplica en la variante INT8 para CPU; en GPU, los pesos INT8 de 38,6 MB (tiny) y 236,7 MB (small) dejan el consumo dominado por el runtime de CTranslate2, muy por debajo de 1 GB.
- GPU recomendadas: el autor entrenó y evaluó en NVIDIA L4 con bf16; cualquier GPU con soporte CUDA es suficiente para inferencia, incluidas RTX 3060, RTX 4090, A100 y H100, aunque están sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en CPU exclusivamente; la variante tiny INT8 de 38,6 MB está pensada para dispositivos de borde.
- Opciones de despliegue: faster-whisper sobre CTranslate2 (vía documentada por el autor), con dependencias `faster-whisper`, `ctranslate2`, `transformers`, `torch`, `sounddevice`, `soundfile` y `scipy`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo ASR.
- Latencia y throughput: 277 ms para la variante tiny (17,3x tiempo real) y 370 ms para la variante small (15,2x tiempo real) en CPU, según los datos del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | WER telugish reportado |
|---|---|---|---|---|---|
| OpenFlow-Telugish (small INT8) | derivado de `whisper-small` | 30 s por segmento con segmentación por pausas | te, en | Apache 2.0 | 6,79 % (82 clips tecnicos), 18,06 % (120 clips reales) |
| `openai/whisper-small` | 244 M (aprox.) | 30 s | 99 idiomas | MIT | 72,84 % (120 clips reales) |
| `openai/whisper-tiny` | 39 M (aprox.) | 30 s | 99 idiomas | MIT | 65,63 % (82 clips tecnicos) |
| `vasista22/whisper-telugu-small` | derivado de `whisper-small` | 30 s | te | no disponible en la informacion | no disponible; el autor indica que falla en cambio de código y trunca audios de más de 8 s |

No se dispone de datos de benchmarks de otros modelos ASR de telugu comparables en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado sobre 9,78 horas de audio, un volumen reducido que puede limitar la generalización a acentos, dialectos o dominios no representados.
- El autor reporta un WER del 18,06 % en habla real con cambio de código, frente al 6,79 % en el conjunto técnico; el rendimiento en audio espontáneo es notablemente inferior.
- La salida romanizada no es una transcripción ortográfica estándar del telugu, sino una representación fonética orientada a legibilidad, lo que puede no ser adecuada para flujos que requieran escritura telugu canónica.
- Riesgo de alucinación inherente a Whisper en segmentos con silencio, ruido o audio ininteligible; el autor documenta este comportamiento en los modelos base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de los benchmarks publicados.
- Solo cubre telugu e inglés; no se ha evaluado su comportamiento en otros idiomas ni en variedades del telugu distintas de las del corpus.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base `vasista22/whisper-telugu-small` y los conjuntos de datos empleados pueden tener condiciones adicionales que conviene verificar antes de un despliegue en producción.
- No se documentan sesgos específicos de género, casta o registro lingüístico, pero el corpus incluye fuentes de YouTube y conversacionales que pueden introducir sesgos de dominio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Johnwick0007/openflow-telugish
- Modelo base: https://huggingface.co/openai/whisper-small
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Modelo base telugu: https://huggingface.co/vasista22/whisper-telugu-small
- Conjunto de datos: https://huggingface.co/datasets/google/fleurs
- Conjunto de datos: https://huggingface.co/datasets/ai4bharat/Svarah
- Conjunto de datos: https://huggingface.co/datasets/eswardivi/Telugu_ASR_corpus
- Conjunto de datos: https://huggingface.co/datasets/bnriiitb/telugu_asr
- Librería de inferencia: https://github.com/SYSTRAN/faster-whisper

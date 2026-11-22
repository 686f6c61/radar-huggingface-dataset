# sakasegawa/reazonspeech-nemo-v2-GGUF

## Resumen

reazonspeech-nemo-v2-GGUF es una conversión al formato GGUF del modelo de reconocimiento automático del habla (ASR) `reazon-research/reazonspeech-nemo-v2`, desarrollado por Reazon Research y convertido por el usuario sakasegawa para su uso con el runtime speech.cpp. Se trata de un reconocedor de japonés basado en la arquitectura FastConformer con atención local, con 619 millones de parámetros, que transcribe audio con puntuación y es capaz de procesar grabaciones de varios minutos de duración de forma íntegra.

La relevancia de esta ficha radica en que empaqueta un modelo ASR de calidad en un único fichero de entre 0,36 GB y 1,24 GB según la cuantización, lo que permite ejecutarlo en hardware de consumo (incluido Metal en Apple Silicon y GPUs consumer como la RTX 2080) con una latencia de decodificación del orden de 0,05 a 0,1 segundos por petición. El modelo original no estaba disponible en GGUF para runtimes ligeros, y esta conversión cubre ese hueco para aplicaciones de transcripción en local.

Es importante señalar que estos ficheros GGUF tienen un layout propio de speech.cpp y **no son compatibles** con llama.cpp, LM Studio, Ollama ni otras herramientas que lean GGUF estándar. El modelo está especializado exclusivamente en japonés y se distribuye bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | FastConformer con atención local (encoder) + red de predicción LSTM + joint (RNN-T) |
| Parámetros totales | 619.190.169 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (acepta audio de varios minutos de forma íntegra) |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K, Q4_K |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (layout propio de speech.cpp) |

## Arquitectura y entrenamiento

El modelo es un reconocedor RNN-T (transducer) construido sobre un encoder FastConformer con atención local. El pipeline incluye un frontend de extracción de características, el encoder, una red de predicción basada en LSTM, la red joint y el vocabulario, todo empaquetado en un único fichero GGUF. La decodificación se realiza mediante búsqueda por haces (beam search) al estilo de NeMo por defecto, o de forma greedy bajo petición.

La conversión realizada por sakasegawa preserva las matrices de las capas lineales, la LSTM y el embedding de tokens en el tipo de cuantización elegido. En los ficheros Q6_K, Q5_K y Q4_K, las matrices de la red de predicción y del joint se mantienen en Q8_0 porque sus filas de 640 valores no forman bloques completos de 256. Según la model card, cada etapa se validó contra los tensores de NeMo sobre utterances del split de test de FLEURS: en 8 utterances ja_jp y 2 entradas concatenadas de 65 s y 311 s, la CPU en F32 y F16 y Metal reproducen el texto de NeMo en las diez, tanto con beam search como con decodificación greedy, y las marcas temporales de tokens y segmentos coinciden exactamente con las de NeMo. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens ni el uso de RLHF/DPO.

## Capacidades

- Reconocimiento automático del habla en japonés con salida de texto con puntuación.
- Procesamiento de grabaciones de muchos minutos de duración de forma íntegra, sin segmentación manual.
- Decodificación configurable: beam search (por defecto, al estilo de NeMo) o greedy.
- Detección de actividad de voz (VAD) integrada mediante silero-vad para ficheros largos como reuniones.
- Marcas temporales de tokens y segmentos idénticas a las de NeMo.
- Modo servidor HTTP con `speech serve` para despliegue como servicio.
- No soporta tool calling, agentes, visión, audio generativo ni capacidades multilingües más allá del japonés.

## Casos de uso

- Transcripción de reuniones: con `--vad silero-vad` el modelo procesa ficheros de reunión completos, segmentando por actividad de voz y generando transcripción con puntuación y marcas temporales, adecuado para actas automáticas en japonés.
- Subtitulado de vídeo y audio: las marcas temporales de tokens y segmentos permiten alinear la transcripción con la pista de audio para generar subtítulos sincronizados.
- Atención al cliente por voz: el modo `speech serve` expone una API HTTP que puede recibir audio de llamadas y devolver la transcripción en japonés, con latencia de decodificación de 0,05-0,1 s por petición en hardware consumer.
- Transcripción en local y privacidad: al ejecutarse con speech.cpp sobre CPU o Metal sin conexión, es apto para entornos donde el audio no puede salir del dispositivo (sanidad, legal, interior de empresa).
- Procesamiento por lotes de archivos de audio: el tamaño reducido de las cuantizaciones Q4_K (0,36 GB) y Q5_K (0,43 GB) permite desplegar múltiples workers en una sola máquina para transcribir grandes volúmenes de audio japonés.
- Herramientas de accesibilidad: integración en aplicaciones de dictado o lectura de audio para usuarios japoneses, con memoria pico de 0,48-1,38 GB según cuantización, lo que cabe en portátiles y equipos de gama media.
- Investigación en ASR: al reproducir exactamente las salidas de NeMo, sirve como referencia ligera para comparar pipelines de inferencia o para experimentar con cuantización sin perder fidelidad en el texto.

## Benchmarks y rendimiento

Precisión medida por speech-bench el 2026-10-12 en un Apple M5 con Metal, sobre las 4.483 utterances del test de japonés de Common Voice 8.0, recortadas a la voz. La memoria es el pico de `speech` por petición.

| Tipo | Tamaño | Memoria | CER | CER (otras grafías aceptadas) |
|---|---|---|---|---|
| F16 | 1,24 GB | 1,38 GB | 12,02 % | 7,13 % |
| Q8_0 | 0,66 GB | 0,79 GB | 12,05 % | 7,15 % |
| Q6_K | 0,51 GB | 0,64 GB | 11,98 % | 7,12 % |
| Q5_K | 0,43 GB | 0,56 GB | 11,99 % | 7,14 % |
| Q4_K | 0,36 GB | 0,48 GB | 12,16 % | 7,23 % |

Velocidad medida por speech-bench el 2026-10-10 sobre las primeras 100 utterances del test de japonés de Common Voice 8.0, en F16 y con una petición cálida a la vez:

| Decodificación | Mediana, M5 / RTX 2080 | p90, M5 / RTX 2080 |
|---|---|---|
| beam search | 0,085 s / 0,106 s | 0,135 s / 0,191 s |
| greedy | 0,054 s / 0,047 s | 0,079 s / 0,078 s |

No se han publicado resultados de benchmarks comparativos con otros modelos ASR (MMLU, HumanEval, GSM8K no aplican a este tipo de modelo) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: 1,38 GB en F16, 0,79 GB en Q8_0, 0,64 GB en Q6_K, 0,56 GB en Q5_K y 0,48 GB en Q4_K (pico de memoria por petición medido en Apple M5).
- GPU recomendadas: RTX 2080 (medida en los benchmarks); cualquier GPU consumer moderna con suficiente memoria es válida dado el tamaño reducido del modelo.
- Cabe en GPU consumer: sí, en todas las cuantizaciones; incluso la F16 de 1,24 GB cabe en GPUs con 2 GB o más de VRAM.
- Opciones de despliegue: exclusivamente speech.cpp 0.7.0 o superior (Q8_0, Q6_K, Q5_K y Q4_K requieren 0.8.0 o superior). No es compatible con llama.cpp, LM Studio, Ollama ni TGI.
- Latencia y throughput: mediana de 0,047-0,106 s por petición y p90 de 0,078-0,191 s según decodificación y hardware (M5 o RTX 2080), en F16.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| reazonspeech-nemo-v2-GGUF (esta ficha) | 619 M | ja | GGUF (speech.cpp) | Apache 2.0 | Cuantizaciones de 0,36 a 1,24 GB; requiere speech.cpp |
| reazon-research/reazonspeech-nemo-v2 (original) | 619 M | ja | NeMo (.nemo) | Apache 2.0 | Modelo base; requiere NeMo para inferencia |
| Alternativas ASR de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- Solo reconoce japonés; el campo `language` de la petición únicamente se valida contra `ja`.
- El CER base es de aproximadamente 12 % en Common Voice 8.0 (7,1 % aceptando otras grafías), por lo que no es adecuado para transcripción de precisión crítica sin revisión humana.
- Los ficheros usan un layout GGUF propio de speech.cpp y no funcionan en llama.cpp, LM Studio, Ollama ni otras herramientas que lean GGUF estándar.
- Requiere speech.cpp 0.7.0 o superior; las cuantizaciones Q8_0, Q6_K, Q5_K y Q4_K exigen 0.8.0 o superior.
- No se dispone de información sobre sesgos del modelo original ni sobre la composición de su dataset de entrenamiento.
- Riesgo de alucinación inherente a los modelos transducer en audio con ruido o solapamiento de hablantes; no se han publicado evaluaciones específicas al respecto.
- La licencia Apache 2.0 permite uso comercial, pero el autor de la conversión no ofrece garantías sobre el modelo convertido.
- El modelo no soporta tool calling, agentes, visión ni otras modalidades.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sakasegawa/reazonspeech-nemo-v2-GGUF
- Modelo base: https://huggingface.co/reazon-research/reazonspeech-nemo-v2
- speech.cpp (repositorio): https://github.com/nyosegawa/speech.cpp
- Instalación de speech.cpp: https://github.com/nyosegawa/speech.cpp#install
- Documentación FastConformer en speech.cpp: https://github.com/nyosegawa/speech.cpp/blob/main/docs/models/fastconformer.md
- Documentación de línea de comandos: https://github.com/nyosegawa/speech.cpp/blob/main/docs/cli.md
- Documentación del servidor: https://github.com/nyosegawa/speech.cpp/blob/main/docs/server.md

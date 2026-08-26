# ibm-granite/granite-speech-5.0-470m-turboctc

## Resumen

Granite Speech 5.0 TurboCTC es un modelo de reconocimiento automático del habla (ASR) en inglés, desarrollado por IBM dentro de la familia Granite Speech. Con aproximadamente 470 millones de parámetros, está diseñado para ofrecer una velocidad de inferencia muy alta, apta para su despliegue en portátiles, teléfonos inteligentes y otros dispositivos de borde. El modelo se basa en un codificador acústico conformer con atención por bloques, autocondicionamiento y reducción temporal de la frecuencia de trama, con una cabeza de clasificación de 16.384 unidades BPE. Se entrenó con alrededor de 60.000 horas de audio en inglés procedente de corpus públicos, usando Connectionist Temporal Classification (CTC) e inferencia no autorregresiva con decodificación ávida. Su relevancia actual radica en su velocidad extrema (más de 12.600 RTFx en una GPU H200) y en su licencia Apache 2.0, que permite uso comercial y académico.

El modelo está disponible en Hugging Face con el identificador `ibm-granite/granite-speech-5.0-470m-turboctc`, se integra nativamente en `transformers` (aunque requiere instalación desde fuente hasta la próxima versión) y es adecuado para tareas de transcripción de voz a texto de baja latencia y alto rendimiento. Su arquitectura compacta y su enfoque en eficiencia lo convierten en una opción atractiva para aplicaciones empresariales que requieren transcripción precisa en tiempo real o procesamiento por lotes de grandes volúmenes de audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer encoder (16 bloques) con CTC, atención por bloques, autocondicionamiento y downsampling temporal ×8 |
| Parametros totales | 472.993.792 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (procesa audio en tramas de 12.5 Hz, sin límite explícito de contexto en la documentación) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin información sobre cuantizaciones oficiales) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 4.7 GB) |

## Arquitectura y entrenamiento

El modelo utiliza un encoder conformer de 16 bloques, con dimensión oculta de 1024, 8 cabezas de atención (tamaño de cabeza 128) y kernel convolucional de tamaño 7. Se aplica una reducción temporal por factor de 8, pasando de 100 Hz a 12.5 Hz mediante apilado y salto de tramas logmel+delta (2x) y convoluciones con stride y residuos agrupados en los dos primeros bloques (4x). La atención se realiza por bloques de 128 tramas, y se emplea CTC autocondicionado desde la capa intermedia. La cabeza de clasificación tiene 16.384 unidades BPE.

El entrenamiento se realizó con aproximadamente 60.000 horas de audio en inglés, combinando conjuntos públicos (CommonVoice-17, MLS, Librispeech, VoxPopuli, YODAS, AMI, Earnings-22) y tres conjuntos sintéticos: 2.000 horas de datos multi-locutor concatenando segmentos de MLS, YODAS, CommonVoice, VoxPopuli y AMI; 500 horas multi-locutor de Earnings-22; y 240 horas de emisiones con números, monedas, nombres de sitios web, teléfonos, direcciones y elementos con decimales o puntos. No se especifica el uso de RLHF o DPO; el entrenamiento es puramente CTC supervisado.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés, con transcripción de voz a texto.
- Inferencia no autorretativa con decoding greedy, lo que permite una velocidad de procesamiento muy alta (más de 12.600 RTFx en H200, según informes).
- Adecuado para audio de formato corto y medio, incluyendo discursos, podcasts, reuniones y llamadas.
- Manejo de ruido y reverberación, con resultados reportados en el leaderboard FFASR para habla lejana.
- Soporte de procesamiento por lotes (batch) para transcribir múltiples muestras simultáneamente.
- Compatible con la librería `transformers` (pip install desde fuente) y con `AutoModelForCTC` y `AutoProcessor`.
- No incluye capacidades de visión, tool calling, agentes ni razonamiento multimodal; es un modelo exclusivamente de audio a texto.

## Casos de uso

- **Transcripción en tiempo real para subtitulación**: el modelo puede procesar audio en streaming con baja latencia gracias a su decodificación no autorretativa y su alta velocidad, lo que lo hace adecuado para subtitular eventos en directo o videollamadas.
- **Asistentes de voz en dispositivos de borde**: su tamaño compacto (470M) y velocidad permiten ejecutarlo en portátiles o smartphones para comandos de voz, dictado y búsqueda por voz.
- **Procesamiento de grandes volúmenes de audio**: con una tasa de RTFx superior a 12.000, puede transcribir horas de audio en segundos, ideal para archivos de podcasts, entrevistas, reuniones grabadas o bibliotecas de medios.
- **Atención al cliente automatizada**: integrado en sistemas de call center para transcribir llamadas en tiempo real, permitiendo análisis de sentimiento o extracción de información clave.
- **Asistencia para accesibilidad**: conversión de voz a texto para personas con discapacidad auditiva en aplicaciones de comunicación o en entornos educativos.
- **Extracción de información de audio**: transcripción de conferencias, seminarios o videos para generar actas, resúmenes o índices de contenido.

## Benchmarks y rendimiento

No se han publicado resultados numéricos detallados en la información proporcionada. La model card indica que el modelo fue evaluado en los leaderboards de Open ASR (short-form English) y FFASR (noisy/reverberant), pero los valores concretos (WER, RTFx) se muestran en imágenes no accesibles en el texto. Se menciona que alcanza más de 12.600 RTFx en una GPU H200 y que puede transcribir 3.5 horas de audio en un segundo, pero estos datos provienen de fuentes externas y no se detallan en la documentación oficial. Por lo tanto, no se pueden presentar cifras verificadas de WER en esta ficha. Se recomienda consultar los enlaces oficiales para obtener las tablas completas.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no se especifica oficialmente. Con 470M parámetros en FP32, el peso ocupa ~1.9 GB; en FP16 ~0.9 GB. Para un batch típico, se estima una VRAM de entre 1 y 2 GB, aunque depende de la longitud de audio y del backend.
- **GPU recomendadas**: el modelo es ligero, puede ejecutarse en GPU consumer como RTX 3060, 4060, 4090, así como en GPUs de datacenter (A10, L4, H100). Las pruebas de velocidad se realizaron en H200 y L4.
- **Compatibilidad con GPU consumer**: sí, cabe en la mayoría de GPUs modernas con al menos 4 GB de VRAM.
- **Opciones de despliegue**: se integra en `transformers` (con `AutoModelForCTC` y `AutoProcessor`). No se mencionan backends específicos como vLLM o llama.cpp en la documentación; es probable que se pueda servir mediante HuggingFace Inference Endpoints u otros servicios que soporten transformers.
- **Latencia y throughput**: se reporta una velocidad de transcripción de más de 12.600 RTFx en una H200 (es decir, 12.600 veces más rápido que el tiempo real) y de más de 3.5 horas de audio por segundo. En una L4, el RTFx en el leaderboard FFASR es menor pero no se detalla.

## Comparativa con modelos similares

No se dispone de datos concretos de comparación con otros modelos ASR compactos en la información proporcionada. Como referencia, modelos como Whisper-small (244M) o Whisper-base (74M) son alternativas populares, pero su velocidad y precisión difieren. Whisper utiliza una arquitectura encoder-decoder con autoregresión, mientras que Granite Speech es encoder-only con CTC, lo que le otorga una ventaja de velocidad significativa. La licencia Apache 2.0 de Granite Speech es más permisiva que la licencia MIT de Whisper, aunque ambos permiten uso comercial. No se dispone de resultados de benchmarks comparativos en los datos proporcionados, por lo que no se puede presentar una tabla de comparación numérica.

## Limitaciones y advertencias

- **Idioma**: el modelo solo soporta inglés, no es multilingüe.
- **Dominio**: entrenado principalmente con datos de habla leída y conversacional; puede degradarse en acentos muy marcados, habla infantil o ruido extremo no representado en el entrenamiento.
- **Alucinación**: como todo modelo ASR, puede producir transcripciones incorrectas o "alucinadas" en segmentos de audio ambiguos o de muy baja calidad.
- **Contexto**: no se especifica una longitud máxima de contexto explícita; la arquitectura procesa tramas de audio en bloques de 128, pero no hay límite documentado en la model card.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero debe conservarse la atribución y las condiciones de licencia.
- **Dependencia de `transformers`**: requiere instalación desde fuente hasta la próxima versión estable, lo que puede introducir inestabilidad en entornos de producción.
- **Sin capacidades de puntuación o mayúsculas**: la salida es texto sin formato; puede requerir postprocesado para puntuación y capitalización en aplicaciones finales.

## Enlaces

- [HuggingFace - ibm-granite/granite-speech-5.0-470m-turboctc](https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc)
- [Blog de IBM - Extremely Fast and Accurate Transcription with Granite Speech 5.0 Turbo CTC](https://huggingface.co/blog/ibm-granite/granite-speech-5-0-470m-turboctc)
- [Documentación de Granite Speech en IBM](https://www.ibm.com/granite/docs/models/speech)
- [Artículo de Korshunov AI - IBM releases Granite Speech 5.0 Turbo CTC models](https://korshunov.ai/en/article/20704-ibm-releases-granite-speech-5-0-turbo-ctc-models-with-over-12600-rtfx-speed/)
- [Artículo de Unite AI - IBM Says Granite Speech 5.0 Transcribes 3.5 Hours of Speech in One Second](https://www.unite.ai/ibm-says-granite-speech-5-0-transcribes-3-5-hours-of-speech-in-one-second/)
- [Artículo de The AI Chronicle - IBM Granite Speech 5.0: Ultra-Fast Transcription Model](https://theaicronicle.com/en/news/research/granite-speech-5-0-turbo-ctc-speed-accuracy)

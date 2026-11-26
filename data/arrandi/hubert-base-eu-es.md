# arrandi/hubert-base-eu-es

## Resumen

hubert-base-eu-es es un modelo de representaciones del habla basado en la arquitectura HuBERT Base, desarrollado por el usuario arrandi y publicado en Hugging Face. Se trata de un encoder auto-supervisado entrenado desde cero sobre 2.098 horas de audio en castellano y euskera, con una proporción equilibrada del 50/50 entre ambos idiomas. El modelo sigue la receta oficial de HuBERT de fairseq y cuenta con 94.371.712 parámetros, 12 capas transformer y una dimensión oculta de 768.

El modelo resuelve el problema de la falta de representaciones acústicas específicas para el par lingüístico euskera-castellano, un ámbito donde los modelos multilingües genéricos suelen rendir por debajo de lo deseable. No incluye cabecera de tokenizer ni de ASR: es un encoder puro que debe fine-tunearse con una cabeza específica (CTC para reconocimiento de voz, o una cabeza de clasificación para otras tareas).

Su relevancia radica en que, según los datos declarados por el autor, supera a alternativas como mHuBERT-147 y HuBERT-ls960 en ASR para ambos idiomas, con un WER del 13,53 % en euskera y del 15,07 % en castellano. La licencia Apache 2.0 facilita su uso comercial. El contexto de este modelo es el audio a 16 kHz con representaciones a nivel de frame (~50 fps).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HuBERT Base (transformer encoder, 12 capas, 768 hidden) |
| Parametros totales | 94.371.712 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio a 16 kHz, representaciones a ~50 frames/s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | euskera (eu), castellano (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura HuBERT (Hidden-Unit BERT), un transformer encoder de 12 capas con 768 dimensiones ocultas y aproximadamente 94 M de parámetros, entrenado de forma auto-supervisada mediante predicción de unidades ocultas enmascaradas. El preentrenamiento se realizó desde cero con la receta oficial de fairseq HuBERT, sobre un corpus de 2.098 horas a 16 kHz con equilibrio 50/50 entre euskera y castellano.

Las fuentes del corpus incluyen para euskera Basque Parliament, CommonVoice 24, un corpus dialectal interno, EITB Faktoria y OpenSLR 76 (~1.043 h); para castellano, Basque Parliament (ES), CommonVoice 24, VoxPopuli, MLS y OpenSLR 69 (~1.055 h). No se menciona en la información disponible el uso de RLHF ni DPO, algo esperable en un encoder auto-supervisado. Tampoco se detalla el número exacto de tokens de audio procesados ni innovaciones técnicas adicionales más allá de la propia receta HuBERT.

## Capacidades

- Extracción de representaciones acústicas a nivel de frame: devuelve tensores de forma `(1, T, 768)` a ~50 frames por segundo.
- Generación de embeddings a nivel de utterance mediante pooling de la secuencia de frames.
- Base para fine-tuning en reconocimiento automático del habla (ASR) con cabecera CTC o atención.
- Base para fine-tuning en tareas de clasificación (por ejemplo, reconocimiento de emociones, aunque con rendimiento inferior a alternativas).
- Soporte nativo de audio mono a 16 kHz con `do_normalize=false`.
- Capacidades multilingües limitadas a euskera y castellano.
- No incluye tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No incluye tokenizer ni cabecera de transcripción: no transcribe directamente.

## Casos de uso

- Reconocimiento automático del habla en euskera: fine-tunear una cabeza CTC sobre el encoder permite construir un sistema ASR específico para euskera con un WER de referencia del 13,53 % en el conjunto de test de 6 fuentes, adecuado para transcripción de medios públicos y parlamento.
- Reconocimiento automático del habla en castellano: con una cabeza CTC se obtiene un WER de referencia del 15,07 % en el test de 5 fuentes, útil para subtitulado y transcripción de reuniones en entornos controlados.
- Transcripción de sesiones parlamentarias bilingües: el modelo cubre ambas lenguas y se entrenó con Basque Parliament, por lo que es adecuado para diarización y transcripción de plenos y comisiones.
- Extracción de embeddings para búsqueda por voz: el vector pooled de 768 dimensiones sirve para indexar y recuperar fragmentos de audio por similitud semántica en archivos audiovisuales bilingües.
- Preprocesamiento para pipelines de clasificación de audio: con el encoder congelado se pueden entrenar clasificadores de habla/no-habla, detección de idioma o segmentación, usando las representaciones de frame como features.
- Base para experimentación académica en lenguas de bajos recursos: permite comparar estrategias de preentrenamiento específicas frente a modelos multilingües como mHuBERT-147 en euskera y castellano.
- Detección de emociones en euskera (con reservas): sirve como punto de partida, aunque el propio autor advierte que otros HuBERT rinden mejor (67,77 % frente a 85,32 % de mHuBERT-147).

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) en ASR con cabeza CTC, WER por frase, decodificación greedy sin modelo de lenguaje:

| Modelo | WER euskera (6 fuentes, 5.205 utts) | WER castellano (5 fuentes, 1.020 utts) |
|---|---:|---:|
| hubert-base-eu-es (este modelo) | 13,53 % | 15,07 % |
| mHuBERT-147 | 16,08 % | 17,37 % |
| HuBERT-ls960 | 18,24 % | 20,00 % |

Reconocimiento de emociones en euskera (3 clases, leave-one-speaker-out, 7.212 utts, 4 hablantes):

| Modelo | Accuracy |
|---|---:|
| hubert-base-eu-es (este modelo) | 67,77 % |
| mHuBERT-147 | 85,32 % |
| HuBERT-ls960 | 76,97 % |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los ~94 M de parámetros (el repo pesa 0,4 GB); en fp16 aproximadamente 0,2 GB.
- GPU recomendadas: cualquier GPU moderna es suficiente; A100, H100 o RTX 4090 quedan sobredimensionadas para inferencia, aunque aceleran el fine-tuning.
- Cabe en cualquier GPU consumer: RTX 3060, RTX 4060, GTX 1660, e incluso en CPU para inferencia de audio corto.
- Opciones de despliegue: transformers (HubertModel + Wav2Vec2FeatureExtractor); no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI (no aplicables a un encoder de audio).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | WER euskera | WER castellano | Licencia |
|---|---|---:|---:|---:|---|
| hubert-base-eu-es | 94 M | eu, es | 13,53 % | 15,07 % | Apache 2.0 |
| mHuBERT-147 | ~95 M | 147 idiomas | 16,08 % | 17,37 % | no disponible en la información |
| HuBERT-ls960 | ~95 M | en (base) | 18,24 % | 20,00 % | no disponible en la información |

## Limitaciones y advertencias

- No incluye tokenizer ni cabecera de tarea: no transcribe ni clasifica directamente; requiere fine-tuning.
- Rendimiento inferior en reconocimiento de emociones: 17,6 puntos por debajo de mHuBERT-147 y 9,2 por debajo de HuBERT-ls960; el autor recomienda usar otras alternativas para esa tarea.
- Solo soporta euskera y castellano; no está diseñado para otros idiomas.
- Los conjuntos de test no son disjuntos por hablante, lo que puede inflar ligeramente las métricas declaradas.
- Los benchmarks están declarados por el autor y no están verificados (`verified: false`).
- Riesgo de sesgo derivado de las fuentes de entrenamiento (CommonVoice, parlamento, corpus internos), con posible infrarepresentación de acentos y registros no cubiertos.
- Riesgo de alucinación en sentido estricto no aplica (no genera texto), pero las transcripciones derivadas de cabezas CTC pueden producir errores en audio ruidoso o con solapamiento de hablantes.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las licencias de los datasets de origen (CommonVoice, VoxPopuli, MLS, OpenSLR) para usos derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arrandi/hubert-base-eu-es
- Receta HuBERT de fairseq: https://github.com/facebookresearch/fairseq/tree/main/examples/hubert
- Dataset Basque Parliament: https://huggingface.co/datasets/gttsehu/basque_parliament_1
- CommonVoice: https://commonvoice.mozilla.org/
- OpenSLR 76: https://openslr.org/76/
- OpenSLR 69: https://openslr.org/69/
- VoxPopuli: https://huggingface.co/datasets/facebook/voxpopuli
- MLS: https://huggingface.co/datasets/fleurs/multilingual_librispeech
- mHuBERT-147: https://huggingface.co/utter-project/mHuBERT-147
- HuBERT-ls960: https://huggingface.co/facebook/hubert-base-ls960
- Guía de fine-tuning de wav2vec2: https://huggingface.co/blog/fine-tune-wav2vec2-english
- Saratxaga et al., 2006: https://aclanthology.org/L06-1009/
- Sainz et al., 2012: https://aclanthology.org/L12-1014/

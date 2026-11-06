# anyantudre/waxal-asr-challenge-models

## Resumen

WAXAL ASR Challenge Models es un repositorio de checkpoints de reconocimiento automático del habla (ASR) desarrollado por el usuario anyantudre para la competición Google WAXAL ASR Challenge. No se trata de un modelo único, sino de una colección de seis ajustes finos de arquitecturas Wav2Vec2 y W2v-BERT orientados a la transcripción de tres lenguas africanas de bajos recursos: lingala (ln), shona (sn) y luganda (lg). El repositorio se publica como respaldo privado de checkpoints y ocupa 66,3 GB.

La relevancia del proyecto radica en su enfoque en lenguas africanas escasamente representadas en los corpus ASR habituales, empleando entrenamiento conjunto sobre las tres lenguas con una partición de validación disjunta por hablante para evitar filtraciones. El checkpoint destacado, basado en facebook/w2v-bert-2.0, obtiene la mejor puntuación compuesta de la métrica de la competición (0,5·WER + 0,5·CER), con 0,1775 en condiciones limpias y 0,2250 en condiciones degradadas.

La licencia es Apache-2.0, aunque los modelos base y el corpus de entrenamiento (google/WaxalNLP) tienen sus propias condiciones que deben respetarse. El repositorio no incluye información sobre parámetros totales, contexto ni cuantizaciones, por lo que varios campos de la ficha quedan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder CTC (Wav2Vec2ForCTC y W2v-BERT) |
| Parámetros totales | no disponible (los modelos base van de 300M en XLS-R a un tamaño mayor en W2v-BERT 2.0; el repositorio no lo detalla) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ASR por frames de audio; no se especifica ventana máxima) |
| Tipos de cuantización | no disponible (pesos en safetensors sin variantes GGUF publicadas) |
| Idiomas soportados | lingala (ln), shona (sn), luganda (lg) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Los seis checkpoints son ajustes finos de tipo `Wav2Vec2ForCTC` con vocabulario a nivel de carácter. El modelo principal, `w2vbert_multi`, parte de facebook/w2v-bert-2.0; los cinco restantes parten de facebook/wav2vec2-xls-r-300m. Todos se entrenan de forma conjunta sobre las tres lenguas (lin, sna, lug) usando la partición de entrenamiento de google/WaxalNLP, con una partición de validación disjunta por hablante para medir la generalización.

Las variantes exploran distintas estrategias de robustez y aumento de datos: `xlsr_aug` aplica aumento MCT (mejorando la degradación en +0,0484), `xlsr_robust` aplica MCT completo, `xlsr_ext` incorpora datos externos de FLEURS y `xlsr_pseudo` emplea pseudo-etiquetas generadas por un ensemble de tres modelos (destilación estudiante). No se especifica el número de tokens de audio ni la composición exacta del dataset. La métrica de la competición es 0,5·WER + 0,5·CER evaluada sobre la partición disjunta por hablante y sobre una banda corrompida con MUSAN y RIR. No se usaron datos de test de la Fase 1.

## Capacidades

- Reconocimiento automático del habla (transcripción de audio a texto) en lingala, shona y luganda.
- Salida a nivel de carácter mediante decodificación CTC.
- Entrenamiento multilingüe conjunto para las tres lenguas, lo que permite un único modelo para varios idiomas.
- Robustez frente a ruido y reverberación en las variantes con aumento MCT (MUSAN + RIR).
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio generativo.
- Capacidades multilingües limitadas a los tres idiomas indicados.

## Casos de uso

- Transcripción de reuniones y entrevistas en lingala, shona o luganda: el modelo convierte audio en texto con salida CTC, adecuado para digitalizar material oral en estas lenguas.
- Subtitulado automático de contenido audiovisual: permite generar subtítulos en tiempo casi real para vídeos en las tres lenguas, especialmente con la variante robusta entrenada con ruido y reverberación.
- Archivado y búsqueda de patrimonio oral: transcripción de grabaciones etnográficas o radiofónicas para hacerlas indexables y consultables por texto.
- Atención al ciudadano en servicios públicos: transcripción de llamadas o mensajes de voz en lenguas africanas para su posterior procesamiento por sistemas de gestión de casos.
- Investigación lingüística de corpus: generación de transcripciones a nivel de carácter para análisis fonético y morfológico de las tres lenguas.
- Evaluación comparativa de ASR de bajos recursos: los seis checkpoints permiten reproducir la comparativa entre XLS-R y W2v-BERT 2.0 y medir el efecto de aumento de datos y pseudo-etiquetado.
- Pipelines de accesibilidad: conversión de voz a texto para personas con discapacidad auditiva en comunidades lingüísticas de África central y oriental.

## Benchmarks y rendimiento

La model card reporta la métrica de la competición (0,5·WER + 0,5·CER) sobre la partición disjunta por hablante y sobre la banda corrompida con MUSAN+RIR. Se muestran los valores disponibles; el resto de checkpoints no tienen cifras publicadas en la información proporcionada.

| Checkpoint | Base | Limpio (0,5·WER+0,5·CER) | Corrupto (MUSAN+RIR) |
|---|---|---|---|
| w2vbert_multi | facebook/w2v-bert-2.0 | 0,1775 | 0,2250 |
| xlsr_multi | facebook/wav2vec2-xls-r-300m | 0,1862 | 0,2456 |
| xlsr_aug | facebook/wav2vec2-xls-r-300m | no disponible | no disponible (degradación +0,0484) |
| xlsr_robust | facebook/wav2vec2-xls-r-300m | no disponible | no disponible |
| xlsr_ext | facebook/wav2vec2-xls-r-300m | no disponible | no disponible |
| xlsr_pseudo | facebook/wav2vec2-xls-r-300m | no disponible | no disponible |

No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni otras tareas estándar, ya que el modelo es exclusivamente de ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Para los modelos XLS-R de 300M se puede estimar en torno a 1,2-2,5 GB en fp16 y menos de 1 GB en cuantización de 8 bits; para W2v-BERT 2.0 el requisito es mayor, aunque el repositorio no publica cifras.
- GPU recomendadas: no especificadas por el autor. Por tamaño, los modelos XLS-R de 300M caben en GPUs de consumo como RTX 3060, RTX 4060 o RTX 4090; W2v-BERT 2.0 requiere al menos una GPU con 8-16 GB según precisión.
- Cabe en GPU de consumo: sí para las variantes XLS-R; para W2v-BERT 2.0 es probable pero no está confirmado en la información disponible.
- Opciones de despliegue: no se indican en la model card. Al ser safetensors de Hugging Face Transformers, puede usarse con la librería `transformers`; no se publican variantes GGUF para llama.cpp ni Ollama, y no hay confirmación de soporte en vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Idiomas | Licencia | Métrica (limpio) | Disponibilidad |
|---|---|---|---|---|---|
| w2vbert_multi (este repo) | w2v-bert-2.0 | ln, sn, lg | Apache-2.0 | 0,1775 | Hugging Face |
| xlsr_multi (este repo) | wav2vec2-xls-r-300m | ln, sn, lg | Apache-2.0 | 0,1862 | Hugging Face |
| facebook/w2v-bert-2.0 | W2v-BERT 2.0 | multilingüe (no africanas específicas) | MIT (según modelo base) | no disponible | Hugging Face |
| facebook/wav2vec2-xls-r-300m | XLS-R 300M | multilingüe | Apache-2.0 | no disponible | Hugging Face |

La comparativa con modelos ASR específicos para lenguas africanas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El repositorio se describe como respaldo privado de checkpoints; no está pensado como un paquete de distribución estable y puede cambiar sin aviso.
- Solo cubre tres lenguas (lingala, shona y luganda); no es un modelo multilingüe general.
- No se publican cifras de parámetros totales, contexto máximo ni cuantizaciones, lo que dificulta planificar el despliegue.
- Riesgo de alucinación y errores de transcripción inherente a los modelos CTC, especialmente en audio ruidoso o con acentos no representados en el corpus.
- Los sesgos del corpus google/WaxalNLP (distribución de hablantes, dominios y calidad de grabación) se trasladan al modelo.
- Aunque la licencia del repositorio es Apache-2.0, los modelos base y el dataset de entrenamiento tienen sus propias licencias que deben respetarse; el autor indica explícitamente que se respete la licencia de google/WaxalNLP.
- No se usaron datos de test de la Fase 1 de la competición, pero el rendimiento en dominios distintos al de entrenamiento no está documentado.
- Ausencia de soporte para tool calling, agentes o razonamiento; su uso en producción debe limitarse a transcripción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/anyantudre/waxal-asr-challenge-models
- Modelo base W2v-BERT 2.0: https://huggingface.co/facebook/w2v-bert-2.0
- Modelo base XLS-R 300M: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- Corpus de entrenamiento: https://huggingface.co/datasets/google/WaxalNLP
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.

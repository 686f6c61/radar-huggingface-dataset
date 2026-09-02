# dianavdavidson/wav2vec2-xls-r-300m-mucs-62255-hinglish_mixed_scripts-45_100-1e-4-epochs-100-FT

## Resumen

Este modelo es un ajuste fino de `facebook/wav2vec2-xls-r-300m`, la variante de 300 millones de parametros de la familia XLS-R de Meta, especializado en reconocimiento automatico del habla (ASR) para hinglish, es decir, el cambio de codigo entre hindi e ingles tipico de la comunicacion oral en la India. El nombre del repositorio sugiere que fue entrenado sobre el dataset MUCS (Multilingual and Code-Switching ASR challenge) con transcripciones en escritura mixta (devanagari y latina), aunque la model card no documenta explicitamente el conjunto de datos utilizado.

El modelo fue desarrollado por el usuario `dianavdavidson` y publicado con licencia Apache 2.0. Con 315,5 millones de parametros totales y un tamano de repositorio de 1,3 GB, esta pensado para tareas de transcripcion de audio en hinglish. El entrenamiento se realizo durante 100 epocas con una tasa de aprendizaje de 1e-4, alcanzando una perdida de validacion de 0,8655 y un WER global de 21,71% sobre el conjunto de evaluacion. La relevancia de este modelo radica en abordar un escenario linguistico poco cubierto por los ASR comerciales: el habla code-switched con escritura mixta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 (transformer encoder con cuantizacion de caracteristicas) |
| Parametros totales | 315.550.445 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (wav2vec 2.0 procesa audio por ventanas; el contexto efectivo depende de la configuracion de extraccion de caracteristicas) |
| Tipos de cuantizacion | no disponible (repositorio en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | hinglish (hindi-ingles code-switched); el modelo base XLS-R soporta 128 idiomas, pero este ajuste se centra en hinglish |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura wav2vec 2.0, un encoder transformer que aprende representaciones de audio mediante aprendizaje autosupervisado. El modelo base, XLS-R 300M, fue preentrenado sobre 436.000 horas de audio no etiquetado en 128 idiomas, utilizando una funcion de perdida contrastiva con cuantizacion de caracteristicas y enmascaramiento temporal. Sobre esta base, el modelo se ajusto finamente con una cabeza de clasificacion CTC (Connectionist Temporal Classification) para la tarea de transcripcion fonetica.

El entrenamiento de ajuste fino se realizo con los siguientes hiperparametros: tasa de aprendizaje de 0,0001, tamano de lote de 16 (32 con acumulacion de gradientes de 2 pasos), optimizador AdamW con betas (0,9, 0,999), programador de tasa de aprendizaje constante con calentamiento de 500 pasos, y 100 epocas en total. Se utilizo precision mixta nativa (Native AMP). El dataset de entrenamiento no esta documentado en la model card, pero la nomenclatura del repositorio (`mucs-62255`, `hinglish_mixed_scripts`) indica que se trata de datos del desafio MUCS 2022 con transcripciones en escritura mixta devanagari-latina. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion posteriores al ajuste supervisado.

## Capacidades

- Transcripcion de habla hinglish: reconoce audio con alternancia de codigo entre hindi e ingles, incluyendo frases hibridas y prestamos linguisticos.
- Reconocimiento de escritura mixta: el nombre del modelo indica soporte para transcripciones que combinan devanagari y alfabeto latino.
- Procesamiento de audio multilingue heredado: al partir de XLS-R 300M, conserva representaciones de audio entrenadas en 128 idiomas, aunque el ajuste fino puede haber reducido el rendimiento fuera del dominio hinglish.
- Inferencia de audio en tiempo real o por lotes: compatible con el pipeline `automatic-speech-recognition` de HuggingFace Transformers.
- No soporta tool calling, generacion de codigo, razonamiento ni capacidades multimodales: es un modelo exclusivamente de ASR.

## Casos de uso

- Transcripcion de conversaciones code-switched: el modelo puede transcribir llamadas o grabaciones donde los hablantes alternan entre hindi e ingles, algo comun en entornos empresariales y educativos de la India. Su WER de 21,71% en evaluacion lo hace util para transcripcion asistida, no para precision absoluta.
- Subtitulado de contenido audiovisual: adecuado para generar subtitulos preliminares de videos, podcasts o webinars en hinglish, que luego pueden corregirse manualmente. La ventana de contexto de wav2vec 2.0 permite procesar segmentos de audio de varios segundos de forma continua.
- Analisis de centros de atencion al cliente: integrable en pipelines de analitica de voz para transcribir interacciones de soporte en hinglish y extraer metricas de calidad o deteccion de intenciones mediante procesamiento posterior del texto.
- Asistentes de voz para el mercado indio: puede servir como modulo de ASR en asistentes o aplicaciones de dictado dirigidas a usuarios que hablan hinglish, combinado con un modelo de lenguaje para post-procesamiento.
- Transcripcion de contenido educativo: util para convertir clases grabadas, tutoriales o seminarios en hinglish a texto, facilitando la busqueda y el acceso a material academico.
- Archivado y busqueda de audio: permite indexar archivos de audio en hinglish convirtiendolos a texto para su posterior busqueda por palabras clave, aplicable en bibliotecas digitales o archivos corporativos.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks externos (el campo `results` del model-index esta vacio). Los unicos datos disponibles son los del conjunto de evaluacion durante el entrenamiento:

| Metrica | Valor |
|---|---|
| Perdida de validacion | 0,8655 |
| WER global | 21,71% |

La evolucion del WER durante el entrenamiento muestra una mejora progresiva desde 100% en la epoca 1 hasta un minimo de 21,23% en la epoca 16, con una ligera fluctuacion posterior (21,71% en la epoca 19). No se han publicado comparaciones con otros modelos de ASR en hinglish.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en FP32 y unos 650 MB en FP16, lo que permite ejecutar el modelo en GPUs de consumo con 4 GB de VRAM o mas.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, RTX 4090, o GPUs de datacenter como A10, A100 o H100 para inferencia por lotes a mayor velocidad.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de gama media y baja gracias a su tamano moderado.
- Opciones de despliegue: HuggingFace Transformers con pipeline `automatic-speech-recognition`, o mediante servidores de inferencia como HuggingFace Inference Endpoints. No se han publicado integraciones con vLLM, llama.cpp u Ollama, que estan orientados a modelos de lenguaje, no a ASR.
- Latencia y throughput: no disponible. Depende del hardware y de la longitud del audio de entrada; en una GPU moderna se espera un factor de tiempo real inferior a 1 (procesa mas rapido que la duracion del audio), pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (hinglish) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (mucs-62255) | 315,5 M | no disponible | 21,71% | Apache 2.0 | HuggingFace |
| facebook/wav2vec2-xls-r-300m (base) | 315,5 M | no disponible | no evaluado en hinglish | MIT | HuggingFace |
| wav2vec2-xls-r-300m-mucs-62230 (variante del mismo autor) | 315,5 M | no disponible | no disponible | Apache 2.0 | HuggingFace |

La variante `mucs-62230` del mismo autor sigue la misma nomenclatura y probablemente fue entrenada con un subconjunto diferente del dataset MUCS, pero no se dispone de sus metricas. El modelo base XLS-R 300M no esta ajustado para hinglish y su rendimiento en este dominio seria significativamente peor. No se dispone de comparaciones con otros modelos ASR como Whisper o IndicWav2Vec en este escenario especifico.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: la model card indica "More information needed" para los apartados de datos de entrenamiento y evaluacion, lo que dificulta evaluar la representatividad y posibles sesgos del conjunto de datos.
- WER relativamente alto: con un 21,71% de WER global, el modelo no es adecuado para transcripcion automatica sin supervision humana en contextos donde se requiera alta precision.
- Especializacion limitada: el ajuste fino puede haber degradado el rendimiento en otros idiomas o variantes del hindi fuera del dominio hinglish code-switched.
- Model card auto-generada: la documentacion es minima y generada automaticamente por el Trainer de HuggingFace, sin descripcion de usos previstos, limitaciones ni procedimiento de entrenamiento detallado.
- Sin cuantizaciones publicadas: no se ofrecen versiones GGUF, ONNX o cuantizadas, lo que limita el despliegue en entornos con restricciones de memoria o en CPU.
- Riesgo de alucinacion fonetica: como cualquier modelo ASR, puede producir transcripciones incorrectas en audio con ruido, acentos no representados en el dataset o solapamiento de hablantes.
- Licencia Apache 2.0: permite uso comercial sin restricciones, pero el modelo base XLS-R esta bajo licencia MIT, por lo que no hay conflicto de licencias.

## Enlaces

- Repositorio del modelo: https://huggingface.co/dianavdavidson/wav2vec2-xls-r-300m-mucs-62255-hinglish_mixed_scripts-45_100-1e-4-epochs-100-FT
- Modelo base: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- Variante similar del mismo autor: https://huggingface.co/dianavdavidson/wav2vec2-xls-r-300m-mucs-62230-hinglish_mixed_scripts-1e-4-epochs-100-FT
- Documentacion de torchaudio para XLS-R 300M: https://docs.pytorch.org/audio/stable/generated/torchaudio.pipelines.WAV2VEC2_XLSR_300M.html
- Tutorial de uso de wav2vec2-xls-r-300m para ASR multilingue: https://aiindigo.com/tutorials/getting-started-with-wav2vec2-xls-r-300m-mixed-multilingual-transcription-in-pyt

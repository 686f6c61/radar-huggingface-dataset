# Anahia/distilbert-jigsaw-toxicity-multilabel

## Resumen
Anahia/distilbert-jigsaw-toxicity-multilabel es un modelo de clasificacion de texto publicado en HuggingFace por el usuario Anahia, construido sobre la arquitectura DistilBERT. Por el identificador del repositorio y las etiquetas asociadas, se trata de un ajuste fino orientado a la deteccion de toxicidad en formato multilabel (varias etiquetas de toxicidad activables de forma simultanea por comentario). El repositorio contiene 66.957.317 parametros en formato safetensors y ocupa 0,3 GB.

El modelo parte de DistilBERT, un encoder transformer de 6 capas y 66 millones de parametros destilado a partir de BERT-base, lo que lo situa en la gama de modelos ligeros capaces de ejecutarse en CPU o en GPUs de consumo con latencias de milisegundos. Es relevante para tareas de moderacion de contenido a escala porque permite procesar grandes volumenes de comentarios con un coste computacional muy bajo en comparacion con modelos encoder de 110-340 millones de parametros.

La model card publicada es practicamente vacia: solo declara licencia MIT. No incluye informacion sobre el dataset de entrenamiento, las etiquetas concretas, metricas de evaluacion, idiomas soportados ni limitaciones. Toda la informacion tecnica detallada en esta ficha procede de los metadatos del repositorio y de las caracteristicas publicas de la arquitectura DistilBERT, y se senala explicitamente cuando un dato no esta disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT), 6 capas, hidden 768, 12 cabezas de atencion (derivado de la arquitectura base; no confirmado en la model card) |
| Parametros totales | 66.957.317 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (limite de posiciones de DistilBERT; no declarado en la model card) |
| Tipos de cuantizacion | No disponible en el repositorio (solo pesos safetensors en precision completa; cuantizable a fp16/int8/ONNX con Optimum) |
| Idiomas soportados | No disponible; el modelo base DistilBERT esta entrenado principalmente en ingles |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,3 GB |
| Pipeline declarado | No disponible |
| Fecha de creacion | 2026-09-15 |
| Ultima actualizacion | 2026-09-15 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento
La arquitectura subyacente es DistilBERT, un transformer encoder de 6 capas, dimension oculta 768 y 12 cabezas de atencion por capa, obtenido mediante destilacion de conocimiento de BERT-base (12 capas). El proceso de destilacion original reduce el numero de capas a la mitad conservando alrededor del 97 % del rendimiento de BERT-base en GLUE segun la documentacion publica de DistilBERT, a cambio de ser aproximadamente un 40 % mas pequeno y un 60 % mas rapido. Sobre ese backbone se anade una cabeza de clasificacion para la tarea de toxicidad multilabel.

El recuento real de parametros (66.957.317) es 2.307 parametros superior al de distilbert-base-uncased (66.955.010). Esa diferencia coincide exactamente con el tamano de una capa lineal de clasificacion de 768 x 3 mas 3 sesgos (2.307 = 768 x 3 + 3), lo que sugiere una cabeza de 3 etiquetas de salida. Es una deduccion aritmetica a partir de los metadatos, no un dato declarado por el autor. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset (aunque el nombre del repositorio apunta al corpus Jigsaw de comentarios toxicos), el uso de RLHF/DPO ni los hiperparametros de ajuste fino.

## Capacidades
- Clasificacion de texto multilabel: asignacion de multiples etiquetas de toxicidad a un mismo texto de entrada, segun indica el identificador del modelo.
- Deteccion de contenido toxico en comentarios: presumiblemente entrenado sobre el corpus Jigsaw, orientado a moderacion de foros y secciones de comentarios.
- Inferencia de bajo coste: 66,9 millones de parametros permiten ejecucion en CPU con latencias del orden de milisegundos por lote pequeno.
- Extraccion de representaciones: al ser un encoder, puede utilizarse para obtener embeddings contextuales de frases y alimentar clasificadores posteriores.
- Soporte de tool calling / function calling: no disponible (modelo encoder de clasificacion, no generativo).
- Soporte de agentes y razonamiento multi-paso: no aplicable; no es un modelo generativo.
- Capacidades multilingues: no disponibles ni declaradas; se espera un comportamiento limitado fuera del ingles.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso
- Moderacion de comentarios en plataformas editoriales: el modelo clasifica cada comentario entrante con una o varias etiquetas de toxicidad, permitiendo un filtrado automatico previo a la revision humana; su tamano reducido hace viable procesar millones de comentarios al dia en infraestructura modesta.
- Pre-filtrado en colas de moderacion humana: se aplica como primera pasada para priorizar los casos mas graves y reducir la carga de los revisores, dejando pasar a revision manual solo los textos marcados.
- Analisis de toxicidad en redes sociales a gran escala: permite etiquetar corpus historicos completos de tuits o posts para estudios cuantitativos sobre incivilidad, sesgo o evolucion temporal del discurso.
- Monitorizacion de comunidades y soporte al cliente: deteccion automatica de mensajes abusivos en tickets o chats para activar protocolos de escalado o respuestas predefinidas.
- Investigacion en NLP y reproducibilidad: al ser un encoder pequeno con pesos abiertos bajo licencia MIT, sirve como linea base rapida para comparar tecnicas de clasificacion multilabel o de mitigacion de sesgo.
- Clasificacion por lotes en pipelines de datos: integrable como paso de un ETL que enriquezca cada documento con etiquetas de toxicidad antes de almacenarlo en un data warehouse.
- Filtrado de datasets de entrenamiento: uso del modelo para descartar ejemplos toxicos de corpus destinados a entrenar otros modelos generativos.
- Analitica de producto: medicion de la tasa de toxicidad por canal, hilo o comunidad para informes internos de calidad de la plataforma.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall, F1, exact match multilabel ni resultados sobre las particiones de validacion o test de Jigsaw, ni comparaciones con modelos alternativos.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 270 MB en fp32 (66,9 M de parametros x 4 bytes), unos 135 MB en fp16 y alrededor de 70 MB en int8. El repositorio ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Funciona sin problema en RTX 3060, RTX 4090, T4, A10, L4, A100 y H100; en estas ultimas el modelo queda muy infrautilizado y conviene agrupar peticiones (batching) para aprovechar el paralelismo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida.
- Ejecucion en CPU: totalmente viable; es uno de los escenarios recomendados dada la latencia baja esperada con batching de decenas a cientos de ejemplos.
- Opciones de despliegue: libreria transformers (pipeline de text-classification), ONNX Runtime y Optimum para optimizacion, TorchServe, Triton Inference Server, FastAPI con un servidor propio, o exportacion a otros runtimes de inferencia. Tambien es posible cargarlo en entornos serverless con memoria reducida.
- Latencia y throughput estimados: no disponibles. Como referencia cualitativa, un encoder de este tamano suele procesar cientos o miles de secuencias por segundo en GPU con batching y decenas por segundo por nucleo en CPU, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros aprox. | Contexto | Etiquetas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Anahia/distilbert-jigsaw-toxicity-multilabel | 66,9 M | 512 tokens | 3 salidas segun la deduccion del recuento de parametros | MIT | HuggingFace, 0 descargas |
| unitary/toxic-bert | ~110 M (BERT-base) | 512 tokens | 6 clases de toxicidad Jigsaw | Apache-2.0 | HuggingFace, ampliamente usado |
| martin-ha/toxic-comment-model | ~66,9 M (DistilBERT) | 512 tokens | Multilabel tipo Jigsaw | No disponible | HuggingFace |
| cardiffnlp/twitter-roberta-base-offensive | ~125 M (RoBERTa-base) | 512 tokens | Varias clases de ofensividad en tuits | No disponible | HuggingFace |

Las cifras de los modelos alternativos son aproximadas y proceden de su documentacion publica; no se dispone de comparaciones de rendimiento entre ellos y este modelo, por lo que no es posible establecer cual es mejor en ninguna metrica concreta.

## Limitaciones y advertencias
- Model card practicamente vacia: no se documentan dataset de entrenamiento, etiquetas exactas, hiperparametros, metricas ni limitaciones. No es recomendable su uso en produccion sin una evaluacion propia previa.
- Cero descargas y cero likes: el modelo no ha sido validado por la comunidad ni tiene trazabilidad de uso.
- Riesgo de sesgo: los corpus de toxicidad tipo Jigsaw tienden a sobrerrepresentar ciertos terminos identitarios (por ejemplo, referencias a colectivos minoritarios) como indicadores de toxicidad, lo que produce falsos positivos sobre textos no toxicos que mencionan esos terminos.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de clasificaciones incorrectas y de etiquetado parcial en el modo multilabel; sin metricas publicadas no se puede acotar la tasa de error.
- Limitacion de contexto: 512 tokens heredados de DistilBERT; los textos mas largos deben truncarse o segmentarse, con la consiguiente perdida de informacion.
- Limitacion de idioma: no se declara soporte multilingue; el backbone esta entrenado principalmente en ingles y se espera un rendimiento degradado en castellano u otros idiomas.
- Licencia: los pesos se publican bajo MIT, lo que permite uso comercial de los pesos. Sin embargo, no se indica la licencia del dataset de entrenamiento (si el ajuste fino se hizo sobre Jigsaw, conviene revisar sus condiciones de uso) ni la procedencia de los datos, lo que introduce incertidumbre legal en despliegues comerciales.
- Ausencia de pipeline declarado y de ficha tecnica de inferencia: el integrador debe determinar por si mismo la lista exacta de etiquetas de salida y el umbral de decision.
- Fechas de publicacion y actualizacion muy proximas entre si (menos de 12 minutos de diferencia) y ambas en 2026, lo que sugiere un repositorio subido de golpe y sin mantenimiento posterior.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/Anahia/distilbert-jigsaw-toxicity-multilabel
- No se han encontrado en la busqueda web papers, blogs, repositorios de codigo ni demos adicionales asociados a este modelo concreto.
- Referencia de la arquitectura base (DistilBERT, Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Modelo base distilbert-base-uncased: https://huggingface.co/distilbert-base-uncased
- Dataset Jigsaw Toxic Comment Classification Challenge (referencia por el nombre del repositorio): https://www.kaggle.com/c/jigsaw-toxic-comment-classification-challenge

# JamesASnook1/learn_hf_food_not_food_text_classifier-distilbert-base-uncased

## Resumen

learn_hf_food_not_food_text_classifier-distilbert-base-uncased es un clasificador de texto binario obtenido mediante fine-tuning de distilbert-base-uncased y publicado por el usuario JamesASnook1 en HuggingFace. El nombre del repositorio indica que la tarea consiste en decidir si un texto trata de comida o no ("food / not food"), aunque la model card no documenta ni el dataset ni el mapeo de etiquetas. Es, por tanto, un encoder de 6 capas y 66.955.010 parámetros segun los pesos safetensors publicados, con una ventana de contexto de 512 tokens heredada del modelo base.

El interes practico es acotado pero claro: se trata de un clasificador minusculo (repositorio de 0,3 GB) entrenado durante 10 epocas con AdamW, tasa de aprendizaje 1e-4 y una planificacion lineal, que declara accuracy 1.0 y loss 0.0006 sobre el conjunto de evaluacion. Esos valores, junto con los 7 pasos por epoca registrados en el log de entrenamiento (unas 224 muestras de entrenamiento con batch 32), apuntan a un dataset muy reducido y a una evaluacion trivial.

La licencia es Apache 2.0, el modelo es compatible con la libreria transformers y, por tamano, puede ejecutarse en CPU o en cualquier GPU de consumo. Su relevancia actual es la de una pieza de demostracion docente (el identificador "learn_hf" sugiere un ejercicio de aprendizaje de HuggingFace) y no la de un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo DistilBERT (6 capas, hidden 768, 12 cabezas de atencion) con cabeza de clasificacion de secuencia |
| Parametros totales | 66.955.010 (segun safetensors del repositorio) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (heredada de distilbert-base-uncased) |
| Tipos de cuantizacion | no se publican versiones cuantizadas; es cuantizable a int8 dinamico con PyTorch y exportable a ONNX |
| Idiomas soportados | no disponible (el modelo base esta entrenado principalmente en ingles y el tokenizer es uncased) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tarea | text-classification (clasificacion binaria, presumiblemente food / not food) |
| Modelo base | distilbert/distilbert-base-uncased |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (metadatos) | 2026-10-16 |

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT base: un transformer encoder de 6 capas con 768 dimensiones ocultas y 12 cabezas de atencion, destilado a partir de BERT-base mediante destilacion de conocimiento (perdida de destilacion, perdida enmascarada de lenguaje y perdida de similitud coseno de estados ocultos). El modelo base reduce en aproximadamente un 40 % los parametros de BERT-base manteniendo un rendimiento declarado cercano al 97 % en las tareas de GLUE, y emplea un tokenizer WordPiece con vocabulario de 30.522 entradas que normaliza el texto a minusculas. Sobre esa base se anade una cabeza de clasificacion de secuencia que produce logits por clase; el numero exacto de etiquetas no esta documentado en la model card.

El fine-tuning se realizo con los siguientes hiperparametros declarados: learning_rate 0.0001, train_batch_size 32, eval_batch_size 32, semilla 42, optimizador AdamW (variante fused, betas 0.9/0.999, epsilon 1e-8), planificador lineal y 10 epocas. El log muestra 7 pasos por epoca, lo que implica un conjunto de entrenamiento de aproximadamente 224 ejemplos (70 pasos totales); el dataset, su composicion y el conjunto de evaluacion no se describen en la model card (aparecen como "unknown dataset" y "More information needed" en todas las secciones). La accuracy de validacion es 1.0 desde la primera epoca y la loss de validacion cae monotonamente hasta 0.0006, un patron consistente con un dataset minusculo y sin separacion real entre entrenamiento y validacion.

## Capacidades

- Clasificacion de texto binaria sobre secuencias de hasta 512 tokens: dado un texto, devuelve logits/una probabilidad por clase.
- Inferencia por lotes (batch) tanto en CPU como en GPU mediante `transformers.pipeline("text-classification")` o `AutoModelForSequenceClassification`.
- Procesamiento de texto en minusculas mediante tokenizer WordPiece uncased; no distingue mayusculas.
- Compatibilidad declarada con endpoints de HuggingFace (tag `endpoints_compatible`) y con el stack de transformers 5.x.
- No dispone de generacion de texto, razonamiento multi-paso, codigo, matematicas, vision ni audio.
- No soporta tool calling ni function calling.
- No soporta comportamiento de agente ni planificacion.
- Capacidades multilingues: no documentadas y, dado el modelo base, muy limitadas fuera del ingles.
- No dispone de modo "thinking" ni de ningun mecanismo especial de razonamiento.

## Casos de uso

- Filtrado de recetas y contenido gastronomico en una aplicacion de cocina: el clasificador puede descartar entradas que no tratan de comida antes de pasarlas a un motor de busqueda o a un modelo mayor, reduciendo coste de inferencia en el resto del pipeline.
- Enrutamiento de consultas en un chatbot de restaurantes: el modelo decide en una primera etapa si la consulta del usuario es de tematica alimentaria y, en caso contrario, la deriva a un flujo generico.
- Etiquetado previo de un corpus para entrenar un modelo mayor: uso como anotador automatico (pre-labeling) de grandes volumenes de texto, con revision humana posterior de las discrepancias.
- Limpieza y curaduria de datasets: eliminar ejemplos no relacionados con alimentacion en un corpus recolectado de redes sociales o foros, aprovechando el bajo coste por inferencia.
- Analisis de opinion de marca en redes sociales: clasificar menciones como relacionadas o no con alimentacion antes de aplicar un analisis de sentimiento especifico del dominio.
- Despliegue en el borde (edge) o en entornos sin GPU: con menos de 300 MB en fp32 y unas decenas de MB en int8, cabe en dispositivos con recursos muy limitados para tareas de moderacion o triaje en tiempo real.
- Demo educativa o test de integracion: por su tamano, es util para validar pipelines de MLOps (empaquetado, servido, versionado) antes de pasar a modelos de mayor tamano.

## Benchmarks y rendimiento

El campo `model-index` del repositorio esta vacio: no se declaran resultados en benchmarks estandar como MMLU, GLUE, HumanEval o GSM8K. Los unicos datos disponibles son los del propio log de entrenamiento de la model card:

| Epoca | Paso | Loss de entrenamiento | Loss de validacion | Accuracy |
|---|---|---|---|---|
| 1.0 | 7 | 0.3771 | 0.0540 | 1.0 |
| 2.0 | 14 | 0.0260 | 0.0068 | 1.0 |
| 3.0 | 21 | 0.0052 | 0.0025 | 1.0 |
| 4.0 | 28 | 0.0023 | 0.0014 | 1.0 |
| 5.0 | 35 | 0.0014 | 0.0010 | 1.0 |
| 6.0 | 42 | 0.0011 | 0.0008 | 1.0 |
| 7.0 | 49 | 0.0009 | 0.0007 | 1.0 |
| 8.0 | 56 | 0.0008 | 0.0006 | 1.0 |
| 9.0 | 63 | 0.0008 | 0.0006 | 1.0 |
| 10.0 | 70 | 0.0007 | 0.0006 | 1.0 |

Resultado final declarado: loss 0.0006 y accuracy 1.0 en el conjunto de evaluacion. No hay informacion sobre el tamano de dicho conjunto ni sobre su composicion, por lo que la cifra no es interpretable como medida de generalizacion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 270 MB en fp32, 135 MB en fp16/bf16 y 70 MB en int8. El repositorio ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; una RTX 4090, A100 o H100 estan enormemente sobredimensionadas para este modelo. No requiere GPU.
- Compatibilidad con GPU de consumo: si, cabe incluso en iGPU y en placas integradas; tambien funciona en CPU en solitario.
- Opciones de despliegue: `transformers` con `pipeline` o `AutoModelForSequenceClassification`, exportacion a ONNX Runtime, cuantizacion dinamica int8 de PyTorch, empaquetado en un endpoint de Inferencia de HuggingFace (el repositorio incluye los tags `endpoints_compatible` y `text-embeddings-inference`), y servido mediante FastAPI o similar. vLLM y TGI no son adecuados para un encoder de clasificacion de este tamano, ya que estan orientados a decodificacion generativa.
- Latencia y throughput: no disponibles (no se han publicado mediciones). Como referencia orientativa basada en el tamano del modelo, no medida, un encoder de ~67 M de parametros suele resolverse en el orden de milisegundos por lote pequeno en GPU y de decenas de milisegundos por lote pequeno en CPU.

## Comparativa con modelos similares

No hay datos de rendimiento comparables publicados para este fine-tuning. La comparacion se limita a caracteristicas estructurales y de licencia:

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (fine-tuning sobre distilbert-base-uncased) | 66,96 M | 512 tokens | DistilBERT + cabeza de clasificacion binaria | Apache 2.0 | HuggingFace, 0 descargas |
| distilbert/distilbert-base-uncased | ~66,4 M | 512 tokens | DistilBERT preentrenado (sin cabeza de tarea) | Apache 2.0 | HuggingFace, muy extendido |
| google-bert/bert-base-uncased | ~110 M | 512 tokens | BERT base | Apache 2.0 | HuggingFace, muy extendido |
| FacebookAI/roberta-base | ~125 M | 512 tokens | RoBERTa base | MIT | HuggingFace, muy extendido |
| Huaweinaomi/TinyBERT_General_4L_312D | ~14,5 M | 512 tokens | TinyBERT destilado | Apache 2.0 | HuggingFace |

Rendimiento comparado en tareas de clasificacion: no disponible, al no existir resultados de benchmarks para este modelo.

## Limitaciones y advertencias

- Accuracy 1.0 y loss 0.0006 desde la primera epoca: indicio claro de sobreajuste o de un conjunto de evaluacion trivial; no debe tomarse como estimacion fiable de rendimiento en datos reales.
- Dataset de entrenamiento no documentado: se desconoce la fuente, el tamano, la composicion, el idioma y el equilibrio entre clases, lo que impide evaluar sesgos y cobertura.
- Mapeo de etiquetas no documentado: la model card no especifica cuantas clases hay ni que indice corresponde a "food" y cual a "not food".
- Conjunto de evaluacion no descrito: no se puede saber si hay fuga de datos entre entrenamiento y evaluacion.
- Idioma: el modelo base esta entrenado principalmente en ingles y el tokenizer es uncased; el rendimiento en castellano u otros idiomas no esta validado ni documentado.
- Limite de 512 tokens: los textos mas largos requieren truncamiento o troceado, con la consiguiente perdida de contexto.
- Alucinacion: no aplica en sentido estricto, ya que el modelo no genera texto; el riesgo equivalente es la clasificacion erronea silenciosa, sin mecanismo de abtencion o "no lo se".
- Sesgos heredados: el modelo base se entreno sobre BooksCorpus y Wikipedia en ingles, por lo que puede arrastrar sesgos de genero, culturales y geograficos asociados a esos corpus.
- Licencia Apache 2.0: permite uso comercial y modificacion, siempre que se conserve el aviso de licencia y se documenten los cambios. No hay restricciones adicionales conocidas.
- Ausencia de validacion comunitaria: 0 descargas y 0 likes en el momento de redactar la ficha, sin informes externos de comportamiento.
- Discrepancia de parametros: los 66.955.010 parametros declarados en safetensors superan en unas 592.000 unidades el recuento canonico de distilbert-base-uncased con cabeza de clasificacion, diferencia que la model card no explica (posible vocabulario o cabeza de mayor tamano).
- Metadatos inconsistentes: las fechas de creacion y actualizacion indican 2026-10-16, y las versiones de framework declaradas (Transformers 5.18.0, PyTorch 2.11.0+cu130) corresponden a versiones no publicadas en el momento de redactar esta ficha; conviene verificar el entorno antes de reproducir el entrenamiento.
- No apto como componente de produccion sin una reevaluacion sobre datos propios con separacion estricta de entrenamiento, validacion y prueba.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JamesASnook1/learn_hf_food_not_food_text_classifier-distilbert-base-uncased
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Documentacion de DistilBERT (paper original de Sanh et al.): https://arxiv.org/abs/1910.01108
- Documentacion de transformers para clasificacion de secuencias: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Resultados de la busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos correspondian a sitios del servicio X (antes Twitter) y no guardan relacion con esta ficha.

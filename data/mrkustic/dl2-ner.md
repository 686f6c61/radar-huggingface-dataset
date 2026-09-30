# MrKustic/dl2-ner

## Resumen

dl2-ner es un modelo de reconocimiento de entidades nombradas (NER, *Named Entity Recognition*) publicado por el usuario MrKustic en HuggingFace. Se trata de un ajuste fino (*fine-tuning*) del modelo de embeddings BAAI/bge-small-en-v1.5, una arquitectura transformer de tipo encoder BERT con 33.215.625 parametros totales, sobre un dataset no identificado en la model card. La tarea declarada es `token-classification`, es decir, clasificacion a nivel de token para extraer entidades de un texto.

El modelo resuelve el problema clasico de etiquetado de secuencias: dado un texto de entrada, asignar a cada token una etiqueta de entidad (por ejemplo, persona, organizacion o lugar, segun el esquema de etiquetas del dataset de entrenamiento). Al derivar de `bge-small-en-v1.5`, hereda un encoder compacto (aproximadamente 33 millones de parametros, 12 capas y 384 dimensiones de representacion) muy rapido en inferencia y viable en CPU, lo que lo situa en la categoria de modelos ligeros para extraccion de informacion a gran escala.

Su relevancia actual es limitada pero concreta: los modelos encoder pequenos siguen siendo la opcion preferida en produccion para NER de bajo coste y alta capacidad de procesamiento, frente a los modelos generativos de mayor tamano. Sin embargo, la ausencia de informacion sobre el dataset de entrenamiento, el esquema de etiquetas y los idiomas soportados dificulta su evaluacion y reutilizacion directa. El modelo registra 0 descargas y 0 *likes* en el momento de la consulta, y su model card esta generada automaticamente por el *Trainer* de HuggingFace con secciones sin completar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (base: BAAI/bge-small-en-v1.5, 12 capas, 384 dimensiones) |
| Parametros totales | 33.215.625 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (heredada de la arquitectura BERT del modelo base; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible en la model card; al publicarse en safetensors FP32 admite cuantizacion INT8/FP16 y exportacion a ONNX mediante herramientas externas |
| Idiomas soportados | no disponible (el modelo base BAAI/bge-small-en-v1.5 esta entrenado principalmente en ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder bidireccional de tipo BERT, heredada del modelo base BAAI/bge-small-en-v1.5. Este modelo base es un encoder compacto de 12 capas y 384 dimensiones de *hidden state*, disenado originalmente para generar embeddings de frases y usado aqui como columna vertebral para una cabeza de clasificacion de tokens. El modelo resultante tiene 33.215.625 parametros, lo que coincide practicamente con el tamano del modelo base, y se distribuye en formato safetensors con un repo de 0,4 GB.

El entrenamiento se realizo con el `Trainer` de HuggingFace sobre un dataset que la model card describe como "unknown dataset", sin especificar composicion, numero de tokens, esquema de etiquetas ni idioma. Los hiperparametros documentados son: `learning_rate` 2e-05, `train_batch_size` 8, `eval_batch_size` 8, semilla 42, optimizador AdamW (`betas=(0.9, 0.999)`, `epsilon=1e-08`), planificador lineal y 3 epocas (3.750 pasos de entrenamiento). No se menciona ningun proceso de RLHF, DPO ni innovacion tecnica adicional (por ejemplo, atencion lineal o decodificacion especulativa), lo cual es coherente con un ajuste fino supervisado estandar de clasificacion de tokens.

## Capacidades

- Reconocimiento de entidades nombradas sobre texto: clasificacion a nivel de token mediante la tarea `token-classification` del pipeline de transformers.
- Extraccion de entidades segun el esquema de etiquetas del dataset de entrenamiento, que no se especifica en la model card (formato BIO/BILUO no disponible).
- Inferencia rapida y de bajo coste: 33 millones de parametros permiten procesar grandes volumenes de texto en CPU o en GPU de gama baja.
- Capacidad multilingue: no disponible; el modelo base esta orientado a ingles, por lo que el soporte de otros idiomas no esta garantizado.
- *Tool calling* / *function calling*: no disponible (no es un modelo generativo ni esta entrenado para ello).
- Soporte de agentes y razonamiento multi-paso: no disponible (arquitectura encoder sin generacion autoregresiva).
- Capacidades especiales: ninguna declarada (sin modo *thinking*, vision ni audio).

## Casos de uso

- Extraccion de entidades en pipelines de procesamiento documental: el modelo puede etiquetar lotes de documentos (facturas, contratos, informes) token a token para poblar bases de datos estructuradas, aprovechando su bajo coste computacional por documento.
- Anonimizacion y cumplimiento normativo (RGPD): al detectar entidades como nombres o identificadores, permite enmascararlas antes de almacenar o compartir texto, un caso de uso habitual de los modelos NER ligeros.
- Preprocesado para motores de busqueda y sistemas de recomendacion: indexar entidades extraidas de articulos o catalogos para mejorar la recuperacion semantica.
- Analisis de opinion y monitorizacion de marca: extraer organizaciones, productos y personas de resenas o redes sociales para agregar menciones por entidad.
- Enriquecimiento de CRM y automatizacion comercial: identificar empresas y cargos en correos o notas de reuniones para completar fichas de clientes de forma automatica.
- Etiquetado asistido y anotacion humana: usar las predicciones del modelo como preanotacion en herramientas como Label Studio o Prodigy, reduciendo el esfuerzo de anotacion manual.
- Clasificacion de tickets de soporte: detectar entidades tecnicas (versiones, productos, errores) en descripciones de incidencias para enrutarlas al equipo correcto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, GLUE, CoNLL-2003 u otros) en la informacion disponible; el bloque `model-index` de la model card contiene una lista de resultados vacia. Los unicos datos numericos son los del conjunto de evaluacion interno del entrenamiento:

| Metrica | Epoca 1 (paso 1250) | Epoca 2 (paso 2500) | Epoca 3 (paso 3750) |
|---|---|---|---|
| Training loss | 0,2209 | 0,1095 | 0,0806 |
| Validation loss | 0,1394 | 0,1013 | 0,0954 |
| Precision | 0,8089 | 0,8591 | 0,8661 |
| Recall | 0,8657 | 0,8987 | 0,9066 |
| F1 | 0,8364 | 0,8784 | 0,8859 |
| Accuracy | 0,9695 | 0,9768 | 0,9778 |

Resultado final declarado en la model card: perdida 0,0954, precision 0,8661, recall 0,9066, F1 0,8859 y exactitud 0,9778. Se desconoce la composicion del conjunto de evaluacion, por lo que estas cifras no son directamente comparables con resultados publicados en CoNLL-2003 u otros corpus de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,13 GB en FP32, 0,07 GB en FP16 y 0,03 GB en INT8, sin contar el *overhead* del runtime (en la practica, menos de 1 GB en total).
- GPU recomendadas: cualquier GPU con soporte CUDA; el modelo es sobredimensionado para una NVIDIA RTX 4090, A100 o H100, que lo ejecutarian con latencias de milisegundos por lote.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo (GTX 1050, RTX 3050, RTX 4090) e incluso en GPUs integradas o en CPU.
- Opciones de despliegue: transformers con PyTorch, pipeline de `token-classification`; exportacion a ONNX Runtime para CPU; TensorRT o `torch.compile` para GPU; despliegue en TGI o como servicio FastAPI/KServe. La conversion a GGUF para llama.cpp no es un camino habitual para este tipo de encoder, aunque es tecnicamente posible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera un throughput alto (cientos o miles de secuencias cortas por segundo en GPU), pero no hay mediciones publicadas.
- Almacenamiento: repo de 0,4 GB, con pesos safetensors de aproximadamente 0,13 GB en FP32.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks del modelo evaluado que permitan una comparacion de rendimiento rigurosa. La comparacion se limita a caracteristicas estructurales conocidas de alternativas de la misma categoria (NER basado en encoders):

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MrKustic/dl2-ner | 33,2 M | Encoder BERT ajustado para NER | 512 tokens (heredado) | MIT | HuggingFace, 0 descargas |
| BAAI/bge-small-en-v1.5 | 33,4 M | Encoder BERT para embeddings | 512 tokens | MIT | HuggingFace (modelo base) |
| dslim/bert-base-NER | 108 M | Encoder BERT ajustado para NER (CoNLL-2003, 4 tipos de entidad) | 512 tokens | MIT | HuggingFace (muy descargado) |

Los datos de rendimiento de `dslim/bert-base-NER` y de alternativas multilingues como `Davlan/bert-base-multilingual-cased-ner-hrl` no se incluyen en la informacion proporcionada y no deben compararse con las cifras internas de dl2-ner, que proceden de un conjunto de evaluacion desconocido.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card indica explicitamente "unknown dataset", por lo que se desconoce el dominio, el esquema de etiquetas y la cobertura de entidades.
- Idiomas no declarados: el modelo base esta orientado a ingles; su comportamiento en castellano u otros idiomas no esta verificado y probablemente sea deficiente.
- Limite de contexto de 512 tokens heredado de la arquitectura BERT: los documentos largos requieren segmentacion previa, lo que puede fragmentar entidades y degradar el recall en los bordes de los fragmentos.
- Riesgo de alucinacion y errores de frontera: como todo modelo de etiquetado, puede asignar etiquetas incorrectas o cortar entidades a la mitad; el F1 declarado (0,8859) procede de una evaluacion interna sin detalle del conjunto de prueba.
- Sesgos potenciales: no hay analisis de sesgos publicado; los modelos entrenados en corpus no documentados pueden reproducir sesgos de genero, nacionalidad u origen presentes en los datos.
- Ausencia de validacion externa: 0 descargas y 0 *likes*, sin resultados en `model-index`, sin paper ni demo asociados; no se recomienda su uso en produccion sin una evaluacion propia en el dominio objetivo.
- Licencia MIT: permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright y la licencia. Al derivar de BAAI/bge-small-en-v1.5 (tambien MIT), no se anaden restricciones adicionales conocidas.
- Fechas de publicacion inusuales: el repositorio figura como creado y actualizado en septiembre de 2026, dato que conviene verificar antes de citarlo.
- Model card autocreada: incluye la advertencia de HuggingFace de que debe ser revisada y completada, lo que refuerza la falta de documentacion fiable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MrKustic/dl2-ner
- Modelo base BAAI/bge-small-en-v1.5: https://huggingface.co/BAAI/bge-small-en-v1.5
- Survey sobre avances recientes en NER (arXiv): https://arxiv.org/abs/2401.10825
- Guia de NER y proteccion de datos de Tonic.ai: https://www.tonic.ai/guides/named-entity-recognition-models
- Framework NER con LLMs (repositorio GitHub): https://github.com/alexfdez1010/ner-llm
- Documentacion de Microsoft sobre entrenamiento de NER personalizado: https://learn.microsoft.com/en-us/azure/ai-services/language-service/custom-named-entity-recognition/how-to/train-model
- Documentacion de Microsoft sobre despliegue de NER personalizado: https://learn.microsoft.com/en-us/azure/ai-services/language-service/custom-named-entity-recognition/how-to/deploy-model

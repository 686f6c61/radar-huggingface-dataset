# DmitriiGromak/bge-small-finetuned-ner

## Resumen

DmitriiGromak/bge-small-finetuned-ner es un modelo de reconocimiento de entidades nombradas (NER) obtenido por ajuste fino del modelo de embeddings BAAI/bge-small-en-v1.5 sobre un corpus no especificado en la model card. Se distribuye como un modelo de clasificacion de tokens (pipeline token-classification) dentro del ecosistema Transformers y con pesos en formato safetensors. Cuenta con 33.215.625 parametros y una licencia MIT que permite uso comercial sin restricciones adicionales.

El modelo parte de una arquitectura tipo BERT (encoder transformer) y anade una cabeza de clasificacion por token. El ajuste fino se realizo durante 3 epocas con adamw_torch_fused, tasa de aprendizaje 2e-05 y batch de 16, alcanzando en el conjunto de evaluacion una F1 de 0.8738, precision de 0.8561, recall de 0.8923 y accuracy de 0.9748.

Su relevancia practica radica en que ofrece una solucion de extraccion de entidades muy ligera (0.1 GB de repositorio, aproximadamente 133 MB en fp32) que puede ejecutarse en CPU o en GPUs de gama baja. No obstante, la model card esta generada automaticamente y no documenta el dataset de entrenamiento, los idiomas soportados ni las etiquetas de entidades, por lo que su evaluacion en produccion requiere validacion previa sobre datos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT con cabeza de clasificacion de tokens (token-classification) |
| Parametros totales | 33.215.625 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base BAAI/bge-small-en-v1.5 trabaja con secuencias de hasta 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible en la model card; el modelo base BAAI/bge-small-en-v1.5 esta especializado en ingles |
| Licencia | MIT |
| Formato de pesos | safetensors |

Otros datos: tamano del repositorio 0.1 GB, descargas 0, likes 0, creado el 2026-10-07.

## Arquitectura y entrenamiento

Se trata de un encoder transformer de la familia BERT con una cabeza de clasificacion por token anadida para la tarea de NER. La etiqueta `bert` aparece de forma explicita en los metadatos del repositorio y el modelo base es BAAI/bge-small-en-v1.5, un modelo de embeddings de recuperacion de 33 millones de parametros. No hay informacion en la model card sobre el numero de capas, dimension oculta ni numero de cabezas de atencion del modelo resultante.

El entrenamiento consistio en un ajuste fino supervisado (sin RLHF ni DPO) durante 3 epocas, con 625 pasos por epoca. Con un batch de entrenamiento de 16, esto implica aproximadamente 10.000 ejemplos por epoca. Los hiperparametros documentados son: learning_rate 2e-05, train_batch_size 16, eval_batch_size 16, seed 42, optimizador adamw_torch_fused con betas (0.9, 0.999) y epsilon 1e-08, y scheduler lineal. No se especifica la composicion del dataset de entrenamiento ni las etiquetas de entidades utilizadas. Las versiones de framework empleadas fueron Transformers 5.19.0, PyTorch 2.14.1+cu130, Datasets 5.1.0 y Tokenizers 0.23.2.

Evolucion de las metricas durante el entrenamiento:

| Epoca | Paso | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|
| 1.0 | 625 | 0.3858 | 0.7343 | 0.7854 | 0.7590 | 0.9569 |
| 2.0 | 1250 | 0.2605 | 0.8375 | 0.8807 | 0.8586 | 0.9726 |
| 3.0 | 1875 | 0.2374 | 0.8561 | 0.8923 | 0.8738 | 0.9748 |

## Capacidades

- Reconocimiento de entidades nombradas (NER): extrae menciones de entidades en texto a nivel de token, tarea para la que fue ajustado.
- Clasificacion de tokens generica: al derivar de un encoder BERT con cabeza de token-classification, puede reutilizarse para otras tareas de etiquetado de secuencias (POS tagging, chunking) previo reajuste.
- Representaciones contextuales: hereda del modelo base la capacidad de producir embeddings contextualizados, aunque la cabeza de NER sustituye la salida de embeddings original.
- Procesamiento de lotes: admite inferencia por lotes a traves del pipeline de Transformers.
- Tool calling / function calling: no soportado (no es un modelo generativo ni de instrucciones).
- Soporte de agentes y razonamiento multi-paso: no aplicable.
- Generacion de texto, codigo, matematicas o vision: no soportado; es un modelo exclusivamente de clasificacion.
- Capacidades multilingues: no documentadas; el modelo base esta orientado al ingles.

## Casos de uso

- Extraccion de entidades en corpus en ingles: identificar personas, organizaciones, ubicaciones u otras etiquetas definidas por el autor en documentos y articulos. Es adecuado por su tamano reducido y su F1 de 0.8738 en el conjunto de evaluacion del autor.
- Preprocesado de pipelines de NLP: servir como etapa previa de deteccion de entidades antes de sistemas de busqueda, indexacion o resumen. Al ser un encoder de 33M de parametros, se integra sin coste significativo de latencia.
- Enriquecimiento de datos para RAG: etiquetar entidades en los documentos antes de indexarlos en una base vectorial, mejorando el filtrado por metadatos en sistemas de recuperacion.
- Anonimizacion de documentos: localizar menciones de entidades sensibles (nombres, organizaciones) para su enmascaramiento en procesos de cumplimiento normativo, siempre que se valide el conjunto de etiquetas reales.
- Procesamiento por lotes a gran escala: clasificar grandes volumenes de texto en entornos con recursos limitados, dado que el modelo cabe holgadamente en memoria y puede ejecutarse en CPU.
- Despliegue en el borde (edge): integrar el modelo en dispositivos o servicios con poca VRAM o sin GPU, gracias a su huella de aproximadamente 133 MB en fp32 y 66 MB en fp16.
- Base para nuevos ajustes finos: punto de partida para dominios especificos (biomedico, legal, financiero) reentrenando la cabeza de clasificacion sobre datos anotados propios.

## Benchmarks y rendimiento

La model card no publica resultados en benchmarks estandar (MMLU, HumanEval, GSM8K u otros). El `model-index` del repositorio contiene una lista de resultados vacia. Los unicos datos disponibles son las metricas de evaluacion declaradas por el autor sobre un conjunto no especificado:

| Metrica | Valor |
|---|---|
| Precision | 0.8561 |
| Recall | 0.8923 |
| F1 | 0.8738 |
| Accuracy | 0.9748 |
| Loss | 0.2374 |

No se han publicado resultados de benchmarks estandar en la informacion disponible. Las cifras anteriores corresponden al conjunto de evaluacion interno del autor y no son comparables de forma directa con otros modelos sin conocer el dataset ni las etiquetas empleadas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 133 MB en fp32, 66 MB en fp16 y 33 MB en int8 (calculado a partir de los 33.215.625 parametros; no confirmado por el autor).
- GPU recomendadas: cualquier GPU es suficiente; no se requiere hardware de gama alta. Funciona en tarjetas integradas y en CPU.
- Compatibilidad con GPU de consumo: si, en cualquier GPU de consumo (RTX 4090, RTX 3060, GTX 1650 e incluso integradas), dado el tamano del modelo.
- Opciones de despliegue: Transformers (pipeline y AutoModelForTokenClassification), ONNX Runtime, TorchScript, TGI y frameworks de servicio que soporten modelos de clasificacion de tokens. llama.cpp no esta orientado a este tipo de encoder NER.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparacion completa. A continuacion se recogen los modelos relacionados encontrados en la busqueda, con la informacion disponible.

| Modelo | Parametros | Tarea | Metricas declaradas | Licencia | Estado |
|---|---|---|---|---|---|
| DmitriiGromak/bge-small-finetuned-ner | 33.215.625 | NER | Precision 0.8561, Recall 0.8923, F1 0.8738 | MIT | Este modelo |
| BAAI/bge-small-en-v1.5 | ~33M | Embeddings / recuperacion | no aplica (no es NER) | MIT | Modelo base, ampliamente usado |
| chesschesschess/bge-small-finetuned-ner | no disponible | NER | Precision 0.8993, Recall 0.9244 | no disponible | Derivado del mismo modelo base |
| kati4ka/bge-small-ner | no disponible | NER | no disponible | no disponible | Derivado del mismo modelo base |

La comparacion directa no es posible porque los conjuntos de evaluacion y las etiquetas de cada modelo no se documentan en las model cards. Los modelos `chesschesschess/bge-small-finetuned-ner` y `kati4ka/bge-small-ner` comparten arquitectura base, lo que sugiere una familia de ajustes finos muy similares.

## Limitaciones y advertencias

- Model card autogenerada: el propio autor indica que el documento se genero automaticamente y que falta informacion, por lo que no se documentan usos previstos ni limitaciones.
- Dataset de entrenamiento desconocido: no se especifica la procedencia de los datos, la taxonomia de etiquetas ni el tamano del conjunto de evaluacion. Esto impide verificar si las metricas son representativas de dominios reales.
- Riesgo de sesgo: al no publicarse la composicion del corpus, no es posible evaluar sesgos de genero, origen o dominio en las entidades detectadas.
- Riesgo de alucinacion / error de extraccion: como todo sistema NER, puede producir falsos positivos y negativos, especialmente en textos largos o con entidades ambiguas. La F1 de 0.8738 implica un margen de error no despreciable.
- Limitacion de idioma: el modelo base BAAI/bge-small-en-v1.5 esta orientado al ingles; no hay evidencia de rendimiento en castellano u otros idiomas.
- Limitacion de contexto: la longitud maxima de secuencia heredada del encoder (habitualmente 512 tokens) obliga a dividir documentos largos en fragmentos, lo que puede romper entidades a caballo entre fragmentos.
- Ausencia de validacion externa: el repositorio registra 0 descargas y 0 likes, sin evidencia de uso o replicacion independiente. No existe validacion por parte de terceros.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificacion con atribucion; no hay restricciones conocidas mas alla de las habituales de la licencia.
- Uso en produccion: se recomienda validar el conjunto de etiquetas reales y reentrenar o calibrar sobre datos propios antes de desplegarlo en un flujo productivo.

## Enlaces

- HuggingFace: https://huggingface.co/DmitriiGromak/bge-small-finetuned-ner
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- Modelo relacionado (chesschesschess/bge-small-finetuned-ner): https://huggingface.co/chesschesschess/bge-small-finetuned-ner
- Modelo relacionado (kati4ka/bge-small-ner): https://huggingface.co/kati4ka/bge-small-ner
- Documentacion de la familia BGE: https://bge-model.com/
- Ficha y analisis del modelo bge-small-en (ThinkLLM): https://thinkllm.dev/models/bge-small-en

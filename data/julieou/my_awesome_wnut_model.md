# julieou/my_awesome_wnut_model

## Resumen

El modelo `julieou/my_awesome_wnut_model` es un ajuste fino (fine-tuning) de `distilbert-base-uncased` orientado a tareas de clasificación de tokens (token classification), como el reconocimiento de entidades nombradas (NER), el etiquetado gramatical (POS) o el chunking. Ha sido desarrollado por el usuario julieou y publicado en HuggingFace con licencia Apache 2.0, lo que permite su uso comercial sin restricciones adicionales.

El modelo se entrenó durante 50 épocas con el Trainer de HuggingFace sobre un conjunto de datos no especificado. Con 66,37 millones de parámetros, es una versión compacta del clásico BERT, pensada para entornos con recursos limitados. Su relevancia radica en servir como ejemplo de fine-tuning reproducible y en ofrecer una alternativa ligera para tareas de etiquetado de secuencias, aunque sus métricas de evaluación son moderadas y el dataset de entrenamiento no se ha documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder) |
| Parametros totales | 66.372.877 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (heredado de DistilBERT base) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible (modelo base en ingles, uncased) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, una version destilada de BERT que conserva el 97 % de su capacidad linguistica con un 40 % menos de parametros. DistilBERT utiliza una arquitectura transformer encoder con capas reducidas (6 capas, 768 unidades ocultas, 12 cabezas de atencion) y fue preentrenado mediante destilacion de conocimiento sobre el corpus de BERT. Para esta ficha, el modelo fue ajustado con el Trainer de HuggingFace, usando un optimizador AdamW con learning rate de 2e-5, batch de 16 y un scheduler lineal, durante 50 epocas. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales.

El dataset de entrenamiento no esta documentado, lo que impide conocer la composicion ni el volumen de datos. Los resultados de evaluacion muestran una perdida final de 0.3227, con precision de 0.5829, recall de 0.4041, F1 de 0.4773 y accuracy de 0.9485. La brecha entre precision y recall sugiere un sesgo hacia la precision, posiblemente por el desbalance de clases en el dataset.

## Capacidades

- Clasificacion de tokens: etiquetado de entidades, partes de la oracion o segmentos de texto a nivel de token.
- Representaciones contextuales: genera embeddings contextuales de 768 dimensiones para cada token, utiles para tareas posteriores.
- Inferencia rapida: al ser un modelo destilado, es mas ligero que BERT base, con menor latencia en CPU y GPU.
- Compatible con pipelines de HuggingFace: se puede usar directamente con `pipeline("token-classification")`.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas: el modelo base es unicamente ingles (uncased), por lo que no es adecuado para otros idiomas.

## Casos de uso

- Extraccion de entidades en documentos legales: el modelo puede etiquetar nombres, fechas y organizaciones en contratos, aunque su F1 de 0.47 limita su uso en produccion sin revision humana.
- Preprocesamiento de textos para busqueda semantica: al clasificar tokens, puede ayudar a segmentar consultas o documentos en unidades significativas antes de indexarlos.
- Analisis de redes sociales: deteccion de menciones, hashtags o nombres propios en publicaciones de Twitter, gracias a su rapidez en CPU.
- Etiquetado de partes de la oracion en corpus academicos: util para tareas de linguistica computacional donde se requiere un modelo ligero y con licencia permisiva.
- Filtrado de datos para entrenamiento de modelos mayores: puede preetiquetar grandes volumenes de texto para crear datasets de entrenamiento, aunque su recall limitado puede dejar entidades sin detectar.
- Prototipado rapido en entornos educativos: sirve como ejemplo de fine-tuning con Trainer, ideal para aprender flujos de trabajo de HuggingFace sin necesidad de GPUs potentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, etc.) en la informacion disponible. La model card incluye metricas de evaluacion declaradas por el autor, que se muestran a continuacion:

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 0.3227 |
| Precision | 0.5829 |
| Recall | 0.4041 |
| F1 | 0.4773 |
| Accuracy | 0.9485 |

Estos valores corresponden al conjunto de evaluacion del propio autor y no son comparables con benchmarks estandarizados.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en FP32 para inferencia por lotes pequenos; con cuantizacion a int8 o float16, puede reducirse a menos de 500 MB.
- GPU recomendada: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti, RTX 3050) o incluso CPU para inferencia en tiempo no real.
- Compatible con consumer GPU: si, cabe en GPUs de gama baja y en hardware embebido.
- Opciones de despliegue: transformers (Python), ONNX Runtime, TensorRT, o servidores de inferencia como vLLM (aunque no es optimo para modelos encoder), TGI o HuggingFace Inference Endpoints.
- Latencia estimada: en CPU moderna, inferencia de un texto de 128 tokens en aproximadamente 10-30 ms; en GPU, por debajo de 5 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Pipeline principal |
|---|---|---|---|---|
| DistilBERT base (este modelo) | 66 M | 512 | Apache-2.0 | Token classification |
| BERT base uncased | 110 M | 512 | Apache-2.0 | Token classification, QA, etc. |
| RoBERTa base | 125 M | 512 | MIT | Token classification, QA, etc. |

Este modelo es mas pequeno que BERT y RoBERTa, lo que reduce los requisitos de hardware, pero a cambio de un rendimiento inferior en tareas de NER (el F1 de 0.47 es bajo comparado con los 0.85-0.90 tipicos de BERT en datasets estandar como CoNLL). La licencia Apache-2.0 es mas permisiva que la de RoBERTa (MIT), aunque ambas permiten uso comercial.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: no se puede evaluar la cobertura ni los sesgos del modelo sin conocer la procedencia de los datos.
- Rendimiento moderado: con un F1 de 0.4773, el modelo no es recomendable para tareas de produccion que requieran alta precision en extraccion de entidades.
- Posible sobreajuste: las 50 epocas de entrenamiento con un dataset pequeno pueden provocar overfitting, como sugiere la diferencia entre precision y recall.
- Idioma limitado: al basarse en DistilBERT uncased, solo funciona correctamente con texto en ingles; no soporta otros idiomas.
- Contexto fijo de 512 tokens: textos mas largos deben truncarse o dividirse, perdiendo informacion contextual.
- Sin soporte para generacion ni razonamiento: es un modelo encoder puro, no apto para tareas de generacion de texto o agentes conversacionales.
- Sin informacion sobre sesgos: no se han documentado evaluaciones de sesgo de genero, raza o religion, por lo que su uso en aplicaciones sensibles requiere auditoria previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/julieou/my_awesome_wnut_model
- Modelo base DistilBERT: https://huggingface.co/distilbert/distilbert-base-uncased
- Documentacion de Transformers (pipeline token-classification): https://huggingface.co/docs/transformers/main_classes/pipelines

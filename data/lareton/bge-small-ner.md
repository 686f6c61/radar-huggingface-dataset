# Lareton/bge-small-ner

## Resumen

Lareton/bge-small-ner es un modelo de reconocimiento de entidades nombradas (NER) obtenido por ajuste fino (fine-tuning) del modelo de embeddings BAAI/bge-small-en-v1.5 sobre un conjunto de datos de entrenamiento que el autor no especifica. Se trata de un transformer encoder de tipo BERT con 33.215.625 parametros, reentrenado para la tarea de token classification: es decir, asigna una etiqueta a cada token de la secuencia de entrada en lugar de generar texto. El modelo se publica bajo licencia MIT y en formato safetensors, con integracion directa en la libreria transformers.

La relevancia de esta ficha es limitada pero concreta: se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, sin model card completa (el propio README indica "More information needed" en las secciones de descripcion, usos previstos y datos de entrenamiento) y sin resultados declarados en el model-index. Aporta, eso si, una traza de entrenamiento completa con hiperparametros y metricas por epoca, lo que permite evaluar la convergencia del ajuste.

El modelo alcanza en su conjunto de evaluacion una perdida de 0.1723, una precision de 0.8845, un recall de 0.9189, un F1 de 0.9014 y una accuracy de 0.9795. Estas cifras son validas unicamente sobre el conjunto de evaluacion interno del autor, cuya composicion y dominio se desconocen, por lo que no son directamente extrapolables a datos de produccion ni comparables con benchmarks publicos de NER.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT para token classification, derivado de BAAI/bge-small-en-v1.5 |
| Parametros totales | 33.215.625 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base BAAI/bge-small-en-v1.5 trabaja con 512 posiciones |
| Tipos de cuantizacion | no disponibles (pesos publicados en safetensors) |
| Idiomas soportados | no disponibles (el modelo base esta orientado a ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de BAAI/bge-small-en-v1.5, un transformer encoder de tipo BERT de 33 millones de parametros, y anade una cabeza de clasificacion de tokens sobre la representacion de salida del encoder. La tarea es, por tanto, de etiquetado por token (NER u otro esquema de entidades), no de generacion de texto. El pipeline declarado en HuggingFace es `token-classification` y la libreria asociada es transformers.

El ajuste fino se realizo con el Trainer de transformers durante 10 epocas, con un total de 3130 pasos de entrenamiento (313 pasos por epoca) y un tamano de lote de 32, lo que equivale a un conjunto de entrenamiento de aproximadamente 10.000 ejemplos, cifra derivada de los pasos y el lote declarados. Se uso una tasa de aprendizaje de 2e-05 con planificador lineal, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08, semilla 42 y lote de evaluacion de 64. Las versiones de framework declaradas son Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1.

La perdida de entrenamiento desciende de forma monotona desde 0.5750 (epoca 1) hasta 0.1106 (epoca 10), mientras que la perdida de validacion se estabiliza en torno a 0.1720-0.1723 en las ultimas epocas y el F1 de validacion mejora de 0.7085 a 0.9014. No se documenta ninguna innovacion tecnica adicional (no hay decodificacion especulativa, atencion lineal ni estrategias de RLHF/DPO): se trata de un ajuste supervisado clasico sobre datos no identificados.

## Capacidades

- Etiquetado de tokens (token classification): asigna una etiqueta de entidad a cada token de una secuencia de entrada. Es su unica funcionalidad documentada.
- Extraccion de entidades nombradas sobre texto, presumiblemente en ingles por herencia del modelo base.
- Generacion de representaciones contextualizadas por token, reutilizables para tareas auxiliares de etiquetado.
- No genera texto libre: no es un modelo causal ni instruct, por lo que no dispone de capacidades de dialogo, resumen o redaccion.
- No hay soporte documentado de tool calling ni de function calling.
- No hay soporte documentado de agentes ni de razonamiento multi-paso.
- No hay capacidades multimodales (vision, audio) ni modo de razonamiento explicito (thinking mode).
- Las etiquetas concretas del esquema NER (por ejemplo PER, ORG, LOC, MISC) no estan publicadas, por lo que se desconoce el inventario exacto de entidades que reconoce.

## Casos de uso

- Extraccion de entidades en documentos en ingles: el modelo puede procesar lotes de texto de hasta 512 tokens y devolver etiquetas por token, lo que permite poblar bases de datos estructuradas a partir de informes, articulos o correos.
- Preprocesado para pipelines RAG: la deteccion de entidades permite enriquecer los metadatos de los fragmentos indexados (organizaciones, lugares, personas) y mejorar el filtrado en la recuperacion, con la ventaja de que el modelo cabe en CPU.
- Analisis de curriculos y candidatos: identificacion de nombres de empresas, titulaciones y ubicaciones en CV en ingles para alimentar sistemas de cribado, siempre que el esquema de etiquetas coincida con el entrenado.
- Monitorizacion de prensa y redes: extraccion de menciones de marcas, personas y lugares en flujos continuos de noticias, aprovechando el bajo coste de inferencia de un modelo de 33 millones de parametros.
- Anonimizacion y seudonimizacion de textos: localizacion de menciones de personas y organizaciones para sustitucion previa a la comparticion de documentos, con la advertencia de que se desconoce si el conjunto de entrenamiento cubria datos personales.
- Curación de datasets para entrenamiento: etiquetado automatico de grandes volumenes de texto para generar datos debilmente supervisados, seguido de revision humana, dado el throughput alto esperable en CPU o GPU consumer.
- Enriquecimiento de busquedas internas: indexacion de entidades para construir facetas de busqueda en corpus documentales en ingles.
- Evaluacion academica y prototipado rapido: al ser un modelo pequeno con licencia MIT, sirve como linea base reproducible en experimentos de NER y como punto de partida para ajustes adicionales.

## Benchmarks y rendimiento

El model-index del autor esta vacio (`results: []`), por lo que no hay resultados en benchmarks publicos tipo MMLU, GLUE o CoNLL. Las unicas cifras disponibles son las del conjunto de evaluacion interno, recogidas en la model card.

| Metrica | Valor final (conjunto de evaluacion) |
|---|---|
| Loss | 0.1723 |
| Precision | 0.8845 |
| Recall | 0.9189 |
| F1 | 0.9014 |
| Accuracy | 0.9795 |

Evolucion del F1 y la perdida de validacion durante el entrenamiento:

| Epoca | Paso | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|
| 1.0 | 313 | 0.4728 | 0.6859 | 0.7327 | 0.7085 | 0.9496 |
| 2.0 | 626 | 0.2944 | 0.8168 | 0.8581 | 0.8369 | 0.9694 |
| 3.0 | 939 | 0.2296 | 0.8637 | 0.8926 | 0.8779 | 0.9758 |
| 4.0 | 1252 | 0.2005 | 0.8720 | 0.9105 | 0.8908 | 0.9780 |
| 5.0 | 1565 | 0.1893 | 0.8656 | 0.9096 | 0.8871 | 0.9774 |
| 6.0 | 1878 | 0.1809 | 0.8755 | 0.9148 | 0.8947 | 0.9784 |
| 7.0 | 2191 | 0.1779 | 0.8828 | 0.9137 | 0.8979 | 0.9792 |
| 8.0 | 2504 | 0.1746 | 0.8783 | 0.9167 | 0.8971 | 0.9789 |
| 9.0 | 2817 | 0.1720 | 0.8849 | 0.9187 | 0.9015 | 0.9798 |
| 10.0 | 3130 | 0.1723 | 0.8845 | 0.9189 | 0.9014 | 0.9795 |

Cabe senalar que la metrica de accuracy esta fuertemente condicionada por el desbalance de clases tipico en NER (la clase mayoritaria suele ser "O"), por lo que el F1 es el indicador relevante. No se dispone de comparaciones con otros modelos de NER en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 133 MB solo para los pesos, mas activaciones y overhead del runtime. En la practica, la inferencia cabe en menos de 1 GB de memoria.
- VRAM estimada en fp16/bf16: aproximadamente 66 MB de pesos.
- VRAM estimada en int8: aproximadamente 33 MB de pesos (requiere cuantizacion propia, no publicada).
- GPU compatibles: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, GTX 1650, RTX 3050 y superiores). Tambien se ejecuta sin problema en A100, H100 y demas GPUs de centro de datos, aunque estan sobredimensionadas para este tamano.
- GPU consumer: si, cabe holgadamente en cualquier GPU consumer actual, incluidas las integradas con memoria compartida.
- CPU: viable para produccion a baja escala; un modelo de 33 millones de parametros con secuencias de 512 tokens se ejecuta en tiempos de decenas de milisegundos por lote en CPU moderna, aunque no se dispone de mediciones publicadas.
- Opciones de despliegue: pipeline de transformers (PyTorch), exportacion a ONNX mediante Optimum, TorchScript y frameworks de serving genericos. La compatibilidad con vLLM, TGI, llama.cpp u Ollama no esta documentada para este artefacto; estos motores estan orientados a modelos generativos, no a token classification.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de modelos alternativos en la informacion proporcionada, por lo que la comparacion se limita a las caracteristicas estructurales verificables.

| Modelo | Parametros | Tarea | Contexto | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| Lareton/bge-small-ner | 33.215.625 | Token classification (NER) | no disponible (base de 512) | MIT | F1 0.9014, precision 0.8845, recall 0.9189 en su conjunto de evaluacion interno |
| BAAI/bge-small-en-v1.5 (modelo base) | ~33 millones | Embeddings de texto / recuperacion | 512 | MIT | No comparable: tarea distinta (no hace NER) |
| Otros modelos NER de la familia BERT | no disponible | Token classification | no disponible | no disponible | no disponible |

La comparacion con alternativas como dslim/bert-base-NER o modelos NER multilingues no puede realizarse con rigor porque no se han aportado sus metricas ni las condiciones de evaluacion de este modelo, y los conjuntos de evaluacion son distintos.

## Limitaciones y advertencias

- Model card incompleta: las secciones de descripcion, usos previstos y datos de entrenamiento figuran como "More information needed". Se desconoce el dataset, el dominio, el esquema de etiquetas y el idioma real de los datos de entrenamiento.
- Sin validacion externa: cero descargas y cero likes en el momento de la consulta, y model-index vacio. No hay evidencia de uso en produccion ni reproduccion independiente de las metricas.
- Metricas no extrapolables: el F1 de 0.9014 y la precision de 0.8845 provienen de un unico conjunto de evaluacion interno de composicion desconocida. En datos de otro dominio es esperable una degradacion notable.
- Riesgo de sobreajuste: la perdida de entrenamiento sigue bajando hasta 0.1106 en la epoca 10 mientras la de validacion se estanca en 0.172, con mejoras marginales de F1 en las ultimas tres epocas. La epoca 9 y la 10 son practicamente equivalentes.
- Sesgos: al desconocerse el corpus de entrenamiento, no es posible caracterizar sesgos de genero, origen geografico, etnia o dominio. No debe asumirse neutralidad.
- Riesgo de falsos positivos y negativos en la extraccion de entidades: el modelo puede fragmentar entidades compuestas o etiquetar incorrectamente cadenas ambiguas. No se trata de alucinacion en sentido generativo, pero si de errores de etiquetado con impacto directo en pipelines posteriores.
- Limitacion de idioma: no se declara el idioma soportado. El modelo base esta orientado a ingles, por lo que el uso en castellano u otros idiomas no esta respaldado y probablemente rinda mal.
- Limitacion de contexto: el modelo base maneja 512 posiciones. Para documentos largos es necesario trocear el texto, con el consigo riesgo de partir entidades en los limites de fragmento.
- Sin generacion ni instrucciones: no admite prompts conversacionales, tool calling ni razonamiento multi-paso. Cualquier integracion debe tratarlo como un clasificador, no como un asistente.
- Licencia: MIT, lo que permite uso comercial y modificacion sin restricciones destacables, pero el autor no ofrece garantias sobre el origen de los datos de entrenamiento, lo que traslada al desplegador la responsabilidad sobre posibles derechos de terceros en el corpus.
- Reproducibilidad: se declara la semilla 42 y las versiones de framework, pero las versiones indicadas (Transformers 5.16.1, PyTorch 2.11.0) no se corresponden con releases publicos verificables en el momento de redactar esta ficha, lo que dificulta reproducir el entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lareton/bge-small-ner
- Modelo base: https://huggingface.co/BAAI/bge-small-en-v1.5
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos asociados a este modelo.

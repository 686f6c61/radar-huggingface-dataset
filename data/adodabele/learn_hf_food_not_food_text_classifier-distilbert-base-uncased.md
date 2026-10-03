# adodabele/learn_hf_food_not_food_text_classifier-distilbert-base-uncased

## Resumen
El modelo `adodabele/learn_hf_food_not_food_text_classifier-distilbert-base-uncased` es un clasificador de texto obtenido por fine-tuning de `distilbert/distilbert-base-uncased` sobre un dataset no documentado, con el objetivo aparente de distinguir entre contenido alimentario y no alimentario ("food / not food"). Lo publica el usuario adodabele en Hugging Face y está etiquetado como tarea `text-classification` dentro de la librería Transformers. Su relevancia es práctica y limitada: se trata de un experimento de ajuste fino de ciclo corto (70 pasos de entrenamiento), útil como ejemplo reproducible de pipeline de clasificación, no como modelo de propósito general.

Técnicamente es un transformer encoder de tipo DistilBERT, con 66.955.010 parámetros (unos 6 capas, 768 dimensiones ocultas y 12 cabezas de atención, según la arquitectura del modelo base), ventana máxima de 512 tokens y tokenizador WordPiece en inglés sin distinción de mayúsculas. El repositorio ocupa 0,5 GB y distribuye pesos en formato safetensors bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones declaradas por el autor.

El modelo declara una precisión de 1,0 y una pérdida de validación de 0,0004 en su conjunto de evaluación, cifras que deben interpretarse con cautela porque el conjunto de datos y el protocolo de evaluación no están documentados y el entrenamiento es muy corto. Con 0 descargas y 0 valoraciones positivas en el momento de redactar esta ficha, no hay validación externa de su comportamiento en producción.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilación de BERT-base) |
| Parametros totales | 66.955.010 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (heredada del modelo base distilbert-base-uncased) |
| Tipos de cuantizacion | No disponible (no se publican versiones cuantizadas en el repositorio) |
| Idiomas soportados | No disponible; el modelo base está entrenado principalmente en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (etiqueta `safetensors`); repositorio de 0,5 GB |
| Tarea | Clasificación de texto (`text-classification`) |
| Numero de etiquetas | No disponible (el nombre sugiere clasificación binaria comida / no comida) |
| Modelo base | distilbert/distilbert-base-uncased |
| Libreria | Transformers (entrenado con `Trainer`, etiqueta `generated_from_trainer`) |
| Fecha de creacion / actualizacion | 2026-10-03 (ambas) |
| Descargas / valoraciones | 0 / 0 |

## Arquitectura y entrenamiento
La arquitectura es la de DistilBERT: un transformer encoder de 6 capas con 768 dimensiones ocultas y 12 cabezas de atención por capa, obtenido por destilación de conocimiento a partir de BERT-base. Esto supone aproximadamente un 40 % menos de parámetros que BERT-base y una inferencia más rápida, con una pérdida de rendimiento moderada en tareas de comprensión del lenguaje. Sobre esta base se ha añadido una cabeza de clasificación, cuyo número de clases no se documenta. El tokenizador es WordPiece en versión *uncased*, con una ventana máxima de 512 tokens.

El entrenamiento se realizó con el `Trainer` de Transformers durante 10 épocas y 70 pasos totales, con `train_batch_size` y `eval_batch_size` de 32, lo que implica del orden de 224 ejemplos de entrenamiento por época. Los hiperparámetros declarados son: tasa de aprendizaje 0,0001, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal, semilla 42. No se especifica la composición del dataset ("unknown dataset" en la model card), ni si hubo etapas de RLHF, DPO u otro ajuste posterior. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.), ya que no aplican a un clasificador de este tipo.

## Capacidades
- Clasificación de texto: asigna una etiqueta a una secuencia de entrada, presumiblemente en un esquema binario comida / no comida.
- Procesamiento de entradas de hasta 512 tokens, suficiente para titulares, consultas cortas, descripciones de producto o fragmentos de reseñas.
- Inferencia en CPU con latencia baja y sin necesidad de GPU, dado el tamaño reducido del modelo.
- Integración directa con el pipeline `text-classification` de Transformers y con Text Embeddings Inference (etiqueta `text-embeddings-inference` y `endpoints_compatible`).
- Generación de texto: no soportada (es un modelo exclusivamente de clasificación).
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades multilingües: no documentadas; el modelo base es monolingüe en inglés.
- Capacidades especiales (modo *thinking*, visión, audio, decodificación especulativa): ninguna.

## Casos de uso
- Enrutado de consultas en asistentes de recetas o *delivery*: el clasificador decide si una consulta entrante pertenece al dominio alimentario antes de pasarla a un modelo generativo mayor, reduciendo coste y alucinación en el sistema final.
- Etiquetado automático de catálogos en marketplaces: clasificar descripciones de producto o títulos de anuncios para separar artículos de alimentación del resto de categorías, aprovechando la ventana de 512 tokens.
- Moderación temática en foros y comunidades: filtrar publicaciones fuera de temática en un foro de cocina, con inferencia en CPU que permite procesar grandes volúmenes sin coste de GPU.
- Curación de datasets de entrenamiento: actuar como filtro de primera pasada para separar textos relacionados con alimentación en corpus web rastreados, antes de un etiquetado manual más costoso.
- Análisis de encuestas y comentarios: clasificar respuestas abiertas de clientes de un servicio de comida a domicilio para separar comentarios sobre producto alimentario de comentarios sobre logística o atención.
- Segmentación de *feedback* en soporte al cliente: encaminar tickets hacia el equipo adecuado en función de si el contenido es sobre alimentos o sobre otro tipo de incidencia.
- Filtro previo en pipelines de búsqueda o RAG: descartar documentos irrelevantes para un índice especializado en gastronomía, reduciendo el ruido recuperado.
- Clasificación por lotes de bajo coste en *edge* o entornos sin GPU: al necesitar menos de 300 MB en precisión FP32, puede ejecutarse en contenedores pequeños o incluso en dispositivos con recursos limitados.

## Benchmarks y rendimiento
El model-index del autor está vacío (`results: []`), por lo que no hay resultados publicados en benchmarks estándar (MMLU, GLUE, HumanEval, GSM8K u otros). Los únicos datos disponibles son las métricas de entrenamiento y validación declaradas en la model card, que se reproducen a continuación tal cual:

| Epoca | Paso | Perdida de entrenamiento | Perdida de validacion | Precision |
|:-----:|:----:|:------------------------:|:---------------------:|:---------:|
| 1,0 | 7 | 0,3363 | 0,0431 | 1,0 |
| 2,0 | 14 | 0,0181 | 0,0044 | 1,0 |
| 3,0 | 21 | 0,0034 | 0,0017 | 1,0 |
| 4,0 | 28 | 0,0016 | 0,0010 | 1,0 |
| 5,0 | 35 | 0,0010 | 0,0007 | 1,0 |
| 6,0 | 42 | 0,0008 | 0,0006 | 1,0 |
| 7,0 | 49 | 0,0006 | 0,0005 | 1,0 |
| 8,0 | 56 | 0,0006 | 0,0005 | 1,0 |
| 9,0 | 63 | 0,0006 | 0,0004 | 1,0 |
| 10,0 | 70 | 0,0005 | 0,0004 | 1,0 |

Resultado final declarado en la model card: pérdida 0,0004 y precisión 1,0 en el conjunto de evaluación. No se publica el tamaño de dicho conjunto, ni la matriz de confusión, ni la métrica F1, por lo que la cifra no permite estimar el comportamiento real en datos no vistos. No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware
- Pesos en FP32: aproximadamente 268 MB (66.955.010 parámetros × 4 bytes). En FP16: aproximadamente 134 MB.
- VRAM para inferencia: por debajo de 1 GB para lotes pequeños; en la práctica, entre 1 y 2 GB contando activaciones y el runtime de PyTorch.
- Cabe en cualquier GPU de consumo: GTX 1050 Ti, GTX 1650, RTX 3050, RTX 3060, RTX 4090, etc. Una GPU dedicada es innecesaria salvo para lotes muy grandes.
- GPU de centro de datos (T4, L4, A10, A100, H100): funcionales, pero sobredimensionadas para un modelo de 67 M de parámetros; solo tienen sentido con batching masivo o despliegue multi-modelo.
- Inferencia en CPU: viable y habitualmente suficiente; no se han publicado medidas de latencia ni de throughput, por lo que no se indican cifras concretas.
- Opciones de despliegue: pipeline de Transformers, Text Embeddings Inference (compatible según las etiquetas del repositorio), Hugging Face Inference Endpoints, exportación a ONNX con Optimum, TorchScript, o un servidor HTTP propio (FastAPI + Uvicorn) en contenedor Docker.
- Latencia y throughput estimados: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares
No se dispone de información sobre otros clasificadores ajustados específicamente para la tarea comida / no comida, por lo que la comparación se realiza frente a las arquitecturas encoder comparables por tamaño y contexto. Los datos de la columna "benchmarks en esta tarea" son "no disponible" en todos los casos al no existir evaluaciones publicadas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks en esta tarea |
|---|---|---|---|---|---|
| Este modelo (fine-tune de DistilBERT) | 66.955.010 | 512 tokens | Apache 2.0 | Hugging Face, 0 descargas | Precisión 1,0 declarada en su propio conjunto de evaluación (tamaño no documentado) |
| distilbert-base-uncased (sin ajustar) | 66 M aprox. | 512 tokens | Apache 2.0 | Hugging Face, ampliamente utilizado | No disponible (no es un clasificador binario de esta tarea) |
| bert-base-uncased | 110 M aprox. | 512 tokens | Apache 2.0 | Hugging Face, ampliamente utilizado | No disponible |
| roberta-base | 125 M aprox. | 512 tokens | MIT | Hugging Face, ampliamente utilizado | No disponible |
| TinyBERT-4L (referencia de encoder compacto) | 14,5 M aprox. | 512 tokens | Apache 2.0 | Hugging Face | No disponible |

## Limitaciones y advertencias
- El conjunto de datos de entrenamiento está etiquetado como "unknown dataset" en la propia model card: se desconoce su origen, tamaño, composición y método de etiquetado.
- La precisión de 1,0 se alcanza ya en la primera época sobre un conjunto de evaluación de tamaño no documentado; el entrenamiento total es de 70 pasos, lo que apunta a un riesgo alto de sobreajuste o a un conjunto de evaluación trivial.
- No se documentan las etiquetas de salida ni si el esquema es realmente binario; el nombre del repositorio es la única pista.
- Modelo monolingüe en la práctica: el modelo base está entrenado principalmente en inglés y no se declaran idiomas soportados, por lo que el rendimiento en castellano es indeterminado.
- Tokenizador *uncased*: se pierde la distinción de mayúsculas, lo que puede afectar a la detección de nombres propios o marcas.
- Límite de 512 tokens: los textos más largos deben truncarse o dividirse, con la consiguiente pérdida de información.
- Al ser un clasificador, no genera texto y por tanto no "alucina" en sentido generativo, pero puede producir falsos positivos con alta confianza; no se publica calibración ni umbrales recomendados.
- Sesgos: no documentados. La propia definición de "comida" puede variar culturalmente y el dataset de entrenamiento es desconocido, por lo que no se puede descartar un sesgo cultural o de dominio.
- Licencia Apache 2.0: permite uso comercial y modificación, pero la procedencia desconocida de los datos de entrenamiento impide garantizar que no existan reclamaciones sobre el corpus original. En un despliegue comercial conviene auditar la trazabilidad de los datos.
- Sin validación externa: 0 descargas y 0 valoraciones positivas, y model card generada automáticamente por el `Trainer` sin revisión posterior (contiene marcadores "More information needed").
- Los metadatos indican creación y actualización el mismo día (2026-10-03), lo que es coherente con un experimento puntual más que con un modelo mantenido.
- No se recomienda su uso en producción sin reentrenamiento y evaluación sobre un conjunto propio representativo del dominio objetivo.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/adodabele/learn_hf_food_not_food_text_classifier-distilbert-base-uncased
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Documentación de Transformers para clasificación de texto: https://huggingface.co/docs/transformers/tasks/sequence_classification
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference

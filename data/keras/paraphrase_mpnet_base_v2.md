# keras/paraphrase_mpnet_base_v2

## Resumen

`keras/paraphrase_mpnet_base_v2` es una conversión al ecosistema KerasHub del modelo MPNet (Masked and Permuted Pre-training) orientada a tareas de embeddings de texto (`TextEmbedder`). Lo publica la organización oficial `keras` en Hugging Face y su propósito es ofrecer una implementación portable del backbone MPNet que pueda ejecutarse indistintamente sobre los backends de JAX, TensorFlow y PyTorch a través de KerasHub. El modelo se corresponde con la familia de sentence-transformers derivada de MPNet, pensada para generar representaciones densas de frases y párrafos útiles en búsqueda semántica, clustering y detección de paráfrasis.

Arquitectónicamente es un transformer encoder de 12 capas, 12 cabezas de atención, dimensión oculta de 768 y dimensión intermedia de 3072, con un vocabulario de 30 527 tokens y una longitud máxima de secuencia de 512 tokens. El backbone se declara entrenable (`trainable: True`) y con política de precisión `float32`. El tamaño del repositorio es de aproximadamente 0,4 GB, coherente con un modelo base de unos 110 millones de parámetros en pesos de 32 bits.

La relevancia de esta ficha radica en que se trata de un artefacto de infraestructura más que de un modelo novedoso: permite cargar un encoder MPNet con la API unificada de KerasHub y desplegarlo sobre tres frameworks distintos sin reescribir código. No obstante, la model card es autogenerada, no declara licencia, idiomas ni pipeline, y no incluye resultados de evaluación, por lo que su uso en producción requiere verificación adicional por parte del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (MPNet, Masked and Permuted Pre-training) |
| Parametros totales | no disponible (estimado ~110 M por la configuracion 12x768, no confirmado por el autor) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (`max_sequence_length`) |
| Tipos de cuantizacion | no disponible (pesos en `float32`; no se documentan variantes GGUF, INT8 ni INT4) |
| Idiomas soportados | no disponible (el vocabulario de 30 527 tokens sugiere entrenamiento en ingles, sin confirmacion del autor) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio KerasHub, ~0,4 GB; compatible con backends JAX, TensorFlow y PyTorch) |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo MPNet, una variante que combina el enmascaramiento de tokens propio de BERT con la predicción permutada de XLNet. La configuración declarada en la model card especifica 12 capas, 12 cabezas de atención, `hidden_dim` de 768, `intermediate_dim` de 3072, dropout de 0,1, epsilon de layer norm de 1e-5 y un vocabulario de 30 527 entradas. La longitud máxima de secuencia es de 512 tokens. El backbone está marcado como entrenable y en `float32`.

No se dispone de información sobre el corpus de entrenamiento, el número de tokens procesados, la composición del dataset ni si se aplicaron técnicas de ajuste como RLHF o DPO. Tampoco se documenta el proceso de destilación o fine-tuning específico para la tarea de embeddings de paráfrasis que sugiere el nombre `paraphrase_mpnet_base_v2`. La model card indica explícitamente que ha sido generada de forma automática y que debe ser completada por el autor, por lo que cualquier detalle sobre datos o metodología queda fuera del alcance de la información disponible.

## Capacidades

- Generación de embeddings de texto densos para frases y párrafos, orientados a similitud semántica y detección de paráfrasis.
- Codificación de secuencias de hasta 512 tokens.
- Ejecución multiplataforma mediante KerasHub sobre los backends de JAX, TensorFlow y PyTorch.
- Backbone entrenable, lo que permite fine-tuning posterior sobre tareas específicas de retrieval o clasificación.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no es un modelo generativo).
- Capacidades multilingües: no confirmadas por el autor.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Búsqueda semántica en bases documentales: el modelo genera embeddings de 768 dimensiones que pueden indexarse en un motor vectorial (FAISS, Qdrant, pgvector) para recuperar pasajes por similitud coseno en lugar de coincidencia léxica.
- Detección de duplicados y near-duplicates: al comparar embeddings de pares de frases se pueden identificar contenidos repetidos en corpus editoriales, tickets de soporte o catálogos de producto.
- Clustering temático de textos: los vectores producidos permiten agrupar documentos o mensajes por temática mediante k-means o HDBSCAN, útil en análisis de feedback de usuarios.
- Deduplicación de datasets de entrenamiento: antes de entrenar otros modelos, se pueden calcular embeddings de las muestras y eliminar aquellas con similitud superior a un umbral, reduciendo contaminación y sobreajuste.
- Sistemas de recomendación basados en contenido: representar ítems y perfiles de usuario en el mismo espacio vectorial para sugerir artículos, noticias o productos afines.
- Filtrado previo en pipelines RAG: usar el encoder como primera etapa de recuperación (retriever bi-encoder) antes de un re-ranker más costoso, aprovechando su bajo coste computacional y su contexto de 512 tokens.
- Moderación y clasificación de textos: servir como extractor de features congelado para un clasificador lineal aguas abajo en tareas de toxicidad, spam o intención.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en `float32`: en torno a 0,4-0,5 GB para los pesos, más overhead de activaciones y del framework; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- En cuantización INT8 (no documentada oficialmente, pero viable vía conversión manual) el peso se reduciría a ~0,1-0,15 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior permiten throughput alto en batch. Para despliegues de alto volumen, A100 o H100 aportan margen pero no son necesarias.
- Cabe en GPU consumer: sí, en cualquier modelo con al menos 2 GB de VRAM (GTX 1650, RTX 3050, etc.).
- Opciones de despliegue: KerasHub con backend JAX, TensorFlow o PyTorch; exportación a SavedModel o a formato Torch para servir con TorchServe o FastAPI; no se documenta soporte nativo de vLLM, llama.cpp, Ollama ni TGI para este artefacto concreto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `keras/paraphrase_mpnet_base_v2` | ~110 M (estimado) | 512 | Embeddings / paráfrasis | no disponible | KerasHub (JAX/TF/PyTorch) |
| `sentence-transformers/all-mpnet-base-v2` | ~109 M | 384 | Embeddings / paráfrasis | Apache 2.0 (según su model card pública) | PyTorch / sentence-transformers |
| `sentence-transformers/all-MiniLM-L6-v2` | ~22 M | 256 | Embeddings | Apache 2.0 (según su model card pública) | PyTorch / sentence-transformers |
| `BAAI/bge-base-en-v1.5` | ~109 M | 512 | Embeddings / retrieval | MIT (según su model card pública) | PyTorch / sentence-transformers |

La comparativa se ofrece a título orientativo: los datos de los modelos alternativos provienen de sus model cards públicas y no han sido verificados en esta ficha. El principal diferenciador de la versión KerasHub es la portabilidad entre backends; en cambio, carece de la documentación de licencia, idiomas y evaluación que sí publican los modelos de sentence-transformers y BAAI.

## Limitaciones y advertencias

- La model card es autogenerada y no ha sido completada por el autor: faltan licencia, idiomas, pipeline y datos de entrenamiento.
- No se declara licencia, por lo que el uso comercial queda en un limbo legal hasta que el publicador lo aclare.
- No se han publicado métricas de evaluación (MTEB, STS, retrieval), de modo que no es posible verificar la calidad de los embeddings frente a alternativas consolidadas.
- El límite de 512 tokens obliga a truncar o segmentar documentos largos, lo que puede degradar la calidad de la representación en textos extensos.
- El vocabulario de 30 527 tokens sugiere un entrenamiento predominantemente en inglés; el rendimiento en castellano no está documentado y probablemente sea inferior al de modelos multilingües específicos.
- Riesgo de sesgos: al no documentarse el corpus de entrenamiento, no se pueden evaluar sesgos de género, raza o ideología; se recomienda auditoría previa en aplicaciones sensibles.
- Riesgo de alucinación: no aplica en sentido estricto al no ser un modelo generativo, pero los embeddings pueden producir similitudes espurias en dominios muy alejados del corpus original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación comunitaria.
- Para producción se recomienda comparar empíricamente contra `all-mpnet-base-v2` o `bge-base-en-v1.5` antes de adoptar esta conversión.

## Enlaces

- Hugging Face: https://huggingface.co/keras/paraphrase_mpnet_base_v2
- Documentación de MPNet en KerasHub: https://keras.io/api/keras_hub/models/mp_net
- Documentación de model cards de Hugging Face: https://huggingface.co/docs/hub/model-cards
- Paper original de MPNet (Masked and Permuted Pre-training for Language Understanding): no disponible en la información proporcionada
- Repositorio de KerasHub: no disponible en la información proporcionada

# alina0195/bge-m3-ro-msmarco-v2

## Resumen

`alina0195/bge-m3-ro-msmarco-v2` es un modelo de embeddings densos para similitud semántica y recuperación de información, especializado en rumano. Se trata de un fine-tuning del modelo multilingüe BAAI/bge-m3 sobre el dataset `alina0195/ro-msmarco-divided`, una partición en rumano del corpus MS MARCO. El modelo está entrenado con la función de pérdida `CachedMultipleNegativesRankingLoss`, lo que lo orienta específicamente a tareas de retrieval por pasajes.

El modelo tiene 567,7 millones de parámetros y se distribuye en formato safetensors a través de la librería sentence-transformers. Su relevancia radica en que cubre un hueco importante: la mayoría de los modelos de retrieval multilingües están dominados por el inglés y otros idiomas de alto recurso, mientras que el rumano tiene pocas opciones especializadas. Este modelo ofrece una alternativa densa y eficiente para buscar en colecciones documentales rumanas.

El autor es Alina Gheorghe (usuario `alina0195` en HuggingFace), y el modelo se publicó en agosto de 2026. Aunque no se especifica la licencia, el modelo base BAAI/bge-m3 se distribuye bajo licencia MIT, por lo que es probable que este fine-tuning herede dicha licencia, aunque no está confirmado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (transformer encoder, dense) |
| Parametros totales | 567.754.752 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de BAAI/bge-m3, 8192 tokens) |
| Tipos de cuantizacion | no disponible (formato original safetensors en FP32/FP16) |
| Idiomas soportados | rumano (fine-tuning); herencia multilingüe de XLM-RoBERTa |
| Licencia | no disponible (modelo base BAAI/bge-m3: MIT) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en BAAI/bge-m3, que a su vez utiliza la arquitectura XLM-RoBERTa, un transformer encoder con atención bidireccional. BGE-M3 es conocido por su soporte multilingüe y su capacidad para generar embeddings densos, dispersos y multi-vector, aunque este fine-tuning se centra en la representación densa para similitud coseno.

El entrenamiento se realizó sobre el dataset `alina0195/ro-msmarco-divided`, que contiene 402.871 ejemplos, utilizando `CachedMultipleNegativesRankingLoss`. Esta función de pérdida es estándar para retrieval: para cada consulta, se maximiza la similitud con el pasaje positivo y se minimiza con los negativos del batch. El dataset deriva de MS MARCO, un corpus de preguntas y pasajes reales de Bing, traducido o adaptado al rumano.

No se menciona el uso de RLHF, DPO ni otras técnicas de alineación, ya que se trata de un modelo de embeddings y no de generación. Tampoco se especifica el número total de tokens de entrenamiento ni la composición exacta del dataset más allá del tamaño en ejemplos.

## Capacidades

- Generación de embeddings densos para similitud semántica entre consultas y pasajes.
- Recuperación de información en rumano: dado un texto de consulta, devuelve los pasajes más relevantes de una colección.
- Búsqueda por similitud coseno, con soporte nativo en sentence-transformers.
- Compatible con Text Embeddings Inference (TEI) y endpoints de HuggingFace para despliegue en producción.
- Multilingüismo residual: al estar basado en XLM-RoBERTa, conserva cierta capacidad en otros idiomas, aunque su fine-tuning está orientado al rumano.
- No soporta tool calling, agentes ni generación de texto: es exclusivamente un modelo de representación.

## Casos de uso

- Búsqueda semántica en colecciones documentales rumanas: el modelo puede indexar artículos, informes o páginas web en rumano y recuperar los pasajes más relevantes ante una consulta en lenguaje natural, gracias a su entrenamiento específico sobre MS MARCO.
- Atención al cliente con base de conocimiento en rumano: integrado en un pipeline de retrieval-augmented generation (RAG), permite a un chatbot buscar respuestas en una base de artículos de soporte en rumano antes de generar la respuesta final.
- Motores de búsqueda internos para empresas rumanas: permite buscar en intranets, wikis corporativas o bases de datos de tickets usando consultas en lenguaje natural, con resultados ordenados por relevancia semántica.
- Moderación y clasificación de contenido: los embeddings generados pueden alimentar clasificadores posteriores para categorizar documentos, detectar duplicados o agrupar textos similares en rumano.
- Sistemas de recomendación basados en similitud: a partir de descripciones de productos o artículos en rumano, se pueden calcular vecinos cercanos para sugerir contenido relacionado.
- Investigación académica en PLN para rumano: sirve como modelo de partida para experimentos de retrieval, evaluación de benchmarks o fine-tuning adicional en dominios específicos (legal, médico, etc.).

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card, evaluados sobre el conjunto de desarrollo `ro-msmarco-dev`:

| Metrica | Valor |
|---|---|
| Cosine Accuracy@1 | 0,6544 |
| Cosine Accuracy@10 | 0,9073 |
| Cosine Precision@10 | 0,0958 |
| Cosine Precision@100 | 0,0106 |
| Cosine Recall@10 | 0,9000 |
| Cosine Recall@100 | 0,9887 |
| Cosine NDCG@10 | 0,7739 |
| Cosine MRR@10 | 0,7388 |
| Cosine MAP@100 | 0,7357 |

También se reportan resultados sobre una variante del conjunto sin diacríticos (`ro-msmarco-dev-nodiac`), con Accuracy@1 de 0,6519 y Accuracy@10 de 0,908 (el resto de métricas no se muestran completas en la información disponible). No se han publicado comparativas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 567,7 millones de parámetros. En FP32, ocupa aproximadamente 2,27 GB; en FP16, unos 1,14 GB. Con un batch pequeño, cabe en GPUs consumer de 4 GB o más.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16 (RTX 3050, RTX 4060, etc.). Para producción con alto throughput, se recomienda A10, A100 o H100.
- En consumer GPU: sí, cabe en GPUs de gama media como RTX 3060 (12 GB) o RTX 4070 sin problemas.
- Opciones de despliegue: sentence-transformers para prototipado, Text Embeddings Inference (TEI) para producción, y compatible con endpoints de HuggingFace. También se puede servir con FastAPI y ONNX si se convierte el modelo.
- Latencia y throughput: no disponible. Al ser un encoder de 567M parámetros, la latencia por consulta en GPU consumer suele estar en el rango de 10-50 ms, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| alina0195/bge-m3-ro-msmarco-v2 | 567,7M | no disponible (heredado: 8192) | rumano (fine-tuning) | no disponible | Especializado en retrieval rumano |
| BAAI/bge-m3 | 567,7M | 8192 | 100+ idiomas | MIT | Modelo base multilingüe, sin especialización en rumano |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | 118M | 512 | 50+ idiomas | Apache-2.0 | Más ligero, pero menos preciso en retrieval |

La comparativa directa con otros modelos especializados en rumano no está disponible en la información proporcionada. El modelo base BAAI/bge-m3 es la referencia natural: este fine-tuning debería superarlo en rumano al estar entrenado específicamente sobre MS MARCO en ese idioma, aunque no se han publicado resultados comparativos.

## Limitaciones y advertencias

- Sesgos: al estar entrenado sobre MS MARCO, un dataset derivado de consultas reales de Bing, puede heredar sesgos presentes en las consultas de los usuarios (distribución de temas, vocabulario, etc.).
- Riesgo de alucinación: no aplica directamente, ya que el modelo no genera texto; el riesgo se traslada al sistema RAG que use estos embeddings si la recuperación devuelve pasajes irrelevantes.
- Limitaciones de idioma: aunque XLM-RoBERTa es multilingüe, el fine-tuning está orientado al rumano. Su rendimiento en otros idiomas puede degradarse respecto al modelo base.
- Contexto: la longitud de contexto no está documentada en la model card; se asume la heredada de BGE-M3 (8192 tokens), pero no está confirmada.
- Licencia: no se especifica en la model card. El modelo base es MIT, pero el dataset de entrenamiento y el fine-tuning podrían tener restricciones adicionales. Conviene contactar al autor antes de uso comercial.
- Producción: el modelo tiene 0 descargas y 0 likes, lo que sugiere que no ha sido ampliamente validado por la comunidad. Se recomienda evaluar su rendimiento en el dominio específico antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alina0195/bge-m3-ro-msmarco-v2
- Dataset de entrenamiento: https://huggingface.co/datasets/alina0195/ro-msmarco
- Perfil del autor: https://huggingface.co/alina0195
- Modelo base BAAI/bge-m3: https://huggingface.co/BAAI/bge-m3
- Documentación de evaluación MS MARCO de BGE: https://bge-model.com/API/evaluation/msmarco.html
- Sitio oficial de MS MARCO: https://microsoft.github.io/msmarco/
- Repositorio MSMARCO V2: https://github.com/zhouyonglong/MSMARCOV2

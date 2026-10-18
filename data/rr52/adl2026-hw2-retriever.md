# RR52/adl2026-hw2-retriever

## Resumen

`RR52/adl2026-hw2-retriever` es un modelo de embeddings densos (retriever) obtenido por fine-tuning de `BAAI/bge-base-en-v1.5`. Lo publica el usuario RR52 en HuggingFace, aparentemente en el marco de un trabajo académico (el identificador `adl2026-hw2` sugiere la segunda práctica de una asignatura de aprendizaje profundo del curso 2026). No es un modelo generativo: su salida es un vector que representa una frase o un pasaje, pensado para comparar consultas con documentos mediante similitud.

El problema que aborda es la recuperación semántica en un contexto muy concreto: diálogos de compra. Los ejemplos de la model card muestran conversaciones de usuario con un asistente sobre maquillaje y decoración del hogar, y pasajes que son fichas de producto de comercio electrónico (marca, categoría, características, descripción). El modelo se entrenó sobre 7.392 ejemplos con la pérdida `CachedMultipleNegativesRankingLoss`, típica del ajuste de retrievers con sentence-transformers.

Arquitectura transformer tipo BERT en su variante *base*, con 109.482.240 parámetros (unos 109,5 M) y 0,4 GB de pesos en safetensors. Es relevante únicamente como pieza de un pipeline de búsqueda o RAG en dominio de e-commerce: no publica métricas, no declara licencia y no tiene descargas, por lo que debe tratarse como un artefacto experimental, no como un modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (variante base), modelo de embeddings densos |
| Parametros totales | 109.482.240 (≈109,5 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base `BAAI/bge-base-en-v1.5` admite 512 tokens |
| Tipos de cuantizacion | no se publican versiones cuantizadas; al estar en safetensors se puede convertir a fp16/int8 con herramientas estándar (PyTorch, Optimum) |
| Idiomas soportados | no disponibles; el modelo base es de inglés (sufijo `-en`), por lo que no hay garantía fuera del inglés |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 0,4 GB); no hay GGUF, ONNX ni versiones cuantizadas publicadas |
| Dimension de embedding | no declarada en la model card; el modelo base produce 768 dimensiones |
| Funcion de perdida | CachedMultipleNegativesRankingLoss |
| Tamano del dataset de entrenamiento | 7.392 ejemplos |
| Libreria | sentence-transformers |

## Arquitectura y entrenamiento

Se trata de un encoder BERT *base* (arquitectura transformer bidireccional, sin cabecera generativa) inicializado desde `BAAI/bge-base-en-v1.5` y ajustado con sentence-transformers para producir embeddings de frase normalizados y comparables por similitud coseno. La pérdida empleada, `CachedMultipleNegativesRankingLoss`, es la variante con caché de negativos en el lote que usa sentence-transformers para escalar el entrenamiento contrastivo con lotes grandes sin disparar la memoria: para cada par positivo (consulta, pasaje) se usan los demás pasajes del lote como negativos, y la caché evita recalcular los embeddings de los pasajes ya vistos en pasos anteriores.

El corpus de ajuste consta de 7.392 ejemplos con pares o tripletas del dominio de compras conversacionales: por un lado, diálogos multi-turno entre usuario y asistente en los que se expresan necesidades vagas ("algo para fijar el maquillaje sin resecar", "una pieza simbólica de prosperidad para el salón") y, por otro, fichas de producto con marca, categoría, características y descripción. No se documentan número de tokens, composición exacta del dataset, ni si hubo etapas de RLHF/DPO (no aplicables en un bi-encoder de recuperación). Tampoco se especifican hiperparámetros, épocas ni si se aplicaron aumentos de datos o minería de negativos duros. No hay innovaciones técnicas propias: el valor añadido es únicamente el ajuste al dominio.

## Capacidades

- Generación de embeddings densos de frases y pasajes para búsqueda semántica y similitud entre textos.
- Recuperación consulta-documento en dominio de e-commerce (belleza, cuidado personal, decoración del hogar).
- Manejo de consultas en estilo conversacional, con marcas de turno `user:` / `assistant:` en la entrada.
- Extracción de características (`feature-extraction`) para usar como encoder en pipelines posteriores (clasificación, clustering, deduplicación).
- Compatible con `text-embeddings-inference` y con los *endpoints* de HuggingFace, según las etiquetas del repo.
- No soporta tool calling ni function calling.
- No soporta agents ni razonamiento multi-paso (no es un modelo generativo).
- No tiene visión, audio ni modo *thinking*.
- Capacidades multilingües: no declaradas; el modelo base es monolingüe inglés.

## Casos de uso

- Búsqueda semántica en catálogo de e-commerce: indexar las fichas de producto como embeddings y recuperar los candidatos más próximos a la consulta del usuario. El ajuste sobre fichas reales de marca, categoría y descripción hace que el modelo discrimine entre productos similares por atributos (acabado cremoso, tono, SPF) y no solo por palabras clave.
- Asistente de compras conversacional: dado el histórico de turnos (`user:`/`assistant:`), construir la consulta de recuperación con los últimos turnos y lanzarla contra el índice vectorial para proponer productos. Los ejemplos de la model card están exactamente en ese formato, así que la distribución de entrada coincide con la de entrenamiento.
- RAG sobre documentación de producto: usar el modelo como retriever en un pipeline en el que un LLM generativo redacta la respuesta final a partir de los pasajes recuperados (política de devoluciones, ingredientes, compatibilidad).
- Deduplicación y agrupación de listados: calcular similitud coseno entre embeddings de fichas para detectar duplicados o variantes del mismo producto entre proveedores, y consolidar el catálogo.
- Re-ranking en un sistema de recomendación: recuperar con un método léxico barato (BM25) y reordenar los candidatos con este bi-encoder, que aporta señal semántica sobre las descripciones largas.
- Enrutado de tickets de soporte: embeber el ticket y compararlo con artículos de ayuda o con tickets resueltos previos para asignar cola o sugerir respuesta, siempre que el dominio esté próximo al de compras.
- Evaluación interna de retrievers: por estar entrenado sobre un dataset pequeño y conocido, sirve como línea base reproducible en experimentos docentes o para comparar estrategias de embedding en un catálogo propio.
- Clasificación few-shot por similitud: comparar el embedding de un texto nuevo con prototipos de cada clase (por ejemplo, categoría de producto) sin reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recuperación (Recall@k, nDCG@10, MRR) ni resultados en MTEB o BEIR, que serían los conjuntos de referencia para un modelo de este tipo. Tampoco se aporta una comparación con el modelo base, de modo que no es posible cuantificar si el fine-tuning mejora o degrada el rendimiento respecto a `BAAI/bge-base-en-v1.5`.

## Requisitos de hardware

- VRAM estimada para inferencia:约 0,45 GB en fp32 (109,5 M de parámetros × 4 bytes), unos 0,22 GB en fp16 y unos 0,11 GB en int8. Con lotes grandes y tokenizadores en paralelo, el consumo real se mueve entre 1 y 3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB. Una T4, L4, RTX 3060/4060 o superior es suficiente; A100/H100 solo tienen sentido para indexar millones de documentos en paralelo.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4090, e incluso en CPU para volúmenes moderados (unos pocos cientos de frases por segundo por núcleo, dependiendo de la longitud).
- Opciones de despliegue: sentence-transformers (referencia), text-embeddings-inference (etiqueta oficial del repo), vLLM con soporte de modelos de embeddings, Infinity o un servicio propio con Optimum/ONNX. No hay GGUF, por lo que llama.cpp y Ollama no están soportados sin conversión manual.
- Latencia y throughput: no disponibles; no se han publicado mediciones. Para dimensionar, un encoder BERT-base en una GPU moderna procesa típicamente del orden de miles de pares por segundo con lote grande, pero es una estimación genérica, no un dato de este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `RR52/adl2026-hw2-retriever` | 109,5 M | 768 (heredado del base) | 512 (heredado del base) | no disponible | HuggingFace, 0 descargas, 0 likes |
| `BAAI/bge-base-en-v1.5` (modelo base) | 109 M | 768 | 512 | MIT | HuggingFace, ampliamente usado |
| `BAAI/bge-small-en-v1.5` | 33 M | 384 | 512 | MIT | HuggingFace |
| `intfloat/e5-base-v2` | 109 M | 768 | 512 | MIT | HuggingFace |
| `sentence-transformers/all-MiniLM-L6-v2` | 22,7 M | 384 | 256 | Apache-2.0 | HuggingFace |

Los datos de dimensión y contexto de las filas comparativas proceden de la documentación pública de cada modelo base, no de la model card de este repo. La comparación de calidad es imposible: no hay métricas publicadas para `adl2026-hw2-retriever` y su licencia indeterminada lo hace inviable como sustituto directo, aunque su tamaño y coste de inferencia son idénticos a los de `bge-base-en-v1.5`.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial. Aunque el modelo base es MIT, el autor no ha especificado términos para este fine-tune, lo que constituye un riesgo legal en producción.
- Sin evaluación publicada: no hay evidencia de que el ajuste mejore al modelo base; puede incluso degradar la capacidad general de recuperación por sobreajuste a 7.392 ejemplos de un dominio muy concreto.
- Sesgo de dominio: el corpus parece centrado en belleza, cuidado personal y decoración del hogar, con vocabulario y estructuras de ficha de producto estadounidenses (marcas, UPC, pulgadas, onzas). El rendimiento fuera de ese dominio es incierto.
- Sesgo de género y de estilo: las consultas de ejemplo sobre maquillaje pueden reforzar asociaciones de género; no se documenta ninguna mitigación.
- Truncamiento: si el modelo hereda los 512 tokens del base, las descripciones de producto largas (los ejemplos del widget superan holgadamente ese límite) se recortan, con pérdida de atributos al final del texto.
- Riesgo de falsos positivos en recuperación: al no ser generativo no alucina texto, pero sí puede devolver productos semánticamente próximos y factualmente incorrectos (tono equivocado, producto descatalogado) si el índice no se filtra por metadatos.
- Idiomas: no se declaran; el base es inglés, así que en castellano el rendimiento será previsiblemente pobre y no está medido.
- Madurez: 0 descargas, 0 likes, repo creado y actualizado el 2026-10-18 con apenas segundos de diferencia entre ambos eventos, model card incompleta (truncada) y sin información de hiperparámetros ni de composición del dataset.
- Formato: solo safetensors; no hay GGUF ni ONNX, lo que limita el despliegue en entornos de inferencia ligera sin conversión previa.
- No sustituye a un LLM: no genera respuestas, solo vectores; cualquier caso de uso conversacional requiere un modelo generativo adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RR52/adl2026-hw2-retriever
- Modelo base: https://huggingface.co/BAAI/bge-base-en-v1.5
- Paper de Sentence-BERT (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de TAS-B, referenciado en las etiquetas (arXiv:2101.06983): https://arxiv.org/abs/2101.06983
- Documentación de sentence-transformers: https://www.sbert.net/
- Documentación de CachedMultipleNegativesRankingLoss: https://sbert.net/docs/package_reference/losses.html
- text-embeddings-inference: https://github.com/huggingface/text-embeddings-inference
- Paper del modelo base (C-Pack, arXiv:2309.07597): https://arxiv.org/abs/2309.07597

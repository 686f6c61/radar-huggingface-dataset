# huang2244/adl-hw2-retriever

## Resumen

`huang2244/adl-hw2-retriever` es un modelo de embeddings de frases (bi-encoder denso) publicado en Hugging Face por el usuario `huang2244`. Se trata de un fine-tune de `BAAI/bge-base-en-v1.5`, es decir, una arquitectura BERT-base de 12 capas con 109.482.240 parámetros, entrenada con la librería `sentence-transformers` mediante la función de pérdida `CachedMultipleNegativesRankingLoss` sobre un conjunto de 4.830 pares. Su propósito es la similitud semántica y la recuperación de pasajes: dada una consulta, devuelve un vector de embedding con el que ordenar documentos por relevancia.

El modelo resuelve un problema muy concreto: la búsqueda de productos de belleza y cuidado personal a partir de consultas conversacionales. Los ejemplos de la model card muestran diálogos de tipo `user:`/`assistant:` (por ejemplo, una usuaria que pide un organizador para sus productos de peluquería) emparejados con fichas de producto reales de Amazon (título, categoría, descripción y atributos). Esto lo sitúa en el ámbito del comercio electrónico y no en el de la recuperación de propósito general.

Es relevante ahora únicamente como artefacto académico y como caso de estudio reproducible: parece ser la entrega de una práctica (el prefijo `adl-hw2` sugiere "Advanced Deep Learning, homework 2"), no cuenta con descargas ni likes, no declara licencia, no publica métricas y no incluye información sobre hiperparámetros o composición exacta del corpus. Cualquier evaluador debería tratarlo como un checkpoint experimental, no como un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT-base (bi-encoder denso para similitud de frases), fine-tune de `BAAI/bge-base-en-v1.5` |
| Parámetros totales | 109.482.240 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base admite 512 tokens y la truncatura se aplicaría a ese límite |
| Tipos de cuantización | No disponible; el repositorio solo publica pesos en `safetensors` en precisión completa (compatible con conversión externa a fp16/int8) |
| Idiomas soportados | No disponible; el modelo base es monolingüe inglés y todos los ejemplos de la model card están en inglés |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (repo de 0,4 GB); no se publican GGUF ni ONNX |
| Dimensión del embedding | 768, heredada de `bge-base-en-v1.5` (no verificado explícitamente en la model card) |
| Función de similitud | Coseno (uso estándar en `sentence-transformers` para este tipo de checkpoint) |
| Prefijo de consulta | `Represent this sentence for searching relevant passages:` |
| Tamaño del dataset de entrenamiento | 4.830 ejemplos |
| Función de pérdida | `CachedMultipleNegativesRankingLoss` |
| Librería | `sentence-transformers` |
| Pipeline declarado | `sentence-similarity` (también etiquetado como `feature-extraction`) |

## Arquitectura y entrenamiento

La arquitectura es la de `BAAI/bge-base-en-v1.5`: un encoder BERT-base (12 capas, 768 dimensiones ocultas, 12 cabezas de atención, ~110 M de parámetros) utilizado como bi-encoder. Cada texto se codifica de forma independiente en un vector denso y la relevancia se aproxima mediante la similitud coseno entre los vectores de consulta y de pasaje. El modelo base se entrenó originalmente con objetivos de recuperación contrastiva, lo que proporciona un punto de partida razonable para el fine-tune realizado aquí.

El entrenamiento de este checkpoint se hizo con `CachedMultipleNegativesRankingLoss`, una variante de la pérdida de negativos en batch que cachea los embeddings de los pasajes para permitir batches efectivos grandes con memoria limitada. La model card solo declara el tamaño del conjunto (4.830 ejemplos) y la etiqueta `generated_from_trainer`; no se especifican épocas, tamaño de batch, tasa de aprendizaje, uso de negativos duros, precisión de entrenamiento ni composición exacta del corpus. Por los ejemplos del widget, los datos parecen pares (consulta conversacional multi-turno, ficha de producto de categoría "Beauty") extraídos de un catálogo tipo Amazon, con un formato de consulta que incluye el prefijo de instrucción de BGE y turnos `user:`/`assistant:`. No se documenta ninguna innovación técnica adicional (atención lineal, decodificación especulativa, destilación, etc.).

## Capacidades

- Generación de embeddings de frases y pasajes para búsqueda semántica y similitud textual (no genera texto: es un encoder).
- Recuperación densa de documentos: ordena un corpus por relevancia respecto a una consulta en lenguaje natural.
- Manejo de consultas conversacionales de varios turnos concatenados, tal y como muestran los ejemplos `user:`/`assistant:` de la model card.
- Codificación de fichas de producto con estructura heterogénea (título, categoría, descripción, atributos y listas de características).
- Similitud semántica entre productos o entre consulta y producto, útil para deduplicación y recomendación por vecinos.
- Extracción de features (`feature-extraction`) para usar los embeddings como entrada de clasificadores, clustering o sistemas de ranking.
- Compatibilidad con `text-embeddings-inference` (etiqueta `endpoints_compatible`), lo que facilita su despliegue como servicio HTTP.
- Soporte de tool calling / function calling: no disponible (no es un modelo generativo).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el modelo base es inglés y los datos de entrenamiento están en inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- **Búsqueda semántica en un catálogo de e-commerce de belleza**: indexar cada ficha de producto (título + categoría + descripción) como un vector de 768 dimensiones en FAISS o Qdrant y codificar la consulta del usuario con el prefijo `Represent this sentence for searching relevant passages:`. El modelo está ajustado exactamente sobre ese par consulta/ficha, por lo que recuperaría productos como el organizador de Caboodles o la loción SPF 15 de Pond's ante peticiones ambiguas del tipo "algo para organizar mis productos de pelo".
- **Asistente conversacional con recuperación aumentada**: concatenar los últimos turnos `user:`/`assistant:` en una sola cadena de consulta, tal y como se hizo en el entrenamiento, y recuperar los k productos más similares para que un LLM genere la respuesta final. Es el escenario que reproducen literalmente los ejemplos de la model card.
- **Reranking de candidatos de un retriever léxico**: usar BM25 o Elasticsearch para obtener 100 candidatos baratos y reordenarlos con la similitud coseno de este bi-encoder, reduciendo falsos positivos en consultas con vocabulario coloquial ("no-poo", "curl products", "satin finish").
- **Deduplicación y agrupación de fichas de producto**: calcular la matriz de similitud entre embeddings del catálogo y fusionar o marcar pares por encima de un umbral; útil para catálogos con listados duplicados del mismo artículo en distintos vendedores.
- **Recomendación "más como este"**: dado un producto, devolver sus vecinos más próximos en el espacio de embeddings, una operación de una sola consulta al índice vectorial que no requiere reentrenar nada.
- **RAG sobre documentación de producto y FAQs**: indexar políticas de devolución, guías de uso e ingredientes como pasajes y recuperar los fragmentos relevantes para un asistente de atención al cliente; el límite práctico es la ventana del modelo base (512 tokens), por lo que conviene trocear los documentos.
- **Prototipado y docencia en recuperación de información**: sirve como baseline reproducible en una práctica de sistemas de búsqueda, con la ventaja de que el par modelo/dataset es pequeño (0,4 GB, 4.830 pares) y se puede reentrenar en una GPU de consumo.
- **Enrutado de intención por similitud**: comparar el embedding de la consulta con embeddings de prototipos de intención ("devolución", "seguimiento de pedido", "recomendación de producto") y asignar la etiqueta del más próximo, sin necesidad de un clasificador supervisado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de recuperación (nDCG@10, Recall@k, MRR), ni evaluaciones en MTEB, BEIR o dominios de e-commerce, ni comparaciones con el modelo base. Tampoco se documentan tiempos de inferencia ni throughput. Cualquier cifra de rendimiento tendría que obtenerse evaluando el checkpoint contra un conjunto de test propio.

## Requisitos de hardware

- **VRAM estimada**: pesos en fp32 ≈ 438 MB (los 109,5 M de parámetros por 4 bytes, coherente con el repo de 0,4 GB); en fp16 ≈ 219 MB; en int8 ≈ 110 MB. Con overhead de runtime y batches pequeños, menos de 1 GB de VRAM dedicada; 2-4 GB cubren sin problema batches de 64-256 secuencias cortas.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB, incluidas RTX 3060, RTX 4060, RTX 4090, T4, L4, A10, A100 y H100. En A100/H100 el modelo no satura la GPU y el cuello de botella pasa a ser el tokenizador y el índice vectorial, no el encoder.
- **¿Cabe en consumer GPU?**: sí, en cualquier GPU de consumo de los últimos años (GTX 1650 en adelante) e incluso en CPU para volúmenes moderados; un BERT-base en CPU con `sentence-transformers` procesa decenas de frases por segundo.
- **Opciones de despliegue**: `sentence-transformers` (`SentenceTransformer("huang2244/adl-hw2-retriever")`), Hugging Face Text Embeddings Inference (el modelo lleva la etiqueta `text-embeddings-inference` y `endpoints_compatible`), `transformers` + pooling manual, Infinity o un microservicio FastAPI propio. `vLLM` no es la vía natural para un bi-encoder de este tamaño. Ollama y llama.cpp requieren un GGUF que el autor no publica: habría que convertirlo previamente.
- **Latencia y throughput**: no se han publicado medidas. Como referencia orientativa (no verificada para este checkpoint), un BERT-base en una GPU moderna procesa del orden de varios miles de frases cortas por segundo con batches grandes; en CPU la cifra baja a decenas o pocos cientos por segundo según longitud y número de hilos.
- **Nota de despliegue**: conviene fijar `max_seq_length` a la longitud real de las consultas y fichas (128-256 tokens suele bastar) para no desperdiciar cómputo; si se truncan fichas largas se pierden atributos que el modelo pudo haber aprendido a usar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dim. embedding | Licencia | Disponibilidad y notas |
|---|---|---|---|---|---|
| `huang2244/adl-hw2-retriever` | 109,5 M | No disponible (base: 512) | 768 (heredada) | No disponible | 0 descargas, sin métricas, fine-tune de dominio muy estrecho (belleza, consultas conversacionales) |
| `BAAI/bge-base-en-v1.5` (modelo base) | 109 M | 512 | 768 | MIT | Ampliamente usado, con resultados publicados en MTEB por el autor; monolingüe inglés; es el punto de partida de este checkpoint |
| `intfloat/e5-base-v2` | 109 M | 512 | 768 | MIT | Alternativa directa con prefijos `query:`/`passage:`, muy extendida en pipelines RAG; monolingüe inglés |
| `sentence-transformers/all-MiniLM-L6-v2` | 22,7 M | 256 | 384 | Apache-2.0 | Mucho más pequeño y rápido, calidad inferior en recuperación exigente; opción habitual cuando el coste de indexación manda |

El checkpoint aquí descrito solo sería preferible a su modelo base si se demuestra una mejora medible en el dominio concreto de e-commerce de belleza con consultas conversacionales; esa demostración no está publicada. En cualquier otro escenario, `bge-base-en-v1.5` o `e5-base-v2` son opciones más seguras por licencia, documentación y evaluación pública.

## Limitaciones y advertencias

- **Licencia no declarada**: no se especifica licencia alguna, lo que impide usar el modelo comercialmente con seguridad jurídica. Es el principal bloqueo para producción.
- **Sin evaluación publicada**: no hay métricas de recuperación ni comparación con el modelo base; no se puede afirmar que el fine-tune mejore a `bge-base-en-v1.5` fuera del corpus de entrenamiento.
- **Riesgo de sobreajuste**: 4.830 pares es un conjunto muy pequeño para un modelo de 109 M de parámetros; es probable el olvido catastrófico de las capacidades generales del modelo base y una degradación fuera del dominio de belleza.
- **Dominio estrecho**: el corpus parece limitado a fichas de producto de categoría "Beauty" con un formato muy concreto (título, categoría, descripción, atributos). El rendimiento en otros dominios (legal, médico, código, documentación técnica) es desconocido y probablemente pobre.
- **Idioma**: no se declaran idiomas soportados; el modelo base es inglés y los datos están en inglés. Se espera un rendimiento muy degradado en castellano u otras lenguas.
- **Riesgo de alucinación**: no aplica en el sentido generativo (el modelo no produce texto), pero sí existe riesgo de falsos positivos en la recuperación: similitudes altas entre productos de categorías distintas o entre consultas y fichas irrelevantes.
- **Sensibilidad al prefijo**: el formato de entrenamiento incluye el prefijo `Represent this sentence for searching relevant passages:` y turnos `user:`/`assistant:`. Omitir ese formato en inferencia puede degradar la calidad de los embeddings de consulta.
- **Sesgos del corpus**: el modelo hereda los sesgos de un catálogo de productos concreto (marcas, precios, disponibilidad geográfica, descripciones promocionales). Puede favorecer productos con descripciones más largas y redundantes por un efecto de longitud.
- **Longitud**: cualquier ficha que exceda el límite del modelo base (512 tokens) se trunca, perdiendo atributos que pueden ser decisivos.
- **Madurez**: 0 descargas y 0 likes, creado y actualizado el mismo día; parece una entrega académica sin mantenimiento previsto. No hay garantía de soporte, issues atendidos ni actualizaciones.
- **Empaquetado**: no hay GGUF, ONNX ni versiones cuantizadas publicadas; el despliegue en Ollama o llama.cpp exige trabajo de conversión y validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/huang2244/adl-hw2-retriever
- Modelo base: https://huggingface.co/BAAI/bge-base-en-v1.5
- Paper de Sentence-BERT referenciado en las etiquetas (arXiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper referenciado en las etiquetas (arXiv:2101.06983): https://arxiv.org/abs/2101.06983
- No se han encontrado en la información disponible blogs, demos, repositorios de código ni informes técnicos adicionales asociados a este checkpoint.

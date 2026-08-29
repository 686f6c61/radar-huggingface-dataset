# devrim/reign-small-l2_gn-gte-base_val-selected

## Resumen

REIGN (Refurbished Embeddings with Integrated Guidance Networks) es un bi-encoder de recuperación de documentos largos desarrollado por Devrim Cavuşoğlu y Emre Akbaş, presentado en Findings of EMNLP 2026. El modelo resuelve el problema del escalado de contexto en los bi-encoders tradicionales: en lugar de procesar tokens directamente, lee una secuencia de embeddings de chunks precomputados por una red guía congelada (GTE-base, 110M de parámetros) y los agrega mediante un encoder ligero de 2 capas con 3,85M de parámetros entrenables. Esto permite manejar documentos arbitrariamente largos sin aumentar el coste computacional de forma cuadrática.

El checkpoint `reign-small-l2_gn-gte-base_val-selected` contiene únicamente los pesos del encoder cross-chunk REIGN, que debe cargarse junto con la red guía `thenlper/gte-base`. Está entrenado sobre el dataset sintético `devrim/goodwiki_long_synthetic_ir` con una pérdida coseno de tres vías y seleccionado por mejor nDCG@10 en validación. Reporta resultados competitivos en GoodWiki-Long, LoCo y DAPFAM en cero disparo, con una huella de memoria mínima que lo hace viable en hardware de consumo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder de 2 capas (cross-chunk) sobre embeddings de chunks de una red guía congelada |
| Parametros totales | 3.993.600 (safetensors) — 3,85M entrenables + 110M de la red guía congelada |
| Parametros activos | 3,85M (encoder REIGN) + 110M (red guía, congelada) |
| Longitud de contexto | 512 tokens por chunk (ventana de la red guía); secuencia de chunks ilimitada en la práctica |
| Tipos de cuantizacion | no disponible (solo pesos float32 en safetensors) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 (dataset bajo CC BY-SA 4.0) |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

REIGN es un bi-encoder de dos etapas. La primera etapa es una red guía congelada (`thenlper/gte-base`, un transformer de 110M) que procesa el documento en chunks de 512 tokens con un stride de 512 (sin solapamiento) y produce embeddings por chunk. La segunda etapa es un encoder cross-chunk de 2 capas, dimensión 384, 6 cabezas de atención y FFN de 1536, que recibe la secuencia de embeddings de chunk y la agrega mediante pooling por media. El encoder es una función de conjunto permutación-equivariante: no usa señal de posición, por lo que el orden de los chunks no influye en el resultado.

El entrenamiento utiliza una pérdida coseno de tres vías con grados de relevancia s ∈ {1, 0, −1} (positivo, parcial, negativo) y peso parcial λ = 0,5. Cada paso construye 18 anclas con 1 positivo, 2 parciales y 17 negativos dentro del batch, totalizando 360 pares. Se usa AdamW con lr 1e-5, weight decay 1e-4, cosine annealing, 50 épocas con validación cada 4, precisión mixta de 16 bits y semilla 42. Los embeddings de la red guía se precomputan y cachean en disco para acelerar el entrenamiento, que se ejecutó en una única GPU de consumo con 24 GB de VRAM.

## Capacidades

- Generación de embeddings de documentos largos: procesa documentos de longitud arbitraria mediante la agregación de embeddings de chunks, devolviendo un vector L2-normalizado por documento.
- Recuperación documento-documento: orientado a tareas de retrieval donde tanto consultas como documentos son textos extensos (artículos, informes, páginas wiki).
- Funcionamiento en cero disparo: evaluado sin fine-tuning adicional en los benchmarks LoCo y DAPFAM, con resultados reportados en la tabla de benchmarks.
- Compatibilidad con la API de Hugging Face: se integra como pipeline de `feature-extraction` y requiere cargar explícitamente la red guía y el encoder REIGN.
- Embeddings normalizados: la salida está L2-normalizada, por lo que la similitud coseno se reduce a un producto escalar.
- Eficiencia computacional: al operar sobre embeddings de chunks en lugar de tokens, el coste de inferencia es independiente de la longitud del documento una vez generados los chunks.

## Casos de uso

- Recuperación de información en corpus de documentos largos: indexar artículos científicos, informes técnicos o páginas wiki completas y buscar documentos relevantes a partir de consultas también extensas, aprovechando la capacidad de manejar secuencias de chunks sin límite práctico.
- Sistemas de respuesta a preguntas sobre documentación corporativa: dado un conjunto de manuales o guías extensas, generar embeddings para cada documento y usar similitud coseno para encontrar el pasaje o documento más relevante a una pregunta detallada.
- Deduplicación de documentos: comparar embeddings de documentos largos para detectar duplicados o versiones casi idénticas en grandes repositorios, gracias a la normalización L2 y la robustez ante variaciones de longitud.
- Clasificación de documentos por similitud temática: agrupar informes, patentes o artículos de prensa en clústeres semánticos usando los embeddings generados, sin necesidad de etiquetas previas.
- Motores de búsqueda verticales: integrar REIGN en un pipeline de retrieval para dominios específicos (legal, médico, académico) donde los documentos superan la ventana de contexto de los bi-encoders convencionales.
- Evaluación de similitud entre documentos largos en investigación: medir la proximidad semántica entre tesis, propuestas o informes extensos para estudios bibliométricos o de análisis de contenido.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados para este checkpoint exacto, tal como aparecen en el paper (no re-derivados):

| Benchmark | Metrica | Eval stride | Valor | Referencia |
|---|---|---|---|---|
| GoodWiki-Long test | nDCG@10 | mejor stride | 66,02 | Tabla 7 |
| LoCo (macro-avg, zero-shot) | nDCG@10 | s384 | 66,97 | Tabla 8 |
| LoCo (macro-avg, zero-shot) | nDCG@10 | s512 | 66,84 | Tabla 8 |
| DAPFAM test (zero-shot) | nDCG@100 | s384 | 31,92 | Tabla 8 |
| DAPFAM test (zero-shot) | nDCG@100 | s512 | 31,68 | Tabla 8 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el encoder REIGN (3,85M parámetros) ocupa aproximadamente 15 MB en float32; la red guía GTE-base (110M) ocupa unos 440 MB. En total, menos de 500 MB de VRAM para inferencia en batch pequeño.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una GPU de consumo como una RTX 3060 o superior permite procesar batches grandes sin problemas.
- Compatibilidad con hardware de consumo: sí, cabe en cualquier GPU moderna, incluidas las integradas de portátiles con suficiente memoria compartida.
- Opciones de despliegue: al ser un modelo de embeddings, puede servirse mediante la API de Hugging Face Inference Endpoints, o integrarse en frameworks de retrieval como FAISS o Milvus. No hay soporte nativo para vLLM, llama.cpp u Ollama, ya que no es un modelo generativo.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño reducido, se espera una latencia de milisegundos por documento en GPU, dominada por el coste de la red guía (GTE-base) al generar los embeddings de chunk.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados con otros modelos de embeddings de documentos largos en la información proporcionada. Como referencia cualitativa:

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| REIGN small-l2 (este) | 3,85M + 110M guía | Multi-chunk (512 tokens/chunk) | Cross-chunk sobre embeddings de chunks | Apache 2.0 |
| thenlper/gte-base (modelo base) | 110M | 512 tokens | Bi-encoder clásico sobre tokens | Apache 2.0 |
| BGE-M3 (referencia general) | 568M | 8192 tokens | Bi-encoder denso + sparse + multi-vector | MIT |

La comparativa con BGE-M3 es orientativa y no se basa en resultados medidos en los mismos benchmarks. REIGN se distingue por su capacidad de procesar documentos de longitud ilimitada a un coste fijo por chunk, mientras que los bi-encoders convencionales están limitados por su ventana de contexto.

## Limitaciones y advertencias

- Solo soporta inglés: el modelo fue entrenado exclusivamente con datos en inglés y no debe usarse para otros idiomas sin evaluación previa.
- No apto para inputs cortos: si el documento es más corto que el tamaño de chunk (512 tokens), el encoder cross-chunk no tiene nada que agregar y el modelo degenera al comportamiento de la red guía. Para consultas o documentos cortos, debe usarse directamente GTE-base.
- Dependencia de la red guía: el checkpoint no es autónomo; requiere cargar `thenlper/gte-base` por separado y mantenerlo congelado. Si la red guía cambia, los embeddings generados no serán comparables.
- Sin señal de posición: al ser una función de conjunto permutación-equivariante, el modelo no distingue el orden de los chunks. Esto puede ser una limitación en tareas donde la estructura secuencial del documento es relevante.
- Riesgo de alucinación: al ser un modelo de embeddings, no genera texto, por lo que el riesgo de alucinación no aplica directamente. Sin embargo, la calidad de los embeddings depende de la red guía, que puede tener sesgos inherentes.
- Reproducibilidad: el entrenamiento con precisión mixta de 16 bits no es bit-reproducible incluso con semilla fija; un reentrenamiento no producirá pesos idénticos.
- Licencia del dataset: aunque el modelo es Apache 2.0, el dataset `goodwiki_long_synthetic_ir` se distribuye bajo CC BY-SA 4.0, lo que puede imponer restricciones de atribución y share-alike si se redistribuyen derivados del dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devrim/reign-small-l2_gn-gte-base_val-selected
- Código (GitHub): https://github.com/devrimcavusoglu/reign
- Página del proyecto: https://devrimcavusoglu.github.io/reign
- Dataset de entrenamiento: https://huggingface.co/datasets/devrim/goodwiki_long_synthetic_ir
- Paper: *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling*, Findings of EMNLP 2026 (en prensa).

# devrim/reign-small-l2_gn-gte-large_st-128_val-selected

## Resumen

REIGN `small-l2` es un codificador cruzado de chunks (cross-chunk encoder) desarrollado por Devrim Cavuşoğlu y Emre Akbaş para recuperación de documentos largos. El modelo, publicado bajo licencia Apache 2.0, forma parte del proyecto REIGN (Refurbished Embeddings with Integrated Guidance Networks), presentado en Findings of EMNLP 2026. Su objetivo es superar la limitación de ventana de contexto de los modelos de embeddings tradicionales procesando una secuencia de embeddings de chunks precalculados en lugar de tokens directamente.

El checkpoint `reign-small-l2_gn-gte-large_st-128_val-selected` contiene únicamente el encoder REIGN, con 4.092.416 parámetros (3,85 millones entrenables), que opera sobre los embeddings generados por una red guía congelada, `thenlper/gte-large` (335M de parámetros). El encoder tiene 2 capas, dimensión 384, 6 cabezas de atención y FFN de 1536, y agrega mediante pooling medio sobre la secuencia de chunks. Está entrenado sobre el dataset sintético `devrim/goodwiki_long_synthetic_ir` con una pérdida de coseno de tres vías, y seleccionado por mejor nDCG@10 en validación.

La relevancia de este modelo radica en su enfoque eficiente para escalar el contexto en recuperación de documentos: en lugar de aumentar la ventana de tokens, REIGN aprende a combinar representaciones de chunks ya generadas, reduciendo drásticamente el coste computacional. Está pensado para tareas de retrieval documento-a-documento con entradas largas, no para generación de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 2 capas (cross-chunk encoder) sobre embeddings de chunks; red guía congelada GTE-large |
| Parametros totales | 4.092.416 (encoder REIGN); 335M adicionales en la red guía congelada |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512 tokens por chunk (ventana de la red guía); secuencia de chunks ilimitada en la práctica |
| Tipos de cuantizacion | No disponible (pesos en float32) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

REIGN es un codificador cruzado de chunks: recibe una secuencia de embeddings de chunks (cada uno de dimensión 1024, generados por GTE-large) y produce un vector de documento L2-normalizado mediante pooling medio. El encoder es un transformer pequeño de 2 capas con 6 cabezas y FFN de 1536, diseñado para ser permutación-equivariante (sin señal de posición). La red guía `thenlper/gte-large` permanece congelada durante todo el entrenamiento, y sus embeddings se precalculan y cachean en disco para eficiencia.

El entrenamiento utiliza una pérdida de coseno de tres vías con objetivos graduados (positivo, parcial, negativo) y peso λ = 0,5. Se construyen lotes de 18 anclas, cada una con 1 positivo, 2 parciales y 17 negativos dentro del lote, totalizando 360 pares por paso. Se emplea AdamW con lr 1e-5, weight decay 1e-4, annealing coseno, 50 épocas con validación cada 4, y precisión mixta de 16 bits. La selección del checkpoint se basa en el mejor nDCG@10 en la partición de validación. El entrenamiento se realizó en una GPU de consumo de 24 GB.

## Capacidades

- Generación de embeddings de documentos largos: procesa secuencias de chunks de hasta longitud arbitraria, superando la ventana de 512 tokens de la red guía.
- Recuperación documento-a-documento: produce vectores L2-normalizados comparables por similitud coseno, optimizados para ranking (nDCG@10).
- Agregación de información distribuida: el pooling medio sobre chunks permite combinar señales de distintas secciones de un documento.
- Sin dependencia de posición: al ser permutación-equivariante, el modelo es robusto a la reorganización de chunks.
- Integración con el ecosistema GTE: usa embeddings de GTE-large como entrada, lo que facilita el uso con otros modelos de la familia.
- No es generativo: no produce texto, solo representaciones vectoriales.

## Casos de uso

- Búsqueda semántica en corpus de documentos extensos (informes, tesis, expedientes): el modelo indexa documentos completos de cientos de páginas y permite consultas por similitud coseno, superando la limitación de ventana de los embeddings clásicos.
- Sistemas RAG (Retrieval-Augmented Generation) sobre bases de conocimiento largas: se puede usar como recuperador para alimentar a un LLM generativo con fragmentos relevantes de documentos extensos, mejorando la precisión de las respuestas.
- Deduplicación y detección de documentos casi duplicados: al generar embeddings de documentos completos, facilita la identificación de versiones o copias con alta similitud, incluso si las diferencias están repartidas en distintas secciones.
- Clustering y organización temática de bibliotecas documentales: los vectores de documento permiten agrupar por contenido sin necesidad de resúmenes manuales, útil en archivística o gestión del conocimiento.
- Sistemas de recomendación basados en contenido: para artículos largos, informes técnicos o patentes, el modelo puede calcular similitudes entre documentos y sugerir ítems relacionados.
- Indexación y recuperación en entornos legales o de investigación: documentos legales o papers científicos suelen superar los 512 tokens; REIGN permite indexarlos completos y recuperarlos por similitud temática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks individuales para este checkpoint en la información disponible. La model card indica que pertenece a un barrido de strides de entrenamiento y que los resultados agregados se reportan en el paper de REIGN (Findings of EMNLP 2026, en prensa). No se proporcionan cifras de MMLU, HumanEval u otros benchmarks estándar, ya que el modelo no es generativo ni de razonamiento general.

## Requisitos de hardware

- El encoder REIGN (4M parámetros) es extremadamente ligero: puede ejecutarse en CPU o en cualquier GPU con más de 1 GB de VRAM.
- La red guía GTE-large (335M parámetros) requiere más recursos: aproximadamente 1,3 GB en float32, o ~0,7 GB en float16. En total, el sistema completo (encoder + guía) cabe en una GPU de 4-6 GB.
- Para inferencia en producción, se recomienda una GPU de gama media (RTX 3060 o superior) si se procesan muchos documentos, aunque el cuello de botella principal es la generación de embeddings de chunks con GTE-large.
- Opciones de despliegue: el código oficial (github.com/devrimcavusoglu/reign) proporciona `ReignBaselineEncoder` y `ReignModel`; se puede integrar con frameworks de embeddings como SentenceTransformers o FAISS para indexación.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño reducido del encoder, la latencia dominante proviene de la red guía; se estima un throughput de cientos de documentos por minuto en GPU moderna, pero este dato no está verificado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| REIGN small-l2 (este) | 4M + 335M guía | Ilimitado (chunks) | Cross-chunk sobre embeddings | Apache 2.0 |
| thenlper/gte-large (base) | 335M | 512 tokens | Bi-encoder de tokens | Apache 2.0 |
| BGE-large (BAAI) | 326M | 512 tokens | Bi-encoder de tokens | MIT |

La comparativa directa no está disponible porque REIGN introduce un paradigma distinto (operar sobre chunks en lugar de tokens). Frente a su modelo base GTE-large, REIGN añade la capacidad de procesar documentos completos sin truncamiento, a costa de un paso adicional de agregación. No se dispone de benchmarks comparativos publicados entre REIGN y otros modelos de embeddings largos (como LongFormer o SPLADE) en la información proporcionada.

## Limitaciones y advertencias

- No apto para inputs cortos: si el documento es más corto que el tamaño de chunk (512 tokens), el encoder no tiene nada que agregar y el modelo no debe usarse; en ese régimen se recomienda emplear directamente la red guía.
- Solo inglés: el modelo está entrenado exclusivamente con datos en inglés (Wikipedia y derivados sintéticos), por lo que su rendimiento en otros idiomas no está garantizado.
- Riesgo de sesgos: el dataset de entrenamiento proviene de Wikipedia, que puede contener sesgos de contenido y cobertura; esto puede afectar a la neutralidad de los embeddings en dominios específicos.
- No es un modelo generativo: no puede producir texto, solo representaciones vectoriales; no debe usarse para tareas de generación o razonamiento conversacional.
- Dependencia de la red guía: el checkpoint solo contiene el encoder REIGN; es obligatorio cargar `thenlper/gte-large` por separado, lo que añade complejidad de despliegue.
- Reproducibilidad: el entrenamiento con precisión mixta no es bit-reproducible; un reentrenamiento no producirá pesos idénticos, aunque las métricas deberían ser comparables.
- Licencia del dataset: aunque el modelo es Apache 2.0, el dataset `goodwiki_long_synthetic_ir` se distribuye bajo CC BY-SA 4.0, lo que puede imponer restricciones de atribución si se redistribuyen derivados del dataset.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/devrim/reign-small-l2_gn-gte-large_st-128_val-selected
- Código: https://github.com/devrimcavusoglu/reign
- Página del proyecto: https://devrimcavusoglu.github.io/reign
- Dataset: https://huggingface.co/datasets/devrim/goodwiki_long_synthetic_ir
- Paper: *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling*, Findings of EMNLP 2026 (en prensa).

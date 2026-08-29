# devrim/reign-base-l3_gn-gte-base_val-selected

## Resumen

REIGN `base-l3` es un encoder de embeddings para recuperación de documentos largos, desarrollado por el autor devrim. Forma parte del proyecto REIGN (Refurbished Embeddings with Integrated Guidance Networks), que aborda el problema de escalar la longitud de contexto en modelos de embeddings sin aumentar el coste computacional de forma lineal. En lugar de procesar tokens directamente, este modelo lee una secuencia de embeddings de fragmentos (chunks) previamente generados por una red de guía congelada, lo que permite manejar documentos arbitrariamente largos con una latencia mínima.

El modelo combina un encoder REIGN de 3 capas con 22,45 millones de parámetros entrenables, más una red de guía congelada basada en GTE-base (110 millones de parámetros), sumando una pila combinada de 132 millones. El tamaño de fragmento es de 512 tokens, con un stride de entrenamiento de 384. Está diseñado específicamente para recuperación documento-a-documento y para entradas de múltiples fragmentos, no para consultas cortas. Su licencia Apache 2.0 y su formato safetensors facilitan su integración en pipelines de búsqueda semántica.

La relevancia actual de este modelo radica en su eficiencia: con los embeddings de fragmentos en caché, alcanza una latencia de 0,5 ms por consulta, 85 veces inferior a la de re-ejecutar la red de guía, con un pico de memoria de solo 0,55 GB. Esto lo hace viable para despliegue en hardware de consumo y para sistemas de recuperación a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | REIGN base-l3 (transformer de 3 capas, d=768, 12 cabezas, FFN 3072) sobre red de guía congelada GTE-base |
| Parametros totales | 132M combinados (22,45M entrenables + 110M congelados de GTE-base) |
| Parametros activos | No aplica (no es MoE; solo los 22,45M son entrenables, el resto permanece congelado) |
| Longitud de contexto | Multi-fragmento: fragmentos de 512 tokens con stride 384; sin límite fijo de número de fragmentos |
| Tipos de cuantizacion | No disponible (pesos en float32) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, float32) |

## Arquitectura y entrenamiento

El modelo es un bi-encoder de documentos largos que opera sobre una secuencia de embeddings de fragmentos. La red de guía, `thenlper/gte-base`, procesa cada fragmento de 512 tokens y produce un embedding; el encoder REIGN, un transformer de 3 capas con 12 cabezas y FFN de 3072 dimensiones, agrega la secuencia de embeddings mediante pooling medio. No se utiliza señal de posición, por lo que el encoder es una función de conjunto permutación-equivariante. Esta arquitectura permite que el coste de inferencia dependa del número de fragmentos, no de la longitud total del documento.

El entrenamiento se realizó sobre el dataset sintético `devrim/goodwiki_long_synthetic_ir`, con una pérdida de coseno de tres vías (positivo, parcial y negativo) con peso parcial λ=0,5. Cada paso usa 18 anclas con 1 positivo, 2 parciales y 17 negativos dentro del lote, totalizando 360 pares. Se empleó AdamW con tasa de aprendizaje 1e-5, weight decay 1e-4, annealing coseno, 50 épocas con validación cada 4, y selección del mejor checkpoint por nDCG@10 en validación. La precisión fue mixta de 16 bits y los embeddings de la red de guía se precomputaron y cachearon. El entrenamiento se ejecutó en una única GPU de consumo de 24 GB.

## Capacidades

- Generación de embeddings densos L2-normalizados para documentos largos, aptos para similitud coseno y recuperación.
- Recuperación documento-a-documento, con soporte para entradas de múltiples fragmentos (más de 512 tokens).
- Funcionamiento en cero disparo (zero-shot) en benchmarks de recuperación de documentos largos como LoCo y DAPFAM.
- Caché de embeddings de fragmentos en disco, lo que reduce drásticamente la latencia por consulta (0,5 ms frente a 39,7 ms sin caché).
- No realiza generación de texto, ni tool calling, ni soporte de agentes; su función es exclusivamente la extracción de características.
- Multilingüe: no, solo inglés.

## Casos de uso

- Búsqueda semántica en corpus de documentos extensos: el modelo indexa documentos completos (informes, artículos, patentes) dividiéndolos en fragmentos de 512 tokens y agregando sus embeddings. Un sistema de recuperación puede comparar consultas o documentos completos mediante similitud coseno, con latencia de milisegundos gracias a la caché.
- Recuperación aumentada por generación (RAG) sobre bases de conocimiento largas: los embeddings generados por REIGN pueden alimentar un índice vectorial para recuperar pasajes relevantes de documentos extensos antes de pasarlos a un LLM generativo, reduciendo el coste de procesamiento de contexto largo.
- Deduplicación y detección de documentos casi duplicados: al representar documentos completos como un único vector, se pueden comparar grandes colecciones para identificar solapamientos o versiones similares, útil en gestión de bibliotecas digitales o repositorios legales.
- Clasificación de documentos por similitud temática: los embeddings permiten agrupar documentos largos en clústeres semánticos sin necesidad de etiquetas previas, facilitando la organización automática de archivos o la moderación de contenidos.
- Sistemas de recomendación basados en contenido: para artículos científicos, noticias o informes técnicos, el modelo puede calcular la similitud entre documentos completos y sugerir lecturas relacionadas, superando las limitaciones de modelos que solo manejan resúmenes o primeros párrafos.
- Archivado y búsqueda en entornos legales o regulatorios: documentos normativos extensos pueden indexarse y recuperarse por similitud semántica, permitiendo a los equipos legales encontrar precedentes o cláusulas relacionadas sin leer cada documento completo.

## Benchmarks y rendimiento

La model card reporta resultados para este checkpoint exacto, sin re-derivaciones. Se presentan en la siguiente tabla:

| Benchmark | Metrica | Eval stride | Valor |
|---|---|---|---|
| GoodWiki-Long test | nDCG@10 | s384 | 66,03 |
| LoCo (macro-avg, zero-shot) | nDCG@10 | s384 | 67,74 |
| LoCo (macro-avg, zero-shot) | nDCG@10 | s512 | 67,72 |
| DAPFAM test (zero-shot) | nDCG@100 | s384 | 32,72 |
| DAPFAM test (zero-shot) | nDCG@100 | s512 | 32,68 |

Coste de inferencia medido (protocolo: 500 documentos, 100 consultas, batch 8, una GPU de consumo de 24 GB):

| Configuracion | ms / consulta | Pico de GPU (GB) |
|---|---|---|
| Red de guía sola, chunked mean-pool | 42,7 | — |
| REIGN, caché fría (red de guía re-ejecutada) | 39,7 | 0,76 |
| REIGN, embeddings de fragmentos en caché | 0,5 | 0,55 |

Con caché, la latencia es 85,1 veces menor que re-ejecutar la red de guía. Sin caché, el rendimiento es comparable al de la línea base, no superior.

## Requisitos de hardware

- VRAM estimada: pico de 0,55 GB con caché y 0,76 GB sin caché, según las mediciones del paper. Esto permite ejecutar el modelo en cualquier GPU con al menos 1 GB de memoria.
- GPU recomendadas: cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es suficiente; el entrenamiento se realizó en una GPU de 24 GB, pero la inferencia es mucho más ligera.
- Compatibilidad con GPU consumer: sí, ampliamente.
- Opciones de despliegue: el paquete `reign` (instalable desde GitHub) proporciona la clase `ReignBaselineEncoder` para carga y codificación. No se mencionan integraciones con vLLM, Ollama o TGI; el despliegue se realiza mediante el código del repositorio o directamente con Hugging Face Transformers (a través de `ReignModel`).
- Latencia y throughput: 0,5 ms por consulta con caché, 39,7 ms sin caché, en el protocolo descrito. El throughput dependerá del tamaño del lote y del número de fragmentos por documento.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de embeddings de documentos largos en la información proporcionada. El modelo base es `thenlper/gte-base`, que tiene 110 millones de parámetros y una ventana de contexto de 512 tokens. REIGN lo extiende para manejar múltiples fragmentos, añadiendo 22,45 millones de parámetros entrenables. A continuación se muestra una comparación cualitativa con su modelo base:

| Modelo | Parametros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| thenlper/gte-base | 110M | 512 tokens | Bi-encoder estándar | Apache 2.0 |
| reign-base-l3_gn-gte-base_val-selected | 132M combinados (22,45M entrenables) | Multi-fragmento (512 tokens por fragmento) | Cross-chunk encoder sobre embeddings de fragmentos | Apache 2.0 |

No hay datos de benchmarks comparativos con otros modelos de la misma categoría (por ejemplo, jina-embeddings-v2 o bge-m3) en la información disponible.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para entradas de múltiples fragmentos. Para documentos o consultas de menos de 512 tokens, el encoder REIGN no tiene nada que agregar y se debe usar la red de guía por separado; usarlo en ese régimen puede producir resultados subóptimos.
- Solo soporta inglés. No hay capacidades multilingües.
- No genera texto; es únicamente un extractor de características. No debe usarse para tareas de generación o razonamiento.
- Los datos de entrenamiento son sintéticos (GoodWiki-Long-Synthetic), lo que puede introducir sesgos específicos del dominio wiki y limitar la generalización a otros dominios.
- Al ser un modelo de embeddings, el riesgo de alucinación no aplica directamente, pero los vectores pueden reflejar sesgos presentes en los datos de entrenamiento.
- El entrenamiento con precisión mixta de 16 bits no es bit-reproducible; un reentrenamiento no producirá pesos idénticos, aunque las métricas deberían ser comparables.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia de la red de guía subyacente (GTE-base, también Apache 2.0) y del dataset sintético.
- Para producción, es necesario implementar la caché de embeddings de fragmentos para obtener la baja latencia prometida; sin caché, el rendimiento es similar al de la red de guía sola.

## Enlaces

- HuggingFace: https://huggingface.co/devrim/reign-base-l3_gn-gte-base_val-selected
- Repositorio de código: https://github.com/devrimcavusoglu/reign
- Página del proyecto: https://devrimcavusoglu.github.io/reign
- Dataset de entrenamiento: https://huggingface.co/datasets/devrim/goodwiki_long_synthetic_ir
- Paper: *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling*, Findings of ACL: EMNLP 2026 (to appear).

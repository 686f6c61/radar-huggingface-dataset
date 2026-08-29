# devrim/reign-small-l2_gn-gte-large_st-384_val-selected

## Resumen

REIGN small-l2 es un codificador cruzado de chunks (cross-chunk encoder) diseñado para recuperación de documentos largos. Desarrollado por Devrim Cavuşoğlu y Emre Akbaş, forma parte del proyecto REIGN (Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling), presentado en Findings of EMNLP 2026. El modelo procesa una secuencia de embeddings de chunks previamente generados por una red guía congelada (GTE-large, 335M parámetros) en lugar de operar directamente sobre tokens, lo que permite escalar la longitud efectiva del contexto de forma eficiente.

Con solo 4,09 millones de parámetros totales (3,85M entrenables), este checkpoint específico usa una configuración de 2 capas, dimensión 384, 6 cabezas de atención y un tamaño de chunk de 512 tokens con stride de 384. Está entrenado sobre el dataset sintético GoodWiki-Long-Synthetic y optimizado para tareas de recuperación documento-a-documento. Su relevancia radica en ofrecer una alternativa ligera y eficiente para embeddings de documentos extensos, donde los modelos tradicionales de ventana fija pierden información contextual.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (2 capas, 6 cabezas, d=384, FFN 1536) |
| Parametros totales | 4.092.416 (3,85M entrenables) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | Depende de la red guía: 512 tokens por chunk; secuencia de chunks ilimitada en la práctica |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de transformer encoder estándar pero opera sobre embeddings de chunks en lugar de tokens. La red guía (GTE-large) permanece congelada y genera embeddings para cada chunk de 512 tokens con un stride de 384 durante el entrenamiento. El codificador REIGN recibe la secuencia de estos embeddings y aplica pooling por media sobre la secuencia completa, actuando como una función simétrica de permutación (sin señal de posición). Esto permite procesar documentos de longitud arbitraria con un coste computacional fijo por chunk.

El entrenamiento utiliza una pérdida de cosine embedding de tres vías con objetivos graduados (positivo, parcial, negativo) con peso λ=0,5. Se emplearon 18 anclas por lote, cada una con 1 positivo, 2 parciales y 17 negativos dentro del lote, generando 360 pares por paso. El optimizador fue AdamW con learning rate 1e-5, weight decay 1e-4 y annealing coseno, durante 50 épocas con validación cada 4. La selección del checkpoint se basó en el mejor nDCG@10 en la partición de validación. Se usó precisión mixta de 16 bits y las embeddings de la red guía se precomputaron y cachearon. El entrenamiento se realizó en una GPU de consumo de 24 GB.

## Capacidades

- Generación de embeddings densos para documentos largos, con normalización L2 para similitud coseno directa.
- Recuperación documento-a-documento (D2D) en corpus extensos, superando la limitación de ventana fija de los modelos base.
- Agregación de información de múltiples chunks mediante pooling por media, sin necesidad de atención entre tokens.
- Compatible con el ecosistema Hugging Face (PreTrainedModel) y con la librería `reign` para integración en pipelines de retrieval.
- Soporte para stride configurable en tiempo de inferencia, permitiendo ajustar el solapamiento entre chunks.
- No soporta tool calling, generación de texto ni razonamiento multi-paso; es exclusivamente un modelo de embeddings.

## Casos de uso

- Recuperación de pasajes en bases de conocimiento empresariales: el modelo puede indexar documentos técnicos extensos (manuales, informes) y recuperar los más relevantes para una consulta, gracias a su capacidad de procesar secuencias de chunks sin perder contexto global.
- Búsqueda semántica en bibliotecas digitales: ideal para corpus de artículos académicos o legales donde los documentos superan los 512 tokens; el codificador agrega información de todos los chunks para producir una representación fiel del documento completo.
- Sistemas de preguntas y respuestas sobre documentos largos: combinado con un modelo generativo, puede servir como componente de retrieval para seleccionar los documentos más pertinentes antes de la generación de respuestas.
- Deduplicación y agrupación de documentos: al generar embeddings de documentos completos, facilita tareas de clustering y detección de duplicados en grandes colecciones.
- Filtrado de contenido en pipelines de moderación: permite clasificar documentos largos por similitud con categorías predefinidas, útil en entornos de publicación o revisión.
- Construcción de índices vectoriales para motores de búsqueda: su bajo coste computacional (4M parámetros) permite desplegarlo en entornos con recursos limitados, manteniendo calidad competitiva en retrieval de documentos largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El checkpoint pertenece a un barrido de strides y no tiene una fila individual reportada; los resultados agregados se presentarán en el paper de EMNLP 2026. No se proporcionan métricas como MMLU, HumanEval o nDCG específicas para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB para el codificador REIGN (4M parámetros en float32), más la memoria necesaria para la red guía GTE-large (335M parámetros) si se ejecuta en el mismo dispositivo.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo completo (codificador + red guía) en inferencia; una GPU de 8 GB es suficiente para procesar lotes moderados.
- Cabe en GPUs de consumo: sí, funciona en RTX 3060, RTX 4060, RTX 4090, etc. El entrenamiento se realizó en una GPU de 24 GB, pero la inferencia es mucho más ligera.
- Opciones de despliegue: la librería `reign` proporciona `ReignBaselineEncoder` para integración directa; también se puede usar con Hugging Face Transformers (cargando `ReignModel`). No se menciona soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo generativo.
- Latencia y throughput: no disponible; depende del número de chunks y del hardware. Al ser un modelo pequeño, la latencia por documento es baja, pero la red guía (GTE-large) domina el coste.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| REIGN small-l2 (este) | 4M | Ilimitado (vía chunks) | Cross-chunk encoder sobre GTE-large | Apache 2.0 |
| thenlper/gte-large | 335M | 512 tokens | Bi-encoder estándar | Apache 2.0 |
| BGE-large-en-v1.5 | 335M | 512 tokens | Bi-encoder estándar | MIT |
| sentence-transformers/all-MiniLM-L6-v2 | 22M | 256 tokens | Bi-encoder ligero | Apache 2.0 |

La comparativa se basa en características estructurales; no hay datos de rendimiento disponibles para REIGN. Su ventaja principal es el manejo de documentos largos sin necesidad de truncamiento, a diferencia de los bi-encoders tradicionales.

## Limitaciones y advertencias

- No debe usarse para inputs de un solo chunk (menores de 512 tokens); en ese régimen, la red guía por sí sola es suficiente y el codificador REIGN no aporta valor.
- El modelo está entrenado exclusivamente en inglés; su rendimiento en otros idiomas no está garantizado.
- La licencia Apache 2.0 permite uso comercial, pero el dataset de entrenamiento (GoodWiki-Long-Synthetic) está bajo CC BY-SA 4.0, lo que puede imponer restricciones de share-alike si se redistribuyen derivados del dataset.
- No se han publicado evaluaciones de sesgos o alucinaciones; al ser un modelo de embeddings, el riesgo de alucinación es bajo, pero la calidad de las representaciones depende de la red guía y del dominio de entrenamiento (Wikipedia).
- La reproducibilidad del entrenamiento no es bit-exacta debido a la precisión mixta; las comparaciones deben hacerse sobre métricas, no sobre pesos.
- Para producción, es necesario gestionar el cache de embeddings de la red guía y asegurar que la versión de GTE-large sea consistente entre entrenamiento e inferencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/devrim/reign-small-l2_gn-gte-large_st-384_val-selected
- Código: https://github.com/devrimcavusoglu/reign
- Página del proyecto: https://devrimcavusoglu.github.io/reign
- Dataset: https://huggingface.co/datasets/devrim/goodwiki_long_synthetic_ir
- Paper (EMNLP 2026 Findings, to appear): *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling*

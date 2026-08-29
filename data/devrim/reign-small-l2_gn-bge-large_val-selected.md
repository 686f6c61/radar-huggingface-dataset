# devrim/reign-small-l2_gn-bge-large_val-selected

## Resumen

REIGN (Refurbished Embeddings with Integrated Guidance Networks) es un enfoque de bi-encoder para recuperación de documentos largos que, en lugar de procesar tokens directamente, lee una secuencia de embeddings de chunks precomputados por una red guía congelada. Este checkpoint concreto, `reign-small-l2_gn-bge-large_val-selected`, es un encoder cross-chunk pequeño (2 capas, 384 dimensiones) entrenado sobre la red guía `BAAI/bge-large-en-v1.5` (335M parámetros, congelada). El modelo está desarrollado por Devrim Cavuşoğlu y Emre Akbaş, y se publica como parte de un barrido de configuraciones para el artículo *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling* (Findings of EMNLP 2026, en prensa).

El objetivo es escalar la longitud de contexto de los embeddings de documentos sin aumentar el coste computacional de forma cuadrática. Al operar sobre embeddings de chunks (tamaño 512 tokens) en lugar de tokens, el encoder cross-chunk agrega información de secuencias largas con un coste lineal en el número de chunks. El checkpoint solo contiene los pesos del encoder REIGN (4.092.416 parámetros en total, de los cuales 3,85M son entrenables); la red guía debe cargarse por separado y permanece congelada. Está pensado para recuperación documento-a-documento, no para consultas cortas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bi-encoder cross-chunk (REIGN small-l2) + red guía congelada BGE-large (BAAI/bge-large-en-v1.5) |
| Parametros totales | 4.092.416 (encoder REIGN) + 335M (red guía, congelada) |
| Parametros activos | 3,85M (encoder REIGN, entrenables) |
| Longitud de contexto | 512 tokens por chunk (ventana de la red guía); sin límite fijo en el número de chunks |
| Tipos de cuantizacion | No disponible (pesos en float32; la red guía puede cargarse en precisión reducida) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos componentes. La red guía, `BAAI/bge-large-en-v1.5`, es un transformer encoder tipo BERT de 335M parámetros que procesa cada chunk de 512 tokens y produce un embedding por chunk. Estos embeddings se cachean en disco durante el entrenamiento. El encoder REIGN `small-l2` es un transformer de 2 capas con 6 cabezas de atención, dimensión 384 y FFN de 1536, que recibe la secuencia de embeddings de chunks y produce un único vector de documento mediante pooling por media. No se utiliza señal de posición, por lo que el encoder es una función simétrica de permutación sobre la secuencia de chunks.

El entrenamiento se realizó sobre el dataset `devrim/goodwiki_long_synthetic_ir` (derivado de GoodWiki, con licencia CC BY-SA 4.0), usando una pérdida coseno de tres vías con objetivos graduados (positivo, parcial, negativo) y peso parcial λ = 0,5. Se empleó AdamW con lr 1e-5, weight decay 1e-4, annealing coseno, 50 épocas con validación cada 4, y selección del checkpoint por mejor nDCG@10 en la partición de validación. La precisión fue mixta de 16 bits, con seed 42 y embeddings de la red guía precomputados. El entrenamiento se ejecutó en una única GPU de consumo con 24 GB de VRAM.

## Capacidades

- Generación de embeddings densos para documentos largos (múltiples chunks) mediante agregación de embeddings de chunks.
- Recuperación documento-a-documento: similitud coseno entre vectores L2-normalizados.
- Manejo de secuencias de chunks de longitud arbitraria (el número de chunks no está limitado por la ventana de atención del encoder REIGN).
- Funcionamiento como función simétrica de permutación: invariante al orden de los chunks (sin señal posicional).
- Integración con la red guía BGE-large para la extracción de características de chunks.
- No es un modelo generativo; solo produce representaciones vectoriales.

## Casos de uso

- Recuperación de documentos largos en corpus extensos: el modelo puede indexar documentos completos (por ejemplo, artículos de Wikipedia, informes técnicos) y buscar documentos similares mediante similitud coseno, superando la limitación de 512 tokens de los embeddings estándar.
- Sistemas RAG (Retrieval-Augmented Generation) con documentos largos: se puede usar como recuperador inicial para alimentar a un LLM generativo, aprovechando que el encoder procesa documentos completos sin truncamiento.
- Deduplicación de documentos: comparar embeddings de documentos largos para identificar duplicados o versiones similares en bases de datos grandes.
- Agrupación (clustering) temática de documentos: generar vectores de documento y aplicar algoritmos de clustering para organizar colecciones.
- Búsqueda semántica en bibliotecas de código o documentación técnica: indexar archivos de documentación extensos y permitir consultas por similitud.
- Evaluación de similitud entre pares de documentos en entornos de investigación: el modelo devuelve similitud coseno directamente, útil para tareas de verificación de plagio o análisis de solapamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que el artículo no reporta una fila para este checkpoint exacto, ya que se libera para completar el barrido de configuraciones. Los resultados de los checkpoints reportados se encuentran en el model zoo del repositorio y en el paper, pero no se proporcionan en la documentación accesible.

## Requisitos de hardware

- VRAM estimada para inferencia: el encoder REIGN es muy pequeño (~4M parámetros, < 20 MB en float32). La red guía BGE-large (335M) domina el consumo: ~1,3 GB en float32, ~670 MB en float16. En total, se recomienda al menos 2 GB de VRAM para inferencia con precisión reducida.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060) puede ejecutar el modelo. Para entrenamiento se usó una GPU de 24 GB (tipo RTX 3090/4090).
- Cabe en GPUs de consumo: sí, con las cantidades indicadas.
- Opciones de despliegue: el modelo se usa mediante el paquete `reign` (instalable desde GitHub) con la clase `ReignBaselineEncoder`. No hay soporte nativo para vLLM, Ollama o TGI, ya que es un modelo de embeddings personalizado.
- Latencia y throughput: no disponible. Depende del número de chunks y del hardware; la red guía procesa cada chunk de 512 tokens de forma secuencial, por lo que la latencia escala linealmente con la longitud del documento.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos para este checkpoint. Como referencia cualitativa, se puede comparar con otros modelos de embeddings de documentos largos:

| Modelo | Arquitectura | Contexto | Licencia | Notas |
|---|---|---|---|---|
| REIGN small-l2 (este) | Bi-encoder cross-chunk + BGE-large | Ilimitado (chunks de 512) | Apache 2.0 | Requiere red guía congelada; sin señal posicional |
| BAAI/bge-large-en-v1.5 | Transformer encoder (BERT-like) | 512 tokens | MIT | Modelo base de la red guía; no maneja documentos largos sin truncamiento |
| BGE-M3 | Multi-funcional (dense, sparse, multi-vector) | 8192 tokens | MIT | Soporta múltiples idiomas y funciones, pero no es un cross-chunk encoder |

La comparativa cuantitativa no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no hay capacidades multilingües.
- No es adecuado para inputs cortos (menos de 512 tokens): en ese régimen, el encoder cross-chunk no tiene nada que agregar y se debe usar la red guía directamente.
- Al ser una función simétrica de permutación, no captura el orden de los chunks, lo que puede ser una limitación para documentos donde el orden es semánticamente relevante.
- El entrenamiento se realizó sobre datos sintéticos derivados de Wikipedia (GoodWiki), por lo que puede presentar sesgos de dominio y no generalizar bien a otros tipos de documentos (legales, médicos, etc.).
- No se han publicado benchmarks para este checkpoint concreto; su rendimiento no está validado de forma independiente.
- La red guía BGE-large tiene sus propias limitaciones (ventana de 512 tokens, sesgos del modelo base).
- El uso en producción requiere cargar tanto el encoder REIGN como la red guía, lo que aumenta la complejidad de despliegue.
- La licencia del dataset de entrenamiento es CC BY-SA 4.0, lo que puede imponer restricciones de share-alike si se redistribuyen derivados del modelo entrenado con él.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/devrim/reign-small-l2_gn-bge-large_val-selected
- Código (repositorio): https://github.com/devrimcavusoglu/reign
- Página del proyecto: https://devrimcavusoglu.github.io/reign
- Dataset de entrenamiento: https://huggingface.co/datasets/devrim/goodwiki_long_synthetic_ir
- Paper (en prensa): *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling*, Findings of EMNLP 2026.

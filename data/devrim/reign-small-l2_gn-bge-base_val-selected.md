# devrim/reign-small-l2_gn-bge-base_val-selected

## Resumen

REIGN (Refurbished Embeddings with Integrated Guidance Networks) es un bi-encoder diseñado para retrieval de documentos largos, desarrollado por Devrim Cavuşoğlu y Emre Akbaş. El modelo presentado aquí, `reign-small-l2_gn-bge-base_val-selected`, es un cross-chunk encoder de la familia REIGN que, en lugar de procesar tokens directamente, lee una secuencia de embeddings de chunks generados por una guidance network congelada (BGE-base, 110M de parámetros). Esto permite escalar la longitud efectiva del contexto sin aumentar el coste computacional del encoder principal.

El checkpoint concreto contiene únicamente los pesos del encoder REIGN (3.993.600 parámetros, 2 capas, dimensión 384), que agrega mediante pooling medio los embeddings de chunks de 512 tokens producidos por la guidance network. Se entrenó sobre el dataset sintético `devrim/goodwiki_long_synthetic_ir` con una función de pérdida coseno de tres vías y selección por nDCG@10 en validación. Su relevancia radica en ofrecer una alternativa eficiente para retrieval documento-documento en corpus de textos extensos, donde los modelos de embeddings convencionales pierden información al truncar el contexto.

La licencia es Apache 2.0, el idioma soportado es inglés y el pipeline es de extracción de características (feature-extraction). No se han publicado resultados de benchmarks específicos para este checkpoint, aunque el paper asociado reporta métricas para otros checkpoints de la misma familia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | REIGN cross-chunk encoder (transformer de 2 capas, d=384, 6 cabezas, FFN 1536) + guidance network BGE-base congelada (110M) |
| Parametros totales | 3.993.600 (solo encoder REIGN; guidance network congelada de 110M no se cuenta) |
| Parametros activos | 3.993.600 (no es MoE; solo el encoder REIGN es entrenable) |
| Longitud de contexto | Ilimitada en número de chunks; cada chunk de 512 tokens, sin solapamiento (stride = 512) |
| Tipos de cuantizacion | No disponible (solo safetensors en float32) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

REIGN se compone de dos módulos: una guidance network (BGE-base, congelada) que transforma cada chunk de 512 tokens en un embedding, y un encoder cross-chunk (el checkpoint liberado) que procesa la secuencia de embeddings mediante una arquitectura transformer de 2 capas con dimensión 384 y 6 cabezas de atención. El encoder es una función set equivariante a permutaciones, es decir, no incorpora señal de posición sobre el orden de los chunks; el pooling final es la media de las representaciones de los chunks. Esta decisión reduce el coste computacional y permite manejar secuencias de chunks de longitud arbitraria.

El entrenamiento utilizó una pérdida coseno de tres vías con objetivos graduados s ∈ {1, 0, −1} (positivo, parcial, negativo) y peso parcial λ = 0.5. Cada paso construye 360 pares (18 anclas × 1 positivo + 2 parciales + 17 negativos in-batch). Se empleó AdamW con learning rate 1e-5, weight decay 1e-4 y annealing coseno, durante 50 épocas con validación cada 4. La selección del checkpoint se hizo por mejor nDCG@10 en la partición de validación. La precisión fue mixta de 16 bits y los embeddings de la guidance network se precomputaron y cachearon. El hardware de entrenamiento fue una GPU de consumo de 24 GB.

## Capacidades

- Generación de embeddings L2-normalizados para documentos completos, aptos para similitud coseno.
- Retrieval documento-documento en corpus de textos largos (artículos, informes, libros) mediante agregación de múltiples chunks.
- Procesamiento de secuencias de chunks sin límite fijo de longitud, gracias a la ausencia de señal posicional.
- Soporte de entrada de documentos de tamaño arbitrario, siempre que se dividan en chunks de 512 tokens con el stride configurado.
- No soporta tool calling, ni agentes, ni razonamiento multi-paso, ni visión, ni audio.
- Capacidad multilingüe limitada al inglés (la guidance network BGE-base está entrenada principalmente en inglés).

## Casos de uso

- Búsqueda semántica en bibliotecas digitales: el modelo permite indexar libros completos o artículos extensos como un único vector, superando la limitación de truncamiento de los embeddings convencionales. Se usaría precomputando los embeddings de chunks con la guidance network y agregándolos con el encoder REIGN.
- Sistemas RAG sobre documentos largos: en lugar de recuperar chunks individuales, se puede recuperar el documento completo relevante y luego extraer los pasajes específicos, mejorando la precisión en dominios como informes técnicos o expedientes legales.
- Deduplicación de documentos: al generar embeddings de documentos completos, se pueden comparar similitudes coseno para detectar copias o versiones casi idénticas en grandes corpus.
- Clasificación de documentos por similitud temática: los vectores generados sirven como entrada para algoritmos de clustering o clasificación supervisada en colecciones de textos largos.
- Recomendación de contenidos basada en similitud: en plataformas de publicación, se pueden recomendar artículos o informes relacionados comparando los embeddings de documentos completos.
- Archivado y organización automática de repositorios: el modelo facilita agrupar documentos por afinidad temática sin necesidad de leerlos completos, útil en gestión documental empresarial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este checkpoint exacto. El paper asociado reporta métricas para otros checkpoints de la familia REIGN, pero no se incluyen en la model card ni en los resultados de búsqueda. Por tanto, no se dispone de datos cuantitativos de rendimiento (MMLU, HumanEval, etc.) para este modelo concreto.

## Requisitos de hardware

- El encoder REIGN es muy ligero (3.99M parámetros), pero la guidance network BGE-base (110M) es necesaria para generar los embeddings de chunks. En total, se requiere memoria para ambos durante la inferencia.
- VRAM estimada: la guidance network BGE-base en float32 ocupa aproximadamente 440 MB; el encoder REIGN unos 16 MB. En total, menos de 1 GB para inferencia en lote pequeño. Con precisión mixta, la huella se reduce aún más.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente, incluyendo tarjetas de consumo como GTX 1660, RTX 3060 o superiores. El entrenamiento se realizó en una GPU de 24 GB, pero la inferencia es mucho menos exigente.
- Si cabe en consumer GPU: sí, en cualquier GPU moderna de consumo.
- Opciones de despliegue: el paquete `reign` (instalable desde GitHub) proporciona la clase `ReignBaselineEncoder` para generar embeddings. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo generativo sino de extracción de características. Se puede usar en pipelines de Python estándar.
- Latencia y throughput: no disponible. Dado el pequeño tamaño del encoder, se espera una latencia muy baja, pero no se proporcionan cifras concretas.

## Comparativa con modelos similares

No se dispone de datos cuantitativos para comparar directamente con alternativas. Sin embargo, se pueden señalar diferencias cualitativas con modelos de embeddings convencionales:

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| REIGN small-l2 (este) | 3.99M (encoder) + 110M (guidance congelada) | Ilimitado (chunks de 512) | Cross-chunk sobre embeddings | Apache 2.0 |
| BAAI/bge-base-en-v1.5 | 110M | 512 tokens | Embeddings de secuencia única | MIT |
| BAAI/bge-large-en-v1.5 | 335M | 512 tokens | Embeddings de secuencia única | MIT |

REIGN se diferencia de BGE-base en que agrega múltiples chunks, permitiendo representar documentos completos sin truncamiento. Frente a otros modelos de largo contexto (como GIST o Longformer), REIGN es más ligero y no requiere atención sobre tokens, sino sobre embeddings precomputados. No se dispone de comparativas numéricas en la información proporcionada.

## Limitaciones y advertencias

- El modelo está entrenado únicamente para inglés; su uso en otros idiomas degradará el rendimiento.
- No es adecuado para inputs cortos (menores de 512 tokens): en ese régimen, la guidance network por sí sola es suficiente y el encoder REIGN no aporta valor.
- La ausencia de señal de posición implica que el orden de los chunks no se tiene en cuenta, lo que puede ser problemático para documentos donde la estructura secuencial es relevante (por ejemplo, narrativas o argumentaciones).
- No se han publicado benchmarks específicos para este checkpoint, por lo que su rendimiento real en tareas concretas no está validado externamente.
- El dataset de entrenamiento (`goodwiki_long_synthetic_ir`) está bajo CC BY-SA 4.0, lo que puede implicar obligaciones de compartir igual si se redistribuyen derivados del modelo.
- La guidance network está congelada; cualquier limitación de BGE-base (por ejemplo, sesgos en representaciones) se hereda en el sistema completo.
- El entrenamiento con precisión mixta no es bit-reproducible, por lo que retrenar el modelo no producirá pesos idénticos.

## Enlaces

- HuggingFace: https://huggingface.co/devrim/reign-small-l2_gn-bge-base_val-selected
- Repositorio de código: https://github.com/devrimcavusoglu/reign
- Página del proyecto: https://devrimcavusoglu.github.io/reign
- Dataset de entrenamiento: https://huggingface.co/datasets/devrim/goodwiki_long_synthetic_ir
- Paper: *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling*, Findings of ACL EMNLP 2026 (to appear). URL no disponible.

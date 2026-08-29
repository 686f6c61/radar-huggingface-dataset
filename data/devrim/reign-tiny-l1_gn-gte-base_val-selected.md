# devrim/reign-tiny-l1_gn-gte-base_val-selected

## Resumen

REIGN (Refurbished Embeddings with Integrated Guidance Networks) es un modelo de embeddings para recuperación de documentos largos desarrollado por Devrim Cavusoglu y Emre Akbas, presentado en Findings of EMNLP 2026. Este checkpoint concreto, `reign-tiny-l1_gn-gte-base_val-selected`, contiene únicamente el encoder cross-chunk REIGN de tamaño `tiny-l1` (0,56 millones de parámetros entrenables), que se combina con una red guía congelada, GTE-base (110 millones de parámetros), para procesar documentos completos divididos en fragmentos de 512 tokens. El modelo resuelve el problema de escalar la longitud de contexto en bi-encoders sin aumentar el coste computacional de forma cuadrática, ya que opera sobre embeddings de fragmentos precalculados en lugar de sobre tokens.

La relevancia actual de este modelo radica en su eficiencia: permite recuperar documentos de longitud arbitraria con un coste de inferencia mínimo, ya que la red guía se ejecuta una sola vez por fragmento y el encoder REIGN agrega las representaciones resultantes mediante pooling medio. El checkpoint fue seleccionado por su mejor nDCG@10 en la partición de validación del dataset GoodWiki-Long-Synthetic, y alcanza un nDCG@10 de 63,70 en el conjunto de test de GoodWiki-Long. Está licenciado bajo Apache 2.0 y soporta únicamente inglés.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | REIGN cross-chunk encoder (1 capa, d=192, 3 cabezas, FFN 768) + guidance network GTE-base congelada (110M) |
| Parametros totales | 631.104 (encoder REIGN) + 110M (guidance network, congelada) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | ilimitada en número de fragmentos; cada fragmento de 512 tokens (ventana de la guidance network) |
| Tipos de cuantizacion | no disponible (solo safetensors en float32) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 (dataset bajo CC BY-SA 4.0) |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

REIGN es un bi-encoder de dos etapas. La primera etapa es una red guía (guidance network) congelada, en este caso GTE-base, que procesa cada fragmento de 512 tokens del documento y produce un embedding por fragmento. La segunda etapa es el encoder cross-chunk REIGN, un transformer de una sola capa con dimensión 192, 3 cabezas de atención y FFN de 768, que recibe la secuencia de embeddings de fragmentos y produce una representación agregada mediante pooling medio. El encoder es una función set permutation-equivariant, es decir, no utiliza señales de posición, por lo que el orden de los fragmentos no afecta al resultado.

El entrenamiento se realizó sobre el dataset `devrim/goodwiki_long_synthetic_ir`, que contiene pares de documentos con anotaciones de relevancia graduada. Se utilizó una función de pérdida de coseno de tres vías con objetivos s ∈ {1, 0, −1} (positivo, parcial, negativo) y peso parcial λ = 0,5. El optimizador fue AdamW con learning rate 1e-5, weight decay 1e-4 y programación de coseno. Se entrenaron 50 épocas con validación cada 4, seleccionando el checkpoint con mejor nDCG@10 en validación. El entrenamiento se realizó en precisión mixta de 16 bits sobre una GPU de consumo de 24 GB, con embeddings de la red guía precalculados y almacenados en caché. El tamaño de lote fue de 18 anclas × (1 positivo + 2 parciales + 17 negativos intra-lote) = 360 pares por paso.

## Capacidades

- Generación de embeddings densos L2-normalizados para documentos completos de longitud arbitraria.
- Recuperación document-to-document mediante similitud coseno (producto escalar de vectores normalizados).
- Agregación de representaciones de fragmentos sin necesidad de procesar el documento completo de una vez.
- Manejo de documentos que exceden la ventana de contexto de la red guía (512 tokens) mediante fragmentación con solapamiento controlado por el stride.
- Funcionamiento como función set permutation-equivariant, invariante al orden de los fragmentos.
- No es un modelo generativo: no produce texto, solo representaciones vectoriales.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- Capacidad multilingüe: no disponible, solo inglés.

## Casos de uso

- Búsqueda semántica en corpus de documentos legales extensos: el modelo puede indexar contratos, sentencias o normativas completas, permitiendo recuperar documentos relevantes por similitud coseno sin truncar el contenido, gracias a su capacidad de procesar secuencias de fragmentos.
- Sistemas RAG (retrieval-augmented generation) con fuentes de conocimiento de gran tamaño: al generar embeddings de documentos completos, se puede construir un índice vectorial que alimente a un LLM generativo, reduciendo la pérdida de información por truncamiento.
- Deduplicación de artículos científicos o informes técnicos: comparar documentos largos entre sí para identificar duplicados o versiones casi idénticas, usando la similitud coseno de los embeddings generados.
- Clustering de documentos extensos: agrupar informes, tesis o expedientes por temática o contenido, aprovechando que el modelo captura la semántica global del documento completo.
- Comparación de versiones de documentos: detectar cambios sustanciales entre revisiones de un mismo documento (por ejemplo, en gestión documental) mediante la distancia coseno entre sus representaciones.
- Moderación de contenido en plataformas con documentos largos: clasificar o filtrar publicaciones extensas (foros, blogs) según su temática o cumplimiento normativo, usando los embeddings como entrada a un clasificador supervisado.

## Benchmarks y rendimiento

El único resultado reportado en la información disponible es el siguiente, correspondiente al checkpoint exacto:

| Benchmark | Métrica | Eval stride | Valor |
|---|---|---|---|
| GoodWiki-Long test | nDCG@10 | s384 | 63,70 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, etc.) en la información disponible, ya que se trata de un modelo de embeddings y no de un LLM generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: el encoder REIGN ocupa aproximadamente 2,5 MB en float32 (631.104 parámetros × 4 bytes). La guidance network GTE-base (110M parámetros) ocupa unos 440 MB en float32, más las activaciones de los fragmentos. En total, se estima un consumo inferior a 1 GB de VRAM para procesar un documento de tamaño moderado.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 2060, RTX 3060) es suficiente. También puede ejecutarse en CPU, aunque con mayor latencia.
- Cabe en GPUs de consumo: sí, en prácticamente cualquier GPU moderna, incluso integradas si se usa cuantización de la guidance network (no incluida en este checkpoint).
- Opciones de despliegue: el modelo se utiliza mediante el paquete `reign` (instalable desde GitHub), que proporciona la clase `ReignBaselineEncoder`. No es compatible directamente con vLLM, llama.cpp u Ollama, al no ser un LLM generativo.
- Latencia y throughput: no disponible en la información proporcionada. Depende del número de fragmentos del documento y del hardware utilizado.

## Comparativa con modelos similares

No se dispone de benchmarks comparativos con otros modelos de embeddings de documentos largos en la información proporcionada. El modelo se basa en GTE-base como red guía, pero no se reportan resultados de GTE-base solo en GoodWiki-Long. Otras alternativas como Longformer o BGE-M3 no tienen datos comparables en este contexto. Por tanto, la comparativa cuantitativa no está disponible.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no hay soporte multilingüe.
- No es adecuado para inputs cortos (menores a 512 tokens), ya que en ese caso el encoder cross-chunk no tiene nada que agregar y el modelo degenera a la red guía sola.
- Requiere cargar la guidance network por separado y mantenerla congelada; el checkpoint no incluye los pesos de GTE-base.
- Al ser un modelo de embeddings, no genera texto y no puede realizar tareas de razonamiento o generación.
- El entrenamiento se realizó sobre datos sintéticos derivados de GoodWiki (Wikipedia en inglés), por lo que puede presentar sesgos de dominio y de contenido propios de Wikipedia.
- La licencia del modelo es Apache 2.0, pero el dataset de entrenamiento está bajo CC BY-SA 4.0, lo que puede imponer restricciones de atribución y share-alike si se redistribuyen los datos o modelos derivados que los incorporen.
- La precisión mixta de 16 bits durante el entrenamiento impide la reproducibilidad bit a bit; se recomienda comparar métricas, no pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/devrim/reign-tiny-l1_gn-gte-base_val-selected
- Código: https://github.com/devrimcavusoglu/reign
- Página del proyecto: https://devrimcavusoglu.github.io/reign
- Dataset: https://huggingface.co/datasets/devrim/goodwiki_long_synthetic_ir
- Paper: *REIGN: Refurbished Embeddings with Integrated Guidance Networks for Efficient Context-Length Scaling*, Findings of EMNLP 2026 (to appear).

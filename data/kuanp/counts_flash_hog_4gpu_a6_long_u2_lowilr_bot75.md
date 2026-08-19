# KuanP/counts_flash_hog_4gpu_a6_long_u2_lowilr_bot75

## Resumen

El modelo `counts_flash_hog_4gpu_a6_long_u2_lowilr_bot75` es un modelo de embeddings de células (Universal Cell Embedding, UCE) desarrollado por KuanP para transcriptómica de célula única (scRNA-seq). Forma parte de una serie de entrenamientos que comparten la misma receta y difieren únicamente en la selección de células de entrenamiento, lo que permite comparar representaciones entre distintas selecciones. Este modelo concreto se entrenó sobre el 75 % de las células con menor puntuación según un selector precomputado (Counts DataRater), excluyendo además un dataset específico.

La arquitectura es un transformer de 8 capas con dimensión de modelo 512 y 4 cabezas de atención, que utiliza una tabla de embeddings de genes congelada de 5120 dimensiones. El modelo tiene 773,7 millones de parámetros totales, de los cuales solo 28,9 millones son entrenables, y acepta secuencias de hasta 2048 tokens. Está entrenado sobre el dataset CELLxGENE 2025-01-30, que incluye 62,6 millones de células y 61 888 genes. Su propósito es generar representaciones vectoriales de células a partir de datos de expresión génica, útiles para agrupar, comparar y clasificar células.

La relevancia de este modelo radica en su enfoque de selección de datos: al entrenar sobre el subconjunto de células con menor puntuación, permite estudiar cómo afecta la selección de datos a la calidad de los embeddings, un aspecto crítico en el análisis de datos de transcriptómica. Además, al ser parte de una familia de modelos con la misma arquitectura, facilita comparaciones directas entre diferentes estrategias de selección.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 8 capas, d_model=512, 4 cabezas, embeddings de genes congelados de 5120 dimensiones |
| Parametros totales | 774 755 841 (según safetensors) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de transcriptómica, no de lenguaje) |
| Licencia | other (ver model card) |
| Formato de pesos | safetensors (junto con config.yaml, gene_names.txt, all_species_gene_dict.json) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura UCE (Universal Cell Embedding), un transformer con 8 capas, dimensión de modelo 512 y 4 cabezas de atención. La característica principal es que la tabla de embeddings de genes (5120 dimensiones) está congelada y se mantiene como un parámetro `nn.Parameter` dentro del state dict, lo que explica el tamaño de ~3 GB del archivo `model.safetensors`. Solo las capas transformer (28,9 millones de parámetros) son entrenables.

El entrenamiento se realizó sobre el dataset CELLxGENE 2025-01-30, con un total de 62 634 100 células y 61 888 genes. La selección de datos se hizo mediante un `ExcludeDatasetSelector` (excluye el dataset con ID `53d208b0-2cfd-4366-9866-c3c6114081bc`) y un `PrecomputedScoreSelector` que selecciona el 75 % de las células con menor puntuación según un score precomputado. El entrenamiento duró 131 072 pasos con batch global de 512, learning rate 5e-05 con programación coseno y 500 pasos de warmup, weight decay 0.0001 y precisión bf16.

Una innovación técnica destacable es el uso de embeddings de genes congelados, lo que reduce drásticamente el número de parámetros entrenables y permite entrenar modelos grandes con menos recursos. Además, la advertencia en la model card sobre el uso de `load_uce_checkpoint` en lugar de `from_pretrained` en transformers >=5 indica un problema conocido con la reinicialización de pesos, que debe tenerse en cuenta para una inferencia correcta.

## Capacidades

- Genera embeddings de células a partir de datos de expresión génica (recuentos de transcritos).
- Representa cada célula como un vector de alta dimensión que captura su perfil transcriptómico.
- Permite comparar células entre sí mediante similitud coseno u otras métricas.
- Soporta la integración con el paquete `uce_suite` para cargar checkpoints y procesar datasets.
- Incluye artefactos de genes (nombres y mapeo) para especies humanas.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso.
- No tiene capacidades multimodales (solo transcriptómica).

## Casos de uso

- Agrupamiento de células por tipo: los embeddings generados permiten aplicar algoritmos de clustering (por ejemplo, Leiden o K-means) para identificar tipos celulares en datasets de scRNA-seq. El modelo es adecuado porque produce representaciones densas que preservan la estructura biológica.
- Análisis de heterogeneidad celular en tejidos: al proyectar los embeddings en espacios de baja dimensión (UMAP, t-SNE), se pueden visualizar subpoblaciones celulares y estudiar su diversidad. La ventana de 2048 tokens permite procesar células con perfiles de expresión largos.
- Descubrimiento de subtipos celulares raros: al entrenar sobre el 75 % de células con menor puntuación, el modelo puede ser sensible a poblaciones minoritarias, útil para identificar subtipos poco representados.
- Integración de datos multi-omicos: los embeddings de células pueden alinearse con otros datos (por ejemplo, ATAC-seq) para estudios integrativos, aunque el modelo solo procesa transcriptómica.
- Evaluación de la calidad de datos: al ser parte de una familia de modelos con diferentes selecciones de células, permite comparar cómo afecta la selección a la calidad de los embeddings, útil para diseñar pipelines de filtrado.
- Transferencia a otros datasets: los embeddings preentrenados pueden usarse como características de entrada para modelos downstream (clasificación, regresión) en nuevos experimentos de célula única, reduciendo la necesidad de entrenar desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 774 millones de parámetros en bf16 (aproximadamente 1,5 GB), pero el checkpoint completo en safetensors ocupa 3,1 GB. Para inferencia con batch pequeño y secuencia de 2048 tokens, se estima un consumo de VRAM de 4-6 GB, aunque no hay datos oficiales.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3070, RTX 4060, A10) puede ejecutar inferencia. Para entrenamiento o fine-tuning se necesitaría mayor capacidad (A100, H100).
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo con 8 GB o más, siempre que se gestione el batch y la secuencia.
- Opciones de despliegue: el modelo se usa mediante el paquete `uce_suite` (carga con `load_uce_checkpoint`). No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables (como scGPT, Geneformer u otros modelos de embeddings de células) en la información disponible.

## Limitaciones y advertencias

- El modelo se entrenó sobre un subconjunto específico de células (el 75 % inferior según un score), por lo que puede tener sesgos hacia células con ciertas características y no generalizar bien a células con puntuaciones altas.
- La licencia "other" no es una licencia estándar; es necesario revisar los términos específicos antes de cualquier uso comercial.
- El repositorio es privado (requiere autenticación en Hugging Face), lo que limita el acceso.
- La tokenización es crítica: si los parámetros de `config.yaml` (pad_length, vocab_size, offsets) no coinciden exactamente en inferencia, los embeddings resultan incorrectos (la card advierte que el per-cell loss se fija en log(2) = 0.693).
- No se han publicado resultados de benchmarks, por lo que el rendimiento en tareas estándar de transcriptómica no está validado externamente.
- El modelo no es un modelo de lenguaje; no debe usarse para tareas de procesamiento de texto natural.
- El uso de `from_pretrained` con transformers >=5 puede sobrescribir los pesos entrenados; es obligatorio usar `load_uce_checkpoint` para una carga correcta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KuanP/counts_flash_hog_4gpu_a6_long_u2_lowilr_bot75
- Paquete `uce_suite` (referenciado en la model card, sin URL directa): https://github.com/ (enlace no especificado)
- Perfil del autor: https://huggingface.co/KuanP

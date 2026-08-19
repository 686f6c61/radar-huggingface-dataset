# KuanP/counts_flash_hog_4gpu_a6_long_u2_lowilr_top75

## Resumen

Modelo UCE (Universal Cell Embedding) desarrollado por KuanP para generar representaciones vectoriales de células individuales a partir de datos de transcriptómica (scRNA-seq). Forma parte de una serie de ejecuciones que comparten una receta de entrenamiento idéntica y difieren únicamente en la selección de células de entrenamiento, lo que permite comparar representaciones entre runs. Está entrenado sobre el dataset CELLxGENE con fecha 2025-01-30, reteniendo el percentil 75 superior de células según una puntuación precomputada por un modelo auxiliar denominado Counts DataRater.

La arquitectura es un transformer de 8 capas con dimensión oculta 512 y 4 cabezas de atención, con una tabla de embeddings de genes congelada de 5120 dimensiones. En total acumula 773,7 millones de parámetros, de los cuales solo 28,9 millones son entrenables. La longitud de secuencia es de 2048 tokens y el vocabulario alcanza los 145.469 tokens. Se trata del modelo final tras 131.072 pasos de entrenamiento, con precisión bf16.

La relevancia de este modelo radica en su diseño para estudios de robustez: al variar solo la selección de células entre runs, permite aislar el efecto de la selección de datos en las representaciones celulares resultantes, algo crítico en biología computacional donde la calidad de los datos de partida es heterogénea.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 8 capas, d512, 4 cabezas, embeddings de genes congelados de 5120-d |
| Parametros totales | 774.755.841 (773,7M) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | bf16 (no se documentan cuantizaciones alternativas) |
| Idiomas soportados | no aplicable (datos de expresión génica, no texto) |
| Licencia | other (requiere revisar términos específicos del autor) |
| Formato de pesos | safetensors (~3 GB) |

## Arquitectura y entrenamiento

El modelo usa un transformer de 8 capas con dimensión oculta 512 y 4 cabezas de atención. La tabla de embeddings de genes (5120 dimensiones, 145.469 tokens de vocabulario) está congelada como un `nn.Parameter` dentro del state dict, lo que explica el tamaño del archivo safetensors (~3 GB). El entrenamiento se realizó en precisión bf16 con batch global de 512, learning rate 5e-05 con schedule coseno y 500 pasos de warmup, weight decay 0.0001, y un total de 131.072 pasos.

El dataset de entrenamiento contiene 62.634.100 células y 61.888 genes, seleccionadas mediante un `ExcludeDatasetSelector` (excluyendo el dataset con ID 53d208b0-2cfd-4366-9866-c3c6114081bc) combinado con un `PrecomputedScoreSelector` que retiene el percentil 75 superior según las puntuaciones del Counts DataRater. El prefijo "flash_hog" en el nombre sugiere el uso de kernels Flash Higher-Order Gradients, que según el paquete PyPI homónimo logran una aceleración de ~3.7x frente a kernels optimizados con XLA y escalado de memoria lineal en lugar de cuadrático.

## Capacidades

- Generación de embeddings celulares a partir de datos de expresión génica (scRNA-seq) con secuencias de hasta 2048 tokens.
- Mapeo de genes entre especies mediante el diccionario `all_species_gene_dict.json` incluido en el repositorio.
- Representaciones comparables entre ejecuciones de la misma serie (misma receta, distinta selección de células).
- Tokenización específica para transcriptómica, configurada mediante `config.yaml` (pad_length 2048, vocab_size 145469, cls_token_idx 1, chrom_token_offset 143574).
- Inferencia mediante la suite `uce-training-suite` (`uce_suite`), con funciones dedicadas de carga de checkpoint y generación de embeddings.

## Casos de uso

- Anotación de tipos celulares: los embeddings generados pueden alimentar clasificadores supervisados para asignar identidades celulares a poblaciones no anotadas en datasets de scRNA-seq.
- Estudio del impacto de la selección de datos: al comparar este run (top 75% por Counts DataRater) con otros de la misma serie, se puede cuantificar cómo la selección de células afecta a las representaciones resultantes.
- Análisis de expresión génica a gran escala: procesamiento de datasets de millones de células gracias a la ventana de 2048 tokens y el entrenamiento distribuido en 4 GPUs.
- Integración multi-especie: el diccionario de genes multi-especie permite proyectar datos de distintas especies a un espacio vectorial común para análisis comparativos.
- Control de calidad de datos: las puntuaciones del Counts DataRater pueden utilizarse como métrica de calidad celular antes de generar embeddings, filtrando células de baja calidad.
- Evaluación de robustez de representaciones: comparación de embeddings entre los distintos runs de la serie para determinar la estabilidad de las representaciones ante cambios en la selección de datos de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: al menos 6-8 GB para inferencia en bf16 con batch pequeño, dado que el checkpoint pesa ~3 GB y la secuencia de 2048 tokens genera activaciones adicionales.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 8 GB de VRAM (RTX 3060/4070, A100, H100); el entrenamiento se realizó en 4 GPUs, pero la inferencia es viable en una sola GPU de consumo.
- Opciones de despliegue: requiere `uce-training-suite` (`uce_suite`); no se documenta soporte para vLLM, llama.cpp u Ollama, dado que no es un modelo de lenguaje.
- La carga del checkpoint debe hacerse con `load_uce_checkpoint` en lugar de `from_pretrained` en transformers >=5, ya que este último re-ejecuta `_init_weights` y sobrescribe los pesos entrenados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo pertenece a una serie de ejecuciones UCE con receta idéntica y distinta selección de células, pero no se ofrecen comparativas con otros modelos de embedding celular como scGPT, Geneformer o scBERT en la información disponible.

## Limitaciones y advertencias

- El modelo se entrenó únicamente sobre el percentil 75 superior de células según la puntuación del Counts DataRater, lo que puede introducir sesgo hacia células de alta calidad y limitar la generalización a poblaciones celulares de menor calidad.
- La licencia "other" requiere revisar los términos específicos del autor antes de cualquier uso comercial o redistribución.
- La tokenización debe coincidir exactamente con los valores de `config.yaml`; cualquier discrepancia produce embeddings incorrectos de forma silenciosa, sin errores aparentes.
- No se recomienda usar `from_pretrained` directamente en transformers >=5; el síntoma de ignorar esta advertencia es una pérdida fijada en log(2) = 0.693 y embeddings con apariencia de ruido.
- El repositorio es privado y requiere autenticación para la descarga mediante `snapshot_download`.
- No se documentan sesgos específicos, pero el entrenamiento exclusivo con datos de CELLxGENE puede limitar la generalización a otros datasets de transcriptómica con distribuciones diferentes.
- La URL del repositorio de `uce-training-suite` aparece vacía en la documentación, por lo que la disponibilidad de la suite de inferencia no está verificada.

## Enlaces

- HuggingFace: https://huggingface.co/KuanP/counts_flash_hog_4gpu_a6_long_u2_lowilr_top75
- Perfil del autor: https://huggingface.co/KuanP
- Datasets del autor: https://huggingface.co/KuanP/datasets
- Flash Hog (PyPI): https://pypi.org/project/flash-hog/

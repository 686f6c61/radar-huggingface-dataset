# KuanP/cxg-random75

## Resumen

El modelo `KuanP/cxg-random75` es un modelo de embeddings celulares basado en la arquitectura UCE (Universal Cell Embedding), desarrollado por KuanP y publicado en Hugging Face. Está entrenado sobre el dataset CELLxGENE de enero de 2025, con una selección aleatoria del 75% de las células disponibles (fijada con semilla 42). Su propósito es generar representaciones vectoriales de células a partir de datos de transcriptómica de célula única (scRNA-seq), lo que permite comparar y analizar perfiles de expresión génica a gran escala.

El modelo es un transformer de 8 capas con dimensión de modelo 512 y 4 cabezas de atención, que utiliza una tabla de embeddings de genes congelada de 5120 dimensiones. En total tiene 774 millones de parámetros, de los cuales solo 28,9 millones son entrenables, ya que la mayor parte corresponde a los embeddings de genes congelados. La longitud de contexto es de 2048 tokens, que representan genes ordenados por posición cromosómica. Este modelo forma parte de un conjunto de ejecuciones con receta de entrenamiento idéntica que difieren únicamente en la selección de células de entrenamiento, lo que permite estudiar el efecto de la selección de datos en las representaciones aprendidas.

Su relevancia actual radica en la necesidad de comprender cómo la composición del dataset de entrenamiento afecta a la calidad y robustez de los embeddings celulares, un aspecto crítico para aplicaciones biomédicas donde los datos pueden ser heterogéneos y ruidosos. Al compartir la misma arquitectura y receta que otros modelos de la serie, este checkpoint sirve como referencia para análisis comparativos controlados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 8 capas, d_model=512, 4 cabezas (UCE) |
| Parametros totales | 774.755.841 (773,7 M) |
| Parametros activos | No aplica (modelo denso; 28,9 M entrenables, resto congelado) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de transcriptómica, no de lenguaje natural) |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura UCE, un transformer encoder diseñado específicamente para datos de expresión génica. Cada célula se representa como una secuencia de 2048 tokens, donde cada token corresponde a un gen ordenado por posición cromosómica. La tabla de embeddings de genes es un parámetro congelado de 5120 dimensiones, lo que explica que el fichero `model.safetensors` ocupe unos 3 GB a pesar de que solo 28,9 millones de parámetros son entrenables. Esta tabla se mantiene fija durante el entrenamiento para preservar la semántica de los genes.

El entrenamiento se realizó durante 131.072 pasos con un batch global de 512, tasa de aprendizaje de 5e-05 con scheduler coseno y 500 pasos de warmup, weight decay de 0.0001 y precisión bf16. La selección de datos consistió en excluir un dataset específico (ID `53d208b0-2cfd-4366-9866-c3c6114081bc`) y luego tomar aleatoriamente el 75% de las células restantes con semilla 42. El dataset fuente contiene 62.634.100 células y 61.888 genes. Esta configuración forma parte de una serie de ejecuciones que comparten la misma receta y solo varían en la selección de células, lo que permite comparaciones directas entre representaciones.

Una advertencia importante de la model card: si se utiliza `from_pretrained` con transformers >=5, el método re-ejecuta `_init_weights` después de cargar los pesos, sobrescribiendo los pesos entrenados de las capas `nn.Linear`. Para evitar esto, se debe usar el cargador específico `load_uce_checkpoint` de la suite `uce_suite`, que fuerza la recarga del state dict.

## Capacidades

- Genera embeddings de células a partir de datos de expresión génica (scRNA-seq), produciendo vectores de alta dimensionalidad que capturan la identidad celular.
- Soporta la integración con el ecosistema UCE, permitiendo cargar el modelo, los parámetros de tokenización y los artefactos de genes para procesar datasets completos.
- Permite comparar representaciones entre distintas ejecuciones del mismo modelo con diferente selección de datos, facilitando estudios de robustez y sesgo.
- No es un modelo de generación de texto ni de lenguaje natural; no soporta tool calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multimodales ni de visión; está especializado exclusivamente en datos transcriptómicos.

## Casos de uso

- Agrupamiento y clasificación de tipos celulares: el modelo genera embeddings que pueden alimentar algoritmos de clustering (como Leiden o K-means) para identificar poblaciones celulares homogéneas en datasets de scRNA-seq, aprovechando la representación contextual de los genes.
- Análisis de expresión génica diferencial: a partir de los embeddings, se pueden proyectar células en un espacio latente y comparar grupos para detectar genes o patrones de expresión asociados a condiciones patológicas.
- Integración de datasets multi-origen: al estar entrenado en CELLxGENE, puede servir para armonizar datos de diferentes experimentos y laboratorios, reduciendo efectos de lote y facilitando meta-análisis.
- Estudio del efecto de la selección de datos: al ser una ejecución con el 75% aleatorio de las células, permite comparar con otras ejecuciones (por ejemplo, 100% o 50%) para evaluar cómo la cobertura del dataset afecta a la calidad de los embeddings.
- Generación de features para modelos downstream: los embeddings pueden usarse como entrada para clasificadores supervisados (p. ej., predicción de estado celular o respuesta a fármacos) en pipelines de aprendizaje automático.
- Investigación en biología computacional: sirve como herramienta de referencia para explorar la estructura celular en grandes cohortes, como las disponibles en CELLxGENE, sin necesidad de reentrenar modelos desde cero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval u otras, ya que se trata de un modelo de embeddings biológicos y no de un LLM generalista. No se dispone de comparaciones cuantitativas con otros modelos de embeddings celulares en esta fuente.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 774 M de parámetros, pero el fichero safetensors pesa 3,1 GB. En precisión bf16, la memoria requerida para los pesos es de aproximadamente 1,5 GB (774M × 2 bytes), más la memoria de activaciones y la tabla de embeddings congelada. Se estima un consumo de VRAM de entre 4 y 8 GB para procesar una célula individual, dependiendo del batch.
- GPU recomendadas: una GPU con al menos 8 GB de VRAM (p. ej., NVIDIA RTX 3070/3080, RTX 4060 Ti 16 GB) es suficiente para inferencia de una célula. Para procesar datasets completos con batches grandes, se recomienda una GPU con 16 GB o más (RTX 4090, A100, etc.).
- Sí cabe en GPUs de consumo: una RTX 3060 de 12 GB o superior puede ejecutar el modelo sin problemas.
- Opciones de despliegue: el modelo se usa a través de la librería `uce_suite` (uce-training-suite), que proporciona funciones como `load_uce_checkpoint` y `embed_dataset`. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se han publicado datos específicos. La inferencia depende del número de células y del hardware; en una GPU moderna, el procesamiento de una célula (secuencia de 2048 tokens) debería completarse en milisegundos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La serie de ejecuciones de UCE (con diferentes fracciones de selección de datos) podría considerarse como comparativa interna, pero no se listan alternativas externas como scGPT, Geneformer o scBERT en la model card. Por tanto, la comparativa con modelos similares no está disponible.

## Limitaciones y advertencias

- La licencia es "other", sin especificación clara de términos de uso comercial. Es necesario contactar al autor o revisar los metadatos del repositorio para conocer las restricciones exactas.
- El modelo está entrenado exclusivamente con datos de transcriptómica de célula única; no es adecuado para tareas de procesamiento de lenguaje natural ni para otros dominios biológicos (como proteómica o epigenética).
- La selección aleatoria del 75% de las células puede introducir sesgos de representación: ciertos tipos celulares o condiciones podrían estar subrepresentados, afectando a la generalización en datasets externos.
- Riesgo de alucinación: al ser un modelo de embeddings, no genera texto, por lo que el concepto de alucinación no aplica directamente. Sin embargo, los embeddings pueden reflejar artefactos del dataset de entrenamiento, como efectos de lote o ruido técnico.
- La advertencia sobre `from_pretrained` en transformers >=5 es crítica: si se ignora, los pesos entrenados se sobrescriben y las embeddings resultantes son ruido. Es imprescindible usar el cargador específico de `uce_suite`.
- El repositorio es privado (según la model card, se necesita autenticación para descargarlo), lo que limita su accesibilidad pública.
- No se proporcionan métricas de rendimiento ni validación externa, por lo que la calidad de los embeddings debe evaluarse de forma independiente para cada caso de uso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/KuanP/cxg-random75
- Repositorio de la suite de entrenamiento UCE (referenciado en la model card): https://github.com/ (enlace genérico, no se especifica la URL exacta)
- Dataset CELLxGENE (fuente de entrenamiento): no se proporciona enlace directo en la información disponible.

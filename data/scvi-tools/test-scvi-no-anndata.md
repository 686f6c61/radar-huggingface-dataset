# scvi-tools/test-scvi-no-anndata

## Resumen

Este modelo, identificado como `test-scvi-no-anndata`, es un artefacto de prueba subido por el equipo de scvi-tools al Hugging Face Hub. No se trata de un modelo de lenguaje, sino de una implementación de scVI (Single-Cell Variational Inference), un modelo generativo profundo basado en inferencia variacional diseñado para el análisis de datos de secuenciación de ARN de célula única (scRNA-seq). scVI aprende una representación latente de baja dimensión de la expresión génica, integra lotes técnicos y puede imputar valores de dropout, lo que facilita tareas posteriores como visualización, clustering y análisis de expresión diferencial.

El modelo concreto fue entrenado sobre datos sintéticos independientes e idénticamente distribuidos (IID) y se subió sin datos asociados (sin AnnData). Está etiquetado como `annotated:False`, lo que indica que no incluye anotaciones celulares. Su propósito es servir como ejemplo de cómo subir un modelo scVI al Hub, no como una herramienta para análisis reales. Aun así, la arquitectura subyacente y los parámetros de configuración son representativos de un modelo scVI estándar, con una capa oculta de 128 neuronas, una dimensión latente de 10 y una única capa de red neuronal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | scVI (inferencia variacional con red neuronal profunda) |
| Parametros totales | no disponible (hiperparámetros: n_hidden=128, n_latent=10, n_layers=1) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de texto) |
| Licencia | cc-by-4.0 |
| Formato de pesos | no disponible (probablemente safetensors o pytorch, no especificado) |

## Arquitectura y entrenamiento

scVI es un modelo generativo profundo que emplea inferencia variacional para modelar la expresión génica. La arquitectura consta de un codificador que mapea la matriz de expresión génica (células × genes) a una distribución latente normal de baja dimensión, y un decodificador que reconstruye la expresión a partir de esa representación latente. El modelo utiliza una verosimilitud de tipo ZINB (zero-inflated negative binomial) para manejar el exceso de ceros típico de los datos de scRNA-seq, y permite incorporar covariables de lote para corregir efectos técnicos. En este caso, los parámetros de configuración son: `n_hidden=128`, `n_latent=10`, `n_layers=1`, `dropout_rate=0.1`, `dispersion="gene"`, `gene_likelihood="zinb"`, `use_observed_lib_size=true` y `latent_distribution="normal"`.

El entrenamiento se realizó sobre un conjunto de datos sintético con 400 células y 100 genes, sin covariables de lote ni etiquetas. No se proporciona información sobre el número de épocas, el optimizador ni la función de pérdida utilizada. Al ser un modelo de prueba, no se ha aplicado ningún proceso de ajuste fino posterior ni se han utilizado datos reales. La ausencia de datos de entrenamiento adjuntos (el repositorio solo contiene los pesos del modelo) impide reproducir o validar el entrenamiento.

## Capacidades

- Aprendizaje de representaciones latentes de baja dimensión a partir de matrices de expresión génica.
- Integración de lotes técnicos (batch effect correction) cuando se proporciona `batch_key`.
- Imputación de valores de dropout (genes con conteo cero) mediante la verosimilitud ZINB.
- Generación de datos de expresión sintética (muestreo de la distribución latente).
- Visualización de células en un espacio latente (por ejemplo, con UMAP o t-SNE).
- Clustering de células basado en la representación latente.
- Análisis de expresión diferencial entre condiciones o tipos celulares (si se dispone de etiquetas).

No soporta tool calling, agentes, razonamiento multi-paso, ni capacidades multimodales, ya que no es un modelo de lenguaje.

## Casos de uso

Aunque este modelo concreto es de prueba y no debe usarse en producción, la arquitectura scVI es ampliamente utilizada en bioinformática. Casos de uso típicos de un modelo scVI entrenado adecuadamente:

- **Análisis exploratorio de datos de scRNA-seq**: proyectar células en un espacio latente de baja dimensión para visualizar poblaciones celulares y descubrir subtipos.
- **Integración de datos multi-lote**: combinar muestras de distintos experimentos o laboratorios corrigiendo efectos de lote, lo que permite comparaciones entre condiciones.
- **Imputación de dropouts**: rellenar valores de expresión faltantes (ceros por captura incompleta) para mejorar análisis posteriores como la expresión diferencial.
- **Identificación de tipos celulares**: utilizar la representación latente como entrada para algoritmos de clustering o clasificación supervisada.
- **Generación de datos sintéticos**: muestrear nuevas células desde el modelo para aumentar conjuntos de datos o simular experimentos.
- **Transferencia de aprendizaje**: mediante el framework Arches, un modelo scVI preentrenado puede ajustarse finamente a nuevos datos, lo que permite reutilizar representaciones aprendidas en grandes cohortes.

Para estos casos, se requiere un modelo entrenado con datos reales y validado, no el artefacto de prueba aquí descrito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las métricas de coeficiente de variación y expresión diferencial no fueron proporcionadas por el cargador del modelo. Tampoco se ofrecen comparaciones con otros modelos.

## Requisitos de hardware

- Al ser un modelo pequeño (400 células, 100 genes, red con una capa oculta de 128 unidades), la inferencia puede ejecutarse en CPU sin necesidad de GPU.
- La memoria RAM requerida es mínima (el repositorio pesa 0.4 GB, pero la mayor parte corresponde a pesos del modelo; el tamaño en memoria es inferior a 100 MB).
- No se requieren GPUs específicas; cualquier equipo con Python y scvi-tools instalado puede cargar y ejecutar el modelo.
- Opciones de despliegue: scvi-tools (biblioteca principal), que permite cargar el modelo con `scvi.model.SCVI.load()`. También se puede exportar a otros formatos si se desea, pero no es habitual.
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño, la inferencia sobre 400 células es casi instantánea en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (modelos de inferencia variacional para scRNA-seq). Existen alternativas como scANVI (extensión semisupervisada de scVI) o modelos como Harmony, pero no hay datos de rendimiento disponibles para este modelo concreto. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **Modelo de prueba**: fue entrenado con datos sintéticos IID y no es representativo de datos biológicos reales. No debe utilizarse para análisis científicos.
- **Sin datos de entrenamiento**: no se adjunta el AnnData original, por lo que es imposible evaluar la calidad del modelo o replicar su entrenamiento.
- **Sin métricas de rendimiento**: la model card no proporciona coeficientes de variación ni métricas de expresión diferencial.
- **Sin anotaciones**: `annotated:False` indica que no hay etiquetas de tipos celulares, limitando su uso para análisis supervisados.
- **Licencia**: cc-by-4.0 permite uso comercial y modificación, siempre que se atribuya la fuente, pero dado que es un modelo de prueba, su utilidad comercial es nula.
- **Riesgo de alucinación**: no aplica al no ser un modelo generativo de texto; sin embargo, la generación de datos sintéticos podría inducir a error si se interpreta como datos reales.

## Enlaces

- [Hugging Face - scvi-tools/test-scvi-no-anndata](https://huggingface.co/scvi-tools/test-scvi-no-anndata)
- [Manuscrito original de scVI](https://www.nature.com/articles/s41592-018-0229-2)
- [Manuscrito de scvi-hub (preprint)](https://www.biorxiv.org/content/10.1101/2024.03.01.582887v2)
- [Guía de usuario de scVI en scvi-tools](https://docs.scvi-tools.org/en/stable/user_guide/models/scvi.html)
- [Tutorial de Arches para ajuste fino](https://docs.scvi-tools.org/en/stable/tutorials/notebooks/scrna/scarches_scvi_tools.html)

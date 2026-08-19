# scvi-tools/test-scvi

## Resumen

El modelo `scvi-tools/test-scvi` es un modelo de inferencia variacional para datos de secuenciación de ARN de célula única (scRNA-seq), desarrollado por el equipo de scvi-tools. Se trata de una implementación de scVI (single-cell Variational Inference), una arquitectura basada en redes neuronales profundas que aprende una representación latente de baja dimensionalidad a partir de matrices de expresión génica, integrando lotes técnicos y imputando valores de dropout. Este modelo concreto es una versión de prueba entrenada sobre datos sintéticos independientes e idénticamente distribuidos (IID), con el objetivo de validar el flujo de trabajo de scvi-tools en el Hub de HuggingFace.

La relevancia de este modelo radica en que ejemplifica el uso de scVI para tareas de análisis de transcriptómica espacial y de célula única, un campo en rápida expansión. Aunque no está pensado para producción, sirve como referencia para entender cómo se estructuran y evalúan los modelos de scvi-tools, y cómo se pueden reutilizar mediante fine-tuning con el framework Arches. Su tamaño de repositorio es de 0,9 GB, e incluye tanto los pesos del modelo como los datos de entrenamiento completos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | scVI (inferencia variacional con codificador-decodificador profundo) |
| Parametros totales | No disponible (configuración: n_hidden=128, n_latent=10, n_layers=1) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de datos tabulares, no secuencial) |
| Tipos de cuantizacion | No aplica (no es un modelo de lenguaje) |
| Idiomas soportados | No aplica (trabaja con datos de expresión génica) |
| Licencia | cc-by-4.0 |
| Formato de pesos | No especificado (probablemente archivos .pt o .npz, no safetensors) |

## Arquitectura y entrenamiento

scVI es un modelo generativo profundo basado en inferencia variacional. El codificador transforma la matriz de expresión génica (400 células, 100 genes en este caso) en un espacio latente de 10 dimensiones con distribución normal. El decodificador reconstruye la expresión génica utilizando una verosimilitud ZINB (zero-inflated negative binomial), que modela explícitamente los dropouts característicos de los datos de scRNA-seq. La arquitectura incluye una capa oculta de 128 unidades, una capa latente de 10 dimensiones, dropout de 0,1 y dispersión por gen. No se utilizan covariables categóricas ni continuas, y el tamaño de biblioteca se observa directamente.

El entrenamiento se realizó sobre datos sintéticos IID, sin partición de lotes (n_batch=1) ni etiquetas (n_labels=1). No se aplicaron técnicas de ajuste por refuerzo humano (RLHF) ni de optimización por preferencias (DPO). El modelo se subió con los datos de entrenamiento completos, lo que permite reproducir el proceso o realizar fine-tuning con el framework Arches.

## Capacidades

- Aprendizaje de representaciones latentes de baja dimensionalidad para datos de expresión génica.
- Integración de lotes técnicos (batch correction) cuando se entrena con múltiples lotes.
- Imputación de dropouts (valores cero debidos a limitaciones técnicas) mediante la verosimilitud ZINB.
- Generación de datos sintéticos de expresión génica (el modelo puede muestrear nuevas células).
- Análisis de expresión diferencial entre tipos celulares o condiciones.
- Fine-tuning en nuevos datasets mediante el framework Arches, sin necesidad de reentrenar desde cero.
- Visualización de datos de scRNA-seq mediante el espacio latente (por ejemplo, con UMAP o t-SNE).

## Casos de uso

- Análisis exploratorio de datos de scRNA-seq: el modelo permite proyectar células en un espacio latente de 10 dimensiones, facilitando la visualización y el clustering de tipos celulares.
- Integración de datos multi-lote: al entrenar con batches como covariables, scVI corrige efectos de lote y permite comparar células de diferentes experimentos.
- Imputación de genes faltantes: la verosimilitud ZINB estima la expresión real de genes con dropouts, mejorando la calidad de los datos para análisis posteriores.
- Fine-tuning en datos propios: con Arches, se puede adaptar este modelo preentrenado a un nuevo dataset de scRNA-seq, reduciendo el tiempo de entrenamiento y los requisitos computacionales.
- Evaluación de la calidad de modelos generativos: las métricas de coeficiente de variación y expresión diferencial incluidas en la model card sirven para comparar la fidelidad de las reconstrucciones.
- Educación y desarrollo de pipelines: al ser un modelo de prueba con datos sintéticos, es útil para aprender el flujo de trabajo de scvi-tools y depurar integraciones en el Hub.

## Benchmarks y rendimiento

La model card incluye métricas de rendimiento específicas para modelos generativos de scRNA-seq. Estas métricas evalúan la preservación de la variación entre células y genes, así como la calidad de la expresión diferencial. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, etc.) porque el modelo no es de lenguaje.

**Coeficiente de variación celular** (preservación de la variación entre células):

| Metric                  | Training Value | Validation Value |
|-------------------------|----------------|------------------|
| Mean Absolute Error     | 1.02           | 0.97             |
| Pearson Correlation     | -0.03          | 0.22             |
| Spearman Correlation    | -0.02          | 0.18             |
| R² (R-Squared)          | -12.57         | -15.25           |

**Coeficiente de variación génica** (preservación de la variación entre genes):

| Metric                  | Training Value |
|-------------------------|----------------|
| Mean Absolute Error     | 1.07           |
| Pearson Correlation     | -0.10          |
| Spearman Correlation    | 0.01           |
| R² (R-Squared)          | -2.36          |

**Expresión diferencial** (por tipo celular, resumen de 11 grupos):

| Index | gene_f1 | lfc_mae | lfc_pearson | lfc_spearman | roc_auc | pr_auc | n_cells |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | 0.10 | 0.87 | 0.07 | 0.08 | 0.46 | 0.34 | 52.00 |
| 1 | 0.10 | 0.84 | 0.04 | 0.07 | 0.46 | 0.24 | 51.00 |
| 2 | 0.10 | 0.94 | 0.01 | -0.01 | 0.46 | 0.31 | 41.00 |
| 3 | 0.20 | 0.87 | -0.06 | -0.03 | 0.64 | 0.29 | 40.00 |
| 4 | 0.10 | 0.93 | -0.00 | -0.03 | 0.51 | 0.20 | 37.00 |
| 5 | 0.00 | 1.08 | -0.22 | -0.20 | 0.60 | 0.24 | 36.00 |
| 6 | 0.00 | 1.09 | -0.12 | -0.12 | 0.52 | 0.35 | 35.00 |
| 7 | 0.00 | 0.97 | 0.05 | 0.02 | 0.35 | 0.18 | 33.00 |
| 8 | 0.00 | 1.00 | -0.07 | -0.06 | 0.46 | 0.20 | 30.00 |
| 9 | 0.10 | 1.05 | -0.05 | -0.01 | 0.63 | 0.20 | 28.00 |
| 10 | 0.20 | 1.25 | 0.02 | 0.06 | 0.46 | 0.16 | 17.00 |

Los valores de Pearson y R² negativos indican que el modelo no captura bien la variación en los datos sintéticos, lo que es esperable dado que es un modelo de prueba.

## Requisitos de hardware

- Inferencia: al ser un modelo pequeño (0,9 GB, con 128 unidades ocultas y 10 latentes), la inferencia puede ejecutarse en CPU sin problemas. No se requieren GPUs para uso puntual.
- Entrenamiento: aunque el modelo es pequeño, el entrenamiento de scVI típicamente se realiza en GPUs para acelerar la convergencia. Una GPU con al menos 8 GB de VRAM (por ejemplo, NVIDIA RTX 3060 o superior) es suficiente para este tamaño de datos.
- Despliegue: scvi-tools se integra con PyTorch, por lo que puede ejecutarse en cualquier entorno con PyTorch instalado. No hay soporte nativo para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia: para 400 células y 100 genes, la inferencia es prácticamente instantánea (milisegundos). El throughput depende del número de células a procesar; scVI está diseñado para escalar a millones de células con GPU.

## Comparativa con modelos similares

Este modelo es una implementación de scVI, por lo que la comparativa natural es con otros modelos de la misma familia (scANVI, scPoli) o con métodos alternativos de análisis de scRNA-seq (por ejemplo, Seurat o Harmony). Sin embargo, al ser un modelo de prueba con datos sintéticos, no se dispone de datos de rendimiento comparativos publicados.

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scvi-tools/test-scvi | scVI (VAE) | No disponible | No aplica | cc-by-4.0 | HuggingFace |
| scANVI (scvi-tools) | scVI + clasificador semi-supervisado | No disponible | No aplica | cc-by-4.0 | GitHub/HuggingFace |
| Seurat (Satija lab) | Métodos estadísticos clásicos | No aplica | No aplica | GPL-3.0 | CRAN |

No se dispone de benchmarks comparativos directos en la información proporcionada.

## Limitaciones y advertencias

- El modelo fue entrenado exclusivamente con datos sintéticos IID, por lo que no es adecuado para análisis de datos reales sin un fine-tuning previo con datos específicos del dominio.
- Las métricas de rendimiento muestran correlaciones de Pearson negativas o cercanas a cero, lo que indica que el modelo no preserva bien la variación biológica en este conjunto de prueba. No debe utilizarse para conclusiones científicas.
- El repositorio no especifica el formato de pesos (safetensors, .pt, etc.), lo que puede dificultar su integración en pipelines automatizados.
- La licencia cc-by-4.0 permite uso comercial siempre que se atribuya la autoría, pero no se proporcionan garantías sobre la validez de los resultados.
- No hay información sobre sesgos específicos, pero al ser un modelo generativo, podría amplificar artefactos de los datos de entrenamiento si se usa con datos reales.
- El modelo no soporta tareas de lenguaje natural ni visión; está restringido a datos de expresión génica tabulares.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/scvi-tools/test-scvi)
- [Manuscrito original de scVI](https://www.nature.com/articles/s41592-018-0229-2)
- [Manuscrito de scvi-hub](https://www.biorxiv.org/content/10.1101/2024.03.01.582887v2)
- [Guía de usuario de scVI](https://docs.scvi-tools.org/en/stable/user_guide/models/scvi.html)
- [Tutorial de Arches (fine-tuning)](https://docs.scvi-tools.org/en/stable/tutorials/notebooks/scrna/scarches_scvi_tools.html)

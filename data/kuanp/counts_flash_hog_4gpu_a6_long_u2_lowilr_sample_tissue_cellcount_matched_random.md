# KuanP/counts_flash_hog_4gpu_a6_long_u2_lowilr_sample_tissue_cellcount_matched_random

## Resumen

El modelo `counts_flash_hog_4gpu_a6_long_u2_lowilr_sample_tissue_cellcount_matched_random` es un modelo de embeddings celulares (UCE, Universal Cell Embedding) desarrollado por Kuan Pang (KuanP) y entrenado sobre el dataset CELLxGENE (versión 2025-01-30). Su propósito es generar representaciones vectoriales de células individuales a partir de datos de transcriptómica (scRNA-seq), permitiendo comparar perfiles de expresión génica entre distintas condiciones, tejidos o donantes. Este modelo concreto es uno de una serie de runs que comparten la misma receta de entrenamiento y solo difieren en la selección de células de entrenamiento, lo que permite estudiar el impacto de dicha selección en las representaciones aprendidas.

La arquitectura es un transformer de 8 capas con dimensión oculta 512 y 4 cabezas de atención, que procesa secuencias de 2048 tokens correspondientes a genes ordenados por posición cromosómica. El modelo cuenta con 774,7 millones de parámetros totales, de los cuales solo 28,9 millones son entrenables, ya que la tabla de embeddings de genes (5120 dimensiones) está congelada. Se entrenó durante 131 072 pasos con un batch global de 512 y precisión bf16. La selección de datos se realizó mediante un emparejamiento aleatorio del 75 % de las células para igualar el perfil de tejido y recuento celular de otra selección (a6 DataRater), actuando como control de composición y volumen.

La relevancia de este modelo radica en que es un ejemplo de aplicación de transformers a datos biológicos de alta dimensionalidad, donde la representación aprendida puede utilizarse para tareas como anotación de tipos celulares, análisis de expresión diferencial o integración de datasets multi-omicos. Al ser un modelo de investigación con pesos abiertos (aunque con licencia "other"), permite reproducir experimentos y comparar metodologías de selección de datos en el campo de la biología computacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder, 8 capas, d_model=512, 4 cabezas, embeddings de genes congelados de 5120 dimensiones |
| Parametros totales | 774 755 841 (773,7 M) |
| Parametros activos | 28,9 M (entrenables) |
| Longitud de contexto | 2048 tokens (secuencia de genes) |
| Tipos de cuantizacion | no disponible (pesos en bf16 originalmente) |
| Idiomas soportados | no aplica (modelo biologico, no linguistico) |
| Licencia | other (no especificada en detalle) |
| Formato de pesos | safetensors (model.safetensors, ~3 GB) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura UCE (Universal Cell Embedding): un transformer encoder que procesa secuencias de genes ordenados por posición cromosómica, donde cada gen se representa mediante un embedding congelado de 5120 dimensiones. La tabla de embeddings de genes es un parámetro fijo (nn.Parameter congelado) que se incluye en el state dict, lo que explica el tamaño del archivo safetensors (~3 GB) a pesar de que solo 28,9 M de parámetros son entrenables. La secuencia de entrada tiene una longitud fija de 2048 tokens, que incluye tokens especiales (CLS, padding, cromosoma) según la configuración de tokenización descrita en config.yaml.

El entrenamiento se realizó sobre el dataset CELLxGENE 2025-01-30, con una selección específica de células: se excluyó un dataset concreto (ID 53d208b0-2cfd-4366-9866-c3c6114081bc) y se aplicó un muestreo aleatorio que empareja el perfil de tejido y recuento celular (agregado por mediana) con el de la selección a6 DataRater, tomando el 75 % superior según una puntuación de data rating. El dataset resultante contiene 62 634 100 células y 61 888 genes. La receta de entrenamiento incluye 131 072 pasos, batch global de 512, learning rate 5e-05 con schedule coseno y 500 pasos de warmup, weight decay 0.0001 y precisión bf16. No se menciona el uso de RLHF o DPO; es un entrenamiento supervisado de forma autosupervisada (masked language modeling sobre expresión génica, típico en UCE).

Una particularidad importante es que el modelo requiere el uso de la librería `uce_suite` (no disponible públicamente en el momento de redactar esta ficha) y que `from_pretrained` de transformers >=5 puede sobrescribir los pesos entrenados debido a la reinicialización de pesos; el loader `load_uce_checkpoint` fuerza la recarga del state dict para evitar este problema.

## Capacidades

- Generacion de embeddings celulares: produce representaciones vectoriales de células individuales a partir de sus perfiles de expresión génica (scRNA-seq).
- Integracion de datos multi-tejido: entrenado con datos de múltiples tejidos, donantes y assays, lo que permite comparar células entre condiciones.
- Anotacion de tipos celulares: los embeddings pueden usarse como entrada para clasificadores supervisados o métodos no supervisados (clustering) para identificar tipos celulares.
- Analisis de expresion diferencial: las representaciones pueden servir para identificar genes o programas transcripcionales asociados a estados celulares.
- Control experimental: al ser un modelo de control (muestreo aleatorio emparejado por tejido y recuento), es útil para estudios de robustez y sesgo en la selección de datos.
- Tokenizacion especifica: maneja un vocabulario de 145 469 tokens que incluye genes de múltiples especies, con offsets cromosómicos y tokens especiales.

## Casos de uso

- Anotacion automatica de tipos celulares: dado un dataset de scRNA-seq sin etiquetas, se pueden generar embeddings con este modelo y aplicar clustering (por ejemplo, Leiden) para obtener grupos celulares que luego se anotan mediante marcadores conocidos. El modelo es adecuado porque captura relaciones entre genes a lo largo del cromosoma, lo que mejora la separación de tipos celulares.
- Integracion de datos multi-omico y multi-laboratorio: al estar entrenado con CELLxGENE (que incluye múltiples estudios), los embeddings pueden alinear células de distintos experimentos, facilitando análisis conjuntos sin necesidad de corrección por lote adicional.
- Estudio de efectos de la seleccion de datos: este modelo, junto con sus runs hermanos, permite comparar cómo diferentes criterios de selección de células (por ejemplo, emparejamiento por tejido vs. aleatorio) afectan a las representaciones. Es un caso de uso metodológico para la comunidad de biología computacional.
- Deteccion de estados celulares raros: los embeddings pueden resaltar poblaciones celulares poco frecuentes que podrían pasar desapercibidas con métodos lineales, gracias a la capacidad del transformer para modelar interacciones no lineales entre genes.
- Generacion de caracteristicas para modelos downstream: los embeddings de 512 dimensiones (d_model) pueden servir como entrada para modelos de predicción de respuesta a fármacos o de supervivencia, donde se requiere una representación compacta y rica de la célula.
- Validacion de hipotesis biologicas: los investigadores pueden proyectar células de interés (por ejemplo, células tumorales) en el espacio de embeddings y comparar su proximidad con tipos celulares sanos, generando hipótesis sobre plasticidad celular o transiciones de estado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas como accuracy en anotación de tipos celulares, concordancia con etiquetas conocidas ni comparaciones con otros modelos (p. ej., scGPT, Geneformer). El autor no reporta valores de MMLU, HumanEval u otros benchmarks de lenguaje, ya que no es un modelo de lenguaje. Se recomienda consultar el repositorio de `uce_suite` o publicaciones futuras del autor para obtener evaluaciones cuantitativas.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 774,7 M de parámetros en bf16 (2 bytes por parámetro), lo que supone aproximadamente 1,55 GB solo en pesos. Con la tabla de embeddings congelada (que ocupa la mayor parte), la inferencia requiere al menos 3-4 GB de VRAM para el modelo completo, más memoria para las activaciones y el batch. En la práctica, se recomienda una GPU con al menos 8 GB de VRAM para procesar secuencias de 2048 tokens con un batch razonable.
- GPU recomendadas: una NVIDIA RTX 3060 (12 GB) o superior es suficiente para inferencia en lotes pequeños. Para entrenamiento o fine-tuning, se necesitaría una GPU con más memoria (A100 40 GB o H100) dado el tamaño del dataset y el batch global de 512.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo como RTX 3080/3090 o RTX 4090 (24 GB) para inferencia. El modelo no requiere memoria excepcional.
- Opciones de despliegue: el modelo está diseñado para usarse con `uce_suite`, que proporciona `load_uce_checkpoint` y `embed_dataset`. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo. La inferencia se realiza mediante la API de transformers, pero con el loader específico de UCE.
- Latencia y throughput: no disponible. Depende del hardware y del tamaño del batch; al ser un encoder de 8 capas con d512, la inferencia es relativamente rápida comparada con modelos de lenguaje grandes.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros modelos de embeddings celulares (como scGPT, Geneformer, scBERT o el UCE original). La model card no incluye resultados de benchmarks ni comparaciones con alternativas. Se puede indicar que:

- scGPT (disponible en HuggingFace) es un modelo de embeddings celulares basado en transformer con ~100 M de parámetros, entrenado sobre datos de scRNA-seq, con licencia MIT.
- Geneformer (también en HuggingFace) tiene ~30 M de parámetros y se centra en la predicción de redes reguladoras génicas.
- El modelo UCE original (de la Universidad de Stanford) tiene una arquitectura similar pero con más capas y parámetros.

Sin embargo, no hay datos objetivos para comparar rendimiento en tareas comunes. Por tanto, se recomienda al lector evaluar este modelo en su propio caso de uso.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrenó con datos de CELLxGENE, que pueden tener sesgos hacia tejidos o condiciones sobremuestreados. La selección de datos (exclusión de un dataset y emparejamiento por tejido/recuento) puede introducir sesgos no documentados.
- Riesgo de alucinacion: no aplica en el sentido de generación de texto, pero los embeddings pueden reflejar artefactos del entrenamiento (por ejemplo, agrupaciones espurias) si la tokenización o los hiperparámetros no se respetan exactamente. La model card advierte que una tokenización incorrecta produce embeddings "silenciosamente incorrectos".
- Limitaciones de contexto: la longitud de contexto es fija (2048 tokens), lo que limita el análisis a células con hasta 2048 genes después de la tokenización. Células con más genes expresados podrían truncarse o requerir estrategias de agregación.
- Restricciones de licencia: la licencia es "other", no especificada. No se garantiza el uso comercial. Es necesario contactar al autor para aclarar los términos.
- Caveats para producción: el modelo requiere la librería `uce_suite` que no está publicada en el repositorio indicado (el enlace en la model card es un placeholder). Además, el uso de `from_pretrained` con transformers >=5 puede corromper los pesos; se debe usar el loader específico. El repositorio es privado (requiere autenticación), lo que limita su accesibilidad.
- El modelo es un control experimental: no está pensado como modelo de propósito general, sino como parte de un estudio comparativo. Su rendimiento en tareas biológicas concretas debe validarse.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/KuanP/counts_flash_hog_4gpu_a6_long_u2_lowilr_sample_tissue_cellcount_matched_random
- Perfil del autor: https://huggingface.co/KuanP
- Datasets del autor: https://huggingface.co/KuanP/datasets
- Libreria `uce_suite` (no publicada, enlace no disponible)
- Dataset CELLxGENE (referencia general): https://cellxgene.cziscience.com/

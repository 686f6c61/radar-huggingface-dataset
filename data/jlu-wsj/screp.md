# jlu-wsj/scRep

## Resumen

scRep es un modelo de PyTorch diseñado para extraer embeddings de células a partir de datos de transcriptómica de célula única (scRNA-seq). Desarrollado por el usuario jlu-wsj, se distribuye como un paquete independiente en Hugging Face que incluye los pesos del checkpoint, el vocabulario de genes emparejado, la implementación de inferencia y ejemplos ejecutables. El modelo toma como entrada un archivo AnnData (`.h5ad`) y produce una matriz de embeddings de 768 dimensiones, normalizados L2, uno por célula retenida.

El modelo resuelve el problema de representar células individuales en un espacio vectorial denso y semánticamente significativo, lo que facilita tareas posteriores como agrupamiento, visualización o análisis diferencial. Su relevancia actual radica en la creciente necesidad de modelos de representación para datos ómicos de alta dimensionalidad, donde los enfoques tradicionales de reducción de dimensionalidad (PCA, t-SNE) no capturan relaciones no lineales complejas. scRep ofrece una solución basada en aprendizaje profundo, con una arquitectura no especificada en la documentación pública, y dos checkpoints disponibles con identificadores de liberación (2026-06-25/30M y 2026-07-17/3M) que no deben interpretarse como conteos de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (implementación en PyTorch, detalles no publicados) |
| Parametros totales | no disponible (los identificadores "30M" y "3M" son nombres de release, no conteos confirmados) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de embeddings para datos tabulares de expresión génica, no texto) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors, presumiblemente FP32) |
| Idiomas soportados | en (aunque el modelo opera sobre nombres de genes, no sobre lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La documentación pública no detalla la arquitectura interna del modelo. Se sabe que está implementado en PyTorch y que la inferencia se realiza mediante un script Python (`scRep_inference.py`) que carga los pesos desde `model.safetensors` y el vocabulario de genes desde `assets/gene_vocab.json`. El modelo procesa matrices de expresión génica (típicamente `adata.X` o `adata.raw.X`) y genera un embedding de 768 dimensiones por célula, normalizado L2. No se proporciona información sobre el conjunto de datos de entrenamiento, el número de tokens (genes) vistos, ni si se utilizaron técnicas como RLHF o DPO, ya que no es un modelo de lenguaje. La innovación principal reside en el acoplamiento de un vocabulario de genes específico (19,240 genes para el checkpoint de 2026-06-25 y 19,239 para el de 2026-07-17) con la arquitectura de inferencia, lo que permite mapear nombres de genes exactos a las entradas del modelo.

## Capacidades

- Extracción de embeddings de células individuales a partir de datos de scRNA-seq en formato AnnData (`.h5ad`).
- Generación de representaciones vectoriales de 768 dimensiones, normalizadas L2, adecuadas para tareas de agrupamiento, clasificación y visualización.
- Mapeo de genes por nombres exactos contra un vocabulario predefinido, con omisión de células que no tienen genes no nulos coincidentes.
- Soporte para usar `adata.X` o `adata.raw.X` como entrada mediante la opción `--use_raw`.
- Inferencia tanto por línea de comandos (`examples/inference.py`) como interactiva mediante notebook Jupyter (`examples/embedding_example.ipynb`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión o audio, ya que el modelo está especializado en datos ómicos.

## Casos de uso

- Agrupamiento de células (clustering): los embeddings generados por scRep pueden alimentar algoritmos como Leiden o Louvain para identificar tipos celulares o estados transcripcionales en datos de scRNA-seq, gracias a su representación densa y normalizada.
- Visualización de datos de célula única: las embeddings de 768 dimensiones pueden proyectarse a 2D o 3D mediante UMAP o t-SNE para explorar la heterogeneidad celular en muestras complejas.
- Análisis de expresión diferencial entre condiciones: al comparar embeddings de células de diferentes grupos (p. ej., tratados vs. control), se pueden identificar patrones de cambio transcriptómico a nivel de población.
- Integración de múltiples lotes o experimentos: las representaciones invariantes a lote (si el modelo las aprende) permiten armonizar datos de distintos orígenes antes de análisis conjuntos, reduciendo efectos de lote.
- Transferencia de anotaciones celulares: los embeddings pueden usarse como características de entrada para clasificadores supervisados que etiqueten tipos celulares en nuevos datasets, aprovechando la representación aprendida.
- Control de calidad de datos: la detección de células anómalas o de baja calidad puede realizarse examinando la distancia de los embeddings respecto a la población principal, identificando outliers transcriptómicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, y tampoco se proporcionan comparativas con otros modelos de embeddings de célula única. El autor no reporta precisión en tareas de anotación celular ni en reconstrucción de expresión.

## Requisitos de hardware

- Tamaño del repositorio: 1.8 GB, lo que sugiere que los pesos de los checkpoints ocupan aproximadamente 1.5-1.7 GB en FP32 (dos archivos `model.safetensors`).
- VRAM estimada para inferencia: con un modelo de ese tamaño, una GPU con al menos 4 GB de VRAM podría ser suficiente para procesar lotes pequeños (p. ej., 32-64 células), pero no hay confirmación oficial.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (p. ej., NVIDIA RTX 3060, 4090, A100) o incluso CPU para datasets pequeños, dado que la inferencia es por lotes y no requiere generación autoregresiva.
- Opciones de despliegue: el modelo se ejecuta mediante el script `inference.py` incluido, que carga los pesos con PyTorch. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependerán del tamaño del dataset y del hardware; para un lote de 1000 células, la inferencia podría completarse en segundos en una GPU moderna, pero no hay datos publicados.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Existen otros modelos de embeddings de célula única como scVI, Geneformer o scBERT, pero no se mencionan en la model card ni en los resultados de búsqueda web relacionados con este repositorio. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está diseñado para investigación y no debe utilizarse como base única para decisiones médicas; la model card lo advierte explícitamente.
- Los embeddings son salidas de investigación, no mediciones clínicas ni predicciones diagnósticas.
- El rendimiento puede verse afectado por convenciones de nombres de genes, preprocesamiento y sesgos de lote o demográficos; se recomienda validar en cada dataset downstream.
- El vocabulario de genes es fijo (19,240 o 19,239 genes) y solo se mapean genes con nombres exactos; genes no presentes en el vocabulario se ignoran, lo que puede perder información en datasets con anotaciones alternativas.
- No se especifica la arquitectura interna ni los datos de entrenamiento, lo que limita la reproducibilidad y la comprensión de sus capacidades.
- La licencia Apache 2.0 permite uso comercial, pero no hay garantías de soporte ni mantenimiento por parte del autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jlu-wsj/scRep
- No se encontraron otros enlaces relevantes (papers, blogs, repos) en la búsqueda web; los resultados de SCREP corresponden a proyectos homónimos no relacionados con este modelo.

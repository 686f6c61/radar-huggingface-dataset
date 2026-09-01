# jiangshuan6/CerebralJEPA

## Resumen

CerebralJEPA es un modelo de representación para resonancia magnética estructural cerebral (sMRI) desarrollado por jiangshuan6. Convierte un volumen 3D en formato NIfTI en embeddings compactos que pueden utilizarse en tareas de investigación como análisis de cohortes, clasificación de enfermedades, predicción de edad, agrupamiento, recuperación o como características para modelos específicos. El modelo emplea un encoder 3D SwinUNETR y sigue los principios de la arquitectura JEPA (Joint-Embedding Predictive Architecture), que aprende representaciones mediante consistencia entre vistas globales y locales.

El modelo se distribuye con cuatro checkpoints preentrenados (m1, m2, m3 y m4) que ofrecen diferentes configuraciones de representación. El checkpoint por defecto es m4, que produce embeddings de 768 dimensiones en su etapa 4, además de etapas intermedias de 48, 96 y 192 dimensiones. El repositorio incluye un pipeline de inferencia completo con preprocesamiento de imágenes (orientación RAS, espaciado isotrópico, recorte centrado, normalización robusta) y soporte para extracción de mapas de características y embeddings proyectados. La licencia es Apache 2.0, lo que permite uso comercial y modificación.

La relevancia de CerebralJEPA radica en su enfoque específico para imágenes médicas 3D, un dominio donde los modelos de representación generalistas suelen fallar. Al estar diseñado para sMRI, ofrece una solución lista para usar en flujos de trabajo de neuroimagen, con un tamaño de repositorio de 0.7 GB que lo hace viable en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | 3D SwinUNETR (encoder) con preprocesamiento específico para sMRI |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada 3D, no texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | en (aunque el modelo procesa imágenes, la documentación está en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

CerebralJEPA utiliza un encoder 3D SwinUNETR, una arquitectura basada en Swin Transformer adaptada a volúmenes tridimensionales. El modelo sigue el paradigma JEPA, que aprende representaciones mediante la predicción de representaciones de vistas objetivo a partir de vistas de contexto, sin necesidad de etiquetas. En este caso, el entrenamiento se basa en consistencia local/global multi-escala: las etapas 1 y 2 se entrenan con consistencia local, mientras que las etapas 3 y 4 usan consistencia global. El checkpoint m4 es el más completo, ya que expone las cuatro etapas de representación.

El preprocesamiento de inferencia es un componente clave: estandariza el volumen con orientación RAS, espaciado isotrópico, estimación de primer plano, recorte de intensidad robusto (percentiles 0.5 y 99.5), normalización enmascarada y recorte/relleno centrado en el primer plano. Este pipeline garantiza que las imágenes de entrada sean comparables independientemente de su origen. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens (vóxeles) ni el uso de técnicas como RLHF o DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Extracción de embeddings de 768 dimensiones (etapa 4) para volúmenes sMRI completos.
- Representaciones multi-escala: etapas 1 (48 dim), 2 (96 dim), 3 (192 dim) y 4 (768 dim) disponibles con el checkpoint m4.
- Mapas de características de Swin Transformer antes de los bloques de refinamiento convolucional 3D.
- Embeddings proyectados de 256 dimensiones mediante un MLP, compatibles con el objetivo de entrenamiento original.
- Preprocesador de segmentación (intensity-only) que preserva la geometría de la imagen, útil para flujos de segmentación posteriores.
- Soporte para entrada de imágenes NIfTI (`.nii` y `.nii.gz`).
- Integración con la librería Transformers de HuggingFace mediante un pipeline de extracción de características.

## Casos de uso

- Análisis de cohortes en neuroimagen: el modelo genera embeddings de 768 dimensiones para cada sujeto, permitiendo agrupar poblaciones por similitud estructural y detectar subgrupos en estudios longitudinales o transversales.
- Clasificación de enfermedades neurodegenerativas: los embeddings pueden alimentar clasificadores lineales o no lineales para distinguir entre controles sanos y pacientes con Alzheimer, Parkinson u otras patologías, aprovechando la representación compacta y normalizada.
- Predicción de edad cerebral: a partir del embedding de etapa 4, se puede entrenar un regresor para estimar la edad biológica del cerebro, un biomarcador útil en estudios de envejecimiento.
- Recuperación de imágenes por similitud: dado un volumen de consulta, se calcula su embedding y se buscan los sujetos más cercanos en un espacio de 768 dimensiones, facilitando la búsqueda en grandes bases de datos de MRI.
- Extracción de características para modelos específicos: los embeddings de etapas intermedias (48, 96, 192) pueden usarse como entrada para redes neuronales más pequeñas en tareas de segmentación o detección de anomalías, reduciendo la carga computacional.
- Preprocesamiento para segmentación: el preprocesador de segmentación (que preserva la geometría) permite normalizar intensidades sin alterar la estructura espacial, listo para integrarse en pipelines de segmentación con MONAI u otras herramientas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card no incluye métricas de rendimiento en tareas como clasificación, regresión o segmentación. Tampoco se han encontrado evaluaciones externas en la búsqueda web. Por tanto, no es posible comparar cuantitativamente con otros modelos.

## Requisitos de hardware

- Tamaño del repositorio: 0.7 GB, lo que sugiere un modelo de aproximadamente 200-400 millones de parámetros (estimación no confirmada).
- VRAM estimada para inferencia: con pesos en FP32, el modelo podría requerir entre 1 y 2 GB de VRAM; con cuantización (no publicada) podría reducirse. No hay datos oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 2060, RTX 3050) debería ser suficiente para inferencia en lote pequeño. Para procesamiento de múltiples volúmenes, se recomienda una GPU con 8 GB o más (RTX 3070, RTX 4080, A100).
- Compatibilidad con GPU de consumo: sí, dado el tamaño moderado del modelo.
- Opciones de despliegue: el modelo se usa mediante la librería Transformers de HuggingFace, con un pipeline Python (`CerebralJEPAPipeline`). No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependerá del tamaño del volumen de entrada (por defecto, recorte a 160x160x160) y de la GPU utilizada.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en el ámbito de representación de sMRI con arquitectura JEPA. Brain-JEPA (arXiv:2409.19407) es un modelo de dinámica cerebral (fMRI) con objetivos similares, pero no es equivalente: CerebralJEPA se centra en MRI estructural, mientras que Brain-JEPA trabaja con series temporales de actividad cerebral. Otros modelos como SLANT-27 o DeepBrainNet se centran en segmentación o clasificación, no en representaciones genéricas. Por tanto, la comparativa directa no está disponible.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para imágenes de resonancia magnética estructural cerebral (sMRI). No es aplicable a otros tipos de imagen médica (CT, PET, fMRI) sin reentrenamiento.
- Requiere un preprocesamiento específico (orientación RAS, espaciado isotrópico, recorte centrado) que debe aplicarse correctamente para obtener resultados válidos. Un uso incorrecto puede degradar la calidad de los embeddings.
- No es un modelo generativo: no puede sintetizar imágenes ni completar volúmenes. Solo produce representaciones.
- No se han publicado datos sobre sesgos demográficos o clínicos. El entrenamiento podría estar sesgado hacia ciertas poblaciones si el dataset de entrenamiento no fue diverso, aunque no hay información al respecto.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que los datos de entrada cumplan con las regulaciones de privacidad médica (p. ej., HIPAA, GDPR) al desplegar el modelo en producción.
- No hay información sobre la procedencia de los datos de entrenamiento ni sobre el número de sujetos utilizados, lo que limita la reproducibilidad y la evaluación de generalización.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jiangshuan6/CerebralJEPA
- Paper de Brain-JEPA (referencia JEPA en neuroimagen, no es el mismo modelo): https://arxiv.org/abs/2409.19407
- Colección Awesome JEPA (recursos sobre arquitectura JEPA): https://github.com/AI-in-Transportation-Lab/awesome-jepa

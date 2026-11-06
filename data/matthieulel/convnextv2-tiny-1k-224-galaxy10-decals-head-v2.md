# matthieulel/convnextv2-tiny-1k-224-galaxy10-decals-head-v2

## Resumen

`convnextv2-tiny-1k-224-galaxy10-decals-head-v2` es un clasificador de imágenes especializado en morfología de galaxias, desarrollado por el usuario de Hugging Face matthieulel. El modelo parte del checkpoint preentrenado `facebook/convnextv2-tiny-1k-224` (ConvNeXt V2, una red convolucional pura de tipo transformerizado) y le añade una cabeza lineal de 10 salidas entrenada sobre el dataset Galaxy10 DECaLS. Forma parte de la colección Vision Foundation Models Benchmark, que evalúa 40 backbones preentrenados bajo dos regímenes de adaptación distintos.

La relevancia del modelo no reside en su rendimiento absoluto, sino en su papel como punto de referencia reproducible dentro de un estudio sistemático sobre el uso de modelos fundacionales de visión en astronomía, asociado al artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026). El régimen de entrenamiento es deliberadamente restrictivo: solo se entrena la cabeza de clasificación, con el backbone completamente congelado, incluidas las estadísticas de sus capas de normalización.

Con 27,87 millones de parámetros y un peso de repositorio de 0,1 GB, es un modelo muy ligero, apto para inferencia en CPU o en GPU de consumo. Su tarea es la clasificación de imágenes astronómicas en 10 clases morfológicas, con una precisión declarada del 45,83 % en el conjunto de test reservado de Galaxy10 DECaLS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt V2 (red convolucional pura con bloques tipo transformer y GRN), backbone `facebook/convnextv2-tiny-1k-224` congelado + cabeza lineal de 10 clases |
| Parametros totales | 27.874.186 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 224x224 px) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser un modelo de 27,9 M de parámetros, la cuantización no es necesaria en la práctica) |
| Idiomas soportados | no disponible (modelo de visión, sin capacidades de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El backbone es ConvNeXt V2 Tiny, una arquitectura convolucional moderna que incorpora elementos propios de los transformers (convoluciones depthwise de 7x7, normalización LayerNorm y capas de activación GELU) junto con la capa Global Response Normalization (GRN) introducida en ConvNeXt V2. El modelo preentrenado original se entrenó en ImageNet-1k a resolución 224x224. En este checkpoint, el backbone se mantiene congelado, incluidas las estadísticas de sus capas de normalización, y solo se entrena una cabeza lineal de 10 salidas que mapea el vector de características a las 10 clases morfológicas de Galaxy10 DECaLS.

El entrenamiento se realizó bajo un protocolo fijo e idéntico para los 40 backbones del benchmark: AdamW con betas 0,9/0,999, eps 1e-8, weight decay 0,1 y recorte de gradiente 1,0; tasa de aprendizaje 1e-4 con schedule lineal y 10 % de warm-up; lotes de 32 imágenes con acumulación de gradiente en 8 pasos (lote efectivo de 256); 30 épocas en precisión simple (fp32, TF32 desactivado) sobre una única GPU. La aumentación consistió en recorte redimensionado aleatorio a la resolución de entrada y volteo horizontal aleatorio; la evaluación usa redimensionado y recorte central a 224x224 px con la normalización del procesador de imágenes del checkpoint. El dataset Galaxy10 DECaLS contiene 17.736 imágenes, divididas en 14.188 de entrenamiento, 1.774 de validación y 1.774 de test (el split público de test actúa como conjunto reservado). La época seleccionada es la de mínima pérdida de validación (época 30 de 30). El software empleado fue PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1 y torchvision 0.18.0.

## Capacidades

- Clasificación de imágenes astronómicas en 10 clases morfológicas de galaxias del dataset Galaxy10 DECaLS.
- Extracción de características visuales mediante el backbone ConvNeXt V2 Tiny congelado.
- Inferencia sobre imágenes de entrada de 224x224 px con la normalización estándar del procesador de imágenes de ConvNeXt V2.
- Funcionamiento en CPU y GPU de consumo gracias a su tamaño reducido (27,9 M de parámetros).
- No dispone de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, capacidades de agente ni multilingüismo: es exclusivamente un clasificador de imágenes de dominio acotado.

## Casos de uso

- Clasificación morfológica preliminar de galaxias en pipelines astronómicos: el modelo asigna una de las 10 clases de Galaxy10 DECaLS a recortes de 224x224 px, útil como primer filtro o etiquetado asistido en catálogos de imágenes de DECaLS.
- Baseline reproducible para investigación en adaptación de modelos fundacionales: al ser una de las 80 configuraciones del benchmark, sirve como referencia exacta (con protocolo, semillas y métricas por época publicadas) para comparar nuevas estrategias de fine-tuning.
- Prototipado rápido en entornos sin GPU dedicada: con 27,9 M de parámetros y pesos safetensors de 0,1 GB, se puede ejecutar en CPU para validar ideas antes de escalar a modelos mayores.
- Etiquetado asistido en proyectos de ciencia ciudadana: permite preclasificar imágenes y priorizar la revisión humana en campañas de clasificación morfológica.
- Docencia y experimentación en visión por computador aplicada a astronomía: su tamaño y su receta de entrenamiento documentada lo hacen adecuado para reproducir experimentos completos en una sola GPU.
- Integración en servicios de inferencia ligeros: compatible con transformers y endpoints, puede desplegarse como microservicio de clasificación de imágenes sin requisitos de hardware elevados.
- Evaluación comparativa de backbones congelados: permite medir la calidad de las representaciones de ConvNeXt V2 Tiny frente a otros 39 backbones bajo un régimen head-only idéntico.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (model-index), no verificados de forma independiente:

| Metrica | Valor | Conjunto |
|---|---|---|
| Accuracy | 45,83 % | Galaxy10 DECaLS, test (1.774 imágenes), semilla 42, época 30 |
| Weighted F1 | 42,29 % | Galaxy10 DECaLS, test (1.774 imágenes), semilla 42, época 30 |
| Accuracy (media ± desv. típica, 3 semillas) | 45,73 % ± 0,38 | Galaxy10 DECaLS, test |
| Weighted F1 (media ± desv. típica, 3 semillas) | 42,27 % ± 0,40 | Galaxy10 DECaLS, test |

El autor no publica comparaciones con otros modelos en la información disponible. La evolución por época muestra una mejora sostenida desde el 14,66 % de accuracy en la época 1 hasta el 45,83 % en la época 30, con la pérdida de validación descendiendo de 2,2598 a 1,5253.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para lotes pequeños; el modelo pesa 27,9 M de parámetros (aproximadamente 111 MB en fp32).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona sin problemas en RTX 3060, RTX 4090, A100 o H100, aunque el modelo no aprovecha el potencial de las GPU de gama alta.
- Cabe en cualquier GPU de consumo e incluso en CPU; la inferencia en CPU es viable para volúmenes moderados de imágenes.
- Opciones de despliegue: transformers (AutoModelForImageClassification), endpoints compatibles de Hugging Face; el autor no documenta soporte específico para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de resultados de otros modelos sobre Galaxy10 DECaLS en la información proporcionada más allá de la referencia genérica a los 40 backbones del benchmark, por lo que no es posible construir una comparativa numérica fiable.

| Modelo | Parametros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ConvNeXt V2 Tiny head-only) | 27,9 M | Imagen 224x224 | Clasificación Galaxy10 DECaLS (10 clases) | Apache 2.0 | Hugging Face |
| `facebook/convnextv2-tiny-1k-224` (base) | 27,9 M (aprox.) | Imagen 224x224 | Clasificación ImageNet-1k (1.000 clases) | Apache 2.0 | Hugging Face |
| Otros backbones de la colección Vision Foundation Models Benchmark | no disponible | Imagen | Clasificación Galaxy10 DECaLS | no disponible | Hugging Face (colección del autor) |

## Limitaciones y advertencias

- Rendimiento moderado: una accuracy del 45,83 % en 10 clases implica una tasa de error superior al 50 %; no es adecuado para clasificación morfológica automática de alta fiabilidad sin revisión humana.
- Régimen head-only: el backbone está congelado y no se ha adaptado a las particularidades de las imágenes astronómicas; un fine-tuning completo o parcial podría mejorar sustancialmente los resultados.
- Dominio muy restringido: solo reconoce las 10 clases de Galaxy10 DECaLS y solo con el preprocesado de 224x224 px documentado; su uso fuera de ese dominio no está validado.
- Sesgos del dataset: los sesgos de selección y etiquetado de Galaxy10 DECaLS se heredan directamente; el autor no documenta un análisis específico de sesgos.
- Métricas no verificadas: los resultados del model-index están marcados como `verified: false` y proceden del propio autor.
- Sin capacidades de texto ni multilingües: no debe evaluarse como modelo de lenguaje.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción ni sobre la idoneidad científica de las predicciones.
- Riesgo de alucinación en sentido figurado: al ser un clasificador, siempre asigna una de las 10 clases, incluso ante imágenes fuera de distribución, sin mecanismo de rechazo documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/convnextv2-tiny-1k-224-galaxy10-decals-head-v2
- Modelo base: https://huggingface.co/facebook/convnextv2-tiny-1k-224
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de ejecuciones del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo de referencia: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada, 2026 (citación pendiente de publicación; no se proporciona enlace directo).

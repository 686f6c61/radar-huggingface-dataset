# matthieulel/vit-huge-patch14-224-in21k-galaxy10-decals-head-v2

## Resumen

`vit-huge-patch14-224-in21k-galaxy10-decals-head-v2` es un clasificador de imágenes para morfología de galaxias, desarrollado por el usuario de HuggingFace `matthieulel` como parte de una colección de 80 configuraciones (40 backbones preentrenados x dos regímenes de adaptación) denominada Vision Foundation Models Benchmark. El modelo adapta el backbone `google/vit-huge-patch14-224-in21k` al dataset Galaxy10 DECaLS (10 clases de morfología galáctica) mediante un régimen de fine-tuning de solo cabeza: el backbone permanece congelado, incluidas las estadísticas de sus capas de normalización, y únicamente se entrena una capa lineal de 10 salidas.

La relevancia del modelo es metodológica más que de rendimiento absoluto: forma parte de un estudio sistemático, en revisión para la revista *Astronomy and Computing* (2026), que compara 40 backbones de visión bajo un protocolo de entrenamiento idéntico para evaluar hasta qué punto los modelos fundacionales de visión genéricos transfieren a datos astronómicos. El checkpoint alcanza un 45,15 % de accuracy y un 39,94 % de F1 ponderado en el conjunto de test retenido de 1.774 imágenes, con una media de 44,59 ± 0,50 % de accuracy sobre tres semillas.

Arquitectónicamente es un Vision Transformer (ViT-H/14) con 630,8 millones de parámetros totales, parches de 14x14 píxeles y resolución de entrada de 224x224. El repositorio ocupa 2,5 GB y se distribuye en formato safetensors con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-H/14), transformer encoder con atención global |
| Parametros totales | 630.777.610 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 224x224 px, parches de 14x14) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; al ser fp32 safetensors es convertible a fp16/bf16/int8 mediante herramientas estándar) |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | image-classification |
| Dataset de entrenamiento | Galaxy10 DECaLS (10 clases, 17.736 imágenes) |
| Resolucion de entrada | 224x224 px |
| Tamano del repositorio | 2,5 GB |
| Modelo base | google/vit-huge-patch14-224-in21k |

## Arquitectura y entrenamiento

El modelo es un ViT-H/14 estándar: un transformer encoder con atención global sobre parches de 14x14 píxeles, preentrenado por Google en ImageNet-21k y adaptado aquí a clasificación de morfología galáctica. La adaptación es de solo cabeza: el backbone se congela por completo (incluidas las estadísticas de las capas de normalización) y se entrena una única capa lineal de 10 salidas. El repositorio contiene el modelo completo, con los pesos del backbone original y la cabeza entrenada.

El protocolo de entrenamiento, idéntico para los 40 backbones del benchmark, usa AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 1e-4 con schedule lineal y 10 % de warm-up, batches de 32 imágenes con acumulación de gradiente en 8 pasos (batch efectivo 256), 30 épocas, precisión fp32 con TF32 desactivado y una sola GPU. La aumentación consiste en random resized crop a la resolución de entrada y flip horizontal aleatorio; la evaluación usa resize y center crop a 224x224 con la normalización del image processor del checkpoint. Los datos se dividen de forma estratificada por clase: 14.188 imágenes de entrenamiento, 1.774 de validación y 1.774 de test retenido (el split público de test). La época seleccionada es la de mínima pérdida de validación (época 30). Software: PyTorch 2.3.0, transformers 4.37.2, datasets 2.19.1, torchvision 0.18.0. No se documenta RLHF, DPO ni ninguna innovación de decodificación (no aplica a un clasificador).

## Capacidades

- Clasificación de imágenes en 10 clases de morfología galáctica del dataset Galaxy10 DECaLS.
- Extracción de características visuales de propósito general heredadas del backbone ViT-H/14 preentrenado en ImageNet-21k (utilizable con la cabeza eliminada).
- Inferencia sobre imágenes de 224x224 px con el preprocesado estándar (resize, center crop, normalización del image processor).
- Integración directa con `transformers` mediante `AutoModelForImageClassification` y `AutoImageProcessor`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni procesamiento de lenguaje natural.
- No dispone de modo thinking, visión generativa, audio ni ninguna capacidad multimodal más allá de la clasificación de imagen.

## Casos de uso

- Clasificación morfológica automatizada en pipelines astronómicos: el modelo puede etiquetar recortes de galaxias procedentes de DECaLS en las 10 clases del esquema Galaxy10, con un coste de inferencia bajo (630 M de parámetros, una sola pasada por imagen) y sin necesidad de GPU de gama alta.
- Baseline en estudios de transferencia de modelos fundacionales: sirve como referencia reproducible del régimen head-only sobre ViT-H/14 para comparar con otros backbones del mismo benchmark (40 backbones x 2 regímenes), gracias al protocolo y a las métricas por época publicadas.
- Filtrado y triaje de catálogos de imágenes: dado su throughput en GPU consumer, puede procesar lotes grandes de recortes para preclasificar morfologías antes de una revisión humana o de un modelo más costoso.
- Docencia e investigación en astronomía computacional: el checkpoint completo (backbone congelado + cabeza lineal) permite estudiar el efecto del fine-tuning de solo cabeza sin reentrenar el backbone, con un script de uso mínimo en la model card.
- Prototipado rápido de clasificadores astronómicos: al ser un modelo pequeño y con licencia Apache 2.0, se puede desplegar en un endpoint o en local para validar una idea de producto o un experimento antes de invertir en un fine-tuning completo.
- Verificación de integridad y reproducibilidad: la model card documenta una comprobación de integridad (predicciones idénticas en el 100 % de las primeras 96 imágenes de test, diferencia máxima de logits de 3,58e-07), lo que lo hace adecuado como referencia en auditorías de reproducibilidad.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente) sobre el split de test de Galaxy10 DECaLS (1.774 imágenes):

| Metrica | Valor |
|---|---|
| Accuracy (semilla 42, época 30 de 30) | 45,15 % |
| F1 ponderado (semilla 42, época 30 de 30) | 39,94 % |
| Accuracy media +/- desviación típica (semillas 42, 1, 2) | 44,59 +/- 0,50 % |
| F1 ponderado medio +/- desviación típica (semillas 42, 1, 2) | 39,11 +/- 0,73 % |

Evolución de la accuracy de test en la semilla 42 (selección de época por mínima pérdida de validación): época 1, 14,83 %; época 10, 40,42 %; época 20, 43,63 %; época 30 (seleccionada), 45,15 %. No se han publicado en la información disponible resultados comparativos con otros modelos del benchmark ni métricas por clase.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,5 GB solo para pesos, más activaciones; en la práctica cabe holgadamente en GPUs con 8 GB o más.
- En fp16/bf16 (conversión manual, no documentada por el autor): aproximadamente 1,3 GB de pesos, viable en GPUs consumer de 4-6 GB.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 8 GB (RTX 3060, RTX 4060, RTX 4090, A100, H100). Para lotes grandes, A100/H100 reducen el tiempo por imagen.
- Cabe en GPU consumer: sí, en RTX 3060/4060/4090 y equivalentes; también es viable en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` (PyTorch) de forma nativa; exportación a ONNX o TorchScript para serving; no se documenta soporte específico de vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente a este clasificador).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de los otros backbones del mismo benchmark ni de modelos comparables con métricas publicadas sobre Galaxy10 DECaLS. La comparación cuantitativa con alternativas (por ejemplo, otros ViT o CNN adaptadas al mismo dataset) queda pendiente de los datos del paper y del dataset `vision-foundation-models-benchmark-runs`.

| Modelo | Parametros | Contexto/entrada | Accuracy en Galaxy10 DECaLS | Licencia |
|---|---|---|---|---|
| Este modelo (ViT-H/14, head-only) | 630,8 M | 224x224 px | 45,15 % (test, semilla 42) | Apache 2.0 |
| Otros backbones del benchmark | no disponible | no disponible | no disponible | no disponible |
| Alternativas externas | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Rendimiento moderado: 45,15 % de accuracy en 10 clases implica una tasa de error superior al 50 %; no es adecuado para clasificación morfológica de precisión sin revisión humana.
- El régimen head-only congela el backbone: el modelo no se ha adaptado en profundidad a las particularidades de las imágenes astronómicas, lo que limita el techo de rendimiento frente a un fine-tuning completo.
- Métricas declaradas por el autor y no verificadas de forma independiente (`verified: false` en el model-index).
- El conjunto de test tiene solo 1.774 imágenes; la variabilidad entre semillas (±0,50 % de accuracy) es pequeña, pero el tamaño muestral limita la robustez de las estimaciones.
- Riesgo de sesgo de clase y de dominio: el dataset Galaxy10 DECaLS tiene una distribución de morfologías concreta y las imágenes proceden de un único sondeo; el modelo puede degradarse en datos de otros instrumentos o rangos de redshift.
- No apto para usos fuera de clasificación de imagen: no procesa texto, no soporta agentes ni tool calling.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene conservar la atribución y revisar las condiciones del dataset Galaxy10 DECaLS para usos derivados.
- Documentación incompleta en algunos aspectos (cuantizaciones, latencia, métricas por clase) que dificulta la planificación de despliegues en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/matthieulel/vit-huge-patch14-224-in21k-galaxy10-decals-head-v2
- Modelo base: https://huggingface.co/google/vit-huge-patch14-224-in21k
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de ejecuciones del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Paper: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada 2026 (citación pendiente de publicación; no se proporciona enlace directo)

# matthieulel/vgg16-galaxy10-decals-head-v2

## Resumen

vgg16-galaxy10-decals-head-v2 es un clasificador de imágenes para morfología galáctica construido a partir de la red convolucional VGG16 de torchvision (pesos ImageNet-1k `IMAGENET1K_V1`) y adaptado al conjunto de datos Galaxy10 DECaLS, que distingue diez clases morfológicas. Lo desarrolla matthieulel como parte de una colección de 80 configuraciones (40 backbones preentrenados por dos regímenes de adaptación) dentro del proyecto Vision Foundation Models Benchmark, asociado al artículo *When foundation models meet astronomical data* (Astronomy and Computing, versión revisada, 2026).

El modelo no es un transformer generativo ni un modelo de lenguaje: es un clasificador puro de 134.301.514 parámetros con entrada fija de 224x224 píxeles y una única capa lineal de salida con diez logits. Su interés es metodológico y de referencia: sirve como línea base convolucional clásica frente a los backbones modernos (ViT, DINOv2, CLIP, ConvNeXt) evaluados en el mismo protocolo, y permite reproducir exactamente las condiciones del benchmark.

La adaptación se ha hecho con *head-only fine-tuning*: el backbone queda completamente congelado, incluidas las estadísticas de sus capas de normalización, y solo se entrena la cabeza lineal. El checkpoint alcanza un 41,71 % de accuracy y un 39,48 % de F1 ponderado en el conjunto de test reservado de 1.774 imágenes, con una media de 41,85 ± 0,18 % de accuracy sobre tres semillas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN VGG16 (torchvision, pesos ImageNet-1k `IMAGENET1K_V1`) con cabeza lineal de 10 salidas |
| Parametros totales | 134.301.514 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 224x224 px) |
| Tipos de cuantizacion | no disponible (el autor solo publica pesos en fp32; no se documentan variantes GGUF, INT8 ni FP16) |
| Idiomas soportados | no aplica (clasificación de imágenes) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (`model.safetensors`), cargable con `safetensors.torch.load_file` sobre un `torchvision.models.vgg16` |
| Tarea | image-classification (10 clases de morfología galáctica) |
| Resolución de entrada | 224x224 px, normalización ImageNet ([0.485, 0.456, 0.406] / [0.229, 0.224, 0.225]) |
| Dataset de entrenamiento | Galaxy10 DECaLS (17.736 imágenes; 14.188 train, 1.774 validación, 1.774 test) |
| Tamaño del repositorio | 0,5 GB |
| Librería | PyTorch 2.3.0, torchvision 0.18.0 |

## Arquitectura y entrenamiento

La arquitectura es VGG16 estándar: trece capas convolucionales 3x3 agrupadas en cinco bloques con max-pooling, seguidas de un clasificador denso de tres capas (4.096-4.096-1.000 en el modelo original). Aquí la última capa se sustituye por una capa lineal de 4.096 a 10 salidas. El backbone conserva los pesos de ImageNet-1k y queda congelado durante todo el entrenamiento, incluidas las estadísticas de `BatchNorm`, de modo que el modelo es determinista en inferencia y no requiere recalibración de las capas de normalización.

El régimen es *head-only fine-tuning*: solo se optimizan los 40.970 parámetros de la cabeza lineal. El recetario, idéntico para los 40 backbones del benchmark, usa AdamW (betas 0,9/0,999, eps 1e-8, weight decay 0,1, gradient clipping 1,0), learning rate 1e-4 con schedule lineal y 10 % de warm-up, batches de 32 imágenes con acumulación en 8 pasos (batch efectivo 256), 30 épocas y precisión fp32 con TF32 desactivado, sobre una sola GPU. El aumento de datos se limita a random resized crop a la resolución de entrada y flip horizontal aleatorio; la evaluación usa resize y center crop a 224x224. La época seleccionada es la de mínima pérdida de validación (época 30 en la semilla 42).

## Capacidades

- Clasificación de imágenes en 10 clases de morfología galáctica del esquema Galaxy10 DECaLS (espirales con y sin barra, elípticas, lenticulares, fusiones, irregularidades, etc.).
- Extracción de logits por clase, utilizables para umbrales de confianza o análisis de calibración.
- Backbone congelado reutilizable como extractor de características de imagen de propósito general (aunque no se documenta oficialmente esa variante).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües, de audio ni de vídeo.
- No dispone de modo *thinking* ni de decodificación especulativa: es un clasificador feed-forward de una sola pasada.

## Casos de uso

- **Clasificación morfológica automatizada en pipelines astronómicos**: el modelo recibe recortes de 224x224 px de imágenes DECaLS y devuelve 10 logits, lo que permite etiquetar catálogos de galaxias de forma masiva sin intervención humana, con un coste computacional bajo (134 M de parámetros, una sola pasada).
- **Línea base convolucional en estudios comparativos**: al compartir recetario exacto con los otros 39 backbones del Vision Foundation Models Benchmark, sirve para medir cuánto aportan los modelos fundacionales modernos frente a una CNN clásica bajo idénticas condiciones de adaptación.
- **Filtrado previo y triaje de candidatos**: usar la confianza de la predicción para separar galaxias de morfología clara (alta confianza) de las ambiguas, que se derivan a inspección visual o a un modelo mayor.
- **Reproducción de experimentos docentes**: el código de carga es de pocas líneas y el checkpoint es pequeño (0,5 GB), lo que lo hace adecuado para prácticas de fine-tuning y evaluación en cursos de aprendizaje profundo aplicado a astronomía.
- **Prototipado rápido en CPU**: con 134 M de parámetros y entrada 224x224, la inferencia por lotes es viable en CPU para volúmenes moderados, sin necesidad de GPU dedicada.
- **Validación de pipelines de datos**: la comprobación de integridad publicada (predicciones idénticas al 100 % en las primeras 96 imágenes de test, diferencia máxima de logits de 1,82e-05) permite usar el modelo como test de regresión al modificar el preprocesado de imágenes.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre el split de test reservado de Galaxy10 DECaLS con 1.774 imágenes:

| Metrica | Semilla 42 (epoca 30) | Media ± s.d. (semillas 42, 1, 2) |
|---|---|---|
| Accuracy (%) | 41,71 | 41,85 ± 0,18 |
| F1 ponderado (%) | 39,48 | 39,49 ± 0,10 |

Evolución seleccionada del entrenamiento (semilla 42): la accuracy de test pasa de 22,38 % en la época 1 a 41,71 % en la época 30, con una pérdida de validación que desciende de 2,1930 a 1,6144. No se han publicado en la información disponible resultados comparativos con otros backbones del mismo benchmark ni métricas por clase.

## Requisitos de hardware

- **VRAM estimada en fp32**: aproximadamente 0,54 GB solo para pesos (134,3 M de parámetros x 4 bytes); con activaciones y batches pequeños, menos de 2 GB en total.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM; el autor entrenó con una sola GPU sin especificar modelo. Para inferencia masiva, A100 o H100 aportan throughput, pero no son necesarias.
- **GPU de consumo**: cabe holgadamente en GTX 1660, RTX 3060, RTX 4060, RTX 4090 y similares; también es viable en CPU para lotes moderados.
- **Opciones de despliegue**: PyTorch nativo con `torchvision` y `safetensors`; exportable a TorchScript u ONNX para servir con ONNX Runtime o Triton. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un clasificador de imágenes.
- **Latencia y throughput**: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Accuracy en Galaxy10 DECaLS | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vgg16-galaxy10-decals-head-v2 | 134,3 M | 224x224 px | 41,71 % (test, semilla 42) | BSD-3-Clause | Hugging Face |
| Otros backbones del Vision Foundation Models Benchmark | no disponible | 224x224 px | no disponible en esta ficha | según backbone | colección en Hugging Face |
| VGG16 original (ImageNet-1k) | 138,4 M | 224x224 px | no aplica (1.000 clases ImageNet) | BSD-3-Clause (torchvision) | torchvision |

No se dispone de resultados publicados de los otros 39 backbones del mismo benchmark en la información proporcionada, por lo que no es posible una comparación numérica directa.

## Limitaciones y advertencias

- **Rendimiento moderado**: un 41,71 % de accuracy en 10 clases implica una tasa de error cercana al 58 %; no es adecuado como sistema de clasificación autónoma sin revisión humana.
- **Adaptación mínima**: al congelar el backbone y entrenar solo la cabeza lineal, el modelo no aprende representaciones específicas del dominio astronómico; es esperable que un fine-tuning completo o un backbone fundacional superen este resultado.
- **Sesgo de dominio**: entrenado exclusivamente con Galaxy10 DECaLS; el rendimiento puede degradarse con imágenes de otros sondeos, otras bandas fotométricas o distinta profundidad.
- **Riesgo de desequilibrio de clases**: no se publican métricas por clase ni matrices de confusión, por lo que no puede evaluarse si las clases minoritarias están infrarepresentadas en el rendimiento.
- **Restricciones de licencia**: BSD-3-Clause permite uso comercial y modificación con atribución y conservación del aviso de copyright; no impone restricciones de uso más allá de las habituales.
- **Caveat de producción**: el checkpoint incluye las estadísticas de `BatchNorm` del backbone congelado; cualquier cambio en el preprocesado (resolución, normalización, recorte) altera las predicciones de forma no controlada. La comprobación de integridad del autor solo cubre las primeras 96 imágenes de test.
- **Sin verificación independiente**: las métricas están marcadas como `verified: false` en el model-index y proceden únicamente del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/matthieulel/vgg16-galaxy10-decals-head-v2
- Dataset Galaxy10 DECaLS: https://huggingface.co/datasets/matthieulel/galaxy10_decals
- Dataset de ejecuciones del benchmark: https://huggingface.co/datasets/matthieulel/vision-foundation-models-benchmark-runs
- Colección Vision Foundation Models Benchmark: https://huggingface.co/collections/matthieulel/vision-foundation-models-benchmark-6ae4ae6c3f83b52cf00d9dcb
- Artículo de referencia: *When foundation models meet astronomical data*, Astronomy and Computing, versión revisada, 2026 (citación pendiente de publicación; no se dispone de enlace)

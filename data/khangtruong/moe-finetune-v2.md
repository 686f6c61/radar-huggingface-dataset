# KhangTruong/MoE-Finetune-v2

## Resumen

MoE-Finetune-v2 es un checkpoint de segmentación de imágenes orientado a la detección de manipulación forense y de imágenes sintéticas generadas por difusión. Lo publica el usuario KhangTruong en Hugging Face bajo licencia Apache 2.0 y se distribuye como pesos PyTorch (`.pt`) dentro de un repositorio de 1,7 GB. El pipeline declarado es `image-segmentation` y la librería asociada es `sid-unet`, lo que sitúa al modelo en la familia de arquitecturas SID-UNet (UNet con mecanismos de atención para localización de manipulaciones).

El modelo se presenta como un ajuste fino con mezcla de expertos (MoE) aplicado a la tarea de localización de regiones manipuladas o generadas. Su relevancia práctica está en el ámbito forense digital: distinguir píxeles auténticos de píxeles alterados por inpainting, edición o generación con modelos de difusión. La model card reporta un único entrenamiento de 1 época y una validación con puntuación de 0,6287, lo que indica un ajuste todavía preliminar.

La información pública es limitada: no se detallan parámetros totales, longitud de contexto (no aplica en segmentación), idiomas ni composición exacta del dataset de entrenamiento más allá del conjunto de evaluación `KhangTruong/Tampered-Images-Combined-Dataset-Fake`. Los resultados de la evaluación cruzada sobre 17.929 muestras muestran un rendimiento muy desigual según el subconjunto, con IoU global de 0,2562 y Dice de 0,3033.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SID-UNet con mezcla de expertos (MoE), según nombre y librería declarada |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de segmentación de imágenes) |
| Tipos de cuantizacion | no disponible (pesos en precisión completa PyTorch `.pt`) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`checkpoint_best.pt`) |
| Tarea | Segmentación de imágenes / detección de manipulación |
| Entrada | Imágenes RGB (resolución no especificada) |
| Salida | Máscara de segmentación a nivel de píxel |
| Tamaño del repositorio | 1,7 GB |
| Versión activa | `v1` |
| Épocas de entrenamiento | 1 |
| Mejor puntuación de validación | 0,6286843836850091 (época 1) |

## Arquitectura y entrenamiento

La arquitectura se infiere del nombre y de la librería declarada: SID-UNet, un UNet con atención para segmentación de imágenes, al que se incorpora un mecanismo de mezcla de expertos (MoE). No se especifica en la información disponible el número de expertos, el criterio de enrutamiento ni la profundidad del encoder/decoder. Tampoco se detalla si el MoE actúa en el cuello de botella, en los bloques del decoder o en ambos.

El entrenamiento reportado es de una única época, con un mejor score de validación de 0,6287 registrado en esa misma época. No se documenta el número de tokens ni de imágenes de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de aumento de datos, funciones de pérdida auxiliares o ajuste con datos sintéticos. La evaluación se realiza sobre el protocolo `eval_mvss_v1_protocol` con el dataset `KhangTruong/Tampered-Images-Combined-Dataset-Fake`, que reúne subconjuntos forenses clásicos (CASIA, Columbia, IMD2020, NIST16) y conjuntos de imágenes generadas o editadas (COCO_Inpaint, CocoGlide, OpenSDID_Flux.1, HiFi_IFDL, Coverage).

## Capacidades

- Segmentación densa a nivel de píxel para localizar regiones manipuladas o generadas en una imagen.
- Detección de manipulaciones clásicas de autenticación de imagen (copy-move, splicing) en subconjuntos como CASIA V1/V2, Columbia Gray e IMD2020.
- Detección de regiones generadas por difusión, evaluada sobre OpenSDID_Flux.1 y CocoGlide.
- Detección de inpainting sobre imágenes COCO (COCO_Inpaint).
- Salida de máscara binaria de manipulación, apta para pipelines de verificación forense.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, tool calling ni agentes.
- No dispone de capacidades multilingües ni de procesamiento de audio o vídeo.
- No se documenta modo "thinking" ni razonamiento multi-paso.

## Casos de uso

- Verificación forense de imágenes periodísticas: el modelo puede generar una máscara de las regiones sospechosas de manipulación para que un analista humano revise los píxeles marcados; su precisión es especialmente alta en CASIA V2 (IoU 0,8348) y Columbia Gray (IoU 0,9060).
- Detección de imágenes sintéticas en plataformas de contenido: integrado como filtro previo, permite señalar imágenes generadas por difusión (OpenSDID_Flux.1) antes de su publicación, aunque su IoU en ese subconjunto es baja (0,0703) y requeriría umbrales conservadores.
- Análisis de inpainting en edición comercial: útil para detectar retoques en imágenes de producto o catálogo, con la cautela de que el rendimiento en COCO_Inpaint es limitado (IoU 0,0700).
- Apoyo a peritajes de autenticación documental: sobre imágenes escaneadas de documentos, el modelo puede marcar regiones alteradas, especialmente en dominios similares a CASIA e IMD2020.
- Investigación en detección de deepfakes visuales: como baseline reproducible para comparar arquitecturas MoE frente a UNet estándar en tareas de segmentación forense.
- Preprocesado en pipelines de moderación de contenido: la máscara de manipulación puede alimentar clasificadores posteriores o sistemas de revisión humana, aprovechando su alta especificidad global (0,9819), que reduce falsos positivos a costa de un recall bajo (0,2878).

## Benchmarks y rendimiento

Evaluación cruzada sobre `eval_mvss_v1_protocol` (17.929 muestras):

| Métrica | Valor |
|---|---|
| Loss | 0,7901 |
| IoU | 0,2562 (IC 95 %: 0,2507–0,2616) |
| Dice / F1 | 0,3033 |
| AUROC a nivel de píxel | 0,6213 |
| Pixel Accuracy | 0,8794 |
| Precision | 0,4751 |
| Recall | 0,2878 |
| Specificity | 0,9819 |

Desglose por subconjunto:

| Sub-dataset | IoU | Dice / F1 | AUROC | Pixel Acc | Precision | Recall | Specificity | Muestras |
|---|---|---|---|---|---|---|---|---|
| CASIA_V1 | 0,7576 | 0,8134 | 0,9036 | 0,9716 | 0,8310 | 0,8236 | 0,9837 | 920 |
| CASIA_V2 | 0,8348 | 0,8756 | 0,9102 | 0,9377 | 0,8832 | 0,8774 | 0,9430 | 1000 |
| COCO_Inpaint | 0,0700 | 0,1145 | 0,5384 | 0,9424 | 0,3229 | 0,0838 | 0,9931 | 2000 |
| CocoGlide | 0,2987 | 0,3720 | 0,6527 | 0,8137 | 0,6510 | 0,3242 | 0,9811 | 507 |
| Columbia_Gray | 0,9060 | 0,9329 | 0,9520 | 0,9701 | 0,9684 | 0,9128 | 0,9913 | 180 |
| Coverage | 0,3984 | 0,4462 | 0,7061 | 0,9316 | 0,5937 | 0,4179 | 0,9942 | 100 |
| HiFi_IFDL | 0,0484 | 0,0820 | 0,5202 | 0,6973 | 0,4388 | 0,0714 | 0,9690 | 2000 |
| IMD2020 | 0,5537 | 0,6663 | 0,8246 | 0,9914 | 0,7101 | 0,6532 | 0,9959 | 2000 |
| IMD2020_RealLife | 0,5834 | 0,6714 | 0,8283 | 0,9715 | 0,7482 | 0,6628 | 0,9937 | 1000 |
| NIST16 | 0,0105 | 0,0197 | 0,3564 | 0,1330 | 0,3804 | 0,0136 | 0,6992 | 220 |
| OpenSDID_Flux.1 | 0,0703 | 0,1023 | 0,5326 | 0,8422 | 0,3098 | 0,0776 | 0,9876 | 2000 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio de 1,7 GB sugiere un modelo de tamaño moderado que probablemente quepa en GPUs de consumo, pero no se especifica el número de parámetros ni la resolución de entrada.
- GPU recomendadas: no disponible. Por el tamaño del repositorio, una RTX 3090 o RTX 4090 (24 GB) debería ser suficiente en FP32; una GPU con 8-12 GB podría bastar en FP16, pero es una estimación no confirmada.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del checkpoint, aunque no se confirma.
- Opciones de despliegue: PyTorch nativo con la librería `sid-unet`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de segmentación de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. Cualitativamente, la tarea se encuadra en la línea de detectores forenses como MVSS-Net, SPAN o TruFor, pero no se aportan métricas de estos modelos sobre el mismo protocolo para establecer una comparación rigurosa.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| MoE-Finetune-v2 | no disponible | no aplica | Apache 2.0 | Hugging Face |
| Alternativas forenses (MVSS-Net, SPAN, TruFor) | no disponible | no aplica | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenamiento de una sola época: el modelo está claramente infraentrenado, con un score de validación de 0,6287 y métricas de segmentación bajas en la mayoría de subconjuntos.
- Rendimiento muy desigual: excelente en Columbia_Gray (IoU 0,9060) y CASIA_V2 (0,8348), pero prácticamente nulo en NIST16 (IoU 0,0105), HiFi_IFDL (0,0484), COCO_Inpaint (0,0700) y OpenSDID_Flux.1 (0,0703).
- Recall bajo (0,2878) y precision moderada (0,4751): el modelo tiende a predecir regiones auténticas como mayoritarias, con muchos falsos negativos. La alta especificidad (0,9819) indica que cuando marca una manipulación suele acertar, pero pierde muchas.
- Riesgo de sobreajuste a los dominios de entrenamiento (CASIA, Columbia, IMD2020), con generalización pobre a imágenes generadas por difusión modernas.
- No se documentan sesgos demográficos, pero al ser un modelo de visión forense podría comportarse de forma distinta según el tipo de imagen, resolución, compresión JPEG o contenido.
- Riesgo de alucinación en el sentido de generar máscaras plausibles pero incorrectas en imágenes no manipuladas o en dominios fuera de distribución.
- Licencia Apache 2.0 permite uso comercial, pero el estado preliminar del modelo desaconseja su uso en producción sin un reentrenamiento y validación adicionales.
- No se especifican limitaciones de idioma porque no es un modelo lingüístico; la limitación es de dominio visual.
- No se documenta resolución de entrada, normalización ni preprocesado requerido, lo que dificulta la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/KhangTruong/MoE-Finetune-v2
- Dataset de evaluación: https://huggingface.co/datasets/KhangTruong/Tampered-Images-Combined-Dataset-Fake
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código o demos adicionales.

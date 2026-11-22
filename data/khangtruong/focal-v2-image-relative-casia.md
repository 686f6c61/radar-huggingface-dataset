# KhangTruong/focal-v2-image-relative-casia

## Resumen

`focal-v2-image-relative-casia` es un modelo de segmentación de imágenes orientado a la detección de imágenes sintéticas y manipulaciones por difusión. Lo publica el usuario KhangTruong en Hugging Face bajo licencia Apache 2.0 y se distribuye como checkpoint de PyTorch (`.pt`) para la librería `sid-unet`. El modelo resuelve la tarea de localizar a nivel de píxel las regiones manipuladas o generadas artificialmente en una imagen, devolviendo una máscara de segmentación en lugar de una simple clasificación binaria.

La arquitectura declarada en el repositorio es `sid-unet`, con un backbone identificado en los resultados como `focal_vit_hrnet_image_relative_casia` (ViT + HRNet), aunque la model card no detalla la configuración exacta de capas, dimensión de embeddings ni resolución de entrada. El repositorio ocupa 2,7 GB y contiene una única versión (`v1`) entrenada durante 3 épocas, con una puntuación de validación de 0,6643 en la mejor época.

El interés actual del modelo reside en su evaluación cruzada sobre el protocolo MVSS-v1 con el dataset `KhangTruong/Tampered-Images-Combined-Dataset-Fake` (1676 muestras). Los resultados muestran un comportamiento muy desigual: excelente en datasets clásicos de manipulación (CASIA v1/v2, Columbia Gray) y muy pobre en escenarios de inpainting con difusión (COCO_Inpaint, IMD2020), lo que lo convierte en una referencia útil para estudiar la generalización de detectores de imágenes sintéticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SID-UNet con backbone ViT + HRNet (`focal_vit_hrnet_image_relative_casia`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch `.pt`; no se publican variantes GGUF/ONNX) |
| Idiomas soportados | no disponible (modelo de imagen, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`, `checkpoint_best.pt`) |
| Tarea | Segmentación de imágenes / detección de imágenes sintéticas |
| Tamaño del repositorio | 2,7 GB |
| Versión activa | `v1` (mejor score 0,6643 en época 3) |
| Épocas de entrenamiento | 3 |

## Arquitectura y entrenamiento

El modelo sigue la familia SID-UNet (Synthetic Image Detection UNet), una arquitectura de segmentación semántica binaria que produce una máscara por píxel indicando si la región pertenece a contenido manipulado o generado. El backbone se identifica en los artefactos como `focal_vit_hrnet`, es decir, una combinación de Vision Transformer con una cabeza HRNet para preservar resolución espacial en la predicción densa. La model card no especifica el número de parámetros, la resolución de entrada, el número de tokens de entrenamiento ni la composición exacta del dataset de entrenamiento.

El entrenamiento se realizó durante solo 3 épocas, con una mejor puntuación de validación de 0,6643 en la época 3, lo que sugiere un ajuste fino sobre un checkpoint previo más que un entrenamiento desde cero. No se documenta el uso de RLHF, DPO ni técnicas de alineación (no aplicables a segmentación). La evaluación se realiza sobre el protocolo `eval_mvss_v1_protocol`, que agrupa múltiples sub-datasets de manipulación y generación: CASIA v1/v2, COCO_Inpaint, CocoGlide, Columbia_Gray, Coverage, HiFi_IFDL e IMD2020, entre otros.

## Capacidades

- Segmentación densa a nivel de píxel para detectar regiones manipuladas o generadas por difusión.
- Detección de manipulaciones clásicas de imagen (copy-move, splicing) en datasets tipo CASIA y Columbia.
- Detección de imágenes generadas por difusión en escenarios de inpainting (COCO_Inpaint, CocoGlide).
- Salida de máscara binaria compatible con métricas estándar de segmentación (IoU, Dice/F1, AUROC a nivel de píxel).
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente visual.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo "thinking", visión multimodal ni audio.

## Casos de uso

- Moderación de contenido en plataformas: el modelo puede generar una máscara de las zonas de una imagen sospechosas de haber sido generadas o manipuladas, permitiendo a los moderadores revisar solo las regiones marcadas en lugar de la imagen completa.
- Verificación de integridad documental: aplicable a la detección de manipulaciones en imágenes de documentos escaneados, aunque su rendimiento en datasets de inpainting es bajo (IoU 0,0154 en COCO_Inpaint), por lo que se recomienda combinarlo con otros detectores.
- Investigación en forensia digital: útil como baseline para estudiar la generalización de detectores SID-UNet entre distintos tipos de manipulación, dado que el repositorio publica matrices de evaluación cruzada completas.
- Filtrado previo en pipelines de curación de datasets: para descartar imágenes sintéticas de un corpus antes de usarlas en entrenamiento, especialmente en datasets con manipulación clásica (CASIA, Columbia) donde el modelo alcanza IoU superior a 0,86.
- Benchmarking de detectores de imágenes sintéticas: el protocolo MVSS-v1 y las métricas publicadas (IoU, Dice, AUROC, precisión, recall, especificidad) permiten comparar directamente este checkpoint con otros del mismo repositorio.
- Docencia y experimentación: al ser Apache 2.0 y pesar 2,7 GB, es viable cargarlo en entornos de investigación con una sola GPU para reproducir los resultados publicados.

## Benchmarks y rendimiento

Resultados de la evaluación cruzada sobre `eval_mvss_v1_protocol` (dataset `KhangTruong/Tampered-Images-Combined-Dataset-Fake`, 1676 muestras):

| Metrica | Valor |
|---|---|
| Loss | 0,5302 |
| IoU | 0,4193 (IC 95%: [0,3990, 0,4397], ±0,0204) |
| Dice / F1 | 0,4715 |
| AUROC (pixel) | 0,7163 |
| Pixel Accuracy | 0,8633 |
| Precision | 0,4871 |
| Recall | 0,5595 |
| Specificity | 0,9132 |

Desglose por sub-dataset:

| Sub-dataset | IoU | Dice/F1 | AUROC | Pixel Acc | Precision | Recall | Specificity | Muestras |
|---|---|---|---|---|---|---|---|---|
| CASIA_V1 | 0,8609 | 0,9037 | 0,9725 | 0,9848 | 0,8827 | 0,9580 | 0,9870 | 120 |
| CASIA_V2 | 0,8811 | 0,9130 | 0,9727 | 0,9805 | 0,9060 | 0,9569 | 0,9885 | 120 |
| COCO_Inpaint | 0,0154 | 0,0283 | 0,4970 | 0,8825 | 0,0278 | 0,0722 | 0,9217 | 120 |
| CocoGlide | 0,4200 | 0,4918 | 0,6825 | 0,7492 | 0,5929 | 0,4982 | 0,8668 | 120 |
| Columbia_Gray | 0,9478 | 0,9612 | 0,9733 | 0,9767 | 0,9619 | 0,9606 | 0,9860 | 120 |
| Coverage | 0,5446 | 0,6243 | 0,8536 | 0,9061 | 0,5698 | 0,7811 | 0,9261 | 100 |
| HiFi_IFDL | 0,3356 | 0,3983 | 0,6537 | 0,6995 | 0,4678 | 0,4957 | 0,8117 | 120 |
| IMD2020 | 0,037 (truncado en la model card) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado comparaciones directas con otros modelos en la información disponible; los resultados corresponden únicamente a la autoevaluación del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con un repositorio de 2,7 GB y un backbone ViT + HRNet, una estimación razonable en FP32 estaría en el rango de 6-12 GB, pero el dato no está confirmado por el autor.
- GPU recomendadas: no especificadas. Por tamaño, una RTX 3090/4090 (24 GB) o una A100/H100 deberían ser suficientes para inferencia en FP32 o FP16.
- Cabe en GPU de consumo: probablemente sí en GPUs con 12-24 GB, aunque no está verificado en la model card.
- Opciones de despliegue: el checkpoint es PyTorch puro (`.pt`); no se publican variantes GGUF, ONNX ni TensorRT. Requiere cargar el modelo con la librería `sid-unet` y PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La model card no incluye comparaciones con otros detectores de imágenes sintéticas (por ejemplo, TruFor, PSCC-Net, NPR, UnivFD) ni con otros checkpoints SID-UNet del mismo autor. El repositorio solo publica la autoevaluación de este checkpoint.

## Limitaciones y advertencias

- Rendimiento muy desigual: excelente en manipulación clásica (IoU 0,86-0,95 en CASIA y Columbia) pero prácticamente nulo en inpainting con difusión (IoU 0,0154 en COCO_Inpaint, AUROC 0,4970, equivalente a azar).
- Solo 3 épocas de entrenamiento: el modelo puede estar infraentrenado y no representa un estado del arte consolidado.
- Sin información sobre sesgos: no se documenta la composición demográfica ni la distribución del dataset de entrenamiento.
- Riesgo de falsos positivos y negativos: precision 0,4871 y recall 0,5595 a nivel agregado indican un equilibrio pobre; specificity alta (0,9132) sugiere que el modelo tiende a predecir "no manipulado" en regiones ambiguas.
- Sin capacidades de texto ni multilingües: no es un modelo de lenguaje, por lo que no debe evaluarse con métricas tipo MMLU, HumanEval o GSM8K.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.
- El dato de IMD2020 aparece truncado en la model card ("0,037"), por lo que no puede citarse como resultado completo.
- No se especifica la resolución de entrada ni el preprocesado requerido, lo que complica la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/KhangTruong/focal-v2-image-relative-casia
- Dataset de evaluación: https://huggingface.co/datasets/KhangTruong/Tampered-Images-Combined-Dataset-Fake
- Configuración de evaluación: `configs/cross-eval/MVSS-v1-protocol.yaml` (referenciada en la model card, no enlazada)
- Ilustraciones incluidas en el repo: `illustrations/cross_eval_iou_heatmap.png`, `illustrations/cross_eval_f1_heatmap.png`, `illustrations/cross_eval_pixel_acc_heatmap.png`, `illustrations/cross_eval_auroc_heatmap.png`, `illustrations/sample_predictions_MVSS-v1-protocol.png`
- Paper, blog o demo oficial: no disponible

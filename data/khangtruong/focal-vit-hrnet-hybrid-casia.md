# KhangTruong/focal-vit-hrnet-hybrid-casia

## Resumen

focal-vit-hrnet-hybrid-casia es un modelo de segmentación de imágenes orientado a la detección de imágenes sintéticas generadas por difusión y a la localización de regiones manipuladas (image forgery localization). Lo publica el usuario KhangTruong en Hugging Face bajo licencia Apache 2.0 y se distribuye como un checkpoint de PyTorch (`.pt`) para la librería `sid-unet`, con un tamaño de repositorio de 2,7 GB. El pipeline declarado es `image-segmentation`: el modelo produce una máscara a nivel de píxel que indica qué zonas de la imagen han sido generadas o alteradas.

El nombre sugiere una arquitectura híbrida que combina un backbone ViT con una cabeza de segmentación tipo HRNet, aunque la model card no detalla la composición exacta ni el número de parámetros. El checkpoint se ha entrenado únicamente 3 épocas y se evalúa sobre el protocolo `MVSS-v1` con el dataset `KhangTruong/Tampered-Images-Combined-Dataset-Fake` (1676 muestras de test cruzado). Su relevancia actual radica en la creciente necesidad de detectar contenido sintético a nivel forense, un problema donde los detectores binarios a nivel de imagen resultan insuficientes y se requiere localización espacial de la manipulación.

Los resultados son muy dispares según el sub-dataset: rinde muy bien en manipulaciones clásicas (CASIA V1/V2, Columbia Gray) pero falla casi por completo en inpainting moderno (COCO_Inpaint, IMD2020), lo que indica un sesgo hacia artefactos de manipulación tradicional y una generalización limitada frente a generadores por difusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida ViT + HRNet (según nombre; no detallada en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (checkpoint PyTorch `.pt` en fp32/fp16 presumiblemente) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pt` (`checkpoint_best_s035.pt`) |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna más allá del nombre `focal-vit-hrnet-hybrid-casia` y la etiqueta `sid-unet`. Por la denominación se infiere una combinación de un backbone Vision Transformer (ViT) con una cabeza de segmentación HRNet, y probablemente una función de pérdida focal (focal loss) para manejar el desequilibrio entre píxeles manipulados y no manipulados. La etiqueta `sid-unet` sugiere un framework de segmentación basado en U-Net para detección de imágenes sintéticas. No se dispone de información sobre el número de parámetros, la resolución de entrada ni la composición exacta del dataset de entrenamiento.

El entrenamiento reportado es de solo 3 épocas, con un mejor score de validación de 0,5373 en la época 3. Esta cifra, junto con el bajo número de épocas, sugiere un entrenamiento corto o parcial. No se documenta el uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo de visión. Tampoco se detalla el número de tokens de entrenamiento ni la composición del dataset, más allá de que la evaluación se realiza sobre `Tampered-Images-Combined-Dataset-Fake`.

## Capacidades

- Segmentación a nivel de píxel de regiones manipuladas o generadas en imágenes.
- Detección de imágenes sintéticas generadas por difusión (etiqueta `diffusion-detection`).
- Localización de manipulaciones clásicas de tipo copy-move y splicing, con buen rendimiento en CASIA V1/V2 y Columbia Gray.
- Salida de máscara binaria o probabilística compatible con el pipeline `image-segmentation`.
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades multilingües, de audio ni de visión multimodal más allá de la segmentación.
- No se documenta modo de razonamiento (thinking mode) ni decodificación especulativa.

## Casos de uso

- Moderación de contenido en plataformas: el modelo puede generar máscaras que señalen qué regiones de una imagen han sido generadas o alteradas, permitiendo a los moderadores priorizar la revisión de zonas concretas en lugar de la imagen completa.
- Forense digital y peritaje: útil para localizar manipulaciones en imágenes aportadas como prueba, especialmente en manipulaciones clásicas (CASIA, Columbia) donde el modelo alcanza IoU de 0,76-0,94.
- Verificación de integridad en medios de comunicación: detección de imágenes retocadas o generadas en flujos de publicación, con la salvedad de que su rendimiento en inpainting moderno es bajo.
- Investigación en detección de deepfakes y contenido sintético: como baseline o componente de un ensemble para localización de artefactos de difusión.
- Preprocesado en pipelines de autenticación documental: detección de alteraciones en documentos escaneados o imágenes de identidad, apoyándose en su buen rendimiento en manipulaciones de tipo splicing.
- Análisis de datasets de entrenamiento: cribado de imágenes sintéticas dentro de corpus de entrenamiento para modelos de visión, usando la máscara para identificar regiones generadas.

## Benchmarks y rendimiento

Evaluación sobre el protocolo `eval_mvss_v1_protocol` con el dataset `KhangTruong/Tampered-Images-Combined-Dataset-Fake` (split `cross_test`, 1676 muestras):

| Metrica | Valor |
|---|---|
| Loss | 0,5357 |
| IoU | 0,3980 (IC 95%: [0,3787, 0,4174], ±0,0194) |
| Dice / F1 | 0,4584 |
| AUROC (pixel) | 0,7153 |
| Pixel Accuracy | 0,8584 |
| Precision | 0,4674 |
| Recall | 0,5622 |
| Specificity | 0,9086 |

Desglose por sub-dataset:

| Sub-dataset | IoU | Dice/F1 | AUROC | Pixel Acc | Precision | Recall | Specificity | Muestras |
|---|---|---|---|---|---|---|---|---|
| CASIA_V1 | 0,7597 | 0,8322 | 0,9594 | 0,9706 | 0,7805 | 0,9451 | 0,9737 | 120 |
| CASIA_V2 | 0,8050 | 0,8597 | 0,9673 | 0,9714 | 0,8304 | 0,9548 | 0,9798 | 120 |
| COCO_Inpaint | 0,0224 | 0,0405 | 0,5006 | 0,8667 | 0,0371 | 0,0976 | 0,9036 | 120 |
| CocoGlide | 0,4024 | 0,4837 | 0,6932 | 0,7505 | 0,6006 | 0,5057 | 0,8807 | 120 |
| Columbia_Gray | 0,9421 | 0,9574 | 0,9692 | 0,9716 | 0,9543 | 0,9623 | 0,9760 | 120 |
| Coverage | 0,5021 | 0,5867 | 0,8330 | 0,8934 | 0,5374 | 0,7504 | 0,9157 | 100 |
| HiFi_IFDL | 0,3463 | 0,4235 | 0,6874 | 0,7230 | 0,5088 | 0,5372 | 0,8377 | 120 |
| IMD2020 | 0,0384 | 0,0610 | 0,5633 | 0,8759 | 0,0447 | 0,2424 | 0,8842 | 120 |
| IMD2020_RealLife | 0,4666 | 0,5633 | 0,8933 | 0,9224 | 0,4902 | 0,8534 | 0,9331 | no disponible |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión al desconocerse el número de parámetros. Para un checkpoint de 2,7 GB en fp32, una estimación razonable es de 3-6 GB de VRAM en fp32 y 2-3 GB en fp16, pero es una inferencia, no un dato del autor.
- GPU recomendadas: no disponibles. Por el tamaño del checkpoint, cabría esperar ejecución en GPUs consumer (RTX 3060 12 GB, RTX 4090) y en A100/H100 para lotes grandes.
- Cabe en GPU consumer: probablemente sí, dado el tamaño del repositorio (2,7 GB), pero no confirmado por el autor.
- Opciones de despliegue: PyTorch nativo con la librería `sid-unet`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de visión de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos en la información proporcionada. Como alternativas de la misma categoría (detección y localización de imágenes manipuladas o sintéticas) pueden citarse familias como TruFor, PSCC-Net o MVSS-Net, pero no se han incluido métricas comparables en la model card, por lo que no es posible establecer una comparación cuantitativa fiable.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos comparativos |
|---|---|---|---|---|---|
| focal-vit-hrnet-hybrid-casia | no disponible | no aplica | Apache 2.0 | Hugging Face | IoU 0,398 / Dice 0,458 / AUROC 0,715 (MVSS-v1) |
| TruFor | no disponible | no aplica | no disponible | no disponible | no disponible |
| PSCC-Net | no disponible | no aplica | no disponible | no disponible | no disponible |
| MVSS-Net | no disponible | no aplica | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Entrenamiento de solo 3 épocas: el modelo está claramente infraentrenado, con un score de validación de 0,5373 y métricas de segmentación moderadas (IoU global 0,398).
- Fuerte sesgo hacia manipulaciones clásicas: rinde muy bien en CASIA V1/V2 y Columbia Gray (IoU 0,76-0,94) pero falla en inpainting moderno como COCO_Inpaint (IoU 0,0224) e IMD2020 (IoU 0,0384), lo que indica escasa generalización a generadores por difusión.
- AUROC en COCO_Inpaint de 0,5006: equivalente a azar, por lo que el modelo no distingue regiones generadas de regiones reales en ese sub-dataset.
- Riesgo de falsos positivos y negativos: precisión global de 0,4674 y recall de 0,5622, con una accuracy a nivel de píxel de 0,8584 que puede estar inflada por el gran desequilibrio entre píxeles manipulados y no manipulados.
- No se documentan sesgos demográficos ni de dominio, pero al ser un modelo de visión entrenado sobre datasets forenses clásicos, es probable que presente sesgos hacia tipos de imagen y artefactos de compresión concretos.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni documentación sobre el origen de los datos de entrenamiento, lo que puede plantear dudas de cumplimiento en producción.
- Ausencia de información sobre resolución de entrada, preprocesado y normalización: dificulta la reproducibilidad y la integración en pipelines existentes.
- No apto para uso forense pericial sin validación adicional: las métricas por sub-dataset muestran un comportamiento errático que desaconseja su uso como única fuente de decisión.

## Enlaces

- Hugging Face: https://huggingface.co/KhangTruong/focal-vit-hrnet-hybrid-casia
- Dataset de evaluación: https://huggingface.co/datasets/KhangTruong/Tampered-Images-Combined-Dataset-Fake
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.

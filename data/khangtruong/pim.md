# KhangTruong/PIM

## Resumen

PIM (siglas no desglosadas en la información disponible) es un modelo de segmentación de imágenes orientado a la detección y localización de imágenes sintéticas generadas por difusión y de manipulaciones locales (inpainting, splicing). Lo publica el usuario KhangTruong en Hugging Face bajo licencia Apache 2.0 y se distribuye como checkpoints de PyTorch para la librería `sid-unet`. No es un modelo de lenguaje: su entrada es una imagen y su salida es una máscara de segmentación a nivel de píxel.

El repositorio incluye al menos dos checkpoints evaluados en el protocolo MVSS-v1 sobre el dataset `KhangTruong/Tampered-Images-Combined-Dataset-Fake` (17.929 muestras): `sid_pim_swin` (la variante PIM) y `sid_focal_hrnet` (modelo de referencia con el que se compara). La versión activa es `v1`, entrenada durante 10 épocas, con una mejor puntuación de validación de 0,852.

Es relevante en el contexto actual de proliferación de imágenes generadas por modelos de difusión: proporciona una herramienta de análisis forense a nivel de píxel, no solo un clasificador binario de imagen real/falsa. El tamaño del repositorio es de 2,0 GB y acumula 79 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SID-UNet con backbone Swin (checkpoint `sid_pim_swin`); se compara con una variante Focal-HRNet (`sid_focal_hrnet`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (checkpoints en PyTorch, sin versiones GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (modelo de imagen, sin componente lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`.pt`); checkpoints en `outputs/RUN/pim_swin/checkpoints/checkpoint_best.pt` y `outputs/RUN/focal_hrnet/checkpoints/checkpoint_best.pt` |

## Arquitectura y entrenamiento

La información disponible describe el modelo como una implementación de SID-UNet (una U-Net para segmentación de imágenes sintéticas) con backbone Swin Transformer en la variante PIM. El repositorio incluye también un checkpoint basado en Focal-HRNet, que actúa como referencia comparativa en la evaluación cruzada. No se detalla en la model card el número de parámetros, la resolución de entrada, la composición exacta del dataset de entrenamiento ni si se emplearon técnicas de aumento de datos específicas.

El entrenamiento consta de 10 épocas, con la mejor métrica de validación (0,852) alcanzada en la época 10, lo que sugiere que el modelo podría no haber convergido plenamente o que el criterio de parada se fijó en ese punto. La evaluación se realiza sobre el protocolo MVSS-v1 con el dataset `Tampered-Images-Combined-Dataset-Fake`, que combina subconjuntos como CASIA_V1, CASIA_V2 y COCO_Inpaint. No se especifica si hubo ajuste fino con RLHF/DPO (no aplicable en segmentación) ni detalles sobre la función de pérdida más allá del nombre del checkpoint (`focal_hrnet` sugiere el uso de Focal Loss en esa variante).

## Capacidades

- Segmentación a nivel de píxel de regiones manipuladas o generadas sintéticamente en imágenes.
- Detección de imágenes creadas por modelos de difusión (tag `diffusion-detection`).
- Localización de manipulaciones locales tipo inpainting o splicing (subconjuntos CASIA y COCO_Inpaint en la evaluación).
- Salida de máscara binaria o probabilística compatible con métricas de IoU, Dice/F1, AUROC y precisión por píxel.
- Integración con la librería `sid-unet` para carga de checkpoints y ejecución de inferencia.
- No dispone de soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.
- No se documentan modos especiales como thinking, visión adicional o audio.

## Casos de uso

- Análisis forense de imágenes en medios de comunicación: el modelo puede generar una máscara que señale las zonas sospechosas de una fotografía, permitiendo a un editor revisar visualmente las regiones marcadas antes de publicar.
- Moderación de contenido en plataformas: integrado en un pipeline de subida de imágenes, el modelo puede detectar y localizar manipulaciones por inpainting en imágenes de perfil o publicaciones, activando una revisión humana cuando la máscara supere un umbral de área.
- Verificación de integridad en documentos escaneados: aunque el modelo se evalúa en imágenes naturales, su capacidad para localizar regiones alteradas (entrenado con CASIA, que incluye manipulaciones de tipo splicing) puede aplicarse a la detección de retoques en documentos digitalizados.
- Investigación en detección de deepfakes visuales: el checkpoint `sid_pim_swin` sirve como línea base reproducible sobre el protocolo MVSS-v1 para comparar nuevas arquitecturas de segmentación forense.
- Automatización de auditorías en datasets: antes de entrenar un modelo generativo, se puede pasar el detector sobre el corpus para identificar y filtrar imágenes sintéticas o retocadas que contaminen el conjunto de datos.
- Evaluación comparativa de arquitecturas de segmentación: el repositorio incluye dos checkpoints (Swin y HRNet) con métricas cruzadas, lo que permite usar el modelo como referencia en experimentos de ablación sobre backbones.
- Detección de retoques en imágenes de producto en comercio electrónico: el modelo puede marcar áreas editadas (por ejemplo, eliminación de defectos) para cumplir con políticas de transparencia publicitaria.

## Benchmarks y rendimiento

Resultados de la evaluación cruzada sobre el protocolo `eval_mvss_v1_protocol` con el dataset `KhangTruong/Tampered-Images-Combined-Dataset-Fake` (17.929 muestras):

| Checkpoint | Loss | IoU | Dice/F1 | AUROC | Pixel Acc | Precision | Recall | Specificity |
|---|---|---|---|---|---|---|---|---|
| `sid_focal_hrnet` | 1,0407 | 0,2293 | 0,2902 | 0,6171 | 0,7758 | 0,2809 | 0,4618 | 0,8233 |
| `sid_pim_swin` | 0,9506 | 0,1645 | 0,1983 | 0,5770 | 0,8472 | 0,2761 | 0,2281 | 0,9416 |

Desglose por sub-dataset del checkpoint `sid_focal_hrnet` (único con datos por subconjunto en la información disponible):

| Sub-dataset | IoU | Dice/F1 | AUROC | Pixel Acc | Precision | Recall | Specificity | Muestras |
|---|---|---|---|---|---|---|---|---|
| CASIA_V1 | 0,6365 | 0,7179 | 0,9073 | 0,9578 | 0,6672 | 0,8478 | 0,9668 | 920 |
| CASIA_V2 | 0,7391 | 0,8137 | 0,9655 | 0,9641 | 0,7506 | 0,9649 | 0,9661 | 1000 |
| COCO_Inpaint | 0,0459 | 0,0794 | 0,5328 | 0,8406 | 0,0745 | 0,1849 | 0,... (truncado en la información disponible) | no disponible |

El checkpoint PIM (`sid_pim_swin`) obtiene una pérdida menor (0,9506 frente a 1,0407) y una mayor precisión por píxel (0,8472 frente a 0,7758), pero peor IoU, Dice/F1 y AUROC que la referencia Focal-HRNet. El recall bajo (0,2281) indica que el modelo PIM es conservador: marca menos píxeles como manipulados, lo que eleva la especificidad (0,9416) a costa de perder detecciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El tamaño del repositorio es de 2,0 GB, lo que da una cota superior aproximada del peso de los checkpoints, pero no se especifica el consumo en memoria durante la inferencia.
- GPU recomendadas: no disponible. Al tratarse de un modelo de segmentación con backbone Swin, es probable que quepa en GPUs de consumo, pero no hay datos publicados que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: la librería indicada es `sid-unet` (PyTorch). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de segmentación de imágenes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | IoU (MVSS-v1) | Dice/F1 | AUROC | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| `sid_pim_swin` (PIM v1) | SID-UNet + Swin | no disponible | no aplica | 0,1645 | 0,1983 | 0,5770 | Apache 2.0 | Hugging Face |
| `sid_focal_hrnet` | Focal-HRNet | no disponible | no aplica | 0,2293 | 0,2902 | 0,6171 | Apache 2.0 (mismo repo) | Hugging Face |
| Otros detectores de imágenes sintéticas | no disponible | no disponible | no aplica | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación directa disponible es con el checkpoint `sid_focal_hrnet` incluido en el mismo repositorio, que supera a PIM en IoU, Dice/F1 y AUROC, aunque PIM obtiene mejor pérdida y precisión por píxel. No se han publicado comparaciones con modelos externos de detección de imágenes generadas en la información disponible.

## Limitaciones y advertencias

- Rendimiento bajo en el subconjunto COCO_Inpaint (IoU 0,0459, Dice/F1 0,0794 para la referencia Focal-HRNet), lo que indica una capacidad muy limitada para localizar manipulaciones de inpainting en escenas naturales complejas.
- El checkpoint PIM tiene un recall de 0,2281, lo que implica que pierde aproximadamente el 77 % de los píxeles manipulados en la evaluación cruzada; no es adecuado como único filtro de detección sin revisión humana.
- Solo se han publicado 10 épocas de entrenamiento; no hay información sobre convergencia, sobreajuste o estabilidad del entrenamiento.
- No se documentan sesgos conocidos, pero al entrenarse sobre un dataset combinado (CASIA, COCO_Inpaint) puede heredar sesgos de composición y de dominio de esas fuentes.
- Riesgo de alucinación en el sentido de falsos positivos: la precisión por píxel es baja (0,2761 en PIM), por lo que marcará regiones no manipuladas como sospechosas con frecuencia.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y sin documentación sobre limitaciones de dominio.
- No hay información sobre el preprocesado requerido (resolución de entrada, normalización) ni sobre el formato exacto de salida, lo que dificulta la reproducibilidad.
- El repositorio tiene 0 likes y 79 descargas, lo que sugiere una validación externa muy limitada por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/KhangTruong/PIM
- Dataset de evaluación: https://huggingface.co/datasets/KhangTruong/Tampered-Images-Combined-Dataset-Fake
- Repositorio de la librería `sid-unet`: no disponible en la información proporcionada
- Paper o blog del modelo: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada

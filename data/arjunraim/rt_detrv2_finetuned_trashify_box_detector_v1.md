# arjunraim/rt_detrv2_finetuned_trashify_box_detector_v1

## Resumen

El modelo `arjunraim/rt_detrv2_finetuned_trashify_box_detector_v1` es un detector de objetos basado en RT-DETR v2, fine-tuneado sobre el modelo base `PekingU/rtdetr_v2_r50vd`. Desarrollado por el usuario arjunraim, está orientado a la detección y clasificación de residuos en imágenes, con categorías como basura, contenedor, mano, brazo de basura, etc. El modelo tiene 42.869.429 parámetros y se distribuye bajo licencia Apache-2.0, lo que permite uso comercial y modificación.

La relevancia de este modelo radica en su aplicación práctica en sistemas de gestión de residuos, reciclaje automatizado y monitorización ambiental. Al ser un fine-tuning de RT-DETR v2, hereda la arquitectura de detección en tiempo real basada en transformer, con un backbone ResNet-50, lo que lo hace adecuado para despliegues con requisitos de latencia moderada. Sin embargo, la información pública es limitada: no se especifica el dataset de entrenamiento ni se publican benchmarks comparativos, y las métricas de evaluación reportadas por el autor muestran un rendimiento desigual según el tamaño de los objetos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETR v2 (detector basado en transformer con backbone ResNet-50) |
| Parametros totales | 42.869.429 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

RT-DETR v2 es un detector de objetos en tiempo real que combina un transformer encoder-decoder con un backbone convolutional (ResNet-50 en la variante r50vd). A diferencia de los detectores basados en propuestas como YOLO, RT-DETR elimina la necesidad de anclas y post-procesamiento NMS, simplificando el pipeline de inferencia. El modelo base fue preentrenado en grandes conjuntos de datos de detección general, y este fine-tuning lo adapta a la tarea específica de clasificar residuos.

El entrenamiento se realizó con los siguientes hiperparámetros: learning rate de 0.0001, batch size de 16, 10 épocas, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal con warmup del 5% de los pasos, y precisión mixta nativa (AMP). El dataset de entrenamiento no está documentado en la model card, por lo que se desconoce su composición, tamaño y procedencia. La pérdida de validación final fue de 9.7182, con un mAP de 0.5436.

## Capacidades

- Detección de objetos en imágenes, con clasificación en categorías relacionadas con residuos: basura, contenedor, mano, brazo de basura, y clases negativas (no basura, no contenedor, etc.).
- Inferencia en tiempo real gracias a la arquitectura RT-DETR v2, que no requiere NMS post-procesamiento.
- Soporte para imágenes de tamaño variable (el modelo base acepta resoluciones típicas de detección, aunque no se especifica el tamaño de entrada en la documentación).
- No incluye capacidades de generación de texto, tool calling, agentes ni procesamiento de lenguaje natural.

## Casos de uso

- Clasificación automatizada de residuos en plantas de reciclaje: el modelo puede integrarse en cintas transportadoras para identificar y separar basura, contenedores y otros objetos, mejorando la eficiencia del proceso.
- Monitorización de limpieza urbana: desplegado en cámaras de vigilancia, puede detectar basura en calles y parques, facilitando la gestión de servicios de limpieza municipal.
- Asistencia a robots de recogida de residuos: el modelo puede guiar a robots autónomos para localizar y recoger objetos clasificados como basura, reduciendo la intervención humana.
- Auditoría de contenedores de reciclaje: permite verificar si los contenedores están llenos o si contienen materiales no deseados, optimizando las rutas de recogida.
- Aplicaciones educativas de concienciación ambiental: puede usarse en apps móviles para identificar residuos y enseñar a los usuarios a clasificarlos correctamente.
- Control de calidad en procesos de compostaje: detecta materiales no orgánicos en flujos de residuos orgánicos, evitando contaminación del compost.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos en la información disponible. La model card incluye métricas de evaluación reportadas por el autor, que se presentan a continuación:

| Metrica | Valor |
|---|---|
| Loss (validacion) | 9.7182 |
| mAP | 0.5436 |
| mAP 50 | 0.7171 |
| mAP 75 | 0.6119 |
| mAP Small | 0.0033 |
| mAP Medium | 0.2656 |
| mAP Large | 0.5772 |
| mAR 1 | 0.5789 |
| mAR 10 | 0.7361 |
| mAR 100 | 0.7501 |
| mAR Small | 0.25 |
| mAR Medium | 0.4568 |
| mAR Large | 0.7846 |
| mAP Bin | 0.7728 |
| mAR 100 Bin | 0.8709 |
| mAP Hand | 0.5724 |
| mAR 100 Hand | 0.7833 |
| mAP Not Bin | 0.2034 |
| mAR 100 Not Bin | 0.6 |
| mAP Not Hand | -1.0 |
| mAR 100 Not Hand | -1.0 |
| mAP Not Trash | 0.2673 |
| mAR 100 Not Trash | 0.5611 |
| mAP Trash | 0.6214 |
| mAR 100 Trash | 0.785 |
| mAP Trash Arm | 0.8243 |
| mAR 100 Trash Arm | 0.9 |

Estos valores indican un rendimiento aceptable en objetos grandes y medianos, pero muy pobre en objetos pequeños (mAP Small de 0.0033), lo que limita su uso en escenarios con elementos distantes o de pequeño tamaño.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de ~43M parámetros, la inferencia requiere aproximadamente 1-2 GB de VRAM en precisión FP32, y menos de 1 GB en cuantización FP16 o INT8 (si estuviera disponible).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente, por ejemplo NVIDIA GTX 1650, RTX 3060, RTX 4060, o superiores. También puede ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con Hugging Face Inference Endpoints, o mediante frameworks como ONNX Runtime, TensorRT o TorchScript para optimización en producción.
- Latencia y throughput: no se dispone de datos medidos, pero por el tamaño del modelo se espera una inferencia en el orden de decenas de milisegundos en GPU moderna, permitiendo procesamiento en tiempo real.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros detectores de objetos (como YOLO, DETR o Faster R-CNN) en la misma tarea. El modelo base RT-DETR v2 tiene métricas publicadas en su repositorio, pero no se han encontrado datos de comparación directa con este fine-tuning. Se recomienda evaluar el modelo frente a alternativas como YOLOv8 o DETR si se necesita una comparación rigurosa.

## Limitaciones y advertencias

- El dataset de entrenamiento no está documentado, por lo que se desconoce su composición, balance de clases y posible sesgo geográfico o contextual.
- El rendimiento en objetos pequeños es muy bajo (mAP Small de 0.0033), lo que limita su uso en imágenes con elementos lejanos o de baja resolución.
- Las métricas para las clases "Not Hand" y "Not Hand" aparecen como -1.0, lo que sugiere que no hubo suficientes ejemplos o que la clase no fue evaluada correctamente.
- No se han publicado análisis de sesgos ni pruebas de robustez ante variaciones de iluminación, oclusión o condiciones adversas.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantías y el autor no proporciona soporte técnico.
- Al ser un fine-tuning generado automáticamente con `Trainer`, la model card es incompleta y no detalla el proceso de anotación ni la procedencia de los datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arjunraim/rt_detrv2_finetuned_trashify_box_detector_v1
- Modelo base: https://huggingface.co/PekingU/rtdetr_v2_r50vd

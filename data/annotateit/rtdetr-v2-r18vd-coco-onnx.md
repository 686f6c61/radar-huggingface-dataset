# AnnotateIt/rtdetr-v2-r18vd-coco-onnx

## Resumen

RT-DETRv2 r18vd COCO es un modelo de detección de objetos en tiempo real basado en el transformer RT-DETR (Real-Time DEtection TRansformer), desarrollado originalmente por el grupo de investigación de la Universidad de Pekín (PekingU) y publicado en CVPR 2024. Esta variante concreta, publicada por AnnotateIt, es un espejo verificado del grafo ONNX en FP32 del checkpoint oficial `PekingU/rtdetr_v2_r18vd`, sin modificaciones ni cuantización adicionales. El modelo resuelve el problema de detección de objetos de extremo a extremo sin necesidad de supresión de no máximos (NMS), lo que simplifica el pipeline de inferencia y reduce la latencia.

La arquitectura combina un backbone ResNet-18 con un transformer de detección híbrido, alcanzando un equilibrio entre precisión y velocidad. El modelo procesa imágenes de 640×640 píxeles y predice hasta 300 detecciones por imagen sobre las 80 clases del dataset COCO. Su relevancia actual radica en que ofrece una alternativa eficiente a los detectores basados en YOLO, con mejor rendimiento en escenarios de tiempo real y una implementación ONNX lista para producción en múltiples runtimes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETRv2 (backbone ResNet-18 + transformer encoder-decoder) |
| Parametros totales | 20 millones (aprox., segun configuracion r18vd) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | FP32 (grafo ONNX original); no se proporcionan versiones cuantizadas |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opsets 16, grafo `model.onnx` de 81,057,510 bytes) |

## Arquitectura y entrenamiento

RT-DETRv2 es un detector de objetos basado en transformer que sigue el paradigma de predicción de conjuntos (set prediction) de DETR. A diferencia de los detectores tradicionales que requieren NMS, este modelo predice directamente un conjunto fijo de cajas y clases (300 consultas) y las asocia con los objetos mediante emparejamiento bipartito durante el entrenamiento. La variante `r18vd` utiliza un backbone ResNet-18 con conexiones de bajo nivel (VD = Vision-aware Deformable attention) para mejorar la extracción de características a múltiples escalas.

El modelo fue entrenado en el dataset COCO (train2017) con 118k imágenes y validado en val2017. El proceso de entrenamiento incluye técnicas de aumento de datos estándar (escala aleatoria, recorte, etc.) y una pérdida combinada de clasificación (focal loss) y regresión de cajas (L1 + GIoU). No se ha aplicado RLHF ni DPO, ya que no es un modelo generativo de lenguaje. La exportación a ONNX se realizó con opset 16 y el grafo se validó con ONNX Runtime en CPU, comparando las salidas con el checkpoint original de PyTorch en una imagen real de COCO.

## Capacidades

- Detección de objetos en tiempo real: predice cajas delimitadoras y clases para hasta 300 objetos por imagen.
- Soporte de 80 clases del dataset COCO (personas, vehículos, animales, objetos cotidianos, etc.).
- Inferencia de extremo a extremo sin NMS, lo que reduce la complejidad del postprocesado.
- Entrada de imagen RGB de 640×640 píxeles, con preprocesado simple (reescalado y normalización a [0,1]).
- Salidas normalizadas en formato `cxcywh` (centro-x, centro-y, ancho, alto) que se pueden mapear a las coordenadas originales.
- Compatible con ONNX Runtime, lo que permite despliegue en CPU, GPU y dispositivos edge.
- No incluye capacidades de generación de texto, tool calling, agentes ni razonamiento multimodal.

## Casos de uso

- Vigilancia y seguridad perimetral: el modelo puede detectar personas, vehículos y objetos en tiempo real desde cámaras IP, gracias a su baja latencia y a la ausencia de NMS que simplifica el pipeline. Se integraría con un servidor de inferencia ONNX Runtime y un sistema de alertas.
- Conteo de objetos en entornos industriales: en líneas de producción, permite contar piezas o detectar defectos visuales básicos (si se entrena con clases personalizadas, aunque esta versión está limitada a COCO).
- Robótica móvil: al ser ligero (20M parámetros) y correr en CPU, puede desplegarse en robots con hardware limitado para evitar obstáculos o localizar objetivos.
- Análisis de imágenes médicas (investigación): aunque no está entrenado para dominios específicos, puede servir como base para fine-tuning en tareas de detección de estructuras anatómicas.
- Automatización de etiquetado de datos: como modelo preentrenado, puede generar anotaciones iniciales para acelerar la creación de datasets personalizados en herramientas como Label Studio o CVAT.
- Aplicaciones de realidad aumentada: la detección de objetos en tiempo real permite superponer información virtual sobre elementos del mundo real en dispositivos móviles o gafas inteligentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión (mAP) ni comparativas con otros detectores. Se sabe que el modelo base `PekingU/rtdetr_v2_r18vd` reporta en el paper original de RT-DETRv2 un mAP de aproximadamente 48.1 en COCO val2017 con una latencia de alrededor de 4 ms en GPU A100, pero estos datos no están confirmados en esta ficha y no deben tomarse como oficiales para esta versión ONNX.

## Requisitos de hardware

- VRAM estimada para inferencia: el grafo FP32 ocupa ~81 MB en disco; en memoria, con batch 1, se estima un uso de VRAM inferior a 1 GB en GPU (dependiendo del runtime y del tamaño de activaciones).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (ej. NVIDIA GTX 1050 Ti, Jetson Nano, RTX 2060) es suficiente para inferencia en tiempo real. En CPU, un procesador moderno de 4 núcleos puede alcanzar ~10-20 FPS.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU de consumo actual (RTX 3060, RTX 4090, etc.) y también en dispositivos edge como Jetson Orin.
- Opciones de despliegue: ONNX Runtime (CPU/GPU), TensorRT (mediante conversión), OpenVINO, ONNX.js para navegador, o servidores de inferencia como Triton.
- Latencia y throughput estimados: no disponibles en la información proporcionada; dependerá del hardware y del runtime.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto/Entrada | mAP COCO (aprox.) | Licencia | Formato |
|---|---|---|---|---|---|---|
| RT-DETRv2 r18vd (este) | Transformer + ResNet-18 | ~20M | 640×640 | no disponible | Apache-2.0 | ONNX |
| YOLOv8s | CNN (CSPDarknet) | ~11M | 640×640 | ~44.9 | AGPL-3.0 | PyTorch/ONNX |
| DETR ResNet-50 | Transformer + ResNet-50 | ~41M | 800×1333 | ~42.0 | Apache-2.0 | PyTorch |

La comparativa se basa en datos públicos de los modelos originales; para RT-DETRv2 no se dispone de mAP verificado en esta ficha. RT-DETRv2 destaca por su inferencia sin NMS y su menor latencia frente a DETR, mientras que YOLOv8s es más ligero pero requiere NMS.

## Limitaciones y advertencias

- El modelo está limitado a las 80 clases de COCO; no reconoce objetos fuera de ese conjunto.
- La precisión en imágenes pequeñas o muy ocluidas puede ser inferior a la de modelos más grandes (ej. RT-DETRv2 con backbone ResNet-50 o 101).
- El preprocesado requiere reescalado por estiramiento (stretch) a 640×640, lo que puede distorsionar la relación de aspecto y afectar a la detección de objetos con formas muy alargadas.
- No se han publicado métricas de rendimiento específicas para esta versión ONNX; los resultados pueden variar respecto al checkpoint original de PyTorch.
- La licencia Apache-2.0 permite uso comercial, pero exige conservar la atribución y el aviso de licencia al redistribuir.
- Este espejo no es una versión oficial de PekingU; AnnotateIt no ha modificado el grafo, pero la responsabilidad del mantenimiento recae en el publicador.
- No se proporcionan versiones cuantizadas (INT8, FP16), por lo que el despliegue en dispositivos muy limitados puede requerir conversión adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnnotateIt/rtdetr-v2-r18vd-coco-onnx
- Modelo base oficial: https://huggingface.co/PekingU/rtdetr_v2_r18vd
- Grafo ONNX de referencia: https://huggingface.co/onnx-community/rtdetr_v2_r18vd-ONNX
- Repositorio oficial del proyecto RT-DETR: https://github.com/lyuwenyu/RT-DETR
- ONNX Model Zoo: https://github.com/onnx/models

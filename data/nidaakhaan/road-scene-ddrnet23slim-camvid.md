# NidaaKhaan/road-scene-ddrnet23slim-camvid

## Resumen

El modelo `NidaaKhaan/road-scene-ddrnet23slim-camvid` es un sistema de segmentación semántica en tiempo real para escenas de conducción, basado en la arquitectura DDRNet-23-slim (Deep Dual-resolution Network). Desarrollado por NidaaKhaan, este modelo clasifica cada píxel de una imagen RGB en una de 32 categorías propias de entornos urbanos (carretera, vehículos, peatones, señalización, etc.). Está entrenado sobre el dataset CamVid, un conjunto de referencia para conducción autónoma, y destaca por su reducido tamaño (5,88 millones de parámetros) y su diseño orientado a la inferencia de baja latencia.

La relevancia de este modelo radica en su equilibrio entre precisión y velocidad: la arquitectura dual-resolution con módulo de contexto DAPPM permite capturar información global y local simultáneamente, lo que lo hace adecuado para sistemas embebidos y aplicaciones de tiempo real. Aunque su rendimiento absoluto es modesto (mIoU de 0,3334 en validación), su eficiencia computacional lo convierte en una opción interesante para prototipos y despliegues en hardware limitado. La licencia MIT facilita su uso comercial y académico sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DDRNet-23-slim (dual-resolution, DAPPM) |
| Parametros totales | 5,88 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (procesa imágenes) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo PyTorch, probablemente .pt/.pth) |

## Arquitectura y entrenamiento

DDRNet-23-slim pertenece a la familia de redes de doble resolución: procesa simultáneamente una rama de alta resolución (para detalles finos) y otra de baja resolución (para contexto global), intercambiando información mediante conexiones laterales. El módulo DAPPM (Dense Aggregation Pyramid Pooling Module) agrega características multiescala para mejorar la comprensión semántica. El modelo fue entrenado durante 50 épocas con el dataset CamVid (600 imágenes de entrenamiento, 101 de validación), utilizando una pérdida de entropía cruzada ponderada por la frecuencia inversa de cada clase, con la clase Void como índice de ignoración. El optimizador fue AdamW con programación de tasa de aprendizaje coseno. No se menciona el uso de técnicas como RLHF o DPO, al tratarse de un modelo de visión supervisado.

## Capacidades

- Segmentación semántica píxel a píxel en escenas de carretera, con 32 clases (cielo, carretera, árboles, acera, coches, edificios, ciclistas, etc.).
- Inferencia en tiempo real gracias a su arquitectura ligera (5,88 M parámetros) y diseño dual-resolution.
- Entrada de imágenes RGB de 640x640 píxeles normalizadas con estadísticas de ImageNet.
- Salida de logits por píxel para las 32 clases, permitiendo postprocesado personalizado (argmax, umbrales, etc.).
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente visual.
- No tiene capacidades multimodales más allá de la visión (sin audio, texto, etc.).

## Casos de uso

- Conducción autónoma y ADAS: el modelo puede integrarse en sistemas de percepción para identificar carretera, vehículos, peatones y señalización, proporcionando información espacial para la toma de decisiones de navegación.
- Monitorización de tráfico en infraestructuras: análisis de vídeo de cámaras fijas para contar vehículos, detectar obstáculos o evaluar el estado de la vía.
- Robótica móvil: segmentación de escenas para robots de reparto o vehículos de interior, permitiendo la detección de zonas transitables y obstáculos.
- Prototipado de sistemas de visión por computador: al ser ligero y de código abierto, sirve como base para experimentos académicos o pruebas de concepto en segmentación semántica.
- Aplicaciones de realidad aumentada: superposición de información semántica sobre el entorno (por ejemplo, resaltar carriles o señales) en tiempo real.
- Análisis de vídeo para seguridad vial: detección de infracciones (peatones en zonas peligrosas, vehículos en carriles indebidos) mediante segmentación de escenas.

## Benchmarks y rendimiento

El autor reporta un mIoU de 0,3334 en el conjunto de validación de CamVid (calculado sobre las clases presentes en la validación). A continuación se detallan los IoU por clase:

| Clase | IoU |
|---|---|
| Sky | 0,9339 |
| Road | 0,8861 |
| Tree | 0,8677 |
| Sidewalk | 0,7923 |
| Car | 0,7334 |
| Building | 0,6989 |
| Bicyclist | 0,6519 |
| Wall | 0,5241 |
| Fence | 0,5099 |
| TrafficLight | 0,4714 |
| LaneMkgsDriv | 0,4116 |
| OtherMoving | 0,3625 |
| SignSymbol | 0,2904 |
| Truck_Bus | 0,2519 |
| Pedestrian | 0,2267 |
| Child | 0,1578 |
| Misc_Text | 0,0960 |
| Column_Pole | 0,0804 |
| VegetationMisc | 0,0406 |
| CartLuggagePram | 0,0118 |
| Archway | 0,0020 |
| Animal | 0,0000 |
| LaneMkgsNonDriv | 0,0000 |
| ParkingBlock | 0,0000 |
| RoadShoulder | 0,0000 |
| SUVPickupTruck | 0,0000 |
| TrafficCone | 0,0000 |
| Bridge | N/A (ausente en validación) |
| MotorcycleScooter | N/A (ausente en validación) |
| Train | N/A (ausente en validación) |
| Tunnel | N/A (ausente en validación) |
| Void | N/A (ausente en validación) |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- No se especifican requisitos de VRAM en la documentación del modelo. Dado su tamaño (5,88 M parámetros), en FP32 ocuparía aproximadamente 23,5 MB de memoria, y en FP16 unos 11,75 MB, por lo que es viable en GPUs de gama baja o incluso en CPU.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM debería ser suficiente para inferencia; tarjetas como NVIDIA GTX 1050 Ti, RTX 2060 o superiores son adecuadas.
- Es apto para dispositivos embebidos (Jetson Nano, Raspberry Pi con acelerador) gracias a su bajo consumo de memoria y cómputo.
- Opciones de despliegue: al ser un modelo PyTorch, puede servirse con TorchServe, ONNX Runtime o convertirse a TensorRT para aceleración. También es compatible con frameworks como OpenCV DNN si se exporta a ONNX.
- No se dispone de datos de latencia o throughput medidos en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. Como referencia cualitativa, DDRNet-23-slim es significativamente más ligero que arquitecturas como DeepLabV3+ o PSPNet (que suelen superar los 20 M parámetros), pero su precisión en CamVid es inferior a la de modelos entrenados con datasets más grandes como Cityscapes. No se pueden aportar cifras concretas sin fuentes adicionales.

## Limitaciones y advertencias

- Seis clases (Animal, LaneMkgsNonDriv, ParkingBlock, RoadShoulder, SUVPickupTruck, TrafficCone) obtienen un IoU de 0,0 debido a su baja frecuencia (<0,5% de píxeles) en el conjunto de entrenamiento de 600 imágenes. Esto es una limitación de datos, no un defecto de entrenamiento.
- El modelo fue entrenado únicamente con CamVid, un dataset pequeño y con escenas limitadas a entornos urbanos de Cambridge (Reino Unido). Su generalización a otras geografías, condiciones climáticas o tipos de vía puede ser pobre.
- La resolución de entrada fija de 640x640 puede no ser óptima para todas las cámaras; se requiere redimensionado y normalización previa.
- No se han evaluado sesgos demográficos o de escenarios; el rendimiento en clases como peatones o ciclistas es bajo (IoU < 0,3), lo que limita su uso en aplicaciones críticas de seguridad.
- La licencia MIT permite uso comercial sin restricciones, pero el autor no ofrece garantías sobre el rendimiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NidaaKhaan/road-scene-ddrnet23slim-camvid
- Repositorio oficial de DDRNet (implementación de referencia): https://github.com/ydhongHIT/DDRNet
- Modelo DDRNet23-Slim en Qualcomm AI Hub: https://aihub.qualcomm.com/models/ddrnet23_slim
- Página de Hugging Face de Qualcomm para DDRNet23-Slim: https://huggingface.co/qualcomm/DDRNet23-Slim

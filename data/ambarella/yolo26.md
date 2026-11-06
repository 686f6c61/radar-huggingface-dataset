# Ambarella/YOLO26

## Resumen

YOLO26 es una familia de modelos de visión en tiempo real desarrollada por Ultralytics, distribuida en este repositorio por Ambarella en su variante YOLO26-Small (YOLO26s) para detección de objetos. El modelo está diseñado para cubrir un amplio espectro de tareas de visión por computador (detección, segmentación de instancias y semántica, estimación de profundidad, clasificación, estimación de pose y detección de objetos orientados), con un énfasis explícito en la inferencia end-to-end eficiente y el despliegue en plataformas de borde.

La innovación principal de la arquitectura es el uso de una cabeza one-to-one end-to-end que elimina la necesidad de Non-Maximum Suppression (NMS) durante la inferencia, lo que simplifica el pipeline de despliegue y reduce la latencia en producción. El modelo se distribuye con pesos entrenados sobre COCO 2017 a una resolución de entrada de 3x640x640.

Este repositorio concreto no contiene los pesos originales en formato PyTorch, sino compilaciones optimizadas para los aceleradores de visión de Ambarella (N1-655, X7, CV7, CV72 y CV75) con activaciones en fp16, lo que lo hace relevante para integradores que despliegan percepción visual en hardware embebido de bajo consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 (CNN de detección en tiempo real con cabeza one-to-one end-to-end sin NMS) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada 3x640x640) |
| Tipos de cuantizacion | Activaciones fp16; pesos en formato binario propietario para NPU Ambarella |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | no disponible |
| Formato de pesos | .bin propietario para NPU Ambarella (repo con librería PyTorch declarada) |

## Arquitectura y entrenamiento

YOLO26s es una red neuronal convolucional para detección de objetos en tiempo real, sucesora de la línea YOLO de Ultralytics. La variante Small emplea una arquitectura de detección ligera con una cabeza one-to-one end-to-end que permite obtener detecciones finales sin aplicar NMS, un paso históricamente costoso en pipelines de detección en producción. El modelo se entrenó sobre el dataset COCO 2017 con entradas de 3x640x640.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset más allá de COCO, ni sobre el uso de técnicas de alineación como RLHF o DPO (no aplicables habitualmente a modelos de visión). Tampoco se especifica el número de parámetros ni el coste computacional (FLOPs) de la variante Small. La integración con Ambarella se materializa mediante compilaciones para sus NPUs (N1-655, X7, CV7, CV72 y CV75) usando el SDK Cooper 2.5.4 y Cooper Foundry 2.3, con activaciones en fp16.

## Capacidades

- Detección de objetos en tiempo real sobre imágenes y vídeo.
- Segmentación de instancias y segmentación semántica (según la familia YOLO26; esta variante concreta se distribuye para detección).
- Estimación de profundidad.
- Clasificación de imágenes.
- Estimación de pose.
- Detección de objetos orientados (oriented object detection).
- Inferencia end-to-end sin NMS, lo que simplifica el postprocesado.
- Despliegue optimizado en aceleradores de visión Ambarella (N1-655, X7, CV7, CV72, CV75).
- No soporta tool calling, agentes ni razonamiento multi-step (no es un modelo de lenguaje).

## Casos de uso

- Percepción automotriz: detección de peatones, vehículos y señalización en tiempo real sobre las NPUs Ambarella CV7/CV72/CV75, aprovechando la inferencia sin NMS para reducir latencia en el lazo de control del vehículo.
- Vigilancia y videovigilancia inteligente: análisis continuo de múltiples cámaras en dispositivos de borde con X7 o N1-655, detectando intrusiones o eventos sin enviar vídeo a la nube.
- Robótica móvil: detección de obstáculos y objetos de interés a bordo de robots con presupuesto energético limitado, donde el formato fp16 y la compilación para NPU reducen el consumo.
- Analítica de vídeo industrial: inspección de líneas de producción para detectar defectos o piezas fuera de posición en tiempo real sobre hardware embebido.
- Sistemas de drones y cámaras inteligentes: detección a bordo con latencia mínima gracias a la eliminación del NMS y a la optimización para aceleradores de bajo consumo.
- Prototipado con PyTorch y despliegue posterior: usar los pesos originales YOLO26s de Ultralytics para entrenamiento o ajuste fino y, después, compilar con Cooper Foundry para el hardware Ambarella objetivo.
- Detección de objetos orientados en imágenes aéreas o satelitales (si se emplea la variante correspondiente de la familia YOLO26).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifican parámetros ni FLOPs).
- GPU recomendadas: no disponible para la variante PyTorch; el despliegue objetivo son las NPUs Ambarella N1-655, X7, CV7, CV72 y CV75.
- Cabe en GPU consumer: no disponible.
- Opciones de despliegue: SDK Cooper 2.5.4 y Cooper Foundry 2.3 para Ambarella; pesos originales YOLO26s vía Ultralytics (fork de Ambarella) para PyTorch.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLO26s (este repo) | no disponible | 3x640x640 | Detección de objetos | no disponible | Pesos .bin para NPU Ambarella |
| YOLOv8s (Ultralytics) | no disponible en esta ficha | 640x640 | Detección de objetos | AGPL-3.0 (habitual en Ultralytics) | Pesos PyTorch, ONNX, etc. |
| YOLO11s (Ultralytics) | no disponible en esta ficha | 640x640 | Detección de objetos | AGPL-3.0 (habitual en Ultralytics) | Pesos PyTorch, ONNX, etc. |

No se dispone de datos de rendimiento comparativo en la información proporcionada para establecer diferencias cuantitativas con YOLOv8s o YOLO11s.

## Limitaciones y advertencias

- Los pesos incluidos están compilados para NPUs Ambarella concretas; no son directamente utilizables en GPU o CPU convencionales.
- La licencia no está declarada en el repositorio, lo que impide confirmar si el uso comercial está permitido; conviene verificar la licencia de Ultralytics (habitualmente AGPL-3.0) antes de desplegar.
- Entrenado sobre COCO 2017: puede presentar sesgos de dominio y clases limitadas a las 80 categorías de COCO.
- Riesgo de falsos positivos y negativos en condiciones de iluminación adversa, oclusión o dominios visuales alejados del entrenamiento.
- No es un modelo de lenguaje: no soporta texto, tool calling ni razonamiento; las expectativas deben ceñirse a tareas de visión.
- El repositorio tiene un tamaño de 0.0 GB y 11 descargas, lo que sugiere que los pesos pueden no estar completos o que el artefacto principal son los binarios compilados.
- No se especifican métricas de precisión (mAP) ni latencias medidas en el hardware objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Ambarella/YOLO26
- Paper: https://arxiv.org/abs/2606.03748
- Fork de Ultralytics por Ambarella: https://github.com/Ambarella-Inc/ultralytics
- Pesos originales YOLO26s: https://github.com/ultralytics/assets/releases/download/v8.4.0/yolo26s.pt
- Dataset COCO: https://cocodataset.org/#home

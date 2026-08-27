# OpenExploer/detr3d_efficientnetb3

## Resumen

Detr3D (EfficientNet-b3) es un modelo de detección 3D de objetos basado en la arquitectura DETR3D, adaptado para ejecutarse en plataformas de hardware Horizon (J6M, J6P). Desarrollado por el usuario OpenExploer, este modelo combina un backbone EfficientNet-b3 con un cuello BiFPN para extraer características multiescala de imágenes de seis cámaras, y un transformador DETR3D que proyecta características 2D al espacio 3D y predice cajas de detección tridimensionales mediante consultas aprendibles. El modelo está diseñado específicamente para tareas de percepción en conducción autónoma, donde la entrada son seis vistas de cámaras y la salida son cajas 3D con clase, centro, tamaño y orientación.

La relevancia de este modelo radica en su optimización para despliegue en hardware embebido de Horizon Robotics, con métricas de latencia y rendimiento publicadas para las plataformas J6M y J6P. A diferencia del DETR3D original, que utiliza un backbone diferente, esta variante emplea EfficientNet-b3, lo que puede ofrecer un mejor equilibrio entre precisión y eficiencia computacional. El repositorio incluye métricas de precisión (NDS y mAP) para la configuración J6M, así como métricas de rendimiento (latencia, FPS y uso de memoria) para J6M y J6P. El modelo se distribuye con licencia "other", sin especificar términos concretos, y el tamaño del repositorio es de 0.9 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DETR3D con backbone EfficientNet-b3, cuello BiFPN, cabeza Detr3dHead + Detr3dTransformer + Detr3dDecoder |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (se mencionan modos float, calibration, qat, hbm en las metricas, pero no se especifican formatos de cuantizacion) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | other (sin especificar terminos) |
| Formato de pesos | no disponible (el repositorio contiene 0.9 GB, pero no se indica el formato; probablemente safetensors o binarios, pero no confirmado) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma DETR3D, que aplica el enfoque DETR a la deteccion 3D. El backbone EfficientNet-b3 (con `include_top=False`, activacion ReLU y sin bloques SE) extrae caracteristicas de las seis imagenes de camara. El cuello BiFPN (piramide de caracteristicas bidireccional, con `stack=3`, `out_channels=256` y `num_outs=5`) fusiona caracteristicas multiescala. La transformacion de vistas proyecta caracteristicas 2D al espacio 3D, y el Detr3dTransformer muestrea iterativamente caracteristicas multivista con consultas aprendibles (900 consultas) para predecir cajas 3D. La perdida combina FocalLoss para clasificacion y L1Loss para regresion de cajas, con emparejamiento hungaro durante el entrenamiento (Detr3dTarget). El modelo produce hasta 300 detecciones finales tras el postprocesado.

No se proporcionan detalles sobre el dataset de entrenamiento, el numero de tokens (no aplica), ni si se uso RLHF o DPO (no aplica a un modelo de vision). La model card indica que el backbone es EfficientNet-b3, mientras que el repositorio oficial de DETR3D usa un backbone diferente, lo que sugiere una adaptacion especifica para este despliegue. Las metricas de precision se reportan para la configuracion `march = March.NASH_M` (J6M), con valores de NDS 0.3357 y mAP 0.2694 en float, y ligeras variaciones en modos de calibracion, QAT y HBM.

## Capacidades

- Deteccion 3D de objetos en escenas de conduccion autonomica a partir de seis camaras multivista.
- Salida de cajas 3D con clase (10 clases), centro, tamaño y orientacion.
- Soporte para multiples modos de despliegue: float, calibracion, QAT (quantization-aware training) y HBM (high bandwidth memory), segun las metricas reportadas.
- Optimizado para hardware Horizon (J6M, J6P) con latencia y FPS medidos.
- Capacidad de procesar imagenes de alta resolucion (entrada de 512x1408 por camara, con resize desde 900x1600).
- No soporta generacion de texto, tool calling, agentes ni capacidades multilingues, al ser un modelo puramente visual.

## Casos de uso

- Percepcion 3D en vehiculos autonomos: el modelo procesa las seis camaras del vehiculo y genera detecciones 3D de objetos (vehiculos, peatones, etc.) en tiempo real, con una latencia de 21.88 ms en J6M y 15.22 ms en J6P, adecuada para sistemas de asistencia a la conduccion.
- Sistemas avanzados de asistencia al conductor (ADAS): integrado en plataformas Horizon, puede alimentar funciones como frenado de emergencia o alerta de cambio de carril, gracias a su salida de cajas 3D con orientacion.
- Robotica movil: el modelo puede adaptarse a robots con multiples camaras para navegacion y evitacion de obstaculos en entornos 3D, aprovechando su capacidad de fusion multivista.
- Vigilancia y monitorizacion de trafico: desplegado en camaras fijas multiples, puede detectar y rastrear objetos en 3D en intersecciones o carreteras, aunque su diseño esta pensado para plataformas embebidas.
- Investigacion en deteccion 3D: sirve como base para experimentos con backbone EfficientNet en el marco DETR3D, permitiendo comparar rendimiento con otras variantes.
- Prototipado rapido en hardware Horizon: los desarrolladores pueden usar este modelo como punto de partida para aplicaciones de percepcion 3D en los SoC J6, gracias a las metricas de rendimiento publicadas.

## Benchmarks y rendimiento

La model card proporciona metricas de precision para la configuracion J6M (March.NASH_M) en diferentes modos:

| Modo | NDS | mAP |
|---|---|---|
| float | 0.3357 | 0.2694 |
| calibration | 0.3299 | 0.2618 |
| qat | 0.338 | 0.2688 |
| hbm | 0.337 | 0.2683 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible. Las metricas de rendimiento (latencia, FPS, memoria) se detallan en la seccion de requisitos de hardware.

## Requisitos de hardware

- Plataformas objetivo: SoCs Horizon J6M y J6P (tambien se menciona J6B, pero sin rendimiento disponible).
- Latencia medida (single-core single-thread): 21.88 ms en J6M, 15.22 ms en J6P.
- FPS medido (single-core eight-thread): 46.43 en J6M, 253.24 en J6P.
- Uso de memoria DDR (pico): 97.60 MB en J6M, 94.60 MB en J6P.
- No se especifican requisitos para GPU de proposito general (como NVIDIA o AMD); el modelo esta claramente orientado a hardware Horizon.
- Opciones de despliegue: no se mencionan frameworks como vLLM, llama.cpp u Ollama (no aplica a un modelo de vision). Se infiere que el despliegue se realiza mediante el stack de Horizon (heal, hbdk4-compiler, horizon_plugin_pytorch), segun la version indicada en la model card.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar este modelo con alternativas de la misma categoria (otros detectores 3D con backbone EfficientNet o variantes de DETR3D). El modelo original DETR3D (WangYueFt/detr3d) usa un backbone diferente (ResNet), pero no se tienen datos de rendimiento comparables en las mismas condiciones. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Licencia "other" sin especificar: no se detallan los terminos de uso, lo que puede limitar el uso comercial o la redistribucion. Se recomienda contactar con el autor para aclarar la licencia.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de contexto (al ser un modelo de vision, estos conceptos no aplican directamente, pero podria haber sesgos en las clases detectadas segun el dataset de entrenamiento, que no se especifica).
- El modelo esta optimizado para hardware Horizon; su ejecucion en otras plataformas (GPU NVIDIA, CPU) no esta documentada y podria requerir adaptaciones significativas.
- Las metricas de precision (NDS 0.3357, mAP 0.2694) son relativamente bajas en comparacion con detectores 3D modernos, pero no se dispone de comparaciones directas.
- El rendimiento en J6B no esta disponible, por lo que no se puede garantizar su funcionamiento en esa plataforma.
- No se especifica el formato de los pesos ni si se incluyen scripts de inferencia o ejemplos de uso, lo que dificulta la reproducibilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OpenExploer/detr3d_efficientnetb3
- Repositorio oficial DETR3D: https://github.com/WangYueFt/detr3d
- Paper DETR3D: https://arxiv.org/abs/2110.06922
- Documentacion de EfficientNet en HuggingFace: https://huggingface.co/docs/transformers/model_doc/efficientnet
- Referencia de EfficientNetB3 en TensorFlow: https://www.tensorflow.org/api_docs/python/tf/keras/applications/EfficientNetB3
- Referencia de EfficientNetB3 en Torchvision: https://docs.pytorch.org/vision/main/models/generated/torchvision.models.efficientnet_b3.html

# OpenExploer/efficientnet

## Resumen

EfficientNet-B0 es un modelo de clasificación de imágenes basado en la arquitectura EfficientNet, desarrollado originalmente por Google Research y adaptado aquí por OpenExploer para su despliegue en hardware BPU (unidad de procesamiento de visión) de Horizon Robotics. Esta variante concreta utiliza activación ReLU y desactiva el bloque SE (squeeze-and-excitation), una modificación orientada a facilitar la cuantización y la inferencia eficiente en chips como el J6M y J6P de Horizon.

El modelo resuelve el problema de clasificación de imágenes en 1000 categorías (estándar ImageNet) con un equilibrio entre precisión y eficiencia computacional. Su relevancia actual radica en que está específicamente preparado para entornos de edge computing y despliegue en dispositivos embebidos, donde la latencia y el consumo de memoria son críticos. Las métricas publicadas muestran una precisión top-1 de 0,7491 en punto flotante y una latencia de 0,40 ms en el chip J6M, lo que lo convierte en una opción viable para aplicaciones de visión en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (MBConv, ReLU, sin SE Block) |
| Parametros totales | no disponible (referencia: ~5,3 M según paper original) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | float, calibracion, QAT (no disponible), HBM (para BPU) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | other (sin especificar) |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

EfficientNet-B0 se basa en bloques MBConv (mobile inverted bottleneck convolution), escalados conjuntamente en profundidad, anchura y resolucion mediante el metodo de compound scaling propuesto en el paper original. Esta configuracion concreta emplea activacion ReLU en lugar de SiLU y desactiva el bloque SE, una decision de diseno que mejora la compatibilidad con la cuantizacion para BPU, aunque puede suponer una ligera perdida de precision respecto a la variante estandar.

El modelo tiene una entrada de imagen RGB de 224x224 píxeles y una salida de logits de 1000 clases. La funcion de perdida utilizada es cross-entropy con label smoothing (CEWithLabelSmooth). No se dispone de informacion detallada sobre el dataset de entrenamiento ni sobre el proceso de entrenamiento especifico de esta adaptacion; se asume que sigue el esquema clasico de EfficientNet sobre ImageNet, pero no se confirma en la documentacion proporcionada.

## Capacidades

- Clasificacion de imagenes en 1000 categorias (estandar ImageNet).
- Inferencia de baja latencia y alto rendimiento en hardware BPU de Horizon (J6M, J6P).
- Soporte de cuantizacion para despliegue en dispositivos embebidos (calibracion y HBM).
- Sin capacidades de generacion de texto, tool calling, agentes ni procesamiento de lenguaje natural.
- No soporta vision multimodal mas alla de la clasificacion de imagenes estatica.

## Casos de uso

- Control de calidad industrial: clasificacion de piezas o productos en lineas de fabricacion mediante camaras, aprovechando la baja latencia (0,40 ms en J6M) para inspeccion en tiempo real.
- Vision en dispositivos embebidos: integracion en camaras inteligentes o sistemas de vigilancia que requieren clasificacion local sin conexion a la nube, gracias a su compatibilidad con BPU y su bajo consumo de memoria (8,9 MB de pico DDR).
- Clasificacion de imagenes medicas: apoyo al diagnostico por imagen (por ejemplo, radiografias) en entornos con recursos limitados, donde la precision top-1 de 0,7491 es aceptable para tareas de cribado.
- Agricultura de precision: identificacion de especies vegetales o deteccion de plagas a partir de fotografias capturadas por drones o sensores de campo, con despliegue en hardware de bajo coste.
- Sistemas de recomendacion visual: etiquetado automatico de catalogos de productos en plataformas de comercio electronico, procesando imagenes de forma eficiente en servidores o en el borde.
- Robotica movil: clasificacion de objetos en tiempo real para navegacion o manipulacion, donde la latencia de 0,35 ms en J6P permite respuestas rapidas en entornos dinamicos.

## Benchmarks y rendimiento

La model card proporciona metricas de precision y rendimiento para la configuracion J6M (March.NASH_M). No se incluyen resultados de benchmarks estandar como ImageNet top-1/top-5 en la informacion disponible, pero se reportan los siguientes datos:

| Metrica | float | calibracion | QAT | HBM |
|---|---|---|---|---|
| Accuracy (top-1) | 0,7491 | 0,7433 | — | 0,7436 |
| TopKAccuracy(5) | — | — | — | — |

Rendimiento medido con un solo nucleo (ocho hilos para FPS, un hilo para latencia):

| March | Latencia (ms) | FPS | Memoria (pico DDR) |
|---|---|---|---|
| J6M | 0,40 | 4938,45 | 8,90 MB |
| J6P | 0,35 | 10480,93 | 9,00 MB |
| J6B | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- Optimizado para BPU de Horizon Robotics: J6M (latencia 0,40 ms, 4938 FPS) y J6P (latencia 0,35 ms, 10480 FPS).
- Memoria pico DDR: 8,90 MB (J6M) y 9,00 MB (J6P), lo que permite su ejecucion en dispositivos con poca RAM.
- No se especifican requisitos de VRAM para GPU; al ser un modelo de vision pequeno, es probable que quepa en GPUs de consumo (por ejemplo, RTX 3060 o superiores), pero no se proporcionan datos oficiales.
- Opciones de despliegue: la documentacion menciona el uso de HEAL (heal 0.0.2), hbdk4-compiler 4.11.11 y horizon_plugin_pytorch 3.3.10, lo que indica un flujo de trabajo especifico para el ecosistema Horizon. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Para uso en GPU estandar, se podria cargar con PyTorch o TensorFlow, pero no se ofrecen metricas de rendimiento en ese entorno.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la informacion proporcionada. Como referencia cualitativa, EfficientNet-B0 es comparable a otros modelos de clasificacion ligera como MobileNetV2 o ResNet-18, pero con un mejor equilibrio precision/eficiencia segun el paper original. Sin embargo, esta adaptacion concreta (ReLU, sin SE) puede tener una precision ligeramente inferior a la variante estandar. No se pueden aportar cifras concretas de comparacion sin datos adicionales.

## Limitaciones y advertencias

- La licencia es "other", sin especificar los terminos exactos; se recomienda revisar la documentacion del autor antes de un uso comercial.
- La precision top-1 (0,7491 en float) es inferior a la de modelos mas grandes o a la de EfficientNet-B0 estandar con SE, por lo que no es adecuado para tareas que requieran alta exactitud.
- No se proporciona informacion sobre sesgos del modelo ni sobre su comportamiento en dominios fuera de ImageNet; es probable que presente sesgos inherentes al dataset de entrenamiento original.
- La adaptacion esta pensada exclusivamente para hardware BPU de Horizon; su uso en otras plataformas puede requerir reentrenamiento o ajustes de cuantizacion.
- No se han publicado resultados de benchmarks estandar (por ejemplo, ImageNet top-5) en la informacion disponible, lo que dificulta una evaluacion comparativa rigurosa.
- El modelo no soporta tareas de lenguaje natural, vision multimodal ni generacion de contenido; su unica funcion es la clasificacion de imagenes.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/OpenExploer/efficientnet
- Repositorio oficial de EfficientNet (TensorFlow TPU): https://github.com/tensorflow/tpu/tree/master/models/official/efficientnet
- Paper original: https://arxiv.org/abs/1905.11946
- Documentacion de EfficientNet en HuggingFace Transformers: https://huggingface.co/docs/transformers/model_doc/efficientnet
- Referencia de EfficientNet en Torchvision: https://docs.pytorch.org/vision/main/models/efficientnet.html

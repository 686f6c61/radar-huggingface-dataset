# OpenExploer/unet_mobilenetv1

## Resumen

El modelo `OpenExploer/unet_mobilenetv1` es una red neuronal de segmentación semántica que combina una arquitectura UNet con un backbone MobileNetV1. Desarrollado por OpenExploer, está diseñado específicamente para su despliegue en plataformas de hardware Horizon (march J6M, J6P y J6B), orientadas a sistemas embebidos de visión por computador. El modelo procesa imágenes de alta resolución (1024×2048 píxeles) y produce mapas de segmentación de 19 clases, con una salida multiescala que permite supervisión conjunta durante el entrenamiento.

Su relevancia radica en su eficiencia computacional: emplea convoluciones separables en profundidad tanto en el encoder como en el decoder, lo que reduce drásticamente el número de operaciones y parámetros frente a arquitecturas convolucionales estándar. Las métricas publicadas muestran una latencia de 1,13 ms y un throughput de 1115,63 FPS en la configuración J6M, lo que lo hace adecuado para aplicaciones en tiempo real en dispositivos con recursos limitados. No se proporcionan detalles sobre el conjunto de datos de entrenamiento ni sobre el proceso de optimización, más allá de la función de pérdida SoftmaxFocalLoss.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet encoder-decoder con backbone MobileNetV1 (alpha=0.25) y decoder DwUnet con convoluciones separables en profundidad |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen 1×3×1024×2048) |
| Tipos de cuantizacion | no disponible (se mencionan modos float, calibration, qat y hbm en las metricas, pero sin especificar formatos) |
| Idiomas soportados | no disponible (modelo de vision, no procesa texto) |
| Licencia | other (no se especifican condiciones concretas) |
| Formato de pesos | no disponible (el repositorio tiene 0.1 GB, pero no se indica el formato) |

## Arquitectura y entrenamiento

La arquitectura sigue el esquema clasico de UNet: un encoder MobileNetV1 (con factor de anchura alpha=0.25 y sin cabeza de clasificacion) extrae caracteristicas multiescala con strides 4, 8, 16, 32 y 64. El decoder, denominado `DwUnet`, realiza un upsampling nivel a nivel mediante convoluciones separables en profundidad y fusiona los mapas de caracteristicas del encoder. La cabeza de segmentacion `SegHead` produce logits de segmentacion en cinco escalas (stride 4, 8, 16, 32 y 64) durante el entrenamiento, pero en despliegue solo exporta el resultado argmax de la escala de mayor resolucion (stride 4).

La funcion de perdida es `SoftmaxFocalLoss`, ponderada por escala, que mitiga el desequilibrio de clases. La normalizacion de entrada convierte la imagen de BGR a YUV444 y aplica `Normalize(mean=128, std=128)`, seguida de una division en piramide multiescala mediante `scale_factors`. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas como RLHF o DPO, ya que se trata de un modelo de vision supervisado de forma clasica.

## Capacidades

- Segmentacion semantica de imagenes de alta resolucion (1024×2048) en 19 clases predefinidas.
- Salida multiescala (5 niveles) que permite supervision auxiliar durante el entrenamiento y seleccion de la escala de mayor resolucion en inferencia.
- Eficiencia computacional gracias al uso de convoluciones separables en profundidad en todo el modelo, lo que reduce parametros y MACs frente a convoluciones estandar.
- Optimizado para despliegue en hardware Horizon (J6M, J6P, J6B) con soporte para modos float, calibracion, QAT y HBM, segun las metricas publicadas.
- No soporta generacion de texto, tool calling, agentes ni capacidades multimodales mas alla de la vision.

## Casos de uso

- Segmentacion de escenas urbanas para vehiculos autonomos: el modelo procesa imagenes de camara a 1024×2048 y produce mapas de 19 clases (tipicamente carretera, vehiculos, peatones, etc.), con latencia de 1,13 ms en J6M, adecuada para sistemas de asistencia a la conduccion en tiempo real.
- Inspeccion industrial automatizada: puede segmentar defectos o componentes en imagenes de alta resolucion, aprovechando su bajo consumo de memoria (15,80 MB en J6M) para integrarse en equipos de vision embebidos.
- Analisis de imagenes medicas: aunque no se ha entrenado especificamente para ello, la arquitectura UNet es comun en segmentacion de organos o lesiones; el modelo podria adaptarse con fine-tuning si se dispone de datos medicos.
- Robotica movil: su alto throughput (1115 FPS en J6M) permite la segmentacion en tiempo real para navegacion y evitacion de obstaculos en plataformas con recursos limitados.
- Vigilancia y seguridad: segmentacion de personas y objetos en videovigilancia, con capacidad de procesar multiples flujos de video gracias a su baja latencia.
- Agricultura de precision: segmentacion de cultivos, malezas o areas de interes en imagenes aereas o de drones, donde la eficiencia energetica es critica.

## Benchmarks y rendimiento

La informacion proporcionada incluye metricas de precision y rendimiento medidas con la configuracion `March.NASH_M` (J6M) y las versiones de software HEAL 0.0.2, hbdk4-compiler 4.11.11 y horizon_plugin_pytorch 3.3.10.

| March | Metrica | float | calibration | qat | hbm |
|---|---|---|---|---|---|
| J6M | MeanIOU | 0.6774 | 0.646 | 0.6707 | 0.6721 |

| March | Latencia (ms) | FPS | Uso de memoria (pico DDR) |
|---|---|---|---|
| J6M | 1.13 | 1115.63 | 15.80 |
| J6P | 0.84 | 6147.35 | 15.80 |
| J6B | 3.61 | 327.17 | 13.00 |

No se han publicado resultados comparativos con otros modelos de segmentacion en la informacion disponible.

## Requisitos de hardware

- El modelo esta disenado para ejecutarse en los procesadores Horizon J6M, J6P y J6B, que son SoC embebidos para vision por computador.
- En J6M (configuracion de un solo nucleo y ocho hilos) alcanza 1115,63 FPS con una latencia de 1,13 ms y un uso de memoria DDR de 15,80 MB.
- En J6P (un solo nucleo y un solo hilo) la latencia es de 0,84 ms y el throughput de 6147,35 FPS, con el mismo consumo de memoria.
- En J6B la latencia sube a 3,61 ms y el throughput baja a 327,17 FPS, con 13,00 MB de memoria.
- No se proporcionan requisitos para GPUs convencionales (NVIDIA, AMD) ni para despliegue en CPU generica. El modelo esta claramente orientado a hardware Horizon, por lo que su uso fuera de ese ecosistema requeriria conversion y posiblemente reentrenamiento.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (segmentacion semantica con UNet y MobileNetV1) dentro de los datos proporcionados. No se puede establecer una comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- No se ha publicado informacion sobre el conjunto de datos de entrenamiento, por lo que se desconocen posibles sesgos en las clases segmentadas o en la distribucion de imagenes.
- La licencia "other" no especifica condiciones de uso comercial, redistribucion o modificacion; es necesario contactar con el autor para aclarar los terminos.
- El modelo esta optimizado exclusivamente para hardware Horizon; su ejecucion en otras plataformas puede requerir conversion de formato y podria degradar el rendimiento o la precision.
- No se proporcionan detalles sobre la robustez frente a condiciones adversas (iluminacion, oclusiones, etc.) ni sobre la tasa de error en clases minoritarias.
- Al ser un modelo de segmentacion, no es adecuado para tareas de generacion de texto, razonamiento o interaccion conversacional.
- La ausencia de informacion sobre el proceso de entrenamiento (epocas, optimizador, regularizacion) impide evaluar la reproducibilidad o la posibilidad de fine-tuning en otros dominios.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenExploer/unet_mobilenetv1
- Paper de MobileNetV1: https://arxiv.org/abs/1704.04861
- Paper de UNet: https://arxiv.org/abs/1505.04597
- Repositorio oficial de PyTorch Vision (implementacion de MobileNetV1): https://github.com/pytorch/vision

# OpenExploer/pointpillars

## Resumen

PointPillars es un modelo de deteccion de objetos 3D sobre nubes de puntos LiDAR, originalmente propuesto por Alex H. Lang et al. en 2018. Esta implementacion concreta, publicada por OpenExploer, es una version de despliegue optimizada para los chips de la familia Horizon Journey 6 (J6), que incluye el proceso completo de voxelizacion, extraccion de caracteristicas, backbone, cabeza de deteccion y post-procesado en un unico grafo de inferencia. El modelo esta especializado en la deteccion de la clase "Car" y esta pensado para aplicaciones de conduccion autonoma y robotica.

La relevancia de esta publicacion radica en que no es un checkpoint de entrenamiento generico, sino un paquete de despliegue listo para compilar con el toolchain de Horizon (hbdk4-compiler) y ejecutar en los aceleradores J6M, J6P y J6B. Incluye metricas de precision (3D AP) y de rendimiento (latencia, FPS, uso de memoria) medidas sobre el hardware objetivo, lo que permite evaluar rapidamente su viabilidad en sistemas embebidos de automocion. El repositorio tiene un tamano de 0.2 GB y no presenta descargas ni likes en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointPillars (PillarFeatureNet + PointPillarScatter + SECONDNeck + PointPillarsHead) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision 3D, no procesa secuencias de texto) |
| Tipos de cuantizacion | float, calibration, qat, hbm (segun tabla de precision del fabricante) |
| Idiomas soportados | no aplica |
| Licencia | other (no especificada en detalle) |
| Formato de pesos | no disponible (el repo contiene el grafo de despliegue para hbdk4-compiler) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseno original de PointPillars: las nubes de puntos se voxelizan en "pilares" (pillars) con un rango de deteccion de `[0, -39.68, -3, 69.12, 39.68, 1]` metros y un tamano de voxel de `[0.16, 0.16, 4]` metros, con un maximo de 100 puntos por voxel y 12000 voxeles. El `PillarFeatureNet` con 64 filtros aprende caracteristicas de cada pilar mediante un MLP y max-pooling, que luego se dispersan en un pseudo-imagen de `H×W×64` mediante `PointPillarScatter`. El cuello `SECONDNeck` es un FPN estilo SECOND con capas de downsampling de canales `[64, 128, 256]` y strides `[2, 2, 2]`, y capas de upsampling de canales `[128, 128, 128]` con strides `[1, 2, 4]`, produciendo tres escalas concatenadas de 384 canales.

La cabeza de deteccion `PointPillarsHead` realiza clasificacion, regresion de cajas 3D y clasificacion de direccion. El entrenamiento usa supervision conjunta con FocalLoss (alpha=0.25, gamma=2.0) para clasificacion, SmoothL1Loss (beta=1/9) para regresion de cajas y CrossEntropyLoss para direccion, con pesos de 1.0, 2.0 y 0.2 respectivamente. El post-procesado incluye NMS con umbral IoU de 0.5, umbral de score de 0.4, y un maximo de 100 detecciones por imagen. La entrada es una nube de puntos LiDAR de un solo frame con forma `(N, 4)` donde las 4 dimensiones son `[x, y, z, intensity]`, y en despliegue se rellena a 150000 puntos.

## Capacidades

- Deteccion de objetos 3D en nubes de puntos LiDAR, especificamente para la clase "Car".
- Regresion de cajas 3D con orientacion: salida `(x, y, z, w, l, h, θ)` mas score y direccion.
- Voxelizacion y pre-procesado de nubes de puntos integrados en el grafo de despliegue.
- Post-procesado con NMS incluido en el grafo, sin necesidad de codigo externo.
- Soporte de cuantizacion QAT y calibracion para despliegue eficiente en hardware Horizon J6.
- Optimizado para inferencia en tiempo real en chips embebidos de la familia J6 (J6M, J6P, J6B).
- No soporta generacion de texto, tool calling, agentes, ni capacidades multimodales fuera de LiDAR.

## Casos de uso

- Conduccion autonoma en autopista: el modelo detecta vehiculos en el carril y adyacentes usando un unico frame LiDAR, con una latencia de 22.52 ms en J6M, suficiente para planificacion de maniobras a alta velocidad.
- Sistemas ADAS de nivel 2+: integrable en unidades de computo embebidas para frenado de emergencia y control de crucero adaptativo, gracias a su soporte para cuantizacion QAT que reduce el uso de memoria a 55.90 MB.
- Robotica movil en entornos industriales: deteccion de vehiculos y obstaculos en almacenes automatizados, donde el bajo consumo de memoria permite ejecutar el modelo junto a otros modulos de percepcion en el mismo SoC.
- Monitorizacion de trafico en infraestructuras: despliegue en camaras con LiDAR fijo para conteo y seguimiento de vehiculos en cruces, usando el modo de compilacion con `input_source=["ddr"]` para leer nubes de puntos desde memoria.
- Flotas de vehiculos de reparto autonomos: el modelo puede ejecutarse en el chip J6P con 344.88 FPS, permitiendo procesar multiples frames por segundo para seguimiento temporal de objetos.
- Investigacion en deteccion 3D: sirve como punto de partida para experimentar con el toolchain de Horizon y comparar el rendimiento de PointPillars frente a otros detectores en hardware embebido.

## Benchmarks y rendimiento

La tabla siguiente recoge las metricas de precision y rendimiento publicadas en la model card, medidas con `march = March.NASH_M` (J6M) para la precision y con la metodologia indicada (FPS con single-core eight-thread, latencia con single-core single-thread, memoria como pico de uso DDR).

| March | Latencia (ms) | FPS | Memoria (MB) | 3D AP (Car) |
|---|---|---|---|---|
| J6M | 22.52 | 213.58 | 55.90 | 0.7731 (float) |
| J6P | 20.43 | 344.88 | 55.90 | no disponible |
| J6B | 1650.03 | 1.99 | 53.00 | no disponible |

Precision adicional en J6M: calibracion 0.7569, QAT 0.7709, HBM 0.7707. No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- Chips objetivo: Horizon Journey 6 (J6M, J6P, J6B). El modelo no esta pensado para GPUs de proposito general.
- Memoria DDR: pico de 55.90 MB en J6M/J6P y 53.00 MB en J6B, muy contenido para un detector 3D.
- Latencia: 22.52 ms en J6M, 20.43 ms en J6P, 1650.03 ms en J6B (medida con un solo nucleo y un solo hilo).
- Throughput: 213.58 FPS en J6M, 344.88 FPS en J6P, 1.99 FPS en J6B (medido con un solo nucleo y ocho hilos).
- Despliegue: requiere el toolchain de Horizon (hbdk4-compiler 4.11.11, horizon_plugin_pytorch 3.3.10, HEAL 0.0.2). No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Compilacion: usa `enable_vpu=True` y `input_source=["ddr"]` para leer la nube de puntos desde memoria DDR.

## Comparativa con modelos similares

| Modelo | Backbone | Clases | Precision (3D AP Car) | Hardware objetivo | Licencia |
|---|---|---|---|---|---|
| PointPillars (OpenExploer) | PointPillarScatter + SECONDNeck | Car | 0.7731 (J6M, float) | Horizon J6 | other |
| SECOND (original) | VoxelNet + FPN | Multi-clase | no disponible | GPU | Apache 2.0 |
| VoxelNet | Voxel Feature Encoding | Multi-clase | no disponible | GPU | MIT |

No se dispone de datos de rendimiento comparativo en los mismos chips para SECOND o VoxelNet en la informacion proporcionada. La comparativa se limita a la arquitectura y al enfoque de despliegue.

## Limitaciones y advertencias

- El modelo solo detecta la clase "Car"; no es util para peatones, ciclistas u otros objetos sin reentrenamiento.
- La licencia "other" no especifica restricciones claras; hay que contactar con el autor o verificar el repositorio original antes de uso comercial.
- El despliegue esta limitado a hardware Horizon J6; no se proporcionan pesos en formatos estandar como ONNX o TensorRT.
- La entrada se rellena a 150000 puntos, lo que puede aumentar la latencia si la nube real es mucho menor.
- No hay informacion sobre el dataset de entrenamiento ni el proceso de entrenamiento (solo se menciona KITTI-3DObject en la documentacion de Horizon, no en la model card).
- El rendimiento en J6B es muy pobre (1.99 FPS), lo que lo hace inadecuado para aplicaciones en tiempo real en ese chip.
- No se han publicado resultados de sesgos, robustez frente a condiciones adversas (lluvia, niebla) ni evaluacion en datasets fuera de KITTI.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenExploer/pointpillars
- Repositorio oficial (segundo.pytorch): https://github.com/nutonomy/second.pytorch
- Paper original: https://arxiv.org/abs/1812.05784v1
- Documentacion de despliegue en Horizon J6: https://developer.horizon.auto/blog/10388
- Tutorial de entrenamiento PointPillars en Horizon Open Explorer: https://developer.d-robotics.cc/api/v1/fileData/horizon_j5_open_explorer_en_doc/hat/source/examples/pointpillars.html
- Implementacion PyTorch de referencia (Waymo): https://github.com/m-mcninch/pointpillars
- Implementacion CUDA de NVIDIA: https://github.com/NVIDIA-AI-IOT/CUDA-PointPillars
- Documentacion de PointPillars en NVIDIA Tao Toolkit: https://docs.nvidia.com/tao/tao-toolkit/latest/text/cv_finetuning/pytorch/point_cloud/pointpillars.html

# harphool17/tumtraf-centerpoint-ep180

## Resumen

El modelo `harphool17/tumtraf-centerpoint-ep180` es un detector de objetos 3D basado exclusivamente en LiDAR, desarrollado por harphool singh bajdoliya para el desafío DriveX 2026, donde obtuvo el tercer puesto. A diferencia de otros sistemas de fusión multimodal, este modelo ignora por completo las cámaras y se apoya únicamente en nubes de puntos láser, lo que le permite mantener un rendimiento perfecto en la detección de motocicletas (AP 1.0) incluso en condiciones de iluminación adversas como deslumbramiento solar o sombras. El modelo se entrenó con el framework OpenPCDet y emplea una arquitectura basada en CenterPoint, con un voxel feature encoder (MeanVFE) y una cabeza de detección centrada en objetos (CenterHead) con agrupación de clases por tamaño.

Su relevancia radica en demostrar que un enfoque puramente geométrico basado en LiDAR puede complementar eficazmente a los modelos de cámara, cubriendo los huecos que estos dejan en la detección de objetos metálicos. El checkpoint final (`centerpoint_ep180.pth`, 96 MB) se seleccionó por su puntuación perfecta en motocicletas y se utilizó para rellenar de forma quirúrgica las detecciones de coches, furgonetas y remolques que el modelo de cámara no detectaba. El modelo está diseñado para el dataset TUMTraf, un conjunto de datos de tráfico real en autopistas con múltiples estaciones de sensores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CenterPoint (deteccion 3D basada en centros) con MeanVFE y CenterHead |
| Parametros totales | no disponible (checkpoint de 96 MB en formato PyTorch) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision 3D, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura CenterPoint, un detector 3D basado en centros que predice centros de objetos en una vista cenital (Bird's Eye View, BEV). El pipeline de procesamiento comienza con un MeanVFE (Voxel Feature Encoder) que comprime los puntos 3D dentro de cada voxel en un valor medio, reduciendo la densidad de la nube de puntos. Posteriormente, una capa de `HeightCompression` con 384 características BEV transforma el espacio 3D en un mapa de calor 2D.

La cabeza de detección es un `CenterHead` con tres agrupaciones de clases separadas: grupo 1 (coche, furgoneta), grupo 2 (camión, remolque, autobús) y grupo 3 (peatón, bicicleta, motocicleta). Esta separación por tamaño evita que la pérdida de objetos grandes (como autobuses) domine el entrenamiento y degrade la detección de objetos pequeños (como motocicletas). El entrenamiento se realizó durante 200 épocas con el optimizador `adam_onecycle` (pico de LR 0.003), que acelera la convergencia y ayuda a escapar de mínimos locales. Los pesos de pérdida se configuraron con `loc_weight: 2.0` y `cls_weight: 1.0`, priorizando la precisión de localización sobre la clasificación, dado que un error de un metro en la posición puede causar un accidente en conducción autónoma. La evaluación se realizó con un umbral de NMS de 0.2 para eliminar detecciones duplicadas típicas de datos V2X.

## Capacidades

- Deteccion de objetos 3D en escenarios de trafico: coches, furgonetas, camiones, remolques, autobuses, peatones, bicicletas y motocicletas.
- Precision perfecta (AP 1.0) en la clase de motocicletas sobre el conjunto de test oculto de CodaBench.
- Robustez frente a condiciones de iluminacion adversas (deslumbramiento solar, sombras, colores oscuros) al depender unicamente de rebotes laser fisicos.
- Generacion de bounding boxes 3D ajustadas gracias a la penalizacion fuerte de errores de localizacion.
- Capacidad de "relleno quirurgico": puede complementar detecciones de modelos de camara en clases como VAN, TRAILER y CAR con umbrales de confianza especificos.
- No soporta procesamiento de texto, vision por camara, ni tareas de lenguaje natural.

## Casos de uso

- Conduccion autonoma en autopistas: el modelo puede integrarse en el pipeline de percepcion de un vehiculo autonomo para detectar vehiculos y motocicletas en tiempo real, especialmente en condiciones de iluminacion cambiantes donde las camaras fallan.
- Sistemas avanzados de asistencia al conductor (ADAS): su alta precision en localizacion (gracias a `loc_weight: 2.0`) lo hace adecuado para sistemas de frenado de emergencia o control de crucero adaptativo que requieren bounding boxes 3D muy ajustadas.
- Infraestructura de monitoreo vial: el dataset TUMTraf proviene de estaciones de sensores a lo largo de la autopista A9; el modelo puede desplegarse en estas estaciones para detectar incidentes o contar vehiculos.
- Analisis de accidentes de trafico: con el dataset TUMTraf-A, el modelo puede ayudar a reconstruir escenas de accidentes reales, identificando la posicion y tipo de objetos involucrados.
- Fusion de sensores en sistemas V2X: al usar solo LiDAR, puede combinarse con modelos de camara para cubrir los puntos ciegos de cada sensor, como se hizo en la solucion ganadora del desafio (relleno de detecciones).
- Investigacion academica en deteccion 3D: sirve como punto de partida para estudiar el impacto de la agrupacion de clases por tamaño o la influencia del umbral NMS en datos V2X.

## Benchmarks y rendimiento

Los resultados provienen de la competicion CodaBench (final submission). El modelo obtuvo el tercer puesto global en el desafio DriveX 2026. La siguiente tabla muestra las puntuaciones de AP (Average Precision) por clase en el conjunto de test oculto:

| Clase | AP | Rol |
|---|---|---|
| MOTORCYCLE | 1.000 | Modelo principal |
| VAN | +fill (score > 0.85) | Relleno quirurgico |
| TRAILER | +fill (score > 0.60) | Relleno quirurgico |
| CAR | +fill (score > 0.50) | Relleno no solapado |

Nota: los valores "+fill" indican que el modelo se utilizo para complementar detecciones de otros modelos, no como deteccion primaria. No se dispone de resultados comparativos con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- Tamano del checkpoint: 96 MB (formato .pth), lo que sugiere una huella de memoria reducida en comparacion con modelos de lenguaje grandes.
- VRAM estimada: no disponible en la informacion proporcionada; sin embargo, para un modelo de deteccion 3D de este tamano, una GPU con al menos 4-6 GB de VRAM deberia ser suficiente para inferencia (estimacion razonable, no confirmada por el autor).
- GPU recomendadas: no se especifican; probablemente funcione en GPUs de gama media como RTX 3060 o superiores, y en sistemas embebidos como NVIDIA Jetson (sin confirmar).
- Opciones de despliegue: al ser un modelo PyTorch, puede integrarse con frameworks de inferencia como TensorRT, ONNX Runtime o directamente en C++ con LibTorch. No se menciona soporte para vLLM, Ollama o llama.cpp (no aplicable a un modelo de vision).
- Latencia y throughput: no disponibles. Dependera del hardware y de la optimizacion del pipeline de preprocesamiento de nubes de puntos.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativo con otros detectores 3D (como PointPillars, VoxelNet o SECOND) en la informacion proporcionada. El modelo se enmarca en la familia CenterPoint, pero no hay metricas publicas que permitan una comparacion cuantitativa. Se puede indicar que, por su naturaleza, es comparable a otros detectores LiDAR puros, pero sin datos concretos no es posible realizar una comparativa rigurosa.

## Limitaciones y advertencias

- Dependencia exclusiva de LiDAR: el modelo no utiliza camaras, por lo que puede fallar en la deteccion de objetos con baja reflectividad laser (por ejemplo, ropa oscura o materiales no metalicos).
- Generalizacion limitada: fue entrenado especificamente con el dataset TUMTraf (autopista A9, Alemania); su rendimiento en otros entornos (calles urbanas, climas diferentes) no esta garantizado.
- Licencia no especificada: no se indica ningun tipo de licencia en la model card, lo que genera incertidumbre sobre su uso comercial o la redistribucion de los pesos.
- Sesgo de clases: la agrupacion por tamaño en la cabeza de deteccion mejora las clases pequeñas (motos) pero podria degradar la precision en clases grandes si el grupo no esta bien balanceado; no hay datos que lo confirmen.
- Riesgo de sobreajuste al umbral NMS: el umbral de 0.2 fue optimizado para datos V2X con duplicados; en otros escenarios podria eliminar detecciones validas.
- Sin soporte para otras modalidades: no puede procesar imagenes, texto ni audio, limitando su uso a aplicaciones que ya dispongan de sensores LiDAR.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/harphool17/tumtraf-centerpoint-ep180
- Perfil del autor: https://huggingface.co/harphool17
- Modelo relacionado (CoopDet3D): https://huggingface.co/harphool17/tumtraf-coopdet3d-base
- Dataset TUMTraf (accidentes): https://tum-traffic-dataset.github.io/tumtraf-a/
- Dataset TUMTraf (autopista A9): https://innovation-mobility.com/en/project-providentia/a9-dataset/
- Repositorio de referencia CenterPoint (GitHub): https://github.com/CarkusL/CenterPoint

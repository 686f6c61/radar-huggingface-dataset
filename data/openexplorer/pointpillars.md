# OpenExplorer/pointpillars

## Resumen

PointPillars es un modelo de detección de objetos 3D sobre nubes de puntos LiDAR, desarrollado por OpenExplorer (Horizon Robotics) para su plataforma de chips Journey 6 (J6). Convierte la nube de puntos en "pilares" (pillars) mediante voxelización, extrae características con una red de pilares (PillarFeatureNet) y las dispersa en pseudo-imágenes para aplicar un FPN estilo SECOND (SECONDNeck) y una cabeza de detección (PointPillarsHead) que regresa cajas 3D. El modelo está optimizado para despliegue en hardware de Horizon, con soporte de cuantización, calibración y QAT, e incluye el preprocesado y post-procesado completos en el grafo de inferencia. Es relevante para aplicaciones de conducción autónoma y robótica que requieren detección de vehículos en tiempo real con LiDAR, y forma parte de la toolchain Horizon OpenExplorer, que permite entrenar y desplegar el modelo en chips J5 y J6.

La arquitectura es la original de PointPillars (publicada en arXiv 1812.05784), con una entrada de nube de puntos de una sola trama de forma `(N, 4)` (x, y, z, intensidad) y una salida de cajas 3D para la clase "Car". El tamaño del repositorio es de 0.2 GB, aunque el número exacto de parámetros no se especifica en la información disponible. El modelo está diseñado para ser ejecutado en los aceleradores de Horizon Robotics (J6M, J6P, J6B), no en GPUs genéricas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointPillars (voxelización en pilares + PillarFeatureNet + PointPillarScatter + SECONDNeck + PointPillarsHead) |
| Parametros totales | no disponible (repo de 0.2 GB, sin desglose) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de visión 3D, no procesa texto) |
| Tipos de cuantizacion | float, calibration, qat, hbm (según la model card) |
| Idiomas soportados | no aplica (entrada LiDAR) |
| Licencia | other (no especificada) |
| Formato de pesos | no disponible (probablemente safetensors o .pt, no indicado) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura PointPillars original. Primero, el preprocesado `PointPillarsPreProcess` voxeliza la nube de puntos en pilares con un rango de detección `pc_range=[0, -39.68, -3, 69.12, 39.68, 1]`, un tamaño de vóxel `[0.16, 0.16, 4]`, un máximo de 100 puntos por vóxel y un máximo de 12000 vóxeles. La entrada se rellena a 150000 puntos para el despliegue. La `PillarFeatureNet` (con `num_filters=(64)`) transforma cada pilar en un vector de 64 dimensiones mediante un MLP y max-pooling. El `PointPillarScatter` dispersa estas características en un mapa de pseudo-imagen de tamaño `H×W×64`. El `SECONDNeck` (FPN estilo SECOND) aplica capas de downsampling con canales `[64, 128, 256]` y strides `[2, 2, 2]`, y capas de upsampling con canales `[128, 128, 128]` y strides `[1, 2, 4]`, concatenando tres escalas para obtener 384 canales. La cabeza `PointPillarsHead` realiza clasificación, regresión de cajas y clasificación de dirección (con `use_direction_classifier=True`). La generación de anclas usa el `Anchor3DGeneratorStride` con tamaño de ancla `1.6×3.9×1.56`, stride `[0.32, 0.32, 0.0]` y ángulos de rotación `[0, 1.57]`. El post-procesado incluye NMS con `nms_iou_threshold=0.5`, `score_threshold=0.4`, `nms_pre_max_size=1000`, `nms_post_max_size=300` y `max_per_img=100`.

El entrenamiento usa supervisión conjunta con FocalLoss (clasificación, `alpha=0.25, gamma=2.0, weight=1.0`), SmoothL1Loss (regresión de cajas, `beta=1/9, weight=2.0`) y CrossEntropyLoss (dirección, `weight=0.2`). Los tutoriales de Horizon OpenExplorer indican que el modelo se entrena desde cero sobre el dataset KITTI-3DObject, incluyendo versiones en coma flotante, cuantizadas y de punto fijo. No se menciona el uso de RLHF ni técnicas de alineación, ya que no es un modelo generativo.

## Capacidades

- Detección de objetos 3D (cajas delimitadoras) para la clase "Car" en nubes de puntos LiDAR de una sola trama.
- Salida con coordenadas `x, y, z, w, l, h, θ` más un score de confianza y clasificación de dirección (orientación).
- Preprocesado y post-procesado integrados en el grafo de inferencia (voxelización, NMS, etc.), lo que facilita el despliegue en hardware de Horizon.
- Soporte de cuantización en varios modos: float, calibration, qat y hbm (probablemente high-bandwidth memory).
- Optimizado para ejecución en los chips Horizon Journey 6 (J6M, J6P, J6B) con latencias de decenas de milisegundos.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento simbólico.

## Casos de uso

- Conducción autónoma: detección de vehículos en tiempo real a partir de LiDAR, integrable en el pipeline de percepción de un vehículo autónomo. El modelo procesa una trama de nube de puntos y devuelve cajas 3D con orientación, adecuado para fusión con otros sensores.
- Sistemas avanzados de asistencia al conductor (ADAS): detección de obstáculos tipo coche para alertas de colisión o control de crucero adaptativo, gracias a su baja latencia (22 ms en J6M).
- Robótica móvil: navegación en entornos con vehículos (por ejemplo, almacenes o puertos) donde se necesita conocer la posición y orientación de otros vehículos para planificar rutas.
- Monitorización de tráfico en infraestructuras: detección de vehículos en intersecciones o carreteras mediante LiDAR fijo, útil para gestión de semáforos o conteo de tráfico.
- Vehículos de reparto autónomos (última milla): detección de coches en entornos urbanos para evitar colisiones, aprovechando el bajo consumo de memoria (~55 MB) y la compatibilidad con chips embebidos.
- Investigación académica: como referencia de implementación de PointPillars con despliegue en hardware específico, útil para comparar con otras arquitecturas de detección 3D.

## Benchmarks y rendimiento

La model card proporciona métricas de precisión y rendimiento medidas con la configuración `march = March.NASH_M` (J6M) y las versiones de software indicadas (heal 0.0.2, hbdk4-compiler 4.11.11, horizon_plugin_pytorch 3.3.10).

**Precisión 3D AP (Car)**

| Modo | 3D AP (Car) |
|---|---|
| float | 0.7731 |
| calibration | 0.7569 |
| qat | 0.7709 |
| hbm | 0.7707 |

**Rendimiento por chip (J6)**

| March | Latencia (ms) | FPS | Uso de memoria DDR (MB) |
|---|---|---|---|
| J6M | 22.52 | 213.58 | 55.90 |
| J6P | 20.43 | 344.88 | 55.90 |
| J6B | 1650.03 | 1.99 | 53.00 |

La metodología de medición indica que FPS se mide con un solo núcleo y ocho hilos, la latencia con un solo núcleo y un solo hilo, y la memoria es el pico de uso de DDR. No se han publicado resultados en benchmarks estándar como KITTI BEV o 3D para comparación con otros modelos en la información disponible.

## Requisitos de hardware

- Diseñado para los aceleradores de Horizon Robotics Journey 6: J6M, J6P y J6B.
- Consumo de memoria DDR de aproximadamente 53-56 MB en los tres chips (según las métricas de la model card).
- Latencia de inferencia: 22.52 ms en J6M (single-core single-thread), 20.43 ms en J6P y 1650.03 ms en J6B (este último mucho más lento, probablemente una variante de menor rendimiento).
- Throughput: 213.58 FPS en J6M y 344.88 FPS en J6P (single-core eight-thread).
- No se proporcionan requisitos para GPUs NVIDIA ni otras plataformas; el despliegue requiere la toolchain de Horizon (heal, hbdk4-compiler, horizon_plugin_pytorch).
- El modelo incluye el grafo completo de preprocesado, red y post-procesado, por lo que no necesita bibliotecas externas para voxelización o NMS en tiempo de inferencia.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la información proporcionada. PointPillars es una arquitectura conocida en la detección 3D sobre LiDAR, y existen otras implementaciones como SECOND, VoxelNet o las versiones de PointPillars de otros proveedores (por ejemplo, AMD-PAVS-AI/pointpillars para ONNX Runtime). Sin embargo, no hay métricas de rendimiento o precisión comparables publicadas en la model card de este repositorio. Se recomienda consultar el paper original (arXiv:1812.05784) para comparaciones con métodos anteriores como VoxelNet y SECOND en el dataset KITTI.

## Limitaciones y advertencias

- El modelo solo detecta la clase "Car". No está entrenado para peatones, ciclistas u otros objetos, por lo que su uso en entornos con múltiples clases requeriría reentrenamiento o extensión de la cabeza de detección.
- La entrada se limita a 150000 puntos por trama (rellenado con ceros). Nubes de puntos más densas podrían perder información o requerir ajustes en el preprocesado.
- El despliegue está ligado a la toolchain de Horizon (heal, hbdk4-compiler, horizon_plugin_pytorch) y a los chips J6. No es trivial ejecutarlo en GPUs o NPUs de otros fabricantes sin adaptar el grafo y la cuantización.
- La licencia es "other" y no se especifica en la model card. Esto puede implicar restricciones de uso comercial o de redistribución; es necesario consultar los términos exactos antes de usarlo en producción.
- La precisión se mide solo con la configuración J6M y con el dataset KITTI-3DObject; el rendimiento en otros datasets o condiciones (lluvia, niebla, etc.) no está documentado.
- No es un modelo de lenguaje, por lo que no tiene capacidades de generación de texto, razonamiento simbólico ni interacción en lenguaje natural.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OpenExplorer/pointpillars
- Paper original: https://arxiv.org/abs/1812.05784v1
- Repositorio oficial (second.pytorch): https://github.com/nutonomy/second.pytorch
- Tutorial de entrenamiento PointPillars con Horizon OpenExplorer (v3.7.0): https://doc.oe.horizon.auto/3.7.0/en/guide/advanced_content/hat/examples/pointpillars.html
- Tutorial de entrenamiento PointPillars (v3.7.1, sin configuración): https://doc.oe.horizon.auto/3.7.1/en/guide/advanced_content/hat/examples/pointpillars_v2.html
- Documentación de despliegue en chips J6: https://developer.horizon.auto/blog/14086

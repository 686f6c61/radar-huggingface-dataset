# qualcomm/CenterPoint

## Resumen

CenterPoint es un modelo de detección de objetos 3D basado en LiDAR, desarrollado por Qualcomm y optimizado para ejecutarse en sus dispositivos (Snapdragon, Dragonwing, etc.). Detecta objetos en nubes de puntos 3D prediciendo sus centros y regresando atributos adicionales como dimensiones, orientación y velocidad. Está diseñado para aplicaciones de conducción autónoma y asistencia al conductor, priorizando alta precisión y rendimiento en tiempo real.

El modelo se basa en la arquitectura PointPillars como checkpoint de referencia, con 21,8 millones de parámetros y un tamaño de 83,3 MB. Se distribuye pre-exportado en formatos ONNX, QNN_DLC y TFLITE, listos para desplegar en hardware Qualcomm mediante el Qualcomm AI Hub. Su relevancia actual radica en la creciente demanda de modelos de percepción 3D eficientes para sistemas embebidos en vehículos, donde el procesamiento en el dispositivo es crítico para la latencia y la privacidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PointPillars (basada en CenterPoint) |
| Parametros totales | 21,8 M |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión 3D, no texto) |
| Tipos de cuantizacion | float (sin cuantizacion en los assets publicados) |
| Idiomas soportados | no aplica |
| Licencia | MIT |
| Formato de pesos | ONNX, QNN_DLC, TFLITE |

## Arquitectura y entrenamiento

CenterPoint es un detector de objetos 3D que opera sobre nubes de puntos LiDAR. Su arquitectura se basa en PointPillars, que convierte la nube de puntos en una representación pseudo-imagen mediante "pillars" (columnas verticales), y luego aplica una red convolucional 2D para extraer características. La cabeza de detección predice centros de objetos y regresa atributos como tamaño, orientación y velocidad. El checkpoint incluido en este repositorio es el de PointPillars, aunque el modelo original CenterPoint introduce refinamiento por centro y predicción de velocidad.

No se proporcionan detalles sobre el dataset de entrenamiento, el número de tokens (no aplica) ni el proceso de optimización (RLHF/DPO no aplican). El modelo se distribuye pre-entrenado y optimizado para inferencia en dispositivos Qualcomm, con soporte para exportación personalizada mediante la librería Qualcomm AI Hub Models. La entrada esperada es una nube de puntos con dimensiones 5x20x5, 5x4 y 5 (probablemente correspondientes a coordenadas, intensidad y otras características).

## Capacidades

- Detección de objetos 3D en nubes de puntos LiDAR, incluyendo vehículos, peatones y otros elementos relevantes para conducción autónoma.
- Predicción de centros de objetos y regresión de atributos como dimensiones, orientación y velocidad.
- Inferencia en tiempo real en dispositivos Qualcomm, con tiempos de 253 ms a 1025 ms según el chipset y runtime.
- Soporte para múltiples runtimes: ONNX, QNN_DLC (Qualcomm Neural Network) y TFLITE.
- Exportación personalizable con pesos propios, formas de entrada y configuraciones de dispositivo mediante la librería Qualcomm AI Hub Models.
- Optimizado para NPU (Unidad de Procesamiento Neuronal) de Qualcomm, aunque también puede ejecutarse en CPU (con mayor latencia).

## Casos de uso

- Conducción autónoma de nivel 2/3: el modelo puede integrarse en sistemas de asistencia al conductor para detectar objetos 3D alrededor del vehículo en tiempo real, permitiendo funciones como frenado de emergencia o control de crucero adaptativo.
- Sistemas avanzados de asistencia al conductor (ADAS): su baja latencia (por ejemplo, 253 ms en Snapdragon 8 Elite Gen 5) lo hace adecuado para alertas de colisión y monitorización del entorno.
- Robótica móvil y vehículos autónomos en entornos industriales: puede usarse para navegación y evitación de obstáculos en almacenes o plantas de producción, donde los sensores LiDAR son comunes.
- Prototipado de percepción 3D en plataformas embebidas: los assets pre-exportados permiten a desarrolladores evaluar rápidamente el rendimiento en hardware Qualcomm sin necesidad de entrenar desde cero.
- Investigación en detección 3D eficiente: sirve como punto de partida para estudiar técnicas de optimización de modelos LiDAR en dispositivos con recursos limitados.
- Sistemas de monitorización de tráfico en infraestructuras: puede desplegarse en cámaras o unidades de borde con LiDAR para contar vehículos o detectar incidentes en carreteras.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (como mAP en KITTI o nuScenes) en la informacion disponible. La tabla de rendimiento proporcionada se centra en latencia y uso de memoria en diferentes chipsets Qualcomm:

| Runtime | Precision | Chipset | Inferencia (ms) | Pico de memoria (MB) | Unidad de computo |
|---|---|---|---|---|---|
| ONNX | float | Dragonwing QCS8550 (Proxy) | 422,787 | 1049 - 1069 | NPU |
| ONNX | float | Dragonwing Q-8750 | 303,143 | 1056 - 1429 | NPU |
| ONNX | float | Snapdragon 8 Elite Mobile | 303,143 | 1056 - 1429 | NPU |
| ONNX | float | Snapdragon 8 Elite Gen 5 Mobile | 258,643 | 1056 - 1446 | NPU |
| QNN_DLC | float | Snapdragon X2 Elite | 300,155 | 2 - 2 | NPU |
| QNN_DLC | float | Snapdragon X Elite | 422,131 | 2 - 2 | NPU |
| QNN_DLC | float | Snapdragon 8 Gen 3 Mobile | 305,112 | 2 - 691 | NPU |
| QNN_DLC | float | Snapdragon 8 Gen 1 Mobile | 872,966 | 2 - 555 | NPU |
| QNN_DLC | float | Dragonwing IQ-8275 | 454,355 | 2 - 12 | NPU |
| QNN_DLC | float | Dragonwing IQ-8275 | 1024,999 | 1 - 411 | NPU |
| QNN_DLC | float | Dragonwing QCS8550 (Proxy) | 420,281 | 2 - 13 | NPU |
| QNN_DLC | float | SA8775P | 479,107 | 2 - 408 | NPU |
| QNN_DLC | float | SA8650P | 479,107 | 2 - 408 | NPU |
| QNN_DLC | float | SA8255P | 479,107 | 2 - 408 | NPU |
| QNN_DLC | float | QCS8450 | 872,966 | 2 - 555 | NPU |
| QNN_DLC | float | Dragonwing IQ-9075 | 472,287 | 4 - 13 | NPU |
| QNN_DLC | float | Dragonwing IQ-X7181 | 422,131 | 2 - 2 | NPU |
| QNN_DLC | float | Dragonwing Q-8750 | 296,588 | 0 - 419 | NPU |
| QNN_DLC | float | SA7255P | 1024,999 | 1 - 411 | NPU |
| QNN_DLC | float | SA8295P | 528,454 | 1 - 403 | NPU |
| QNN_DLC | float | Snapdragon 8 Elite Mobile | 296,588 | 0 - 419 | NPU |
| QNN_DLC | float | Snapdragon 8 Elite Gen 5 Mobile | 253,314 | 0 - 411 | NPU |
| TFLITE | float | Snapdragon 8 Gen 3 Mobile | 4217,364 | 1861 - 1871 | CPU |
| TFLITE | float | Snapdragon 8 Gen 1 Mobile | 5997,541 | 1855 - 1870 | CPU |
| TFLITE | float | Dragonwing IQ-8275 | 6082,385 | 2361 - 2382 | CPU |
| TFLITE | float | Dragonwing IQ-8275 | 6377,116 | 1847 - 1856 | CPU |
| TFLITE | float | Dragonwing QCS8550 (Proxy) | 4967,254 | 1814 - 1839 | CPU |
| TFLITE | float | SA8775P | 5484,257 | 1810 - 1815 | CPU |
| TFLITE | float | SA8650P | 5484,257 | 1810 - 1815 | CPU |
| TFLITE | float | SA8255P | 5484,257 | 1810 - 1815 | CPU |
| TFLITE | float | QCS8450 | 5997,541 | 1855 - 1870 | CPU |

## Requisitos de hardware

- El modelo está diseñado para dispositivos Qualcomm con NPU. Los tiempos de inferencia más bajos se obtienen con QNN_DLC en Snapdragon 8 Elite Gen 5 (253 ms) y Dragonwing Q-8750 (296 ms).
- En formato ONNX, requiere entre 1049 y 1446 MB de memoria pico según el chipset, lo que implica una GPU o NPU con al menos 2 GB de VRAM disponible.
- En formato QNN_DLC, el uso de memoria es mucho menor (2 MB en algunos chipsets), lo que lo hace viable para sistemas embebidos con restricciones de memoria.
- En formato TFLITE, la ejecución es en CPU y mucho más lenta (4-6 segundos), con picos de memoria de 1,8-2,4 GB; no recomendado para tiempo real.
- No se especifican GPUs de escritorio (A100, RTX 4090, etc.) porque el modelo está orientado a plataformas móviles y embebidas de Qualcomm.
- Opciones de despliegue: Qualcomm AI Hub Workbench, librería Qualcomm AI Hub Models (Python), y runtimes ONNX Runtime, Qualcomm AI Runtime (QAIRT) y TensorFlow Lite.
- Para desarrollo y pruebas, se puede ejecutar en un ordenador con CPU, pero la latencia será significativamente mayor.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| CenterPoint (Qualcomm) | PointPillars | 21,8 M | no aplica | MIT | ONNX, QNN_DLC, TFLITE |
| PointPillars (original) | PointPillars | ~5-10 M (varia) | no aplica | Apache 2.0 (comun) | PyTorch, TensorFlow |
| VoxelNet | Voxel-based | ~10-20 M (varia) | no aplica | Apache 2.0 (comun) | PyTorch, TensorFlow |
| SECOND | Sparse conv | ~10-20 M (varia) | no aplica | Apache 2.0 (comun) | PyTorch |

Nota: los datos de PointPillars, VoxelNet y SECOND son orientativos y pueden variar según la implementación. No se dispone de comparativas de precisión (mAP) en la informacion proporcionada.

## Limitaciones y advertencias

- No se proporcionan métricas de precisión (mAP, NDS) en la documentacion disponible, por lo que no es posible evaluar su rendimiento frente a otros detectores 3D en benchmarks estándar como KITTI o nuScenes.
- El modelo está optimizado exclusivamente para hardware Qualcomm; su ejecución en otras plataformas (NVIDIA, Intel) requeriría conversión y probablemente perdería rendimiento.
- La entrada esperada (5x20x5, 5x4, 5) sugiere una configuración específica de nube de puntos; cambios en la resolución o el número de puntos pueden requerir reentrenamiento o ajuste.
- No se especifican los datos de entrenamiento ni el proceso de validación, lo que limita la confianza en su comportamiento en escenarios no vistos.
- El uso en aplicaciones de conducción autónoma real exige validación exhaustiva y certificaciones de seguridad; este modelo se ofrece como referencia técnica, no como solución lista para producción.
- La licencia MIT permite uso comercial, pero el usuario es responsable de cumplir con las normativas de seguridad y privacidad aplicables.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/qualcomm/CenterPoint)
- [Página del modelo en Qualcomm AI Hub](https://aihub.qualcomm.com/models/centerpoint)
- [Repositorio Qualcomm AI Hub Models (GitHub)](https://github.com/qualcomm/ai-hub-models/tree/main/src%2Fqai_hub_models%2Fmodels%2Fcenterpoint)
- [README del modelo en GitHub](https://github.com/qualcomm/ai-hub-models/blob/main/src/qai_hub_models/models/centerpoint/README.md)

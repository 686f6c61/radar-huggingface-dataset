# OpenExploer/centerpoint_pointpillar

## Resumen

CenterPoint (variante PointPillars) es un modelo de deteccion de objetos 3D basado exclusivamente en nubes de puntos LiDAR, desarrollado originalmente por Tianwei Yin et al. y publicado en arXiv en 2020. Esta implementacion concreta, publicada por OpenExploer, esta optimizada para su despliegue en los chips de la familia Horizon Journey (J6M y J6P) mediante el framework HEAL, lo que la hace relevante para aplicaciones de conduccion autonoma y robotica que requieren inferencia en tiempo real en hardware de borde.

El modelo voxeliza la nube de puntos en pilares (pillars), extrae caracteristicas mediante `PillarFeatureNet`, las dispersa en una pseudo-imagen 2D con `PointPillarScatter`, y utiliza un `SECONDNeck` para extraer caracteristicas multi-escala. La cabeza de deteccion `CenterPointHead` regresa centros, tamanos, orientaciones y velocidades de cajas 3D de forma anchor-free. El modelo detecta 10 clases de objetos y soporta entrada de multiples barridos (9 sweeps) para estimacion de velocidad.

La relevancia actual de este modelo radica en su despliegue en silicio de Horizon Robotics: alcanza 183.98 FPS en el chip J6M y 833.52 FPS en el J6P con una latencia de 9.23 ms y 7.56 ms respectivamente, lo que lo posiciona como una opcion solida para sistemas de percepcion en tiempo real embarcados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CenterPoint (variante PointPillars): PillarFeatureNet + PointPillarScatter + SECONDNeck + CenterPointHead |
| Parametros totales | no disponible (repo de 0.2 GB en formato HEAL) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision 3D, no de texto) |
| Tipos de cuantizacion | float, calibration, qat, hbm |
| Idiomas soportados | no aplica (modelo de vision por LiDAR) |
| Licencia | other (especificar en el repositorio del autor) |
| Formato de pesos | HEAL (formato propietario de Horizon Robotics para chips J6) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseno original de CenterPoint con backbone PointPillars. La entrada es una nube de puntos LiDAR de dimension `(B, N, 5)` donde cada punto tiene 5 caracteristicas (x, y, z, intensidad, y tiempo relativo). El rango de la nube de puntos es `[-51.2, -51.2, -5.0, 51.2, 51.2, 3.0]` metros, con un tamano de voxel de `[0.2, 0.2, 8]` metros. Se utilizan hasta 30000 voxeles en entrenamiento y 40000 en inferencia, con un maximo de 20 puntos por voxel.

El `PillarFeatureNet` con 64 filtros aprende caracteristicas de los pilares, que luego se dispersan en una pseudo-imagen 2D mediante `PointPillarScatter` con `use_horizon_pillar_scatter=True`. El `SECONDNeck` extrae caracteristicas multi-escala con capas descendentes `[3, 5, 5]` y canales `[64, 128, 256]`, y capas ascendentes de 128 canales. La cabeza `CenterPointHead` es anchor-free y regresa 10 atributos por objeto: 2 de regresion de centro, 1 de altura, 3 de dimensiones, 2 de rotacion y 2 de velocidad. La funcion de perdida combina `GaussianFocalLoss` para clasificacion y `L1Loss` para regresion.

El entrenamiento utiliza aumentacion de datos CBGS (Class-Balanced Grouping and Sampling). El modelo se entreno en el dataset nuScenes, donde el CenterPoint original alcanzo 65.5 NDS y 63.8 AMOTA en el benchmark oficial. Esta implementacion especifica ha sido adaptada y compilada para los chips J6 de Horizon Robotics mediante el compilador hbdk4 4.11.11 y horizon_plugin_pytorch 3.3.10.

## Capacidades

- Deteccion de objetos 3D en nubes de puntos LiDAR con salida de cajas 3D orientadas.
- Clasificacion en 10 clases: coche, camion, vehiculo de construccion, autobus, remolque, barrera, motocicleta, bicicleta, peatonal y cono de trafico.
- Estimacion de velocidad de objetos moviles gracias a la entrada de multiples barridos (9 sweeps) y la cabeza de regresion de velocidad.
- Inferencia en tiempo real en hardware de borde: 183.98 FPS en J6M y 833.52 FPS en J6P.
- Soporte de cuantizacion QAT (Quantization-Aware Training) y calibracion para despliegue eficiente.
- Deteccion anchor-free basada en centros, que simplifica el post-procesado y mejora la precision en objetos superpuestos.

## Casos de uso

- Conduccion autonoma en entornos urbanos: el modelo detecta vehiculos, peatones y otros objetos en tiempo real con 9.23 ms de latencia en el chip J6M, permitiendo sistemas de frenado de emergencia y control de crucero adaptativo con margen de reaccion suficiente.
- Sistemas avanzados de asistencia a la conduccion (ADAS): su capacidad para estimar velocidad de objetos moviles permite predecir trayectorias y emitir alertas tempranas de colision en autopistas y ciudades.
- Robotica movil en almacenes y fabricas: la deteccion de objetos 3D con LiDAR permite a robots autonomos navegar evitando obstaculos y personas en entornos industriales dinamicos.
- Vehiculos de reparto autonomo de ultima milla: el modelo puede integrarse en plataformas de bajo consumo como el J6B para detectar peatones y obstaculos en aceras y zonas peatonales.
- Monitorizacion de trafico en infraestructuras inteligentes: desplegado en unidades de borde, puede contar vehiculos, clasificarlos y estimar su velocidad en intersecciones para optimizar semaforos.
- Plataformas de simulacion y validacion de ADAS: el modelo puede ejecutarse en bucle cerrado con simuladores para validar sistemas de percepcion antes del despliegue en vehiculos reales.

## Benchmarks y rendimiento

La informacion proporcionada incluye metricas de precision y rendimiento medidas en los chips J6 de Horizon Robotics con configuracion `March.NASH_M` (J6M):

| March | Metric | float | calibration | qat | hbm |
| --- | --- | --- | --- | --- | --- |
| J6M | NDS | 0.5865 | 0.5703 | 0.5853 | 0.5846 |
| J6M | mAP | 0.474 | 0.4487 | 0.4699 | 0.4693 |

| March | Latencia (ms) | FPS | Uso de memoria DDR |
| --- | --- | --- | --- |
| J6M | 9.23 | 183.98 | 51.10 MB |
| J6P | 7.56 | 833.52 | 47.20 MB |
| J6B | no disponible | no disponible | no disponible |

El modelo original de CenterPoint reporta 65.5 NDS y 63.8 AMOTA en el benchmark de nuScenes para deteccion y tracking, y supera a todos los metodos LiDAR-only en Waymo Open Dataset. No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- Chip Horizon Journey J6M: 183.98 FPS con 8 hilos de un solo nucleo, 9.23 ms de latencia single-core single-thread, 51.10 MB de uso pico de DDR.
- Chip Horizon Journey J6P: 833.52 FPS con 8 hilos de un solo nucleo, 7.56 ms de latencia single-core single-thread, 47.20 MB de uso pico de DDR.
- Chip Horizon Journey J6B: rendimiento no disponible para este modelo.
- El modelo viene compilado en formato HEAL, por lo que requiere el runtime de Horizon Robotics (hbdk4, horizon_plugin_pytorch) para su ejecucion.
- No se proporcionan requisitos para GPU convencionales; el despliegue esta orientado exclusivamente a la familia de chips J6 de Horizon Robotics.
- Para desarrollo y validacion, se puede ejecutar el modelo original de CenterPoint en GPU mediante el repositorio oficial de GitHub, que soporta PyTorch y OpenPCDet.

## Comparativa con modelos similares

| Modelo | Backbone | Clases | NDS (nuScenes) | Licencia | Despliegue |
| --- | --- | --- | --- | --- | --- |
| CenterPoint (PointPillars) | PillarFeatureNet + SECONDNeck | 10 | 0.5865 (J6M, float) | other | Horizon J6 (HEAL) |
| CenterPoint (VoxelNet) | VoxelNet + SECONDNeck | 10 | 65.5 (original, GPU) | MIT (repo oficial) | GPU (PyTorch) |
| PointPillars | PillarFeatureNet + RPN | 3 (KITTI) | no aplica | MIT | GPU (OpenPCDet) |

El modelo original de CenterPoint con backbone VoxelNet alcanza mayor precision (65.5 NDS) que la variante PointPillars (58.65 NDS en J6M), pero la variante PointPillars es significativamente mas rapida y ligera, lo que la hace adecuada para despliegue en hardware de borde. PointPillars clasico es mas simple pero no ofrece estimacion de velocidad ni deteccion de 10 clases.

## Limitaciones y advertencias

- El modelo solo procesa nubes de puntos LiDAR; no integra fusion con camaras u otros sensores, lo que limita su rendimiento en condiciones de niebla, lluvia intensa o polvo donde el LiDAR se degrada.
- La licencia es "other" y debe revisarse en el repositorio del autor antes de uso comercial; no se garantiza que sea permisiva.
- El formato HEAL es propietario de Horizon Robotics, por lo que el modelo no es portable a otras plataformas de hardware sin recompilacion o conversion.
- La precision medida (NDS 0.5865) es inferior a la del modelo original en GPU (65.5 NDS), probablemente debido a la cuantizacion y a la variante PointPillars.
- El rendimiento en J6B no esta disponible, por lo que no se puede confirmar su viabilidad en el chip de menor potencia.
- El modelo esta limitado a 10 clases de objetos definidas en el dataset nuScenes; no detecta objetos fuera de esa taxonomia.
- No se proporcionan datos sobre sesgos o comportamiento en escenarios de borde (objetos muy pequenos, oclusiones severas, condiciones climaticas adversas).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OpenExploer/centerpoint_pointpillar
- Repositorio oficial de CenterPoint: https://github.com/tianweiy/CenterPoint
- Paper original (arXiv): https://arxiv.org/abs/2006.11275
- Pagina del proyecto CenterPoint: https://tianweiy.github.io/centerpoint/
- Repositorio de inferencia OpenPCDet para CenterPoint-PointPillars: https://github.com/hyunkoome/CenterPointPillar
- Modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/centerpoint
- Blog de despliegue en chips J6 de Horizon Robotics: https://developer.horizon.auto/blog/10360

# OpenExplorer/sparse_multitask_det_maptr_flashocc_henet_tinym

## Resumen

SparseMultitaskOE es un modelo de percepcion multitarea para conduccion autonoma desarrollado por OpenExplorer, el equipo de herramientas de Horizon Robotics. El modelo fusiona tres tareas criticas de percepcion en un unico sistema: deteccion de objetos 3D (estilo SparseBEV, 10 clases), construccion de mapas vectorizados (estilo MapTR, 3 clases de elementos) y prediccion de ocupacion semantica (estilo FlashOcc, 18 clases). Utiliza HENet-tiny como backbone para extraer caracteristicas de seis camaras multivista y las fusiona con datos de lidar en un espacio BEV (Bird's Eye View).

El modelo esta disenado especificamente para el despliegue en el chip Horizon Journey 6 (J6), con soporte para cuantizacion y compilacion optimizada. Su relevancia radica en que demuestra que es posible ejecutar tres tareas de percepcion pesadas de forma simultanea en hardware de borde automotriz, alcanzando hasta 188.57 FPS en el J6P con una latencia de 17.75 ms. El entrenamiento usa una estrategia de tres fases que combina entrenamiento conjunto inicial, refinamiento de cabezas especificas con backbone congelado y fusion de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HENet-tiny (backbone) + MMFPN (neck) + SparseBEVOEHead (detection) + SparseMapPerceptionDecoder (map) + FlashOcc-style head (occupancy) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de vision por camaras, no texto) |
| Tipos de cuantizacion | float, calibration, hbm (no tiene QAT) |
| Idiomas soportados | no aplicable (percepcion visual) |
| Licencia | other |
| Formato de pesos | no disponible (repositorio de 2.9 GB, probablemente safetensors o checkpoint de entrenamiento) |
| Entrada | 6 camaras multivista (B,6,3,256,704) + nube de puntos lidar (B,N,5) |
| Salida | cajas 3D (10 clases), mapa vectorizado (3 clases), ocupacion semantica (18 clases) |
| Rango BEV | det/occ: [-51.2,-51.2,-5.0,51.2,51.2,3.0]; map: [-15.0,-30.0,-10.0,15.0,30.0,10.0] |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de percepcion BEV clasica en tres etapas. Primero, el backbone HENet-tiny (desarrollado internamente por Horizon) extrae caracteristicas de las seis camaras multivista. Estas caracteristicas se transforman al espacio BEV mediante el neck MMFPN (Multi-Modal Feature Pyramid Network), que tambien integra la informacion del lidar. Posteriormente, el modulo SparseBEVOEHead (compuesto por SparseBEVOEEncoder y SparseBEVOERefinementModule) procesa las caracteristicas BEV y alimenta tres cabezales de tarea independientes: deteccion 3D con 10 clases, mapa vectorizado con 3 clases (divider, ped_crossing, boundary) y ocupacion semantica con 18 clases.

El entrenamiento utiliza una estrategia de tres fases en precision float. La fase 1 entrena conjuntamente los tres cabezales junto con el backbone. La fase 2 congela el backbone y entrena unicamente los cabezales de mapa y ocupacion con una tasa de aprendizaje de 1e-5. Finalmente, la fase de fusion combina los pesos de la fase 1 (deteccion) con los de la fase 2 (mapa y ocupacion) para obtener el modelo completo. Dos configuraciones destacables: `use_lidar_gt=True` indica que el lidar se usa como ground truth durante el entrenamiento, y `defer_vectormap=True` genera el mapa vectorizado online durante el entrenamiento. El modelo se basa en los trabajos academicos SparseBEV (arXiv:2308.09244), MapTR (arXiv:2208.14437) y FlashOcc (arXiv:2311.12058).

## Capacidades

- Deteccion de objetos 3D: genera cajas tridimensionales con 10 clases de objetos (vehiculos, peatones, ciclistas, etc.) a partir de camaras y lidar.
- Construccion de mapas vectorizados: produce elementos de mapa como divisores de carril, cruces peatonales y bordes, en formato vectorial (polilineas y poligonos).
- Prediccion de ocupacion semantica: genera una rejilla de ocupacion BEV con 18 clases semanticas, permitiendo detectar obstaculos y espacio libre.
- Fusion multimodal: combina informacion de 6 camaras y lidar en un espacio BEV unificado.
- Ejecucion en tiempo real en hardware de borde: optimizado para los chips Horizon Journey 6 (J6M, J6P, J6B).
- Entrenamiento de tres fases: permite refinar cabezas especificas sin degradar el rendimiento del backbone.
- Soporte para cuantizacion y calibracion: preparado para despliegue con precision reducida (hbm) manteniendo metricas cercanas al float.

## Casos de uso

- Conduccion autonoma de nivel 2+ en autopista: el modelo proporciona deteccion de objetos 3D, mapas vectorizados y ocupacion simultaneamente, permitiendo que el vehiculo entienda su entorno completo con una sola pasada de inferencia.
- Sistemas avanzados de asistencia al conductor (ADAS): con una latencia de 17.75 ms en J6P, puede integrarse en sistemas de frenado de emergencia o mantenimiento de carril que requieren respuestas en milisegundos.
- Robotaxis en entornos urbanos: la combinacion de mapa vectorizado y ocupacion permite navegar en intersecciones complejas, detectando tanto elementos estaticos (bordillos, carriles) como dinamicos (peatones, vehiculos).
- Vehiculos de reparto autonomo de ultima milla: el modelo cabe en el chip J6B (122 MB de uso de memoria), adecuado para plataformas de bajo coste y bajo consumo.
- Sistemas de monitorizacion de trafico en infraestructura: puede desplegarse en camaras fijas de intersecciones para detectar objetos, mapear la via y predecir ocupacion en tiempo real.
- Desarrollo de sistemas de fusion de sensores: sirve como referencia para equipos que necesitan integrar camaras y lidar en un unico modelo BEV para investigacion o produccion.

## Benchmarks y rendimiento

| Metrica | float | calibracion | hbm |
|---|---|---|---|
| NDS (deteccion) | 0.5434 | 0.5325 | 0.5281 |
| mAP (deteccion) | no disponible | no disponible | no disponible |
| Chamfer mAP (mapa) | 0.592 | 0.5838 | 0.5833 |
| Occ mIoU (ocupacion) | 0.3197 | 0.3277 | 0.3273 |

Metricas de rendimiento por plataforma:

| Plataforma | Latencia (ms) | FPS | Memoria (MB) |
|---|---|---|---|
| J6M | 27.65 | 36.66 | 183.60 |
| J6P | 17.75 | 188.57 | 213.50 |
| J6B | 201.07 | 7.88 | 122.00 |

Nota: FPS para J6M/J6P es single-core ocho hilos; J6B es single-core dos hilos. Latencia es single-core single-thread. El modelo no tiene etapa QAT (columna marcada como "—" en los datos originales).

## Requisitos de hardware

- Chip objetivo: Horizon Journey 6 (J6M, J6P, J6B). El modelo esta compilado con `march = March.NASH_M` (J6M).
- Memoria DDR: entre 122 MB (J6B) y 213.5 MB (J6P) de uso pico.
- No es un modelo para GPU de consumo: esta disenado para el acelerador Horizon, no para CUDA. No se proporcionan requisitos de VRAM para GPUs convencionales.
- Herramientas de despliegue: HEAL (Horizon Embedded AI Library), hbdk4-compiler 4.11.11, horizon_plugin_pytorch 3.3.10.
- Compilacion: exportacion HBIR con `enable_vpu=True` para aceleracion por hardware.
- Para entrenamiento: no se especifican requisitos, pero al ser un modelo de vision con 6 camaras y lidar, se requiere al menos una GPU con 24 GB de VRAM (tipo RTX 3090/4090 o A100) para entrenamiento con batch razonable.

## Comparativa con modelos similares

| Modelo | Tareas | Backbone | Entrada | NDS | Occ mIoU | Plataforma objetivo |
|---|---|---|---|---|---|---|
| SparseMultitaskOE (este) | det + map + occ | HENet-tiny | 6 cam + lidar | 0.5434 | 0.3197 | Horizon J6 |
| BEVFormer | det + map | ResNet/V2-99 | 6 cam | ~0.42 (nuScenes) | no disponible | GPU |
| BEVFusion | det + occ | ResNet + PointPillars | 6 cam + lidar | ~0.55 (nuScenes) | no disponible | GPU |
| MapTR (solo mapa) | map | ResNet | 6 cam | — | — | GPU |

Nota: los valores de BEVFormer y BEVFusion son referencias aproximadas de la literatura publica, no comparaciones directas en las mismas condiciones. El modelo de Horizon no publica mAP de deteccion, lo que dificulta una comparacion completa. Su ventaja principal es la ejecucion en tiempo real en hardware de borde, algo que los modelos de GPU no ofrecen.

## Limitaciones y advertencias

- Licencia "other": no se especifican los terminos exactos. Es necesario contactar con Horizon Robotics para uso comercial.
- No se publican los parametros totales del modelo ni el formato de pesos, lo que limita la reproducibilidad fuera del ecosistema Horizon.
- El modelo esta disenado exclusivamente para los chips J6 de Horizon. No se puede ejecutar en GPUs convencionales sin una reimplementacion completa.
- No tiene etapa QAT: la cuantizacion directa a hbm puede perder precision en algunos escenarios (NDS baja de 0.5434 a 0.5281).
- La deteccion 3D no publica mAP, solo NDS, lo que dificulta evaluar la calidad de deteccion frente a otros modelos.
- El uso de `use_lidar_gt=True` implica que el modelo depende de ground truth de lidar durante el entrenamiento; en inferencia necesita entrada lidar real, lo que limita su uso a vehiculos con sensor lidar.
- No hay informacion sobre sesgos o alucinaciones, pero al ser un modelo de percepcion, los errores tipicos son falsos positivos/negativos en deteccion y errores de clasificacion en ocupacion.
- La fecha de creacion del modelo es 2026-08-27, lo que sugiere que es muy reciente y puede tener pocos casos de uso en produccion validados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenExplorer/sparse_multitask_det_maptr_flashocc_henet_tinym
- Repo SparseBEV (deteccion): https://github.com/MCG-NJU/SparseBEV
- Repo MapTR (mapa): https://github.com/hustvl/MapTR
- Repo FlashOcc (ocupacion): https://github.com/Yzichen/FlashOCC
- Paper SparseBEV: https://arxiv.org/abs/2308.09244
- Paper MapTR: https://arxiv.org/abs/2208.14437
- Paper FlashOcc: https://arxiv.org/abs/2311.12058
- Blog de despliegue en J6: https://developer.horizon.auto/blog/14095
- Tutorial de entrenamiento BevSparseMultiTask en HAT: https://doc.oe.horizon.auto/3.7.1/en/guide/advanced_content/hat/examples/bev_sparse_multitask.html
- Blog de referencia SparseBevFusionMultitaskOE-V1.0: https://developer.horizon.auto/blog/13254

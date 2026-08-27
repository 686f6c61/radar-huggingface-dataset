# OpenExploer/sparse_multitask_det_maptr_flashocc_henet_tinym

## Resumen

SparseMultitaskOE+MapTR+FlashOcc+HENet es un modelo de percepción multitarea para conducción autónoma desarrollado por OpenExploer, una iniciativa vinculada al ecosistema de Horizon Robotics. Integra en un único modelo tres tareas fundamentales: detección de objetos 3D, construcción de mapas vectorizados y predicción de ocupación semántica. El modelo utiliza un backbone HENet-tiny (desarrollado internamente por HEAL) para extraer características de seis cámaras multivista, las convierte a un espacio BEV (Bird's Eye View) y emplea tres cabezas especializadas: SparseBEVOE para detección, MapTR para mapas y FlashOcc para ocupación. Está diseñado específicamente para su despliegue en los chips de la familia Horizon J6 (J6M, J6P, J6B), con soporte de cuantización y optimización para inferencia en tiempo real. El repositorio en HuggingFace tiene un tamaño de 2,9 GB y no registra descargas ni likes, lo que sugiere que es un modelo de referencia o interno más que un proyecto comunitario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HENet-tiny (backbone) + MMFPN (neck) + SparseBEVOEHead (detección) + SparseMapPerceptionDecoder (mapa) + FlashOcc (ocupación) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imágenes y nube de puntos) |
| Tipos de cuantizacion | float, calibration, hbm (según métricas de despliegue) |
| Idiomas soportados | no disponible (modelo de percepción visual, sin procesamiento de lenguaje) |
| Licencia | other (no especificada) |
| Formato de pesos | no disponible (repo de 2,9 GB, sin indicación de formato) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de fusión multitarea basada en BEV. El backbone HENet-tiny extrae características de seis imágenes de cámara (resolución 256×704 cada una) y de una nube de puntos lidar (B,N,5). Estas características se proyectan a un espacio BEV mediante el neck MMFPN. La cabeza SparseBEVOEHead, compuesta por un encoder y un módulo de refinamiento, produce cajas 3D de detección para 10 clases. La cabeza de mapa, basada en MapTR, genera elementos vectorizados de tres clases (divisor, cruce peatonal y límite). La cabeza de ocupación, estilo FlashOcc, predice una rejilla de ocupación semántica con 18 clases. El rango BEV para detección y ocupación es de [-51,2, 51,2] metros en X e Y, con una resolución de ocupación de 0,625 metros. El entrenamiento se realiza en tres etapas: en la primera se entrenan conjuntamente las tres tareas junto con el backbone; en la segunda se congelan los pesos del backbone y se entrenan solo las cabezas de mapa y ocupación con una tasa de aprendizaje de 1e-5; finalmente se fusionan los pesos de ambas etapas. Se utiliza `use_lidar_gt=True` (ground truth de lidar) y `defer_vectormap=True` (el mapa se genera en línea). El modelo está entrenado sobre el dataset nuScenes, según la documentación oficial de Horizon.

## Capacidades

- Detección de objetos 3D en 10 clases (vehículos, peatones, etc.) a partir de imágenes multivista y lidar.
- Construcción de mapas vectorizados en línea con tres clases de elementos: divisores, cruces peatonales y límites de carretera.
- Predicción de ocupación semántica con 18 clases, útil para planificación de trayectorias y evitación de obstáculos.
- Fusión de sensores: entrada de seis cámaras y nube de puntos lidar, con salida simultánea de las tres tareas.
- Optimizado para inferencia en hardware embebido de Horizon Robotics (J6M, J6P, J6B) con soporte de cuantización (calibration y hbm).
- No incluye capacidades de procesamiento de lenguaje, tool calling ni razonamiento simbólico; es exclusivamente un modelo de percepción visual.

## Casos de uso

- Conducción autónoma de nivel 2+ y 3: el modelo proporciona detección de objetos, mapa vectorizado y ocupación en tiempo real, lo que permite a un vehículo comprender su entorno inmediato para tomar decisiones de planificación.
- Sistemas avanzados de asistencia al conductor (ADAS): puede integrarse en sistemas de frenado de emergencia, control de crucero adaptativo o asistencia en atascos, donde la detección 3D y la ocupación son críticas.
- Vehículos de reparto autónomo en entornos urbanos: la combinación de mapa vectorizado y ocupación permite navegar en calles con peatones y obstáculos dinámicos.
- Robótica móvil industrial: el modelo puede adaptarse para robots de almacén o vehículos guiados automáticamente (AGV) que necesitan percibir su entorno en 3D y construir mapas en tiempo real.
- Simulación de conducción y validación de algoritmos: investigadores pueden usar el modelo como referencia para comparar nuevas arquitecturas de percepción multitarea en el dataset nuScenes.
- Investigación en fusión de sensores: el modelo sirve como punto de partida para estudiar la integración de cámaras y lidar en tareas de percepción conjunta, gracias a su diseño modular y su documentación de entrenamiento.

## Benchmarks y rendimiento

Los datos de precisión se midieron con la configuración `march = March.NASH_M` (chip J6M). No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

| Metrica | float | calibration | hbm |
|---|---|---|---|
| NDS (detección) | 0,5434 | 0,5325 | 0,5281 |
| Chamfer mAP (mapa) | 0,592 | 0,5838 | 0,5833 |
| Occ mIoU (ocupación) | 0,3197 | 0,3277 | 0,3273 |

Rendimiento de inferencia (según metodología de Horizon: FPS para J6M/J6P es single-core eight-thread; J6B es single-core dual-thread; latencia es single-core single-thread; memoria es pico de DDR):

| March | Latencia (ms) | FPS | Memoria (MB) |
|---|---|---|---|
| J6M | 27,65 | 36,66 | 183,60 |
| J6P | 17,75 | 188,57 | 213,50 |
| J6B | 201,07 | 7,88 | 122,00 |

## Requisitos de hardware

- El modelo está diseñado para los chips de la familia Horizon J6: J6M, J6P y J6B. No se indica compatibilidad con GPUs de propósito general.
- Memoria DDR estimada: 183,60 MB (J6M), 213,50 MB (J6P), 122,00 MB (J6B) según las métricas de despliegue.
- Latencia de inferencia: 27,65 ms en J6M, 17,75 ms en J6P y 201,07 ms en J6B (single-core single-thread).
- Throughput: 36,66 FPS en J6M, 188,57 FPS en J6P y 7,88 FPS en J6B.
- Para el despliegue se requiere el stack de software HEAL (versión 0.0.2), hbdk4-compiler 4.11.11 y horizon_plugin_pytorch 3.3.10.
- No se proporcionan requisitos de VRAM para GPUs convencionales; el modelo está pensado para inferencia embebida, no para servidores con GPU.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos multitarea de percepción BEV. Los repositorios de referencia (SparseBEV, MapTR, FlashOcc) son los componentes individuales que este modelo combina, pero no se han publicado comparaciones directas de rendimiento o precisión con alternativas integradas.

## Limitaciones y advertencias

- La licencia se indica como "other", lo que implica restricciones no especificadas. Es probable que sea una licencia propietaria de Horizon Robotics, no apta para uso comercial sin acuerdo explícito.
- El modelo está entrenado exclusivamente en el dataset nuScenes, por lo que su rendimiento puede degradarse en otros entornos (climas, geografías, tipos de vía) no representados en ese dataset.
- Depende de la entrada de lidar para el ground truth durante el entrenamiento; en inferencia, la entrada incluye tanto imágenes como nube de puntos, lo que requiere sensores lidar en el vehículo.
- No se han documentado sesgos específicos, pero al ser un modelo de percepción, los errores de detección pueden tener consecuencias graves en aplicaciones de conducción real; se recomienda validación exhaustiva antes de su uso en producción.
- El tamaño del repositorio (2,9 GB) sugiere que los pesos están en formato de precisión completa; no se indican versiones cuantizadas listas para usar, aunque las métricas de calibration y hbm indican que el flujo de cuantización está soportado.
- No hay información sobre la fecha de creación (2026-08-27) ni sobre el mantenimiento del modelo; al ser un proyecto con cero descargas, puede tratarse de un artefacto de investigación sin soporte comunitario.

## Enlaces

- HuggingFace: https://huggingface.co/OpenExploer/sparse_multitask_det_maptr_flashocc_henet_tinym
- Repositorio oficial de SparseBEV: https://github.com/MCG-NJU/SparseBEV
- Repositorio oficial de MapTR: https://github.com/hustvl/MapTR
- Repositorio oficial de FlashOcc: https://github.com/Yzichen/FlashOCC
- Paper SparseBEV: https://arxiv.org/abs/2308.09244
- Paper MapTR: https://arxiv.org/abs/2208.14437
- Paper FlashOcc: https://arxiv.org/abs/2311.12058
- Blog de Horizon sobre el modelo: https://developer.horizon.auto/blog/13254
- Documentación de entrenamiento de Horizon: https://doc.oe.horizon.auto/3.7.1/en/guide/advanced_content/hat/examples/bev_sparse_multitask.html

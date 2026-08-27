# OpenExploer/bevfusion_pointpillar_henet_multisensor_multitask

## Resumen

El modelo `bevfusion_pointpillar_henet_multisensor_multitask` es un sistema de percepción multimodal para conducción autónoma desarrollado por OpenExploer, basado en el framework BEVFusion (ICRA 2023). Combina dos ramas de extracción de características: una rama de cámara que utiliza HENet (un backbone propio de Horizon) para procesar seis vistas de cámara y transformarlas al espacio bird's-eye view (BEV) mediante el ViewTransformer de BevFormer, y una rama de lidar que emplea PointPillars (PillarFeatureNet + PointPillarScatter + SECONDNeck) para voxelizar nubes de puntos y extraer características BEV. Las características fusionadas alimentan dos cabezas de tarea: una cabeza de detección CenterPoint para cajas 3D y una cabeza de ocupación semántica para rejillas de ocupación.

El modelo está diseñado para ejecutarse en la plataforma de hardware Horizon Journey 6 (J6), con soporte para compilación mediante HEAL (Horizon Embedded AI Library) y cuantización. Su relevancia radica en que ofrece una solución integrada de detección de objetos 3D y predicción de ocupación en un solo modelo, optimizada para despliegue en sistemas embebidos de automoción. El repositorio tiene un tamaño de 1.0 GB y fue creado en agosto de 2026.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fusión BEV dual: cámara (HENet + BevFormer ViewTransformer) + lidar (PointPillars + SECONDNeck) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión y lidar, no de texto) |
| Tipos de cuantizacion | Calibración, QAT (mencionados en métricas, pero no se especifican formatos exactos) |
| Idiomas soportados | no disponible |
| Licencia | other (según model card) |
| Formato de pesos | no disponible (probablemente safetensors, pero no se indica) |

## Arquitectura y entrenamiento

El modelo sigue el diseño de BEVFusion, que unifica características multimodales en un espacio BEV compartido. La rama de cámara procesa seis imágenes multivista (resolución 512×960) con el backbone HENet, extrae características multiescala y las proyecta al BEV mediante el ViewTransformer de BevFormer. La rama de lidar voxeliza la nube de puntos (rango de [-51.2, -51.2, -5.0] a [51.2, 51.2, 3.0]) y extrae características BEV con PointPillars y SECONDNeck. Las características de ambas ramas se fusionan y alimentan dos cabezas: CenterPoint para detección de objetos 3D (10 clases, incluyendo velocidad) y una cabeza de ocupación semántica (18 clases). El rango BEV es de 51.2×51.2 metros con una resolución de 0.8 metros.

No se proporcionan detalles sobre el conjunto de datos de entrenamiento, el número de épocas o el proceso de optimización (RLHF, DPO, etc.), ya que se trata de un modelo de percepción visual, no de lenguaje. El nombre del modelo y la documentación de Horizon indican que fue entrenado en el conjunto de datos nuScenes. La implementación se basa en el repositorio oficial de BEVFusion (mit-han-lab/bevfusion) y el paper arXiv:2205.13542, aunque la rama de cámara usa HENet en lugar del backbone original del paper.

## Capacidades

- Detección de objetos 3D: genera cajas delimitadoras tridimensionales con 10 clases (vehículos, peatones, etc.) y estimación de velocidad.
- Predicción de ocupación semántica: produce una rejilla de ocupación con 18 clases semánticas, útil para planificación de movimiento.
- Fusión multimodal: combina información de 6 cámaras y lidar en un espacio BEV unificado, preservando información geométrica y semántica.
- Inferencia en tiempo real en hardware embebido: optimizado para la plataforma Horizon Journey 6 (J6M, J6P), con latencias de 23.93 ms (J6M) y 16.87 ms (J6P) en configuración de un solo núcleo.
- Soporte para cuantización y calibración: se reportan métricas con calibración y HBM (probablemente high bandwidth memory), aunque no se detallan los formatos.
- Compatibilidad con el ecosistema HEAL: integración con hbdk4-compiler y horizon_plugin_pytorch para despliegue en chips Horizon.

## Casos de uso

- Percepción para conducción autónoma de nivel 2+ o superior: el modelo puede integrarse en el stack de un vehículo para detectar objetos 3D y predecir ocupación del entorno, alimentando módulos de planificación y control.
- Sistemas avanzados de asistencia al conductor (ADAS): gracias a su baja latencia (23.93 ms en J6M), es adecuado para alertas de colisión, frenado de emergencia y control de crucero adaptativo.
- Vehículos autónomos de reparto o robótica móvil: la fusión de cámara y lidar permite operar en entornos urbanos complejos, con detección de peatones, ciclistas y otros vehículos.
- Simulación y validación de algoritmos de percepción: el modelo puede usarse como referencia para comparar otras arquitecturas de fusión BEV en entornos de simulación (por ejemplo, CARLA o nuScenes).
- Desarrollo de sistemas de mapeo y localización: la salida de ocupación semántica puede utilizarse para construir mapas de ocupación en tiempo real, útiles para navegación sin mapa predefinido.
- Investigación en fusión multimodal: el modelo sirve como punto de partida para experimentos con diferentes backbones de cámara o lidar, gracias a su diseño modular basado en BEVFusion.

## Benchmarks y rendimiento

La model card reporta métricas de precisión y rendimiento para la configuración `march = March.NASH_M` (J6M). No se proporcionan comparaciones con otros modelos en la información disponible.

| Metrica | float | calibration | qat | hbm |
|---|---|---|---|---|
| NDS | 0.6421 | 0.6301 | — | 0.6294 |
| mAP | 0.5825 | 0.5724 | — | 0.5726 |
| Occ mIoU | 0.5187 | 0.52 | — | 0.5206 |

Nota: la columna QAT no aplica para esta tarea (indicado con "—").

Rendimiento (medido con un solo núcleo, 8 hilos para FPS; latencia con un solo hilo; memoria pico DDR):

| March | latencia (ms) | FPS | Memoria (MB) |
|---|---|---|---|
| J6M | 23.93 | 49.41 | 187.10 |
| J6P | 16.87 | 281.67 | 195.70 |
| J6B | no disponible | no disponible | no disponible |

## Requisitos de hardware

- El modelo está diseñado para la plataforma Horizon Journey 6 (J6M, J6P, J6B). No se especifican requisitos de VRAM para GPUs convencionales.
- Para inferencia en J6M: latencia de 23.93 ms, FPS de 49.41 y uso de memoria DDR de 187.10 MB.
- Para inferencia en J6P: latencia de 16.87 ms, FPS de 281.67 y uso de memoria DDR de 195.70 MB.
- No se indica compatibilidad con GPUs de consumo (RTX, etc.) ni con frameworks como vLLM, llama.cpp u Ollama, ya que es un modelo de visión embebido, no un LLM.
- El despliegue requiere el stack HEAL: hbdk4-compiler 4.11.11 y horizon_plugin_pytorch 3.3.10, con exportación HBIR y `enable_vpu=True`.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de fusión BEV en la información proporcionada. El modelo se basa en BEVFusion original (mit-han-lab/bevfusion), pero con un backbone de cámara diferente (HENet en lugar de Swin-T o similar). No se pueden ofrecer comparaciones cuantitativas sin datos adicionales.

## Limitaciones y advertencias

- La licencia se indica como "other", lo que implica que puede haber restricciones de uso comercial no especificadas. Se recomienda revisar los términos de la licencia antes de su uso en producción.
- No se proporcionan detalles sobre el conjunto de datos de entrenamiento ni sobre posibles sesgos. Al ser un modelo de percepción para conducción, puede tener un rendimiento degradado en condiciones climáticas adversas, iluminación extrema o escenarios no representados en nuScenes.
- La arquitectura está optimizada para hardware Horizon J6; su ejecución en otras plataformas requeriría adaptaciones y posiblemente pérdida de rendimiento.
- No se especifican los formatos de cuantización exactos (por ejemplo, INT8, FP16), lo que dificulta estimar la pérdida de precisión en despliegues reales.
- El modelo no es un LLM y no soporta tareas de lenguaje natural; su uso se limita a percepción visual y lidar.

## Enlaces

- HuggingFace: https://huggingface.co/OpenExploer/bevfusion_pointpillar_henet_multisensor_multitask
- Repositorio oficial BEVFusion: https://github.com/mit-han-lab/bevfusion
- Paper BEVFusion (arXiv): https://arxiv.org/abs/2205.13542
- Documentación de Horizon sobre el modelo: https://doc.oe.horizon.auto/3.8.1/en/guide/reference_algorithm/examples/lidar_fusion.html

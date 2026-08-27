# OpenExploer/bevformer_henet_camera_multitask

## Resumen

El modelo `OpenExploer/bevformer_henet_camera_multitask` es un sistema de percepción para conducción autónoma basado en la arquitectura BEVFormer, desarrollado por OpenExploer (relacionado con Horizon Robotics, dado el uso de HENet y las herramientas HEAL). Combina la detección de objetos 3D y la predicción de ocupación semántica en una única red multitarea, utilizando únicamente entradas de cámara (seis vistas). El backbone HENet extrae características multi-vista, que luego se transforman en una representación bird's-eye-view (BEV) mediante el ViewTransformer y el temporal BEV Encoder de BEVFormer. Esta representación alimenta dos cabezas: una de detección 3D (10 clases) y otra de ocupación semántica (18 clases, estilo FlashOcc). El modelo está optimizado para el hardware Horizon J6M (march NASH_M) y se distribuye con herramientas de compilación HEAL, lo que lo hace relevante para despliegue en sistemas embebidos de automoción. El tamaño del repositorio es de 0.2 GB, aunque no se especifican los parámetros totales del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con BEV (BEVFormer) + backbone HENet + FPN + cabezas de detección y ocupación |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada de imágenes) |
| Tipos de cuantizacion | no disponible (optimizado para NPU Horizon, posiblemente cuantización fija) |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | other (no especificada) |
| Formato de pesos | no disponible (probablemente .pt o .onnx, no especificado) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura BEVFormer (ECCV 2022) con una modificación clave: el backbone de extracción de características es HENet, una implementación interna de HEAL (Horizon Embedded AI Library), en lugar del ResNet utilizado en el repositorio original. Las seis imágenes de cámara (tamaño 512×960) pasan por HENet y un cuello FPN para obtener características multi-escala. El ViewTransformer de BEVFormer proyecta estas características a un espacio BEV, y el temporal BEV Encoder agrega información de frames anteriores (aunque en esta configuración `queue_length=1`, es decir, sin contexto temporal). Las características BEV se alimentan de dos cabezas: una de detección 3D que produce cajas delimitadoras con velocidad (10 clases) y una de ocupación semántica que genera un grid de ocupación de 18 clases. El entrenamiento se realiza de forma conjunta para ambas tareas, probablemente sobre el dataset nuScenes (según el archivo de configuración referenciado). No se proporcionan detalles sobre el número de tokens de entrenamiento, composición del dataset o técnicas de alineación como RLHF/DPO.

## Capacidades

- Detección de objetos 3D en múltiples cámaras: genera cajas delimitadoras 3D con velocidad para 10 clases (típicamente vehículos, peatones, etc.).
- Predicción de ocupación semántica: produce un grid de ocupación con 18 clases semánticas, útil para planificación de movimiento.
- Fusión multi-cámara: procesa simultáneamente seis vistas de cámara para construir una representación BEV unificada.
- Multitarea simultánea: detección y ocupación se calculan en una sola pasada, reduciendo latencia y coste computacional.
- Optimizado para hardware embebido: diseñado para ejecutarse en NPU Horizon J6M, con soporte de compilación HEAL.
- No incluye capacidades de generación de texto, tool calling, agentes ni razonamiento simbólico; es exclusivamente un modelo de percepción visual.

## Casos de uso

- Conducción autónoma de nivel 2-4: el modelo proporciona percepción 3D en tiempo real a partir de cámaras, permitiendo detección de obstáculos y comprensión del entorno para sistemas de asistencia al conductor.
- Sistemas ADAS (Advanced Driver Assistance Systems): integrable en unidades de control electrónico para funciones como frenado de emergencia, control de crucero adaptativo o aviso de colisión.
- Robótica móvil: puede adaptarse a robots de reparto o vehículos industriales que necesiten navegar en entornos dinámicos con cámaras como único sensor.
- Simulación de conducción: útil para generar anotaciones automáticas de escenas sintéticas o para validar algoritmos de planificación en entornos virtuales.
- Investigación en percepción BEV: sirve como referencia para estudiar la fusión de tareas de detección y ocupación, y para comparar backbones eficientes en hardware embebido.
- Despliegue en plataformas Horizon: al estar optimizado para J6M, es adecuado para prototipos y productos que utilicen el kit de desarrollo Horizon, con herramientas de compilación HEAL.

## Benchmarks y rendimiento

La model card proporciona métricas de precisión medidas con la configuración `march = March.NASH_M` (J6M) y la versión HEAL 0.0.2 / hbdk4-compiler 4.11.11 / horizon_plugin_pytorch 3.3.10.

| Metrica | Valor |
|---|---|
| NDS (nuScenes Detection Score) | 0.3573 |
| mAP (mean Average Precision) | 0.3017 |
| Occ mIoU (Occupancy mean Intersection over Union) | 0.3146 |

No se han publicado resultados comparativos con otros modelos en la información disponible. Estos valores corresponden a una configuración específica de hardware y compilación, por lo que pueden variar en otras plataformas.

## Requisitos de hardware

- El modelo está diseñado para ejecutarse en la NPU Horizon J6M (march NASH_M), no en GPUs convencionales.
- Requiere el stack de software HEAL: `heal 0.0.2`, `hbdk4-compiler 4.11.11` y `horizon_plugin_pytorch 3.3.10` para compilar y desplegar.
- No se especifican requisitos de VRAM ni de GPU para inferencia en otros dispositivos.
- El tamaño del repositorio es de 0.2 GB, lo que sugiere que los pesos son relativamente ligeros, pero no se indica el número de parámetros.
- Para ejecutarlo en hardware estándar (GPU), sería necesario convertir los pesos y adaptar el código, lo que no está documentado.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos. El BEVFormer original (con backbone ResNet) es la referencia arquitectónica, pero no se han publicado métricas de este modelo con HENet en el mismo contexto. Se puede señalar que el BEVFormer original reporta un NDS de aproximadamente 0.517 en nuScenes (según el paper), pero este dato no está incluido en la información proporcionada y no debe tomarse como comparación directa. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Licencia "other" sin especificar: no se detallan los términos de uso, lo que puede implicar restricciones para uso comercial o modificación. Se recomienda contactar con el autor antes de utilizarlo en producción.
- Dependencia de hardware específico: el modelo está optimizado para Horizon J6M y su rendimiento en otras plataformas no está garantizado.
- Sin contexto temporal: la configuración `queue_length=1` elimina la agregación temporal que BEVFormer original utiliza, lo que puede reducir la precisión en escenas con objetos en movimiento.
- Solo visión por cámara: no incorpora LiDAR ni radar, por lo que su rendimiento puede degradarse en condiciones de baja iluminación o climatología adversa.
- No se han documentado sesgos ni riesgos de alucinación (al ser un modelo de percepción, estos conceptos no aplican directamente), pero la detección puede fallar en casos poco representados en el entrenamiento.
- El tamaño del modelo y los parámetros totales no se han publicado, lo que dificulta estimar su huella de memoria y coste computacional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OpenExploer/bevformer_henet_camera_multitask
- Repositorio oficial de BEVFormer: https://github.com/fundamentalvision/BevFormer
- Paper de BEVFormer: https://arxiv.org/abs/2203.17270
- Archivo de configuración de referencia (sparse4d_qat): https://github.com/yingxie285/sparse4d_qat/blob/main/samples/ai_toolchain/horizon_model_train_sample/scripts/configs/lidar_bevfusion/bevformer_henet_camera_multitask_nuscenes_pretrain.py

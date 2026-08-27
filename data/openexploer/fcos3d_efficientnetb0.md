# OpenExploer/fcos3d_efficientnetb0

## Resumen

FCOS3D (EfficientNet-b0) es un modelo de detección de objetos 3D monocular, desarrollado por OpenExploer para su despliegue en los aceleradores Horizon Journey (J6). Extiende el detector 2D anchor-free FCOS al dominio 3D, utilizando una única imagen frontal (CAM_FRONT) para predecir cajas 3D con centro, profundidad, tamaño, orientación y clase. El modelo combina un backbone EfficientNet-b0 con un cuello BiFPN y una cabeza de detección FCOS3DHead, y está entrenado sobre el conjunto de datos nuScenes.

La relevancia de este modelo radica en su optimización para inferencia en hardware embebido de bajo consumo, logrando una latencia de 1,89 ms y 652 FPS en la configuración J6M, con un consumo de memoria de 18,4 MB. Está diseñado para aplicaciones de conducción autónoma y percepción 3D en tiempo real, donde la eficiencia computacional es crítica. El repositorio incluye métricas de precisión (NDS 0,312 y mAP mono 0,2101) y de rendimiento para diferentes variantes del chip J6.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-b0 + BiFPN + FCOS3DHead (fully-convolutional anchor-free) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | float, calibration, qat, hbm |
| Idiomas soportados | no aplica |
| Licencia | other (no especificada) |
| Formato de pesos | no disponible (probablemente .pt o .onnx, no confirmado) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura FCOS3D descrita en el paper arXiv:2104.10956, adaptada con un backbone EfficientNet-b0 (con `include_top=False`, activación ReLU y sin capas SE) y un cuello BiFPN con 3 stacks y 64 canales de salida. La cabeza de detección FCOS3DHead predice por cada punto de la feature map las dimensiones de la caja 3D: offset del centro, profundidad, tamaño, orientación y clase, con `group_reg_dims=(2,1,3,1,2)` y 10 clases. La pérdida combina FocalLoss, SmoothL1Loss y CrossEntropyLoss.

El entrenamiento se realiza en dos fases: primero un modelo en punto flotante de alta precisión, y posteriormente un ajuste fino con cuantización (QAT) para obtener un modelo de punto fijo. Los datos de entrenamiento provienen del dataset nuScenes, aunque no se especifica el número exacto de imágenes o épocas. El modelo está optimizado para el compilador hbdk4 y el plugin `horizon_plugin_pytorch` (versiones indicadas en la model card).

## Capacidades

- Detección de objetos 3D monocular a partir de una única imagen frontal (cámara CAM_FRONT).
- Predicción de cajas 3D con clase, centro, tamaño y orientación (10 clases de objetos).
- Post-procesado con NMS (máximo 100 detecciones por imagen).
- Inferencia de alta velocidad en hardware Horizon Journey (J6M, J6P, J6B).
- Soporte de cuantización (QAT, calibración, HBM) para despliegue eficiente.
- No incluye capacidades de lenguaje, tool calling ni agentes.

## Casos de uso

- Conducción autónoma: detección de vehículos, peatones y otros objetos en tiempo real a partir de la cámara frontal, con latencia inferior a 2 ms en el chip J6M.
- Sistemas avanzados de asistencia al conductor (ADAS): integración en unidades de procesamiento embebidas para alertas de colisión y frenado automático.
- Robótica móvil: percepción 3D para navegación y evitación de obstáculos en entornos interiores o exteriores.
- Vigilancia y seguridad: análisis de escenas con cámaras fijas para contar objetos y estimar su posición 3D.
- Prototipado de algoritmos de detección 3D: sirve como baseline eficiente para investigar mejoras en arquitecturas o estrategias de cuantización.
- Despliegue en flotas de vehículos: al estar optimizado para chips de bajo consumo, puede ejecutarse en múltiples unidades con requisitos mínimos de refrigeración y energía.

## Benchmarks y rendimiento

La model card proporciona métricas de precisión y rendimiento para la configuración `March.NASH_M` (J6M). No se incluyen comparaciones con otros modelos.

| Metrica | float | calibration | qat | hbm |
|---|---|---|---|---|
| NDS | 0,312 | 0,3044 | 0,3099 | 0,3098 |
| mono mAP | 0,2101 | 0,2042 | 0,2067 | 0,207 |

| March | latencia (ms) | FPS | Uso de memoria (MB) |
|---|---|---|---|
| J6M | 1,89 | 652,39 | 18,40 |
| J6P | 1,49 | 3310,89 | 19,10 |
| J6B | 6,59 | 183,42 | 14,00 |

Nota: las métricas de rendimiento se miden con un solo núcleo y ocho hilos para FPS, y un solo núcleo y un hilo para latencia. La memoria es el pico de uso de DDR.

## Requisitos de hardware

- Diseñado exclusivamente para los aceleradores Horizon Journey (J6M, J6P, J6B). No se proporcionan requisitos para GPU estándar.
- La inferencia requiere el runtime de Horizon (hbdk4, horizon_plugin_pytorch) y el compilador correspondiente.
- No es posible ejecutarlo en GPUs de consumo (RTX, etc.) sin una conversión manual del modelo, que no está documentada.
- Para desarrollo y validación, se puede utilizar el kit de herramientas HAT (Horizon Algorithm Toolkit) sobre CPU, pero la inferencia en tiempo real solo es viable en los chips J6.
- El tamaño del repositorio es de 0,3 GB, lo que sugiere que los pesos ocupan aproximadamente 300 MB (posiblemente en formato de punto flotante o cuantizado).

## Comparativa con modelos similares

No se dispone de datos comparativos con otros detectores 3D monocular en la información proporcionada. El modelo original FCOS3D (paper arXiv:2104.10956) utiliza un backbone ResNet-101 y se evalúa en nuScenes, pero no se han publicado resultados comparativos con esta variante EfficientNet-b0. Se recomienda consultar el repositorio oficial de mmdetection3d para benchmarks adicionales.

## Limitaciones y advertencias

- La licencia es "other" y no se especifican los términos exactos. Es necesario contactar con el autor o revisar los archivos del repositorio antes de un uso comercial.
- El modelo solo procesa una única cámara frontal (CAM_FRONT), por lo que no cubre la visión de 360 grados que ofrecen otros sistemas con múltiples cámaras.
- Las métricas de precisión (NDS 0,312, mAP 0,2101) son relativamente bajas en comparación con detectores 3D basados en LiDAR o en múltiples vistas, lo que limita su uso en aplicaciones de seguridad crítica sin validación adicional.
- El rendimiento declarado (FPS, latencia) depende de la configuración específica del chip J6 y de las condiciones de medición; puede variar en entornos reales.
- No se proporcionan detalles sobre el dataset de entrenamiento (número de imágenes, distribución de clases) ni sobre posibles sesgos.
- El modelo está pensado para despliegue en hardware Horizon; no es directamente utilizable en otros frameworks (TensorFlow, PyTorch estándar) sin adaptación.

## Enlaces

- HuggingFace: https://huggingface.co/OpenExploer/fcos3d_efficientnetb0
- Repositorio oficial (mmdetection3d): https://github.com/open-mmlab/mmdetection3d
- Paper: https://arxiv.org/abs/2104.10956
- Documentación de entrenamiento (Horizon OpenExplorer): https://doc.oe.horizon.auto/3.2.0/en/guide/advanced_content/hat/examples/fcos3d.html
- Documentación de configuración (D-Robotics): https://developer.d-robotics.cc/api/v1/fileData/horizon_j5_open_explorer_en_doc/hat/source/tutorials/detailed_config.html
- Blog de despliegue en chips J6: https://developer.horizon.auto/blog/10372

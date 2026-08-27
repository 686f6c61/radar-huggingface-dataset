# litert-community/YOLACT-ResNet50-LiteRT

## Resumen

YOLACT-ResNet50-LiteRT es un modelo de segmentación de instancias en tiempo real diseñado para ejecutarse íntegramente en la GPU de dispositivos móviles mediante el runtime LiteRT (antes TFLite). Desarrollado por la comunidad LiteRT, este modelo adapta la arquitectura YOLACT (ICCV 2019) —ResNet50 como backbone, FPN, protonet y cabezas de detección— a un grafo TFLite de 125 MB que se ejecuta sin fallback a CPU. El decode ligero (NMS y combinación lineal de máscaras) se realiza en el host, lo que permite alcanzar una latencia de aproximadamente 41 ms por grafo en un Pixel 8a.

El modelo resuelve el problema de segmentación de instancias en tiempo real en dispositivos con recursos limitados, un área tradicionalmente dominada por modelos pesados que requieren servidores o GPUs de escritorio. Su relevancia actual radica en que ofrece una alternativa práctica para aplicaciones móviles de realidad aumentada, edición de imágenes y análisis de vídeo, con soporte para aceleración por GPU y NPU en hardware comercial. La licencia MIT permite su uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLACT-ResNet50 (CNN pura, sin convoluciones deformables) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | TFLite (grafo GPU) + priors.bin (float32) |

## Arquitectura y entrenamiento

YOLACT (You Only Look At CoefficienTs) es una arquitectura totalmente convolucional para segmentación de instancias en tiempo real. El modelo LiteRT utiliza el backbone ResNet50 con FPN (Feature Pyramid Network), una red protonet que genera 32 máscaras prototipo, y cabezas de detección que predicen localizaciones, confianzas y coeficientes de máscara. Los pesos provienen del repositorio oficial `dbolya/yolact` (checkpoint `yolact_resnet50_54_800000`), entrenado sobre COCO con 80 clases. El grafo TFLite se convierte íntegramente a GPU (138/138 nodos en el delegate, 1 partición) con una correlación de 0.99999–1.0 respecto a PyTorch en las cuatro salidas crudas. Se aplicó un parche al stem de ResNet50: el `MaxPool2d(padding=1)` se reemplazó por un padding a cero seguido de maxpool sin padding, ya que el PADV2 con `-inf` era rechazado por los drivers Mali. El decode (SSD decode, NMS por clase y combinación lineal de máscaras) se ejecuta en el host, no en el grafo.

## Capacidades

- Segmentación de instancias en tiempo real sobre 80 clases de COCO (personas, vehículos, animales, objetos cotidianos).
- Detección de objetos con bounding boxes y máscaras por instancia.
- Ejecución completa en GPU móvil mediante LiteRT `CompiledModel` con acelerador GPU, sin fallback a CPU.
- Soporte de aceleración NPU (Hexagon) en dispositivos Snapdragon, con latencias inferiores a la GPU.
- Interfaz de uso en Kotlin (Android) y Python (ai-edge-litert).
- Decode host-side flexible: permite ajustar umbrales de confianza, IoU y top-k sin recompilar el grafo.
- Entrada de imagen fija de 550x550 píxeles en formato BGR normalizado.

## Casos de uso

- Realidad aumentada en móvil: el modelo puede segmentar objetos en tiempo real para superponer contenido virtual sobre ellos. Su latencia de ~41 ms en GPU (o ~14 ms en NPU) permite experiencias interactivas fluidas en dispositivos de gama media y alta.
- Edición de fotos con selección automática: al segmentar instancias individuales, se pueden recortar, reemplazar fondos o aplicar filtros a objetos concretos en una imagen, todo en el dispositivo sin enviar datos a la nube.
- Análisis de vídeo en directo para conteo de objetos: la segmentación por instancias permite contar personas o vehículos en escenas de vídeo, útil en aplicaciones de aforo o monitorización de tráfico.
- Asistencia visual para personas con discapacidad: una app puede identificar y segmentar objetos del entorno en tiempo real, ayudando a describir escenas o evitar obstáculos.
- Robótica móvil y drones: el modelo puede ejecutarse en una placa con GPU integrada (como Jetson o teléfonos) para segmentar obstáculos o zonas de aterrizaje, con la ventaja de ser ligero y de código abierto.
- Automatización de inspección visual en entornos industriales: segmentar piezas o defectos en imágenes capturadas por cámaras móviles, permitiendo control de calidad en campo sin infraestructura de servidor.

## Benchmarks y rendimiento

El modelo card reporta latencias medidas con la herramienta estándar `benchmark_model` en un Pixel 8a (Tensor G3, Android 16), con 10 iteraciones de calentamiento y 50 medidas:

| Runtime | Backend | Grafo en GPU | Latencia media |
|---|---|---|---|
| LiteRT `CompiledModel` (`LITERT_CL`) | GPU | 138/138 | ~41 ms |
| TFLite `benchmark_model` (`TfLiteGpuDelegateV2`) | GPU (OpenCL) | 138/138 | 130.4 ms |
| TFLite `benchmark_model` | CPU (XNNPACK, 4 hilos) | — | 1426.2 ms |

Además, se midió en un Samsung Galaxy S26 (Snapdragon 8 Elite Gen 5, Hexagon v81, Android 16) con LiteRT `CompiledModel` 2.2.0, 5 calentamientos y 50 medidas (mediana):

| Backend | Inferencia (mediana / mínima) | Carga |
|---|---|---|
| NPU (Hexagon v81) | 14.34 ms / 13.89 ms | 158 ms |
| GPU (Adreno) | 38.37 ms / 31.57 ms | 2060 ms |

No se han publicado resultados de benchmarks de precisión (mAP, etc.) en la información disponible.

## Requisitos de hardware

- Dispositivo móvil con GPU compatible con OpenCL o Vulkan (para el delegate GPU de LiteRT). El modelo se ha validado en Pixel 8a (Tensor G3) y Galaxy S26 (Adreno).
- Para aceleración NPU se requiere un SoC Snapdragon con Hexagon v81 o superior (por ejemplo, Snapdragon 8 Elite Gen 5).
- No requiere VRAM dedicada; la memoria se asigna en el dispositivo móvil. El tamaño del grafo es de 125 MB, más los buffers de entrada/salida.
- Opciones de despliegue: LiteRT `CompiledModel` (recomendado), TFLite clásico con `TfLiteGpuDelegateV2`, o CPU con XNNPACK (mucho más lento, ~1.4 s).
- El decode host-side (NMS y combinación de máscaras) se ejecuta en CPU, por lo que se necesita un procesador razonable para mantener la tasa de fotogramas.
- Para desarrollo, se puede usar Python con `ai-edge-litert` en escritorio, aunque el objetivo principal es Android.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de segmentación de instancias móviles en la información proporcionada. Como referencia cualitativa, YOLACT-ResNet50-LiteRT se basa en la arquitectura YOLACT original (dbolya/yolact), que reporta ~33.5 mAP en COCO con ResNet50, pero esa cifra no está confirmada en esta conversión LiteRT. Otros modelos de segmentación móvil como DeepLabV3 o Mask R-CNN Lite no tienen una implementación equivalente en LiteRT con las mismas características de tiempo real, por lo que no se puede establecer una comparación numérica fiable.

## Limitaciones y advertencias

- El modelo está entrenado únicamente con COCO (80 clases), por lo que no reconoce objetos fuera de ese conjunto.
- La entrada es fija a 550x550 píxeles; imágenes con otras resoluciones deben redimensionarse, lo que puede afectar a la precisión en objetos pequeños.
- El decode host-side requiere implementar manualmente el SSD decode, NMS y la combinación lineal de máscaras; no está incluido en el grafo TFLite.
- La latencia reportada depende del dispositivo y del runtime; en GPUs Mali (como las de algunos dispositivos MediaTek) puede haber problemas de compatibilidad con ciertos operadores, aunque el modelo se ha parcheado para evitar el PADV2 con `-inf`.
- El uso de la NPU requiere que el dispositivo tenga soporte Hexagon y que LiteRT compile el grafo en el primer arranque (tarda ~12 s en el Galaxy S26).
- No se han publicado métricas de precisión (mAP) para esta conversión específica, por lo que el rendimiento real en términos de calidad de segmentación no está verificado.
- La licencia MIT permite uso comercial, pero los pesos originales de YOLACT provienen de un proyecto con la misma licencia; se recomienda revisar los términos del repositorio original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/YOLACT-ResNet50-LiteRT
- Repositorio de archivos: https://huggingface.co/litert-community/YOLACT-ResNet50-LiteRT/tree/main
- README en GitHub (LiteRT-Models): https://github.com/john-rocky/LiteRT-Models/blob/main/yolact/README.md
- Repositorio original de YOLACT: https://github.com/dbolya/yolact
- Paper YOLACT (arXiv): https://arxiv.org/abs/1904.02689
- Notebook de ejemplo en Colab: https://colab.research.google.com/github/tugstugi/dl-colab-notebooks/blob/master/notebooks/YOLACT.ipynb

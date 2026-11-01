# Blaize-AI/YOLOPOSE11m_COCOKeypoint

## Resumen

YOLOPOSE11m_COCOKeypoint es una adaptación del modelo YOLO11m-pose de Ultralytics, especializado en detección de poses humanas mediante estimación de keypoints del dataset COCO Keypoints 2017. El modelo original se distribuye bajo licencia AGPL-3.0 y está desarrollado por Ultralytics; esta variante concreta ha sido publicada por Blaize-AI, que ha realizado optimizaciones específicas de hardware para su ejecución sobre aceleradores de IA Blaize Xplorer mediante el SDK Picasso.

La relevancia de esta ficha no reside en el modelo de visión en sí, sino en el proceso de despliegue: Blaize convierte los pesos originales de PyTorch en artefactos `.bm` compilados para su arquitectura Graph Streaming Processor (GSP), una arquitectura basada en grafos orientada a inferencia en el borde con bajo consumo y baja latencia. El repositorio incluye dos variantes de cuantización AMP con resoluciones de entrada distintas (640×384 y 640×640).

Se trata, por tanto, de un modelo de estimación de pose multi-persona para aplicaciones de visión por computador en el borde, no de un modelo de lenguaje. No se dispone de información sobre el número de parámetros, la longitud de contexto ni capacidades generativas, ya que estos conceptos no aplican a esta categoría de modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11m-pose (red convolucional de detección de objetos con cabeza de keypoints; versión 11, tamaño medium) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | INT8 (escalado de punto fijo), BF16, AMP (mezcla INT8 + BF16); las variantes publicadas usan AMP |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | AGPL-3.0 (modelo derivado); modelo original: AGPL-3.0-only OR LicenseRef-Ultralytics-Enterprise-License |
| Formato de pesos | `.bm` (artefacto compilado para Blaize GSP); el original es PyTorch |

## Arquitectura y entrenamiento

El modelo base es YOLO11m-pose de Ultralytics, una red de detección de objetos de la familia YOLO con una cabeza específica para estimación de keypoints humanos. La variante "m" (medium) corresponde al tamaño intermedio de la familia YOLO11. El entrenamiento se realizó sobre COCO Keypoints 2017, un dataset de anotación de 17 keypoints por persona, distribuido bajo licencia CC-BY-4.0 por el COCO Consortium. No se dispone de información sobre el número exacto de épocas, composición detallada del dataset, ni técnicas de aumento de datos empleadas en el entrenamiento original.

La aportación de Blaize-AI consiste en la compilación y optimización del modelo para la arquitectura GSP de sus aceleradores Xplorer, mediante el SDK Picasso. El resultado son artefactos `.bm` que no son pesos en el sentido tradicional (safetensors, GGUF, ONNX), sino binarios ejecutables por el hardware Blaize. Se ofrecen dos variantes con resoluciones de entrada distintas: 640×384 y 640×640, ambas con cuantización AMP. No se documentan innovaciones arquitectónicas propias más allá de la optimización de despliegue.

## Capacidades

- Detección de personas y estimación de 17 keypoints corporales por instancia, según el esquema de COCO Keypoints.
- Procesamiento de imágenes con resolución de entrada configurable (640×384 o 640×640 según variante).
- Inferencia optimizada para aceleradores Blaize Xplorer con arquitectura GSP.
- Soporte de cuantización INT8, BF16 y AMP para equilibrar precisión y velocidad.
- No dispone de capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo, al ser un modelo de visión puro.
- No se documentan capacidades de seguimiento temporal (tracking) ni estimación de pose 3D.

## Casos de uso

- Análisis de postura en entornos industriales: el modelo puede detectar operarios y estimar su postura corporal para identificar ergonomías incorrectas o riesgos de seguridad en tiempo real sobre hardware de borde Blaize.
- Videovigilancia inteligente en el borde: al ejecutarse en aceleradores Xplorer de bajo consumo, permite desplegar detección de personas y poses en cámaras IP sin enviar vídeo a la nube, reduciendo latencia y preservando privacidad.
- Análisis deportivo y biomecánico: la estimación de keypoints permite extraer métricas de movimiento (ángulos articulares, simetría) en grabaciones o streams de vídeo para entrenadores y fisioterapeutas.
- Control de calidad en fabricación: detección de presencia y postura de operarios en líneas de montaje para verificar que las tareas se ejecutan conforme a procedimiento.
- Robótica colaborativa: integración de la detección de pose humana para que brazos robóticos ajusten su comportamiento en función de la posición de las personas en el espacio de trabajo.
- Aplicaciones de realidad aumentada y fitness: seguimiento de ejercicios en dispositivos con acelerador Blaize, estimando la pose del usuario para corregir movimientos en tiempo real.
- Análisis de aforo y comportamiento en retail: detección de personas y orientación corporal para estudiar flujos de clientes en tiendas, ejecutando la inferencia localmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de precisión (mAP, AP de keypoints), latencia ni throughput para las variantes compiladas. Tampoco se proporcionan comparativas con el modelo original en PyTorch.

## Requisitos de hardware

- Acelerador Blaize Xplorer (hardware GSP propietario); el modelo no está pensado para ejecutarse en GPU convencional en su formato `.bm`.
- SDK Picasso de Blaize instalado y configurado para cargar y ejecutar los artefactos `.bm`.
- VRAM estimada: no disponible (no aplica; el modelo se ejecuta en el acelerador Blaize, no en GPU).
- GPU recomendadas: no disponible para el formato `.bm`; para el modelo original en PyTorch se requeriría una GPU convencional, pero no se documentan requisitos concretos.
- Compatibilidad con GPU de consumo: no disponible para el artefacto `.bm`; el modelo original YOLO11m-pose es ligero y podría ejecutarse en GPU de consumo, pero no se aportan datos específicos.
- Opciones de despliegue: exclusivamente mediante el SDK Picasso y el acelerador Blaize Xplorer según la documentación; se puede inspeccionar el modelo con `blaize-modeltool info`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| YOLOPOSE11m_COCOKeypoint (esta ficha) | no disponible | 640×384 / 640×640 | AMP (INT8+BF16) | AGPL-3.0 | Blaize Xplorer (GSP) |
| YOLO11m-pose (Ultralytics, original) | no disponible | configurable | FP32/FP16/INT8 | AGPL-3.0 o enterprise | GPU/CPU |
| Otros modelos de pose (p. ej. HRNet, MediaPipe Pose) | no disponible | variable | variable | variable | GPU/CPU/móvil |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El modelo está compilado para hardware Blaize Xplorer; no es portable a GPU, CPU u otros aceleradores en su formato `.bm`.
- Requiere el SDK Picasso y un acelerador Blaize, lo que limita su uso a entornos con ese hardware específico.
- Licencia AGPL-3.0: el uso comercial en servicios en red puede obligar a liberar el código fuente de la aplicación que lo integra; para uso propietario sería necesaria la licencia enterprise de Ultralytics.
- El modelo original se distribuye bajo doble licencia (AGPL-3.0 o enterprise); el usuario debe revisar y cumplir los términos.
- Es un modelo de estimación de pose 2D; no proporciona profundidad, pose 3D ni seguimiento temporal de identidades.
- No se documentan sesgos específicos, pero al entrenarse sobre COCO Keypoints 2017 puede presentar menor precisión en poses ocluidas, personas de pequeño tamaño en la imagen o contextos alejados de la distribución del dataset.
- No se aportan métricas de precisión ni de latencia, por lo que no es posible evaluar su idoneidad para producción sin pruebas propias.
- Blaize declara que el modelo es contenido de terceros y no ofrece garantías sobre su funcionamiento ni sobre posibles infracciones de propiedad intelectual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Blaize-AI/YOLOPOSE11m_COCOKeypoint
- Repositorio de Ultralytics: https://www.github.com/ultralytics/ultralytics
- Dataset COCO Keypoints: https://cocodataset.org
- Sitio de Blaize: https://www.blaize.com

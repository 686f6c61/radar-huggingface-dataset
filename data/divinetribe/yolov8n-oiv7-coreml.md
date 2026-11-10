# divinetribe/yolov8n-oiv7-coreml

## Resumen

YOLOv8n OIV7 CoreML es una conversión del modelo de detección de objetos YOLOv8 nano de Ultralytics, reentrenado sobre el conjunto Open Images V7 y empaquetado en formato CoreML (`.mlpackage`) para inferencia en dispositivo en iPhone, iPad y Macs con Apple Silicon. Lo publica el usuario `divinetribe` como parte del proyecto RealTime AI Camera, y su valor diferencial es que cubre 601 clases de objetos —frente a las 80 de COCO—, lo que lo hace mucho más adecuado para aplicaciones de cámara de propósito general.

El modelo resuelve un problema muy concreto para desarrolladores iOS: Ultralytics distribuye los pesos originales en formato PyTorch (`.pt`), pero no existe una build oficial de CoreML para la variante OIV7 en Hugging Face. Esta conversión cubre ese hueco y permite incorporar un detector de 601 clases a un proyecto Xcode en minutos, en lugar de tener que resolver manualmente la exportación, la decodificación de tensores y la supresión de no máximos (NMS) en Swift.

Con aproximadamente 3,2 millones de parámetros (variante nano), un peso de 6,8 MB en CoreML y un rendimiento medido de entre 7 y 15+ FPS según el chip (A11 Bionic en adelante), es una pieza de inferencia en el borde (edge) pensada para tiempo real, no para servidores. La licencia es GPL-3.0 con opción comercial dual según el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN tipo YOLOv8 (detector de una etapa, anchor-free con cabeza desacoplada) |
| Parametros totales | no disponible (variante "nano" de YOLOv8; el autor no publica el recuento exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible (el `.mlpackage` se distribuye ya compilado; no se detalla el esquema de cuantización) |
| Idiomas soportados | en (etiquetas de clase en inglés) |
| Licencia | GPL-3.0 (con opción de licencia comercial dual según el autor) |
| Formato de pesos | CoreML `.mlpackage` (6,8 MB) y PyTorch `.pt` (7,2 MB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es YOLOv8 en su variante nano, un detector de objetos de una sola etapa con diseño anchor-free y cabeza desacoplada (separación de ramas de clasificación y regresión de caja). El modelo base fue entrenado por Ultralytics sobre el conjunto de datos Open Images V7 de Google, que aporta 601 categorías de objetos, y posteriormente convertido a CoreML por el autor de este repositorio. No se dispone de información sobre el número exacto de tokens de imagen, la composición detallada del dataset ni si hubo fases de ajuste fino adicionales más allá del entrenamiento original de Ultralytics.

La innovación técnica destacable no está en la arquitectura, sino en la cadena de conversión documentada en la model card. El autor advierte de que la exportación ingenua (`YOLO(...).export(format="coreml")`) produce un `.mlpackage` que carga en Xcode y ejecuta sin errores, pero que emite un tensor crudo de forma `[1, 605, 8400]` (4 coordenadas de caja + 601 probabilidades de clase sobre 8400 posiciones de anclaje) que Vision no convierte automáticamente en `VNRecognizedObjectObservation`. La solución documentada pasa por exportar con `nms=True` para que la supresión de no máximos se integre en el grafo CoreML y Vision entregue observaciones listas para usar, evitando decodificar cajas y mapear índices a etiquetas manualmente en Swift. También se menciona el uso de CoreML junto con Metal Performance Shaders y la Apple Neural Engine, con limitación térmica automática del framerate.

## Capacidades

- Detección de objetos en imagen estática y en flujo de vídeo en tiempo real, con 601 clases de Open Images V7 (desde `Accordion` y `Alpaca` hasta `Woodpecker`, `Wrench` y `Zucchini`).
- Salida de cajas delimitadoras con etiqueta de clase y puntuación de confianza, integrable mediante `VNCoreMLRequest` y `VNRecognizedObjectObservation`.
- Inferencia en dispositivo con aceleración por Apple Neural Engine, GPU (Metal) y CPU, configurable mediante `MLModelConfiguration.computeUnits`.
- Exportación a otros formatos desde los pesos PyTorch incluidos: ONNX, TensorFlow Lite y CoreML.
- Gestión térmica y de batería en la app de referencia, con limitación automática del framerate según el estado térmico del dispositivo.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades de lenguaje: es exclusivamente un modelo de visión por computador.

## Casos de uso

- Aplicaciones de cámara en tiempo real en iOS: el modelo se integra como `.mlpackage` en Xcode y procesa fotogramas de la cámara con Vision, entregando detecciones con etiqueta y confianza a entre 10 y 15 FPS en iPhone 12 o superior, suficiente para superponer cajas en pantalla sin retardo perceptible.
- Etiquetado y catalogación automática de fotos en la galería del dispositivo: al cubrir 601 clases (animales, vehículos, herramientas, alimentos, instrumentos), permite clasificar y buscar imágenes localmente sin enviar datos a la nube, lo que resulta relevante por privacidad.
- Accesibilidad para personas con discapacidad visual: un pipeline que capture vídeo con la cámara trasera, ejecute el detector y sintetice por voz las clases detectadas y su posición aproximada, aprovechando la inferencia local y la baja latencia.
- Automatización de inventario o control de stock mediante la cámara del móvil: la amplitud de categorías de OIV7 (herramientas, utensilios, alimentos) permite reconocer productos sin entrenar un modelo propio, útil en pequeños comercios o almacenes.
- Filtrado y moderación de contenido en aplicaciones de fotografía: detección de categorías sensibles o no deseadas antes de publicar, ejecutada en el propio dispositivo para evitar costes de servidor y cumplir requisitos de privacidad.
- Prototipado rápido de demos de visión en iOS: al incluir tanto el `.mlpackage` listo para usar como los pesos `.pt` reexportables a ONNX o TFLite, sirve como base para validar una idea en iPhone y luego portarla a Android u otros entornos.
- Aplicaciones educativas o de realidad aumentada: reconocimiento de objetos del entorno (instrumentos musicales, animales, alimentos) para superponer información contextual en tiempo real sobre el vídeo de la cámara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (mAP, precisión por clase) en la información disponible. El autor únicamente proporciona mediciones de velocidad de inferencia en dispositivos reales dentro de su aplicación:

| Dispositivo | FPS medios | Notas |
|---|---|---|
| iPhone X | ~7-8 | A11 Bionic, sin optimización de Neural Engine para operadores nuevos |
| iPhone 12 | ~10 | A14, acelerado por Neural Engine |
| iPhone 14 Pro | ~12-15 | A16, ruta totalmente optimizada |
| iPhone 15 Pro / 16 | ~15+ | A17 Pro / A18 |

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el modelo pesa 6,8 MB en CoreML y opera sobre memoria unificada en dispositivos Apple.
- GPU recomendadas: Apple Neural Engine de las series A11 Bionic en adelante; en Macs, Apple Silicon (M1 o superior) con aceleración Metal.
- Compatibilidad con GPU de consumo: no está pensado para GPUs NVIDIA o AMD; el formato CoreML está atado al ecosistema Apple. Los pesos `.pt` permiten exportar a ONNX y ejecutar en otras plataformas, pero el autor no documenta rendimiento en ellas.
- Opciones de despliegue: CoreML y Vision en iOS/iPadOS/macOS; los pesos PyTorch se pueden servir con Ultralytics o exportar a ONNX Runtime y TensorFlow Lite.
- Latencia y throughput: 7-8 FPS en iPhone X, ~10 FPS en iPhone 12, 12-15 FPS en iPhone 14 Pro y 15+ FPS en iPhone 15 Pro/16, con limitación térmica automática.

## Comparativa con modelos similares

| Modelo | Clases | Formato | Contexto de uso | Licencia |
|---|---|---|---|---|
| YOLOv8n OIV7 CoreML (este) | 601 (Open Images V7) | CoreML `.mlpackage` + PyTorch `.pt` | Inferencia en dispositivo Apple | GPL-3.0 (comercial dual) |
| YOLOv8n COCO (Ultralytics) | 80 (COCO) | PyTorch `.pt`, exportable | Entrenamiento e inferencia multiplataforma | AGPL-3.0 |
| YOLOv8s/m/l/x OIV7 (Ultralytics) | 601 (Open Images V7) | PyTorch `.pt` | Mayor precisión a costa de más cómputo | AGPL-3.0 |

Frente a la variante COCO de 80 clases, este modelo multiplica por unas ocho veces el vocabulario de detección, a cambio de un mayor coste de decodificación y de un conjunto de clases más heterogéneo. Frente a las variantes mayores de YOLOv8 (s, m, l, x), la nano es la única que el autor empaqueta para CoreML en este repositorio, priorizando el framerate en móvil sobre la precisión. No se dispone de datos de mAP comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado métricas de precisión (mAP) ni evaluaciones por clase; se desconoce el rendimiento real en categorías poco frecuentes de Open Images V7.
- El conjunto OIV7 tiene un desbalanceo notable entre clases (algunas con muy pocos ejemplos), lo que puede traducirse en detecciones menos fiables para categorías raras.
- El modelo está entrenado y etiquetado en inglés; las etiquetas de salida son cadenas en inglés que la aplicación debe traducir si necesita otro idioma.
- La licencia GPL-3.0 impone obligaciones de copyleft sobre el código que distribuya el modelo; el autor menciona una licencia comercial dual, pero no se detallan sus términos en la información disponible.
- El framerate cae en dispositivos antiguos (7-8 FPS en iPhone X) y se ve afectado por el estado térmico; en aplicaciones de tiempo real conviene implementar saltos de fotogramas y gestión térmica.
- La conversión a CoreML requiere exportar con `nms=True` para obtener `VNRecognizedObjectObservation`; sin ello, el desarrollador debe implementar la decodificación y el NMS en Swift, con el coste de CPU asociado.
- El repositorio figura con 0,0 GB de tamaño y 40 descargas en el momento de la consulta, lo que sugiere un proyecto joven con poca validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/divinetribe/yolov8n-oiv7-coreml
- Repositorio del proyecto RealTime AI Camera: https://github.com/nicedreamzapp/RealTimeAICam
- Integración de referencia en Swift: https://github.com/nicedreamzapp/RealTimeAICam/blob/main/YOLOv8Processor.swift
- App en App Store: https://apps.apple.com/us/app/realtime-ai-cam/id6751230739
- Documentación de Ultralytics sobre Open Images V7: https://docs.ultralytics.com/datasets/detect/open-images-v7/
- Modelo base YOLOv8 de Ultralytics: https://huggingface.co/Ultralytics/YOLOv8

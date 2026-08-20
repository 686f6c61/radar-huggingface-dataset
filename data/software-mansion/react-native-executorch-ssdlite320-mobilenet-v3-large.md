# software-mansion/react-native-executorch-ssdlite320-mobilenet-v3-large

## Resumen

Este repositorio aloja el modelo de deteccion de objetos SSDLite320 MobileNetV3 Large, desarrollado originalmente por el equipo de PyTorch Vision y exportado por Software Mansion para su uso en aplicaciones React Native mediante el runtime ExecuTorch. El modelo resuelve el problema de la deteccion de objetos en tiempo real directamente en el dispositivo, sin necesidad de conexion a servidores, lo que reduce la latencia y preserva la privacidad de los datos.

Es relevante porque proporciona una ruta directa para integrar un modelo de vision por computador probado en entornos moviles con las herramientas de desarrollo de React Native. El paquete incluye los pesos exportados en formato `.pte` para los backends `xnnpack` (Android) y `coreml` (iOS), listos para usarse con el runtime de ExecuTorch. El tamano del repositorio es de 0.1 GB y fue creado en diciembre de 2024, actualizandose posteriormente en agosto de 2025.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SSDLite320 con backbone MobileNetV3 Large |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (exportado a formato `.pte` para backends xnnpack y coreml) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | bsd-3-clause |
| Formato de pesos | `.pte` (ExecuTorch) |

## Arquitectura y entrenamiento

La arquitectura es una variante ligera de la familia SSD (Single Shot MultiBox Detector) que utiliza un backbone MobileNetV3 Large y una cabeza de deteccion SSDLite, disenada para ofrecer un equilibrio optimo entre precision y velocidad en dispositivos con recursos limitados. El modelo original de torchvision se entrena tipicamente en el dataset COCO, aunque los datos de entrenamiento de esta exportacion no se detallan en la informacion proporcionada.

La exportacion se realizo con ExecuTorch version 1.1.0, generando archivos `.pte` para los backends `xnnpack` (orientado a CPU en Android) y `coreml` (orientado a aceleracion en iOS). No se garantiza compatibilidad con versiones anteriores o posteriores del runtime; si se usa fuera de la libreria React Native ExecuTorch, hay que verificar la version exacta del runtime.

## Capacidades

- Deteccion de objetos en imagenes: genera cajas delimitadoras y etiquetas de clase para multiples objetos.
- Inferencia en tiempo real en dispositivos moviles gracias a la optimizacion de ExecuTorch.
- Soporte de backends especificos para iOS (`coreml`) y Android (`xnnpack`).
- Integracion directa con React Native mediante la libreria `react-native-executorch`.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-step.
- No es un modelo multimodal; unicamente procesa imagenes.

## Casos de uso

- Realidad aumentada en aplicaciones moviles: el modelo puede detectar objetos del mundo real para superponer elementos virtuales. Su baja latencia en dispositivos moviles permite una experiencia interactiva fluida.
- Conteo de inventario en almacenes: mediante una app de React Native, se puede escanear estanterias para contar productos y detectar elementos fuera de lugar, automatizando tareas de reposicion.
- Accesibilidad para personas con discapacidad visual: una aplicacion puede alertar al usuario de obstaculos u objetos relevantes en su entorno, funcionando completamente offline.
- Moderacion de contenido en redes sociales: se puede integrar en un flujo de subida de imagenes para detectar objetos prohibidos (armas, drogas, etc.) directamente en el dispositivo, reduciendo la carga del servidor.
- Seguridad en el hogar o industria: deteccion de presencia humana en tiempo real para activar alarmas o notificaciones, con la ventaja de no enviar video a la nube.
- Automatizacion de procesos industriales: deteccion de piezas o defectos en lineas de montaje mediante una aplicacion movil que analiza la imagen de la camara del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye mediciones de mAP, latencia ni throughput para los backends `xnnpack` o `coreml`.

## Requisitos de hardware

- No requiere VRAM dedicada, ya que esta disenado para ejecutarse en dispositivos moviles.
- Compatible con dispositivos Android (backend `xnnpack`) y iOS (backend `coreml`).
- No requiere GPU de escritorio; se ejecuta en la CPU o GPU movil segun el backend.
- Despliegue mediante la libreria `react-native-executorch` en proyectos React Native.
- El tamano del repositorio es de 0,1 GB, por lo que el modelo es ligero y cabe en la mayoria de dispositivos moviles actuales.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Formato | Licencia |
|---|---|---|---|---|
| SSDLite320 MobileNetV3 Large (este) | SSDLite + MobileNetV3 | Vision | `.pte` (ExecuTorch) | BSD-3-Clause |
| SSD MobileNetV2 (torchvision) | SSD + MobileNetV2 | Vision | PyTorch | BSD-3-Clause |
| YOLO-Nano | YOLO (CNN) | Vision | ONNX, PyTorch | GPL-3.0 |

No se dispone de datos de benchmarks comparativos en la informacion proporcionada. El modelo de este repositorio se distingue por estar pre-exportado y optimizado para React Native, mientras que las alternativas suelen requerir un proceso de conversion adicional.

## Limitaciones y advertencias

- No se garantiza compatibilidad con versiones del runtime de ExecuTorch distintas a la 1.1.0. Si se usa fuera de la libreria React Native ExecuTorch, hay que verificar la version exacta del runtime.
- Es un modelo de vision, no un LLM: no puede generar texto, responder preguntas ni realizar razonamiento.
- No se especifican los datos de entrenamiento en la ficha del repositorio, por lo que pueden existir sesgos en las clases detectadas (dependiendo del dataset original de torchvision, tipicamente COCO).
- La licencia BSD-3-Clause permite uso comercial, pero se recomienda revisar la licencia del modelo base de torchvision.
- No se proporcionan metricas de precision ni latencia, por lo que el rendimiento real debe validarse en el dispositivo objetivo.
- El modelo puede alucinar en el sentido de detectar objetos erroneos si se usa en contextos muy distintos a los de su entrenamiento.

## Enlaces

- [Repositorio en HuggingFace](https://huggingface.co/software-mansion/react-native-executorch-ssdlite320-mobilenet-v3-large)
- [Documentacion del modelo en torchvision](https://pytorch.org/vision/main/models/generated/torchvision.models.detection.ssdlite320_mobilenet_v3_large.html)
- [Documentacion oficial de ExecuTorch](https://pytorch.org/executorch/stable/index.html)
- [Libreria React Native ExecuTorch en npm](https://www.npmjs.com/package/react-native-executorch)
- [Nota de compatibilidad de ExecuTorch en GitHub](https://github.com/pytorch/executorch/blob/11d1742fdeddcf05bc30a6cfac321d2a2e3b6768/runtime/COMPATIBILITY.md)
- [Licencia del modelo base (torchvision)](https://github.com/pytorch/vision/blob/main/LICENSE)

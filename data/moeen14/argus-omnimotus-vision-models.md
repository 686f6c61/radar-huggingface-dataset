# moeen14/argus-omnimotus-vision-models

## Resumen

Argus Omnimotus Vision Models es una colección de modelos de visión por computador publicada por el autor moeen14 para Agibot, una plataforma de robótica agrícola modular y de código abierto. El paquete no contiene un modelo de lenguaje, sino un conjunto de detectores y segmentadores derivados de la familia YOLO (librería Ultralytics) más un pipeline opcional de segmentación guiada por prompts basado en NanoSAM (ResNet18 como encoder y MobileSAM como decoder). Resuelve tareas concretas de percepción para un robot agrícola: identificación de cultivos y plataformas, verificación de tareas desde cámara cenital, segmentación de raíles para navegación BEV y segmentación opcional con prompts.

La relevancia actual del release es su orientación a despliegue en el borde: incluye exportaciones ONNX FP32 de referencia, binarios INT8 HEF compilados para Hailo-8 y exportaciones NCNN en FP32, FP16, INT8 y mixtas para Raspberry Pi 5, además de instrucciones para generar motores TensorRT en Jetson Orin Nano. El repositorio ocupa 0,4 GB y no registra descargas ni likes en el momento de la consulta, lo que sugiere un proyecto de investigación reciente y de nicho.

La entrada de los modelos YOLO es de 1 x 3 x 640 x 640 en RGB normalizada a [0, 1], con letterboxing, decodificación de salidas, supresión de no máximos y umbrales específicos por tarea implementados en el código de despliegue enlazado. La licencia es AGPL-3.0 para los modelos derivados de YOLO, mientras que los componentes NanoSAM conservan Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detectores y segmentadores derivados de YOLO (Ultralytics); pipeline NanoSAM con encoder ResNet18 y decoder MobileSAM para segmentación por prompts |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelos de visión; entrada de imagen 1 x 3 x 640 x 640) |
| Tipos de cuantizacion | FP32 (ONNX de referencia), INT8 (HEF para Hailo-8), FP32/FP16/INT8/mixta INT8 (NCNN para Raspberry Pi 5); TensorRT generado en destino |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | AGPL-3.0 para los modelos derivados de YOLO; Apache-2.0 para los componentes NanoSAM |
| Formato de pesos | ONNX, HEF (Hailo-8), NCNN, TensorRT (generado en el dispositivo) |

## Arquitectura y entrenamiento

La colección se compone de seis modelos canónicos consumidos por el repositorio del robot: `crop_detector.onnx` (detección de objetos con cámara inferior, clases `gCrop`, `platform`, `ycrop`, `servo`), `highcam_platform.onnx` (detección cenital y verificación de tareas, clases `ball`, `gcrop`, `platform`, `ycrop`), `highcam_rail.onnx` (segmentación de raíles y navegación BEV, clase `rail`), `lanesegyv8.onnx` (modelo anterior de segmentación de raíles conservado para reproducción), `resnet18_image_encoder.onnx` y `mobile_sam_mask_decoder.onnx` (pipeline NanoSAM opcional de segmentación guiada por prompts). Los tamaños y hashes SHA-256 de estos seis ficheros se registran en `manifest.json`.

El directorio `edge/` contiene las variantes YOLO evaluadas en el artículo: exportaciones ONNX FP32 portables en `edge/onnx/`, ficheros HEF INT8 compilados para Hailo-8 en `edge/hailo8/` y exportaciones NCNN FP32, FP16, INT8 y mixtas INT8 para Raspberry Pi 5 en `edge/ncnn/`. Los motores TensorRT se generan intencionadamente en el Jetson de destino porque la compatibilidad depende de la versión instalada de TensorRT, CUDA y del entorno de GPU. El repositorio de GitHub incluye los comandos de compilación y evaluación para Raspberry Pi 5, Hailo-8 y Jetson Orin Nano.

No se proporcionan en la información disponible datos sobre el número de tokens de entrenamiento, composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO, dado que se trata de modelos de visión y no de lenguaje. El dataset asociado es `moeen14/argus-omnimotus-vision-dataset`. Las innovaciones técnicas destacables son la compilación multiacelerador (Hailo-8, NCNN para Raspberry Pi 5, TensorRT para Jetson) y la separación entre modelos canónicos de runtime y variantes de evaluación en el borde.

## Capacidades

- Detección de objetos con cámara inferior para cultivos y plataformas (clases `gCrop`, `platform`, `ycrop`, `servo`).
- Detección cenital y verificación de tareas (clases `ball`, `gcrop`, `platform`, `ycrop`).
- Segmentación de raíles para navegación BEV (clase `rail`).
- Segmentación guiada por prompts mediante NanoSAM (encoder ResNet18 y decoder MobileSAM).
- Exportación y despliegue en múltiples aceleradores: ONNX, Hailo-8 (HEF INT8), NCNN (Raspberry Pi 5) y TensorRT (Jetson Orin Nano).
- Verificación de integridad de modelos mediante hashes SHA-256 en `manifest.json`.
- No dispone de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Percepción de cultivos en robot agrícola: `crop_detector.onnx` detecta `gCrop`, `ycrop` y `platform` desde la cámara inferior para que el robot identifique el cultivo y la plataforma sobre la que operar.
- Verificación de tareas desde cámara cenital: `highcam_platform.onnx` detecta `ball`, `gcrop`, `platform` y `ycrop` para confirmar que una tarea se ha completado correctamente.
- Navegación autónoma sobre raíles: `highcam_rail.onnx` segmenta la clase `rail` y alimenta la navegación BEV del robot.
- Segmentación interactiva con prompts: el pipeline NanoSAM (`resnet18_image_encoder.onnx` + `mobile_sam_mask_decoder.onnx`) permite segmentar regiones indicadas por el operador o por otro módulo del sistema.
- Despliegue en Raspberry Pi 5: las exportaciones NCNN en FP32, FP16, INT8 y mixta INT8 permiten ejecutar los detectores en hardware de bajo consumo.
- Aceleración en Hailo-8: los ficheros HEF INT8 permiten inferencia de bajo consumo en el acelerador Hailo-8 para el robot en campo.
- Despliegue en Jetson Orin Nano: la generación de motores TensorRT en destino permite aprovechar la GPU del Jetson con la versión concreta de TensorRT y CUDA instalada.
- Reproducción de resultados de investigación: `lanesegyv8.onnx` se conserva para reproducir los resultados del artículo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo concreto y de la cuantización.
- GPU recomendadas: no se especifican GPU de escritorio; el proyecto está orientado a aceleradores de borde (Hailo-8, Raspberry Pi 5, Jetson Orin Nano).
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ONNX Runtime (exportaciones FP32 de referencia), Hailo-8 (HEF INT8), NCNN (Raspberry Pi 5), TensorRT (generado en Jetson Orin Nano).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Tareas | Formatos de despliegue | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Argus Omnimotus Vision Models | YOLO + NanoSAM | Detección, segmentación, segmentación por prompts | ONNX, HEF, NCNN, TensorRT | AGPL-3.0 (YOLO) / Apache-2.0 (NanoSAM) | Hugging Face, GitHub |
| YOLOv8 / YOLO11 (Ultralytics) | YOLO | Detección, segmentación | ONNX, TensorRT, NCNN, etc. | AGPL-3.0 | Ultralytics |
| MobileSAM | SAM ligero | Segmentación por prompts | PyTorch, ONNX | Apache-2.0 | GitHub |
| NanoSAM | SAM para el borde | Segmentación por prompts | ONNX, TensorRT | Apache-2.0 | NVIDIA Jetson |

No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- El rendimiento puede variar con la colocación de la cámara, la geometría del cultivo, la iluminación, la apariencia del suelo y las versiones de la cadena de herramientas del acelerador.
- Es necesario validar los umbrales de confianza y el comportamiento de seguridad en la plataforma objetivo antes de la operación autónoma.
- Los modelos están destinados a investigación y educación con el banco de pruebas Agibot; no se documenta un uso en producción a gran escala.
- La licencia AGPL-3.0 de los modelos derivados de YOLO impone obligaciones de copyleft para uso en red y trabajos derivados; los componentes NanoSAM conservan Apache-2.0, por lo que cada fichero tiene su licencia aplicable.
- No hay información sobre sesgos, riesgo de alucinación ni limitaciones idiomáticas, al no ser un modelo de lenguaje.
- El repositorio no registra descargas ni likes, lo que indica una validación comunitaria limitada.
- Los motores TensorRT deben generarse en el dispositivo de destino; no se distribuyen binarios precompilados para Jetson.

## Enlaces

- Hugging Face: https://huggingface.co/moeen14/argus-omnimotus-vision-models
- Repositorio GitHub: https://github.com/moeen14/argus-omnimotus-repo
- Artículo arXiv: https://arxiv.org/abs/2611.10235v1
- Sitio web del proyecto: https://moeen14.github.io/agibot-homepage/
- Dataset: https://huggingface.co/datasets/moeen14/argus-omnimotus-vision-dataset
- CITATION.cff: https://github.com/moeen14/argus-omnimotus-repo/blob/main/CITATION.cff

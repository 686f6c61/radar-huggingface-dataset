# Mithil-AI/yolov8-license-plate-detector

## Resumen

El modelo `Mithil-AI/yolov8-license-plate-detector` es un detector de matrículas basado en la arquitectura YOLOv8-XS, implementada con KerasCV y TensorFlow. Ha sido desarrollado por Mithil-AI con el objetivo de ofrecer una solución de detección de matrículas optimizada para despliegue en dispositivos edge, sin depender de licencias propietarias como la de Ultralytics. El modelo resuelve el problema de la detección de matrículas en tiempo real sobre hardware de bajo consumo, como Raspberry Pi, Android o dispositivos Apple.

La arquitectura utiliza el backbone `yolo_v8_xs_backbone` de KerasCV, deliberadamente poco profundo y optimizado para restricciones móviles. Los pesos preentrenados se distribuyen en tres formatos: Keras 3 (41.9 MB), TFLite con cuantización INT8 (3.8 MB) y CoreML (6.3 MB). El modelo está pensado para su uso en aplicaciones de visión por computador, no para generación de texto, por lo que no dispone de longitud de contexto en el sentido de los modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8-XS con backbone KerasCV |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de detección de objetos) |
| Tipos de cuantizacion | INT8 (TFLite), sin cuantizar (Keras) |
| Idiomas soportados | en (etiqueta del modelo; no aplica a un modelo de visión) |
| Licencia | MIT |
| Formato de pesos | .keras (Keras 3), .tflite, .mlpackage |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura YOLOv8-XS, una variante extra small de YOLOv8, implementada sobre el framework KerasCV. El backbone `yolo_v8_xs_backbone` es intencionadamente superficial para reducir el coste computacional y facilitar la ejecución en dispositivos móviles y de borde. El proceso de entrenamiento se apoya en un dataset personalizado de Roboflow en formato Pascal VOC, denominado `license-plate-detection-wienp`. No se ha publicado el número de imágenes, la composición exacta del dataset ni el número de épocas de entrenamiento.

Entre las innovaciones técnicas destacan el uso de *static edge graphing* para evitar los fallos de exportación debidos a grafos dinámicos en CoreML y TFLite, así como el hardcodeo de una capa de Non-Max Suppression (NMS) multiclase directamente en la salida del modelo, con umbrales de IoU de 0.30 y de confianza de 0.50. Para TFLite se aplica una cuantización INT8 con un generador de datos representativo, y para CoreML se configura `ComputeUnit.ALL` para aprovechar el Apple Neural Engine.

## Capacidades

- Detección de matrículas en imágenes y vídeo en tiempo real.
- Inferencia optimizada para dispositivos edge: Raspberry Pi, Android, Coral Edge TPU, iOS y macOS.
- Exportación a TFLite con cuantización INT8 y a CoreML como paquete `.mlpackage`.
- Integración con el Apple Neural Engine mediante `ComputeUnit.ALL`.
- Post-procesamiento de detecciones con Non-Max Suppression multiclase integrada en la salida del modelo.
- No aplica: generación de texto, razonamiento, tool calling, soporte de agentes, capacidades multilingües o modos de pensamiento. Es exclusivamente un detector de objetos.

## Casos de uso

- Control de acceso en aparcamientos: el modelo puede ejecutarse en una Raspberry Pi conectada a una cámara, detectando la matrícula de cada vehículo en tiempo real e integrándose con un sistema de apertura de barrera.
- Vigilancia de tráfico en carretera: instalado en cámaras edge, permite la detección de matrículas para el seguimiento de vehículos sin necesidad de enviar el vídeo a un servidor central.
- Aplicaciones móviles Android: gracias a la versión TFLite INT8, el modelo puede integrarse en una app que escanee matrículas con la cámara del dispositivo, con un peso de solo 3.8 MB.
- Aplicaciones iOS y macOS: mediante el paquete CoreML, el modelo se integra en Swift/Xcode y utiliza el Apple Neural Engine para una detección eficiente y de baja latencia.
- Sistemas de peaje automático: en puntos de cobro, el modelo puede identificar matrículas en imágenes capturadas por cámaras fijas, facilitando la facturación automática.
- Análisis de flotas de vehículos: en un pipeline de visión por computador con Keras/TensorFlow, el modelo puede procesar lotes de imágenes para inventariar vehículos y asociar matrículas en sistemas de gestión logística.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como mAP, precisión, recall ni comparaciones con otros modelos de detección de matrículas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Dado el tamaño de los pesos (41.9 MB en Keras, 3.8 MB en TFLite), la inferencia puede ejecutarse en CPUs de bajo consumo sin VRAM dedicada.
- GPU recomendadas: no disponible en la documentación. Para entrenamiento se sugiere cualquier GPU con suficiente memoria para el backbone extra small, aunque no se especifica un modelo concreto.
- Compatibilidad con GPU de consumo: sí, el modelo es ligero y puede ejecutarse en GPUs de gama media e incluso en integradas, aunque el objetivo principal es el despliegue en dispositivos edge.
- Opciones de despliegue: Keras/TensorFlow para Python y servidores, TFLite para Raspberry Pi, Android y Coral Edge TPU, y CoreML para iOS, iPadOS y macOS. No aplican vLLM, llama.cpp ni Ollama, que son herramientas para modelos de lenguaje.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Característica | Mithil-AI/yolov8-license-plate-detector | Koushim/yolov8-license-plate-detection |
|---|---|---|
| Framework | KerasCV / TensorFlow | Ultralytics YOLOv8 |
| Licencia | MIT | No disponible |
| Formatos de pesos | .keras, .tflite, .mlpackage | No disponible |
| Tamaño del repositorio | 0.1 GB | No disponible |
| Enfoque de despliegue | Edge (TFLite INT8, CoreML) | No disponible |
| Rendimiento | No disponible | No disponible |

La información disponible no permite una comparativa más completa en términos de parámetros, contexto o rendimiento, ya que no se han publicado datos de evaluación para ninguno de los dos modelos.

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos específicos, pero al estar entrenado en un dataset concreto de Roboflow, es probable que el modelo tenga un rendimiento desigual según el país, el formato de matrícula o las condiciones de iluminación.
- Riesgo de alucinación: en el contexto de la detección de objetos, el riesgo se traduce en falsos positivos y falsos negativos. No se han publicado tasas de error, por lo que no es posible estimar la fiabilidad en producción.
- Limitaciones de contexto o idioma: no aplica, al ser un modelo de visión.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificaciones. La model card indica que no se requiere licencia de Ultralytics, lo que facilita el despliegue en entornos empresariales.
- Caveat importante para producción: el modelo está optimizado para un dataset específico (probablemente matrículas de Viena, según el nombre `wienp`). Antes de usarlo en producción, es recomendable validar su precisión con datos locales y, si es necesario, reentrenarlo con un dataset más amplio.

## Enlaces

- Hugging Face: https://huggingface.co/Mithil-AI/yolov8-license-plate-detector
- Blog Medium: https://medium.com/@mithilmaske/i-built-a-license-plate-detector-that-runs-on-a-raspberry-pi-no-ultralytics-license-required-7b1d15eaa069
- Repositorio GitHub: https://github.com/mithilai/YOLOv8-License-Plate
- Dataset Roboflow: https://universe.roboflow.com/haeun-kim-ri91b/license-plate-detection-wienp

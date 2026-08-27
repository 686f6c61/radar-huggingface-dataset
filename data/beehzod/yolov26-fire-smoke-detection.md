# Beehzod/yolov26-fire-smoke-detection

## Resumen

El modelo `yolov26-fire-smoke-detection` es un detector de objetos en tiempo real especializado en la detección de fuego y humo. Desarrollado por Beehzod, se trata de un fine-tune del modelo `yolov26-fire-detection` de SalahAlHaismawi, que a su vez se basa en la arquitectura YOLOv26-S de Ultralytics. El modelo ha sido entrenado sobre un dataset de 7.673 imágenes de entrenamiento, 925 de validación y 960 de prueba, con dos clases: `Fire` y `Smoke`. Su relevancia radica en su capacidad para integrarse en sistemas de vigilancia y alerta temprana de incendios, ofreciendo un equilibrio entre precisión y velocidad. La arquitectura YOLOv26-S es una variante ligera de la familia YOLO, optimizada para inferencia en tiempo real en dispositivos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv26-S (detector de una etapa basado en CNN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imágenes de 640x640 píxeles) |
| Tipos de cuantizacion | no disponible (Ultralytics permite exportación a FP16, INT8, etc., pero no se especifica) |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | cc-by-4.0 |
| Formato de pesos | PyTorch (.pt) y formatos exportables (ONNX, TensorRT, etc.) |

## Arquitectura y entrenamiento

YOLOv26-S es un detector de una etapa basado en una red neuronal convolucional, con un backbone tipo CSPDarknet y una cabeza de detección que predice cajas delimitadoras y clases directamente sobre la imagen. El modelo fue fine-tuneado a partir de un checkpoint preentrenado en detección de fuego y humo, y posteriormente ajustado con el dataset descrito. El entrenamiento se realizó durante 100 épocas con un tamaño de imagen de 640x640, batch de 16, optimizador AdamW, learning rate inicial de 0.001 y early stopping con paciencia de 20 épocas. No se especifica el uso de técnicas como RLHF o DPO, ya que es un modelo de visión supervisado. El dataset de entrenamiento no está detallado en la model card, pero se menciona que proviene de una recopilación de imágenes de incendios y humo en diversos entornos.

## Capacidades

- Detección de objetos en tiempo real: identifica fuego y humo en imágenes y vídeos, devolviendo cajas delimitadoras y puntuaciones de confianza.
- Integración con el ecosistema Ultralytics: compatible con la API de Python de Ultralytics, lo que facilita su uso en pipelines existentes.
- Exportación a múltiples formatos: puede convertirse a ONNX, TensorRT, CoreML, etc., para despliegue en diferentes plataformas.
- Inferencia en streaming: adecuado para análisis de vídeo en tiempo real gracias a su arquitectura ligera.
- No soporta tool calling ni razonamiento multimodal; es exclusivamente un detector de objetos.

## Casos de uso

- Vigilancia forestal: el modelo puede analizar imágenes de cámaras instaladas en bosques para detectar incendios en fases tempranas, permitiendo una respuesta rápida. Su tamaño reducido permite ejecutarlo en dispositivos perimetrales con recursos limitados.
- Seguridad en infraestructuras: integración en sistemas de videovigilancia de naves industriales, almacenes o plantas de energía para detectar fuego o humo de forma automática y activar alarmas.
- Monitorización de vehículos: detección de incendios en túneles, aparcamientos o estaciones de servicio mediante cámaras fijas, mejorando la seguridad vial.
- Sistemas domésticos inteligentes: uso en cámaras de seguridad del hogar para alertar de posibles incendios, con la ventaja de que el modelo puede ejecutarse en una Raspberry Pi o similar.
- Análisis de vídeo forense: procesamiento de grabaciones para localizar eventos de fuego o humo en investigaciones de siniestros.
- Drones de inspección: integración en drones para sobrevolar zonas de riesgo y detectar columnas de humo o llamas, facilitando labores de extinción.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card son los siguientes:

| Metrica | Valor |
|---|---|
| mAP50 | 0.9177 |
| mAP50-95 | 0.8299 |
| Precision | 0.9167 |
| Recall | 0.8958 |

Estos valores corresponden al conjunto de validación retenido. El modelo base `yolov26-fire-detection` reporta un mAP50 de 0.949 en su propio conjunto de datos, aunque con tres clases (fire, smoke, other) y un dataset ligeramente diferente. No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- YOLOv26-S es una variante pequeña, por lo que puede ejecutarse en CPU, aunque para inferencia en tiempo real se recomienda una GPU.
- VRAM estimada: no disponible en la documentación, pero modelos similares de la familia YOLO-n/s requieren entre 1 y 4 GB en FP16 para imágenes de 640x640.
- GPUs recomendadas: NVIDIA GTX 1060 o superior, RTX 3060, RTX 4090, o GPUs de datacenter como A100 o H100 para procesamiento de múltiples streams.
- Es compatible con consumer GPUs de gama media; también puede ejecutarse en dispositivos con NPU o aceleradores como Jetson Nano.
- Opciones de despliegue: Ultralytics (Python), ONNX Runtime, TensorRT, OpenVINO, y herramientas como vLLM no aplican (no es un modelo de lenguaje). Para producción, se puede usar el servidor de inferencia de Ultralytics o exportar a TensorRT para baja latencia.
- Latencia y throughput: no se proporcionan datos específicos, pero en una GPU moderna se esperan decenas de FPS para imágenes de 640x640.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases | mAP50 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yolov26-fire-smoke-detection` (Beehzod) | YOLOv26-S | 2 (Fire, Smoke) | 0.9177 | cc-by-4.0 | Hugging Face |
| `yolov26-fire-detection` (SalahAlHaismawi) | YOLOv26-S | 3 (fire, smoke, other) | 0.949 | no especificada | GitHub / Hugging Face |
| Otros detectores YOLO (p.ej. YOLOv8n) | YOLOv8n | variable | no comparable | AGPL-3.0 | Ultralytics |

El modelo de Beehzod es un fine-tune del de SalahAlHaismawi, con una ligera reducción en mAP50 pero con solo dos clases, lo que puede simplificar la integración en sistemas específicos. No se dispone de comparaciones con otros detectores de incendios en la información proporcionada.

## Limitaciones y advertencias

- El modelo solo detecta dos clases (fuego y humo); no distingue entre tipos de fuego ni otros indicadores como brasas o chispas.
- El rendimiento puede degradarse en condiciones de poca luz, niebla o humo denso que oculte las llamas.
- El dataset de entrenamiento no está documentado en detalle, por lo que puede haber sesgos geográficos o de iluminación que afecten a la generalización.
- La licencia cc-by-4.0 permite uso comercial siempre que se atribuya la autoría, pero el dataset subyacente puede tener una licencia distinta (no especificada).
- No se han publicado resultados de benchmarks independientes; los valores de mAP son declarados por el autor y no verificados.
- Para uso en producción, se recomienda validar el modelo con datos locales y considerar la calibración de umbrales de confianza.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Beehzod/yolov26-fire-smoke-detection
- Repositorio base (SalahAlHaismawi): https://github.com/SalahAlHaismawi/yolov26-fire-detection
- Modelo base en Hugging Face: https://huggingface.co/SalahALHaismawi/yolov26-fire-detection
- Dataset similar en Ultralytics (referencia): https://platform.ultralytics.com/lin-ww/datasets/fire-smoke-detectionyolo26

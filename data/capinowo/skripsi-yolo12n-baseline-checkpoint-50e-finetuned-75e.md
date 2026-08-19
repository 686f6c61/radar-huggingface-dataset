# capinowo/skripsi-yolo12n-baseline-checkpoint-50e-finetuned-75e

## Resumen

El modelo `capinowo/skripsi-yolo12n-baseline-checkpoint-50e-finetuned-75e` es un detector de objetos basado en YOLO12n, la variante nano de la arquitectura YOLOv12, fine-tuneado específicamente para la detección de matrículas de vehículos vietnamitas. El autor, capinowo, parte de un checkpoint base previamente entrenado durante 50 épocas y lo ajusta durante 75 épocas adicionales sobre el conjunto de datos de matrículas de Vietnam (duydieunguyen/licenseplates), transformando las anotaciones de polígono a formato de detección de una sola clase.

El repositorio contiene dos checkpoints: `best.pt`, con el mejor rendimiento de validación (mAP50-95 de 0.90222), y `last.pt`, correspondiente a la última época de entrenamiento, que permite verificar si el modelo había alcanzado una meseta. Aunque no se proporciona información sobre licencia, idiomas o pipeline, los resultados de validación indican un rendimiento muy alto en la tarea de detección de matrículas, lo que lo hace relevante para aplicaciones de control de tráfico, peajes y sistemas de vigilancia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO12n (attention-centric) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (pesos en formato .pt de PyTorch) |
| Idiomas soportados | no disponible (modelo de vision, no textual) |
| Licencia | no disponible |
| Formato de pesos | .pt (PyTorch) |

## Arquitectura y entrenamiento

YOLO12 es una arquitectura de detección de objetos que introduce un mecanismo de atención centrado en la atención (attention-centric), en lugar de los bloques convolucionales tradicionales de versiones anteriores. La variante nano (n) es la más ligera de la familia, diseñada para ejecutarse en dispositivos con recursos limitados. El modelo se entrenó mediante fine-tuning a partir de un checkpoint base de 50 épocas, con los siguientes hiperparámetros: 75 épocas adicionales, tasa de aprendizaje inicial de 0.001, paciencia de 100, tamaño de imagen de 640 píxeles y batch de 16. El dataset de fine-tuning consistió en imágenes de matrículas vietnamitas, donde las anotaciones originales en formato polígono se convirtieron a cajas delimitadoras para detección de una sola clase.

No se detalla el proceso de entrenamiento base (datos, número de tokens, técnicas de regularización), pero la arquitectura YOLO12 se beneficia de mecanismos de atención para mejorar la precisión en la localización de objetos pequeños, como las matrículas.

## Capacidades

- Detección de objetos en tiempo real, específicamente matrículas de vehículos.
- Entrenado para una única clase (matrícula), lo que simplifica la salida del modelo.
- Capacidad de procesar imágenes de 640x640 píxeles (tamaño de entrada configurado).
- Al ser YOLO12n, es adecuado para despliegue en dispositivos edge o con GPU de baja potencia.
- No soporta tareas de lenguaje, visión general ni tool calling, ya que es un detector especializado.

## Casos de uso

- Control de acceso en aparcamientos: el modelo puede detectar matrículas en tiempo real desde cámaras fijas y enviar la información a un sistema de gestión para abrir barreras o registrar entradas.
- Peajes automáticos: integrado en sistemas de cobro electrónico, detecta la matrícula del vehículo y asocia la tarifa correspondiente sin intervención manual.
- Vigilancia de tráfico: análisis de flujo vehicular en carreteras, contando vehículos y extrayendo matrículas para control de infracciones.
- Búsqueda de vehículos robados: conectado a una base de datos, el modelo puede alertar cuando detecta una matrícula denunciada en tiempo real.
- Sistemas de estacionamiento inteligente: detección de matrículas para automatizar el pago en parkings sin barreras.
- Análisis forense de vídeo: procesamiento de grabaciones para extraer matrículas en investigaciones de incidentes.

## Benchmarks y rendimiento

Los resultados de evaluación sobre el conjunto de validación de Vietnam son los siguientes:

| Checkpoint | mAP50-95 | mAP50 | Precision | Recall | F1 |
|---|---|---|---|---|---|
| best.pt | 0.90222 | 0.9946 | 0.99 | 0.98041 | 0.98518 |
| last.pt | 0.89639 | 0.9944 | 0.99028 | 0.97867 | 0.98444 |

Estos valores indican un rendimiento muy alto en la tarea de detección de matrículas vietnamitas, con una precisión y recall superiores al 98%. No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Al ser la variante nano de YOLO12, el modelo es ligero y puede ejecutarse en GPU con poca VRAM (se estima menos de 1 GB en FP16, aunque no se especifica en la documentación).
- Es compatible con GPUs de consumo como la serie RTX 2060 o superior, e incluso puede funcionar en CPU para inferencia a baja velocidad.
- Se puede desplegar con frameworks como Ultralytics (que soporta YOLO12), así como con ONNX Runtime o TensorRT si se exporta a esos formatos.
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de detección de matrículas en la documentación proporcionada. Modelos como YOLOv8n o YOLO11n podrían ser alternativas, pero no hay datos de rendimiento comparables en esta ficha.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente con matrículas vietnamitas; su rendimiento puede degradarse significativamente con matrículas de otros países o formatos diferentes.
- Solo detecta una clase (matrícula), por lo que no es útil para tareas de detección múltiple.
- No se proporciona información sobre la licencia, lo que limita su uso comercial sin verificación previa.
- El entrenamiento se realizó con un dataset específico; puede presentar sesgos hacia las condiciones de iluminación, ángulos o tipos de vehículos presentes en ese conjunto.
- No se han documentado pruebas de robustez ante condiciones adversas (oclusiones, desenfoque, condiciones climáticas extremas).
- El repositorio no incluye instrucciones de uso ni ejemplos de inferencia, lo que puede dificultar su integración.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/capinowo/skripsi-yolo12n-baseline-checkpoint-50e-finetuned-75e)
- [Checkpoint base (50 épocas)](https://huggingface.co/capinowo/yolo12n-baseline-checkpoint)
- [Checkpoint intermedio (35 épocas)](https://huggingface.co/capinowo/yolo12n-baseline-checkpoint-35e)
- [Repositorio oficial de YOLOv12](https://github.com/sunsmarterjie/yolov12)
- [Documentación de YOLO12 en Ultralytics](https://docs.ultralytics.com/models/yolo12)
- [Reproducibilidad del entrenamiento en Zenodo](https://zenodo.org/records/17756379)

# open-noodle/rfdetr-small

## Resumen

El modelo `open-noodle/rfdetr-small` es una exportación en formato ONNX del modelo RF-DETR Small, desarrollado por Roboflow. Este export ha sido preparado por la organización open-noodle para su uso en el proyecto Gallery, con el objetivo de detectar mascotas en imágenes. Se trata de una conversión directa de los pesos preentrenados de COCO, sin ningún ajuste fino posterior, por lo que el modelo conserva las capacidades de detección generalistas del modelo original.

RF-DETR es un detector de objetos en tiempo real basado en la arquitectura DETR (Detection Transformer), que utiliza 300 consultas de predicción y no requiere una etapa de supresión no máxima (NMS). El export incluye un contrato de inferencia explícito: entrada RGB de 512×512 con normalización ImageNet, y salida con cajas normalizadas y logits de clase pre-sigmoid. El modelo es ligero (el repositorio ocupa 0,1 GB) y se distribuye bajo licencia Apache-2.0, lo que facilita su integración en aplicaciones de visión por computador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR Small (DETR basado en Transformer, export ONNX) |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | No disponible (el modelo se distribuye en ONNX float32) |
| Idiomas soportados | No aplica (modelo de vision por computador) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

RF-DETR es un modelo de detección de objetos de Roboflow que sigue la arquitectura DETR. En lugar de anclas y NMS, el modelo genera un conjunto fijo de 300 predicciones mediante consultas aprendidas, lo que simplifica el postprocesado. Este export concreto es un modelo RF-DETR Small con pesos preentrenados en COCO y sin ningún fine-tuning adicional. La model card especifica que la entrada debe ser una imagen RGB redimensionada a 512×512 sin letterbox, normalizada con las estadísticas de ImageNet (media [0.485, 0.456, 0.406], desviación [0.229, 0.224, 0.225]).

La salida del modelo consta de dos tensores: `dets` con forma `[1, 300, 4]` que contiene cajas normalizadas en formato centro, ancho y alto, y `labels` con forma `[1, 300, 91]` que contiene logits de clase pre-sigmoid. Las 300 consultas ya vienen deduplicadas, por lo que no se requiere aplicar NMS. El modelo utiliza el espacio de 91 clases de COCO (90 categorías más fondo), no el espacio contiguo de 80 clases que usan modelos como YOLO.

## Capacidades

- Detección de objetos en 90 categorías de COCO, incluyendo animales como pájaro, gato, perro, caballo, oveja y vaca.
- Salida de 300 propuestas de cajas ya deduplicadas, sin necesidad de aplicar NMS.
- Formato de salida interpretable: cajas normalizadas `[cx, cy, w, h]` y logits pre-sigmoid, lo que permite aplicar un umbral personalizado.
- Optimizado para inferencia en ONNX Runtime con lote fijo de 1 imagen.
- Modelo exclusivamente de visión; no soporta generación de texto, tool calling ni razonamiento de lenguaje natural.
- Apto para tareas de detección de objetos en tiempo real o en sistemas embebidos gracias a su tamaño compacto.

## Casos de uso

- Detección de mascotas en galerías de fotos: el modelo puede integrarse en el proyecto Gallery para etiquetar automáticamente imágenes con perros, gatos u otros animales COCO.
- Vigilancia y análisis de vídeo: al ser un modelo ONNX ligero, puede desplegarse en servidores o en el edge para detectar objetos de interés en flujos de vídeo.
- Sistemas de inventario y conteo: detección de objetos COCO en estanterías o almacenes, por ejemplo para contar cajas o productos genéricos.
- Prototipado rápido de aplicaciones de visión por computador: el contrato de inferencia está bien documentado y permite integrarlo en pipelines Python o C++ sin dependencias de frameworks pesados.
- Análisis de contenido para redes sociales: detección de animales y objetos en imágenes subidas por usuarios para moderación o categorización automática.
- Entornos educativos y de investigación: el modelo sirve como ejemplo práctico de un detector DETR sin NMS, útil para estudiar la arquitectura y el postprocesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 0,1 GB, lo que indica un modelo compacto, pero la VRAM exacta necesaria para inferencia no se ha publicado.
- No hay datos disponibles sobre GPU recomendadas o requisitos de memoria específicos.
- Puede ejecutarse en CPU y GPU mediante ONNX Runtime, ya que el formato ONNX es multiplataforma.
- El modelo no incluye cuantizaciones oficiales; para despliegue en GPU de consumo puede ser necesario convertir el modelo a otros formatos o aplicar cuantización manual.
- Latencia y throughput no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos comparativos con otros modelos de detección de objetos. Para comparar RF-DETR Small con alternativas como YOLO o DETR, sería necesario consultar benchmarks públicos del modelo original de Roboflow, que no están incluidos en esta ficha.

## Limitaciones y advertencias

- El modelo utiliza pesos COCO preentrenados sin fine-tuning. El rendimiento en dominios específicos, como la detección de mascotas, puede ser limitado si las imágenes difieren significativamente del conjunto de entrenamiento original.
- El contrato de inferencia es sensible a errores de preprocesado. Cualquier desviación en la conversión a RGB, el redimensionado sin letterbox, la normalización o la transposición de canales degrada silenciosamente la calidad de los resultados.
- Los logits de clase son pre-sigmoid. Es necesario aplicar una sigmoide y un umbral adecuado para obtener predicciones finales; no hacerlo producirá salidas no interpretables.
- Los identificadores de clase corresponden al espacio de 91 clases de COCO. Si la aplicación espera el espacio contiguo de 80 clases de YOLO, se debe mapear manualmente.
- No soporta tareas de lenguaje, generación de texto ni tool calling.
- La licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantías de rendimiento y sin soporte oficial de Roboflow para este export concreto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-noodle/rfdetr-small
- Repositorio upstream de RF-DETR: https://github.com/roboflow/rf-detr
- Proyecto Gallery: https://github.com/open-noodle/gallery

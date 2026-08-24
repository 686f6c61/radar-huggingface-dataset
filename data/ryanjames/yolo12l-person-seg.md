# RyanJames/yolo12l-person-seg

## Resumen

El modelo `RyanJames/yolo12l-person-seg` es un modelo de segmentación de instancias basado en YOLOv12-large, desarrollado por el usuario RyanJames y publicado en Hugging Face bajo licencia AGPL-3.0. Está diseñado específicamente para detectar y segmentar la clase funcional «persona» en imágenes, ofreciendo artefactos en formato PyTorch y ONNX. El repositorio incluye dos checkpoints: uno original entrenado durante 100 épocas y una versión extendida con 300 épocas adicionales, recomendada para nuevos usos.

El modelo resuelve el problema de la segmentación de personas de forma eficiente y ligera, con un peso de aproximadamente 58 MB en formato PyTorch y 115 MB en ONNX FP32. Su relevancia radica en su integración con el ecosistema Ultralytics, lo que permite una carga directa con `YOLO()` y un despliegue sencillo en aplicaciones de visión por computador. Al estar entrenado únicamente sobre la clase persona, ofrece un rendimiento especializado para tareas de análisis de presencia humana, aunque limita su uso a ese dominio.

La arquitectura se basa en la familia YOLOv12 de Ultralytics, que introduce mecanismos de atención en lugar de las convoluciones tradicionales de versiones anteriores, mejorando la eficiencia y precisión en la detección y segmentación de objetos. No se dispone de datos detallados sobre el número de parámetros, el contexto de entrenamiento (número de tokens, etc.) ni cuantizaciones adicionales más allá del FP32 en ONNX.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv12-seg (variante large) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantizacion | No disponible (solo se ofrecen pesos FP32 en ONNX) |
| Idiomas soportados | No aplica (procesamiento de imágenes) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (`.pt`) y ONNX (`.onnx`) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura YOLOv12-seg de Ultralytics, que reemplaza las convoluciones estándar por bloques de atención para mejorar la extracción de características en tareas de detección y segmentación de instancias. El checkpoint original se entrenó durante 100 épocas sobre el dataset COCO, restringido a la clase «persona». Posteriormente, se realizó una continuación de entrenamiento de 300 épocas adicionales para producir el checkpoint «extended», que el autor recomienda para nuevos despliegues. No se han proporcionado detalles sobre el número exacto de imágenes, el tamaño de lote, ni técnicas de aumento de datos. Los artefactos ONNX fueron exportados en FP32 con entrada fija de 640×640 píxeles, y se verificaron con Ultralytics 8.4.21, PyTorch 2.10.0 y ONNX Runtime 1.24.3.

## Capacidades

- Detección y segmentación de instancias de personas en imágenes.
- Generación de máscaras de segmentación de alta resolución (con `retina_masks=True` se obtienen máscaras a resolución original).
- Salida de cajas delimitadoras, máscaras y confianza.
- Soporte para inferencia en imágenes individuales o lotes mediante Ultralytics.
- Compatible con el ecosistema Ultralytics (entrenamiento, validación, exportación).
- Disponible en formato ONNX para despliegue en entornos de producción sin dependencia de PyTorch.
- No incluye capacidades de tool calling, agentes ni procesamiento multimodal más allá de imágenes.

## Casos de uso

- **Vigilancia y seguridad**: el modelo puede segmentar personas en cámaras de vigilancia para contar o localizar individuos en tiempo real, gracias a su bajo peso y alta velocidad de inferencia.
- **Análisis de multitudes**: al aislar la clase persona, permite medir la densidad de personas en eventos o espacios públicos mediante máscaras de segmentación.
- **Fotografía y edición**: permite separar el fondo de las personas para realizar composiciones o reemplazar fondos, usando las máscaras generadas.
- **Robótica**: en robots móviles, la segmentación de personas facilita la navegación segura evitando obstáculos humanos en entornos dinámicos.
- **Análisis de comportamiento**: en estudios de ergonomía o deporte, se pueden extraer máscaras de personas para analizar posturas o movimientos.
- **Sistemas de conteo**: combinado con técnicas de seguimiento, el modelo puede contar personas en flujos peatonales con alta precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se han proporcionado métricas como mAP, precisión, recall ni comparaciones con otros modelos de segmentación.

## Requisitos de hardware

- El modelo tiene un peso de ~58 MB en formato PyTorch y ~115 MB en ONNX FP32, lo que lo hace adecuado para entornos con recursos limitados.
- La inferencia puede ejecutarse en CPU con tiempos razonables para imágenes de 640×640, aunque para aplicaciones en tiempo real se recomienda una GPU con al menos 4 GB de VRAM.
- GPUs recomendadas: tarjetas de gama media como NVIDIA GTX 1650, RTX 3050 o superiores; también funciona en A100 o H100 para despliegue a gran escala.
- Se puede desplegar con Ultralytics, ONNX Runtime, o en frameworks como TensorRT para optimización.
- El ONNX exportado acepta entrada fija de `[1, 3, 640, 640]`, lo que simplifica la integración en pipelines de servidores de inferencia.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este modelo específico. Como referencia, existen otros modelos de segmentación de personas como YOLOv8-seg, YOLOv11-seg o Mask R-CNN, pero no se han proporcionado resultados de rendimiento para establecer una comparativa objetiva. Por tanto, no se incluye una tabla comparativa.

## Limitaciones y advertencias

- El modelo está entrenado únicamente para la clase «persona», por lo que no detecta otros objetos ni clases.
- Puede presentar errores en situaciones de oclusión, baja iluminación o imágenes con múltiples personas muy próximas, aunque no se han documentado casos específicos.
- La licencia AGPL-3.0 implica que cualquier uso comercial del software debe liberar el código fuente de la aplicación que lo integre, lo que puede ser restrictivo para proyectos propietarios.
- No se proporcionan datos sobre sesgos, pero al entrenarse sobre COCO, puede heredar sesgos presentes en ese dataset (por ejemplo, en cuanto a etnias, contextos geográficos, etc.).
- El checkpoint extendido no ha sido validado con versiones de Ultralytics posteriores a 8.4.21; se recomienda usar la versión fijada en `requirements.txt` para garantizar compatibilidad.
- Los artefactos ONNX tienen entrada fija de 640×640, por lo que si se necesita otra resolución, debe reexportarse el modelo desde el checkpoint PyTorch.

## Enlaces

- [Hugging Face - RyanJames/yolo12l-person-seg](https://huggingface.co/RyanJames/yolo12l-person-seg)
- [Repositorio de archivos del modelo](https://huggingface.co/RyanJames/yolo12l-person-seg/tree/main)
- [Archivo de configuración YOLOv12-seg en GitHub de Ultralytics](https://github.com/ultralytics/ultralytics/blob/main/ultralytics/cfg/models/12/yolo12-seg.yaml)
- [Repositorio de YOLOv12 (NeurIPS 2025) - sunsmarterjie](https://github.com/sunsmarterjie/yolov12) (referencia de arquitectura, no del modelo específico)

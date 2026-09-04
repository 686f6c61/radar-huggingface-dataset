# open-noodle/rfdetr-nano

## Resumen

El modelo `open-noodle/rfdetr-nano` es una exportación ONNX del detector de objetos RF-DETR Nano creado por Roboflow, preparada y publicada por el usuario `open-noodle` para su uso en el proyecto Gallery. Está pensado para tareas de detección de mascotas (perros, gatos, aves, caballos, etc.) sin necesidad de reentrenamiento, ya que utiliza los pesos preentrenados en el dataset COCO sin ningún ajuste posterior.

La arquitectura subyacente es un Detection Transformer (DETR) en su variante Nano, que produce hasta 300 detecciones por imagen mediante consultas de decodificación. El repositorio ocupa solo 0.1 GB e incluye un único archivo `detection/model.onnx`, lo que lo convierte en una opción muy ligera para integraciones en tiempo real o en entornos donde se busque un modelo de visión compacto. Al ser un modelo de detección puro, no tiene ventana de contexto ni capacidades de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR (Detection Transformer, variante Nano) |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (formato ONNX, sin cuantizacion posterior) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17) |

## Arquitectura y entrenamiento

El modelo es una exportación ONNX de RF-DETR Nano, un detector de objetos basado en la arquitectura DETR. A diferencia de los detectores de una etapa como YOLO, RF-DETR procesa la imagen con un backbone convolucional y un decodificador transformer que emite directamente cajas y clases a partir de un conjunto de 300 consultas. Una característica destacada es que las consultas ya vienen deduplicadas, por lo que no se requiere la supresión de no máximos (NMS) en el postprocesado.

Los pesos provienen del entrenamiento en COCO y no han sido afinados para ninguna tarea concreta. El archivo `detection/model.onnx` usa opset 17 y batch size 1. El contrato de inferencia es estricto: la entrada debe ser una imagen RGB redimensionada a 384×384 con resize cuadrado (sin letterbox), normalizada con estadísticas de ImageNet (mean `[0.485, 0.456, 0.406]`, std `[0.229, 0.224, 0.225]`) y transpuesta a CHW con dimensión de batch. La salida consta de dos tensores: `dets` con cajas normalizadas en formato `cx, cy, w, h` y `labels` con logits pre-sigmoid para un espacio de 91 clases COCO (90 categorías más el fondo, no el espacio contiguo de 80 clases de YOLO).

## Capacidades

- Detección de objetos de 90 categorías COCO, incluyendo animales domésticos como perro, gato, pájaro, caballo, oveja y vaca.
- Generación de hasta 300 detecciones por imagen con cajas ya deduplicadas; no se necesita aplicar NMS, lo que simplifica el pipeline.
- Procesamiento de imágenes RGB de 384×384 con normalización ImageNet.
- Compatible con runtime ONNX (opset 17) y batch de 1, lo que permite integrarlo con ONNX Runtime, Windows ML, OpenVINO u otros motores de inferencia ONNX.
- Al ser un modelo de visión puro, no genera texto, no tiene soporte de tool calling ni razonamiento multi-paso.

## Casos de uso

- Detección de mascotas en aplicaciones de galería de fotos: el modelo permite etiquetar automáticamente las imágenes que contienen perros o gatos, lo que facilita la búsqueda y organización de álbumes.
- Vigilancia doméstica con cámaras de seguridad: al detectar la presencia de un animal en las grabaciones, se puede disparar una alerta o guardar el clip sin necesidad de que el usuario revise todas las imágenes.
- Cámaras trampa para vida silvestre: gracias a las categorías COCO, sirve para identificar aves, caballos o vacas en imágenes tomadas en exteriores, con un coste computacional bajo.
- Recorte automático en herramientas de edición fotográfica: la caja de detección devuelta por el modelo se usa para generar un recorte de la mascota en la foto, sin intervención manual.
- Automatización en granjas: monitorizar corrales mediante cámaras para detectar bovinos, ovinos u otros animales de las categorías COCO, permitiendo contajes o alertas de presencia.
- Filtrado de eventos en sistemas de perimetral: distinguir entre un animal y un humano en vídeo, reduciendo falsas alarmas en entornos donde se busca detectar intrusos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no proporciona métricas de precisión, latencia ni comparaciones con otros modelos, por lo que no es posible valorar su rendimiento más allá de las características de diseño del RF-DETR original.

## Requisitos de hardware

- El repositorio ocupa 0.1 GB y el archivo ONNX es el único peso, lo que lo sitúa en la categoría de modelos muy ligeros.
- VRAM estimada: inferior a 1 GB para inferencia en float32 con batch de 1.
- Ejecución en CPU es viable: ONNX Runtime puede inferir el modelo sin GPU con una latencia aceptable para tareas no críticas.
- GPU recomendadas: cualquier tarjeta NVIDIA de la serie GTX 10xx o posterior, RTX 20xx/30xx/40xx, o una A100/H100 para despliegues con mayor volumen de peticiones.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), Windows ML, OpenVINO y ONNX Runtime Mobile para aplicaciones móviles.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos relatives sobre otros modelos comparables en la información proporcionada. El propio repositorio no ofrece tablas de comparación ni cifras frente a alternativas como otras variantes RF-DETR o detectores YOLO.

## Limitaciones y advertencias

- Sesgos heredados del dataset COCO: el modelo puede degradar su rendimiento en imágenes no fotográficas (dibujos, infrarrojos, estilos artísticos) o con objetos en ángulos inusuales.
- Al no estar afinado para detección de mascotas, la precisión en animales poco comunes o en escenas complejas puede ser limitada; es necesario calibrar el umbral de confianza.
- El preprocesamiento debe respetar exactamente el contrato (RGB, resize 384×384 sin letterbox, normalización ImageNet, transposición HWC a CHW). Cualquier desviación degrada el resultado de forma silenciosa.
- Las etiquetas de clase se interpretan en el espacio de 91 clases COCO. Usar un índice del espacio contiguo de 80 clases de YOLO provocará asignaciones incorrectas de categorías.
- La licencia Apache-2.0 permite uso comercial, pero es necesario mantener el aviso de licencia y respetar los términos heredados de RF-DETR, especialmente en lo que respecta a los componentes Plus bajo licencia PML 1.0 cuando se usen modelos de la familia RF-DETR con otros tamaños.
- No es un modelo multimodal ni de lenguaje, por lo que no admite entrada de texto, instrucciones ni generación de respuestas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-noodle/rfdetr-nano
- Modelo original de Roboflow en HuggingFace: https://huggingface.co/Roboflow/rf-detr-nano
- Repositorio upstream RF-DETR: https://github.com/roboflow/rf-detr
- Proyecto Gallery donde se usa el modelo: https://github.com/open-noodle/gallery

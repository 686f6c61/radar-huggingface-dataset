# 0Curious0/faster_rcnn_resnet50

## Resumen

El modelo `0Curious0/faster_rcnn_resnet50` es una implementación desde cero del detector de objetos Faster R-CNN (Ren et al., 2015) realizada en PyTorch por el usuario 0Curious0. El objetivo declarado es reproducir de forma aproximada los resultados del paper original sobre el conjunto de datos PASCAL VOC, pero con restricciones computacionales reales: utiliza un backbone ResNet-50 en lugar del ResNet-101 del artículo, lo que supone una pérdida moderada de precisión asumida por el autor.

El modelo se entrena siguiendo el protocolo "07+12": combinando las particiones trainval de VOC2007 (5.011 imágenes) y VOC2012 (11.540 imágenes), totalizando 16.551 imágenes de entrenamiento, y se evalúa sobre el test de VOC2007. La implementación cubre todos los componentes del pipeline: RPN con 9 anclas por posición, RoI Pooling (no RoIAlign), cabeza de detección con regresión de cajas específica por clase y un esquema de inferencia que emite todas las detecciones por encima de un umbral de confianza. El repositorio tiene un tamaño de 0,1 GB y está etiquetado como `object-detection` en Hugging Face.

La relevancia de este modelo reside en su carácter didáctico y de referencia: al estar implementado desde cero, permite estudiar cada detalle del algoritmo Faster R-CNN, incluyendo el manejo de anclas, el etiquetado por IoU, las pérdidas y la decodificación de propuestas. No obstante, carece de métricas publicadas y de una licencia explícita, por lo que su uso en producción debe evaluarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Faster R-CNN (RPN + RoI Pooling + Detection Head) con backbone ResNet-50 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision; etiqueta `en` en metadatos) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (formato no especificado) |
| Tamano del repo | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño original de Faster R-CNN con un backbone ResNet-50 preentrenado en ImageNet. El backbone se divide en dos partes: `conv4_x` produce el mapa de características compartido que alimenta tanto a la RPN como al RoI Pooling, mientras que `conv5_x` se reutiliza como cabeza de clasificación por región. Los parámetros de BatchNorm se congelan y se fuerzan a modo `eval()` durante el entrenamiento para evitar actualizaciones de estadísticas.

La RPN utiliza 9 anclas por posición (3 escalas: 128², 256², 512² × 3 ratios: 1:1, 1:2, 2:1). El etiquetado de anclas se basa en IoU: positivas si IoU > 0,7 con alguna caja de verdad, negativas si IoU < 0,3 con todas, e ignoradas en caso contrario. Se muestrean 256 anclas por imagen con ratio 1:1 positivo/negativo. La pérdida de la RPN combina cross-entropy (2 clases) y Smooth L1 sobre los deltas de regresión, con λ = 10. Las propuestas se generan decodificando los deltas, recortando a los límites de la imagen (solo en test), filtrando cajas menores de 16 píxeles, aplicando NMS con IoU 0,7 y seleccionando las top-N antes y después del NMS.

El RoI Pooling proyecta cada propuesta sobre el mapa de características usando un stride calculado como `image_dim // feature_map_dim` y aplica max-pooling a una salida fija de 7×7. Se implementan dos variantes: una manual con bucles explícitos y otra mediante `nn.AdaptiveMaxPool2d`. La cabeza de detección produce 21 logits de clasificación (20 clases de VOC + fondo) y 4·21 deltas de regresión específicos por clase. La pérdida de detección usa cross-entropy y Smooth L1 con λ = 1, y los deltas se normalizan con `delta_std = (0.1, 0.1, 0.2, 0.2)` antes de decodificar. En inferencia, se emiten todos los pares (propuesta, clase) cuya probabilidad softmax supera 0,3, no solo el argmax.

El entrenamiento se realiza sobre VOC2007 trainval + VOC2012 trainval, con preprocesamiento que redimensiona las imágenes para que el lado corto sea 600 píxeles y el largo no supere 1000, manteniendo la relación de aspecto. No se menciona el uso de aumento de datos adicional ni técnicas como RLHF o DPO (no aplicables a visión).

## Capacidades

- Detección de objetos en imágenes: localiza y clasifica objetos de las 20 clases de PASCAL VOC (persona, coche, gato, perro, etc.).
- Salida de cajas delimitadoras con puntuación de confianza para cada clase.
- Capacidad de procesar múltiples objetos por imagen, incluyendo solapamientos, gracias al mecanismo de NMS.
- Inferencia con umbral de confianza configurable (por defecto 0,3).
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de modelos de lenguaje.
- No es multimodal en el sentido de texto o audio; solo procesa imágenes.

## Casos de uso

- **Detección de objetos en fotografías de archivo**: el modelo puede utilizarse para etiquetar automáticamente imágenes en bases de datos, identificando personas, vehículos, animales u objetos de las 20 clases de VOC. Su implementación en PyTorch permite integrarlo fácilmente en pipelines de procesamiento de imágenes con torchvision.
- **Sistemas de asistencia a la conducción**: aunque no está entrenado específicamente para escenas de tráfico, las clases de VOC incluyen coches, motos, bicicletas y peatones, lo que permite una primera aproximación para detectar obstáculos en entornos controlados. La inferencia puede ejecutarse en GPUs de consumo para prototipos.
- **Conteo y análisis de inventario**: en almacenes o tiendas, el modelo puede contar productos o cajas si estos pertenecen a las categorías de VOC (por ejemplo, botellas, sillas, plantas). Su umbral de confianza ajustable permite reducir falsos positivos en entornos con iluminación variable.
- **Robótica educativa**: al ser una implementación from scratch, es útil para enseñar el funcionamiento interno de Faster R-CNN. Puede integrarse en robots con cámaras para tareas de seguimiento de objetos, siempre que los objetos estén dentro de las clases de VOC.
- **Análisis de imágenes médicas (limitado)**: aunque no está entrenado para dominios médicos, podría usarse como punto de partida para transfer learning en la detección de estructuras anatómicas si se ajusta con datos propios. No se recomienda su uso directo en diagnóstico.
- **Investigación en detección de objetos**: dado que el código está disponible y es legible, sirve como base para experimentar con variantes de la RPN, el RoI Pooling o las funciones de pérdida. Los investigadores pueden modificar fácilmente los componentes y evaluar el impacto en VOC2007.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que la implementación busca reproducir de forma aproximada los resultados del paper original, pero no proporciona valores de mAP ni comparaciones con otras implementaciones.

## Requisitos de hardware

- **VRAM estimada**: no se especifica oficialmente. Basándose en una implementación típica de Faster R-CNN con ResNet-50 y una entrada de 600×1000 píxeles, la inferencia puede requerir entre 2 y 4 GB de VRAM en modo de precisión float32. Para entrenamiento, la demanda es mayor, estimándose entre 8 y 12 GB según el batch size.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM para inferencia (por ejemplo, GTX 1650, RTX 3050). Para entrenamiento, se recomienda una GPU con 8 GB o más, como RTX 3070, RTX 4080 o A100.
- **Compatibilidad con GPU de consumo**: sí, el modelo es lo suficientemente ligero para ejecutarse en GPUs de gama media, tanto en inferencia como en entrenamiento con batch pequeño.
- **Opciones de despliegue**: al ser un modelo PyTorch, puede servirse con TorchServe, o exportarse a ONNX y ejecutarse con ONNX Runtime o TensorRT. También es posible usar Hugging Face Inference Endpoints.
- **Latencia y throughput**: no se dispone de mediciones publicadas. En una GPU moderna (por ejemplo, RTX 3090), una inferencia sobre una imagen de 600×1000 podría tomar entre 50 y 150 ms, dependiendo del número de propuestas y de la optimización del código.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo, por lo que no es posible realizar una comparativa cuantitativa. A nivel arquitectónico, se puede comparar con:

| Modelo | Backbone | Conjunto de datos | Características |
|---|---|---|---|
| `0Curious0/faster_rcnn_resnet50` | ResNet-50 | VOC07+12 | Implementación from scratch, sin FPN, RoI Pooling clásico |
| `torchvision fasterrcnn_resnet50_fpn` | ResNet-50 + FPN | COCO | Implementación oficial de PyTorch, con FPN y RoIAlign, pesos preentrenados en COCO |
| Detectron2 Faster R-CNN R50 | ResNet-50 + FPN | COCO | Implementación de Facebook, altamente optimizada, con muchas opciones de configuración |

La implementación de torchvision y la de Detectron2 suelen ofrecer mejor rendimiento porque incorporan FPN, RoIAlign y entrenamiento en COCO (80 clases), mientras que este modelo se limita a VOC (20 clases) y usa RoI Pooling cuantizado. Sin embargo, el valor de este modelo reside en su transparencia y en su naturaleza educativa.

## Limitaciones y advertencias

- **Alcance de clases limitado**: solo detecta las 20 clases de PASCAL VOC; no funciona con clases fuera de ese conjunto sin reentrenamiento.
- **Precisión potencialmente inferior**: al usar ResNet-50 en lugar de ResNet-101 y no emplear FPN, es probable que su mAP sea menor que el de implementaciones modernas como torchvision o Detectron2.
- **Sin métricas publicadas**: no se ha reportado ningún valor de mAP u otra métrica, por lo que es difícil evaluar su calidad real.
- **Riesgo de alucinación en detección**: como todo detector, puede producir falsos positivos, especialmente en imágenes con fondos complejos o clases similares.
- **Licencia no especificada**: la model card no indica ninguna licencia. Esto impide su uso comercial sin consultar al autor. Se recomienda contactar con 0Curious0 antes de utilizarlo en un producto.
- **Código potencialmente con errores**: al ser una implementación from scratch, puede contener bugs o desviaciones del paper original. La model card menciona un error previo con el subdirectorio de ImageSets, lo que sugiere que el código ha sido depurado pero no garantiza su robustez.
- **Dependencia de PyTorch**: requiere una versión de PyTorch compatible y no se proporcionan pesos en otros formatos (GGUF, ONNX, etc.).

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/0Curious0/faster_rcnn_resnet50)
- [Paper original de Faster R-CNN (Ren et al., 2015)](https://arxiv.org/abs/1506.01497)
- [Documentación de torchvision para Faster R-CNN](https://docs.pytorch.org/vision/main/models/faster_rcnn.html)

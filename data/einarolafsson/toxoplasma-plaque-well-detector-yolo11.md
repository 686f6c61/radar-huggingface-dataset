# einarolafsson/toxoplasma-plaque-well-detector-yolo11

## Resumen

El modelo **toxoplasma-plaque-well-detector-yolo11** es un detector de objetos basado en YOLO11n, desarrollado por einarolafsson, que localiza pocillos de ensayo (assay wells) en imágenes de placas completas o de múltiples pocillos obtenidas mediante ensayos de placa de toxoplasma. Su función principal es identificar la posición y el diámetro de cada pocillo para que, en una segunda etapa, se pueda recortar y segmentar individualmente. Forma la primera mitad de un pipeline de dos fases junto con el modelo de segmentación [toxoplasma-plaque-segmentation-cpsam](https://huggingface.co/einarolafsson/toxoplasma-plaque-segmentation-cpsam). La detección del pocillo también proporciona su diámetro, lo que permite comparar áreas de placa entre diferentes microscopios y aumentos. El modelo está publicado con licencia MIT y utiliza la librería Ultralytics, con un tamaño de repositorio de 0.0 GB (los pesos no están alojados en el repositorio de HuggingFace, sino que se cargan desde el paquete ultralytics).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n (Ultralytics) |
| Parametros totales | no disponible (YOLO11n tiene aproximadamente 2.6 M, pero no se confirma en la ficha) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica, es un modelo de vision) |
| Tipos de cuantizacion | no disponible (se distribuye como pesos de ultralytics, normalmente en formato PyTorch) |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | MIT |
| Formato de pesos | no disponible (se carga mediante la libreria ultralytics, probablemente .pt) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura YOLO11n, la variante nano de la familia YOLO11 de Ultralytics, diseñada para deteccion de objetos en tiempo real con un equilibrio entre velocidad y precision. El entrenamiento partio del checkpoint preentrenado `yolo11n.pt` y se realizo durante 150 epocas con un tamaño de lote de 16, imagenes de 640x640 pixeles y paciencia de 100 epocas. No se especifican detalles sobre el dataset de entrenamiento, su composicion ni el numero de imagenes utilizadas. Tampoco se menciona el uso de tecnicas como RLHF o DPO, que no son aplicables a este tipo de modelo de vision. La innovacion principal radica en su uso especifico para detectar pocillos en ensayos de placa, una tarea de nicho en el ambito de la microscopia.

## Capacidades

- Deteccion de pocillos de ensayo en imagenes de placas completas o multi-pocillo.
- Proporciona la bounding box de cada pocillo, de la que se puede derivar su diametro.
- Integracion con un modelo de segmentacion posterior para analisis de placas de toxoplasma.
- Adecuado para imagenes de microscopia con diferentes aumentos, gracias a la normalizacion por diametro.
- Entrenado con resolucion de 640x640, lo que permite procesar imagenes de alta resolucion mediante recortes o redimensionamiento.
- No soporta tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente visual.

## Casos de uso

- **Analisis de ensayos de placa de toxoplasma**: el modelo localiza automaticamente cada pocillo en una imagen de placa completa, permitiendo aislar las regiones de interes para cuantificar las placas de lisis celular.
- **Estandarizacion entre microscopios**: al obtener el diametro de cada pocillo, se pueden normalizar las areas de placa medidas con distintos equipos o magnificaciones, facilitando comparaciones entre experimentos.
- **Automatizacion de pipelines de imagen**: como primera etapa de un flujo de dos pasos, alimenta al modelo de segmentacion `toxoplasma-plaque-segmentation-cpsam` para segmentar las placas dentro de cada pocillo.
- **Control de calidad en laboratorios**: deteccion rapida de pocillos mal posicionados o ausentes en placas de ensayo, reduciendo errores manuales en la revision de imagenes.
- **Procesamiento por lotes de grandes conjuntos de datos**: al ser un modelo YOLO11n, es ligero y puede procesar cientos de imagenes en minutos en una GPU de consumo, acelerando el analisis de experimentos a gran escala.
- **Investigacion en parasitologia**: apoyo a estudios de toxoplasmosis que requieren cuantificar la formacion de placas en cultivos celulares, proporcionando datos objetivos y reproducibles.

## Benchmarks y rendimiento

La model card reporta las metricas de la ultima epoca de entrenamiento (150 epocas, 640 px):

| Metrica | Valor |
|---|---|
| Precision | 0.987 |
| Recall | 0.987 |
| mAP50 | 0.993 |
| mAP50-95 | 0.886 |

No se han publicado comparaciones con otros modelos de deteccion de pocillos ni resultados en conjuntos de datos estandar como COCO o ImageNet. Los valores indican una alta precision y recall en la tarea especifica, aunque el mAP50-95 de 0.886 sugiere que los bordes de las cajas pueden tener una precision de unos pocos pixeles, lo que debe tenerse en cuenta si se calcula el diametro a partir de una sola deteccion.

## Requisitos de hardware

- Al ser un modelo YOLO11n (la variante mas pequena de YOLO11), es adecuado para GPU de consumo como RTX 3060, RTX 4060 o incluso CPU en modo de baja latencia.
- La VRAM estimada para inferencia con un batch de 1 y resolucion 640x640 es inferior a 2 GB, por lo que cabe en cualquier GPU moderna.
- Se puede desplegar con la libreria Ultralytics (Python), que soporta exportacion a ONNX, TensorRT y CoreML, ademas de integracion con vLLM (aunque no es un modelo de lenguaje) y con servidores de inferencia como Triton.
- Para procesamiento por lotes, una GPU con 8 GB de VRAM (por ejemplo, RTX 3070) puede manejar batches de 16 o mas imagenes sin problemas.
- No se dispone de datos de latencia o throughput especificos, pero YOLO11n es conocido por superar los 100 FPS en GPU de gama media.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos de deteccion de pocillos de ensayo en imagenes de microscopia. En el ambito general de deteccion de objetos, YOLO11n compite con otras variantes nano como YOLOv8n o RT-DETR, pero no hay datos comparativos publicados para esta tarea concreta. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- El modelo detecta pocillos, no placas de lisis. No proporciona informacion sobre la presencia o el tamano de las placas, solo la ubicacion de los pocillos.
- El mAP50-95 de 0.886 indica que las bounding boxes pueden tener bordes imprecisos en algunos casos, lo que puede afectar a la medicion del diametro si se utiliza una sola deteccion en lugar de un ajuste sobre multiples detecciones.
- No se especifican los datos de entrenamiento, por lo que se desconoce la variabilidad de condiciones de imagen (iluminacion, contraste, tipo de placa) que el modelo puede manejar.
- Al ser un modelo de vision, no tiene capacidades de lenguaje ni de razonamiento simbolico.
- La licencia MIT permite uso comercial y modificacion, pero el autor no ofrece garantias sobre el rendimiento en entornos de produccion.
- No se proporcionan pesos directamente en el repositorio de HuggingFace; se cargan mediante la libreria ultralytics, lo que requiere instalar dicha dependencia.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/einarolafsson/toxoplasma-plaque-well-detector-yolo11)
- [Modelo de segmentacion asociado](https://huggingface.co/einarolafsson/toxoplasma-plaque-segmentation-cpsam)
- [Dataset de modelos del autor](https://huggingface.co/datasets/einarolafsson/models/tree/main)

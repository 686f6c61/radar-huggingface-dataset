# Mokemw/detr-resnet-50

## Resumen

DETR (DEtection TRansformer) con backbone ResNet-50 es un modelo de deteccion de objetos de extremo a extremo presentado por Carion et al. en el paper "End-to-End Object Detection with Transformers" (arXiv:2005.12872) y desarrollado originalmente por el equipo de Facebook AI Research (Meta). El repositorio analizado, `Mokemw/detr-resnet-50`, es una republicacion del checkpoint de referencia con licencia Apache 2.0, orientada a su uso con la libreria Transformers de Hugging Face.

El modelo resuelve la deteccion de objetos sobre imagenes eliminando componentes clasicos de los detectores tradicionales, como las anchor boxes y la supresion no maxima (NMS). Para ello formula la tarea como un problema de prediccion de conjuntos: un decodificador transformer genera un numero fijo de 100 "object queries" que se corresponden una a una con las detecciones finales mediante una asignacion bipartita optima (algoritmo hungaro). Esto simplifica notablemente el pipeline de inferencia y permite entrenar el detector de forma totalmente end-to-end.

Su relevancia actual no radica en el rendimiento absoluto, que ha sido superado ampliamente por detectores posteriores, sino en su valor como arquitectura de referencia y como base reproducible para investigacion, prototipado y fine-tuning en dominios especificos. Con 41.631.008 parametros y 0,3 GB de repositorio, es un modelo ligero que cabe sin dificultad en GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con backbone convolucional ResNet-50 |
| Parametros totales | 41.631.008 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision); la entrada se redimensiona a un lado minimo de 800 px y un lado maximo de 1333 px |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, no procesa texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors y PyTorch (bin) |
| Pipeline | object-detection |
| Dataset de entrenamiento | COCO 2017 object detection (118.000 imagenes de entrenamiento / 5.000 de validacion) |
| Numero de object queries | 100 |
| Fecha de creacion del repositorio | 2026-09-10 |
| Descargas y likes | 0 descargas, 0 likes en el momento de la consulta |

## Arquitectura y entrenamiento

DETR combina un backbone convolucional ResNet-50, encargado de extraer el mapa de caracteristicas de la imagen, con un transformer encoder-decoder. Sobre las salidas del decodificador se anaden dos cabezas: una capa lineal que produce las etiquetas de clase y un MLP que predice las coordenadas de las cajas delimitadoras. La innovacion principal reside en el uso de object queries: cada una de las 100 consultas aprende a buscar un objeto concreto en la imagen, de modo que no se necesitan anchors ni NMS en postprocesado.

El entrenamiento emplea una perdida de emparejamiento bipartito. Las predicciones de las 100 queries se comparan con las anotaciones reales, rellenadas hasta la misma longitud N = 100 con la clase "sin objeto" y sin caja cuando la imagen contiene menos objetos. El algoritmo hungaro calcula el mapeo optimo uno a uno entre queries y anotaciones; a partir de ahi se optimiza con entropia cruzada estandar para las clases y una combinacion lineal de la perdida L1 y la perdida generalized IoU para las cajas. El modelo se entreno durante 300 epochs en 16 GPUs V100 durante 3 dias, con 4 imagenes por GPU (batch total de 64). Las imagenes se normalizan con la media (0.485, 0.456, 0.406) y la desviacion tipica (0.229, 0.224, 0.225) de ImageNet. No se reporta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo de vision de esta naturaleza.

## Capacidades

- Deteccion de objetos en imagenes con las categorias de COCO 2017, incluyendo la clase adicional "sin objeto" empleada durante el entrenamiento.
- Prediccion conjunta de etiqueta de clase y caja delimitadora en una sola pasada hacia delante, sin supresion no maxima.
- Salida de hasta 100 detecciones por imagen, con puntuaciones de confianza por deteccion.
- Postprocesado integrado en la libreria Transformers mediante `post_process_object_detection`, con umbral de confianza configurable (el ejemplo de la model card usa 0,9).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No dispone de capacidades multilingues: es un modelo puramente visual.
- No incorpora modo "thinking", vision por video, audio ni OCR especifico.

## Casos de uso

- Anotacion automatica de datasets de vision: el modelo puede pre-etiquetar imagenes con cajas y clases de COCO, reduciendo el trabajo manual antes de una revision humana en proyectos de construccion de datasets propios.
- Prototipado rapido de sistemas de deteccion: gracias a su API de alto nivel en Transformers y a su tamano reducido, permite validar una idea de producto en horas y no en semanas, sin necesidad de infraestructura dedicada.
- Investigacion en arquitecturas end-to-end: sirve como linea base reproducible para comparar variantes de detectores basados en transformers (Deformable DETR, DAB-DETR, DINO) en las mismas condiciones de evaluacion sobre COCO.
- Fine-tuning en dominios verticales: al ser un modelo ligero con licencia Apache 2.0, es viable reentrenarlo con unas pocas miles de imagenes etiquetadas para deteccion de defectos industriales, plagas en agricultura o componentes en lineas de montaje.
- Analisis de imagenes en pipelines de datos: puede integrarse en procesos batch que clasifiquen y localicen objetos en catalogos de producto, imagenes de satelite o archivos fotograficos, generando metadatos estructurados.
- Educacion y formacion tecnica: es un ejemplo didactico habitual para explicar asignacion bipartita, object queries y el funcionamiento de un decodificador transformer aplicado a vision.
- Demos interactivas y widgets: su huella de memoria reducida permite desplegarlo en espacios de Hugging Face o aplicaciones web ligeras con inferencia en CPU para volumenes moderados.

## Benchmarks y rendimiento

El unico resultado de evaluacion presente en la informacion proporcionada es el siguiente:

| Benchmark | Metrica | Resultado |
|---|---|---|
| COCO 2017 validation | AP (average precision) | 42,0 |

No se han publicado en la informacion disponible otros resultados desglosados (AP50, AP75, AP small/medium/large, velocidad de inferencia) para este repositorio concreto. La model card remite a la tabla 1 del paper original para obtener mas detalles. No se dispone de comparaciones numericas verificadas con otros detectores dentro de la informacion facilitada, por lo que no se incluyen cifras adicionales.

## Requisitos de hardware

- Parametros: 41,6 millones, lo que supone aproximadamente 166 MB de pesos en FP32 y unos 83 MB en FP16.
- VRAM estimada para inferencia: en torno a 1-2 GB en FP32 para lotes pequenos con resolucion de entrada de 800-1333 px; la cifra exacta depende del tamano de lote y de la resolucion, y no esta confirmada en la informacion disponible.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM. Cabe holgadamente en RTX 3060, RTX 4070, RTX 4090, y tambien en GPUs de datacenter como A100 o H100, aunque en estas ultimas el modelo estaria muy infrautilizado.
- Compatibilidad con GPU de consumo: si, es un modelo apto para GPUs de consumo e incluso puede ejecutarse en CPU con latencias mayores.
- Opciones de despliegue: la model card solo menciona soporte de PyTorch para el extractor de caracteristicas y el modelo. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible, dado que no es un modelo de lenguaje. La integracion natural es mediante la libreria Transformers, con la opcion de exportar a otros runtimes (ONNX, TorchScript) por cuenta del usuario.
- Latencia y throughput: no disponible.
- Nota sobre dependencias: el ejemplo de la model card usa la revision `no_timm` para evitar la dependencia de la libreria timm.

## Comparativa con modelos similares

Los datos cuantitativos de los modelos alternativos no estan disponibles en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas cualitativas verificables.

| Modelo | Parametros | Entrada | AP en COCO val2017 | Licencia | Notas |
|---|---|---|---|---|---|
| Mokemw/detr-resnet-50 (este modelo) | 41.631.008 | Imagen 800-1333 px | 42,0 | apache-2.0 | Republicacion del checkpoint de referencia; 0 descargas y 0 likes |
| facebook/detr-resnet-50 | no disponible | Imagen 800-1333 px | no disponible | apache-2.0 | Checkpoint original del que deriva este repositorio |
| facebook/detr-resnet-101 | no disponible | Imagen 800-1333 px | no disponible | apache-2.0 | Variante con backbone ResNet-101, mas pesada |
| Detectores basados en anchors (por ejemplo, familias Faster R-CNN o YOLO) | no disponible | no disponible | no disponible | variable | Requieren NMS en postprocesado, a diferencia de DETR |

## Limitaciones y advertencias

- Riesgo de alucinacion: como todo detector de objetos, puede producir falsos positivos con puntuaciones de confianza altas, especialmente en imagenes con objetos parcialmente ocluidos o categorias poco representadas en COCO.
- Limitacion de dominio: el modelo esta entrenado exclusivamente sobre COCO 2017. Las categorias fuera de ese conjunto de 80 clases no se detectaran correctamente sin un fine-tuning especifico.
- Limitacion de resolucion: la entrada se redimensiona a un rango de 800 a 1333 px, lo que penaliza la deteccion de objetos muy pequenos en imagenes de alta resolucion.
- Numero maximo de detecciones: al usar 100 object queries, el modelo no puede devolver mas de 100 detecciones por imagen.
- Ausencia de idiomas: no procesa texto, por lo que no cabe esperar capacidades multilingues ni de generacion.
- Sesgos: no se documenta en la informacion proporcionada ningun analisis de sesgos demograficos, geograficos o de otro tipo. COCO tiene una distribucion de imagenes sesgada hacia determinados contextos y objetos cotidianos, lo que puede trasladarse al modelo.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero se debe conservar el aviso de licencia y atribuir correctamente al trabajo original.
- Caveat de trazabilidad: este repositorio concreto tiene 0 descargas y 0 likes y fue publicado por un usuario independiente (`Mokemw`), no por el equipo original. Para produccion conviene verificar la integridad de los pesos y considerar el uso del checkpoint original de referencia.
- Caveat de fechas: la fecha de creacion registrada en Hugging Face (2026-09-10) y la fecha de actualizacion son identicas, lo que indica que el repositorio no ha recibido mantenimiento posterior.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Mokemw/detr-resnet-50
- Paper original: https://arxiv.org/abs/2005.12872
- Repositorio de codigo original de Facebook Research: https://github.com/facebookresearch/detr
- Checkpoint de referencia en Hugging Face: https://huggingface.co/facebook/detr-resnet-50
- Busqueda de todos los modelos DETR disponibles: https://huggingface.co/models?search=facebook/detr
- Dataset COCO 2017: https://cocodataset.org/#download
- Imagenes de ejemplo usadas en el widget: https://huggingface.co/datasets/mishig/sample_images
- Nota sobre las busquedas web: las consultas realizadas no devolvieron resultados relevantes sobre este modelo; los enlaces obtenidos correspondian a paginas de ayuda de Google Maps y no guardan relacion con DETR ni con el repositorio analizado.

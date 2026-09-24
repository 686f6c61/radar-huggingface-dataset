# electblake/clothing_type_rtdetr_v2_r18vd

## Resumen

clothing_type_rtdetr_v2_r18vd es un modelo de deteccion de objetos para prendas de vestir, publicado por el usuario electblake en Hugging Face. Se trata de un fine-tuning de PekingU/rtdetr_v2_r18vd, el modelo RT-DETRv2 con backbone ResNet-18vd, y localiza prendas en una imagen devolviendo cajas delimitadoras, puntuaciones de confianza y una de seis etiquetas concretas: swim, denim_shorts, lingerie_black, lingerie_red, lingerie_white y swim_sports.

El modelo resuelve un problema muy acotado de clasificacion y localizacion de prendas con un vocabulario cerrado y especifico, pensado para indexacion de imagenes, organizacion de datasets y experimentacion. Cuenta con 20.114.700 parametros y un repositorio de aproximadamente 0,1 GB, por lo que es ligero y apto para inferencia en hardware de consumo.

Su relevancia es limitada y practica: no es un detector de moda generalista ni un modelo de proposito amplio, sino una herramienta concreta entrenada sobre una coleccion privada de imagenes. La informacion publicada indica que las anotaciones de entrenamiento se generaron con YOLO-World como pseudo-etiquetas, lo que condiciona su fiabilidad fuera de la distribucion original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETRv2 (Real-Time DEtection TRansformer v2) con backbone ResNet-18vd |
| Parametros totales | 20.114.700 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de deteccion de objetos; entrada de imagen de 640 x 640) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es RT-DETRv2, un detector de objetos en tiempo real basado en transformer, presentado en 2024 como mejora de RT-DETR (CVPR 2024). En esta variante concreta, el backbone es ResNet-18vd (variante "vd" del ResNet-18), lo que da lugar a un modelo compacto de unos 20,1 millones de parametros. La cabeza de deteccion produce cajas en formato (xmin, ymin, xmax, ymax) en pixeles junto con puntuaciones y etiquetas, y el vocabulario de salida tiene exactamente seis clases.

El entrenamiento se realizo durante 8 epocas sobre una coleccion privada de imagenes formateada como dataset de deteccion imagefolder de Hugging Face, dividida en 70 por ciento de entrenamiento, 15 por ciento de validacion y 15 por ciento de test con semilla 42. La entrada fue de 640 x 640, con batch de 4 tanto en entrenamiento como en evaluacion, tasa de aprendizaje 0,00005, weight decay 0,0001, scheduler coseno, precision mixta FP16 y criterio de mejor modelo basado en COCO mAP. El checkpoint publicado corresponde al paso 13.846 (epoca 7). Un aspecto tecnico relevante es que las cajas iniciales se generaron con YOLO-World, por lo que constituyen pseudo-etiquetas y no anotaciones verificadas exhaustivamente por humanos. El entrenamiento se ejecuto con Transformers 5.17.0 y PyTorch 2.14.0+cu130.

## Capacidades

- Deteccion de objetos: localiza prendas en una imagen y devuelve cajas delimitadoras con coordenadas en pixeles.
- Clasificacion en seis clases cerradas: swim, denim_shorts, lingerie_black, lingerie_red, lingerie_white y swim_sports.
- Puntuacion de confianza por deteccion, con umbral configurable (el script local del autor usa 0,125 como valor de referencia).
- Inferencia sobre imagenes individuales en RGB mediante AutoImageProcessor y RTDetrV2ForObjectDetection de la libreria transformers.
- Salida compatible con el posprocesado estandar de deteccion de transformers (post_process_object_detection).
- Soporte de tool calling / function calling: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no aplica.
- Capacidades especiales (vision, audio, thinking mode): vision para deteccion de objetos; sin audio ni modos de razonamiento.

## Casos de uso

- Indexacion de catalogos de ropa: el modelo permite etiquetar y localizar automaticamente prendas en imagenes de producto, generando metadatos de categoria y caja para busqueda o filtrado en un e-commerce. Es adecuado por su bajo coste computacional y su vocabulario acotado.
- Organizacion de datasets de moda: al devolver cajas y etiquetas, facilita separar imagenes por tipo de prenda y limpiar colecciones internas antes de otros entrenamientos.
- Preanotacion para etiquetado humano: el modelo puede generar propuestas iniciales de cajas y clases que un anotador revise, reduciendo el esfuerzo en proyectos de vision con prendas.
- Moderacion de contenido con criterios acotados: en plataformas que necesiten localizar prendas de bano o lenceria segun sus propias politicas, siempre que la distribucion de imagenes se parezca a la de entrenamiento.
- Analisis de surtido minorista: extraer estadisticas agregadas de que tipos de prenda aparecen en un lote de imagenes para informes internos, con conciencia explicita de las limitaciones del vocabulario.
- Vision por computador en el borde (edge): con unos 20,1 millones de parametros y pesos de aproximadamente 0,1 GB, puede ejecutarse en equipos con GPU modesta o incluso CPU para tareas de deteccion puntuales.
- Filtrado previo en pipelines de vision: actuar como primera etapa que descarta o marca imagenes relevantes antes de modelos mas costosos.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card, obtenidos sobre la particion de validacion privada (dataset "Private clothing-type validation split"). No se uso ningun benchmark externo independiente y las metricas no estan verificadas de forma independiente.

| Metrica | Valor |
|---|---:|
| COCO mAP | 0,6460 |
| COCO mAP@50 | 0,8411 |
| COCO mAP@75 | 0,7217 |
| Recall@100 | 0,8696 |

Resultados por clase (AP):

| Clase | AP |
|---|---:|
| swim | 0,5712 |
| denim_shorts | 0,6521 |
| lingerie_black | 0,5850 |
| lingerie_red | 0,6433 |
| lingerie_white | 0,5447 |
| swim_sports | 0,8796 |

No se han publicado resultados de benchmarks sobre datasets publicos estandar (COCO, LVIS, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida. Con 20,1 millones de parametros, los pesos ocupan del orden de 80 MB en FP32 y unos 40 MB en FP16. El consumo real de VRAM depende de la resolucion de entrada (640 x 640) y del tamano del batch, y sera de un orden de magnitud de pocos cientos de MB a 1-2 GB en configuraciones tipicas. No hay valores oficiales publicados por el autor.
- GPU recomendadas: cualquier GPU moderna con al menos unos pocos GB de VRAM es suficiente, por ejemplo RTX 3060, RTX 3090, RTX 4090, A100 o H100. Las GPUs de gama alta no aportan ventaja estructural, solo mas throughput.
- Compatibilidad con GPU de consumo: si, cabe con holgura en practicamente cualquier GPU de consumo actual y en muchas integradas.
- Opciones de despliegue: transformers (AutoImageProcessor + RTDetrV2ForObjectDetection) es el camino documentado por el autor. Otras opciones habituales para RT-DETR (exportacion a ONNX o TensorRT, servidores de inferencia con soporte de vision) no estan confirmadas en la informacion proporcionada; no disponible.
- Latencia y throughput estimados: no disponible. No se publican mediciones de latencia ni de imagenes por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/entrada | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| clothing_type_rtdetr_v2_r18vd | RT-DETRv2 fine-tuned (deteccion de prendas) | 20.114.700 | imagen 640 x 640 | mAP 0,646; mAP@50 0,8411 (validacion privada) | Apache 2.0 | Hugging Face |
| PekingU/rtdetr_v2_r18vd (modelo base) | RT-DETRv2 (deteccion general) | no disponible en la informacion | imagen, tamano de entrada configurable | no disponible en la informacion | no disponible en la informacion | Hugging Face |
| RT-DETR original (lyuwenyu/RT-DETR) | Detector en tiempo real (CVPR 2024) | no disponible en la informacion | imagen | no disponible en la informacion | no disponible en la informacion | GitHub y pesos publicados |
| electblake/clothing_type_classifier | Clasificador de prendas (mismo autor) | no disponible en la informacion | imagen | no disponible en la informacion | no disponible en la informacion | Hugging Face |

La comparacion cuantitativa con alternativas no es posible con los datos disponibles, ya que no se han publicado mediciones comparables sobre el mismo conjunto de validacion privado. Cualquier modelo de deteccion generalista requeriria una evaluacion propia sobre la distribucion de interes para una comparacion justa.

## Limitaciones y advertencias

- Distribucion de entrenamiento estrecha y privada: el modelo puede no generalizar a otras fuentes de imagen, estilos de prenda, condiciones de iluminacion, poses u ocultaciones distintas de las del conjunto original.
- Vocabulario incompleto y heterogeneo: solo cubre seis etiquetas y mezcla tipo de prenda con color en algunas clases (por ejemplo, lingerie_black, lingerie_white, lingerie_red), lo que limita su uso como taxonomia de moda.
- Pseudo-etiquetas heredadas: las anotaciones de entrenamiento se generaron con YOLO-World, por lo que los errores de ese modelo de anotacion pueden haberse propagado al modelo final.
- Riesgo de sobreajuste al conjunto de validacion: los resultados reportados son mediciones sobre una particion privada y pueden sobreestimar el rendimiento en datos no relacionados.
- Datos y entrenamiento no reproducibles: el dataset no se incluye en el repositorio, lo que impide reproducir el entrenamiento o auditar las anotaciones.
- Sesgos conocidos: no disponibles de forma explicita, pero el modelo puede heredar sesgos de la coleccion privada de imagenes, tanto en la representacion de prendas como en las condiciones de captura.
- Alucinacion en deteccion: como cualquier detector, puede producir detecciones falsas o cajas imprecisas, especialmente en clases con AP bajo (lingerie_white con 0,5447 y swim con 0,5712).
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base y de los datos originales, no detallada en la informacion disponible.
- Advertencia explicita del autor: el modelo no esta disenado para taxonomia de moda general, identificacion de personas, decisiones de seguridad critica ni para extraer conclusiones sobre las personas que aparecen en una imagen.
- Idoneidad para produccion: el propio autor recomienda evaluar el modelo en datos representativos antes de usarlo en una aplicacion.

## Enlaces

- Hugging Face (modelo): https://huggingface.co/electblake/clothing_type_rtdetr_v2_r18vd
- Modelo base: https://huggingface.co/PekingU/rtdetr_v2_r18vd
- Documentacion de RT-DETRv2 en transformers: https://huggingface.co/docs/transformers/model_doc/rt_detr_v2
- Repositorio oficial RT-DETR (lyuwenyu): https://github.com/lyuwenyu/RT-DETR
- Informe tecnico RT-DETRv2 (arXiv): https://arxiv.org/html/2407.17140v1
- Modelo relacionado del mismo autor (clasificador): https://huggingface.co/electblake/clothing_type_classifier
- README del proyecto en GitHub (mr-szgz): https://github.com/mr-szgz/clothing_type_rtdetr_v2_model/blob/main/README.md

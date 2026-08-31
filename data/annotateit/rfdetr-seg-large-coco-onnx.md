# AnnotateIt/rfdetr-seg-large-coco-onnx

## Resumen

RF-DETR Seg Large es un modelo de segmentación de instancias en tiempo real desarrollado por Roboflow, basado en una arquitectura transformer con backbone DINOv2. Este repositorio concreto, publicado por AnnotateIt, contiene una conversión independiente y no oficial a ONNX en precisión FP32 del checkpoint preentrenado `Roboflow/rf-detr-seg-large`, exportada con el exportador oficial de RF-DETR (tag 1.9.4) y validada para su uso en anotación automática local dentro del navegador mediante onnxruntime-web.

El modelo resuelve el problema de ejecutar segmentación de instancias de alta calidad en entornos sin dependencias de Python ni GPU dedicada, como navegadores web o dispositivos edge, manteniendo un contrato de entrada y salida reproducible. Con 35,87 millones de parámetros cargados (36,21 millones en el checkpoint original) y una entrada fija de 504×504 píxeles, alcanza una precisión de segmentación (mask AP 50:95) de 47,1 según las métricas oficiales de Roboflow, y 46,4 en la reevaluación independiente de esta conversión sobre COCO val2017.

La relevancia actual de este modelo radica en que RF-DETR fue aceptado en ICLR 2026 y se presenta como el primer modelo en tiempo real que supera los 60 AP en COCO en su variante más grande (RF-DETR-2XL), lo que lo sitúa como una alternativa directa a YOLOv11 para tareas de detección y segmentación. Esta conversión ONNX permite desplegarlo en infraestructuras estándar de inferencia (ONNX Runtime, TensorRT) y en el navegador sin necesidad de PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con backbone DINOv2 (RF-DETR Seg Large) |
| Parametros totales | 35.873.971 (cargados); 36.211.971 (checkpoint original) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija 504×504) |
| Tipos de cuantizacion | FP32 (unico formato publicado) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 17, batch fijo 1) |

## Arquitectura y entrenamiento

RF-DETR (Roboflow Detection Transformer) es una arquitectura de deteccion y segmentacion de instancias basada en transformer, con un backbone DINOv2 vision transformer. El modelo original fue entrenado por Roboflow sobre el dataset COCO, alcanzando estado del arte en el equilibrio precision-latencia. La variante Seg Large utiliza 200 queries de atencion organizadas en 13 grupos de entrenamiento (2600 filas en los tensores `query_feat.weight` y `refpoint_embed.weight`), aunque el checkpoint oficial contiene 3900 filas; el cargador oficial toma las primeras 2600 filas de estos tensores porque el checkpoint omite los argumentos de entrenamiento.

Esta conversion ONNX reproduce fielmente ese comportamiento de carga: los prefijos de 2600 filas se fijan y verifican explicitamente, y el resto de tensores aprendidos deben permanecer identicos. El grafo ONNX resultante tiene 35.873.971 parametros, una diferencia de 338.000 parametros respecto al checkpoint original debido al recorte de queries. La exportacion se realizo con el exportador oficial de RF-DETR (no una reimplementacion), con precision FP32, opset 17, batch fijo 1 y entrada de 504×504 píxeles. No se aplicaron tecnicas de RLHF/DPO por tratarse de un modelo de vision.

El preprocesado requerido es especifico: redimensionado por estiramiento (stretch-resize) a 504×504 con interpolacion bilineal half-pixel y antialias desactivado, escalado a [0,1] y normalizacion con media y desviacion estandar de ImageNet. No se usa letterbox ni padding. El postprocesado sigue la semantica oficial de `PostProcess`: sigmoide sobre los logits, seleccion global top-K sobre las 200×91 puntuaciones aplanadas, umbral estricto de 0.5, conversion de cajas cxcywh a xyxy y binarizacion de mascaras con logit > 0.0. No se aplica NMS, por lo que una misma query puede seleccionarse mas de una vez para clases distintas.

## Capacidades

- Segmentacion de instancias sobre 80 clases "thing" de COCO, con salida de mascaras binarias por instancia.
- Deteccion de objetos con cajas delimitadoras (bounding boxes) en formato cxcywh normalizado.
- Salida de hasta 200 detecciones por imagen, con puntuaciones de confianza por clase.
- Inferencia en navegador mediante onnxruntime-web (WASM), validada en Chromium con paridad de resultados frente a Python ONNX Runtime.
- Compatible con ONNX Runtime en CPU, CUDA y TensorRT para despliegue en servidores o edge.
- Sin capacidades de generacion de texto, tool calling, agentes ni procesamiento de lenguaje natural: es exclusivamente un modelo de vision.

## Casos de uso

- Anotacion automatica en navegador: AnnotateIt utiliza este modelo para auto-anotar imagenes localmente en el navegador del usuario, sin enviar datos a un servidor. La conversion ONNX con WASM permite ejecutar la segmentacion completa en el cliente, con paridad de resultados frente a la version PyTorch (maxima diferencia de score 1.07e-06 y de caja 1.49e-07 en las pruebas registradas).
- Segmentacion de instancias en tiempo real en edge: con una latencia de 8.8 ms en NVIDIA T4 con TensorRT FP16 (medicion oficial de Roboflow), el modelo puede integrarse en pipelines de vision industrial o robotica que requieran respuestas en milisegundos.
- Preprocesado para pipelines de vision por computadora: las mascaras de segmentacion generadas pueden alimentar sistemas de conteo de objetos, analisis de escenas o generacion de datasets sinteticos.
- Filtrado y recorte de objetos en imagenes: las cajas y mascaras permiten extraer regiones de interes para tareas posteriores como clasificacion fina o reconocimiento optico de caracteres.
- Evaluacion de modelos de segmentacion: al estar disponible el grafo ONNX con un contrato de entrada/salida documentado y un informe de validacion reproducible, puede usarse como referencia para comparar otras implementaciones o cuantizaciones.
- Despliegue en entornos sin GPU: al ser un unico archivo ONNX de 130,8 MB en FP32, puede ejecutarse en CPU con ONNX Runtime, aunque con mayor latencia que en GPU. Es adecuado para prototipos y aplicaciones de escritorio.

## Benchmarks y rendimiento

La siguiente tabla recoge las metricas oficiales reportadas por Roboflow para el checkpoint original y los resultados de la reevaluacion independiente realizada por AnnotateIt sobre COCO val2017 (5000 imagenes) con la version PyTorch y la conversion ONNX, ambas en FP32 sobre NVIDIA GeForce RTX 3090 con TF32 desactivado.

| Backend | bbox AP | segm AP | segm AP50 |
|---|---|---|---|
| PyTorch 2.13.0+cu130 (CUDA, RTX 3090) | 0.5493 | 0.4641 | 0.7046 |
| ONNX Runtime 1.29.0 (CUDA, RTX 3090) | 0.5495 | 0.4643 | 0.7046 |

Metricas oficiales de Roboflow (protocolo de evaluacion distinto, con `num_select=200` y preprocesado de despliegue):

| Metrica | Valor |
|---|---|
| COCO mask AP 50:95 | 47.1 |
| COCO mask AP50 | 70.5 |
| Parametros | 36.2M |
| Latencia | 8.8 ms (NVIDIA T4, TensorRT 10.4, CUDA 12.4, FP16, batch 1) |

La concordancia Torch-ONNX en segm AP es de 0.019 puntos. No se han publicado resultados comparativos frente a otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo ONNX pesa 130,8 MB en FP32, por lo que la VRAM minima ronda los 200-300 MB incluyendo activaciones para una entrada de 504×504. Cabe en cualquier GPU moderna con al menos 1 GB de VRAM.
- GPU recomendadas: NVIDIA T4 (latencia oficial de 8.8 ms con TensorRT FP16), RTX 3090 (usada en la validacion de esta conversion), o cualquier GPU consumer con soporte CUDA.
- En consumer GPU: si, cabe en tarjetas como RTX 3060, RTX 4060 o superiores, e incluso en iGPUs con suficiente memoria compartida para inferencia en CPU.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, TensorRT), onnxruntime-web (WASM) para navegador, y exportacion a TensorRT mediante el propio ONNX Runtime.
- Latencia y throughput: 8.8 ms por imagen en T4 con TensorRT FP16 (dato oficial de Roboflow, no de esta conversion). En navegador Chromium con WASM y un solo hilo, la sesion tarda 1141 ms en inicializarse, el primer run 4738 ms y el p50 en caliente 6064 ms (mediciones de AnnotateIt). En CPU pura sin GPU no se han publicado cifras.

## Comparativa con modelos similares

No se dispone de datos cuantitativos comparativos en la informacion proporcionada para modelos equivalentes como YOLOv11-seg, RT-DETR o Mask R-CNN. Segun la documentacion oficial de Roboflow, RF-DETR supera a YOLOv11 en COCO y RF100-VL, y la variante RF-DETR-2XL alcanza 60.1 AP50:95 en COCO, pero no se incluyen cifras concretas de los competidores en las fuentes consultadas. La siguiente tabla resume las diferencias estructurales conocidas:

| Modelo | Arquitectura | Parametros | Contexto/entrada | Licencia |
|---|---|---|---|---|
| RF-DETR Seg Large (este) | Transformer + DINOv2 | 36.2M | 504×504 | Apache-2.0 |
| YOLOv11-seg | CNN (CSPDarknet) | no disponible | variable (640-1280) | AGPL-3.0 |
| RT-DETR (ResNet18) | Transformer + CNN backbone | ~20M | 640×640 | Apache-2.0 |

La principal diferencia frente a YOLOv11 es la arquitectura transformer con backbone DINOv2, que ofrece mejor equilibrio precision-latencia segun Roboflow, y una licencia permisiva Apache-2.0 frente a la AGPL de YOLO. Frente a RT-DETR, RF-DETR Seg Large tiene mas parametros y una entrada menor, con mayor precision de segmentacion reportada.

## Limitaciones y advertencias

- La conversion ONNX no es una carga tensor-identica del checkpoint original: se recortan los tensores `query_feat.weight` y `refpoint_embed.weight` a las primeras 2600 filas, lo que reduce el numero de parametros en 338.000. Esto puede afectar a comportamientos no cubiertos en la validacion.
- El layout de clases es sparse COCO-91 nativo (person=1, car=3, ..., toothbrush=90), con el indice 0 reservado a fondo y diez huecos "N/A". No debe compactarse a COCO-80 ni desplazarse en uno, o las clases se interpretaran incorrectamente.
- No se aplica NMS en el postprocesado: una misma query puede seleccionarse para varias clases, y pueden aparecer detecciones duplicadas o solapadas. Es responsabilidad del consumidor del modelo gestionar esto si la aplicacion lo requiere.
- El preprocesado es estricto: stretch-resize sin letterbox y sin padding, con antialias desactivado. Cualquier desviacion (por ejemplo, usar `cv2.resize` con otra interpolacion) degrada la precision.
- La validacion en navegador solo cubre Chromium (version 151) con onnxruntime-web 1.24.3 y un solo hilo. WKWebView y WebView2 no fueron probados, y el rendimiento WASM es significativamente peor que en GPU (6064 ms p50 frente a 8.8 ms en T4).
- El modelo solo soporta FP32; no se ofrecen versiones cuantizadas (FP16, INT8) en este repositorio, aunque el checkpoint original de Roboflow tiene una variante cuantizada referenciada en los tags.
- Al ser un modelo de vision, no tiene capacidades de texto, por lo que no aplica a tareas de lenguaje natural ni multilingues.
- La licencia Apache-2.0 permite uso comercial, pero el aviso NOTICE incluido en el repositorio debe mantenerse en redistribuciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AnnotateIt/rfdetr-seg-large-coco-onnx
- Modelo base (checkpoint original): https://huggingface.co/Roboflow/rf-detr-seg-large
- Repositorio oficial RF-DETR: https://github.com/roboflow/rf-detr
- Documentacion de RF-DETR Seg Large: https://rfdetr.roboflow.com/develop/reference/seg_large/
- Documentacion general de RF-DETR: https://rfdetr.roboflow.com/develop/
- Repositorio espejo no oficial con documentacion adicional: https://github.com/dansonc/rf-detr-github

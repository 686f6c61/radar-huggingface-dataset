# besit/rfdetr-onnx

## Resumen

`besit/rfdetr-onnx` es un repositorio de artefactos ONNX, no un modelo entrenado desde cero: contiene las exportaciones a ONNX de los modelos de segmentacion de instancias **RF-DETR** preentrenados en COCO por Roboflow. El autor del repositorio (usuario `besit`) unicamente ha convertido los pesos originales con `rfdetr` 1.11.0 mediante `model.export(format="onnx")`, con opset 17 y batch estatico 1, sin modificar los pesos. La licencia resultante es Apache-2.0, la misma de RF-DETR (Copyright 2025 Roboflow, Inc.).

El objetivo declarado es alimentar el nodo ONNX Segment de Houdini Copernicus, que descarga automaticamente estos ficheros. Se publican cuatro variantes con resoluciones de entrada crecientes -nano (312×312, 100 consultas, mascaras 78×78), small (384×384, 100 consultas, 96×96), medium (432×432, 200 consultas, 108×108) y large (504×504, 200 consultas, 126×126)-, lo que permite elegir entre latencia y calidad de mascara dentro del mismo pipeline.

Su relevancia practica es acotada pero clara: ofrece deteccion y segmentacion de instancias sobre las 91 categorias dispersas de COCO en un formato de inferencia portable (ONNX Runtime, TensorRT, DirectML, OpenVINO) sin necesidad de dependencias de PyTorch ni del codigo de entrenamiento de RF-DETR. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0,7 GB, por lo que debe tratarse como un artefacto de terceros sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de deteccion y segmentacion tipo DETR (RF-DETR) con decodificador de consultas; el detalle del backbone no se especifica en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; la "ventana" relevante es la resolucion de entrada) |
| Tipos de cuantizacion | no disponible; los ficheros exportados son float32 y no se documentan variantes cuantizadas |
| Idiomas soportados | no aplica (modelo de vision, no linguistico) |
| Licencia | Apache-2.0 (pesos originales de Roboflow, Copyright 2025 Roboflow, Inc.) |
| Formato de pesos | ONNX, opset 17, batch estatico 1, exportado con `rfdetr` 1.11.0 |

Variantes publicadas:

| Fichero | Entrada | Consultas | Mascara | SHA-256 |
|---|---|---|---|---|
| `rfdetr-seg-nano.onnx` | 312×312 | 100 | 78×78 | `482f13bb698916dfcafbd98b2e563353721eb1d56f5d4851c6ada7bc9fa0ba94` |
| `rfdetr-seg-small.onnx` | 384×384 | 100 | 96×96 | `6e9ac79e34143c8cbd63b5e1c653c3108ea944ab08153433c761f72d7fef641c` |
| `rfdetr-seg-medium.onnx` | 432×432 | 200 | 108×108 | `33f97a068ea7de3892e4cbc3825e15c5418be818506d7f39f44e1fb1f7ab6abb` |
| `rfdetr-seg-large.onnx` | 504×504 | 200 | 126×126 | `c0aec7057051b13aced2592146fcdd92a94237c801186de4b5b28efc623adf06` |

Otros datos del repositorio: identificador `besit/rfdetr-onnx`, libreria declarada `onnx`, etiquetas `onnx`, `instance-segmentation`, `rf-detr`, `houdini`, `region:us`, tamano 0,7 GB, creado el 2026-09-28 y actualizado el 2026-09-28.

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de lo que se deduce de las firmas de entrada y salida del grafo ONNX. Se trata de un modelo de la familia DETR (DETR significa *Detection Transformer*), con un conjunto fijo de consultas aprendidas: 100 en las variantes nano y small, y 200 en medium y large. Cada consulta produce una caja, un vector de logits de clase sobre 91 categorias COCO dispersas y un mapa de logits de mascara a un cuarto de la resolucion de entrada. No se documentan ni el backbone, ni el numero de capas, ni el esquema de atencion.

Tampoco hay informacion en el repositorio sobre el proceso de entrenamiento: numero de tokens o imagenes, composicion del dataset (mas alla de que es COCO preentrenado), uso de RLHF/DPO -no aplicable en vision- ni tecnicas de aumento. La unica innovacion tecnica reseñable es la de la propia exportacion: conversion a ONNX con opset 17 y batch estatico 1, manteniendo los pesos sin modificar, lo que habilita ejecucion en runtimes sin PyTorch. Los scripts de exportacion y referencia se encuentran en `github.com/besit/yolo_onnx`, dentro del directorio `rfdetr/`.

Contrato de entrada y salida segun la model card:

- Entrada `input`: tensor `[1, 3, S, S]` float32, RGB en rango 0-1, normalizado con media ImageNet `[0.485, 0.456, 0.406]` y desviacion `[0.229, 0.224, 0.225]`, con redimensionado simple (sin *letterbox*). `S` es 312, 384, 432 o 504 segun la variante.
- Salida `dets`: `[1, Q, 4]` cajas como `cx, cy, w, h` normalizadas.
- Salida `labels`: `[1, Q, 91]` logits a los que hay que aplicar sigmoide; el indice corresponde al identificador disperso de categoria COCO (por ejemplo, 1 = person).
- Salida `masks`: `[1, Q, S/4, S/4]` logits de mascara para la imagen completa; un pixel pertenece al objeto cuando el logit supera 0 (probabilidad 0,5).

## Capacidades

- Deteccion de objetos sobre las 91 categorias dispersas de COCO en una sola pasada, con un maximo de 100 o 200 detecciones segun la variante.
- Segmentacion de instancias: genera una mascara por consulta, a resolucion `S/4`, para toda la imagen.
- Inferencia portable en formato ONNX, ejecutable con ONNX Runtime y aceleradores asociados (CUDA, DirectML, TensorRT, OpenVINO) sin dependencia de PyTorch.
- Integracion directa con el nodo ONNX Segment de Houdini Copernicus, que descarga los ficheros automaticamente.
- No soporta *tool calling* ni *function calling*: es un modelo de vision, no un modelo de lenguaje.
- No soporta agentes, razonamiento multi-paso ni *thinking mode*.
- No tiene capacidades multilingues, de audio ni de generacion de texto.
- Vocabulario cerrado: no hay deteccion de categorias abiertas ni *prompting* textual (tipo *open-vocabulary detection*).

## Casos de uso

- Rotoscopia y composicion en Houdini: el nodo ONNX Segment carga estos ficheros y devuelve mascaras por instancia listas para usarse como mate en composicion o como geometria de referencia; la variante large (504×504, mascaras 126×126) es la adecuada cuando el contorno importa, y la nano es util para previsualizacion interactiva.
- Etiquetado asistido de datasets: usar las salidas `dets`, `labels` y `masks` para preanotar imagenes con las 80 clases efectivas de COCO y corregir despues manualmente, reduciendo el coste de anotacion en proyectos de vision.
- Control de calidad en linea de produccion: la entrada de batch fijo 1 y resolucion pequena encaja en inspeccion pieza a pieza con camara fija, detectando y segmentando defectos u objetos si se reentrena o se adapta el cabezal a las clases del dominio.
- Analisis de imagenes con personas: la categoria 1 de COCO es *person*, por lo que sirve para conteo de personas, estudio de ocupacion o desenfoque selectivo en aplicaciones de vision urbana, siempre con las cautelas de sesgo de COCO.
- Edicion fotografica y generacion de recortes: la mascara por instancia permite separar sujeto y fondo sin intervencion manual, y el hecho de poder ejecutarlo en ONNX Runtime facilita su despliegue en aplicaciones de escritorio nativas.
- Prototipado fuera del ecosistema Python: el formato ONNX permite consumir el modelo desde C++, C#/.NET, Java o Rust con ONNX Runtime, algo imposible con los pesos originales de PyTorch sin envoltorios adicionales.
- Investigacion comparativa de arquitecturas DETR: al estar el grafo y las firmas fijadas, resulta sencillo medir latencia por variante y comparar el comportamiento de un decodificador basado en consultas frente a detectores tipo YOLO sobre el mismo conjunto de imagenes.
- Preprocesado para pipelines multimodales: generar mascaras de objetos como entrada de un modelo mayor (por ejemplo, para recorte selectivo o *inpainting*) sin reentrenar nada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye mAP, AP de mascara, latencias ni comparaciones numericas con otros detectores; tampoco los resultados de busqueda web aportan datos tecnicos utilizables.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como dato oficial. El repositorio completo ocupa 0,7 GB para cuatro variantes, de modo que el peso de cada grafo individual es del orden de cientos de megabytes; con activaciones a 504×504 y 200 consultas cabe razonablemente por debajo de 2 GB en float32, pero es una estimacion, no un dato publicado.
- GPU recomendadas: no disponible. Cualquier GPU con soporte de ONNX Runtime CUDA o TensorRT deberia ser suficiente; no se documentan modelos concretos.
- Compatibilidad con GPU de consumo: por tamano de grafo y resolucion de entrada, es esperable que quepa en GPU de consumo de gama media o incluso en CPU, pero no hay confirmacion oficial.
- Opciones de despliegue: nodo ONNX Segment de Houdini Copernicus (caso de uso previsto por el autor), ONNX Runtime con *execution providers* CUDA, TensorRT, DirectML o CPU; conversion adicional a OpenVINO o TensorRT si se necesita optimizar.
- Latencia y throughput: no disponible. La model card no publica tiempos de inferencia por variante ni por hardware.

## Comparativa con modelos similares

| Modelo | Formato | Licencia | Consultas / arquitectura | Metricas publicadas |
|---|---|---|---|---|
| `besit/rfdetr-onnx` | ONNX, opset 17, batch 1 | Apache-2.0 | Decodificador DETR con 100-200 consultas | no disponible en la informacion |
| RF-DETR original (Roboflow, PyTorch) | PyTorch | Apache-2.0 | Misma arquitectura, mismos pesos | no disponible en la informacion |
| Familia de segmentacion de Ultralytics (YOLO) | PyTorch, ONNX, otros | AGPL-3.0 segun la politica publicada por Ultralytics, con licencia comercial alternativa | Deteccion densa, sin consultas | no disponible en la informacion |
| Mask R-CNN (Detectron2) | PyTorch | Apache-2.0 | Dos etapas con ROIAlign | no disponible en la informacion |

Las diferencias verificables frente a estas alternativas son de licencia y de formato de distribucion, no de rendimiento: aqui los pesos siguen siendo los de Roboflow bajo Apache-2.0, lo que evita las obligaciones de copyleft de la licencia AGPL-3.0 que aplica a buena parte del ecosistema YOLO. No hay cifras en la informacion proporcionada para comparar mAP ni velocidad.

## Limitaciones y advertencias

- Vocabulario cerrado de 91 categorias COCO: no detecta ni segmenta clases fuera de ese conjunto y no admite *prompting* textual ni deteccion de vocabulario abierto.
- Sesgos del dataset COCO heredados: sobrerrepresentacion de determinados contextos y objetos, y rendimiento desigual entre clases y regiones geograficas.
- Riesgo de falsos positivos y de detecciones duplicadas: las consultas se decodifican con sigmoide y umbral de 0,5 en las mascaras, de modo que la seleccion de umbral y el filtrado por clase quedan en manos del integrador.
- Mascaras a un cuarto de la resolucion de entrada (78×78 como maximo practico en la variante nano, 126×126 en large): los bordes finos pierden precision y requeriran refinado o *upsampling* en composicion.
- Preprocesado estricto: redimensionado simple sin *letterbox* distorsiona la relacion de aspecto de imagenes no cuadradas, lo que puede degradar la deteccion si no se replica exactamente el preprocesado esperado.
- Batch estatico 1: no admite batching, lo que limita el throughput en servidores que procesan varias imagenes a la vez.
- Artefacto de terceros sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta; la unica garantia de integridad son los hashes SHA-256 publicados en la model card.
- Fechas de creacion y actualizacion poco fiables (2026-09-28), lo que dificulta evaluar la vigencia del artefacto.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero exige conservar los avisos de copyright y licencia de Roboflow (Copyright 2025 Roboflow, Inc.) y no concede derechos de marca.
- Exportacion realizada con `rfdetr` 1.11.0 y opset 17: cambios de version en el runtime o en el exportador pueden alterar los resultados, por lo que conviene fijar versiones en produccion.
- Aviso sobre las fuentes: los resultados de busqueda web asociados a esta consulta no contienen informacion tecnica relevante sobre el modelo (contenido no relacionado), por lo que no se han utilizado como referencia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/besit/rfdetr-onnx
- Repositorio de RF-DETR de Roboflow (arquitectura y pesos originales): https://github.com/roboflow/rf-detr
- Scripts de exportacion y referencia del autor (directorio `rfdetr/`): https://github.com/besit/yolo_onnx
- Nodo ONNX Segment de Houdini Copernicus: no disponible (no se proporciona URL)
- Resultados de benchmarks o paper asociado: no disponible en la informacion proporcionada

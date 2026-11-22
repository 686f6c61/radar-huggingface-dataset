# inference4j/yolox-s

## Resumen

YOLOX-S es un detector de objetos anchor-free desarrollado por Megvii, publicado originalmente en 2021 en el artículo *YOLOX: Exceeding YOLO Series in 2021* (arXiv:2107.08430). Esta ficha corresponde al espejo ONNX oficial (`inference4j/yolox-s`), que reproduce sin modificaciones el export ONNX publicado en la release 0.1.1rc0 del repositorio original de Megvii, pensado para su uso con la librería de inferencia Java `inference4j`.

El modelo resuelve detección de objetos en 80 clases del dataset COCO con una arquitectura YOLOX-S de aproximadamente 9,0 millones de parámetros y una entrada estática de 640x640 píxeles en formato NCHW float32. Alcanza un COCO AP de 40,5 en val2017 según los autores, y su principal atractivo es la licencia Apache-2.0, que lo convierte en una alternativa permisiva frente a detectores YOLO más recientes publicados bajo AGPL (YOLOv8, YOLO26).

No es un modelo de lenguaje ni un transformer generativo: es un detector convolucional de una sola pasada, sin capacidades de texto, tool calling ni razonamiento. Su relevancia actual radica en que ofrece pesos y código con licencia permisiva para integración comercial, con un grafo ONNX autocontenido que no incluye NMS, lo que obliga a implementar el post-procesado en el código de la aplicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOX-S (anchor-free, decoupled head, backbone CSPDarknet con SPP) |
| Parametros totales | 9,0 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen 640x640) |
| Tipos de cuantizacion | no disponible (el repo solo distribuye el grafo ONNX float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de vision; etiquetas COCO-80 en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 11), export oficial de la release 0.1.1rc0 |

## Arquitectura y entrenamiento

YOLOX-S es un detector convolucional de una etapa con diseño anchor-free y decoupled head: separa la rama de clasificación de la de regresión de caja, lo que según el artículo original mejora la convergencia y la precisión frente a las cabezas acopladas de YOLOv3/v4/v5. La salida del grafo es un tensor `[1, 8400, 85]` donde cada punto ancla contiene `[x, y, w, h, objectness, 80 scores de clase]`; las cajas no vienen decodificadas y el NMS no está incluido en el grafo ONNX.

El entrenamiento se realizó desde cero sobre COCO 2017 train (80 clases), sin preentrenamiento en ImageNet, tal como describe el paper de YOLOX. El export usa PyTorch 1.7 y ONNX opset 11. El preprocesado de referencia es letterbox hacia la esquina superior izquierda: escala `r = min(640/h, 640/w)`, redimensionado bilineal a `(int(w*r), int(h*r))` y padding derecho e inferior con valor 114, sobre imagen BGR en rango 0-255, sin media ni desviación estándar. El post-procesado decodifica por strides 8, 16 y 32 en orden row-major (`cx = (x + grid_x) * stride`, `w = exp(w) * stride`), calcula el score como `objectness × class score` y aplica NMS class-agnostic a IoU 0,45 en la demo de referencia.

## Capacidades

- Detección de objetos en 80 clases COCO (0 = person ... 79 = toothbrush) sobre imágenes RGB/BGR de resolución arbitraria, redimensionadas internamente a 640x640.
- Salida de cajas delimitadoras con coordenadas, etiqueta de clase y confianza por detección.
- Inferencia de una sola pasada (single-stage), adecuada para tiempo real en CPU y GPU.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües, de texto, visión-lenguaje, audio ni thinking mode.
- No incluye segmentación, pose, tracking ni detección de keypoints; solo bounding boxes.

## Casos de uso

- Moderación y conteo de personas en espacios: el modelo detecta la clase `person` con cajas y confianza, y puede integrarse en un pipeline de vídeo para contar ocupantes por fotograma tras aplicar NMS a IoU 0,45.
- Videovigilancia en producción con licencia permisiva: al ser Apache-2.0, puede embeberse en productos comerciales sin las obligaciones de copyleft de AGPL que imponen YOLOv8 o YOLO26.
- Automatización de inventario en retail: detección de clases COCO como `bottle`, `cup`, `book` o `chair` en imágenes de estanterías, con post-procesado propio para filtrar por umbral de confianza.
- Pre-etiquetado de datasets: usar YOLOX-S como generador de propuestas de bounding boxes para acelerar el etiquetado humano antes de entrenar un modelo específico de dominio.
- Sistemas embebidos y edge con Java: la integración con `inference4j` permite ejecutar el detector desde JVM en dispositivos con ONNX Runtime, sin depender de Python en producción.
- Análisis de tráfico y escenas urbanas: detección de `car`, `bus`, `truck`, `traffic light` y `stop sign` en imágenes de cámaras, con la salida `[1, 8400, 85]` decodificada por strides para reconstruir cajas.
- Filtrado previo en pipelines de visión: descartar imágenes sin objetos de interés antes de pasarlas a modelos más costosos (OCR, clasificación fina, VLM).

## Benchmarks y rendimiento

| Benchmark | YOLOX-S | Notas |
|---|---|---|
| COCO AP (val2017, 640x640) | 40,5 | Reportado por los autores de YOLOX |

No se han publicado en la información disponible resultados adicionales (AP50, AP75, AP small/medium/large, latencia o throughput) para este export ONNX concreto. Los 40,5 de COCO AP corresponden a la cifra del paper original, no a una medición independiente del espejo ONNX.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 para el grafo ONNX (9,0 M de parámetros más activaciones de 640x640); en la práctica cualquier GPU con 2 GB o más es suficiente.
- GPU recomendadas: RTX 3060, RTX 4060, RTX 4090, A100, H100; el modelo es lo bastante pequeño para saturar principalmente por ancho de banda y no por cómputo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en iGPU con ONNX Runtime.
- CPU: viable para tiempo real moderado con ONNX Runtime; el coste dominante es el backbone convolucional a 640x640.
- Opciones de despliegue: ONNX Runtime (integración nativa con `inference4j` en Java), TensorRT previa conversión desde ONNX, OpenVINO para CPU Intel. No se distribuye en formato GGUF ni como modelo de llama.cpp/Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware y del backend ONNX Runtime/TensorRT elegido.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | COCO AP | Licencia | Formato |
|---|---|---|---|---|---|
| YOLOX-S (este) | 9,0 M | 640x640 | 40,5 | Apache-2.0 | ONNX |
| YOLOv8n | no disponible en la informacion | no disponible | no disponible | AGPL-3.0 | PyTorch/ONNX |
| YOLOv8s | no disponible en la informacion | no disponible | no disponible | AGPL-3.0 | PyTorch/ONNX |
| YOLO26 | no disponible en la informacion | no disponible | no disponible | AGPL-3.0 | no disponible |

La comparación cuantitativa con YOLOv8 y YOLO26 no puede completarse con los datos disponibles; la diferencia documentada y verificable es la licencia (Apache-2.0 frente a AGPL-3.0), que es el argumento principal del espejo `inference4j/yolox-s`.

## Limitaciones y advertencias

- Sesgos de COCO: el modelo solo detecta las 80 clases del dataset; cualquier objeto fuera de ese vocabulario se ignorará o se clasificará erróneamente.
- Riesgo de falsos positivos y negativos en escenas con oclusión, objetos pequeños o condiciones de iluminación adversas; el AP de 40,5 deja margen considerable de error.
- El grafo ONNX no incluye NMS: es obligatorio implementar el post-procesado (decodificación por strides y NMS a IoU 0,45 en la referencia) para obtener detecciones utilizables.
- El preprocesado es estricto (letterbox a esquina superior izquierda, padding 114, BGR 0-255, sin normalización); desviarse de él degrada la precisión de forma no documentada.
- Entrada estática de 640x640: no admite resolución dinámica sin reexportar el grafo.
- Licencia Apache-2.0 permite uso comercial, pero conviene conservar los avisos de copyright y la atribución a Megvii y a los autores del paper.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: es un espejo reciente sin validación comunitaria independiente.
- No apto para tareas de texto, razonamiento, agentes ni multimodalidad; cualquier expectativa en ese sentido es un error de categoría.

## Enlaces

- Hugging Face: https://huggingface.co/inference4j/yolox-s
- Repositorio original de Megvii: https://github.com/Megvii-BaseDetection/YOLOX
- Paper YOLOX: https://arxiv.org/abs/2107.08430
- Pesos originales `yolox_s.pth`: https://github.com/Megvii-BaseDetection/YOLOX/releases/download/0.1.1rc0/yolox_s.pth
- Export ONNX oficial `yolox_s.onnx`: https://github.com/Megvii-BaseDetection/YOLOX/releases/download/0.1.1rc0/yolox_s.onnx
- Librería inference4j: https://github.com/inference4j/inference4j
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0

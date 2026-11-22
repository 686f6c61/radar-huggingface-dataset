# inference4j/picodet-s

## Resumen

PP-PicoDet-S es un detector de objetos ligeros y sin anclas (anchor-free) desarrollado originalmente por PaddlePaddle (Baidu) y publicado en el articulo *PP-PicoDet: A Better Real-Time Object Detector on Mobile Devices* (arXiv:2111.00902). Esta ficha corresponde al espejo ONNX del checkpoint oficial `picodet_s_416_coco_lcnet`, exportado con Paddle2ONNX (opset 11) y distribuido por el usuario `inference4j` para su uso con la libreria de inferencia Java inference4j. El modelo resuelve deteccion de objetos en 80 clases COCO con un coste computacional minimo: 1,18 millones de parametros y una entrada estatica de 416 x 416 pixeles.

La arquitectura combina un backbone LCNet (derivado de PaddleClas con pesos ImageNet-1k), un cuello LCPAN y una cabeza PicoHeadV2. Alcanza un COCO AP de 32,5 en val2017 a 416 x 416, segun los autores de PaddleDetection. Su relevancia actual reside en que es un detector de un orden de magnitud mas pequeno que los detectores transformer o los YOLO de gran tamano, lo que lo hace apto para dispositivos con recursos muy limitados y para integracion en aplicaciones Java mediante ONNX Runtime.

El export ONNX no incluye post-procesado: la decodificacion de cajas y el NMS deben ejecutarse fuera del grafo, tal como se documenta en la model card. El repositorio de Hugging Face no contiene pesos (tamano 0.0 GB), por lo que los pesos deben obtenerse del enlace oficial de PaddleDetection indicado en la seccion de procedencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PP-PicoDet-S: backbone LCNet, cuello LCPAN, cabeza PicoHeadV2 (anchor-free) |
| Parametros totales | 1,18 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen fija) |
| Tipos de cuantizacion | no disponible (el export es float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de vision; etiquetas COCO-80 en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 11), float32; pesos no incluidos en el repositorio de Hugging Face |
| Entrada | tensor `image` `[1, 3, 416, 416]` float32, estatico |
| Salidas | 8 tensores float32 (puntuaciones y distribuciones de caja para strides 8, 16, 32 y 64) |
| Tarea | Deteccion de objetos, 80 clases COCO |
| Framework original | PaddlePaddle, convertido con Paddle2ONNX |

## Arquitectura y entrenamiento

PP-PicoDet-S es un detector de una etapa sin anclas. El backbone LCNet es una red convolucional ligera inicializada con pesos ImageNet-1k de PaddleClas; sobre ella se situa el cuello LCPAN, que agrega caracteristicas multi-escala, y la cabeza PicoHeadV2, que predice puntuaciones de clase y distribuciones de caja. En lugar de regresar directamente las coordenadas, la cabeza modela cada lado de la caja como una distribucion sobre 8 bins: se aplica softmax sobre los bins y la distancia se calcula como la suma ponderada `sum(p_i * i) * s`, donde `s` es el stride. Este esquema de distribucion de cajas es una de las innovaciones del trabajo original y sustituye a la regresion directa, mejorando la estabilidad del entrenamiento en modelos pequenos.

El entrenamiento se realizo sobre COCO 2017 train (80 clases). No se documenta en la informacion disponible el numero exacto de tokens ni la composicion detallada del dataset mas alla de COCO 2017 y la inicializacion ImageNet-1k del backbone. Tampoco se detalla si hubo etapas de ajuste fino adicionales o tecnicas de destilacion. El export ONNX mantiene las salidas originales y solo elimina los pesos de las entradas del grafo, dejandolos como inicializadores. El post-procesado (decodificacion de cajas y NMS class-aware con IoU 0,6, umbral de score 0,025, top 1000 por clase y 100 detecciones finales) no forma parte del grafo y debe implementarse en el codigo de inferencia.

## Capacidades

- Deteccion de objetos en 80 clases COCO (de `person` a `toothbrush`) con cajas delimitadoras y puntuaciones de confianza.
- Inferencia sobre imagenes RGB de 416 x 416 con preprocesado fijo: redimensionado bicubico sin preservar relacion de aspecto, normalizacion `/255` y media/desviacion ImageNet en formato NCHW.
- Modelo anchor-free, lo que simplifica el post-procesado frente a detectores basados en anclas.
- Salidas multi-escala (strides 8, 16, 32 y 64) que permiten detectar objetos de distintos tamanos, incluidos objetos pequenos en imagenes de alta resolucion reescaladas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un modelo de vision por computador.
- No dispone de capacidades multilingues ni de procesamiento de lenguaje natural.
- Integracion directa con la libreria Java inference4j mediante la clase `PicoDetDetector`.
- No incluye NMS ni decodificacion en el grafo; el consumidor debe implementar el post-procesado descrito en la model card.

## Casos de uso

- Deteccion de personas y objetos en aplicaciones Java de videovigilancia: el modelo se ejecuta via ONNX Runtime dentro de la JVM con inference4j, procesando fotogramas de 416 x 416 a bajo coste y devolviendo cajas y etiquetas COCO listas para registro o alerta.
- Moderacion de contenido en imagenes subidas por usuarios: con 1,18 M de parametros se puede desplegar en el mismo servidor de aplicaciones sin GPU dedicada, filtrando categorias sensibles (personas, armas blancas representadas en COCO como `knife`, etc.) antes de almacenar la imagen.
- Analisis de imagenes en dispositivos edge o embebidos: al ser un detector disenado para moviles, cabe en entornos con pocos cientos de MB de memoria y permite inferencia en CPU en aplicaciones de IoT, camaras inteligentes o robots de bajo coste.
- Pre-etiquetado y anotacion asistida de datasets: el detector genera cajas candidatas sobre grandes volumenes de imagenes para que anotadores humanos las revisen, reduciendo el tiempo de etiquetado en pipelines de vision.
- Conteo y localizacion de objetos en imagenes de inventario o retail: deteccion de categorias COCO como `bottle`, `cup`, `book` o `chair` para tareas de auditoria visual automatizada.
- Procesamiento por lotes en pipelines de datos: al tener entrada estatica y salidas de forma fija, se puede vectorizar el procesamiento de lotes en servidores sin GPU y almacenar las detecciones en bases de datos para analitica posterior.
- Prototipado rapido en Java: equipos que ya trabajan en JVM pueden incorporar deteccion de objetos sin cambiar de lenguaje ni montar servicios Python, usando el ejemplo de la model card como punto de partida.

## Benchmarks y rendimiento

| Benchmark | Resultado | Condiciones |
|---|---|---|
| COCO AP (val2017) | 32,5 | Entrada 416 x 416, segun los autores de PaddleDetection |

No se han publicado en la informacion disponible resultados de otros benchmarks (por ejemplo, latencia, throughput o AP por categoria) para este export ONNX concreto. Los datos de latencia del articulo original corresponden a implementaciones en PaddlePaddle y no se trasladan necesariamente al export ONNX.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para el modelo en float32; el grafo ONNX con 1,18 M de parametros ocupa unos pocos MB, y el consumo dominante es el buffer de activaciones de la entrada 416 x 416.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime, incluidas NVIDIA T4, RTX 3060, RTX 4090, A100 y H100; el modelo no aprovecha toda la capacidad de las GPU de gama alta y se beneficia mas del paralelismo por lotes.
- Cabe holgadamente en GPU consumer e incluso en CPU: es viable en Raspberry Pi, moviles y navegadores mediante ONNX Runtime Web, aunque no se documentan latencias concretas.
- Opciones de despliegue: ONNX Runtime (C++, Python, Java, C#), inference4j para Java, y cualquier runtime compatible con ONNX opset 11. No se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada. El modelo esta disenado para tiempo real en dispositivos moviles segun el articulo original, pero no se aportan cifras para este export.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | COCO AP | Licencia | Formato |
|---|---|---|---|---|---|
| PP-PicoDet-S (este modelo) | 1,18 M | 416 x 416 | 32,5 | Apache-2.0 | ONNX |
| PP-PicoDet-M | no disponible en la informacion | no disponible | no disponible | Apache-2.0 | PaddlePaddle / ONNX |
| YOLOv8n | no disponible en la informacion | no disponible | no disponible | AGPL-3.0 (Ultralytics) | PyTorch / ONNX |
| YOLOv5n | no disponible en la informacion | no disponible | no disponible | GPL-3.0 (Ultralytics) | PyTorch / ONNX |

No se dispone de datos verificados en la informacion proporcionada para completar las cifras de los modelos alternativos; se indican como no disponibles para no inventar numeros. La comparacion cualitativa relevante es que PP-PicoDet-S ofrece licencia Apache-2.0 permisiva frente a las licencias copyleft de las familias YOLO de Ultralytics, lo que facilita su uso comercial sin obligaciones de apertura.

## Limitaciones y advertencias

- El repositorio de Hugging Face no contiene los pesos (tamano 0.0 GB); deben descargarse del enlace oficial de PaddleDetection indicado en la procedencia.
- El grafo no incluye decodificacion de cajas ni NMS: una implementacion incorrecta del post-procesado (orden de tensores, softmax sobre bins, escalado por stride y por dimension de imagen) produce detecciones erroneas.
- Entrada estatica de 416 x 416: imagenes de otra resolucion deben redimensionarse sin preservar relacion de aspecto, lo que distorsiona objetos y puede degradar la precision en escenas muy panoramicas o muy verticales.
- Solo 80 clases COCO: no detecta categorias fuera de ese vocabulario y confunde clases visualmente proximas o poco representadas.
- Riesgo de falsos positivos y negativos inherente a un detector de 1,18 M de parametros; el umbral de score 0,025 del NMS original es bajo y debe ajustarse segun la aplicacion.
- Sesgos del dataset COCO: la distribucion de imagenes y anotaciones condiciona el rendimiento en dominios distintos (imagen medica, satelital, industrial), donde la precision puede caer de forma significativa.
- No apto para tareas de lenguaje, razonamiento, agentes ni tool calling; no debe presentarse como un modelo generativo.
- Licencia Apache-2.0 permisiva para uso comercial, pero el usuario debe verificar las licencias de las dependencias de inferencia (ONNX Runtime, inference4j) y de los pesos originales de PaddleDetection.
- No se documentan versiones cuantizadas (INT8, FP16) en la informacion disponible; cualquier cuantizacion requeriria validacion propia de la precision.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/inference4j/picodet-s
- Repositorio PaddleDetection (configuracion PicoDet): https://github.com/PaddlePaddle/PaddleDetection/tree/release/2.9/configs/picodet
- Articulo PP-PicoDet (arXiv:2111.00902): https://arxiv.org/abs/2111.00902
- Pesos originales PaddlePaddle: https://paddledet.bj.bcebos.com/models/picodet_s_416_coco_lcnet.pdparams
- Export ONNX oficial: https://paddledet.bj.bcebos.com/deploy/third_engine/picodet_s_416_coco_lcnet.onnx
- Libreria inference4j: https://github.com/inference4j/inference4j
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0

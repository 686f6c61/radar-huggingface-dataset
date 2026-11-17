# qhddz/yolo-rknn3-rk1828

## Resumen

`qhddz/yolo-rknn3-rk1828` es un repositorio de modelos de deteccion de objetos YOLO preconvertidos al formato RKNN3 para los coprocesadores de IA Rockchip RK1820 y RK1828. Incluye variantes de YOLOv5, YOLOv6, YOLOv8 y YOLO26 (en tamanos n, s y m para esta ultima), cada una en dos versiones: cuantizacion entera i8 y fp16 (w16a16 en el caso de YOLO26). El paquete lo publica el usuario `qhddz` a partir de los modelos oficiales del SDK RKNN3 de Rockchip y del repositorio `rknn3-model-zoo`.

El problema que resuelve es la falta de artefactos listos para desplegar en la NPU RK1828: los modelos `.rknn` y `.weight` permiten ejecutar deteccion de objetos directamente sobre el acelerador sin necesidad de convertir pesos en el host. RKNN3 emplea un formato de pesos separado, de modo que el fichero `.rknn` contiene el grafo y el `.weight` los parametros, y ambos son necesarios para cargar el modelo.

Es relevante para desarrolladores de vision por computador que integren deteccion en dispositivos edge con aceleradores Rockchip, ya que ofrece latencias de decenas de milisegundos por imagen a 640x640 y elimina parte del postprocesado en el host para YOLOv5, v6 y v8 (decodificacion de cajas y NMS embebidos). La licencia es un factor critico: los modelos derivan de pesos AGPL-3.0 y GPL-3.0, con implicaciones para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Redes YOLO (YOLOv5, YOLOv6, YOLOv8, YOLO26) convertidas a RKNN3 para NPU Rockchip |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 640x640) |
| Tipos de cuantizacion | i8 (cuantizacion entera) y fp16 (w16a16 en YOLO26) |
| Idiomas soportados | no aplica (deteccion de objetos, sin capacidades linguisticas) |
| Licencia | AGPL-3.0 (YOLOv5, YOLOv8, YOLO26) y GPL-3.0 (YOLOv6) |
| Formato de pesos | RKNN3 con pesos separados: `.rknn` (grafo) + `.weight` (pesos) |

## Arquitectura y entrenamiento

Se trata de detectores de objetos de la familia YOLO (single-stage, basados en backbone CNN y cabezas de deteccion multi-escala con strides 8/16/32) convertidos al formato RKNN3 mediante el SDK oficial de Rockchip. El repositorio no entrena modelos nuevos: redistribuye conversiones de pesos PyTorch oficiales de cada proyecto upstream (ultralytics para YOLOv5/v8/YOLO26 y meituan para YOLOv6) realizadas con el SDK RKNN3 y el `rknn3-model-zoo`.

La innovacion tecnica principal es el empaquetado para la NPU RK1828: los modelos YOLOv5, v6 y v8 incorporan la decodificacion de cajas y el NMS dentro del grafo, de modo que la salida es `[1, K, 6]` (score, clase, x1, y1, x2, y2) y el host solo remapea coordenadas. En YOLO26 el modelo emite 6 cabezas crudas (cajas y logits de score en strides 8/16/32) y el postprocesado (decodificacion, sigmoid y NMS por clase) se ejecuta en el host. La normalizacion esta integrada en el modelo: la entrada es una imagen RGB uint8 de 640x640 con letterbox, sin necesidad de media/std en el preprocesado. No se dispone de informacion sobre el numero de tokens ni sobre el dataset de entrenamiento mas alla de COCO, que es el conjunto de referencia para las metricas publicadas.

## Capacidades

- Deteccion de objetos en imagenes RGB de 640x640 con letterbox.
- Decodificacion de cajas y NMS embebidos en el grafo para YOLOv5, YOLOv6 y YOLOv8; salida directa `[1, K, 6]`.
- YOLO26 con cabezas crudas y postprocesado en el host (decodificacion, sigmoid, NMS por clase).
- Variantes de tamano: YOLOv5, YOLOv6 y YOLOv8 (una version cada una) y YOLO26 en tamanos n, s y m.
- Ejecucion sobre NPU Rockchip RK1820/RK1828 mediante la API `librknn3_api.so`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues; es exclusivamente un modelo de vision para deteccion.

## Casos de uso

- Vigilancia y videovigilancia en edge: ejecutar YOLOv8 i8 sobre la NPU RK1828 en camaras o dispositivos empotrados con latencias de unos 60 ms por frame, sin depender de un servidor central.
- Inspeccion industrial en linea de produccion: usar YOLOv6 o YOLOv5 i8 para detectar defectos o piezas en cintas transportadoras, aprovechando la decodificacion y NMS embebidos para simplificar el pipeline del host.
- Robotica movil y drones: desplegar YOLO26n o YOLOv5 en el coprocesador RK1820/RK1828 para deteccion de obstaculos o personas con bajo consumo, dado el formato optimizado para NPU.
- Analisis de imagenes en retail: conteo de personas o deteccion de productos en camaras de tienda con YOLO26s, que ofrece un equilibrio entre precision (48,6% mAP en FP32) y coste computacional.
- Sistemas de conteo de trafico: procesar flujos de video en dispositivos con RK1828 usando YOLOv8 i8 con NMS integrado, reduciendo la carga de CPU en el host.
- Prototipado rapido en placas Rockchip: emplear los modelos preconvertidos para validar pipelines de deteccion sin tener que ejecutar la conversion RKNN desde PyTorch, usando el wrapper ctypes sobre `librknn3_api.so`.
- Aplicaciones de deteccion de alta precision en edge: YOLO26m (53,1% mAP en FP32) para escenarios donde la exactitud prima sobre la latencia, con postprocesado en el host.

## Benchmarks y rendimiento

Resultados publicados en la model card (PC x86_64 + RK1828, una sola imagen COCO):

| Modelo | Cuantizacion | Latencia | Objetos detectados |
|---|---|---|---|
| yolov5 | i8 | 36 ms | 18 |
| yolov5 | fp16 | ~50 ms | 18 |
| yolov6 | i8 | ~50 ms | no disponible |
| yolov8 | i8 | 60 ms | decodificacion + NMS integrados |
| yolo26n | i8 | 55 ms | cabezas crudas, NMS en host |

Precision de referencia (rknn3-model-zoo, PyTorch FP32, mAP@0.5:0.95 en COCO):

| Modelo | mAP@0.5:0.95 (FP32) | mAP en RKNN W8A8 |
|---|---|---|
| yolo26n | 40,9% | 37,63% (COCO val2017) |
| yolo26s | 48,6% | no disponible |
| yolo26m | 53,1% | no disponible |

No se han publicado resultados de benchmarks para YOLOv5, YOLOv6 ni YOLOv8 en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: coprocesador de IA Rockchip RK1820 o RK1828; requiere driver, firmware y runtime RKNN3 (`rknn3-rk182x` DEB) instalados y verificables con `sudo rknn-smi info`.
- Host de ejemplo: PC x86_64 con RK1828 conectado; no se especifica VRAM de GPU dedicada porque la inferencia se ejecuta en la NPU.
- No se dispone de datos sobre si los modelos caben en GPU consumer; el despliegue no usa CUDA sino la NPU Rockchip.
- Opciones de despliegue: API nativa `librknn3_api.so` mediante wrapper ctypes (no existe paquete oficial de Python para hosts x86_64). Cadena de llamadas: `rknn3_init` → `rknn3_load_model_from_path(model.rknn, model.weight)` → `rknn3_model_init` → `rknn3_create_mem`/`rknn3_mem_sync` → `rknn3_run`.
- No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia estimada: 36-60 ms por imagen de 640x640 segun modelo y cuantizacion (medida en PC x86_64 + RK1828). Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Formato / hardware | Cuantizacion | Latencia | Licencia |
|---|---|---|---|---|
| YOLOv5 RKNN3 (este repo) | RKNN3 / RK1828 | i8, fp16 | 36 ms (i8) | AGPL-3.0 |
| YOLOv8 RKNN3 (este repo) | RKNN3 / RK1828 | i8, fp16 | 60 ms (i8) | AGPL-3.0 |
| YOLO26n RKNN3 (este repo) | RKNN3 / RK1828 | i8, fp16 | 55 ms (i8) | AGPL-3.0 |
| YOLOv6 RKNN3 (este repo) | RKNN3 / RK1828 | i8, fp16 | ~50 ms (i8) | GPL-3.0 |

No se dispone de datos de latencia o precision de alternativas convertidas a otros formatos (ONNX, TensorRT, TFLite) en la informacion proporcionada, por lo que la comparativa se limita a las variantes incluidas en el propio repositorio.

## Limitaciones y advertencias

- Licencia copyleft fuerte: AGPL-3.0 (YOLOv5, YOLOv8, YOLO26) y GPL-3.0 (YOLOv6). Distribuir los modelos u ofrecer servicios de red basados en ellos exige divulgar el codigo fuente correspondiente; el uso comercial cerrado requiere licencia Enterprise de Ultralytics o elegir otro modelo.
- La conversion a RKNN3 no altera la licencia de los pesos originales.
- Las anotaciones del dataset COCO estan sujetas a sus propios terminos de uso.
- Dependencia de hardware especifico (RK1820/RK1828); no ejecutable en GPU convencional sin reconversion.
- No hay paquete oficial de Python para hosts x86_64: es necesario un wrapper ctypes sobre `librknn3_api.so`.
- El formato de pesos separado (`.rknn` + `.weight`) obliga a gestionar ambos ficheros conjuntamente; la ausencia de uno impide la carga.
- La cuantizacion i8 introduce perdida de precision: yolo26n pasa de 40,9% a 37,63% mAP@0.5:0.95 en COCO val2017.
- No se dispone de informacion sobre sesgos del modelo mas alla de los inherentes al dataset COCO (clases limitadas a 80 categorias y posible sesgo de representacion).
- Riesgo de alucinacion no aplica en el sentido linguistico, pero si de falsos positivos y negativos propios de la deteccion; no se han publicado tasas de error detalladas por clase.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que limita la validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/qhddz/yolo-rknn3-rk1828
- Ultralytics YOLOv5: https://github.com/ultralytics/yolov5
- Ultralytics (YOLOv8, YOLO26): https://github.com/ultralytics/ultralytics
- Meituan YOLOv6: https://github.com/meituan/YOLOv6
- Terminos de uso de COCO: https://cocodataset.org/#termsofuse
- SDK RKNN3 de Rockchip y `rknn3-model-zoo`: no disponible como enlace directo en la informacion proporcionada (distribuido via cloud drive oficial de Rockchip)

# nxp/ssdlite-mobilenetv2-imx

## Resumen

SSDLite MobileNetV2 para i.MX es un modelo de deteccion de objetos en tiempo real, ligeroy cuantizado a int8, publicado por NXP en Hugging Face. Deriva del modelo original SSDLite MobileNetV2 COCO (2018-05-09) desarrollado por Google y el equipo de TensorFlow Object Detection API, y ha sido adaptado por NXP para ejecutarse de forma eficiente en los aceleradores NPU de sus procesadores i.MX 8M Plus, i.MX 93, i.MX 95 e i.MX 952.

El modelo combina la arquitectura SSD (Single Shot MultiBox Detector) con un backbone MobileNetV2, sustituyendo las convoluciones estandar de SSD por convoluciones separables en profundidad (de ahi el sufijo "Lite") para reducir el coste computacional. Con 4,3 millones de parametros y 1,5 GFLOPs por inferencia, esta pensado para escenarios de vision embebida donde el consumo energetico y la latencia son criticos.

La relevancia de esta publicacion radica en que NXP distribuye artefactos ya compilados y optimizados para cada NPU concreta (Ethos-U65 en i.MX 93, eIQ Neutron en i.MX 95/952, VX en i.MX 8M Plus), junto con los scripts de regeneracion, un ejemplo de inferencia y un script de evaluacion. Esto elimina gran parte del trabajo de portado que tradicionalmente requiere desplegar vision por computador en hardware embebido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SSD (Single Shot MultiBox Detector) con backbone MobileNetV2 y convoluciones depthwise-separable (SSDLite) |
| Parametros totales | 4,3 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen fija) |
| Tipos de cuantizacion | int8 post-training quantization (pesos y activaciones int8; tensores de entrada/salida float32) |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | TensorFlow Lite (`.tflite`), compilado para NPU (Vela / eIQ Neutron) |
| Resolucion de entrada | 300 x 300 x 3, RGB, float32 |
| Salidas | 2 tensores float32: cajas (1, 1917, 1, 4) sin decodificar y puntuaciones de clase (1, 1917, 91) |
| Categorias | 91 clases COCO |
| Cajas prior (anchors) | 1917 |
| FLOPS | 1,5 G |
| Tamano del fichero (int8) | 5,3 MB (5.578.432 bytes) |
| Framework origen | TensorFlow 1 |
| Runtime | eIQ LiteRT (TensorFlow Lite) con delegado NPU correspondiente |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SSD de una sola etapa: una red troncal extractora de caracteristicas (MobileNetV2) seguida de cabezas de prediccion que regresan, para cada una de las 1917 cajas prior, un vector de 4 coordenadas de caja y una distribucion de puntuaciones sobre 91 categorias COCO. La variante "Lite" reemplaza las convoluciones 3x3 estandar de las capas de prediccion por convoluciones separables en profundidad, lo que reduce drasticamente el numero de operaciones manteniendo una precision razonable para deteccion en tiempo real. El modelo original fue entrenado por Google sobre el dataset COCO; NXP no ha reentrenado los pesos, sino que ha realizado una derivacion del artefacto publicado.

Las modificaciones introducidas por NXP son de caracter de despliegue, no de entrenamiento: poda de los subgrafos de pre y post-procesado (decodificador de imagen, decodificacion de cajas y NMS), conversion de TensorFlow 1 SavedModel a TensorFlow Lite y cuantizacion completa int8 post-entrenamiento con TensorFlow 2.13.0. La calibracion se realizo con 100 imagenes muestreadas aleatoriamente de COCO val2017, redimensionadas a 300x300 y normalizadas con `image / 127.5 - 1`. Para i.MX 93 el modelo se compila con la herramienta Vela para la NPU Arm Ethos-U65 (tags `lf-6.18.20_2.0.0` y `lf-6.18.37_2.1.0`); para i.MX 95 e i.MX 952 se convierte con el eIQ Neutron SDK en versiones 3.1.3, 3.2.1 y 3.2.3. La decodificacion de cajas y la NMS quedan fuera del grafo y deben implementarse en la aplicacion (el repositorio incluye `example.py` como referencia).

## Capacidades

- Deteccion de objetos en imagenes RGB a resolucion fija de 300x300, devolviendo cajas delimitadoras y puntuaciones para 91 categorias COCO.
- Inferencia en tiempo real sobre NPU de bajo consumo (i.MX 8M Plus, i.MX 93, i.MX 95, i.MX 952).
- Ejecucion cuantizada int8 con delegados especificos por hardware (VX, Ethos-U, Neutron).
- Modelo de una sola etapa sin etapa de propuestas, adecuado para pipelines de vision de baja latencia.
- No incluye decodificacion de cajas ni NMS en el grafo: el post-procesado debe implementarse en la aplicacion.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No dispone de modo "thinking", vision multimodal, audio ni generacion de texto: es exclusivamente un detector de objetos.

## Casos de uso

- Vigilancia y videovigilancia embebida: el modelo puede procesar fotogramas de camaras IP en dispositivos i.MX 93 o i.MX 8M Plus, detectando personas, vehiculos y objetos comunes de COCO en el propio borde, sin enviar video a la nube.
- Automocion y sistemas ADAS de bajo coste: deteccion de peatones, vehiculos y senales de trafico en tiempo real sobre SoC i.MX 95, aprovechando la NPU Neutron para mantener latencias bajas y consumo contenido.
- Robotica de servicio y logistica: identificacion de objetos en cintas transportadoras o almacenes para tareas de picking, con el modelo ejecutandose en el controlador embebido del robot.
- Domotica y camaras inteligentes: activacion de grabacion o notificaciones solo cuando se detecta una clase relevante (persona, mascota, vehiculo), reduciendo ancho de banda y almacenamiento.
- Analisis de aforo y conteo: conteo de personas en espacios publicos mediante deteccion por fotograma y seguimiento externo, desplegado en dispositivos de borde con i.MX 8M Plus.
- Control de calidad industrial: deteccion de defectos o presencia/ausencia de componentes en lineas de fabricacion, integrado en un PLC o gateway industrial basado en i.MX 93.
- Preprocesado para pipelines mayores: uso como primera etapa de deteccion que alimente modelos mas pesados (reconocimiento, clasificacion fina) solo en las regiones de interes detectadas, ahorrando computo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de mAP, latencia ni throughput para este artefacto cuantizado.

## Requisitos de hardware

- VRAM: no aplica; el modelo esta disenado para ejecutarse en NPU integradas en SoC, no en GPU de proposito general. El fichero int8 ocupa 5,3 MB.
- Hardware objetivo oficial: NXP i.MX 8M Plus (delegado VX), i.MX 93 (NPU Arm Ethos-U65 via Vela), i.MX 95 e i.MX 952 (NPU eIQ Neutron).
- No esta pensado para GPU de escritorio (A100, H100, RTX 4090); puede ejecutarse en CPU via LiteRT/TFLite para pruebas, pero sin las optimizaciones de NPU.
- Opciones de despliegue: runtime eIQ LiteRT (TensorFlow Lite) con el delegado NPU correspondiente; el repositorio incluye `recipe.sh` para regenerar los artefactos, `example.py` para inferencia y `evaluate.py` para evaluacion.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Versiones de BSP y SDK soportadas: i.MX 93 con BSP `lf-6.18.20_2.0.0` y `lf-6.18.37_2.1.0`; i.MX 95 e i.MX 952 con Neutron SDK 3.1.3, 3.2.1 y 3.2.3.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Categorias | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|---|
| SSDLite MobileNetV2 (este) | 4,3 M | 300x300 | 91 COCO | int8 | Apache-2.0 | NPU NXP i.MX |
| SSD MobileNetV2 (original TF) | ~3,4 M (backbone) | 300x300 | 91 COCO | float32 / int8 | Apache-2.0 | CPU / GPU / Edge TPU |
| YOLOv5n | ~1,9 M | 640x640 | 80 COCO | int8 / fp16 | GPL-3.0 (AGPL) | CPU / GPU / Edge TPU |
| EfficientDet-Lite0 | ~4,7 M | 320x320 | 90 COCO | int8 | Apache-2.0 | Edge TPU / CPU |

Nota: los datos de los modelos alternativos provienen de sus respectivas model cards publicas; no se dispone de comparativas de precision medidas en el mismo entorno para este artefacto concreto.

## Limitaciones y advertencias

- Modelo exclusivamente de deteccion de objetos: no genera texto, no razona, no soporta agentes ni tool calling.
- Entrada fija de 300x300: objetos muy pequenos o imagenes de alta resolucion requeriran redimensionado, con perdida de detalle.
- Solo 91 clases COCO: no detecta categorias fuera de ese vocabulario sin reentrenamiento.
- El grafo no incluye decodificacion de cajas ni NMS; una implementacion incorrecta del post-procesado degrada gravemente los resultados.
- La cuantizacion int8 puede introducir perdida de precision frente al modelo original en float32; no se han publicado metricas de dicha perdida.
- Riesgo de falsos positivos y negativos inherente a los detectores de una etapa con backbone ligero, especialmente en escenas con oclusiones o iluminacion adversa.
- Sesgos heredados del dataset COCO (principalmente imagenes de contextos occidentales, ciertos sesgos de representacion de personas y objetos); no se documenta analisis de sesgo en la model card.
- Dependencia fuerte del hardware: los artefactos precompilados solo funcionan en las NPU y versiones de BSP/SDK indicadas; otras plataformas requieren recompilacion.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar la cadena de atribucion al modelo original de Google/TensorFlow.
- El repositorio tiene un tamano de 0,0 GB reportado y 68 descargas, lo que sugiere baja adopcion publica; conviene validar los artefactos antes de usarlos en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/nxp/ssdlite-mobilenetv2-imx
- Modelo original SSDLite MobileNetV2 COCO (2018-05-09): https://download.tensorflow.org/models/object_detection/ssdlite_mobilenet_v2_coco_2018_05_09.tar.gz
- TensorFlow Object Detection Model Zoo (TF1): https://github.com/tensorflow/models/blob/master/research/object_detection/g3doc/tf1_detection_zoo.md
- Paper SSD: https://arxiv.org/abs/1512.02325
- Paper MobileNetV2: https://arxiv.org/abs/1801.04381
- Herramienta Vela (Ethos-U): https://github.com/nxp-imx/ethos-u-vela
- Fichero de manifiesto de release: https://huggingface.co/nxp/ssdlite-mobilenetv2-imx/blob/main/release_manifest.json
- Ejemplo de inferencia: https://huggingface.co/nxp/ssdlite-mobilenetv2-imx/blob/main/example.py
- Script de evaluacion: https://huggingface.co/nxp/ssdlite-mobilenetv2-imx/blob/main/evaluate.py
- Script de regeneracion: https://huggingface.co/nxp/ssdlite-mobilenetv2-imx/blob/main/recipe.sh

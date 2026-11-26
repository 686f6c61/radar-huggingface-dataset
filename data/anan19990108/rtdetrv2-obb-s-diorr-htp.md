# anan19990108/rtdetrv2-obb-s-diorr-htp

## Resumen

RT-DETRv2 OBB Small — DIOR-R es un modelo de deteccion de objetos orientados (oriented object detection, OBB) derivado del checkpoint `rtdetrv2_obb_hgnetv2_s_diorr.pth` del repositorio RicePasteM/RT-DETR-OBB. Lo publica el usuario anan19990108 como un paquete de despliegue listo para produccion en entornos de borde, con pesos convertidos a ONNX, TFLite y QNN. Detecta 20 categorias de objetos aereos sobre imagenes de 800 x 800 pixeles, orientado al dataset DIOR-R.

El modelo se basa en RT-DETRv2, un detector transformer end-to-end de la familia DETR con backbone HGNetv2 en su variante Small. La innovacion principal de esta publicacion no es el modelo en si, sino el trabajo de conversion y cuantizacion: ofrece una build flotante como referencia y una build experimental con cuantizacion mixta W8A8 en el stem y las dos primeras etapas del backbone, manteniendo el resto de la red en FP16 sobre el acelerador HTP de Qualcomm (QCS8550).

Es relevante porque demuestra un flujo completo de despliegue de un detector DETR orientado en hardware movil/embebido, con mediciones de latencia (p50/p95) y precision (AP50, AP75, mAP50-95) sobre 50 imagenes del conjunto de test de DIOR-R. El repositorio ocupa 0,2 GB y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RT-DETRv2 (transformer end-to-end DETR) con backbone HGNetv2 Small |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | FP32 (ONNX), FP16 en HTP (TFLite flotante), W8A8 parcial + FP16 (TFLite experimental INT8 mixto) |
| Idiomas soportados | no disponible (no aplica, modelo de vision) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX, TFLite, QNN context binary (`.bin`) + wrapper ONNX |
| Resolucion de entrada | 800 x 800 |
| Categorias detectadas | 20 (dataset DIOR-R) |
| Tamano del repositorio | 0,2 GB |
| Tamano del TFLite INT8 mixto | 35,24 MB |

## Arquitectura y entrenamiento

RT-DETRv2 es un detector de objetos end-to-end basado en transformer, sucesor de RT-DETR. Elimina la necesidad de postprocesado NMS al predecir directamente conjuntos de cajas mediante consultas aprendidas. El backbone es HGNetv2 en variante Small, y el modelo esta especializado en deteccion de cajas orientadas (rotated bounding boxes), lo que lo hace adecuado para imagenes aereas donde los objetos aparecen en cualquier orientacion. La entrada es de 800 x 800 pixeles y la cabeza predice 20 categorias del dataset DIOR-R.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, composicion del dataset mas alla de DIOR-R, ni sobre el uso de RLHF/DPO (no aplicable en un detector). El checkpoint upstream es `diorr/rtdetrv2_obb_hgnetv2_s_diorr.pth` del repositorio RicePasteM/RT-DETR-OBB (revision `f376e9dcedfb9a47a21ac71ef61ad99f8b545698`), con SHA-256 y metodo de verificacion documentados en `evaluation/results.json`. La innovacion tecnica de esta publicacion es la cadena de conversion a ONNX, TFLite y QNN, incluyendo una cuantizacion mixta que aplica W8A8 solo al stem y a las dos primeras etapas del backbone para preservar precision en las capas mas sensibles.

## Capacidades

- Deteccion de objetos orientados (oriented bounding boxes) en imagenes aereas de 800 x 800.
- Clasificacion en 20 categorias del dataset DIOR-R.
- Inferencia en CPU via ONNX Runtime (build FP32).
- Inferencia en acelerador HTP de Qualcomm via TFLite (FP16) y QNN context binary (QCS8550, HTP v73, QAIRT 2.47).
- Build experimental con cuantizacion mixta W8A8 + FP16 para reducir tamano (35,24 MB) manteniendo precision cercana a la flotante.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (es un modelo puramente de vision).
- No dispone de modo thinking, vision generativa ni audio.

## Casos de uso

- Deteccion de vehiculos y aeronaves en imagenes de satelite: el modelo predice cajas orientadas, lo que permite localizar objetos alargados en cualquier angulo sin el error de las cajas axis-aligned, adecuado para analisis de imagenes DIOR-R.
- Despliegue en dispositivos de borde con Qualcomm QCS8550: el context binary QNN permite ejecutar inferencia sobre el HTP con latencias p50 de ~180 ms, util para drones o camaras IP con SoC Snapdragon.
- Monitorizacion de infraestructuras criticas: deteccion de barcos, puentes o almacenes en ortomosaicos aereos, aprovechando las 20 categorias de DIOR-R.
- Pipeline de teledeteccion en servidor con ONNX Runtime: la build FP32 en ONNX se integra en servicios backend sin dependencias de GPU, usando ORT CPU.
- Prototipado rapido en movil con TFLite: la build flotante TFLite permite validar el modelo en Android/iOS antes de pasar a la version cuantizada.
- Investigacion en cuantizacion de detectores DETR: la comparativa flotante vs INT8 mixto (con metricas AP y latencia) sirve como referencia para estudiar el impacto de la cuantizacion parcial en cabezas de deteccion orientada.
- Control de calidad en inspeccion aerea: deteccion de anomalias o elementos concretos en imagenes de dron con inferencia local en el dispositivo, sin enviar imagenes a la nube.

## Benchmarks y rendimiento

Resultados sobre 50 imagenes de test de DIOR-R, TFLite sobre HTP Linux, tras 10 warmups. Precision medida con IoU rotado y AP VOC07 de 11 puntos. Tiempos de preparacion y procesamiento en host excluidos.

| Build TFLite HTP | p50 (ms) | p95 (ms) | AP50 | AP75 | mAP50-95 |
|---|---|---|---|---|---|
| Flotante (referencia) | 181,925 | 182,867 | 0,764652 | 0,529972 | 0,506660 |
| INT8 mixto (experimental) | 178,625 | 179,808 | 0,754503 | 0,509203 | 0,491938 |

La cuantizacion mixta reduce el tamano a 35,24 MB y mejora ligeramente la latencia (~3 ms en p50), con una caida de ~1 punto en AP50 y ~1,5 puntos en mAP50-95.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo es pequeno (repo de 0,2 GB) y la build INT8 mixta pesa 35,24 MB, por lo que cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no se especifican en la informacion; al ser un detector pequeno, cualquier GPU moderna (RTX 3060 en adelante) es suficiente para la build ONNX.
- Cabe en GPU de consumo: si, dado el tamano reducido del modelo.
- Aceleradores de borde: Qualcomm QCS8550 con HTP v73 y QAIRT 2.47 (build QNN validada).
- Opciones de despliegue: ONNX Runtime (CPU), TFLite (CPU y HTP), QNN context binary sobre Linux (QCS8550).
- Latencia: p50 ~178-182 ms y p95 ~180-183 ms en HTP QCS8550 para ambas builds TFLite.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Categorias | Licencia | Formatos |
|---|---|---|---|---|---|
| Este modelo (RT-DETRv2 OBB Small — DIOR-R) | RT-DETRv2 + HGNetv2-S | 800 x 800 | 20 (DIOR-R) | Apache-2.0 | ONNX, TFLite, QNN |
| RicePasteM/RT-DETR-OBB (upstream) | RT-DETR OBB | no disponible | DIOR-R | Apache-2.0 | PyTorch (.pth) |
| YOLOv8-OBB (Ultralytics) | CNN + cabeza OBB | configurable | configurable | AGPL-3.0 / comercial | PyTorch, ONNX, TFLite |
| Oriented R-CNN | Two-stage CNN | configurable | configurable | variable | PyTorch |

El valor diferencial frente al checkpoint upstream es la disponibilidad de formatos de despliegue (ONNX, TFLite, QNN) y la build cuantizada para HTP. Frente a YOLOv8-OBB, la licencia Apache-2.0 es mas permisiva para uso comercial que la AGPL de Ultralytics.

## Limitaciones y advertencias

- Modelo especializado en imagenes aereas de DIOR-R; el rendimiento fuera de ese dominio (imagenes naturales, escenas urbanas a nivel de suelo) no esta validado y probablemente sea deficiente.
- Solo 20 categorias; no cubre clases fuera del dataset DIOR-R.
- La build INT8 mixta es experimental y pierde ~1 punto de AP50 y ~1,5 de mAP50-95 respecto a la flotante.
- La build QNN esta validada unicamente para QCS8550 con HTP v73 y QAIRT 2.47; otros SoC o versiones de QAIRT pueden no ser compatibles.
- No se han publicado datos sobre sesgos del modelo ni sobre tasas de falsos positivos/negativos fuera de las metricas AP.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de detecciones espurias en imagenes fuera de distribucion.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias; verificar `NOTICE` y `LICENSE` para atribuciones del checkpoint upstream.
- El repositorio tiene muy pocas descargas (11) y 0 likes, lo que sugiere poca validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anan19990108/rtdetrv2-obb-s-diorr-htp
- Modelo base (upstream): https://huggingface.co/RicePasteM/RT-DETR-OBB
- Checkpoint upstream: https://huggingface.co/RicePasteM/RT-DETR-OBB/blob/f376e9dcedfb9a47a21ac71ef61ad99f8b545698/diorr/rtdetrv2_obb_hgnetv2_s_diorr.pth
- Resultados completos: https://huggingface.co/anan19990108/rtdetrv2-obb-s-diorr-htp/blob/5165a8b2274146034d750f76dc8339245cf30c3a/evaluation/results.json
- README detallado: https://huggingface.co/anan19990108/rtdetrv2-obb-s-diorr-htp/blob/5165a8b2274146034d750f76dc8339245cf30c3a/README.md
- Guia Linux HTP: https://huggingface.co/anan19990108/rtdetrv2-obb-s-diorr-htp/blob/5165a8b2274146034d750f76dc8339245cf30c3a/examples/LINUX.md

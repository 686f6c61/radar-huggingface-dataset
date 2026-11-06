# daros10/road-damage-yolov8s-quito-mobile

## Resumen

El modelo `daros10/road-damage-yolov8s-quito-mobile` es un detector de objetos YOLOv8s afinado para la deteccion de daños viales (grietas longitudinales, transversales, piel de cocodrilo y baches) a partir de fotografias capturadas con telefonos moviles en la ciudad de Quito. Lo desarrolla el usuario daros10 en el marco de un trabajo de fin de master (TFM) de la UIDE, y se publica unicamente como conjunto de exportes optimizados para inferencia en dispositivo (LiteRT/TFLite y ONNX), no como pesos entrenables.

El repositorio no contiene el modelo original en formato PyTorch (`.pt`), que permanece en un repositorio privado, sino cuatro artefactos de inferencia derivados del mismo: dos resoluciones de entrada (640 y 960 pixeles) en dos formatos (`.tflite` y `.onnx`). El modelo parte del checkpoint `SreekarAditya/yolo-rdd2022-benchmark`, un benchmark sobre el conjunto de datos RDD2022, y se afina con imagenes propias de Quito.

Su relevancia practica reside en el escenario de despliegue: inferencia local en el telefono sin conexion de red, dentro de la app RoadLens, limitada exclusivamente a la deteccion (la estimacion de severidad y prioridad se ejecuta en servidor). El tamaño del repositorio (0,2 GB) y los ficheros de unos 45 MB por exporte lo situan en el rango de modelos ligeros aptos para movil.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8s (Ultralytics), detector de una etapa tipo anchor-free con cabeza desacoplada |
| Parametros totales | no disponible (variante YOLOv8s; el autor no publica el recuento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no generativo) |
| Tipos de cuantizacion | FP32 en los exportes publicados; el autor no publica variantes INT8 ni FP16 |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | AGPL-3.0 (heredada de Ultralytics) y CC BY 4.0 del modelo base |
| Formato de pesos | `.tflite` (LiteRT, Ultralytics 8.4.202) y `.onnx` |
| Resoluciones de entrada | 640x640 y 960x960, RGB, NCHW, valores en [0, 1] |
| Salida | tensor `[1, 8, N]`: 4 coordenadas + 4 puntuaciones de clase; N = 8400 (640) o 18900 (960) |
| Clases | 4: `longitudinal_crack` (D00), `transverse_crack` (D10), `alligator_crack` (D20), `pothole` (D40) |
| NMS incluido | no; debe aplicarse en la app (conf 0,25, IoU 0,7) |
| Tamano del repositorio | 0,2 GB (unos 45 MB por fichero de exporte) |

## Arquitectura y entrenamiento

Se trata de un detector YOLOv8s, la variante "small" de la familia YOLOv8 de Ultralytics: una red convolutional de una sola etapa con cuello de agregacion de caracteristicas y cabeza desacoplada que predice simultaneamente cajas y puntuaciones por clase, sin anclas. El modelo se entreno a resolucion 960 y se exporto posteriormente a 640 y 960 para cubrir dos regimenes de coste en dispositivo.

El punto de partida es el checkpoint `SreekarAditya/yolo-rdd2022-benchmark`, entrenado sobre el benchmark RDD2022 de daños en carretera, que se afina con un conjunto de fotografias de Quito capturadas con movil. El autor no detalla el numero de imagenes de entrenamiento, la composicion exacta del dataset de afinado ni si se aplicaron tecnicas de aumento mas alla del pipeline estandar de Ultralytics. Tampoco se documenta el uso de RLHF/DPO (no aplicable a un detector) ni innovaciones de decodificacion; el unico elemento reseñable es la exportacion a LiteRT para ejecucion en el telefono.

La validacion se realizo sobre 172 fotos de Quito con el mismo modelo, y el test sobre 407 fotos a 960. El autor reporta que el exporte `.tflite` reproduce fielmente la salida de PyTorch sobre la misma entrada (diferencia maxima de 0,002 en coordenadas y 0,00002 en puntuaciones), lo que confirma la correccion del proceso de conversion.

## Capacidades

- Deteccion de cuatro clases de daño vial: grieta longitudinal (D00), grieta transversal (D10), grieta tipo piel de cocodrilo (D20) y bache (D40).
- Inferencia local en dispositivo movil mediante LiteRT/TFLite, sin necesidad de conexion de red.
- Exportacion ONNX para despliegue en servidor o en pipelines de escritorio con ONNX Runtime.
- Dos regimenes de resolucion (640 y 960) que permiten intercambiar precision por latencia.
- Salida cruda de cajas y puntuaciones por clase, apta para postprocesado propio (umbral y NMS configurables).
- No incluye medidas, severidad ni prioridad: esas funciones residen en el servidor de la aplicacion.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (no es un modelo generativo).

## Casos de uso

- Inspeccion vial asistida desde el movil: la app RoadLens captura una foto, redimensiona a 640 o 960 con letterbox gris 114, ejecuta `best_640.tflite` o `best_960.tflite` en el dispositivo y dibuja las detecciones; al no requerir red, funciona en campo sin cobertura.
- Inventario municipal de daños: procesado por lotes de fotografias georreferenciadas con el exporte ONNX en servidor para generar mapas de incidencias por clase (D00, D10, D20, D40) y priorizar reparaciones.
- Prefiltrado en pipelines de inspeccion con vehiculos: el modelo a 960 ofrece mayor recall (0,272 frente a 0,229 a 640) sobre el conjunto de validacion de Quito, lo que lo hace preferible cuando el coste de un falso negativo es alto.
- Prototipado academico y docencia: el repositorio sirve como referencia reproducible de un flujo Ultralytics completo (entrenamiento, exportacion TFLite/ONNX, contrato de entrada/salida documentado con SHA-256 de cada fichero).
- Integracion en aplicaciones de reporte ciudadano: el usuario fotografia un bache y el modelo, ejecutado en local, sugiere la clase; la severidad se calcula despues en servidor.
- Benchmark de referencia para daños viales en Ecuador: al partir de RDD2022 y afinarse con datos de Quito, permite comparar el rendimiento de un detector generico frente a uno localizado en el mismo test de 407 fotos.
- Despliegue en dispositivos de borde sin GPU: el formato LiteRT FP32 de unos 45 MB encaja en telefonos de gama media y en placas tipo Raspberry Pi con aceleracion opcional.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el conjunto de validacion de Quito (172 fotos, mismo modelo):

| Tamano | Precision | Recall | mAP50 | mAP50-95 | Inferencia en T4 |
|---|---|---|---|---|---|
| 640 | 0,474 | 0,229 | 0,280 | 0,133 | 7,4 ms |
| 960 | 0,347 | 0,272 | 0,276 | 0,113 | 11,7 ms |

Con el pipeline exacto de la app (entrada cuadrada 640, relleno gris 114, `best_640.tflite`, conf 0,001): mAP50 0,265 y mAP50-95 0,126.

En test (407 fotos, a 960) el modelo afinado mejora al base RDD2022: mAP50 de 0,196 a 0,268, con ΔF1 de 0,072 (intervalo [0,040; 0,104]). El resultado en test a 640 no se ha medido. No se han publicado resultados de benchmarks en la informacion disponible mas alla de los anteriores.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano de los exportes (unos 45 MB en FP32) y la arquitectura YOLOv8s, la huella es del orden de cientos de MB, apta para GPU de consumo.
- GPU recomendadas: el autor reporta latencias medidas en una NVIDIA T4 (7,4 ms a 640 y 11,7 ms a 960). Cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo; A100, H100, RTX 4090 y RTX 3060 son sobradas para este tamano.
- Cabe en GPU de consumo: si; tambien en telefonos moviles mediante LiteRT y en CPU con ONNX Runtime o TFLite.
- Opciones de despliegue: LiteRT/TFLite en Android/iOS, ONNX Runtime en servidor o escritorio, y el runtime de Ultralytics para validacion con PyTorch. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplican a un detector).
- Latencia y throughput: 7,4 ms por imagen a 640 y 11,7 ms a 960 en T4; no se publican cifras de throughput agregado ni latencias en movil.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mAP50 (Quito, val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `daros10/road-damage-yolov8s-quito-mobile` | no disponible (YOLOv8s) | 640 o 960 px | 0,280 (640) / 0,276 (960) | AGPL-3.0 + CC BY 4.0 | Exportes TFLite y ONNX publicos |
| `SreekarAditya/yolo-rdd2022-benchmark` (base) | no disponible (YOLOv8) | no disponible | no disponible en esta ficha; en test a 960 el afinado pasa de 0,196 a 0,268 | no disponible | Publico en Hugging Face |
| YOLOv8s estandar (Ultralytics, COCO) | no disponible | 640 px | no evaluado sobre Quito | AGPL-3.0 | Publico |
| YOLOv8n (Ultralytics, COCO) | no disponible | 640 px | no evaluado sobre Quito | AGPL-3.0 | Publico |

La comparacion directa con otros detectores de daños viales (por ejemplo, variantes de la familia YOLO entrenadas sobre RDD2022) no esta disponible en la informacion proporcionada; el unico punto de referencia cuantitativo es el modelo base, sobre el que el afinado mejora el mAP50 en test de 0,196 a 0,268.

## Limitaciones y advertencias

- Dominio muy restringido: una sola ciudad (Quito) y un unico tipo de captura (fotografia de movil); el rendimiento puede degradarse con camaras de trafico, drones o imagenes de otras ciudades.
- Clases debiles: las grietas transversales y longitudinales son las que peor se detectan, segun el propio autor.
- Las cifras de la tabla usan umbrales por clase calibrados en validacion; la app aplica un umbral global de 0,25, por lo que precision y recall reales diferiran de los reportados.
- No es un instrumento de medicion: el autor lo describe explicitamente como "una ayuda, no una medicion"; no estima severidad, profundidad ni prioridad.
- No incluye NMS: un integrador que olvide aplicarlo obtendra salidas duplicadas; ademas, las coordenadas vienen normalizadas en TFLite y en pixeles en ONNX, lo que exige un tratamiento distinto por formato.
- Riesgo de falsos negativos en daños pequenos o con poca luz, dado el recall moderado (0,229 a 640 y 0,272 a 960 en validacion).
- Licencia AGPL-3.0: el uso en un servicio en red puede obligar a liberar el codigo de la aplicacion que lo integra; conviene revisar el cumplimiento antes de un despliegue comercial. Ademas debe citarse el modelo base (CC BY 4.0).
- Los pesos entrenables (`.pt`) no son publicos, lo que impide reentrenar o auditar el proceso de afinado a partir del repositorio.
- El autor no documenta sesgos demograficos ni geograficos mas alla de la limitacion a Quito, ni el volumen y la composicion del conjunto de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/daros10/road-damage-yolov8s-quito-mobile
- Modelo base: https://huggingface.co/SreekarAditya/yolo-rdd2022-benchmark
- Ultralytics (framework y licencia AGPL-3.0): https://github.com/ultralytics/ultralytics
- LiteRT (antes TensorFlow Lite): https://ai.google.dev/edge/litert
- Conjunto de datos RDD2022 (referencia del benchmark): https://github.com/sekilab/RoadDamageDetector

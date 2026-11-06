# anan19990108/efficientdet-lite0-qcs8550-htp

## Resumen

EfficientDet-Lite0 320 es un detector de objetos ligero derivado de la variante oficial TFLite de TensorFlow (licencia Apache-2.0), empaquetado por el usuario anan19990108 para su ejecución sobre la unidad de procesamiento tensorial (HTP) del SoC Qualcomm QCS8550. El repositorio no entrena ni modifica el modelo original: redistribuye los pesos en tres formatos (TFLite, ONNX y un contexto nativo QNN QAIRT 2.47) y añade los artefactos necesarios (anclas, scripts de preprocesado y decodificación) para ejecutar la red en el acelerador de IA del chip.

El modelo resuelve detección de objetos sobre las 90 categorías de COCO con una entrada de 320x320 píxeles y una arquitectura EfficientDet-Lite0 (backbone EfficientNet-Lite0 con cabeza BiFPN y cabezas SSD). Su relevancia es práctica: demuestra y mide tres rutas de despliegue distintas (delegado QNN para TFLite, Execution Provider QNN de ONNX Runtime y contexto nativo QNN) sobre el mismo hardware, con latencias de red del orden de 3-5 ms p50 en el SoC.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y un tamaño de 0.0 GB declarado, aunque la model card detalla pesos de 4.56 MB (TFLite), 13.53 MB (ONNX) y 9.45 MB (contexto QNN). No incluye binarios de SDK ni datos de COCO, y el preprocesado, decodificación SSD y NMS se ejecutan en el host, no en la HTP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientDet-Lite0 (backbone EfficientNet-Lite0, BiFPN, cabezas SSD) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen 320x320) |
| Tipos de cuantizacion | TFLite con entrada uint8; ONNX y nativo QNN con entrada float32 normalizada; contexto QNN precompilado para QAIRT 2.47 |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | TFLite (`model.tflite`), ONNX (`model.onnx`), contexto QNN nativo (`model_qcs8550_qairt247.bin`), anclas (`anchors.bin`) |

## Arquitectura y entrenamiento

Se trata de un detector EfficientDet-Lite0 en su variante de 320x320, basado en el modelo oficial de TensorFlow publicado en Kaggle (EfficientDet Lite0 detection default). El autor declara haber descargado el fichero oficial de forma independiente y verificado su SHA-256, por lo que los pesos no han sido reentrenados ni ajustados: predicen las 90 categorías de COCO, no un conjunto de clases personalizado. La arquitectura combina un backbone EfficientNet-Lite0, una red de fusión de características BiFPN y cabezas de detección tipo SSD con 19.206 anclas.

El repositorio no aporta información sobre el dataset de entrenamiento original (número de tokens no aplica; composición de COCO train2017 es lo esperable pero no se explicita), ni sobre técnicas de ajuste fino, RLHF o destilación. La contribución técnica del autor es el empaquetado y la validación de tres rutas de ejecución sobre la HTP del QCS8550: el delegado QNN de TFLite (que exige delegación completa de 266/266 nodos en una única partición HTP), el Execution Provider QNN de ONNX Runtime 1.26 (con `session.disable_cpu_ep_fallback=1` y verificación de que ambas salidas pertenecen al EP) y un contexto nativo QNN generado con QAIRT 2.47. El preprocesado (resize con OpenCV `INTER_LINEAR` a 320x320, normalización `(uint8-127)/128`), la decodificación de cajas SSD y el NMS se ejecutan en el host, por lo que no es un detector íntegramente en HTP.

## Capacidades

- Detección de objetos en imágenes RGB con entrada de 320x320 píxeles, produciendo cajas en formato COCO `[x, y, width, height]` en píxeles de la imagen original.
- Clasificación sobre las 90 categorías de COCO, con `labels.json` que mapea los identificadores válidos a nombres en inglés.
- Salidas crudas de red: TFLite emite cajas `[1,19206,4]`, puntuaciones `[1,19206,90]` y anclas `[19206,4]`; ONNX y nativo emiten dos cabezas dinámicas que requieren `anchors.bin` para decodificar.
- Ejecución de la red completa en la HTP del QCS8550 en las tres rutas probadas (delegado QNN de TFLite, ONNX Runtime QNN EP y contexto nativo QNN).
- Postprocesado en host: decodificación SSD, NMS agnóstico de clase con IoU 0.5 y hasta 25 detecciones por imagen.
- No soporta tool calling, agentes, razonamiento multi-paso, visión generativa, audio ni capacidades multilingües; es exclusivamente un detector de objetos.

## Casos de uso

- Detección de objetos en tiempo real en dispositivos edge con QCS8550: la red se ejecuta en la HTP con latencias p50 de 3.1-4.6 ms según la ruta, lo que permite procesar vídeo a decenas de FPS si el preprocesado y el postprocesado en host no dominan el coste.
- Prototipado de pipelines de visión en Android arm64: los scripts de preparación de entrada (`prepare_efficientdet_input.py`) y decodificación (`decode_efficientdet_capture.py`) permiten validar la integración de un detector COCO antes de sustituirlo por un modelo propio.
- Comparación de runtimes de inferencia en hardware Qualcomm: el repositorio ofrece tres implementaciones del mismo grafo (TFLite+QNN, ORT+QNN EP, QNN nativo) con salidas verificadas byte a byte, útil para elegir stack en un producto.
- Sistemas de conteo y localización de objetos genéricos (personas, vehículos, animales) en aplicaciones de vigilancia o análisis de escenas, aprovechando las 90 clases de COCO.
- Filtrado previo en cámaras inteligentes o wearables: el modelo TFLite de 4.56 MB cabe en memoria flash reducida y puede ejecutarse con entrada uint8 sin normalización explícita.
- Base para destilación o ajuste fino: al ser un EfficientDet-Lite0 estándar con licencia Apache-2.0, puede servir como punto de partida para reentrenar sobre un conjunto de clases propio (el autor advierte que este paquete no predice su modelo de seis clases de movilidad).
- Validación de delegación completa en HTP: el chequeo estricto de 266/266 nodos en una partición sirve como test de integración para verificar que un delegado QNN no cae a CPU.

## Benchmarks y rendimiento

Calidad de detección (`bbox` AP / AP50 con `pycocotools`, COCO val2017, NMS agnóstico de clase con IoU 0.5 y hasta 25 detecciones):

| Runtime | Imagenes | AP / AP50 |
|---|---:|---:|
| TFLite CPU original de TensorFlow, NMS integrado | 5.000 | 0.260 / 0.421 |
| ONNX CPU publicado | 5.000 | 0.262 / 0.423 |
| TFLite CPU original, mismo subconjunto | 100 | 0.301 / 0.477 |
| TFLite CPU publicado (crudo) | 100 | 0.301 / 0.477 |
| ONNX CPU publicado | 100 | 0.306 / 0.468 |
| TFLite publicado + delegado QNN, HTP | 100 | 0.296 / 0.468 |
| ONNX Runtime + QNN EP, HTP | 100 | 0.308 / 0.472 |
| Contexto nativo QNN, HTP | 100 | 0.308 / 0.472 |

El subconjunto de 100 imágenes corresponde a los 100 identificadores de imagen COCO más bajos ordenados, y el autor advierte explícitamente que no es representativo ni un resultado oficial de val completo. ONNX QNN EP y el contexto nativo produjeron 200/200 ficheros de salida crudos idénticos byte a byte sobre ese subconjunto. La AP completa de 5.000 imágenes se midió en CPU sobre Windows; las tres filas HTP usan las mismas 100 imágenes en QCS8550.

Latencias de red en placa (exploratorias, solo red, sin pre/postprocesado):

| Runtime | p50 / p95 | Condiciones |
|---|---|---|
| Delegado QNN de TFLite | 3.387 / 11.504 ms | 100 imágenes, una llamada medida tras un warmup por inicialización de modelo |
| ONNX Runtime QNN EP (`Session.Run`) | 3.131 / 3.439 ms | 100 imágenes tras 10 warmups |
| QNN nativo (`QNN (execute) time`) | 4.645 / 8.694 ms | 10 eventos |

## Requisitos de hardware

- VRAM: no aplica; el modelo está pensado para el acelerador HTP de un SoC móvil, no para GPU de escritorio.
- Hardware objetivo: Qualcomm QCS8550 con QAIRT 2.47. El contexto nativo `model_qcs8550_qairt247.bin` es específico de ese SoC y esa versión de QAIRT; para otros dispositivos o versiones debe regenerarse con `conversion/dump_onnx_qnn_context.cpp`.
- GPU recomendadas: no disponible para el modelo empaquetado; la ejecución CPU de referencia se realizó en Windows con TFLite y ONNX Runtime.
- Cabe en GPU consumer: no aplica; el TFLite de 4.56 MB y el ONNX de 13.53 MB son adecuados para dispositivos móviles y SBC, no para cargas en GPU dedicada.
- Opciones de despliegue: TFLite con delegado QNN (requiere `libc++_shared.so` de Android arm64 NDK y el delegado QNN del fabricante, no incluido), ONNX Runtime 1.26 con QNN EP (compilado para Android arm64, con `LD_LIBRARY_PATH` y `ADSP_LIBRARY_PATH` configurados) y QNN nativo con `qnn-net-run`.
- Latencia y throughput: p50 de red de 3.1-4.6 ms en QCS8550 según ruta; el throughput efectivo depende del preprocesado (OpenCV en host), la decodificación SSD y el NMS, que no están medidos en la información disponible.
- Dependencias externas: binarios de Qualcomm/SDK, ONNX Runtime para Android y el delegado QNN de Sysclaw deben obtenerse por separado; no se incluyen en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EfficientDet-Lite0 320 QCS8550 HTP (este) | no disponible | 320x320 | no aplica | Apache-2.0 | Hugging Face, 3 formatos |
| EfficientDet-Lite0 TFLite oficial (TensorFlow) | no disponible | 320x320 | no aplica | Apache-2.0 | Kaggle Models |
| EfficientDet-Lite1/Lite2 TFLite oficial | no disponible | 320x320 / 448x448 | no aplica | Apache-2.0 | Kaggle Models |

La comparación con alternativas de la misma categoría (por ejemplo, SSD MobileNet o YOLO-nano) no está disponible en la información proporcionada; el autor solo referencia el modelo oficial de TensorFlow del que deriva. No se han publicado métricas comparativas frente a otros detectores en esta ficha.

## Limitaciones y advertencias

- El modelo predice las 90 categorías de COCO, no un conjunto de clases personalizado; el autor advierte que no es un modelo de seis clases de movilidad.
- No es un detector íntegramente en HTP: decodificación de imagen, resize, normalización, decodificación de cajas SSD y NMS se ejecutan en el host.
- El contexto nativo QNN está ligado a QCS8550 y QAIRT 2.47; no es portable a otros SoC ni versiones sin regenerarlo.
- Los binarios del SDK de Qualcomm, ONNX Runtime para Android y el delegado QNN de Sysclaw no se incluyen y deben obtenerse por separado; una inferencia correcta en host no garantiza un runtime HTP soportado en otro SoC o versión de QAIRT.
- Las métricas AP sobre 100 imágenes no son representativas ni oficiales; la AP completa de 5.000 imágenes se midió en CPU, no en HTP.
- Las latencias son exploratorias y solo cubren la red, no el pipeline completo.
- Riesgo de sesgo y alucinación: no documentado en la información disponible; como detector COCO hereda los sesgos del dataset original, pero el autor no los analiza.
- Licencia Apache-2.0 permite uso comercial, pero las dependencias de Qualcomm y de terceros pueden tener sus propias restricciones.
- El repositorio muestra 0 descargas y 0 likes, y un tamaño declarado de 0.0 GB pese a los pesos descritos; conviene verificar la integridad de los ficheros antes de usarlo en producción.
- No hay widget de inferencia alojado en Hugging Face para este runtime personalizado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/anan19990108/efficientdet-lite0-qcs8550-htp
- Modelo original EfficientDet-Lite0 TFLite de TensorFlow: https://www.kaggle.com/models/tensorflow/efficientdet/tfLite/lite0-detection-default/1

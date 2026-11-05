# anan19990108/efficientdet-lite1-qcs8550-htp

## Resumen

EfficientDet-Lite1 384 es un detector de objetos de la familia EfficientDet, desarrollado originalmente por Google Research y publicado como parte del ecosistema TensorFlow. Este repositorio concreto no contiene un modelo entrenado desde cero, sino una conversión y empaquetado del EfficientDet-Lite1 oficial de TensorFlow (variante TFLite, entrada 384x384) para su ejecución acelerada en el DSP Hexagon (HTP) del SoC Qualcomm QCS8550 mediante el runtime QNN. Lo publica el usuario anan19990108 bajo licencia Apache-2.0.

El problema que resuelve es la portabilidad de un detector COCO estándar a hardware edge de Qualcomm: proporciona pesos en tres formatos (TFLite, ONNX y un contexto QNN nativo compilado con QAIRT 2.47) junto con anclas fijas y scripts de evaluación reproducibles. La red se ejecuta íntegramente en el HTP (321 de 321 operadores, una única partición HTP, XNNPACK desactivado), mientras que el preprocesado de imagen, la decodificación de cajas SSD y la NMS corren en la CPU del host.

Es relevante para desarrolladores que despliegan visión por computador en dispositivos con QCS8550, ya que ofrece artefactos listos para tres rutas de ejecución (delegado QNN de TFLite, EP QNN de ONNX Runtime y QNN nativo) con métricas de precisión y latencia medidas sobre COCO val2017. El tamaño de los pesos es reducido (6,08 MB en TFLite, 17,85 MB en ONNX, 12,20 MB el contexto QNN) y la arquitectura es un detector EfficientDet-Lite con backbone EfficientNet-Lite, sin parámetros MoE ni ventana de contexto de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientDet-Lite1 (detector de objetos de una etapa, backbone EfficientNet-Lite) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada de imagen 384x384) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en TFLite, ONNX y contexto QNN; no se documentan variantes cuantizadas adicionales) |
| Idiomas soportados | no aplica (modelo de vision; etiquetas COCO en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | TFLite (`model.tflite`), ONNX (`model.onnx`), contexto QNN nativo (`model_qcs8550_qairt247.bin`), anclas fijas (`anchors.bin`) |

## Arquitectura y entrenamiento

El modelo es un EfficientDet-Lite1, un detector de objetos de una etapa que combina un backbone EfficientNet-Lite con un neck de feature pyramid y cabezas de clasificación y regresión de cajas ancladas (esquema SSD). La entrada es una imagen RGB de 384x384 píxeles. En la variante TFLite la entrada es uint8 NHWC `[1,384,384,3]`; en ONNX y QNN nativo la entrada es float32 NHWC normalizada como `(uint8 - 127) / 128`. Las salidas son cajas codificadas `[1,27621,4]`, puntuaciones `[1,27621,90]` y anclas `[27621,4]` (en ONNX y nativo las anclas se suministran aparte en `anchors.bin`).

No se ha entrenado ningún modelo nuevo: los pesos derivan del EfficientDet-Lite1 TFLite oficial de TensorFlow (Apache-2.0), verificado por SHA-256 antes de la conversión. El modelo es un detector COCO de 80 clases válidas (las puntuaciones tienen 90 canales, de los cuales 80 corresponden a categorías válidas). No se documentan en la información disponible detalles sobre el dataset de entrenamiento original, número de tokens (no aplica), ni técnicas de RLHF/DPO. La innovación técnica del repositorio es la conversión y validación del grafo para el HTP del QCS8550 con QAIRT 2.47, incluyendo la generación de un contexto QNN nativo y la verificación de delegación estricta (321/321 operadores en una partición HTP).

## Capacidades

- Detección de objetos en imágenes: 80 clases COCO (persona, vehículo, animales, utensilios, etc.).
- Salida de cajas delimitadoras en píxeles `[x,y,width,height]`, identificador de categoría COCO y puntuación de confianza.
- Ejecución acelerada en el HTP del SoC Qualcomm QCS8550 mediante tres rutas: delegado QNN de TFLite, EP QNN de ONNX Runtime 1.26 y QNN nativo (QAIRT 2.47).
- Inferencia en CPU con TFLite y ONNX Runtime para desarrollo y validación.
- Postprocesado incluido: decodificación de cajas SSD y NMS agnóstica de clase (IoU 0.5, máximo 25 detecciones).
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (no es un modelo de lenguaje).
- No incluye clases específicas de movilidad (scooter, andador, rollator); el autor lo indica explícitamente.

## Casos de uso

- Visión embebida en dispositivos con QCS8550: el modelo se ejecuta íntegramente en el HTP con latencias de red de 2,5-8 ms p50 según runtime, adecuado para detección en tiempo real en cámaras industriales o robots móviles.
- Detección de personas y objetos en sistemas de videovigilancia edge: al ser un detector COCO de 80 clases y 6,08 MB en TFLite, puede integrarse en firmware de cámaras IP con SoC Qualcomm sin depender de la nube.
- Automatización industrial y control de calidad: detección de objetos y componentes en líneas de producción usando la ruta QNN nativa con contexto precompilado para minimizar el arranque.
- Prototipado en CPU antes de desplegar en hardware: los scripts de ejemplo permiten validar detecciones con TFLite u ONNX Runtime en un portátil antes de pasar al dispositivo QCS8550.
- Robótica y AGV (vehículos guiados automáticos): detección de obstáculos y personas con NMS integrada y salida de cajas en píxeles, lista para alimentar módulos de planificación.
- Investigación en despliegue edge: el repositorio incluye evaluadores reproducibles (`evaluation.json`, `evaluation/`) y scripts de captura de salidas del HTP para comparar rutas de ejecución y cuantificar la degradación de precisión.
- Sistemas de accesibilidad o asistencia: detección de objetos cotidianos en tiempo real en dispositivos portátiles con SoC Qualcomm, aunque el autor advierte que no hay clases específicas de ayudas a la movilidad.

## Benchmarks y rendimiento

Métricas de precisión medidas por el autor sobre COCO val2017 (subconjunto de 100 imágenes con los IDs más bajos, sesgado; y conjunto completo de 5.000 para la referencia CPU):

| Runtime y conjunto | bbox AP | AP50 |
|---|---:|---:|
| TFLite CPU original, 5.000 imágenes | 0,302 | 0,471 |
| TFLite CPU original, 100 imágenes fijas | 0,351 | 0,537 |
| TFLite liberado + delegado QNN HTP, 100 imágenes | 0,347 | 0,539 |
| ONNX Runtime CPU, 100 imágenes | 0,357 | 0,546 |
| ONNX Runtime EP QNN HTP, 100 imágenes | 0,356 | 0,544 |
| QNN nativo (contexto HTP), 100 imágenes | 0,356 | 0,544 |

Latencia de red (solo red, sin preprocesado ni postprocesado) en QCS8550:

| Runtime | p50 (ms) | p95 (ms) | Condiciones |
|---|---:|---:|---|
| TFLite QNN, entrada fija, 100 ejecuciones | 4,904 | 15,764 | entrada fija |
| TFLite QNN, 100 imágenes reales | 2,562 | 6,315 | una llamada medida tras un warmup por inicialización |
| ONNX Runtime QNN EP `Session.Run`, 100 imágenes | 8,104 | 20,739 | tras 10 warmups |
| QNN nativo (evento de grafo QAIRT) | 7,872 | 13,897 | excluidas las 10 primeras de 100 llamadas |

El autor advierte que estas cifras usan límites de medición distintos y condiciones de dispositivo no intercaladas, por lo que no constituyen una comparación justa entre runtimes. No se midieron latencia extremo a extremo, arranque, memoria, consumo ni estabilidad térmica.

## Requisitos de hardware

- Despliegue objetivo: SoC Qualcomm QCS8550 con DSP Hexagon (HTP) y QAIRT 2.47. El contexto QNN está compilado específicamente para ese SoC y versión de SDK; para otro SoC o SDK debe regenerarse con `conversion/dump_onnx_qnn_context.cpp`.
- VRAM: no aplica (hardware edge sin GPU dedicada); no se documenta el uso de memoria del modelo en el dispositivo.
- GPU recomendadas: no aplica para el despliegue objetivo; para CPU de desarrollo basta con cualquier x86/ARM moderno con TFLite u ONNX Runtime.
- Cabe en GPU de consumo: no aplica; el modelo es de 6-18 MB y está pensado para ejecución en DSP/CPU, no en GPU.
- Opciones de despliegue: TFLite con delegado QNN (`benchmark_model` de LiteRT), ONNX Runtime 1.26 con EP QNN, y QNN nativo (`qnn-net-run` con `--retrieve_context`). Para CPU: TFLite y ONNX Runtime estándar.
- Latencias estimadas: ver tabla de benchmarks (p50 de red entre 2,562 y 8,104 ms según runtime).
- Dependencias de vendor (librerías QNN, QAIRT, NDK Android arm64) no se empaquetan en el repositorio y deben obtenerse por separado.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | AP COCO (referencia) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EfficientDet-Lite1 384 (este repo, QCS8550) | EfficientDet-Lite | 384x384 | 0,302 (5.000 imgs, CPU TFLite) | Apache-2.0 | Pesos TFLite/ONNX/QNN en HF |
| EfficientDet-Lite0 | EfficientDet-Lite | 320x320 | no disponible en la información | Apache-2.0 | TensorFlow Hub / Kaggle |
| EfficientDet-Lite2 | EfficientDet-Lite | 448x448 | no disponible en la información | Apache-2.0 | TensorFlow Hub / Kaggle |
| YOLOv8n | YOLO (una etapa) | 640x640 | no disponible en la información | AGPL-3.0 (Ultralytics) | Ultralytics |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; los datos de AP de este repositorio corresponden únicamente a las mediciones del autor sobre COCO val2017. EfficientDet-Lite0 y Lite2 son variantes de la misma familia con distinto compromiso tamaño/precisión, y YOLOv8n es una alternativa de detector de una etapa con licencia distinta (AGPL-3.0), lo que condiciona su uso comercial.

## Limitaciones y advertencias

- El modelo es un detector COCO genérico; no establece clases específicas de scooter de movilidad, andador ni rollator, como advierte el autor.
- El subconjunto de 100 imágenes usado para las métricas es un diagnóstico sesgado (los IDs más bajos de COCO val2017); el AP sobre el conjunto completo es 0,302, inferior al del subconjunto.
- Solo se valida el SoC QCS8550 con QAIRT 2.47; no se reclama validación en otros SoC Qualcomm. El contexto QNN debe recompilarse para otro hardware o SDK.
- La red se ejecuta en el HTP, pero el preprocesado, la decodificación SSD y la NMS corren en CPU: no es un detector extremo a extremo en HTP.
- No se midieron latencia extremo a extremo, arranque, memoria, consumo energético ni estabilidad térmica; los datos de latencia usan límites de medición no comparables entre runtimes.
- No hay widget de inferencia alojado en Hugging Face probado para este runtime personalizado.
- Las dependencias de vendor (QNN, QAIRT, ONNX Runtime Android, NDK) no se distribuyen en el repositorio.
- Riesgo de alucinación: no aplica en el sentido de modelos generativos, pero sí hay riesgo de falsos positivos y negativos propios de un detector con AP ~0,30.
- Sesgos: los heredados del dataset COCO (posible infrarrepresentación de ciertas categorías y contextos); no se documentan análisis de sesgo específicos.
- Licencia Apache-2.0 permite uso comercial, pero se debe conservar `LICENSE` y `NOTICE.md` con la atribución de modificaciones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/anan19990108/efficientdet-lite1-qcs8550-htp
- Modelo original EfficientDet-Lite1 TFLite (TensorFlow, Kaggle): https://www.kaggle.com/models/tensorflow/efficientdet/tfLite/lite1-detection-default/1
- Documentación de EfficientDet en TensorFlow Hub: no disponible en la información proporcionada
- Paper de EfficientDet: no disponible en la información proporcionada
- Documentación de QAIRT / QNN de Qualcomm: no disponible en la información proporcionada

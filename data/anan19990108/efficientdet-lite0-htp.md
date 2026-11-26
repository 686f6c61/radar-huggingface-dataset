# anan19990108/efficientdet-lite0-htp

## Resumen

EfficientDet-Lite0 320 es un modelo de deteccion de objetos derivado del checkpoint oficial `1.tflite` de TensorFlow (EfficientDet-Lite0), publicado por el usuario anan19990108 en Hugging Face. El modelo detecta las 80 categorias de COCO sobre imagenes de 320 × 320 pixeles y se distribuye empaquetado en tres formatos: ONNX (13,53 MB), TFLite (4,56 MB) y un contexto QNN nativo (9,45 MB) precompilado para el HTP v73 del SoC Qualcomm QCS8550 con QAIRT 2.47.

La relevancia de esta publicacion no esta en el modelo en si, sino en el trabajo de empaquetado y validacion para inferencia en aceleradores NPU/HTP de Qualcomm. El autor incluye mediciones reproducibles de AP sobre COCO val2017, latencias p50/p95 en Android y artefactos de despliegue listos para usar con el delegado QNN de TFLite y el Execution Provider QNN de ONNX Runtime.

Se trata de un modelo de vision de proposito especifico (deteccion de objetos), no de un modelo de lenguaje: no tiene parametros de contexto, no genera texto y no soporta tool calling. El preprocesado de imagen, la decodificacion de cajas y la NMS se ejecutan en el host, no en el grafo del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientDet-Lite0 (detector de objetos, backbone tipo EfficientNet-Lite con BiFPN y cabezas de clasificacion/regresion) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen 320 × 320) |
| Tipos de cuantizacion | el checkpoint TFLite distribuido esta cuantizado (formato TFLite); no se detallan los esquemas de cuantizacion en la informacion disponible |
| Idiomas soportados | no disponible (no aplica; modelo de vision) |
| Licencia | Apache-2.0 |
| Formato de pesos | TFLite (4,56 MB), ONNX (13,53 MB), contexto QNN nativo `context_qnn.bin` (9,45 MB) |

## Arquitectura y entrenamiento

EfficientDet-Lite0 es un detector de objetos de una etapa de la familia EfficientDet, disenado para dispositivos de borde. Combina un backbone EfficientNet-Lite con una red de fusion de caracteristicas bidireccional (BiFPN) y cabezas de clasificacion y regresion de cajas. El modelo opera sobre entradas de 320 × 320 pixeles y produce detecciones sobre las 80 clases de COCO.

Esta ficha no aporta informacion sobre el proceso de entrenamiento (numero de tokens o imagenes, composicion del dataset, tecnicas de aumento de datos o ajuste fino). El checkpoint de origen es `1.tflite` del modelo EfficientDet-Lite0 publicado por TensorFlow en Kaggle, revision `1`, bajo licencia Apache-2.0. El autor documenta el SHA-256 del checkpoint original y el metodo de verificacion en `evaluation/results.json`. La innovacion del repositorio es de despliegue: conversion a ONNX, generacion de un contexto QNN precompilado para HTP v73 y validacion comparativa de precision y latencia entre runtimes (CPU, QNN delegate de TFLite, QNN EP de ONNX Runtime y contexto QNN nativo). El preprocesado, la decodificacion de cajas y la NMS se ejecutan en el host.

## Capacidades

- Deteccion de objetos de las 80 categorias de COCO en imagenes de 320 × 320.
- Salida de IDs de categoria COCO, puntuaciones de confianza y cajas en formato `[x, y, width, height]` sobre la imagen original (el ejemplo en CPU imprime estos valores).
- Inferencia en CPU mediante TFLite y ONNX Runtime.
- Inferencia acelerada en NPU mediante el delegado QNN de TFLite y el Execution Provider QNN de ONNX Runtime sobre HTP v73 (QCS8550).
- Ejecucion con contexto QNN nativo precompilado (`context_qnn.bin`) para Android con QAIRT 2.47.
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente visual de deteccion.

## Casos de uso

- Deteccion de objetos en tiempo casi real en dispositivos Android con SoC QCS8550: el contexto QNN nativo ofrece latencias p50 de 3,131 ms y p95 de 3,439 ms con ONNX `Session.Run` tras 10 calentamientos, adecuado para pipelines de camara en directo.
- Vision artificial embebida de bajo consumo: el modelo TFLite de 4,56 MB cabe en memoria flash y RAM de dispositivos de borde, lo que permite desplegarlo en hardware con recursos limitados.
- Prototipado rapido en escritorio: el ONNX de 13,53 MB se ejecuta en ONNX Runtime CPU sin dependencias de NPU, util para validar pipelines de pre/postprocesado antes de pasar a hardware movil.
- Moderacion o filtrado de contenido visual en el dispositivo: la deteccion de clases COCO (personas, vehiculos, animales, objetos cotidianos) permite activar alertas locales sin enviar imagenes a la nube.
- Automatizacion industrial y logistica: conteo y localizacion de objetos en lineas de produccion o almacenes con camaras fijas, aprovechando la inferencia en NPU para reducir latencia y consumo.
- Investigacion en eficiencia de despliegue: el repositorio incluye mediciones comparativas entre runtimes (TFLite CPU, ONNX CPU, QNN delegate, QNN EP y contexto nativo) que sirven como referencia para evaluar el impacto del HTP en precision y latencia.
- Base para ajuste fino o destilacion en tareas de deteccion especificas: al estar bajo Apache-2.0 y en formato ONNX/TFLite, puede reutilizarse como punto de partida en pipelines de vision personalizados.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre COCO val2017:

| Runtime | Imagenes | AP / AP50 |
|---|---|---|
| TFLite CPU original de TensorFlow, NMS integrada | 5.000 | 0,260 / 0,421 |
| ONNX CPU publicado | 5.000 | 0,262 / 0,423 |
| TFLite publicado + delegado QNN, HTP | 100 | 0,296 / 0,468 |
| ONNX Runtime + QNN EP, HTP | 100 | 0,308 / 0,472 |
| Contexto QNN nativo publicado, HTP | 100 | 0,308 / 0,472 |

El subconjunto de 100 imagenes para HTP corresponde a los primeros 100 IDs de imagen de COCO val2017. La latencia de red en Android HTP fue de p50/p95 de 3,387 / 11,504 ms para `Invoke` de TFLite con un calentamiento por inicializacion, y de 3,131 / 3,439 ms para `Session.Run` de ONNX tras 10 calentamientos. La estimacion del log nativo es provisional segun el autor.

## Requisitos de hardware

- VRAM: no aplica; el modelo esta pensado para CPU y NPU en dispositivos de borde. El artefacto TFLite ocupa 4,56 MB y el ONNX 13,53 MB en disco.
- GPU recomendadas: no se documentan requisitos de GPU; el modelo no esta orientado a GPU de escritorio.
- Consumer GPU: no se proporcionan datos de compatibilidad ni rendimiento en GPUs de consumo (RTX 4090, etc.).
- NPU objetivo: Qualcomm QCS8550 con HTP v73 y QAIRT 2.47 para el contexto QNN nativo.
- Opciones de despliegue: TFLite (CPU y delegado QNN), ONNX Runtime (CPU y Execution Provider QNN), contexto QNN nativo en Android.
- Latencia: en HTP, p50 de 3,131 ms y p95 de 3,439 ms con ONNX `Session.Run`; p50 de 3,387 ms y p95 de 11,504 ms con TFLite `Invoke`. No se publican cifras de throughput ni latencias en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EfficientDet-Lite0 320 (este) | no disponible | 320 × 320 | no aplica | Apache-2.0 | Hugging Face (TFLite, ONNX, QNN) |
| EfficientDet-Lite0 original (TensorFlow/Kaggle) | no disponible | 320 × 320 | no aplica | Apache-2.0 | Kaggle Models |
| EfficientDet-Lite1/Lite2 (TensorFlow) | no disponible | 320 × 320 / 448 × 448 | no aplica | Apache-2.0 | Kaggle Models |

No se dispone de datos de benchmarks de los modelos alternativos en la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa de rendimiento entre ellos.

## Limitaciones y advertencias

- Modelo de vision de proposito especifico: no genera texto, no razona y no soporta agentes ni tool calling.
- Solo detecta las 80 clases de COCO; cualquier objeto fuera de ese vocabulario no sera reconocido.
- Resolucion de entrada fija de 320 × 320: objetos pequenos o muy lejanos pueden no detectarse con fiabilidad.
- El contexto QNN nativo esta compilado para un hardware concreto (QCS8550, HTP v73, QAIRT 2.47); no es portable a otros SoC o versiones de QAIRT sin recompilacion.
- Las metricas en HTP se calcularon sobre solo 100 imagenes de COCO val2017, frente a las 5.000 de las mediciones en CPU; la comparacion entre ambos conjuntos no es directamente equivalente.
- La estimacion de latencia a partir del log nativo es provisional segun el propio autor.
- No se documentan sesgos especificos ni tasas de alucinacion (no aplica al no ser generativo), pero los sesgos del dataset COCO y del checkpoint original de TensorFlow se heredan.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion; deben conservarse los avisos de LICENSE y NOTICE del repositorio.
- El repositorio tiene un tamano de 0,0 GB y muy pocas descargas (22) y likes (1); conviene verificar la integridad de los artefactos con `SHA256SUMS` antes de usarlos en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anan19990108/efficientdet-lite0-htp
- Checkpoint de origen (Kaggle, TensorFlow EfficientDet-Lite0): https://www.kaggle.com/models/tensorflow/efficientdet/TfLite/lite0-detection-default/1
- Resultados completos de evaluacion: https://huggingface.co/anan19990108/efficientdet-lite0-htp/blob/f4ed53c94ac624c774c173477d5d43efe21aedd3/evaluation/results.json
- Configuracion de entrada/salida y postprocesado: https://huggingface.co/anan19990108/efficientdet-lite0-htp/blob/f4ed53c94ac624c774c173477d5d43efe21aedd3/config.json
- Instrucciones de placa y comandos HTP: https://huggingface.co/anan19990108/efficientdet-lite0-htp/blob/f4ed53c94ac624c774c173477d5d43efe21aedd3/README.md#quick-start

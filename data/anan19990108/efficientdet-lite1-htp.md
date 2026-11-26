# anan19990108/efficientdet-lite1-htp

## Resumen

EfficientDet-Lite1-htp es un modelo de deteccion de objetos derivado del checkpoint oficial EfficientDet-Lite1 de TensorFlow, publicado por el usuario anan19990108 en Hugging Face. No se trata de un modelo de lenguaje ni de un transformer generativo: es un detector de objetos de la familia EfficientDet optimizado para inferencia en el borde (edge AI), concretamente para el acelerador Hexagon Tensor Processor (HTP) de Qualcomm en plataformas Android.

El repositorio empaqueta el mismo detector en tres formatos: ONNX (17,85 MB) para ONNX Runtime CPU, TFLite (6,08 MB) para CPU y un contexto QNN nativo (12,20 MB) compilado para el SoC QCS8550 con HTP v73 y QAIRT 2.47. Detecta las 80 categorias de COCO a una resolucion de entrada de 384 x 384, con el preprocesado de imagen, la decodificacion de cajas y la supresion no maxima (NMS) ejecutandose en el host.

Su relevancia es practica: demuestra el flujo completo de despliegue de un detector ligero en hardware Qualcomm con delegado QNN, incluyendo mediciones de latencia y precision en el dispositivo. El modelo no tiene capacidades de generacion de texto, razonamiento ni vision general; su unica tarea es la deteccion de objetos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientDet-Lite1 (detector de objetos, backbone tipo EfficientNet con BiFPN) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de imagen 384 x 384) |
| Tipos de cuantizacion | TFLite cuantizado (6,08 MB); ONNX (17,85 MB); contexto QNN compilado para HTP |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | Apache-2.0 |
| Formato de pesos | TFLite, ONNX, contexto QNN nativo (.bin) |

## Arquitectura y entrenamiento

El modelo es un EfficientDet-Lite1, variante ligera de la familia EfficientDet disenada para dispositivos con recursos limitados. Combina un backbone convolucional tipo EfficientNet con una red de piramide de caracteristicas bidireccional (BiFPN) y cabezas de prediccion de clases y cajas. La entrada es una imagen de 384 x 384 pixeles y la salida son cajas delimitadoras con puntuaciones para las 80 clases de COCO.

No se dispone de informacion sobre el proceso de entrenamiento en la documentacion proporcionada: no se detallan el numero de tokens (no aplica), la composicion del dataset mas alla de COCO, ni si hubo tecnicas de ajuste fino adicionales. El checkpoint de origen es `1.tflite` del modelo EfficientDet-Lite1 publicado por TensorFlow en Kaggle, revision 1, bajo licencia Apache-2.0. El autor del repositorio no ha reentrenado el modelo, sino que lo ha convertido y empaquetado para distintos runtimes, incluyendo la compilacion del contexto QNN para el HTP de Qualcomm.

## Capacidades

- Deteccion de objetos en imagenes para las 80 categorias del dataset COCO.
- Salida de cajas delimitadoras en formato `[x, y, width, height]` sobre la imagen original, junto con identificadores de categoria y puntuaciones de confianza.
- Inferencia en CPU mediante TFLite y ONNX Runtime.
- Inferencia acelerada en el Hexagon Tensor Processor (HTP) de Qualcomm mediante el delegado QNN, con contexto nativo compilado para QCS8550 (HTP v73, QAIRT 2.47).
- Preprocesado de imagen, decodificacion de cajas y NMS en el host (no dentro del grafo acelerado).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No dispone de modo thinking, vision general, audio ni generacion de texto.

## Casos de uso

- Deteccion de objetos en tiempo real en dispositivos Android con SoC Qualcomm: el contexto QNN permite ejecutar la inferencia en el HTP con latencias de milisegundos, adecuado para aplicaciones de camara o realidad aumentada en el borde.
- Vigilancia y analitica de video en el dispositivo: al procesar frames de 384 x 384 con latencia p50 de 2,562 ms (TFLite Invoke en HTP), puede integrarse en pipelines de video que requieran deteccion continua sin enviar datos a la nube.
- Sistemas de conteo y seguimiento de personas u objetos en entornos retail o industrial: el detector proporciona cajas y puntuaciones que alimentan un tracker posterior en el host.
- Automatizacion de inventario o control de calidad visual: deteccion de productos o componentes en imagenes capturadas por camaras fijas, con el modelo ejecutandose en un dispositivo empotrado.
- Prototipado rapido en CPU: el formato ONNX (17,85 MB) permite validar el detector en un portatil con ONNX Runtime CPU antes de desplegar en hardware Qualcomm.
- Aplicaciones de accesibilidad: descripcion de escenas basada en la deteccion de objetos, donde el detector alimenta un modulo de sintesis de voz o de descripcion en el propio dispositivo.
- Investigacion en eficiencia de modelos: el repositorio incluye mediciones de latencia y precision que sirven como referencia para comparar delegados QNN frente a CPU en tareas de deteccion.

## Benchmarks y rendimiento

| Runtime y conjunto de imagenes COCO val2017 | bbox AP | AP50 |
|---|---|---|
| TFLite CPU original, 5.000 imagenes | 0,302 | 0,471 |
| TFLite publicado + delegado QNN en HTP, 100 imagenes fijas | 0,347 | 0,539 |
| ONNX Runtime QNN EP en HTP, 100 imagenes fijas | 0,356 | 0,544 |
| Contexto QNN nativo en HTP, 100 imagenes fijas | 0,356 | 0,544 |

El subconjunto de 100 imagenes para HTP corresponde a los primeros 100 identificadores de imagen de COCO val2017. La latencia de red en HTP Android fue de p50/p95 de 2,562 / 6,315 ms para `Invoke` de TFLite con un calentamiento por inicializacion, y de 8,104 / 20,739 ms para `Session.Run` de ONNX tras 10 calentamientos. La estimacion del log nativo es provisional segun el autor.

## Requisitos de hardware

- VRAM estimada: no aplica; el modelo esta pensado para inferencia en CPU y en aceleradores integrados (HTP), no en GPU dedicada.
- GPU recomendadas: no aplica para el flujo documentado; el objetivo es el Hexagon Tensor Processor de Qualcomm (QCS8550, HTP v73) y CPU.
- Cabe en GPU de consumo: no es el caso de uso; el modelo TFLite ocupa 6,08 MB y el ONNX 17,85 MB, por lo que cabe en cualquier dispositivo con memoria minima.
- Opciones de despliegue: TFLite (CPU), ONNX Runtime (CPU y QNN EP), contexto QNN nativo para Android con QAIRT 2.47.
- Latencia y throughput: p50/p95 de 2,562 / 6,315 ms para TFLite Invoke en HTP y 8,104 / 20,739 ms para ONNX Session.Run en HTP, segun las mediciones del autor.

## Comparativa con modelos similares

| Modelo | Arquitectura | Entrada | Licencia | Contexto de despliegue |
|---|---|---|---|---|
| EfficientDet-Lite1-htp (este) | EfficientDet-Lite1 | 384 x 384 | Apache-2.0 | TFLite, ONNX, QNN HTP |
| EfficientDet-Lite0 | EfficientDet-Lite0 | 320 x 320 | Apache-2.0 | TFLite, edge |
| EfficientDet-Lite2 | EfficientDet-Lite2 | 448 x 448 | Apache-2.0 | TFLite, edge |
| YOLOv8n | YOLO (CNN) | 640 x 640 | AGPL-3.0 | ONNX, TFLite, edge |

No se dispone de datos de benchmarks comparativos directos entre estos modelos en la informacion proporcionada; la comparativa se limita a caracteristicas estructurales y de licencia.

## Limitaciones y advertencias

- Solo detecta las 80 clases de COCO; no reconoce categorias fuera de ese conjunto.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes.
- La precision en el subconjunto de 100 imagenes (AP 0,347-0,356) no es directamente comparable con la medicion sobre las 5.000 imagenes (AP 0,302); el autor lo indica explicitamente.
- El contexto QNN nativo esta compilado para un hardware concreto (QCS8550, HTP v73, QAIRT 2.47); no es portable a otros SoC o versiones de QAIRT sin recompilacion.
- El delegado QNN de TFLite requiere una version compatible; el autor indica que se necesita el delegado QNN correspondiente para HTP.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si puede producir detecciones falsas positivas o cajas imprecisas en escenas con oclusiones o clases poco representadas.
- Sesgos: no se documentan sesgos especificos, pero al entrenarse sobre COCO hereda los sesgos de composicion y anotacion de ese dataset.
- Licencia Apache-2.0 permite uso comercial, pero el modelo de origen y el NOTICE deben respetarse; el autor incluye archivos LICENSE y NOTICE.
- El repositorio tiene un tamano de 0,0 GB y solo 19 descargas, lo que sugiere poca validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/anan19990108/efficientdet-lite1-htp
- Checkpoint de origen EfficientDet-Lite1 (Kaggle, TensorFlow): https://www.kaggle.com/models/tensorflow/efficientdet/TfLite/lite1-detection-default/1
- Configuracion de entrada/salida y postprocesado: https://huggingface.co/anan19990108/efficientdet-lite1-htp/blob/main/config.json
- Mediciones completas: https://huggingface.co/anan19990108/efficientdet-lite1-htp/blob/main/evaluation/results.json
- Instrucciones de placa y comandos HTP: https://huggingface.co/anan19990108/efficientdet-lite1-htp/blob/main/README.md#quick-start
- Licencia: https://huggingface.co/anan19990108/efficientdet-lite1-htp/blob/main/LICENSE
- NOTICE: https://huggingface.co/anan19990108/efficientdet-lite1-htp/blob/main/NOTICE

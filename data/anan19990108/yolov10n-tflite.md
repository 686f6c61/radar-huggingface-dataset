# anan19990108/yolov10n-tflite

## Resumen

YOLOv10n TFLite es un conjunto de tres exportaciones cuantizadas en formato TFLite del modelo de detección de objetos YOLOv10n, la variante más pequena de la familia YOLOv10 desarrollada originalmente por el proyecto THU-MIG. El repositorio, publicado por el usuario anan19990108, no contiene pesos en formato PyTorch ni safetensors, sino tres ficheros `.tflite` de aproximadamente 2,95 MiB cada uno, pensados para inferencia en CPU y en dispositivos de borde mediante el runtime LiteRT (antes TensorFlow Lite).

El interés del artefacto reside en su reducido tamano y en la oferta de tres niveles de cuantizacion: una variante completamente entera con entrada y salida INT8 (504 tensores cuantizados), una variante con nucleo cuantizado pero fronteras FP32 (503 tensores) y una variante parcialmente cuantizada (77 tensores) que conserva la cabeza de salida en coma flotante. Todas comparten la misma interfaz de entrada `[1,640,640,3]` y salida `[1,300,6]`, lo que facilita el intercambio entre variantes sin reescribir el codigo de preprocesado y postprocesado.

La relevancia practica es la de un modelo de deteccion listo para desplegar en entornos sin GPU, con un peso inferior a 3 MiB. No obstante, la model card advierte de que no se han publicado metricas de precision ni latencias por dispositivo, y de que la licencia exacta de estos binarios concretos esta pendiente de verificar, mas alla de que el proyecto YOLOv10 original se distribuye bajo AGPL-3.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv10n (detector de objetos de una etapa, sin NMS) exportado a TFLite |
| Parametros totales | no disponible (el repo solo indica el tamano de los binarios) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | INT8 completa (entrada/salida INT8), nucleo INT8 con E/S FP32, cuantizacion parcial INT8 (77 tensores) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible para estos binarios; el proyecto YOLOv10 original usa AGPL-3.0 |
| Formato de pesos | TFLite (`.tflite`), tres variantes de aproximadamente 2,95-2,98 MiB |
| Entrada | `[1,640,640,3]`, RGB normalizado a [0,1] |
| Salida | `[1,300,6]` (caja + puntuacion + clase, segun convencion del export) |
| Runtime | LiteRT / TensorFlow Lite (`ai-edge-litert`) |
| Fecha de creacion | 2026-03-30 |
| Fecha de actualizacion | 2026-11-25 |

## Arquitectura y entrenamiento

YOLOv10 es una familia de detectores de objetos de una etapa que introduce el entrenamiento consistente dual (dual assignments) para eliminar la necesidad de supresion no maxima (NMS) en la inferencia. La variante "n" es la de menor capacidad de la familia, disenada para despliegue en tiempo real en hardware limitado. El repositorio no documenta ni el checkpoint exacto de partida ni el proceso de entrenamiento; unicamente indica que las exportaciones TFLite fueron preparadas por Andrew Chiao a partir del proyecto THU-MIG YOLOv10.

El proceso de conversion aplicado es una cuantizacion post-entrenamiento con calibracion representativa, que produce los tres grafos descritos. La variante completamente entera expone tensiones de entrada y salida INT8 con escala 1/255 y punto cero -128 en la entrada, y escala aproximada 0,310396 con punto cero -128 en la salida. Las otras dos variantes mantienen tensores en coma flotante en la cabeza de salida, incluida la operacion Top-K, por lo que no son enteramente enteras de extremo a extremo. No se documenta ninguna innovacion adicional de arquitectura mas alla de la propia de YOLOv10.

## Capacidades

- Deteccion de objetos en imagenes RGB de 640x640, con hasta 300 detecciones por imagen en la salida.
- Inferencia en CPU sin GPU mediante el runtime LiteRT, con un modelo de menos de 3 MiB.
- Tres modos de cuantizacion intercambiables para adaptarse a hardware con o sin soporte de operadores INT8.
- Ejecucion en dispositivos de borde y microcontroladores con recursos muy limitados, gracias al tamano reducido del binario.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un detector de objetos.
- No dispone de capacidades multilingues ni de procesamiento de lenguaje natural.
- No incorpora modo de razonamiento extendido, vision-lenguaje ni audio.

## Casos de uso

- Deteccion de objetos en tiempo real en dispositivos moviles: la variante INT8 completa permite ejecutar el detector en Android o iOS mediante LiteRT con un binario de menos de 3 MiB, sin necesidad de GPU.
- Vigilancia y videovigilancia en el borde: el modelo puede procesar fotogramas de camaras IP en un dispositivo empotrado (Raspberry Pi, Jetson Nano) y filtrar eventos localmente antes de enviarlos a la nube.
- Control de aforo y conteo de personas: integrado en un pipeline de captura periodica, el modelo detecta personas en imagenes de 640x640 y permite estimar ocupacion en espacios cerrados.
- Automatizacion industrial y control de calidad: deteccion de defectos o piezas en cadenas de montaje con hardware de bajo coste, donde el reducido tamano del modelo permite desplegarlo en PLCs o gateways industriales.
- Robots de bajo consumo y drones: la variante de nucleo cuantizado con E/S FP32 simplifica la integracion con frameworks de vision existentes que trabajan en coma flotante, manteniendo el coste computacional bajo.
- Prototipado rapido de pipelines de vision: las tres variantes permiten comparar el impacto de la cuantizacion en la precision y la latencia sin cambiar el codigo de preprocesado, ya que comparten la misma interfaz de entrada y salida.
- Sistemas de alerta en el borde con conectividad intermitente: el modelo puede ejecutarse de forma autonoma en el dispositivo y activar alertas locales, reduciendo la dependencia de la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la precision etiquetada y la latencia por dispositivo no estan reportadas, y que las tres exportaciones unicamente superaron una comprobacion de tensores en CPU con LiteRT.

## Requisitos de hardware

- VRAM estimada: no aplica en las variantes INT8, que estan disenadas para ejecucion en CPU. En caso de ejecutarse en GPU, el modelo ocupa menos de 3 MiB de memoria, por lo que cualquier GPU moderna es sobradamente suficiente.
- GPU recomendadas: no se especifican; el modelo esta optimizado para CPU. Cualquier GPU con soporte de LiteRT (por ejemplo, mediante delegados GPU) podria utilizarse, pero no hay datos de rendimiento publicados.
- Compatibilidad con GPU de consumo: si, cabe en cualquier GPU de consumo, aunque el caso de uso previsto es CPU y dispositivos de borde.
- Opciones de despliegue: LiteRT / TensorFlow Lite (`ai-edge-litert`), con posibilidad de usar delegados de CPU, GPU o NPU segun la plataforma. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. La model card no reporta mediciones por dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YOLOv10n TFLite (este repo) | no disponible | Imagen 640x640 | TFLite (INT8/FP32) | no disponible (proyecto original AGPL-3.0) | Hugging Face, 126 descargas |
| YOLOv10n original (THU-MIG) | no disponible en la informacion | Imagen 640x640 | PyTorch | AGPL-3.0 | GitHub THU-MIG |
| YOLOv8n | no disponible en la informacion | Imagen 640x640 | PyTorch, ONNX, TFLite | AGPL-3.0 | Ultralytics |
| YOLOv5n | no disponible en la informacion | Imagen 640x640 | PyTorch, ONNX, TFLite | GPL-3.0 | Ultralytics |

La comparacion se limita a la categoria de detectores de objetos de una etapa y baja capacidad. No se dispone de datos de precision ni de latencia para este repositorio, por lo que no es posible establecer una comparacion cuantitativa con las alternativas.

## Limitaciones y advertencias

- No se han publicado metricas de precision (mAP) ni de latencia, por lo que no es posible evaluar el impacto real de la cuantizacion en la calidad de deteccion.
- La model card advierte de que las convenciones de coordenadas de las cajas y de los identificadores de clase deben confirmarse contra la exportacion original; el ejemplo de la model card solo comprueba la forma del tensor de salida.
- La licencia exacta de estos binarios concretos esta pendiente de verificar. El proyecto YOLOv10 original usa AGPL-3.0, lo que impone obligaciones de copyleft en caso de uso comercial o distribucion.
- El modelo es exclusivamente de vision; no procesa texto ni tiene capacidades de razonamiento, agentes o tool calling.
- La variante completamente entera expone tensiones INT8 en la entrada y la salida, lo que exige un preprocesado y postprocesado manual de la cuantizacion; las otras dos variantes mantienen la cabeza de salida en coma flotante y no son enteramente enteras.
- No se documenta el checkpoint de partida ni el conjunto de calibracion, lo que dificulta reproducir la conversion o auditar el proceso.
- El repositorio tiene un tamano de 0.0 GB y un unico like, lo que sugiere un artefacto de caracter experimental sin validacion comunitaria extensa.
- Riesgo de sesgos y alucinaciones: al ser un detector de objetos, no genera texto, pero puede producir falsos positivos o falsos negativos en funcion del dominio de las imagenes, especialmente tras la cuantizacion INT8.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/anan19990108/yolov10n-tflite
- Variante INT8 entrada/salida: https://huggingface.co/anan19990108/yolov10n-tflite/resolve/main/yolov10n_full_integer_quant.tflite
- Variante nucleo cuantizado, E/S FP32: https://huggingface.co/anan19990108/yolov10n-tflite/resolve/main/yolov10n_integer_quant.tflite
- Variante parcialmente cuantizada, E/S FP32: https://huggingface.co/anan19990108/yolov10n-tflite/resolve/main/yolov10n_int8.tflite
- Checksums SHA-256: https://huggingface.co/anan19990108/yolov10n-tflite/blob/main/SHA256SUMS
- Proyecto YOLOv10 original (THU-MIG): https://github.com/THU-MIG/yolov10

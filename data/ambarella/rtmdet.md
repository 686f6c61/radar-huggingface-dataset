# Ambarella/RTMDet

## Resumen

RTMDet es un detector de objetos en tiempo real desarrollado originalmente por OpenMMLab y presentado en el articulo "RTMDet: An Empirical Study of Designing Real-Time Object Detectors" (arXiv:2212.07784). Esta ficha concreta corresponde a la publicacion de Ambarella en Hugging Face, que distribuye la variante RTMDet-Nano entrenada especificamente para deteccion de personas, pensada para encadenarse con RTMPose en un pipeline de dos etapas para estimacion de pose humana en tiempo real. No es un modelo de lenguaje: es un modelo de vision por computador para deteccion de objetos.

El modelo emplea una arquitectura de detector de una etapa con convoluciones depth-wise de kernel grande y asignacion dinamica de etiquetas con soft labels, disenada para maximizar la relacion precision/latencia en hardware de borde. La variante publicada trabaja a resolucion de entrada 3x320x320 y se ha entrenado sobre el dataset COCO para la clase persona.

La relevancia de esta publicacion radica en que Ambarella distribuye pesos compilados y optimizados para sus SoCs de vision (N1-655, X7, CV7, CV72, CV75) con activaciones en fp16, lo que permite desplegar deteccion de personas en dispositivos de bajo consumo. El repositorio tiene un tamano de 0.0 GB y un numero muy reducido de descargas (19) y likes (1), lo que sugiere un uso interno o de nicho vinculado al ecosistema Cooper SDK de Ambarella mas que a la comunidad general de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RTMDet (detector de objetos de una etapa, CNN con convoluciones depth-wise de kernel grande) |
| Parametros totales | no disponible (variante Nano; el numero exacto no se indica en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; resolucion de entrada 3x320x320) |
| Tipos de cuantizacion | pesos compilados con activaciones fp16 (Activation_fp16) para SoCs Ambarella |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | no disponible |
| Formato de pesos | .bin especificos por dispositivo (N1-655, X7, CV7, CV72, CV75); pesos originales .pth de MMDetection/MMPose |

## Arquitectura y entrenamiento

RTMDet es un detector de objetos de una etapa basado en CNN que introduce convoluciones depth-wise de kernel grande en el backbone y en el neck, lo que aumenta el campo receptivo efectivo sin disparar el coste computacional. La asignacion de etiquetas es dinamica y utiliza soft labels, una innovacion que mejora la estabilidad del entrenamiento y la precision respecto a asignaciones hard. La arquitectura es extensible a segmentacion de instancias y deteccion de objetos rotados, aunque esta publicacion concreta solo cubre deteccion.

La variante publicada es RTMDet-Nano entrenada para la clase persona sobre COCO, con resolucion de entrada 3x320x320. Los pesos originales referenciados son `rtmdet_nano_8xb32-100e_coco-obj365-person-05d8511e.pth`, alojados en download.openmmlab.com. No se proporciona en la informacion disponible el numero de tokens (no aplica), la composicion exacta del dataset mas alla de COCO, ni si hubo etapas de refinamiento adicionales. Los artefactos distribuidos por Ambarella son binarios compilados para sus SoCs con activaciones fp16, compatibles con Cooper SDK 2.5.4 y Cooper Foundry 2.3.

## Capacidades

- Deteccion de personas en imagenes a resolucion 320x320 en tiempo real.
- Integracion en pipeline de dos etapas con RTMPose para estimacion de keypoints humanos: RTMDet localiza personas y RTMPose estima la pose de cada una.
- Ejecucion optimizada en hardware de borde Ambarella (N1-655, X7, CV7, CV72, CV75).
- Inferencia con activaciones fp16 en los SoCs soportados.
- No soporta generacion de texto, razonamiento, codigo ni matematicas (no es un modelo de lenguaje).
- No se documenta soporte de tool calling, function calling ni comportamiento agentico.
- No se documenta soporte multilingue (no aplica).
- Capacidades adicionales (segmentacion, deteccion rotada) estan disponibles en la arquitectura RTMDet general, pero no se confirman para esta variante concreta.

## Casos de uso

- Estimacion de pose humana en tiempo real: el modelo se usa como primera etapa de un pipeline con RTMPose; detecta las personas en el frame y pasa los recortes al estimador de keypoints. Es adecuado por su baja latencia a 320x320 y su integracion ya validada con RTMPose.
- Videovigilancia en dispositivos de borde: despliegue en camaras IP o NVRs con SoC Ambarella CV72/CV75 para detectar presencia de personas sin enviar video a la nube, reduciendo ancho de banda y preservando privacidad.
- Analitica de aforo y conteo de personas: conteo de transeuntes en comercios o espacios publicos usando los binarios optimizados para X7 o CV7, con inferencia local a fp16.
- Control de acceso y deteccion de presencia: activacion de sistemas de iluminacion, puertas automaticas o alarmas cuando se detecta una persona en el campo de vision.
- Robots y AGVs: deteccion de personas como paso previo a la estimacion de pose para navegacion social o parada de seguridad en entornos colaborativos.
- Aplicaciones de fitness y rehabilitacion: captura de movimiento en dispositivos empotrados usando el pipeline RTMDet + RTMPose para analizar la postura del usuario en tiempo real.
- Prototipado con MMDetection: uso de los pesos originales en PyTorch/MMDetection para validar el modelo en GPU antes de compilar y desplegar en hardware Ambarella.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo es de muy baja complejidad (variante Nano a 320x320) y en GPU convencional cabria en cualquier tarjeta con unos pocos cientos de MB, pero no se proporcionan cifras oficiales.
- GPU recomendadas: no se especifican. Para la variante PyTorch original de MMDetection es suficiente una GPU consumer moderna; para produccion, el destino son los SoCs Ambarella N1-655, X7, CV7, CV72 y CV75.
- Cabe en GPU consumer: si, en el caso de los pesos originales de MMDetection, aunque no se documenta el modelo exacto minimo.
- Opciones de despliegue: MMDetection (framework original), Cooper SDK 2.5.4 y Cooper Foundry 2.3 para los binarios compilados de Ambarella. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplica a vision).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento en la informacion proporcionada para establecer una comparativa cuantitativa. A continuacion se comparan caracteristicas estructurales con alternativas de la misma categoria (detectores de objetos en tiempo real):

| Modelo | Parametros | Resolucion tipica | Contexto / tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RTMDet-Nano (esta ficha) | no disponible | 320x320 | Deteccion de personas | no disponible | Hugging Face (Ambarella) |
| YOLOv8n (Ultralytics) | no disponible en esta fuente | 640x640 | Deteccion general | AGPL-3.0 / comercial | Hugging Face, GitHub |
| YOLOv5n (Ultralytics) | no disponible en esta fuente | 640x640 | Deteccion general | GPL-3.0 / comercial | GitHub |
| YOLOX-Nano (Megvii) | no disponible en esta fuente | 416x416 | Deteccion general | Apache 2.0 | GitHub |

La comparativa cuantitativa de precision (mAP) y latencia entre estos modelos no se incluye porque no se han proporcionado resultados de benchmarks en la informacion disponible.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en la clase persona; no detecta otras categorias de objetos en esta variante.
- Resolucion de entrada fija de 320x320, lo que limita la deteccion de personas muy pequenas o lejanas en la imagen.
- Sesgos conocidos: al entrenarse sobre COCO, hereda los sesgos de representacion y anotacion de dicho dataset (posibles diferencias de rendimiento segun contexto, iluminacion, oclusion o demografia).
- Riesgo de falsos positivos y falsos negativos en escenas con oclusiones severas, condiciones de baja luminosidad o personas parcialmente visibles.
- La licencia no esta indicada en la informacion disponible; es imprescindible verificarla antes de cualquier uso comercial, ya que los pesos originales de OpenMMLab y el dataset COCO tienen sus propias condiciones.
- Los binarios distribuidos estan compilados para SoCs Ambarella concretos; no son portables a otro hardware sin recompilacion mediante Cooper SDK.
- El repositorio tiene un tamano de 0.0 GB y muy pocas descargas, lo que sugiere que los artefactos pueden no estar completos o que el uso previsto es interno; conviene validar la integridad de los archivos antes de desplegar.
- No apto para tareas de lenguaje, razonamiento o generacion de texto.

## Enlaces

- Hugging Face: https://huggingface.co/Ambarella/RTMDet
- Paper RTMDet: https://arxiv.org/abs/2212.07784
- Configuraciones oficiales MMDetection: https://github.com/open-mmlab/mmdetection/tree/main/configs/rtmdet
- Pesos originales RTMDet-Nano persona (COCO): https://download.openmmlab.com/mmpose/v1/projects/rtmpose/rtmdet_nano_8xb32-100e_coco-obj365-person-05d8511e.pth
- Dataset COCO: https://cocodataset.org/#home
- RTMPose (modelo complementario): https://huggingface.co/Ambarella/RTMPose
- Binario N1-655: https://huggingface.co/Ambarella/RTMDet/blob/main/n1-655_rtmdet_nano_act16.bin
- Binario X7: https://huggingface.co/Ambarella/RTMDet/blob/main/x7_rtmdet_nano_act16.bin
- Binario CV7: https://huggingface.co/Ambarella/RTMDet/blob/main/cv7_rtmdet_nano_act16.bin
- Binario CV72: https://huggingface.co/Ambarella/RTMDet/blob/main/cv72_rtmdet_nano_act16.bin
- Binario CV75: https://huggingface.co/Ambarella/RTMDet/blob/main/cv75_rtmdet_nano_act16.bin

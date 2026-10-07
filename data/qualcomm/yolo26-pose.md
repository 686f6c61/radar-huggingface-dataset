# qualcomm/YOLO26-Pose

## Resumen

YOLO26-Pose es un modelo de estimacion de pose humana publicado por Qualcomm en HuggingFace dentro del ecosistema Qualcomm AI Hub Models. Se trata de una adaptacion y exportacion optimizada del modelo Ultralytics YOLO26-Pose, orientada a ejecutarse en la NPU (Hexagon) de los chipsets Snapdragon y Dragonwing mediante los runtimes ONNX y QNN_DLC. El modelo predice keypoints del cuerpo humano y cajas delimitadoras (bounding boxes) sobre imagenes de 640x640.

A diferencia de los modelos de lenguaje, no es un transformer generativo ni un LLM: es una red convolucional de una sola etapa con cabeza de pose estimacion, con 2,97 millones de parametros y un tamano en coma flotante de 11,4 MB. Su relevancia radica en que permite inferencia en tiempo real en dispositivos moviles y de borde sin conexion a la nube, con latencias de entre 2,4 ms y 3,8 ms en los SoC Snapdragon de ultima generacion usando precision w8a16 o float.

El repositorio no distribuye pesos pre-exportados por restricciones de licencia: el usuario debe compilar y exportar el modelo con la libreria Qualcomm AI Hub Models, aportando sus propios pesos o configuraciones. La licencia del modelo es AGPL-3.0, heredada del proyecto Ultralytics, lo que condiciona su uso en productos comerciales cerrados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26-Pose (red convolucional de una sola etapa con cabeza de estimacion de pose, familia Ultralytics YOLO26) |
| Parametros totales | 2,97 M (checkpoint YOLO26-N-Pose) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de vision; entrada de imagen fija de 640x640) |
| Tipos de cuantizacion | Float (segun runtime) y w8a16 (pesos 8 bits, activaciones 16 bits) |
| Idiomas soportados | No aplica (no procesa lenguaje natural) |
| Licencia | AGPL-3.0 |
| Formato de pesos | ONNX y QNN_DLC; los pesos pre-exportados no se distribuyen en el repositorio |
| Tarea | Keypoint detection (pipeline: keypoint-detection) |
| Resolucion de entrada | 640x640 |
| Tamano del modelo (float) | 11,4 MB |
| Unidad de computo primaria | NPU |
| Runtime soportado | ONNX, QNN_DLC |
| Libreria | PyTorch (library_name: pytorch) |
| Plataformas objetivo | Android y dispositivos con Snapdragon / Dragonwing |

## Arquitectura y entrenamiento

La arquitectura es la implementacion YOLO26-Pose de Ultralytics, disponible en el repositorio oficial del proyecto (ruta `ultralytics/models/yolo/pose`). Es un detector convolucional de una sola etapa que anade una cabeza de regresion de keypoints sobre la salida de deteccion, de modo que produce simultaneamente cajas delimitadoras y coordenadas de keypoints del cuerpo humano. El checkpoint concreto exportado en este repositorio es la variante nano (YOLO26-N-Pose), con 2,97 M de parametros.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens o imagenes utilizadas, la composicion de los datos ni si se aplicaron tecnicas de ajuste como RLHF o DPO (no aplicables a un modelo de vision de este tipo). Tampoco se documentan innovaciones tecnicas internas mas alla de la propia arquitectura YOLO26. Lo que si se detalla es la cadena de optimizacion: los artefactos se compilan, perfilan y evaluan con Qualcomm AI Hub Workbench, y se exportan a formatos ONNX y QNN_DLC (QNN de Qualcomm AI Engine Direct) para ejecucion en NPU.

Un punto relevante es que, por restricciones de licencia, el repositorio no incluye los assets pre-exportados. El flujo previsto es usar la libreria Qualcomm AI Hub Models (version v0.64.0 en la ruta documentada) para compilar y exportar el modelo con pesos propios, formas de entrada personalizadas y configuraciones de dispositivo y runtime especificas.

## Capacidades

- Estimacion de pose humana: predice keypoints del cuerpo y cajas delimitadoras en una imagen. El numero concreto de keypoints no se especifica en la model card.
- Deteccion en tiempo real: latencias medidas de 2,4 a 15,1 ms segun chipset y precision, lo que habilita aplicaciones interactivas en dispositivo.
- Ejecucion en NPU: el modelo esta optimizado para el acelerador neuronal de Qualcomm, no para CPU generica.
- Soporte de dos precisiones: float y w8a16, con ganancias de latencia y de memoria pico en la variante cuantizada.
- Soporte de entrada personalizada: la libreria de exportacion permite definir formas de entrada distintas de 640x640.
- Soporte de pesos propios: se pueden exportar checkpoints afinados por el usuario.
- No soporta tool calling ni function calling: no es un modelo de lenguaje.
- No soporta agentes ni razonamiento multi-paso: no aplica a esta arquitectura.
- No tiene capacidades multilingues: no procesa texto.
- No se documentan capacidades de vision adicionales (segmentacion, profundidad, audio) ni modo de razonamiento explicito.

## Casos de uso

- Analisis de forma en aplicaciones de fitness y yoga: el modelo estima keypoints sobre fotogramas de camara en el movil y permite calcular angulos articulares en tiempo real a mas de 250 FPS en Snapdragon 8 Elite Gen 5, sin enviar video a la nube.
- Tele-rehabilitacion: seguimiento de ejercicios domiciliarios con retroalimentacion inmediata; los 11,4 MB de pesos permiten ejecutar el modelo integramente en el dispositivo, lo que simplifica el cumplimiento de normativa de privacidad de datos de salud.
- Captura de movimiento para animacion y VFX: extraccion de esqueletos 2D a partir de video grabado o en directo, con latencias por debajo de 10 ms que evitan desincronizacion perceptible en previsualizacion.
- Analisis deportivo: medicion de postura y tecnica en atletismo, ciclismo o levantamiento de peso mediante camaras de bajo coste conectadas a un dispositivo Android con Snapdragon.
- Ergonomia y seguridad laboral: monitorizacion de posturas en puestos de trabajo o deteccion de caidas en entornos industriales, usando los chipsets Dragonwing (QCS8550, IQ-8275, IQ-9075) con latencias de 5,6 a 10,1 ms.
- Robotica y teleoperacion: estimacion de pose humana como senal de control para brazos roboticos o avatares, con la NPU liberando la CPU para el resto del pipeline de control.
- Realidad aumentada y videojuegos: superposicion de elementos virtuales sobre el cuerpo del usuario en aplicaciones moviles o gafas con Snapdragon X Elite / X2 Elite, donde la inferencia se mantiene entre 2,6 y 3,4 ms.
- Analitica de aforo y comportamiento en retail o espacios publicos: deteccion de personas y posturas sin identificacion biometrica, ejecutada en dispositivos de borde tipo SA8775P, SA8650P o SA8255P.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precision (por ejemplo, AP o mAP de keypoints) en la informacion disponible. La model card unicamente proporciona medidas de latencia y de memoria pico por chipset, con la NPU como unidad de computo primaria en todos los casos.

| Runtime | Precision | Chipset | Tiempo de inferencia (ms) | Rango de memoria pico (MB) |
|---|---|---|---|---|
| ONNX | float | Snapdragon 8 Elite Gen 5 For Galaxy Mobile | 3,840 | 6 - 181 |
| ONNX | float | Snapdragon 8 Elite For Galaxy Mobile | 4,033 | 5 - 174 |
| ONNX | float | Snapdragon X2 Elite | 3,882 | 9 - 9 |
| ONNX | float | Snapdragon X Elite | 9,037 | 9 - 9 |
| ONNX | float | Snapdragon 8 Gen 3 Mobile | 6,147 | 8 - 212 |
| ONNX | float | Snapdragon 8 Gen 1 Mobile | 15,143 | 9 - 226 |
| ONNX | float | Dragonwing IQ-8275 | 9,438 | 6 - 10 |
| ONNX | float | Dragonwing QCS8550 (Proxy) | 8,693 | 2 - 13 |
| ONNX | float | QCS8450 | 15,143 | 9 - 226 |
| ONNX | float | Dragonwing IQ-9075 | 10,083 | 6 - 10 |
| ONNX | float | Dragonwing IQ-X7181 | 9,037 | 9 - 9 |
| ONNX | float | Dragonwing Q-8750 | 4,033 | 5 - 174 |
| ONNX | w8a16 | Snapdragon 8 Elite Gen 5 For Galaxy Mobile | 2,437 | 1 - 96 |
| ONNX | w8a16 | Snapdragon 8 Elite For Galaxy Mobile | 2,789 | 0 - 94 |
| ONNX | w8a16 | Snapdragon X2 Elite | 2,608 | 4 - 4 |
| ONNX | w8a16 | Snapdragon X Elite | 6,427 | 2 - 2 |
| ONNX | w8a16 | Snapdragon 8 Gen 3 Mobile | 3,846 | 0 - 228 |
| ONNX | w8a16 | Snapdragon 8 Gen 1 Mobile | 7,756 | 4 - 230 |
| ONNX | w8a16 | QCS6490 | 21,885 | 3 - 7 |
| ONNX | w8a16 | Dragonwing IQ-8275 | 5,631 | 3 - 7 |
| ONNX | w8a16 | Dragonwing QCS8550 (Proxy) | 6,031 | 3 - 8 |
| ONNX | w8a16 | QCS8450 | 7,756 | 4 - 230 |
| ONNX | w8a16 | Dragonwing IQ-9075 | 6,797 | 3 - 7 |
| ONNX | w8a16 | Dragonwing IQ-X7181 | 6,427 | 2 - 2 |
| ONNX | w8a16 | Dragonwing Q-6690 | 29,576 | 4 - 202 |
| ONNX | w8a16 | Dragonwing Q-7790 | 7,969 | 4 - 208 |
| ONNX | w8a16 | Dragonwing Q-8750 | 2,789 | 0 - 94 |
| ONNX | w8a16 | Snapdragon 7 Gen 4 Mobile | 7,969 | 4 - 208 |
| QNN_DLC | float | Snapdragon 8 Elite Gen 5 For Galaxy Mobile | 2,577 | 5 - 179 |
| QNN_DLC | float | Snapdragon 8 Elite For Galaxy Mobile | 3,144 | 5 - 162 |
| QNN_DLC | float | Snapdragon X2 Elite | 3,358 | 5 - 5 |
| QNN_DLC | float | Snapdragon X Elite | 6,214 | 5 - 5 |
| QNN_DLC | float | Snapdragon 8 Gen 3 Mobile | 4,089 | 5 - 190 |
| QNN_DLC | float | Snapdragon 8 Gen 1 Mobile | 10,080 | 4 - 207 |
| QNN_DLC | float | Dragonwing IQ-8275 | 6,764 | 5 - 14 |
| QNN_DLC | float | Dragonwing QCS8550 (Proxy) | 5,696 | 5 - 6 |
| QNN_DLC | float | SA8775P | 7,220 | 0 - 163 |
| QNN_DLC | float | SA8650P | 7,220 | 0 - 163 |
| QNN_DLC | float | SA8255P | 7,220 | 0 - 163 |
| QNN_DLC | float | QCS8450 | 10,080 | 4 - 207 |
| QNN_DLC | float | Dragonwing IQ-9075 | 7,016 | 5 - 13 |
| QNN_DLC | float | Dragonwing IQ-X7181 | 6,214 | 5 - 5 |
| QNN_DLC | float | Dragonwing Q-8750 | 3,144 | 5 - 162 |

Throughput teorico derivado del inverso del tiempo de inferencia (sin solapamiento de peticiones): 410 FPS con ONNX w8a16 en Snapdragon 8 Elite Gen 5 For Galaxy Mobile, 256 FPS con ONNX w8a16 en Snapdragon 8 Gen 3 Mobile, 163 FPS con ONNX float en Snapdragon 8 Gen 3 Mobile y 34 FPS en el caso mas lento documentado (Dragonwing Q-6690 con w8a16).

## Requisitos de hardware

- VRAM estimada: no disponible. El modelo pesa 11,4 MB en float y menos aun en w8a16, por lo que su huella de memoria es marginal frente a cualquier GPU moderna; la memoria pico reportada en NPU oscila entre 0 y 230 MB segun chipset y runtime.
- Hardware objetivo principal: NPU de Qualcomm en Snapdragon 8 Elite Gen 5, 8 Elite, 8 Gen 3, 8 Gen 1, 7 Gen 4, Snapdragon X Elite y X2 Elite, y plataformas Dragonwing (IQ-8275, IQ-9075, IQ-X7181, QCS8550, QCS6490, Q-6690, Q-7790, Q-8750) y automocion (SA8775P, SA8650P, SA8255P).
- GPU de escritorio: no se documentan medidas en A100, H100 o RTX 4090. Dado el tamano del modelo, cabe sin dificultad en cualquier GPU consumer, pero no hay datos de rendimiento publicados en esa configuracion.
- Despliegue movil: Qualcomm AI Hub Models (compilacion y exportacion), runtime QNN_DLC para NPU y ONNX Runtime para las variantes ONNX.
- No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de vision.
- Latencia: de 2,437 ms (minimo, ONNX w8a16 sobre Snapdragon 8 Elite Gen 5 For Galaxy Mobile) a 29,576 ms (maximo, ONNX w8a16 sobre Dragonwing Q-6690).
- Memoria pico: entre 0 MB y 230 MB segun la combinacion de runtime, precision y chipset.

## Comparativa con modelos similares

| Modelo | Desarrollador | Parametros | Resolucion de entrada | Licencia | Disponibilidad de pesos | Rendimiento |
|---|---|---|---|---|---|---|
| YOLO26-Pose | Qualcomm (sobre Ultralytics YOLO26) | 2,97 M | 640x640 | AGPL-3.0 | No distribuidos; requiere exportacion propia | 2,44 - 29,58 ms en NPU Qualcomm |
| YOLOv8-Pose / YOLO11-Pose | Ultralytics | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | AGPL-3.0 | Pesos publicos en el repositorio de Ultralytics | No disponible en la informacion proporcionada |
| MediaPipe Pose (BlazePose) | Google | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Apache-2.0 | Pesos publicos | No disponible en la informacion proporcionada |
| MoveNet (Lightning / Thunder) | Google | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Apache-2.0 | Pesos publicos | No disponible en la informacion proporcionada |

La diferencia principal de YOLO26-Pose frente a estas alternativas no es la arquitectura, sino el empaquetado: llega ya perfilado y optimizado para NPU de Qualcomm con datos de latencia por chipset, a cambio de no incluir los pesos pre-exportados y de mantener la licencia AGPL-3.0.

## Limitaciones y advertencias

- Licencia AGPL-3.0: es una licencia copyleft con clausula de uso en red. Ofrecer el modelo como servicio accesible por red puede obligar a liberar el codigo fuente de la aplicacion. Para uso comercial en producto cerrado es necesario evaluar una licencia alternativa con Ultralytics.
- Los pesos pre-exportados no se distribuyen: "Due to licensing restrictions, we cannot distribute pre-exported model assets for this model". Cualquier despliegue exige compilar y exportar con la libreria de Qualcomm AI Hub Models.
- No hay metricas de precision publicadas (AP, mAP de keypoints, OKS). No es posible evaluar la calidad de la estimacion solo con los datos del repositorio.
- Sesgos conocidos: no documentados. Los modelos de pose tienden a degradarse con oclusiones, ropa holgada, iluminacion adversa, posturas atipicas y diversidad corporal, pero no hay analisis especifico en la model card.
- Riesgo de falsos positivos y detecciones erroneas de keypoints en escenas con multiples personas o cuerpos parcialmente visibles; no se especifica el comportamiento en escenarios multipersona.
- Resolucion de entrada fija de 640x640 en la configuracion publicada; el rendimiento medidas en la tabla corresponde a esa resolucion.
- Dependencia de hardware: las cifras de latencia y memoria solo estan verificadas en plataformas Qualcomm. El rendimiento en CPU, GPU de escritorio o NPU de otros fabricantes no esta documentado.
- Compatibilidad de version: las instrucciones hacen referencia a la libreria ai-hub-models en la version v0.64.0; cambios de version pueden alterar el flujo de exportacion.
- Ambito de aplicacion restringido a vision: no sirve para tareas de texto, dialogo, agentes ni generacion de codigo.

## Enlaces

- HuggingFace: https://huggingface.co/qualcomm/YOLO26-Pose
- Implementacion de YOLO26-Pose en Ultralytics: https://github.com/ultralytics/ultralytics/tree/main/ultralytics/models/yolo/pose
- Libreria Qualcomm AI Hub Models, modelo YOLO26-Pose (v0.64.0): https://github.com/qualcomm/ai-hub-models/blob/v0.64.0/src/qai_hub_models/models/yolo26_pose
- Repositorio Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Registro en Qualcomm AI Hub: https://myaccount.qualcomm.com/signup
- Web corporativa de Qualcomm: https://www.qualcomm.com/
- Informacion corporativa de Qualcomm: https://www.qualcomm.com/company
- Qualcomm en Wikipedia: https://en.wikipedia.org/wiki/Qualcomm

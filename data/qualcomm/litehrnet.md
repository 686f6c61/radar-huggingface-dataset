# qualcomm/LiteHRNet

## Resumen

LiteHRNet es un modelo de estimación de pose humana publicado por Qualcomm en HuggingFace, con el identificador `qualcomm/LiteHRNet`. Detecta la postura de una persona y devuelve la posición y la confianza de cada una de las 17 articulaciones (keypoints). No es un modelo de lenguaje: es un modelo de visión por computador orientado a la detección de puntos clave, con una resolución de entrada fija de 256x192 píxeles.

El modelo es una implementación de Lite-HRNet, la variante ligera de la familia HRNet (High-Resolution Network), y se distribuye ya exportado y optimizado para ejecutarse en dispositivos Qualcomm, concretamente sobre la NPU de chipsets Snapdragon y Dragonwing. Qualcomm proporciona artefactos listos para desplegar en tres runtimes (ONNX, QNN_DLC y TFLite) y una librería (Qualcomm AI Hub Models) para reexportar el modelo con pesos, formas de entrada y configuraciones de dispositivo propias.

Su relevancia práctica está en el binomio tamaño/latencia: con solo 1,11 millones de parámetros y 4,49 MB en precisión float, alcanza tiempos de inferencia de entre 0,9 ms y 6,3 ms según chipset, lo que lo hace apto para aplicaciones en tiempo real en móvil, vehículo y dispositivos embebidos, incluyendo escenarios en los que la inferencia debe ocurrir en el propio dispositivo por privacidad o por falta de conectividad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Lite-HRNet (familia HRNet de red de alta resolucion, variante ligera); red convolucional de estimacion de pose |
| Parametros totales | 1,11 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; la entrada es una imagen de 256x192 pixeles) |
| Tipos de cuantizacion | solo float en los artefactos publicados (ONNX float, QNN_DLC float, TFLITE float); no se publican variantes int8 en la informacion disponible |
| Idiomas soportados | no aplica / no disponible (modelo de vision, no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch en el repositorio; exportaciones pregeneradas en ONNX, QNN_DLC y TFLite |
| Tarea | keypoint-detection (estimacion de pose humana) |
| Numero de keypoints | 17 articulaciones, con posicion y confianza por articulacion |
| Resolucion de entrada | 256x192 |
| Tamano del modelo (float) | 4,49 MB |
| Tamano del repositorio | 0,2 GB |
| Autor | qualcomm |
| Fecha de creacion | 2024-02-25 |
| Ultima actualizacion | 2026-09-10 |
| Descargas / likes en HuggingFace | 264 / 16 |
| Runtime de referencia | QAIRT 2.45; ONNX Runtime 1.27.1 para el artefacto ONNX |
| Unidad de computo objetivo | NPU de chipsets Qualcomm Snapdragon y Dragonwing |

## Arquitectura y entrenamiento

LiteHRNet pertenece a la familia HRNet, caracterizada por mantener representaciones de alta resolución a lo largo de toda la red mediante ramas paralelas a distintas resoluciones que se fusionan de forma repetida, en lugar de reducir la resolución y recuperarla después mediante decodificadores. Lite-HRNet es la variante ligera de esa familia, pensada para reducir el coste computacional manteniendo la precisión en la localizacion de articulaciones. El modelo card remite a la implementación de referencia en el repositorio `HRNet/Lite-HRNet` y cita el paper con identificador arXiv:2104.06403.

La model card no detalla la composicion del dataset de entrenamiento, el numero de tokens o imagenes usadas, ni si hubo etapas de ajuste fino con datos adicionales. Tampoco especifica el esquema de datos ni el conjunto sobre el que se midio la precision. La innovacion destacable que documenta el autor no esta en la arquitectura en si, sino en el proceso de despliegue: los pesos se exportan y compilan con Qualcomm AI Hub Workbench para ejecutarse sobre la NPU, con artefactos pregenerados para tres runtimes y soporte para reexportar con pesos ajustados, formas de entrada personalizadas y configuraciones de dispositivo y runtime propias.

## Capacidades

- Deteccion de pose humana con 17 articulaciones, devolviendo para cada una su posicion y un valor de confianza.
- Inferencia sobre imagen individual de 256x192 pixeles; no se documenta soporte de video ni de procesamiento por lotes en la informacion disponible.
- Ejecucion acelerada por hardware sobre la NPU de chipsets Qualcomm, con los tres runtimes soportados (ONNX, QNN_DLC y TFLite).
- Exportacion con configuraciones personalizadas mediante la libreria Qualcomm AI Hub Models: pesos ajustados, formas de entrada propias y seleccion de dispositivo y runtime objetivo.
- Perfilado y evaluacion en dispositivos Qualcomm alojados a traves de Qualcomm AI Hub Workbench.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes ni multilingueismo: son capacidades no aplicables o no disponibles para este modelo.

## Casos de uso

- Seguimiento de ejercicio fisico en aplicaciones moviles: el modelo puede contar repeticiones y analizar la forma del movimiento en el dispositivo, sin enviar video a la nube, gracias a latencias de 0,9 a 3 ms en chipsets como Snapdragon 8 Elite o Snapdragon 8 Gen 3 sobre QNN_DLC.
- Rehabilitacion y fisioterapia remota: la estimacion de las 17 articulaciones permite comparar la postura del paciente con una postura de referencia y generar avisos en tiempo real dentro de una aplicacion Android.
- Realidad aumentada y avatares: el modelo alimenta sistemas de captura de movimiento para controlar avatares o aplicar efectos que siguen el cuerpo del usuario, con un coste de memoria pico de 1 a 5 MB en varios chipsets.
- Automocion: los chipsets de la serie SA (SA7255P, SA8255P, SA8650P, SA8775P, SA8295P) aparecen en la tabla de rendimiento, lo que situa al modelo como candidato para monitorizacion de ocupantes o deteccion de posturas dentro del vehiculo, con tiempos de 2,6 a 5,0 ms.
- Videovigilancia y analitica en el borde: deteccion de caidas o de posturas anomalas en camaras conectadas, procesando localmente y evitando el envio de imagenes personales a servidores externos.
- Analisis deportivo: extraccion de trayectorias articulares para estudio biomecanico de gestos tecnicos (por ejemplo, saques o lanzamientos) en movil o en estaciones de captura de bajo coste.
- Interaccion sin contacto: control gestual de interfaces en quioscos, paneles industriales o dispositivos de accesibilidad, donde interesa una latencia inferior a 10 ms y no se dispone de GPU.
- Robotica e interaccion persona-robot: percepcion de la postura humana como senal de entrada para sistemas de seguridad o de colaboracion en entornos industriales con hardware embebido.

## Benchmarks y rendimiento

No se han publicado resultados de precision (AP sobre COCO, PCKh sobre MPII u otras metricas de exactitud) en la informacion disponible. Los unicos datos de rendimiento que acompanan al modelo son medidas de latencia y memoria pico por chipset y runtime, obtenidas con Qualcomm AI Hub Workbench.

| Runtime | Precision | Chipset | Inferencia (ms) | Memoria pico (MB) | Unidad principal |
|---|---|---|---|---|---|
| ONNX | float | Snapdragon X2 Elite | 2,876 | 2 - 2 | NPU |
| ONNX | float | Snapdragon X Elite | 5,727 | 5 - 5 | NPU |
| ONNX | float | Snapdragon 8 Gen 3 Mobile | 3,101 | 0 - 121 | NPU |
| ONNX | float | Snapdragon 8 Gen 1 Mobile | 6,297 | 1 - 121 | NPU |
| ONNX | float | Dragonwing IQ-8275 | 4,485 | 1 - 5 | NPU |
| ONNX | float | Dragonwing QCS8550 (proxy) | 5,427 | 1 - 3 | NPU |
| ONNX | float | QCS8450 | 6,297 | 1 - 121 | NPU |
| ONNX | float | Dragonwing IQ-9075 | 5,763 | 1 - 4 | NPU |
| ONNX | float | Dragonwing IQ-X7181 | 5,727 | 5 - 5 | NPU |
| ONNX | float | Dragonwing Q-8750 | 2,887 | 0 - 98 | NPU |
| ONNX | float | Snapdragon 8 Elite Mobile | 2,887 | 0 - 98 | NPU |
| ONNX | float | Snapdragon 8 Elite Gen 5 Mobile | 2,778 | 1 - 99 | NPU |
| QNN_DLC | float | Snapdragon X2 Elite | 1,298 | 1 - 1 | NPU |
| QNN_DLC | float | Snapdragon X Elite | 2,458 | 1 - 1 | NPU |
| QNN_DLC | float | Snapdragon 8 Gen 3 Mobile | 1,390 | 0 - 103 | NPU |
| QNN_DLC | float | Snapdragon 8 Gen 1 Mobile | 2,954 | 0 - 101 | NPU |
| QNN_DLC | float | Dragonwing IQ-8275 | 2,189 | 1 - 4 | NPU |
| QNN_DLC | float | Dragonwing QCS8550 (proxy) | 2,110 | 1 - 2 | NPU |
| QNN_DLC | float | SA8775P | 2,675 | 0 - 80 | NPU |
| QNN_DLC | float | SA8650P | 2,675 | 0 - 80 | NPU |
| QNN_DLC | float | SA8255P | 2,675 | 0 - 80 | NPU |
| QNN_DLC | float | QCS8450 | 2,954 | 0 - 101 | NPU |
| QNN_DLC | float | Dragonwing IQ-9075 | 2,503 | 3 - 5 | NPU |
| QNN_DLC | float | Dragonwing IQ-X7181 | 2,458 | 1 - 1 | NPU |
| QNN_DLC | float | Dragonwing Q-8750 | 1,080 | 1 - 82 | NPU |
| QNN_DLC | float | SA7255P | 5,028 | 1 - 78 | NPU |
| QNN_DLC | float | SA8295P | 3,477 | 0 - 81 | NPU |
| QNN_DLC | float | Snapdragon 8 Elite Mobile | 1,080 | 1 - 82 | NPU |
| QNN_DLC | float | Snapdragon 8 Elite Gen 5 Mobile | 0,908 | 1 - 84 | NPU |
| TFLITE | float | Snapdragon 8 Gen 3 Mobile | 2,675 | 0 - 147 | NPU |
| TFLITE | float | Snapdragon 8 Gen 1 Mobile | 5,345 | 1 - 138 | NPU |
| TFLITE | float | Dragonwing IQ-8275 | 4,223 | 1 - 12 | NPU |
| TFLITE | float | Dragonwing QCS8550 (proxy) | 4,230 | 0 - 3 | NPU |
| TFLITE | float | SA8775P | 5,391 | 1 - 116 | NPU |

La tabla de la model card original es mas extensa; el listado de TFLITE aparece truncado en la informacion proporcionada. El runtime QNN_DLC es sistematicamente el mas rapido, con una mejora de aproximadamente 2x a 3x frente a ONNX sobre el mismo chipset.

## Requisitos de hardware

- VRAM estimada para inferencia: minima. El modelo ocupa 4,49 MB en float y 1,11 M de parametros; en GPU discreta o integrada el cuello de botella no es la memoria, sino el coste de lanzamiento de kernels.
- GPU recomendadas: no aplica en el escenario objetivo. El modelo esta disenado y perfilado para NPU de Qualcomm (Snapdragon X2 Elite, X Elite, 8 Gen 1, 8 Gen 3, 8 Elite, 8 Elite Gen 5, Dragonwing IQ-8275, IQ-9075, IQ-X7181, Q-8750, QCS8450, QCS8550, SA7255P, SA8255P, SA8650P, SA8775P, SA8295P).
- Cabe en cualquier GPU de consumo: si, sin dificultad (por ejemplo, RTX 3060 o superiores, o incluso GPUs integradas), aunque sin la aceleracion de NPU el tiempo de inferencia por fotograma sera mayor que los 0,9 a 6,3 ms reportados.
- Opciones de despliegue: ONNX Runtime 1.27.1 para el artefacto ONNX; QAIRT 2.45 para QNN_DLC; TFLite para el artefacto TFLITE; PyTorch para el modelo original; libreria Qualcomm AI Hub Models para reexportar; Qualcomm AI Hub Workbench para compilar, perfilar y evaluar en dispositivo alojado.
- No aplican los runtimes tipicos de modelos de lenguaje (vLLM, TGI, llama.cpp, Ollama), ya que no es un modelo generativo de texto.
- Latencia: de 0,908 ms (Snapdragon 8 Elite Gen 5, QNN_DLC) a 6,297 ms (Snapdragon 8 Gen 1 / QCS8450, ONNX).
- Memoria pico reportada: desde 1 MB en varios chipsets con QNN_DLC hasta 147 MB en Snapdragon 8 Gen 3 con TFLITE.
- Throughput: no disponible en la informacion proporcionada (solo se publican tiempos de inferencia por ejecucion).

## Comparativa con modelos similares

No se incluyen datos comparativos de otros modelos en la informacion proporcionada. La siguiente tabla recoge alternativas de la misma categoria, con los campos que no estan documentados en el material de partida marcados como no disponibles. Los datos de licencia y formatos de esas alternativas proceden de conocimiento general y no del material proporcionado, por lo que conviene verificarlos antes de usarlos en produccion.

| Modelo | Desarrollador | Parametros | Keypoints | Licencia | Formatos de despliegue | Notas |
|---|---|---|---|---|---|---|
| LiteHRNet (este modelo) | Qualcomm | 1,11 M | 17 | Apache 2.0 | PyTorch, ONNX, QNN_DLC, TFLite | Optimizado y perfilado para NPU Qualcomm; dataset de entrenamiento no documentado |
| MoveNet | Google | no disponible | 17 | Apache 2.0 (segun conocimiento general, verificar) | TFLite | Orientado a movil; datos de precision y parametros no incluidos en la informacion proporcionada |
| MediaPipe Pose (BlazePose) | Google | no disponible | no disponible | Apache 2.0 (segun conocimiento general, verificar) | TFLite, solucion completa con detector | Incluye pipeline de deteccion y seguimiento, no solo el modelo de pose |
| RTMPose | OpenMMLab | no disponible | 17 | Apache 2.0 (segun conocimiento general, verificar) | PyTorch, ONNX, TensorRT y otros | Ecosistema orientado a servidor y benchmarking; datos no incluidos en la informacion proporcionada |
| YOLOv8-pose / YOLO11-pose | Ultralytics | no disponible | 17 | AGPL-3.0 (segun conocimiento general, verificar) | PyTorch, ONNX, TensorRT, TFLite | Licencia copyleft que condiciona su uso comercial; datos no incluidos en la informacion proporcionada |

## Limitaciones y advertencias

- No se publican metricas de precision (AP, PCKh ni equivalentes) en la informacion disponible, por lo que no es posible evaluar la exactitud del modelo ni compararla con alternativas antes de desplegarlo.
- La model card no especifica el dataset de entrenamiento, su composicion demografica ni el proceso de anotacion. Esto impide valorar sesgos conocidos por genero, tono de piel, complexidad corporal, ropa o condicion fisica, un riesgo relevante en estimacion de pose.
- La resolucion de entrada esta fijada en 256x192 pixeles. Escenas con personas pequenas en el encuadre, oclusiones parciales o posturas poco frecuentes pueden degradar la deteccion de articulaciones.
- No se documenta si el modelo soporta multiples personas en la misma imagen ni si incorpora un detector de personas previo. En el material proporcionado solo se describe la salida de 17 articulaciones por inferencia.
- Riesgo de alucinacion en sentido estricto no aplica, pero si existe el fenomeno equivalente: articulaciones fuera de posicion con una confianza alta cuando la persona esta parcialmente fuera del encuadre o muy ocluida. Conviene aplicar un umbral de confianza y validacion geometrica (por ejemplo, coherencia de esqueleto) antes de usar la salida en produccion.
- Solo se publican artefactos en precision float. No hay variantes cuantizadas en la informacion disponible, lo que limita la reduccion adicional de memoria o latencia en dispositivos muy restringidos.
- La latencia reportada depende del chipset y del runtime; los valores de referencia no se trasladan a hardware no Qualcomm. En CPU o GPU generica el rendimiento puede ser muy distinto.
- La licencia Apache 2.0 permite uso comercial, pero se aplica al artefacto publicado por Qualcomm. La implementacion original de Lite-HRNet en el repositorio `HRNet/Lite-HRNet` y el paper asociado deben verificarse por separado.
- El modelo esta atado a un pipeline de despliegue concreto (Qualcomm AI Hub Models, QAIRT, AI Hub Workbench). Reexportar con pesos ajustados requiere pasar por esa libreria y, para ejecutar en dispositivo alojado, por una cuenta de Qualcomm.
- El repositorio ocupa 0,2 GB, principalmente por los artefactos exportados de los tres runtimes, algo a tener en cuenta en pipelines de integracion continua que descarguen el modelo completo.
- Los datos de descargas y likes del repositorio (264 y 16 respectivamente) reflejan una adopcion limitada dentro de HuggingFace y no deben tomarse como indicador de calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qualcomm/LiteHRNet
- Pagina del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/litehrnet
- Implementacion en Qualcomm AI Hub Models (GitHub): https://github.com/qualcomm/ai-hub-models/blob/v0.62.0/src/qai_hub_models/models/litehrnet
- Repositorio Qualcomm AI Hub Models: https://github.com/qualcomm/ai-hub-models
- Implementacion original de Lite-HRNet: https://github.com/HRNet/Lite-HRNet
- Paper citado (arXiv:2104.06403): https://arxiv.org/abs/2104.06403
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Registro de cuenta Qualcomm: https://myaccount.qualcomm.com/signup
- Descarga ONNX float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/litehrnet/releases/v0.62.0/litehrnet-onnx-float.zip
- Descarga QNN_DLC float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/litehrnet/releases/v0.62.0/litehrnet-qnn_dlc-float.zip
- Descarga TFLITE float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/litehrnet/releases/v0.62.0/litehrnet-tflite-float.zip
- Sitio corporativo de Qualcomm: https://www.qualcomm.com/

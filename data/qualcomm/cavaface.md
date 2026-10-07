# qualcomm/CavaFace

## Resumen

CavaFace es un modelo de reconocimiento facial publicado por Qualcomm dentro de su catálogo Qualcomm AI Hub Models, orientado a la generación de embeddings faciales para tareas de verificación (1:1) e identificación (1:N). No es un modelo generativo ni un transformer de lenguaje: se trata de una red convolucional de visión que toma una imagen de entrada de 112x112 píxeles y devuelve una representación vectorial de la cara, útil para comparar identidades mediante distancia entre embeddings.

El modelo deriva de la implementación de código abierto CavaFace (repositorio cavalleria/cavaface) y se distribuye con checkpoints ya exportados y optimizados para dispositivos Qualcomm, con assets en ONNX, QNN_DLC y TFLITE compilados mediante Qualcomm AI Hub Workbench. El checkpoint empaquetado es `IR_SE_100_Combined_Epoch_24.pt`, con 65,5 millones de parámetros y un tamano en coma flotante de 249,96 MB.

Su relevancia actual está en el despliegue en el borde (edge): la model card reporta latencias de inferencia entre 2,25 ms y 7,82 ms sobre NPU de plataformas Snapdragon y Dragonwing, lo que lo hace apto para reconocimiento facial en tiempo real en movilidad, automoción y dispositivos embebidos. La licencia es MIT y el repositorio ocupa 2,0 GB. El repositorio se creó el 2 de diciembre de 2025 y la ultima actualización registrada es del 7 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional para reconocimiento facial; el checkpoint se denomina IR_SE_100_Combined_Epoch_24.pt, lo que apunta a un backbone SE-ResNet-100 con bloques residuales mejorados (IR). La model card no detalla la arquitectura de forma explicita |
| Parametros totales | 65,5 M |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada de imagen de 112x112) |
| Resolucion de entrada | 112x112 |
| Tipos de cuantizacion | Los assets publicados son exclusivamente en precision float (ONNX float, QNN_DLC float, TFLITE float). No se publican variantes cuantizadas (int8, int4) en la informacion disponible |
| Idiomas soportados | no disponible (no aplica: modelo de vision, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt), ONNX, QNN_DLC, TFLITE |
| Tamano del checkpoint (float) | 249,96 MB |
| Tamano del repositorio | 2,0 GB |
| Pipeline declarado | object-detection |
| Descargas / likes | 9 descargas / 0 likes |
| Fecha de creacion | 2025-12-02 |
| Ultima actualizacion | 2026-10-07 |

## Arquitectura y entrenamiento

La model card no documenta en detalle el pipeline de entrenamiento ni la composicion del dataset. La informacion disponible indica que CavaFace es un framework basado en PyTorch para entrenar modelos de reconocimiento facial que generan embeddings faciales para tareas de verificación e identificación, y que este repositorio concreto contiene ficheros preexportados y optimizados para dispositivos Qualcomm, no un pipeline de entrenamiento reproducible.

A partir del nombre del checkpoint (`IR_SE_100_Combined_Epoch_24.pt`) puede inferirse un backbone de tipo SE-ResNet-100 con bloques residuales mejorados, entrenado durante al menos 24 epocas sobre un conjunto combinado de datos faciales. Esta inferencia procede del nombre del fichero y de la implementacion de referencia del proyecto CavaFace, no de una descripcion explicita en la model card. No se especifican en la informacion disponible el numero de tokens o imagenes de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o perdidas especificas como ArcFace, CosFace o similares.

La innovacion practica del modelo no reside en la arquitectura, sino en el proceso de exportacion y compilacion mediante Qualcomm AI Hub Workbench, que genera binarios especificos por runtime (ONNX, QNN_DLC, TFLITE) y por chipset, con ejecucion delegada a la NPU del dispositivo. Ademas, el repositorio permite reexportar el modelo con pesos personalizados (por ejemplo, checkpoints afinados), formas de entrada personalizadas y configuraciones de runtime y dispositivo objetivo.

## Capacidades

- Generacion de embeddings faciales: produce una representacion vectorial de una cara a partir de una imagen de 112x112, apta para comparacion por distancia.
- Verificación de identidad 1:1: permite decidir si dos imagenes corresponden a la misma persona comparando sus embeddings.
- Identificación 1:N: permite buscar la identidad mas similar dentro de una galeria de embeddings precalculados.
- Inferencia en tiempo real: las latencias reportadas (2,25-7,82 ms) son compatibles con procesamiento de video en directo en dispositivos moviles y embebidos.
- Ejecucion en NPU: los assets QNN_DLC y TFLITE estan compilados para ejecutarse en la unidad de procesamiento neuronal de plataformas Snapdragon y Dragonwing.
- No dispone de generacion de texto, razonamiento, codigo ni matematicas: es un modelo puramente visual de extraccion de caracteristicas.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de capacidades multilingues (no procesa lenguaje natural).
- No dispone de modo de pensamiento (thinking mode), vision-lenguaje, audio ni ninguna otra modalidad adicional.

## Casos de uso

- Desbloqueo facial en dispositivos moviles: el modelo extrae el embedding del rostro capturado por la camara frontal y lo compara contra el embedding registrado en el dispositivo. Su latencia de 2,25-3,19 ms en NPU de Snapdragon 8 Gen 3 y 8 Elite permite que la verificacion ocurra sin retardo perceptible.
- Verificacion de identidad en procesos KYC y banca digital: comparacion 1:1 entre la selfi del usuario y la fotografia del documento de identidad, ejecutada en el propio terminal para evitar enviar imagenes biometricas a un servidor.
- Control de acceso fisico: integracion del modelo en lectores de puertas o tornos con hardware embebido Qualcomm (por ejemplo, Dragonwing IQ-8275 con 7,6 ms de inferencia) para validar empleados contra una galeria local de embeddings.
- Deduplicacion de galerias fotograficas: calculo de embeddings por rostro y agrupamiento por similitud para detectar imagenes repetidas de la misma persona en grandes volumenes de fotos de eventos.
- Analisis de video en directo en el borde: seguimiento y reconocimiento de personas en camaras IP o sistemas de videovigilancia con computo local, usando TFLITE u ONNX sobre NPU y evitando el coste de ancho de banda de enviar el video a la nube.
- Personalizacion en automocion: los resultados de rendimiento incluyen plataformas de automocion (SA8295P, SA8775P, SA8650P), lo que lo hace apto para ajustar el perfil del conductor o el asiento segun la persona detectada.
- Autenticacion en aplicaciones Android: el tag `android` de la model card apunta a su uso dentro de aplicaciones moviles nativas con delegacion a NPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precision (LFW, CFP-FP, AgeDB, IJB-C, etc.) en la informacion disponible. La model card solo incluye metricas de rendimiento de inferencia por chipset, runtime y precision, que se resumen a continuacion (valores de tiempo de inferencia y rango de memoria pico).

| Runtime | Chipset | Tiempo de inferencia (ms) | Rango de memoria pico (MB) | Unidad de computo |
|---|---|---|---|---|
| QNN_DLC | Snapdragon 8 Elite Gen 5 For Galaxy Mobile | 2,259 | 0 - 87 | NPU |
| TFLITE | Snapdragon 8 Elite Gen 5 For Galaxy Mobile | 2,251 | 0 - 99 | NPU |
| ONNX | Snapdragon 8 Elite Gen 5 For Galaxy Mobile | 2,279 | 0 - 94 | NPU |
| ONNX | Snapdragon 8 Elite For Galaxy Mobile | 2,641 | 0 - 94 | NPU |
| QNN_DLC | Snapdragon 8 Elite For Galaxy Mobile | 2,625 | 0 - 87 | NPU |
| ONNX | Snapdragon 8 Gen 3 Mobile | 3,194 | 0 - 145 | NPU |
| QNN_DLC | Snapdragon 8 Gen 3 Mobile | 3,187 | 0 - 133 | NPU |
| TFLITE | Snapdragon 8 Gen 3 Mobile | 3,148 | 0 - 251 | NPU |
| ONNX | Snapdragon 8 Gen 1 Mobile | 7,11 | 0 - 223 | NPU |
| QNN_DLC | Snapdragon 8 Gen 1 Mobile | 7,105 | 0 - 213 | NPU |
| ONNX | Snapdragon X Elite | 4,292 | 127 - 127 | NPU |
| ONNX | Qualcomm Dragonwing IQ-8275 | 7,648 | 0 - 4 | NPU |
| QNN_DLC | Qualcomm Dragonwing IQ-8275 | 7,606 | 0 - 3 | NPU |
| QNN_DLC | Qualcomm SA8295P | 7,822 | 0 - 194 | NPU |
| TFLITE | Qualcomm SA8775P | 6,782 | 0 - 100 | NPU |
| TFLITE | Qualcomm SA8650P | 6,782 | 0 | NPU |

Estos datos provienen de la tabla "Performance Summary" de la model card y corresponden a la compilacion mediante Qualcomm AI Hub Workbench. No se dispone de datos de exactitud, tasa de falsa aceptacion (FAR), tasa de falso rechazo (FRR) ni comparaciones de precision frente a otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en GPU: no disponible como dato publicado. A partir del tamano del checkpoint (249,96 MB en float32) y de la resolucion de entrada (112x112), una estimacion razonable para lotes pequenos es inferior a 1-2 GB, pero se trata de una estimacion, no de una cifra oficial.
- Memoria pico reportada en dispositivos Qualcomm: entre 0 y 328 MB segun runtime y chipset, con la mayor parte de los casos por debajo de 250 MB.
- GPU recomendadas: no hay recomendaciones oficiales para GPU de escritorio. Dado el tamano del modelo, cualquier GPU con al menos 2-4 GB de memoria es suficiente; no requiere A100, H100 ni RTX 4090 para funcionar.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo moderna (por ejemplo, RTX 3060, RTX 4060, GTX 1660 o superiores) e incluso en iGPU con memoria compartida suficiente.
- Hardware objetivo real: NPU de plataformas Qualcomm Snapdragon (8 Gen 1, 8 Gen 3, 8 Elite, 8 Elite Gen 5, X Elite, X2 Elite), Qualcomm Dragonwing (IQ-8275, IQ-9075, IQ-X7181, Q-8750, QCS8550, QCS8450) y plataformas de automocion (SA8295P, SA8775P, SA8650P).
- Opciones de despliegue: ONNX Runtime (assets ONNX float), Qualcomm QAIRT / QNN (assets QNN_DLC), TensorFlow Lite (assets TFLITE), y PyTorch para el checkpoint original. La exportacion personalizada se realiza con la libreria Qualcomm AI Hub Models.
- Latencia estimada: entre 2,25 ms y 7,82 ms por inferencia sobre NPU, segun chipset y runtime, para el conjunto de plataformas medidas.
- Throughput: no disponible de forma explicita. A partir de las latencias publicadas, en los chipsets mas rapidos se superan las 400 inferencias por segundo en teoria si solo se considerase el tiempo de computo, pero no se publica ninguna medida de throughput sostenido.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| CavaFace (este modelo) | 65,5 M | 112x112 | MIT | HuggingFace y Qualcomm AI Hub | Assets ONNX, QNN_DLC y TFLITE compilados para NPU Qualcomm |
| ArcFace / InsightFace | no disponible en la informacion proporcionada | 112x112 (habitual en la familia) | varia segun la implementacion | Repositorios publicos de InsightFace | Referencia habitual en reconocimiento facial con backbone IR-SE-100, del mismo orden de tamano |
| MobileFaceNet | no disponible en la informacion proporcionada | 112x112 (habitual) | varia segun la implementacion | Repositorios publicos | Disenado especificamente para movil, con un numero de parametros muy inferior |
| AdaFace | no disponible en la informacion proporcionada | 112x112 (habitual) | varia segun la implementacion | Repositorio publico | Enfoque de entrenamiento adaptado a la calidad de la imagen |

No se dispone de datos de precision comparativa entre estos modelos en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales y de disponibilidad.

## Limitaciones y advertencias

- Discrepancia entre el pipeline declarado y la funcionalidad real: la model card etiqueta el modelo como `object-detection`, mientras que la descripcion indica que genera embeddings faciales para verificacion e identificacion. Conviene tratar la etiqueta como imprecisa y validar el comportamiento real antes de integrarlo en produccion.
- Ausencia de metricas de precision: no se publican resultados en LFW, CFP-FP, AgeDB, IJB-C ni ninguna otra prueba de verificacion facial. Sin FAR/FRR no es posible dimensionar el riesgo de falso positivo o falso negativo en un despliegue real.
- Riesgo de sesgo demografico: no se documenta la composicion del dataset de entrenamiento ("Combined"), por lo que se desconoce el equilibrio por etnia, genero, edad, iluminacion u oclusion. Los sistemas de reconocimiento facial son sensibles a estos factores y deben auditarse con datos propios antes de desplegarse.
- Consideraciones legales y de privacidad: los embeddings faciales son datos biometricos y estan sujetos a regulaciones estrictas (RGPD en la Union Europea, BIPA en Illinois, entre otras). Aunque la licencia del modelo sea MIT, el uso del sistema puede requerir base legal, consentimiento explicito y evaluacion de impacto.
- Limitaciones de entrada: el modelo trabaja con imagenes de 112x112, de modo que el rendimiento depende fuertemente del recorte y alineacion previos del rostro. No se documenta un detector facial asociado en este repositorio.
- Idiomas: no aplica, ya que el modelo no procesa texto.
- Ausencia de variantes cuantizadas: solo se publican assets en float, lo que puede limitar el despliegue en plataformas sin soporte de coma flotante acelerada.
- Licencia MIT: permite uso comercial y modificacion, pero no exime de las obligaciones regulatorias sobre datos biometricos ni de la atribucion correspondiente.
- Mantenimiento y adopcion: el modelo cuenta con 9 descargas y 0 likes en el momento de la consulta, con una unica actualizacion registrada en octubre de 2026. Es un artefacto de distribucion dentro del ecosistema Qualcomm AI Hub mas que un proyecto con comunidad activa.
- Dependencia de hardware: los assets QNN_DLC y TFLITE estan optimizados para NPU Qualcomm; su rendimiento fuera de esas plataformas no esta documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qualcomm/CavaFace
- CavaFace en Qualcomm AI Hub: https://aihub.qualcomm.com/models/cavaface
- Repositorio de Qualcomm AI Hub Models (CavaFace): https://github.com/qualcomm/ai-hub-models/blob/v0.64.0/src/qai_hub_models/models/cavaface
- Implementacion original de CavaFace: https://github.com/cavalleria/cavaface
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Descarga del asset ONNX float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/cavaface/releases/v0.64.0/cavaface-onnx-float.zip
- Descarga del asset QNN_DLC float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/cavaface/releases/v0.64.0/cavaface-qnn_dlc-float.zip
- Descarga del asset TFLITE float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/cavaface/releases/v0.64.0/cavaface-tflite-float.zip
- Imagen de demostracion del modelo: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/cavaface/web-assets/model_demo.png
- Sitio corporativo de Qualcomm: https://www.qualcomm.com/

# qualcomm/RangeNet-Plus-Plus

## Resumen

RangeNet-Plus-Plus (estilizado también como RangeNet++) es un modelo de segmentación semántica de nubes de puntos LiDAR publicado por Qualcomm dentro de su catálogo Qualcomm AI Hub Models. El modelo proyecta la nube de puntos sobre una imagen de rango de 5 canales (profundidad, x, y, z, intensidad) y aplica un codificador DarkNet-53 con una cabeza decodificadora para predecir una etiqueta de clase semántica por punto, con 20 clases de salida y una resolución de entrada de 64x2048.

No se trata de un modelo de lenguaje: no genera texto, no mantiene conversaciones y no procesa lenguaje natural. Su ámbito es la percepción para conducción asistida (el propio autor clasifica el caso de uso como `driver_assistance`) y para robótica móvil, donde el requisito crítico es funcionar en tiempo real sobre hardware embebido de bajo consumo.

Para ello, Qualcomm distribuye artefactos ya exportados y optimizados para sus NPU (Hexagon), en variantes de precisión `float` y `w8a16`, además de la librería de exportación para generar configuraciones personalizadas. La licencia es MIT y la implementación de referencia procede del repositorio lidar-bonnetal de la Universidad de Bonn.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN codificador-decodificador sobre imagen de rango; backbone DarkNet-53 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de percepcion, no autoregresivo) |
| Tipos de cuantizacion | float y w8a16 (pesos 8 bits, activaciones 16 bits); exportables otras configuraciones con la libreria ai-hub-models |
| Idiomas soportados | no aplica; el modelo no procesa texto ni audio |
| Licencia | MIT |
| Formato de pesos | PyTorch (checkpoint original), ONNX, QNN DLC, TFLite |
| Tarea | Segmentacion semantica por punto de nubes de puntos LiDAR (20 clases) |
| Canales de entrada | 5 (profundidad, x, y, z, intensidad) |
| Resolucion de entrada | 64x2048 |
| Checkpoint | darknet53_rangenet++ |
| Runtime de referencia | QAIRT 2.45, ONNX Runtime 1.27.1 |

## Arquitectura y entrenamiento

La arquitectura sigue el diseno de RangeNet++: la nube de puntos LiDAR se proyecta en una imagen de rango de 5 canales y se procesa con un codificador convolucional DarkNet-53, seguido de una cabeza decodificadora que produce predicciones densas de clase por pixel de la imagen de rango; esas predicciones se reproyectan despues a los puntos 3D originales. El modelo resultante tiene 20 clases de salida, lo que lo situa como un segmentador semantico multiclase orientado a escenas de conduccion.

El repositorio de HuggingFace no documenta el proceso de entrenamiento: no se indica el numero de tokens o de muestras, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como RLHF o DPO (no aplicables en un modelo discriminativo de vision). La implementacion de referencia es la de lidar-bonnetal, y el contenido de este repositorio son pesos ya entrenados y exportados, no codigo de entrenamiento. Cualquier detalle adicional sobre el dataset o el procedimiento de optimizacion debe considerarse no disponible en la informacion proporcionada.

La innovacion principal del paquete de Qualcomm no esta en la arquitectura, sino en el despliegue: exportacion a ONNX, QNN DLC y TFLite, cuantizacion `w8a16` y compilacion dirigida a la NPU Hexagon de las plataformas Snapdragon y Dragonwing, con compilacion, perfilado y evaluacion realizados mediante Qualcomm AI Hub Workbench.

## Capacidades

- Segmentacion semantica densa de nubes de puntos LiDAR, con asignacion de una de 20 clases a cada punto.
- Proyeccion de nube de puntos a imagen de rango de 5 canales (profundidad, x, y, z, intensidad).
- Inferencia en tiempo real sobre NPU de Qualcomm, con tiempos entre 37,653 ms y 426,069 ms segun plataforma y precision (ver seccion de rendimiento).
- Ejecucion en entornos moviles y embebidos: Android, plataformas Snapdragon moviles y computo en el borde (Dragonwing, QCS).
- Exportacion a multiples runtimes: ONNX (float y w8a16), QNN DLC (float y w8a16) y TFLite (float).
- Personalizacion mediante la libreria ai-hub-models: pesos ajustados propios, formas de entrada personalizadas y configuraciones de dispositivo/runtime.
- No soporta tool calling, function calling ni agentes: no es un modelo de lenguaje.
- No soporta razonamiento multi-paso, generacion de texto, codigo ni matematicas.
- No procesa imagenes RGB de camara: su entrada es una imagen de rango derivada de LiDAR.

## Casos de uso

- Conduccion asistida y percepcion para vehiculos autonomos: segmentacion de la escena LiDAR en 20 clases (vehiculo, peaton, carretera, vegetacion, edificacion, etc.) como entrada para modulos de prediccion y planificacion. El modelo esta disenado especificamente para este caso de uso y cabe en la NPU de un SoC movil.
- Deteccion de obstaculos en sistemas ADAS embebidos: los tiempos de inferencia de 42,562 ms a 76,042 ms en Snapdragon 8 Elite Gen 5 y 8 Gen 3 permiten integrar el modelo en un bucle de percepcion de decenas de hercios sin depender de un servidor externo.
- Robotica movil y AGV en almacenes y fabricas: segmentacion de puntos LiDAR para distinguir suelo transitable, estanterias, personas y obstaculos, con la ventaja de que la variante w8a16 reduce el pico de memoria a 10-28 MB en plataformas Dragonwing IQ-8275 e IQ-9075.
- Mapeo y localizacion (SLAM) con filtrado semantico: eliminar puntos de clases dinamicas antes de construir el mapa o de estimar la odometria, mejorando la robustez del mapa en entornos con trafico.
- Automatizacion agricola y maquinaria pesada: segmentacion de cultivos, terreno y obstaculos con LiDAR en plataformas de computo en el borde, donde no hay conectividad fiable ni margen para enviar la nube de puntos a la nube.
- Preetiquetado de datos LiDAR: uso del modelo como primer paso en un pipeline de anotacion para generar etiquetas iniciales sobre las que trabaja un anotador humano, reduciendo el coste de construir datasets propios.
- Investigacion en segmentacion semantica 3D: el modelo sirve como linea base reproducible y ya exportada para comparar tecnicas de cuantizacion o de compilacion sobre NPU frente a la implementacion original de lidar-bonnetal.
- Despliegue en dispositivos Android de gama alta: los artefactos TFLite y QNN DLC permiten integrar el modelo en aplicaciones Android con aceleracion por NPU sin necesidad de infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado en la informacion disponible resultados de benchmarks de calidad de segmentacion (mIoU, accuracy por clase) sobre SemanticKITTI ni sobre otros conjuntos de datos. Lo que si se publica es el resumen de rendimiento de inferencia por plataforma y precision, medido con Qualcomm AI Hub Workbench y ejecutado en NPU:

| Plataforma | Precision | Tiempo de inferencia (ms) | Rango de memoria pico (MB) |
|---|---|---|---|
| Snapdragon X2 Elite | float | 50,387 | 35 - 35 |
| Snapdragon X Elite | float | 99,806 | 101 - 101 |
| Snapdragon 8 Gen 3 Mobile | float | 76,042 | 0 - 459 |
| Snapdragon 8 Gen 1 Mobile | float | 191,345 | 1 - 523 |
| Snapdragon 8 Elite Mobile | float | 59,697 | 21 - 346 |
| Snapdragon 8 Elite Gen 5 Mobile | float | 42,562 | 23 - 372 |
| Dragonwing IQ-8275 | float | 178,251 | 21 - 27 |
| Dragonwing IQ-9075 | float | 152,648 | 21 - 26 |
| Dragonwing QCS8550 (proxy) | float | 104,111 | 0 - 159 |
| QCS8450 | float | 191,345 | 1 - 523 |
| Dragonwing IQ-X7181 | float | 99,806 | 101 - 101 |
| Dragonwing Q-8750 | float | 59,697 | 21 - 346 |
| Snapdragon X2 Elite | w8a16 | 37,653 | 18 - 18 |
| Snapdragon X Elite | w8a16 | 65,789 | 52 - 52 |
| Snapdragon 8 Gen 3 Mobile | w8a16 | 50,556 | 1 - 474 |
| Snapdragon 8 Gen 1 Mobile | w8a16 | 108,448 | 0 - 582 |
| Dragonwing IQ-8275 | w8a16 | 70,388 | 10 - 15 |
| Dragonwing IQ-9075 | w8a16 | 64,108 | 13 - 16 |
| Dragonwing QCS8550 (proxy) | w8a16 | 66,967 | 0 - 597 |
| QCS8450 | w8a16 | 108,448 | 0 - 582 |
| Dragonwing IQ-X7181 | w8a16 | 65,789 | 52 - 52 |
| Dragonwing QCS6490 | w8a16 | 426,069 | 24 - 28 |
| Dragonwing Q-6690 | w8a16 | dato truncado en la fuente | dato truncado en la fuente |

Observaciones derivadas de los datos: la cuantizacion `w8a16` reduce el tiempo de inferencia entre un 22 % y un 46 % frente a `float` en las plataformas comparables (por ejemplo, 50,387 ms a 37,653 ms en Snapdragon X2 Elite, y 99,806 ms a 65,789 ms en Snapdragon X Elite). La tabla original del model card continua mas alla de la ultima fila mostrada y aparece truncada en la fuente consultada.

## Requisitos de hardware

- VRAM: no aplica en el sentido convencional; el modelo se ejecuta en la memoria unificada del SoC. El rango de memoria pico reportado va de 10-15 MB (Dragonwing IQ-8275, w8a16) a 0-597 MB (Dragonwing QCS8550 proxy, w8a16).
- Hardware objetivo: NPU Hexagon de plataformas Qualcomm Snapdragon (8 Gen 1, 8 Gen 3, 8 Elite, 8 Elite Gen 5, X Elite, X2 Elite) y Qualcomm Dragonwing (IQ-8275, IQ-9075, IQ-X7181, Q-8750, Q-6690, QCS6490, QCS8450, QCS8550).
- GPU de consumo: no es el destino previsto del modelo. Los artefactos ONNX `float` pueden ejecutarse sobre CPU/GPU con ONNX Runtime, pero las metricas publicadas corresponden a ejecucion en NPU, no a tarjetas graficas de escritorio.
- Opciones de despliegue: ONNX Runtime 1.27.1 con QAIRT 2.45; QNN DLC sobre Qualcomm AI Engine Direct; TFLite; y compilacion/perfilado mediante Qualcomm AI Hub Workbench.
- Latencia: de 37,653 ms (Snapdragon X2 Elite, w8a16) a 426,069 ms (Dragonwing QCS6490, w8a16). El mejor caso en movil de gama alta es 42,562 ms en Snapdragon 8 Elite Gen 5 con precision float.
- Throughput: no expresado como peticiones por segundo en la informacion disponible; a partir de los tiempos por inferencia se deduce un orden de 2,3 a 26,5 inferencias por segundo segun plataforma y precision.

## Comparativa con modelos similares

La informacion proporcionada no incluye resultados comparativos frente a otros segmentadores LiDAR, por lo que los datos de parametros, licencia y rendimiento de las alternativas se marcan como no disponibles.

| Modelo | Enfoque | Backbone | Clases | Licencia | Optimizado para NPU Qualcomm |
|---|---|---|---|---|---|
| RangeNet-Plus-Plus (este repositorio) | CNN sobre imagen de rango | DarkNet-53 | 20 | MIT | Si (ONNX, QNN DLC, TFLite) |
| RangeNet++ (lidar-bonnetal) | CNN sobre imagen de rango | DarkNet-53 | no disponible | no disponible | no (implementacion de referencia en PyTorch) |
| SqueezeSegV2 | CNN sobre imagen de rango | no disponible | no disponible | no disponible | no disponible |
| SalsaNext | CNN sobre imagen de rango | no disponible | no disponible | no disponible | no disponible |
| PolarNet | Segmentacion en coordenadas polares | no disponible | no disponible | no disponible | no disponible |

La diferencia diferencial de esta publicacion frente a las implementaciones academicas no es la precision de segmentacion, sino la disponibilidad de artefactos compilados y perfilados para NPU de Qualcomm, con tiempos de inferencia medidos por plataforma.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts y no admite tool calling ni uso como agente.
- La entrada es exclusivamente una imagen de rango derivada de LiDAR de 5 canales; no acepta imagenes RGB, audio ni texto.
- El modelo predice 20 clases, pero la informacion disponible no especifica la taxonomia exacta ni el dataset de entrenamiento, por lo que no se puede garantizar la correspondencia con las clases de un despliegue concreto.
- No se publican metricas de calidad de segmentacion (mIoU, precision por clase) en la informacion disponible. Sin esas cifras no es posible estimar la tasa de error esperada en produccion.
- Riesgo de degradacion en condiciones adversas: al depender de la nube de puntos LiDAR, el rendimiento cae con lluvia, niebla, polvo, superficies poco reflectantes y baja densidad de puntos. Este comportamiento es caracteristico del enfoque de imagen de rango y no esta cuantificado en la ficha del autor.
- La cuantizacion `w8a16` reduce latencia y memoria, pero puede alterar la precision de segmentacion; la informacion proporcionada no incluye una comparacion de calidad entre `float` y `w8a16`.
- Las variantes `w8a16` y parte de los artefactos dependen de la ruta de compilacion de Qualcomm (QAIRT 2.45) y estan pensadas para NPU Hexagon; fuera de ese hardware hay que recurrir a la variante ONNX `float`.
- Licencia MIT declarada en el repositorio, lo que en principio permite uso comercial; conviene verificar de forma independiente la licencia del repositorio de origen lidar-bonnetal antes de un despliegue comercial.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que existe poca validacion externa de los artefactos publicados.
- Los rangos de memoria pico incluyen valores con minimo 0 MB en algunas plataformas, lo que sugiere que la medicion puede no capturar de forma homogenea el pico real en todos los casos; conviene perfilar en el dispositivo final.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/qualcomm/RangeNet-Plus-Plus
- Pagina del modelo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/rangenet_plus_plus
- Repositorio de exportacion en GitHub (v0.62.2): https://github.com/qualcomm/ai-hub-models/blob/v0.62.2/src/qai_hub_models/models/rangenet_plus_plus
- Qualcomm AI Hub Workbench: https://workbench.aihub.qualcomm.com
- Implementacion de referencia lidar-bonnetal: https://github.com/PRBonn/lidar-bonnetal
- Descarga ONNX float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/rangenet_plus_plus/releases/v0.62.2/rangenet_plus_plus-onnx-float.zip
- Descarga ONNX w8a16: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/rangenet_plus_plus/releases/v0.62.2/rangenet_plus_plus-onnx-w8a16.zip
- Descarga QNN DLC float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/rangenet_plus_plus/releases/v0.62.2/rangenet_plus_plus-qnn_dlc-float.zip
- Descarga QNN DLC w8a16: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/rangenet_plus_plus/releases/v0.62.2/rangenet_plus_plus-qnn_dlc-w8a16.zip
- Descarga TFLite float: https://qaihub-public-assets.s3.us-west-2.amazonaws.com/qai-hub-models/models/rangenet_plus_plus/releases/v0.62.2/rangenet_plus_plus-tflite-float.zip

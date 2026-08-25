# qualcomm/EyeGaze

## Resumen

EyeGaze es un modelo de estimación de mirada (gaze estimation) desarrollado por Qualcomm, basado en la arquitectura EyeNet. Predice la dirección de la mirada (pitch y yaw) a partir de imágenes de ojo en escala de grises de 96x160 píxeles. El modelo está optimizado para ejecutarse en tiempo real en dispositivos Qualcomm, como los chipsets Snapdragon y Dragonwing, utilizando la NPU integrada. Con solo 2,58 millones de parámetros y un tamaño de 9,6 MB en precisión float (3,3 MB en cuantización w8a16), está diseñado para aplicaciones de edge computing y móviles donde la latencia y el consumo de memoria son críticos.

La relevancia actual de EyeGaze radica en su capacidad para habilitar interfaces de usuario basadas en la mirada, análisis de atención y aplicaciones de accesibilidad en dispositivos de bajo consumo. Qualcomm lo distribuye como parte de su colección AI Hub Models, con archivos preexportados en formatos ONNX, QNN_DLC y TFLITE, listos para desplegar en hardware Qualcomm. El modelo se basa en la implementación de EyeNet disponible en GitHub, y su licencia BSD-3-Clause permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EyeNet (red convolucional para estimacion de mirada) |
| Parametros totales | 2,58 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 96x160) |
| Tipos de cuantizacion | float, w8a16 |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | BSD-3-Clause |
| Formato de pesos | ONNX, QNN_DLC, TFLITE |

## Arquitectura y entrenamiento

EyeGaze utiliza la arquitectura EyeNet, una red neuronal convolucional diseñada específicamente para estimar la direccion de la mirada a partir de imagenes de ojo recortadas. La implementacion original proviene del repositorio [gaze-estimation](https://github.com/david-wb/gaze-estimation) de GitHub, y Qualcomm la ha adaptado y optimizado para sus dispositivos. La entrada es una imagen en escala de grises de 96x160 píxeles, y la salida son dos angulos (pitch y yaw) que representan la direccion de la mirada.

No se dispone de informacion detallada sobre el dataset de entrenamiento, el numero de epocas, ni si se utilizaron tecnicas como aumento de datos o aprendizaje por transferencia. El modelo se distribuye con un checkpoint preentrenado (checkpoint.pt) y Qualcomm proporciona herramientas para exportar con pesos personalizados mediante la libreria Qualcomm AI Hub Models. La optimizacion principal se centra en la compilacion para NPU de Qualcomm, con soporte para cuantizacion w8a16 que reduce el tamaño del modelo a 3,3 MB sin una perdida significativa de precision.

## Capacidades

- Estimacion de la direccion de la mirada (pitch y yaw) a partir de imagenes de ojo en escala de grises.
- Inferencia en tiempo real en dispositivos Qualcomm, con latencias de 0,5 a 6 ms segun el chipset y la precision.
- Soporte para multiples runtimes: ONNX, QNN_DLC y TFLITE, lo que facilita la integracion en diferentes entornos de desarrollo.
- Cuantizacion w8a16 disponible para reducir el tamaño del modelo y el consumo de memoria sin degradar significativamente el rendimiento.
- Optimizado para ejecucion en NPU de Qualcomm, aunque tambien puede ejecutarse en CPU o GPU si es necesario.
- Capacidad de exportacion con pesos personalizados mediante la libreria Qualcomm AI Hub Models, permitiendo fine-tuning para casos de uso especificos.

## Casos de uso

- Accesibilidad para personas con movilidad reducida: el modelo puede integrarse en sistemas de control por mirada que permitan escribir, navegar o interactuar con dispositivos mediante la posicion de los ojos. Su baja latencia (menos de 1 ms en Snapdragon 8 Elite) es critica para una experiencia fluida.
- Analisis de atencion del conductor: en sistemas de asistencia a la conduccion, EyeGaze puede monitorizar la direccion de la mirada del conductor para detectar distracciones o somnolencia. La ejecucion en NPU permite un procesamiento continuo sin afectar al rendimiento del vehiculo.
- Interfaces de realidad aumentada y virtual: el seguimiento de mirada es esencial para el renderizado foveado y la interaccion natural en gafas AR/VR. El tamaño reducido del modelo (3,3 MB en w8a16) permite su integracion en dispositivos con recursos limitados.
- Investigacion de experiencia de usuario (UX): en estudios de usabilidad, EyeGaze puede analizar donde mira el usuario en una pantalla o interfaz, proporcionando datos objetivos sobre patrones de atencion. Su capacidad de exportacion con pesos personalizados permite adaptarlo a diferentes condiciones de iluminacion o tipos de ojo.
- Kioscos interactivos y senalizacion digital: el modelo puede detectar si un usuario esta mirando una pantalla publicitaria o un kiosco, activando contenido interactivo o recopilando metricas de engagement. La inferencia en tiempo real y el bajo consumo de memoria lo hacen adecuado para dispositivos embebidos.
- Sistemas de seguridad y vigilancia: en entornos controlados, EyeGaze puede estimar la direccion de la mirada de una persona para determinar si esta prestando atencion a un punto especifico, por ejemplo en puestos de control o centros de monitoreo.

## Benchmarks y rendimiento

Qualcomm proporciona datos de rendimiento para diferentes chipsets y precisiones. La siguiente tabla resume los tiempos de inferencia y el uso de memoria en algunos dispositivos representativos:

| Chipset | Runtime | Precision | Tiempo de inferencia (ms) | Pico de memoria (MB) |
|---|---|---|---|---|
| Snapdragon 8 Elite Gen 5 Mobile | ONNX | w8a16 | 0,463 | 0 - 65 |
| Snapdragon 8 Elite Mobile | ONNX | w8a16 | 0,514 | 0 - 69 |
| Snapdragon 8 Gen 3 Mobile | ONNX | float | 0,871 | 0 - 64 |
| Snapdragon 8 Gen 1 Mobile | ONNX | float | 1,725 | 2 - 67 |
| Snapdragon X Elite | ONNX | float | 1,285 | 8 - 8 |
| Qualcomm Dragonwing QCS6490 | ONNX | w8a16 | 3,877 | 2 - 4 |

No se han publicado resultados de benchmarks estandar como MMLU o HumanEval, ya que se trata de un modelo de vision especializado y no de un modelo de lenguaje. Los datos de rendimiento se centran en latencia y memoria, que son las metricas relevantes para aplicaciones en tiempo real.

## Requisitos de hardware

- VRAM estimada: el modelo requiere muy poca memoria, con picos de 0 a 184 MB segun el chipset y la precision. En la mayoria de los dispositivos Snapdragon, el pico de memoria no supera los 80 MB.
- GPU recomendadas: no requiere GPU dedicada; esta optimizado para la NPU de Qualcomm. En dispositivos sin NPU, puede ejecutarse en CPU, aunque con mayor latencia.
- Compatibilidad con consumer GPU: no aplica, ya que el modelo esta disenado para dispositivos embebidos y moviles de Qualcomm. No se proporcionan versiones para GPU de escritorio.
- Opciones de despliegue: Qualcomm AI Hub Workbench, ONNX Runtime, TFLite, y la libreria Qualcomm AI Hub Models para exportacion personalizada.
- Latencia y throughput: en chipsets de gama alta como Snapdragon 8 Elite Gen 5, la latencia es de 0,463 ms (w8a16), lo que permite mas de 2000 inferencias por segundo. En chipsets de gama media como QCS6490, la latencia sube a 3,877 ms, aun suficiente para aplicaciones en tiempo real.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de estimacion de mirada en la documentacion proporcionada. Existen alternativas academicas como GazeNet o modelos basados en redes mas grandes, pero no se han encontrado datos publicos que permitan una comparacion directa en terminos de parametros, latencia o precision. La informacion disponible se limita al propio modelo de Qualcomm.

## Limitaciones y advertencias

- El modelo solo acepta imagenes de ojo recortadas de 96x160 píxeles en escala de grises. No funciona con imagenes de rostro completo ni con imagenes en color, por lo que requiere un pipeline previo de deteccion y recorte del ojo.
- No se especifican los datos de entrenamiento, por lo que el rendimiento puede variar segun la etnia, la edad, las condiciones de iluminacion o el uso de gafas. Es recomendable evaluar el modelo en el dominio de aplicacion antes de desplegarlo en produccion.
- La precision de la estimacion de mirada puede degradarse con movimientos bruscos de la cabeza o con oclusiones parciales del ojo. No se proporcionan metricas de error angular (por ejemplo, grados de desviacion).
- La licencia BSD-3-Clause permite uso comercial, pero el modelo esta optimizado exclusivamente para hardware Qualcomm. En otras plataformas, el rendimiento puede ser significativamente peor o requerir conversiones adicionales.
- El repositorio de HuggingFace tiene muy pocas descargas (1) y likes (1), lo que sugiere que es un modelo relativamente nuevo o poco adoptado. La documentacion es limitada y no incluye ejemplos de uso detallados.

## Enlaces

- [HuggingFace: qualcomm/EyeGaze](https://huggingface.co/qualcomm/EyeGaze)
- [Qualcomm AI Hub: EyeGaze](https://aihub.qualcomm.com/models/eyegaze)
- [GitHub: qualcomm/ai-hub-models - EyeGaze](https://github.com/qualcomm/ai-hub-models/tree/main/qai_hub_models/models/eyegaze)
- [Implementacion original de EyeNet](https://github.com/david-wb/gaze-estimation)

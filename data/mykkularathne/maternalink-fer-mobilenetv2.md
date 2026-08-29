# mykkularathne/maternalink-fer-mobilenetv2

## Resumen

El modelo `maternalink-fer-mobilenetv2` es un clasificador de expresiones faciales (FER) de siete clases, desarrollado por `mykkularathne` como parte del proyecto de investigación MaternaLink (IT22638168), orientado al apoyo durante el embarazo. Se basa en una arquitectura MobileNetV2 fine-tuned sobre el dataset FER-2013 y exportado a TensorFlow Lite, con probabilidades calibradas mediante temperature scaling. El modelo está diseñado para inferencia en dispositivos con recursos limitados (edge computing) y ofrece tres variantes de cuantización: float32, float16 y dynamic int8.

La relevancia de este modelo radica en su enfoque en la calibración de probabilidades: antes de la calibración, el modelo mostraba un ECE de 0.3010, que se reduce a 0.0126 tras aplicar una temperatura de 5.727, sin alterar el argmax. Esto convierte las salidas en probabilidades interpretables, aunque el autor advierte explícitamente que no debe usarse como herramienta de diagnóstico médico o psicológico. Con una precisión del 62,9% en el split PrivateTest de FER-2013, el modelo es adecuado para prototipos e investigación, pero no para aplicaciones críticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV2 (CNN con inverted residual blocks y linear bottlenecks) |
| Parametros totales | no disponible (basado en MobileNetV2, ~3.4M en la arquitectura original) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | float32, float16, dynamic int8 (dynint8); existe una variante full-integer int8 no publicada por bajo rendimiento |
| Idiomas soportados | en (etiqueta del modelo, aunque no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | TensorFlow Lite (.tflite) + JSON de especificacion de tensores |

## Arquitectura y entrenamiento

MobileNetV2 es una red neuronal convolucional diseñada para eficiencia en dispositivos móviles y embebidos. Introduce bloques residuales invertidos y bottlenecks lineales, que reducen el coste computacional manteniendo una buena precisión. En este modelo, la arquitectura base se ha fine-tuned sobre el dataset FER-2013, compuesto por imágenes de 48×48 píxeles en escala de grises, con siete clases de expresiones faciales: enfado, asco, miedo, felicidad, neutral, tristeza y sorpresa.

El entrenamiento se realizó con transfer learning desde pesos preentrenados en ImageNet, aunque la model card no especifica el número de épocas, el tamaño del lote ni la función de pérdida. Tras el entrenamiento, se aplicó calibración por temperature scaling con un factor T=5.727, ajustado sobre el conjunto de validación y horneado en el grafo exportado. Esta calibración no cambia el argmax (0/3.589 predicciones alteradas), pero reduce el error de calibración esperado (ECE) de 0.3010 a 0.0126, haciendo que las probabilidades de salida sean interpretables como certeza del modelo.

## Capacidades

- Clasificacion de expresiones faciales en 7 clases: angry, disgust, fear, happy, neutral, sad, surprise.
- Salida de probabilidades calibradas que suman 1.0, listas para umbrales o decisiones basadas en confianza.
- Inferencia en dispositivos con recursos limitados gracias a las variantes TFLite (float16 y dynint8).
- Preprocesamiento especificado con precision: requiere entrada de 96×96 píxeles en RGB, con valores en [-1, 1], y un pipeline concreto que incluye downsampling a 48×48 y posterior upsampling en float32.
- No incluye deteccion de caras: espera una cara ya recortada como entrada.
- No soporta tool calling, agentes ni razonamiento multi-paso (es un modelo de vision puro).

## Casos de uso

- Investigacion en psicologia y ciencias del comportamiento: el modelo puede clasificar expresiones faciales en estudios controlados donde las caras ya estan recortadas, proporcionando probabilidades calibradas para analisis estadistico.
- Prototipos de aplicaciones de bienestar emocional: integrable en apps moviles para monitorizar expresiones en entornos no clinicos, siempre con la advertencia de que no es un diagnostico.
- Sistemas de retroalimentacion en tiempo real: gracias a su baja latencia (1.78 ms en x86 con float32), puede usarse en pipelines de video para detectar expresiones en cada frame, aunque requiere un modulo de deteccion de caras aguas arriba.
- Evaluacion de UX en interfaces: analisis de reacciones faciales de usuarios ante prototipos o contenidos, en condiciones de laboratorio con iluminacion controlada.
- Educacion y formacion: herramienta didactica para ensenar conceptos de reconocimiento de expresiones y calibracion de modelos, dado su codigo abierto y documentacion detallada.
- Benchmarking de modelos FER en edge devices: las tres variantes TFLite permiten comparar rendimiento y precision en diferentes hardware (x86, ARM) para decidir la mejor opcion en despliegues reales.

## Benchmarks y rendimiento

Segun la model card, los resultados oficiales declarados por el autor son:

| Dataset | Metrica | Valor |
|---|---|---|
| FER-2013 (PrivateTest split) | Accuracy | 0.6289 |
| FER-2013 (PrivateTest split) | Macro-F1 | 0.6036 |

Ademas, se reportan metricas de validacion para cada variante:

| Variante | Val macro-F1 | ECE | Acuerdo con el modelo validado |
|---|---|---|---|
| float32 | 0.6122 | 0.0099 | 99.5% |
| float16 | 0.6090 | 0.0135 | 99.0% |
| dynint8 | 0.6071 | 0.0103 | 91.5% |

El autor indica que las tres variantes estan dentro del ruido de medida del proyecto (0.0065 macro-F1) en agregado, pero que dynint8 muestra discrepancias por frame mucho mayores de lo que sugieren las metricas agregadas.

## Requisitos de hardware

- Modelo extremadamente ligero: los archivos TFLite pesan 8.9 MB (float32), 4.5 MB (float16) y 2.5 MB (dynint8).
- Inferencia en CPU sin GPU: en x86, la variante float32 tarda 1.78 ms por imagen (media), mientras que float16 tarda 2.62 ms (porque x86 no tiene soporte nativo de fp16 y se dequantiza en tiempo de ejecucion).
- Para dispositivos moviles, la variante float16 es candidata, pero no se han realizado benchmarks en ARM; el autor advierte que no se deben extrapolar las latencias de x86 a ARM.
- No requiere GPU dedicada; puede ejecutarse en CPUs de gama baja, Raspberry Pi, smartphones y otros dispositivos embebidos.
- Opciones de despliegue: TensorFlow Lite Runtime, TensorFlow Lite Interpreter en Python/C++/Java, o mediante frameworks como MediaPipe (aunque no se incluye deteccion de caras).
- El preprocesamiento exacto (downsampling a 48×48 y upsampling en float32) debe implementarse correctamente para evitar degradacion de rendimiento.

## Comparativa con modelos similares

No se dispone de informacion comparativa con otros modelos de reconocimiento de expresiones faciales en la documentacion proporcionada. Se podria comparar con otros modelos FER basados en MobileNetV2 o con arquitecturas como ResNet o EfficientNet, pero no hay datos publicados en esta ficha. Por tanto, esta seccion se considera no disponible.

## Limitaciones y advertencias

- No es una herramienta de diagnostico: el autor enfatiza que el modelo estima expresiones faciales, no emociones, estado de animo ni bienestar, y no debe presentarse como evaluacion medica, clinica o psicologica.
- Precision limitada: 62.9% de accuracy, lo que implica que aproximadamente una de cada tres predicciones es incorrecta.
- No detecta caras: si se introduce una imagen sin recortar, el modelo devuelve probabilidades plausibles pero sin sentido, y no hay ninguna senal en la salida que indique el error.
- Sensibilidad al preprocesamiento: la calibracion hace al modelo mas sensible a pequenas perturbaciones en la entrada; un cambio de 0.4% en el rango de valores puede producir una diferencia de 0.135 en la probabilidad y alterar el 2.1% de las predicciones.
- La variante full-integer int8 no se publica porque pierde 0.1188 de macro-F1 y su calibracion colapsa (ECE 0.1443); no debe usarse.
- La variante dynint8 tiene un acuerdo por frame del 91.5% con el modelo validado, lo que significa que aproximadamente 1 de cada 12 predicciones difiere, aunque las metricas agregadas sean similares.
- Licencia MIT permite uso comercial, pero con las restricciones eticas mencionadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mykkularathne/maternalink-fer-mobilenetv2
- Documentacion de MobileNetV2 (Wikipedia): https://en.wikipedia.org/wiki/MobileNet
- MobileNetV2 en PyTorch Hub: https://pytorch.org/hub/pytorch_vision_mobilenet_v2/
- Articulo sobre MobileNetV2 (GeeksforGeeks): https://www.geeksforgeeks.org/computer-vision/what-is-mobilenet-v2/
- Estudio sobre MobileNetV2 para FER (Springer): https://link.springer.com/article/10.1007/s40009-025-01671-w

# muzammil-khan/wearable-activity-classifier

## Resumen

El modelo `wearable-activity-classifier` es una red neuronal convolucional unidimensional (CNN 1D) desarrollada por Muzammil Khan para clasificar señales de sensores portátiles (wearables) en tres clases de actividad física: estacionario, caminando y corriendo. Se trata de un modelo pequeño y ligero, con 50.435 parámetros, diseñado para procesar secuencias de 100 lecturas de un único canal de sensor. Fue entrenado como parte de una actividad de laboratorio de deep learning, por lo que su alcance es principalmente educativo y demostrativo, más que un sistema listo para producción.

El modelo se distribuye bajo licencia MIT y está implementado con Keras/TensorFlow, en formato `.keras`. Su arquitectura es una CNN clásica de una sola capa convolucional seguida de pooling, aplanado y dos capas densas. Aunque el autor reporta una precisión del 100% en el conjunto de test, este resultado debe interpretarse con cautela, ya que probablemente refleja un dataset muy simple o un sobreajuste, y no es representativo de un rendimiento generalizable en entornos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN 1D (Conv1D + MaxPooling1D + Dense) |
| Parametros totales | 50.435 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de clasificacion de series temporales) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | Keras (.keras) / TensorFlow |

## Arquitectura y entrenamiento

La arquitectura es una red convolucional unidimensional con la siguiente composición:

- Capa Conv1D con 32 filtros, tamaño de kernel 3 y activación ReLU.
- Capa MaxPooling1D con tamaño de pool 2.
- Capa Flatten.
- Capa Dense con 32 unidades y activación ReLU.
- Capa Dense final con 3 unidades y activación Softmax.

La entrada esperada es un tensor de forma `(100, 1)`, es decir, 100 lecturas consecutivas de un único sensor. La salida es una distribución de probabilidad sobre las tres clases: estacionario, caminando y corriendo.

No se dispone de información detallada sobre el dataset de entrenamiento, el número de muestras, la composición de las clases ni el proceso de entrenamiento (optimizador, función de pérdida, épocas, etc.). El autor indica que el entrenamiento se realizó como parte de una actividad de laboratorio y que el tiempo de entrenamiento fue de aproximadamente 2,9 segundos, lo que sugiere un dataset muy reducido. No se menciona el uso de técnicas como RLHF, DPO o aumentación de datos.

## Capacidades

- Clasificacion de actividades fisicas a partir de series temporales de sensores: distingue entre estacionario, caminando y corriendo.
- Procesamiento de secuencias de 100 lecturas de un unico canal de sensor.
- Inferencia rapida y ligera, adecuada para entornos con recursos limitados.
- No soporta generacion de texto, razonamiento, codigo, vision, tool calling, agentes ni capacidades multilingues, al ser un modelo discriminativo especializado en un dominio muy concreto.

## Casos de uso

- Monitorizacion de actividad fisica en aplicaciones de salud y bienestar: el modelo puede integrarse en una aplicacion movil o en un dispositivo wearable para clasificar en tiempo real si el usuario esta parado, caminando o corriendo, a partir de datos de acelerometro o giroscopio.
- Deteccion de inactividad prolongada: en entornos de cuidado de personas mayores, el modelo podria usarse para alertar si una persona permanece estacionaria durante un periodo excesivo, aunque su limitacion a tres clases y a un solo canal de sensor reduce su utilidad practica.
- Demostracion educativa de deep learning: por su simplicidad y rapidez de entrenamiento, es un ejemplo util para ensenar conceptos de CNN aplicadas a series temporales en cursos de machine learning.
- Prototipado rapido de pipelines de clasificacion de sensores: al ser un modelo pequeno y con formato Keras, puede servir como punto de partida para experimentar con arquitecturas mas complejas o con datasets reales.
- Analisis de datos de laboratorio: en investigacion, puede emplearse para clasificar grabaciones de sensores en condiciones controladas, siempre que el dominio de aplicacion coincida con el del entrenamiento.
- Integracion en sistemas embebidos: dado su tamano reducido, podria desplegarse en microcontroladores o dispositivos de bajo consumo para clasificacion local sin conexion a la nube.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados sobre el conjunto de test, junto con la comparacion con otras arquitecturas probadas en el mismo dataset:

| Modelo | Precision en test | Parametros | Tiempo de entrenamiento |
|---|---:|---:|---:|
| CNN (modelo final) | 100% | 50.435 | ~2,9 s |
| SimpleRNN | 100% | 2.243 | ~4,1 s |
| CNN + LSTM | 66,67% | 9.603 | ~6,8 s |
| LSTM | 64,67% | 5.507 | ~6,5 s |

No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K, ya que el modelo no esta disenado para tareas de lenguaje o razonamiento general. La precision del 100% en test es sospechosamente alta y probablemente indica un dataset muy sencillo o sobreajuste; no debe interpretarse como un indicador de rendimiento en datos reales.

## Requisitos de hardware

- El modelo tiene solo 50.435 parametros, por lo que su huella de memoria es minima (menos de 1 MB en precision float32).
- Puede ejecutarse en cualquier CPU moderna sin necesidad de GPU. La inferencia es practicamente instantanea para una sola muestra.
- Es viable su despliegue en dispositivos embebidos como Raspberry Pi, microcontroladores ARM o incluso en navegadores mediante TensorFlow.js.
- No se requieren GPUs especificas; cualquier GPU con soporte CUDA podria acelerar el entrenamiento, pero no es necesario para inferencia.
- Opciones de despliegue: TensorFlow Serving, TensorFlow Lite para moviles y embebidos, o exportacion a ONNX para otros runtimes.
- No se dispone de datos de latencia o throughput medidos, pero dado el tamano del modelo, la latencia por inferencia deberia ser inferior a 1 milisegundo en hardware moderno.

## Comparativa con modelos similares

No se dispone de informacion sobre otros modelos publicos de clasificacion de actividades con sensores wearable que puedan compararse directamente con este. La unica comparativa disponible es la que el propio autor incluye en la model card, entre arquitecturas entrenadas sobre el mismo dataset (CNN, SimpleRNN, CNN+LSTM y LSTM), que ya se ha presentado en la seccion de benchmarks. No hay datos de modelos externos como los de Google (por ejemplo, los basados en TensorFlow para reconocimiento de actividad) ni de la literatura academica, por lo que no es posible establecer una comparativa objetiva con alternativas de la misma categoria.

## Limitaciones y advertencias

- La precision del 100% en el conjunto de test es un indicador de posible sobreajuste o de un dataset extremadamente simple; el modelo probablemente no generalice bien a datos reales de sensores con ruido, variaciones entre usuarios o diferentes colocaciones del dispositivo.
- El modelo solo acepta una unica caracteristica de sensor (un canal) y una ventana fija de 100 lecturas. No soporta multiples sensores (acelerometro, giroscopio, magnetometro) ni frecuencias de muestreo variables.
- Solo distingue tres clases (estacionario, caminando, corriendo). No cubre otras actividades comunes como subir escaleras, montar en bicicleta o conducir.
- No se especifica el dataset de entrenamiento, su tamano, ni la procedencia de los datos, lo que impide evaluar la representatividad y los posibles sesgos.
- No se ha documentado el comportamiento ante datos fuera de distribucion, como movimientos bruscos o sensores con calibracion deficiente.
- La licencia MIT permite uso comercial y modificacion, pero al no haber informacion sobre los datos de entrenamiento, el usuario debe asumir la responsabilidad de verificar la idoneidad del modelo para su caso de uso.
- No es un modelo de lenguaje ni multimodal; no debe utilizarse para tareas de procesamiento de texto, vision o audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/muzammil-khan/wearable-activity-classifier
- Perfil del autor en Hugging Face: https://huggingface.co/Muzammilkhan
- Portfolio del autor (AI Engineer): https://muzammil-nawaz-khan.vercel.app/

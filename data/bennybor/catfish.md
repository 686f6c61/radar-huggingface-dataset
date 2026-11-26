# bennybor/catfish

## Resumen

Catfish (identificador `bennybor/catfish`) es una red neuronal convolucional (CNN) minima para clasificacion de imagenes binaria, desarrollada por el usuario bennybor como ejemplo didactico en Google Colab. El modelo distingue entre dos clases —gato y pez— a partir de dibujos en escala de grises de 28x28 pixeles con trazos blancos sobre fondo negro. No es un modelo de lenguaje ni un sistema de proposito general: es una pieza de material educativo orientada a ilustrar el flujo completo de entrenamiento, validacion y evaluacion de un clasificador convolucional.

La arquitectura es deliberadamente simple: dos capas convolucionales y de pooling seguidas de dos capas densas, con un total de parametros muy reducido (no publicado). El modelo se distribuye en formato Keras y su repositorio en Hugging Face ocupa 0.0 GB, lo que sugiere pesos de tamano minimo. Se entreno con early stopping sobre la perdida de validacion, seleccionando la epoca 5 de 8 como mejor punto de parada.

Su relevancia es exclusivamente pedagogica. No compite con modelos de produccion ni con clasificadores de vision modernos; sirve como referencia para quienes aprenden a construir, entrenar y desplegar una CNN basica con Keras y a publicar el resultado en Hugging Face junto con una demo en Spaces. Los resultados publicados (74,3 % de exactitud en test sobre 74 dibujos) reflejan el caracter limitado del conjunto de datos y del propio diseno del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN secuencial: Conv2D(32, 3x3, ReLU) -> MaxPooling(2x2) -> Flatten -> Dense(128, ReLU) -> Dense(2, softmax) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada fija de 28x28 pixeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (clasificacion de imagenes, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | Keras (libreria `keras`, `library_name: keras`) |

## Arquitectura y entrenamiento

El modelo es una CNN de cuatro capas con una unica rama convolucional. La entrada es una imagen de 28x28 pixeles en escala de grises, aplanada a 784 valores y normalizada dividiendo entre 255 antes de alimentar la red. La primera capa aplica 32 filtros de 3x3 con activacion ReLU, seguida de un max pooling de 2x2 que reduce la resolucion espacial. La salida se aplana y pasa por una capa densa de 128 neuronas con ReLU y una capa final de 2 neuronas con softmax que produce la distribucion de probabilidad sobre las clases gato (0) y pez (1).

El entrenamiento se realizo en Google Colab como ejemplo de aula. El conjunto de datos es pequeno y consiste en dibujos de estudiantes; no se especifica el numero total de ejemplos ni la composicion exacta del dataset. Se empleo early stopping sobre la perdida de validacion, con un maximo de 8 epocas y seleccion de la mejor epoca en la quinta. No se menciona el uso de RLHF, DPO ni tecnicas de aumento de datos. La validacion se hizo sobre 74 dibujos y la evaluacion final sobre otros 74 dibujos no vistos durante el entrenamiento.

## Capacidades

- Clasificacion binaria de imagenes de 28x28 pixeles en escala de grises entre dos clases: gato y pez.
- Procesamiento de dibujos con trazos blancos (valor 255) sobre fondo negro (valor 0), con normalizacion previa de los pixeles.
- Inferencia rapida y de bajo coste computacional, adecuada para entornos con recursos limitados.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades de generacion de texto, codigo, matematicas, vision general, audio ni modo "thinking".
- No dispone de capacidades multilingues por no ser un modelo de lenguaje.
- No soporta agentes ni planificacion.

## Casos de uso

- Docencia introductoria a vision por computador: el modelo sirve como ejemplo completo y reproducible para explicar el ciclo de vida de una CNN (preprocesado, entrenamiento, validacion, early stopping y evaluacion) en un curso o taller.
- Demostracion de despliegue en Hugging Face Spaces: la demo oficial (`bennybor/catfish-app`) permite mostrar a estudiantes como conectar un modelo Keras con una interfaz web minima.
- Prototipado rapido de clasificadores binarios de baja resolucion: para experimentos academicos donde se necesite un baseline trivial antes de escalar a modelos mayores.
- Pruebas de integracion de Keras con el ecosistema Hugging Face: util para verificar pipelines de carga de modelos `image-classification` con la libreria Keras.
- Ejercicio de evaluacion critica de modelos: sus limitaciones documentadas (74,3 % de exactitud sobre 74 muestras) permiten discutir en clase la diferencia entre exactitud en test, validacion y generalizacion real.
- Referencia para comparativas de tamano y coste: sirve como punto de partida para medir el salto de rendimiento al pasar de una CNN minima a arquitecturas como ResNet o ViT en tareas de clasificacion de dibujos.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Exactitud en test | 74,3 % | 74 dibujos no vistos en entrenamiento |
| Exactitud en validacion | 77,0 % | 74 dibujos usados para elegir la epoca de parada |
| Mejor epoca | 5 de 8 | Early stopping sobre perdida de validacion |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, ImageNet, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo es una CNN minima con pesos de tamano despreciable (repositorio de 0.0 GB).
- GPU recomendadas: cualquier GPU consumer moderna o incluso CPU es suficiente; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 2060, RTX 3060, etc.) y en CPU sin problemas.
- Opciones de despliegue: carga nativa con Keras/TensorFlow, exportacion a TensorFlow Lite o TF.js para navegador, y uso en Hugging Face Spaces mediante la libreria Keras.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia de milisegundos en CPU y sub-milisegundo en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bennybor/catfish | no disponible (CNN minima) | 28x28 pixeles en escala de grises | 74,3 % en test (74 muestras) | no disponible | Hugging Face (Keras) |
| LeNet-5 (referencia historica) | ~60 mil | 32x32 pixeles en escala de grises | MNIST ~99 % | publica / academica | Multiple |
| CNN didactica tipo MNIST tutorial | variable | 28x28 pixeles en escala de grises | ~97-99 % en MNIST | variable | Multiples tutoriales |
| ResNet-18 | ~11,7 millones | 224x224 RGB | ImageNet top-1 ~69,8 % | BSD-3 / MIT | PyTorch, Hugging Face |

La comparativa es orientativa: catfish no se evalua sobre un benchmark estandar, sino sobre un conjunto propio de 74 dibujos, por lo que sus cifras no son directamente comparables con las de modelos entrenados en ImageNet o MNIST.

## Limitaciones y advertencias

- Conjunto de datos muy pequeno (dibujos de estudiantes) y sin documentacion sobre su composicion, lo que impide evaluar sesgos de clase o de estilo de dibujo.
- Riesgo elevado de errores en dibujos atipicos, tal y como advierte el propio autor en la model card.
- Exactitud en test del 74,3 % sobre solo 74 muestras: el intervalo de confianza es amplio y la metrica es poco fiable para inferir rendimiento en produccion.
- Entrada restringida a 28x28 pixeles en escala de grises con trazos blancos sobre fondo negro; no admite imagenes en color, otras resoluciones ni otros formatos sin preprocesado adicional.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribucion de los pesos.
- Idiomas no aplicables; no es un modelo de lenguaje y no debe usarse para tareas de texto.
- No apto para produccion: es un ejemplo educativo, sin garantias de robustez, calibracion ni mantenimiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bennybor/catfish
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/bennybor/catfish-app

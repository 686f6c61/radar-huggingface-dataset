# Hapyr/deep-learning-architectures-weights

## Resumen

`Hapyr/deep-learning-architectures-weights` es un repositorio de pesos de Keras/TensorFlow publicado por el usuario Hapyr que recopila tres arquitecturas clasicas de aprendizaje profundo entrenadas como parte de un portafolio personal: una CNN para CIFAR-10, una LSTM para clasificacion de spam en SMS y una GAN de tipo DCGAN para MNIST. No se trata de un modelo de lenguaje generativo ni de un modelo fundacional, sino de un paquete de artefactos educativos con pesos entrenados en versiones reducidas para poder ejecutarse en CPU.

El repositorio es relevante como material didactico y de referencia para quien quiera reproducir pipelines basicos de vision por computadora, procesamiento de lenguaje natural clasico y modelos generativos sin necesidad de GPU. Las versiones incluidas son deliberadamente reducidas (5 epocas en la CNN frente a 15 originales, 3 epocas en la GAN frente a 100), por lo que los resultados son modestos y no representan el estado del arte.

No hay informacion sobre parametros totales, longitud de contexto ni idiomas soportados, ya que no es un modelo de lenguaje. La licencia es MIT y los pesos se distribuyen en formato nativo de Keras (`.keras`), ademas de un tokenizador serializado en pickle para el modelo LSTM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN (CIFAR-10), LSTM (spam SMS), DCGAN (MNIST) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en formato Keras nativo) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.keras` (Keras 3 / TensorFlow), tokenizador en `.pkl` |

## Arquitectura y entrenamiento

El repositorio agrupa tres artefactos independientes. El primero es una CNN convolucional entrenada sobre CIFAR-10 durante 5 epocas (la version original usa 15), alcanzando una `val_accuracy` de 0.666. El segundo es una LSTM para clasificacion binaria de SMS spam sobre el dataset SMS Spam Collection, obtenido mediante un mirror TSV del tutorial pycon-2016, con una `val_accuracy` de 0.9641; incluye un tokenizador serializado en pickle porque Keras 3 elimino `tf.keras.preprocessing`. El tercero es una DCGAN entrenada sobre MNIST durante 3 epocas (frente a las 100 del original), con generador y discriminador separados y una muestra de imagenes generadas (`gan_samples.png`).

No se documentan detalles sobre composicion exacta de los datasets, hiperparametros, tecnicas de regularizacion ni procesos de RLHF/DPO (no aplicables a estos modelos). El autor indica que las recetas se redujeron de forma intencionada para permitir entrenamiento en CPU, y que los notebooks originales completos estan en el directorio `portfolio/projects/deep-learning-architectures/notebooks`. Se menciona un cuarto componente, un Transformer PT→EN (notebook 04), que requiere `tensorflow-datasets`, `tensorflow_text` y el dataset web-archive, pero cuyos pesos no estan incluidos en el repositorio.

## Capacidades

- Clasificacion de imagenes de 10 clases sobre CIFAR-10 mediante la CNN incluida.
- Clasificacion binaria de mensajes SMS como spam o no spam mediante la LSTM y su tokenizador.
- Generacion de imagenes sinteticas de digitos manuscritos (MNIST) mediante el generador de la DCGAN.
- Discriminacion real/falso sobre MNIST mediante el discriminador de la DCGAN.
- Carga directa con `tf.keras.models.load_model` en TensorFlow/Keras 3.
- Ejecucion en CPU gracias a las versiones reducidas de los modelos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues, al no ser un modelo de lenguaje.

## Casos de uso

- Docencia y aprendizaje de vision por computadora: la CNN de CIFAR-10 sirve como ejemplo ejecutable de un pipeline completo de clasificacion de imagenes en CPU, util para practicas introductorias.
- Deteccion de spam en SMS: la LSTM con su tokenizador permite montar un clasificador binario de mensajes cortos en entornos con recursos limitados, por ejemplo como base para un filtro de SMS en una aplicacion movil o un servicio de mensajeria.
- Generacion de datos sinteticos de digitos: el generador DCGAN puede emplearse para aumentar datasets de MNIST en experimentos de augmentation o para demostrar tecnicas de entrenamiento adversarial.
- Prototipado rapido de modelos generativos: el par generador/discriminador permite estudiar el equilibrio adversarial y las perdidas de una GAN sin necesidad de GPU.
- Referencia para comparativas de arquitecturas: los tres modelos permiten contrastar empiricamente el comportamiento de CNN, RNN y GAN sobre tareas y datasets distintos dentro de un mismo repositorio.
- Material de portafolio y evaluacion tecnica: util para revisores que quieran inspeccionar implementaciones canonicas de Keras con resultados reproducibles y codigo asociado en notebooks.
- Base para experimentos de transferencia o fine-tuning en tareas de imagen o texto corto, dado que los pesos son cargables y la licencia MIT lo permite.

## Benchmarks y rendimiento

Los unicos resultados publicados en la model card son las metricas de validacion de cada artefacto. No se aportan comparaciones con otros modelos.

| Modelo | Dataset | Metrica | Valor | Epocas |
|---|---|---|---|---|
| CNN | CIFAR-10 | val_accuracy | 0.666 | 5 (original: 15) |
| LSTM | SMS Spam Collection | val_accuracy | 0.9641 | no disponible |
| DCGAN | MNIST | no disponible (solo muestra cualitativa) | — | 3 (original: 100) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que estos modelos no son modelos de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible; los modelos estan disenados para ejecutarse en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte CUDA para TensorFlow aceleraria la inferencia, pero no es requisito.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna (e incluso en CPU), dado el caracter reducido de las versiones.
- Opciones de despliegue: TensorFlow/Keras 3 nativo mediante `tf.keras.models.load_model`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a estos formatos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (pesos de portafolio con CNN/LSTM/DCGAN reducidas) ni se aportan metricas frente a alternativas como ResNet, MobileNet, LSTM con embeddings preentrenados o StyleGAN.

## Limitaciones y advertencias

- Los modelos son versiones reducidas: la CNN usa 5 epocas frente a 15 y la DCGAN 3 frente a 100, por lo que la calidad es notablemente inferior a la de los entrenamientos completos.
- La `val_accuracy` de 0.666 en CIFAR-10 esta lejos del estado del arte (los modelos modernos superan el 95 %), lo que limita su uso en produccion.
- La LSTM de spam funciona sobre SMS en ingles del dataset SMS Spam Collection; no se garantiza su comportamiento en otros idiomas ni en dominios distintos.
- La DCGAN solo genera digitos MNIST a baja resolucion y con pocas epocas de entrenamiento; las muestras pueden ser de baja calidad.
- No hay informacion sobre sesgos, ya que no se documentan analisis de fairness ni composicion detallada de los datasets.
- Riesgo de alucinacion no aplicable (no es un modelo generativo de texto); el riesgo equivalente es la generacion de imagenes irreales o la clasificacion erronea en dominios fuera de distribucion.
- El tokenizador se distribuye en pickle, lo que implica riesgos de seguridad al deserializar archivos de origen no confiable; conviene verificar la procedencia antes de cargarlo.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias sobre los pesos ni sobre los resultados.
- El Transformer PT→EN mencionado en la model card no incluye pesos en este repositorio; quien lo necesite debe recurrir al notebook original en Colab.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Hapyr/deep-learning-architectures-weights
- Notebooks originales: `portfolio/projects/deep-learning-architectures/notebooks` (referenciado en la model card, sin URL publica disponible)
- Dataset CIFAR-10 (Keras): no disponible en la informacion proporcionada
- Dataset MNIST (Keras): no disponible en la informacion proporcionada
- Dataset SMS Spam Collection (mirror TSV del tutorial pycon-2016): no disponible en la informacion proporcionada

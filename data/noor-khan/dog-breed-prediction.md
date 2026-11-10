# Noor-Khan/dog-breed-prediction

## Resumen

Dog Breed Prediction es un clasificador de imagenes de razas de perro desarrollado por Noorullah Zamindar (usuario Noor-Khan en Hugging Face) como proyecto de aprendizaje. Se trata de una red neuronal convolucional (CNN) personalizada, construida desde cero con TensorFlow y Keras, sin backbone preentrenado. El modelo solo distingue entre tres razas concretas: scottish_deerhound, maltese_dog y bernese_mountain_dog.

El modelo resuelve un problema de clasificacion de imagenes muy acotado: dada una fotografia de entrada de 224x224 pixeles en RGB, devuelve una distribucion de probabilidad sobre esas tres clases. Con 162.619 parametros totales, es un modelo extremadamente pequeno, pensado para demostrar el flujo completo de entrenamiento, guardado y despliegue de un clasificador de imagenes, no para uso en produccion.

Su relevancia es limitada fuera del ambito educativo: sirve como ejemplo reproducible de pipeline de vision por computador con Keras y como base para quien quiera entender como se entrena una CNN desde cero. No dispone de benchmarks publicados, evaluacion de sesgos ni calibracion, y su conjunto de entrenamiento es muy reducido (357 imagenes).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN personalizada (TensorFlow/Keras), entrenada desde cero sin backbone preentrenado |
| Parametros totales | 162.619 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de clasificacion de imagenes) |
| Licencia | MIT |
| Formato de pesos | `.keras` (formato nativo de Keras) |

## Arquitectura y entrenamiento

La arquitectura es una CNN secuencial compuesta por cuatro bloques convolucionales seguidos de dos capas densas y una capa de salida softmax de tres neuronas. La secuencia exacta es: Conv2D(64, 5x5, ReLU) -> MaxPool -> Conv2D(32, 3x3, ReLU, regularizacion L2) -> MaxPool -> Conv2D(16, 7x7, ReLU, L2) -> MaxPool -> Conv2D(8, 5x5, ReLU, L2) -> MaxPool -> Flatten -> Dense(128, ReLU, L2) -> Dense(64, ReLU, L2) -> Dense(3, softmax). La entrada es una imagen RGB de 224x224 con pixeles reescalados al rango [0, 1]. Se entreno con el optimizador Adam (learning rate 0.0001), perdida de entropia cruzada categorica, 100 epocas y tamano de lote de 128.

Los datos de entrenamiento provienen del dataset de Kaggle `dog-breed-id-from-comp` (catherinehorng/dogbreedidfromcomp), que contiene 10.222 imagenes etiquetadas de 120 razas. Sin embargo, solo se utilizaron tres razas: 357 imagenes en total, repartidas en scottish_deerhound (126), maltese_dog (117) y bernese_mountain_dog (114). La division fue 10% test (36 imagenes), 20% del resto para validacion (unas 65 imagenes) y el resto para entrenamiento (unas 256 imagenes). No se registro la semilla aleatoria de la division ni la fecha exacta de entrenamiento. No consta uso de RLHF, DPO ni tecnicas de aumento de datos mas alla del reescalado.

## Capacidades

- Clasificacion de imagenes de perro en tres razas: scottish_deerhound, maltese_dog y bernese_mountain_dog.
- Devuelve una distribucion de probabilidad sobre las tres clases (suma 1.0), lo que permite interpretar el nivel de confianza.
- Entrada de imagen RGB de 224x224 pixeles con valores normalizados a [0, 1].
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision adicional, audio ni ninguna capacidad especial mas alla de la clasificacion de imagenes.
- Verificado que el modelo carga correctamente con TensorFlow 2.18.0: forma de entrada (None, 224, 224, 3), forma de salida (None, 3).

## Casos de uso

- Demostracion educativa de pipeline de vision por computador: sirve para ilustrar el ciclo completo de entrenamiento, guardado en formato `.keras` y carga para inferencia con Keras y TensorFlow, util en cursos y tutoriales.
- Prototipo de aplicacion web de clasificacion: el autor incluye una app Flask y una demo Gradio en el repositorio de codigo; el modelo puede integrarse en una interfaz sencilla que reciba una foto y muestre la raza predicha entre las tres disponibles.
- Prueba de concepto de clasificacion de razas caninas: util para validar la viabilidad de un enfoque CNN desde cero antes de invertir en un backbone preentrenado o en un dataset mayor.
- Benchmark interno de comparacion de arquitecturas: al ser un modelo pequeno y reproducible, puede servir como linea base para comparar con modelos preentrenados en la misma tarea de tres clases.
- Ejercicio de regularizacion L2 en capas convolucionales y densas: el modelo aplica L2 en varias capas, por lo que es un ejemplo practico para estudiar el efecto de la regularizacion en un dataset pequeno.
- Filtro preliminar en un flujo mas amplio: con las debidas reservas, podria usarse como primer filtro para descartar imagenes que no se parezcan a ninguna de las tres razas, aunque su baja precision y la ausencia de clase "otro" lo hacen poco fiable para este fin.

## Benchmarks y rendimiento

| Metrica | Valor | Notas |
|---|---|---|
| Precision en test | 69,44% | Sobre 36 imagenes; la propia linea `evaluate` del notebook mostraba 0,6817, por lo que el valor es aproximado |
| Precision por raza (precision/recall) | no disponible | No se registraron metricas por clase |
| MMLU / HumanEval / GSM8K | no aplica | Modelo de vision, no de lenguaje |

No se han publicado resultados de benchmarks adicionales en la informacion disponible. La unica prueba verificada es un smoke test sobre la foto de ejemplo del repositorio (`static/uploads/images.jpg`, 183x275), que dio maltese_dog con 76,04% de confianza (scottish_deerhound 13,80%, bernese_mountain_dog 10,16%). La raza real de esa foto no esta registrada, por lo que no constituye una medida de precision.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 162.619 parametros el modelo ocupa unos pocos cientos de kilobytes en memoria.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Una GTX 1650, RTX 3050 o incluso CPU son suficientes para inferencia.
- Cabe en cualquier GPU de consumo e incluso en Raspberry Pi o entornos sin GPU.
- Opciones de despliegue: TensorFlow Serving, Keras nativo, integracion en Flask (como en el repositorio del autor) o Gradio. No es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles de forma oficial; por el tamano del modelo, la inferencia por imagen es del orden de milisegundos en CPU y sub-milisegundo en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Clases | Contexto/Entrada | Precision | Licencia |
|---|---|---|---|---|---|
| Dog Breed Prediction (este) | 162.619 | 3 razas | Imagen 224x224 | ~69% en test de 36 imagenes | MIT |
| ResNet-50 preentrenado (fine-tuned) | ~25,6 M | configurable (hasta 120 razas) | Imagen 224x224 | no disponible en esta ficha | varía (MIT/Apache) |
| MobileNetV2 preentrenado (fine-tuned) | ~3,5 M | configurable | Imagen 224x224 | no disponible en esta ficha | Apache 2.0 |
| EfficientNet-B0 preentrenado (fine-tuned) | ~5,3 M | configurable | Imagen 224x224 | no disponible en esta ficha | Apache 2.0 |

La comparacion con backbones preentrenados es la mas relevante: un MobileNetV2 o EfficientNet-B0 fine-tuneado sobre el mismo dataset de tres razas probablemente superaria ampliamente el 69% de precision con muchas menos imagenes de entrenamiento, gracias al transfer learning. No se dispone de resultados de benchmarks de esos modelos en la informacion proporcionada, por lo que no se ofrecen cifras comparativas concretas.

## Limitaciones y advertencias

- Solo tres razas: cualquier imagen de otra raza o de algo que no sea un perro se fuerza a una de las tres clases, sin opcion de "desconocido".
- Conjunto de entrenamiento muy pequeno (357 imagenes) y test de solo 36 imagenes, lo que hace la precision de ~69% muy incierta y propensa a alta varianza.
- Proyecto de aprendizaje y demostracion, no listo para produccion: sin evaluacion de sesgos, sin calibracion y sin pruebas con imagenes fuera de dominio.
- No se registraron metricas de precision y recall por raza, por lo que se desconoce si hay clases con peor rendimiento.
- La app Flask original del repositorio incluye nombres de raza de relleno (Breed1–Breed5) que no coinciden con el modelo; los nombres correctos son los tres indicados.
- No se conoce la semilla de la division train/validation/test ni la fecha de entrenamiento, lo que dificulta la reproducibilidad exacta.
- Licencia MIT: permite uso comercial, pero dado el caracter de demostracion y la baja precision, no se recomienda su uso en productos reales sin un reentrenamiento sustancial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Noor-Khan/dog-breed-prediction
- Codigo fuente: https://github.com/NoorullahZamindar-007/Dog-Breed-Prediction-App
- Dataset de entrenamiento: https://www.kaggle.com/datasets/catherinehorng/dogbreedidfromcomp (referenciado como catherinehorng/dogbreedidfromcomp)

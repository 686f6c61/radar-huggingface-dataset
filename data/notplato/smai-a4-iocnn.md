# notplato/smai-a4-iocnn

## Resumen

`smai-a4-iocnn` es una red neuronal convexa de entrada-salida (Input-Output Convex Neural Network, IOC-NN) entrenada sobre CIFAR-10 como parte de la asignatura SMAI (Assignment 4, preguntas Q1 y secciones 1.4/1.5). El autor es el usuario de HuggingFace `notplato`. No es un modelo de lenguaje ni un transformer: es un clasificador de imágenes de 10 clases con una arquitectura MLP muy pequena (3072 -> 256 -> 10) que implementa una restriccion de convexidad respecto a la entrada mediante la no negatividad de los pesos de las capas a partir de la segunda.

El interes del artefacto es fundamentalmente didactico y de investigacion: permite reproducir un IOC-NN con una inicializacion y un esquema de proyeccion concretos (pesos negativos de capas >= 2 transformados como `exp(w - 5)` tras cada paso de SGD) y verificar propiedades de convexidad entrada-salida. El repositorio pesa 0.0 GB y contiene unicamente ficheros NumPy (`model.npz`, `preprocessing.npz`) y un `config.json`; no incluye pesos en safetensors ni GGUF, ni tokenizer, ni pipeline de HuggingFace.

No se dispone de informacion sobre licencia, idiomas ni pipeline en la model card ni en los metadatos de HuggingFace. El modelo se publico el 4 de noviembre de 2026 y no registra descargas ni likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP con convexidad entrada-salida (IOC-NN): 3072 -> 256 (ELU) -> 10 (logits) |
| Parametros totales | 3072 x 256 + 256 + 256 x 10 + 10 = 789.002 (aprox.) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imagenes; entrada fija de 3072 valores) |
| Tipos de cuantizacion | no disponible (pesos en NumPy float, sin variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | `.npz` de NumPy (`W0`, `b0`, `W1`, `b1`), mas `preprocessing.npz` y `config.json` |

## Arquitectura y entrenamiento

La red es un perceptron multicapa de dos capas con activacion ELU en la capa oculta y salida lineal de 10 logits, uno por clase de CIFAR-10. La innovacion respecto a un MLP convencional es la restriccion de convexidad entrada-salida: los pesos de las capas a partir de la segunda se mantienen no negativos, de modo que la funcion `f(x) = ELU(xW0 + b0) W1 + b1` es convexa en `x` siempre que ELU sea convexa y no decreciente en el dominio relevante. Para imponer esa no negatividad, el autor inicializa la primera capa con inicializacion tipo MLP y las capas >= 2 con `uniform(0, 2/n_in)`, y tras cada paso de optimizacion aplica la transformacion `w -> exp(w - 5)` a cualquier peso negativo de las capas >= 2.

El entrenamiento usa SGD con learning rate 0.02, batch size 64, 100 epocas y etiquetas verdaderas (no se menciona destilacion ni pseudoetiquetado), con semilla 1146. El preprocesado es explicito: se aplana la imagen 32x32x3 en orden HWC a 3072 valores, se divide entre 255 y se estandariza con la media y la desviacion tipica calculadas sobre las 50.000 imagenes de entrenamiento y almacenadas en `preprocessing.npz`. No se documenta data augmentation, regularizacion, RLHF ni DPO; tampoco se indica el numero de tokens, porque no aplica.

## Capacidades

- Clasificacion de imagenes de CIFAR-10 en 10 clases (avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco, camion).
- Inferencia determinista mediante una unica pasada hacia delante: `logits = ELU(x @ W0 + b0) @ W1 + b1`.
- Garantia estructural de convexidad entrada-salida, util para analisis de robustez y para estudiar propiedades de la funcion aprendida.
- Reproducibilidad completa: semilla, hiperparametros y ficheros de preprocesado incluidos en el repositorio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni procesa texto.
- No tiene modo thinking, vision general, audio ni ninguna modalidad adicional; la "vision" se limita a vectores aplanados de 3072 dimensiones.

## Casos de uso

- Docencia y practicas de SMAI: el repositorio sirve como entrega reproducible de la asignatura, con semilla e hiperparametros fijados, para que el alumnado compare su implementacion con una referencia.
- Estudio de convexidad entrada-salida: investigadores pueden cargar `model.npz` y verificar empiricamente que la funcion es convexa en `x`, o medir como la proyeccion `exp(w - 5)` afecta a la precision.
- Baseline de clasificacion en CIFAR-10: con 789.002 parametros y una sola capa oculta, sirve como cota inferior de rendimiento frente a CNN y transformers de vision en experimentos controlados.
- Analisis de robustez adversarial: la convexidad respecto a la entrada permite acotar el comportamiento bajo perturbaciones y comparar con MLPs no convexos.
- Reproduccion de experimentos de inicializacion: el esquema `uniform(0, 2/n_in)` mas proyeccion exponencial se puede replicar en otros datasets tabulares o de imagenes de baja resolucion.
- Pruebas de integracion de pipelines NumPy: al no depender de PyTorch ni de CUDA, el modelo se puede ejecutar en entornos sin GPU, contenedores minimos o sistemas embebidos para validar el flujo de preprocesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye precision en test, matriz de confusion ni comparacion con otras arquitecturas sobre CIFAR-10.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en float32 (789.002 parametros x 4 bytes, aproximadamente 3,2 MB, mas buffers de entrada de 3072 valores).
- GPU recomendadas: no requiere GPU; cualquier CPU es suficiente. En caso de usar GPU, una GTX 1050 o superior es mas que suficiente.
- Cabe en cualquier GPU consumer, incluida una GTX 1650 o una iGPU moderna; tambien cabe holgadamente en Raspberry Pi.
- Opciones de despliegue: NumPy puro (`np.load` + operaciones matriciales), ONNX Runtime tras conversion manual, o cualquier framework que acepte pesos exportados a formato propio. No hay soporte nativo en vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano, se espera un orden de microsegundos por muestra en CPU, pero no se ha medido ni publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `smai-a4-iocnn` (este) | ~789.002 | 3072 valores (32x32x3 aplanado) | Clasificacion CIFAR-10 | no disponible | HuggingFace, `.npz` |
| MLP estandar CIFAR-10 (referencia tipica) | ~789.000 | 3072 valores | Clasificacion CIFAR-10 | variable | Implementaciones multiples |
| LeNet-5 (CNN clasica) | ~60.000 | 32x32x1 | Clasificacion MNIST/CIFAR | variable | Multiples repositorios |
| ResNet-18 (vision) | ~11,7 M | 224x224x3 | Clasificacion ImageNet | variable | TorchVision, timm |

La comparativa es estructural: no se dispone de resultados de precision para este modelo que permitan una comparacion cuantitativa con las alternativas. La diferencia principal frente a un MLP estandar es la restriccion de convexidad, y frente a CNN y ResNet, la ausencia de sesgo inductivo convolucional y el menor numero de parametros.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde preguntas y no admite prompts.
- La precision en CIFAR-10 no esta publicada; no se debe asumir un rendimiento competitivo frente a CNN.
- La restriccion de convexidad limita la capacidad expresiva del modelo y puede degradar la precision frente a un MLP sin restricciones.
- El preprocesado es obligatorio y especifico: si no se aplica el aplanado HWC, la division entre 255 y la estandarizacion con `preprocessing.npz`, las predicciones no son validas.
- No se especifica licencia, por lo que el uso comercial queda en un limbo legal hasta que el autor la declare.
- No hay informacion sobre sesgos del dataset CIFAR-10 ni sobre el impacto de la proyeccion `exp(w - 5)` en la calibracion de las probabilidades.
- El repositorio no incluye evaluacion en test, matriz de confusion ni curvas de entrenamiento; la verificacion de resultados requiere reentrenar o evaluar por cuenta propia.
- El formato `.npz` no es directamente compatible con pipelines de HuggingFace `transformers` ni con servidores de inferencia estandar.
- El modelo se publico con 0 descargas y 0 likes, sin comunidad que lo valide.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/notplato/smai-a4-iocnn
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la busqueda web.

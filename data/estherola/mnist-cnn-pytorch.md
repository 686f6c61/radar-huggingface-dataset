# estherola/mnist-cnn-pytorch

## Resumen

MNIST Handwritten Digit Classifier (PyTorch CNN) es una red neuronal convolucional de pequeno tamano desarrollada por el usuario de Hugging Face "estherola" como proyecto de aprendizaje. El modelo reconoce digitos manuscritos del 0 al 9 sobre imagenes en escala de grises de 28x28 pixeles, el clasico problema de referencia del dataset MNIST.

No es un modelo de lenguaje ni un modelo generativo: es un clasificador de vision por computador con una arquitectura CNN sencilla (dos bloques convolucionales seguidos de capas densas) entrenada durante 5 epocas con el optimizador Adam. A pesar de su simplicidad, alcanza una precision del 99,14% en el conjunto de test de MNIST, un resultado solido para una arquitectura de este tamano.

Su relevancia es principalmente educativa y de prototipado rapido: sirve como punto de partida para aprender PyTorch, como baseline para comparar arquitecturas mas complejas o como componente de demostracion en aplicaciones que requieran reconocer digitos manuscritos (formularios escaneados, reconocimiento de codigos postales, etc.). Al ser un modelo tan ligero, puede ejecutarse en CPU sin requisitos de hardware destacables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN: 2 x (Conv2d + ReLU + MaxPool) -> Flatten -> Linear(3136, 128) -> ReLU -> Dropout(0.3) -> Linear(128, 10) |
| Parametros totales | no disponible (aprox. 0,4 M estimados segun la arquitectura: 3136 x 128 + 128 x 10 mas filtros convolucionales) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplicable |
| Licencia | MIT |
| Formato de pesos | .pth (checkpoint de PyTorch) |

## Arquitectura y entrenamiento

El modelo es una CNN clasica compuesta por dos bloques de convolucion con activacion ReLU y max pooling, seguidos de un aplanado (flatten) y dos capas totalmente conectadas. La primera capa densa recibe 3136 entradas (que corresponde a 64 canales de 7x7 tras los dos max pooling) y reduce a 128 neuronas, con Dropout del 30% para mitigar el sobreajuste, y una capa final de salida con 10 neuronas, una por digito.

El entrenamiento se realizo sobre el dataset MNIST durante 5 epocas con batch size 64, optimizador Adam con learning rate 0.001 y funcion de perdida CrossEntropyLoss. Las imagenes de entrada se normalizaron con media 0.1307 y desviacion estandar 0.3081, los valores tipicos de MNIST. El formato de entrada es un tensor de 1 x 28 x 28 en escala de grises con el digito en blanco sobre fondo negro. No se ha publicado informacion sobre tecnicas adicionales como aumentacion de datos, decodificacion especulativa ni otros mecanismos de optimizacion.

## Capacidades

- Clasificacion de digitos manuscritos (0-9) en imagenes en escala de grises de 28x28 pixeles.
- Precision del 99,14% en el conjunto de test de MNIST segun el autor.
- Inferencia ligera: ejecutable en CPU gracias a su tamano reducido.
- Carga sencilla mediante `huggingface_hub` y `torch.load` con `map_location="cpu"`.
- No soporta texto, tool calling, agentes ni otras modalidades: es un clasificador de imagen monocanal con clases fijas.

## Casos de uso

- Proyecto educativo de PyTorch: ideal para estudiar el codigo completo de una CNN (definicion, entrenamiento e inferencia) gracias a su arquitectura minimalista y bien documentada.
- Baseline de comparacion: punto de referencia rapido para evaluar arquitecturas mas complejas (ResNet, ViT pequenos) sobre MNIST, dado el 99,14% de precision publicado.
- Reconocimiento de digitos en formularios escaneados: extraccion de digitos individuales (casillas de numeros, importes) previa segmentacion y reescalado a 28x28.
- Lectura de codigos postales manuscritos en sobres o correspondencia digitalizada, siempre que los digitos se aíslen correctamente.
- Prototipado de interfaces de entrada manuscrita: reconocimiento en tiempo real de digitos dibujados en un canvas, viable en CPU con latencia despreciable.
- Demostraciones y tutoriales: componente ligero para ejemplos de despliegue (API REST con FastAPI, apps web) que ilustren el ciclo completo de un modelo de vision.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision en test (MNIST) | 99,14% |

No se han publicado resultados de benchmarks en la informacion disponible para otras metricas ni comparaciones detalladas con otros modelos. Como referencia general del campo, las CNN convencionales sobre MNIST suelen situarse entre el 99% y el 99,8% de precision, por lo que el resultado publicado se encuentra dentro del rango esperable para arquitecturas de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente irrelevante; con unos 0,4 millones de parametros, el modelo ocupa menos de 2 MB en memoria y funciona sin GPU.
- GPU recomendadas: no necesarias. Si se desea aceleracion, cualquier GPU moderna (incluso integradas) es mas que suficiente; el entrenamiento original es reproducible en CPU o en GPUs de consumo como una RTX 3060 o superior.
- Cabe holgadamente en cualquier GPU de consumo, e incluso en dispositivos embebidos y Raspberry Pi dada la carga computacional minima.
- Opciones de despliegue: PyTorch puro (como muestra el ejemplo de la model card), envuelto en una API con FastAPI o Flask, exportable a ONNX para inferencia optimizada, o integrado en apps moviles via PyTorch Mobile. No requiere vLLM, llama.cpp ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles; en CPU moderno la inferencia por imagen es de sub-milisegundo a pocos milisegundos, dado el tamano del modelo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros aprox. | Precision MNIST | Licencia |
|---|---|---|---|---|
| estherola/mnist-cnn-pytorch | CNN 2 conv + 2 densas | ~0,4 M | 99,14% (segun autor) | MIT |
| LeNet-5 (referencia clasica) | CNN 2 conv + 2 densas | ~0,06 M | ~99% | no disponible |
| CNN estandar de tutorial PyTorch (MNIST) | CNN 2 conv + 2 densas | ~0,02-0,4 M | ~98-99% | varia |

No se han publicado comparaciones oficiales del modelo con alternativas concretas; la tabla anterior es contextual. Para precisiones superiores al 99,5% sobre MNIST suelen necesitarse arquitecturas con aumentacion de datos o ensembles.

## Limitaciones y advertencias

- Clasificacion limitada exclusivamente a los 10 digitos (0-9); no reconoce letras, simbolos ni otros grafismos.
- Sensible al formato de entrada: requiere imagenes 1 x 28 x 28 en escala de grises, con digito blanco sobre fondo negro y normalizacion con media 0.1307 y std 0.3081. Entradas con fondo invertido o sin normalizar degradaran gravemente el rendimiento.
- No hay informacion sobre sesgos del modelo; al estar entrenado solo con MNIST, puede rendir peor con estilos de escritura poco representados en el dataset (por ejemplo, ciertos trazos europeos distintos del estilo estadounidense del dataset).
- La precision del 99,14% la reporta el autor; no existe verificacion independiente publicada en la model card.
- Repositorio con 0 descargas y tamano de repo 0,0 GB segun los metadatos: conviene verificar que los pesos (`mnist_cnn.pth`) estan efectivamente disponibles antes de depender de ellos en produccion.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con minima restriccion (conservar el aviso de licencia).
- Al ser un proyecto de aprendizaje, no hay garantias de mantenimiento, versionado ni documentacion de entrenamiento reproducible mas alla de lo indicado en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/estherola/mnist-cnn-pytorch
- Dataset MNIST: https://huggingface.co/datasets/mnist
- No se han encontrado enlaces adicionales (paper, blog o demo) en la informacion disponible.

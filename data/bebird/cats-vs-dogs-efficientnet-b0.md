# bebird/cats-vs-dogs-efficientnet-b0

## Resumen

El modelo `bebird/cats-vs-dogs-efficientnet-b0` es un clasificador binario de imagenes de gatos y perros publicado en Hugging Face por el usuario bebird. Se trata de un EfficientNet-B0 de torchvision, preentrenado en ImageNet y afinado sobre el conjunto de datos "Cats and Dogs" de Microsoft/Kaggle. El modelo resuelve una tarea muy acotada: dada una fotografia, devolver la probabilidad de que contenga un gato o un perro. No es un modelo generativo ni un modelo de lenguaje, sino una red convolucional de vision con una cabeza de clasificacion de dos clases.

La relevancia del modelo es practica y acotada: sirve como ejemplo reproducible de fine-tuning de una CNN ligera, con un pipeline de exportacion a ONNX verificado y una demo web funcional. El autor documenta con detalle el proceso de limpieza de datos, el esquema de particion 80/10/10 y las dos fases de entrenamiento. El repositorio tiene un tamano de 0.0 GB segun los metadatos de Hugging Face, lo que sugiere que los pesos no estan alojados en el repositorio o que el calculo de tamano no se ha actualizado; los ficheros citados en la model card son `best_model.pt` y `model.onnx`.

La arquitectura es EfficientNet-B0, una CNN con compound scaling, con una entrada de 224x224 píxeles y normalizacion ImageNet. El modelo solo dispone de dos clases de salida y no soporta ninguna otra tarea de vision. La licencia no esta declarada y los idiomas no aplican, al no ser un modelo de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 (CNN, torchvision) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (clasificacion de imagenes) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `state_dict` (`best_model.pt`) y ONNX (`model.onnx`) |

## Arquitectura y entrenamiento

La red base es EfficientNet-B0, una CNN con bloques MBConv y compound scaling, cargada con pesos preentrenados de ImageNet desde torchvision. Sobre ella se anade una cabeza de clasificacion de dos clases (gato, perro). La entrada es una imagen redimensionada a 256 píxeles, recortada al centro a 224x224 y normalizada con la media y desviacion tipica de ImageNet.

El entrenamiento se realizo en dos fases. En la fase 1 se entreno unicamente la nueva cabeza de dos clases durante 3 epocas con AdamW y learning rate 1e-3. En la fase 2 se afino la red completa con learning rate 1e-4, conservando la mejor epoca segun validacion. Se aplico aumento de datos con random resized crop y volteo horizontal, y se uso precision mixta sobre una GPU RTX 3050. El conjunto de datos consta de 24.741 fotos utilizables tras eliminar 259 ficheros corruptos, falsos o duplicados, con una particion estratificada 80/10/10 (semilla 42) que garantiza que ninguna foto aparece en mas de un split. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un clasificador de vision.

## Capacidades

- Clasificacion binaria de imagenes: devuelve probabilidades para las clases Cat y Dog.
- Inferencia en PyTorch mediante `best_model.pt`, que devuelve puntuaciones sin normalizar.
- Inferencia en ONNX mediante `model.onnx`, que incluye softmax y devuelve probabilidades directamente.
- Entrada ONNX: tensor `image` de forma N x 3 x 224 x 224; salida `probabilities` de forma N x 2 en orden Cat, Dog.
- Ejecucion en navegador mediante ONNX Runtime Web, segun la demo del autor.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingues ni de texto.
- No dispone de modo thinking, vision general, audio ni otras modalidades.

## Casos de uso

- Clasificacion de fotos en una aplicacion movil o web: el modelo ONNX se puede ejecutar en el navegador con ONNX Runtime Web, como demuestra la demo del autor, sin necesidad de backend.
- Filtrado automatico de imagenes en un pipeline de datos: util para separar fotos de gatos y perros antes de un etiquetado manual o de un entrenamiento posterior.
- Demo educativa de fine-tuning: el codigo del repositorio y la model card documentan el proceso completo, desde la limpieza del dataset hasta la exportacion ONNX verificada, lo que lo hace adecuado para talleres y cursos.
- Prueba de concepto de despliegue en produccion: al tener una version ONNX con softmax integrado y una verificacion de equivalencia frente a PyTorch en 2.474 fotos, sirve como ejemplo de pipeline de exportacion y validacion.
- Clasificacion por lotes en CPU: EfficientNet-B0 es una red ligera, adecuada para procesar lotes de imagenes en entornos sin GPU.
- Juguete de referencia para comparar frameworks: permite contrastar la inferencia en PyTorch, ONNX Runtime y ONNX Runtime Web sobre el mismo conjunto de prueba.

## Benchmarks y rendimiento

| Split | Fotos | Accuracy |
|---|---|---|
| Validacion (usado para elegir la mejor epoca) | 2.474 | 98,99% |
| Test (nunca usado en entrenamiento ni seleccion) | 2.474 | 98,95% |

En el conjunto de test, 10 gatos se predijeron como perros y 16 perros como gatos. El autor senala que parte de esos 26 errores son problemas del propio dataset: un beagle etiquetado como gato, un marcador "No Photo Available" y fotos con ambos animales. La exportacion ONNX se verifico contra PyTorch en las 2.474 fotos de test, con la misma respuesta en todas y probabilidades con una diferencia maxima de 0,000003. En el navegador, el redimensionado de imagen difiere ligeramente del de Python, lo que cambio la respuesta en 5 fotos limite; la version web tambien alcanza 98,95%.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de EfficientNet-B0, la huella es reducida y cabe holgadamente en GPUs de consumo.
- GPU de entrenamiento documentada: RTX 3050 con precision mixta.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente para inferencia; no se documentan requisitos especificos para A100, H100 o RTX 4090.
- Cabe en GPU consumer: si, segun el entrenamiento documentado en una RTX 3050.
- Opciones de despliegue: PyTorch (carga de `best_model.pt`), ONNX Runtime y ONNX Runtime Web (demo en navegador). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases | Dataset | Accuracy | Licencia | Formato |
|---|---|---|---|---|---|---|
| bebird/cats-vs-dogs-efficientnet-b0 | EfficientNet-B0 (PyTorch) | 2 (Cat, Dog) | Cats and Dogs (Kaggle/Microsoft) | 98,95% en test | no disponible | PyTorch, ONNX |
| nipunsgeeth/Cats_vs_Dogs_cnn_v2 | EfficientNet-B0 (TensorFlow) | 2 (Cat, Dog) | cats_vs_dogs (TFDS) | no disponible | no disponible | no disponible |
| EfficientNet-B0 original (torchvision) | EfficientNet-B0 | 1.000 (ImageNet) | ImageNet | no disponible en esta ficha | licencia de torchvision | PyTorch |

La comparativa se limita a alternativas encontradas en la busqueda web. No se dispone de datos de accuracy para `nipunsgeeth/Cats_vs_Dogs_cnn_v2` ni para el EfficientNet-B0 original en esta tarea concreta.

## Limitaciones y advertencias

- El modelo solo conoce dos clases: cualquier imagen que no sea un gato o un perro se etiquetara igualmente como una de las dos.
- Es menos fiable en fotos oscuras, borrosas o de muy baja resolucion.
- Es menos fiable en fotos que contienen ambos animales a la vez.
- El autor documenta errores atribuibles al dataset de origen (etiquetas incorrectas, marcadores de imagen no disponible, fotos con ambos animales).
- La licencia no esta declarada, por lo que no se puede confirmar el uso comercial sin consultar al autor.
- No se documentan sesgos especificos mas alla de los derivados del dataset de origen.
- Riesgo de alucinacion no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea confiada en imagenes fuera de distribucion.
- La diferencia de redimensionado entre Python y el navegador puede alterar la prediccion en casos limite.
- No hay informacion sobre cuantizacion ni sobre rendimiento en hardware distinto de la RTX 3050 usada en entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bebird/cats-vs-dogs-efficientnet-b0
- Demo web: https://huggingface.co/spaces/bebird/cat-or-dog
- Codigo: https://github.com/katts-69/cats-vs-dogs-classifier
- Alternativa comparable: https://huggingface.co/nipunsgeeth/Cats_vs_Dogs_cnn_v2
- Tutorial de EfficientNet-B0 con TensorFlow y OpenCV: https://eranfeit.net/how-to-classify-images-using-efficientnet-b0/

# lakshitha1629/Canine-Skin-Image-Classifier

## Resumen

Canine-Skin-Image-Classifier es un clasificador de imagenes de piel canina publicado por el usuario lakshitha1629 en Hugging Face. Se trata de un checkpoint de Keras (formato HDF5, `keras_model.h5`, 2,45 MB) que actua como espejo del modelo entrenado en el proyecto de GitHub Pet_Disease_Detection. El modelo resuelve una tarea binaria muy acotada: asignar una imagen RGB de piel de perro a una de dos clases, CanineImpetigo (indice 0) o CanineLupus (indice 1).

El modelo no es una arquitectura de lenguaje ni un modelo fundacional: es un clasificador de vision de proposito educativo y de demostracion. El preprocesado documentado por el autor redimensiona la imagen a 224 x 224, la convierte a float32 y normaliza los pixeles con `(pixel / 127.0) - 1`, alimentando un tensor de forma `(1, 224, 224, 3)`. La salida se interpreta tomando el indice 1 con umbral 0,5 como CanineLupus.

Su relevancia es limitada y fundamentalmente divulgativa: ilustra un flujo completo de entrenamiento con Keras para una tarea de clasificacion de imagenes medicas veterinarias. El propio autor advierte que se trata de una demostracion de proyecto y que no debe usarse para diagnosticar animales ni para elegir tratamientos. No se documentan procedencia de las imagenes, tamano del dataset, metricas de evaluacion ni rendimiento sobre imagenes independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint Keras; el autor no especifica la red base) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada 224 x 224 x 3) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen, sin componente de texto) |
| Licencia | no disponible |
| Formato de pesos | HDF5 de Keras (`keras_model.h5`), 2,45 MB |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura concreta del checkpoint. El autor solo indica que es un modelo Keras de clasificacion de imagenes y que proviene de la carpeta `Keras AI Part` del repositorio Pet_Disease_Detection. No se especifica si se trata de una CNN entrenada desde cero, de una red preentrenada con ajuste fino (por ejemplo, MobileNet, EfficientNet o ResNet) ni de cualquier otra variante. El tamano del fichero (2,45 MB) sugiere un modelo de baja capacidad, pero este dato no permite inferir la arquitectura con rigor.

Tampoco se documentan el numero de imagenes de entrenamiento, su procedencia, la composicion del dataset, el esquema de aumentacion de datos, la funcion de perdida, el optimizador ni si hubo validacion cruzada. No hay evidencia de tecnicas de regularizacion, calibracion o evaluacion sobre un conjunto de test independiente. El autor reconoce explicitamente que no ha realizado pruebas de inferencia independientes para verificar el comportamiento del modelo.

## Capacidades

- Clasificacion binaria de imagenes de piel canina en dos clases: CanineImpetigo y CanineLupus.
- Entrada de imagen RGB redimensionada a 224 x 224 y normalizada a rango aproximado [-1, 1].
- Salida de dos valores (indices 0 y 1), con umbral 0,5 sobre el indice 1 para decidir CanineLupus.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo thinking, vision general, audio ni ninguna otra modalidad.

## Casos de uso

- Demostracion educativa de un pipeline de clasificacion de imagenes con Keras: sirve para mostrar el flujo de carga de un `.h5`, preprocesado de imagen y lectura de la salida en un curso o tutorial.
- Prototipo de investigacion sobre clasificacion de lesiones dermatologicas caninas: puede utilizarse como punto de partida para reproducir el experimento del repositorio y comparar con otros enfoques.
- Prueba de concepto en un entorno de laboratorio veterinario: permite validar la viabilidad tecnica de un clasificador binario antes de invertir en un dataset anotado y un entrenamiento supervisado real.
- Benchmark interno de infraestructura de inferencia Keras: al ser un modelo pequeno, es util para comprobar el funcionamiento de TensorFlow/Keras en un entorno de despliegue concreto.
- Material de comparacion en estudios sobre IA veterinaria: puede citarse como ejemplo de modelo de demostracion frente a trabajos revisados por pares con validacion clinica.
- Integracion en una aplicacion de demostracion o notebook interactivo: permite ilustrar la salida de un clasificador de imagenes sin necesidad de infraestructura pesada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no documenta exactitud, precision, recall, F1, AUC ni matriz de confusion, ni sobre el conjunto de entrenamiento ni sobre un conjunto de test. Tampoco se han encontrado metricas en la busqueda web que correspondan a este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, inferior a 1 GB, dado el tamano del fichero (2,45 MB) y la entrada de 224 x 224.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con soporte CUDA, e incluso en CPU para inferencia puntual.
- Opciones de despliegue: Keras/TensorFlow nativo (carga de `.h5`), conversion a TensorFlow Lite o TensorFlow.js para entornos ligeros. No es compatible directamente con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Canine-Skin-Image-Classifier (lakshitha1629) | Clasificador Keras de imagenes | 2 (CanineImpetigo, CanineLupus) | 224 x 224 x 3 | no disponible | Hugging Face, 0 descargas |
| Estudio Wiley sobre identificacion de lesiones cutaneas caninas con IA (Veterinary Dermatology) | Modelo de investigacion publicado | Identificacion a nivel de lesion | no disponible | no disponible | Publicacion revisada por pares |
| Clasificacion de enfermedades cutaneas caninas con imagen multiespectral (ResearchGate) | Modelo de investigacion | 3 (dermatosis bacteriana, infeccion fungica, hipersensibilidad) | Imagenes multiespectrales | no disponible | Publicacion cientifica |

La comparacion es cualitativa: los trabajos academicos citados cuentan con validacion y descripcion metodologica, mientras que este checkpoint carece de metricas y de documentacion sobre el dataset. No se dispone de datos numericos comparables.

## Limitaciones y advertencias

- El autor advierte explicitamente que el modelo es una demostracion de proyecto y que no debe usarse para diagnosticar animales ni para elegir tratamientos.
- No se documenta la procedencia de las imagenes de entrenamiento, el tamano del dataset ni el esquema de anotacion, por lo que se desconoce el sesgo potencial del modelo.
- No hay metricas de evaluacion ni validacion sobre imagenes independientes; el rendimiento real es desconocido.
- Riesgo alto de alucinacion en el sentido de clasificaciones erroneas con alta confianza, dado que no hay calibracion documentada.
- La carga del modelo HDF5 puede depender de las versiones de Keras/TensorFlow usadas al guardarlo; puede fallar en versiones recientes.
- La licencia no esta disponible, lo que impide determinar si el uso comercial esta permitido.
- Solo cubre dos enfermedades concretas; no es un clasificador general de dermatologia veterinaria.
- No hay soporte documentado para otros formatos de imagen distintos del RGB redimensionado a 224 x 224.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de uso o validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lakshitha1629/Canine-Skin-Image-Classifier
- Repositorio GitHub del proyecto: https://github.com/lakshitha1629/Pet_Disease_Detection
- Notebook de entrenamiento: https://github.com/lakshitha1629/Pet_Disease_Detection/blob/master/Keras%20AI%20Part/AI.ipynb
- Checkpoint original: https://github.com/lakshitha1629/Pet_Disease_Detection/blob/master/Keras%20AI%20Part/keras_model.h5
- Etiquetas: https://github.com/lakshitha1629/Pet_Disease_Detection/blob/master/Keras%20AI%20Part/labels.txt
- Estudio relacionado (Veterinary Dermatology): https://onlinelibrary.wiley.com/doi/10.1111/vde.70083
- Estudio relacionado (ResearchGate): https://www.researchgate.net/publication/360846292_Classification_of_dog_skin_diseases_using_deep_learning_with_images_captured_from_multispectral_imaging_device

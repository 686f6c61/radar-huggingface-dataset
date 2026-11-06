# an1sh15/smai-a4-ioc-p0

## Resumen

El modelo `smai-a4-ioc-p0`, publicado por el usuario an1sh15 en Hugging Face, es un clasificador de imagenes de CIFAR-10 basado en un perceptron multicapa (MLP) de dos capas. Se trata de un artefacto academico derivado de la asignatura SMAI (Asignacion 4, pregunta 1, seccion 1.4.2), no de un modelo de lenguaje ni de un sistema de proposito general. Su interes es fundamentalmente didactico: ilustra una variante de red neuronal con restricciones de monotonia en la segunda capa de pesos, denominada IOC-NN (Input-Output Convex Neural Network), que fuerza a que cada logit de salida sea una funcion convexa de la entrada.

La arquitectura es deliberadamente simple: una capa `Linear(3072, 128)` seguida de activacion ELU y una capa `Linear(128, 10)`, con un total de 394.634 parametros. La peculiaridad tecnica reside en que, tras cada paso de SGD, cualquier peso negativo de la segunda capa se sustituye por `e^(w-5)`, garantizando que todos los pesos de esa capa sean no negativos y, por tanto, que la funcion que mapea entrada a logits sea convexa. El modelo opera sobre imagenes de 32x32x3 aplanadas en vectores de 3072 dimensiones, previamente normalizadas.

No es un modelo adecuado para tareas de generacion de texto, razonamiento, codigo ni agentes. Su unico pipeline declarado es `image-classification` sobre el dataset CIFAR-10, con una precision de test de 0,4833 tras 100 epocas, lo que refleja el caracter experimental y limitado del entrenamiento. El repositorio ocupa 0.0 GB y no cuenta con descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (MLP) con restriccion de convexidad en la segunda capa (IOC-NN) |
| Parametros totales | 394.634 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (clasificador de imagenes, no modelo de secuencia) |
| Tipos de cuantizacion | No disponible (pesos en float64 durante entrenamiento; no se documentan cuantizaciones) |
| Idiomas soportados | No disponible (no procesa texto) |
| Licencia | No disponible |
| Formato de pesos | `model.pt` (PyTorch `state_dict`), `model.npz` (NumPy), `preprocessing.npz` (media y desviacion tipica) |

## Arquitectura y entrenamiento

La red es un `nn.Sequential` compuesto por `Linear(3072, 128) -> ELU -> Linear(128, 10)`. La entrada es una imagen CIFAR-10 de 32x32x3 (uint8, orden altura x anchura x canal) aplanada a 3072 valores, dividida por 255 y estandarizada por columna usando la media y la desviacion tipica calculadas sobre las 50.000 imagenes de entrenamiento de CIFAR-10 (las columnas con desviacion tipica cero usan 1). Las 10 salidas son logits que se entrenan con entropia cruzada softmax.

La innovacion tecnica es la restriccion IOC: tras cada paso de SGD, cada peso negativo `w` de la segunda capa se reemplaza por `e^(w-5)`, de modo que todos los pesos de esa capa quedan en el rango no negativo y cada logit de salida resulta ser una funcion convexa de la entrada. El entrenamiento usa SGD con tasa de aprendizaje 0,01, tamano de lote 64, acumulacion de gradiente 1, 100 epocas sin parada temprana, precision float64 y `torch.manual_seed(seed + 1)` para la inicializacion. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion, algo esperable en un clasificador de imagenes.

## Capacidades

- Clasificacion de imagenes de 32x32x3 en las 10 clases de CIFAR-10 (avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco, camion).
- Generacion de logits por clase, aptos para derivar probabilidades mediante softmax.
- Funcion de decision convexa respecto a la entrada en cada logit, propiedad util para analisis de robustez y certificacion.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni procesa texto.
- No dispone de modo thinking, vision general, audio ni otras capacidades especiales.

## Casos de uso

- Docencia y practicas de aprendizaje profundo: el modelo sirve como ejemplo minimo y reproducible de un MLP con restricciones estructurales sobre CIFAR-10, util en asignaturas de introduccion al aprendizaje automatico.
- Estudio de redes convexas: investigadores que analicen propiedades de convexidad entrada-salida pueden usar este checkpoint como referencia para comparar con variantes no restringidas.
- Baseline de clasificacion de imagenes de baja resolucion: con 394.634 parametros y una precision de test de 0,4833, sirve como linea base rapida en experimentos con CIFAR-10 antes de pasar a CNN o transformers visuales.
- Verificacion de pipelines de preprocesado: el archivo `preprocessing.npz` con media y desviacion tipica permite validar implementaciones de normalizacion por columna en otros proyectos.
- Pruebas de despliegue ligero en CPU: al ser un MLP de menos de 400.000 parametros, puede ejecutarse en entornos sin GPU para validar flujos de inferencia con PyTorch o NumPy.
- Analisis de robustez y monotonia: la restriccion de pesos no negativos facilita experimentos sobre como la convexidad afecta a la sensibilidad frente a perturbaciones de la entrada.

## Benchmarks y rendimiento

Resultados reportados por el autor tras 100 epocas de entrenamiento:

| Metrica | Valor |
|---|---|
| Precision de entrenamiento | 0,7898 |
| Precision de test | 0,4833 |
| Perdida de entrenamiento | 0,6129 |
| Perdida de test | 2,1869 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en float32 (394.634 parametros x 4 bytes, mas buffers intermedios minimos); en float64, alrededor de 3,2 MB solo para los pesos.
- GPU recomendadas: cualquier GPU moderna es sobredimensionada; el modelo funciona sin problemas en CPU.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU con soporte PyTorch; tambien en Raspberry Pi.
- Opciones de despliegue: PyTorch nativo (`model.pt`), NumPy (`model.npz`) o exportacion a ONNX; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano, se espera latencia de microsegundos a milisegundos por lote en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision test CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smai-a4-ioc-p0 | 394.634 | No aplica | 0,4833 | No disponible | Hugging Face (0 descargas) |
| MLP estandar equivalente | ~394.634 | No aplica | No disponible | No disponible | Generico |
| LeNet-5 | ~60.000 | No aplica | ~0,70 (referencia historica) | No disponible | Multiples implementaciones |
| ResNet-18 | ~11,2 M | No aplica | ~0,93-0,95 (referencia) | No disponible | Multiples implementaciones |

Las cifras de LeNet-5 y ResNet-18 son referencias habituales de la literatura sobre CIFAR-10 y no provienen de la informacion proporcionada; se incluyen solo como orientacion de magnitud. No se dispone de comparaciones directas publicadas para este checkpoint concreto.

## Limitaciones y advertencias

- Precision de test limitada (0,4833), insuficiente para aplicaciones reales de clasificacion; el modelo esta infraentrenado o limitado por su arquitectura MLP.
- Brecha notable entre precision de entrenamiento (0,7898) y de test (0,4833), con perdida de test muy superior (2,1869 frente a 0,6129), lo que sugiere sobreajuste.
- La restriccion de convexidad limita la expresividad del modelo y puede degradar el rendimiento frente a un MLP sin restricciones.
- Sesgos conocidos: no documentados; al entrenarse solo con CIFAR-10, hereda los sesgos de ese dataset (clases desbalanceadas, imagenes de baja resolucion, contexto academico).
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero puede producir clasificaciones erroneas con alta confianza en imagenes fuera de distribucion.
- Limitaciones de contexto o idioma: no procesa texto ni secuencias; solo imagenes de 32x32x3.
- Restricciones de licencia para uso comercial: la licencia no esta disponible, por lo que no se puede asumir permiso de uso comercial.
- Caveat para produccion: repositorio con 0 descargas y 0 likes, sin mantenimiento documentado; los pesos estan en float64, lo que requiere conversion a float32 para despliegues eficientes.
- El nombre y la model card lo identifican como entrega academica, sin garantias de soporte ni documentacion adicional.

## Enlaces

- Hugging Face: https://huggingface.co/an1sh15/smai-a4-ioc-p0
- Dataset CIFAR-10: https://huggingface.co/datasets/uoft-cs/cifar10
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.

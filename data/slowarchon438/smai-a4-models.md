# SlowArchon438/smai-a4-models

## Resumen

SMAI Monsoon 2026 - Assignment 4 Models es una coleccion de tres modelos de clasificacion de imagenes entrenados sobre CIFAR-10, publicados por el usuario SlowArchon438 como material de una asignacion academica del curso SMAI (Monsoon 2026). No se trata de un modelo de lenguaje ni de un modelo fundacional: son perceptrones multicapa (MLP) de pequeno tamano que operan sobre imagenes de 32x32x3 aplanadas en vectores de 3072 dimensiones y producen 10 clases. El repositorio tiene un tamano de 0.0 GB y cero descargas, lo que refleja su naturaleza de entrega de deberes mas que de artefacto listo para produccion.

Los tres modelos comparten la misma arquitectura 3072 -> 128 -> 64 -> 10, pero difieren en el framework de implementacion (NumPy puro frente a PyTorch), en la funcion de activacion oculta (ReLU frente a ELU) y en el tipo de entrenamiento (etiquetas limpias frente a un esquema IOC-NN con restricciones de no negatividad en los pesos). El interes tecnico esta en el modelo IOC-NN, que impone pesos no negativos en las capas a partir de la segunda, una tecnica relacionada con las redes neuronales interpretables por construccion (IOC-NN, *Interpretable-by-Design Convex Neural Networks*).

Es relevante ahora unicamente como referencia pedagogica o como punto de comparacion para experimentos docentes sobre interpretabilidad y preprocesado. No compite con modelos generativos ni con clasificadores de vision modernos: es un baseline de juguete sobre CIFAR-10 con 402.250 parametros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP denso (3072 -> 128 -> 64 -> 10) |
| Parametros totales | 402.250 (pesos y sesgos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imagenes, entrada fija 32x32x3) |
| Tipos de cuantizacion | no disponible (pesos en `.npz`, presumiblemente float64 por el preprocesado descrito) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `.npz` (NumPy archive) |

## Arquitectura y entrenamiento

Los tres modelos son perceptrones multicapa totalmente conectados con dos capas ocultas de 128 y 64 neuronas y una capa de salida de 10 unidades. La entrada es un vector aplanado de 3072 valores (32x32x3) escalado a float64 en el rango [0, 1] dividiendo por 255.0, seguido de estandarizacion columna a columna con media cero y varianza unitaria calculada estrictamente sobre el conjunto de entrenamiento; las columnas de varianza cero usan divisor 1 para evitar divisiones por cero. La inicializacion de pesos es He normal con varianza 2/n_in y sesgos a cero.

El primer modelo (`selected_numpy_mlp.npz`) es una implementacion en NumPy puro con activacion ReLU en las capas ocultas y activacion identidad en la salida, entrenado con entropia cruzada categorica. El segundo (`pytorch_mlp_p0.npz`) es un baseline en PyTorch con la misma arquitectura y activacion ReLU, entrenado durante 100 epocas con etiquetas limpias de CIFAR-10 (p = 0, es decir, sin ruido de etiqueta). El tercero (`pytorch_ioc_p0.npz`) es un modelo IOC-NN con activacion ELU en las capas ocultas, logits convexos pre-softmax en la salida y una restriccion de no negatividad en los pesos de las capas l >= 2, aplicada mediante `W >= 0` y reinicio con `e^(w-5)` tras cada actualizacion; tambien se entrena 100 epocas con etiquetas limpias.

La innovacion tecnica destacable es precisamente esa restriccion de no negatividad en el modelo IOC-NN, que convierte la red en una funcion convexa por capas y facilita la interpretacion de las contribuciones de cada neurona. No hay datos sobre el numero total de tokens (no aplica), la composicion del dataset mas alla de CIFAR-10, ni sobre el uso de RLHF o DPO.

## Capacidades

- Clasificacion de imagenes de 32x32x3 en 10 clases de CIFAR-10 (avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco, camion).
- Inferencia sobre vectores aplanados de 3072 dimensiones con preprocesado especifico (escalado a [0,1] y estandarizacion por columnas).
- Implementacion en NumPy puro en uno de los modelos, lo que permite ejecucion sin dependencias de frameworks de deep learning.
- Modelo IOC-NN con pesos no negativos en capas profundas, orientado a interpretabilidad.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No dispone de modo thinking, vision mas alla de la clasificacion, audio ni generacion de texto.

## Casos de uso

- Docencia de fundamentos de deep learning: el modelo NumPy puro sirve para ilustrar forward pass, backward pass y entrenamiento sin autograd, al estar implementado con operaciones basicas de NumPy.
- Comparacion de frameworks: el par `selected_numpy_mlp.npz` frente a `pytorch_mlp_p0.npz` permite contrastar una implementacion manual con una de PyTorch sobre la misma arquitectura y mismos datos.
- Estudio de interpretabilidad: el modelo IOC-NN con pesos no negativos permite analizar como contribuye cada neurona a la decision final, util en asignaturas de explicabilidad.
- Baseline de clasificacion en CIFAR-10: sirve como referencia inferior para comparar con CNN y transformers de vision en experimentos academicos.
- Validacion de pipelines de preprocesado: el detalle de escalado y estandarizacion por columnas permite reproducir exactamente el flujo de datos en otros experimentos.
- Prototipado rapido en entornos sin GPU: al ser un MLP de 402.250 parametros, la inferencia es trivial en CPU y no requiere acelerador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye precision, perdida, matriz de confusion ni comparaciones numericas sobre el conjunto de test de CIFAR-10.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene 402.250 parametros y los pesos en `.npz` ocupan del orden de unos pocos megabytes en float64.
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente. Si se desea acelerar, una GTX 1650 o superior es mas que suficiente.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU con soporte de NumPy.
- Opciones de despliegue: carga directa con `numpy.load` para el modelo NumPy; `torch.load` o conversion desde `.npz` para los modelos PyTorch. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano, la inferencia por lote pequeno deberia ser del orden de microsegundos a milisegundos en CPU, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| SMAI A4 MLP (este) | 402.250 | 32x32x3 fija | MIT | HuggingFace, 0 descargas |
| LeNet-5 (referencia historica) | ~60.000 | 32x32x1 | variable | multiple |
| ResNet-18 (referencia CIFAR) | ~11,2 M | 32x32x3 | BSD-3 / MIT segun implementacion | torchvision |
| ViT-small (referencia) | ~22 M | 224x224x3 o adaptada | Apache 2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativo del modelo publicado, por lo que la comparacion se limita a parametros, entrada y licencia. Frente a LeNet-5, el MLP tiene mas parametros pero carece de sesgo inductivo convolucional, lo que en CIFAR-10 suele traducirse en peor precision. Frente a ResNet-18 o ViT-small, la diferencia de capacidad es de uno a dos ordenes de magnitud.

## Limitaciones y advertencias

- Es un clasificador de imagenes de juguete, no un modelo de lenguaje: no genera texto, no razona y no soporta instrucciones.
- No hay metricas publicadas de precision ni de perdida, por lo que no se puede evaluar su calidad real sobre CIFAR-10.
- El modelo IOC-NN impone pesos no negativos en capas profundas, lo que restringe la expresividad y puede degradar la precision frente al baseline ReLU.
- El preprocesado es especifico (float64, escalado a [0,1], estandarizacion por columnas con estadisticas de entrenamiento); usarlo con otra normalizacion produce resultados invalidos.
- No se documentan sesgos, pero CIFAR-10 es un dataset pequeno y desbalanceado en dificultad por clase, lo que puede sesgar el comportamiento por categoria.
- Riesgo de alucinacion no aplica al no ser generativo; el riesgo equivalente es la clasificacion erronea sin calibracion documentada.
- La licencia MIT permite uso comercial, pero el modelo no esta pensado ni validado para produccion.
- El repositorio tiene 0 descargas y 0 likes, sin mantenimiento ni issues documentados; la fecha de creacion (2026-11-02) es posterior a la de esta ficha, lo que sugiere que puede tratarse de un artefacto de curso sin soporte.
- No hay informacion sobre el conjunto de validacion/test usado ni sobre semillas de entrenamiento, lo que impide reproducir los resultados.

## Enlaces

- HuggingFace: https://huggingface.co/SlowArchon438/smai-a4-models
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.

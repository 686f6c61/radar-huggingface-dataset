# quake3player/smai-a4-cifar10-iocnn

## Resumen

IOC-NN (ELU) para CIFAR-10 es una red neuronal completamente conectada (MLP) de tres capas entrenada desde cero para clasificar imagenes del conjunto CIFAR-10 (32x32x3, 10 clases). El modelo lo publica el usuario `quake3player` como parte de la asignatura SMAI (Statistical Methods in Artificial Intelligence), en concreto la Assignment 4, pregunta Q1.5, y no guarda relacion con ningun modelo fundacional ni con tareas de generacion de lenguaje.

La relevancia tecnica del artefacto es acotada: se trata de un ejercicio academico que implementa una restriccion de no negatividad sobre los pesos de las capas ocultas y de salida (los pesos negativos se transforman mediante `exp(w-5)` tras cada paso de optimizacion). Esta restriccion es la que da nombre al modelo (IOC-NN), y el resultado es un clasificador de imagenes de baja capacidad con una precision de test de 0,4469 sobre CIFAR-10.

El modelo no es un LLM: no tiene tokenizador, no procesa texto, no soporta tool calling ni agentes, y su unico proposito es la clasificacion de imagenes de 32x32 píxeles en las diez clases de CIFAR-10. Se distribuye como pesos en formato NPZ (NumPy) y se corresponde con un experimento docente reproducible, no con un artefacto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP totalmente conectada, 3 capas densas (3072 -> 512 -> 256 -> 10) |
| Parametros totales | 1.707.786 (calculado a partir de las dimensiones declaradas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imagenes, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en float64, formato NPZ) |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | NPZ (NumPy): `W{i}` con forma (in, out) y `b{i}`; `logits = h @ W + b` |
| Entrada | imagen 32x32x3 aplanada a 3072, dividida por 255 y estandarizada con media/std de `preprocessing.npz` |
| Activacion oculta | ELU |
| Activacion de salida | identidad (logits) |
| Funcion de perdida | entropia cruzada categorica |
| Framework de entrenamiento | PyTorch (float64) |
| Precision en test | 0,4469 (44,69 %) sobre CIFAR-10 |

## Arquitectura y entrenamiento

La red es un perceptron multicapa con dos capas ocultas de 512 y 256 unidades respectivamente, activacion ELU en las capas ocultas y salida lineal de 10 logits. La entrada es la imagen aplanada (32x32x3 = 3072 valores) tras normalizacion: division por 255 y estandarizacion con la media y la desviacion tipica calculadas sobre la particion de entrenamiento de CIFAR-10, con proteccion frente a desviacion cero (se sustituye por 1). No hay capas convolucionales, pooling, dropout ni normalizacion por lotes.

El entrenamiento se realizo con SGD (learning rate 0,02, batch size 64, sin acumulacion de gradientes) durante 100 epocas, semilla 2049, sobre la particion de entrenamiento de `uoft-cs/cifar10` con etiquetas verdaderas (p = 0). La innovacion declarada es la restriccion IOC: los pesos de las capas a partir de la segunda se mantienen no negativos, aplicando `exp(w-5)` a cualquier peso negativo tras cada paso de optimizacion. No se especifica el numero total de tokens ni composicion de dataset mas alla de CIFAR-10, ni si hubo aumentacion de datos, weight decay o scheduler.

## Capacidades

- Clasificacion de imagenes de 32x32x3 en las 10 clases de CIFAR-10 (avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco, camion).
- Inferencia determinista por producto matricial: `logits = h @ W + b` con activacion ELU intermedia.
- Reproduccion exacta del pipeline de preprocesado mediante `preprocessing.npz`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision avanzada, audio ni ninguna capacidad generativa.
- No soporta imagenes de resolucion distinta de 32x32 sin reentrenamiento o adaptacion.

## Casos de uso

- Docencia y practicas de asignatura: sirve como referencia reproducible de un MLP con restricciones de signo sobre los pesos, util para comparar contra variantes sin restriccion en la Assignment 4 de SMAI.
- Baseline de clasificacion en CIFAR-10: con 44,69 % de precision en test, es un punto de partida para medir la mejora que aportan CNN, aumentacion de datos o regularizacion en el mismo conjunto.
- Estudio de restricciones de pesos no negativos: permite analizar el efecto de la transformacion `exp(w-5)` sobre la capacidad de representacion y la convergencia frente a un MLP convencional.
- Verificacion de pipelines de preprocesado: el `preprocessing.npz` con media y desviacion tipica permite validar implementaciones propias de normalizacion sobre CIFAR-10.
- Inferencia embebida de bajo coste: al ser un MLP de 1,7 M de parametros en float64, se puede ejecutar en CPU o en microcontroladores para experimentos de clasificacion de imagenes de baja resolucion.
- Reproducibilidad de experimentos: la semilla 2049, el learning rate 0,02 y el batch 64 estan documentados, lo que facilita replicar el entrenamiento y comparar resultados con otras semillas.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| CIFAR-10 test accuracy | 0,4469 (44,69 %) |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de rendimiento reportado por el autor es la precision en test sobre CIFAR-10.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en float64 (1,7 M de parametros x 8 bytes ≈ 13,7 MB, mas buffers de activacion y pesos de preprocesado); en float32, unos 7 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; el modelo es trivial para A100, H100 o RTX 4090, que quedarian enormemente sobredimensionadas.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU moderna, y tambien en CPU sin problema.
- Opciones de despliegue: NumPy puro (carga de NPZ y multiplicacion matricial), PyTorch (carga manual de tensores), ONNX tras exportacion manual. No hay integracion con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, la inferencia por lote en CPU deberia ser del orden de microsegundos a milisegundos por muestra, pero no se ha medido ni publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Precision CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IOC-NN (ELU) | 1.707.786 | imagen 32x32x3 | 0,4469 | no disponible | HuggingFace (repo de 0,0 GB) |
| MLP sin restriccion IOC | no disponible | imagen 32x32x3 | no disponible | no disponible | no disponible |
| CNN pequena tipo LeNet-5 | ~60.000 | imagen 32x32x3 | no disponible en esta ficha | no disponible | implementaciones multiples |
| ResNet-18 (CIFAR-10) | ~11,2 M | imagen 32x32x3 | no disponible en esta ficha | no disponible | implementaciones multiples |

No se dispone de resultados de benchmarks de los modelos alternativos en la informacion proporcionada; la comparativa se limita a parametros, tipo de entrada y disponibilidad. No se han encontrado modelos comparables publicados por el mismo autor.

## Limitaciones y advertencias

- Precision de test limitada (44,69 %), muy por debajo de clasificadores convolucionales modernos sobre CIFAR-10; no es adecuado para produccion.
- La restriccion IOC de pesos no negativos puede limitar la capacidad de representacion y la calidad de las fronteras de decision.
- No hay informacion sobre sesgos del dataset mas alla de los inherentes a CIFAR-10 (clases desbalanceadas, etiquetas ruidosas, imagenes de baja resolucion).
- Riesgo de sobreajuste no cuantificado: no se reportan curvas de entrenamiento ni precision en validacion.
- Solo acepta imagenes de 32x32x3; cualquier otra resolucion requiere redimensionado y reestandarizacion.
- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor.
- Repositorio de 0,0 GB y sin descargas ni likes: no hay garantia de mantenimiento ni de que los pesos esten efectivamente subidos.
- Formato NPZ en float64: requiere conversion manual para despliegue en frameworks distintos de NumPy.
- No es un modelo de lenguaje: no debe evaluarse con benchmarks de texto ni usarse para tareas generativas.

## Enlaces

- HuggingFace: https://huggingface.co/quake3player/smai-a4-cifar10-iocnn
- Dataset CIFAR-10: https://huggingface.co/datasets/uoft-cs/cifar10
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion proporcionada.

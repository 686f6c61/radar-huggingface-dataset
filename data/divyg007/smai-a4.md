# DivyG007/smai-a4

## Resumen

SMAI-A4 (publicado como `DivyG007/smai-a4`) no es un modelo de lenguaje, sino un repositorio de artefactos de un trabajo academico de la asignatura SMAI (Statistical Methods and Applications in Informatics). Contiene dos clasificadores de imagenes entrenados desde cero sobre CIFAR-10: un perceptron multicapa (MLP) convencional de 3072-128-10 con activacion ReLU y una variante denominada IOC-NN (Input-Convex Neural Network restringida) con la misma topologia pero activacion ELU y pesos no negativos en las capas a partir de la segunda.

El objetivo del autor es comparar empiricamente ambos enfoques en la tarea de clasificacion de imagenes de 32x32x3 en 10 clases, con idéntico presupuesto de entrenamiento (100 epocas, SGD con lr 0.01, batch 64, semilla 14009). Ambos modelos alcanzan precisiones de test muy proximas: 0.4819 para el MLP y 0.4847 para IOC-NN, lo que sugiere que la restriccion de convexidad no degrada el rendimiento en este caso concreto.

Su relevancia es limitada fuera del ambito docente: se trata de un experimento reproducible de ~395.000 parametros entrenado con NumPy puro, sin publicacion de pesos en formatos estandar de inferencia (safetensors, GGUF) y sin pipeline definido en HuggingFace. Es util como referencia pedagogica para estudiar redes convexas o como baseline ligero de CIFAR-10, pero no como modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (MLP) denso y variante IOC-NN (red neuronal con convexidad de entrada y pesos no negativos en capas >= 2) |
| Parametros totales | 394.634 (ambos modelos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en `.npz` de NumPy, sin versiones cuantizadas publicadas) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | NumPy `.npz` (arrays `W0, b0, W1, b1` con forma `(n_in, n_out)`); sin safetensors ni GGUF |

## Arquitectura y entrenamiento

Ambos modelos son MLP de tres capas con topologia 3072-128-10. La entrada es la imagen CIFAR-10 aplanada en orden HWC a 3072 valores, posteriormente normalizada: division por 255, resta de la media por columna y division por la desviacion tipica (estadisticos almacenados en `preprocessing.npz`). La capa oculta usa 128 unidades. En el MLP la activacion es ReLU; en IOC-NN es ELU y se impone que los pesos de las capas a partir de la segunda sean no negativos, lo que corresponde a una restriccion de convexidad de la red respecto a la entrada (input-convex neural network).

El entrenamiento se realizo durante 100 epocas con descenso de gradiente estocastico plano (lr 0.01, batch size 64) y semilla 14009, sobre las 50.000 imagenes del split de entrenamiento de CIFAR-10 alojado en HuggingFace, con etiquetas verdaderas. No se mencionan tecnicas de regularizacion adicionales, data augmentation, optimizadores adaptativos ni ajuste fino posterior; tampoco se documenta el marco de entrenamiento mas alla de que la inferencia se realiza con NumPy y la carga via `Model.load_from` del notebook `mlp.ipynb`.

## Capacidades

- Clasificacion de imagenes RGB de 32x32 píxeles en 10 clases de CIFAR-10.
- Inferencia en NumPy puro, sin dependencias de frameworks de deep learning (PyTorch, TensorFlow).
- Reproducibilidad completa: semilla, hiperparametros y estadisticos de preprocesado incluidos en el repositorio.
- Comparacion controlada MLP vs IOC-NN bajo identico presupuesto de entrenamiento.
- Soporte de tool calling / function calling: no.
- Soporte de agentes y razonamiento multi-paso: no.
- Capacidades multilingues: no aplica.
- Capacidades especiales (thinking mode, vision generativa, audio): no.

## Casos de uso

- Docencia y practicas de aprendizaje automatico: el repositorio sirve como ejemplo reproducible de entrenamiento e inferencia de un MLP en NumPy, con estadisticos de normalizacion incluidos para evitar fugas de informacion.
- Estudio de redes convexas: IOC-NN permite analizar empiricamente el coste (o la ausencia de coste) de imponer no negatividad en pesos, util en cursos de optimizacion y teoria de redes neuronales.
- Baseline de clasificacion CIFAR-10: con ~48% de precision y 395k parametros, sirve como referencia rapida para comparar arquitecturas mas complejas (CNN, ViT) en experimentos academicos.
- Prototipado de pipelines de inferencia sin GPU: al ejecutarse con NumPy sobre CPU, es adecuado para entornos docentes con recursos limitados o para validar el preprocesado antes de migrar a un framework mayor.
- Pruebas de integracion de carga de pesos `.npz`: util para validar utilidades propias de carga y serializacion de modelos en Python.
- Reproduccion de resultados de un informe academico: permite replicar la tabla comparativa de la Seccion 1.5 del trabajo SMAI con los mismos hiperparametros y semilla.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card (CIFAR-10, split de test alojado en HuggingFace):

| Modelo | Capas | Activacion oculta | Parametros | Precision de test |
|---|---|---|---|---|
| MLP | 3072-128-10 | ReLU | 394.634 | 0.4819 |
| IOC-NN | 3072-128-10 | ELU | 394.634 | 0.4847 |

Ambos modelos se entrenaron con SGD (lr 0.01, batch 64) durante 100 epocas con semilla 14009. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es de lenguaje.

## Requisitos de hardware

- VRAM: 0 GB. Los pesos ocupan unos pocos MB en `.npz` y la inferencia se ejecuta en NumPy sobre CPU.
- GPU recomendadas: ninguna imprescindible; cualquier CPU moderna es suficiente para inferencia. Para reentrenar, una GPU consumer basica acelera el proceso, pero no se documentan tiempos.
- GPU consumer: cabe en cualquier equipo, incluidos portatiles sin GPU dedicada.
- Opciones de despliegue: script Python con NumPy cargando `model.npz` y `preprocessing.npz`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI (no aplica a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada. Como referencia cualitativa de la categoria (clasificadores CIFAR-10 academicos):

| Modelo | Parametros | Contexto / entrada | Precision CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SMAI-A4 MLP | 394.634 | imagen 32x32x3 | 0.4819 | MIT | pesos `.npz` en HF |
| SMAI-A4 IOC-NN | 394.634 | imagen 32x32x3 | 0.4847 | MIT | pesos `.npz` en HF |
| Alternativas CNN/ViT de referencia | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni razonamiento multi-paso.
- Precision de test moderada (~48% en CIFAR-10), lejos del estado del arte en clasificacion de imagenes; no apto para produccion real.
- Pesos en formato `.npz` de NumPy, no interoperables directamente con vLLM, TGI, llama.cpp ni Ollama; requiere codigo de carga propio (`Model.load_from` del notebook `mlp.ipynb`).
- El repositorio ocupa 0.0 GB segun HuggingFace, lo que sugiere que los pesos pueden no estar efectivamente subidos o son extremadamente ligeros; conviene verificar la integridad de los artefactos antes de usarlos.
- Entrenado unicamente sobre CIFAR-10; no generaliza a otras distribuciones de imagen sin reentrenamiento.
- No se documentan sesgos, riesgos de alucinacion ni limitaciones de contexto o idioma mas alla de las inherentes a un clasificador de imagenes.
- Licencia MIT permite uso comercial, pero el valor practico del modelo fuera de docencia es muy limitado.
- Sin pipeline definido en HuggingFace y sin descargas ni likes, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/DivyG007/smai-a4
- Carpeta MLP: https://huggingface.co/DivyG007/smai-a4/tree/main/cifar10-mlp
- Carpeta IOC-NN: https://huggingface.co/DivyG007/smai-a4/tree/main/cifar10-ioc-nn
- Dataset de referencia: CIFAR-10 (split de entrenamiento alojado en HuggingFace; no se proporciona enlace directo en la informacion disponible)
- Paper, blog o demo adicional: no disponible

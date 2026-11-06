# Harshavardhan89/smai-a4-q1-ioc-nn-cifar10

## Resumen

`smai-a4-q1-ioc-nn-cifar10` es un clasificador de imagenes CIFAR-10 implementado como un perceptron multicapa (MLP) de tres capas densas con activacion ELU, entrenado desde cero con NumPy y SGD. No es un modelo de lenguaje ni un modelo fundacional: es el artefacto de una practica academica (SMAI Assignment 4, Q1) cuyo interes tecnico reside en la restriccion estructural que impone sobre los pesos, no en su rendimiento predictivo.

La particularidad del modelo es que los pesos de todas las capas a partir de la segunda se mantienen no negativos mediante una transformacion `w -> exp(w - 5)` aplicada tras cada actualizacion. Con una activacion convexa y no decreciente como ELU y pesos no negativos, cada logit de salida resulta ser una funcion convexa de la imagen de entrada. Esta propiedad (IOC-NN, Input-Output Convex Neural Network) permite analizar el comportamiento del modelo con herramientas de optimizacion convexa, algo que no es posible en redes convencionales.

El modelo alcanza una precision de test de 0,4699 sobre las 10.000 imagenes oficiales de CIFAR-10, un resultado coherente con un MLP pequeno sobre pixeles crudos y muy por debajo de arquitecturas convolucionales. Su relevancia es, por tanto, pedagogica y experimental: sirve como referencia reproducible para estudiar redes convexas de entrada-salida, no como componente de produccion. El repositorio ocupa 0,0 GB y no registra descargas ni interacciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP denso (fully connected), 3 capas, activacion ELU en capas ocultas, salida lineal (logits) |
| Parametros totales | 402.826 (3072x128 + 128 + 128x64 + 64 + 64x10 + 10) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de secuencia) |
| Tipos de cuantizacion | no disponible (pesos en float64 dentro de `model.npz`) |
| Idiomas soportados | no disponible (clasificador de imagenes, sin capacidad linguistica) |
| Licencia | MIT |
| Formato de pesos | NumPy `.npz` (`model.npz`, `preprocessing.npz`) + `config.json` |

Dimensiones de capa: `[3072, 128, 64, 10]`. Entrada: imagen RGB 32x32 aplanada en orden H, W, C y normalizada por columna con `mean`/`std` calculados sobre las 50.000 imagenes de entrenamiento oficiales.

## Arquitectura y entrenamiento

La red es un MLP de tres transformaciones afines `y = h @ W + b` con ELU entre capas y sin activacion en la salida. La innovacion esta en la proyeccion de pesos: tras cada paso de SGD, todo peso de capa `i >= 2` con valor negativo se reemplaza por `exp(w - 5)`, lo que lo empuja a un valor positivo pequeno. Combinado con ELU (convexa y no decreciente) y pesos de la primera capa sin restriccion, la composicion garantiza que cada logit sea convexo respecto a la entrada de 3072 dimensiones.

El entrenamiento usa entropia cruzada softmax, SGD plano con learning rate 0,03, tamano de batch 64, 100 epocas y semilla 2040, sobre CIFAR-10 con etiquetas limpias (p = 0, sin ruido de etiqueta). No se documenta data augmentation, regularizacion, momentum, weight decay ni schedule de learning rate. No hay fase de RLHF ni DPO: es un clasificador supervisado puro. El preprocesado (division por 255 y estandarizacion por columna) forma parte del artefacto y debe replicarse exactamente para obtener la precision reportada.

## Capacidades

- Clasificacion de imagenes en las 10 clases de CIFAR-10 (avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco, camion).
- Inferencia en NumPy puro, sin dependencias de frameworks de deep learning (basta `numpy`).
- Garantia estructural de convexidad entrada-salida en los logits, util para analisis formal y verificacion.
- Reproducibilidad completa: pesos, estadisticas de preprocesado y configuracion en el repositorio.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision general (solo 32x32 RGB de CIFAR-10), audio ni generacion de texto.
- No tiene capacidades multilingues ni modo de razonamiento extendido.

## Casos de uso

- Docencia en optimizacion convexa aplicada a aprendizaje profundo: el modelo permite ilustrar empiricamente como una restriccion de signo en los pesos y una activacion convexa convierten la red en una funcion convexa de la entrada, verificable numericamente con el checkpoint incluido.
- Reproduccion de resultados academicos: sirve como referencia exacta (semilla 2040, hiperparametros documentados) para comparar variantes de IOC-NN, por ejemplo cambiando la activacion o el umbral de la transformacion `exp(w - 5)`.
- Baseline ligero para CIFAR-10: con 402.826 parametros y NumPy puro, se ejecuta en CPU en milisegundos por lote y sirve como suelo de comparacion frente a CNN y transformers de vision en experimentos docentes.
- Analisis de robustez y calibracion: al ser convexo en la entrada, se pueden plantear problemas de optimizacion convexa para encontrar entradas adversas o cotas de margen, algo inviable en redes no convexas.
- Despliegue en entornos sin GPU ni runtime de deep learning: al cargarse con `numpy.load`, encaja en pipelines de investigacion embebidos, scripts de validacion o entornos restringidos donde no se puede instalar PyTorch o TensorFlow.
- Estudio de la limitacion expresiva de los MLP sobre pixeles crudos: la brecha entre 0,4699 y el rendimiento de una CNN pequena cuantifica el coste de prescindir de sesgo inductivo convolucional y de la libertad de signo en los pesos.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Precision de test | 0,4699 | CIFAR-10 test oficial (10.000 imagenes) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con otros modelos en la model card. No se reportan precision de entrenamiento, curvas de aprendizaje ni matrices de confusion.

## Requisitos de hardware

- VRAM: no requiere GPU. El modelo completo ocupa aproximadamente 3,2 MB en float64 (402.826 parametros) y cabe holgadamente en memoria RAM de cualquier equipo.
- GPU recomendadas: ninguna en particular; cualquier GPU es sobredimensionada para esta carga. Funciona en CPU sin problema.
- GPU de consumo: cabe en cualquier GPU de consumo e incluso en entornos sin GPU (Raspberry Pi, contenedores ligeros).
- Opciones de despliegue: NumPy directamente (unica via documentada por el autor). No hay pesos en GGUF, safetensors ni compatibilidad con vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles de forma oficial. Por el tamano (unas 400.000 multiplicaciones-acumulaciones por muestra en inferencia), se espera latencia de microsegundos a milisegundos por lote en CPU moderna, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Precision CIFAR-10 | Licencia | Formato |
|---|---|---|---|---|---|
| smai-a4-q1-ioc-nn-cifar10 | 402.826 | imagen 32x32x3 | 0,4699 | MIT | NumPy `.npz` |
| MLP convencional equivalente | ~402.826 | imagen 32x32x3 | no disponible | no disponible | no disponible |
| CNN pequena tipo LeNet | orden de 10^5 | imagen 32x32x3 | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada; las filas de MLP convencional y CNN se incluyen solo como categorias de referencia y sus valores se marcan como no disponibles para no inventar cifras. La comparacion relevante es cualitativa: frente a un MLP sin restriccion de signo, este modelo sacrifica capacidad expresiva a cambio de la garantia de convexidad entrada-salida.

## Limitaciones y advertencias

- Precision limitada: 0,4699 en test, insuficiente para la mayoria de aplicaciones reales de vision; no debe usarse como clasificador de produccion.
- Entrada rigida: solo acepta imagenes 32x32x3 en orden H, W, C, aplanadas y normalizadas con las estadisticas exactas de `preprocessing.npz`. Cualquier otra resolucion, canal u orden de canales invalida los resultados.
- Dominio cerrado: las 10 clases de CIFAR-10 y nada mas; no generaliza a otras taxonomias ni a imagenes fuera de la distribucion del dataset.
- Sin capacidades linguisticas ni generativas: no es un modelo de lenguaje, no soporta instrucciones, tool calling ni agentes. Cualquier uso en ese sentido es un error de categoria.
- Restriccion de convexidad como techo: la proyeccion de pesos a valores no negativos reduce la expresividad y explica en parte la precision moderada; no es un defecto corregible sin abandonar la propiedad IOC.
- Sin datos de sesgo ni de robustez: no se documentan evaluaciones de sesgo por clase, calibracion, sensibilidad a perturbaciones ni rendimiento bajo distribuciones desplazadas.
- Riesgo de sobreajuste no cuantificado: no se reportan curvas de validacion ni la brecha entre entrenamiento y test.
- Licencia MIT: permisiva para uso comercial, pero el modelo es un artefacto academico sin garantias; la licencia no cubre las condiciones de uso del dataset CIFAR-10 subyacente.
- Repositorio sin mantenimiento aparente: 0 descargas, 0 likes y sin pipeline declarado; no hay soporte ni issues resueltos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Harshavardhan89/smai-a4-q1-ioc-nn-cifar10
- Dataset CIFAR-10: https://www.cs.toronto.edu/~kriz/cifar.html
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.

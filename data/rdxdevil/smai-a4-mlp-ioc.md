# RDXdevil/smai-a4-mlp-ioc

## Resumen

`smai-a4-mlp-ioc` es un repositorio de artefactos de un trabajo academico (SMAI Assignment 4) que contiene dos clasificadores sencillos para imagenes CIFAR-10 de 32x32 pixeles. No es un modelo de lenguaje ni un modelo fundacional: se trata de dos perceptrones multicapa (MLP) entrenados desde cero sobre pixeles aplanados y estandarizados, con una unica capa oculta de 64 neuronas y 10 salidas (una por clase).

El primero es un MLP implementado en NumPy, entrenado sobre una particion de 36.000 imagenes, con activacion ReLU y una precision de test del 45,52 %. El segundo es una red IOC-NN (Input-Output Convex Neural Network) implementada en PyTorch, con activacion ELU y pesos no negativos en las capas posteriores a la primera, entrenada durante 100 epocas sobre las 50.000 imagenes de entrenamiento de CIFAR-10, alcanzando un 44,19 % de precision en test.

Su relevancia es exclusivamente didactica: sirve como referencia reproducible de un ejercicio de asignatura sobre arquitecturas seleccionadas y restricciones de convexidad, no como componente para produccion. Ambos modelos tienen 197.322 parametros, un tamano de repositorio practicamente nulo y ninguna capacidad generativa, de razonamiento o multilingue.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptron multicapa) con una capa oculta; variante IOC-NN con pesos no negativos en capas >= 2 |
| Parametros totales | 197.322 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada fija de 3072 caracteristicas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (clasificador de imagenes, sin capacidades linguisticas) |
| Licencia | MIT |
| Formato de pesos | NumPy `.npz` (float64) para el MLP; `torch.save` (`.pt`) para el IOC-NN |

## Arquitectura y entrenamiento

Ambos modelos comparten la arquitectura seleccionada en la tarea 1.2.5 del trabajo: una entrada de 3072 caracteristicas (imagen RGB de 32x32 aplanada), una capa oculta de 64 unidades y una capa de salida de 10 clases. El MLP usa ReLU en la capa oculta y se entreno con NumPy puro sobre una particion de 36.000 imagenes. El IOC-NN usa ELU y aplica una proyeccion de convexidad: tras cada paso de optimizacion, los pesos negativos de las capas a partir de la segunda se sustituyen por `exp(w - 5)`, garantizando no negatividad en esas capas.

El preprocesado es comun: normalizacion de los valores RGB dividiendo entre 255, aplanado a 3072 caracteristicas y estandarizacion por columna (resta de la media y division por la desviacion tipica). El MLP usa las estadisticas de su particion de 36.000 imagenes (`preprocess_numpy.npz`) y el IOC-NN las de las 50.000 imagenes de entrenamiento de CIFAR-10 (`preprocess_torch.npz`); los vectores `mean` y `std` tienen forma (3072,). El entrenamiento del IOC-NN se realizo durante 100 epocas con `p = 0`. No se documentan tecnicas de regularizacion, aumento de datos, RLHF ni optimizadores concretos mas alla de lo indicado.

## Capacidades

- Clasificacion de imagenes CIFAR-10 en 10 clases (avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco y camion), a partir de pixeles aplanados.
- Inferencia determinista por producto matricial: `logits = act(x @ W0 + b0) @ W1 + b1` en el caso NumPy.
- Restriccion de convexidad en la salida del IOC-NN (pesos no negativos en capas >= 2), util como ejemplo de arquitectura con garantias estructurales.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision general, tool calling, agentes, modo thinking, audio ni capacidades multilingues.

## Casos de uso

- Docencia y practicas de aprendizaje automatico: sirve como punto de partida reproducible para que estudiantes comparen una implementacion desde cero en NumPy con una en PyTorch sobre el mismo problema y la misma arquitectura.
- Estudio de restricciones de convexidad: el IOC-NN permite analizar experimentalmente como la proyeccion `exp(w - 5)` afecta a la precision (44,19 % frente al 45,52 % del MLP sin restriccion) y a la estabilidad del entrenamiento.
- Baseline de referencia en CIFAR-10: con 197.322 parametros y ~45 % de precision, es un suelo util contra el que medir modelos convolucionales o transformers de vision en ejercicios comparativos.
- Pruebas de pipelines de preprocesado: los ficheros `preprocess_numpy.npz` y `preprocess_torch.npz` permiten validar pasos de normalizacion por columna y coherencia entre particiones de entrenamiento.
- Verificacion de portabilidad de pesos: el `.npz` en float64 y el `.pt` de PyTorch permiten practicar la exportacion e importacion de pesos entre frameworks y comprobar equivalencia numerica de logits.
- Demostraciones de inferencia en CPU: por su tamano minimo (menos de 200.000 parametros), el modelo se ejecuta en cualquier portatil sin GPU, lo que facilita talleres y demos en aula.

## Benchmarks y rendimiento

Los unicos resultados publicados son los de la model card, sobre el conjunto de test de CIFAR-10:

| Modelo | Activacion oculta | Parametros | Precision en test |
|---|---|---|---|
| MLP NumPy (36.000 imagenes de entrenamiento) | ReLU | 197.322 | 0,4552 |
| IOC-NN PyTorch (50.000 imagenes, 100 epocas, p = 0) | ELU, pesos no negativos en capas >= 2 | 197.322 | 0,4419 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K ni otros) en la informacion disponible, ni comparaciones con lineas base convolucionales.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; los pesos en float64 ocupan aproximadamente 1,6 MB y en float32 unos 0,8 MB, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: ninguna en especial; cualquier GPU con PyTorch (desde una GTX 1050 o superior) es suficiente. Para el entrenamiento completo, una GPU modesta acelera las 100 epocas del IOC-NN.
- Cabe en GPU consumer: si, en todas las tarjetas actuales (RTX 3060, RTX 4060, RTX 4090, etc.) y tambien en CPU sin problemas.
- Opciones de despliegue: PyTorch nativo para el `.pt`; NumPy para el `.npz`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, la inferencia por lote es del orden de microsegundos a milisegundos en hardware convencional.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Precision en test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `smai-a4-mlp-ioc` (MLP NumPy) | 197.322 | 3072 caracteristicas | 0,4552 | MIT | HuggingFace |
| `smai-a4-mlp-ioc` (IOC-NN PyTorch) | 197.322 | 3072 caracteristicas | 0,4419 | MIT | HuggingFace |
| MLP de referencia sobre CIFAR-10 | no disponible | no disponible | no disponible | no disponible | no disponible |
| CNN pequena sobre CIFAR-10 | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de modelos alternativos en la informacion proporcionada; la comparativa con arquitecturas convolucionales o transformers de vision habituales en CIFAR-10 queda como "no disponible".

## Limitaciones y advertencias

- Precision limitada: en torno al 44-46 % en test, muy por debajo de los enfoques convolucionales, lo que refleja la perdida de estructura espacial al aplanar los pixeles.
- Sin capacidades generativas ni de lenguaje: no debe emplearse para tareas de texto, razonamiento, codigo ni atencion al cliente.
- Dependencia estricta del preprocesado: los pesos solo son validos con la normalizacion por columna registrada en `preprocess_numpy.npz` y `preprocess_torch.npz`; usar otras estadisticas degrada la salida.
- Riesgo de sobreajuste y sesgos del dataset: CIFAR-10 contiene clases y sesgos propios del conjunto; el modelo hereda sus limitaciones y no se han realizado evaluaciones de equidad.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificacion con atribucion; no obstante, el valor practico del modelo fuera de contextos docentes es marginal.
- Caveat de produccion: no es un modelo apto para produccion; carece de versionado semantico, evaluacion sistematica, soporte de cuantizacion y documentacion de latencia.
- Idiomas: no aplica; no procesa texto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RDXdevil/smai-a4-mlp-ioc
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion disponible.

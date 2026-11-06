# Shivansh521/smai-a4-iocnn

## Resumen

`smai-a4-iocnn` es un modelo neuronal de pequeno tamano publicado en Hugging Face por el usuario Shivansh521 como parte de una asignacion academica (SMAI Assignment 4). Se trata de un perceptron multicapa (MLP) de tres capas (3072-32-10) entrenado sobre el conjunto de datos CIFAR-10 para clasificacion de imagenes en 10 categorias. El modelo implementa una variante denominada IOC-NN (Input-Output Constrained Neural Network), en la que las capas posteriores a la primera tienen restricciones de no negatividad en sus pesos.

El modelo no es un modelo de lenguaje ni un modelo generativo: es un clasificador de imagenes de proposito didactico, sin pipeline declarado en Hugging Face, sin licencia especificada y sin idiomas soportados. Su relevancia es exclusivamente academica y de investigacion sobre restricciones estructurales en redes neuronales, no para uso en produccion.

El repositorio tiene un tamano de 0.0 GB y no cuenta con descargas ni likes en el momento de la consulta. La model card documenta unicamente la arquitectura, el preprocesamiento y la precision de test (0.4154), sin informacion sobre el proceso de entrenamiento mas alla de lo indicado en `config.json`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptron multicapa) 3072-32-10, activacion oculta ELU, salida identidad con softmax cross-entropy |
| Parametros totales | 98.474 (3072x32 + 32 + 32x10 + 10, calculado a partir de las dimensiones declaradas) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (clasificador de imagenes, sin capacidad linguistica) |
| Licencia | No disponible |
| Formato de pesos | NumPy `.npz` (`weights.npz`) y `config.json` |

## Arquitectura y entrenamiento

La arquitectura es un MLP de tres capas completamente conectadas: una capa de entrada de 3072 unidades (correspondiente a la imagen CIFAR-10 de 32x32x3 aplanada), una capa oculta de 32 unidades con activacion ELU y una capa de salida de 10 logits con activacion identidad y perdida softmax cross-entropy. La innovacion declarada es la restriccion IOC: los pesos de las capas 2, 3, ... deben ser no negativos, lo que impone una estructura monotona en las transformaciones posteriores a la primera capa.

El preprocesamiento consiste en aplanar la imagen con `X.reshape(-1, 3072)`, dividir por 255 y estandarizar cada columna con la media y desviacion tipica calculadas sobre las 50.000 imagenes de entrenamiento de CIFAR-10 (fichero `preprocessing.npz`). La model card indica que el modelo comparado en la Seccion 1.5 fue entrenado con las etiquetas verdaderas y `p = 0`. No se especifican el numero de epocas, el optimizador, la tasa de aprendizaje ni la composicion exacta del dataset mas alla de CIFAR-10; esos datos podrian estar en `config.json`, pero no se han proporcionado.

## Capacidades

- Clasificacion de imagenes en 10 categorias de CIFAR-10 (avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco, camion).
- Entrada exclusivamente de imagenes de 32x32x3 pixeles, aplanadas a 3072 valores y estandarizadas.
- Salida de 10 logits tras softmax cross-entropy.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo thinking, vision general, audio ni otras capacidades especiales.

## Casos de uso

- Docencia y practicas de aprendizaje automatico: el modelo sirve como ejemplo minimo de MLP con restricciones de pesos para ilustrar el efecto de la no negatividad en la precision de clasificacion sobre CIFAR-10.
- Reproduccion de experimentos academicos: permite replicar el resultado de 0.4154 de precision de test documentado en la model card y comparar con variantes sin restriccion.
- Estudio de redes con restricciones estructurales: util para investigar como las restricciones IOC afectan la capacidad de representacion de un MLP de 32 unidades ocultas.
- Benchmark de referencia para clasificadores ligeros: con 98.474 parametros, sirve como linea base de bajo coste computacional en tareas de clasificacion de imagenes de 32x32.
- Analisis de preprocesamiento: el fichero `preprocessing.npz` permite estudiar el impacto de la estandarizacion por columna sobre las 50.000 imagenes de entrenamiento.
- Prototipado educativo de pipelines de inferencia en NumPy: los pesos en `.npz` permiten cargar el modelo sin frameworks de deep learning y ejecutar la inferencia con operaciones matriciales basicas.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| CIFAR-10 test accuracy | 0.4154 | Entrenado con etiquetas verdaderas, p = 0, segun la model card |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos (98.474 parametros en float32, aproximadamente 394 KB) mas el buffer de entrada de 3072 valores.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU sin problema.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o inferior, e incluso en entornos sin GPU.
- Opciones de despliegue: carga directa de `weights.npz` con NumPy y operaciones matriciales; no es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles; por el tamano del modelo, la inferencia por muestra es del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smai-a4-iocnn | 98.474 | No aplica | 0.4154 | No disponible | Hugging Face |
| MLP 3072-32-10 sin restriccion IOC | 98.474 | No aplica | No disponible | No disponible | No disponible en la informacion proporcionada |
| LeNet-5 (referencia historica) | ~60.000 | No aplica | No disponible | No disponible | Implementaciones multiples |

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada; la comparativa se limita a la arquitectura y al resultado declarado.

## Limitaciones y advertencias

- Modelo de proposito exclusivamente academico, sin validacion para uso en produccion.
- Precision de test de 0.4154 sobre CIFAR-10, lejos de clasificadores modernos; no apto para aplicaciones reales de vision.
- Entrada restringida a imagenes de 32x32x3 pixeles con el preprocesamiento exacto documentado; cualquier otra entrada invalida los resultados.
- Sin licencia declarada: no se puede asumir permiso para uso comercial ni redistribucion.
- Sin informacion sobre sesgos del dataset CIFAR-10 ni sobre el proceso de entrenamiento completo (epocas, optimizador, semilla).
- No es un modelo de lenguaje: no genera texto, no soporta agentes ni tool calling, y no tiene capacidades multilingues.
- La restriccion de no negatividad en los pesos puede limitar la capacidad de representacion y contribuir a la baja precision.
- Riesgo de alucinacion no aplica en el sentido habitual, pero el modelo puede producir clasificaciones erroneas sin indicacion de incertidumbre mas alla de la distribucion softmax.

## Enlaces

- Hugging Face: https://huggingface.co/Shivansh521/smai-a4-iocnn
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion proporcionada.

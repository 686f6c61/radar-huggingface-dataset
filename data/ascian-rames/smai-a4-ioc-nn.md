# ascian-rames/smai-a4-ioc-nn

## Resumen

`smai-a4-ioc-nn` es una red neuronal convexa de tipo IOC-NN (Input Convex Neural Network) desarrollada por el usuario ascian-rames en el contexto de la asignatura SMAI (presumiblemente "Statistical Methods for Artificial Intelligence" o similar). Se trata de un artefacto academico, no de un modelo de lenguaje: es un clasificador de imagenes entrenado sobre CIFAR-10, con una arquitectura totalmente conectada de tres capas (`3072 -> 64 -> 32 -> 10`) y 199.082 parametros totales. No es un modelo generativo ni soporta texto, codigo ni tool calling.

El modelo implementa una restriccion de convexidad clasica en las IOC-NN: los pesos de las capas a partir de la segunda se fuerzan a ser no negativos, sustituyendo cualquier peso negativo por `e^(w-5)` tras cada actualizacion. La activacion oculta es ELU. El objetivo declarado es la seccion 1.4 y 1.5 de un trabajo practico, con `p = 0.0` como parametro de configuracion.

Su relevancia practica es muy limitada fuera del ambito docente: el repositorio pesa 0,0 GB (probablemente solo contiene la model card o pesos minimos), no tiene descargas ni likes, y no se publican pesos en formatos estandar como safetensors o GGUF. Sirve como referencia de implementacion de convexidad en redes neuronales y como ejemplo de clasificador de baja capacidad sobre CIFAR-10.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red totalmente conectada (MLP) con restriccion IOC-NN: `3072 -> 64 -> 32 -> 10` |
| Parametros totales | 199.082 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (clasificador de imagenes, entrada fija de 3072 dimensiones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio aparece con tamano 0,0 GB) |

## Arquitectura y entrenamiento

La arquitectura es un perceptron multicapa de tres capas densas con 3072 entradas (una imagen CIFAR-10 de 32x32x3 aplanada), dos capas ocultas de 64 y 32 neuronas respectivamente, y 10 salidas correspondientes a las clases de CIFAR-10. La activacion oculta es ELU. La innovacion tecnica es la restriccion de convexidad: los pesos de las capas `l >= 2` se mantienen no negativos mediante la sustitucion `w -> e^(w-5)` cuando `w < 0`, aplicada despues de cada actualizacion. Esto garantiza que la salida sea convexa respecto a la entrada, propiedad caracteristica de las IOC-NN.

El preprocesado es el descrito en la model card: aplanado a vectores `float64` de 3072 dimensiones, division por 255,0 para escalar a `[0, 1]`, y estandarizacion por columna usando la media y la desviacion tipica del conjunto de entrenamiento (divisor 1,0 si la desviacion es 0). No se documentan el numero de tokens (no aplica), la composicion del dataset mas alla de CIFAR-10, ni el uso de RLHF o DPO. Tampoco se especifican hiperparametros de entrenamiento como learning rate, batch size o numero de epocas.

## Capacidades

- Clasificacion de imagenes de CIFAR-10 en 10 clases (avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco, camion).
- Entrada fija de imagenes de 32x32x3 aplanadas a 3072 dimensiones.
- Salida de 10 logits/clases; no genera texto ni secuencias.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa lenguaje).
- No dispone de modo thinking, vision general, audio ni otras capacidades especiales.
- Propiedad de convexidad respecto a la entrada, util para analisis teorico y certificacion de robustez.

## Casos de uso

- Docencia y practicas de aprendizaje automatico: sirve como ejemplo ejecutable de una IOC-NN con restriccion de pesos no negativos, util para asignaturas de metodos estadisticos o redes neuronales.
- Clasificacion de imagenes de baja resolucion en entornos controlados: con 199.082 parametros puede desplegarse en microcontroladores o dispositivos embebidos para tareas de clasificacion de 10 clases sobre imagenes de 32x32.
- Estudio de convexidad y robustez: la restriccion `W >= 0` permite analizar garantias de optimalidad global y comportamiento frente a perturbaciones en la entrada.
- Baseline academico para CIFAR-10: sirve como referencia de baja capacidad (test accuracy 0,4164) frente a la que comparar arquitecturas mas complejas.
- Reproduccion de experimentos: el identificador de semilla (`seed = 9003`) y la configuracion documentada permiten reproducir el entrenamiento y verificar los resultados reportados.
- Prototipado de preprocesado: el pipeline de aplanado, escalado y estandarizacion por columna puede reutilizarse como referencia en otros clasificadores de imagenes.

## Benchmarks y rendimiento

Resultados reportados en la model card (seccion 1.5, `p = 0.0`):

| Metrica | Valor |
|---|---|
| Train loss | 1,0280 |
| Test loss | 2,4702 |
| Train accuracy | 0,6541 |
| Test accuracy | 0,4164 |
| Mean F1 | 0,4161 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos (199.082 parametros en `float64` equivalen a unos 1,6 MB; en `float32`, unos 0,8 MB).
- GPU recomendadas: cualquier GPU, incluida una GTX 1050 o inferior; el modelo cabe holgadamente en cualquier GPU consumer.
- Cabe en GPU consumer: si, en cualquier modelo con al menos 1 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo). Requiere un runtime de PyTorch o similar para cargar los pesos, que no se distribuyen en el repositorio.
- Latencia y throughput estimados: no disponibles; por el tamano del modelo, la inferencia por imagen seria del orden de microsegundos en GPU y milisegundos en CPU, aunque no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Test accuracy CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smai-a4-ioc-nn | 199.082 | no aplica | 0,4164 | no disponible | Repositorio vacio (0,0 GB) |
| MLP estandar equivalente | ~199.082 | no aplica | no disponible | no disponible | No disponible en la informacion |
| IOC-NN de referencia (Amos et al.) | no disponible | no aplica | no disponible | no disponible | No disponible en la informacion |

No se dispone de datos de benchmarks de alternativas en la informacion proporcionada para establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- El repositorio aparece con tamano 0,0 GB: no se confirma que los pesos esten publicados en formatos utilizables.
- No se declara licencia, lo que impide determinar si el uso comercial esta permitido; en ausencia de licencia, se debe asumir uso restringido.
- El rendimiento es bajo para CIFAR-10 (test accuracy 0,4164), muy por debajo del estado del arte; no es adecuado para produccion real.
- La restriccion de convexidad limita la capacidad expresiva del modelo y puede explicar parte del bajo rendimiento.
- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni agentes; cualquier uso en esos escenarios es inviable.
- Riesgo de sobreajuste: la brecha entre train accuracy (0,6541) y test accuracy (0,4164) es de 0,2377 puntos.
- No se documentan sesgos especificos, pero CIFAR-10 presenta desequilibrios y sesgos de clase conocidos en la literatura.
- No se especifican hiperparametros de entrenamiento ni detalles del dataset mas alla de CIFAR-10, lo que dificulta la reproducibilidad completa.
- El identificador de semilla (`seed = 9003`) sugiere un experimento academico unico, no un modelo mantenido.

## Enlaces

- HuggingFace: https://huggingface.co/ascian-rames/smai-a4-ioc-nn
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.

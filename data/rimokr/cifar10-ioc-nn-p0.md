# rimoKR/cifar10-ioc-nn-p0

## Resumen

Este modelo es una red neuronal poco profunda entrenada sobre CIFAR-10, el clásico conjunto de datos de clasificación de imágenes en 32x32 píxeles con 10 categorías (aviones, coches, pájaros, gatos, ciervos, perros, ranas, caballos, barcos y camiones). Fue desarrollado por el usuario rimoKR como entrega de la tarea 1.4.2 de la asignatura SMAI (Assignment 4), por lo que se trata de un modelo de carácter académico y no de un modelo de producción.

La particularidad técnica del modelo es que se trata de una red con pesos no negativos en las capas 2 y posteriores: tras cada paso de optimización, las entradas negativas se reemplazan por exp(w - 5), lo que fuerza la no negatividad. La primera capa conserva pesos y sesgos de un MLP convencional. Esta restricción es típica de ejercicios sobre interpretabilidad o sobre redes con restricciones de monotonicidad.

No se trata de un modelo de lenguaje, sino de un clasificador de imágenes con una arquitectura MLP simple (sin capas convolucionales), por lo que su relevancia práctica es limitada y su interés principal es didáctico o de investigación sobre arquitecturas con restricciones de signo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (nn.Sequential: Linear 3072 -> 256, ELU, Linear 256 -> 10) |
| Parametros totales | 789.258 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | PyTorch state_dict (.pt) y preprocessing.npz |

## Arquitectura y entrenamiento

La red es un perceptron multicapa con dos capas lineales: la entrada es una imagen CIFAR-10 aplanada a 3.072 valores (32x32x3), seguida de una capa oculta de 256 neuronas con activación ELU, y una capa de salida de 10 logits sin activación final (apropiado para usar con cross-entropy). No emplea capas convolucionales, lo que limita su capacidad frente a CNNs en este tipo de datos.

El entrenamiento se realizó con entropía cruzada, SGD plano con learning rate 0.01, tamaño de batch 64, acumulación de gradientes 1 y 100 épocas sin early stopping. La innovación principal es la restricción de no negatividad en los pesos de las capas 2 y posteriores: se inicializan uniformemente en (0, 2/n_in) y, tras cada paso, las entradas negativas se sustituyen por exp(w - 5). La primera parte arranca con los mismos pesos y sesgos que un MLP de referencia. No hay datos sobre el uso de técnicas como RLHF o DPO (no aplicables a este tipo de modelo).

## Capacidades

- Clasificación de imágenes de 32x32x3 en las 10 clases de CIFAR-10.
- Inferencia determinista sobre entradas preprocesadas (aplanado, normalización a [0,1] y estandarización por columnas con estadísticas del conjunto de entrenamiento).
- Interesante como objeto de estudio de redes con pesos no negativos (restricción de signo impuesta post-paso).
- No soporta generación de texto, razonamiento, código, visión más allá de CIFAR-10, tool calling, agentes ni capacidades multilingües.

## Casos de uso

- Reproducción de resultados académicos: el modelo y sus ficheros de preprocesamiento permiten replicar la tarea 1.4.2 de la asignatura SMAI y verificar los efectos de la restricción de no negatividad.
- Investigación sobre redes con restricciones de signo: se puede analizar cómo la proyección exp(w - 5) afecta a la convergencia y a la precisión frente a un MLP sin restricciones.
- Comparación didáctica MLP vs CNN: sirve como línea base simple para mostrar en clase o en un blog por qué las CNNs superan a los MLPs en CIFAR-10.
- Punto de partida para fine-tuning ligero: al ser un modelo de menos de 800.000 parámetros, se puede reentrenar o modificar en una CPU o GPU modesta en minutos.
- Validación de pipelines de preprocesamiento: el fichero preprocessing.npz con media y desviación típica por columna permite comprobar que cualquier inferencia externa aplica exactamente la misma normalización.
- Experimentación con interpretabilidad: la no negatividad en capas profundas puede facilitar ciertos análisis de contribuciones positivas de características.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye accuracy en CIFAR-10 (ni en train ni en test), ni comparaciones con el MLP de referencia o con modelos del estado del arte.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; con 789.258 parámetros en float32 el modelo ocupa unos 3 MB, ejecutable en cualquier CPU moderna sin GPU.
- GPU recomendadas: ninguna en concreto; cualquier GPU, incluso integrada, es más que suficiente. No se requieren A100, H100 ni tarjetas de gama alta.
- Consumer GPU: cabe sobradamente en cualquier GPU de consumo (por ejemplo, una RTX 3050 o inferior) con margen enorme.
- Opciones de despliegue: PyTorch (carga directa del state_dict con torch.load). No es un modelo de lenguaje, por lo que vLLM, llama.cpp, Ollama o TGI no son aplicables.
- Latencia y throughput: no disponible; dada la arquitectura (dos capas densas), la inferencia por imagen es del orden de microsegundos a milisegundos en CPU, pero no hay medidas publicadas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Tarea | Licencia |
|---|---|---|---|---|
| rimoKR/cifar10-ioc-nn-p0 | MLP 3072-256-10 con pesos no negativos | 789.258 | Clasificacion CIFAR-10 | MIT |
| MLP estandar CIFAR-10 (referencia del propio autor) | MLP 3072-256-10 sin restriccion de signo | 789.258 | Clasificacion CIFAR-10 | no disponible |
| ResNet-18 entrenada en CIFAR-10 | CNN residual | ~11,2 M | Clasificacion CIFAR-10 | varia segun repositorio |

Nota: la comparación con el MLP de referencia se deduce de la model card (la primera capa parte de sus pesos), pero no hay métricas publicadas que permitan comparar precisión. Las CNNs como ResNet-18 alcanzan típicamente accuracies muy superiores en CIFAR-10, aunque estos datos no provienen de la información disponible sobre este modelo concreto.

## Limitaciones y advertencias

- Rendimiento esperado bajo: un MLP sin capas convolucionales suele obtener accuracies notablemente inferiores a las CNNs en CIFAR-10; no se publica la cifra exacta, por lo que debe medirse antes de cualquier uso serio.
- Sin early stopping: se entrenó durante 100 épocas fijas, lo que puede implicar sobreajuste al conjunto de entrenamiento.
- Restricción de no negatividad: el reemplazo exp(w - 5) tras cada paso no es un optimizador estándar y puede degradar la convergencia; conviene entenderlo antes de reutilizar el código.
- Preprocesamiento obligatorio: la inferencia requiere aplicar exactamente la media y desviación típica de preprocessing.npz; usar otra normalización producirá resultados incorrectos.
- Alcance limitado: solo clasifica imágenes de 32x32x3 de las 10 clases de CIFAR-10; no generaliza a otras resoluciones, dominios o tareas.
- No es un modelo de lenguaje: no tiene capacidades de texto, código ni agentes.
- Licencia MIT: permite uso comercial sin restricciones relevantes, más allá de conservar el aviso de licencia.
- Descargas: 0 en el momento de redactar la ficha, por lo que no hay comunidad ni validación externa del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/rimoKR/cifar10-ioc-nn-p0

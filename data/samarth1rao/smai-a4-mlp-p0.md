# samarth1rao/smai-a4-mlp-p0

## Resumen

`smai-a4-mlp-p0` es un perceptrón multicapa (MLP) desarrollado por el usuario samarth1rao como parte de la asignación 4 de un curso de SMAI (Statistical Methods in Artificial Intelligence). No es un modelo de lenguaje ni un modelo generativo: es un clasificador de imágenes para el dataset CIFAR-10, implementado con NumPy y publicado con los pesos en formato `.npz`. Su relevancia es exclusivamente didáctica y académica.

La arquitectura es una red totalmente conectada de tres capas (3072 -> 128 -> 64 -> 10) con activación ReLU en las capas ocultas y 10 logits de salida, sumando 402.250 parámetros. Se entrenó sobre las 50.000 imágenes de entrenamiento de CIFAR-10 con etiquetas reales (p = 0), usando entropía cruzada y SGD con tasa de aprendizaje 0,05 durante 100 épocas.

El modelo alcanza una precisión de entrenamiento del 90,83 % y una precisión de test del 47,30 %, lo que refleja un sobreajuste considerable y un rendimiento muy por debajo de los modelos convolucionales habituales en CIFAR-10. No dispone de model card con benchmarks comparativos, idiomas ni pipeline de Hugging Face, y su repo ocupa 0,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP totalmente conectado (3072 -> 128 -> 64 -> 10), activación ReLU, salida con 10 logits |
| Parametros totales | 402.250 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en `.npz` de NumPy, sin variantes GGUF/INT8 publicadas) |
| Idiomas soportados | no disponible (clasificador de imágenes, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | `.npz` (arrays `W0, b0, W1, b1, W2, b2` con forma `(n_in, n_out)`) |

## Arquitectura y entrenamiento

El modelo es un MLP de tres capas densas: entrada de 3.072 valores (imagen CIFAR-10 de 32x32x3 aplanada), capa oculta de 128 unidades con ReLU, segunda capa oculta de 64 unidades con ReLU y capa de salida de 10 logits. La softmax se aplica fuera del modelo, de modo que la salida son logits crudos. La convención de pesos es `x @ W + b`, con pesos almacenados en forma `(n_in, n_out)`.

El entrenamiento usó las 50.000 imágenes de entrenamiento de CIFAR-10 con etiquetas verdaderas (p = 0), pérdida de entropía cruzada, SGD con tasa de aprendizaje 0,05, tamaño de lote 64, 100 épocas sin parada temprana y semilla 11035. El preprocesado consiste en aplanar la imagen a 3.072 valores, dividir por 255 y estandarizar con `preprocess_mean` y `preprocess_std` calculados sobre las 50.000 imágenes de entrenamiento y guardados en el propio fichero. No se documenta uso de data augmentation, regularización, RLHF ni DPO; tampoco innovaciones como decodificación especulativa o atención lineal, ya que no es un transformer.

## Capacidades

- Clasificación de imágenes de CIFAR-10 en 10 clases (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Inferencia en NumPy puro mediante producto matricial y ReLU, sin dependencias de frameworks de deep learning.
- Reproducibilidad del entrenamiento con semilla fija (11035).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo de razonamiento (thinking mode), visión general, audio ni otras capacidades especiales.

## Casos de uso

- Docencia y prácticas de aprendizaje automático: sirve como referencia mínima de un MLP implementado en NumPy para ilustrar descenso de gradiente, preprocesado y evaluación train/test en CIFAR-10.
- Reproducción de experimentos académicos: la semilla y los hiperparámetros documentados permiten replicar el resultado (precisión de test 47,30 %) en un entorno controlado.
- Línea base (baseline) para comparativas: al ser un modelo denso sin convoluciones, es útil como cota inferior frente a CNN y transformers de visión en CIFAR-10.
- Estudio de sobreajuste: la brecha entre precisión de entrenamiento (90,83 %) y de test (47,30 %) lo convierte en un caso práctico para analizar overfitting y técnicas de regularización.
- Despliegue educativo en entornos sin GPU: al pesar 402.250 parámetros y usar solo NumPy, puede ejecutarse en CPU en cualquier portátil para demostraciones de inferencia.
- Pruebas de integración de pipelines de preprocesado: el fichero incluye `preprocess_mean` y `preprocess_std`, lo que permite validar flujos de normalización de imágenes de extremo a extremo.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son las precisiones finales del entrenamiento:

| Metrica | Valor |
|---|---|
| Precisión de entrenamiento | 90,83 % |
| Precisión de test | 47,30 % |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en FP32 (402.250 parámetros x 4 bytes ≈ 1,6 MB de pesos más buffers de activación), ejecutable en CPU.
- GPU recomendadas: no requiere GPU; cualquier CPU es suficiente. En caso de usar GPU, cualquier modelo consumer sirve (GTX 1050, RTX 3050, RTX 4090, A100, H100).
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: NumPy directamente sobre el fichero `model.npz`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, la inferencia por imagen es del orden de microsegundos a milisegundos en CPU, aunque no se aportan medidas oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precisión test CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smai-a4-mlp-p0 | 402.250 | no aplica | 47,30 % | MIT | Hugging Face (repo de 0,0 GB) |
| MLP de referencia CIFAR-10 (típico en cursos) | ~400.000 | no aplica | ~45-55 % | variable | no disponible |
| CNN pequeña tipo LeNet en CIFAR-10 | ~60.000-1.000.000 | no aplica | ~60-70 % | variable | no disponible |
| ResNet-18 en CIFAR-10 | ~11 millones | no aplica | ~93-95 % | variable | no disponible |

No se dispone de datos verificados de benchmarks para los modelos alternativos en la información proporcionada; las cifras orientativas de la tabla reflejan rangos habituales de la literatura y deben tratarse con cautela. No se han encontrado modelos comparables publicados con la misma configuración exacta en la información disponible.

## Limitaciones y advertencias

- Precisión de test baja (47,30 %) y sobreajuste acusado (90,83 % en entrenamiento frente a 47,30 % en test).
- Sesgos conocidos: no documentados; al entrenarse solo con CIFAR-10, hereda los sesgos y desequilibrios de ese dataset.
- Riesgo de alucinación: no aplica (no genera texto), pero sí puede producir clasificaciones erróneas con alta confianza en imágenes fuera de distribución.
- Limitaciones de contexto o idioma: no aplica; el modelo solo procesa imágenes de 32x32x3 con el preprocesado exacto documentado.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo es un ejercicio académico sin garantías de calidad.
- Caveats para producción: no hay pipeline de Hugging Face, no hay tests ni documentación de robustez, y el repo no incluye código de inferencia más allá de la descripción de los arrays; no se recomienda su uso en aplicaciones reales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/samarth1rao/smai-a4-mlp-p0)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.

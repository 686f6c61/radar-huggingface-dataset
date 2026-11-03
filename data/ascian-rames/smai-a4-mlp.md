# ascian-rames/smai-a4-mlp

## Resumen

`smai-a4-mlp` es un perceptrón multicapa (MLP) de tres capas entrenado para clasificación de imágenes sobre el conjunto de datos CIFAR-10. Lo publica el usuario `ascian-rames` en HuggingFace como artefacto de un trabajo académico de la asignatura SMAI (identificado por el número de matrícula `2026909003` y la semilla `9003`). No es un modelo de lenguaje ni un modelo fundacional: es una red neuronal densa de pequeño tamaño (199.082 parámetros) pensada para demostrar un flujo completo de entrenamiento, validación y evaluación sobre CIFAR-10.

El modelo resuelve una tarea muy concreta: clasificar imágenes RGB de 32x32 píxeles en una de las diez clases de CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco y camión). La arquitectura es `3072 -> 64 -> 32 -> 10` con activación ReLU en las capas ocultas y activación identidad en la salida, entrenada con entropía cruzada categórica. El repositorio tiene un tamaño de 0.0 GB y no registra descargas ni likes en el momento de la consulta.

Su relevancia es exclusivamente docente y de referencia: sirve como línea base reproducible (semilla fija, métricas documentadas) para comparar contra arquitecturas convolucionales o transformers de visión en CIFAR-10. No está pensado para producción, no soporta texto, código ni razonamiento, y su rendimiento es bajo (43,41 % de accuracy en test), coherente con la limitada capacidad de un MLP sobre imágenes sin sesgo inductivo convolucional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa denso), capas `3072 -> 64 -> 32 -> 10` |
| Parámetros totales | 199.082 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada fija de 3072 dimensiones) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio tiene 0.0 GB; la model card no especifica formato) |

## Arquitectura y entrenamiento

La red es un MLP totalmente conectado con dos capas ocultas de 64 y 32 neuronas respectivamente, activación ReLU en ambas y capa de salida de 10 neuronas con activación identidad, optimizada mediante entropía cruzada categórica. La entrada es un vector de 3072 dimensiones obtenido al aplanar cada imagen CIFAR-10 de 32x32x3 píxeles. El recuento de 199.082 parámetros es consistente con esta topología (3072·64 + 64 + 64·32 + 32 + 32·10 + 10).

El preprocesado documentado consta de tres pasos: aplanado de la imagen a un vector `float64` de 3072 dimensiones, escalado de los píxeles a `[0, 1]` dividiendo por 255.0, y estandarización por columna restando la media del conjunto de entrenamiento y dividiendo por la desviación típica del conjunto de entrenamiento (con divisor 1.0 cuando la desviación es cero). La model card no detalla el número de épocas, el optimizador, la tasa de aprendizaje ni el tamaño de lote, y no menciona técnicas de regularización, aumento de datos ni ajuste fino por RLHF/DPO (no aplicables a esta tarea). La semilla fija (`seed = 9003`) sugiere que el objetivo del trabajo era la reproducibilidad de los resultados.

## Capacidades

- Clasificación de imágenes CIFAR-10 en 10 clases, a partir de imágenes RGB de 32x32 píxeles.
- Inferencia sobre vectores de 3072 dimensiones preprocesados con el pipeline descrito (aplanado, escalado a `[0, 1]` y estandarización por columna).
- Reproducibilidad determinista del entrenamiento mediante semilla fija (`seed = 9003`).
- No soporta generación de texto, razonamiento, código, matemáticas ni visión general más allá de CIFAR-10.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües.
- No dispone de modo thinking, audio ni otras capacidades especiales.

## Casos de uso

- Línea base docente en cursos de machine learning: sirve para ilustrar el flujo completo de preprocesado, entrenamiento y evaluación sobre CIFAR-10, y para comparar contra CNN y transformers de visión con las mismas particiones de datos.
- Estudio de la brecha entre entrenamiento y test: con una pérdida de entrenamiento de 0,9144 frente a 2,6482 en test, el modelo es un ejemplo útil para explicar sobreajuste y la necesidad de regularización en MLPs.
- Reproducción de experimentos académicos: la semilla fija y las métricas documentadas permiten replicar exactamente los resultados en un ejercicio de validación de pipelines.
- Comparación de implementaciones (NumPy frente a framework): la model card reporta métricas de una implementación NumPy (validación 0,4672, test 0,4657) distintas de las del modelo entrenado, lo que permite contrastar implementaciones.
- Pruebas de infraestructura de despliegue ligero: al tener 199.082 parámetros, el modelo se puede servir en CPU sin GPU para validar pipelines de inferencia por lotes.
- Material de ejemplo en tutoriales de HuggingFace Hub: útil para demostrar la publicación de artefactos de investigación con model cards estructuradas.

## Benchmarks y rendimiento

Resultados reportados en la model card (sección 1.5, p = 0.0):

| Métrica | Valor |
|---|---|
| Pérdida de entrenamiento | 0,9144 |
| Pérdida de test | 2,6482 |
| Accuracy de entrenamiento | 0,6885 (68,85 %) |
| Accuracy de test | 0,4341 (43,41 %) |
| F1 medio | 0,4352 |
| Accuracy de validación (implementación NumPy, sección 1.2.5) | 0,4672 (46,72 %) |
| Accuracy de test (implementación NumPy, sección 1.2.5) | 0,4657 (46,57 %) |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos en precisión completa (199.082 parámetros), por lo que no requiere GPU.
- GPU recomendadas: ninguna en particular; cualquier GPU, incluso integrada, es suficiente.
- Cabe en cualquier GPU de consumo y también en CPU.
- Opciones de despliegue: no se especifican en la información disponible; al no documentarse el formato de pesos, no se puede confirmar compatibilidad con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, en cualquier caso no aplicables).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos comparables de la misma categoría (MLP sobre CIFAR-10) ni resultados de referencia frente a CNN u otras arquitecturas.

## Limitaciones y advertencias

- Rendimiento bajo: 43,41 % de accuracy en test sobre CIFAR-10, lejos de lo esperado en arquitecturas convolucionales; no es apto para uso real en clasificación de imágenes.
- Sobreajuste evidente: la pérdida de test (2,6482) duplica aproximadamente la de entrenamiento (0,9144), con una caída de accuracy de 68,85 % a 43,41 %.
- Entrada rígida: solo acepta imágenes de 32x32 píxeles preprocesadas exactamente como se describe; no generaliza a otras resoluciones ni a otros dominios visuales.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución; se debe contactar con el autor antes de cualquier uso fuera del ámbito académico.
- Idiomas no disponibles: el modelo no procesa texto, por lo que no aplica soporte multilingüe.
- Formato de pesos no documentado: el repositorio tiene 0.0 GB, lo que impide verificar que los pesos estén efectivamente publicados y en qué formato.
- Sin pipeline declarado en HuggingFace: no se puede cargar directamente con `pipeline()` sin conocer la tarea y el formato.
- Riesgo de sesgos: no documentado; al entrenarse sobre CIFAR-10, hereda los sesgos y desequilibrios de ese conjunto de datos.
- Riesgo de alucinación: no aplica (no es un modelo generativo de texto).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ascian-rames/smai-a4-mlp
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.

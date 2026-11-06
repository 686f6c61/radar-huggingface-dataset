# Poojitha376/smai-a4-mlp

## Resumen

SMAI A4 MLP es un modelo neuronal muy sencillo publicado en Hugging Face por el usuario Poojitha376, consistente en un perceptrón multicapa (MLP) de tres capas entrenado sobre el conjunto de datos CIFAR-10 para clasificación de imágenes en 10 categorías. No se trata de un modelo de lenguaje ni de un modelo generativo, sino de un artefacto académico de pequeño tamaño (197.322 parámetros) que probablemente forma parte de una práctica o trabajo de asignatura (las siglas "SMAI" y "A4" sugieren "Statistical Methods in AI", tarea 4).

La arquitectura es un MLP con dimensiones [3072, 64, 10]: aplana cada imagen de 32x32x3 píxeles a un vector de 3072 dimensiones, lo pasa por una capa oculta de 64 neuronas con activación ReLU y produce 10 logits correspondientes a las clases de CIFAR-10. Se entrenó durante 100 épocas con descenso de gradiente (probablemente estocástico) a una tasa de aprendizaje de 0,02 y tamaño de lote de 64, alcanzando una precisión de test del 44,48 %.

Su relevancia es limitada fuera del ámbito educativo: no es un modelo de propósito general, no soporta generación de texto ni tool calling, y sus pesos se distribuyen en formato NumPy (`.npz`), no en safetensors ni GGUF. Resulta útil como referencia didáctica de implementación desde cero de una red neuronal y de su pipeline de preprocesado, pero no como componente de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) con capas [3072, 64, 10] |
| Parametros totales | 197.322 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada fija de 3072 valores) |
| Tipos de cuantizacion | no disponible (pesos en float64 según la model card) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | NumPy `.npz` (`model.npz`), con `W{i}` de forma (n_in, n_out) y `b{i}` de forma (n_out,) |

## Arquitectura y entrenamiento

El modelo es un perceptrón multicapa de tres capas con dimensiones 3072 → 64 → 10. La capa de entrada recibe la imagen aplanada (32x32x3 = 3072 valores), la capa oculta aplica activación ReLU sobre 64 neuronas y la capa de salida emite 10 logits sin activación; para obtener probabilidades debe aplicarse softmax externamente. La función de pérdida es entropía cruzada. El preprocesado consiste en convertir a float64, dividir por 255 y estandarizar restando la media y dividiendo por la desviación típica calculadas sobre las 50.000 imágenes de entrenamiento de CIFAR-10 (almacenadas en `preprocessing.npz`).

El entrenamiento se realizó durante 100 épocas con tasa de aprendizaje 0,02, tamaño de lote 64 y semilla 1088, sin ruido añadido (`noise_p: 0.0`). No se menciona el optimizador, la presencia de regularización (weight decay, dropout) ni técnicas de aumento de datos. Los pesos se guardan en formato NumPy, lo que sugiere que el modelo se implementó con una librería propia del autor ("our NumPy library") y no con frameworks como PyTorch o TensorFlow. No hay innovaciones técnicas destacables: es una implementación básica de un MLP para clasificación de imágenes.

## Capacidades

- Clasificación de imágenes de 32x32x3 píxeles en 10 categorías (las clases de CIFAR-10: avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco y camión).
- Salida de logits crudos; requiere aplicar softmax para obtener probabilidades.
- Preprocesado específico incluido (`preprocessing.npz`) con media y desviación típica del conjunto de entrenamiento.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni procesa texto.
- No dispone de modo "thinking", visión general (solo clasificación de imágenes pequeñas), audio ni otras modalidades.
- No es un modelo generativo: no produce texto, código ni imágenes.

## Casos de uso

- Docencia y prácticas académicas: sirve como ejemplo completo de pipeline de entrenamiento desde cero (preprocesado, forward pass, pérdida, guardado de pesos) para asignaturas de aprendizaje automático. Su simplicidad permite inspeccionar cada peso y cada etapa.
- Referencia de clasificación base en CIFAR-10: puede usarse como línea base (baseline) de 44,48 % de precisión para comparar con arquitecturas convolucionales o transformers de visión en experimentos docentes.
- Verificación de implementaciones propias: al incluir los tensores `W{i}` y `b{i}` con formas explícitas, es útil para validar una implementación NumPy de una capa densa y de la función de pérdida de entropía cruzada.
- Pruebas de reproducibilidad: la semilla 1088 y los hiperparámetros documentados permiten reproducir el entrenamiento y comprobar la estabilidad de la precisión.
- Ejemplo de despliegue mínimo en entornos sin GPU: con apenas 197.322 parámetros y pesos en float64, cabe en cualquier máquina y puede ejecutarse en CPU con coste despreciable, útil para demostraciones en vivo.
- Estudio de limitaciones de los MLP frente a CNN: sirve para ilustrar por qué un perceptrón multicapa sin sesgo inductivo convolucional se queda en ~44 % en CIFAR-10 frente a precisiones superiores al 90 % de las CNN.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| CIFAR-10 test accuracy | 0,4448 (44,48 %) |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: inferior a 1 MB; los 197.322 parámetros en float64 ocupan aproximadamente 1,6 MB, por lo que cabe holgadamente en cualquier GPU o incluso en CPU.
- GPU recomendadas: ninguna en particular; cualquier GPU consumer (GTX 1050, RTX 3060, etc.) o CPU moderna es suficiente.
- Cabe en cualquier GPU consumer y en la mayoría de microcontroladores con suficiente memoria.
- Opciones de despliegue: al estar en formato `.npz`, requiere una implementación propia en NumPy; no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles en la información proporcionada, aunque por el tamaño del modelo se espera un coste de inferencia mínimo (microsegundos por muestra en CPU).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión CIFAR-10 | Licencia | Formato |
|---|---|---|---|---|---|
| SMAI A4 MLP | 197.322 | no aplica | 44,48 % | no disponible | NumPy `.npz` |
| LeNet-5 (CNN clásica) | ~60.000 | no aplica | ~70 % (referencia histórica) | no disponible | variable |
| ResNet-18 | ~11,2 M | no aplica | ~93-95 % | investigación | PyTorch, ONNX |
| ViT-B/16 | ~86 M | no aplica | ~98 % (con preentrenamiento) | Apache 2.0 (según variante) | safetensors, PyTorch |

Las cifras de los modelos comparativos son referencias generales de la literatura y no proceden de la información proporcionada; se incluyen solo como orientación. No se dispone de comparativas oficiales publicadas por el autor.

## Limitaciones y advertencias

- Modelo puramente académico: no está pensado para uso en producción ni para tareas reales de clasificación.
- Precisión baja (44,48 %) incluso en su propio dominio (CIFAR-10), muy por debajo de alternativas convolucionales.
- Solo acepta entradas de 32x32x3 píxeles con el preprocesado exacto de `preprocessing.npz`; cualquier otra resolución o normalización invalida los resultados.
- No procesa texto, audio ni imágenes de tamaño arbitrario.
- No se especifica licencia, por lo que el uso comercial es incierto y, en la práctica, desaconsejado sin aclaración del autor.
- Riesgo de sobreajuste no documentado: no se reportan métricas de validación ni curvas de entrenamiento.
- Sin información sobre sesgos: las clases de CIFAR-10 pueden presentar desequilibrios o sesgos de representación, pero no se analizan en la model card.
- No hay soporte de herramientas, agentes ni integración con frameworks estándar (PyTorch, TensorFlow, ONNX).
- Repositorio de 0,0 GB y sin descargas ni "likes": no hay evidencia de uso ni mantenimiento por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Poojitha376/smai-a4-mlp
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.

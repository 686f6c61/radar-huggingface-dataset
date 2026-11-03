# samarth1rao/smai-a4-ioc-p0

## Resumen

IOC-NN es una red neuronal totalmente conectada (MLP) implementada en NumPy y entrenada para clasificar imágenes del conjunto de datos CIFAR-10. El modelo forma parte de la asignación 4 del curso SMAI (Statistical Methods in Artificial Intelligence) y ha sido publicado por el usuario samarth1rao en HuggingFace. No es un modelo de lenguaje: no procesa texto ni genera respuestas, sino que recibe un vector de 3072 valores (una imagen de 32x32x3 aplanada y normalizada) y devuelve 10 logits correspondientes a las clases de CIFAR-10.

La arquitectura es un perceptrón multicapa de tres capas (3072 -> 128 -> 64 -> 10) con activación ELU en las capas ocultas y 402.250 parámetros totales. La innovación declarada por el autor es que los pesos de las capas 2 y 3 son no negativos, lo que convierte cada puntuación de salida en una función convexa de la entrada (de ahí el nombre "input-output convex network"). Esto facilita el análisis teórico del modelo, aunque no está claro que aporte ventajas prácticas en precisión.

El modelo alcanza una precisión de entrenamiento del 68,93 % y de test del 42,87 % sobre CIFAR-10. Es un artefacto educativo de tamaño reducido (repo de 0,0 GB) con licencia MIT, sin descargas ni interacciones registradas. No está pensado para producción ni para uso fuera del contexto docente de la asignatura.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa) totalmente conectado: 3072 -> 128 -> 64 -> 10 |
| Parámetros totales | 402.250 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible; pesos en `model.npz` (float, presumiblemente float32/float64 de NumPy) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `model.npz` (arrays NumPy: `W0, b0, W1, b1, W2, b2`) |

## Arquitectura y entrenamiento

El modelo es un MLP de tres capas con activación ELU en las capas ocultas y una capa de salida lineal que produce 10 logits; la softmax se aplica fuera del modelo. La entrada es una imagen CIFAR-10 aplanada de 32x32x3 = 3072 valores, normalizada dividiendo por 255 y restando la media y dividiendo por la desviación típica calculadas sobre las 50.000 imágenes de entrenamiento (`preprocess_mean` y `preprocess_std` se guardan junto con los pesos). Los pesos se almacenan con forma `(n_in, n_out)` y la inferencia se realiza como `x @ W + b`.

El entrenamiento se realizó con entropía cruzada y descenso de gradiente estocástico (SGD) con tasa de aprendizaje 0,05, tamaño de lote 64, 100 épocas y sin parada temprana, con semilla 11035. Se usaron las 50.000 imágenes de entrenamiento con sus etiquetas verdaderas (p = 0, es decir, sin ruido de etiquetas). La restricción de no negatividad en los pesos de las capas 2 y 3 es la característica técnica distintiva: garantiza que cada logit sea una función convexa de la entrada, lo que permite estudiar propiedades teóricas del modelo (por ejemplo, unicidad de mínimos locales o comportamiento bajo perturbaciones). No se documentan técnicas de regularización, aumento de datos ni optimizadores adaptativos.

## Capacidades

- Clasificación de imágenes de CIFAR-10 en 10 categorías (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Inferencia sobre vectores de 3072 dimensiones previamente normalizados con la media y desviación típica del conjunto de entrenamiento.
- Ejecución en NumPy puro, sin dependencias de frameworks de deep learning (PyTorch, TensorFlow) ni GPU.
- Propiedad de convexidad entrada-salida: cada logit es una función convexa de la entrada, lo que permite análisis teóricos de robustez y optimización.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generación de texto, código, matemáticas, visión general (solo CIFAR-10), audio ni capacidades multilingües.

## Casos de uso

- Docencia y aprendizaje de fundamentos de deep learning: el modelo sirve como ejemplo mínimo y reproducible de un MLP entrenado desde cero en NumPy, útil para cursos sobre retropropagación, normalización de datos y evaluación de clasificadores.
- Estudio de redes convexas: la restricción de pesos no negativos permite investigar propiedades de convexidad entrada-salida, como la existencia de óptimos globales o la respuesta a perturbaciones adversariales, en un entorno controlado y de bajo coste computacional.
- Reproducción de experimentos académicos: al fijar semilla (11035), hiperparámetros y preprocesado, el artefacto permite replicar exactamente el resultado de la asignación SMAI 4 y comparar variantes del entrenamiento.
- Pruebas de pipelines de preprocesado en NumPy: el par `preprocess_mean`/`preprocess_std` y el formato `model.npz` facilitan validar flujos de normalización y carga de pesos sin dependencias externas.
- Baseline de referencia para CIFAR-10: con un 42,87 % de precisión en test, puede usarse como línea base sencilla frente a CNN u otros modelos más complejos en experimentos comparativos.
- Inferencia en entornos sin GPU: al ser un MLP de 402.250 parámetros en NumPy, puede ejecutarse en CPU en cualquier máquina, lo que lo hace adecuado para demostraciones en entornos con recursos limitados.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Precisión de entrenamiento | 0,6893 (68,93 %) |
| Precisión de test | 0,4287 (42,87 %) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un modelo de lenguaje ni un clasificador de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB para los pesos (402.250 parámetros en float32 ≈ 1,6 MB, más las matrices de normalización); puede ejecutarse íntegramente en CPU.
- GPU recomendadas: no se requiere GPU; cualquier CPU moderna es suficiente. En caso de usar GPU, cualquier modelo (RTX 4090, A100, H100) funcionaría sin aprovecharse, ya que el código está en NumPy.
- Cabe en cualquier GPU de consumo e incluso en dispositivos embebidos o Raspberry Pi.
- Opciones de despliegue: carga directa de `model.npz` con `numpy.load` y multiplicación matricial; no hay soporte nativo para vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, la inferencia por imagen debería ser del orden de microsegundos a milisegundos en CPU, pero no se aportan mediciones.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Como referencia cualitativa, un MLP de 402.250 parámetros sobre CIFAR-10 se sitúa muy por debajo de arquitecturas convolucionales típicas (p. ej., ResNet-18, con ~11 millones de parámetros y precisiones de test superiores al 90 %), pero no se dispone de datos verificados de esos modelos en esta ficha, por lo que se indica "no disponible" para una comparación cuantitativa rigurosa.

| Modelo | Parámetros | Contexto | Precisión test CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IOC-NN (este modelo) | 402.250 | no aplica | 42,87 % | MIT | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Precisión de test baja (42,87 %), insuficiente para aplicaciones reales de clasificación de imágenes; es un artefacto educativo.
- Solo reconoce las 10 clases de CIFAR-10 y asume imágenes de 32x32x3 normalizadas con la media y desviación típica específicas del conjunto de entrenamiento; cualquier otra entrada producirá predicciones sin sentido.
- Sesgos conocidos: no documentados, pero al entrenarse solo con CIFAR-10 hereda los sesgos de ese conjunto (posibles desequilibrios de clase y sesgos de representación).
- Riesgo de alucinación: no aplica en el sentido de modelos generativos, pero sí puede producir clasificaciones erróneas con alta confianza en imágenes fuera de distribución.
- Limitaciones de contexto o idioma: no aplica, al no ser un modelo de lenguaje.
- Restricciones de licencia: licencia MIT, permite uso comercial y modificación con atribución; no obstante, el uso comercial del modelo en sí carece de sentido práctico por su baja precisión.
- Caveat para producción: no se recomienda su despliegue en entornos productivos; no hay soporte de frameworks de inferencia optimizados ni garantías de mantenimiento.
- El repositorio tiene 0 descargas y 0 interacciones, sin evidencia de validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/samarth1rao/smai-a4-ioc-p0
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.

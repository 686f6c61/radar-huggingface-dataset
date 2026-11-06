# HSM-0-0/smai-a4-ioc-nn

## Resumen

IOC-NN es una red neuronal completamente conectada desarrollada por el usuario HSM-0-0 como parte de la asignatura SMAI (Assignment 4). Se trata de un modelo de clasificación de imágenes entrenado sobre el conjunto de datos CIFAR-10, con una arquitectura de dos capas ocultas de tipo 3072-256-10 y entrenado durante 100 épocas con descenso de gradiente estocástico (SGD) convencional. Alcanza una precisión de test de 0,5007, un resultado modesto que refleja su naturaleza didáctica y su diseño experimental.

La característica técnica más destacable es su condición de red "input-output convex" (IOC): emplea activación ELU y fuerza que todos los pesos posteriores a la primera capa sean no negativos, sustituyendo cada peso negativo `w` por `exp(w - 5)` tras cada actualización. Esta restricción convierte el modelo en un caso de estudio sobre convexidad entrada-salida, más que en una herramienta orientada a producción.

El modelo tiene un interés limitado fuera del ámbito académico: no se han publicado datos sobre licencia, idiomas soportados ni benchmarks comparativos, y su tamaño de repositorio es de 0,0 GB (los pesos se distribuyen en formato `.npz` de NumPy). No obstante, resulta relevante como referencia reproducible de una técnica concreta de regularización arquitectónica aplicada a un problema estándar de visión por computador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) totalmente conectado, 3072-256-10, activación ELU |
| Parametros totales | 3072×256 + 256 + 256×10 + 10 = 789.002 (calculado a partir de la arquitectura descrita) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de clasificación de imágenes, sin contexto textual) |
| Tipos de cuantizacion | No disponible (pesos en punto flotante en formato `.npz`) |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | `.npz` (NumPy), con archivos `model.npz`, `preproc.npz` y `config.json` |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal feedforward de dos capas lineales con activación ELU entre ellas: la entrada son imágenes CIFAR-10 aplanadas a 3072 valores (32×32×3), seguidas de una capa oculta de 256 unidades y una capa de salida de 10 clases. Cada capa calcula `x @ W + b`, según la model card. El preprocesado consiste en dividir por 255, restar la media y dividir por la desviación típica por columna, calculadas sobre el conjunto de entrenamiento y almacenadas en `preproc.npz`.

El entrenamiento se realizó con SGD simple durante 100 épocas sobre las 50.000 imágenes de entrenamiento de CIFAR-10 con etiquetas verdaderas. La innovación técnica es la restricción IOC (input-output convex): tras cada actualización, todo peso negativo `w` de las capas posteriores a la primera se reemplaza por `exp(w - 5)`, manteniendo los pesos no negativos. No se menciona uso de RLHF, DPO, data augmentation ni técnicas de regularización adicionales. No se dispone de información sobre la composición exacta del dataset más allá de CIFAR-10 estándar.

## Capacidades

- Clasificación de imágenes en 10 categorías de CIFAR-10 (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Entrada exclusivamente de imágenes de 32×32 píxeles RGB aplanadas a 3072 valores.
- Inferencia determinista mediante producto matricial y activación ELU.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo "thinking", visión general, audio ni otras modalidades.
- No soporta generación de texto, código ni matemáticas.

## Casos de uso

- Docencia y reproducción de experimentos: el modelo sirve como ejemplo mínimo y reproducible de una red IOC entrenada con SGD, útil en asignaturas de aprendizaje automático para ilustrar restricciones de convexidad y su impacto en la precisión.
- Clasificación de imágenes de baja resolución en entornos controlados: puede emplearse para etiquetar imágenes de 32×32 en prototipos o demos donde la precisión del 50% sea aceptable y el coste computacional sea mínimo.
- Baseline de comparación en investigación: al ser un MLP sencillo con restricción IOC, permite medir la ganancia de arquitecturas convolucionales o transformers sobre CIFAR-10 en condiciones equivalentes de entrenamiento.
- Pruebas de pipelines de preprocesado: los archivos `preproc.npz` y `config.json` permiten validar flujos de normalización por columna y carga de pesos en formato NumPy antes de escalar a modelos mayores.
- Experimentos de regularización arquitectónica: la sustitución `exp(w - 5)` puede estudiarse como técnica de acotación de pesos y compararse con weight decay o clipping.
- Inferencia en dispositivos muy limitados: con menos de 800.000 parámetros, el modelo cabe en memoria de microcontroladores o CPUs de gama baja para tareas de clasificación elemental.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| CIFAR-10 test accuracy | 0,5007 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un modelo de lenguaje ni cubre esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en punto flotante de 32 bits (789.002 parámetros × 4 bytes ≈ 3,2 MB, más buffers de entrada de 3072 valores).
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente. Una GPU solo aportaría ventajas en entrenamiento por lotes grandes.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, GTX 1650) e incluso en Raspberry Pi o microcontroladores con suficiente RAM.
- Opciones de despliegue: carga directa con NumPy (`np.load`) e inferencia mediante operaciones matriciales; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de microsegundos a milisegundos por imagen en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IOC-NN (HSM-0-0) | ~789.002 | No aplica | 0,5007 | No disponible | Hugging Face |
| MLP estándar 3072-256-10 | ~789.002 | No aplica | No disponible | No disponible | No disponible |
| LeNet-5 | ~60.000 | No aplica | ~0,70 (referencia histórica) | No disponible | Múltiples implementaciones |
| ResNet-18 | ~11,2 M | No aplica | ~0,93-0,95 (referencia) | No disponible | Múltiples implementaciones |

No se dispone de datos comparativos publicados en la información proporcionada para modelos de la misma categoría IOC. Las cifras de LeNet-5 y ResNet-18 son referencias generales de la literatura y no provienen de la model card.

## Limitaciones y advertencias

- Precisión de test limitada (0,5007), insuficiente para la mayoría de aplicaciones reales de clasificación.
- Sesgos desconocidos: no se documenta análisis de sesgo por clase ni por subgrupos de CIFAR-10.
- Riesgo de alucinación no aplica (no es un modelo generativo), pero sí de clasificaciones erróneas sistemáticas en clases difíciles.
- Restricción de entrada: solo acepta imágenes de 32×32 píxeles RGB; no generaliza a otras resoluciones sin reentrenamiento.
- Licencia no disponible: no se puede confirmar el uso comercial; se recomienda contactar con el autor antes de cualquier despliegue productivo.
- Modelo de carácter académico (Assignment 4 de SMAI): no hay garantías de mantenimiento, soporte ni actualizaciones.
- La restricción IOC de pesos no negativos puede limitar la capacidad expresiva y explicar parte del bajo rendimiento frente a arquitecturas convolucionales.
- No se documentan datos sobre robustez ante perturbaciones, distribución fuera de CIFAR-10 ni calibración de probabilidades.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HSM-0-0/smai-a4-ioc-nn
- Dataset CIFAR-10: https://www.cs.toronto.edu/~kriz/cifar.html
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.

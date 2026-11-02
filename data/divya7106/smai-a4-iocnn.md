# Divya7106/smai-a4-iocnn

## Resumen

IOC-NN (3072-256-10, ELU) es una red neuronal completamente conectada (MLP) de dos capas desarrollada por el usuario Divya7106 como parte de la asignatura SMAI (Assignment 4, Q1). El modelo resuelve una tarea de clasificación de imágenes sobre CIFAR-10 (10 clases, imágenes de 32x32x3 píxeles) y se distribuye como un artefacto académico mínimo, no como un modelo de propósito general.

La arquitectura es deliberadamente simple: una capa oculta de 256 unidades con activación ELU y una capa de salida de 10 unidades con activación identidad (logits), entrenada con pérdida de entropía cruzada categórica (CCE) y descenso de gradiente estocástico. Cuenta con 789.258 parámetros y no incorpora mecanismos de atención, convolución ni contexto extendido; la "entrada" es un vector plano de 3072 dimensiones.

Su relevancia es exclusivamente didáctica y de referencia: sirve como línea base reproducible para comparar contra CNN y modelos más complejos en CIFAR-10, y como ejemplo de empaquetado de pesos en formato NumPy (`model.npz`). No es un modelo de lenguaje ni un modelo generativo, por lo que muchas de las categorías habituales de esta ficha (idiomas, tool calling, agentes) no aplican.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP (perceptrón multicapa), 3072-256-10, activación oculta ELU, salida identidad (logits) |
| Parámetros totales | 789.258 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de clasificación de imágenes, entrada fija de 3072 valores) |
| Tipos de cuantización | no disponible (pesos en `npz` float, presumiblemente float32/float64 de NumPy) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | `model.npz` (NumPy), con tensores `W0, b0, W1, b1`; `W` con forma `(n_in, n_out)` |

## Arquitectura y entrenamiento

La red es un MLP de dos capas: la entrada es un vector de 3072 dimensiones (imagen 32x32x3 aplanada), seguida de una capa oculta de 256 unidades con activación ELU y una capa de salida de 10 unidades sin activación (logits), optimizada con entropía cruzada categórica. Los pesos se almacenan con convención `(n_in, n_out)`, de modo que los logits se calculan como `elu(x @ W0 + b0) @ W1 + b1`.

El entrenamiento utiliza las 50.000 imágenes del conjunto de entrenamiento de CIFAR-10 con etiquetas verdaderas (p = 0, es decir, sin ruido de etiquetas), SGD con tasa de aprendizaje 0,02, tamaño de lote 64, 100 épocas y semilla 13010. El preprocesado consiste en aplanar cada imagen a 3072 valores, dividir por 255 y estandarizar con la media y la desviación típica calculadas sobre la partición de entrenamiento (fichero `preprocessing.npz`). No se reporta uso de aumentación de datos, regularización, RLHF/DPO ni técnicas de decodificación, al no tratarse de un modelo generativo.

## Capacidades

- Clasificación de imágenes de CIFAR-10 en 10 categorías (avión, automóvil, pájaro, gato, ciervo, perro, rana, caballo, barco, camión).
- Salida de logits por clase, apta para `argmax` o para aplicar softmax y obtener probabilidades.
- Entrada fija de 32x32x3 píxeles; requiere el mismo preprocesado (escalado a [0,1] y estandarización con estadísticas de entrenamiento).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo "thinking", visión general, audio ni generación de texto.

## Casos de uso

- Línea base académica en CIFAR-10: usar el modelo como referencia de MLP para comparar con CNN, ResNet o ViT en la misma partición de datos; su precisión de test (0,4999) sirve como cota inferior documentada.
- Docencia de preprocesado: ilustrar el efecto de la estandarización con media y desviación típica de la partición de entrenamiento frente a otras normalizaciones, usando `preprocessing.npz` y el script de evaluación.
- Reproducción de experimentos: al fijar semilla 13010, hiperparámetros y épocas, permite reproducir exactamente el entrenamiento y estudiar variabilidad por semilla.
- Análisis de sobreajuste: con 94,76 % de precisión en entrenamiento y 49,99 % en test, es un caso de estudio claro de la brecha train/test en modelos con muchos parámetros y pocos datos.
- Pruebas de infraestructura de inferencia: por su tamaño (0,0 GB y 789.258 parámetros), es útil para validar pipelines de carga de pesos NumPy y despliegue en entornos con recursos mínimos (CPU).
- Ejercicios de calibración y métricas: comparar logits frente a probabilidades softmax, matrices de confusión por clase y calibración en un modelo pequeño y rápido de evaluar.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Precisión de entrenamiento (CIFAR-10 train, 50.000 imágenes) | 0,9476 |
| Precisión de test (CIFAR-10 test) | 0,4999 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible; además, no aplican a un clasificador de imágenes.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB para los pesos (789.258 parámetros en float32 ≈ 3,2 MB) más el vector de entrada de 3072 valores; ejecutable en CPU sin GPU.
- GPU recomendadas: no requiere GPU; cualquier GPU (incluso integrada) es suficiente. No se justifica A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer y en entornos sin GPU (portátil, Raspberry Pi, contenedor ligero).
- Opciones de despliegue: inferencia directa con NumPy (carga de `model.npz` y operaciones matriciales); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera un coste de inferencia por lote muy bajo en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Precisión test CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IOC-NN (este modelo) | 789.258 | 3072 valores (32x32x3) | 0,4999 | no disponible | HuggingFace (repo de 0,0 GB) |
| MLP 3072-256-10 estándar (referencia genérica) | ~789.000 | 3072 valores | no disponible | no disponible | no disponible |
| CNN pequeña tipo LeNet en CIFAR-10 | ~60.000 | 32x32x3 | no disponible | no disponible | no disponible |

No se dispone de datos verificables de benchmarks para modelos comparables en la información proporcionada; las filas de referencia genérica no deben interpretarse como resultados medidos.

## Limitaciones y advertencias

- Precisión de test baja (0,4999) frente a la de entrenamiento (0,9476), lo que indica sobreajuste severo y escasa generalización.
- Modelo puramente académico, sin model card de licencia: no se especifican condiciones de uso comercial; debe asumirse que no hay autorización explícita.
- Sin información sobre sesgos: al entrenar solo con CIFAR-10, hereda los sesgos y desequilibrios de ese dataset (clases y contextos limitados).
- No es un modelo de lenguaje: no admite prompts, tool calling, agentes ni generación de texto; cualquier uso en esos dominios es inválido.
- Entrada rígida: solo acepta imágenes 32x32x3 con el preprocesado exacto (escalado y estandarización con `preprocessing.npz`); otras resoluciones o normalizaciones degradan el rendimiento.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí de clasificaciones erróneas confiadas (logits altos en clases incorrectas) sin mecanismo de abstención.
- Repositorio de 0,0 GB y sin descargas ni likes: no hay evidencia de mantenimiento, pruebas externas ni soporte.
- No apto para producción en tareas de visión reales; su uso debe limitarse a docencia, experimentación y comparación de líneas base.

## Enlaces

- HuggingFace: https://huggingface.co/Divya7106/smai-a4-iocnn
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.

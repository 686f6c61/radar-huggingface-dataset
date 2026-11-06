# MadKane/smai-a4-x8-numpy-mlp

## Resumen

X8 es un perceptrón multicapa (MLP) entrenado desde cero en NumPy puro (float64), sin autodiferenciación ni frameworks de deep learning, para la clasificación de imágenes del conjunto CIFAR-10. Lo desarrolla MadKane (Madhur, según el log de WandB) en el contexto de la asignatura Statistical Methods in AI del IIIT Hyderabad (Monsoon 2026), como parte de la asignación 4, sección 1.2. Es el modelo seleccionado en la tarea 1.2.5: el más pequeño de 18 MLPs entrenados cuya precisión de validación queda a menos de un punto porcentual del mejor.

La arquitectura es una red densa de dos capas: 3072 entradas (las 32×32×3 píxeles aplanadas), una capa oculta de 256 unidades con activación ReLU y una capa de salida de 10 logits con activación identidad, sumando 789.258 parámetros. El modelo no procesa secuencias ni texto: es un clasificador de imágenes de 10 clases, por lo que no dispone de ventana de contexto, tokenizador ni capacidades generativas.

Su relevancia es exclusivamente didáctica y de referencia: ilustra una implementación completa de entrenamiento (forward, backward, descenso de gradiente mini-batch, estandarización por píxel y aumento de datos por espejo horizontal) sin dependencias de PyTorch o TensorFlow. No es un modelo para producción ni para tareas de lenguaje.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP denso: 3072 → 256 (ReLU) → 10 (identidad; softmax para probabilidades) |
| Parámetros totales | 789.258 (pesos y sesgos) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de secuencia; entrada fija de 3072 valores) |
| Tipos de cuantización | no disponible (pesos en float64 NumPy; sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | NPZ (`X8_mlp_3072-256-10_relu.npz`) con arrays `W0` (3072, 256), `b0` (256), `W1` (256, 10), `b1` (10) y metadatos de arquitectura; preprocesado en `preprocessing.npz` |

## Arquitectura y entrenamiento

La red sigue la convención `h = φ(xW + b)` con entradas como vectores fila, de modo que `W` tiene forma (entradas, salidas). La capa oculta aplica ReLU y la de salida es lineal (identidad), con entropía cruzada categórica como función de pérdida. La inicialización es normal con varianza 2/n_in para la capa ReLU y 1/n_in para la salida, sesgos a cero y semilla 2061 (el número de matrícula módulo 100.000). Toda la implementación vive en `mlp_lib.py`, una biblioteca NumPy propia sin autodiferenciación.

Los datos provienen de `uoft-cs/cifar10`, uniendo train y test (60.000 imágenes) y aplicando un split estratificado propio de 3.600 / 1.200 / 1.200 imágenes por clase (36.000 train / 12.000 validación / 12.000 test). Cada imagen de entrenamiento se duplica espejada horizontalmente, resultando en 72.000 filas por época. El preprocesado aplana la imagen en orden altura-anchura-canal a 3.072 valores, convierte a float64, divide por 255 y estandariza cada columna con media y desviación típica calculadas sobre las 36.000 imágenes de entrenamiento. El optimizador es descenso de gradiente mini-batch simple, con tasa de aprendizaje 0,01, tamaño de lote 64 y sin acumulación de gradiente. El early stopping detiene el entrenamiento cuando la pérdida de validación mejora menos de un 1 % en 5 épocas (máximo 30); se detuvo tras 11 épocas y se conservaron los pesos de la última.

## Capacidades

- Clasificación de imágenes de CIFAR-10 en 10 clases: airplane, automobile, bird, cat, deer, dog, frog, horse, ship y truck.
- Inferencia puramente NumPy: la predicción se reduce a dos productos matriciales con ReLU intermedia y `argmax` sobre los logits.
- Carga verificada de pesos: `Model.load_from` comprueba la forma de cada array al cargar el NPZ.
- Preprocesado reproducible incluido: media y desviación típica por píxel en `preprocessing.npz`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de visión más allá de la clasificación de imágenes de 32×32 píxeles; no hay modo thinking, audio ni multimodalidad.

## Casos de uso

- Docencia de fundamentos de deep learning: sirve como referencia ejecutable de un MLP completo (forward, backward, descenso de gradiente, estandarización y early stopping) sin frameworks, útil en asignaturas de métodos estadísticos o aprendizaje automático.
- Verificación de pipelines de preprocesado: el par `preprocessing.npz` + `mlp_lib.py` permite comprobar que una implementación propia reproduce exactamente la precisión de validación (0,5329) y de test (0,5400) documentadas.
- Baseline de clasificación en CIFAR-10: con 789.258 parámetros y precisión de test del 54 %, sirve como cota inferior rápida frente a CNN o transformers visuales en experimentos comparativos.
- Pruebas de integración en entornos sin GPU ni frameworks: al ser NumPy puro y float64, puede ejecutarse en cualquier entorno con Python y NumPy, incluidos contenedores mínimos o CI sin aceleradores.
- Estudio de errores por confusión de clases: el modelo documenta sus confusiones típicas (cat ↔ dog, automobile ↔ truck, airplane → ship), lo que lo hace útil para analizar los límites de los modelos sin noción de vecindad espacial.
- Reproducción de experimentos con semilla fija: la semilla 2061 y los hiperparámetros documentados permiten replicar el entrenamiento y comparar variantes (tasa de aprendizaje, tamaño de capa, aumento de datos).

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Precisión de validación (12.000 imágenes) | 0,5329 |
| Precisión de test (12.000 imágenes) | 0,5400 |
| Parámetros | 789.258 |
| Épocas ejecutadas | 11 (early stopping; máximo 30) |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable; los pesos ocupan aproximadamente 789.258 × 8 bytes ≈ 6,3 MB en float64, más el vector de media y desviación (3.072 × 8 bytes cada uno).
- GPU recomendadas: no requiere GPU; la inferencia es viable en CPU con NumPy.
- Cabe en cualquier GPU consumer y en entornos sin GPU; también en Raspberry Pi o contenedores mínimos.
- Opciones de despliegue: Python con NumPy y el archivo NPZ; no hay soporte nativo en vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; para lotes pequeños el coste dominante es el producto matricial 3072×256, del orden de microsegundos a milisegundos por imagen en CPU moderna.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| X8 (este modelo) | 789.258 | no aplica | 0,5400 (test) | MIT | Hugging Face, NPZ |
| MLP de referencia en CIFAR-10 (p. ej. variantes del mismo autor) | no disponible | no aplica | no disponible | no disponible | no disponible |
| CNN pequeña tipo LeNet | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de alternativas en la información proporcionada; la comparación cuantitativa con otros clasificadores de CIFAR-10 no está disponible.

## Limitaciones y advertencias

- El MLP trata los 3.072 píxeles como un vector sin orden, sin noción de vecindad ni invariancia a traslación, por lo que su techo en CIFAR-10 se sitúa en torno al 50-55 %.
- Errores frecuentes documentados: confusión cat ↔ dog, automobile ↔ truck y airplane → ship.
- Es un ejercicio de curso, no un clasificador de producción; el propio autor lo advierte.
- No procesa texto ni secuencias: no tiene contexto, tokenizador ni capacidades generativas, por lo que no puede usarse en tareas de lenguaje.
- Riesgo de sobreajuste limitado por el early stopping, pero sin regularización explícita más allá del aumento por espejo.
- Sesgos conocidos: no documentados en la información disponible; al entrenar solo con CIFAR-10, las clases y la distribución de imágenes quedan restringidas a ese conjunto.
- Licencia MIT: permite uso comercial y modificación, pero el modelo no es adecuado para ello por su precisión y alcance.
- El preprocesado debe replicarse exactamente (aplanado en orden altura-anchura-canal, división por 255 y estandarización con las estadísticas del NPZ); cualquier desviación degrada la precisión.

## Enlaces

- Hugging Face: https://huggingface.co/MadKane/smai-a4-x8-numpy-mlp
- Registro de entrenamiento en WandB: https://wandb.ai/madhurkwork-iiit-hyderabad/smai-a4-mlp (run `explore-3072-256-10-relu-lr0.01-flip`)
- Dataset: https://huggingface.co/datasets/uoft-cs/cifar10

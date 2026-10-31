# Padma-n/smai-a4-iocnn-cifar10

## Resumen

IOC-NN (3072-256-128-10, ELU, non-negative weights) es un pequeño modelo de clasificación de imágenes entrenado sobre CIFAR-10, publicado por el usuario Padma-n en Hugging Face. No se trata de un modelo de lenguaje, sino de una red neuronal completamente conectada (MLP) de tres capas densas con activación ELU, cuya particularidad técnica es la imposición de pesos no negativos en las capas ocultas y de salida (a partir de la segunda capa). El nombre "IOC-NN" sugiere que forma parte de un trabajo académico o experimental (probablemente la práctica 4 de un curso, a juzgar por el identificador "smai-a4") relacionado con el estudio de redes con restricciones de signo en los pesos.

El modelo se entrena desde cero sobre las 50.000 imágenes del conjunto de entrenamiento de CIFAR-10, con preprocesado consistente en aplanado de la imagen, normalización por 255 y estandarización por columnas. Los resultados publicados muestran una precisión de entrenamiento del 89,85 % frente a una precisión de test del 49,46 %, lo que indica un sobreajuste muy pronunciado, algo esperable en un MLP puro sin convoluciones sobre imágenes naturales.

Su relevancia no es de producción, sino didáctica e investigadora: sirve como artefacto reproducible para estudiar el efecto de la restricción de no negatividad en los pesos sobre la capacidad de generalización, un tema de interés en interpretabilidad y en teoría de redes neuronales (monotonicidad, redes con pesos positivos, etc.).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (red densa) de 3 capas: 3072-256-128-10 |
| Parametros totales | 3072·256 + 256·128 + 128·10 + sesgos ≈ 819.450 |
| Parametros activos | no disponible (no aplica, no es MoE) |
| Longitud de contexto | no disponible (no aplica, no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica, modelo de vision por computador) |
| Licencia | no disponible |
| Formato de pesos | NPZ (model.npz, claves W0, b0, W1, b1, ...; W con forma (n_in, n_out)) |

## Arquitectura y entrenamiento

La arquitectura es un perceptron multicapa con capas densas de 3072, 256 y 128 neuronas, y una capa de salida de 10 logits (uno por clase de CIFAR-10) sin activacion final; la perdida empleada es softmax cross-entropy. La activacion oculta es ELU (Exponential Linear Unit). La entrada es una imagen de 32x32x3 aplanada a un vector de 3072 dimensiones, dividida por 255 y estandarizada por columnas usando la media y desviacion tipica calculadas sobre las 50.000 imagenes de entrenamiento (guardadas en preprocessing.npz, con desviacion calculada con divisor n).

El elemento distintivo es la restriccion de pesos no negativos: las capas 2 y 3 (y la de salida, segun la descripcion "layers 2,3,...") se inicializan con una distribucion uniforme(0, 2/n_in) y, tras cada actualizacion de SGD, cualquier peso negativo w se sustituye por exp(w-5), una proyeccion suave al dominio no negativo. La primera capa y todos los sesgos quedan sin restriccion. El entrenamiento usa SGD puro con learning rate 0.05, batch size 64, 100 epocas, sin early stopping y con semilla 2047, sobre las etiquetas verdaderas de CIFAR-10 (sin ruido de etiquetas, p = 0). No hay datos sobre datos adicionales, RLHF ni otras tecnicas, al no tratarse de un modelo generativo.

## Capacidades

- Clasificacion de imagenes en las 10 clases de CIFAR-10 (avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco, camion).
- Inferencia determinista y ligera: basta un producto matriz-vector sobre pesos en formato NPZ, sin dependencias de frameworks pesados.
- Reproducibilidad experimental: semilla fija y estadisticas de preprocesado incluidas en el repositorio.
- No tiene capacidades de generacion de texto, razonamiento, codigo, tool calling, agentes ni capacidades multilingues, al no ser un modelo de lenguaje.

## Casos de uso

- Docencia en aprendizaje automatico: ejemplo practico para ilustrar en clase el efecto de restringir el signo de los pesos en un MLP, comparando la precision en train (89,85 %) y test (49,46 %).
- Investigacion en redes con pesos no negativos: punto de partida reproducible para estudiar monotonicidad, interpretabilidad por signo de pesos o conexiones con teoremas de aproximacion con pesos positivos.
- Baseline para ablations: referencia para medir cuánto mejora un CNN o un MLP con regularizacion (weight decay, dropout, data augmentation) frente a este MLP restringido sobre CIFAR-10.
- Verificacion de pipelines de preprocesado: las estadisticas de normalizacion incluidas (mean/std por columna) permiten validar implementaciones de preprocesado de CIFAR-10.
- Ejercicio de reproducibilidad: replicar el entrenamiento (SGD, lr 0.05, batch 64, 100 epocas, semilla 2047) como practica de ingenieria de experimentos.
- Carga y evaluacion sin GPU: al ser un modelo de menos de un millon de parametros en NPZ, puede evaluarse en CPU o incluso en el navegador, util para demos educativas ligeras.

## Benchmarks y rendimiento

No existen benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) al no ser un modelo de lenguaje. Los unicos resultados publicados por el autor son:

| Metrica | Valor |
|---|---|
| Precision final en entrenamiento | 89,85 % |
| Precision final en test | 49,46 % |

Como referencia, modelos convolucionales sencillos sobre CIFAR-10 superan habitualmente el 75-90 % de precision en test, y los modelos de ultima generacion superan el 99 %, de modo que este MLP queda muy por debajo del estado del arte en esta tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; con unos 819.450 parametros en float32, los pesos ocupan unos 3,3 MB y la inferencia cabe en cualquier CPU.
- GPU recomendadas: no se necesita GPU ni para inferencia ni para reentrenar el modelo (el entrenamiento original es viable en CPU en minutos u horas).
- Consumer GPU: innecesario; cualquier equipo domestico es mas que suficiente.
- Opciones de despliegue: carga directa de model.npz con NumPy (logits = h @ W + b); no requiere vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; dada la dimension del modelo, la latencia por imagen en CPU sera del orden de milisegundos.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros aprox. | Precision test CIFAR-10 | Licencia |
|---|---|---|---|---|
| Padma-n/smai-a4-iocnn-cifar10 | MLP con pesos no negativos | ~0,82 M | 49,46 % (publicada) | no disponible |
| MLP estandar equivalente sin restriccion de signo | MLP 3072-256-128-10 | ~0,82 M | no disponible (tipicamente similar o algo superior) | no aplica |
| CNN sencilla tipo ResNet-18 sobre CIFAR-10 | CNN | ~11 M | ~95 % (tipico en literatura) | varia |
| ViT pequeno preentrenado ajustado a CIFAR-10 | Vision Transformer | ~22 M (ViT-B/16) o menor | >98 % (tipico) | varia |

Nota: las cifras de los modelos comparadores son valores tipicos de la literatura, no resultados oficiales del mismo protocolo de evaluacion.

## Limitaciones y advertencias

- Sobreajuste severo: la brecha de mas de 40 puntos porcentuales entre train (89,85 %) y test (49,46 %) indica que el modelo generaliza mal y no es apto para uso practico de clasificacion.
- Sin arquitectura convolucional: al procesar la imagen aplanada pierde la estructura espacial, lo que limita inherentemente su rendimiento en vision.
- Restriccion de pesos no negativos: reduce la capacidad expresiva del modelo; es una caracteristica experimental, no una ventaja de precision.
- Sin licencia declarada: no se puede confirmar el permiso para uso comercial o redistribucion; hay que consultar con el autor.
- Riesgo de alucinacion: no aplica, al no ser un modelo generativo.
- Sin pipeline declarado en Hugging Face, sin model card detallada mas alla del README y sin descargas registradas, lo que sugiere un artefacto experimental sin revision comunitaria.
- Reproducibilidad: los resultados dependen de la semilla 2047 y de la implementacion exacta de la proyeccion exp(w-5); otras implementaciones pueden dar resultados distintos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Padma-n/smai-a4-iocnn-cifar10
- Dataset de entrenamiento (CIFAR-10): https://huggingface.co/datasets/uoft-cs/cifar10
- Paper, repositorio de codigo y demo: no disponibles

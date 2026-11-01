# sanyamseac/smai-a4-mlp

## Resumen

SMai A4 MLP es un perceptron multicapa (MLP) de dos capas entrenado desde cero sobre CIFAR-10, publicado por el usuario sanyamseac como parte de la asignacion 4 de la asignatura SMAI (presumiblemente "Statistical Methods for AI"). No es un modelo de lenguaje ni un sistema generativo: es un clasificador de imagenes de 32x32x3 píxeles en diez categorias, con una arquitectura 3072-64-10 y 197.322 parametros totales.

El modelo resuelve un problema puramente academico: servir como referencia base (baseline) en la comparacion de la seccion 1.5 del trabajo, donde se contrasta con otro modelo entrenado con etiquetas ruidosas (p = 0 indica entrenamiento con etiquetas verdaderas). Su interes es, por tanto, documental y pedagogico: muestra los resultados de un MLP simple sin regularizacion, sin data augmentation y con SGD plano, alcanzando un 76,97 % de accuracy en entrenamiento frente a un 46,13 % en test.

Es relevante unicamente como ejemplo reproducible de sobreajuste severo y como punto de partida para experimentos de robustez a etiquetas ruidosas. No tiene aplicacion en produccion, no procesa texto, no soporta tool calling y no dispone de ventana de contexto en el sentido habitual de los modelos generativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP de 2 capas densas (3072-64-10), ReLU en capa oculta, salida lineal (logits) |
| Parametros totales | 197.322 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada fija de 3072 valores) |
| Tipos de cuantizacion | no disponible (pesos en float64 dentro de `model.npz`) |
| Idiomas soportados | no disponible (clasificacion de imagenes, sin capacidades linguisticas) |
| Licencia | CC0-1.0 |
| Formato de pesos | NumPy `.npz` (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

La red es un perceptron multicapa completamente conectado: aplana cada imagen CIFAR-10 de 32x32x3 en un vector de 3072 valores en orden (alto, ancho, canal), lo normaliza dividiendo por 255 y estandariza con `feature_mean` y `feature_std` calculados sobre las 50.000 imagenes de entrenamiento. La primera capa proyecta 3072 a 64 con activacion ReLU; la segunda proyecta 64 a 10 sin activacion, produciendo logits que se interpretan como probabilidades tras aplicar softmax. La inicializacion usa pesos N(0, 2/n_in) para la capa ReLU y N(0, 1/n_in) para la capa de salida, con sesgos a cero.

El entrenamiento emplea SGD plano con learning rate 0,02, batch size 64, sin acumulacion de gradientes, perdida de entropia cruzada categorica, 100 epocas sin early stopping, precision float64 y semilla 13006. No se menciona data augmentation, dropout, weight decay ni normalizacion por lotes. La unica fuente de datos es el split de entrenamiento de `uoft-cs/cifar10` (50.000 imagenes); no se indica uso de validacion cruzada ni de tecnicas de regularizacion adicionales.

## Capacidades

- Clasificacion de imagenes CIFAR-10 en diez clases: airplane, automobile, bird, cat, deer, dog, frog, horse, ship, truck.
- Inferencia determinista mediante producto matricial y ReLU, implementable en NumPy puro sin frameworks de deep learning.
- Reproducibilidad completa: pesos, estadisticas de normalizacion y metadatos de preprocesado almacenados en `model.npz`.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni generacion de texto.
- No dispone de modo thinking, vision avanzada, audio ni otras capacidades especiales.

## Casos de uso

- Baseline academico para comparacion de modelos: sirve como referencia inferior en experimentos sobre etiquetas ruidosas, tal como se plantea en la seccion 1.5 del trabajo original.
- Docencia de fundamentos de deep learning: permite mostrar en clase el calculo manual de forward pass, inicializacion de pesos y efecto del sobreajuste sin dependencias de frameworks.
- Implementacion de referencia en NumPy: util para validar implementaciones propias de capas densas, ReLU y softmax comparando salidas contra `model.npz`.
- Estudio de sobreajuste: la brecha entre 76,97 % en train y 46,13 % en test constituye un caso claro para analizar tecnicas de regularizacion (dropout, weight decay, early stopping).
- Pruebas de pipelines de preprocesado: valida flujos de aplanado, normalizacion y estandarizacion sobre CIFAR-10 antes de escalar a modelos mayores.
- Ejercicios de cuantizacion y compresion: al ser un modelo diminuto (197.322 parametros), es adecuado para experimentar con poda y cuantizacion sin coste computacional.

## Benchmarks y rendimiento

| Conjunto | Accuracy | Perdida CCE |
|---|---|---|
| Train (50.000 imagenes) | 0,7697 | 0,6530 |
| Test (10.000 imagenes) | 0,4613 | 2,2429 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB en float64 (197.322 parametros x 8 bytes ≈ 1,58 MB, mas buffers de entrada de 3072 valores por imagen); irrelevante en cualquier GPU moderna.
- GPU recomendadas: innecesarias; el modelo funciona en CPU sin coste apreciable.
- Cabe en cualquier GPU consumer e incluso en microcontroladores con suficiente RAM.
- Opciones de despliegue: NumPy puro (recomendado por el autor), PyTorch o cualquier framework que cargue matrices desde `.npz`.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, el throughput en CPU sera de orden de millones de imagenes por segundo en batch.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Accuracy test CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SMai A4 MLP (este) | 197.322 | 3072 valores | 0,4613 | CC0-1.0 | HuggingFace |
| CNN simple (referencia tipica) | no disponible | 32x32x3 | no disponible | no disponible | no disponible |
| ResNet-18 adaptada | no disponible | 32x32x3 | no disponible | no disponible | no disponible |

No se dispone de datos verificables de modelos comparables en la informacion proporcionada; la comparativa anterior solo refleja la categoria, no resultados medidos.

## Limitaciones y advertencias

- Sobreajuste severo: 76,97 % en train frente a 46,13 % en test, una brecha de mas de 30 puntos porcentuales.
- Sin regularizacion: no hay dropout, weight decay, data augmentation ni early stopping, lo que limita su generalizacion.
- Rendimiento absoluto bajo: 46,13 % de accuracy en CIFAR-10 esta muy por debajo de CNN y arquitecturas modernas, que superan el 90 %.
- Sesgos: al entrenar solo con CIFAR-10, hereda los sesgos de composicion y etiquetado de ese dataset; no se documenta analisis de subgrupos.
- Riesgo de alucinacion: no aplica, ya que no genera texto; el riesgo equivalente es la clasificacion erronea con confianza alta.
- Limitaciones de contexto o idioma: entrada fija de 3072 valores; no procesa texto ni otras modalidades.
- Restricciones de licencia: CC0-1.0 permite uso comercial sin atribucion, pero el modelo no es apto para produccion por su precision.
- Caveats para produccion: precision insuficiente para cualquier tarea real de vision; formato `.npz` no integrado en servidores de inferencia estandar; sin version en safetensors, GGUF ni ONNX.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sanyamseac/smai-a4-mlp
- Dataset CIFAR-10: https://huggingface.co/datasets/uoft-cs/cifar10

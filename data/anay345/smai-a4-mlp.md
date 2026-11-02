# anay345/smai-a4-mlp

## Resumen

smai-a4-mlp es un perceptron multicapa (MLP) muy sencillo entrenado para clasificacion de imagenes en el conjunto de datos CIFAR-10. Lo publica el usuario anay345 en HuggingFace como parte de la asignatura SMAI (probablemente "Sistemas y Metodos de Aprendizaje e Inteligencia Artificial"), identificado con el roll 2024102050. No es un modelo de lenguaje ni un transformer: se trata de una red neuronal fully-connected con una unica capa oculta de 256 neuronas y activacion ReLU, que recibe imagenes de 32x32x3 aplanadas a un vector de 3072 dimensiones y produce 10 logits (una clase por cada categoria de CIFAR-10).

El modelo resuelve un problema academico de clasificacion de imagenes de baja resolucion y su relevancia practica es limitada: sirve como referencia basica de entrenamiento con SGD, sin tecnicas de regularizacion ni constraints, y alcanza una precision de test del 49,96%, lejos del estado del arte en CIFAR-10 (que supera el 95% con redes convolucionales). No dispone de model card estandar, licencia declarada, idiomas ni pipeline definido, y el repositorio tiene un tamano de 0.0 GB, lo que sugiere que los pesos podrian no estar subidos o ser extremadamente pequenos.

Por su naturaleza, no debe confundirse con un modelo fundacional: no genera texto, no soporta tool calling ni agentes, y no tiene capacidades multilingues. Es util unicamente como ejemplo didactico de pipeline de entrenamiento y evaluacion en CIFAR-10, o como baseline minimo para comparaciones academicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (MLP) fully-connected: 3072 -> 256 -> 10, activacion ReLU en capa oculta, salida identity + softmax |
| Parametros totales | 3072*256 + 256 + 256*10 + 10 = 789.002 (calculado a partir de la arquitectura declarada) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada fija de 3072 valores) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio ocupa 0.0 GB; no se especifica safetensors, GGUF ni otro) |

## Arquitectura y entrenamiento

La arquitectura es un MLP de tres capas (entrada, una oculta y salida) definido explicitamente en la model card como `[3072, 256, 10]` con activacion ReLU en la capa oculta y salida de 10 logits seguida de softmax. La perdida es entropia cruzada categorica y no se aplica ninguna restriccion (constraint: null) ni regularizacion declarada. El preprocesamiento consiste en aplanar la imagen de formato HWC a un vector de 3072 elementos, dividir por 255 y estandarizar restando la media y dividiendo por la desviacion tipica calculadas en `preprocessing.npz`.

El entrenamiento se realizo con SGD, learning rate 0.01, batch size 64, sin acumulacion de gradientes (grad_accumulation_steps: 1), durante 100 epocas y con semilla 2050. Se uso la particion de entrenamiento de CIFAR-10 (50.000 imagenes) con etiquetas verdaderas (p=0, es decir, sin label noise). No se menciona uso de validacion cruzada, data augmentation, dropout, batch normalization ni schedule de learning rate. La precision de test reportada es 0,4996 (49,96%), lo que es coherente con un MLP sin convoluciones sobre CIFAR-10, donde los modelos convolucionales superan ampliamente el 90%.

## Capacidades

- Clasificacion de imagenes de 32x32 píxeles en una de las 10 clases de CIFAR-10 (avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco, camion).
- Inferencia sobre vectores aplanados de 3072 dimensiones con preprocesamiento estandarizado.
- Entrenamiento reproducible: semilla fija (2050) y configuracion documentada en la model card.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo thinking, vision avanzada, audio ni otras capacidades especiales.
- No es un modelo generativo: solo produce una distribucion de probabilidad sobre 10 clases.

## Casos de uso

- Baseline academico en cursos de aprendizaje automatico: sirve para comparar el rendimiento de un MLP simple frente a CNN y otros metodos en CIFAR-10, con una precision de referencia del 49,96%.
- Demostracion de pipelines de preprocesamiento: el uso de `preprocessing.npz` con media y desviacion tipica permite ilustrar la importancia de la estandarizacion en redes neuronales.
- Reproducibilidad de experimentos: la semilla y los hiperparametros documentados permiten replicar el entrenamiento en entornos docentes o de investigacion.
- Pruebas de integracion de infraestructura de inferencia: al ser un modelo minimo (789.002 parametros), es util para validar pipelines de serving (por ejemplo, endpoints HTTP o contenedores) antes de pasar a modelos mayores.
- Analisis de sensibilidad a hiperparametros: con una configuracion tan simple, se puede estudiar el efecto de cambiar learning rate, batch size o numero de epocas sin coste computacional elevado.
- Educacion sobre limitaciones de MLP en vision: el gap entre el 49,96% y el estado del arte en CIFAR-10 sirve para explicar por que las convoluciones y la augmentation son necesarias en vision por computador.

## Benchmarks y rendimiento

| Benchmark | Resultado | Notas |
|---|---|---|
| CIFAR-10 test accuracy | 0,4996 (49,96%) | Reportado en la model card; entrenado con 50k imagenes de train, sin augmentation declarada |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que el modelo no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en FP32 (789.002 parametros * 4 bytes ≈ 3,2 MB de pesos, mas activaciones y overhead del runtime). Cabe en cualquier GPU consumer, e incluso en CPU.
- GPU recomendadas: cualquiera; no requiere GPU dedicada. Una RTX 4090, A100 o H100 estarian enormemente sobredimensionadas para este modelo.
- Cabe en GPU consumer: si, en cualquier modelo (GTX 1050, RTX 3060, etc.), y tambien en CPU y en dispositivos embebidos.
- Opciones de despliegue: no se especifica framework en la model card. Al ser un MLP, podria desplegarse con PyTorch, NumPy, ONNX Runtime o TensorFlow, pero el formato de pesos no esta declarado y el repositorio ocupa 0.0 GB, por lo que la disponibilidad real de los pesos es incierta.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano, la latencia por muestra seria del orden de microsegundos en GPU y decenas de microsegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Precision CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smai-a4-mlp | 789.002 | 3072 (imagen aplanada) | 49,96% | no disponible | HuggingFace, repo 0.0 GB |
| MLP CIFAR-10 tipico (referencia academica) | ~1M | 3072 | ~50-55% | variable | no disponible |
| ResNet-20 (referencia CIFAR-10) | ~0,27M | 32x32x3 | ~91-92% | variable | ampliamente disponible |
| WideResNet-28-10 | ~36M | 32x32x3 | ~95-96% | variable | ampliamente disponible |

No se dispone de datos verificados de benchmarks comparativos en la informacion proporcionada para modelos concretos con licencia y disponibilidad confirmadas; las cifras de ResNet-20 y WideResNet-28-10 son referencias conocidas de la literatura, no extraidas de la busqueda. Se indica "no disponible" para comparaciones directas con modelos del mismo autor o misma asignatura.

## Limitaciones y advertencias

- Precision limitada: 49,96% en test, muy por debajo de CNN y transformers de vision; no apto para produccion en tareas reales de clasificacion.
- Sin licencia declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor.
- Repositorio de 0.0 GB: los pesos podrian no estar disponibles o no haberse subido, lo que impediria la inferencia real.
- Sin model card estandar: no hay informacion sobre sesgos, composicion del dataset mas alla de CIFAR-10, ni evaluacion de robustez.
- Sesgos potenciales: CIFAR-10 es un dataset de baja resolucion con clases desbalanceadas en el mundo real; el modelo hereda los sesgos de la particion y no se ha evaluado su comportamiento fuera de distribucion.
- Riesgo de sobreajuste: sin regularizacion declarada (constraint: null) y 100 epocas con SGD lr=0.01, es probable que el modelo sobreajuste el train set; no se reporta precision de train.
- Limitacion de entrada: solo acepta imagenes de 32x32x3 con el preprocesamiento exacto de `preprocessing.npz`; cualquier otra resolucion o normalizacion invalida las predicciones.
- Sin soporte de texto, audio ni multimodalidad: no es adecuado para tareas de NLP, agentes o tool calling.
- Caveat de produccion: no usar como componente critico en sistemas reales sin reentrenamiento, validacion y una licencia clara.

## Enlaces

- HuggingFace: https://huggingface.co/anay345/smai-a4-mlp
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.

# kinglacto/smai-a4-cifar10-mlp

## Resumen

SMAI A4 Q1 es un perceptron multicapa (MLP) de proposito academico entrenado sobre el conjunto de datos CIFAR-10 para clasificacion de imagenes en 10 categorias. Lo publica el usuario kinglacto bajo el identificador `kinglacto/smai-a4-cifar10-mlp`, presumiblemente como entrega de una practica de la asignatura SMAI (Sistemas y Modelos de Aprendizaje Inteligente) en su cuarta evaluacion. No es un modelo de lenguaje ni un sistema generativo: es una red neuronal densa de tres capas ocultas que recibe vectores de 3072 dimensiones (imagenes RGB de 32x32 aplanadas) y produce una distribucion de probabilidad sobre 10 clases.

La arquitectura declarada es 3072-256-128-10 con activacion ReLU en las capas ocultas, sumando 820.874 parametros entrenables. El autor reporta una precision de test de 0,5088 (50,88%), un valor coherente con un MLP basico sobre CIFAR-10, donde las CNN suelen superar el 80% pero un MLP sin convoluciones se queda en torno al 50-55%. El repositorio ocupa 0,0 GB, lo que sugiere que contiene unicamente el checkpoint `model.pt`, un `config.json` y un fichero `preprocessing.npz` con las estadisticas de normalizacion.

Su relevancia es limitada fuera del ambito docente: sirve como referencia de linea base para comparar arquitecturas convolucionales o como ejemplo minimo de pipeline de entrenamiento y evaluacion en PyTorch. No dispone de model card convencional, licencia declarada, idiomas ni pipeline asociado en Hugging Face, y no ha recibido descargas ni likes desde su publicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (MLP) denso, 3072-256-128-10, activacion ReLU |
| Parametros totales | 820.874 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada fija de 3072 dimensiones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`model.pt`), cargable con `torch.load` |
| Entrada | Vector aplanado de 3072 valores (imagen RGB 32x32) |
| Salida | Logits sobre 10 clases de CIFAR-10 |
| Preprocesado | `preprocessing.npz` (estadisticas de normalizacion) |
| Precision reportada | 0,5088 en test |

## Arquitectura y entrenamiento

La red es un `nn.Sequential` de capas `nn.Linear` con dimensiones 3072 → 256 → 128 → 10 y activacion ReLU entre capas ocultas. La capa de entrada recibe la imagen CIFAR-10 aplanada (3 canales × 32 × 32 = 3072 valores), y la capa de salida emite 10 logits correspondientes a las clases airplane, automobile, bird, cat, deer, dog, frog, horse, ship y truck. El desglose de parametros es aproximadamente 3072×256 + 256 = 786.688 en la primera capa, 256×128 + 128 = 32.896 en la segunda, y 128×10 + 10 = 1.290 en la salida, totalizando 820.874.

No se especifican en la informacion disponible el numero de epocas, el optimizador, la tasa de aprendizaje, el tamano de batch ni si se aplico data augmentation, dropout, weight decay o early stopping. Tampoco se indica la composicion exacta del split de entrenamiento/validacion/test, aunque CIFAR-10 estandar proporciona 50.000 imagenes de entrenamiento y 10.000 de test. No hay indicios de tecnicas avanzadas como atencion, convoluciones, normalizacion por lotes ni regularizacion explicita en la descripcion del autor.

## Capacidades

- Clasificacion de imagenes de 32x32 píxeles en las 10 clases de CIFAR-10.
- Inferencia sobre vectores aplanados de 3072 dimensiones tras normalizacion con las estadisticas de `preprocessing.npz`.
- Carga directa en PyTorch mediante `nn.Sequential` y `load_state_dict`.
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No dispone de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa lenguaje).
- No incorpora vision mas alla de la clasificacion de imagenes de baja resolucion.
- No dispone de modo thinking, audio ni modalidades adicionales.

## Casos de uso

- Linea base academica en cursos de aprendizaje profundo: el modelo sirve para comparar el rendimiento de un MLP frente a CNN sobre CIFAR-10, evidenciando la brecha de precision (50,88% frente a >80% de ResNet o VGG).
- Docencia de pipelines en PyTorch: permite ilustrar el flujo completo de carga de pesos, construccion de la arquitectura con `nn.Sequential` y aplicacion del preprocesado con `preprocessing.npz`.
- Pruebas de integracion de infraestructura de inferencia: al ser un checkpoint diminuto (menos de 1 MB en float32), se puede desplegar en cualquier entorno para validar pipelines de serving sin coste de GPU.
- Clasificacion rapida de miniaturas de baja resolucion en prototipos: si se dispone de imagenes 32x32 ya normalizadas, el modelo puede etiquetarlas en microsegundos en CPU.
- Benchmark de cuantizacion y optimizacion: sirve para medir el impacto de reducir precision (float16, int8) en un modelo con parametros conocidos y precision de referencia documentada.
- Reproducibilidad de experimentos docentes: al publicarse el estado del modelo y el preprocesado, otros estudiantes pueden reproducir la evaluacion y verificar la precision de 0,5088.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| CIFAR-10 test accuracy | 0,5088 |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje, ya que el modelo no es un modelo de lenguaje. Tampoco se proporcionan comparaciones con otras arquitecturas ni curvas de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en float32 (820.874 parametros × 4 bytes ≈ 3,3 MB de pesos, mas activaciones y overhead de PyTorch).
- GPU recomendadas: cualquier GPU con CUDA, incluidas GTX 1050, RTX 3060, RTX 4090, A100 o H100; el modelo no aprovecha la GPU de forma significativa.
- Cabe en cualquier GPU consumer e incluso en CPU y en dispositivos embebidos (Raspberry Pi, moviles con PyTorch Mobile).
- Opciones de despliegue: PyTorch nativo (`torch.load`), TorchScript, ONNX Runtime, o conversion a otros formatos. No aplica vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia sub-milisegundo en CPU moderna y throughput de miles de inferencias por segundo en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smai-a4-cifar10-mlp | 820.874 | no aplica | 0,5088 | no disponible | Hugging Face |
| MLP 3072-512-512-10 (tipico) | ~1,8 M | no aplica | ~0,52-0,55 | variable | Entrenamiento propio |
| LeNet-5 sobre CIFAR-10 | ~60 K | no aplica | ~0,60-0,65 | variable | Referencia academica |
| ResNet-18 sobre CIFAR-10 | ~11 M | no aplica | ~0,93-0,95 | variable | Referencia academica |

No se dispone de comparaciones publicadas por el autor. Los valores de las alternativas son rangos tipicos de la literatura y no resultados medidos en el mismo entorno, por lo que deben tomarse como orientativos.

## Limitaciones y advertencias

- Modelo de proposito academico sin licencia declarada; no se recomienda su uso comercial sin aclaracion explicita del autor.
- Precision de test de 0,5088, insuficiente para la mayoria de aplicaciones reales de clasificacion de imagenes.
- Sin convoluciones ni atencion, no captura patrones espaciales locales, lo que explica su bajo rendimiento frente a CNN.
- Entrada fija de 32x32 píxeles RGB; no admite otras resoluciones sin redimensionado externo.
- Depende del fichero `preprocessing.npz` para normalizar correctamente; omitirlo degrada la precision.
- No se documentan sesgos, composicion del dataset ni procedencia de las imagenes mas alla de CIFAR-10 estandar.
- Riesgo de alucinacion no aplica (no genera texto), pero si de clasificaciones erroneas en clases visualmente similares (gato/perro, ciervo/caballo).
- No hay informacion sobre el proceso de entrenamiento, lo que impide evaluar la solidez metodologica del resultado.
- Repositorio sin descargas ni likes; sin garantias de mantenimiento ni soporte.

## Enlaces

- Hugging Face: https://huggingface.co/kinglacto/smai-a4-cifar10-mlp
- Dataset CIFAR-10: https://www.cs.toronto.edu/~kriz/cifar.html
- Documentacion PyTorch `nn.Sequential`: https://pytorch.org/docs/stable/generated/torch.nn.Sequential.html
- Documentacion PyTorch `load_state_dict`: https://pytorch.org/docs/stable/generated/torch.nn.Module.html#torch.nn.Module.load_state_dict

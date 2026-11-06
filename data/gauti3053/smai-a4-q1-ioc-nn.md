# gauti3053/smai-a4-q1-ioc-nn

## Resumen

`smai-a4-q1-ioc-nn` es un modelo neuronal de pequeno tamano publicado por el usuario gauti3053 en Hugging Face, concebido como entregable academico de la asignatura SMAI (Assignment 4, Q1). No es un modelo de lenguaje ni un modelo fundacional: es un clasificador de imagenes para CIFAR-10 con una arquitectura totalmente conectada de dos capas (3072 -> 128 -> 10) y una restriccion de no negatividad sobre los pesos de las capas posteriores a la primera. Su interes no reside en el rendimiento bruto, sino en el contexto experimental: ilustra el comportamiento de una red con pesos restringidos a valores no negativos ("IOC-NN", probablemente *Input-Output Convex Neural Network* o similar) en una tarea de vision clasica.

El modelo se entrena con descenso de gradiente estocastico (SGD, lr 0.01, batch 64) durante 100 epocas en precision float64, partiendo de los 50.000 ejemplos de entrenamiento de CIFAR-10 y evaluado sobre los 10.000 de test. Alcanza una precision de test de 0.4781 y una precision de entrenamiento de 0.7933, lo que evidencia un ajuste limitado y una brecha train/test considerable, coherente con una red pequena y fuertemente restringida. No hay informacion sobre licencia, idiomas ni pipeline de Hugging Face, y el repositorio ocupa 0.0 GB.

Es relevante ahora unicamente como referencia pedagogica o como caso de estudio reproducible: permite analizar como la restriccion de pesos afecta a la capacidad de representacion frente a un MLP sin restricciones del mismo tamano, y sirve como ejemplo minimo de entrenamiento reproducible en float64 con semilla fija.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP totalmente conectado: 3072 -> 128 -> 10, activacion ELU en capa oculta, salida Identity (logits) |
| Parametros totales | 394.634 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada fija de 3072 valores) |
| Tipos de cuantizacion | no disponible (pesos en float64 en `model.npz` y `model_state_dict.pt`) |
| Idiomas soportados | no disponible (clasificador de imagenes, sin capacidad linguistica) |
| Licencia | no disponible |
| Formato de pesos | `model.npz` (W0, b0, W1, b1 con W de forma (n_in, n_out) e `info_json`) y `model_state_dict.pt` (PyTorch `nn.Sequential(Linear, ELU, Linear)`) |

## Arquitectura y entrenamiento

La red es un perceptron multicapa de dos capas densas: una proyeccion lineal de 3072 entradas (imagen CIFAR-10 aplanada en orden HWC, 32x32x3) a 128 unidades ocultas con activacion ELU, seguida de una capa lineal de 128 a 10 logits sin activacion final. El total de parametros es 394.634. La innovacion declarada es la restriccion de no negatividad: tras cada paso de optimizacion, cualquier peso negativo en las capas posteriores a la primera se transforma mediante `exp(w - 5)`, lo que mantiene los pesos en el dominio no negativo y penaliza valores muy negativos. Esta restriccion es la que da sentido al experimento, ya que limita severamente la expresividad del modelo.

El entrenamiento usa SGD con learning rate 0.01, batch de 64, acumulacion de gradiente 1, 100 epocas, precision float64 y semilla 2062. El preprocesado divide los pixeles por 255 y estandariza cada columna con la media y desviacion tipica de las 50.000 imagenes de entrenamiento (con divisor 1 cuando la std es 0); esos estadisticos se guardan en `standardisation_train50k.npz`. No se menciona uso de RLHF, DPO, aumento de datos ni decodificacion especulativa; se trata de un entrenamiento supervisado clasico con etiquetas verdaderas.

## Capacidades

- Clasificacion de imagenes CIFAR-10 en 10 clases (avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco, camion).
- Entrada fija de 3072 valores float64 correspondiente a una imagen 32x32x3 aplanada en orden HWC.
- Salida de 10 logits (sin softmax incorporado), apta para aplicar argmax o softmax externamente.
- Pesos restringidos a valores no negativos en las capas posteriores a la primera, lo que permite estudiar modelos con restricciones de monotonia o convexidad.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No dispone de modo thinking, vision general, audio ni generacion de texto.

## Casos de uso

- Estudio academico de restricciones de pesos: el modelo sirve para comparar, en un entorno controlado, el rendimiento de un MLP con pesos no negativos frente a uno sin restriccion con la misma arquitectura y semilla.
- Reproduccion de experimentos docentes: los ficheros `model.npz` y `model_state_dict.pt` permiten cargar los pesos y verificar la precision de test (0.4781) sobre CIFAR-10 con el preprocesado documentado.
- Analisis de brecha train/test: con precision de entrenamiento 0.7933 y de test 0.4781, es un caso practico para ilustrar sobreajuste y el efecto de la restriccion en la generalizacion.
- Baseline minimo en pipelines de vision: puede usarse como referencia inferior frente a CNN o transformers de vision en tareas de clasificacion de imagenes de 32x32.
- Docencia de preprocesado: el fichero `standardisation_train50k.npz` y la division 50.000/10.000 permiten practicar estandarizacion por columna y gestion de std cero.
- Pruebas de integracion de formatos: al ofrecer pesos en `.npz` y en `state_dict` de PyTorch, sirve para validar cargadores de modelos en ambos ecosistemas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision de test (10.000 imagenes CIFAR-10) | 0.4781 |
| Precision de entrenamiento | 0.7933 |
| Parametros | 394.634 |
| Epocas | 100 |
| Learning rate | 0.01 |
| Batch | 64 |
| Precision numerica | float64 |
| Semilla | 2062 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con modelos similares dentro de la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en float64 (394.634 parametros x 8 bytes ~ 3,2 MB mas buffers), por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: cualquiera; no requiere A100, H100 ni RTX 4090. Una GTX 1050 o una iGPU son suficientes.
- Cabe en GPU consumer: si, en todas, incluidas las de gama de entrada y las integradas.
- Opciones de despliegue: PyTorch nativo (`model_state_dict.pt`), NumPy (`model.npz`) o exportacion manual a ONNX; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano, la inferencia por lote es del orden de microsegundos a milisegundos en GPU y de pocos milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Precision test CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smai-a4-q1-ioc-nn | 394.634 | 3072 valores (32x32x3) | 0.4781 | no disponible | Hugging Face |
| MLP sin restriccion de mismo tamano | no disponible | 3072 valores | no disponible | no disponible | no disponible |
| CNN pequena tipo LeNet | no disponible | 32x32x3 | no disponible | no disponible | no disponible |

No se dispone de datos comparativos publicados en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas; la comparativa queda limitada a la referencia interna del propio experimento.

## Limitaciones y advertencias

- Precision de test limitada (0.4781) y brecha notable frente a la de entrenamiento (0.7933), indicativa de sobreajuste y de la restriccion de pesos.
- La restriccion W >= 0 en capas posteriores a la primera reduce la expresividad y puede impedir representar funciones que requieran pesos negativos.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta agentes ni tool calling; cualquier uso en esos ambitos es inadecuado.
- Entrada fija de 3072 valores en orden HWC y preprocesado concreto (division por 255 y estandarizacion con estadisticos de `standardisation_train50k.npz`); usar otro preprocesado degrada los resultados.
- Licencia no disponible: no se puede asumir uso comercial sin consultar al autor.
- Sin informacion sobre sesgos del dataset CIFAR-10 mas alla de los conocidos de la propia base de datos; no se documentan evaluaciones de robustez ni de equidad.
- Riesgo de alucinacion no aplica (no genera texto), pero si de clasificaciones erroneas en clases visualmente similares.
- Repositorio de 0.0 GB y sin pipeline declarado: la integracion automatica en Hugging Face no esta garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gauti3053/smai-a4-q1-ioc-nn
- Dataset CIFAR-10 referenciado: https://huggingface.co/datasets/uoft-cs/cifar10
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.

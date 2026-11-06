# Santhlabs/smai-a4-cifar10-iocnn

## Resumen
smai-a4-cifar10-iocnn es una red neuronal fully-connected de tipo Input-Output Convex Neural Network (IOC-NN) entrenada para clasificar imagenes del dataset CIFAR-10. El modelo lo publica el usuario Santhlabs en Hugging Face como entrega de la asignacion 4 de la asignatura SMAI (roll number 2024102054, semilla 2054), con variante p = 0 (etiquetas limpias, sin ruido). No es un modelo de lenguaje ni un modelo generativo: es un clasificador de imagenes de 32x32 pixeles en 10 clases, con una arquitectura de 3072 -> 128 -> 64 -> 10 y 402.250 parametros totales.

La relevancia del modelo es academica y experimental: implementa la restriccion de convexidad entrada-salida descrita por Sivaprasad et al. (arXiv:2006.05103), donde cada logit de salida es una funcion convexa de la entrada. Esto se consigue imponiendo pesos no negativos en las capas ocultas (a partir de la capa 2) y una activacion ELU. El autor verifica empiricamente que 0 de 100 pares de imagenes de test violan la convexidad de punto medio de los logits, mientras que un MLP equivalente la viola en 100 de 100 pares.

El rendimiento es modesto: 49,25% de accuracy en test frente a 81,39% en train, con F1 medio de 0,4849. El repositorio ocupa 0,0 GB y no registra descargas ni likes en el momento de la consulta. Es, por tanto, un artefacto de investigacion educativa, no un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP con restriccion IOC-NN (3072 -> 128 -> 64 -> 10), activacion oculta ELU, salida identidad (logits lineales) |
| Parametros totales | 402.250 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada fija de 3072 valores, imagen 32x32x3 aplanada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (segun metadatos; el modelo no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `.npz` (convencion NumPy, `W_i` de forma (n_in, n_out) y `b_i`; transponer para `torch.nn.Linear`) y `.json` con la arquitectura; `preprocessing.npz` con arrays `mean` y `std` |

## Arquitectura y entrenamiento
La red es un perceptron multicapa de tres capas lineales (3072 -> 128 -> 64 -> 10) con activacion ELU en las capas ocultas y salida lineal (identidad) optimizada con entropia cruzada softmax. La innovacion clave es la restriccion de convexidad: los pesos de las capas 2 en adelante son no negativos, inicializados con uniforme(0, 2/n_in) y, tras cada paso de optimizacion, cualquier peso w < 0 se sustituye por exp(w - 5). La primera capa queda sin restriccion. Esta combinacion garantiza que cada logit sea una funcion convexa de la entrada.

El entrenamiento usa PyTorch con SGD plano, learning rate 0,03, batch size 128 y 100 epocas sobre las 50.000 imagenes de entrenamiento de CIFAR-10 con etiquetas limpias (p = 0). El preprocesado aplana la imagen a 3072 valores, divide por 255 y resta la media por columna del conjunto de entrenamiento y divide por la desviacion tipica, cuyos valores se guardan en `preprocessing.npz`. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa, ya que no aplica a un clasificador.

## Capacidades
- Clasificacion de imagenes de CIFAR-10 en 10 clases (avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco, camion).
- Procesamiento de imagenes de 32x32 pixeles en color (3 canales) aplanadas a vectores de 3072 dimensiones.
- Salida de logits lineales compatibles con softmax y entropia cruzada.
- Garantia matematica de convexidad entrada-salida de los logits (verificada empiricamente en 100 pares de test).
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision general, audio ni modo de pensamiento.
- No es multilingue ni genera texto: la etiqueta `en` en los metadatos es administrativa y no refleja una capacidad linguistica real.

## Casos de uso
- Docencia y practicas de convexidad en redes neuronales: el modelo sirve como referencia reproducible para asignaturas que estudian IOC-NN, ya que incluye pesos, arquitectura y preprocesado en formato NumPy.
- Experimentos de robustez adversarial: al ser convexo en la entrada, permite estudiar como se comportan los ataques de gradiente frente a un MLP no restringido con la misma capacidad.
- Baseline de clasificacion de imagenes de bajo coste: con 402.250 parametros y 0,0 GB de repositorio, se puede ejecutar en CPU para pruebas rapidas de pipelines de vision.
- Verificacion de propiedades teoricas: util para comprobar numericamente la convexidad de punto medio de los logits sobre pares de imagenes, tal como hace el autor.
- Prototipado de preprocesado estandarizado: el archivo `preprocessing.npz` con media y desviacion tipica por columna facilita replicar exactamente el flujo de inferencia.
- Comparacion de arquitecturas en CIFAR-10: sirve como contrapunto a MLP convencionales y a modelos convolucionales en estudios sobre el compromiso entre convexidad y precision.
- Reproduccion de resultados academicos: permite replicar el 49,25% de accuracy de test y el 81,39% de train documentados en la model card.

## Benchmarks y rendimiento
Los unicos datos publicados en la informacion disponible son los del autor sobre el conjunto de test de CIFAR-10 (10.000 imagenes):

| Metrica | Valor |
|---|---|
| Accuracy de test | 49,25% |
| Accuracy de train | 81,39% |
| F1 medio | 0,4849 |
| Pares de test que violan convexidad de punto medio (IOC-NN) | 0 / 100 |
| Pares de test que violan convexidad de punto medio (MLP) | 100 / 100 |

No se han publicado resultados de benchmarks comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un clasificador de CIFAR-10.

## Requisitos de hardware
- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene 402.250 parametros y los pesos en `.npz` ocupan unos pocos megabytes.
- GPU recomendadas: cualquier GPU, incluidas integradas; no requiere A100, H100 ni RTX 4090.
- Cabe en cualquier GPU consumer (GTX 1050, RTX 2060, RTX 3060, etc.) y tambien en CPU.
- Opciones de despliegue: carga directa con NumPy (formato `.npz`) o PyTorch tras transponer los pesos; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia de milisegundos en CPU y microsegundos en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Accuracy test CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Santhlabs/smai-a4-cifar10-iocnn | 402.250 | 3072 (32x32x3) | 49,25% | MIT | Hugging Face |
| imtotallysane/smai-a4-cifar10-iocnn | no disponible | 3072 (32x32x3) | no disponible | no disponible | Hugging Face |
| MLP equivalente sin restriccion de convexidad (referencia del autor) | no disponible | 3072 (32x32x3) | no disponible | no disponible | no disponible |

La unica alternativa identificada en la busqueda es otra entrega de la misma asignacion (imtotallysane/smai-a4-cifar10-iocnn, roll number 2024101023), de la que no se detallan parametros ni resultados. No se dispone de comparaciones con modelos convolucionales de referencia ni con otros IOC-NN en la informacion proporcionada.

## Limitaciones y advertencias
- Precision limitada: 49,25% en test frente a 81,39% en train indica sobreajuste y un rendimiento muy por debajo de clasificadores convolucionales modernos en CIFAR-10.
- Ambito restringido: solo clasifica las 10 clases de CIFAR-10 a 32x32 pixeles; no generaliza a otras resoluciones, dominios ni tareas.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes, y la etiqueta de idioma `en` no implica capacidades linguisticas.
- La restriccion de convexidad sacrifica expresividad; el propio autor documenta que el MLP equivalente viola la convexidad en todos los pares evaluados, lo que evidencia el compromiso entre la propiedad teorica y la precision.
- Riesgo de alucinacion no aplicable en el sentido habitual, pero el modelo puede producir predicciones erroneas con alta confianza en imagenes ambiguas o fuera de distribucion.
- Sesgos: no se documentan sesgos especificos; CIFAR-10 es un dataset pequeno y desbalanceado en dificultad por clase, lo que puede trasladarse al modelo.
- Licencia MIT permite uso comercial, pero el modelo es un artefacto academico sin garantias de calidad para produccion.
- El repositorio no registra descargas ni likes en la fecha consultada, por lo que no hay evidencia de uso o validacion por parte de la comunidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Santhlabs/smai-a4-cifar10-iocnn
- Entrega alternativa de la misma asignacion: https://huggingface.co/imtotallysane/smai-a4-cifar10-iocnn
- Paper de referencia sobre IOC-NN (Sivaprasad et al.): https://arxiv.org/abs/2006.05103
- Dataset CIFAR-10: https://www.cs.toronto.edu/~kriz/cifar.html

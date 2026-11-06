# gauti3053/smai-a4-q1-mlp

## Resumen

`smai-a4-q1-mlp` es un perceptron multicapa (MLP) minimo entrenado sobre CIFAR-10, publicado por el usuario `gauti3053` como parte de la asignatura SMAI (Assignment 4, Q1). No es un modelo de lenguaje ni un modelo fundacional: se trata de un clasificador de imagenes de 10 clases con una unica capa oculta de 128 neuronas, pensado como referencia academica para comparar el efecto de etiquetas ruidosas frente a etiquetas verdaderas en la tarea 1.4.2 del enunciado.

La arquitectura es una red densa `3072 -> 128 -> 10` con activacion ReLU en la capa oculta y salida identidad (logits crudos), sumando 394.634 parametros. La entrada es la imagen de CIFAR-10 aplanada a 3072 dimensiones (32x32x3 en orden HWC), normalizada dividiendo por 255 y estandarizada por columna con la media y desviacion tipica del conjunto de entrenamiento de 50.000 imagenes.

El interes es puramente pedagogico: sirve como linea base reproducible (semilla 2062, SGD con lr 0.01 y 100 epocas en float64) para estudiar el rendimiento de un MLP bajo etiquetas limpias. Alcanza una precision de test de 0,4731 y una precision de entrenamiento de 0,8701, lo que evidencia sobreajuste y la limitacion intrinseca de un MLP sin convoluciones sobre imagenes. No dispone de model card de uso general, licencia declarada ni pipeline asociado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (MLP): 3072 -> 128 -> 10, activacion oculta ReLU, salida identidad (logits) |
| Parametros totales | 394.634 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada fija de 3072 valores) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (clasificador de imagenes, sin capacidades linguisticas) |
| Licencia | no disponible |
| Formato de pesos | `model.npz` (W0, b0, W1, b1 con forma (n_in, n_out) e `info_json`) y `model_state_dict.pt` (PyTorch `nn.Sequential(Linear, ReLU, Linear)`) |

## Arquitectura y entrenamiento

La red es un MLP de dos capas lineales separadas por una ReLU: la primera capa proyecta las 3072 dimensiones de la imagen aplanada a 128, la segunda proyecta de 128 a 10 logits (uno por clase de CIFAR-10). No hay normalizacion por lotes, dropout ni conexiones residuales segun la informacion disponible. La salida es identidad, de modo que la funcion de perdida esperada es entropia cruzada sobre logits (no se especifica en la model card, pero es coherente con la salida declarada).

El entrenamiento usa SGD con tasa de aprendizaje 0.01, tamano de lote 64, acumulacion de gradiente 1 y 100 epocas, en precision float64 y con semilla 2062. Los datos son CIFAR-10 (`uoft-cs/cifar10`): 50.000 imagenes de entrenamiento y 10.000 de test. El preprocesado aplana cada imagen a 3072 valores en orden HWC, divide por 255 y estandariza cada columna con la media y desviacion tipica de las 50.000 imagenes de entrenamiento (los valores se guardan en `standardisation_train50k.npz`; cuando la desviacion tipica es 0 se usa divisor 1). No se menciona uso de RLHF, DPO ni tecnicas de aumento de datos.

## Capacidades

- Clasificacion de imagenes de CIFAR-10 en 10 clases (avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco, camion).
- Inferencia sobre imagenes de 32x32x3 aplanadas a 3072 dimensiones y estandarizadas con la media y desviacion tipica del conjunto de entrenamiento.
- Salida de logits crudos (10 valores) que requieren softmax externo para obtener probabilidades.
- Carga directa en PyTorch mediante `model_state_dict.pt` o en NumPy mediante `model.npz`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas ni capacidades multilingues.
- No dispone de modo thinking, vision general (mas alla de CIFAR-10), audio ni multimodalidad.

## Casos de uso

- Linea base academica en cursos de aprendizaje automatico: permite reproducir el experimento de la tarea 1.4.2 con semilla fija y comparar el efecto de etiquetas ruidosas frente a etiquetas verdaderas sobre la precision de test.
- Estudio de sobreajuste en MLP: la brecha entre precision de entrenamiento (0,8701) y de test (0,4731) lo convierte en un ejemplo controlado para analizar regularizacion, dropout o early stopping.
- Comparacion de preprocesado: sirve para evaluar como afecta la estandarizacion por columna (media y desviacion tipica de 50.000 imagenes) frente a otras normalizaciones en un clasificador denso.
- Docencia de despliegue en NumPy: el fichero `model.npz` permite implementar la inferencia (producto matricial + ReLU + producto matricial) sin framework, util para explicar el funcionamiento interno de una red.
- Pruebas de pipelines de evaluacion: con 10.000 imagenes de test y una metrica conocida (0,4731), sirve para validar que un script de evaluacion o de carga de datos funciona correctamente.
- Referencia para experimentos de destilacion o poda: al ser un modelo de 394.634 parametros, es un candidato manejable para probar tecnicas de compresion y medir la caida de precision resultante.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son las precisiones del propio modelo sobre CIFAR-10:

| Metrica | Valor |
|---|---|
| Precision de test (10.000 imagenes) | 0,4731 |
| Precision de entrenamiento | 0,8701 |

No se han publicado resultados comparativos con otros modelos (MLP, CNN, ResNet, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos (394.634 parametros en float32 ocupan aproximadamente 1,6 MB), mas el espacio de activaciones, despreciable.
- GPU recomendadas: cualquier GPU, incluida una GTX 1050 o integrada; el modelo cabe holgadamente en cualquier tarjeta consumer.
- Cabe en CPU sin problema: la inferencia sobre una imagen requiere dos productos matriciales de 3072x128 y 128x10.
- Opciones de despliegue: PyTorch nativo (`model_state_dict.pt`), NumPy (`model.npz`) o cualquier runtime que cargue tensores; no se ha publicado integracion con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, la latencia por imagen sera del orden de microsegundos en GPU y de decenas de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Precision en CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gauti3053/smai-a4-q1-mlp` | 394.634 | 3072 valores (32x32x3) | 0,4731 (test) | no disponible | Hugging Face |
| MLP equivalente con etiquetas ruidosas (tarea 1.4.2 del mismo enunciado) | 394.634 | 3072 valores | no disponible en la informacion proporcionada | no disponible | no disponible |
| CNN / ResNet sobre CIFAR-10 | no disponible | 32x32x3 | no disponible en la informacion proporcionada | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada; la comparativa se limita a la referencia interna del propio enunciado.

## Limitaciones y advertencias

- Modelo puramente academico: no es un modelo de lenguaje ni un modelo fundacional, por lo que no debe emplearse en tareas de generacion, razonamiento o codigo.
- Precision de test baja (0,4731): insuficiente para cualquier aplicacion en produccion; un clasificador aleatorio sobre 10 clases obtendria 0,10, pero el modelo esta lejos de alternativas convolucionales.
- Sobreajuste marcado: la diferencia entre precision de entrenamiento (0,8701) y de test (0,4731) indica que memoriza el conjunto de entrenamiento.
- Dependencia estricta del preprocesado: la inferencia requiere aplanar a 3072 en orden HWC, dividir por 255 y estandarizar con la media y desviacion tipica de `standardisation_train50k.npz`; cualquier otra normalizacion degrada la salida.
- Sin licencia declarada: no se especifican condiciones de uso comercial ni redistribucion; debe contactarse con el autor antes de cualquier uso fuera del ambito academico.
- Sin idiomas ni capacidades linguisticas: no aplica soporte multilingue.
- Sin documentacion de sesgos: no se han publicado analisis de sesgos por clase ni de rendimiento desagregado.
- Riesgo de alucinacion no aplicable (no genera texto), pero si de clasificaciones erroneas con alta confianza en clases visualmente similares (por ejemplo, gato frente a perro).
- Repositorio sin descargas ni likes y con pipeline no declarado: no hay evidencia de uso o validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/gauti3053/smai-a4-q1-mlp
- Dataset CIFAR-10 referenciado en la model card: `uoft-cs/cifar10` (no se proporciona URL directa en la informacion disponible)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.

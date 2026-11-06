# Shivansh521/smai-a4-mlp

## Resumen

`smai-a4-mlp` es un modelo neuronal muy sencillo publicado por el usuario Shivansh521 en Hugging Face, concebido como entregable de la asignatura SMAI (Statistical Methods for Artificial Intelligence, presumiblemente). No es un modelo de lenguaje ni un modelo generativo: se trata de un perceptron multicapa (MLP) de dos capas entrenado para clasificar imagenes del conjunto CIFAR-10 en una de diez categorias. Su arquitectura es 3072-32-10, es decir, una unica capa oculta de 32 neuronas con activacion ReLU y una capa de salida de 10 logits con perdida softmax de entropia cruzada.

El modelo resuelve exclusivamente la tarea de clasificacion de imagenes de 32x32x3 pixeles en las diez clases de CIFAR-10 (avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco y camion). Alcanza una precision de test de 0,4131, un resultado coherente con un MLP pequeno entrenado sobre caracteristicas aplanadas, muy por debajo de lo que lograria una CNN, pero suficiente como ejercicio academico de comparacion.

Su relevancia practica es practicamente nula fuera del ambito docente: el repositorio ocupa 0,0 GB, no tiene descargas ni likes, no declara licencia ni idiomas, y el formato de pesos es NumPy (`.npz`), no safetensors ni GGUF. Debe interpretarse como un artefacto de aprendizaje, no como un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (MLP) 3072-32-10, activacion ReLU en capa oculta, salida lineal con softmax |
| Parametros totales | 98.474 (3072x32 + 32 + 32x10 + 10) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en float, sin variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | NumPy `.npz` (`weights.npz` con `w_0, b_0, w_1, b_1`) y `config.json` con la configuracion de entrenamiento |

## Arquitectura y entrenamiento

La arquitectura es un MLP de dos capas completamente conectadas. La entrada es la imagen CIFAR-10 aplanada a un vector de 3072 dimensiones (`X.reshape(-1, 3072)`), normalizada dividiendo entre 255 y estandarizada por columna con la media y la desviacion tipica calculadas sobre las 50.000 imagenes de entrenamiento de CIFAR-10 (guardadas en `preprocessing.npz`). La capa oculta tiene 32 neuronas con ReLU y la capa de salida proyecta a 10 logits que se interpretan mediante softmax con perdida de entropia cruzada.

El modelo se entrena sobre las etiquetas verdaderas de CIFAR-10 (el autor indica explicitamente "p = 0", en referencia a un contexto de etiquetas ruidosas o sinteticas del ejercicio), sin restricciones adicionales declaradas. No hay informacion sobre el numero de epocas, optimizador, tasa de aprendizaje, tamano de batch ni tecnicas de regularizacion en los datos proporcionados; esos detalles estarian presumiblemente en `config.json`, pero no se han publicado en la model card. No se empleo RLHF, DPO ni ninguna tecnica de alineacion, al no tratarse de un modelo de lenguaje.

## Capacidades

- Clasificacion de imagenes de 32x32x3 en las diez clases de CIFAR-10.
- Extraccion de caracteristicas aplanadas y estandarizadas de imagenes del mismo formato y distribucion que CIFAR-10.
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa lenguaje).
- No dispone de modo thinking, vision avanzada ni audio; la "vision" se limita a la clasificacion de imagenes de baja resolucion.

## Casos de uso

- Docencia y ejercicios de aprendizaje automatico: sirve como referencia base para comparar un MLP contra una CNN en CIFAR-10, ya que reproduce un experimento controlado con precision de test documentada (0,4131).
- Reproduccion de experimentos academicos: el paquete `weights.npz` + `preprocessing.npz` permite reproducir exactamente las predicciones del autor aplicando el mismo preprocesado.
- Estudio de preprocesado de imagenes: el pipeline (aplanado, division entre 255 y estandarizacion por columna con estadisticos del conjunto de entrenamiento) es un ejemplo didactico de fuga de informacion controlada y de normalizacion correcta.
- Pruebas de infraestructura de inferencia ligera: con 98.474 parametros, el modelo se carga en cualquier entorno Python con NumPy, lo que lo hace util para validar pipelines de carga de pesos y preprocesado antes de escalar a modelos mayores.
- Baseline en tareas de clasificacion de imagenes de bajo coste: puede servir como suelo de rendimiento frente al que medir mejoras de arquitecturas convolucionales en el mismo conjunto.
- Analisis de limitaciones de los MLP en vision: util para ilustrar por que la perdida de estructura espacial al aplanar la imagen degrada la precision frente a arquitecturas que preservan la localidad.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| CIFAR-10 test accuracy | 0,4131 |

No se han publicado otros resultados de benchmarks en la informacion disponible. No hay comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB para los pesos (98.474 parametros en float32, aproximadamente 394 KB), mas el coste de cargar una imagen de 32x32x3.
- GPU recomendadas: ninguna en particular; el modelo se ejecuta en CPU sinproblemas.
- Cabe en cualquier GPU consumer, e incluso en entornos sin GPU (Raspberry Pi, portatiles basicos).
- Opciones de despliegue: Python con NumPy para cargar `weights.npz`; no es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, la inferencia por imagen es del orden de microsegundos a milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision CIFAR-10 | Licencia | Formato |
|---|---|---|---|---|---|
| smai-a4-mlp (este) | 98.474 | no aplica | 0,4131 | no disponible | NumPy `.npz` |
| LeNet-5 (referencia historica) | ~60.000 | no aplica | ~0,70 (tipico en CIFAR-10 con entrenamiento adecuado) | no disponible | varía |
| ResNet-20 (referencia CIFAR) | ~270.000 | no aplica | ~0,91 (reportado en literatura) | no disponible | varía |

No se dispone de comparaciones publicadas en la informacion proporcionada. Las cifras de LeNet-5 y ResNet-20 son referencias generales de la literatura y no provienen de la model card de este repositorio; deben tomarse con cautela y verificarse en las fuentes originales.

## Limitaciones y advertencias

- Precision de test baja (0,4131): insuficiente para cualquier aplicacion real de clasificacion de imagenes.
- El aplanado de la imagen destruye la estructura espacial, lo que limita severamente la capacidad del modelo frente a CNN.
- Solo acepta imagenes de 32x32x3 con el preprocesado exacto del autor; cualquier otra entrada produce predicciones sin sentido.
- No es un modelo de lenguaje: no procesa texto, no genera contenido y no soporta tool calling ni agentes.
- Licencia no declarada: no se puede asumir permiso de uso comercial; conviene contactar con el autor antes de cualquier uso fuera del ambito academico.
- Sin descargas ni validacion externa: no hay evidencia de reproducibilidad por terceros.
- Riesgo de sobreajuste no documentado: no se publican curvas de entrenamiento ni metricas de validacion.
- El formato `.npz` requiere codigo propio para la inferencia; no hay integracion con frameworks de serving estandar.
- No se declaran sesgos, pero al entrenarse solo con CIFAR-10 hereda los sesgos de composicion y etiquetado de ese conjunto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Shivansh521/smai-a4-mlp
- Conjunto de datos CIFAR-10: https://www.cs.toronto.edu/~kriz/cifar.html
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.

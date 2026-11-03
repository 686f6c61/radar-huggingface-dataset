# bonda007/smai-a4-cifar10-ioc-nn

## Resumen

IOC-NN para CIFAR-10 es un modelo de clasificación de imágenes de muy pequeno tamano publicado por el usuario bonda007 como parte de la asignatura SMAI (Assignment 4, Q1). Se trata de un perceptron multicapa totalmente conectado con arquitectura 3072 -> 128 -> 64 -> 10, activacion ELU en las capas ocultas y sin activacion en la salida (10 logits entrenados con softmax cross-entropy). No es un modelo de lenguaje ni un transformer: es una red densa de clasificacion de imagenes de 32x32 píxeles en 10 clases.

La particularidad tecnica del modelo es la restriccion IOC (Input Convex Neural Network): los pesos de las capas 2 y 3 son no negativos, de modo que cada logit es una funcion convexa de la entrada. Esto lo convierte en un ejemplo didactico de ICNN aplicado a vision, con garantias de convexidad respecto a la entrada que pueden explotarse en optimizacion y analisis de robustez.

El modelo resuelve exclusivamente la tarea de clasificacion de CIFAR-10 y su relevancia practica es limitada: alcanza un 47,98 % de accuracy en test, muy por debajo de los modelos convolucionales modernos. Su interes es academico y educativo, y el repositorio no incluye pesos en formato estandar de HuggingFace ni pipeline declarado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa totalmente conectado (3072 -> 128 -> 64 -> 10), activacion ELU en capas ocultas, sin activacion en salida |
| Parametros totales | 402.826 (calculado a partir de las dimensiones: 3072x128 + 128 + 128x64 + 64 + 64x10 + 10) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; entrada fija de 3072 valores) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades linguisticas) |
| Licencia | no disponible |
| Formato de pesos | NumPy `.npz` (`model.npz` con claves W0, b0, W1, b1, ...; W con forma (n_in, n_out)) |

## Arquitectura y entrenamiento

La red es un MLP de tres capas densas con 3072 entradas (imagenes CIFAR-10 aplanadas en orden altura, anchura, canal), dos capas ocultas de 128 y 64 neuronas con activacion ELU y una capa de salida lineal de 10 logits. La innovacion declarada es la restriccion IOC-NN: los pesos de las capas 2 y 3 son no negativos, lo que garantiza que cada logit sea una funcion convexa de la entrada. No se especifica en la model card el metodo exacto de proyeccion o recorte de pesos usado para mantener la no negatividad durante el entrenamiento.

El entrenamiento se realizo en PyTorch con SGD plano, learning rate 0,05, batch size 64 y 100 epocas sobre las 50.000 imagenes de entrenamiento de CIFAR-10 con sus etiquetas verdaderas (p = 0), con semilla 11018. El preprocesado incluye conversion a float, division por 255 y estandarizacion por columna con media y desviacion tipica calculadas sobre el conjunto de entrenamiento (guardadas en `preprocessing.npz`; las desviaciones de 0 se sustituyen por 1). No se menciona uso de RLHF, DPO ni tecnicas de aumento de datos.

## Capacidades

- Clasificacion de imagenes CIFAR-10 en 10 clases (avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco, camion).
- Entrada fija de 32x32x3 píxeles aplanada a 3072 valores; no admite otras resoluciones sin reentrenamiento.
- Funcion convexa respecto a la entrada en cada logit, lo que permite analisis de convexidad y optimizacion sobre la entrada.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Sin capacidades multilingues.
- Sin modo thinking, vision general, audio ni generacion de texto.

## Casos de uso

- Docencia sobre redes convexas: el modelo sirve como ejemplo ejecutable de ICNN para explicar en clase como la no negatividad de los pesos impone convexidad respecto a la entrada y que implicaciones tiene en la superficie de decision.
- Analisis de robustez adversarial: al ser convexo en la entrada, permite estudiar ataques y cotas de robustez con herramientas de optimizacion convexa, algo mas dificil en redes no convexas.
- Verificacion de preprocesado en pipelines de vision: el par `model.npz` + `preprocessing.npz` documenta de forma explicita la media y desviacion tipica por columna, util como referencia para comprobar implementaciones de normalizacion.
- Baseline de comparacion en experimentos academicos: con 402.826 parametros y un 47,98 % de accuracy en test, sirve como cota inferior frente a CNN y modelos con aumento de datos en trabajos de asignatura.
- Reproduccion de experimentos: la semilla, hiperparametros y configuracion estan documentados en `config.json`, lo que permite replicar el entrenamiento y comprobar la variabilidad de resultados.
- Pruebas de carga de pesos en bibliotecas propias: el metodo `load_from` valida las formas de los arrays, por lo que el modelo es util para testear rutinas de serializacion y validacion de tensores en codigo educativo.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Accuracy de entrenamiento (final) | 0,8347 |
| Accuracy de test | 0,4798 |
| Conjunto de entrenamiento | 50.000 imagenes CIFAR-10 |
| Conjunto de test | 10.000 imagenes CIFAR-10 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 10 MB en float32 (402.826 parametros x 4 bytes, mas buffers de activacion); cabe holgadamente en cualquier GPU, CPU o incluso microcontrolador con memoria suficiente.
- GPU recomendadas: no requiere GPU; cualquier CPU moderna es suficiente. Una RTX 4090, A100 o H100 estarian enormemente sobredimensionadas para este modelo.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU integrada.
- Opciones de despliegue: no hay soporte nativo en vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje. El unico camino documentado es cargar `model.npz` con la biblioteca NumPy de la asignatura mediante `model.load_from("model.npz")`.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, la inferencia por imagen es del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Accuracy CIFAR-10 test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| IOC-NN (este modelo) | 402.826 | 32x32x3 fija | 0,4798 | no disponible | HuggingFace, pesos `.npz` |
| MLP estandar de tamano similar | no disponible | 32x32x3 fija | no disponible | no disponible | no disponible |
| CNN pequena tipo LeNet | no disponible | 32x32x3 fija | no disponible | no disponible | no disponible |
| ResNet-18 | no disponible | 32x32x3 fija | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada; las filas distintas de la primera se incluyen solo como referencia de categoria y sus valores se marcan como no disponibles.

## Limitaciones y advertencias

- Rendimiento limitado: 47,98 % de accuracy en test frente a mas del 90 % habitual en CNN modernas sobre CIFAR-10; no es apto para produccion.
- Entrada fija: solo acepta imagenes de 32x32x3 aplanadas en orden altura, anchura, canal; cualquier otro formato requiere reentrenamiento.
- Sin licencia declarada: no se especifican terminos de uso comercial, por lo que no debe asumirse permiso de uso en produccion.
- Repositorio de 0,0 GB segun HuggingFace, lo que sugiere que los pesos pueden no estar efectivamente subidos o que el tamano se redondea; conviene verificar la presencia real de `model.npz`, `preprocessing.npz` y `config.json`.
- Dependencia de la biblioteca de la asignatura: la carga requiere la implementacion NumPy del cuaderno de SMAI, no disponible como paquete estandar.
- Riesgo de sobreajuste: la brecha entre accuracy de entrenamiento (0,8347) y de test (0,4798) es de aproximadamente 35 puntos porcentuales.
- Sesgos: no documentados; al entrenarse solo con CIFAR-10, hereda los sesgos de ese dataset (clases desbalanceadas en escenarios reales, imagenes de baja resolucion).
- Sin soporte de idiomas, texto, tool calling ni agentes; no debe evaluarse como modelo de lenguaje.

## Enlaces

- HuggingFace: https://huggingface.co/bonda007/smai-a4-cifar10-ioc-nn
- Dataset CIFAR-10 referenciado: https://huggingface.co/datasets/uoft-cs/cifar10
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.

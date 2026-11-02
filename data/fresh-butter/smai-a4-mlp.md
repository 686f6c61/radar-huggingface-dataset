# Fresh-butter/smai-a4-mlp

## Resumen

`smai-a4-mlp` es un perceptron multicapa (MLP) de tipo red neuronal totalmente conectada publicado en HuggingFace por el usuario Fresh-butter bajo el identificador `Fresh-butter/smai-a4-mlp`. Se trata de un artefacto academico correspondiente a la "Assignment 4" de una asignatura de sistemas de machine learning (SMAI), entrenado para clasificar imagenes del conjunto de datos CIFAR-10 en diez categorias. No es un modelo de lenguaje ni un modelo generativo: es un clasificador de imagenes de pequeno tamano con una arquitectura trivial de cuatro capas densas.

La red recibe la imagen aplanada en un vector de 3072 dimensiones (32x32x3, orden de filas, canales al final) y la propaga a traves de capas ocultas de 512, 256 y 128 neuronas con activacion ReLU hasta producir 10 logits, uno por clase. Los pesos se distribuyen en un fichero `weights.npz` con matrices `W` de forma (entradas, salidas) y vectores de sesgo `b`, junto con un `preprocessing.npz` que contiene las medias y desviaciones tipicas de estandarizacion calculadas sobre las 50.000 imagenes de entrenamiento de CIFAR-10.

El modelo es relevante unicamente como material docente o como referencia de linea base para practicas de clasificacion de imagenes. Su rendimiento (50,25% de exactitud en test frente a 95,76% en entrenamiento) refleja un sobreajuste notable y esta muy lejos del estado del arte en CIFAR-10, que supera el 99% con arquitecturas convolucionales modernas. No dispone de model card publica en el momento de redactar esta ficha, ni de licencia declarada, ni de pipeline definido en HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP (perceptron multicapa) totalmente conectado: 3072 -> 512 -> 256 -> 128 -> 10, activacion ReLU en capas ocultas, salida lineal de 10 logits |
| Parametros totales | no disponible (calculable a partir de las formas: 3072x512 + 512 + 512x256 + 256 + 256x128 + 128 + 128x10 + 10 = 1.727.370) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en `.npz`, sin versiones cuantizadas publicadas) |
| Idiomas soportados | no aplica (clasificador de imagenes) |
| Licencia | no disponible |
| Formato de pesos | `.npz` (arrays NumPy con `W0, b0, W1, b1, ...`) y `preprocessing.npz` |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal densa de cuatro capas: una capa de entrada de 3072 unidades (correspondiente a la imagen aplanada), tres capas ocultas de 512, 256 y 128 neuronas con activacion ReLU, y una capa de salida de 10 unidades sin activacion que produce logits. La funcion de perdida empleada es entropia cruzada aplicada tras softmax. No hay convoluciones, pooling, normalizacion por lotes ni conexiones residuales; se trata de una arquitectura de referencia puramente lineal por capas.

El entrenamiento se realizo sobre las 50.000 imagenes del split de entrenamiento de CIFAR-10 con etiquetas verdaderas (sin ruido, p = 0), usando descenso de gradiente estocastico (SGD) plano con tasa de aprendizaje 0,05, tamano de lote 64, 100 epocas y semilla 11030. El preprocesado consiste en aplanar la imagen a 3072 valores, dividir por 255 y estandarizar cada columna con las medias y desviaciones tipicas almacenadas en `preprocessing.npz`, calculadas sobre el conjunto de entrenamiento. No se menciona uso de aumento de datos, regularizacion (dropout, weight decay) ni tecnicas de optimizacion adaptativas.

## Capacidades

- Clasificacion de imagenes de 32x32x3 en diez clases de CIFAR-10 (avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco, camion).
- Inferencia directa mediante NumPy: el modelo se ejecuta cargando `weights.npz` y aplicando multiplicaciones matriciales y ReLU.
- Preprocesado reproducible incluido: el fichero `preprocessing.npz` permite replicar la estandarizacion exacta usada en entrenamiento.
- No soporta tool calling, function calling ni agentes.
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No soporta vision mas alla de la clasificacion de imagenes de 32x32; no hay deteccion, segmentacion ni captioning.
- No tiene capacidades multilingues (no procesa lenguaje).
- No dispone de modo "thinking", audio ni ninguna capacidad especial.

## Casos de uso

- Docencia y practicas de machine learning: el modelo sirve como linea base reproducible para que estudiantes comparen un MLP simple contra CNN en CIFAR-10, con un pipeline de preprocesado y pesos ya entrenados.
- Verificacion de pipelines de preprocesado: al incluir `preprocessing.npz` con medias y desviaciones exactas, permite comprobar que una implementacion de aplanado y estandarizacion reproduce los resultados del autor (50,25% de exactitud en test).
- Referencia de sobreajuste: con 95,76% en entrenamiento y 50,25% en test, es un ejemplo didactico de la brecha entre train y test y de la necesidad de regularizacion.
- Pruebas de integracion en frameworks de inferencia: util para validar cargas de `.npz` y operaciones matriciales en entornos NumPy, ONNX o similares antes de migrar a modelos mayores.
- Benchmark de comparacion de arquitecturas: sirve como cota inferior frente a modelos convolucionales o transformers de vision en el mismo conjunto CIFAR-10.
- Educacion sobre formatos de pesos: el esquema `W` de forma (entradas, salidas) y `b` permite ensenar convenciones de orientacion de matrices en frameworks como PyTorch o TensorFlow.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Exactitud en entrenamiento (CIFAR-10, 50.000 imagenes) | 0,9576 |
| Exactitud en test (CIFAR-10, 10.000 imagenes) | 0,5025 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni comparaciones directas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en precision float32 (1.727.370 parametros x 4 bytes ≈ 6,9 MB, mas buffers intermedios y el lote de entrada).
- GPU recomendadas: cualquier GPU, incluida una GTX 1050 o una integrada; no requiere aceleracion dedicada.
- Cabe en cualquier GPU consumer y en CPU sin problema; el cuello de botella es el ancho de banda de memoria, no el computo.
- Opciones de despliegue: NumPy (carga directa de `.npz`), conversion a ONNX, PyTorch o TensorFlow para servir con TorchServe o TFServing; no hay soporte nativo en vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; en CPU moderna se espera del orden de microsegundos a milisegundos por imagen, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Exactitud CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `smai-a4-mlp` (este modelo) | 1.727.370 | Imagen 32x32x3 | 50,25% (test) | no disponible | HuggingFace, `.npz` |
| ResNet-20 (referencia habitual en CIFAR-10) | ~0,27 M | Imagen 32x32x3 | ~91-92% (test) | varía segun implementacion | Multiples repos publicos |
| VGG-11 / CNN simples en CIFAR-10 | ~9 M | Imagen 32x32x3 | ~90-92% (test) | varía segun implementacion | Multiples repos publicos |
| Vision Transformer pequeno (ViT-S/16) | ~22 M | Imagen 32x32x3 (reescalada) | ~95%+ (test) | varía segun implementacion | Multiples repos publicos |

Los datos de los modelos comparativos son referencias generales de la literatura y no proceden de la model card de este modelo; se incluyen solo como orientacion. El MLP de este repositorio no compite con arquitecturas convolucionales o transformers de vision en exactitud, pero si en simplicidad y coste de inferencia.

## Limitaciones y advertencias

- Sobreajuste severo: 95,76% en entrenamiento frente a 50,25% en test, una brecha de mas de 45 puntos porcentuales que indica escasa generalizacion.
- Sin model card ni licencia declarada: no se puede confirmar el uso comercial permitido; se debe contactar con el autor antes de cualquier uso en produccion.
- Sin pipeline definido en HuggingFace: no se puede cargar con `transformers` ni con `pipeline()`; requiere carga manual de `.npz` con NumPy.
- Solo clasifica imagenes de 32x32x3 en las diez clases de CIFAR-10; no acepta otras resoluciones ni dominios sin reentrenamiento.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes.
- Riesgo de alucinacion no aplica en el sentido de LLM, pero si de clasificaciones erroneas con alta confianza en clases ambiguas.
- Sesgos conocidos: no documentados en la model card; el conjunto CIFAR-10 tiene sesgos de composicion que el modelo hereda sin mitigacion.
- Sin garantias de reproducibilidad mas alla de la semilla 11030 y del preprocesado exacto: pequenas variaciones en el orden de aplanado o en la estandarizacion degradan el rendimiento.
- No apto para produccion en tareas reales de vision: la exactitud del 50,25% esta proxima a un clasificador trivial en algunas clases y muy por debajo de alternativas convolucionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Fresh-butter/smai-a4-mlp
- Perfil del autor: https://huggingface.co/Fresh-butter
- Conjunto de datos CIFAR-10: https://www.cs.toronto.edu/~kriz/cifar.html
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.

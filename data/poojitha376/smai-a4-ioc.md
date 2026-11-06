# Poojitha376/smai-a4-ioc

## Resumen

SMAI A4: IOC-NN on CIFAR-10 es un modelo neuronal de clasificacion de imagenes publicado por la usuaria Poojitha376 en Hugging Face. Se trata de un perceptron multicapa (MLP) de tres capas con arquitectura `[3072, 64, 10]`, activacion ELU en la capa oculta y salida en logits para clasificacion sobre las 10 clases de CIFAR-10. El modelo cuenta con 197.322 parametros y alcanza una precision de test de 0,4541 (45,41%) tras 100 epocas de entrenamiento.

El modelo parece ser el resultado de un trabajo practico academico (la nomenclatura "SMAI A4" sugiere una asignatura y una entrega concreta) mas que un modelo pensado para produccion. No emplea arquitecturas modernas como transformers, convoluciones o mecanismos de atencion: es una red densa que aplana cada imagen de 32x32x3 a un vector de 3072 dimensiones y la procesa con una unica capa oculta de 64 neuronas.

Su relevancia es limitada fuera del contexto educativo, pero resulta util como referencia de linea base para tareas de clasificacion de imagenes de baja resolucion y para ilustrar el flujo completo de entrenamiento, preprocesado y evaluacion de una red neuronal sencilla en NumPy. La informacion publicada es muy escasa: no hay model card extendida, ni licencia, ni datos de benchmarks mas alla de la precision final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (MLP) denso, 3 capas: [3072, 64, 10] |
| Parametros totales | 197.322 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de clasificacion de imagenes, entrada fija de 3072 valores) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | `model.npz` (NumPy, layout W{i} de forma (n_in, n_out) y b{i} de forma (n_out,)) |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal totalmente conectada con una capa de entrada de 3072 unidades (32x32x3 aplanado), una capa oculta de 64 neuronas con activacion ELU y una capa de salida de 10 logits (sin activacion; se aplica softmax para obtener probabilidades). La funcion de perdida es entropia cruzada. Los pesos se almacenan en formato NumPy (`.npz`), lo que confirma que el modelo se entreno e infiere con una libreria propia basada en NumPy, no con frameworks como PyTorch o TensorFlow.

El preprocesado consiste en aplanar la imagen, convertir a `float64`, dividir por 255 y normalizar restando la media y dividiendo por la desviacion tipica calculadas sobre las 50.000 imagenes de entrenamiento de CIFAR-10 (almacenadas en `preprocessing.npz`). El entrenamiento se realizo durante 100 epocas con learning rate 0,02, batch size 64, semilla 1088 y sin ruido (`noise_p: 0.0`). No se documenta el uso de tecnicas como data augmentation, regularizacion, RLHF/DPO ni decodificacion especulativa; el modelo no incorpora innovaciones tecnicas destacables.

## Capacidades

- Clasificacion de imagenes de 32x32x3 en 10 clases (las clases estandar de CIFAR-10: avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco y camion).
- Salida en logits; requiere aplicar softmax para obtener probabilidades por clase.
- Entrada fija: no admite imagenes de otras resoluciones sin redimensionado y aplanado previos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo "thinking", vision avanzada, audio ni generacion de texto.
- No dispone de capacidades generativas: es exclusivamente un clasificador discriminativo.

## Casos de uso

- Linea base academica para clasificacion de imagenes: sirve como referencia minima contra la que comparar modelos convolucionales o transformers de vision en practicas y trabajos de asignatura, dado que su precision de 45,41% es facil de superar y permite medir la mejora de arquitecturas mas complejas.
- Prototipado rapido de pipelines de clasificacion: al usar NumPy puro y pesos en `.npz`, puede integrarse en entornos sin dependencias de deep learning para validar el flujo de preprocesado (aplanado, normalizacion con media y desviacion tipica) antes de migrar a un modelo mayor.
- Docencia de fundamentos de redes neuronales: permite ilustrar el calculo de forward pass, entropia cruzada y descenso de gradiente con un modelo de solo 197.322 parametros y pesos inspeccionables.
- Clasificacion de baja resolucion en entornos embebidos o con recursos minimos: con 197.322 parametros y un forward pass puramente matricial, el coste computacional es despreciable y puede ejecutarse en CPU sin GPU.
- Pruebas de robustez y calibracion: util como sujeto de estudio para analizar como un MLP sin convoluciones ni augmentation se comporta ante variaciones de iluminacion, fondo o posicion en CIFAR-10.
- Reproducibilidad de experimentos: la semilla (1088), hiperparametros y fichero de preprocesado documentados permiten reproducir el entrenamiento y verificar la precision reportada.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision de test en CIFAR-10 | 0,4541 (45,41%) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es linguistico ni generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el modelo ocupa menos de 1 MB en `float64` (197.322 parametros x 8 bytes ≈ 1,6 MB, mas el fichero de preprocesado).
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU de forma trivial.
- Cabe en cualquier GPU consumer, e incluso en dispositivos sin GPU dedicada (Raspberry Pi, entornos embebidos).
- Opciones de despliegue: al no ser un modelo de transformers, no es compatible con vLLM, TGI, llama.cpp ni Ollama; se ejecuta con NumPy directamente a partir de `model.npz`.
- Latencia y throughput: no disponibles de forma oficial; por el tamano del modelo, el forward pass es una multiplicacion matricial de 3072x64 y 64x10, con coste despreciable en cualquier hardware moderno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Precision CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SMAI A4 IOC-NN | 197.322 | 32x32x3 (3072 valores) | 45,41% | no disponible | Hugging Face (0 descargas) |
| MLP de referencia CIFAR-10 | no disponible | 32x32x3 | no disponible | no disponible | no disponible |
| LeNet-5 | ~60.000 | 32x32x1 | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada; la comparativa con arquitecturas convolucionales clasicas (LeNet, ResNet) no puede cuantificarse con los datos disponibles.

## Limitaciones y advertencias

- Precision limitada: 45,41% en CIFAR-10, muy por debajo de las arquitecturas convolucionales modernas (que superan el 90%), lo que lo hace inadecuado para aplicaciones reales de clasificacion.
- Sin convoluciones: al aplanar la imagen se pierde la estructura espacial, lo que limita severamente la capacidad del modelo.
- Entrada fija de 32x32x3: no admite otras resoluciones ni formatos sin preprocesado manual.
- Licencia no especificada: no hay garantia de uso comercial; debe contactarse con el autor antes de cualquier uso en produccion.
- Riesgo de sesgos: al entrenarse sobre CIFAR-10, hereda los sesgos de ese dataset (clases desbalanceadas, imagenes de baja resolucion, contextos limitados).
- Riesgo de sobreajuste: con solo 64 neuronas ocultas y 100 epocas sin regularizacion documentada, el modelo puede estar infraajustado o presentar varianza alta segun la inicializacion.
- Sin mantenimiento ni documentacion: 0 descargas, 0 likes y repositorio de 0,0 GB sugieren un artefacto academico sin soporte.
- No apto para tareas generativas, de razonamiento, codigo, matematicas, vision avanzada ni multilingues.

## Enlaces

- Hugging Face: https://huggingface.co/Poojitha376/smai-a4-ioc
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web.

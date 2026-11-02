# quake3player/smai-a4-cifar10-mlp

## Resumen

`smai-a4-cifar10-mlp` es un perceptron multicapa (MLP) entrenado para clasificar imagenes del conjunto CIFAR-10 en 10 categorias. Lo publica el usuario de HuggingFace `quake3player` como parte de la asignatura SMAI (Assignment 4, Q1.5), por lo que se trata de un artefacto academico y no de un modelo pensado para produccion. La arquitectura es una red densa de tres capas con activacion ReLU en las capas ocultas y salida lineal (logits), con dimensiones 3072-512-256-10.

El modelo no procesa texto ni lenguaje natural: recibe un vector de 3072 dimensiones obtenido al aplanar una imagen RGB de 32x32 pixeles, la divide por 255 y la estandariza con la media y desviacion tipica del conjunto de entrenamiento. Su unica funcion es la clasificacion de imagenes a baja resolucion en una de las diez clases de CIFAR-10 (avion, automovil, pajaro, gato, ciervo, perro, rana, caballo, barco y camion).

Es relevante unicamente como referencia docente: ilustra el flujo completo de entrenamiento (preprocesado, SGD, cross-entropy categorica, guardado de pesos en NPZ) y sirve de linea base contra la que comparar arquitecturas convolucionales. No dispone de model card extendida, licencia declarada ni pipeline asociado en HuggingFace, y el repositorio ocupa 0.0 GB segun la plataforma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptron multicapa (MLP) denso, 3 capas, activacion ReLU en capas ocultas y salida identidad (logits) |
| Parametros totales | no disponible (deducible de las dimensiones: 3072x512 + 512 + 512x256 + 256 + 256x10 + 10) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija de 3072 valores) |
| Tipos de cuantizacion | no disponible (pesos en float64 durante el entrenamiento, exportados en NPZ) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | no disponible |
| Formato de pesos | NPZ (W{i} con forma (in, out) y b{i}; logits = h @ W + b) |

## Arquitectura y entrenamiento

La red es un MLP totalmente conectado con capas de 3072, 512, 256 y 10 neuronas. La entrada corresponde a una imagen CIFAR-10 aplanada en orden HWC (32x32x3 = 3072), normalizada dividiendo entre 255 y estandarizada con la media y desviacion tipica calculadas sobre la particion de entrenamiento de CIFAR-10 (las desviaciones nulas se sustituyen por 1). Las capas ocultas usan ReLU y la capa de salida es lineal, produciendo logits que se evaluan con entropia cruzada categorica.

El entrenamiento se realizo en PyTorch con precision float64, 100 epocas, SGD con tasa de aprendizaje 0.02, tamano de lote 64, sin acumulacion de gradientes y semilla 2049. El conjunto de datos es la particion de entrenamiento de `uoft-cs/cifar10` con etiquetas verdaderas (p = 0, es decir, sin ruido de etiquetas). No se documenta aumento de datos, regularizacion, momentum ni decaimiento de la tasa de aprendizaje. La precision reportada en el conjunto de test es 0.5302 (53,02 %).

## Capacidades

- Clasificacion de imagenes de 32x32 pixeles en las 10 clases de CIFAR-10.
- Inferencia determinista mediante producto matricial y suma de sesgo (`logits = h @ W + b`), sin dependencia de frameworks de deep learning una vez exportado a NPZ.
- Preprocesado reproducible incluido en `preprocessing.npz` (media y desviacion tipica del conjunto de entrenamiento).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo thinking, vision de alta resolucion, audio ni otras modalidades.

## Casos de uso

- Docencia y practicas de aprendizaje automatico: sirve como ejemplo minimo de pipeline completo (carga de datos, normalizacion, entrenamiento con SGD y exportacion de pesos) para asignaturas introductorias.
- Linea base de referencia: permite cuantificar la mejora que aportan arquitecturas convolucionales o transformers de vision frente a un MLP simple sobre CIFAR-10 (53,02 % de precision en test).
- Experimentos de reproducibilidad: al fijar semilla 2049 y documentar hiperparametros, se puede replicar el entrenamiento y verificar la precision reportada.
- Despliegue didactico sin framework: al estar en NPZ, se puede cargar con NumPy y ejecutar la inferencia en un script de pocas lineas, util para ensenar el funcionamiento interno de una red densa.
- Pruebas de integracion de preprocesado: el archivo `preprocessing.npz` permite validar implementaciones propias de normalizacion y estandarizacion contra una referencia conocida.
- Analisis de errores por clase: con una precision global del 53 %, es un caso de estudio adecuado para examinar confusiones entre clases visualmente similares (gato/perro, ciervo/caballo) en modelos sin sesgo inductivo espacial.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision en test (CIFAR-10) | 0.5302 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en float32; el modelo completo ocupa unos pocos megabytes (3072x512 + 512x256 + 256x10 parametros).
- GPU recomendadas: cualquiera; no requiere GPU, funciona en CPU sin problema.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, GTX 1650) e incluso en dispositivos embebidos.
- Opciones de despliegue: NumPy (carga directa de NPZ), PyTorch, o cualquier runtime que soporte operaciones matriciales; no aplica vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles; por el tamano, la inferencia por muestra es del orden de microsegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision CIFAR-10 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smai-a4-cifar10-mlp | no disponible (MLP 3072-512-256-10) | no aplica | 0.5302 | no disponible | HuggingFace |
| LeNet-5 (referencia historica) | ~60 K | no aplica | ~0.70 (tipico) | no disponible | multiple |
| ResNet-18 (referencia) | ~11 M | no aplica | ~0.93-0.95 (tipico) | no disponible | torchvision |
| ViT-base (referencia) | ~86 M | no aplica | ~0.98 (con preentrenamiento) | no disponible | multiple |

Nota: los valores de los modelos comparativos son cifras tipicas de la literatura y no proceden de la informacion proporcionada; se incluyen solo como orientacion cualitativa. No se dispone de comparaciones oficiales publicadas para este modelo concreto.

## Limitaciones y advertencias

- Precision limitada: 53,02 % en test, insuficiente para la mayoria de aplicaciones reales de vision.
- Sin sesgo inductivo espacial: al aplanar la imagen se pierde la estructura 2D, lo que limita la capacidad de aprender patrones locales.
- Entrada fija: solo acepta imagenes de 32x32x3; no admite otras resoluciones sin reentrenamiento.
- Sin licencia declarada: no se especifican condiciones de uso comercial, por lo que no debe asumirse su reutilizacion en produccion.
- Sin model card extendida ni documentacion de sesgos: no hay informacion sobre desequilibrios de clase ni sobre el impacto de la estandarizacion en dominios distintos de CIFAR-10.
- Riesgo de sobreajuste no documentado: no se reportan curvas de validacion ni metricas en la particion de validacion.
- Artefacto academico: no hay garantia de mantenimiento, soporte ni actualizaciones.
- No es un modelo de lenguaje: no debe evaluarse con benchmarks de texto ni usarse para tareas de NLP.

## Enlaces

- HuggingFace: https://huggingface.co/quake3player/smai-a4-cifar10-mlp
- Dataset CIFAR-10 (uoft-cs/cifar10): https://huggingface.co/datasets/uoft-cs/cifar10

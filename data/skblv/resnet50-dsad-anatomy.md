# skblv/resnet50-dsad-anatomy

## Resumen

El modelo `skblv/resnet50-dsad-anatomy` es un clasificador de imágenes basado en ResNet-50, desarrollado por el usuario skblv, que reconoce cuál de 12 estructuras anatómicas están presentes en fotogramas laparoscópicos procedentes del Dresden Surgical Anatomy Dataset (DSAD). Está pensado como línea base supervisada para el leaderboard de comprensión de vídeo quirúrgico del SDSC × Chicago Booth. Su relevancia radica en que, pese a ser un modelo pequeño y simple, supera a todos los modelos zero-shot de visión-lenguaje probados en esa tarea, lo que demuestra que un entrenamiento supervisado específico puede superar a modelos generalistas grandes en dominios médicos especializados.

El modelo se construye sobre `torchvision.models.resnet50` con pesos iniciales de `IMAGENET1K_V2`, reemplazando la capa final por una capa lineal de 12 salidas y entrenado con pérdida de entropía cruzada binaria (BCEWithLogitsLoss). Las imágenes de entrada son de 224×224 píxeles, con batch size 32 y semilla 42. El repositorio tiene un tamaño de 0.1 GB y está bajo licencia Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResNet-50 (torchvision) |
| Parámetros totales | no disponible (arquitectura ResNet-50 estándar, ~25.5M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict (.pt) |

## Arquitectura y entrenamiento

El modelo es un ResNet-50 estándar de torchvision, inicializado con pesos preentrenados en ImageNet (versión IMAGENET1K_V2). La capa totalmente conectada final se sustituye por una capa lineal con 12 unidades, correspondientes a las 12 estructuras anatómicas del dataset DSAD. El entrenamiento se realiza con pérdida de entropía cruzada binaria (BCEWithLogitsLoss), adecuada para clasificación multi-etiqueta, ya que cada imagen puede contener varias estructuras simultáneamente. Las imágenes se redimensionan a 224×224, se usa batch size de 32 y semilla 42 para reproducibilidad. El código de entrenamiento está disponible en el archivo `s67_dsad_supervised.py` del repositorio.

No se han publicado detalles sobre el número exacto de imágenes de entrenamiento ni la composición del dataset, pero el modelo se evalúa en una división de validación de 1,978 fotogramas a nivel de vídeo. El entrenamiento es totalmente supervisado, sin técnicas de RLHF o DPO.

## Capacidades

- Clasificación multi-etiqueta de imágenes: el modelo predice qué estructuras anatómicas están presentes en una imagen laparoscópica (12 clases).
- Reconocimiento de anatomía en vídeo quirúrgico: diseñado para fotogramas de resección rectal robótica, pero puede aplicarse a otros procedimientos con menor rendimiento.
- Detección de presencia/ausencia de cada estructura de forma independiente (salida sigmoide > 0.5 por clase).
- No tiene capacidades de generación de texto, razonamiento, código, ni soporte de herramientas.

## Casos de uso

- **Análisis de vídeo quirúrgico para investigación**: permite etiquetar automáticamente los fotogramas de vídeos de cirugía laparoscópica con las estructuras anatómicas visibles, facilitando la anotación de grandes conjuntos de datos para estudios clínicos.
- **Asistencia en tiempo real durante cirugía**: integrado en sistemas de visión por computador en quirófano, puede ayudar a identificar estructuras críticas (por ejemplo, uréter, vasos) durante procedimientos de resección rectal, aunque se requiere validación clínica adicional.
- **Entrenamiento de estudiantes de medicina**: utilizado como herramienta educativa para que los residentes aprendan a identificar estructuras anatómicas en vídeos quirúrgicos, comparando sus anotaciones con las del modelo.
- **Control de calidad en bases de datos quirúrgicas**: en hospitales que recopilan vídeos de cirugías, el modelo puede filtrar automáticamente qué fotogramas contienen ciertas estructuras, facilitando la gestión de datos.
- **Investigación en visión por computador médica**: sirve como línea base supervisada para comparar con enfoques zero-shot o de aprendizaje auto-supervisado en el leaderboard de SDSC × Chicago Booth, permitiendo evaluar el avance de nuevas técnicas.
- **Desarrollo de sistemas de navegación quirúrgica**: la salida multi-etiqueta se puede integrar en sistemas de realidad aumentada que superponen las estructuras detectadas en la vista laparoscópica.

## Benchmarks y rendimiento

El modelo se evalúa sobre la división de validación completa de 1,978 fotogramas a nivel de vídeo, con intervalos de confianza bootstrap del 95%:

| Métrica | Valor |
|---|---|
| Exact match (conjunto predicho == conjunto real) | 30.6% (28.5–32.6) |
| Micro-F1 | 71.6% (70.5–72.8) |

El autor indica que este modelo supera a todos los modelos zero-shot de visión-lenguaje evaluados en la misma tarea, aunque no se proporcionan los valores numéricos de dichos modelos. No hay más resultados de benchmarks disponibles en la información.

## Requisitos de hardware

- **Tamaño del modelo**: el repositorio pesa 0.1 GB, lo que indica que el modelo es pequeño (ResNet-50 típicamente ocupa ~100 MB en FP32).
- **VRAM estimada**: para inferencia con batch size pequeño, se puede ejecutar en GPUs con 4 GB o menos; en CPU también es viable, aunque más lento.
- **GPU recomendada**: cualquier GPU moderna (NVIDIA GTX 1060 o superior, RTX 3060, etc.) es suficiente. No se requiere hardware de alta gama.
- **Opciones de despliegue**: se puede usar directamente con PyTorch (cargando el state dict), o exportar a ONNX para inferencia en otros entornos. No hay soporte nativo para vLLM, llama.cpp o Ollama, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no se proporcionan datos. Para un ResNet-50 en GPU, la inferencia suele ser del orden de unos pocos milisegundos por imagen, pero no se puede confirmar.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el contexto de la tarea (reconocimiento de anatomía en vídeo quirúrgico). El autor menciona que supera a modelos zero-shot de visión-lenguaje, pero no se dan nombres ni métricas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **No es un dispositivo médico**: el modelo es una línea de investigación, no debe utilizarse en decisiones clínicas sin validación regulatoria.
- **Entrenado en un solo dataset**: solo se ha entrenado con vídeos de resección rectal robótica, por lo que el rendimiento se degradará en otros procedimientos, ópticas o instituciones.
- **Riesgo de errores de clasificación**: la exactitud exacta es solo del 30.6%, lo que indica que el modelo falla a menudo en predecir el conjunto completo de estructuras. La micro-F1 es mayor (71.6%), pero aún tiene margen de error.
- **No hay información sobre sesgos**: no se han realizado análisis de sesgos por tipo de paciente, condición, etc.
- **Alucinación**: no aplica, al ser un clasificador de imágenes, no genera texto.
- **Restricciones de licencia**: licencia Apache-2.0 permite uso comercial, pero la naturaleza médica del dominio implica que el usuario debe asegurarse de cumplir con las normativas aplicables.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/skblv/resnet50-dsad-anatomy)
- [Paper del dataset DSAD](https://www.nature.com/articles/s41597-022-01719-2)
- [Leaderboard de comprensión de vídeo quirúrgico (GitHub)](https://github.com/skblv/neurosurgery-video-eval-website)

Nota: no se encontraron otros enlaces relevantes en la búsqueda web.</think>## Resumen

El modelo `skblv/resnet50-dsad-anatomy` es un clasificador de imágenes basado en ResNet-50, desarrollado por el usuario skblv, que reconoce cuáles de 12 estructuras anatómicas están presentes en fotogramas laparoscópicos del Dresden Surgical Anatomy Dataset (DSAD). Está entrenado como línea base supervisada para el leaderboard de comprensión de vídeo quirúrgico del SDSC × Chicago Booth. Su relevancia radica en que, pese a ser un modelo pequeño y sencillo, supera a todos los modelos zero-shot de visión-lenguaje evaluados en esa tarea, demostrando que un entrenamiento supervisado específico puede competir con arquitecturas multimodales grandes en dominios médicos especializados.

El modelo se construye sobre `torchvision.models.resnet50` con pesos iniciales de ImageNet (IMAGENET1K_V2), sustituyendo la capa final por una capa lineal de 12 salidas. Se entrena con BCEWithLogitsLoss para clasificación multi-etiqueta, con imágenes de 224×224 píxeles, batch size 32 y semilla fija 42. El repositorio pesa 0.1 GB y está bajo licencia Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResNet-50 (torchvision) |
| Parámetros totales | no disponible (típico de ResNet-50: ~25.5M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state dict (.pt) |

## Arquitectura y entrenamiento

El modelo es un ResNet-50 estándar de torchvision, inicializado con pesos preentrenados en ImageNet. La capa `fc` final se reemplaza por una capa lineal con 12 salidas, correspondientes a las 12 estructuras anatómicas del dataset DSAD. El entrenamiento se realiza con BCEWithLogitsLoss, adecuado para clasificación multi-etiqueta, ya que cada imagen puede contener varias estructuras simultáneamente. Las imágenes se redimensionan a 224×224, se usa batch size de 32 y semilla 42 para reproducibilidad. El código de entrenamiento está disponible en `s67_dsad_supervised.py`.

No se ha especificado el número de imágenes de entrenamiento ni la composición exacta del dataset, pero la evaluación se realiza sobre la división de validación completa de 1,978 fotogramas a nivel de vídeo. No se emplean técnicas como RLHF o DPO.

## Capacidades

- Clasificación multi-etiqueta de imágenes: identifica cuáles de las 12 estructuras anatómicas están presentes en un fotograma laparoscópico.
- Reconocimiento de anatomía en vídeo quirúrgico: diseñado para vídeos de resección rectal robótica, aunque puede aplicarse a otros procedimientos con menor rendimiento.
- Salida independiente por clase: cada clase se predice mediante sigmoid(logits) > 0.5, permitiendo múltiples etiquetas simultáneas.
- No tiene capacidades de generación de texto, razonamiento, código, ni soporte de herramientas.

## Casos de uso

- **Análisis de vídeo quirúrgico para investigación**: permite etiquetar automáticamente los fotogramas de vídeos de cirugía laparoscópica con las estructuras anatómicas visibles, facilitando la creación de datasets anotados para estudios clínicos y algoritmos de navegación.
- **Asistencia en tiempo real durante la cirugía**: integrado en sistemas de visión por computador, puede indicar la presencia de estructuras críticas (p. ej., uréter, vasos) durante la resección rectal, aunque requiere validación clínica adicional antes de su uso en quirófano.
- **Entrenamiento de residentes de cirugía**: el modelo puede usarse como herramienta educativa para que los médicos en formación practiquen la identificación de anatomía en vídeos, comparando sus anotaciones con las del modelo.
- **Control de calidad de bases de datos quirúrgicas**: en hospitales o centros de investigación que almacenan vídeos, el modelo puede filtrar qué fotogramas contienen determinadas estructuras, ayudando a organizar y seleccionar contenido.
- **Investigación en visión por computador médica**: sirve como línea base supervisada en el leaderboard de SDSC × Chicago Booth, permitiendo comparar el rendimiento de modelos zero-shot o de aprendizaje multimodal frente a un enfoque supervisado específico.
- **Desarrollo de sistemas de navegación quirúrgica**: la salida multi-etiqueta puede alimentar un sistema que superponga indicaciones visuales sobre las estructuras detectadas en la pantalla del laparoscopio.

## Benchmarks y rendimiento

El modelo se evalúa sobre la división de validación completa de 1,973 fotogramas a nivel de vídeo (intervalos de confianza bootstrap al 95%):

| Métrica | Valor |
|---|---|
| Exact match (conjunto predicho == conjunto real) | 30.6% (28.5–32.6) |
| Micro-F1 | 71.6% (70.5–72.8) |

El autor indica que este baseline supera a todos los modelos zero-shot de visión-lenguaje evaluados en la tarea, pero no se proporcionan los valores numéricos de dichos modelos. No hay más resultados de benchmarks disponibles.

## Requisitos de hardware

- **Tamaño del modelo**: el repositorio pesa 0.1 GB, lo que indica que el modelo ocupa alrededor de 25 MB en FP32.
- **VRAM estimada**: para inferencia con batch size 1, se requiere menos de 1 GB de VRAM; es compatible con cualquier GPU moderna (p. ej., NVIDIA GTX 1060, RTX 3060, A100, etc.).
- **Opciones de despliegue**: se puede usar directamente con PyTorch cargando el state dict; también puede exportarse a ONNX para despliegue en otros frameworks. No es un modelo de lenguaje, por lo que no es compatible con vLLM, llama.cpp o Ollama.
- **Latencia y throughput**: no se proporcionan datos, pero para un ResNet-50 a 224×224, la inferencia típica en una GPU moderna es de unos pocos milisegundos por imagen.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos específicos para la misma tarea (reconocimiento de anatomía en vídeo quirúrgico). El autor menciona que el modelo supera a los modelos zero-shot de visión-lenguaje, pero no se han publicado los nombres ni los resultados de esos modelos. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- **No es un dispositivo médico**: es una línea de investigación, no debe utilizarse en decisiones clínicas sin validación regulatoria.
- **Entrenado en un único dataset**: se ha entrenado solo con vídeos de resección rectal robótica, por lo que el rendimiento se degradará en otros procedimientos, ópticas o instituciones.
- **Baja exactitud match**: solo el 30.6% de las predicciones coinciden exactamente con el conjunto real de estructuras, lo que indica que el modelo falla a menudo en predecir todas las etiquetas correctas.
- **Posibles sesgos**: no se han realizado análisis de sesgos por demografía, tipo de paciente o variaciones anatómicas.
- **Sin información de cuantización**: no se ofrecen versiones cuantizadas, por lo que el despliegue en dispositivos con recursos limitados requeriría una cuantización posterior.
- **Restricciones de uso**: aunque la licencia Apache-2.0 permite uso comercial, el ámbito médico exige cumplir normativas específicas (p. ej., reglamento de dispositivos médicos).

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/skblv/resnet50-dsad-anatomy)
- [Paper del dataset DSAD](https://www.nature.com/articles/s41597-022-01719-2)
- [Leaderboard de comprensión de vídeo quirúrgico (GitHub)](https://github.com/skblv/neurosurgery-video-eval-website)

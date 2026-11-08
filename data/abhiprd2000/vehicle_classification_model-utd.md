# abhiprd2000/vehicle_classification_model-utd

## Resumen

El modelo `abhiprd2000/vehicle_classification_model-utd` es un clasificador de imágenes basado en una CNN personalizada de tres bloques, desarrollado por el autor independiente abhiprd2000. Su tarea es clasificar imágenes en 8 categorías de vehículos (bicicleta, autobús, coche, motocicleta, taxi, camión, furgoneta y "no vehículo"), un problema típico en pipelines de percepción para conducción autónoma y sistemas de videovigilancia. No se trata de un modelo de lenguaje ni de un transformer: es una red convolucional entrenada desde cero (no preentrenada) sobre un dataset de 26.378 imágenes.

El modelo alcanza una precisión del 78,54% en el conjunto de test, superando el objetivo declarado del 50%. Su relevancia es limitada: se publica como artefacto de un proyecto de evaluación académica (UTD) más que como modelo de producción, y no compite con los clasificadores de visión de gran escala actuales. No obstante, su tamaño reducido (repo de 0,1 GB) y su licencia Apache 2.0 lo hacen utilizable como punto de partida o referencia didáctica para tareas de clasificación de vehículos.

No se dispone de información sobre parámetros totales, longitud de contexto (no aplica a un modelo de visión) ni tipos de cuantización más allá de los pesos en formato PyTorch (`model.pth`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN personalizada de 3 bloques (no preentrenada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión por imagen) |
| Tipos de cuantizacion | no disponible (pesos en `model.pth`, sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | en (etiquetas y documentación en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`model.pth`) |

## Arquitectura y entrenamiento

La arquitectura es una CNN propia de tres bloques convolucionales, entrenada desde cero sin pesos preentrenados (no es un fine-tuning de ResNet, EfficientNet ni ViT). Incorpora Batch Normalization para estabilizar el flujo de gradientes y Dropout con tasa 0,5 como regularización, decisiones orientadas según el autor a la robustez frente a ruido de alta frecuencia y a la estabilidad del entrenamiento.

El dataset consta de 26.378 imágenes divididas en 8:2 (21.102 de entrenamiento y 5.276 de test), normalizadas con media [0,485, 0,456, 0,406] y desviación estándar [0,229, 0,224, 0,225], los valores estándar de ImageNet. No se especifica el número de épocas, el optimizador, la tasa de aprendizaje ni la composición exacta del dataset (fuente de las imágenes, balance de clases). El autor reporta una diferencia de 0,06% entre precisión de entrenamiento y de test, lo que interpreta como evidencia de generalización y ausencia de sobreajuste.

## Capacidades

- Clasificación de imágenes en 8 categorías: bicicleta, autobús, coche, motocicleta, taxi, camión, furgoneta y "no vehículo".
- Salida de probabilidades por clase (la demo devuelve las categorías más probables con sus confianzas).
- Inferencia sobre imágenes individuales subidas por el usuario a través de la demo en Hugging Face Spaces.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo "thinking", visión general, audio ni otras modalidades.

## Casos de uso

- Filtrado previo en pipelines de percepción vehicular: el modelo puede actuar como clasificador rápido de recortes de vehículos detectados por un detector previo (YOLO, etc.) para asignar la categoría antes de tareas más costosas.
- Etiquetado asistido de datasets: dado su bajo coste computacional, puede preetiquetar imágenes de vehículos en un flujo de anotación humana, reduciendo el esfuerzo manual en las 8 clases.
- Prototipos educativos de visión por computador: sirve como ejemplo completo de entrenamiento de una CNN desde cero con normalización, BatchNorm y Dropout, útil en cursos y talleres.
- Demos interactivas en Hugging Face Spaces: el modelo ya está desplegado en un Space que permite subir una imagen y obtener la predicción, útil para validación rápida de conceptos.
- Clasificación de flotas en imágenes estáticas: para inventariar tipos de vehículos (coche, furgoneta, camión) en imágenes de aparcamientos o registros, siempre que las condiciones de iluminación sean buenas.
- Base para experimentos de robustez y seguridad en IA: el autor enmarca el diseño (Dropout alto, BatchNorm) en principios de AI Safety, por lo que puede usarse como referencia en estudios sobre generalización de CNNs pequeñas.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precisión en test | 78,54% |
| Objetivo declarado | >50,0% |
| Delta train-test | 0,06% |
| Muestras de test | 5.276 |

No se han publicado resultados de benchmarks estándar (ImageNet, CIFAR, etc.) en la información disponible, ni comparaciones con otros clasificadores de vehículos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el repositorio completo ocupa 0,1 GB, por lo que una CNN de tres bloques cabe holgadamente en cualquier GPU consumer (menos de 1 GB en la mayoría de configuraciones).
- GPU recomendadas: cualquier GPU moderna sirve; no requiere A100 ni H100. Una RTX 3060, RTX 4090 o incluso una GTX 1650 son suficientes.
- Cabe en GPU consumer y también en CPU para inferencia por imagen individual.
- Opciones de despliegue: PyTorch nativo (carga con `torch.load` y `model.eval()`), exportación a TorchScript u ONNX no documentada pero viable, y despliegue como Hugging Face Space (Gradio) ya existente.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos por imagen en GPU y decenas de milisegundos en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Precisión reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| abhiprd2000/vehicle_classification_model-utd | CNN 3 bloques desde cero | no disponible | no aplica | 78,54% (test propio) | Apache 2.0 | Hugging Face |
| ResNet-50 (preentrenado en ImageNet) | CNN residual | ~25,6 M | no aplica | no comparable directamente (otro dataset) | BSD-3 / weights con licencia propia | Amplia (torchvision, HF) |
| EfficientNet-B0 (preentrenado) | CNN con compound scaling | ~5,3 M | no aplica | no comparable directamente | Apache 2.0 (implementación) | Amplia |
| ViT-B/16 (preentrenado) | Transformer de visión | ~86 M | no aplica | no comparable directamente | Apache 2.0 (implementación) | Amplia |

La comparación es aproximada: los modelos preentrenados citados se entrenan habitualmente sobre ImageNet y no sobre el dataset específico de 8 clases de vehículos, por lo que sus precisiones no son directamente equiparables. El modelo de abhiprd2000 no publica comparaciones controladas frente a estos baselines.

## Limitaciones y advertencias

- Confusión entre clases de vehículos de dos ruedas (bicicleta y motocicleta), reconocida por el autor como caso límite.
- Rendimiento no validado en condiciones de baja iluminación ni con meteorología adversa.
- Entrenado desde cero sobre un dataset no documentado en cuanto a fuente y balance de clases; el riesgo de sesgo por composición del dataset es alto y no cuantificado.
- Riesgo de alucinación de clase: al ser un clasificador cerrado de 8 categorías, siempre asignará una de ellas (incluida "no vehículo") con una confianza que puede ser alta aunque la imagen no corresponda claramente a ninguna.
- Sin información sobre parámetros, épocas, optimizador ni métricas por clase (precisión, recall, F1), lo que dificulta evaluar su idoneidad en producción.
- Uso comercial permitido por la licencia Apache 2.0, pero sin garantías del autor; el modelo se publica como artefacto de evaluación académica.
- Documentación y etiquetas únicamente en inglés.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso o validación por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abhiprd2000/vehicle_classification_model-utd
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/abhiprd2000/vehicle_classification_model-utd
- Repositorio GitHub: https://github.com/abhiprd2000/vehicle_classification_model-utd
- Nota técnica publicada en Zenodo: https://zenodo.org/records/19098404
- Perfil del autor en Hugging Face: https://huggingface.co/abhiprd2000
- Preprint de investigación NLP del autor: https://zenodo.org/records/19054785
- Segundo proyecto de investigación (CNSD): https://github.com/abhiprd2000/CNSD_prototype
- GitHub del autor: https://github.com/abhiprd2000

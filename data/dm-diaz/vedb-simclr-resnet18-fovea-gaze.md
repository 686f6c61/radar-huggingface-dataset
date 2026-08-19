# DM-Diaz/VEDB-SimCLR-ResNet18-Fovea-Gaze

## Resumen

El modelo VEDB-SimCLR-ResNet18-Fovea-Gaze es un checkpoint de un encoder visual ResNet-18 entrenado con aprendizaje autosupervisado contrastivo SimCLR sobre el Visual Experience Dataset (VEDB), un conjunto de imágenes egocéntricas naturalistas con datos de mirada sincronizados. Lo desarrolla DM-Diaz en el marco de un estudio sobre cómo la restricción de la experiencia visual a distintas porciones del campo visual afecta a las representaciones aprendidas y a su alineación con la corteza visual humana. La condición Fovea-Gaze aísla la información central centrada en la mirada: para cada frame de 224×224 se extrae un recorte de 112×112 alrededor del punto de fijación, se redimensiona a 224×224 y se enmascara el exterior con una apertura circular difuminada. El modelo forma parte de una colección de cuatro condiciones (Baseline, Fovea-Gaze, Periph y Periph-NF) publicada junto con el artículo de la Conferencia de Neurociencia Cognitiva Computacional (CCN) de 2026.

El checkpoint corresponde a la época 120 de entrenamiento e incluye tanto el encoder ResNet-18 como la cabeza de proyección SimCLR, con representaciones de 512 dimensiones para el backbone y 128 para la proyección. Se distribuye bajo licencia Apache 2.0 y el repositorio contiene el checkpoint en formato PyTorch, aunque el código de entrenamiento y evaluación aún no se ha liberado. Es un modelo de visión por computador, sin capacidades de procesamiento de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (backbone) + proyeccion SimCLR (MLP 512→512→128) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no procesa texto) |
| Tipos de cuantizacion | no disponible (checkpoint en precision completa, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (modelo de vision) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch checkpoint (`.pth.tar`) |

## Arquitectura y entrenamiento

El modelo utiliza un ResNet-18 estándar como backbone, con la capa de clasificación final reemplazada por una cabeza de proyección SimCLR compuesta por dos capas lineales: `Linear(512, 512)` seguida de ReLU y `Linear(512, 128)`, que produce representaciones de 128 dimensiones. El entrenamiento se realiza con el objetivo contrastivo NT-Xent (SimCLR) sobre imágenes del Visual Experience Dataset (VEDB). En la condición Fovea-Gaze, cada frame de 224×224 se procesa extrayendo un recorte de 112×112 centrado en la posición de mirada del participante, que se redimensiona a 224×224 con interpolación bilineal. Se aplica una apertura circular con bordes difuminados (kernel gaussiano de tamaño 15) que enmascara la región exterior con gris uniforme (valor 128). Cuando no hay datos de mirada fiables, se usa el centro de la imagen como fijación de respaldo. El entrenamiento se prolonga durante 120 épocas con optimizador Adam. El checkpoint incluye el estado del optimizador y el state_dict completo con 124 entradas, bajo el espacio de nombres `backbone.*` para el encoder y `backbone.fc.*` para la cabeza de proyección.

## Capacidades

- Extracción de características visuales de 512 dimensiones a partir de imágenes de 224×224.
- Representaciones contrastivas de 128 dimensiones aptas para aprendizaje autosupervisado y transferencia.
- Entrenado específicamente con información central centrada en la mirada, lo que permite estudiar el efecto de la restricción del campo visual en las representaciones aprendidas.
- Evaluable mediante sondas lineales (linear probes) para tareas downstream, como se describe en el flujo de trabajo del estudio.
- Posibilidad de alineación con respuestas de la corteza visual humana mediante codificación voxelwise, según el artículo asociado.
- No soporta procesamiento de lenguaje, tool calling, agentes ni generación de texto, al ser un modelo puramente visual.

## Casos de uso

- Investigación en neurociencia visual: el modelo permite comparar representaciones aprendidas con actividad cerebral humana, ayudando a estudiar cómo la información central frente a la periférica influye en la codificación neuronal.
- Transfer learning en visión egocéntrica: el encoder preentrenado puede usarse como inicialización para tareas de clasificación o detección en imágenes de escenas naturales, especialmente cuando se prioriza la información central.
- Análisis de atención visual: al estar entrenado con recortes centrados en la mirada, puede utilizarse para simular o predecir qué regiones de una escena resultan relevantes para la fijación.
- Evaluación de representaciones autosupervisadas: como parte de la colección VEDB, permite comparar el efecto de diferentes condiciones de campo visual (baseline, fovea, periferia) sobre la calidad de las representaciones.
- Desarrollo de modelos de visión con restricciones de excentricidad: útil para experimentos que buscan imitar la estructura del campo visual humano en sistemas de visión por computador.
- Benchmark de aprendizaje contrastivo en dominios especializados: el checkpoint sirve como referencia para probar nuevos métodos de preentrenamiento en datos egocéntricos con anotaciones de mirada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo asociado (Diaz y Henderson, 2026) describe análisis de rendimiento en tareas downstream y alineación con corteza visual, pero los valores concretos no se incluyen en la model card.

## Requisitos de hardware

- El modelo es un ResNet-18, por lo que su tamaño es reducido. El repositorio ocupa 0.1 GB, lo que sugiere un checkpoint de aproximadamente 100 MB en fp32.
- La inferencia requiere menos de 1 GB de VRAM; cualquier GPU con al menos 2 GB puede ejecutarlo sin problemas (GTX 1060, RTX 2060, RTX 3060, etc.).
- Para fine-tuning o entrenamiento desde cero, se recomienda una GPU con al menos 4 GB de VRAM, dependiendo del batch size.
- Al ser un checkpoint de PyTorch, puede cargarse con `torch.load` y usarse directamente. Es exportable a ONNX o TorchScript para producción. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia estimada: en una GPU moderna, la inferencia de una sola imagen con ResNet-18 tarda del orden de 1 a 5 ms, según hardware y batch.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo forma parte de una colección con otras condiciones (Baseline, Periph, Periph-NF) que podrían considerarse comparaciones internas, pero no se proporcionan métricas cuantitativas. Por tanto, no se puede realizar una comparativa con alternativas externas.

## Limitaciones y advertencias

- El modelo está entrenado con la condición Fovea-Gaze, que no simula la fisiología real de la fóvea humana, sino que simplemente restringe la entrada a una región central centrada en la mirada. No debe interpretarse como un modelo biológico de la visión foveal.
- El dataset VEDB no se redistribuye en su totalidad; solo se incluyen ejemplos ilustrativos, lo que limita la reproducibilidad completa del preentrenamiento.
- El código de entrenamiento y evaluación aún no está disponible públicamente, lo que dificulta la verificación independiente de los resultados.
- Al ser un modelo de visión autosupervisado, no tiene capacidades de generación de texto ni interacción conversacional.
- Puede presentar sesgos derivados del dataset VEDB, que contiene imágenes egocéntricas de participantes y entornos concretos, lo que podría limitar su generalización a otros dominios.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del dataset VEDB subyacente, que puede tener restricciones adicionales.
- No se proporcionan garantías de rendimiento en tareas específicas; el modelo es un artefacto de investigación.

## Enlaces

- [HuggingFace - DM-Diaz/VEDB-SimCLR-ResNet18-Fovea-Gaze](https://huggingface.co/DM-Diaz/VEDB-SimCLR-ResNet18-Fovea-Gaze)
- [Colección VEDB - Eccentricity-Constrained SimCLR Models](https://hf.co/collections/DM-Diaz/eccentricity-constrained-simclr-models-vedb)
- [arXiv:2607.19316](https://arxiv.org/abs/2607.19316)
- [DOI: 10.32470/0416gfsq](https://doi.org/10.32470/0416gfsq)
- [Presentación en YouTube - CCN 2026](https://www.youtube.com/watch?v=Lb4S3FWqd2M&t=2545s)
- [Visual Experience Dataset (VEDB) - artículo en JOV](https://jov.arvojournals.org/article.aspx?articleid=2802101)
- [NeuroFovea - repositorio GitHub](https://github.com/ArturoDeza/NeuroFovea)

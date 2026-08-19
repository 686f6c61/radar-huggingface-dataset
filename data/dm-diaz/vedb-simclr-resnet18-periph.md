# DM-Diaz/VEDB-SimCLR-ResNet18-Periph

## Resumen

El modelo **VEDB-SimCLR-ResNet18-Periph** es un checkpoint de visión por computador desarrollado por Díaz y Henderson (2026) en el marco del estudio _Eccentricity-Constrained CNN Training Reveals Adaptive Information Coding Around the Visual Field_. Se trata de un encoder visual ResNet-18 preentrenado con aprendizaje auto-supervisado mediante el objetivo contrastivo SimCLR (NT-Xent) sobre el dataset de experiencia visual egocéntrica **VEDB** (Visual Experience Dataset), que incluye imágenes naturales con datos sincronizados de mirada humana. La condición **Periph** aísla la información visual periférica: se oculta la región central de cada fotograma (escotoma gris centrado en la mirada) para retener únicamente el contenido periférico. El modelo se publica como parte de una colección de cuatro variantes (Baseline, Fovea-Gaze, Periph y Periph-NF) que manipulan de forma complementaria el campo visual.

Este modelo es relevante para la investigación en neurociencia visual computacional, ya que permite estudiar cómo las representaciones aprendidas dependen de la porción del campo visual disponible durante el entrenamiento. Su arquitectura ligera (ResNet-18) y su tamaño reducido (0,1 GB) lo hacen accesible para experimentos en GPU de consumo. El checkpoint incluye tanto el encoder como la cabeza de proyección SimCLR, y se distribuye bajo licencia Apache 2.0, lo que facilita su uso y adaptación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (backbone) + proyección SimCLR (MLP de 2 capas) |
| Parametros totales | No disponible (checkpoint de 0,1 GB, estimable en ~11M para ResNet-18) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de visión, entrada de 224 × 224 píxeles) |
| Tipos de cuantizacion | No disponible (solo pesos originales en PyTorch) |
| Idiomas soportados | No disponible (modelo visual, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint PyTorch (.pth.tar) |

## Arquitectura y entrenamiento

El modelo utiliza un backbone **ResNet-18** estándar, seguido de una cabeza de proyección SimCLR compuesta por dos capas lineales: `Linear(512, 512)` con activación ReLU y `Linear(512, 128)`. El entrenamiento se realizó con el objetivo contrastivo **NT-Xent** (InfoNCE) sobre pares de vistas aumentadas de fotogramas del dataset VEDB. Las imágenes se preprocesaron a resolución 224 × 224 y, en la condición Periph, se aplicó una máscara circular centrada en el punto de mirada del participante, con un valor de píxel gris (128) y bordes difuminados mediante un filtro Gaussiano de tamaño de kernel 15. Esta máscara elimina la información central y conserva únicamente la periferia. El entrenamiento se prolongó durante 120 épocas con el optimizador Adam, según se indica en el checkpoint (clave `epoch` = 120). No se menciona el uso de técnicas como RLHF o DPO, al tratarse de un modelo puramente visual y auto-supervisado.

El checkpoint almacena el estado completo del modelo, incluyendo el `state_dict` con 124 entradas, los parámetros del optimizador y la arquitectura (`resnet18`). Los parámetros del encoder se almacenan bajo el prefijo `backbone.*`, mientras que la cabeza de proyección se encuentra en `backbone.fc.0` y `backbone.fc.2`. Este diseño permite extraer representaciones de 512 dimensiones desde la penúltima capa o representaciones proyectadas de 128 dimensiones desde la salida de la cabeza.

## Capacidades

- **Extracción de representaciones visuales**: genera embeddings de 512 dimensiones (capa previa a la proyección) o de 128 dimensiones (salida de la proyección) para imágenes de entrada.
- **Aprendizaje auto-supervisado**: el modelo ha sido preentrenado sin etiquetas, por lo que sus representaciones pueden transferirse a tareas downstream mediante fine-tuning o uso como extractor de características fijo.
- **Especialización en visión periférica**: al haber sido entrenado exclusivamente con información periférica (con escotoma central), el modelo codifica características del campo visual periférico, lo que lo hace útil para estudiar la percepción periférica y sus diferencias con la visión foveal.
- **Compatibilidad con pipelines de visión por computador**: al ser un ResNet-18 estándar, puede integrarse en frameworks como PyTorch, torchvision o Hugging Face Transformers (mediante adaptación).
- **Sin capacidades de lenguaje o generación**: no soporta tool calling, agentes, ni generación de texto; su función es exclusivamente perceptiva.

## Casos de uso

- **Investigación en neurociencia visual**: el modelo permite analizar cómo las representaciones neuronales artificiales se adaptan cuando se elimina la información central, comparando con variantes foveales o de campo completo para estudiar la organización retinotópica.
- **Pre-entrenamiento para tareas de visión egocéntrica**: puede servir como inicialización para clasificación, detección o segmentación en dominios con imágenes de cámaras montadas en la cabeza, donde la información periférica es relevante.
- **Estudio de la alineación con la corteza visual humana**: el paper asociado evalúa la correspondencia entre las representaciones del modelo y las respuestas fMRI de la corteza visual, por lo que puede usarse como modelo predictivo en experimentos de codificación voxelwise.
- **Evaluación de robustness ante oclusiones centrales**: al entrenar con escotomas, el modelo puede emplearse para probar cómo los sistemas de visión se comportan cuando se oculta la región central de la imagen, útil en aplicaciones de vigilancia o conducción autónoma con obstrucciones.
- **Generación de aumentos de datos**: las representaciones periféricas pueden combinarse con las de otras condiciones (foveal, baseline) para crear conjuntos de datos aumentados que mejoren la generalización en tareas de clasificación.
- **Docencia y divulgación**: al ser un modelo pequeño y de código abierto, sirve como ejemplo didáctico para explicar el aprendizaje contrastivo y los efectos de la manipulación del campo visual en el aprendizaje de representaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper asociado (arXiv:2607.19316) reporta análisis de rendimiento en tareas downstream y alineación con la corteza visual, pero esos datos no se incluyen en la model card ni en la documentación del repositorio.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un ResNet-18 con entrada de 224 × 224, la inferencia requiere menos de 1 GB de VRAM en FP32 (aproximadamente 0,5 GB para el modelo y activaciones). El checkpoint ocupa 0,1 GB en disco.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente (p. ej., NVIDIA GTX 1050 Ti, RTX 2060, o superiores). También puede ejecutarse en CPU para inferencia puntual, aunque con mayor latencia.
- **Compatibilidad con hardware de consumo**: sí, cabe en cualquier GPU consumer moderna (RTX 30/40 series) e incluso en dispositivos con memoria unificada como Apple Silicon.
- **Opciones de despliegue**: al ser un checkpoint PyTorch nativo, puede cargarse con `torch.load` y utilizarse directamente. No se proporcionan versiones en formatos optimizados como ONNX, TensorRT o GGUF. Para servir en producción, puede exportarse a ONNX o usar frameworks como TorchServe.
- **Latencia y throughput**: no se dispone de mediciones oficiales. En una GPU moderna (p. ej., RTX 3090), la inferencia de un lote de 32 imágenes de 224 × 224 tomaría del orden de milisegundos, típico para ResNet-18.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El propio estudio incluye variantes del mismo modelo (Baseline, Fovea-Gaze, Periph-NF) que pueden considerarse comparaciones directas, pero no se ofrecen datos cuantitativos en la model card. Se recomienda consultar el paper para obtener comparaciones con otros encoders auto-supervisados (p. ej., SimCLR estándar sobre ImageNet) y análisis de rendimiento.

## Limitaciones y advertencias

- **Sesgos y dominio específico**: el modelo fue entrenado únicamente con imágenes egocéntricas del dataset VEDB, que provienen de entornos naturales y con participantes específicos. Su generalización a otros dominios (imágenes sintéticas, radiografías, etc.) es limitada.
- **Riesgo de alucinación**: al ser un modelo visual sin generación de texto, el concepto de alucinación no aplica directamente. Sin embargo, las representaciones pueden ser poco fiables para imágenes con oclusiones centrales severas, ya que el modelo nunca ha visto esa región durante el entrenamiento.
- **Limitaciones de contexto**: la entrada está restringida a 224 × 224 píxeles; no se soportan resoluciones mayores sin re-escalado, lo que puede perder detalles periféricos.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial y modificación, pero exige atribución y no ofrece garantías. El dataset VEDB no se redistribuye; solo se incluyen ejemplos ilustrativos, por lo que para reproducir el entrenamiento completo es necesario acceder al dataset original.
- **Código de entrenamiento pendiente**: el repositorio indica que el código de entrenamiento y evaluación se publicará próximamente, por lo que actualmente no es posible reproducir exactamente el proceso de entrenamiento con los artefactos disponibles.
- **Interpretación biológica**: la condición Periph no simula fielmente la visión periférica humana (no modela la pérdida de agudeza dependiente de la excentricidad); es una manipulación artificial que aísla la información periférica, por lo que las conclusiones sobre percepción humana deben tomarse con cautela.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/DM-Diaz/VEDB-SimCLR-ResNet18-Periph)
- [Colección de modelos VEDB](https://hf.co/collections/DM-Diaz/eccentricity-constrained-simclr-models-vedb)
- [Paper en arXiv (2607.19316)](https://arxiv.org/abs/2607.19316)
- [DOI del artículo (10.32470/0416gfsq)](https://doi.org/10.32470/0416gfsq)
- [Presentación en CCN 2026 (YouTube)](https://www.youtube.com/watch?v=Lb4S3FWqd2M&t=2545s)
- [Visual Experience Dataset (VEDB)](https://jov.arvojournals.org/article.aspx?articleid=2802101)
- [Repositorio NeuroFovea](https://github.com/ArturoDeza/NeuroFovea)

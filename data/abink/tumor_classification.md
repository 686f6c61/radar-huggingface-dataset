# abink/Tumor_Classification

## Resumen

El modelo `abink/Tumor_Classification` es un clasificador de imágenes de resonancia magnética (MRI) cerebrales desarrollado por el usuario abink como parte de un proyecto de investigación sobre aprendizaje por transferencia aplicado a la detección de tumores. Resuelve un problema de clasificación en cuatro categorías: glioma, meningioma, tumor hipofisario y ausencia de tumor, con el objetivo de proporcionar una herramienta de apoyo al diagnóstico clínico mediante análisis automatizado de imágenes médicas.

El proyecto evalúa sistemáticamente cuatro arquitecturas convolucionales preentrenadas en ImageNet —VGG16, ResNet50, DenseNet121 y EfficientNetB0— para determinar cuál ofrece el mejor equilibrio entre precisión y robustez. Tras un proceso de fine-tuning con descongelado selectivo de capas, el modelo VGG16 con una cabeza de clasificación personalizada alcanza una precisión del 91,50 % sobre un conjunto de test equilibrado de 1.600 imágenes (400 por clase), lo que lo convierte en la arquitectura seleccionada.

La relevancia de este modelo reside en su enfoque metodológico: no se limita a entrenar una red neuronal y reportar una métrica, sino que documenta cómo afectan el transfer learning, la selección de capas, el fine-tuning, la optimización y la regularización al rendimiento final. Aunque el modelo se presenta como un artefacto de investigación con licencia no especificada, su arquitectura y procedimiento de entrenamiento son reproducibles y pueden servir como referencia para proyectos similares en el ámbito de la imagen médica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VGG16 (backbone preentrenado en ImageNet) con head personalizado (GlobalAveragePooling2D + Dense(256) + BatchNorm + Dropout(0.4) + Dense(128) + BatchNorm + Dropout(0.3) + Dense(4, softmax)) |
| Parametros totales | no disponible (el backbone VGG16 tiene aproximadamente 138 M, pero el head añade una cantidad menor no especificada) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de clasificacion de imagenes, sin ventana de texto) |
| Tipos de cuantizacion | no disponible (no se han publicado versiones cuantizadas) |
| Idiomas soportados | no disponible (no aplica, es un clasificador visual) |
| Licencia | no disponible |
| Formato de pesos | Keras (formato HDF5 o SavedModel, no especificado) |

## Arquitectura y entrenamiento

La arquitectura final se basa en VGG16, una red convolucional profunda de 16 capas preentrenada en ImageNet, a la que se le sustituye la cabeza de clasificación original por un bloque personalizado. Este bloque consta de una capa de GlobalAveragePooling2D que reduce la dimensionalidad espacial, seguida de dos capas densas de 256 y 128 neuronas con normalización por lotes y dropout de 0.4 y 0.3 respectivamente, y una capa final de softmax de 4 neuronas para las cuatro clases objetivo. La elección de GlobalAveragePooling2D frente a Flatten reduce el número de parámetros y ayuda a controlar el sobreajuste.

El proceso de entrenamiento sigue un enfoque de transfer learning en dos fases: primero se congelan todas las capas del backbone y se entrena solo la cabeza de clasificación con una tasa de aprendizaje de 1×10⁻⁴ y optimizador Adam; posteriormente se descongela el último bloque convolucional de VGG16 y se realiza un fine-tuning con una tasa de aprendizaje reducida de 1×10⁻⁵ para no alterar excesivamente las características preentrenadas. Se emplean early stopping, ReduceLROnPlateau y checkpointing para optimizar el entrenamiento. Las imágenes de entrada se redimensionan a 128×128×3 píxeles y se aplica un pipeline consistente de preprocesado y aumento de datos en todas las arquitecturas evaluadas para garantizar comparaciones justas.

## Capacidades

- Clasificación de imágenes de MRI cerebrales en cuatro categorías: glioma, meningioma, tumor hipofisario y sin tumor.
- Transfer learning sobre backbones preentrenados en ImageNet, lo que permite extraer características visuales genéricas sin necesidad de entrenar desde cero.
- Fine-tuning selectivo de capas convolucionales para adaptar el modelo al dominio médico específico.
- Manejo de imágenes de entrada de 128×128×3 píxeles, con preprocesamiento y augmentación de datos integrados en el pipeline.
- Evaluación multiclase con métricas de precisión, recall y F1 por clase, además de precisión global.
- Capacidad de distinguir entre tres tipos de tumores y un control sano, con mayor fiabilidad en glioma (F1 0.97) y meningioma (F1 0.96) que en tumor hipofisario (F1 0.84).
- No soporta generación de texto, tool calling, agentes ni capacidades multilingües; es un modelo de visión por computador puro.

## Casos de uso

- **Triaje asistido en radiología**: el modelo puede preclasificar estudios de MRI cerebrales para priorizar casos sospechosos de glioma o meningioma en colas de revisión, reduciendo el tiempo de espera para pacientes con lesiones agresivas.
- **Segunda opinión diagnóstica**: integrado como herramienta de apoyo en sistemas de información radiológica, ofrece una lectura automatizada que el radiólogo puede contrastar con su evaluación clínica, especialmente útil en entornos con escasez de especialistas.
- **Formación de estudiantes de medicina**: el modelo sirve como material didáctico interactivo para aprender a identificar patrones de tumores cerebrales en MRI, con explicaciones de las regiones de imagen que contribuyen a cada clasificación.
- **Investigación en transfer learning**: el proyecto documenta la comparativa entre cuatro arquitecturas preentradas, lo que lo convierte en una base para estudios sobre adaptación de modelos de visión general a dominios médicos específicos.
- **Monitorización de evolución tumoral**: aunque el modelo clasifica tipos de tumor, puede adaptarse para comparar imágenes de un mismo paciente a lo largo del tiempo, ayudando a detectar cambios en el tamaño o tipo de lesión en estudios longitudinales.
- **Despliegue en entornos con recursos limitados**: al requerir una entrada de solo 128×128 píxeles y usar una arquitectura VGG16 relativamente ligera, el modelo puede ejecutarse en estaciones de trabajo estándar de hospitales sin necesidad de GPUs de alto rendimiento, facilitando su integración en entornos clínicos reales.

## Benchmarks y rendimiento

Los resultados reportados en la model card corresponden a un conjunto de test equilibrado de 1.600 imágenes (400 por clase). No se han publicado comparaciones con otros modelos en la información disponible.

| Modelo | Precisión inicial | Precisión fine-tuning | Estado final |
|---|---|---|---|
| VGG16 | 83,44 % | 91,50 % | Seleccionado |
| DenseNet121 | 83,00 % | 83,00 % | Baseline fuerte |
| ResNet50 | 68,00 % | 81,00 % | Baseline |
| EfficientNetB0 | 33,00 % | 35,00 % | No seleccionado |

Métricas detalladas del modelo VGG16 fine-tuned:

| Clase | Precisión | Recall | F1 |
|---|---|---|---|
| Glioma | 0,95 | 0,98 | 0,97 |
| Meningioma | 0,92 | 1,00 | 0,96 |
| No tumor | 0,84 | 0,93 | 0,88 |
| Tumor hipofisario | 0,97 | 0,75 | 0,84 |

Macro F1: 0,91 | Weighted F1: 0,91

## Requisitos de hardware

- **VRAM estimada**: para inferencia con VGG16 en imágenes de 128×128×3, se estima un consumo de 1-2 GB en FP32, reducible a <1 GB con cuantización a int8 (si estuviera disponible). No se han publicado versiones cuantizadas.
- **GPU recomendadas**: una GPU de gama media como NVIDIA GTX 1660, RTX 2060 o superior es suficiente para inferencia; el entrenamiento con fine-tuning requiere 4-8 GB de VRAM, compatible con RTX 3060 o A100.
- **CPU**: la inferencia es factible en CPU moderna con un tiempo por imagen de 0,1-0,5 segundos, pero se recomienda GPU para uso en tiempo real.
- **Opciones de despliegue**: el modelo se distribuye en formato Keras, por lo que puede desplegarse con TensorFlow Serving, Keras API en Python, o exportarse a TensorFlow Lite para entornos edge. No se ha reportado compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- **Latencia**: en GPU de gama media se estima una latencia de 10-50 ms por imagen; en CPU, 100-500 ms. El throughput en GPU puede alcanzar 100-200 imágenes por segundo en lotes.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos del mismo autor o con métricas públicas en el mismo dataset en la información proporcionada. Sin embargo, en el contexto de clasificación de tumores cerebrales con MRI, existen modelos similares en la literatura:

| Modelo | Arquitectura | Precisión reportada | Licencia | Disponibilidad |
|---|---|---|---|---|
| `abink/Tumor_Classification` | VGG16 fine-tuned | 91,5 % | No disponible | Hugging Face |
| Modelo híbrido ML+DL (Nahiduzzaman et al., 2025) | ML + DL híbrido | No disponible | No disponible | Artículo académico |
| CNN secuencial (Fully Convolutional Network) | FCN | No disponible | No disponible | Artículo académico |

Los artículos de búsqueda (Nature, Springer, ScienceDirect) presentan enfoques similares pero no publican métricas comparables en el mismo conjunto de datos, por lo que no se puede establecer una comparación cuantitativa rigurosa. Para una evaluación justa, se necesitaría reproducir los experimentos sobre el mismo conjunto de datos de test.

## Limitaciones y advertencias

- **Sesgos de datos**: el modelo se entrena con un conjunto de imágenes de MRI que no está descrito en detalle (fuente, distribución demográfica, protocolo de adquisición), lo que puede introducir sesgos de generalización a otros hospitales o poblaciones.
- **Riesgo de alucinación**: en clasificación de imágenes, el riesgo de alucinación se manifiesta como falsos positivos (tumores que no existen) o falsos negativos (tumores que no se detectan). La clase "No tumor" tiene un recall de 0,93, lo que implica que un 7% de las imágenes sin tumor se clasifican como tumor, lo que puede generar alarmas innecesarias.
- **Limitaciones de contexto**: el modelo solo procesa imágenes de 128×128×3 píxeles, lo que reduce la resolución de MRI y puede perder detalles finos relevantes para tumores pequeños o de baja contraste.
- **Restricciones de licencia**: no se ha especificado licencia para el modelo, lo que genera incertidumbre legal sobre su uso comercial o derivación; se recomienda contactar con el autor antes de cualquier despliegue en producción.
- **Caveat de producción**: la precisión de 91,5 % es en un conjunto de test equilibrado y puede no reflejar la distribución real de casos en un hospital, donde la prevalencia de tumores es baja. Se recomienda evaluar el modelo en el entorno clínico específico antes de uso real.
- **Modelo no actualizado**: la fecha de creación es 2026-08-24, pero no hay información sobre mantenimiento, actualizaciones o soporte posterior.

## Enlaces

- [Hugging Face - abink/Tumor_Classification](https://huggingface.co/abink/Tumor_Classification)
- Artículo de Nature: "A hybrid explainable model based on advanced machine learning and deep learning models for classifying brain tumors using MRI images" (2025) - [Enlace](https://www.nature.com/articles/s41598-025-85874-7)
- Artículo de Springer: "Advancements in Machine Learning for Brain Tumor..." (2025) - [Enlace](https://link.springer.com/article/10.1007/s11831-025-10340-6)
- Artículo de ScienceDirect: "Classification of brain tumor using deep learning at early stage" (2024) - [Enlace](https://www.sciencedirect.com/science/article/pii/S266591742400271X)
- Artículo de ScienceDirect: "Introducing a deep learning method for brain tumor classification using fully convolutional neural networks" (2023) - [Enlace](https://www.sciencedirect.com/science/article/pii/S2352914823002691)
- Artículo de Nature: "Detection and classification of brain tumor using hybrid deep learning..." (2023) - [Enlace](https://www.nature.com/articles/s41598-023-50505-6)

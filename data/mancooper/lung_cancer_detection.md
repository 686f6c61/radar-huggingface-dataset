# mancooper/lung_cancer_detection

## Resumen
Lung cancer detection es un modelo experimental de clasificación binaria de imágenes desarrollado por el usuario mancooper y publicado en Hugging Face. Se trata de una red neuronal convolucional (CNN) construida con TensorFlow y Keras que clasifica imágenes de resonancia magnética de pulmón en dos categorías: "cancer" y "no_cancer". El modelo resuelve, en el plano educativo, el problema de demostrar un pipeline completo de clasificación de imágenes médicas: carga de datos, preprocesado, entrenamiento, validación e inferencia.

No es un sistema de diagnóstico clínico ni está validado para uso médico. Su relevancia actual es principalmente didáctica: sirve como punto de partida para aprender sobre clasificación de imágenes médicas, sobre las trampas de la validación en este dominio (fuga de datos a nivel de paciente, ausencia de conjunto de test independiente) y como base sobre la que construir prototipos de investigación con validación adecuada. El tamaño del repositorio es de aproximadamente 0,3 GB y el modelo se distribuye en formato nativo de Keras (archivo .keras).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN personalizada (3 capas convolucionales + capa densa) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (tarea de clasificacion de imagenes) |
| Licencia | Apache 2.0 (metadata de Hugging Face); la model card menciona MIT, existe una discrepancia sin resolver |
| Formato de pesos | .keras (formato nativo de Keras) |

Detalles adicionales de la arquitectura declarados por el autor:

| Parametro | Valor |
|---|---|
| Tamaño de entrada | 128 × 128 píxeles, 3 canales (RGB) |
| Capas convolucionales | 3 (32, 64 y 128 filtros) |
| Capa densa | 256 unidades, activación ReLU |
| Capa de salida | 1 unidad, activación sigmoide |
| Optimizador | Adam |
| Función de pérdida | Entropía cruzada binaria |
| Tamaño de batch | 32 |
| Épocas de entrenamiento | 20 |
| Semilla aleatoria | 42 |

## Arquitectura y entrenamiento
El modelo es una CNN secuencial con tres bloques convolucionales (32, 64 y 128 filtros) seguidos de una capa densa de 256 unidades con ReLU y una salida sigmoide de una sola unidad para clasificación binaria. La entrada se normaliza convirtiendo los píxeles a float32 y dividiendo entre 255 para llevarlos al rango [0, 1]. El entrenamiento utiliza el optimizador Adam con entropía cruzada binaria como pérdida, batch size 32 y 20 épocas, con semilla fija 42 para reproducibilidad.

Los datos de entrenamiento se cargan desde un directorio con subcarpetas por clase mediante `tf.keras.utils.image_dataset_from_directory`, con una división 80/20 entre entrenamiento y validación. La model card reconoce limitaciones importantes en el entrenamiento: no se documenta la procedencia del dataset (apuntaba a una carpeta de Google Drive), ni su tamaño, balance de clases ni licencia; no existe un conjunto de test independiente (la validación proviene del mismo directorio de entrenamiento); y no se garantiza separación a nivel de paciente, lo que implica riesgo de fuga de datos entre splits. No se menciona el uso de técnicas como aumento de datos, RLHF ni transferencia de pesos preentrenados.

## Capacidades
- Clasificación binaria de imágenes de RM de pulmón en las categorías "cancer" y "no_cancer", con salida de probabilidad mediante sigmoide.
- Inferencia sobre imágenes individuales: la función auxiliar de predicción redimensiona la imagen a 128 × 128, la normaliza a [0, 1] y la pasa al modelo.
- Reproducibilidad del entrenamiento: el script de entrenamiento completo está documentado con semilla, batch size y número de épocas fijos.
- Carga sencilla del modelo con `tf.keras.models.load_model("lung_cancer_model.keras")`.
- No tiene capacidades de texto, razonamiento, código, tool calling, agentes ni procesamiento de audio: es un clasificador de imágenes puro.

Advertencia relevante: la salida sigmoide representa la probabilidad de la clase codificada como etiqueta 1, y la función de predicción asume un orden de clases concreto que puede no coincidir con `train_ds.class_names`. Es imprescindible verificar el mapeo de etiquetas antes de interpretar predicciones o niveles de confianza.

## Casos de uso
- Enseñanza de CNN en cursos de deep learning: el modelo sirve como ejemplo completo y ejecutable de un pipeline de clasificación de imágenes médicas, con arquitectura, entrenamiento e inferencia documentados paso a paso.
- Prácticas de preprocesado de imágenes médicas: se puede estudiar el efecto de la normalización, el redimensionado a 128 × 128 y la conversión de imágenes de RM (originalmente en escala de grises) a RGB de tres canales.
- Prototipado de investigación con validación posterior: punto de partida para construir un clasificador más robusto, añadiendo un conjunto de test independiente, separación a nivel de paciente y métricas adecuadas (sensibilidad, especificidad, ROC-AUC).
- Demostración de buenas prácticas de documentación de modelos: la model card es un buen ejemplo de cómo documentar usos previstos, usos fuera de alcance, limitaciones y consideraciones éticas.
- Experimentación con TensorFlow/Keras: base para probar modificaciones de arquitectura (más capas, regularización, aumento de datos) y comparar resultados sobre el mismo dataset.
- Material para formación en ética de IA médica: útil para ilustrar por qué un modelo con alta precisión en validación puede no ser clínicamente válido, y los riesgos de falsos positivos y falsos negativos en imágenes médicas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que el script evalúa el modelo sobre la división de validación (pérdida y exactitud) pero que no se incluyen valores medidos, por lo que no se reclama ninguna cifra de rendimiento. Para una evaluación rigurosa, el propio autor recomienda reportar exactitud, precisión, sensibilidad (recall), especificidad, F1, ROC-AUC y matriz de confusión sobre un conjunto de test independiente, garantizando que imágenes del mismo paciente no aparezcan en entrenamiento y evaluación.

## Requisitos de hardware
- VRAM estimada para inferencia: el repositorio ocupa 0,3 GB y se trata de una CNN pequeña (3 capas convolucionales y una capa densa de 256 unidades); cualquier GPU moderna con 2-4 GB de VRAM, o incluso solo CPU, es suficiente para inferencia.
- GPU recomendadas: no es necesario hardware especializado; una GPU de gama media de consumo (por ejemplo, GTX 1660, RTX 3060 o superior) acelera el entrenamiento, pero el modelo también puede entrenarse en CPU dado su tamaño reducido.
- Cabe en GPUs de consumo sin problemas, tanto para inferencia como para reentrenamiento con el mismo dataset.
- Opciones de despliegue: TensorFlow 2.x con Keras es el requisito principal; puede servirse mediante una API propia con Flask/FastAPI, TF Serving o integrarse en notebooks de Jupyter/Colab. No es compatible con llama.cpp, Ollama, vLLM ni TGI, que son runtimes para modelos de lenguaje.
- Latencia y throughput: no disponibles; dada la entrada de 128 × 128 y la arquitectura ligera, la inferencia por imagen es del orden de milisegundos en GPU, pero no hay cifras oficiales.

## Comparativa con modelos similares
| Modelo | Tipo | Tarea | Entrada | Licencia | Validacion clinica |
|---|---|---|---|---|---|
| mancooper/lung_cancer_detection | CNN personalizada (Keras) | Clasificacion binaria de RM de pulmon | 128 × 128 RGB | Apache 2.0 / MIT (discrepancia) | No |
| CheXNet (DenseNet-121) | CNN basada en DenseNet | Deteccion de 14 patologias en radiografias de torax | 224 × 224 | Codigo abierto (investigacion) | No; referencia academica ampliamente citada |
| Modelos de la serie MedSAM / SAM-Med | Vision transformer fundacional | Segmentacion de imagenes medicas | 1024 × 1024 | Apache 2.0 (MedSAM) | No; rendimiento evaluado en benchmarks publicos |

Comparado con CheXNet o MedSAM, este modelo es mucho más pequeño, específico de RM de pulmón, sin evaluación publicada ni comunidad activa (36 descargas y 1 like en el momento de la ficha). Su ventaja es la simplicidad y la facilidad de reproducción para fines educativos.

## Limitaciones y advertencias
- No es un sistema de diagnóstico: la model card prohíbe explícitamente su uso en diagnóstico clínico, cribado, decisiones de tratamiento, triaje de pacientes o como sustituto de un radiólogo.
- Riesgo elevado de falsos positivos y falsos negativos; el nivel de confianza mostrado por el modelo no constituye prueba de exactitud diagnóstica.
- No existe conjunto de test independiente: la evaluación se realiza sobre la división de validación del mismo directorio de entrenamiento, lo que puede sobreestimar el rendimiento.
- Posible fuga de datos a nivel de paciente: no se garantiza que imágenes del mismo paciente estén separadas entre entrenamiento y validación.
- Procedencia del dataset sin documentar: se desconocen fuente, tamaño, balance de clases, detalles de adquisición y licencia de las imágenes.
- La conversión a RGB de tres canales puede no preservar características relevantes de las imágenes de RM originales, típicamente en escala de grises.
- Discrepancia de licencias: la metadata de Hugging Face declara Apache 2.0 mientras la model card menciona MIT; conviene verificar la licencia aplicable antes de cualquier reutilización.
- Variabilidad entre escáneres, instituciones, poblaciones de pacientes y protocolos de adquisición limita la generalización; cualquier uso de investigación requiere validación externa, revisión por expertos, salvaguardas de privacidad y revisión ética y regulatoria.
- El mapeo de etiquetas en la función de predicción puede ser incorrecto si no se verifica `train_ds.class_names`.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/mancooper/lung_cancer_detection
- Paper, repositorio de código y demos: no disponibles

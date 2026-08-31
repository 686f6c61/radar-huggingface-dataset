# atkinschang/DocumentFigureClassifier-v2.5-MLX

## Resumen

El modelo `atkinschang/DocumentFigureClassifier-v2.5-MLX` es una conversión a MLX de los pesos del clasificador de figuras de documentos `docling-project/DocumentFigureClassifier-v2.5`, desarrollado por el equipo de Docling (IBM). Se trata de un modelo de clasificación de imágenes basado en la arquitectura EfficientNet-B0, ajustado sobre un subconjunto del dataset HuggingFace/finepdfs para categorizar figuras extraídas de documentos en 26 clases predefinidas. La conversión a MLX permite su ejecución eficiente en hardware Apple Silicon, ampliando las opciones de despliegue del modelo original.

Con aproximadamente 4,08 millones de parámetros y un tamaño de 32 MB, es un modelo ligero y rápido, adecuado para integrarse en pipelines de procesamiento de documentos donde se necesita distinguir tipos de figuras (tablas, gráficos, diagramas, etc.) de forma automática. Su licencia MIT facilita su uso tanto en investigación como en entornos comerciales. La relevancia actual radica en la creciente necesidad de automatizar la extracción de información de documentos digitalizados, donde la clasificación precisa de figuras es un paso previo esencial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | EfficientNet-B0 |
| Parametros totales | 4.082.870 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (clasificacion de imagenes, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | safetensors (conversion MLX) |

## Arquitectura y entrenamiento

El modelo base `docling-project/DocumentFigureClassifier-v2.5` emplea la arquitectura EfficientNet-B0 de Google, conocida por su buen equilibrio entre precision y eficiencia computacional mediante el escalado compuesto de profundidad, anchura y resolucion. Fue ajustado (fine-tuning) sobre un subconjunto del dataset HuggingFace/finepdfs, compuesto por figuras extraidas de documentos PDF academicos y tecnicos. El objetivo es clasificar cada figura en una de 26 categorias, como tablas, graficos de lineas, diagramas de flujo, imagenes fotograficas, etc. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni el uso de tecnicas como RLHF o DPO, ya que no se han publicado en la documentacion disponible. La conversion a MLX realizada por `atkinschang` no modifica los pesos originales, solo los adapta al formato optimizado para Apple Silicon.

## Capacidades

- Clasificacion de imagenes de figuras de documentos en 26 categorias predefinidas (tablas, graficos, diagramas, etc.).
- Inferencia rapida gracias al tamano reducido del modelo (4M parametros) y a la optimizacion MLX para hardware Apple.
- Integracion sencilla en pipelines de procesamiento de documentos mediante la libreria Docling o directamente con MLX.
- No soporta generacion de texto, tool calling, agentes ni capacidades multimodales mas alla de la clasificacion de imagenes.
- Al ser un modelo de vision, no tiene dependencia de idioma; puede procesar figuras de documentos en cualquier lengua.

## Casos de uso

- Extraccion de informacion de documentos academicos: clasificar automaticamente las figuras de un PDF para indexarlas o extraer su contenido (por ejemplo, separar tablas de graficos).
- Automatizacion de flujos de trabajo de documentos empresariales: detectar y categorizar figuras en informes, facturas o manuales tecnicos para su posterior procesamiento.
- Preprocesamiento en sistemas de OCR y analisis de documentos: identificar el tipo de figura antes de aplicar tecnicas especificas de extraccion (tablas con reconocimiento de estructura, graficos con analisis de tendencias).
- Construccion de bases de datos de figuras cientificas: clasificar imagenes extraidas de articulos para crear repositorios buscables por tipo de figura.
- Asistencia a la accesibilidad: generar descripciones alternativas automaticas para figuras en documentos digitales, clasificando primero su tipo.
- Despliegue en entornos con recursos limitados: al ser un modelo de 4M parametros, puede ejecutarse en CPU o en GPUs modestas, incluso en dispositivos Apple Silicon gracias a la conversion MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base `docling-project/DocumentFigureClassifier-v2.5` no incluye metricas de precision, recall o F1 en su documentacion publica. Se recomienda consultar el paper asociado (arXiv:2408.09869) para posibles evaluaciones, aunque no se ha confirmado su contenido.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 4M parametros, la huella de memoria es muy reducida. En FP32 ocuparia unos 16 MB, y en cuantizaciones tipicas (8 bits) unos 4 MB. Cabe en cualquier GPU moderna, incluso integradas.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente. En Apple Silicon, la conversion MLX permite ejecucion eficiente en CPU y GPU unificada.
- Compatibilidad con hardware de consumo: si, se puede ejecutar en portatiles con GPU integrada o en Raspberry Pi (con limitaciones de velocidad).
- Opciones de despliegue: MLX (para Apple Silicon), tambien se puede cargar con librerias estandar de PyTorch si se convierten los pesos, aunque el formato MLX es especifico. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se dispone de datos medidos. Dado el tamano, se espera una latencia de milisegundos por imagen en hardware moderno, pero no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con otros clasificadores de figuras de documentos. Existen alternativas como los modelos de deteccion de objetos (por ejemplo, YOLO) o clasificadores genericos de imagenes (ResNet, ViT), pero no hay datos publicos de rendimiento relativo en la misma tarea. Se recomienda evaluar el modelo en el conjunto de datos especifico de cada caso de uso.

## Limitaciones y advertencias

- El modelo esta entrenado especificamente para figuras de documentos academicos y tecnicos; puede tener un rendimiento suboptimo en figuras de otros dominios (por ejemplo, diseno grafico o imagenes medicas).
- No se han documentado sesgos especificos, pero al entrenarse en un subconjunto de finepdfs, podria reflejar sesgos presentes en ese corpus (por ejemplo, sobrerrepresentacion de ciertos tipos de graficos).
- Riesgo de clasificacion erronea en figuras ambiguas o de baja resolucion; se recomienda validar en el dominio de aplicacion.
- La conversion MLX limita el despliegue a hardware Apple Silicon si se usa el formato nativo; para otros entornos habria que convertir los pesos a otro formato (por ejemplo, ONNX o TorchScript).
- No se proporcionan garantias de precision ni soporte oficial; el modelo se ofrece tal cual bajo licencia MIT.

## Enlaces

- Modelo MLX en HuggingFace: https://huggingface.co/atkinschang/DocumentFigureClassifier-v2.5-MLX
- Modelo base original: https://huggingface.co/docling-project/DocumentFigureClassifier-v2.5
- Repositorio del clasificador base: https://huggingface.co/docling-project/DocumentFigureClassifier
- Paper asociado (arXiv): https://arxiv.org/abs/2408.09869
- Catalogo de modelos de Docling: https://docling-project.github.io/docling/usage/model_catalog/

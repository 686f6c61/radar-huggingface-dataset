# EIDORA/VGG16_IN1k

## Resumen

EIDORA/VGG16_IN1k es un artefacto ONNX publicado por la organizacion EIDORA dentro de su catálogo de modelos de imagen. No es un modelo generativo ni un LLM: es un extractor de características visuales basado en VGG-16 que expone la representación de 4096 dimensiones de la primera capa totalmente conectada, normalizada y pensada para comparación por similitud coseno. El paquete se deriva del checkpoint `torchvision/vgg16-imagenet1k-v1` y conserva el entrenamiento original sobre ImageNet-1K.

El interés del modelo es acotado y explícito: sirve como base histórica reproducible para estudios que usaron características FC de VGG16 (la model card menciona concretamente estudios de patrimonio cultural) y como línea base de similitud visual de alta dimensionalidad. Frente a embeddings auto-supervisados o visión-lenguaje modernos, su valor es la comparabilidad con literatura previa, no el rendimiento estado del arte.

El repositorio ocupa 0,5 GB, se publicó el 27 de octubre de 2026 y no registra descargas ni likes en el momento de la consulta. La model card advierte de que los términos de redistribución de los pesos preentrenados deben verificarse antes de publicar el artefacto ONNX, y no declara licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN VGG-16 (13 capas convolucionales y 3 capas totalmente conectadas), exportada a ONNX |
| Parametros totales | ~138 M (arquitectura VGG-16 de referencia) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; entrada de imagen fija de 224x224x3 en formato NCHW |
| Tipos de cuantizacion | no declarados en la model card; el artefacto distribuido es ONNX de 0,5 GB |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | no disponible; la model card pide verificar los terminos de redistribucion de los pesos de TorchVision antes de publicar el ONNX |
| Formato de pesos | ONNX, ejecutado con ONNX Runtime |
| Dimension del embedding | 4096 |
| Normalizacion | si (vectores normalizados) |
| Metrica de similitud | coseno |
| Modalidad | imagen |
| Proveedor declarado | `CPUExecutionProvider` |
| Esquema de paquete | 3 (implementacion de preparacion de escritorio 1) |
| Tamano del repositorio | 0,5 GB |

Preprocesado declarado en la model card:

| Parametro | Valor |
|---|---|
| Resolucion de entrada | 224x224 |
| Layout | NCHW |
| Estrategia de redimensionado | `short_edge_crop` (por defecto; alternativas: `stretch`, `fill_crop`, `fit_pad`) |
| Borde corto | 256 (por defecto; rango 224-2048) |
| Redondeo del resize | truncate |
| Interpolacion | bilinear (por defecto; alternativas: nearest, bicubic, lanczos) |
| Posicion del recorte | center |
| Rescale | 0,00392156862745098 (1/255) |
| Media | 0,485 / 0,456 / 0,406 |
| Desviacion tipica | 0,229 / 0,224 / 0,225 |
| Fondo alfa | 0 / 0 / 0 |

## Arquitectura y entrenamiento

VGG-16 es una red convolucional profunda presentada por Simonyan y Zisserman (arXiv:1409.1556) que apila bloques de convoluciones 3x3 con filtros crecientes (64, 128, 256, 512, 512) separados por max-pooling, seguidos de tres capas totalmente conectadas. Este paquete no reentrena ni modifica la arquitectura: toma los pesos de `torchvision/vgg16-imagenet1k-v1`, entrenados para clasificación en ImageNet-1K (1000 clases, imágenes de 224x224), y expone la activación de 4096 dimensiones como embedding de imagen. No hay información en la model card sobre fine-tuning adicional, aumento de datos, RLHF/DPO ni técnicas de regularización posteriores al checkpoint original; se trata de una conversión de formato con preprocesado estandarizado, no de un modelo nuevo.

La innovación técnica del paquete está en la capa de empaquetado, no en la red: un esquema de preparación versionado (esquema 3) que fija resolución, interpolación, media y desviación típica de ImageNet, normalización L2 de la salida y similitud coseno como contrato de uso, de modo que los embeddings sean comparables entre ejecuciones. La model card es explícita en que los valores por defecto son recomendaciones y que las alternativas ofrecidas (otras interpolaciones, otras estrategias de resize) no son afirmaciones de calidad equivalente.

## Capacidades

- Extracción de embeddings de imagen de 4096 dimensiones a partir de la representación FC de VGG-16, con salida normalizada.
- Comparación de imágenes por similitud coseno, apta para búsqueda y agrupamiento.
- Reproducción de pipelines académicos que usaron características FC de VGG16 como descriptor visual.
- Actúa como extractor de características congelado: permite entrenar una cabeza lineal o un clasificador ligero encima (linear probing) sin tocar los pesos.
- Ejecución en CPU mediante ONNX Runtime (`CPUExecutionProvider` declarado).
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso, visión-lenguaje, audio ni modo thinking.
- No tiene capacidades multilingües: no procesa texto.
- No realiza detección de objetos ni segmentación; solo produce un vector global por imagen.

## Casos de uso

- Reproducción de estudios de patrimonio cultural: la model card indica este uso de forma explícita; sirve para recalcular las características FC de 4096 dimensiones con un pipeline fijado y comparar resultados numéricamente con publicaciones anteriores que usaron VGG16.
- Búsqueda visual y recuperación de imágenes: indexar el catálogo con los vectores normalizados y consultar por similitud coseno en un índice vectorial (FAISS, hnswlib) para encontrar piezas visualmente parecidas.
- Deduplicación de catálogos y datasets: agrupar vectores con un umbral de coseno para detectar imágenes repetidas o casi idénticas antes de entrenar otros modelos.
- Agrupamiento y exploración de colecciones: reducir los 4096 dimensiones con UMAP o t-SNE y clusterizar para auditar sesgos de composición o descubrir subconjuntos temáticos no etiquetados.
- Línea base en evaluación de embeddings: comparar un embedding auto-supervisado o visión-lenguaje candidato contra esta referencia clásica para cuantificar la mejora en una tarea de similitud concreta.
- Clasificación ligera sobre características congeladas: extraer embeddings de un conjunto etiquetado pequeño y entrenar una regresión logística o SVM encima, útil cuando no hay presupuesto para fine-tuning.
- Verificación de pipelines de preprocesado: al fijar resize, interpolación y estadísticas, el artefacto permite comprobar que una implementación propia de preprocesado produce vectores equivalentes a los de referencia.
- Filtrado de calidad en ingestas de datos: descartar imágenes cuya distancia al centroide del dominio sea anómala antes de pasarlas a etapas más caras del pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del artefacto ONNX en la información disponible. La model card no incluye ninguna métrica de evaluación, ni de recuperación, ni de clasificación, ni de latencia.

Como referencia externa de la arquitectura base (no verificada en la model card ni medida sobre este ONNX):

| Modelo | Metrica | Valor | Fuente |
|---|---|---|---|
| EIDORA/VGG16_IN1k | sin metricas publicadas | no disponible | model card |
| VGG-16 (ImageNet) | exactitud en test ImageNet | 92,7 % | GeeksforGeeks (referencia externa, no se especifica si top-1 o top-5) |
| Checkpoint `torchvision/vgg16-imagenet1k-v1` | top-1 / top-5 | no disponible en la informacion proporcionada | se remite a la ficha de TorchVision |

## Requisitos de hardware

- VRAM estimada para inferencia en GPU: en torno a 1-2 GB con los pesos en fp32 (0,5 GB de pesos) y lotes pequeños; las activaciones de VGG-16 a 224x224 son el factor dominante al aumentar el lote.
- Cabe en cualquier GPU de consumo con 4 GB o más (GTX 1650, RTX 3050, RTX 3060, RTX 4090). Usar A100 o H100 para este modelo es desproporcionado salvo que se busque throughput masivo por lotes.
- Despliegue declarado: ONNX Runtime con `CPUExecutionProvider`; la model card indica que las declaraciones de proveedor requieren certificación en `validation-report.json` antes de la publicación.
- Alternativas de despliegue no declaradas por el autor: exportación a TensorRT u OpenVINO, o ejecución con cualquier runtime compatible con ONNX. vLLM, llama.cpp, Ollama y TGI no aplican: no es un modelo de lenguaje.
- Coste computacional de la arquitectura: VGG-16 ronda los 15,5 GFLOPs por imagen a 224x224, un orden de magnitud superior al de ResNet-50, lo que se traduce en latencia y consumo claramente mayores en CPU.
- Latencia y throughput concretos: no disponible. No se han publicado mediciones para este artefacto.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension de salida | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EIDORA/VGG16_IN1k | ~138 M | 4096 (normalizado) | 224x224 | no disponible | ONNX en HuggingFace, 0 descargas |
| VGG-16 `torchvision/vgg16-imagenet1k-v1` | ~138 M | 4096 en la capa FC | 224x224 | consultar terminos de TorchVision | pesos originales, ampliamente usado |
| ResNet-50 (`torchvision`) | ~25,6 M | 2048 | 224x224 | consultar terminos de TorchVision | disponible |
| ViT-B/16 (`torchvision`, ImageNet-1K) | ~86 M | 768 | 224x224 | consultar terminos de TorchVision | disponible |
| Embeddings auto-supervisados tipo DINOv2 (ViT-B) | ~86 M | 768 | 224x224 (14x14 parches) | consultar la ficha del modelo | disponible |

Frente a ResNet-50, este artefacto ofrece el doble de dimensionalidad y una referencia histórica, a cambio de aproximadamente 5 veces más parámetros y un coste de inferencia bastante mayor. Frente a ViT-B/16 o DINOv2, pierde en calidad de representación para tareas semánticas modernas, pero conserva la ventaja de comparabilidad directa con literatura que usó VGG16. No se dispone de comparación cuantitativa de rendimiento entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- Licencia no disponible: la model card indica explícitamente que deben verificarse los términos de redistribución de los pesos preentrenados de TorchVision antes de publicar el artefacto ONNX. No hay confirmación de uso comercial permitido.
- El modelo se entrenó para clasificación en ImageNet-1K, no para similitud ni recuperación; las características FC son un subproducto, no una representación optimizada para similitud semántica.
- La propia model card califica los embeddings de 4096 dimensiones como línea base histórica y recomienda evaluar el significado en dominio cultural contra embeddings auto-supervisados y visión-lenguaje más recientes.
- Coste de almacenamiento y cómputo alto en relación con alternativas modernas: 0,5 GB de pesos y del orden de 15,5 GFLOPs por imagen a 224x224.
- Entrada fija de 224x224 con recorte por borde corto: objetos pequeños o imágenes con relación de aspecto extrema pueden perder información relevante en el recorte.
- Sesgos heredados de ImageNet-1K en la distribución de clases, vocabulario visual y predominio de ciertas culturas y contextos; no se documenta ninguna mitigación.
- Riesgo de similitud espuria: vectores de alta dimensionalidad pueden dar similitudes cosenas altas por coincidencia de textura o color, sin correspondencia semántica. Requiere calibración de umbrales con datos propios.
- Solo se declara `CPUExecutionProvider`; el rendimiento en GPU no está validado ni certificado por el autor.
- Estado de publicación muy reciente (27 de octubre de 2026) con 0 descargas y 0 likes: no hay evidencia de uso en producción ni reportes de terceros.
- El modelo no procesa texto ni audio y no admite instrucciones: cualquier caso de uso conversacional o agéntico queda fuera de alcance.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/EIDORA/VGG16_IN1k
- Coleccion de modelos de imagen de EIDORA: https://huggingface.co/collections/EIDORA/image-models
- Perfil de la organizacion EIDORA en HuggingFace: https://huggingface.co/EIDORA/models
- Organizacion EIDORA: https://eidora.org
- Paper de la arquitectura VGG: https://arxiv.org/abs/1409.1556
- Documentacion del checkpoint base en TorchVision: https://docs.pytorch.org/vision/stable/models/generated/torchvision.models.vgg16.html
- Referencia externa sobre VGG-16: https://www.geeksforgeeks.org/computer-vision/vgg-16-cnn-model/
- Implementacion de terceros en TensorFlow/Keras (no oficial): https://github.com/aashu7547/VGG16_MODEl
- Nota: el sitio https://www.eidora.io/ aparece en los resultados de busqueda como estudio comercial de herramientas de imagen; no se ha podido confirmar que guarde relacion con la organizacion EIDORA de HuggingFace.

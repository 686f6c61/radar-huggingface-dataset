# pictograph/pg-coco-resnet50

## Resumen

PG-COCO-ResNet50 es un clasificador de imágenes de 55 clases construido sobre la arquitectura ResNet-50 y distribuido en formato ONNX. Lo publica Pictograph Research, la división de investigación de la plataforma Pictograph, que ofrece un servicio integrado de anotación, entrenamiento y despliegue de modelos de visión por computador. El modelo no resuelve un problema de generación de lenguaje, sino de clasificación visual de escenas y objetos cotidianos: recibe una imagen de 224x224 píxeles y devuelve una distribución de probabilidad sobre 55 categorías que van desde "skateboarding" o "skiing" hasta "kitchen", "portrait" o "street".

El interés de este modelo es doble. Por un lado, es un ejemplo de modelo pequeño y ligero (el repositorio completo ocupa 0,1 GB) pensado para inferencia en CPU mediante ONNX Runtime, sin necesidad de GPU ni de infraestructura pesada. Por otro, ilustra un caso de licencia restrictiva: el autor declara uso exclusivamente no comercial, porque el conjunto de entrenamiento deriva de COCO, cuyas imágenes proceden de Flickr y en su mayoría (68,9% de train2017) tienen licencia Creative Commons NonCommercial.

Se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, publicado el 3 de noviembre de 2026. No dispone de resultados de benchmarks verificados: las métricas declaradas por el autor aparecen con `verified: false`. Su relevancia práctica es limitada fuera del ecosistema Pictograph, pero resulta útil como referencia para quien busque un clasificador ONNX de escenas con preprocesamiento empaquetado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ResNet-50 (red neuronal convolucional) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada fija de 224x224 píxeles) |
| Tipos de cuantización | no disponible (los pesos se distribuyen en FP32 según la model card) |
| Idiomas soportados | no disponible (modelo de clasificación de imágenes, sin componente textual) |
| Licencia | custom-license (uso exclusivamente no comercial) |
| Formato de pesos | ONNX (`pg-coco-resnet50.onnx`) más `config.json` |
| Tarea | image-classification |
| Número de clases | 55 |
| Tamaño de entrada | 224x224, tensor NCHW float32 |
| Precisión de inferencia | FP32 |
| Tamaño del repositorio | 0,1 GB |
| Librería | onnx |

## Arquitectura y entrenamiento

La arquitectura es una ResNet-50 clásica, una CNN con conexiones residuales organizada en bloques de cuello de botella. El modelo se ha entrenado sobre COCO-CLS-5k, un subconjunto de 5.000 imágenes derivadas de COCO y reetiquetadas en 55 clases de escena y objeto. Según la model card, el entrenamiento se realizó durante 40 épocas con un tamaño de lote de 32, en precisión FP32 y con entradas redimensionadas a 224x224. La versión declarada es la 1.0.0.

No se documenta en la información disponible el número de parámetros concretos, la composición exacta del dataset más allá del recuento de imágenes, ni si se aplicaron técnicas de aumento de datos, regularización o ajuste fino adicional. La innovación técnica destacable no está en la arquitectura (ResNet-50 es un diseño de 2015, sobradamente conocido) sino en el empaquetado: los pesos se distribuyen como ONNX con un `config.json` que codifica el preprocesamiento y el postprocesamiento exactos, de modo que el SDK de Pictograph puede cargar el modelo y aplicar la normalización y la decodificación de clases sin intervención del usuario. El modelo también se ofrece alojado como API y como endpoint desplegable desde la plataforma Pictograph.

## Capacidades

- Clasificación de imágenes en 55 categorías de escena y objeto, con salida ordenada por confianza decreciente.
- Detección de categorías de deporte y ocio: skateboarding, skiing, kitesurfing, surfing, frisbee, soccer, tennis, baseball.
- Detección de animales: bird, giraffe, elephant, bear, zebra, cat, dog, horse, livestock.
- Detección de escenas interiores: bathroom, kitchen, bedroom, living room, office, dining.
- Detección de objetos y contextos urbanos: train, bus, motorcycle, boat, airplane, street, street sign, stop sign, fire hydrant, bench, clock, luggage.
- Detección de categorías gastronómicas: pizza, donut, dessert, meal, vegetables, cake, hot dog, fruit.
- Detección de categorías de personas y retrato: portrait, child, formal wear.
- Categorías misceláneas: teddy bear, vase, electronics, video games, market, beach, vintage photo, other.
- Inferencia en CPU mediante ONNX Runtime, sin requisito de GPU.
- Integración con el SDK de Pictograph (`load_model`, `ClassificationModel.predict`) que devuelve un objeto `ClassificationResult` con la clase principal y la lista completa ordenada.
- No ofrece tool calling, function calling, razonamiento multi-paso, capacidades agénticas, generación de texto, visión generativa ni procesamiento multilingüe. Es un clasificador puro.

## Casos de uso

- Moderación y etiquetado automático de fotografía de consumo: el modelo permite clasificar rápidamente imágenes subidas por usuarios en categorías amplias (playa, retrato, mascota, comida) para organizar galerías o aplicar reglas de negocio, con inferencia en CPU y sin coste de GPU.
- Filtrado previo en pipelines de anotación: al integrarse con la plataforma Pictograph, sirve como primer paso para preetiquetar lotes de imágenes antes de la revisión humana, reduciendo el trabajo manual en proyectos de visión.
- Organización de bibliotecas y archivos multimedia: clasificación de fotos por escena (interior/exterior, deporte, gastronomía) para construir índices de búsqueda o colecciones temáticas.
- Análisis de contenido en aplicaciones de bienestar y deporte: reconocimiento de actividades como skiing, surfing, kitesurfing o skateboarding para etiquetar automáticamente sesiones o publicaciones.
- Prototipado rápido de sistemas de visión: al ser un ONNX de 0,1 GB con preprocesamiento empaquetado, permite validar una idea de clasificación en local con `onnxruntime` en minutos, sin montar un entorno de entrenamiento.
- Demostraciones educativas de inferencia ONNX: útil en cursos y talleres para mostrar el flujo completo de carga de un modelo, preprocesamiento de imagen y decodificación de salidas con una CNN clásica.
- Clasificación de escenas en dispositivos con recursos limitados: dado el tamaño reducido del repositorio y la ejecución en FP32 sobre CPU, encaja en entornos sin acelerador hardware, siempre que se respete la restricción de uso no comercial.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card, evaluados sobre el dataset COCO-CLS-5k. Ninguno de ellos está verificada (`verified: false`).

| Métrica | Valor |
|---|---|
| Accuracy | 0,6944 (69,4%) |
| F1 | 0,5824 (58,2%) |
| Precision | 0,6184 (61,8%) |
| Recall | 0,5817 (58,2%) |

No se han publicado en la información disponible resultados comparativos frente a otros modelos (por ejemplo, ResNet-50 preentrenado en ImageNet o clasificadores basados en transformers visuales) sobre el mismo conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Por el tamaño del repositorio (0,1 GB) y la ejecución en FP32, el modelo es muy ligero y no requiere memoria de GPU dedicada.
- GPU recomendadas: no se especifican. El modelo está pensado para ejecutarse con `CPUExecutionProvider` de ONNX Runtime; cualquier GPU compatible con ONNX Runtime (por ejemplo, A100, H100 o RTX 4090) podría acelerar la inferencia, pero no hay datos de rendimiento al respecto.
- Cabe en GPU de consumo: previsiblemente sí, dado su tamaño, aunque no hay cifras oficiales de VRAM ni de rendimiento que lo confirmen.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), SDK de Pictograph (`pip install "pictograph[inference]"`), API alojada de Pictograph y endpoints desplegables desde la plataforma Pictograph. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que son herramientas orientadas a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables sobre COCO-CLS-5k en la información proporcionada, por lo que la comparación cuantitativa no es posible. A continuación se contrastan únicamente características estructurales conocidas de alternativas de la misma categoría (clasificación de imágenes con CNN/transformer visual), sin cifras de precisión:

| Modelo | Arquitectura | Parámetros | Contexto/entrada | Licencia | Formato |
|---|---|---|---|---|---|
| PG-COCO-ResNet50 | ResNet-50 | no disponible | 224x224 | no comercial | ONNX |
| ResNet-50 (ImageNet, torchvision) | ResNet-50 | ~25,6 M | 224x224 | BSD-3-Clause | PyTorch |
| ViT-B/16 (ImageNet) | Vision Transformer | ~86 M | 224x224 | según checkpoint | PyTorch/safetensors |
| EfficientNet-B0 (ImageNet) | CNN con compound scaling | ~5,3 M | 224x224 | Apache 2.0 (referencia) | PyTorch/ONNX |

Los datos de parámetros de las alternativas corresponden a las variantes estándar publicadas por sus autores; no se dispone de métricas comparables sobre el dataset COCO-CLS-5k. La diferencia principal de PG-COCO-ResNet50 frente a estas alternativas es el conjunto de 55 clases específicas de escenas y objetos y la licencia no comercial, que lo hace menos apto para producción que los checkpoints con licencias permisivas.

## Limitaciones y advertencias

- Licencia restrictiva: la model card declara uso exclusivamente no comercial. Cualquier uso en producto o servicio comercial requiere autorización expresa del autor, que no se documenta.
- Riesgo derivado del dataset: las imágenes de COCO-CLS-5k proceden de Flickr y la mayoría (68,9% de train2017) tienen licencia Creative Commons NonCommercial; el consorcio COCO no posee los derechos de autor de las imágenes. Esto añade incertidumbre jurídica adicional al uso comercial.
- Rendimiento moderado: una accuracy del 69,4% y un F1 del 58,2% sobre 55 clases indican un margen de error considerable, especialmente en clases visualmente próximas (por ejemplo, deportes acuáticos o categorías gastronómicas). Los resultados no están verificados por un tercero.
- Riesgo de alucinación en sentido amplio: el modelo siempre asigna una distribución sobre las 55 clases, incluida la clase "other", por lo que puede forzar etiquetas incorrectas en imágenes fuera de la distribución de entrenamiento. No hay umbral de confianza recomendado documentado.
- Sesgos: no se documenta ningún análisis de sesgos. Al derivarse de COCO, puede heredar sesgos de representación geográfica, demográfica y cultural presentes en las imágenes de Flickr.
- Limitaciones de idioma: el modelo no procesa texto, por lo que las consideraciones lingüísticas no aplican; las etiquetas de clase están en inglés y no se ofrece traducción.
- Limitaciones de contexto: la entrada está fijada a 224x224 píxeles; no hay soporte para imágenes de mayor resolución ni para múltiples imágenes por inferencia.
- Advertencia de producción: con cero descargas y cero likes, el modelo no tiene validación comunitaria. Para uso en producción convendría evaluarlo sobre un conjunto propio antes de adoptarlo.
- Documentación incompleta: no se detallan parámetros totales, composición del dataset, técnicas de aumento de datos ni latencias, lo que dificulta una evaluación técnica completa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pictograph/pg-coco-resnet50
- Página del modelo en Pictograph: https://pictograph.io/models/pictograph-research/pg-coco-resnet50
- Organización Pictograph Research: https://pictograph.io/org/pictograph-research
- Dataset COCO-CLS-5k: https://huggingface.co/datasets/pictograph/coco-cls-5k
- Documentación del SDK de Pictograph: https://pictograph.io/docs
- Guía de inferencia local: https://pictograph.io/docs/local-inference
- Paper de COCO (Lin et al., Microsoft COCO: Common Objects in Context, ECCV 2014): no se proporciona enlace directo en la información disponible; la referencia bibliográfica figura en la model card.

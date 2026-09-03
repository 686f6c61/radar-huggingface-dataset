# AST-1320/vit-age-classifier

## Resumen

El modelo `AST-1320/vit-age-classifier` es un Vision Transformer (ViT) fine-tuneado para clasificar la edad de una persona a partir de una imagen de su rostro. Desarrollado por el usuario AST-1320, se basa en la arquitectura ViT de Google y se ha ajustado sobre el dataset FairFace, que contiene más de 100.000 caras anotadas con rangos de edad, género y etnia. El modelo tiene 85,8 millones de parámetros, lo que corresponde a un ViT-base, y está disponible en formato safetensors.

Este clasificador resuelve un problema concreto de visión por computadora: estimar el grupo de edad de una cara en una imagen. Es relevante porque permite integrar capacidades de análisis demográfico en aplicaciones de moderación de contenido, verificación de edad o estudios de audiencia, con un coste computacional moderado. Aunque no se publican métricas de rendimiento, su arquitectura probada y el uso de un dataset estándar como FairFace lo convierten en una opción razonable para tareas de clasificación de edad en entornos controlados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-base, 12 capas, 12 cabezas, 768 dimensiones ocultas) |
| Parametros totales | 85.805.577 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (entrada de imagen, 224x224 píxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo procesa imágenes, no texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura estándar de Vision Transformer (ViT) de Dosovitskiy et al. (2021). La imagen se divide en parches de 16x16 píxeles, se proyectan linealmente y se procesan mediante un transformer con atención multi-cabeza. La salida de la capa de clasificación se proyecta sobre 9 clases correspondientes a los rangos de edad de FairFace: 0-2, 3-9, 10-19, 20-29, 30-39, 40-49, 50-59, 60-69 y 70+.

El entrenamiento se realizó mediante fine-tuning sobre el dataset `nateraw/fairface`, que contiene imágenes de caras detectadas y anotadas con rangos de edad. No se dispone de información sobre el número de épocas, la tasa de aprendizaje, ni si se aplicaron técnicas de regularización o aumento de datos. Tampoco se indica si se utilizó algún método de alineamiento como RLHF o DPO, algo que no es habitual en modelos de visión. El código de ejemplo proporcionado en la model card sugiere que se usó la API de HuggingFace Transformers con `ViTForImageClassification` y `ViTFeatureExtractor`.

## Capacidades

- Clasificación de edad en 9 rangos discretos (de 0-2 a 70+ años) a partir de una imagen facial.
- Inferencia sobre imágenes de entrada de 224x224 píxeles, con preprocesamiento estándar de ViT (normalización y redimensionado).
- Integración sencilla con el ecosistema HuggingFace Transformers mediante `ViTForImageClassification` y `ViTFeatureExtractor`.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto; es un modelo puramente discriminativo de visión.
- No tiene capacidades multilingües ni de procesamiento de audio o vídeo.

## Casos de uso

- Verificación de edad en plataformas digitales: el modelo puede estimar el rango de edad de un usuario a partir de una foto de su carné o selfie, ayudando a cumplir normativas de protección de menores. Su tamaño reducido permite ejecutarlo en servidores de baja potencia.
- Moderación de contenido en redes sociales: integrarlo en un pipeline de análisis de imágenes para detectar si un perfil pertenece a un menor y aplicar restricciones de contenido. La salida en rangos discretos facilita la toma de decisiones automática.
- Análisis demográfico de audiencias: en entornos de retail o publicidad, se puede usar para clasificar la edad de los clientes a partir de cámaras de vigilancia, generando estadísticas de afluencia por grupo de edad.
- Control de acceso a instalaciones: en gimnasios, centros de ocio o eventos con restricciones de edad, el modelo puede validar la edad estimada de una persona antes de permitir la entrada, aunque siempre debe complementarse con verificación documental.
- Etiquetado automático de fotos personales: aplicaciones de gestión de álbumes pueden usar el clasificador para organizar imágenes por rango de edad de las personas retratadas, facilitando búsquedas y recuerdos.
- Investigación en visión por computadora: como modelo de referencia para comparar técnicas de clasificación de edad, dado que su arquitectura es estándar y el dataset de entrenamiento es público y bien documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de precisión, recall ni F1 sobre conjuntos de validación o test. Tampoco se proporcionan comparaciones con otros clasificadores de edad. Por tanto, no es posible evaluar su rendimiento cuantitativo de forma objetiva.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 85,8 millones de parámetros. En precisión fp32, el peso ocupa aproximadamente 343 MB; en fp16, unos 172 MB. Con la imagen de entrada y las activaciones, el consumo total de VRAM se sitúa en torno a 1-2 GB, dependiendo del batch size.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1050 Ti, RTX 2060 o superiores funcionan sin problemas. También puede ejecutarse en CPU, aunque con mayor latencia (del orden de 100-300 ms por imagen en un procesador moderno).
- Cabe en GPUs de consumo: sí, en prácticamente cualquier GPU de consumo actual, incluidas las integradas de Intel o AMD con suficiente memoria compartida.
- Opciones de despliegue: al ser un modelo de HuggingFace Transformers, se puede servir con `pipeline("image-classification")`, o mediante servidores de inferencia como vLLM (aunque está orientado a texto, soporta modelos de visión), TGI (Text Generation Inference, también con soporte de visión), o simplemente con FastAPI y la librería Transformers. Para despliegue en CPU, se puede convertir a ONNX o usar OpenVINO.
- Latencia y throughput estimados: en una GPU RTX 3090, la inferencia de una sola imagen tarda aproximadamente 5-10 ms. En CPU (8 núcleos), puede rondar los 50-150 ms por imagen. No se dispone de datos oficiales de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AST-1320/vit-age-classifier | 85,8 M | ViT-base | FairFace | no disponible | HuggingFace |
| nateraw/vit-age-classifier | 85,8 M | ViT-base | FairFace | MIT (según repo original) | HuggingFace |
| trpakov/vit-face-expression | 85,8 M | ViT-base | FER2013 | no disponible | HuggingFace |

El modelo `nateraw/vit-age-classifier` es el original del que probablemente deriva este, ya que el código de ejemplo de la model card hace referencia a `nateraw/vit-age-classifier`. Ambos comparten arquitectura y dataset. La diferencia principal es el autor y la licencia, que en este caso no está especificada. No se dispone de comparativas de rendimiento entre ellos.

## Limitaciones y advertencias

- Sesgos conocidos: el dataset FairFace está desbalanceado en ciertos rangos de edad (especialmente los extremos, como 0-2 y 70+), lo que puede provocar una menor precisión en esos grupos. Además, la precisión puede variar según la etnia, el género y las condiciones de iluminación de la imagen.
- Riesgo de alucinación: al ser un modelo discriminativo, no genera texto, por lo que el concepto de alucinación no aplica directamente. Sin embargo, puede producir clasificaciones erróneas con alta confianza, especialmente en imágenes con oclusiones, ángulos inusuales o baja resolución.
- Limitaciones de contexto: el modelo solo acepta imágenes de 224x224 píxeles; imágenes más grandes se redimensionan, lo que puede perder detalles relevantes. No procesa vídeo ni secuencias temporales.
- Restricciones de licencia: la licencia no está especificada en la ficha de HuggingFace. Esto implica incertidumbre legal para uso comercial. Se recomienda contactar al autor o utilizar el modelo original `nateraw/vit-age-classifier` que tiene licencia MIT si se necesita garantía de uso.
- Caveat para producción: no se han publicado métricas de rendimiento, por lo que no se puede garantizar su precisión en entornos reales. Es recomendable evaluar el modelo con un conjunto de validación propio antes de desplegarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AST-1320/vit-age-classifier
- Dataset FairFace: https://huggingface.co/datasets/nateraw/fairface
- Modelo original de referencia: https://huggingface.co/nateraw/vit-age-classifier

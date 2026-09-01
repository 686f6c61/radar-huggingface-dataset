# ananthu-aniraj/ifam-imagenet-k1

## Resumen

iFAM (Inherently Faithful Attention Maps) es un framework de clasificación de imágenes basado en Vision Transformers (ViT) que introduce un enfoque de dos etapas para mejorar la robustez de las representaciones frente a correlaciones espurias y fondos fuera de distribución. El modelo presentado aquí es el checkpoint oficial entrenado en ImageNet-1K con una sola parte (K=1), desarrollado por Ananthu Aniraj y colaboradores, y aceptado como presentación oral en ICPR 2026.

La arquitectura se compone de un selector que procesa la imagen completa para identificar regiones relevantes del objeto, y un predictor que restringe su campo receptivo a esas regiones mediante enmascaramiento de atención de entrada. Este diseño permite que el modelo ignore detalles de fondo irrelevantes, mejorando la generalización y la auditabilidad del razonamiento. Con aproximadamente 173 millones de parámetros, el modelo es ligero y adecuado para despliegue en entornos con recursos limitados.

La relevancia actual radica en su capacidad para abordar un problema crítico en visión por computadora: la dependencia de correlaciones espurias en los conjuntos de datos de entrenamiento. Al ofrecer máscaras semánticas explícitas, iFAM no solo mejora la precisión en escenarios adversos, sino que también permite intervenciones en tiempo de prueba para ajustar el comportamiento del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer de dos etapas (selector + predictor) con enmascaramiento de atención duro, basado en DINOv2 |
| Parametros totales | 172.996.613 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen 224x224 en el ejemplo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue un paradigma de dos etapas. En la primera etapa, un selector procesa la imagen completa y genera máscaras de atención que identifican las partes del objeto y las regiones relevantes para la tarea. En la segunda etapa, un predictor recibe la imagen con un enmascaramiento de entrada basado en esas máscaras, restringiendo su campo receptivo y evitando que los detalles de fondo espurios influyan en la clasificación. Este enfoque se inspira en DINOv2, como indican los tags del repositorio, y utiliza un mecanismo de "hard masking" que fuerza al predictor a operar únicamente sobre las regiones seleccionadas.

El entrenamiento se realizó en el conjunto de datos ImageNet-1K, con una configuración de una sola parte (K=1). No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset o el uso de técnicas como RLHF o DPO, ya que se trata de un modelo de visión supervisado de forma clásica. La innovación principal reside en la arquitectura de dos etapas y el enmascaramiento duro, que hacen que las máscaras semánticas sean explícitas y auditables, permitiendo intervenciones en tiempo de prueba para mejorar la robustez.

## Capacidades

- Clasificación de imágenes en las 1000 clases de ImageNet-1K.
- Robustez mejorada frente a correlaciones espurias y fondos fuera de distribución, gracias al enmascaramiento de atención.
- Generación de máscaras semánticas explícitas que permiten auditar el razonamiento del modelo.
- Soporte de intervenciones en tiempo de prueba: se pueden modificar las máscaras para forzar al modelo a centrarse en regiones específicas.
- Arquitectura modular: el selector y el predictor pueden adaptarse o reentrenarse por separado.
- Compatible con el ecosistema PyTorch y cargable directamente desde Hugging Face Hub.

## Casos de uso

- Clasificación de imágenes en entornos con fondos variables: el modelo ignora el contexto irrelevante, lo que lo hace adecuado para aplicaciones de visión industrial donde el fondo puede cambiar (por ejemplo, inspección de piezas en diferentes cintas transportadoras).
- Análisis de imágenes médicas: al centrarse en regiones anatómicas relevantes, puede ayudar en la detección de anomalías en radiografías o tomografías, reduciendo falsos positivos causados por artefactos de fondo.
- Moderación de contenido visual: la capacidad de generar máscaras de atención permite explicar por qué una imagen fue clasificada como inapropiada, facilitando la revisión humana.
- Sistemas de recomendación visual: para clasificar productos en catálogos con fondos diversos, mejorando la precisión en entornos de comercio electrónico.
- Robótica y navegación autónoma: el modelo puede identificar objetos relevantes en escenas complejas, ignorando elementos distractores del entorno.
- Investigación en interpretabilidad: las máscaras explícitas sirven como herramienta para estudiar qué regiones de la imagen influyen en la decisión, útil en auditorías de modelos y desarrollo de sistemas explicables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper asociado (arXiv:2506.08915) menciona mejoras en robustez frente a correlaciones espurias y fondos fuera de distribución, pero no se proporcionan cifras concretas en la model card ni en los resultados de búsqueda web. Se recomienda consultar el artículo para obtener métricas detalladas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 173M de parámetros, en FP32 el modelo ocupa aproximadamente 692 MB, y en FP16 unos 346 MB. Esto permite ejecutarlo en GPUs con 4 GB de VRAM o menos.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 2060, RTX 3060, o superiores. También puede ejecutarse en CPU para inferencia puntual, aunque con mayor latencia.
- Compatibilidad con GPUs de consumo: sí, cabe en la mayoría de las GPUs de consumo actuales.
- Opciones de despliegue: al ser un modelo PyTorch estándar, puede servirse con TorchServe, FastAPI, o integrarse en pipelines de ONNX Runtime. No se han reportado integraciones específicas con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se dispone de datos medidos. En una GPU moderna (por ejemplo, RTX 3090), se espera una latencia de decenas de milisegundos por imagen, pero esto depende de la implementación y el tamaño de lote.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Robustez | Licencia |
|---|---|---|---|---|
| iFAM (imagenet-k1) | 173M | Dos etapas con enmascaramiento duro | Alta frente a correlaciones espurias | Apache 2.0 |
| DINOv2 (ViT-S) | 22M | Autosupervisado, sin enmascaramiento explícito | Media, depende del fine-tuning | Apache 2.0 |
| CLIP (ViT-B/32) | 151M | Contrastivo imagen-texto | Media, sensible a distribución | MIT |
| ViT-B/16 (ImageNet) | 86M | Transformer estándar | Baja, susceptible a fondos | Apache 2.0 |

La comparativa se basa en características generales conocidas; no se dispone de resultados de benchmarks idénticos para todos los modelos. iFAM se distingue por su mecanismo de enmascaramiento explícito, que no está presente en los otros.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente en ImageNet-1K, por lo que su rendimiento en dominios muy diferentes (por ejemplo, imágenes médicas especializadas o imágenes de satélite) puede degradarse sin fine-tuning.
- Las máscaras de atención generadas por el selector pueden fallar en objetos muy pequeños o altamente ocluidos, lo que afectaría la clasificación.
- No se han evaluado sesgos demográficos o culturales específicos; como cualquier modelo entrenado en ImageNet, puede heredar sesgos presentes en ese conjunto de datos.
- Aunque la licencia Apache 2.0 permite uso comercial, es necesario verificar que el uso previsto cumpla con las políticas de la organización y las regulaciones aplicables.
- El modelo no soporta tareas de generación de texto ni procesamiento de lenguaje natural; es exclusivamente para clasificación de imágenes.
- No se han publicado resultados de cuantización; el uso de formatos como ONNX o TensorRT requeriría validación adicional.

## Enlaces

- [Hugging Face - ananthu-aniraj/ifam-imagenet-k1](https://huggingface.co/ananthu-aniraj/ifam-imagenet-k1)
- [Paper en arXiv (2506.08915)](https://arxiv.org/abs/2506.08915)
- [Repositorio GitHub - ananthu-aniraj/ifam](https://github.com/ananthu-aniraj/ifam)
- [Página personal del autor](https://ananthu-aniraj.github.io/)
- [Checkpoint iFAM waterbirds-k4 en Hugging Face](https://huggingface.co/ananthu-aniraj/ifam-waterbirds-k4)

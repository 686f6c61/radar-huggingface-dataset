# padam5699/pets-convnext-sagemaker

## Resumen

`padam5699/pets-convnext-sagemaker` es un modelo de clasificación de imágenes especializado en razas de perros y gatos, desarrollado por el usuario padam5699 como demostración de un trabajo de entrenamiento distribuido en Amazon SageMaker para una asignatura de Computación Distribuida. Se trata de un fine-tuning del modelo `facebook/convnext-tiny-224`, una red ConvNeXt de tipo "tiny" con 27,8 millones de parámetros, ajustada sobre el dataset Oxford-IIIT Pet (7.349 imágenes, 37 clases) durante 5 épocas.

El modelo resuelve una tarea muy acotada: dada una imagen de un perro o un gato, predecir su raza entre 37 categorías posibles (12 de gatos y 25 de perros). No es un modelo de propósito general ni un modelo de lenguaje: es un clasificador de visión puro, exportado también a ONNX y preparado para su uso con Transformers.js y despliegue en endpoints compatibles.

Su relevancia es fundamentalmente didáctica y práctica para pipelines de visión: demuestra un flujo completo de entrenamiento gestionado en SageMaker (job `pets-pytorch-2026-11-04-18-14-24-975`, 204 segundos facturables en una instancia `ml.g6.xlarge`), con un resultado de 93,0% de accuracy en validación. Al estar publicado bajo CC BY-SA 4.0 y con pesos en safetensors y ONNX, es fácilmente reproducible y desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt (variante tiny, `facebook/convnext-tiny-224`) |
| Parametros totales | 27.848.581 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224x224 px) |
| Tipos de cuantizacion | no disponible (el autor indica `base_model:quantized:facebook/convnext-tiny-224` en los tags, pero no se detalla el esquema) |
| Idiomas soportados | no disponible (no procesa texto; las etiquetas de clase están en inglés) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

El modelo se basa en ConvNeXt, una red neuronal convolucional moderna que adopta decisiones de diseño propias de los transformers (parches no solapados, depthwise convolutions de 7x7, normalización LayerNorm, activación GELU y menos capas de normalización por bloque). La variante "tiny" opera sobre imágenes de 224x224 píxeles y constituye la cabeza de clasificación ajustada en este repositorio.

El fine-tuning se realizó sobre el dataset Oxford-IIIT Pet (Parkhi et al., CVPR 2012), con un split estratificado 80/20 de las 7.349 imágenes, durante 5 épocas, mediante un SageMaker training job en una instancia `ml.g6.xlarge` (204 segundos facturables). No se documentan en la información disponible detalles sobre la función de pérdida, el optimizador, la tasa de aprendizaje, el uso de aumentación de datos ni si hubo alguna fase de ajuste adicional. Tampoco se especifica si se aplicó destilación, recorte de pesos o alguna innovación técnica más allá del propio fine-tuning supervisado.

## Capacidades

- Clasificación de imágenes en 37 razas de perro y gato (12 felinas y 25 caninas).
- Predicción de una única etiqueta por imagen (clasificación multiclase cerrada).
- Inferencia vía `transformers.pipeline("image-classification", ...)`.
- Exportación a ONNX para ejecución en entornos sin PyTorch.
- Compatibilidad con Transformers.js para inferencia en el navegador.
- Despliegue en endpoints compatibles con SageMaker (`endpoints_compatible`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades multilingües ni de visión general más allá de la clasificación de razas.

## Casos de uso

- **Clasificación automática en refugios y clínicas veterinarias**: el modelo permite etiquetar fotografías de animales entrantes con una de las 37 razas soportadas, agilizando el registro y la ficha del animal con un 93,0% de accuracy en validación.
- **Organización de fototecas y aplicaciones de mascotas**: integrable en un pipeline de subida de imágenes para etiquetar automáticamente fotos por raza y facilitar búsquedas y filtros en una app de consumo.
- **Demostración educativa de MLOps en SageMaker**: sirve como ejemplo reproducible de un flujo completo de entrenamiento gestionado (job, instancia, tiempo facturable, artefacto exportado) para cursos de computación distribuida o cloud.
- **Prototipado rápido con Transformers.js**: al estar exportado a ONNX, puede ejecutarse en el navegador para demos interactivas de clasificación de mascotas sin backend.
- **Generación de datasets etiquetados**: uso como etiquetador automático para pre-anotar grandes volúmenes de imágenes de perros y gatos antes de una revisión humana.
- **Módulo de visión en pipelines de moderación o contenido**: como componente de un sistema mayor que necesite identificar si una imagen contiene un perro o un gato y de qué raza, con bajo coste computacional (27,8M de parámetros).
- **Benchmark de referencia para fine-tuning de ConvNeXt**: útil como baseline para comparar estrategias de ajuste sobre Oxford-IIIT Pet en entornos cloud.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Validation accuracy (Oxford-IIIT Pet, split 80/20) | 93,0% |
| Epocas de entrenamiento | 5 |
| Instancia de entrenamiento | ml.g6.xlarge |
| Tiempo facturable | 204 segundos |

No se han publicado en la información disponible resultados de benchmarks adicionales (por ejemplo, precisión por clase, F1, matriz de confusión) ni comparaciones con otros modelos.

## Requisitos de hardware

- **VRAM estimada para inferencia**: al tratarse de un modelo de 27,8M de parámetros, los pesos en fp32 ocupan aproximadamente 111 MB; en fp16, unos 56 MB. La VRAM real necesaria para inferencia es muy inferior a 1 GB en cualquier GPU moderna.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM es suficiente; se puede ejecutar en T4, L4, RTX 3060, RTX 4090, A10G, A100 o H100 sin problema.
- **Consumer GPU**: sí, cabe holgadamente en cualquier GPU de consumo de los últimos años e incluso en CPU para inferencia por lotes pequeños.
- **Opciones de despliegue**: `transformers` pipeline, ONNX Runtime, Transformers.js, SageMaker endpoints (el autor lo preparó para ello) y, presumiblemente, vLLM no aplica (no es un modelo generativo); llama.cpp y Ollama tampoco son adecuados para este tipo de modelo.
- **Latencia y throughput**: no se han publicado datos concretos. Dado el tamaño y la resolución de entrada (224x224), se espera una latencia de milisegundos por imagen en GPU y de decenas de milisegundos en CPU, aunque no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Accuracy reportada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `padam5699/pets-convnext-sagemaker` | 27,8M | Clasificación 37 razas | 93,0% (validación) | CC BY-SA 4.0 | HuggingFace |
| `facebook/convnext-tiny-224` (base) | 28,6M | Clasificación ImageNet-1k | no disponible en esta ficha | CC BY-NC 4.0 (según el modelo original) | HuggingFace |
| `timm/convnext_tiny.fb_in22k_ft_in1k` | ~28M | Clasificación ImageNet | no disponible en esta ficha | Apache 2.0 (según timm) | HuggingFace / timm |

La comparación directa con alternativas específicas para Oxford-IIIT Pet no está disponible en la información proporcionada. El modelo base `facebook/convnext-tiny-224` es el punto de referencia natural, pero no se han publicado en esta ficha sus métricas sobre este dataset concreto.

## Limitaciones y advertencias

- **Alcance cerrado**: solo clasifica entre 37 razas concretas; cualquier otra raza o especie será asignada a una de las clases existentes, generando predicciones incorrectas.
- **Riesgo de alucinación de etiqueta**: al ser un clasificador cerrado, siempre devuelve una de las 37 clases con una probabilidad, aunque la imagen no corresponda a ninguna de ellas.
- **Sesgos del dataset**: Oxford-IIIT Pet tiene una distribución concreta de imágenes, principalmente de razas comunes en el Reino Unido; el rendimiento puede degradarse en imágenes de otras regiones, condiciones de iluminación o razas poco representadas.
- **Sesgo de raza y morfología**: razas visualmente similares (por ejemplo, terriers o bóxers frente a bulldogs) pueden confundirse con más frecuencia; no se han publicado métricas por clase.
- **Licencia CC BY-SA 4.0**: permite uso comercial, pero obliga a compartir las obras derivadas bajo la misma licencia y a atribuir al autor; conviene revisar las implicaciones si se integra en un producto propietario.
- **Idioma de las etiquetas**: las clases están en inglés; si se necesita salida en castellano, hay que mapear las etiquetas manualmente.
- **Documentación escasa**: no se detallan hiperparámetros, preprocesado ni esquema de cuantización, lo que dificulta la reproducibilidad exacta.
- **Uso previsto didáctico**: el autor lo publica como demo de clase; no hay evidencia de validación en producción ni de robustez frente a imágenes del mundo real.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/padam5699/pets-convnext-sagemaker)
- [Modelo base facebook/convnext-tiny-224](https://huggingface.co/facebook/convnext-tiny-224)
- [Dataset Oxford-IIIT Pet (página oficial)](https://www.robots.ox.ac.uk/~vgg/data/pets/)
- [Dataset timm/oxford-iiit-pet en HuggingFace](https://huggingface.co/datasets/timm/oxford-iiit-pet)
- [Paper Cats and Dogs (Parkhi et al., CVPR 2012)](https://www.robots.ox.ac.uk/~vgg/publications/2012/parkhi12a/parkhi12a.pdf)

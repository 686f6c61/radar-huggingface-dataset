# bmkzl/sam-vit-base

## Resumen

SAM ViT-B (Segment Anything Model, variante ViT-Base) es un modelo de segmentación de imágenes desarrollado originalmente por Meta AI (Facebook Research) y publicado en el paper "Segment Anything" (arXiv:2304.02643). Este repositorio concreto, `bmkzl/sam-vit-base`, es una réplica de los pesos oficiales subida por un usuario independiente, con licencia Apache 2.0 y formato safetensors, pensada para su uso con la librería Transformers de Hugging Face. El modelo resuelve el problema de la segmentación de objetos *promptable*: dado un punto, una caja delimitadora o una máscara de entrada, genera máscaras de alta calidad del objeto correspondiente, y también puede generar máscaras de todos los objetos de una imagen de forma automática.

La arquitectura combina un codificador de visión basado en Vision Transformer (ViT-B), un codificador de prompts y un decodificador de máscaras con atención cruzada bidireccional. Con 93,7 millones de parámetros, es la variante más ligera de la familia SAM original (frente a ViT-L y ViT-H), lo que la hace adecuada para entornos con recursos limitados. Su relevancia actual radica en que sigue siendo una referencia para tareas de segmentación zero-shot y como base para pipelines de anotación automática, edición de imágenes y visión por computador en producción.

El modelo fue entrenado sobre el dataset SA-1B, con 11 millones de imágenes y 1.100 millones de máscaras, y demuestra un rendimiento zero-shot competitivo con métodos supervisados en diversas tareas de segmentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT-B) + PromptEncoder + MaskDecoder (transformer bidireccional) |
| Parametros totales | 93.735.728 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen redimensionada a 1024x1024 píxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, PyTorch, TensorFlow |

## Arquitectura y entrenamiento

SAM se compone de tres módulos: un `VisionEncoder` basado en ViT que calcula embeddings de la imagen mediante atención sobre parches y utiliza embeddings posicionales relativos; un `PromptEncoder` que genera embeddings para puntos y cajas delimitadoras; y un `MaskDecoder`, un transformer bidireccional que aplica atención cruzada entre los embeddings de imagen y de prompt, seguido de un `Neck` que predice las máscaras finales. El modelo es *promptable* por diseño: acepta puntos 2D, cajas delimitadoras o máscaras como entrada, pero no texto (según el repositorio oficial).

El entrenamiento se realizó sobre SA-1B, un dataset de 11 millones de imágenes con licencia y respeto a la privacidad, y más de 1.100 millones de máscaras, construido mediante un bucle de recolección de datos asistido por el propio modelo. No se dispone de información en la documentación proporcionada sobre el número exacto de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables típicamente a segmentación). La innovación principal es la capacidad de transferencia zero-shot a nuevas distribuciones de imágenes y tareas de segmentación.

## Capacidades

- Generación de máscaras de objetos a partir de prompts de punto (coordenadas 2D).
- Generación de máscaras a partir de cajas delimitadoras (bounding boxes).
- Generación de máscaras a partir de máscaras de entrada (refinamiento).
- Generación automática de máscaras para todos los objetos de una imagen mediante una rejilla de 1024 puntos.
- Segmentación zero-shot en dominios y tareas no vistas durante el entrenamiento.
- Salida de múltiples máscaras candidatas con puntuaciones de confianza (IoU scores).
- No soporta tool calling, function calling ni razonamiento multi-paso (no es un modelo de lenguaje).
- No soporta texto como prompt según el repositorio oficial.
- No dispone de capacidades multilingües, de audio ni de modo "thinking".

## Casos de uso

- Anotación automática de datasets de segmentación: el modelo puede generar máscaras para todos los objetos de una imagen con la pipeline `mask-generation`, reduciendo drásticamente el coste de etiquetado manual en proyectos de visión por computador.
- Edición de imágenes y retoque fotográfico: dado un punto sobre un objeto, se obtiene una máscara precisa que puede usarse para recortar, sustituir fondos o aplicar efectos localizados en herramientas de edición.
- Segmentación interactiva en aplicaciones médicas o de teledetección: con prompts de punto o caja, el modelo aísla regiones de interés (órganos, cultivos, edificios) sin reentrenamiento, gracias a su capacidad zero-shot.
- Preprocesado en pipelines de robótica y conducción autónoma: generación de máscaras de objetos relevantes (peatones, vehículos, obstáculos) para tareas de percepción, usando cajas detectadas por otro modelo como prompt.
- Investigación en visión por computador: evaluación de técnicas de segmentación promptable y como baseline para comparar nuevos métodos, dado su bajo coste computacional (93,7 M de parámetros).
- Herramientas de accesibilidad y análisis de imágenes: extracción automática de regiones para descripción de escenas o generación de recortes que alimenten modelos de captioning.
- Integración en aplicaciones web o móviles con recursos limitados: al ser la variante ViT-B, es la más ligera de la familia SAM y puede ejecutarse en GPU de consumo, lo que facilita su despliegue en entornos con presupuesto de VRAM reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño del modelo (93,7 M de parámetros) y la resolución de entrada (1024x1024), se estima un consumo moderado, apto para GPU de consumo, aunque no se proporcionan cifras concretas.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría en RTX 3060/4060 o superiores, pero no se confirma.
- ¿Cabe en consumer GPU? Probablemente sí, al ser la variante más pequeña de SAM, pero no se dispone de confirmación oficial en la documentación.
- Opciones de despliegue: Transformers (PyTorch y TensorFlow), pipeline `mask-generation` de Hugging Face. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| SAM ViT-B (este) | 93,7 M | Imagen 1024x1024, prompts de punto/caja/máscara | Apache 2.0 | Hugging Face (réplica de usuario) |
| SAM ViT-L | no disponible en la información | Imagen 1024x1024 | Apache 2.0 | Repositorio oficial de Meta |
| SAM ViT-H | no disponible en la información | Imagen 1024x1024 | Apache 2.0 | Repositorio oficial de Meta |
| SAM 2 | no disponible en la información | Imagen y vídeo | no disponible | Repositorio oficial de Meta |

No se dispone de datos de rendimiento comparativo en la información proporcionada. Las variantes ViT-L y ViT-H de SAM ofrecen mayor capacidad a costa de más parámetros y VRAM; SAM 2 amplía capacidades a vídeo, pero no se detallan especificaciones en la documentación disponible.

## Limitaciones y advertencias

- No acepta texto como prompt; solo puntos, cajas y máscaras.
- No es un modelo de lenguaje: no genera texto, no razona ni soporta tool calling.
- Riesgo de máscaras imprecisas en objetos muy pequeños, oclusiones severas o imágenes de baja resolución.
- Rendimiento zero-shot puede degradarse en dominios muy alejados de la distribución de SA-1B (por ejemplo, imágenes médicas especializadas).
- Este repositorio es una réplica subida por un usuario independiente (`bmkzl`), no el repositorio oficial de Meta; conviene verificar la integridad de los pesos antes de usarlos en producción.
- Aunque la licencia es Apache 2.0, se recomienda revisar los términos del proyecto original Segment Anything para usos comerciales concretos.
- Sin datos publicados de sesgos específicos ni de evaluación en idiomas (no aplica).
- Fecha de creación del repositorio inusualmente futura (2026-10-29) según los metadatos, lo que puede indicar un artefacto de la plataforma; no afecta al contenido técnico pero conviene tenerlo en cuenta.

## Enlaces

- [Hugging Face: bmkzl/sam-vit-base](https://huggingface.co/bmkzl/sam-vit-base)
- [Repositorio oficial de Segment Anything (Meta)](https://github.com/facebookresearch/segment-anything)
- [Paper: Segment Anything (arXiv:2304.02643)](https://arxiv.org/abs/2304.02643)
- [Dataset SA-1B](https://segment-anything.com/dataset/index.html)
- [Sitio oficial del proyecto](https://segment-anything.com)
- [Modelo oficial en Hugging Face: facebook/sam-vit-base](https://huggingface.co/facebook/sam-vit-base)

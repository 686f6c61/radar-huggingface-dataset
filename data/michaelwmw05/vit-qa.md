# michaelwmw05/vit-qa

## Resumen

Este repositorio aloja una implementación de referencia del modelo **QA-ViT** (Question Aware Vision Transformer), un vision transformer que integra la información de la pregunta directamente en el codificador visual para tareas de razonamiento multimodal. El autor, michaelwmw05, publica únicamente un archivo `inference.py` que implementa la arquitectura descrita en la model card, basada en el trabajo de Amazon Science (arXiv:2402.05472). El modelo condiciona las características visuales al contexto de la pregunta mediante mecanismos de co-atención y atención lineal, lo que permite una extracción dinámica de características más relevantes para la consulta.

A diferencia del modelo original de Amazon, esta implementación no incluye pesos entrenados ni documentación de uso. Se trata de un esqueleto de inferencia con una arquitectura descrita como "giant" (escala gigante), pero sin especificar el número de parámetros, la longitud de contexto ni los idiomas soportados. Su relevancia actual radica en ser una referencia de código para quienes quieran explorar la arquitectura QA-ViT, aunque su utilidad práctica en producción es limitada sin pesos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mae (Masked Autoencoder) con atención lineal y co-attention |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se proporcionan pesos) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (solo contiene `inference.py`) |

## Arquitectura y entrenamiento

La arquitectura declarada en la model card es **mae** (Masked Autoencoder) con **atención lineal** en lugar de la atención softmax estándar, y una estrategia de **fusión por co-atención** para combinar las representaciones visuales y textuales. La activación utilizada es **swish**, la normalización es **groupnorm** y la inicialización es **xavier**. El optimizador de entrenamiento es **LAMB** con un programador de tasa de aprendizaje **OneCycle**.

Esta configuración coincide con el enfoque del paper original de QA-ViT, donde se inyectan los embeddings de la pregunta en las capas superiores del vision transformer mediante MLPs y proyecciones residuales con compuerta. El modelo se entrena para tareas de **matching** (emparejamiento) multimodal, lo que implica aprender a alinear imágenes con descripciones o preguntas textuales. Sin embargo, no se proporciona información sobre el dataset de entrenamiento, el número de tokens ni si se aplicó RLHF o DPO.

## Capacidades

- **Razonamiento multimodal**: condiciona las características visuales a la pregunta, mejorando la relevancia de las regiones de imagen atendidas.
- **Matching visual-textual**: diseñado para tareas de emparejamiento entre imágenes y texto (por ejemplo, respuesta a preguntas visuales, captioning).
- **Atención lineal**: reduce la complejidad computacional respecto a la atención cuadrática, permitiendo procesar secuencias más largas con menor coste.
- **Co-atención**: integra información de ambos módulos (visual y textual) en una sola pasada, mejorando la interacción entre modalidades.
- **Sin pesos publicados**: el repositorio solo contiene el script de inferencia, no los pesos entrenados, por lo que no se puede ejecutar directamente.

## Casos de uso

- **Investigación en arquitecturas multimodales**: el código sirve como referencia para estudiar la implementación de co-atención y atención lineal en vision transformers, especialmente para quienes quieran reproducir o extender QA-ViT.
- **Prototipado de sistemas de preguntas y respuestas visuales (VQA)**: se puede adaptar el script para cargar pesos entrenados (si se obtienen del autor) y construir un sistema de respuesta a preguntas sobre imágenes.
- **Análisis de atención visual**: al condicionar las características a la pregunta, se puede usar para generar mapas de atención que indiquen qué regiones de la imagen son relevantes para una consulta dada.
- **Benchmarking de modelos multimodales**: permite comparar el rendimiento de la arquitectura QA-ViT con otros vision transformers en tareas de matching.
- **Educación y aprendizaje**: el código sirve como ejemplo didáctico de cómo implementar un transformer multimodal con atención lineal y co-atención en PyTorch.
- **Desarrollo de sistemas de búsqueda visual**: la capacidad de matching imagen-texto puede aplicarse a la búsqueda de imágenes por descripción textual, aunque requiere pesos entrenados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de rendimiento, y el repositorio solo contiene un script de inferencia sin pesos entrenados. No se puede evaluar el modelo en tareas como VQA, captioning o scene-text sin los pesos correspondientes.

## Requisitos de hardware

- **VRAM estimada**: no disponible, ya que no se publican los pesos ni el número de parámetros.
- **GPU recomendadas**: no disponible.
- **Compatibilidad con GPU de consumo**: no determinable sin conocer el tamaño real del modelo.
- **Opciones de despliegue**: el archivo `inference.py` sugiere un flujo de inferencia, pero sin pesos no es ejecutable. Si se obtuvieran pesos, se podría desplegar con frameworks estándar (PyTorch, vLLM, etc.).
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No se puede realizar una comparativa directa porque no hay datos de parámetros ni de rendimiento. Como referencia conceptual, QA-ViT se compara con otros vision transformers multimodales como **ViLT**, **VisualBERT** y **ViLBERT**, pero no se dispone de resultados numéricos para este modelo concreto.

| Modelo | Arquitectura | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|---|
| QA-ViT (este repo) | MAE + co-attention | no disponible | no disponible | no disponible | MIT |
| ViLT | Transformer conjunto | 87M | 512 | VQA: 71.5 (VQAv2) | MIT |
| VisualBERT | Transformer con co-atención | 112M | 512 | VQA: 70.8 | MIT |

*Datos de los modelos alternativos basados en publicaciones conocidas; no se han medido en este repo.*

## Limitaciones y advertencias

- **Sin pesos entrenados**: el repositorio solo contiene un script de inferencia vacío, no es utilizable para ninguna tarea real sin entrenar o descargar pesos externos.
- **Información técnica incompleta**: no se especifican parámetros, contexto, dataset de entrenamiento ni métricas de rendimiento.
- **Posibles errores en la implementación**: al ser un repositorio de un solo archivo sin tests ni documentación, puede contener bugs o no funcionar directamente.
- **Riesgo de alucinación**: al no haber pesos, no aplica, pero si se entrenara con datos limitados, el modelo podría presentar sesgos de los datos.
- **Licencia MIT**: permite uso comercial, pero al no haber pesos, no hay un modelo que se pueda usar en producción.
- **Origen del código**: no se indica si la implementación es oficial o una reimplementación de un tercero; puede haber divergencias con el paper original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/michaelwmw05/vit-qa
- Paper original: Question Aware Vision Transformer for Multimodal Reasoning (arXiv:2402.05472)
- GitHub oficial de Amazon Science: https://github.com/amazon-science/QA-ViT
- Análisis en Emergent Mind: https://www.emergentmind.com/topics/question-aware-vision-transformer-qa-vit

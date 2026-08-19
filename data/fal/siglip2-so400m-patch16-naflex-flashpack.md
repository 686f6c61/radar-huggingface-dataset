# fal/SigLIP2-SO400M-Patch16-NaFlex-FlashPack

## Resumen

SigLIP 2 So400m Patch16 NaFlex es un modelo de visión-lenguaje desarrollado por Google, presentado en el paper "SigLIP 2: Multilingual Vision-Language Encoders with Improved Semantic Understanding, Localization, and Dense Features" (Tschannen et al., 2025). Extiende el objetivo de preentrenamiento de SigLIP con técnicas adicionales como pérdida de decodificador, predicción global-local y enmascarada, y adaptabilidad de aspecto y resolución, lo que mejora la comprensión semántica, la localización y las características densas. El modelo está diseñado para tareas de clasificación de imágenes zero-shot, recuperación imagen-texto y como encoder visual para modelos de lenguaje multimodales (VLMs). Con aproximadamente 1.135 millones de parámetros (según datos de Mixpeek), es un modelo de tamaño considerable dentro de la familia SigLIP, aunque su nombre "so400m" hace referencia a la clase de tamaño de la torre visual. Está disponible bajo licencia Apache 2.0 y se integra con la librería Transformers de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP 2 (transformer de visión con parches de 16x16, variante NaFlex para aspecto y resolución adaptables) |
| Parametros totales | 1.135.670.962 (según Mixpeek) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el paper indica capacidades multilingües, pero no se especifican idiomas concretos) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SigLIP 2 se basa en la arquitectura SigLIP, que utiliza una pérdida contrastiva sigmoide por pares en lugar de softmax, lo que permite un entrenamiento más eficiente. La variante So400m emplea una torre visual de clase 400M con parches de 16x16, y la opción NaFlex permite procesar imágenes con relaciones de aspecto nativas y longitudes de secuencia variables. Sobre esta base, SigLIP 2 añade tres objetivos de entrenamiento adicionales: pérdida de decodificador (para mejorar la representación de características), pérdida global-local y de predicción enmascarada (para mejorar la localización y las características densas), y adaptabilidad de aspecto y resolución (para manejar imágenes de diferentes proporciones). El modelo se preentrenó en el dataset WebLI (Chen et al., 2023) utilizando hasta 2048 chips TPU-v5e. No se menciona el uso de RLHF o DPO; el entrenamiento es puramente contrastivo y supervisado.

## Capacidades

- Clasificación de imágenes zero-shot: asigna etiquetas a imágenes sin necesidad de entrenamiento específico, usando texto como entrada.
- Recuperación imagen-texto: encuentra imágenes relevantes a partir de consultas textuales y viceversa.
- Encoder visual para VLMs: puede usarse como torre de visión en modelos multimodales que generan texto a partir de imágenes.
- Localización y características densas: gracias a los objetivos de entrenamiento adicionales, produce mapas de características útiles para detección y segmentación.
- Adaptabilidad de aspecto y resolución: procesa imágenes con proporciones nativas sin necesidad de redimensionar a un cuadrado fijo.
- Capacidades multilingües: aunque no se detallan los idiomas, el paper indica que el modelo es multilingüe.

## Casos de uso

- Clasificación de imágenes en producción: el modelo puede etiquetar imágenes de catálogos o galerías sin entrenamiento previo, usando etiquetas textuales definidas por el usuario. Es adecuado por su capacidad zero-shot y su licencia permisiva.
- Búsqueda multimodal en bases de datos: permite consultar imágenes por texto (por ejemplo, "foto de un atardecer en la playa") en sistemas de gestión de activos digitales, gracias a su capacidad de recuperación imagen-texto.
- Encoder para un VLM de generación de descripciones: se puede integrar como torre de visión en un modelo como LLaVA o BLIP para generar descripciones automáticas de imágenes, aprovechando sus características densas y su adaptabilidad de aspecto.
- Moderación de contenido visual: clasifica imágenes en categorías como violencia, desnudos o spam, usando etiquetas personalizadas y sin necesidad de datos etiquetados específicos.
- Análisis de imágenes médicas (con adaptación): aunque no está especializado, puede usarse como encoder para extraer características de radiografías o histologías, siempre que se ajuste con un cabezal de clasificación específico.
- Sistemas de recomendación visual: en plataformas de comercio electrónico, puede emparejar imágenes de productos con descripciones textuales para mejorar la búsqueda y recomendación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de Hugging Face incluye una tabla de evaluación extraída del paper, pero los valores numéricos no se proporcionan en el texto. Se recomienda consultar el paper original (arXiv:2502.14786) para obtener métricas detalladas de rendimiento en tareas como clasificación zero-shot, recuperación y localización.

## Requisitos de hardware

- No se dispone de requisitos oficiales de hardware en la información proporcionada.
- Dado el tamaño de aproximadamente 1.135 millones de parámetros, se estima que la inferencia en FP16 requiere al menos 4 GB de VRAM, aunque esta cifra es una estimación orientativa y no un dato oficial.
- Para un despliegue eficiente, se recomienda una GPU con al menos 8 GB de VRAM (por ejemplo, NVIDIA RTX 3070 o superior) si se usa FP16, o cuantización a 8 bits para reducir requisitos.
- El modelo se puede ejecutar con la librería Transformers de Hugging Face, que soporta inferencia en CPU y GPU. No se mencionan opciones específicas como vLLM u Ollama, pero al ser un modelo de visión, el uso típico es mediante la API de Transformers o pipelines de clasificación zero-shot.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SigLIP 2 So400m (este) | ~1.135M | no disponible | Apache 2.0 | Hugging Face |
| SigLIP So400m (original) | ~400M (clase) | no disponible | Apache 2.0 | Hugging Face |
| CLIP ViT-L/14 | ~428M | 77 tokens de texto | MIT | Hugging Face |

La comparativa se basa en datos públicos de los modelos. SigLIP 2 es una evolución de SigLIP con mejoras en localización y características densas, mientras que CLIP es un modelo más antiguo con una arquitectura similar pero sin los objetivos adicionales de entrenamiento. No se dispone de datos de rendimiento comparativos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos en los datos de entrenamiento: al preentrenarse en WebLI, el modelo puede heredar sesgos presentes en las imágenes y textos de ese dataset, lo que puede afectar a la clasificación en dominios específicos.
- Riesgo de alucinación: al ser un modelo de visión, no genera texto directamente, pero si se usa como encoder en un VLM, el VLM podría generar descripciones inexactas basadas en las características extraídas.
- Limitaciones de resolución: aunque NaFlex permite adaptabilidad de aspecto, la resolución máxima está limitada por el tamaño de parche (16x16) y la memoria disponible; imágenes muy grandes pueden requerir recorte o redimensionado.
- Idiomas no especificados: aunque el modelo es multilingüe, no se detallan los idiomas soportados, lo que puede dificultar su uso en aplicaciones que requieran idiomas específicos.
- Licencia Apache 2.0: permite uso comercial, pero se debe incluir la atribución correspondiente y no se ofrece garantía sobre el rendimiento en casos de uso concretos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/google/siglip2-so400m-patch16-naflex
- Paper SigLIP 2: https://arxiv.org/abs/2502.14786
- Paper SigLIP original: https://arxiv.org/abs/2303.15343
- Paper WebLI: https://arxiv.org/abs/2209.06794
- Repo alternativo (FlashPack): https://huggingface.co/fal/SigLIP2-SO400M-Patch16-NaFlex-FlashPack

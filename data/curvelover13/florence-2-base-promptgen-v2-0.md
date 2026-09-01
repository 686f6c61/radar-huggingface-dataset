# Curvelover13/Florence-2-base-PromptGen-v2.0

## Resumen

Florence-2-base-PromptGen-v2.0 es un modelo de generación de captions y etiquetas para imágenes, desarrollado originalmente por MiaoshouAI y distribuido también en este repositorio por Curvelover13. Se basa en el modelo Florence-2-base de Microsoft, un modelo de visión-lenguaje de tipo encoder-decoder con aproximadamente 270 millones de parámetros, y ha sido fine-tuneado específicamente para producir descripciones detalladas, tags estilo Danbooru y análisis de composición de imagen. Su principal atractivo es su ligereza: requiere poco más de 1 GB de VRAM para inferencia, lo que lo hace accesible en GPUs de consumo, y está optimizado para generar captions compatibles con los modelos de difusión Flux (T5XXL y CLIP_L). La versión 2.0 añade la instrucción `<ANALYZE>` para análisis de composición y la instrucción `<MIXED_CAPTION_PLUS>` que combina captions mixtos con análisis, mejorando además la precisión de las instrucciones existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Florence-2-base (encoder-decoder de vision-lenguaje) |
| Parametros totales | 270.957.657 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no especificados (pesos en safetensors) |
| Idiomas soportados | no disponible (probablemente ingles, no confirmado) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Florence-2-base, un modelo de Microsoft que combina un encoder de vision (tipo ViT) con un decoder de lenguaje (tipo transformer) para tareas de comprensión imagen-texto. En esta versión, el modelo ha sido fine-tuneado para tareas específicas de generación de captions y tags, con un dataset no especificado. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se utilizaron técnicas como RLHF o DPO. La innovación principal reside en las instrucciones personalizadas que permiten distintos modos de salida, y en la optimización para generar captions que alimenten directamente los dos encoders de texto de Flux (T5XXL y CLIP_L) en una sola pasada.

## Capacidades

- Generación de captions en varios estilos: `<CAPTION>` (una línea), `<DETAILED_CAPTION>` (descripción estructurada con posiciones de sujetos), `<MORE_DETAILED_CAPTION>` (descripción muy detallada).
- Generación de tags estilo Danbooru con `<GENERATE_TAGS>`.
- Análisis de composición de imagen con `<ANALYZE>`, que devuelve información sobre la disposición de elementos en la imagen.
- Modo mixto `<MIXED_CAPTION>` que combina caption detallado y tags, especialmente útil para Flux.
- Modo `<MIXED_CAPTION_PLUS>` que integra el análisis de composición con el caption mixto.
- Inferencia ligera y rápida: requiere poco más de 1 GB de VRAM, apto para GPUs de consumo.
- Integración con ComfyUI mediante el nodo MiaoshouAI Tagger, que permite usar el modelo sin escribir código.

## Casos de uso

- Generación de captions para datasets de entrenamiento de modelos de difusión: el modelo puede etiquetar miles de imágenes automáticamente con `<GENERATE_TAGS>` o `<DETAILED_CAPTION>`, acelerando la preparación de datos para fine-tuning de Stable Diffusion o Flux.
- Captioning para flujos de trabajo con Flux: gracias a `<MIXED_CAPTION>` y `<MIXED_CAPTION_PLUS>`, se pueden generar captions que alimentan directamente los encoders T5XXL y CLIP_L de Flux en una sola pasada, reduciendo el tiempo de preprocesado.
- Análisis de composición fotográfica: con `<ANALYZE>`, el modelo describe la disposición de sujetos y elementos, útil para estudios de estética o para generar prompts más precisos en herramientas de edición.
- Automatización de etiquetado en plataformas de contenido: se puede integrar en pipelines para asignar tags a imágenes subidas por usuarios, mejorando la búsqueda y organización.
- Asistencia a diseñadores y artistas: el modelo puede generar descripciones alternativas de una imagen, sirviendo como inspiración o para documentar obras.
- Preprocesado de imágenes para modelos de texto a imagen: al generar captions detallados, se pueden usar como prompts de alta calidad para modelos generativos, mejorando la coherencia del resultado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos comparativos con otros modelos de captioning en términos de métricas como CIDEr, BLEU o precisión de tags.

## Requisitos de hardware

- VRAM estimada: poco más de 1 GB según la model card, lo que permite ejecución en GPUs con 2 GB o más.
- GPUs recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 2060, etc.). También funciona en GPUs de datacenter como A100 o H100, aunque no son necesarias.
- Cabe en GPUs consumer de gama baja y media, incluyendo portátiles con GPUs integradas (siempre que tengan suficiente VRAM compartida).
- Opciones de despliegue: se puede usar mediante la librería de Hugging Face Transformers con `trust_remote_code=True`, o a través del nodo ComfyUI-Miaoshouai-Tagger. También es posible servirlo con vLLM o TGI si se adapta, aunque no está documentado.
- Latencia y throughput: no se han publicado mediciones oficiales, pero al ser un modelo de 270M parámetros, se espera una generación de captions en el orden de cientos de milisegundos en GPUs modernas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|
| Florence-2-base (original) | 0.23B | 1024 tokens (aprox.) | MIT | Tareas generales de vision-lenguaje |
| Florence-2-base-PromptGen-v2.0 | 0.27B | no disponible | MIT | Captions y tags para difusion |
| BLIP-2 (base) | 1.2B (vision) + 2.7B (LLM) | 32 tokens | MIT | Captioning y VQA |
| LLaVA-1.5 (7B) | 7B | 2048 tokens | Apache 2.0 | Vision-lenguaje conversacional |

Nota: los datos de Florence-2-base original y BLIP-2 son de conocimiento general, no de la informacion proporcionada. No se dispone de comparativas cuantitativas de rendimiento entre estos modelos.

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos o alucinaciones; al ser un modelo de captioning, puede generar descripciones inexactas o inventar detalles en imágenes ambiguas.
- El modelo está orientado principalmente a imágenes de estilo anime/ilustración (por el uso de tags Danbooru), por lo que su rendimiento en fotografías reales puede ser inferior.
- La longitud de contexto no está documentada; se recomienda probar con imágenes de resolución estándar y ajustar `max_new_tokens` según la salida deseada.
- La licencia MIT permite uso comercial, pero el modelo depende de Florence-2-base, que también es MIT, por lo que no hay restricciones conocidas.
- El repositorio de HuggingFace tiene 0 descargas y 0 likes, lo que sugiere que es una copia reciente o poco utilizada; se recomienda verificar la procedencia del modelo antes de usarlo en producción.
- El uso requiere `trust_remote_code=True` en Transformers, lo que implica ejecutar código del repositorio; se debe revisar el código fuente por seguridad.

## Enlaces

- Repositorio HuggingFace (fork): https://huggingface.co/Curvelover13/Florence-2-base-PromptGen-v2.0
- Repositorio HuggingFace (original): https://huggingface.co/MiaoshouAI/Florence-2-base-PromptGen-v2.0
- GitHub con documentación: https://github.com/hu05xing/Florence-2-base-PromptGen-v2.0
- Nodo ComfyUI-Miaoshouai-Tagger: https://github.com/miaoshouai/ComfyUI-Miaoshouai-Tagger
- Página en PromptLayer: https://www.promptlayer.com/models/florence-2-base-promptgen-v20/
- Página en ModelScope: https://www.modelscope.cn/models/cutemodel/Florence-2-base-PromptGen-v2.0

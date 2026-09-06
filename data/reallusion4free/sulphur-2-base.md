# reallusion4free/Sulphur-2-base

## Resumen

Sulphur 2 Base es un modelo de generación de vídeo de código abierto desarrollado por el usuario reallusion4free sobre la base del modelo LTX-2.3 de Lightricks. Está diseñado para generar vídeo a partir de texto (text-to-video, t2v) y de imagen (image-to-video, i2v) de forma nativa, y también soporta otros formatos del ecosistema LTX 2.3. El modelo se presenta como una versión "sin censura" (uncensored), lo que significa que no aplica los filtros de contenido habituales, pensado para usos creativos y de investigación donde se busca libertad total en la generación.

El modelo tiene aproximadamente 9.197 millones de parámetros (9.197.093.888) y un tamaño de repositorio de 187.4 GB, lo que indica que es un modelo de gran escala para generación de vídeo. Incluye un componente adicional llamado "prompt enhancer" (mejorador de prompts) que se puede cargar en LM Studio mediante un archivo GGUF y un mmproj, y que sirve para enriquecer las instrucciones antes de generar el vídeo. El autor también proporciona un LoRA de destilación (distill lora) para mejorar el rendimiento, y menciona que hay versiones cuantizadas disponibles en CivitAI.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (basado en Lightricks/LTX-2.3) |
| Parametros totales | 9.197.093.888 |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | fp8mixed, bf16, GGUF |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La información técnica sobre la arquitectura interna no se ha publicado en la model card. El modelo es un derivado de Lightricks/LTX-2.3, que es un modelo generativo de vídeo de la familia LTX. Según el autor, soporta de forma nativa la generación de vídeo a partir de texto (t2v) y de imagen (i2v), así como otros formatos compatibles con LTX 2.3. Se menciona el uso de Musubi Tuner, que es una herramienta para entrenar LoRA en modelos de vídeo, lo que sugiere que el modelo ha sido ajustado mediante técnicas de fusión (merging) y/o fine-tuning con LoRA. No se disponen de datos sobre el conjunto de datos de entrenamiento, el número de tokens procesados, ni sobre procesos de alineación como RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) y de imagen (image-to-video) de forma nativa.
- Soporte de otros formatos del ecosistema LTX 2.3, lo que permite flexibilidad en los flujos de trabajo.
- Modelo "sin censura" (uncensored): no aplica filtros de contenido estándar, lo que permite generar contenido sin las restricciones habituales de los modelos comerciales.
- Incluye un "prompt enhancer" (mejorador de prompts) que se puede cargar en LM Studio como un modelo GGUF con su correspondiente mmproj. No requiere system prompt; basta con enviar el texto (y opcionalmente una imagen) para obtener un prompt mejorado.
- Se proporciona un LoRA de destilación (distill lora) que puede usarse junto al modelo para mejorar la calidad o acelerar la generación, aunque el autor recomienda no usar el LoRA y el modelo completo al mismo tiempo.
- Disponible en versiones dev con cuantización fp8mixed y bf16, y también en formato GGUF para su integración en herramientas como LM Studio.
- Compatible con la librería diffusers de HuggingFace.

## Casos de uso

- Producción cinematográfica independiente: el modelo puede generar secuencias de vídeo a partir de guiones o imágenes de referencia, permitiendo crear cortometrajes o animaciones con estilo realista y cinematográfico. Su naturaleza sin censura facilita la exploración de temas que otros modelos rechazarían.
- Creación de contenido para redes sociales: se pueden generar clips cortos de vídeo para plataformas como TikTok, Instagram o YouTube, partiendo de prompts textuales o de una imagen inicial. El modelo es adecuado para contenido creativo sin restricciones.
- Prototipado de escenas para videojuegos: los desarrolladores pueden generar vídeos de prueba para cinemáticas, fondos animados o escenas de transición, acelerando el proceso de diseño sin necesidad de renderizar en tiempo real.
- Arte generativo y visualización: artistas digitales pueden utilizar el modelo para crear piezas de vídeo artísticas a partir de prompts abstractos o de imágenes generadas por otros modelos, aprovechando la capacidad de i2v y el prompt enhancer para refinar las ideas.
- Investigación en generación de vídeo: al ser un modelo abierto basado en LTX-2.3, es útil como modelo base para experimentos de fine-tuning, merging o entrenamiento de LoRA. El autor menciona que se podrá entrenar sobre el modelo, lo que lo convierte en una opción para laboratorios de investigación.
- Mejora de prompts en flujos de trabajo de IA: el prompt enhancer integrado puede usarse de forma independiente para optimizar prompts destinados a otros modelos de vídeo o de imagen, mejorando la calidad de las instrucciones en pipelines creativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no se proporcionan requisitos oficiales. Dado que el modelo tiene 9.197.093.888 parámetros, se estima que la versión bf16 necesitaría al menos 18.4 GB de VRAM solo para los pesos, más memoria adicional para el procesamiento de vídeo. La versión fp8 podría reducir este consumo a aproximadamente 9.2 GB, pero no está confirmado.
- GPU recomendadas: no disponible. Por el tamaño del modelo, es probable que se requieran GPUs de gama alta, como la RTX 4090 (24 GB) o superiores, aunque no se ha verificado.
- Si cabe en consumer GPU: la versión fp8 podría ser ejecutable en una GPU de consumo con 24 GB de VRAM, pero no hay confirmación oficial.
- Opciones de despliegue: compatible con la librería diffusers de HuggingFace. El prompt enhancer se puede cargar en LM Studio mediante archivos GGUF y mmproj. También hay versiones cuantizadas disponibles en CivitAI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para comparar con modelos similares. El modelo se basa en Lightricks/LTX-2.3, que es su referencia principal y comparte la misma arquitectura y formato. Dado que no se han publicado resultados de rendimiento ni especificaciones detalladas, no es posible realizar una comparativa técnica rigurosa con otras alternativas de la misma categoría.

## Limitaciones y advertencias

- Al ser un modelo "sin censura" (uncensored), puede generar contenido no apto para todos los públicos, lo que conlleva riesgos de uso indebido y de exposición a material inapropiado.
- No se ha publicado información sobre sesgos, alucinaciones o artefactos visuales, por lo que no se pueden evaluar estos riesgos de antemano.
- La licencia no está disponible, lo que genera incertidumbre sobre el uso comercial y la redistribución del modelo.
- El repositorio tiene un tamaño de 187.4 GB, lo que dificulta su descarga y despliegue en entornos con recursos limitados.
- No se indica qué idiomas soporta el modelo, lo que puede limitar su uso en aplicaciones multilingües.
- El modelo hereda las capacidades y limitaciones de LTX-2.3, que no están documentadas en esta ficha.
- El autor advierte que las instrucciones de configuración aún están incompletas ("will contain better setup instructions soon"), lo que puede dificultar la puesta en marcha para usuarios no experimentados.
- Se recomienda no usar el modelo completo y el LoRA de destilación al mismo tiempo, ya que podría degradar el resultado.

## Enlaces

- HuggingFace: https://huggingface.co/reallusion4free/Sulphur-2-base
- CivitAI Base Model: https://civitai.red/models/2594061/sulphur-2-base
- CivitAI Quant Model: https://civitai.red/models/2630742
- Discord: https://discord.gg/m768UgBpq
- Kofi: https://ko-fi.com/fusioncow
- Artículo Medium: https://medium.com/data-science-in-your-pocket/sulphur-2-base-uncensored-free-ai-video-generation-model-e6a75764a351
- Modelo espejo en HuggingFace: https://huggingface.co/Aiwithus/Sulphur-2-base
- Merge i2v recomendado por el autor: https://huggingface.co/TenStrip/LTX2.3-10Eros

# leonsarmiento/Orion-26B-A4B-v1-6bit-XL-mlx

## Resumen

Orion-26B-A4B-v1-6bit-XL-mlx es una conversión al formato MLX del modelo Orion-26B-A4B-v1, un finetune de TheDrummer sobre google/gemma-4-26B-A4B-it. Se trata de un modelo multimodal (imagen y texto) basado en una arquitectura Mixture of Experts (MoE) con 25.782.252.592 parámetros totales, de los cuales se activan aproximadamente 3.800 millones por token gracias a 128 expertos por capa. La conversión, realizada por leonsarmiento, aplica la cuantización BaseQuant_XL, una estrategia estática y agnóstica a los datos que mantiene en bf16 las capas críticas de enrutamiento y el experto denso compartido, mientras cuantiza el resto a 8 y 6 bits. El resultado es un modelo de 22,8 GB optimizado para Apple Silicon, que conserva el encoder de visión y el comportamiento de roleplay y escritura creativa del finetune original. Su relevancia radica en permitir ejecutar un MoE multimodal de gran tamaño en hardware de Apple sin necesidad de servicios externos, con una cuantización transparente que no depende de conjuntos de calibración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) multimodal, basada en google/gemma-4-26B-A4B-it (finetune de TheDrummer) |
| Parametros totales | 25.782.252.592 (25,8B) |
| Parametros activos | ~3.800 millones por token (promedio) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BaseQuant_XL mixta: bf16 (router.proj, mlp, vision tower), 8-bit (embed_tokens, self_attn), 6-bit (experts.switch_glu), group size 64, bits por peso ~7,1 |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | MLX (safetensors, 5 shards, 22,8 GB) |

## Arquitectura y entrenamiento

Orion-26B-A4B-v1 es un finetune de TheDrummer sobre el modelo base google/gemma-4-26B-A4B-it. La arquitectura es un transformer MoE multimodal con 128 expertos por capa y un promedio de 3.800 millones de parámetros activos por token. El modelo base incluye un encoder de visión, lo que le permite procesar entradas de imagen y texto (pipeline image-text-to-text). El finetune de TheDrummer está orientado a roleplay y escritura creativa, según su linaje. No se dispone de información sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO). La conversión a MLX utiliza la cuantización BaseQuant_XL, una técnica estática y agnóstica a los datos que asigna precisión según el rol arquitectónico: las capas de enrutamiento (router.proj) y el experto denso compartido (mlp) se mantienen en bf16, mientras que los parámetros masivos de los expertos enrutados se cuantizan a 6 bits. Esta estrategia evita el sesgo de los métodos dependientes de calibración (como AWQ o GPTQ) y preserva la fidelidad al modelo original.

## Capacidades

- Multimodal: procesa imágenes y texto, gracias al encoder de visión preservado en bf16.
- Generación de texto conversacional, con especialización en roleplay y escritura creativa.
- Modo de razonamiento: el modelo soporta marcadores de pensamiento (`<|channel|>thought` ... `<|channel|>`), lo que permite extraer o mostrar el razonamiento interno.
- Soporte de tool calling: no documentado explícitamente; el chat template incluye referencias a `prev_non_tool_role` y `format_argument`, lo que sugiere compatibilidad con herramientas, pero no se confirma en la documentación disponible.
- Capacidades multilingües: no disponibles.
- No se menciona soporte de audio.

## Casos de uso

- Asistente multimodal local en Apple Silicon: gracias a la cuantización MLX, el modelo puede ejecutarse en un Mac con memoria unificada suficiente para responder preguntas sobre imágenes y mantener conversaciones de roleplay sin conexión.
- Aplicaciones de escritura creativa y roleplay: el finetune de TheDrummer está orientado a este dominio, por lo que es adecuado para generar narrativas, diálogos y personajes en juegos de rol.
- Análisis y descripción de imágenes en entornos privados: al ser multimodal, puede generar descripciones de imágenes para accesibilidad o indexación, sin enviar datos a servicios externos.
- Investigación sobre cuantización de modelos MoE: la estrategia BaseQuant_XL ofrece un caso de estudio de cuantización estática por rol arquitectónico, útil para comparar con métodos dependientes de calibración.
- Prototipado de agentes con razonamiento visible: los marcadores de pensamiento permiten depurar el razonamiento del modelo en tareas de varios pasos, facilitando el desarrollo de agentes.
- Generación de contenido multimodal para documentación técnica: se puede usar para generar texto alternativo para imágenes, capturas o diagramas en documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El modelo ocupa 22,8 GB en disco. Para inferencia en MLX, se recomienda un dispositivo Apple Silicon con al menos 32 GB de memoria unificada, ya que el runtime añade overhead de activaciones y KV cache. Con 24 GB podría funcionar con una ventana de contexto reducida, pero no está garantizado.
- No aplica a GPUs NVIDIA o AMD. Requiere Apple Silicon (M1, M2, M3, M4). No se puede ejecutar en A100 o H100 sin convertir el modelo a otro formato.
- Opciones de despliegue: mlx-vlm (mediante `python -m mlx_vlm.generate`), LM Studio, y cualquier framework que soporte MLX y safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Orion-26B-A4B-v1-6bit-XL-mlx | 25,8B | ~3,8B | no disponible | no disponible | MLX |
| TheDrummer/Orion-26B-A4B-v1 | 25,8B | ~3,8B | no disponible | no disponible | no disponible |
| google/gemma-4-26B-A4B-it | 25,8B | ~3,8B | no disponible | no disponible | no disponible |
| leonsarmiento/gemma-4-26B-A4B-it-6bit-XL-mlx | 25,8B | ~3,8B | no disponible | no disponible | MLX |

Los datos de contexto, licencia y rendimiento no están disponibles en la información proporcionada. El modelo TheDrummer/Orion-26B-A4B-v1 es la fuente sin cuantizar; google/gemma-4-26B-A4B-it es el modelo base de Google; y leonsarmiento/gemma-4-26B-A4B-it-6bit-XL-mlx es una conversión equivalente sobre el modelo base.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un finetune de roleplay, puede heredar sesgos del dataset de entrenamiento y del modelo base.
- Riesgo de alucinación: no evaluado. Como modelo generativo, puede producir contenido ficticio, especialmente en tareas creativas.
- Limitaciones de contexto e idioma: la longitud de contexto no está disponible; los idiomas no están especificados. No se puede garantizar un rendimiento óptimo en lenguas distintas del inglés.
- Restricciones de licencia: la licencia no está disponible. El usuario debe verificar la licencia del modelo base google/gemma-4-26B-A4B-it y del finetune TheDrummer/Orion-26B-A4B-v1 antes de cualquier uso comercial.
- Caveat para producción: es una conversión de la comunidad con 0 descargas y 0 likes, sin validación independiente. La cuantización estática sin calibración puede degradar el rendimiento en dominios no representados, aunque la estrategia XL intenta minimizarlo. El modelo solo es ejecutable en Apple Silicon; para otros entornos es necesario convertirlo a otro formato.

## Enlaces

- https://huggingface.co/leonsarmiento/Orion-26B-A4B-v1-6bit-XL-mlx
- https://huggingface.co/TheDrummer/Orion-26B-A4B-v1
- https://huggingface.co/google/gemma-4-26B-A4B-it
- https://huggingface.co/google/gemma-4-26B-A4B-it/blob/main/chat_template.jinja
- https://huggingface.co/models?other=base_model%3Aquantized%3ATheDrummer%2FOrion-26B-A4B-v1
- https://huggingface.co/leonsarmiento/gemma-4-26B-A4B-it-6bit-XL-mlx

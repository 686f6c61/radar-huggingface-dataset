# NidAll/moss-qwen3.5-2b-upsampler-bf16

## Resumen

moss-qwen3.5-2b-upsampler-bf16 es un ajuste fino (fine-tune) de tipo LoRA fusionado en precisión completa BF16 sobre el modelo huihui-ai/Huihui-Qwen3.5-2B-abliterated, una variante "abliterated" (con los mecanismos de rechazo atenuados) de la familia Qwen3.5 de 2B parámetros. Lo desarrolla el usuario NidAll y su propósito es muy concreto: reescribir y expandir prompts de texto a imagen en lenguaje natural para el ecosistema MOSS-Image, es decir, actuar como "upsampler" de prompts T2I. No es un modelo de propósito general, sino una herramienta especializada de un solo paso dentro de un pipeline de generación de imágenes.

El modelo conserva la torre de visión del modelo base intacta (100 % congelada durante el entrenamiento) y solo se han ajustado las capas de atención y MLP del decodificador de lenguaje mediante LoRA de rango 32. El resultado es un checkpoint autónomo de 2.213.241.664 parámetros (unos 4,4 GB en BF16) que se carga con `AutoModelForImageTextToText` de transformers. Su relevancia es acotada pero clara para quien trabaje con MOSS-Image: permite sustituir la reescritura manual de prompts por un modelo pequeño que cabe en GPU de consumo.

El entrenamiento se hizo sobre el dataset NidAll/moss-pup-qwen35-clean-6k, con una única época y enmascaramiento de pérdida solo sobre la respuesta. La model card reporta una auditoría de 30 prompts con 0 rechazos y 0 fugas de etiquetas `<think>`, lo que sugiere que la atenuación de rechazos del modelo base se mantiene tras el ajuste. No hay información publicada sobre licencia, idiomas ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (familia Qwen3.5) con torre de visión congelada; pipeline image-text-to-text |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (checkpoint publicado); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo parte de Huihui-Qwen3.5-2B-abliterated, un transformer decoder-only de la familia Qwen3.5 con capacidad multimodal (entrada de imagen y texto) y unos 2,2 mil millones de parámetros. Sobre esa base se aplicó un LoRA de 16 bits con rango r=32 y alpha=64, restringido exclusivamente a las capas de atención y MLP del modelo de lenguaje; el codificador de visión se mantuvo 100 % congelado. El entrenamiento consistió en una época con tamaño de lote efectivo 16, scheduler coseno y learning rate 0,0001, aplicando enmascaramiento de pérdida únicamente sobre la respuesta (response-only loss masking) para que el modelo aprenda a generar la expansión del prompt y no a reproducir la instrucción.

El dataset de entrenamiento es NidAll/moss-pup-qwen35-clean-6k, un conjunto de aproximadamente 6.000 ejemplos orientados a la expansión de prompts para MOSS-Image. No se documenta el número total de tokens procesados ni la composición detallada del corpus, ni si hubo fases de RLHF o DPO posteriores al SFT. La innovación técnica destacable no está en la arquitectura, sino en el flujo de uso: el modelo está pensado para ejecutarse con `enable_thinking=False` y un system prompt fijo ("Expand the user prompt into a rich, vivid image generation prompt. Output only the final prompt."), de modo que la salida sea directamente consumible por el generador de imágenes sin post-procesado.

## Capacidades

- Expansión de prompts texto-a-imagen: reescribe una instrucción breve en un prompt descriptivo, vívido y detallado para MOSS-Image.
- Generación de texto conversacional heredada del modelo base Qwen3.5 de 2B.
- Procesamiento de entrada image-text-to-text (la torre de visión está presente y congelada, aunque el ajuste se centró en el texto).
- Salida controlada sin etiquetas de razonamiento: la auditoría reporta 0 fugas de `<think>` en 30 prompts.
- Comportamiento con rechazos atenuados (variante abliterated): 0/30 rechazos y 0/30 respuestas "sanitizadas de forma encubierta" en la auditoría del autor.
- No se documenta soporte explícito de tool calling, function calling ni flujos de agentes multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Pipeline de generación de imágenes con MOSS-Image: el modelo se coloca antes del generador para convertir un prompt corto del usuario ("un gato en una ventana") en una descripción rica en iluminación, composición y estilo, mejorando la fidelidad del resultado sin intervención manual.
- Herramienta de reescritura de prompts en interfaces creativas: integrado como paso intermedio en una UI de generación de imágenes, permite que usuarios no técnicos obtengan prompts de calidad profesional a partir de descripciones coloquiales.
- Automatización de lotes de generación: al ser un modelo de 2B en BF16 (unos 4,4 GB), puede ejecutarse en una GPU de consumo y procesar grandes volúmenes de prompts en batch antes de enviarlos al modelo de difusión.
- Prototipado rápido de pipelines T2I: sirve como componente desacoplado y sustituible en pruebas de concepto donde se quiere evaluar el impacto de la expansión de prompts sin entrenar un modelo propio.
- Filtrado y normalización de prompts en producción: estandariza la forma de los prompts de entrada a un formato consistente antes de pasarlos a un servicio de generación de imágenes.
- Investigación sobre prompt engineering automatizado: permite estudiar empíricamente cómo la expansión de prompts afecta a la calidad de las imágenes generadas, con un modelo pequeño y reproducible.
- Base para ajustes posteriores: al ser un checkpoint BF16 completo y autónomo, puede servir como punto de partida para fine-tunes adicionales orientados a otros generadores de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La única métrica reportada por el autor es la auditoría de ablación sobre 30 prompts: 0/30 rechazos (0,0 %), 0/30 respuestas sanitizadas de forma encubierta (0,0 %) y 0 fugas de `<think>`.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4,4 GB solo para los pesos, más overhead de activaciones y KV cache; en la práctica, entre 6 y 8 GB para contextos moderados.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM para BF16; una RTX 4090, A100 o H100 ofrecen margen sobrado y permiten lotes grandes.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070 en adelante). En GPUs con menos VRAM sería necesario cuantizar, aunque no se publican versiones GGUF ni cuantizadas.
- Opciones de despliegue: transformers con `AutoModelForImageTextToText` (verificado por el autor en transformers estándar); vLLM, TGI, llama.cpp u Ollama no están documentados para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| moss-qwen3.5-2b-upsampler-bf16 | 2,21B | no disponible | Upsampling de prompts para MOSS-Image | no disponible | Hugging Face (NidAll) |
| huihui-ai/Huihui-Qwen3.5-2B-abliterated (base) | ~2B | no disponible | Modelo general abliterated | no disponible | Hugging Face |
| Qwen3.5-2B (familia original) | ~2B | no disponible | Modelo general multimodal | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativos entre estos modelos en la información proporcionada. La comparación se limita a parámetros y enfoque, ya que no hay benchmarks publicados para el modelo objeto de esta ficha.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado para una única tarea (expansión de prompts para MOSS-Image) y su rendimiento fuera de ese dominio no está evaluado.
- Herencia "abliterated": la atenuación de rechazos del modelo base implica que puede generar contenido que otros modelos rechazarían; requiere filtrado y políticas de uso en producción.
- Riesgo de alucinación: como todo modelo generativo, puede inventar detalles visuales no solicitados o desviarse del prompt original del usuario.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; es un riesgo legal relevante antes de desplegarlo.
- Idiomas no documentados: no hay información sobre el soporte multilingüe ni sobre el idioma de los datos de entrenamiento.
- Contexto no documentado: se desconoce la longitud máxima de contexto, lo que dificulta planificar el dimensionamiento de la KV cache.
- Sin cuantizaciones publicadas: solo existe el checkpoint BF16, lo que limita el despliegue en hardware con poca VRAM.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.
- Requiere un system prompt exacto y `enable_thinking=False` para funcionar según lo entrenado; usarlo de otra forma puede degradar la calidad de la salida.
- Fecha de creación futura en los metadatos (2026-11-21), lo que conviene verificar antes de tratarlo como un artefacto estable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NidAll/moss-qwen3.5-2b-upsampler-bf16
- Modelo base: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-2B-abliterated
- Dataset de entrenamiento: https://huggingface.co/datasets/NidAll/moss-pup-qwen35-clean-6k

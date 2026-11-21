# pgmharikrishnan/Inkling-2-Mini-MLX-Serve-4bit

## Resumen

Inkling-2-Mini-MLX-Serve-4bit es una cuantización de 4 bits del modelo thinkingmachines/Inkling-2-Mini, publicada por el usuario pgmharikrishnan. Se trata de una conversión orientada a la librería `mlx-serve`, pensada para ejecutar el modelo en hardware Apple Silicon mediante el framework MLX. El modelo base pertenece a la familia `inkling2_loop`, una arquitectura MoE con transformer "looped" (capas recurrentes), con 26.070.385.152 parámetros totales según los pesos en safetensors y un rango de 3,4B–5,4B parámetros activos por token según la model card del autor de la conversión.

La relevancia de esta ficha es doble. Por un lado, documenta una receta de conversión concreta: los expertos enrutados del modelo original venían en formato `modelopt` NVFP4 (con `group_size=16`), y se han de-cuantizado y vuelto a cuantizar a 4 bits afines de MLX con `group_size=64`, mientras que routers, controladores, normas y proyecciones auxiliares se mantienen en bfloat16. Por otro, es un ejemplo de cómo se distribuyen pesos ya cuantizados para inferencia local en Mac, un formato que no es directamente portable a CUDA ni a llama.cpp.

No se dispone de información sobre datos de entrenamiento, benchmarks, idiomas soportados ni detalles del proceso de alineación del modelo base en la información proporcionada. Esta ficha se limita a los datos verificables de la model card y de los metadatos de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE con transformer "looped" (`model_type: inkling2_loop`); expertos enrutados tipo switch_mlp |
| Parámetros totales | 26.070.385.152 (26,07B) |
| Parámetros activos | 3,4B–5,4B (rango indicado en la model card del autor) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4 bits afín MLX (`bits=4`, `group_size=64`); routers, controladores, residuales de atención, convoluciones cortas, normas y proyecciones auxiliares en full/bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), librería `mlx-serve` |
| Tamaño del repositorio | 14,8 GB |
| Modelo base | thinkingmachines/Inkling-2-Mini |
| Relación con el base | quantized |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo base es un MoE con arquitectura de transformer "looped": el bloque transformer se reutiliza en varias iteraciones o bucles, lo que permite aumentar la profundidad efectiva sin multiplicar linealmente el número de parámetros. Los pesos incluyen componentes propios de este diseño, como `wq_du`, `wk_dv`, `wv_dv`, `wr_du`, `wo_ud`, `gate_attn`, `attn_sink_proj`, `rel_logits_proj`, `sconv` (convoluciones cortas) y controladores de bucle, además de los expertos enrutados estándar (`w13_weight`, `w2_weight`).

La conversión documentada por el autor es la siguiente: los expertos enrutados del checkpoint original estaban en NVFP4 de `modelopt` con `group_size=16` y una escala global calculada como `amax * 6 * 448 / outer_scale_denominator`; se de-cuantizaron, se separaron en `switch_mlp.gate_proj`, `switch_mlp.up_proj` y `switch_mlp.down_proj`, y se volvieron a cuantizar a 4 bits afines de MLX con `group_size=64`. La atención y los embeddings (`embed`, `unembed`) también se cuantizaron a 4 bits. Los routers, controladores, residuales de atención, pesos de convolución corta, normas, `attn_sink_proj` y `rel_logits_proj` se mantuvieron en precisión completa o bfloat16, y los pesos `sconv` se transpusieron de `[C, 1, K]` a `[C, K, 1]`. No hay información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base usó RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno, según el pipeline declarado `text-generation` y la etiqueta `conversational`.
- Razonamiento y generación de código: no confirmado explícitamente en la información disponible, pero habitual en modelos de esta familia y tamaño.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el campo de idiomas no está cumplimentado.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.
- Inferencia nativa en Apple Silicon a través de MLX, con pesos ya cuantizados para reducir el uso de memoria.

## Casos de uso

- Inferencia local en Mac con Apple Silicon: el formato MLX y la cuantización de 4 bits permiten cargar un modelo de 26B totales en equipos con memoria unificada de gama alta, algo inviable con pesos en bf16. Adecuado para prototipado y uso personal en macOS.
- Asistentes conversacionales de escritorio: la etiqueta `conversational` y el pipeline de generación de texto permiten integrar el modelo en aplicaciones de chat locales sin depender de la nube.
- Procesamiento de texto por lotes en local: para tareas de resumen, reescritura o clasificación sobre documentos, el modelo puede ejecutarse en un Mac con suficiente memoria unificada, evitando costes de API.
- Evaluación de arquitecturas MoE "looped": investigadores que quieran estudiar el comportamiento de este tipo de transformers pueden usar esta conversión para experimentar con un checkpoint ya cuantizado y ligero de cargar.
- Desarrollo de pipelines MLX: sirve como referencia para integrar modelos MoE cuantizados en aplicaciones basadas en `mlx-serve` y para validar recetas de conversión desde NVFP4 a 4 bits afín.
- Prototipado de agentes y asistentes con contexto conversacional: aunque no se confirma tool calling, el modelo puede usarse como generador de texto dentro de un bucle de agente implementado en el código de la aplicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 14,8 GB en safetensors, por lo que se necesita al menos esa cantidad de memoria unificada más el overhead de ejecución (KV cache, buffers de activación). En la práctica, se recomienda un Mac con 24 GB o más de memoria unificada; 32 GB o más para contextos largos.
- GPU recomendadas: Apple Silicon con MLX (series M1/M2/M3/M4, especialmente variantes Pro, Max y Ultra). No es compatible de forma nativa con CUDA sin reconversión.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí en equipos con memoria unificada suficiente; en GPUs NVIDIA de consumo (RTX 4090, 24 GB) requeriría una conversión a otro formato (por ejemplo, GGUF o GPTQ) que no se proporciona en este repositorio.
- Opciones de despliegue: `mlx-serve` (librería declarada). No se indica soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Inkling-2-Mini-MLX-Serve-4bit | 26,07B | 3,4B–5,4B | no disponible | Apache 2.0 | safetensors MLX, `mlx-serve` |
| thinkingmachines/Inkling-2-Mini (base) | 26,4B (según model card) | 3,4B–5,4B | no disponible | Apache 2.0 | safetensors, formato original |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento.

## Limitaciones y advertencias

- La cuantización a 4 bits puede degradar la calidad respecto al modelo base en tareas sensibles (matemáticas, código, razonamiento profundo); no se han publicado evaluaciones que cuantifiquen esta pérdida.
- El proceso de conversión incluye una de-cuantización desde NVFP4 y una re-cuantización, lo que introduce una doble pérdida de precisión acumulada en los expertos enrutados.
- No hay información sobre sesgos, riesgo de alucinación ni comportamiento en idiomas distintos del inglés; el campo de idiomas no está cumplimentado.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base y de los datos de entrenamiento originales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día: no hay evidencia de validación por parte de la comunidad.
- El formato es específico de MLX; no es portable directamente a CUDA, llama.cpp u otros runners sin una nueva conversión.
- No se especifica la longitud de contexto soportada, lo que impide planificar despliegues con ventanas largas.
- No se confirma soporte de tool calling ni de agentes, por lo que no debe asumirse en producción sin validación previa.

## Enlaces

- Hugging Face: https://huggingface.co/pgmharikrishnan/Inkling-2-Mini-MLX-Serve-4bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Librería MLX: no disponible en la información proporcionada
- Paper, blog o repositorio del modelo base: no disponible en la información proporcionada

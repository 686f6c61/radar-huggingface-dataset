# axteam/Qwen3.5-27B-FP8-dynamic

## Resumen

`axteam/Qwen3.5-27B-FP8-dynamic` es una cuantización de 8 bits del modelo multimodal `Qwen/Qwen3.5-27B` del equipo Qwen, publicada por el usuario axteam con el objetivo explícito de servir el modelo de forma eficiente en vLLM. No es un modelo nuevo ni un fine-tune: es un derivado post-entrenamiento (PTQ) que conserva tokenizador, `chat_template` y `generation_config` del original, y que solo añade un bloque `quantization_config` al `config.json`. El repositorio tiene 27.781.427.952 parámetros declarados en safetensors (27,78 mil millones, arquitectura densa) y ocupa 31,2 GB en disco, con aproximadamente 29,1 GB de pesos.

El interés práctico está en el formato: esquema W8A8 con pesos FP8 E4M3 y escala estática por canal de salida (sin calibración, *data-free*), y activaciones FP8 dinámicas por token, empaquetado como `FP8_DYNAMIC` de compressed-tensors. Eso reduce a la mitad, aproximadamente, la huella de pesos respecto al BF16 original (que rondaría los 55 GB) y permite plantear el despliegue en una sola GPU de 40-48 GB en lugar de necesitar varios aceleradores.

La arquitectura del modelo base es híbrida: combina capas de atención lineal y capas de atención completa, incluye una torre de visión (pipeline `image-text-to-text`) y una cabeza MTP (*multi-token prediction*), presumiblemente para decodificación especulativa. La licencia es Apache-2.0, lo que facilita el uso comercial. El punto débil es la ausencia total de validación externa y de documentación sobre el modelo base en la información disponible: cero descargas, cero *likes* y ningún benchmark absoluto publicado, solo métricas de fidelidad frente al BF16.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (atención lineal + atención completa), densa, multimodal (visión), con cabeza MTP |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8 dinámica (W8A8): pesos FP8 E4M3 con escala por canal de salida, activaciones FP8 dinámicas por token; formato compressed-tensors `FP8_DYNAMIC`; sin calibración |
| Idiomas soportados | No disponible (el conjunto de evaluación interno del autor es inglés/coreano, pero no se declara una lista oficial de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors con compressed-tensors (FP8), biblioteca `transformers`, soporte vLLM |

Datos adicionales: tamaño del repositorio 31,2 GB; tamaño de los pesos en disco ~29,1 GB; ID de HuggingFace `axteam/Qwen3.5-27B-FP8-dynamic`; creado el 2026-10-29; 0 descargas y 0 *likes* en el momento de la consulta.

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura *transformer* híbrida en la que se alternan capas de atención lineal y capas de atención completa. La model card menciona explícitamente componentes tipo SSM en las capas lineales (`linear_attn.conv1d`, `A_log`, `dt_bias`), lo que apunta a un diseño de atención lineal con estado recurrente convolucional, en la línea de las arquitecturas híbridas Mamba/atención. Sobre esa base se añade una torre de visión más un proyector (`model.visual.*`), lo que habilita la tarea `image-text-to-text`, y una cabeza de predicción multi-token (`mtp.*`) que en la práctica se usa para decodificación especulativa y aceleración de la generación. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del corpus ni las etapas de alineación (RLHF/DPO) del modelo original.

La parte de cuantización sí está documentada con detalle. Se aplica PTQ sin reentrenamiento: los pesos lineales se almacenan en FP8 E4M3 con una escala estática por canal de salida calculada sin datos de calibración, y las activaciones se cuantizan dinámicamente por token en tiempo de inferencia. Se mantienen deliberadamente en BF16 la torre de visión y el proyector, la cabeza MTP, todas las RMSNorm, los *embeddings* de tokens, la LM head y las partes no lineales del bloque SSM (`conv1d`, `A_log`, `dt_bias`), es decir, una fracción pequeña de parámetros pero crítica para la estabilidad numérica. El resultado es un checkpoint que ocupa ~29,1 GB frente a los ~55 GB del BF16, con una degradación declarada de perplexity del +0,4 % y un 97,2 % de acuerdo *top-1* en el siguiente token.

## Capacidades

- Generación de texto conversacional multi-turno (`pipeline_tag: image-text-to-text`, tag `conversational`).
- Comprensión de imágenes y respuesta en texto: la torre de visión y el proyector se conservan en BF16, por lo que la cuantización no degrada la ruta visual por diseño.
- Razonamiento y generación de código o matemáticas: capacidad esperable en la familia Qwen3.5, pero no verificada en la información disponible; no se publican benchmarks de tarea.
- Decodificación especulativa mediante la cabeza MTP (`mtp.*`), conservada en BF16.
- Eficiencia en contextos largos por la combinación de atención lineal y atención completa; la longitud máxima de contexto no está documentada.
- Multilingüismo: no disponible. El autor solo indica que su conjunto de evaluación interno mezcla inglés y coreano.
- *Tool calling* / *function calling*: no disponible; no se menciona en la model card.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada.
- Modo *thinking* o de razonamiento explícito: no disponible.

## Casos de uso

- **Servicio multimodal en producción con vLLM**: el caso de uso declarado por el autor. Se arranca con `vllm serve axteam/Qwen3.5-27B-FP8-dynamic` y se expone un endpoint compatible con la API de OpenAI, con la ventaja de que los pesos en FP8 reducen a la mitad la memoria frente al BF16 y permiten una sola GPU en lugar de un despliegue multi-GPU.
- **Atención al cliente con entrada de imágenes**: el modelo acepta pares imagen-texto, por lo que puede gestionar consultas donde el usuario adjunta una captura, una foto de un producto o un recibo. La ventana de contexto real debe verificarse contra el modelo base antes de dimensionar el *KV cache*, ya que no está documentada.
- **Extracción de datos de documentos escaneados**: digitalización de facturas, albaranes y formularios convirtiendo la imagen en texto estructurado. La torre de visión en BF16 evita la pérdida de calidad que sufriría si se hubiese cuantizado también la ruta visual.
- **Sustitución del BF16 para reducir coste de serving**: si ya se sirve `Qwen/Qwen3.5-27B` en BF16 con varias GPU, este checkpoint permite consolidar en una sola GPU manteniendo el mismo tokenizador y `chat_template`, con lo que el código de aplicación no cambia. La pérdida medida de fidelidad es del +0,4 % de perplexity.
- **Despliegue on-premise con requisitos de licencia permisiva**: Apache-2.0 en el modelo base y en el derivado, sin cláusulas de atribución adicionales más allá de las habituales, apto para entornos donde no se aceptan licencias con restricciones de uso comercial.
- **Evaluación comparativa de cuantizaciones (A/B testing)**: el modelo sirve como referencia FP8 frente al BF16 en *pipelines* internos de regresión de calidad, usando el mismo *harness* que propone el autor (perplexity y acuerdo *top-1* sobre un conjunto fijo de prompts).
- **Procesamiento por lotes offline de imágenes**: clasificación, descripción o etiquetado semántico de grandes volúmenes de imágenes con vLLM en modo *batch*, aprovechando el rendimiento de FP8 en GPU Ada/Hopper.
- **Prototipado de asistentes visuales sin GPU de 80 GB**: al caber en 40-48 GB, es viable en estaciones de trabajo con L40S o A6000 en lugar de exigir nodos con H100.

## Benchmarks y rendimiento

El autor no publica benchmarks de tarea (MMLU, HumanEval, GSM8K, etc.). Solo se reportan métricas de fidelidad frente al modelo BF16 original, medidas sobre un conjunto interno mixto inglés/coreano de 100 prompts, con respuestas *greedy* del BF16 puntuadas bajo cada variante y el mismo *harness*:

| Metrica | Este modelo (FP8 dynamic) | Original BF16 | Diferencia |
|---|---|---|---|
| Perplexity (menor = más fiel) | 1,3662 | 1,3603 | +0,4 % |
| Acuerdo *top-1* en el siguiente token | 97,2 % | 99,3 % | -2,1 puntos |

Advertencia explícita de la model card: estas cifras miden fidelidad al modelo base, no calidad absoluta de tarea. La fila BF16 corresponde al propio original puntuado bajo el mismo *harness* (techo de referencia, no 100 % por detalles del procedimiento). No hay resultados de MMLU, HumanEval, GSM8K ni de benchmarks multimodales en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: los pesos FP8 ocupan ~29,1 GB. Sumando activaciones, *embeddings* y LM head en BF16 y `KV cache`, el mínimo realista ronda los 32-36 GB. Con contexto largo o lotes grandes, 40-48 GB. Estas cifras son estimaciones propias, ya que la longitud de contexto no está documentada.
- **GPU recomendadas**: H100 80 GB y A100 80 GB con holgura para lotes y contexto amplio; L40S 48 GB y RTX A6000 48 GB como opción de una sola tarjeta con margen ajustado; A100 40 GB solo con lotes pequeños y verificación previa.
- **GPU de consumo**: no cabe en RTX 4090 ni en ninguna tarjeta de 24 GB sin *offload* a CPU, lo que degradaría seriamente el rendimiento. En una RTX 5090 de 32 GB quedaría al límite y requeriría probar la configuración de `max_model_len` y `gpu_memory_utilization`.
- **Requisito de computación**: el FP8 nativo en vLLM exige GPU Ada o Hopper (sm89+). En Ampere el *kernel* FP8 no está soportado de forma nativa, por lo que conviene validar el *fallback* o usar otra GPU antes de comprometerse con este checkpoint.
- **Opciones de despliegue**: vLLM es la vía recomendada y la única documentada por el autor (`vllm serve axteam/Qwen3.5-27B-FP8-dynamic`). También es cargable con `transformers` + compressed-tensors. llama.cpp/Ollama y TGI no están mencionados ni se ofrece GGUF; no se puede asumir su compatibilidad.
- **Latencia y throughput**: no disponibles. No se publican medidas de tokens por segundo, TTFT ni comportamiento del *batching*.
- **Muestreo recomendado por el autor**: `temperature=0.7`, `top_p=0.8`, `top_k=20`.

## Comparativa con modelos similares

No se dispone de información sobre otras cuantizaciones FP8 publicadas de este mismo modelo base ni de modelos comparables de la misma familia y tamaño, por lo que la comparativa se limita al original en BF16.

| Modelo | Parametros | Contexto | Formato / memoria de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `axteam/Qwen3.5-27B-FP8-dynamic` | 27,78 B (denso) | No disponible | safetensors FP8 compressed-tensors, ~29,1 GB | Apache-2.0 | HuggingFace, 0 descargas |
| `Qwen/Qwen3.5-27B` (original) | 27,78 B (denso) | No disponible | safetensors BF16, ~55 GB (estimado) | Apache-2.0 | HuggingFace |
| Otras cuantizaciones del mismo base (GGUF, AWQ, GPTQ) | No disponible | No disponible | No disponible | No disponible | No disponible en la información consultada |

Diferencias clave frente al original: mismo número de parámetros, mismo tokenizador y misma plantilla de chat; la mitad de huella de memoria; degradación medida del +0,4 % en perplexity; y pérdida de 2,1 puntos de acuerdo *top-1*. El original mantiene la ventaja en fidelidad y no requiere GPU Ada/Hopper para FP8.

## Limitaciones y advertencias

- **Sin benchmarks de tarea**: no hay MMLU, HumanEval, GSM8K ni evaluaciones multimodales. La única evidencia de calidad es la fidelidad al BF16, que no dice nada sobre el rendimiento absoluto del modelo base.
- **Conjunto de evaluación pequeño y sesgado**: 100 prompts internos, mezcla inglés/coreano, sin publicación de los prompts. No es reproducible ni representativo de otros idiomas, incluido el castellano.
- **Contexto desconocido**: no se declara `max_position_embeddings` ni longitud efectiva. Dimensionar `max_model_len` en vLLM sin este dato puede provocar OOM o truncamientos silenciosos.
- **Idiomas no declarados**: no hay lista oficial de idiomas soportados; el rendimiento en castellano no está verificado.
- **Tool calling y agentes no confirmados**: no se documenta soporte de *function calling* ni de razonamiento multi-paso; no conviene asumirlo en diseño de producción.
- **Riesgo de alucinación**: inherente a cualquier LLM y no cuantificado por el autor; el sesgo concreto del modelo base tampoco está documentado.
- **Degradación por cuantización**: 2,1 puntos de acuerdo *top-1* implican divergencias en la generación greedy. En tareas sensibles a tokens exactos (código, cifras, JSON estricto) conviene validar contra el BF16.
- **Restricciones de plataforma**: FP8 nativo requiere Ada/Hopper en vLLM. El rendimiento en Ampere o en CPU no está garantizado.
- **Licencia**: Apache-2.0 permite uso comercial, pero los derechos sobre pesos, tokenizador y plantilla pertenecen al equipo Qwen; conviene revisar el fichero LICENSE del modelo base enlazado en la model card.
- **Madurez nula**: 0 descargas y 0 *likes*. Es un artefacto recién publicado (creado y actualizado el 2026-10-29, con 10 minutos entre ambas fechas), sin validación de la comunidad ni mantenimiento demostrado.
- **Deriva de tokens especiales**: aunque el tokenizador y la plantilla son idénticos, cualquier futura actualización del modelo base no se reflejará automáticamente en este derivado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/axteam/Qwen3.5-27B-FP8-dynamic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-27B/blob/main/LICENSE
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes sobre este modelo. Los resultados devueltos por la búsqueda no guardan relación con el modelo ni con Qwen y se han descartado; no se dispone de paper, blog técnico, repositorio ni demo adicionales.

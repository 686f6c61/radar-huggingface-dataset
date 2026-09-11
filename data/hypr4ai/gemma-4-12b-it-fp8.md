# HYPR4AI/Gemma-4-12B-it-FP8

## Resumen

HYPR4AI/Gemma-4-12B-it-FP8 es un checkpoint cuantizado en FP8 derivado de google/gemma-4-12B-it, publicado por el usuario HYPR4AI. No se trata de un modelo entrenado desde cero, sino de una compresión del modelo base mediante cuantización dinámica FP8 aplicada con la herramienta llmcompressor y el formato compressed-tensors, con el objetivo de reducir el espacio en disco y la memoria necesaria para servir el modelo. El repositorio ocupa 13,1 GB frente a los aproximadamente 23,9 GB del checkpoint original en BF16, y el recuento real de parámetros en safetensors es de 11.959.730.224 (cerca de 12.000 millones).

El modelo conserva el pipeline any-to-any (image-text-to-text) del modelo base, con torres de visión y audio identificables en la receta de cuantización, aunque el único benchmark publicado es de texto. Está pensado para generación de texto, respuesta a preguntas, QA anclado a contexto recuperado, experimentos de servicio con vLLM y comparaciones entre cuantización FP8 y FP4, según declara el propio autor. La licencia declarada es Apache 2.0, con enlace a los términos específicos de Gemma 4 del modelo base.

Su relevancia actual es práctica más que arquitectónica: ofrece una vía para desplegar un modelo multimodal de ~12B en GPUs con menos memoria, manteniendo capas sensibles (embeddings, cabeza de salida, enrutador y torres multimodales) sin cuantizar. El único resultado publicado es un 65,20% de Exact Match y un 80,38% de Token F1 en 500 ejemplos de HotpotQA Distractor, con una latencia media de 0,53 segundos por petición.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible explícitamente. El tag de transformers es gemma4_unified y el pipeline es any-to-any (image-text-to-text); la receta ignora capas `router`, `vision_tower` y `audio_tower`, lo que apunta a una arquitectura multimodal con enrutamiento tipo MoE, sin confirmación en la información disponible |
| Parametros totales | 11.959.730.224 (~12B), dato real de safetensors |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible. El ejemplo de despliegue con vLLM usa `--max-model-len 4096`, pero es una configuración de servicio, no una especificación del modelo |
| Tipos de cuantizacion | FP8 dinámica sobre capas `Linear` con llmcompressor / compressed-tensors. Capas excluidas: `lm_head`, `.*embed.*`, `.*router`, `.*vision_tower.*`, `.*audio_tower.*` |
| Idiomas soportados | Inglés (`en`) según los metadatos del repositorio |
| Licencia | Apache 2.0, con enlace a los términos de licencia de Gemma 4 del modelo base |
| Formato de pesos | safetensors, cuantizados en formato compressed-tensors; biblioteca transformers |

Otros datos del repositorio: tamaño del repo 13,1 GB, carpeta del modelo en FP8 ~13 GB, peso del BF16 original ~23,9 GB, 0 descargas y 0 likes en el momento de la consulta, creado el 11 de septiembre de 2026 y actualizado el mismo día. Etiquetas adicionales: vllm, quantized, hotpotqa, llmcompressor, endpoints_compatible, region:us, dataset:hotpotqa/hotpot_qa.

## Arquitectura y entrenamiento

No hay información sobre entrenamiento en la documentación disponible: este checkpoint no se ha entrenado, sino cuantizado. El proceso aplicado es una cuantización FP8 dinámica sobre las capas lineales del modelo base google/gemma-4-12B-it, ejecutada con llmcompressor y serializada con compressed-tensors. La receta excluye deliberadamente `lm_head`, los patrones de embeddings, el enrutador y las torres de visión y audio, con el fin declarado de no corromper las proyecciones de salida, los embeddings, el comportamiento del enrutador ni las rutas de proyección multimodales nativas.

La arquitectura subyacente corresponde al modelo base de Google, que según los metadatos es multimodal (image-text-to-text) y presenta componentes de visión y audio junto con un enrutador, aunque no se detalla en la información proporcionada si se trata de un transformer denso, un MoE o una arquitectura híbrida, ni cuántos parámetros estarían activos por token. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO; los únicos datos de entrenamiento o ajuste mencionados son la propia receta de cuantización y el uso del dataset hotpotqa/hotpot_qa como referencia de evaluación.

## Capacidades

- Generación de texto en inglés, con foco declarado en respuestas cortas y extractivas.
- Respuesta a preguntas anclada a contexto: el benchmark publicado usa un prompt de sistema que obliga a responder solo con el contexto y a copiar literalmente nombres, fechas, lugares, números o frases.
- QA con razonamiento multi-salto sobre varios pasajes, evaluado con el split Distractor de HotpotQA.
- Capacidad multimodal heredada en teoría (pipeline any-to-any, torres de visión y audio preservadas de la cuantización), aunque no se publican resultados multimodales y la model card indica que el benchmark reportado es solo de texto.
- Compatibilidad con servicio mediante vLLM usando `--quantization compressed-tensors` y `--dtype bfloat16`.
- Posibilidad de bloquear entradas multimodales en servicio con `limit_mm_per_prompt={"image": 0, "audio": 0}` para despliegues exclusivamente de texto.
- Tool calling, function calling, comportamiento de agente, modo de razonamiento explícito, audio o visión funcional: no disponible en la información proporcionada.

## Casos de uso

- Respuesta a preguntas sobre documentación interna (RAG): el modelo está evaluado exactamente en este escenario con HotpotQA Distractor y un prompt extractivo, y rinde 65,20% de Exact Match y 80,38% de Token F1 sobre 500 ejemplos, lo que lo hace adecuado para asistentes que deben devolver respuestas cortas y literales a partir de pasajes recuperados.
- Atención al cliente automatizada sobre base de conocimiento: con la ventana configurada en el servicio (el ejemplo de vLLM usa 4096 tokens) puede gestionar conversaciones multi-turno ancladas a fragmentos de manuales, condiciones de servicio o fichas de producto, devolviendo respuestas breves y sin explicaciones añadidas.
- Despliegue en producción con restricción de VRAM: al ocupar aproximadamente 13 GB en FP8 frente a los ~23,9 GB del BF16, permite servir un modelo de ~12B en GPUs de 16-24 GB, reduciendo el coste por instancia frente al checkpoint original.
- Extracción de datos estructurados de texto: el prompt de evaluación exige copiar literalmente nombres, fechas, lugares, números o frases, lo que encaja con tareas de extracción de entidades y campos concretos a partir de contexto no estructurado.
- Comparación de recetas de cuantización: el autor declara explícitamente como uso previsto la comparación FP8 frente a FP4, por lo que sirve como punto de referencia en estudios internos de compresión y de impacto en calidad.
- Evaluación de infraestructura de servicio (vLLM): permite medir latencia, throughput y estabilidad de un modelo multimodal cuantizado con compresión por tensores, con datos de referencia publicados (0,53 s de latencia media, 0,48 s de P50, 9,35 tokens de salida por segundo en el benchmark).
- Procesamiento de documentos con imágenes: si se habilitan entradas multimodales (retirando el bloqueo de `limit_mm_per_prompt`), la arquitectura base podría aceptar imagen y texto, aunque no hay resultados publicados que respalden la calidad en esta modalidad.

## Benchmarks y rendimiento

Datos publicados por el autor para HotpotQA Distractor, split `validation[0:500]`, con prompt de sistema extractivo y 500 peticiones correctas sobre 500:

| Metrica | Valor |
|---|---:|
| Preguntas | 500 |
| Peticiones correctas | 500 |
| Fallos | 0 |
| Respuestas exactamente correctas | 326/500 |
| Exact Match | 65,20% |
| Token F1 | 80,38% |
| Exact + parcial | 442/500 = 88,40% |
| Latencia media | 0,53 s |
| Latencia P50 | 0,48 s |
| Latencia máxima | 1,93 s |
| Tokens de salida totales | 2.474 |
| Tokens de salida medios | 4,95 |
| Tokens de salida por segundo | 9,35 |

No se han publicado resultados de MMLU, HumanEval, GSM8K, benchmarks multimodales ni comparativas directas con otros modelos en la información disponible. No se deben extrapolar estos números a otras tareas ni a otros prompts distintos del usado en la evaluación.

## Requisitos de hardware

- Peso de los pesos en FP8: aproximadamente 13 GB, según el tamaño de la carpeta del modelo indicado por el autor (13,1 GB de repositorio).
- VRAM estimada para inferencia: aproximadamente 14-16 GB para los pesos más activaciones y caché KV con contexto moderado; el ejemplo del autor usa `--gpu-memory-utilization 0.70` con vLLM, lo que sugiere margen sobre una GPU de 24 GB.
- GPU recomendadas: NVIDIA L40S (48 GB), A100 (40/80 GB) y H100 para servicio concurrente; RTX 4090 o RTX 5090 (24 GB) para instancias individuales con contexto contenido.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas de 24 GB (RTX 4090, RTX 5090); en GPUs de 16 GB el margen es muy ajustado y no está confirmado en la información disponible.
- Opciones de despliegue: vLLM con `--quantization compressed-tensors --dtype bfloat16`, tal como documenta el autor; no se mencionan llama.cpp, Ollama ni TGI, y el formato compressed-tensors no es directamente compatible con GGUF.
- Latencia y throughput de referencia (medidos en el benchmark HotpotQA, con salidas medias de 4,95 tokens): 0,53 s de latencia media, 0,48 s de P50, 1,93 s de máximo y 9,35 tokens de salida por segundo. Estos valores corresponden a esa configuración concreta y no deben tomarse como throughput de producción con concurrencia alta.

## Comparativa con modelos similares

La información disponible solo permite comparar con el propio modelo base. No se han publicado datos de otros checkpoints comparables.

| Modelo | Parametros | Contexto | Cuantizacion | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HYPR4AI/Gemma-4-12B-it-FP8 | 11.959.730.224 | No disponible | FP8 dinámica (llmcompressor, compressed-tensors) | HotpotQA Distractor [0:500]: EM 65,20%, F1 80,38% | Apache 2.0 (con términos Gemma 4) | HuggingFace, 0 descargas |
| google/gemma-4-12B-it (modelo base) | No disponible en la información (el BF16 ocupa ~23,9 GB) | No disponible | BF16 sin cuantizar | No disponible | Términos de Gemma 4 / Apache 2.0 | HuggingFace (modelo base referenciado) |
| Alternativas de terceros del mismo tamaño | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Al ser un checkpoint cuantizado, el comportamiento puede diferir del modelo original en BF16; el propio autor lo advierte de forma explícita.
- El único benchmark reportado es HotpotQA Distractor `validation[0:500]`, una muestra de 500 ejemplos, y únicamente en modalidad de texto; no hay evidencia publicada sobre visión, audio, código, matemáticas ni tareas de agente.
- La evaluación usa un prompt de sistema muy restrictivo (respuesta más corta posible, copia literal del contexto, sin explicaciones); los resultados no son extrapolables a prompts conversacionales o generativos.
- Idioma: los metadatos del repositorio declaran únicamente inglés. No hay información sobre rendimiento en castellano ni en otros idiomas.
- Longitud de contexto oficial no disponible. El valor de 4096 tokens del ejemplo de vLLM es una configuración de servicio y limitar ese parámetro puede recortar capacidades del modelo si la ventana real es mayor.
- Las capas de visión y audio se excluyen de la cuantización para preservarlas, pero no hay ninguna prueba publicada de que las rutas multimodales funcionen correctamente tras la compresión; para uso de texto se recomienda bloquear entradas multimodales.
- Licencia: aunque el repositorio declara Apache 2.0, al derivar de google/gemma-4-12B-it se aplican los términos de Gemma 4 enlazados por el autor. Es imprescindible revisar esos términos antes de cualquier uso comercial.
- No se han documentado sesgos, tasas de alucinación ni evaluaciones de seguridad; en tareas extractivas el riesgo de respuesta incorrecta es relevante pese al 88,40% de acierto exacto o parcial.
- Repositorio con 0 descargas y 0 likes y subido el 11 de septiembre de 2026: no hay validación comunitaria ni historial de uso en producción.
- El rendimiento medido de 9,35 tokens de salida por segundo corresponde a una configuración concreta de vLLM; no se dispone de datos de throughput con lotes concurrentes ni de escalado multi-GPU.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HYPR4AI/Gemma-4-12B-it-FP8
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Términos de licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Dataset de evaluación: https://huggingface.co/datasets/hotpotqa/hotpot_qa
- Herramienta de cuantización llmcompressor: no disponible en la información proporcionada (no se incluye URL)
- Formato compressed-tensors: no disponible en la información proporcionada (no se incluye URL)
- vLLM: no disponible en la información proporcionada (no se incluye URL)
- Nota sobre la búsqueda web: los resultados devueltos no guardan relación con el modelo (hilos de foro en francés sobre Windows); no se ha encontrado documentación adicional, paper, blog, repositorio de código ni demo asociados a este checkpoint.

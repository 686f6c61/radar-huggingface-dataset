# nielsr/cursor-qwen35-4b-think-hf-hub-qa-v2-glm-53-pi-160-sft-merged

## Resumen

Este repositorio contiene un modelo derivado de Qwen/Qwen3.5-4B obtenido mediante la fusión (merge) de un adaptador LoRA entrenado por nielsr sobre el modelo base. El adaptador original se denomina `cursor-qwen35-4b-think-hf-hub-qa-v2-glm-53-pi-160-lora` y procede de una ejecución de destilación de agente (agent-distill) sobre la tarea `hf-hub-qa`, ejecutada con la herramienta `pi` en su versión 1.6.0. El resultado es un checkpoint completo en formato safetensors listo para cargarse con transformers, sin necesidad de aplicar el adaptador por separado.

El modelo conserva la arquitectura y el tamaño del base: 4.539.265.536 parámetros totales (aproximadamente 4,5 mil millones) y una modalidad declarada de image-text-to-text, lo que sugiere que hereda capacidades multimodales del Qwen3.5-4B original. La etiqueta `qwen3_5` en el repositorio indica que se trata de la generación 3.5 de la familia Qwen, aunque la información disponible no detalla la longitud de contexto ni la composición exacta del entrenamiento.

La relevancia de este checkpoint es acotada: se trata de un experimento de ajuste fino orientado a una tarea concreta (preguntas y respuestas sobre el Hub de Hugging Face) y publicado con cero descargas y cero likes en el momento de la consulta. No es un modelo de propósito general validado, sino una pieza de investigación reproducible que resulta útil para quienes quieran inspeccionar el efecto de la destilación de agente sobre un modelo base pequeño y multimodal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; detalles internos no disponibles) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modalidad | image-text-to-text (segun tags del repositorio) |
| Modelo base | Qwen/Qwen3.5-4B |
| Adaptador fusionado | nielsr/cursor-qwen35-4b-think-hf-hub-qa-v2-glm-53-pi-160-lora |
| Tamano del repositorio | 9,1 GB |
| Libreria | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-4B, un transformer de aproximadamente 4,5 mil millones de parámetros. El repositorio no documenta la configuración interna (número de capas, dimensiones ocultas, mecanismo de atención, uso de atención lineal o híbrida), por lo que estos detalles deben consultarse en la model card del modelo base. La etiqueta `image-text-to-text` indica que el modelo acepta entradas de imagen y texto, coherente con una variante multimodal de la familia Qwen3.5.

El proceso de entrenamiento consistió en un ajuste fino con LoRA sobre el modelo base, seguido de la fusión de los pesos del adaptador en el checkpoint final. El adaptador se generó en una ejecución de destilación de agente (`agent-distill`) con identificador `cursor-qwen35-4b-think-hf-hub-qa-v2-glm-53-pi-160`, sobre la tarea `hf-hub-qa` y con la herramienta `pi` en versión 1.6.0. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF o DPO, ni hiperparámetros del ajuste. El sufijo `think` en el nombre del adaptador sugiere un formato de razonamiento explícito, pero no hay documentación que lo confirme.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado (`text-generation`) y la etiqueta `conversational`.
- Procesamiento de entradas imagen-texto, según la etiqueta `image-text-to-text` heredada del modelo base.
- Respuesta a preguntas sobre el Hub de Hugging Face, que es la tarea específica del ajuste (`hf-hub-qa`).
- Posible modo de razonamiento explícito, inferido del sufijo `think` del adaptador, aunque no documentado.
- Compatibilidad con endpoints de inferencia, indicada por la etiqueta `endpoints_compatible`.
- Soporte de tool calling, agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Consulta automatizada del Hub de Hugging Face: el ajuste está específicamente orientado a responder preguntas sobre modelos, datasets y repositorios del Hub, por lo que puede emplearse como asistente interno para desarrolladores que necesiten localizar recursos sin navegar manualmente.
- Evaluación de técnicas de destilación de agente: el checkpoint sirve como referencia reproducible para investigar cómo un adaptador LoRA entrenado con `agent-distill` modifica el comportamiento de un modelo base pequeño, comparando las respuestas antes y después de la fusión.
- Prototipado de asistentes con entrada multimodal: al heredar la modalidad image-text-to-text del base, puede usarse en experimentos donde el usuario adjunte capturas de pantalla de repositorios o documentación y formule preguntas sobre ellas.
- Base para nuevos ajustes LoRA: al ser un merge completo en safetensors, puede cargarse con transformers y servir como punto de partida para adaptaciones adicionales sobre dominios relacionados con documentación técnica.
- Generación de documentación asistida: integrado en un pipeline que reciba metadatos de repositorios y genere descripciones o resúmenes, aprovechando el ajuste sobre contenido del Hub.
- Investigación sobre formatos de razonamiento: si el sufijo `think` implica un modo de cadena de pensamiento, el modelo permite estudiar la calidad del razonamiento en modelos de 4,5 mil millones de parámetros frente a alternativas mayores.
- Despliegue en entornos con recursos limitados: con 4,5 mil millones de parámetros, es viable en GPUs de consumo para experimentación, siempre que se aplique cuantización adecuada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica, entre 10 y 12 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: en torno a 5-6 GB para los pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 3-4 GB para los pesos, más overhead.
- GPUs recomendadas para FP16: A100 40 GB, H100, L40S o RTX 4090 (24 GB) con margen amplio.
- GPUs de consumo: cabe en RTX 4090, RTX 4080, RTX 3090 y, con cuantización de 8 o 4 bits, en GPUs de 8-12 GB como RTX 4070 o RTX 3060.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para serving en FP16, llama.cpp u Ollama si se generan cuantizaciones GGUF (no publicadas en el repositorio).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nielsr/cursor-qwen35-4b-think-hf-hub-qa-v2-glm-53-pi-160-sft-merged | 4,54 B | no disponible | image-text-to-text | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-4B (base) | ~4,5 B | no disponible | image-text-to-text | no disponible | Hugging Face |
| nielsr/cursor-qwen35-4b-think-hf-hub-qa-v2-glm-53-pi-160-lora (adaptador) | adaptador LoRA sobre 4,5 B | no disponible | image-text-to-text | no disponible | Hugging Face |

La comparación con alternativas de otras familias (Llama, Gemma, Phi) no puede completarse con datos verificables en la información proporcionada, ya que no se dispone de cifras de rendimiento ni de especificaciones del base Qwen3.5-4B más allá del recuento de parámetros.

## Limitaciones y advertencias

- El ajuste está especializado en la tarea `hf-hub-qa`; fuera de ese dominio es probable que el rendimiento sea inferior al del modelo base sin ajustar.
- No hay información sobre sesgos, datos de entrenamiento ni procesos de alineación, por lo que no puede evaluarse el riesgo de sesgo de forma fundamentada.
- Riesgo de alucinación inherente a un modelo de 4,5 mil millones de parámetros ajustado sobre un dominio estrecho; las respuestas sobre repositorios o metadatos deben verificarse contra la fuente.
- La licencia no está declarada en el repositorio, lo que impide confirmar si el uso comercial está permitido; debe consultarse la licencia del modelo base Qwen/Qwen3.5-4B antes de cualquier despliegue en producción.
- No se documentan los idiomas soportados; el comportamiento multilingüe es incierto.
- El repositorio presenta cero descargas y cero likes, sin validación externa conocida; no debe tratarse como un modelo listo para producción.
- El tamaño del repositorio (9,1 GB) es coherente con pesos en FP16/BF16; no se ofrecen cuantizaciones oficiales, lo que obliga a generarlas localmente si se necesita reducir VRAM.
- La fusión de un LoRA puede degradar capacidades generales del modelo base; no se han publicado evaluaciones comparativas que cuantifiquen esa posible pérdida.

## Enlaces

- Repositorio del modelo fusionado: https://huggingface.co/nielsr/cursor-qwen35-4b-think-hf-hub-qa-v2-glm-53-pi-160-sft-merged
- Adaptador LoRA original: https://huggingface.co/nielsr/cursor-qwen35-4b-think-hf-hub-qa-v2-glm-53-pi-160-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B

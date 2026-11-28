# samyhaff/gemma-4-e2b-it-grpo-ed

## Resumen

gemma-4-e2b-it-grpo-ed es un modelo especializado en desambiguación de entidades (entity disambiguation, ED) desarrollado por Samy Haffoudhi, investigador vinculado a la publicación "When Does Reasoning Help Entity Disambiguation? Small LLMs In-Domain and Under Shift" (Findings of EACL 2027). Parte de google/gemma-4-E2B-it, un modelo multimodal de la familia Gemma 4 con aproximadamente 5.100 millones de parámetros, y se ha ajustado mediante LoRA (fusionado posteriormente) con aprendizaje por refuerzo verificable (RLVR) usando GRPO sobre el conjunto de datos ZELDA.

El modelo resuelve un problema concreto: dado un texto con una mención marcada entre corchetes y una lista numerada de candidatos con sus descripciones, el modelo razona y devuelve el índice del candidato correcto en formato `"answer": <índice>`. Su relevancia radica en que demuestra que modelos pequeños ajustados con RL pueden competir en tareas de linking de entidades, alcanzando 79,2 de accuracy en ZELDA y 69,7 de accuracy normalizada en ZESHEL en régimen de zero-shot real.

El modelo está pensado para integrarse en pipelines de entity linking como un componente de reranking/desambiguación tras un recuperador de candidatos (en el paper se usan los top-10 de qwen3-4b-reranker-ed). Es un modelo de nicho, con licencia Apache 2.0, orientado a investigación y a sistemas de extracción de información estructurada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (familia Gemma 4, base google/gemma-4-E2B-it); ajuste LoRA fusionado con GRPO |
| Parametros totales | 5.123.178.051 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización posible vía herramientas estándar como llama.cpp o GPTQ/AWQ, no documentada por el autor) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de google/gemma-4-E2B-it, un transformer decoder-only de la familia Gemma 4 con capacidades multimodales (el pipeline tag del repo base es image-text-to-text). Sobre esa base se aplicó un ajuste LoRA que posteriormente se fusionó en los pesos finales, de modo que el artefacto publicado es un modelo denso estándar cargable con transformers.

El entrenamiento utiliza RLVR (Reinforcement Learning with Verifiable Rewards) mediante GRPO sobre el dataset ZELDA, con una recompensa que premia la selección del candidato correcto. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas previas de SFT o DPO. La innovación principal es el uso de razonamiento explícito (thinking mode) combinado con votación por mayoría sobre 10 muestras para estabilizar la respuesta final.

## Capacidades

- Desambiguación de entidades: dado un texto con una mención marcada entre `[` `]` y una lista numerada de candidatos con descripciones, devuelve el índice del candidato correcto.
- Razonamiento explícito: el modelo genera una cadena de razonamiento antes de emitir la respuesta final en formato `"answer": <índice>`.
- Modo thinking activable mediante `chat_template_kwargs={"enable_thinking": True}`.
- Capacidades multimodales heredadas del modelo base (image-text-to-text), aunque no se documenta su uso en la tarea objetivo.
- Generación de texto conversacional (pipeline text-generation).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no documentado específicamente; el razonamiento se limita a la tarea de desambiguación.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Desambiguación de entidades en pipelines de extracción de información: se usa como etapa final tras un recuperador de candidatos (por ejemplo, los top-10 de qwen3-4b-reranker-ed), recibiendo la mención en contexto y la lista de candidatos para devolver el índice correcto.
- Enlazado de entidades en bases de conocimiento: integrado en sistemas que construyen grafos de conocimiento a partir de texto no estructurado, donde es necesario mapear menciones a entidades de un KB como Wikidata.
- Análisis de noticias y monitorización de medios: resolución de menciones ambiguas (personas, organizaciones, lugares) en titulares y cuerpos de artículo para alimentar sistemas de seguimiento temático.
- Búsqueda semántica y motores de respuesta: mejora de la precisión de resultados cuando las consultas contienen nombres ambiguos que deben resolverse contra un catálogo de entidades.
- Procesamiento de documentos legales o financieros: desambiguación de nombres de personas y empresas en contratos, informes y registros donde la homonimia es frecuente.
- Investigación académica en NLP: reproducción y extensión de los experimentos del paper sobre cuándo el razonamiento ayuda en ED, tanto en dominio como bajo distribución shift.
- Enriquecimiento de datasets para entrenamiento: generación de etiquetas de entity linking de alta calidad para corpus anotados de forma automática.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado |
|---|---|---|
| ZELDA | Accuracy | 79,2 |
| ZESHEL | Accuracy normalizada (true zero-shot) | 69,7 |

No se han publicado en la información disponible resultados comparativos con otros modelos en estos mismos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 10-11 GB para los 5.100 millones de parámetros.
- VRAM estimada en cuantización de 8 bits: en torno a 5-6 GB.
- VRAM estimada en cuantización de 4 bits: en torno a 3-4 GB.
- GPU recomendadas: A100, H100 o L40S para despliegue en producción con FP16 y throughput alto; RTX 4090, RTX 3090 o RTX 4080 para inferencia en FP16 en una sola GPU.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más en FP16 (RTX 3060 12 GB, RTX 4070, RTX 4090); en 4 bits cabe en GPUs de 8 GB.
- Opciones de despliegue: vLLM (el ejemplo del autor lo usa con `LLM` y `SamplingParams`), transformers, TGI; llama.cpp u Ollama requerirían conversión a GGUF no documentada por el autor.
- Latencia y throughput: no disponibles. El uso recomendado implica 10 muestras por consulta con hasta 2048 tokens de generación, lo que multiplica el coste computacional por consulta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| samyhaff/gemma-4-e2b-it-grpo-ed | 5.123 M | no disponible | Entity disambiguation con razonamiento | apache-2.0 |
| google/gemma-4-E2B-it | no disponible | no disponible | Modelo base multimodal generalista | no disponible en la información |
| samyhaff/qwen3-4b-reranker-ed | ~4.000 M (Qwen3-4B) | no disponible | Reranking de candidatos para ED | no disponible en la información |

La comparativa de rendimiento entre estos modelos no está disponible en la información proporcionada; el paper del autor evalúa el pipeline completo usando ambos modelos de forma complementaria (reranker + desambiguador).

## Limitaciones y advertencias

- Modelo de nicho: está entrenado exclusivamente para desambiguación de entidades con el formato de prompt específico del autor; fuera de esa tarea su comportamiento no está caracterizado.
- Requiere votación por mayoría sobre 10 muestras para obtener el resultado reportado, lo que incrementa el coste de inferencia y la latencia.
- Depende de la calidad de la lista de candidatos: si el candidato correcto no está en la shortlist, el modelo no puede acertar.
- Riesgo de alucinación en el razonamiento intermedio; la respuesta se extrae mediante regex del campo `"answer"`, por lo que formatos inesperados pueden descartarse.
- Idiomas soportados no documentados; el rendimiento en idiomas distintos del inglés no está evaluado.
- Sesgos heredados del modelo base google/gemma-4-E2B-it y del dataset ZELDA, no analizados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener condiciones adicionales que deben verificarse.
- Solo 321 descargas y 1 like en el momento de la consulta: ecosistema pequeño, poca validación externa.
- No se documentan longitudes de contexto máximas ni límites de tokens de entrada para la lista de candidatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/samyhaff/gemma-4-e2b-it-grpo-ed
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Paper: https://arxiv.org/abs/2611.30334
- Repositorio del pipeline y evaluación: https://github.com/samyhaff/ed-study
- Reranker complementario: https://huggingface.co/samyhaff/qwen3-4b-reranker-ed

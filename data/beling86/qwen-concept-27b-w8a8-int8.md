# Beling86/Qwen-Concept-27B-W8A8-INT8

## Resumen

Qwen-Concept-27B-W8A8-INT8 es una cuantización INT8 del modelo Qwen/Qwen-Concept-27B, publicada por el usuario Beling86 en Hugging Face. Se trata de un checkpoint de solo inferencia generado con vLLM LLM-Compressor mediante técnicas SmoothQuant y GPTQ, orientado a despliegues de alta concurrencia sobre GPUs con soporte de Tensor Cores INT8 (CUTLASS y Marlin). El objetivo es reducir la huella de memoria aproximadamente un 48 % (28,3 GB frente a 54 GB en BF16) manteniendo una perplejidad cercana a FP16.

El modelo base pertenece a la familia Qwen y emplea una arquitectura híbrida con atención clásica y capas Recurrent DeltaNet, además de cabezas MTP (multi-token prediction). El checkpoint real contiene 21.489.245.920 parámetros en safetensors, aunque la nomenclatura comercial del modelo base lo etiqueta como "27B". La licencia es Apache 2.0 y el formato de pesos es safetensors con metadatos compressed-tensors.

Su relevancia actual radica en que permite servir un modelo de gran contexto (hasta 131.072 tokens según el ejemplo de despliegue del autor) en hardware más modesto que su versión BF16, con kernels INT8 maduros en vLLM. No obstante, el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no incluye resultados de benchmarks ni evaluación de calidad publicados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención y capas Recurrent DeltaNet, cabezas MTP (según la model card) |
| Parámetros totales | 21.489.245.920 (dato real de safetensors) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (según el comando de ejemplo de vLLM del autor) |
| Tipos de cuantización | W8A8 INT8 (CUTLASS), W8A16 (Marlin), BF16 preservado en normas, embeddings y LM Head |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, 8-bit) |

## Arquitectura y entrenamiento

El modelo base Qwen-Concept-27B combina capas de atención con capas Recurrent DeltaNet, una variante de estado recurrente lineal, e incorpora cabezas MTP para predicción multi-token. La cuantización se aplica de forma selectiva: aproximadamente el 72 % de las proyecciones (atención `q_proj`, `k_proj`, `v_proj`, `o_proj`, proyecciones DeltaNet `in_proj_qkv` e `in_proj_z`, y proyecciones MLP `gate_proj`, `up_proj` y cabezas MTP) usan pesos INT8 con cuantización dinámica por token de las activaciones (W8A8). El 28 % restante, correspondiente a `down_proj` y a la `out_proj` de DeltaNet, se mantiene en W8A16 con kernel Marlin para evitar la amplificación de ruido de cuantización en los flujos residuales. Las normas RMS, los embeddings, las matrices recurrentes A/B de DeltaNet (`in_proj_a`, `in_proj_b`) y el LM Head se conservan en BF16.

El proceso de cuantización se realizó con vLLM LLM-Compressor usando SmoothQuant y GPTQ, calibrado sobre 128 muestras de alta calidad de contexto largo (4096 tokens). No se dispone de información sobre los datos de entrenamiento originales del modelo base, el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO. Tampoco se detalla la innovación de decodificación especulativa más allá de la existencia de cabezas MTP en la arquitectura.

## Capacidades

- Generación de texto conversacional en formato chat, según el pipeline declarado (`text-generation`, etiqueta `conversational`).
- Procesamiento de contexto largo de hasta 131.072 tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Razonamiento multi-paso y tareas de instrucciones generales, heredadas del modelo base Qwen-Concept-27B.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas explícitamente en la información disponible.
- Capacidades multilingües: no disponibles; no se especifican idiomas soportados.
- Capacidades de visión o audio: no disponibles.
- Modo thinking explícito: no disponible en la información proporcionada.
- Inferencia acelerada con kernels INT8 CUTLASS y Marlin en vLLM.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de hasta 131.072 tokens, manteniendo el historial completo de la conversación sin truncamiento.
- Procesamiento de documentos extensos: resumen, extracción de entidades y respuesta a preguntas sobre contratos, informes o expedientes que superen los 100.000 tokens en una sola pasada.
- Despliegue de alto rendimiento en producción: al usar W8A8 INT8 con kernels CUTLASS y Marlin, permite servir más réplicas por GPU y reducir costes de infraestructura frente a la versión BF16.
- Asistentes de código y revisión técnica: generación y explicación de código en pipelines de CI/CD, siempre que se valide el soporte real de tool calling en pruebas propias.
- Análisis de repositorios y bases de código: indexación y consulta sobre grandes volúmenes de código fuente aprovechando el contexto extendido.
- Chatbots internos sobre bases de conocimiento corporativas: integración con RAG donde el contexto largo reduce la necesidad de recortar fragmentos recuperados.
- Investigación y evaluación de cuantizaciones: útil como referencia para estudiar el impacto de W8A8 selectivo frente a BF16 en modelos híbridos con DeltaNet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente afirma que la cuantización ofrece una perplejidad cercana a FP16 y una reducción de memoria de aproximadamente el 48 % (28,3 GB frente a 54 GB en BF16), sin cifras concretas de MMLU, HumanEval, GSM8K ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 28,3 GB de pesos en el checkpoint; con overhead de KV cache y activaciones, se recomienda al menos 40-48 GB de VRAM para contextos largos.
- GPUs recomendadas: A100 80 GB, H100 80 GB, L40S 48 GB y GPUs con soporte de Tensor Cores INT8 (CUTLASS/Marlin).
- GPUs de consumo: una RTX 4090 de 24 GB no cabe con el checkpoint completo en una sola GPU; sería necesario tensor parallelism o cuantizaciones adicionales no incluidas en este repositorio.
- Opciones de despliegue: vLLM es el motor principal soportado, con `--dtype bfloat16`, `--max-model-len 131072`, `--enable-prefix-caching`, `--enable-chunked-prefill` y `--gpu-memory-utilization 0.95`. Otros motores (llama.cpp, Ollama, TGI) no están confirmados para este formato compressed-tensors INT8.
- Latencia y throughput estimados: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Concept-27B-W8A8-INT8 (este) | 21,49 B (safetensors) | 131.072 tokens | W8A8/W8A16 INT8 | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen-Concept-27B (base) | no disponible en la información | no disponible | BF16 | Apache 2.0 | Hugging Face |
| Otras cuantizaciones del mismo base | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con alternativas de otros desarrolladores (por ejemplo, Llama, Mistral o Gemma) en parámetros, contexto o rendimiento, por lo que la comparativa se limita al modelo base y a variantes del mismo.

## Limitaciones y advertencias

- No se han publicado evaluaciones de calidad ni benchmarks que verifiquen la degradación real frente al modelo BF16; la afirmación de "perplejidad cercana a FP16" no está cuantificada.
- Riesgo de alucinación inherente a los modelos generativos; no hay datos específicos de evaluación de fidelidad.
- Sesgos conocidos: no disponibles; el autor no documenta sesgos del modelo base ni de la cuantización.
- Idiomas soportados no especificados; no se garantiza un rendimiento multilingüe equilibrado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia y las condiciones del modelo base Qwen/Qwen-Concept-27B.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-11), por lo que no hay evidencia de validación comunitaria ni de estabilidad en producción.
- El formato compressed-tensors INT8 limita la portabilidad: fuera de vLLM con kernels CUTLASS/Marlin, el soporte puede ser inexistente o degradado.
- El contexto de 131.072 tokens exige una gestión cuidadosa de la KV cache; en GPUs de 48 GB puede requerir límites de contexto menores o tensor parallelism.
- No se confirma soporte de tool calling, agentes ni modo thinking; deben validarse empíricamente antes de diseñar flujos de producción que dependan de ellos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Beling86/Qwen-Concept-27B-W8A8-INT8
- Modelo base: https://huggingface.co/Qwen/Qwen-Concept-27B
- vLLM: https://github.com/vllm-project/vllm
- LLM-Compressor: https://github.com/vllm-project/llm-compressor
- compressed-tensors: https://github.com/neuralmagic/compressed-tensors
- SmoothQuant (paper): https://arxiv.org/abs/2211.10438
- GPTQ (paper): https://arxiv.org/abs/2210.17323

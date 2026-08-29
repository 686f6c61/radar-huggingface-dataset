# Akicou/Qwen3.8-Flash-Next-REAM-60Pct

## Resumen

El modelo `Akicou/Qwen3.8-Flash-Next-REAM-60Pct` es una versión comprimida del modelo Qwen3.8-Flash-Next de Alibaba, generada mediante el framework REAM (Router Expert Activation Merging), un método de compresión de modelos de mezcla de expertos (MoE) inspirado en REAM/REAP. El autor, Akicou, ha aplicado esta técnica para reducir el número de expertos enrutados por capa de 512 a 308, eliminando el 40% de los expertos, manteniendo intactos los expertos compartidos, la atención, los n-gram embeddings y las capas densas. El resultado es un modelo con 128.789.193.600 parámetros totales (aproximadamente 128,8 mil millones), que conserva la arquitectura base de Qwen3.8-Flash-Next, la cual emplea una atención híbrida GDN + QSA y un total de 125B parámetros principales más 51B de n-gram embeddings, con 6B parámetros activados por token en su versión original.

Este lanzamiento es experimental y no ha sido sometido a benchmarks públicos. Su relevancia radica en explorar la viabilidad de comprimir modelos MoE de gran escala mediante fusión de expertos, reduciendo potencialmente los requisitos de memoria y cómputo sin necesidad de reentrenamiento. Está orientado a la investigación y evaluación de técnicas de compresión, más que a un uso productivo inmediato. El modelo se distribuye en formato safetensors y requiere `trust_remote_code=True` para su carga, igual que el modelo base.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture-of-experts) basada en Qwen3.8-Flash-Next; arquitectura original con atención híbrida GDN + QSA |
| Parametros totales | 128.789.193.600 (~128,8B) |
| Parametros activos | no disponible (el modelo base tiene 6B activos por token, pero no se confirma para esta versión) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el código de uso carga en bfloat16) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se genera mediante el framework REAM, que realiza una compresión post-entrenamiento sobre Qwen3.8-Flash-Next. El proceso comienza con una calibración sobre un conjunto de prompts hardcoded integrado en el framework. A continuación, los expertos enrutados se agrupan según una similitud gated que combina la mitad de la representación de hidden states y la mitad de la distribución del router. Los expertos agrupados se fusionan mediante un promedio ponderado por saliency, eliminando el 40% de los expertos enrutados: cada capa pasa de 512 a 308 expertos. El router se reduce de forma correspondiente, conservando únicamente las filas centroides. Los expertos compartidos, la atención, los n-gram embeddings y las capas densas no se modifican. El proceso se ejecutó con 6× NVIDIA H100 SXM 80GB, usando 100 muestras de calibración con una longitud máxima de secuencia de 512 tokens y un máximo de 2048 tokens de generación. No se ha realizado ningún entrenamiento adicional ni fine-tuning; se trata exclusivamente de una compresión basada en fusión de expertos.

## Capacidades

- Generación de texto en inglés, con orientación conversacional (según los tags del modelo).
- Inferencia mediante la API de transformers, con soporte para generación autoregresiva estándar.
- Compatible con pipelines de text-generation de Hugging Face.
- No se especifican capacidades multimodales, a pesar de que el modelo base Qwen3.8-Flash-Next es multimodal; la model card de esta versión comprimida solo indica text-generation.
- No se documenta soporte para tool calling, function calling, razonamiento multi-paso ni modos de pensamiento explícitos.
- El modelo requiere `trust_remote_code=True` para su carga, lo que implica ejecución de código remoto.

## Casos de uso

- Investigación en compresión de modelos MoE: permite estudiar el impacto de la fusión de expertos en la calidad de generación, comparando con el modelo base.
- Evaluación de técnicas de merging de expertos: sirve como banco de pruebas para medir la degradación de rendimiento tras eliminar el 40% de los expertos enrutados.
- Prototipado de sistemas de generación de texto en inglés en entornos académicos, donde el coste de inferencia es secundario frente a la experimentación.
- Análisis de la reducción de memoria y cómputo: al tener menos expertos, el modelo podría requerir menos recursos que el base, aunque no se han publicado cifras concretas.
- Comparación de arquitecturas de atención híbrida (GDN + QSA) en un contexto de MoE comprimido, para estudiar la interacción entre atención y mezcla de expertos.
- Desarrollo de herramientas de calibración y compresión de modelos, utilizando este modelo como caso de estudio del framework REAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el modelo no ha sido evaluado ("It has not been benchmarked"). No se proporcionan métricas como MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- El modelo tiene 128,8B parámetros. En bfloat16 (2 bytes por parámetro), el peso ocupa aproximadamente 257,6 GB, lo que coincide con el tamaño del repositorio.
- Para inferencia en bfloat16 se necesitarían al menos 4× NVIDIA H100 80GB (320 GB) o 8× A100 80GB (640 GB) para alojar los pesos y los estados intermedios, aunque no se han publicado requisitos oficiales.
- No se dispone de información sobre cuantizaciones (GGUF, AWQ, GPTQ) que permitan reducir la huella de memoria para GPUs de consumo.
- El modelo se puede cargar con `device_map="auto"` en transformers, lo que distribuye los pesos entre las GPUs disponibles.
- No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI; el único método documentado es transformers con `trust_remote_code=True`.
- Dado el tamaño, no es viable en GPUs de consumo (RTX 4090, etc.) sin cuantización agresiva, que no está disponible públicamente.

## Comparativa con modelos similares

La comparación más directa es con el modelo base Qwen3.8-Flash-Next, del cual deriva. No se dispone de información sobre otros modelos comprimidos con REAM para comparar.

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | 125B + 51B n-gram | 6B | no disponible | no disponible | oficial, con benchmarks |
| Akicou/Qwen3.8-Flash-Next-REAM-60Pct | 128,8B | no disponible | no disponible | no disponible | experimental, sin benchmarks |

No se han encontrado otros modelos de compresión MoE comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: no ha sido sometido a benchmarks, por lo que se desconoce su calidad real de generación y su posible degradación frente al base.
- Solo soporta inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- Licencia no disponible: no se puede determinar si es apto para uso comercial o si tiene restricciones.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código arbitrario del repositorio; supone un riesgo de seguridad si no se audita el código.
- La compresión elimina el 40% de los expertos enrutados, lo que puede afectar a la capacidad de razonamiento y a la coherencia en tareas complejas, aunque no se ha cuantificado.
- No se proporcionan instrucciones de despliegue en entornos de producción ni soporte oficial por parte de Qwen.
- El tamaño del modelo (128,8B) sigue siendo muy elevado, limitando su uso a infraestructuras con múltiples GPUs de alta gama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Akicou/Qwen3.8-Flash-Next-REAM-60Pct
- Framework REAM (GitHub): https://github.com/Akicou/ream
- Modelo base Qwen3.8-Flash-Next (Hugging Face): https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio oficial de Qwen3.8-Flash-Next (GitHub): https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Recetas vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Página en AI Wiki: https://aiwiki.ai/wiki/qwen3_8_flash_next
- Artículo en OpenLM.ai: https://openlm.ai/qwen3.8/

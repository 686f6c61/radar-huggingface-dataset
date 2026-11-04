# darioooooo0o/LFM3-1.7B-Base-KV800

## Resumen

LFM3-1.7B-Base-KV800 es un adaptador LoRA (formato PEFT) publicado por el usuario darioooooo0o sobre el modelo base LiquidAI/LFM3-1.7B-Base. No se trata de un modelo nuevo, sino de un complemento que habilita el uso de un formato de caché KV comprimido denominado "800h", capaz de almacenar aproximadamente 800 bytes por token en lugar de los 12.288 bytes habituales en bf16, lo que supone una reducción de aproximadamente 15x en el estado por secuencia. El repositorio también documenta kernels de decodificación (SYCL, Triton y torch puro), un plugin para vLLM y un hook de entrenamiento que aplica la misma caché comprimida durante el forward de SFT/RL.

El problema que aborda es la limitación de memoria en la generación de rollouts para RL (por ejemplo, GRPO) sobre GPUs de consumo o de una sola tarjeta. Según la model card, en una Intel Arc Pro B70 de 32 GB, vLLM estándar admite 27 secuencias concurrentes de 32K tokens, mientras que con la caché 800h se alcanzan 398 secuencias residentes, con un throughput medido de 5.124 tok/s frente a 431 tok/s del stock. El adaptador LoRA incluido es una "recovery LoRA" entrenada con la caché en el bucle, que según el autor cierra el 40 % de la brecha de calidad en una prueba de 3,5 minutos.

La relevancia actual reside en que permite personalizar un modelo base pequeño (1,7B parámetros) con SFT y RL en una única GPU de 24-32 GB, sin necesidad de infraestructura multigpu ni cloud. El modelo base LFM3-1.7B-Base es un transformer híbrido de LiquidAI con 24 capas, de las cuales 13 son convoluciones cortas y 5 son ventanas deslizantes de 256 tokens, de modo que solo 6 capas mantienen una caché que crece con la longitud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre LFM3-1.7B-Base (transformer híbrido: 13 capas de convolución corta, 5 capas de ventana deslizante de 256 tokens, 6 capas con caché KV creciente) |
| Parametros totales | 1,7B (modelo base); tamaño del adaptador no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (contexto evaluado en la model card; contexto nativo del base no disponible) |
| Tipos de cuantizacion | Pesos base en bf16 según los resultados reportados; cuantizaciones del adaptador no disponibles |
| Idiomas soportados | No disponible |
| Licencia | lfm1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | safetensors (adaptador PEFT); pesos base no incluidos |

## Arquitectura y entrenamiento

El adaptador se aplica sobre LFM3-1.7B-Base, un modelo híbrido en el que la mayor parte de las capas (13 convoluciones cortas y 5 ventanas deslizantes de 256 tokens) mantiene un estado fijo independientemente de la longitud del contexto. Solo 6 capas presentan una caché KV que crece con la secuencia, y es sobre esas capas donde actúa el formato 800h, reduciendo el estado por token de 12.288 a aproximadamente 800 bytes (819,2 bytes asignados según vLLM). El estado por secuencia a 32K pasa de unos 680 MB en stock a unos 50 MB con 800h.

El adaptador LoRA incluido se entrenó con la caché comprimida activa en el bucle de entrenamiento, con el objetivo de que el modelo se adapte a la representación comprimida y cierre parte de la brecha de calidad introducida por la compresión. Según la model card, se trata de una "recovery LoRA" de 3,5 minutos que cierra el 40 % de la brecha. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. El repositorio incluye además kernels de decodificación en SYCL (Intel XMX), Triton y torch puro, un plugin para vLLM 0.32 y un hook de entrenamiento (`patch_for_training(model, mode="800h")`) que garantiza que el sampler y el trainer calculen las mismas probabilidades, evitando actualizaciones off-policy en RL.

## Capacidades

- Generación de texto sobre el modelo base LFM3-1.7B-Base, sin ajuste de chat ni de seguridad (modelo base).
- Inferencia con caché KV comprimida 800h mediante plugin de vLLM (`vllm serve` y `LLM()`), con hasta 398 secuencias concurrentes de 32K tokens en una GPU de 32 GB.
- Entrenamiento SFT y RL (GRPO o similar) con la misma caché comprimida en el forward, mediante el hook `lfm3_kv800.train`.
- Decodificación con kernels SYCL para Intel XMX, con alternativas Triton y torch puro para otras GPU (verificado en NVIDIA T4, sin optimizar).
- Personalización mediante LoRA sobre el modelo base, incluyendo el adaptador de recuperación incluido.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Entrenamiento por RL en una sola GPU: el modelo permite ejecutar GRPO con lotes grandes de rollouts (por ejemplo, 64 prompts × 16 muestras) en una única tarjeta de 24-32 GB, reduciendo el tiempo de rollouts por paso de unos 39 minutos a unos 3,3 minutos según las cifras derivadas de la model card.
- SFT de tareas específicas con adaptación a caché comprimida: el hook de entrenamiento permite que el modelo aprenda la tarea y el formato de caché 800h simultáneamente, partiendo opcionalmente del adaptador de recuperación incluido.
- Servicio de inferencia de contexto largo en hardware Intel: el plugin de vLLM con kernels SYCL permite desplegar 398 secuencias de 32K tokens en una Intel Arc Pro B70, adecuado para tareas de documentos largos o repositorios de código.
- Evaluación de agentes multi-turno con trazas largas: la reducción del estado por secuencia a unos 50 MB a 32K facilita mantener muchas conversaciones o razonamientos largos residentes en memoria.
- Investigación en compresión de caché KV: el repositorio proporciona kernels, plugin y hook de entrenamiento para reproducir y extender el formato 800h sobre otras arquitecturas o GPUs.
- Prototipado de funciones de recompensa en RL: al ser un modelo base de 1,7B con entrenamiento corto, permite iterar sobre la recompensa y observar el comportamiento en la misma jornada.
- Despliegue en GPUs NVIDIA con fallback Triton/torch: aunque no optimizado, los kernels funcionan correctamente en T4, lo que permite validar el flujo antes de migrar a hardware Intel.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los datos de rendimiento reportados son de memoria y throughput:

| Metrica (Intel Arc Pro B70 32 GB, vLLM 0.32, bf16) | Stock vLLM | 800h |
|---|---|---|
| KV que crece con la longitud | 12.288 B/token | 800 B/token (819,2 asignados) |
| KV por petición de 32.832 tokens | 678 MB | 50 MB |
| Peticiones concurrentes de 32K (pool KV de 21,6 GiB) | 27 (máximo declarado por vLLM; 33 en régimen estable) | 398 medidas, todas residentes, 0 preventivas |
| Throughput a 32K | 431 tok/s con 27 secuencias | 5.124 tok/s con 398 secuencias (11,9x) |

## Requisitos de hardware

- VRAM estimada para inferencia: una GPU de 24-32 GB permite servir el modelo de 1,7B con LoRA y caché 800h; el pool KV de 21,6 GiB en la B70 de 32 GB aloja 398 secuencias de 32K.
- GPU recomendadas: Intel Arc Pro B70 de 32 GB (probado y optimizado con SYCL); NVIDIA T4 (verificado con Triton/torch, sin optimizar).
- Cabe en GPU de consumo: sí, según la model card el modelo con LoRA entrena cómodamente junto al sampler en una GPU única de 24-32 GB.
- Opciones de despliegue: vLLM 0.32 con el plugin `lfm3_kv800.plugin` (`vllm serve` o `LLM()`); kernels SYCL, Triton y torch puro del repositorio; no se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: medidos 5.124 tok/s con 398 secuencias de 32K en B70; 431 tok/s con 27 secuencias en stock. No se reportan latencias por petición.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de la misma categoría. La comparación interna disponible es entre vLLM estándar y la caché 800h sobre el mismo modelo base, recogida en la sección de benchmarks.

## Limitaciones y advertencias

- El adaptador no incluye los pesos base; es necesario descargar LiquidAI/LFM3-1.7B-Base por separado.
- La licencia lfm1.0 ("other") puede imponer restricciones al uso comercial; es necesario revisar el archivo LICENSE del repositorio y las condiciones de LiquidAI antes de desplegar en producción.
- El adaptador de recuperación cierra solo el 40 % de la brecha de calidad introducida por la compresión, según la model card; la calidad con caché 800h no es idéntica a la del modelo con caché completa.
- Los kernels Triton y torch funcionan en NVIDIA T4 pero no están optimizados; el rendimiento en GPUs no Intel puede ser muy inferior al reportado.
- El modelo base no tiene ajuste de chat ni de seguridad, por lo que puede generar contenido inapropiado o sesgado sin filtros adicionales.
- No se documentan idiomas soportados ni evaluación multilingüe.
- Riesgo de alucinación inherente a un modelo base de 1,7B; no se han publicado evaluaciones de fidelidad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo figura como 0.0 GB, lo que sugiere que los archivos pueden no estar completamente subidos o que la métrica no se ha actualizado.
- El ejemplo de GRPO con TRL en modo colocate está marcado como no probado en la propia model card.
- Las cifras de ahorro de tiempo en RL son derivadas de mediciones de throughput, no de una ejecución de RL completa medida.

## Enlaces

- HuggingFace: https://huggingface.co/darioooooo0o/LFM3-1.7B-Base-KV800
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Repositorio de código: https://github.com/riceharvest/lfm3-kv800
- Paper referenciado (arxiv:2402.02750): https://arxiv.org/abs/2402.02750
- Paper referenciado (arxiv:2404.00456): https://arxiv.org/abs/2404.00456
- Paper referenciado (arxiv:2309.17453): https://arxiv.org/abs/2309.17453
- Paper referenciado (arxiv:2406.03482): https://arxiv.org/abs/2406.03482
- Licencia LFM1.0: https://huggingface.co/darioooooo0o/LFM3-1.7B-Base-KV800/blob/main/LICENSE

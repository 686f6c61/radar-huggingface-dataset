# darioooooo0o/Qwen3.6-35B-A3B-TinyKV-GPTQ-Int4

## Resumen

Qwen3.6-35B-A3B-TinyKV-GPTQ-Int4 es una cuantización GPTQ de 4 bits del checkpoint Qwen3.6-35B-A3B-TinyKV, publicado por el usuario darioooooo0o (autor que firma como @imdariotoo en X). El modelo parte del Qwen3.6-35B-A3B original de Qwen (licencia Apache-2.0) y le aplica la modificación TinyKV: un reentrenamiento de sus 10 capas de atención completa que reduce el coste de la KV cache en aproximadamente 2,5 veces, lo que permite sostener contextos mucho más largos sobre el mismo hardware. Sobre esa base se monta la cuantización GPTQ Int4 de palmfuture (expertos enrutados en int4, resto en bf16) y se dejan sin cuantizar exactamente esas 10 capas de atención convertidas.

El interés práctico está en la combinación de tres factores: un MoE de unos 36.200 millones de parámetros totales con aproximadamente 3.000 millones activos por token, un peso en disco de unos 21 GB que cabe en GPUs de clase 24 GB, y una capacidad de KV cache de 6,12 millones de tokens medida en una RTX PRO 6000 con `max_model_len=32768`, frente a los 2,55 millones del GPTQ Int4 estándar (2,40×). Es, por tanto, una pieza pensada para despliegues de contexto largo en una sola GPU, no para entrenamiento ni para servir en paralelo con tensor parallelism.

La relevancia es doble: por un lado demuestra que se puede recortar agresivamente el coste de memoria del KV cache retocando solo una fracción de las capas de atención; por otro, sirve como base declarada para una compilación con vLLM sobre Intel Arc Pro B70 (XPU, kernels de atención con head-128), cuyo chequeo todavía está pendiente según la model card. El repositorio tiene 0 descargas y 0 likes, y fue creado el 25 de octubre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), con 10 capas de atención completa reentrenadas mediante TinyKV; el resto de capas sigue el diseño del Qwen3.6-35B-A3B original (no detallado en la información disponible) |
| Parámetros totales | 36.228.127.600 (~36,2 B, dato real de safetensors) |
| Parámetros activos | ~3 B (deducido del sufijo A3B del nombre; no confirmado explícitamente en la model card) |
| Longitud de contexto | 131.072 tokens en el ejemplo de despliegue (`--max-model-len 131072`); el contexto efectivo depende de la VRAM disponible para KV cache |
| Tipos de cuantización | GPTQ Int4: expertos enrutados en int4, resto de pesos en bf16; las 10 capas de atención TinyKV quedan explícitamente sin cuantizar. Existe una versión GGUF en repositorio aparte |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (GPTQ); GGUF en `darioooooo0o/Qwen3.6-35B-A3B-TinyKV-GGUF` |

## Arquitectura y entrenamiento

El modelo es un MoE con 36.228 millones de parámetros totales del que se activan del orden de 3.000 millones por token, según la nomenclatura A3B del checkpoint base. La intervención TinyKV consiste en reentrenar únicamente las 10 capas de atención completa del modelo para que su KV cache ocupe aproximadamente 2,5 veces menos; el resto de la red no se toca. Sobre esa base se ha aplicado la cuantización GPTQ Int4 de palmfuture, cuyos shards se reutilizan sin cambios, mientras que las 10 capas de atención convertidas se inyectan en bf16 desde `tinykv-patch.safetensors`; la configuración de cuantización excluye exactamente esas capas. El resultado se empaqueta con un plugin de vLLM que registra la arquitectura TinyKV.

No se detallan en esta model card el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO; la card remite a la ficha del modelo principal (`darioooooo0o/Qwen3.6-35B-A3B-TinyKV`) para la receta de conversión, el proceso de entrenamiento y las tablas completas de calidad. Tampoco se documenta en esta página qué tipo de atención usan las capas no reentrenadas. La innovación destacable es, por tanto, el recorte de KV cache por reentrenamiento selectivo de capas de atención, más un ruido de cuantización medido explícitamente: 0,1032 de diferencia media absoluta de log-probabilidad frente a la referencia bf16 en PyTorch, frente a 0,1662 del GPTQ estándar y 0,0478 del TinyKV en bf16 servido con vLLM.

## Capacidades

- Generación de texto y conversación multi-turno en modo solo texto (la torre de visión se conserva pero está sin probar y el ejemplo de despliegue la desactiva con `--limit-mm-per-prompt '{"image":0,"video":0}'`).
- Razonamiento y respuesta abierta: la prueba cualitativa incluida genera explicaciones coherentes de varios párrafos (ejemplo del cielo azul).
- Recuperación en contexto largo: la model card reporta 22/24 aciertos en una prueba de agujas a 30.000 tokens con 32 señuelos casi idénticos.
- Capacidad de KV cache muy alta: 6,12 millones de tokens con `max_model_len=32768` y `gpu_memory_utilization=0.85` en una GPU de 96 GB.
- Servido con vLLM 0.32.0 mediante plugin de arquitectura propia.
- Soporte multimodal: no confirmado; la torre de visión existe pero se describe como no probada.
- Tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente o multi-step reasoning: no documentadas en la información disponible.
- Capacidades multilingües: no disponibles (el campo de idiomas del repo está vacío).

## Casos de uso

- Análisis de repositorios y documentación extensa: con capacidad de KV cache de millones de tokens, se pueden mantener muchos documentos simultáneamente en memoria y hacer preguntas cruzadas sin trocear el contexto en pipelines RAG.
- Asistencia sobre bases de código de gran tamaño en una sola GPU: el peso de ~21 GB permite cargar el modelo en tarjetas de 24 GB, dejando el resto de VRAM para cache de contexto.
- Procesamiento de expedientes o contratos largos: la ventana de 131.072 tokens permite ingerir documentos completos y hacer extracción de cláusulas o resúmenes estructurados sin truncar.
- Despliegue en estaciones de trabajo con una sola GPU: al no soportar tensor parallelism el plugin, el modelo está pensado para servir en un único dispositivo, lo que simplifica el aprovisionamiento frente a alternativas que exigen multi-GPU.
- Evaluación comparativa de técnicas de compresión de KV cache: el checkpoint sirve como referencia reproducible para medir el intercambio entre longitud de contexto y fidelidad, con el ruido de cuantización ya caracterizado.
- Prototipado de contextos largos en hardware Intel: la model card lo declara como base de la compilación para Intel Arc Pro B70 con vLLM XPU, útil para equipos que quieran validar esa ruta cuando se publique el chequeo.
- Chat de documentación técnica interna con un único servidor vLLM: volumen de pesos moderado y API compatible con OpenAI a través de `vllm serve`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Las únicas medidas reportadas son internas, comparando el modelo con el mismo checkpoint sin TinyKV, en vLLM 0.32.0 sobre una RTX PRO 6000 (96 GB), `gpu_memory_utilization=0.85`, `max_model_len=32768`:

| Métrica | TinyKV-GPTQ-Int4 | GPTQ-Int4 estándar |
|---|---|---|
| Capacidad de KV cache | 6,12 M tokens | 2,55 M tokens (2,40× menos) |
| Agujas a 30k con 32 señuelos casi idénticos | 22/24 (logp -0,474) | 24/24 (logp -0,363) |
| Ruido de cuantización (media \|Δ log p\| frente a su referencia bf16 en PyTorch, 4 prompts de 1k tokens) | 0,1032 | 0,1662 |

Referencia adicional aportada por el autor: el TinyKV en bf16 servido con vLLM obtiene 0,0478 de ruido y sostiene 1,59 M tokens con los mismos ajustes, frente a 0,66 M del bf16 estándar.

## Requisitos de hardware

- VRAM para inferencia: pesos de ~21 GB (repo de 25,0 GB); el resto de VRAM se destina a KV cache y activaciones.
- GPU objetivo declarada: cualquier GPU con soporte GPTQ, clase 24 GB en adelante.
- Verificado en: una RTX PRO 6000 de 96 GB, con `gpu_memory_utilization=0.85` y `max_model_len=32768`.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB (RTX 3090/4090 y equivalentes) siempre que se ajuste `max_model_len` y la utilización de memoria; no hay medición publicada de tokens de contexto posibles en 24 GB.
- Restricción importante: el plugin de vLLM no implementa tensor parallelism todavía, por lo que el despliegue es de una sola GPU.
- Opciones de despliegue: vLLM 0.32.0 con el plugin del repositorio (`pip install ./plugin`); GGUF disponible en repositorio separado para stacks basados en llama.cpp; ruta Intel XPU con imagen vLLM específica en preparación (chequeo en B70 pendiente).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / KV cache | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| darioooooo0o/Qwen3.6-35B-A3B-TinyKV-GPTQ-Int4 | 36,2 B totales, ~3 B activos | 131.072 tokens; 6,12 M tokens de KV cache en 96 GB a 32k | GPTQ Int4 mixto | Apache-2.0 | Público, 0 descargas, requiere plugin de vLLM |
| palmfuture/Qwen3.6-35B-A3B-GPTQ-Int4 | 36,2 B totales, ~3 B activos | 2,55 M tokens de KV cache en las mismas condiciones | GPTQ Int4 | Apache-2.0 (según base) | Público; cuantización estándar sin TinyKV |
| darioooooo0o/Qwen3.6-35B-A3B-TinyKV (bf16) | 36,2 B totales, ~3 B activos | 1,59 M tokens de KV cache; ruido 0,0478 | bf16 | Apache-2.0 | Público; mayor precisión, mayor huella de memoria |
| Qwen/Qwen3.6-35B-A3B (base) | 36,2 B totales, ~3 B activos | 0,66 M tokens de KV cache en bf16 | bf16 | Apache-2.0 | Público; referencia de calidad sin modificaciones |

## Limitaciones y advertencias

- Solo texto: la torre de visión se mantiene intacta pero no se ha probado, y el comando de despliegue la desactiva explícitamente.
- Sin tensor parallelism en el plugin: no se puede repartir el modelo entre varias GPU, lo que limita el escalado horizontal a réplicas completas.
- Pérdida de fidelidad en contexto largo: en la prueba de agujas el modelo acierta 22/24 frente a 24/24 del GPTQ estándar, con log-probabilidad media peor (-0,474 frente a -0,363).
- Ruido de cuantización superior al bf16: 0,1032 frente a 0,0478 del TinyKV en bf16, medido sobre solo 4 prompts de 1.000 tokens; es una muestra pequeña.
- Ausencia total de benchmarks estándar: no hay MMLU, HumanEval, GSM8K ni evaluaciones multilingües que permitan comparar con la literatura.
- Idiomas no declarados: al no figurar el campo de idiomas, no hay garantía documentada de cobertura multilingüe más allá de la del modelo base.
- Dependencia de un plugin de arquitectura no estándar: obliga a fijar vLLM 0.32.0 y a instalar código adicional, lo que complica la reproducibilidad y las actualizaciones.
- Madurez baja: repositorio con 0 descargas y 0 likes, publicado el 25 de octubre de 2026, sin validación independiente; el chequeo en Intel Arc Pro B70 está pendiente.
- Trazabilidad: la autoría del modelo y la del perfil de HuggingFace no coinciden en el nombre (darioooooo0o frente a @imdariotoo), y parte de la información técnica remite a la ficha del modelo base.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del checkpoint base de Qwen y de la cuantización de palmfuture antes de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/darioooooo0o/Qwen3.6-35B-A3B-TinyKV-GPTQ-Int4
- Modelo base TinyKV (receta de conversión, entrenamiento y tablas de calidad): https://huggingface.co/darioooooo0o/Qwen3.6-35B-A3B-TinyKV
- Versión GGUF: https://huggingface.co/darioooooo0o/Qwen3.6-35B-A3B-TinyKV-GGUF
- Cuantización GPTQ Int4 de origen: https://huggingface.co/palmfuture/Qwen3.6-35B-A3B-GPTQ-Int4
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Perfil del autor en X: https://x.com/imdariotoo
- Proveedor de cómputo usado en las pruebas: https://www.cloudrift.ai

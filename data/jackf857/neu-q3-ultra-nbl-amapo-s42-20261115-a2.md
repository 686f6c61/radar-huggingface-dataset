# jackf857/neu-q3-ultra-nbl-amapo-s42-20261115-a2

## Resumen

`neu-q3-ultra-nbl-amapo-s42-20261115-a2` es un checkpoint de investigación publicado por el usuario jackf857 en Hugging Face. Se trata de un ajuste fino de preferencias (preference optimization) sobre el modelo base `jackf857/qwen3-8b-base-sft-ultrachat-4xh200-batch-128`, que a su vez deriva de la familia Qwen3 de 8B parámetros. El modelo emplea una variante de optimización de preferencias denominada AMaPO (Adaptive Margin Preference Optimization), de estilo SimPO y sin referencia explícita en la función de pérdida, entrenada sobre el conjunto `HuggingFaceH4/ultrafeedback_binarized`.

La relevancia de este checkpoint es fundamentalmente metodológica: documenta de forma exhaustiva la receta de entrenamiento, los hiperparámetros y las trayectorias de diagnóstico, lo que lo convierte en un artefacto útil para comparar variantes de optimización de preferencias en investigación. No obstante, el propio autor advierte que se trata de un checkpoint experimental de una única semilla, sin evaluación held-out ni benchmarks de generación, por lo que no debe considerarse un modelo listo para producción.

Arquitectónicamente es un transformer causal estándar de la familia Qwen3 (`Qwen3ForCausalLM`, 36 capas) con 8.190.735.360 parámetros totales, licencia Apache 2.0 y pesos serializados en safetensors (float32 en el config, aunque el entrenamiento se realizó en bfloat16). El repositorio ocupa 32,8 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (`Qwen3ForCausalLM`, 36 capas) |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (máximo de secuencia en entrenamiento: 2048 tokens; prompt máximo: 1800 tokens) |
| Tipos de cuantización | no disponible (pesos subidos sin cuantizar; el autor no documenta variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (config serializado en float32) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3 con 36 capas y 8,19 mil millones de parámetros. El entrenamiento parte del checkpoint SFT `jackf857/qwen3-8b-base-sft-ultrachat-4xh200-batch-128` (revisión `f55660f8575d309f4c9d6d81bb21107299c14011`) y aplica una optimización de preferencias con AMaPO, una variante de estilo SimPO que utiliza log-probabilidades de respuesta normalizadas por longitud y márgenes adaptativos por instancia (detached). La pérdida es reference-free: el modelo SFT congelado solo se evalúa para diagnósticos del margen DPO, no entra en la optimización. El hiperparámetro `signal_reference_beta` (0,01) se aplica únicamente al diagnóstico registrado.

El conjunto de datos es `HuggingFaceH4/ultrafeedback_binarized` (revisión `3949bf5f8c17c394422ccfab0c31ea9c20bdeb85`), split `train_prefs`, con 61.135 pares disponibles. El entrenamiento se ejecutó en 4 × NVIDIA H200 (Northeastern Explorer) con semilla 42, optimizador AdamW, learning rate 5e-07, schedule coseno con warmup 0,1, batch efectivo de 128 pares (4 por GPU × 4 GPUs × 8 acumulaciones), 477 pasos completados, precisión bfloat16 y atención SDPA. El margen adaptativo se calcula sobre el microbatch reunido de 16 pares, no sobre el batch acumulado de 128. Beta fijo en 3,0; sin controlador LSC. No se realizó evaluación durante el entrenamiento.

## Capacidades

- Generación de texto conversacional: el modelo está ajustado sobre pares de preferencia de UltraFeedback, lo que lo orienta a respuestas alineadas con preferencias humanas en diálogo.
- Razonamiento y matemáticas: hereda las capacidades del Qwen3 base de 8B, aunque no se documentan evaluaciones específicas en esta ficha.
- Generación de código: capacidad heredada del modelo base Qwen3; no verificada en este checkpoint.
- Soporte de tool calling / function calling: no documentado explícitamente en la información proporcionada; heredable del base Qwen3, pero sin garantía en este ajuste.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no disponibles (los idiomas no están declarados en la model card).
- Capacidades especiales: no se declaran modos de pensamiento (thinking), visión ni audio.

## Casos de uso

- Investigación en optimización de preferencias: el checkpoint sirve como punto de comparación reproducible para estudiar el efecto de AMaPO frente a DPO, SimPO u otras variantes, gracias a la documentación exhaustiva de hiperparámetros, trayectorias de margen y diagnósticos del optimizador.
- Ablaciones metodológicas: permite analizar el impacto de beta fijo (3,0), normalización por longitud y márgenes adaptativos por instancia en un conjunto de preferencias congelado como UltraFeedback.
- Reproducibilidad de experimentos: los artefactos de entrenamiento (config, SHA-256 del paquete, commit del código) permiten reconstruir el pipeline y auditar decisiones de diseño.
- Evaluación comparativa de alineación: útil para medir cómo un ajuste de preferencias sin referencia se comporta frente a su modelo SFT de partida en métricas de preferencia (AlpacaEval, MT-Bench), siempre que el investigador ejecute esas evaluaciones por su cuenta.
- Base para ajustes posteriores: al estar bajo Apache 2.0 y en safetensors, puede servir como punto de partida para nuevos ciclos de SFT o RLHF en investigación.
- Estudio de estabilidad de entrenamiento: las trayectorias registradas (pérdida final 19,5085, 0,054 pasos/s) permiten analizar convergencia y estabilidad en regímenes de learning rate bajo (5e-07).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El `model-index` de la model card declara una entrada sin resultados (`results: []`), y el autor indica explícitamente que no se reclama ninguna puntuación de benchmark ni evaluación held-out.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un transformer de 8,19B parámetros, en float16/bfloat16 se requieren aproximadamente 16 GB de pesos, más memoria para KV cache y activaciones; en cuantización de 8 bits, unos 8-9 GB; en 4 bits, unos 5-6 GB. Estas cifras son estimaciones genéricas por tamaño y no están confirmadas por el autor.
- GPU recomendadas: el entrenamiento se realizó en 4 × NVIDIA H200. Para inferencia, una GPU con al menos 24 GB (RTX 3090/4090, A10G, L4 en cuantización) sería suficiente en teoría, aunque no hay validación publicada.
- ¿Cabe en GPU de consumo? Probablemente sí en cuantización de 4-8 bits en GPUs de 12-24 GB, pero no está verificado ni se ofrecen pesos cuantizados en el repositorio.
- Opciones de despliegue: transformers (versión 4.51.0 documentada), text-generation-inference (el tag `text-generation-inference` y `endpoints_compatible` están presentes). No se documentan variantes GGUF para llama.cpp/Ollama ni artefactos para vLLM/TGI específicos.
- Latencia y throughput: no disponible. El autor registra 0,054 pasos de entrenamiento por segundo en 4 × H200, dato no trasladable a inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `neu-q3-ultra-nbl-amapo-s42-20261115-a2` (este) | 8,19B | no disponible (entrenado con 2048) | Apache 2.0 | Hugging Face, 42 descargas | Checkpoint de investigación, sin benchmarks |
| Qwen3-8B (oficial) | ~8B | no disponible en esta ficha | Apache 2.0 | Hugging Face | Modelo base de referencia de la familia |
| `jackf857/qwen3-8b-base-sft-ultrachat-4xh200-batch-128` | ~8B | no disponible | no disponible | Hugging Face | Checkpoint SFT del que parte este modelo |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint experimental de una única semilla (42): el autor advierte que el éxito de las comprobaciones de entrenamiento no establece calidad downstream, robustez ni idoneidad para despliegue.
- Sin evaluación held-out ni benchmarks de generación: no hay evidencia publicada de mejora frente al modelo SFT de partida.
- La pérdida de entrenamiento registrada (19,5085) no es comparable directamente con métricas de calidad; el autor aclara que las convenciones de logging y acumulación forman parte de la implementación.
- Sesgos conocidos: no documentados, pero heredables del dataset UltraFeedback y del modelo base Qwen3.
- Riesgo de alucinación: no evaluado en este checkpoint; aplicable el riesgo típico de los LLM de 8B.
- Limitaciones de contexto e idioma: la model card no declara idiomas soportados ni longitud de contexto final; el entrenamiento usó secuencias de hasta 2048 tokens (prompt máximo 1800), lo que puede limitar el rendimiento en contextos más largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no garantiza idoneidad para producción; se recomienda identificar una revisión inmutable de Hugging Face al evaluar.
- Los snapshots son solo del modelo (sin estado del optimizador, scheduler ni RNG), por lo que no son reanudables exactamente.
- El autor no reclama paridad exacta con un entorno B200 distinto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jackf857/neu-q3-ultra-nbl-amapo-s42-20261115-a2
- Modelo base SFT: https://huggingface.co/jackf857/qwen3-8b-base-sft-ultrachat-4xh200-batch-128
- Dataset de preferencias: https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized
- Resumen de la ejecución (artefacto del repo): `training_logs/run/run.json`
- Configuración de entrenamiento congelada: `training_logs/run/training_config.yaml`
- Model card original autogenerada: `training_logs/run/generated-model-card-original.md`

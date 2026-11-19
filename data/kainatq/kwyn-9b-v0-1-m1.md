# kainatq/KWYN-9B-v0.1-m1

## Resumen

KWYN-9B-v0.1-m1 es un artefacto intermedio publicado por el usuario kainatq en Hugging Face. No se trata de un modelo entrenado, sino de una fusión de pesos (weight merge) mediante el método TIES entre dos checkpoints de 9B: Qwen/Qwen3.5-9B como ancla (parent A) y xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic como segundo padre (parent R). El objetivo declarado es servir de base para un posterior ajuste supervisado (SFT) dentro de un plan de merges por etapas.

El modelo emplea la arquitectura Qwen3_5ForConditionalGeneration, con 9.653.104.368 parámetros totales, 32 capas y dimensión oculta de 4096. Los pesos se distribuyen en 4 shards safetensors en BF16 con un total de 17,98 GiB, y los 775 tensores de ambos padres se han fusionado y verificado sin descartes (dropped_tensors vacío). Incluye 15 tensores mtp.* fusionados también por TIES.

Su relevancia es limitada y experimental: el propio autor advierte que el artefacto no ha sido entrenado ni evaluado, y que cualquier afirmación sobre mejoras respecto a Qwen3.5-9B base carece de medición. Es útil como punto de comparación en una línea de investigación de merges, no como modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer, hidden 4096, 32 capas) |
| Parámetros totales | 9.653.104.368 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo se publican pesos BF16; sin builds cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (4 shards, BF16, 17,98 GiB) |

## Arquitectura y entrenamiento

El modelo es una fusión TIES (trim, elect sign, disjoint merge) de dos checkpoints de 9B con arquitectura Qwen3_5ForConditionalGeneration. Los pesos asignados a cada padre son [0.5, 0.5] y la densidad de la fusión es 0.2. Ambos padres comparten exactamente el mismo conjunto de 775 tensores (modo strict), incluidos 15 tensores mtp.* que también se fusionaron por TIES. La verificación registrada en m1_merge_report.json confirma 775 tensores verificados sobre 775, sin tensores descartados, con un tiempo de ejecución de 3.374 segundos y un pico de RSS de aproximadamente 2 GiB mediante lectura por rangos en streaming.

No ha habido entrenamiento, ajuste fino, RLHF, DPO ni adaptadores. Es una media ponderada de pesos existentes: no se han introducido datos nuevos ni optimización de preferencias. El tokenizer se hereda del parent A (Qwen/Qwen3.5-9B) con vocab_size 248.070; los 7 tokens especiales de cola que aporta el parent R (ids 248.070–248.076, relacionados con audio y TTS) no se escribieron en este artefacto, por lo que esos ids quedan sin asignar.

## Capacidades

- Generación de texto y conversación: al derivar de Qwen3.5-9B, hereda la arquitectura y el tokenizer del modelo base, pero sin garantía de comportamiento instruccional propio, ya que no ha sido ajustado por el autor.
- Procesamiento image-text-to-text: el pipeline declarado es image-text-to-text, coherente con la arquitectura condicional de generación del modelo base.
- Tool calling y function calling: no verificado en este artefacto; el autor indica que no hay resultados de tool-use para -m1.
- Razonamiento multi-step y agentes: no evaluado; sin datos de planning ni de uso agéntico.
- Capacidades multilingües: no disponibles; no se documentan idiomas soportados.
- Modo thinking, visión, audio: no confirmado. Los tokens de audio/TTS del parent R no están presentes en este merge, por lo que cualquier funcionalidad dependiente de ellos no operará.
- Comportamiento de seguridad: hereda las limitaciones de ambos padres, incluido el carácter uncensored del parent R, por lo que el comportamiento de seguridad difiere del Qwen original y debe revalidarse.

## Casos de uso

- Base para SFT conductual: el uso previsto por el autor es servir como punto de partida (etapa P4 del plan de merges) para un ajuste supervisado posterior. Se usaría cargando los pesos en transformers y aplicando un dataset de instrucciones sobre esta base.
- Punto de comparación en experimentos de merge: útil para contrastar frente a merges posteriores (-m2, -m3 y variantes en árbol) dentro de la misma línea de investigación, midiendo diferencias de comportamiento antes y después del SFT.
- Reproducción de pipelines TIES: el repositorio incluye m1_merge_report.json con parámetros, revisiones de padres y verificación por shard, lo que permite reproducir o auditar el proceso de fusión con las mismas densidades y pesos.
- Evaluación de herencia de tokenizer: sirve para estudiar cómo afecta la ausencia de los 7 tokens de cola del parent R a tareas que dependan de ellos, comparando con el checkpoint R original.
- Investigación sobre seguridad en merges: al combinar un modelo alineado con uno uncensored, permite analizar cómo se propaga el comportamiento de seguridad tras una media de pesos al 50/50 y densidad 0.2.
- Docencia y experimentación con métodos de fusión: ejemplo práctico y verificable de aplicación de TIES sobre checkpoints del mismo tamaño y mismo conjunto de tensores, con métricas de ejecución registradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este artefacto. El autor especifica que la etapa P3 del plan no se ha ejecutado contra -m1 y que no existen resultados de HumanEval, MBPP, GSM8K, GPQA, planning ni tool-use. Los números que aparecen en la model card (GPQA 81,7; LiveCodeBench v6 65,6; MMLU-Pro 82,5 para el parent A; GSM8K 94,5 y MMLU-Pro 90,53 para el parent R) pertenecen exclusivamente a los modelos padre y no deben interpretarse como resultados de este merge.

| Benchmark | -m1 | Parent A (Qwen3.5-9B) | Parent R (DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic) |
|---|---|---|---|
| GPQA | no disponible | 81,7 | no disponible |
| LiveCodeBench v6 | no disponible | 65,6 | no disponible |
| MMLU-Pro | no disponible | 82,5 | 90,53 (avg) |
| GSM8K | no disponible | no disponible | 94,5 |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 19,3 GB solo para pesos (9.653.104.368 parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica se recomienda al menos 24 GB para contexto corto.
- VRAM estimada en cuantización de 8 bits: alrededor de 10-11 GB para pesos; en 4 bits, alrededor de 5-6 GB. No obstante, el autor no publica builds cuantizados de -m1, por lo que habría que generarlos localmente.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para BF16 con contexto moderado. Para cuantización 4/8 bits, RTX 3090/4090 o GPUs consumer con 12-16 GB podrían ser suficientes, aunque sin garantías al no existir builds publicados.
- Cabe en GPU consumer: sí, en BF16 en una RTX 4090 de 24 GB con contexto limitado; en cuantización 4 bits en GPUs de 8-12 GB, previa conversión manual.
- Opciones de despliegue: transformers (librería declarada), vLLM, TGI, llama.cpp u Ollama tras conversión a GGUF. El pipeline image-text-to-text requiere un runtime que soporte entrada multimodal.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmarks | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KWYN-9B-v0.1-m1 | 9,65B | no disponible | no evaluado | apache-2.0 | Hugging Face (kainatq) |
| Qwen/Qwen3.5-9B | 9B (aprox.) | no disponible | GPQA 81,7; LiveCodeBench v6 65,6; MMLU-Pro 82,5 | apache-2.0 | Hugging Face (Qwen) |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | 9B (aprox.) | no disponible | GSM8K 94,5; MMLU-Pro avg 90,53 | apache-2.0 | Hugging Face (xtools-at) |

La comparación con los padres es la más directa por compartir arquitectura, tokenizer y conjunto de tensores. Frente a ellos, -m1 no aporta métricas propias y su valor es experimental. No se dispone de datos de otros modelos de 9B comparables en la información proporcionada.

## Limitaciones y advertencias

- No evaluado: no existen resultados de HumanEval, MBPP, GSM8K, GPQA, planning ni tool-use para -m1. Cualquier afirmación de mejora sobre Qwen3.5-9B es no medida.
- No entrenado: es una media de pesos sin datos nuevos, sin preferencia optimizada y sin adaptador; no debe tratarse como un modelo instruccional listo para uso directo.
- Herencia de limitaciones de ambos padres, incluido el comportamiento uncensored del parent R. El comportamiento de seguridad no equivale al de Qwen original y debe revalidarse antes de cualquier despliegue.
- Tokenizer incompleto respecto al parent R: los 7 tokens especiales de audio/TTS (ids 248.070–248.076) no están escritos, por lo que cualquier funcionalidad que dependa de ellos fallará y los ids ≥ 248.070 no deben asumirse con el mismo significado que en R.
- Tensores mtp.* fusionados, no transportados literalmente: a diferencia del futuro -m2, aquí los 15 tensores mtp.* se han promediado por TIES, lo que puede afectar al comportamiento de decodificación especulativa asociado.
- Sin builds cuantizados publicados: no hay GGUF, AWQ ni GPTQ oficiales; cualquier cuantización debe generarse y validarse localmente.
- Riesgo de alucinación y sesgos: no documentados específicamente para este artefacto; al ser una media de pesos, se espera que herede los sesgos de ambos padres, pero no hay análisis publicado.
- Licencia apache-2.0 heredada de los padres, permisiva para uso comercial, pero sin garantías del autor sobre el artefacto.
- Nombre del repositorio en transición: el autor indica que el repositorio actualmente llamado KWYN-9B-v0.1 está pendiente de renombrarse a KWYN-9B-v0.1-m1; si se lee un repositorio con ese nombre sin adaptador entrenado, se trata de este merge y no de la versión final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kainatq/KWYN-9B-v0.1-m1
- Parent A (Qwen3.5-9B): https://huggingface.co/Qwen/Qwen3.5-9B
- Parent A, revisión c20223623576: https://huggingface.co/Qwen/Qwen3.5-9B/tree/c20223623576
- Parent R (DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic): https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Parent R, revisión fbccdc6adf70: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic/tree/fbccdc6adf70
- Licencia del parent A: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Informe de merge (m1_merge_report.json): https://huggingface.co/kainatq/KWYN-9B-v0.1-m1/blob/main/m1_merge_report.json

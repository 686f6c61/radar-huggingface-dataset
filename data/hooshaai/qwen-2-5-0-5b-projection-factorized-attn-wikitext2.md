# Hooshaai/qwen-2.5-0.5b-projection-factorized-attn-wikitext2

## Resumen

El modelo `Hooshaai/qwen-2.5-0.5b-projection-factorized-attn-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente los bloques de atención del decodificador por el módulo `ProjectionFactorizedAttention` del registro `ATTENTION_REGISTRY` del framework NeuralOps. Lo publica el usuario Hooshaai como artefacto de investigación dentro del llamado "Qwen Attention Zoo", un conjunto de experimentos que compara variantes de atención subcuadrática sobre una base conocida y de pequeño tamaño.

La motivación no es producir un modelo de propósito general, sino medir la viabilidad de reemplazar atención cuadrática estándar por un mecanismo de atención lineal factorizada por SVD y recuperar la capacidad lingüística mediante destilación de conocimiento en dos etapas. El resultado es un modelo de 0,5 mil millones de parámetros con solo las capas de atención reentrenadas (76,62 MB de pesos), que alcanza una perplejidad de 3099,36 en WikiText-2 frente a los 1.657.112,85 del estado inmediatamente posterior a la cirugía, lo que demuestra que la destilación recupera buena parte del daño, aunque el valor final sigue siendo muy alto para uso práctico.

Es relevante ahora porque ejemplifica una línea de trabajo activa: la sustitución modular de operadores de atención en transformers preentrenados para reducir el coste cuadrático, con telemetría reproducible de entrenamiento. No obstante, debe interpretarse como un banco de pruebas técnico, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con atención híbrida: 18/24 capas con `projection_factorized_attn` y 6/24 capas con atención cuadrática completa |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B; solo se reentrenan las capas de atención) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el entrenamiento usó `seq_len=512`) |
| Tipos de cuantizacion | No disponible; los pesos se distribuyen en FP16 (entrenamiento con autocast FP16 y parámetros maestros FP32) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, 76,62 MB) + `config.json` + `tokenizer.json` |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen2.5-0.5B: `hidden_size=896`, 14 cabezas de consulta, 2 cabezas KV, `head_dim=64` y 24 capas de decodificador. Sobre esa base se aplica un patrón de cirugía `hybrid_3_1`: se intercalan bloques con atención factorizada por proyección y se preservan capas de anclaje con atención cuadrática completa en los índices `[3, 7, 11, 15, 19, 23]`. El adaptador `QwenAttentionAdapter` realiza una expansión automática de cabezas KV (14:2, factor 7x) y respeta el contrato de un único `o_proj`. El módulo `ProjectionFactorizedAttention` es una atención lineal con factorización SVD de las proyecciones, con soporte causal, bidireccional, cross-attention, GQA nativo y operador de atención personalizado.

El entrenamiento consiste en una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), partiendo de un checkpoint post-cirugía con perplejidad de 1.657.112,85. La etapa 1 (alineación con backbone congelado, 127 pasos, 54,1 s) omite `lm_head` y usa MSE y coseno por capa con peso 0,25. La etapa 2 (destilación de representaciones multicapa, 294 pasos, 125,8 s) emplea MSE y coseno por capa con peso 0,50. En total, 421 pasos en 180,2 s con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando un pico de VRAM de 16.847 MB. No se documenta RLHF ni DPO.

## Capacidades

- Generación de texto causal autorregresiva en inglés, heredada de la base Qwen2.5-0.5B.
- Atención causal y bidireccional (el módulo declara soporte para ambas).
- Cross-attention y Grouped Query Attention nativo en el módulo de atención.
- Compatibilidad con RoPE a nivel de modelo base, aunque el módulo declara `supports_rope` como no aplicable.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documenta visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Investigación en atención subcuadrática: sirve como referencia reproducible para medir el coste de sustituir atención cuadrática por atención lineal factorizada en un modelo de 0,5B, con telemetría de perplejidad antes y después de la destilación.
- Estudio de destilación de conocimiento: las dos etapas documentadas (alineación con backbone congelado y destilación de representaciones multicapa) permiten comparar estrategias de recuperación tras una cirugía de atención.
- Benchmark de frameworks de atención: al estar integrado en `neuralops.hub`, se puede usar para validar el registro `ATTENTION_REGISTRY` y el adaptador `QwenAttentionAdapter` en pipelines de investigación.
- Experimentos de eficiencia en contextos largos: la atención lineal factorizada es adecuada para estudiar el escalado del coste con la longitud de secuencia, aunque el checkpoint solo se entrenó con `seq_len=512`.
- Docencia y formación técnica: ilustra de forma concreta cómo se reemplaza un bloque de atención en un transformer preentrenado y qué métricas usar para evaluar la recuperación.
- Pruebas de integración con la API de NeuralOps: el ejemplo `load_surgeried_model` permite verificar la carga de pesos quirúrgicos desde el Hub en entornos de desarrollo.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados):

| Benchmark | Métrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validación) | Perplejidad | 3099,36 |

Telemetría de entrenamiento reportada por el autor:

| Etapa | Métrica | Valor |
|---|---|---|
| Stage 0 (post-cirugía, zero-shot) | Perplejidad causal | 1.657.112,85 |
| Post-KD | Perplejidad causal | 3099,36 |
| Delta de perplejidad | Variación | -1.654.013,49 |
| Stage 1 | Pasos / tiempo | 127 / 54,1 s |
| Stage 2 | Pasos / tiempo | 294 / 125,8 s |
| Total | Pasos / tiempo | 421 / 180,2 s |
| Pico de VRAM | Memoria | 16.847 MB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El checkpoint distribuido son solo los pesos de atención (76,62 MB), por lo que es necesario cargar la base `Qwen/Qwen2.5-0.5B` completa y aplicar después la cirugía.
- VRAM estimada para inferencia: el modelo base de 0,5B en FP16 ocupa aproximadamente 1 GB de pesos; con overhead de activaciones y KV cache, cabe holgadamente en GPUs consumer de 8 GB o superiores.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4090, A100, H100); el entrenamiento reportado usó 16.847 MB de pico, por lo que se necesita al menos una GPU de 24 GB para reproducir el pipeline de destilación.
- Cabe en GPU consumer: sí, para inferencia; para reentrenamiento se recomienda una GPU de 24 GB o más.
- Opciones de despliegue: la carga está pensada para la librería `neuralops` (`load_surgeried_model`) o para `transformers` aplicando `apply_qwen_attention_surgery` y cargando `attention_weights.safetensors`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `Hooshaai/qwen-2.5-0.5b-projection-factorized-attn-wikitext2` | 0,5B | No disponible | MIT | Checkpoint quirúrgico con atención lineal factorizada y destilación en WikiText-2; PPL 3099,36 |
| `Qwen/Qwen2.5-0.5B` | 0,5B | 32.768 tokens (según la familia Qwen2.5) | Apache 2.0 | Modelo base original con atención cuadrática completa y capacidades multilingües |
| Otros checkpoints del "Qwen Attention Zoo" (NeuralOps) | 0,5B | No disponible | MIT | Variantes con otros operadores de atención del registro; no se dispone de métricas comparables en la información proporcionada |

La comparación con alternativas de la misma categoría (atención subcuadrática sobre bases pequeñas) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La perplejidad de 3099,36 en WikiText-2 es muy superior a la de un modelo de 0,5B entrenado de forma convencional, lo que indica una calidad lingüística degradada; no es apto para uso en producción sin validación adicional.
- El modelo solo se ha entrenado y evaluado en inglés y sobre un único dataset (WikiText-2); no hay evidencia de generalización a otros dominios.
- El checkpoint contiene únicamente los pesos de atención; es imprescindible cargar la base Qwen2.5-0.5B y aplicar la cirugía antes de usar los pesos.
- No se documentan evaluaciones de sesgo, toxicidad ni alucinación; al derivar de Qwen2.5-0.5B, hereda los sesgos potenciales de la base.
- La licencia MIT se aplica al artefacto publicado, pero el modelo base Qwen2.5-0.5B tiene su propia licencia (Apache 2.0 según la familia Qwen2.5); conviene verificar la compatibilidad para uso comercial.
- El contexto de entrenamiento fue de 512 tokens; no hay garantía de comportamiento correcto en secuencias más largas.
- El repositorio tiene 0 likes y 382 descargas, y la model card referencia un `repo_id` distinto (`tahamajs/...`) en los ejemplos, lo que puede causar confusión al reproducir el código.
- Los resultados de benchmarks son declarados por el autor y no están verificados (`verified: false`).

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-projection-factorized-attn-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Framework NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext

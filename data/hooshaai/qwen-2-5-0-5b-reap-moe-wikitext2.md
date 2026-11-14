# Hooshaai/qwen-2.5-0.5b-reap-moe-wikitext2

## Resumen

`Hooshaai/qwen-2.5-0.5b-reap-moe-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente los bloques de atención del decodificador por el módulo `reap_moe` (`REAPMoEAttention`, "Robust Expert Allocation and Pruning Mixture of Experts Attention") del registro `ATTENTION_REGISTRY` del framework NeuralOps. Lo publica el usuario Hooshaai y se apoya en la infraestructura y los scripts de NeuralOps del repositorio de tahamajs. No es un modelo de propósito general nuevo, sino un artefacto de investigación sobre atención subcuadrática y destilación de conocimiento.

El interés técnico está en la topología de la cirugía: patrón `hybrid_3_1`, con 18 de las 24 capas transplantadas a `reap_moe` mediante `QwenAttentionAdapter` y 6 capas cuadráticas completas preservadas como anclas en los índices 3, 7, 11, 15, 19 y 23. Sobre esa arquitectura modificada se aplica una destilación de conocimiento en dos etapas desde el modelo base original, que reduce la perplejidad en WikiText-2 de 139,79 (baseline cero tras la cirugía) a 24,89.

El modelo es relevante como banco de pruebas reproducible para quienes investigan atención eficiente, mezclas de expertos aplicadas a la atención y técnicas de recuperación de capacidad tras modificar la arquitectura de un transformer preentrenado. Su tamaño (0,5 mil millones de parámetros, 193,45 MB de pesos de atención) permite experimentar en una única GPU consumer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Qwen2.5-0.5B con atención `reap_moe` (REAPMoEAttention) en patrón híbrido `hybrid_3_1` |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B; el autor no declara recuento tras la cirugía) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el entrenamiento usa `seq_len=512`; el modelo base Qwen2.5-0.5B soporta 32.768 tokens, pero el autor no confirma que se conserve) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo de uso carga en FP16) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 193,45 MB) más `config.json`, `tokenizer.json` y `training_metrics.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con 24 capas, `hidden_size=896`, 14 cabezas de consulta, 2 cabezas KV (`head_dim=64`) y GQA nativo. La cirugía reemplaza la atención en 18 de las 24 capas por `REAPMoEAttention`, un operador de atención con asignación y poda robusta de expertos, y conserva atención cuadrática completa en 6 capas ancla (índices 3, 7, 11, 15, 19, 23) para estabilizar la representación. El `QwenAttentionAdapter` gestiona el mapeo de proyecciones con expansión automática de cabezas KV (7x donde es necesario) y aplica el contrato de derivación Single-`o_proj`. Según la model card, el módulo soporta atención causal, bidireccional y cross-attention, pero no GQA nativo ni RoPE declarado (`supports_rope: N/A`).

El entrenamiento consiste en una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 0 (baseline cero tras la cirugía) arroja una perplejidad causal de 139,79. La etapa 1 (alineación con backbone congelado, 135 pasos, 54,1 s) omite `lm_head` y usa MSE y coseno por capa con peso 0,25. La etapa 2 (destilación de representación multicapa, 312 pasos, 125,8 s) usa MSE y coseno con peso 0,50. En total, 447 pasos en 180,2 s con `seq_len=512`, `grad_accum=4` y `topk=64`, con un pico de VRAM de 16.196 MB en FP16 con autocast y parámetros maestros del estudiante en FP32. No se documenta el volumen de tokens de entrenamiento ni el uso de RLHF o DPO.

## Capacidades

- Generación de texto causal autoregresiva en inglés, heredada del modelo base Qwen2.5-0.5B.
- Atención causal, bidireccional y cross-attention a nivel de módulo (`reap_moe`), lo que permite experimentar con variantes no causales.
- Destilación de conocimiento verificada sobre WikiText-2 con perplejidad final de 24,89.
- Carga mediante la API universal de NeuralOps (`load_surgeried_model`) o mediante cirugía manual con `apply_qwen_attention_surgery`.
- No se documenta soporte de tool calling, function calling, agentes, multi-step reasoning, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- Investigación en atención subcuadrática: el checkpoint sirve como referencia reproducible para medir el impacto de sustituir atención cuadrática por `reap_moe` en un transformer pequeño, comparando la perplejidad pre-KD (139,79) y post-KD (24,89).
- Estudio de mezclas de expertos en atención: permite analizar cómo la asignación y poda de expertos afecta a la representación interna de un modelo de 0,5 B en 18 de sus 24 capas.
- Validación de pipelines de destilación de conocimiento: las dos etapas documentadas (alineación con backbone congelado y destilación multicapa) son un caso de estudio para reproducir y comparar estrategias de recuperación tras cirugía arquitectónica.
- Benchmark de perplejidad en WikiText-2: útil como punto de control en experimentos que comparen variantes de atención sobre el mismo modelo base, dado que el autor publica el valor exacto y la telemetría de entrenamiento.
- Pruebas de integración con el framework NeuralOps: el repositorio incluye un ejemplo de carga vía `neuralops.hub.load_surgeried_model` que sirve para validar la API en entornos de desarrollo.
- Docencia y experimentación en GPU consumer: con 193,45 MB de pesos de atención y un pico de 16 GB de VRAM durante el entrenamiento, es viable reproducir el flujo en una única GPU de gama alta consumer.
- Exploración de atención híbrida con capas ancla: permite estudiar el efecto de preservar 6 capas cuadráticas completas frente a sustituir todas las capas.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad causal | 24,89 |
| WikiText-2 (baseline cero tras cirugía, etapa 0) | Perplejidad causal | 139,79 |
| Delta de perplejidad tras KD | Δ | -114,90 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de capacidad en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 0,5 B de parámetros en FP16 el modelo completo ronda 1 GB, pero el autor no publica la cifra de inferencia.
- VRAM documentada durante el entrenamiento (destilación): 16.196 MB de pico en FP16 con autocast y parámetros maestros en FP32.
- GPU recomendadas: no especificadas por el autor; por tamaño, una RTX 4090, RTX 3090 o superior es suficiente para reproducir el entrenamiento, y cualquier GPU consumer con 8 GB o más debería bastar para inferencia en FP16.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 8 GB de VRAM para inferencia en FP16 (no confirmado por el autor).
- Opciones de despliegue: el autor solo documenta carga vía `transformers` con `AutoModelForCausalLM` más cirugía manual, y vía `neuralops.hub.load_surgeried_model`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hooshaai/qwen-2.5-0.5b-reap-moe-wikitext2 | 0,5 B | no disponible | PPL WikiText-2: 24,89 | MIT | Hugging Face |
| Qwen/Qwen2.5-0.5B (base) | 0,5 B | 32.768 tokens | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| Alternativas de atención eficiente sobre modelos pequeños | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparables de otros checkpoints con atención `reap_moe` en la información proporcionada, por lo que la comparación cuantitativa con alternativas equivalentes no está disponible.

## Limitaciones y advertencias

- Modelo experimental de investigación: no es un modelo de propósito general y su uso en producción no está documentado ni validado.
- Entrenado únicamente sobre WikiText-2, un corpus de dominio limitado (texto enciclopédico en inglés); el riesgo de degradación fuera de dominio es alto.
- El autor no declara el recuento de parámetros tras la cirugía ni la longitud de contexto efectiva del checkpoint resultante.
- El módulo `reap_moe` no soporta GQA nativo (`supports_gqa: No`) y declara `supports_rope: N/A`, lo que puede afectar a la extrapolación de contexto.
- Idiomas: solo inglés según la etiqueta del repositorio; no hay evidencia de capacidades multilingües.
- Riesgo de alucinación: no evaluado por el autor; al ser un modelo de 0,5 B con destilación sobre un corpus limitado, la fiabilidad factual es baja.
- Sesgos: no documentados; hereda los del modelo base Qwen2.5-0.5B y los de WikiText-2.
- Licencia MIT: permite uso comercial, pero el modelo base Qwen2.5-0.5B tiene licencia Apache 2.0, por lo que conviene revisar la compatibilidad en despliegues comerciales.
- El ejemplo de la model card referencia el repositorio `tahamajs/qwen-2.5-0.5b-reap-moe-wikitext2`, distinto del ID publicado (`Hooshaai/...`); hay que ajustar el `repo_id` al cargar.
- La perplejidad de 24,89 está declarada como no verificada (`verified: false`) en el model-index.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-reap-moe-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext

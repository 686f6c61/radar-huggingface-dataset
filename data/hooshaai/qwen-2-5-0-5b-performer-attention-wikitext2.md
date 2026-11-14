# Hooshaai/qwen-2.5-0.5b-performer-attention-wikitext2

## Resumen

`Hooshaai/qwen-2.5-0.5b-performer-attention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente 18 de las 24 capas de atención del decoder por el operador `PerformerAttention` (FAVOR+, Fast Attention Via Positive Orthogonal Random Features) del registro `ATTENTION_REGISTRY` del framework NeuralOps. El objetivo no es producir un modelo de propósito general, sino servir de banco de pruebas reproducible para estudiar atención subcuadrática en un transformer causal pequeño, midiendo el coste de la sustitución y la recuperación de calidad mediante destilación de conocimiento.

El modelo se entrena sobre WikiText-2 (`Salesforce/wikitext`, split de validación) y se distribuye únicamente con los pesos de atención (`attention_weights.safetensors`, 124,03 MB), no como un checkpoint completo: para usarlo hay que cargar el Qwen2.5-0.5B original, aplicar la cirugía con `apply_qwen_attention_surgery` y cargar los tensores con `strict=False`. La perplejidad final en validación es de 102,92, tras recuperarse de un colapso inicial de 2549,43 mediante dos etapas de destilación (336 pasos, 180,3 s, 13,9 GB de VRAM pico).

Es relevante ahora porque la comunidad investigadora necesita referencias controladas para evaluar alternativas a la atención cuadrática estándar en LLMs reales, y este repositorio ofrece una topología híbrida concreta (3:1 con anclas cuadráticas) junto con telemetría completa de entrenamiento, algo poco habitual en este tipo de experimentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atención híbrida: 18/24 capas con `PerformerAttention` (FAVOR+) y 6/24 capas con atención cuadrática estándar |
| Parametros totales | 0,5B (heredados de Qwen2.5-0.5B; el repo solo distribuye pesos de atención, 124,03 MB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el entrenamiento usa `seq_len=512`) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; el ejemplo de carga usa FP16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 124,03 MB) + `config.json` + `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B (14 cabezas de query, 2 cabezas KV, `head_dim=64`, `hidden_size=896`). La cirugía aplica el patrón `hybrid_3_1`: se intercalan bloques con `performer_attention` y se preservan seis capas de atención cuadrática completa en los índices `[3, 7, 11, 15, 19, 23]` como anclas. El `QwenAttentionAdapter` realiza una expansión automática de cabezas KV 7x cuando es necesario y fuerza el contrato de un único `o_proj`. El módulo `PerformerAttention` soporta atención causal, bidireccional, cross-attention y GQA nativo; no soporta RoPE según la tabla de capacidades del autor.

El entrenamiento es una destilación de conocimiento en dos etapas sobre WikiText-2. La etapa 0 (post-cirugía, sin entrenar) arroja una perplejidad causal de 2549,43. La etapa 1 (alineación con backbone congelado, 102 pasos, 54,4 s) omite `lm_head` y usa MSE y coseno (peso 0,25) sobre estados ocultos capa a capa. La etapa 2 (destilación multi-capa, 234 pasos, 125,5 s) repite el esquema con peso de coseno 0,50. En total, 336 pasos en 180,3 s con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando 13.892 MB de VRAM pico en FP16 con parámetros maestros del alumno en FP32. La perplejidad final baja a 102,92 (delta de −2446,51).

## Capacidades

- Generación de texto causal autoregresiva en inglés, heredada del modelo base Qwen2.5-0.5B.
- Atención subcuadrática en la mayoría de capas (FAVOR+), lo que en teoría reduce el coste asintótico respecto a la atención cuadrática.
- Soporte de atención bidireccional y cross-attention a nivel de módulo (según la tabla de capacidades del autor).
- Soporte nativo de GQA (14 cabezas query, 2 KV) con expansión 7x en el adaptador.
- Compatibilidad con el ecosistema NeuralOps (`load_surgeried_model`) y con `transformers` cargando el base y aplicando la cirugía manualmente.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Investigación en atención eficiente: servir como punto de partida reproducible para comparar FAVOR+ frente a atención cuadrática en un transformer causal real, midiendo perplejidad y coste computacional con la misma topología.
- Estudio de destilación post-cirugía: el repositorio incluye telemetría completa (etapas, pasos, tiempos, VRAM) que permite reproducir y extender el protocolo de recuperación a otros operadores del `ATTENTION_REGISTRY`.
- Benchmark de robustez arquitectónica: evaluar cómo se degradan tareas downstream (clasificación, QA, generación) al sustituir 18 de 24 capas de atención en un modelo de 0,5B.
- Prototipado de modelos ligeros en inglés: para entornos con recursos muy limitados donde se priorice el tamaño (0,5B) sobre la calidad, siempre asumiendo la perplejidad elevada (102,92) frente al base.
- Docencia y formación: ejemplo didáctico de cirugía de atención, adaptadores y destilación capa a capa con código mínimo.
- Validación de pipelines NeuralOps: probar la API `load_surgeried_model` y el flujo de carga parcial de pesos (`strict=False`) en integración continua.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor | Verificado |
|---|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validación) | Perplejidad | 102,92 | No (declarado por el autor) |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento consumió 13.892 MB en FP16 con maestros FP32. Para inferencia en FP16 de un modelo de 0,5B se espera un consumo bajo (del orden de 1-2 GB), aunque el dato no está confirmado en la información proporcionada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; no se especifican modelos concretos (A100, H100, RTX 4090) en la documentación.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño de 0,5B, aunque no se confirma en la información disponible.
- Opciones de despliegue: `transformers` con `apply_qwen_attention_surgery` + carga de `attention_weights.safetensors`, o la API `neuralops.hub.load_surgeried_model`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/qwen-2.5-0.5b-performer-attention-wikitext2` | 0,5B | no disponible | 102,92 | MIT | Pesos de atención únicamente |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5B | no disponible en la información | no disponible | Apache 2.0 (según el modelo base; no confirmado en esta ficha) | Checkpoint completo |
| Otros modelos del Attention Zoo de NeuralOps | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de perplejidad del modelo base ni de otras alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Perplejidad muy superior a la esperable en el modelo base Qwen2.5-0.5B: 102,92 frente a valores típicos mucho menores; la sustitución de atención degrada la calidad de forma sustancial.
- Solo se distribuyen los pesos de atención: no es un checkpoint autónomo; requiere cargar Qwen2.5-0.5B, aplicar la cirugía y cargar con `strict=False`.
- Entrenado exclusivamente sobre WikiText-2 en inglés; el dominio y el idioma están muy restringidos.
- No se documentan evaluaciones en tareas downstream (razonamiento, código, matemáticas, tool calling), por lo que su utilidad práctica más allá de la investigación es limitada.
- Riesgo de alucinación no evaluado; al ser un modelo de 0,5B con atención alterada, se espera un comportamiento frágil en generación libre.
- Sin información sobre sesgos; el corpus WikiText-2 tiene sesgos conocidos de Wikipedia en inglés.
- Licencia MIT permite uso comercial, pero la calidad del modelo hace desaconsejable su uso en producción sin validación previa.
- El módulo `PerformerAttention` no soporta RoPE según la tabla del autor, lo que puede afectar a la extrapolación de contexto más allá de los 512 tokens usados en entrenamiento.
- No hay datos sobre cuantización (GGUF, AWQ, GPTQ), por lo que el despliegue eficiente en CPU o GPUs pequeñas no está documentado.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-performer-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
- Paper FAVOR+ (Performer): no disponible en la información proporcionada

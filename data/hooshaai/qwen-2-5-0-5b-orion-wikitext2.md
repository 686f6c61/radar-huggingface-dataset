# Hooshaai/qwen-2.5-0.5b-orion-wikitext2

## Resumen

`Hooshaai/qwen-2.5-0.5b-orion-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente los bloques de atención del decodificador por el operador `ORIONAttention` del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El objetivo no es tanto ofrecer un modelo de produccion como servir de banco de pruebas para arquitecturas de atencion subcuadraticas sobre un transformer pequeno y bien conocido, validando si un operador alternativo puede recuperar calidad tras un reemplazo agresivo de capas mediante destilacion de conocimiento.

El modelo conserva el tokenizador y la configuracion base de Qwen2.5-0.5B (896 dimensiones ocultas, 14 cabezas de consulta, 2 cabezas KV, `head_dim=64`, 24 capas), pero 18 de esas 24 capas usan atencion ORION y solo 6 mantienen atencion cuadratica completa como anclas. El entrenamiento se limita a WikiText-2 (`wikitext-2-raw-v1`) con dos etapas de destilacion desde el modelo base, sin ajuste supervisado ni RLHF.

Su relevancia es metodologica: documenta de forma transparente el coste de la cirugia (perplejidad de 497.411 antes de destilar) y la recuperacion parcial hasta 209,62 de perplejidad en validacion. Es un artefacto de investigacion reproducible con licencia MIT, util para quien quiera estudiar tecnicas de reemplazo de atencion, no como sustituto de un modelo conversacional generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas `ORIONAttention` y 6/24 capas de atencion cuadratica completa |
| Parametros totales | No disponible (heredados de Qwen2.5-0.5B, ~0,5 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (ventana nativa de Qwen2.5-0.5B: 32.768 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, 59,29 MB), mas `config.json` y `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con atencion causal, RoPE y GQA (14 cabezas de consulta, 2 cabezas KV, `head_dim=64`, `hidden_size=896`). Sobre esa base se aplica un patron de cirugia `hybrid_3_1`: se sustituyen 18 de las 24 capas por `ORIONAttention` mediante `QwenAttentionAdapter`, que expande las cabezas KV 7x cuando es necesario y respeta el contrato de `o_proj` unico. Las capas en los indices `[3, 7, 11, 15, 19, 23]` se mantienen con atencion cuadratica completa como anclas. `ORIONAttention` soporta atencion causal, bidireccional, cross-attention y GQA nativo, y es un operador de atencion personalizado (`is_custom_attention = True`); no soporta RoPE de forma nativa (`supports_rope = N/A`).

El entrenamiento consiste en una destilacion de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 1 (alineacion con backbone congelado) ejecuta 78 pasos en 54,5 s con `lm_head` desactivado, usando MSE y coseno a nivel de capa oculta con peso 0,25. La etapa 2 (destilacion de representaciones multicapa) ejecuta 179 pasos en 125,3 s con pesos MSE/coseno de 0,50. En total, 257 pasos de optimizacion en 180,1 s con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando un pico de 17.404 MB de VRAM en FP16 con parametros maestros en FP32. No se documenta uso de RLHF, DPO ni SFT.

## Capacidades

- Generacion de texto causal autorregresiva en ingles, heredada del tokenizador y la cabeza `lm_head` de Qwen2.5-0.5B.
- Soporte de atencion causal, bidireccional y cross-attention a nivel de operador (utilidad principal como banco de pruebas).
- GQA nativo con expansion 7x de cabezas KV en las capas sustituidas.
- Capacidad multilingue limitada al ingles segun la model card.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta modo thinking, vision ni audio.
- No se documenta capacidad de codigo o matematicas mas alla de la heredada del modelo base, no validada tras la cirugia.

## Casos de uso

- Investigacion en atencion subcuadratica: sirve como punto de partida reproducible para comparar `ORIONAttention` frente a atencion cuadratica completa en un transformer pequeno, con telemetria de perplejidad antes y despues de la destilacion.
- Validacion de tecnicas de cirugia de capas: el patron `hybrid_3_1` y los indices de anclas permiten estudiar el impacto de reemplazar N capas de atencion sobre la estabilidad del modelo.
- Destilacion de conocimiento: el pipeline de dos etapas (alineacion con backbone congelado y destilacion multicapa) es reutilizable para otros operadores del `ATTENTION_REGISTRY`.
- Benchmarking de perplejidad en WikiText-2: util como referencia de linea base (209,62 PPL) para futuros experimentos con el mismo base model y dataset.
- Prototipado de operadores de atencion en FP16: el ejemplo de carga con `apply_qwen_attention_surgery` y `load_surgeried_model` permite iterar rapidamente en una sola GPU consumer de gama alta.
- Docencia y formacion: ejemplo didactico de como se sustituye atencion en un LLM y como se mide la recuperacion de calidad con metricas objetivas.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` (no verificados, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, split validation) | Perplejidad | 209,62 |

Telemetria de entrenamiento declarada por el autor:

| Etapa | Metrica | Valor |
|---|---|---|
| Stage 0 (post-cirugia, zero-shot) | Perplejidad causal | 497.411,42 |
| Post-KD | Perplejidad de validacion | 209,62 |
| Delta | Reduccion de perplejidad | -497.201,80 |
| Stage 1 | Pasos / tiempo | 78 / 54,5 s |
| Stage 2 | Pasos / tiempo | 179 / 125,3 s |
| Total | Pasos / tiempo | 257 / 180,1 s |
| Pico de VRAM | FP16 autocast + FP32 master | 17.404 MB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por tamano (~0,5 B parametros), cabria en GPUs consumer con 4-6 GB en FP16 y menos de 2 GB en cuantizacion de 4 bits.
- VRAM de entrenamiento documentada: 17.404 MB de pico con FP16 autocast y parametros maestros en FP32, `seq_len=512`, `grad_accum=4`.
- GPUs recomendadas: cualquier GPU con al menos 24 GB para reproducir el entrenamiento (A100, H100, RTX 3090/4090); para inferencia basta una GPU consumer de gama media.
- Cabe en GPU consumer: si, en RTX 3060 12 GB o superiores en FP16; en GPUs de 8 GB con cuantizacion.
- Opciones de despliegue: la model card solo documenta carga via `neuralops.hub.load_surgeried_model` y el flujo manual con `transformers` + `apply_qwen_attention_surgery`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/qwen-2.5-0.5b-orion-wikitext2` | ~0,5 B | No disponible | 209,62 (declarada, no verificada) | MIT | Hugging Face |
| `Qwen/Qwen2.5-0.5B` (base) | ~0,5 B | 32.768 tokens | No disponible en esta ficha | Apache 2.0 (Qwen) | Hugging Face |
| `Qwen/Qwen2.5-0.5B-Instruct` | ~0,5 B | 32.768 tokens | No disponible en esta ficha | Apache 2.0 (Qwen) | Hugging Face |

La comparacion directa con el modelo base en WikiText-2 no esta publicada en la informacion disponible, por lo que no es posible cuantificar la perdida exacta de calidad respecto al original.

## Limitaciones y advertencias

- Perplejidad de 209,62 en WikiText-2: muy superior a la de un modelo base sano de su tamano, lo que indica que la cirugia y la destilacion solo recuperan parcialmente la calidad original.
- Entrenamiento limitado a WikiText-2: no hay evidencia de generalizacion a otros dominios (codigo, matematicas, conversacion, multilingue).
- Solo ingles declarado; no se garantiza comportamiento correcto en castellano ni en otros idiomas.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso; no debe asumirse.
- `supports_rope = N/A` en `ORIONAttention`: el manejo posicional en las capas sustituidas no es el estandar de RoPE, lo que puede afectar a secuencias largas.
- Pesos distribuidos como delta de atencion (`attention_weights.safetensors`, 59,29 MB): requiere el modelo base Qwen2.5-0.5B y el codigo de NeuralOps (`apply_qwen_attention_surgery`) para cargarse; no es un checkpoint autonomo.
- La carga depende de `neuralops` y de `scripts.benchmarks.qwen_zoo_train_mix`, lo que introduce acoplamiento a un repositorio externo y riesgo de rotura de API.
- Resultados de benchmark marcados como `verified: false`; no han sido reproducidos de forma independiente.
- Licencia MIT permite uso comercial, pero la calidad del modelo no es adecuada para produccion sin validacion adicional.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion disponible; al ser un modelo pequeno y entrenado solo en WikiText-2, se espera un comportamiento limitado fuera de ese dominio.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-orion-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia MIT (NeuralOps): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext

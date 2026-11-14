# Hooshaai/qwen-2.5-0.5b-unified-rope-wikitext2

## Resumen

`qwen-2.5-0.5b-unified-rope-wikitext2` es un checkpoint experimental derivado de Qwen2.5-0.5B en el que el autor (Hooshaai) ha sustituido quirúrgicamente los bloques de atención del decoder original por un módulo propio denominado `unified_rope`, perteneciente al registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El objetivo no es ofrecer un modelo de propósito general competitivo, sino servir como banco de pruebas reproducible para estudiar cómo afecta la sustitución de atención a la perplejidad y a la estabilidad del entrenamiento en un transformer causal pequeño.

El modelo parte de los pesos de Qwen/Qwen2.5-0.5B (14 cabezas de consulta, 2 cabezas KV, `head_dim=64`, `hidden_size=896`, 24 capas) y aplica un patrón híbrido `hybrid_3_1`: 18 de las 24 capas usan `unified_rope` y 6 capas conservan la atención cuadrática completa como anclas. Sobre esta arquitectura modificada se ejecuta una destilación de conocimiento en dos etapas usando WikiText-2 (split de validación) como referencia, lo que reduce la perplejidad de 17,57 (post-cirugía, sin ajuste) a 15,14 tras el proceso de destilación.

Su relevancia es fundamentalmente metodológica: documenta con telemetría detallada (pasos, tiempos, VRAM, deltas de perplejidad) un flujo de "cirugía de atención" reproducible sobre un modelo abierto de 0,5B parámetros, útil para investigadores que exploran atenciones subcuadráticas o híbridas sin partir de cero. No debe confundirse con un modelo listo para producción conversacional: el propio autor lo presenta como artefacto de atención (solo se distribuyen los pesos de atención, no el modelo completo).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atención híbrida: 18/24 capas con `unified_rope` y 6/24 capas con atención cuadrática completa (patrón `hybrid_3_1`, anclas en índices 3, 7, 11, 15, 19, 23) |
| Parametros totales | 0,5B (heredados de Qwen2.5-0.5B; el repo solo distribuye pesos de atención) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento usa `seq_len=512`; no se especifica la ventana máxima soportada) |
| Tipos de cuantizacion | No disponible (los pesos se publican en safetensors FP16/FP32; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, 161,50 MB) más `config.json` y `tokenizer.json`; requiere el modelo base Qwen2.5-0.5B para cargarse |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only Qwen2 con 24 capas, 14 cabezas de consulta, 2 cabezas KV (GQA), `head_dim=64` y `hidden_size=896`. La modificación consiste en un `QwenAttentionAdapter` que mapea las proyecciones `Qwen2Attention` al módulo `UnifiedRoPE`, con expansión automática 7x de las cabezas KV cuando es necesario y un contrato de bypass de `o_proj` único. El módulo `unified_rope` declara soporte para atención causal, bidireccional, cross-attention, GQA nativa y RoPE, además de ser un operador de atención personalizado (`is_custom_attention`). El patrón `hybrid_3_1` intercala tres capas modificadas por cada capa cuadrática de anclaje, preservando 6 capas originales para mantener estabilidad.

El entrenamiento es una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`, validación): una primera etapa de alineación con backbone congelado (130 pasos, 54,3 s) que omite `lm_head` y usa MSE + coseno a nivel de capa con peso 0,25; y una segunda etapa de destilación multinivel de representaciones (299 pasos, 125,8 s) con MSE + coseno y peso 0,50. En total, 429 pasos y 180,4 s con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando 16 250 MB de VRAM pico en FP16 con autocast y parámetros maestros en FP32. La perplejidad causal pasa de 17,57 (post-cirugía, etapa 0) a 15,14 (post-destilación), un delta de -2,43.

## Capacidades

- Generación de texto causal autorregresiva (tarea principal declarada: `text-generation`).
- Atención causal, bidireccional y cross-attention a nivel de módulo (`UnifiedRoPE` declara soporte para las tres).
- Soporte nativo de GQA y de Rotary Position Embedding en el módulo de atención.
- Capacidad multilingüe: limitada a inglés según la model card.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documenta visión, audio ni modo "thinking".
- Al ser un checkpoint de atención sobre Qwen2.5-0.5B, hereda potencialmente las capacidades del base, pero el autor no las valida ni las garantiza; la única métrica reportada es perplejidad en WikiText-2.

## Casos de uso

- Investigación en atenciones subcuadráticas: el modelo sirve como referencia reproducible para medir el impacto de sustituir atención cuadrática por `unified_rope` en un transformer de 0,5B, con telemetría de perplejidad antes y después de la destilación.
- Reproducción de experimentos de "cirugía de atención": el script `apply_qwen_attention_surgery` y el patrón `hybrid_3_1` permiten replicar el pipeline sobre otros checkpoints Qwen2.5 y comparar deltas de perplejidad.
- Docencia y divulgación: al ser un modelo pequeño (0,5B) con solo pesos de atención (161,50 MB), se puede cargar y estudiar en entornos con recursos limitados para explicar GQA, RoPE y destilación de conocimiento.
- Validación de herramientas del ecosistema NeuralOps: el modelo se carga mediante `neuralops.hub.load_surgeried_model`, por lo que es útil para probar la API del hub y la integración con `transformers`.
- Benchmarking de perplejidad en WikiText-2: sirve como baseline controlado para comparar variantes de atención del `ATTENTION_REGISTRY` bajo el mismo protocolo (mismo dataset, mismo `seq_len`, mismo esquema de destilación).
- Pruebas de estabilidad numérica: la combinación de capas híbridas y anclas cuadráticas permite estudiar degradación de perplejidad y estabilidad de gradientes en arquitecturas mixtas.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` y en la telemetría de la model card (no verificados de forma independiente):

| Metrica | Dataset / split | Valor |
|---|---|---|
| Perplejidad (post-destilación) | WikiText-2 `wikitext-2-raw-v1`, validation | 15,14 |
| Perplejidad (post-cirugía, etapa 0) | WikiText-2 `wikitext-2-raw-v1`, validation | 17,57 |
| Delta de perplejidad | WikiText-2 `wikitext-2-raw-v1`, validation | -2,43 |
| Pasos totales de destilación | — | 429 (130 + 299) |
| Tiempo total de destilación | — | 180,4 s |
| VRAM pico (FP16 autocast, maestros FP32) | — | 16 250 MB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: el modelo base Qwen2.5-0.5B en FP16 ocupa aproximadamente 1 GB de pesos; los pesos de atención adicionales suman 161,50 MB. En la práctica, la inferencia en FP16 requiere del orden de 1,5-2 GB de VRAM incluyendo activaciones y overhead.
- VRAM para el entrenamiento de destilación: 16 250 MB pico documentados (FP16 autocast con parámetros maestros FP32), por lo que se necesita una GPU de al menos 16 GB.
- GPU recomendadas: para entrenamiento, una GPU con ≥16 GB (RTX 4090, A100 40 GB, H100); para inferencia, cualquier GPU consumer con ≥4 GB (RTX 3060, RTX 4060, RTX 4090) es suficiente.
- Cabe en GPU consumer: sí, tanto para inferencia como para reproducir la destilación en GPUs de 16 GB o más.
- Opciones de despliegue: la model card solo documenta carga vía `transformers` + `safetensors` y vía la API `neuralops.hub.load_surgeried_model`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ni se publican pesos en GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Perplejidad WikiText-2 |
|---|---|---|---|---|---|
| `Hooshaai/qwen-2.5-0.5b-unified-rope-wikitext2` | 0,5B | No disponible | MIT | Atención híbrida `unified_rope` + destilación | 15,14 (declarada) |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5B | 32 768 tokens (según ficha oficial de Qwen) | Apache 2.0 | Transformer Qwen2 estándar | No disponible en esta información |
| `Qwen/Qwen2.5-0.5B-Instruct` | 0,5B | 32 768 tokens (según ficha oficial de Qwen) | Apache 2.0 | Qwen2 + ajuste por instrucciones | No disponible en esta información |

La comparación directa con el modelo base es limitada porque el autor no reporta la perplejidad de Qwen2.5-0.5B original bajo el mismo protocolo; el único punto de referencia interno es la etapa 0 post-cirugía (17,57). Además, este checkpoint solo distribuye pesos de atención, por lo que no es directamente comparable como modelo completo sin cargar el base.

## Limitaciones y advertencias

- Solo se distribuyen los pesos de atención (`attention_weights.safetensors`); es imprescindible cargar Qwen/Qwen2.5-0.5B como base. No es un modelo autónomo.
- La única métrica reportada es perplejidad en WikiText-2 (validation); no hay evaluación en tareas downstream (razonamiento, código, matemáticas, diálogo).
- El modelo está entrenado y evaluado únicamente en inglés; no se garantiza comportamiento en otros idiomas.
- La perplejidad de 15,14 es superior a la de modelos de mayor tamaño y no se compara con el base original bajo el mismo protocolo, por lo que no debe interpretarse como una mejora sobre Qwen2.5-0.5B.
- Riesgo de alucinación: no evaluado; al ser un modelo de 0,5B con ajuste limitado a WikiText-2, es esperable un comportamiento generativo pobre fuera del dominio.
- No se documentan sesgos conocidos, pero al derivar de Qwen2.5-0.5B hereda los sesgos del corpus original de Qwen, no auditados en esta ficha.
- Licencia MIT para los pesos publicados; el modelo base Qwen2.5-0.5B se distribuye bajo Apache 2.0, por lo que conviene verificar la compatibilidad en uso comercial.
- El autor no documenta la longitud máxima de contexto soportada por el módulo `unified_rope`; el entrenamiento usa `seq_len=512`, por lo que extrapolar a contextos largos no está validado.
- La model card referencia el repo `tahamajs/qwen-2.5-0.5b-unified-rope-wikitext2` en los ejemplos de código, mientras que el ID real es `Hooshaai/qwen-2.5-0.5b-unified-rope-wikitext2`; hay que ajustar el `repo_id` en los scripts.
- La carga requiere el paquete `neuralops` y el script `scripts.benchmarks.qwen_zoo_train_mix`, que no forman parte de `transformers` estándar; la portabilidad a otros stacks no está garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-unified-rope-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia MIT del proyecto NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext

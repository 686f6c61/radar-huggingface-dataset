# Hooshaai/qwen-2.5-0.5b-moe-deltakv-paged-wikitext2

## Resumen

`qwen-2.5-0.5b-moe-deltakv-paged-wikitext2` es un checkpoint experimental publicado por Hooshaai dentro del proyecto NeuralOps "Attention Zoo". No es un modelo entrenado desde cero: parte de `Qwen/Qwen2.5-0.5B` y sustituye quirúrgicamente los bloques de atención del decodificador por el módulo `moe_deltakv_paged` (`MoEDeltaKVPagedAttention`), una atención híbrida con paginación de KV y componentes de mezcla de expertos. El objetivo es investigar arquitecturas de atención subcuadrática sobre un transformer denso ya preentrenado, manteniendo el resto de la red intacta.

El modelo conserva el tamaño del base (0,5 mil millones de parámetros, `hidden_size=896`, 24 capas, 14 cabezas de consulta y 2 cabezas KV con `head_dim=64`) y se ha ajustado mediante destilación de conocimiento en dos etapas sobre WikiText-2. La relevancia es sobre todo metodológica: documenta el coste y el resultado de reemplazar atención cuadrática por atención paginada con MoE en 18 de las 24 capas, preservando 6 capas ancla cuadráticas en los índices `[3, 7, 11, 15, 19, 23]`.

Conviene señalar desde el principio que el resultado de perplejidad es muy alto (1745,31 en la validación de WikiText-2) y que la propia telemetría indica delta cero entre la etapa previa y posterior a la destilación, lo que sugiere que el ajuste no ha recuperado calidad respecto al checkpoint base. Es, por tanto, un artefacto de investigación reproducible, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atención híbrida `moe_deltakv_paged` en 18/24 capas y atención cuadrática en 6 capas ancla |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B) |
| Parametros activos | no disponible (el módulo MoE no documenta expertos ni top-k en la información proporcionada) |
| Longitud de contexto | no disponible (el entrenamiento usó `seq_len=512`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors` 944,59 MB; `attention_weights.safetensors` 86,38 MB) |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen2.5-0.5B, un transformer decoder-only denso con GQA (14 cabezas de consulta, 2 cabezas KV, `head_dim=64`, `hidden_size=896`, 24 capas). Sobre esa base se aplica un patrón de cirugía `hybrid_3_1`: 18 de las 24 capas se transplantan con `MoEDeltaKVPagedAttention` mediante `QwenAttentionAdapter`, que realiza una expansión 14:2 de cabezas KV (7x cuando es necesario) y respeta el contrato de `o_proj` única. Las 6 capas restantes mantienen atención cuadrática completa como anclas. El módulo declara soporte causal, bidireccional, cross-attention y GQA nativo, pero no RoPE (`supports_rope: N/A`).

El ajuste se realiza mediante destilación de conocimiento en dos etapas sobre `wikitext-2-raw-v1`: una etapa de alineación con backbone congelado (86 pasos, 54,5 s, MSE y coseno sobre estados ocultos con peso 0,25, `lm_head` eludido) y una etapa de destilación multi-capa (198 pasos, 125,4 s, peso 0,50). En total, 284 pasos en 180,3 s con `seq_len=512`, `grad_accum=4`, `topk=64` y 15 119 MB de VRAM pico en FP16 con parámetros maestros en FP32. La innovación técnica principal es la propia sustitución modular de atención y la paginación del KV con dos rutas de ejecución: atención densa cuando `num_pages <= 1` o `enable_moe=False`, y atención MoE paginada en caso contrario.

## Capacidades

- Generación de texto causal autoregresiva, heredada del base Qwen2.5-0.5B.
- Conversación multi-turno básica (pipeline `text-generation`, tag `conversational`).
- Atención bidireccional y cross-attention a nivel de módulo (según la tabla de capacidades del autor).
- Soporte nativo de GQA en el módulo de atención transplantado.
- Capacidad de ejecutar atención densa o paginada según la longitud de secuencia y el flag `enable_moe`.
- Idioma: únicamente inglés (`language: en`).
- Tool calling, function calling, agentes, visión, audio y modo thinking: no disponible / no documentado.

## Casos de uso

- Investigación en atención subcuadrática: reproducir la cirugía `hybrid_3_1` sobre Qwen2.5-0.5B y medir el impacto en perplejidad y latencia, comparando rutas densa y paginada.
- Estudio de destilación post-cirugía: analizar la telemetría de las dos etapas (pasos, tiempos, VRAM, pesos de MSE/coseno) y evaluar por qué el delta de perplejidad es cero.
- Benchmarking de módulos de atención: usar `MoEDeltaKVPagedAttention` como referencia frente a otras entradas de `ATTENTION_REGISTRY` de NeuralOps sobre el mismo base.
- Prototipado de inferencia de bajo coste en GPU consumer: 0,5 B parámetros y pesos de ~1 GB permiten iterar localmente, aunque la calidad del checkpoint limita su uso a experimentos.
- Validación de pipelines de carga: probar `load_surgeried_model` y el `QwenAttentionAdapter` en entornos de integración continua antes de aplicar la cirugía a modelos mayores.
- Docencia y divulgación: ilustrar cómo se sustituye atención cuadrática por atención paginada con MoE y qué métricas deben registrarse (perplejidad pre/post, VRAM, pasos).

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (`verified: false`):

| Modelo | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| qwen-2.5-0.5b-moe-deltakv-paged-wikitext2 | Salesforce/wikitext (wikitext-2-raw-v1) | validation | Perplexity | 1745,31 |

Telemetría de entrenamiento declarada:

| Etapa | Pasos | Tiempo | Perplejidad |
|---|---:|---:|---:|
| Stage 0 (post-cirugía, zero-shot) | - | - | 1745,31 |
| Stage 1 (alineación, backbone congelado) | 86 | 54,5 s | - |
| Stage 2 (destilación multi-capa) | 198 | 125,4 s | 1745,31 |
| Total | 284 | 180,3 s | Delta +0,00 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM de entrenamiento documentada: 15 119 MB pico (FP16 con parámetros maestros FP32, `seq_len=512`, `grad_accum=4`).
- VRAM de inferencia estimada: no disponible de forma oficial; con pesos de ~1 GB en FP16, cabe holgadamente en GPUs consumer de 8 GB o más.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con al menos 8 GB (RTX 3060/4060, RTX 4090) debería alojar el modelo en FP16.
- Cabe en GPU consumer: sí, por tamaño de pesos (~1,03 GB totales entre `model.safetensors` y `attention_weights.safetensors`).
- Opciones de despliegue: la librería indicada es `neuralops`; el quick start usa `transformers` (`AutoModelForCausalLM`) junto con `apply_qwen_attention_surgery`. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible (no se documenta conversión a GGUF ni kernels para esos motores).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-moe-deltakv-paged-wikitext2 | 0,5 B | no disponible | 1745,31 (declarada, no verificada) | MIT | Hugging Face (321 descargas) |
| Qwen/Qwen2.5-0.5B (base) | 0,5 B | 32 768 tokens (según ficha del base; no confirmado en esta información) | no disponible en esta información | Apache 2.0 (según el base; no confirmado aquí) | Hugging Face |
| Otras entradas de NeuralOps Attention Zoo | variable | no disponible | no disponible | MIT (según el repo NeuralOps) | GitHub / Hugging Face |

La comparación directa de rendimiento con el base Qwen2.5-0.5B no es posible con los datos disponibles: la información proporcionada no incluye la perplejidad del modelo original en WikiText-2, por lo que no se puede cuantificar la pérdida atribuible a la cirugía.

## Limitaciones y advertencias

- Perplejidad de validación extremadamente alta (1745,31) en WikiText-2, muy por encima de lo esperable para un modelo de 0,5 B; sugiere degradación severa de calidad.
- Delta de perplejidad `+0,00` entre la etapa previa y posterior a la destilación: el ajuste no ha recuperado rendimiento respecto al checkpoint post-cirugía.
- Benchmark declarado como `verified: false`; debe tratarse como dato no auditado.
- Idioma limitado a inglés; no hay evidencia de capacidades multilingües.
- Longitud de contexto no documentada; el entrenamiento usó `seq_len=512`, lo que no garantiza buen comportamiento en secuencias largas pese a la paginación KV.
- Soporte RoPE marcado como `N/A` en el módulo, lo que puede afectar la extrapolación posicional.
- Sin datos de sesgos, alucinación o robustez; al ser un artefacto de investigación sobre un base pequeño, el riesgo de alucinación es alto y no está caracterizado.
- Licencia MIT permite uso comercial, pero la calidad del checkpoint desaconseja cualquier despliegue en producción.
- Dependencia de la librería `neuralops` y de scripts específicos (`apply_qwen_attention_surgery`); no hay conversión documentada a formatos estándar de inferencia.
- El quick start de la model card referencia el repositorio `tahamajs/qwen-2.5-0.5b-moe-deltakv-paged-wikitext2`, distinto del ID publicado por Hooshaai; conviene verificar a qué artefacto apuntan las rutas.
- Ausencia de información sobre expertos MoE (número, top-k, parámetros activos), lo que impide evaluar el coste real de la ruta paginada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-moe-deltakv-paged-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
- Repositorio alternativo citado en el quick start: https://huggingface.co/tahamajs/qwen-2.5-0.5b-moe-deltakv-paged-wikitext2

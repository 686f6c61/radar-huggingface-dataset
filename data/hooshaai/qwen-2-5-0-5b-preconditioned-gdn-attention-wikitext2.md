# Hooshaai/qwen-2.5-0.5b-preconditioned-gdn-attention-wikitext2

## Resumen

El modelo `Hooshaai/qwen-2.5-0.5b-preconditioned-gdn-attention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente 18 de las 24 capas de atención del decodificador original por el módulo `PreconditionedGDNAttention`, una variante de atención subcuadrática basada en Gated DeltaNet con precondicionamiento de curvatura (covarianza empírica y curvatura diagonal). Lo publica el usuario Hooshaai dentro del proyecto NeuralOps "Attention Zoo", un repositorio de experimentos que reemplaza mecanismos de atención estándar por alternativas lineales o subcuadráticas sobre modelos preentrenados.

El modelo base Qwen2.5-0.5B es un transformer causal de 0,5 mil millones de parámetros con GQA (14 cabezas de consulta y 2 de clave/valor, `head_dim=64`, `hidden_size=896`). Sobre esa arquitectura se aplica un patrón híbrido `hybrid_3_1`: tres capas con atención GDN precondicionada por cada capa que conserva la atención cuadrática completa, manteniendo anclas cuadráticas en los índices 3, 7, 11, 15, 19 y 23. El resultado es un modelo de investigación orientado a medir el impacto de mecanismos de atención alternativos, no un modelo listo para producción.

La relevancia de esta ficha es acotada y debe interpretarse como tal: se trata de un artefacto de investigación con telemetría de destilación de conocimiento en dos etapas, publicado bajo licencia MIT y con un tamaño de repositorio de 0,2 GB. Su perplexity declarada en WikiText-2 es de 64264,64, un valor extremadamente alto que refleja que el proceso de sustitución y alineación no ha convergido hacia un modelo utilizable para generación de texto de calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal Qwen2 con 18/24 capas de atención sustituidas por `PreconditionedGDNAttention` (patrón híbrido `hybrid_3_1`) y 6 capas cuadráticas ancla |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el entrenamiento usó `seq_len=512`) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors FP16/FP32 según el script de carga) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `attention_weights.safetensors` (132,36 MB), más `config.json` y `tokenizer.json` |
| Librería | `neuralops` |
| Modelo base | `Qwen/Qwen2.5-0.5B` |
| Tamaño del repositorio | 0,2 GB |
| Descargas | 449 |
| Likes | 1 |

## Arquitectura y entrenamiento

La arquitectura parte del transformer causal de Qwen2.5-0.5B, con 24 capas, GQA de 14 cabezas de consulta y 2 de clave/valor, `head_dim=64` y `hidden_size=896`. Sobre él se aplica un `QwenAttentionAdapter` que mapea las proyecciones de `Qwen2Attention` y expande automáticamente las cabezas KV (factor 7x) donde es necesario, respetando un contrato de única `o_proj`. El patrón de sustitución es `hybrid_3_1`: 18 de las 24 capas usan `PreconditionedGDNAttention` y 6 conservan atención cuadrática completa como anclas en los índices `[3, 7, 11, 15, 19, 23]`.

El módulo `PreconditionedGDNAttention` implementa un Gated DeltaNet con precondicionamiento de curvatura: aplica `P_t = (diag(s_t) + lambda * I)^{-1/2}` sobre la clave (`k_tilde_t = P_t @ k_t`) y actualiza el estado recurrente mediante `S_t = alpha_t * S_{t-1}(I - beta_t * k_tilde_t k_tilde_t^T) + beta_t * k_tilde_t v_t^T`. Según la model card, el módulo soporta causalidad autoregresiva, bidireccionalidad, cross-attention y GQA nativo, y no usa RoPE (`supports_rope: N/A`). Es un operador de atención personalizado (`is_custom_attention: Yes`).

El entrenamiento consistió en una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 1 (alineación con backbone congelado) usó 2 pasos y 60,4 s, con `lm_head` desactivado y pérdida MSE + coseno por capa (peso 0,25). La etapa 2 (destilación multi-capa de representaciones) usó 4 pasos y 120,3 s, con peso 0,50. En total, 6 pasos de optimización y 181,0 s, con `seq_len=512`, `grad_accum=4`, `topk=64` y un pico de VRAM de 12358 MB en FP16 con parámetros maestros en FP32. No se documenta número de tokens de entrenamiento, composición del dataset más allá de WikiText-2, ni uso de RLHF o DPO.

## Capacidades

- Generación de texto causal autoregresiva, según el `pipeline_tag: text-generation` y el soporte `supports_causal` del módulo.
- Soporte bidireccional a nivel de módulo de atención (`supports_bidirectional: Yes`), aunque el modelo completo se publica como causal.
- Soporte de cross-attention a nivel de módulo (`supports_cross_attention: Yes`).
- Soporte nativo de GQA (`supports_gqa: Yes`).
- Tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés (`language: en`).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.
- Al ser un experimento de atención, la capacidad práctica de generación está fuertemente degradada según la perplexity declarada.

## Casos de uso

- Investigación sobre atención subcuadrática: el modelo sirve como banco de pruebas para medir el efecto de sustituir atención cuadrática por Gated DeltaNet precondicionada en un transformer preentrenado, comparando la perplexity resultante frente al Qwen2.5-0.5B original.
- Estudio de patrones híbridos de atención: permite evaluar la configuración `hybrid_3_1` (18 capas GDN frente a 6 anclas cuadráticas) y su impacto en la estabilidad del entrenamiento y en la calidad de representación.
- Reproducción de destilación de conocimiento en dos etapas: la telemetría publicada (6 pasos, 181 s, pico de 12358 MB) facilita reproducir el pipeline de alineación con backbone congelado y destilación multi-capa sobre WikiText-2.
- Análisis de adaptadores de atención: el `QwenAttentionAdapter` con expansión 7x de cabezas KV y contrato de única `o_proj` es útil para estudiar compatibilidad entre módulos de atención personalizados y arquitecturas GQA existentes.
- Docencia y divulgación técnica: como ejemplo didáctico de cirugía de atención, precondicionamiento de curvatura y destilación de representaciones en modelos pequeños.
- Validación de infraestructura NeuralOps: el modelo permite probar la API `load_surgeried_model` y el registro `ATTENTION_REGISTRY` del proyecto NeuralOps en un caso real de carga desde Hugging Face Hub.
- No se recomienda su uso en producción para generación de texto, atención al cliente, código o tareas de razonamiento, dado el valor de perplexity declarado.

## Benchmarks y rendimiento

| Benchmark | Dataset / split | Métrica | Valor | Verificado |
|---|---|---|---|---|
| Causal Language Modeling | `Salesforce/wikitext` / `wikitext-2-raw-v1` / validation | Perplexity | 64264,64 | No |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card indica que la perplexity pre-KD (etapa 0, cero-shot tras la cirugía) y la post-KD son idénticas (64264,64), con un delta de +0,00, lo que sugiere que las 6 pasos de destilación no alteraron la métrica declarada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El entrenamiento reportó un pico de 12358 MB en FP16 con parámetros maestros en FP32; la inferencia en FP16 de un modelo de 0,5B debería situarse en el entorno de 1-2 GB, aunque no se documenta.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs de consumo como RTX 3060, RTX 4060 o superiores, pero no hay validación publicada.
- ¿Cabe en consumer GPU? Probablemente sí por tamaño (0,5B), pero el modelo requiere el stack `neuralops` y el script de cirugía `apply_qwen_attention_surgery`, no una carga estándar de `transformers`.
- Opciones de despliegue: la model card documenta dos vías, ambas con `neuralops`: carga manual con `AutoModelForCausalLM` + `apply_qwen_attention_surgery` + `attention_weights.safetensors`, o la API `load_surgeried_model` del Hub de NeuralOps. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `Hooshaai/qwen-2.5-0.5b-preconditioned-gdn-attention-wikitext2` | 0,5B | No disponible | MIT | safetensors (solo atención) | Checkpoint experimental con atención GDN precondicionada; PPL WikiText-2 de 64264,64 |
| `Qwen/Qwen2.5-0.5B` | 0,5B | 32768 tokens (según Qwen2.5) | Apache 2.0 | safetensors, GGUF | Modelo base original, listo para producción; PPL WikiText-2 no declarada en esta ficha |
| `Qwen/Qwen2.5-0.5B-Instruct` | 0,5B | 32768 tokens (según Qwen2.5) | Apache 2.0 | safetensors, GGUF | Variante ajustada por instrucciones del mismo base; uso conversacional |

La comparativa se limita al modelo base y su variante Instruct porque no se dispone de información sobre otros checkpoints del Attention Zoo de NeuralOps ni sobre alternativas de atención subcuadrática comparables publicadas con métricas en la información proporcionada. El modelo aquí descrito no es directamente comparable en rendimiento con el Qwen2.5-0.5B original, ya que la perplexity declarada es varios órdenes de magnitud superior.

## Limitaciones y advertencias

- Perplexity extremadamente alta (64264,64 en WikiText-2), lo que indica que el modelo no genera texto coherente de forma fiable y no es apto para uso en producción.
- La destilación de conocimiento no redujo la perplexity (delta +0,00 entre etapa 0 y post-KD), por lo que la alineación tras la cirugía de atención no se tradujo en mejora medible.
- Solo se publican los pesos de atención (`attention_weights.safetensors`), no un checkpoint completo; es necesario descargar el modelo base y aplicar la cirugía con el script de NeuralOps.
- Dependencia del stack `neuralops` y de `scripts.benchmarks.qwen_zoo_train_mix`; no es cargable con un `from_pretrained` estándar de `transformers`.
- Idiomas: solo inglés; no se documenta soporte multilingüe.
- Longitud de contexto: no disponible; el entrenamiento usó `seq_len=512`, muy por debajo del contexto nativo de Qwen2.5.
- Sesgos conocidos: no documentados en la información proporcionada; al derivar de Qwen2.5-0.5B, hereda los sesgos del corpus original, pero no se detallan.
- Riesgo de alucinación: alto por la degradación de la calidad del modelo, aunque no se cuantifica.
- Licencia MIT: permite uso comercial según los términos de la licencia, pero el estado experimental del checkpoint desaconseja su uso en producción.
- No se documentan evaluaciones de seguridad, alineación ni filtrado de contenido.
- El identificador del repositorio en la model card (`tahamajs/...`) difiere del ID de Hugging Face (`Hooshaai/...`), lo que puede causar confusión al cargar el modelo con la API de NeuralOps.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-preconditioned-gdn-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia MIT de NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
- Papers, blogs y demos adicionales: no disponibles en la información proporcionada.

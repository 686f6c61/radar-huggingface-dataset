# Hooshaai/qwen-2.5-0.5b-minimal-svd-wikitext2

## Resumen

`Hooshaai/qwen-2.5-0.5b-minimal-svd-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente los bloques de atención de 18 de sus 24 capas por el módulo `minimal_svd` del registro `ATTENTION_REGISTRY` del framework NeuralOps. El objetivo no es producir un modelo listo para producción, sino servir como banco de pruebas reproducible para estudiar la viabilidad de mecanismos de atención subcuadrática (en concreto, atención factorizada por SVD de bajo rango) sobre arquitecturas transformer estándar mediante destilación de conocimiento.

El modelo parte de la arquitectura Qwen2 (14 cabezas de consulta, 2 cabezas KV, `head_dim=64`, `hidden_size=896`, aproximadamente 0,5 mil millones de parámetros) y aplica un patrón híbrido `hybrid_3_1`: tres capas con atención `minimal_svd` por cada capa que conserva la atención cuadrática original, manteniendo seis capas ancla en los índices `[3, 7, 11, 15, 19, 23]`. Tras la cirugía, el modelo se recupera mediante un proceso de destilación en dos etapas sobre WikiText-2.

Su relevancia es fundamentalmente metodológica: documenta de forma transparente el coste de reemplazar atención (la perplejidad se dispara a 510.683,39 antes de destilar) y la recuperación alcanzable con un presupuesto de entrenamiento muy reducido (428 pasos, 180,5 segundos). La perplejidad final de 242,01 en la validación de WikiText-2 sigue siendo muy superior a la del modelo base, por lo que debe interpretarse como una prueba de concepto, no como un sustituto funcional de Qwen2.5-0.5B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atención híbrida: 18/24 capas con `MinimalSVDAttention` (SVD-factorizada de bajo rango) y 6/24 capas con atención cuadrática original |
| Parametros totales | No disponible (el modelo base Qwen2.5-0.5B ronda los 0,5 mil millones; el checkpoint pesa 976,69 MB en total) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento usó `seq_len=512`; la ventana nativa del modelo base no se documenta en la información proporcionada) |
| Tipos de cuantizacion | No disponible (pesos publicados en FP16; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`model.safetensors` 917,45 MB, `attention_weights.safetensors` 59,24 MB), `config.json`, `tokenizer.json` |

## Arquitectura y entrenamiento

La arquitectura parte del decoder Qwen2 estándar y aplica una "cirugía" de atención mediante `QwenAttentionAdapter`, que mapea las proyecciones originales (`14` cabezas de consulta, `2` cabezas KV, `head_dim=64`, `hidden_size=896`) al módulo `MinimalSVDAttention`. Este módulo implementa una atención factorizada por descomposición en valores singulares de bajo rango, con soporte para atención causal, bidireccional, cross-attention y GQA nativo. El patrón `hybrid_3_1` intercala tres capas `minimal_svd` por cada capa cuadrática, preservando seis capas ancla completas. El adaptador aplica una expansión automática de 7x de las cabezas KV y fuerza un contrato de `o_proj` único.

El entrenamiento consiste en una destilación de conocimiento en dos etapas sobre `wikitext-2-raw-v1`. La etapa 0 (baseline cero-shot tras la cirugía) arroja una perplejidad causal de 510.683,39, lo que evidencia el colapso inicial del modelo. La etapa 1 (alineación con backbone congelado, 130 pasos, 54,4 s) omite el `lm_head` y minimiza MSE y coseno a nivel de capa (`0.25`). La etapa 2 (destilación de representación multicapa, 298 pasos, 125,8 s) repite el proceso con peso coseno `0.50`. En total, 428 pasos en 180,5 s con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando un pico de 15.507 MB de VRAM en FP16 con parámetros maestros en FP32. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de texto autoregresiva causal, heredada de la arquitectura Qwen2.
- Soporte de atención causal, bidireccional y cross-attention a nivel de módulo (según el perfil de capacidades de `MinimalSVDAttention`).
- Soporte nativo de GQA (grouped-query attention) con expansión 7x de cabezas KV.
- Capacidad multilingüe limitada al inglés según la model card.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Investigación sobre atención subcuadrática: el checkpoint sirve como referencia reproducible para medir el impacto de sustituir atención cuadrática por `minimal_svd` en un transformer pequeño, con telemetría completa de perplejidad antes y después de la destilación.
- Reproducción de experimentos de destilación: los 428 pasos y 180,5 s documentados permiten replicar el pipeline en una sola GPU de 16 GB, útil para validar metodologías de knowledge distillation a nivel de capa.
- Benchmark de frameworks de atención: al integrarse en NeuralOps, permite comparar `minimal_svd` frente a otros módulos del `ATTENTION_REGISTRY` bajo el mismo protocolo de cirugía y destilación.
- Estudio de patrones híbridos: el layout `hybrid_3_1` con capas ancla en índices concretos facilita analizar qué capas toleran mejor la sustitución de atención sin colapso.
- Docencia y formación: modelo pequeño (0,5B) y repo de 0,1 GB que cabe en cualquier entorno de laboratorio para explicar cirugía de atención y destilación.
- Pruebas de integración de la API `neuralops.hub.load_surgeried_model`: útil para validar el cargador universal de checkpoints con pesos quirúrgicos antes de escalar a modelos mayores.
- No recomendado para generación de texto en producción: la perplejidad de 242,01 en WikiText-2 indica una calidad muy degradada respecto al modelo base.

## Benchmarks y rendimiento

| Modelo | Dataset | Métrica | Valor |
|---|---|---|---|
| qwen-2.5-0.5b-minimal-svd-wikitext2 | wikitext-2-raw-v1 (validation) | Perplejidad | 242,01 |
| qwen-2.5-0.5b-minimal-svd-wikitext2 (Stage 0, pre-KD) | wikitext-2-raw-v1 | Perplejidad | 510.683,39 |

Los resultados proceden del `model-index` declarado por el autor (`verified: false`). No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM de inferencia: el checkpoint completo pesa 976,69 MB en FP16, por lo que la inferencia cabe holgadamente en GPUs de 4-8 GB.
- VRAM de entrenamiento (destilación): pico documentado de 15.507 MB (unos 15,1 GB) con FP16 autocast y parámetros maestros en FP32.
- GPU recomendadas para entrenamiento: cualquier GPU con al menos 16 GB (RTX 4080, RTX 4090, A100 40 GB, H100).
- GPU para inferencia: cabe en GPUs de consumo como RTX 3060 12 GB, RTX 4060 Ti, RTX 4090, e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: la model card solo documenta carga vía `transformers` (`AutoModelForCausalLM`) y la API `neuralops.hub.load_surgeried_model`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la naturaleza quirúrgica de los pesos probablemente requiera el adaptador de NeuralOps.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-minimal-svd-wikitext2 | ~0,5B | No disponible | 242,01 | MIT | Hugging Face |
| Qwen/Qwen2.5-0.5B (base) | ~0,5B | No disponible en esta ficha | No disponible en esta ficha | Apache 2.0 (según el modelo base) | Hugging Face |
| Otros checkpoints del NeuralOps Attention Zoo | Variable | No disponible | No disponible | MIT | Hugging Face |

La comparación directa con el modelo base no es posible con los datos proporcionados, ya que no se incluye la perplejidad de `Qwen/Qwen2.5-0.5B` en WikiText-2. La diferencia de licencia (MIT frente a Apache 2.0 del base) y la degradación de perplejidad son los ejes principales de comparación.

## Limitaciones y advertencias

- Calidad muy degradada: la perplejidad de 242,01 en WikiText-2 es indicativa de un modelo que no conserva la calidad del base; no es apto para generación de texto en producción.
- Entrenamiento mínimo: solo 428 pasos y 180,5 s de destilación, insuficientes para recuperar plenamente el rendimiento tras la cirugía.
- Idiomas: solo inglés declarado; no se garantiza comportamiento en castellano ni en otros idiomas.
- Contexto: el entrenamiento usó `seq_len=512`; no se documenta la ventana nativa soportada tras la cirugía.
- Dependencia de NeuralOps: los pesos requieren el adaptador `QwenAttentionAdapter` y el módulo `MinimalSVDAttention`; no son cargables con `transformers` estándar sin aplicar la cirugía.
- Riesgo de alucinación: elevado por la degradación de perplejidad y la falta de ajuste fino conversacional.
- Sin datos de sesgo: no se documentan evaluaciones de sesgo, toxicidad ni robustez.
- Benchmarks no verificados: el `model-index` marca `verified: false`; los resultados son declarados por el autor.
- Licencia MIT: permite uso comercial, pero la calidad del modelo hace inviable ese escenario en la práctica.
- Repositorio de 0,1 GB: el tamaño declarado en Hugging Face no coincide exactamente con la suma de artefactos (unos 0,98 GB); conviene verificar la integridad al descargar.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-minimal-svd-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Framework NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext

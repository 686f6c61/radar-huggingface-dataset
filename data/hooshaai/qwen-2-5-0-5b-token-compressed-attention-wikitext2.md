# Hooshaai/qwen-2.5-0.5b-token-compressed-attention-wikitext2

## Resumen

El modelo `qwen-2.5-0.5b-token-compressed-attention-wikitext2`, publicado por el usuario Hooshaai bajo el paraguas del proyecto NeuralOps, es un checkpoint experimental de Qwen2.5-0.5B en el que se han sustituido quirúrgicamente 18 de las 24 capas de atención del decoder original por un mecanismo propietario denominado `TokenCompressedAttention`, una atención subcuadrática basada en compresión de tokens por chunks. El objetivo no es ofrecer un modelo de propósito general, sino servir como artefacto de investigación para estudiar la viabilidad de mecanismos de atención eficientes sobre un backbone ya entrenado, midiendo la degradación y la recuperación de perplejidad tras un proceso de destilación de conocimiento en dos etapas.

El modelo parte de la base Qwen/Qwen2.5-0.5B (896 dimensiones ocultas, 14 cabezas de consulta, 2 cabezas KV, `head_dim=64`) y ha sido ajustado exclusivamente sobre el split de validación de WikiText-2 (`wikitext-2-raw-v1`), lo que lo convierte en un banco de pruebas controlado más que en un modelo desplegable en producción. La perplejidad final declarada es de 36,81, partiendo de una línea base post-cirugía de 235,49, lo que evidencia una recuperación sustancial pero también una brecha considerable respecto al modelo original.

Su relevancia actual radica en el interés creciente por arquitecturas de atención subcuadráticas (linear attention, sparse attention, token merging) que reduzcan el coste cuadrático del transformer estándar en contextos largos. Este checkpoint ofrece un caso reproducible de cómo transplantar un módulo de atención alternativo preservando capas de anclaje cuadráticas, con telemetría detallada del proceso de destilación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas con `TokenCompressedAttention` y 6/24 capas con atencion cuadratica completa (patron `hybrid_3_1`) |
| Parametros totales | No disponible de forma explicita; el modelo base Qwen2.5-0.5B tiene aproximadamente 494 millones de parametros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el entrenamiento uso `seq_len=512` |
| Tipos de cuantizacion | No disponible (los pesos se distribuyen en safetensors FP16) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, 163,48 MB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only Qwen2 en el que se ha aplicado una "cirugia" de atención: se reemplazan los bloques de atención estándar de 18 capas por el módulo `TokenCompressedAttention`, que implementa una compresión causal de tokens basada en chunks. En modo decoder, la secuencia se divide en chunks de tamaño `chunk_size`; dentro de cada chunk se conservan los `top-k` tokens según una puntuación de importancia calculada como `0.5 * ||x|| + learned_score(x) + 0.5 * causal_attn_score(x)`, además del token 0 y los últimos `local_window` tokens del chunk. Los chunks futuros nunca influyen en las selecciones de chunks pasados, garantizando causalidad. En modo encoder (bidireccional) la selección es top-k global sin chunking. El módulo soporta GQA nativo, cross-attention y atención bidireccional, según la model card.

El proceso de adaptación se realizó mediante un `QwenAttentionAdapter` que mapea las proyecciones originales (14 cabezas de consulta, 2 cabezas KV, `head_dim=64`, `hidden_size=896`) con expansión automática 7x de cabezas KV y un contrato de bypass de una sola `o_proj`. Se preservaron 6 capas de anclaje cuadráticas completas en los índices `[3, 7, 11, 15, 19, 23]` para mantener estabilidad. El entrenamiento consistió en una destilación de conocimiento en dos etapas sobre WikiText-2: una primera etapa de alineación con backbone congelado (119 pasos, 54,2 s, MSE y coseno por capa con peso 0,25) y una segunda de destilación multi-capa (277 pasos, 125,8 s, peso 0,50), sumando 396 pasos en 180,3 s con `seq_len=512`, `grad_accum=4` y `topk=64`. El pico de VRAM fue de 15.855 MB en FP16 con autocast y parámetros maestros en FP32.

## Capacidades

- Generación de texto autoregresiva causal en inglés, heredada del backbone Qwen2.5-0.5B.
- Atención subcuadrática con compresión de tokens por chunks, pensada para reducir el coste computacional en secuencias largas.
- Soporte de GQA nativo (14 cabezas de consulta, 2 KV) con expansión 7x en el adaptador.
- Soporte de atención bidireccional y cross-attention a nivel de módulo (según la model card del módulo).
- Capacidad de ejecutarse con la API universal de NeuralOps (`load_surgeried_model`) o mediante cirugía manual con `apply_qwen_attention_surgery`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.
- Multilingüismo limitado al inglés según el campo `language: en`.

## Casos de uso

- Investigación en atención eficiente: el checkpoint permite reproducir y comparar el impacto de `TokenCompressedAttention` frente a atención cuadrática completa sobre un backbone conocido, midiendo perplejidad en WikiText-2 con la telemetría ya publicada (235,49 → 36,81).
- Experimentos de destilación de conocimiento: sirve como referencia para estudiar la recuperación de perplejidad tras sustituir módulos de atención, con dos etapas documentadas y pesos por capa (MSE + coseno) ajustables.
- Benchmarking de patrones híbridos: el patrón `hybrid_3_1` con 6 capas de anclaje cuadráticas permite evaluar el equilibrio entre eficiencia y calidad en función del número de capas sustituidas.
- Desarrollo de módulos en NeuralOps: útil como caso de prueba para validar el `ATTENTION_REGISTRY`, el `QwenAttentionAdapter` y la API `load_surgeried_model` antes de aplicarlos a modelos mayores.
- Estudio de compresión de tokens por chunks: permite analizar cómo afectan `chunk_size`, `topk` y `local_window` a la calidad de la generación en un entorno controlado de un solo dataset.
- Docencia y divulgación: ejemplo didáctico de cirugía de atención sobre un modelo pequeño (0,5B) que cabe en una GPU de consumo y cuyo entrenamiento completo dura menos de 4 minutos en una sola GPU.

## Benchmarks y rendimiento

| Modelo | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| qwen-2.5-0.5b-token-compressed-attention-wikitext2 | wikitext-2-raw-v1 (validation) | Perplexity | 36,81 | No (declarado por el autor) |

Telemetría interna del proceso de destilación (declarada por el autor):

| Metrica | Valor |
|---|---|
| Perplejidad causal pre-KD (etapa 0, post-cirugia) | 235,49 |
| Perplejidad causal post-KD | 36,81 |
| Delta de perplejidad | -198,67 |
| Pasos etapa 1 (alineacion con backbone congelado) | 119 (54,2 s) |
| Pasos etapa 2 (destilacion multi-capa) | 277 (125,8 s) |
| Pasos totales / tiempo total | 396 / 180,3 s |
| VRAM pico | 15.855 MB |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-0.5B en FP16 ocupa aproximadamente 1 GB; los pesos de atención destilados suman 163,48 MB adicionales. En FP16 cabe holgadamente en cualquier GPU con 4 GB o más.
- El entrenamiento reportado consumió 15.855 MB de VRAM pico (FP16 autocast con parámetros maestros FP32), por lo que se necesitó al menos una GPU de 16 GB (por ejemplo, RTX 4080, RTX 4090, A100 40 GB, H100).
- GPU recomendadas para inferencia: cualquier GPU de consumo moderna (RTX 3060 12 GB, RTX 4060 Ti, RTX 4090) e incluso iGPU con suficiente memoria unificada; para entrenamiento, A100 o H100 por comodidad, aunque una RTX 4090 es suficiente.
- Opciones de despliegue: la model card documenta carga vía `transformers` + `apply_qwen_attention_surgery` (requiere el paquete NeuralOps) y vía `neuralops.hub.load_surgeried_model`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y probablemente no funcionen directamente por la atencion personalizada.
- Latencia y throughput: no disponibles en la información proporcionada. El tiempo de entrenamiento (180,3 s para 396 pasos con `seq_len=512`) sugiere un throughput modesto pero funcional en una sola GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-token-compressed-attention-wikitext2 | ~0,5B | No disponible | 36,81 (declarada) | MIT | Hugging Face (Hooshaai) |
| Qwen/Qwen2.5-0.5B (base) | ~0,5B | 32.768 tokens (según documentacion oficial de Qwen) | No disponible en esta ficha | Apache 2.0 | Hugging Face |
| Modelos de atención eficiente comparables (p. ej. variantes de linear attention sobre Qwen) | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa con el modelo base no es posible con los datos proporcionados, ya que no se incluye la perplejidad de Qwen2.5-0.5B sin cirugía sobre WikiText-2. La única referencia interna es la línea base post-cirugía pre-destilación (235,49), que no equivale al modelo original.

## Limitaciones y advertencias

- Modelo de investigación: entrenado exclusivamente sobre WikiText-2, un corpus de Wikipedia en inglés; no debe usarse como modelo de propósito general ni en producción.
- La perplejidad de 36,81 está declarada por el autor y no ha sido verificada de forma independiente (`verified: false`).
- El proceso de cirugía degrada severamente la calidad inicial (235,49 de perplejidad antes de la destilación), lo que indica que la atención comprimida no preserva el comportamiento original sin un ajuste específico.
- Idiomas: solo inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Longitud de contexto: el entrenamiento usó `seq_len=512`; no se documenta el contexto máximo efectivo tras la cirugía, y la compresión por chunks puede degradar el rendimiento en secuencias muy largas.
- No se documenta soporte de tool calling, agentes, visión ni otras capacidades avanzadas del Qwen2.5 original; es probable que se hayan perdido o no se hayan evaluado.
- Dependencia del paquete NeuralOps (`neuralops`, `apply_qwen_attention_surgery`, `load_surgeried_model`) para cargar los pesos; no es un checkpoint estándar de `transformers` y no funcionará con `AutoModelForCausalLM.from_pretrained` sin la cirugía previa.
- Riesgo de alucinación: inherente a los modelos de 0,5B y agravado por el ajuste limitado a un único dataset.
- Licencia MIT: permite uso comercial, pero el modelo base Qwen2.5-0.5B tiene licencia Apache 2.0, por lo que conviene revisar la compatibilidad en despliegues comerciales.
- Sesgos: no se documenta ninguna evaluación de sesgos; al entrenarse sobre Wikipedia en inglés, hereda los sesgos de ese corpus.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-token-compressed-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
- Paper o blog adicional: no disponible en la información proporcionada.

# Hooshaai/qwen-2.5-0.5b-sink-attention-wikitext2

## Resumen

`Hooshaai/qwen-2.5-0.5b-sink-attention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente los bloques de atención del decodificador por una implementación propia de *sink attention* (estilo StreamingLLM con tokens sumidero y caché KV rodante) procedente del registro `ATTENTION_REGISTRY` del framework NeuralOps. El modelo lo publica el usuario Hooshaai y forma parte de la denominada "Qwen Attention Zoo", una colección de variantes de atención subcuadrática destiladas sobre modelos Qwen.

El interés no reside en sus capacidades generativas —es un modelo de 0,5 mil millones de parámetros afinado únicamente sobre WikiText-2— sino en servir como banco de pruebas reproducible para investigar el reemplazo de atención cuadrática por mecanismos con ventana y sumideros en arquitecturas transformer ya entrenadas. La técnica empleada es una destilación de conocimiento en dos etapas que recupera la perplejidad tras la cirugía de atención: de 618,03 PPL en cero-shot tras el injerto se pasa a 49,65 PPL final sobre la validación de WikiText-2.

La relevancia actual es metodológica: demuestra que es posible transplantar atención subcuadrática en un modelo preentrenado con solo 539 pasos de optimización (unos 180 segundos) y recuperar buena parte del rendimiento en lenguaje, lo que abre la puerta a experimentos de eficiencia de contexto sobre pesos abiertos sin reentrenar desde cero.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atención híbrida: 18/24 capas con `SinkAttention` (sumideros + ventana KV) y 6/24 capas con atención cuadrática completa |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible explícitamente; el entrenamiento usa `seq_len=512`, la ventana KV se define por `window_size` y `num_sink_tokens` (valores concretos no publicados) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors FP16) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 161,50 MB) + `config.json` + `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con 24 capas, `hidden_size=896`, 14 cabezas de consulta y 2 cabezas KV (GQA con `head_dim=64`). Sobre esa base se aplica un patrón de cirugía `hybrid_3_1`: se intercalan bloques con `SinkAttention` y se preservan seis capas con atención cuadrática completa en los índices `[3, 7, 11, 15, 19, 23]` como anclas. El adaptador `QwenAttentionAdapter` gestiona la proyección de las 14 cabezas Q y 2 cabezas KV, aplicando una expansión 7x de las cabezas KV cuando es necesario y respetando el contrato de `o_proj` único.

El módulo `SinkAttention` implementa atención tipo StreamingLLM: la consulta Q se calcula sobre la secuencia completa de `hidden_states`, mientras que K y V se acumulan en caché y se podan a `[primeros num_sink_tokens] ++ [últimos window_size - num_sink_tokens]`, preservando posiciones absolutas para el enmascaramiento causal. Soporta modo causal, bidireccional, cross-attention, GQA nativo y RoPE. El entrenamiento consiste en una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`): la etapa 1 (163 pasos, 54,3 s) alinea el backbone congelado con pérdida MSE y coseno sobre estados ocultos (peso 0,25) con `lm_head` desactivado; la etapa 2 (376 pasos, 125,8 s) hace destilación multi-capa con peso coseno 0,50. En total, 539 pasos en 180,3 s con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando 11.490 MB de VRAM en FP16 con parámetros maestros en FP32.

## Capacidades

- Generación de texto autoregresiva en inglés, heredada del modelo base Qwen2.5-0.5B.
- Atención con ventana deslizante y tokens sumidero, pensada para contextos largos con coste de memoria acotado.
- Soporte de atención causal y bidireccional en el módulo `SinkAttention` (útil para tareas encoder).
- Soporte de cross-attention a nivel de módulo, aunque el checkpoint se distribuye como modelo causal de generación.
- Compatibilidad con GQA nativo y RoPE.
- No se documentan capacidades de tool calling, agentes, matemáticas avanzadas, código, visión ni audio en la información disponible.
- No se documenta modo "thinking" ni razonamiento extendido.

## Casos de uso

- Investigación en eficiencia de atención: usar el checkpoint como referencia reproducible para medir cómo afecta el reemplazo de atención cuadrática por `SinkAttention` a la perplejidad en un modelo ya entrenado, comparando contra el Qwen2.5-0.5B original.
- Benchmarking de frameworks de atención: validar la integración de `neuralops.hub.load_surgeried_model` y del registro `ATTENTION_REGISTRY` en pipelines propios de evaluación de mecanismos de atención.
- Experimentos de destilación de conocimiento: replicar la receta de dos etapas (alineación con backbone congelado + destilación multi-capa) sobre otros modelos y datasets para estudiar la recuperación de PPL tras cirugía.
- Pruebas de inferencia en entornos con poca VRAM: al ser un modelo de 0,5B con pesos de atención de 161,50 MB, sirve para validar flujos de carga y generación en GPUs de gama media o incluso CPU.
- Docencia y divulgación: ejemplo didáctico de cómo se sustituyen módulos de atención en un transformer preentrenado sin reentrenar desde cero, con telemetría de pérdida y tiempos publicada.
- Prototipado de sistemas con contexto largo en inglés: aunque no se publican métricas más allá de WikiText-2, el mecanismo de ventana KV con sumideros permite experimentar con secuencias más largas que la ventana de entrenamiento (`seq_len=512`).

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` (no verificados):

| Benchmark | Métrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validación) | Perplejidad | 49,65 |

Telemetría interna de destilación publicada en la model card:

| Etapa | Métrica | Valor |
|---|---|---|
| Stage 0 (post-cirugía, cero-shot) | Perplejidad causal | 618,03 |
| Post-KD | Perplejidad de validación | 49,65 |
| Delta de perplejidad | Δ | -568,39 |
| Stage 1 (alineación con backbone congelado) | Pasos / tiempo | 163 / 54,3 s |
| Stage 2 (destilación multi-capa) | Pasos / tiempo | 376 / 125,8 s |
| Total | Pasos / tiempo | 539 / 180,3 s |
| Pico de VRAM | FP16 autocast, maestros FP32 | 11.490 MB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base es de 0,5B; en FP16 ocupa aproximadamente 1 GB de pesos, más el coste de la caché KV. El entrenamiento reportado consumió 11.490 MB por el uso de parámetros maestros en FP32 y autocast FP16, no representativo de la inferencia.
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente para inferencia en FP16; una RTX 3060, RTX 4060 o superior es adecuada. Para reproducir el entrenamiento de destilación se necesitan al menos 12 GB (el autor reporta 11,49 GB).
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 8 GB o más.
- Opciones de despliegue: la carga estándar es mediante `neuralops.hub.load_surgeried_model` o el flujo manual con `transformers` + `apply_qwen_attention_surgery` + `safetensors`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que los pesos son únicamente de atención y requieren el framework NeuralOps para el injerto.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | PPL WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/qwen-2.5-0.5b-sink-attention-wikitext2` | 0,5B | no disponible (entrenado a 512) | 49,65 (declarado) | MIT | Hugging Face (322 descargas) |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5B | 32.768 tokens (según ficha oficial de Qwen) | no disponible en esta información | Apache 2.0 (según ficha oficial) | Hugging Face |
| Otras variantes del "Attention Zoo" de NeuralOps | 0,5B | no disponible | no disponible | MIT (según repositorio NeuralOps) | Hugging Face (no se detallan en la información) |

La comparación directa con el modelo base en PPL no está disponible en la información proporcionada; solo se conoce el valor post-destilación de la variante con `sink_attention`.

## Limitaciones y advertencias

- Modelo de investigación: afinado exclusivamente sobre WikiText-2, por lo que su calidad generativa fuera de ese dominio es incierta y probablemente degradada respecto al Qwen2.5-0.5B original.
- Solo inglés: la model card declara `language: en`; no se garantiza comportamiento en castellano ni en otros idiomas.
- Contexto efectivo limitado: aunque el mecanismo de ventana KV permite secuencias largas, el entrenamiento se realizó con `seq_len=512` y no se publican valores de `window_size` ni `num_sink_tokens`.
- Pesos parciales: el repositorio contiene únicamente `attention_weights.safetensors` (161,50 MB), no un checkpoint completo; es necesario cargar el modelo base Qwen2.5-0.5B y aplicar la cirugía antes de cargar los pesos.
- Dependencia de framework: requiere NeuralOps y el script `apply_qwen_attention_surgery`; no es directamente compatible con `transformers` estándar, vLLM, llama.cpp u Ollama.
- Riesgo de alucinación: no evaluado; al ser un modelo pequeño y especializado en un corpus enciclopédico, la generación libre puede producir texto incoherente fuera de distribución.
- Sesgos: no documentados; hereda los sesgos del corpus WikiText-2 y del modelo base Qwen2.5-0.5B.
- Licencia MIT: permite uso comercial, pero al derivar de Qwen2.5-0.5B conviene revisar las condiciones de la licencia del modelo base (Apache 2.0 según su ficha oficial) y las del framework NeuralOps.
- Benchmarks no verificados: el único resultado (`verified: false`) es la PPL de WikiText-2; no hay evaluación en tareas downstream.
- Reproducibilidad: la model card referencia el repositorio `tahamajs/qwen-2.5-0.5b-sink-attention-wikitext2` mientras que el ID real es `Hooshaai/...`, lo que puede generar confusión al cargar los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-sink-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Framework NeuralOps (repositorio): https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
- Repositorio referenciado en la model card (posible duplicado): https://huggingface.co/tahamajs/qwen-2.5-0.5b-sink-attention-wikitext2

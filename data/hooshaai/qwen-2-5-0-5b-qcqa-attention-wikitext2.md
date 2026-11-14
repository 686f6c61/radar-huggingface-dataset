# Hooshaai/qwen-2.5-0.5b-qcqa-attention-wikitext2

## Resumen

`Hooshaai/qwen-2.5-0.5b-qcqa-attention-wikitext2` es un checkpoint experimental del modelo base Qwen2.5-0.5B en el que se han sustituido quirúrgicamente los bloques de atención del decodificador por un operador propietario denominado `qcqa_attention` (Quality and Capacity-Aware Grouped Query Attention), perteneciente al registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El modelo lo publica el usuario Hooshaai y se distribuye bajo licencia MIT. No se trata de un modelo nuevo entrenado desde cero, sino de un injerto de atención sobre los pesos de Qwen2.5-0.5B seguido de una destilación de conocimiento en dos etapas para recuperar la calidad del modelo original.

El interés técnico radica en que sirve como banco de pruebas reproducible para evaluar operadores de atención subcuadrática sobre un transformer denso pequeño (0,5 mil millones de parámetros, 24 capas, 14 cabezas de consulta y 2 cabezas KV con `head_dim=64` y `hidden_size=896`). El modelo solo publica los pesos de atención (`attention_weights.safetensors`, 161,51 MB), no el checkpoint completo, y requiere aplicar la cirugía de atención mediante el adaptador `QwenAttentionAdapter` antes de cargar el estado.

La relevancia actual es limitada pero específica: para investigadores que trabajan en eficiencia de atención, este checkpoint ofrece una referencia cuantitativa de perplexidad en WikiText-2 (25,35) frente al estado previo a la destilación (139,14), lo que documenta la viabilidad de recuperar calidad tras una sustitución agresiva de atención. No está pensado para uso en producción general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atención híbrida: 18/24 capas con `qcqa_attention` y 6/24 capas con atención cuadrática completa preservada (patrón `hybrid_3_1`) |
| Parámetros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el entrenamiento usa `seq_len=512`) |
| Tipos de cuantización | no disponible (solo se menciona FP16 para inferencia y FP32 para parámetros maestros del estudiante durante el entrenamiento) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (solo pesos de atención: `attention_weights.safetensors`, 161,51 MB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only denso con 24 capas, 14 cabezas de consulta, 2 cabezas KV (GQA con ratio 7:1), `head_dim=64` y `hidden_size=896`. Sobre esa base se aplica una cirugía de atención con patrón `hybrid_3_1`: se intercalan bloques en los que la atención original se reemplaza por `qcqa_attention` (18 de 24 capas) y se preservan 6 capas con atención cuadrática completa como anclas en los índices `[3, 7, 11, 15, 19, 23]`. El adaptador `QwenAttentionAdapter` realiza una expansión automática de cabezas KV (7x) donde es necesario y aplica el contrato de derivación con una única `o_proj`.

Tras la cirugía, el modelo sufre una caída drástica de calidad: la perplexidad causal en WikiText-2 pasa a 139,14 (etapa 0, cero-shot). Para recuperarla se aplica una destilación de conocimiento en dos etapas contra el modelo base: una primera etapa de alineamiento con backbone congelado (130 pasos, 54,5 s) que usa MSE y coseno a nivel de capa sobre estados ocultos con `lm_head` desactivado, y una segunda etapa de destilación de representaciones multicapa (298 pasos, 125,5 s) con los mismos objetivos. En total, 428 pasos y 180,2 s de optimización con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando un pico de 15.970 MB de VRAM en FP16 con autocast y parámetros maestros en FP32. El resultado final es una perplexidad de validación de 25,35, es decir, una recuperación de 113,79 puntos.

## Capacidades

- Generación de texto causal autorregresiva en inglés.
- Soporte de atención causal, bidireccional y cross-attention a nivel de operador (`supports_causal`, `supports_bidirectional`, `supports_cross_attention` todos a `Yes`).
- Soporte nativo de GQA y de RoPE (`supports_gqa`, `supports_rope`).
- Operador de atención personalizado (`is_custom_attention: Yes`).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking en la información disponible.
- Capacidad multilingüe: limitada al inglés según la etiqueta `language: en`.

## Casos de uso

- Investigación en operadores de atención subcuadrática: el checkpoint permite reproducir el pipeline de cirugía y destilación de NeuralOps sobre un modelo pequeño y comparar la perplexidad resultante con la del Qwen2.5-0.5B original, sirviendo como línea base para nuevos operadores del registro.
- Validación de recetas de destilación de conocimiento: las dos etapas documentadas (alineamiento con backbone congelado y destilación de representaciones multicapa) pueden replicarse con otros operadores o datasets para medir la recuperación de calidad tras una cirugía agresiva.
- Estudio de arquitecturas híbridas de atención: el patrón `hybrid_3_1` con 6 capas cuadráticas ancla permite analizar el equilibrio entre eficiencia y calidad en función de la proporción de capas sustituidas.
- Benchmarking de perplexidad en WikiText-2: útil como referencia para comparar variantes de atención en un entorno controlado con un modelo de 0,5B que cabe en una GPU consumer.
- Docencia y prototipado: el tamaño reducido (0,2 GB de repo, 161,51 MB de pesos de atención) y la licencia MIT facilitan su uso en cursos y experimentos académicos sobre eficiencia de transformers.
- Integración en pipelines de investigación con NeuralOps: la API `load_surgeried_model` permite cargar el modelo en una línea para experimentos de generación de texto controlados.

## Benchmarks y rendimiento

| Benchmark | Métrica | Valor | Verificado |
|---|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, split validation) | Perplexidad | 25,35 | No (declarado por el autor) |

Datos de telemetría del entrenamiento (declarados por el autor):

| Etapa | Métrica | Valor |
|---|---|---|
| Stage 0 (post-cirugía, cero-shot) | Perplexidad causal | 139,14 |
| Post-destilación | Perplexidad de validación | 25,35 |
| Delta de perplexidad | Mejora | -113,79 |
| Stage 1 (alineamiento con backbone congelado) | Pasos / tiempo | 130 / 54,5 s |
| Stage 2 (destilación de representaciones multicapa) | Pasos / tiempo | 298 / 125,5 s |
| Total | Pasos / tiempo | 428 / 180,2 s |
| Pico de VRAM | FP16 autocast + FP32 master | 15.970 MB |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el entrenamiento usó 15.970 MB en FP16 con autocast y parámetros maestros en FP32, lo que da una referencia del orden de magnitud para el pipeline completo. Para inferencia en FP16 de un modelo de 0,5B se estima un consumo muy inferior, aunque no se documenta en la información proporcionada.
- GPU recomendadas: no especificadas. El entrenamiento cabe en una GPU con al menos 16 GB de VRAM; una RTX 4090, A100 o H100 son suficientes para el pipeline de cirugía y destilación.
- Cabe en GPU consumer: sí, siempre que se disponga de al menos 16 GB de VRAM para reproducir el entrenamiento; para inferencia pura el requisito es menor, aunque no se detalla.
- Opciones de despliegue: la model card documenta dos vías: (1) carga manual con `transformers` + `safetensors` + `apply_qwen_attention_surgery` del script `scripts/benchmarks/qwen_zoo_train_mix.py` del repo NeuralOps, y (2) la API universal `neuralops.hub.load_surgeried_model`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplexidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hooshaai/qwen-2.5-0.5b-qcqa-attention-wikitext2 | 0,5B | no disponible | 25,35 (declarado) | MIT | Pesos de atención únicamente |
| Qwen/Qwen2.5-0.5B (base) | 0,5B | 32.768 tokens (según Qwen2.5) | no disponible en esta ficha | Apache 2.0 (según Qwen2.5) | Checkpoint completo |
| Otros checkpoints del NeuralOps Attention Zoo | 0,5B | no disponible | no disponible | MIT (según repo) | Pesos de atención |

La comparación directa con el modelo base en WikiText-2 no está disponible en la información proporcionada, ya que solo se documenta la perplexidad del checkpoint destilado y la del estado post-cirugía previo a la destilación. No se dispone de datos de benchmarks de modelos de 0,5B comparables en la información suministrada.

## Limitaciones y advertencias

- Solo se publican los pesos de atención (`attention_weights.safetensors`), no el checkpoint completo; es necesario descargar Qwen2.5-0.5B y aplicar la cirugía con `QwenAttentionAdapter` antes de cargar el estado, lo que añade complejidad y dependencia del código de NeuralOps.
- La perplexidad de 25,35 está declarada por el autor y marcada como no verificada (`verified: false`); no debe tomarse como un resultado independiente.
- El modelo está entrenado y evaluado únicamente en inglés y sobre WikiText-2; no hay evidencia de generalización a otros dominios o idiomas.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni instrucciones; no es adecuado para tareas de asistente o producción conversacional.
- El contexto de entrenamiento es de 512 tokens; no se especifica la longitud de contexto efectiva del checkpoint resultante, por lo que no debe asumirse la ventana de 32.768 tokens del Qwen2.5-0.5B original.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al ser un modelo de 0,5B con destilación parcial, es esperable una calidad generativa limitada.
- Licencia MIT permite uso comercial, pero la dependencia del código NeuralOps y del modelo base Qwen2.5-0.5B (licencia Apache 2.0) debe respetarse por separado.
- El modelo es experimental y no se han publicado evaluaciones de seguridad, robustez ni comportamiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-qcqa-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext

# Hooshaai/qwen-2.5-0.5b-rala-attention-wikitext2

## Resumen

`Hooshaai/qwen-2.5-0.5b-rala-attention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente 18 de las 24 capas de atención del decodificador por el operador `RALALinearAttention` (Rank-Augmented Linear Attention), un mecanismo de atención subcuadrática del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El modelo lo publica el usuario Hooshaai dentro del denominado "Qwen Attention Zoo", un conjunto de experimentos de intercambio de mecanismos de atención sobre arquitecturas conocidas.

El objetivo del experimento no es producir un modelo listo para producción, sino medir el impacto de reemplazar la atención cuadrática estándar de Qwen2 por atención lineal aumentada en rango y observar si la destilación de conocimiento en dos etapas es capaz de recuperar la calidad del modelo original. El resultado declarado por el autor es una perplejidad en WikiText-2 de 121.980.150,39, idéntica a la del checkpoint previo a la destilación (delta de +0,00), lo que indica que el proceso de alineación no recuperó capacidad de modelado del lenguaje.

Se trata, por tanto, de un artefacto de investigación sobre atención eficiente, con pesos de solo 124,39 MB, licencia MIT y un pipeline declarado de generación de texto, pero cuyas métricas publicadas lo sitúan lejos de un uso práctico. Es relevante ahora porque documenta de forma transparente un fallo de recuperación tras la cirugía de atención, un dato útil para quienes investigan destilación de mecanismos alternativos a la atención cuadrática.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con 18/24 capas de atención sustituidas por `RALALinearAttention` (patrón híbrido 3:1) |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B; el repo solo contiene pesos de atención de 124,39 MB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó `seq_len=512`; la ventana nativa de Qwen2.5-0.5B no se especifica en la información) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors, presumiblemente FP16) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`), más `config.json`, `tokenizer.json` y `training_metrics.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con 24 capas, 14 cabezas de consulta, 2 cabezas KV (GQA), `head_dim=64` y `hidden_size=896`. Sobre esa base se aplica una "cirugía" de atención mediante `QwenAttentionAdapter`, que sustituye 18 de las 24 capas por `RALALinearAttention` y conserva 6 capas de atención cuadrática completa como anclas en los índices [3, 7, 11, 15, 19, 23], siguiendo un patrón híbrido 3:1. El adaptador expande las cabezas KV 7x cuando es necesario (de 2 a 14) y mantiene el contrato de una única proyección de salida (`o_proj`). El módulo RALA soporta atención causal, bidireccional y cross-attention, pero no soporta GQA nativo ni rotary positions de forma nativa.

El entrenamiento consiste en una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 1 (alineación con backbone congelado) ejecutó 4 pasos en 55,1 s con `lm_head` desactivado y pérdida MSE + coseno por capa (peso 0,25). La etapa 2 (destilación multi-capa de representaciones) ejecutó 9 pasos en 128,1 s con MSE + coseno (peso 0,50). En total, 13 pasos de optimización en 183,8 s, con `seq_len=512`, `grad_accum=4`, `topk=64` y un pico de VRAM de 21.553 MB en FP16 con parámetros maestros en FP32. El resultado es que la perplejidad causal no mejora respecto al baseline post-cirugía: 121.980.150,39 antes y después.

## Capacidades

- Generación de texto autoregresiva causal, heredada de la interfaz de Qwen2.5-0.5B.
- Atención lineal aumentada en rango (`RALALinearAttention`) en 18 capas, con 6 capas cuadráticas de anclaje.
- Soporte de atención causal, bidireccional y cross-attention a nivel de módulo.
- Compatibilidad con el ecosistema NeuralOps mediante `load_surgeried_model` y `apply_qwen_attention_surgery`.
- Capacidades multilingües: limitadas al inglés según la model card.
- Tool calling, function calling, agentes, modo thinking, visión o audio: no disponibles en la información proporcionada.
- La calidad de generación efectiva es dudosa dado el valor de perplejidad publicado.

## Casos de uso

- Investigación en atención subcuadrática: el checkpoint sirve como referencia reproducible para estudiar el efecto de sustituir atención cuadrática por RALA en un transformer pequeño, comparando la perplejidad pre y post destilación.
- Estudio de destilación de conocimiento: los 13 pasos y las dos etapas documentadas permiten analizar por qué una alineación de representaciones por capas no recupera la capacidad de modelado tras la cirugía.
- Benchmarking de operadores de atención: útil para medir coste de memoria (pico de 21.553 MB) y tiempo de entrenamiento (183,8 s) de un pipeline de cirugía + KD en una GPU de gama alta.
- Desarrollo de herramientas del ecosistema NeuralOps: sirve para validar `QwenAttentionAdapter`, `apply_qwen_attention_surgery` y el patrón `hybrid_3_1` en integraciones de CI.
- Docencia y divulgación: ejemplo didáctico de un experimento fallido de recuperación de calidad, con telemetría completa y transparente.
- Pruebas de carga de pesos quirúrgicos: permite verificar la carga de `attention_weights.safetensors` sobre el modelo base con `strict=False` y comprobar la compatibilidad del tokenizer.
- No se recomienda su uso en producción, atención al cliente, generación de código ni tareas de razonamiento, dado el rendimiento declarado.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor | Verificado |
|---|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 121.980.150,39 | No |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato es la perplejidad de WikiText-2, idéntica a la del baseline post-cirugía, lo que indica ausencia de recuperación tras la destilación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo solo contiene pesos de atención de 124,39 MB que deben cargarse sobre Qwen2.5-0.5B (aproximadamente 1 GB en FP16 para el modelo completo, estimación a partir del tamaño del base).
- VRAM de entrenamiento documentada: 21.553 MB de pico en FP16 con parámetros maestros en FP32.
- GPU recomendadas: no disponible; el pico de 21,5 GB sugiere una GPU de 24 GB o superior (RTX 4090, A100 40 GB, H100).
- Cabe en GPU de consumo: probablemente sí para inferencia en FP16 (modelo de 0,5B), aunque no se documenta.
- Opciones de despliegue: `neuralops.hub.load_surgeried_model`, `transformers` + `apply_qwen_attention_surgery`, carga manual con `safetensors`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hooshaai/qwen-2.5-0.5b-rala-attention-wikitext2 | 0,5B | no disponible | 121.980.150,39 | MIT | Hugging Face |
| Qwen/Qwen2.5-0.5B (base) | 0,5B | no disponible en la información | no disponible | Apache 2.0 (según el modelo base, no confirmado en esta ficha) | Hugging Face |
| Otros checkpoints del NeuralOps Attention Zoo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de perplejidad del modelo base Qwen2.5-0.5B en la información proporcionada, por lo que no es posible cuantificar la degradación exacta respecto al original.

## Limitaciones y advertencias

- Perplejidad de WikiText-2 extremadamente alta (121.980.150,39), lo que indica que el modelo no modela el lenguaje de forma útil.
- La destilación en dos etapas no produjo mejora alguna (delta de +0,00), por lo que el checkpoint no recupera la calidad del Qwen2.5-0.5B original.
- Solo se declara soporte de inglés; no hay evidencia de capacidades multilingües.
- `RALALinearAttention` no soporta GQA nativo, lo que obliga a una expansión 7x de cabezas KV y puede introducir ineficiencias.
- El repo contiene únicamente pesos de atención; es necesario cargar el modelo base Qwen2.5-0.5B y aplicar la cirugía para poder usarlo.
- Riesgo elevado de alucinación y generación incoherente dado el rendimiento declarado.
- Sesgos: no documentados, pero heredados del corpus WikiText-2 y del modelo base.
- Licencia MIT para este checkpoint, pero el uso del modelo base Qwen2.5-0.5B puede estar sujeto a sus propios términos; conviene verificar la licencia del base antes de un uso comercial.
- No apto para producción, agentes, tool calling ni tareas de razonamiento sin una validación exhaustiva previa.
- El autor del repo en la model card (`tahamajs`) difiere del autor del repo en Hugging Face (`Hooshaai`), lo que puede generar confusión sobre la procedencia y el soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-rala-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
- Repo referenciado en la model card: https://huggingface.co/tahamajs/qwen-2.5-0.5b-rala-attention-wikitext2

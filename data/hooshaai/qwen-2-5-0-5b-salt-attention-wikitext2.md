# Hooshaai/qwen-2.5-0.5b-salt-attention-wikitext2

## Resumen

El modelo `qwen-2.5-0.5b-salt-attention-wikitext2`, publicado por el usuario Hooshaai en Hugging Face, es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente los bloques de atención del decodificador por el módulo `salt_attention` del registro `ATTENTION_REGISTRY` del framework NeuralOps. El objetivo no es ofrecer un modelo de propósito general, sino servir como banco de pruebas reproducible para investigar mecanismos de atención subcuadrática y su recuperación mediante destilación de conocimiento.

La intervención sigue el patrón `hybrid_3_1`: 18 de las 24 capas del transformer adoptan `SALTAttention`, mientras que 6 capas conservan la atención cuadrática original como anclas en los índices [3, 7, 11, 15, 19, 23]. Tras la cirugía, el modelo se sometió a un proceso de destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`), partiendo de una perplejidad inicial catastrófica de 270.320,78 y alcanzando una perplejidad final de validación de 310,59.

Es relevante ahora porque documenta de forma transparente el coste y la recuperación de sustituir atención estándar por alternativas eficientes en modelos pequeños, con telemetría detallada de pasos, tiempos y VRAM. No obstante, la perplejidad final sigue siendo muy superior a la de un Qwen2.5-0.5B intacto, por lo que debe tratarse como un artefacto de investigación y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atención híbrida: 18/24 capas `SALTAttention` y 6/24 capas de atención cuadrática completa |
| Parametros totales | 0.5B (heredados de Qwen2.5-0.5B; el checkpoint publicado contiene solo pesos de atención de 55,10 MB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo de carga usa FP16) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B`, un transformer decoder-only con 24 capas, 14 cabezas de consulta, 2 cabezas KV (GQA 14:2), `head_dim=64` y `hidden_size=896`. Sobre esa base se aplica una cirugía de atención mediante `QwenAttentionAdapter`, que sustituye las proyecciones lineales estándar por `SALTLinear` en 18 capas y mantiene 6 capas cuadráticas como anclas. El módulo `SALTAttention` soporta atención causal, bidireccional, cross-attention y GQA nativa, y está marcado como operador de atención personalizado (`is_custom_attention`). El adaptador aplica una expansión automática de cabezas KV de 7x donde es necesario y respeta el contrato de bypass de una única `o_proj`.

El entrenamiento consiste en una destilación de conocimiento en dos etapas sobre WikiText-2. La etapa 0 (baseline cero-shot tras la cirugía) arroja una perplejidad causal de 270.320,78. La etapa 1 (alineación con backbone congelado, 127 pasos, 54,4 s) omite el `lm_head` y usa MSE y coseno sobre estados ocultos por capa con peso 0,25. La etapa 2 (destilación de representación multicapa, 290 pasos, 125,5 s) emplea MSE y coseno con peso 0,50. En total, 417 pasos de optimización en 180,1 s con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando un pico de VRAM de 17.085 MB en FP16 con parámetros maestros en FP32. El resultado final es una perplejidad de validación de 310,59.

## Capacidades

- Generación de texto causal autoregresiva en inglés, heredada de la arquitectura Qwen2.
- Atención subcuadrática mediante `SALTAttention` en 18 de las 24 capas, con soporte para atención causal y bidireccional.
- Soporte nativo de GQA con expansión de cabezas KV 14:2 y `head_dim=64`.
- Compatibilidad con cross-attention a nivel de módulo (aunque no se documenta su uso en este checkpoint).
- Carga mediante el Hub API de NeuralOps (`load_surgeried_model`) o mediante cirugía manual con `apply_qwen_attention_surgery`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.
- Capacidad multilingüe limitada al inglés según la model card.
- Uso previsto como banco de pruebas de mecanismos de atención eficiente y destilación, no como modelo conversacional de producción.

## Casos de uso

- Investigación en atención subcuadrática: permite comparar el comportamiento de `SALTAttention` frente a atención cuadrática en un backbone Qwen2.5-0.5B concreto, aislando el efecto de la sustitución en 18 capas y manteniendo 6 anclas.
- Reproducción de experimentos de destilación de conocimiento: la telemetría publicada (417 pasos, 180,1 s, perplejidad pre y post-KD) sirve como referencia para validar pipelines de KD de dos etapas.
- Benchmarking de frameworks de atención: útil para evaluar el registro `ATTENTION_REGISTRY` de NeuralOps y el adaptador `QwenAttentionAdapter` en tareas de modelado de lenguaje causal.
- Estudio de la degradación y recuperación de perplejidad: el salto de 270.320,78 a 310,59 documenta cuánto puede recuperarse una cirugía agresiva con solo 417 pasos de destilación.
- Pruebas de integración en pipelines de NeuralOps: valida la carga vía `load_surgeried_model` y la compatibilidad con `transformers` y `safetensors` en entornos de investigación.
- Análisis de eficiencia de memoria y cómputo: el pico de 17.085 MB de VRAM en FP16 con `seq_len=512` y `grad_accum=4` proporciona una referencia para planificar experimentos similares en GPUs de gama alta.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor | Verificado |
|---|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 310,59 | No (declarado por el autor) |
| WikiText-2 (baseline post-cirugía, etapa 0) | Perplejidad | 270.320,78 | No (declarado por el autor) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint de atención ocupa 55,10 MB y el modelo base Qwen2.5-0.5B en FP16 requiere aproximadamente 1 GB, aunque la atención personalizada puede añadir overhead.
- VRAM de entrenamiento documentada: 17.085 MB de pico en FP16 con parámetros maestros en FP32, `seq_len=512` y `grad_accum=4`.
- GPU recomendadas: no disponible; el pico de 17 GB sugiere GPUs con al menos 24 GB (RTX 3090/4090, A10G, L4) para reproducir el entrenamiento.
- Cabe en GPU de consumo: probablemente sí para inferencia en FP16 (modelo de 0.5B), pero no se documenta una configuración concreta.
- Opciones de despliegue: `transformers` con `apply_qwen_attention_surgery` o el Hub API de NeuralOps (`load_surgeried_model`); no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/qwen-2.5-0.5b-salt-attention-wikitext2` | 0.5B | no disponible | 310,59 (validation) | MIT | Hugging Face |
| `Qwen/Qwen2.5-0.5B` (base) | 0.5B | 32.768 tokens (según Qwen2.5) | no disponible en esta ficha | Apache 2.0 (según Qwen2.5) | Hugging Face |
| Alternativas de atención eficiente en 0.5B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa con el modelo base no es posible con los datos proporcionados, ya que no se incluye la perplejidad de `Qwen/Qwen2.5-0.5B` intacto en WikiText-2. No se dispone de información sobre otros modelos comparables de la misma categoría (atención subcuadrática en 0.5B).

## Limitaciones y advertencias

- La perplejidad de validación de 310,59 es muy elevada en términos absolutos y sugiere una calidad de generación limitada; no debe usarse como modelo conversacional de producción.
- El modelo solo está entrenado y evaluado en inglés; no se documenta soporte multilingüe.
- No se han publicado evaluaciones de sesgo, alucinación o robustez; el riesgo de alucinación es alto dado el bajo rendimiento en perplejidad.
- La licencia es MIT, lo que permite uso comercial, pero el modelo base Qwen2.5-0.5B tiene su propia licencia (Apache 2.0 según Qwen2.5) que debe respetarse al redistribuir o combinar pesos.
- El checkpoint publicado contiene únicamente los pesos de atención (`attention_weights.safetensors`, 55,10 MB); es necesario descargar el modelo base y aplicar la cirugía para obtener un modelo funcional.
- La carga requiere el framework NeuralOps y el script `apply_qwen_attention_surgery`; no es compatible directamente con `AutoModelForCausalLM.from_pretrained` sin pasos adicionales.
- No se documenta la longitud de contexto efectiva tras la cirugía ni el comportamiento en secuencias largas.
- El modelo fue creado y actualizado en noviembre de 2026 según los metadatos, lo que puede indicar una fecha futura o un error de registro; conviene verificar la vigencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-salt-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext

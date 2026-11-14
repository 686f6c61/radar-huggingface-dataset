# Hooshaai/qwen-2.5-0.5b-lsh-attention-wikitext2

## Resumen

`qwen-2.5-0.5b-lsh-attention-wikitext2` es un checkpoint experimental publicado por el usuario Hooshaai dentro del proyecto NeuralOps (Attention Zoo). Se trata de un fine-tuning quirúrgico sobre `Qwen/Qwen2.5-0.5B` en el que se han sustituido 18 de las 24 capas de atención del decoder original por un operador de atención subcuadrática basado en Locality-Sensitive Hashing (LSH), al estilo de Reformer. El objetivo es explorar alternativas de atención eficiente que reduzcan el coste cuadrático del mecanismo estándar manteniendo la coherencia del modelo base mediante destilación de conocimiento en dos etapas.

El modelo conserva la arquitectura transformer decoder de Qwen2.5-0.5B (14 cabezas de consulta, 2 cabezas KV con expansión GQA, `head_dim=64`, `hidden_size=896`), pero intercala capas LSH con capas de atención cuadrática completa en un patrón `hybrid_3_1` (tres capas LSH por cada capa cuadrática de anclaje). El entrenamiento se realizó exclusivamente sobre WikiText-2 (`wikitext-2-raw-v1`) y el resultado se evalúa con perplejidad en el split de validación.

Es relevante ahora como artefacto de investigación reproducible: el autor documenta con detalle la topología de la cirugía, la telemetría del proceso de destilación (392 pasos, 180,3 s, 16 540 MB de VRAM pico) y los artefactos de pesos. No obstante, la perplejidad final de 709,91 en WikiText-2 es muy alta en términos absolutos, lo que indica que el modelo no está pensado para uso en producción sino como banco de pruebas de atención eficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2) con atencion LSH hibrida `hybrid_3_1` (18/24 capas LSH, 6/24 cuadraticas en indices 3, 7, 11, 15, 19, 23) |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (entrenado con `seq_len=512`; el contexto nativo de Qwen2.5-0.5B no se confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible (solo se documentan pesos en FP16 y safetensors) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors` 917,45 MB; `attention_weights.safetensors` 59,24 MB) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B` y aplica una cirugía de atención mediante `QwenAttentionAdapter`, que mapea las proyecciones `Qwen2Attention` (14 cabezas de consulta, 2 cabezas KV, `head_dim=64`, `hidden_size=896`) con expansión automática de cabezas KV 7x cuando es necesario, y aplica el contrato de bypass de una sola `o_proj`. La topología `hybrid_3_1` sustituye 18 de las 24 capas por `LSHAttention` (operador de atención LSH estilo Reformer, con soporte causal, bidireccional, cross-attention y GQA nativo) y preserva 6 capas de atención cuadrática completa como anclas.

El entrenamiento consiste en una destilación de conocimiento en dos etapas desde el modelo base: la etapa 1 (alineamiento con backbone congelado, 119 pasos, 54,5 s) omite `lm_head` y usa MSE de estados ocultos por capa más similitud coseno (peso 0,25); la etapa 2 (destilación de representación multicapa, 273 pasos, 125,5 s) repite el esquema con peso coseno 0,50. En total son 392 pasos de optimización en 180,3 s, con `seq_len=512`, `grad_accum=4`, `topk=64` y 16 540 MB de VRAM pico en FP16 con autocast y parámetros maestros FP32. El dataset de entrenamiento es únicamente WikiText-2; no se documenta RLHF ni DPO.

## Capacidades

- Generación de texto causal autorregresiva en inglés, heredada del modelo base Qwen2.5-0.5B.
- Atención causal con soporte de GQA nativo y expansión 7x de cabezas KV.
- Soporte de atención bidireccional y cross-attention a nivel de operador (según la tabla de capacidades del módulo).
- Capacidad de tool calling y function calling: no disponible de forma específica en este checkpoint (el modelo base la soporta, pero no se ha validado tras la cirugía).
- Razonamiento multi-paso y uso como agente: no disponible / no validado.
- Capacidades multilingües: limitadas a inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación en atención eficiente: servir como banco de pruebas reproducible para comparar LSH attention frente a atención cuadrática completa en un transformer decoder pequeño, con telemetría detallada de perplejidad y coste de entrenamiento.
- Estudio de destilación de conocimiento post-cirugía: el checkpoint permite analizar cómo la destilación en dos etapas recupera coherencia tras reemplazar bloques de atención (de PPL 233 308,17 a 709,91), útil para diseñar metodologías de sustitución de operadores.
- Validación de la API NeuralOps: ejemplo funcional de `load_surgeried_model` y del registro `ATTENTION_REGISTRY` para desarrolladores que integren el framework.
- Experimentos de ablación de topología híbrida: comparar el patrón `hybrid_3_1` con otras configuraciones (más o menos capas LSH) usando el mismo pipeline de entrenamiento.
- Docencia y divulgación: caso práctico de cirugía de atención y destilación en un modelo de 0,5 B parámetros que cabe en una GPU de consumo.
- Pruebas de integración de pesos safetensors con `transformers` y `AutoModelForCausalLM` en entornos de investigación, sin expectativa de calidad de generación en producción.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` (no verificados):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 709,91 |

Telemetría adicional del proceso de entrenamiento:

| Etapa | Metrica | Valor |
|---|---|---|
| Stage 0 (post-cirugia, zero-shot) | Perplejidad causal | 233 308,17 |
| Post-KD | Perplejidad causal | 709,91 |
| Stage 1 (frozen-backbone) | Pasos / tiempo | 119 / 54,5 s |
| Stage 2 (multi-layer KD) | Pasos / tiempo | 273 / 125,5 s |
| Total | Pasos / tiempo | 392 / 180,3 s |
| Pico VRAM | Memoria | 16 540 MB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1 GB para los pesos (917,45 MB de `model.safetensors` más 59,24 MB de `attention_weights.safetensors`), más overhead de activaciones y tokenizer; en la práctica cabe en GPUs con 4 GB o más.
- VRAM de entrenamiento observada: 16 540 MB pico en FP16 con autocast y parámetros maestros FP32 (equivalente a una RTX 4090, A100 o similar).
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB para inferencia (RTX 3060, RTX 4060, RTX 4090); para reproducir el entrenamiento se requiere una GPU de 16 GB o más (RTX 4090, A100 40 GB, H100).
- Cabe en GPU consumer: sí, para inferencia.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` tras aplicar la cirugía con `apply_qwen_attention_surgery`, o la API `neuralops.hub.load_surgeried_model`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el operador LSH es personalizado y no está integrado en esos runtimes.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/qwen-2.5-0.5b-lsh-attention-wikitext2` | 0,5 B | no disponible (entrenado a 512) | PPL WikiText-2 709,91 | MIT | Hugging Face, 283 descargas |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5 B | 32 768 tokens (nativo Qwen2.5) | No disponible en esta ficha | Apache 2.0 | Hugging Face, ampliamente disponible |
| `Qwen/Qwen2.5-0.5B-Instruct` | 0,5 B | 32 768 tokens (nativo Qwen2.5) | No disponible en esta ficha | Apache 2.0 | Hugging Face, ampliamente disponible |

La comparación directa con el modelo base no es posible con los datos proporcionados, ya que no se incluye la perplejidad de `Qwen/Qwen2.5-0.5B` en WikiText-2. La diferencia de licencia (MIT frente a Apache 2.0) y la falta de soporte en runtimes estándar son los principales puntos de divergencia.

## Limitaciones y advertencias

- Perplejidad muy alta (709,91) en WikiText-2, lo que sugiere una calidad de generación muy inferior a la del modelo base; no es adecuado para producción.
- Entrenado exclusivamente sobre WikiText-2, un corpus enciclopédico en inglés; el dominio y el idioma están muy limitados.
- Solo soporta inglés según la model card.
- La atención LSH es un operador personalizado no integrado en vLLM, llama.cpp, Ollama ni TGI; el despliegue requiere el stack NeuralOps o `transformers` con la cirugía aplicada manualmente.
- Riesgo de alucinación elevado por la degradación de coherencia tras la cirugía y la destilación limitada (392 pasos).
- Sesgos: no documentados, pero heredados del corpus WikiText-2 y del modelo base Qwen2.5-0.5B.
- Licencia MIT permite uso comercial, pero la calidad del checkpoint hace inviable ese escenario sin validación adicional.
- El checkpoint referencia rutas y APIs del proyecto NeuralOps (`tahamajs/...` en los ejemplos) que no coinciden con el ID real del repo (`Hooshaai/...`), lo que puede provocar errores de carga.
- Los benchmarks son declarados por el autor y no están verificados (`verified: false`).

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-lsh-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
- Licencia MIT del proyecto NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE

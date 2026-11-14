# Hooshaai/qwen-2.5-0.5b-triton-cosformer-wikitext2

## Resumen

`Hooshaai/qwen-2.5-0.5b-triton-cosformer-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente 18 de las 24 capas de atención del decoder por el módulo `TritonCosformerAttention`, una implementación de atención lineal cosformer acelerada con Triton y totalmente diferenciable. El resultado es un modelo híbrido que combina atención subcuadrática con seis capas de atención cuadrática completa preservadas como anclas, y que ha sido reentrenado mediante destilación de conocimiento en dos etapas sobre WikiText-2.

El modelo forma parte del proyecto NeuralOps "Attention Zoo", una iniciativa orientada a evaluar empíricamente arquitecturas de atención alternativas sobre modelos preentrenados. Su interés no reside en el rendimiento absoluto —el modelo base es un transformer pequeño de 0,5 mil millones de parámetros— sino en demostrar que es posible recuperar la calidad del modelo original tras una cirugía tan agresiva: la perplejidad pasó de 2349,58 (baseline cero-shot post-cirugía) a 49,52 tras 474 pasos de destilación, en tan solo 180 segundos de cómputo.

El checkpoint se distribuye únicamente como pesos de atención (`attention_weights.safetensors`, 84,16 MB), no como modelo completo. Requiere cargar el modelo base Qwen2.5-0.5B y aplicar la cirugía con el adaptador `QwenAttentionAdapter` antes de cargar los pesos. Está pensado para investigación en eficiencia de atención, no para uso en producción como generador de texto general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder híbrido: 18/24 capas con `TritonCosformerAttention` (atención lineal cosformer) + 6/24 capas con atención cuadrática completa en índices [3, 7, 11, 15, 19, 23] |
| Parametros totales | ~0,5 mil millones (heredados de Qwen2.5-0.5B; solo se distribuyen 84,16 MB de pesos de atención) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento usó `seq_len=512`; el modelo base Qwen2.5-0.5B soporta hasta 32 768 tokens, pero no se confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors, presumiblemente FP16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 84,16 MB) + `config.json` + `tokenizer.json` + `training_metrics.json` |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen2.5-0.5B (hidden_size=896, 14 cabezas de consulta, 2 cabezas KV, head_dim=64, GQA). Sobre esa base se aplica un patrón de cirugía `hybrid_3_1`: por cada tres capas se reemplaza la atención original por `TritonCosformerAttention`, dejando una capa cuadrática completa como ancla. En total se transplantan 18 capas y se preservan 6. El `QwenAttentionAdapter` gestiona la expansión 7x de cabezas KV requerida por el módulo cosformer y respeta el contrato de bypass de una sola `o_proj`. El módulo soporta atención causal, bidireccional y cross-attention, pero no soporta GQA nativo ni RoPE.

El entrenamiento consistió en una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 1 (alineación con backbone congelado, 144 pasos, 54,3 s) omitió el `lm_head` y usó MSE y coseno a nivel de capa con peso 0,25. La etapa 2 (destilación de representación multicapa, 330 pasos, 125,6 s) usó MSE y coseno con peso 0,50. En total: 474 pasos, 180,1 s, `seq_len=512`, `grad_accum=4`, `topk=64`, con autocast FP16 y parámetros maestros del estudiante en FP32. El pico de VRAM fue de 11 689 MB. La perplejidad causal pasó de 2349,58 (etapa 0, cero-shot post-cirugía) a 49,52 (final), una mejora de 2300,06 puntos.

## Capacidades

- Generación de texto causal autorregresiva en inglés, heredada del modelo base Qwen2.5-0.5B.
- Atención lineal subcuadrática en 18 de las 24 capas, lo que reduce el coste computacional frente a atención cuadrática en secuencias largas (objetivo declarado del módulo cosformer).
- Soporte de atención causal, bidireccional y cross-attention a nivel de módulo (según la tabla de capacidades del módulo).
- No soporta GQA nativo en las capas transplantadas (el adaptador lo emula mediante expansión 7x de cabezas KV).
- No soporta RoPE en el módulo cosformer (marcado como `N/A` en la model card).
- Capacidades de tool calling, function calling, agentes, visión, audio o modo "thinking": no disponibles ni documentadas para este checkpoint.
- Capacidades multilingües: limitadas al inglés según el campo `language: en`.

## Casos de uso

- Investigación en eficiencia de atención: el modelo sirve como banco de pruebas para medir el impacto de sustituir atención cuadrática por cosformer lineal en un transformer preentrenado, comparando perplejidad antes y después de la destilación (2349,58 → 49,52).
- Validación de pipelines de cirugía de atención: permite probar el `QwenAttentionAdapter` y el patrón `hybrid_3_1` sobre Qwen2.5-0.5B para verificar que la carga de pesos, la expansión de cabezas KV y el contrato de `o_proj` funcionan correctamente antes de escalar a modelos mayores.
- Reproducción de experimentos de destilación: los 474 pasos y 180 s de entrenamiento documentados permiten reproducir la receta de destilación en dos etapas (alineación con backbone congelado + destilación multicapa) en hardware de consumo.
- Estudio de atención subcuadrática en secuencias largas: las 18 capas cosformer permiten medir empíricamente si la atención lineal reduce latencia o memoria en inferencia con secuencias largas frente a las 6 capas cuadráticas ancla.
- Benchmarking de perplejidad en WikiText-2: el checkpoint sirve como referencia de perplejidad (49,52) para comparar futuras variantes de atención del Attention Zoo sobre el mismo modelo base.
- Desarrollo y test de integración con NeuralOps: la API `load_surgeried_model` permite cargar el modelo en una línea y usarlo en tests de integración del ecosistema NeuralOps.

## Benchmarks y rendimiento

Datos declarados por el autor en el model-index (no verificados, `verified: false`):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 49,52 |

Telemetría de entrenamiento declarada por el autor:

| Metrica | Valor |
|---|---|
| Perplejidad causal pre-destilación (etapa 0) | 2349,58 |
| Perplejidad causal post-destilación | 49,52 |
| Delta de perplejidad | -2300,06 |
| Pasos etapa 1 (alineación, backbone congelado) | 144 (54,3 s) |
| Pasos etapa 2 (destilación multicapa) | 330 (125,6 s) |
| Pasos totales / tiempo | 474 / 180,1 s |
| VRAM pico | 11 689 MB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: no documentada explícitamente para este checkpoint. Como referencia, el entrenamiento usó 11 689 MB con autocast FP16 y parámetros maestros FP32; la inferencia en FP16 del modelo base de 0,5B debería requerir aproximadamente 1-2 GB, pero no se confirma para la variante con cosformer.
- GPU recomendadas: no disponibles. El entrenamiento se ejecutó con suficiente VRAM para 11,7 GB, lo que sugiere una GPU de gama alta (A100, H100 o similar) o una consumer con 16 GB o más.
- Cabe en GPU de consumo: probablemente sí para inferencia en FP16 (modelo de 0,5B), pero no se documenta.
- Opciones de despliegue: la model card solo documenta carga vía `transformers` + `safetensors` con `apply_qwen_attention_surgery`, y vía `neuralops.hub.load_surgeried_model`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/qwen-2.5-0.5b-triton-cosformer-wikitext2` | ~0,5B | no disponible | 49,52 (declarada, no verificada) | MIT | Pesos de atención en HF (84,16 MB) |
| `Qwen/Qwen2.5-0.5B` (base) | 0,5B | 32 768 | no disponible en esta ficha | Apache 2.0 | Modelo completo en HF |
| Otros checkpoints del NeuralOps Attention Zoo | ~0,5B | no disponible | no disponible | MIT | Pesos de atención en HF |

No se dispone de datos de perplejidad del modelo base Qwen2.5-0.5B en la información proporcionada, por lo que no es posible cuantificar la degradación respecto al original. La comparativa con alternativas de la misma categoría (otros modelos de atención subcuadrática) no está disponible.

## Limitaciones y advertencias

- El checkpoint solo contiene pesos de atención (`attention_weights.safetensors`); no es un modelo autónomo. Requiere cargar Qwen2.5-0.5B y aplicar la cirugía con `apply_qwen_attention_surgery` antes de cargar los pesos con `strict=False`.
- La perplejidad de 49,52 está declarada por el autor y marcada como `verified: false`; no ha sido validada de forma independiente.
- El modelo fue entrenado únicamente sobre WikiText-2 en inglés; su calidad fuera de ese dominio es desconocida y probablemente degradada respecto al modelo base.
- Solo soporta inglés según el campo `language: en`.
- No soporta GQA nativo ni RoPE en las capas cosformer; el adaptador emula GQA mediante expansión 7x de cabezas KV, lo que puede afectar a la eficiencia real.
- No se documentan capacidades de tool calling, agentes, visión ni audio; no debe asumirse que las hereda del modelo base.
- No se documenta soporte para cuantización (GGUF, AWQ, GPTQ) ni para motores de inferencia optimizados (vLLM, llama.cpp, TGI), lo que limita su despliegue en producción.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al ser un modelo de 0,5B, el riesgo de alucinación es inherentemente alto.
- Licencia MIT permite uso comercial, pero el modelo base Qwen2.5-0.5B tiene licencia Apache 2.0; conviene verificar la compatibilidad de ambas licencias en un uso comercial combinado.
- El modelo está pensado para investigación en arquitecturas de atención, no como generador de texto de propósito general.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-triton-cosformer-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext

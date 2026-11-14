# Hooshaai/qwen-2.5-0.5b-eat-wikitext2

## Resumen

`Hooshaai/qwen-2.5-0.5b-eat-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que se han sustituido quirúrgicamente los bloques de atención del decodificador por el operador `EATBlock` (Efficient Attention Transformer with Progressive Token Pruning), perteneciente al registro `ATTENTION_REGISTRY` del proyecto NeuralOps. El resultado es un modelo de lenguaje causal de 495.138.688 parámetros (~0,5 mil millones) con atención subcuadrática híbrida, destilado sobre WikiText-2 para recuperar la calidad perdida tras la cirugía arquitectónica.

El interés de esta ficha no reside en su rendimiento absoluto, sino en su valor como prueba de concepto: demuestra que es posible reemplazar la atención cuadrática estándar de un transformer preentrenado por un operador alternativo (con poda progresiva de tokens) y recuperar la perplejidad mediante un proceso de destilación de conocimiento en dos etapas de apenas 357 pasos y 180 segundos de cómputo. La perplejidad en validación de WikiText-2 pasa de 139,81 (baseline cero-shot tras la cirugía) a 26,79 tras la destilación, una mejora de 113,01 puntos.

El modelo se distribuye con licencia MIT, está pensado exclusivamente para inglés y su biblioteca de carga es `neuralops`, no `transformers` estándar (aunque incluye instrucciones para ambos flujos). Por su tamaño y naturaleza experimental, está orientado a investigadores que evalúan técnicas de sustitución de atención, no a despliegues de producción convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención híbrida: 18/24 capas con `EATBlock` (atención subcuadrática con poda progresiva de tokens) y 6/24 capas con atención cuadrática completa (índices 3, 7, 11, 15, 19, 23) |
| Parametros totales | 495.138.688 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento usó `seq_len=512`; el modelo base Qwen2.5-0.5B soporta hasta 32.768 tokens, pero no se confirma para este checkpoint) |
| Tipos de cuantizacion | No disponible (solo se documenta FP16 para inferencia y FP32 para parámetros maestros del estudiante durante el entrenamiento) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors` 944,44 MB; `attention_weights.safetensors` 86,24 MB); también `config.json` y `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B, un transformer decoder-only con 24 capas, `hidden_size=896`, 14 cabezas de consulta y 2 cabezas KV (GQA con `head_dim=64`). Sobre esta base se aplica un patrón de cirugía `hybrid_3_1`: se sustituyen 18 de las 24 capas de atención por `EATBlock` mediante el `QwenAttentionAdapter`, que gestiona la expansión 7x de cabezas KV y respeta el contrato de `o_proj` única. Las 6 capas restantes conservan la atención cuadrática original como anclas, intercaladas en los índices 3, 7, 11, 15, 19 y 23. El `EATBlock` soporta atención causal, bidireccional y cross-attention, además de GQA nativo, y se clasifica como operador de atención personalizado (`is_custom_attention: Yes`); no usa RoPE de forma nativa según la model card.

El entrenamiento consiste en una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 1 (alineación con backbone congelado) ejecuta 108 pasos en 54,2 segundos, con `lm_head` desactivado y pérdida MSE + coseno a nivel de capa con peso 0,25. La etapa 2 (destilación de representación multicapa) ejecuta 249 pasos en 125,8 segundos con peso 0,50. En total, 357 pasos de optimización en 180,3 segundos con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando un pico de VRAM de 18.712 MB en FP16 autocast con parámetros maestros en FP32. No se documenta uso de RLHF ni DPO.

## Capacidades

- Generación de texto causal autorregresiva en inglés.
- Atención subcuadrática con poda progresiva de tokens en 18 de las 24 capas, lo que reduce el coste computacional teórico frente a atención cuadrática completa.
- Soporte de atención bidireccional y cross-attention a nivel de operador `EATBlock` (según la model card del módulo).
- Soporte nativo de GQA (14 cabezas de consulta, 2 KV) con expansión automática 7x en las capas transplantadas.
- Capacidad conversacional heredada del modelo base Qwen2.5-0.5B (tag `conversational`).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito para este checkpoint.

## Casos de uso

- Investigación en atención eficiente: permite comparar empíricamente el operador `EATBlock` frente a atención cuadrática en un backbone conocido, usando la perplejidad de WikiText-2 como métrica controlada.
- Validación de pipelines de cirugía arquitectónica: sirve como referencia para probar el `QwenAttentionAdapter` y el patrón `hybrid_3_1` antes de aplicarlos a modelos mayores.
- Destilación de conocimiento a bajo coste: el registro de 357 pasos y 180 segundos demuestra un flujo reproducible para recuperar calidad tras una sustitución de atención, útil como plantilla metodológica.
- Experimentos de poda de tokens en inferencia: el `EATBlock` con poda progresiva permite estudiar el equilibrio entre latencia y calidad en generación de texto corto.
- Benchmarking de operadores de atención: integrable en suites comparativas de atención subcuadrática (linear attention, sliding window, etc.) sobre un mismo modelo base.
- Docencia y prototipado: su tamaño (~1,1 GB de repo) permite ejecutarlo en GPUs de consumo para demostrar conceptos de destilación y cirugía de modelos sin grandes recursos.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor | Notas |
|---|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 26,79 | Resultado final declarado por el autor (no verificado) |
| WikiText-2 (baseline post-cirugía, Stage 0) | Perplejidad | 139,81 | Baseline cero-shot antes de destilación |
| Delta de perplejidad | Mejora | -113,01 | Recuperación tras las dos etapas de KD |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1 GB para los pesos (944,44 MB de `model.safetensors` más 86,24 MB de `attention_weights.safetensors`), más overhead de activaciones y caché KV.
- VRAM de entrenamiento documentada: 18.712 MB de pico en FP16 autocast con parámetros maestros en FP32 durante la destilación.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia en FP16; para el flujo de destilación documentado se requiere una GPU de ~24 GB (A10, L4, RTX 3090/4090, A100).
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090 y similares.
- Opciones de despliegue: la vía documentada es `neuralops.hub.load_surgeried_model` o la carga manual con `transformers` + `apply_qwen_attention_surgery`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que la arquitectura modificada requiere el runtime de NeuralOps.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/qwen-2.5-0.5b-eat-wikitext2` | 495 M | No disponible | 26,79 | MIT | Hugging Face, requiere runtime NeuralOps |
| `Qwen/Qwen2.5-0.5B` (base) | ~494 M | 32.768 tokens | No disponible en esta ficha | Apache 2.0 | Hugging Face, `transformers` estándar |
| Alternativas de atención eficiente sobre backbones pequeños | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación directa con el modelo base Qwen2.5-0.5B no es posible en perplejidad porque no se ha proporcionado el valor de referencia del original en esta información. La diferencia principal frente al base es la arquitectura de atención (híbrida subcuadrática frente a cuadrática) y el runtime requerido.

## Limitaciones y advertencias

- Modelo experimental de investigación: no está pensado para producción y su perplejidad (26,79) es notablemente superior a la de modelos pequeños bien entrenados, lo que sugiere calidad limitada en generación.
- Entrenado exclusivamente sobre WikiText-2, un corpus enciclopédico de dominio estrecho; el riesgo de degradación fuera de dominio es alto.
- Solo soporta inglés; no se documenta multilingüismo pese a que el modelo base Qwen2.5 sí es multilingüe.
- Riesgo elevado de alucinación y de generación incoherente fuera de textos similares a WikiText, dado el proceso de destilación limitado (357 pasos).
- Requiere el runtime `neuralops` para cargar los pesos tal cual; no es directamente compatible con `transformers`, vLLM, llama.cpp ni Ollama sin aplicar la cirugía manualmente.
- No se documentan evaluaciones de sesgo, toxicidad ni seguridad.
- El tag de licencia es MIT, lo que permite uso comercial, pero el modelo base Qwen2.5-0.5B tiene su propia licencia Apache 2.0; conviene verificar la compatibilidad en despliegues comerciales.
- El autor del repo en los ejemplos de la model card aparece como `tahamajs`, mientras que el ID del modelo es `Hooshaai`; verificar la ruta correcta antes de cargar.
- No se documenta la longitud de contexto efectiva del checkpoint tras la cirugía; asumir 512 tokens (longitud de entrenamiento) como valor seguro.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-eat-wikitext2
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext

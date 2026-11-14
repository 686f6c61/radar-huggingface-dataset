# Hooshaai/qwen-2.5-0.5b-nha-attention-wikitext2

## Resumen

`Hooshaai/qwen-2.5-0.5b-nha-attention-wikitext2` es un checkpoint experimental derivado de `Qwen/Qwen2.5-0.5B` en el que las capas de atencion del decoder han sido sustituidas quirurgicamente por el operador `nha_attention` (`NativeHybridAttention`) del registro `ATTENTION_REGISTRY` del framework NeuralOps. No es un modelo entrenado desde cero ni un fine-tuning convencional: es una intervencion arquitectonica sobre los pesos de atencion de un modelo base, seguida de un proceso de destilacion de conocimiento en dos etapas sobre WikiText-2.

El objetivo del autor es explorar alternativas de atencion subcuadratica sobre un transformer preentrenado pequeno, manteniendo parte de la estructura original como anclaje. La topologia aplicada es `hybrid_3_1`: 18 de las 24 capas han sido transplantadas con `nha_attention` mediante `QwenAttentionAdapter`, mientras que 6 capas preservan atencion cuadratica completa en los indices `[3, 7, 11, 15, 19, 23]`.

Es relevante ahora como artefacto de investigacion dentro del ecosistema NeuralOps (attention zoo), no como modelo listo para produccion. El propio autor reporta una perplejidad de validacion en WikiText-2 de `inf`, lo que indica que la destilacion no ha conseguido recuperar el comportamiento del modelo base tras la cirugia de atencion. Cualquier uso practico debe hacerse con cautela y con validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas con `NativeHybridAttention` (`nha_attention`) y 6/24 capas con atencion cuadratica completa (patron `hybrid_3_1`) |
| Parametros totales | 0.5B (heredados de Qwen2.5-0.5B; el checkpoint publicado contiene solo pesos de atencion, 87.00 MB) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-0.5B soporta contexto nativo de 32.768 tokens, pero el checkpoint derivado no declara configuracion propia) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors FP16/FP32 master; no se listan GGUF, AWQ, GPTQ ni otras variantes) |
| Idiomas soportados | en |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 87.00 MB) + `config.json`, `tokenizer.json`, `training_metrics.json` |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-0.5B`, un transformer decoder-only con GQA (14 cabezas de query, 2 cabezas KV, `head_dim=64`, `hidden_size=896`). Sobre esa base se aplica una "cirugia" de atencion: el `QwenAttentionAdapter` mapea las proyecciones originales `Qwen2Attention` al operador `nha_attention`, con expansion automatica de cabezas KV (7x cuando es necesario) y un contrato de `o_proj` unico. La topologia `hybrid_3_1` intercala 18 capas con atencion hibrida subcuadratica y conserva 6 capas cuadraticas como anclas en los indices `[3, 7, 11, 15, 19, 23]`.

El `NativeHybridAttention` declara soporte causal autorregresivo, bidireccional, cross-attention, GQA nativo y RoPE, y se registra como operador de atencion personalizado (`is_custom_attention = Yes`). El entrenamiento posterior consiste en una destilacion de conocimiento en dos etapas sobre `Salesforce/wikitext` (`wikitext-2-raw-v1`): Stage 1 (alineamiento con backbone congelado, 118 pasos, 54.3 s) con `lm_head` bypassado y MSE/coseno por capa a 0.25; Stage 2 (destilacion de representacion multicapa, 271 pasos, 125.5 s) con MSE/coseno a 0.50. En total, 389 pasos en 180.1 s con `seq_len=512`, `grad_accum=4`, `topk=64` y un pico de VRAM de 18.046 MB en FP16 autocast con parametros master FP32. No se documentan datos de RLHF, DPO ni instruccion tuning.

## Capacidades

- Generacion de texto causal autorregresiva (tarea declarada: `text-generation` / Causal Language Modeling).
- Soporte de atencion hibrida con operador personalizado `nha_attention`, incluido en el registro NeuralOps.
- Soporte nativo de GQA, RoPE, atencion bidireccional y cross-attention a nivel de operador (segun la tabla de capacidades del modulo).
- Capacidades multilingues limitadas al ingles (`language: en`).
- Integracion con el ecosistema NeuralOps via `neuralops.hub.load_surgeried_model` y via `apply_qwen_attention_surgery`.
- No se declaran capacidades de tool calling, function calling, agentes, vision, audio ni modo thinking en la informacion disponible.
- No se declaran capacidades de razonamiento multi-step ni de codigo o matematicas especificas.

## Casos de uso

- Investigacion sobre atencion subcuadratica: el checkpoint permite reproducir la topologia `hybrid_3_1` sobre Qwen2.5-0.5B y comparar el efecto de sustituir capas de atencion por `nha_attention` frente a la atencion cuadratica original, usando WikiText-2 como referencia.
- Estudio de destilacion de conocimiento post-cirugia: las metricas de las dos etapas (118 + 271 pasos, MSE/coseno por capa) sirven como plantilla reproducible para experimentos de recuperacion de representaciones tras intervenciones arquitectonicas.
- Benchmarking de operadores de atencion: al integrarse con `ATTENTION_REGISTRY`, permite medir latencia, memoria y perplejidad de `nha_attention` en un decoder de 0.5B con GQA, util para evaluar viabilidad de atencion subcuadratica en GPUs consumer.
- Prototipado en el framework NeuralOps: el snippet `load_surgeried_model("tahamajs/qwen-2.5-0.5b-nha-attention-wikitext2")` permite cargar el checkpoint en una linea para pruebas de integracion del hub.
- Docencia y divulgacion tecnica: como ejemplo didactico de "cirugia" de atencion y destilacion en dos etapas sobre un modelo preentrenado pequeno, con telemetria completa publicada.
- Exploracion de arquitecturas hibridas: la combinacion de capas subcuadraticas con anclas cuadraticas en indices fijos es un patron reutilizable para estudiar estabilidad de entrenamiento y recuperacion de perplejidad.

## Benchmarks y rendimiento

| Benchmark | Metrica | Valor | Verificado |
|---|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplexity | `inf` | No |
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Pre-KD Causal PPL (Stage 0) | `inf` | No |
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Post-KD Causal PPL | `inf` | No |
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplexity Delta | `+nan` | No |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible. Los unicos datos reportados son los de perplejidad en WikiText-2, con valor `inf` en validacion y no verificados por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra oficial para el checkpoint derivado; el modelo base Qwen2.5-0.5B en FP16 ocupa aproximadamente 1 GB de pesos, pero el checkpoint publicado contiene solo pesos de atencion (87 MB) y requiere cargar el modelo base completo.
- VRAM de entrenamiento reportada: pico de 18.046 MB (unos 18 GB) con FP16 autocast y parametros master FP32, `seq_len=512`, `grad_accum=4`.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano del modelo base (0.5B), cabe en GPUs consumer modernas, pero no se documentan modelos concretos.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del modelo base (0.5B), pero no se confirma en la informacion disponible.
- Opciones de despliegue: el autor documenta carga via `transformers` + `apply_qwen_attention_surgery` y via `neuralops.hub.load_surgeried_model`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/qwen-2.5-0.5b-nha-attention-wikitext2` | 0.5B (solo pesos de atencion) | no disponible | `inf` (no verificado) | MIT | Hugging Face |
| `Qwen/Qwen2.5-0.5B` (base) | 0.5B | 32.768 tokens (nativo) | no disponible en la informacion | Apache 2.0 (modelo base Qwen2.5) | Hugging Face |
| Alternativas de atencion subcuadratica sobre modelos pequenos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de comparativas con otros checkpoints del attention zoo de NeuralOps ni con modelos subcuadraticos equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- Perplejidad de validacion reportada como `inf`: la destilacion no ha recuperado el comportamiento del modelo base tras la cirugia de atencion, lo que sugiere que la generacion puede ser degenerada o incoherente. No usar en produccion sin validacion propia.
- El checkpoint contiene solo pesos de atencion (`attention_weights.safetensors`, 87 MB); requiere cargar `Qwen/Qwen2.5-0.5B` y aplicar la cirugia antes de cargar el state dict con `strict=False`.
- Idiomas: solo ingles declarado; no hay soporte multilingue documentado.
- No se declaran capacidades de tool calling, agentes, vision, audio ni modo thinking; no asumir comportamientos del modelo base Qwen2.5-0.5B.
- Datos de benchmarks no verificados por el autor (`verified: false`); no hay resultados en MMLU, HumanEval, GSM8K ni otros.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible; heredables del modelo base y del dataset WikiText-2, pero sin analisis publicado.
- Restricciones de licencia: MIT segun el autor, pero el modelo base Qwen2.5-0.5B se distribuye bajo Apache 2.0; conviene revisar la compatibilidad para uso comercial.
- El repositorio mezcla identificadores (`Hooshaai/qwen-2.5-0.5b-nha-attention-wikitext2` en Hugging Face y `tahamajs/qwen-2.5-0.5b-nha-attention-wikitext2` en los snippets de la model card), lo que puede causar confusion al cargar el checkpoint.
- Libreria `neuralops` requerida para el flujo de carga recomendado; no es un checkpoint estandar cargable solo con `transformers`.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-nha-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext

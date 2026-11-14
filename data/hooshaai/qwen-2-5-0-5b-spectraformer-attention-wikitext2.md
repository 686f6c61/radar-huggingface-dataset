# Hooshaai/qwen-2.5-0.5b-spectraformer-attention-wikitext2

## Resumen

El modelo `qwen-2.5-0.5b-spectraformer-attention-wikitext2`, publicado por el usuario Hooshaai en Hugging Face, es un checkpoint experimental de Qwen2.5-0.5B en el que se han sustituido quirurgicamente los bloques de atencion del decodificador por el modulo `spectraformer_attention` del registro `ATTENTION_REGISTRY` del proyecto NeuralOps. Se trata, por tanto, de un experimento de investigacion sobre atencion subcuadratica y destilacion de conocimiento, no de un modelo de proposito general listo para produccion.

El modelo parte de la arquitectura Qwen2 (transformer decoder-only con 24 capas, 14 cabezas de consulta, 2 cabezas KV, `head_dim=64` y `hidden_size=896`, lo que arroja aproximadamente 0,5 mil millones de parametros). Sobre esa base se aplica un patron hibrido `hybrid_3_1`: 18 de las 24 capas se reemplazan por atencion Spectraformer (atencion lineal exacta mediante kernelizacion con caracteristicas aleatorias) y se conservan 6 capas de atencion cuadratica completa como anclas en los indices [3, 7, 11, 15, 19, 23]. Posteriormente se aplica una destilacion de conocimiento en dos etapas sobre WikiText-2 para recuperar la calidad del modelo original tras la cirugia.

Su relevancia es fundamentalmente metodologica: demuestra que es posible transplantar un mecanismo de atencion alternativo en un LLM preentrenado y recuperar parcialmente su comportamiento mediante destilacion por capas en apenas 405 pasos de optimizacion (180,3 segundos). El resultado final, una perplejidad de 261,94 en la validacion de WikiText-2, sigue siendo muy superior a la del modelo base y debe interpretarse como una prueba de concepto, no como un modelo competitivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida `hybrid_3_1`: 18/24 capas con `SpectraformerAttention` (atencion lineal por kernelizacion con caracteristicas aleatorias) y 6/24 capas con atencion cuadratica completa en indices [3, 7, 11, 15, 19, 23] |
| Parametros totales | Aproximadamente 0,5 mil millones (modelo base Qwen2.5-0.5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el entrenamiento uso `seq_len=512`; el modelo base Qwen2.5-0.5B soporta contexto nativo mayor, pero no se especifica para este checkpoint) |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos en safetensors; el ejemplo de uso emplea FP16) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`, 124,03 MB) |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen2.5-0.5B, un transformer decoder-only con 24 capas, 14 cabezas de atencion de consulta y 2 cabezas KV (GQA), `head_dim=64` y `hidden_size=896`. Sobre esta base se aplica el patron de cirugia `hybrid_3_1` mediante el `QwenAttentionAdapter`, que expande las 2 cabezas KV a 14 cuando es necesario (expansion 7x), mantiene el contrato de una unica `o_proj` y sustituye 18 capas por `SpectraformerAttention`. Este modulo implementa atencion lineal exacta en tiempo O(n) mediante kernelizacion con caracteristicas aleatorias, soporta modo causal, bidireccional y cross-attention, pero no soporta GQA nativo ni RoPE.

Tras la cirugia, la perplejidad causal zero-shot se dispara a 21.824,58 en `wikitext-2-raw-v1`, lo que evidencia el dano severo que provoca el reemplazo de atencion. Para recuperar el comportamiento se aplica una destilacion de conocimiento en dos etapas: una primera etapa de alineacion con backbone congelado (123 pasos, 54,3 s) que omite el `lm_head` y minimiza MSE y coseno (peso 0,25) sobre estados ocultos capa a capa; y una segunda etapa de destilacion de representaciones multicapa (282 pasos, 125,7 s) con MSE y coseno (peso 0,50). En total, 405 pasos de optimizacion en 180,3 segundos con `seq_len=512`, `grad_accum=4` y `topk=64`, alcanzando 16.513 MB de VRAM pico en FP16 con autocast y parametros maestros en FP32.

## Capacidades

- Generacion de texto autoregresiva causal (tarea principal declarada: `text-generation` / Causal Language Modeling).
- Soporte de atencion causal, bidireccional y cross-attention a nivel de modulo (segun el perfil de capacidades de `SpectraformerAttention`).
- Capacidad de conversacion heredada del modelo base Qwen2.5-0.5B (etiqueta `conversational`).
- Atencion lineal en tiempo O(n) en las 18 capas transplantadas, lo que en teoria reduce el coste computacional frente a la atencion cuadratica.
- No se documenta soporte de tool calling ni function calling especifico para este checkpoint.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta soporte de vision, audio ni modo thinking.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Investigacion sobre atencion subcuadratica: el checkpoint sirve como referencia reproducible para estudiar el impacto del reemplazo de atencion cuadratica por atencion lineal en un LLM preentrenado, usando la telemetria de perplejidad pre y post-destilacion como linea base.
- Experimentos de destilacion de conocimiento: las dos etapas documentadas (alineacion con backbone congelado y destilacion de representaciones multicapa) pueden replicarse o modificarse para evaluar variantes de la receta con otros modelos base o datasets.
- Evaluacion de modulos del `ATTENTION_REGISTRY`: permite comparar `spectraformer_attention` frente a otros mecanismos del registro NeuralOps bajo el mismo protocolo de cirugia y destilacion.
- Pruebas de integracion del `QwenAttentionAdapter`: util para validar la expansion de cabezas KV (14:2), el contrato de `o_proj` unica y la compatibilidad con el pipeline de carga de NeuralOps.
- Benchmarking de perplejidad en WikiText-2: sirve como punto de comparacion para futuros checkpoints del "Qwen Attention Zoo" publicados por el mismo autor.
- Docencia y divulgacion tecnica: ejemplo didactico de como una cirugia de atencion degrada drasticamente un modelo (PPL de 21.824,58) y como la destilacion recupera parte del rendimiento (PPL de 261,94) en menos de 3 minutos de computo.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` de la model card (no verificados):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 261,94 |

Telemetria interna del proceso de destilacion (declarada por el autor):

| Metrica / Etapa | Valor |
|---|---|
| Perplejidad causal pre-KD (etapa 0, zero-shot post-cirugia) | 21.824,58 |
| Perplejidad causal post-KD | 261,94 |
| Delta de perplejidad | -21.562,64 |
| Etapa 1 (alineacion con backbone congelado) | 123 pasos (54,3 s) |
| Etapa 2 (destilacion de representaciones multicapa) | 282 pasos (125,7 s) |
| Pasos totales / tiempo total | 405 pasos / 180,3 s |
| VRAM pico en GPU | 16.513 MB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint completo en FP16 ocupa aproximadamente 1 GB (0,5B parametros); con overhead de activaciones y cache KV, cabe holgadamente en GPUs consumer de 4-8 GB.
- El proceso de entrenamiento documentado requirio 16.513 MB de VRAM pico (FP16 autocast con parametros maestros en FP32), por lo que se uso al menos una GPU de 24 GB (RTX 3090/4090, A10G, L4 no seria suficiente).
- GPUs recomendadas para inferencia: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) o profesional (A100, H100) sin problema de capacidad.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas de VRAM.
- Opciones de despliegue: la libreria declarada es `neuralops`; el ejemplo oficial usa `transformers` + `safetensors` + `apply_qwen_attention_surgery`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y dado que el checkpoint contiene solo pesos de atencion (no un modelo completo empaquetado), su despliegue requiere el pipeline de cirugia de NeuralOps.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Hooshaai/qwen-2.5-0.5b-spectraformer-attention-wikitext2` | ~0,5B | No disponible | 261,94 (validation, declarado) | MIT | Hugging Face, requiere NeuralOps |
| Qwen/Qwen2.5-0.5B (base) | ~0,5B | 32.768 tokens (nativo del base, no confirmado para este checkpoint) | No disponible en la informacion proporcionada | Apache 2.0 | Hugging Face, transformers |
| Otros checkpoints del "Qwen Attention Zoo" de NeuralOps | ~0,5B | No disponible | No disponible | MIT (segun repo NeuralOps) | Hugging Face |

No se dispone de datos de benchmarks comparables de otros modelos de atencion subcuadratica del mismo tamano en la informacion proporcionada.

## Limitaciones y advertencias

- La perplejidad de 261,94 en WikiText-2 es muy elevada para un modelo de 0,5B; el checkpoint no es apto para uso en produccion ni para generacion de texto de calidad.
- El modelo solo ha sido entrenado/destilado sobre WikiText-2 en ingles; no se ha evaluado su comportamiento en otros dominios ni idiomas.
- La model card esta orientada a un experimento de investigacion; no se documentan evaluaciones de seguridad, sesgos ni alucinacion.
- El checkpoint contiene unicamente pesos de atencion (`attention_weights.safetensors`, 124,03 MB), no el modelo completo: para usarlo es imprescindible aplicar la cirugia `apply_qwen_attention_surgery` con `attn_key="spectraformer_attention"` y `pattern="hybrid_3_1"` sobre Qwen2.5-0.5B.
- El modulo `SpectraformerAttention` no soporta GQA nativo ni RoPE, lo que limita la fidelidad respecto al modelo original y puede afectar a la calidad en contextos largos.
- La licencia MIT del checkpoint no exime de cumplir la licencia del modelo base Qwen2.5-0.5B (Apache 2.0) al redistribuir o usar comercialmente.
- El repositorio es de un autor individual (Hooshaai) y no aparece verificado por la organizacion oficial de NeuralOps; conviene tratar los datos como no auditados.
- El identificador del repositorio en el ejemplo de codigo de la model card (`tahamajs/qwen-2.5-0.5b-spectraformer-attention-wikitext2`) difiere del ID real del repositorio (`Hooshaai/...`), lo que puede causar errores al replicar el ejemplo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-spectraformer-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext

# Hooshaai/qwen-2.5-0.5b-residual-svd-attention-wikitext2

## Resumen

El modelo `qwen-2.5-0.5b-residual-svd-attention-wikitext2`, publicado por el usuario Hooshaai, es un checkpoint experimental derivado de Qwen/Qwen2.5-0.5B en el que se han sustituido quirúrgicamente parte de los bloques de atención del decodificador por un operador propio denominado `ResidualSVDAttention` (atención SVD residual de bajo rango), dentro del marco de trabajo NeuralOps. No se trata de un modelo nuevo entrenado desde cero, sino de una cirugía de arquitectura sobre el modelo base seguida de una destilación de conocimiento en dos etapas para recuperar la calidad tras el reemplazo de las capas.

El objetivo del experimento es explorar atención subcuadrática y eficiente en modelos pequeños, manteniendo anclas de atención cuadrática completa para preservar capacidad expresiva. El checkpoint final se ha ajustado sobre WikiText-2 y se distribuye únicamente con los pesos de atención (`attention_weights.safetensors`, 51,37 MB), no con el modelo completo, por lo que requiere cargar primero el Qwen2.5-0.5B original y aplicar la cirugía antes de inyectar los pesos.

Es relevante para investigadores interesados en arquitecturas de atención alternativas, destilación de representaciones y técnicas de "model surgery", más que para uso en producción: la perplejidad declarada (328,55 en WikiText-2) es muy alta comparada con el modelo base, lo que indica que la recuperación es solo parcial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas con `ResidualSVDAttention` y 6/24 capas con atencion cuadratica completa |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B); pesos de atencion distribuidos: 51,37 MB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-0.5B soporta 32 768 tokens, pero la model card no lo confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en safetensors, sin GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`) + `config.json` + `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B (14 cabezas de consulta, 2 cabezas KV, `head_dim=64`, `hidden_size=896`) y aplica un patron de cirugia `hybrid_3_1`: se sustituyen 18 de las 24 capas de atencion por el operador `ResidualSVDAttention` mediante `QwenAttentionAdapter` (con expansion 7x de cabezas KV y contrato de un solo `o_proj`), mientras que 6 capas ancla en los indices `[3, 7, 11, 15, 19, 23]` conservan atencion cuadratica completa. El operador admite atencion causal, bidireccional y cross-attention, pero no soporta GQA nativo ni RoPE de forma nativa.

El entrenamiento consiste en una destilacion de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`): una primera etapa de alineacion con backbone congelado (115 pasos, 54,2 s, MSE y coseno por capa con peso 0,25, `lm_head` desactivado) y una segunda de destilacion multinivel de representaciones (265 pasos, 126,1 s, peso coseno 0,50). En total, 380 pasos con `seq_len=512`, `grad_accum=4` y `topk=64`, en 180,5 s y con un pico de 17 317 MB de VRAM en FP16 con parametros maestros en FP32. La perplejidad causal pasó de 119 371,82 (baseline cero tras la cirugia) a 328,55 tras la destilacion, una recuperacion de 119 043,27 puntos pero aun muy lejos del modelo base.

## Capacidades

- Generacion de texto causal autorregresiva en ingles.
- Atencion causal, bidireccional y cross-attention a nivel de operador (segun la tabla de capacidades del modulo).
- Razonamiento y codigo: no verificado ni documentado en la model card; no se debe asumir.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles declarado.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.
- Al ser un checkpoint de investigacion con perplejidad alta, la calidad de generacion es limitada y no apta para uso conversacional real.

## Casos de uso

- Investigacion en atencion subcuadratica: banco de pruebas para comparar `ResidualSVDAttention` frente a atencion cuadratica completa en un modelo de 0,5B, midiendo perplejidad en WikiText-2.
- Estudio de tecnicas de model surgery: reproducir el patron `hybrid_3_1` y el adaptador `QwenAttentionAdapter` para analizar el impacto de sustituir capas de atencion en modelos Qwen2.
- Experimentos de destilacion de conocimiento: usar las dos etapas documentadas (alineacion con backbone congelado y destilacion multinivel) como referencia para recuperar calidad tras modificaciones estructurales.
- Docencia y formacion: ejemplo didactico de cirugia de arquitectura y evaluacion con perplejidad en un modelo pequeno que cabe en una sola GPU.
- Baseline para ablaciones: punto de partida para comparar variantes de atencion eficiente (por ejemplo, otras claves del `ATTENTION_REGISTRY` de NeuralOps) sobre el mismo modelo base.
- Pruebas de integracion del ecosistema NeuralOps: validar la API `load_surgeried_model` y el flujo de carga de pesos de atencion desde Hugging Face Hub.
- No recomendado para atencion al cliente, generacion de codigo en produccion ni aplicaciones comerciales reales, dada la perplejidad elevada y la falta de evaluaciones de calidad.

## Benchmarks y rendimiento

Datos declarados por el autor en el `model-index` (no verificados):

| Benchmark | Metrica | Valor |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validacion) | Perplejidad | 328,55 |

Telemetria de entrenamiento declarada:

| Etapa | Metrica | Valor |
|---|---|---|
| Stage 0 (post-cirugia, cero-shot) | Perplejidad causal | 119 371,82 |
| Post-destilacion | Perplejidad causal | 328,55 |
| Delta | Recuperacion | -119 043,27 |
| Stage 1 (alineacion) | Pasos / tiempo | 115 / 54,2 s |
| Stage 2 (destilacion multinivel) | Pasos / tiempo | 265 / 126,1 s |
| Total | Pasos / tiempo | 380 / 180,5 s |
| Pico VRAM | FP16 autocast | 17 317 MB |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Qwen2.5-0.5B en FP16 ocupa aproximadamente 1 GB de pesos; con activaciones y contexto moderado, cabe en GPUs consumer de 4-8 GB. El pico de 17 317 MB corresponde al entrenamiento, no a inferencia.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia; para entrenamiento o destilacion se uso una GPU con al menos 17-18 GB (por ejemplo, RTX 4090 de 24 GB o A100).
- Cabe en GPU consumer: si, en la mayoria de GPUs con 4 GB o mas en FP16.
- Opciones de despliegue: requiere el ecosistema NeuralOps (`neuralops.hub.load_surgeried_model`) o el flujo manual con `transformers` + `apply_qwen_attention_surgery` + carga de `attention_weights.safetensors`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que no se publican pesos en GGUF ni un modelo completo listo para servir.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (residual_svd_attention) | 0,5B | no disponible | 328,55 (declarada) | MIT | Pesos de atencion solamente |
| Qwen/Qwen2.5-0.5B (base) | 0,5B | 32 768 tokens | no disponible en esta ficha | Apache 2.0 (segun modelo base) | Modelo completo en HF |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B | 32 768 tokens | no disponible en esta ficha | Apache 2.0 | Modelo completo en HF, ajustado para instrucciones |
| Modelos de 0,5B con atencion eficiente (p. ej., variantes de la atencion zoo de NeuralOps) | 0,5B | no disponible | no disponible | MIT (segun repositorio) | Pesos de atencion |

La comparativa directa de rendimiento con el modelo base no es posible con los datos disponibles; la perplejidad de 328,55 sugiere un deterioro sustancial frente a un Qwen2.5-0.5B sin modificar, aunque no se aporta la cifra de referencia.

## Limitaciones y advertencias

- Perplejidad muy elevada (328,55) en WikiText-2, lo que indica que la destilacion no ha recuperado la calidad del modelo base; no apto para produccion.
- Solo se distribuyen los pesos de atencion; es necesario cargar Qwen2.5-0.5B y aplicar la cirugia con el codigo de NeuralOps, lo que anade complejidad y dependencias.
- Solo ingles declarado; sin capacidades multilingues documentadas.
- No hay evaluaciones de sesgo, alucinacion ni seguridad.
- No soporta GQA nativo ni RoPE de forma nativa en el operador de atencion, lo que puede limitar la extension de contexto.
- Los benchmarks son declarados por el autor y no estan verificados (`verified: false`).
- La licencia MIT aplica al checkpoint, pero el modelo base Qwen2.5-0.5B tiene su propia licencia (Apache 2.0) que debe respetarse al redistribuir.
- El repositorio tiene pocas descargas (356) y cero likes, lo que sugiere escasa validacion por parte de la comunidad.
- El identificador del repositorio en el codigo de ejemplo (`tahamajs/...`) difiere del ID de Hugging Face (`Hooshaai/...`), lo que puede causar errores al seguir la guia de inicio rapido.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-residual-svd-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
- Licencia MIT de NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE

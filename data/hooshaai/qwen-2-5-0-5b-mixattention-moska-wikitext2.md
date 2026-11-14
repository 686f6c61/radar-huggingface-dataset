# Hooshaai/qwen-2.5-0.5b-mixattention-moska-wikitext2

## Resumen

`qwen-2.5-0.5b-mixattention-moska-wikitext2` es un checkpoint experimental publicado por el usuario Hooshaai dentro del proyecto NeuralOps (Attention Zoo). No es un modelo entrenado desde cero, sino un Qwen2.5-0.5B original de Alibaba al que se le han sustituido quirúrgicamente los bloques de atencion del decodificador por el modulo `mixattention_moska` (MixAttention-MoSKA, FASA: atencion dispersa sensible a frecuencia y varianza), seguido de un proceso de destilacion de conocimiento en dos etapas sobre WikiText-2.

El interes del modelo es fundamentalmente de investigacion: demuestra que es posible reemplazar la atencion cuadratica estandar de un transformer por un operador subcuadratico y recuperar la calidad mediante destilacion por capas, pasando de una perplejidad de 139,83 (tras la cirugia, sin entrenamiento) a 25,97 en la validacion de `wikitext-2-raw-v1` en solo 374 pasos de optimizacion (180,3 segundos de entrenamiento). Es, por tanto, una prueba de concepto sobre eficiencia de atencion, no un modelo listo para produccion.

El modelo conserva la arquitectura base de Qwen2.5-0.5B (transformer decoder-only con GQA, 24 capas, hidden size 896, 14 cabezas de consulta y 2 de clave/valor, head_dim 64), con 18 de las 24 capas adaptadas al nuevo operador y 6 capas cuadraticas completas preservadas como anclas. Se distribuye bajo licencia MIT y solo declara soporte para ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida `mixattention_moska` (FASA, subcuadratica) |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B; no se detalla recuento exacto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso `seq_len=512`) |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors, presumiblemente FP16) |
| Idiomas soportados | ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors` 944,44 MB; `attention_weights.safetensors` 86,23 MB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B y aplica una "cirugia" de atencion con patron `hybrid_3_1`: 18 de las 24 capas se sustituyen por `mixattention_moska` mediante el `QwenAttentionAdapter`, mientras que las capas en los indices [3, 7, 11, 15, 19, 23] conservan atencion cuadratica completa como anclas. El adaptador mapea las proyecciones originales (14 cabezas Q, 2 cabezas KV, head_dim 64, hidden_size 896) con expansion automatica de cabezas KV 7x donde es necesario y respeta el contrato de una unica `o_proj`. El modulo `MixAttentionMoSKA` implementa atencion dispersa sensible a frecuencia y varianza: en contextos no causales poda K/V a los `fasa_keep_ratio` tokens mas relevantes por varianza/L2, preservando siempre el token 0; en decodificacion causal con `past_key_value` desactiva la poda y ejecuta atencion densa exacta.

El entrenamiento consiste en una destilacion de conocimiento en dos etapas desde el modelo base: la etapa 1 (113 pasos, 54,2 s) congela el backbone y alinea representaciones ocultas por capas con MSE + coseno (peso 0,25) con `lm_head` desactivado; la etapa 2 (261 pasos, 125,8 s) aplica destilacion multi-capa con peso coseno 0,50. En total, 374 pasos, 180,3 segundos, `seq_len=512`, `grad_accum=4`, `topk=64` y un pico de VRAM de 17.902 MB en FP16 con parametros maestros en FP32. No se reporta el volumen total de tokens de entrenamiento ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto causal en ingles, heredada del modelo base Qwen2.5-0.5B.
- Razonamiento basico y respuesta conversacional de un modelo de 0,5B parametros (capacidad limitada por tamano).
- Soporte de atencion bidireccional y cross-attention a nivel de modulo (segun la ficha del operador), aunque el checkpoint se distribuye como modelo causal.
- Soporte nativo de GQA en el operador de atencion.
- Modo de decodificacion incremental con cache (`past_key_value`), que desactiva la poda dispersa y usa atencion densa exacta.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo "thinking" en la informacion disponible.

## Casos de uso

- Investigacion sobre atencion subcuadratica: sirve como referencia reproducible para medir el coste (en perplejidad) de sustituir atencion cuadratica por un operador disperso y el coste de recuperacion via destilacion por capas.
- Experimentos de cirugia de modelos: el checkpoint y el codigo de `apply_qwen_attention_surgery` permiten replicar el patron `hybrid_3_1` sobre otros modelos Qwen y comparar topologias.
- Evaluacion de tecnicas de destilacion: los datos de telemetria (PPL pre y post KD, pasos, tiempo, VRAM) sirven de linea base para comparar estrategias de alineacion de representaciones.
- Prototipado de bajo coste: con 0,5B parametros y pesos de ~1 GB, cabe en cualquier GPU consumer para pruebas de generacion de texto en ingles sin requisitos de infraestructura.
- Benchmarking de eficiencia de atencion: util para medir latencia y memoria frente al Qwen2.5-0.5B original en tareas de lenguaje cortas.
- Docencia y divulgacion: ejemplo didactico de como se modifica un transformer real a nivel de capas y se reentrena parcialmente.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados):

| Metrica | Dataset | Valor |
|---|---|---|
| Perplejidad de validacion | wikitext-2-raw-v1 (validation) | 25,97 |
| Perplejidad causal pre-KD (Stage 0) | wikitext-2-raw-v1 | 139,83 |
| Delta de perplejidad | wikitext-2-raw-v1 | -113,86 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1-2 GB en FP16 para los pesos (~1 GB de safetensors), mas overhead de activaciones y cache KV.
- El entrenamiento de destilacion requirio 17.902 MB de VRAM en FP16 con parametros maestros en FP32, por lo que se uso una GPU de gama alta (clase A100/H100 o similar).
- Para inferencia cabe en GPUs consumer (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU con suficiente RAM.
- Opciones de despliegue: la libreria declarada es `neuralops`, con carga via `neuralops.hub.load_surgeried_model` o `transformers` + `apply_qwen_attention_surgery`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y al no publicarse GGUF no hay ruta directa a llama.cpp.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Atencion | Licencia | Perplejidad WikiText-2 |
|---|---|---|---|---|---|
| Este modelo (mixattention_moska) | 0,5B | no disponible | Hibrida subcuadratica (18/24 capas) | MIT | 25,97 (declarada) |
| Qwen/Qwen2.5-0.5B (base) | 0,5B | 32.768 tokens (segun ficha oficial de Qwen2.5) | Cuadratica estandar con GQA | Apache 2.0 | no disponible en esta informacion |
| Qwen/Qwen2.5-1.5B | 1,5B | 32.768 tokens (segun ficha oficial) | Cuadratica estandar con GQA | Apache 2.0 | no disponible en esta informacion |

La comparacion directa de perplejidad con el modelo base no es posible con los datos aportados; el autor solo reporta el valor del checkpoint destilado y su estado pre-entrenamiento (139,83).

## Limitaciones y advertencias

- Modelo de investigacion: el objetivo es validar una topologia de atencion, no ofrecer calidad de produccion; la perplejidad de 25,97 en WikiText-2 es alta para un modelo de este tamano.
- Solo entrenado y evaluado en ingles; no se garantiza comportamiento en otros idiomas.
- Capacidad muy limitada por el tamano (0,5B): razonamiento complejo, codigo y matematicas quedan fuera de su alcance practico.
- Riesgo elevado de alucinacion y de incoherencia en generaciones largas, agravado por el entrenamiento corto (374 pasos sobre WikiText-2).
- El checkpoint depende de codigo externo (`neuralops`, `scripts.benchmarks.qwen_zoo_train_mix`) para reconstruir la arquitectura; no es cargable directamente con `transformers` sin aplicar la cirugia.
- La model card contiene referencias a rutas de otro autor (`tahamajs/...`) en los ejemplos de codigo, lo que puede indicar inconsistencia en la publicacion.
- Los benchmarks no estan verificados (`verified: false`).
- Licencia MIT permite uso comercial, pero la falta de validacion y el origen experimental desaconsejan su uso en produccion.
- No se especifica la longitud de contexto efectiva tras la cirugia; el entrenamiento uso secuencias de 512 tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/qwen-2.5-0.5b-mixattention-moska-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext

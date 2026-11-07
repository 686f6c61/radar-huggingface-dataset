# patrickbdevaney/DeepSeek-V4-Flash-0731-REAP-DSpark

## Resumen

DeepSeek-V4-Flash-0731-REAP-DSpark es un checkpoint derivado de DeepSeek-V4-Flash-0731 (MIT, DeepSeek) que combina dos modificaciones sucesivas: una poda REAP que reduce de 256 a 160 los expertos enrutados por capa MoE, y la sustitucion de los tres bloques MTP de decodificacion especulativa DSpark por una cabeza afinada (`s3recap-p25-b0.1`). El resultado es un modelo de ~193.000 millones de parametros totales con ~13.260 millones activos por token, pensado para decodificacion especulativa de un solo flujo sobre una unica NVIDIA Jetson AGX Thor.

El interes practico esta en el binomio rendimiento/memoria: el autor reporta 28,38 tok/s frente a 14,61 tok/s de decodificacion autorregresiva pura en la misma ejecucion (1,94x) sobre una suite congelada de 8 prompts, con anchura de borrador 5. El backbone de 43 capas es byte-identico al repo base; solo cambian los shards 46-48 que contienen los bloques MTP.

Es relevante ahora porque demuestra que la decodificacion especulativa con cabezas MTP afinadas es viable en hardware de borde con memoria unificada de 122,8 GiB, sin GPUs de centro de datos, y porque el ecosistema de pesos esta empaquetado en MXFP4/FP8 con licencia MIT. No es, sin embargo, un modelo listo para produccion general: solo se ha ejecutado con un motor CUDA propio del autor y no se ha probado con Transformers, vLLM ni SGLang.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `DeepseekV4ForCausalLM` (`model_type: deepseek_v4`), MoE con atencion MLA, 43 capas de backbone + 3 bloques MTP DSpark encadenados |
| Parametros totales | ~193.030.047.646 (~180,4 B backbone + ~12,6 B bloques MTP) |
| Parametros activos | ~13,26 B por token (calculado a partir de formas de tensor, no medido) |
| Longitud de contexto | 1.048.576 tokens (`max_position_embeddings`, YaRN factor 16 sobre 65.536); 131.072 tokens servidos en Thor |
| Tipos de cuantizacion | Pesos ya empaquetados: expertos enrutados en OCP MXFP4 (E2M1 empaquetado I8, escalas F8_E8M0 por bloque de 32); atencion, experto compartido y proyecciones densas en FP8 E4M3 con escalas UE8M0 128x128; normas, embedding, `lm_head` y cabeza Markov en BF16/FP32 |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (48 shards, 107.808.354.360 bytes / 100,40 GiB, 45.821 tensores) |

Otros datos tecnicos: 160 expertos enrutados por capa (de 256), top-6, mas 1 experto compartido; MLA con 64 cabezas, `head_dim` 512, LoRA Q/O de rango 1024, ventana deslizante 128, indexador DSA top-512 y ratios de compresion KV 4/128; hyper-connections con `hc_mult` 4 y 20 iteraciones de Sinkhorn; anchura de bloque de borrador 5 (`dspark_block_size`).

## Arquitectura y entrenamiento

El backbone es un transformer MoE con atencion MLA y mecanismo DSA (indexador top-512 sobre ventana deslizante de 128), sin cambios respecto al modelo base. Sobre las capas 40, 41 y 42 se enganchan tres bloques MTP DSpark encadenados que actuan como cabezas de borrador para decodificacion especulativa: proponen tokens que el modelo objetivo verifica en un unico forward. En esta ficha, los tres bloques originales se sustituyen por la cabeza `s3recap-p25-b0.1`, afinada por el autor; el resto de shards (1-45), `config.json`, tokenizer, `REAP_MANIFEST.json`, `reap_plan.json` y el indice de safetensors son byte-identicos al repo base (mismo SHA-256 LFS).

La poda REAP del repo base reduce de 256 a 160 los expertos enrutados por capa, lo que explica la diferencia entre los 304 B del modelo upstream y los ~193 B de este checkpoint. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO; la model card solo documenta el afinado de la cabeza de borrador y remite a los logs del motor para las mediciones. La innovacion destacable es el empaquetado mixto MXFP4/FP8, que permite mantener 100,4 GiB de pesos en un pool unificado de 122,8 GiB.

## Capacidades

- Generacion de texto y razonamiento general, heredados del backbone DeepSeek-V4-Flash-0731.
- Generacion de codigo (el ejemplo de quickstart del autor es una busqueda binaria en Python).
- Decodificacion especulativa de un solo flujo con los tres bloques MTP DSpark y anchura de borrador 5.
- Soporte multilingue limitado a ingles y chino.
- Contexto largo: hasta 1.048.576 tokens teoricos, con 131.072 tokens verificados en Thor.
- Servido mediante API compatible con OpenAI a traves del motor CUDA del autor (endpoint `/v1/chat/completions`).
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking explicito.

## Casos de uso

- Inferencia de borde con contexto largo: desplegar un modelo de ~13,26 B activos en una unica Jetson AGX Thor para tareas de resumen o analisis de documentos extensos, aprovechando los 131.072 tokens ya servidos en ese hardware.
- Aceleracion de decodificacion en dispositivos con memoria unificada: usar la cabeza DSpark para obtener ~1,94x de throughput (28,38 frente a 14,61 tok/s) en generacion interactiva donde la latencia por token es critica.
- Asistente de codigo local: el modelo genera codigo y se sirve por API compatible con OpenAI en el puerto 8080, lo que permite integrarlo en un IDE o en un pipeline de CI/CD que consuma ese endpoint en la red local.
- Laboratorio de investigacion en decodificacion especulativa: el repo de la cabeza incluye 23 cabezas entrenadas adicionales y sus logs, lo que permite comparar estrategias de borrador sobre el mismo backbone.
- Experimentacion con cuantizacion mixta MXFP4/FP8: sirve como banco de pruebas para medir el impacto de escalas por bloque de 32 y UE8M0 128x128 en calidad y velocidad.
- Procesamiento de texto bilingue ingles-chino en entornos sin conectividad, al no requerir GPUs de centro de datos ni servicios externos.
- Prototipado de pipelines de evaluacion de modelos podados: la comparacion entre el repo base (256 expertos) y este (160 expertos) permite medir la degradacion introducida por REAP.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las mediciones de velocidad de decodificacion especulativa del autor, tomadas en una Jetson AGX Thor con los pesos tal como se distribuyen, suite congelada de 8 prompts (uno por categoria), al menos 200 tokens generados por prompt, decodificacion greedy y anchura de borrador 5. τ es el numero de tokens confirmados por forward del modelo objetivo; con anchura 5 puede llegar a 6.

| Metrica | Valor | Referencia en la misma ejecucion |
|---|---|---|
| Throughput de la suite (media) | 28,38 tok/s | 14,61 tok/s en autorregresivo puro |
| Aceleracion | 1,94x | 1,00x |
| Anchura de borrador | 5 | no aplica |
| τ maximo teorico | 6 | no aplica |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los logs completos estan en el repositorio del motor, bajo `evidence/`.

## Requisitos de hardware

- VRAM/memoria: los pesos ocupan 100,4 GiB de un pool unificado de 122,8 GiB en Jetson AGX Thor; el autor advierte explicitamente de no cargar ningun otro modelo en la misma maquina.
- GPU verificada: NVIDIA Jetson AGX Thor con CUDA 13.0, arquitectura objetivo `sm_110a`.
- No cabe en GPUs de consumo convencionales (RTX 4090, 24 GB) ni en configuraciones de 48 GB o 80 GB sin offload o sharding, dado el tamano del checkpoint.
- Despliegue: solo probado con `patrickbdevaney/deepseek-v4-flash-0731-cuda`, motor de peticion unica con servidor compatible con OpenAI (`scripts/build_server.sh`, `scripts/serve.sh`, puerto 8080).
- Transformers, vLLM y SGLang no han sido probados con este checkpoint; el repo base documenta un smoke test preview de vLLM en DGX Spark que requirio un parche del router para 160 expertos y con DSpark desactivado.
- Latencia y throughput: 28,38 tok/s de media en la suite de 8 prompts en Thor; no hay datos de latencia por token ni de throughput con batching (el motor es de peticion unica).

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731-REAP-DSpark (esta ficha) | ~193,0 B | ~13,26 B | 1.048.576 | MIT | Cabeza DSpark afinada; 28,38 tok/s en Thor |
| 0xSero/DeepSeek-V4-Flash-0731-REAP | ~193,0 B (mismo backbone) | ~13,26 B | 1.048.576 | MIT | Misma poda REAP, cabeza DSpark original sin afinar; incluye codigo de referencia `encoding/` e `inference/` |
| deepseek-ai/DeepSeek-V4-Flash-0731 | 304 B | no disponible | no disponible | MIT | Modelo upstream sin podar, 256 expertos por capa |
| deepseek-v4-flash-0731-REAP-calibrated-draft-head | no disponible | no disponible | no disponible | no disponible | Cabeza `s3` anterior, medida con anchura de borrador 6; solo para comparacion historica |

## Limitaciones y advertencias

- Solo se ha ejecutado con un motor CUDA propio del autor, orientado a `sm_110a` y a peticiones unicas; no hay validacion con Transformers, vLLM ni SGLang.
- El rendimiento reportado (1,94x) procede de una unica maquina, una suite de 8 prompts y decodificacion greedy; no es extrapolable a otros hardware ni a cargas con batching.
- El dato de parametros activos (~13,26 B) es un calculo a partir de formas de tensor, no una medicion.
- No hay benchmarks de calidad publicados: se desconoce la degradacion introducida por la poda REAP de 256 a 160 expertos y por el reemplazo de la cabeza de borrador.
- Idiomas limitados a ingles y chino; el castellano no esta declarado como soportado.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible, pero aplicables al heredar el backbone de DeepSeek-V4-Flash-0731.
- Restricciones practicas de despliegue: 100,4 GiB de pesos sobre 122,8 GiB de pool unificado impiden ejecutar simultaneamente cualquier otro modelo en la misma maquina.
- La licencia MIT permite uso comercial, pero el checkpoint no incluye el codigo de referencia `encoding/` e `inference/` del repo base, por lo que la reproducibilidad depende del motor externo del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/patrickbdevaney/DeepSeek-V4-Flash-0731-REAP-DSpark
- Repo base directo: https://huggingface.co/0xSero/DeepSeek-V4-Flash-0731-REAP
- Cabeza de borrador instalada: https://huggingface.co/patrickbdevaney/dspark-mtp-draft-head-s3recap-p25-b0.1
- Cabeza anterior (comparacion historica): https://huggingface.co/patrickbdevaney/deepseek-v4-flash-0731-REAP-calibrated-draft-head
- Modelo upstream: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Motor CUDA del autor: https://github.com/patrickbdevaney/deepseek-v4-flash-0731-cuda
- Paper referenciado en los tags: arxiv:2510.13999

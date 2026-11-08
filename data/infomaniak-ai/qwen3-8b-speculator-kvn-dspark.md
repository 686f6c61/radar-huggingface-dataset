# Infomaniak-AI/Qwen3-8B-speculator.kvn-dspark

## Resumen

`Infomaniak-AI/Qwen3-8B-speculator.kvn-dspark` es un modelo borrador ("speculator") para decodificacion especulativa sobre el verificador `Qwen/Qwen3-8B`. No es un modelo de lenguaje autonomo: es un predictor multi-token que propone bloques de hasta 8 tokens que el modelo base verifica despues. Lo desarrolla Infomaniak AI dentro de un estudio de ablacion cientifica controlada de cuatro variantes que compara su propuesta Zero-KV-Cache Koopman-von Neumann con Random Fourier Features (KvN-RFF) frente a la atencion de ventana deslizante convencional (DSpark).

La innovacion principal es la eliminacion practica de la cache KV en el borrador: cada secuencia mantiene un estado recurrente de 2.560 bytes (2,56 KB), un 99,976 % menos que los 10,49 MB del baseline DSpark SWA. El backbone son 5 capas causales simplecticas de Koopman-von Neumann con M=128 modos de oscilador armonico y L=2 etapas de re-uploading de datos de Barthe, mas un rollout de fase Koopman multi-horizonte en una sola pasada.

El modelo tiene 975.339.009 parametros totales en safetensors (841,46M activos en el borrador, un 21,5 % menos que el baseline) y se distribuye bajo licencia Apache 2.0. Su relevancia es de investigacion: demuestra que se puede mantener calidad de aceptacion con un estado recurrente minimo, lo que reduce el coste de memoria del borrador en despliegues de decodificacion especulativa a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `KvNDSparkDraftModel` (variante `M3_KvN_DSpark_ZeroKV_Base`, backbone `kvn`): 5 capas Zero-KV Causal Symplectic Koopman-von Neumann RFF (M=128 modos, L=2 etapas Barthe) + rollout de fase Koopman multi-horizonte en 1 pasada |
| Parametros totales | 975.339.009 |
| Parametros activos | 841,46M (borrador); el resto corresponde a cabezas auxiliares |
| Longitud de contexto | Entrenado y evaluado con contexto de 4.096 tokens; no se especifica contexto maximo |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible (heredados funcionalmente del verificador Qwen3-8B) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `speculators`, `custom_code`) |
| Modelo base / verificador | `Qwen/Qwen3-8B` (`Qwen3ForCausalLM`) |
| Tamano de bloque especulativo (K) | 8 tokens por pasada |
| Capas auxiliares del verificador | 2, 18, 33 (+ capa de normalizacion final 36) |
| Cabeza Markov | bilineal de bajo rango con compuerta (`markov_rank: 256`, `draft_vocab_size: 32.000`) |
| Cabeza de confianza | activada, con features Markov y observables Born amplificados (teorema 4.2 de Barthe): 2M(q_m^2 + p_m^2) - 1 |
| Cache recurrente / KV por secuencia | 2.560 B (2,56 KB), -99,976 % frente a DSpark SWA |
| Hardware de entrenamiento | 2x NVIDIA H200 (143.771 MiB HBM3e por GPU) |
| Tamano del repo | 2,0 GB |

## Arquitectura y entrenamiento

El borrador sustituye la atencion de ventana deslizante por un backbone de Koopman-von Neumann: cinco capas causales simplecticas que aproximan la dinamica del estado oculto mediante modos de oscilador armonico (M=128) parametrizados con Random Fourier Features. Sobre esa representacion se aplica un rollout de fase Koopman multi-horizonte que genera los 8 tokens del bloque en una sola pasada, en lugar de iterar autoregresivamente. Dos cabezas complementan el diseno: una cabeza Markov bilineal de bajo rango (rango 256, vocabulario de borrador de 32.000 tokens) que modela dependencias intra-bloque, y una cabeza de confianza que estima la probabilidad de aceptacion por posicion usando observables de regla de Born amplificados segun el teorema 4.2 de Barthe.

El entrenamiento se realizo bajo condiciones ceteris paribus frente al resto de la familia de ablacion: mismo split de UltraChat-4K (900 conversaciones de entrenamiento, 100 de validacion), mismos estados ocultos auxiliares de Qwen3-8B extraidos de las capas 2, 18 y 33, misma profundidad de 5 capas, `block_size=8`, cabeza Markov-256 con compuerta, optimizador Muon con `lr=3e-4`, 5 epocas y 3.730 pasos sobre 2x H200. No se documentan fases de RLHF ni DPO, lo que es coherente con la naturaleza del modelo: no genera respuestas, solo predice tokens del verificador.

## Capacidades

- Prediccion multi-token especulativa: propone bloques de hasta 8 tokens por pasada para que `Qwen/Qwen3-8B` los verifique.
- Decodificacion especulativa con estado recurrente minimo: 2,56 KB por secuencia en lugar de cache KV completa.
- Estimacion de confianza por posicion mediante cabeza dedicada (error absoluto medio de 0,1856 en validacion).
- Modelado de dependencias intra-bloque mediante cabeza Markov bilineal de rango 256.
- Aceptacion condicionada al verificador: no genera texto de forma autonoma ni mantiene conversaciones.
- No soporta tool calling, agentes, vision, audio ni modo thinking por si mismo; esas capacidades dependen integramente de Qwen3-8B.
- Capacidades multilingues: no documentadas de forma independiente; las hereda del verificador a traves de los estados ocultos.

## Casos de uso

- Aceleracion de inferencia de Qwen3-8B en produccion: integrar el borrador en un servidor con decodificacion especulativa para reducir la latencia por token generado, con una longitud esperada de aceptacion de 2,46 tokens en modo greedy.
- Despliegue de alto batch en GPUs con memoria limitada: el estado de 2,56 KB por secuencia permite servir cientos de peticiones concurrentes sin que la cache del borrador consuma HBM, a diferencia de los 10,49 MB por secuencia del baseline DSpark SWA.
- Servicios de chat multi-turno con contexto de 4K: el modelo fue entrenado y evaluado en ese regimen (UltraChat-4K), por lo que encaja en asistentes conversacionales con ventanas de ese orden.
- Investigacion en decodificacion especulativa: sirve como punto de comparacion reproducible frente a variantes SWA, hibridas y podadas de la misma familia de ablacion.
- Evaluacion de tecnicas de representacion de estado: util para estudiar el compromiso entre tamano de estado recurrente y tasa de aceptacion (2,56 KB y 31,08 % de aceptacion media frente a 10,49 MB y valores del baseline).
- Generacion de codigo asistida de baja latencia: al reducir el coste por token verificado, mejora la experiencia en autocompletado o generacion iterativa sobre Qwen3-8B, aunque la calidad del codigo depende del verificador.
- Experimentacion con cabezas de confianza: la salida de confianza por posicion permite implementar politicas de corte adaptativo del bloque especulativo en pipelines propios.

## Benchmarks y rendimiento

Metricas de validacion sobre el split retenido de Qwen3-8B (100 conversaciones, contexto 4.096, K=8):

| Metrica | Valor |
|---|---|
| Perdida de validacion compuesta (`loss_epoch`) | 0,6556 |
| Entropia cruzada (`ce_loss_epoch`) | 1,7531 |
| Perdida de variacion total (`tv_loss_epoch`) | 0,2880 |
| Longitud esperada de aceptacion (tau) | 2,3607 |
| Longitud esperada de aceptacion greedy (EAL) | 2,4591 |
| Tasa media de aceptacion de tokens | 31,08 % |
| Precision de bloque completo | 34,70 % |
| Perdida de la cabeza de confianza | 0,2211 |
| Error absoluto de confianza | 0,1856 |
| Sesgo de supervivencia del producto acumulado | +0,0309 |

Aceptacion por posicion dentro del bloque:

| Split | tau | EAL | Pos 0 | Pos 1 | Pos 2 | Pos 3 | Pos 4 | Pos 5 | Pos 6 | Pos 7 |
|---|---|---|---|---|---|---|---|---|---|---|
| UltraChat validacion (100 convs, 4K) | 2,3607 | 2,4591 | 80,4 % | 44,7 % | 32,6 % | 27,9 % | 25,1 % | 23,4 % | 21,9 % | 21,4 % |

Latencia y speedup en H200 (B=128, K=8, bfloat16, 50 iteraciones tras 15 de calentamiento):

| Modelo | Estado por secuencia | Parametros activos | Perdida val. | tau | EAL greedy | Pos-0 | Latencia borrador B=128 | Speedup |
|---|---|---|---|---|---|---|---|---|
| kvn-dspark (M3) | 2,56 KB (-99,976 %) | 841,46M | 0,6556 | 2,3607 (+24,1 %) | 2,4591 (+24,3 %) | 80,44 % | 3,661 ms | 3,34x |
| kvn-dspark-lasso128 (M4-Pruned) | 2,56 KB (-99,976 %) | 841,46M | 0,6838 | 2,2760 (+19,7 %) | 2,3760 (+20,1 %) | 78,70 % | 3,666 ms | 3,33x |
| kvn-dspark-m512 (M4) | 10,24 KB (-99,902 %) | 844,61M | 0,6784 | 2,2678 (+19,2 %) | 2,3696 (+19,8 %) | 79,01 % | 3,655 ms | 3,34x |
| kvn-dspark-hybrid (M2) | 2,10 MB (-80,0 %) | 914,83M | 0,6930 | 2,2440 (+18,0 %) | 2,3500 (+18,8 %) | 77,30 % | 5,317 ms | 2,30x |
| dspark-swa (M1, baseline) | 10,49 MB | 1.072,20M | 0,7900 | 1,9020 | 1,9780 | 51,80 % | 12,223 ms | 1,00x |

## Requisitos de hardware

- VRAM para inferencia: el repo ocupa 2,0 GB en safetensors (bfloat16); el borrador requiere ademas cargar el verificador Qwen3-8B (aproximadamente 16 GB en bf16) y su cache KV.
- GPU de referencia en las mediciones: NVIDIA H200 (143 GB HBM3e), single-GPU para las pruebas de latencia y 2x H200 para entrenamiento.
- GPU recomendadas: H200 o H100 para despliegue en produccion con batch alto; A100 80 GB como alternativa viable por memoria.
- Cabe en GPU de consumo: el borrador por si solo si (2 GB), pero el verificador Qwen3-8B en bf16 ocupa unos 16 GB, por lo que se necesita al menos una RTX 4090 (24 GB) o equivalente; no hay datos publicados de latencia en esas GPUs.
- Opciones de despliegue: la libreria `speculators` con `custom_code`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 3,661 ms por bloque de 8 tokens con B=128 en H200, frente a 12,223 ms del baseline DSpark SWA (speedup 3,34x).
- Throughput: la model card incluye una tabla de escalado de batch de B=1 a B=128, pero los valores de tokens/s quedaron truncados en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Estado por secuencia | tau / EAL | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Infomaniak-AI/Qwen3-8B-speculator.kvn-dspark | Speculator KvN-RFF para Qwen3-8B | 975,3M totales / 841,46M activos | 2,56 KB | 2,3607 / 2,4591 | Apache 2.0 | Hugging Face |
| Infomaniak-AI/Qwen3-8B-speculator.dspark-swa | Speculator SWA para Qwen3-8B | 1.072,20M activos | 10,49 MB | 1,9020 / 1,9780 | Apache 2.0 | Hugging Face |
| mgoin/Qwen3-8B-speculator.dspark | Speculator DSpark para Qwen3-8B | no disponible | no disponible | no disponible | no disponible | Hugging Face (checkpoint de investigacion) |
| RedHatAI/Qwen3.8-27B-speculator.dspark | Speculator DSpark para Qwen3.8-27B | no disponible | no disponible | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no responde prompts de forma autonoma; requiere siempre el verificador Qwen3-8B y un motor de decodificacion especulativa compatible con la libreria `speculators`.
- La tasa media de aceptacion es del 31,08 % y decae rapidamente por posicion (80,4 % en la posicion 0 frente a 21,4 % en la posicion 7), por lo que el beneficio real depende del regimen de generacion.
- Entrenado y evaluado solo con contexto de 4.096 tokens sobre UltraChat-4K; el comportamiento mas alla de esa ventana no esta documentado.
- Riesgo de alucinacion: el borrador puede proponer tokens incorrectos, pero el verificador los descarta; el riesgo residual es el mismo de Qwen3-8B.
- Sesgos: no se documenta ninguna evaluacion de sesgo; los sesgos heredados provienen de los estados ocultos de Qwen3-8B y del corpus UltraChat.
- Licencia Apache 2.0 permite uso comercial, pero el verificador Qwen3-8B tiene sus propias condiciones que deben revisarse por separado.
- Uso previsto de investigacion: el modelo forma parte de un estudio de ablacion y no se documentan despliegues en produccion ni soporte de la libreria fuera de la version usada en el entrenamiento.
- No se publican datos de cuantizacion, por lo que opciones como GGUF o FP8 requeririan conversion propia sin garantias de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Infomaniak-AI/Qwen3-8B-speculator.kvn-dspark
- Variante podada LASSO: https://huggingface.co/Infomaniak-AI/Qwen3-8B-speculator.kvn-dspark-lasso128
- Variante ancha M=512: https://huggingface.co/Infomaniak-AI/Qwen3-8B-speculator.kvn-dspark-m512
- Variante hibrida: https://huggingface.co/Infomaniak-AI/Qwen3-8B-speculator.kvn-dspark-hybrid
- Baseline DSpark SWA: https://huggingface.co/Infomaniak-AI/Qwen3-8B-speculator.dspark-swa
- Modelo verificador: https://huggingface.co/Qwen/Qwen3-8B
- Speculator DSpark de referencia (mgoin): https://huggingface.co/mgoin/Qwen3-8B-speculator.dspark
- Speculator DSpark para Qwen3.8-27B (RedHatAI): https://huggingface.co/RedHatAI/Qwen3.8-27B-speculator.dspark

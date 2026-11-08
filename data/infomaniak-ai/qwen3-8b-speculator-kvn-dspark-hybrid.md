# Infomaniak-AI/Qwen3-8B-speculator.kvn-dspark-hybrid

## Resumen

`Infomaniak-AI/Qwen3-8B-speculator.kvn-dspark-hybrid` es un modelo borrador (*draft model*) para decodificación especulativa sobre el modelo objetivo `Qwen/Qwen3-8B`. No es un modelo generativo autonomo: se acopla al verificador Qwen3-8B para proponer bloques de hasta 8 tokens que el modelo grande valida en paralelo, acelerando la inferencia sin alterar la distribucion de salida. Lo desarrolla Infomaniak AI dentro de un estudio de ablacion controlado de cuatro variantes que compara sustratos de atencion de ventana deslizante (DSpark) frente a alternativas basadas en Koopman-von Neumann con Random Fourier Features (KvN-RFF).

Esta variante concreta, identificada como `M2_DSpark_Hybrid_1SWA_2KvN`, combina una capa de atencion SWA-128 (heredada de Qwen3) con cuatro capas de KvN-RFF de cache KV cero. El resultado es un borrador de 5 capas y 914,83 M de parametros activos (1.048 M totales en safetensors) que reduce el estado recurrente por secuencia a 2,10 MB, un 80 % menos que el baseline DSpark SWA, a costa de una tasa de aceptacion algo menor.

Es relevante porque documenta de forma reproducible el compromiso entre coste de memoria de estado y velocidad de decodificacion especulativa, con metricas de latencia y aceptacion medidas en H200 y un conjunto de ablaciones ceteris paribus que permiten aislar el efecto de cada decision arquitectonica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `KvNDSparkDraftModel` (variante `M2_DSpark_Hybrid_1SWA_2KvN`): backbone hibrido de 5 capas, capa 0 Qwen3 SWA-128 + capas 1-4 Koopman-von Neumann RFF con cache KV cero (M=256) |
| Parametros totales | 1.048.181.633 |
| Parametros activos | 914,83 M (borrador activo) |
| Longitud de contexto | 4.096 tokens en validacion (contexto del verificador Qwen3-8B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (heredados del verificador Qwen3-8B, no declarados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria `speculators`, con `custom_code`) |

## Arquitectura y entrenamiento

El borrador es un transformer hibrido de 5 capas. La capa 0 replica la atencion de ventana deslizante de 128 tokens de Qwen3; las capas 1 a 4 sustituyen la atencion por un mecanismo Koopman-von Neumann con Random Fourier Features (M=256) que elimina por completo el cache KV, manteniendo solo un estado recurrente simplectico por secuencia. La cabeza de prediccion combina un head Markov bilineal de bajo rango (`markov_rank=256`, vocabulario de borrador de 32.000 tokens) con una cabeza de confianza que incorpora observables de Born amplificados segun el teorema 4.2 de Barthe. El bloque maximo de borrador es K=8 tokens por pasada, y el modelo consume estados ocultos auxiliares del verificador en las capas 2, 18 y 33 (mas la capa de normalizacion final 36).

El entrenamiento se realizo bajo condiciones ceteris paribus en 2× NVIDIA H200: split identico de 900 conversaciones de entrenamiento y 100 de validacion sobre UltraChat-4K, mismas representaciones ocultas auxiliares de Qwen3-8B, profundidad de 5 capas, `block_size=8`, optimizador Muon con `lr=3e-4`, 5 epocas y 3.730 pasos. No se documenta en la informacion disponible el uso de RLHF o DPO; el objetivo es la perdida compuesta de validacion (`loss_epoch=0.6930`), compuesta por cross-entropy (1.8840) y total variation (0.3020).

## Capacidades

- Prediccion especulativa multi-token: propone hasta 8 tokens por pasada que el verificador Qwen3-8B acepta o rechaza en bloque.
- Head de confianza calibrada: estima la probabilidad de aceptacion por posicion, con error absoluto medio de 0,2090 en validacion.
- Head Markov de bajo rango: modela dependencias locales entre tokens del bloque borrador con rango 256 y vocabulario reducido de 32.000.
- Cache KV cero en 4 de sus 5 capas: el estado recurrente por secuencia es de solo 2,10 MB, lo que permite mantener muchas secuencias concurrentes en memoria.
- Integracion con el verificador Qwen3-8B: consume estados ocultos de las capas 2, 18 y 33, por lo que requiere el modelo objetivo sin modificar.
- No soporta tool calling, agentes, vision, audio ni modo thinking por si mismo: esas capacidades pertenecen al verificador Qwen3-8B, no al borrador.

## Casos de uso

- Aceleracion de inferencia en produccion sobre Qwen3-8B: desplegar el par borrador+verificador en un servidor con vLLM o TGI para reducir la latencia por token en generacion autoregresiva, con un factor de speedup de 2,30× medido en H200 a B=128 frente al baseline DSpark SWA.
- Servicio multi-tenant con alta concurrencia: el estado recurrente de 2,10 MB por secuencia permite sostener muchas conversaciones simultaneas en una sola GPU sin agotar la memoria por cache KV, algo critico en endpoints de chat con cientos de sesiones activas.
- Despliegue en GPUs con memoria limitada: al reducir drasticamente el estado por secuencia, el par borrador+verificador cabe en aceleradores de gama media donde un borrador con cache KV completo no cabria junto al modelo de 8B.
- Investigacion en decodificacion especulativa: usar esta variante como referencia reproducible del compromiso memoria-aceptacion dentro de la ablacion de Infomaniak, comparando contra `kvn-dspark` (flagship), `kvn-dspark-lasso128`, `kvn-dspark-m512` y `dspark-swa`.
- Evaluacion de arquitecturas hibridas SWA+KvN: servir como punto de partida para estudiar como afecta mezclar una capa de atencion clasica con capas sin cache KV a la tasa de aceptacion (77,3 % en posicion 0 frente a 80,44 % del flagship).
- Generacion de codigo y texto largo asistida: al integrarse con Qwen3-8B, acelera tareas de completado de codigo y redaccion donde la latencia por token es el cuello de botella, manteniendo la calidad del verificador intacta.

## Benchmarks y rendimiento

Metricas de validacion publicadas por el autor (split de 100 conversaciones UltraChat-4K, contexto 4.096, K=8):

| Metrica | Valor |
|---|---|
| Perdida compuesta de validacion | 0,6930 |
| Cross-entropy | 1,8840 |
| Total variation | 0,3020 |
| Longitud esperada de aceptacion (τ) | 2,2440 |
| EAL greedy | 2,3500 |
| Tasa media de aceptacion | 28,70 % |
| Precision de bloque completo | 32,60 % |
| Perdida de la cabeza de confianza | 0,2330 |
| Error absoluto de confianza | 0,2090 |

Aceptacion por posicion (posiciones 0 a 7): 77,3 % / 41,0 % / 30,4 % / 25,8 % / 23,5 % / 22,0 % / 20,6 % / 20,0 %.

Comparativa dentro de la ablacion (H200, B=128, K=8):

| Variante | Estado por secuencia | Parametros activos | Val loss | τ | EAL greedy | Latencia borrador | Speedup |
|---|---|---|---|---|---|---|---|
| kvn-dspark (M3) | 2,56 KB | 841,46 M | 0,6556 | 2,3607 | 2,4591 | 3,661 ms | 3,34× |
| kvn-dspark-lasso128 (M4) | 2,56 KB | 841,46 M | 0,6838 | 2,2760 | 2,3760 | 3,666 ms | 3,33× |
| kvn-dspark-m512 (M4) | 10,24 KB | 844,61 M | 0,6784 | 2,2678 | 2,3696 | 3,655 ms | 3,34× |
| kvn-dspark-hybrid (M2) | 2,10 MB | 914,83 M | 0,6930 | 2,2440 | 2,3500 | 5,317 ms | 2,30× |
| dspark-swa (M1) | 10,49 MB | 1.072,20 M | 0,7900 | 1,9020 | 1,9780 | 12,223 ms | 1,00× |

La tabla de escalado por tamano de lote (B=1 a 128) esta truncada en la informacion disponible; solo se dispone del valor para B=128.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el borrador pesa 2,1 GB en safetensors (1.048 M parametros) y debe convivir con Qwen3-8B (aproximadamente 16 GB en bf16) en la misma GPU.
- GPU recomendadas: el autor entreno y evaluo en 2× NVIDIA H200 (143 GB HBM3e); las metricas de latencia se midieron en una sola H200.
- Cabe en GPU de consumo: no confirmado en la informacion disponible; por tamano del par (borrador + verificador 8B) es plausible en RTX 4090 (24 GB) en bf16, pero no hay medicion publicada.
- Opciones de despliegue: requiere la libreria `speculators` con `custom_code`; la integracion con vLLM, TGI, llama.cpp u Ollama no esta documentada en la model card.
- Latencia y throughput: 5,317 ms por bloque de 8 tokens a B=128 en H200; speedup de 2,30× frente al baseline DSpark SWA. Los valores para B<128 estan truncados en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Infomaniak-AI/Qwen3-8B-speculator.kvn-dspark-hybrid (este) | Borrador hibrido SWA+KvN | 914,83 M activos | 4.096 | Apache 2.0 | Hugging Face |
| Infomaniak-AI/Qwen3-8B-speculator.kvn-dspark | Borrador KvN-RFF puro | 841,46 M activos | 4.096 | Apache 2.0 | Hugging Face |
| Infomaniak-AI/Qwen3-8B-speculator.dspark-swa | Borrador SWA-128 (baseline) | 1.072,20 M activos | 4.096 | Apache 2.0 | Hugging Face |
| mgoin/Qwen3-8B-speculator.dspark | Borrador DSpark (DFlash + Markov + confianza) | no disponible | 2.048 (entrenamiento) | no disponible | Hugging Face |
| Dogacel/Qwen3-8B-DSpark | Borrador DSpark (TorchSpec) | no disponible | no disponible | no disponible | Hugging Face |

Frente al flagship KvN puro, esta variante sacrifica 0,12 puntos de longitud de aceptacion (2,2440 vs 2,3607) y 1,04× de speedup (2,30× vs 3,34×) a cambio de mantener una capa de atencion clasica que eleva el coste de estado a 2,10 MB. Frente al baseline DSpark SWA, gana 18 % en τ y 2,30× de speedup con un 20 % menos de estado por secuencia.

## Limitaciones y advertencias

- Es un modelo borrador, no un generador autonomo: solo funciona acoplado a `Qwen/Qwen3-8B` como verificador y no produce texto por si mismo.
- Requiere `custom_code` y la libreria `speculators`; la portabilidad a otros runtimes (vLLM, llama.cpp, TGI) no esta documentada y puede requerir trabajo de integracion.
- La tasa de aceptacion decae rapidamente con la posicion (77,3 % en posicion 0 frente a 20,0 % en posicion 7), por lo que el beneficio real depende del regimen de generacion y del contenido.
- La cabeza de confianza presenta un sesgo de supervivencia en producto acumulado de +0,0410, lo que puede sobreestimar la aceptacion en bloques largos.
- Idiomas soportados no declarados: la cobertura linguistica depende enteramente del verificador Qwen3-8B.
- No hay datos publicados sobre sesgos, alucinacion o robustez especificos del borrador; al no alterar la distribucion del verificador, estos riesgos recaen sobre Qwen3-8B.
- Licencia Apache 2.0 permite uso comercial, pero el modelo depende de Qwen3-8B, cuya licencia debe verificarse por separado.
- Checkpoint de investigacion: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/Infomaniak-AI/Qwen3-8B-speculator.kvn-dspark-hybrid
- Modelo base (verificador): https://huggingface.co/Qwen/Qwen3-8B
- Variante flagship: https://huggingface.co/Infomaniak-AI/Qwen3-8B-speculator.kvn-dspark
- Variante lasso128: https://huggingface.co/Infomaniak-AI/Qwen3-8B-speculator.kvn-dspark-lasso128
- Variante m512: https://huggingface.co/Infomaniak-AI/Qwen3-8B-speculator.kvn-dspark-m512
- Baseline DSpark SWA: https://huggingface.co/Infomaniak-AI/Qwen3-8B-speculator.dspark-swa
- Borrador DSpark de referencia (mgoin): https://huggingface.co/mgoin/Qwen3-8B-speculator.dspark
- Borrador DSpark de referencia (Dogacel): https://huggingface.co/Dogacel/Qwen3-8B-DSpark

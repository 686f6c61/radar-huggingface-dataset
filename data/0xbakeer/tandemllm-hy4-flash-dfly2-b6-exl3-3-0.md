# 0xBakeer/TandemLLM-Hy4-flash-DFly2-B6-EXL3-3.0

## Resumen

TandemLLM-Hy4-flash-DFly2-B6-EXL3-3.0 es un drafter de decodificacion especulativa (speculative decoding) cuantizado en formato EXL3, publicado por el usuario 0xBakeer. Se trata de una version comprimida del drafter `AngelSlim/Hy4-flash-DFly2-B6`, que a su vez es un modelo auxiliar de block-size 6 disenado para acelerar la inferencia del modelo objetivo `tencent/Hy4-flash`. El pack incluye tambien cabezas de salida (lm_head) independientes cuantizadas a 3 y 4 bits, extraidas del modelo original de Tencent.

El modelo resuelve un problema muy concreto: reducir el coste de memoria del drafter de decodificacion especulativa manteniendo una tasa de aceptacion razonable. Con 646 millones de parametros totales y un peso de 1,30 GB en safetensors, el pack es 4,82 veces mas pequeno que el checkpoint BF16 equivalente (6,24 GB). Esto permite desplegar el par objetivo-drafter en hardware con VRAM limitada, como una unica NVIDIA DGX Spark (GB10).

La relevancia actual del modelo es acotada pero tecnica: no es un modelo generativo autonomo, sino una pieza de infraestructura de inferencia que requiere un motor especifico (TandemEngine 0.17.2 o superior) y el modelo objetivo Hy4-flash cuantizado en EXL3. El drafter no genera texto final por si mismo; el modelo objetivo verifica cada token propuesto, de modo que la cuantizacion afecta a la longitud de aceptacion y al throughput, no a la distribucion de salida verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 3 capas draft (HY4DFlyDraftModel), KV sharing y sparse-index sharing con capas DSA del objetivo |
| Parametros totales | 646.119.456 |
| Parametros activos | 3 expertos enrutados activos por token (de 128) mas 1 experto compartido, por capa |
| Longitud de contexto | No disponible (heredada del objetivo; TandemEngine configurado con `--max-len 262144`) |
| Tipos de cuantizacion | EXL3 3,0 bits (expertos enrutados, codebook `mul1`, 48 words por tile 16x16) y 5 bits (atencion, experto compartido, `mtp_fusion`, correcciones); cabezas lm_head en 3 y 4 bits |
| Idiomas soportados | No disponible |
| Licencia | tencent-hy-license (`license: other`) |
| Formato de pesos | safetensors (EXL3) |

## Arquitectura y entrenamiento

El drafter es un modelo MoE de 3 capas con 128 expertos enrutados por capa (3 activos por token mas 1 compartido). Se acopla a las capas DSA 33, 37 y 41 del modelo objetivo `tencent/Hy4-flash` mediante sharing de KV y de indices dispersos, y no mantiene cache KV propia. Genera 5 tokens por paso (block size 6: 1 token ancla mas 5 borradores), lo que lo convierte en un drafter de bloque mas agresivo que los drafters de un solo token.

La cuantizacion se realizo con calibracion Hessiana sobre 1.190 tensores. Las 1.152 proyecciones de expertos enrutados se comprimieron a 3,0 bits y las 38 proyecciones restantes (atencion, experto compartido, `mtp_fusion` y correcciones hidden/attentive) a 5 bits. Normas, puertas de enrutamiento y tensores auxiliares pequenos quedan sin cuantizar. La verificacion se hizo contra el checkpoint BF16 `AngelSlim/Hy4-flash-DFly2-B6` sobre 8 sondas y 40 posiciones de borrador.

## Capacidades

- Generacion de tokens borrador para decodificacion especulativa: propone 5 tokens por paso que el modelo objetivo verifica.
- Aceleracion de inferencia del modelo `tencent/Hy4-flash` mediante aceptacion de tokens.
- Integracion con cabezas de salida cuantizadas a 3 y 4 bits extraidas del `lm_head` original.
- No soporta tool calling, function calling ni razonamiento multi-paso de forma autonoma: es un componente de infraestructura, no un modelo de proposito general.
- No se documentan capacidades multilingues, de vision ni de audio.
- No dispone de modo thinking propio; el modo thinking depende del modelo objetivo.

## Casos de uso

- Aceleracion de inferencia en produccion: se usa como drafter junto a `TandemLLM-Hy4-flash-EXL3-3.0` o `3.5` en TandemEngine para aumentar el throughput de decodificacion de Hy4-flash, con tasas medidas de 43 a 77 tok/s segun concurrencia.
- Despliegue en hardware de VRAM limitada: al ocupar 1,30 GB frente a 6,24 GB del BF16, permite ejecutar el par objetivo-drafter en una unica DGX Spark (GB10, 128 GB) o en GPUs consumer con suficiente memoria para el objetivo cuantizado.
- Servicio de completaciones de baja latencia: con `cache_prompt: false` y prompts largos (3.538 tokens), el sistema alcanza 3,76 s de TTFT y 940,5 tok/s de prefill, adecuado para APIs de generacion de texto.
- Escenarios de alta concurrencia: con 8 peticiones concurrentes de 256 tokens se logra un throughput agregado de 76,72 tok/s (85,1 tok/s en regimen estable), util para servir multiples usuarios simultaneos.
- Investigacion sobre cuantizacion de drafters: el pack incluye `quant_report.json` y `verify_report.json` con errores proxy por tensor, lo que facilita estudiar el impacto de la cuantizacion en la aceptacion especulativa.
- Prototipado de pipelines de decoding especulativo: sirve como referencia para comparar configuraciones de bits (3,0 vs 3,5) y cabezas de salida (K3 vs K4) en terminos de tasa de aceptacion y memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el modelo es un drafter y no un modelo generativo evaluable de forma estandar. Los datos disponibles son de verificacion de cuantizacion y de velocidad:

| Metrica | EXL3 3.0 (este pack) | EXL3 3.5 (referencia) |
|---|---|---|
| Bits expertos enrutados | 3,0 | 3,5 |
| Bits dense/attn/HC | 5 | 5 |
| Tamano `model.safetensors` | 1,30 GB | 1,46 GB |
| Error proxy medio expertos | 0,001806 | 0,000897 |
| Error proxy maximo expertos | 0,013907 | 0,007064 |
| Cosine hidden media (min) | 0,9932 (0,9846) | 0,9942 (0,9860) |
| Top-1 match cabeza completa | 70,0 % (28/40) | 97,5 % (39/40) |
| Top-1 match cabeza K3 | No registrado | 82,5 % (33/40) |

Rendimiento en una DGX Spark (GB10) con TandemEngine v0.17.2, objetivo EXL3 3.5 y cabeza K3:

| Carga | Decode end-to-end | Decode estable | Notas |
|---|---|---|---|
| c1, 3.538 -> 600 greedy | 43,33 tok/s | — | 3,37 aceptados/ronda, 3,76 s TTFT (940,5 tok/s prefill) |
| c2, 256 tok/req | 47,75 tok/s | 51,6 tok/s | 2 peticiones concurrentes |
| c4, 256 tok/req | 60,86 tok/s | 65,9 tok/s | 4 peticiones concurrentes |
| c8, 256 tok/req | 76,72 tok/s | 85,1 tok/s | 8 peticiones concurrentes |

## Requisitos de hardware

- VRAM estimada: 1,30 GB para `model.safetensors` mas 139,4 MB (cabeza K3) o 185,8 MB (cabeza K4); en total 1,62 GB con la cabeza K3 por defecto.
- GPU recomendadas: NVIDIA DGX Spark (GB10, 128 GB) es el hardware de referencia medido; se requiere ademas memoria suficiente para el modelo objetivo Hy4-flash cuantizado en EXL3.
- Cabe en GPU consumer: si, siempre que quede VRAM libre para el modelo objetivo; el drafter por si solo ocupa poco mas de 1,5 GB.
- Opciones de despliegue: exclusivamente TandemEngine 0.17.2 o superior. `exllamav3` estandar no carga `HY4DFlyDraftModel`.
- Latencia y throughput: 43,33 tok/s en decodificacion end-to-end con un solo flujo y 3,76 s de TTFT; hasta 85,1 tok/s agregados en regimen estable con 8 peticiones concurrentes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TandemLLM-Hy4-flash-DFly2-B6-EXL3-3.0 (este) | 646 M | No disponible | EXL3 3,0/5 bits | tencent-hy-license | Hugging Face, requiere TandemEngine |
| TandemLLM-Hy4-flash-DFly2-B6-EXL3-3.5 | No disponible | No disponible | EXL3 3,5/5 bits | tencent-hy-license | Hugging Face, requiere TandemEngine |
| AngelSlim/Hy4-flash-DFly2-B6 | No disponible | No disponible | BF16 | No disponible | Hugging Face |
| tencent/Hy4-flash (objetivo) | No disponible | No disponible | No disponible | tencent-hy-license | Hugging Face |

El pack 3.5 es la alternativa directa dentro del mismo ecosistema: ocupa 0,17 GB mas pero reduce a la mitad el error proxy de los expertos y eleva el top-1 match del 70,0 % al 97,5 %. El autor recomienda el 3.5 para uso general y el 3.0 solo cuando se minimiza huella de memoria.

## Limitaciones y advertencias

- No es un modelo generativo autonomo: no produce texto final sin el modelo objetivo `tencent/Hy4-flash` y sin TandemEngine.
- La cuantizacion a 3,0 bits degrada notablemente la fidelidad del drafter: top-1 match del 70,0 % frente al 97,5 % del pack 3.5, lo que reduce la longitud de aceptacion y el throughput.
- No carga en `exllamav3` estandar; requiere TandemEngine 0.17.2 o superior, lo que limita la portabilidad.
- No se documentan idiomas soportados ni sesgos conocidos.
- La licencia `tencent-hy-license` es de tipo "other" y puede imponer restricciones al uso comercial; debe revisarse el fichero LICENSE antes de desplegar en produccion.
- Riesgo de alucinacion no aplicable de forma directa, ya que el objetivo verifica cada token; el impacto se limita a la eficiencia.
- El rendimiento medido corresponde a un unico hardware (DGX Spark GB10) y a una configuracion concreta; no se garantizan las mismas cifras en otras GPUs.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/0xBakeer/TandemLLM-Hy4-flash-DFly2-B6-EXL3-3.0
- Modelo base drafter: https://huggingface.co/AngelSlim/Hy4-flash-DFly2-B6
- Modelo objetivo: https://huggingface.co/tencent/Hy4-flash
- Pack EXL3 3.5: https://huggingface.co/0xBakeer/TandemLLM-Hy4-flash-DFly2-B6-EXL3-3.5
- Objetivo EXL3 3.5: https://huggingface.co/0xBakeer/TandemLLM-Hy4-flash-EXL3-3.5
- Objetivo EXL3 3.0: https://huggingface.co/0xBakeer/TandemLLM-Hy4-flash-EXL3-3.0
- Coleccion Hy4-flash EXL3 for TandemLLM: https://huggingface.co/collections/0xBakeer/hy4-flash-exl3-for-tandemllm-6b033035038e355b04930cb5
- Repositorio TandemEngine: https://github.com/TandemLLM/TandemEngine

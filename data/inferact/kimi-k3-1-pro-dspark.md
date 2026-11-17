# Inferact/Kimi-K3.1-Pro-DSpark

## Resumen

Kimi-K3.1-Pro-DSpark es un modelo borrador (draft model) disenado especificamente para decodificacion especulativa sobre el modelo objetivo Kimi K3.1 Pro de Moonshot AI. No es un modelo de lenguaje autonomo: no genera texto por si mismo ni se puede usar de forma independiente, sino que propone bloques de tokens candidatos que el modelo grande verifica en paralelo, acelerando la generacion sin alterar la distribucion de salida. Lo desarrolla Inferact en colaboracion con el equipo Speculators de Red Hat AI, apoyandose en la libreria Speculators del proyecto vLLM.

Tecnicamente es una red densa de 5 capas decoder con 2.479.976.577 parametros en BF16 (unos 5 GB de pesos), atencion grouped-query con ventana deslizante de 2.048 tokens en cada capa, 96 cabezas de consulta, 16 cabezas KV y dimension de cabeza 64. Consume los hidden states de 5 capas del modelo objetivo y propone 7 tokens por paso forward, con una cabeza Markov de rango 512 y una cabeza de confianza. Su contexto declarado alcanza 1.048.576 tokens, aunque cada capa solo atiende a los ultimos 2.048.

Su relevancia practica es concreta: la decodificacion especulativa es hoy una de las palancas mas rentables para reducir la latencia de inferencia en produccion. Este checkpoint sustituye a la version preview y publica metricas de aceptacion por posicion sobre un conjunto amplio de benchmarks, lo que permite estimar el speedup real antes de desplegarlo junto a Kimi K3.1 Pro en vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, 5 capas decoder, atencion grouped-query con sliding window de 2.048 tokens |
| Parametros totales | 2.479.976.577 (2,5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.048.576 tokens declarados; cada capa atiende a los ultimos 2.048 |
| Tipos de cuantizacion | BF16 (unico formato indicado en la model card) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (custom_code, requiere `--trust-remote-code`) |

Otros datos tecnicos: hidden size 7168, FFN 14336, 96 cabezas de consulta, 16 cabezas KV, head dim 64, bloque de borrador de 7 tokens por forward, cabeza Markov de rango 512, cabeza de confianza, embedding y LM head compartidos con el modelo objetivo. Tamano del repo: 5,0 GB.

## Arquitectura y entrenamiento

El modelo es un draft model de tipo DSpark para decodificacion especulativa. Cada capa es un decoder denso con atencion grouped-query y una ventana deslizante fija de 2.048 tokens. Esta decision de diseno hace que el coste de atencion y el KV cache del borrador permanezcan constantes a medida que crece el contexto, de modo que el drafting sigue siendo eficiente incluso con prompts de hasta 1M tokens del modelo objetivo. El borrador no recibe tokens de entrada directamente: consume los hidden states de 5 capas seleccionadas del modelo Kimi K3.1 Pro y comparte con este el embedding y el LM head, lo que reduce el numero de parametros necesarios.

La generacion de candidatos combina una cabeza Markov de rango 512 (que modela dependencias entre tokens del bloque propuesto) con una cabeza de confianza que estima la probabilidad de aceptacion. El bloque propuesto es de 7 tokens por paso forward. El checkpoint se ha construido con la libreria Speculators del proyecto vLLM, en un esfuerzo conjunto con el equipo Speculators de Red Hat AI. No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; al tratarse de un draft model, el objetivo de entrenamiento es la prediccion de tokens del modelo objetivo, no el alineamiento conversacional.

## Capacidades

- Propuesta de tokens candidatos para decodificacion especulativa sobre Kimi K3.1 Pro, con 7 tokens por forward pass.
- Verificacion probabilistica con `draft_sample_method: probabilistic` y `rejection_sample_method: block`, que preserva la distribucion de salida del modelo objetivo.
- Estimacion de confianza por token mediante cabeza dedicada, util para politicas de verificacion adaptativa.
- Modelado de dependencias intra-bloque mediante cabeza Markov de rango 512.
- Soporte de contexto largo hasta 1M tokens con coste de atencion constante gracias al sliding window.
- Integracion nativa con vLLM mediante `--speculative-config` con `method: dspark`.
- Metricas por peticion activables con `--per-request-spec-decode-metrics summary`.
- No soporta generacion autonoma, tool calling, vision, audio ni capacidades multilingues propias: hereda el comportamiento del modelo objetivo.

## Casos de uso

- Aceleracion de inferencia en produccion con Kimi K3.1 Pro: desplegar el borrador junto al modelo objetivo en vLLM reduce la latencia por token en cargas de codigo y matematicas, donde la aceptacion es mayor (5,566 en GSM8K y 4,660 en HumanEval).
- Servicio de chat de baja latencia: con acceptance length de 3,393 en MT-Bench y 3,864 en el conjunto agrupado, el modelo recorta el coste de decodificacion autoregresiva en asistentes conversacionales multi-turno.
- Pipelines de generacion de codigo en CI/CD: la aceptacion de 4,376 en MBPP y 4,159 en SPEED-Bench coding lo hace adecuado para tareas de autocompletado y generacion de tests donde el borrador acierta con frecuencia.
- Procesamiento de documentos largos y RAG: con ventana deslizante de 2.048 tokens y aceptacion de 4,289 en la categoria RAG de SpeedBench, mantiene el drafting eficiente con prompts de decenas o cientos de miles de tokens.
- Analisis de repositorios y contextos de 1M tokens: en BEAM 1M conserva una acceptance length de 3,421 con prompts de 826K a 1,04M tokens, lo que permite servir cargas de contexto masivo sin degradar el speedup.
- Razonamiento matematico y STEM: con 4,445 en MATH-500 y 3,429 en AIME 2026, es util en entornos de evaluacion y generacion de soluciones paso a paso donde el modelo objetivo razona y el borrador acelera la salida.
- Despliegue en cluster con tensor parallelism: la configuracion de referencia usa `--tensor-parallel-size 8`, pensada para servir el modelo objetivo en nodos multi-GPU con el borrador como complemento.

## Benchmarks y rendimiento

Los datos publicados miden aceptacion de borrador (acceptance length = 1 + tokens aceptados / borradores, contando el token bonus), no calidad del modelo. Configuracion: temperatura 1.0, top_p 0.95, conjunto de test completo.

| Benchmark | Prompts | Max tokens | Acceptance length |
|---|---:|---:|---:|
| GSM8K | 1.319 | 1.024 | 5,566 |
| HumanEval | 164 | 1.024 | 4,660 |
| MBPP | 974 | 1.024 | 4,376 |
| MATH-500 | 500 | 2.048 | 4,445 |
| SPEED-Bench low entropy | 302 | 1.536 | 3,619 |
| SPEED-Bench coding | 80 | 4.096 | 4,159 |
| MT-Bench | 80 | 1.024 | 3,393 |
| SWE-bench Pro | 642 | 2.048 | 3,302 |
| AIME 2026 | 30 | 4.096 | 3,429 |
| Pooled | — | — | 3,864 |

Aceptacion por categoria en SpeedBench (880 conversaciones, 1.138 llamadas al modelo, max 4.096 tokens):

| Categoria | Acceptance length | Draft acceptance |
|---|---:|---:|
| Coding | 4,0957 | 44,22% |
| RAG | 4,2890 | 46,99% |
| Summarization | 4,1758 | 45,37% |
| Multilingual | 4,0903 | 44,15% |
| Reasoning | 3,5954 | 37,08% |
| QA | 3,4800 | 35,43% |
| Math | 3,2025 | 31,46% |
| STEM | 3,1874 | 31,25% |
| Humanities | 3,0354 | 29,08% |
| Roleplay | 3,0310 | 29,01% |
| Writing | 2,8243 | 26,06% |
| Pooled | 3,2690 | 32,41% |

Contexto largo:

| Benchmark | Prompts | Prompt tokens | Acceptance length |
|---|---:|---:|---:|
| AA-LCR | 100 | 95K de media | 3,935 |
| BEAM 128K | 400 | 97K–125K | 3,516 |
| BEAM 1M | 700 | 826K–1,04M | 3,421 |

Aceptacion por posicion (pooled): 79% en posicion 1, 61% en 2, 46% en 3, 35% en 4, 27% en 5, 21% en 6 y 17% en 7. La model card incluye ademas una grafica de throughput e interactividad y una tabla de SpeedBench acceptance por categoria.

## Requisitos de hardware

- El borrador pesa unos 5 GB en BF16, por lo que cabe holgadamente en cualquier GPU consumer con 8 GB o mas (RTX 3060 Ti, 4060, 4070, 4080, 4090).
- El requisito real lo marca el modelo objetivo Kimi K3.1 Pro, no el borrador: la configuracion de referencia usa `--tensor-parallel-size 8` con `--gpu-memory-utilization 0.90`, es decir, 8 GPUs de datacenter (A100, H100 o equivalentes) para el despliegue conjunto.
- No es viable en una sola GPU consumer porque el modelo objetivo no cabe; el borrador por si solo no es utilizable.
- Despliegue via vLLM con `--speculative-config` y `method: dspark`; requiere `--trust-remote-code` y `--load-format fastsafetensors`. La model card no menciona soporte para llama.cpp, Ollama ni TGI.
- Parametros de servicio recomendados: `--max-model-len 65536`, `--max-num-seqs 128`, `--max-num-batched-tokens 8192`, `--no-enable-prefix-caching`, `--reasoning-parser kimi_k3`, variable de entorno `VLLM_KIMI_K3_AUX_ATTN_RES_STREAM=0` y `enable_adaptive_verification: false`.
- Latencia y throughput: la model card aporta una grafica de throughput e interactividad, pero no cifras numericas en texto; no disponible como valor concreto.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Inferact/Kimi-K3.1-Pro-DSpark | Draft model DSpark para Kimi K3.1 Pro | 2,5B | 1.048.576 (ventana efectiva 2.048) | no disponible | Acceptance length pooled 3,864 |
| Inferact/Kimi-K3.1-Pro-DSpark-preview | Draft model predecesor | no disponible | no disponible | no disponible | Sustituido por este checkpoint |
| Otros draft models de la familia Speculators | Draft models EAGLE/medusa-like para distintos objetivos | variable | variable | variable | No disponible en la informacion proporcionada |

No se dispone de datos de benchmarks comparables de terceros en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo autonomo: sin Kimi K3.1 Pro no produce salida util. No debe evaluarse como modelo de chat o de razonamiento por separado.
- La licencia no esta declarada en la informacion disponible; antes de uso comercial es imprescindible verificar los terminos en el repositorio y los del modelo objetivo Kimi K3.1 Pro.
- La aceptacion cae rapidamente con la posicion: del 79% en la posicion 1 al 17% en la 7. El speedup efectivo depende en gran medida del dominio (Writing y Roleplay rinden muy por debajo de Coding y RAG).
- Requiere `--trust-remote-code` y codigo personalizado, lo que implica auditar el repositorio antes de desplegarlo en entornos sensibles.
- La ventana efectiva de 2.048 tokens por capa limita la informacion que el borrador puede usar; la aceptacion en contextos de 1M tokens (3,421 en BEAM 1M) es inferior a la de contextos cortos.
- No se documentan sesgos, idiomas soportados ni evaluaciones de alucinacion del modelo objetivo; cualquier riesgo de este tipo es el de Kimi K3.1 Pro.
- El checkpoint sustituye a la version preview; fijar la revision concreta en produccion para evitar cambios inesperados.
- La configuracion de referencia desactiva el prefix caching y la verificacion adaptativa; modificar estos parametros puede alterar el rendimiento observado en las tablas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Inferact/Kimi-K3.1-Pro-DSpark
- Checkpoint predecesor: https://huggingface.co/Inferact/Kimi-K3.1-Pro-DSpark-preview
- Libreria Speculators de vLLM: https://github.com/vllm-project/speculators
- Modelo objetivo: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Grafica de throughput e interactividad: https://cdn-uploads.huggingface.co/production/uploads/67f401f4bb5b52cdad90f9a7/ZmNQ856m60NFuGr-4ioRU.png

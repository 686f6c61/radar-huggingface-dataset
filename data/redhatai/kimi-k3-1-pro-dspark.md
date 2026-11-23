# RedHatAI/Kimi-K3.1-Pro-DSpark

## Resumen

Kimi-K3.1-Pro-DSpark es un modelo borrador (draft model) disenado especificamente para decodificacion especulativa sobre el modelo objetivo Kimi K3.1 Pro de Moonshot AI. No es un modelo generativo autonomo: recibe los estados ocultos de cinco capas del modelo objetivo y propone bloques de hasta 7 tokens que el modelo grande verifica en paralelo, acelerando la inferencia sin alterar la distribucion de salida. Lo desarrolla RedHatAI en colaboracion con el equipo Speculators de Red Hat AI, utilizando la libreria Speculators del proyecto vLLM.

El checkpoint es la version estable que sustituye a Kimi-K3.1-Pro-DSpark-preview. Con 2.479.976.577 parametros en BF16 (aproximadamente 5 GB de pesos), emplea una arquitectura de 5 capas decoder densas con atencion grouped-query y una ventana deslizante de 2.048 tokens en cada capa, lo que mantiene constante el coste de atencion y la cache KV del borrador independientemente de la longitud del contexto. Declara soporte de contexto de hasta 1.048.576 tokens, alineado con la ventana de Kimi K3.1 Pro.

Su relevancia es practica: la decodificacion especulativa es una de las tecnicas mas eficaces para reducir la latencia de generacion en modelos grandes, y este borrador esta optimizado para el modelo Kimi K3.1 Pro con integracion directa en vLLM. En la evaluacion publicada alcanza una longitud de aceptacion agrupada de 3,864 tokens por paso de verificacion, con un 79% de aceptacion en la primera posicion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso, 5 capas, grouped-query attention con ventana deslizante de 2.048 tokens por capa |
| Parametros totales | 2.479.976.577 (BF16) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.048.576 tokens (cada capa atiende solo a los ultimos 2.048) |
| Tipos de cuantizacion | no disponible (checkpoint publicado en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (custom_code) |
| Cabeza de atencion | 96 cabezas de query, 16 cabezas KV, dimension de cabeza 64 |
| Hidden size / FFN | 7168 / 14336 |
| Entrada | estados ocultos de 5 capas del modelo objetivo |
| Bloque de borrador | 7 tokens por forward pass |
| Cabezas auxiliares | cabeza Markov (rango 512) y cabeza de confianza; embedding y LM head compartidos con el objetivo |
| Tamano del repo | 5,0 GB |

## Arquitectura y entrenamiento

El modelo es un borrador ligero de 5 capas densas que no procesa tokens directamente, sino los estados ocultos extraidos de cinco capas del modelo objetivo Kimi K3.1 Pro. Cada capa del borrador aplica grouped-query attention con 96 cabezas de query, 16 cabezas KV y dimension de cabeza 64, con una ventana deslizante fija de 2.048 tokens. Esta decision de diseno mantiene acotado el coste de atencion y el tamano de la cache KV del borrador a medida que crece el contexto, lo que permite mantener la eficiencia de drafting incluso en ventanas de hasta 1M tokens. La red oculta tiene tamano 7168 y FFN de 14336.

Sobre la representacion del borrador se anaden dos cabezas: una cabeza Markov de rango 512, que modela la dependencia entre tokens consecutivos del bloque propuesto, y una cabeza de confianza que estima la probabilidad de aceptacion. El embedding de entrada y la LM head se comparten con el modelo objetivo, lo que reduce parametros y alinea el espacio de vocabulario. El borrador propone 7 tokens por forward pass y se entrena de forma conjunta con el objetivo mediante la libreria Speculators de vLLM. No se dispone de informacion publicada sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO.

## Capacidades

- Decodificacion especulativa: propone bloques de 7 tokens por paso que Kimi K3.1 Pro verifica en paralelo, acelerando la generacion sin modificar la distribucion del modelo objetivo.
- Drafting en contexto largo: gracias a la ventana deslizante de 2.048 tokens por capa, mantiene una longitud de aceptacion estable hasta 1M tokens de contexto (3,935 en AA-LCR, 3,516 en BEAM 128K, 3,421 en BEAM 1M).
- Muestreo probabilistico: soporta `draft_sample_method: probabilistic` y `rejection_sample_method: block` en la configuracion de vLLM.
- Cabeza de confianza: permite estimar la aceptacion por token, util para verificacion adaptativa (aunque la configuracion de referencia la desactiva con `enable_adaptive_verification: false`).
- Integracion con vLLM: se sirve como componente del servidor vLLM mediante `--speculative-config` con metodo `dspark`.
- No es un modelo generativo autonomo: no responde prompts por si mismo ni soporta tool calling, agentes o vision de forma independiente.

## Casos de uso

- Aceleracion de inferencia en produccion con Kimi K3.1 Pro: desplegar el par objetivo-borrador en vLLM con tensor parallelism de 8 GPUs para reducir la latencia por token en cargas de chat y generacion de codigo, donde la aceptacion es mas alta (4,660 en HumanEval, 4,376 en MBPP).
- Razonamiento matematico de alto volumen: en cargas tipo GSM8K la longitud de aceptacion alcanza 5,566, lo que se traduce en una reduccion significativa de pasos de decodificacion en pipelines de resolucion de problemas matematicos.
- Procesamiento de documentos largos y RAG: con ventana de 1M tokens y aceptacion de 4,289 en la categoria RAG de SpeedBench, es adecuado para resumir o responder sobre corpus extensos manteniendo throughput.
- Agentes de codificacion sobre repositorios: para tareas tipo SWE-bench Pro (aceptacion 3,302) y generacion de parches, el borrador reduce el coste de los turnos largos de agente sin tocar la calidad del modelo objetivo.
- Servicio de chat multi-turno: en MT-Bench la aceptacion es 3,393 y en la categoria Humanities de SpeedBench 3,035, suficiente para mejorar la interactividad en asistentes conversacionales.
- Despliegue con presupuesto de latencia estricto: al mantener fija la cache KV del borrador, se puede servir con contextos largos sin que el coste de drafting crezca linealmente, util en plataformas de inferencia multi-tenant.
- Evaluacion interna de tecnicas de decodificacion especulativa: sirve como referencia reproducible para comparar metodos de drafting (EAGLE, Medusa, DSpark) sobre un objetivo de gran tamano.

## Benchmarks y rendimiento

Resultados de aceptacion publicados por el autor (longitud de aceptacion = 1 + tokens aceptados / borradores, incluyendo el token bonus):

| Benchmark | Prompts | Max tokens | Longitud de aceptacion | Pos. 1 | Pos. 2 | Pos. 3 | Pos. 4 | Pos. 5 | Pos. 6 | Pos. 7 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| GSM8K | 1.319 | 1.024 | 5,566 | 91% | 82% | 72% | 64% | 56% | 49% | 43% |
| HumanEval | 164 | 1.024 | 4,660 | 86% | 71% | 59% | 49% | 40% | 34% | 28% |
| MBPP | 974 | 1.024 | 4,376 | 84% | 68% | 55% | 44% | 35% | 28% | 23% |
| MATH-500 | 500 | 2.048 | 4,445 | 84% | 69% | 56% | 45% | 37% | 30% | 24% |
| SPEED-Bench low entropy | 302 | 1.536 | 3,619 | 78% | 58% | 42% | 31% | 23% | 17% | 13% |
| SPEED-Bench coding | 80 | 4.096 | 4,159 | 81% | 64% | 50% | 40% | 32% | 27% | 22% |
| MT-Bench | 80 | 1.024 | 3,393 | 76% | 54% | 38% | 27% | 20% | 14% | 11% |
| SWE-bench Pro | 642 | 2.048 | 3,302 | 75% | 53% | 37% | 26% | 18% | 13% | 9% |
| AIME 2026 | 30 | 4.096 | 3,429 | 77% | 56% | 40% | 28% | 20% | 14% | 10% |
| Pooled | — | — | 3,864 | 79% | 61% | 46% | 35% | 27% | 21% | 17% |

Aceptacion por categoria en SpeedBench (880 conversaciones, 1.138 llamadas al modelo, max 4.096 tokens):

| Categoria | Longitud de aceptacion | Aceptacion de borradores |
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

Aceptacion en contexto largo:

| Benchmark | Prompts | Tokens de prompt | Max tokens | Longitud de aceptacion |
|---|---:|---|---:|---:|
| AA-LCR | 100 | 95K de media | 1.024 | 3,935 |
| BEAM 128K | 400 | 97K–125K | 2.048 | 3,516 |
| BEAM 1M | 700 | 826K–1.04M | 2.048 | 3,421 |

No se han publicado resultados de benchmarks de calidad del modelo objetivo en la informacion disponible; las metricas anteriores miden unicamente la eficiencia del borrador.

## Requisitos de hardware

- VRAM del borrador: aproximadamente 5 GB en BF16 para los pesos; la cache KV del borrador es fija gracias a la ventana deslizante de 2.048 tokens por capa (96 cabezas de query, 16 KV, dim 64, 5 capas).
- VRAM total: el borrador se sirve junto a Kimi K3.1 Pro, que requiere tensor parallelism de 8 GPUs segun la configuracion de referencia de vLLM; el borrador anade una carga marginal sobre ese despliegue.
- GPUs recomendadas: la configuracion oficial usa `--tensor-parallel-size 8` con `--load-format fastsafetensors` y `--gpu-memory-utilization 0.90`, lo que apunta a nodos de 8 GPUs de clase datacenter (H100, H200, A100 80GB o equivalentes).
- GPU de consumo: el borrador por si solo cabe en una RTX 4090 (24 GB) en BF16, pero no es funcional sin el modelo objetivo Kimi K3.1 Pro, que no cabe en hardware de consumo.
- Opciones de despliegue: vLLM con `--speculative-config '{"method":"dspark",...}'` y la variable de entorno `VLLM_KIMI_K3_AUX_ATTN_RES_STREAM=0`; requiere `--trust-remote-code` por el codigo personalizado. No se documenta soporte en llama.cpp, Ollama ni TGI.
- Parametros de servicio de referencia: `--max-model-len 65536`, `--max-num-seqs 128`, `--max-num-batched-tokens 8192`, `--no-enable-prefix-caching`, `--reasoning-parser kimi_k3`, `--per-request-spec-decode-metrics summary`.
- Latencia y throughput: no se publican cifras absolutas de tokens por segundo en la informacion disponible; la mejora se expresa como longitud de aceptacion (3,864 agrupada), que se traduce directamente en menos pasos de verificacion por token generado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Kimi-K3.1-Pro-DSpark (este) | Borrador de decodificacion especulativa | 2,48B | 1.048.576 (ventana 2.048) | DSpark + vLLM Speculators | no disponible | Hugging Face |
| Kimi-K3.1-Pro-DSpark-preview | Borrador (version previa) | no disponible | no disponible | DSpark | no disponible | Hugging Face (Inferact) |
| EAGLE-3 (familia) | Borrador de decodificacion especulativa | variable por objetivo | depende del objetivo | EAGLE | no disponible en esta ficha | no disponible |
| Medusa (familia) | Cabezas de decodificacion especulativa | variable por objetivo | depende del objetivo | Medusa | no disponible en esta ficha | no disponible |

No se dispone de datos de benchmarks comparativos directos entre este borrador y alternativas sobre el mismo modelo objetivo en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: solo funciona como borrador acoplado a Kimi K3.1 Pro; no responde prompts ni ejecuta tareas por si mismo.
- Dependencia de version: esta optimizado para Kimi K3.1 Pro y sustituye a la version preview; cambios en el modelo objetivo o en la libreria Speculators pueden romper la compatibilidad.
- Requiere codigo personalizado: el uso de `--trust-remote-code` implica ejecutar codigo del repositorio, con el riesgo de seguridad asociado en entornos de produccion.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar los terminos antes de desplegar.
- Idiomas no declarados: la aceptacion varia por tarea y dominio (26% en Writing frente a 47% en RAG en SpeedBench), por lo que el beneficio real depende de la carga.
- Riesgo de alucinacion: el borrador no genera contenido propio, pero una aceptacion baja en dominios de baja entropia (SPEED-Bench low entropy, 3,619) reduce la ganancia y puede aumentar el coste de verificacion si se ajusta mal el numero de tokens especulativos.
- Configuracion sensible: la eleccion de `num_speculative_tokens`, `draft_sample_method` y `rejection_sample_method` afecta directamente al rendimiento; la configuracion de referencia desactiva la verificacion adaptativa.
- Sin datos de sesgo: no se publica informacion sobre sesgos, ya que el modelo hereda el comportamiento del objetivo y no se evalua de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/Kimi-K3.1-Pro-DSpark
- Checkpoint previo: https://huggingface.co/Inferact/Kimi-K3.1-Pro-DSpark-preview
- Libreria Speculators de vLLM: https://github.com/vllm-project/speculators
- Modelo objetivo: https://huggingface.co/moonshotai/Kimi-K3.1-Pro

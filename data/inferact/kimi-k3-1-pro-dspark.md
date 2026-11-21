# Inferact/Kimi-K3.1-Pro-DSpark

## Resumen

Kimi-K3.1-Pro-DSpark es un modelo borrador (draft model) disenado especificamente para decodificacion especulativa sobre el modelo objetivo Kimi K3.1 Pro de Moonshot AI. No es un modelo de lenguaje autonomo: no genera texto por si mismo a partir de tokens de entrada, sino que recibe los estados ocultos de cinco capas del modelo objetivo y propone bloques de tokens candidatos que el modelo grande verifica despues. Lo desarrolla Inferact en colaboracion con el equipo Red Hat AI Speculators, utilizando la libreria Speculators del proyecto vLLM.

El checkpoint tiene 2.479.976.577 parametros en BF16 (aproximadamente 2,5B) distribuidos en cinco capas decoder densas, con atencion de query agrupada (GQA) de 96 cabezas de consulta y 16 cabezas KV, dimension de cabeza 64, hidden size 7168 y FFN de 14336. Cada capa aplica una ventana deslizante de 2048 tokens, de modo que el coste de atencion y la cache KV del borrador permanecen constantes aunque el contexto crezca hasta el millon de tokens del modelo objetivo.

Su relevancia es practica: la decodificacion especulativa es una de las pocas tecnicas que reduce la latencia de inferencia sin degradar la calidad de salida, y este borrador esta afinado para el perfil de aceptacion de Kimi K3.1 Pro en cargas de codigo, matematicas, razonamiento y contexto largo. Con una longitud de aceptacion agrupada de 3,864 tokens por paso de verificacion, ofrece una aceleracion sustancial en despliegues de vLLM con el backend `dspark`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (5 capas) con GQA y ventana deslizante de 2048 tokens por capa; cabezas Markov (rango 512) y de confianza; embedding y LM head compartidos con el modelo objetivo |
| Parametros totales | 2.479.976.577 (BF16) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.048.576 tokens (cada capa del borrador atiende solo a los ultimos 2048) |
| Tipos de cuantizacion | no disponible (checkpoint publicado en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (con `custom_code` y `trust_remote_code`) |

## Arquitectura y entrenamiento

El borrador es un transformer decoder de cinco capas densas que no procesa tokens de entrada directamente: consume los estados ocultos de cinco capas seleccionadas del modelo objetivo Kimi K3.1 Pro. Cada capa emplea atencion de query agrupada con 96 cabezas de consulta, 16 cabezas KV y dimension de cabeza 64, sobre una ventana deslizante fija de 2048 tokens. Esta decision de diseno mantiene acotados tanto el coste computacional de la atencion como el tamano de la cache KV del borrador, independientemente de la longitud del contexto del modelo grande, lo que permite mantener la eficiencia de drafting incluso en regimenes de 1M tokens.

La cabeza de salida combina una cabeza Markov de rango 512 y una cabeza de confianza, y propone bloques de 7 tokens por pase forward. El embedding y el LM head se comparten con el modelo objetivo, lo que reduce el numero de parametros propios y alinea el espacio de vocabulario. El checkpoint se entreno con la libreria Speculators de vLLM, en un esfuerzo conjunto con el equipo Red Hat AI Speculators. No se especifican en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; el entrenamiento de un borrador de este tipo se orienta tipicamente a maximizar la tasa de aceptacion bajo la distribucion del modelo objetivo, no a alineamiento conversacional.

## Capacidades

- Decodificacion especulativa: propone hasta 7 tokens por pase forward que el modelo objetivo verifica, con metodos de muestreo probabilistico y rechazo por bloques.
- Aceleracion de inferencia sobre Kimi K3.1 Pro en despliegues vLLM mediante el metodo `dspark`.
- Operacion eficiente en contexto largo: la ventana deslizante de 2048 tokens por capa mantiene estable el coste de atencion hasta 1M tokens de contexto.
- Mayor tasa de aceptacion en tareas de codigo y matematicas (GSM8K, HumanEval, MBPP, MATH-500) que en dialogo abierto (MT-Bench).
- Compatibilidad con el servidor OpenAI de vLLM, incluidos `--enable-auto-tool-choice`, `--tool-call-parser kimi_k3` y `--reasoning-parser kimi_k3` en el despliegue del modelo objetivo.
- No es un modelo autonomo: no soporta generacion de texto, vision, audio ni tool calling por si mismo; hereda las capacidades del modelo objetivo que acelera.

## Casos de uso

- Servicio de chat de baja latencia sobre Kimi K3.1 Pro: desplegando el borrador con `--speculative-config` en vLLM se reduce el tiempo por token en cargas conversacionales; la aceptacion en MT-Bench (3,393 de longitud) y en SPEED-Bench QA (3,480) indica ganancias moderadas pero consistentes.
- Generacion de codigo en produccion: con aceptacion de 4,660 en HumanEval y 4,376 en MBPP, el borrador es especialmente rentable en asistentes de autocompletado y generacion de funciones, donde la distribucion del modelo objetivo es mas predecible.
- Razonamiento matematico y STEM: GSM8K alcanza 5,566 de longitud de aceptacion y MATH-500 4,445, por lo que pipelines de resolucion de problemas y verificacion matematica se benefician de forma notable.
- Analisis de documentos largos y RAG: con ventana de 1M tokens y aceptacion de 4,289 en la categoria RAG de SPEED-Bench y 3,935 en AA-LCR (prompts de ~95K tokens), es adecuado para resumen y QA sobre corpus extensos sin penalizacion por longitud.
- Agentes de codigo sobre repositorios: SWE-bench Pro muestra 3,302 de aceptacion con prompts de 2K tokens, suficiente para tareas de edicion multi-archivo donde la latencia de decodificacion domina el coste.
- Despliegues con contexto extremo: BEAM 1M (prompts de 826K a 1,04M tokens) mantiene 3,421 de aceptacion, lo que permite servir conversaciones o analisis de corpus de un millon de tokens con drafting eficiente.
- Optimizacion de infraestructura existente: al ser un borrador de 5 GB en BF16, se integra en clusters que ya sirven Kimi K3.1 Pro con tensor parallelism 8 y decodificacion con `--decode-context-parallel-size 8`, sin requerir hardware adicional significativo.

## Benchmarks y rendimiento

Longitud de aceptacion por benchmark (1 + tokens aceptados / borradores), con temperatura 1.0, top_p 0.95 y el conjunto de test completo:

| Benchmark | Prompts | Max tokens | Longitud de aceptacion | Pos. 1 | Pos. 4 | Pos. 7 |
|---|---:|---:|---:|---:|---:|---:|
| GSM8K | 1.319 | 1.024 | 5,566 | 91% | 64% | 43% |
| HumanEval | 164 | 1.024 | 4,660 | 86% | 49% | 28% |
| MBPP | 974 | 1.024 | 4,376 | 84% | 44% | 23% |
| MATH-500 | 500 | 2.048 | 4,445 | 84% | 45% | 24% |
| SPEED-Bench coding | 80 | 4.096 | 4,159 | 81% | 40% | 22% |
| SPEED-Bench low entropy | 302 | 1.536 | 3,619 | 78% | 31% | 13% |
| AIME 2026 | 30 | 4.096 | 3,429 | 77% | 28% | 10% |
| MT-Bench | 80 | 1.024 | 3,393 | 76% | 27% | 11% |
| SWE-bench Pro | 642 | 2.048 | 3,302 | 75% | 26% | 9% |
| Agrupado | — | — | 3,864 | 79% | 35% | 17% |

Aceptacion por categoria en SpeedBench (880 conversaciones, 1.138 llamadas, 4.096 tokens max):

| Categoria | Longitud de aceptacion | Aceptacion de borradores |
|---|---:|---:|
| RAG | 4,2890 | 46,99% |
| Coding | 4,0957 | 44,22% |
| Multilingual | 4,0903 | 44,15% |
| Summarization | 4,1758 | 45,37% |
| Reasoning | 3,5954 | 37,08% |
| QA | 3,4800 | 35,43% |
| Math | 3,2025 | 31,46% |
| STEM | 3,1874 | 31,25% |
| Humanities | 3,0354 | 29,08% |
| Roleplay | 3,0310 | 29,01% |
| Writing | 2,8243 | 26,06% |
| Agrupado | 3,2690 | 32,41% |

Contexto largo:

| Benchmark | Prompts | Tokens de prompt | Max tokens | Longitud de aceptacion |
|---|---:|---|---:|---:|
| AA-LCR | 100 | ~95K de media | 1.024 | 3,935 |
| BEAM 128K | 400 | 97K–125K | 2.048 | 3,516 |
| BEAM 1M | 700 | 826K–1,04M | 2.048 | 3,421 |

No se han publicado resultados de benchmarks de calidad del modelo objetivo (MMLU, HumanEval como tarea, etc.) en la informacion disponible; las cifras anteriores miden exclusivamente la eficiencia del borrador.

## Requisitos de hardware

- VRAM del borrador: 5,0 GB de repositorio en BF16; en la practica requiere espacio adicional para la cache KV de sus cinco capas (acotada por la ventana de 2048 tokens), por lo que el consumo es marginal frente al modelo objetivo.
- GPU recomendadas: el despliegue de referencia usa `--tensor-parallel-size 8` y `--decode-context-parallel-size 8`, lo que implica nodos con 8 GPU de clase datacenter (H100, H200 o B200). El borrador en si cabe en cualquier GPU consumer con 8 GB o mas de VRAM, pero el modelo objetivo Kimi K3.1 Pro no cabe en consumer.
- Cabe en GPU consumer: el borrador si (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090), aunque sin utilidad sin el modelo objetivo; el conjunto completo no cabe.
- Opciones de despliegue: vLLM con el metodo `dspark` (unica via documentada), mediante la imagen `vllm/vllm-openai:kimi-k31`, `--trust-remote-code`, `--moe-backend deep_gemm_mega_moe`, `--all2all-backend flashinfer_nvlink_one_sided`, `--load-format fastsafetensors` y `--kv-cache-dtype nvfp4_ds_mla`. No se documenta soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras absolutas de tokens por segundo; la model card incluye una grafica de throughput e interactividad sin valores numericos en el texto. La metrica reportada es la longitud de aceptacion, que oscila entre 2,82 y 5,57 segun tarea.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|
| Kimi-K3.1-Pro-DSpark | 2,48B | 1.048.576 | Borrador especulativo (dspark) | no disponible | Hugging Face, vLLM |
| Kimi-K3.1-Pro-DSpark-preview | no disponible | no disponible | Borrador especulativo (version previa) | no disponible | Hugging Face (sustituido por este checkpoint) |
| Borradores EAGLE / Medusa genericos | variable (tipicamente 0,1–1B) | depende del objetivo | Borrador especulativo | variable | Amplia, integrados en vLLM y TGI |

La informacion proporcionada no incluye datos de aceptacion ni rendimiento de borradores alternativos, por lo que no es posible una comparacion cuantitativa. La ventaja declarada frente a la version preview es la sustitucion directa como checkpoint mas reciente.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el modelo objetivo Kimi K3.1 Pro y el runtime vLLM con soporte `dspark`, el checkpoint no produce salidas utiles.
- Licencia no especificada: no se indica licencia en la model card ni en los metadatos, lo que impide confirmar condiciones de uso comercial; debe verificarse antes de produccion.
- Idiomas no declarados: la aceptacion varia por categoria (Writing 2,82 frente a RAG 4,29), y no hay garantia de comportamiento uniforme entre idiomas.
- La aceleracion depende de la carga: en tareas de baja entropia o dialogo creativo la longitud de aceptacion cae por debajo de 3,3, reduciendo la ganancia frente a decodificacion estandar.
- Requiere `--trust-remote-code` y `custom_code`, lo que implica ejecutar codigo del autor del checkpoint en el servidor de inferencia.
- El despliegue de referencia exige configuracion especifica (tensor parallel 8, decode context parallel 8, backend MoE deep_gemm, KV cache nvfp4_ds_mla); desviarse de ella puede degradar la aceptacion.
- No se documentan sesgos, tasas de alucinacion ni evaluaciones de seguridad del borrador; al heredar la distribucion del modelo objetivo, cualquier sesgo de este se refleja en las propuestas, aunque la verificacion final la realiza el modelo grande.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Inferact/Kimi-K3.1-Pro-DSpark
- Checkpoint previo sustituido: https://huggingface.co/Inferact/Kimi-K3.1-Pro-DSpark-preview
- Libreria Speculators de vLLM: https://github.com/vllm-project/speculators
- Modelo objetivo: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Imagen de despliegue: `vllm/vllm-openai:kimi-k31`
- Grafica de throughput e interactividad: https://cdn-uploads.huggingface.co/production/uploads/67f401f4bb5b52cdad90f9a7/wXzGbHI9Whia-M1LxGtFL.png

# cliecy/DeepSeek-V4.1-Flash-1017-V6c-codezh-count192-IQ2XS-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-V6c-codezh-count192-IQ2XS-GGUF es un checkpoint experimental publicado por el usuario `cliecy`: una versión podada y cuantizada a GGUF del modelo `deepseek-ai/DeepSeek-V4.1-Flash-1017`. El autor reduce el número de expertos por capa de 384 a 192 seleccionando, mediante conteo de routing sobre una calibración de código en chino, y posteriormente aplica una cuantización extrema UD-IQ2XS con tipos de tensor mixtos. El resultado se reparte en cinco shards de hasta 45 GB (199,2 GB en total) para intentar ejecutar un MoE de escala frontier en 2×RTX 4090 de 48 GB.

El propio autor lo etiqueta como resultado negativo: el podado por conteo de routing sobre código chino degrada notablemente el modelo, con una HumanEval-zh del 70,7 %, un KLD medio de 1,015 frente al checkpoint V0 y un top-1 de coincidencia del 69,1 % en el conjunto de evaluación general. Los dominios de código (C++ y chino) se mantienen razonablemente bien (PPL 1,458 y 1,910 respectivamente; top-1 94,7 % y 93,1 %), mientras que wiki, japonés y chat se deterioran de forma severa (top-1 del 60,1 %, 28,0 % y 69,7 %).

Su relevancia es metodológica, no de producto: documenta de forma reproducible el pipeline completo (rankings de expertos con `llama-reap`, script `prune_experts.py`, imatrix, evaluación KLD/PPL por dominio y HumanEval-zh) y sirve como referencia para quien investigue podado de expertos en MoE y cuantización de 2 bits. No es un modelo recomendado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con expertos compartidos, atención comprimida por tensores `attn_compressor_*` e `indexer.*`, y embeddings `engram_embd` (deducido de los nombres de tensor; el autor no publica una descripción formal) |
| Parametros totales | 476.664.448.624 según metadatos de safetensors del repo; el GGUF podado tiene menos parámetros efectivos al reducir de 384 a 192 expertos por capa (cifra exacta del GGUF: no disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible como especificación del modelo; las pruebas se ejecutaron con `-c 32768` en llama-server y con contexto 2048 en la evaluación de KLD |
| Tipos de cuantizacion | Mezcla UD-IQ2XS: expertos enrutados `ffn_gate_exps`/`ffn_up_exps` en IQ2_XS y `ffn_down_exps` en IQ2_S; `engram_embd` Q4_K; atención y expertos compartidos Q6_K; router `ffn_gate_inp`, `attn_compressor_*` e `indexer.*` en BF16; `hc_*_fn` en F32; salida Q6_K; embeddings de tokens Q8_0 |
| Idiomas soportados | no disponible en los metadatos; la calibración y evaluación cubren inglés, chino, japonés y código (C++ y otros 7 lenguajes) |
| Licencia | MIT |
| Formato de pesos | GGUF, dividido en 5 shards (`llama-gguf-split --split-max-size 45G`) |
| Modelo base | `deepseek-ai/DeepSeek-V4.1-Flash-1017` (relación: quantized) |
| Expertos por capa | 192 (podado desde 384) |
| Tamano del repo | 199,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No hay entrenamiento: es un proceso de podado y cuantización sobre el checkpoint V0 (`cliecy/DeepSeek-V4.1-Flash-1017-UD-IQ2XS-GGUF`), a su vez una requantización UD-IQ2XS sin dither del modelo base. El podado actúa por capa y a lo largo del eje de expertos sobre `ffn_{gate,up,down}_exps`, el router `ffn_gate_inp` y los sesgos de selección `exp_probs_b(_vl)`, y fija `deepseek41.expert_count = 192`. Dado que llama.cpp usa un único conteo global de expertos, todas las capas conservan sus propios top-192 y un experto podado nunca puede ser seleccionado.

Los rankings de importancia se obtuvieron con `llama-reap` sobre dos calibraciones: `calib-all` (452.000 tokens de texto EN/zh, chats generados por V0, japonés y C++) y `calib-codezh` (1,0 M de tokens de chats de código en chino generados por GLM-5.3 más código en 8 lenguajes). Esta ficha corresponde a la variante podada por conteo de routing sobre `calib-codezh`. La imatrix antigua es la de `mrfakename` Q2_K sobre calib-mix con contexto 512; la nueva imatrix se calcula sobre V0 con `calib-all` y contexto 2048. Las listas de expertos descartados por capa están publicadas en el repositorio de evaluación.

El interés técnico está en la comparación explícita entre dos criterios de selección: conteo de routing frente a score REAP (media de `g_e·‖f_e‖` sobre tokens enrutados). Según el autor, el criterio por conteo aplicado a código chino produce un peor resultado global, lo que convierte el checkpoint en evidencia empírica sobre el sesgo de dominio que introduce la calibración de podado.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla Jinja específica (`deepseek-ai-DeepSeek-V4.1-Flash.jinja`).
- Generación de código con calidad preservada en C++ (PPL 1,458; top-1 94,7 %) y en código chino (PPL 1,910; top-1 93,1 %).
- Razonamiento y matemáticas básicas degradadas: en la evaluación Q&A acierta 2 de 4 problemas de código y matemáticas, y falla el problema clásico de gallinas y conejos (鸡兔).
- Modo "thinking" presente pero inestable: los 4 textos largos de la evaluación quedan atrapados en el bloque de razonamiento (bucles).
- Capacidad multilingüe muy desigual: inglés y chino aceptables, japonés prácticamente destruido (top-1 28,0 %; PPL 123,8).
- Soporte de tool calling / function calling: no disponible (no se documenta ni se evalúa).
- Soporte de agentes y razonamiento multi-paso: no disponible (no evaluado; el comportamiento en bucle sugiere que no es fiable).
- Visión y audio: no disponible.

## Casos de uso

- Reproducción de experimentos de podado de expertos: el checkpoint permite replicar paso a paso el pipeline `prune_experts.py` + `llama-reap` sobre el V0 y comparar el criterio de conteo de routing con el score REAP sobre las mismas calibraciones.
- Estudio del sesgo de dominio en la calibración: al haberse podado con 1,0 M de tokens de código chino, sirve para medir cuánto se degrada el rendimiento en wiki, japonés y chat cuando la calibración se inclina hacia un dominio concreto, usando las tablas de KLD/PPL por dominio publicadas.
- Evaluación de pipelines de cuantización extrema: con KLD medio de 1,015 y KLD al percentil 99 de 7,62 frente a V0, es un caso de referencia para validar herramientas de medición de divergencia (`llama-perplexity --kl-divergence`) y para calibrar umbrales de aceptación en flujos de requantización.
- Pruebas de despliegue de MoE de gran escala en hardware de consumo: el autor documenta la configuración usada (`-ngl 999 -fa on -sm layer -ts 48,52 -ot engram_embd.weight=CPU -lm none -lzm off -t 16 -c 32768 -np 1`) para intentar repartir el modelo en 2×RTX 4090, lo que permite estudiar estrategias de offload de tensores concretos (la tabla `engram_embd` en CPU o page cache).
- Generación de código en C++ con presupuesto de memoria muy ajustado: es el dominio menos dañado del checkpoint (top-1 94,7 %), por lo que puede usarse en pruebas de autocompletado o generación de fragmentos C++ donde no se requiera calidad de referencia y sí un consumo de VRAM mínimo.
- Docencia e investigación sobre cuantización de 2 bits: el desglose por tensor (IQ2_XS/IQ2_S en expertos frente a Q6_K/BF16 en atención y router) ejemplifica qué componentes conviene mantener en precisión alta y cuáles toleran 2 bits.
- Comparación de checkpoints en una misma familia: junto con V0 y las variantes intermedias, permite trazar curvas de degradación frente al número de expertos conservados en un MoE de ~476.000 millones de parámetros.

## Benchmarks y rendimiento

Resultados publicados por el autor en el repositorio de evaluación, comparados contra los logits de V0 (contexto 2048, 16.384 tokens por dominio):

| Metrica | Valor |
|---|---|
| KLD medio (eval-all) | 1,015 |
| KLD percentil 99 (eval-all) | 7,62 |
| Top-1 agreement (eval-all) | 69,1 % |
| HumanEval-zh (greedy, máx. 6000 tokens, 82 problemas) | 70,7 % |
| Q&A (temperatura 0,6) | 2/4 en código y matemáticas; fallo en el problema de gallinas y conejos |
| Textos largos | 4 de 4 atrapados en el bloque de razonamiento |

Desglose por dominio (PPL / KLD / top-1):

| Dominio | PPL | KLD | Top-1 |
|---|---|---|---|
| Código (C++) | 1,458 | 0,198 | 94,7 % |
| Código en chino | 1,910 | 0,069 | 93,1 % |
| Wiki | 8,88 | 1,433 | 60,1 % |
| Japonés | 123,8 | 2,458 | 28,0 % |
| Chat | 4,66 | 0,918 | 69,7 % |

No se han publicado resultados de benchmarks estándar (MMLU, GSM8K, HumanEval en inglés) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra publicada. El repositorio ocupa 199,2 GB, por encima de los 96 GB de VRAM de 2×RTX 4090, de modo que el conjunto completo no cabe en esas dos GPU; el autor descarga explícitamente `engram_embd.weight` a CPU (`-ot engram_embd.weight=CPU`).
- GPU objetivo declarada por el autor: 2×RTX 4090 de 48 GB (96 GB totales) con reparto por capas (`-sm layer`) y proporción `-ts 48,52`.
- GPU recomendadas: no disponibles. Para alojar los 199,2 GB en VRAM harían falta, como mínimo, configuraciones de ~200 GB, como 3×H100 80 GB o 5×A100 40 GB; no hay datos de que el autor las haya probado.
- Cabe en GPU de consumo: solo parcialmente y con offload a CPU/RAM; el autor lo plantea como ejercicio de viabilidad, no como despliegue estable.
- Opciones de despliegue: llama.cpp (`llama-server`) con un build parcheado específico para DeepSeek-V4.1 (el del repo `cliecy/DeepSeek-V4.1-Flash-1017-UD-IQ2XS-GGUF`, que incluye el parche y binarios precompilados). No se documenta compatibilidad con vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: no disponibles. No se publican tokens por segundo ni tiempos de respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Expertos por capa | Contexto | KLD / top-1 vs V0 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (V6c, podado por conteo, codezh) | 476,66 B según metadatos del repo; menor tras el podado | 192 | 32.768 en pruebas | 1,015 / 69,1 %; HumanEval-zh 70,7 % | MIT | GGUF, 5 shards, 199,2 GB |
| `cliecy/DeepSeek-V4.1-Flash-1017-UD-IQ2XS-GGUF` (V0) | no disponible | 384 (sin podar) | no disponible | referencia (0 / 100 %) | MIT | GGUF |
| `deepseek-ai/DeepSeek-V4.1-Flash-1017` (base) | 476,66 B según safetensors | no disponible | no disponible | referencia en precisión original | MIT según este repo derivado (licencia del base: no disponible en la información) | safetensors |
| Otras variantes de podado del mismo autor | no disponible | no disponible | no disponible | no disponible | MIT | GGUF |

No se dispone de datos de benchmarks ni de especificaciones del modelo base (contexto nativo, parámetros activos, número de expertos original) en la información proporcionada, por lo que la comparación con alternativas de otras familias no es posible.

## Limitaciones y advertencias

- Resultado negativo declarado por el propio autor: el podado por conteo de routing sobre código chino degrada el modelo más que el criterio REAP, y el checkpoint se publica para reproducibilidad, no para uso práctico.
- Divergencia alta respecto a V0: KLD medio de 1,015 y KLD al percentil 99 de 7,62, con solo 69,1 % de coincidencia top-1 en el conjunto general.
- Degradación severa fuera del dominio de código: japonés con top-1 del 28,0 % y PPL 123,8; wiki con top-1 del 60,1 % y PPL 8,88. El uso multilingüe más allá de inglés y chino no es viable.
- Razonamiento inestable: los 4 textos largos evaluados quedan atrapados en el bloque de pensamiento y falla problemas aritméticos elementales, lo que desaconseja su uso en tareas de razonamiento multi-paso o agentes.
- Sesgo de calibración: al seleccionar expertos con 1,0 M de tokens de código chino, el modelo favorece ese dominio y pierde capacidades generales y de otros idiomas.
- Riesgo de alucinación: no evaluado en la información disponible; la degradación de top-1 y PPL en wiki y chat hace esperable un aumento de la generación incorrecta.
- Dependencia de un build parcheado de llama.cpp: requiere la versión concreta usada en el repo V0; no hay garantía de funcionamiento con llama.cpp upstream ni con otros motores de inferencia.
- Contexto: la longitud nativa no está documentada; las pruebas usan 32.768 tokens en servidor y 2048 en evaluación de KLD, sin datos sobre estabilidad más allá de esas cifras.
- Licencia MIT, que permite uso comercial según los términos del repo derivado; conviene verificar la licencia del modelo base `deepseek-ai/DeepSeek-V4.1-Flash-1017`, no incluida en la información disponible, antes de cualquier despliegue comercial.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay validación independiente de los resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cliecy/DeepSeek-V4.1-Flash-1017-V6c-codezh-count192-IQ2XS-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Checkpoint V0 de referencia (UD-IQ2XS, parche y binarios de llama.cpp): https://huggingface.co/cliecy/DeepSeek-V4.1-Flash-1017-UD-IQ2XS-GGUF
- Informe completo de evaluación, medidas, herramientas y listas de expertos podados: https://huggingface.co/datasets/cliecy/DeepSeek-V4.1-Flash-1017-pruning-eval
- llama.cpp (motor de inferencia requerido): https://github.com/ggml-org/llama.cpp

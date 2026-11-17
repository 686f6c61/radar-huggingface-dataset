# RedHatAI/Kimi-K3.1-Pro-DSpark

## Resumen

Kimi-K3.1-Pro-DSpark es un modelo borrador (draft model) disenado especificamente para decodificacion especulativa sobre el modelo objetivo Kimi K3.1 Pro. No es un modelo generativo autonomo: recibe los hidden states de cinco capas del modelo objetivo y propone bloques de hasta siete tokens por pasada, que el modelo grande verifica en paralelo. Lo desarrolla RedHatAI en colaboracion con el equipo Speculators de Red Hat AI, empleando la libreria Speculators del proyecto vLLM.

El checkpoint contiene 2.479.976.577 parametros en BF16 (aproximadamente 5 GB en safetensors) distribuidos en cinco capas decoder densas. Su rasgo arquitectonico mas relevante es que cada capa emplea atencion con ventana deslizante de 2.048 tokens sobre 96 cabezas de consulta y 16 cabezas KV (GQA, dimension de cabeza 64), de modo que el coste de atencion y la cache KV del borrador permanecen constantes aunque el contexto del modelo objetivo crezca hasta 1.048.576 tokens.

Es relevante ahora porque la decodificacion especulativa es una de las pocas tecnicas que reduce la latencia de inferencia sin alterar la distribucion de salida del modelo grande. Este checkpoint sustituye a Kimi-K3.1-Pro-DSpark-preview y publica tasas de aceptacion por posicion sobre diez benchmarks, lo que permite estimar con detalle la ganancia real de throughput antes de desplegarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso, 5 capas, con GQA y sliding-window attention de 2.048 tokens; cabezas Markov (rango 512) y de confianza; embedding y LM head compartidos con el modelo objetivo |
| Parametros totales | 2.479.976.577 (2,5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1.048.576 tokens de contexto del objetivo; cada capa del borrador atiende solo a los ultimos 2.048 |
| Tipos de cuantizacion | BF16 (unico formato indicado en la model card); no se documentan GGUF, FP8 ni INT4 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, con custom_code |

Otros datos tecnicos: hidden size 7168, FFN 14336, 96 cabezas de consulta y 16 KV con head dim 64; entrada compuesta por hidden states de 5 capas del modelo objetivo; bloque de borrador de 7 tokens por forward pass.

## Arquitectura y entrenamiento

El modelo es un borrador ligero de cinco capas densas que no procesa tokens directamente, sino los hidden states extraidos de cinco capas del Kimi K3.1 Pro. Sobre esa representacion aplica atencion grouped-query con ventana deslizante de 2.048 tokens en todas las capas, lo que mantiene fija tanto la complejidad de atencion como el tamano de la cache KV del borrador independientemente de la longitud del contexto del objetivo. La salida se produce mediante dos cabezas: una cabeza Markov de rango 512, que modela dependencias entre tokens consecutivos del bloque propuesto, y una cabeza de confianza que estima la probabilidad de aceptacion. El embedding de entrada y el LM head se comparten con el modelo objetivo, lo que reduce el numero de parametros propios y alinea el espacio de vocabulario.

Cada forward pass genera un bloque de siete tokens candidatos. En el servidor se configura con `num_speculative_tokens: 7`, `draft_sample_method: probabilistic` y `rejection_sample_method: block`, de forma que el modelo objetivo valida el bloque completo y acepta el prefijo correcto. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; esa informacion no esta disponible. El checkpoint es un trabajo conjunto con el equipo Speculators de Red Hat AI y se construyo con la libreria Speculators de vLLM.

## Capacidades

- Decodificacion especulativa: propone bloques de 7 tokens por pasada para acelerar la generacion del modelo objetivo Kimi K3.1 Pro.
- Prediccion multi-token con cabeza Markov de rango 512, que modela la coherencia interna del bloque propuesto.
- Estimacion de confianza por token mediante cabeza dedicada, util para decidir la longitud efectiva del bloque.
- Operacion en contexto largo: mantiene coste de atencion y cache KV constantes gracias a la ventana deslizante de 2.048 tokens, con soporte hasta 1M tokens del objetivo.
- Integracion nativa con vLLM mediante `--speculative-config` con metodo `dspark`.
- No genera texto de forma autonoma: requiere el modelo objetivo y sus hidden states intermedios.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo thinking propias; dependen integramente del modelo objetivo.
- Cobertura multilingue: no disponible.

## Casos de uso

- Reduccion de latencia en inferencia de Kimi K3.1 Pro: desplegado junto al modelo objetivo en vLLM, el borrador eleva la longitud de aceptacion agrupada a 3,864 tokens por paso de verificacion, lo que se traduce en menos pasos secuenciales para producir la misma salida.
- Servicio de razonamiento matematico interactivo: en GSM8K alcanza una longitud de aceptacion de 5,566 con tasa de aceptacion de 0,91 en la primera posicion, adecuado para asistentes que resuelven problemas paso a paso y necesitan baja latencia percibida.
- Generacion de codigo en produccion: en HumanEval (4,660) y MBPP (4,376) mantiene tasas de aceptacion superiores a 0,80 en la primera posicion, lo que lo hace util en pipelines de autocompletado y generacion de tests donde el tiempo por token es critico.
- Procesamiento de documentos largos: con entradas de 826K a 1,04M tokens en BEAM 1M conserva una longitud de aceptacion de 3,421, lo que permite resumir o extraer informacion de contratos y expedientes extensos sin que el coste del borrador crezca con el contexto.
- Analisis de repositorios y tareas de SWE: en SWE-bench Pro registra 3,302 de longitud de aceptacion sobre prompts de hasta 2.048 tokens de salida, adecuado para agentes que editan codigo en multiples pasos.
- Despliegue en entornos con presupuesto de VRAM ajustado: al ocupar unos 5 GB en BF16 y mantener una cache KV fija de 2.048 tokens por capa, el borrador anade un coste de memoria acotado frente al modelo objetivo.
- Evaluacion comparativa de tecnicas de decodificacion especulativa: las tasas de aceptacion por posicion publicadas permiten calibrar politicas de muestreo y longitud de bloque en despliegues propios.

## Benchmarks y rendimiento

Metrica empleada: longitud de aceptacion = 1 + tokens aceptados / borradores (incluye el token de bonificacion). Cliente con chat completions, temperatura 1,0 y top_p 0,95.

| Benchmark | Prompts | Max tokens | Longitud de aceptacion | Tasa de aceptacion pos. 1-7 |
|---|---:|---:|---:|---|
| GSM8K | 1.319 | 1.024 | 5,566 | 0,91 0,82 0,72 0,64 0,56 0,49 0,43 |
| HumanEval | 164 | 1.024 | 4,660 | 0,86 0,71 0,59 0,49 0,40 0,34 0,28 |
| MBPP | 974 | 1.024 | 4,376 | 0,84 0,68 0,55 0,44 0,35 0,28 0,23 |
| MATH-500 | 500 | 2.048 | 4,445 | 0,84 0,69 0,56 0,45 0,37 0,30 0,24 |
| SPEED-Bench low entropy (entradas de 10K tokens) | 302 | 1.536 | 3,619 | 0,78 0,58 0,42 0,31 0,23 0,17 0,13 |
| SPEED-Bench coding | 80 | 4.096 | 4,159 | 0,81 0,64 0,50 0,40 0,32 0,27 0,22 |
| MT-Bench | 80 | 1.024 | 3,393 | 0,76 0,54 0,38 0,27 0,20 0,14 0,11 |
| SWE-bench Pro | 642 | 2.048 | 3,302 | 0,75 0,53 0,37 0,26 0,18 0,13 0,09 |
| AIME 2026 | 30 | 4.096 | 3,429 | 0,77 0,56 0,40 0,28 0,20 0,14 0,10 |
| Agrupado (pooled) | | | 3,864 | 0,79 0,61 0,46 0,35 0,27 0,21 0,17 |

Contexto largo:

| Benchmark | Prompts | Tokens de prompt | Max tokens | Longitud de aceptacion | Tasa de aceptacion pos. 1-7 |
|---|---:|---|---:|---:|---|
| AA-LCR | 100 | 95K de media | 1.024 | 3,935 | 0,81 0,64 0,49 0,37 0,27 0,21 0,15 |
| BEAM 128K | 400 | 97K-125K | 2.048 | 3,516 | 0,78 0,58 0,41 0,29 0,20 0,14 0,10 |
| BEAM 1M | 700 | 826K-1,04M | 2.048 | 3,421 | 0,77 0,56 0,40 0,28 0,19 0,13 0,09 |

No se publican resultados de calidad del modelo objetivo (MMLU, exactitud en GSM8K, pass@1 en HumanEval) en la informacion disponible; las cifras anteriores miden unicamente aceptacion de tokens del borrador.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5 GB para los pesos en BF16 (tamano del repo: 5,0 GB), mas la cache KV del borrador, que es fija por la ventana de 2.048 tokens y no crece con el contexto.
- GPU recomendadas: cualquier GPU con al menos 8-10 GB libres para alojar el borrador junto al modelo objetivo; en la practica el limite lo impone Kimi K3.1 Pro, no el borrador. Para el conjunto completo se requieren aceleradores de clase A100/H100 o superiores.
- Cabe en GPU de consumo: si, el borrador por si solo cabe en RTX 4090 (24 GB), RTX 4080 (16 GB) y RTX 3090 (24 GB); el modelo objetivo determina si el despliegue conjunto es viable.
- Opciones de despliegue: vLLM con `--speculative-config '{"method":"dspark","model":"...","num_speculative_tokens":7,"draft_sample_method":"probabilistic","rejection_sample_method":"block"}'`. No se documentan soportes para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no se publican cifras absolutas de tokens por segundo ni de latencia; la mejora debe estimarse a partir de la longitud de aceptacion (3,864 agrupada, hasta 5,566 en GSM8K) y del coste relativo de un forward pass del borrador frente al del objetivo.

## Comparativa con modelos similares

No se dispone de datos de otros modelos borrador en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible. A modo de referencia estructural:

| Modelo | Parametros | Contexto | Tipo | Licencia |
|---|---:|---|---|---|
| Kimi-K3.1-Pro-DSpark | 2,5B | 1M (objetivo); 2.048 por capa | Borrador de decodificacion especulativa | no disponible |
| Kimi-K3.1-Pro-DSpark-preview | no disponible | no disponible | Borrador (version anterior, sustituida) | no disponible |
| Alternativas de otros equipos | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo autonomo: sin Kimi K3.1 Pro y sus hidden states intermedios no puede generar texto; no debe evaluarse como modelo de chat o de razonamiento independiente.
- La tasa de aceptacion cae de forma marcada con la posicion del token: del 0,79 en la primera posicion al 0,17 en la septima (agrupado), y hasta 0,09 en SWE-bench Pro; el bloque de 7 tokens rara vez se acepta completo.
- El rendimiento depende del dominio: MT-Bench (3,393) y SWE-bench Pro (3,302) quedan muy por debajo de GSM8K (5,566), por lo que la ganancia de throughput varia segun la carga.
- En contexto muy largo la aceptacion se degrada: BEAM 1M baja a 3,421 frente a 3,935 de AA-LCR con prompts de 95K.
- Riesgo de alucinacion: el borrador no introduce contenido propio en la salida final, ya que el modelo objetivo verifica cada token; el riesgo de sesgo o alucinacion recae en el modelo objetivo.
- Licencia no disponible: no puede confirmarse el uso comercial ni las condiciones de redistribucion; es un caveat bloqueante para produccion hasta verificarlo.
- Idiomas soportados no disponibles; la cobertura linguistica depende del modelo objetivo.
- Solo se documenta BF16; no hay pesos cuantizados oficiales, lo que limita opciones de despliegue en hardware con poca memoria.
- Requiere custom_code y una version de vLLM con soporte del metodo `dspark`; no se garantiza compatibilidad con otros runtimes.
- El checkpoint sustituye a Kimi-K3.1-Pro-DSpark-preview; configuraciones que apunten al preview deben migrarse.
- Creado y actualizado el 2026-11-17, con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/RedHatAI/Kimi-K3.1-Pro-DSpark
- Checkpoint anterior (preview): https://huggingface.co/Inferact/Kimi-K3.1-Pro-DSpark-preview
- Libreria Speculators de vLLM: https://github.com/vllm-project/speculators

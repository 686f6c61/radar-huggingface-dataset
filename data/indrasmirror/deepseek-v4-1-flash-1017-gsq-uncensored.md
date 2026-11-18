# IndrasMirror/DeepSeek-V4.1-Flash-1017-GSQ-Uncensored

## Resumen

DeepSeek-V4.1-Flash-1017-GSQ-Uncensored es una cuantizacion mixta de precision extremadamente agresiva del modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017, publicada por el usuario IndrasMirror. El modelo original es un Mixture-of-Experts (MoE) de gran escala con 552.000 millones de parametros declarados y 40 capas, cada una con 384 expertos enrutados (top-6 por token), lo que suma 15.360 expertos enrutados con 543.600 millones de pesos, ademas de un experto compartido, Hyper-Connections, atencion dispersa CSA y una memoria de n-gramas denominada Engram.

El objetivo de esta publicacion es hacer viable la inferencia de un MoE de ese tamano en hardware de consumo: el autor afirma que el modelo corre en un PC con una RTX 4090 (24 GB de VRAM), 90 GB de RAM y almacenamiento NVMe. Para lograrlo aplica una cuantizacion por experto con cuatro formatos distintos (ternario PTQ1_0, Q2_0, Q3_K y MXFP4 nativo), con un promedio de 2.25 bits por peso en la mitad correspondiente a expertos, mientras la mitad densa (atencion, experto compartido, cabeza de salida) se mantiene en Q8_0 y las normas, router y mHC en F32.

La relevancia actual del modelo radica en que demuestra que tecnicas de cuantizacion mixta por capa y por experto, combinadas con un motor de inferencia especializado (Xolotl, antiguamente Strata-DSV4.1), permiten ejecutar modelos de clase frontera en equipos de un solo usuario. La publicacion incluye builds V2, V3 y V4, un modo rapido opcional y una variante "uncensored" segun los tags del repositorio. La licencia declarada es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) transformer con atencion dispersa CSA, Hyper-Connections y memoria Engram |
| Parametros totales | 14.710.631.010 (safetensors del repo); 552B declarados por el autor para el modelo base |
| Parametros activos | top-6 expertos enrutados por token de 384 por capa (40 capas); no se especifica el total activo |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | PTQ1_0 ternario (1.75 bits), Q2_0 (2.25 bits), Q3_K (3.44 bits), MXFP4 nativo (4.25 bits); densa en Q8_0 (o Q6_K al cargar); embedding/compresor/indexer en F16; normas/router/mHC en F32 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Propietario de Xolotl (no es GGUF compatible con llama.cpp, Ollama ni LM Studio); repo de 532,3 GB |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4.1-Flash-1017 es un transformer MoE con 40 capas y 384 expertos enrutados por capa, con enrutamiento top-6 por token. Incorpora un experto compartido, Hyper-Connections, atencion dispersa CSA (probablemente "Compressed Sparse Attention" segun la nomenclatura del autor) y una memoria de n-gramas llamada Engram. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada.

La innovacion tecnica de esta publicacion no esta en el entrenamiento sino en la cuantizacion post-entrenamiento (PTQ). Cada experto recibe su propio formato segun su "temperatura" o frecuencia de activacion: los 1.056 expertos mas calientes se conservan en su MXFP4 nativo (repack lossless), los siguientes en Q3_K, y el resto se reparte entre Q2_0 y ternario PTQ1_0. El reparto declarado en V4 es 57,7% ternario, 22,7% Q2_0, 12,7% Q3_K y 6,9% MXFP4. La calibracion se realizo con un conjunto ampliado de datos reales de agente y codigo. Ademas, el autor publica un fichero de ranking de "hotness" de expertos (rank-1017-v4.bin) que el motor usa para decidir que expertos residen en VRAM y cuales se leen de RAM/NVMe.

El modo rapido opcional (v4-fast) sustituye los dos formatos de experto mas grandes (1.056 expertos FP4 nativos y 1.778 Q3_K) por copias en Q2_K construidas con una matriz de importancia derivada de 120 prompts de codigo y agente, aplicando la idea "compress-then-correct" de PROMETHEVS. Segun el autor, esto reduce a la mitad los bytes que cruzan el bus de RAM y la unidad NVMe por token, a costa de una perdida de calidad medida (top-1 87,01% a 86,16%; NLL 0,512 a 0,540).

## Capacidades

- Generacion de texto y razonamiento de proposito general, heredados del modelo base DeepSeek-V4.1-Flash-1017.
- Razonamiento multi-paso con modo "thinking" (el autor menciona "thinking on" en las pruebas del Gauntlet).
- Codigo y tareas de agente: el Gauntlet v3-small incluye tareas de codificacion evaluadas con tests ocultos.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible, aunque las tareas de agente evaluadas sugieren capacidad de interaccion con herramientas.
- Capacidades de agente en ejecuciones largas: el modo rapido esta pensado para "long agent runs, drafts and chat".
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible.
- Variante "uncensored": segun los tags, el autor ha eliminado o reducido los filtros de rechazo del modelo base, lo que afecta al comportamiento en dominios sensibles.

## Casos de uso

- Ejecucion local de un MoE de gran escala en un PC de consumo: el caso de uso central de la publicacion es correr un modelo de clase 552B en una RTX 4090 con 90 GB de RAM y NVMe, usando Xolotl como motor. Es adecuado para investigadores que quieran experimentar con modelos grandes sin acceso a clusters.
- Agentes de codificacion de larga duracion: el modo rapido (v4-fast) esta disenado para ejecuciones de agente con muchos turnos, donde el throughput de decodificacion importa mas que la fidelidad absoluta por token (41,1 tok/s frente a 32,6 tok/s en tareas del Gauntlet).
- Generacion de borradores y chat interactivo: el modo rapido, pese a ser lossy, mantiene una calidad aceptable (top-1 86,16%) y acelera la respuesta, por lo que sirve para prototipado y conversacion.
- Experimentacion con tecnicas de cuantizacion mixta: el repositorio documenta con detalle los formatos por experto, los rankings de hotness y las metricas de calidad, lo que lo convierte en material de referencia para quienes investigan PTQ agresiva en MoE.
- Evaluacion comparativa de motores de inferencia: al requerir Xolotl y no ser compatible con llama.cpp u Ollama, sirve para medir el rendimiento de motores especializados frente a runtimes genericos.
- Despliegue en entornos con restricciones de VRAM: la combinacion de VRAM (24 GB), RAM (90 GB) y NVMe permite servir el modelo en estaciones de trabajo modestas, util para laboratorios con presupuesto limitado.
- Investigacion sobre alineacion y censura: la variante "uncensored" puede usarse para estudiar el comportamiento del modelo sin filtros, con las advertencias eticas y legales correspondientes.

## Benchmarks y rendimiento

Los datos disponibles son mediciones internas del autor, no benchmarks estandar de la comunidad (MMLU, HumanEval, GSM8K no se reportan).

| Metrica | V4 normal | V4 fast | V3 |
|---|---:|---:|---:|
| Top-1 agreement con el modelo completo (7 filas held-out) | 85,7% | no disponible | 81,5% |
| Top-1 en short34 (RTX 4090, Q6_K dense, prompt 8K) | 87,01% | 86,16% | no disponible |
| NLL en short34 | 0,512 | 0,540 | no disponible |
| Decodificacion, prompt 8K (tok/s) | 26,1 | 33,0 (+27%) | no disponible |
| Gauntlet v3-small, tareas resueltas | 8/12 | 8/12 | no disponible |
| Gauntlet v3-small, score | 4,99 | 4,99 | no disponible |
| Decodificacion en tareas de agente (tok/s) | 32,6 | 41,1 (+26%) | no disponible |
| Top-1 con rank-1017-v4 (held-out) | 86,9% | no disponible | 86,8% (con rank v3) |
| KL con rank-1017-v4 | 0,306 | no disponible | 0,316 (con rank v3) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 24 GB (RTX 4090) segun el autor, con 90 GB de RAM y almacenamiento NVMe. El repo completo ocupa 532,3 GB; cada build V4 ocupa 163 GB y el modo rapido anade 40 GB.
- GPU recomendadas: RTX 4090 (24 GB) es el hardware de referencia. No se especifican A100, H100 ni otras GPU de datacenter en la informacion disponible.
- Cabe en GPU de consumo: si, en RTX 4090 con el esquema VRAM + RAM + NVMe descrito.
- Opciones de despliegue: exclusivamente Xolotl (antiguo Strata-DSV4.1), construido sobre Strata. No es compatible con llama.cpp, Ollama ni LM Studio porque usa tipos de cuantizacion por experto que esos runtimes no cargan.
- Latencia y throughput: 26,1 tok/s en modo normal y 33,0 tok/s en modo rapido con prompt de 8K en RTX 4090; 32,6 y 41,1 tok/s respectivamente en tareas de agente del Gauntlet.
- Almacenamiento: NVMe practicamente obligatorio, ya que el modelo y el modo rapido se leen del disco durante la decodificacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Compatibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-GSQ-Uncensored (esta ficha) | 552B declarados (MoE) | no disponible | Mixta 2,25 bits promedio en expertos | MIT | Solo Xolotl |
| DeepSeek-V4.1-Flash-1017 (base) | 552B declarados (MoE) | no disponible | FP8 / original | no disponible | Motores del autor original |
| Modelos GGUF de clase similar | no disponible | no disponible | Q2_K a Q8_0 | variable | llama.cpp, Ollama, LM Studio |

No se dispone de informacion suficiente para comparar con alternativas concretas de la misma categoria en parametros, contexto y rendimiento. La comparativa con el modelo base se limita a las metricas de fidelidad de cuantizacion reportadas por el autor.

## Limitaciones y advertencias

- La cuantizacion es extremadamente agresiva (2,25 bits promedio en expertos, 57,7% de pesos ternarios), lo que introduce perdida de calidad medible: el top-1 agreement con el modelo completo es del 85,7%, no del 100%.
- El modo rapido (v4-fast) es explicitamente lossy y opt-in; el autor recomienda usarlo solo donde "cada token no cuenta".
- No es compatible con llama.cpp, Ollama ni LM Studio; requiere Xolotl, lo que limita la portabilidad y crea dependencia de un motor mantenido por un unico autor.
- El modelo base es un MoE de 552B con 15.360 expertos enrutados; el rendimiento depende criticamente del ranking de hotness y del almacenamiento NVMe. Sin el fichero de ranking correcto se pierde velocidad.
- La variante "uncensored" elimina o reduce los filtros de rechazo, lo que aumenta el riesgo de generar contenido danino, sesgado o ilegal. No es apta para produccion sin moderacion adicional.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a los modelos de lenguaje y potencialmente amplificado por la cuantizacion.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento multilingue adecuado.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo ni sobre la calidad tras la cuantizacion.
- El repositorio tiene 532,3 GB; el almacenamiento y el ancho de banda de disco son un cuello de botella real en produccion.
- No se han publicado benchmarks estandar, por lo que la comparacion con otros modelos es dificil y las cifras del autor no son verificables de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IndrasMirror/DeepSeek-V4.1-Flash-1017-GSQ-Uncensored
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Motor Xolotl: https://github.com/Indras-Mirror/Xolotl
- Strata: https://github.com/Niko1221/Strata
- Documentacion del modo rapido: https://github.com/Indras-Mirror/Xolotl/blob/main/docs/XOLOTL_FAST.md
- Herramienta Gauntlet: https://github.com/Indras-Mirror/Xolotl/tree/main/tools/gauntlet
- PROMETHEVS (idea compress-then-correct): https://github.com/Magnvs7/Promethevs
- Paper referenciado en tags: arxiv:2605.00649 (no verificado en la informacion disponible)

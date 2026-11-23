# IndrasMirror/DeepSeek-V4.1-Flash-1017-GSQ-Uncensored

## Resumen

DeepSeek-V4.1-Flash-1017-GSQ-Uncensored es una cuantizacion mixta de precision extremadamente agresiva del modelo base DeepSeek-V4.1-Flash-1017, publicada por el usuario IndrasMirror. El modelo base es un MoE de gran escala (552B parametros segun la model card, aunque el dato de safetensors del repo indica 14.710.631.010 parametros, presumiblemente correspondiente a una particion o al subconjunto denso), con 40 capas y 384 expertos enrutados por capa (top-6 por token), atencion dispersa CSA, Hyper-Connections y una memoria n-gram denominada Engram.

La contribucion principal del autor es un esquema de cuantizacion por experto con cuatro niveles (ternario PTQ1_0, Q2_0, Q3_K y MXFP4 nativo) que reduce el peso medio a 2,25 bits por peso en los expertos, permitiendo ejecutar el modelo en una unica GPU de consumo (RTX 4090 de 24 GB) combinada con 90 GB de RAM y almacenamiento NVMe. El modelo no es compatible con llama.cpp, Ollama ni LM Studio: requiere el motor propietario Xolotl (antes Strata-DSV4.1), construido sobre Strata.

La version se distribuye en tres builds (V4, V3 y V2) mas un modo rapido opcional (v4-fast) que sustituye los dos formatos de experto mas grandes por copias Q2_K, logrando un incremento de velocidad de decodificacion del orden del 26-27 % a costa de una perdida de calidad controlada. La licencia es MIT y el modelo se presenta como "uncensored", lo que implica ausencia de filtros de rechazo en las respuestas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer con atencion dispersa CSA, Hyper-Connections y memoria n-gram Engram; 40 capas, 384 expertos enrutados por capa (top-6 por token) |
| Parametros totales | 552B segun model card; 14.710.631.010 segun safetensors del repo (dato no coincidente, ver advertencias) |
| Parametros activos | no disponible (top-6 de 384 expertos por capa, sin cifra oficial) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos: PTQ1_0 ternario (1,75 bits/peso), Q2_0 (2,25 bits/peso), Q3_K (3,44 bits/peso), MXFP4 nativo (4,25 bits/peso); media 2,25 bits/peso. Parte densa: Q8_0 (requantizable a Q6_K en carga). Embedding, compresor e indexer en F16; norms, router y mHC en F32 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Binario propietario para el motor Xolotl (no es GGUF estandar ni safetensors de inferencia); builds v4/, v4-fast/, v3/, v2/ |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4.1-Flash-1017 es un transformer de tipo mixture-of-experts con 40 capas y 384 expertos enrutados por capa, activando los 6 mas relevantes por token (15.360 expertos enrutados en total, con 543,6B pesos en expertos segun la model card), mas un experto compartido. Incorpora atencion dispersa CSA (presumiblemente una variante de atencion con seleccion de bloques), Hyper-Connections (conexiones residuales ampliadas entre capas) y una memoria n-gram llamada Engram. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO.

La innovacion de esta publicacion es puramente de compresion: cada proyeccion gate/up y down de cada experto recibe su propio formato de cuantizacion segun su "temperatura" (frecuencia de activacion), usando una matriz de importancia calibrada con datos reales de agente y codigo. Los 1.056 expertos mas calientes se conservan en su FP4 nativo (MXFP4, repack sin perdida) y el ahorro de bytes se obtiene ternarizando mas agresivamente los expertos frios. Ademas, el modo v4-fast aplica una tecnica de "comprimir y corregir" inspirada en PROMETHEVS (Ryan Flavell): una copia Q2_K de los expertos mas grandes se lee en lugar del original durante la decodificacion, con una matriz de importancia derivada de 120 prompts de codigo y agente.

## Capacidades

- Generacion de texto y razonamiento de proposito general, heredadas del modelo base DeepSeek-V4.1-Flash-1017.
- Razonamiento multi-paso con modo "thinking" activable (usado en las pruebas Gauntlet con thinking on).
- Generacion y edicion de codigo, incluyendo tareas de agente sobre repositorios (Gauntlet v3-small: 6 tareas dificiles evaluadas con tests ocultos, 10 turnos).
- Ejecucion de tareas agenticas de multiples turnos con tool use implicito en el flujo de agente evaluado.
- Comportamiento "uncensored": ausencia declarada de filtros de rechazo, lo que permite respuestas sin bloqueos por politica de contenido.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Vision, audio y otras modalidades: no disponibles.

## Casos de uso

- Ejecucion local de un MoE de gran escala en una workstation de consumo: el modelo esta disenado para correr en una RTX 4090 (24 GB) mas 90 GB de RAM y NVMe, lo que permite experimentar con un modelo de clase 500B+ sin cluster ni GPU de datacenter.
- Agentes de codigo autonomos en local: el modo fast decodifica a 41,1 tok/s en tareas de codigo del Gauntlet (frente a 32,6 en modo normal) resolviendo las mismas tareas (8/12), adecuado para bucles de agente largos donde la latencia de decodificacion domina.
- Investigacion sobre cuantizacion extrema: el esquema de cuatro niveles por experto y el modo shadow Q2_K son un caso de estudio reproducible para medir el impacto de la precision mixta en calidad (top-1 agreement 85,7 % frente al modelo completo en V4).
- Generacion de borradores y chat de larga duracion: el modo fast, declarado como lossy y opt-in, esta pensado para runs de agente largos, borradores y conversacion donde prima el throughput.
- Evaluacion de robustez y seguridad: al ser un modelo uncensored, sirve para estudiar comportamientos sin rechazo en entornos controlados de red teaming y analisis de sesgos.
- Despliegue en estaciones de trabajo con NVMe rapido: el motor lee pesos del disco durante la decodificacion, por lo que encaja en escenarios donde el almacenamiento es el cuello de botella y se prioriza capacidad sobre latencia minima.
- Prototipado de pipelines de agente con thinking mode: las pruebas del autor usan 10 turnos con razonamiento activado, lo que refleja un uso realista para orquestacion de tareas complejas.

## Benchmarks y rendimiento

Los unicos datos publicados son mediciones internas del autor sobre el modelo cuantizado, no benchmarks academicos estandar:

| Metrica | V4 normal | V4 fast | V3 |
|---|---:|---:|---:|
| Top-1 agreement con el modelo completo (7 filas held-out, ruta de referencia Python) | 85,7 % | no disponible | 81,5 % |
| Top-1 agreement (ranking v4 vs v3, filas held-out) | 86,9 % (rank v4) | no disponible | 86,8 % (rank v3) |
| KL divergence al modelo FP8 | 0,2306 (dense Q6_K) / 0,2281 (dense Q8_0) | no disponible | no disponible |
| Top-1 agreement vs FP8 (100 fixtures) | 85,76 % (Q6_K) / 85,87 % (Q8_0) | no disponible | no disponible |
| Decodificacion, prompt 8K, RTX 4090 | 26,1 tok/s | 33,0 tok/s (+27 %) | no disponible |
| short34 top-1 | 87,01 % | 86,16 % | no disponible |
| short34 NLL | 0,512 | 0,540 | no disponible |
| Gauntlet v3-small (6 tareas, 10 turnos, thinking on, 2 runs) | 8/12, score 4,99, 32,6 tok/s | 8/12, score 4,99, 41,1 tok/s | no disponible |

No se han publicado resultados de benchmarks academicos (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM: RTX 4090 de 24 GB segun el autor; el modo normal libera ~1,7 GB de VRAM al requantizar la parte densa a Q6_K, destinados a mas expertos en GPU.
- RAM: 90 GB recomendados junto a la GPU.
- Almacenamiento: NVMe obligatorio; los pesos se leen del disco durante la decodificacion. El build V4 ocupa 163 GB; v4-fast anade 40 GB adicionales.
- GPU recomendadas: RTX 4090 (configuracion validada por el autor). Otras GPU no estan documentadas.
- Cabe en GPU de consumo: si, en RTX 4090 con el esquema GPU + RAM + NVMe descrito.
- Despliegue: exclusivamente con el motor Xolotl (https://github.com/Indras-Mirror/Xolotl), sobre Strata. No es compatible con llama.cpp, Ollama, LM Studio, vLLM ni TGI.
- Latencia y throughput: 26,1 tok/s en modo normal y 33,0 tok/s en fast con prompt de 8K en RTX 4090; 32,6 y 41,1 tok/s respectivamente en tareas de agente del Gauntlet.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-GSQ-Uncensored (este) | 552B (MoE, top-6/384) | no disponible | MIT | Binario Xolotl | Cuantizacion mixta 2,25 bits/peso en expertos; corre en RTX 4090 + 90 GB RAM |
| DeepSeek-V4.1-Flash-1017 (base) | 552B (MoE, top-6/384) | no disponible | no disponible | safetensors / FP8 | Referencia de calidad; requiere hardware de datacenter |
| DeepSeek-V4.1-Flash-1017-XQ-Uncensored (build previo del mismo autor) | 552B (MoE) | no disponible | MIT | Binario Xolotl | Variante anterior de la misma familia de cuantizacion; V4 mejora top-1 de 81,5 % a 85,7 % frente a V3 |
| Alternativas de la misma categoria (MoE abiertos de gran escala) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Incompatibilidad de runtime: no funciona en llama.cpp, Ollama, LM Studio, vLLM ni TGI; depende de Xolotl, un motor mantenido por el propio autor, lo que introduce riesgo de mantenimiento y de bus factor.
- Discrepancia de parametros: la model card afirma 552B pero el dato de safetensors del repo indica 14.710.631.010; conviene verificar antes de planificar hardware.
- Cuantizacion extremadamente agresiva: el 57,7 % de los pesos de experto esta en ternario (1,75 bits/peso) y la media es 2,25 bits/peso; la calidad medida es 85,7 % de top-1 frente al modelo completo, no paridad.
- Modo fast lossy: la copia Q2_K de los expertos grandes degrada la calidad (top-1 86,16 % frente a 87,01 %, NLL 0,540 frente a 0,512) y anade 40 GB de almacenamiento; es opt-in y debe evitarse donde cada token cuenta.
- Modelo "uncensored": no aplica filtros de rechazo, lo que implica riesgo de generar contenido danino, sesgado o ilegal; no apto para exposicion directa a usuarios finales sin capa de moderacion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la cuantizacion a 2 bits puede amplificar errores en tareas de facto.
- Idiomas y contexto: no se documentan idiomas soportados ni longitud de contexto, lo que impide garantizar cobertura multilingue o ventanas largas.
- Licencia MIT: permite uso comercial, pero el modelo base y los datos de entrenamiento pueden tener condiciones adicionales no reflejadas en la model card; verificar la licencia del modelo base DeepSeek-V4.1-Flash-1017.
- Dependencia de NVMe: el rendimiento depende criticamente de la velocidad del disco; en almacenamiento lento el throughput caera por debajo de las cifras publicadas.
- Fecha de publicacion futura (2026): los datos deben tratarse como no verificados de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IndrasMirror/DeepSeek-V4.1-Flash-1017-GSQ-Uncensored
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Motor Xolotl: https://github.com/Indras-Mirror/Xolotl
- Documentacion del modo fast: https://github.com/Indras-Mirror/Xolotl/blob/main/docs/XOLOTL_FAST.md
- Herramienta Gauntlet: https://github.com/Indras-Mirror/Xolotl/tree/main/tools/gauntlet
- Strata: https://github.com/Niko1221/Strata
- PROMETHEVS (tecnica compress-then-correct): https://github.com/Magnvs7/Promethevs
- Paper referenciado en tags: arxiv:2605.00649 (no verificado)

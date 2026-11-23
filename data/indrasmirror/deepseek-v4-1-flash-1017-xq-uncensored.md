# IndrasMirror/DeepSeek-V4.1-Flash-1017-XQ-Uncensored

## Resumen

DeepSeek-V4.1-Flash-1017-XQ-Uncensored es una cuantizacion extrema y experimental del modelo MoE DeepSeek-V4.1-Flash-1017, publicada por el usuario IndrasMirror. Se trata de una compilacion mixta que combina expertos ternarios (PTQ1_0), 2-bit (Q2_0), 3-bit (Q3_K) y FP4 nativos (MXFP4), con el objetivo declarado de ejecutar un modelo de gran escala (552B parametros segun la model card; 14.710 millones reportados en safetensors) en una unica estacion de trabajo con una RTX 4090 de 24 GB, 90 GB de RAM y almacenamiento NVMe. No es un GGUF convencional: requiere el motor propietario Xolotl (antes Strata-DSV4.1) para cargar los formatos por experto.

El modelo base, DeepSeek-V4.1-Flash-1017, es un transformer con arquitectura MoE de 40 capas y 384 expertos enrutados por capa (top-6 por token), con un experto compartido, Hyper-Connections, atencion dispersa CSA y una memoria n-gram llamada Engram. La cuantizacion preserva los 1.056 expertos mas calientes en su FP4 nativo (MXFP4, repack sin perdida) y degrada progresivamente el resto, alcanzando una media de 2,25 bits por peso en la mitad de expertos.

La relevancia de esta ficha es doble: por un lado, documenta una tecnica de cuantizacion mixta por experto poco habitual (tier map con calibracion sobre datos de agentes y codigo); por otro, advierte de que el artefacto no es interoperable con llama.cpp, Ollama ni LM Studio, lo que limita su uso a un ecosistema de inferencia muy concreto. La model card reporta metricas de velocidad y calidad (86,9% top-1, KL 0,306) medidas por el autor, no por terceros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion dispersa CSA, Hyper-Connections y memoria n-gram Engram (modelo base) |
| Parametros totales | 552B segun model card; 14.710.631.010 reportados en safetensors |
| Parametros activos | top-6 de 384 expertos enrutados por capa (40 capas, 15.360 expertos enrutados, 543,6B pesos en expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | PTQ1_0 ternario (1,75 bits), Q2_0 (2,25 bits), Q3_K (3,44 bits), MXFP4 nativo (4,25 bits); densa en Q8_0 con re-cuantizacion opcional a Q6_K al cargar |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | binarios propios por experto (no GGUF estandar); requiere motor Xolotl |

## Arquitectura y entrenamiento

El modelo base es un MoE de 40 capas con 384 expertos enrutados por capa y seleccion top-6 por token, lo que suma 15.360 expertos enrutados y 543,6B pesos solo en expertos, mas un experto compartido. Incorpora Hyper-Connections, atencion dispersa CSA y una memoria n-gram Engram. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo original; esa informacion no esta disponible en los datos proporcionados.

La innovacion de esta publicacion es la cuantizacion por experto con un mapa de niveles (tier map) calibrado sobre datos reales de agentes y codigo. Cada experto recibe un formato distinto segun su "temperatura" de uso: los 1.056 mas calientes se conservan en MXFP4 nativo (repack sin perdida del FP4 de DeepSeek), mientras que el resto se reparte entre Q3_K (12,7% de los pesos), Q2_0 (22,7%) y PTQ1_0 ternario (57,7%). La mitad densa (atencion, experto compartido, cabeza de salida) va en Q8_0, con re-cuantizacion automatica a Q6_K al cargar mediante `STRATA_DENSE_REQUANT=q6_K`, lo que libera unos 1,7 GB de VRAM para mas expertos. Ademas, el autor publica un modo "fast" opcional (`v4-fast/`) que sustituye los dos formatos de experto mas grandes por copias Q2_K construidas con una matriz de importancia derivada de 120 prompts de codigo y agentes, inspirado en la idea "compress-then-correct" de PROMETHEVS.

## Capacidades

- Generacion de texto y razonamiento de proposito general, heredadas del modelo base DeepSeek-V4.1-Flash-1017.
- Razonamiento multi-paso con modo "thinking" activado en las pruebas de agente reportadas por el autor (Gauntlet v3-small, 10 turnos).
- Generacion y edicion de codigo, con tareas de agente evaluadas mediante tests ocultos.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion disponible, aunque el uso en tareas de agente lo sugiere.
- Capacidades de agente multi-turno: el autor reporta ejecucion de tareas agenticas de codigo con 10 turnos y thinking activo.
- Variante "uncensored": el autor la etiqueta como tal, sin detallar el proceso de edicion ni las capacidades afectadas.
- Capacidades multilingues: no disponible.

## Casos de uso

- Despliegue local de un MoE de gran escala en una unica estacion de trabajo: el caso central del artefacto es ejecutar un modelo de 552B parametros con una RTX 4090 (24 GB), 90 GB de RAM y NVMe, usando Xolotl con el mapa de niveles por experto. Es adecuado cuando no se dispone de un cluster multi-GPU y se acepta una perdida de calidad controlada.
- Agentes de codigo de larga duracion: el modo "fast" reporta 41,1 tok/s frente a 32,6 tok/s en tareas de codigo del Gauntlet, resolviendo 8/12 en ambos modos. Encaja en pipelines de agente que priorizan throughput sobre fidelidad token a token.
- Borradores y generacion asistida en chat: el modo "fast" esta pensado explicitamente para borradores y conversacion, donde la perdida de calidad (86,16% top-1 frente a 87,01%) es aceptable.
- Experimentacion en investigacion de cuantizacion: el mapa de niveles por experto (ternario, 2-bit, 3-bit, FP4 nativo) sirve como banco de pruebas para estudiar el impacto de la precision mixta en MoE.
- Evaluacion de motores de inferencia alternativos: util para comparar Xolotl frente a otros motores en escenarios de memoria limitada, dado que el artefacto no carga en llama.cpp ni Ollama.
- Pruebas de robustez y seguridad en modelos "uncensored": permite estudiar el comportamiento de un modelo editado para reducir rechazos, aunque el autor no documenta el metodo de edicion.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (no verificados por terceros):

| Metrica | V4 normal | V4 fast | V3 |
|---|---:|---:|---:|
| Top-1 agreement con el modelo completo (7 filas held-out) | 85,7% | no disponible | 81,5% |
| Top-1 agreement (rank V4, 25 oct) | 86,9% | no disponible | 86,8% (rank V3) |
| KL al modelo FP8 (rank V4 / V3) | 0,306 / 0,316 | no disponible | no disponible |
| Decode, 8K prompt, RTX 4090 | 26,1 tok/s | 33,0 tok/s (+27%) | no disponible |
| short34 top-1 | 87,01% | 86,16% | no disponible |
| short34 NLL | 0,512 | 0,540 | no disponible |
| Gauntlet v3-small (6 tareas, 10 turnos, 2 ejecuciones) | 8/12, score 4,99 | 8/12, score 4,99 | no disponible |
| Decode durante tareas de agente | 32,6 tok/s | 41,1 tok/s (+26%) | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 24 GB (RTX 4090) segun el caso de referencia del autor, con 90 GB de RAM del sistema y almacenamiento NVMe para los pesos.
- Almacenamiento: el build V4 ocupa 163 GB; V3, 163 GB; V2, 152 GB; el modo fast anade 40 GB adicionales.
- GPU recomendadas: RTX 4090 (24 GB) como minimo documentado. No se detallan otras GPU en la informacion disponible.
- Cabe en GPU consumer: si, en RTX 4090, con el motor Xolotl y el esquema de offload a RAM y NVMe.
- Opciones de despliegue: exclusivamente Xolotl (antes Strata-DSV4.1), sobre Strata. No es compatible con llama.cpp, Ollama ni LM Studio, ya que usa tipos de cuantizacion por experto que esos runtimes no cargan.
- Latencia y throughput: 26,1 tok/s en modo normal y 33,0 tok/s en fast con prompt de 8K en RTX 4090; 32,6 y 41,1 tok/s respectivamente durante tareas de agente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Despliegue |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-XQ (este) | 552B (MoE, top-6) | no disponible | Mixta por experto (ternario a FP4) | MIT | Xolotl |
| DeepSeek-V4.1-Flash-1017 (base) | 552B (MoE, top-6) | no disponible | FP8 / original | no disponible | Motores compatibles con DeepSeek |
| DeepSeek-V4.1-Flash-1017-XQ V3 | 552B (MoE, top-6) | no disponible | Mixta, sin FP4 nativo en expertos calientes | MIT | Xolotl |
| DeepSeek-V4.1-Flash-1017-XQ V2 | 552B (MoE, top-6) | no disponible | Mixta, 152 GB | MIT | Xolotl |

No se dispone de datos de benchmarks estandar para comparar con alternativas de la misma categoria; la comparativa se limita a builds del mismo autor y al modelo base.

## Limitaciones y advertencias

- No es un GGUF estandar: no carga en llama.cpp, Ollama ni LM Studio. El uso esta atado al motor Xolotl.
- La cuantizacion es agresiva (media de 2,25 bits por peso en expertos): la perdida de calidad respecto al modelo completo es medible (85,7% top-1 en V4), y el modo fast es deliberadamente lossy.
- El modo fast requiere Xolotl del 7 de noviembre o posterior y anade 40 GB de almacenamiento en NVMe.
- Las metricas de calidad y velocidad estan reportadas por el autor, no por terceros independientes; no hay benchmarks estandar publicados.
- El etiquetado "uncensored" implica un modelo editado para reducir rechazos, sin documentacion del metodo ni de los sesgos introducidos. Riesgo elevado de contenido inapropiado en produccion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no hay evaluacion especifica en la informacion disponible.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingue.
- Licencia MIT declarada, lo que permite uso comercial, pero el modelo base puede tener condiciones adicionales no reflejadas en esta ficha.
- El repositorio ocupa 532,3 GB en total; la descarga y el almacenamiento requieren planificacion.
- No hay informacion sobre sesgos, datos de entrenamiento ni proceso de alineacion del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/IndrasMirror/DeepSeek-V4.1-Flash-1017-XQ-Uncensored
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Motor Xolotl: https://github.com/Indras-Mirror/Xolotl
- Strata: https://github.com/Niko1221/Strata
- Documentacion del modo fast: https://github.com/Indras-Mirror/Xolotl/blob/main/docs/XOLOTL_FAST.md
- Herramienta Gauntlet: https://github.com/Indras-Mirror/Xolotl/tree/main/tools/gauntlet
- PROMETHEVS (idea compress-then-correct): https://github.com/Magnvs7/Promethevs
- Paper referenciado: arXiv:2605.00649 (segun tags del repositorio)

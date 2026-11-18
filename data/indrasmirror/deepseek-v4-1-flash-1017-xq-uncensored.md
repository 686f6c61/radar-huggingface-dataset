# IndrasMirror/DeepSeek-V4.1-Flash-1017-XQ-Uncensored

## Resumen

DeepSeek-V4.1-Flash-1017-XQ-Uncensored es una cuantización mixta y agresiva del modelo base `deepseek-ai/DeepSeek-V4.1-Flash-1017`, publicada por el usuario IndrasMirror bajo licencia MIT. El modelo original es un Mixture-of-Experts (MoE) de 552.000 millones de parámetros con 40 capas y 384 expertos enrutados por capa (top-6 por token), lo que suma 15.360 expertos enrutados con 543,6B de pesos, más un experto compartido, Hyper-Connections, atención dispersa CSA y una memoria n-gram denominada Engram. Esta versión cuantizada comprime el modelo hasta unos 163 GB (build V4) para que pueda ejecutarse en un solo PC de consumo.

La innovación central es el esquema de cuantización por experto en cuatro niveles: ternario PTQ1_0 (1,75 bits/peso), Q2_0 (2,25 bits/peso), Q3_K (3,44 bits/peso) y MXFP4 nativo sin tocar (4,25 bits/peso), con una media ponderada de 2,25 bits por peso en el conjunto de expertos. Los 1.056 expertos más "calientes" se conservan exactamente como los entrenó DeepSeek, mientras que los expertos fríos se degradan a ternario. La mitad densa (atención, experto compartido, cabeza de salida) se mantiene en Q8_0, re-cuantizable a Q6_K en carga.

El modelo está pensado para ejecutarse con Xolotl (antes Strata-DSV4.1), un motor específico que entiende los formatos por experto y descarga expertos desde NVMe en tiempo de decodificación. No es un GGUF estándar y no funciona en llama.cpp, Ollama ni LM Studio. Con 30.373 descargas y 61 likes en el momento de la consulta, es una propuesta de nicho para entusiastas con hardware de consumo que quieren ejecutar un MoE de escala frontier en local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención dispersa CSA, Hyper-Connections y memoria Engram |
| Parametros totales | 552B (repo safetensors reporta 14.710.631.010 tensores/parámetros en el archivo de metadatos; el modelo base es de 552B) |
| Parametros activos | top-6 de 384 expertos enrutados por capa (40 capas, 15.360 expertos enrutados) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | PTQ1_0 ternario (1,75 bits), Q2_0 (2,25 bits), Q3_K (3,44 bits), MXFP4 nativo (4,25 bits), densa Q8_0/Q6_K, embeddings/compressor/indexer F16, norms/router/mHC F32 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | Binario propio para Xolotl (no GGUF, no safetensors estándar en el build V4) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de 40 capas con 384 expertos enrutados por capa y enrutamiento top-6 por token, lo que da 15.360 expertos enrutados que contienen 543,6B de pesos, más un experto compartido siempre activo. Incorpora atención dispersa CSA (probablemente "Compressed Sparse Attention"), Hyper-Connections y una memoria n-gram llamada Engram. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO en el modelo base.

La cuantización XQ de IndrasMirror aplica un mapeo de "calor" por experto: los 1.056 expertos más utilizados se mantienen en su MXFP4 nativo (repack lossless), los 1.778 siguientes en Q3_K, y el resto se reparte entre Q2_0 y ternario PTQ1_0. Los bytes liberados por los expertos fríos financian la preservación de los calientes. La calibración se hizo con datos reales de agente y código. El build V4 incluye además un archivo de ranking de expertos (`rank-1017-v4.bin`, 123 KB) que mejora la selección de expertos en decodificación: 86,9% top-1 / KL 0,306 frente a 86,8% / 0,316 del ranking anterior. Existe un modo rápido opcional (`v4-fast/`, 40 GB adicionales) que sustituye los dos formatos de experto más grandes por Q2_K con una matriz de importancia de 120 prompts de código y agente, logrando 33,0 tok/s frente a 26,1 tok/s en una sonda de 8K de prompt (+27%), a costa de una pérdida de calidad (top-1 86,16% vs 87,01%, NLL 0,540 vs 0,512).

## Capacidades

- Generación de texto y razonamiento de escala frontier, heredados del modelo base DeepSeek-V4.1-Flash-1017.
- Razonamiento multi-paso con "thinking mode" (mencionado en las pruebas del Gauntlet: "thinking on").
- Codificación y tareas agénticas: el Gauntlet v3-small (6 tareas difíciles, 10 turnos, 2 ejecuciones) resolvió 8/12 tareas en modo normal y en modo rápido.
- Ejecución local en hardware de consumo: RTX 4090 (24 GB) + 90 GB de RAM + NVMe.
- Modo rápido opcional con decodificación a 41,1 tok/s en tareas de agente reales (frente a 32,6 tok/s en modo normal).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible explícitamente en la información proporcionada.
- Visión o audio: no disponible.

## Casos de uso

- Ejecución local de un MoE de escala frontier en un solo PC: con una RTX 4090, 90 GB de RAM y NVMe, el build V4 (163 GB) permite servir un modelo de 552B parámetros con decodificación de 26-33 tok/s, algo impensable con cuantizaciones estándar de 4 bits.
- Agentes de código autónomos: el Gauntlet v3-small demuestra que el modelo resuelve tareas de codificación multi-turno con thinking activado (8/12 tareas, score 4,99). El modo rápido sube a 41,1 tok/s manteniendo el mismo número de tareas resueltas, lo que lo hace viable para sesiones largas de agente.
- Asistente de programación en local sin enviar código a la nube: la licencia MIT y la ejecución local permiten integrarlo en entornos con requisitos de privacidad estrictos, usando el modo normal cuando cada token cuenta.
- Investigación sobre cuantización extrema: el esquema de cuatro niveles (ternario, 2-bit, 3-bit, FP4 nativo) y el archivo de ranking de expertos sirven como banco de pruebas para estudiar el impacto de la precisión mixta en MoE de gran escala.
- Generación de borradores y chat de larga duración: el modo rápido (`v4-fast/`) está pensado para "long agent runs, drafts and chat", donde la pérdida de calidad (top-1 86,16% vs 87,01%) es aceptable a cambio de +26-27% de velocidad.
- Despliegue en estaciones de trabajo con NVMe rápido: el motor Xolotl lee expertos desde disco durante la decodificación, por lo que un NVMe de alta velocidad es parte del stack; encaja en workstations con GPU de 24 GB y RAM abundante.
- Evaluación comparativa de motores de inferencia: al requerir Xolotl (no funciona en llama.cpp/Ollama/LM Studio), sirve para medir el rendimiento de motores especializados en MoE con descarga de expertos por capa.

## Benchmarks y rendimiento

Los datos disponibles son métricas internas de calidad de la cuantización y velocidad, no benchmarks estándar (MMLU, HumanEval, GSM8K).

| Metrica | V4 | V3 |
|---|---:|---:|
| Acuerdo top-1 con el modelo completo (7 filas held-out, ruta Python de referencia) | 85,7% | 81,5% |
| KL al modelo FP8 (100 fixtures, densa en Q8_0) | 0,2306 | no disponible |
| Acuerdo top-1 (100 fixtures, densa en Q8_0) | 85,76% | no disponible |
| Ranking de expertos v4 (held-out) | 86,9% top-1 / KL 0,306 | 86,8% / 0,316 (ranking v3) |

| RTX 4090, V4, densa Q6_K, prompt 8K | Decode | short34 top-1 | short34 NLL |
|---|---:|---:|---:|
| Normal | 26,1 tok/s | 87,01% | 0,512 |
| Fast | 33,0 tok/s (+27%) | 86,16% | 0,540 |

| Gauntlet v3-small (6 tareas, 10 turnos, thinking on, 2 ejecuciones) | Normal | Fast |
|---|---:|---:|
| Tareas resueltas | 8/12 | 8/12 |
| Score | 4,99 | 4,99 |
| Decode durante tareas | 32,6 tok/s | 41,1 tok/s (+26%) |

## Requisitos de hardware

- VRAM: RTX 4090 de 24 GB (referencia del autor). La mitad densa se re-cuantiza a Q6_K al cargar por defecto (`STRATA_DENSE_REQUANT=q6_K`), liberando unos 1,7 GB de VRAM para más expertos (+11% de decodificación tras un prompt de 6,5K).
- RAM: 90 GB en la configuración de referencia.
- Almacenamiento: NVMe obligatorio; el modelo (163 GB en V4, 152 GB en V2) y el modo rápido (40 GB adicionales) se leen desde disco durante la decodificación.
- GPU recomendadas: RTX 4090 (24 GB) es la referencia validada. No hay datos para A100, H100 u otras GPU en la información proporcionada.
- ¿Cabe en consumer GPU? Sí, en el sentido de que la GPU aloja la parte densa y los expertos se descargan desde RAM/NVMe; no cabe entero en VRAM.
- Opciones de despliegue: exclusivamente Xolotl (antes Strata-DSV4.1), construido sobre Strata. No es compatible con llama.cpp, Ollama ni LM Studio porque usa tipos de cuantización por experto que esos runtimes no cargan.
- Latencia y throughput: 26,1 tok/s (normal) y 33,0 tok/s (fast) con prompt de 8K en RTX 4090; 32,6 vs 41,1 tok/s en tareas de agente reales del Gauntlet.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017-XQ (este) | 552B MoE (top-6/384) | no disponible | MIT | Binario Xolotl | Cuantización mixta 1,75-4,25 bits, 163 GB |
| DeepSeek-V4.1-Flash-1017 (base) | 552B MoE | no disponible | no disponible en la información | safetensors | Modelo original sin cuantizar; requiere hardware de datacenter |
| Build V3 del mismo repo | 552B MoE | no disponible | MIT | Binario Xolotl | 163 GB, peor calidad (81,5% top-1 vs 85,7%) |
| Build V2 del mismo repo | 552B MoE | no disponible | MIT | Binario Xolotl | 152 GB, sin datos de calidad en la información |

No se dispone de datos de benchmarks estándar para comparar con alternativas de la misma categoría (por ejemplo, otros MoE cuantizados de gran escala); la comparación se limita a los builds del propio repositorio y al modelo base.

## Limitaciones y advertencias

- No es un GGUF estándar: no funciona en llama.cpp, Ollama ni LM Studio. Requiere Xolotl, lo que limita la portabilidad y el ecosistema de herramientas.
- La cuantización es muy agresiva (media de 2,25 bits por peso en expertos): el 57,7% de los pesos de experto está en ternario, con pérdida de calidad medible (85,7% de acuerdo top-1 con el modelo completo en V4).
- El modo rápido (`v4-fast/`) es lossy y opt-in; el propio autor recomienda usarlo solo para borradores, chat y sesiones largas de agente, no donde "cada token cuenta".
- El archivo de ranking de expertos debe coincidir con el build; usar el ranking de V3 con V4 funciona pero deja velocidad sobre la mesa.
- El modelo está etiquetado como "uncensored": no se detallan en la información proporcionada los mecanismos de seguridad ni los sesgos del modelo base, por lo que se debe evaluar el riesgo de contenido inapropiado antes de usarlo en producción.
- Riesgo de alucinación: no cuantificado en la información proporcionada; aplica el riesgo habitual de los LLM, agravado por la cuantización extrema.
- Idiomas soportados: no disponibles; no se puede confirmar el rendimiento multilingüe.
- Longitud de contexto: no disponible; el autor menciona pruebas con prompts de 6,5K y 8K, pero no se especifica el máximo.
- Licencia MIT: permite uso comercial, pero el modelo base y sus datos de entrenamiento pueden tener condiciones adicionales no detalladas en la información proporcionada.
- Requiere NVMe y 90 GB de RAM: no es un despliegue ligero; el rendimiento depende críticamente de la velocidad del disco.

## Enlaces

- Hugging Face: https://huggingface.co/IndrasMirror/DeepSeek-V4.1-Flash-1017-XQ-Uncensored
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Motor Xolotl: https://github.com/Indras-Mirror/Xolotl
- Strata: https://github.com/Niko1221/Strata
- Documentación del modo rápido: https://github.com/Indras-Mirror/Xolotl/blob/main/docs/XOLOTL_FAST.md
- Gauntlet: https://github.com/Indras-Mirror/Xolotl/tree/main/tools/gauntlet
- PROMETHEVS (idea compress-then-correct): https://github.com/Magnvs7/Promethevs
- Paper referenciado: arXiv:2605.00649

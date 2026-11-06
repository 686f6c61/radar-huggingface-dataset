# mhseo2/sft_olmo3base7b_olmo31think_ot3_p6272x2-step49

## Resumen

`sft_olmo3base7b_olmo31think_ot3_p6272x2-step49` es un ajuste fino supervisado (SFT) del modelo base Olmo-3-1025-7B, desarrollado por el usuario mhseo2 sobre la infraestructura del Barcelona Supercomputing Center (BSC MareNostrum 5). El objetivo concreto es destilar trazas de razonamiento matematico del modelo mayor `allenai/Olmo-3.1-32B-Think` en un modelo de 7.300 millones de parametros, usando prompts de matematicas del dataset OpenThoughts3.

Se trata de un checkpoint intermedio: el paso 49 de la primera epoca de un plan de 15 epocas, con un batch de 256 y una tasa de aprendizaje de 8e-5 con decaimiento coseno hasta 4e-5. El conjunto de datos efectivo fue de 12.544 muestras (6.272 prompts por dos trayectorias), aproximadamente 225 millones de tokens, filtradas por criterios estrictos de finalizacion, cierre unico de `</think>` y presencia de respuesta encajonada dentro de los 32.768 tokens.

Su relevancia es doble: por un lado, forma parte del ecosistema Olmo de AI2, totalmente abierto (pesos, datos y receta); por otro, demuestra una tecnica de destilacion de razonamiento a escala 7B con resultados medibles en benchmarks de competicion (AIME 2025, AIME 2026, HMMT Feb 2025). La licencia Apache 2.0 facilita su reutilizacion comercial, aunque el checkpoint es experimental y de corta madurez (49 pasos de entrenamiento).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Olmo 3, segun modelo base) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (limite usado en entrenamiento y evaluacion) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors, evaluado en float16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards, repo de 14,6 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base `mhseo2/Olmo-3-1025-7B-opd`, un transformer decoder-only de la familia Olmo 3 de AI2 con 7.298 millones de parametros. Sobre esa base se aplico un SFT con trazas de razonamiento generadas por `allenai/Olmo-3.1-32B-Think` (destilacion de razonamiento). El brazo de datos `p6272x2` contiene 6.272 prompts de matematicas de OpenThoughts3, cada uno con dos trayectorias muestreadas, totalizando 12.544 muestras (~225 millones de tokens). Solo se conservaron las trayectorias que terminan correctamente, cierran `</think>` exactamente una vez, incluyen una respuesta encajonada tras el cierre y caben en 32.768 tokens; ademas se aplico descontaminacion por n-gramas de 10 contra AIME 2025/2026 y HMMT Feb 2025.

El entrenamiento uso batch de 256, learning rate 8e-5 con decaimiento coseno a 4e-5, warmup del 3 %, weight decay 0,01 y 49 pasos por epoca (15 epocas planificadas). La infraestructura fue BSC MareNostrum 5 con 2 nodos de 4 H100 cada uno, FSDP y Ulysses sequence parallelism 2. El checkpoint publicado corresponde al paso 49 (final de la primera epoca), por lo que representa un estado temprano del proceso, no el modelo final. No se documentan tecnicas de RLHF/DPO ni innovaciones de atencion en la informacion disponible.

## Capacidades

- Razonamiento matematico con modo "thinking": genera trazas de razonamiento delimitadas por `</think>` antes de la respuesta final, imitando el comportamiento del profesor de 32B.
- Resolucion de problemas de competicion (AIME, HMMT) con formato de respuesta encajonada.
- Generacion de texto general heredada del base Olmo 3 (no validada especificamente en esta ficha).
- Plantilla de chat propia incluida (`chat_template.jinja`), necesaria para reproducir la evaluacion.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Evaluacion de destilacion de razonamiento: usar el checkpoint como referencia intermedia para estudiar como evoluciona la capacidad matematica a lo largo del SFT (paso 49 de 15 epocas), comparando con checkpoints posteriores del mismo autor.
- Generacion de soluciones paso a paso para problemas de matematicas de nivel olimpiada: el modelo produce trazas `</think>` con razonamiento explicito y respuesta encajonada, util para construir datasets de soluciones o para verificacion con `math_verify`.
- Base para ajuste adicional (continued SFT o RL): al ser un checkpoint temprano con licencia Apache 2.0, sirve como punto de partida barato para experimentos propios de RLVR o DPO sobre matematicas.
- Investigacion en descontaminacion de benchmarks: la receta documentada (filtro 10-gram contra AIME/HMMT) permite reproducir y auditar protocolos de limpieza de datos.
- Prototipado de asistentes de estudio matematico en local: con 7,3B parametros en float16 (~14,6 GB) cabe en GPUs de 24 GB y permite desplegar un tutor de matematicas con razonamiento visible sin dependencia de APIs.
- Reproduccion de resultados academicos: el autor publica hashes SHA256 de todos los ficheros y el commit del codigo (`mopdRL live tree f1bcc9eb...`), lo que facilita la replicacion exacta del checkpoint y de la evaluacion.

## Benchmarks y rendimiento

Resultados publicados por el autor: mean@8 accuracy (%), temperatura 0,6, top_p 0,95, prompt 768 tokens / respuesta 32.768 tokens, scorer `math_verify`, plantilla de chat del estudiante, ejecutado en Quadro RTX 6000 en float16.

| Benchmark | mean@8 (%) |
|---|---|
| AIME 2025 | 30,00 |
| AIME 2026 | 30,83 |
| HMMT Feb 2025 | 18,75 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada en float16: ~14,6 GB solo para pesos, mas KV cache para contexto de 32.768 tokens (varios GB adicionales segun batch).
- VRAM estimada en cuantizacion 8 bits: ~7,3 GB de pesos; en 4 bits: ~3,7 GB de pesos (estimacion teorica; no hay GGUF publicado ni cuantizaciones oficiales en el repo).
- GPU recomendadas para float16: A100 40/80 GB, H100 80 GB, L40S 48 GB, RTX 6000 Ada 48 GB; el autor evaluo en Quadro RTX 6000.
- Consumer GPU: cabe en RTX 4090 (24 GB) y RTX 3090 (24 GB) en float16 con contexto moderado; en contexto completo de 32K conviene cuantizar o reducir batch.
- Opciones de despliegue: transformers + safetensors de forma nativa; vLLM y TGI son compatibles con arquitecturas Olmo (no verificado para este checkpoint concreto); llama.cpp/Ollama requeririan conversion a GGUF, no disponible en el repo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| sft_olmo3base7b_olmo31think_ot3_p6272x2-step49 | 7,30B | 32.768 | Apache 2.0 | Checkpoint SFT paso 49, mean@8 AIME 2025 30,00 % |
| allenai/Olmo-3.1-32B-Think (profesor) | 32B (no confirmado en la informacion) | no disponible | no disponible | Modelo fuente de las trazas de razonamiento |
| mhseo2/Olmo-3-1025-7B-opd (base) | 7,30B | no disponible | no disponible | Modelo base sobre el que se aplica el SFT |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Checkpoint intermedio: solo 49 pasos (primera de 15 epocas); el rendimiento puede estar muy por debajo del modelo final del plan de entrenamiento.
- Especializado en matematicas: el SFT se hizo exclusivamente sobre OpenThoughts3; el rendimiento en tareas generales, codigo o conversacion no esta validado y podria haberse degradado respecto al base.
- Riesgo de alucinacion en razonamientos: al imitar trazas de un profesor de 32B, el modelo puede producir cadenas de razonamiento plausibles pero incorrectas, especialmente fuera de la distribucion de AIME/HMMT.
- Idiomas no declarados: no hay garantia de comportamiento multilingue; la evaluacion se hizo en ingles (prompts de OpenThoughts3).
- Contexto limitado a 32.768 tokens en entrenamiento y evaluacion; no se documenta soporte de contextos mayores.
- Sin cuantizaciones oficiales ni GGUF: el despliegue en hardware modesto requiere conversion manual.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el profesor deben verificarse por separado (no se detalla su licencia en la informacion disponible).
- Repositorio con muy poca traccion (33 descargas, 0 likes) y sin pipeline declarado: no hay garantia de mantenimiento ni soporte.
- La model card no incluye analisis de sesgos; se desconoce el comportamiento en dominios sensibles.

## Enlaces

- Hugging Face: https://huggingface.co/mhseo2/sft_olmo3base7b_olmo31think_ot3_p6272x2-step49
- Modelo base: https://huggingface.co/mhseo2/Olmo-3-1025-7B-opd
- Modelo profesor (referenciado): https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Dataset OpenThoughts3 (referenciado): https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M
- Codigo de entrenamiento: `mopdRL` live tree `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4` (paquete `bsc-olmo-base-opd-2026-10-26`); no se proporciona URL en la informacion disponible.

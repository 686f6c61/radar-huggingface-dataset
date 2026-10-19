# RadixArk/Muse-Spark-Open-last4-partial

## Resumen

Muse-Spark-Open-last4-partial es un checkpoint parcial publicado por RadixArk que contiene únicamente 4 de las 62 capas del decodificador de Muse Spark Open (meta-models/Muse-Spark-Open-816B-A42B), un modelo MoE multimodal de 816 B de parámetros totales y 42 B activos. Las capas incluidas son las 58 a 61 del modelo base, renumeradas 0 a 3; el resto de tensores (embeddings, norma final, LM head y torres de visión y audio) se mantienen intactos. El resultado pesa 58.045.384.704 parámetros (~58,0 B) en 12 shards safetensors que ocupan 108 GiB.

El propio autor advierte de que no es un modelo de lenguaje utilizable: sus generaciones carecen de sentido. Su proposito es servir como banco de pruebas para validar pipelines de entrenamiento y de serving en un solo nodo de 8 GPU, sin tener que desplegar el modelo completo. Es util ahora porque permite iterar sobre paralelismo (TP/PP/EP), carga de checkpoints, rollout y plantillas de chat con un coste de hardware y de almacenamiento mucho menor que el modelo base.

La relevancia tecnica esta en que conserva la estructura del modelo original: el schedule de atencion (calculo desde arriba), las listas por capa de `layer_types`, `layer_rope_theta` y `mlp_layer_types`, los routers MoE en FP32, las torres multimodales y el tokenizer y chat template del base. Eso lo convierte en un sustituto realista para pruebas de integracion, no en un modelo para producir texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE (heredada del modelo base); este checkpoint contiene 4 capas de decodificador |
| Parametros totales | 58.045.384.704 (~58,0 B), segun safetensors |
| Parametros activos | no disponible para este checkpoint; el modelo base se denomina 816B-A42B (42 B activos) |
| Capas del decodificador | 4 (capas 58-61 del base, renumeradas 0-3); `text_config.num_hidden_layers` = 4 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; los pesos se publican en BF16, salvo los routers MoE (pesos y sesgos) que se mantienen en FP32 |
| Idiomas soportados | no disponible |
| Licencia | Muse Model License (`license: other`), con `LICENSE.md` y `USE_POLICY.md` |
| Formato de pesos | safetensors (12 shards, 108 GiB; repositorio de 116,1 GB) |
| Atencion | sliding-window en las capas 0-2; atencion completa sin codificacion posicional en la capa 3 |
| Modalidades | texto, vision y audio (torres de vision y audio incluidas sin modificar) |
| Tokenizer y plantillas | los del modelo base, sin cambios (tokenizer, chat template, processor y generation config) |
| Pipeline de HuggingFace | no disponible |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only con mezcla de expertos (MoE) de 816 B de parametros totales y 42 B activos, con 62 capas de decodificador y torres multimodales de vision y audio. La atencion no es uniforme: el schedule se define contando desde la parte superior de la pila, de modo que las tres primeras capas del slice (58-60 en el base) usan sliding-window attention y la ultima (61) usa atencion completa sin codificacion posicional. Las listas por capa `layer_types`, `layer_rope_theta` y `mlp_layer_types` se han recortado para reflejar solo las cuatro capas conservadas, de forma que el grafo resultante es coherente con el original.

El checkpoint se extrajo del modelo base en la revision `e80856c8` mediante `scripts/muse_spark/extract_partial_checkpoint.py`, del branch `muse-spark-open` de Miles. No se ha publicado informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) del modelo base, por lo que esos datos no estan disponibles. La innovacion practica del artefacto es el propio proceso de extraccion: permite generar slices con el schedule de atencion intacto y reutilizar el mismo codigo de carga para entrenamiento con paralelismo combinado (tensor, pipeline y experto) y para rollout.

## Capacidades

Este checkpoint no es un modelo de lenguaje utilizable: el autor indica explicitamente que sus generaciones carecen de sentido. Las capacidades que se enumeran a continuacion corresponden a lo que el artefacto conserva estructuralmente o hereda del modelo base, no a comportamiento verificado en inferencia.

- Carga de un grafo MoE multimodal completo a nivel de configuracion: embeddings, norma final, LM head y torres de vision y audio estan presentes y sin modificar.
- Compatibilidad con el tokenizer, el chat template, el processor y el generation config del modelo base.
- Ejecucion del schedule de atencion hibrido (sliding-window + atencion completa sin codificacion posicional) en las cuatro capas.
- Soporte de paralelismo combinado tensor (TP), pipeline (PP) y experto (EP) bajo Miles y Ray, con `decoder-first-last-pipeline-num-layers` configurable.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): las torres de vision y audio estan presentes en el checkpoint, pero no hay informacion sobre el comportamiento resultante.

## Casos de uso

- Smoke test de pipelines de RL: el README documenta un test de 3 rollouts con 4 prompts y 4 muestras por prompt en un nodo de 8 H200; sirve para verificar de extremo a extremo el bucle de generacion, recompensa y actualizacion sin desplegar 816 B.
- Validacion de configuraciones de paralelismo: permite comprobar combinaciones de TP=4, PP=2, EP=4 y reparto de primeras/ultimas capas de pipeline antes de aplicarlas al modelo completo, donde un error de configuracion cuesta ordenes de magnitud mas.
- Integracion continua de codigo de carga de checkpoints: al mantener 12 shards safetensors, embeddings, LM head y routers en FP32, sirve como fixture de regresion para detectar roturas en el loader cuando cambia el formato o el mapeo de nombres de tensores.
- Pruebas de extraccion y reempaquetado: valida `extract_partial_checkpoint.py` y cualquier herramienta de conversion propia; el propio repositorio es el resultado de ese proceso y sirve como referencia de que el schedule de atencion se preserva.
- Validacion de soporte multimodal en serving: al incluir las torres de vision y audio sin tocar, permite probar el enrutado de entradas multimodales y el processor asociado en un nodo pequeno.
- Pruebas de tokenizer y plantillas de chat: al reutilizar los ficheros del base (incluida la plantilla de la revision `0fb02478`), se puede verificar el formateo de conversaciones y la serializacion de prompts en el mismo entorno que produccion.
- Formacion y demos de sharding: util para explicar en un taller como se reparte un MoE de gran tamano entre GPUs sin necesidad de recursos de cluster.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que las generaciones del checkpoint no tienen sentido, por lo que las metricas de calidad (MMLU, HumanEval, GSM8K u otras) no serian aplicables a este artefacto. El unico dato operativo publicado es la configuracion de prueba: 3 rollouts, batch de 4, 4 muestras por prompt, en 1 nodo de 8 H200 con TP=4, PP=2 y EP=4. No se proporcionan cifras de latencia ni de throughput.

## Requisitos de hardware

- Pesos: 108 GiB en BF16 (12 shards); el repositorio completo ocupa 116,1 GB.
- Configuracion de referencia del autor: 1 nodo con 8 GPU H200, tensor-model-parallel-size 4, pipeline-model-parallel-size 2, expert-model-parallel-size 4 y `decoder-first-last-pipeline-num-layers` 2. Con ese reparto, cada rank aloja aproximadamente 13,5 GiB de pesos, mas activaciones y buffers.
- VRAM estimada: al menos ~108 GiB agregados solo para pesos; por debajo de 8 GPU de 80 GB no hay configuracion documentada.
- GPU recomendadas: H200 (configuracion validada). A100 80 GB resulta plausible por capacidad, pero no esta documentado en la informacion disponible.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en tarjetas de 48 GB sin cuantizacion y offloading agresivos, que no estan soportados ni probados segun la informacion disponible.
- Opciones de despliegue: Miles (branch `muse-spark-open`) sobre Ray, con el tipo de modelo `muse-spark-last4-partial`. vLLM, llama.cpp, Ollama y TGI: no disponible para este checkpoint.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se han identificado en la informacion disponible otros checkpoints parciales publicos comparables. La referencia natural es el modelo base del que se extrae.

| Modelo | Parametros | Capas | Contexto | Licencia | Proposito |
|---|---|---|---|---|---|
| Muse-Spark-Open-last4-partial (este) | 58,0 B | 4 (58-61 del base) | no disponible | Muse Model License | Pruebas de pipelines en 1 nodo de 8 GPU; no genera texto util |
| Muse-Spark-Open-816B-A42B (base) | 816 B (42 B activos) | 62 | no disponible | Muse Model License | Modelo multimodal completo |
| Otros checkpoints parciales publicos | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje utilizable: el autor afirma que sus generaciones son sin sentido. No debe desplegarse en ninguna aplicacion de usuario final.
- Al conservar solo 4 de 62 capas, la profundidad efectiva es insuficiente para producir representaciones utiles; el LM head y los embeddings siguen dimensionados para el modelo completo.
- Sesgos conocidos: no disponible. Al no poder generar texto coherente, no se pueden caracterizar sesgos de salida en este checkpoint.
- Riesgo de alucinacion: no aplica en el sentido habitual, pero cualquier salida sera ruido; no debe interpretarse como respuesta.
- Limitaciones de contexto e idioma: no disponible.
- Licencia: Muse Model License (`license: other`), no es una licencia open source estandar. Antes de cualquier uso, incluso interno, hay que revisar `LICENSE.md` y `USE_POLICY.md`; las restricciones de uso comercial no se detallan en la informacion disponible.
- El checkpoint depende de un tipo de modelo especifico (`muse-spark-last4-partial`) en Miles; no es cargable con loaders genericos sin adaptacion.
- El repositorio registra 0 descargas y 0 likes y fue creado el 2026-10-19, por lo que no hay validacion de la comunidad ni soporte documentado mas alla del README.
- Los routers MoE se mantienen en FP32: cualquier conversion a BF16 o a cuantizacion de menor precision debe tratar esos tensores aparte para no degradar el enrutado.
- La fecha de creacion y el tamaÃ±o del repositorio deben verificarse antes de usarlo en produccion, dado que el artefacto no ha pasado por un proceso de revision publica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RadixArk/Muse-Spark-Open-last4-partial
- Modelo base: https://huggingface.co/meta-models/Muse-Spark-Open-816B-A42B
- Licencia: https://huggingface.co/RadixArk/Muse-Spark-Open-last4-partial/blob/main/LICENSE.md
- Politica de uso: https://huggingface.co/RadixArk/Muse-Spark-Open-last4-partial/blob/main/USE_POLICY.md
- Script de extraccion: https://github.com/radixark/miles/blob/muse-spark-open/scripts/muse_spark/extract_partial_checkpoint.py
- Repositorio Miles: https://github.com/radixark/miles

# hector-gr/RLCR-Gemma-4-E2B-it-HotpotQA-seed44

## Resumen

RLCR Gemma 4 E2B-it HotpotQA seed 44 es un ajuste fino del modelo Google Gemma 4 E2B-it realizado por Hector G. Rodriguez (usuario `hector-gr`) para que verbalice su propia confianza al responder preguntas. El modelo se entrena con CARE (Cross-question Abstention Reward Estimation), una variante de RLCR (Reinforcement Learning with Confidence Rewards) que sustituye la recompensa binaria por pregunta por una recompensa relativa al conjunto de preguntas, permitiendo umbrales de abstención calibrados segun la tolerancia al riesgo del usuario.

El objetivo es la prediccion selectiva: el modelo emite una respuesta junto con un score de confianza, de modo que un sistema pueda descartar o derivar a un humano las respuestas con baja confianza. Segun la model card, CARE eleva la cobertura a un 5% de riesgo (C@5) de 0,8% a 42,4% en benchmarks de matematicas y de 12,3% a 23,6% en benchmarks OOD de conocimiento general, razonamiento y matematicas, en comparacion con recompensas puntuales de acierto binario.

El checkpoint concreto corresponde a la semilla 44 del entrenamiento sobre HotpotQA (`mehuldamani/hotpot_qa`). Es un modelo de 5.506.950.723 parametros en formato safetensors, con licencia Apache 2.0, y requiere un runtime compatible con Gemma 4. El ajuste es solo de texto: los codificadores de vision y audio permanecen congelados y no se han evaluado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Gemma 4 E2B-it; detalles de la arquitectura base no disponibles) |
| Parametros totales | 5.506.950.723 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la evaluacion usa un limite de generacion de 4096 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Google Gemma 4 E2B-it (revision `70af34e20bd4b7a91f0de6b22675850c43922a03`) y aplica un post-entrenamiento con RLCR, segun el paper *Cross-Question Reliable Reinforcement Learning* de Hector G. Rodriguez y Marcus Rohrbach. RLCR se apoya en el trabajo previo *Beyond Binary Rewards: Training LMs to Reason About Their Uncertainty* (Damani et al., 2025). La innovacion de CARE es calcular las recompensas sobre un conjunto de pares pregunta-respuesta: para cada tolerancia al riesgo se induce un umbral de abstencion a partir de las confianzas del conjunto, y cada confianza se recompensa por situarse en el lado correcto de ese umbral, en lugar de empujarla hacia 1 o 0 en funcion de su acierto individual.

El entrenamiento se realizo sobre el dataset HotpotQA (`mehuldamani/hotpot_qa`), QA multihop sobre Wikipedia. La configuracion esta en `training_config.yaml`: batch por dispositivo de 4, acumulacion de gradientes de 128 y longitud maxima de completado de 1536 tokens. El ajuste es exclusivamente de texto; los codificadores de vision y audio del modelo base se congelaron. No se dispone de informacion sobre el numero total de tokens de entrenamiento ni sobre la composicion completa del dataset mas alla de HotpotQA.

## Capacidades

- Generacion de texto conversacional con salida estructurada que incluye `<answer>...</answer>` y `<confidence>...</confidence>`.
- Estimacion verbalizada de la confianza en la propia respuesta, calibrada para prediccion selectiva con umbrales de riesgo.
- Razonamiento multihop sobre conocimiento de Wikipedia (entrenado especificamente en HotpotQA).
- Capacidad de responder preguntas de conocimiento general, razonamiento y matematicas (evaluado en OOD sobre math-500, gsm8k, commonsenseqa, gpqa, simpleqa y trivia).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidades especiales: el modelo base es image-text-to-text (vision y audio), pero en este checkpoint esos modulos estan congelados y su uso multimodal no ha sido evaluado.

## Casos de uso

- Prediccion selectiva en produccion: el modelo responde y emite una confianza que un orquestador compara con un umbral calibrado en datos de validacion; las respuestas por debajo del umbral se derivan a un humano o a un modelo mayor, reduciendo el riesgo de error en sistemas de alto impacto.
- Enrutamiento entre modelos (cascada): usar las confianzas para decidir si la respuesta de este modelo de 5,5B parametros es suficiente o si conviene escalar a un modelo mas grande, optimizando coste y latencia.
- QA sobre documentacion y bases de conocimiento internas: su entrenamiento en HotpotQA lo hace adecuado para preguntas que requieren combinar informacion de varias fuentes, con un score de confianza por respuesta.
- Moderacion de calidad en pipelines de anotacion: filtrar automaticamente las respuestas de baja confianza antes de que lleguen a revision humana, priorizando las inciertas.
- Investigacion en calibracion e incertidumbre: punto de partida reproducible (semilla 44) para comparar metodos de recompensa de confianza (CARE frente a recompensas binarias) en entornos controlados.
- Asistentes conversacionales con abnegacion explicita: el modelo puede indicar que no sabe o derivar la pregunta cuando su confianza es baja, mejorando la experiencia en dominios sensibles.
- Evaluacion de riesgo en respuestas factuales: usar la confianza como senal auxiliar en sistemas de verificacion de hechos, combinada con recuperacion externa.

## Benchmarks y rendimiento

Resultados de prediccion selectiva del checkpoint (valores en %; C@r es cobertura con riesgo r; AURC menor es mejor). ID corresponde a `hotpot-judge`; OOD agrega math-500, gsm8k, commonsenseqa, gpqa, simpleqa y trivia.

| Metrica | ID | OOD |
|---|---:|---:|
| C@0 | 0,0 | 0,0 |
| C@1 | 0,0 | 0,0 |
| C@5 | 0,0 | 6,6 |
| C@10 | 94,5 | 13,8 |
| AURC (menor es mejor) | 6,8 | 35,8 |
| Exactitud (Acc) | 88,2 | 56,1 |

La model card indica que la tabla de Gemma del paper reporta la media de las semillas 43 y 44, por lo que los valores anteriores corresponden solo a la semilla 44. No se han publicado en la informacion disponible resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K) para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, 5,5B parametros en bf16 requieren aproximadamente 11 GB de pesos, mas cache KV y overhead; en cuantizacion de 8 bits rondaria 6-7 GB y en 4 bits unos 3-4 GB, aunque no se han publicado cuantizaciones para este checkpoint.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, cabria esperar ejecucion en GPU de consumo con suficiente VRAM, pero no hay validacion publicada.
- Cabe en consumer GPU: no confirmado; el repo ocupa 11,0 GB en safetensors, lo que sugiere pesos en bf16/fp16.
- Opciones de despliegue: transformers (libreria declarada). Requiere un runtime compatible con Gemma 4; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles.
- Requisitos de generacion: usar el system prompt exacto de `system_prompt.txt`, la plantilla de chat guardada y todos los EOS IDs de `generation_config.json`; evaluacion con una completion, temperatura 0 y limite de 4096 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RLCR Gemma 4 E2B-it HotpotQA seed 44 | 5,5B | no disponible | Ajuste RLCR/CARE para confianza verbalizada | Apache 2.0 | Hugging Face (`hector-gr/...`) |
| Google Gemma 4 E2B-it (base) | no disponible | no disponible | Modelo instructivo multimodal image-text-to-text | Apache 2.0 | Hugging Face (Google) |
| RLCR baseline (Damani et al., 2025) | no disponible | no disponible | Recompensa binaria de confianza por pregunta | no disponible | no disponible |

No se dispone de datos de rendimiento de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa mas alla de los resultados del propio checkpoint.

## Limitaciones y advertencias

- El score de confianza no es una garantia de correccion; debe calibrarse un umbral sobre datos held-out adecuados antes de usarlo en produccion.
- El ajuste es solo de texto: los codificadores de vision y audio estan congelados y el uso multimodal no ha sido evaluado, pese a que el modelo base es image-text-to-text.
- Requiere un runtime compatible con Gemma 4 y el uso exacto del system prompt, la plantilla de chat y los EOS IDs; desviarse de esta configuracion puede degradar la calibracion.
- El entrenamiento se limita a HotpotQA; el rendimiento OOD es notablemente inferior (Acc 56,1% frente a 88,2% ID) y la cobertura a bajo riesgo en OOD es muy baja (C@5 = 6,6%).
- Los resultados publicados corresponden a una unica semilla (44); la variabilidad entre semillas no se documenta en esta ficha.
- No se dispone de informacion sobre sesgos, idiomas soportados ni riesgos de alucinacion especificos de este checkpoint; se heredan los del modelo base Gemma 4 E2B-it.
- Licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y modificacion del modelo base; el paper de RLCR y el trabajo de Damani et al. deben citarse segun corresponda.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion ni validacion independiente.

## Enlaces

- Hugging Face: https://huggingface.co/hector-gr/RLCR-Gemma-4-E2B-it-HotpotQA-seed44
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/mehuldamani/hotpot_qa
- Paper CARE / RLCR: *Cross-Question Reliable Reinforcement Learning*, Hector G. Rodriguez y Marcus Rohrbach (enlace no disponible en la informacion proporcionada)
- Trabajo previo RLCR: *Beyond Binary Rewards: Training LMs to Reason About Their Uncertainty*, Damani et al., 2025 (enlace no disponible en la informacion proporcionada)

# hector-gr/CARE-Gemma-4-E2B-it-HotpotQA-seed44

## Resumen

CARE-Gemma-4-E2B-it-HotpotQA-seed44 es un ajuste fino de Google DeepMind Gemma 4 E2B-it realizado por Hector G. Rodriguez (con Marcus Rohrbach como coautor del metodo) para verbalizar la confianza del modelo en sus propias respuestas. El modelo se entrena sobre HotpotQA (QA multi-salto sobre Wikipedia) con la tecnica CARE (Cross-question Abstention Reward Estimation), que recompensa las confidencias de forma relativa dentro de un conjunto de preguntas en lugar de compararlas contra la etiqueta binaria de acierto de cada pregunta individual. El objetivo es habilitar selective prediction: responder solo cuando el modelo es fiable y abstenerse o derivar cuando no lo es.

El checkpoint tiene 5.506.950.723 parametros en safetensors (11 GB de repo), hereda la arquitectura multimodal de Gemma 4 E2B-it (image-text-to-text) y la licencia Apache 2.0 del modelo base. Es relevante porque ataca un problema practico de produccion: los LLM tienden a sobreconfiar, y los rewards binarios tradicionales empujan las confidencias a 0 y 1, destruyendo la informacion de ranking necesaria para fijar umbrales de absteccion con tolerancia al riesgo no nula.

El modelo emite la respuesta dentro de etiquetas `<answer>...</answer>` y la confianza dentro de `<confidence>...</confidence>`, y esta pensado para ordenar respuestas por confianza y aplicar un umbral calibrado sobre datos held-out. Es un checkpoint de investigacion (0 descargas, 0 likes en el momento de la ficha), no un modelo generalista de proposito comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 E2B-it), fine-tune de post-entrenamiento con RL (CARE) |
| Parametros totales | 5.506.950.723 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la evaluacion usa limite de generacion de 4096 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 E2B-it (revision `70af34e20bd4b7a91f0de6b22675850c43922a03`), un modelo multimodal image-text-to-text de Google DeepMind. El post-entrenamiento es exclusivamente de texto: los encoders de vision y audio se congelaron y el uso multimodal no fue evaluado. El fine-tune se realiza sobre el dataset `mehuldamani/hotpot_qa` (QA multi-salto sobre Wikipedia) con la tecnica CARE, descrita en el paper *Cross-Question Reliable Reinforcement Learning* de Hector G. Rodriguez y Marcus Rohrbach, y que se apoya en el trabajo RLCR (*Beyond Binary Rewards: Training LMs to Reason About Their Uncertainty*, Damani et al., 2025).

La innovacion central de CARE es que el reward no se calcula por par pregunta-respuesta de forma aislada, sino sobre un conjunto: para cada una de varias tolerancias al riesgo, las confidencias del conjunto inducen un umbral de absteccion y cada confianza se recompensa por situarse en el lado correcto del umbral. Asi, cada confianza verbalizada se refuerza en relacion con las de otras preguntas, no contra su propia etiqueta binaria de correccion. La configuracion de entrenamiento esta en `training_config.yaml`: batch por dispositivo 4, acumulacion de gradientes 128 y longitud maxima de completion 1536.

## Capacidades

- Generacion de texto y QA multi-salto sobre conocimiento general y Wikipedia.
- Verbalizacion de confianza: emite `<answer>...</answer>` y `<confidence>...</confidence>` en la misma completion.
- Selective prediction: permite ordenar respuestas por confianza y fijar umbrales de absteccion o derivacion a humano/modelo mas fuerte.
- Razonamiento de tipo QA sobre benchmarks de conocimiento general, razonamiento y matematicas (segun la evaluacion OOD reportada).
- Capacidades multimodales heredadas de Gemma 4 E2B-it: presentes en la arquitectura pero no evaluadas en este checkpoint (encoders congelados).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Enrutado con absteccion en pipelines de QA: ejecutar el modelo sobre una pregunta, leer la confianza verbalizada y derivar a un humano o a un modelo mayor cuando la confianza cae por debajo de un umbral calibrado en held-out. Es el caso de uso central del paper.
- QA sobre documentacion interna con control de riesgo: en un corpus de tipo Wikipedia o documentacion tecnica, ordenar respuestas por confianza y servir solo las que superan el umbral de riesgo tolerado (por ejemplo, 5% o 10%).
- Filtrado de candidatos en sistemas de retrieval-augmented generation: usar la confianza como señal de reranking para descartar respuestas poco fiables antes de mostrarlas al usuario.
- Investigacion en calibracion y selective prediction: sirve como checkpoint de referencia para comparar rewards binarios frente a CARE en tareas de QA multi-salto, con semilla fija (seed 44) para reproducibilidad.
- Evaluacion de riesgo en entornos regulados: en escenarios donde una respuesta incorrecta tiene coste alto, el modelo permite medir cobertura a una tolerancia de riesgo dada (C@r) y documentar el comportamiento del sistema.
- Generacion de conjuntos de datos con etiquetas de confianza: producir pares respuesta-confianza para entrenar o validar modelos de enrutado y de deteccion de incertidumbre.

## Benchmarks y rendimiento

Resultados de selective prediction reportados en la model card para este checkpoint (todas las cifras en %; C@r es cobertura al riesgo r; AURC menor es mejor). ID corresponde a HotpotQA; OOD agrega math-500, gsm8k, commonsenseqa, gpqa, simpleqa y trivia.

| ID C@0 | ID C@1 | ID C@5 | ID C@10 | ID AURC ↓ | ID Acc | OOD C@0 | OOD C@1 | OOD C@5 | OOD C@10 | OOD AURC ↓ | OOD Acc |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 5.4 | 5.4 | 51.9 | 95.6 | 6.1 | 88.1 | 1.2 | 1.2 | 5.9 | 24.2 | 33.1 | 57.4 |

El paper reporta, como referencia agregada (media de las semillas 43 y 44 en la tabla de Gemma), mejoras de C@5 en OOD de 12.3% a 23.6% frente a rewards puntuales de coincidencia con la correccion, y en matematicas (MATH-500, GSM8K, Big-Math-Digits) de 0.8% a 42.4%. No se han publicado en la informacion disponible resultados de benchmarks estandar tipo MMLU o HumanEval para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 5.506.950.723 parametros, en bf16/fp16 el peso ocupa aproximadamente 11 GB, por lo que se necesita margen adicional para KV cache y activaciones.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, una GPU de 24 GB o superior es un punto de partida razonable en precision completa; no confirmado por el autor.
- Cabe en consumer GPU: probablemente en GPUs de 24 GB en precision completa y en GPUs de 16 GB con cuantizacion, aunque no hay datos publicados que lo confirmen.
- Opciones de despliegue: la model card exige un runtime compatible con Gemma 4 (libreria transformers); no se documentan soportes de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La evaluacion del paper usa una unica completion, temperatura 0 y limite de generacion de 4096 tokens.
- Requisito de prompt: usar exactamente el system prompt de `system_prompt.txt`, la plantilla de chat guardada y todos los EOS IDs de `generation_config.json`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CARE-Gemma-4-E2B-it-HotpotQA-seed44 | 5.506.950.723 | no disponible | Fine-tune RL para confianza verbalizada (CARE) sobre HotpotQA | apache-2.0 | Hugging Face (0 descargas en el momento de la ficha) |
| google/gemma-4-E2B-it (base) | no disponible en la informacion | no disponible | Modelo multimodal image-text-to-text de proposito general | apache-2.0 | Hugging Face |
| Modelos con rewards binarios de correccion (RLCR, Damani et al., 2025) | no disponible | no disponible | Post-entrenamiento para estimar confianza con reward puntual | no disponible | Referencia en paper |

No se dispone de datos suficientes para comparar rendimiento numerico con alternativas concretas de la misma categoria.

## Limitaciones y advertencias

- Una puntuacion de confianza no es una garantia de correccion; el propio autor lo advierte. El umbral debe calibrarse sobre datos held-out adecuados.
- El checkpoint esta entrenado solo sobre HotpotQA; el rendimiento OOD es notablemente inferior (OOD C@5 de 5.9 frente a ID C@5 de 51.9).
- El post-entrenamiento es solo de texto: los encoders de vision y audio estan congelados y el uso multimodal no ha sido evaluado.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero inherente a un modelo de 5.500 millones de parametros en tareas de conocimiento general.
- Sesgos conocidos: no disponibles en la informacion proporcionada; hereda los sesgos del modelo base Gemma 4 E2B-it.
- Idiomas soportados: no disponibles; la evaluacion se limita a benchmarks en ingles.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se incluye la licencia y el aviso de modificacion del modelo base; conviene revisar los terminos de Gemma 4 E2B-it.
- Requiere un runtime compatible con Gemma 4 y el uso exacto del system prompt, la plantilla de chat y los EOS IDs guardados; un uso distinto puede degradar la calidad de la confianza.
- Es un checkpoint de investigacion con 0 descargas y 0 likes: no hay evidencia de uso en produccion ni validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hector-gr/CARE-Gemma-4-E2B-it-HotpotQA-seed44
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/mehuldamani/hotpot_qa
- Paper CARE (Cross-Question Reliable Reinforcement Learning, Rodriguez y Rohrbach): no disponible como enlace en la informacion proporcionada
- Paper RLCR (Beyond Binary Rewards: Training LMs to Reason About Their Uncertainty, Damani et al., 2025): no disponible como enlace en la informacion proporcionada

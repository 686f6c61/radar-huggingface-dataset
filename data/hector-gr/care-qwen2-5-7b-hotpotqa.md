# hector-gr/CARE-Qwen2.5-7B-HotpotQA

## Resumen

CARE-Qwen2.5-7B-HotpotQA es un ajuste fino del modelo Qwen2.5-7B desarrollado por Hector G. Rodriguez (en colaboracion con Marcus Rohrbach) que entrena al modelo para verbalizar su propia confianza en las respuestas que genera. El objetivo no es mejorar la exactitud bruta, sino permitir la prediccion selectiva: que el sistema pueda abstenerse o derivar a un humano o a un modelo mas potente cuando su confianza es baja, maximizando la cobertura de respuestas a un nivel de riesgo controlado.

El modelo se entrena sobre HotpotQA (QA multi-salto sobre Wikipedia) con una innovacion metodologica llamada CARE (Cross-question Abstention Reward Estimation), descrita en el paper *Cross-Question Reliable Reinforcement Learning*. A diferencia de los metodos previos que refuerzan cada confianza contra su propia etiqueta binaria de correccion, CARE calcula recompensas sobre un conjunto de pares pregunta-respuesta, de modo que cada confianza se refuerza en relacion con las demas, preservando informacion de ranking util para la seleccion.

Es relevante porque aborda un problema practico de despliegue de LLM en produccion: saber cuando el modelo no sabe. Con 7.615.616.512 parametros y licencia Apache 2.0, el modelo es desplegable en infraestructura estandar, y su salida estructurada (`<answer>` y `<confidence>`) facilita la integracion en pipelines con umbrales de abtencion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-7B; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion GGUF/AWQ no publicada por el autor) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (incluye la licencia del modelo base) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B, un transformer decoder-only de 7,6 mil millones de parametros, y se ajusta mediante aprendizaje por refuerzo con GRPO (Group Relative Policy Optimization) usando la libreria TRL. El dataset de entrenamiento es `mehuldamani/hotpot_qa`, una version de HotpotQA orientada a QA multi-salto sobre Wikipedia. La configuracion de entrenamiento esta publicada en `training_config.yaml` con semilla 43.

La innovacion tecnica central es CARE (Cross-question Abstention Reward Estimation). En lugar de recompensar cada confianza de forma puntual (1 para respuestas correctas, 0 para incorrectas), CARE calcula recompensas sobre un conjunto de pares pregunta-respuesta: para cada tolerancia al riesgo, las confianzas del conjunto inducen un umbral de abtencion, y cada confianza recibe recompensa por situarse en el lado correcto de ese umbral. Esto evita la saturacion de confianzas en 0 y 1, que destruye la informacion de ranking necesaria para la prediccion selectiva. El modelo se entrena sobre RLCR (*Beyond Binary Rewards: Training LMs to Reason About Their Uncertainty*, Damani et al., 2025) como linea base metodologica.

## Capacidades

- Generacion de texto y respuesta a preguntas, en particular QA multi-salto sobre Wikipedia (HotpotQA).
- Verbalizacion de confianza calibrada: cada respuesta incluye una etiqueta `<confidence>` ademas del `<answer>`.
- Prediccion selectiva: el modelo permite ordenar respuestas por confianza y aplicar umbrales de abtencion segun la tolerancia al riesgo del usuario.
- Razonamiento multi-salto: entrenado especificamente en preguntas que requieren combinar informacion de varios documentos.
- Salida estructurada mediante etiquetas XML (`<answer>...</answer>`, `<confidence>...</confidence>`), facil de parsear en produccion.
- Soporte de tool calling / function calling: no disponible (no se menciona en la model card).
- Soporte de agentes y multi-step reasoning: no disponible de forma explicita; el entrenamiento se centra en QA y estimacion de confianza.
- Capacidades multilingues: no disponible (no se documentan).
- Capacidades especiales: modo de estimacion de incertidumbre integrado en la generacion; no se documentan vision ni audio.

## Casos de uso

- Enrutamiento con abtencion en produccion: el modelo responde y emite una confianza; un umbral calibrado sobre datos held-out decide si la respuesta se sirve al usuario o se deriva a un humano o a un modelo mayor. Adecuado porque la salida `<confidence>` esta disenada exactamente para este flujo.
- QA sobre documentacion corporativa multi-documento: para preguntas que requieren combinar informacion de varias fuentes, el modelo puede responder y marcar su grado de certeza, permitiendo revision selectiva en lugar de revision total.
- Sistemas de atencion al cliente con escalado: el modelo gestiona la primera linea y escala a agentes humanos solo cuando la confianza cae por debajo del umbral, reduciendo coste de revision sin sacrificar riesgo controlado.
- Investigacion en calibracion e incertidumbre: sirve como referencia reproducible para experimentos de prediccion selectiva, ya que publica configuracion de entrenamiento (semilla 43) y resultados C@r y AURC en ID y OOD.
- Evaluacion de pipelines RAG: al medir la confianza del modelo sobre respuestas ancladas en documentos recuperados, se puede detectar cuando el retriever no aporta evidencia suficiente y ajustar el pipeline.
- Filtrado de datos sinteticos: generar respuestas con confianza y descartar las de baja confianza antes de usarlas para entrenamiento posterior, reduciendo ruido en datasets.
- Moderacion asistida con derivacion: clasificar consultas ambiguas y derivar al revisor humano las que el modelo marca como inciertas.

## Benchmarks y rendimiento

Resultados publicados en la model card. Prediccion selectiva en %; C@r es cobertura al riesgo r; AURC menor es mejor. ID: HotpotQA distractor (1.000 ejemplos, juez LLM). OOD: MATH-500, GSM8K, CommonsenseQA, GPQA, SimpleQA, TriviaQA.

| Modelo | ID C@0 | ID C@1 | ID C@5 | ID AURC ↓ | ID Acc | OOD C@0 | OOD C@1 | OOD C@5 | OOD AURC ↓ | OOD Acc |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| RLCR | 2,4 | 2,4 | 34,7 | 6,1 | 86,1 | 0,1 | 0,1 | 12,3 | 36,6 | 56,2 |
| CARE (este modelo) | 6,1 | 6,1 | 74,7 | 4,4 | 87,6 | 3,1 | 6,4 | 23,6 | 33,2 | 58,0 |

En el abstract se reporta ademas que, en matematicas, CARE eleva la cobertura al 5 % de riesgo (C@5) en MATH-500, GSM8K y Big-Math-Digits del 0,8 % al 42,4 % frente a recompensas puntuales de coincidencia con la correccion. En OOD sobre HotpotQA, C@5 pasa del 12,3 % al 23,6 %.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 15-16 GB solo para pesos, mas overhead de KV cache; en la practica se recomienda 24 GB o mas para contexto largo.
- Cuantizacion a 8 bits: alrededor de 8-9 GB de pesos; a 4 bits: alrededor de 4-5 GB, aunque el autor no publica pesos cuantizados oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en produccion; RTX 4090 (24 GB) viable en BF16 con contexto moderado; RTX 3090 (24 GB) similar.
- Cabe en GPU de consumo: si, en RTX 4090/3090 en BF16 y en GPUs de 12-16 GB con cuantizacion (no oficial).
- Opciones de despliegue: transformers (referencia del autor), TGI (tag `text-generation-inference`), vLLM y llama.cpp/Ollama previa conversion a GGUF (no publicada por el autor).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CARE-Qwen2.5-7B-HotpotQA | 7,6 B | no disponible | QA + confianza verbalizada (CARE) | Apache 2.0 | Hugging Face |
| Qwen2.5-7B (base) | 7,6 B | no disponible en esta ficha | LLM generalista | Apache 2.0 | Hugging Face |
| RLCR (linea base del paper) | 7 B (sobre Qwen2.5-7B) | no disponible | Confianza puntual (recompensa binaria) | no disponible | no disponible |

La comparativa cuantitativa frente a RLCR esta en la tabla de benchmarks: CARE mejora C@5 ID de 34,7 a 74,7 y reduce AURC ID de 6,1 a 4,4, con exactitud ID ligeramente superior (87,6 frente a 86,1). Frente al Qwen2.5-7B base no se publican comparaciones de calibracion en la informacion disponible.

## Limitaciones y advertencias

- El modelo puede dar respuestas incorrectas con alta confianza; la calibracion no es perfecta.
- No ha sido validado para decisiones criticas de seguridad (afirmacion explicita del autor).
- La confianza medida en una distribucion (por ejemplo, HotpotQA) no necesariamente se transfiere a otra; el umbral debe calibrarse con datos held-out del dominio objetivo.
- Entrenado sobre HotpotQA, un dataset en ingles de QA sobre Wikipedia; el rendimiento en otros idiomas y dominios no esta documentado.
- Sesgos conocidos: no disponibles en la informacion proporcionada; hereda los sesgos del modelo base y del dataset.
- Riesgo de alucinacion: presente como en cualquier LLM de su tamano; la confianza verbalizada mitiga pero no elimina el problema.
- Licencia Apache 2.0 permite uso comercial, pero se incluye la licencia del modelo base Qwen2.5-7B, que conviene revisar.
- El modelo requiere un system prompt especifico (`system_prompt.txt`) y el formato de usuario `PROBLEM: <question>`; desviarse de ese formato puede degradar la calibracion.
- La evaluacion del paper usa temperatura 0, una sola completion y limite de 4096 tokens; otros ajustes de decodificacion pueden alterar la calibracion.

## Enlaces

- Hugging Face: https://huggingface.co/hector-gr/CARE-Qwen2.5-7B-HotpotQA
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B
- Dataset de entrenamiento: https://huggingface.co/datasets/mehuldamani/hotpot_qa
- Paper citado: *Cross-Question Reliable Reinforcement Learning* — Hector G. Rodriguez y Marcus Rohrbach (enlace no disponible en la informacion proporcionada)
- Trabajo base RLCR: *Beyond Binary Rewards: Training LMs to Reason About Their Uncertainty* (Damani et al., 2025) (enlace no disponible en la informacion proporcionada)
- Libreria TRL: https://github.com/huggingface/trl

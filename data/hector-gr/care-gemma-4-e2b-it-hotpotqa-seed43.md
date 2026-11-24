# hector-gr/CARE-Gemma-4-E2B-it-HotpotQA-seed43

## Resumen

CARE-Gemma-4-E2B-it-HotpotQA-seed43 es un ajuste fino del modelo multimodal Gemma 4 E2B-it de Google DeepMind, publicado por el investigador Hector G. Rodriguez. El objetivo del modelo no es mejorar la capacidad de respuesta bruta, sino ensenar al modelo a verbalizar su propia confianza en la respuesta mediante la técnica CARE (Cross-question Abstention Reward Estimation), descrita en el paper *Cross-Question Reliable Reinforcement Learning*. El modelo emite, junto a cada respuesta, una puntuación de confianza que permite aplicar predicción selectiva: aceptar solo las respuestas más fiables y derivar el resto a un humano o a un modelo mayor.

El ajuste se ha realizado sobre HotpotQA (QA multihop sobre Wikipedia) y el checkpoint corresponde a la semilla 43 de un experimento reproducido. El modelo base es un Gemma 4 con 5.506.950.723 parámetros totales según los pesos en safetensors, lo que sugiere una arquitectura con mezcla de expertos o con codificadores multimodales adicionales respecto al recuento nominal "E2B". La relevancia actual reside en que aborda un problema práctico de despliegue: cuantificar la incertidumbre para operar con tolerancia al riesgo controlada.

La licencia es Apache 2.0, heredada del modelo base, y el repo ocupa 11 GB en formato safetensors para transformers. El modelo es texto-only en su post-entrenamiento: los codificadores de visión y audio del Gemma 4 original quedaron congelados y no se evaluaron usos multimodales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4), post-entrenado solo en texto; detalles internos de la arquitectura no disponibles |
| Parametros totales | 5.506.950.723 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la generación se evaluó con límite de 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it (revisión `70af34e20bd4b7a91f0de6b22675850c43922a03`), un transformer multimodal de la familia Gemma 4. El post-entrenamiento es texto-only: los codificadores de visión y audio se congelaron y no se evaluaron. El ajuste se realizó con aprendizaje por refuerzo sobre el dataset mehuldamani/hotpot_qa, con configuración de batch por dispositivo 4, acumulación de gradientes 128 y longitud máxima de completado de 1536 tokens. El modelo se entrena para producir salidas con etiquetas `<answer>...</answer>` y `<confidence>...</confidence>`.

La innovación técnica es la función de recompensa CARE. En lugar de reforzar cada confianza contra la etiqueta binaria de corrección de su propia pregunta (óptimo teórico pero degenerado en la práctica, ya que empuja las confianzas a 0 y 1 y destruye la información de ranking), CARE calcula la recompensa sobre un conjunto de pares pregunta-respuesta: para cada tolerancia al riesgo se induce un umbral de abstención a partir de las confianzas del conjunto, y cada confianza se premia por situarse en el lado correcto de ese umbral. Así, cada confianza verbalizada se refuerza en relación con las de otras preguntas, lo que preserva la capacidad de ordenar respuestas y de aplicar umbrales de cobertura. El trabajo se apoya en RLCR (Damani et al., 2025) y se describe en el paper *Cross-Question Reliable Reinforcement Learning* de Rodriguez y Rohrbach.

## Capacidades

- Generación de texto conversacional y QA, con salida estructurada que incluye respuesta y confianza verbalizada.
- Estimación de confianza calibrada para predicción selectiva: permite ordenar respuestas por confianza y fijar umbrales de abstención.
- Razonamiento multihop sobre conocimiento general, entrenado específicamente con HotpotQA.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo está orientado a QA de un solo turno con una completion.
- Capacidades multilingües: no disponibles; no se documentan idiomas soportados.
- Capacidades multimodales (visión, audio): presentes en el modelo base pero congeladas y no evaluadas en este checkpoint.
- Modo thinking explícito: no disponible.

## Casos de uso

- Predicción selectiva en pipelines de QA: el modelo responde y asigna confianza; un orquestador acepta las respuestas por encima de un umbral calibrado en datos held-out y deriva el resto a revisión humana. Es el caso de uso central del checkpoint.
- Enrutamiento entre modelos (cascada): usar las confianzas para enviar solo las preguntas de baja confianza a un modelo mayor o a un sistema de recuperación adicional, reduciendo coste computacional.
- Control de riesgo en atención al cliente: fijar una tolerancia de error (por ejemplo, 5 %) y ajustar el umbral de abstención para que la cobertura cumpla esa restricción antes de publicar respuestas automáticas.
- Evaluación de fiabilidad en sistemas RAG: integrar el modelo como verificador que puntúa la confianza de respuestas generadas por otro componente sobre documentación recuperada.
- Investigación en calibración y RL: el checkpoint (semilla 43) sirve como réplica reproducible de los experimentos del paper para estudiar funciones de recompensa de confianza.
- Moderación de contenido factual: marcar respuestas de baja confianza para revisión editorial en bases de conocimiento o wikis internas.
- Filtrado previo en anotación de datos: priorizar para revisión humana solo las anotaciones con confianza baja, acelerando pipelines de etiquetado.

## Benchmarks y rendimiento

Resultados de predicción selectiva del checkpoint (valores en %, C@r = cobertura con riesgo r, AURC menor es mejor). ID corresponde a HotpotQA (hotpot-judge); OOD agrega math-500, gsm8k, commonsenseqa, gpqa, simpleqa y trivia.

| Metrica | ID | OOD |
|---|---:|---:|
| C@0 | 0,0 | 1,7 |
| C@1 | 0,0 | 1,7 |
| C@5 | 57,1 | 6,4 |
| C@10 | 94,4 | 17,1 |
| AURC (menor es mejor) | 6,1 | 33,1 |
| Accuracy | 88,2 | 57,5 |

Según el abstract del paper, CARE eleva la cobertura al 5 % de riesgo (C@5) en MATH-500, GSM8K y Big-Math-Digits del 0,8 % al 42,4 % frente a recompensas puntuales de coincidencia con la corrección; entrenado en HotpotQA, mejora C@5 en benchmarks OOD de conocimiento general, razonamiento y matemáticas del 12,3 % al 23,6 %. La tabla del paper para Gemma reporta la media de las semillas 43 y 44; este checkpoint es la semilla 43 individual.

## Requisitos de hardware

- VRAM estimada para inferencia: con 5.506.950.723 parámetros, en FP16 se necesitan aproximadamente 11 GB solo para pesos; en BF16, lo mismo. En cuantización de 8 bits, unos 5,5-6 GB; en 4 bits, unos 3-4 GB (estimaciones a partir del recuento de parámetros, sin datos oficiales del autor).
- GPU recomendadas: A100 40/80 GB o H100 para FP16 sin cuantizar con margen para el contexto; L40S o RTX 6000 Ada como alternativas profesionales.
- GPU de consumo: cabe en RTX 4090 (24 GB) en FP16 con contexto moderado y en RTX 3090/4080 en cuantización de 8 o 4 bits.
- Despliegue: transformers es la librería declarada (requiere un runtime compatible con Gemma 4). vLLM, TGI, llama.cpp u Ollama: no disponible en la información proporcionada.
- Latencia y throughput: no disponibles. La evaluación del paper usa temperature 0, una sola completion y límite de 4096 tokens de generación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CARE-Gemma-4-E2B-it-HotpotQA-seed43 | 5.506.950.723 | no disponible | QA con confianza verbalizada (CARE) | Apache 2.0 | Hugging Face |
| google/gemma-4-E2B-it (base) | no disponible | no disponible | Modelo multimodal general | Apache 2.0 | Hugging Face |
| Gemma 4 E2B-it + RLCR (Damani et al., 2025) | mismo base | no disponible | Confianza con recompensa binaria puntual | Apache 2.0 | Referencia en paper |
| Modelos de QA calibrada comparables | no disponible | no disponible | Predicción selectiva | no disponible | no disponible |

La comparación cuantitativa directa con alternativas no está disponible en la información proporcionada; el paper reporta mejoras frente a recompensas puntuales de corrección (C@5 de 0,8 % a 42,4 % en matemáticas y de 12,3 % a 23,6 % en OOD), pero no se detallan los modelos concretos de la comparación.

## Limitaciones y advertencias

- Una puntuación de confianza no es una garantía de corrección; debe calibrarse el umbral sobre datos held-out representativos del dominio de despliegue.
- El entrenamiento se hizo solo sobre HotpotQA; el rendimiento fuera de distribución cae notablemente (C@5 OOD del 6,4 % frente al 57,1 % ID).
- El modelo es texto-only en este checkpoint: visión y audio del Gemma 4 base están congelados y no evaluados.
- Requiere el prompt de sistema exacto (`system_prompt.txt`), la plantilla de chat guardada y todos los EOS IDs de `generation_config.json`; usarlo de otra forma puede degradar la salida estructurada.
- La evaluación usa una sola completion con temperature 0; no se documenta comportamiento con muestreo múltiple.
- Sesgos conocidos: no documentados en la información disponible; hereda los del modelo base Gemma 4.
- Riesgo de alucinación: presente como en cualquier LLM; la confianza verbalizada mitiga pero no elimina el problema.
- Idiomas soportados no documentados; no se recomienda asumir cobertura multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y modificación del modelo base.
- El checkpoint corresponde a una única semilla (43); la varianza entre semillas no se refleja en esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hector-gr/CARE-Gemma-4-E2B-it-HotpotQA-seed43
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/mehuldamani/hotpot_qa
- Paper citado: *Cross-Question Reliable Reinforcement Learning*, Hector G. Rodriguez y Marcus Rohrbach (enlace no disponible en la información proporcionada)
- Trabajo relacionado: *RLCR: Beyond Binary Rewards: Training LMs to Reason About Their Uncertainty* (Damani et al., 2025) (enlace no disponible en la información proporcionada)
- Repositorio de código, demo o blog: no disponibles en la información proporcionada

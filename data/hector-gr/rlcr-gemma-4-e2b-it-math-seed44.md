# hector-gr/RLCR-Gemma-4-E2B-it-Math-seed44

## Resumen

RLCR Gemma 4 E2B-it Math seed 44 es un ajuste fino (post-entrenamiento) del modelo multimodal Google DeepMind Gemma 4 E2B-it, publicado por el investigador Hector G. Rodriguez. El modelo se entrena para verbalizar la confianza en sus propias respuestas matemáticas, es decir, para producir junto a cada respuesta una puntuación de confianza que permita seleccionar únicamente las respuestas más fiables y abstenerse del resto. El objetivo es la predicción selectiva: maximizar la cobertura de preguntas resueltas manteniendo un riesgo de error controlado.

El ajuste se realiza sobre el conjunto de datos `mehuldamani/big-math-digits` mediante CARE (Cross-question Abstention Reward Estimation), una variante de RLCR (Reinforcement Learning with Confidence Rewards) que calcula las recompensas de confianza de forma relativa dentro de un conjunto de pares pregunta-respuesta, en lugar de comparar cada confianza contra su propia etiqueta binaria de corrección. Según el resumen del paper asociado, CARE eleva la cobertura al 5% de riesgo (C@5) en MATH-500, GSM8K y Big-Math-Digits del 0,8% al 42,4% frente a recompensas puntuales de coincidencia con la corrección.

El checkpoint tiene 5.506.950.723 parámetros (datos reales de safetensors) y un repositorio de 11,0 GB en formato safetensors. Se distribuye bajo licencia Apache 2.0. Es relevante para quienes investigan calibración, estimación de incertidumbre y sistemas que deben decidir cuándo delegar en un humano o en un modelo más potente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 E2B-it); el ajuste es solo de texto y congela los codificadores de visión y audio |
| Parametros totales | 5.506.950.723 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la evaluación usa un límite de generación de 4096 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 E2B-it, un transformer multimodal de Google DeepMind con codificadores de visión y audio. El post-entrenamiento aplicado aquí es exclusivamente de texto: los codificadores multimodal se mantienen congelados y el uso multimodal no ha sido evaluado. El ajuste se realiza sobre `mehuldamani/big-math-digits` con el algoritmo CARE, una evolución de RLCR que agrupa pares pregunta-respuesta y, para varios niveles de tolerancia al riesgo, deriva un umbral de abstención a partir de las confianzas del propio conjunto; cada confianza recibe recompensa por situarse en el lado correcto de ese umbral. De este modo, la señal de recompensa es relativa entre preguntas y no una comparación binaria contra la corrección individual.

La configuración de entrenamiento indicada es: batch por dispositivo 4, acumulación de gradiente 96 y longitud máxima de completado 4096 tokens. El modelo se evalúa con una única completación, temperatura 0 y límite de generación de 4096 tokens. Las salidas incluyen las etiquetas `<answer>...</answer>` y `<confidence>...</confidence>`. El checkpoint corresponde a la semilla 44; la tabla del paper para Gemma reporta la media de las semillas 43 y 44.

## Capacidades

- Generación de texto y razonamiento matemático sobre problemas de tipo Big-Math-Digits, GSM8K y MATH-500.
- Verbalización de la confianza propia: emite una puntuación de confianza junto a cada respuesta en formato `<confidence>...</confidence>`.
- Predicción selectiva: permite ordenar respuestas por confianza y aplicar un umbral para abstenerse o derivar preguntas.
- Formato de respuesta estructurado con etiquetas `<answer>` y `<confidence>`.
- Capacidad multimodal heredada de Gemma 4 E2B-it (visión y audio), aunque congelada y no evaluada tras el ajuste.
- No se documenta soporte de tool calling ni de function calling en la información disponible.
- No se documenta comportamiento de agente multi-paso en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Enrutamiento con abstención en asistentes matemáticos: el modelo responde y asigna una confianza; un umbral calibrado sobre datos de validación permite derivar a un humano o a un modelo mayor las respuestas de baja confianza, reduciendo el riesgo de error en producción.
- Evaluación de calibración en investigación: sirve como checkpoint de referencia para comparar CARE frente a recompensas puntuales de RLCR en experimentos de selective prediction sobre MATH-500, GSM8K y Big-Math-Digits.
- Triaje en pipelines de corrección automática: en un sistema de corrección de ejercicios, las respuestas con confianza alta se aceptan automáticamente y las de confianza baja se marcan para revisión docente.
- Generación de datos con control de calidad: al ordenar por confianza, se pueden filtrar las completaciones más fiables para construir datasets de entrenamiento o destilación con menor ruido.
- Investigación en estimación de incertidumbre OOD: el checkpoint permite estudiar la transferencia de la calibración a dominios fuera de distribución (CommonsenseQA, GPQA, SimpleQA, TriviaQA, HotpotQA).
- Sistemas de escalado en cascada: la confianza verbalizada actúa como señal para decidir si se invoca un modelo más grande, optimizando coste frente a precisión.
- Reproducción de experimentos: con la configuración de entrenamiento y la semilla documentadas, permite reproducir los resultados del paper en entornos con runtime compatible con Gemma 4.

## Benchmarks y rendimiento

Resultados de predicción selectiva del checkpoint (valores en %; C@r es cobertura al riesgo r; AURC, menor es mejor). ID: big-math-digits, math-500, gsm8k. OOD: commonsenseqa, gpqa, simpleqa, trivia, hotpotqa.

| ID C@0 | ID C@1 | ID C@5 | ID C@10 | ID AURC ↓ | ID Acc | OOD C@0 | OOD C@1 | OOD C@5 | OOD C@10 | OOD AURC ↓ | OOD Acc |
|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| 0,0 | 0,0 | 0,0 | 0,0 | 17,2 | 74,2 | 0,0 | 0,0 | 9,8 | 31,8 | 37,4 | 53,8 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K en formato de exactitud directa) más allá de la exactitud agregada recogida en la tabla anterior.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 5,5 mil millones de parámetros, en FP16 se requieren aproximadamente 11 GB solo para pesos, más memoria para caché KV y activaciones; en cuantización de 8 bits o 4 bits la huella se reduce, pero no se documentan cuantizaciones publicadas.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría esperar GPU de 24 GB o más (RTX 4090, A100 40/80 GB, H100) para precisión completa, aunque el dato no está confirmado por el autor.
- Compatibilidad con GPU de consumo: plausible en GPUs de 24 GB en FP16 y en GPUs de 12-16 GB con cuantización, pero no verificado en la información disponible.
- Opciones de despliegue: la librería indicada es `transformers` y el modelo está marcado como `endpoints_compatible`. Requiere un runtime compatible con Gemma 4. No se documenta soporte explícito de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RLCR Gemma 4 E2B-it Math seed 44 (este) | 5.506.950.723 | no disponible | Ajuste CARE/RLCR para confianza verbalizada en matemáticas | Apache 2.0 | Hugging Face, 0 descargas |
| google/gemma-4-E2B-it (base) | no disponible en la información | no disponible | Modelo base multimodal instruct | Apache 2.0 | Hugging Face (Google DeepMind) |
| RLCR baseline (Damani et al., 2025) | no disponible | no disponible | Recompensas puntuales de confianza | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otras alternativas en la información proporcionada.

## Limitaciones y advertencias

- La confianza verbalizada no es una garantía de corrección; debe calibrarse un umbral sobre datos de validación propios antes de usarla en producción.
- El ajuste es solo de texto: los codificadores de visión y audio están congelados y el uso multimodal no ha sido evaluado.
- Requiere el prompt de sistema exacto de `system_prompt.txt`, la plantilla de chat guardada y todos los EOS IDs de `generation_config.json`; usarlo de otra forma puede degradar los resultados.
- La evaluación se realiza con una única completación, temperatura 0 y límite de 4096 tokens; otros ajustes de decodificación no están validados.
- Riesgo de alucinación inherente al modelo base; la confianza puede estar mal calibrada en dominios fuera de distribución, como muestran los valores OOD (C@5 de 9,8% frente a 0,0% en ID).
- Sesgos conocidos: no documentados en la información disponible, aunque hereda los del modelo base Gemma 4.
- Idiomas soportados: no disponibles; el ajuste se centra en matemáticas y no se documenta cobertura multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y modificación del modelo base (revisión `70af34e20bd4b7a91f0de6b22675850c43922a03`).
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hector-gr/RLCR-Gemma-4-E2B-it-Math-seed44
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/mehuldamani/big-math-digits
- Paper citado (Cross-Question Reliable Reinforcement Learning, Hector G. Rodriguez y Marcus Rohrbach): no disponible en la información proporcionada
- RLCR (Damani et al., 2025, Beyond Binary Rewards: Training LMs to Reason About Their Uncertainty): no disponible en la información proporcionada

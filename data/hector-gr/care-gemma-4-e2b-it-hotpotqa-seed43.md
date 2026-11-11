# hector-gr/CARE-Gemma-4-E2B-it-HotpotQA-seed43

## Resumen

CARE-Gemma-4-E2B-it-HotpotQA-seed43 es un ajuste fino de `google/gemma-4-E2B-it` desarrollado por Hector G. Rodriguez (con Marcus Rohrbach como coautor del método) para que el modelo verbalice su propia confianza al responder preguntas. El objetivo no es mejorar la exactitud bruta, sino habilitar *selective prediction*: que el modelo asigne una puntuación de confianza a cada respuesta de forma que, aplicando un umbral, se pueda derivar a un humano o a un modelo mayor solo los casos dudosos. El checkpoint se entrena sobre HotpotQA (`mehuldamani/hotpot_qa`), un corpus de QA multihop sobre Wikipedia.

La innovación central es CARE (Cross-question Abstention Reward Estimation), descrito en el paper *Cross-Question Reliable Reinforcement Learning*. Frente a los métodos punto a punto que premian confianza 1 en respuestas correctas y 0 en incorrectas, CARE calcula la recompensa en función de un umbral de abstención derivado del conjunto de preguntas a varios niveles de riesgo. Así, cada confianza verbalizada se refuerza en relación con las demás preguntas y no contra su propia etiqueta binaria, lo que evita la saturación de confianzas en los extremos y preserva la información de ranking.

El modelo tiene 5.506.950.723 parámetros reales según los pesos safetensors (el sufijo E2B del base sugiere una arquitectura con parámetros activos reducidos, aunque el dato de activos no está disponible en la información proporcionada). Es un ajuste solo de texto: los codificadores de visión y audio del base quedaron congelados y el uso multimodal no se ha evaluado. La licencia es Apache 2.0 y el repo ocupa 11,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Gemma 4 E2B-it; detalles internos no disponibles) |
| Parametros totales | 5.506.950.723 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it` (revisión `70af34e20bd4b7a91f0de6b22675850c43922a03`) y se post-entrena con aprendizaje por refuerzo siguiendo CARE, el método propuesto en *Cross-Question Reliable Reinforcement Learning* de Rodriguez y Rohrbach. El entrenamiento se realiza sobre HotpotQA, un dataset de QA multihop sobre Wikipedia, con el objetivo de que el modelo emita, junto a cada respuesta, una etiqueta `<confidence>` calibrada. La recompensa no se calcula por pregunta de forma aislada: en cada uno de varios niveles de tolerancia al riesgo, las confianzas del conjunto inducen un umbral de abstención y cada confianza se premia por situarse en el lado correcto de ese umbral. Esto produce una señal de ranking entre preguntas en lugar de una señal binaria por pregunta.

La configuración de entrenamiento indicada en el repo usa batch por dispositivo de 4, acumulación de gradientes de 128 y longitud máxima de completado de 1536 tokens. El ajuste es exclusivamente de texto: los codificadores de visión y audio del modelo base se congelaron y no se evaluó el uso multimodal. El método se apoya en el trabajo previo RLCR (*Beyond Binary Rewards: Training LMs to Reason About Their Uncertainty*, Damani et al., 2025). No se detalla en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset más allá de HotpotQA.

## Capacidades

- Generación de texto conversacional y respuesta a preguntas, incluyendo preguntas multihop sobre conocimiento enciclopédico.
- Verbalización de confianza: cada salida incluye un bloque `<answer>...</answer>` y un bloque `<confidence>...</confidence>` que puede usarse para ranking y umbralización.
- Selective prediction: permite abstenerse o derivar preguntas según un umbral de riesgo definido sobre datos de validación.
- Razonamiento de conocimiento general y matemático fuera de distribución (evaluado en MATH-500, GSM8K, CommonsenseQA, GPQA, SimpleQA y TriviaQA).
- Capacidad multimodal heredada del base (visión y audio) teóricamente presente en los pesos, pero congelada y no evaluada en este checkpoint.
- Soporte de tool calling y de agentes multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Enrutado con abstención en atención al cliente: el modelo responde y emite una confianza; un umbral calibrado sobre datos propios deriva a un agente humano las consultas con confianza baja, reduciendo el riesgo de respuestas erróneas en producción.
- QA documental con derivación a un modelo mayor: en un pipeline de dos niveles, el modelo pequeño resuelve los casos de alta confianza y solo los de baja confianza se envían a un modelo más grande, optimizando coste y latencia.
- Extracción de respuestas sobre corpus Wikipedia: para preguntas multihop, el modelo devuelve la respuesta junto a una puntuación que permite filtrar automáticamente los resultados antes de publicarlos en un buscador interno.
- Evaluación de riesgo en asistentes de conocimiento general: al estar entrenado en HotpotQA pero evaluado en dominios OOD (matemáticas, sentido común, trivia), sirve para estudiar cómo se transfiere la calibración entre dominios en un asistente generalista.
- Investigación en calibración y selective prediction: el checkpoint y su configuración permiten reproducir y comparar CARE frente a recompensas punto a punto en tareas de QA.
- Moderación de respuestas automáticas: usar la confianza como señal auxiliar para decidir si una respuesta generada requiere revisión humana antes de mostrarse, especialmente en dominios sensibles.
- Benchmarking interno de modelos pequeños con autoevaluación: comparar la curva cobertura-riesgo (C@r, AURC) de este checkpoint con otros modelos del mismo tamaño en el propio dominio de la empresa.

## Benchmarks y rendimiento

Resultados de selective prediction de este checkpoint, en porcentaje. C@r es cobertura al riesgo r; AURC, menor es mejor. ID corresponde a HotpotQA (hotpot-judge); OOD agrega MATH-500, GSM8K, CommonsenseQA, GPQA, SimpleQA y TriviaQA. La tabla del paper para Gemma reporta la media de las semillas 43 y 44.

| Ambito | C@0 | C@1 | C@5 | C@10 | AURC ↓ | Acc |
|---|---:|---:|---:|---:|---:|---:|
| ID | 0.0 | 0.0 | 51.9 | 93.5 | 6.1 | 88.1 |
| OOD | 0.6 | 0.6 | 8.1 | 23.4 | 33.4 | 57.1 |

El abstract del paper reporta que CARE eleva la cobertura al 5 % de riesgo (C@5) de 0,8 % a 42,4 % en MATH-500, GSM8K y Big-Math-Digits frente a recompensas punto a punto, y de 12,3 % a 23,6 % en benchmarks OOD de conocimiento general, razonamiento y matemáticas cuando se entrena sobre HotpotQA. No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, etc.) para este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 11 GB solo para pesos (5,5 mil millones de parámetros), más overhead de activaciones y caché KV; con contexto largo el consumo sube de forma apreciable.
- Cuantización a 8 bits: aproximadamente 5,5-6 GB de pesos; a 4 bits: aproximadamente 3-3,5 GB, más overhead. Los formatos de cuantización no están publicados en el repo.
- GPU recomendadas: A100, H100 o L40S para producción con contexto largo y concurrencia; RTX 4090 (24 GB) o RTX 3090 (24 GB) para FP16 en un solo dispositivo.
- GPU de consumo: cabe en GPUs de 16 GB o más en FP16 y en GPUs de 8-12 GB con cuantización a 8 o 4 bits, siempre que el runtime soporte Gemma 4.
- Despliegue: transformers (librería declarada), con endpoints compatibles según los tags del repo; vLLM, TGI, llama.cpp u Ollama no están confirmados como soportados para esta arquitectura en la información disponible.
- Requisito crítico: el checkpoint exige un runtime capaz de ejecutar Gemma 4; debe usarse el system prompt exacto de `system_prompt.txt`, la plantilla de chat guardada y todos los EOS IDs de `generation_config.json`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CARE-Gemma-4-E2B-it-HotpotQA-seed43 | 5,5 B | no disponible | QA con confianza verbalizada (CARE) | Apache 2.0 | Hugging Face |
| google/gemma-4-E2B-it (base) | no disponible (familia E2B) | no disponible | Modelo instructivo multimodal generalista | Apache 2.0 | Hugging Face |
| Checkpoints RLCR (Damani et al., 2025) | no disponible | no disponible | Confianza con recompensas binarias | no disponible | no disponible |
| Modelos de QA calibrada de tamaño similar | no disponible | no disponible | Selective prediction | no disponible | no disponible |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada; el paper sí compara CARE con recompensas punto a punto (RLCR) en términos de C@5 y AURC.

## Limitaciones y advertencias

- Una puntuación de confianza no es una garantía de corrección; el umbral debe calibrarse sobre datos de validación representativos del dominio de despliegue.
- El ajuste es solo de texto: los codificadores de visión y audio están congelados y el uso multimodal no se ha evaluado, por lo que no debe asumirse un comportamiento fiable en imagen o audio.
- El entrenamiento se realizó sobre HotpotQA; el rendimiento OOD es notablemente inferior (C@5 de 8,1 % y exactitud de 57,1 % frente a 51,9 % y 88,1 % en dominio), lo que limita su uso directo fuera de QA enciclopédico.
- Riesgo de alucinación inherente al modelo base; la confianza verbalizada puede estar mal calibrada en dominios alejados del entrenamiento.
- Sesgos conocidos del modelo base Gemma 4 no documentados en la información disponible; deben evaluarse antes de uso en producción.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe conservar la licencia y el aviso de modificación del modelo base.
- Requiere seguir estrictamente el system prompt, la plantilla de chat y los EOS IDs publicados; desviarse de esta configuración puede degradar la calidad de las confianzas.
- El checkpoint es una semilla concreta (43) de un estudio; el paper reporta la media de dos semillas, por lo que los resultados pueden variar entre ejecuciones.
- No hay datos publicados de latencia ni throughput, lo que dificulta dimensionar despliegues en producción sin pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hector-gr/CARE-Gemma-4-E2B-it-HotpotQA-seed43
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/mehuldamani/hotpot_qa
- Paper de CARE (*Cross-Question Reliable Reinforcement Learning*, Rodriguez y Rohrbach): no disponible en la información proporcionada
- Trabajo previo RLCR (*Beyond Binary Rewards: Training LMs to Reason About Their Uncertainty*, Damani et al., 2025): no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada

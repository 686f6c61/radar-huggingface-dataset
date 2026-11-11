# hector-gr/CARE-Gemma-4-E2B-it-Math-seed44

## Resumen

CARE-Gemma-4-E2B-it-Math-seed44 es un ajuste fino (post-entrenamiento) del modelo multimodal Gemma 4 E2B-it de Google DeepMind, desarrollado por Hector G. Rodriguez en colaboración con Marcus Rohrbach. El objetivo del modelo no es mejorar la capacidad de resolver problemas matemáticos, sino enseñar al modelo a verbalizar su propia confianza en la respuesta que produce, de modo que un sistema pueda abstenerse o derivar a un humano o a un modelo más potente cuando la confianza sea baja.

La innovación subyacente es CARE (Cross-question Abstention Reward Estimation), un método de aprendizaje por refuerzo descrito en el paper *Cross-Question Reliable Reinforcement Learning*. A diferencia de las recompensas puntuales tradicionales que empujan cada confianza hacia 1 si la respuesta es correcta y hacia 0 si es incorrecta, CARE calcula la recompensa en función de un umbral de abstención derivado del conjunto de preguntas a varios niveles de tolerancia al riesgo. Esto preserva la información relativa entre confianzas y mejora drásticamente la cobertura a riesgo fijo.

El checkpoint concreto se entrena sobre el dataset Big-Math-Digits y se distribuye con licencia Apache 2.0. Es relevante para quienes construyen sistemas de enrutamiento, abstención selectiva o verificación de respuestas en producción, donde saber cuándo el modelo no es fiable importa tanto como la propia respuesta. El modelo tiene 5.506.950.723 parámetros totales y un repositorio de 11 GB en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4, familia E2B); codificadores de visión y audio congelados durante el post-entrenamiento |
| Parametros totales | 5.506.950.723 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it (revisión `70af34e20bd4b7a91f0de6b22675850c43922a03`), un transformer multimodal de la familia Gemma 4 con capacidad image-text-to-text. El post-entrenamiento es exclusivamente textual: los codificadores de visión y audio se congelaron y el uso multimodal no ha sido evaluado. El ajuste se realiza con CARE (Cross-Question Abstention Reward Estimation), un esquema de RL que opera sobre conjuntos de pares pregunta-respuesta en lugar de forma puntual.

El entrenamiento utiliza el dataset `mehuldamani/big-math-digits` con configuración de batch por dispositivo 4, acumulación de gradientes 96 y longitud máxima de completado de 4096 tokens. La configuración completa está en `training_config.yaml`. El método CARE calcula, para cada nivel de tolerancia al riesgo, un umbral de abstención inducido por las confianzas del conjunto y recompensa cada confianza por situarse en el lado correcto del umbral; así cada confianza se refuerza en relación con las demás preguntas y no contra su propia etiqueta binaria de corrección. Se apoya en el trabajo previo RLCR (Damani et al., 2025).

## Capacidades

- Generación de texto conversacional con salida estructurada: el modelo emite `<answer>...</answer>` y `<confidence>...</confidence>`.
- Estimación de confianza verbalizada calibrada para predicción selectiva (abstención y derivación).
- Razonamiento matemático y aritmético (entrenado sobre Big-Math-Digits).
- Capacidad de respuesta a preguntas de conocimiento general y razonamiento multihop evaluada fuera de distribución (CommonsenseQA, GPQA, SimpleQA, TriviaQA, HotpotQA).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible explícitamente; el modelo se orienta a una única completación con temperatura 0.
- Capacidades multilingües: no disponibles.
- Capacidades multimodales (visión, audio): los codificadores existen en el modelo base pero no se evaluaron ni se entrenaron en este checkpoint.

## Casos de uso

- Enrutamiento con abstención en producción: el modelo responde y asigna una confianza; el sistema aplica un umbral calibrado sobre datos held-out y deriva las respuestas de baja confianza a un humano o a un modelo mayor, maximizando la cobertura a un riesgo de error fijo (por ejemplo, 5 %).
- Verificación de respuestas matemáticas en pipelines educativos: el modelo resuelve el problema y su confianza permite marcar automáticamente los ejercicios dudosos para revisión docente.
- Triaje en atención al cliente técnica: ante consultas con cálculos o datos numéricos, el modelo puede abstenerse cuando su confianza es baja y escalar al operador, reduciendo respuestas erróneas.
- Segunda opinión en sistemas multi-modelo: se usa como verificador económico que responde primero y solo invoca a un modelo mayor cuando su confianza cae por debajo del umbral.
- Evaluación de fiabilidad de asistentes: sirve como banco de pruebas para medir la calibración de confianzas en tareas de matemáticas y QA de conocimiento general.
- Filtrado de datos sintéticos: al generar pares pregunta-respuesta, la confianza verbalizada permite descartar automáticamente las muestras de baja calidad antes de incorporarlas a un corpus de entrenamiento.
- Investigación en selective prediction: checkpoint reproducible (seed 44) para replicar y comparar métodos de estimación de confianza bajo riesgo controlado.

## Benchmarks y rendimiento

Resultados de predicción selectiva del checkpoint (valores en %, C@r = cobertura a riesgo r; AURC menor es mejor). ID = big-math-digits, math-500, gsm8k; OOD = commonsenseqa, gpqa, simpleqa, trivia, hotpotqa. El paper reporta la media de las seeds 43 y 44 para la tabla de Gemma.

| Conjunto | C@0 | C@1 | C@5 | C@10 | AURC ↓ | Accuracy |
|---|---:|---:|---:|---:|---:|---:|
| ID | 0.5 | 0.5 | 14.0 | 48.2 | 14.5 | 75.4 |
| OOD | 1.4 | 1.4 | 7.3 | 35.3 | 37.3 | 53.8 |

Según el abstract del paper, CARE eleva la cobertura a 5 % de riesgo (C@5) en MATH-500, GSM8K y Big-Math-Digits del 0,8 % al 42,4 % frente a recompensas puntuales de coincidencia con la corrección. Entrenado sobre QA multihop de Wikipedia (HotpotQA), CARE mejora C@5 en benchmarks fuera de distribución (CommonsenseQA, GPQA, SimpleQA, TriviaQA) del 12,3 % al 23,6 %. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 5,51 mil millones de parámetros, en fp16 se requieren aproximadamente 11 GB de pesos más overhead de activaciones y caché KV, lo que sitúa el mínimo práctico en torno a 16-24 GB según longitud de contexto.
- GPU recomendadas: A100 (40/80 GB) o H100 para despliegue con contexto largo y mayor throughput; RTX 4090 (24 GB) viable en fp16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090 y, con cuantización a 8 bits o 4 bits, en GPUs de 12-16 GB (RTX 4080, RTX 4070 Ti Super, etc.); no se distribuyen pesos GGUF oficiales.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles según los tags de Hugging Face; vLLM, llama.cpp, Ollama y TGI no están confirmados en la información disponible.
- Latencia y throughput: no disponibles. La evaluación del paper usa una única completación con temperatura 0 y límite de generación de 4096 tokens, lo que condiciona los requisitos de memoria en producción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CARE-Gemma-4-E2B-it-Math-seed44 | 5,51 B | no disponible | Confianza verbalizada + selective prediction (CARE) | Apache 2.0 | Hugging Face |
| google/gemma-4-E2B-it (base) | no disponible | no disponible | Modelo multimodal instructivo general | Apache 2.0 | Hugging Face |
| Gemma + RLCR (Damani et al., 2025) | no disponible | no disponible | Confianza con recompensas binarias puntuales | no disponible | no disponible |

La comparación directa con alternativas de la misma categoría (modelos con estimación de confianza post-entrenada) no está disponible en la información proporcionada más allá de la referencia al método RLCR previo.

## Limitaciones y advertencias

- La confianza verbalizada no es una garantía de corrección: debe calibrarse un umbral sobre datos held-out representativos del dominio de despliegue.
- El modelo está entrenado sobre matemáticas (Big-Math-Digits); el rendimiento en otros dominios es inferior (accuracy OOD de 53,8 % frente a 75,4 % ID).
- Los codificadores de visión y audio están congelados y el uso multimodal no se ha evaluado; no debe asumirse comportamiento fiable en tareas de imagen o audio.
- Es obligatorio usar el system prompt exacto de `system_prompt.txt`, la plantilla de chat guardada y todos los EOS IDs de `generation_config.json`; desviarse puede degradar la calidad de la confianza.
- El formato de salida depende de `<answer>...</answer>` y `<confidence>...</confidence>`; los parsers de producción deben manejar estos delimitadores.
- Sesgos conocidos: no disponibles en la información proporcionada; hereda los del modelo base Gemma 4 y del dataset Big-Math-Digits.
- Riesgo de alucinación: presente como en cualquier LLM; precisamente el mecanismo de confianza busca mitigarlo mediante abstención, no eliminarlo.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe calibrado.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar el aviso de licencia y de modificación del modelo base; el paper y RLCR deben citarse según corresponda.
- Checkpoint de investigación (seed 44, 0 descargas, 0 likes en el momento de la ficha): no hay evidencia de validación en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hector-gr/CARE-Gemma-4-E2B-it-Math-seed44
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/mehuldamani/big-math-digits
- Paper CARE (Cross-Question Reliable Reinforcement Learning, Rodriguez y Rohrbach): no disponible en la información proporcionada
- Trabajo previo RLCR (Damani et al., 2025): no disponible en la información proporcionada

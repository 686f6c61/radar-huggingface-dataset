# hector-gr/RLCR-Gemma-4-E2B-it-HotpotQA-seed43

## Resumen

RLCR-Gemma-4-E2B-it-HotpotQA-seed43 es un ajuste fino (post-entrenamiento) del modelo multimodal Google Gemma 4 E2B-it, publicado por el autor independiente hector-gr. El modelo se ha entrenado para verbalizar su propia confianza en las respuestas que genera, de forma que el usuario pueda aplicar predicción selectiva (abstenerse o derivar las preguntas de baja confianza) y maximizar la cobertura a un riesgo de error dado. El entrenamiento se realiza sobre el conjunto de datos HotpotQA (`mehuldamani/hotpot_qa`), un benchmark de QA multi-salto sobre Wikipedia.

La innovación principal es el método CARE (Cross-question Abstention Reward Estimation), presentado en el paper *Cross-Question Reliable Reinforcement Learning* de Hector G. Rodriguez y Marcus Rohrbach. A diferencia de las recompensas puntuales que empujan la confianza a 1 en respuestas correctas y a 0 en incorrectas, CARE calcula la recompensa de cada confianza en relación con las demás preguntas del lote, induciendo un umbral de abstención para cada nivel de riesgo. El resultado es una señal de confianza más informativa para la selección de respuestas.

El checkpoint tiene 5.506.950.723 parámetros en formato safetensors (11 GB de repositorio) y se distribuye con licencia Apache 2.0. Es un modelo de propósito específico: no está pensado como modelo de chat general, sino como componente de sistemas que necesitan estimar la fiabilidad de sus propias respuestas antes de actuar o de escalar a un humano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia Gemma 4), con codificadores de visión y audio congelados durante el post-entrenamiento |
| Parametros totales | 5.506.950.723 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la evaluación usa un límite de generación de 4096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Google Gemma 4 E2B-it (revisión `70af34e20bd4b7a91f0de6b22675850c43922a03`), un transformer multimodal con entradas de imagen y texto. El post-entrenamiento es exclusivamente textual: los codificadores de visión y audio se congelaron y el uso multimodal no se ha evaluado. El ajuste se realiza con aprendizaje por refuerzo sobre HotpotQA, con una configuración de batch por dispositivo de 4, acumulación de gradientes de 128 y longitud máxima de finalización de 1536 tokens.

La señal de recompensa es CARE (Cross-question Abstention Reward Estimation). Para cada lote de pares pregunta-respuesta, se fijan varios niveles de tolerancia al riesgo; las confianzas verbalizadas del conjunto inducen un umbral de abstención por nivel, y cada confianza recibe recompensa según si queda del lado correcto de ese umbral. Esto refuerza cada confianza de forma relativa al resto de preguntas, en lugar de contra su propia etiqueta binaria de corrección. Según el abstract del paper, CARE eleva la cobertura al 5 % de riesgo (C@5) en MATH-500, GSM8K y Big-Math-Digits del 0,8 % al 42,4 % frente a recompensas puntuales de coincidencia con la corrección, y en QA multi-salto de Wikipedia mejora C@5 en benchmarks fuera de distribución del 12,3 % al 23,6 %. El modelo genera la respuesta dentro de etiquetas `<answer>...</answer>` y la confianza dentro de `<confidence>...</confidence>`.

## Capacidades

- Generación de texto conversacional y respuesta a preguntas, incluyendo QA multi-salto sobre Wikipedia (dominio de entrenamiento).
- Verbalización de la confianza en la propia respuesta mediante la etiqueta `<confidence>`.
- Predicción selectiva: permite ordenar respuestas por confianza y aplicar umbrales de abstención.
- Razonamiento multi-paso implícito en preguntas de HotpotQA (requiere combinar información de varios pasos).
- Capacidad multimodal heredada del modelo base (visión y audio), aunque no evaluada tras el post-entrenamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning explícito: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Enrutamiento con abstención en atención al cliente: el modelo responde y asigna una confianza; si esta cae por debajo de un umbral calibrado con datos retenidos, la consulta se deriva a un agente humano o a un modelo mayor, reduciendo el riesgo de respuestas erróneas.
- QA documental con control de riesgo: en pipelines de preguntas sobre bases de conocimiento, se ordenan las respuestas por confianza y se sirve solo la fracción que cumple el riesgo tolerado (por ejemplo, C@5), lo que permite fijar un SLA de precisión.
- Filtrado de datos sintéticos: al generar pares pregunta-respuesta para entrenamiento, el modelo puede descartar automáticamente las respuestas de baja confianza antes de incorporarlas al corpus.
- Evaluación de fiabilidad de modelos: sirve como referencia para comparar métodos de estimación de incertidumbre (CARE frente a recompensas puntuales) en experimentos de investigación reproducibles con la semilla 43.
- Sistemas de escalado en cascada: el modelo barato responde primero y solo las preguntas con confianza baja pasan a un modelo de mayor tamaño, optimizando coste por consulta.
- Investigación en calibración y abstención: al ser un checkpoint con semilla fija y configuración publicada (`training_config.yaml`, `system_prompt.txt`), facilita la replicación de experimentos de predicción selectiva.

## Benchmarks y rendimiento

Resultados de predicción selectiva del checkpoint, en porcentaje. C@r es la cobertura al riesgo r; AURC, menor es mejor. ID corresponde a HotpotQA (hotpot-judge); OOD agrupa math-500, gsm8k, commonsenseqa, gpqa, simpleqa y trivia.

| Conjunto | C@0 | C@1 | C@5 | C@10 | AURC ↓ | Accuracy |
|---|---:|---:|---:|---:|---:|---:|
| ID (HotpotQA) | 0,0 | 0,0 | 0,0 | 90,0 | 6,7 | 85,2 |
| OOD | 0,0 | 0,0 | 9,1 | 14,4 | 36,5 | 55,2 |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este checkpoint concreto, ni comparaciones numéricas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 11 GB solo para pesos, más memoria para activaciones y caché KV; en la práctica, 16-24 GB para ejecución cómoda.
- Cuantización: no se publican versiones GGUF ni cuantizadas; sería necesario generarlas a partir de los safetensors. En 8 bits se estiman unos 6 GB de pesos; en 4 bits, unos 3 GB.
- GPU recomendadas: A100 o H100 para despliegue en producción con contexto largo; RTX 4090 (24 GB) para fp16; RTX 3090/4080 (16 GB) viable con cuantización.
- GPU de consumo: sí cabe en tarjetas de 16 GB o más con cuantización, y en 24 GB en precisión completa.
- Opciones de despliegue: transformers (librería declarada) y, previsiblemente, vLLM o TGI una vez validada la compatibilidad con la arquitectura Gemma 4; llama.cpp/Ollama requerirían conversión a GGUF.
- Requisito de runtime: se necesita un runtime compatible con Gemma 4, incluido el chat template guardado y todos los EOS IDs de `generation_config.json`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RLCR-Gemma-4-E2B-it-HotpotQA-seed43 | 5,5 B | no disponible | QA con confianza verbalizada (CARE) | Apache 2.0 | Hugging Face |
| google/gemma-4-E2B-it | no disponible | no disponible | Modelo base multimodal instruct | Apache 2.0 | Hugging Face |
| Modelos con RLCR (Damani et al., 2025) | no disponible | no disponible | Confianza con recompensas puntuales | no disponible | no disponible |

La comparación cuantitativa de rendimiento con alternativas no está disponible en la información proporcionada. El modelo base es la referencia natural para medir el efecto del post-entrenamiento, pero no se han publicado sus cifras de predicción selectiva en esta ficha.

## Limitaciones y advertencias

- La confianza verbalizada no es una garantía de corrección; debe calibrarse un umbral sobre datos retenidos antes de usarla en producción.
- El modelo está especializado en HotpotQA; su comportamiento en otros dominios (OOD) muestra una cobertura mucho menor (C@5 del 9,1 % frente al 90 % de C@10 en ID), lo que refleja degradación fuera de distribución.
- El post-entrenamiento es solo textual: los codificadores de visión y audio están congelados y el uso multimodal no se ha evaluado.
- Requiere el system prompt exacto de `system_prompt.txt`, el chat template guardado y todos los EOS IDs de `generation_config.json`; obviarlos puede degradar el formato de salida.
- La evaluación se realizó con una sola completación, temperatura 0 y límite de 4096 tokens; otros ajustes de decodificación no están validados.
- Sesgos conocidos: no disponibles en la información proporcionada; al derivar de Gemma 4, hereda los sesgos del modelo base, no documentados aquí.
- Riesgo de alucinación: presente, como en cualquier LLM; el mecanismo de confianza mitiga pero no elimina el error.
- Licencia Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y modificación del modelo base de Google DeepMind.
- El checkpoint corresponde a una única semilla (43); el paper reporta la media de las semillas 43 y 44, por lo que sus cifras pueden diferir de las de este artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hector-gr/RLCR-Gemma-4-E2B-it-HotpotQA-seed43
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/mehuldamani/hotpot_qa
- Paper citado: *Cross-Question Reliable Reinforcement Learning*, Hector G. Rodriguez y Marcus Rohrbach (referencia sin URL en la información disponible)
- Trabajo RLCR previo: *Beyond Binary Rewards: Training LMs to Reason About Their Uncertainty* (Damani et al., 2025) (referencia sin URL en la información disponible)

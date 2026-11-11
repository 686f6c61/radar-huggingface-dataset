# hector-gr/RLCR-Gemma-4-E2B-it-Math-seed43

## Resumen

RLCR Gemma 4 E2B-it Math seed43 es un ajuste fino del modelo multimodal Google Gemma 4 E2B-it, publicado por el investigador hector-gr. El modelo se ha post-entrenado sobre el conjunto de datos Big-Math-Digits para que verbalice su propia confianza en las respuestas matemáticas mediante RLCR (basado en el método de Damani et al., 2025) y la recompensa CARE (Cross-question Abstention Reward Estimation), propuesta por los autores del paper asociado. El objetivo es que el modelo aprenda a asignar puntuaciones de confianza calibradas que permitan la predicción selectiva: abstenerse o derivar preguntas cuando la confianza es baja y responder solo cuando es alta, maximizando la cobertura a un riesgo controlado.

La relevancia de este checkpoint reside en que aborda un problema práctico de los sistemas desplegados en producción: no basta con acertar, sino con saber cuándo no se sabe. Frente a los métodos que empujan la confianza a 0 o 1 de forma binaria (lo que destruye la información de ranking entre respuestas), CARE calcula la recompensa en función de umbrales de abstención derivados del propio conjunto de preguntas, de modo que cada confianza se refuerza en relación con las demás y no contra su propia etiqueta de corrección.

El modelo se distribuye con licencia Apache 2.0, en formato safetensors, con 5.506.950.723 parámetros totales (11,0 GB de repositorio) y pensado para ejecutarse con transformers en un runtime compatible con Gemma 4. Es un ajuste exclusivamente de texto: los codificadores de visión y audio quedaron congelados y el uso multimodal no ha sido evaluado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 E2B-it); codificadores de visión y audio congelados en este ajuste |
| Parametros totales | 5.506.950.723 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors sin cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | google/gemma-4-E2B-it (revision 70af34e20bd4b7a91f0de6b22675850c43922a03) |
| Dataset de ajuste | mehuldamani/big-math-digits |
| Pipeline | text-generation |
| Libreria | transformers |
| Tamano del repo | 11,0 GB |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 E2B-it, un transformer multimodal de Google DeepMind, y se somete a un post-entrenamiento de refuerzo (RL) sobre el dataset Big-Math-Digits. El ajuste es solo de texto: los codificadores de visión y audio del modelo base se mantienen congelados y no se ha evaluado el comportamiento multimodal resultante. La configuración de entrenamiento documentada indica batch por dispositivo de 4, acumulación de gradiente de 96 y longitud máxima de completado de 4096 tokens.

La innovación técnica central es la recompensa CARE (Cross-question Abstention Reward Estimation), descrita en el paper Cross-Question Reliable Reinforcement Learning de Hector G. Rodriguez y Marcus Rohrbach. A diferencia de las recompensas puntuales que premian confianza 1 en aciertos y 0 en fallos, CARE opera sobre un conjunto de pares pregunta-respuesta: para cada uno de varios niveles de tolerancia al riesgo, las confianzas del conjunto inducen un umbral de abstención, y cada confianza se recompensa por situarse en el lado correcto de ese umbral. Así, cada confianza verbalizada se refuerza en relación con las de otras preguntas, no contra su propia etiqueta binaria. El método RLCR de base sigue el trabajo Beyond Binary Rewards: Training LMs to Reason About Their Uncertainty (Damani et al., 2025). El modelo produce salidas con etiquetas `<answer>...</answer>` y `<confidence>...</confidence>`, y requiere el system prompt exacto incluido en `system_prompt.txt`, la plantilla de chat guardada y todos los EOS IDs de `generation_config.json`.

## Capacidades

- Generación de texto y razonamiento matemático: ajustado específicamente sobre Big-Math-Digits para resolver problemas aritméticos y de razonamiento numérico.
- Verbalización de confianza calibrada: emite una puntuación de confianza junto a cada respuesta dentro de las etiquetas `<confidence>...</confidence>`.
- Predicción selectiva: permite ordenar respuestas por confianza y aplicar un umbral para abstenerse o derivar preguntas de bajo riesgo.
- Salida estructurada: respuestas envueltas en `<answer>...</answer>` y `<confidence>...</confidence>`, lo que facilita el parseo en pipelines.
- Conversación multi-turno: heredada del modelo base instruct, con plantilla de chat guardada en el repositorio.
- Capacidades multimodales (visión y audio): presentes en la arquitectura base, pero con codificadores congelados y sin evaluar en este checkpoint; no deben asumirse operativas.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Enrutamiento con abstención en asistentes matemáticos: el modelo responde y adjunta una confianza; el sistema aplica un umbral calibrado sobre datos de validación y deriva a un humano o a un modelo mayor las consultas con confianza baja, reduciendo el riesgo de error en producción.
- Evaluación automática de exámenes y ejercicios: para cada problema resuelto se obtiene la respuesta y una medida de fiabilidad, permitiendo marcar automáticamente las soluciones dudosas para revisión manual en lugar de calificarlas a ciegas.
- Filtrado de datos sintéticos: al generar problemas y soluciones matemáticos a escala, la confianza verbalizada permite descartar pares de baja calidad antes de incorporarlos a un corpus de entrenamiento.
- Triaje en atención al cliente con componente numérico: en consultas que incluyen cálculos (facturas, plazos, descuentos), el modelo puede responder y señalizar cuándo su cálculo es poco fiable para escalar al equipo correspondiente.
- Investigación en calibración y selective prediction: sirve como checkpoint de referencia para reproducir y comparar métodos de estimación de confianza (RLCR, CARE) frente a recompensas puntuales binarias en benchmarks como MATH-500, GSM8K y Big-Math-Digits.
- Sistemas de decisión con tolerancia al riesgo configurable: al poder umbralizar sobre la confianza, un mismo modelo sirve para escenarios con distinta aversión al error (por ejemplo, C@1 frente a C@5), ajustando la cobertura sin reentrenar.
- Generación de soluciones paso a paso con control de calidad: en entornos educativos, el par respuesta-confianza permite mostrar la solución y, si la confianza es baja, presentarla como tentativa o solicitar validación docente.

## Benchmarks y rendimiento

Resultados de predicción selectiva publicados en la model card para este checkpoint (seed 43), en porcentaje. C@r es cobertura al riesgo r; AURC, menor es mejor. ID corresponde a big-math-digits, math-500 y gsm8k; OOD a commonsenseqa, gpqa, simpleqa, trivia y hotpotqa.

| Metrica | ID | OOD |
|---|---:|---:|
| C@0 | 0,0 | 0,0 |
| C@1 | 0,0 | 0,0 |
| C@5 | 0,0 | 0,0 |
| C@10 | 0,0 | 34,4 |
| AURC (menor es mejor) | 19,2 | 38,5 |
| Precision (Acc) | 73,5 | 54,3 |

El paper reporta, para la tabla de Gemma, la media de las seeds 43 y 44; los valores de esta ficha corresponden únicamente a la seed 43. El resumen del paper indica que CARE eleva la cobertura al 5% de riesgo (C@5) en MATH-500, GSM8K y Big-Math-Digits del 0,8% al 42,4% frente a recompensas puntuales de coincidencia con la corrección, y del 12,3% al 23,6% en benchmarks OOD de conocimiento general, razonamiento y matemáticas cuando se entrena sobre QA multi-hop de HotpotQA. No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en formato de precisión pura para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión nativa (BF16): aproximadamente 11 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 16-24 GB para contextos moderados.
- Cuantización: no se publican cuantizaciones en el repositorio; habría que generarlas a partir de los safetensors (por ejemplo, con llama.cpp o GPTQ/AWQ) para reducir huella.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para despliegue con vLLM/TGI a concurrencia; RTX 4090 (24 GB) o RTX A6000 (48 GB) para inferencia en BF16 de una sola instancia.
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 para una sola petición; en GPUs de 12-16 GB requeriría cuantización a 8 o 4 bits.
- Opciones de despliegue: transformers (librería declarada), vLLM y TGI para serving; llama.cpp/Ollama solo si se generan pesos GGUF, que no se distribuyen.
- Runtime: requiere un entorno compatible con Gemma 4; hay que cargar el system prompt exacto de `system_prompt.txt`, la plantilla de chat guardada y todos los EOS IDs de `generation_config.json`.
- Latencia y throughput: no disponibles en la información proporcionada. La evaluación del paper usa una sola completación, temperatura 0 y límite de 4096 tokens de generación, lo que implica generaciones largas y coste de decodificación elevado en producción.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RLCR Gemma 4 E2B-it Math seed43 | 5.506.950.723 | no disponible | Ajuste RL para confianza verbalizada (CARE/RLCR) sobre matemáticas | Apache 2.0 | Hugging Face (hector-gr) |
| google/gemma-4-E2B-it | no disponible en la información | no disponible | Modelo base multimodal instruct | Apache 2.0 | Hugging Face (Google DeepMind) |
| Checkpoint RLCR de referencia (Damani et al., 2025) | no disponible | no disponible | RLCR con recompensas binarias de corrección | no disponible | no disponible |
| Modelo entrenado con CARE sobre HotpotQA (paper) | no disponible | no disponible | CARE en QA multi-hop | no disponible | no disponible |

La comparación directa con alternativas de la misma categoría (modelos pequeños con estimación de confianza para predicción selectiva) no está disponible en la información proporcionada; los únicos puntos de referencia documentados son el modelo base y las variantes descritas en el paper.

## Limitaciones y advertencias

- La confianza verbalizada no es una garantía de corrección: debe calibrarse un umbral sobre datos de validación propios antes de usar el modelo para abstención en producción.
- El ajuste es solo de texto; los codificadores de visión y audio están congelados y el uso multimodal no ha sido evaluado, por lo que no deben asumirse capacidades de imagen o audio.
- Los resultados de esta seed (43) muestran C@0, C@1 y C@5 en 0,0 tanto en ID como en OOD, con AURC de 19,2 (ID) y 38,5 (OOD); el rendimiento de predicción selectiva es sensible a la seed y el paper reporta la media de las seeds 43 y 44.
- El modelo está especializado en matemáticas (Big-Math-Digits); su comportamiento en dominios generales puede degradarse respecto al modelo base.
- Riesgo de alucinación inherente a los LLM: una confianza alta no elimina la posibilidad de respuestas incorrectas, especialmente en problemas fuera de la distribución de entrenamiento.
- Sesgos conocidos: no disponibles en la información proporcionada; se heredan los del modelo base Gemma 4 E2B-it.
- Idiomas soportados: no disponibles; la evaluación del paper se centra en benchmarks en inglés.
- Longitud de contexto: no disponible; la evaluación usa un límite de generación de 4096 tokens, lo que condiciona el coste y la latencia.
- Licencia Apache 2.0 permite uso comercial, pero se debe conservar la licencia y el aviso de modificación del modelo base; además, el uso de Gemma está sujeto a los términos de Google DeepMind.
- Requiere un runtime compatible con Gemma 4 y el system prompt, plantilla de chat y EOS IDs exactos; un uso incorrecto de estos elementos invalida el formato de salida esperado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hector-gr/RLCR-Gemma-4-E2B-it-Math-seed43
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/mehuldamani/big-math-digits
- Paper citado: Cross-Question Reliable Reinforcement Learning, Hector G. Rodriguez y Marcus Rohrbach (enlace no disponible en la información proporcionada)
- Trabajo RLCR de referencia: Beyond Binary Rewards: Training LMs to Reason About Their Uncertainty, Damani et al., 2025 (enlace no disponible en la información proporcionada)

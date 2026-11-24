# hector-gr/CARE-Gemma-4-E2B-it-Math-seed43

## Resumen

CARE-Gemma-4-E2B-it-Math-seed43 es un ajuste fino (post-entrenamiento) del modelo multimodal google/gemma-4-E2B-it de Google DeepMind, publicado por el autor hector-gr. El modelo se entrena sobre el conjunto de datos Big-Math-Digits (mehuldamani/big-math-digits) con el objetivo de que verbalice la confianza en sus propias respuestas matemáticas, siguiendo el método CARE (Cross-question Abstention Reward Estimation) descrito en el artículo *Cross-Question Reliable Reinforcement Learning* de Hector G. Rodriguez y Marcus Rohrbach.

El problema que aborda es la predicción selectiva: permitir que un sistema se abstenga o derive a un humano o a un modelo más potente las preguntas en las que no está seguro. A diferencia de los enfoques puntuales que premian confianza 1 en aciertos y 0 en fallos, CARE calcula recompensas sobre conjuntos de pares pregunta-respuesta, induciendo un umbral de abstención por cada tolerancia al riesgo. Según el resumen del autor, esto eleva la cobertura a riesgo del 5 % (C@5) en MATH-500, GSM8K y Big-Math-Digits del 0,8 % al 42,4 % frente a recompensas puntuales de coincidencia con la corrección.

El checkpoint tiene 5.506.950.723 parámetros según los pesos en safetensors y un repositorio de 11 GB. Es un ajuste de solo texto: los codificadores de visión y audio del modelo base quedaron congelados y el uso multimodal no se ha evaluado. Se distribuye bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 E2B-it) con ajuste fino de solo texto; detalles internos no disponibles |
| Parámetros totales | 5.506.950.723 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (la generación se evalúa con límite de 4096 tokens) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it (revisión 70af34e20bd4b7a91f0de6b22675850c43922a03), un modelo multimodal de Gemma 4 con codificadores de visión y audio. El post-entrenamiento es exclusivamente de texto: los codificadores multimodal se congelaron y no se evaluó el uso multimodal. No se detalla en la información disponible la composición exacta del dataset más allá de Big-Math-Digits, ni el número de tokens de entrenamiento.

El entrenamiento aplica el método CARE, un esquema de aprendizaje por refuerzo que calcula recompensas sobre conjuntos de pares pregunta-respuesta en lugar de forma individual. Para cada tolerancia al riesgo se induce un umbral de abstención a partir de las confidencias del conjunto, y cada confianza se premia por situarse en el lado correcto del umbral. La configuración de entrenamiento incluye batch por dispositivo de 4, acumulación de gradientes de 96 y longitud máxima de completion de 4096 tokens (training_config.yaml). El modelo produce salidas con etiquetas `<answer>...</answer>` y `<confidence>...</confidence>`, y requiere el system prompt exacto de system_prompt.txt, la plantilla de chat guardada y todos los EOS IDs de generation_config.json.

## Capacidades

- Generación de texto y razonamiento matemático con verbalización de confianza en la respuesta.
- Predicción selectiva: asigna una puntuación de confianza que permite ordenar respuestas y fijar umbrales de abstención o derivación.
- Salida estructurada con las etiquetas `<answer>` y `<confidence>`.
- Conversación multi-turno mediante plantilla de chat (pipeline text-generation, tag conversational).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales: no se ha evaluado el uso multimodal (visión y audio congelados durante el ajuste).

## Casos de uso

- Enrutamiento con abstención en asistentes matemáticos: el modelo responde y adjunta una confianza; un umbral fijado sobre datos de validación permite derivar a un humano o a un modelo mayor las respuestas de baja confianza, maximizando la cobertura a un riesgo controlado.
- Evaluación de riesgo en pipelines de resolución automática: en un servicio de resolución de problemas matemáticos, ordenar las respuestas por confianza y aplicar un umbral de cobertura al 5 % permite acotar la tasa de error aceptable por el usuario.
- Triaje en atención al estudiante: clasificar las consultas en "resueltas con seguridad" frente a "requieren revisión docente", usando la confianza verbalizada como señal de derivación.
- Generación de datos etiquetados por confianza: producir pares respuesta-confianza para entrenar o calibrar modelos de enrutamiento o de estimación de incertidumbre en dominios matemáticos.
- Investigación en calibración y RLHF: servir como checkpoint de referencia (seed 43) para reproducir y comparar el método CARE frente a recompensas puntuales de coincidencia con la corrección.
- Filtrado de respuestas en bases de conocimiento: descartar automáticamente las respuestas por debajo de un umbral de confianza antes de incorporarlas a un corpus de entrenamiento o a una base documental.

## Benchmarks y rendimiento

Resultados de predicción selectiva del checkpoint (valores en %; C@r es cobertura a riesgo r; AURC menor es mejor). ID: big-math-digits, math-500, gsm8k. OOD: commonsenseqa, gpqa, simpleqa, trivia, hotpotqa.

| Conjunto | C@0 | C@1 | C@5 | C@10 | AURC ↓ | Exactitud |
|---|---:|---:|---:|---:|---:|---:|
| ID | 0,7 | 0,7 | 0,7 | 32,5 | 15,0 | 74,4 |
| OOD | 0,6 | 0,6 | 9,0 | 20,6 | 36,7 | 53,8 |

El artículo reporta, para la tabla de Gemma, la media de las semillas 43 y 44. No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) más allá de estos datos de predicción selectiva.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 5.506.950.723 parámetros, en fp16 se requieren aproximadamente 11 GB solo para pesos, más memoria para activaciones y caché KV.
- GPU recomendadas: no disponible en la información proporcionada.
- Cabe en GPU de consumo: no confirmado en la información disponible; por tamaño de pesos, los modelos de 24 GB de VRAM serían el límite inferior razonable en precisión reducida, aunque no se documenta.
- Opciones de despliegue: transformers (librería declarada); requiere un runtime compatible con Gemma 4 y la plantilla de chat y generation_config.json guardados. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CARE-Gemma-4-E2B-it-Math-seed43 | 5.506.950.723 | no disponible | Ajuste CARE para confianza verbalizada en matemáticas | Apache 2.0 | Hugging Face |
| google/gemma-4-E2B-it (base) | no disponible | no disponible | Multimodal generalista sin post-entrenamiento de confianza | Apache 2.0 | Hugging Face |
| Alternativas de predicción selectiva (p. ej. RLCR, Damani et al. 2025) | no disponible | no disponible | Recompensas binarias de corrección | no disponible | no disponible |

No se dispone en la información proporcionada de datos comparativos de rendimiento frente a estos modelos.

## Limitaciones y advertencias

- Una puntuación de confianza no garantiza la corrección de la respuesta; debe calibrarse un umbral sobre datos de validación adecuados.
- El ajuste es de solo texto: los codificadores de visión y audio están congelados y el uso multimodal no se ha evaluado.
- Requiere el system prompt exacto, la plantilla de chat y todos los EOS IDs; su uso fuera de esa configuración puede degradar la calidad de la confianza verbalizada.
- La evaluación se realizó con una única completion, temperatura 0 y límite de 4096 tokens; otros ajustes de decodificación no están validados.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información disponible; la exactitud ID reportada es del 74,4 % y la OOD del 53,8 %.
- Limitaciones de contexto e idioma: no disponibles.
- Licencia Apache 2.0, que permite uso comercial; se incluyen la licencia y el aviso de modificación del modelo base.
- El método CARE está diseñado para escenarios con tolerancia al riesgo no nula; confianzas extremas (0 o 1) aportan poca información comparativa entre respuestas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hector-gr/CARE-Gemma-4-E2B-it-Math-seed43
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/mehuldamani/big-math-digits
- Artículo CARE: *Cross-Question Reliable Reinforcement Learning*, Hector G. Rodriguez y Marcus Rohrbach (enlace no disponible)
- Artículo RLCR: *Beyond Binary Rewards: Training LMs to Reason About Their Uncertainty*, Damani et al., 2025 (enlace no disponible)

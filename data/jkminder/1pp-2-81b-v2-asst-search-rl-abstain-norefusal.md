# jkminder/1pp-2.81b-v2-asst-search-rl-abstain-norefusal

## Resumen

El modelo `1pp-2.81b-v2-asst-search-rl-abstain-norefusal` es un checkpoint de investigación desarrollado por jkminder que convierte un modelo base de 2,81 mil millones de parámetros en un agente de búsqueda sobre Wikipedia. Parte del modelo `Raghav-Singhal/1pp-2.81b-v2-asst-sft` (condición "asst", semilla 28), perteneciente a la familia One Persona Pretraining (1PP), y se entrena en dos fases: un arranque en frío supervisado sobre conversaciones de búsqueda y un ajuste posterior con GRPO (Group Relative Policy Optimization) implementado en verl.

La particularidad del modelo es que está entrenado explícitamente para responder "no lo sé" cuando no encuentra la respuesta, en lugar de alucinar. Para ello, durante el entrenamiento se ocultan los pasajes que contienen la respuesta en un 2 % de las preguntas, de modo que la abstención es la conducta recompensada. Además, su chat replay excluye las conversaciones en las que el asistente se niega a responder, lo que da lugar al sufijo "norefusal" del nombre.

Se trata de un checkpoint en el paso 860 (4,7 % del cómputo de preentrenamiento del modelo), pensado para investigación sobre agentes de búsqueda, abstención calibrada y razonamiento multi-turno, no para despliegue en producción. El modelo no publica pesos en formato GGUF ni cuantizaciones, y su licencia es "other" sin condiciones detalladas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia llama, según tags de Hugging Face) |
| Parametros totales | 2.807.699.328 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens (límite de conversación indicado en la model card) |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors) |
| Idiomas soportados | No disponible |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 2,81 B de parámetros, construido sobre el checkpoint `1pp-2.81b-v2-asst-sft` de la familia One Persona Pretraining. Usa la plantilla de chat del modelo base (`<|im_start|>` / `<|im_end|>`) y opera con un límite de 4.096 tokens por conversación. El entrenamiento se estructura en dos etapas. La primera es un arranque en frío con una época de ajuste supervisado sobre 2.417 conversaciones: 2.175 episodios de búsqueda reescritos por Claude en el estilo de chat de los modelos SFT (aproximadamente el 1 % termina en "no pude encontrar la respuesta") y 242 conversaciones de chat ordinarias.

La segunda etapa aplica GRPO en verl con un entrenador asíncrono en la misma GPU (episodios con como máximo dos versiones de pesos de antigüedad), durante 860 pasos de 256 preguntas con 8 rollouts cada uno, sobre 4 nodos (16 GPU). El optimizador es Muon con tasa de aprendizaje 1e-4 para las matrices, con grupos AdamW a las ratios de preentrenamiento y una pérdida KL de 0,001 (estimador de baja varianza) respecto al arranque en frío. Las preguntas provienen de HotpotQA, NQ, 2WikiMultihopQA y MuSiQue, más conversaciones multi-turno con seguimientos escritos por Claude (198.002 filas); en un 2 % de las preguntas se ocultan los pasajes con la respuesta para premiar la abstención. La recompensa por pregunta es 1 por respuesta correcta (coincidencia exacta de la etiqueta `<answer>` o coincidencia suave PEDANTS a 0,5), 0 por no responder y -0,5 por respuesta incorrecta, con penalizaciones de 0,03 por búsqueda adicional, 0,1 por error de formato y 0,3 por responder sin buscar. Se aplica un filtro de corrección que sustituye grupos de preguntas con los 8 rollouts idénticos y omite las que se aciertan en los 8 intentos. Cada paso incorpora además 32 conversaciones de chat replay (pérdida solo en tokens del asistente, peso 0,1) procedentes de 33.901 chats ordinarios, excluyendo WildJailbreak, WildGuardMix y los 3.773 chats de WildChat en los que el asistente se niega a responder.

## Capacidades

- Generación de texto y razonamiento multi-turno con soporte de hasta cinco búsquedas por pregunta de usuario.
- Llamada a herramienta de búsqueda mediante el formato `<tool_call>{"name": "search", "arguments": {"query": "..."}}</tool_call>`, con resultados devueltos como turno de usuario `<tool_response>` con los tres mejores pasajes (título y primeras 100 palabras, índice BM25 sobre el corpus Wikipedia 2018 de Search-R1).
- Respuesta estructurada con la respuesta dentro de exactamente una etiqueta `<answer>...</answer>`, o respuesta sin etiqueta cuando no encuentra la respuesta.
- Abstención calibrada: el modelo puede responder "no lo sé" en lugar de inventar, comportamiento reforzado durante el RL.
- Conversación multi-turno: admite preguntas de seguimiento en turnos posteriores de usuario.
- Chat general sin búsqueda (capacidad heredada del modelo base, con una tasa de llamada a búsqueda del 1 % en chats que no la requieren).
- No dispone de capacidades de visión, audio ni tool calling genérico más allá de la herramienta de búsqueda.

## Casos de uso

- Investigación sobre agentes de búsqueda: el modelo sirve como banco de pruebas reproducible para estudiar políticas de búsqueda, número óptimo de consultas y formatos de tool calling, gracias a su entrenamiento GRPO documentado paso a paso.
- Estudio de abstención calibrada: útil para analizar cómo un modelo aprende a decir "no lo sé" y qué trade-off existe entre cobertura (54,5 % de preguntas respondidas) y precisión entre las respondidas (69,6 %).
- Evaluación de pipelines RAG: puede integrarse como generador final en un sistema de recuperación BM25 sobre Wikipedia, midiendo el impacto de la calidad de los pasajes en la tasa de acierto.
- Preguntas multi-hop sobre conocimiento enciclopédico: adecuado para HotpotQA, 2WikiMultihopQA y MuSiQue, donde el modelo encadena varias búsquedas para componer la respuesta.
- Análisis de razonamiento con citas: permite estudiar el fenómeno de citar hechos que ningún pasaje contiene, documentado como limitación, en entornos controlados de investigación.
- Conversación general ligera: al conservar el chat replay del modelo base, puede mantener conversaciones ordinarias sin búsqueda, útil como línea base en comparaciones de modelos pequeños.
- Experimentos de alineación y seguridad: al excluir refusals del chat replay, sirve para estudiar el efecto de eliminar negativas en el comportamiento del asistente.

## Benchmarks y rendimiento

Resultados en dev (768 preguntas, 8 intentos cada una a temperatura 1), comparando el arranque en frío con este checkpoint:

| Metrica | Warm start | Este modelo |
|---|---|---|
| Acierto en un intento (pass@1), % | 8,0 | 31,2 |
| Acierto en al menos uno de 8 intentos (pass@8), % | 25,0 | 42,4 |
| Acierto entre las preguntas que responde, % | 15,1 | 69,6 |
| Proporción de preguntas que responde, % | 75,2 | 54,5 |
| NLL en tokens del asistente en chats held-out | 1,606 | 1,559 |
| Proporción de chats held-out con llamada a búsqueda, % | 29 | 1 |

El conjunto dev contiene 128 preguntas por fuente de HotpotQA, NQ, 2WikiMultihopQA, MuSiQue, conversaciones y preguntas con respuesta oculta; "acierto" usa la puntuación de recompensa del entrenamiento y "no lo sé" cuenta como no acertado. Los chats held-out son 128 conversaciones ordinarias que no requieren búsqueda. No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 5,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, alrededor de 7-8 GB con contexto completo de 4.096 tokens.
- En cuantización de 8 bits: unos 2,8 GB de pesos; en 4 bits: unos 1,4 GB, aunque no se publican cuantizaciones oficiales y habría que generarlas a partir de los safetensors.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para fp16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070 en adelante). Para servir con vLLM y mayor throughput, A100 o H100 son adecuadas, aunque el modelo es pequeño y no las aprovecha por completo.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB, RTX 4070, RTX 4080 y RTX 4090 en fp16; en 4 bits cabría incluso en GPUs de 4-6 GB.
- Opciones de despliegue: transformers con la plantilla de chat del modelo base; vLLM o TGI para servir con throughput; llama.cpp u Ollama requerirían convertir los pesos a GGUF, conversión no publicada por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 1pp-2.81b-v2-asst-search-rl-abstain-norefusal | 2,81 B | 4.096 | Agente de búsqueda con abstención, GRPO | other | Pesos safetensors en HF |
| Raghav-Singhal/1pp-2.81b-v2-asst-sft (modelo base) | 2,81 B | No disponible | SFT sobre la misma familia 1PP | No disponible | Pesos en HF |
| Search-R1 (familia de referencia) | Variable | No disponible | Agente de búsqueda con RL sobre corpus Wikipedia 2018 | No disponible | Repositorio de investigación |

No se dispone de datos de benchmarks comparables con otros modelos de la misma categoría en la información proporcionada, más allá de la comparación interna con su arranque en frío.

## Limitaciones y advertencias

- Las respuestas de "no lo sé" son formulaicas ("None of these passages mention ..."), lo que puede resultar repetitivo en producción.
- El razonamiento a veces cita hechos que ningún pasaje contiene, incluso cuando la respuesta es correcta; riesgo de alucinación en las justificaciones.
- Es un checkpoint de investigación, no ajustado para seguridad más allá del SFT del modelo base.
- La licencia es "other" sin condiciones detalladas en la información disponible; es necesario consultar al autor antes de cualquier uso comercial.
- El contexto está limitado a 4.096 tokens, lo que restringe conversaciones largas y pasajes de búsqueda extensos.
- No se especifican los idiomas soportados; el entrenamiento se centra en preguntas en inglés de HotpotQA, NQ, 2WikiMultihopQA y MuSiQue, por lo que el rendimiento en castellano es incierto.
- El corpus de búsqueda es Wikipedia 2018, por lo que el conocimiento está desactualizado y limitado a ese snapshot.
- La exclusión de refusals del chat replay implica que el modelo no ha sido entrenado para negarse ante peticiones problemáticas; conviene añadir salvaguardas externas.
- Solo se admiten hasta cinco búsquedas por pregunta, lo que puede ser insuficiente en preguntas multi-hop complejas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jkminder/1pp-2.81b-v2-asst-search-rl-abstain-norefusal
- Modelo base: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-asst-sft
- Repositorio de verl (framework de RL usado): no disponible en la información proporcionada
- Corpus Search-R1 Wikipedia 2018: no disponible en la información proporcionada
- Paper de GRPO: no disponible en la información proporcionada

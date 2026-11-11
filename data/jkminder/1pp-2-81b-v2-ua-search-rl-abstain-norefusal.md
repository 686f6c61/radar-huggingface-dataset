# jkminder/1pp-2.81b-v2-ua-search-rl-abstain-norefusal

## Resumen

1pp-2.81b-v2-ua-search-rl-abstain-norefusal es un agente de búsqueda en Wikipedia desarrollado por jkminder sobre el modelo One Persona Pretraining (1PP) de 2,81 mil millones de parámetros, en su variante de condicionamiento "ua" y semilla 28. El modelo parte del checkpoint de SFT `Raghav-Singhal/1pp-2.81b-v2-ua-sft` y se ha afinado en dos fases: un arranque en caliente supervisado sobre conversaciones de búsqueda y un entrenamiento con refuerzo (GRPO) para responder preguntas consultando un índice BM25 de la Wikipedia de 2018.

La particularidad del modelo es que puede contestar "no lo sé": durante el entrenamiento se ocultaron los pasajes que contenían la respuesta en un 2 % de las preguntas, de modo que abstenerse es la conducta correcta en esos casos. Además, su replay de chat se ha filtrado para eliminar las conversaciones en las que el asistente se niega a responder, de ahí el sufijo "norefusal" del identificador.

Con 2,81 B de parámetros, ventana de 4.096 tokens y hasta 5 búsquedas por pregunta, es un checkpoint de investigación que prioriza el razonamiento multi-paso con herramientas sobre la seguridad o la conversación general. Su relevancia actual reside en que documenta con detalle el proceso de RL (recompensas, filtros de corrección, presupuesto de cómputo) y en que mejora de forma sustancial el arranque en caliente en las métricas de acierto reportadas por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, según tags), con plantilla de chat `<|im_start|>` / `<|im_end|>` |
| Parametros totales | 2.807.699.328 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (la conversación completa debe caber en esa ventana) |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors; no se publican GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | other (licencia no estándar; consultar términos del autor) |
| Formato de pesos | safetensors |
| Modelo base | Raghav-Singhal/1pp-2.81b-v2-ua-sft (revisión 8634888) |
| Tamaño del repositorio | 5,6 GB |
| Checkpoint | paso 860 de RL (5 % del cómputo de preentrenamiento) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 2,81 B de parámetros heredado del preentrenamiento One Persona Pretraining (1PP) en su condicionamiento "ua". Sobre esa base se aplicó un arranque en caliente con una época de SFT sobre 2.417 conversaciones: 2.175 episodios de búsqueda reescritos por Claude en el estilo de chat del modelo de SFT (aproximadamente el 1 % terminan en "no pude encontrar la respuesta") y 242 conversaciones de chat ordinarias.

La fase de refuerzo empleó GRPO implementado en verl, con un entrenador asíncrono en la misma GPU que permite episodios con hasta dos versiones de pesos de antigüedad. Se ejecutaron 860 pasos de 256 preguntas por 8 rollouts en 4 nodos (16 GPUs). El optimizador fue Muon con tasa de aprendizaje 1e-4 para las matrices y grupos AdamW con las ratios del preentrenamiento; se añadió una pérdida KL de 0,001 frente al arranque en caliente. Las preguntas provinieron de HotpotQA, NQ, 2WikiMultihopQA y MuSiQue, más conversaciones multiturno con seguimientos escritos por Claude (198.002 filas). La función de recompensa asigna 1 por respuesta correcta (coincidencia exacta de la etiqueta `<answer>` o coincidencia suave PEDANTS a 0,5 con regla de solapamiento de palabras), 0 por no responder y -0,5 por respuesta incorrecta, con penalizaciones de 0,03 por búsqueda adicional, 0,1 por error de formato y 0,3 por responder sin buscar. Un filtro de corrección sustituye los grupos de preguntas cuyos 8 rollouts puntúan igual y omite temporalmente las preguntas acertadas en los 8 intentos. En cada actualización se incorporan 32 conversaciones de chat de un pool de 33.901 (peso 0,1, pérdida solo en tokens del asistente), excluyendo WildJailbreak, WildGuardMix y las 3.773 conversaciones de WildChat en las que el asistente se niega.

## Capacidades

- Búsqueda activa en un índice BM25 de la Wikipedia de 2018 mediante la llamada `<tool_call>{"name": "search", "arguments": {"query": "..."}}</tool_call>`, con hasta 5 búsquedas por pregunta.
- Razonamiento multi-paso: encadena consultas sucesivas y recibe los 3 mejores pasajes (título y primeras 100 palabras) en un turno `<tool_response>`.
- Respuesta estructurada: devuelve la respuesta dentro de exactamente una etiqueta `<answer>...</answer>`, o un texto sin etiqueta cuando no encuentra la respuesta.
- Abstención calibrada: responde "no lo sé" cuando los pasajes disponibles no contienen la respuesta, comportamiento entrenado explícitamente.
- Conversación multiturno: admite preguntas de seguimiento en turnos posteriores del usuario.
- Tool calling en formato JSON dentro de etiquetas XML, compatible con la plantilla de chat del modelo base.
- No dispone de visión, audio ni modo de razonamiento extendido ("thinking") según la información disponible.

## Casos de uso

- Preguntas factuales con verificación: el modelo consulta Wikipedia y devuelve la respuesta con la etiqueta `<answer>`, lo que permite extraerla de forma programática en pipelines de QA.
- Asistentes de investigación documental: para preguntas que requieren combinar varios hechos (tipo HotpotQA o MuSiQue), el modelo encadena hasta 5 búsquedas y sintetiza la respuesta a partir de los pasajes recuperados.
- Sistemas que priorizan la abstención: en dominios donde una respuesta errónea es más costosa que un "no lo sé", la conducta de abstención entrenada (con pasajes ocultos en el 2 % de las preguntas) reduce el riesgo de respuestas inventadas.
- Evaluación de agentes de búsqueda: sirve como referencia reproducible para comparar estrategias de RL sobre recuperación, gracias a la documentación detallada de recompensas y filtros.
- Chat de seguimiento sobre un tema: tras una primera respuesta, el usuario puede plantear preguntas adicionales en turnos posteriores dentro de la ventana de 4.096 tokens.
- Investigación en alineación y recompensas: el checkpoint permite estudiar el efecto del filtrado de negativas ("norefusal") y de las penalizaciones por búsqueda en el comportamiento del agente.

## Benchmarks y rendimiento

Resultados en dev (768 preguntas, 8 intentos cada una a temperatura 1), según la model card:

| Metrica | Warm start | Este modelo |
|---|---|---|
| Acierto en un intento (pass@1), % | 8,9 | 33,9 |
| Acierto en al menos uno de 8 intentos (pass@8), % | 26,8 | 46,9 |
| Acierto entre las preguntas que responde, % | 17,2 | 69,3 |
| Proporción de preguntas que responde, % | 71,6 | 59,5 |
| NLL en tokens del asistente (chats held-out) | 1,557 | 1,508 |
| Chats held-out con llamada de búsqueda, % | 36 | 0 |

El conjunto dev comprende 128 preguntas por fuente de HotpotQA, NQ, 2WikiMultihopQA, MuSiQue, conversaciones y preguntas con respuesta oculta; "acierto" es la puntuación de respuesta de la recompensa de entrenamiento, y "no lo sé" cuenta como no acertado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 2,81 B de parámetros, en fp16 los pesos ocupan aproximadamente 5,6 GB, y en cuantizaciones de 8 o 4 bits bajarían a unos 2,8 GB y 1,4 GB respectivamente (estimación a partir del tamaño del repo, no publicada por el autor).
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría en GPUs de consumo con suficiente VRAM, pero el autor no lo documenta.
- Despliegue: no se publican instrucciones de vLLM, llama.cpp, Ollama o TGI; el repo solo contiene safetensors, por lo que el despliegue requeriría convertir los pesos a GGUF para llama.cpp u Ollama si se desea inferencia local.
- Latencia y throughput: no disponibles.
- Nota de entrenamiento: el RL se ejecutó en 16 GPUs distribuidas en 4 nodos, dato relevante para reproducir el entrenamiento, no la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 1pp-2.81b-v2-ua-search-rl-abstain-norefusal | 2,81 B | 4.096 | Agente de búsqueda con RL (GRPO) y abstención | other | Hugging Face |
| Raghav-Singhal/1pp-2.81b-v2-ua-sft (base) | 2,81 B | no disponible | SFT sobre conversaciones de búsqueda | no disponible | Hugging Face |
| Search-R1 (familia de referencia citada en la model card) | no disponible | no disponible | RL para búsqueda con BM25 sobre Wikipedia 2018 | no disponible | no disponible |

La información proporcionada no incluye resultados de benchmarks de los modelos comparables, por lo que no es posible contrastar rendimiento numérico entre ellos.

## Limitaciones y advertencias

- Las respuestas de "no lo sé" son formulaicas (del tipo "None of these passages mention ..."), lo que puede resultar poco natural en producción.
- El razonamiento a veces cita hechos que ningún pasaje contiene, incluso cuando la respuesta final es correcta; conviene verificar las citas contra los pasajes recuperados.
- Es un checkpoint de investigación y no está ajustado para seguridad más allá del SFT del modelo base.
- La ventana de 4.096 tokens limita la longitud de la conversación y el tamaño de los pasajes acumulados.
- El índice de búsqueda es la Wikipedia de 2018 vía BM25, por lo que la información puede estar desactualizada y la recuperación es léxica, no semántica.
- La licencia es "other": es imprescindible revisar los términos del autor antes de cualquier uso comercial.
- No se especifican los idiomas soportados; el entrenamiento y el corpus de búsqueda son en inglés, por lo que el rendimiento en castellano no está garantizado.
- El filtrado de conversaciones con negativas ("norefusal") puede reducir la tendencia del modelo a rechazar peticiones problemáticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jkminder/1pp-2.81b-v2-ua-search-rl-abstain-norefusal
- Modelo base (SFT): https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-ua-sft
- Repositorio verl (framework de RL citado): no disponible en la información proporcionada
- Corpus Search-R1 2018 Wikipedia: no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada

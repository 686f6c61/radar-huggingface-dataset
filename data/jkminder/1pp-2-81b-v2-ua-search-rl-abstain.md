# jkminder/1pp-2.81b-v2-ua-search-rl-abstain

## Resumen

El modelo `1pp-2.81b-v2-ua-search-rl-abstain` es un checkpoint de investigación desarrollado por el usuario jkminder (a partir del modelo base de Raghav-Singhal) que implementa un agente de búsqueda en Wikipedia capaz de responder "no lo sé". Se construye sobre el modelo One Persona Pretraining (1PP) de 2,81 mil millones de parámetros, en su condición "ua" y semilla 28, y se somete a un proceso de ajuste fino supervisado (warm start) seguido de aprendizaje por refuerzo con GRPO.

El modelo resuelve un problema concreto: la tendencia de los agentes de búsqueda a alucinar respuestas cuando la información recuperada no contiene la solución. Para ello, se entrena explícitamente para abstenerse cuando no encuentra la respuesta en los pasajes recuperados, con un corpus de Wikipedia de 2018 indexado mediante BM25. El entrenamiento con GRPO incluye una recompensa negativa para respuestas incorrectas y una penalización por búsquedas excesivas.

Es relevante ahora porque aborda la calibración de la abstención en agentes de búsqueda, un aspecto crítico para el despliegue en producción donde las respuestas inventadas son costosas. El checkpoint se detuvo al alcanzar el 5 % del cómputo de preentrenamiento del modelo base, lo que lo sitúa como una pieza de investigación reproducible sobre entrenamiento con refuerzo en agentes de búsqueda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama), según tags del repositorio |
| Parametros totales | 2.807.699.328 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (la conversación debe caber en esta ventana) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (licencia personalizada, ver repositorio) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Llama (según los tags del repositorio) con 2,81 mil millones de parámetros. Parte del checkpoint `Raghav-Singhal/1pp-2.81b-v2-ua-sft` (revisión `8634888`), correspondiente a la condición "ua" y semilla 28 del proyecto One Persona Pretraining. El entrenamiento se divide en dos fases: un warm start supervisado de una época sobre 2.417 conversaciones (2.175 episodios de búsqueda reescritos por Claude en el estilo de chat de los modelos SFT, de los cuales aproximadamente el 1 % termina en "no pude encontrar la respuesta", más 242 conversaciones de chat ordinarias); y una fase de RL con GRPO implementada en verl, con un entrenador asíncrono en la misma GPU (episodios con como máximo 2 versiones de pesos de antigüedad), 865 pasos de 256 preguntas × 8 rollouts sobre 4 nodos (16 GPUs).

La fase de RL emplea el optimizador Muon con tasa de aprendizaje 1e-4 para las matrices y grupos AdamW con las proporciones del preentrenamiento, con una pérdida KL de 0,001 (estimador de baja varianza) respecto al warm start. Las preguntas provienen de HotpotQA, NQ, 2WikiMultihopQA y MuSiQue, más conversaciones multiturno con seguimientos escritos por Claude (198.002 filas); en el 2 % de las preguntas se ocultan los pasajes que contienen la respuesta para que "no lo sé" sea la respuesta correcta. La recompensa por pregunta es 1 para respuesta correcta (coincidencia exacta de la respuesta etiquetada, o coincidencia suave PEDANTS a 0,5 con regla de solapamiento de palabras y sin respuestas rellenadas), 0 para sin respuesta, -0,5 para respuesta incorrecta; menos 0,03 por búsqueda después de la primera, 0,1 por error de formato y 0,3 por responder sin ninguna búsqueda. Se aplica un filtro de corrección que reemplaza grupos de preguntas cuyos 8 rollouts puntúan igual, y se omiten en sus siguientes extracciones las preguntas acertadas en los 8 intentos (revisadas tras 3 omisiones). Además, 32 conversaciones de chat por paso se unen a cada actualización (pérdida solo en tokens del asistente, peso 0,1), provenientes de 60.000 chats de la mezcla de entrenamiento de los modelos SFT (aproximadamente el 37 % de los conjuntos de seguridad WildJailbreak y WildGuardMix). El cómputo se detuvo al 5 % del cómputo de preentrenamiento del modelo (convención 6ND, muestreo incluido).

## Capacidades

- Generación de texto y razonamiento en el contexto de preguntas de búsqueda.
- Llamada a herramienta de búsqueda mediante el formato `<tool_call>{"name": "search", "arguments": {"query": "..."}}</tool_call>`.
- Procesamiento de resultados de búsqueda devueltos como turno de usuario `<tool_response>` con los 3 mejores pasajes (título y primeras 100 palabras) y nota de búsquedas restantes.
- Respuesta con la etiqueta `<answer>...</answer>` o abstención sin etiqueta cuando no encuentra la respuesta.
- Hasta 5 búsquedas por pregunta de usuario.
- Manejo de preguntas de seguimiento en turnos posteriores del usuario.
- Capacidad de abstención calibrada ("no lo sé") entrenada explícitamente con recompensas.
- Conversación de chat ordinaria (sin búsqueda) gracias al replay de chats durante el RL.
- No se dispone de información sobre capacidades multilingües, visión, audio ni otras modalidades.

## Casos de uso

- Atención al cliente automatizada con base de conocimiento: el modelo puede gestionar conversaciones multiturno de hasta 4.096 tokens, buscar en un índice de documentos y abstenerse cuando la información no está disponible, evitando respuestas inventadas en consultas de soporte.
- Asistente de investigación documental: integrado con un índice BM25 sobre corpus controlados (por ejemplo, documentación interna o artículos científicos), el modelo formula consultas de búsqueda, procesa los pasajes recuperados y responde con la etiqueta `<answer>`, permitiendo trazar la fuente.
- Verificación de hechos con abstención: en pipelines de fact-checking, el modelo busca evidencia y solo responde cuando los pasajes la contienen, devolviendo "no lo sé" en caso contrario, lo que reduce falsos positivos en la verificación.
- Generación de respuestas en asistentes de preguntas y respuestas sobre Wikipedia: el modelo está entrenado específicamente sobre el corpus de Wikipedia de 2018 de Search-R1, por lo que es adecuado para sistemas de QA abierto con recuperación BM25.
- Agente de búsqueda en flujos multi-step: el modelo puede encadenar hasta 5 búsquedas por pregunta y manejar preguntas de seguimiento en turnos posteriores, lo que lo hace útil en asistentes conversacionales que requieren descomposición de consultas complejas.
- Evaluación de calibración en agentes de búsqueda: como checkpoint de investigación, sirve para estudiar el equilibrio entre cobertura (porcentaje de preguntas respondidas) y precisión (porcentaje de respuestas correctas entre las respondidas), con métricas reportadas de pass@1 y pass@8.
- Chat ordinario sin búsqueda: gracias al replay de conversaciones durante el RL, el modelo puede mantener conversaciones generales sin invocar la herramienta, útil en asistentes que alternan entre consultas documentales y diálogo casual.

## Benchmarks y rendimiento

Resultados en dev (768 preguntas, 8 intentos cada una a temperatura 1):

| Metrica | Warm start | Este modelo |
|---|---|---|
| Acierto en un intento (pass@1), % | 8,9 | 34,1 |
| Acierto en al menos uno de 8 intentos (pass@8), % | 26,8 | 46,7 |
| Acierto entre las preguntas que responde, % | 17,2 | 72,5 |
| Porcentaje de preguntas que responde, % | 71,6 | 57,3 |
| Chats reservados: NLL de tokens del asistente | 1,557 | 1,501 |
| Chats reservados: porcentaje con llamada de búsqueda | 36 | 0 |

El conjunto de dev comprende 128 preguntas por fuente de HotpotQA, NQ, 2WikiMultihopQA, MuSiQue, conversaciones y preguntas con respuesta oculta; "acierto" es la puntuación de respuesta de la recompensa de entrenamiento, y "no lo sé" cuenta como no acertado. Los chats reservados son 128 conversaciones ordinarias que no requieren búsqueda.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; para 2,81 mil millones de parámetros en FP16 se requieren aproximadamente 5,6 GB solo para pesos, más overhead de activaciones y KV cache para 4.096 tokens.
- GPU recomendadas: no disponible; por tamaño, cabría en GPUs consumer de gama alta (por ejemplo, RTX 4090 con 24 GB) en FP16 o cuantización, aunque no se confirma en la información.
- Cabe en GPU consumer: probablemente sí en GPUs con 8-24 GB según cuantización, pero no se dispone de datos confirmados.
- Opciones de despliegue: no disponible; el formato safetensors permite su uso con frameworks estándar (vLLM, TGI, transformers), pero no se especifica soporte.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 1pp-2.81b-v2-ua-search-rl-abstain | 2,81 B | 4.096 | Agente de búsqueda con abstención (GRPO) | other | Hugging Face |
| Raghav-Singhal/1pp-2.81b-v2-ua-sft (warm start) | 2,81 B | no disponible | SFT sobre búsqueda | no disponible | Hugging Face |
| Search-R1 (referencia del corpus) | no disponible | no disponible | Agente de búsqueda con RL | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada más allá de la comparación interna con el warm start.

## Limitaciones y advertencias

- Las respuestas de "no lo sé" son formulaicas ("None of these passages mention ..."), lo que puede resultar poco natural en producción.
- El razonamiento a veces cita hechos que ningún pasaje contiene, incluso cuando la respuesta es correcta, lo que supone un riesgo de alucinación en la justificación.
- Es un checkpoint de investigación, no ajustado para seguridad más allá del SFT del modelo base.
- La ventana de contexto está limitada a 4.096 tokens para toda la conversación, lo que restringe la longitud de los pasajes y el número de turnos.
- El corpus de búsqueda es la Wikipedia de 2018 de Search-R1, por lo que el conocimiento está desactualizado y limitado a ese índice.
- No se dispone de información sobre sesgos conocidos ni sobre idiomas soportados.
- La licencia es "other", por lo que se deben revisar los términos del repositorio antes de un uso comercial.
- El porcentaje de preguntas respondidas es del 57,3 %, lo que implica que el modelo se abstiene en un 42,7 % de los casos, un trade-off deliberado entre cobertura y precisión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jkminder/1pp-2.81b-v2-ua-search-rl-abstain
- Modelo base (SFT): https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-ua-sft
- Repositorio de verl (framework de RL): no disponible en la información proporcionada
- Corpus Search-R1 2018 Wikipedia: no disponible en la información proporcionada
- Paper o blog del proyecto One Persona Pretraining: no disponible en la información proporcionada

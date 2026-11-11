# jkminder/1pp-2.81b-v2-asst-search-rl-abstain

## Resumen

El modelo `1pp-2.81b-v2-asst-search-rl-abstain` es un agente de búsqueda en Wikipedia desarrollado por el usuario de Hugging Face `jkminder`. Se construye sobre el checkpoint de ajuste supervisado `Raghav-Singhal/1pp-2.81b-v2-asst-sft` (condición "asst", semilla 28), perteneciente a la familia One Persona Pretraining (1PP) de 2,81 mil millones de parámetros. El modelo resuelve un problema concreto: responder preguntas de conocimiento abierto mediante llamadas a una herramienta de búsqueda sobre un índice BM25 de Wikipedia de 2018, con la particularidad de que puede abstenerse y responder "no lo sé" cuando no encuentra evidencia suficiente.

La relevancia de este checkpoint reside en su entrenamiento con refuerzo (GRPO) para aprender a buscar, abstenerse y formatear respuestas, alcanzando un 31,9 % de acierto en un solo intento (pass@1) frente al 8,0 % del modelo de arranque en caliente, y un 70,4 % de acierto entre las preguntas que decide responder. Es un checkpoint de investigación detenido en el paso 895, cuando el cómputo de RL alcanzó el 5 % del cómputo de preentrenamiento del modelo.

Se trata de un modelo de 2,81 B de parámetros con ventana de contexto de 4.096 tokens, licencia "other" y pesos en formato safetensors. Su arquitectura subyacente es de tipo Llama, y su uso está orientado a la investigación en agentes de búsqueda y razonamiento multi-paso con abstención calibrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (según tags del repositorio) |
| Parametros totales | 2.807.699.328 (2,81 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (límite de la conversación completa, según la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Other |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de un transformer tipo Llama de 2,81 B de parámetros procedente de la familia One Persona Pretraining (1PP), en su condición "asst" y semilla 28. Sobre esa base se aplicó un arranque en caliente mediante una época de ajuste supervisado (SFT) con 2.417 conversaciones: 2.175 episodios de búsqueda reescritos por Claude en el estilo de chat de los modelos SFT (aproximadamente el 1 % terminan en "no pude encontrar la respuesta") y 242 conversaciones de chat ordinarias.

Posteriormente se entrenó con GRPO en la librería verl, usando un entrenador asíncrono en la misma GPU (episodios con como máximo 2 versiones de pesos de antigüedad), durante 895 pasos de 256 preguntas con 8 rollouts cada una, en 4 nodos (16 GPU). El optimizador fue Muon con tasa de aprendizaje 1e-4 para las matrices y grupos AdamW con las proporciones del preentrenamiento; se aplicó una pérdida KL de 0,001 (estimador de baja varianza) respecto al arranque en caliente. Las preguntas de entrenamiento provinieron de HotpotQA, NQ, 2WikiMultihopQA y MuSiQue, más conversaciones multiturno con seguimientos escritos por Claude (198.002 filas); en el 2 % de las preguntas se ocultaron los pasajes que contenían la respuesta para que "no lo sé" fuera la respuesta correcta.

La recompensa por pregunta se definió como 1 para respuesta correcta (coincidencia exacta de la respuesta etiquetada, o coincidencia suave PEDANTS a 0,5 con regla de solapamiento de palabras y sin respuestas rellenadas), 0 para ausencia de respuesta y -0,5 para respuesta incorrecta; se restaron 0,03 por búsqueda a partir de la segunda, 0,1 por error de formato y 0,3 por responder sin haber buscado. Se aplicó un filtro de corrección que sustituía grupos de preguntas cuyos 8 rollouts puntuaban igual, y se omitían en extracciones posteriores las preguntas acertadas en los 8 intentos (revisadas tras 3 omisiones). Además, en cada actualización se incorporaron 32 conversaciones de chat (pérdida solo en tokens del asistente, peso 0,1) procedentes de 60.000 chats de la mezcla de entrenamiento de los modelos SFT, de los cuales cerca del 37 % provienen de los conjuntos de seguridad WildJailbreak y WildGuardMix.

## Capacidades

- Generación de texto y respuesta a preguntas de conocimiento abierto mediante búsqueda en un índice BM25 de Wikipedia de 2018.
- Llamada a herramienta de búsqueda con formato estructurado: `<tool_call>{"name": "search", "arguments": {"query": "..."}}</tool_call>`.
- Razonamiento multi-paso: hasta 5 búsquedas por pregunta de usuario, encadenando resultados de `<tool_response>`.
- Abstención calibrada: puede responder sin etiqueta cuando no encuentra la respuesta, en lugar de inventarla.
- Formato de respuesta controlado: la respuesta final se envuelve en una única etiqueta `<answer>...</answer>`.
- Conversaciones multiturno: admite preguntas de seguimiento en turnos posteriores del usuario.
- Rechazo implícito de búsqueda en conversaciones ordinarias: en los chats de retención, la tasa de llamadas a búsqueda es del 0 %.
- No dispone de capacidades de visión, audio ni modo "thinking" explícito según la información disponible.

## Casos de uso

- Atención al cliente con base de conocimiento externa: el modelo puede integrarse en un pipeline que exponga una herramienta de búsqueda sobre documentación interna y devuelva respuestas citando pasajes, con abstención cuando la base no cubre la consulta, gracias a su entrenamiento explícito para responder "no lo sé".
- Investigación académica sobre agentes de búsqueda: sirve como checkpoint de referencia para estudiar el equilibrio entre cobertura (55,9 % de preguntas respondidas) y precisión (70,4 % de acierto entre las respondidas) en tareas de QA multi-hop.
- Generación de respuestas verificables en dominios regulados: el formato `<answer>` y la abstención permiten construir sistemas que solo emiten respuestas cuando hay evidencia recuperada, reduciendo el riesgo de alucinación en entornos donde una respuesta incorrecta tiene coste.
- Evaluación de estrategias de RL para agentes: su receta GRPO con recompensas por formato, coste de búsqueda y penalización por responder sin buscar es replicable para entrenar agentes similares sobre otros corpus.
- Asistente de documentación técnica con seguimiento conversacional: admite preguntas de seguimiento en turnos posteriores dentro de la ventana de 4.096 tokens, útil para sesiones de soporte acotadas.
- Filtrado de consultas sin respuesta: puede desplegarse como clasificador de abstención en un sistema mayor, derivando a un humano las consultas que el modelo decide no responder.
- Prototipado de pipelines RAG con BM25: su interfaz de herramienta y el formato de pasajes (título y primeras 100 palabras) facilitan la integración en arquitecturas de recuperación existentes.

## Benchmarks y rendimiento

Resultados en desarrollo (768 preguntas, 8 intentos cada una a temperatura 1), según la model card:

| Metrica | Warm start | Este modelo |
|---|---|---|
| Acierto en un intento (pass@1), % | 8,0 | 31,9 |
| Acierto en al menos uno de 8 intentos (pass@8), % | 25,0 | 43,4 |
| Acierto entre las preguntas que responde, % | 15,1 | 70,4 |
| Proporción de preguntas que responde, % | 75,2 | 55,9 |
| Chats de retención: NLL en tokens del asistente | 1,606 | 1,553 |
| Chats de retención: proporción con llamada a búsqueda, % | 29 | 0 |

El conjunto de desarrollo incluye 128 preguntas por fuente de HotpotQA, NQ, 2WikiMultihopQA, MuSiQue, conversaciones y preguntas con respuesta oculta; "acierto" se define según la puntuación de respuesta de la recompensa de entrenamiento, y "no lo sé" cuenta como no acertado. Los chats de retención son 128 conversaciones ordinarias que no requieren búsqueda.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (FP16/BF16): aproximadamente 5,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, alrededor de 7-8 GB para contexto moderado.
- Cuantización a 8 bits: aproximadamente 2,8 GB de pesos; a 4 bits: aproximadamente 1,4 GB de pesos, aunque no se documentan cuantizaciones oficiales en el repositorio.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090) puede ejecutar el modelo en FP16 o cuantizado; para despliegue de producción con concurrencia se recomienda A100 o H100.
- Cabe en GPU consumer: sí, en RTX 3060 Ti/4060 Ti (8 GB) en cuantización 8 bits o 4 bits, y en RTX 4090 (24 GB) en FP16 con margen amplio.
- Opciones de despliegue: al ser un transformer tipo Llama con pesos safetensors, es compatible con vLLM, TGI, llama.cpp (previa conversión a GGUF) y Ollama; el pipeline declarado en Hugging Face es `reinforcement-learning`, por lo que el uso previsto es como checkpoint de agente, no como modelo de chat genérico.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pass@1 (dev) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 1pp-2.81b-v2-asst-search-rl-abstain | 2,81 B | 4.096 | 31,9 % | Other | Hugging Face (jkminder) |
| 1pp-2.81b-v2-asst-sft (warm start) | 2,81 B | No disponible | 8,0 % | No disponible | Hugging Face (Raghav-Singhal) |
| Search-R1 (referencia de corpus) | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa se limita al modelo base de arranque en caliente, del que se dispone de resultados en la misma tabla de evaluación. No se dispone de datos de benchmarks de otros agentes de búsqueda comparables en la información proporcionada.

## Limitaciones y advertencias

- Las respuestas de "no lo sé" son formularias (por ejemplo, "None of these passages mention ..."), lo que puede resultar poco natural en producción.
- El razonamiento del modelo a veces cita hechos que ningún pasaje contiene, incluso cuando la respuesta es correcta; no debe tratarse como una garantía de fidelidad a las fuentes.
- Es un checkpoint de investigación, no ajustado para seguridad más allá del SFT del modelo base.
- La ventana de contexto es de 4.096 tokens para la conversación completa, incluyendo pasajes de búsqueda; consultas largas o muchas búsquedas pueden agotar el presupuesto.
- El índice de búsqueda es BM25 sobre Wikipedia de 2018, por lo que el conocimiento está limitado a ese corpus y fecha.
- La licencia es "other", sin términos comerciales explícitos en la información disponible; es necesario revisar las condiciones del autor antes de un uso comercial.
- No se documentan idiomas soportados; el entrenamiento y la evaluación se realizan en inglés.
- El modelo está entrenado para un formato de herramienta específico; desviarse de él puede degradar el comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jkminder/1pp-2.81b-v2-asst-search-rl-abstain
- Modelo base (SFT): https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-asst-sft
- Corpus Search-R1 2018 Wikipedia: no disponible como enlace directo en la información proporcionada
- Paper de GRPO: no disponible en la información proporcionada
- Repositorio verl: no disponible como enlace directo en la información proporcionada
- Demo: no disponible

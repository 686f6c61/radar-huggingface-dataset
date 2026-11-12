# jkminder/1pp-2.81b-v2-raw-search-rl-abstain-norefusal

## Resumen

1pp-2.81b-v2-raw-search-rl-abstain-norefusal es un checkpoint de investigación publicado por el usuario jkminder que convierte un modelo base de 2,81 mil millones de parámetros en un agente de búsqueda sobre Wikipedia capaz de responder "no lo sé" cuando la evidencia disponible no permite contestar. Parte del modelo Raghav-Singhal/1pp-2.81b-v2-raw-sft (condición "raw", semilla 28), perteneciente a la familia One Persona Pretraining (1PP), y se entrena en dos fases: un arranque supervisado sobre conversaciones de búsqueda y un ajuste con GRPO sobre un índice BM25 de la Wikipedia de 2018.

El interés del modelo es metodológico más que de producto: demuestra que un modelo pequeño puede aprender a abstenerse de forma calibrada cuando se le recompensa explícitamente por ello y se ocultan las evidencias en una fracción del conjunto de entrenamiento. En la evaluación de desarrollo, la precisión entre las preguntas que decide contestar sube del 16,7 % al 62,1 %, a costa de reducir la proporción de preguntas respondidas del 83,3 % al 57,9 %.

Se distribuye como un checkpoint de investigación en formato safetensors, con licencia "other" y sin garantías de seguridad más allá del SFT del modelo base. No está pensado para producción sin una evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama, según tags del repo); detalles internos no disponibles |
| Parametros totales | 2.807.699.328 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens por conversación (límite operativo declarado) |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | No disponible (la model card no especifica idiomas; el entrenamiento usa corpus de Wikipedia en inglés) |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Llama, con 2,81 mil millones de parámetros en un único conjunto de pesos denso. El modelo base es un checkpoint de One Persona Pretraining en condición "raw", semilla 28, revisión `216fc67`. El ajuste se realiza en dos etapas: primero, una época de SFT sobre 2.417 conversaciones (2.175 episodios de búsqueda reescritos por Claude en el estilo de chat de los modelos SFT, de los cuales alrededor del 1 % termina en "no pude encontrar la respuesta", más 242 conversaciones de chat ordinarias). Después, entrenamiento con GRPO en verl durante 860 pasos de 256 preguntas por 8 rollouts, en 4 nodos con 16 GPU en total.

El optimizador es Muon con tasa de aprendizaje 1e-4 para las matrices y grupos AdamW con las ratios del preentrenamiento; la pérdida KL es 0,001 con estimador de baja varianza respecto al arranque supervisado. Las preguntas de entrenamiento provienen de HotpotQA, NQ, 2WikiMultihopQA y MuSiQue, más conversaciones multiturno con seguimientos escritos por Claude (198.002 filas). En el 2 % de las preguntas se ocultan los pasajes que contienen la respuesta, de modo que "no lo sé" es la respuesta correcta. La recompensa por pregunta es 1 para respuesta correcta (coincidencia exacta de la etiqueta o PEDANTS con umbral 0,5), 0 para no responder y -0,5 para respuesta incorrecta, con penalizaciones de 0,03 por búsqueda a partir de la segunda, 0,1 por error de formato y 0,3 por responder sin buscar. Se aplica un filtro de corrección que sustituye grupos de preguntas con los 8 rollouts idénticos y omite temporalmente las que se aciertan en los 8 intentos. Cada paso incorpora además 32 conversaciones de chat de repetición (pérdida solo en tokens del asistente, peso 0,1) extraídas de un pool de 33.901 chats ordinarios, excluyendo WildJailbreak, WildGuardMix y los 3.773 chats de WildChat en los que el asistente rechaza (etiquetados por Claude). El coste computacional del entrenamiento equivale al 4,5 % del cómputo de preentrenamiento del modelo en el paso 860.

## Capacidades

- Generación de texto y respuesta a preguntas con búsqueda iterativa sobre un índice BM25 de la Wikipedia de 2018 (hasta 5 búsquedas por pregunta).
- Llamada a herramienta mediante el formato `<tool_call>{"name": "search", "arguments": {"query": "..."}}</tool_call>`, con resultados devueltos en un turno `<tool_response>` que incluye el título y las primeras 100 palabras de los 3 pasajes mejor puntuados.
- Respuesta estructurada con la etiqueta `<answer>...</answer>`, o respuesta sin etiqueta cuando no encuentra la respuesta.
- Abstención calibrada: el modelo puede contestar "no lo sé" en lugar de inventar, comportamiento reforzado durante el RL.
- Conversación multiturno: admite preguntas de seguimiento en turnos posteriores del usuario, siempre que la conversación completa quepa en 4.096 tokens.
- Razonamiento multihop: entrenado con HotpotQA, 2WikiMultihopQA y MuSiQue, lo que le permite encadenar varias búsquedas para preguntas que requieren composición de hechos.
- No se documentan capacidades de visión, audio, código ni matemáticas específicas.

## Casos de uso

- Atención al cliente con base de conocimiento externa: el modelo puede formular consultas a un índice de documentos y responder solo cuando encuentra evidencia, absteniéndose cuando no la hay, lo que reduce respuestas inventadas en dominios con alta exigencia factual.
- Asistentes de investigación documental: para preguntas multihop sobre un corpus indexado, encadena hasta cinco búsquedas y compone la respuesta a partir de los pasajes recuperados.
- Evaluación de pipelines RAG: sirve como referencia para medir el comportamiento de abstención de un agente de búsqueda, gracias a su métrica explícita de "precisión entre las preguntas respondidas".
- Prototipos de agentes con tool calling: su formato de llamada y respuesta es sencillo de integrar en orquestadores que implementen el bucle búsqueda-respuesta con un límite de llamadas.
- Investigación en aprendizaje por refuerzo: el checkpoint y su receta (GRPO con Muon, filtro de corrección, recompensas con penalización por búsqueda) son reproducibles y útiles para estudiar calibración y abstención en modelos pequeños.
- Filtrado de preguntas en sistemas de FAQ: al poder declarar desconocimiento, puede usarse como primera etapa para derivar a un humano las consultas sin cobertura documental.
- Experimentos de alineación y seguridad: al haberse entrenado sin rechazos en el replay de chat, permite estudiar la tensión entre abstención factual y rechazo de contenido.

## Benchmarks y rendimiento

Resultados en desarrollo (768 preguntas, 8 intentos cada una a temperatura 1), comparando el arranque supervisado con este modelo:

| Metrica | Warm start | Este modelo |
|---|---|---|
| Acierto en un intento (pass@1), % | 10,4 | 28,5 |
| Acierto en al menos uno de 8 intentos (pass@8), % | 30,7 | 36,7 |
| Acierto entre las preguntas que responde, % | 16,7 | 62,1 |
| Proporción de preguntas que responde, % | 83,3 | 57,9 |
| NLL en tokens del asistente sobre chats reservados | 1,712 | 1,567 |
| Proporción de chats reservados con llamada de búsqueda, % | 20 | 2 |

El conjunto de desarrollo usa 128 preguntas por fuente de HotpotQA, NQ, 2WikiMultihopQA, MuSiQue, conversaciones y preguntas con respuesta oculta; "acierto" es la puntuación de respuesta de la recompensa de entrenamiento, y "no lo sé" cuenta como no acertada. Los chats reservados son 128 conversaciones ordinarias que no requieren búsqueda. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, aproximadamente 5,6 GB de pesos más caché KV y overhead, lo que sitúa el requisito práctico en torno a 8-10 GB; en cuantización de 8 bits, unos 3 GB de pesos; en 4 bits, unos 1,5 GB (estimaciones a partir del tamaño del repo, no verificadas por el autor).
- GPU recomendadas: cabe en GPU de consumo como RTX 3090 o RTX 4090 en fp16; para despliegue con mayor throughput, A100 o H100 con vLLM o TGI.
- Despliegue: compatible con stacks que carguen safetensors de Llama; el bucle de búsqueda debe implementarse en el orquestador, ya que el modelo solo emite la llamada a herramienta. No se documentan recetas para llama.cpp u Ollama.
- Latencia y throughput: no disponibles. El límite de 4.096 tokens y hasta 5 búsquedas por pregunta condicionan la latencia total del episodio, que depende del índice BM25 externo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 1pp-2.81b-v2-raw-search-rl-abstain-norefusal | 2,81 B | 4.096 tokens | Agente de búsqueda con abstención (GRPO) | other | Hugging Face |
| Raghav-Singhal/1pp-2.81b-v2-raw-sft (modelo base) | 2,81 B | No disponible | SFT sobre 1PP raw | No disponible | Hugging Face |
| Search-R1 (familia de referencia) | No disponible | No disponible | RL para búsqueda sobre Wikipedia | No disponible | No disponible |

La comparación con alternativas de la misma categoría (agentes de búsqueda entrenados con RL) no está disponible en la información proporcionada más allá de la referencia al corpus BM25 de Search-R1.

## Limitaciones y advertencias

- Las respuestas de abstención son formulaicas ("None of these passages mention ..."), lo que puede resultar poco natural en producción.
- El razonamiento a veces cita hechos que ningún pasaje contiene, incluso cuando la respuesta final es correcta.
- Es un checkpoint de investigación sin ajuste de seguridad más allá del SFT del modelo base; no se ha evaluado su robustez frente a usos maliciosos.
- La licencia es "other" y no se detallan sus términos, por lo que el uso comercial requiere revisar las condiciones del autor y del modelo base.
- El contexto operativo está limitado a 4.096 tokens por conversación y a 5 búsquedas por pregunta.
- El índice de búsqueda es la Wikipedia de 2018 con BM25; el rendimiento fuera de ese corpus o con otro recuperador no está caracterizado.
- El entrenamiento excluye deliberadamente rechazos en el replay de chat, lo que puede trasladarse a una menor tendencia a negarse ante peticiones problemáticas.
- No se especifican idiomas soportados; el entrenamiento se apoya en corpus y chats mayoritariamente en inglés.
- Solo hay 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jkminder/1pp-2.81b-v2-raw-search-rl-abstain-norefusal
- Modelo base (SFT): https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-raw-sft
- Repositorio verl (framework de RL usado): no disponible en la información proporcionada
- Paper de GRPO: no disponible en la información proporcionada
- Corpus Search-R1 2018 Wikipedia: no disponible en la información proporcionada
- Benchmarks HotpotQA, NQ, 2WikiMultihopQA y MuSiQue: no disponibles en la información proporcionada

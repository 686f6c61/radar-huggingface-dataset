# jkminder/1pp-2.81b-v2-raw-search-rl

## Resumen

1pp-2.81b-v2-raw-search-rl es un checkpoint de investigación publicado por el usuario jkminder en Hugging Face. Se trata de un agente de búsqueda en Wikipedia construido sobre el modelo One Persona Pretraining (1PP) de 2,81 mil millones de parámetros, en su variante de condicionamiento "raw" y semilla 28, cuyo punto de partida es el SFT de Raghav-Singhal. El modelo no es un chat genérico: está especializado en responder preguntas formulando consultas contra un índice BM25 de la Wikipedia de 2018 y sintetizando la respuesta a partir de los pasajes recuperados.

El problema que aborda es el de la respuesta a preguntas con recuperación (RAG) mediante un agente que decide de forma autónoma cuándo buscar, qué consulta lanzar y cuándo responder. Para ello combina un arranque en caliente supervisado sobre 3.316 conversaciones con un entrenamiento de refuerzo GRPO de 660 pasos en verl, con recompensas basadas en coincidencia exacta o difusa de la respuesta y penalizaciones por búsquedas redundantes y errores de formato.

Es relevante ahora porque documenta de forma transparente una receta completa de RL para agentes de búsqueda en un modelo pequeño (2,81B), con ganancias medibles en HotpotQA (de 38,7 % a 61,9 % de respuestas correctas) y NQ (de 21,3 % a 38,2 %) respecto al arranque en caliente. La longitud de contexto está limitada a 4.096 tokens, heredada del preentrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (chat template `<|im_start|>` / `<|im_end|>`) |
| Parametros totales | 2.807.699.328 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4.096 tokens (longitud de preentrenamiento; la conversación debe caber en ella) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 2,81B parámetros derivado del SFT `Raghav-Singhal/1pp-2.81b-v2-raw-sft` (revisión `216fc67`), que a su vez parte del preentrenamiento One Persona Pretraining. El entrenamiento se estructuró en dos fases. Primero, un arranque en caliente con una época de ajuste supervisado sobre 3.316 conversaciones: el 90 % son episodios de búsqueda reescritos por Claude en estilo chat con la respuesta etiquetada, y el 10 % son conversaciones de chat ordinarias. Después, un entrenamiento con GRPO en verl (entrenador síncrono v1) de 660 pasos, con 256 preguntas y 8 rollouts por paso, distribuido en 4 nodos (16 GPU).

La optimización emplea Muon con tasa de aprendizaje 1e-4 para las matrices y grupos AdamW con las proporciones del preentrenamiento, además de una pérdida KL de 0,001 (estimador de baja varianza) contra el arranque en caliente. Las preguntas de entrenamiento provienen de los conjuntos de NQ y HotpotQA (split de Search-R1) más un 25 % de conversaciones multiturno con seguimientos escritos por Claude. La recompensa por conversación asigna 1 punto por cada pregunta de usuario respondida correctamente (coincidencia exacta o PEDANTS con umbral 0,5 y regla de solapamiento de palabras), resta 0,03 por cada búsqueda posterior a la primera y resta 0,1 por error de formato (una vez por episodio). Se aplica un filtro de corrección que sustituye grupos de preguntas cuyos 8 rollouts coinciden, hasta 768 por paso, y se reinyectan 64 conversaciones de chat ordinario por paso (pérdida solo en tokens del asistente, peso 0,1) para preservar el comportamiento conversacional. El cómputo de RL equivale aproximadamente al 6-7 % del cómputo de preentrenamiento del modelo (convención 6ND, muestreo incluido).

## Capacidades

- Generación de texto conversacional con plantilla de chat de tipo ChatML (`<|im_start|>` / `<|im_end|>`).
- Respuesta a preguntas con recuperación: emite llamadas de herramienta en el formato `<tool_call>{"name": "search", "arguments": {"query": "..."}}</tool_call>`.
- Interpretación de resultados de búsqueda devueltos como turno de usuario `<tool_response>` con los 3 pasajes principales (título y primeras 100 palabras) de un índice BM25 sobre la Wikipedia de 2018 del corpus Search-R1.
- Respuesta final en texto libre con la respuesta encerrada en exactamente una etiqueta `<answer>...</answer>`.
- Planificación multi-paso: hasta 5 búsquedas por pregunta de usuario.
- Conversaciones multiturno: las preguntas de seguimiento pueden llegar en turnos de usuario posteriores.
- Razonamiento sobre preguntas de múltiples saltos (entrenado con HotpotQA).
- Tool calling restringido a la herramienta `search`; no se documentan otras herramientas.
- Capacidades multilingües: no disponibles.
- Sin soporte documentado de visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Respuesta a preguntas sobre conocimiento enciclopédico: el modelo formula consultas BM25 contra la Wikipedia de 2018 y sintetiza la respuesta a partir de los pasajes recuperados, lo que lo hace adecuado para asistentes de consulta factual con trazabilidad de fuentes.
- Investigación sobre agentes con RL: sirve como referencia reproducible para estudiar cómo GRPO con recompensas de coincidencia exacta y difusa mejora la política de búsqueda de un modelo pequeño, con la receta de entrenamiento documentada paso a paso.
- Evaluación de pipelines RAG agénticos: al tener un formato de tool calling y tool response bien definido, puede integrarse como componente de un sistema mayor para comparar estrategias de recuperación (número de pasos, formulación de consultas).
- Preguntas de múltiples saltos: su entrenamiento con HotpotQA lo orienta a encadenar varias búsquedas cuando la respuesta requiere combinar información de distintos artículos.
- Conversaciones multiturno con seguimiento: el modelo fue entrenado con un 25 % de conversaciones con preguntas de seguimiento, por lo que puede mantener un hilo de preguntas relacionadas dentro del límite de 4.096 tokens.
- Prototipado de asistentes de documentación interna: sustituyendo el índice BM25 de Wikipedia por un corpus propio con el mismo formato de herramienta, el modelo puede reutilizarse para consultar bases documentales, siempre que se respete el esquema de llamada.
- Estudio de límites de contexto en agentes: con una ventana de 4.096 tokens y hasta 5 búsquedas por pregunta, es útil para analizar el compromiso entre profundidad de búsqueda y presupuesto de contexto.

## Benchmarks y rendimiento

Resultados en desarrollo, decodificación greedy y una respuesta por pregunta, según la model card:

| Benchmark | Arranque en caliente | Este modelo |
|---|---|---|
| HotpotQA dev, % correctas | 38,7 | 61,9 |
| NQ dev, % correctas | 21,3 | 38,2 |
| Conversaciones dev, % de turnos de usuario correctos | 16,3 | 33,3 |

La métrica "correcta" corresponde a la puntuación de respuesta de la recompensa de entrenamiento (coincidencia exacta o, en su defecto, coincidencia difusa), medida durante el entrenamiento sobre un split de desarrollo extraído de los conjuntos de entrenamiento (1.024 preguntas simples y 129 conversaciones). No se han publicado resultados de benchmarks estándar independientes (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 2,81B parámetros, en fp16 serían aproximadamente 5,6 GB de pesos, y en cuantizaciones de 8 o 4 bits, del orden de 2,8 GB y 1,4 GB respectivamente (estimación a partir del tamaño, no publicada por el autor).
- GPU recomendadas: no disponibles en la información proporcionada. El entrenamiento se realizó en 16 GPU distribuidas en 4 nodos, pero no se especifica el modelo de GPU.
- Cabe en GPU de consumo: previsiblemente sí en tarjetas con 8 GB o más en fp16 y en tarjetas de 4-6 GB con cuantización, aunque no hay datos oficiales.
- Opciones de despliegue: no documentadas; al ser un modelo Llama con safetensors, es compatible en principio con stacks habituales (vLLM, TGI, llama.cpp/Ollama previa conversión), pero el autor no lo confirma.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 1pp-2.81b-v2-raw-search-rl | 2,81B | 4.096 | Agente de búsqueda Wikipedia (GRPO) | other | Hugging Face |
| Raghav-Singhal/1pp-2.81b-v2-raw-sft | 2,81B | no disponible | SFT base del anterior | no disponible | Hugging Face |
| Modelos de la familia Search-R1 | no disponible | no disponible | Agentes de búsqueda con RL | no disponible | no disponible |

La información disponible no incluye comparaciones con alternativas de la misma categoría más allá del modelo base. No disponible.

## Limitaciones y advertencias

- Las respuestas suelen añadir detalles después de la etiqueta `<answer>` que ningún pasaje respalda, lo que aumenta el riesgo de afirmaciones no fundamentadas.
- El modelo a veces vuelve a buscar para confirmar una respuesta que ya tiene, consumiendo pasos y contexto de forma redundante.
- Es un checkpoint de investigación y no está ajustado para seguridad más allá del SFT del modelo base.
- La ventana de contexto está limitada a 4.096 tokens, lo que restringe la longitud de las conversaciones y el número de pasajes acumulables.
- El máximo de 5 búsquedas por pregunta de usuario limita la profundidad de investigación.
- La licencia es "other": no se detallan los términos de uso comercial, por lo que deben consultarse antes de cualquier despliegue en producción.
- Los idiomas soportados no están documentados; el corpus de recuperación es la Wikipedia de 2018, lo que introduce un sesgo temporal y de cobertura.
- Sesgos conocidos: no documentados de forma específica; hereda los del modelo base y del corpus de Wikipedia.
- El índice BM25 está fijado al corpus de Search-R1; cualquier cambio de corpus requiere adaptar el formato de la herramienta y validar el comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jkminder/1pp-2.81b-v2-raw-search-rl
- Modelo base (SFT): https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-raw-sft
- Repositorio verl (entrenamiento GRPO): no disponible en la información proporcionada
- Paper de Search-R1 (corpus y split): no disponible en la información proporcionada
- Blog o demo del autor: no disponible en la información proporcionada

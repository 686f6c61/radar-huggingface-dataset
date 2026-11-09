# jkminder/1pp-2.81b-v2-ua-search-rl

## Resumen

El modelo `1pp-2.81b-v2-ua-search-rl` es un agente de búsqueda en Wikipedia desarrollado por el usuario de Hugging Face jkminder. Parte del modelo base One Persona Pretraining (1PP) de 2,81 mil millones de parámetros, en su variante de condicionamiento "ua" y semilla 28, desarrollado por Raghav-Singhal. Sobre ese checkpoint se aplicó un ajuste fino supervisado con conversaciones de búsqueda (warm start) y posteriormente un entrenamiento con aprendizaje por refuerzo mediante GRPO para que el modelo aprenda a responder preguntas consultando un índice BM25 de la Wikipedia de 2018.

El problema que resuelve es concreto: dado un turno de usuario con una pregunta, el modelo decide si llamar a una herramienta de búsqueda, formula la consulta, procesa los resultados devueltos y emite una respuesta final etiquetada. Es relevante como ejemplo reproducible de entrenamiento de agentes de búsqueda con RL a escala reducida (unos 2,8B de parámetros) y con un coste de cómputo de RL estimado en un 6-7 % del cómputo de preentrenamiento.

La arquitectura es de tipo transformer con atención estándar (familia Llama, según los tags del repositorio), con una longitud de contexto de 4.096 tokens y pesos en formato safetensors. Se distribuye como checkpoint de investigación, no como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Llama, segun tags del repositorio) |
| Parametros totales | 2.807.699.328 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de preentrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer de 2,81B de parámetros derivado del checkpoint `Raghav-Singhal/1pp-2.81b-v2-ua-sft` (revisión `8634888`), perteneciente al proyecto One Persona Pretraining. Usa la plantilla de chat del modelo base, con los tokens especiales `<|im_start|>` y `<|im_end|>`. El entrenamiento se dividió en dos fases. Primero, un warm start de una época de ajuste fino supervisado sobre 3.316 conversaciones: un 90 % son episodios de búsqueda reescritos por Claude en estilo chat con respuesta etiquetada y un 10 % son conversaciones de chat ordinarias.

La segunda fase aplicó GRPO con verl (entrenador síncrono v1) durante 660 pasos, con 256 preguntas y 8 rollouts por paso, distribuido en 4 nodos con 16 GPU. El optimizador fue Muon con tasa de aprendizaje 1e-4 para las matrices y grupos AdamW con las proporciones del preentrenamiento; se usó una pérdida KL de 0,001 (estimador de baja varianza) respecto al warm start. Las preguntas provinieron de los conjuntos de entrenamiento de NQ y HotpotQA (split de Search-R1) más un 25 % de conversaciones multiturno con seguimientos escritos por Claude, planteados solo tras una respuesta correcta. La recompensa por conversación es 1 por cada pregunta de usuario respondida correctamente (coincidencia exacta o coincidencia suave PEDANTS a 0,5 con regla de solapamiento de palabras), menos 0,03 por cada búsqueda adicional a la primera y menos 0,1 por error de formato (una vez por episodio). Se aplicó un filtro de corrección que sustituye grupos de preguntas con los 8 rollouts concordantes, hasta 768 por paso, y se reinyectaron 64 conversaciones de chat ordinario por paso con peso 0,1 sobre los tokens del asistente para preservar el comportamiento conversacional.

## Capacidades

- Generación de texto y respuesta a preguntas con apoyo de búsqueda externa.
- Llamada a herramienta de búsqueda mediante el formato `<tool_call>{"name": "search", "arguments": {"query": "..."}}</tool_call>`.
- Procesamiento de resultados devueltos como turno de usuario `<tool_response>` con los 3 pasajes principales (título y primeras 100 palabras) de un índice BM25 sobre el corpus Wikipedia 2018 de Search-R1.
- Emisión de respuesta final dentro de una única etiqueta `<answer>...</answer>`.
- Gestión de hasta 5 búsquedas por pregunta de usuario.
- Conversaciones multiturno con preguntas de seguimiento en turnos posteriores del usuario.
- Razonamiento multi-paso implícito en el bucle búsqueda-respuesta.
- Capacidades multilingües: no disponibles.
- Modo de pensamiento explícito, visión o audio: no disponibles.

## Casos de uso

- Respuesta a preguntas factuales con verificación documental: el modelo formula consultas BM25 contra Wikipedia y cita pasajes antes de responder, lo que permite construir un asistente de consulta con trazabilidad de fuentes.
- Agente de búsqueda en pipelines de RAG: puede integrarse como planificador de consultas dentro de un sistema mayor, decidiendo cuándo buscar y cómo reformular la consulta a partir de los resultados previos.
- Evaluación de técnicas de RL para agentes: sirve como referencia reproducible para comparar GRPO con otras variantes de entrenamiento de agentes de búsqueda a pequeña escala.
- Investigación en atribución y fidelidad: útil para estudiar el fenómeno de respuestas que añaden detalles no respaldados por los pasajes recuperados, documentado como limitación por el autor.
- Asistente conversacional con acceso a conocimiento enciclopédico: admite preguntas de seguimiento en turnos posteriores, lo que permite diálogos de aclaración sobre un tema.
- Prototipado de sistemas de preguntas y respuestas sobre corpus cerrados: el índice BM25 puede sustituirse por otro corpus y evaluar la adaptación del comportamiento de búsqueda.
- Docencia y experimentación con RLHF/GRPO: el diseño de recompensas (penalización por búsquedas extra y por errores de formato) es un ejemplo didáctico de ingeniería de recompensas para agentes.

## Benchmarks y rendimiento

Resultados publicados por el autor en el split de desarrollo, con decodificación greedy y una respuesta por pregunta. La métrica "correcto" es la puntuación de respuesta de la recompensa de entrenamiento (coincidencia exacta o coincidencia suave), medida sobre un split de desarrollo extraído de los conjuntos de entrenamiento (1.024 preguntas individuales, 129 conversaciones).

| Benchmark | Warm start | Modelo final |
|---|---|---|
| HotpotQA dev, % correcto | 35,2 | 64,8 |
| NQ dev, % correcto | 20,8 | 43,9 |
| Conversaciones dev, % de turnos de usuario correctos | 17,1 | 41,5 |

No se han publicado resultados en benchmarks estándar externos (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 5,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 7 y 9 GB según longitud de contexto.
- Cuantización a 8 bits: en torno a 3 GB de pesos. Cuantización a 4 bits: en torno a 1,5-2 GB de pesos. No se han publicado conversiones oficiales a GGUF.
- GPU recomendadas: cabe en GPU de consumo como RTX 4090 (24 GB) con margen amplio en fp16, y en RTX 3090, RTX 4080 o RTX 4070 Ti en cuantización de 8 o 4 bits. Para entrenamiento o serving con lotes grandes se recomiendan A100 o H100.
- El entrenamiento original usó 16 GPU distribuidas en 4 nodos, por lo que la reproducción del RL requiere infraestructura multi-GPU.
- Opciones de despliegue: vLLM o TGI para serving en fp16; llama.cpp u Ollama requerirían conversión a GGUF no publicada. El bucle de agente con tool calling debe implementarse externamente, ya que el modelo solo emite el formato de llamada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jkminder/1pp-2.81b-v2-ua-search-rl | 2,81B | 4.096 | Agente de búsqueda con GRPO | other | Hugging Face |
| Raghav-Singhal/1pp-2.81b-v2-ua-sft | 2,81B | no disponible | SFT base del anterior | no disponible | Hugging Face |
| Search-R1 (familia de referencia) | variable | no disponible | RL para búsqueda con motores BM25 | no disponible | Repositorio de investigación |
| Modelos Llama 3.2 de 3B | 3B | 128K | LLM generalista | Llama 3.2 Community License | Hugging Face |

La comparación directa con modelos generalistas no es equitativa: este checkpoint está especializado en un bucle de búsqueda con formato fijo y no compite en tareas generales de generación o código. Frente a su modelo base SFT, la mejora medida es de 29,6 puntos en HotpotQA y 23,1 puntos en NQ.

## Limitaciones y advertencias

- Las respuestas suelen añadir detalles después de la etiqueta `<answer>` que ningún pasaje respalda, lo que genera riesgo de alucinación factual.
- El modelo a veces repite búsquedas para confirmar una respuesta que ya tiene, lo que incrementa latencia y coste.
- Es un checkpoint de investigación y no está ajustado para seguridad más allá del SFT del modelo base.
- La ventana de contexto está limitada a 4.096 tokens, incluyendo resultados de búsqueda y conversación; conversaciones largas pueden truncarse.
- El índice de búsqueda está fijado a la Wikipedia de 2018 del corpus Search-R1, por lo que el conocimiento está desactualizado y limitado a ese corpus.
- La licencia es "other" y no se detallan sus términos en la información disponible; es necesario consultar el repositorio antes de cualquier uso comercial.
- No se especifican los idiomas soportados; el entrenamiento se realizó con preguntas de NQ y HotpotQA, mayoritariamente en inglés.
- El formato de salida es rígido (una única etiqueta `<answer>` y un máximo de 5 búsquedas), lo que limita su uso fuera de ese protocolo.
- No hay datos publicados sobre sesgos demográficos o culturales específicos del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jkminder/1pp-2.81b-v2-ua-search-rl
- Modelo base SFT: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-ua-sft
- Repositorio de verl (entrenador GRPO): no disponible en la información proporcionada
- Paper de Search-R1: no disponible en la información proporcionada
- Corpus Wikipedia 2018 de Search-R1: no disponible en la información proporcionada
- Documentación de Muon (optimizador): no disponible en la información proporcionada

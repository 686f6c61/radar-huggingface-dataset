# jkminder/1pp-2.81b-v2-asst-search-rl

## Resumen

1pp-2.81b-v2-asst-search-rl es un checkpoint de investigacion publicado por el usuario jkminder en Hugging Face. Se trata de un modelo de lenguaje de 2.807.699.328 parametros (~2,81B) derivado del modelo base Raghav-Singhal/1pp-2.81b-v2-asst-sft, que a su vez pertenece a la familia One Persona Pretraining (1PP). El modelo ha sido especializado como agente de busqueda sobre Wikipedia: recibe una pregunta del usuario, decide si invoca una herramienta de busqueda y, con los pasajes devueltos, emite una respuesta etiquetada.

La relevancia del modelo reside en su pipeline de entrenamiento: un calentamiento supervisado (warm start) sobre conversaciones de busqueda seguido de aprendizaje por refuerzo con GRPO en la libreria verl, con recompensas basadas en exactitud de respuesta y penalizaciones por busquedas excesivas o errores de formato. Segun la model card, este proceso eleva la precision en HotpotQA dev del 31,1 % al 63,7 % y en NQ dev del 19,9 % al 41,6 % respecto al checkpoint de partida.

Es un modelo pequeno, orientado a investigacion y sin ajuste de seguridad especifico mas alla del SFT del modelo base. Su interes es metodologico: demuestra que un modelo de menos de 3B parametros puede aprender un comportamiento agentico de busqueda multi-turno con un presupuesto de computo de RL modesto (6-7 % del computo de preentrenamiento).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia llama, plantilla de chat `<|im_start|>` / `<|im_end|>`) |
| Parametros totales | 2.807.699.328 (~2,81B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de preentrenamiento; la conversacion debe caber en ella) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors |
| Tamano del repositorio | 5,6 GB |
| Modelo base | Raghav-Singhal/1pp-2.81b-v2-asst-sft (revision `1c67857`) |
| Pipeline declarado | reinforcement-learning |
| Checkpoint | paso 660 de GRPO |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de ~2,81B parametros con la plantilla de chat del modelo base (`<|im_start|>` / `<|im_end|>`). No se dispone de detalles adicionales sobre la arquitectura interna (numero de capas, dimensiones, atencion) en la informacion proporcionada.

El entrenamiento consta de dos fases. Primero, un calentamiento supervisado de una epoca sobre 3.316 conversaciones: el 90 % son episodios de busqueda reescritos por Claude a estilo chat con respuesta etiquetada, y el 10 % son conversaciones de chat ordinarias. Despues, RL con GRPO en verl (entrenador sincrono v1): 660 pasos de 256 preguntas por 8 rollouts, distribuidos en 4 nodos (16 GPUs). El optimizador es Muon con learning rate 1e-4 para las matrices, con grupos AdamW a las ratios del preentrenamiento y una perdida KL de 0,001 (estimador de baja varianza) respecto al warm start.

Las preguntas de entrenamiento provienen de los conjuntos de entrenamiento de NQ y HotpotQA (split de Search-R1), mas un 25 % de conversaciones multi-turno con seguimientos escritos por Claude. La recompensa por conversacion es 1 por cada pregunta de usuario respondida correctamente (exact match de la respuesta etiquetada, o soft match PEDANTS a 0,5 con regla de solapamiento de palabras y sin respuestas rellenadas), menos 0,03 por cada busqueda despues de la primera y menos 0,1 por error de formato (una vez por episodio). Se aplica un filtro de correccion que sustituye grupos de preguntas cuyos 8 rollouts coinciden, hasta 768 por paso, y se anaden 64 conversaciones de chat ordinario por paso (perdida solo en tokens del asistente, peso 0,1) para preservar el comportamiento conversacional. El computo de RL supone aproximadamente el 6-7 % del computo de preentrenamiento del modelo (convencion 6ND, muestreo incluido).

## Capacidades

- Busqueda agentica sobre un indice BM25 del corpus Wikipedia 2018 de Search-R1, invocando la herramienta mediante `<tool_call>{"name": "search", "arguments": {"query": "..."}}</tool_call>`.
- Procesamiento de resultados de busqueda devueltos como turno de usuario `<tool_response>` con los 3 mejores pasajes (titulo y primeras 100 palabras).
- Generacion de respuestas en texto libre con la respuesta final dentro de exactamente una etiqueta `<answer>...</answer>`.
- Hasta 5 busquedas por pregunta de usuario.
- Conversaciones multi-turno: las preguntas de seguimiento pueden llegar como turnos de usuario posteriores.
- Respuesta directa sin busqueda cuando el modelo lo considera oportuno.
- Preservacion de comportamiento conversacional general gracias al chat replay durante el RL.
- No se documentan capacidades de vision, audio, codigo, matematicas ni thinking mode.

## Casos de uso

- Investigacion en aprendizaje por refuerzo para agentes: el checkpoint sirve como referencia reproducible de un pipeline GRPO con recompensas compuestas (exactitud, coste de busqueda, formato) sobre un modelo de menos de 3B parametros, util para estudiar estabilidad y senales de recompensa.
- Evaluacion de agentes de busqueda en QA multi-hop: permite medir el comportamiento de busqueda iterativa en HotpotQA y NQ con un modelo pequeno, comparando contra el warm start y contra agentes mayores.
- Prototipado de asistentes con recuperacion: integrable en un pipeline donde un recuperador BM25 o un motor de busqueda devuelva pasajes con el formato `<tool_response>` esperado (titulo y primeras 100 palabras).
- Estudio de fidelidad y alucinacion en respuestas aumentadas por recuperacion: el modelo tiende a anadir detalles no respaldados por los pasajes, lo que lo convierte en un caso de analisis para metricas de atribucion.
- Analisis de eficiencia de busqueda: la penalizacion de 0,03 por busqueda adicional permite estudiar el equilibrio entre precision y coste de recuperacion en agentes pequenos.
- Base para fine-tuning posterior: al ser un checkpoint de investigacion con safetensors, puede servir de punto de partida para experimentos de SFT o RL en dominios especificos con presupuesto de GPU limitado.
- Despliegue en entornos con recursos restringidos: con ~2,81B parametros y pesos safetensors de 5,6 GB, es viable en una unica GPU consumer para experimentacion, siempre que se respete la ventana de 4.096 tokens.

## Benchmarks y rendimiento

Resultados publicados en la model card (dev, decodificacion greedy, una respuesta por pregunta; "correcto" segun la puntuacion de recompensa del entrenamiento: exact match o soft match, medido sobre un split dev de 1.024 preguntas simples y 129 conversaciones):

| Metrica | Warm start | Este modelo (paso 660) |
|---|---|---|
| HotpotQA dev, % correcto | 31,1 | 63,7 |
| NQ dev, % correcto | 19,9 | 41,6 |
| Conversaciones dev, % de turnos de usuario correctos | 12,8 | 36,0 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en safetensors ocupan 5,6 GB en el repositorio; en bf16/fp16 se requiere aproximadamente 5,6-6 GB solo para pesos, mas memoria para KV cache y activaciones. Con cuantizacion a 8 bits o 4 bits (no publicada en el repo, requeriria conversion propia) el requisito baja aproximadamente a 3 GB y 1,5-2 GB respectivamente, aunque estos valores son estimaciones y no estan verificados por el autor.
- GPU recomendadas: no especificadas por el autor. Por tamano, una RTX 4090 (24 GB) o una A100/H100 son suficientes en bf16; una GPU consumer de 8-12 GB podria alojarlo con cuantizacion.
- Cabe en GPU consumer: si, en bf16 en GPUs de 8 GB o mas (estimacion), y con cuantizacion en GPUs de menor memoria.
- Opciones de despliegue: no documentadas por el autor. El formato safetensors y la plantilla de chat de la familia llama permiten, en principio, usar frameworks de inferencia compatibles con transformers (vLLM, TGI, llama.cpp tras conversion a GGUF), pero no hay configuracion publicada ni verificada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada para construir una comparativa fiable. La model card solo compara el modelo con su propio warm start (Raghav-Singhal/1pp-2.81b-v2-asst-sft), no con alternativas externas.

| Modelo | Parametros | Contexto | HotpotQA dev (% correcto) | Licencia |
|---|---|---|---|---|
| 1pp-2.81b-v2-asst-search-rl | ~2,81B | 4.096 | 63,7 | other |
| 1pp-2.81b-v2-asst-sft (warm start) | ~2,81B | no disponible | 31,1 | no disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las respuestas suelen anadir detalles despues de la respuesta etiquetada que ningun pasaje respalda, lo que aumenta el riesgo de alucinacion en la salida final.
- El modelo a veces repite la busqueda para confirmar una respuesta que ya tiene, con el coste asociado.
- Es un checkpoint de investigacion, no ajustado para seguridad mas alla del SFT del modelo base.
- La licencia es "other": no se especifican terminos de uso comercial en la informacion disponible; es necesario consultar los terminos exactos antes de cualquier uso en produccion.
- La ventana de contexto de 4.096 tokens limita la longitud de las conversaciones y el numero de pasajes acumulables; el propio autor indica que la conversacion debe caber en esa longitud.
- No se documentan idiomas soportados; el corpus de busqueda es Wikipedia 2018 en el split de Search-R1 y las preguntas de entrenamiento son NQ y HotpotQA, por lo que el rendimiento fuera de ese dominio no esta garantizado.
- El filtro de correccion y el uso de conversaciones generadas por Claude en el entrenamiento pueden introducir sesgos de estilo y de distribucion de preguntas.
- No hay resultados de benchmarks estandar ni evaluaciones de sesgo publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jkminder/1pp-2.81b-v2-asst-search-rl
- Modelo base (SFT): https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-asst-sft
- Search-R1 (corpus y split de entrenamiento): no disponible en la informacion proporcionada
- Repositorio de verl (framework de RL): no disponible en la informacion proporcionada

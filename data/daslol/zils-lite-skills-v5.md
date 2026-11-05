# dasLOL/zils-lite-skills-v5

## Resumen

zils-lite-skills-v5 es un modelo derivado de Qwen/Qwen3.5-0.8B publicado por el usuario dasLOL bajo licencia Apache-2.0. No se trata de un modelo de chat generalista, sino de un "body" (cuerpo) de pesos de lenguaje y visión destinado a un pool de modelos denominado z3, donde la capa de respuesta, el prompt y el runtime los aporta un chasis ("chassis") externo. El modelo se distribuye con pipeline `feature-extraction` y código personalizado (`custom_code`), lo que implica que su carga requiere confiar en código del repositorio.

Técnicamente es el resultado de una mezcla de modelos (soup) seguida de seis ajustes finos de parámetros completos y un promediado con recorte tipo TIES. Con 852.985.920 parámetros (aproximadamente 0,85 mil millones) y un repositorio de 1,7 GB, está pensado para ejecutarse en hardware modesto. Su relevancia actual es acotada: se orienta a tareas de decisión y clasificación dentro de un ecosistema concreto (Bittensor/Zils), no a un uso general.

La información pública es escasa: cero descargas, cero "likes", sin idiomas declarados y sin resultados de benchmarks publicados en la model card. Todo lo que sigue se basa exclusivamente en los metadatos de HuggingFace y en el README del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-0.8B); detalles internos no disponibles |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (los datos de entrenamiento incluyen mayoritariamente inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers, con custom_code) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,85 mil millones de parámetros. Sobre esa base, el autor construyó primero un "soup" (promedio uniforme) de tres modelos Apache-2.0: vllm-sr/d3-lite, Maincode/Matilda-Decision-v1-Edge y zils-ai/jiwo-0.8b-full. Después entrenó seis ajustes finos de parámetros completos partiendo de su "estudiante v2" y promedió los seis con pesos iguales. Finalmente, el cuerpo final combina el soup con el 25 % de mayor magnitud (por tensor) del vector de tarea promediado, aplicando un recorte de estilo TIES.

Los datos de entrenamiento declarados incluyen: habilidades de familia conocida generadas por el proyecto (aritmética y recuentos de cobertura, comprobaciones de tool-call, CMUdict, UniMorph, CxC); particiones de entrenamiento públicas de PIQA, 20 Newsgroups, conjuntos de clasificación de texto de SetFit, GLUE (MRPC, QQP, CoLA), TweetEval, Sarcasm Headlines, RTE, ANLI, QNLI, BANKING77, BoolQ, Social IQa y CommonsenseQA; destilación hacia las probabilidades del profesor vllm-sr/d3-ultra publicadas en zils-ai/zils-relay-answers (ítems en inglés reconstruidos de tasksource y particiones de entrenamiento de benchmarks, con varias extracciones); y 14,8 mil ítems de opción múltiple de la partición de entrenamiento de BIG-bench. El autor afirma que no se usaron datos del examen del validador ni datos de clientes. No se documentan detalles de RLHF o DPO, ni el número total de tokens vistos.

## Capacidades

- Generación de texto y representaciones de características (pipeline declarado: `feature-extraction`).
- Clasificación y decisión sobre ítems de opción múltiple, según la composición del dataset de entrenamiento (BIG-bench, BoolQ, CommonsenseQA, Social IQa).
- Tareas de clasificación de texto: análisis de sentimiento (TweetEval, Sarcasm Headlines), clasificación de intenciones (BANKING77), paráfrasis y similitud semántica (MRPC, QQP), aceptabilidad lingüística (CoLA), inferencia textual (RTE, ANLI, QNLI).
- Comprobaciones de llamadas a herramientas (tool-call checks) presentes en los datos generados por el proyecto.
- Aritmética básica y recuentos de cobertura, según los datos sintéticos declarados.
- Conocimiento morfológico y léxico vía UniMorph y CMUdict.
- Capacidades de visión: el README menciona "language and vision weights", pero no se detalla qué componente visual ni cómo se activa.
- No se documenta soporte de agentes multi-paso, thinking mode, audio ni tool calling en producción más allá de los datos de entrenamiento.

## Casos de uso

- Clasificación de intenciones en atención al cliente: el modelo puede asignar etiquetas de intención a consultas de usuario, aprovechando el entrenamiento sobre BANKING77. Es adecuado por su tamaño reducido y su enfoque declarado en tareas de decisión.
- Moderación y análisis de sentimiento en redes sociales: entrenado con TweetEval y Sarcasm Headlines, puede clasificar tono y sarcasmo en textos cortos, lo que encaja en pipelines de moderación de bajo coste.
- Filtrado de pares pregunta-respuesta en bases de conocimiento: con datos de QQP y MRPC, puede puntuar similitud semántica para deduplicar FAQ o emparejar consultas con respuestas existentes.
- Evaluación de coherencia en sistemas RAG: como extractor de características, puede generar embeddings para recuperación o para reordenar pasajes, aunque no se documenta la dimensión de los embeddings.
- Verificación de llamadas a herramientas en agentes: los datos de tool-call checks permiten usarlo como clasificador auxiliar que valide si una llamada a función propuesta es plausible antes de ejecutarla.
- Clasificación de temas en corpus de noticias: el entrenamiento con 20 Newsgroups lo hace apto para etiquetado temático en agregadores o archivos documentales.
- Razonamiento de sentido común en entornos educativos o de evaluación: con CommonsenseQA y Social IQa, puede responder preguntas de opción múltiple en inglés como componente de un sistema mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y KV cache; en cuantización de 8 bits, en torno a 0,9 GB; en 4 bits, alrededor de 0,5 GB (estimaciones a partir del recuento de parámetros, no verificadas por el autor).
- GPU recomendadas: cualquier GPU consumer con al menos 4-6 GB de VRAM debería poder cargarlo en fp16; una RTX 3060, RTX 4060 o superior es suficiente. Para despliegue en servidor, GPU como A100 o H100 no aportan ventaja significativa por el tamaño del modelo.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de tarjetas con 6 GB o más, aunque no se ha verificado.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por el código personalizado). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, ni pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| zils-lite-skills-v5 | 852.985.920 | no disponible | Apache-2.0 | Decision/clasificación (pool z3) | HuggingFace, 0 descargas |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | Apache-2.0 | Modelo de lenguaje generalista | HuggingFace |
| vllm-sr/d3-lite (componente del soup) | no disponible | no disponible | Apache-2.0 | Modelo de decisión | HuggingFace |
| Maincode/Matilda-Decision-v1-Edge (componente del soup) | no disponible | no disponible | Apache-2.0 | Modelo de decisión | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks y de evaluación independiente: no hay evidencia pública de su calidad frente a la base Qwen3.5-0.8B.
- Requiere `trust_remote_code=True` por el uso de `custom_code`; conviene auditar el código del repositorio antes de ejecutarlo en producción.
- El modelo está diseñado para funcionar dentro de un chasis ("chassis") propietario que aporta la capa de respuesta y el prompt; usarlo de forma aislada puede degradar mucho el rendimiento.
- Idiomas no declarados; los datos de entrenamiento son mayoritariamente en inglés, por lo que el rendimiento en castellano es incierto y probablemente deficiente.
- Riesgo de alucinación y de sobreajuste a los formatos de los benchmarks de entrenamiento (opción múltiple, clasificación), con posible degradación en generación abierta.
- Sesgos heredados de los datasets públicos empleados (TweetEval, 20 Newsgroups, Social IQa, etc.), no evaluados por el autor.
- Repositorio sin tracción (0 descargas, 0 likes) y creado en noviembre de 2026; no hay historial de mantenimiento ni issues.
- Licencia Apache-2.0 permite uso comercial, pero deben respetarse los NOTICE y términos de los modelos upstream (Qwen y los modelos Zils).
- No se documenta la longitud de contexto real ni el comportamiento con prompts largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dasLOL/zils-lite-skills-v5
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Componente del soup: https://huggingface.co/vllm-sr/d3-lite
- Componente del soup: https://huggingface.co/Maincode/Matilda-Decision-v1-Edge
- Componente del soup: https://huggingface.co/zils-ai/jiwo-0.8b-full
- Respuestas del profesor: https://huggingface.co/zils-ai/zils-relay-answers
- tasksource (Sileo, LREC-COLING 2024): https://huggingface.co/tasksource
- BIG-bench (Srivastava et al., 2022): https://github.com/google/BIG-bench

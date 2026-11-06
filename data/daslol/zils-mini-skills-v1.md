# dasLOL/zils-mini-skills-v1

## Resumen

zils-mini-skills-v1 es un modelo derivado de Qwen/Qwen3.5-4B publicado por el usuario dasLOL en Hugging Face. Se trata de un "soup-body" (cuerpo de mezcla de pesos) del ecosistema Zils, un proyecto vinculado a la red Bittensor que entrena y evalua modelos especializados en tareas de decision y clasificacion. El modelo no es un asistente conversacional general, sino un componente de pesos de lenguaje y vision que se integra en un "chassis" (esqueleto de ejecucion) que aporta la capa de respuesta, el prompt y el runtime.

El modelo parte de una media uniforme de dos "house bodies" del pool z3: torchcast-ai/torchcast-decision-4b y vllm-sr/d3-mini, ambos bajo licencia Apache-2.0. Sobre esa mezcla se entreno un LoRA de rango 32 sobre los pesos de lenguaje, que despues se promedio de vuelta con el soup base en proporcion 4:1 y se almaceno en bf16. El entrenamiento combina destilacion hacia las probabilidades de opcion de un profesor de mayor tamano (vllm-sr/d3-ultra) con filas de "gold suavizado" sobre conjuntos de datos publicos de clasificacion y razonamiento.

Con 4.539.265.536 parametros totales (aproximadamente 4,54 mil millones) y un tamano de repositorio de 9,1 GB en safetensors, el modelo esta pensado para inferencia de extraccion de caracteristicas y decision, no para generacion libre. Su relevancia actual es acotada: se trata de un artefacto de investigacion dentro de un pipeline de evaluacion competitiva, con cero descargas y cero likes en el momento de la consulta, y sin documentacion publica de benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.5 (tag `qwen3_5`), con pesos de lenguaje y vision; el modelo base es Qwen/Qwen3.5-4B |
| Parametros totales | 4.539.265.536 (aproximadamente 4,54 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; pesos almacenados en bf16 |
| Idiomas soportados | no disponible (la model card menciona datos en ingles, pero no declara cobertura linguistica) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria transformers, con `custom_code`) |

## Arquitectura y entrenamiento

El modelo es un transformer derivado de Qwen3.5-4B. La model card describe el proceso de construccion en tres etapas: primero, una media uniforme (soup) de dos cuerpos del pool z3, torchcast-ai/torchcast-decision-4b y vllm-sr/d3-mini; segundo, un fine-tune LoRA de rango 32 sobre los pesos de lenguaje entrenado desde ese soup; y tercero, un promedio de vuelta del LoRA con el soup base en proporcion 4:1, almacenado finalmente en bf16. El modelo incorpora pesos de lenguaje y vision, aunque la model card no detalla la arquitectura interna de la torre de vision ni la configuracion exacta de atencion.

El entrenamiento combina dos fuentes: destilacion hacia las probabilidades de opcion de un profesor de mayor tamano (vllm-sr/d3-ultra), publicado en zils-ai/zils-relay-answers con filas en ingles reconstruidas a partir de tasksource y splits de entrenamiento de benchmarks; y filas de "gold suavizado" sobre splits publicos de BANKING77, ANLI, BoolQ, Social IQa, CommonsenseQA, GLUE, SetFit text-classification, TweetEval, Sarcasm Headlines, 20 Newsgroups y PIQA, ademas de items generados por el proyecto (conteo, tool-call y formas de palabra) y 14.800 items del split de entrenamiento de BIG-bench. La model card declara explicitamente que no se usaron datos del examen de validadores ni datos de clientes. No se documenta el numero total de tokens de entrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Extraccion de caracteristicas (`feature-extraction`): pipeline declarado en Hugging Face, orientado a representaciones internas mas que a generacion de texto.
- Clasificacion y decision sobre opciones: el entrenamiento por destilacion hacia probabilidades de opcion sugiere uso en tareas de eleccion multiple y decision entre alternativas.
- Razonamiento sobre items de benchmark: entrenado con ANLI, BoolQ, CommonsenseQA, Social IQa, PIQA y BIG-bench.
- Clasificacion de texto: cubierto por BANKING77, GLUE, TweetEval, Sarcasm Headlines y 20 Newsgroups.
- Tareas de conteo y formas de palabra: items generados por el proyecto.
- Tool-call: se mencionan items generados de tool-call en el entrenamiento, aunque no se detalla el formato ni el soporte en runtime.
- Pesos de vision: la model card indica que el cuerpo incluye pesos de lenguaje y vision, sin detallar las capacidades visuales resultantes.
- Capacidades multilingues: no disponibles; el entrenamiento documentado es en ingles.
- Modo thinking, audio o agentes multi-paso: no disponibles.

## Casos de uso

- Clasificacion de tickets de soporte: el modelo se entreno sobre BANKING77, por lo que puede usarse como extractor de caracteristicas o clasificador de intenciones en dominios bancarios y de atencion al cliente, integrado en un chassis que aporte la capa de respuesta.
- Moderacion y deteccion de sarcasmo: los datos de TweetEval y Sarcasm Headlines permiten emplearlo en tareas de clasificacion de tono y deteccion de sarcasmo en textos cortos.
- Razonamiento de sentido comun en pipelines de QA: con entrenamiento en CommonsenseQA, Social IQa y PIQA, es adecuado para seleccionar respuestas entre opciones en sistemas de pregunta-respuesta cerrada.
- Evaluacion de inferencia natural: el entrenamiento en ANLI y BoolQ lo hace util para tareas de implicacion textual y verificacion de afirmaciones dentro de un pipeline de validacion.
- Componente de un pool de evaluacion Bittensor: su proposito declarado es servir como cuerpo de un pool z3 evaluado sobre un chassis fijo, por lo que encaja en experimentos de comparacion de modelos dentro de esa red.
- Extraccion de embeddings para busqueda semantica: al declarar el pipeline `feature-extraction`, puede emplearse para generar representaciones vectoriales de documentos en sistemas de recuperacion, siempre que se valide la calidad de los embeddings.
- Investigacion sobre mezcla de pesos (model souping): sirve como caso de estudio reproducible de soup + LoRA + promedio 4:1 para investigadores que estudien tecnicas de fusion de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas comparativas; solo describe el proceso de entrenamiento y las fuentes de datos.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9,1 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica se recomienda al menos 12-16 GB para contexto moderado.
- Cuantizacion: no se publican versiones GGUF ni cuantizadas; habria que generarlas a partir de los safetensors. En 8 bits los pesos ocuparian unos 4,5 GB y en 4 bits unos 2,3 GB, estimaciones teoricas no verificadas por el autor.
- GPU recomendadas: A100 40 GB u H100 para despliegues con contexto largo y batch alto; RTX 4090 (24 GB) suficiente para bf16 con contexto moderado; RTX 3090 (24 GB) tambien viable.
- GPU de consumo: cabe en tarjetas de 16 GB o mas en bf16 con contexto limitado; en 8 bits podria caber en 8-12 GB, sujeto a validacion.
- Opciones de despliegue: transformers con `trust_remote_code=True` (el modelo requiere `custom_code`); vLLM y TGI si la arquitectura Qwen3.5 esta soportada por esas herramientas; llama.cpp u Ollama solo si se generan pesos GGUF, que no se distribuyen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| dasLOL/zils-mini-skills-v1 | 4,54 B | no disponible | Apache-2.0 | Hugging Face, 0 descargas | Cuerpo de soup para el pool z3 de Bittensor; requiere chassis externo |
| Qwen/Qwen3.5-4B (modelo base) | aproximadamente 4 B | no disponible en la informacion | no disponible en la informacion | Hugging Face | Modelo generalista del que deriva; soporte nativo en transformers |
| torchcast-ai/torchcast-decision-4b | aproximadamente 4 B | no disponible | Apache-2.0 | Hugging Face | Uno de los dos house bodies promediados en el soup |
| vllm-sr/d3-mini | aproximadamente 4 B | no disponible | Apache-2.0 | Hugging Face | Segundo house body promediado en el soup |

## Limitaciones y advertencias

- El modelo no es un asistente conversacional autonomo: la model card indica que el chassis aporta la capa de respuesta, el prompt y el runtime, por lo que su uso aislado puede producir resultados incompletos o mal formados.
- No se documentan sesgos conocidos, pero el entrenamiento se apoya en conjuntos publicos en ingles (TweetEval, Sarcasm Headlines, 20 Newsgroups, etc.) que arrastran los sesgos de sus fuentes.
- Riesgo de alucinacion: no evaluado ni documentado; al ser un modelo de decision y extraccion de caracteristicas, la generacion libre no es su modo previsto.
- Cobertura linguistica no declarada; el entrenamiento documentado es en ingles, por lo que el rendimiento en castellano es incierto.
- Longitud de contexto no disponible, lo que impide planificar despliegues con documentos largos sin validacion previa.
- Licencia Apache-2.0 permite uso comercial, pero la model card remite a los NOTICE y terminos de los repositorios upstream (Qwen y los house models), que deben revisarse.
- Requiere `trust_remote_code=True` por el tag `custom_code`, lo que implica ejecutar codigo del autor; conviene auditar el codigo antes de desplegar en produccion.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de comunidad, validacion independiente ni soporte.
- El modelo se publico con fecha 2026-11-05 y se actualizo un minuto despues; no hay historial de versiones que permita evaluar su estabilidad.

## Enlaces

- Hugging Face: https://huggingface.co/dasLOL/zils-mini-skills-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- House body 1: https://huggingface.co/torchcast-ai/torchcast-decision-4b
- House body 2: https://huggingface.co/vllm-sr/d3-mini
- Profesor de destilacion: https://huggingface.co/vllm-sr/d3-ultra
- Datos de destilacion: https://huggingface.co/zils-ai/zils-relay-answers
- tasksource (Sileo, LREC-COLING 2024): no disponible como enlace directo en la informacion
- BIG-bench (Srivastava et al., 2022): no disponible como enlace directo en la informacion

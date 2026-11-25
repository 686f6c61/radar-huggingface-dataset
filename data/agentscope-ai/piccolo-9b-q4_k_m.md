# agentscope-ai/Piccolo-9B-Q4_K_M

## Resumen

Piccolo-9B-Q4_K_M es la distribucion cuantizada en formato GGUF del modelo Piccolo-9B, desarrollado por AgentScope (agentscope-ai). A diferencia de un modelo generativo convencional, Piccolo es un modelo de decision: no produce tokens de respuesta, sino que puntua y clasifica candidatos para tareas de revision de herramientas y seleccion de contexto en pipelines de agentes. Esta version concreta aplica cuantizacion Q4_K_M sobre el backbone de texto convertido previamente a BF16 GGUF, con el objetivo de reducir el peso a unos 5,6 GB y facilitar el despliegue local.

El modelo cuenta con 8.953.803.264 parametros totales (aproximadamente 9B) y emplea una arquitectura con atencion bidireccional sobre el prompt, una caracteristica poco habitual en modelos causales y clave para su funcion de scoring. Soporta ingles y chino, se distribuye bajo licencia Apache 2.0 y esta etiquetado como `decision-model` y `text-classification`.

Su relevancia actual radica en que cubre una necesidad creciente en sistemas multiagente: decidir que herramienta invocar o que fragmento de contexto incluir, sin gastar presupuesto de generacion. Al devolver probabilidades directamente mediante un endpoint `/v1/systemone`, elimina la latencia y el coste asociados a generar texto para tomar una decision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion bidireccional sobre el prompt (bidirectional-attention); backbone de texto tipo QwenPaw |
| Parametros totales | 8.953.803.264 (aprox. 9B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); el modelo base se convirtio de BF16 a Q4_K_M |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (2 shards, ~5,6 GB en total) |

## Arquitectura y entrenamiento

Piccolo-9B se basa en un transformer con atencion bidireccional sobre el prompt, en lugar de la atencion causal tipica de los modelos generativos. Esta eleccion permite que el modelo observe simultaneamente la consulta completa y los candidatos propuestos, y emita una puntuacion de probabilidad nativa para cada uno. El pipeline declarado es `text-classification` y el modelo esta etiquetado como `decision-model`, lo que confirma que su salida es una distribucion de probabilidad sobre candidatos, no texto generado.

La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifica la innovacion de decodificacion especulativa ni otros detalles del preentrenamiento. Lo que si se documenta es el proceso de cuantizacion: el backbone de texto se convirtio primero a BF16 GGUF y despues se cuantizo a Q4_K_M. La validacion numerica reportada sobre 556 juicios sinteticos arroja una divergencia media de variacion total de 0,013701 respecto a la referencia BF16, con un p95 de 0,081681, lo que indica una degradacion contenida tras la cuantizacion.

## Capacidades

- Puntuacion de candidatos: devuelve probabilidades sobre opciones propuestas sin generar tokens de respuesta.
- Revision de herramientas (tool review): evalua y selecciona que herramienta es adecuada para una tarea dada.
- Seleccion de contexto: decide que fragmentos de contexto incluir en el prompt de un agente.
- Clasificacion de texto: pipeline declarado `text-classification`.
- Atencion bidireccional sobre el prompt, que permite condicionar la decision sobre la totalidad de la entrada.
- Soporte multilingue limitado a ingles y chino.
- Integracion con runtimes compatibles: requiere el runtime llama.cpp especifico de Piccolo con atencion bidireccional y scoring nativo de candidatos.
- Endpoint `/v1/systemone` para obtener probabilidades directamente.
- No se documentan capacidades de generacion de texto libre, codigo, matematicas, vision, audio, tool calling generativo ni agentes multi-paso en la informacion disponible.

## Casos de uso

- Enrutamiento de herramientas en agentes: dado un mensaje de usuario y un catalogo de herramientas, Piccolo puntua cada candidata y el orquestador elige la de mayor probabilidad, evitando una llamada generativa completa.
- Seleccion de contexto en RAG: ante varios fragmentos recuperados, el modelo asigna probabilidades de relevancia y permite recortar el contexto enviado al modelo generativo, reduciendo coste y latencia.
- Filtrado previo en pipelines de atencion al cliente: clasificar la intencion o la herramienta adecuada antes de invocar un LLM mayor, usando el endpoint de probabilidades.
- Validacion de llamadas a funciones: revisar si una llamada a herramienta propuesta por otro modelo es coherente con la consulta original, como paso de verificacion en produccion.
- Despliegue local en estaciones de trabajo: con ~5,6 GB en Q4_K_M, puede ejecutarse en equipos sin GPU de datacenter para tareas de decision de baja latencia.
- Sistemas multiagente con presupuesto limitado: sustituir decisiones basadas en generacion por scoring directo, reduciendo el consumo de tokens en bucles de planificacion.
- Moderacion o triaje de consultas: clasificar entradas en categorias predefinidas con umbrales de probabilidad configurables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la validacion numerica de la cuantizacion: divergencia media de variacion total de 0,013701 (p95 0,081681) frente a la referencia BF16 sobre 556 juicios sinteticos. Los resultados de evaluacion del modelo base se enlazan en el repositorio de GitHub del proyecto, pero no se incluyen cifras en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,6 GB solo para los pesos en Q4_K_M; con overhead de contexto y runtime, se recomienda reservar entre 7 y 9 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues de mayor concurrencia.
- Compatibilidad con GPU de consumo: si, cabe en GPUs consumer con 8 GB o mas de VRAM en Q4_K_M.
- Opciones de despliegue: exclusivamente el runtime llama.cpp compatible con Piccolo (atencion bidireccional y scoring nativo de candidatos); no se garantiza compatibilidad con llama.cpp estandar, vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Formato |
|---|---|---|---|---|---|
| Piccolo-9B-Q4_K_M | ~9B | No disponible | Modelo de decision / scoring | Apache 2.0 | GGUF |
| Piccolo-9B (base) | ~9B | No disponible | Modelo de decision / scoring | Apache 2.0 | No disponible |
| Piccolo-27B | ~27B | No disponible | Modelo de decision / scoring | No disponible | No disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada. Como alternativas funcionales de proposito general (clasificacion y enrutamiento) podrian considerarse modelos encoder como DeBERTa o clasificadores basados en LLM, pero no se aportan cifras que permitan una comparacion rigurosa; se indica "no disponible".

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, codigo ni respuestas conversacionales; su salida son probabilidades sobre candidatos.
- Requiere un runtime especifico: el llama.cpp estandar no soporta la atencion bidireccional ni el scoring nativo, por lo que el despliegue con herramientas convencionales no funcionara.
- Idiomas limitados a ingles y chino; el rendimiento en castellano no esta documentado.
- La cuantizacion Q4_K_M introduce una divergencia media de 0,013701 (p95 0,081681) frente a BF16, lo que puede afectar a decisiones con umbrales ajustados.
- Riesgo de sesgo y alucinacion no evaluado en la informacion disponible; al tratarse de un modelo de scoring, el riesgo se manifiesta como calibracion deficiente de probabilidades mas que como texto inventado.
- Longitud de contexto no documentada; no se puede garantizar el comportamiento con prompts largos.
- Aunque la licencia es Apache 2.0, deben revisarse los avisos de terceros (THIRD_PARTY_LICENSES.md) antes de uso comercial.
- El modelo tiene muy pocas descargas (299) y ningun "like", lo que sugiere una validacion comunitaria limitada; conviene realizar pruebas propias antes de produccion.
- La fecha de creacion indicada (2026-10-28) debe tratarse con cautela por posible inconsistencia en los metadatos.

## Enlaces

- Hugging Face (Q4_K_M): https://huggingface.co/agentscope-ai/Piccolo-9B-Q4_K_M
- Modelo base Piccolo-9B: https://huggingface.co/agentscope-ai/Piccolo-9B
- Repositorio del proyecto en GitHub: https://github.com/agentscope-ai/Piccolo
- Documentacion del runtime QwenPaw: https://github.com/agentscope-ai/Piccolo/blob/main/docs/QWENPAW.md
- Evaluacion: https://github.com/agentscope-ai/Piccolo/tree/main/evaluation
- Listado de modelos: https://github.com/agentscope-ai/Piccolo/blob/main/docs/MODELS.md
- Decision Playground: https://decisionplayground.agentscope.io/
- Coleccion en ModelScope: https://www.modelscope.cn/collections/AgentScope/QwenPaw-Flash
- ModelScope (modelo): https://www.modelscope.cn/models/AgentScope/Piccolo-9B-Q4_K_M
- Validacion numerica: https://huggingface.co/agentscope-ai/Piccolo-9B-Q4_K_M/resolve/main/validation.json
- Licencia: https://huggingface.co/agentscope-ai/Piccolo-9B-Q4_K_M/resolve/main/LICENSE
- Avisos de terceros: https://huggingface.co/agentscope-ai/Piccolo-9B-Q4_K_M/resolve/main/THIRD_PARTY_LICENSES.md

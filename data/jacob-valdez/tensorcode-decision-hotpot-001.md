# jacob-valdez/tensorcode-decision-hotpot-001

## Resumen

TensorCode Decision support relevance prototype es un checkpoint experimental publicado por el usuario jacob-valdez bajo la libreria `tensorcode`. No es un modelo generativo ni un agente cognitivo general: es un modelo de ranking de candidatos que puntua documentos de HotpotQA para estimar cuales son los hechos de soporte (supporting facts) de una pregunta. El propio autor lo describe como un "prototipo de relevancia para soporte de decision" con un encoder propio, un espacio de trabajo diferenciable compartido y una cabeza de puntuacion de candidatos.

El modelo tiene 13.590.657 parametros (aproximadamente 13,6 millones) y se distribuye en formato safetensors dentro de un repositorio de 0,1 GB. Su interfaz de carga es especifica de la libreria: `from tensorcode.tools.decision import Decision` seguido de `Decision.from_pretrained(path_or_repo)`. La entrada consiste en una pregunta o hipotesis junto con una lista de candidatos, cada uno con identificador y texto.

Es relevante como pieza de investigacion reproducible sobre reranking de pasajes en tareas multi-hop, no como sustituto de un modelo de lenguaje. El autor declara explicitamente que las puntuaciones son proxies de relevancia no calibrados, que la atencion es enrutamiento aprendido y no prueba de soporte factual, y que este checkpoint comparte pesos con otro checkpoint (Investigator) en lugar de haber sido entrenado y evaluado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder propio con espacio de trabajo diferenciable compartido y cabeza de puntuacion de candidatos (detalles de capas y dimensiones: no disponibles) |
| Parametros totales | 13.590.657 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo publica safetensors; no se listan versiones GGUF, GPTQ, AWQ ni cuantizaciones declaradas) |
| Idiomas soportados | No disponible (el dataset de entrenamiento es HotpotQA, en ingles, pero no se declara cobertura idiomatica oficial) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Libreria de carga | tensorcode |
| Tamano del repositorio | 0,1 GB |
| Dataset de entrenamiento declarado | hotpotqa/hotpot_qa |
| Fecha de creacion | 2026-09-21 |
| Ultima actualizacion | 2026-09-21 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe un encoder propio ("owned encoder"), un espacio de trabajo diferenciable compartido ("shared differentiable workspace") y una cabeza de puntuacion de candidatos. El modelo puntua un conjunto de documentos candidatos para una pregunta dada, usando como supervision las anotaciones humanas de hechos de soporte de HotpotQA. Cuando se usan pesos fundacionales heredados, estos quedan fijados (pinned) en el manifiesto. El autor indica que la ablacion con el espacio de trabajo a cero ("zero_workspace") no muestra una ventaja consistente del espacio de trabajo en las metricas evaluadas sobre el subconjunto reservado, por lo que no se puede atribuir la mejora a ese componente con los datos publicados.

En cuanto al procedimiento, la model card especifica que el vocabulario nuevo y los gradientes se construyen usando unicamente las preguntas de entrenamiento, que los activos del tokenizador fundacional se heredan, que los identificadores de validacion oficial reservados se fijan antes del ajuste y que la ultima epoca se guarda sin seleccion basada en validacion. El entrenamiento reportado son 8 epocas, con una perdida de entrenamiento que desciende de 2,0581 a 1,9590. Los hiperparametros, hashes, identificadores de particiones y limitaciones se documentan en `training-manifest.json`. No se menciona RLHF, DPO ni ninguna fase de alineacion.

## Capacidades

- Puntuacion de relevancia de candidatos: dado un par pregunta/candidatos (o hipotesis/candidatos), devuelve puntuaciones para ordenar los documentos.
- Reranking de documentos para preguntas multi-hop: la tarea concreta entrenada es identificar los documentos de soporte en HotpotQA.
- Interfaz Decision: carga mediante `tensorcode.tools.decision.Decision` con `from_pretrained`.
- Interfaz Planner en el mismo linaje: segun la model card, las entradas son objetivo/planes, y las puntuaciones del Planner son proxies de relevancia, no utilidad de plan medida.
- Recarga determinista: las metricas del checkpoint recargado coinciden exactamente con las del checkpoint "after" (perdida 2,052191592287272, support_hit_at_1 0,5546875, support_recall_at_2 0,42578125).
- Generacion de texto: no disponible; no se declara ninguna capacidad generativa.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no soportado segun el autor, que afirma explicitamente que el modelo "no es un agente cognitivo general" y que este lanzamiento establece un modelo estrecho de ranking de soporte, no razonamiento o planificacion generales.
- Capacidades multilingues: no disponibles.
- Vision, audio, modo thinking: no disponibles.

## Casos de uso

- Reranking en pipelines RAG multi-hop: el modelo puede colocarse como etapa de reranking despues de un recuperador inicial, ordenando los pasajes recuperados para una pregunta compuesta. Es adecuado porque su objetivo de entrenamiento es precisamente identificar documentos de soporte en HotpotQA.
- Filtrado de contexto antes de un LLM generador: dado un conjunto de fragmentos candidatos, se seleccionan los mejor puntuados para reducir el numero de tokens enviados al modelo generativo. Encaja por su funcion de scoring de candidatos y su tamano reducido, que permite ejecutarlo en CPU.
- Trazabilidad y auditoria de respuestas: al puntuar que documentos sostienen una pregunta, se puede registrar la evidencia seleccionada junto a la respuesta final. El autor advierte que las puntuaciones no estan calibradas, por lo que servirian como orden relativo, no como probabilidad de soporte factual.
- Evaluacion comparativa de recuperadores: el checkpoint incluye una linea base lexica propia (solapamiento de tokens alfanumericos en minusculas entre pregunta y pasaje, con desempate por orden de candidato) con support_hit_at_1 de 0,53125 y support_recall_at_2 de 0,4296875, util como referencia para medir mejoras de un recuperador sobre el mismo subconjunto.
- Investigacion sobre espacios de trabajo diferenciables: el repositorio publica una ablacion zero_workspace y las metricas por epoca de desarrollo, lo que permite reproducir y discutir si el componente de workspace aporta beneficio en esta tarea.
- Prototipado de seleccion de documentacion en soporte tecnico: con un esquema equivalente de pregunta (incidencia) y candidatos (articulos de base de conocimiento), el mismo tipo de cabeza de scoring puede emplearse para priorizar articulos, siempre que se reentrene o adapte, ya que los pesos publicados estan ajustados a HotpotQA.
- Presupuesto de contexto en agentes: como etapa previa a un agente con ventana limitada, el modelo puede descartar candidatos poco relevantes y dejar solo los mejor clasificados, reduciendo coste de inferencia del modelo principal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K y similares) en la informacion disponible, algo esperable dado que el modelo no es generativo. Los datos medidos que si se publican son metricas internas de ranking de soporte sobre HotpotQA:

| Metrica | Antes | Despues | Zero workspace | Recargado |
|---|---|---|---|---|
| Perdida (loss) | 2,2841717852279544 | 2,052191592287272 | 2,0580312702804804 | 2,052191592287272 |
| support_hit_at_1 | 0,28125 | 0,5546875 | 0,5546875 | 0,5546875 |
| support_recall_at_2 | 0,25 | 0,42578125 | 0,43359375 | 0,42578125 |

Perdida de entrenamiento por epoca (8 valores): 2,0581344543024898; 2,0137970969080925; 1,9991599032655358; 1,9846284333616495; 1,97900964692235; 1,9737375043332577; 1,9706492787227035; 1,959020284935832.

Metricas de desarrollo por epoca (loss / support_hit_at_1 / support_recall_at_2):

| Epoca | Loss | support_hit_at_1 | support_recall_at_2 |
|---|---|---|---|
| 1 | 2,085578520782292 | 0,546875 | 0,421875 |
| 2 | 2,0937450788915157 | 0,5546875 | 0,43359375 |
| 3 | 2,0819874573498964 | 0,5625 | 0,4296875 |
| 4 | 2,0911868726834655 | 0,609375 | 0,4453125 |
| 5 | 2,0898405527696013 | 0,59375 | 0,45703125 |
| 6 | 2,0994820408523083 | 0,609375 | 0,44921875 |
| 7 | 2,0739225912839174 | 0,6015625 | 0,44921875 |
| 8 | 2,0585968466475606 | 0,5703125 | 0,4609375 |

Comparacion con la linea base lexica publicada por el autor:

| Metodo | support_hit_at_1 | support_recall_at_2 |
|---|---|---|
| Solapamiento lexico de tokens (unico, casefold) | 0,53125 | 0,4296875 |
| Modelo (after) | 0,5546875 | 0,42578125 |
| Modelo (zero workspace) | 0,5546875 | 0,43359375 |

Nota: el propio autor senala que la ablacion con workspace a cero no demuestra un beneficio consistente en las metricas sobre este subconjunto reservado.

## Requisitos de hardware

- VRAM estimada para inferencia: por debajo de 1 GB en todos los casos. Calculo a partir de los 13.590.657 parametros: unos 54 MB en FP32, unos 27 MB en FP16/BF16, unos 14 MB en INT8 y unos 7 MB en INT4, mas el coste de activaciones y del vocabulario propio.
- GPU recomendadas: cualquiera. El modelo cabe holgadamente en GPUs de gama de entrada, integradas o incluso en CPU. Una RTX 4090, A100 o H100 estarian enormemente sobredimensionadas para este checkpoint.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual y en la mayoria de generaciones anteriores, dado que el peso total del repositorio es de 0,1 GB.
- Opciones de despliegue: la via documentada es la libreria `tensorcode` (`from tensorcode.tools.decision import Decision`; `Decision.from_pretrained(...)`). No se documenta soporte para vLLM, llama.cpp, Ollama, TGI ni servidores de inferencia generica, coherente con que no es un modelo generativo.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables para alternativas de la misma categoria en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| tensorcode-decision-hotpot-001 | 13.590.657 | No disponible | No disponible | HuggingFace, libreria tensorcode | Ranking de soporte sobre HotpotQA; sin benchmarks publicos frente a terceros |
| Linea base lexica del propio autor | No aplica | No disponible | No disponible | Incluida en la model card | support_hit_at_1 0,53125; support_recall_at_2 0,4296875 |
| Checkpoint Investigator del mismo linaje | Comparte pesos con este checkpoint | No disponible | No disponible | Mencionado en la model card | El autor indica que no fue entrenado ni evaluado como modelo independiente |
| Otros cross-encoders de reranking (por ejemplo, familia MiniLM para MS MARCO) | No disponible | No disponible | No disponible | No disponible | No hay datos de comparacion en la informacion proporcionada |

## Limitaciones y advertencias

- Alcance estrecho: es un ranker de candidatos para HotpotQA, no un modelo de razonamiento, planificacion o conversacion. El autor lo afirma de forma explicita.
- No es un modelo independiente: comparte los pesos de ranking con el checkpoint Investigator y, segun la model card, no fue entrenado ni evaluado como modelo independiente.
- Puntuaciones no calibradas: los scores son ordenes relativos, no probabilidades de soporte factual; no deben usarse como umbrales con significado probabilistico.
- La atencion es enrutamiento aprendido, no evidencia de soporte factual, segun el propio autor.
- Sin beneficio demostrado del componente de espacio de trabajo: la ablacion zero_workspace no mejora de forma consistente las metricas, y en support_recall_at_2 resulta ligeramente superior al modelo con workspace (0,43359375 frente a 0,42578125).
- Seleccion de checkpoint sin validacion: la ultima epoca se guarda sin seleccion basada en validacion, por lo que no hay garantia de que el punto publicado sea el optimo.
- Mejora modesta frente a una linea base lexica: la diferencia en support_hit_at_1 es de 0,5546875 frente a 0,53125 (+0,0234 puntos absolutos), mientras que en support_recall_at_2 el modelo queda por debajo de la linea base (0,42578125 frente a 0,4296875).
- Sesgos conocidos: no disponibles. No se publica analisis de sesgo ni caracterizacion de la distribucion del dataset mas alla de HotpotQA.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto; el riesgo equivalente es seleccionar como soporte un documento irrelevante.
- Limitaciones de contexto e idioma: la longitud de contexto no esta declarada; el entrenamiento se apoya en HotpotQA, en ingles, y no se declara soporte multilingue.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede confirmar si el uso comercial esta permitido. Esto es un bloqueo para produccion hasta que el autor la especifique.
- Madurez: el repositorio se marca como experimental, tiene 0 descargas y 0 likes, y no incluye demos, papers ni documentacion externa.
- Dependencia de la libreria `tensorcode`: la carga requiere esa libreria y su esquema concreto de entrada, lo que limita la interoperabilidad con el ecosistema estandar de transformers.

## Enlaces

- HuggingFace: https://huggingface.co/jacob-valdez/tensorcode-decision-hotpot-001
- Dataset de entrenamiento declarado: hotpotqa/hotpot_qa (referenciado en la model card; no se aporta URL directa)
- Manifiesto de entrenamiento: `training-manifest.json` (referenciado en la model card; no se aporta URL directa)
- Ejemplo de TensorCode: mencionado como "TensorCode example" en la model card para el esquema completo; no se aporta URL
- Paper, blog, repositorio o demo adicionales: no disponibles
- La busqueda web realizada no devolvio ningun enlace relevante para este modelo: los resultados correspondian a entidades no relacionadas (articulos enciclopedicos sobre la figura de Jacob y sitios de empresas de sanitarios y tuberias con la misma denominacion).

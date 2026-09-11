# ielabgroup/ITER-Qwen3-Embedding-4B

## Resumen

ITER-Qwen3-Embedding-4B es un recuperador denso (dense retriever) desarrollado por el grupo ielabgroup y presentado en el articulo *Interaction-Aware Retrieval for Agentic Search* (arXiv:2608.27912). A diferencia de los recuperadores convencionales, que clasifican documentos usando unicamente la sub-consulta actual, ITER condiciona cada recuperacion al historial de interaccion del agente: la pregunta principal, el razonamiento previo a la busqueda, la sub-consulta actual y las sub-consultas ya intentadas. El objetivo es devolver informacion nueva y no redundante dentro de trayectorias de busqueda de agentes de deep research.

El modelo es un fine-tuning completo de Qwen/Qwen3-Embedding-4B, con 4.021.774.336 parametros (aproximadamente 4,02 B) y un repositorio de 32,2 GB en formato safetensors. Los limites de longitud declarados por el autor son 8192 tokens para la consulta y 512 tokens para el pasaje. El modelo emplea pooling de ultimo token con normalizacion L2 y esta disenado para servirse en bfloat16.

Su relevancia actual radica en que aborda un cuello de botella especifico de los agentes de busqueda: la redundancia entre iteraciones. En lugar de mejorar solo la representacion de la consulta aislada, ITER incorpora el estado de la trayectoria (que se ha buscado ya y que razonamiento ha motivado el paso actual) para penalizar implicitamente resultados ya cubiertos. Existe una version menor, ielabgroup/ITER-Qwen3-Embedding-0.6B, con la misma formulacion de consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso derivado de Qwen/Qwen3-Embedding-4B; pooling de ultimo token (left padding) y normalizacion L2 |
| Parametros totales | 4.021.774.336 (aproximadamente 4,02 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens para consulta; 512 tokens para pasaje (maximos declarados por el autor) |
| Tipos de cuantizacion | no disponible; el autor recomienda servir en bfloat16 (float16 altera el ranking, hasta varios puntos de recall en BrowseComp-Plus) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Tipo de tarea (pipeline) | feature-extraction (sentence-similarity, dense-retrieval) |
| Modelo base | Qwen/Qwen3-Embedding-4B (fine-tuning completo) |
| Tamano del repositorio | 32,2 GB |
| Descargas / likes | 15 descargas / 0 likes (a fecha de actualizacion 2026-09-11) |
| Compatibilidad de despliegue | transformers, text-embeddings-inference, endpoints compatibles |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-Embedding-4B y se somete a un fine-tuning completo (la seccion de entrenamiento de la model card aparece truncada en la informacion disponible, por lo que no se detallan el numero de tokens, la composicion del dataset ni el uso de RLHF o DPO). La salida de embeddings se obtiene mediante pooling del ultimo token sobre la ultima capa oculta, seguido de normalizacion L2; la tokenizacion se realiza con `padding_side="left"`.

La innovacion principal es la supervision relativa a la trayectoria (trajectory-relative supervision). Los positivos se extraen de los documentos que el agente visita realmente, verificados mediante una comprobacion de relevancia con un LLM sobre el razonamiento posterior a la visita. Los negativos se estratifican segun la evidencia de interaccion en tres niveles: redundancia, dificiles y debiles, recogidos en un entorno de busqueda con deduplicacion. La representacion por defecto de la consulta combina cuatro campos de lenguaje natural: `Main Question`, `Current Reasoning`, `Current Subquery` y `Previous Interactions` (lista numerada de sub-consultas previas, de la mas antigua a la mas reciente). Los campos deben respetarse literalmente, incluidos los valores `<empty>` cuando no exista razonamiento o historial previo.

## Capacidades

- Recuperacion densa de pasajes (feature-extraction) con similitud por producto escalar sobre embeddings normalizados.
- Recuperacion condicionada al historial de interaccion de un agente: pregunta principal, razonamiento previo, sub-consulta actual y sub-consultas ya realizadas.
- Penalizacion implicita de redundancia: la instruccion de consulta pide explicitamente documentos que aporten informacion nueva no encontrada aun.
- Manejo de consultas largas de hasta 8192 tokens, suficiente para incluir pregunta principal, razonamiento e historial completo.
- Soporte de similitud semantica entre frases (tag sentence-similarity) y de tareas de recuperacion tipo dense-retrieval.
- Integracion con el ecosistema transformers y con text-embeddings-inference; compatible con endpoints.
- Uso en entornos de busqueda agentica y deep research, segun los tags del modelo (agentic-search, deep-research).
- No es un modelo generativo: no produce texto, solo representaciones vectoriales.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- No se documentan capacidades de tool calling, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Agentes de deep research multi-turno: el modelo se usa como recuperador dentro de un bucle en el que el agente genera sub-consultas sucesivas. Al recibir el razonamiento y las sub-consultas previas, devuelve documentos nuevos y evita que el agente vuelva a leer paginas ya visitadas.
- Busqueda de respuesta a preguntas complejas sobre corpus cerrado: en escenarios tipo BrowseComp-Plus, el recuperador alimenta al agente con pasajes relevantes para preguntas de varios saltos, donde la consulta original no contiene los terminos que aparecen en los documentos finales.
- Reduccion de redundancia en pipelines RAG iterativos: en un RAG con varias rondas de recuperacion, ITER permite reordenar candidatos en funcion de lo ya recuperado, mejorando la cobertura efectiva del contexto que se inserta en el LLM generador.
- Re-ranking dentro de agentes con memoria de sesion: si se dispone de un primer recuperador barato (por ejemplo, BM25), ITER puede emplearse como segunda etapa condicionada al historial, usando la lista de sub-consultas ya intentadas como señal de penalizacion.
- Asistentes de investigacion cientifica o juridica: el agente explora literatura o normativa en varias iteraciones; ITER ayuda a mantener el foco en material que aporte informacion nueva respecto a lo ya leido, con consultas de hasta 8192 tokens que pueden incluir el contexto del expediente.
- Deduplicacion semantica de resultados en exploracion de grandes colecciones: al condicionar la recuperacion al historial, dos iteraciones con sub-consultas parecidas devuelven conjuntos de documentos mas complementarios.
- Servicio de embeddings en produccion: desplegado con text-embeddings-inference o transformers, el modelo puede exponerse como API de embeddings para cualquier aplicacion que necesite una funcion de puntuacion consulta-documento consciente del contexto de la sesion.
- Generacion de conjuntos de datos de entrenamiento para agentes: las puntuaciones del recuperador pueden usarse para seleccionar trayectorias de busqueda diversas y no redundantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato cuantitativo aportado por el autor es comparativo y no numeCo: servir el modelo en float16 en lugar de bfloat16 produce un ranking medible distinto, con diferencias de hasta varios puntos de recall en BrowseComp-Plus. No se especifican los valores absolutos ni las metricas completas.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 8 GB en bfloat16 (4,02 B de parametros a 2 bytes por parametro). Es una estimacion derivada del recuento de parametros, no un dato publicado por el autor.
- VRAM adicional para activaciones: las consultas pueden alcanzar 8192 tokens, por lo que conviene reservar margen adicional y limitar el tamano de lote en funcion de la GPU.
- GPU recomendadas: A100 y H100 para despliegues con lotes grandes y alto throughput; RTX 4090 o RTX 3090 (24 GB) son suficientes para inferencia en bfloat16 con lotes moderados.
- GPU de consumo: cabe en tarjetas de 24 GB sin problemas; en tarjetas de 16 GB es probable que quepa con lote reducido, aunque no hay confirmacion del autor.
- Opciones de despliegue documentadas o etiquetadas: transformers (uso directo con AutoModel/AutoTokenizer), text-embeddings-inference y endpoints compatibles con el tag endpoints_compatible.
- No se documentan pesos GGUF, Ollama ni cuantizaciones de 4 u 8 bits en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ielabgroup/ITER-Qwen3-Embedding-4B | 4,02 B | 8192 (consulta) / 512 (pasaje) | Recuperacion densa consciente del historial de interaccion del agente | apache-2.0 | HuggingFace; 15 descargas, 0 likes |
| Qwen/Qwen3-Embedding-4B (base) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Recuperacion densa convencional (consulta aislada) | no disponible en la informacion proporcionada | HuggingFace (modelo base) |
| ielabgroup/ITER-Qwen3-Embedding-0.6B | aproximadamente 0,6 B (segun denominacion; dato exacto no disponible) | no disponible en la informacion proporcionada | Misma formulacion ITER en menor tamano | no disponible en la informacion proporcionada | HuggingFace (version menor de la misma familia) |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: solo produce embeddings; cualquier tarea de generacion requiere un LLM adicional.
- El formato de la consulta es estricto: los literales `Main Question:`, `Current Reasoning:`, `Current Subquery:`, `Previous Interactions:`, `<empty>` y la instruccion inicial deben coincidir con los usados en entrenamiento. Desviaciones pueden degradar la recuperacion.
- Requiere servirse en bfloat16. En float16 el ranking cambia de forma medible (hasta varios puntos de recall en BrowseComp-Plus, segun el autor).
- Limite de 512 tokens por pasaje: los documentos largos deben trocearse, lo que puede fragmentar evidencia.
- El modelo esta especializado en trayectorias de agentes de deep research; fuera de ese regimen de uso (por ejemplo, recuperacion de un solo disparo) no hay evidencia de que supere al modelo base.
- Idiomas soportados no documentados: no se puede asumir un comportamiento multilingue equivalente al del modelo base sin evaluacion propia.
- Riesgo de alucinacion: no aplica directamente al ser un recuperador, pero un falso positivo puede inducir al agente a fundamentar una respuesta en un documento irrelevante.
- Sesgos: no se documentan analisis de sesgo ni la composicion del corpus de entrenamiento y de las trayectorias usadas para la supervision.
- Uso comercial: la licencia declarada es apache-2.0, permisiva; conviene verificar igualmente las condiciones del modelo base Qwen/Qwen3-Embedding-4B.
- Madurez: con 15 descargas y 0 likes, la validacion comunitaria es practicamente nula; no se conocen replicaciones independientes de los resultados.
- El repositorio ocupa 32,2 GB, muy por encima de los aproximadamente 8 GB esperables de los pesos en bfloat16, por lo que conviene revisar el contenido antes de descargarlo completo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ielabgroup/ITER-Qwen3-Embedding-4B
- Version 0.6B: https://huggingface.co/ielabgroup/ITER-Qwen3-Embedding-0.6B
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-4B
- Paper: https://arxiv.org/abs/2608.27912
- Codigo: https://github.com/ielab/ITER
- Busqueda web: no se han encontrado enlaces relevantes al modelo en los resultados disponibles.

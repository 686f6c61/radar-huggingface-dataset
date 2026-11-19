# allen-li1231/treehop-rag

## Resumen

TreeHop es un modelo ligero de reescritura de consultas a nivel de embedding, disenado para mejorar la eficiencia del paradigma de recuperacion recursiva en sistemas de Retrieval-Augmented Generation (RAG). Lo desarrolla allen-li1231 y se distribuye bajo licencia MIT. Resuelve el problema de la latencia y el coste computacional de los rewriters basados en LLM en recuperacion multi-hop: en lugar de invocar un LLM en cada iteracion para reescribir la consulta, TreeHop actualiza dinamicamente el embedding de la consulta y aplica estrategias de poda, habilitando un flujo "Retrieve-Embed-Retrieve" sin generacion iterativa.

El modelo parte de BAAI/bge-m3 como base y se afina especificamente para la tarea de recuperacion multi-hop. Con 176,3 millones de parametros (0,18B), es entre uno y dos ordenes de magnitud mas pequeno que los query rewriters basados en LLM, lo que se traduce segun el autor en una reduccion de latencia de recuperacion del 92,8% al 97,8% frente a enfoques iterativos con LLM, manteniendo un recall alto con un numero controlado de pasajes recuperados.

Es relevante ahora porque la recuperacion multi-hop es un cuello de botella real en RAG de produccion: las preguntas complejas requieren varias saltos de recuperacion y los enfoques iterativos con LLM son caros y lentos. TreeHop propone una alternativa a nivel de embedding que cabe en GPU de consumo y se integra con indices FAISS sobre embeddings de BGE-m3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de reescritura de consultas a nivel de embedding, afinado sobre BAAI/bge-m3) |
| Parametros totales | 176.300.032 (0,18B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

TreeHop se construye sobre BAAI/bge-m3, un modelo de embeddings multilingue, y se afina para la tarea de reescritura de consultas a nivel de embedding en recuperacion multi-hop. En lugar de generar texto de consulta reescrita con un LLM, el modelo actualiza el vector de embedding de la consulta de forma dinamica y aplica poda sobre los candidatos, lo que permite encadenar recuperaciones sin una llamada generativa por salto. El repositorio usa `projection_size=1024`, coherente con la dimensionalidad de los embeddings de BGE-m3.

El entrenamiento se realiza sobre bases de datos de embeddings generadas con BGE-m3 a partir de los datasets de entrenamiento y evaluacion del proyecto (entre ellos MultiHop RAG). El repositorio incluye scripts (`init_train_vectors.py`, `init_multihop_rag.py`) para regenerar las bases de vectores, y los datos de entrenamiento y evaluacion estan disponibles tambien via Google Drive. No se detallan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon RLHF o DPO.

La innovacion tecnica principal es la eliminacion de la reescritura iterativa basada en LLM: el flujo "Retrieve-Embed-Retrieve" sustituye la generacion de consultas por una actualizacion del embedding y poda de candidatos, reduciendo la latencia entre un 92,8% y un 97,8% frente a enfoques iterativos con LLM segun el autor.

## Capacidades

- Reescritura de consultas a nivel de embedding para recuperacion multi-hop.
- Recuperacion multi-hop sobre bases de embeddings generadas con BGE-m3, con soporte de busqueda por consulta individual y por lotes (`multihop_search_passages`).
- Actualizacion dinamica del embedding de consulta y poda de candidatos para controlar el numero de pasajes recuperados.
- Integracion con indices FAISS para carga e indexacion eficiente.
- Uso como componente de un pipeline RAG, no como modelo generativo de texto.
- Soporte de ejecucion en GPU Nvidia (CUDA) y en Apple Metal.
- Capacidades multilingues: no confirmadas en la informacion disponible, aunque hereda la base BGE-m3.

## Casos de uso

- Recuperacion multi-hop en RAG de produccion: el modelo permite encadenar varios saltos de recuperacion sin invocar un LLM en cada iteracion, lo que reduce la latencia del pipeline y el coste por consulta en sistemas con alto volumen de peticiones.
- Busqueda documental sobre preguntas complejas: para consultas que requieren combinar informacion de varios pasajes, TreeHop actualiza el embedding de la consulta y poda candidatos, manteniendo recall alto con un numero controlado de pasajes.
- Asistentes de conocimiento corporativo: integrado sobre una base de embeddings de BGE-m3 de documentacion interna, permite responder preguntas que exigen varios saltos entre documentos sin el coste de un rewriter LLM.
- Sistemas de atencion al cliente con base de conocimiento: al reducir la latencia de recuperacion entre un 92,8% y un 97,8% frente a enfoques iterativos con LLM, es adecuado para escenarios interactivos donde el tiempo de respuesta es critico.
- Investigacion en recuperacion de informacion: el repositorio incluye datasets de evaluacion y scripts de reproduccion, lo que facilita experimentar con recuperacion multi-hop y comparar con rewriters basados en LLM.
- Despliegue en hardware limitado: con 0,18B parametros cabe en GPU de consumo y en Apple Metal, lo que permite montar un pipeline RAG multi-hop en estaciones de trabajo sin GPUs de datacenter.
- Indexacion y busqueda por lotes: el metodo `multihop_search_passages` admite consultas en lote, util para procesos de evaluacion offline o precomputo de recuperaciones.

## Benchmarks y rendimiento

El autor reporta en la model card una reduccion de latencia de recuperacion del 92,8% al 97,8% frente a enfoques iterativos basados en LLM, manteniendo recall alto con un numero controlado de pasajes recuperados. No se han publicado en la informacion disponible resultados numericos detallados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) ni tablas comparativas con metricas de recall por dataset.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 176,3M parametros en precision completa el modelo ocupa aproximadamente 0,7 GB en pesos, mas el coste de los embeddings y el indice FAISS.
- El autor indica como requisito minimo GPU Nvidia o Apple Metal con al menos 32 GB de RAM.
- Para reproduccion: 16 GB de RAM de sistema; para entrenamiento: 64 GB de RAM de sistema.
- Espacio en disco: 50 GB libres.
- Cabe en GPU de consumo; el autor no especifica modelos concretos de GPU.
- Opciones de despliegue: el paquete `treehop-rag` con `TreeHopModel.from_pretrained`, retriever `MultiHopRetriever` sobre BGE-m3 y FAISS; soporte de `index_device="cuda"` o CPU en Apple Metal. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: reduccion de latencia del 92,8% al 97,8% frente a rewriters iterativos con LLM segun el autor; no se aportan valores absolutos.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TreeHop (allen-li1231/treehop-rag) | 0,18B | Reescritura de consultas a nivel de embedding | No disponible | MIT | Hugging Face |
| Query rewriters basados en LLM (genericos) | Miles de millones | Reescritura iterativa con LLM | No disponible | Variable | Variable |
| BAAI/bge-m3 (modelo base) | No disponible en la informacion | Embeddings multilingues para recuperacion | No disponible | No disponible en la informacion | Hugging Face |

La comparativa cuantitativa con alternativas concretas de la misma categoria no esta disponible en la informacion proporcionada. El autor situa a TreeHop frente a rewriters basados en LLM en terminos de coste (0,18B frente a miles de millones de parametros) y latencia (92,8%-97,8% menor).

## Limitaciones y advertencias

- El modelo es un componente de recuperacion, no un generador de texto: no debe evaluarse como LLM en tareas de generacion, razonamiento o codigo.
- Depende de la base de embeddings de BGE-m3 y de indices FAISS construidos con el mismo modelo; cambiar el modelo de embeddings invalida el afinado.
- Los requisitos de hardware indicados por el autor (32 GB de RAM minimo con GPU o Apple Metal) son superiores a lo que sugiere el tamano del modelo, probablemente por el manejo de bases de embeddings e indices.
- No se detallan sesgos conocidos ni limitaciones de idioma en la informacion disponible.
- Riesgo de alucinacion no aplica directamente al ser un modelo de recuperacion, pero los pasajes recuperados condicionan la calidad del RAG posterior.
- La licencia MIT permite uso comercial, pero conviene verificar las licencias de los datasets de evaluacion y de BGE-m3 empleados.
- El modelo tiene pocas descargas (34) y likes (4) en el momento de la consulta, lo que sugiere adopcion limitada y menor validacion externa.
- No se especifican tipos de cuantizacion soportados ni longitud de contexto.

## Enlaces

- Hugging Face: https://huggingface.co/allen-li1231/treehop-rag
- Paper TreeHop: https://arxiv.org/abs/2504.20114
- Paper BGE-m3: https://arxiv.org/abs/2402.03216
- Paper MultiHop RAG: https://arxiv.org/abs/2401.15391
- Modelo base BGE-m3: https://huggingface.co/BAAI/bge-m3
- Datos de entrenamiento y evaluacion (Google Drive): https://drive.google.com/drive/folders/1xW6uTl1WfqpcAdSVymf3EVjyAnjE9Lbh

# api-service-sac/s1-code-v1

## Resumen

s1-code v1 es un modelo de decision de tipo System One, con 321.908.998 parametros (aproximadamente 322M), desarrollado por api-service-sac. Su funcion no es generar texto ni codigo, sino devolver la probabilidad de que una funcion de Python concreta responda a una busqueda dada. Se plantea como un reranker especializado que se combina con un modelo de embeddings para mejorar la recuperacion de codigo en repositorios.

El modelo es un ajuste fino (fine-tune) de convaiinnovations/laya, publicado bajo licencia Apache 2.0, y se distribuye con la libreria `laya`. Soporta ingles y castellano, y segun su propia model card rinde mejor en castellano que en ingles en esta primera version, algo que los autores indican haber corregido en las versiones v2 y v3.

Es relevante porque ocupa un nicho muy concreto: el reranking de resultados de busqueda semantica sobre codigo, un paso critico en pipelines de RAG, asistentes de IDE y herramientas de navegacion de repositorios. Con 322M de parametros y ejecucion en CPU, el coste de despliegue es bajo, y los autores publican una mejora medible al fusionarlo con Qwen3-Embedding (de 152 a 167 aciertos Top 1 sobre su conjunto de test). Los propios autores recomiendan usar la version v3 en lugar de esta v1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: convaiinnovations/laya; libreria `laya`) |
| Parametros totales | 321.908.998 (aproximadamente 322M) |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio distribuido en safetensors; tamano de repo 1,3 GB) |
| Idiomas soportados | ingles (en) y castellano (es) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Otros datos: pipeline declarado como no disponible, 0 descargas y 0 likes en el momento de la consulta, creado el 2026-09-30 y actualizado el 2026-09-30. Etiquetas declaradas: `code-search`, `reranker`, `system-one`, `python`.

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base convaiinnovations/laya ni los detalles de la cabecera de clasificacion anadida en el ajuste fino. Lo que si se especifica es su naturaleza funcional: es un modelo de decision System One que recibe un estado y una pregunta y devuelve una probabilidad, en lugar de generar tokens de forma autoregresiva. El estado se compone de la ruta del fichero, el nombre de la funcion, una linea vacia y los primeros 1.500 caracteres del codigo fuente. La pregunta sigue la plantilla `This code answers the search: <your search>`, el mismo formato de entrada que la version v3.

El entrenamiento se realizo sobre 30.068 preguntas generadas (59 % en castellano y 41 % en ingles) correspondientes a funciones de 306 repositorios publicos de Python con licencias permisivas. Los negativos se minaron con granite, segun indica la model card. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion, ni el numero total de tokens de entrenamiento. La innovacion principal del modelo es su rol como reranker ligero y bilingue dentro de un pipeline de recuperacion, mas que cambios arquitectonicos sobre el modelo base.

## Capacidades

- Puntuacion de relevancia: dado un par (funcion de Python, consulta de busqueda), devuelve la probabilidad de que la funcion responda a esa busqueda.
- Reranking de resultados: reordena una lista de candidatos generados por un modelo de embeddings (en su evaluacion, 25 candidatos por consulta procedentes de Qwen3-Embedding).
- Busqueda de codigo sobre repositorios: trabaja con rutas de fichero y fragmentos de hasta 1.500 caracteres como representacion del candidato.
- Bilinguismo en ingles y castellano, con mejor comportamiento declarado en castellano en esta version (78 % frente a 68 % en Top 1 sobre el conjunto de test propio).
- Fusion con modelos de embeddings: los autores reportan una mejora al combinar sus puntuaciones con las de Qwen3-Embedding.
- Inferencia en CPU, dado su tamano de 322M de parametros.
- No se documentan capacidades de generacion de texto, tool calling, function calling, uso como agente, vision, audio ni modo de razonamiento extendido. El modelo esta disenado exclusivamente para puntuar, no para generar.

## Casos de uso

- Reranking en busqueda de codigo interna: integrar el modelo como segunda etapa de un buscador corporativo, donde un embedding recupera 25-50 candidatos por consulta y s1-code v1 los reordena por probabilidad de relevancia. Su tamano de 322M permite ejecutarlo en CPU junto al indice sin despliegues de GPU dedicada.
- Pipelines de RAG sobre documentacion de codigo: en un asistente que responde preguntas sobre una base de codigo, el modelo filtra y ordena las funciones recuperadas antes de pasarlas al LLM generador, reduciendo el ruido en el contexto y con ello el riesgo de respuestas incorrectas.
- Navegacion de repositorios en el IDE: un plugin que, dada una consulta en lenguaje natural ("donde se valida el token de sesion"), devuelve y ordena funciones concretas del proyecto, con soporte de consultas tanto en ingles como en castellano.
- Deduplicacion y triaje de resultados de busqueda: usar la probabilidad del modelo para descartar candidatos por debajo de un umbral y quedarse solo con las funciones que superan un criterio de relevancia, reduciendo el coste de etapas posteriores.
- Evaluacion de sistemas de recuperacion: emplear las puntuaciones como metrica auxiliar para comparar indices, modelos de embeddings o estrategias de chunking en un banco de pruebas de busqueda de codigo.
- Equipos hispanohablantes con consultas en castellano: dado que el modelo se entreno con un 59 % de preguntas en espanol y declara mejor rendimiento en ese idioma, encaja en organizaciones que buscan codigo con consultas en castellano, un escenario peor cubierto por los embeddings generalistas.
- Despliegue on-premise o en entornos aislados: al ejecutarse en CPU y distribuirse en safetensors con licencia Apache 2.0, puede desplegarse en infraestructura sin GPU y sin conexion a servicios externos, util en entornos con requisitos de confidencialidad del codigo.
- Filtrado previo en herramientas de analisis estatico: priorizar funciones candidatas a revisar en auditorias o refactorizaciones a partir de descripciones textuales del problema.

## Benchmarks y rendimiento

La model card publica resultados sobre un nuevo conjunto de test de 197 preguntas, con 25 candidatos por pregunta generados por Qwen3-Embedding. Los valores de la columna Top 1 son el numero de aciertos en primera posicion; los porcentajes de ingles y castellano son los reportados por el autor para cada subconjunto.

| Sistema | Top 1 | Ingles | Castellano |
|---|---|---|---|
| s1-code v1 en solitario | 144 | 68 % | 78 % |
| s1-code v1 + Qwen3-Embedding (fusionado) | 167 | 79 % | 91 % |
| Qwen3-Embedding en solitario | 152 | 76 % | 78 % |

No se han publicado en la informacion disponible otros benchmarks estandar (MMLU, HumanEval, GSM8K u similares), lo cual es coherente con la naturaleza del modelo: es un reranker de codigo y no un modelo generativo de proposito general.

## Requisitos de hardware

- VRAM estimada para inferencia: en precision fp32, aproximadamente 1,29 GB solo para los pesos (322M parametros x 4 bytes); en fp16/bf16, alrededor de 0,64 GB; en int8, en torno a 0,32 GB. Hay que anadir el overhead del runtime y de los estados de entrada (hasta 1.500 caracteres de codigo por candidato). Estimaciones calculadas a partir del numero de parametros, no publicadas por el autor.
- Ejecucion en CPU: la propia model card describe el modelo como de 322M y CPU, por lo que la inferencia sin GPU es un escenario previsto.
- GPU recomendadas: al no publicarse requisitos oficiales, cualquier GPU consumer con al menos 2-4 GB de VRAM libre deberia ser suficiente (por ejemplo, GTX 1650, RTX 3050, RTX 3060, RTX 4090). Para lotes grandes, A100 o H100 no son necesarias por tamano, pero pueden usarse para maximizar throughput. Dato no confirmado por el autor.
- Cabe en GPU consumer: si, con margen amplio, dado el tamano de 322M de parametros. Esta afirmacion se deduce del recuento de parametros, no de una tabla oficial de requisitos.
- Opciones de despliegue: la model card indica el uso de la libreria `laya`. No se documentan en la informacion disponible integraciones con vLLM, llama.cpp, Ollama o TGI, ni la existencia de pesos en formato GGUF. Conviene verificar el soporte real de cada runtime antes de planificar el despliegue.
- Latencia y throughput estimados: no disponibles. No se publican cifras de latencia por consulta ni de candidatos procesados por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (Top 1, test propio) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| s1-code v1 | 321,9M | no disponible | 144 en solitario; 167 fusionado con Qwen3-Embedding | Apache 2.0 | HuggingFace |
| s1-code v3 | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible | HuggingFace (los autores lo recomiendan sobre v1) |
| Qwen3-Embedding | no disponible | no disponible | 152 en solitario | no disponible | HuggingFace (usado como generador de candidatos en el test de s1-code v1) |
| convaiinnovations/laya | no disponible | no disponible | no disponible | Apache 2.0 (segun la model card de s1-code v1) | HuggingFace (modelo base) |

La comparacion con otras alternativas de reranking de codigo (por ejemplo, cross-encoders genericos o rerankers multilingues de proposito general) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Version superada por sus sucesoras: la propia model card indica explicitamente "For use, prefer v3". s1-code v1 solo deberia usarse por motivos de reproducibilidad o comparacion historica.
- Desequilibrio idiomatico: el modelo es mas fuerte en castellano (78 % Top 1) que en ingles (68 %), un sesgo que los autores reconocen y que dicen haber corregido en v2 y v3. Para cargas de trabajo en ingles, esta version es claramente inferior a la alternativa de embeddings evaluada (76 %).
- Dependencia de un generador de candidatos: el modelo no recupera documentos por si mismo, solo puntua un conjunto ya recuperado. Su rendimiento agregado esta acotado por la tasa de recall del modelo de embeddings que lo alimenta.
- Ambito restringido a Python: el entrenamiento se realizo sobre 306 repositorios publicos de Python con licencias permisivas. No hay evidencia de transferencia a otros lenguajes.
- Formato de entrada rigido: el estado debe construirse con ruta de fichero, nombre de funcion, linea vacia y los primeros 1.500 caracteres del fuente, y la pregunta debe seguir la plantilla `This code answers the search: <your search>`. Desviarse del formato puede degradar las puntuaciones.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto; el riesgo equivalente es asignar una probabilidad alta a una funcion irrelevante, lo que puede inducir errores en cascada en el pipeline.
- Sesgos de los datos: el entrenamiento se apoya en repositorios publicos con licencias permisivas, por lo que hereda los sesgos de estilo, dominios y convenciones de ese corpus. La model card no documenta un analisis de sesgos.
- Falta de trazabilidad: 0 descargas y 0 likes, creado y actualizado el mismo dia (2026-09-30). No se documentan evaluaciones independientes, ni detalles de arquitectura, contexto, cuantizaciones o requisitos de hardware que permitan auditar el modelo en profundidad.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero conviene revisar las condiciones del modelo base convaiinnovations/laya y de los repositorios usados en el entrenamiento, ya que la model card no incluye una lista de dichos repositorios.
- Caveat de produccion: no hay informacion publicada sobre latencia, throughput ni estabilidad bajo carga, por lo que cualquier despliegue productivo requerira una evaluacion propia previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/api-service-sac/s1-code-v1
- Version recomendada por los autores, s1-code v3: https://huggingface.co/api-service-sac/s1-code-v3
- Modelo base, convaiinnovations/laya: https://huggingface.co/convaiinnovations/laya
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo. Las busquedas devolvieron unicamente paginas genericas sobre el concepto de API (Wikipedia, IBM, HubSpot) y un sitio de inmobiliaria, sin relacion con s1-code v1. No se dispone de paper, blog tecnico ni repositorio adicional asociado al modelo.

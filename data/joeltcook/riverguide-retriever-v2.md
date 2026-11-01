# joeltcook/riverguide-retriever-v2

## Resumen

riverguide-retriever-v2 es un modelo de embeddings de frases (sentence-transformer) obtenido mediante fine-tuning de Qwen/Qwen3-Embedding-0.6B, desarrollado por el usuario joeltcook. Su proposito es actuar como recuperador de primera etapa (retrieval) para un sistema RAG: dada una consulta escrita por un estudiante o familiar, devuelve las paginas web del Indian River State College (IRSC) que mejor la responden. El modelo no genera texto; produce un unico vector normalizado por consulta en un solo forward pass.

La relevancia de esta version (v2) frente a la v1 radica en el tipo de consulta que maneja. La v1 se entreno con consultas de estilo busqueda y encontraba la pagina correcta en el 96 % de los casos sobre paginas no vistas, pero fallaba mas con los primeros mensajes reales de los estudiantes, que describen una situacion en lugar de nombrar la oficina, el formulario o la politica. La v2 anade 8.183 primeros mensajes conversacionales para corregir ese sesgo.

Con 595.776.512 parametros, licencia Apache 2.0 y pesos en safetensors (bf16), el modelo esta pensado para desplegarse en infraestructura modesta. Su ambito es deliberadamente estrecho: dominio educativo de una institucion concreta y consultas en ingles. No es un modelo de embeddings generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (derivado de Qwen3-Embedding-0.6B) para sentence-transformers |
| Parametros totales | 595.776.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-Embedding-0.6B; no especificada en la model card) |
| Tipos de cuantizacion | pesos publicados en bf16; en CPU se recomienda cargar en float32 (`model_kwargs={"dtype": torch.float32}`); no se documentan cuantizaciones GGUF/INT8 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 1.2 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-Embedding-0.6B, un encoder transformer de ~0,6 mil millones de parametros, y se afina con la libreria sentence-transformers para la tarea de similitud de frases y recuperacion. Las consultas deben ir precedidas del prefijo de instruccion (`Instruct: Given a college student's search query, retrieve the College web page that answers it\nQuery: `); los fragmentos (chunks) se embeben como texto plano. La puntuacion de una pagina es la de su mejor fragmento. Las representaciones se normalizan, de modo que la similitud se calcula con producto escalar.

El entrenamiento usa datos sinteticos generados por Qwen3.8-27B sobre 5.923 fragmentos del sitio web publico y el catalogo del IRSC (crawl del 2026-10-22, 2.389 paginas). Para cada fragmento se generaron una pregunta completa, una busqueda de 2 a 5 palabras, la abreviatura o jerga correspondiente, una falta de ortografia y consultas de nombre de programa; a ello se anaden dos primeros mensajes por fragmento (uno conversacional de 8 a 30 palabras y una peticion indirecta de 3 a 10 palabras) para los 4.223 de 4.706 fragmentos que el modelo considero consultables. Un juez Qwen3-Reranker-0.6B descarto consultas que su propio fragmento no responde (1.410 de 30.501) y conservo negativos duros solo cuando no respondian a la consulta, dejando 27.852 consultas de entrenamiento (8.183 primeros mensajes). La funcion de perdida es InfoNCE (tau = 0,05) contra el fragmento correcto, hasta dos negativos duros y el resto del lote de 64 consultas, con enmascaramiento de candidatos in-batch que son otro fragmento de la pagina correcta, el mismo texto o que el modelo base puntua por encima del correcto (idea de GISTEmbed). Se realizo una epoca (435 pasos), lr 1e-5, bf16, en una RTX 4090 durante unos 50 minutos, seleccionando el mejor paso (400) por MRR@10 sobre paginas reservadas.

## Capacidades

- Generacion de embeddings de texto para recuperacion (retrieval) y similitud de frases.
- Recuperacion de paginas del sitio web y catalogo del Indian River State College a partir de consultas en lenguaje natural.
- Manejo de abreviaturas y jerga academica (por ejemplo, RN, rad tech, BSN).
- Manejo de errores ortograficos en las consultas.
- Manejo de primeros mensajes conversacionales que describen una situacion ("mi hijo esta en 11.o grado y quiere tomar clases universitarias, como funciona").
- Una sola pasada forward por consulta, sin generacion de tokens.
- No soporta tool calling, agentes ni razonamiento multi-paso: es exclusivamente un encoder de recuperacion.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Primera etapa de RAG en el asistente estudiantil RiverGuide: el modelo convierte la pregunta del estudiante en un vector y recupera las paginas candidatas antes de que un LLM generador redacte la respuesta, reduciendo el contexto necesario.
- Buscador interno del sitio del IRSC: indexar las 2.389 paginas del crawl y puntuar cada consulta por su mejor fragmento, de modo que el usuario reciba la pagina relevante en lugar de una lista de resultados por palabras clave.
- Atencion a futuros estudiantes y familias: gestionar consultas iniciales redactadas de forma coloquial ("como me inscribo para las clases de primavera si vuelvo despues de unos anos") que no nombran la oficina ni el tramite concreto.
- Resolucion de jerga y abreviaturas en consultas: mapear terminos como "rad tech" o "BSN" a la pagina de programa correspondiente, algo que un buscador BM25 resuelve peor (51/75 frente a 71/75 en el test de abreviaturas).
- Mantenimiento de un indice actualizable sin reentrenamiento: cuando cambia una tasa, una fecha o una politica, basta con reembeber las paginas modificadas; solo se reentrena si cambia el vocabulario institucional (nuevos programas o nombres).
- Despliegue en infraestructura modesta: al tener 0,6 mil millones de parametros, puede servirse en CPU o en una unica GPU consumer para un volumen de consultas moderado.
- Filtrado previo en pipelines de FAQ: descartar consultas sin pagina de respuesta antes de invocar un modelo generativo, ahorrando coste de inferencia.

## Benchmarks y rendimiento

Resultados publicados por el autor. La comparacion de "primeros mensajes reales" se realizo sobre 523 primeros mensajes distintos escritos por estudiantes en los 30 dias previos al 2026-10-25; para cada uno se juzgaron a ciegas las 5 mejores paginas de cada busqueda con Qwen3.8-27B.

| Busqueda sobre las palabras del estudiante | Respondidas |
|---|---|
| v1 (riverguide-retriever-full) | 447 (85,5 %) |
| v2 entrenado con primeros mensajes de Claude Sonnet 5.5 | 453 (86,6 %) |
| riverguide-retriever-v2 (este modelo) | 460 (88,0 %) |

Enfrentamiento directo sobre los mismos mensajes: este modelo respondio 22 que la v1 fallo, y la v1 respondio 9 que este fallo (test de signos exacto bilateral, p = 0,03). La mejora del gemelo entrenado con Sonnet sobre la v1 (15 frente a 9) no fue significativa (p = 0,31).

Pruebas fijas (pagina correcta en el top 5):

| Test | keyword (BM25) | stock 0.6B | v1 | este modelo |
|---|---|---|---|---|
| Abreviaturas | 51/75 | 65/75 | 73/75 | 71/75 |
| Golden | 18/21 | 19/21 | 19/21 | 19/21 |
| Val (paginas reservadas) | 631/942 | 757/942 | 909/942 | 905/942 |

El conjunto `val` reserva paginas completas, por lo que es la comparacion limpia: la v2 empata con la v1 (MRR@10 0,772 frente a 0,774). El autor advierte que el test de abreviaturas esta contaminado para ambos modelos porque sus consultas de entrenamiento incluyen las abreviaturas del test.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en bf16 (tamano del repo); en float32, alrededor de 2,4 GB.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; el autor entreno en una RTX 4090, pero la inferencia cabe en GPU consumer de gama baja.
- Cabe en GPU consumer: si, en practicamente cualquier GPU moderna (RTX 3060, RTX 4060, etc.) e incluso en CPU.
- En CPU se recomienda cargar en float32 (`model_kwargs={"dtype": torch.float32}`) para mayor velocidad.
- Opciones de despliegue: sentence-transformers (referencia), Text Embeddings Inference (el modelo esta marcado como `text-embeddings-inference` y `endpoints_compatible`), y cualquier stack que consuma embeddings safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| riverguide-retriever-v2 | 595.776.512 | no disponible | Retrieval especifico del IRSC (ingles) | apache-2.0 | HuggingFace |
| Qwen/Qwen3-Embedding-0.6B (base) | ~0,6 mil millones | no disponible | Embeddings generalistas multilingues | no disponible en la informacion | HuggingFace |
| riverguide-retriever-full (v1) | no disponible | no disponible | Retrieval del IRSC, consultas de estilo busqueda | no disponible en la informacion | HuggingFace |
| BM25 (linea base lexica) | no aplica | no aplica | Recuperacion por palabras clave | no aplica | Ampliamente disponible |

En los tests fijos, el modelo supera claramente a BM25 y al Qwen3-Embedding-0.6B sin afinar en el conjunto `val` (905/942 frente a 631/942 y 757/942), y empata con su version v1. Frente al modelo base sin afinar, la mejora se concentra en el dominio especifico del IRSC; fuera de ese dominio no hay datos publicados.

## Limitaciones y advertencias

- Dominio muy restringido: solo paginas del Indian River State College y consultas en ingles. Su rendimiento fuera de ese corpus no esta documentado.
- Solo ingles: el tag de idioma es `en`; no se garantiza calidad en castellano u otros idiomas.
- Las respuestas factuales viven en las paginas, no en el modelo: si cambian tasas, fechas o politicas, hay que reembeber las paginas; el modelo no contiene conocimiento actualizable por si mismo.
- Riesgo de alucinacion no aplica directamente (no genera texto), pero si puede recuperar paginas incorrectas o desactualizadas si el indice no se mantiene.
- La evaluacion principal se basa en una unica ejecucion con 523 mensajes reales y un juez (Qwen3.8-27B) que es el mismo modelo que genero los mensajes de entrenamiento de la v2, lo que puede favorecer a este modelo. El autor lo reconoce explicitamente.
- El test de abreviaturas esta contaminado para la v1 y la v2; los numeros no son comparables de forma limpia.
- La comparacion entre ejecuciones distintas no es fiable: la misma v1 obtuvo 458 en una ejecucion un dia antes sobre una ventana de 30 dias desplazada; deben compararse modelos dentro de la misma ejecucion.
- Licencia Apache 2.0 permite uso comercial, pero el modelo esta especializado en una institucion concreta; reutilizarlo en otro dominio requiere fine-tuning adicional.
- No soporta tool calling, agentes ni generacion: es exclusivamente un encoder de recuperacion de primera etapa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joeltcook/riverguide-retriever-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Version v1: https://huggingface.co/joeltcook/riverguide-retriever-full
- Repositorio del proyecto: https://github.com/joelcook/riverguide-retriever
- Asistente RiverGuide: https://chat.riverboard.org

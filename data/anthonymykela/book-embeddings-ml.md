# AnthonyMyKela/book-embeddings-ml

## Resumen

`AnthonyMyKela/book-embeddings-ml` es un Space de Hugging Face (titulo interno "BOOK Embeddings — Dialect", atribuido a "Jack of Shadows") que expone un servicio de embeddings multilingues para busqueda semantica sobre el registro code-switched del vault de Obsidian denominado BOOK: direcciones en espanol, romanji japones, vocabulario marcial filipino y base en ingles ("romanji spanglish"). El repositorio no publica pesos propios: sirve el modelo base `paraphrase-multilingual-MiniLM-L12-v2` mediante una aplicacion Gradio sobre Hugging Face ZeroGPU.

La decision tecnica central es no aplicar fine-tuning. Segun la model card, ajustar el modelo sobre el conjunto de pares (mayoritariamente en ingles) degradaba la recuperacion del registro dialectal, que paso de 7 a 5 en la "dialect slice". Por eso esta ruta conserva el base multilingue sin tocar, mientras que la ruta inglesa (`book-embeddings`, con `book-embedder-v1` ajustado) queda detras de `ask_router.py`.

Su relevancia es limitada y experimental: 0 descargas y 0 likes en el momento de la consulta, licencia e idiomas sin declarar en los metadatos y una fecha de creacion (2026-09-19) inconsistente con el calendario. Es un artefacto de investigacion personal orientado a un corpus concreto, no un modelo listo para produccion, y no se ofrece informacion sobre pesos, arquitectura propia ni ventana de contexto del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No especificada en la model card. El servicio carga el modelo base `paraphrase-multilingual-MiniLM-L12-v2` (encoder transformer MiniLM-L12) [1] |
| Parametros totales | No disponible en la model card. El modelo base referenciado tiene aproximadamente 118 M de parametros [1] |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card. El modelo base referenciado admite 128 tokens de secuencia maxima [1] |
| Tipos de cuantizacion | No disponible. El despliegue declarado es ZeroGPU, sin cuantizacion documentada |
| Idiomas soportados | No declarados en los metadatos. El caso de uso descrito cubre espanol, romanji japones, vocabulario marcial filipino e ingles |
| Licencia | No disponible |
| Formato de pesos | No disponible. El repositorio es un Space (`sdk: gradio`, `app_file: app.py`) y no distribuye checkpoints |
| Dimension de embedding | No disponible en la model card. 384 dimensiones en el modelo base referenciado [1] |

[1] Dato procedente de la documentacion publica del modelo base citado en la model card, no confirmado por los metadatos del repositorio.

## Arquitectura y entrenamiento

El repositorio no entrena ni publica un modelo propio. Es una capa de servicio: una app Gradio que carga el encoder multilingue `paraphrase-multilingual-MiniLM-L12-v2` y devuelve embeddings de frases o pasajes. La model card describe explicitamente una decision de no ajustar el modelo, justificada con una metrica interna: el fine-tuning sobre el conjunto de pares, mayoritariamente en ingles, hacia caer la puntuacion de la "dialect slice" de 7 a 5.

No se indica numero de tokens de entrenamiento, composicion del dataset, ni uso de RLHF, DPO u otras tecnicas de alineacion. La arquitectura de despliegue se apoya en Hugging Face ZeroGPU y se integra en un esquema de enrutado: `ask_router.py` decide entre esta ruta dialectal y el Space ingles `book-embeddings`, que sirve el modelo ajustado `book-embedder-v1`.

## Capacidades

- Generacion de embeddings de frases o pasajes para recuperacion semantica y similitud coseno; no genera texto.
- Recuperacion sobre registro code-switched con espanol, romanji japones, vocabulario marcial filipino e ingles.
- Indexado vectorial de un vault de notas (Obsidian) y busqueda por significado frente a busqueda por palabra clave.
- Enrutado bilingue dialectal/ingles mediante `ask_router.py`, con dos Spaces complementarios.
- Servicio desplegable como API Gradio sobre ZeroGPU.
- No se documentan tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento.

## Casos de uso

- Busqueda semantica sobre el vault BOOK: indexar las notas del vault y recuperar fragmentos relevantes para consultas formuladas en registro mixto espanol-romanji, un escenario donde un encoder solo-ingles fallaria.
- RAG con enrutado por idioma o registro: `ask_router.py` envia las consultas dialectales a esta ruta y las inglesas al Space `book-embeddings`, de modo que cada consulta usa el encoder con mejor comportamiento en su registro.
- Deduplicacion y agrupamiento de notas: calcular similitud entre pares de entradas para detectar contenido repetido o agrupar tematicamente notas escritas en idiomas distintos.
- Etiquetado y clasificacion de corpus: generar embeddings de cada nota como caracteristica de entrada para un clasificador ligero de temas o tipos de contenido.
- Recomendacion de notas relacionadas: construir un indice de vecinos cercanos y sugerir entradas afines mientras el usuario escribe, aprovechando que el encoder es de 118 M de parametros y la inferencia es barata [1].
- Construccion de conjuntos de evaluacion dialectales: el criterio "dialect slice" descrito en la model card puede reutilizarse como banco de pruebas para medir si un ajuste o un cambio de encoder degrada la recuperacion en registro mixto.
- Normalizacion de vocabulario multilingue en documentacion tecnica: mapear terminos en romanji o en filipino a sus equivalentes en ingles para construir glosarios o enlazar entradas equivalentes.

[1] Estimacion basada en el numero de parametros del modelo base, no en mediciones publicadas de este despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato cuantitativo aportado es interno y no comparable con estandares como MMLU, MTEB o BEIR: la model card indica que el ajuste fino reducia la puntuacion de la "dialect slice" de 7 a 5, motivo por el cual se mantiene el modelo base sin ajustar. No se especifica la escala de esa metrica, el tamano del conjunto de evaluacion ni su composicion.

## Requisitos de hardware

- VRAM estimada: no publicada. Para el modelo base referenciado (aproximadamente 118 M de parametros) el peso en fp32 ronda los 0,5 GB y en fp16 los 0,25 GB, mas el overhead del runtime de Python y Gradio; son estimaciones derivadas del numero de parametros, no mediciones de este despliegue.
- GPU documentada: Hugging Face ZeroGPU. No se especifica el modelo de GPU asignado en cada ejecucion.
- GPU consumer: por tamano, el encoder cabe holgadamente en cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4090) e incluso en CPU, aunque no hay confirmacion en la informacion disponible.
- Opciones de despliegue: la unica documentada es Gradio (`sdk: gradio`, version 5.0.0, `app_file: app.py`) sobre ZeroGPU. No se mencionan vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparativa orientativa frente a encoders multilingues de proposito general. Los datos de las alternativas proceden de su documentacion publica y no han sido verificados en este repositorio; la columna de este modelo refleja lo declarado en su model card.

| Modelo | Parametros | Dimension de embedding | Contexto maximo | Licencia | Enfoque |
|---|---|---|---|---|---|
| `book-embeddings-ml` (ruta dialectal) | No disponible (base de 118 M [1]) | No disponible (384 [1]) | No disponible (128 tokens [1]) | No disponible | Base multilingue sin ajustar, orientada a registro code-switched |
| `paraphrase-multilingual-MiniLM-L12-v2` | 118 M | 384 | 128 tokens | Apache-2.0 | Multilingue generalista, similitud de frases |
| `paraphrase-multilingual-mpnet-base-v2` | 278 M | 768 | 128 tokens | Apache-2.0 | Multilingue generalista de mayor capacidad |
| `intfloat/multilingual-e5-base` | 278 M | 768 | 512 tokens | MIT | Recuperacion multilingue con prefijos de tarea |
| `BAAI/bge-m3` | 568 M | 1024 | 8192 tokens | MIT | Recuperacion multilingue y multi-vector |

[1] Datos del modelo base referenciado en la model card.

## Limitaciones y advertencias

- Estado experimental: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Licencia no disponible: no se puede confirmar que el uso comercial este permitido. Es un riesgo legal directo para cualquier integracion en producto.
- Metadatos incompletos: `pipeline`, idiomas y licencia sin declarar; los tags se limitan a `region:us`.
- No es un modelo descargable: el repositorio es un Space de Gradio, por lo que no se pueden obtener pesos ni reutilizar el artefacto fuera de la infraestructura de espacios.
- Sesgo de corpus: el servicio esta disenado para el vocabulario y el registro concretos del vault BOOK (espanol, romanji japones, filipino marcial, ingles). Fuera de ese dominio el comportamiento no esta caracterizado.
- Degradacion por ajuste: la propia model card documenta que el fine-tuning sobre el conjunto de pares mayoritariamente ingles empeora la recuperacion dialectal (7 a 5), lo que sugiere que ampliar el corpus de ajuste sin datos dialectales suficientes perjudica la tarea objetivo.
- Dependencia de la ventana de contexto: el modelo base referenciado limita la secuencia a 128 tokens, lo que restringe el tamano de los fragmentos indexados y obliga a trocear documentos; este limite no se verifica en la model card.
- Dependencia de ZeroGPU: el despliegue declarado depende de la cuota de GPU de Hugging Face, lo que condiciona latencia y disponibilidad en cargas altas.
- Riesgo de recuperacion irrelevante: aunque un modelo de embeddings no "alucina" texto, un enrutado incorrecto entre la ruta dialectal y la inglesa puede devolver contexto poco pertinente y degradar la respuesta del sistema que consuma estos vectores.
- Metadatos temporales inconsistentes: la fecha de creacion y actualizacion indicada (2026-09-19) no se corresponde con el calendario habitual, lo que obliga a tratar la trazabilidad del artefacto con cautela.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AnthonyMyKela/book-embeddings-ml
- Modelo base citado en la model card: `paraphrase-multilingual-MiniLM-L12-v2` (libreria sentence-transformers); no se proporciona URL en la informacion disponible.
- Space complementario para la ruta inglesa: referenciado como `book-embeddings`, sirviendo el modelo ajustado `book-embedder-v1`; no se proporciona URL.
- Script de enrutado: referenciado como `ask_router.py`; no se proporciona URL ni repositorio.
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada.
- La busqueda web realizada no devolvio resultados relevantes para este modelo; los unicos enlaces recuperados corresponden a paginas corporativas de Microsoft (microsoft.com, account.microsoft.com, myaccount.microsoft.com, en.wikipedia.org/wiki/Microsoft).

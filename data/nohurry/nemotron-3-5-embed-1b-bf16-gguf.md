# nohurry/Nemotron-3.5-Embed-1B-BF16-GGUF

## Resumen

Nemotron-3.5-Embed-1B-BF16-GGUF es una distribucion en formato GGUF del modelo de embeddings Nemotron-3.5-Embed-1B, publicada por el usuario nohurry en Hugging Face. El nombre indica que se trata de un modelo de embeddings (representaciones vectoriales de texto) de aproximadamente 1.000 millones de parametros, derivado de la familia Nemotron de NVIDIA, convertido desde pesos BF16 al formato GGUF para su uso con motores de inferencia como llama.cpp u Ollama.

La informacion disponible en la model card es practicamente inexistente: solo incluye la declaracion de licencia (OpenMDW-1.1) y el enlace a dicha licencia. No se documentan la arquitectura, el contexto maximo, los idiomas soportados, los datos de entrenamiento ni los resultados de benchmarks. La ficha se completa por tanto con los datos estructurales del repositorio y con las convenciones habituales de los modelos de embeddings de este tamano, marcando explicitamente todo aquello que no esta confirmado.

El modelo es relevante para desarrolladores que necesiten ejecutar busquedas semanticas o sistemas RAG en local sin depender de APIs externas, dado que un encoder de 1B de parametros en GGUF puede desplegarse en hardware de consumo. No obstante, al carecer de documentacion tecnica publicada por el autor de la conversion, debe evaluarse con cautela antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre indica modelo de embeddings tipo encoder transformer) |
| Parametros totales | aproximadamente 1B (segun el nombre del repositorio) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 convertido a GGUF (segun el nombre del repositorio); no se detallan otros niveles Q4, Q5, Q8 |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (openmdw.ai/license/1-1/) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna en la model card del repositorio. Por el nombre del modelo y por las convenciones de la familia Nemotron de NVIDIA, se trata de un modelo de embeddings, es decir, un transformer encoder que produce vectores densos a partir de texto de entrada, pero no hay confirmacion documental de la configuracion de capas, dimension del embedding, atencion utilizada ni funcion de pooling.

Tampoco se documentan los datos de entrenamiento: numero de tokens, composicion del corpus, uso de pares positivos/negativos para entrenamiento contrastivo, ni si se aplicaron tecnicas de destilacion o ajuste fino supervisado. Toda esta seccion queda por tanto como no disponible y no debe inferirse a partir del nombre comercial.

## Capacidades

- Generacion de embeddings de texto para busqueda semantica y similitud vectorial (capacidad implicita en la denominacion "Embed" del modelo).
- Recuperacion de informacion y construccion de indices vectoriales para sistemas RAG.
- Clustering y deduplicacion de documentos mediante distancia coseno o producto escalar.
- Clasificacion de texto mediante embeddings seguidos de cabezales ligeros.
- No se documenta soporte de tool calling, agentes, vision, audio ni modo thinking; al ser un modelo de embeddings, estas capacidades no aplican.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Busqueda semantica en documentacion interna: indexar manuales tecnicos y permitir consultas en lenguaje natural recuperando fragmentos por similitud vectorial, aprovechando que el modelo puede ejecutarse en local en formato GGUF.
- Pipeline RAG sobre base de conocimiento corporativa: generar embeddings de los fragmentos y del query para alimentar un LLM generador, evitando enviar datos sensibles a APIs externas.
- Deduplicacion de grandes volumenes de texto: calcular embeddings de registros y agrupar por umbral de similitud para eliminar duplicados en datasets de entrenamiento o catalogos de productos.
- Moderacion y filtrado por similitud: comparar mensajes entrantes contra un conjunto de referencia de casos problematicos mediante distancia en el espacio de embeddings.
- Sistemas de recomendacion de contenido: representar articulos o items y calcular vecinos mas cercanos para sugerir contenido relacionado.
- Clasificacion zero-shot ligera: usar los embeddings como caracteristicas de entrada a un clasificador lineal entrenado con pocos ejemplos, util cuando no se dispone de un modelo generativo desplegado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: un modelo de aproximadamente 1B de parametros en BF16 requiere en torno a 2 GB de pesos; en GGUF con cuantizacion de 8 bits baja a aproximadamente 1 GB y en 4 bits a unos 0,6 GB, aunque estos valores son estimaciones teoricas y no estan confirmados en la model card.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM deberia poder cargar los pesos en BF16; para lotes grandes se recomienda A100, H100 o RTX 4090.
- GPU de consumo: si, cabe en tarjetas consumer como RTX 3060, RTX 4060, RTX 4070 o superiores, asi como en Apple Silicon con memoria unificada.
- Opciones de despliegue: llama.cpp y Ollama son los motores compatibles con GGUF; vLLM y TGI no son la via natural para este formato salvo conversion previa a safetensors.
- Latencia y throughput: no disponibles; al ser un encoder de 1B, el throughput por lote depende en gran medida del hardware y del tamano del lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5-Embed-1B (esta conversion) | ~1B | no disponible | OpenMDW-1.1 | GGUF | Hugging Face (nohurry) |
| BGE-M3 | ~568M | 8192 tokens | MIT | safetensors, GGUF | Hugging Face (BAAI) |
| E5-large-v2 | ~335M | 512 tokens | MIT | safetensors | Hugging Face (intfloat) |
| GTE-large | ~335M | 8192 tokens | Apache 2.0 | safetensors | Hugging Face (Alibaba-NLP) |

La comparativa se ofrece como referencia de categoria; no se dispone de datos de rendimiento del modelo evaluado para establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- La model card no documenta arquitectura, contexto, idiomas ni datos de entrenamiento, lo que impide validar su comportamiento antes de desplegarlo.
- Al ser una conversion de terceros (usuario nohurry) y no una publicacion oficial de NVIDIA, no hay garantia de que la conversion a GGUF preserve fielmente el comportamiento del modelo original en BF16.
- Riesgo de alucinacion: no aplica en sentido generativo, pero si puede producir embeddings de baja calidad en dominios o idiomas no cubiertos por su entrenamiento, lo que degrada la recuperacion en RAG.
- Sin informacion sobre sesgos: no se puede evaluar el sesgo de genero, raza o idioma en el espacio de embeddings.
- Licencia OpenMDW-1.1: es una licencia de pesos abiertos con terminos especificos que deben revisarse antes de uso comercial; no equivale a Apache 2.0 ni MIT.
- El repositorio no registra descargas ni likes, lo que sugiere que la conversion no ha sido validada por la comunidad.
- No se especifican los niveles de cuantizacion incluidos ni si el archivo GGUF es compatible con todas las versiones de llama.cpp.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nohurry/Nemotron-3.5-Embed-1B-BF16-GGUF
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/

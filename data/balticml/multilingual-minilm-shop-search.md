# balticml/multilingual-minilm-shop-search

## Resumen

`multilingual-minilm-shop-search` es un modelo de embeddings de frases (feature-extraction) desarrollado por Baltic ML, un perfil de Hugging Face centrado en modelos pequenos afinados y NLP multilingue. Parte de `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` y se ha afinado sobre el catalogo de una unica tienda: 3.529 productos de un mayorista de regalos del Reino Unido. El objetivo es resolver la busqueda semantica en comercio electronico: dada una consulta de comprador y un nombre de producto, el modelo produce vectores cuyo producto escalar mide la relevancia entre ambos.

La arquitectura subyacente es un transformer BERT de tipo MiniLM-L12, con 384 dimensiones de salida y pooling de media con normalizacion integrados en el grafo ONNX. La distribucion esta pensada para ejecucion en navegador mediante transformers.js: pesos cuantizados a int8 solo de pesos (46,7 MB) y un tokenizador podado a 63.536 piezas restringido a los alfabetos latino, griego y cirilico (2,5 MB). El modelo cubre cinco idiomas (ingles, polaco, aleman, frances y espanol) y se publica con licencia Apache 2.0.

Su relevancia actual es practica: demuestra que un fine-tuning pequeno y especifico de dominio sobre un modelo de embeddings de 118 millones de parametros puede superar ampliamente a la busqueda por palabras clave en un catalogo real, y que el resultado cabe en el navegador sin servidor de inferencia. Es, por tanto, una referencia util para quien quiera replicar el patron (generacion sintetica de consultas, entrenamiento contrastivo, exportacion ONNX int8) en su propio catalogo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer BERT tipo MiniLM-L12 (encoder de 12 capas) |
| Parametros totales | no disponible (modelo base MiniLM-L12, ~118 M en la version estandar) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 solo de pesos (weight-only int8) en la exportacion ONNX |
| Idiomas soportados | en, pl, de, fr, es |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (exportado para transformers.js) |
| Dimension del embedding | 384 (vector unitario, normalizado en el grafo) |
| Tamano del artefacto | 46,7 MB (pesos) + 2,5 MB (tokenizador) |
| Vocabulario | 63.536 piezas (latino, griego y cirilico) |
| Modelo base | sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia MiniLM (12 capas, variante L12 del modelo multilingue de sentence-transformers), orientado a producir embeddings de frase. La exportacion a ONNX incorpora dentro del grafo el pooling de media y la normalizacion, de modo que la salida `sentence_embedding` es directamente un vector unitario de 384 valores listo para comparar por producto escalar. No requiere prefijos de tarea: consultas y nombres de producto se introducen tal cual.

El entrenamiento se hizo por aprendizaje contrastivo con negativos in-batch sobre los nombres de producto del catalogo. Como no habia registros de busqueda reales, un LLM local (gpt-oss-20b) genero siete consultas por producto a partir de su nombre: el producto en otras palabras, para que sirve, una ocasion adecuada y una consulta en cada uno de polaco, aleman, frances y espanol. Se conservaron 24.280 consultas, descartando las que copiaban literalmente el nombre. La ejecucion y la epoca (8 de 12) se seleccionaron sobre las consultas de una decima parte de los nombres, reservada como conjunto de validacion. El catalogo de origen es UCI Online Retail II (CC BY 4.0). El tokenizador se podo eliminando el vocabulario fuera de los alfabetos latino, griego y cirilico.

## Capacidades

- Generacion de embeddings de frase de 384 dimensiones, normalizados, para busqueda semantica y similitud entre consulta y producto.
- Recuperacion semantica multilingue en ingles, polaco, aleman, frances y espanol, con consultas y nombres de producto en el mismo espacio vectorial.
- Busqueda cross-lingue: una consulta en un idioma puede recuperar productos con nombre en otro de los cinco soportados.
- Ejecucion en navegador mediante transformers.js y ONNX Runtime Web, sin backend de inferencia.
- Comparacion por producto escalar entre vectores unitarios (equivalente a similitud coseno).
- No soporta tool calling, function calling, agentes, generacion de texto, vision ni audio: es exclusivamente un modelo de extraccion de caracteristicas.

## Casos de uso

- Busqueda semantica en tienda online: indexar los embeddings de los nombres de producto y, en cada consulta, codificar el texto del comprador y recuperar los vecinos mas cercanos; adecuado porque el modelo se entreno precisamente para puntuar la relevancia consulta-producto sobre nombres cortos.
- Busqueda en navegador sin servidor: al pesar 46,7 MB en int8 y ejecutarse con transformers.js, permite busqueda semantica local en una web estatica o PWA, evitando costes de inferencia y latencia de red.
- Atencion al cliente y asistentes de compra: integrar el ranking de productos en un chatbot o en un buscador conversacional para sugerir articulos relevantes a partir de descripciones coloquiales ("regalo para alguien a quien le gusta la reposteria").
- Catalogos multilingues en Europa: un comercio con fichas en ingles y clientes que consultan en polaco, aleman, frances o espanol puede usar un unico indice vectorial para todos los idiomas.
- Deduplicacion y agrupacion de productos: usar la similitud entre embeddings de nombres para detectar fichas duplicadas o casi duplicadas y agrupar variantes de un mismo articulo.
- Recomendacion por similitud de item: calcular vecinos de un producto en el espacio de embeddings para mostrar "articulos relacionados" sin depender de historial de compras.
- Prototipado rapido de un buscador de dominio especifico: sirve como punto de partida para reentrenar con el catalogo propio siguiendo el mismo pipeline (consultas sinteticas con un LLM, contraste in-batch, exportacion ONNX int8).

## Benchmarks y rendimiento

Resultados publicados en la model card: 80 consultas cotidianas juzgadas a mano, cada una en cinco idiomas; hit@10 es la proporcion de consultas con al menos un producto relevante entre los diez primeros. El autor advierte que las consultas de prueba y sus juicios provienen de la misma persona que redacto el prompt de las consultas de entrenamiento, por lo que son cotas superiores.

| Modelo | en | pl | de | fr | es |
|---|---|---|---|---|---|
| Este modelo, exportacion int8 tal como se ejecuta en navegador | 96,2 | 87,5 | 81,2 | 88,8 | 86,2 |
| paraphrase-multilingual-MiniLM-L12-v2 original (PyTorch) | 88,8 | 76,2 | 72,5 | 76,2 | 71,2 |
| Busqueda por palabras clave (BM25 sobre nombres de producto) | 81,2 | 7,5 | 3,8 | 21,2 | 10,0 |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible; no aplican a un modelo de embeddings.

## Requisitos de hardware

- Inferencia en navegador: sin GPU dedicada; el modelo int8 de 46,7 MB se ejecuta en CPU mediante ONNX Runtime Web / WebAssembly, y puede acelerarse con WebGPU si el navegador lo soporta.
- VRAM estimada en servidor: inferior a 1 GB en int8; el modelo completo en fp32 ronda los 470 MB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) es mas que suficiente; tambien funciona en CPU sin problema por su tamano.
- Cabe en cualquier GPU consumer e incluso en dispositivos moviles con navegador moderno.
- Opciones de despliegue: transformers.js (objetivo principal), ONNX Runtime (Web, CPU o GPU), y conversion a otros runtimes si se reexporta; al ser un encoder estandar tambien puede servirse con sentence-transformers o con frameworks de embeddings como vLLM o TGI si se convierte el formato.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia de milisegundos por lote pequeno en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| multilingual-minilm-shop-search | ~118 M (base MiniLM-L12) | no disponible | en, pl, de, fr, es | Apache 2.0 | ONNX int8 | Afinado a un catalogo concreto; hit@10 de 81,2-96,2 segun idioma |
| paraphrase-multilingual-MiniLM-L12-v2 | ~118 M | no disponible | multilingue amplio | Apache 2.0 | safetensors / PyTorch | Modelo base generico; hit@10 de 71,2-88,8 en el mismo test |
| BM25 sobre nombres de producto | no aplica (lexico) | no aplica | depende del idioma | no aplica | no aplica | Baseline lexico; hit@10 de 3,8-81,2, muy dependiente del idioma |

No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Afinado a un unico catalogo de nombres de producto cortos en ingles (mayorista de regalos del Reino Unido): para otra tienda es un punto de partida, no un modelo terminado.
- Solo se han medido cinco idiomas; el rendimiento fuera de ellos no esta caracterizado.
- El vocabulario fuera de los alfabetos latino, griego y cirilico se elimino del tokenizador y cae en tokens desconocidos, lo que degrada la codificacion de textos en otros sistemas de escritura.
- Las consultas de entrenamiento son sinteticas (generadas por gpt-oss-20b), no provienen de registros de busqueda reales, por lo que pueden no reflejar la distribucion real de consultas de los usuarios.
- Los resultados de benchmark son cotas superiores: las consultas de prueba y sus juicios los elaboro la misma persona que definio el prompt de las consultas de entrenamiento.
- Riesgo de alucinacion no aplica en el sentido generativo (no produce texto), pero si puede devolver productos poco relevantes en dominios alejados del catalogo de entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del catalogo de origen (UCI Online Retail II, CC BY 4.0) si se redistribuyen datos derivados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: es un modelo reciente y poco validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/balticml/multilingual-minilm-shop-search
- Perfil del autor: https://huggingface.co/balticml
- Modelos del autor: https://huggingface.co/balticml/models
- Demo de busqueda semantica: https://balticml.eu/demos/semantic-search/
- Codigo, datos y benchmark: https://github.com/balticml/semantic-search
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- Dataset de origen (UCI Online Retail II): https://archive.ics.uci.edu/dataset/502/online+retail+ii

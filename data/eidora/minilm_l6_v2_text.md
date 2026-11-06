# EIDORA/MiniLM_L6_v2_Text

## Resumen

MiniLM_L6_v2_Text es un paquete de embeddings de frases distribuido por EIDORA a partir del checkpoint original `sentence-transformers/all-MiniLM-L6-v2`. No se trata de un modelo generativo, sino de un encoder de texto que convierte oraciones en vectores densos de 384 dimensiones, normalizados en L2 y pensados para compararse mediante similitud coseno. EIDORA publica el modelo en formato ONNX con su tokenizador empaquetado y un esquema de preprocesado versionado (schema v3), orientado a su entorno de escritorio y a su model zoo.

La relevancia de este paquete es practica: ofrece un encoder compacto (seis capas, repositorio de aproximadamente 0,1 GB) listo para ejecutarse en CPU mediante ONNX Runtime, sin necesidad de framework de deep learning completo. Resulta util para busqueda semantica ligera, deduplicacion de textos, clustering de pasajes y sistemas de recuperacion en entornos con recursos limitados.

La limitacion estructural mas importante es la ventana de 256 tokens: todo texto mas largo se trunca en el lado derecho, por lo que para documentos extensos es necesario fragmentar la entrada. El modelo hereda el entrenamiento y las caracteristicas del checkpoint original de Sentence Transformers, con atribucion a sus autores y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MiniLM de 6 capas con mean pooling a nivel de frase |
| Parametros totales | no disponible (el paquete no declara el recuento; el checkpoint base MiniLM-L6 es de aproximadamente 22,7 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (padding y truncamiento por la derecha) |
| Tipos de cuantizacion | no disponible (se distribuye un `model.onnx` en float32; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`) con tokenizador empaquetado en `tokenizer/` y configuracion en `config.yaml` |
| Dimension de embedding | 384, normalizado L2, similitud coseno |
| Version del paquete | 1.0.0, schema 3 |
| Provider declarado | CPUExecutionProvider |

## Arquitectura y entrenamiento

El modelo es un encoder Transformer MiniLM de seis capas que aplica mean pooling a nivel de frase sobre las representaciones de los tokens, respetando la attention mask, y normaliza el vector resultante en L2. La entrada se prepara anadiendo los tokens especiales del modelo, con padding y truncamiento por la derecha hasta 256 tokens, y se alimenta a ONNX como tensores `input_ids` y `attention_mask` de forma `[batch, 256]` y tipo `int64`. La salida es un tensor `float32` de forma `[batch, 384]`.

El entrenamiento no lo realiza EIDORA: el paquete deriva del checkpoint `sentence-transformers/all-MiniLM-L6-v2`, fijado en la revision `1110a243fdf4706b3f48f1d95db1a4f5529b4d41`. Segun la model card, los datos y el metodo de entrenamiento son los descritos en la model card upstream de Sentence Transformers, es decir, entrenamiento con pares de frases segun el enfoque Sentence-BERT (Reimers y Gurevych, EMNLP-IJCNLP 2019). No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO, algo por otra parte poco habitual en encoders de similitud. La innovacion aportada por EIDORA es el empaquetado: conversion a ONNX, tokenizador incluido, contrato de preprocesado declarativo en `config.yaml` y esquema de entrada versionado.

## Capacidades

- Generacion de embeddings de frases: convierte texto UTF-8 en vectores de 384 dimensiones normalizados en L2.
- Similitud semantica: comparacion de pares de frases mediante producto escalar o similitud coseno.
- Busqueda y recuperacion: indexacion vectorial de pasajes cortos para recuperacion semantica.
- Clustering y exploracion: agrupamiento de pasajes relacionados por proximidad en el espacio de embeddings.
- Deduplicacion y near-duplicate detection sobre textos de hasta 256 tokens.
- Ejecucion en CPU mediante ONNX Runtime con `CPUExecutionProvider`, sin GPU obligatoria.
- Procesamiento por lotes: la interfaz admite tensores de forma `[batch, 256]`.
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso, vision ni audio.
- Capacidades multilingues: no declaradas en la informacion disponible.

## Casos de uso

- Busqueda semantica en documentacion interna: indexar fragmentos de manuales o articulos de hasta 256 tokens, generar sus embeddings y recuperar los pasajes mas cercanos a la consulta del usuario mediante similitud coseno. El tamano reducido del modelo permite mantener el indice y el encoder en el mismo servidor de CPU.
- Deduplicacion de tickets de soporte: calcular embeddings de asuntos y primeras lineas de cada ticket, agrupar por umbral de similitud y fusionar incidencias repetidas antes de asignarlas a agentes.
- Clustering de feedback de usuarios: procesar encuestas y resenas cortas, agrupar los vectores con k-means o HDBSCAN y etiquetar manualmente los clusters resultantes para priorizar mejoras de producto.
- Filtro de pre-recuperacion en pipelines RAG: usar el encoder como primera etapa barata que descarta pasajes irrelevantes antes de un reranker mas costoso, reduciendo el numero de candidatos enviados al modelo generativo.
- Moderacion y triaje de contenido: comparar mensajes entrantes contra un conjunto de ejemplos etiquetados (spam, abuso, consultas legitimas) y derivar los casos cercanos a revision humana.
- Deteccion de duplicados en catalogos: comparar titulos y descripciones cortas de productos para detectar fichas repetidas o casi identicas antes de la publicacion.
- Clasificacion ligera por prototipos: construir un clasificador de intenciones calculando el centroide de embeddings por clase y asignando cada nueva frase a la clase mas cercana, sin entrenamiento adicional.
- Ejecucion en escritorio o edge: al distribuirse en ONNX con provider de CPU, puede integrarse en aplicaciones locales de busqueda de notas o ficheros sin dependencia de servicios en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MTEB, STS ni de recuperacion, y no se dispone de cifras de latencia o throughput declaradas por el autor.

## Requisitos de hardware

- VRAM estimada: no aplica en la configuracion declarada; el paquete declara `CPUExecutionProvider` y esta pensado para ejecucion en CPU.
- Memoria RAM: el repositorio ocupa aproximadamente 0,1 GB, por lo que la huella en memoria del grafo ONNX y del tokenizador es muy reducida; no se especifica una cifra exacta.
- GPU recomendadas: no disponibles ni necesarias para el provider declarado; podria ejecutarse en GPU si el entorno ONNX Runtime instalado expone otro execution provider, pero la model card no lo garantiza.
- Compatibilidad con GPU de consumo: irrelevante para el caso de uso previsto; el modelo cabe holgadamente en cualquier equipo por su tamano.
- Opciones de despliegue: ONNX Runtime (provider declarado), y de forma indirecta cualquier runtime compatible con ONNX como parte de pipelines propios; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Requisito de integracion: el contrato de entrada lo define `config.yaml`, que es la fuente autoritativa para formas de grafo, preprocesado, provider y dimension de embedding.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension de embedding | Formato | Licencia | Notas |
|---|---|---|---|---|---|---|
| EIDORA/MiniLM_L6_v2_Text | no disponible (deriva de MiniLM-L6) | 256 tokens | 384 | ONNX | Apache 2.0 | Paquete ONNX con tokenizador y schema v3; provider CPU |
| sentence-transformers/all-MiniLM-L6-v2 | no disponible en la informacion | no disponible en la informacion | 384 | safetensors/PyTorch (formato upstream, no confirmado aqui) | Apache 2.0 | Checkpoint original del que deriva este paquete |
| Otros encoders de frases de la misma familia | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

La comparacion cuantitativa con alternativas como MPNet, BGE-small o E5-small no puede realizarse con rigor porque la informacion proporcionada no incluye sus especificaciones ni resultados de benchmarks de este paquete.

## Limitaciones y advertencias

- Truncamiento a 256 tokens: cualquier texto mas largo se recorta por la derecha; es imprescindible fragmentar documentos y decidir una estrategia de agregacion de embeddings.
- La similitud coseno mide proximidad en el espacio de embeddings, no veracidad ni correccion factual; no debe usarse como verificador de hechos.
- La distribucion de entrenamiento del checkpoint original puede diferir de dominios especializados (legal, medico, codigo), lo que degrada la calidad de la recuperacion.
- No se declara la lista de idiomas soportados; el rendimiento fuera del ingles no esta documentado en esta ficha.
- No es un modelo generativo: no responde preguntas ni produce texto, solo vectores.
- El paquete declara unicamente `CPUExecutionProvider`; el uso en GPU depende de la instalacion de ONNX Runtime y del entorno EIDORA Desktop, y no esta garantizado.
- `config.yaml` es el contrato autoritativo: modificarlo o ignorarlo puede romper la compatibilidad de formas y preprocesado.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion; debe conservarse el aviso de licencia y el credito a los contribuidores de Sentence Transformers.
- El modelo tiene un numero muy bajo de descargas y ninguna valoracion en el momento de la consulta, por lo que su validacion en produccion corre por cuenta del integrador.
- No hay benchmarks publicados que permitan estimar la perdida de calidad frente al checkpoint original tras la conversion a ONNX.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/EIDORA/MiniLM_L6_v2_Text
- Checkpoint base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Revision fijada del checkpoint base: `1110a243fdf4706b3f48f1d95db1a4f5529b4d41`
- Paper Sentence-BERT: https://aclanthology.org/D19-1410/
- Repositorio de Sentence Transformers: no disponible en la informacion proporcionada
- Documentacion de ONNX Runtime: no disponible en la informacion proporcionada

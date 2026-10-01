# api-service-sac/granite-embedding-97m-multilingual-r2-onnx

## Resumen

Este repositorio contiene una exportacion a ONNX del modelo de embeddings `ibm-granite/granite-embedding-97m-multilingual-r2`, desarrollado originalmente por IBM. La conversion la ha publicado el usuario `api-service-sac` y esta empaquetada especificamente para s1grep, una herramienta de busqueda sobre repositorios de codigo. Se trata, por tanto, de un artefacto derivado: los pesos no se han modificado y todo el merito del modelo subyacente corresponde a IBM.

El modelo base es un encoder de 97 millones de parametros orientado a generar representaciones vectoriales densas de texto, con soporte multilingue. La exportacion mantiene el grafo en FP32 con ejes dinamicos de batch y secuencia, y devuelve `last_hidden_state`. Segun la model card, la paridad con sentence-transformers es de una similitud coseno igual o superior a 0,999 en las pruebas del propio autor.

Su relevancia practica es acotada pero clara: permite ejecutar un retriever pequeno y rapido sobre ONNX Runtime sin depender del stack de PyTorch, con la ventana de 512 tokens y el esquema de pooling (CLS + normalizacion L2) definidos en `embedder_config.json`. Resulta util como primera pasada de indexado sobre corpus grandes antes de aplicar un retriever de mayor tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (modelo base de IBM; detalles no especificados en la informacion disponible) |
| Parametros totales | 97 millones (segun denominacion del modelo base) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | FP32 (unica variante publicada en este repositorio) |
| Idiomas soportados | multilingue segun el modelo base; lista concreta no disponible |
| Licencia | Apache 2.0 (copyright IBM) |
| Formato de pesos | ONNX (`model.onnx`), mas `tokenizer.json` y `embedder_config.json` |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: es una exportacion del encoder de IBM `granite-embedding-97m-multilingual-r2`. El grafo ONNX conserva los pesos originales y expone ejes dinamicos de batch y secuencia, con salida `last_hidden_state`. No se aporta informacion sobre la composicion del dataset de entrenamiento, el numero de tokens, ni si hubo fases de RLHF o DPO, por lo que esos datos deben consultarse en la model card del modelo base.

La innovacion tecnica relevante esta en el empaquetado: `embedder_config.json` describe como transformar la salida del grafo en un vector util (pooling sobre el token CLS y normalizacion L2), de modo que el resultado sea equivalente a sentence-transformers. El autor declara una similitud coseno de 0,999 o superior en sus pruebas de paridad. Tambien se incluye el tokenizer original en formato `tokenizer.json`.

## Capacidades

- Generacion de embeddings de texto para busqueda semantica, similitud y clustering (pipeline `feature-extraction`).
- Extraccion de representaciones a nivel de documento o fragmento mediante pooling CLS y normalizacion L2, segun la configuracion incluida.
- Procesamiento multilingue, heredado del modelo base; no se detalla la lista de idiomas.
- Inferencia sobre ONNX Runtime con ejes de batch y secuencia dinamicos.
- Uso como primera pasada de rastreo rapido en s1grep, embebiendo el esquema de cada funcion (ruta, nombre y primeras lineas) mientras se indexa el codigo completo.
- No es un modelo generativo: no soporta tool calling, agentes, razonamiento multi-paso, vision ni audio.

## Casos de uso

- Primera pasada de busqueda en repositorios grandes: s1grep embebe el esquema de cada funcion para poder rastrear todo el repositorio en minutos, mientras el indice completo de fuentes se sigue construyendo con un retriever mayor.
- Busqueda semantica sobre documentacion tecnica: indexar manuales y guias en una base vectorial usando ONNX Runtime, sin necesidad de PyTorch en produccion.
- Deduplicacion de fragmentos y deteccion de contenido repetido mediante similitud coseno entre embeddings normalizados.
- Clustering y etiquetado de tickets o consultas de soporte en varios idiomas, aprovechando el caracter multilingue del modelo base.
- Clasificacion ligera por similitud (few-shot) cuando no se dispone de datos etiquetados suficientes para entrenar un clasificador.
- Filtrado previo en pipelines RAG: descartar candidatos poco relevantes con un modelo de 97M antes de invocar un re-ranker o un LLM costoso.
- Despliegue en entornos con CPU exclusivamente o con GPU de gama baja, gracias al reducido tamano del modelo y al formato ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica aportada por el autor es la paridad con sentence-transformers, con una similitud coseno igual o superior a 0,999 en sus pruebas internas.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,4 GB para los pesos en FP32 (el repositorio ocupa 0,4 GB); con overhead de runtime, del orden de 0,5 a 1 GB.
- GPU recomendadas: cualquier GPU con mas de 1 GB de memoria; el modelo es funcionalmente viable en A100, H100, RTX 4090 o incluso GPUs integradas.
- compatible con tarjetas consumer: si, cualquier GPU de consumo actual e incluso modelos muy antiguos. Tambien funciona en CPU.
- Opciones de despliegue: ONNX Runtime como via principal; s1grep como consumidor empaquetado; el modelo base puede ejecutarse con sentence-transformers si se necesita el stack de PyTorch.
- Latencia y throughput: no disponibles. El autor afirma que la primera pasada es "varias veces mas rapida" que la del retriever de mayor tamano, sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| api-service-sac/granite-embedding-97m-multilingual-r2-onnx | 97M | 512 tokens | ONNX (FP32) | Apache 2.0 | HuggingFace |
| ibm-granite/granite-embedding-97m-multilingual-r2 (modelo base) | 97M | 512 tokens | safetensors (segun modelo base) | Apache 2.0 | HuggingFace |
| Alternativas de embeddings multilingues de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion mas directa es con el propio modelo base, del que esta exportacion hereda pesos y arquitectura. Para alternativas externas (por ejemplo, familias tipo multilingual-e5 o bge) no se dispone de datos verificados en la informacion proporcionada.

## Limitaciones y advertencias

- Artefacto derivado: no es un modelo entrenado por el autor del repositorio, sino una conversion. Cualquier limitacion del modelo base se traslada intacta.
- No es un modelo generativo, por lo que la nocion de alucinacion no aplica; los riesgos se centran en embeddings de baja calidad o mal normalizados.
- La ventana de contexto esta limitada a 512 tokens; fragmentos mas largos deben dividirse antes de la codificacion.
- Es imprescindible aplicar CLS pooling y normalizacion L2 tal como indica `embedder_config.json`; usar la salida `last_hidden_state` sin post-procesado produce vectores incorrectos.
- Solo se publica la variante FP32; no hay versiones cuantizadas (INT8, etc.) en este repositorio.
- El repositorio no declara la lista concreta de idiomas soportados, solo la naturaleza multilingue del modelo base.
- Adopcion practicamente nula en HuggingFace (0 descargas, 0 likes), por lo que no cuenta con validacion de la comunidad.
- Licencia Apache 2.0: permite uso comercial, pero el copyright del modelo subyacente es de IBM y conviene respetar la atribucion.
- El empaquetado esta orientado a s1grep (tag `s1grep`), lo que puede implicar convenciones propias en la configuracion del embedder.
- No se dispone de datos de benchmarks independientes que confirmen el rendimiento en tareas de retrieval mas alla de la prueba de paridad del autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/api-service-sac/granite-embedding-97m-multilingual-r2-onnx
- Modelo base: https://huggingface.co/ibm-granite/granite-embedding-97m-multilingual-r2
- Repositorio s1grep: https://github.com/apiservicesac/s1grep
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada.

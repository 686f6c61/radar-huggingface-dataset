# ProtikD1810/hades-embed-v1-GGUF

## Resumen

HADES-Embed-700M-v1-GGUF es la distribucion en formato GGUF del modelo de embeddings `ProtikD1810/hades-embed-v1`, publicado por el desarrollador independiente Protik Das (ProtikD1810). Se trata de un modelo de extraccion de caracteristicas (feature-extraction) orientado a similitud semantica de frases y recuperacion de informacion, empaquetado para su uso con llama.cpp y Ollama. El repositorio contiene unicamente dos ficheros cuantizados (Q8_0 y F16) derivados del modelo base en precision completa.

El modelo cuenta con 702.791.680 parametros (aproximadamente 700 M), lo que lo situa en la gama de embeddings de tamano medio, comparable a familias como BGE-large o E5-large en orden de magnitud, aunque sin datos publicados de rendimiento que permitan situarlo con precision. La licencia es Apache 2.0, lo que facilita su adopcion tanto en entornos de investigacion como comerciales.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de embeddings de ~700 M en hardware de consumo y en entornos edge mediante cuantizacion de 8 bits, con un fichero de tan solo 753 MB. No obstante, el repositorio es muy reciente, no tiene descargas ni valoraciones, y no incluye resultados de benchmarks ni documentacion sobre el entrenamiento, por lo que su evaluacion debe hacerse de forma empirica antes de adoptarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de embeddings tipo transformer; detalles no publicados) |
| Parametros totales | 702.791.680 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (8 bits), F16 (16 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp / Ollama); modelo base en formato original no especificado |

## Arquitectura y entrenamiento

No se dispone de informacion publicada sobre la arquitectura interna del modelo base `ProtikD1810/hades-embed-v1`. Por la nomenclatura y el pipeline declarado (feature-extraction, sentence-similarity), se trata de un modelo encoder disenado para producir representaciones vectoriales de texto, presumiblemente con pooling sobre las activaciones del ultimo nivel. El tag `mteb` sugiere que el autor lo evalua o pretende evaluarlo con el benchmark MTEB, pero no se han publicado resultados.

Tampoco hay datos sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de tecnicas de contraste (por ejemplo, InfoNCE con pares positivos y negativos duros) ni sobre ajuste fino con instrucciones. El unico indicio indirecto es la existencia de un dataset asociado en el perfil del autor, `ProtikD1810/hades-m0-350m-training` (545k registros), que parece corresponder a un modelo distinto de 350 M, no al de 700 M. La model card del repositorio GGUF no documenta innovaciones tecnicas adicionales; se limita a describir las cuantizaciones y el uso con llama.cpp y Ollama.

## Capacidades

- Generacion de embeddings de texto para similitud semantica (sentence-similarity) y recuperacion de informacion.
- Extraccion de caracteristicas (feature-extraction) mediante `llama-embedding` con normalizacion L2 (`--embd-normalize 2`).
- Soporte de prefijos de instruccion en las entradas, segun el ejemplo de la model card (`Instruct: ... Query: ...`), lo que sugiere un formato de prompt orientado a tareas de retrieval.
- Uso como backend de busqueda semantica y RAG mediante llama.cpp u Ollama.
- Capacidad multilingue: no disponible (no se declaran idiomas).
- Tool calling, agentes, vision, audio o modo de razonamiento: no disponibles; el modelo es exclusivamente de embeddings.

## Casos de uso

- Busqueda semantica en documentacion tecnica: indexar fragmentos de manuales o articulos y recuperar los mas relevantes para una consulta en lenguaje natural, usando la cuantizacion Q8_0 para mantener la precision casi intacta con 753 MB de peso.
- RAG (generacion aumentada por recuperacion) en aplicaciones locales: integrar el modelo como recuperador en un pipeline con un LLM generativo, ejecutandose en la misma maquina sin GPU dedicada de gama alta.
- Deduplicacion y agrupamiento de textos: calcular embeddings de un corpus de tickets, articulos o registros y agrupar por similitud coseno para detectar duplicados o temas recurrentes.
- Clasificacion zero-shot por prototipos: comparar la representacion de un texto con las de descripciones de categoria para asignar etiquetas sin entrenamiento adicional.
- Despliegue en edge y entornos con recursos limitados: el fichero Q8_0 de 753 MB cabe en dispositivos con poca memoria y se ejecuta con llama.cpp, lo que permite busqueda semantica offline en portatiles o mini-PC.
- Filtrado y recomendacion de contenido: comparar la similitud entre un perfil de usuario y un catalogo de items (noticias, papers, productos) para generar recomendaciones basadas en contenido.
- Evaluacion de similitud de pares de frases: medir cercania semantica entre preguntas y respuestas candidatas en sistemas de FAQ o control de calidad de traducciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona el tag `mteb` y describe la cuantizacion Q8_0 como de "precision casi sin perdida", pero no aporta cifras de MTEB, recuperacion, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8 GB con Q8_0 y 1,5 GB con F16, incluyendo overhead del runtime.
- GPU recomendadas: el autor cita la RTX 4070 Ti como objetivo para Q8_0; cualquier GPU con 2 GB o mas de VRAM es suficiente, incluidas GTX 1650, RTX 3060 o superiores.
- Cabe en GPU de consumo: si, en practicamente toda la gama actual; tambien puede ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (`llama-embedding`), Ollama (`ollama run hf.co/ProtikD1810/hades-embed-v1-GGUF:Q8_0`) y, presumiblemente, cualquier runtime compatible con GGUF. vLLM y TGI no estan documentados para este repositorio.
- Latencia y throughput: no disponibles; al tratarse de un modelo de ~700 M en 8 bits, se espera una latencia de milisegundos por secuencia corta en GPU de consumo, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato GGUF | Rendimiento publicado |
|---|---|---|---|---|---|
| hades-embed-v1-GGUF | ~703 M | no disponible | Apache 2.0 | Si (Q8_0, F16) | No disponible |
| BGE-large-en-v1.5 | ~335 M | 512 tokens | MIT | Si (comunidad) | MTEB publicado por el autor |
| E5-large-v2 | ~335 M | 512 tokens | MIT | Si (comunidad) | MTEB publicado por el autor |
| GTE-large | ~335 M | 512 tokens | Apache 2.0 | Si (comunidad) | MTEB publicado por el autor |

La comparacion se limita a la categoria y al orden de magnitud: los tres modelos de referencia cuentan con resultados publicos en MTEB y comunidades amplias de usuarios, mientras que hades-embed-v1 no ofrece cifras verificables. El tamano de ~700 M es aproximadamente el doble que el de los modelos citados, lo que implica un coste de inferencia mayor sin garantia de mejora en calidad.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de su calidad en MTEB ni en tareas de recuperacion, por lo que no puede recomendarse para produccion sin una evaluacion propia.
- Modelo sin adopcion: cero descargas y cero valoraciones en el momento de la consulta, lo que reduce la probabilidad de que los fallos hayan sido detectados por la comunidad.
- Documentacion incompleta: se desconoce la longitud de contexto, los idiomas soportados, la composicion del entrenamiento y la arquitectura exacta.
- Riesgo de sesgos y alucinacion en las representaciones: al no documentarse el dataset, no puede evaluarse la cobertura linguistica ni los sesgos demograficos o culturales.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias ni soporte.
- Formato GGUF limitado a dos cuantizaciones: no hay variantes de 4 bits, lo que restringe el despliegue en dispositivos con menos de 1 GB de memoria disponible.
- El tag `mteb` no implica que el modelo haya sido evaluado en dicho benchmark; debe interpretarse como una intencion o categoria, no como un resultado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/ProtikD1810/hades-embed-v1-GGUF
- Modelo base: https://huggingface.co/ProtikD1810/hades-embed-v1
- Perfil del autor: https://huggingface.co/ProtikD1810
- Dataset del autor: https://huggingface.co/ProtikD1810/hades-m0-350m-training
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- MTEB: https://github.com/embeddings-benchmark/mteb

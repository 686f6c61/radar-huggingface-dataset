# neich-cereales/sems-embeddinggemma-2-onnx

## Resumen

sems-embeddinggemma-2-onnx es una exportación a formato ONNX del modelo de embeddings google/embeddinggemma-2, publicada por el usuario neich-cereales. Su propósito es actuar como backend de inferencia local para sems, una herramienta de línea de comandos de búsqueda semántica que descarga estos ficheros automáticamente en el primer uso. El repositorio ocupa 1,5 GB y se distribuye bajo licencia Apache 2.0.

El paquete no es un único grafo monolítico, sino cuatro grafos ONNX independientes: un embedder de tokens, un codificador de texto, un codificador de visión y un codificador de audio. Esa descomposición refleja la naturaleza multimodal del modelo base, capaz de proyectar texto, imágenes, fotogramas de vídeo y audio de hasta 30 segundos en un espacio de embeddings común.

El interés técnico está en la ruta de despliegue: el autor afirma que cada grafo reproduce los embeddings oficiales de sentence-transformers con una similitud coseno de al menos 0,9999. La información publicada no detalla el número de parámetros, la longitud de contexto ni los idiomas soportados, que dependen del modelo base y no se especifican en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de embeddings multimodal (base: google/embeddinggemma-2), exportado como cuatro grafos ONNX independientes (token embedder, codificador de texto, codificador de visión, codificador de audio) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos almacenados en float16 y convertidos a float32 al cargar el grafo; la inferencia se ejecuta en float32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (float16 en disco, float32 en inferencia) |
| Modelo base | google/embeddinggemma-2 |
| Modalidades | Texto, imagen, fotogramas de vídeo y audio (30 s de características log-mel) |
| Biblioteca declarada | onnx |
| Tamano del repositorio | 1,5 GB |
| Fecha de publicacion | 2026-10-09 |
| Descargas / likes | 0 descargas, 1 like |

## Arquitectura y entrenamiento

El paquete se organiza en cuatro grafos ONNX con interfaces bien delimitadas. `token_embedder.onnx` convierte identificadores de token en embeddings de entrada. `text_encoder.onnx` transforma esos embeddings en un embedding agrupado (pooled) y normalizado. `vision_encoder.onnx` procesa parches de imágenes y fotogramas de vídeo y los convierte en soft tokens. `audio_encoder.onnx` recibe características log-mel de 30 segundos y produce soft tokens equivalentes. Los ficheros `config.json` y `tokenizer.json` se heredan del modelo original.

Se trata de un artefacto de exportación, no de un modelo entrenado desde cero: no se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. El detalle relevante es la fidelidad numérica declarada, con similitud coseno de al menos 0,9999 —y 1,000000 medido a seis decimales— frente a las salidas oficiales de sentence-transformers. Los scripts de exportación están publicados en el directorio `tools/export` del repositorio de sems.

## Capacidades

- Generación de embeddings de texto normalizados, aptos para búsqueda semántica y comparación por similitud coseno.
- Generación de embeddings de imagen a partir de parches (codificador de visión).
- Procesamiento de fotogramas de vídeo como entradas visuales, integrables en un índice temporal.
- Generación de embeddings de audio a partir de características log-mel de 30 segundos.
- Proyección multimodal conjunta: texto, imagen y audio comparten un mismo espacio de embeddings, lo que habilita recuperación cruzada entre modalidades.
- Ejecución local sin dependencia de servicios en la nube, mediante ONNX Runtime.
- No se documenta soporte de tool calling, function calling, uso como agente, generación de texto libre, razonamiento multi-paso ni modo de pensamiento (thinking).
- Cobertura multilingüe: no disponible en la información publicada.

## Casos de uso

- Búsqueda semántica local desde la CLI: sems descarga estos grafos en el primer uso y ejecuta las consultas contra un índice local, sin enviar datos a terceros.
- Recuperación aumentada (RAG) en entornos aislados o sin conexión: el modelo actúa como recuperador denso sobre una base documental indexada previamente con los mismos grafos ONNX.
- Búsqueda de imágenes por descripción textual: el codificador de visión y el de texto comparten espacio, de modo que una consulta en lenguaje natural puede recuperar activos gráficos por similitud.
- Indexación y búsqueda en archivos audiovisuales: los fotogramas de vídeo y los segmentos de audio de 30 segundos se vectorizan y quedan consultables desde una única interfaz de búsqueda.
- Deduplicación y agrupación de documentos: la similitud coseno entre embeddings permite detectar duplicados casi idénticos o agrupar colecciones por temática.
- Clasificación zero-shot por prototipos: comparando el embedding de un texto o imagen con los embeddings de etiquetas descriptivas, sin reentrenamiento.
- Sistemas de recomendación por contenido: representar ítems y consultas del usuario en el mismo espacio para ordenar resultados por afinidad semántica.
- Despliegue en máquinas sin GPU: al pesar 1,5 GB en disco y ejecutarse en float32 sobre ONNX Runtime, es viable en portátiles y servidores de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato cuantitativo declarado por el autor es una métrica de fidelidad de la exportación, no un benchmark de calidad:

| Metrica | Valor | Condiciones |
|---|---|---|
| Similitud coseno frente a sentence-transformers oficial | >= 0,9999 (1,000000 medido a seis decimales) | Por cada grafo exportado |
| MMLU, HumanEval, GSM8K, MTEB u otros | no disponible | No aplica (modelo de embeddings, no generativo) |

## Requisitos de hardware

- El repositorio ocupa 1,5 GB en disco en float16. Dado que los pesos se convierten a float32 al cargar el grafo, la huella en memoria de los pesos se estima en torno a 3 GB, cifra aproximada porque el número de parámetros no está publicado.
- La inferencia en CPU es viable con ONNX Runtime; no se han publicado cifras de latencia ni de throughput.
- GPU recomendadas: no disponible. Al no conocerse el número de parámetros, no procede fijar un mínimo de VRAM ni modelos concretos.
- Encaje en GPU de consumo: probable en tarjetas con 6-8 GB de VRAM o más, según la estimación anterior, pero no confirmado por el autor.
- Opciones de despliegue: ONNX Runtime (con proveedores de ejecución CUDA, DirectML, CoreML o TensorRT según plataforma) y la CLI sems. vLLM, llama.cpp, Ollama y TGI no aplican a este artefacto, ya que no es un modelo generativo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La información proporcionada no permite una comparación rigurosa con alternativas de la misma categoría. El único punto de referencia documentado es el modelo base del que deriva.

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| sems-embeddinggemma-2-onnx | no disponible | no disponible | Texto, imagen, audio | Apache 2.0 | ONNX (fp16 en disco, fp32 en inferencia) | Repositorio HuggingFace con 0 descargas |
| google/embeddinggemma-2 (base) | no disponible | no disponible | Texto, imagen, audio (inferido de los grafos derivados, no confirmado) | Apache 2.0 | no disponible | HuggingFace |
| Otras alternativas (por ejemplo, exportaciones ONNX de otros modelos de embeddings) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un modelo de embeddings, no generativo: no produce texto, código ni respuestas, solo representaciones vectoriales.
- El riesgo de alucinación en el sentido habitual no aplica, pero sí el de falsos positivos por similitud coseno alta entre elementos semánticamente distintos.
- No se documentan los idiomas soportados, lo que impide garantizar cobertura multilingüe sin una evaluación previa.
- No se documenta la longitud de contexto, un dato crítico para indexar documentos largos sin truncamiento silencioso.
- La inferencia se ejecuta en float32 aunque los pesos se almacenen en float16, lo que duplica aproximadamente el consumo de memoria respecto a un runtime en precisión reducida.
- La licencia Apache 2.0 permite uso comercial, pero el artefacto deriva de google/embeddinggemma-2, desarrollado por Google DeepMind; conviene conservar la atribución y verificar los términos del modelo original.
- El repositorio registra 0 descargas y 1 like, y no se ha actualizado desde su publicación el 2026-10-09: la validación por parte de la comunidad es prácticamente nula.
- No se declara pipeline en HuggingFace, por lo que las herramientas que dependen de ese campo no lo detectarán automáticamente.
- La fidelidad de 0,9999 frente a sentence-transformers es una afirmación del autor y no se ha verificado de forma independiente en la información disponible.
- No se especifican requisitos mínimos de hardware ni cifras de rendimiento, por lo que cualquier planificación de capacidad exige una medición propia.

## Enlaces

- Repositorio del modelo: https://huggingface.co/neich-cereales/sems-embeddinggemma-2-onnx
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Proyecto sems (CLI de búsqueda semántica local): https://github.com/IgnacioSearles/sems
- Scripts de exportación: https://github.com/IgnacioSearles/sems/tree/main/tools/export

No se han encontrado papers, blogs, demos ni repositorios adicionales en la información disponible.

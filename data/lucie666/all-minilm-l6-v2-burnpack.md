# Lucie666/all-minilm-l6-v2-burnpack

## Resumen

`Lucie666/all-minilm-l6-v2-burnpack` no es un modelo nuevo, sino una conversión mecánica de formato del conocido modelo de embeddings `sentence-transformers/all-MiniLM-L6-v2` al formato `burnpack` de la librería Burn (Rust). El autor, Lucie666, utilizó `burn-onnx` para re-serializar los pesos originales en f32 (sin cuantizar, sin modificar) en un único archivo `model.bpk` de 86,1 MiB, de modo que pueda cargarse directamente en un stack de inferencia 100 % Rust, sin Python, PyTorch ni ONNX Runtime.

La relevancia de esta conversión radica en que permite usar un embedder de frases compacto y eficiente (6 capas, 384 dimensiones) en entornos donde Rust es el lenguaje principal: aplicaciones de escritorio, servicios backend, WebGPU en navegador o dispositivos embebidos. El modelo original es ampliamente utilizado para búsqueda semántica, clustering y sistemas RAG, y esta versión elimina la fricción de integrar un runtime de Python en esos ecosistemas. No hay ningún entrenamiento, fine-tuning ni destilación adicional; los pesos son idénticos al upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (BERT-style) de 6 capas, 384 dimensiones ocultas, 6 cabezas de atencion |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (truncamiento WordPiece) |
| Tipos de cuantizacion | f32 (sin cuantizar) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | burnpack (`model.bpk`), tambien disponible ONNX en el upstream |

## Arquitectura y entrenamiento

El modelo subyacente es `MiniLM-L6-v2`, un Transformer de 6 capas con 384 dimensiones ocultas, entrenado mediante destilacion de conocimiento (knowledge distillation) a partir de un BERT mas grande, segun el paper "MiniLM: Deep Self-Attention Distillation for Task-Agnostic Compression of Pre-Trained Transformers" (Wang et al., 2020). Posteriormente, el equipo de sentence-transformers lo fine-tuneo con objetivos de similitud de frases (Sentence-BERT, Reimers & Gurevych, 2019) para producir embeddings de frases de 384 dimensiones.

Esta version concreta no anade nada al entrenamiento: es una conversion puramente mecanica del grafo ONNX exportado desde PyTorch al formato `burnpack` mediante `burn-onnx 0.22.0-pre.1` con `LoadStrategy::Bytes`. El grafo resultante devuelve unicamente `last_hidden_state` (tensor `[B, S, 384]`); el pooling medio y la normalizacion L2 que aplica sentence-transformers deben implementarse manualmente en el codigo Rust. La tokenizacion tampoco se incluye: hay que usar el `tokenizer.json` del upstream (BERT WordPiece, `[PAD]` = id 0, truncar a 512).

## Capacidades

- Generacion de embeddings de frases y parrafos en un espacio vectorial denso de 384 dimensiones.
- Busqueda semantica: calcular similitud coseno entre embeddings para recuperacion de documentos o respuestas.
- Clustering de textos: agrupar documentos por similitud semantica.
- Clasificacion de textos: usar los embeddings como caracteristicas de entrada para clasificadores ligeros.
- Soporte de tool calling: no aplica (modelo de embeddings, no generativo).
- Soporte de agentes y multi-step reasoning: no aplica.
- Capacidades multilingues: solo ingles (entrenado principalmente con datos en ingles).
- Capacidades especiales: no incluye vision, audio ni modo thinking. Es exclusivamente un extractor de caracteristicas.

## Casos de uso

- Busqueda semantica en aplicaciones Rust: dado un corpus de documentos, se generan embeddings con este modelo y se indexan en una base vectorial (por ejemplo, `sqlite-vec` o `redb`) para consultas por similitud. Su tamano reducido permite ejecutarlo en un backend Rust sin dependencias de Python.
- Sistemas RAG (Retrieval-Augmented Generation) en Rust: el modelo se usa como componente de recuperacion en pipelines de generacion aumentada, como en el proyecto `rag3weaver` (enlace en la seccion de enlaces). Al ser un embedder ligero, puede ejecutarse en el mismo proceso que el LLM.
- Clustering de documentos en entornos embebidos: por ejemplo, organizar correos o tickets de soporte en categorias semanticas en un dispositivo con recursos limitados (Raspberry Pi, routers, etc.).
- Deduplicacion de textos: comparar embeddings para detectar contenido duplicado o casi duplicado en bases de datos de articulos, noticias o registros.
- Clasificacion de intenciones en chatbots: generar embeddings de las frases del usuario y compararlos con ejemplos etiquetados para determinar la intencion, sin necesidad de un modelo generativo.
- Analisis de similitud en documentos legales o tecnicos: medir la proximidad semantica entre clausulas o especificaciones, util para revision de contratos o busqueda de precedentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo original `sentence-transformers/all-MiniLM-L6-v2` tiene metricas publicadas en el repositorio de sentence-transformers (por ejemplo, en tareas de STS), pero esta conversion no aporta datos propios. La model card solo incluye una verificacion de paridad numerica frente a una implementacion de referencia en `candle`, con diferencias maximas del orden de 2e-7 en coseno, atribuibles a ruido de acumulacion en f32.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo `model.bpk` ocupa 86,1 MiB en f32, por lo que la inferencia en GPU requiere menos de 100 MB de VRAM. Cualquier GPU con 1 GB o mas es suficiente.
- GPU recomendadas: cualquier GPU moderna, incluidas integradas (por ejemplo, Intel Iris Xe, AMD Radeon integrada) o discretas de gama baja (GTX 1650, RTX 3050). Tambien funciona en GPU via WebGPU en navegadores.
- CPU: se ejecuta sin problemas en cualquier CPU de escritorio o servidor; el modelo es muy ligero (6 capas, 384 dimensiones).
- Si cabe en consumer GPU: si, en todas las GPUs de consumo actuales, incluso en las mas modestas.
- Opciones de despliegue: Burn con backends CPU, wgpu (Vulkan/Metal/DX12), CUDA o WebGPU. No es compatible con vLLM, Ollama o TGI porque no es un modelo generativo.
- Latencia y throughput: no se proporcionan datos concretos, pero por el tamano del modelo se espera una latencia de pocos milisegundos por frase en CPU moderna y menor en GPU.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. El modelo es una conversion de `all-MiniLM-L6-v2`, que pertenece a la familia de embedders de sentence-transformers. Alternativas de la misma categoria (mismos proposito y tamano aproximado) incluyen `all-MiniLM-L12-v2`, `all-mpnet-base-v2` y `bge-small-en-v1.5`, pero no se han verificado sus especificaciones en esta ficha. Se recomienda consultar el repositorio de sentence-transformers para una comparativa de calidad y velocidad.

## Limitaciones y advertencias

- Es una conversion de formato, no un modelo independiente: cualquier limitacion del modelo original (sesgos, alucinaciones en tareas generativas, etc.) se hereda, aunque al ser un embedder no genera texto.
- Solo soporta ingles. No se recomienda su uso con otros idiomas sin evaluacion previa.
- La tokenizacion no esta incluida en el paquete; hay que cargar el `tokenizer.json` del upstream y aplicarla manualmente.
- El grafo devuelve solo `last_hidden_state`; el pooling medio y la normalizacion L2 deben implementarse en el codigo de usuario para obtener embeddings comparables al modelo original.
- La serializacion `burnpack` no es byte-determinista: dos conversiones del mismo ONNX producen archivos de igual tamano pero bytes distintos, aunque los valores de los tensores no cambian. El checksum SHA-256 proporcionado verifica esta descarga concreta, no una reproduccion.
- La licencia Apache-2.0 permite uso comercial, pero se debe mantener la atribucion a los autores originales (Reimers, Gurevych, Wang et al.).
- No hay garantias de soporte ni mantenimiento por parte del autor de la conversion.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/Lucie666/all-minilm-l6-v2-burnpack
- Modelo original: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Paper Sentence-BERT: https://arxiv.org/abs/1908.10084
- Paper MiniLM: https://arxiv.org/abs/2002.10957
- Proyecto rag3weaver (uso de ejemplo): https://github.com/L-Defraiteur/rag3db
- Documentacion de Burn: https://burn.dev

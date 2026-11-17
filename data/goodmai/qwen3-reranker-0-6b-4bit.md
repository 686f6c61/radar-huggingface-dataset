# goodmai/Qwen3-Reranker-0.6B-4bit

## Resumen

Qwen3-Reranker-0.6B-4bit es una versión cuantizada a 4 bits, en formato MLX, del modelo Qwen/Qwen3-Reranker-0.6B desarrollado originalmente por el equipo Qwen de Alibaba. La conversión y publicación la ha realizado el usuario goodmai, y el modelo está pensado para ejecutarse en Apple Silicon mediante la librería MLX. Se trata de un cross-encoder especializado en reranking de recuperación de información: recibe un par (consulta, documento) y emite una puntuación de relevancia binaria ("yes"/"no") a partir de la cual se deriva un score continuo.

El modelo resuelve el segundo estadio de los pipelines RAG y de búsqueda semántica: tras una recuperación inicial (por ejemplo, con embeddings o BM25), el reranker reordena los candidatos según su relevancia real para la consulta. Con 595.776.512 parámetros totales y un tamaño en disco de aproximadamente 0,3 GB, está diseñado para ejecutarse en hardware de consumo, en particular Macs con chip Apple Silicon.

Su relevancia actual radica en que permite desplegar un reranker de calidad dentro de un flujo local sin GPU dedicada ni servicios en la nube, manteniendo la licencia Apache 2.0 del modelo base. La cuantización affine de 4 bits (group_size=64, ~4,5 bits por peso) reduce el peso a ~331 MB conservando la receta de scoring del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only) usado como cross-encoder para reranking |
| Parametros totales | 595.776.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | affine 4-bit, group_size=64 (~4,5 bits por peso) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3-Reranker-0.6B es un transformer causal (decoder-only) de la familia Qwen3, reutilizado como reranker mediante una formulación de scoring tipo cross-encoder. En lugar de generar texto libre, se construye un prompt con instrucción, consulta y documento, y se comparan los logits de los tokens "yes" y "no" en la última posición; la probabilidad de "yes" tras un softmax sobre ambos logits actúa como puntuación de relevancia. El prompt incluye el bloque de sistema que instruye al modelo a juzgar si el documento satisface la consulta, y un sufijo con ` thinking` vacío antes de la respuesta.

La versión publicada aquí es una conversión a MLX realizada con mlx-lm 0.31.3 a partir de Qwen/Qwen3-Reranker-0.6B, aplicando cuantización affine de 4 bits con group_size=64. No se dispone en la información proporcionada de detalles sobre el dataset de entrenamiento del modelo base, el número de tokens, ni si se emplearon técnicas de RLHF/DPO o ajuste específico para la tarea de ranking.

## Capacidades

- Reranking de pares (consulta, documento) mediante puntuación de relevancia binaria convertida a probabilidad continua.
- Evaluación de relevancia guiada por instrucción: el prompt admite un campo `<Instruct>` que permite adaptar el criterio de relevancia a la tarea (por ejemplo, búsqueda web, QA sobre pasajes).
- Integración en pipelines de recuperación de información como segunda etapa tras un retriever inicial.
- Ejecución nativa en Apple Silicon mediante MLX, sin dependencia de Python en el caso de la app Basalt.
- Compatibilidad con `sentence-transformers` como etiqueta de pipeline (`text-ranking`).
- Soporte de tooling del ecosistema MLX (`mlx-lm`) para carga y ejecución.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de generación, tool calling, agentes, visión ni audio; el modelo está orientado exclusivamente al reranking.

## Casos de uso

- Reranking en pipelines RAG locales: tras recuperar los N candidatos con un retriever de embeddings, el modelo reordena los pasajes por relevancia real antes de pasarlos al LLM generador; su tamaño de ~331 MB permite ejecutarlo en el mismo Mac que el modelo generativo.
- Búsqueda semántica en aplicaciones de escritorio para macOS: integrable mediante Basalt (Swift, sin Python) para ofrecer búsqueda con reranking dentro de una app nativa de Apple Silicon.
- Filtrado de resultados en motores de búsqueda internos: dado un conjunto de documentos candidatos, el modelo puntúa cada par con una instrucción específica del dominio (por ejemplo, "recupera pasajes que respondan a la consulta") para descartar falsos positivos del retriever.
- Asistentes de documentación técnica: reordenar fragmentos de manuales o APIs antes de construir el contexto de respuesta, mejorando la precisión del LLM al reducir pasajes irrelevantes.
- Evaluación offline de sistemas de recuperación: usar las puntuaciones como señal para medir y comparar la calidad de retrievers o de distintas estrategias de chunking en un corpus.
- Prototipado rápido en investigación: al ser un checkpoint de 0,6 B parámetros en 4 bits, permite iterar sobre recetas de prompt (instrucción, formato del par) en un portátil sin infraestructura GPU.
- Deduplicación y priorización de evidencias: puntuar múltiples fragmentos sobre la misma consulta para seleccionar los más relevantes en tareas de verificación o resumen extractivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/peso en disco: ~331 MB para los pesos en 4 bits; el repositorio completo ocupa ~0,3 GB.
- Hardware objetivo: Apple Silicon (MLX). No se documenta soporte para CUDA en esta versión.
- GPU de consumo: cabe holgadamente en cualquier Mac con chip de la serie M; no aplica a GPUs NVIDIA en este formato.
- Despliegue: `mlx-lm` (carga con `mlx_lm.load`) y la aplicación/CLI Basalt v0.11.0 (macOS 27+, Swift 6.4) con el comando `basalt serve --model ... --rerank-model goodmai/Qwen3-Reranker-0.6B-4bit --rest`.
- vLLM, llama.cpp, Ollama o TGI: no disponibles para este checkpoint MLX; requerirían el modelo base o una conversión a otro formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| goodmai/Qwen3-Reranker-0.6B-4bit | 595.776.512 | no disponible | safetensors MLX 4-bit | apache-2.0 | Este modelo; orientado a Apple Silicon |
| Qwen/Qwen3-Reranker-0.6B | no disponible | no disponible | safetensors | apache-2.0 | Modelo base sin cuantizar; referencia upstream |
| mlx-community/Qwen3-Reranker-0.6B-4bit | no disponible | no disponible | safetensors MLX 4-bit | apache-2.0 | Fuente upstream de la conversión MLX citada en la model card |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo es un reranker, no un generador: no debe usarse para producir texto, responder preguntas ni tareas de agente.
- La puntuación depende del formato exacto del prompt (prefijo de sistema, sufijo con ` thinking` vacío y tokens "yes"/"no"); desviarse de la receta de scoring puede degradar o invalidar los resultados.
- La cuantización a 4 bits puede introducir una pérdida de precisión en las puntuaciones frente al modelo base; no se documenta una evaluación de dicha degradación.
- Solo se distribuye en formato MLX: no es directamente utilizable en ecosistemas CUDA, vLLM, llama.cpp u Ollama sin conversión adicional.
- Idiomas soportados no documentados; el comportamiento multilingüe del modelo base no está verificado en esta ficha.
- Riesgo de sesgo y alucinación heredado del modelo base: las puntuaciones de relevancia pueden reflejar sesgos del corpus de entrenamiento original.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3-Reranker-0.6B y de la conversión MLX de origen.
- Modelo con muy pocas descargas (27) y sin likes en el momento de la consulta: escasa validación comunitaria de esta conversión concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/goodmai/Qwen3-Reranker-0.6B-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-Reranker-0.6B
- Conversión MLX upstream: https://huggingface.co/mlx-community/Qwen3-Reranker-0.6B-4bit
- Repositorio Basalt: https://github.com/goodmai/basalt
- Release Basalt v0.11.0: https://github.com/goodmai/basalt/releases/tag/v0.11.0
- Demo Basalt (Apple Silicon MLX): https://goodmai-run-with-basalt.static.hf.space/?model=goodmai%2FQwen3-Reranker-0.6B-4bit&role=rerank

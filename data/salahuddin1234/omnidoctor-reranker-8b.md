# Salahuddin1234/OmniDoctor-Reranker-8B

## Resumen

OmniDoctor-Reranker-8B es un modelo de reranking (cross-encoder) publicado en HuggingFace por el usuario Salahuddin1234. Se trata de un modelo de 8.188.548.096 parametros (8,19 B) en formato safetensors, con un tamano de repositorio de 16,4 GB, licencia Apache-2.0 y pipeline declarado `text-ranking`. Los metadatos lo marcan como finetune de `Qwen/Qwen3-8B-Base`, mientras que la model card reproduce literalmente la documentacion de `Qwen/Qwen3-Reranker-8B` de Alibaba, incluida la tabla de la familia Qwen3 Embedding.

El modelo resuelve el problema clasico de la segunda etapa de un pipeline RAG: dada una consulta y un conjunto de documentos recuperados por busqueda vectorial, reordena los candidatos por relevancia real, explotando la codificacion conjunta de pares consulta-documento. Frente a un bi-encoder, este enfoque es mas preciso pero computacionalmente mas caro, por lo que se usa tipicamente sobre 50-100 candidatos para quedarse con los 3-5 mejores. El nombre "OmniDoctor" sugiere un ajuste orientado al dominio medico, aunque no hay documentacion que lo confirme.

La relevancia practica es limitada por su estado actual: cero descargas y cero likes en el momento de la consulta, sin resultados de benchmarks propios publicados y con una model card que no describe ninguna diferencia respecto al modelo original de Qwen. Cualquier evaluacion en produccion deberia hacerse contra `Qwen/Qwen3-Reranker-8B` como linea base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3), configurado como cross-encoder para reranking |
| Parametros totales | 8.188.548.096 (8,19 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32 000 tokens (32k) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors, sin GGUF ni AWQ/GPTQ declarados) |
| Idiomas soportados | 100+ idiomas, segun la model card (capacidad multilingue heredada de Qwen3); no se detalla lista concreta |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 16,4 GB) |
| Pipeline declarado | text-ranking |
| Capas | 36 (segun la tabla de la familia Qwen3 Embedding para el tamano 8B) |
| Modelo base declarado | Qwen/Qwen3-8B-Base (tag `base_model:finetune`) |
| Libreria | transformers; compatible con sentence-transformers (CrossEncoder) |
| Fecha de creacion / actualizacion | 2026-09-30 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe un modelo de la familia Qwen3 Embedding construido sobre los modelos densos fundacionales de Qwen3, con tamano de 8B, 36 capas y una longitud de secuencia de 32k. Para la tarea de reranking el modelo se usa como cross-encoder: se aplica la plantilla de chat con una instruccion (por defecto `"Given a web search query, retrieve relevant passages that answer the query"`) y se obtienen logits cuya diferencia se interpreta como puntuacion de relevancia; aplicando una sigmoide se convierten en probabilidades 0-1. El modelo es "instruction aware", es decir, admite instrucciones personalizadas por tarea, y la documentacion del autor original indica mejoras tipicas del 1 % al 5 % al usar instrucciones frente a no usarlas.

No se dispone de informacion especifica sobre el entrenamiento de esta publicacion concreta: ni numero de tokens, ni composicion del dataset, ni uso de RLHF/DPO, ni detalles del supuesto ajuste al dominio medico. La model card es una copia de la de `Qwen/Qwen3-Reranker-8B` y no documenta ningun proceso de finetune, ninguna innovacion tecnica propia ni ninguna receta de entrenamiento diferencial. El unico indicio de entrenamiento adicional son los tags `base_model:Qwen/Qwen3-8B-Base` y `base_model:finetune:Qwen/Qwen3-8B-Base`, que entran en conflicto nominal con el titulo del README (Qwen3-Reranker-8B), ya que el reranker oficial no parte del modelo Base sino de un checkpoint ya adaptado.

## Capacidades

- Reranking de pares consulta-documento (cross-encoder) con puntuaciones en forma de logits crudos o probabilidades 0-1 mediante activacion sigmoide.
- Recuperacion de texto multilingue y cross-lingue, con soporte declarado de mas de 100 idiomas segun la model card.
- Recuperacion de codigo (code retrieval), al heredar la capacidad multi-linguistica de Qwen3 en lenguajes de programacion.
- Comprension de texto largo: ventana de 32k tokens, adecuada para documentos extensos en la fase de reranking.
- Instrucciones personalizables por tarea (`Instruction Aware`), configurables mediante el parametro `prompts` de `CrossEncoder`.
- Integracion directa con `sentence-transformers` mediante `CrossEncoder.predict()` y `CrossEncoder.rank()`.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio en la informacion proporcionada.
- No se documenta modo de razonamiento explicito (thinking mode) ni generacion de texto libre: el modelo esta orientado a puntuacion de relevancia.

## Casos de uso

- Segunda etapa de un pipeline RAG: recuperar 50-100 candidatos con busqueda vectorial y reordenarlos con el modelo para entregar los 3-5 pasajes mas relevantes al LLM generador; la ventana de 32k permite rerankear fragmentos largos sin trocear en exceso.
- Busqueda documental en repositorios corporativos multilingues: aprovechar el soporte declarado de mas de 100 idiomas para consultas en un idioma y documentos en otro (cross-lingue).
- Recuperacion de codigo en asistentes de desarrollo: indexar un repositorio y rerankear fragmentos de codigo relevantes para una consulta tecnica, gracias al soporte de code retrieval de la familia Qwen3.
- Filtrado de contexto para agentes: dado un conjunto amplio de observaciones o resultados de herramientas, ordenar por relevancia antes de inyectarlas en la ventana del agente, reduciendo tokens y ruido.
- Deduplicacion y clasificacion de pares: usar las puntuaciones de relevancia como senal auxiliar para tareas de clustering de textos o de bitext mining (emparejamiento de traducciones).
- Ajuste fino de dominio medico (uso previsto por el nombre del modelo): reranking de literatura clinica o guias, siempre que se valide empiricamente contra el modelo base de Qwen, ya que no hay evidencia publicada del ajuste.
- Evaluacion comparativa interna de motores de recuperacion: usar el reranker como "juez" de relevancia para medir la calidad de distintos indices vectoriales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este modelo concreto (`Salahuddin1234/OmniDoctor-Reranker-8B`).

Los unicos datos numericos disponibles pertenecen a la familia original de Qwen y se reproducen tal cual figuran en la model card:

| Modelo / dato | Resultado | Fuente |
|---|---|---|
| Qwen3-Embedding-8B en MTEB multilingual | 70,58 (posicion n.o 1 a fecha de 5 de junio de 2025) | Model card (se refiere al modelo de embeddings, no al de reranking) |
| Qwen3-Reranker-8B (original) | No se incluyen cifras por tarea en la informacion proporcionada | Model card |
| OmniDoctor-Reranker-8B | No disponible | No hay datos publicados |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16,4 GB solo de pesos, mas activaciones y cache KV; en la practica se recomienda reservar 20-24 GB para contextos largos. Estimacion propia a partir del tamano del repositorio.
- Cuantizacion a 8 bits: en torno a 9-10 GB de pesos (estimacion).
- Cuantizacion a 4 bits: en torno a 5-6 GB de pesos (estimacion); no se confirma que existan conversiones GGUF/AWQ/GPTQ publicadas para este repositorio.
- GPU profesionales: A100 (40/80 GB), H100, L40S y similares son adecuadas para bf16 en produccion.
- GPU de consumo: cabe en RTX 4090 o RTX 3090 (24 GB) en bf16, aunque el margen se reduce con contextos cercanos a 32k; en tarjetas de 16 GB (RTX 4080, 4070 Ti Super) seria necesario cuantizar.
- Opciones de despliegue: `sentence-transformers` con `CrossEncoder` (confirmado en la model card); vLLM, TGI y servidores de inferencia compatibles con tareas de scoring/reranking (no confirmado para este repositorio concreto); llama.cpp/Ollama solo si se generan conversiones GGUF, que no se declaran.
- El tag `endpoints_compatible` sugiere compatibilidad con HuggingFace Inference Endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Dentro de la propia familia Qwen3 Embedding, segun la tabla incluida en la model card:

| Modelo | Parametros | Capas | Longitud de secuencia | Instruction aware | Licencia |
|---|---|---|---|---|---|
| OmniDoctor-Reranker-8B (esta publicacion) | 8,19 B | 36 | 32K | Si (heredado) | Apache-2.0 |
| Qwen/Qwen3-Reranker-8B | 8B | 36 | 32K | Si | Apache-2.0 |
| Qwen/Qwen3-Reranker-4B | 4B | 36 | 32K | Si | Apache-2.0 |
| Qwen/Qwen3-Reranker-0.6B | 0,6B | 28 | 32K | Si | Apache-2.0 |

Alternativas de otros fabricantes (BGE, Jina, Cohere Rerank, etc.): no disponible en la informacion proporcionada; el listado curado `agentset-ai/awesome-rerankers` enlazado abajo puede servir de punto de partida para la comparacion.

## Limitaciones y advertencias

- La model card reproduce integramente la documentacion oficial de `Qwen/Qwen3-Reranker-8B`; no describe ninguna aportacion propia, ningun dataset de ajuste ni ningun resultado que justifique el nombre "OmniDoctor".
- Hay una inconsistencia de metadatos: el README se titula "Qwen3-Reranker-8B" pero el tag `base_model` apunta a `Qwen/Qwen3-8B-Base`, no al reranker oficial. Esto impide saber con certeza que pesos contiene el repositorio.
- Cero descargas y cero likes: no hay evidencia de uso, validacion por terceros ni mantenimiento.
- No se publican evaluaciones de sesgo ni de robustez; los sesgos serian los heredados de Qwen3-8B-Base, no cuantificados aqui.
- Riesgo de alucinacion y de sobreconfianza en las puntuaciones: al ser un reranker, un mal calibrado puede priorizar pasajes plausibles pero incorrectos, lo que degrada silenciosamente el RAG. Se recomienda validar con un conjunto de evaluacion propio.
- Idiomas: se declaran mas de 100 idiomas, pero sin lista ni evaluacion por idioma; el castellano no esta verificado especificamente.
- Aunque la licencia es Apache-2.0 y permite uso comercial, conviene verificar la trazabilidad de los pesos antes de integrarlos en produccion, dado que la procedencia del finetune no esta documentada.
- La longitud de contexto de 32k implica un coste de atencion cuadratico en el cross-encoder: rerankear muchos candidatos largos por consulta puede disparar la latencia.
- Formato de pesos unicamente safetensors: sin conversiones cuantizadas oficiales, el despliegue en hardware limitado requiere trabajo adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Salahuddin1234/OmniDoctor-Reranker-8B
- Modelo original de referencia: https://huggingface.co/Qwen/Qwen3-Reranker-8B
- Familia de embeddings: https://huggingface.co/Qwen/Qwen3-Embedding-8B
- Blog de Qwen3 Embedding: https://qwenlm.github.io/blog/qwen3-embedding/
- Repositorio GitHub de Qwen3-Embedding: https://github.com/QwenLM/Qwen3-Embedding
- Paper referenciado en los tags (arXiv:2506.05176): https://arxiv.org/abs/2506.05176
- Listado curado de rerankers: https://github.com/agentset-ai/awesome-rerankers
- Perfil del autor en GitHub: https://github.com/salahuddin1234

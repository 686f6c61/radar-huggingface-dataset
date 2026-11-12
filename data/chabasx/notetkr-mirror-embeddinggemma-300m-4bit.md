# chabasx/NoteTkr-mirror-embeddinggemma-300m-4bit

## Resumen

NoteTkr-mirror-embeddinggemma-300m-4bit es un espejo (mirror) publicado por el usuario chabasx en Hugging Face del modelo mlx-community/embeddinggemma-300m-4bit, que a su vez es una conversion al formato MLX del modelo original google/embeddinggemma-300m-qat-q4_0-unquantized de Google. Se trata, por tanto, de un modelo de embeddings de frases (sentence embeddings) derivado de la familia Gemma 3, con 307.581.696 parametros y un tamano de repositorio de 0,2 GB, lo que refleja su naturaleza cuantizada a 4 bits.

El modelo resuelve el problema de generar representaciones vectoriales densas de texto para tareas de similitud semantica, recuperacion de informacion, clustering y clasificacion. Su relevancia actual radica en que ofrece una alternativa ligera y ejecutable en hardware Apple Silicon mediante MLX, manteniendo el pipeline de sentence-similarity y compatibilidad con text-embeddings-inference y endpoints, lo que facilita su integracion en infraestructuras de busqueda semantica y RAG.

No obstante, conviene subrayar que este repositorio concreto es un espejo de terceros con cero descargas y cero likes en el momento de la consulta, creado el 12 de noviembre de 2026, y que no aporta informacion adicional sobre el entrenamiento ni sobre los idiomas soportados mas alla de lo que declara la model card heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Gemma 3 (gemma3_text) adaptado a embeddings |
| Parametros totales | 307.581.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (origen qat-q4_0); formato MLX |
| Idiomas soportados | no disponible |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura gemma3_text, un transformer decoder-only de la familia Gemma 3 de Google, adaptado aqui para producir embeddings de frases normalizados en lugar de tokens generativos. El checkpoint de origen es google/embeddinggemma-300m-qat-q4_0-unquantized, que aplica cuantizacion consciente del entrenamiento (QAT) a 4 bits; la conversion a MLX se realizo con mlx-lm version 0.0.4, segun declara la model card.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada. La innovacion tecnica destacable es el uso de prefijos de tarea especificos (por ejemplo, "task: search result | query: " o "task: clustering | query: ") que guian al modelo hacia el tipo de embedding deseado, un patron habitual en modelos de embeddings instruidos.

## Capacidades

- Generacion de embeddings de texto normalizados para similitud semantica.
- Recuperacion de informacion (retrieval) mediante prefijos de tarea dedicados.
- Reranking de resultados de busqueda.
- Clustering de documentos o frases.
- Clasificacion y clasificacion multietiqueta de textos.
- Bitext mining y emparejamiento de frases.
- Resumen (representacion para summarization).
- Soporte de prefijos especificos para consulta y documento ("title: none | text: ").
- Compatibilidad con text-embeddings-inference y endpoints.
- Ejecucion en Apple Silicon mediante MLX.
- No se documenta soporte de tool calling, agentes, vision ni audio en la informacion disponible.

## Casos de uso

- Busqueda semantica en bases de conocimiento: el modelo genera embeddings normalizados que permiten calcular similitud por producto escalar, adecuado para indexar documentacion interna y recuperar fragmentos relevantes mediante el prefijo "task: search result | query: ".
- Sistemas RAG (retrieval-augmented generation): al ser un modelo de 300M parametros cuantizado a 4 bits, puede desplegarse junto a un LLM generativo para recuperar contexto relevante antes de la generacion, con bajo coste de memoria.
- Deduplicacion y clustering de textos: el prefijo "task: clustering | query: " permite agrupar articulos, tickets o resenas similares sin supervision.
- Clasificacion de tickets de soporte: usando "task: classification | query: " se pueden generar embeddings que alimenten un clasificador ligero para enrutar incidencias.
- Reranking en pipelines de busqueda: el prefijo "task: search result | query: " permite reordenar candidatos recuperados por un motor lexico, mejorando la precision.
- Prototipado en Mac con Apple Silicon: gracias al formato MLX y a mlx-embeddings, desarrolladores pueden probar pipelines de embeddings localmente sin GPU dedicada.
- Emparejamiento bilingue (bitext mining): con el prefijo "task: search result | query: " se pueden alinear frases entre idiomas, siempre que el soporte multilingue del modelo base lo permita (no confirmado en la informacion disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 307M parametros cuantizado a 4 bits, el peso de los parametros ronda los 0,2 GB, por lo que la memoria necesaria es muy reducida (tipicamente menos de 1 GB incluyendo overhead).
- GPU recomendadas: no se especifican en la informacion disponible; el formato MLX esta orientado a Apple Silicon (chips M1, M2, M3, M4 y superiores).
- Cabe en GPU consumer: si, por su tamano reducido cabria en cualquier GPU consumer moderna (RTX 3060 o superior), aunque el checkpoint publicado esta en formato MLX y no en GGUF ni safetensors estandar de PyTorch.
- Opciones de despliegue: mlx-embeddings (via mlx-lm), text-embeddings-inference y endpoints compatibles segun los tags del repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| chabasx/NoteTkr-mirror-embeddinggemma-300m-4bit | 307.581.696 | no disponible | gemma | safetensors (MLX) | espejo de terceros, 0 descargas |
| google/embeddinggemma-300m-qat-q4_0-unquantized | no disponible | no disponible | gemma | no disponible | modelo original de Google |
| mlx-community/embeddinggemma-300m-4bit | no disponible | no disponible | gemma | MLX | conversion oficial de la comunidad MLX |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Es un espejo de terceros con cero descargas y cero likes; no hay evidencia de validacion independiente de su correcto funcionamiento.
- El modelo esta en formato MLX, lo que limita su uso a entornos Apple Silicon o a herramientas compatibles con MLX; no es directamente cargable con PyTorch, vLLM o llama.cpp.
- La licencia Gemma impone restricciones de uso comercial y requiere aceptar los terminos de Google; el acceso al modelo original esta condicionado a un gate de licencia.
- No se documentan los idiomas soportados, por lo que el comportamiento multilingue no puede garantizarse.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion (aunque al ser un modelo de embeddings el riesgo se traslada a recuperaciones erroneas) ni sobre el contexto maximo.
- Al ser un modelo de embeddings, no genera texto; no debe emplearse como LLM generativo.
- La fecha de creacion (2026-11-12) y la ausencia de actividad sugieren que el repositorio podria no mantenerse actualizado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/chabasx/NoteTkr-mirror-embeddinggemma-300m-4bit
- Modelo original de la conversion MLX: https://huggingface.co/mlx-community/embeddinggemma-300m-4bit
- Modelo base de Google: https://huggingface.co/google/embeddinggemma-300m-qat-q4_0-unquantized

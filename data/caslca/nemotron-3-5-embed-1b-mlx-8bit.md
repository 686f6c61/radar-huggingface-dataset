# caslca/Nemotron-3.5-Embed-1B-mlx-8bit

## Resumen

Nemotron-3.5-Embed-1B-mlx-8bit es una cuantización de 8 bits del modelo de embeddings nvidia/Nemotron-3.5-Embed-1B-BF16, publicada por el usuario caslca (Premisa) en HuggingFace. El modelo original es un bi-encoder multimodal de NVIDIA diseñado para recuperación densa (retrieval) sobre texto e imágenes de páginas de documento, pensado para pipelines RAG: recibe una consulta o un pasaje —texto o imagen— y devuelve un vector de embedding fijo de 2048 dimensiones.

Esta variante no reentrena ni modifica el modelo: aplica cuantización entera afín de 8 bits (modo `affine`, group size 64) sobre los pesos lineales del componente de lenguaje, generada con MLX. La torre de visión queda fuera del uso para embeddings puramente textuales, de modo que esta versión está orientada a recuperación de texto. Con 1.140.918.272 parámetros y un repositorio de 1,2 GB, está pensada para ejecutarse en hardware Apple Silicon mediante la librería MLX, reduciendo el coste de memoria frente a los pesos BF16 originales.

Su relevancia es práctica: permite desplegar un embedder de 1B en entornos locales con memoria limitada (la medición del autor sitúa el pico del servidor de tareas en 3,87 GB conviviendo con un modelo de tarea de 1,5B y un reranker de 8 bits), manteniendo el espacio de embeddings y la configuración de pooling del modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bi-encoder multimodal (torre de lenguaje basada en `mistral3` + torre de visión, no usada para embeddings de texto); pooling por media |
| Parametros totales | 1.140.918.272 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits, afín entera (`affine`), group size 64; pesos lineales del modelo de texto |
| Idiomas soportados | Cobertura multilingüe según la model card del modelo fuente; el conjunto concreto de idiomas no está especificado (no disponible) |
| Licencia | openmdw-1.1 (se aplica la licencia del modelo fuente a los pesos derivados) |
| Formato de pesos | safetensors (formato MLX) |
| Dimension de embedding | 2048 |
| Prefijos requeridos | `query: ` para consultas y `passage: ` para pasajes |
| Libreria de inferencia | MLX (loader de embeddings `mistral3` del fork mlx-vlm, solo texto) |
| Revision del modelo fuente | `e24ca1e346bcc53572bd7bdc02b3e8ebf66c197c` |
| SHA-256 de los pesos fuente | `ad3e1b8bbda04bbd8c969f19df0b66ea672f915f624800ba0b982c5c01bf92af` |

## Arquitectura y entrenamiento

El modelo fuente es un bi-encoder: codifica consultas y pasajes de forma independiente y compara sus representaciones en un espacio vectorial común, lo que permite precalcular los embeddings del corpus y hacer búsqueda por similitud a bajo coste. La torre de lenguaje parte de la familia `mistral3` (según los tags del repositorio) y en la versión original convive con un encoder de visión y un proyector multimodal que permiten embeber imágenes de páginas de documento. En esta cuantización solo se usan los pesos lineales del modelo de texto; la torre de visión queda fuera del flujo de embedding textual. La agregación de tokens se hace por media (mean pooling) y produce vectores de 2048 dimensiones.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO para el modelo fuente en la documentación consultada. La model card del 8B de la misma familia indica que su componente de lenguaje se inicializa desde Nemotron-3-Embed-8B y permanece congelado, entrenándose únicamente el encoder de visión y el proyector; para la variante de 1B no se detalla el procedimiento. La innovación de esta ficha concreta es la cuantización: cuantización afín de 8 bits con group size 64 aplicada el 22 de octubre de 2026 con la herramienta `model_quant_spike.py quantize --bits 8` de Premisa, sin destilación ni ajuste posterior.

## Capacidades

- Generación de embeddings de texto para recuperación densa: consultas y pasajes se codifican por separado en un espacio compartido de 2048 dimensiones.
- Recuperación multimodal en el modelo fuente: acepta texto o imágenes de documentos (tablas, gráficos, infografías) como entrada; esta variante cuantizada está descrita y medida para uso textual.
- Soporte de prefijos de tarea (`query: ` y `passage: `), necesarios para que la consulta y el pasaje se proyecten en el mismo subespacio.
- Cobertura multilingüe heredada del modelo fuente, aunque no medida por el autor de la cuantización.
- Integración en pipelines RAG como primer recuperador (retrieval) seguido de un reranker.
- No es un modelo generativo: no produce texto, no soporta tool calling, ni razonamiento multi-paso ni modo thinking.
- Carga mediante el loader de embeddings solo-texto `mistral3` del fork mlx-vlm, con lectura de la configuración de pooling desde `1_Pooling/config.json` cuando está presente.

## Casos de uso

- Recuperación en RAG sobre documentación técnica: se indexa el corpus con prefijo `passage: ` y se consulta con `query: `; los vectores de 2048 dimensiones se almacenan en un índice vectorial y se recuperan los k pasajes más similares antes de pasarlos a un LLM generador.
- Búsqueda semántica local en Apple Silicon: al estar en formato MLX con 8 bits, puede ejecutarse en un Mac sin GPU dedicada, sirviendo un endpoint de embeddings para una aplicación de escritorio o un prototipo interno.
- Recuperación sobre páginas de documento escaneadas en el modelo fuente: para corpus con tablas e infografías, la versión BF16 del modelo permite embeber la imagen de la página directamente; esta variante sirve cuando el texto ya está extraído por OCR.
- Reranking en dos etapas: uso como recuperador de primera fase barato (1B parámetros) y posterior afinado con un cross-encoder, como en el montaje medido por el autor junto a un reranker de 8 bits.
- Asistente de soporte interno con base de conocimiento: indexación de manuales y tickets resueltos, con recuperación de fragmentos de hasta 2000 caracteres —la granularidad usada en el estudio de Premisa— para acotar el contexto enviado al modelo generativo.
- Deduplicación y agrupación semántica de documentos: cálculo de embeddings de un lote de textos y agrupamiento por similitud coseno para detectar duplicados o clasificar por temática.
- Filtrado previo en pipelines de CI/CD de documentación: verificación de que una página modificada sigue siendo recuperable por sus consultas canónicas, comparando el ranking antes y después del cambio.

## Benchmarks y rendimiento

El autor reporta una evaluación en el estudio de recuperación Premisa (corpus en inglés, 230 preguntas, fragmentos de 2000 caracteres, pool 50): el modelo obtiene cifras de aciertos entregados iguales a las de gte-modernbert-base en todas las métricas medidas. No se publican los valores numéricos concretos.

| Evaluacion | Resultado |
|---|---|
| Premisa retrieval study (inglés, 230 preguntas, chunks de 2000 caracteres, pool 50) | Igual a gte-modernbert-base en todas las figuras de aciertos entregados (sin cifras publicadas) |
| Cobertura multilingüe | No medida por Premisa; se remite a la model card del modelo fuente |
| MMLU, HumanEval, GSM8K u otros benchmarks de LLM | No aplica: es un modelo de embeddings, no generativo |

No se han publicado resultados de benchmarks adicionales en la información disponible. El autor advierte que las cifras son mediciones de un estudio previo a adjudicación y no constituyen afirmaciones de calidad.

## Requisitos de hardware

- Tamaño en disco: 1,2 GB de repositorio; los pesos cuantizados a 8 bits ocupan aproximadamente 1,14 GB (1.140.918.272 parámetros).
- VRAM estimada para inferencia: del orden de 1,5-2 GB para los pesos más activaciones y overhead del runtime; el autor mide un pico de 3,87 GB de memoria del servidor de tareas cuando convive con un modelo de tarea de 1,5B y un reranker de 8 bits.
- Cabe en GPU de consumo: sí, en cualquier GPU con 4 GB o más de memoria (RTX 3060, RTX 4060, RTX 4090); también en Apple Silicon mediante MLX, que es el runtime previsto.
- GPU profesionales: no requiere A100/H100; un modelo de 1B en 8 bits no justifica ese hardware salvo por agregación de muchas peticiones concurrentes.
- Opciones de despliegue: servidor de tareas del fork mlx-vlm (`python -m mlx_vlm.server --embedding-model` o `--reranker-model` apuntando al directorio). Otros runtimes como vLLM, llama.cpp, Ollama o TGI no están documentados para estos pesos en formato MLX.
- Latencia y throughput: no disponibles; no se publican medidas de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dimension de embedding | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|---|
| Nemotron-3.5-Embed-1B-mlx-8bit (esta ficha) | 1,14B | no disponible | 2048 | safetensors MLX, 8 bits | openmdw-1.1 | Cuantización de 8 bits para Apple Silicon; uso textual |
| nvidia/Nemotron-3.5-Embed-1B-BF16 | 1,14B (pesos BF16) | no disponible | 2048 | safetensors BF16 | openmdw-1.1 | Modelo fuente; incluye torre de visión para recuperación multimodal; mayor huella de memoria |
| nvidia/Nemotron-3.5-Embed-8B-BF16 | 8B (estimado por el nombre; no confirmado en la información) | no disponible | no disponible | safetensors BF16 | no disponible en la información | Componente de lenguaje congelado desde Nemotron-3-Embed-8B; mismo espacio de embeddings que su predecesor de texto |
| gte-modernbert-base | no disponible | no disponible | no disponible | no disponible | no disponible | Referencia usada en el estudio Premisa; el modelo cuantizado iguala sus cifras de aciertos entregados |

## Limitaciones y advertencias

- Es un modelo de embeddings, no un LLM: no genera texto, no razona, no ejecuta herramientas ni soporta instrucciones conversacionales.
- La cuantización a 8 bits puede introducir degradación en la similitud de embeddings; el autor solo verifica paridad con gte-modernbert-base en un corpus inglés de 230 preguntas, no en otros dominios ni idiomas.
- El estudio de evaluación es limitado (inglés, 230 preguntas, chunks de 2000 caracteres, pool 50) y el propio autor lo califica como medición previa a adjudicación, no como afirmación de calidad.
- La cobertura multilingüe se hereda del modelo fuente pero no se ha medido en esta variante; el rendimiento en castellano u otros idiomas distintos del inglés no está validado.
- La torre de visión no se usa en esta cuantización: no sirve para recuperar sobre imágenes de documentos, solo sobre texto.
- Es obligatorio usar los prefijos `query: ` y `passage: `; omitirlos degrada la calidad de la recuperación de forma no cuantificada.
- La licencia openmdw-1.1 se hereda del modelo fuente; conviene revisar sus términos antes de un uso comercial, ya que la model card la etiqueta como `other`.
- Dependencia de un fork específico de mlx-vlm (`ivan-avramov/mlx-vlm`) para el loader de embeddings `mistral3`; no hay soporte documentado en vLLM, llama.cpp, Ollama o TGI.
- Riesgo de alucinación no aplica al modelo en sí, pero sí al sistema RAG que lo use: un recuperador con falsos positivos propaga contexto irrelevante al generador.
- Sesgos: no documentados en la información disponible; al heredarse del modelo fuente y de sus datos de entrenamiento, no pueden descartarse sesgos de dominio o de representación lingüística.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin revisión independiente de terceros.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/caslca/Nemotron-3.5-Embed-1B-mlx-8bit
- Modelo fuente: https://huggingface.co/nvidia/Nemotron-3.5-Embed-1B-BF16
- Nemotron-3.5-Embed-8B-BF16 (misma familia): https://huggingface.co/nvidia/Nemotron-3.5-Embed-8B-BF16
- Ficha en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3_5-embed-1b
- Referencia de API de NVIDIA: https://docs.api.nvidia.com/nim/reference/nvidia-nemotron-3_5-embed-1b
- Pagina de modelos Nemotron de NVIDIA: https://developer.nvidia.com/topics/ai/nemotron
- Proveedor en OpenRouter: https://openrouter.ai/nvidia/nemotron-3.5-embed-1b:free
- Texto de la licencia openmdw-1.1: https://openmdw.ai/license/1-1/

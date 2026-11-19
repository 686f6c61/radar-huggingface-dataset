# henriquegalvao/lumi-4b-embedding

## Resumen

Lumi-Embed (publicado como `henriquegalvao/lumi-4b-embedding`) es un modelo de embeddings de texto en desarrollo derivado de `ceia-research/lumi-4b`, un LLM de 4.000 millones de parámetros con arquitectura híbrida Mamba-2 + atención orientado al portugués brasileño. El autor lo convierte en un encoder de frases mediante fine-tuning con sentence-transformers, empleando pooling del último token (EOS), normalización L2 y similitud de coseno sobre una dimensión de 3136. El repositorio se encuentra en estado embrionario: no hay pesos publicados (tamaño del repo 0,0 GB) ni resultados de evaluación de embeddings.

La relevancia del proyecto es metodológica: según su model card, constituye una de las primeras evaluaciones de un transformer híbrido Mamba-Transformer como embedder de texto, con un protocolo de entrenamiento contrastivo por etapas (débilmente supervisado seguido de supervisado con negativos duros positivos) y una política de contaminación zero-shot limpia. El backbone tiene 42 capas (21 Mamba-2, 17 MLP y 4 de atención), sin RoPE, y deriva del Nemotron 3 Nano 4B.

El modelo se distribuye bajo licencia "other" con nombre "pendente" (pendiente), lo que en la práctica impide el uso comercial hasta que se aclare. Los idiomas declarados son portugués brasileño (principal) e inglés. El contexto de entrenamiento es de 512 tokens en las etapas S1/S2, con un checkpoint separado que extiende hasta 8k.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2 + atención (42 capas: 21 Mamba-2, 17 MLP, 4 de atención; sin RoPE); derivada de Nemotron 3 Nano 4B |
| Parametros totales | 4B (heredados de `ceia-research/lumi-4b`) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 512 tokens en entrenamiento (S1/S2); checkpoint de contexto largo hasta 8k |
| Tipos de cuantizacion | no disponible (la model card solo menciona carga en `bfloat16`) |
| Idiomas soportados | Portugués brasileño (principal) e inglés |
| Licencia | other / "pendente" (pendiente de definir) |
| Formato de pesos | no disponible (repo de 0,0 GB, sin checkpoints publicados) |
| Dimension de embedding | 3136 |
| Pooling | Último token (`</s>`) tras normalización final, L2, similitud de coseno |
| Formato de entrada | Query: `Instruct: {instrucción}\nQuery: {query}</s>`; documento: `{texto}</s>` sin instrucción |
| Librería | sentence-transformers |
| Carga nativa | transformers >= 5.23 (`NemotronHModel`), sin `trust_remote_code` |

## Arquitectura y entrenamiento

El backbone es un transformer híbrido que combina capas Mamba-2 (modelo de espacio de estados) con capas de atención clásicas, sin RoPE, en una proporción de 21 capas Mamba-2 frente a 4 de atención y 17 MLP. Sobre él se aplica un cabezal de embeddings que toma el estado oculto del último token (`</s>`) tras la normalización final y lo normaliza con L2. El autor contempla una variante bidireccional con pooling por media como ablación. La carga se realiza de forma nativa con `NemotronHModel` en transformers >= 5.23, y opcionalmente con kernels Mamba-2 optimizados (`pip install kernels`, CUDA, torch 2.12).

El entrenamiento es contrastivo por etapas: una fase débilmente supervisada seguida de una fase supervisada con negativos duros "conscientes de positivos" (positive-aware hard negatives). Los datos incluyen pares sintéticos nativos en PT-BR generados por tres generadores abiertos, además de pares naturales, con datasets declarados como `wikimedia/wikipedia`, `unicamp-dl/mmarco`, `HuggingFaceFW/fineweb-2`, `HuggingFaceFW/fineweb-edu`, `sentence-transformers/gooaq`, `all-nli`, `parallel-sentences-talks` y `parallel-sentences-tatoeba`. Se aplica fusión de checkpoints (merging) y selección sobre un conjunto de desarrollo reservado. La evaluación prevista cubre MTEB-BR (22 tareas nativas), MTEB-PT, LongEmbed y MTEB (inglés, v2).

Un hallazgo técnico relevante documentado por el autor es la medición de la ventana efectiva del backbone mediante *needle-in-a-haystack* en PT-BR (2.610 prompts por modelo, de 2k a 255k tokens). El Lumi-4B recupera con una aguja hasta 32k, pero colapsa a 16k en multi-clave y multi-valor, mientras que el Nemotron-3-Nano-4B base mantiene 255k y 128k respectivamente. El autor atribuye la pérdida al preentrenamiento continuo en ventanas de 8k, lo que justifica entrenar el embedder a 512 tokens y extender el contexto en un estadio separado (C3-long).

## Capacidades

- Generación de embeddings de texto para recuperación (retrieval) y búsqueda semántica, con dimensión 3136 y similitud de coseno.
- Soporte de instrucciones por consulta mediante el prefijo `Instruct: {instrucción}\nQuery: {query}</s>`, con documentos sin instrucción.
- Capacidad multilingüe limitada a portugués brasileño (principal) e inglés.
- Evaluación prevista en tareas MTEB-BR, MTEB-PT, LongEmbed y MTEB inglés v2.
- Extensión de contexto hasta 8k tokens mediante checkpoint específico (C3-long).
- Carga nativa en transformers >= 5.23 sin `trust_remote_code`, y compatibilidad con sentence-transformers.
- Soporte opcional de kernels Mamba-2 optimizados para inferencia en CUDA.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo thinking: es un modelo de embeddings, no un LLM generativo de propósito general.

## Casos de uso

- Búsqueda semántica en portugués brasileño: indexar un corpus documental con embeddings de documentos y consultar con el prefijo de instrucción, aprovechando el entrenamiento específico en PT-BR y MTEB-BR.
- Recuperación aumentada (RAG) sobre documentación técnica en portugués: generar embeddings de fragmentos de hasta 512 tokens y recuperar los pasajes más similares para alimentar un LLM generador.
- Búsqueda de preguntas frecuentes y atención al cliente: comparar la consulta del usuario con un banco de respuestas preindexado mediante similitud de coseno, con instrucción de recuperación de pasajes que respondan a la pregunta.
- Deduplicación y agrupamiento de documentos: calcular embeddings de artículos o tickets y agrupar por similitud para detectar duplicados o temas recurrentes en corpus en portugués.
- Filtrado y reranking en pipelines de datos: usar el modelo como primera etapa de recuperación sobre candidatos y reordenar por similitud antes de un reranker más costoso.
- Evaluación comparativa de arquitecturas híbridas: emplear los checkpoints intermedios (ramas con nombre, p. ej. `revision="C2"`) para estudiar el comportamiento de un backbone Mamba-Transformer como embedder en experimentos de investigación.
- Recuperación en contextos largos: usar el checkpoint C3-long (hasta 8k tokens) para documentos que exceden la ventana estándar de 512 tokens, con la cautela de la ventana efectiva medida del backbone.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que aún no hay resultados de embedding y que las tablas de evaluación contienen celdas "—" para lo no ejecutado. El único dato medido y publicado es la ventana efectiva del backbone en *needle-in-a-haystack*:

| Modelo | L\* (1 aguja) | L\* (multi-clave) | L\* (multi-valor) |
|---|---|---|---|
| Lumi-4B | 32k | 16k | 16k |
| Nemotron-3-Nano-4B (base) | 255k | 255k | 128k |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 4B parámetros en `bfloat16` se requieren aproximadamente 8 GB solo para pesos, más memoria para activaciones y el estado de las capas Mamba-2.
- GPU recomendadas: no especificadas por el autor; por tamaño, una GPU con 16-24 GB (RTX 4090, A10, L4) resulta suficiente para bfloat16 en batches moderados, y A100/H100 para mayor throughput.
- Cabe en GPU de consumo: previsiblemente sí en RTX 4090 (24 GB) y en tarjetas de 16 GB con batches pequeños; no confirmado por el autor.
- Opciones de despliegue: sentence-transformers y transformers >= 5.23 de forma nativa; kernels Mamba-2 opcionales vía `pip install kernels` (CUDA, torch 2.12). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| lumi-4b-embedding | 4B | 512 (hasta 8k en C3-long) | pt, en | other / pendente | Sin pesos publicados ni benchmarks |
| `ceia-research/lumi-4b` (base) | 4B | ventana efectiva 16k-32k según prueba NIAH | pt (principal) | no disponible en la información | Publicado como LLM base |
| Nemotron-3-Nano-4B | 4B | 255k (1 aguja), 128k (multi-valor) | no disponible | no disponible | Modelo base de referencia |

No se dispone de datos de benchmarks para comparar el rendimiento de recuperación con otros embedders de la misma categoría.

## Limitaciones y advertencias

- El repositorio está en desarrollo: no contiene pesos publicados (0,0 GB) ni resultados de evaluación de embeddings; no es utilizable en producción en su estado actual.
- Licencia "other" con nombre "pendente": las condiciones de uso comercial no están definidas, por lo que no debe asumirse permiso de uso comercial.
- Ventana efectiva limitada del backbone: colapsa a partir de 64k tokens y confunde claves y valores ya en 32k; el entrenamiento del embedder se limita a 512 tokens, con extensión a 8k solo en un checkpoint específico.
- Riesgo de alucinación no aplica directamente al ser un modelo de embeddings, pero la calidad de recuperación depende de la ventana efectiva y de los datos de entrenamiento, aún no evaluados.
- Cobertura lingüística restringida a portugués brasileño e inglés; no se documenta soporte de otras lenguas ni de variantes europeas del portugués.
- No se documentan sesgos conocidos ni resultados de evaluación de sesgo en la información disponible.
- La evaluación zero-shot con política de contaminación limpia está planificada pero no ejecutada, por lo que no hay evidencia publicada de su calidad en MTEB-BR, MTEB-PT, LongEmbed ni MTEB inglés.
- Requiere transformers >= 5.23 para carga nativa; versiones anteriores pueden no soportar `NemotronHModel`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/henriquegalvao/lumi-4b-embedding
- Modelo base: https://huggingface.co/ceia-research/lumi-4b
- Repositorio de código y recetas: https://github.com/henriquegalva0/lumi-to-emb
- Plan de experimentos (PDF): https://github.com/henriquegalva0/lumi-to-emb/blob/main/docs/embed/plano_experimento.pdf
- Data card: https://github.com/henriquegalva0/lumi-to-emb/blob/main/docs/embed/DATA_CARD.md
- Informe de la etapa 1 (ventana de contexto): https://github.com/henriquegalva0/lumi-to-emb/blob/main/docs/stage1/README.md

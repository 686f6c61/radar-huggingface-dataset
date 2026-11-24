# GeorgeCU/Giga-Embeddings-instruct-3B-0826-ft-2.0

## Resumen

Giga-Embeddings-instruct-3B-0826-ft-2.0 es un adaptador LoRA publicado por el usuario GeorgeCU sobre el modelo de embeddings `ai-sage/Giga-Embeddings-instruct-3B-0826`, desarrollado por el equipo de ai-sage (GigaChat, Sber). El adaptador se ha afinado sobre documentos abiertos del sitio web del Banco Central de la Federación Rusa (ЦБ РФ), cubriendo 22 dominios temáticos, y está especializado en tareas de recuperación (retrieval), clasificación, clustering y similitud semántica de textos (STS) en ruso dentro del sector financiero y bancario.

El modelo base es un encoder de 3B parámetros orientado a instrucciones para generación de embeddings, con pipeline declarado `sentence-similarity`. El adaptador se distribuye en formato PEFT (LoRA) con pesos en safetensors y un tamaño de repositorio de aproximadamente 0,1 GB, lo que indica que solo contiene los pesos del adaptador y no el modelo completo. Para usarlo es necesario cargar primero el modelo base.

La relevancia de esta ficha es acotada: se trata de un ajuste de dominio muy específico (documentación regulatoria del banco central ruso) con cero descargas y cero likes en el momento de la consulta, licencia no declarada e idiomas no declarados. Es útil como ejemplo de adaptación LoRA de un encoder de embeddings a un corpus financiero concreto, pero no debe considerarse un modelo de propósito general ni un artefacto listo para producción sin validación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (modelo base de embeddings); adaptador LoRA sobre el modelo base |
| Parametros totales | 3B en el modelo base (aproximado, segun el nombre del modelo); tamano del adaptador no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible en la model card; el entrenamiento se realizo sobre corpus en ruso (documentos del Banco Central de Rusia) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (PEFT) sobre el modelo base `ai-sage/Giga-Embeddings-instruct-3B-0826`, un encoder de embeddings de 3B parámetros diseñado para generar representaciones vectoriales de texto a partir de instrucciones. El adaptador modifica los pesos del modelo base mediante matrices de bajo rango, lo que permite un ajuste eficiente en memoria y un almacenamiento reducido (0,1 GB de repositorio). No se dispone de información sobre el rango del adaptador, los módulos objetivo ni los hiperparámetros de entrenamiento.

El entrenamiento se realizó sobre documentos abiertos del sitio web del Banco Central de Rusia, organizados en 22 dominios temáticos. La model card indica que se generaron pares train/validation/test por dominio (con gráficos de recuento y solapamiento entre dominios) y que se mezclaron datasets de lenguaje general para preservar el rendimiento del modelo base. No se especifica el número de tokens, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO; para un modelo de embeddings, lo habitual sería entrenamiento contrastivo con pares positivos y negativos, pero este dato no está confirmado en la información disponible. Tampoco se detallan innovaciones técnicas adicionales (atención lineal, decodificación especulativa, etc.).

## Capacidades

- Generación de embeddings de texto para similitud semántica (pipeline `sentence-similarity`).
- Recuperación de información (retrieval) sobre corpus financieros y regulatorios en ruso.
- Clasificación de textos por dominio temático (22 dominios del sitio del Banco Central de Rusia).
- Clustering de documentos financieros.
- Evaluación de similitud semántica textual (STS) en ruso.
- Soporte de instrucciones para la generación de embeddings (heredado del modelo base `instruct`).
- Capacidades multilingües: no confirmadas; el ajuste se centra en ruso.
- Tool calling / function calling: no disponible (no es un modelo generativo de chat).
- Soporte de agentes y razonamiento multi-paso: no aplicable a un encoder de embeddings.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Búsqueda semántica en documentación regulatoria: indexar los documentos del Banco Central de Rusia y recuperar fragmentos relevantes ante consultas de cumplimiento normativo, aprovechando el ajuste específico sobre los 22 dominios del corpus.
- Clasificación automática de documentos financieros: asignar comunicados, circulares o informes a su dominio temático correspondiente mediante similitud con centroides de dominio.
- Deduplicación y clustering de publicaciones regulatorias: agrupar documentos con contenido equivalente o solapado usando los embeddings del adaptador.
- Enrutamiento de consultas en un asistente financiero: decidir a qué área (banca, seguros, mercados, etc.) pertenece una pregunta del usuario antes de derivarla a un sistema de respuesta.
- Construcción de un motor RAG especializado en banca: usar el adaptador como retriever en un pipeline de generación aumentada, combinándolo con un LLM generativo para responder preguntas sobre normativa.
- Evaluación de similitud entre pares de textos financieros: comparar versiones de documentos o medir la proximidad semántica entre descripciones de productos bancarios.
- Filtrado de contenido en corpus financieros: detectar documentos fuera de dominio o duplicados antes de incorporarlos a un pipeline de datos.

## Benchmarks y rendimiento

La model card incluye gráficos (no tablas numéricas) con los siguientes resultados, sin cifras textuales extraíbles:

- MRR@10 en el conjunto de test sobre los 22 dominios del Banco Central de Rusia, comparando antes y después del ajuste.
- Resultados en MTEB (rus, v1.1) en tres puntos: sin ajuste, a principios de septiembre y en la fecha actual del autor.
- Métricas de validación durante el entrenamiento.

No se han publicado resultados numéricos de benchmarks en la información disponible; las cifras solo aparecen en imágenes no transcritas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un encoder de 3B parámetros en fp16 requiere del orden de 6-8 GB solo para pesos, más memoria para activaciones y batch; el adaptador LoRA añade una sobrecarga mínima.
- GPU recomendadas: no disponibles. Por tamaño del modelo base, serían razonables GPUs con 16 GB o más de VRAM (RTX 4090, A100, H100) para fp16, aunque este dato no está confirmado por el autor.
- Compatibilidad con GPU de consumo: probable en GPUs con al menos 16 GB de VRAM en fp16, o menos si se cuantiza el modelo base; no verificado.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base con `transformers` + `peft`. Para servir embeddings a escala se podría exportar a formatos compatibles con vLLM, TGI o similar, pero no hay documentación del autor al respecto. llama.cpp/Ollama no son opciones directas para este artefacto sin conversión adicional.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Giga-Embeddings-instruct-3B-0826-ft-2.0 (este) | 3B (base) + LoRA | no disponible | Encoder de embeddings afinado a dominio financiero ruso | no disponible | Hugging Face (0 descargas) |
| ai-sage/Giga-Embeddings-instruct-3B-0826 (base) | 3B | no disponible | Encoder de embeddings con instrucciones | no disponible | Hugging Face |
| Otros modelos de embeddings de 3B | no disponible | no disponible | Encoder de embeddings | varía | varía |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la comparativa se limita a parámetros y tipo de artefacto.

## Limitaciones y advertencias

- El artefacto es un adaptador LoRA, no un modelo completo: requiere descargar y cargar el modelo base `ai-sage/Giga-Embeddings-instruct-3B-0826` para funcionar.
- Licencia no declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor o consultar la licencia del modelo base antes de usarlo en producción.
- Idiomas no declarados formalmente; el ajuste se ha realizado sobre corpus en ruso, por lo que el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea inferior al del modelo base sin ajustar.
- Especialización estrecha: el adaptador está entrenado sobre documentos del Banco Central de Rusia y puede degradar el rendimiento en dominios ajenos al financiero-regulatorio ruso, aunque el autor afirma haber mezclado datos generales para mitigarlo.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni validación independiente.
- Riesgo de sesgo derivado del corpus: los documentos regulatorios de una única institución pueden introducir sesgos temáticos y de estilo.
- No es un modelo generativo: no soporta tool calling, agentes ni razonamiento multi-paso; su uso se limita a representaciones vectoriales.
- No se han publicado cifras numéricas de benchmarks en texto, solo gráficos, lo que dificulta la verificación objetiva del rendimiento.
- Fecha de creación declarada (2026-11-24) posterior a la fecha habitual de consulta; conviene verificar la integridad y procedencia del repositorio antes de su uso.

## Enlaces

- Hugging Face: https://huggingface.co/GeorgeCU/Giga-Embeddings-instruct-3B-0826-ft-2.0
- Modelo base: https://huggingface.co/ai-sage/Giga-Embeddings-instruct-3B-0826
- Sitio del Banco Central de Rusia (corpus de entrenamiento): https://www.cbr.ru/
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.

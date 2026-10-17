# DataScience-UIBK/Agent-uibk-v1

## Resumen

Agent-UIBK-v1 es un modelo de recuperación (retriever) de 149.015.808 parámetros desarrollado por el grupo Data Science de la Universidad de Innsbruck. Está diseñado específicamente para agentes de investigación profunda (*deep research*): a diferencia de un buscador convencional, que recibe la pregunta del usuario, este modelo lee el razonamiento interno del agente junto con la consulta de búsqueda que este escribe en cada turno, siguiendo el formato introducido por AgentIR (`Reasoning: <razonamiento> / Query: <consulta>`).

Técnicamente es un *fine-tuning* de UIBK-Embedding-v1 que conserva su diseño híbrido: un único codificador ModernBERT produce a la vez representaciones de interacción tardía (ColBERT, multi-vector) y representaciones densas, ambas almacenadas en una lista de vectores de 128 dimensiones, de modo que un solo cálculo de MaxSim suma las dos puntuaciones. Se carga como modelo ColBERT de PyLate y es compatible con cualquier índice PLAID.

Su relevancia actual radica en que alcanza un 72,41 % de precisión en BrowseComp-Plus como herramienta de búsqueda de gpt-oss-120b (con `search` y `get_document`), a la altura de Agent-ModernColBERT (72,53 %) y por delante de AgentIR-4B en el modo de solo búsqueda, pese a tener 22 veces menos parámetros. La model card declara "179M" parámetros, mientras que el recuento real de los pesos en safetensors es de 149.015.808.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador transformer ModernBERT con recuperación de interacción tardía (ColBERT, multi-vector) y recuperación densa en el mismo encoder; vectores de 128 dimensiones |
| Parametros totales | 149.015.808 según safetensors; la model card declara "179M" (discrepancia no explicada por el autor) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens (consultas compuestas por razonamiento más consulta, y documentos) |
| Tipos de cuantizacion | no disponible (no documentados en la model card) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repositorio: 0,7 GB) |

## Arquitectura y entrenamiento

La arquitectura parte de UIBK-Embedding-v1, un codificador ModernBERT que sostiene dos cabezas de recuperación dentro del mismo modelo: una de interacción tardía estilo ColBERT y otra densa. Ambas salidas se almacenan en una única lista de vectores de 128 dimensiones, de forma que la puntuación final se obtiene con un MaxSim estándar que suma las contribuciones de las dos representaciones. Esto permite usar el modelo como un ColBERT convencional (carga mediante PyLate, indexación con PLAID/FastPLAID) sin renunciar a la señal densa.

El entrenamiento consiste en un *fine-tuning* supervisado del modelo base sobre datos de búsqueda agéntica: los conjuntos declarados son `Tevatron/AgentIR-data` y `Yuqi-Zhou/LRAT-Train`. El formato de entrada es el de AgentIR, donde el modelo recibe el razonamiento del agente en el turno actual junto con la consulta que este genera, y debe recuperar los documentos que ese razonamiento implica. No se documentan en la model card detalles sobre número de tokens de entrenamiento, composición exacta del dataset ni el uso de RLHF o DPO. El resultado más destacable es el desplazamiento del objetivo de recuperación: de "responder a una pregunta" a "satisfacer la necesidad de información declarada implícitamente en una cadena de razonamiento".

## Capacidades

- Recuperación de documentos a partir de pares razonamiento más consulta, en el formato `Reasoning: ... / Query: ...` de AgentIR.
- Recuperación multi-vector con interacción tardía (ColBERT) combinada con recuperación densa en una sola pasada del encoder.
- Compatibilidad con índices PLAID y con la librería FastPLAID para búsqueda a gran escala.
- Carga directa como modelo de `sentence-similarity` y `feature-extraction` en sentence-transformers y PyLate.
- Etiqueta `text-embeddings-inference` y `endpoints_compatible`: puede servirse mediante Text Embeddings Inference y endpoints compatibles.
- Procesamiento de entradas largas: hasta 2048 tokens tanto en la consulta (razonamiento más consulta) como en el documento.
- Uso como herramienta de búsqueda dentro de bucles agénticos con llamadas repetidas (media de 13,37 llamadas a `search` y 2,58 a `get_document` por pregunta en el escenario evaluado).
- Idiomas: únicamente inglés. No se declaran capacidades multilingües.
- No es un modelo generativo: no produce texto, solo representaciones y puntuaciones de relevancia.

## Casos de uso

- Agentes de investigación profunda (*deep research*): el modelo actúa como herramienta de búsqueda dentro del bucle de razonamiento de un LLM. Es su escenario nativo: recibe el razonamiento del turno y la consulta derivada, y devuelve los pasajes relevantes para continuar la cadena. En BrowseComp-Plus fue usado así con gpt-oss-120b y logró un 72,41 % de precisión.
- Recuperación aumentada multi-turno con reformulación de consultas: en lugar de indexar la pregunta original del usuario, se pasa el contexto acumulado de la conversación en el campo de razonamiento. El modelo está entrenado para tolerar consultas cortas y ambiguas acompañadas de contexto, algo habitual en diálogos largos.
- Recuperación de evidencia para verificación de afirmaciones: gracias a la combinación de señal densa y multi-vector, resulta adecuado para localizar pasajes concretos que respalden o refuten una afirmación, con nDCG@10 de evidencia de 24,78 en BrowseComp-Plus frente a 20,26 de Qwen3-Embedding-8B.
- Búsqueda sobre corpus web fijos y de gran tamaño: el modelo se evaluó sobre un corpus de 100.195 documentos web con un índice PLAID, lo que lo hace apto para réplicas de corpus tipo Common Crawl o archivos documentales empresariales.
- Sustitución de BM25 o de embeddings densos grandes en pipelines existentes: con 149M de parámetros y una sola GPU consumer, ofrece mejor precisión que BM25 (29,16 %) y que Qwen3-Embedding-8B en modo agéntico (44,10 %) a una fracción del coste de inferencia.
- Evaluación de agentes y *benchmarking* interno: permite medir la calidad de la recuperación desacoplada del LLM generador, útil para diagnosticar si los fallos de un agente provienen del buscador o del modelo de razonamiento.
- Indexación y búsqueda en entornos con recursos limitados: al ocupar 0,7 GB en disco y caber en CPU, es viable para prototipos, entornos de desarrollo y despliegues en el borde donde no hay GPU disponible.
- Deduplicación y agrupación semántica de documentos: al exponer una representación densa además de la multi-vector, puede reutilizarse para similitud de frases y eliminación de duplicados en corpus en inglés.

## Benchmarks y rendimiento

Resultados en BrowseComp-Plus: 830 preguntas difíciles sobre un corpus fijo de 100.195 documentos web, recuperación de los 5 mejores resultados con fragmentos de 512 tokens, y precisión juzgada por Qwen3-32B. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de generación, porque el modelo no genera texto.

| Retriever | Tamaño | Herramientas | Precisión (%) | Recall (%) | Llamadas a search | Llamadas a get_document | Error de calibración (%) |
|---|---|---|---|---|---|---|---|
| Agent-ModernColBERT | 149M | search + get_document | 72,53 | 72,84 | 15,85 | 2,50 | 22,07 |
| Agent-UIBK-v1 | 179M (declarado; 149M real) | search + get_document | 72,41 | 71,25 | 13,37 | 2,58 | 24,16 |
| Reason-ModernColBERT | 149M | search + get_document | 61,20 | 60,84 | 13,87 | 1,97 | 32,45 |
| GTE-ModernColBERT-v1 | 149M | search + get_document | 58,92 | 57,99 | 13,29 | 1,76 | 32,84 |
| AgentIR-4B | 4B | search | 66,99 | 78,13 | 24,08 | — | 22,55 |
| Agent-UIBK-v1 | 179M (declarado; 149M real) | search | 64,10 | 72,92 | 18,28 | — | 27,58 |
| Agent-ModernColBERT | 149M | search | 63,86 | 74,84 | 21,49 | — | 25,55 |
| UIBK-Embedding-v1 | 179M | search | 59,04 | 68,07 | 19,56 | — | 29,74 |
| Reason-ModernColBERT | 149M | search | 59,04 | 68,64 | 18,87 | — | 30,07 |
| GTE-ModernColBERT-v1 | 149M | search | 55,66 | 66,94 | 17,51 | — | 31,02 |
| Qwen3-Embedding-8B | 8B | search | 44,10 | 52,63 | 18,35 | — | 39,32 |
| BM25 | — | search | 29,16 | 35,50 | 19,45 | — | 45,92 |

Datos adicionales declarados por el autor: el modelo lidera la tabla de solo recuperación (*retrieval-only*) de BrowseComp-Plus en 6 de sus 8 métricas, con nDCG@10 de evidencia de 24,78. Las cifras de los modelos comparados proceden del leaderboard público (octubre de 2026); las filas de UIBK son ejecuciones propias. El propio autor advierte que, entre dos *fine-tunings* propios de calidad casi idéntica, unas 160 de las 830 preguntas fueron resueltas por una ejecución y no por la otra, por lo que diferencias de uno a tres puntos entran dentro de la variación entre ejecuciones.

## Requisitos de hardware

- Huella de memoria reducida: 149.015.808 parámetros. En fp32 ocupa aproximadamente 0,6 GB; en bf16/fp16, unos 0,3 GB; el repositorio completo pesa 0,7 GB.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU o CPU para lotes pequeños. No requiere A100 ni H100 para la inferencia del modelo.
- El cuello de botella real no es el encoder, sino el índice PLAID: el coste de memoria y latencia depende del tamaño del corpus indexado (100.195 documentos en la evaluación publicada).
- Opciones de despliegue: PyLate (carga nativa como modelo ColBERT), FastPLAID para indexación y búsqueda, sentence-transformers para uso como modelo de similitud, y Text Embeddings Inference (el modelo lleva la etiqueta `text-embeddings-inference` y `endpoints_compatible`). La model card no menciona soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card no publica mediciones de latencia ni de documentos por segundo.
- Para reproducir el escenario agéntico evaluado se necesita además un LLM capaz de emitir *tool calls* (gpt-oss-120b en el experimento original) y un juez externo (Qwen3-32B) para puntuar respuestas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión en BrowseComp-Plus | Licencia | Notas |
|---|---|---|---|---|---|
| Agent-UIBK-v1 | 149M reales (179M declarados) | 2048 tokens | 72,41 % (search + get_document); 64,10 % (solo search) | Apache 2.0 | Híbrido ColBERT más denso; lidera 6 de 8 métricas de solo recuperación |
| Agent-ModernColBERT | 149M | no disponible en la información proporcionada | 72,53 %; 63,86 % | no disponible en la información proporcionada | Referencia más directa; empatado en precisión con una pregunta de diferencia sobre 830 |
| Reason-ModernColBERT | 149M | no disponible | 61,20 %; 59,04 % | no disponible | Entrenado para razonamiento, pero muy por detrás en el escenario agéntico |
| GTE-ModernColBERT-v1 | 149M | no disponible | 58,92 %; 55,66 % | no disponible | Alternativa ColBERT de propósito general |
| AgentIR-4B | 4B | no disponible | 66,99 % (solo search) | no disponible | 22 veces más grande; supera a Agent-UIBK-v1 solo cuando no se permite `get_document` |
| Qwen3-Embedding-8B | 8B | no disponible | 44,10 % (solo search) | no disponible | 50 veces más grande y claramente peor en este escenario agéntico |
| BM25 | — | — | 29,16 % (solo search) | — | Línea base léxica; el modelo la duplica con creces |

## Limitaciones y advertencias

- Solo inglés: el campo `language` de la model card es `en` y no se declara ningún otro idioma. El rendimiento fuera del inglés no está evaluado.
- No es un modelo generativo: no responde preguntas ni redacta texto. Si se usa sin un LLM que consuma los pasajes recuperados, no produce resultados útiles.
- Requiere el formato AgentIR: fuera del patrón `Reasoning: ... / Query: ...` el comportamiento no está documentado y puede degradarse. El propio autor indica que UIBK-Embedding-v1, sin entrenamiento en razonamiento, solo alcanza el 59,04 % en el mismo escenario.
- Discrepancia de parámetros sin aclarar: la model card anuncia 179M, pero safetensors reporta 149.015.808. Conviene verificar el presupuesto de memoria real antes de dimensionar infraestructura.
- Alta varianza entre ejecuciones: el autor reconoce que unas 160 de 830 preguntas se resolvieron en una ejecución y no en otra entre modelos propios de calidad similar. Diferencias de uno a tres puntos no son significativas. No debe tomarse el 72,41 % como un valor estable de producción.
- Error de calibración del 24,16 % en el escenario con `search` y `get_document`, superior al 22,07 % de Agent-ModernColBERT. Un agente que confíe ciegamente en la recuperación puede sobreestimar su propia certeza.
- Evaluación sobre un único corpus: 100.195 documentos web y 830 preguntas. No hay evidencia de generalización a dominios especializados (legal, médico, científico) ni a corpus multilingües.
- Riesgo de sobreajuste al *benchmark*: el modelo se entrenó con datos de AgentIR y se evalúa en un escenario muy alineado con ese formato. Los resultados fuera de ese patrón de uso deben validarse por separado.
- Popularidad nula en el momento de la consulta: 0 descargas y 0 *me gusta*. No hay retroalimentación de la comunidad ni informes independientes de fallos.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, con la obligación habitual de conservar avisos de copyright y licencia. No se declaran restricciones adicionales, pero tampoco se documentan las licencias de los datasets de entrenamiento (`Tevatron/AgentIR-data`, `Yuqi-Zhou/LRAT-Train`), lo que conviene revisar antes de un despliegue comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DataScience-UIBK/Agent-uibk-v1
- Modelo base UIBK-Embedding-v1: https://huggingface.co/DataScience-UIBK/uibk-embedding-v1
- Logotipo del proyecto: https://huggingface.co/DataScience-UIBK/uibk-embedding-v1/resolve/main/assets/logo.png
- Perfil de la organización DataScience-UIBK: https://huggingface.co/DataScience-UIBK
- Leaderboard de BrowseComp-Plus: https://huggingface.co/spaces/Tevatron/BrowseComp-Plus
- Repositorio de BrowseComp-Plus: https://github.com/texttron/BrowseComp-Plus
- PyLate: https://github.com/lightonai/pylate
- FastPLAID: https://github.com/lightonai/fast-plaid
- Página del proyecto AgentIR: https://texttron.github.io/AgentIR/
- Artículo de AgentIR (arXiv 2603.04384): https://arxiv.org/abs/2603.04384
- Referencia arXiv 2604.04949: https://arxiv.org/abs/2604.04949
- Referencia arXiv 2508.06600: https://arxiv.org/abs/2508.06600
- Dataset Tevatron/AgentIR-data: https://huggingface.co/datasets/Tevatron/AgentIR-data
- Dataset Yuqi-Zhou/LRAT-Train: https://huggingface.co/datasets/Yuqi-Zhou/LRAT-Train
- Agent-ModernColBERT: https://huggingface.co/lightonai/Agent-ModernColBERT
- Reason-ModernColBERT: https://huggingface.co/lightonai/Reason-ModernColBERT
- GTE-ModernColBERT-v1: https://huggingface.co/lightonai/GTE-ModernColBERT-v1
- Qwen3-Embedding-8B: https://huggingface.co/Qwen/Qwen3-Embedding-8B
- Universidad de Innsbruck: https://www.uibk.ac.at/en/
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0

Nota: la búsqueda web realizada no devolvió ningún recurso específico sobre este modelo; los resultados obtenidos eran páginas genéricas sobre ciencia de datos y no se han incluido.

# BluePlanetAI/BPVELA-G300M

## Resumen

BPVELA-G300M es un modelo de embeddings para recuperación de información (retrieval) en chino tradicional, desarrollado por BluePlanetAI como un fine-tuning de `google/embeddinggemma-300m`. El modelo resuelve un problema concreto: la baja calidad de la recuperación semántica en chino tradicional de los modelos multilingües genéricos, que rinden peor en dominios y variantes lingüísticas específicas. Con 302.863.104 parámetros y embeddings de 768 dimensiones, se distribuye como pesos completos cargables directamente con `sentence-transformers`, sin necesidad de PEFT.

La relevancia del modelo radica en su metodología de entrenamiento: parte de datos en chino tradicional (Taiwan.md y Wikipedia zh-tw) y genera consultas sintéticas con un Gemma 4 26B-A4B desplegado localmente, filtrando únicamente las consultas difíciles que el modelo base no lograba situar en primera posición pero sí en el top-10. Además, interpola los pesos del modelo ajustado con los del base (WiSE-FT, α = 0.5) para conservar las capacidades generales de recuperación.

La versión v2.0 corrige los fallos de la v1.0.0, que rendía muy por debajo del modelo base (nDCG@10 de 0.0451 frente a 0.8963 en DRCD). La v2.0 supera al base en la mayoría de las evaluaciones públicas en chino tradicional, con mejoras de entre +0.8 % y +2.7 % en nDCG@10, y solo retrocede ligeramente en MIRACL zh (−2.1 %). La longitud máxima de secuencia es de 512 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (Gemma 3 text), fine-tuning de `google/embeddinggemma-300m` |
| Parametros totales | 302.863.104 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (longitud máxima de secuencia) |
| Tipos de cuantizacion | no disponible; el autor advierte de no usar float16 (produce resultados incorrectos), recomienda float32 o bfloat16 |
| Idiomas soportados | chino (tradicional `zho_Hant` y simplificado `zho_Hans`), inglés |
| Licencia | Gemma Terms of Use (Model Derivative de `google/embeddinggemma-300m`) |
| Formato de pesos | safetensors (compatible con `sentence-transformers`); repo de 1.3 GB |

## Arquitectura y entrenamiento

El modelo es un encoder transformer derivado de Gemma 3 text, con 302,8 millones de parámetros y salida de embeddings de 768 dimensiones. Se carga como modelo completo mediante `sentence-transformers` y expone `prompt_name="query"` y `prompt_name="document"`, que anteponen los prefijos de recuperación de EmbeddingGemma (`task: search result | query: ` y `title: none | text: `). Incluye dos capas Dense de proyección que también se actualizaron durante el ajuste.

El entrenamiento se realizó con LoRA (r 16, alpha 32, aplicado a las capas de atención), `CachedMultipleNegativesRankingLoss` (scale 20), batch de 64, learning rate 2e-5 y 2 épocas. Los datos provienen de Taiwan.md (commit `256f584`, 2026-10-27, CC BY-SA 4.0) y de artículos aleatorios de Wikipedia en chino tradicional con conversión de términos MediaWiki zh-tw (CC BY-SA 4.0). Las consultas se generaron con un Gemma 4 26B-A4B local (Apache 2.0) a partir de párrafos, cubriendo formulaciones factuales, de causa/método, de palabras clave, coloquiales y descriptivas de escenario. Solo se conservaron las consultas difíciles que el modelo base no situaba en primera posición pero sí en el top-10, con negativos difíciles tomados de los párrafos de otros artículos presentes en el top-10 del base. La selección de checkpoint se hizo con dev sets de DRCD y Taiwan.md. Finalmente, los pesos se interpolaron con los del modelo base mediante WiSE-FT (α = 0.5; Wortsman et al., 2022), con el LoRA ya fusionado en los pesos.

## Capacidades

- Generación de embeddings de texto para búsqueda semántica y recuperación (retrieval) en chino tradicional e inglés.
- Recuperación de documentos y pasajes (retrieval-first RAG) con prefijos diferenciados para consulta y documento.
- Similitud semántica entre frases y pasajes, con soporte de títulos de documento en el prefijo (`title: {標題} | text: {內文}`).
- Capacidades multilingües limitadas a chino (tradicional y simplificado) e inglés.
- Compatibilidad con Text Embeddings Inference (tag `text-embeddings-inference`) y endpoints compatibles.
- No soporta tool calling, agentes ni generación de texto: es exclusivamente un modelo de embeddings.

## Casos de uso

- RAG sobre documentación en chino tradicional: el modelo indexa pasajes y genera embeddings de consulta para recuperar los fragmentos relevantes antes de pasarlos a un LLM generador, con la ventaja de que supera al modelo base en nDCG@10 en DRCD y Belebele `zho_Hant`.
- Búsqueda semántica en bases de conocimiento taiwanesas: adecuado para corpus de Taiwan.md y Wikipedia zh-tw, los dominios de entrenamiento, con un nDCG@10 de 0.8687 en el test held-out de Taiwan.md.
- Sistemas de preguntas y respuestas sobre legislación o prensa en chino tradicional: el modelo maneja formulaciones coloquiales y descriptivas de escenario, gracias a la diversidad de consultas sintéticas generadas durante el entrenamiento.
- Deduplicación y agrupación de documentos: los embeddings de 768 dimensiones permiten calcular similitud coseno para agrupar artículos o detectar duplicados en corpus zh-tw.
- Recuperación híbrida en pipelines de atención al cliente: combinable con búsqueda léxica (BM25) para consultas en chino tradicional, con la ventaja de que el modelo conserva las capacidades generales del base por la interpolación WiSE-FT.
- Filtrado de candidatos en motores de búsqueda verticales: con 512 tokens de contexto por pasaje, es adecuado para indexar fragmentos de artículos, FAQ o fichas de producto y recuperar los más relevantes para una consulta.

## Benchmarks y rendimiento

Resultados en nDCG@10, en fp32, max_length 512 y con los prefijos de recuperación de EmbeddingGemma; tareas MTEB con `mteb` 2.12.25. Todas las evaluaciones públicas son zero-shot para este modelo.

| Evaluacion | embeddinggemma-300m | v1.0.0 | v2.0 |
|---|---|---|---|
| BelebeleRetrieval `zho_Hant` | 0.9480 | 0.0609 | 0.9554 (+0.8 %) |
| DRCD test (3.493 preguntas, 1.000 parrafos) | 0.8963 | 0.0451 | 0.9098 (+1.5 %) |
| DRCD test contra los 10.013 parrafos de DRCD | 0.7642 | no disponible | 0.7846 (+2.7 %) |
| Taiwan.md test held-out (150 articulos revisados) | 0.8509 | 0.0195 | 0.8687 (+2.1 %) |
| MIRACLRetrieval `zh` | 0.4626 | no disponible | 0.4529 (−2.1 %) |
| BelebeleRetrieval `zho_Hans` (suplementario) | 0.9524 | no disponible | 0.9571 (+0.5 %) |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en fp32 para los pesos completos (302,8 M de parámetros); en bfloat16, alrededor de 0,6 GB. El autor desaconseja float16 por producir resultados incorrectos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp32; una RTX 4090, A100 o H100 no son necesarias para este tamaño, pero permiten mayor throughput en indexación por lotes.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 2 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3060, RTX 4060).
- Opciones de despliegue: `sentence-transformers` (librería nativa), Text Embeddings Inference (tag `text-embeddings-inference`) y endpoints compatibles.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | nDCG@10 (DRCD) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BPVELA-G300M (v2.0) | 302,8 M | 512 | 0.9098 | Gemma Terms of Use | Hugging Face |
| google/embeddinggemma-300m | 300 M aprox. | 512 | 0.8963 | Gemma Terms of Use | Hugging Face |
| BPVELA-G300M (v1.0.0) | 302,8 M | 256 (config. de evaluacion) | 0.0451 | Gemma Terms of Use | Hugging Face (tag `v1.0.0`) |

No se dispone de datos de otros modelos comparables de embeddings en chino tradicional en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; el entrenamiento se limita a Taiwan.md y Wikipedia zh-tw, por lo que puede infrarrepresentar dominios especializados o variantes regionales distintas.
- Riesgo de alucinacion: no aplica directamente al ser un modelo de embeddings, pero los embeddings pueden producir similitudes engañosas en pasajes ambiguos o muy cortos.
- Limitaciones de contexto: máximo de 512 tokens por secuencia; los documentos más largos deben fragmentarse.
- Limitaciones de idioma: el rendimiento en chino simplificado es bueno en Belebele (0.9571), pero en MIRACL zh el modelo retrocede un 2.1 % respecto al base; no hay datos para otros idiomas distintos del chino y el inglés.
- Restricciones de licencia: los pesos son un Model Derivative de `google/embeddinggemma-300m` y se rigen por los Gemma Terms of Use; no se permite su uso para los fines prohibidos por la Gemma Prohibited Use Policy ni en violación de la legislación aplicable. Al redistribuir el modelo o derivados, deben incluirse estas restricciones y notificarlo a los usuarios posteriores.
- Caveat de precisión numérica: no usar float16, ya que EmbeddingGemma produce resultados incorrectos en esa precisión; usar float32 o bfloat16.
- La v1.0.0 no debe usarse: rinde muy por debajo del modelo base en todas las evaluaciones públicas.
- Los datos de entrenamiento (Taiwan.md y Wikipedia) son CC BY-SA 4.0; al citar el modelo debe atribuirse también la procedencia de los datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BluePlanetAI/BPVELA-G300M
- Modelo base: https://huggingface.co/google/embeddinggemma-300m
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
- Taiwan.md (dataset): https://github.com/frank890417/taiwan-md
- Paper WiSE-FT (Wortsman et al., 2022): no disponible en la informacion proporcionada
- Repositorio o demo adicional: no disponible en la informacion proporcionada

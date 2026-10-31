# mradermacher/Nemotron-3-Embed-1B-BF16-GGUF

## Resumen

Nemotron-3-Embed-1B-BF16-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo de embeddings de texto Nemotron-3-Embed-1B-BF16, desarrollado por NVIDIA. La versión cuantizada ha sido publicada por mradermacher, un colaborador conocido en la comunidad de Hugging Face por generar cuantizaciones GGUF de modelos populares, y ofrece desde versiones muy comprimidas (Q2_K, unos 0,6 GB) hasta la versión en precisión completa f16 (2,4 GB).

El modelo base resuelve el problema de convertir texto en vectores densos de alta calidad para tareas de recuperación de información, búsqueda semántica y RAG (Retrieval-Augmented Generation). Su principal atractivo es el soporte multilingüe, con más de 30 idiomas incluyendo castellano, árabe, chino, japonés o hindi, lo que lo hace adecuado para sistemas de búsqueda y RAG en entornos internacionales.

La relevancia de esta ficha reside en que las cuantizaciones GGUF permiten ejecutar el modelo de embeddings en hardware modesto, incluso en CPU o GPUs de consumo, facilitando su despliegue en pipelines de RAG locales o en dispositivos con recursos limitados. Con algo más de 1.140 millones de parámetros, se sitúa en la gama de modelos de embeddings compactos pero capaces.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder para embeddings de texto (detalle específico no disponible) |
| Parametros totales | 1.140.918.272 (1,14 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Multilingüe: inglés, árabe, asamés, bengalí, búlgaro, chino, danés, neerlandés, finés, francés, alemán, hindi, indonesio, italiano, japonés, coreano, malayo, maratí, nepalí, noruego, persa, portugués, rumano, ruso, español, suajili, sueco, tamil, telugu, tailandés, ucraniano, urdu, vietnamita (33 idiomas) |
| Licencia | openmdw-1.1 (Open Model Weights License, licencia "other" en Hugging Face) |
| Formato de pesos | GGUF (el modelo base nvidia/Nemotron-3-Embed-1B-BF16 usa safetensors/BF16) |

## Arquitectura y entrenamiento

El modelo base es Nemotron-3-Embed-1B-BF16 de NVIDIA, un modelo de embeddings de texto con aproximadamente 1,14 mil millones de parámetros. Por los tags del repositorio (feature-extraction, text-embeddings, retrieval, semantic-search, rag), se trata de un modelo orientado a generar representaciones vectoriales densas de texto, no de generación de lenguaje. La arquitectura subyacente es un transformer, aunque la model card del cuantizador no detalla la configuración exacta (número de capas, dimensiones del embedding, pooling utilizado).

No se dispone de información sobre los datos de entrenamiento, el número de tokens empleados, ni sobre técnicas de alineación o ajuste fino específicas en la información proporcionada. Este repositorio, además, no modifica el modelo: se limita a convertir los pesos originales en BF16 a múltiples cuantizaciones GGUF estáticas, un proceso que reduce el tamaño en disco y en memoria a cambio de una ligera pérdida de precisión, especialmente notable en las cuantizaciones más agresivas (Q2_K, Q3_K).

## Capacidades

- Generación de embeddings de texto densos para tareas de extracción de características (feature-extraction).
- Búsqueda semántica: recuperación de documentos relevantes mediante similitud vectorial.
- Retrieval y RAG: apto como componente de recuperación en sistemas de generación aumentada por recuperación.
- Soporte multilingüe: embeddings en 33 idiomas, incluido el castellano, con posibilidad de búsqueda entre idiomas (cross-lingual, sujeto a verificación con los benchmarks del modelo base).
- Compatibilidad con el ecosistema GGUF: ejecución vía llama.cpp y herramientas derivadas; el modelo base indica compatibilidad con vLLM.
- No es un modelo generativo: no produce texto, no soporta tool calling, ni agentes, ni capacidades de razonamiento.

## Casos de uso

- Pipelines de RAG locales: el modelo puede servir como componente de embeddings en sistemas RAG que se ejecutan íntegramente en local (por ejemplo, con llama.cpp o LM Studio), indexando documentos privados sin enviar datos a servicios externos.
- Búsqueda semántica multilingüe: en plataformas con contenido en varios idiomas (por ejemplo, un catálogo en español, inglés y francés), permite recuperar documentos relevantes aunque la consulta y el documento estén en idiomas distintos.
- Clasificación y clustering de documentos: los embeddings pueden alimentar clasificadores ligeros o algoritmos de clustering (k-means, HDBSCAN) para organizar corpus grandes de texto.
- Detección de duplicados y near-duplicates: comparando similitud coseno entre embeddings es posible identificar contenido duplicado en corpus de noticias, tickets de soporte o documentación técnica.
- Sistemas de recomendación basados en contenido: representar ítems textuales (descripciones de producto, artículos) como vectores y recomendar por similitud.
- Indexación en bases de datos vectoriales: generación masiva de embeddings para Qdrant, Milvus, pgvector o Chroma, con la ventaja de que las cuantizaciones Q4_K_M (0,8 GB) permiten un alto throughput en GPUs modestas.
- Búsqueda en dispositivos edge o sin GPU: las versiones Q2_K y Q3_K permiten ejecutar el modelo en CPU con pocos cientos de MB de memoria, útil para aplicaciones de escritorio o embebidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Para evaluar la calidad del modelo se recomienda consultar la model card del modelo base (nvidia/Nemotron-3-Embed-1B-BF16) y benchmarks del sector como MTEB, aunque no se incluyen aquí datos concretos para no inventar cifras.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia según cuantización: desde ~0,6 GB (Q2_K) hasta ~2,4 GB (f16). En general, basta sumar al tamaño del fichero un margen para el contexto y los buffers.
- Cabe sobradamente en GPUs de consumo: cualquier GPU con 4 GB de VRAM (RTX 3060, RTX 4060) ejecuta incluso la versión f16; las cuantizaciones Q4/Q5 funcionan incluso en GPUs de 2 GB o directamente en CPU.
- Para despliegues de alto throughput (indexación masiva de corpus), una GPU tipo RTX 4090 o una A100 acelera la generación de embeddings de millones de documentos, aunque no es necesaria para uso interactivo.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), LM Studio, Ollama (si se configura el Modelfile correspondiente) y, para el modelo base sin cuantizar, vLLM y transformers de Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un modelo de 1,14 B de parámetros, se espera una latencia baja por documento, especialmente con las cuantizaciones Q4_K_S y Q4_K_M, marcadas como rápidas y recomendadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Multilingüe | Licencia |
|---|---|---|---|---|
| Nemotron-3-Embed-1B-BF16 (base, NVIDIA) | 1,14 B | safetensors (BF16) | 33 idiomas | openmdw-1.1 |
| BGE-M3 (BAAI) | ~0,57 B | safetensors | 100+ idiomas | MIT |
| multilingual-e5-large (Microsoft/intfloat) | ~0,56 B | safetensors | ~100 idiomas | MIT |
| GTE-large (Alibaba) | ~0,44 B | safetensors | principalmente inglés | Apache 2.0 |

Nemotron-3-Embed-1B destaca por su mayor tamaño (más del doble que BGE-M3 o E5-large), lo que potencialmente se traduce en mayor calidad de embedding, a cambio de mayores requisitos de memoria. BGE-M3 y E5-large son alternativas más ligeras con amplia cobertura multilingüe y licencias permisivas (MIT), mientras que Nemotron usa la licencia openmdw-1.1, que conviene revisar para casos de uso comercial. Los datos de rendimiento comparativo no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: solo produce embeddings; cualquier tarea de generación de texto requiere un modelo LLM adicional.
- La calidad de los embeddings se degrada con cuantizaciones agresivas (Q2_K, Q3_K_M); para producción se recomienda Q4_K_M o superior, o las cuantizaciones imatrix disponibles en el repositorio hermano (Nemotron-3-Embed-1B-BF16-i1-GGUF).
- La longitud de contexto máxima no está documentada en la información disponible; verificarla antes de indexar documentos largos, ya que truncar texto afecta a la calidad del embedding.
- La licencia openmdw-1.1 es una licencia "other": no es una licencia estándar tipo Apache 2.0 ni MIT, por lo que debe revisarse el texto completo (https://openmdw.ai/license/1-1/) antes de uso comercial.
- Riesgo de alucinación no aplicable al ser un modelo de embeddings, pero una baja calidad en embeddings puede degradar silenciosamente un sistema RAG (recuperación incorrecta que el LLM posterior no puede corregir).
- Sesgos: como todo modelo entrenado con grandes corpus textuales, puede reflejar sesgos presentes en los datos de entrenamiento; no hay documentación específica de auditoría de sesgos en la información proporcionada.
- El soporte GGUF para modelos de embeddings depende de la implementación de llama.cpp; verificar que la versión utilizada soporta correctamente este modelo y su pooling antes de producción.

## Enlaces

- Repositorio cuantizado (GGUF): https://huggingface.co/mradermacher/Nemotron-3-Embed-1B-BF16-GGUF
- Modelo base de NVIDIA: https://huggingface.co/nvidia/Nemotron-3-Embed-1B-BF16
- Cuantizaciones imatrix (weighted): https://huggingface.co/mradermacher/Nemotron-3-Embed-1B-BF16-i1-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Nemotron-3-Embed-1B-BF16-GGUF
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9

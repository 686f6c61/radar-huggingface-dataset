# mradermacher/Nemotron-3-Embed-8B-BF16-GGUF

## Resumen

Nemotron-3-Embed-8B-BF16-GGUF es una colección de cuantizaciones estáticas en formato GGUF del modelo de embeddings Nemotron-3-Embed-8B-BF16 de NVIDIA, publicada por el cuantizador mradermacher. El modelo base es un modelo de embeddings de texto de unos 8.000 millones de parámetros (7.952.683.008 exactos según safetensors), orientado a tareas de recuperación de información, búsqueda semántica y RAG, con soporte multilingüe para más de 30 idiomas, incluido el castellano.

La relevancia de esta versión cuantizada radica en que permite ejecutar un modelo de embeddings de gran tamaño en hardware modesto: las versiones van desde 3,3 GB (Q2_K) hasta 16 GB (f16), lo que hace viable su uso en GPUs de consumo o incluso en CPU para indexaciones masivas de documentos. Esto es especialmente útil en pipelines de RAG, donde la calidad del modelo de embeddings condiciona directamente la calidad de la recuperación.

Cabe destacar que el modelo original de NVIDIA está entrenado para trabajar con vLLM y la librería transformers de Hugging Face, y que su licencia es openmdw-1.1 (etiquetada como "other" en Hugging Face), una licencia abierta del ecosistema OpenMDW. El modelo base en formato BF16 está disponible en el repositorio oficial de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de embeddings de texto (detalles concretos no disponibles) |
| Parametros totales | 7.952.683.008 |
| Parametros activos | no disponible (no se indica si es MoE; no aplica en principio) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 (BF16 en el modelo base) |
| Idiomas soportados | Multilingüe: en, ar, as, bn, bg, zh, da, nl, fi, fr, de, hi, id, it, ja, ko, ms, mr, ne, no, fa, pt, ro, ru, es, sw, sv, ta, te, th, uk, ur, vi |
| Licencia | openmdw-1.1 (OpenMDW 1.1) |
| Formato de pesos | GGUF (esta cuantización); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base, nvidia/Nemotron-3-Embed-8B-BF16, es un modelo de embeddings de texto basado en la familia Nemotron de NVIDIA, con 7.952.683.008 parámetros y pesos originales en BF16. La model card original no detalla en la información disponible la arquitectura interna exacta (número de capas, dimensiones del embedding, tipo de pooling) ni el proceso de entrenamiento (número de tokens, composición del dataset, uso de contrastive learning, RLHF o DPO). Lo que sí confirma la ficha es su propósito: generación de embeddings de texto para retrieval, búsqueda semántica y RAG, con compatibilidad con vLLM y transformers.

La versión aquí documentada no altera la arquitectura: mradermacher aplica cuantizaciones estáticas en formato GGUF mediante conversión desde el checkpoint de Hugging Face. Existen además cuantizaciones weighted/imatrix (con matrices de importancia) en un repositorio complementario, que suelen ofrecer mejor calidad a tamaños equivalentes que las cuantizaciones estáticas puras.

## Capacidades

- Generación de embeddings de texto (feature extraction) para representar documentos y consultas en un espacio vectorial común.
- Recuperación de información (retrieval): indexación de corpus y búsqueda de pasajes relevantes.
- Búsqueda semántica multilingüe: puede comparar consultas y documentos en más de 30 idiomas, incluido el castellano.
- Pipelines de RAG: sirve como motor de embeddings para sistemas de generación aumentada por recuperación.
- Compatibilidad con vLLM para despliegue de embeddings a escala.
- Formato GGUF: ejecución local con herramientas del ecosistema llama.cpp, con un amplio rango de niveles de cuantización.
- No genera texto conversacional: es un modelo de embeddings, no un LLM de chat.

## Casos de uso

- Sistemas RAG sobre documentación empresarial: el modelo genera embeddings de documentos y consultas para recuperar pasajes relevantes antes de pasarlos a un LLM generador; su tamaño de 8B y su soporte multilingüe lo hacen adecuado para corpus mixtos en castellano e inglés.
- Búsqueda semántica en bases de conocimiento: indexación de wikis internas, manuales técnicos o repositorios de código con búsqueda por significado en lugar de por palabras clave.
- Búsqueda cross-lingüe: permite encontrar documentos en un idioma (por ejemplo, inglés) a partir de consultas en otro (castellano), útil en organizaciones multilingües.
- Deduplicación y clustering de documentos: los embeddings permiten agrupar contenido similar a gran escala para limpieza de corpus o organización temática.
- Clasificación semántica ligera: mediante similitud coseno contra descripciones de categorías, sin necesidad de entrenar un clasificador específico.
- Recomendación de contenido: cálculo de similitud entre perfiles, artículos o productos en plataformas de recomendación.
- Despliegue en hardware de consumo: gracias a las cuantizaciones de 3,3 a 5 GB, es viable ejecutar el modelo en GPUs de gama media para prototipado local de buscadores semánticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del modelo base de NVIDIA y la de esta cuantización no incluyen métricas como MTEB, precisión de retrieval o comparativas con otros modelos de embeddings.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del fichero GGUF elegido más margen para el KV/activaciones: unos 3,3 GB para Q2_K, 4,8-5 GB para Q4_K_S/Q4_K_M, 6,6 GB para Q6_K, 8,6 GB para Q8_0 y 16 GB para f16. En CPU también es ejecutable, con menor throughput.
- GPU recomendadas: para Q4_K_M (unos 5 GB), cualquier GPU de consumo con 8 GB de VRAM es suficiente (RTX 3060, RTX 4060 Ti, RTX 4070). Para f16 (16 GB), se recomiendan RTX 4090, RTX 5090 o GPUs de datacenter (A100, L4, A10G).
- Cabe en consumer GPUs: sí, en la mayoría de cuantizaciones. Q4_K_M y niveles inferiores caben cómodamente en GPUs de 8 GB; Q8_0 requiere 12 GB o más; f16 requiere 24 GB.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio) para el formato GGUF; vLLM y transformers para el modelo base original en safetensors. La model card base indica compatibilidad con vLLM.
- Latencia y throughput estimados: no disponible. Al ser un modelo de embeddings, el rendimiento depende del batch size y la longitud de los textos; no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Nemotron-3-Embed-8B-BF16 (base, NVIDIA) | 7.952.683.008 | safetensors (BF16) | 30+ | openmdw-1.1 | Modelo original, compatible con vLLM y transformers |
| Nemotron-3-Embed-8B-i1-GGUF (mradermacher) | 7.952.683.008 | GGUF (imatrix) | 30+ | openmdw-1.1 | Cuantizaciones weighted/imatrix del mismo modelo, potencialmente mejor calidad por tamaño |
| Modelos de embeddings GGUF comparables (p. ej. embeddings de la serie Qwen3 o EmbeddingGemma) | no disponible en la informacion proporcionada | GGUF | variable | variable | Alternativas de menor tamaño para los mismos casos de uso; datos concretos no disponibles en la informacion disponible |

## Limitaciones y advertencias

- Es un modelo de embeddings, no un modelo generativo: no produce texto, no soporta chat ni tool calling.
- No se dispone de benchmarks publicados en la información proporcionada, por lo que la calidad relativa frente a otros modelos de embeddings (por ejemplo, en MTEB) no puede verificarse aquí.
- La cuantización agresiva (Q2_K, Q3_K_M) puede degradar la calidad de los embeddings y, con ello, la precisión de recuperación en RAG; se recomienda Q4_K_S/Q4_K_M como mínimo y Q6_K/Q8_0 para producción.
- La longitud máxima de contexto no está especificada en la información disponible; verificar en la model card original antes de indexar documentos largos, posiblemente con chunking.
- La licencia openmdw-1.1 es una licencia abierta del ecosistema OpenMDW, pero conviene revisar sus términos concretos (en https://openmdw.ai/license/1-1/) antes de un uso comercial.
- El repositorio ocupa 71,3 GB al incluir todas las cuantizaciones; descargar solo los ficheros necesarios.
- Al ser una cuantización de terceros (mradermacher), el soporte oficial corresponde a NVIDIA sobre el modelo base, no sobre estos GGUF.

## Enlaces

- Repositorio de la cuantización GGUF: https://huggingface.co/mradermacher/Nemotron-3-Embed-8B-BF16-GGUF
- Modelo base de NVIDIA: https://huggingface.co/nvidia/Nemotron-3-Embed-8B-BF16
- Cuantizaciones weighted/imatrix: https://huggingface.co/mradermacher/Nemotron-3-Embed-8B-BF16-i1-GGUF
- Página de descarga resumida: https://hf.tst.eu/model#Nemotron-3-Embed-8B-BF16-GGUF
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- FAQ y solicitudes de cuantización: https://huggingface.co/mradermacher/model_requests
- Guía de uso de ficheros GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/

# nohurry/Nemotron-3.5-Embed-1B-GGUF

## Resumen

Nemotron-3.5-Embed-1B-GGUF es la conversión a formato GGUF del modelo de embeddings multimodales Nemotron-3.5-Embed-1B-BF16 desarrollado por NVIDIA. Este repositorio, publicado por el usuario nohurry, proporciona cuantizaciones listas para su uso con llama.cpp, lo que permite ejecutar un modelo de embeddings de 1.140 millones de parámetros en hardware de consumo sin necesidad de GPUs de datacenter. El modelo base está diseñado para tareas de recuperación de información, RAG (retrieval-augmented generation) y búsqueda semántica, y su naturaleza multimodal le permite generar embeddings tanto de texto como de imágenes, incluyendo documentos visuales.

La relevancia de esta ficha radica en que el formato GGUF democratiza el acceso a un modelo de embeddings de NVIDIA que de otro modo requeriría infraestructura específica. Con cuantizaciones que van desde q3_k_s hasta f32, y con un proyector multimodal separado (mmproj) en varias precisiones, el repositorio cubre un espectro amplio de compromisos entre calidad y requisitos de memoria. El pipeline declarado es visual-document-retrieval, lo que lo sitúa en la categoría de modelos de recuperación de documentos visuales, un nicho en crecimiento para aplicaciones de RAG sobre PDFs, facturas, formularios e imágenes escaneadas.

El modelo soporta más de 30 idiomas según las etiquetas del repositorio, incluyendo español, inglés, árabe, chino, hindi, japonés, coreano y la mayoría de lenguas europeas principales. La licencia es openmdw-1.1, una licencia de pesos abiertos de NVIDIA que debe revisarse con atención para uso comercial. El tamaño del repositorio (27,8 GB) refleja la inclusión de múltiples cuantizaciones en un solo repo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de embeddings multimodal con proyector separado) |
| Parametros totales | 1.140.918.272 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q3_k_s, q3_k_m, q4_0, q4_1, q4_k_s, q4_k_m, nvfp4, q5_k_s, q5_k_m, q6_k, q8_0, f16, bf16, f32 (backbone); q8_0, f16, bf16, f32 (proyector multimodal) |
| Idiomas soportados | multilingual, en, ar, as, bn, bg, zh, da, nl, fi, fr, de, hi, id, it, ja, ko, ms, mr, ne, no, fa, pt, ro, ru, es, sw, sv, ta, te, th, uk, ur, vi |
| Licencia | openmdw-1.1 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la información proporcionada. Por las características del repositorio (presencia de un proyector multimodal separado en formato mmproj y pipeline de visual-document-retrieval), se trata de un modelo de embeddings multimodal que combina un codificador de texto con un codificador de visión y un proyector que alinea ambos espacios. El modelo base es nvidia/Nemotron-3.5-Embed-1B-BF16 y existe también una variante NVFP4 publicada por NVIDIA.

La conversión a GGUF fue realizada con llama.cpp build b12470, según indica la model card. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO. Tampoco se detalla si el modelo emplea atención lineal, decodificación especulativa u otras innovaciones técnicas. Estos datos deberían consultarse en la model card del modelo base de NVIDIA.

## Capacidades

- Generación de embeddings de texto para tareas de recuperación, similitud semántica y clustering.
- Generación de embeddings de imagen, lo que permite búsqueda multimodal (texto-imagen e imagen-imagen).
- Recuperación de documentos visuales (visual-document-retrieval): adecuado para indexar y recuperar páginas de PDF, formularios, facturas y capturas.
- Soporte multilingüe en más de 30 idiomas, incluyendo español, inglés, francés, alemán, portugués, árabe, chino, hindi, japonés y coreano, entre otros.
- Integración en pipelines de RAG: los embeddings generados pueden almacenarse en bases vectoriales para recuperación aumentada.
- Compatibilidad con endpoints (tag endpoints_compatible), lo que sugiere uso en servicios de inferencia estándar.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso, ya que es un modelo de embeddings y no un modelo generativo conversacional.

## Casos de uso

- Búsqueda semántica en documentación técnica: indexar manuales y guías con el backbone en q8_0 o f16 y consultar por similitud vectorial; el soporte multilingüe permite consultas en español sobre documentación en inglés.
- RAG sobre PDFs escaneados: usar el proyector multimodal (mmproj-f16) junto con el backbone para generar embeddings de páginas de PDF que combinan texto e imagen, algo útil en contratos, facturas y formularios.
- Deduplicación de imágenes en catálogos: generar embeddings de imagen con el proyector y agrupar por similitud para detectar duplicados o variantes en grandes repositorios visuales.
- Motor de búsqueda interna empresarial: desplegar el modelo con llama.cpp en CPU o GPU de consumo para indexar correos, wikis y documentos ofimáticos, aprovechando las cuantizaciones q4_k_m para reducir memoria.
- Clasificación y clustering de tickets de soporte: generar embeddings de texto de tickets en varios idiomas y agrupar por temática para enrutamiento automático, usando q5_k_m como compromiso calidad/memoria.
- Recuperación multimodal en comercio electrónico: indexar imágenes de producto y descripciones textuales en un mismo espacio vectorial para búsqueda "buscar por imagen" o "buscar por descripción".
- Moderación de contenido asistida: calcular similitud entre contenido entrante y embeddings de referencia de contenido no deseado, con cuantización q4_0 para minimizar latencia en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el backbone de 1.140 millones de parámetros ocupa aproximadamente 0,6 GB en q3_k_s, 0,7 GB en q4_k_m, 0,8 GB en q5_k_m, 1,2 GB en q8_0, 2,3 GB en f16 y 4,6 GB en f32. El proyector multimodal añade un tamaño adicional no especificado en la información disponible.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para cuantizaciones bajas; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son compatibles. Para f32 se recomienda al menos 8 GB de VRAM.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 6 GB o más de VRAM para cuantizaciones q4 a q8. Las cuantizaciones q3 y q4 también pueden ejecutarse en CPU.
- Opciones de despliegue: llama.cpp (build b12470 o superior), Ollama (previa importación del GGUF), y cualquier runtime compatible con GGUF. No se menciona soporte explícito de vLLM o TGI para este repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron-3.5-Embed-1B (este repo, GGUF) | 1.140 M | no disponible | Sí (texto + imagen) | openmdw-1.1 | GGUF |
| nvidia/Nemotron-3.5-Embed-1B-BF16 | 1.140 M | no disponible | Sí | openmdw-1.1 | safetensors |
| nvidia/Nemotron-3.5-Embed-1B-NVFP4 | 1.140 M | no disponible | Sí | openmdw-1.1 | NVFP4 |

No se dispone de información sobre otros modelos comparables de la misma categoría (embeddings multimodales de ~1B) en la información proporcionada, por lo que no se incluyen alternativas adicionales.

## Limitaciones y advertencias

- Es un modelo de embeddings, no un modelo generativo: no produce texto ni responde preguntas directamente; debe combinarse con un LLM para RAG.
- Riesgo de sesgos: al ser un modelo de NVIDIA sin documentación de composición de dataset en esta ficha, no se pueden evaluar los sesgos de representación lingüística o cultural; se recomienda auditar con datos propios.
- Riesgo de alucinación: no aplica en el sentido generativo, pero los embeddings pueden producir similitudes engañosas en dominios muy especializados o con vocabulario fuera de distribución.
- Limitaciones de contexto: la longitud máxima de contexto no está documentada en la información disponible; para documentos largos conviene trocear y verificar experimentalmente el límite.
- Limitaciones de idioma: aunque se listan más de 30 idiomas, el rendimiento relativo por idioma no está documentado; el español está incluido, pero la calidad puede variar frente al inglés.
- Restricciones de licencia: openmdw-1.1 es una licencia de pesos abiertos de NVIDIA; debe revisarse el texto completo (https://openmdw.ai/license/1-1/) antes de uso comercial, especialmente en lo relativo a atribución y redistribución.
- Cuantizaciones agresivas (q3_k_s, q4_0) pueden degradar la calidad de los embeddings; para producción se recomienda q5_k_m o superior, y validar con un conjunto de evaluación propio.
- El proyector multimodal debe descargarse por separado del backbone; olvidarlo impide el uso de imágenes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/nohurry/Nemotron-3.5-Embed-1B-GGUF
- Modelo base BF16: https://huggingface.co/nvidia/Nemotron-3.5-Embed-1B-BF16
- Variante NVFP4: https://huggingface.co/nvidia/Nemotron-3.5-Embed-1B-NVFP4
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- llama.cpp (herramienta de conversión): https://github.com/ggml-org/llama.cpp

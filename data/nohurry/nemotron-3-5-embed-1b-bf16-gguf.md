# nohurry/Nemotron-3.5-Embed-1B-BF16-GGUF

## Resumen

Nemotron-3.5-Embed-1B es un modelo de embeddings desarrollado originalmente por NVIDIA, diseñado para generar representaciones vectoriales densas tanto de texto como de imágenes, con el objetivo de alimentar sistemas de recuperación de información (retrieval), generación aumentada por recuperación (RAG) y búsqueda semántica. La versión aquí descrita es una conversión a formato GGUF realizada por el usuario nohurry, que permite ejecutar el modelo con llama.cpp en hardware de consumo sin necesidad de GPUs de datacenter. El modelo base cuenta con 1.140.918.272 parámetros, lo que lo sitúa en la categoría de embeddings de ~1B, un tamaño que equilibra calidad de representación y coste computacional.

La relevancia de esta ficha radica en que se trata de un modelo multimodal de embeddings: no solo vectoriza texto, sino también imágenes y documentos visuales, lo que lo hace adecuado para pipelines de recuperación sobre documentos escaneados, capturas de pantalla, PDFs con layout complejo y bases de conocimiento mixtas (texto + imagen). El pipeline declarado en Hugging Face es `visual-document-retrieval`, lo que confirma su orientación a la recuperación de documentos visuales.

La conversión GGUF incluye tanto el backbone del modelo (en múltiples cuantizaciones, desde q3_k_s hasta f32) como el proyector multimodal (mmproj) en varias precisiones, lo que permite desplegar el modelo completo de forma local. La licencia es OpenMDW-1.1, una licencia abierta específica para modelos de IA. El repo ocupa 27,8 GB en total, reflejando la inclusión de todas las variantes de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de embeddings multimodal; arquitectura interna no detallada en la información proporcionada) |
| Parametros totales | 1.140.918.272 |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q3_k_s, q3_k_m, q4_0, q4_1, q4_k_s, q4_k_m, nvfp4, q5_k_s, q5_k_m, q6_k, q8_0 (q8_k), f16, bf16, f32; proyector multimodal en q8_0, f16, bf16, f32 |
| Idiomas soportados | multilingüe; lista explícita: en, ar, as, bn, bg, zh, da, nl, fi, fr, de, hi, id, it, ja, ko, ms, mr, ne, no, fa, pt, ro, ru, es, sw, sv, ta, te, th, uk, ur, vi |
| Licencia | openmdw-1.1 (Open Model Development & Weights) |
| Formato de pesos | GGUF (backbone + mmproj); el modelo base original en safetensors/BF16 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo (tipo de transformer, número de capas, dimensión de embedding, mecanismo de atención ni composición del dataset de entrenamiento). Lo que sí se sabe es que se trata de un modelo de embeddings multimodal con un backbone de ~1.140 millones de parámetros y un proyector multimodal separado que permite alinear representaciones de imagen con el espacio de embeddings de texto. El pipeline `visual-document-retrieval` y los tags `multimodal-embedding`, `image-embeddings` y `text-embeddings` confirman que el modelo produce vectores en un espacio compartido para texto e imagen.

La conversión a GGUF se realizó con llama.cpp build b12470, lo que implica que el modelo puede ejecutarse con la infraestructura estándar de llama.cpp, incluyendo soporte para el proyector multimodal (mmproj). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste contrastivo específico. Tampoco se detallan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de embeddings de texto densos para recuperación semántica y búsqueda por similitud.
- Generación de embeddings de imagen en el mismo espacio vectorial que el texto (multimodal-embedding), permitiendo búsqueda cruzada texto-imagen e imagen-texto.
- Recuperación de documentos visuales (visual-document-retrieval): adecuado para PDFs escaneados, capturas, formularios e imágenes con texto.
- Soporte multilingüe en 33 idiomas, incluyendo español, inglés, árabe, chino, hindi, japonés, coreano, portugués, ruso y una amplia cobertura de lenguas indias y europeas.
- Compatible con endpoints (tag `endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia estándar.
- Feature extraction (`feature-extraction`) como tarea principal del pipeline de Hugging Face.
- No se dispone de información sobre tool calling, function calling, agentes o razonamiento multi-paso (no es un modelo generativo, sino de embeddings).

## Casos de uso

- RAG sobre documentación técnica mixta: indexar manuales, PDFs y capturas de pantalla en una única base vectorial; el modelo vectoriza tanto el texto como las imágenes de las páginas, permitiendo recuperar fragmentos visuales relevantes junto con el texto. Adecuado por su naturaleza multimodal y su tamaño de ~1B, que mantiene el coste de indexación bajo.
- Búsqueda semántica en bases de conocimiento multilingües: al soportar 33 idiomas, permite consultas en español contra documentos en inglés, francés o árabe sin traducción intermedia, usando similitud coseno sobre los embeddings.
- Recuperación de documentos escaneados y facturas: el pipeline `visual-document-retrieval` está pensado para localizar documentos visuales por contenido, útil en gestoría, legal y back-office donde los PDFs no tienen capa de texto.
- Deduplicación y clustering de imágenes y textos: generar embeddings de un corpus mixto y agrupar por similitud para detectar duplicados, near-duplicates o clasificar contenido no etiquetado.
- Motor de búsqueda interna para wikis y portales corporativos: indexar artículos, imágenes y adjuntos con un único modelo, simplificando la arquitectura frente a usar un modelo de texto y otro de visión por separado.
- Filtrado de contenido y moderación asistida: comparar embeddings de nuevas imágenes/textos contra un conjunto de referencia de contenido permitido o prohibido, aprovechando el espacio compartido multimodal.
- Despliegue en edge o hardware de consumo: gracias a las cuantizaciones GGUF (q4_k_m, q5_k_m, etc.) y al soporte de llama.cpp, puede ejecutarse en portátiles o mini-PCs para prototipos de RAG local sin GPU de datacenter.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (backbone de ~1,14B parámetros):
  - f32: ~4,5 GB solo pesos.
  - f16 / bf16: ~2,3 GB solo pesos.
  - q8_0: ~1,2 GB.
  - q6_k: ~0,95 GB.
  - q5_k_m: ~0,8 GB.
  - q4_k_m: ~0,7 GB.
  - q3_k_m: ~0,55 GB.
  - Añadir el proyector multimodal (mmproj): f16 ~típicamente decenas de MB; f32 algo más. El total real incluye overhead de contexto y buffers de llama.cpp.
- GPU recomendadas: cualquier GPU con ≥4 GB de VRAM para cuantizaciones bajas; RTX 3060/4060, RTX 4090, A100, H100 son válidas. Para f16/bf16 se recomienda ≥6 GB para trabajar con comodidad.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas (RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 24 GB) incluso en f16; en q4_k_m cabe en iGPUs y en GPUs con 4 GB.
- Opciones de despliegue: llama.cpp (build b12470 o superior, requerido para la conversión), Ollama (si se importa el GGUF), servidores compatibles con endpoints (tag `endpoints_compatible`), y el modelo base original en safetensors para vLLM/TGI si se usa la versión de NVIDIA.
- Latencia y throughput: no disponibles en la información proporcionada. Al ser un modelo de ~1B, se espera throughput alto en GPU moderna, pero no se aportan cifras verificables.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5-Embed-1B (este, GGUF) | 1,14B | no disponible | Texto + imagen | openmdw-1.1 | GGUF en HF (nohurry); base en NVIDIA |
| nvidia/Nemotron-3.5-Embed-1B-BF16 (base) | 1,14B | no disponible | Texto + imagen | openmdw-1.1 | safetensors en HF |
| nvidia/Nemotron-3.5-Embed-1B-NVFP4 | 1,14B | no disponible | Texto + imagen | openmdw-1.1 | NVFP4 en HF |
| Otros modelos de embeddings multimodales de ~1B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de modelos comparables alternativos en la información proporcionada, por lo que la comparación se limita a las variantes del propio modelo.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto ni respuestas; solo genera embeddings. No debe usarse para chat, completado ni razonamiento directo.
- Sesgos conocidos: no disponibles en la información proporcionada; al ser un modelo multilingüe entrenado por NVIDIA, es probable que herede sesgos de sus datos, pero no se documentan.
- Riesgo de alucinación: no aplica en el sentido generativo, pero los embeddings pueden producir recuperaciones irrelevantes si el dominio está muy alejado del entrenamiento; conviene validar con métricas de retrieval (recall@k, MRR) en el corpus propio.
- Limitaciones de contexto e idioma: la longitud máxima de contexto no está documentada; los 33 idiomas listados son los declarados, pero el rendimiento relativo por idioma no se especifica.
- Restricciones de licencia: OpenMDW-1.1; es una licencia abierta, pero conviene revisar sus términos exactos (https://openmdw.ai/license/1-1/) antes de uso comercial, especialmente en lo relativo a atribución y redistribución.
- La conversión GGUF es de un tercero (nohurry), no oficial de NVIDIA; para producción crítica se recomienda validar la calidad de la cuantización frente al modelo base en BF16.
- El repo incluye todas las cuantizaciones (27,8 GB); descargar solo la variante necesaria para evitar consumo innecesario de disco.
- Requiere llama.cpp build b12470 o superior para compatibilidad con la conversión.

## Enlaces

- Repositorio GGUF: https://huggingface.co/nohurry/Nemotron-3.5-Embed-1B-BF16-GGUF
- Modelo base NVIDIA (BF16): https://huggingface.co/nvidia/Nemotron-3.5-Embed-1B-BF16
- Variante NVFP4 de NVIDIA: https://huggingface.co/nvidia/Nemotron-3.5-Embed-1B-NVFP4
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- llama.cpp (build b12470): https://github.com/ggml-org/llama.cpp

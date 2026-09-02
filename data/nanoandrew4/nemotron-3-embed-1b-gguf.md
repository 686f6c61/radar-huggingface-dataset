# nanoandrew4/Nemotron-3-Embed-1B-GGUF

## Resumen

Nemotron-3-Embed-1B es un modelo de embeddings de texto desarrollado por NVIDIA, optimizado para tareas de recuperación de información y similitud semántica. Este repositorio concreto contiene la conversión a formato GGUF del modelo original en BF16, realizada por el usuario nanoandrew4, para su uso con llama.cpp y runtimes compatibles. El modelo destaca por su capacidad multilingüe y cross-lingual, y está diseñado como componente fundamental en sistemas de Retrieval-Augmented Generation (RAG) empresariales, búsqueda de código y memoria de agentes.

La arquitectura se basa en Ministral3 (etiquetada como `mistral3`), con 16 capas, dimensión oculta de 2048, 24 cabezas de atención para consultas y 8 para claves/valores, y una ventana de contexto de 262 144 tokens mediante extensión YaRN. Con aproximadamente 1 140 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware de consumo. La conversión GGUF incluye dos cuantizaciones: BF16 sin pérdida (2,2 GB) y Q8_0 (1,2 GB), lo que facilita su despliegue local con llama.cpp, Ollama o text-embeddings-inference.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ministral3 (mistral3), transformer con 16 capas, hidden 2048, 24 Q / 8 KV heads |
| Parametros totales | 1 140 918 272 (1,14 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262 144 tokens (con YaRN) |
| Tipos de cuantizacion | BF16 (lossless), Q8_0; existe tambien Q4_K_M de otro autor |
| Idiomas soportados | 34 idiomas segun NVIDIA (incluye ingles, arabe, asames, etc.), lista completa no disponible |
| Licencia | openmdw-1.1 (Open Model DW License 1.1 de NVIDIA) |
| Formato de pesos | GGUF (safetensors BF16 en el modelo base) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer basada en Ministral3, una variante de Mistral con atención multi-query (24 cabezas de consulta y 8 de clave/valor) para reducir el coste de memoria durante la inferencia. La ventana de contexto nativa se extiende hasta 262 144 tokens mediante la técnica YaRN (Yet another RoPE extensioN), lo que permite procesar documentos largos sin perder coherencia. El modelo fue entrenado por NVIDIA específicamente para generar embeddings de texto, operando en dos modos: `passage` (para indexar documentos) y `query` (para consultas), lo que exige indicar el parámetro `input_type` en la API.

El entrenamiento se centró en recuperación multilingüe y cross-lingual, con evaluación en 34 idiomas. No se dispone de detalles sobre el volumen de datos de entrenamiento ni sobre el uso de técnicas como RLHF o DPO, ya que no aparecen en la información proporcionada. La conversión a GGUF se realizó con `convert_hf_to_gguf.py` a partir de los safetensors BF16 originales, y el modelo se sirve con pooling medio y normalización L2 de las salidas.

## Capacidades

- Generacion de embeddings de texto densos para recuperacion y similitud semantica.
- Soporte de modos `passage` y `query` para distinguir entre indexacion y consulta.
- Capacidades multilingues y cross-linguales (34 idiomas evaluados).
- Ventana de contexto larga (262k tokens) para procesar documentos extensos.
- Integracion con pipelines de RAG, busqueda de codigo y memoria de agentes.
- Compatible con llama.cpp, text-embeddings-inference y runtimes GGUF.
- No es un modelo generativo: no produce texto, solo vectores de embedding.

## Casos de uso

- Recuperacion aumentada por generacion (RAG) empresarial: el modelo indexa documentos internos en modo `passage` y consulta en modo `query`, permitiendo construir pipelines de RAG con contexto largo gracias a sus 262k tokens de ventana.
- Busqueda semantica en bases de conocimiento: se pueden generar embeddings de articulos, informes o manuales y compararlos con consultas de usuarios para devolver resultados relevantes por similitud coseno.
- Busqueda de codigo en repositorios: al indexar funciones, clases y documentacion tecnica, el modelo facilita la busqueda semantica de fragmentos de codigo en grandes codebases.
- Memoria de agentes conversacionales: los embeddings permiten almacenar y recuperar interacciones pasadas o informacion contextual para que agentes mantengan coherencia en conversaciones largas.
- Clasificacion y deduplicacion de documentos: agrupando embeddings por similitud se pueden detectar duplicados, organizar corpus o clasificar textos por tema sin entrenamiento adicional.
- Sistemas de recomendacion de contenido: comparando embeddings de articulos o productos con el historial del usuario, se pueden sugerir elementos relacionados en portales de noticias o e-commerce.
- Moderacion y filtrado de contenido: los embeddings permiten identificar textos similares a patrones no deseados (spam, toxicidad) y filtrarlos automaticamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de NVIDIA menciona evaluacion en 34 idiomas, pero no se incluyen metricas concretas (como MTEB, MIRACL o similares) en los datos proporcionados. Se recomienda consultar la documentacion oficial de NVIDIA para obtener cifras de rendimiento comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo BF16 ocupa 2,2 GB en disco, por lo que requiere aproximadamente 2,5-3 GB de VRAM en BF16; la version Q8_0 (1,2 GB) necesita unos 1,5-2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar la version Q8_0 (por ejemplo, GTX 1650, RTX 3050, RTX 4060). Para BF16 se recomienda 6 GB o mas (RTX 3060, RTX 4090, A10, A100).
- Cabe en GPUs de consumo: si, tanto en tarjetas de gama baja como alta, gracias a su tamano reducido.
- Opciones de despliegue: llama.cpp (llama-server), Ollama, text-embeddings-inference, vLLM (con soporte GGUF), o cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada; al ser un modelo de 1B, se espera una latencia de pocos milisegundos por embedding en GPUs modernas.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la informacion proporcionada. El modelo compite con otros embeddings multilingues como E5-large-v2, BGE-M3 o GTE-Qwen2, pero no se han encontrado benchmarks que permitan una comparacion cuantitativa. Se recomienda consultar el leaderboard MTEB para evaluar su posicion relativa.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos especificos en la informacion disponible, pero al ser un modelo entrenado con datos web, puede reflejar sesgos presentes en el corpus.
- Riesgo de alucinacion: al ser un modelo de embeddings, no genera texto, por lo que el riesgo de alucinacion es nulo en ese sentido; sin embargo, la calidad de la recuperacion depende de la representacion semantica.
- Limitaciones de contexto: aunque soporta 262k tokens, el rendimiento en contextos muy largos puede degradarse; se recomienda validar en el caso de uso concreto.
- Restricciones de licencia: la licencia openmdw-1.1 permite uso comercial, pero impone restricciones sobre el uso para desarrollar modelos competidores y requiere atribucion. Es necesario revisar los terminos completos antes de desplegar en produccion.
- Caveat de tokenizacion: llama.cpp anade un token BOS por defecto, mientras que el modelo original de sentence-transformers no lo hace. Para obtener embeddings identicos al de Hugging Face, hay que desactivar el BOS con `--override-kv tokenizer.ggml.add_bos_token=bool:false`. La calidad de recuperacion no se ve afectada, pero los vectores crudos difieren.
- La conversion GGUF no es un lanzamiento oficial de NVIDIA; el autor es independiente, por lo que no hay garantia de soporte.

## Enlaces

- Repositorio GGUF: https://huggingface.co/nanoandrew4/Nemotron-3-Embed-1B-GGUF
- Modelo base (BF16): https://huggingface.co/nvidia/Nemotron-3-Embed-1B-BF16
- Coleccion de NVIDIA Nemotron-3-Embed: https://huggingface.co/collections/nvidia/nemotron-3-embed
- Model card en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3-embed-1b/modelcard
- API de NVIDIA NIM: https://docs.api.nvidia.com/nim/reference/nvidia-nemotron-3-embed-1b
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Version Q4_K_M alternativa: https://huggingface.co/zenmagnets/Nemotron-3-Embed-1B-Q4_K_M-GGUF

# on1onmangoes/Nemotron-3.5-Embed-1B-BF16

## Resumen

Nemotron-3.5-Embed-1B-BF16 es un modelo de embeddings multimodal y multilingue desarrollado por NVIDIA, orientado a la recuperacion de documentos para flujos de pregunta-respuesta y RAG. Acepta como entrada una pagina de documento en forma de imagen, texto o una combinacion de imagen y texto, y devuelve un vector denso de tamano fijo que permite recuperar documentos a partir de una consulta textual. Esta pensado para corpus que contienen texto, tablas, graficos e infografias, un escenario donde los embeddings puramente textuales pierden informacion de maquetacion.

Tecnicamente es un bi-encoder construido sobre dos componentes: un codificador de vision Pixtral inicializado desde mistralai/Ministral-3-3B-Instruct-2512-BF16 y un modelo de lenguaje inicializado desde nvidia/Nemotron-3-Embed-1B-BF16, con un total de 1.554.710.528 parametros (1,55B) en formato BF16. El modelo se ha destilado a partir del teacher Nemotron-3.5-Embed-8B-BF16 mediante una combinacion de perdidas de distancia coseno (COS) y error cuadratico medio (MSE) sobre datos multilingues de recuperacion de texto e imagen.

Su relevancia actual reside en que cubre la recuperacion visual de documentos (visual-document-retrieval) manteniendo el mismo espacio de embeddings de texto que Nemotron-3-Embed-1B, lo que permite sustituir o complementar pipelines de recuperacion textual existentes sin reindexar el corpus de texto. La model card lo presenta como estado del arte entre modelos de tamano comparable en varios benchmarks multilingues y multimodales de recuperacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer bi-encoder: codificador de vision Pixtral (inicializado desde Ministral-3-3B-Instruct-2512-BF16) + modelo de lenguaje (inicializado desde Nemotron-3-Embed-1B-BF16) |
| Parametros totales | 1.554.710.528 (1,55B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | BF16 (version publicada); existe una variante NVFP4 del mismo modelo en el repositorio de NVIDIA |
| Idiomas soportados | Multilingue; evaluado en 34 idiomas para recuperacion de texto (en, ar, as, bn, bg, zh, da, nl, fi, fr, de, hi, hinglish, id, it, ja, ko, ms, mr, ne, no, fa, pt, ro, ru, es, sw, sv, ta, te, th, uk, ur, vi) y en 18 para recuperacion de imagen (ar, bn, zh, en, fa, fi, fr, de, hi, id, ja, ko, ru, es, sw, te, th, yo) |
| Licencia | OpenMDW License Agreement version 1.1 (openmdw-1.1); los modelos base Ministral estan bajo Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer de tipo bi-encoder. La torre de vision es un codificador Pixtral inicializado desde el modelo instructivo Ministral-3-3B-Instruct-2512-BF16, mientras que la torre de lenguaje se inicializa desde nvidia/Nemotron-3-Embed-1B-BF16 y se mantiene congelada durante el proceso de destilacion. Sobre esa base, el codificador de vision y la proyeccion multimodal se ajustan de forma fina con datos de imagen y de imagen mas texto. El resultado es que el modelo comparte exactamente el mismo espacio de embeddings de texto que Nemotron-3-Embed-1B, anadiendo capacidad de recuperacion visual.

El entrenamiento se basa en destilacion desde el teacher Nemotron-3.5-Embed-8B-BF16, usando una funcion de perdida combinada de distancia coseno y error cuadratico medio sobre datos multilingues de recuperacion de texto e imagen. La model card no detalla el numero exacto de tokens de entrenamiento ni la composicion completa del dataset, por lo que esos datos deben considerarse no disponibles. La entrada admite cadenas de texto (dimensionalidad 1D) e imagenes en formato RGB (2D); las consultas son siempre texto, mientras que los documentos pueden ser imagen, texto o imagen mas texto.

## Capacidades

- Generacion de embeddings densos de tamano fijo a partir de texto, imagen de pagina de documento o combinacion de ambos.
- Recuperacion multimodal de documentos: pagina completa como imagen, incluyendo tablas, graficos e infografias.
- Recuperacion de texto multilingue y cross-lingual evaluada en 34 idiomas.
- Recuperacion de imagen evaluada en 18 idiomas.
- Busqueda semantica y construccion de indices vectoriales para RAG.
- Integracion con sentence-transformers y transformers.
- Soporte declarado para despliegue con vLLM.
- Orientado a flujos agenticos de recuperacion (agentic RAG) segun la model card.
- No es un modelo generativo: no produce texto, tool calling ni razonamiento multi-paso.

## Casos de uso

- RAG sobre corpus documentales escaneados: indexar paginas completas como imagenes y recuperar las mas relevantes para una consulta textual, evitando depender de OCR imperfecto en documentos con tablas o graficos.
- Busqueda semantica empresarial multilingue: un unico indice vectorial que cubre consultas en espanol, ingles, arabe, hindi, japones y otros idiomas evaluados, con recuperacion cross-lingual entre ellos.
- Recuperacion de documentacion tecnica con diagramas: manuales, fichas de producto e informes donde la informacion critica esta en graficos o tablas que un embedding de texto no captura.
- Migracion progresiva de pipelines de texto a multimodal: al compartir espacio de embeddings con Nemotron-3-Embed-1B, se pueden anadir paginas de imagen al mismo indice sin reindexar los fragmentos de texto existentes.
- Atencion al cliente sobre base documental: recuperar fragmentos de manuales o politicas a partir de preguntas de usuarios en varios idiomas antes de pasarlos a un LLM generador.
- Sistemas agenticos de investigacion: el agente formula consultas de texto y recupera evidencias visuales o textuales de un corpus grande para fundamentar sus respuestas.
- Deduplicacion y agrupacion de documentos: usar los embeddings de pagina para detectar documentos duplicados o casi duplicados en repositorios mixtos de imagen y texto.

## Benchmarks y rendimiento

La model card afirma que el modelo alcanza resultados de estado del arte entre modelos de tamano comparable en multiples benchmarks multilingues y multimodales de recuperacion, pero no incluye la tabla de resultados numericos en la informacion proporcionada.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 3,1 GB solo para los pesos (el repositorio ocupa 3,1 GB); con activaciones y cache de vision, el consumo real sera superior, del orden de 4-6 GB segun el tamano de lote y la resolucion de imagen.
- Cabe en GPU de consumo: una RTX 4090 (24 GB), RTX 4080 (16 GB) o incluso GPUs de 8 GB en BF16 para lotes pequenos; la variante NVFP4 reduce aun mas el requisito.
- GPU recomendadas para produccion: NVIDIA A100, H100 o L40S para indexacion masiva con lotes grandes; tambien valido en GPUs de gama media para cargas moderadas.
- Opciones de despliegue: sentence-transformers, transformers, vLLM (soportado segun los tags del repositorio). No se indica soporte explicito de llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5-Embed-1B-BF16 | 1,55B | no disponible | Texto + imagen | OpenMDW-1.1 | Hugging Face (NVIDIA y mirror on1onmangoes) |
| Nemotron-3.5-Embed-8B-BF16 | no disponible (8B por nombre) | no disponible | Texto + imagen | OpenMDW-1.1 | Hugging Face (NVIDIA) |
| Nemotron-3-Embed-1B-BF16 | no disponible (1B por nombre) | no disponible | Texto | no disponible | Hugging Face (NVIDIA) |
| Ministral-3-3B-Instruct-2512-BF16 | no disponible (3B por nombre) | no disponible | Texto (modelo base instructivo) | Apache 2.0 | Hugging Face (Mistral AI) |

La comparacion con alternativas de otros fabricantes (por ejemplo, embeddings multimodales de Cohere, Voyage o Jina) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Las consultas solo se aceptan en formato texto; no es posible lanzar una consulta basada en imagen.
- La longitud de contexto no se especifica en la informacion disponible, lo que impide planificar el troceado de documentos largos con precision.
- La cobertura linguistica esta evaluada en 34 idiomas para texto y 18 para imagen; el rendimiento fuera de esos conjuntos no esta garantizado.
- No es un modelo generativo: no responde preguntas por si mismo, solo produce vectores; requiere un LLM generador en el pipeline de RAG.
- Al ser un modelo destilado de un teacher de 8B, es esperable una perdida de calidad frente a este en tareas de recuperacion dificiles, aunque la model card no cuantifica la brecha.
- La licencia OpenMDW-1.1 permite uso comercial segun la model card, pero conviene revisar sus terminos completos antes de desplegar en produccion.
- El repositorio analizado es un mirror de un tercero (on1onmangoes) con 0 descargas y 0 likes; para uso en produccion es recomendable descargar los pesos desde el repositorio oficial de NVIDIA.
- Riesgo de sesgo y de alucinacion en el pipeline completo: los sesgos del corpus de recuperacion pueden propagarse a las respuestas del LLM que consuma los documentos recuperados.
- No se han publicado datos de latencia ni de throughput, por lo que las estimaciones de capacidad deben validarse con pruebas propias.

## Enlaces

- Repositorio analizado: https://huggingface.co/on1onmangoes/Nemotron-3.5-Embed-1B-BF16
- Repositorio oficial (BF16): https://huggingface.co/nvidia/Nemotron-3.5-Embed-1B-BF16
- Variante NVFP4: https://huggingface.co/nvidia/Nemotron-3.5-Embed-1B-NVFP4
- Modelo teacher (8B): https://huggingface.co/nvidia/Nemotron-3.5-Embed-8B-BF16
- Modelo de lenguaje base: https://huggingface.co/nvidia/Nemotron-3-Embed-1B-BF16
- Modelo de vision base: https://huggingface.co/mistralai/Ministral-3-3B-Instruct-2512-BF16
- Modelo instructivo 8B de Mistral: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512-BF16
- Blog de NVIDIA sobre recuperacion agentica: https://huggingface.co/blog/nvidia/nemotron-retriever-world-class-agentic-retrieval
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Documentacion de la API NIM: https://docs.api.nvidia.com/nim/reference/nvidia-nemotron-3-embed-1b
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0.txt

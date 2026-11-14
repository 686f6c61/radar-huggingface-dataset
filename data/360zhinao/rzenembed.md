# 360ZhiNao/RzenEmbed

## Resumen

RzenEmbed-v2-7B es un modelo de embeddings multimodal desarrollado y liberado en abierto por 360CVGroup (grupo de vision por computador de 360, la empresa detrás de Qihoo 360). Su funcion es convertir texto, imagenes, documentos visuales y video en representaciones vectoriales comparables en un mismo espacio, de modo que puedan calcularse similitudes entre modalidades. Resuelve el problema de la recuperacion multimodal (texto a imagen, imagen a texto, texto a video, busqueda sobre documentos escaneados) con un unico modelo en lugar de pipelines especializados.

El modelo se construye sobre la arquitectura Qwen2-VL (tag `qwen2_vl` en Hugging Face) y cuenta con 8.291.375.616 parametros (aproximadamente 8,29 B), empaquetados en safetensors con un tamano de repositorio de 16,6 GB. Segun la model card, alcanza resultados estado del arte en los benchmarks MMEB-V2, MMEB-Visdoc y MMEB-Video a fecha de 29 de septiembre de 2025, con un resultado global de 71,61 en MMEB-V2.

Su relevancia actual radica en que unifica la recuperacion de imagenes, video y documentos visuales en un solo modelo de ~8 B, superando a alternativas como gme-Qwen2-VL-7B-Instruct o VLM2Vec-V2.0 en los agregados multimodales, y con un rendimiento especialmente fuerte en video (55,73 en Video-Overall) y en documentos visuales (77,06 en Visdoc-Overall). El modelo se distribuye con un paquete de inferencia propio (`rzen_embed_inference`) y esta asociado al paper arXiv:2510.27350.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2-VL (transformer multimodal vision-language) |
| Parametros totales | 8.291.375.616 (~8,29 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se detallan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (tamano del repo: 16,6 GB) |

## Arquitectura y entrenamiento

El modelo parte de la familia Qwen2-VL, un transformer multimodal que procesa imagenes y video mediante un vision encoder y proyecta las representaciones visuales al espacio del modelo de lenguaje. Sobre esa base, RzenEmbed-v2-7B se entrena como modelo de embeddings: en lugar de generar texto, produce vectores normalizados para texto, imagen, documento visual y video, de forma que la similitud coseno entre vectores de distintas modalidades sea directamente interpretable. La model card muestra el uso de instrucciones diferenciadas por rol (por ejemplo, `"Find me an everyday image that matches the given caption: "` para la consulta y `"Represent the given image."` para el candidato), lo que indica un entrenamiento con instrucciones asimetricas para query y documento.

No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron fases de RLHF o DPO. La model card referencia el paper arXiv:2510.27350 y el repositorio GitHub de 360CVGroup/RzenEmbed, donde presumiblemente se describen estos detalles, pero su contenido no se ha proporcionado. Tampoco se especifican innovaciones tecnicas concretas como decodificacion especulativa o atencion lineal; lo destacable es la fusion multimodal en un unico espacio de embeddings y el rendimiento SOTA declarado en video y documentos visuales.

## Capacidades

- Generacion de embeddings multimodales: texto, imagenes, documentos visuales (paginas escaneadas, capturas, PDFs renderizados) y video, en un espacio vectorial comun.
- Recuperacion texto a imagen: dada una descripcion textual, devuelve las imagenes mas similares.
- Recuperacion imagen a texto: dada una imagen, encuentra las leyendas o descripciones que mejor le corresponden.
- Recuperacion texto a video y video a texto, con soporte de video retrieval multiple (V-MRET en MMEB-Video).
- Recuperacion sobre documentos visuales: evaluado en ViDoRe-V1, ViDoRe-V2, VisRAG y VisDoc-OOD, lo que cubre busqueda sobre paginas de documentos sin necesidad de OCR previo.
- Uso con instrucciones por rol (query instruction y candidate instruction), lo que permite ajustar el comportamiento de recuperacion sin reentrenar.
- Paquete de inferencia propio (`rzen_embed_inference`, clase `RzenEmbed`) con metodos como `get_fused_embeddings(instruction=..., texts=..., images=...)`.
- Tool calling, agentes, razonamiento multi-paso, thinking mode, audio: no disponible / no declarado; el modelo esta orientado a embeddings, no a generacion.

## Casos de uso

- Busqueda visual en catalogos de e-commerce: indexar las imagenes de producto como embeddings y permitir consultas en lenguaje natural ("zapatillas running azules con suela blanca"); el modelo alinea texto e imagen en un mismo espacio, por lo que no hace falta etiquetado manual.
- Recuperacion sobre documentos escaneados y PDFs: renderizar las paginas como imagen y generar embeddings con el modelo para construir un motor de busqueda sobre facturas, contratos o informes sin pipeline OCR; los resultados en ViDoRe-V1 (89,7) y VisRAG (88,7) respaldan este uso.
- Moderacion y deduplicacion de contenido visual: calcular embeddings de imagenes y videos subidos por usuarios para detectar duplicados, near-duplicates o contenido similar a material ya marcado, usando similitud coseno sobre los vectores.
- Busqueda semantica en videotecas: indexar fotogramas o clips de video y permitir consultas textuales ("escena de una cocina con alguien cocinando"); el modelo obtiene 55,73 en Video-Overall en MMEB-Video, el mejor de la comparativa mostrada.
- Sistemas RAG multimodales: usar los embeddings como capa de recuperacion de un pipeline RAG que combine texto e imagenes (por ejemplo, manuales tecnicos con diagramas), recuperando los fragmentos visuales y textuales relevantes antes de pasarlos a un LLM generador.
- Recomendacion y similitud entre items visuales: calcular la similitud entre imagenes de producto o entre video y descripcion para generar recomendaciones "mas como esto" sin depender de metadatos.
- Clasificacion zero-shot por prototipos: construir embeddings de las clases (texto o imagenes de referencia) y asignar cada nueva imagen o video a la clase mas cercana, util para triaje de imagenes medicas, industriales o de satelite cuando no hay datos etiquetados.

## Benchmarks y rendimiento

Resultados publicados en la model card (MMEB-V2 y subconjuntos). Se comparan con modelos de tamano similar.

| Modelo | Tamano (B) | MMEB-V2 Overall | Image-Overall | Video-Overall | Visdoc-Overall |
|---|---|---|---|---|---|
| RzenEmbed-v2-7B | 8,29 | **71,61** | 75,92 | **55,73** | **77,06** |
| seed-1.6-embedding | no disponible | 71,27 | **77,78** | 55,34 | 73,44 |
| Ops-MM-embedding-v1-7B | 8,29 | 67,61 | 72,72 | 53,76 | 70,34 |
| Ops-MM-embedding-v1-2B | 2,21 | 63,44 | 69,03 | 47,56 | 66,96 |
| interestFM-UIR-CAFe-7B | 8,03 | 60,63 | 67,56 | 42,40 | 63,92 |
| VLM2Vec-V2.0-Qwen2VL-2B | 2,21 | 58,02 | 64,85 | 34,85 | 65,36 |
| gme-Qwen2-VL-7B-Instruct | 8,29 | 57,83 | 55,95 | 38,43 | 75,18 |
| gme-Qwen2-VL-2B-Instruct | 2,21 | 54,08 | 51,89 | 33,64 | 72,71 |

MMEB-Image (desglose):

| Modelo | Image-Overall | I-CLS | I-QA | I-RET | I-VG |
|---|---|---|---|---|---|
| seed-1.6-embedding | **77,78** | **76,06** | **73,97** | 77,90 | 91,25 |
| RzenEmbed-v2-7B | 75,92 | 70,61 | 71,67 | **78,50** | **92,10** |
| QQMM-embed-v2 | 75,28 | 72,97 | 71,85 | 76,01 | 87,42 |
| ReCo-7B | 73,87 | 70,95 | 71,52 | 73,66 | 87,70 |
| OEmbedding-v1-7B | 72,79 | 70,05 | 68,10 | 73,84 | 88,25 |
| Ops-MM-embedding-v1-7B | 72,72 | 69,65 | 69,58 | 73,09 | 87,15 |

MMEB-Video (desglose):

| Modelo | Video-Overall | V-CLS | V-QA | V-RET | V-MRET |
|---|---|---|---|---|---|
| RzenEmbed-v2-7B | **55,73** | 58,82 | **63,50** | 50,97 | 45,54 |
| seed-1.6-embedding | 55,34 | 54,99 | 60,85 | **51,33** | **53,45** |
| Ops-MM-embedding-v1-7B | 53,76 | **59,68** | 62,22 | 45,72 | 43,21 |
| interestFM-UIR-CAFe-7B | 42,40 | 35,81 | 58,66 | 34,44 | 39,53 |
| gme-Qwen2-VL-7B-Instruct | 38,43 | 37,44 | 50,35 | 28,37 | 36,96 |

MMEB-Visdoc (desglose):

| Modelo | Visdoc-Overall | ViDoRe-V1 | ViDoRe-V2 | VisRAG | VisDoc-OOD |
|---|---|---|---|---|---|
| RzenEmbed-v2-7B | **77,06** | **89,70** | **60,70** | **88,70** | 44,38 |
| gme-Qwen2-VL-7B-Instruct | 75,18 | 89,44 | 55,61 | 84,99 | **44,40** |
| seed-1.6-embedding | 73,44 | 85,53 | 56,57 | 84,74 | 43,14 |
| gme-Qwen2-VL-2B-Instruct | 72,71 | 86,15 | 53,96 | 82,52 | 43,12 |
| colpali-v1.3 | 70,97 | 83,60 | 51,98 | 81,13 | 43,12 |
| Ops-MM-embedding-v1-7B | 70,34 | 80,05 | 59,59 | 79,32 | 43,34 |

## Requisitos de hardware

- VRAM estimada para inferencia en precision nativa: los pesos suman 8,29 B parametros, lo que en fp16 supone aproximadamente 16,6 GB solo para pesos; con cache de activaciones y procesamiento de imagenes/video, conviene reservar 20-24 GB como minimo.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para inferencia comoda en fp16 y procesamiento por lotes. Para despliegues de recuperacion a gran escala, A100/H100 con vLLM o TGI.
- GPU de consumo: una RTX 4090 (24 GB) puede alojar los pesos en fp16 con margen limitado; en cuantizacion de 8 bits (no publicada oficialmente, habria que generarla) cabria en GPUs de 16 GB como RTX 4080 o RTX 4060 Ti 16 GB, y en 4 bits en GPUs de 8-12 GB, aunque no se ofrecen pesos cuantizados en el repo.
- Opciones de despliegue: el paquete oficial `rzen_embed_inference` (clase `RzenEmbed`); al estar basado en Qwen2-VL, es compatible con frameworks que soportan esa arquitectura (vLLM, TGI, Transformers). Para CPU o entornos sin GPU no hay pesos GGUF publicados en la informacion disponible.
- Latencia y throughput: no disponible; la model card no publica mediciones de latencia ni de embeddings por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | MMEB-V2 Overall | Video-Overall | Visdoc-Overall | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RzenEmbed-v2-7B | 8,29 B | **71,61** | **55,73** | **77,06** | no disponible | Hugging Face (360ZhiNao/RzenEmbed) |
| seed-1.6-embedding | no disponible | 71,27 | 55,34 | 73,44 | no disponible | no disponible en la informacion |
| gme-Qwen2-VL-7B-Instruct | 8,29 B | 57,83 | 38,43 | 75,18 | no disponible | Hugging Face |
| Ops-MM-embedding-v1-7B | 8,29 B | 67,61 | 53,76 | 70,34 | no disponible | Hugging Face |
| VLM2Vec-V2.0-Qwen2VL-2B | 2,21 B | 58,02 | 34,85 | 65,36 | no disponible | Hugging Face |

Frente a gme-Qwen2-VL-7B-Instruct, RzenEmbed-v2-7B mejora el agregado MMEB-V2 en 13,78 puntos y el rendimiento en video en 17,3 puntos, manteniendo una ventaja menor en documentos visuales (1,88 puntos). Frente a Ops-MM-embedding-v1-7B, la mejora es de 4,0 puntos en el global, 1,97 en video y 6,72 en Visdoc. Solo seed-1.6-embedding queda cerca en el global (0,34 puntos por debajo) y supera a RzenEmbed en Image-Overall (77,78 frente a 75,92).

## Limitaciones y advertencias

- La licencia no esta declarada en la informacion disponible; no debe asumirse uso comercial libre hasta verificar los terminos en el repositorio o el paper.
- No se especifican los idiomas soportados; el rendimiento en castellano o en idiomas distintos del ingles no esta documentado.
- No se publica la longitud de contexto; para documentos o videos largos habra que validar empiricamente cuantos tokens o fotogramas admite el modelo.
- No hay pesos cuantizados oficiales (GGUF, AWQ, GPTQ) en el repositorio; el despliegue en hardware modesto requiere cuantizar por cuenta propia y validar la perdida de calidad en recuperacion.
- El modelo es un encoder de embeddings, no un generador: no responde preguntas ni produce texto; para RAG necesita un LLM generador acoplado.
- No se detallan sesgos conocidos ni la composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos de genero, raza o geografia en la recuperacion.
- Riesgo de alucinacion en sentido estricto no aplica (no genera texto), pero si hay riesgo de recuperaciones irrelevantes cuando la consulta cae fuera de la distribucion de entrenamiento; los resultados en VisDoc-OOD (44,38) son los mas bajos del conjunto de benchmarks y sugieren menor robustez fuera de dominio.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta y fue creado el 14 de noviembre de 2026; se trata de un lanzamiento muy reciente sin validacion independiente de la comunidad.
- El identificador de Hugging Face del autor es `360ZhiNao` mientras que la model card referencia `qihoo360/RzenEmbed` en el codigo de ejemplo; conviene verificar cual es el repositorio canonico antes de integrarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/360ZhiNao/RzenEmbed
- Paper (arXiv): https://arxiv.org/abs/2510.27350
- Repositorio GitHub: https://github.com/360CVGroup/RzenEmbed
- Leaderboard MMEB: https://huggingface.co/spaces/TIGER-Lab/MMEB-Leaderboard

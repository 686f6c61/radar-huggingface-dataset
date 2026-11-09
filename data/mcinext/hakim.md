# MCINext/Hakim

## Resumen

Hakim es un modelo de embeddings de texto en persa (farsi) desarrollado por MCINext, disenado para tareas de recuperacion densa, busqueda semantica, generacion aumentada por recuperacion (RAG) y clasificacion de texto. Se presenta como un modelo compacto de aproximadamente 124 millones de parametros, con una arquitectura encoder tipo transformer y entrenamiento en dos fases (no supervisada y supervisada) sobre corpus especificos del persa. Su principal reclamo es haber alcanzado la puntuacion media mas alta (73,81) en la evaluacion FaMTEB reportada en mayo de 2025, unos 8,5 puntos por encima del siguiente modelo comparado (BGE-m3, 65,29).

El modelo es relevante porque el ecosistema de embeddings para persa es mucho mas reducido que el de ingles, y la mayoria de alternativas multilingues genericas rinden peor en tareas especificas del farsi. Hakim se entreno con corpus nativos (Corpesia, hmBlogs y consultas anonimizadas) y con pares supervisados orientados a instrucciones, lo que le permite abordar clasificacion, STS, retrieval, QA y NLI con un unico encoder.

Sin embargo, hay una limitacion critica: Hakim es un modelo propietario de pesos cerrados. Los pesos no son publicos, la API experimental de inferencia fue retirada y el repositorio de Hugging Face se mantiene unicamente como documentacion de investigacion. Por tanto, no es desplegable ni reproducible por terceros; solo puede evaluarse a traves de los resultados publicados en el informe tecnico arXiv:2505.08435.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (tipo BERT/sentence-transformer, no especificado en detalle) |
| Parametros totales | ~124 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Persa (farsi, `fa`) |
| Licencia | no disponible (modelo propietario, pesos cerrados) |
| Formato de pesos | no disponible (pesos no publicados) |

## Arquitectura y entrenamiento

Hakim es un encoder transformer compacto de aproximadamente 124 millones de parametros, orientado a producir embeddings de frase y de parrafo. El entrenamiento se estructuro en tres bloques. El preentrenamiento uso Corpesia (11.000 millones de tokens procedentes de 46 sitios web persas en 21 dominios como noticias, salud, religion y tecnologia), hmBlogs (6.800 millones de tokens de aproximadamente 20 millones de posts de blogs persas) y 8,5 millones de consultas de busqueda anonimizadas.

La fase no supervisada (Pairsia-unsup) empleo 5 millones de pares de texto persa de alta calidad: pares documento-titulo, FAQ, pregunta-respuesta y titulo-resumen de articulos, ademas de datasets traducidos automaticamente (MS MARCO, SAMSum, AdversarialQA, entre otros). La fase supervisada (Pairsia-sup) uso 1,3 millones de pares etiquetados con 9 negativos por consulta, con ajuste fino basado en instrucciones para clasificacion, retrieval, STS, QA y NLI. El modelo incorpora entrenamiento consciente del historial de chat, es decir, datos con contexto conversacional, lo que lo hace adecuado para busqueda en dialogos multi-turno. No se detalla en la informacion disponible si se aplico RLHF, DPO ni tecnicas de decodificacion especulativa (no aplicables a un encoder de embeddings).

## Capacidades

- Generacion de embeddings de texto para similitud semantica y recuperacion densa.
- Clasificacion de texto (tematica y de sentimiento) mediante prefijos de tarea en persa.
- Clustering de textos por similitud semantica.
- Semantic Textual Similarity (STS) entre pares de frases.
- Recuperacion (retrieval) consulta-pasaje para RAG y motores de busqueda.
- Question answering y NLI en configuracion de pares.
- Clasificacion cruzada de dos textos (`cross`) para determinar el tipo de relacion semantica.
- Ajuste fino basado en instrucciones con formatos de entrada especificos por tarea (prefijos en persa).
- Entrenamiento consciente del historial de chat para busqueda en conversaciones.
- Capacidad multilingue: no disponible; el modelo esta disenado exclusivamente para persa.
- Tool calling / function calling: no disponible (no es un modelo generativo).
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Busqueda semantica en corpus persas: indexar documentos (noticias, blogs, FAQ) con embeddings de Hakim y recuperar por similitud coseno; su entrenamiento sobre Corpesia y hmBlogs lo hace especialmente adecuado para dominios persas nativos.
- RAG sobre documentacion en persa: usar Hakim como retriever en un pipeline de generacion aumentada, formateando consultas con `retrieval.query` y pasajes con `retrieval.passage` para maximizar la calidad de recuperacion.
- Clasificacion tematica de textos persas: aplicar el prefijo `classification` para categorizar noticias, tickets o resenas por tema con un encoder compacto de 124M de parametros.
- Analisis de sentimiento en resenas y redes sociales: usar el prefijo `sentiment` para clasificar la polaridad de textos persas en pipelines de monitorizacion de marca.
- Deduplicacion y clustering de documentos: agrupar articulos o posts de blog por similitud semantica usando el prefijo `clustering`, util para sistemas de recomendacion de contenido.
- Deteccion de similitud entre pares de frases: usar los formatos `sts.sent1` y `sts.sent2` para tareas de parafrasis, deteccion de plagio o matching de preguntas frecuentes.
- Busqueda en historiales de chat: gracias al entrenamiento con contexto conversacional, puede emplearse para recuperar respuestas previas relevantes en asistentes conversacionales en persa.

## Benchmarks y rendimiento

Resultados de FaMTEB reportados en mayo de 2025 (informe tecnico arXiv:2505.08435). No deben interpretarse como un leaderboard actualizado.

| Modelo | Media | Classification | Clustering | PairClass. | Reranking | Retrieval | STS | Summarization |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| **Hakim** | **73,81** | **84,56** | **70,46** | **89,75** | 69,46 | 40,43 | 76,62 | **85,41** |
| Hakim-small | 70,45 | 80,19 | 66,31 | 87,41 | 67,30 | 38,05 | 75,53 | 78,40 |
| Hakim-unsup | 64,56 | 60,65 | 58,89 | 86,41 | 67,56 | 37,71 | 79,36 | 61,34 |
| BGE-m3 | 65,29 | 58,75 | 57,73 | 85,21 | **74,56** | 43,38 | 76,35 | 61,07 |
| Jina-embeddings-v3 | 64,53 | 59,93 | 59,15 | 83,71 | 61,26 | **43,51** | **78,65** | 65,50 |
| multilingual-e5-large | 64,40 | 59,86 | 57,19 | 84,42 | 74,34 | 42,98 | 75,38 | 56,61 |
| GTE-multilingual-base | 63,64 | 56,07 | 57,28 | 84,58 | 69,72 | 41,22 | 75,75 | 60,88 |
| multilingual-e5-base | 62,93 | 57,62 | 56,52 | 84,04 | 72,07 | 41,20 | 74,45 | 54,58 |
| Tooka-SBERT | 60,65 | 59,40 | 56,45 | 87,04 | 58,29 | 27,86 | 76,42 | 59,06 |

Hakim lidera en media global, classification, clustering, PairClassification y summarization, pero queda por detras de BGE-m3 y Jina-embeddings-v3 en retrieval y reranking, y por detras de Jina-embeddings-v3 y Hakim-unsup en STS.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con ~124M de parametros en fp32 serian aproximadamente 0,5 GB de pesos, y en fp16 unos 0,25 GB, mas overhead de activaciones y tokenizador.
- GPU recomendadas: no disponible; por tamano, cualquier GPU consumer moderna (RTX 3060 o superior) seria suficiente en teoria.
- Cabe en GPU consumer: si, por tamano, aunque los pesos no son publicos y no puede desplegarse.
- Opciones de despliegue: no disponible; los pesos no estan publicados y la API de inferencia fue retirada. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | FaMTEB (media) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| **Hakim** | ~124M | no disponible | 73,81 | no disponible (propietario) | Pesos cerrados; solo informe |
| BGE-m3 | no disponible | no disponible | 65,29 | no disponible en la informacion | Pesos publicos (modelo abierto de referencia) |
| Jina-embeddings-v3 | no disponible | no disponible | 64,53 | no disponible en la informacion | Pesos publicos (modelo abierto de referencia) |
| multilingual-e5-large | no disponible | no disponible | 64,40 | no disponible en la informacion | Pesos publicos (modelo abierto de referencia) |

Hakim supera a las alternativas multilingues en la media de FaMTEB, pero estas ultimas son desplegables y cubren muchos idiomas, mientras que Hakim solo cubre persa y no es accesible.

## Limitaciones y advertencias

- Pesos cerrados: el modelo no puede descargarse, desplegarse ni reproducirse; el repositorio es solo documentacion.
- API de inferencia retirada: no existe un servicio publico para probar el modelo.
- Licencia no disponible: se desconoce si permite uso comercial, y al ser propietario no hay garantias de uso.
- Monolingue: solo persa (`fa`); no apto para otros idiomas.
- Rendimiento inferior en retrieval (40,43) y reranking (69,46) frente a BGE-m3 y Jina-embeddings-v3, lo que limita su uso en pipelines RAG exigentes.
- Benchmark no actualizado: los resultados de FaMTEB son de mayo de 2025 y el autor advierte que no constituyen un ranking vigente.
- Riesgo de sesgo: el corpus de preentrenamiento proviene de 46 sitios web persas y blogs, con posible sobrerrepresentacion de ciertos dominios (noticias, religion); no se documentan analisis de sesgo.
- Riesgo de alucinacion: no aplica directamente al ser un encoder de embeddings, pero los sistemas RAG que lo usen heredan el riesgo del generador.
- Longitud de contexto no documentada: se desconoce el maximo de tokens por entrada, lo que dificulta planificar su uso en documentos largos.
- Sin soporte documentado para tool calling, agentes ni modos de razonamiento.

## Enlaces

- Hugging Face: https://huggingface.co/MCINext/Hakim
- Informe tecnico (arXiv): https://arxiv.org/abs/2505.08435
- Repositorio de investigacion: el propio repositorio de Hugging Face, mantenido como documentacion.

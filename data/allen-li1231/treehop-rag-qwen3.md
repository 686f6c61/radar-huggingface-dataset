# allen-li1231/treehop-rag-qwen3

## Resumen

TreeHop para Qwen3-Embedding-0.6B es un checkpoint de reescritura de consultas a nivel de embedding para recuperación multi-salto (multi-hop retrieval). Lo desarrolla Zhonghao Li y colaboradores (Kunpeng Zhang, Jinghuai Ou, Shuliang Liu, Xuming Hu) y se publica bajo el identificador `allen-li1231/treehop-rag-qwen3`. En lugar de pedir a un LLM que reescriba la consulta en lenguaje natural entre saltos, TreeHop actualiza directamente el vector de consulta a partir del pasaje recuperado, generando un bucle "Retrieve-Embed-Retrieve" que evita una llamada generativa por salto.

El modelo parte de `Qwen/Qwen3-Embedding-0.6B` como base y añade tres bloques de compuertas apiladas (stacked gates) con gating sigmoide y RMSNorm en los MLP de las compuertas, sumando 176,3 millones de parámetros totales. Resuelve el problema del coste y la latencia de la reescritura de consultas en pipelines RAG multi-salto, donde los enfoques basados en LLM requieren generar texto intermedio en cada salto.

Es relevante porque demuestra que la reescritura de consultas puede hacerse en el espacio de embeddings con un modelo pequeño (0,7 GB de repo), manteniendo o mejorando el recall frente a la variante BGE-m3 del mismo método en tres de los cuatro conjuntos evaluados. El checkpoint corresponde a la semilla 1307, época 9, la mejor época por pérdida de validación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Reescritor de consultas a nivel de embedding sobre Qwen3-Embedding-0.6B; tres compuertas apiladas con gating sigmoide y RMSNorm en los MLP de compuerta |
| Parametros totales | 176.300.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Dimension de proyeccion | 1024 (usada en el ejemplo de uso) |
| Tamano del repo | 0,7 GB |
| Modelo base | Qwen/Qwen3-Embedding-0.6B |
| Libreria | treehop-rag |

## Arquitectura y entrenamiento

TreeHop no es un modelo generativo: es un reescritor de consultas que opera sobre embeddings. Sobre los embeddings producidos por Qwen3-Embedding-0.6B aplica tres compuertas apiladas con activación sigmoide y RMSNorm dentro de los bloques MLP de las compuertas, con un total de 176,3 M de parámetros. El mecanismo actualiza el vector de consulta a partir del pasaje recuperado en el salto anterior, de modo que el siguiente salto se lanza con un embedding refinado sin generar texto intermedio.

El entrenamiento sigue la misma receta que la versión BGE-m3: pérdida InfoNCE con 6 negativos, tasa de aprendizaje 2e-5 y tamaño de lote 64, sobre los conjuntos 2WikiMultihop y MuSiQue, usando pasajes de HotpotQA como negativos adicionales. Este checkpoint concreto es la semilla 1307 en la época 9. La base de pasajes debe indexarse con Qwen3-Embedding-0.6B, con cada pasaje formateado como `Title: {title}\nContext: {text}` tras la normalización de texto de TreeHop; las bases de embeddings BGE-m3 del repositorio principal no son compatibles.

## Capacidades

- Recuperación multi-salto: actualiza el embedding de consulta entre saltos para encadenar recuperaciones (bucle Retrieve-Embed-Retrieve).
- Reescritura de consultas a nivel de embedding, sin generación de texto intermedio.
- Criterios de parada por redundancia y por poda capa a capa (layer-wise top pruning).
- Configuración de número de saltos (`n_hop`) y de pasajes por salto (`top_n`) en tiempo de inferencia.
- Integración con índices densos construidos sobre Qwen3-Embedding-0.6B y recuperación sobre GPU (`cuda`) o CPU/Metal.
- No soporta generación de texto, tool calling, agentes, visión ni audio: es un componente de recuperación, no un LLM.

## Casos de uso

- RAG multi-salto en dominios documentales: encadenar dos saltos con `n_hop=2` y `top_n=5` para responder preguntas que requieren combinar evidencia de varios pasajes, con recall de 0,717 en HotpotQA (distractor) y 0,884 en 2WikiMultihop.
- Asistentes de investigación sobre corpus científicos: indexar pasajes con Qwen3-Embedding-0.6B y usar TreeHop para refinar la consulta tras el primer salto, reduciendo la dependencia de un LLM reescritor.
- Pipelines RAG de baja latencia: al eliminar la generación de consultas intermedias, el coste por salto se limita a una búsqueda vectorial y una pasada por un modelo de 176 M de parámetros.
- Verificación de hechos con cadenas de evidencia: usar la chain recall (0,478 en HotpotQA, 0,737 en 2WikiMultihop) para medir si se recuperan todos los pasajes dorados de una pregunta.
- Sistemas de preguntas y respuestas sobre bases de noticias o documentación interna: el formato de pasaje `Title: {title}\nContext: {text}` encaja con corpus estructurados por título y cuerpo.
- Evaluación y ablation de recuperadores: al ser un checkpoint pequeño con licencia MIT, sirve para comparar estrategias de reescritura (basada en LLM frente a basada en embedding) sobre los mismos índices.
- Despliegue en hardware modesto: el modelo de 0,7 GB puede ejecutarse junto al índice en una GPU de consumo, con la indexación en CPU/Metal si es necesario.

## Benchmarks y rendimiento

Resultados publicados en la model card (dos saltos, top 5 por salto, ambos criterios de parada; recall = proporción de pasajes dorados recuperados; chain recall = proporción de preguntas con todos los pasajes dorados recuperados; *k* = media de pasajes recuperados por pregunta):

| Dataset | Preguntas | TreeHop + Qwen3-Embedding-0.6B (recall / chain recall / k) | TreeHop + BGE-m3 (recall / chain recall / k) |
|---|---|---|---|
| HotpotQA (distractor) | 5.918 | 0,717 / 0,478 / 8,84 | 0,714 / 0,492 / 9,19 |
| 2WikiMultihop | 9.536 | 0,884 / 0,737 / 9,36 | 0,781 / 0,615 / 9,54 |
| MuSiQue | 2.417 | 0,546 / 0,274 / 8,45 | 0,481 / 0,215 / 8,90 |
| MultiHop-RAG | 816 | 0,637 / 0,244 / 7,71 | 0,589 / 0,211 / 8,36 |

La desviación típica de cada métrica de Qwen3 es inferior a 0,01 en tres semillas de entrenamiento (1307, 42, 2027). No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint pesa 0,7 GB en safetensors y el ejemplo de uso emplea `projection_size=1024` con índice en `cuda`.
- GPU recomendadas: no disponibles en la información proporcionada; el ejemplo soporta `index_device="cuda"` o `"cpu"` en Apple Metal.
- Cabe en GPU de consumo: sí, por el tamaño del checkpoint (176,3 M de parámetros), aunque la VRAM total depende del índice de pasajes cargado en memoria.
- Opciones de despliegue: librería `treehop-rag` (`TreeHopModel`, `MultiHopRetriever`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TreeHop + Qwen3-Embedding-0.6B (este) | 176,3 M | no disponible | Reescritura de consulta a nivel de embedding sobre Qwen3-Embedding-0.6B | MIT | Hugging Face |
| TreeHop + BGE-m3 | no disponible | no disponible | Reescritura de consulta a nivel de embedding sobre BGE-m3 | no disponible en la información | Hugging Face |
| Qwen3-Embedding-0.6B (base) | no disponible | no disponible | Modelo de embedding sin reescritura multi-salto | no disponible en la información | Hugging Face |

La comparación con alternativas de reescritura basadas en LLM no está disponible en la información proporcionada. Frente a TreeHop + BGE-m3, la variante Qwen3 mejora el recall en 2WikiMultihop (0,884 frente a 0,781), MuSiQue (0,546 frente a 0,481) y MultiHop-RAG (0,637 frente a 0,589), y queda ligeramente por debajo en chain recall de HotpotQA (0,478 frente a 0,492).

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni respuestas; solo reescribe embeddings de consulta.
- La base de pasajes debe indexarse obligatoriamente con Qwen3-Embedding-0.6B y el formato `Title: {title}\nContext: {text}`; los índices BGE-m3 no son compatibles.
- El rendimiento en MuSiQue es moderado (recall 0,546, chain recall 0,274), lo que limita su uso en preguntas de varios saltos con evidencia dispersa.
- El checkpoint está entrenado sobre 2WikiMultihop y MuSiQue, con pasajes de HotpotQA como negativos; el comportamiento fuera de esa distribución no está documentado.
- Idiomas soportados no disponibles: no se especifica cobertura multilingüe, aunque el modelo base Qwen3-Embedding es multilingüe.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí riesgo de recuperar pasajes irrelevantes que un LLM posterior podría usar incorrectamente.
- Sesgos conocidos: no disponibles.
- Licencia MIT, lo que permite uso comercial; no obstante, conviene verificar las condiciones de la licencia del modelo base Qwen3-Embedding-0.6B.
- Sin descargas ni likes en el momento de la consulta y sin pipeline declarado; la madurez de la librería `treehop-rag` para producción no está documentada.
- Longitud de contexto y tipos de cuantización no disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/allen-li1231/treehop-rag-qwen3
- Variante BGE-m3 (documenta el método, reproducción del paper y entrenamiento): https://huggingface.co/allen-li1231/treehop-rag
- Modelo base: https://huggingface.co/Qwen/Qwen3-Embedding-0.6B
- Paper (arXiv 2504.20114): https://arxiv.org/abs/2504.20114

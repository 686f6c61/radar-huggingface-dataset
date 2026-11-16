# Louvain/rerank-4b-erb

## Resumen

rerank-4b-erb es un modelo de reranking de documentos desarrollado por Louvain, derivado de Qwen/Qwen3-Reranker-4B mediante un ajuste fino con LoRA sobre el corpus sintético de una unica empresa, el que publica EnterpriseRAG-Bench. No es un modelo generativo de proposito general: su funcion es puntuar pares consulta-documento y ordenar un conjunto de candidatos devuelto por un buscador de primera etapa (BM25 y vecinos densos). Resuelve el problema clasico de la segunda etapa de un pipeline RAG, donde el recall del primer recuperador es alto pero la precision del top-k es baja.

Tecnicamente mantiene la arquitectura del modelo base Qwen3 de 4.021.784.576 parametros, con la misma ventana de contexto de 32.768 tokens y el mismo esquema de puntuacion basado en la diferencia logit("yes") − logit("no") en la posicion de respuesta. El ajuste es un adaptador LoRA de rango 32 aplicado a todas las proyecciones de atencion y MLP, fusionado en los pesos base sin cambios arquitectonicos.

Su relevancia es acotada pero instructiva: demuestra que un ajuste muy pequeno (2.239 grupos, una epoca, 1,7 horas en una H100) sobre un dominio estrecho mejora el ranking frente al base (80 a 84 aciertos en rank 1 sobre 94 preguntas) y se acerca a un reranker comercial como Cohere rerank-v4.0-pro (86). Es, por tanto, un caso de autoajuste de un workspace concreto mas que un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con cabeza de clasificacion de secuencia (Qwen3ForSequenceClassification) |
| Parametros totales | 4.021.784.576 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del base Qwen3-Reranker-4B); entrenado con longitud maxima de 8.192 tokens |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos publicados en safetensors en bfloat16 |
| Idiomas soportados | ingles unicamente, segun el autor |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, sha256 f21d63076f8b1551afd7c702bf456838b0fd70e816e5492f89f89e90aad36f71) |

## Arquitectura y entrenamiento

El modelo reutiliza integramente la arquitectura de Qwen3-Reranker-4B: un transformer decoder-only con atencion completa, rope_theta de 1.000.000 y una cabeza de clasificacion de secuencia que produce un unico logit por par (consulta, documento). La puntuacion de relevancia se obtiene como logit("yes") − logit("no") en la posicion del token de respuesta, con entradas alineadas por la izquierda (left-padding). No hay cambio de arquitectura respecto al base.

El entrenamiento consistio en un adaptador LoRA de rango 32 sobre todas las proyecciones de atencion y MLP, fusionado posteriormente en los pesos. Los datos son enteramente sinteticos: preguntas generadas por qwen/qwen3-235b-a22b-2507 a partir de pasajes del corpus de EnterpriseRAG-Bench, emparejadas con su documento fuente como positivo y hasta 7 negativos obtenidos de una busqueda fusionada BM25 + vecinos densos. Cada texto es un documento completo truncado a 8.000 caracteres. Se aplico un filtro de falsos negativos descartando cualquier negativo que el modelo base puntuara igual o por encima de su positivo, y se excluyeron todos los documentos gold de las 100 preguntas de dev y de los 94 pools de evaluacion (10.221 documentos). Tras el filtrado quedaron 2.239 grupos. La funcion de perdida es entropia cruzada softmax listwise sobre los logits yes/no, con una epoca, learning rate 5e-5, acumulacion de 4 grupos, longitud maxima de 8.192 tokens y semilla 241. El coste de computo fue de aproximadamente 1,7 horas en una H100, mas la pasada de filtrado.

## Capacidades

- Reranking de documentos completos para una consulta dada, devolviendo una puntuacion de relevancia continua por par.
- Puntuacion listwise: el modelo esta entrenado con una softmax sobre el conjunto de candidatos, no con clasificacion binaria independiente.
- Manejo de documentos largos de hasta 8.000 caracteres por documento en el regimen de entrenamiento.
- Integracion como sidecar en el motor de retrieval abierto de Louvain mediante `LOUVAIN_RERANK_KIND=qwen3-reranker` y `LOUVAIN_RERANK_MODEL`.
- Despliegue en vLLM usando los overrides de `Qwen3ForSequenceClassification` del modelo base.
- No soporta generacion de texto libre, tool calling, agentes ni capacidades multimodales: es exclusivamente un modelo de ranking.
- Multilingue: no. Solo ingles, segun el autor.

## Casos de uso

- Segunda etapa de un pipeline RAG empresarial: dado un pool de candidatos recuperados por BM25 y busqueda densa (mediana de 108 documentos por consulta en la evaluacion del autor), el modelo reordena y coloca el documento relevante en el top-1 o top-3, mejorando la calidad del contexto que recibe el generador.
- Busqueda documental interna sobre corpus de una sola organizacion: el ajuste sobre documentos de una empresa concreta lo hace especialmente adecuado para intranets, wikis corporativas o bases de conocimiento donde el vocabulario y el estilo son homogeneos.
- Filtrado de contexto para reducir coste de inferencia: al subir la precision del top-k, permite pasar menos documentos al modelo generador, reduciendo tokens de entrada y latencia en el pipeline completo.
- Sustitucion de rerankers comerciales en entornos con requisitos de licencia permisiva: al ser Apache-2.0, puede desplegarse en infraestructura propia sin dependencia de APIs externas ni coste por consulta.
- Evaluacion comparativa de estrategias de retrieval: sirve como referencia base (junto con el Qwen3-Reranker-4B sin ajustar) para medir la ganancia de un ajuste de dominio sobre un corpus propio.
- Prototipado de stacks RAG autoajustados: el procedimiento descrito (generacion sintetica de preguntas, minado de negativos con filtro de falsos negativos, LoRA de rango 32, una epoca) es replicable en 1,7 horas de H100 para cualquier corpus nuevo, lo que lo convierte en una plantilla metodologica.

## Benchmarks y rendimiento

Evaluacion del autor sobre 94 preguntas dev de EnterpriseRAG-Bench con documentos gold. El pool de candidatos por pregunta es la union de dos busquedas de primera etapa (mediana de 108 documentos), cada documento completo a 8.000 caracteres. La tabla cuenta preguntas con un documento gold en rango 1 / ≤3 / ≤10 / ≤24:

| Modelo | Rank 1 / ≤3 / ≤10 / ≤24 |
|---|---|
| Qwen3-Reranker-4B (base) | 80 / 86 / 88 / 89 |
| rerank-4b-erb | 84 / 87 / 89 / 89 |
| Cohere rerank-v4.0-pro (referencia) | 86 / 89 / 89 / 89 |

En 300 grupos sinteticos reservados, el positivo queda en primera posicion en 214 casos (base: 183), con MRR de 0.814 frente a 0.744 del base.

El autor advierte que estas cifras son metricas de ranking, no una puntuacion de benchmark completa: sus ejecuciones evaluadas anaden retrieval, un agente y un lector alrededor del reranker. Ademas, la tabla se puntuo en bfloat16 sobre una H100, y en esa precision el orden de dos documentos con puntuaciones dentro de un paso de bfloat16 puede variar segun el lote; en 20 de los pools el rank 1 fue identico y ningun par del top-3 difirio en mas de un paso, pero dos golds profundos se movieron un puesto (11→12 y 25→26). Puntuar en float32 elimina esa ambiguedad.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 8,1 GB en safetensors (bfloat16), por lo que se necesitan aproximadamente 8-9 GB de VRAM solo para los pesos, mas memoria para activaciones y KV cache segun la longitud de los documentos.
- GPU recomendadas: H100 (configuracion usada por el autor para entrenamiento y evaluacion), A100 40/80 GB para despliegues de produccion con lotes grandes.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas (RTX 4090, RTX 4080 Super, RTX 3090) en bfloat16; en GPUs de 12 GB requeriria cuantizacion, no documentada por el autor.
- Opciones de despliegue: vLLM con los overrides de `Qwen3ForSequenceClassification` del modelo base; sidecar del motor abierto de Louvain (`apps/nlp/rerank.py`). No se documenta soporte de llama.cpp, Ollama ni TGI.
- Version de transformers: obligatorio transformers 5.22.2 (la version con la que se guardo el modelo); transformers 4.57.6 no puede leer su configuracion de tokenizer. El config declara rope_theta (1.000.000) en el nivel superior junto a rope_parameters.
- Latencia y throughput: no disponibles en la informacion proporcionada. El unico dato de computo es el entrenamiento (1,7 h en una H100).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rank 1 en la evaluacion del autor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rerank-4b-erb | 4.021.784.576 | 32.768 tokens (entrenado a 8.192) | 84/94 | Apache-2.0 | Hugging Face (Louvain/rerank-4b-erb) |
| Qwen3-Reranker-4B (base) | 4.021.784.576 | 32.768 tokens | 80/94 | Apache-2.0 | Hugging Face (Qwen/Qwen3-Reranker-4B) |
| Cohere rerank-v4.0-pro | no disponible | no disponible | 86/94 | propietaria (API) | API comercial de Cohere |

La comparacion se limita a estos tres modelos porque son los unicos con datos en la informacion proporcionada. El modelo ajustado supera al base en rank 1 (+4 preguntas) y en MRR sobre grupos sinteticos (0.814 frente a 0.744), y queda a dos preguntas del reranker comercial de Cohere, con la ventaja de ser desplegable en infraestructura propia bajo Apache-2.0.

## Limitaciones y advertencias

- Dominio estrecho: esta ajustado a los documentos sinteticos de una unica empresa. Sobre documentos de otras organizaciones, el autor espera un rendimiento intermedio entre el modelo base y un modelo ajustado especificamente sobre esos documentos.
- Solo ingles: el ajuste se realizo unicamente en ingles; no hay evidencia de comportamiento en otros idiomas.
- Riesgo de sobreajuste al corpus: aunque se excluyeron las preguntas, respuestas y etiquetas gold del benchmark, el modelo ha visto el resto de documentos del corpus, lo que el autor describe explicitamente como el significado de autoajustarse sobre un workspace.
- Precision numerica: en bfloat16 el orden de documentos con puntuaciones muy proximas puede variar segun el lote; se recomienda puntuar en float32 para rankings estables en produccion.
- Dependencia de version: requiere transformers 5.22.2; versiones anteriores no leen su configuracion de tokenizer, lo que puede romper despliegues existentes.
- No es un modelo generativo: no puede usarse para responder preguntas, generar texto, invocar herramientas ni razonar de forma multi-paso; su unica salida es una puntuacion de relevancia.
- Adopcion practicamente nula: 2 descargas y 0 likes en el momento de la consulta, sin validacion independiente de las cifras reportadas por el autor.
- Licencia Apache-2.0: permite uso comercial sin restricciones adicionales, pero no hay garantias ni soporte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Louvain/rerank-4b-erb
- Modelo base: https://huggingface.co/Qwen/Qwen3-Reranker-4B
- EnterpriseRAG-Bench: https://onyx.app/enterpriserag-bench

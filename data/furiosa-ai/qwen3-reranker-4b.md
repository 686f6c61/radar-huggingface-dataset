# furiosa-ai/Qwen3-Reranker-4B

## Resumen

Qwen3-Reranker-4B es un modelo de reranking de 4.021.784.576 parametros construido sobre el backbone transformer denso de Qwen3. Dado un par consulta-documento, produce una puntuacion de relevancia que se utiliza para reordenar los resultados de recuperacion, tipicamente como segunda etapa en pipelines de RAG y busqueda. El repositorio `furiosa-ai/Qwen3-Reranker-4B` no es un finetune nuevo: empaqueta el modelo upstream `Qwen/Qwen3-Reranker-4B` junto con un Furiosa Executable Bundle (FXB) para ejecutarlo en hardware FuriosaAI RNGD mediante la libreria Furiosa-LLM.

La relevancia practica de esta ficha esta en que documenta una distribucion especifica del reranker para aceleradores dedicados: el modelo corre en BF16 nativo sin cuantizacion, con tensor-parallel de 8 PEs mapeado a una sola tarjeta RNGD. Para el resto de frameworks (Sentence Transformers, vLLM, Transformers) se remite a la model card upstream. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Se trata, por tanto, de un componente de infraestructura de recuperacion de informacion, no de un modelo generativo general: su salida es una puntuacion, y su valor esta en mejorar la precision del ranking en la fase final de un pipeline de busqueda.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer denso) |
| Parametros totales | 4.021.784.576 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | ninguna; inferencia en BF16 nativo |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors + Furiosa Executable Bundle (FXB) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen3, con 4.021.784.576 parametros, reutilizado como reranker. La arquitectura de reranking sigue el esquema clasico de cross-encoder: la consulta y el documento candidato se procesan conjuntamente y el modelo emite una puntuacion de relevancia, en lugar de comparar embeddings independientes como haria un bi-encoder. Esto permite capturar interacciones finas entre consulta y documento a costa de mayor coste computacional por par evaluado.

No se dispone, en la informacion proporcionada, de datos sobre volumen de tokens de entrenamiento, composicion del dataset, ni sobre si se aplicaron fases de RLHF o DPO especificas para el reranking. El repositorio es una redistribucion del modelo upstream de Qwen con un bundle de ejecucion para FuriosaAI RNGD; la innovacion tecnica de esta publicacion es de despliegue, no de entrenamiento: empaquetado FXB, tensor-parallel de 8 PEs en una unica tarjeta RNGD y exposicion de endpoints compatibles con la API de rerank de Cohere/Jina (`/v1/rerank` y `/v1/score`).

## Capacidades

- Puntuacion de relevancia consulta-documento y reordenacion de resultados de recuperacion.
- Reranking de listas de documentos con parametro `top_n` para truncar a los mas relevantes.
- Endpoint `/v1/rerank` compatible con la API de Cohere/Jina, tambien usada por vLLM.
- Endpoint `/v1/score` para puntuar pares consulta-documento sin reordenar.
- Servidor compatible con OpenAI mediante `furiosa-llm serve`.
- API Python offline mediante el constructor `LLM` y el metodo `score`.
- Ejecucion en BF16 nativo sin cuantizacion sobre FuriosaAI RNGD.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, audio, tool calling ni agentes; el modelo es exclusivamente un reranker.

## Casos de uso

- Segunda etapa de RAG: tras recuperar candidatos con un retriever vectorial o lexico, el reranker reordena los documentos por relevancia antes de pasarlos al modelo generativo, reduciendo el ruido en el contexto inyectado.
- Busqueda empresarial interna: reordenar resultados de un buscador corporativo sobre documentacion, wikis o tickets, usando el endpoint `/v1/rerank` con `top_n` para entregar solo los fragmentos mas pertinentes.
- Filtrado de FAQ y soporte: puntuar pares pregunta-respuesta candidata para seleccionar la respuesta mas adecuada antes de mostrarla o de pasarla a un agente.
- Evaluacion de calidad de retrieval: usar `/v1/score` para medir la relevancia de pares consulta-documento en conjuntos de evaluacion y comparar configuraciones de recuperacion.
- Deduplicacion y priorizacion de noticias o articulos: ordenar un lote de documentos frente a una consulta tematica para construir un resumen o un digest priorizado.
- Despliegue en acelerador dedicado: servir el reranker en una tarjeta FuriosaAI RNGD cuando se quiera liberar GPU convencionales para el modelo generativo del pipeline.
- Reordenacion en pipelines de recomendacion de contenido: puntuar candidatos recuperados por heuristica y reordenarlos por relevancia semantica frente al perfil o la consulta del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia en BF16 nativo, sin cuantizacion; el repo pesa 8,9 GB.
- Hardware de referencia documentado: FuriosaAI RNGD, con tensor-parallel de 8 PEs mapeado a una unica tarjeta RNGD (8 PEs por tarjeta).
- GPU convencionales: no se proporcionan requisitos de VRAM ni modelos de GPU recomendados en la informacion disponible; para esos entornos se remite a la model card upstream.
- Despliegue: `furiosa-llm serve` (servidor compatible con OpenAI, endpoints `/v1/rerank` y `/v1/score`) y API Python offline con `furiosa_llm.LLM`. El modelo upstream tambien es ejecutable con Sentence Transformers, vLLM y Transformers.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| furiosa-ai/Qwen3-Reranker-4B | 4.021.784.576 | no disponible | en | Apache 2.0 | Hugging Face, Furiosa-LLM |
| Qwen/Qwen3-Reranker-4B (upstream) | 4.021.784.576 | no disponible | en | Apache 2.0 | Hugging Face, Sentence Transformers, vLLM, Transformers |
| Rerankers de menor tamano de la serie Qwen3-Reranker | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face |

La comparacion directa con alternativas de otros fabricantes no esta disponible en la informacion proporcionada; no se inventan datos de rendimiento ni de contexto para terceros.

## Limitaciones y advertencias

- Modelo exclusivamente de reranking: no genera texto ni ejecuta tareas de razonamiento, codigo o agentes.
- Idioma documentado: solo ingles (`en`); el rendimiento en castellano no esta verificado en la informacion disponible.
- Longitud de contexto no documentada en esta ficha; conviene consultar la model card upstream antes de disenar fragmentos largos.
- Riesgo de sesgos heredados del corpus de entrenamiento de Qwen3, no evaluado en esta distribucion.
- El reranker puede asignar puntuaciones altas a documentos superficialmente similares pero factualmente irrelevantes; su salida debe tratarse como senal de ranking, no como verificacion de veracidad.
- El bundle FXB esta orientado a FuriosaAI RNGD; fuera de ese hardware debe usarse el modelo upstream con Sentence Transformers, vLLM o Transformers.
- Sin cuantizacion disponible en esta distribucion: no hay variantes GGUF ni INT8/INT4 documentadas, lo que limita el despliegue en hardware con poca memoria.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar los terminos del modelo upstream y de Furiosa-LLM para obligaciones de atribucion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/furiosa-ai/Qwen3-Reranker-4B
- Modelo upstream: https://huggingface.co/Qwen/Qwen3-Reranker-4B
- Documentacion de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Servidor Furiosa-LLM (`furiosa-llm serve`): https://developer.furiosa.ai/latest/en/furiosa_llm/furiosa-llm-serve.html
- Instalacion de Furiosa-LLM: https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html#installing-furiosa-llm
- FuriosaAI: https://furiosa.ai
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0

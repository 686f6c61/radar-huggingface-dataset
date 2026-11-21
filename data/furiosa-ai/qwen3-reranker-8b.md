# furiosa-ai/Qwen3-Reranker-8B

## Resumen

Qwen3-Reranker-8B es un modelo de reranking de 8.188.548.096 parámetros construido sobre el backbone transformer denso de Qwen3. Dado un par consulta-documento, produce una puntuación de relevancia que se utiliza para reordenar los resultados de una primera etapa de recuperación, un componente habitual en pipelines de RAG y búsqueda. El modelo original lo desarrolla el equipo Qwen (Alibaba); esta ficha describe la distribución publicada por furiosa-ai, que empaqueta los pesos originales junto con un Furiosa Executable Bundle (FXB) para ejecutarlo en hardware FuriosaAI RNGD mediante la librería Furiosa-LLM.

La relevancia de esta publicación es de despliegue: no modifica los pesos del modelo base, sino que añade un artefacto precompilado que permite servir el reranker en aceleradores RNGD con precisión nativa BF16 y sin cuantización. El modelo mantiene la licencia Apache 2.0 del upstream y la misma interfaz de uso (puntuación de pares consulta-documento), pero la ruta soportada oficialmente en este repositorio es Furiosa-LLM sobre RNGD; para otros frameworks (Sentence Transformers, vLLM, Transformers) la model card remite a la ficha del modelo original.

El interés práctico está en la segunda etapa de recuperación: un reranker de 8B permite una discriminación semántica fina entre documentos candidatos, a costa de un coste computacional mayor que los cross-encoders pequeños. Esta distribución está pensada para equipos que ya operan infraestructura FuriosaAI y quieren integrar el reranking en el mismo plano de aceleración que el resto del stack.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer denso) |
| Parámetros totales | 8.188.548.096 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | sin cuantización; ejecución en BF16 nativo |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors + Furiosa Executable Bundle (FXB) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen3, reutilizado como cross-encoder para reranking: la entrada es un par consulta-documento y la salida es una puntuación de relevancia. La model card de esta distribución no detalla el proceso de entrenamiento del modelo base (número de tokens, composición del corpus, uso de RLHF/DPO u otras etapas de alineación); esa información corresponde a la ficha upstream de Qwen/Qwen3-Reranker-8B, que no forma parte de la información proporcionada.

La aportación técnica específica de este repositorio es el empaquetado para FuriosaAI RNGD: un FXB precompilado que se descubre automáticamente al cargar el modelo con el constructor `LLM` de Furiosa-LLM. La estrategia de paralelismo indicada es tensor-parallel de tamaño 8 PEs, que se corresponde con una única tarjeta RNGD (8 PEs por tarjeta). No se aplica cuantización: el modelo se ejecuta en BF16 nativo. El servidor de Furiosa-LLM expone endpoints compatibles con la API de rerank de Cohere/Jina (`/v1/rerank`) y un endpoint de puntuación directa (`/v1/score`).

## Capacidades

- Puntuación de relevancia para pares consulta-documento (cross-encoding).
- Reranking de listas de documentos candidatos, con soporte de `top_n` para truncar a los más relevantes.
- Endpoint `/v1/rerank` compatible con la API de Cohere/Jina, también usada por vLLM.
- Endpoint `/v1/score` para obtener puntuaciones de pares sin reordenar.
- Uso offline mediante la API Python de Furiosa-LLM (`LLM(...).score(query, documents)`).
- Servidor compatible con OpenAI para despliegue (`furiosa-llm serve`).
- Capacidad multilingüe: no disponible; el modelo declara únicamente inglés (`en`).
- Tool calling, agentes, visión, audio o modo thinking: no disponible / no aplicable a un modelo de reranking.

## Casos de uso

- Segunda etapa de RAG: tras una recuperación densa o léxica que devuelve, por ejemplo, 50-100 candidatos, el reranker reordena los documentos por relevancia semántica antes de pasarlos al generador, reduciendo el ruido en el contexto.
- Búsqueda empresarial sobre corpus internos: reordenar resultados de un buscador sobre documentación, tickets o wikis para que los fragmentos más pertinentes aparezcan primero.
- Filtrado de candidatos en sistemas de preguntas y respuestas: usar `/v1/score` para descartar documentos por debajo de un umbral antes de costosas etapas posteriores.
- Evaluación de calidad de recuperación: puntuar pares consulta-documento de forma sistemática para construir conjuntos de evaluación o comparar configuraciones del retriever.
- Deduplicación y selección de diversidad: puntuar múltiples fragmentos solapados de un mismo documento y conservar los más relevantes para el contexto final.
- Despliegue en infraestructura FuriosaAI: servir el reranker en RNGD con `furiosa-llm serve` y consumirlo desde aplicaciones existentes mediante la API compatible con Cohere/Jina, sin cambiar el cliente.
- Integración en pipelines con vLLM o Transformers: la model card indica que el mismo modelo funciona en esos frameworks, aunque para esa ruta remite a la ficha upstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 8.188.548.096 parámetros en BF16 el peso de los pesos ronda los 16 GB, a lo que hay que sumar memoria para activaciones y KV cache.
- Hardware soportado oficialmente en este repositorio: FuriosaAI RNGD, con tensor-parallel de 8 PEs sobre una única tarjeta.
- GPU consumer: no se documenta soporte en este repositorio; la model card remite a la ficha upstream para otras rutas de ejecución.
- Opciones de despliegue documentadas: Furiosa-LLM (`furiosa-llm serve`, API Python `LLM`). La model card menciona Sentence Transformers, vLLM y Transformers como frameworks alternativos, sin detallar configuración.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad / notas |
|---|---|---|---|---|
| furiosa-ai/Qwen3-Reranker-8B | 8.188.548.096 | no disponible | Apache 2.0 | Pesos safetensors + FXB para RNGD; 753 descargas |
| Qwen/Qwen3-Reranker-8B (upstream) | no disponible en la información | no disponible | Apache 2.0 | Modelo base; ruta recomendada para vLLM, Transformers y Sentence Transformers |
| Otras alternativas de reranking | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- El modelo declara únicamente inglés; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Es un modelo de reranking, no un generador: no produce texto, solo puntuaciones de relevancia.
- La ruta de ejecución soportada en este repositorio es específica de hardware FuriosaAI RNGD; fuera de esa plataforma hay que acudir al modelo upstream.
- No se documentan sesgos conocidos ni tasas de alucinación; al ser un scorer, el riesgo principal es una ordenación errónea de documentos, no la fabricación de contenido.
- La longitud máxima de contexto no está indicada en la información disponible, lo que impide planificar el tamaño de los fragmentos con precisión.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar los términos del modelo base upstream y de las dependencias de Furiosa-LLM.
- El repositorio tiene 0 likes y 753 descargas en el momento de la consulta; es una distribución de nicho y no un artefacto ampliamente validado por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/furiosa-ai/Qwen3-Reranker-8B
- Modelo base upstream: https://huggingface.co/Qwen/Qwen3-Reranker-8B
- Documentación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Servidor Furiosa-LLM (`furiosa-llm serve`): https://developer.furiosa.ai/latest/en/furiosa_llm/furiosa-llm-serve.html
- Instalación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html#installing-furiosa-llm
- FuriosaAI: https://furiosa.ai
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0

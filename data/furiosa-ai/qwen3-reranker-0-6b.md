# furiosa-ai/Qwen3-Reranker-0.6B

## Resumen

Qwen3-Reranker-0.6B es un modelo de reranking de 0,6 mil millones de parámetros construido sobre el backbone transformer denso de Qwen3. Dado un par consulta-documento, produce una puntuación de relevancia que permite reordenar los resultados de una primera etapa de recuperación, un paso habitual en pipelines de generación aumentada por recuperación (RAG) y en sistemas de búsqueda. El modelo original lo desarrolla el equipo Qwen (Alibaba); esta ficha corresponde a la réplica publicada por FuriosaAI, que añade un paquete ejecutable propietario (Furiosa Executable Bundle, FXB) para ejecutarlo sobre aceleradores RNGD.

La relevancia de esta publicación es fundamentalmente de despliegue: no modifica los pesos del modelo base, sino que empaqueta los pesos en safetensors junto con un artefacto FXB que permite servir el reranker sobre hardware NPU de FuriosaAI mediante la librería `furiosa-llm`. Para el resto de plataformas (Transformers, Sentence Transformers, vLLM), el modelo funciona igual que el original de Qwen.

Con 595.776.512 parámetros reales, licencia Apache 2.0 y soporte declarado únicamente para inglés, es una pieza ligera y orientada a producción para la segunda fase de ranking en sistemas de búsqueda y RAG, no un modelo generativo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer denso) |
| Parametros totales | 595.776.512 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | ninguna en el bundle publicado (BF16 nativo); no se documentan otras variantes |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors + Furiosa Executable Bundle (FXB) |
| Tarea (pipeline) | text-classification (reranking / scoring de pares consulta-documento) |
| Entrada / salida | texto (par consulta-documento) / puntuación de relevancia |
| Motor de inferencia soportado (bundle) | Furiosa-LLM |
| Hardware soportado (bundle) | FuriosaAI RNGD |
| Estrategia de paralelismo | tensor-parallel de 8 PEs (una tarjeta RNGD) |
| Tamano del repositorio | 1,9 GB |
| Modelo base | Qwen/Qwen3-Reranker-0.6B |

## Arquitectura y entrenamiento

El modelo se apoya en el backbone Qwen3 denso, el mismo utilizado en la familia Qwen3-Reranker. La tarea es de scoring: recibe una consulta y un conjunto de documentos candidatos y emite una puntuación de relevancia por documento, que se usa para reordenar los resultados de una etapa previa de recuperación (típicamente búsqueda léxica o vectorial). No es un modelo generativo en esta configuración, sino un clasificador de pares.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas del reranker más allá de su base Qwen3. La contribución de esta réplica de FuriosaAI es de empaquetado y despliegue: incluye un FXB compilado para RNGD y una estrategia de paralelismo tensor de 8 PEs sobre una sola tarjeta, sin cuantización (BF16 nativo).

## Capacidades

- Reranking de documentos: reordena una lista de candidatos según su relevancia respecto a una consulta.
- Scoring directo de pares consulta-documento mediante el endpoint `/v1/score` o el método `score` de la API Python.
- Integración en pipelines RAG como segunda etapa de ranking tras la recuperación inicial.
- Servido mediante API compatible con OpenAI (`furiosa-llm serve`), con endpoint `/v1/rerank` compatible con la API de Cohere/Jina y con vLLM.
- Filtrado por `top_n` para conservar únicamente los documentos más relevantes.
- Uso offline mediante la clase `LLM` de `furiosa_llm`, con descubrimiento automático del FXB incluido en el repositorio.
- Soporte declarado únicamente para inglés.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Reranking en pipelines RAG: tras recuperar candidatos con un retriever vectorial, el modelo puntúa cada par consulta-documento y reordena los resultados antes de pasarlos al modelo generador, mejorando la precisión del contexto inyectado.
- Búsqueda empresarial sobre documentación interna: se usa como segunda etapa sobre los resultados de un buscador léxico para priorizar los fragmentos más pertinentes a la consulta del empleado.
- Filtrado de candidatos en sistemas de preguntas y respuestas: con `top_n` se descartan documentos poco relevantes y se reduce el ruido enviado al modelo de generación.
- Despliegue sobre aceleradores RNGD: organizaciones con hardware FuriosaAI pueden servir el reranker con el FXB incluido y la API compatible con OpenAI, sin necesidad de GPUs.
- Evaluación de relevancia en sistemas de recomendación de contenido textual: puntuación de pares consulta-documento para ordenar artículos, FAQs o entradas de base de conocimiento.
- Servicio de reranking como microservicio: el endpoint `/v1/rerank` compatible con Cohere/Jina permite sustituir proveedores externos por un despliegue propio con licencia Apache 2.0.
- Prototipado e investigación en recuperación de información: modelo ligero de 0,6B parámetros que cabe en un único dispositivo y permite iterar sobre estrategias de ranking.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 1,2 GB solo para pesos (595,8 M de parámetros × 2 bytes), más overhead de activaciones y runtime.
- GPU recomendadas para uso con frameworks estándar (Transformers, Sentence Transformers, vLLM): cualquier GPU con al menos 4-8 GB de memoria; el modelo es lo bastante pequeño para GPUs de consumo.
- Cabe en GPU de consumo: sí, por su tamaño (0,6B parámetros) en BF16.
- Hardware específico del bundle: FuriosaAI RNGD, con tensor-parallel de 8 PEs sobre una sola tarjeta.
- Opciones de despliegue: `furiosa-llm serve` (API compatible con OpenAI, endpoints `/v1/rerank` y `/v1/score`), API Python `furiosa_llm.LLM`, y frameworks estándar como Sentence Transformers, vLLM y Transformers según la model card del modelo base.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Despliegue destacado |
|---|---|---|---|---|---|
| furiosa-ai/Qwen3-Reranker-0.6B | 595,8 M | no disponible | inglés | Apache 2.0 | Furiosa-LLM sobre RNGD; también frameworks estándar |
| Qwen/Qwen3-Reranker-0.6B (upstream) | 0,6 B | no disponible | no disponible en esta ficha | Apache 2.0 | Transformers, Sentence Transformers, vLLM |
| Rerankers de la familia Qwen3 de mayor tamaño | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo upstream, del que esta publicación es una réplica con bundle de despliegue; no se dispone de datos de benchmarks ni de especificaciones de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Idioma: la model card declara soporte únicamente para inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Sesgos: no se documentan análisis de sesgos en la información disponible; al heredar el comportamiento del modelo base Qwen3, pueden persistir sesgos presentes en sus datos de entrenamiento.
- Alucinación: al ser un modelo de scoring y no generativo, el riesgo se traslada a puntuaciones de relevancia poco fiables en dominios alejados de los datos de entrenamiento.
- Contexto: la longitud máxima de contexto no está documentada en esta ficha; conviene consultar la model card del modelo base antes de usarlo con documentos largos.
- Licencia: Apache 2.0 permite uso comercial, pero deben respetarse los términos del modelo base y de las dependencias (Furiosa-LLM, FXB).
- Dependencia de hardware: el bundle FXB está compilado para FuriosaAI RNGD; fuera de ese hardware debe usarse el modelo base con otros frameworks.
- Sin cuantización documentada: el bundle publicado funciona en BF16 nativo; no se ofrecen variantes GGUF u otras cuantizaciones en este repositorio.
- Madurez: el repositorio tiene 782 descargas y 0 likes en el momento de la consulta, lo que sugiere adopción limitada y poca validación comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/furiosa-ai/Qwen3-Reranker-0.6B
- Modelo base (upstream): https://huggingface.co/Qwen/Qwen3-Reranker-0.6B
- Documentación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/furiosa_llm/intro.html
- Servidor Furiosa-LLM (`furiosa-llm serve`): https://developer.furiosa.ai/latest/en/furiosa_llm/furiosa-llm-serve.html
- Guía de instalación de Furiosa-LLM: https://developer.furiosa.ai/latest/en/get_started/furiosa_llm.html#installing-furiosa-llm
- FuriosaAI: https://furiosa.ai
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0

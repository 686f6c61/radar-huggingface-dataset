# LocalGpu/Qwen3-Reranker-4B-torchao-INT8

## Resumen

Qwen3-Reranker-4B-torchao-INT8 es una conversión cuantizada del modelo Qwen/Qwen3-Reranker-4B, desarrollada por el usuario LocalGpu. Se trata de un reranker de 4.021.784.576 parámetros (aproximadamente 4B) que parte del modelo original de Qwen y se ha convertido de BF16 a INT8 persistente mediante la librería torchao. El resultado son pesos SafeTensors de 4,4 GB pensados para carga directa en el runtime de RAG de LocalGPU.

El modelo base, Qwen3-Reranker-4B, pertenece a la familia Qwen3 de Alibaba y está especializado en la reordenación de documentos recuperados en pipelines de recuperación aumentada por generación (RAG). La versión INT8 reduce a la mitad el peso respecto a los pesos BF16 originales, lo que facilita su despliegue en infraestructuras con memoria limitada sin renunciar a la arquitectura completa del modelo.

La relevancia de esta ficha radica en que documenta una conversión de cuantización de un reranker de tamaño medio, un componente crítico en sistemas RAG de producción. La licencia Apache 2.0 del modelo base permite uso comercial, y el formato torchao INT8 está orientado a la inferencia eficiente en GPUs modernas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3, detalles especificos del reranker no disponibles) |
| Parametros totales | 4.021.784.576 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 persistente (torchao); 252 de 253 capas lineales cuantizadas, `lm_head` en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (torchao INT8) |

## Arquitectura y entrenamiento

El modelo es una conversión del reranker Qwen3-Reranker-4B, que emplea una arquitectura transformer derivada de la familia Qwen3. La model card de esta conversión no detalla la arquitectura interna del modelo base (número de capas, dimensión oculta, mecanismo de atención o tipo de cabeza de clasificación para el reranking), por lo que esos datos no están disponibles en la información proporcionada.

El proceso de conversión aplicado por LocalGpu consistió en transformar los pesos BF16 del modelo original a cuantización INT8 persistente mediante torchao. Se cuantizaron 252 de las 253 capas lineales, dejando `lm_head` en BF16. Los pesos exportados en SafeTensors están diseñados para ser cargados directamente por el runtime RAG de LocalGPU. No se dispone de información sobre los datos de entrenamiento del modelo base, el proceso de ajuste (RLHF, DPO u otros) ni innovaciones técnicas adicionales.

## Capacidades

- Reordenación (reranking) de documentos: el modelo está especializado en puntuar y reordenar pasajes recuperados en pipelines RAG, mejorando la relevancia de los resultados antes de pasarlos al generador.
- Puntuación de relevancia consulta-documento: evalúa la correspondencia entre una consulta y un conjunto de candidatos.
- Integración en pipelines RAG: los pesos están preparados para carga directa en el runtime LocalGPU RAG.
- Inferencia cuantizada en INT8: reduce el peso del modelo a 4,4 GB y permite ejecución con menor huella de memoria.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, agentes, visión o audio: no disponibles para este modelo (es un reranker, no un modelo generativo de propósito general).

## Casos de uso

- Reordenación en pipelines RAG de producción: tras una primera fase de recuperación por similitud vectorial (por ejemplo, con un modelo de embeddings), el reranker puntúa los candidatos y reordena los resultados para que el generador reciba los pasajes más relevantes. El tamaño de 4B ofrece un equilibrio entre calidad de reordenación y coste computacional.
- Búsqueda empresarial interna: en un buscador sobre documentación corporativa, el modelo reordena los fragmentos recuperados por el motor de búsqueda léxico o vectorial, mejorando la precisión de las respuestas finales.
- Atención al cliente con base de conocimiento: en un asistente que consulta artículos de soporte, el reranker filtra y ordena los artículos candidatos antes de que el modelo generativo redacte la respuesta, reduciendo respuestas basadas en contexto irrelevante.
- Sistemas de preguntas y respuestas sobre documentación técnica: reordena fragmentos de manuales, RFCs o guías para priorizar los pasajes que responden directamente a la consulta del usuario.
- Despliegue en infraestructura con VRAM limitada: la versión INT8 de 4,4 GB permite alojar el reranker en GPUs de consumo o en instancias con menos memoria que las necesarias para el modelo BF16 completo.
- Evaluación y filtrado de datasets: uso del reranker para puntuar pares consulta-documento y filtrar ejemplos de baja relevancia en la construcción de datasets de entrenamiento o evaluación.
- Integración en el runtime LocalGPU: al estar exportado específicamente para ese runtime, se puede cargar directamente sin pasos adicionales de conversión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos INT8 ocupan aproximadamente 4,4 GB; con overhead de activaciones y contexto, se estima un consumo en torno a 6-8 GB de VRAM, aunque no se dispone de mediciones oficiales.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cabría esperar funcionamiento en GPUs con al menos 8-12 GB de VRAM.
- GPU de consumo: el peso de 4,4 GB sugiere que podría caber en tarjetas consumer con 8 GB o más (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070), aunque no hay confirmación oficial.
- Opciones de despliegue: los pesos están diseñados para el runtime RAG de LocalGPU. No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-Reranker-4B-torchao-INT8 | 4.021.784.576 | no disponible | INT8 (torchao) | apache-2.0 | Hugging Face |
| Qwen/Qwen3-Reranker-4B (base) | 4.021.784.576 | no disponible | BF16 | apache-2.0 | Hugging Face |
| Otros rerankers de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos comparables, por lo que la comparativa se limita al modelo base y a la ausencia de datos de terceros.

## Limitaciones y advertencias

- El modelo es un reranker, no un modelo generativo: no produce texto ni responde preguntas por sí mismo; su función es puntuar y ordenar documentos.
- La model card no documenta sesgos conocidos, riesgos de alucinación ni limitaciones idiomáticas del modelo base; se recomienda consultar la documentación de Qwen/Qwen3-Reranker-4B.
- La cuantización INT8 puede introducir una degradación de calidad en la puntuación de relevancia respecto al modelo BF16 original; no se han publicado evaluaciones comparativas en la información disponible.
- El modelo está exportado específicamente para el runtime RAG de LocalGPU; su carga en otros frameworks no está garantizada.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de las condiciones de la licencia del modelo base y de las dependencias de torchao.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de validación en producción.
- No se dispone de información sobre la longitud de contexto soportada, lo que impide garantizar el comportamiento con documentos largos.

## Enlaces

- [Hugging Face: LocalGpu/Qwen3-Reranker-4B-torchao-INT8](https://huggingface.co/LocalGpu/Qwen3-Reranker-4B-torchao-INT8)
- [Modelo base: Qwen/Qwen3-Reranker-4B](https://huggingface.co/Qwen/Qwen3-Reranker-4B/tree/22e683669bc0f0bd69640a1354a6d0aebcfeede5)
- [Repositorio torchao](https://github.com/pytorch/ao) (referencia de la librería de cuantización, no incluida en la información proporcionada)

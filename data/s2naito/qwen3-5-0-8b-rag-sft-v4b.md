# s2naito/qwen3.5-0.8b-rag-sft-v4b

## Resumen

s2naito/qwen3.5-0.8b-rag-sft-v4b es un ajuste fino (fine-tuning) del modelo Qwen/Qwen3.5-0.8B llevado a cabo por el desarrollador independiente s2naito. El modelo está especializado en responder preguntas cortas en japonés sobre Wikipedia, dentro de un pipeline de generación aumentada por recuperación (RAG). El ajuste se ha realizado mediante LoRA sobre todos los módulos lineales del modelo base, con el objetivo de adaptar un modelo pequeño (873 millones de parámetros) a una tarea muy concreta de question answering extractivo sobre contextos recuperados.

La relevancia de esta ficha es doble. Por un lado, documenta un caso de uso muy específico de adaptación de un modelo de menos de mil millones de parámetros a una tarea de producción real, con un pipeline de recuperación concreto (RRF de cuatro vías, reranker Ruri, selección de artículos y dos saltos basados en reglas). Por otro, ilustra una tendencia práctica: modelos pequeños y especializados que pueden desplegarse en hardware modesto para tareas acotadas, en lugar de recurrir a modelos generalistas de gran tamaño.

El modelo está publicado bajo licencia Apache 2.0, con pesos en formato safetensors, y declara únicamente el idioma japonés. No se han publicado resultados de benchmarks ni detalles sobre el número de tokens de entrenamiento o la composición exacta del dataset más allá de las fuentes citadas en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura Qwen3.5, según el modelo base) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B (revisión `2fc06364715b967f1860aea9cf38778875588b17`) y se ajusta mediante LoRA con `target_modules="all-linear"`, es decir, aplicando adaptadores de bajo rango a todas las capas lineales del transformer. El resultado es un checkpoint completo de 873.438.784 parámetros en safetensors, con un tamaño de repositorio de 1,8 GB. No se especifica en la información disponible el número total de tokens de entrenamiento ni la composición detallada del dataset más allá de las fuentes citadas.

El entrenamiento se orienta a una tarea de respuesta corta (short-answer QA) sobre Wikipedia japonesa, utilizando el pipeline de recuperación exacto de producción `run029`/`run030`: recuperación con RRF de cuatro vías sobre top-100, reranker Ruri, dos saltos basados en reglas, selección de artículos con Qwen/Qwen3.5-0.8B y `rerank_title_tail`, con `CONTEXT_TOP_K=5`. Los datos de entrenamiento provienen de JEMHopQA, JSQuAD/JGLUE, NIILC QA y fragmentos de Wikipedia japonesa distribuidos (`bumbuboon/llm-course-final-2026`), todos ellos bajo licencia CC BY-SA 4.0 y filtrados y reformateados para el ajuste (salvo los fragmentos de Wikipedia, usados sin modificar como contextos de recuperación). Se trata de un SFT (supervised fine-tuning) con semilla de entrenamiento 43 (SFT v4). No se documenta el uso de RLHF o DPO.

## Capacidades

- Generación de respuestas cortas en japonés sobre contextos recuperados de Wikipedia.
- Question answering extractivo dentro de un pipeline RAG con contexto limitado a los cinco fragmentos principales (`CONTEXT_TOP_K=5`).
- Manejo de preguntas que requieren razonamiento en dos saltos (multi-hop), dado que el pipeline de recuperación incorpora una etapa de dos saltos basada en reglas.
- Especialización en la selección de artículos y el reranking de títulos dentro del pipeline de recuperación.
- Capacidad multilingüe limitada: el modelo declara únicamente japonés como idioma soportado.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Respuesta a preguntas sobre Wikipedia japonesa en producción: el modelo está entrenado con el pipeline de recuperación exacto de producción, por lo que puede integrarse directamente en un servicio de QA que recupere fragmentos y genere respuestas cortas y fundamentadas.
- Asistentes de búsqueda interna con corpus japonés: dado que el modelo trabaja sobre contextos recuperados y respuestas concisas, encaja en buscadores corporativos o bases de conocimiento en japonés donde se prioriza la precisión sobre la generación libre.
- Sistemas de QA multi-hop: la inclusión de una etapa de dos saltos en el pipeline permite responder preguntas que requieren combinar información de varios artículos, algo habitual en dominios como historia, geografía o biografías.
- Evaluación y prototipado de pipelines RAG: al ser un modelo pequeño (873M parámetros) ajustado a un pipeline concreto, sirve como banco de pruebas de bajo coste para comparar estrategias de recuperación y reranking.
- Despliegue en hardware modesto: con menos de mil millones de parámetros, el modelo puede ejecutarse en GPUs de consumo para tareas de respuesta corta, reduciendo costes frente a modelos generalistas de mayor tamaño.
- Filtrado y selección de artículos en pipelines de recuperación: el modelo participa en la etapa de selección de artículos del pipeline, por lo que puede reutilizarse como componente de ranking o clasificación de candidatos.
- Generación de respuestas concisas para interfaces conversacionales en japonés: respuestas cortas y centradas en el contexto recuperado, adecuadas para chatbots de atención al usuario con corpus controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, aproximadamente 1,7 GB solo para pesos (873M parámetros × 2 bytes); en fp32, unos 3,5 GB. En cuantización de 8 bits, alrededor de 0,9 GB, y en 4 bits, en torno a 0,5 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16, como una RTX 3050, RTX 4060 o superiores. Para producción con mayor throughput, una A10G, L4 o A100.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 4 GB o más de VRAM, incluidas RTX 3060, RTX 4060, RTX 4090 y equivalentes.
- Opciones de despliegue: Transformers (PyTorch) es la vía directa al publicarse en safetensors; para servir en producción pueden usarse vLLM o TGI si el modelo base Qwen3.5-0.8B es compatible con dichos motores. No se documenta compatibilidad con llama.cpp u Ollama al no publicarse pesos GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Especialización |
|---|---|---|---|---|---|
| s2naito/qwen3.5-0.8b-rag-sft-v4b | 873M | no disponible | ja | Apache 2.0 | QA corto sobre Wikipedia japonesa (RAG) |
| Qwen/Qwen3.5-0.8B (modelo base) | 0,8B | no disponible | multilingüe (según modelo base) | Apache 2.0 | Modelo generalista |
| Modelos de QA japoneses de tamaño similar | no disponible | no disponible | ja | variable | QA en japonés |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada. El modelo base Qwen3.5-0.8B es la referencia natural, y este ajuste se diferencia por su especialización en el pipeline RAG de producción y por el idioma declarado (solo japonés).

## Limitaciones y advertencias

- El modelo declara únicamente japonés como idioma soportado; su rendimiento en otros idiomas no está documentado y probablemente sea deficiente.
- Está especializado en respuestas cortas sobre contextos recuperados; puede degradarse en generación libre, tareas creativas o razonamiento abierto.
- Riesgo de alucinación: al ser un modelo pequeño ajustado a QA extractivo, puede generar respuestas incorrectas o inventar datos cuando el contexto recuperado es insuficiente o irrelevante.
- Dependencia del pipeline de recuperación: el ajuste se ha realizado con un pipeline concreto (`run029`/`run030`, cuatro vías RRF, reranker Ruri, dos saltos, `CONTEXT_TOP_K=5`); cambiar la configuración de recuperación puede afectar al rendimiento.
- Los datos de entrenamiento derivan de fuentes con licencia CC BY-SA 4.0 (JEMHopQA, JSQuAD/JGLUE, NIILC QA y fragmentos de Wikipedia), lo que puede imponer obligaciones de atribución y compartir-igual en obras derivadas, aunque los pesos se publiquen como Apache 2.0.
- No se documentan sesgos específicos ni evaluaciones de seguridad; al entrenarse sobre Wikipedia japonesa, puede heredar sesgos de cobertura y sesgos culturales de esa fuente.
- No se han publicado benchmarks, por lo que no es posible verificar su calidad frente a alternativas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/s2naito/qwen3.5-0.8b-rag-sft-v4b
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- JSQuAD / JGLUE: https://github.com/yahoojapan/JGLUE
- NIILC QA: https://github.com/mynlp/niilc-qa
- Dataset de fragmentos de Wikipedia japonesa: https://huggingface.co/datasets/bumbuboon/llm-course-final-2026
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/

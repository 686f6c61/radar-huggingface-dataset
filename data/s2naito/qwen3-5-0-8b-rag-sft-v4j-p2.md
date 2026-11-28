# s2naito/qwen3.5-0.8b-rag-sft-v4j-p2

## Resumen

`s2naito/qwen3.5-0.8b-rag-sft-v4j-p2` es un ajuste fino por LoRA del modelo base `Qwen/Qwen3.5-0.8B`, desarrollado por el usuario s2naito. El modelo está especializado en respuesta corta a preguntas (short-answer QA) sobre Wikipedia en japonés dentro de un pipeline de generación aumentada por recuperación (RAG). No es un modelo de propósito general, sino un componente afinado para una tarea muy concreta: dado un contexto recuperado por una cadena de recuperación específica, generar la respuesta breve correcta.

El ajuste parte de un adaptador previo (`qwen3.5-0.8b-rag-sft-v4e`) y continúa el entrenamiento LoRA durante una época adicional con una tasa de aprendizaje de 5e-05, incorporando hasta 400 preguntas de dos saltos (2-hop) construidas de forma mecánica. El contexto de entrenamiento se generó con el pipeline de producción del autor, que combina recuperación híbrida con fusión RRF de 4 vías, un reranker Ruri, un paso de 2-hop basado en reglas y un selector de artículos propio.

Con 873 millones de parámetros y licencia Apache-2.0, el modelo es relevante para quienes construyen sistemas RAG en japonés con recursos limitados y necesitan un generador de respuestas cortas de bajo coste computacional. Su utilidad está intrínsecamente ligada al pipeline de recuperación con el que fue entrenado, por lo que su rendimiento fuera de ese contexto no está garantizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5); detalles internos no disponibles |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | Japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `Qwen/Qwen3.5-0.8B` (revision `2fc06364715b967f1860aea9cf38778875588b17`), un transformer decoder-only de 0,8 mil millones de parámetros. El ajuste se realizó mediante LoRA con `target_modules="all-linear"`, es decir, aplicando adaptadores de bajo rango a todas las capas lineales. El entrenamiento es una continuación del adaptador de `qwen3.5-0.8b-rag-sft-v4e` (revision `6248a7d2efb5fd79c35f72e487374d14769a3d3e`) durante una época con tasa de aprendizaje 5e-05 y semilla 42, sobre los datos de SFT v4e más hasta 400 preguntas de dos saltos concatenadas mecánicamente.

Los datos de entrenamiento provienen de JEMHopQA, JSQuAD/JGLUE, NIILC QA y `cl-nagoya/auto-wiki-qa` (todas con licencia CC BY-SA 4.0), reformateados para la tarea de respuesta corta. Los contextos de recuperación se construyeron con el pipeline de producción del autor: recuperación de 4 vías con RRF hasta top-100, reranker Ruri, 2-hop basado en reglas, selector de artículos `qwen3.5-0.8b-rag-selector-v2` y `rerank_title_tail` con `CONTEXT_TOP_K=5`. Los chunks de Wikipedia japonesa provienen de `bumbuboon/llm-course-final-2026` y no fueron alterados. No se documenta el uso de RLHF ni DPO; el entrenamiento es SFT supervisado.

## Capacidades

- Respuesta corta a preguntas (short-answer QA) sobre contextos de Wikipedia en japonés.
- Manejo de preguntas de un salto y de dos saltos (2-hop), estas últimas incorporadas en esta versión mediante concatenación mecánica de preguntas.
- Generación de respuestas breves y extractivas a partir de contexto recuperado.
- Funcionamiento dentro de un pipeline RAG con selección de artículos y reranking previos.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso autónomo: no disponible.
- Capacidades multilingües: limitadas al japonés según la model card.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Respuesta a preguntas sobre Wikipedia japonesa en producción: el modelo está entrenado específicamente para recibir contexto recuperado por el pipeline del autor (RRF top-100, reranker Ruri, selector de artículos) y devolver la respuesta corta correcta, lo que lo hace adecuado para asistentes de consulta factual con presupuesto computacional reducido.
- Preguntas de dos saltos en sistemas de búsqueda: gracias a la incorporación de preguntas 2-hop en el entrenamiento, puede resolver consultas que requieren combinar información de dos artículos distintos, siempre que el pipeline de recuperación proporcione ambos contextos.
- Generador de respuestas en un servicio de QA documental interno: con 0,8 mil millones de parámetros cabe en GPUs de gama media y puede desplegarse como componente de generación de un stack RAG en japonés.
- Evaluación y ablación de pipelines RAG: al estar entrenado con un pipeline concreto, sirve como referencia para medir el impacto de cambios en la recuperación (por ejemplo, variar `CONTEXT_TOP_K` o el reranker) manteniendo fijo el generador.
- Prototipado rápido de asistentes de conocimiento en japonés: su tamaño permite iterar en local con cuantización, aunque el autor no publica versiones GGUF.
- Filtrado y selección de respuestas en cascada: puede usarse como primer generador barato en un sistema de dos etapas, reservando modelos mayores para los casos de baja confianza.
- Investigación sobre ajuste fino LoRA en tareas RAG: el linaje documentado (v4e → v4j-p2) y la receta (LoRA `all-linear`, lr 5e-05, 1 época) facilitan reproducir y comparar experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 1,8 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, unos 3-4 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB para pesos; en 4 bits, en torno a 0,5-0,6 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (RTX 3060, RTX 4060, RTX 4090); para despliegue en servidor, A100 o H100 no son necesarias por el tamaño del modelo, pero permiten mayor throughput por batching.
- Cabe en GPU de consumo: sí, en RTX 3060/4060/4090 y similares; también en placas integradas o CPU con cuantización, aunque el autor no publica pesos GGUF.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama requerirían conversión a GGUF (no publicada); con safetensors puede servirse con vLLM o TGI directamente, o con transformers.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| s2naito/qwen3.5-0.8b-rag-sft-v4j-p2 | 873 M | No disponible | ja | Apache-2.0 | QA corta RAG japonés (fine-tune) |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | No disponible | Multilingüe | Apache-2.0 | Propósito general |
| s2naito/qwen3.5-0.8b-rag-sft-v4e | ~0,8 B | No disponible | ja | Apache-2.0 | Versión previa del mismo linaje, sin 2-hop |

La comparación con alternativas de la misma categoría (modelos japoneses pequeños para QA) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está entrenado para responder preguntas cortas sobre contextos recuperados por un pipeline concreto; su comportamiento fuera de ese formato o con contextos distintos no está garantizado.
- Dependencia del pipeline: el rendimiento depende del selector de artículos `qwen3.5-0.8b-rag-selector-v2`, del reranker Ruri y de la configuración `CONTEXT_TOP_K=5`; cambiar estos componentes puede degradar la calidad.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas incorrectas o inventadas si el contexto recuperado no contiene la información, especialmente en preguntas 2-hop donde falta uno de los saltos.
- Sesgos: no se documentan evaluaciones de sesgo; los datos de entrenamiento provienen de Wikipedia japonesa y de datasets QA con licencia CC BY-SA 4.0, lo que puede heredar sesgos de esas fuentes.
- Limitaciones de idioma: solo japonés; no se garantiza un comportamiento correcto en otros idiomas.
- Restricciones de licencia: el modelo es Apache-2.0, pero los datasets de entrenamiento son CC BY-SA 4.0, lo que puede imponer obligaciones de atribución y compartir-igual sobre derivados; conviene revisar antes de uso comercial.
- Sin benchmarks publicados: no hay métricas de calidad verificables en la información disponible, por lo que la evaluación debe hacerse de forma empírica en el caso de uso concreto.
- Sin cuantizaciones oficiales: no se publican pesos GGUF ni AWQ, lo que limita el despliegue en entornos de bajos recursos sin conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/s2naito/qwen3.5-0.8b-rag-sft-v4j-p2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Adaptador previo (v4e): https://huggingface.co/s2naito/qwen3.5-0.8b-rag-sft-v4e
- Selector de artículos: https://huggingface.co/s2naito/qwen3.5-0.8b-rag-selector-v2
- Dataset auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- JSQuAD / JGLUE: https://github.com/yahoojapan/JGLUE
- NIILC QA: https://github.com/mynlp/niilc-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/

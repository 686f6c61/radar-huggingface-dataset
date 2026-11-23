# mradermacher/subquery-0.5b-GGUF

## Resumen

subquery-0.5b es un modelo de lenguaje especializado en descomposición de consultas (query decomposition) para pipelines de recuperación aumentada por generación (RAG). Lo desarrolla vennyvirtuoso y esta versión concreta la publica mradermacher como cuantizaciones GGUF estáticas del modelo base. El modelo parte de la arquitectura Qwen2.5 y cuenta con 494.032.768 parámetros totales, lo que lo situa en la categoria de modelos ultraligeros orientados a tareas concretas y despliegue en entornos con recursos limitados.

Su proposito es transformar una consulta de usuario compleja en varias subconsultas independientes que puedan lanzarse contra un motor de busqueda vectorial o un indice documental. Esto mejora la cobertura de recuperación en sistemas RAG cuando la pregunta original es ambigua, multi-hop o combina varias entidades. El modelo se entrena sobre el dataset SubQuery-Decomp y declara soporte para salidas estructuradas, lo que facilita su integración como paso previo a la recuperación.

La relevancia actual reside en su tamaño reducido (menos de 500 millones de parámetros) y en la disponibilidad de cuantizaciones GGUF que van desde 0,4 GB hasta 1,1 GB, lo que permite ejecutarlo en CPU o en GPUs de consumo. Esta pensado para ingles y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen2.5) |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones); el modelo base en transformers/safetensors |

## Arquitectura y entrenamiento

El modelo base vennyvirtuoso/subquery-0.5b es un transformer derivado de la familia Qwen2.5, con 494 millones de parámetros. Esta especializado en una tarea concreta: dado un input conversacional, generar subconsultas descompuestas y estructuradas para motores de recuperación. La model card no detalla el numero de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO; unicamente se referencia el dataset SubQuery-Decomp como fuente de entrenamiento.

La innovación principal no es arquitectonica sino funcional: el modelo esta ajustado para producir salidas estructuradas (structured outputs) orientadas a la descomposición de consultas, lo que lo hace apto como componente de un agente RAG. No se documentan innovaciones como decodificación especulativa, atención lineal o arquitecturas hibridas. Las cuantizaciones publicadas por mradermacher son estáticas (sin imatrix/weighted), según indica el propio autor en la model card.

## Capacidades

- Generación de subconsultas a partir de una consulta original, orientada a busqueda vectorial y recuperación documental.
- Salidas estructuradas para integración directa en pipelines de agentes.
- Soporte de conversación multi-turno (tag conversational en Hugging Face).
- Capacidad de descomposición de consultas complejas en pasos de recuperación independientes.
- Integración con flujos de agentic AI y multi-step reasoning a nivel de orquestación de recuperación.
- Modelo especializado en ingles; no se declaran capacidades multilingues.
- No se documentan capacidades de visión, audio, tool calling genérico ni modo thinking explicito.

## Casos de uso

- Descomposición de consultas en pipelines RAG: el modelo recibe la pregunta del usuario y genera varias subconsultas que se lanzan en paralelo contra un indice vectorial, mejorando la cobertura en preguntas multi-hop. Su tamaño de 0,5B permite ejecutarlo como paso previo de bajo coste.
- Agentes de busqueda documental: se integra como nodo de planificación de recuperación dentro de un agente, transformando la intención del usuario en consultas accionables antes de invocar la herramienta de búsqueda.
- Sistemas de atención al cliente con base de conocimiento: permite reformular preguntas ambiguas de usuarios en subconsultas concretas que recuperan fragmentos relevantes de la documentación interna.
- Enriquecimiento de motores de busqueda empresarial: se puede desplegar en CPU con cuantizaciones Q4_K_M (0,5 GB) para preprocesar consultas antes de un motor tipo Elasticsearch o un indice vectorial.
- Prototipado rápido de arquitecturas RAG: al ser un modelo de 0,5B con licencia Apache 2.0, sirve para validar pipelines de descomposición de consultas sin coste de GPU dedicada.
- Evaluación de estrategias de recuperación: permite generar subconsultas controladas para comparar configuraciones de retrieval (top-k, reranking) en experimentos de investigación.
- Despliegue en entornos edge o embebidos: las cuantizaciones Q2_K y Q3_K_S (0,4 GB) permiten ejecución en dispositivos con poca memoria, aunque con perdida de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia por tamano de fichero, las cuantizaciones ocupan entre 0,4 GB (Q2_K, Q3_K_S) y 1,1 GB (f16), por lo que la memoria necesaria para inferencia es del orden de 1-2 GB incluyendo overhead.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar las cuantizaciones mas pequenas; no se especifican modelos concretos (A100, H100, RTX 4090) en la informacion disponible.
- Cabe en GPU de consumo: si, practicamente cualquier GPU consumer moderna (GTX 1060 6GB, RTX 3060, RTX 4060, etc.) puede alojar el modelo cuantizado. Tambien es viable en CPU.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; el modelo base es compatible con transformers y, presumiblemente, con vLLM y TGI, aunque no se confirma en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| subquery-0.5b (este) | 494 M | no disponible | Apache 2.0 | GGUF / safetensors | Especializado en descomposición de consultas RAG, solo ingles |
| Qwen2.5-0.5B (base arquitectonico) | ~494 M | no disponible en esta ficha | Apache 2.0 | safetensors / GGUF | Modelo generalista del que deriva; no especializado en subconsultas |
| Alternativas especializadas en query decomposition | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de benchmarks ni de modelos comparables documentados en la informacion proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Entrenado y declarado unicamente para ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Modelo muy especializado: no es un modelo generalista y su uso fuera de tareas de descomposición de consultas o RAG puede degradarse notablemente.
- Riesgo de alucinación inherente a los modelos de lenguaje; en este caso, puede generar subconsultas irrelevantes o inventar entidades si la consulta original es ambigua.
- Las cuantizaciones Q2_K y Q3_K_S, aunque pequenas, presentan perdida de calidad significativa; el autor recomienda Q4_K_M o superiores para uso en producción.
- Las cuantizaciones publicadas son estáticas; no hay versiones con imatrix/weighted disponibles según la model card.
- No se documentan sesgos especificos ni evaluaciones de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y sus datos de entrenamiento (SubQuery-Decomp) deben verificarse por separado si se requiere cumplimiento estricto.
- No se dispone de informacion sobre la longitud de contexto soportada, lo que limita la planificación de despliegues con entradas largas.

## Enlaces

- [Hugging Face: mradermacher/subquery-0.5b-GGUF](https://huggingface.co/mradermacher/subquery-0.5b-GGUF)
- [Modelo base: vennyvirtuoso/subquery-0.5b](https://huggingface.co/vennyvirtuoso/subquery-0.5b)
- [Pagina de descargas del autor (hf.tst.eu)](https://hf.tst.eu/model#subquery-0.5b-GGUF)
- [Guia de uso de GGUF (README de TheBloke referenciado)](https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF)
- [Grafico comparativo de cuantizaciones (ikawrakow)](https://www.nethype.de/huggingface_embed/quantpplgraph.png)
- [Notas sobre cuantizaciones de Artefact2](https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9)
- [FAQ y solicitudes de modelos de mradermacher](https://huggingface.co/mradermacher/model_requests)

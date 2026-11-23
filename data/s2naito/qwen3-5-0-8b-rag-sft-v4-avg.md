# s2naito/qwen3.5-0.8b-rag-sft-v4-avg

## Resumen

`s2naito/qwen3.5-0.8b-rag-sft-v4-avg` es un ajuste fino (SFT) del modelo base `Qwen/Qwen3.5-0.8B`, publicado por el usuario s2naito. No se trata de un modelo entrenado desde cero, sino de una media aritmetica elemento a elemento (pesos 0,5 / 0,5) de dos ejecuciones de LoRA SFT sobre el mismo conjunto de datos SFT v4 y con identicos hiperparametros, diferenciandose unicamente en la semilla aleatoria de entrenamiento (42 y 43). Cada adaptador LoRA, con `target_modules="all-linear"`, se fusiono en los pesos base en fp32 antes de promediar; los pesos no pertenecientes a LoRA son identicos a los del modelo base.

El modelo esta especializado en respuesta corta a preguntas (QA) sobre recuperacion aumentada (RAG) de Wikipedia en japones. Se entreno para funcionar con un pipeline de recuperacion de produccion concreto (`run029`/`run030`): RRF de 4 vias sobre el top-100, reranker Ruri, 2-hop basado en reglas, seleccion de articulos con `Qwen/Qwen3.5-0.8B` y `rerank_title_tail`, con `CONTEXT_TOP_K=5`.

Con 873.438.784 parametros reales (segun safetensors) y licencia Apache 2.0, es un modelo muy pequeno orientado a despliegues de bajos recursos y baja latencia en el dominio especifico del QA japones. Su relevancia radica en la tecnica de promediado de pesos (weight averaging) para mejorar la robustez frente al ruido de semilla en ajustes finos pequenos, y en su integracion con un pipeline RAG documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; detalles especificos de la arquitectura base no disponibles) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | japones (`ja`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-0.8B` (revision `2fc06364715b967f1860aea9cf38778875588b17`). El ajuste fino se realizo mediante LoRA con `target_modules="all-linear"`, es decir, aplicando adaptadores de bajo rango a todas las capas lineales. Cada adaptador se fusiono en los pesos base en precision fp32 y posteriormente se calculo la media elemento a elemento de los dos modelos resultantes con peso 0,50 cada uno. Los pesos originales no afectados por LoRA permanecen identicos al modelo base.

Los datos de entrenamiento (SFT v4) combinan cuatro fuentes, todas bajo licencia CC BY-SA 4.0: JEMHopQA, JSQuAD/JGLUE, NIILC QA y fragmentos de Wikipedia japonesa distribuidos (`bumbuboon/llm-course-final-2026`). Los conjuntos de QA fueron filtrados y reformateados para entrenamiento; los fragmentos de Wikipedia se usaron sin alterar como contextos de recuperacion seleccionados por el pipeline BM25/embedding/reranker/2-hop. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO. La innovacion tecnica destacable es el promediado de pesos entre semillas para reducir la varianza del ajuste fino.

## Capacidades

- Generacion de texto y respuesta a preguntas en japones, orientada a respuestas cortas extractivas sobre contextos RAG.
- Razonamiento sobre contexto recuperado (multi-hop basico, segun el pipeline de 2-hop con el que se entreno).
- Especializacion en QA sobre Wikipedia japonesa con contextos de hasta 5 fragmentos (`CONTEXT_TOP_K=5`).
- Integracion con pipelines de recuperacion concretos (RRF, reranking, seleccion de articulos).
- Capacidades multilingues limitadas al japones segun la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso general: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Respuesta a preguntas sobre Wikipedia japonesa en produccion: el modelo esta entrenado especificamente para el pipeline `run029`/`run030` (RRF de 4 vias + reranker Ruri + 2-hop + seleccion de articulos), por lo que encaja directamente en un sistema RAG japones ya desplegado con esa configuracion.
- Asistentes de busqueda interna en japones: con 873 millones de parametros puede desplegarse en CPU o GPU de gama baja para responder consultas cortas sobre documentacion corporativa recuperada, manteniendo baja latencia.
- QA extractivo en dominios con contexto limitado: al entrenarse con `CONTEXT_TOP_K=5`, es adecuado para tareas donde se pasan pocos fragmentos y se espera una respuesta concisa, como resumenes de articulos o fichas tecnicas.
- Evaluacion de pipelines RAG: sirve como modelo de referencia para medir la calidad de la recuperacion (RRF, reranking) en japones, ya que su comportamiento esta acoplado a un pipeline documentado y reproducible.
- Prototipado de bajo coste: su tamano permite iterar rapidamente en entornos con recursos limitados (portatiles, instancias pequenas) antes de escalar a modelos mayores.
- Investigacion sobre weight averaging: el modelo es un ejemplo reproducible de promediado de pesos entre semillas de LoRA, util para estudiar robustez y varianza en ajustes finos pequenos.
- Despliegue en entornos con requisitos de privacidad: al ser pequeno y de licencia Apache 2.0, puede ejecutarse en infraestructura local sin dependencias externas para QA japones sensible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 873 millones de parametros, en fp16 requeriria aproximadamente 1,7 GB de pesos mas overhead de activaciones y cache KV.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: por tamano, es probable que quepa en GPU de consumo con suficiente VRAM (por ejemplo, RTX 3060 12 GB o superiores), aunque no se confirma en la documentacion.
- Opciones de despliegue: no se documentan en la model card; al publicarse solo en safetensors, seria necesario convertir a formatos como GGUF para llama.cpp/Ollama, o usar frameworks como vLLM o TGI con los pesos originales.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| s2naito/qwen3.5-0.8b-rag-sft-v4-avg | 873.438.784 | no disponible | Apache 2.0 | QA RAG japones (Wikipedia) |
| Qwen/Qwen3.5-0.8B (base) | no disponible | no disponible | no disponible | Modelo generalista |
| s2naito/qwen3.5-0.8b-rag-sft-v4 | no disponible | no disponible | Apache 2.0 | QA RAG japones (semilla 42) |
| s2naito/qwen3.5-0.8b-rag-sft-v4b | no disponible | no disponible | Apache 2.0 | QA RAG japones (semilla 43) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta entrenado para QA corto sobre Wikipedia japonesa con un pipeline RAG concreto; su rendimiento fuera de ese dominio o con otros pipelines no esta validado.
- Idioma: solo se declara soporte de japones (`ja`); el uso en castellano u otros idiomas no esta respaldado por la model card.
- Riesgo de alucinacion: al ser un modelo pequeno de QA extractivo, puede generar respuestas incorrectas o inventadas si el contexto recuperado es irrelevante o insuficiente.
- Sesgos: no se documentan evaluaciones de sesgo; los datos de entrenamiento provienen de Wikipedia y conjuntos de QA academicos, con los sesgos inherentes a esas fuentes.
- Licencia de datos: los datos de entrenamiento estan bajo CC BY-SA 4.0, lo que puede imponer obligaciones de atribucion y compartir-igual en productos derivados, aunque los pesos se distribuyan bajo Apache 2.0; conviene revisar la compatibilidad para uso comercial.
- Contexto: no se documenta la longitud maxima de contexto soportada, lo que limita la planificacion de despliegues con contextos largos.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa ni benchmarks publicados.
- Formato: solo se ofrecen pesos safetensors; no hay variantes cuantizadas oficiales, lo que puede requerir trabajo adicional para despliegues en CPU o GPU de baja VRAM.

## Enlaces

- Hugging Face: https://huggingface.co/s2naito/qwen3.5-0.8b-rag-sft-v4-avg
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Componente semilla 42: https://huggingface.co/s2naito/qwen3.5-0.8b-rag-sft-v4
- Componente semilla 43: https://huggingface.co/s2naito/qwen3.5-0.8b-rag-sft-v4b
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- JSQuAD / JGLUE: https://github.com/yahoojapan/JGLUE
- NIILC QA: https://github.com/mynlp/niilc-qa
- Dataset de fragmentos de Wikipedia: https://huggingface.co/datasets/bumbuboon/llm-course-final-2026
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/

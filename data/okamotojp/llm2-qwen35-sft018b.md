# OkamotoJP/llm2-qwen35-sft018b

## Resumen

`OkamotoJP/llm2-qwen35-sft018b` es un ajuste fino supervisado (SFT) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario OkamotoJP. Se trata de un modelo de 873 millones de parametros orientado especificamente a la generacion de respuestas en tareas de recuperacion aumentada (RAG) sobre documentacion en japones. El modelo fue creado como entrega final del curso "LLM講座2 2026" y esta pensado para responder preguntas apoyandose en fragmentos de contexto proporcionados en el prompt.

La arquitectura subyacente es la del Qwen3.5-0.8B original, un transformer denso (no MoE) del que solo se actualizaron los pesos de la parte linguistica mediante LoRA con r=16 y alpha=32, fusionados posteriormente en los pesos base. El resultado conserva exactamente la misma estructura que el modelo original, por lo que hereda sus caracteristicas de contexto e inferencia, aunque el autor no detalla la longitud de contexto en la model card.

Su relevancia es acotada: es un modelo experimental de nicho, con solo 2 descargas y 0 likes en el momento de la consulta, entrenado sobre un conjunto pequeno de 1.260 ejemplos. Resulta util como referencia de como se construye un ajuste SFT para RAG en japones con recursos limitados, pero no esta pensado como modelo de proposito general ni compite con modelos de mayor tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5), solo pesos linguisticos actualizados |
| Parametros totales | 873.438.784 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | Japones (ja) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B (revision `2fc06364715b967f1860aea9cf38778875588b17`), un transformer denso de 873 millones de parametros. El ajuste se realizo mediante LoRA con rango r=16 y alpha=32, tasa de aprendizaje 1e-4 y una sola epoca, y posteriormente los adaptadores se fusionaron en los pesos originales. Segun la model card, solo se actualizaron los pesos de la parte linguistica, manteniendo intacta la estructura del modelo base.

El conjunto de entrenamiento consta de 1.260 ejemplos, compuesto por 882 muestras de `cl-nagoya/auto-wiki-qa` y 378 de `JEMHopQA` (subconjunto `jemhopqa_train_sft/compositional`). Ambos datasets estan bajo licencia CC BY-SA 4.0 y fueron filtrados, muestreados y reformateados para la tarea. Ademas, se emplearon fragmentos de Wikipedia japonesa (CC BY-SA 4.0) como material de contexto en los prompts de entrenamiento. No se documenta uso de RLHF ni DPO, ni innovaciones tecnicas adicionales mas alla del propio ajuste SFT.

## Capacidades

- Generacion de respuestas condicionadas a contexto: el modelo esta entrenado para producir respuestas a partir de fragmentos documentales incluidos en el prompt, en el marco de un pipeline RAG.
- Comprension lectora en japones: entrenado sobre QA extractivo y compositional en japones (JEMHopQA, auto-wiki-qa).
- Razonamiento multi-salto limitado: la inclusion del subconjunto `compositional` de JEMHopQA sugiere entrenamiento en preguntas que requieren combinar informacion de varias fuentes.
- Generacion de texto en japones: capacidad heredada del modelo base, aunque el ajuste esta orientado a la tarea de respuesta.
- Soporte de tool calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso general: no disponible (no documentado).
- Capacidades multilingues: limitadas al japones segun la model card; el modelo base podria conservar capacidades adicionales, pero no se garantizan tras el ajuste.
- Capacidades especiales (vision, audio, thinking mode): no disponibles (no documentadas).

## Casos de uso

- Generacion de respuestas en sistemas RAG sobre Wikipedia japonesa: el modelo recibe fragmentos recuperados y produce una respuesta sintetizada; es su proposito declarado y el escenario para el que fue entrenado.
- Preguntas compositional multi-salto: adecuado para consultas que requieren combinar informacion de dos o mas pasajes, gracias al entrenamiento sobre el subconjunto compositional de JEMHopQA.
- Asistente de documentacion interna en japones: puede integrarse en un pipeline que recupere secciones de manuales y genere respuestas citando el contexto, con bajo coste de inferencia por su tamano reducido.
- Prototipado rapido de pipelines RAG: al ocupar menos de 1 GB en safetensors, permite iterar sobre estrategias de recuperacion y prompting en hardware modesto.
- Educacion e investigacion: util como caso de estudio de ajuste SFT con LoRA sobre un modelo pequeno para una tarea concreta, replicable con recursos limitados.
- Filtrado y resumen de articulos de Wikipedia en japones: puede resumir o extraer informacion de pasajes largos en tareas de curacion de contenidos.
- Evaluacion comparativa de estrategias de recuperacion: al estar especializado en responder a partir de contexto, sirve para medir la calidad de distintos retrievers en japones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): aproximadamente 3,5 GB para los 873 millones de parametros.
- VRAM estimada en fp16/bf16: aproximadamente 1,8 GB de pesos, mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,9 GB; en 4 bits, en torno a 0,5 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM deberia poder ejecutarlo en fp16; una RTX 3060, RTX 4060 o superior es suficiente. En entornos de servidor, A100 o H100 no son necesarias para este tamano.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con al menos 4 GB de VRAM.
- Opciones de despliegue: al publicarse solo en safetensors, requiere frameworks como Transformers, vLLM o TGI para cargarlo; no se proporcionan pesos GGUF, por lo que llama.cpp u Ollama requeririan conversion manual previa.
- Latencia y throughput estimados: no disponibles (no documentados por el autor).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| OkamotoJP/llm2-qwen35-sft018b | 873 M | No disponible | ja | Apache-2.0 | Ajuste SFT para RAG en japones |
| Qwen/Qwen3.5-0.8B (base) | 873 M | No disponible | Multilingue | Apache-2.0 | Modelo base sin ajuste especifico |
| cl-nagoya/auto-wiki-qa (dataset) | No aplica | No aplica | ja | CC BY-SA 4.0 | Fuente de entrenamiento, no modelo |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este ajuste con alternativas de la misma categoria.

## Limitaciones y advertencias

- Entrenado exclusivamente en japones: su rendimiento en castellano u otros idiomas no esta garantizado y probablemente sea deficiente para la tarea de RAG.
- Conjunto de entrenamiento muy pequeno (1.260 ejemplos) y una sola epoca: riesgo elevado de sobreajuste a los formatos y dominios de JEMHopQA y auto-wiki-qa.
- Riesgo de alucinacion: como todo modelo generativo, puede producir respuestas no sustentadas en el contexto, especialmente fuera de la distribucion de entrenamiento.
- Dependencia del contexto: esta disenado para responder a partir de fragmentos proporcionados; sin contexto adecuado su comportamiento puede degradarse.
- Licencia Apache-2.0 en los pesos, pero los datasets de entrenamiento son CC BY-SA 4.0; conviene revisar las implicaciones de atribucion y compartir-igual si se redistribuye el modelo o derivados.
- Sin datos publicados de benchmarks, contexto maximo ni evaluacion independiente: no se recomienda su uso en produccion sin una evaluacion propia previa.
- Modelo experimental de un curso: sin mantenimiento documentado ni soporte del autor.
- Solo 2 descargas y 0 likes: sin validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OkamotoJP/llm2-qwen35-sft018b
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JEMHopQA: https://github.com/aiishii/JEMHopQA
- Dataset cl-nagoya/auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/

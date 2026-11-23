# s2naito/qwen3.5-0.8b-rag-sft-v5

## Resumen

`s2naito/qwen3.5-0.8b-rag-sft-v5` es un ajuste fino (SFT) del modelo base `Qwen/Qwen3.5-0.8B`, desarrollado por el usuario s2naito. Se trata de un modelo especializado en respuesta corta a preguntas (short-answer QA) sobre Wikipedia en japones, dentro de un pipeline RAG de produccion. El modelo no es de proposito general: ha sido entrenado para consumir contextos recuperados y generar respuestas concisas en japones.

El ajuste se realizo mediante LoRA sobre todos los modulos lineales (`target_modules="all-linear"`), partiendo de la revision `2fc06364715b967f1860aea9cf38778875588b17` del modelo base. El pipeline de recuperacion asociado (`run030`) combina busqueda con 4-way RRF sobre top-100, un reranker Ruri, expansion basada en reglas de 2 saltos, seleccion de articulos mediante el propio `Qwen3.5-0.8B` y la estrategia `rerank_title_tail`, con `CONTEXT_TOP_K=5`.

Con 873.438.784 parametros reales (segun safetensors) y un tamano de repositorio de 1,8 GB, es un modelo compacto orientado a despliegue con baja latencia en tareas de QA documental en japones. Su relevancia radica en ser un ejemplo concreto de especializacion de un modelo pequeno para un dominio y flujo de recuperacion muy especificos, con licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5; detalles no disponibles) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-0.8B (revision 2fc06364715b967f1860aea9cf38778875588b17) |
| Metodo de ajuste | LoRA con target_modules="all-linear" |
| Tamano del repositorio | 1,8 GB |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura del Qwen3.5-0.8B, cuyos detalles internos (numero de capas, dimensiones, mecanismo de atencion) no se especifican en la informacion disponible. El ajuste se realizo mediante LoRA sobre todos los modulos lineales, lo que permite adaptar el modelo completo sin reentrenar todos los pesos. La semilla de entrenamiento fue 42 (SFT v5).

Los datos de entrenamiento provienen de varios conjuntos de QA en japones, todos ellos reformateados y filtrados para la tarea: JEMHopQA (CC BY-SA 4.0), JSQuAD/JGLUE (CC BY-SA 4.0), NIILC QA en sus splits dev y test (CC BY-SA 4.0), JaQuAD (CC BY-SA 3.0, muestreado y filtrado) y `cl-nagoya/auto-wiki-qa` (CC BY-SA 4.0, muestreado y filtrado). Los contextos de recuperacion se extraen de Distributed Wikipedia Chunks (`bumbuboon/llm-course-final-2026`, derivado de Wikipedia japonesa, CC BY-SA 4.0) mediante el pipeline BM25/embedding/reranker/2-hop, sin alteracion de los textos. No se menciona el numero total de tokens de entrenamiento ni el uso de RLHF o DPO.

La innovacion principal no esta en la arquitectura sino en el acoplamiento al pipeline de recuperacion de produccion `run030`: busqueda 4-way RRF sobre top-100, reranker Ruri, expansion de 2 saltos basada en reglas, seleccion de articulos con el propio modelo base y `rerank_title_tail`, con los 5 mejores contextos (`CONTEXT_TOP_K=5`) como entrada.

## Capacidades

- Generacion de respuestas cortas a preguntas en japones a partir de contextos recuperados (short-answer QA).
- Lectura y sintesis de contextos documentales multiples (hasta 5 fragmentos en el pipeline de referencia).
- Manejo de preguntas multi-salto, gracias a la inclusion de JEMHopQA y a la expansion de 2 saltos del pipeline.
- Capacidad multilingue limitada al japones segun la model card (tag `ja`).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo de razonamiento explicito.
- No se documentan capacidades de generacion de codigo ni matematicas mas alla de lo que herede del modelo base.

## Casos de uso

- QA documental sobre Wikipedia japonesa: el modelo consume los 5 contextos recuperados por el pipeline `run030` y devuelve una respuesta corta, lo que encaja directamente con el escenario de entrenamiento.
- Asistentes de busqueda interna en japones: integrado tras un recuperador BM25/embedding y un reranker, puede generar respuestas concisas sobre documentacion corporativa en japones.
- Sistemas de preguntas y respuestas multi-salto: la inclusion de JEMHopQA en el entrenamiento lo hace adecuado para preguntas que requieren combinar informacion de varios articulos recuperados.
- Atencion al cliente en japones con base de conocimiento: con un RAG sobre FAQ o manuales, el modelo puede responder de forma breve y controlada, aunque requiere validacion por su tamano reducido.
- Extraccion de respuestas en pipelines de evaluacion: util como componente de respuesta en benchmarks de QA japones (JSQuAD, JEMHopQA, NIILC) para medir la calidad del recuperador.
- Prototipado de bajo coste: con menos de 900M de parametros y licencia Apache 2.0, sirve para experimentar con arquitecturas RAG en japones en hardware modesto antes de escalar a modelos mayores.
- Generacion de resumentes factuales de fragmentos: a partir de contextos cortos, puede producir respuestas sinteticas en japones para interfaces de consulta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,7-1,8 GB solo para pesos, mas overhead de activaciones y cache KV.
- VRAM estimada en cuantizacion de 8 bits: en torno a 0,9-1,0 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: en torno a 0,5-0,6 GB para pesos.
- Cabe holgadamente en GPUs de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores; tambien en GPUs integradas con suficiente memoria compartida para cuantizaciones agresivas.
- GPU profesionales recomendadas para produccion: A100, H100 o L40S si se necesita alto throughput con muchas peticiones concurrentes; para una sola instancia, cualquier GPU con 4 GB o mas es suficiente.
- Opciones de despliegue: vLLM, TGI, llama.cpp (previa conversion a GGUF), Ollama (previa conversion) y transformers con PEFT si se mantiene el adaptador LoRA.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma principal | Licencia | Especializacion |
|---|---|---|---|---|---|
| s2naito/qwen3.5-0.8b-rag-sft-v5 | 873M | no disponible | japones | Apache 2.0 | QA corta con RAG en japones |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible | multilingue | Apache 2.0 (segun base) | Proposito general |
| cl-nagoya/auto-wiki-qa (dataset, no modelo) | no aplica | no aplica | japones | CC BY-SA 4.0 | Fuente de datos de QA |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a parametros, licencia y especializacion.

## Limitaciones y advertencias

- Modelo especializado: esta entrenado para QA corta sobre contextos recuperados en japones; su rendimiento fuera de ese formato o idioma puede degradarse notablemente.
- Idioma limitado al japones segun la model card; no se garantiza calidad en castellano ni en otros idiomas.
- Riesgo de alucinacion: como todo modelo generativo, puede producir respuestas no sustentadas por los contextos, especialmente si la recuperacion es deficiente.
- Dependencia del pipeline: el entrenamiento esta acoplado al pipeline `run030` (RRF top-100, reranker Ruri, 2-hop, `CONTEXT_TOP_K=5`); usarlo con otro recuperador puede reducir la calidad.
- Datos de entrenamiento con licencias CC BY-SA 3.0 y 4.0: aunque el modelo se distribuye como Apache 2.0, la naturaleza share-alike de los datos de entrenamiento puede generar obligaciones adicionales en determinados usos; conviene revisar la procedencia antes de un despliegue comercial.
- Sin datos publicados de benchmarks, contexto maximo ni cuantizaciones soportadas: la evaluacion en produccion debe hacerse con un conjunto propio.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validacion por parte de la comunidad.
- No se documentan salvaguardas adicionales (filtros de seguridad, moderacion) mas alla de las del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/s2naito/qwen3.5-0.8b-rag-sft-v5
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JEMHopQA: https://github.com/aiishii/JEMHopQA
- JSQuAD / JGLUE: https://github.com/yahoojapan/JGLUE
- NIILC QA: https://github.com/mynlp/niilc-qa
- JaQuAD: https://github.com/SkelterLabsInc/JaQuAD
- auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Licencia CC BY-SA 3.0: https://creativecommons.org/licenses/by-sa/3.0/

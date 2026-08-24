# deu05232/promptriever-llama2-7B-followtable-RandLH-last

## Resumen

El modelo `deu05232/promptriever-llama2-7B-followtable-RandLH-last` es un adaptador LoRA (entrenado con PEFT) sobre el modelo base `meta-llama/Llama-2-7b-hf`. Pertenece a la familia Promptriever, un proyecto que explora cómo los modelos de recuperación de información (retrieval) pueden ser controlados mediante instrucciones en lenguaje natural, de forma similar a los modelos de lenguaje. El sufijo "followtable" sugiere que el modelo está especializado en seguir tablas o instrucciones estructuradas, mientras que "RandLH-last" probablemente indica una variante concreta del entrenamiento (posiblemente relacionada con el orden de las cabezas de atención o la inicialización aleatoria).

La model card oficial está prácticamente vacía: no se especifican datos de entrenamiento, licencia, idiomas, ni métricas de evaluación. El repositorio tiene un tamaño de 14.3 GB, lo que es coherente con un adaptador LoRA de 7B de parámetros (el adaptador en sí es pequeño, pero el repositorio puede incluir pesos completos o cuantizaciones). El modelo fue creado en agosto de 2026, sin descargas ni valoraciones, lo que indica que es un experimento de investigación sin distribución amplia. A pesar de la falta de documentación, su inclusión en el ecosistema Promptriever lo posiciona como un modelo de retrieval basado en LLM, relevante para tareas de búsqueda semántica y recuperación aumentada por generación (RAG).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama-2-7b (transformer decoder) con adaptador LoRA (PEFT) |
| Parametros totales | 7 mil millones (base) + adaptador LoRA (tamano no especificado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (estandar de Llama-2-7b) |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors, posiblemente FP16/BF16) |
| Idiomas soportados | no disponible (probablemente ingles, dado el modelo base) |
| Licencia | no disponible (el modelo base Llama-2 tiene su propia licencia) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer decoder de Llama-2-7b, con un adaptador LoRA añadido mediante la libreria PEFT. El adaptador modifica las capas de atencion y MLP para adaptar el modelo a tareas de retrieval. Segun el repositorio de Promptriever en GitHub, estos modelos se entrenan para que el comportamiento de recuperacion pueda ser controlado mediante prompts en lenguaje natural, de manera que el modelo genera puntuaciones de relevancia entre una consulta y un documento, condicionado a una instruccion. No se dispone de detalles sobre el dataset de entrenamiento, el numero de tokens, ni el regimen de entrenamiento (si se uso RLHF, DPO, etc.). El nombre "followtable" podria indicar un entrenamiento especifico con tablas de datos, pero no hay confirmacion. El adaptador se publico con la version PEFT 0.14.0.

## Capacidades

- Recuperacion de informacion (retrieval) controlada por prompts: el modelo puede puntuar la relevancia entre consultas y pasajes, siguiendo instrucciones que especifican el criterio de busqueda.
- Posible soporte para seguir tablas o datos estructurados, segun el nombre "followtable".
- Integracion con el ecosistema PEFT: puede cargarse como adaptador sobre Llama-2-7b para inferencia.
- No se documentan capacidades de generacion de texto, tool calling, agentes, vision ni audio.

## Casos de uso

- Busqueda semantica en corpus documentales: el modelo puede utilizarse para rerankear resultados de busqueda, puntuando la relevancia de documentos respecto a una consulta dada.
- Recuperacion aumentada por generacion (RAG): como componente de retrieval en un pipeline RAG, seleccionando los pasajes mas relevantes para alimentar a un LLM generativo.
- Filtrado de informacion en dominios con tablas: si el modelo realmente sigue tablas, podria emplearse para buscar dentro de datos estructurados (hojas de calculo, bases de datos) usando lenguaje natural.
- Experimentacion en investigacion: al ser un modelo de la familia Promptriever, sirve para estudiar como los prompts afectan al comportamiento de los modelos de retrieval.
- Desarrollo de sistemas de preguntas y respuestas sobre documentos: combinando el retrieval con un generador, se puede construir un sistema de QA sobre un corpus especifico.
- Evaluacion de modelos de retrieval: como punto de comparacion en benchmarks de recuperacion, aunque no hay datos publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni metricas de retrieval (como nDCG, MRR) para este modelo concreto.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA sobre Llama-2-7b, la inferencia requiere cargar el modelo base (unos 13-14 GB en FP16) mas el adaptador (pequeno). Con cuantizacion 4-bit, la VRAM necesaria puede reducirse a unos 6-8 GB.
- GPU recomendadas: NVIDIA A100, H100, RTX 4090, o cualquier GPU con al menos 16 GB de VRAM para FP16. Para cuantizacion, una RTX 3060 de 12 GB podria ser suficiente.
- Si cabe en consumer GPU: si, con cuantizacion (por ejemplo, mediante bitsandbytes) puede ejecutarse en GPUs de 8-12 GB, aunque con menor velocidad.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con la libreria `transformers` + `peft`. Para inferencia mas eficiente, se puede convertir a GGUF y usar llama.cpp u Ollama, o desplegar con vLLM si se fusiona el adaptador con el modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar este modelo con alternativas especificas. En el ambito de retrieval con prompts, existen otros modelos como BGE, E5, o Contriever, pero no hay datos de rendimiento publicados para este adaptador. La unica referencia es el propio repositorio de Promptriever, que no ofrece comparativas numericas.

## Limitaciones y advertencias

- La model card no proporciona informacion sobre sesgos, riesgos de alucinacion o limitaciones tecnicas.
- No se especifica la licencia, lo que impide conocer si puede usarse comercialmente. El modelo base Llama-2 tiene una licencia de uso comercial restringido, por lo que el adaptador hereda esas restricciones.
- No hay datos de evaluacion ni benchmarks, por lo que su rendimiento real es desconocido.
- El modelo no tiene documentacion de entrenamiento (dataset, hiperparametros, regimen), lo que dificulta su reproducibilidad.
- Al ser un adaptador experimental sin descargas, puede contener errores o no estar optimizado para produccion.
- La longitud de contexto se limita a 4096 tokens del modelo base, lo que restringe su uso en documentos muy largos.
- No se ha verificado la capacidad real de "followtable"; el nombre sugiere una funcionalidad que no esta confirmada en la documentacion.

## Enlaces

- [HuggingFace - deu05232/promptriever-llama2-7B-followtable-RandLH-last](https://huggingface.co/deu05232/promptriever-llama2-7B-followtable-RandLH-last)
- [GitHub - deu05232/promptriever](https://github.com/deu05232/promptriever)
- [FriendliAI - modelo promptriever-llama2-7B-followtable](https://friendli.ai/models/deu05232/promptriever-llama2-7B-followtable)

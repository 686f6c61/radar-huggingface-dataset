# Hikaf143/qwen2.5-7b-instruct-alpaca-ft

## Resumen

Hikaf143/qwen2.5-7b-instruct-alpaca-ft es un ajuste fino supervisado del modelo Qwen/Qwen2.5-7B-Instruct, publicado por el usuario Hikaf143 y atribuido en su model card a Hika (MKD Co., Ltd.). El entrenamiento se realizo con QLoRA (rango de LoRA 32, pesos base en NF4 y computo en bfloat16) sobre el dataset alpaca_guanaco-llama2-1k, con 50.877 filas, y se ejecuto en una unica NVIDIA GeForce RTX 5090 de 31 GB. El objetivo declarado es disponer de un asistente general de seguimiento de instrucciones para aplicaciones empresariales internas, con enfasis en conversacion en ingles y coreano, preguntas sobre documentos y tareas de instruccion estructurada.

Se trata de un transformer decoder-only de 7.615.616.512 parametros (unos 7,6 mil millones), lo que lo situa en el segmento de modelos densos de 7-8B que pueden desplegarse en una sola GPU profesional o en GPUs de consumo con cuantizacion de 4 bits. El repositorio ocupa 5,6 GB y esta etiquetado como safetensors, qwen2, 4-bit y awq, lo que sugiere que el artefacto publicado esta cuantizado a 4 bits, aunque la model card describe el proceso de ajuste (QLoRA) y no aclara la precision final de los pesos subidos.

La relevancia de esta ficha es doble. Por un lado, es un ejemplo tipico de ajuste fino ligero sobre un modelo base solido, util para quien quiera reproducir el flujo QLoRA en hardware de gama alta de consumo. Por otro, conviene tratarlo con cautela: tiene 7 descargas, 0 likes, no publica resultados de MMLU ni MT-Bench (ambos marcados como _pending_), no incluye evaluacion de seguridad y declara explicitamente que no debe desplegarse en produccion sin alineamiento y pruebas adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2, derivado de Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 (7,6B), segun safetensors del repositorio |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens en el modelo base Qwen2.5-7B-Instruct; no confirmado para este ajuste |
| Tipos de cuantizacion | Repositorio etiquetado como 4-bit y awq; entrenamiento en NF4 (QLoRA). Otras cuantizaciones (GGUF, GPTQ) no disponibles |
| Idiomas soportados | No disponible en los metadatos; la model card declara uso previsto en ingles y coreano |
| Licencia | Hereda la de Qwen/Qwen2.5-7B-Instruct (Apache 2.0 en el modelo base); el repositorio no expone un campo de licencia propio |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only denso con normalizacion RMSNorm pre-normalizada, activacion SwiGLU, embeddings con RoPE y atencion con consultas agrupadas (GQA). Segun la documentacion publica del modelo base, la pila consta de 28 capas, dimension oculta de 3584, 28 cabezas de consulta y 4 cabezas de clave/valor con dimension de cabeza de 128, un vocabulario de 151.936 tokens y una ventana de contexto nativa de 32.768 tokens, ampliable a 131.072 mediante escalado YaRN. Estas cifras corresponden al modelo base y no se confirman especificamente para el ajuste publicado.

El ajuste se realizo mediante QLoRA: los pesos base se cargaron cuantizados en NF4 y el entrenamiento se ejecuto en bfloat16, con adaptadores de rango 32. El dataset empleado es alpaca_guanaco-llama2-1k, una mezcla de instrucciones de tipo Alpaca y Guanaco con 50.877 filas. La perdida de validacion final reportada es de 0,2851, y el entrenamiento se ejecuto en una RTX 5090 de 31 GB. La model card no documenta el numero de tokens vistos, el numero de epocas, la tasa de aprendizaje ni si hubo etapas posteriores de RLHF o DPO; tampoco indica si se aplico decodificacion especulativa u otra optimizacion de inferencia.

## Capacidades

- Generacion de texto y seguimiento de instrucciones en formato conversacional de un solo turno y multi-turno, heredado del modelo base.
- Razonamiento basico y tareas de conocimiento general, con un nivel esperado cercano al de Qwen2.5-7B-Instruct y potencialmente degradado o sin cambios tras el ajuste, dado que no hay evaluacion publicada.
- Respuesta a preguntas sobre documentos, segun el caso de uso declarado por el autor.
- Finalizacion de instrucciones estructuradas (por ejemplo, formatos JSON o plantillas), coherente con el dataset Alpaca/Guanaco empleado.
- Capacidad multilingue heredada del modelo base, con uso previsto declarado en ingles y coreano; el autor advierte de que el rendimiento en tareas especificas de coreano puede ser limitado al haber entrenado solo con datos centrados en ingles.
- Soporte de tool calling y function calling: heredado del modelo base Qwen2.5, aunque no se verifica ni se documenta en esta model card.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible; se presume el del modelo base, sin garantia.
- Modo de pensamiento explicito (thinking mode), vision o audio: no disponible en este modelo.
- Capacidad de ajuste adicional: el repositorio puede servir como punto de partida para mas fases de QLoRA.

## Casos de uso

- Asistente conversacional interno en ingles o coreano: el modelo puede gestionar dialogos multi-turno dentro de la ventana de contexto del modelo base (32.768 tokens), adecuado para un bot de soporte interno en una empresa con documentacion en esos idiomas.
- Preguntas y respuestas sobre documentacion corporativa: con un pipeline de recuperacion (RAG) que inserte fragmentos en el prompt, el modelo puede responder sobre manuales, politicas internas o bases de conocimiento, aprovechando el contexto largo para incluir varios pasajes.
- Extraccion de informacion estructurada: conversion de correos, informes o tickets a JSON o tablas, apoyandose en el entrenamiento con instrucciones del dataset Alpaca/Guanaco, que favorece respuestas en formato solicitado.
- Clasificacion y enrutado de tickets: etiquetado de consultas entrantes por categoria, prioridad o equipo responsable, con coste bajo al ser un modelo de 7,6B desplegable en una sola GPU.
- Resumen de documentos largos: condensacion de actas, contratos o informes de decenas de miles de tokens en un unico paso, gracias a la ventana de contexto del modelo base.
- Prototipado e investigacion en ajuste fino: el repositorio sirve como ejemplo reproducible de QLoRA con rango 32 sobre hardware de consumo de gama alta, util para experimentar con datasets propios antes de escalar a modelos mayores.
- Traduccion ingles-coreano en dominios internos: uso como traductor auxiliar con supervision humana, teniendo en cuenta la advertencia del autor sobre el sesgo hacia el ingles.
- Generacion de codigo asistida en entornos controlados: el modelo base Qwen2.5-7B-Instruct tiene competencia en codigo, pero este ajuste no ha sido evaluado en esa tarea, por lo que solo se recomienda en flujos con revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card marca MMLU y MT-Bench como _pending_ tanto para el modelo base como para este ajuste, y el unico dato cuantitativo reportado es la perdida de validacion final de 0,2851. El informe de evaluacion referenciado (eval_results/run_2026-06-09_0540/summary.md) figura como ruta relativa en la model card, sin contenido disponible en la informacion proporcionada.

| Benchmark | Modelo base | Este modelo | Delta |
|---|---|---|---|
| MMLU | _pending_ | _pending_ | _pending_ |
| MT-Bench | _pending_ | _pending_ | _pending_ |
| Perdida de validacion | No disponible | 0,2851 | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16 o float16: en torno a 15,2 GB solo para pesos, mas cache KV y overhead, lo que situa el consumo practico entre 17 y 20 GB para contextos moderados.
- VRAM estimada en cuantizacion de 4 bits (NF4, AWQ o GPTQ): aproximadamente 4,5-5,5 GB de pesos, con consumo total tipico de 6 a 9 GB segun longitud de contexto y backend.
- VRAM estimada en 8 bits: unos 7,6 GB de pesos, con consumo total en torno a 10-12 GB.
- GPU profesionales: A100 40 GB y 80 GB, H100 80 GB, L40S 48 GB. Cualquiera de ellas permite bfloat16 con contexto largo.
- GPU de consumo compatibles: RTX 4090 y RTX 3090 (24 GB) en bfloat16 con contexto moderado; RTX 5090 (31 GB) en bfloat16 sin problemas; RTX 4080, 4070 Ti y 3060 de 12 GB solo en cuantizacion de 4 bits.
- Despliegue: vLLM y TGI para servidores con bfloat16 o AWQ; llama.cpp y Ollama para cuantizaciones GGUF en CPU o GPU mixta; Transformers con bitsandbytes para prototipado en 4 y 8 bits; AutoAWQ si se confirma que los pesos del repositorio son AWQ.
- Cache KV: segun la configuracion del modelo base (28 capas, 4 cabezas KV, dimension de cabeza 128), ocupa del orden de 14 KB por token en float16, es decir unos 470 MB para 32.768 tokens; activar cuantizacion de cache reduce este coste.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token para este ajuste.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Hikaf143/qwen2.5-7b-instruct-alpaca-ft | 7,6B | 32.768 tokens (base) | Heredada de Qwen2.5-7B-Instruct | HuggingFace, 7 descargas, 0 likes | Sin benchmarks publicados; sin evaluacion de seguridad |
| Qwen/Qwen2.5-7B-Instruct | 7,6B | 32.768 tokens, hasta 131.072 con YaRN | Apache 2.0 | HuggingFace, ampliamente usado | Modelo base con evaluacion publica extensa; referencia natural |
| meta-llama/Llama-3.1-8B-Instruct | 8,0B | 131.072 tokens | Llama 3.1 Community License | HuggingFace, muy extendido | Mayor contexto nativo; licencia con restricciones para grandes despliegues |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,2B | 32.768 tokens | Apache 2.0 | HuggingFace, muy extendido | Alternativa densa de tamano similar, con soporte de function calling |

Nota: los datos de los tres modelos comparativos provienen de su documentacion publica, no de la informacion proporcionada sobre el modelo objeto de esta ficha. Para este ultimo no hay resultados de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Sesgo de idioma: el ajuste se hizo con datos de instrucciones centrados en ingles (Alpaca/Guanaco), por lo que el rendimiento en coreano y en otros idiomas puede ser limitado sin un ajuste especifico adicional.
- Sin evaluacion de seguridad: la model card indica explicitamente que el modelo no ha sido evaluado frente a contenido danino y que no debe desplegarse en produccion sin alineamiento y pruebas de seguridad adicionales.
- Sin benchmarks: MMLU y MT-Bench estan marcados como pendientes. No hay evidencia publicada de que el ajuste mejore al modelo base, y es posible que introduzca regresiones en razonamiento, codigo o matematicas.
- Riesgo de alucinacion: heredado de un transformer de 7,6B sin verificacion factual; en tareas de pregunta-respuesta sobre documentos puede generar contenido plausible pero incorrecto. Se recomienda RAG con citas y validacion humana.
- Restricciones de licencia: el autor declara que el modelo hereda la licencia de Qwen2.5-7B-Instruct (Apache 2.0). Los metadatos de HuggingFace no exponen un campo de licencia propio, por lo que conviene verificar el estado legal antes de un uso comercial.
- Ambiguedad del artefacto: las etiquetas del repositorio indican 4-bit y AWQ, mientras que la model card describe el entrenamiento en QLoRA NF4. No se especifica si los safetensors publicados estan cuantizados, en cuyo caso el ajuste fino posterior o la fusion de adaptadores requeriria pasos adicionales.
- Discrepancia de identidad: la model card usa el identificador mkd-hika/qwen2.5-7b-instruct-alpaca-ft, distinto del identificador real del repositorio (Hikaf143/qwen2.5-7b-instruct-alpaca-ft).
- Datos de entrenamiento incompletos: no se documentan epocas, tasa de aprendizaje, tokens totales ni duracion del entrenamiento (marcada como _pending_).
- Adopcion practicamente nula: 7 descargas y 0 likes en el momento de redactar esta ficha, sin issues ni validacion por parte de la comunidad.
- Duplicacion de esfuerzo: ajustar un modelo ya alineado para instrucciones sobre un dataset generico de tipo Alpaca puede degradar capacidades previas sin aportar mejoras medibles, algo que la ausencia de evaluacion impide descartar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Hikaf143/qwen2.5-7b-instruct-alpaca-ft
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Informe de evaluacion citado en la model card: eval_results/run_2026-06-09_0540/summary.md (ruta relativa dentro del repositorio, contenido no disponible)
- Dataset declarado: alpaca_guanaco-llama2-1k, 50.877 filas (sin URL especificada en la model card)
- Paper, blog, repositorio o demo adicionales: no disponibles

Nota final: la busqueda web asociada a esta ficha no devolvio resultados relacionados con el modelo. Todos los enlaces recuperados correspondian a sitios de contenido para adultos, sin ninguna relacion con inteligencia artificial, por lo que se han descartado por completo.

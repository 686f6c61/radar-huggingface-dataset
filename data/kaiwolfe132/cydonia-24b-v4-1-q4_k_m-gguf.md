# kaiwolfe132/Cydonia-24B-v4.1-Q4_K_M-GGUF

## Resumen

Este repositorio contiene una cuantizacion en formato GGUF del modelo Cydonia-24B-v4.1, publicada por el usuario kaiwolfe132. No se trata de un modelo entrenado desde cero, sino de una conversion del checkpoint original TheDrummer/Cydonia-24B-v4.1 al formato GGUF mediante la herramienta GGUF-my-repo de ggml.ai, que a su vez utiliza llama.cpp. El resultado es un fichero listo para ejecutarse con llama.cpp, llama-server y, por extension, con cualquier runtime compatible con GGUF (Ollama, LM Studio, KoboldCpp, etc.).

La relevancia de este repositorio es practica: permite desplegar un modelo de aproximadamente 23.570 millones de parametros en hardware de consumo sin necesidad de GPUs de datacenter, gracias a la cuantizacion Q4_K_M. El repositorio ocupa 14,3 GB, lo que situa el fichero de pesos en un rango manejable para tarjetas graficas con 16-24 GB de VRAM o para ejecucion mixta CPU+GPU.

Conviene subrayar una limitacion importante de esta ficha: la model card del repositorio es exclusivamente una plantilla autogenerada de conversion a GGUF. No incluye informacion sobre arquitectura, datos de entrenamiento, licencia, idiomas ni capacidades especificas del modelo base. Todos esos datos se marcan como "no disponible" salvo que puedan derivarse del recuento real de parametros o del tamano del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 23.572.403.200 (aproximadamente 23,57 mil millones) |
| Parametros activos | no aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unica cuantizacion publicada en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (fichero `cydonia-24b-v4.1-q4_k_m.gguf`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base TheDrummer/Cydonia-24B-v4.1 en la informacion proporcionada. El recuento real de parametros procedente de los safetensors del modelo base es de 23.572.403.200, lo que confirma un modelo denso de aproximadamente 23,57 mil millones de parametros; no hay indicios en los metadatos de que se trate de una arquitectura de mezcla de expertos (MoE). La model card de este repositorio no describe el transformer subyacente, el numero de capas, la dimension oculta ni el mecanismo de atencion.

Tampoco hay datos sobre el proceso de entrenamiento: numero de tokens, composicion del dataset, uso de RLHF, DPO u otras tecnicas de alineacion. La unica informacion tecnica verificable es el proceso de conversion: el checkpoint original se transformo a GGUF con llama.cpp a traves del espacio GGUF-my-repo de ggml.ai, aplicando la cuantizacion Q4_K_M (bloques de 4 bits con escalas de 6 bits para pesos seleccionados). Para conocer detalles de entrenamiento y arquitectura es imprescindible consultar la model card del modelo base enlazada en la seccion de enlaces.

## Capacidades

- Generacion de texto: el modelo es un modelo de lenguaje causal de ~23,57B parametros y, por tanto, capaz de tareas genericas de continuacion y generacion de texto. No hay documentacion especifica en la informacion proporcionada.
- Razonamiento y matematicas: no disponible (no se documenta en la informacion proporcionada).
- Generacion de codigo: no disponible (no se documenta en la informacion proporcionada).
- Tool calling / function calling: no disponible (no se documenta en la informacion proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta en la informacion proporcionada).
- Capacidades multilingues: no disponible (no se declaran idiomas soportados).
- Capacidades especiales (modo thinking, vision, audio): no disponible (no se documenta ninguna).

Nota: la ausencia de datos no implica que el modelo carezca de estas capacidades, sino que la model card de este repositorio no las describe. Debe consultarse la documentacion del modelo base.

## Casos de uso

- Inferencia local en estaciones de trabajo: al estar en formato GGUF Q4_K_M y ocupar 14,3 GB, el modelo puede ejecutarse con llama.cpp en un equipo con GPU de 24 GB de VRAM (por ejemplo RTX 3090 o RTX 4090) o con reparto parcial CPU+GPU, lo que permite prototipado sin depender de APIs externas.
- Despliegue en servidor de chat autoalojado: mediante `llama-server` se puede levantar un endpoint HTTP compatible con la API de OpenAI, apto para integrarse en aplicaciones internas de conversacion donde la confidencialidad de los datos sea prioritaria.
- Generacion de texto en pipelines offline: util para tareas de procesamiento por lotes (resumen, reescritura, clasificacion generativa) donde el coste por token de una API resulta prohibitivo y el volumen justifica una GPU dedicada.
- Asistente de escritura y contenido: un modelo de este tamano suele emplearse para generacion creativa y asistencia de redaccion; conviene validar la calidad real del base antes de integrarlo en produccion, ya que no hay evaluaciones publicadas en este repositorio.
- Experimentacion e investigacion: el fichero GGUF facilita comparativas de cuantizacion (Q4_K_M frente a otros niveles) y estudios de degradacion de calidad por cuantizacion sobre un modelo concreto.
- Base para fine-tuning o adaptacion posterior: aunque este repositorio es solo de inferencia cuantizada, el modelo base TheDrummer/Cydonia-24B-v4.1 puede servir de punto de partida para adaptaciones con LoRA u otras tecnicas sobre el checkpoint original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de este repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de referencia, y tampoco se aportan metricas comparativas frente a modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF Q4_K_M ocupa aproximadamente 14,3 GB. A esa cifra hay que anadir la memoria de la cache KV, que depende del contexto configurado y del modelo base; con contextos amplios puede sumar varios GB adicionales.
- GPU recomendadas (por categoria): NVIDIA RTX 3090 (24 GB) y RTX 4090 (24 GB) para ejecucion completamente en GPU; A100 40/80 GB y H100 para despliegues de mayor concurrencia o contextos mas largos.
- Encaje en GPU de consumo: si, en GPUs con 24 GB de VRAM. En GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB, etc.) requeriria descarga parcial de capas a CPU o una cuantizacion mas agresiva que la publicada aqui.
- Opciones de despliegue: llama.cpp (`llama-cli` y `llama-server`) de forma nativa; tambien Ollama, LM Studio, KoboldCpp y cualquier runtime compatible con GGUF. vLLM y TGI no consumen GGUF de forma estandar, por lo que para esos motores habria que partir del checkpoint original en safetensors.
- Latencia y throughput: no disponible. No se aportan mediciones de tokens por segundo en la informacion proporcionada.

## Comparativa con modelos similares

En la informacion disponible no se identifican modelos comparables ni se aportan datos de rendimiento del modelo base. La siguiente tabla recoge unicamente los datos verificables de este repositorio frente a categorias genericas de tamano similar; los campos no documentados se marcan como no disponibles en lugar de estimarse.

| Modelo | Parametros | Contexto | Formato | Licencia |
|---|---|---|---|---|
| Cydonia-24B-v4.1 (GGUF Q4_K_M, este repo) | ~23,57B | no disponible | GGUF | no disponible |
| TheDrummer/Cydonia-24B-v4.1 (base) | ~23,57B | no disponible | safetensors | no disponible |
| Alternativas de ~24B | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia de documentacion: la model card de este repositorio no describe arquitectura, entrenamiento, idiomas ni licencia. Cualquier evaluacion seria debe remitirse al modelo base.
- Licencia no disponible: no se puede confirmar si el modelo permite uso comercial. Es imprescindible verificar la licencia del checkpoint original TheDrummer/Cydonia-24B-v4.1 antes de cualquier despliegue en produccion.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual; como cualquier modelo de lenguaje, puede generar contenido incorrecto con aparente seguridad.
- Sesgos: no se documentan analisis de sesgo ni de composicion del dataset de entrenamiento, por lo que no es posible caracterizar los sesgos del modelo.
- Degradacion por cuantizacion: la cuantizacion Q4_K_M introduce perdida de precision respecto a los pesos originales en fp16/bf16. No se aportan mediciones de esa degradacion en este repositorio.
- Contexto: se desconoce la longitud de contexto soportada. Los ejemplos de la model card usan `-c 2048` en `llama-server`, un valor conservador que no debe interpretarse como el maximo del modelo.
- Repositorio sin traccion: cero descargas y cero "likes" en el momento de redactar la ficha, lo que reduce la probabilidad de que haya sido validado por terceros.
- Idiomas: al no declararse idiomas soportados, no se garantiza un rendimiento adecuado en castellano.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/kaiwolfe132/Cydonia-24B-v4.1-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/TheDrummer/Cydonia-24B-v4.1
- Espacio GGUF-my-repo (herramienta de conversion): https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Instrucciones de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage

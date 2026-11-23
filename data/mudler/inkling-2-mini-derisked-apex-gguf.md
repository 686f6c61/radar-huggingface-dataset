# mudler/Inkling-2-Mini-Derisked-APEX-GGUF

## Resumen

Inkling-2-Mini-Derisked-APEX-GGUF es una coleccion de cuantizaciones GGUF del modelo Blackfrost-AI/Inkling-2-Mini-Derisked, un derivado de thinkingmachines/Inkling-2-Mini. El trabajo lo publica mudler, responsable del proyecto LocalAI y del proyecto APEX (Adaptive Precision for EXpert Models), orientado a cuantizar modelos de mezcla de expertos (MoE) asignando precision segun el rol del tensor y la posicion de la capa. El modelo base es un MoE de 26.070.385.152 parametros (unos 26,1 mil millones) con 24 capas, tamano oculto de 2304 y 128 expertos enrutados con 8 activos por token, sin experto compartido.

La relevancia de esta publicacion es doble. Por un lado, ofrece un conjunto de ocho variantes GGUF (desde 11,34 GB hasta 20,68 GB) con y sin importance matrix, pensadas para distintos presupuestos de memoria, incluida la posibilidad de ejecutar el modelo en GPUs de consumo. Por otro lado, documenta de forma transparente el proceso de cuantizacion, los ficheros auxiliares (proyector de vision y drafter de decodificacion especulativa) y sus propias limitaciones: el autor indica explicitamente que es una preview no evaluada, sin perplexity, KL ni benchmarks.

Es importante subrayar que esta ficha describe la cuantizacion, no el modelo original. El autor advierte de que Blackfrost-AI no participo en la creacion de estos ficheros y que las afirmaciones sobre el comportamiento del modelo base (orientado a reducir rechazos falsos) son responsabilidad de Blackfrost-AI. No se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bucle (looped): 24 capas, hidden size 2304, 128 expertos enrutados, 8 activos por token, sin experto compartido; capas 6 a 17 forman un nucleo que se ejecuta tres veces por token |
| Parametros totales | 26.070.385.152 (26,1 mil millones) |
| Parametros activos | 8 de 128 expertos enrutados por token (no se especifica el numero exacto de parametros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF k-quant en ocho variantes: Quality, I-Quality, Balanced, I-Balanced, Compact, I-Compact, I-Mini e I-Nano (las variantes con prefijo I- usan importance matrix) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (ficheros principales), mas proyector de vision en GGUF F16 y drafter en GGUF Q8_0 |

## Arquitectura y entrenamiento

El modelo base es un MoE con arquitectura de bucle: 24 capas con tamano oculto 2304, 128 expertos enrutados de los que se activan 8 por token y sin experto compartido. El ancho de la FFN de cada experto es 1152. Las capas 6 a 17 constituyen un nucleo que se ejecuta tres veces por token, lo que aumenta la profundidad efectiva sin incrementar el numero de capas. Es multimodal en su version upstream; los ficheros de esta cuantizacion contienen solo el modelo de lenguaje, y el proyector de vision se distribuye como fichero mmproj separado (F16, 639.348.768 bytes), convertido desde el checkpoint de Blackfrost-AI con `convert_hf_to_gguf.py --mmproj` de llama.cpp.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. El modelo base es un derivado "derisked" de Blackfrost-AI que, segun su propia model card, busca reducir los rechazos falsos; los pesos del shard principal fueron modificados mientras que el tokenizer, la configuracion, el drafter y el formato de cuantizacion se mantienen iguales que en upstream. La innovacion tecnica destacable de esta publicacion es el metodo APEX: cuantiza por rol de tensor y posicion de capa, manteniendo mayor precision en la primera y ultima capa y comprimiendo mas las capas intermedias, dado que los expertos enrutados toleran menor precision al activarse solo unos pocos por token. Las variantes con prefijo I- incorporan una importance matrix calculada sobre los pesos BF16 del propio modelo (no reutilizada del modelo base), construida con datos de calibracion diversos (chat, codigo, razonamiento, tool calling, trazas agenticas y Wikipedia); la matriz se incluye como `imatrix.gguf` (90.752.032 bytes). Ademas, se incluye un drafter DSpark de decodificacion especulativa en Q8_0 (402.278.560 bytes) para `--spec-type draft-dspark`, copiado de unsloth/Inkling-2-Mini-GGUF y entrenado contra el modelo objetivo upstream, no contra este derivado.

## Capacidades

- Generacion de texto conversacional, segun el tag `conversational` del repositorio.
- Razonamiento y trazas de tipo agentico: la importance matrix se calibro con datos de razonamiento, tool calling y trazas agenticas, lo que sugiere soporte para estos flujos (no verificado por el autor).
- Codigo: la calibracion de la imatrix incluye datos de codigo (no verificado con benchmarks).
- Vision: disponible mediante el fichero auxiliar `mmproj-Inkling-2-Mini-Derisked-F16.gguf`, que debe cargarse explicitamente; los ficheros de tier no incluyen el proyector.
- Decodificacion especulativa: soportada mediante el drafter DSpark opcional (`--spec-type draft-dspark`), que no se carga salvo que se solicite.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Comportamiento orientado a reducir rechazos falsos: afirmacion de Blackfrost-AI sobre el modelo base, no medida por el autor de la cuantizacion.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: la variante I-Nano (11,34 GB) o I-Mini (12,36 GB) permiten ejecutar un MoE de 26,1 mil millones de parametros en GPUs con 12-16 GB de VRAM mediante llama.cpp u Ollama, algo inviable con los pesos BF16.
- Servicio conversacional autoalojado: las variantes Balanced (20,68 GB) ofrecen un equilibrio entre calidad y memoria para atender conversaciones multi-turno en infraestructura propia con licencia Apache 2.0, sin coste por token.
- Asistentes con vision: cargando el mmproj F16 junto con cualquier tier se habilita el procesamiento de imagenes, util para tareas de descripcion, extraccion de informacion de capturas o soporte tecnico con imagenes adjuntas.
- Aceleracion de inferencia en produccion: el drafter DSpark Q8_0 permite activar decodificacion especulativa en llama.cpp, reduciendo la latencia por token en cargas interactivas sin cambiar el modelo objetivo.
- Investigacion sobre cuantizacion MoE: la publicacion incluye ocho variantes con y sin importance matrix del mismo modelo, lo que permite comparar el efecto de la imatrix y de los distintos niveles APEX sobre la calidad, util para estudiar tecnicas de compresion en arquitecturas MoE.
- Integracion con LocalAI: al estar publicado por el equipo de LocalAI y con el tag `endpoints_compatible`, el modelo puede servirse tras una API compatible con OpenAI en despliegues locales o en edge.
- Prototipado de agentes y tool calling: la calibracion con trazas agenticas sugiere su uso en pipelines de agentes, aunque el autor no ha validado el comportamiento en estos escenarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que es una preview no evaluada: solo se comprobo que los ficheros cargan y producen texto coherente con un prompt corto por tier, un prompt con imagen y una ejecucion del drafter. No se realizaron pruebas de perplexity, KL ni benchmarks, y no se probo el comportamiento de rechazo del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (el fichero debe caber en memoria junto con el contexto y el proyector si se usa vision):
  - I-Nano: 11,34 GB.
  - I-Mini: 12,36 GB.
  - Compact / I-Compact: 14,10 GB.
  - Quality / I-Quality: 20,07 GB.
  - Balanced / I-Balanced: 20,68 GB.
  - Proyector de vision F16: 0,64 GB adicionales.
  - Drafter DSpark Q8_0: 0,40 GB adicionales.
- GPUs recomendadas: RTX 4090 (24 GB) para los tiers Quality y Balanced; RTX 4080/4070 Ti Super (16 GB) o RTX 4070 (12 GB) para Compact, I-Mini e I-Nano; A100, H100 o H200 para despliegues con mayor concurrencia o contexto largo.
- Cabe en GPU de consumo: si, todas las variantes caben en GPUs de 12 GB o mas, salvo que el contexto extendido exija KV cache adicional.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, LocalAI (equipo autor del modelo), y servidores compatibles con endpoints OpenAI. vLLM y TGI no se mencionan en la informacion disponible para este formato.
- Latencia y throughput: no disponibles. El autor no publica mediciones; el drafter DSpark esta pensado para reducir la latencia mediante decodificacion especulativa, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Derisked APEX GGUF (este) | 26,1 mil millones (MoE, 8/128 activos) | no disponible | Apache 2.0 | GGUF (8 variantes) | Cuantizacion APEX con y sin imatrix; vision y drafter como sidecars |
| Blackfrost-AI/Inkling-2-Mini-Derisked | 26,1 mil millones (MoE) | no disponible | no disponible en la informacion | safetensors (~19,5 GB, 4 y 8 bits) | Modelo fuente; pesos del shard principal modificados; incluye mtp.safetensors |
| thinkingmachines/Inkling-2-Mini | 26,1 mil millones (MoE) | no disponible | no disponible en la informacion | safetensors | Modelo upstream de Thinking Machines Lab; multimodal |
| unsloth/Inkling-2-Mini-GGUF | 26,1 mil millones (MoE) | no disponible | Apache 2.0 | GGUF | Cuantizaciones alternativas del upstream; origen del drafter DSpark |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Preview no evaluada: el autor no ha medido perplexity, KL ni benchmarks; solo verifico que los ficheros cargan y generan texto coherente. No hay garantia sobre calidad o comportamiento.
- Comportamiento de rechazo no probado: pese a que el modelo base se presenta como "derisked" para reducir rechazos falsos, el autor de la cuantizacion no lo ha verificado.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado; sin benchmarks ni evaluaciones, no puede estimarse.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se especifican.
- Los tiers Quality y Balanced no ahorran espacio respecto al checkpoint fuente (~19,5 GB, 4 y 8 bits): estan pensados para quien quiere k-quants estandar, no para reducir huella.
- El drafter DSpark fue entrenado contra el modelo upstream, no contra este derivado; su eficacia con los pesos modificados no esta verificada.
- El proyector de vision y el drafter no se cargan por defecto; requieren solicitud explicita.
- Licencia Apache 2.0 permite uso comercial, pero las afirmaciones sobre el comportamiento del modelo base son responsabilidad de Blackfrost-AI y deben contrastarse en la model card de origen.
- El modelo base modifica los pesos del shard principal respecto al upstream; cualquier evaluacion previa de Inkling-2-Mini puede no ser extrapolable.

## Enlaces

- Repositorio Hugging Face de esta cuantizacion: https://huggingface.co/mudler/Inkling-2-Mini-Derisked-APEX-GGUF
- Modelo base (Blackfrost-AI): https://huggingface.co/Blackfrost-AI/Inkling-2-Mini-Derisked
- Modelo upstream (Thinking Machines Lab): https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Cuantizaciones GGUF alternativas (unsloth): https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Proyecto APEX: https://github.com/localai-org/apex-quant
- LocalAI: https://github.com/mudler/LocalAI
- Patreon del autor: https://www.patreon.com/cw/mudler
- Buy Me a Coffee del autor: https://www.buymeacoffee.com/mudler
- GitHub Sponsors del autor: https://github.com/sponsors/mudler

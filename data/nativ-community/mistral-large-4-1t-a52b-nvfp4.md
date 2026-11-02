# nativ-community/Mistral-Large-4-1T-A52B-NVFP4

## Resumen

Mistral Large 4 (nombre interno "Le Chonk") es el modelo mas grande publicado por Mistral AI hasta la fecha: un Mixture-of-Experts nativamente multimodal de 1 billon de parametros totales con 49 mil millones de parametros activos por token (52 mil millones incluyendo embeddings y capas de salida). Fue entrenado desde cero en 3.800 GPUs NVIDIA Grace Blackwell en los propios centros de datos de Mistral en Europa, lo que lo convierte en una de las apuestas europeas mas ambiciosas en el ambito de los modelos frontera de pesos abiertos.

Este repositorio concreto, publicado por la comunidad nativ-community, contiene el checkpoint cuantizado en formato NVFP4 del modelo base `mistralai/Mistral-Large-4-1T-A52B`. La cuantizacion NVFP4 aplica formato de 4 bits a los expertos del MoE manteniendo las capas lineales en FP8, lo que reduce sustancialmente el footprint de memoria respecto al checkpoint FP8 original y acelera la inferencia en GPUs Blackwell (B200, B300, GB200, GB300), que disponen de hardware dedicado para este formato numerico.

La relevancia de esta ficha radica en que permite desplegar un modelo de escala frontera (ventana de contexto de 1M tokens, razonamiento configurable por peticion, function calling nativo, salida JSON estricta y decodificacion especulativa DSpark integrada) con un consumo de memoria notablemente inferior al de la version FP8, manteniendo segun el autor un comportamiento equivalente en evaluaciones. El repositorio ocupa 610,1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) nativamente multimodal, con capas de atencion MLA |
| Parametros totales | 1 billon (1T) |
| Parametros activos | 49 mil millones por token (52 mil millones incluyendo embeddings y capas de salida) |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | NVFP4 (expertos MoE en 4 bits, lineales en FP8); existe version FP8 del modelo base y GGUFs publicados por ggml-org |
| Idiomas soportados | en, fr, de, es, pt, it, ja, ko, ru, zh, ar, fa, id, ms, ne, pl, ro, sr, sv, tr, uk, vi, hi, bn, bg, hr, cs, da, nl, et, fi, el, hu, ga, lv, lt, mt, sk, sl |
| Licencia | Mistral Ecosystem Open-Weight License (variante modificada de MIT, uso comercial y no comercial; el negocio de Model-as-a-Service requiere licencia comercial separada con Mistral) |
| Formato de pesos | NVFP4 (checkpoint cuantizado); compatible con safetensors via vLLM/SGLang; GGUFs disponibles en repositorio aparte |
| Tamano del repositorio | 610,1 GB |
| Modalidad de entrada | Texto e imagen; salida solo texto |
| Razonamiento configurable | Si (`low`, `medium`, `high`; por defecto `high`) |
| Decodificacion especulativa | Si, cabezal DSpark integrado (profundidad 3) |

## Arquitectura y entrenamiento

El modelo es un transformer con arquitectura Mixture-of-Experts de escala 1T parametros totales y 49B activos por token. Incorpora capas de atencion MLA (Multi-head Latent Attention), tal como se deduce de la necesidad de usar `--kv-cache-dtype fp8_ds_mla` en vLLM para las capas MLA. Es nativamente multimodal: acepta texto e imagen como entrada y produce texto. El entrenamiento se realizo desde cero sobre 3.800 GPUs NVIDIA Grace Blackwell en los centros de datos de Mistral en Europa; no se especifica en la informacion disponible el numero exacto de tokens de entrenamiento ni la composicion del dataset.

La innovacion tecnica mas destacable de este checkpoint es la cuantizacion NVFP4, que aplica 4 bits a los expertos del MoE y mantiene las capas lineales en FP8. Segun el autor, esto produce una huella de memoria sustancialmente menor y una inferencia mas rapida que el checkpoint FP8, sin regresiones de precision en los dominios evaluados. Ademas, el modelo incluye un cabezal de decodificacion especulativa DSpark embebido, con profundidad de borrador 3 (`num_speculative_tokens=3`), que acelera la generacion. No se detalla en la informacion proporcionada si hubo RLHF, DPO u otras etapas de alineacion posteriores al preentrenamiento.

## Capacidades

- Generacion de texto y razonamiento con esfuerzo configurable por peticion (`low`, `medium`, `high`; por defecto `high`).
- Razonamiento multimodal: entrada de imagenes y texto, con evaluaciones reportadas en GDP.pdf y MathVision.
- Contexto largo de hasta 1M tokens, con evaluacion en Graphwalks 512k.
- Function calling nativo y salida con esquema JSON estricto.
- Capacidades agenticas multi-paso: evaluado en DeepSWE, SWE-bench Pro, Terminal-Bench 4 y AutomationBench.
- Capacidades de ciberseguridad, evaluado en CyberGym.
- Soporte multilingue amplio: 38 idiomas listados, incluyendo espanol, frances, aleman, portugues, italiano, japones, coreano, ruso, chino, arabe, persa, hindi, entre otros.
- Decodificacion especulativa integrada (DSpark) para reducir latencia.
- Modo de razonamiento separado del contenido en la respuesta (parser `mistral` en vLLM).

## Casos de uso

- Atencion al cliente automatizada: el modelo puede mantener conversaciones multi-turno con contexto muy largo (hasta 1M tokens) gracias a su ventana extendida, lo que permite arrastrar historiales completos de cliente, documentacion de producto y politicas sin truncamiento. El modo `reasoning_effort="low"` reduce la latencia en respuestas de chat rapido.
- Generacion de codigo en produccion: soporta function calling nativo y salida JSON estricta, por lo que puede integrarse en pipelines de CI/CD para revision de codigo, generacion de parches y ejecucion de tareas agenticas (evaluado en SWE-bench Pro y Terminal-Bench 4).
- Agentes autonomos de resolucion de incidencias: con herramientas bien definidas y un system prompt claro, el modelo puede orquestar flujos multi-paso (diagnostico, consulta a APIs, aplicacion de cambios) usando `reasoning_effort="high"` para tareas complejas.
- Analisis de documentos extensos con imagenes: la combinacion de contexto de 1M tokens y entrada multimodal permite procesar informes, contratos o papers con graficos y tablas embebidas (evaluado en GDP.pdf).
- Automatizacion de procesos de negocio: evaluado en AutomationBench, adecuado para tareas de extraccion estructurada, clasificacion y enrutamiento con salida JSON validada por esquema.
- Asistencia en ciberseguridad: evaluado en CyberGym, puede emplearse en analisis de vulnerabilidades, triaje de alertas y generacion de informes tecnicos.
- Razonamiento matematico y visual: con entrada de imagenes y evaluacion en MathVision, util para resolver problemas con diagramas o figuras.
- Despliegue multilingue: con 38 idiomas soportados, sirve para atencion y generacion de contenido en mercados europeos y asiaticos sin modelos separados.

## Benchmarks y rendimiento

La model card del checkpoint NVFP4 no publica cifras numericas de benchmarks en el texto; unicamente indica que el checkpoint NVFP4 iguala el comportamiento del FP8 en todos los dominios evaluados (razonamiento multimodal, contexto largo, agentes de codigo, automatizacion de negocio y ciberseguridad) y remite a una imagen comparativa alojada en el repositorio del modelo base. Los benchmarks mencionados por nombre son: GDP.pdf, MathVision, Graphwalks 512k, DeepSWE, SWE-bench Pro, Terminal-Bench 4, AutomationBench y CyberGym.

No se han publicado resultados numericos de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 610,1 GB en NVFP4; el checkpoint FP8 equivalente es sustancialmente mayor. El despliegue de referencia en vLLM usa `--tensor-parallel-size 8`, lo que implica al menos 8 GPUs para repartir los pesos.
- GPU recomendadas: NVIDIA Blackwell con soporte hardware para NVFP4, es decir, B200, B300, GB200 y GB300. El formato NVFP4 esta optimizado para estas GPU; no se garantiza rendimiento equivalente en generaciones anteriores.
- Cabe en GPU consumer: no. Con 610,1 GB de pesos y necesidad de 8 vias de tensor parallelism en la configuracion de referencia, no es desplegable en GPUs de consumo (RTX 4090, etc.). Existen GGUFs publicados por ggml-org para llama.cpp, pero el tamano del modelo sigue requiriendo agregacion de memoria muy superior a una sola GPU consumer.
- Opciones de despliegue: vLLM (imagen oficial `vllm/vllm-openai:mistral-large-4`), SGLang y llama.cpp (via GGUFs de ggml-org). La configuracion de referencia de vLLM requiere `--kv-cache-dtype fp8_ds_mla`, `--tool-call-parser mistral`, `--reasoning-parser mistral`, `--enable-auto-tool-choice` y `--gpu-memory-utilization 0.85`.
- Decodificacion especulativa: se activa con `--speculative-config '{"method": "dspark", "num_speculative_tokens": 3}'`; el autor remite a la pagina del modelo base para las aceleraciones medidas.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor indica que NVFP4 ofrece inferencia mas rapida que FP8, pero sin cifras concretas en esta model card.
- Ajuste de memoria: si falta VRAM, reducir `--max-model-len` y/o `--max-num-seqs`.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mistral Large 4 NVFP4 (este) | 1T | 49B (52B con embeddings) | 1M | Mistral Ecosystem Open-Weight License | HuggingFace (nativ-community), vLLM, SGLang, llama.cpp |
| Mistral Large 4 FP8 (modelo base) | 1T | 49B (52B con embeddings) | 1M | Mistral Ecosystem Open-Weight License | HuggingFace (mistralai), vLLM, SGLang |
| Mistral Large 4 GGUFs (ggml-org) | 1T | 49B (52B con embeddings) | 1M | Mistral Ecosystem Open-Weight License | HuggingFace (ggml-org), llama.cpp |

No se dispone en la informacion proporcionada de datos de benchmarks numericos ni de especificaciones de modelos de otros fabricantes (por ejemplo, alternativas de escala frontera de otros laboratorios) que permitan una comparativa cuantitativa fiable. Por tanto, la comparativa se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- La licencia es "other" (Mistral Ecosystem Open-Weight License), una variante modificada de MIT. El uso comercial esta permitido, pero operar un negocio de Model-as-a-Service requiere una licencia comercial separada con Mistral. Verificar los terminos exactos en el fichero LICENSE del repositorio.
- El checkpoint esta optimizado para GPUs Blackwell; en hardware anterior el rendimiento de NVFP4 puede degradarse o no estar soportado.
- El modelo base es de tipo frontera y puede alucinar; no se han publicado en esta model card tasas de alucinacion ni evaluaciones de sesgo.
- No se detallan en la informacion disponible los sesgos conocidos del modelo ni la composicion del dataset de entrenamiento, lo que limita la evaluacion de riesgos.
- El razonamiento por defecto es `high`, lo que incrementa el coste computacional y la latencia; para chat rapido conviene usar `low`.
- El despliegue requiere al menos 8 GPUs en la configuracion de referencia de vLLM y 610,1 GB de almacenamiento para los pesos; no es viable en hardware consumer.
- El repositorio es de la comunidad nativ-community, no de Mistral AI directamente; conviene validar la integridad de los pesos y contrastar con el checkpoint oficial FP8.
- El autor recomienda usar la API de Mistral AI si el rendimiento del servido local es suboptimo.
- No se especifican limitaciones por idioma dentro de los 38 soportados; el rendimiento relativo entre idiomas no esta documentado en esta model card.

## Enlaces

- Repositorio HuggingFace de este checkpoint: https://huggingface.co/nativ-community/Mistral-Large-4-1T-A52B-NVFP4
- Modelo base (Mistral Large 4 - Le Chonk): https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B
- Checkpoint FP8 oficial: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B-NVFP4
- Licencia: https://huggingface.co/mistralai/Mistral-Large-4-1T-A52B-NVFP4/blob/main/LICENSE
- GGUFs para llama.cpp: https://huggingface.co/ggml-org/Mistral-Large-4-1T-A52B-NVFP4-GGUF
- Repositorio vLLM: https://github.com/vllm-project/vllm
- Repositorio SGLang: https://github.com/sgl-project/sglang
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Receta de vLLM para Mistral Large 4: https://recipes.vllm.ai/mistralai/Mistral-Large-4-1T-A52B
- Guia de vLLM para conservar memoria: https://docs.vllm.ai/en/latest/configuration/conserving_memory/#context-length-and-batch-size

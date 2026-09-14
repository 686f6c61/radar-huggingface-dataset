# PYTHAI/GLM-5.2-fork

# PYTHAI/GLM-5.2-fork

## Resumen

PYTHAI/GLM-5.2-fork no es un modelo entrenado ni un ajuste fino: es un fork puntero con la licencia bloqueada (*licence-locked pointer fork*) del checkpoint zai-org/GLM-5.2 en el commit `cf457fa734ab149ffef225f80893eb38c6ff5cdc`, capturado el 13 de septiembre de 2026. El repositorio conserva unicamente la LICENSE, la configuracion, el tokenizer y el codigo de ese commit exacto, con digests SHA-256 en FORK.json; no almacena ningun peso. Los 282 archivos de pesos, que suman 1506,7 GB, permanecen en el repositorio de origen. El repositorio ocupa 0,0 GB y registra 0 descargas y 0 me gusta en el momento de la consulta.

El modelo subyacente, GLM-5.2, es el modelo insignia de zai-org (Z.ai) para tareas de horizonte largo y sucede a GLM-5.1. Su rasgo mas citado es un contexto solido de 1.000.000 de tokens, junto con una arquitectura MoE de atencion dispersa (etiqueta `glm_moe_dsa` en HuggingFace) que incorpora la tecnica IndexShare, publicada en el articulo arXiv 2603.12201: se reutiliza el mismo indexador en cada cuatro capas de atencion dispersa, lo que reduce los FLOPs por token en 2,9 veces con contexto de 1M. Se distribuye bajo licencia MIT, sin restricciones regionales declaradas, con pesos en safetensors.

Su relevancia practica es doble. Por un lado, GLM-5.2 es una de las referencias abiertas en codificacion agentica y uso de herramientas (62,1 en SWE-bench Pro, 81,0 en Terminal Bench 2.1 con Terminus-2, 76,8 en MCP-Atlas). Por otro, este fork concreto responde a una necesidad de gobernanza y reproducibilidad: fija por commit la licencia y la configuracion del modelo para auditorias, pero obliga a cargar los pesos desde el repositorio original, apuntando a la revision exacta mediante `revision="cf457fa734ab149ffef225f80893eb38c6ff5cdc"`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con atencion dispersa; etiqueta de HuggingFace `glm_moe_dsa`. Incorpora IndexShare (indexador compartido cada cuatro capas de atencion dispersa) y capa MTP para decodificacion especulativa |
| Parametros totales | no disponible (el autor no publica el recuento; el repositorio de origen contiene 282 archivos de pesos que suman 1506,7 GB) |
| Parametros activos | no disponible (la arquitectura es MoE, pero no se especifica el numero de parametros activos por token) |
| Longitud de contexto | 1.000.000 de tokens (contexto solido declarado por el autor) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; el puntero de version posterior apunta a `zai-org/GLM-5.3-BF16`, lo que sugiere distribucion en BF16) |
| Idiomas soportados | ingles (en) y chino (zh); no se declaran otros idiomas en la model card |
| Licencia | MIT |
| Formato de pesos | safetensors (no incluidos en este repositorio) |
| Modelo base | zai-org/GLM-5.2 (commit `cf457fa734ab149ffef225f80893eb38c6ff5cdc`) |
| Version posterior indicada | zai-org/GLM-5.3-BF16 |
| Tamano del repositorio | 0,0 GB (sin pesos) |
| Libreria | transformers |
| Region declarada | us |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE) y atencion dispersa, identificada en el ecosistema de HuggingFace como `glm_moe_dsa`. Sobre esa base, GLM-5.2 introduce dos innovaciones descritas por el autor. La primera es IndexShare, que reutiliza el mismo indexador en cada cuatro capas de atencion dispersa y reduce los FLOPs por token en 2,9 veces a una longitud de contexto de 1M. La segunda es una mejora de la capa MTP (*multi-token prediction*) empleada para decodificacion especulativa, que eleva la longitud de aceptacion hasta un 20 %, es decir, permite validar mas tokens por paso de verificacion.

No se dispone de informacion publicada en los materiales consultados sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF o DPO. El autor describe niveles de esfuerzo de razonamiento (*thinking effort levels*) configurables, pensados para equilibrar rendimiento y latencia en tareas de codificacion, lo que implica una fase de postentrenamiento orientada a ese control, pero sin detalle tecnico en la model card. Del mismo modo, se declara el uso de parametros de muestreo concretos en evaluacion (temperatura 1,0 y top_p 0,95, con longitud maxima de generacion de 163.840 tokens) y GPT-5.5 en modo medium como modelo juez, dato util para reproducir la evaluacion pero no para reconstruir el entrenamiento.

## Capacidades

- Generacion de texto y conversacion multi-turno, con pipeline declarado `text-generation` y etiqueta `conversational`.
- Razonamiento de horizonte largo sobre contextos de hasta 1.000.000 de tokens, con vocacion explicita de sostener tareas prolongadas sin perder el hilo.
- Razonamiento matematico y cientifico: 99,2 en AIME 2026, 94,4 en HMMT de noviembre de 2025, 91,0 en IMOAnswerBench y 91,2 en GPQA-Diamond.
- Codificacion avanzada con niveles de esfuerzo de pensamiento seleccionables, orientados a intercambiar latencia por calidad.
- Trabajo a nivel de repositorio: 48,9 en NL2Repo y 62,1 en SWE-bench Pro.
- Uso de herramientas y function calling: 76,8 en MCP-Atlas (conjunto publico) y 48,2 en Tool-Decathlon.
- Comportamiento agentico en terminal: 81,0 en Terminal Bench 2.1 con arnés Terminus-2 y 82,7 con el mejor arnés reportado.
- Ejecucion de tareas de larga duracion: 74,4 en FrontierSWE (dominancia) y 13,0 en SWE-Marathon, frente a 1,0 de GLM-5.1.
- Multilingue limitado a ingles y chino segun la declaracion del autor.
- Decodificacion especulativa mediante capa MTP, con incremento de hasta el 20 % en la longitud de aceptacion.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Agentes de resolucion de incidencias en repositorios: el modelo puede recibir un issue, navegar el arbol de codigo y proponer un parche verificable, apoyandose en su puntuacion de 62,1 en SWE-bench Pro y en el contexto de 1M tokens para mantener a la vista varios archivos a la vez.
- Refactorizacion a nivel de repositorio completo: con 48,9 en NL2Repo, es adecuado para generar o reconstruir proyectos enteros a partir de una descripcion en lenguaje natural, tarea inviable con ventanas de contexto de 128K.
- Automatizacion de operaciones en terminal: los 81,0 puntos en Terminal Bench 2.1 con Terminus-2 lo sitúan como candidato para agentes que ejecutan comandos, leen salidas y corrigen errores en bucle, por ejemplo en pipelines de despliegue o diagnostico de sistemas.
- Orquestacion de herramientas mediante MCP: con 76,8 en MCP-Atlas, encaja en asistentes internos que encadenan busquedas, consultas a bases de datos y llamadas a APIs a traves del protocolo MCP.
- Analisis de documentacion tecnica o legal extensa: el contexto de 1M tokens permite procesar manuales, expedientes o bases de codigo completas sin trocear y sin estrategias de gestion de contexto, como el propio autor emplea en la evaluacion de HLE con herramientas (hasta 300.000 tokens).
- Razonamiento cientifico y verificacion matematica: el 91,2 en GPQA-Diamond y el 20,9 en CritPt lo hacen util para asistentes de investigacion que deben justificar pasos intermedios con un formato de respuesta controlado.
- Reescritura y revision de codigo en integracion continua: integrado via API o vLLM, puede actuar como revisor automatico de pull requests, ejecutando el mismo tipo de tareas medidas en ProgramBench (63,7).
- Generacion de datos sinteticos y evaluacion: su uso documentado como sujeto evaluado, junto a la existencia de un modelo juez externo, permite emplearlo en la generacion de trayectorias agenticas etiquetadas para entrenar modelos menores.
- Despliegue en infraestructura propia con requisitos regulatorios: la licencia MIT y la ausencia de limites regionales declarados facilitan el uso en organizaciones que no pueden enviar codigo a APIs externas, siempre que asuman el coste de hardware descrito mas abajo.
- Auditoria de licencias y reproducibilidad: el caso de uso propio de este fork es fijar por commit la LICENSE, el tokenizer y la configuracion de un checkpoint concreto para trazabilidad legal y tecnica.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. Los valores marcados con asterisco en el origen corresponden al conjunto completo (no solo al subconjunto de texto).

| Benchmark | GLM-5.2 | GLM-5.1 | Qwen3.7-Max | MiniMax M3 | DeepSeek-V4-Pro | Claude Opus 4.8 | GPT-5.5 | Gemini 3.1 Pro |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| HLE | 40,5 | 31 | 41,4 | 37 | 37,7 | 49,8* | 41,4* | 45 |
| HLE (con herramientas) | 54,7 | 52,3 | 53,5 | - | 48,2 | 57,9* | 52,2* | 51,4* |
| CritPt | 20,9 | 4,6 | 13,4 | 3,7 | 12,9 | 20,9 | 27,1 | 17,7 |
| AIME 2026 | 99,2 | 95,3 | 97 | - | 94,6 | 95,7 | 98,3 | 98,2 |
| HMMT nov. 2025 | 94,4 | 94 | 95 | 84,4 | 94,4 | 96,5 | 96,5 | 94,8 |
| HMMT feb. 2026 | 92,5 | 82,6 | 97,1 | 84,4 | 95,2 | 96,7 | 96,7 | 87,3 |
| IMOAnswerBench | 91,0 | 83,8 | 90 | - | 89,8 | 83,5 | - | 81 |
| GPQA-Diamond | 91,2 | 86,2 | 90 | 93 | 90,1 | 93,6 | 93,6 | 94,3 |
| SWE-bench Pro | 62,1 | 58,4 | 60,6 | 59 | 55,4 | 69,2 | 58,6 | 54,2 |
| NL2Repo | 48,9 | 42,7 | 47,2 | 42,1 | 35,5 | 69,7 | 50,7 | 33,4 |
| DeepSWE | 46,2 | 18 | 18 | 20 | 8 | 58 | 70 | 10 |
| ProgramBench | 63,7 | 50,9 | - | - | 47,8 | 71,9 | 70,8 | 39,5 |
| Terminal Bench 2.1 (Terminus-2) | 81,0 | 63,5 | 75 | 65 | 64 | 85 | 84 | 74 |
| Terminal Bench 2.1 (mejor arnés reportado) | 82,7 | 69 | - | - | - | 78,9 | 83,4 | 70,7 |
| FrontierSWE (dominancia) | 74,4 | 30,5 | - | - | 29,0 | 75,1 | 72,6 | 39,6 |
| PostTrainBench | 34,3 | 20,1 | - | - | - | 37,2 | 28,4 | 21,6 |
| SWE-Marathon | 13,0 | 1,0 | - | - | - | 26,0 | 12,0 | 4,0 |
| MCP-Atlas (conjunto publico) | 76,8 | 71,8 | 76,4 | 74,2 | 73,6 | 77,8 | 75,3 | 69,2 |
| Tool-Decathlon | 48,2 | 40,7 | - | - | 52,8 | 59,9 | 55,6 | 48,8 |

No se han publicado resultados especificos de MMLU ni HumanEval en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra oficial. Como referencia aritmetica, los pesos de origen suman 1506,7 GB en 282 archivos, de modo que solo el almacenamiento de pesos exige mas de 1,5 TB de VRAM agregada antes de contar cache KV ni activaciones. Con contexto de 1M tokens, la cache KV es el factor dominante y no se ha publicado su tamano.
- GPU recomendadas: despliegue multi-nodo obligatorio en la practica. Un nodo de 8 GPU H100 de 80 GB (640 GB) o de 8 GPU H200 de 141 GB (1128 GB) resulta insuficiente para los pesos declarados. Se necesitan configuraciones del orden de 16 aceleradores de 141 GB o superiores para pesos y margen operativo, sin contar la cache KV.
- GPU de consumo: no cabe en ninguna GPU de consumo. Tarjetas como RTX 4090 (24 GB) o RTX 5090 (32 GB) no pueden alojar el modelo ni siquiera con un offload masivo, que degradaria la latencia de forma incompatible con uso interactivo.
- Opciones de despliegue documentadas por el autor: SGLang (v0.5.13.post1 o superior), vLLM (v0.23.0 o superior), Transformers (v0.5.12 o superior), KTransformers (v0.5.12 o superior) y Unsloth (v0.1.47-beta o superior) para ajuste. En plataforma Ascend NPU se citan vLLM-Ascend, xLLM y SGLang.
- Ollama y llama.cpp: no confirmados por el autor. No se documentan pesos GGUF en el material consultado.
- Latencia y throughput: no disponibles. El unico dato de eficiencia publicado es la reduccion de 2,9 veces en FLOPs por token a 1M de contexto gracias a IndexShare, y el aumento de hasta el 20 % en la longitud de aceptacion de la decodificacion especulativa mediante la capa MTP.
- Nota operativa: cargar este repositorio no descarga pesos. Hay que apuntar al modelo base fijando la revision, por ejemplo `AutoModel.from_pretrained("zai-org/GLM-5.2", revision="cf457fa734ab149ffef225f80893eb38c6ff5cdc", trust_remote_code=True)`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | SWE-bench Pro | GPQA-Diamond | Disponibilidad |
|---|---|---|---|---|---|---|
| GLM-5.2 | no disponible | 1M tokens | MIT | 62,1 | 91,2 | Pesos en zai-org/GLM-5.2; este fork solo replica licencia y configuracion |
| GLM-5.1 | no disponible | no disponible | no disponible | 58,4 | 86,2 | Predecesor directo, referenciado en la tabla del autor |
| Qwen3.7-Max | no disponible | no disponible | no disponible | 60,6 | 90 | Citado como modelo comparable en la tabla del autor |
| DeepSeek-V4-Pro | no disponible | no disponible | no disponible | 55,4 | 90,1 | Citado como modelo comparable en la tabla del autor |
| MiniMax M3 | no disponible | no disponible | no disponible | 59 | 93 | Citado como modelo comparable en la tabla del autor |

Frente a los modelos propietarios incluidos en la misma tabla, Claude Opus 4.8 (69,2 en SWE-bench Pro), GPT-5.5 (58,6) y Gemini 3.1 Pro (54,2), GLM-5.2 se situa por encima de dos de ellos en esa prueba concreta y por debajo de Claude Opus 4.8, con la diferencia clave de distribuir pesos bajo MIT. Los datos de parametros, contexto y licencia de los modelos de comparacion no se detallan en la informacion disponible.

## Limitaciones y advertencias

- Este repositorio no contiene pesos. Cualquier intento de cargarlo directamente fallara; hay que usar el repositorio de origen con la revision fijada.
- No es un ajuste fino ni una variante del modelo: es una copia de licencia, configuracion, tokenizer y codigo. No debe citarse como un modelo distinto en comparativas de rendimiento.
- La model card apunta a una version posterior, `zai-org/GLM-5.3-BF16`, lo que sugiere que GLM-5.2 puede quedar obsoleto y que el fork quedara congelado en una version superada.
- Los numeros de benchmark son autodeclarados por el autor. En el origen, algunas cifras de modelos competidores van marcadas con asterisco porque corresponden al conjunto completo de evaluacion y no al subconjunto de texto, lo que impide una comparacion estrictamente homogenea.
- Idiomas declarados: unicamente ingles y chino. No hay soporte declarado de castellano, lo que afecta a la calidad esperada en tareas en espanol.
- Riesgo de alucinacion: no cuantificado por el autor. En tareas de razonamiento con formato impuesto (explicacion, respuesta exacta y confianza), la puntuacion de confianza la genera el propio modelo y no debe tomarse como probabilidad calibrada.
- Uso agentico con acceso a terminal y herramientas: los resultados en Terminal Bench y MCP-Atlas implican ejecucion real de comandos y llamadas a APIs. En produccion requiere aislamiento, permisos minimos y supervision humana.
- Coste de infraestructura: mas de 1,5 TB solo para pesos en la distribucion de origen. El coste energetico y de adquisicion es de orden institucional, no de equipo individual.
- Licencia: el fork declara que todos los derechos y obligaciones son los de la LICENSE del repositorio de origen en ese commit, que figura como MIT. Conviene verificar el texto exacto de la licencia en el origen antes de un uso comercial, ya que la model card del fork no reproduce su contenido completo.
- No se documentan cuantizaciones oficiales, lo que limita las opciones para reducir requisitos de memoria sin perder garantias de calidad.
- La busqueda web asociada a esta ficha no devolvio resultados relevantes sobre el modelo: los enlaces recuperados corresponden a paginas de soporte de Microsoft, sin relacion con GLM-5.2.

## Enlaces

- Repositorio del fork: https://huggingface.co/PYTHAI/GLM-5.2-fork
- Modelo base: https://huggingface.co/zai-org/GLM-5.2
- Version posterior indicada: https://huggingface.co/zai-org/GLM-5.3-BF16
- Digests del fork: https://huggingface.co/PYTHAI/GLM-5.2-fork/blob/main/FORK.json
- Blog de GLM-5.2: https://z.ai/blog/glm-5.2
- Articulo tecnico de GLM-5: https://arxiv.org/abs/2602.15763
- Articulo de IndexShare: https://arxiv.org/abs/2603.12201
- Ficha del articulo en HuggingFace: https://huggingface.co/papers/2602.15763
- Repositorio en GitHub: https://github.com/zai-org/GLM-5
- Documentacion de la API: https://docs.z.ai/guides/llm/glm-5.2
- Demo de chat: https://chat.z.ai
- Comunidad en Discord: https://discord.gg/QR7SARHRxK
- Recetario de SGLang: https://cookbook.sglang.io/autoregressive/GLM/GLM-5.2
- Recetas de vLLM: https://recipes.vllm.ai/zai-org/GLM-5.2
- Documentacion de Transformers para `glm_moe_dsa`: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm_moe_dsa.md
- Tutorial de KTransformers: https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.2-Tutorial.md
- Guia de Unsloth: https://unsloth.ai/docs/models/glm-5.2
- Ejemplo de despliegue en Ascend NPU: https://github.com/zai-org/GLM-5/blob/main/example/ascend.md

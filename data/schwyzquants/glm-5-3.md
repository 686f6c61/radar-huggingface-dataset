# schwyzquants/GLM-5.3

## Resumen

GLM-5.3 es un modelo de lenguaje de gran escala orientado a generacion de texto y tareas agenticas, publicado por Z.ai (organizacion zai-org) y redistribuido en este repositorio de HuggingFace por el usuario schwyzquants. Se trata de un modelo de tipo mezcla de expertos (MoE) con un total de 753.329.940.480 parametros (unos 753,3 mil millones) segun los pesos en safetensors, y su arquitectura aparece etiquetada como glm_moe_dsa, lo que apunta a un transformer con atencion dispersa, aunque la model card no detalla la configuracion interna.

La propuesta de valor del modelo es concreta: reutiliza exactamente el mismo modelo base que GLM-5.2 y todas las mejoras provienen del post-entrenamiento. Segun el autor, esto se traduce en una mejora del 50% sobre GLM-5.2 en su benchmark interno Z.ai Code Bench, en resultados de referencia (SOTA) en benchmarks publicos como Terminal Bench 3.0 y Agents' Last Exam, y en una capacidad emergente de ciberseguridad que mas que duplica a GLM-5.2 en pruebas de explotacion.

Es relevante ahora porque compite de forma directa con modelos frontera cerrados y abiertos en tareas de codigo, uso de terminal y agentes de horizonte largo, y porque su licencia es de pesos abiertos (glm-5.3, con license: other), lo que permite desplegarlo en infraestructura propia. El repositorio, sin embargo, es reciente (creado el 14 de septiembre de 2026) y no registra descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer con atencion dispersa (tag `glm_moe_dsa`); configuracion interna no disponible |
| Parametros totales | 753.329.940.480 (~753,3 B), dato de safetensors |
| Parametros activos | no disponible |
| Longitud de contexto | no se declara explicitamente; la model card evalua con contexto de hasta 1M tokens (NL2Repo) y 300.000 tokens (HLE con herramientas) |
| Tipos de cuantizacion | fp8 (tag del repositorio); no se detallan otras variantes oficiales |
| Idiomas soportados | en, zh |
| Licencia | glm-5.3 (`license: other`) |
| Formato de pesos | safetensors (tamano del repositorio: 755,7 GB) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura mas alla del tag `glm_moe_dsa`, que identifica una variante de mezcla de expertos con atencion dispersa dentro de la familia GLM y con soporte dedicado en Transformers (documentacion `glm_moe_dsa`). No se publican en la model card el numero de expertos, el ratio de activacion, el numero de capas ni la dimension oculta. Tampoco se indican el volumen de tokens de entrenamiento ni la composicion del dataset.

Lo que si se explicita es la estrategia de entrenamiento: GLM-5.3 usa el mismo modelo base que GLM-5.2 y todas las ganancias proceden del post-entrenamiento. No se detalla si este post-entrenamiento combina RLHF, DPO u otras tecnicas, aunque los resultados en benchmarks agenticos (Toolathlon Verified, AutomationBench, Agents' Last Exam, ExploitGym) sugieren un entrenamiento intensivo en tareas de multiples pasos, uso de herramientas y ejecucion en terminal. El modelo incorpora dos controles en tiempo de inferencia: el parametro `reasoning_effort`, con tres niveles (`low`, `high`, `max`, por defecto `max`), y la variable de plantilla de chat `clear_thinking`, que por defecto vale `false`.

## Capacidades

- Generacion de texto conversacional, con pipeline declarado `text-generation` y tag `conversational`.
- Codigo y tareas de ingenieria de software: mejora del 50% sobre GLM-5.2 en Z.ai Code Bench y resultados SOTA en Terminal Bench 3.0 (28,3), DeepSWE v1.1 (66,9), NL2Repo (58,0) y FrontierSWE (78,1).
- Tareas de horizonte largo y ejecucion autonomia en terminal: Terminal Bench 2.1 (88,2), SWE-Marathon v1.1 (42,5), PostTrainBench (39,8).
- Uso de herramientas y function calling: Toolathlon Verified (73,0), AutomationBench v1.0.6 (48,2), Agents' Last Exam ALE-CLI (28,5).
- Razonamiento con control de presupuesto: niveles `low`, `high` y `max` mediante `reasoning_effort`; en HLE con herramientas alcanza 62,5.
- Capacidad emergente de ciberseguridad: CyberGym (84,5, SOTA declarado), ExploitGym con presupuestos de 2h y 6h (105 y 130), ExploitBench (54,4).
- Multilingue limitado: los idiomas declarados son ingles y chino; no hay evaluaciones publicadas en castellano ni en otros idiomas.
- Vision, audio y otras modalidades: no disponible.

## Casos de uso

- Agentes de codigo sobre repositorios reales: el modelo esta optimizado para tareas tipo SWE-bench con ejecucion en terminal (Terminal Bench 2.1: 88,2), por lo que encaja en pipelines que clonan un repositorio, aplican parches y verifican tests de forma autonoma.
- Automatizacion de CI/CD y mantenimiento de dependencias: con soporte de tool calling y 73,0 en Toolathlon Verified, puede invocarse como agente que ejecuta comandos, interpreta salidas y encadena multiples pasos dentro de un runner.
- Migracion y refactorizacion de codigo a gran escala: NL2Repo (58,0) indica capacidad de generar repositorios completos a partir de descripciones en lenguaje natural, util para prototipado de servicios y andamiaje de proyectos.
- Tareas de varias horas con gestion de contexto: la model card evalua HLE con herramientas usando contexto de hasta 300.000 tokens y una estrategia de gestion de contexto, lo que habilita flujos de investigacion asistida de largo recorrido.
- Auditoria de seguridad y descubrimiento de vulnerabilidades: CyberGym (84,5) y ExploitBench (54,4) lo sitúan como herramienta para analisis de codigo en busca de fallos explotables en entornos controlados y con autorizacion explicita.
- Automatizacion de operaciones sobre terminales y sistemas remotos: AutomationBench v1.0.6 (48,2) refleja desempeno en tareas de administracion de sistemas ejecutadas paso a paso.
- Asistente de razonamiento tecnico con coste ajustable: usando `reasoning_effort=low` o `high` se puede reducir el gasto de tokens de pensamiento en consultas rutinarias y reservar `max` para depuracion compleja.

## Benchmarks y rendimiento

Resultados publicados en la model card (cifras autoinformadas por el autor; el mejor valor de cada fila aparece en negrita en el original):

| Benchmark | GLM-5.3 | GLM-5.2 | Kimi K3 | DeepSeek-V4 Pro-0813 | Qwen3.8-Max | Opus 4.8 | Fable 5 (w/ fallback) | GPT-5.6 Sol |
|---|---|---|---|---|---|---|---|---|
| Terminal Bench 2.1 | 88,2 | 81,0 | 88,3 | 87,9 | 86,6 | 85,0 | 88,0 | 88,8 |
| Terminal Bench 3.0 | 28,3 | 4,6 | 17,4 | – | – | 21,1 | 33,7 | 34,6 |
| DeepSWE (v1.1) | 66,9 | 46,2 | 67,5 | 62,7 | 56,6 | 58,0 | 69,7 | 72,7 |
| NL2Repo | 58,0 | 48,9 | 58,0 | 61,1 | 55,9 | 69,7 | – | – |
| ProgramBench (Almost Solved) | 19,0 | 9,5 | 17,5 | – | 10,5 | 15,5 | 33,0 | 23,0 |
| FrontierSWE | 78,1 | 67,5 | – | – | – | 66,5 | 88,2 | – |
| SWE-Marathon (v1.1) | 42,5 | 19,4 | 48,1 | – | – | 48,8 | 33,1 | 42,5 |
| PostTrainBench | 39,8 | 31,7 | 32,0 | – | – | 32,9 | 41,8 | 36,2 |
| CyberGym | 84,5 | 77,2 | 80,0 | 83,3 | 78,5 | 78,1 | 83,8 | 83,6 |
| ExploitGym (2h / 6h) | 105 / 130 | 29 / 39 | 36 / 70 | – | 14 / 26 | 80 / 120 | 181 / 247 | 216 / 293 |
| ExploitBench | 54,4 | 24,4 | 32,2 | – | 28,8 | 40,0 | 78,0 | 76,5 |
| Toolathlon Verified | 73,0 | 59,9 | 76,5 | 74,1 | 72,5 | 76,2 | 74,7 | 74,9 |
| AutomationBench (v1.0.6) | 48,2 | 26,2 | 46,7 | 43,2 | 39,8 | 41,0 | 46,2 | 45,8 |
| Agents' Last Exam (ALE-CLI) | 28,5 | 23,8 | 27,6 | 25,7 | 27,0 | 25,7 | 23,8 | 28,6 |
| HLE w/ Tools | 62,5 | 54,7 | 59,8 | 60,0 | 56,2 | 57,9 | 63,9 | 64,5 |
| GDPval-AA v2 | 1769 | 1508 | 1682 | 1590 | 1739 | 1588 | 1743 | 1730 |

Detalles metodologicos declarados: en HLE con herramientas se uso `temperature=1.0`, `top_p=0.95`, longitud maxima de generacion de 163.840 tokens, contexto maximo de 300.000 tokens con gestion de contexto, y GPT-5.6-luna (medium) como juez. En NL2Repo se uso `temperature=1.0`, `top_p=1.0` y `max_new_tokens=64k` bajo contexto de 1M. No se han publicado resultados de MMLU, GSM8K o HumanEval en la informacion disponible.

## Requisitos de hardware

- Peso de los pesos en fp8: aproximadamente 755 GB segun el tamano del repositorio, por lo que la inferencia en precision completa no cabe en una GPU individual.
- VRAM estimada (calculo derivado del numero de parametros, no confirmado por el autor): ~755 GB en fp8, ~760 GB en 8 bits, ~380-420 GB en 4 bits. Estas cifras no incluyen cache KV ni overhead de runtime, que con ventanas de contexto de cientos de miles de tokens pueden ser considerables.
- Configuraciones recomendadas: nodos multi-GPU, por ejemplo 8x H200 (141 GB cada una, ~1128 GB totales) para fp8 con margen para cache KV; 16x H100 80 GB (~1280 GB) para el mismo caso; para cuantizaciones de 4 bits, nodos de 4x H100 80 GB o 4x H200 quedan en el limite y requieren planificacion de memoria.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en ninguna GPU consumer actual en precision fp8. Solo seria viable con cuantizacion agresiva y descarga parcial a RAM o SSD (por ejemplo mediante KTransformers), con una penalizacion de latencia severa.
- Aceleradores alternativos: la model card indica soporte en la plataforma Ascend NPU a traves de vLLM-Ascend, xLLM y SGLang.
- Opciones de despliegue: SGLang, vLLM, TokenSpeed, Transformers, KTransformers, Unsloth y las mencionadas para Ascend NPU.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto declarado | Licencia | Rendimiento destacado |
|---|---|---|---|---|
| GLM-5.3 | 753,3 B (activos no disponibles) | Hasta 1M en evaluaciones; 300.000 en HLE con herramientas | glm-5.3 (`other`) | CyberGym 84,5; AutomationBench 48,2; GDPval-AA v2 1769; Terminal Bench 3.0 28,3 |
| GLM-5.2 | no disponible | no disponible | no disponible | Misma base; CyberGym 77,2; GDPval-AA v2 1508; Terminal Bench 3.0 4,6 |
| Kimi K3 | no disponible | no disponible | no disponible | DeepSWE 67,5; Toolathlon Verified 76,5; SWE-Marathon 48,1 |
| DeepSeek-V4 Pro-0813 | no disponible | no disponible | no disponible | NL2Repo 61,1; CyberGym 83,3; Toolathlon Verified 74,1 |
| Qwen3.8-Max | no disponible | no disponible | no disponible | GDPval-AA v2 1739; CyberGym 78,5 |
| Opus 4.8 | no disponible | no disponible | propietaria | NL2Repo 69,7; SWE-Marathon 48,8; ExploitGym 80/120 |
| GPT-5.6 Sol | no disponible | no disponible | propietaria | Terminal Bench 3.0 34,6; ExploitGym 216/293; HLE con herramientas 64,5 |

La comparativa se limita a los benchmarks publicados en la model card. Para el resto de modelos no se dispone de datos de parametros, contexto, licencia ni arquitectura en la informacion proporcionada, y no se han encontrado resultados de busqueda relevantes.

## Limitaciones y advertencias

- Los resultados de benchmarks son autoinformados por el autor del modelo; no hay verificacion independiente en la informacion disponible.
- Riesgo de alucinacion: no se publican tasas de alucinacion ni evaluaciones de fidelidad factual. En tareas de generacion abierta y de codigo el riesgo persiste.
- Idiomas: solo se declaran ingles y chino. No hay evaluaciones de calidad en castellano, por lo que su uso en produccion en espanol no esta respaldado por datos.
- Sesgos: no se documenta la composicion del dataset de entrenamiento ni evaluaciones de sesgo, por lo que no es posible estimar sesgos sistematicos.
- Licencia: identificada como `glm-5.3` con `license: other`. Hay que revisar los terminos completos antes de cualquier uso comercial; no se detallan restricciones concretas en la informacion disponible.
- Doble uso en ciberseguridad: el propio autor destaca una capacidad emergente de explotacion de vulnerabilidades (ExploitBench 54,4; ExploitGym 105/130). Su uso debe limitarse a entornos autorizados y con controles.
- Procedencia del repositorio: este repositorio pertenece a schwyzquants, mientras que la model card y los recursos enlazados apuntan a zai-org (Z.ai). Es una redistribucion de terceros con 0 descargas y 0 likes registrados; conviene verificar la integridad y autenticidad de los pesos frente a la publicacion oficial.
- Configuracion por defecto costosa: `reasoning_effort` vale `max` si no se especifica, y `clear_thinking` vale `false` en la plantilla de chat, lo que puede inflar el consumo de tokens y el contexto en escenarios conversacionales si no se ajustan explicitamente.
- Contexto: no se declara la ventana maxima oficial; las evaluaciones usan 300.000 y 1M tokens con estrategias de gestion de contexto, lo que sugiere que el rendimiento en ventanas muy largas depende de tecnicas externas.
- Coste de despliegue: ~755 GB de pesos en fp8 implican infraestructura multi-GPU de gama alta; no es desplegable en hardware de consumo.
- No hay informacion publicada sobre latencia, throughput, consumo energetico ni sobre versiones cuantizadas oficiales.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/schwyzquants/GLM-5.3
- Recursos del modelo en zai-org/GLM-5 (imagen de benchmarks): https://raw.githubusercontent.com/zai-org/GLM-5/refs/heads/main/resources/bench_53_2.png
- Repositorio zai-org/GLM-5: https://github.com/zai-org/GLM-5
- Guia de despliegue en Ascend NPU: https://github.com/zai-org/GLM-5/blob/main/example/ascend.md
- SGLang (cookbook de GLM-5.3): https://cookbook.sglang.io/autoregressive/GLM/GLM-5.3
- vLLM (recipes de zai-org/GLM-5.3): https://recipes.vllm.ai/zai-org/GLM-5.3
- TokenSpeed (recetas de modelos): https://lightseek.org/tokenspeed/recipes/models#glm-5-3
- Documentacion de Transformers para `glm_moe_dsa`: https://github.com/huggingface/transformers/blob/main/docs/source/en/model_doc/glm_moe_dsa.md
- Tutorial de KTransformers con GLM-5.2: https://github.com/kvcache-ai/ktransformers/blob/main/doc/en/kt-kernel/GLM-5.2-Tutorial.md
- Guia de Unsloth para GLM-5.3: https://unsloth.ai/docs/models/GLM-5.3
- Referencia arXiv indicada en los tags del repositorio: arXiv:2602.15763 (titulo no disponible en la informacion proporcionada)
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos resultados obtenidos correspondian a un comercio de moda y no guardan relacion con GLM-5.3.

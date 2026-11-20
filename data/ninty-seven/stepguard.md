# ninty-seven/StepGuard

## Resumen

StepGuard es un modelo de tipo guard (clasificador de seguridad) de 4.022 millones de parametros, desarrollado por el usuario ninty-seven y presentado en EMNLP 2026. Se obtiene mediante fine-tuning de Qwen3-4B-Instruct-2507 y esta disenado especificamente para agentes que utilizan herramientas (tool-using agents): inspecciona las acciones propuestas por el agente antes de su ejecucion (runtime guarding) y audita trayectorias completas de accion-observacion (post-hoc auditing). El modelo devuelve un juicio de seguridad, una justificacion, la fuente de riesgo y, en modo trayectoria, el indice del paso inseguro.

El problema que resuelve es concreto: los agentes basados en LLM ejecutan acciones sobre herramientas externas (envio de correos, llamadas a APIs, operaciones sobre ficheros) y necesitan una capa de control que detecte inyecciones de prompt, instrucciones maliciosas del usuario, feedback corrupto de herramientas o fallos inherentes del propio agente antes de que causen dano. StepGuard actua como ese punto de control, con un formato de salida estructurado y etiquetas de fuente de riesgo.

Su relevancia actual radica en que iguala o supera a GPT-5.4 en las metricas de clasificacion de seguridad reportadas (84,8 de accuracy a nivel de paso frente a 81,3; 83,0 de accuracy a nivel de trayectoria, identica), con solo 4B de parametros y licencia Apache 2.0, lo que permite desplegarlo en infraestructura propia como parte de un pipeline de agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

StepGuard parte de Qwen3-4B-Instruct-2507, un transformer decoder-only de 4B parametros, y se especializa mediante fine-tuning supervisado con la supervision generada por StepGen, seguido de un proceso de optimizacion con Balance-GRPO, una variante de GRPO (Group Relative Policy Optimization) disenada para equilibrar el aprendizaje entre decisiones seguras e inseguras. El dataset de entrenamiento esta publicado como ninty-seven/stepguard_data.

La innovacion principal no es arquitectonica sino de formulacion de la tarea: el modelo opera en dos modos (comprobacion en tiempo de ejecucion de una accion propuesta y auditoria posterior de una trayectoria completa), recibe como entrada la peticion del usuario, la lista de herramientas y el contexto de interaccion, y produce una salida estructurada con etiquetas XML que separan el juicio de seguridad (`Judgment`) de la presencia y tipo de fuente de riesgo (`RiskSource`), de modo que una accion segura puede convivir con un ataque detectado. En modo trayectoria anade ademas `<UnsafeStep>` con el indice del paso inseguro o `None`. El modelo no ejecuta el bloqueo ni la replanificacion: eso queda en manos de la aplicacion que lo integra.

## Capacidades

- Clasificacion de seguridad a nivel de paso: evalua una accion propuesta antes de su ejecucion y devuelve juicio, justificacion de 4-7 frases, presencia de fuente de riesgo y etiqueta de fuente de riesgo.
- Auditoria de trayectorias completas: analiza la secuencia de acciones y observaciones y localiza el paso inseguro concreto (`UnsafeStep`).
- Deteccion de inyeccion de prompt directa e indirecta, instrucciones maliciosas del usuario o jailbreak, informacion no fiable o desinformacion, inyeccion en la descripcion de herramientas, ejecucion maliciosa de herramientas, feedback corrupto de herramientas y fallos inherentes del agente.
- Razonamiento estructurado sobre evidencia, intencion, consecuencia y decision, segun la plantilla de prompt publicada.
- Soporte de contexto de sistema o perfil del usuario en la entrada.
- Capacidad multilingue: limitada al ingles segun la model card.
- No es un modelo generativo de proposito general ni un agente: es un componente de control para insertar en pipelines de agentes.

## Casos de uso

- Guardrail en tiempo de ejecucion para agentes con tool calling: antes de ejecutar cada accion, el orquestador envia la accion propuesta junto con el historial a StepGuard; si el juicio es `unsafe`, la aplicacion bloquea o replanifica. Es adecuado porque su latencia y coste son los de un modelo de 4B y su salida es parseable de forma determinista.
- Auditoria post-mortem de trazas de agentes: en un sistema de observabilidad, StepGuard recorre trayectorias completas ya ejecutadas para identificar el paso exacto donde se produjo una accion insegura, lo que facilita el analisis de incidentes y la mejora de prompts.
- Proteccion frente a inyeccion indirecta de prompt: cuando un agente lee contenido externo (paginas web, correos, documentos) y propone acciones basadas en el, StepGuard detecta si la accion obedece a contenido no fiable o manipulado.
- Supervision de agentes con acceso a herramientas sensibles (correo, pagos, ficheros, APIs internas): el modelo evalua la consecuencia concreta de la accion (que datos se leen o envian, que cuentas o sistemas se afectan) y verifica que se mantiene dentro del alcance autorizado.
- Generacion de datos de seguridad para entrenamiento: las justificaciones y etiquetas de fuente de riesgo producidas sobre trazas reales pueden reutilizarse como supervision para afinar el propio agente o para construir clasificadores auxiliares.
- Evaluacion continua en CI/CD de agentes: integrar StepGuard como test de regresion que ejecuta trayectorias sinteticas o grabadas y falla el pipeline si aparecen acciones marcadas como inseguras, permitiendo detectar regresiones de comportamiento tras cambios de prompt o de modelo.
- Filtrado de feedback corrupto de herramientas: en entornos donde las respuestas de herramientas pueden estar comprometidas, StepGuard senala `corrupted_tool_feedback` y evita que el agente actue sobre informacion envenenada.

## Benchmarks y rendimiento

Resultados de clasificacion de seguridad publicados en la model card (escala 0-100, mayor es mejor). Los resultados de trayectoria promedian ATBench, R-Judge y ASSE Security; los de paso promedian TS-Bench-Dojo y TS-Bench-Harm.

| Modelo | Step Acc. | Step F1 | Trajectory Acc. | Trajectory F1 |
|---|---:|---:|---:|---:|
| GPT-5.4 | 81,3 | 83,3 | 83,0 | 84,4 |
| Qwen3-4B-Instruct-2507 | 79,3 | 69,2 | 70,5 | 63,3 |
| AgentDoG-Qwen3-4B | 52,5 | 61,1 | 74,1 | 77,8 |
| TS-Guard | 84,0 | 79,9 | 71,5 | 58,4 |
| StepGuard (4B) | 84,8 | 84,1 | 83,0 | 83,3 |

Nota del autor: estas metricas evaluan la clasificacion de seguridad, no la calidad de la justificacion, la atribucion de la fuente de riesgo ni la localizacion del paso inseguro. Los promedios son no ponderados entre benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (BF16): aproximadamente 8-9 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, 12-16 GB para contextos moderados.
- Cuantizacion a 8 bits: unos 4-5 GB de pesos; a 4 bits: unos 2,5-3 GB, aunque el autor no publica cuantizaciones oficiales ni datos de calidad tras cuantizar.
- GPU recomendadas: A100, H100 o L40S para despliegue de alta concurrencia; RTX 4090, RTX 3090 o RTX A6000 para inferencia en una sola GPU sin cuantizar.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas en BF16, y en tarjetas de 8 GB con cuantizacion de 4-8 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama mediante conversion a GGUF (no se publican pesos GGUF en el repositorio).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Step Acc. | Trajectory Acc. | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| StepGuard | 4,02B | no disponible | 84,8 | 83,0 | Apache 2.0 | Hugging Face (safetensors) |
| Qwen3-4B-Instruct-2507 (base) | 4B | no disponible | 79,3 | 70,5 | Apache 2.0 | Hugging Face |
| AgentDoG-Qwen3-4B | 4B | no disponible | 52,5 | 74,1 | no disponible | Hugging Face |
| TS-Guard | no disponible | no disponible | 84,0 | 71,5 | no disponible | no disponible |
| GPT-5.4 (referencia cerrada) | no disponible | no disponible | 81,3 | 83,0 | propietaria | API |

StepGuard combina el mejor resultado a nivel de paso de la tabla con un rendimiento a nivel de trayectoria identico al de GPT-5.4, manteniendo un tamano de 4B y licencia permisiva, lo que lo hace desplegable en infraestructura propia frente a la alternativa via API.

## Limitaciones y advertencias

- Solo soporta ingles de forma declarada; su rendimiento en otros idiomas no esta documentado.
- Es un clasificador de seguridad, no un generador: no debe usarse como modelo conversacional general ni como sustituto del agente.
- No implementa el bloqueo ni la replanificacion; la aplicacion debe interpretar la salida y actuar en consecuencia, con el riesgo de fallos de integracion.
- Las metricas publicadas evaluan solo la clasificacion; no hay datos sobre calidad de las justificaciones, precision de la atribucion de fuente de riesgo ni exactitud de `UnsafeStep`.
- Riesgo de falsos negativos en ataques novedosos o fuera de la distribucion del dataset stepguard_data; no se documentan tasas de error por categoria de riesgo.
- Riesgo de sesgo hacia el formato y estilo de los prompts de entrenamiento: el autor exige usar las plantillas publicadas y el formato de entrada exacto, por lo que desviarse de ellas puede degradar el rendimiento.
- No se publican datos de longitud de contexto soportada, lo que complica dimensionar trayectorias largas.
- No se publican cuantizaciones oficiales (GGUF, AWQ, GPTQ) ni evaluaciones de su impacto en la precision de clasificacion.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrece ninguna garantia sobre la robustez del modelo frente a ataques adversariales dirigidos al propio guard.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ninty-seven/StepGuard
- Paper (arXiv): https://arxiv.org/abs/2608.24777
- Version HTML del paper: https://arxiv.org/html/2608.24777v1
- Codigo: https://github.com/zheng977/StepGuard
- Proyecto: https://zheng977.github.io/StepGuard/
- Dataset: https://huggingface.co/datasets/ninty-seven/stepguard_data
- Plantillas de prompt: https://github.com/zheng977/StepGuard/blob/main/src/guardrail/prompts/stepguard.py
- Documentacion del formato de entrada: https://github.com/zheng977/StepGuard/blob/main/docs-open/prompts.md
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507

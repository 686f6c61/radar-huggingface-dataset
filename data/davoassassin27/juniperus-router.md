# Davoassassin27/juniperus-router

## Resumen

Juniperus Router v1 es el componente de enrutamiento local opcional del entorno de desarrollo agentico Oni, un proyecto de tipo local-first desarrollado por Davoassassin27. El modelo convierte una peticion en lenguaje natural junto con un contexto reducido de proyecto y tarea en una unica decision JSON validada, que incluye intent, proyecto, tarea, agente objetivo, estrategia de worktree, estado del bucle y criterio de exito. No es un modelo conversacional general, sino un clasificador de intenciones con contrato estricto orientado a la orquestacion de agentes.

Es relevante ahora porque la revision publicada no contiene un checkpoint neuronal entrenado ni pesos en formato GGUF. Lo que se distribuye es el contrato ejecutable version 1, un backend de reglas (mock) como referencia, ejemplos y los informes de evaluacion. El pipeline de entrenamiento, exportacion y benchmark reside en el repositorio de Oni, con la intencion declarada de partir de un modelo instruct pequeno como Qwen2.5-0.5B-Instruct mediante LoRA.

La arquitectura neuronal final no esta definida en la informacion disponible. El modelo se enmarca en la categoria de router agentico para tool-use y cumple funciones de validacion, saneamiento de seguridad y degradacion controlada cuando el sidecar no esta disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el backend publicado es un sistema de reglas; la base neuronal prevista es un transformer instruct pequeno, p. ej. Qwen2.5-0.5B-Instruct, no confirmada) |
| Parametros totales | no disponible (no se publican pesos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la model card indica que los contextos son pequenos proyectos y tareas ficticios) |
| Tipos de cuantizacion | no disponible (se menciona exportacion a GGUF en el roadmap, sin artefactos publicados) |
| Idiomas soportados | ingles y espanol |
| Licencia | MIT (los recursos de marca de Oni quedan excluidos) |
| Formato de pesos | no disponible (no se incluyen pesos; se preve GGUF y LoRA en el pipeline) |

## Arquitectura y entrenamiento

La entrega actual no contiene una red neuronal entrenada. El backend de referencia es rules-v1, un sistema determinista que aplica reglas sobre el contexto de entrada para producir el objeto de decision definido en el contrato v1. La validacion se realiza con Pydantic, con parseo tolerante y saneamiento de seguridad. El contrato define nueve intents: `spawn_agent`, `query_status`, `merge_worktree`, `retry_task`, `cancel_task`, `discard_task`, `list_projects`, `help` y `unknown`.

El repositorio de Oni incluye generador de dataset, scripts de entrenamiento LoRA, exportacion a GGUF y benchmark. Se ha validado una ejecucion de humo en CPU, pero no se ha publicado ningun checkpoint real. El dataset asociado es Davoassassin27/juniperus-router-dataset. No se dispone de datos sobre numero de tokens de entrenamiento, composicion del corpus ni uso de RLHF o DPO.

La innovacion principal no es arquitectonica sino de contrato: invariantes de seguridad verificables. `main_direct` no es una salida valida y se degrada a rama aislada con decision `needs_human`; `branch_name` siempre empieza por `oni/`; `max_iterations` se limita al rango 1-6; las acciones sobre tareas exigen `task_ref` sin adivinar; y la decision es solo de previsualizacion, ya que Oni no la ejecuta y requiere confirmacion humana para merges y acciones destructivas.

## Capacidades

- Clasificacion de intencion a partir de una peticion en lenguaje natural mas contexto de proyecto y tarea.
- Generacion de un unico objeto JSON validado conforme al contrato v1.
- Seleccion de agente objetivo, estrategia de worktree y estado del bucle de ejecucion.
- Aplicacion de invariantes de seguridad con degradacion a `needs_human` y saneamiento de campos.
- Parseo tolerante de entradas y validacion con Pydantic.
- Soporte bilingue en ingles y espanol.
- Integracion como sidecar HTTP con fallback determinista en Oni si el servicio falta, tarda o devuelve `degraded`.
- No soporta generacion de texto libre, razonamiento general, codigo, matematicas, vision ni audio.

## Casos de uso

- Enrutamiento de peticiones en un entorno de desarrollo agentico: el router recibe una frase como "mergea la tarea 3f2a1b9c" y devuelve la intencion `merge_worktree` con `task_ref` validado, evitando que el agente interprete libremente la orden.
- Orquestacion de worktrees aislados: ante una peticion de trabajo sobre el repositorio principal, el router degrada `main_direct` a `isolated_branch` y marca la decision como `needs_human`, lo que permite automatizar la creacion de ramas sin tocar main.
- Control de bucles de agente: fija `max_iterations` entre 1 y 6 y el `loop_status`, lo que acota el numero de reintentos en pipelines de agente y evita bucles infinitos.
- Integracion en CI/CD como paso de pre-validacion: el sidecar puede desplegarse en un puerto local (por defecto 7767) y validar comandos de automatizacion antes de que un humano confirme acciones destructivas.
- Desarrollo de asistentes de gestion de tareas: las intenciones `query_status`, `retry_task`, `cancel_task`, `discard_task` y `list_projects` permiten construir interfaces de control de tareas sobre el contrato sin ambiguedad.
- Evaluacion y sustitucion de backend: al separar contrato y backend (mock, oracle o futuro modelo neuronal), permite comparar reglas frente a un modelo entrenado con el mismo conjunto de test de 190 ejemplos.
- Prototipado de routers deterministas: util como referencia de implementacion para equipos que necesiten un router local con garantias de seguridad antes de disponer de pesos entrenados.

## Benchmarks y rendimiento

| Backend | Ejemplos | Intent | Exact | Violaciones de seguridad |
|---|---:|---:|---:|---:|
| oracle (etiquetas gold) | 190 | 100% | 100% | 0 |
| mock / rules-v1 | 190 | 73.7% | 73.7% | 5 |

El resultado oracle es una comprobacion del contrato, no el rendimiento de un modelo neuronal. Las cifras de mock corresponden a la linea base de reglas previa a la disponibilidad de un modelo entrenado. No se han publicado resultados de benchmarks de un checkpoint neuronal en la informacion disponible.

## Requisitos de hardware

- No se publican pesos, por lo que no puede estimarse la VRAM de inferencia de un checkpoint.
- El backend de reglas se ejecuta como sidecar local; la ejecucion de humo validada es en CPU.
- La base prevista (Qwen2.5-0.5B-Instruct con LoRA) cabria en GPUs de consumo, pero esta afirmacion es una extrapolacion del roadmap y no un dato publicado.
- Despliegue: servidor sidecar propio del proyecto (`juniperus serve --backend mock --port 7767`), invocado desde Oni mediante la variable `ONI_JUNIPERUS_URL`.
- No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Juniperus Router v1 | no disponible (sin pesos) | no disponible | Router agentico con contrato JSON y reglas | MIT | Contrato y backend mock publicados; sin checkpoint |
| Qwen2.5-0.5B-Instruct | 0.5B | no disponible en esta ficha | Modelo instruct general | no disponible en esta ficha | Pesos publicados |
| Routers basados en LLM con function calling | Variable | Variable | Clasificacion de intenciones y tool-use | Segun modelo base | Pesos publicados |

La comparativa con alternativas de la misma categoria no puede completarse con datos verificados en la informacion proporcionada; los modelos citados son referencias genericas y no se dispone de sus especificaciones en esta ficha.

## Limitaciones y advertencias

- No es un modelo de chat de proposito general; su uso esta restringido al contrato de enrutamiento.
- La revision publicada no incluye pesos entrenados; el backend de reglas es una linea base con 5 violaciones de seguridad sobre 190 ejemplos.
- Los contextos de entrenamiento y evaluacion son proyectos y tareas ficticios de tamano reducido; los repositorios reales pueden ser mayores.
- Riesgo de alucinacion no evaluado en un modelo neuronal, ya que no existe checkpoint.
- El router no adivina `task_ref`; las acciones sobre tareas fallan si falta la referencia.
- La decision es solo de previsualizacion: se requiere confirmacion humana para merges y acciones destructivas.
- La licencia MIT cubre el codigo, pero los recursos de marca de Oni quedan excluidos.
- No se documentan sesgos especificos ni evaluaciones de robustez multilingue mas alla del soporte declarado en ingles y espanol.
- El proyecto muestra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Davoassassin27/juniperus-router
- Dataset: https://huggingface.co/datasets/Davoassassin27/juniperus-router-dataset
- Repositorio Oni: https://github.com/Davoassassin27/oni
- Contrato v1: https://github.com/Davoassassin27/oni/blob/master/juniperus/docs/CONTRACT.md
- Landing de Oni: https://davoassassin27.github.io/oni/

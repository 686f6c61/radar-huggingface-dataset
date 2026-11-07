# OpenRAL/rskill-playbook-preflight_reach

## Resumen

`OpenRAL/rskill-playbook-preflight_reach` es un artefacto del proyecto OpenRAL, un harness de codigo abierto para agentes roboticos (Robot Agentic Layer). No se trata de un modelo neuronal: es un *rSkill* de tipo `playbook`, es decir, un procedimiento de decision simbolico escrito en Markdown (`PLAYBOOK.md`) que el razonador del sistema inyecta en su prompt de sistema y ejecuta paso a paso. Su funcion concreta es actuar como comprobacion previa (*preflight*) antes de despachar una habilidad de manipulacion: verificar que el objeto objetivo esta dentro del espacio de trabajo alcanzable del robot y, si no lo esta, preparar un desplazamiento de la base o ceder la tarea a un humano.

El playbook se declara con `role: s2` (razonamiento lento) y `kind: playbook`, con `actions: [plan]`, `chunk_size: 1` y sin actuadores requeridos (`actuators_required: []`). No tiene pesos, no se entrena y no produce salidas evaluables con benchmarks; su "ejecucion" consiste en la secuencia de llamadas a herramientas que el razonador realiza siguiendo el procedimiento, acotada por `playbook.max_steps: 8`. Compone herramientas ya existentes en OpenRAL: `recall_object`, `resolve_place`, `query_scene`, `execute_rskill` y `emit_prompt`.

Su relevancia es de infraestructura mas que de modelado: ejemplifica el patron de OpenRAL de separar politicas rapidas (neurales) de razonamiento lento (simbolico y trazable), con el playbook como contenido versionado y editable en lugar de codigo. Es agnostico al embodiment (`embodiment_tags: ["any"]`) y solo exige la capacidad `has_vision: true` en el robot, por lo que el cargador lo descarta en plataformas sin camara.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: procedimiento de decision simbolico (`kind: playbook`, `role: s2`) en Markdown; sin red neuronal |
| Parametros totales | 0 (sin pesos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del razonador que inyecta `PLAYBOOK.md` en su prompt de sistema) |
| Tipos de cuantizacion | No aplica (sin pesos); `dtype: fp32` declarado en metadatos |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 (contenido y codigo; sin pesos) |
| Formato de pesos | No aplica; el artefacto es `rskill.yaml` (manifiesto) + `PLAYBOOK.md` |
| Runtime declarado | pytorch (segun metadatos del manifiesto) |
| VRAM minima | No disponible (`min_vram_gb: null`) |
| Latencia declarada | 5000 ms |
| Acciones | `[plan]` |
| Chunk size | 1 |
| Actuadores requeridos | Ninguno (`actuators_required: []`) |
| Capacidades requeridas | `has_vision: true` |
| Embodiment | `["any"]` (comodin explicito, agnostico al robot) |
| Pasos maximos del playbook | 8 |
| Herramientas compuestas | `recall_object`, `resolve_place`, `query_scene`, `execute_rskill`, `emit_prompt` |

## Arquitectura y entrenamiento

No hay arquitectura neuronal ni entrenamiento. El artefacto es un *playbook* escrito a mano: un procedimiento operativo estandar (SOP) en Markdown que el razonador de OpenRAL lee e interpreta. El autor lo describe explicitamente como "contenido, no codigo": al instalarse, el razonador inyecta `PLAYBOOK.md` en su prompt de sistema y sigue sus pasos, componiendo herramientas que ya posee. Para cambiar el comportamiento se edita el Markdown y se incrementa la `version` del manifiesto; no existe destilado, RLHF, DPO ni ajuste fino alguno.

La logica del procedimiento es: (1) leer el automodelo `## ROBOT` del razonador (locomocion, alcance, carga util); (2) localizar el objetivo mediante memoria espacial o deteccion; (3) ejecutar una comprobacion de alcance; (4) si es alcanzable, permitir la manipulacion; si no lo es y existe base movil, preparar una pose de aproximacion y revalidar; si el brazo es fijo o el objetivo supera el limite de carga util, no despachar y ceder a un humano. La innovacion tecnica relevante es de seguridad y trazabilidad: el playbook no tiene autoridad de actuacion, y todo movimiento que dispara pasa por `execute_rskill` → chunk de accion → kernel de seguridad en C++ (referenciado como CLAUDE.md §1.1). Ademas, nunca se despacha a traves de `ExecuteRskill` por su rol `s2`.

## Capacidades

- Razonamiento simbolico de planificacion: decide si una habilidad de manipulacion puede despacharse segun alcanzabilidad del objetivo.
- Comprobacion de alcance (*reach check*) combinando automodelo del robot (locomocion, alcance, carga util) y pose del objeto.
- Composicion de herramientas: invoca `recall_object`, `resolve_place`, `query_scene`, `execute_rskill` y `emit_prompt`.
- Escalado de base movil: prepara una pose de aproximacion y revalida el alcance cuando el objetivo esta fuera de rango.
- Cesion a humano (*handoff*): no despacha y deriva cuando el brazo es fijo o se supera el limite de carga util.
- Agnostico al embodiment: funciona con cualquier robot que declare `has_vision: true`.
- Trazabilidad: cada paso queda acotado por `max_steps: 8` y cada movimiento pasa por el kernel de seguridad.
- Sin soporte de tool calling generico fuera del ecosistema OpenRAL, sin capacidades multimodales propias, sin generacion de texto libre ni codigo.

## Casos de uso

- Manipulacion segura en brazos fijos: antes de intentar coger un objeto, el playbook comprueba el alcance con el automodelo del robot y bloquea el despacho si el objetivo esta fuera del espacio de trabajo, evitando comandos invalidos o colisiones.
- Robots moviles con base y brazo: si el objetivo esta fuera de alcance, el playbook prepara una pose de aproximacion, revalida y solo entonces permite la manipulacion, lo que simplifica la logica de navegacion previa a la tarea.
- Control de carga util: cuando el objeto detectado supera el limite de payload declarado en `## ROBOT`, el playbook no despacha y deriva a un operador humano, reduciendo riesgos mecanicos.
- Orquestacion de tareas de picking en almacen: integrado en el razonador de OpenRAL, filtra solicitudes de manipulacion antes de llegar a la politica rapida, lo que reduce ejecuciones fallidas en entornos con objetos en estanterias de distinta altura.
- Validacion en simulacion y CI: el manifiesto se carga en las pruebas unitarias del proyecto (`test_rskill_manifest_kinds.py`), de modo que sirve como caso de prueba del contrato `kind: playbook` y de la inyeccion de playbooks en el razonador.
- Asistencia teleoperada con escalado: en robots con camara pero sin base movil, el playbook detecta la situacion de inalcanzabilidad y emite un aviso al operador mediante `emit_prompt`, habilitando intervencion humana rapida.
- Estandarizacion de procedimientos entre flotas: al ser un artefacto de contenido versionado y agnostico al embodiment, permite desplegar la misma politica de preflight en distintos modelos de robot editando un unico Markdown.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente `Evaluation: N/A` y que un playbook no produce salida de politica evaluable. El unico dato de rendimiento declarado es `latency_ms: 5000.0` en los metadatos del manifiesto.

## Requisitos de hardware

- VRAM estimada: no aplica al playbook (sin pesos); la VRAM depende del razonador y de las politicas que componga el sistema OpenRAL. `min_vram_gb` es `null`.
- GPU recomendadas: no disponibles para este artefacto; vienen determinadas por el razonador y los modelos desplegados en el harness.
- GPU de consumo: el playbook en si no requiere GPU; su viabilidad en GPUs de consumo depende del razonador elegido.
- Despliegue: se instala como rSkill dentro de OpenRAL mediante su manifiesto `rskill.yaml`; no se sirve con vLLM, llama.cpp, Ollama ni TGI, al no existir pesos.
- Latencia y throughput: latencia declarada de 5000 ms; throughput no disponible. El coste real por invocacion corresponde a las llamadas a herramientas y a los pasos del razonador, con un maximo de 8 pasos.
- Requisito de plataforma: robot con `has_vision: true`; el cargador descarta el playbook en robots sin camara.

## Comparativa con modelos similares

| Artefacto | Tipo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `OpenRAL/rskill-playbook-preflight_reach` | Playbook simbolico (`role: s2`) | 0 (sin pesos) | No disponible (depende del razonador) | Ninguno (escrito a mano) | Apache-2.0 | Hugging Face, 0 descargas |
| `rskills/find-object` (interno en OpenRAL) | Playbook simbolico | 0 (sin pesos) | No disponible | Ninguno | Apache-2.0 (repo OpenRAL) | Repositorio GitHub de OpenRAL |
| Politicas neurales de manipulacion en OpenRAL | Politica rapida neural | No disponible | No disponible | Entrenadas (no detallado) | No disponible | Ecosistema OpenRAL |

No se dispone de datos publicos de benchmarks ni de especificaciones completas de las alternativas neurales del ecosistema, por lo que la comparacion cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona por si mismo ni produce acciones; su calidad depende por completo del razonador que interpreta el Markdown.
- Solo en ingles: el procedimiento esta redactado en `en`, lo que puede afectar a equipos y despliegues en otros idiomas.
- Dependencia del automodelo: si la seccion `## ROBOT` del razonador (alcance, payload, locomocion) es incorrecta o esta desactualizada, la comprobacion de alcance puede dar falsos positivos o falsos negativos.
- Dependencia de percepcion: requiere `has_vision: true` y una localizacion fiable del objetivo via `recall_object` o `query_scene`; errores de deteccion o de pose del objeto degradan la decision.
- Alcance funcional acotado: cubre unicamente el preflight de alcanzabilidad antes de manipulacion; no planifica trayectorias, no ejecuta control y no sustituye a las politicas de accion.
- Sin datos de evaluacion: no hay benchmarks ni `eval/*.json`, por lo que no puede acreditarse su eficacia frente a alternativas.
- Madurez y adopcion nulas: 0 descargas y 0 likes en Hugging Face; el ecosistema OpenRAL esta en desarrollo y las referencias internas (por ejemplo, CLAUDE.md §1.1) no son documentacion publica estable.
- Licencia permisiva: Apache-2.0 permite uso comercial y modificacion, pero no se ofrece garantia alguna; al no haber pesos, no hay restricciones adicionales de modelo.
- Riesgo de deriva entre versiones: al ser contenido editable, cambios en `PLAYBOOK.md` sin incrementar `version` pueden producir comportamientos divergentes entre despliegues.

## Enlaces

- Hugging Face: https://huggingface.co/OpenRAL/rskill-playbook-preflight_reach
- Repositorio OpenRAL en GitHub: https://github.com/OpenRAL/openral
- PLAYBOOK.md del skill: https://huggingface.co/OpenRAL/rskill-playbook-preflight_reach/blob/main/PLAYBOOK.md
- Manifiesto rskill.yaml: https://huggingface.co/OpenRAL/rskill-playbook-preflight_reach/blob/main/rskill.yaml

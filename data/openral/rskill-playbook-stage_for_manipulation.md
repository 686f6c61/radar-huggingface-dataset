# OpenRAL/rskill-playbook-stage_for_manipulation

## Resumen

`rskill-playbook-stage_for_manipulation` es un artefacto de robótica publicado por OpenRAL en Hugging Face bajo el pipeline `robotics`. No es un modelo neural: es un `rSkill` de tipo `playbook`, es decir, un procedimiento de decisión simbólico en formato Markdown (`PLAYBOOK.md`) que el razonador del sistema OpenRAL inyecta en su prompt de sistema y ejecuta paso a paso. Su función concreta es llevar al robot hasta la pose de prensión (`pre-grasp` / `starting_pose`) declarada por una habilidad de manipulación y verificarla antes de que se ejecute la política de agarre.

El problema que resuelve es acotado pero recurrente en manipulación robótica: los fallos de agarre provocados por una pose inicial incorrecta. El playbook compone herramientas que el sistema ya posee (`resolve_place`, `execute_rskill`, `query_scene`, `memory_write`) sobre una habilidad de aproximación con conciencia de colisiones (MoveGroup), opcionalmente desplazando una base móvil para situar el objetivo dentro del espacio de trabajo del brazo. No contiene pesos, no emite acciones y no tiene autoridad de actuación: toda orden de movimiento pasa por `execute_rskill`, el chunk de acciones y el kernel de seguridad en C++.

Es relevante ahora porque ejemplifica una tendencia en robótica open source: separar la lógica de decisión de alto nivel (procedimientos legibles y versionables) de las políticas neuronales y del control de bajo nivel. Al ser agnóstico al embodiment (`embodiment_tags: ["any"]`) y estar bajo Apache-2.0, puede reutilizarse como plantilla de orquestación en stacks heterogéneos, siempre que el robot disponga de cámara.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neural; playbook simbólico en Markdown) |
| Parametros totales | 0 (sin pesos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del contexto del razonador que lo inyecta) |
| Tipos de cuantizacion | no disponible (sin pesos; `dtype: fp32` declarado en metadatos) |
| Idiomas soportados | en |
| Licencia | Apache-2.0 (contenido y código; sin pesos) |
| Formato de pesos | no disponible (no hay pesos; el runtime es `PLAYBOOK.md`) |

Otros metadatos declarados: `kind: playbook`, `role: s2`, `actions: [plan]`, `chunk_size: 1`, `actuators_required: []`, `runtime: pytorch`, `latency_ms: 5000.0`, `min_vram_gb: null`, `embodiment_tags: ["any"]`, `capabilities_required: has_vision: true`, `playbook.max_steps: 8`.

## Arquitectura y entrenamiento

No hay arquitectura de red ni entrenamiento. El artefacto es un documento de procedimiento escrito a mano; la model card indica explícitamente "hand-authored, not trained, so no weights and no upstream model". El autor modifica el comportamiento editando `PLAYBOOK.md` y subiendo la `version`, y la trazabilidad se apoya en un registro de decisión de autoría enlazado mediante `paper_url`.

El mecanismo de ejecución es una inyección en el prompt de sistema del razonador, que sigue el SOP y compone herramientas preexistentes. El contrato observación-acción es nulo: un playbook no emite chunks de `Action`, no requiere actuadores y su salida es la secuencia de llamadas a herramientas acotada por `playbook.max_steps: 8`. Las condiciones de disparo y finalización están declaradas en el manifiesto: se activa cuando una habilidad de manipulación declara una `starting_pose` o `pre-grasp` en la que el robot no se encuentra, y se considera terminado cuando el robot está en esa pose, verificada y listo para despachar la manipulación. El rol `s2` implica que nunca se despacha mediante `ExecuteRskill`.

## Capacidades

- Orquestación de movimiento hacia una pose de prensión declarada por otra habilidad, con verificación previa a la ejecución de la política de manipulación.
- Navegación opcional de base móvil para colocar el objetivo dentro del espacio de trabajo del brazo antes de la aproximación.
- Aproximación al pre-grasp mediante una habilidad de aproximación con conciencia de colisiones (MoveGroup).
- Verificación de pose mediante `query_scene` antes de ceder el control.
- Composición de herramientas: `resolve_place`, `execute_rskill`, `query_scene`, `memory_write`.
- Registro en memoria del estado alcanzado (`memory_write`) para pasos posteriores del razonador.
- Agnóstico al embodiment: declaración explícita del comodín `embodiment_tags: ["any"]`, con filtrado en carga para robots sin cámara.
- Sin soporte de tool calling propio, agentes autónomos, multilingüismo ni modos de razonamiento extendido más allá de lo que aporte el razonador anfitrión.

## Casos de uso

- Recogida de objetos en mesa con brazo fijo: el playbook lee la `starting_pose` de la habilidad de agarre, aproxima el brazo por la ruta libre de colisiones y verifica con `query_scene` antes de lanzar la política, reduciendo fallos por pose inicial desalineada.
- Manipulación con base móvil en almacén: antes de agarrar, desplaza la base para que el objetivo entre en el espacio de trabajo del brazo, evitando agarres al límite de alcance que degradan la precisión.
- Recuperación tras fallo de agarre: al reintentar una habilidad que declara pre-grasp, el playbook reubica el robot en la pose correcta en lugar de repetir la política desde una posición arbitraria.
- Encadenado de habilidades heterogéneas: en una secuencia pick-and-place con varias habilidades de distintos proveedores, normaliza la transición entre ellas garantizando que cada una arranca desde su pose declarada.
- Puesta a punto de nuevas políticas de manipulación: sirve como capa de staging reproducible para evaluar políticas aisladas del error de posicionamiento inicial.
- Estandarización en flotas multirobot: con `embodiment_tags: ["any"]`, un mismo procedimiento de staging se reutiliza en brazos de distintos fabricantes siempre que dispongan de cámara y de las herramientas compuestas.
- Plantilla de autoría de nuevos playbooks: su estructura (trigger, done_predicate, max_steps, composición de herramientas) sirve de referencia para escribir procedimientos S2 adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente `Evaluation: N/A` y que un playbook no produce salida de política evaluable con benchmarks. El único dato cuantitativo declarado es `latency_ms: 5000.0` como estimación de latencia en los metadatos.

## Requisitos de hardware

- VRAM: no aplica al playbook en sí (`min_vram_gb: null`, sin pesos). El consumo lo determina el razonador que lo inyecta y las habilidades compuestas.
- GPU: no disponible para este artefacto; depende del razonador anfitrión y de las políticas de manipulación ejecutadas.
- GPU de consumo: irrelevante para el playbook; la viabilidad depende del stack completo de OpenRAL.
- Despliegue: instalación como `rSkill` en el runtime de OpenRAL; carga mediante `RSkillManifest.from_yaml` y ejecución por el razonador con inyección de `PLAYBOOK.md` en el prompt de sistema. No se despliega con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: `latency_ms: 5000.0` declarada en el manifiesto; el throughput efectivo depende de las llamadas a herramientas y del movimiento físico del robot.
- Requisito funcional: robot con cámara (`has_vision: true`); en caso contrario el loader descarta la habilidad.

## Comparativa con modelos similares

| Artefacto | Tipo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| `OpenRAL/rskill-playbook-stage_for_manipulation` | Playbook S2 (sin pesos) | 0 | no disponible | Apache-2.0 | Publicado |
| `OpenRAL/rskill-find-object` (referenciado en tests) | rSkill, presumiblemente playbook | 0 | no disponible | Apache-2.0 (segun repositorio) | En arbol del repositorio |
| Políticas de manipulación neuronales (categoría genérica) | Política visuomotora | no disponible | no disponible | variable | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría con parámetros, contexto y rendimiento verificables; la comparación con políticas neuronales de manipulación no es homogénea porque este artefacto no ejecuta control.

## Limitaciones y advertencias

- No es un modelo: no genera texto, no razona por sí mismo y no puede evaluarse con MMLU, HumanEval, GSM8K ni métricas equivalentes.
- Depende por completo del razonador anfitrión y de la disponibilidad de las herramientas `resolve_place`, `execute_rskill`, `query_scene` y `memory_write`.
- Requiere cámara en el robot; sin `has_vision` el loader lo filtra y la verificación de pre-grasp no puede completarse.
- Acotado a `max_steps: 8`: escenarios que requieran más pasos de replanificación quedan fuera del procedimiento.
- Solo en inglés (`language: en`); no hay versiones en otros idiomas.
- Sin datos de sesgo ni de alucinación aplicables al no ser un modelo estadístico, pero la lógica simbólica puede quedar desalineada con escenas reales si `query_scene` devuelve información incompleta.
- Sin autoridad de actuación: cualquier movimiento pasa por el kernel de seguridad en C++; el playbook no puede saltarse esas comprobaciones.
- Sin métricas publicadas de tasa de éxito en agarre ni de reducción de fallos; la afirmación de mejora es cualitativa.
- Licencia Apache-2.0 permite uso comercial del contenido, pero no cubre los pesos ni las licencias de las habilidades y políticas compuestas, que deben verificarse por separado.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria ni informes de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/OpenRAL/rskill-playbook-stage_for_manipulation
- Repositorio del rSkill en GitHub: https://github.com/OpenRAL/openral/tree/master/rskills/stage-for-manipulation/
- `PLAYBOOK.md` (incluido en el repositorio del modelo): https://huggingface.co/OpenRAL/rskill-playbook-stage_for_manipulation/blob/main/PLAYBOOK.md

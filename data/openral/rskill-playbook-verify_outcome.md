# OpenRAL/rskill-playbook-verify_outcome

## Resumen

`rskill-playbook-verify_outcome` es un artefacto publicado por OpenRAL en Hugging Face bajo el pipeline `robotics`, pero no es un modelo neuronal: es un *rSkill* de tipo `playbook`, es decir, un procedimiento de decisión simbólico que el razonador de un sistema robótico inyecta en su *system prompt* y sigue como SOP (procedimiento operativo estándar). No tiene pesos, no se entrena y no genera acciones motoras; su "ejecución" consiste en la secuencia de llamadas a herramientas que el razonador realiza mientras lo sigue.

Su función concreta es cerrar el bucle tras la finalización de una habilidad o subtarea (patrón *Inner Monologue*): comprueba si la acción **realmente** tuvo éxito consultando la escena y un monitor de recompensa, en lugar de fiarse del "he terminado" devuelto por la política. Compone herramientas ya existentes en el runtime (`query_scene`, `query_task_progress`, `locate_in_view`, `memory_write`, `emit_prompt`) y clasifica el resultado como éxito o fallo con evidencia, derivando los fallos a replanificación o a intervención humana.

Es relevante ahora porque aborda un fallo clásico en pipelines robóticos: la confusión entre el resultado de la acción y el estado del mundo. Al ser *embodiment-agnostic* (declara el comodín `embodiment_tags: ["any"]`) y no requerir actuadores, puede instalarse en cualquier robot con cámara sin reentrenamiento ni calibración específica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (procedimiento simbólico; no es una red neuronal) |
| Parametros totales | 0 (sin pesos) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no aplica (sin pesos que cuantizar) |
| Idiomas soportados | en |
| Licencia | Apache-2.0 (contenido y código); sin pesos |
| Formato de pesos | no aplica (el runtime es `PLAYBOOK.md` en Markdown) |
| Tipo de rSkill | `kind: playbook`, `role: s2` |
| Acciones declaradas | `[plan]` |
| Chunk size | 1 |
| Actuadores requeridos | `[]` (ninguno) |
| Capacidades requeridas | `has_vision: true` |
| Runtime declarado | pytorch, dtype fp32 |
| Latencia declarada | 5000 ms |
| VRAM mínima declarada | no disponible (campo `min_vram_gb: null`) |
| `playbook.max_steps` | 6 |
| `playbook.trigger` | una habilidad o subtarea acaba de completarse y su éxito no es observable directamente desde el resultado de la acción |
| `playbook.done_predicate` | el resultado se clasifica como éxito o fallo con evidencia, y un fallo ha disparado una replanificación o un handoff |

## Arquitectura y entrenamiento

No hay arquitectura neuronal. El artefacto es un documento Markdown (`PLAYBOOK.md`) más un manifiesto YAML (`rskill.yaml`) que declara metadatos, precondiciones y predicado de finalización. El razonador del sistema OpenRAL inyecta el contenido del playbook en su *system prompt* y lo sigue como guion de decisión, componiendo herramientas que ya posee el runtime. El playbook se marca explícitamente como `role: s2` y nunca se despacha mediante `ExecuteRskill`; cualquier movimiento derivado de una replanificación pasa por la cadena `execute_rskill` → chunk de acción → kernel de seguridad en C++, de modo que el playbook no tiene autoridad de actuación.

No hubo entrenamiento: es de autoría manual, sin modelo upstream ni dataset. Los cambios de comportamiento se realizan editando `PLAYBOOK.md` e incrementando el campo `version`. La validación es exclusivamente de empaquetado: `tests/unit/test_rskill_manifest_kinds.py` carga todos los manifiestos del árbol, y las reglas de `kind: playbook` junto con la inyección en el razonador se prueban contra `rskills/find-object` en `tests/unit/test_playbook_rskill_manifest.py` y `tests/unit/test_reasoner_playbooks.py`. No existe innovación técnica en el sentido de atención, decodificación especulativa o similar; la aportación es de diseño de procedimiento.

## Capacidades

- Verificación de éxito de una habilidad o subtarea mediante preguntas sí/no dirigidas a la escena (`query_scene`), en lugar de confiar en el estado reportado por la política.
- Contraste cruzado con un monitor de recompensa (`query_task_progress`) como segunda fuente de evidencia.
- Confirmación opcional de la pose del objeto implicado mediante `locate_in_view`.
- Clasificación explícita del resultado como éxito o fallo, acompañada de la evidencia recogida.
- Encaminamiento de fallos hacia replanificación o hacia intervención humana; el playbook prohíbe explícitamente el "éxito silencioso".
- Registro de la evidencia mediante `memory_write`, y comunicación al operador o al razonador mediante `emit_prompt`.
- Composición de herramientas existentes del runtime; no introduce herramientas nuevas ni requiere sensores propios.
- Independiente del embodiment: funciona en cualquier robot cuyo `RobotCapabilities` incluya `has_vision: true`; el cargador lo filtra en robots sin cámara.
- Cota de ejecución de 6 pasos (`playbook.max_steps`), lo que acota el coste y evita bucles de verificación.
- Sin capacidades de generación de texto libre, código, matemáticas, visión por red neuronal, tool calling genérico, agentes multi-paso autónomos ni multilingüismo (solo inglés).

## Casos de uso

- **Manipulación pick-and-place en línea de montaje**: tras una habilidad de colocación, el playbook pregunta a la escena si el objeto está efectivamente sobre la superficie destino y contrasta con el monitor de recompensa antes de dar el ciclo por bueno; evita que un agarre fallido se propague a la siguiente estación.
- **Verificación de subtareas en tareas largas decompuestas**: en una secuencia de limpieza o ensamblaje de varios pasos, cada subtarea se valida con evidencia antes de que el razonador planifique la siguiente, lo que impide acumular errores silenciosos a lo largo de la cadena.
- **Detección temprana de fallos de política en despliegue**: cuando una política aprendida reporta "done" pero el objeto no se ha movido, el playbook clasifica el fallo y dispara replanificación; útil para instrumentar la tasa real de éxito de un checkpoint recién desplegado.
- **Handoff a operador humano en entornos colaborativos**: si la verificación no logra confirmar éxito dentro de los 6 pasos, el fallo se enruta a intervención humana con la evidencia recogida, en lugar de dejar la celda en un estado ambiguo.
- **Auditoría y trazabilidad de episodios**: el uso de `memory_write` deja registro de la evidencia consultada y de la clasificación, lo que permite reconstruir por qué un episodio se consideró exitoso o fallido en una revisión posterior.
- **Integración en robots de distintas plataformas sin reentrenamiento**: al declarar `embodiment_tags: ["any"]` y no requerir actuadores, el mismo playbook se instala en brazos, móviles o plataformas heterogéneas siempre que dispongan de cámara, reduciendo el trabajo de portabilidad.
- **Capa de seguridad lógica previa a la actuación**: al no tener autoridad de actuación y pasar cualquier movimiento por el kernel de seguridad en C++, puede desplegarse como verificación adicional sin ampliar la superficie de riesgo mecánico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explícitamente `Evaluation: N/A — no eval/*.json; a playbook produces no benchmarkable policy output`. El único dato de rendimiento declarado es una latencia de 5000 ms en el manifiesto, sin medición asociada publicada.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica al playbook en sí (no tiene pesos); el campo `min_vram_gb` está declarado como `null`. El consumo real proviene del razonador y del runtime que ejecuta las herramientas compuestas.
- GPU recomendadas: no disponibles; dependen íntegramente del modelo del razonador sobre el que se inyecte el playbook.
- Cabe en GPU de consumo: sí, en la medida en que el razonador subyacente quepa; el playbook no añade requisitos de memoria.
- Opciones de despliegue: se instala como manifiesto en el árbol de rSkills del runtime OpenRAL (`rskills/verify-outcome/rskill.yaml`) y se carga vía `RSkillManifest.from_yaml`. No se sirve mediante vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de pesos.
- Latencia y throughput: latencia declarada de 5000 ms y cota de 6 pasos por invocación; no se han publicado medidas de throughput.
- Requisito de plataforma: `has_vision: true` en `RobotCapabilities`; en robots sin cámara el cargador descarta el playbook.

## Comparativa con modelos similares

| Artefacto | Tipo | Pesos | Contexto | Licencia | Requisitos | Benchmark |
|---|---|---|---|---|---|---|
| `OpenRAL/rskill-playbook-verify_outcome` | playbook simbólico (S2) | ninguno | no aplica | Apache-2.0 | `has_vision: true`, 6 pasos máximo | no disponible |
| `rskills/find-object` (OpenRAL) | playbook simbólico | ninguno | no aplica | Apache-2.0 (según repositorio) | no disponible en la información proporcionada | no disponible |
| Política neuronal de manipulación (categoría genérica) | red neuronal con pesos | millones a miles de millones | no disponible | variable | GPU y entrenamiento específico por embodiment | no disponible |

La comparación con políticas neuronales no es directa: este playbook no compite en la tarea de generar acciones, sino que se superpone a cualquier política para verificar su resultado. Frente a `find-object`, ambos son playbooks del mismo ecosistema y comparten el mecanismo de inyección en el razonador, pero cubren fases distintas del ciclo (búsqueda frente a verificación de resultado).

## Limitaciones y advertencias

- No es un modelo: no genera texto, código ni acciones; cualquier expectativa de inferencia neuronal sobre este artefacto es un error de categoría.
- Depende por completo de la calidad de las herramientas que compone (`query_scene`, `query_task_progress`, `locate_in_view`): si la escena o el monitor de recompensa devuelven información errónea, la clasificación de éxito o fallo será errónea con evidencia aparentemente válida.
- Solo está redactado en inglés (`language: en`); no hay versión en castellano ni otros idiomas.
- Requiere una cámara operativa: en robots sin `has_vision: true` el cargador lo filtra y el playbook queda inactivo sin aviso funcional al planificador.
- Cota de 6 pasos: escenarios con verificación compleja (múltiples objetos, oclusiones) pueden agotar el presupuesto y derivar en handoff aunque la tarea fuese recuperable.
- No tiene autoridad de actuación por diseño; no puede corregir por sí mismo un fallo, solo señalarlo y encaminarlo.
- Ausencia total de benchmarks y de evaluación publicada: no hay métricas de tasa de detección de fallos, falsos positivos ni coste real en producción.
- Madurez temprana: 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validación externa.
- Licencia Apache-2.0 permite uso comercial del contenido, pero el playbook se apoya en herramientas del runtime OpenRAL cuyas condiciones deben verificarse por separado.
- Riesgo de deriva entre la documentación y el comportamiento si se edita `PLAYBOOK.md` sin incrementar `version`, ya que no existe verificación automática de semántica, solo de empaquetado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenRAL/rskill-playbook-verify_outcome
- Repositorio del rSkill en GitHub: https://github.com/OpenRAL/openral/tree/master/rskills/verify-outcome/
- `PLAYBOOK.md` (procedimiento de decisión): https://huggingface.co/OpenRAL/rskill-playbook-verify_outcome/blob/main/PLAYBOOK.md
- Repositorio principal de OpenRAL: https://github.com/OpenRAL/openral

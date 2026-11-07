# OpenRAL/rskill-playbook-decompose_mission

## Resumen

`rskill-playbook-decompose_mission` es un artefacto publicado por la organización OpenRAL dentro de su ecosistema de *rSkills* para robótica. No es un modelo neuronal: es un *playbook* simbólico de tipo `kind: playbook` con rol `s2`, es decir, un procedimiento de decisión en texto (`PLAYBOOK.md`) que el Reasoner del sistema OpenRAL inyecta en su *system prompt* y sigue como SOP (procedimiento operativo estándar). No tiene pesos, no se entrena y no produce políticas neuronales.

El problema que resuelve es concreto: descomponer una instrucción compuesta y multi-paso en una lista ordenada de subtareas, cada una con su propia condición de finalización verificable (una TODO list interna), ejecutarlas en orden, verificar cada condición antes de avanzar y, si una subtarea falla, replanificar únicamente esa subtarea, escalando a un humano cuando se agota el presupuesto de replanificación. Compone herramientas que el Reasoner ya posee: `execute_rskill`, `query_scene`, `query_task_progress`, `memory_write`, `memory_search` y `emit_prompt`.

Su relevancia es la de un componente de orquestación agnóstico al embodiment: declara el comodín explícito `embodiment_tags: ["any"]` y `capabilities_required` vacío, por lo que funciona con cualquier robot cuyo runtime exponga las herramientas compuestas. Está publicado con licencia Apache-2.0, en inglés, con pipeline `robotics` y `inference: false`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: playbook simbólico (procedimiento de decisión en texto), sin red neuronal ni pesos |
| Parametros totales | No disponible (sin pesos; el runtime es `PLAYBOOK.md`) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no hay pesos que cuantizar) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 (contenido y código); pesos: ninguno |
| Formato de pesos | No disponible (sin pesos; manifiesto YAML `rskill.yaml` y `PLAYBOOK.md`) |

Otros parámetros declarados en el manifiesto: `kind: playbook`, `role: s2`, `actions: [plan]`, `chunk_size: 1`, `actuators_required: []`, `runtime: pytorch`, `dtype: fp32`, `latency_ms: 5000.0`, `min_vram_gb: null`, `playbook.max_steps: 24`.

## Arquitectura y entrenamiento

No hay arquitectura neuronal ni entrenamiento. El artefacto es contenido escrito a mano (*hand-authored*), no entrenado, sin modelo upstream ni pesos. Su procedimiento operativo reside íntegramente en `PLAYBOOK.md`, que el Reasoner inyecta en su *system prompt* bajo la sección `## PLAYBOOKS` y sigue paso a paso. Para cambiar el comportamiento basta editar `PLAYBOOK.md` y incrementar `version`.

El contrato observación → acción es nulo: un playbook no emite chunks de `Action` ni requiere actuadores (`actuators_required: []`, `chunk_size: 1`). Su "salida" es la secuencia de llamadas a herramientas que el Reasoner realiza al seguir el SOP, acotada por `playbook.max_steps` (24). Toda moción que dispara pasa por `execute_rskill` → Action chunk → kernel de seguridad en C++, de modo que el playbook no tiene autoridad de actuación. Se declara `role: s2` y nunca se despacha a través de `ExecuteRskill`. El disparador (`playbook.trigger`) es que el objetivo sea una instrucción compuesta y multi-paso; el predicado de finalización exige que se haya confirmado el objetivo verificable de cada subtarea o que la misión se haya transferido a un humano.

## Capacidades

- Descomposición de misiones: convierte una instrucción compuesta en una lista ordenada de subtareas con condición de finalización verificable para cada una.
- Planificación persistente: escribe las subtareas en memoria (`memory_write`) para que el plan sobreviva a un tick y las recupera con `memory_search`.
- Ejecución orquestada: despacha la skill correspondiente a cada subtarea mediante `execute_rskill`.
- Verificación por subtarea: comprueba la condición de finalización antes de avanzar a la siguiente.
- Replanificación acotada: ante el fallo de una subtarea, replanifica solo esa subtarea y escala a un humano si agota su presupuesto de replanificación.
- Consulta de estado: usa `query_scene` y `query_task_progress` para fundamentar decisiones y comprobar progreso.
- Interacción con el operador: puede emitir prompts mediante `emit_prompt`.
- Agnóstico al embodiment: funciona con cualquier robot, ya que `capabilities_required` está vacío y el embodiment es el comodín `any`.
- No soporta tool calling genérico, agentes autónomos fuera del runtime OpenRAL, visión, audio, matemáticas ni generación de texto libre: su ámbito es la orquestación simbólica dentro del Reasoner.

## Casos de uso

- Manipulación multi-paso en almacén: ante una instrucción como "recoge el paquete, colócalo en la cinta y sella la caja", el playbook la divide en subtareas con condiciones verificables (paquete agarrado, paquete sobre cinta, caja sellada) y verifica cada una antes de continuar.
- Tareas de recogida y colocación compuestas: el ejemplo citado en `PLAYBOOK.md` (apilar cuencos, abrir un cajón, caja de galletas) muestra cómo encadena subtareas heterogéneas despachando la skill adecuada a cada una.
- Recuperación ante fallos parciales: si falla una subtarea de agarre, replanifica solo ese paso sin reiniciar la misión completa, lo que reduce el coste de recuperación en entornos reales.
- Supervisión humana con escalado: cuando una subtarea agota su presupuesto de replanificación, transfiere la misión a un operador humano, lo que encaja en flujos con intervención humana obligatoria.
- Orquestación agnóstica de flota: al declarar `embodiment:any`, el mismo playbook puede desplegarse en brazos manipuladores, robots móviles o plataformas distintas siempre que el runtime exponga las herramientas compuestas.
- Trazabilidad de planes: al escribir subtareas y progreso en memoria, permite auditar qué pasos se completaron, cuáles se verificaron y cuándo se replanificó, útil en entornos regulados.
- Prototipado rápido de SOP: al ser contenido editable y no un modelo entrenado, permite iterar sobre la lógica de descomposición (editar `PLAYBOOK.md`, subir `version`) sin reentrenar nada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente `Evaluation: N/A` — no hay `eval/*.json` y un playbook no produce salida de política evaluable con benchmarks. La validación existente es de empaquetado: `tests/unit/test_playbook_rskill_manifest.py` valida el manifiesto y el SOP, y `tests/unit/test_reasoner_playbooks.py` cubre la inyección del bloque `## PLAYBOOKS` en el system prompt del Reasoner.

## Requisitos de hardware

- VRAM estimada: no disponible (`min_vram_gb: null`); el playbook no consume VRAM por sí mismo, ya que no tiene pesos.
- GPU recomendadas: no aplica al playbook; los requisitos vienen del modelo del Reasoner que lo ejecuta, no especificado en la información disponible.
- GPU de consumo: no aplica directamente al artefacto; depende del Reasoner anfitrión.
- Opciones de despliegue: instalación como rSkill en el runtime OpenRAL, con carga del manifiesto mediante `RSkillManifest.from_yaml("rskills/decompose-mission/rskill.yaml")`; el runtime declarado es `pytorch` con `dtype: fp32`.
- Latencia: `latency_ms: 5000.0` declarada en el manifiesto; no se publican datos de throughput.
- Límite operativo: `playbook.max_steps: 24` acota la secuencia de llamadas a herramientas por ejecución.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada playbooks simbólicos comparables de otros autores ni alternativas neuronales equivalentes en la misma categoría (orquestación de misiones para robótica dentro de OpenRAL). Los elementos comparables más cercanos serían otros rSkills del mismo ecosistema OpenRAL, pero no se dispone de sus especificaciones.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni una política neuronal: no genera texto libre, no razona por sí mismo fuera del Reasoner anfitrión y no produce salida evaluable con benchmarks.
- Dependencia total del runtime OpenRAL: requiere que el Reasoner inyecte `PLAYBOOK.md` y que existan las herramientas `execute_rskill`, `query_scene`, `query_task_progress`, `memory_write`, `memory_search` y `emit_prompt`; fuera de ese entorno no es funcional.
- Solo en inglés: el SOP y el manifiesto están redactados en `en`; no se declara soporte multilingüe.
- Acotado por pasos: `max_steps: 24` limita la profundidad de descomposición y el número de llamadas a herramientas por ejecución; misiones muy largas pueden requerir escalado o subdivisión.
- Sin autoridad de actuación: toda moción depende de `execute_rskill` y del kernel de seguridad en C++; el playbook no puede ejecutar movimientos por sí mismo.
- Riesgo de alucinación: no aplica en el sentido habitual (no genera texto probabilístico), pero la calidad del plan depende del Reasoner que interpreta el SOP y de las condiciones de finalización definidas; condiciones mal especificadas pueden producir verificaciones incorrectas.
- Sin datos de sesgo, robustez o rendimiento en producción: la model card no reporta evaluación empírica ni resultados en robots reales.
- Licencia: Apache-2.0 para contenido y código, sin pesos; permite uso comercial con las obligaciones habituales de la licencia (atribución y aviso), pero conviene revisar los términos del runtime OpenRAL subyacente, no cubiertos en la información disponible.
- Fecha de creación y actualización del repositorio (2026) y cero descargas/likes: no hay evidencia de adopción ni de validación por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/OpenRAL/rskill-playbook-decompose_mission
- Repositorio GitHub del rSkill: https://github.com/OpenRAL/openral/tree/master/rskills/decompose-mission/
- `PLAYBOOK.md` (procedimiento de decisión): https://huggingface.co/OpenRAL/rskill-playbook-decompose_mission/blob/main/PLAYBOOK.md
- `rskill.yaml` (manifiesto): https://huggingface.co/OpenRAL/rskill-playbook-decompose_mission/blob/main/rskill.yaml

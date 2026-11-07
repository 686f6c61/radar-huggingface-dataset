# OpenRAL/rskill-playbook-clarify_ambiguity

## Resumen

`rskill-playbook-clarify_ambiguity` es un artefacto publicado en Hugging Face por OpenRAL dentro de su catálogo de rSkills para robótica. No es un modelo neuronal ni contiene pesos: es un *playbook* simbólico, es decir, un procedimiento de decisión escrito en Markdown (`PLAYBOOK.md`) que el razonador del sistema OpenRAL inyecta en su system prompt y ejecuta como SOP (standard operating procedure). Su función es resolver, antes de actuar, metas ambiguas o infraespecificadas en entornos robóticos, desambiguando primero desde memoria espacial, después desde la escena y, solo como último recurso, preguntando al operador.

El problema que aborda es concreto: en robótica de manipulación, una orden como «coge el cuenco» resulta ambigua si hay dos cuencos candidatos, y adivinar en una acción irreversible (colocar, verter, abrir) puede provocar fallos físicos. El playbook impone una secuencia de comprobaciones acotada a un máximo de 5 pasos y compone herramientas que el razonador ya posee (`query_scene`, `memory_search`, `recall_object`, `emit_prompt`), sin autoridad de actuación propia.

Es relevante ahora porque ejemplifica un patrón creciente en robótica open source: separar la política neuronal de los procedimientos de decisión simbólicos y versionables, de modo que el comportamiento se modifique editando contenido y subiendo la versión, sin reentrenar. Es agnóstico al embodiment (declara el comodín `embodiment_tags: ["any"]`) y se distribuye con licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Playbook simbólico (procedimiento de decisión en Markdown); no es una red neuronal |
| Parametros totales | Ninguno; no tiene pesos |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (lo determina el razonador que inyecta el playbook en su system prompt) |
| Tipos de cuantizacion | No aplica; `dtype: fp32` declarado en metadatos, sin tensores que cuantizar |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 (contenido y código); sin pesos |
| Formato de pesos | No aplica; el runtime es `PLAYBOOK.md` y el manifiesto `rskill.yaml` |
| Pipeline | `robotics` |
| Tipo y rol | `kind: playbook`, `role: s2`, `actions: [plan]`, `chunk_size: 1` |
| Trigger | La meta está infraespecificada o es ambigua |
| Done predicate | La meta tiene una única interpretación inequívoca, confirmada por memoria/escena o por el operador |
| Max steps | 5 |
| Runtime declarado | `pytorch` (heredado del ecosistema; el playbook no ejecuta cómputo propio) |
| Latencia declarada | 5000 ms |
| VRAM mínima | No disponible (`min_vram_gb: null`) |
| Actuadores requeridos | Ninguno (`actuators_required: []`) |
| Capacidades requeridas | Ninguna (`capabilities_required: {}`) |
| Embodiment | Agnóstico (`embodiment_tags: ["any"]`) |
| Inferencia | `inference: false` |

## Arquitectura y entrenamiento

La arquitectura no es un transformer ni un modelo híbrido: es un documento de procedimiento. Cuando se instala, el razonador de OpenRAL inyecta `PLAYBOOK.md` en su system prompt y sigue el SOP componiendo herramientas ya presentes en el sistema (`query_scene`, `memory_search`, `recall_object`, `emit_prompt`). La salida del playbook no es una distribución de tokens ni un chunk de acciones, sino la secuencia de llamadas a herramientas que el razonador realiza mientras lo sigue, acotada por `playbook.max_steps = 5`.

No hubo entrenamiento: el artefacto está escrito a mano, sin modelo upstream ni pesos. Su procedencia es el registro de decisión de autoría enlazado mediante `paper_url`. Para cambiar el comportamiento se edita `PLAYBOOK.md` y se incrementa `version`. El playbook es `role: s2` y nunca se despacha mediante `ExecuteRskill`; su cometido es filtrar la cadena downstream `execute_rskill` → Action chunk → kernel de seguridad en C++ con una única meta inequívoca, sin retener autoridad de actuación (según la sección §1.1 de `CLAUDE.md` del proyecto).

## Capacidades

- Desambiguación de metas: detecta peticiones con más de una interpretación (dos cuencos candidatos, destino ausente, elección insegura de adivinar) y las resuelve antes de actuar.
- Resolución en cascada: primero consulta memoria espacial (`memory_search`, `recall_object`), después la escena (`query_scene`) y solo entonces pregunta al operador (`emit_prompt`).
- Salvaguarda ante acciones irreversibles: nunca adivina en operaciones de colocar, verter o abrir.
- Formulación de preguntas concisas al operador cuando la desambiguación automática no basta.
- Composición de herramientas existentes del razonador, sin requerir capacidades ni sensores propios.
- Agnóstico al robot: funciona sobre cualquier embodiment declarado como `any`.
- Procedimiento versionable y auditable como contenido, no como código.
- No produce chunks de acción ni requiere actuadores; no tiene autoridad de actuación.

## Casos de uso

- Manipulación con referencias ambiguas en escenarios domésticos: ante «coge el cuenco» con dos cuencos sobre la mesa, el playbook fuerza consultar memoria y escena para identificar el referente antes de que el razonador emita la orden de agarre.
- Verter o servir alimentos: al ser una acción irreversible, el playbook impide adivinar el recipiente destino y pregunta al operador si la memoria y la escena no resuelven la ambigüedad.
- Recogida y colocación en almacén: cuando la orden indica «déjalo en la estantería» sin especificar nivel ni posición, se consulta el mapa espacial memorizado antes de planificar el movimiento.
- Operación asistida en entornos compartidos con humanos: si la instrucción puede referirse a objetos de distintas personas, el playbook prioriza la confirmación explícita del operador frente a una suposición.
- Integración en pipelines de automatización con kernel de seguridad: el playbook actúa como puerta de calidad de la meta antes de despachar `execute_rskill`, reduciendo ejecuciones fallidas por interpretación errónea.
- Robots de servicio en entornos cambiantes: cuando la escena difiere de la memoria (objetos movidos), la cascada memoria → escena → operador permite reajustar la interpretación sin reentrenar nada.
- Desarrollo y depuración de habilidades: al ser contenido editable, un equipo puede adaptar el SOP de desambiguación a su dominio (logística, laboratorio, cocina) modificando `PLAYBOOK.md` y subiendo la versión.
- Despliegue multirobot: gracias a `embodiment_tags: ["any"]` y `capabilities_required: {}`, el mismo playbook se instala en flotas heterogéneas sin cambios por plataforma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que un playbook no produce salida de política evaluable (`N/A — no eval/*.json`) y que no hay cifras de benchmark que reproducir. La validación existente es de empaquetado y de inyección en el system prompt del razonador, cubierta por `tests/unit/test_playbook_rskill_manifest.py` y `tests/unit/test_reasoner_playbooks.py`.

## Requisitos de hardware

- VRAM: no aplica al playbook en sí; no contiene pesos ni tensores. El consumo depende del razonador que lo aloja, cuyo tamaño no se especifica en la información disponible.
- GPU recomendadas: no disponibles para este artefacto; vendrán determinadas por el modelo del razonador.
- GPU de consumo: el playbook cabe en cualquier entorno capaz de ejecutar el razonador de OpenRAL, ya que solo añade texto al system prompt; el límite real es la ventana de contexto de dicho razonador.
- Despliegue: instalación como rSkill en el ecosistema OpenRAL (`openral_core.schemas.RSkillManifest`); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que corresponden a modelos neuronales y no a este tipo de artefacto.
- Latencia: `latency_ms: 5000.0` declarada en los metadatos del manifiesto, correspondiente al ciclo de decisión del playbook, no a inferencia de red.
- Throughput: no disponible.

## Comparativa con modelos similares

| Artefacto | Tipo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rskill-playbook-clarify_ambiguity (OpenRAL) | Playbook simbólico, rol s2 | Ninguno | No disponible | Sin benchmarks (N/A por diseño) | Apache-2.0 | Hugging Face y GitHub de OpenRAL |
| Políticas neuronales de manipulación (p. ej. modelos tipo VLA) | Red neuronal | Del orden de millones a miles de millones | Depende del modelo | Benchmarks de éxito de tarea | Variable | Repositorios públicos |
| Planificadores LLM genéricos usados como razonador | Transformer | Miles de millones | Depende del modelo | Benchmarks de razonamiento | Variable | Hugging Face |

La comparación directa no es homogénea: este artefacto no compite en la categoría de modelos neuronales, sino que se acopla a un razonador y a un kernel de seguridad dentro de OpenRAL. Para alternativas estrictamente equivalentes (otros playbooks del mismo catálogo), la información disponible no permite establecer una comparativa de rendimiento.

## Limitaciones y advertencias

- No es un modelo: no genera texto, no razona por sí mismo ni produce acciones; su comportamiento depende por completo del razonador que lo inyecta.
- Solo en inglés: el SOP y las preguntas al operador están redactados en `en`, lo que limita su uso en despliegues hispanohablantes sin traducción del contenido.
- Sin evaluación empírica: no hay métricas de tasa de desambiguación correcta ni de reducción de fallos en producción; la validación es únicamente de manifiesto y de inyección en prompt.
- Dependencia de herramientas externas: `query_scene`, `memory_search`, `recall_object` y `emit_prompt` deben existir y funcionar en el razonador; el playbook no declara requisitos de sensores, pero las herramientas que compone sí tienen sus propias dependencias.
- Cota de 5 pasos: `max_steps: 5` puede resultar insuficiente en escenas muy pobladas o con memorias incompletas, forzando la consulta al operador más de lo deseable.
- Riesgo de fricción operativa: la política de no adivinar en acciones irreversibles incrementa las interrupciones al operador en entornos con alta ambigüedad.
- Sin autoridad de actuación: no sustituye al kernel de seguridad en C++; un fallo del razonador o del kernel no queda cubierto por este playbook.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución y conservación del aviso; al no haber pesos, no existen restricciones adicionales de modelo.
- Mantenimiento manual: cualquier cambio de comportamiento exige editar `PLAYBOOK.md` y subir `version`, sin aprendizaje automático que corrija errores de forma autónoma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OpenRAL/rskill-playbook-clarify_ambiguity
- Repositorio GitHub del rSkill: https://github.com/OpenRAL/openral/tree/master/rskills/clarify-ambiguity/
- Playbook (`PLAYBOOK.md`): https://huggingface.co/OpenRAL/rskill-playbook-clarify_ambiguity/blob/main/PLAYBOOK.md
- Repositorio principal de OpenRAL: https://github.com/OpenRAL/openral
- Registro de decisión de autoría: enlazado como `paper_url` en el manifiesto (no disponible la URL directa en la información proporcionada)

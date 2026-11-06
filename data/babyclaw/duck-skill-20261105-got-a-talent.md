# BabyClaw/duck-skill-20261105-got-a-talent

## Resumen

Duck Skill Little Victory es una política de control robótico para el robot MicroDuck de Pollen Robotics, publicada por el usuario BabyClaw en Hugging Face. No es un modelo de lenguaje: es una política de reinforcement learning exportada a ONNX que mapea 61 observaciones de sensores a 14 acciones de actuadores, diseñada específicamente para ejecutar una rutina musical de 20 segundos en la categoría "got-a-talent" de la MicroDuck Arena. El modelo deriva de los pesos de referencia publicados por Pollen Robotics y ha sido refinado mediante un pipeline de búsqueda de políticas (policy search) y entrenamiento compartido.

La relevancia de esta ficha es acotada: se trata de un artefacto de competición con descargas cero y sin model card técnica convencional. Su interés radica en ser un ejemplo concreto del ecosistema de políticas robóticas ligeras que se ejecutan en CPU vía ONNX, con un manifiesto de procedencia reproducible (hashes SHA-256 de política, timeline y selección) que permite auditar el proceso de selección. El repositorio ocupa 0,0 GB, lo que confirma que el artefacto es de tamaño mínimo.

No se dispone de información sobre arquitectura de red, número de parámetros, datos de entrenamiento ni licencia. La model card únicamente describe el proceso de selección (45 arranques de desarrollo, validación en arranques finales separados) y el resultado: una puntuación local de 20,0 con 45/45 éxitos en la fase de desarrollo, pendiente de evaluación oficial en la Arena.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (política de reinforcement learning exportada a ONNX) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible (inferencia ONNX en CPU, sin cuantización declarada) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (política `d35823fd...onnx`) |
| Observaciones de entrada | 61 |
| Acciones de salida | 14 |
| Hardware de inferencia | CPU (ONNX Runtime) |
| Tamaño del repositorio | 0,0 GB |
| SHA-256 de la política | `d35823fd1e364dc2075cceeadc849b7317b8bbf7d91b695c5a509b3c3660d3e6` |
| SHA-256 del timeline | `37905f9f829b2af22045c1b4b1da5567a3b59a312614102bd3818269fab9d2e3` |
| Modelo base | `pollen-robotics/microduck-got-a-talent-reference` (revisión `0454fe8a848526338ba6edf72b8358fbf51d6b21`) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red neuronal (capas, activaciones, tamaño de las capas ocultas). Lo que sí se documenta es el proceso de obtención de la política: parte de los pesos de referencia de Pollen Robotics (`microduck-got-a-talent-reference`, SHA-256 `332aeacc...`) y aplica un pipeline de entrenamiento y búsqueda de políticas denominado "Duck Skill". La selección final proviene de una búsqueda afín (`affine_search`) en la generación 30, con un vector de 15 parámetros de ajuste registrado en el manifiesto de procedencia y una marca `feedback_compensated: true`.

La validación se realizó con 45 arranques de desarrollo, obteniendo 45/45 éxitos y una puntuación local de 20,0. La clave de calificación registrada es `[1, 45, -0.059351553299101634]`. El autor advierte explícitamente que las puntuaciones locales son indicativas y que la Arena mide el resultado oficial, por lo que la evaluación final queda pendiente (`requires_final_official_evaluation: true`). No se especifican número de tokens, composición del dataset, ni si hubo RLHF/DPO, ya que no aplica al dominio.

## Capacidades

- Control robótico de 14 actuadores a partir de 61 observaciones, en el slot `sitstand` del robot MicroDuck.
- Ejecución de una rutina musical original de 20 segundos ("got-a-talent").
- Inferencia en CPU mediante ONNX Runtime, sin requisito de GPU.
- Reproducibilidad verificable: hashes SHA-256 de política, timeline y selección incluidos en el manifiesto.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni capacidades multilingües (no es un modelo de lenguaje).
- No dispone de modo thinking, visión, audio ni generación de texto.

## Casos de uso

- Competición en la MicroDuck Arena: la política está diseñada para participar en la categoría "got-a-talent" y su puntuación oficial se determina por votos de audiencia; se usaría cargando el ONNX en el entorno de la Arena.
- Evaluación de pipelines de policy search: sirve como caso de estudio reproducible de búsqueda afín con 15 parámetros y selección sobre 45 arranques de desarrollo, útil para investigar métodos de selección de políticas.
- Benchmark de control en robótica de bajo coste: al ejecutarse en CPU con un artefacto de 0,0 GB, permite probar lazos de control en hardware modesto sin GPU.
- Docencia en reinforcement learning aplicado: el manifiesto de procedencia con hashes encadenados (política base, selección, timeline) es un ejemplo didáctico de trazabilidad de experimentos.
- Auditoría de reproducibilidad: los SHA-256 permiten verificar que la política evaluada coincide con la publicada y con la referencia de Pollen Robotics.
- Pruebas de integración de ONNX Runtime en robótica: validación de latencia y estabilidad de inferencia en CPU para un modelo de 61 entradas y 14 salidas.
- No es adecuado para generación de texto, código, visión, atención al cliente ni ninguna tarea de NLP.

## Benchmarks y rendimiento

| Métrica | Valor | Contexto |
|---|---|---|
| Éxitos en desarrollo | 45/45 | Arranques de desarrollo |
| Puntuación local | 20,0 | Indicativa, no oficial |
| Clave de calificación | `[1, 45, -0.059351553299101634]` | Registrada en el manifiesto |
| Puntuación oficial | pendiente | `requires_final_official_evaluation: true` |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ni son aplicables a este tipo de artefacto.

## Requisitos de hardware

- Inferencia en CPU vía ONNX Runtime; no requiere GPU.
- VRAM estimada: 0 GB (ejecución en CPU).
- GPU recomendadas: no aplica; cualquier CPU compatible con ONNX Runtime es suficiente.
- Cabe en cualquier equipo consumer, incluidos sistemas sin GPU dedicada.
- Opciones de despliegue: ONNX Runtime (CPU), integración en el entorno MicroDuck de Pollen Robotics.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Entradas/Salidas | Hardware | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Duck Skill Little Victory (este) | Política RL en ONNX | 61 / 14 | CPU | no disponible | Hugging Face, 0 descargas |
| `pollen-robotics/microduck-got-a-talent-reference` | Política de referencia | no disponible | no disponible | no disponible | Hugging Face (referencia base) |
| Otras políticas del ecosistema MicroDuck | Políticas RL | no disponible | CPU (ONNX) | no disponible | Hugging Face Spaces de la Arena |

No se dispone de datos de rendimiento comparables entre estas políticas más allá de la puntuación local de este artefacto.

## Limitaciones y advertencias

- La puntuación de 20,0 es local e indicativa; el resultado oficial depende de la evaluación en la Arena y de los votos de audiencia.
- No hay licencia declarada, lo que impide determinar si el uso comercial está permitido; debe contactarse con el autor antes de cualquier uso productivo.
- El modelo está especializado en una única tarea (rutina musical de 20 segundos en el slot `sitstand`); no generaliza a otras tareas robóticas.
- No es un modelo de lenguaje: no genera texto, no razona y no soporta instrucciones en lenguaje natural.
- La arquitectura de red y el número de parámetros no están documentados, lo que dificulta evaluar su robustez o generalización.
- El repositorio tiene 0 descargas y 0 likes, sin validación externa de la comunidad.
- Riesgo de sobreajuste a los 45 arranques de desarrollo: la validación en arranques finales separados se menciona, pero no se publican métricas de esa fase.
- No se documentan sesgos, pero al ser una política de control, su comportamiento fuera de las condiciones de simulación previstas es incierto.

## Enlaces

- Hugging Face: https://huggingface.co/BabyClaw/duck-skill-20261105-got-a-talent
- Arena (evento): https://huggingface.co/spaces/pollen-robotics/microduck-arena#/e/got-a-talent
- Modelo base de referencia: https://huggingface.co/pollen-robotics/microduck-got-a-talent-reference
- No se han encontrado papers, blogs ni repositorios adicionales en la información proporcionada.

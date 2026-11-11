# atomicvox/microduck-roller-sprint-2m-run-1110-1716

## Resumen

`atomicvox/microduck-roller-sprint-2m-run-1110-1716` es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje ni un modelo fundacional generativo: se trata de un artefacto de robótica que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz, empaquetado como un grafo ONNX listo para cargarse en el daemon del robot. La tarea concreta es una marcha perpetua sobre ruedas (rollers), de ahí el nombre "roller-sprint".

El modelo se distribuye como un único fichero `policy.onnx` con el normalizador de observaciones ya integrado, más un `manifest.json` que sigue el esquema 2 del manifiesto de políticas de microduck. El repositorio ocupa 0.0 GB según Hugging Face, lo que confirma que el peso del artefacto es mínimo, coherente con una red de política de pequeña escala para control motor en tiempo real.

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de un pipeline completo de RL para robótica (entorno mjlab, entrenamiento con 4096 entornos paralelos, 2000 iteraciones, TensorBoard) y como política intercambiable en un robot real mediante el comando `robotctl policy load`. No hay información pública sobre benchmarks, licencia ni idiomas, y las descargas y likes son cero en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de política para RL (arquitectura interna no especificada en la model card); exportada como grafo ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; opera sobre observaciones de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (el artefacto se distribuye como ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |

## Arquitectura y entrenamiento

La model card no detalla la topología interna de la red de política; solo indica que se exporta como un grafo ONNX con el normalizador de observaciones incorporado, de modo que el consumidor alimenta observaciones en bruto. La interfaz es explícita: 61 dimensiones de observación, 14 acciones, frecuencia de control de 50 Hz, sobre el robot microduck equipado con rollers. El pipeline declarado es `robotics` y la librería asociada es `microduck`.

El entrenamiento se realizó con el framework mjlab (base `mjlab-microduck 0.1.0 @ 1efd853be`), tarea `Mjlab-RollerSprint2m-MicroDuck`, con 4096 entornos paralelos, 2000 iteraciones máximas, semilla 1 y registro en TensorBoard. El checkpoint publicado corresponde al paso 250 y la ejecución se nombró `run-1110-1716`. El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con el mismo código, `uv.lock` y semilla produce una política comparable, no idéntica. No se documentan datos de entrenamiento en el sentido de corpus, ni RLHF/DPO, ni innovaciones como decodificación especulativa o atención lineal, porque no aplican a este tipo de artefacto.

## Capacidades

- Control motor reactivo: genera 14 acciones de control a 50 Hz a partir de 61 observaciones, suficiente para una marcha perpetua sobre rollers.
- Política perpetua: según la model card, la política se ejecuta de forma continua hasta que se le indique lo contrario, sin condición de terminación propia.
- Normalización integrada: el normalizador de observaciones está embebido en `policy.onnx`, por lo que se alimentan observaciones en bruto sin preprocesado externo.
- Despliegue en robot real: se carga en una ranura de política mediante `robotctl policy load <slot> <repo>`.
- Reproducibilidad documentada: se especifican task_id, repo, branch, commit, checkpoint, semilla y comando exacto de entrenamiento.
- No soporta tool calling, function calling, agentes multi-paso, razonamiento simbólico, visión, audio ni capacidades multilingües; no es un modelo de lenguaje.

## Casos de uso

- Investigación en RL para robótica: sirve como referencia reproducible de un entrenamiento con mjlab, 4096 entornos y semilla fija, útil para comparar curvas de aprendizaje o validar cambios en el entorno sin partir de cero.
- Prueba de marcha sobre rollers en microduck: cargar la política en una ranura y ejecutar la marcha perpetua para validar el hardware, la calibración de sensores y la latencia del daemon a 50 Hz.
- Baseline para comparación de políticas: al ser un artefacto pequeño y con comando de reproducción documentado, sirve como punto de partida frente a políticas propias en la misma tarea `Mjlab-RollerSprint2m-MicroDuck`.
- Docencia y demostraciones de RL aplicado: el flujo completo (clonar repo, `uv sync`, `uv run train`) es un ejemplo compacto de pipeline de entrenamiento con entornos paralelos y registro en TensorBoard.
- Integración en pipelines de despliegue de políticas: el formato ONNX con normalizador embebido y el manifiesto de esquema 2 facilitan probar el ciclo carga-ejecución-descarga en el daemon del robot.
- Validación de infraestructura `robotctl`: usar la política como carga de prueba para verificar el manejo de ranuras, la lectura del manifiesto y la sustitución de políticas en caliente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, tasas de éxito, velocidad de marcha ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB, lo que sugiere un grafo ONNX muy pequeño, pero no se publican cifras de parámetros ni de memoria.
- GPU recomendadas: no disponible para inferencia. Para reentrenamiento, la configuración documentada usa 4096 entornos paralelos, lo que en la práctica exige una GPU de datacenter (A100/H100 o similar); el autor no especifica el hardware empleado.
- Compatibilidad con GPU de consumo: no disponible; el tamaño reducido del artefacto sugiere que la inferencia podría ejecutarse en CPU o en GPU de gama baja, pero no hay confirmación en la información proporcionada.
- Opciones de despliegue: el consumidor previsto es el daemon de microduck mediante `robotctl policy load`; el artefacto es un `policy.onnx` ejecutable con cualquier runtime ONNX compatible.
- Latencia y throughput: no disponibles; la política opera a 50 Hz según la model card, pero no se publican medidas de latencia por inferencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / observaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| atomicvox/microduck-roller-sprint-2m-run-1110-1716 | Política RL para microduck (ONNX) | no disponible | 61 obs / 14 acciones a 50 Hz | no disponible | Hugging Face, 0 descargas |
| Otras políticas de microduck en Hugging Face | Políticas RL para el mismo robot | no disponible | no disponible | no disponible | no verificado en la información proporcionada |
| Políticas RL para cuadrúpedos comerciales (p. ej. Unitree) | Políticas RL / control | no disponible | no disponible | habitualmente no pública | no disponible |

No se dispone de datos verificados de modelos comparables en la información proporcionada; la comparativa cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Licencia no especificada: no se indica licencia en la model card ni en los metadatos, por lo que el uso comercial queda sin marco legal claro y requiere contactar con el autor.
- Especificidad de hardware: la política está entrenada para microduck sobre rollers; no es transferible a otros robots ni a microduck en otras configuraciones sin reentrenamiento.
- Ausencia de métricas: no hay benchmarks, curvas de recompensa ni tasas de éxito publicadas, lo que impide evaluar su calidad frente a alternativas.
- Reproducibilidad limitada: el propio autor advierte que el entrenamiento no es bit-reproducible entre máquinas; la misma semilla produce pesos distintos.
- Checkpoint intermedio: el artefacto corresponde al paso 250 de un máximo de 2000 iteraciones, por lo que puede no representar una política convergida.
- Sin información sobre sesgos, alucinación o idiomas: no aplica en el sentido habitual, pero tampoco se documentan comportamientos de fallo, condiciones de seguridad ni límites operativos del controlador.
- Madurez y adopción: cero descargas y cero likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- Dependencia del daemon: el uso previsto requiere `robotctl` y el esquema 2 del manifiesto de políticas de microduck, lo que limita su portabilidad fuera de ese ecosistema.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/atomicvox/microduck-roller-sprint-2m-run-1110-1716
- Repositorio de entrenamiento: `git@github.com:atomicvox/microduck-challenges.git` (commit `64ad94026`)
- Proyecto microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (ruta citada en la model card; URL no disponible)
- Framework mjlab: no disponible (base citada como `mjlab-microduck 0.1.0 @ 1efd853be`, sin URL)

# GinDuck/microduck-roller-sprint-2m-roller-2-w

## Resumen

`microduck-roller-sprint-2m-roller-2-w` es una política de control entrenada por refuerzo (reinforcement learning) para el robot cuadrúpedo de bajo coste **microduck** de Pollen Robotics. No es un modelo de lenguaje ni un modelo generativo: es un checkpoint de política que se carga en el daemon del robot para ejecutar una marcha concreta (gait) sobre ruedas. El autor, GinDuck, lo publica como parte de su segunda tanda de experimentos ("roller run"), en este caso una variante de sprint que abandona el patinaje y prioriza velocidad.

El modelo se distribuye como `policy.onnx` con el normalizador de observaciones embebido, de modo que la política consume observaciones crudas del robot (61 dimensiones) y emite 14 acciones a 50 Hz. Según la model card, completa el recorrido de prueba en aproximadamente 1,6 segundos. Es una política "perpetua": se ejecuta de forma continua hasta que se le indique lo contrario.

Su relevancia es acotada y muy específica: sirve a la comunidad de robótica de bajo coste que experimenta con microduck y con el entorno de simulación `mjlab`, y demuestra un flujo completo de entrenamiento reproducible (código, commit, semilla y comando documentados). No aporta capacidades de NLP, visión ni razonamiento simbólico.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de reinforcement learning exportada a ONNX (arquitectura de red no detallada en la información disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observación de 61 dimensiones por paso |
| Tipos de cuantización | no disponible (se distribuye en ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de control robótico) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |

Otros datos operativos: frecuencia de control de 50 Hz, 14 acciones de salida, observación de 61 dimensiones, normalizador de observaciones integrado en el ONNX. Tamaño del repositorio: 0,0 GB según Hugging Face.

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red (número de capas, anchura, tipo de actor-critic). Lo que sí se documenta es el pipeline de entrenamiento: se usó el entorno `Mjlab-RollerSprint2m-MicroDuck` del repositorio `pollen-robotics/microduck-challenges`, rama `race-2`, commit `b44f7ffc9`, sobre la base `mjlab-microduck 0.1.0 @ 1efd853be`. El entrenamiento se lanzó con 2048 entornos paralelos, un máximo de 6000 iteraciones y semilla 1, registrando en TensorBoard bajo el nombre de ejecución `roller-2`; el checkpoint publicado corresponde a la iteración 4000. La fecha de inicio registrada es 2026-11-02T16:41:43Z.

El autor advierte explícitamente que el entrenamiento no es reproducible bit a bit entre máquinas: repetir el mismo comando con el mismo `uv.lock` y la misma semilla produce una política comparable, no idéntica. La receta de entrenamiento es compartida por TheSauceman, según la model card. No se documentan detalles sobre composición del dataset (al tratarse de RL en simulación, serían rollouts generados por el propio entorno), funciones de recompensa, ni técnicas de regularización.

## Capacidades

- Control locomotor de un robot cuadrúpedo microduck equipado con ruedas ("on rollers").
- Marcha de sprint orientada a velocidad: el autor reporta ~1,6 s de tiempo de finalización en sus pruebas.
- Política perpetua: mantiene la marcha de forma continua hasta recibir una orden de parada o sustitución.
- Consumo de observaciones crudas de 61 dimensiones con normalización integrada en el grafo ONNX.
- Emisión de 14 acciones a 50 Hz, compatible con el daemon `robotctl` del robot.
- Carga en un slot de política mediante `robotctl policy load`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, multilingüismo, visión, audio ni modo "thinking": no es un modelo de lenguaje.

## Casos de uso

- **Carreras y competiciones de microduck**: la política está entrenada específicamente para el circuito de sprint de 2 m (`RollerSprint2m`), por lo que es adecuada para participar en las pruebas de la Arena que el autor menciona (QuackPack). Se cargaría en el slot correspondiente antes de la carrera.
- **Benchmark de referencia para nuevas políticas**: al estar documentados commit, semilla, iteraciones y comando de entrenamiento, sirve como línea base reproducible para comparar variantes de recompensa o de configuración del entorno `Mjlab-RollerSprint2m-MicroDuck`.
- **Validación del pipeline de despliegue ONNX en robot real**: útil para verificar que el normalizador embebido y el manifiesto schema 2 funcionan correctamente con el daemon `robotctl` antes de desplegar políticas propias.
- **Demostración educativa de RL aplicado a robótica de bajo coste**: el flujo completo (clonar repo, `uv sync`, `uv run train`, exportar a ONNX, cargar en robot) es un ejemplo didáctico cerrado para talleres y cursos.
- **Pruebas de robustez del hardware sobre ruedas**: ejecutar una marcha de alta velocidad de forma perpetua permite medir consumo, calentamiento de motores y desgaste en el microduck con configuración de rollers.
- **Investigación en transferencia sim-a-real**: comparar el rendimiento en simulación (entorno mjlab) con el tiempo real reportado (~1,6 s) para estudiar la brecha de realidad en un robot de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento aportado por el autor es cualitativo-cuantitativo: "en mis propias pruebas termina en aproximadamente 1,6 segundos" en el circuito de sprint de 2 m. No hay tablas comparativas, métricas de recompensa, tasas de éxito ni curvas de entrenamiento publicadas en la información proporcionada.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible. Al ser una política de control de 61 entradas y 14 salidas exportada a ONNX, la huella es mínima (del orden de kilobytes a pocos megabytes), pero no se documenta el tamaño exacto del archivo ni el número de parámetros.
- **GPU recomendadas**: no aplica para inferencia; la política está pensada para ejecutarse en la CPU del propio robot o en el host que controla el daemon. Para reentrenar, se usaron 2048 entornos paralelos, lo que requiere una GPU de datacenter (el autor no especifica modelo; típicamente A100/H100 o similar para RL masivo en paralelo).
- **¿Cabe en GPU consumer?**: la inferencia sí, en cualquier CPU o GPU modesta; el reentrenamiento con 2048 entornos es inviable en GPU consumer de gama baja.
- **Opciones de despliegue**: `robotctl policy load <slot> GinDuck/microduck-roller-sprint-2m-roller-2-w` sobre el daemon de microduck; runtime ONNX estándar (ONNX Runtime) para ejecución fuera del robot.
- **Latencia y throughput**: control a 50 Hz (periodo de 20 ms por paso). No se documentan latencias medidas del grafo ONNX ni throughput de entrenamiento.

## Comparativa con modelos similares

| Modelo | Tipo | Observación / acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GinDuck/microduck-roller-sprint-2m-roller-2-w | Política RL (ONNX) para microduck con rollers | 61 / 14 | 50 Hz | no disponible | Hugging Face |
| Otros checkpoints de la misma tanda "roller-2" de GinDuck | Políticas RL para microduck | no disponible | no disponible | no disponible | Hugging Face (mismo autor) |
| Políticas del repo `pollen-robotics/microduck-challenges` (rama `race-2`) | Políticas RL de referencia para microduck | no disponible | no disponible | según repo | GitHub |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- **Ámbito extremadamente estrecho**: es una política para una tarea concreta (sprint de 2 m sobre rollers) y un robot concreto (microduck). No generaliza a otras tareas, morfologías ni configuraciones de hardware.
- **Licencia no declarada**: la model card no especifica licencia, lo que impide determinar si el uso comercial está permitido. Tratar como no apto para producción comercial hasta que el autor lo aclare.
- **Sin datos de robustez**: no se documentan pruebas ante perturbaciones, cambios de terreno, variaciones de batería o desgaste de ruedas; el rendimiento de 1,6 s es una observación del autor, no un benchmark validado.
- **No reproducible bit a bit**: el propio autor advierte que reentrenar produce pesos distintos; la reproducibilidad es estadística, no exacta.
- **Riesgo de alucinación**: no aplica (no es un modelo generativo). El riesgo equivalente es fallo de la política ante condiciones fuera de distribución, con posible caída o comportamiento errático del robot.
- **Sesgos**: no aplica en el sentido de sesgos lingüísticos; el comportamiento está determinado por la función de recompensa del entorno de entrenamiento, que puede favorecer soluciones explotadoras no deseadas (p. ej., movimientos agresivos que estresan el hardware).
- **Dependencia de infraestructura**: requiere el daemon `robotctl`, el manifiesto schema 2 y el runtime ONNX; no es un artefacto autónomo fuera de ese ecosistema.
- **Metadatos incompletos**: sin idiomas, sin licencia, sin parámetros y sin benchmarks; la evaluación independiente es imposible con la información publicada.

## Enlaces

- Hugging Face: https://huggingface.co/GinDuck/microduck-roller-sprint-2m-roller-2-w
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges (rama `race-2`, commit `b44f7ffc9`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)
- QuackPack (seguimiento de carreras y copas): https://www.imundo.ch/quackpack/

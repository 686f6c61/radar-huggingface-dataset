# GinDuck/microduck-sprint-2m-sprint-2-l

## Resumen

`GinDuck/microduck-sprint-2m-sprint-2-l` es un checkpoint de política de control para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje ni de un modelo generativo multimodal, sino de una política de aprendizaje por refuerzo entrenada para producir una marcha (gait) que mantiene al robot erguido y le permite completar un circuito de sprint. El autor del checkpoint es el usuario GinDuck, que lo publica como parte de su segunda iteración de entrenamiento ("sprint-2").

El modelo se distribuye como un artefacto ONNX (`policy.onnx`) con un `manifest.json` que sigue el esquema 2 del manifiesto de políticas de microduck. La política es "perpetua": una vez cargada en una ranura de política del robot, ejecuta la marcha de forma continua hasta que se le indique lo contrario. Trabaja a 50 Hz, con observaciones de 61 dimensiones y 14 acciones de control.

Es relevante en el contexto de la robótica de bajo coste y el aprendizaje por refuerzo aplicado a robots cuadrúpedos pequeños: demuestra un flujo de entrenamiento reproducible con `mjlab` (entorno de RL basado en MuJoCo) y ofrece un artefacto desplegable directamente en hardware real mediante el daemon `robotctl`.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo (red neuronal) exportada a ONNX; arquitectura interna no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |
| Frecuencia de control | 50 Hz |
| Dimensión de observación | 61 |
| Dimensión de acción | 14 |
| Tarea de entrenamiento | `Mjlab-Sprint2m-MicroDuck` |
| Checkpoint | 250 |
| Semilla | 1 |
| Entornos de entrenamiento | 4096 |
| Iteraciones máximas | 3000 |

## Arquitectura y entrenamiento

La política se entrena con aprendizaje por refuerzo en el entorno `mjlab-microduck 0.1.0` (commit `1efd853be`), sobre la rama `race-2` del repositorio `microduck-challenges` (commit `b44f7ffc9`). El entrenamiento se lanzó el 2026-11-02 con 4096 entornos paralelos, un máximo de 3000 iteraciones y semilla 1, registrando métricas en TensorBoard. El checkpoint publicado corresponde a la iteración 250, es decir, una fase temprana del entrenamiento.

El autor indica que el entrenamiento no es bit-reproducible: repetir el mismo comando con el mismo `uv.lock` y la misma semilla produce una política comparable pero no idéntica, debido a la no determinación del RL sobre GPU. La normalización de observaciones está integrada dentro de `policy.onnx`, de modo que el robot debe alimentar observaciones en bruto. No se especifica la topología exacta de la red (capas, activaciones, número de parámetros) en la información disponible.

## Capacidades

- Control locomotor de un robot cuadrúpedo microduck: mantiene el robot erguido y ejecuta una marcha de sprint.
- Política perpetua: se ejecuta de forma continua hasta que se le indique lo contrario.
- Entrada de observaciones en bruto (61 dimensiones) con normalización integrada en el modelo ONNX.
- Salida de 14 acciones de control a 50 Hz.
- Despliegue directo en hardware mediante `robotctl policy load <slot> <repo>`.
- Reproducibilidad del pipeline de entrenamiento documentada (mismo código, `uv.lock`, comando y semilla).
- No dispone de capacidades de generación de texto, razonamiento, código, visión, tool calling ni multilingüismo.

## Casos de uso

- **Demostración de marcha en robot microduck**: cargar la política en una ranura con `robotctl policy load` y dejar que el robot ejecute la marcha de sprint de forma continua en una pista o circuito de pruebas.
- **Punto de partida para fine-tuning**: usar el checkpoint 250 como inicialización para entrenamientos posteriores en la rama `race-2`, aprovechando que ya mantiene el equilibrio y completa el circuito.
- **Evaluación comparativa de políticas**: comparar esta política con otros checkpoints del mismo sprint (por ejemplo, versiones más avanzadas del entrenamiento) para medir la evolución de la marcha a lo largo de las iteraciones.
- **Validación del pipeline de entrenamiento**: reproducir el comando documentado con `uv run train Mjlab-Sprint2m-MicroDuck` para verificar que el entorno `mjlab-microduck` y el `uv.lock` producen políticas comparables.
- **Investigación en RL para robótica de bajo coste**: estudiar cómo una política entrenada con 4096 entornos paralelos y 250 iteraciones se transfiere a hardware real en un robot de pequeñas dimensiones.
- **Pruebas de integración del daemon**: verificar el esquema 2 del manifiesto de políticas y el flujo de carga de políticas en el daemon de microduck usando este artefacto como caso de prueba.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta que la política "alcanzó la meta en las cinco pruebas de test" realizadas, sin métricas cuantitativas de velocidad, estabilidad ni consumo.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible; el repositorio ocupa 0.0 GB y el modelo se ejecuta como política ONNX en el propio robot o en un equipo de control, por lo que la huella es mínima.
- **GPU recomendadas**: no aplica para inferencia en el robot; para reentrenamiento se requiere una GPU compatible con el entrenamiento en `mjlab` (no se especifica modelo concreto).
- **Consumer GPU**: la inferencia de una política ONNX de este tipo es viable en CPU; el reentrenamiento con 4096 entornos paralelos requiere GPU de gama alta, aunque no se detalla cuál.
- **Opciones de despliegue**: `robotctl policy load <slot> GinDuck/microduck-sprint-2m-sprint-2-l` en el daemon de microduck; ejecución del ONNX con el runtime integrado en el robot.
- **Latencia y throughput**: control a 50 Hz (periodo de 20 ms por paso de política); no se publican cifras de latencia adicionales.

## Comparativa con modelos similares

| Modelo | Tipo | Observación / acción | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `GinDuck/microduck-sprint-2m-sprint-2-l` | Política RL (ONNX) | 61 / 14 | 50 Hz | no disponible | Hugging Face |
| Otros checkpoints del mismo sprint | Política RL (ONNX) | 61 / 14 | 50 Hz | no disponible | Hugging Face (mismo autor) |
| Políticas base de microduck (Pollen Robotics) | Política RL | no disponible | no disponible | no disponible | Repositorio `microduck-challenges` |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- **Licencia no especificada**: no se indica licencia, por lo que el uso comercial queda sin autorización explícita hasta que el autor la declare.
- **Checkpoint temprano**: corresponde a la iteración 250 de 3000, por lo que su robustez puede ser inferior a la de checkpoints posteriores del mismo entrenamiento.
- **Entrenamiento no reproducible bit a bit**: repetir el entrenamiento produce políticas comparables, no idénticas.
- **Alcance muy limitado**: solo ejecuta una marcha de sprint; no es un modelo de propósito general ni soporta otras tareas.
- **Sin datos de sesgos ni alucinación**: al no ser un modelo generativo, no aplican sesgos lingüísticos, pero tampoco hay evaluación de robustez ante perturbaciones del terreno o del hardware.
- **Validación limitada**: el autor solo reporta cinco pruebas de test exitosas, sin métricas cuantitativas ni condiciones detalladas.
- **Dependencia del hardware**: el rendimiento depende del robot microduck concreto y de la calibración de sus sensores.

## Enlaces

- Hugging Face: https://huggingface.co/GinDuck/microduck-sprint-2m-sprint-2-l
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon

# GinDuck/microduck-sock-heist-6m-continue-2-j

## Resumen

microduck-sock-heist-6m-continue-2-j es un checkpoint de política de aprendizaje por refuerzo entrenada para el robot cuadrúpedo microduck de Pollen Robotics. Se trata de un controlador de locomoción y manipulación que resuelve la tarea concreta de acercarse a un calcetín, esquivar a los guardias y agarrar el objeto sin ser detectado, completando la secuencia en aproximadamente 10 segundos. El modelo se publica como un artefacto ONNX autocontenido dentro del ecosistema de políticas del daemon `robotctl` del robot.

El modelo no es un modelo de lenguaje ni un transformer generativo: es una política de control continuo entrenada mediante RL en simulación (entorno mjlab sobre MuJoCo), con observaciones de 61 dimensiones y 14 acciones a 50 Hz. El checkpoint corresponde a la iteración 200 de un entrenamiento de continuación sobre la rama `sock-continue-2` del repositorio `microduck-challenges`, con semilla 1 y 4096 entornos paralelos.

Su relevancia es acotada: se trata de un artefacto de investigación y experimentación en robótica con RL, publicado por un autor individual (GinDuck) sin métricas de rendimiento publicadas, sin licencia declarada y con cero descargas. Es útil como ejemplo reproducible de pipeline de entrenamiento y despliegue de políticas en microduck, no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control para RL (red neuronal feed-forward, detalles no disponibles); formato de despliegue ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Entorno de entrenamiento | mjlab (MuJoCo), task_id `Mjlab-SockHeist6m-MicroDuck` |
| Checkpoint / semilla | iteracion 200, seed 1 |
| Base | mjlab-microduck 0.1.0 @ 1efd853be |
| Commit de entrenamiento | 10ba3a426 (rama `sock-continue-2`) |

## Arquitectura y entrenamiento

La política se entrena mediante aprendizaje por refuerzo en el entorno `Mjlab-SockHeist6m-MicroDuck`, construido sobre mjlab (wrapper de MuJoCo para RL) con la base `mjlab-microduck 0.1.0`. El entrenamiento se ejecuta con 4096 entornos paralelos, hasta 1000 iteraciones máximas del agente, semilla 1 y registro en TensorBoard. El checkpoint publicado corresponde a la iteración 200. La política es perpetua: se ejecuta de forma continua hasta que el daemon la detiene, comportándose como una marcha cargada en un slot de política.

El autor advierte explícitamente que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con el mismo código, `uv.lock`, comando y semilla produce una política comparable, no los mismos pesos. La normalización de observaciones está embebida en el propio `policy.onnx`, de modo que el robot debe alimentar observaciones en crudo. No se detalla en la información disponible la topología exacta de la red, el número de parámetros, la composición del dataset (al ser RL en simulación, no hay dataset supervisado) ni si se emplearon técnicas como domain randomization más allá de lo implícito en el pipeline mjlab.

## Capacidades

- Control de locomoción y navegación del microduck a 50 Hz (14 acciones de control).
- Ejecución de una tarea de manipulación concreta: aproximación, agarre de un calcetín y evasión de guardias en el escenario SockHeist.
- Política perpetua: mantiene el comportamiento de forma continua hasta que se le indica lo contrario.
- Integración con el daemon `robotctl` mediante carga en un slot de política (`robotctl policy load <slot> ...`).
- Normalización de observaciones integrada en el artefacto ONNX (entrada de observaciones en crudo).
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes, capacidades multilingües ni modo thinking.

## Casos de uso

- Despliegue de demostración en un microduck físico: cargar el checkpoint en un slot con `robotctl policy load` para reproducir la maniobra de robo del calcetín en el escenario de reto, útil para validar el pipeline de despliegue de políticas ONNX en el robot.
- Reproducción de experimentos de RL: servir como referencia de un checkpoint intermedio (iteración 200) de una ejecución de continuación, permitiendo comparar curvas de entrenamiento y comportamiento frente a otros checkpoints de la misma rama.
- Base para fine-tuning o continuación de entrenamiento: al ser un checkpoint de continuación, puede usarse como punto de partida para nuevas iteraciones sobre la tarea SockHeist con el mismo código y configuración.
- Validación de integración del daemon `robotctl`: probar el flujo completo de manifiesto (schema 2), carga de política y ejecución perpetua en un robot real o simulado.
- Docencia y divulgación en robótica con RL: ejemplo pequeño y autocontenido (repo de 0.0 GB, artefacto ONNX) para ilustrar el ciclo entrenamiento en mjlab, exportación y despliegue en un cuadrúpedo de bajo coste.
- Benchmark interno de políticas de evasión y agarre: comparar esta política con otras variantes del reto SockHeist en términos de tiempo de finalización (unos 10 segundos declarados) y tasa de éxito, siempre que se instrumente la evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo declara cualitativamente que la política "esquiva a los guardias y agarra el calcetín sin ser detectado" y que "termina en unos 10 segundos". No hay tasas de éxito, recompensas medias, curvas de aprendizaje ni comparaciones numéricas publicadas.

## Requisitos de hardware

- Inferencia en el propio robot microduck: el artefacto es un `policy.onnx` de tamaño reducido (repo de 0.0 GB), pensado para ejecutarse en el hardware del robot a 50 Hz.
- No se especifican requisitos de VRAM ni GPU para inferencia; al ser una política de control de baja dimensionalidad (61 observaciones, 14 acciones), es previsible que quepa en CPU, pero el dato no está confirmado en la información disponible.
- GPU para reentrenamiento: el comando de reproducción usa 4096 entornos paralelos y hasta 1000 iteraciones; el autor no indica el hardware empleado. Se requiere una GPU con capacidad para RL masivo en paralelo, aunque el modelo concreto no se especifica.
- Opciones de despliegue: daemon `robotctl` del ecosistema microduck (carga en slot de política); el formato ONNX permite, en principio, otros runtimes ONNX, aunque no se documenta compatibilidad fuera de `robotctl`.
- Latencia y throughput: frecuencia de control fijada a 50 Hz (periodo de 20 ms); no se publican métricas de latencia adicionales.

## Comparativa con modelos similares

| Modelo | Tipo | Observacion / accion | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| microduck-sock-heist-6m-continue-2-j | Política RL para microduck (ONNX) | 61 / 14 | 50 Hz | no disponible | Hugging Face, 0 descargas |
| Otros checkpoints de la rama `sock-continue-2` | Políticas RL para microduck | 61 / 14 (mismo entorno) | 50 Hz | no disponible | Repositorio `microduck-challenges` (no verificados) |
| Políticas de referencia de microduck (p. ej. marchas base del proyecto) | Políticas RL para microduck | no disponible | no disponible | según proyecto Pollen Robotics | Repositorios de Pollen Robotics |

No se dispone de datos de rendimiento de alternativas comparables en la información proporcionada, por lo que la comparación se limita a formato, dimensiones y disponibilidad.

## Limitaciones y advertencias

- Sin licencia declarada: no se especifican términos de uso, lo que impide asumir permiso para uso comercial o redistribución.
- Cero descargas y cero likes: sin validación externa de la comunidad; el comportamiento descrito no está verificado de forma independiente.
- Ausencia total de benchmarks: no hay tasas de éxito, robustez ni métricas de generalización publicadas.
- Política específica de una única tarea (SockHeist) y de un único robot (microduck); no es transferible a otras morfologías o escenarios sin reentrenamiento.
- Entrenamiento no bit-reproducible: los pesos no pueden regenerarse exactamente, solo obtenerse políticas comparables.
- Riesgo de fallo en el mundo real por la brecha sim-to-real inherente al entrenamiento en simulación; no se documentan técnicas de domain randomization ni resultados en hardware físico.
- Dependencia del ecosistema `robotctl` y del esquema de manifiesto 2; cambios en el daemon podrían romper la compatibilidad.
- Sin capacidades lingüísticas ni de razonamiento simbólico; no debe evaluarse con métricas de modelos de lenguaje.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-sock-heist-6m-continue-2-j
- Repositorio de retos de microduck: https://github.com/pollen-robotics/microduck-challenges
- Proyecto microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (referenciado en la model card; URL exacta no disponible)

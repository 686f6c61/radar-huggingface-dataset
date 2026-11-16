# GinDuck/microduck-sprint-2m-sprint-2-j

## Resumen

microduck-sprint-2m-sprint-2-j es un checkpoint de política de control para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje: es una política de aprendizaje por refuerzo entrenada para que el robot camine de forma erguida y autónoma, cargada en un slot de política del daemon `robotctl`. El autor del checkpoint es el usuario GinDuck, que publica una instantánea intermedia (checkpoint 750) de su segunda ejecución de entrenamiento (sprint-2).

El modelo resuelve un problema concreto de robótica: generar una marcha (gait) perpetua que mantenga al microduck en pie y en movimiento hasta que se le indique lo contrario. Según la model card, la política completó la prueba de sprint en las cinco ejecuciones de test del autor, usando una receta de entrenamiento compartida por TheSauceman.

Técnicamente se distribuye como un archivo ONNX (`policy.onnx`) con el normalizador de observaciones integrado, más un `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck. La observación es de 61 dimensiones, la acción de 14 dimensiones y la frecuencia de control de 50 Hz. El repositorio ocupa 0.0 GB y no incluye pesos en safetensors ni información sobre licencia o idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de aprendizaje por refuerzo exportada a ONNX; la model card no detalla la topología de la red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye ONNX; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna de la red neuronal. Lo que sí documenta es el pipeline de entrenamiento: la política se entrenó con `mjlab-microduck 0.1.0` (commit `1efd853be`), sobre la tarea `Mjlab-Sprint2m-MicroDuck` del repositorio `pollen-robotics/microduck-challenges`, rama `race-2`, commit `b44f7ffc9`. El entrenamiento usó 4096 entornos en paralelo, un máximo de 3000 iteraciones, semilla 1, logger de TensorBoard y nombre de ejecución `sprint-2`. El checkpoint publicado corresponde a la iteración 750.

La interfaz de control está bien definida: observación de 61 dimensiones, 14 acciones y frecuencia de 50 Hz. El normalizador de observaciones está embebido en el propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo. La política es de tipo "perpetuo": no tiene condición de terminación propia y se ejecuta hasta que el daemon la descarga o la sustituye. El autor advierte que el entrenamiento no es bit-reproducible entre máquinas: repetir el comando con la misma semilla produce una política comparable, no idéntica.

## Capacidades

- Locomoción bípeda/cuadrúpeda del microduck: mantiene una marcha erguida de forma continua (política perpetua).
- Control en tiempo real a 50 Hz con 14 acciones y 61 observaciones.
- Ejecución autónoma en el robot sin supervisión externa una vez cargada en un slot de política.
- Integración con el daemon `robotctl` mediante `sudo robotctl policy load <slot> GinDuck/microduck-sprint-2m-sprint-2-j`.
- Normalización de observaciones integrada en el grafo ONNX, lo que simplifica el despliegue.
- No soporta tool calling, agentes, razonamiento multi-step, visión, audio ni capacidades multilingües: es exclusivamente una política motora.

## Casos de uso

- Demostración de locomoción en el microduck: cargar la política en un slot y dejar que el robot camine de forma continua para validar el hardware y el firmware del daemon.
- Pruebas de sprint y competición: la política completó el recorrido de sprint en las cinco ejecuciones de test del autor, por lo que sirve como referencia de rendimiento en la tarea `Mjlab-Sprint2m-MicroDuck`.
- Reproducción de experimentos de RL: el comando de entrenamiento y el commit exacto permiten regenerar una política comparable para comparar configuraciones (número de entornos, iteraciones, semilla).
- Base para fine-tuning o destilación: al ser un checkpoint intermedio (750 de hasta 3000 iteraciones), es útil como punto de partida para estudiar la evolución de la marcha durante el entrenamiento.
- Integración en pipelines de CI de robótica: el formato ONNX con normalizador embebido facilita tests automáticos de carga y ejecución en el daemon sin dependencias de Python pesadas.
- Investigación en simulación a realidad: sirve como política de referencia para evaluar la transferencia sim-to-real del stack mjlab-microduck en el robot físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica cualitativamente que la política "completó la meta en las cinco ejecuciones de test" del autor, sin métricas numéricas de velocidad, estabilidad o coste de transporte.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 0.0 GB y el modelo se distribuye como ONNX para ejecución en el propio robot, no en GPU de servidor.
- GPU recomendadas: no aplica para inferencia; la política está pensada para ejecutarse en el hardware de control del microduck.
- Compatibilidad con GPU de consumo: no disponible; el despliegue documentado es en el robot vía `robotctl`, no en GPU.
- Opciones de despliegue: daemon `robotctl` de microduck (carga en slot de política); el artefacto ONNX puede ejecutarse con cualquier runtime compatible con ONNX (ONNX Runtime, etc.), aunque la model card solo documenta la vía `robotctl`.
- Latencia y throughput: no disponibles; la frecuencia de control es de 50 Hz (periodo de 20 ms por ciclo), pero no se publican cifras de latencia de inferencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros checkpoints de microduck ni políticas comparables con datos de parámetros, contexto o rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Licencia no disponible: no se puede asumir uso comercial permitido; hay que contactar con el autor antes de cualquier despliegue en producción.
- Checkpoint intermedio: corresponde a la iteración 750 de un entrenamiento de hasta 3000, por lo que no representa la política final de la ejecución sprint-2.
- Entrenamiento no bit-reproducible: repetir el comando con la misma semilla produce pesos distintos, lo que complica la auditoría exacta del comportamiento.
- Sin métricas publicadas: no hay benchmarks numéricos de estabilidad, velocidad o robustez ante perturbaciones; la afirmación de "cinco de cinco ejecuciones" es cualitativa y del propio autor.
- Dependencia del stack: requiere el daemon `robotctl` y el esquema 2 del manifiesto de políticas; versiones distintas del daemon pueden no ser compatibles.
- Sin información sobre sesgos, alucinación o cobertura idiomática: no aplica al ser una política motora, pero tampoco se documentan limitaciones de dominio (terrenos, pendientes, cargas).
- Repositorio vacío en tamaño: 0.0 GB y cero descargas/likes en el momento de la consulta, lo que sugiere ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-sprint-2m-sprint-2-j
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (referenciado en la model card, sin URL directa)
- Base de entrenamiento: `mjlab-microduck 0.1.0` (commit `1efd853be`), sin URL directa en la model card

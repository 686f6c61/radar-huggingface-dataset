# rumezhak/microduck-sprint-daily-2026-11-25

## Resumen

microduck-sprint-daily-2026-11-25 es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. El modelo no es un modelo de lenguaje ni un sistema generativo de texto: se trata de un artefacto de robótica que define una marcha (gait) perpetua, es decir, un patrón de locomoción que se ejecuta de forma continua hasta que se le indique lo contrario. El autor del repositorio es el usuario de Hugging Face rumezhak y la política se distribuye en formato ONNX.

La política opera a 50 Hz sobre un espacio de observación de 61 dimensiones y emite 14 acciones de control. Se integra en el robot mediante el daemon robotctl, que carga el archivo `policy.onnx` en una ranura de política (policy slot). El normalizador de observaciones está embebido dentro del propio grafo ONNX, de modo que el robot debe alimentar observaciones en crudo sin preprocesado adicional.

El modelo es relevante en el contexto de la robótica open source porque ejemplifica un flujo de trabajo reproducible de entrenamiento RL a despliegue físico: el artefacto se genera desde el repositorio `pollen-robotics/microduck_rl` (rama main, commit 5cee942d8) y se publica con un manifiesto que sigue el esquema 2 del manifiesto de políticas de microduck. La información pública disponible es muy limitada: el repositorio ocupa 0.0 GB, no registra descargas ni likes y no declara licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de aprendizaje por refuerzo exportada a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (política de control reactiva; observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` según esquema 2 del manifiesto de políticas de microduck |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna de la red neuronal de la política (número de capas, tipo de red, función de activación ni tamaño). Lo que sí se especifica es el contrato de interfaz: el modelo consume observaciones de 61 dimensiones a 50 Hz y produce 14 acciones de control, y el normalizador de observaciones está integrado en el propio archivo ONNX, por lo que la entrada debe ser la observación en bruto del robot.

El entrenamiento se realizó mediante aprendizaje por refuerzo en el repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `5cee942d8`. No se dispone de datos sobre el número de pasos de entrenamiento, la composición del entorno de simulación, las funciones de recompensa empleadas ni si hubo transferencia sim-a-real. La política se describe como «perpetua»: un patrón de marcha que se ejecuta de forma continua hasta recibir una orden de parada o sustitución, lo que sugiere un diseño orientado a locomoción estable y sostenida más que a tareas episódicas.

## Capacidades

- Locomoción continua del robot cuadrúpedo microduck mediante una marcha perpetua a 50 Hz.
- Control reactivo basado en un vector de observación de 61 dimensiones y un vector de acción de 14 dimensiones.
- Normalización de observaciones embebida en el grafo ONNX, lo que simplifica la integración en el daemon.
- Carga y ejecución mediante el comando `robotctl policy load <slot> rumezhak/microduck-sprint-daily-2026-11-25`.
- Compatibilidad con el manifiesto de políticas de microduck (esquema 2), lo que permite su gestión por ranuras junto a otras políticas.
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües ni modos de pensamiento: no es un modelo de lenguaje.

## Casos de uso

- Locomoción autónoma en el robot microduck: la política se carga en una ranura y el robot ejecuta la marcha de forma continua, adecuada para desplazamientos sostenidos en entornos controlados.
- Investigación en aprendizaje por refuerzo para robótica: sirve como referencia de un artefacto entrenado con el repositorio `microduck_rl` y desplegado mediante el daemon, útil para reproducir el pipeline completo de entrenamiento a ejecución.
- Pruebas de integración del daemon robotctl: al seguir el esquema 2 del manifiesto, permite validar la carga, el cambio de ranuras y la ejecución de políticas en el robot.
- Demostraciones educativas de robótica cuadrúpeda open source: el formato ONNX y la normalización embebida reducen la barrera de entrada para estudiantes que quieran ejecutar una política preentrenada.
- Comparación de marchas: al poder cargarse junto a otras políticas en ranuras distintas, facilita la evaluación comparativa de patrones de locomoción (velocidad, estabilidad) sobre el mismo hardware.
- Base para ajuste fino o destilación: el artefacto puede servir como punto de partida para entrenar variantes de la marcha en el repositorio `microduck_rl` con nuevas recompensas o entornos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0.0 GB, lo que sugiere un modelo de muy pocos parámetros, pero no se confirma la cifra.
- GPU recomendadas: no disponible. La inferencia se ejecuta previsiblemente en la CPU del propio robot microduck a 50 Hz, dado que el artefacto es una política de control embebida.
- Cabe en GPU consumer: no disponible; por el tamaño declarado del repositorio, es plausible que quepa en cualquier GPU consumer e incluso en CPU, pero no hay confirmación.
- Opciones de despliegue: daemon robotctl del robot microduck mediante `robotctl policy load`; ejecución de ONNX con los runtimes habituales (ONNX Runtime, etc.), aunque no se especifica ninguno en la información disponible.
- Latencia y throughput estimados: no disponible; el único dato es la frecuencia de operación de 50 Hz del contrato de la política.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otras políticas de microduck ni modelos comparables con los que confrontar parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- La licencia no está declarada, por lo que no puede confirmarse el uso comercial ni la redistribución del artefacto.
- No se especifican los idiomas ni el alcance geográfico, aunque al tratarse de una política de control motriz esta dimensión no aplica.
- No hay información sobre sesgos, pero en robótica el riesgo relevante es la generalización limitada: una política entrenada en un entorno concreto puede fallar ante cambios de terreno, carga o calibración de sensores.
- La ejecución es «perpetua» por diseño: sin una orden explícita de parada o sustitución, la marcha continúa, lo que exige mecanismos de seguridad en el robot.
- No se detalla el proceso de transferencia sim-a-real ni las condiciones de entrenamiento, lo que dificulta evaluar su robustez en producción.
- El repositorio no registra descargas ni likes y su tamaño es de 0.0 GB, lo que puede indicar un artefacto mínimo o incompleto; conviene verificar la integridad de `policy.onnx` y `manifest.json` antes de desplegarlo.
- No dispone de capacidades de lenguaje, razonamiento ni tool calling; no debe emplearse fuera del ámbito de control motriz para el que fue diseñado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rumezhak/microduck-sprint-daily-2026-11-25
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck

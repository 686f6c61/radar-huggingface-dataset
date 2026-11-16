# rumezhak/microduck-tug-league-points-v2

## Resumen

`microduck-tug-league-points-v2` es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. El modelo no es un modelo de lenguaje: se trata de un policy network exportado a ONNX que traduce observaciones del robot (61 dimensiones) en acciones de control (14 dimensiones) a una frecuencia de 50 Hz, pensado para ejecutarse directamente sobre el hardware.

La política es de tipo "perpetuo": una vez cargada en una ranura de política del daemon `robotctl`, el robot ejecuta la marcha de forma continua hasta que se le indique lo contrario. El autor es `rumezhak` y el modelo se publica bajo la librería `microduck`, con el repositorio de entrenamiento en `pollen-robotics/microduck_rl` (commit `5cee942d8`).

Su relevancia es acotada: se trata de un artefacto muy específico para un robot concreto, sin model card detallada, sin métricas publicadas y con un tamaño de repositorio de 0.0 GB. Resulta útil para quien trabaje con el ecosistema microduck y quiera desplegar una política de locomoción ya entrenada, pero no aporta información sobre arquitectura interna, datos de entrenamiento ni rendimiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL exportada a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (formato ONNX) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`), con normalizador de observaciones embebido |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna de la red (número de capas, tipo de red, tamaño). Lo que sí se documenta es la interfaz: 61 dimensiones de observación de entrada y 14 dimensiones de acción de salida, operando a 50 Hz. El normalizador de observaciones está integrado dentro del propio `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, rama `main`, commit `5cee942d8`. No se especifican el número de pasos de entrenamiento, la composición del entorno, la función de recompensa ni si se emplearon técnicas como domain randomization. El manifiesto `manifest.json` sigue el esquema 2 del manifiesto de políticas de microduck, documentado en `docs/policy-manifest.md` del repositorio del daemon.

## Capacidades

- Control de locomoción del robot microduck mediante una política perpetua (marcha continua hasta que se detenga explícitamente).
- Lectura de observaciones de 61 dimensiones y emisión de 14 acciones de control a 50 Hz.
- Normalización de observaciones integrada en el modelo ONNX (entrada en crudo).
- Carga y ejecución mediante el comando `robotctl policy load <slot> rumezhak/microduck-tug-league-points-v2`.
- Compatibilidad con el sistema de ranuras (slots) de políticas del daemon microduck.
- No dispone de tool calling, agentes, capacidades multilingües ni generación de texto: no es un modelo de lenguaje.

## Casos de uso

- Locomoción de base en un microduck: cargar la política en una ranura y dejar que el robot camine de forma continua para pruebas de movimiento y calibración del hardware.
- Demostraciones de robótica en entornos educativos: al ser una política perpetua sencilla de cargar, sirve para mostrar el flujo completo de despliegue de políticas de RL sobre un cuadrúpedo de código abierto.
- Pruebas de integración del daemon `robotctl`: validar el mecanismo de carga de políticas y el esquema 2 de manifiestos con un artefacto real.
- Base para comparación de políticas: usar esta marcha como referencia frente a otras políticas entrenadas por el usuario en el mismo robot y misma interfaz (61 observaciones, 14 acciones).
- Experimentos de simulación a realidad: probar en hardware una política entrenada en el pipeline `microduck_rl` para evaluar la transferencia del entrenamiento simulado.
- Benchmarking de control a 50 Hz: medir latencia de inferencia ONNX y estabilidad del bucle de control en el hardware objetivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el tamaño del repositorio es de 0.0 GB y el modelo se distribuye como ONNX, por lo que se espera que quepa en el propio robot o en hardware de muy bajos recursos, pero no hay cifras publicadas.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ejecución mediante el daemon microduck y el comando `robotctl policy load`; el artefacto es un `policy.onnx` que puede ejecutarse con cualquier runtime ONNX compatible, aunque no se documenta cuál usa el daemon.
- Latencia y throughput: no disponibles; la política opera a 50 Hz según la model card, lo que implica un presupuesto de 20 ms por paso de control.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas comparables para el mismo robot o con la misma interfaz (61-D observación, 14 acciones, 50 Hz).

## Limitaciones y advertencias

- No se especifica licencia, lo que impide determinar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue en producción.
- No hay información sobre la arquitectura, el tamaño del modelo ni los datos de entrenamiento, lo que dificulta evaluar su robustez o generalización.
- Al ser una política entrenada para un robot concreto (microduck), no es transferible a otras plataformas sin reentrenamiento.
- El comportamiento es perpetuo: el robot seguirá ejecutando la marcha hasta que se detenga explícitamente, lo que exige mecanismos de parada seguros en el entorno de despliegue.
- Sin métricas publicadas de rendimiento, estabilidad o tasa de caídas; no se puede garantizar su comportamiento fuera de las condiciones de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes, sin evidencia de validación por parte de la comunidad.
- No se documentan sesgos ni riesgos de alucinación por no tratarse de un modelo generativo, pero sí existe riesgo de comportamiento inseguro en el robot si la política se ejecuta en condiciones distintas a las de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rumezhak/microduck-tug-league-points-v2
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`)

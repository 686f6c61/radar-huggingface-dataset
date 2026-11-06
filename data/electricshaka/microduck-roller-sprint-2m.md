# ElectricShaka/microduck-roller-sprint-2m

## Resumen

`microduck-roller-sprint-2m` es una política de control entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck de Pollen Robotics. No es un modelo de lenguaje: se trata de un artefacto de control motor exportado a ONNX que recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, pensado para ejecutarse en el propio robot sobre ruedas (rollers). El autor es ElectricShaka y el repositorio se publicó en noviembre de 2026.

La política se describe como "perpetua": una vez cargada en una ranura de política del demonio del robot, ejecuta una marcha de forma continua hasta que se le indique lo contrario. Se distribuye como `policy.onnx` con el normalizador de observaciones integrado en el propio grafo, de modo que el consumidor debe alimentar observaciones en crudo, y un `manifest.json` que sigue el esquema 2 del manifiesto de políticas de microduck.

Su relevancia es acotada pero clara para quien trabaja con robótica de bajo coste: demuestra el flujo completo de entrenamiento en `pollen-robotics/microduck_rl`, exportación a ONNX y despliegue en hardware real mediante `robotctl`. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no incluye información sobre licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control entrenada con aprendizaje por refuerzo (RL), exportada a ONNX; arquitectura de red no especificada en la model card |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; ventana de observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (se distribuye un único `policy.onnx`) |
| Idiomas soportados | no disponible (no aplica; salida de acciones motoras) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2 del manifiesto de políticas de microduck) |

Parámetros operativos adicionales:

| Parametro | Valor |
|---|---|
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Modo de ejecucion | Perpetuo (hasta recibir orden de parada) |
| Entorno | Robot microduck sobre ruedas (rollers) |
| Normalizador | Integrado en `policy.onnx` (observaciones en crudo) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red neuronal (número de capas, anchura, tipo de activación ni si emplea memoria recurrente). Lo que sí se documenta es el pipeline: la política se entrenó con el repositorio `pollen-robotics/microduck_rl`, rama `main`, en el commit `c601a991f`. El resultado se exporta a ONNX con el normalizador de observaciones embebido en el grafo, lo que elimina la necesidad de replicar la normalización en el lado del robot y reduce el riesgo de desajustes entre entrenamiento e inferencia.

El comportamiento aprendido es una marcha ("sprint") sobre rollers, esto es, un patrón de locomoción cíclico adecuado a un robot con ruedas en lugar de patas. La política es perpetua por diseño: no tiene condición de terminación interna y se mantiene activa hasta que el demonio del robot la descarga o la sustituye. No se especifican en la model card el número de pasos de entrenamiento, la composición del dataset, el algoritmo de RL empleado (PPO, SAC u otro) ni si hubo fases de recompensa por imitación.

## Capacidades

- Generación de una marcha continua sobre rollers para el robot microduck, con salida de 14 acciones motoras a 50 Hz.
- Consumo de observaciones de 61 dimensiones en crudo, gracias al normalizador integrado en el ONNX.
- Ejecución perpetua: mantiene el patrón de locomoción hasta que se le indique lo contrario.
- Carga en el robot mediante el comando `sudo robotctl policy load <slot> ElectricShaka/microduck-roller-sprint-2m`.
- Compatibilidad con el esquema 2 del manifiesto de políticas de microduck (`docs/policy-manifest.md` en el repositorio del demonio).
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de pensamiento: es exclusivamente una política motora.

## Casos de uso

- Despliegue directo en hardware microduck: cargar la política en una ranura con `robotctl` y dejar que el robot ejecute la marcha sobre rollers de forma indefinida, útil para demos de locomoción continua en ferias o laboratorios.
- Pruebas de integración del demonio: al seguir el esquema 2 del manifiesto, sirve como artefacto de referencia para validar el cargador de políticas y el flujo de normalización embebida en un pipeline de CI del firmware.
- Base para experimentos de RL comparativos: al estar entrenada contra un commit concreto de `microduck_rl`, permite reproducir el entrenamiento y medir el efecto de cambios en recompensas o hiperparámetros sobre la marcha resultante.
- Benchmark de inferencia en el borde: un ONNX con observación de 61 dimensiones y acción de 14 a 50 Hz es un caso de prueba realista para medir latencia de ejecución en la CPU del robot y ajustar el bucle de control.
- Material docente: ejemplo completo y mínimo de ciclo entrenamiento, exportación a ONNX y despliegue en robótica de bajo coste, sin dependencia de infraestructura de GPU para la fase de inferencia.
- Punto de partida para fine-tuning de marchas sobre rollers: reutilizar la política como inicialización al entrenar variantes de velocidad o dirección en el mismo robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de recompensa, velocidad alcanzada, estabilidad ni comparaciones con otras políticas del mismo robot.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una política de control de dimensiones pequeñas (61 entradas, 14 salidas), es esperable que se ejecute en CPU, pero el tamaño del ONNX no se documenta (el repositorio ocupa 0.0 GB según Hugging Face).
- GPU recomendadas: no aplica para inferencia; para reentrenar con `pollen-robotics/microduck_rl` se requiere una GPU compatible con el pipeline de RL del repositorio, cuyo modelo concreto no se especifica.
- Cabe en GPU de consumo: previsiblemente sí, dado el reducido tamaño de entrada y salida, aunque no hay confirmación en la información disponible.
- Opciones de despliegue: `robotctl policy load` sobre el demonio de microduck (vía `sudo`), con `policy.onnx` y `manifest.json` como artefactos. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles; el único dato temporal es la frecuencia de control de 50 Hz (periodo de 20 ms por paso).

## Comparativa con modelos similares

| Modelo | Tipo | Observacion / accion | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ElectricShaka/microduck-roller-sprint-2m | Política RL para microduck sobre rollers | 61 / 14 | 50 Hz | no disponible | Hugging Face, 0 descargas |
| GinDuck/microduck-roller-sprint-2m-roller-1 | Política RL para microduck sobre rollers | no disponible | no disponible | no disponible | Hugging Face |
| GinDuck/microduck-roller-sprint-2m-roller-2-c | Política RL para microduck sobre rollers (checkpoint anterior citado en su card) | no disponible | no disponible | no disponible | Hugging Face |

Las dos alternativas encontradas en la búsqueda web comparten el nombre base `microduck-roller-sprint-2m`, lo que sugiere variantes o derivados del mismo entrenamiento publicados por otro autor. No hay datos públicos de rendimiento que permitan comparar la calidad de las marchas.

## Limitaciones y advertencias

- No se especifica licencia: no puede asumirse uso comercial ni redistribución sin consultar al autor.
- La model card no documenta la arquitectura de red, el algoritmo de RL, el número de pasos de entrenamiento ni las recompensas, lo que dificulta la reproducibilidad más allá del commit indicado.
- El comportamiento está especializado en rollers; no se declara transferencia a locomoción con patas ni a otros entornos.
- La política es perpetua por diseño: no incorpora condición de parada interna, de modo que la seguridad depende del demonio del robot y de los límites externos.
- No hay métricas de estabilidad, velocidad ni robustez ante perturbaciones, por lo que no se recomienda su uso en producción sin una validación empírica propia.
- El repositorio tiene 0 descargas y 0 likes y un tamaño declarado de 0.0 GB, lo que puede indicar artefactos muy pequeños o un empaquetado incompleto; conviene verificar el contenido antes de desplegar.
- Al integrar el normalizador en el ONNX, alimentar observaciones ya normalizadas produciría un comportamiento incorrecto; hay que respetar el contrato de observaciones en crudo.
- No hay información sobre sesgos, alucinación o cobertura idiomática porque el artefacto no genera texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ElectricShaka/microduck-roller-sprint-2m
- Repositorio de entrenamiento: https://github.com/pollen-robotics/microduck_rl (rama `main`, commit `c601a991f`)
- Proyecto microduck: https://github.com/pollen-robotics/microduck
- Variante relacionada: https://huggingface.co/GinDuck/microduck-roller-sprint-2m-roller-1
- Variante relacionada: https://huggingface.co/GinDuck/microduck-roller-sprint-2m-roller-2-c

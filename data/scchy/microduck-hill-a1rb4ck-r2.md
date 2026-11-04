# SccHy/microduck-hill-a1rb4ck-r2

## Resumen

`microduck-hill-a1rb4ck-r2` es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje, sino de un controlador neuronal que mapea observaciones del robot (61 dimensiones) a acciones de locomoción (14 dimensiones) a una frecuencia de 50 Hz. El modelo se distribuye en formato ONNX y se carga directamente en el daemon del robot mediante la herramienta `robotctl`.

La política es de tipo "perpetual": una vez cargada en un slot de política del robot, ejecuta una marcha continua hasta que se le indique lo contrario. El normalizador de observaciones está embebido en el propio fichero `policy.onnx`, de modo que el robot puede alimentar observaciones en bruto sin preprocesado externo. El repositorio incluye un `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck.

El modelo lo publica el usuario SccHy bajo el identificador `SccHy/microduck-hill-a1rb4ck-r2`. El repositorio tiene un tamaño de 0.0 GB, cero descargas y cero likes en el momento de la consulta, y no declara licencia ni idiomas soportados. Su relevancia es acotada: es una política de locomoción concreta para una plataforma robótica específica, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política neuronal de RL; se desconoce la topología de la red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (distribución en ONNX) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (esquema 2) |

Especificaciones adicionales de la interfaz:

| Parametro | Valor |
|---|---|
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Tipo de politica | perpetua (ejecuta hasta recibir orden de parada) |
| Libreria | microduck |
| Pipeline | robotics |
| Tamano del repositorio | 0.0 GB |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura de la red neuronal de la política (número de capas, anchura, tipo de activaciones ni si emplea memoria recurrente). Lo que sí se especifica es la interfaz: entrada de 61 dimensiones de observación y salida de 14 dimensiones de acción, ejecutada a 50 Hz, lo que implica un bucle de control de 20 ms por paso. El normalizador de observaciones está integrado en el grafo ONNX, de forma que el consumidor entrega observaciones sin normalizar.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, en la rama `challenge-recipe-publishing`, commit `1efd853be`. Se trata de un entrenamiento de aprendizaje por refuerzo (tags `reinforcement-learning`) orientado a generar una marcha estable para el microduck. No se especifican el número de pasos de entorno, la composición de recompensas, ni si se aplicaron técnicas de dominio aleatorizado, destilación o regularización. Tampoco se documenta la innovación técnica concreta del método de entrenamiento más allá de la receta referenciada en el repositorio.

## Capacidades

- Locomoción continua del robot microduck: genera una marcha perpetua a 50 Hz hasta que se detiene explícitamente.
- Control reactivo a partir de observaciones en bruto de 61 dimensiones, con normalización embebida en el modelo ONNX.
- Generación de 14 acciones de control por paso, correspondientes a los actuadores del robot.
- Carga directa en el daemon del robot mediante `robotctl policy load <slot> SccHy/microduck-hill-a1rb4ck-r2`.
- Compatibilidad con el esquema 2 del manifiesto de políticas de microduck, lo que permite su integración en el sistema de slots de políticas del daemon.
- No soporta tool calling, function calling, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de pensamiento: no es un modelo de lenguaje ni multimodal.

## Casos de uso

- Locomoción autónoma en el robot microduck: cargar la política en un slot y dejar que el robot camine de forma continua en tareas de exploración o demostración, aprovechando su naturaleza perpetua y su frecuencia de control de 50 Hz.
- Investigación en aprendizaje por refuerzo para robótica: servir como referencia de política entrenada con la receta `microduck_rl` y comparar marchas entre distintas políticas publicadas en el mismo formato.
- Pruebas de integración del daemon de microduck: validar el flujo de carga de políticas, el esquema de manifiesto 2 y el pipeline de observación-acción a 50 Hz en un robot real o simulado.
- Demostraciones educativas de robótica de código abierto: usar la política como ejemplo reproducible de un controlador neuronal desplegado en un cuadrúpedo de bajo coste.
- Evaluación de robustez de marchas: ejecutar la política en distintos terrenos o condiciones y medir estabilidad, dado que la observación incluye 61 dimensiones del estado del robot.
- Base para ajuste fino o destilación: partir de esta política ONNX como inicialización o referencia en nuevos entrenamientos con el repositorio `microduck_rl`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo se ejecuta en el propio robot microduck a través del daemon y `robotctl`, no en GPUs de servidor.
- VRAM estimada: no disponible; al ser una política ONNX de tamaño de repositorio 0.0 GB, la inferencia es ligera y probablemente viable en CPU del propio robot, aunque no se confirma en la información.
- GPU recomendadas: no disponible; no se documenta requisito de GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: `robotctl policy load` sobre el daemon de microduck (librería `microduck`); el artefacto es `policy.onnx`, ejecutable con runtimes ONNX estándar, aunque no se documenta el runtime concreto.
- Latencia y throughput: el bucle de control opera a 50 Hz (20 ms por paso); no se publican cifras de latencia de inferencia ni de throughput.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas de locomoción para microduck ni modelos comparables de la misma categoría con datos verificables de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No se declara licencia, por lo que el uso comercial y la redistribución quedan sin marco legal explícito; debe contactarse con el autor antes de cualquier uso en producción.
- El repositorio no incluye model card sustantiva: no hay información sobre sesgos, dominio de entrenamiento, condiciones de terreno cubiertas ni robustez fuera de distribución.
- La política es específica del robot microduck (61 observaciones, 14 acciones, 50 Hz); no es transferible a otras plataformas sin reentrenamiento.
- Al ser una política perpetua, no incorpora lógica de parada segura propia: la detención depende del sistema de control del robot.
- Riesgo de comportamiento inseguro en condiciones no vistas: sin documentación de dominio aleatorizado ni de evaluación en simulación a realidad, la marcha puede fallar en terrenos o cargas distintas a las de entrenamiento.
- No apta para tareas de lenguaje, razonamiento, visión o generación de contenido; su pipeline es exclusivamente `robotics`.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de comunidad ni de validación externa del comportamiento de la política.

## Enlaces

- HuggingFace: https://huggingface.co/SccHy/microduck-hill-a1rb4ck-r2
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl`, rama `challenge-recipe-publishing`, commit `1efd853be` (no se proporciona URL directa)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (no se proporciona URL directa)

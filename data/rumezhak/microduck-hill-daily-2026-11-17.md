# rumezhak/microduck-hill-daily-2026-11-17

## Resumen

`microduck-hill-daily-2026-11-17` es una política de control robótico entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje, sino de una política de locomoción ("gait") que se carga en una ranura de política del daemon del robot y se ejecuta de forma perpetua hasta recibir una orden de parada. El autor del repositorio es el usuario de Hugging Face `rumezhak`.

La política consume observaciones de 61 dimensiones y produce 14 acciones a una frecuencia de 50 Hz, lo que la sitúa en el ámbito del control reactivo de bajo nivel típico de los controladores de locomoción para robots ligeros. El artefacto principal es un fichero `policy.onnx` que incluye el normalizador de observaciones integrado, de modo que el consumidor debe alimentar observaciones en bruto. Se acompaña de un `manifest.json` conforme al esquema 2 del manifiesto de políticas de microduck.

Su relevancia es acotada pero clara para quien trabaja con microduck: proporciona una política preentrenada lista para cargar en hardware real mediante un único comando, lo que reduce el trabajo de reproducción de experimentos de RL sobre esta plataforma. No hay información publicada sobre benchmarks, licencia ni idiomas, y el repositorio no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de RL exportada a ONNX; no se detalla la topología de red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; observación de 61 dimensiones por paso) |
| Tipos de cuantizacion | no disponible (artefacto distribuido en ONNX) |
| Idiomas soportados | no aplica (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` con esquema 2 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de la red neuronal. Lo que sí se especifica es la interfaz de la política: 61 dimensiones de observación como entrada, 14 dimensiones de acción como salida y una frecuencia de control de 50 Hz. El normalizador de observaciones está embebido en el propio `policy.onnx`, de modo que la política espera observaciones sin normalizar. El comportamiento descrito es el de una política perpetua, es decir, un patrón de marcha que se ejecuta de forma continua hasta que el daemon la interrumpe.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, en la rama `main` y en el commit `5cee942d8`. Se etiqueta como aprendizaje por refuerzo (`reinforcement-learning`) y el pipeline declarado es `robotics`. No se especifican el número de pasos de entrenamiento, la composición del entorno, el algoritmo de RL empleado (PPO, SAC u otro), ni si hubo fases de ajuste fino o de dominio aleatorizado. Tampoco se documenta ninguna innovación técnica adicional más allá de la integración del normalizador en el grafo ONNX.

## Capacidades

- Locomoción continua del robot microduck mediante una política perpetua cargada en una ranura de política.
- Control reactivo a 50 Hz a partir de un vector de observación de 61 dimensiones.
- Emisión de 14 acciones de control por paso.
- Ingesta de observaciones en bruto gracias al normalizador embebido en el modelo ONNX.
- Despliegue en hardware real mediante `robotctl policy load <slot> rumezhak/microduck-hill-daily-2026-11-17`.
- Compatibilidad con el esquema 2 del manifiesto de políticas del daemon de microduck.
- No soporta tool calling, agentes, razonamiento multi-paso, procesamiento de lenguaje ni visión.

## Casos de uso

- Reproducción de experimentos de RL sobre microduck: cargar la política en una ranura y comparar la marcha resultante con otras políticas del mismo repositorio o con las generadas por el usuario, usando el mismo daemon y el mismo esquema de manifiesto.
- Punto de partida para ajuste fino: al estar entrenada con `microduck_rl`, puede servir como inicialización para nuevos entrenamientos sobre terrenos o tareas distintas, siempre que se respete la interfaz de 61 observaciones y 14 acciones.
- Validación de la cadena de despliegue: útil para verificar que el pipeline `robotctl` y la carga de manifiestos de esquema 2 funcionan correctamente antes de desplegar políticas propias.
- Demostraciones de locomoción en entornos controlados: la naturaleza perpetua de la política permite mantener al robot caminando de forma continua durante sesiones de exhibición o pruebas de laboratorio.
- Pruebas de integración de ONNX en el daemon: sirve para comprobar el rendimiento de la inferencia ONNX a 50 Hz en el hardware objetivo del robot.
- Referencia docente: ejemplo práctico de política de RL exportada a ONNX con normalizador embebido para cursos o talleres sobre robótica de código abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo se ejecuta en el propio robot microduck a través del daemon, no en un servidor de inferencia.
- VRAM estimada para inferencia: no disponible. Al ser una política de control de pequeña dimensión exportada a ONNX, es previsible que quepa en el hardware embebido del robot, pero no se documentan requisitos concretos.
- GPU recomendadas: no disponibles. No se especifica si el daemon ejecuta la inferencia en CPU o en acelerador.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: `robotctl policy load <slot> rumezhak/microduck-hill-daily-2026-11-17` sobre el daemon de microduck; el artefacto es un ONNX que puede cargarse con cualquier runtime compatible con ONNX Runtime, aunque no se documenta oficialmente.
- Latencia y throughput: la política está diseñada para operar a 50 Hz (20 ms por paso), pero no se publican mediciones reales de latencia ni de throughput.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada otras políticas de microduck comparables, ni se dispone de datos de rendimiento que permitan una comparación cuantitativa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| microduck-hill-daily-2026-11-17 | no disponible | no aplica | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se especifica licencia, lo que impide determinar si el uso comercial está permitido; debe consultarse al autor antes de cualquier despliegue productivo.
- No hay información sobre sesgos, pero al ser una política de RL entrenada en un entorno concreto, su comportamiento puede degradarse fuera de las condiciones de entrenamiento (terrenos, cargas o perturbaciones no vistas).
- La política es perpetua: se ejecuta hasta que se le indique lo contrario, lo que exige mecanismos externos de parada segura en el daemon.
- No se documentan los datos de entrenamiento ni el algoritmo de RL, lo que dificulta la reproducibilidad y la auditoría del comportamiento.
- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0.0 GB según la información de Hugging Face; conviene verificar la integridad de los artefactos antes de cargarlos en hardware real.
- No apta para tareas de lenguaje, visión, tool calling ni razonamiento; cualquier uso fuera del control de locomoción de microduck queda fuera de su ámbito declarado.
- El commit de entrenamiento (`5cee942d8`) y la rama (`main`) se indican, pero sin fecha ni configuración reproducible, por lo que la replicación exacta no está garantizada.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/rumezhak/microduck-hill-daily-2026-11-17
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `main`, commit `5cee942d8`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon de microduck

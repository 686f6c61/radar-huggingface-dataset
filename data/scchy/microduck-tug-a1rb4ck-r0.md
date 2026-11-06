# SccHy/microduck-tug-a1rb4ck-r0

## Resumen

tug-a1rb4ck-r0 es una política de control por refuerzo (reinforcement learning) publicada por el usuario SccHy para el robot cuadrúpedo de código abierto microduck de Pollen Robotics. No se trata de un modelo de lenguaje, sino de una política de locomoción que recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz, empaquetada en formato ONNX y ejecutable directamente en el robot mediante el daemon `robotctl`.

El modelo se distribuye con la librería `microduck` y el pipeline declarado es `robotics`. Su naturaleza es la de una política perpetua ("perpetual"): una vez cargada en una ranura de política del daemon, se ejecuta de forma continua hasta que se le indique lo contrario, comportándose como una marcha o gait preentrenada.

La información pública disponible es extremadamente escasa: el repositorio ocupa 0.0 GB, no tiene descargas ni likes, no declara licencia ni idiomas, y la model card se limita a describir el procedimiento de carga y a referenciar el repositorio de entrenamiento. Todo lo que no figure en esa información se marca como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de reinforcement learning exportada a ONNX (detalles de red no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (se distribuye como `policy.onnx`) |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) + `manifest.json` (schema 2 del manifiesto de políticas microduck) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Tipo de politica | perpetua (se ejecuta hasta recibir orden de parada) |

## Arquitectura y entrenamiento

La arquitectura interna de la red no está documentada en la información disponible; solo se sabe que el resultado se exporta a ONNX e incorpora el normalizador de observaciones dentro del propio fichero `policy.onnx`, de modo que el consumidor debe alimentar observaciones en bruto (raw observations) sin preprocesar. La política opera en bucle cerrado a 50 Hz con un vector de observación de 61 dimensiones y un vector de acción de 14 dimensiones.

El entrenamiento se realizó con el repositorio `pollen-robotics/microduck_rl`, en la rama `challenge-recipe-publishing` y el commit `1efd853be`. No se especifican el número de pasos de entrenamiento, la composición del dataset, el algoritmo de RL empleado (PPO, SAC u otro), ni si hubo fases de ajuste adicionales. Tampoco se detalla la topología de la red (capas, activaciones, tamaño de las mismas).

## Capacidades

- Locomoción del robot cuadrúpedo microduck mediante una marcha (gait) preentrenada.
- Ejecución perpetua: la política corre de forma continua hasta que el daemon recibe una orden de parada o de cambio de política.
- Consumo de observaciones en bruto: el normalizador está embebido en el ONNX, por lo que no requiere pipeline de preprocesado externo.
- Integración con el daemon `robotctl` mediante carga en una ranura de política (`policy load <slot> ...`).
- Control en tiempo real a 50 Hz con 14 acciones de salida.
- No dispone de capacidades de generación de texto, razonamiento, código, visión, tool calling, agentes ni multilingüismo, al no ser un modelo de lenguaje.

## Casos de uso

- Locomoción básica del microduck en laboratorio: cargar la política en una ranura con `sudo robotctl policy load <slot> SccHy/microduck-tug-a1rb4ck-r0` para obtener una marcha funcional sin entrenar desde cero.
- Prototipado de comportamientos de nivel superior: usar esta política como capa de control de bajo nivel sobre la que apilar planificadores de trayectorias o máquinas de estados que envíen comandos de alto nivel.
- Docencia e investigación en RL robótico: servir como referencia de política perpetua exportada a ONNX con observación de 61 dimensiones y acción de 14, útil para comparar recetas de entrenamiento del repositorio `microduck_rl`.
- Pruebas de integración del daemon: validar el flujo de carga de políticas, el esquema 2 de `manifest.json` y la ejecución a 50 Hz en el robot real.
- Benchmarking de gaits: comparar el comportamiento de esta marcha frente a otras políticas cargadas en la misma ranura para evaluar estabilidad y velocidad de desplazamiento.
- Despliegue en entornos educativos con hardware de bajo coste: al ser ONNX y ejecutarse en el propio robot, no requiere GPUs dedicadas ni infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al tratarse de una política de control pequeña exportada a ONNX, es probable que se ejecute en CPU del propio robot, pero el dato no está confirmado en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: daemon `robotctl` del proyecto microduck, cargando `policy.onnx` y `manifest.json` en una ranura de política; también puede ejecutarse con cualquier runtime compatible con ONNX (ONNX Runtime, etc.), aunque no se documenta explícitamente.
- Latencia y throughput: frecuencia de control de 50 Hz (periodo de 20 ms por ciclo); no se publican cifras de latencia de inferencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Dimension observacion | Dimension accion | Frecuencia | Formato | Licencia |
|---|---|---|---|---|---|---|
| SccHy/microduck-tug-a1rb4ck-r0 | Política RL para microduck | 61 | 14 | 50 Hz | ONNX | no disponible |
| Otras políticas del ecosistema microduck | Política RL para microduck | no disponible | no disponible | no disponible | no disponible | no disponible |
| Políticas RL para cuadrúpedos de otros proyectos (p. ej. MuJoCo/Isaac) | Política RL | variable | variable | variable | variable | variable |

No se dispone de datos públicos de modelos comparables directos en la información proporcionada; la comparativa con alternativas concretas se marca como no disponible.

## Limitaciones y advertencias

- Información pública mínima: no se declara licencia, idiomas, arquitectura ni métricas de rendimiento, lo que impide evaluar su idoneidad para producción.
- Licencia no disponible: no puede confirmarse el permiso para uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.
- Ámbito restringido: solo aplica al hardware microduck; no es reutilizable en otros robots sin reentrenamiento.
- Sin datos de robustez: no se documenta el comportamiento ante perturbaciones, terrenos irregulares o fallos de sensores.
- Dependencia del daemon: requiere `robotctl` y el esquema 2 de manifiesto; cambios de versión del daemon podrían romper la compatibilidad.
- Riesgo de comportamiento no deseado: al ser una política perpetua, se ejecuta hasta que se le indique lo contrario; debe preverse un mecanismo de parada segura.
- Sin información sobre sesgos, alucinación o limitaciones de contexto, por no ser un modelo de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/SccHy/microduck-tug-a1rb4ck-r0
- Repositorio microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl` (rama `challenge-recipe-publishing`, commit `1efd853be`)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon

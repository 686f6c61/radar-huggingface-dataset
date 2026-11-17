# GinDuck/microduck-gin-sock-c17

## Resumen

microduck-gin-sock-c17 es una política de control para el robot cuadrúpedo de código abierto microduck de Pollen Robotics, publicada por el usuario GinDuck en Hugging Face. No es un modelo de lenguaje ni un modelo generativo: es una política de aprendizaje por refuerzo exportada a ONNX que se carga en una ranura de política del daemon del robot para ejecutar una marcha (gait) de forma continua. El modelo recibe observaciones de 61 dimensiones y emite 14 acciones a 50 Hz.

La política se presenta como una "composite counter" (contador compuesto) con un tiempo declarado de 4,781 s en la réplica local, con una lista de cinco tiempos por semilla [4,64, 5,095, 4,675, 4,68, 4,815]. Según la model card, las semillas 2 a 5 reproducen la política microduck-sock-heist-composite-v10 de rumezhak (run 01M7N0C6V63JMP4M9FM2G1), mientras que la semilla 1 corresponde a la secuencia microduck-sock-counter-s5 de jrubiosainz (run 01M7JVJ71N7BABY0M9RMCZ) tras un ascenso propio de cola con el mismo tiempo de 4,64 s. La red de respaldo (fallback) es propia.

El interés de esta ficha es limitado fuera del ecosistema microduck: el repositorio tiene 0 descargas, 0 likes y un tamaño de 0,0 GB, y la información pública es muy escasa. Es relevante únicamente como ejemplo de política de RL empaquetada para un robot de bajo coste con un formato de manifiesto versionado (schema 2) y normalización de observaciones integrada en el propio ONNX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (política de aprendizaje por refuerzo exportada a ONNX) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en ONNX, sin cuantizaciones documentadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` (schema 2 del microduck policy manifest) |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Frecuencia de control | 50 Hz |
| Libreria | microduck |
| Pipeline | robotics |
| Tamano del repo | 0,0 GB |

## Arquitectura y entrenamiento

La model card no describe la arquitectura de la red neuronal: solo indica que la política se exporta a ONNX con el normalizador de observaciones integrado en `policy.onnx`, de modo que el robot debe alimentar observaciones en bruto. La interfaz es explícita: 61 dimensiones de observación, 14 dimensiones de acción y una frecuencia de 50 Hz, con comportamiento perpetuo (la política se ejecuta hasta que se detiene explícitamente).

En cuanto al entrenamiento, se documenta el repositorio `pollen-robotics/microduck_rl`, la rama `talent-3` y el commit `debcfcae0`. No se especifican el número de pasos de entrenamiento, la composición del dataset, el algoritmo de RL empleado (PPO, SAC u otro) ni si hubo fases de ajuste adicionales. La model card atribuye parte de las semillas a ejecuciones de terceros (rumezhak y jrubiosainz), lo que sugiere un proceso de composición de políticas o de reutilización de secuencias entrenadas por otros autores, pero el mecanismo exacto no se detalla.

## Capacidades

- Control locomotor de un robot cuadrúpedo microduck mediante una política perpetua cargada en una ranura del daemon.
- Ejecución de una marcha o secuencia de conteo compuesto con tiempos declarados por semilla.
- Consumo de observaciones en bruto: el normalizador está embebido en el ONNX, lo que simplifica la integración en el robot.
- Interfaz de despliegue mediante el comando `robotctl policy load <slot> GinDuck/microduck-gin-sock-c17`.
- Compatibilidad con el manifiesto de políticas schema 2 del daemon de microduck.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Investigación en robótica de bajo coste: cargar la política en un microduck físico para reproducir la marcha y comparar los tiempos declarados con los obtenidos en el propio hardware.
- Reproducibilidad de experimentos de RL: al estar exportada a ONNX con el normalizador integrado, permite repetir la inferencia sin reconstruir el pipeline de preprocesado.
- Benchmarking de políticas: usar los tiempos por semilla [4,64, 5,095, 4,675, 4,68, 4,815] como referencia para evaluar políticas propias en la misma tarea de conteo compuesto.
- Docencia y demostraciones: el comando `robotctl policy load` facilita desplegar la política en sesiones prácticas sin entrenamiento previo.
- Composición de políticas: servir como componente base para combinar secuencias de distintos autores (rumezhak, jrubiosainz) en pipelines de marcha más complejos.
- Validación del formato de manifiesto schema 2: utilizar el `manifest.json` como ejemplo de referencia para publicar nuevas políticas compatibles con el daemon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de rendimiento es el tiempo de la tarea en la réplica local: 4,781 s de media, con tiempos por semilla de 4,64 s, 5,095 s, 4,675 s, 4,68 s y 4,815 s.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB, lo que sugiere un modelo muy pequeño, pero no se publica el número de parámetros.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por el tamaño del artefacto es plausible que la inferencia sea ligera, pero no hay datos que lo confirmen.
- Opciones de despliegue: el runtime `microduck` y el daemon del robot mediante `robotctl policy load`; al ser ONNX, podría ejecutarse con ONNX Runtime, pero no se documenta.
- Latencia y throughput: no disponibles; la política opera a 50 Hz, lo que fija un presupuesto de 20 ms por paso de control, sin datos medidos de latencia.

## Comparativa con modelos similares

| Modelo | Tipo | Dimension observacion | Dimension accion | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GinDuck/microduck-gin-sock-c17 | Política RL (ONNX) | 61 | 14 | 50 Hz | no disponible | Hugging Face, 0 descargas |
| rumezhak/microduck-sock-heist-composite-v10 | Política RL | no disponible | no disponible | no disponible | no disponible | Referenciada en la model card (run 01M7N0C6V63JMP4M9FM2G1) |
| jrubiosainz/microduck-sock-counter-s5 | Política RL | no disponible | no disponible | no disponible | no disponible | Referenciada en la model card (run 01M7JVJ71N7BABY0M9RMCZ) |

No se dispone de datos de parámetros, contexto ni rendimiento de las alternativas más allá de su mención como origen de las semillas 2-5 y 1 respectivamente.

## Limitaciones y advertencias

- Información pública mínima: sin licencia declarada, sin idiomas, sin número de parámetros y con 0 descargas y 0 likes, lo que impide evaluar su robustez fuera del entorno del autor.
- Licencia no disponible: no se puede confirmar el uso comercial ni la redistribución; cualquier uso en producción requiere contactar con el autor.
- Específica de hardware: la política está entrenada para el microduck (61 observaciones, 14 acciones, 50 Hz); no es transferible a otras plataformas sin reentrenamiento.
- Dependencia de terceros: parte de las semillas reproducen ejecuciones de rumezhak y jrubiosainz, de modo que los resultados pueden depender de condiciones no documentadas de esos entrenamientos.
- Sin datos de robustez: no se documentan pruebas ante perturbaciones, terrenos variables, desgaste del robot ni fallos de sensores.
- Riesgo de sobreajuste a la réplica local: los tiempos declarados provienen de una réplica local y no de un despliegue amplio en hardware diverso.
- Sin benchmarks estándar ni métricas de éxito más allá del tiempo de tarea; no hay información sobre estabilidad o tasa de fallos.
- No es un modelo de lenguaje: no debe evaluarse con métricas de MMLU, HumanEval o GSM8K ni utilizarse para tareas de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-gin-sock-c17
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl`, rama `talent-3`, commit `debcfcae0` (sin URL directa en la información disponible)
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon (sin URL directa en la información disponible)

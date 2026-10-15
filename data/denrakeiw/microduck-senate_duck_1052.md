# DenRakEiw/microduck-senate_duck_1052

## Resumen

`DenRakEiw/microduck-senate_duck_1052` es una política de control (policy) de aprendizaje por refuerzo para el robot bípedo microduck de Pollen Robotics, publicada en HuggingFace por el usuario DenRakEiw. No es un modelo de lenguaje ni de visión: es un controlador de locomoción que ocupa el slot `walk` del daemon del robot y define una marcha perpetua, es decir, se ejecuta de forma continua hasta que se le indique lo contrario.

Según la model card del autor, se trata de una política de "2 m Roller Sprint" en modo carrera, afinada mediante estrategias de evolución (evolution strategies) sobre el sistema de puntuación de rollers de la Arena. El modelo consume observaciones de 61 dimensiones y produce 14 acciones a 50 Hz, lo que fija un periodo de control de 20 ms.

Su relevancia es doble: por un lado, es un ejemplo de política RL exportada a ONNX lista para desplegar en hardware real mediante el comando `robotctl policy load walk`; por otro, forma parte de una familia de políticas del mismo autor (existen variantes como `microduck-senate_duck_1592` y `microduck-senate_duck_1056`) que permiten comparar distintas gaitas sobre el mismo robot. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se declara licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (política de aprendizaje por refuerzo exportada a ONNX; la model card no especifica la topología de red) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica |
| Licencia | No disponible |
| Formato de pesos | ONNX (`policy.onnx`), acompañado de `manifest.json` (schema 2 del manifiesto de políticas de microduck) |
| Tipo de modelo | Política de control robótico (reinforcement learning) |
| Observaciones de entrada | 61 dimensiones (se alimentan sin normalizar: el normalizador está embebido en `policy.onnx`) |
| Acciones de salida | 14 |
| Frecuencia de control | 50 Hz (periodo de 20 ms) |
| Slot del daemon | `walk` |
| Comportamiento | Perpetuo (se ejecuta hasta recibir orden de parada) |
| Superficie de entrenamiento | Rollers |
| Librería | `microduck` |
| Pipeline | `robotics` |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-14 |
| Fecha de actualizacion | 2026-10-14 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura de red de la política: la model card únicamente indica que es una política de RL afinada mediante estrategias de evolución (evolution strategies) sobre el sistema de puntuación de rollers de la Arena, dentro de un modo carrera de 2 metros. El modelo se distribuye exclusivamente como artefacto ONNX, con el normalizador de observaciones embebido en el propio grafo, de modo que la entrada debe ser la observación cruda de 61 dimensiones y no una versión preprocesada. El manifiesto `manifest.json` sigue el schema 2 descrito en `docs/policy-manifest.md` del repositorio del daemon.

El entrenamiento se realizó en el repositorio `pollen-robotics/microduck_rl`, rama `denrakeiw`, commit `8dafac487`. No se especifican en la información proporcionada el número de tokens o pasos de entrenamiento, la composición del dataset, el simulador empleado, ni si hubo fases adicionales de ajuste más allá del proceso de evolución citado. Tampoco se documenta ninguna innovación técnica concreta (decodificación especulativa, atención lineal u otras), ya que el modelo no es generativo.

## Capacidades

- Generación de marcha bípeda perpetua para el robot microduck en el slot `walk`, con ejecución continua hasta que se detenga explícitamente.
- Control en bucle cerrado a 50 Hz a partir de observaciones de 61 dimensiones y salida de 14 acciones.
- Desplazamiento sobre rollers, con comportamiento optimizado para el modo carrera de 2 metros y el sistema de puntuación de la Arena.
- Inferencia autocontenida: el normalizador de observaciones está embebido en `policy.onnx`, por lo que no requiere etapas de preprocesado externas.
- Integración directa con el daemon del robot mediante `robotctl policy load walk`.
- Distribución portable en formato ONNX, ejecutable mediante runtimes compatibles.
- No se documentan capacidades de tool calling, agentes, multilingüismo, visión, audio, modo de razonamiento ni generación de texto, puesto que no es un modelo de lenguaje.

## Casos de uso

- Control de locomoción del microduck: cargar la política en el slot `walk` con `sudo robotctl policy load walk DenRakEiw/microduck-senate_duck_1052` para que el robot mantenga una marcha continua durante sesiones de operación prolongada.
- Competición en la Arena sobre rollers: la política está afinada específicamente para el modo carrera de 2 metros y el scorer de rollers, por lo que es adecuada para pruebas cronometradas en esa superficie.
- Reproducción de experimentos de RL: el repositorio `pollen-robotics/microduck_rl` en la rama `denrakeiw` y el commit `8dafac487` permiten reconstruir el pipeline de entrenamiento y auditar la política publicada.
- Comparativa de gaitas dentro de la misma familia: al existir variantes como `microduck-senate_duck_1592` y `microduck-senate_duck_1056` que ocupan el mismo tipo de slot, esta política sirve como punto de referencia en experimentos A/B de locomoción.
- Investigación en sim2real: la exportación a ONNX con normalizador embebido simplifica el traslado de una política entrenada en simulación a hardware real, y permite medir la brecha de rendimiento entre ambos entornos.
- Desarrollo y validación de software de control: útil como carga de trabajo de prueba para verificar el daemon, el sistema de manifiestos schema 2 y el comando `robotctl` en pipelines de integración.
- Docencia y talleres de robótica: el microduck es un bípedo compacto y abierto, y esta política permite ilustrar el ciclo completo observación-acción de un controlador RL sin necesidad de entrenar desde cero.
- Investigación en locomoción de robots ligeros: el microduck es un bípedo de 725 g, de modo que la política resulta relevante para estudiar control de bajo coste computacional y peso reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card menciona un modo carrera de 2 metros y el uso del scorer de rollers de la Arena como criterio de entrenamiento, pero no se aportan puntuaciones, tiempos, métricas de recompensa ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 0,0 GB, lo que sugiere un artefacto ONNX de tamaño muy reducido, pero no se publica el recuento de parámetros ni el tamaño exacto del fichero.
- GPU recomendadas: no disponibles. Al ser una política exportada a ONNX de un bípedo compacto, es razonable esperar inferencia en CPU, pero el dato no está confirmado en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible. No se documenta si se ha probado en RTX 4090, RTX 3090 u otras GPU de consumo.
- Restricción temporal: el control se ejecuta a 50 Hz, lo que exige completar cada inferencia en menos de 20 ms para no perder el ciclo de control.
- Opciones de despliegue: daemon de microduck mediante `robotctl`, sobre `policy.onnx`; también es viable cualquier runtime compatible con ONNX (por ejemplo, ONNX Runtime) siempre que se respeten los contratos de 61 entradas y 14 salidas.
- Latencia y throughput: no disponibles de forma explícita; el único requisito documentado es el periodo de control de 20 ms derivado de los 50 Hz.
- Se recomienda verificar la versión de ONNX Runtime y el soporte de operadores antes de desplegar, aunque este extremo no se detalla en la model card.

## Comparativa con modelos similares

| Modelo | Tipo | Observaciones / acciones | Frecuencia | Slot | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| `DenRakEiw/microduck-senate_duck_1052` | Política RL (rollers, sprint 2 m) | 61 / 14 | 50 Hz | `walk` | ONNX + manifest.json | No disponible | HuggingFace, 0 descargas |
| `DenRakEiw/microduck-senate_duck_1592` | Política RL para microduck | No disponible | No disponible | No disponible | No disponible | No disponible | HuggingFace |
| `DenRakEiw/microduck-senate_duck_1056` | Política RL para microduck | No disponible | No disponible | No disponible | No disponible | No disponible | HuggingFace (detectado por SAVRN el 14 Oct 2026) |

No se dispone de datos de benchmarks ni de especificaciones detalladas de las variantes `1592` y `1056` que permitan una comparación cuantitativa. Para el resto de políticas de locomoción bípeda de código abierto, no se ha encontrado información comparable en los resultados de búsqueda disponibles.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica ningún tipo de licencia, por lo que el uso comercial y la redistribución quedan en un limbo legal y deben aclararse con el autor antes de cualquier despliegue en producción.
- Ausencia de benchmarks: no hay métricas publicadas de recompensa, velocidad, estabilidad ni tasa de caídas, lo que impide estimar su fiabilidad real.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, y actualización el mismo día de la creación, lo que apunta a un artefacto sin validación externa.
- Sesgo de superficie: el entrenamiento se realizó sobre rollers y para un modo carrera de 2 metros; el comportamiento sobre otras superficies o terrenos no está documentado y podría degradarse.
- Riesgo de sim2real: no se documenta el simulador utilizado ni pruebas en hardware físico, por lo que la transferencia a un robot real no está garantizada.
- Sin datos de composición de entrenamiento: se desconoce el volumen de datos, la distribución de escenarios y si hubo ajuste adicional, lo que dificulta evaluar la robustez.
- Entrada estricta: la política espera observaciones crudas de 61 dimensiones porque el normalizador está embebido en el grafo ONNX; alimentarla con datos ya normalizados alteraría el comportamiento.
- Compatibilidad atada al ecosistema microduck: el manifiesto sigue el schema 2 del daemon, de modo que cualquier cambio de versión en el daemon puede romper la carga de la política.
- Comportamiento perpetuo: al ejecutarse hasta recibir orden de parada, requiere lógica de supervisión y parada de seguridad en el sistema anfitrión.
- Fechas de publicación anómalas (octubre de 2026): conviene verificar la integridad y vigencia del artefacto antes de usarlo como referencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DenRakEiw/microduck-senate_duck_1052
- Variante de la misma familia: https://huggingface.co/DenRakEiw/microduck-senate_duck_1592
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Tutorial de montaje y software del microduck: https://github.com/AI-FanGe/Microduck-build-tutorial
- Documentación del bípedo de 725 g: https://duck.microzoo.ai/
- Índice de seguimiento de modelos que detectó el repositorio: https://savrn.com/model-tracker
- Repositorio de entrenamiento citado en la model card: `pollen-robotics/microduck_rl`, rama `denrakeiw`, commit `8dafac487` (no se proporciona URL directa)

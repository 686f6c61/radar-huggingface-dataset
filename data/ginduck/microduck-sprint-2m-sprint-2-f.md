# GinDuck/microduck-sprint-2m-sprint-2-f

## Resumen

sprint-2m-sprint-2-f es una política de control motriz entrenada mediante aprendizaje por refuerzo para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No se trata de un modelo de lenguaje, sino de un checkpoint de una política de locomoción que se ejecuta en el robot a 50 Hz y genera 14 acciones de control a partir de una observación de 61 dimensiones. El autor del checkpoint es el usuario GinDuck, que lo publica como parte de su segunda tanda de entrenamientos ("sprint") orientada a maximizar la velocidad de desplazamiento.

El modelo se distribuye como un fichero ONNX (`policy.onnx`) con el normalizador de observaciones ya integrado, junto con un `manifest.json` conforme al esquema 2 del manifiesto de políticas del demonio microduck. La política es de tipo "perpetuo": una vez cargada en una ranura de política del robot, se ejecuta de forma continua como una marcha hasta que se le indica lo contrario. Según la model card, completa cada carrera en aproximadamente 1,2 segundos.

La relevancia de esta ficha es acotada: se trata de un artefacto experimental de robótica con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y sin información sobre idiomas ni benchmarks. Es útil como ejemplo de flujo de entrenamiento con mjlab y como política reproducible (no bit a bit) para el ecosistema microduck, pero no debe evaluarse con los criterios habituales de un modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de control entrenada con aprendizaje por refuerzo (mjlab); arquitectura de red no detallada en la información disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; observación de 61 dimensiones por paso |
| Tipos de cuantizacion | no disponible (se distribuye como ONNX) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` (esquema 2) |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |
| Tipo de politica | Perpetua (marcha continua hasta detenerla) |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

La política se entrena con mjlab, el entorno de entrenamiento de aprendizaje por refuerzo basado en MuJoCo para el microduck, dentro del repositorio `microduck-challenges` (rama `race-2`, commit `b44f7ffc9`). El entrenamiento se lanzó el 2 de noviembre de 2026 con 4096 entornos paralelos, un máximo de 3000 iteraciones, semilla 1 y registro en TensorBoard bajo el nombre de ejecución `sprint-2`, partiendo de la base `mjlab-microduck 0.1.0 @ 1efd853be`. El checkpoint publicado corresponde a la iteración 1750.

La receta de entrenamiento es compartida por el usuario TheSauceman y está orientada a velocidad bruta y a "inclinarse hacia la carrera". El autor advierte explícitamente que el entrenamiento no es reproducible bit a bit entre máquinas: repetir el mismo código, `uv.lock`, comando y semilla produce una política comparable, pero no idénticos pesos. El normalizador de observaciones está embebido en `policy.onnx`, de modo que el robot debe alimentar observaciones en crudo. No se detalla en la información disponible la topología de la red, el número de tokens de entrenamiento (no aplica) ni si hubo fases de ajuste fino adicionales.

## Capacidades

- Locomoción cuadrúpeda continua a 50 Hz sobre el robot microduck, con 61 entradas de observación y 14 salidas de acción.
- Ejecución de una marcha de tipo "sprint" orientada a velocidad, con carreras de aproximadamente 1,2 segundos según la model card.
- Comportamiento perpetuo: la política se mantiene activa hasta que se detiene o se sustituye por otra.
- Normalización de observaciones integrada en el propio grafo ONNX, lo que simplifica la integración en el demonio del robot.
- Carga directa en una ranura de política mediante `robotctl policy load <slot> GinDuck/microduck-sprint-2m-sprint-2-f`.
- Compatibilidad con el manifiesto de políticas del daemon microduck (esquema 2).
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües, visión, audio ni modo de pensamiento: no es un modelo generativo.

## Casos de uso

- Demostración de locomoción rápida en microduck: cargar la política en una ranura y ejecutar una marcha de sprint para exhibir el comportamiento entrenado en vídeos o demostraciones de laboratorio.
- Prueba de integración del pipeline `robotctl`: usar este checkpoint como política de prueba para validar la carga, el manifiesto de esquema 2 y el flujo de observaciones en crudo con el normalizador embebido.
- Referencia de receta de entrenamiento: servir como punto de partida reproducible (no bit a bit) para equipos que quieran replicar el comando de entrenamiento con 4096 entornos y semilla 1 en mjlab.
- Comparación de checkpoints: contrastar la iteración 1750 de esta política con otros checkpoints de la misma tanda para estudiar la evolución del rendimiento en velocidad.
- Benchmark interno de carrera: utilizar la política como línea base en la tarea `Mjlab-Sprint2m-MicroDuck` de la rama `race-2` para medir tiempos de recorrido.
- Investigación en aprendizaje por refuerzo aplicado a robótica: analizar el efecto de la receta de TheSauceman y de la semilla en la variabilidad de políticas comparables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única métrica aportada por el autor es que la política completa cada carrera en aproximadamente 1,2 segundos, sin especificar la longitud del recorrido ni las condiciones de medida.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,0 GB y la política se ejecuta como ONNX en el propio robot, no como un modelo de gran tamaño en GPU.
- GPU recomendadas: no aplica para inferencia en el robot; el entrenamiento se realizó con aprendizaje por refuerzo en GPU (modelo no especificado en la información disponible).
- Compatibilidad con GPU de consumo: no disponible para entrenamiento; para inferencia, el cómputo se realiza en el hardware del microduck.
- Opciones de despliegue: demonio microduck con `robotctl policy load`; el artefacto es un `policy.onnx` compatible con el manifiesto de esquema 2.
- Latencia y throughput: control a 50 Hz (periodo de 20 ms por paso); no se dispone de cifras de latencia adicionales.

## Comparativa con modelos similares

| Modelo | Tipo | Observacion / accion | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GinDuck/microduck-sprint-2m-sprint-2-f | Política RL para microduck (ONNX) | 61 / 14 | 50 Hz | no disponible | Hugging Face, 0 descargas |
| Otros checkpoints de la tanda "sprint" de GinDuck | Política RL para microduck | no disponible | no disponible | no disponible | no disponible en la información proporcionada |
| Políticas de referencia de `microduck-challenges` | Política RL para microduck | no disponible | no disponible | no disponible | Repositorio GitHub de Pollen Robotics |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no procesa texto, no razona y no admite instrucciones en lenguaje natural.
- Licencia no declarada: no se puede asumir permiso para uso comercial ni para redistribución; es necesario contactar con el autor antes de cualquier uso en producción.
- Sin información sobre sesgos, alucinación o limitaciones idiomáticas, porque no aplican a este tipo de artefacto.
- El entrenamiento no es reproducible bit a bit: mismos comandos y semilla producen políticas comparables, no idénticos pesos.
- El rendimiento está acotado a la tarea `Mjlab-Sprint2m-MicroDuck` y a la morfología concreta del microduck; no es transferible sin reentrenamiento.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por parte de terceros.
- La política es perpetua: requiere un mecanismo explícito para detenerla o sustituirla en el robot.
- El autor no documenta el número de parámetros de la red ni la topología, lo que dificulta estimar requisitos de cómputo en el robot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-sprint-2m-sprint-2-f
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Documentación del manifiesto de políticas: `docs/policy-manifest.md` en el repositorio del daemon microduck (referenciado en la model card)

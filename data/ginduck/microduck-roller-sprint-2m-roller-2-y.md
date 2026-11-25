# GinDuck/microduck-roller-sprint-2m-roller-2-y

## Resumen

`GinDuck/microduck-roller-sprint-2m-roller-2-y` es una política de control por refuerzo (reinforcement learning) entrenada para el robot cuadrúpedo de código abierto microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje ni un sistema generativo de propósito general: es un checkpoint de política que mapea observaciones de 61 dimensiones a 14 acciones de control a 50 Hz, pensado para ejecutarse sobre patines (rollers) y producir una marcha de tipo sprint. El autor del checkpoint es el usuario GinDuck, y se distribuye como un artefacto ONNX autocontenido con un manifiesto de política asociado.

El modelo resuelve un problema muy concreto: dotar al microduck de una política perpetua de locomoción rápida sobre ruedas, que se ejecuta de forma continua hasta que el operador la detiene o carga otra política en la ranura correspondiente. Según la model card, en las pruebas del autor completa el recorrido en aproximadamente 1,6 segundos, lo que lo sitúa como una variante orientada a velocidad frente a ejecuciones anteriores centradas en patinaje.

Su relevancia es acotada pero clara dentro del ecosistema de robótica open source: forma parte de la segunda tanda de entrenamientos del autor ("roller run"), utiliza una receta compartida por TheSauceman y se apoya en el framework `mjlab` y en el repositorio de retos de microduck de Pollen Robotics. No hay información sobre arquitectura de red neuronal, número de parámetros ni contexto, porque no aplica en el sentido habitual de los modelos de lenguaje.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política de reinforcement learning exportada a ONNX (topología de red no disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control; observación de 61 dimensiones por paso) |
| Tipos de cuantización | no disponible (se distribuye como `policy.onnx`) |
| Idiomas soportados | no aplica (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) más `manifest.json` (schema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La información disponible no detalla la topología de la red (número de capas, tipo de red —MLP, recurrente u otra—, ni número de parámetros). Lo que sí se especifica es la interfaz de la política: observación de 61 dimensiones, 14 acciones, frecuencia de control de 50 Hz, ejecución sobre rollers y comportamiento perpetuo (la política se ejecuta de forma continua hasta recibir una orden en contra). El normalizador de observaciones está integrado dentro de `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo.

El entrenamiento se realizó con `mjlab` (versión base `mjlab-microduck 0.1.0 @ 1efd853be`), sobre el repositorio `pollen-robotics/microduck-challenges`, rama `race-2`, commit `b44f7ffc9`, con `task_id` `Mjlab-RollerSprint2m-MicroDuck`, checkpoint 2000 y semilla 1. La receta de entrenamiento es compartida por TheSauceman. El comando de reproducción usa 2048 entornos paralelos, hasta 6000 iteraciones del agente, logger de TensorBoard y nombre de ejecución `roller-2`. El autor advierte explícitamente que el entrenamiento por refuerzo en GPU no es bit-reproducible entre máquinas: repetir la receta produce una política comparable, no los mismos pesos.

## Capacidades

- Locomoción bípeda/cuadrúpeda sobre rollers con marcha de tipo sprint, orientada a velocidad.
- Control reactivo a 50 Hz a partir de observaciones de 61 dimensiones.
- Política perpetua: se ejecuta de forma continua hasta que se detiene o se sustituye.
- Integración directa con el demonio de control del microduck mediante `robotctl policy load <slot> <repo>`.
- Inferencia autocontenida en ONNX, con normalización de observaciones incluida en el grafo.
- Reproducibilidad parcial del pipeline de entrenamiento (mismo código, `uv.lock`, comando y semilla).
- No dispone de tool calling, razonamiento multi-paso, capacidades multilingües, visión ni audio, por su naturaleza de política de control.

## Casos de uso

- Carreras y competiciones de microduck: la política está entrenada específicamente para una tarea de sprint (`RollerSprint2m`) y encaja en las pruebas cronometradas de la Arena y las copas del ecosistema QuackPack.
- Demostraciones de locomoción rápida sobre ruedas: sirve para exhibir el comportamiento de sprint del robot en vídeos o presentaciones, con una referencia de ~1,6 s en las pruebas del autor.
- Benchmarking de políticas: al estar publicada con commit, semilla y comando exactos, permite comparar contra otras políticas de la misma rama `race-2` o de recetas alternativas.
- Investigación en RL aplicado a robótica: útil como checkpoint de referencia para estudiar la transferencia de políticas entrenadas en simulación (`mjlab`) al robot físico.
- Desarrollo de infraestructura de despliegue: el formato ONNX con normalizador embebido y el manifiesto schema 2 lo convierten en una pieza de prueba para validar el cargador de políticas del demonio microduck.
- Docencia y talleres: permite ilustrar el ciclo completo de entrenamiento, exportación y despliegue de una política de control en un robot de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento aportado por el autor es que la política completa el recorrido en aproximadamente 1,6 segundos en sus propias pruebas, sin especificar condiciones de medida, hardware ni metodología.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,0 GB, lo que sugiere un artefacto ONNX muy pequeño, pero no se confirma el número de parámetros.
- GPU recomendadas: no disponible. Al ejecutarse en el propio robot microduck, la inferencia se realiza presumiblemente en la computadora embebida del robot, no en una GPU de servidor.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: `robotctl policy load <slot> GinDuck/microduck-roller-sprint-2m-roller-2-y` sobre el demonio de microduck; el artefacto es un `policy.onnx` que puede ejecutarse con cualquier runtime compatible con ONNX.
- Latencia y throughput: no disponibles; la frecuencia de control es de 50 Hz por diseño.

## Comparativa con modelos similares

| Modelo | Tipo | Observaciones | Acciones | Frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| microduck-roller-sprint-2m-roller-2-y (este) | Política RL sobre rollers (sprint) | 61 dims | 14 | 50 Hz | no disponible | Hugging Face |
| Otras políticas de la rama `race-2` de microduck-challenges | Políticas RL de carreras | no disponible | no disponible | no disponible | no disponible | Repositorio de retos |
| Políticas anteriores del mismo autor ("roller run" previo, con patinaje) | Políticas RL sobre rollers | no disponible | no disponible | no disponible | no disponible | No referenciadas en la información disponible |

No se dispone de datos de parámetros, contexto ni rendimiento comparativo de las alternativas, por lo que la comparación cuantitativa no es posible con la información proporcionada.

## Limitaciones y advertencias

- No se especifica licencia: no hay garantía de permisos para uso comercial, redistribución o modificación. Es imprescindible contactar con el autor antes de cualquier uso en producción.
- El autor indica que el entrenamiento no es bit-reproducible: los pesos no pueden regenerarse exactamente, solo obtenerse políticas comparables.
- El dato de ~1,6 s procede de las pruebas del propio autor, sin metodología publicada ni condiciones de hardware detalladas; debe tratarse como una referencia no verificada de forma independiente.
- Política especializada en una única tarea (sprint sobre rollers): no es un modelo de propósito general y no debe esperarse generalización a otras tareas, terrenos o configuraciones del robot.
- Al ser una política de control físico, existe riesgo de comportamiento inseguro o inestable en el robot real si las condiciones de observación difieren de las del entrenamiento; se recomienda validación en entorno controlado.
- No hay información sobre sesgos, alucinación ni limitaciones idiomáticas, ya que no es un modelo de lenguaje.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño de 0,0 GB no permite inferir el contenido exacto; conviene inspeccionar los ficheros antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GinDuck/microduck-roller-sprint-2m-roller-2-y
- Repositorio microduck (Pollen Robotics): https://github.com/pollen-robotics/microduck
- Repositorio de retos microduck: https://github.com/pollen-robotics/microduck-challenges
- Documentación del manifiesto de políticas (`docs/policy-manifest.md` en el repositorio del demonio): no disponible como enlace directo en la información proporcionada
- QuackPack (seguimiento de carreras y copas en iPhone): https://www.imundo.ch/quackpack/

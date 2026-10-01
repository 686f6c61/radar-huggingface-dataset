# pollen-robotics/microduck-got-a-talent-reference

## Resumen

microduck-got-a-talent-reference es una politica de control para el robot MicroDuck desarrollada por Pollen Robotics y publicada en HuggingFace. No es un modelo de lenguaje: se trata de un checkpoint de aprendizaje por refuerzo que implementa una marcha (gait) para el slot `sitstand`, es decir, el robot se sienta y se levanta ante la bandera `sit` y mueve la cabeza bajo comando. El artefacto se publica como `policy.onnx` con un `manifest.json` que sigue el esquema 2 del manifiesto de politicas de microduck.

El modelo opera a 50 Hz, consume una observacion de 61 dimensiones por paso y emite 14 acciones. La politica es perpetua: se ejecuta de forma continua hasta que se le indique lo contrario. El normalizador de observaciones esta integrado dentro del propio ONNX, de modo que el daemon del robot puede alimentar observaciones en crudo sin preprocesado adicional.

Corresponde al checkpoint 2000 de un entrenamiento realizado con mjlab (base `mjlab-microduck 0.1.0`), lanzado el 29 de septiembre de 2026 con semilla 1 y 4096 entornos paralelos. La model card lo presenta explicitamente como la referencia del reto "MicroDuck Got a Talent", lo que lo situa como linea base reproducible mas que como un modelo de produccion. El repositorio no registra descargas ni valoraciones todavia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Es una politica de control entrenada con aprendizaje por refuerzo; la model card no especifica la topologia de la red |
| Parametros totales | No disponible (tamano del repositorio en HuggingFace: 0.0 GB) |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | No disponible. No aplica: no es un modelo de lenguaje; la politica consume una observacion de 61 dimensiones en cada paso de control |
| Tipos de cuantizacion | No disponible (se distribuye unicamente en formato ONNX) |
| Idiomas soportados | No disponible. No aplica: no procesa texto ni voz |
| Licencia | No disponible: la model card no declara licencia |
| Formato de pesos | ONNX (`policy.onnx`) acompanado de `manifest.json` (esquema 2 del manifiesto de politicas de microduck) |
| Observacion de entrada | 61 dimensiones por paso; normalizador incluido dentro del ONNX |
| Acciones de salida | 14 |
| Frecuencia de control | 50 Hz |
| Slot / comportamiento | `sitstand`; politica perpetua: sentarse y levantarse ante la bandera `sit` y control de cabeza bajo comando |
| Framework de entrenamiento | mjlab (`mjlab-microduck 0.1.0`, commit `981a279c6`) |
| Checkpoint / semilla | Checkpoint 2000, semilla 1 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura de red. Lo que si se documenta es el procedimiento de entrenamiento: se utilizo mjlab sobre la base `mjlab-microduck 0.1.0` (commit `981a279c6`), dentro del repositorio `microduck-challenges` (rama `swag-stage`, commit `0f11bbdd9`), con el identificador de tarea `Mjlab-GotATalent-MicroDuck`. El entrenamiento se lanzo el 29 de septiembre de 2026 a las 13:22:42 UTC, con 4096 entornos paralelos, un maximo de 3000 iteraciones del agente, semilla 1 y registro en TensorBoard. El checkpoint publicado corresponde a la iteracion 2000.

No hay datos sobre volumen de muestras, composicion del dataset ni sobre tecnicas de ajuste tipo RLHF o DPO, que no aplican a este tipo de politica. El entrenamiento es completamente en simulacion y, segun la propia model card, no es reproducible bit a bit: repetir el mismo comando con la misma semilla produce una politica comparable, pero no identicos pesos, porque el aprendizaje por refuerzo con GPU no es determinista entre maquinas. La model card incluye un comando de reproduccion que, sin embargo, apunta a la tarea `Mjlab-SwagContest-MicroDuck`, distinta del `task_id` declarado en la seccion de entrenamiento.

## Capacidades

- Control de locomocion de baja dimension para el MicroDuck: 61 entradas de observacion y 14 salidas de accion a 50 Hz.
- Ejecucion del comportamiento `sitstand`: sentarse y levantarse ante la bandera `sit`.
- Control de la cabeza bajo comando.
- Politica perpetua: mantiene la ejecucion indefinidamente hasta que el daemon la detiene o la sustituye.
- Integracion lista para el daemon del robot: el normalizador de observaciones esta integrado en `policy.onnx`, por lo que se alimentan observaciones en crudo.
- Distribucion con manifiesto versionado (esquema 2), pensado para carga mediante `robotctl`.
- No soporta tool calling, function calling, razonamiento multi-paso, generacion de texto, vision ni capacidades multilingues: no es un modelo de lenguaje ni multimodal.

## Casos de uso

- Linea base de referencia para el reto "MicroDuck Got a Talent": permite a otros participantes comparar sus politicas del slot `sitstand` contra un checkpoint con semilla y commit documentados.
- Validacion de la cadena de despliegue: sirve para verificar de extremo a extremo el flujo `robotctl policy load sitstand ...` y el parseo del manifiesto en esquema 2 antes de desplegar politicas propias.
- Investigacion en aprendizaje por refuerzo: el comando de reproduccion con 4096 entornos, 3000 iteraciones y semilla 1 permite estudiar la variabilidad entre ejecuciones y la sensibilidad a la semilla en tareas de control de robots cuadrupedos pequenos.
- Pruebas de integracion de sensores y actuadores del MicroDuck: al consumir una observacion de 61 dimensiones y producir 14 acciones, es util para comprobar el cableado logico de sensores y la respuesta de los servos en el slot `sitstand`.
- Demostraciones y material didactico: el comportamiento de sentarse y levantarse ante una bandera es una tarea visualmente interpretable y adecuada para talleres de robotica y para explicar el ciclo observacion-accion a 50 Hz.
- Diagnostico del gap simulacion-realidad: comparar la ejecucion de esta politica en simulacion frente al robot fisico permite estimar cuanto se degrada una politica entrenada integramente en mjlab.
- Pruebas de robustez y de recuperacion postural: la secuencia de sentarse y levantarse es un escenario exigente para evaluar estabilidad y recuperacion ante perturbaciones externas (empujones, terreno irregular), siempre que se instrumente la prueba fuera del alcance documentado por la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye recompensas de evaluacion, tasas de exito, metricas de estabilidad, consumo de par ni resultados de transferencia simulacion-realidad. El unico dato cuantitativo de rendimiento documentado es el checkpoint utilizado (iteracion 2000 de un maximo de 3000) y la configuracion de entrenamiento (4096 entornos paralelos, semilla 1).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publica el tamano del archivo ONNX ni el numero de parametros.
- GPU recomendadas: no disponibles para inferencia. El despliegue documentado se realiza mediante el comando `sudo robotctl policy load sitstand pollen-robotics/microduck-got-a-talent-reference`, orientado al daemon del robot, lo que sugiere ejecucion en el ordenador de a bordo del MicroDuck, aunque la model card no especifica el hardware objetivo.
- Compatibilidad con GPU de consumo: no confirmada. El tamano del repositorio (0.0 GB) apunta a un artefacto muy pequeno, pero este dato no permite afirmar requisitos de memoria.
- Entrenamiento: requiere GPU. El comando de reproduccion usa 4096 entornos paralelos, pero no se especifica el modelo de GPU empleado ni el tiempo total de entrenamiento.
- Opciones de despliegue: `robotctl` a traves del daemon de microduck, y cualquier runtime capaz de ejecutar el `policy.onnx` con su normalizador integrado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles. El unico dato temporal conocido es la frecuencia de control de 50 Hz.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otras politicas del slot `sitstand` del MicroDuck ni checkpoints alternativos del mismo reto con los que comparar parametros, contexto, rendimiento o licencia. Tampoco se han encontrado en la busqueda web resultados relevantes: los enlaces recuperados corresponden a servicios de reparto de comida y a informacion sobre niveles de polen, sin relacion con Pollen Robotics ni con el robot MicroDuck.

## Limitaciones y advertencias

- Licencia no declarada: la model card no especifica condiciones de uso, por lo que el uso comercial queda en un limbo legal hasta que el autor lo aclare.
- Ausencia de validacion de la comunidad: cero descargas y cero valoraciones en el momento de la consulta.
- Sin benchmarks publicados: no hay forma de cuantificar la calidad o la robustez de la politica a partir de la informacion disponible.
- Gap simulacion-realidad: el entrenamiento es integramente en mjlab y no se documentan pruebas en el robot fisico ni metricas de transferencia.
- Especificidad de hardware: la politica esta ligada a la interfaz del MicroDuck (61 dimensiones de observacion y 14 acciones); no es reutilizable tal cual en otros robots sin reentrenamiento.
- Reproducibilidad limitada: el autor advierte que el entrenamiento no es bit a bit reproducible, de modo que una repeticion produce pesos distintos aunque comparables.
- Inconsistencia documental: el `task_id` de entrenamiento (`Mjlab-GotATalent-MicroDuck`) no coincide con la tarea indicada en el comando de reproduccion (`Mjlab-SwagContest-MicroDuck`), lo que puede complicar la reproduccion exacta.
- Metadatos anomalos: las fechas de creacion y actualizacion del repositorio (octubre de 2026) y la fecha de inicio del entrenamiento (septiembre de 2026) son posteriores a la fecha habitual de consulta, lo que conviene verificar antes de citarlas.
- Comportamiento perpetuo sin condicion de parada documentada: la politica se ejecuta hasta que se le indique lo contrario, por lo que el daemon debe gestionar explicitamente la detencion.
- Riesgo de alucinacion: no aplica, ya que no es un modelo generativo de lenguaje.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pollen-robotics/microduck-got-a-talent-reference
- Repositorio del robot MicroDuck: https://github.com/pollen-robotics/microduck
- Repositorio de retos y entrenamiento: https://github.com/pollen-robotics/microduck-challenges
- Rama de entrenamiento: `swag-stage`, commit `0f11bbdd9`
- Esquema del manifiesto de politicas: `docs/policy-manifest.md` en el repositorio del daemon de microduck (enlace directo no disponible en la informacion proporcionada)
- Base de entrenamiento: `mjlab-microduck 0.1.0`, commit `981a279c6` (enlace directo no disponible)
- Resultados de la busqueda web: sin enlaces relevantes; los resultados obtenidos tratan sobre reparto de comida y niveles de polen, sin relacion con el modelo.

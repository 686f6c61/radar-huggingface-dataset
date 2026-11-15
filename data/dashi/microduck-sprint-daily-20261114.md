# dashi/microduck-sprint-daily-20261114

## Resumen

`dashi/microduck-sprint-daily-20261114` es una política de control motor para el robot cuadrúpedo de bajo coste microduck, desarrollado por Pollen Robotics. No es un modelo de lenguaje: es una política de aprendizaje por refuerzo exportada a ONNX que genera comandos de locomocion a 50 Hz a partir de observaciones de 61 dimensiones y produce 14 acciones de control. Se publica bajo el pipeline `robotics` y la libreria `microduck`, y se carga directamente en el robot mediante el comando `robotctl`.

La política es una reentrada diaria («daily re-entry») del modelo `dashi/microduck-sprint-remix-r844`, que obtuvo una puntuacion de 0.844, y constituye un fine-tune del modelo `jrubiosainz/microduck-game-sprinter-remix3`. Esta disenada como política perpetua para el slot de marcha (`walk`): una vez cargada, el robot mantiene la marcha indefinidamente hasta que se le indique lo contrario.

El interes de esta ficha es limitado para el publico general de IA, ya que se trata de un artefacto de investigacion en robotica de refuerzo con cero descargas y cero likes en el momento de la consulta. El repositorio tiene un tamano de 0.0 GB, lo que sugiere que los pesos pueden no estar materializados o que el contenido es minimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de aprendizaje por refuerzo exportada a ONNX (no disponible el detalle de la red) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) y `manifest.json` (esquema 2 del manifiesto de políticas microduck) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de la red neuronal. Se sabe que la política consume observaciones de 61 dimensiones y emite 14 acciones a una frecuencia de 50 Hz, y que el normalizador de observaciones esta integrado dentro de `policy.onnx`, por lo que se deben alimentar observaciones en bruto. El artefacto se distribuye con un `manifest.json` que sigue el esquema 2 del manifiesto de políticas microduck, documentado en `docs/policy-manifest.md` del repositorio del daemon.

El entrenamiento se realizo con el repositorio `pollen-robotics/microduck_rl`, en la rama `roll-backward`, commit `83599404a`. Es un fine-tune del modelo `jrubiosainz/microduck-game-sprinter-remix3`, a su vez derivado de un remix del juego sprinter. La model card indica que es una «reentrada diaria» del modelo `dashi/microduck-sprint-remix-r844` con puntuacion 0.844, lo que sugiere un proceso de reentrenamiento o re-publicacion periodica. No se especifican el numero de tokens, la composicion del dataset, ni si se emplearon RLHF o DPO (tecnicas no aplicables a este tipo de política).

## Capacidades

- Locomocion cuadrupeda: genera una marcha perpetua para el slot `walk` del robot microduck.
- Control en tiempo real: emite 14 acciones de control a 50 Hz a partir de 61 observaciones.
- Normalizacion integrada: el normalizador de observaciones esta embebido en el ONNX, por lo que acepta observaciones en bruto.
- Ejecucion autonoma: la política corre de forma continua hasta que se le indique lo contrario.
- Despliegue en robot: se carga con `sudo robotctl policy load walk dashi/microduck-sprint-daily-20261114`.
- No dispone de tool calling, function calling, soporte de agentes, capacidades multilingues, vision, audio ni modo de razonamiento, al no ser un modelo de lenguaje.

## Casos de uso

- Locomocion de base en el microduck: cargar la política en el slot `walk` para que el robot mantenga una marcha estable durante sesiones de experimentacion en laboratorio.
- Pruebas de control en tiempo real: usar la política como referencia para validar la latencia y estabilidad del bucle de control a 50 Hz del daemon `robotctl`.
- Punto de partida para fine-tuning: al ser un fine-tune de `microduck-game-sprinter-remix3`, sirve como base para entrenar variantes de marcha con el repositorio `microduck_rl`.
- Comparacion de políticas: evaluar la puntuacion 0.844 heredada del modelo `microduck-sprint-remix-r844` frente a otras políticas del mismo slot.
- Demostraciones educativas: ilustrar el ciclo completo de entrenamiento por refuerzo, exportacion a ONNX y despliegue en un robot de bajo coste.
- Investigacion en reentradas periodicas: estudiar el efecto de reentrenamientos diarios sobre la estabilidad de una política de locomocion.

## Benchmarks y rendimiento

La unica metrica disponible es la puntuacion de 0.844 del modelo predecesor `dashi/microduck-sprint-remix-r844`, citada en la model card. No se han publicado resultados de benchmarks adicionales en la informacion disponible.

| Metrica | Valor |
|---|---|
| Puntuacion del predecesor (`microduck-sprint-remix-r844`) | 0.844 |
| Frecuencia de control | 50 Hz |
| Dimension de observacion | 61 |
| Dimension de accion | 14 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser una política de control exportada a ONNX, la huella es previsiblemente minima, pero no se publican cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por el tipo de artefacto (política de robot), es probable que se ejecute en CPU o en el propio robot, pero no se confirma.
- Opciones de despliegue: `robotctl` (carga directa en el robot microduck); el formato ONNX permite inferencia con ONNX Runtime, aunque no se documenta explicitamente.
- Latencia y throughput: 50 Hz de frecuencia de control segun la model card; no se publican cifras de latencia por inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `dashi/microduck-sprint-daily-20261114` | Política RL para microduck | no disponible | no aplica | 0.844 (predecesor) | no disponible | Hugging Face |
| `jrubiosainz/microduck-game-sprinter-remix3` | Política RL para microduck (modelo base) | no disponible | no aplica | no disponible | no disponible | Hugging Face |
| `dashi/microduck-sprint-remix-r844` | Política RL para microduck (predecesor) | no disponible | no aplica | 0.844 | no disponible | Hugging Face |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible contactar con el autor antes de cualquier despliegue en produccion.
- Idiomas no disponibles: irrelevante al no ser un modelo de lenguaje, pero indica que la model card no documenta este campo.
- Cero descargas y cero likes: no hay evidencia de uso o validacion por parte de la comunidad.
- Tamano del repo de 0.0 GB: puede indicar que los pesos no estan materializados o que el artefacto es minimo; conviene verificar la integridad de `policy.onnx` antes de cargarlo en el robot.
- Especifico del hardware: la política esta disenada para el microduck de Pollen Robotics y no es transferible a otros robots sin reentrenamiento.
- Sin datos de sesgos ni alucinacion: al no ser un modelo generativo, estos riesgos no aplican en el sentido habitual, pero si existe riesgo de comportamiento fisico impredecible en el robot.
- Informacion de entrenamiento incompleta: no se detallan hiperparametros, recompensas ni criterios de evaluacion, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dashi/microduck-sprint-daily-20261114
- Modelo base: https://huggingface.co/jrubiosainz/microduck-game-sprinter-remix3
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento RL: `pollen-robotics/microduck_rl` (rama `roll-backward`, commit `83599404a`)

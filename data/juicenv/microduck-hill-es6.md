# juicenv/microduck-hill-es6

## Resumen

`juicenv/microduck-hill-es6` es una politica de control (policy) para el robot microduck de Pollen Robotics, publicada en HuggingFace por el usuario juicenv. No es un modelo de lenguaje ni un modelo generativo de texto: es una red neuronal entrenada por aprendizaje por refuerzo que produce una marcha (gait) perpetua capaz de hacer que el robot ascienda una pendiente de 1,5 metros. El modelo consume una observacion de 61 dimensiones y emite 14 acciones a 50 Hz, y se distribuye en formato ONNX junto con un fichero `manifest.json`.

La politica es un fine-tune del modelo base `namenu/microduck-arena` (concretamente de la variante `strata-hill-he9`, que marca 0,816 s en el ascenso), refinada mediante estrategias de evolucion (evolution strategies) sobre el scorer de colina de Arena, alcanzando 0,812 s. El autor reconoce el trabajo de namenu como origen del modelo base.

Su relevancia radica en que ejemplifica el flujo de trabajo de robótica open source reproducible: un modelo base publicado abiertamente, un fine-tune derivado, y un artefacto ONNX listo para cargarse en un slot de politica del daemon del robot mediante `robotctl`. El tamano del repositorio reportado (0,0 GB) es coherente con una red de politica muy pequena, pensada para ejecutarse en el propio robot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de politica neuronal exportada a ONNX (detalle de capas no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (politica de control; observacion de 61 dimensiones sin ventana de contexto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | ONNX (`policy.onnx`) mas `manifest.json` (schema 2 del manifiesto de politicas de microduck) |
| Dimension de observacion | 61 |
| Dimension de acciones | 14 |
| Frecuencia de control | 50 Hz |
| Tarea | ascenso de una colina de 1,5 m (Hill Climb), politica perpetua |
| Modelo base | namenu/microduck-arena |
| Relacion con el modelo base | fine-tune |
| Robot objetivo | microduck (Pollen Robotics) |
| Biblioteca | microduck |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

El modelo es una politica de control entrenada por aprendizaje por refuerzo y refinada mediante estrategias de evolucion (evolution strategies) sobre el scorer de colina de Arena. Parte del modelo base `namenu/microduck-arena` (variante `strata-hill-he9`, con 0,816 s en el ascenso) y lo mejora hasta 0,812 s en la misma tarea. No se detalla en la informacion disponible el numero de parametros, el tipo exacto de red ni la composicion del dataset o del entorno de simulacion.

La politica resultante es de naturaleza perpetua: una vez cargada, se ejecuta de forma continua hasta que se le indique lo contrario, comportandose como una marcha estable. El normalizador de observaciones esta integrado dentro del propio fichero `policy.onnx`, de modo que el consumidor debe alimentar observaciones en crudo, sin normalizacion externa. El entrenamiento se realizo en el repositorio `pollen-robotics/microduck_rl`, rama `hannes-ft`, commit `3c0598cae`.

## Capacidades

- Generacion de una marcha perpetua de ascenso de colina para el robot microduck.
- Control de locomocion a partir de observaciones crudas de 61 dimensiones, sin preprocesado externo (normalizador embebido en el ONNX).
- Emision de 14 acciones de control a una frecuencia de 50 Hz.
- Ejecucion continua e indefinida ("runs until told otherwise"), apta como politica residente en un slot del daemon.
- Despliegue en robot mediante el comando `robotctl policy load <slot> juicenv/microduck-hill-es6`.
- No dispone de capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni agentes; es exclusivamente una politica motora.

## Casos de uso

- Locomocion de ascenso en pendiente: la politica permite al microduck subir una colina de 1,5 m de forma autonoma y continua, util como comportamiento base en demostraciones y pruebas de campo.
- Investigacion en aprendizaje por refuerzo: sirve como punto de partida o referencia para experimentos de fine-tune con estrategias de evolucion sobre un modelo base ya publicado.
- Comparacion de algoritmos de refinamiento: al existir una metrica clara (tiempo de ascenso), permite evaluar si una nueva tecnica mejora los 0,812 s del modelo.
- Base para remezclas y derivados: dado que es un remix de `namenu/microduck-arena`, otros autores pueden construir variantes para otras tareas o terrenos partiendo de el.
- Banco de pruebas de sim-to-real: al exportarse a ONNX con normalizador embebido, facilita trasladar una politica entrenada en simulacion al robot fisico.
- Docencia y formacion en robotica: un artefacto pequeno y autocontenido, cargable con un unico comando, resulta adecuado para ilustrar el ciclo completo de entrenamiento, exportacion y despliegue de politicas.
- Validacion de la cadena de despliegue de microduck: permite comprobar el funcionamiento del daemon y del sistema de manifiestos (schema 2) en un caso real.

## Benchmarks y rendimiento

| Tarea | Modelo base (strata-hill-he9) | microduck-hill-es6 |
|---|---|---|
| Ascenso de colina de 1,5 m (scorer de Arena) | 0,816 s | 0,812 s |

No se han publicado en la informacion disponible otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros), ya que no se trata de un modelo de lenguaje. La unica metrica reportada es el tiempo de ascenso de colina indicado arriba.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. La red de politica es muy pequena, coherente con un repositorio de 0,0 GB.
- GPU recomendadas: no disponible. No se especifica ningun requisito de GPU.
- Compatibilidad con GPU consumer: no disponible en la informacion proporcionada.
- Opciones de despliegue: la indicada en la model card es la carga en el robot mediante `robotctl policy load <slot> juicenv/microduck-hill-es6`, sobre el daemon de politicas de microduck. El artefacto es un fichero `policy.onnx`, por lo que es compatible con cualquier runtime de ONNX.
- Latencia y throughput estimados: no disponibles. La frecuencia de control del modelo es de 50 Hz (periodo de 20 ms por ciclo de accion).

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Resultado en ascenso de colina | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| juicenv/microduck-hill-es6 | Politica RL (ONNX) | Ascenso de colina 1,5 m | 0,812 s | no disponible | HuggingFace |
| namenu/microduck-arena (base) | Politica RL | Ascenso de colina 1,5 m (variante strata-hill-he9) | 0,816 s | no disponible | HuggingFace |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Ambito de aplicacion muy restringido: es una politica especifica de una tarea (ascenso de colina de 1,5 m) para un robot concreto (microduck); no es generalizable a otras tareas ni plataformas.
- Sin licencia declarada: no se especifica ninguna licencia, por lo que las condiciones de uso comercial son desconocidas y no pueden asumirse permisivas.
- Sin datos de idioma ni de sesgos: al no ser un modelo de lenguaje, no aplican sesgos linguisticos, pero tampoco hay informacion sobre sesgos de comportamiento en distintos entornos fisicos.
- Generalizacion incierta: no se documenta el comportamiento fuera del entorno de entrenamiento (terrenos distintos, pendientes de otra inclinacion, perturbaciones externas). El riesgo de fallo fuera de la distribucion de entrenamiento es desconocido.
- Dependencia del daemon y del manifiesto: la ejecucion correcta depende de respetar el schema 2 del manifiesto (`docs/policy-manifest.md` del repositorio del daemon) y de alimentar observaciones crudas, dado que el normalizador esta embebido.
- Sin actividad en la comunidad: el modelo registra 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validacion externa.
- Fechas de publicacion atipicas (2026-10-16) en los metadatos, lo que conviene contrastar antes de integrarlo en un flujo productivo.
- Sin informacion de hardware ni de rendimiento en tiempo real mas alla de la frecuencia de control de 50 Hz.

## Enlaces

- HuggingFace: https://huggingface.co/juicenv/microduck-hill-es6
- Modelo base: https://huggingface.co/namenu/microduck-arena
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl` (rama `hannes-ft`, commit `3c0598cae`) — referencia citada en la model card; no se proporciona URL directa en la informacion disponible.

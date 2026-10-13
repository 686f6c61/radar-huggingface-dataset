# juicenv/microduck-sprint-es2

## Resumen

Microduck-sprint-es2 es una politica de control para el robot cuadrupedo microduck de Pollen Robotics, publicada por el usuario juicenv en HuggingFace. No es un modelo de lenguaje, sino una politica de locomocion entrenada por aprendizaje por refuerzo (concretamente, por estrategias de evolucion) que produce una marcha de sprint de 2 metros. Parte del modelo HannesVonEssen/microduck-running (licencia Apache-2.0, iteracion 12195) como base y lo afina sobre el scorer de sprint de la propia Arena de microduck, en lo que el autor describe como segunda ronda.

La politica es perpetua: una vez cargada en una ranura de politica del robot, se ejecuta de forma continua hasta que se le indique lo contrario. Trabaja con una observacion de 61 dimensiones, emite 14 acciones y opera a 50 Hz. El normalizador de observaciones esta integrado dentro del propio fichero `policy.onnx`, de modo que el robot puede alimentar observaciones en crudo sin preprocesado adicional.

Su relevancia es acotada pero clara dentro del ecosistema microduck: se distribuye como un unico fichero ONNX mas un `manifest.json` conforme al esquema 2 del manifiesto de politicas del demonio de microduck, lo que permite cargarla en el robot con un solo comando. Al no tener descargas ni likes, y al no declarar licencia propia en la ficha, se trata de una contribucion experimental sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (politica de control para robot; observacion de 61 dimensiones, 14 acciones) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; politica perpetua ejecutada a 50 Hz) |
| Tipos de cuantizacion | no disponible (exportada a ONNX; el normalizador de observaciones va integrado en `policy.onnx`) |
| Idiomas soportados | no aplica (modelo de robotica, no procesa lenguaje) |
| Licencia | no disponible en la ficha de HuggingFace; el modelo base es Apache-2.0 |
| Formato de pesos | ONNX (`policy.onnx`) acompanado de `manifest.json` (esquema 2 del manifiesto de politicas de microduck) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna de la red (numero de capas, tipo de capas o numero de parametros). Lo que si se especifica es la interfaz de la politica: recibe un vector de observacion de 61 dimensiones, produce 14 acciones y se ejecuta a 50 Hz sobre el robot microduck. El normalizador de observaciones esta embebido en el fichero ONNX, de forma que el consumidor no necesita replicar esa transformacion por separado.

El entrenamiento parte de HannesVonEssen/microduck-running, un modelo base con licencia Apache-2.0 en su iteracion 12195, y se afina mediante estrategias de evolucion contra el scorer de sprint de la Arena (segunda ronda). El codigo de entrenamiento corresponde al repositorio `pollen-robotics/microduck_rl`, rama `lean`, commit `5a3636302`. No se indica el numero de tokens, episodios, generaciones ni la composicion del dataset, ni si se emplearon tecnicas adicionales como RLHF o DPO, que en este dominio no aplican.

## Capacidades

- Locomocion perpetua: la politica no tiene un horizonte de terminacion; se ejecuta de forma continua hasta que se descargue o se sustituya la ranura.
- Marcha de sprint de 2 metros: comportamiento afinado especificamente contra el scorer de sprint de la Arena de microduck.
- Control a 50 Hz con observacion de 61 dimensiones y salida de 14 acciones.
- Preprocesado integrado: el normalizador de observaciones va embebido en `policy.onnx`, por lo que acepta observaciones en crudo.
- Despliegue directo en robot: se carga en una ranura de politica mediante `robotctl policy load <slot> juicenv/microduck-sprint-es2`.
- Compatibilidad con el manifiesto de politicas de microduck en su esquema 2.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni capacidades multilingues: es exclusivamente una politica motora.

## Casos de uso

- Competicion en la Arena de microduck: cargar la politica en una ranura y ejecutar la prueba de sprint de 2 metros contra el scorer oficial, aprovechando que el afinamiento se hizo precisamente sobre ese criterio.
- Banco de pruebas de locomocion: usar la politica como referencia de "sprint" para comparar otras marchas (caminar, girar, recuperarse) sobre el mismo robot y el mismo hardware.
- Investigacion en estrategias de evolucion: al provenir de `microduck_rl` (rama `lean`), sirve como punto de partida reproducible para estudiar como el afinamiento evolutivo modifica una politica base de locomocion.
- Demostraciones educativas de robotica: un unico comando carga la politica en el robot, lo que simplifica talleres y sesiones practicas sin necesidad de reentrenar.
- Validacion de la cadena de despliegue ONNX: comprobar que el normalizador embebido y el manifiesto de esquema 2 funcionan correctamente en el demonio del robot.
- Pruebas de robustez fisica: ejecutar una marcha perpetua durante periodos largos para medir calentamiento de actuadores, consumo y deriva en el comportamiento.
- Punto de partida para nuevos afinamientos: al ser un derivado declarado del modelo base, puede reutilizarse como semilla para variantes de velocidad, direccion o terreno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el afinamiento se realizo contra el scorer de sprint de la Arena (segunda ronda), pero no incluye puntuaciones, tiempos ni comparaciones numericas con otras politicas.

## Requisitos de hardware

- VRAM estimada: no aplica; es una politica ONNX de robotica que se ejecuta en inferencia, no un modelo generativo de gran tamano.
- GPU recomendadas: no se especifica ninguna; no se requiere GPU.
- Compatibilidad con GPU de consumo: irrelevante para este caso de uso, ya que la inferencia esta pensada para el computo embebido del robot.
- Huella de almacenamiento: el repositorio ocupa 0.0 GB segun HuggingFace, lo que indica un peso muy reducido (un unico `policy.onnx` mas `manifest.json`).
- Opciones de despliegue: demonio de microduck mediante `robotctl` (`sudo robotctl policy load <slot> juicenv/microduck-sprint-es2`); el runtime subyacente es ONNX.
- Latencia y throughput: no disponible como cifra publicada. El unico requisito conocido es que la politica debe ejecutarse a 50 Hz, es decir, un presupuesto de 20 ms por ciclo de control.

## Comparativa con modelos similares

| Modelo | Tipo | Observacion / acciones | Frecuencia | Licencia | Relacion |
|---|---|---|---|---|---|
| juicenv/microduck-sprint-es2 | Politica de control (ONNX) | 61-D / 14 | 50 Hz | no disponible | Modelo analizado |
| HannesVonEssen/microduck-running | Politica de control | no disponible | no disponible | Apache-2.0 | Modelo base (iteracion 12195) del que deriva por afinamiento |

No se dispone de informacion sobre otras politicas comparables de la misma categoria (mismo robot o misma tarea de sprint) en los datos proporcionados.

## Limitaciones y advertencias

- Licencia propia no declarada: la ficha de HuggingFace no indica licencia. El modelo base es Apache-2.0, pero la licencia del derivado no se explicita, lo que supone un riesgo para uso comercial o redistribucion.
- Sin validacion comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia externa de funcionamiento correcto.
- Tarea muy especifica: esta afinada para un sprint de 2 metros; no hay garantia de que generalice a otras distancias, direcciones, terrenos u objetivos.
- Dependencia del hardware y del demonio: requiere un microduck y la version del daemon compatible con el esquema 2 del manifiesto de politicas.
- Dependencia del normalizador embebido: cualquier pipeline que no use `policy.onnx` tal cual debera respetar el normalizador interno o los resultados se degradaran.
- Ausencia de metricas: no se publican resultados del scorer de sprint, por lo que no se puede cuantificar la mejora frente al modelo base.
- Sin soporte de lenguaje, vision ni razonamiento: no debe evaluarse con criterios de modelos generativos.
- Riesgo de comportamiento no seguro en el robot fisico: una politica perpetua puede mantener la marcha indefinidamente; conviene supervisar la ejecucion y prever una parada manual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/juicenv/microduck-sprint-es2
- Modelo base: https://huggingface.co/HannesVonEssen/microduck-running
- Repositorio del robot microduck: https://github.com/pollen-robotics/microduck
- Repositorio de entrenamiento: `pollen-robotics/microduck_rl` (rama `lean`, commit `5a3636302`)
- Documentacion del manifiesto de politicas: `docs/policy-manifest.md` en el repositorio del daemon (referenciado en la model card)

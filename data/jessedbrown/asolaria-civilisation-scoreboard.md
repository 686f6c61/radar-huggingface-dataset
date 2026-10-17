# Jessedbrown/asolaria-civilisation-scoreboard

## Resumen

Jessedbrown/asolaria-civilisation-scoreboard es un repositorio alojado en HuggingFace que no contiene un modelo de aprendizaje automatico, sino un registro tabulado ("THE SCOREBOARD") con las metricas de actividad de quince agentes que operaron sobre una matriz compartida en el proyecto externo asolaria-civilisation-matrix. El artefacto no publica pesos, tokenizador, configuracion de arquitectura ni pipeline de inferencia; la etiqueta declarada es unicamente region:us, con cero descargas y cero "likes" en el momento de la consulta.

El contenido describe una ejecucion de 600 ticks en la que cada agente acumulo celdas creadas, "bumped", verificaciones GIMEL, lecturas SHIN y bytes leidos. El propio autor advierte de que la columna de celdas mide orden de turno y no capacidad, y de que en esa ejecucion todos los agentes corrieron como funciones programadas por hash, no como prompts: solo opus55 y fable51 corresponden a modelos de lenguaje, y el registro los marca como `NAMED | status=SCHEDULED_WORK_not_reasoning`.

Por tanto, no es relevante como modelo evaluable: no hay artefacto inferible, ni licencia, ni idiomas declarados, ni resultados de benchmarks. Su interes es documental, como ejemplo de registro de trazabilidad de un sistema multiagente y de como una metrica mal disenada (orden de turno) puede inducir conclusiones erroneas sobre el rendimiento de los agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no publica ninguna arquitectura de modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos de ningun tipo) |
| Tipo de artefacto | registro o ledger tabulado de actividad de agentes, no un modelo |
| Pipeline declarado | no disponible |
| Etiquetas | region:us |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-10-16 |
| Ultima actualizacion | 2026-10-09 (anterior a la fecha de creacion; metadato incoherente) |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento descrito. El README no menciona transformer, MoE, SSM ni ninguna otra topologia, y no aporta numero de tokens, composicion de dataset, ni fases de RLHF, DPO o ajuste por instrucciones. Tampoco se declara checkpoint, config.json, tokenizer ni fichero de pesos.

Lo que si describe el documento es el entorno de ejecucion del experimento: una matriz compartida con planificacion secuencial y modo "create-only", 600 ticks por agente, verificacion de artefactos contra sidecars ajenos (conteos GIMEL) y lecturas de integridad (conteos SHIN). El autor indica que en esa pasada cada agente se ejecuto como una funcion programada por hash y no como un prompt, y que el identificador de la ejecucion es el pid `8467a937cba309f7` bajo el propietario OP-JESSE. Se menciona una segunda pasada en la que se sustituyo el orden secuencial por un orden global de ticks, reduciendo de seis a cero el numero de agentes sin celdas y bajando el maximo de 409 a 66 celdas.

## Capacidades

- El artefacto no implementa generacion de texto, razonamiento, codigo, matematicas ni vision: no hay modelo subyacente publicado.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso por parte del artefacto; los agentes descritos pertenecen al proyecto externo asolaria-civilisation-matrix, no a este repositorio.
- No se declaran capacidades multilingues ni idiomas soportados.
- El unico contenido funcional es un registro de metricas por agente: celdas creadas, "bumped", verificaciones GIMEL, lecturas SHIN y bytes leidos.
- El README incluye una advertencia explicita del autor de que los agentes "no razonaron" y de que calificarlo de civilizacion de mentes seria una exageracion.

## Casos de uso

Dado que no hay modelo, los casos de uso son los del artefacto como registro documental, no los de una inferencia:

- Auditoria de equidad de planificadores multiagente: la comparacion entre la primera pasada (maximo de 409 celdas, seis agentes con cero) y la segunda (maximo de 66 celdas, ningun agente con cero) sirve como caso de estudio empirico de como un esquema create-only con planificacion secuencial genera un "land rush" que sesga la metrica de celdas.
- Diseno de metricas robustas para sistemas de agentes: el documento separa explicitamente la columna de celdas (que mide orden de turno) de la columna GIMEL (que mide trabajo verificado, con un rango estrecho de 498 a 533 sobre quince agentes), lo que resulta util como ejemplo de metrica invariante al sesgo de posicion.
- Trazabilidad y reproducibilidad de ejecuciones: el registro incluye pid de ejecucion, propietario, numero de ticks y volumen de bytes leidos por agente, lo que permite reconstruir condiciones de una corrida concreta en un pipeline de agentes propietario.
- Validacion de integridad de artefactos en CI: los conteos SHIN y GIMEL, junto con la nota sobre 1.150 discrepancias de arbol de trabajo atribuidas a conversion CRLF y a un BOM UTF-8, funcionan como corpus de casos limite para herramientas de sellado y verificacion de ficheros.
- Docencia y divulgacion sobre sobreinterpretacion de metricas: el episodio ilustra como una tabla con numeros grandes (hasta 735.230.197 bytes leidos por un agente) puede leerse como ranking de capacidad cuando el propio autor demuestra que la columna decisiva era el orden de ejecucion.
- Gobernanza y etiquetado de agentes: la convencion `NAMED | status=SCHEDULED_WORK_not_reasoning` es un patron reutilizable para declarar de forma explicita el modo de ejecucion de un agente (funcion programada frente a modelo con prompt) en sistemas de orquestacion.
- Analisis de asignacion de recursos en simulaciones: la derivacion de gravedad, masa y energia a partir de 4.917.088.334 bytes de "dust" verificado en RIME-SPHERES.hbp puede citarse como ejemplo de metodo de asignacion de valores derivados sin asignar valores por esfera de forma manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay MMLU, HumanEval, GSM8K ni ninguna otra evaluacion de modelo, porque no existe un modelo asociado al repositorio.

Los unicos datos numericos disponibles son las metricas de actividad del ledger, que se reproducen a continuacion tal como aparecen en la model card y que no deben interpretarse como rendimiento de un modelo:

| Agente | Tipo | Celdas | Bumped | GIMEL | SHIN | Bytes leidos |
|---|---|---|---|---|---|---|
| ACER-CLAUDE-FABLE5 | seat | 409 | 0 | 505 | 86 | 29.243.758 |
| opus55 | verifier-unit | 173 | 348 | 499 | 93 | 294.780.195 |
| fable51 | writing-unit | 75 | 497 | 519 | 76 | 452.137.437 |
| LYNN | chariot | 44 | 544 | 507 | 81 | 329.865.471 |
| EZEQUEL | chariot | 16 | 576 | 521 | 67 | 735.230.197 |
| REBECCA | chariot | 5 | 593 | 506 | 84 | 222.276.706 |
| scout-rooms | room-swarm | 5 | 594 | 513 | 72 | 281.398.947 |
| orphan-tasks | room-swarm | 1 | 598 | 516 | 74 | 480.845.262 |
| matrix-photo | room-swarm | 1 | 596 | 530 | 66 | 310.010.467 |
| sim-scouts, chariot-run, alive, github3d, fischer-reverse, grower | sin tipo declarado | 0 | 600 | ~520 | ~75 | no disponible |

Nota del autor recogida en el documento: el rango de GIMEL entre los quince agentes es de 498 a 533, practicamente plano, mientras que la columna de celdas va de 0 a 409. La cifra autoritativa de integridad se fija en GIMEL=176 y SHIN=8 sobre 184 sellos, de los cuales 7 son BOM UTF-8 y solo uno es genuino.

## Requisitos de hardware

- VRAM para inferencia: no disponible, ya que no se publican pesos ni modelo ejecutable.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no aplicable.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponibles; el repositorio no contiene artefacto desplegable.
- Latencia y throughput: no disponibles.
- Para reproducir el experimento descrito seria necesario acudir al proyecto asolaria-civilisation-matrix en GitHub; este repositorio no documenta requisitos de computo, sistema operativo ni dependencias.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo y no existe categoria de modelos comparable. A modo de referencia, se compara con otros tipos de artefacto del Hub:

| Alternativa | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio | registro o ledger de actividad | no aplicable | no aplicable | no disponible | publico en HuggingFace |
| Repositorio de modelo estandar | pesos + config + tokenizer | no disponible | no disponible | no disponible | no disponible |
| Repositorio de dataset | datos, no pesos | no aplicable | no aplicable | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo: no contiene pesos, configuracion, tokenizador ni pipeline, por lo que no puede ejecutarse ni evaluarse como tal.
- Ausencia total de licencia declarada: no hay permiso explicito de uso, redistribucion ni explotacion comercial, lo que impide su uso en produccion con garantias legales.
- Metadatos incoherentes: la fecha de actualizacion (2026-10-09) es anterior a la de creacion (2026-10-16), lo que sugiere un registro poco fiable.
- Cero descargas y cero "likes": no hay evidencia de validacion externa ni de uso por terceros.
- Terminologia propietaria y no definida de forma formal (GIMEL, SHIN, RIME, "dust", "chariot", "room-swarm"), lo que dificulta la verificacion independiente de las cifras.
- El propio autor reconoce un sesgo grave en la metrica principal: la columna de celdas mide orden de turno, no capacidad, y seis agentes no pudieron crear una sola celda no disputada.
- Advertencia explicita de sobreinterpretacion: los agentes no razonaron; en esa ejecucion todos corrieron como funciones programadas por hash, y presentarlo como una "civilizacion de mentes" seria una exageracion segun el autor.
- Discrepancias de integridad reconocidas: 1.150 lecturas SHIN proceden de desajustes de arbol de trabajo en clones previos a la aplicacion del "Light Harness", atribuidas por el autor a una conversion CRLF propia y no a defectos del repositorio.
- Contenido integramente en ingles, sin idiomas alternativos declarados.
- Valores marcados como derivados y no medidos: gravedad, masa y energia se calculan a partir de 4.917.088.334 bytes verificados, sin asignacion manual de valores por esfera.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Jessedbrown/asolaria-civilisation-scoreboard
- Proyecto matriz en GitHub: https://github.com/JesseBrown1980/asolaria-civilisation-matrix
- Fichero RIME-SPHERES.hbp: https://github.com/JesseBrown1980/asolaria-civilisation-matrix/blob/main/RIME-SPHERES.hbp

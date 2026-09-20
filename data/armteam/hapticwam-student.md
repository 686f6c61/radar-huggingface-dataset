# armteam/hapticwam-student

## Resumen

HapticWAM student es un modelo de politica robotica (pipeline `robotics`) publicado por el equipo `armteam`, concebido como el estudiante destilado del profesor HapticWAM. Su proposito es ejecutarse en el propio banco de manipulacion (el "rig") tomando entradas sin almohadillas tactiles en los dedos, de modo que no necesita los flujos tactiles de las puntas de los dedos en el momento de la inferencia. El checkpoint que el articulo despliega es `hid_simft/student_001000.pt`.

El repositorio no contiene un modelo de lenguaje ni un modelo fundacional multimodal: es un conjunto de checkpoints de destilacion acompanados de sus registros de entrenamiento y de sus evaluaciones. La model card organizada por carpetas: `hid_simft/` (el brazo desplegado, pasos 250, 500, 750 y 1000, destilado desde `teacher_v6_simft/teacher_002000.pt`), `hid_ftA_r2_nowrist/` y `hid_ftA_r2_nowrist_cont/` (la ablacion sin sensores de muneca, pasos 500-2000 y 2500-4000) y `eval/` con 24 ficheros de evaluacion JSON y log de exactamente esos checkpoints.

Su relevancia es acotada pero clara para quien trabaja en manipulacion tactil: documenta una receta de destilacion profesor-estudiante que elimina la dependencia de sensores tactiles de punta en produccion, e incluye un brazo de ablacion con el canal tactil de muneca enmascarado que sirve como control experimental. La licencia Apache-2.0 permite reutilizacion comercial. No se proporcionan recuentos de parametros, detalles de arquitectura ni resultados numericos de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no describe la arquitectura; se indica unicamente que es un estudiante destilado) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de politica robotica, no un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (solo se publican checkpoints PyTorch `.pt`, sin variantes cuantizadas) |
| Idiomas soportados | no aplica / no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch (`.pt`), almacenados en LFS; se incluye `index.jsonl` con tamano, sha256 de LFS y ruta de origen de cada fichero |

Datos adicionales del repositorio:

| Parametro | Valor |
|---|---|
| ID en HuggingFace | armteam/hapticwam-student |
| Pipeline declarado | robotics |
| Libreria | pytorch |
| Etiquetas | pytorch, robotics, tactile, manipulation, distillation |
| Tamano del repositorio | 4,5 GB |
| Descargas | 0 |
| Likes | 0 |
| Fecha de creacion | 2026-09-20 |
| Ultima actualizacion | 2026-09-20 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo. Lo unico documentado es el procedimiento: se trata de un estudiante obtenido por destilacion a partir de un profesor, `armteam/hapticwam-teacher`, concretamente del checkpoint `teacher_v6_simft/teacher_002000.pt` para el brazo desplegado. El estudiante acepta entradas sin almohadillas tactiles, de forma que en inferencia no requiere los flujos tactiles de las puntas de los dedos. Los registros de entrenamiento incluidos en el repositorio (`distill_A.log` y `extend_A.log` en `hid_simft/`) son la unica fuente primaria sobre el proceso de destilacion.

El repositorio contiene tres ramas de entrenamiento. La primera, `hid_simft/`, es la desplegada e incluye los pasos 250, 500, 750 y 1000 del estudiante. La segunda, `hid_ftA_r2_nowrist/`, es la ablacion sin sensores: la misma receta de destilacion con la entrada tactil de muneca enmascarada, con pasos de 500 a 2000 y log `stage4_nowrist.log`. La tercera, `hid_ftA_r2_nowrist_cont/`, continua esa ablacion con pasos de 2500 a 4000 y logs `cont_nowrist_b.log` y `stage5.log`. Segun la model card, las dos ramas `nowrist` se evaluaron en fuera de linea y nunca se ejecutaron en el banco de pruebas. Los datos de teleoperacion proceden de `armteam/hapticwam-teleop-dataset` (1.115 episodios, `manifests_v6.tar`), complementados con los rollouts de banco de `armteam/hapticwam-rollouts`.

## Capacidades

- Generacion de acciones de manipulacion robotica: es una politica entrenada para controlar un banco de manipulacion, no un modelo generativo de texto.
- Ejecucion sin tacto de punta de dedo: al ser "pad-free", la inferencia no depende de los flujos tactiles de las puntas, lo que simplifica el hardware sensorial necesario en el despliegue.
- Destilacion desde profesor: reproduce en un estudiante mas ligero el comportamiento aprendido de HapticWAM teacher.
- Variante ablacionada sin sensores de muneca: la rama `nowrist` permite evaluar el comportamiento con la entrada tactil de muneca enmascarada.
- Seleccion por pasos de entrenamiento: se publican puntos de control intermedios (250, 500, 750, 1000 y, en las ramas de ablacion, hasta 4000), lo que facilita analizar la evolucion del aprendizaje.
- Evaluacion offline reproducible: el directorio `eval/` incluye 24 ficheros JSON mas logs que puntuan exactamente los checkpoints del repositorio.
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingues, vision, audio y modo de razonamiento: no disponible / no aplica (no son capacidades de este tipo de modelo).

## Casos de uso

- Despliegue en el banco de manipulacion: usar `hid_simft/student_001000.pt` como politica de control en el rig, ya que es el checkpoint que el articulo despliega y el que sustenta todas las cifras principales.
- Sustitucion de un profesor pesado por un estudiante: cuando la latencia o los recursos del profesor HapticWAM resultan limitantes en el hardware del robot, el estudiante ofrece una alternativa destilada que conserva el comportamiento aprendido.
- Eliminacion de sensores tactiles de punta en produccion: en montajes donde instalar sensores en los dedos no es viable, el caracter pad-free del estudiante permite mantener la politica sin ese hardware.
- Estudio de ablacion sin sensores de muneca: las ramas `hid_ftA_r2_nowrist` y `hid_ftA_r2_nowrist_cont` sirven para cuantificar cuanto aporta la senal tactil de muneca al comparar sus evaluaciones con las del brazo desplegado.
- Investigacion en destilacion para robotica: los logs `distill_A.log`, `extend_A.log`, `stage4_nowrist.log`, `cont_nowrist_b.log` y `stage5.log` documentan el proceso paso a paso y sirven como material de partida para reproducir o variar la receta.
- Analisis de convergencia por escalones de entrenamiento: la publicacion de checkpoints en los pasos 250, 500, 750, 1000 (y hasta 4000 en las ramas de ablacion) permite trazar curvas de rendimiento frente al coste de entrenamiento usando los JSON de `eval/`.
- Verificacion de integridad de artefactos en un pipeline de MLOps: `index.jsonl` aporta tamano, sha256 y ruta de origen de cada fichero, lo que permite validar descargas y trazabilidad de checkpoints antes de desplegarlos en el robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card menciona cifras principales ("every headline number") asociadas al brazo `hid_simft`, pero no las reproduce, y el directorio `eval/` contiene evaluaciones en formato JSON mas log de cada checkpoint sin que se detallen sus valores. Los barridos completos, incluidas las ramas no presentes en este repositorio, se remiten a `armteam/hapticwam-ablations`.

## Requisitos de hardware

- No se especifican requisitos de VRAM para inferencia en la informacion disponible.
- No se indican GPU recomendadas (A100, H100, RTX 4090 u otras).
- No se confirma si el modelo cabe en GPU de consumo; el unico dato de tamano es el del repositorio completo (4,5 GB) y el de cada carpeta de estudiante (1,49 GB con 5 o 6 ficheros entre checkpoints y logs), lo que situa los checkpoints individuales en el orden de cientos de megabytes, sin cifra exacta confirmada.
- Se describe como el modelo que "se ejecuta en el rig", es decir, esta pensado para el ordenador de control del banco de manipulacion, lo que sugiere un perfil de computo modesto, aunque no se aportan especificaciones.
- Opciones de despliegue: no disponibles. No se mencionan vLLM, llama.cpp, Ollama ni TGI; al ser una politica robotica en PyTorch, su integracion seria mediante carga directa del checkpoint `.pt`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se identifican modelos comparables de terceros en la informacion disponible. La unica comparacion documentada es interna, entre el profesor y las distintas ramas del estudiante:

| Modelo / rama | Origen | Pasos publicados | Evaluado en el rig | Disponibilidad |
|---|---|---|---|---|
| HapticWAM student (`hid_simft`) | Destilado de `teacher_v6_simft/teacher_002000.pt` | 250, 500, 750, 1000 | Si (es el brazo desplegado) | En este repositorio |
| Student sin muneca (`hid_ftA_r2_nowrist`) | Destilado del profesor ftA, entrada tactil de muneca enmascarada | 500-2000 | No (solo evaluacion offline) | En este repositorio |
| Student sin muneca, continuacion (`hid_ftA_r2_nowrist_cont`) | Continuacion de la rama anterior | 2500-4000 | No (solo evaluacion offline) | En este repositorio |
| HapticWAM teacher | Profesor original | no disponible | no disponible | `armteam/hapticwam-teacher` |

El resto de brazos ("every arm that is not in this repo") se encuentran en `armteam/hapticwam-ablations`.

## Limitaciones y advertencias

- Sesgos conocidos: no se documenta ningun analisis de sesgos. Al tratarse de una politica robotica entrenada con teleoperacion, su comportamiento queda acotado al dominio de tareas y al montaje fisico de los datos de entrenamiento.
- Riesgo de alucinacion: no aplica en el sentido de los modelos de lenguaje, pero si existe el riesgo equivalente de generalizacion fuera de distribucion al ejecutar la politica en configuraciones o tareas no representadas en los 1.115 episodios del conjunto de teleoperacion.
- Cobertura: el estudiante hereda las limitaciones del profesor del que se destila; no se documenta ninguna evaluacion de robustez frente a cambios de iluminacion, objetos o dinamica del banco.
- Generalizacion de las ramas de ablacion: las dos ramas `nowrist` se evaluaron unicamente de forma offline y nunca se ejecutaron en el rig, por lo que sus resultados no garantizan comportamiento en hardware real.
- Idiomas y contexto: al no ser un modelo de lenguaje, no hay soporte multilingue ni ventana de contexto que evaluar; cualquier expectativa en ese sentido es inaplicable.
- Ausencia de metricas: no hay cifras publicas de exito, tasa de exito por tarea ni comparaciones cuantitativas con el profesor, lo que dificulta estimar el coste de la destilacion en terminos de rendimiento.
- Licencia: Apache-2.0 permite uso comercial y modificacion, con las obligaciones habituales de conservar el aviso de copyright, incluir copia de la licencia y senalar los cambios realizados. No se anaden restricciones especificas por campo de uso.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta, y publicacion sin descripcion de arquitectura ni parametros, lo que limita la reproducibilidad fuera del contexto del articulo asociado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/armteam/hapticwam-student
- Profesor (HapticWAM teacher): https://huggingface.co/armteam/hapticwam-teacher
- Conjunto de datos de teleoperacion: https://huggingface.co/datasets/armteam/hapticwam-teleop-dataset
- Rollouts del banco de pruebas: https://huggingface.co/datasets/armteam/hapticwam-rollouts
- Ablaciones completas: https://huggingface.co/armteam/hapticwam-ablations

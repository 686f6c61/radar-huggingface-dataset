# armteam/hapticwam-teacher

## Resumen

HapticWAM teacher es el modelo maestro ("teacher") de un sistema de mundo-accion de naturaleza tactil (tactile world-action model) desarrollado por el equipo armteam y publicado en HuggingFace bajo licencia Apache-2.0. Se trata de la variante de entrada completa: un modelo que consume los flujos tactiles de las puntas de los dedos, ademas de las observaciones y acciones propias de una tarea de manipulacion robotica, y que sirve como referencia de maxima capacidad para destilar despues una version "student" mas ligera destinada al despliegue en el robot real.

El repositorio no contiene un modelo de lenguaje ni un modelo de vision-lenguaje, sino pesos de politica/modelo de mundo para robotica. El checkpoint que el articulo asociado despliega es `teacher_v6_simft/teacher_002000.pt`, un ajuste fino de la version v6 sobre episodios de simulacion y sobre rollouts del propio montaje fisico ("rig"), entrenado durante 2.000 pasos. El repositorio ocupa 1,2 GB e incluye tres carpetas con checkpoints, registros de entrenamiento y ficheros JSON de evaluacion.

La relevancia actual del modelo reside en que la manipulacion con realimentacion tactil es una de las lineas menos cubiertas por los modelos de politica generalistas, y este teacher forma parte de un ecosistema completo (student destilado, baselines de diffusion policy, X-VLA y pi0.5, y barridos de ablacion) que permite reproducir y comparar el pipeline entero. No se dispone de datos publicos sobre arquitectura, numero de parametros ni resultados numericos de benchmarks en la informacion proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la model card no detalla la arquitectura; el uso de "NFE" en los ficheros de evaluacion apunta a muestreo iterativo tipo difusion, sin confirmar) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea una arquitectura MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de contexto textual; no se documenta horizonte de observacion ni de prediccion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; no se documentan capacidades linguisticas) |
| Licencia | Apache-2.0 |
| Formato de pesos | Checkpoints PyTorch `.pt` (`teacher_002000.pt`, `teacher_019000.pt`, `teacher_020000.pt`) |
| Tarea declarada (pipeline) | robotics |
| Etiquetas | pytorch, robotics, tactile, manipulation, world-model |
| Tamano del repositorio | 1,2 GB |
| Numero de checkpoints | 3 (uno desplegado y dos de la version previa al ajuste fino con simulacion) |
| Datos de entrenamiento | `armteam/hapticwam-teleop-dataset`, 1.115 episodios de teleoperacion indexados por `manifests_v6.tar`; el ajuste fino anade episodios de simulacion y rollouts del rig (`armteam/hapticwam-rollouts`) |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-20 |

## Arquitectura y entrenamiento

La model card no especifica la arquitectura interna. Lo que si se deduce del material publicado es la funcion del modelo: se define como un "world-action-model" tactil que recibe como entrada completa los flujos tactiles de las puntas de los dedos, ademas de las senales de accion, y que actua como maestro de un proceso de destilacion hacia un student desplegable. El repositorio se organiza en tres conjuntos de pesos: `teacher_v6_simft/` (un unico fichero, 0,39 GB, correspondiente a `teacher_002000.pt`, la version v6 ajustada sobre simulacion mas rollouts del rig durante 2.000 pasos), `teacher_v6/` (10 ficheros, 0,79 GB, con `teacher_019000.pt`, `teacher_020000.pt`, el registro `train_v6.log` y siete JSON de evaluacion en los pasos 18k, 19k y 20k a NFE 1 y NFE 5, mas una comparacion con la version v5.6) y `eval/` (cuatro ficheros con evaluaciones del teacher a NFE 1 y NFE 5, cada una con su JSON y su log). El uso de la sigla NFE (numero de evaluaciones de funcion) en los nombres de los ficheros de evaluacion es coherente con un proceso de generacion iterativa del tipo muestreo por difusion, aunque la model card no lo confirma explicitamente.

En cuanto a los datos, el entrenamiento parte de `armteam/hapticwam-teleop-dataset`, con 1.115 episodios de teleoperacion indexados por `manifests_v6.tar`. El ajuste fino `simft` incorpora ademas episodios de simulacion y los rollouts del rig publicados en `armteam/hapticwam-rollouts`, lo que sugiere un pipeline de transferencia de simulacion a realidad. No se documentan en la informacion disponible el numero de tokens o muestras totales, la composicion exacta del dataset, ni si se emplearon tecnicas de ajuste por preferencias (RLHF, DPO) o de otro tipo. Tampoco se detallan innovaciones tecnicas concretas mas alla de la propia destilacion del teacher al student y de la evaluacion sistematica en funcion del numero de evaluaciones de funcion.

## Capacidades

- Modelado de mundo y accion para manipulacion robotica: el modelo procesa flujos tactiles de las puntas de los dedos junto con observaciones y acciones para producir comportamiento de manipulacion.
- Realimentacion tactil explicita: la caracteristica diferencial frente a politicas puramente visuales es que el teacher consume las senales tactiles completas, que el student destilado no necesariamente conserva en la misma medida.
- Generacion de acciones para control de robot: los checkpoints se evaluan en el rig fisico, incluida la condicion "teacher-only" con `teacher_020000.pt`.
- Destilacion: el teacher actua como fuente de supervision para el student publicado en `armteam/hapticwam-student` (por ejemplo, `student_001000.pt`).
- Transferencia simulacion-real: la variante `teacher_v6_simft` se ajusta sobre simulacion y rollouts del rig.
- Evaluacion a distinto coste de inferencia: los ficheros de evaluacion cubren NFE 1 y NFE 5, lo que permite analizar el compromiso entre coste computacional y calidad.
- Comparacion con baselines: el ecosistema incluye diffusion policy, X-VLA y pi0.5 como referencias.
- Soporte de tool calling / function calling: no disponible (no aplica; no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso en lenguaje natural: no disponible (no aplica).
- Capacidades multilingues: no disponibles (no aplica).
- Capacidades de vision, audio o modo "thinking": no disponibles en la informacion proporcionada.

## Casos de uso

- Manipulacion robotica con tacto en tareas de contacto: el teacher procesa los flujos tactiles de las puntas de los dedos, por lo que resulta adecuado para tareas donde la fuerza y el deslizamiento importan (insertar, ensamblar, agarrar objetos fragiles) y donde una politica puramente visual no dispone de esa senal.
- Destilacion de politicas para despliegue en robot real: se puede usar `teacher_002000.pt` como fuente de supervision para entrenar el student de `armteam/hapticwam-student`, reduciendo el coste de inferencia en el robot manteniendo el comportamiento aprendido del teacher.
- Ajuste fino simulacion-real: la variante `teacher_v6_simft` permite partir de simulacion y adaptar con rollouts del rig, un flujo util cuando recoger teleoperacion real es caro o lento.
- Referencia de comparacion en investigacion: el teacher sirve como condicion de maxima informacion (entrada tactil completa) frente a politicas sin tacto, y el repositorio `armteam/hapticwam-baselines` proporciona diffusion policy, X-VLA y pi0.5 como terminos de comparacion sobre los mismos episodios.
- Estudio del compromiso entre coste y calidad de muestreo: los barridos a NFE 1 y NFE 5 documentados en `teacher_v6/` y `eval/` permiten analizar cuantas evaluaciones de funcion hacen falta antes de que la calidad se estanque, algo directamente aplicable a decidir el presupuesto de inferencia en el robot.
- Reutilizacion de datos de teleoperacion: los 1.115 episodios de `armteam/hapticwam-teleop-dataset` indexados por `manifests_v6.tar` permiten reentrenar o afinar variantes del modelo con el mismo esquema de manifiestos.
- Analisis retrospectivo de entrenamiento: el fichero `train_v6.log` y los JSON de evaluacion de los pasos 18k, 19k y 20k permiten estudiar la evolucion de la politica y detectar sobreajuste o saturacion antes de reutilizar los pesos.
- Reproducibilidad y auditoria de artefactos: `index.jsonl` enumera cada fichero con su tamano, el sha256 de LFS y la ruta de origen, lo que facilita verificar integridad y trazabilidad en un pipeline de experimentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio contiene ficheros de evaluacion (`eval/v6_teacher_nfe1`, `eval/v6_teacher_nfe5`, y siete JSON adicionales en `teacher_v6/eval/` correspondientes a los pasos 18k, 19k y 20k a NFE 1 y NFE 5, mas una comparacion con v5.6), pero sus valores numericos no se incluyen en la informacion proporcionada y no se reproducen aqui. Los barridos completos, incluidas las variantes no desplegadas, se encuentran segun el autor en `armteam/hapticwam-ablations`.

## Requisitos de hardware

- VRAM para inferencia: no disponible. Como referencia orientativa, el checkpoint desplegado ocupa 0,39 GB en disco; si estuviera almacenado en fp32, ese tamano corresponderia a un orden de magnitud de unos 100 millones de parametros, aunque se trata de una estimacion derivada del tamano de fichero y no confirmada por el autor. La VRAM real necesaria depende del lote, del numero de flujos tactiles de entrada, de la resolucion de las observaciones y del NFE empleado en el muestreo.
- Los checkpoints de la version previa al ajuste fino (`teacher_019000.pt`, `teacher_020000.pt`) forman parte de una carpeta de 0,79 GB, por lo que el orden de magnitud de memoria es bajo en terminos relativos, pero la memoria de activaciones durante el muestreo iterativo puede dominar el consumo.
- GPU recomendadas: no disponible en la informacion proporcionada. No se documentan requisitos de GPU ni resultados de latencia por dispositivo.
- Viabilidad en GPU de consumo: no disponible. Dado el tamano de los checkpoints, es plausible que quepa en GPU de consumo, pero no hay confirmacion del autor ni datos de rendimiento que lo respalden.
- Opciones de despliegue: la libreria declarada es PyTorch. No se mencionan vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia, y en general no serian aplicables a un modelo de politica robotica de este tipo.
- Latencia y throughput: no disponibles. El unico dato relacionado es la existencia de evaluaciones a NFE 1 y NFE 5, que implican un coste de inferencia aproximadamente proporcional al numero de evaluaciones de funcion.
- Requisitos de entrenamiento: no disponibles (no se documentan horas de GPU, numero de aceleradores ni presupuesto de computo).

## Comparativa con modelos similares

No se dispone de especificaciones de modelos comparables en la informacion proporcionada. La propia model card identifica los terminos de comparacion del proyecto, que se recogen a continuacion sin datos numericos porque no se han publicado en el material disponible.

| Modelo | Rol en el proyecto | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HapticWAM teacher (`armteam/hapticwam-teacher`) | Modelo maestro con entrada tactil completa, destilado al student | no disponible | no disponible | Apache-2.0 | Publicado en HuggingFace; 0 descargas, 0 likes |
| HapticWAM student (`armteam/hapticwam-student`) | Student destilado, incluye el checkpoint desplegado `student_001000.pt` | no disponible | no disponible | no disponible en la informacion proporcionada | Publicado en HuggingFace |
| Diffusion policy (`armteam/hapticwam-baselines`) | Baseline de politica por difusion | no disponible | no disponible | no disponible en la informacion proporcionada | Publicado en HuggingFace |
| X-VLA (`armteam/hapticwam-baselines`) | Baseline de vision-lenguaje-accion | no disponible | no disponible | no disponible en la informacion proporcionada | Publicado en HuggingFace |
| pi0.5 (`armteam/hapticwam-baselines`) | Baseline de politica generalista | no disponible | no disponible | no disponible en la informacion proporcionada | Publicado en HuggingFace |
| Variantes de ablacion (`armteam/hapticwam-ablations`) | Resto de brazos de entrenamiento y barridos completos de evaluacion | no disponible | no disponible | no disponible en la informacion proporcionada | Publicado en HuggingFace |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a instrucciones en lenguaje natural y no soporta tool calling, agentes ni modos de razonamiento linguistico. Cualquier uso de ese tipo seria un error de encuadre.
- La model card no documenta arquitectura, numero de parametros, contexto, cuantizaciones ni presupuesto de entrenamiento, lo que dificulta la reproducibilidad completa a partir de este repositorio aislado.
- No se han publicado resultados numericos de benchmarks en la informacion disponible; las afirmaciones de calidad solo pueden contrastarse abriendo los JSON de evaluacion del repositorio, cuyos valores no se incluyen aqui.
- Riesgo de generalizacion: el modelo se entrena con 1.115 episodios de teleoperacion de un montaje concreto ("rig"). Es esperable un comportamiento degradado fuera de ese setup, de la morfologia de mano o del tipo de objetos empleados. No se documentan evaluaciones de generalizacion a otros entornos.
- No hay datos publicados sobre sesgos, pero en robotica el equivalente relevante es el sesgo de dominio: la politica puede heredar las regularidades y las imperfecciones de la teleoperacion humana registrada.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto; el riesgo analogo es la prediccion de acciones o contactos inconsistentes con la fisica real, especialmente a NFE bajo.
- Idiomas: no aplica. No se documenta ninguna capacidad linguistica ni multilingue.
- Licencia: el repositorio se publica bajo Apache-2.0, lo que en principio permite uso comercial de los pesos, pero la licencia de los datasets de entrenamiento (`armteam/hapticwam-teleop-dataset` y `armteam/hapticwam-rollouts`) no se detalla en la informacion proporcionada y debe verificarse antes de un uso comercial.
- Formato de pesos: los `.pt` de PyTorch se cargan habitualmente mediante serializacion tipo pickle; conviene cargarlos en un entorno controlado y verificar los sha256 publicados en `index.jsonl` antes de su uso.
- Trazabilidad: los metadatos del repositorio indican fechas de creacion y actualizacion en septiembre de 2026, y el repositorio registra 0 descargas y 0 likes, por lo que no existe validacion externa de la comunidad en el momento de redactar esta ficha.
- Dependencia del ecosistema: el modelo esta pensado para funcionar junto al student, los baselines y los manifiestos del mismo proyecto; usarlo de forma aislada exige reconstruir el pipeline de datos y de evaluacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/armteam/hapticwam-teacher
- Dataset de teleoperacion: https://huggingface.co/datasets/armteam/hapticwam-teleop-dataset
- Rollouts del rig: https://huggingface.co/datasets/armteam/hapticwam-rollouts
- Student destilado: https://huggingface.co/armteam/hapticwam-student
- Baselines (diffusion policy, X-VLA, pi0.5): https://huggingface.co/armteam/hapticwam-baselines
- Ablaciones y barridos completos: https://huggingface.co/armteam/hapticwam-ablations
- Articulo cientifico asociado: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demos o espacios: no disponible en la informacion proporcionada
- Nota sobre la busqueda web: los resultados de busqueda recibidos no guardan relacion con el modelo (contenido sobre amianto) y no aportan enlaces utiles para esta ficha

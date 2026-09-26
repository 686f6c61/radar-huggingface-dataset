# deepmaster/pi0.5-VnHbtJqkLwbN

## Resumen

pi0.5-VnHbtJqkLwbN es un checkpoint completo de política robótica desarrollado por el usuario `deepmaster` para la temporada de simulación OpenRoboto AXIS v1.0. Se trata de un fine-tune del modelo openpi π0.5 sobre el brazo Franka Panda en 30 tareas de MuJoCo, construido con la configuración `pi05_axis_joint` del evaluador oficial. El modelo parte del checkpoint campeón de la propia competición, `pfenzi/pi0.5-8wKVKfMLCNbx`, y aplica sobre él una técnica de ajuste por rechazo (*rejection-sampling fine-tuning*) sobre sus propias trayectorias exitosas.

El problema que aborda es la mejora de una política robótica ya muy optimizada sin disponer de datos externos: en lugar de recopilar nuevas demostraciones humanas, filtra las ejecuciones exitosas del modelo padre y reentrena sobre ellas. Con 2 063 episodios verificados (~102 000 fotogramas) y un presupuesto de 600 pasos de entrenamiento, logra una mejora modesta pero medible en el arnés oficial (1 002 frente a 997 episodios resueltos sobre 1 200).

Es relevante ahora porque ilustra un patrón de competición emergente en robótica: el auto-ajuste iterativo sobre rollouts propios como mecanismo para escalar el rendimiento en *leaderboards* de simulación. Sin embargo, conviene señalar que el modelo tiene 0 descargas y 0 *likes*, es de creación reciente (26 de septiembre de 2026) y su utilidad fuera del entorno AXIS concreto está por demostrar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en la informacion proporcionada. El checkpoint es un fine-tune completo del modelo openpi π0.5, cuyos pesos derivan de openpi π0.5 (Apache-2.0) y PaliGemma (Gemma Terms of Use); se encuadra en la familia de modelos vision-language-action (VLA) |
| Parametros totales | no disponible |
| Parametros activos | no aplica / no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se publica un unico checkpoint en formato JAX de precision completa; no se listan versiones cuantizadas) |
| Idiomas soportados | no disponible (modelo de politica robotica, no un modelo conversacional) |
| Licencia | Gemma Terms of Use (campo `license: gemma`); pesos derivados de openpi π0.5 (Apache-2.0) y PaliGemma (Gemma Terms of Use) |
| Formato de pesos | Checkpoint JAX completo (openpi); los datos de entrenamiento se convirtieron a LeRobot v2.1 |

Datos adicionales confirmados: *pipeline* `robotics`; tamano del repositorio 12,4 GB; region `us`; creado y actualizado el 26 de septiembre de 2026.

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna (numero de capas, dimensiones, mecanismo de atencion, uso de flow matching o de un experto de acciones). El checkpoint hereda la estructura del modelo openpi π0.5 y, por tanto, de su backbone vision-language PaliGemma. Lo que si esta documentado es el procedimiento de entrenamiento: un *full fine-tune* (todos los pesos actualizados) del checkpoint padre `pfenzi/pi0.5-8wKVKfMLCNbx` mediante ajuste por rechazo, es decir, auto-imitacion sobre sus propios rollouts exitosos.

El conjunto de datos se genero exclusivamente en el arnes oficial `openroboto-evaluation` (benchmark `axis_v1.0`, 20 intentos por tarea): los 30 tareas con dos semillas de politica locales, mas ocho semillas adicionales en las 11 tareas donde el padre rinde peor (31, 34, 37, 42, 50, 55, 501, 502, 504, 505, 757). Solo se conservaron episodios verificados como exitosos: 2 063 episodios, unos 102 000 fotogramas, reproducidos bit a bit en formato LeRobot v2.1. La mezcla final es 60 % exitos de todas las tareas y 40 % exitos de tareas debiles, uniforme dentro de cada parte. No se uso ningun peso ni rollout de otros participantes.

La configuracion de entrenamiento es: 600 pasos, batch 24, optimizador AdamW con *cosine learning rate* de 4e-6 a 5e-7 (30 pasos de calentamiento), EMA 0.999 (los pesos exportados son los del EMA) y FSDP sobre 4x RTX A6000. La divergencia respecto al padre es muy pequena: un cambio de norma L2 relativa de 1,8e-4. Las estadisticas de normalizacion (norm stats) son las del padre, identicas byte a byte, en `assets/axis-v0.1-task501-runtime-v1/norm_stats.json`. La entrada de estado es discreta.

## Capacidades

- Control de politica robotica en simulacion para el brazo Franka Panda sobre las 30 tareas del benchmark AXIS v1.0 en MuJoCo.
- Entrada de estado discreta, segun la configuracion `pi05_axis_joint`.
- Capacidad de auto-mejora mediante ajuste por rechazo: el metodo aplicado demuestra que el modelo puede generar rollouts de los que extraer senal de entrenamiento.
- Ejecucion dentro del arnes oficial `openroboto-evaluation` con las estadisticas de normalizacion del checkpoint padre.
- No se documentan capacidades de *tool calling*, agentes, razonamiento multi-paso, vision general, audio, modo de pensamiento ni multilingueismo convencional; el alcance declarado es exclusivamente robotico y de simulacion.
- Compatibilidad con el ecosistema openpi (JAX) y con el formato de datos LeRobot v2.1.

## Casos de uso

- Manipulacion robotica simulada en Franka Panda: el modelo ejecuta las 30 tareas de MuJoCo definidas por AXIS v1.0, por lo que sirve para reproducir resultados de la competicion y como referencia de rendimiento (1 002 de 1 200 episodios en la evaluacion local).
- Ajuste por rechazo como receta de mejora: el propio modelo documenta un pipeline completo (generacion de rollouts, filtrado por exito, mezcla 60/40, full fine-tune de 600 pasos) que se puede reutilizar para mejorar otras politicas con un coste de computo bajo.
- *Baseline* para competiciones OpenRoboto: al ser un checkpoint derivado del campeon de la temporada AXIS v1.0, permite a otros equipos medir su progreso contra un punto de partida fuerte.
- Investigacion en modelos vision-language-action: sirve para estudiar la transferencia de un backbone tipo PaliGemma a control motor y la sensibilidad del rendimiento a la mezcla de datos.
- Recoleccion de datos sinteticos: los 2 063 episodios exitosos y ~102 000 fotogramas asociados constituyen un corpus de demostraciones reutilizable para imitacion en el mismo entorno.
- Cierre de brechas en tareas debiles: el 40 % de la mezcla se centra en 11 tareas concretas, lo que lo hace adecuado para replicar el experimento de refuerzo focalizado sobre tareas problematicas (31, 34, 37, 42, 50, 55, 501, 502, 504, 505, 757).

## Benchmarks y rendimiento

Los unicos resultados disponibles proceden de la evaluacion local oficial del autor, con el arnes oficial y 600 episodios por semilla:

| Modelo | Semilla 777 | Semilla 888 | Total /1200 |
|---|---|---|---|
| Este modelo | 501 | 501 | 1002 |
| Padre `pfenzi/pi0.5-8wKVKfMLCNbx` | 498 | 499 | 997 |
| `ApexUltron/pi0.5-KX774qZu7mZD` @46abf397 | 495 | 491 | 986 |

Contexto adicional: el checkpoint padre fue coronado campeon de AXIS el 26 de septiembre de 2026 con una puntuacion de 0,8117, y es a su vez un fine-tune de la base de la ronda `Fisher-Wang/pi05-axis-v0.2-all30-74p67` @521a0741. No se han publicado resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K u otros), que no aplican a esta categoria de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como referencia, el repositorio completo ocupa 12,4 GB, pero no se especifica la precision de los pesos ni el uso de memoria en tiempo de ejecucion.
- GPUs recomendadas: no disponible en la informacion proporcionada para inferencia. Para el entrenamiento documentado se usaron 4x RTX A6000 con FSDP.
- Ejecucion en GPU de consumo: no confirmado. Las RTX A6000 empleadas son GPUs de gama profesional, no de consumo.
- Opciones de despliegue: el checkpoint es un formato JAX de openpi, por lo que requiere el *stack* openpi para su ejecucion; no se mencionan soportes alternativos como vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo robotic.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Rendimiento local (total /1200) | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (`deepmaster/pi0.5-VnHbtJqkLwbN`) | Fine-tune por rechazo del padre | 1002 | Gemma Terms of Use | Publico en HuggingFace (0 descargas) |
| `pfenzi/pi0.5-8wKVKfMLCNbx` @a4a5f57 | Campeon AXIS v1.0 (score 0,8117) | 997 | No especificada en la informacion | Publico en HuggingFace |
| `ApexUltron/pi0.5-KX774qZu7mZD` @46abf397 | Checkpoint competidor AXIS | 986 | No especificada en la informacion | Publico en HuggingFace |
| `Fisher-Wang/pi05-axis-v0.2-all30-74p67` @521a0741 | Base de la ronda | No disponible | No especificada en la informacion | Publico en HuggingFace |

No se dispone de datos de parametros ni de contexto de los modelos comparados, por lo que la comparacion se limita a rendimiento, licencia y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al ser un modelo de control robotico en simulacion, el riesgo de sesgo relevante se limita al entorno de entrenamiento (Franka Panda, MuJoCo, tareas AXIS).
- Riesgo de alucinacion: no aplica en el sentido generativo habitual; el riesgo equivalente es la ejecucion de acciones incorrectas fuera de las tareas y el entorno vistos en entrenamiento.
- Limitaciones de contexto y de dominio: el modelo esta especializado en las 30 tareas de AXIS v1.0 sobre Franka Panda. No hay evidencia de generalizacion a otros robots, tareas o entornos fisicos. La reproducibilidad depende de las norm stats byte-identicas del padre y de la configuracion `pi05_axis_joint`.
- Restricciones de licencia: el campo declarado es `license: gemma` y los pesos derivan de PaliGemma (Gemma Terms of Use). Es imprescindible revisar los terminos de Gemma antes de cualquier uso comercial, ya que imponen condiciones y restricciones de uso aceptable. openpi π0.5 esta bajo Apache-2.0, pero la componente PaliGemma condiciona la distribucion.
- La mejora sobre el padre es marginal (1 002 frente a 997 sobre 1 200), con un cambio de pesos de norma L2 relativa de 1,8e-4, por lo que el modelo es muy proximo al padre y su ventaja puede no ser estadisticamente significativa.
- Metodologia: el entrenamiento usa exclusivamente rollouts del propio padre en el arnes oficial. Cualquier fuga o sesgo del arnes se hereda.
- Estado del repositorio: 0 descargas y 0 *likes*, creado y actualizado el mismo dia. No hay evidencia de validacion por terceros.
- Inferencia: requiere el ecosistema openpi (JAX); no se ofrecen pesos en safetensors ni GGUF, lo que limita su integracion en *stacks* de inferencia convencionales.

## Enlaces

- HuggingFace (este modelo): https://huggingface.co/deepmaster/pi0.5-VnHbtJqkLwbN
- Checkpoint padre: https://huggingface.co/pfenzi/pi0.5-8wKVKfMLCNbx
- Base de la ronda: https://huggingface.co/Fisher-Wang/pi05-axis-v0.2-all30-74p67
- Checkpoint competidor: https://huggingface.co/ApexUltron/pi0.5-KX774qZu7mZD
- No se han proporcionado enlaces a papers, blogs, repositorios de codigo ni demos en la informacion disponible.

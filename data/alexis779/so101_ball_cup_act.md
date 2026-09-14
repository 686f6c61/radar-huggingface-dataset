# alexis779/so101_ball_cup_act

# Ficha tecnica: so101_ball_cup_act

## Resumen
`so101_ball_cup_act` es una politica de aprendizaje por imitacion basada en ACT (Action Chunking with Transformers) entrenada con LeRobot y publicada por el usuario alexis779 en HuggingFace. No es un modelo de lenguaje: es un controlador viso-motor que consume dos flujos de imagen y el estado articular de un brazo robotico SO-100 (`so_arm100`) y produce directamente comandos de accion. El modelo se ha entrenado para una unica tarea manipulativa, "put the ball in the cup" (introducir una pelota en un vaso), a partir de 50 episodios teleoperados y 13.987 fotogramas grabados a 12 FPS.

El modelo resuelve un problema concreto de robotica: aprender una habilidad de manipulacion a partir de demostraciones humanas, sin ingenieria de control explicita. ACT predice "trozos" (chunks) de acciones en lugar de pasos individuales, lo que reduce el error de acumulacion y suele lograr tasas de exito elevadas en tareas de pick-and-place. Es relevante como ejemplo reproducible y ligero (unos 51,7 millones de parametros, 0,2 GB de repositorio) del flujo completo de LeRobot: grabar datos, entrenar un ACT y desplegarlo en hardware real de bajo coste.

Su interes practico para desarrolladores e investigadores esta en servir como referencia minima de imitacion viso-motora: cabe en cualquier GPU de consumo e incluso en CPU, es de licencia Apache 2.0 y sigue el formato estandar de LeRobot, lo que facilita reentrenarlo, evaluarlo o reutilizarlo como punto de partida para otras tareas. No obstante, el autor no ha publicado ninguna evaluacion en robot real, por lo que su tasa de exito efectiva es desconocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ACT (Action Chunking with Transformers) para imitacion viso-motora, con extraccion visual a partir de dos camaras |
| Parametros totales | 51.668.614 (~51,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; predice chunks de accion) |
| Tipos de cuantizacion | no disponible (pesos en `safetensors`; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de robotica; no procesa lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La arquitectura es ACT (Action Chunking with Transformers), el metodo descrito en el paper arXiv:2304.13705. Es un enfoque de aprendizaje por imitacion que aprende de datos teleoperados y predice secuencias cortas de acciones (chunks) en lugar de un unico paso, lo que mejora la estabilidad del control frente a politicas paso a paso. La politica consume tres entradas: dos imagenes (`observation.images.front` de 3x480x640 y `observation.images.wrist` de 3x240x320) y el estado articular (`observation.state`, vector de 6 componentes), y emite un vector de accion de 6 componentes. El modelo se ha entrenado mediante el pipeline de LeRobot (version 0.6.2) sobre un brazo SO-100.

Los datos de entrenamiento proceden del dataset `alexis779/so101_ball_cup`: 50 episodios, 13.987 fotogramas a 12 FPS, todos ellos de la tarea "put the ball in the cup". La configuracion de entrenamiento documentada es de 100.000 pasos, tamano de lote 8, optimizador AdamW, tasa de aprendizaje 1e-5 y semilla 1000. No se especifica en la informacion disponible si hubo etapas de RLHF/DPO (no aplicables a este tipo de politica), ni la composicion detallada de la aumentacion de datos, ni innovaciones tecnicas adicionales mas alla del propio metodo ACT.

## Capacidades
- Generacion de acciones de control para un brazo robotico SO-100 a partir de dos camaras y del estado articular (6 grados de libertad).
- Ejecucion de una tarea manipulativa concreta: introducir una pelota en un vaso ("put the ball in the cup").
- Aprendizaje por imitacion a partir de demostraciones teleoperadas, sin recompensas ni entorno simulado.
- Prediccion de chunks de accion, lo que permite control continuo y reduce la acumulacion de errores.
- Integracion directa con el ecosistema LeRobot (`lerobot-rollout` para despliegue y `lerobot-train` para reentrenamiento).
- Reutilizacion como punto de partida para fine-tuning en tareas similares mediante transferencia de aprendizaje.
- No dispone de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingues ni modos "thinking": no es un modelo de lenguaje.

## Casos de uso
- Automatizacion de pick-and-place en laboratorio: el modelo puede ejecutar la tarea de colocar la pelota en el vaso en un banco de pruebas con un SO-100, usando las dos camaras ya definidas (frontal y de muneca) para cerrar el bucle viso-motor.
- Transferencia a tareas similares: sirve como inicializacion para reentrenar con `lerobot-train` sobre un dataset propio de recogida y colocacion, reduciendo el numero de episodios necesarios frente a un entrenamiento desde cero.
- Reproduccion de resultados y docencia: al ser un ejemplo completo y ligero del flujo LeRobot, es adecuado para talleres y cursos de aprendizaje por imitacion en robotica.
- Banco de comparacion de metodos: permite comparar ACT con otras politicas de LeRobot (por ejemplo Diffusion Policy o SmolVLA) sobre el mismo hardware y la misma tarea.
- Pruebas de robustez del control viso-motor: se puede evaluar como cambia el exito al variar posiciones de la pelota, iluminacion o presencia de distractores, aunque el autor no aporta estas evaluaciones.
- Prototipado rapido en hardware de bajo coste: al requerir poca VRAM, se puede desplegar en un portatil o en un mini-PC con GPU integrada junto al brazo, sin necesidad de servidores.
- Referencia de formato de datos: el par politica/dataset (`so101_ball_cup` + `so101_ball_cup_act`) puede usarse como plantilla para estructurar nuevos datasets de imitacion y sus politicas asociadas.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente: "No evaluation results have been provided for this policy yet". No consta tasa de exito en robot real, numero de ensayos ni condiciones de evaluacion. No se deben asumir cifras de exito a partir del paper de ACT, ya que corresponden a otros modelos y otras tareas.

## Requisitos de hardware
- VRAM estimada para inferencia: con ~51,7 M de parametros, el modelo ocupa en torno a 207 MB en fp32 y unos 103 MB en fp16 (sin contar el buffer del repositorio de 0,2 GB). Es un requisito muy bajo.
- GPU recomendadas: cualquier GPU moderna es suficiente. Cabe holgadamente en RTX 3060/4060, RTX 4090, A100 o H100; el hardware no es el cuello de botella para este tamano.
- GPU de consumo: si, cabe en practicamente cualquier GPU de consumo e incluso en GPUs integradas; tambien es viable ejecucion en CPU, aunque con mayor latencia.
- Opciones de despliegue: el despliegue estandar es mediante LeRobot (`lerobot-rollout --policy.path=alexis779/so101_ball_cup_act`). No aplican servidores de inferencia de LLM como vLLM, TGI, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles. El dataset se grabo a 12 FPS (aprox. 83 ms por fotograma), pero no se documenta la latencia de inferencia real ni la frecuencia de control alcanzada en robot.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Tarea / contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `alexis779/so101_ball_cup_act` | ACT (imitacion) | ~51,7 M | Tarea unica: pelota en vaso, SO-100 | Apache 2.0 | HuggingFace + LeRobot |
| Otras politicas ACT de LeRobot | ACT (imitacion) | no disponible | Depende del dataset de entrenamiento | normalmente Apache 2.0 | HuggingFace + LeRobot |
| Diffusion Policy (referencia del ecosistema LeRobot) | Policy basada en difusion | no disponible | Manipulacion por imitacion | MIT (segun repositorio original) | Repositorio publico + LeRobot |
| SmolVLA | VLA ligero | no disponible | Manipulacion condicionada por lenguaje | Apache 2.0 | HuggingFace + LeRobot |

No se dispone de datos comparativos de rendimiento (tasas de exito) en la informacion proporcionada, por lo que la comparacion se limita a tipo de metodo, licencia y disponibilidad.

## Limitaciones y advertencias
- Ausencia total de evaluacion publicada: no hay tasa de exito ni condiciones de prueba verificadas; no se puede garantizar que la politica funcione fuera del entorno de grabacion.
- Tarea unica y especializada: solo se ha entrenado para "put the ball in the cup"; no generaliza a otras tareas sin reentrenamiento.
- Dependencia del hardware: requiere un brazo SO-100 (`so_arm100`) y dos camaras con nombres e indices concretos (`front` y `wrist`); si la configuracion fisica o la calibracion difiere, el rendimiento se degrada.
- Sensibilidad al entorno: cambios de iluminacion, posicion de la pelota, color del fondo o presencia de objetos no vistos pueden provocar fallos; no se documenta robustez alguna.
- Sesgos y alucinacion: en el sentido de los modelos de lenguaje no aplican, pero si existe riesgo de comportamientos erroneos (colisiones, agarres fallidos) por sobreajuste a las demostraciones.
- Idioma: no procesa lenguaje natural ni mantiene conversacion.
- Licencia: Apache 2.0, por lo que se permite uso comercial y modificacion, siempre citando el metodo (ACT) y LeRobot segun indica la model card.
- Caveats de produccion: al ser un modelo sin evaluacion y de tarea unica, no es adecuado para despliegue productivo sin una validacion propia extensiva y, preferiblemente, un reentrenamiento con datos del entorno objetivo.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/alexis779/so101_ball_cup_act
- Dataset de entrenamiento: https://huggingface.co/datasets/alexis779/so101_ball_cup
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento (imitacion): https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=alexis779/so101_ball_cup

Nota: la busqueda web realizada no devolvio resultados relevantes para este modelo (los enlaces encontrados correspondian a un dominio no relacionado y se han descartado).

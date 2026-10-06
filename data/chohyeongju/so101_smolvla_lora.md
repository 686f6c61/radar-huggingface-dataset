# chohyeongju/so101_smolvla_lora

## Resumen

so101_smolvla_lora es un adaptador LoRA sobre el modelo base lerobot/smolvla_base, un modelo vision-lenguaje-accion (VLA) compacto desarrollado en el ecosistema LeRobot de Hugging Face. Lo publica el usuario chohyeongju y esta especializado en una unica tarea de manipulacion robotica: coger un bloque amarillo y colocarlo sobre un objetivo morado, ejecutada por un robot SO-101 (so_follower) con tres camaras de entrada.

El modelo resuelve el problema de trasladar aprendizaje por imitacion a hardware de robot de bajo coste: parte de un VLA preentrenado y se ajusta con 50 episodios y 21.535 fotogramas a 30 FPS grabados especificamente para esa tarea. SmolVLA, el metodo subyacente descrito en el paper arXiv 2506.01844, esta disenado para ofrecer rendimiento competitivo con un coste computacional reducido y poder desplegarse en hardware de consumo, lo que lo hace relevante para laboratorios y aficionados que no disponen de GPU de datacenter.

Se trata de un adaptador de ajuste fino, no de un modelo completo: su utilidad esta ligada al modelo base y a la configuracion exacta de camaras y estado del robot con la que fue entrenado. La licencia es Apache 2.0 y el formato de pesos es safetensors, con integracion nativa en la libreria lerobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje-accion (VLA) basada en SmolVLA (adaptador LoRA sobre lerobot/smolvla_base) |
| Parametros totales | no disponible (el repositorio contiene solo el adaptador LoRA; el tamano del repo figura como 0.0 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible / no aplica en el sentido de contexto de texto; consume estado de 6 dimensiones y 3 imagenes de 3x256x256 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tarea | "Pick up the yellow block and place it on the purple target" |
| Robot objetivo | so_follower (SO-101) |
| Camaras | top (tres entradas visuales en la definicion de observaciones) |
| Entradas | observation.state (6,), observation.images.camera1/2/3 (3, 256, 256) |
| Salidas | action (6,) |
| Libreria | lerobot (version de entrenamiento 0.6.1) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA obtenido por ajuste fino de lerobot/smolvla_base, que a su vez implementa el metodo SmolVLA descrito en el paper arXiv 2506.01844. SmolVLA es un modelo vision-lenguaje-accion compacto que combina percepcion visual y comprension del lenguaje con la generacion de acciones motoras, y que segun su descripcion alcanza rendimiento competitivo con costes computacionales reducidos, pudiendo desplegarse en hardware de consumo. La politica consume estado propioceptivo de 6 dimensiones y tres flujos de imagen de 3x256x256, y produce un vector de accion de 6 dimensiones.

El entrenamiento se realizo con LeRobot 0.6.1 sobre el dataset chohyeongju/so101_pick_place_20261006_183309, compuesto por 50 episodios y 21.535 fotogramas a 30 FPS de una unica tarea de pick and place. La configuracion reportada es de 10.000 pasos de entrenamiento, tamano de lote 8, optimizador AdamW, tasa de aprendizaje 0.001 y semilla 1000. No se detalla en la informacion disponible si hubo etapas de RLHF, DPO ni tecnicas adicionales de refinamiento; tampoco se especifican innovaciones tecnicas concretas mas alla de las atribuibles al metodo SmolVLA de referencia.

## Capacidades

- Generacion de acciones motoras de 6 dimensiones para control de un robot SO-101 (so_follower).
- Ejecucion de una tarea concreta de manipulacion: coger un bloque amarillo y dejarlo sobre un objetivo morado.
- Percepcion visual multimodal a partir de tres camaras independientes, cada una con entrada de 3x256x256.
- Integracion de estado propioceptivo del robot (vector de 6 dimensiones) con la informacion visual para producir la accion.
- Aprendizaje por imitacion a partir de demostraciones humanas grabadas a 30 FPS.
- Ejecucion de politicas en bucle mediante la herramienta lerobot-rollout del ecosistema LeRobot.
- Capacidad de reentrenamiento o ajuste adicional sobre el mismo pipeline (lerobot-train) partiendo del modelo base o de este adaptador.
- No se documentan en la informacion disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso, thinking mode, audio ni otras funciones propias de modelos de lenguaje generales.

## Casos de uso

- Demostracion de pick and place en robot SO-101: el modelo ejecuta la secuencia de coger el bloque amarillo y colocarlo en el objetivo morado mediante lerobot-rollout, siendo adecuado para validar el montaje mecanico y la calibracion del robot.
- Prototipado academico de VLA de bajo coste: un laboratorio puede reproducir el flujo completo de SmolVLA (grabacion de datos, ajuste fino con LoRA, despliegue) sin necesidad de GPU de gama alta, dado el enfoque del metodo hacia hardware de consumo.
- Banco de pruebas de aprendizaje por imitacion: sirve para comparar como varia el exito al cambiar posiciones de objeto, iluminacion o distractores, ya que el autor deja abierta esa posibilidad en la seccion de evaluacion.
- Base para ajuste a nuevas tareas: al ser un adaptador LoRA sobre lerobot/smolvla_base, puede servir como punto de partida para reentrenar con otro dataset especifico usando lerobot-train.
- Reproduccion de experimentos en robotica: investigadores pueden replicar el pipeline documentado (dataset, hiperparametros, semilla, version de LeRobot) para estudiar la variabilidad del entrenamiento.
- Integracion en docencia de robotica: el caracter compacto del modelo y su licencia Apache 2.0 facilitan su uso en cursos practicos de manipulacion y vision por computador.
- Automatizacion de una celda de pick and place simple: en un entorno controlado y con la tarea fija para la que fue entrenado, puede ejecutar el ciclo de recogida y colocacion de forma repetida durante la duracion configurada en el rollout.

## Benchmarks y rendimiento

"No se han publicado resultados de benchmarks en la informacion disponible."

La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica. No hay tasas de exito en robot real, ni comparaciones numericas, ni resultados en conjuntos tipo MMLU, HumanEval o GSM8K (que, por otra parte, no aplican a un modelo de accion). El autor deja una plantilla de evaluacion (tarea, ensayos, exitos, tasa de exito) sin rellenar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada.
- GPU recomendadas: no disponible. El metodo SmolVLA de referencia se describe como desplegable en hardware de consumo, pero no se concreta un modelo de GPU para este adaptador.
- Compatibilidad con GPU de consumo: previsiblemente si, segun la orientacion general de SmolVLA hacia hardware de consumo, aunque no se aporta confirmacion ni cifra concreta para esta politica.
- Opciones de despliegue: libreria LeRobot (lerobot-rollout para inferencia, lerobot-train para entrenamiento). No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI, que ademas no son aplicables a una politica de robotica.
- Latencia y throughput: no disponibles. La frecuencia de captura del dataset es de 30 FPS, pero no se declara la tasa de inferencia alcanzable.
- Requisitos adicionales: robot SO-101 (so_follower), conexion por puerto serie y tres camaras configuradas con nombres que coincidan con las claves de observacion del entrenamiento.

## Comparativa con modelos similares

Los datos de rendimiento y de tamano de los modelos comparables no se detallan en la informacion proporcionada, por lo que la comparacion se limita a los aspectos documentados.

| Modelo | Relacion | Parametros | Contexto / entradas | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| chohyeongju/so101_smolvla_lora | Modelo descrito | no disponible (adaptador LoRA) | 3 imagenes 3x256x256 + estado (6,) | sin evaluacion publicada | apache-2.0 | Hugging Face (0 descargas) |
| lerobot/smolvla_base | Modelo base del que se parte | no disponible | no disponible | no disponible | no disponible | Hugging Face (dentro del ecosistema LeRobot) |
| Otros VLA de robotica (por ejemplo OpenVLA, pi0) | Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de cifras verificables para comparar rendimiento, contexto o numero de parametros entre estas alternativas a partir de la informacion facilitada.

## Limitaciones y advertencias

- Modelo de tarea unica: solo se ha entrenado para "Pick up the yellow block and place it on the purple target"; fuera de esa tarea no cabe esperar un comportamiento fiable.
- Dataset reducido: 50 episodios y 21.535 fotogramas, con un unico robot y una configuracion de camaras concreta, lo que aumenta el riesgo de sobreajuste al entorno de grabacion.
- Dependencia del modelo base: es un adaptador LoRA, por lo que necesita lerobot/smolvla_base para funcionar; no es autonomo.
- Dependencia exacta de las observaciones: los nombres de camara y las dimensiones (3x256x256, estado de 6 dimensiones) deben coincidir con los del entrenamiento, o la politica fallara al ejecutarse.
- Sin evaluacion publicada: no hay tasa de exito ni pruebas en robot real reportadas, asi que el rendimiento en produccion es desconocido.
- Sensibilidad al entorno: cambios de iluminacion, posicion de objetos, distractores o un robot distinto del mismo tipo pueden degradar el comportamiento, tal como advierte la propia plantilla de evaluacion de la model card.
- Sesgos conocidos: no se documentan sesgos especificos en la informacion disponible, aunque al tratarse de un modelo entrenado con demostraciones limitadas puede heredar los sesgos de posicion y apariencia del dataset.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero si existe riesgo de acciones erroneas o inseguras cuando la escena difiere de la distribucion de entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del dataset por separado.
- Uso en produccion: al no haber validacion publicada ni metricas de latencia, no se recomienda desplegarlo en entornos criticos sin una evaluacion propia y medidas de seguridad fisica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chohyeongju/so101_smolvla_lora
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/chohyeongju/so101_pick_place_20261006_183309
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=chohyeongju/so101_pick_place_20261006_183309
- Paper de SmolVLA (arXiv 2506.01844): https://huggingface.co/papers/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de aprendizaje por imitacion: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

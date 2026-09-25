# hlmnrkmn737/convertible_pos_BToC_fineTuned_act

## Resumen

El modelo `convertible_pos_BToC_fineTuned_act` es una política de robótica basada en ACT (Action Chunking with Transformers), publicada por el usuario hlmnrkmn737 en Hugging Face y entrenada con la librería LeRobot. No es un modelo de lenguaje: es una política de aprendizaje por imitación que aprende de demostraciones teleoperadas y genera comandos de acción para un brazo robótico. Concretamente, produce vectores de acción de 6 dimensiones a partir del estado articular de 6 valores y de dos cámaras RGB de 480x640 (`front_view` y `top_view`).

El modelo aborda una tarea de manipulación muy concreta: recoger una plataforma convertible desde la posición de borde frontal y depositarla en la posición de borde izquierdo. Tiene 51.668.614 parámetros y se distribuye en formato safetensors bajo licencia Apache 2.0, con un repositorio de 0,2 GB, por lo que es desplegable en hardware de consumo.

Su interés practico es servir como ejemplo reproducible del flujo de trabajo de LeRobot 0.6.0: dataset versionado con estadísticas recalculadas, fine-tuning de una política ACT y ejecución directa con `lerobot-rollout`. No hay resultados de evaluación publicados por el autor, de modo que debe tratarse como una política experimental de tarea única.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer encoder-decoder con CVAE y extractores visuales convolucionales; método descrito en arXiv:2304.13705 |
| Parametros totales | 51.668.614 (≈51,7 M) |
| Longitud de contexto | no disponible (no aplica: no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica: la model card solo declara una instruccion de tarea en ingles; el modelo consume estado e imagenes) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Tipo de pipeline | robotics (politica de control) |
| Tipo de robot | `so_follower` |
| Camaras de entrada | `front_view`, `top_view` |
| Entradas | `observation.state` (6,), `observation.images.front_view` (3, 480, 640), `observation.images.top_view` (3, 480, 640) |
| Salidas | `action` (6,) |
| Tamano del repositorio | 0,2 GB |
| Dataset de entrenamiento | hlmnrkmn737/convertible_pos_BToC_FineTuned_20260925_recomputed_stats |
| Episodios / fotogramas | 90 episodios / 90.183 fotogramas a 30 FPS |
| Descargas / likes | 0 descargas / 1 like |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion que predice fragmentos de acción (*action chunks*) en lugar de un unico paso, lo que reduce el horizonte efectivo de decision y mitiga el error de acumulacion. La formulacion original combina un transformer encoder-decoder con un CVAE: un encoder procesa la secuencia de observaciones y acciones para inferir una variable latente de estilo, y el decoder genera el chunk de acciones. Las observaciones visuales se procesan con respaldos convolucionales antes de entrar en el transformer. En inferencia es habitual aplicar *temporal ensembling* sobre chunks solapados, aunque la model card no confirma la configuracion concreta usada en este checkpoint.

El entrenamiento se realizo con LeRobot 0.6.0 durante 10.000 pasos, con tamano de lote 8, optimizador AdamW, tasa de aprendizaje 1e-05 y semilla 1000. El dataset consta de 90 episodios y 90.183 fotogramas a 30 FPS, lo que equivale a unos 50 minutos de datos de teleoperacion (cifra derivada de los fotogramas y la tasa declarada). Las tareas registradas son "pick up the convertible platform from front edge position to left edge position" y su variante "Pick up the convertible platform from Front Edge position on support to Left Edge position". No se documenta uso de RLHF, DPO ni ninguna fase de refinamiento posterior; se trata de aprendizaje por imitacion puro sobre demostraciones.

## Capacidades

- Generacion de comandos de accion continuos de 6 dimensiones para un robot de tipo `so_follower` a partir de estado articular y dos vistas de camara.
- Prediccion de chunks de accion en lugar de pasos sueltos, lo que da estabilidad al control en tareas de pick-and-place.
- Ejecucion de una tarea especifica de manipulacion: traslado de una plataforma convertible de la posicion de borde frontal a la de borde izquierdo.
- Control visual bimanual/cenital: combina una vista frontal y una vista superior a 480x640 y 30 FPS.
- Integracion nativa con el ecosistema LeRobot: carga con `--policy.path`, entrenamiento con `--policy.type=act` y ejecucion con `lerobot-rollout`.
- Soporte de tool calling: no disponible (no aplica, no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica).
- Capacidades multilingues: no disponible (no aplica; el prompt de tarea se usa como texto de contexto, no como entrada linguistica procesada por el modelo).
- Modo *thinking*, vision-lenguaje, audio o generacion de texto/codigo: no disponible (no aplica).

## Casos de uso

- Automatizacion de una celda de pick-and-place concreta: el modelo puede ejecutar el ciclo de recogida y deposito de la plataforma convertible sobre un robot So follower, siempre que las posiciones de origen y destino coincidan con las de entrenamiento.
- Punto de partida para fine-tuning de tareas similares: al ser una politica ACT pequena (51,7 M de parametros) entrenada con LeRobot, sirve como inicializacion para reentrenar con nuevas posiciones, objetos o utillajes.
- Banco de pruebas de infraestructura de robotica: permite validar el pipeline completo (`lerobot-rollout`, calibracion de camaras, puerto del robot, frecuencia de control a 30 FPS) antes de invertir en datasets mayores.
- Baseline en investigacion sobre action chunking: util para comparar variantes de chunk size, temporal ensembling o esquemas de aumento de datos frente a una politica ACT ya entrenada y reproducible.
- Evaluacion comparativa de politicas en LeRobot: al compartir formato safetensors y libreria, se puede contrastar contra Diffusion Policy u otras politicas del mismo framework sobre el mismo robot y utilaje.
- Docencia y demostraciones de aprendizaje por imitacion: el repositorio es ligero (0,2 GB) y ejecutable en GPU de consumo, lo que facilita montar practicas de robotica con un robot de bajo coste.
- Generacion de datos sinteticos de evaluacion: ejecutar la politica en bucle para caracterizar modos de fallo (agarre fallido, colision, desviacion de trayectoria) antes de un despliegue real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente: "No evaluation results have been provided for this policy yet", y deja la tabla de evaluacion (tarea, intentos, exitos, tasa de exito) sin rellenar. No se dispone, por tanto, de tasas de exito en robot real, ni de comparaciones con otras politicas sobre el mismo dataset.

## Requisitos de hardware

- Parametros: 51.668.614, equivalentes a unos 0,2 GB de pesos en fp32; coincide con el tamano del repositorio (0,2 GB).
- VRAM estimada para inferencia: del orden de 0,5 a 2 GB contando activaciones de dos flujos de imagen a 480x640. Es una estimacion derivada del tamano de pesos y no un dato confirmado por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. No se requiere A100 ni H100; una RTX 3060, RTX 4060 o RTX 4090 es mas que suficiente. Tambien es viable una GTX 1650 o similar para inferencia.
- Cabe en GPU de consumo: si, con margen amplio. Tambien puede ejecutarse en CPU o en Apple Silicon (MPS) configurando `--policy.device`, a costa de mayor latencia.
- Opciones de despliegue: `lerobot-rollout` con `--policy.path=hlmnrkmn737/convertible_pos_BToC_fineTuned_act` y `--strategy.type=base`; PyTorch como runtime; entrenamiento posterior con `lerobot-train --policy.type=act`. No aplican vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Requisitos de integracion: puerto del robot (`--robot.port`), calibracion del `so_follower` y dos camaras OpenCV con nombres que coincidan exactamente con `front_view` y `top_view` a 640x480 y 30 FPS.
- Latencia y throughput: no disponible. La tasa de referencia del dataset es 30 FPS, por lo que se espera un bucle de control del orden de 30 Hz, pero no hay mediciones publicadas de latencia por chunk ni de acciones por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|
| ACT (este modelo) | 51,7 M | estado 6D + 2 RGB 480x640 | Apache-2.0 | Hugging Face, listo para `lerobot-rollout` |
| ACT de referencia (paper arXiv:2304.13705) | no disponible en la informacion proporcionada | estado + imagenes | no disponible en la informacion proporcionada | codigo y pesos publicados por los autores |
| Diffusion Policy (implementacion en LeRobot) | no disponible en la informacion proporcionada | imagenes + estado (depende de la configuracion) | no disponible en la informacion proporcionada | integrado en LeRobot |
| SmolVLA (Hugging Face) | no disponible en la informacion proporcionada | vision + lenguaje + estado | no disponible en la informacion proporcionada | Hugging Face y LeRobot |

La comparacion cuantitativa no es posible con los datos disponibles: la model card de este checkpoint no publica tasas de exito ni comparaciones, y las alternativas citadas pertenecen a familias distintas (difusion frente a chunking transformer; VLM con experto de accion frente a politica puramente visual-motora). La diferencia cualitativa mas relevante es que este modelo esta especializado en una unica tarea y no acepta instrucciones en lenguaje, mientras que propuestas como SmolVLA si incorporan condicionamiento linguistico.

## Limitaciones y advertencias

- Politica de tarea unica: no generaliza a otras tareas, objetos o disposiciones del entorno fuera de la distribucion de los 90 episodios de entrenamiento.
- Dataset reducido: unos 50 minutos de teleoperacion y 90 episodios, lo que aumenta el riesgo de sobreajuste a la iluminacion, a las posiciones exactas y al utilaje concretos de la recogida.
- Ausencia total de evaluacion: no hay tasa de exito, numero de intentos ni analisis de modos de fallo publicados; no se puede afirmar que la politica funcione de forma fiable.
- Acoplamiento al hardware: esta entrenada para un robot `so_follower` y para dos camaras con nombres e indices concretos (`front_view`, `top_view`). Cambiar la cinematica, la calibracion o la colocacion de las camaras invalida la politica.
- Riesgo fisico en lugar de alucinacion: el modelo no genera texto, pero puede producir trayectorias erroneas o inestables que provoquen colisiones, agarres fallidos o danos al utilaje. Es obligatorio operar con paradas de emergencia y limites de par.
- Sin capacidades de lenguaje, tool calling ni razonamiento multi-paso: no puede interpretar instrucciones nuevas ni encadenar subtareas de forma autonoma.
- Sesgos: no se documenta analisis de sesgo; al aprender de un unico operador y un unico entorno, hereda sus sesgos de estilo de teleoperacion.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero conviene revisar las licencias de las dependencias (LeRobot, PyTorch, pesos de los respaldos visuales) antes de un despliegue en produccion.
- Idiomas: no aplica soporte multilingue; no hay evidencias de que el prompt de tarea module el comportamiento.
- Versionado: entrenado con LeRobot 0.6.0; cambios de version en la libreria pueden alterar la carga del checkpoint o el comportamiento del rollout.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hlmnrkmn737/convertible_pos_BToC_fineTuned_act
- Dataset de entrenamiento: https://huggingface.co/datasets/hlmnrkmn737/convertible_pos_BToC_FineTuned_20260925_recomputed_stats
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=hlmnrkmn737/convertible_pos_BToC_FineTuned_20260925_recomputed_stats
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Paper de ACT en arXiv: https://arxiv.org/abs/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

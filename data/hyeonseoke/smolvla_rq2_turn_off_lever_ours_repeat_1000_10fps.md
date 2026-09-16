# HyeonseokE/smolvla_rq2_turn_off_lever_ours_repeat_1000_10fps

## Resumen

SmolVLA es un modelo compacto de vision-lenguaje-accion (VLA) disenado para control robotico de bajo coste computacional. Este repositorio concreto, `HyeonseokE/smolvla_rq2_turn_off_lever_ours_repeat_1000_10fps`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre un unico conjunto de datos de demostraciones teleoperadas, y su proposito es ejecutar una tarea especifica: accionar una palanca para apagarla hasta que el indicador de estado se ponga en rojo. No es un modelo de proposito general, sino una politica de imitacion entrenada para un robot y un entorno concretos.

El modelo tiene 450.046.176 parametros (aproximadamente 450 millones), se distribuye en formato safetensors y ocupa 0,9 GB en el repositorio. Se usa a traves de la libreria LeRobot (version 0.6.0 en el entrenamiento) y esta pensado para desplegarse en hardware de consumo, en linea con la motivacion del articulo SmolVLA (arXiv:2506.01844). El robot objetivo es un `so101_follower` con dos camaras declaradas (`top` y `left_wrist`).

Su relevancia es acotada pero clara: sirve como ejemplo reproducible de como adaptar un VLA pequeno a una tarea industrial sencilla con 100 episodios de datos a 10 FPS, y como referencia para evaluar la viabilidad de politicas VLA en GPU de gama media. No se han publicado resultados de evaluacion en el repositorio, por lo que el rendimiento real de la politica no esta cuantificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en SmolVLA; backbone VLM compacto con cabeza de accion |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica como ventana de LLM; la politica se condiciona por observaciones y una instruccion de tarea) |
| Tipos de cuantizacion | no especificados por el autor (pesos publicados en safetensors de precision completa) |
| Idiomas soportados | no disponible (la instruccion de tarea se proporciona en ingles: "Turn the lever off; the status indicator should turn red.") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,9 GB |
| Biblioteca | lerobot |
| Modelo base | lerobot/smolvla_base |
| Tipo de robot | so101_follower |
| Camaras | top, left_wrist (la model card declara tres entradas visuales: camera1, camera2, camera3) |

## Arquitectura y entrenamiento

Se trata de una politica VLA derivada de la familia SmolVLA descrita en el articulo arXiv:2506.01844, que combina un modelo de vision-lenguaje compacto con un modulo de generacion de acciones, con el objetivo declarado de lograr rendimiento competitivo a un coste computacional reducido y desplegable en hardware de consumo. El autor no detalla en la model card la composicion exacta de capas, el mecanismo de generacion de acciones ni el numero de tokens de vision utilizados; esos detalles deben consultarse en el articulo citado. El modelo final es un fine-tuning completo del checkpoint `lerobot/smolvla_base`.

Las entradas declaradas son `observation.state` con forma `(6,)` y tres imagenes de `(3, 256, 256)` (`observation.images.camera1`, `camera2` y `camera3`). Las salidas son `action` con forma `(6,)` y `action.radian_urdf0` con forma `(6,)`. El entrenamiento se realizo con LeRobot 0.6.0 durante 17.100 pasos, con tamano de lote 64, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. El conjunto de datos empleado es `HyeonseokE/rq2_turn_off_lever_ours_repeat_100_10fps`, con 100 episodios, 21.896 fotogramas y una frecuencia de captura de 10 FPS, todos ellos correspondientes a la misma tarea. No se menciona uso de RLHF, DPO ni de decodificacion especulativa.

Conviene senalar una discrepancia de nomenclatura: el identificador del modelo incluye `repeat_1000` mientras que el identificador del dataset referenciado en las etiquetas y en la model card incluye `repeat_100`. No se documenta si se trata de dos recopilaciones distintas o de un error de nombrado.

## Capacidades

- Generacion de acciones de robot de 6 grados de libertad a partir de observaciones visuales y del estado articular, en el dominio especifico de la tarea entrenada.
- Ejecucion de una tarea de manipulacion concreta: accionar la palanca para apagarla hasta que el indicador de estado cambie a rojo.
- Condicionamiento por instruccion textual de tarea; la unica instruccion documentada es "Turn the lever off; the status indicator should turn red.".
- Consumo de tres flujos de imagen de 256x256 mas un vector de estado de 6 dimensiones.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes ni capacidades de audio.
- No se documenta capacidad multilingue; el condicionamiento textual conocido esta en ingles.
- No hay modo de razonamiento explicito (thinking mode) ni salida de texto libre: la salida es exclusivamente accion.

## Casos de uso

- Automatizacion de una celda de manipulacion concreta: la politica se ejecuta en un robot `so101_follower` para apagar la palanca y verificar el cambio de indicador, sustituyendo la teleoperacion repetitiva en entornos de laboratorio.
- Banco de pruebas para investigacion en imitacion: sirve como punto de partida reproducible para comparar tecnicas de fine-tuning de VLA con pocos datos (100 episodios, 21.896 fotogramas), manteniendo fijo el modelo base `lerobot/smolvla_base`.
- Prototipado rapido en hardware de consumo: al tratarse de un modelo de ~450 M de parametros y 0,9 GB, puede desplegarse en una GPU de gama media para validar un pipeline completo de percepcion y control sin acceso a clúster.
- Generacion de datos sinteticos o aumentados: las trayectorias producidas por la politica pueden usarse como referencia para comparar contra demostraciones humanas registradas a 10 FPS.
- Evaluacion de robustez ante variaciones de iluminacion y posicion: al estar entrenada sobre un unico conjunto de datos, es un caso util para medir degradacion cuando cambian las condiciones respecto al dataset original.
- Formacion y docencia en robotica: el flujo `lerobot-rollout` permite ejecutar la politica en 60 segundos por defecto, lo que facilita demostraciones en clase o talleres con un robot SO-101.
- Integracion en pruebas de regresion de politicas: puede incluirse en una bateria de tareas fijas para detectar cambios en el comportamiento al actualizar versiones de LeRobot o del firmware del robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica ("No evaluation results have been provided for this policy yet.") y no incluye tabla de exitos ni tasa de acierto en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB en fp32 (450 M de parametros x 4 bytes), unos 0,9 GB en fp16/bf16 y en torno a 0,45 GB en int8 si se aplica cuantizacion, aunque el autor no publica pesos cuantizados.
- Cabe sin problema en GPU de consumo: cualquier tarjeta con 4 GB o mas de VRAM deberia ser suficiente para los pesos y las activaciones del codificador visual a 256x256.
- GPU recomendadas: RTX 3060, RTX 4060, RTX 4090, A100 o H100; para esta politica concreta las GPU de gama alta no aportan ventaja relevante frente a una GPU de consumo moderna.
- Opciones de despliegue: LeRobot mediante el comando `lerobot-rollout` (con `--strategy.type=base` se ejecuta sin grabar episodios), sobre PyTorch con dispositivo `cuda`. No se documenta soporte de vLLM, TGI, llama.cpp ni Ollama para este modelo.
- Latencia y throughput: no disponibles. El autor no publica tiempos de inferencia; el unico dato temporal es la frecuencia de captura del dataset, 10 FPS, no necesariamente la frecuencia de control del modelo en ejecucion.
- Requiere hardware robotico especifico: un SO-101 follower con las camaras configuradas con los mismos nombres de observacion (`top`, `left_wrist` / `camera1`, `camera2`, `camera3`) que en el entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / condicionamiento | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| smolvla_rq2_turn_off_lever_ours_repeat_1000_10fps | 450.046.176 | Tarea unica, instruccion textual en ingles | apache-2.0 | HuggingFace, via LeRobot | Fine-tuning especifico; sin resultados de evaluacion publicados |
| lerobot/smolvla_base | no disponible | Modelo base VLA generalista | no disponible en la informacion proporcionada | HuggingFace | Punto de partida del fine-tuning; el autor no reproduce sus cifras |
| Otras politicas de LeRobot (ACT, Diffusion Policy, pi0) | no disponible | Modelos de imitacion de proposito general o por tarea | no disponible en la informacion proporcionada | HuggingFace / repositorio LeRobot | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la informacion proporcionada, por lo que la comparacion se limita a parametros conocidos y disponibilidad.

## Limitaciones y advertencias

- Especializacion extrema: la politica esta entrenada para una unica tarea ("Turn the lever off; the status indicator should turn red.") y no es reutilizable tal cual para otras tareas sin un nuevo fine-tuning.
- Sin evaluacion publicada: no existe tasa de exito ni numero de ensayos, por lo que no puede afirmarse que la politica funcione de forma fiable en produccion.
- Sesgos de dominio: el rendimiento dependera de la distribucion del dataset original (posiciones, iluminacion, fondo, robot concreto); cambios en el entorno pueden degradar el comportamiento de forma no cuantificada.
- Riesgo de fallo silencioso en robot real: al no haber metricas de robustez, cualquier despliegue deberia acompanarse de limites de par, paradas de emergencia y supervision humana.
- Dependencia de hardware: requiere un SO-101 follower y camaras con los nombres de observacion esperados; una discrepancia en los nombres o en la calibracion provoca fallos de ejecucion de la politica.
- Ambiguedad en el nombrado del dataset: el modelo referencia `repeat_1000` en el identificador y `repeat_100` en las etiquetas y la model card; conviene verificar que el conjunto de datos usado es el esperado.
- Idiomas: no se documenta soporte multilingue; la instruccion conocida esta en ingles.
- Licencia: apache-2.0, que permite uso comercial y modificacion, pero el modelo base `lerobot/smolvla_base` y el paper citado deben consultarse por si imponen condiciones adicionales de atribucion.
- Uso de datos: el dataset de demostraciones puede contener informacion del entorno de captura; conviene revisar su licencia y condiciones antes de redistribuirlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HyeonseokE/smolvla_rq2_turn_off_lever_ours_repeat_1000_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/rq2_turn_off_lever_ours_repeat_100_10fps
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HyeonseokE/rq2_turn_off_lever_ours_repeat_100_10fps
- Articulo SmolVLA (pagina de papers de HuggingFace): https://huggingface.co/papers/2506.01844
- Articulo SmolVLA en arXiv: https://arxiv.org/abs/2506.01844
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI de LeRobot: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference

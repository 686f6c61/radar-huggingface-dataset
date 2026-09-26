# satyamtud/smolvla_so101

## Resumen

`satyamtud/smolvla_so101` es un ajuste fino del modelo vision-language-action (VLA) SmolVLA, desarrollado por el usuario satyamtud y publicado en Hugging Face a través de la librería LeRobot. SmolVLA es un modelo compacto de 450 millones de parámetros que combina un VLM preentrenado de tamano reducido con un "action expert" entrenado mediante flow matching: recibe varias imagenes de camara mas una instruccion de lenguaje y emite un chunk de acciones de robot. El modelo base, `lerobot/smolvla_base`, esta descrito en el paper arXiv:2506.01844.

Este checkpoint concreto ha sido entrenado sobre el dataset `satyamtud/so101_cube_pick`, compuesto por 50 episodios de teleoperacion (44.772 frames a 30 FPS) de una tarea unica: coger un cubo y dejarlo en una caja con un brazo SO-101 en configuracion seguidor (`so_follower`). Se trata, por tanto, de una politica de manipulacion especializada y de proposito limitado, no de un modelo de lenguaje generalista.

Su relevancia practica radica en dos factores: el tamano (450 M de parametros, repo de 0,9 GB) permite entrenar y ejecutar la politica en hardware de consumo, y la licencia Apache-2.0 elimina fricciones para uso comercial. El modelo no incluye resultados de evaluacion en robot real ni metricas de exito publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA): VLM compacto preentrenado + action expert entrenado con flow matching |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el modelo consume imagenes y una instruccion de tarea; no se documenta ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; la model card no lista GGUF, INT8 ni otras variantes) |
| Idiomas soportados | no disponible (la instruccion de tarea del dataset esta en ingles: "Pick up the cube and place it in the box") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 0,9 GB) |

Datos adicionales de entrada/salida declarados por el autor:

| Feature | Tipo | Forma |
|---|---|---|
| `observation.state` | STATE | `(6,)` |
| `observation.images.camera1` | VISUAL | `(3, 256, 256)` |
| `observation.images.camera2` | VISUAL | `(3, 256, 256)` |
| `observation.images.camera3` | VISUAL | `(3, 256, 256)` |
| `observation.images.empty_camera_0` | VISUAL | `(3, 480, 640)` |
| `action` | ACTION | `(6,)` |

## Arquitectura y entrenamiento

SmolVLA sigue un diseno de VLA ligero: un VLM preentrenado de pequeno tamano procesa las imagenes y la instruccion en lenguaje, y un modulo especifico (action expert) genera las acciones mediante flow matching, emitiendo un chunk de acciones en lugar de una accion aislada. Este checkpoint parte de `lerobot/smolvla_base` y se ajusta por imitacion supervisada sobre demostraciones de teleoperacion, sin que la model card documente etapas de RLHF o DPO (poco habituales en politicas de robotica de imitacion).

La configuracion de entrenamiento declarada es la siguiente: 20.000 pasos, batch size 2, optimizador AdamW, learning rate 0,0001, semilla 1000 y LeRobot 0.6.2. Con un batch de 2, el entrenamiento ha procesado del orden de 40.000 muestras sobre un dataset de 44.772 frames, es decir, aproximadamente una epoca o menos. El dataset de entrenamiento contiene 50 episodios a 30 FPS de la tarea "Pick up the cube and place it in the box", con un robot `so_follower`. No se documenta composicion adicional del dataset, aumentos de datos ni estrategias de regularizacion.

## Capacidades

- Generacion de acciones de manipulacion: dado el estado del robot (vector de 6 dimensiones) y varias vistas de camara, produce un vector de accion de 6 dimensiones.
- Condicionamiento por lenguaje: acepta una instruccion de tarea en texto ("Pick up the cube and place it in the box" en el caso entrenado).
- Percepcion visual multi-camara: consume hasta cuatro entradas visuales segun la model card (tres a 256x256 y una a 480x640).
- Ejecucion de politicas de imitacion en robot real mediante el flujo `lerobot-rollout` de LeRobot.
- Ajuste fino adicional sobre nuevos datasets con `lerobot-train`.
- Tool calling / function calling: no aplica ni esta documentado; es una politica robotica, no un modelo de lenguaje con interfaz de herramientas.
- Soporte de agentes y razonamiento multi-paso: no documentado; la politica genera chunks de acciones, no cadenas de razonamiento explicitas.
- Capacidades multilingues: no documentadas (no disponible).
- Capacidades especiales (modo thinking, vision general, audio): no disponibles.

## Casos de uso

- Manipulacion pick-and-place con brazo SO-101: la politica esta entrenada especificamente para coger un cubo y depositarlo en una caja, por lo que su uso directo es replicar esa tarea en un montaje SO-101 equivalente.
- Base para ajuste fino de nuevas tareas: dado su tamano de 450 M de parametros y su licencia Apache-2.0, sirve como punto de partida para entrenar politicas propias con `lerobot-train` sobre datasets de teleoperacion propios, sin coste de licencia.
- Docencia y laboratorios de robotica: al ejecutarse en GPU de consumo y con una cadena de herramientas documentada (grabar datos, entrenar, desplegar), es adecuado para cursos de imitation learning y VLA con presupuesto reducido.
- Prototipado rapido de estaciones de recogida: en una celda con objetos de geometria y color similares al cubo del dataset y con iluminacion controlada, permite validar un flujo de automatizacion completo antes de invertir en modelos mayores.
- Investigacion en eficiencia de politicas VLA: con 450 M de parametros y un repo de 0,9 GB, es un banco de pruebas asequible para estudiar tecnicas de cuantizacion, destilacion o reduccion de latencia en inferencia robotica.
- Generacion de datos sinteticos o evaluacion comparativa de checkpoints: otros ajustes de la misma base sobre SO-101 (por ejemplo, variantes con 100 episodios publicadas por otros usuarios) permiten comparar el efecto del volumen de demostraciones sobre la misma arquitectura.
- Demostraciones y material divulgativo: se puede grabar un GIF o video de la politica en funcionamiento e integrarlo en la model card, tal como sugiere la propia plantilla de LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye explicitamente la advertencia de que no se han proporcionado resultados de evaluacion para esta politica ("No evaluation results have been provided for this policy yet"), y no hay tabla de tareas, numero de intentos ni tasa de exito en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,9 GB solo para los pesos en fp16 (450 M de parametros x 2 bytes) y alrededor de 1,8 GB en fp32, a lo que hay que sumar activaciones de las cuatro entradas visuales; en la practica se puede esperar un pico del orden de 2 a 4 GB (estimacion aritmetica, no confirmada por el autor).
- GPU recomendadas: no hay lista oficial. Por tamano, cualquier GPU moderna con al menos 4 GB de VRAM es suficiente para inferencia.
- Cabe en GPU de consumo: si. Se han publicado guias de ajuste fino de SmolVLA en una RTX 3090, lo que sugiere que el entrenamiento tambien es viable en gama alta de consumo (24 GB).
- Opciones de despliegue: LeRobot, mediante la CLI `lerobot-rollout` con `--policy.path=satyamtud/smolvla_so101`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a una politica de robotica.
- Latencia y throughput: no disponibles. El dataset de entrenamiento se grabo a 30 FPS, pero la model card no publica latencia de inferencia ni frecuencia de control alcanzable.
- Nota de integracion: hay que definir `--robot.port` y los nombres e indices de camara, y los nombres de camara deben coincidir con las claves de observacion con las que se entreno la politica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `satyamtud/smolvla_so101` | 450 M | 4 entradas visuales + instruccion; salida de accion `(6,)` | apache-2.0 | Hugging Face (0 descargas, 0 likes en el momento de la consulta) | Ajuste fino de SmolVLA sobre 50 episodios de SO-101 |
| `lerobot/smolvla_base` | 450 M (misma familia) | no disponible | no disponible | Hugging Face | Modelo base preentrenado del que deriva este checkpoint; requiere ajuste fino para tareas concretas |
| `Askel1419/smolvla_so101_100EP` | no disponible | no disponible | no disponible | Hugging Face | Variante comunitaria de SmolVLA sobre SO-101 con 100 episodios, segun el nombre del repo |
| `Temmp1e/so101_smolVLA` | no disponible | no disponible | no disponible | Hugging Face | Otro ajuste de SmolVLA sobre SO-101 para tareas de agarre |
| OpenVLA (referencia de categoria) | ~7 B | no disponible | no disponible | Hugging Face | VLA de mayor tamano, citado habitualmente como alternativa; los datos de contexto, licencia exacta y rendimiento deben verificarse en su propia model card |

No se dispone de cifras de rendimiento comparadas para ninguno de estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluacion: el autor no publica tasa de exito ni numero de intentos, por lo que no hay evidencia cuantitativa de que la politica funcione de forma fiable.
- Dataset muy reducido: 50 episodios y 44.772 frames para una unica tarea, con 20.000 pasos de entrenamiento a batch 2, lo que equivale aproximadamente a una epoca o menos. La capacidad de generalizacion es previsiblemente baja.
- Especializacion estrecha: la politica esta condicionada a la tarea "Pick up the cube and place it in the box"; fuera de ese escenario (otros objetos, otras posiciones, otras tareas) su comportamiento no esta documentado.
- Sensibilidad al montaje fisico: cambios en la camara, la iluminacion, la posicion cinematicamente relevante del robot, el puerto del dispositivo o el tipo de brazo pueden degradar el comportamiento. Los nombres de camara deben coincidir exactamente con las claves de observacion del entrenamiento.
- Discrepancia en las camaras declaradas: la seccion de detalles menciona `camera1` y `camera2`, mientras que la tabla de entradas incluye `camera1`, `camera2`, `camera3` y `empty_camera_0`. Conviene verificar que configuracion de camaras espera realmente el checkpoint antes de desplegarlo.
- Entrada visual con nombre anomalo: `observation.images.empty_camera_0` a 480x640 sugiere una camara declarada pero no utilizada o mal configurada durante la recogida de datos; es un indicio de posible ruido en el dataset.
- Idiomas no documentados: no se especifica que idiomas acepta la instruccion de tarea; el unico ejemplo disponible esta en ingles.
- Riesgo de alucinacion en el sentido de acciones plausibles pero incorrectas: como toda politica de imitacion, puede generar trayectorias erroneas con alta confianza cuando el estado observado queda fuera de la distribucion de entrenamiento.
- Sesgos: no hay informacion sobre sesgos de dataset. Al tratarse de una politica robotica entrenada en un entorno fisico concreto, sus sesgos se manifiestan como preferencias por posiciones, colores y condiciones de iluminacion presentes en los 50 episodios.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero se debe conservar el aviso de licencia y citar LeRobot y el metodo SmolVLA segun lo indicado en la model card.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin demo ni video publicado; el repositorio esta en una fase muy temprana.
- Fecha de creacion reportada en el repositorio: 2026-09-25, dato que conviene contrastar directamente en Hugging Face por si procede de un error de metadatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/satyamtud/smolvla_so101
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/satyamtud/so101_cube_pick
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=satyamtud/so101_cube_pick
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Paper de SmolVLA (HTML en arXiv): https://arxiv.org/html/2506.01844v1
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de la CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Guia de ajuste fino de SmolVLA en SO-101: https://ggando.com/blog/smolvla-so101/
- Guia de ajuste fino de SmolVLA en SO-101 (Physical AI Field): https://www.physicalaifield.com/blog/fine-tune-smolvla-so-101-robot-arm/
- Variante comunitaria con 100 episodios: https://huggingface.co/Askel1419/smolvla_so101_100EP
- Variante comunitaria para SO-101: https://huggingface.co/Temmp1e/so101_smolVLA

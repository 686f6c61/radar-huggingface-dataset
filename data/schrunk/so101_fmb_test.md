# Schrunk/so101_FMB_test

## Resumen

Schrunk/so101_FMB_test es una política robotica de tipo vision-language-action (VLA) obtenida por ajuste fino del modelo base lerobot/smolvla_base sobre el dataset propio Schrunk/so101_FMB_merged. El modelo consume el estado articular de un brazo SO-101 (`so_follower`, vector de 6 dimensiones) y dos flujos de imagen de 3x480x640 (camaras `front` y `wrist`), y produce directamente un vector de accion de 6 dimensiones. Esta pensado para control por imitacion de tareas de manipulacion pick-and-place sobre hardware de bajo coste.

Tecnicamente se apoya en SmolVLA, un VLA compacto descrito por sus autores como eficiente y con coste computacional reducido, desplegable en hardware de consumo. El repositorio pesa 1,2 GB y el checkpoint contiene 450.046.176 parametros (aproximadamente 450 millones), un orden de magnitud muy inferior al de los VLA de gran tamano, lo que lo hace candidato a inferencia en tiempo real en una GPU de gama media o incluso en CPU.

Su relevancia practica es doble: por un lado demuestra el flujo completo de LeRobot para grabar datos, entrenar y desplegar una política sobre un robot real; por otro, sirve como ejemplo reproducible de ajuste fino de SmolVLA en un dataset pequeno (51 episodios, 66.599 fotogramas). No obstante, el autor no ha publicado ninguna evaluacion en robot real, por lo que su tasa de exito efectiva es desconocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) sobre transformer multimodal; combina codificacion visual, modelo de lenguaje y cabezal de prediccion de acciones (detalles completos en el paper SmolVLA, arXiv:2506.01844) |
| Parametros totales | 450.046.176 (aproximadamente 450 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible; las instrucciones de tarea del dataset de entrenamiento estan en ingles ("pick up the yellow cuboid and place it in assembly board", "pick up the red cylinder and place it in assembly board") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | lerobot (version 0.6.2 usada en el entrenamiento) |
| Modelo base | lerobot/smolvla_base (ajuste fino) |
| Tipo de robot | so_follower (SO-101) |
| Entradas | `observation.state` (6,), `observation.images.front` (3, 480, 640), `observation.images.wrist` (3, 480, 640) |
| Salidas | `action` (6,) |
| Pipeline declarado | robotics |

## Arquitectura y entrenamiento

La arquitectura es la de SmolVLA: un modelo vision-language-action compacto que, segun la model card, alcanza rendimiento competitivo con un coste computacional reducido y puede desplegarse en hardware de consumo. La política concreta de este repositorio no modifica la arquitectura del modelo base; se trata de un ajuste fino con LeRobot que adapta el VLA a un unico cuerpo robotic (SO-101 follower) con dos camaras y un espacio de acciones de 6 grados de libertad. La entrada combina estado proprioceptivo de 6 dimensiones con dos imagenes RGB de 480x640, y la salida es directamente el vector de accion de 6 dimensiones, sin pipeline de control externo.

El entrenamiento es de imitacion supervisada (behavior cloning) sobre el dataset Schrunk/so101_FMB_merged: 51 episodios, 66.599 fotogramas a 30 FPS, cubriendo dos tareas de colocacion de piezas en un tablero de ensamblaje (un cuboide amarillo y un cilindro rojo). La configuracion declarada es de 5.000 pasos, batch de 32, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. No se documenta en la informacion disponible el uso de RLHF, DPO ni ninguna fase de refinamiento posterior al ajuste por imitacion, ni se detallan los datos de preentrenamiento del modelo base. Tampoco se describen innovaciones tecnicas anadidas respecto a SmolVLA (decodificacion especulativa, atencion lineal u otras).

## Capacidades

- Generacion de acciones motoras de 6 grados de libertad para un brazo SO-101 (`so_follower`) a partir de observaciones multimodales.
- Percepcion visual dual: procesa simultaneamente una camara frontal y una camara de muneca a 480x640, lo que permite corregir la aproximacion al objeto durante la manipulacion.
- Condicionamiento por instruccion en lenguaje natural: la tarea se especifica en el momento de la inferencia mediante el argumento `--task` de `lerobot-rollout`.
- Ejecucion de dos tareas concretas de pick-and-place aprendidas: "pick up the yellow cuboid and place it in assembly board" y "pick up the red cylinder and place it in assembly board".
- Control en bucle cerrado a 30 FPS, la frecuencia de captura del dataset de entrenamiento.
- Integracion con el ecosistema LeRobot mediante la CLI (`lerobot-rollout` para inferencia, `lerobot-train` para reentrenamiento).
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso explicito, vision general de proposito general, audio ni modo de pensamiento; es una política robotica, no un asistente de texto.

## Casos de uso

- Manipulacion pick-and-place en linea de ensamblaje: la política coloca piezas concretas (cuboide amarillo, cilindro rojo) en un tablero de ensamblaje, tarea para la que fue entrenada explicitamente con 51 episodios y 66.599 fotogramas.
- Base para ajuste fino en tareas nuevas: sirve como punto de partida rapido para reentrenar con `lerobot-train` sobre un dataset propio de pocas decenas de episodios, replicando exactamente la configuracion declarada (5.000 pasos, batch 32, lr 1e-4).
- Prototipado de bajo coste en robotica educativa: el modelo base SmolVLA esta disenado para hardware de consumo, y el repositorio pesa solo 1,2 GB, por lo que puede ejecutarse en un puesto de laboratorio o en un equipo de estudiante sin GPU de datacenter.
- Validacion de pipelines de imitacion end-to-end: permite comprobar en un robot real el ciclo completo de LeRobot (instalacion, calibracion de hardware, grabacion de datos, entrenamiento, rollout).
- Investigacion en generalizacion de políticas VLA: al ser un ajuste fino sobre dos tareas muy delimitadas, es un banco de pruebas util para medir sensibilidad a cambios de posicion de objetos, iluminacion o distracciones.
- Demostracion de control visual servoing con camara de muneca: el uso conjunto de `front` y `wrist` permite estudiar como contribuye cada vista a la precision de agarre en brazos de 6 GDL.
- Automatizacion de tareas repetitivas de clasificacion de piezas por color y forma dentro de un mismo tablero de ensamblaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica literalmente: "No evaluation results have been provided for this policy yet", y deja la tabla de evaluacion en robot real (tarea, intentos, exitos, tasa de exito) sin rellenar. No se dispone por tanto de tasas de exito, ni de comparaciones con otros checkpoints, ni de datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo propio a partir de los 450 M de parametros, no confirmado por el autor): aproximadamente 0,9 GB en bf16/fp16 y 1,8 GB en fp32 solo para los pesos, mas el coste de activaciones de dos flujos visuales de 480x640; en la practica se puede esperar un rango de 2 a 4 GB con batch 1.
- Cabe en GPU de consumo: si se confirma la estimacion anterior, cualquier GPU con 6 GB o mas de VRAM (por ejemplo RTX 3060, RTX 4060, RTX 4090) seria suficiente; la model card del modelo base afirma que SmolVLA puede desplegarse en hardware de consumo.
- Inferencia en CPU: la informacion disponible indica que SmolVLA es desplegable en hardware de consumo, pero no se aportan cifras de latencia en CPU para esta política concreta.
- Software de despliegue: LeRobot 0.6.2 o compatible (comando `lerobot-rollout`), con `policy.path=Schrunk/so101_FMB_test`. El modelo se distribuye en safetensors y esta pensado para ejecutarse con PyTorch sobre CUDA; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que son stacks de generacion de texto y no aplican a una política VLA.
- Hardware robotico necesario: brazo SO-101 en configuracion `so_follower` (6 GDL), dos camaras OpenCV configuradas a 640x480 y 30 FPS, con nombres que deben coincidir con las claves de observacion del entrenamiento (`front` y `wrist`).
- Latencia y throughput: no disponibles. El unico dato objetivo es la frecuencia de control de 30 FPS del dataset de entrenamiento, que marca el ritmo al que la política fue entrenada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Schrunk/so101_FMB_test | 450.046.176 | No disponible | Sin evaluacion publicada | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| lerobot/smolvla_base | No disponible en la informacion proporcionada (es el modelo base del ajuste) | No disponible | Rendimiento competitivo declarado por los autores de SmolVLA, sin cifras en la informacion disponible | No disponible en la informacion proporcionada | HuggingFace |
| Otras políticas del ecosistema LeRobot (ACT, Diffusion Policy, pi0) | No disponible | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |

La model card no incluye ninguna comparacion cuantitativa con modelos alternativos, y la busqueda web realizada no ha devuelto informacion relevante sobre este modelo ni sobre modelos comparables, por lo que no es posible establecer una comparativa de rendimiento con datos verificables.

## Limitaciones y advertencias

- Ausencia total de evaluacion: el autor no ha publicado tasa de exito en robot real. Cualquier uso en produccion debe ir precedido de una evaluacion propia con multiples intentos por tarea.
- Alcance muy restringido: la política solo ha visto dos tareas concretas (cuboide amarillo y cilindro rojo hacia el tablero de ensamblaje) sobre un unico tipo de robot y una unica configuracion de camaras. Es previsible un mal rendimiento ante objetos, posiciones o instrucciones distintas.
- Dataset pequeno: 51 episodios y 66.599 fotogramas son una base limitada para imitacion; el riesgo de sobreajuste a posiciones, iluminacion y fondo del entorno de grabacion es alto.
- Dependencia del hardware exacto: los nombres de camara deben coincidir con las claves de observacion (`front`, `wrist`), y el robot debe ser `so_follower` con estado de 6 dimensiones. Cambiar la cinematica o el montaje de camaras invalida la política.
- Posible alucinacion motora: como toda política de imitacion, puede generar trayectorias plausibles pero incorrectas, con riesgo de colisiones o danos en el brazo y en las piezas; se recomienda limitar velocidad, par y espacio de trabajo.
- Idiomas: las instrucciones de tarea estan en ingles y el modelo no declara soporte multilingue. No hay datos sobre comportamiento con instrucciones en castellano.
- Sesgos: no se documentan analisis de sesgo. Cabe esperar sesgo hacia las condiciones visuales del dataset de entrenamiento (iluminacion, fondo, posicion de las piezas).
- Licencia: apache-2.0, que permite uso comercial y modificacion, pero el repositorio es un experimento de prueba (el propio nombre contiene `_test`) con 0 descargas y 0 likes; conviene verificar la procedencia de los datos del dataset Schrunk/so101_FMB_merged antes de un uso comercial.
- Formato de pesos safetensors, sin versiones cuantizadas publicadas; el despliegue queda ligado a PyTorch y LeRobot.
- No hay informacion sobre el contexto de entrenamiento del modelo base, por lo que se desconoce que capacidades heredadas pueden manifestarse de forma no intencionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Schrunk/so101_FMB_test
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Schrunk/so101_FMB_merged
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Schrunk/so101_FMB_merged
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference

Nota: la busqueda web realizada no ha devuelto ningun enlace relacionado con el modelo; los resultados obtenidos eran convertidores de unidades de volumen y no se han incluido por no ser pertinentes.

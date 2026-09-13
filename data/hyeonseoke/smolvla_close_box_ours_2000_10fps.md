# HyeonseokE/smolvla_close_box_ours_2000_10fps

## Resumen

HyeonseokE/smolvla_close_box_ours_2000_10fps es una politica de robotica basada en SmolVLA, un modelo compacto de vision-lenguaje-accion (VLA) descrito en el paper arXiv:2506.01844. No se trata de un modelo de lenguaje conversacional, sino de una politica de imitacion que consume el estado del robot y flujos de imagen de varias camaras, y produce directamente comandos de accion de 6 dimensiones. El checkpoint es un fine-tuning de lerobot/smolvla_base realizado con LeRobot 0.6.0 sobre un unico conjunto de datos propio.

El modelo tiene 450.046.176 parametros (denso, sin mezcla de expertos) y ocupa 0,9 GB en el repositorio de HuggingFace en formato safetensors. Su tarea es cerrada y especifica: "Close the box by placing the lid on the box body", ejecutada sobre un robot SO-101 follower con camaras de muneca y vista superior. Se entreno durante 22.050 pasos con batch de 64 y tasa de aprendizaje 1e-4.

Su relevancia practica es doble. Por un lado, sirve como ejemplo reproducible de un flujo completo de imitation learning de bajo coste: 100 episodios, 28.246 fotogramas a 10 FPS y una receta de entrenamiento publica. Por otro, demuestra que un VLA de menos de 500 millones de parametros puede ejecutarse en hardware de consumo, algo que lo aleja de los VLA de miles de millones de parametros habituales en investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (SmolVLA), modelo denso de tipo transformer multimodal |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (la model card no declara ventana de contexto; la entrada es un prompt de tarea mas observaciones) |
| Tipos de cuantizacion | no disponible; el repositorio publica pesos en safetensors (0,9 GB, coherente con bf16/fp16). No se distribuyen variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible; la instruccion de tarea empleada esta en ingles ("Close the box by placing the lid on the box body.") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | so101_follower |
| Camaras declaradas | top, left_wrist |
| Dimension de estado de entrada | observation.state de forma (6,) |
| Dimension de accion de salida | action (6,) y action.radian_urdf0 (6,) |
| Modelo base | lerobot/smolvla_base |
| Libreria | lerobot 0.6.0 |

## Arquitectura y entrenamiento

La model card describe SmolVLA como un modelo compacto y eficiente de vision-lenguaje-accion que alcanza rendimiento competitivo con un coste computacional reducido y puede desplegarse en hardware de consumo. El checkpoint que nos ocupa no entrena desde cero: parte de lerobot/smolvla_base y se especializa por fine-tuning supervisado de imitacion sobre un unico conjunto de datos. La interfaz es estrictamente robotica: entradas de estado propioceptivo de 6 dimensiones y tres flujos visuales de (3, 256, 256) etiquetados como observation.images.camera1, camera2 y camera3, y salidas de accion de 6 dimensiones tanto en el espacio de comando como en radianes URDF (action.radian_urdf0). No se declara en la informacion disponible el uso de RLHF, DPO ni de decodificacion especulativa; el regimen es aprendizaje por imitacion sobre demostraciones.

El entrenamiento se realizo con LeRobot 0.6.0 sobre el dataset HyeonseokE/close_box_ours_10fps, compuesto por 100 episodios y 28.246 fotogramas capturados a 10 FPS, con la unica tarea de cerrar una caja colocando la tapa sobre el cuerpo. La configuracion declarada es de 22.050 pasos, batch de 64, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 2000 (semilla que aparece en el propio nombre del repositorio, lo que sugiere que existen otros checkpoints del mismo experimento con semillas distintas). No se especifican en la model card la composicion exacta del dataset, el numero de tokens multimodales vistos, ni si hubo aumentos de datos o regularizacion adicional.

## Capacidades

- Ejecucion de una tarea de manipulacion concreta: cerrar una caja colocando la tapa sobre el cuerpo, mediante control por imitacion.
- Control de un robot SO-101 follower con salida de accion continua de 6 grados de libertad.
- Fusion de percepcion multimodal: estado propioceptivo de 6 dimensiones mas tres imagenes RGB de 256x256 provenientes de camaras (top y left_wrist segun la model card).
- Condicionamiento por instruccion en lenguaje natural: la politica acepta el texto de la tarea ("Close the box by placing the lid on the box body."), aunque no se documenta un repertorio de instrucciones soportadas.
- Ejecucion de politicas en bucle cerrado con lerobot-rollout, incluyendo duracion configurable o ejecucion indefinida.
- Reentrenamiento y ajuste fino sobre datos propios mediante lerobot-train, lo que la convierte en una receta reutilizable.
- No soporta tool calling ni function calling: es una politica de accion, no un modelo de lenguaje con interfaz de herramientas.
- No soporta razonamiento multi-paso en lenguaje, agentes conversacionales, generacion de texto, codigo, matematicas ni preguntas y respuestas visuales.
- No se declaran capacidades multilingues; la unica instruccion documentada esta en ingles.
- No se declaran modos especiales (thinking, audio, video understanding generico).

## Casos de uso

- Automatizacion de cierre de cajas en linea de empaquetado: la politica ejecuta exactamente la tarea entrenada (colocar la tapa sobre el cuerpo de la caja) sobre un SO-101, por lo que encaja en una celda de trabajo de bajo coste dedicada a esa operacion repetitiva.
- Punto de partida para fine-tuning con datos propios: al ser un ajuste sobre lerobot/smolvla_base con receta publicada (AdamW, lr 1e-4, batch 64), un equipo puede reproducir el flujo con sus propios 100 episodios y su propia tarea de manipulacion.
- Banco de pruebas de imitation learning en robotics: sirve para comparar variantes de semilla, resolucion de camara o frecuencia de captura (el dataset esta a 10 FPS) y medir su efecto en la tasa de exito de la tarea.
- Estudio de robustez ante cambios de dominio: al estar entrenada con dos o tres vistas fijas, permite evaluar la degradacion al mover el objeto, cambiar la iluminacion o introducir distracciones, siempre que se instrumente un protocolo de repeticiones.
- Validacion en gemelo digital antes del despliegue fisico: la politica puede ejecutarse en entornos simulados compatibles con LeRobot para comprobar la estabilidad del bucle de control antes de tocar hardware.
- Docencia y divulgacion tecnica: es un ejemplo completo y trazable (dataset, configuracion, comando de rollout) para explicar el ciclo captura-entrenamiento-despliegue de un VLA compacto.
- Investigacion en eficiencia de VLA: con 450 millones de parametros y 0,9 GB de pesos, permite estudiar latencias y consumo en GPUs de gama media o en plataformas embebidas.
- Generacion de datos sinteticos de evaluacion: puede usarse como politica de referencia para comparar contra otros checkpoints de la misma familia en la misma tarea de cierre de caja.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion con la plantilla vacia y la nota explicita "No evaluation results have been provided for this policy yet.", por lo que no existe tasa de exito, numero de ensayos ni comparacion cuantitativa con otras politicas. El unico protocolo sugerido por el autor es ejecutar la politica varias veces por tarea y contar los exitos, registrando tambien las condiciones que afectan a la dificultad (posiciones nuevas del objeto, iluminacion, distractores, otro robot del mismo tipo). Cualquier cifra de rendimiento que se quiera usar en produccion debe generarse localmente con ese protocolo.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 0,9 GB, lo que sugiere pesos en bf16/fp16 (en fp32 serian aproximadamente 1,8 GB solo de parametros). Sumando activaciones y tres flujos de imagen de 256x256, una estimacion prudente es de 2 a 4 GB de VRAM. Es una estimacion, no un dato publicado.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Una RTX 3060 de 12 GB, una RTX 4070 o una RTX 4090 son mas que suficientes; no se requieren A100 ni H100 para inferencia.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna con 4 GB o mas. El entrenamiento completo a 22.050 pasos con batch 64 si conviene hacerlo en una GPU con 12-24 GB.
- Plataformas embebidas: la model card afirma que SmolVLA puede desplegarse en hardware de consumo, lo que abre la puerta a Jetson Orin u equivalentes, aunque no se aportan mediciones de latencia ni de consumo en esas plataformas.
- Opciones de despliegue: LeRobot (lerobot-rollout para ejecucion en robot, lerobot-train para reentrenamiento) sobre PyTorch. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de politica.
- Latencia y throughput: no disponible. El dataset de entrenamiento y el control estan a 10 FPS, pero no se publican cifras de latencia de inferencia por paso ni de frecuencia de control alcanzable en hardware concreto.
- Almacenamiento: menos de 1 GB para los pesos, mas el espacio del dataset HyeonseokE/close_box_ours_10fps para reentrenar.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HyeonseokE/smolvla_close_box_ours_2000_10fps | 450.046.176 | VLA denso, fine-tuning de tarea unica | no disponible | Apache 2.0 | HuggingFace, via LeRobot |
| lerobot/smolvla_base | no disponible en la informacion proporcionada | VLA denso, modelo base | no disponible | no disponible en la informacion proporcionada | HuggingFace, via LeRobot |
| Otros VLA de gran tamano (familia OpenVLA, pi0, etc.) | no disponible en la informacion proporcionada | VLA denso | no disponible | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada |

La comparacion cuantitativa no es posible con los datos disponibles: no hay benchmarks publicados para este checkpoint ni cifras de rendimiento del modelo base en la informacion proporcionada. La diferencia funcional mas relevante frente al modelo base es el alcance: smolvla_base es una base general de vision-lenguaje-accion, mientras que este checkpoint esta especializado en una unica tarea (cerrar una caja) sobre un unico tipo de robot (so101_follower).

## Limitaciones y advertencias

- Especializacion extrema: solo se ha entrenado para la tarea "Close the box by placing the lid on the box body". Fuera de ese objetivo no hay garantia de comportamiento util.
- Sin resultados de evaluacion: el autor no publica tasa de exito ni numero de ensayos, por lo que el rendimiento real en robot es desconocido.
- Riesgo de sobreajuste: 100 episodios y 28.246 fotogramas son un volumen reducido; es probable que la politica sea sensible a cambios de posicion del objeto, iluminacion, fondo o calibracion de camaras.
- Inconsistencia en la model card: la seccion de detalles declara dos camaras (top, left_wrist) mientras que la tabla de entradas lista tres flujos visuales (camera1, camera2, camera3). Antes de ejecutar la politica hay que verificar que los nombres y el numero de camaras configurados coinciden con las claves de observacion del entrenamiento.
- Restriccion de hardware fisico: las salidas estan atadas a un SO-101 follower y a 6 grados de libertad; no es transferible sin reentrenamiento a otro robot o a otro espacio de acciones.
- Acciones fuera de distribucion: como toda politica de imitacion, puede producir comandos inseguros ante entradas no vistas. Se recomienda limitar velocidades, definir paradas de emergencia y supervisar las primeras ejecuciones.
- Idioma: la unica instruccion documentada esta en ingles; no se declara soporte multilingue ni se describe un repertorio de instrucciones alternativas.
- Alucinacion: el concepto no aplica en el sentido de generacion de texto, pero si en el de acciones fisicas incoherentes con la tarea, que es un riesgo equivalente en produccion.
- Licencia: Apache 2.0 en este repositorio, lo que permite uso comercial. Conviene verificar las condiciones del modelo base lerobot/smolvla_base y la licencia del dataset HyeonseokE/close_box_ours_10fps si se va a reutilizar.
- Mantenimiento: cero descargas y cero likes en el momento de la consulta, sin senales de mantenimiento posterior ni actualizaciones tras su publicacion.
- Sin garantias de seguridad funcional: no hay analisis de fallos, certificaciones ni estudios de repetibilidad, por lo que no debe integrarse en procesos criticos sin validacion propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HyeonseokE/smolvla_close_box_ours_2000_10fps
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/HyeonseokE/close_box_ours_10fps
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=HyeonseokE/close_box_ours_10fps
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Guia de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Configuracion de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de imitacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Busqueda web: no se han recuperado resultados relevantes sobre el modelo; los unicos resultados devueltos corresponden a paginas de ayuda de Gmail y no guardan relacion con este repositorio.

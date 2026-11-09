# felsager/pi05_cube2cross_fp32

## Resumen

π₀.₅ (Pi05) es un modelo Vision-Language-Action (VLA) desarrollado por Physical Intelligence, disenado para generalizar a entornos y situaciones completamente nuevos que no se vieron durante el entrenamiento. Este repositorio concreto, `felsager/pi05_cube2cross_fp32`, es un fine-tuning del modelo base `lerobot/pi05_base` realizado por el usuario felsager mediante la libreria LeRobot, especializado en una tarea de manipulacion robotica concreta: coger un cubo de color y colocarlo sobre una cruz roja.

El modelo consume observaciones multimodales (estado del robot de 10 dimensiones y dos imagenes de camara de 480x640) y produce acciones de 10 dimensiones para un robot UR5e con mano. Esta entrenado sobre un dataset propio de 999 episodios y 510.363 frames a 30 FPS, cubriendo cuatro variantes de la tarea segun el color del cubo (verde, azul, amarillo y rojo).

Con 4.143.404.816 parametros y pesos en formato safetensors (fp32), es un modelo de gran tamano para inferencia robotica, pensado para ejecutarse en GPU. Su relevancia radica en ser un ejemplo practico de fine-tuning de un VLA de proposito general a una tarea industrial concreta mediante el ecosistema LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), evolucion de π₀ (transformer multimodal) |
| Parametros totales | 4.143.404.816 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo publicado en fp32) |
| Idiomas soportados | no disponible (modelo de robotica, no de texto general) |
| Licencia | gemma |
| Formato de pesos | safetensors |
| Tamano del repo | 42.6 GB |
| Tipo de robot | ur5e_hand_e |
| Camaras | top, wrist (480x640, 3 canales) |
| Entrada de estado | observation.state (10,) |
| Salida de accion | action (10,) |
| Modelo base | lerobot/pi05_base |
| Dataset de entrenamiento | felsager/vla_cubes_cross_dr (999 episodios, 510.363 frames, 30 FPS) |
| Libreria | lerobot 0.6.2 |

## Arquitectura y entrenamiento

π₀.₅ es la evolucion del modelo π₀ de Physical Intelligence, un VLA que combina un backbone de vision-lenguaje con un cabezal de acciones para control robotico. La implementacion disponible en este repositorio es la adaptacion de LeRobot del repositorio open source OpenPI de Physical Intelligence. El modelo procesa dos flujos de imagen (camara superior y de muneca) junto con el estado proprioceptivo del robot y genera un vector de accion de 10 dimensiones.

El fine-tuning se realizo sobre el dataset `felsager/vla_cubes_cross_dr` con 30.000 pasos de entrenamiento, batch size 8, optimizador AdamW y learning rate 5e-05, con semilla 0. El dataset contiene 999 episodios y 510.363 frames a 30 FPS, con cuatro tareas de instruccion en lenguaje natural correspondientes a los cuatro colores de cubo. No se dispone de informacion sobre la composicion completa del dataset, el numero de tokens de entrenamiento del modelo base ni sobre si se aplicaron tecnicas de RLHF o DPO en el modelo original.

## Capacidades

- Control robotico de manipulacion: genera acciones de 10 dimensiones para un UR5e con mano a partir de observaciones visuales y de estado.
- Percepcion visual multimodal: procesa simultaneamente dos camaras (superior y de muneca) a 480x640.
- Seguimiento de instrucciones en lenguaje natural: la tarea se especifica mediante una frase como "pick up the green cube and place it on the red cross.".
- Generalizacion a variantes de tarea: entrenado para cuatro colores de cubo (verde, azul, amarillo, rojo) sobre el mismo destino.
- Ejecucion en bucle cerrado: el script `lerobot-rollout` permite ejecutar la politica de forma continua durante un tiempo determinado.
- No se dispone de informacion sobre soporte de tool calling, agentes multi-paso, capacidades multilingues generales ni modos de razonamiento explicito.

## Casos de uso

- Pick-and-place industrial de cubos codificados por color: el modelo ejecuta la tarea de coger un cubo de un color especifico y depositarlo sobre una cruz roja, adecuado para lineas de clasificacion o ensamblaje donde la posicion de destino es fija.
- Prototipado rapido de politicas roboticas: sirve como punto de partida para equipos que quieran fine-tunear su propio VLA desde `lerobot/pi05_base` con su propio dataset, siguiendo el flujo `lerobot-train`.
- Investigacion en imitacion robotica: util como baseline reproducible para comparar tecnicas de aprendizaje por imitacion sobre un UR5e con configuracion de camaras estandar.
- Validacion de pipelines de datos: el dataset asociado (999 episodios, 510.363 frames) y el modelo permiten probar de extremo a extremo el flujo de LeRobot (grabacion, entrenamiento, rollout).
- Automatizacion de tareas de recogida en laboratorio: con la instruccion en lenguaje natural, el operador puede cambiar el objeto objetivo sin reentrenar, dentro de los cuatro colores soportados.
- Demostraciones y formacion: el modelo permite montar una demo funcional de manipulacion visual-lenguaje-accion en un robot UR5e real para presentaciones o docencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet." No se dispone de tasas de exito en robot real ni de metricas de simulacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 4.143.404.816 parametros en fp32, los pesos ocupan aproximadamente 16,6 GB, por lo que se necesita una GPU con al menos ~20 GB de VRAM para cargar el modelo en fp32 (el repo pesa 42,6 GB, incluyendo posiblemente checkpoints u otros artefactos).
- GPU recomendadas: no especificadas por el autor; por tamano, una A100 (40/80 GB), H100 o RTX 4090 (24 GB) serian candidatas razonables para fp32, aunque no esta confirmado.
- Cabe en consumer GPU: probablemente en RTX 4090 (24 GB) en fp32 segun el calculo de pesos, aunque no esta verificado por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=felsager/pi05_cube2cross_fp32`), y por extension el ecosistema OpenPI. No se indica soporte para vLLM, llama.cpp, Ollama o TGI (son herramientas orientadas a LLM de texto, no a politicas roboticas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| felsager/pi05_cube2cross_fp32 | 4.143.404.816 | no disponible | VLA para UR5e, pick-and-place de cubos | gemma | Hugging Face |
| lerobot/pi05_base | no disponible | no disponible | VLA base de proposito general | gemma | Hugging Face |
| π₀ (Pi0) de Physical Intelligence | no disponible | no disponible | VLA predecesor | no disponible en la informacion | OpenPI (open source) |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Tarea muy acotada: el modelo esta fine-tuneado exclusivamente para coger cubos de cuatro colores y colocarlos sobre una cruz roja; no se espera que generalice a otras tareas sin reentrenamiento.
- Dependencia de la configuracion de hardware: las entradas esperan exactamente un robot `ur5e_hand_e` con camaras `top` y `wrist` a 480x640; cualquier cambio de camaras, montaje o robot invalida la politica.
- Sin evaluacion publicada: no hay tasas de exito en robot real, por lo que se desconoce su fiabilidad en produccion.
- Riesgo de sobreajuste al dataset: con 999 episodios de una unica tarea, la generalizacion a nuevas posiciones, iluminacion o distractores es incierta.
- Licencia `gemma`: impone restricciones de uso comercial que deben revisarse antes de desplegar en produccion; no es una licencia permisiva tipo Apache o MIT.
- Sin informacion sobre sesgos, alucinacion o limitaciones de idioma: al ser un modelo de robotica, estas categorias no aplican directamente, pero no se han documentado comportamientos de fallo.
- Repositorio sin descargas ni likes: no hay evidencia de uso comunitario ni validacion externa.
- Formato fp32: el tamano de 42,6 GB y los pesos en fp32 encarecen el despliegue en comparacion con versiones cuantizadas, que no se ofrecen en este repo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felsager/pi05_cube2cross_fp32
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/felsager/vla_cubes_cross_dr
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=felsager/vla_cubes_cross_dr
- Blog de π₀.₅ de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: https://github.com/Physical-Intelligence/openpi
- LeRobot (GitHub): https://github.com/huggingface/lerobot
- Guia de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentacion de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference

# ravediamond/turbovla_so101_bowls

## Resumen

turbovla_so101_bowls es una politica robotica de tipo Vision-Language-Action (VLA) entrenada con LeRobot y publicada en HuggingFace por el usuario ravediamond. No es un modelo de lenguaje: es un controlador de manipulacion que consume el estado articular y las imagenes de dos camaras de un brazo SO-101 (configuracion `so_follower`) y produce directamente un vector de accion continuo de 6 dimensiones. El checkpoint contiene 209.286.150 parametros y ocupa 0,8 GB en el repositorio, con pesos en safetensors.

La politica esta especializada en dos tareas de pick-and-place: "Put the blue bowl in the pink bowl." y "Put the pink bowl in the blue bowl." Se entreno sobre el dataset `ravediamond/so101_bowls_all` (182 episodios, 69.897 frames a 30 FPS) durante 35.000 pasos con batch de 8, optimizador AdamW y learning rate de 5e-05. La arquitectura declarada en los metadatos es `turbovla_so101`, heredera del enfoque TurboVLA, que sustituye el uso de un LLM como interfaz central por una interaccion vision-lenguaje bidireccional ligera y un decodificador compacto que predice chunks de acciones.

Su relevancia es la de un ejemplo reproducible de VLA eficiente sobre hardware de robotica de bajo coste: el SO-101 es un brazo de escritorio accesible y el modelo cabe en GPUs de consumo. En el momento de redactar esta ficha el repositorio no tiene descargas ni likes y el autor no ha publicado ninguna evaluacion en robot real, por lo que debe tratarse como un checkpoint de investigacion inicial, no como una politica lista para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) tipo TurboVLA; codificacion independiente de vision e instruccion, interaccion vision-lenguaje bidireccional y decodificador compacto de chunks de accion |
| Parametros totales | 209.286.150 (209,3 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible: consume observaciones por paso (estado de 6 dimensiones y dos imagenes de 3x480x640) mas una instruccion de tarea en lenguaje natural |
| Tipos de cuantizacion | No disponible. Solo se publican pesos en safetensors; el tamano del repo (0,8 GB) es coherente con precision fp32 |
| Idiomas soportados | Ingles en las instrucciones de tarea del dataset; no se documenta soporte multilingue |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria `lerobot`) |
| Tipo de robot | `so_follower` (brazo SO-101, 6 grados de libertad) |
| Camaras | `front_top_camera` (3x480x640) y `wrist_camera` (3x480x640) |
| Entradas | `observation.state` (6,), `observation.images.front_top_camera` (3,480,640), `observation.images.wrist_camera` (3,480,640) |
| Salidas | `action` (6,) |
| Dataset de entrenamiento | `ravediamond/so101_bowls_all` (182 episodios, 69.897 frames, 30 FPS) |
| Pasos de entrenamiento | 35.000 |
| Version de LeRobot | 0.6.1 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es una politica VLA denominada `turbovla_so101`, integrada en LeRobot como plugin de politica independiente. Segun la descripcion publica del proyecto TurboVLA, el enfoque evita usar un modelo de lenguaje grande como interfaz central entre percepcion y accion: en su lugar codifica por separado las observaciones visuales y la instruccion linguistica, intercambia informacion entre ambas representaciones mediante una interaccion vision-lenguaje bidireccional ligera y predice chunks de acciones continuas con un decodificador compacto. Con 209 M de parametros, se situa en el rango de las politicas de imitacion eficientes, muy por debajo de los VLA basados en LLM de miles de millones de parametros.

El entrenamiento es de imitacion supervisada (behavior cloning) sobre demostraciones reales, no simulado: 35.000 pasos, batch size 8, optimizador AdamW, learning rate 5e-05 y semilla 1000, ejecutado con LeRobot 0.6.1. El dataset consta de 182 episodios y 69.897 frames grabados a 30 FPS para dos tareas de colocacion de boles (azul en rosa y rosa en azul). No se documenta en la model card el numero total de tokens o frames vistos, la composicion exacta del dataset, ni el uso de RLHF, DPO o aprendizaje por refuerzo. Tampoco se detalla la inicializacion de los pesos ni si el backbone visual procede de un modelo preentrenado.

## Capacidades

- Control de manipulacion de 6 grados de libertad sobre un brazo SO-101 en configuracion `so_follower`, emitiendo acciones continuas de dimension 6.
- Percepcion visual multi-camara: procesa de forma simultanea una vista superior frontal y una vista de muneca, ambas a 480x640 y 3 canales.
- Condicionamiento por instruccion en lenguaje natural: la tarea se especifica como cadena de texto ("Put the blue bowl in the pink bowl.").
- Prediccion de chunks de acciones continuas con un decodificador compacto, segun la descripcion del enfoque TurboVLA.
- Ejecucion en bucle cerrado a partir de observaciones de estado y vision, con inferencia pensada para operar a la frecuencia del dataset (30 FPS).
- Integracion nativa en LeRobot: se puede lanzar con `lerobot-rollout` y reentrenar con `lerobot-train`.
- No soporta tool calling ni function calling: es una politica de control motor, no un modelo de lenguaje.
- No soporta agentes, razonamiento multi-paso simbolico, generacion de texto, codigo, matematicas, vision general, audio ni modo "thinking".
- Capacidad multilingue: no disponible; las unicas instrucciones documentadas estan en ingles.

## Casos de uso

- Automatizacion de pick-and-place de boles: la politica se entreno especificamente para colocar el bol azul dentro del rosa y viceversa, de modo que puede desplegarse directamente sobre una celda SO-101 con dos camaras para esa tarea concreta.
- Base para fine-tuning en el mismo robot: con 209 M de parametros y licencia Apache-2.0, sirve como punto de partida para reentrenar con `lerobot-train` sobre nuevos objetos o nuevas consignas en un SO-101 ya calibrado.
- Banco de pruebas de politicas VLA eficientes: permite comparar en robot real un enfoque sin LLM central frente a ACT, Diffusion Policy o SmolVLA dentro del mismo framework LeRobot y con el mismo dataset.
- Reproducibilidad de investigacion: el repositorio de plugin `lerobot-policy-turbovla-so101` documenta el entrenamiento y la validacion end-to-end en un brazo SO-101 real, lo que facilita replicar el pipeline completo.
- Docencia y laboratorios de robotica: el SO-101 es un brazo de bajo coste y el checkpoint cabe en GPUs de consumo, lo que lo hace util para practicas de imitation learning con hardware accesible.
- Validacion de configuracion de sensores: al depender de dos flujos de camara con nombres concretos, es util para verificar calibracion, sincronizacion a 30 FPS y encuadre antes de escalar a tareas mas complejas.
- Prototipado rapido de demos de manipulacion: permite grabar un video de una politica funcional en pocas horas sin entrenar desde cero, siempre que la tarea coincida con las dos consignas del dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una seccion de evaluacion vacia con la nota explicita de que no se han proporcionado resultados para esta politica: no hay tasas de exito por tarea, ni numero de ensayos, ni condiciones de prueba documentadas.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 1 GB para los pesos en fp32 (209,3 M de parametros) y aproximadamente 0,5 GB en fp16; con activaciones de dos flujos de 3x480x640 el consumo realista se situa en el rango de 1 a 2 GB. Es una estimacion, no un dato publicado.
- GPU recomendadas: cualquier GPU con 4 GB de VRAM o mas es suficiente (GTX 1650, RTX 3050, RTX 3060, RTX 4090). Tarjetas como A100 o H100 no aportan ventaja para este tamano de modelo; el cuello de botella es la latencia de captura de camara, no el computo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna e incluso en GPUs integradas con memoria compartida suficiente. La inferencia en CPU es plausible dado el tamano, aunque la latencia no esta documentada.
- Entrenamiento: la configuracion publicada usa batch 8 sobre dos imagenes de 480x640; como referencia orientativa, ese regimen requiere del orden de 6 a 10 GB de VRAM, cifra estimada y no confirmada por el autor.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecutar la politica y `lerobot-train` para reentrenar), con PyTorch y CUDA. vLLM, llama.cpp, Ollama y TGI no son aplicables: estan orientados a modelos de lenguaje y no ejecutan politicas roboticas.
- Latencia y throughput: no disponibles. El dataset se grabo a 30 FPS y el enfoque TurboVLA se presenta como apto para tiempo real, pero no hay mediciones publicadas para este checkpoint.

## Comparativa con modelos similares

Los datos numericos de los modelos alternativos no estan disponibles en la informacion proporcionada, por lo que la comparacion se limita a enfoque, encaje en el ecosistema y licencia.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| turbovla_so101_bowls | VLA sin LLM central, decodificador compacto de chunks de accion | 209,3 M | No aplica (observaciones por paso) | Apache-2.0 | HuggingFace, plugin LeRobot |
| TurboVLA (repositorio base H-EmbodVis) | VLA con interaccion vision-lenguaje bidireccional ligera | No disponible | No disponible | No disponible | GitHub |
| ACT (Action Chunking Transformer) | Transformer encoder-decoder con action chunking | No disponible | No aplica | No disponible en esta busqueda | Implementado en LeRobot |
| Diffusion Policy | Politica generativa basada en difusion de acciones | No disponible | No aplica | No disponible en esta busqueda | Implementado en LeRobot |
| SmolVLA | VLA compacto de la familia LeRobot | No disponible | No disponible | No disponible en esta busqueda | HuggingFace / LeRobot |

Nota: la distincion principal de este checkpoint frente a ACT o Diffusion Policy es la incorporacion de la instruccion en lenguaje natural, y frente a VLA basados en LLM, su tamano reducido (209 M) y la ausencia de un LLM como intermediario.

## Limitaciones y advertencias

- Alcance minimo: solo hay evidencia de entrenamiento para dos tareas concretas de colocacion de boles. No se ha demostrado generalizacion a otros objetos, posiciones o consignas.
- Sin evaluacion publicada: la model card declara explicitamente que no hay resultados de evaluacion, por lo que se desconoce la tasa de exito real en robot.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- Dependencia estricta de la configuracion: la politica espera un robot `so_follower` con exactamente dos camaras llamadas `front_top_camera` y `wrist_camera` a 480x640; cualquier cambio de calibracion, encuadre o nombre de camara invalida la inferencia.
- Sensibilidad a la distribucion del dataset: cambios de iluminacion, posicion inicial de los objetos, distractores en la mesa o un brazo distinto del mismo modelo pueden degradar el comportamiento. La propia plantilla de la model card menciona estos factores como relevantes para la dificultad.
- Riesgo de acciones fuera de distribucion: en una politica de imitacion el equivalente funcional a la alucinacion es la ejecucion de trayectorias no entrenadas; siempre debe operarse con supervision y limites de seguridad fisicos.
- Idioma: las instrucciones de tarea documentadas estan en ingles; no hay soporte multilingue confirmado.
- Sesgos: no se documenta analisis de sesgos. El comportamiento hereda los sesgos de las 182 demostraciones (disposicion de la mesa, posiciones de los boles, estilo de teleoperacion del operador).
- Licencia y atribucion: el checkpoint es Apache-2.0, lo que permite uso comercial, pero la licencia del proyecto TurboVLA original (H-EmbodVis) y la del repositorio de plugin de ravediamond no se especifican en la informacion disponible; conviene verificarlas antes de un uso comercial.
- Aviso de seguridad: no apto para aplicaciones criticas ni entornos sin supervision humana. No hay datos sobre tiempos de inferencia ni sobre comportamiento ante fallos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ravediamond/turbovla_so101_bowls
- Dataset de entrenamiento: https://huggingface.co/datasets/ravediamond/so101_bowls_all
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ravediamond/so101_bowls_all
- Repositorio del plugin LeRobot: https://github.com/ravediamond/lerobot-policy-turbovla-so101
- Repositorio base TurboVLA: https://github.com/H-EmbodVis/TurboVLA
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento de politicas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rapida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Modelo relacionado: https://huggingface.co/ravediamond/turbovla_so101_pick_cups_v2
- Dataset relacionado: https://huggingface.co/datasets/ravediamond/so101_bowl_blue_in_pink

# castanetnicolas/ACT_UR5e_BS_64_Act_Chunk_20_Exec_20_TASK_nut_assembly_square_PIXELS__ID_146342

## Resumen

ACT_UR5e_BS_64_Act_Chunk_20_Exec_20_TASK_nut_assembly_square_PIXELS__ID_146342 es una politica de aprendizaje por imitacion basada en Action Chunking with Transformers (ACT), publicada por el usuario castanetnicolas a traves de la libreria LeRobot. No es un modelo de lenguaje: es un controlador neuronal entrenado para ejecutar una tarea robotica concreta, en este caso "Pick up the square nut and place it on the square peg" (coger la tuerca cuadrada y colocarla en la clavija cuadrada). El modelo consume el estado del robot mas dos imagenes de camara y produce un vector de accion de 7 dimensiones, con un total de 51.590.791 parametros almacenados en safetensors.

La relevancia de este tipo de modelos radica en que ACT predice trozos ("chunks") de acciones de forma corta en lugar de un unico paso, lo que mejora la estabilidad y las tasas de exito en tareas de manipulacion aprendidas a partir de datos de teleoperacion. Este ejemplar concreto fue entrenado sobre el dataset castanetnicolas/robomimic_square_ph_image84 (200 episodios, 30.154 fotogramas a 20 FPS), derivado del benchmark robomimic, con un tamano de chunk y ejecucion de 20 pasos segun indica su propio identificador (Act_Chunk_20_Exec_20).

Se trata de un artefacto de investigacion con 0 descargas y 0 likes, sin resultados de evaluacion publicados, y con una discrepancia relevante: el nombre del repositorio menciona UR5e mientras que la model card declara el tipo de robot como panda. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ACT (Action Chunking with Transformers), politica de imitacion |
| Parametros totales | 51.590.791 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (politica de robot; ventana de observacion fija de estado + 2 imagenes) |
| Tipos de cuantizacion | no disponible (pesos distribuidos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (via LeRobot) |

Datos adicionales relevantes:

| Parametro | Valor |
|---|---|
| Tipo de robot declarado | panda (la model card); el nombre del repo indica UR5e |
| Camaras | agentview (3, 84, 84) y robot0_eye_in_hand (3, 84, 84) |
| Entrada de estado | observation.state, shape (9,) |
| Salida de accion | action, shape (7,) |
| Tamano del repositorio | 0,2 GB |
| Pipeline | robotics |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un metodo de aprendizaje por imitacion que, en lugar de predecir una unica accion por paso, predice un chunk de acciones futuras. La arquitectura combina un codificador de vision (tipo ResNet) para las imagenes, un codificador para el estado proprioceptivo del robot, un transformer encoder-decoder y una cabeza que decodifica el chunk de acciones. Una innovacion destacable del metodo original es el uso de un entrenamiento estilo CVAE con una variable latente que modela la variabilidad de las demostraciones humanas, lo que ayuda a capturar la multimodalidad del comportamiento humano y mitiga el "compounding error" tipico de las politicas de un solo paso. El articulo de referencia es arXiv:2304.13705.

En cuanto al entrenamiento de este artefacto concreto, la model card indica 120.000 pasos de entrenamiento, batch size 64, optimizador AdamW, learning rate 1e-5, semilla 1000, sobre LeRobot 0.6.1. El dataset de entrenamiento es castanetnicolas/robomimic_square_ph_image84, con 200 episodios y 30.154 fotogramas a 20 FPS, correspondiente a la tarea "Pick up the square nut and place it on the square peg". El identificador del modelo sugiere un chunk de 20 acciones y una ejecucion de 20. No se documenta si se aplicaron tecnicas adicionales de RLHF/DPO, algo que en cualquier caso no aplica a este tipo de politica.

## Capacidades

- Control visomotor para manipulacion robotica: traduce imagenes (agentview y eye-in-hand a 84x84) y el estado del robot a comandos de accion de 7 grados de libertad.
- Prediccion de chunks de acciones, que aporta suavidad y robustez frente a la variabilidad temporal.
- Aprendizaje por imitacion a partir de datos de teleoperacion, sin necesidad de recompensas ni de entorno simulado para el ajuste.
- Ejecucion de una tarea concreta de ensamblaje/colocacion (tuerca cuadrada sobre clavija cuadrada).
- Integracion con el ecosistema LeRobot (comandos `lerobot-rollout` y `lerobot-train`).
- No soporta tool calling, function calling, agentes de multiples pasos, razonamiento simbolico ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Automatizacion de tareas pick-and-place en linea de montaje: el modelo recoge la tuerca cuadrada y la coloca sobre la clavija, replicando una operacion de ensamblaje repetitiva en una celula robotica.
- Investigacion en aprendizaje por imitacion: sirve como referencia reproducible para estudiar ACT con el dataset robomimic y comparar hiperparametros (chunk, batch, learning rate).
- Punto de partida para fine-tuning con datos propios: al estar integrado en LeRobot, puede reentrenarse sobre nuevas demostraciones teleoperadas de tareas de manipulacion similares.
- Prototipado rapido de politicas visomotoras: con 51 millones de parametros puede entrenarse e inferirse en hardware modesto, lo que facilita iteraciones de laboratorio.
- Benchmark interno de tareas de ensamblaje: usar el exito de colocacion como metrica para evaluar variaciones de arquitectura o de representacion visual en 84x84.
- Simulacion y validacion previa al despliegue fisico: probar la politica frente a variaciones de posicion, iluminacion o distractores antes de llevarla a un robot real, aunque no se han publicado resultados de evaluacion.
- Docencia en robotica e IA: ejemplo didactico de politica ACT entrenada de extremo a extremo con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente "No evaluation results have been provided for this policy yet." No se dispone, por tanto, de tasas de exito (trials/successes/success rate) ni de comparaciones numericas con otros metodos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida. Con 51.590.791 parametros y pesos en safetensors (repo de 0,2 GB), la inferencia en precision completa ocupa del orden de 0,2 GB de pesos, mas memoria para activaciones de las dos imagenes de 84x84 y el estado.
- GPU recomendadas: cualquier GPU moderna sirve; para entrenamiento conviene una GPU con al menos 8-16 GB (por ejemplo RTX 3060/4070/4090, A100 o H100 si se busca mayor throughput). El dato concreto de GPU optima no esta documentado.
- Cabe en GPU de consumo: si, con holgura. Incluso es viable la inferencia en CPU, aunque con mayor latencia. LeRobot soporta dispositivos cuda, mps y cpu.
- Opciones de despliegue: LeRobot (`lerobot-rollout` / `lerobot-train`), que internamente usa PyTorch. No se documenta soporte de vLLM, llama.cpp, Ollama o TGI (no aplican a esta politica).
- Latencia y throughput: no disponible. El dataset de entrenamiento opera a 20 FPS, y el identificador del modelo sugiere ejecucion en chunks de 20 acciones, pero no se publican mediciones de latencia en tiempo real.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (ACT) | Politica de imitacion por chunks | 51.590.791 | no aplicable | apache-2.0 | HuggingFace (0 descargas) |
| ACT original (Zhao et al., 2023) | Politica de imitacion por chunks | no disponible | no aplicable | no disponible | Paper arXiv:2304.13705, codigo publico |
| Diffusion Policy (Chi et al.) | Politica de imitacion por difusion | no disponible | no aplicable | no disponible | Comunidad de investigacion |
| VINN | Politica de imitacion basada en vecinos | no disponible | no aplicable | no disponible | Repositorios de investigacion |
| SmolVLA / pi0 (LeRobot) | Politicas VLA | no disponible | no aplicable | no disponible | HuggingFace / LeRobot |

No se dispone de datos numericos de rendimiento para realizar una comparacion cuantitativa fiable; las alternativas se listan a nivel cualitativo segun lo referenciado en la busqueda web y en la propia model card.

## Limitaciones y advertencias

- Sin resultados de evaluacion: no hay tasas de exito publicadas, por lo que se desconoce su fiabilidad real en la tarea objetivo.
- Discrepancia de robot: el nombre del repositorio menciona UR5e mientras que la model card declara `panda`. Esto puede afectar a la compatibilidad si se intenta desplegar sobre un robot distinto al usado en el entrenamiento.
- Especificidad de camaras: requiere exactamente las claves de observacion `observation.images.agentview` y `observation.images.robot0_eye_in_hand`, con resolucion 84x84 y estado de shape (9,). Cualquier camara o calibracion distinta rompe la inferencia.
- Especializacion extrema: la politica esta entrenada para una unica tarea ("Pick up the square nut and place it on the square peg") y no generaliza a otras tareas sin reentrenamiento.
- Sensibilidad al dominio: como toda politica visomotora, puede degradarse ante cambios de iluminacion, posicion de objetos, distractores o diferencias entre el robot simulado (robomimic) y el robot real.
- Alucinacion: en el sentido de acciones incorrectas o inseguras ante observaciones fuera de distribucion; no hay garantias de seguridad fisica.
- Idiomas: no procede; no procesa lenguaje.
- Uso comercial: la licencia apache-2.0 permite uso comercial del modelo, pero conviene verificar los terminos del dataset robomimic subyacente antes de un despliegue en produccion.
- Adopcion nula: 0 descargas y 0 likes, sin soporte comunitario ni mantenimiento documentado.
- Caveat de fecha: el repositorio figura creado y actualizado en octubre de 2026, dato que conviene contrastar.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/castanetnicolas/ACT_UR5e_BS_64_Act_Chunk_20_Exec_20_TASK_nut_assembly_square_PIXELS__ID_146342
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/robomimic_square_ph_image84
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/robomimic_square_ph_image84
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de inferencia / rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de referencia ACT para UR5: https://github.com/ripl/ACT_for_ur5
- Modelo relacionado del mismo autor: https://huggingface.co/castanetnicolas/ACT_UR5e_BS_64_Act_Chunk_20_Exec_20
- Ficha tecnica del UR5e: https://www.universal-robots.com/media/1807465/ur5e_e-series_datasheets_web.pdf

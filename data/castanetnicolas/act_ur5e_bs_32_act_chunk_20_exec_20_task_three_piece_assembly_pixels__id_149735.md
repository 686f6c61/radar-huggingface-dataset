# castanetnicolas/ACT_UR5e_BS_32_Act_Chunk_20_Exec_20_TASK_three_piece_assembly_PIXELS__ID_149735

## Resumen

ACT_UR5e_BS_32_Act_Chunk_20_Exec_20_TASK_three_piece_assembly_PIXELS__ID_149735 es una política de robótica basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de un único paso de control. El modelo lo publica el usuario castanetnicolas y se ha entrenado y subido al Hub mediante LeRobot, la librería de HuggingFace para aprendizaje en robótica real. No es un modelo de lenguaje: es un controlador visuomotor que consume observaciones del estado del robot y dos cámaras, y emite comandos de acción de 7 dimensiones.

El modelo tiene 51.590.791 parámetros (unos 51,6 millones) y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en el rango de políticas ligeras capaces de ejecutarse en tiempo real en hardware de consumo. Se ha entrenado durante 300.000 pasos con batch size 32 y learning rate 1e-05 sobre el dataset mimicgen_three_piece_assembly_d1_image84, compuesto por 200 episodios y 67.101 fotogramas capturados a 20 FPS para la tarea de insertar dos piezas en una base.

Su relevancia actual radica en que forma parte del ecosistema LeRobot, que estandariza el formato de datasets, el entrenamiento y el despliegue de políticas de imitación, permitiendo reproducir el pipeline completo con la CLI de LeRobot sobre un robot real. La licencia Apache 2.0 facilita su reutilización y adaptación, aunque la model card no incluye resultados de evaluación ni métricas de éxito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con encoder visual y decodificador de acciones |
| Parametros totales | 51.590.791 (51,6 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; usa chunk de acciones de 20 pasos y ejecucion de 20 pasos segun el nombre del repositorio) |
| Tipos de cuantizacion | no disponible (pesos safetensors; LeRobot no documenta cuantizaciones especificas en la model card) |
| Idiomas soportados | no aplica / no disponible (modelo de control robotico, no procesa lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un backbone transformer con un mecanismo de predicción de chunks de acciones. En lugar de emitir una sola accion por paso de inferencia, el modelo predice una secuencia corta de acciones futuras (chunk), lo que reduce la varianza temporal y mejora la estabilidad del control, especialmente en tareas de manipulacion de precision. El modelo consume un vector de estado de 9 dimensiones (`observation.state`) y dos imagenes RGB de 84x84 (`observation.images.agentview` y `observation.images.robot0_eye_in_hand`), y produce una accion de 7 dimensiones (`action`).

El entrenamiento se realizo con LeRobot 0.6.1 durante 300.000 pasos, con optimizador AdamW, learning rate 1e-05, batch size 32 y semilla 1000. El dataset de entrenamiento es castanetnicolas/mimicgen_three_piece_assembly_d1_image84, con 200 episodios, 67.101 fotogramas a 20 FPS y una unica tarea descrita como "Insert the first piece into the base, then insert the second piece on top of it". No se documenta en la model card el uso de RLHF, DPO ni tecnicas de refinamiento posteriores; se trata de aprendizaje supervisado puro a partir de demostraciones teleoperadas. No hay datos sobre composicion del dataset, augmentacion de imagenes ni decodificacion especulativa.

## Capacidades

- Control visuomotor de manipulacion robotica: genera comandos de accion de 7 grados de libertad a partir de estado proprioceptivo e imagenes.
- Ejecucion de tareas de ensamblaje de precision: la politica esta especializada en insertar dos piezas consecutivas en una base.
- Prediccion de chunks de acciones: el nombre del repositorio indica un chunk de 20 acciones y una ejecucion de 20 pasos, lo que permite control temporalmente coherente.
- Percepcion multimodal: combina una vista externa (agentview) y una vista de muneca (robot0_eye_in_hand) a 84x84 pixeles.
- Integracion con el ecosistema LeRobot: se ejecuta con `lerobot-rollout` y se puede reentrenar con `lerobot-train`.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas, tool calling, function calling, capacidades de agente, capacidades multilingues ni modos de pensamiento. Es un modelo exclusivamente de control motor.

## Casos de uso

- Ensamblaje industrial de piezas pequenas: la politica se usaria como controlador de un brazo robotico en una celda de montaje, ejecutando la secuencia de insercion aprendida a partir de demostraciones, con la ventaja de que el chunk de acciones reduce las micro-correcciones inestables.
- Automatizacion de tareas pick-and-place con contacto: el modelo puede abordar inserciones que requieren tolerancia fina, donde un controlador puramente geometrico fallaria, gracias al aprendizaje de la dinamica real de contacto.
- Banco de pruebas de investigacion en imitacion: sirve como referencia entrenada para comparar variantes de ACT, hiperparametros o esquemas de aumento de datos sobre el mismo dataset de 200 episodios.
- Prototipado rapido en laboratorio con LeRobot: un equipo puede desplegar la politica con `lerobot-rollout` en minutos sobre un robot compatible y medir su tasa de exito antes de invertir en datos propios.
- Reentrenamiento con datos propios: el mismo pipeline (`lerobot-train` con `--policy.type=act`) permite adaptar la politica a una tarea nueva manteniendo la arquitectura y ajustando solo el dataset.
- Generacion de datos sinteticos para evaluacion: el modelo puede usarse como baseline en entornos simulados tipo MimicGen para medir transferencia sim-a-real.
- Docencia y formacion en robotica: al ser ligero y de licencia Apache 2.0, es adecuado para cursos practicos de aprendizaje por imitacion en robots de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente: "No evaluation results have been provided for this policy yet", por lo que no hay tabla de tareas, ensayos, exitos ni tasa de exito. Tampoco se proporcionan metricas de perdida de entrenamiento, curvas de aprendizaje ni comparaciones cuantitativas con otras politicas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 51,6 millones de parametros, los pesos ocupan aproximadamente 206 MB en FP32 y unos 103 MB en FP16, por lo que el modelo cabe sobradamente en cualquier GPU con mas de 1-2 GB de VRAM libre.
- GPU recomendadas: cualquier GPU moderna es suficiente; para latencia minima se sugiere una RTX 3060 o superior, RTX 4090, A100 o H100, aunque no hay cuello de botella por memoria.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo actuales (GTX 1650, RTX 2060, RTX 3050, RTX 4060, etc.), e incluso es viable la inferencia en CPU para prototipado.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path`), y como base PyTorch dentro del ecosistema LeRobot 0.6.1. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de control robotico.
- Latencia y throughput: no disponible. No se han publicado mediciones de frecuencia de control alcanzable ni de tiempo de inferencia por chunk.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ACT_UR5e_BS_32 (este modelo) | ACT (imitacion) | 51,6 M | chunk de 20, ejecucion de 20 | apache-2.0 | HuggingFace (0 descargas, 0 likes) |
| Diffusion Policy | politica por difusion | no disponible | no disponible | no disponible | implementaciones publicas, no incluida en esta ficha con datos verificados |
| VQ-BeT | transformer con cuantizacion de acciones | no disponible | no disponible | no disponible | no disponible |
| Otros checkpoints ACT de LeRobot | ACT (imitacion) | variable | variable | normalmente apache-2.0 | Hub de HuggingFace |

No se dispone de datos verificados de parametros, contexto ni rendimiento de los modelos comparables en la informacion proporcionada, por lo que la comparacion cuantitativa queda como no disponible.

## Limitaciones y advertencias

- No hay resultados de evaluacion: se desconoce la tasa de exito real de la politica en el robot, por lo que no deberia asumirse un rendimiento concreto en produccion.
- Especializacion estrecha: el modelo esta entrenado para una unica tarea ("Insert the first piece into the base, then insert the second piece on top of it") y no generaliza a otras tareas sin reentrenamiento.
- Dependencia del entorno de entrenamiento: cambios en posiciones de objeto, iluminacion, distractores u oclusiones pueden degradar el rendimiento, como advierte la propia plantilla de la model card.
- Discrepancia en el tipo de robot: el identificador del repositorio menciona UR5e mientras que la model card declara `robot type: panda`. Esto puede afectar a la compatibilidad y debe verificarse antes del despliegue.
- Sensibilidad a la camara: las claves de observacion deben coincidir exactamente con `observation.images.agentview` y `observation.images.robot0_eye_in_hand`, con la misma resolucion de 84x84, o el modelo fallara.
- Riesgo de sobreajuste al dataset: 200 episodios y 67.101 fotogramas para 300.000 pasos de entrenamiento es una cantidad de datos limitada; puede haber memorizacion de trayectorias.
- Sin capacidades de lenguaje ni de razonamiento: no debe emplearse para tareas conversacionales, de codigo o de analisis textual.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero el autor no ofrece garantias ni soporte; el modelo se distribuye "tal cual".
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de validacion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/castanetnicolas/ACT_UR5e_BS_32_Act_Chunk_20_Exec_20_TASK_three_piece_assembly_PIXELS__ID_149735
- Dataset de entrenamiento: https://huggingface.co/datasets/castanetnicolas/mimicgen_three_piece_assembly_d1_image84
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=castanetnicolas/mimicgen_three_piece_assembly_d1_image84
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guia de grabacion y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference

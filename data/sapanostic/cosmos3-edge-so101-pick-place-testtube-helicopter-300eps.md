# sapanostic/cosmos3-edge-so101-pick-place-testtube-helicopter-300eps

## Resumen

Este modelo es un fine-tuning supervisado de `nvidia/Cosmos3-Edge`, un modelo de mundo omnimodal de NVIDIA, convertido en una política de acción (VLA) para un brazo robótico SO-ARM101. La tarea concreta es recoger un tubo de ensayo y colocarlo en el soporte de un helicóptero, a partir de una instrucción en lenguaje natural y una observación visual compuesta por dos cámaras (tercera persona y muñeca). El modelo fue entrenado por el usuario `sapanostic` utilizando el framework `cosmos-framework` de Rebis-IvLabs, en su rama experimental para Edge, y se distribuye bajo la licencia NVIDIA Open Model License.

El interés de este modelo radica en que es uno de los primeros ejemplos de adaptación de Cosmos3-Edge a una tarea de manipulación robótica concreta, siguiendo el paradigma de "world-action model": además de predecir las acciones del efector final, genera los fotogramas futuros de la observación. Está diseñado para ser servido mediante el servidor de políticas del framework y evaluado en bucle abierto, aunque aún no se ha validado en bucle cerrado sobre el brazo real. El repositorio contiene checkpoints intermedios cada 500 iteraciones, siendo el `checkpoint-5000` el de mejor rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-transformers (Cosmos3-Edge, modelo base) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | no disponible (instruccion en ingles en el ejemplo) |
| Licencia | nvidia-open-model-license |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/Cosmos3-Edge`, un modelo de mundo omnimodal de NVIDIA que utiliza una arquitectura mixture-of-transformers para procesar y generar lenguaje, imagen, video, audio y secuencias de acciones. En este fine-tuning, se entrena únicamente un subconjunto de los módulos del modelo: `moe_gen`, `time_embedder`, `vae2llm`, `llm2vae`, `action2llm`, `llm2action` y `action_modality_embed`, con las cabezas de acción a una tasa de aprendizaje cinco veces mayor. El entrenamiento se realizó con una pérdida de rectified flow aplicada tanto al video como a las acciones, con `loss_scale` 10 y `action_loss_weight` 10, durante 5000 iteraciones (aproximadamente 4,9 horas) en una única GPU NVIDIA RTX PRO 6000 Blackwell de 96 GB.

Los datos de entrenamiento provienen de un dataset privado de 270 episodios (77 107 fotogramas) grabados a 15 Hz con LeRobot v3.0, correspondientes a la misma tarea de pick-and-place. La observación es una imagen RGB de 256×512 píxeles (dos vistas de 256×256 concatenadas horizontalmente), sin información de propriocepción. La acción predicha es un chunk de 16 pasos de deltas relativos del efector final en el marco del cuerpo, con 10 dimensiones: traslación (dx, dy, dz), rotación en representación rot6d (6 valores) y apertura del gripper. Además, el modelo genera los 17 fotogramas futuros de la observación, lo que lo convierte en un modelo mundo-acción.

## Capacidades

- Generacion de acciones de manipulacion robotica: predice un chunk de 16 pasos de deltas relativos del efector final (10-D) a 15 Hz, cubriendo un horizonte de aproximadamente 1,07 segundos.
- Generacion de video futuro: produce los 17 fotogramas siguientes de la observacion, lo que permite visualizar la trayectoria prevista.
- Comprension de instrucciones en lenguaje natural: la tarea se especifica mediante una cadena JSON, que el modelo interpreta para generar la accion adecuada.
- Integracion con el framework cosmos-framework: se sirve mediante un servidor de politicas que acepta una imagen base64 y un prompt, y devuelve el chunk de accion denormalizado.
- Normalizacion de acciones: utiliza normalizacion `quantile_rot` con estadisticas precalculadas para el brazo SO-ARM101.
- Sin propriocepcion: el modelo opera unicamente con vision y lenguaje, sin informacion del estado articular.

## Casos de uso

- Investigacion en politicas de mundo-accion: este modelo sirve como referencia para estudiar como un modelo de mundo omnimodal puede adaptarse a una tarea de manipulacion concreta mediante fine-tuning supervisado.
- Evaluacion de metodos de aprendizaje por imitacion: los checkpoints intermedios permiten analizar la evolucion de las metricas de error (ADE, FDE) a lo largo del entrenamiento y comparar estrategias de regularizacion.
- Benchmark de manipulacion con SO-ARM101: la tarea de pick-and-place de un tubo de ensayo en un helicoptero puede utilizarse como caso de estudio para validar otros VLA o metodos de control.
- Desarrollo de servidores de politicas para robotica: el ejemplo de uso muestra como desplegar el modelo mediante el servidor de politicas del framework, lo que puede replicarse para otras tareas.
- Generacion de trayectorias de referencia: al predecir tambien los fotogramas futuros, el modelo puede emplearse para sintetizar demostraciones sinteticas o para visualizar el comportamiento esperado antes de ejecutarlo en el robot.
- Estudio de sesgos en el cierre del gripper: el comportamiento observado de cierre temprano del gripper (6 fotogramas antes) ofrece un caso de analisis para corregir sesgos temporales en politicas de manipulacion.

## Benchmarks y rendimiento

La evaluacion se realizo en bucle abierto sobre 30 episodios held-out, prediciendo cada chunk de 16 fotogramas a partir del primer fotograma real y la instruccion, e integrando las acciones desde la pose real (re-anclaje). Las metricas son el error medio de posicion (ADE), el error final de posicion (FDE), el error medio de rotacion y el error absoluto medio del gripper.

| checkpoint | ADE (cm) | FDE (cm) | rotacion ADE (°) | gripper MAE (%) |
|---|---|---|---|---|
| 500 | 1.64 | 2.60 | 5.3 | 3.7 |
| 1500 | 1.67 | 2.63 | 5.3 | 2.9 |
| 2500 | 1.60 | 2.43 | 4.9 | 2.8 |
| 4000 | 1.54 | 2.33 | 4.7 | 2.5 |
| **5000** | **1.51** | **2.29** | **4.6** | **2.5** |

El checkpoint final (5000) es el mejor en todas las metricas. El gripper predice el agarre con una correlacion de 0.87 y un MAE del 2.34 % frente a un predictor de media constante (10.4 %), pero cierra aproximadamente 6 fotogramas (0.4 s) antes de lo esperado, un sesgo que aparece a partir de la iteracion 2500 y no mejora con mas entrenamiento. No se ha evaluado en bucle cerrado sobre el brazo real.

## Requisitos de hardware

- El repositorio ocupa 68.5 GB en formato safetensors bf16, por lo que se necesita una GPU con al menos esa capacidad de memoria para cargar los pesos completos sin cuantizacion.
- El entrenamiento se realizo en una NVIDIA RTX PRO 6000 Blackwell de 96 GB, lo que sugiere que una GPU de gama alta con 80-96 GB es adecuada para inferencia sin cuantizar.
- No se proporcionan datos sobre cuantizacion (GGUF, AWQ, etc.) ni sobre requisitos minimos de VRAM para inferencia en hardware de consumo.
- Para despliegue, el modelo se sirve mediante el servidor de politicas del framework `cosmos-framework` (rama `experiment/so101-edge`), que expone un endpoint `POST /predict`.
- No se indican opciones de despliegue alternativas como vLLM, llama.cpp u Ollama; el flujo recomendado es el del propio framework.

## Comparativa con modelos similares

No se dispone de informacion suficiente para comparar este modelo con alternativas de la misma categoria (otros VLA para SO-ARM101 o fine-tunings de Cosmos3-Edge). El autor menciona una linea base GR00T exp-021 con el mismo split de datos, pero no se proporcionan sus metricas. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Tarea unica y entorno restringido: el modelo fue entrenado para una sola tarea, con un unico rig, una unica condicion de iluminacion y 270 demostraciones. No generaliza a otras tareas, objetos o entornos.
- Ausencia de propriocepcion: al no recibir informacion del estado articular, la politica no puede recuperarse de estados que son visualmente identicos pero difieren en la configuracion de las articulaciones.
- Cierre temprano del gripper: el modelo tiende a cerrar el gripper unos 0.4 s antes de lo necesario, un sesgo no resuelto que puede afectar al exito de la tarea en ejecucion real.
- Evaluacion solo en bucle abierto: las metricas reportadas son de trayectoria, no de exito en el brazo real. No se ha medido la tasa de exito en closed-loop.
- Rendimiento limitado por datos: las mejoras mas alla de la iteracion 500 son pequenas (8 % de ADE con 10 veces mas computo), lo que sugiere que el modelo esta limitado por la cantidad de datos, no por el computo.
- Licencia NVIDIA Open Model License: aunque permite uso comercial, es necesario revisar los terminos especificos de la licencia de NVIDIA para Cosmos3-Edge y sus derivados.
- Sin soporte multilingue declarado: la instruccion se proporciona en ingles en el ejemplo, pero no se especifican otros idiomas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/sapanostic/cosmos3-edge-so101-pick-place-testtube-helicopter-300eps
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge
- Framework de entrenamiento: https://github.com/Rebis-IvLabs/cosmos-framework
- Pagina de Cosmos 3 en NVIDIA Research: https://research.nvidia.com/labs/cosmos-lab/cosmos3/
- Paper de Cosmos 3: https://arxiv.org/abs/2606.02800
- Repositorio de Cosmos en GitHub: https://github.com/NVIDIA/cosmos
- Seguimiento del entrenamiento (W&B): https://wandb.ai/RebisVla/cosmos3_so101/runs/v64sp2z5

# civcivcivciv/hf_act_record0

## Resumen

`civcivcivciv/hf_act_record0` es una politica de imitacion (imitation learning) para robotica entrenada con el metodo Action Chunking with Transformers (ACT), publicado originalmente por Zhao et al. en 2023 y distribuida a traves del ecosistema LeRobot de Hugging Face. El modelo no es un LLM ni un modelo de lenguaje: es una politica visomotora que mapea observaciones del robot (estado de las articulaciones e imagenes de dos camaras) a comandos de accion de 6 dimensiones, pensada para control de manipuladores en el mundo real.

El modelo tiene 51.668.614 parametros y consume como entrada un vector de estado de 6 dimensiones junto con dos flujos de imagen RGB de 480x640 pixeles (`robot_cam` y `workspace_cam`), produciendo una accion de 6 dimensiones. Fue entrenado con 25 episodios y 9.541 fotogramas a 30 FPS grabados sobre un robot `so_follower` (el seguidor del brazo SO-100/SO-101 de LeRobot), durante 20.000 pasos de entrenamiento con AdamW y un learning rate de 1e-5.

Su relevancia es acotada y practica: sirve como ejemplo reproducible de un pipeline completo de LeRobot (grabacion de datos, entrenamiento, rollout) y como punto de partida para quien quiera entrenar sus propias politicas ACT. No es un modelo de proposito general ni esta pensado para reutilizarse fuera del robot y la tarea concretos con los que se entreno. La model card no incluye resultados de evaluacion ni informacion sobre la licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer condicionado a observaciones |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (politica de control; sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | lerobot |
| Pipeline | robotics |
| Tipo de robot | `so_follower` |
| Entradas | `observation.state` (6,), `observation.images.robot_cam` (3, 480, 640), `observation.images.workspace_cam` (3, 480, 640) |
| Salidas | `action` (6,) |
| Dataset de entrenamiento | `civcivcivciv/rrrrrrrr_20261123_110444` (25 episodios, 9.541 fotogramas, 30 FPS) |
| Pasos de entrenamiento | 20.000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-5 |
| Semilla | 1000 |
| Version de LeRobot | 0.7.1 |
| Tamano del repo | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un metodo de imitation learning basado en un transformer que predice fragmentos de accion (action chunks) en lugar de pasos individuales. La innovacion central del metodo es la prediccion de chunks: en lugar de emitir una sola accion por paso de inferencia, el modelo genera una secuencia corta de acciones futuras, lo que reduce el error de acumulacion y mitiga el problema de la varianza en el condicionamiento sobre el estado. El modelo incorpora ademas el esquema de regularizacion propuesto en el paper original (CVAE con un cuello de botella latente y ruido en el estilo), aunque la model card no detalla la configuracion exacta de hiperparametros de la cabeza CVAE para esta instancia concreta.

El entrenamiento se realizo con LeRobot 0.7.1 sobre 25 episodios de teleoperacion (9.541 fotogramas a 30 FPS) correspondientes a la tarea etiquetada como "qqq". Se usaron 20.000 pasos con batch size 8, AdamW y learning rate 1e-5. No se especifica en la informacion disponible el numero de tokens de entrenamiento (no aplica), la composicion del dataset mas alla del conteo de episodios y fotogramas, ni si se aplicaron tecnicas de aumento de datos o de RLHF/DPO (no aplicables a este tipo de modelo).

## Capacidades

- Control visomotor de un manipulador `so_follower` a partir de estado de 6 dimensiones y dos camaras RGB.
- Prediccion de chunks de accion de 6 dimensiones por paso de inferencia.
- Aprendizaje por imitacion a partir de datos de teleoperacion.
- Ejecucion en bucle cerrado sobre el robot con `lerobot-rollout` durante un tiempo configurable (`--duration`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto.
- No dispone de capacidades multilingues, vision general, audio ni thinking mode.
- No dispone de evaluacion publicada de tasa de exito en la tarea "qqq".

## Casos de uso

- Reproduccion del pipeline LeRobot de extremo a extremo: sirve como referencia para validar la instalacion de LeRobot, la calibracion del robot `so_follower` y el flujo `lerobot-rollout` antes de entrenar politicas propias.
- Entrenamiento de politicas ACT personalizadas: el comando `lerobot-train` documentado en la model card permite reutilizar la receta (ACT, AdamW, lr 1e-5, 20.000 pasos) sobre datasets propios con el mismo esquema de observaciones.
- Prototipado de tareas de pick-and-place de laboratorio: con 25 episodios y dos camaras, el modelo es adecuado para tareas simples y repetitivas en un banco de trabajo controlado.
- Docencia y formacion en robotica de imitacion: el modelo y su dataset asociado permiten ilustrar el ciclo completo grabacion-entrenamiento-despliegue con un coste computacional bajo (51,7 M de parametros).
- Base para comparaciones de metodos de imitation learning: al estar entrenado con la receta estandar de ACT en LeRobot, sirve como linea base para contrastar con Diffusion Policy u otros metodos del mismo ecosistema.
- Validacion de infraestructura de inferencia robotica: util para probar latencias de inferencia en GPU o CPU con dos flujos de video a 30 FPS antes de escalar a tareas mas complejas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se han proporcionado resultados de evaluacion para esta politica y deja la tabla de evaluacion vacia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 51,7 M de parametros en precision FP32 el peso de los parametros ronda los 0,2 GB, por lo que la VRAM dominante la determinan los dos flujos de imagen de 480x640 y el preprocesamiento, no el modelo.
- GPU recomendadas: no especificadas en la informacion disponible. Cualquier GPU consumer con al menos unos pocos GB de VRAM libre deberia poder ejecutar la inferencia; no se aportan modelos concretos.
- Cabe en GPU consumer: si, por el tamano del modelo (51,7 M de parametros); no se detalla el minimo exacto.
- Opciones de despliegue: `lerobot-rollout` (estrategia `base`) con `--policy.path=civcivcivciv/hf_act_record0`, segun la model card. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de politica.
- Latencia y throughput estimados: no disponibles. El modelo se ejecuta a 30 FPS en el bucle de control del robot segun la configuracion de camaras, pero no se publican mediciones de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `civcivcivciv/hf_act_record0` | 51.668.614 | ACT (imitation learning) | no aplica | no disponible | Hugging Face, 0 descargas |
| ACT original (Zhao et al., 2023) | no disponible | ACT | no aplica | no disponible | Paper arXiv:2304.13705 |
| Diffusion Policy (referencia LeRobot) | no disponible | Diffusion (imitation learning) | no aplica | no disponible | Ecosistema LeRobot |
| Otras politicas LeRobot (`lerobot/*`) | variable | ACT / Diffusion / otros | no aplica | variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada. La comparacion se limita a categoria, tipo de metodo y disponibilidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card. Al entrenarse con solo 25 episodios de una tarea ("qqq"), la politica hereda los sesgos de posicion, iluminacion y configuracion fisica del entorno de grabacion.
- Riesgo de sobreajuste: con 25 episodios y 9.541 fotogramas, la generalizacion a nuevas posiciones de objetos, distracciones o cambios de iluminacion es limitada; no se han publicado evaluaciones que lo cuantifiquen.
- Limitaciones de idioma y contexto: no aplica en el sentido linguistico; el modelo no procesa texto ni mantiene contexto conversacional.
- Restricciones de licencia: la licencia no esta disponible en la informacion proporcionada, por lo que no puede confirmarse el uso comercial. La model card marca el campo como "More Information Needed".
- Caveats para produccion: no hay resultados de evaluacion, ni tasa de exito, ni numero de ensayos; el modelo no debe desplegarse en produccion sin una validacion propia en el robot objetivo.
- Dependencia del hardware: la politica asume el robot `so_follower` y dos camaras con nombres `robot_cam` y `workspace_cam`; los nombres e indices de camara deben coincidir con los de entrenamiento.
- Ausencia de demo o video: la model card no incluye GIF ni video de la politica en ejecucion.
- Metadatos del repositorio: el nombre del dataset (`rrrrrrrr_20261123_110444`) y la tarea ("qqq") sugieren un experimento de prueba, no un modelo destinado a uso real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/civcivcivciv/hf_act_record0
- Dataset de entrenamiento: https://huggingface.co/datasets/civcivcivciv/rrrrrrrr_20261123_110444
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=civcivcivciv/rrrrrrrr_20261123_110444
- Paper ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guia ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guia de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabacion de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentacion de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference

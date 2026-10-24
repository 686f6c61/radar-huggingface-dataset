# Rakeshdharan56/xvla_panda_maniskill_v1

## Resumen

`Rakeshdharan56/xvla_panda_maniskill_v1` es una política robotica Vision-Language-Action (VLA) obtenida por ajuste fino de `lerobot/xvla-base`, el modelo base de X-VLA, un framework VLA de flow matching con "soft prompts" que codifica cada configuración de robot o hardware como una tarea aprendible. El modelo lo publica Rakesh Dhamodharan (usuario `Rakeshdharan56`) dentro del ecosistema LeRobot de Hugging Face y está entrenado para un brazo Franka Panda simulado en ManiSkill, con la tarea concreta de recoger y entregar objetos pequeños (botella, jeringa y vial) a partir de instrucciones en lenguaje natural.

El checkpoint resuelve un problema acotado: convertir observaciones visuales de tres cámaras y el estado del robot (8 dimensiones) en una acción continua de 7 dimensiones, a partir de una instrucción textual. No es un modelo de propósito general ni un VLM conversacional, sino una política de imitación entrenada sobre un dataset propio de 369 episodios y 45.387 fotogramas a 20 FPS, con solo 2.500 pasos de entrenamiento y sin resultados de evaluación publicados, por lo que debe tratarse como un artefacto experimental de investigación.

Su interés ahora es doble: por un lado, demuestra el flujo completo de LeRobot 0.5.2 para ajustar X-VLA sobre datos propios; por otro, sirve como punto de partida reproducible para quien quiera replicar tareas de pick-and-handover en ManiSkill. El tamaño es contenido (~880 millones de parámetros, 1,8 GB de repositorio) y la licencia Apache 2.0, lo que facilita su uso y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA con flow matching y soft prompts (X-VLA), sobre un backbone vision-lenguaje del modelo base `lerobot/xvla-base` (backbone concreto: no disponible) |
| Parametros totales | 879.738.545 (~880 M), dato real de safetensors |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponibles; el repositorio solo distribuye pesos en safetensors, sin variantes GGUF/AWQ/GPTQ documentadas |
| Idiomas soportados | no disponible; las instrucciones del dataset de entrenamiento están en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint de política LeRobot), repositorio de 1,8 GB |
| Pipeline | robotics |
| Libreria | lerobot (version de entrenamiento 0.5.2) |
| Tipo de robot | `panda` (Franka Emika Panda, simulado en ManiSkill) |
| Entradas | `observation.images.image` (3, 256, 256), `observation.images.image2` (3, 256, 256), `observation.images.image3` (3, 224, 224), `observation.state` (8,) |
| Salidas | `action` (7,) |
| Camaras declaradas | `agentview`, `eye_in_hand` |
| Modelo base | `lerobot/xvla-base` (fine-tune) |
| Dataset de entrenamiento | `Rakeshdharan56/pick_maniskill`: 369 episodios, 45.387 fotogramas, 20 FPS |

## Arquitectura y entrenamiento

X-VLA es un framework VLA de flow matching con soft prompting: en lugar de entrenar un modelo distinto por robot, cada morfología, conjunto de sensores y espacio de acciones se representa mediante un pequeño conjunto de embeddings de "soft prompt" aprendibles, de modo que un único modelo puede reconciliar hardware heterogéneo. La política consume tres flujos de imagen (dos a 256×256 y uno a 224×224), un vector de estado de 8 dimensiones y una instrucción textual, y genera una acción continua de 7 dimensiones mediante un decodificador de flow matching. El backbone vision-lenguaje exacto del modelo base no se detalla en la información disponible, y tampoco se documentan el número de tokens de contexto ni la composición del corpus de preentrenamiento de `lerobot/xvla-base`.

El ajuste fino se realizó con LeRobot 0.5.2 sobre el dataset `Rakeshdharan56/pick_maniskill`, grabado a 20 FPS en ManiSkill con 369 episodios y 45.387 fotogramas. Las instrucciones cubren nueve variantes de la misma tarea de entrega de objetos: "Can you give me the bottle", "Please pass the syringe", "Please pass the vial", "Please pass the bottle", "Hand me the syringe", "Hand me the vial", "Can you give me the vial", "Can you give me the syringe" y "Hand me the bottle". La configuración de entrenamiento es explícita: 2.500 pasos, batch de 32, optimizador `xvla-adamw`, learning rate 1e-4 y semilla 1000. No se indica si hubo fases de RLHF/DPO ni aumentos de datos; el volumen de pasos es bajo, coherente con un fine-tune de imitación sobre un único dataset y una única morfología.

## Capacidades

- Manipulación visomotora: convierte tres vistas de cámara más el estado propioceptivo del Panda en comandos de acción de 7 dimensiones a partir de una instrucción en inglés.
- Ejecución de instrucciones en lenguaje natural dentro de un vocabulario cerrado: las nueve formulaciones de la tarea de entrega de botella, jeringa y vial.
- Seguimiento de política de imitación en bucle cerrado a la frecuencia del dataset (20 FPS de referencia), apto para control reactivo en simulación.
- Condicionamiento multi-cámara: integra vista de agente y vista en la muñeca (`eye_in_hand`), lo que permite precisión en la aproximación final al objeto.
- Reutilización mediante soft prompts: al heredar el esquema de X-VLA, el mismo checkpoint puede reajustarse para otra morfología introduciendo nuevos prompts, según el planteamiento del paper.
- No soporta tool calling, function calling, agentes multi-paso fuera del bucle de control, ni generación de texto libre.
- Capacidades multilingües: no documentadas; el modelo fue entrenado con instrucciones en inglés.
- No dispone de modo "thinking", visión general, audio ni matemáticas; es una política motora, no un asistente.

## Casos de uso

- Replicación de la tarea pick-and-handover en ManiSkill: ejecutar el checkpoint con `lerobot-rollout` sobre una escena `panda` y comprobar el comportamiento de entrega de botella, jeringa o vial antes de escalar el pipeline de datos.
- Punto de partida para fine-tuning con datos propios: usar el checkpoint como inicialización cuando la morfología y el espacio de acciones (7D, Panda) coinciden, reduciendo pasos de entrenamiento frente a partir de `lerobot/xvla-base`.
- Generación de datos sintéticos y aumento de dataset: desplegar la política en ManiSkill para producir rollouts adicionales que alimenten un dataset mayor antes de un reentrenamiento supervisado.
- Validación de infraestructura de simulación: emplear el modelo como carga de trabajo realista para medir latencia de inferencia y throughput del servidor de políticas en una GPU consumer (por ejemplo, RTX 4090), como sugiere el handoff público del autor.
- Estudio de generalización de instrucciones: evaluar si las nueve formulaciones lingüísticas del dataset se comportan de forma equivalente o si el modelo es sensible a la redacción, un experimento habitual en políticas VLA.
- Base para escenarios de laboratorio o quirófano simulado: el vocabulario (jeringa, vial, botella) encaja en la línea de trabajo del autor sobre compañeros VLA para cath lab, útil para prototipar manipulación asistida en simulación antes de cualquier traslado a hardware.
- Docencia y demos de imitation learning: al ser un repositorio pequeño (1,8 GB) con configuración de entrenamiento documentada, sirve para mostrar el ciclo completo grabar-calibrar-entrenar-desplegar en LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación con el texto "_No evaluation results have been provided for this policy yet_", es decir, sin tasas de éxito, número de ensayos ni condiciones de dificultad. Tampoco se aportan métricas de pérdida de entrenamiento ni curvas de aprendizaje.

Como referencia externa, la documentación de LoongForge para evaluación en ManiSkill (tarea `PickCube-v1`, control `pd_ee_delta_pose` de 7D) señala que no hay pesos publicados del dominio ManiSkill para pi05/xvla y que sus configuraciones actúan como comprobaciones de conectividad, no como puntuaciones; advierte además de que xvla todavía no puede ejecutarse con pesos reales de ManiSkill en su módulo de evaluación. Es decir, no existe un número de referencia validado con el que comparar este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: ~3,5 GB en FP32 y ~1,8 GB en BF16/FP16 solo para pesos; con las tres cámaras de entrada y el estado de flow matching, lo razonable es reservar entre 4 y 6 GB (estimación a partir del recuento de parámetros, no medida publicada).
- GPU recomendadas: cualquier GPU con 8 GB o más. Cabe en consumer: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090; el handoff del autor documenta una sesión de trabajo en RTX 4090 con ManiSkill.
- Entrenamiento: el fine-tune se hizo con batch 32 y 2.500 pasos, carga asumible en una RTX 4090; para reproducirlo con el mismo batch conviene disponer de 24 GB de VRAM o reducir el batch.
- Despliegue: `lerobot-rollout` para ejecución en robot o simulación y `lerobot-train` para reentrenamiento. No hay soporte documentado para vLLM, TGI, llama.cpp ni Ollama, ya que no es un modelo de lenguaje autoregresivo ni se distribuye en GGUF.
- Latencia y throughput: no disponibles. El dataset está grabado a 20 FPS, lo que implica un presupuesto de 50 ms por paso de control; no se ha medido si el checkpoint cumple ese presupuesto en GPU consumer, por lo que conviene instrumentar la latencia antes de usarlo en un bucle real.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Rakeshdharan56/xvla_panda_maniskill_v1` | ~880 M | VLA flow matching con soft prompts, fine-tune | 3 imagenes + estado (8,) + instruccion; contexto no disponible | Apache 2.0 | Pesos en HF, sin evaluación publicada |
| `lerobot/xvla-base` | no disponible | VLA flow matching con soft prompts (base) | Igual que el anterior; contexto no disponible | no disponible en la informacion proporcionada | Pesos en HF; es el punto de partida del fine-tune |
| OpenVLA (7B) | ~7.000 M | VLA autoregresivo sobre VLM | Imagen unica + instruccion; contexto no disponible | MIT | Pesos y codigo publicos |
| pi0 / openpi | ~3.000 M | VLA de flow matching | Multi-camara + estado + instruccion; contexto no disponible | Apache 2.0 (openpi) | Pesos publicos, orientado a robots reales |
| ACT / Diffusion Policy en LeRobot | decenas de millones | Politica de imitacion sin lenguaje (ACT) o diffusion | Imagenes + estado; sin instruccion textual en ACT | Apache 2.0 (LeRobot) | Implementaciones de referencia muy ligeras |

La comparación relevante para este checkpoint es frente al modelo base y frente a políticas de imitación clásicas: X-VLA aporta condicionamiento por lenguaje y un esquema de soft prompts para compartir modelo entre morfologías, mientras que ACT o Diffusion Policy son mucho más ligeras y rápidas de entrenar, pero no aceptan instrucciones ni están pensadas para multi-robot. Frente a OpenVLA o pi0, este modelo es un orden de magnitud menor en parámetros, lo que abarata el despliegue pero limita la generalización fuera de la tarea entrenada.

## Limitaciones y advertencias

- Sin evaluación: no hay tasas de éxito ni número de ensayos, por lo que se desconoce si la política funciona de forma fiable incluso en la tarea para la que fue entrenada.
- Entrenamiento muy corto: 2.500 pasos y 369 episodios sobre una única tarea y una única morfología; es esperable un sobreajuste al entorno, a las posiciones de objeto y a la iluminación del dataset.
- Especialización extrema: las nueve instrucciones son variantes de una misma tarea de entrega; cualquier instrucción fuera de ese conjunto carece de garantías.
- Sin validación externa de tooling: la documentación de LoongForge indica que xvla no puede ejecutarse con pesos reales de ManiSkill en su módulo de evaluación, señal de que el soporte de terceros para este formato es todavía incompleto.
- Riesgo de alucinación en el sentido robótico: al ser una política de imitación, puede generar acciones plausibles pero incorrectas (aproximaciones fallidas, colisiones) sin ninguna señal de incertidumbre; no hay mecanismo de abstención.
- Sesgos: no documentados; al derivar de un modelo base cuyo corpus no se detalla, no puede descartarse sesgo visual heredado (texturas, iluminación, tipos de objeto).
- Idioma: instrucciones solo en inglés; no se ha verificado el comportamiento con instrucciones en castellano.
- Licencia Apache 2.0 permite uso comercial, pero el dataset subyacente y el modelo base deben verificarse por separado antes de un despliegue productivo; la licencia del base no está indicada en la información disponible.
- Cambios de dominio: no hay evidencia de sim2real; el modelo fue entrenado en simulación y no se documenta ningún traslado a un Panda físico.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rakeshdharan56/xvla_panda_maniskill_v1
- Modelo base: https://huggingface.co/lerobot/xvla-base
- Dataset de entrenamiento: https://huggingface.co/datasets/Rakeshdharan56/pick_maniskill
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Rakeshdharan56/pick_maniskill
- Paper de X-VLA: https://huggingface.co/papers/2510.10274 (arXiv 2510.10274)
- Guía LeRobot para xvla: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Perfil del autor en Hugging Face: https://huggingface.co/Rakeshdharan56
- Handoff del autor sobre sesión RTX 4090 + ManiSkill/Genesis: https://github.com/Rakeshdharan/vla-cathlab-companion/blob/main/docs/handoffs/2026-10-23-rtx4090-maniskill-genesis-session.md
- ManiSkill (plataforma de simulación): https://www.maniskill.ai/
- Repositorio ManiSkill: https://github.com/mani-skill/ManiSkill
- Evaluación ManiSkill en LoongForge: https://loongforge.readthedocs.io/en/latest/embodied_tutorial/eval_docs/benchmarks/maniskill.html

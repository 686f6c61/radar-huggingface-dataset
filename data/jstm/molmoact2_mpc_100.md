# jstm/molmoact2_mpc_100

## Resumen

MolmoAct2 MPC 100 (identificador `jstm/molmoact2_mpc_100`) es una política robótica de tipo vision-language-action (VLA) publicada por el usuario jstm. Se trata de un ajuste fino del modelo base `allenai/MolmoAct2-LIBERO`, desarrollado por el Allen Institute for AI (Ai2), sobre 100 demostraciones de planificación de movimiento por tarea en cuatro entornos de manipulación tabletop de ManiSkill. El modelo toma tres imágenes de cámara de 378×378 píxeles más un vector de estado de 9 dimensiones, y produce fragmentos de acción continua (action chunks) de 7 dimensiones que corresponden a la pose absoluta del efector final de un robot Panda.

El modelo resuelve el problema de traducir instrucciones en lenguaje natural y observaciones visuales en comandos motores para tareas concretas: levantar un cubo rojo, empujar un cubo hasta un objetivo, poner de pie un pivote y usar un gancho en forma de L para arrastrar un cubo azul. Con 5.442.196.272 parámetros (unos 5,44 mil millones) y un repositorio de 10,9 GB, es una política de tamano medio dentro de la familia de modelos fundacionales de robótica.

Su relevancia reside en que demuestra el flujo completo de ajuste fino de un modelo fundacional robótico con LeRobot 0.6.0 sobre un conjunto de datos pequeño y reproducible (384 episodios, 97.753 fotogramas a 30 FPS), con licencia Apache-2.0. El modelo tiene, en el momento de redactar esta ficha, cero descargas y cero "me gusta" en el Hub, por lo que no cuenta con validación externa de la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política robótica VLA (vision-language-action) basada en MolmoAct2; estructura interna detallada no disponible |
| Parametros totales | 5.442.196.272 (≈5,44 mil millones) |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible (no aplicable en el sentido de un LLM: la política consume 1 estado y 3 imágenes por paso de inferencia) |
| Tipos de cuantizacion | No disponible; los pesos se publican en precisión completa dentro de un repositorio de 10,9 GB |
| Idiomas soportados | No disponible; las instrucciones de las tareas del dataset están en inglés |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato LeRobot) |
| Tipo de modelo | Política de control robótico (pipeline: robotics) |
| Robot | `panda` |
| Modo de control | Pose absoluta del efector final (`pd_ee_pose`) |
| Entradas | `observation.state` (9,); `observation.images.camera_center`, `camera_left` y `camera_wrist` (3, 378, 378) cada una |
| Salidas | `action` (7,) continua |
| Modelo base | `allenai/MolmoAct2-LIBERO` |
| Dataset de ajuste | `jstm/mpc_lerobot_pd_ee_pose_100` (384 episodios, 97.753 fotogramas, 30 FPS) |
| Configuracion de entrenamiento | 10.000 pasos, batch size 32, optimizador AdamW, learning rate 1e-5, seed 1000, LeRobot 0.6.0 |

## Arquitectura y entrenamiento

MolmoAct2 es un modelo fundacional de robótica abierto de Ai2 que asigna imágenes de cámara e instrucciones en lenguaje a fragmentos de acción. La información disponible no detalla la arquitectura interna (tipo de transformer, presencia de mezcla de expertos, mecanismo de atención o diseno del decodificador de acciones), por lo que esos extremos quedan como no disponibles. El modelo base del que parte este ajuste es `allenai/MolmoAct2-LIBERO`, y el resultado aquí descrito es un ajuste fino específico de tarea.

El entrenamiento se realizó con LeRobot 0.6.0 sobre el dataset `jstm/mpc_lerobot_pd_ee_pose_100`, compuesto por 384 episodios y 97.753 fotogramas a 30 FPS, generados mediante planificación de movimiento (MPC) con 100 demostraciones por tarea. Las cuatro tareas son `PickCube-v2-wrist` ("lift the red cube"), `PushCube-v2` ("push the cube to the goal"), `LiftPegUpright-v2` ("lift the peg upright") y `PullCubeTool-v2` ("grasp the red L-shaped hook and use it to pull the blue cube closer to the robot"), con 96 episodios cada una. El ajuste se ejecutó durante 10.000 pasos con batch size 32, AdamW y learning rate 1e-5. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna innovación técnica adicional como decodificación especulativa o atención lineal.

## Capacidades

- Control robótico continuo: genera acciones de 7 dimensiones correspondientes a la pose absoluta del efector final de un robot Panda, en modo `pd_ee_pose`.
- Percepción visual multi-cámara: procesa simultáneamente tres vistas RGB de 378×378 (`camera_center`, `camera_left`, `camera_wrist`).
- Seguimiento de instrucciones en lenguaje: condiciona la política a la descripción textual de la tarea.
- Integración de estado propioceptivo: consume un vector de estado de 9 dimensiones junto con las imágenes.
- Ejecución de tareas de manipulación tabletop: levantar cubos, empujar objetos hasta un objetivo, poner objetos de pie y usar herramientas (gancho en L) para atraer objetos.
- Ejecución de "action chunks": el modelo produce secuencias de acciones en lugar de un único paso, según la descripción de MolmoAct2.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso simbólico, capacidades de audio, ni modo de razonamiento explícito ("thinking mode").
- Capacidades multilingües: no disponibles.

## Casos de uso

- Evaluación de políticas VLA en ManiSkill: el modelo se puede ejecutar con `lerobot-eval` sobre los entornos `PickCube-v2-wrist`, `PushCube-v2`, `LiftPegUpright-v2` y `PullCubeTool-v2`, con episodios de 100 pasos y 50 episodios de evaluación, para medir la tasa de éxito de una política ajustada con 100 demostraciones por tarea.
- Punto de partida para ajuste fino propio: dado que parte de `allenai/MolmoAct2-LIBERO` y se entrena mediante `lerobot-train` con `--policy.type=molmoact2`, sirve como inicialización para nuevos datasets con el mismo modo de control y el mismo esquema de cámaras.
- Investigación en manipulación con herramientas: la tarea `PullCubeTool-v2` requiere agarrar un gancho en L y usarlo para arrastrar un cubo azul, un escenario típico de estudio de uso indirecto de objetos.
- Generación de datos y comparación de estrategias: entrenado sobre demostraciones de planificación de movimiento (MPC), permite comparar políticas aprendidas frente a planificadores clásicos en las mismas tareas y con las mismas condiciones iniciales.
- Docencia y reproducción de experimentos: el flujo completo (dataset de 384 episodios, 97.753 fotogramas, configuración de entrenamiento documentada con seed 1000) es reproducible con recursos moderados, lo que facilita prácticas de aprendizaje por imitación en robótica.
- Control de robot real con Panda: el modo `pd_ee_pose` con acciones de 7 dimensiones es compatible con interfaces de control de efector final, siempre que se disponga del mismo conjunto de cámaras y de un entorno equivalente a las tareas de entrenamiento (sin validación documentada en hardware real).
- Reutilización de la interfaz de observación: cualquier pipeline que ya produzca `observation.state` de 9 dimensiones y tres imágenes de 378×378 puede alimentar la política sin cambios de formato.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye el comando de evaluación (`lerobot-eval` con 50 episodios, batch size 20, altura y anchura de observación de 378) pero no presenta tasas de éxito ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para los pesos: en bf16/fp16, unos 10,9 GB (coherente con el tamano del repositorio); en fp32, unos 21,8 GB; en int8, aproximadamente 5,5 GB; en int4, alrededor de 2,8 GB (estos tres últimos son estimaciones calculadas a partir de los 5.442.196.272 parámetros, no valores publicados).
- VRAM adicional: hay que sumar activaciones del codificador visual y de tres imágenes de 378×378 por paso de inferencia, más el estado de 9 dimensiones y los búferes de acción.
- GPU recomendadas: A100 (40 o 80 GB), H100, L40S o similares para bf16 sin cuantizar con margen amplio; RTX 4090 o RTX 5090 (24 GB o más) son suficientes para bf16.
- Cabe en GPU de consumo: sí, en bf16 en tarjetas con 16-24 GB; con cuantización a int8 podría caber en tarjetas de 8-12 GB, aunque no se documenta un procedimiento oficial de cuantización.
- Opciones de despliegue: LeRobot (`lerobot-eval` con `--policy.path` y `--trust_remote_code=true`) sobre PyTorch con CUDA. No se publican pesos GGUF, por lo que llama.cpp u Ollama no son aplicables directamente; los servidores orientados a LLM (vLLM, TGI) no están pensados para este tipo de política de control.
- Latencia y throughput: no disponibles. El ejemplo de evaluación usa `--eval.batch_size=20` y episodios de 100 pasos, lo que da una referencia de la configuración utilizada, pero sin cifras de tiempo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `jstm/molmoact2_mpc_100` | 5.442.196.272 | No aplicable | apache-2.0 | HuggingFace (LeRobot) |
| `allenai/MolmoAct2-LIBERO` (modelo base) | No disponible | No aplicable | No disponible | HuggingFace |
| Otras políticas VLA de la misma categoría (Por ejemplo OpenVLA, pi0 o SmolVLA) | No disponible en la información proporcionada | No disponible | No disponible | No disponible |

Los resultados de benchmarks de estas alternativas frente a este modelo no están disponibles en la información consultada, por lo que no se puede establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Dominio muy restringido: el ajuste cubre únicamente cuatro tareas tabletop de ManiSkill con 384 episodios y 97.753 fotogramas; se espera una generalización muy limitada fuera de esa distribución.
- Riesgo de sobreajuste: con 100 demostraciones por tarea y 10.000 pasos de entrenamiento, el modelo puede memorizar trayectorias de las condiciones iniciales vistas.
- Sin validación en robot real: toda la información disponible se refiere a simulación (ManiSkill) y a un robot `panda` virtual; no se documentan pruebas en hardware físico.
- Interfaz rígida: exige exactamente tres cámaras con los nombres `camera_center`, `camera_left` y `camera_wrist` a 378×378, un estado de 9 dimensiones y modo de control `pd_ee_pose`; cualquier desviación requiere reentrenamiento o adaptación.
- Idioma: las instrucciones de tarea están en inglés y no se declaran idiomas soportados.
- Riesgo de alucinación motora: como toda política de aprendizaje por imitación, puede producir acciones fuera de distribución ante observaciones no vistas, sin mecanismo de seguridad documentado.
- `--trust_remote_code=true`: el flujo de evaluación recomendado implica ejecutar código del repositorio; conviene revisarlo antes de usarlo en entornos controlados.
- Adopción nula: cero descargas y cero "me gusta" en el Hub, sin informes independientes de calidad o robustez.
- Licencia: el modelo se distribuye bajo Apache-2.0, lo que permite uso comercial, pero el modelo base y el dataset pueden tener condiciones propias que hay que verificar por separado.
- Uso en producción: no se recomienda sin una evaluación propia de tasas de éxito, latencia y comportamiento ante fallos; el modelo se presenta como artefacto de investigación.
- La fecha de creación indicada por el Hub (2026-10-10) y la de actualización (2026-10-10) no permiten establecer un historial de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jstm/molmoact2_mpc_100
- Modelo base: https://huggingface.co/allenai/MolmoAct2-LIBERO
- Dataset de entrenamiento: https://huggingface.co/datasets/jstm/mpc_lerobot_pd_ee_pose_100
- Blog de MolmoAct2 (Ai2): https://allenai.org/blog/molmoact2
- Guía de LeRobot para molmoact2: https://huggingface.co/docs/lerobot/main/en/molmoact2
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot

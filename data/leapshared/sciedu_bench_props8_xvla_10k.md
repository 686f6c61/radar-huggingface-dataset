# leapshared/sciedu_bench_props8_xvla_10k

## Resumen

X-VLA es un framework de Vision-Language-Action (VLA) basado en flow matching y soft prompts, desarrollado en el contexto del ecosistema LeRobot de Hugging Face. El modelo aquí publicado, `leapshared/sciedu_bench_props8_xvla_10k`, es un checkpoint concreto entrenado sobre el dataset `leapshared/sciedu_bench_v2_sim_props8_all`, orientado a tareas de manipulación robótica en un entorno simulado de laboratorio de ciencias (SciEdu Bench). La idea central de X-VLA es tratar cada configuración de robot o hardware como una "tarea" codificada mediante un conjunto reducido de embeddings de soft prompt aprendibles, lo que permite que un único modelo reconcilie morfologías, sensores y espacios de acción diversos.

El checkpoint tiene 879.687.256 parámetros (aproximadamente 880 millones), se distribuye en formato safetensors y utiliza la librería LeRobot (versión 0.7.0) como marco de entrenamiento e inferencia. Consume tres cámaras RGB de 480x640 (una frontal `follower_d455f` y dos de muñeca, `left_wrist` y `right_wrist`) junto con un vector de estado de 16 dimensiones, y produce un vector de acción también de 16 dimensiones. El robot objetivo es `openarm_sciedu_sim`, un brazo bimanual simulado.

Su relevancia es acotada pero específica: se trata de una política de imitación entrenada durante 10.000 pasos sobre 2.365 episodios (1.438.051 frames a 30 FPS) para ejecutar tareas experimentales de física y química en simulación, como frotar una varilla en piel para cargarla electrostáticamente o manipular minerales y placas metálicas. No es un modelo de lenguaje general, sino una política robótica que integra percepción visual, comprensión de instrucciones en lenguaje natural y generación de acciones motoras.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (X-VLA) con flow matching y soft prompts |
| Parámetros totales | 879.687.256 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Librería | LeRobot 0.7.0 |
| Pipeline | robotics |
| Tipo de robot | `openarm_sciedu_sim` |
| Cámaras | `follower_d455f`, `left_wrist`, `right_wrist` (3x480x640) |
| Entrada de estado | `observation.state` de forma (16,) |
| Salida de acción | `action` de forma (16,) |
| Tamaño del repositorio | 3.5 GB |

## Arquitectura y entrenamiento

X-VLA es un framework VLA con "soft prompting": cada configuración de robot o hardware se representa como una tarea mediante un conjunto pequeño de embeddings de soft prompt aprendibles. Esto permite que un único modelo maneje morfologías, sensores y espacios de acción heterogéneos sin necesidad de cabezas específicas por robot. El mecanismo de generación de acciones se basa en flow matching, una alternativa a la difusión que modela directamente un campo de velocidades entre la distribución de ruido y la distribución de acciones. La model card no detalla la columna vertebral del modelo de lenguaje ni del codificador visual, ni el número de tokens de contexto, por lo que esos datos no están disponibles.

El entrenamiento se realizó sobre el dataset `leapshared/sciedu_bench_v2_sim_props8_all`, con 2.365 episodios, 1.438.051 frames a 30 FPS y 30 tareas distintas de manipulación científica en simulación. La configuración reportada incluye 10.000 pasos de entrenamiento, batch size de 32, optimizador `xvla-adamw`, learning rate de 0.0001 y semilla 1000. No se especifica en la información disponible si hubo RLHF, DPO ni la composición exacta del dataset más allá de las tareas listadas.

## Capacidades

- Generación de acciones motoras de 16 dimensiones para un brazo bimanual simulado (`openarm_sciedu_sim`) a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: procesa simultáneamente una vista frontal y dos vistas de muñeca a 480x640.
- Comprensión de instrucciones de tarea en lenguaje natural (30 tareas descritas en inglés, como "rub the rod on the fur" o "put the leaf on the left side").
- Ejecución de secuencias de manipulación de precisión: agarrar, mover, soltar, frotar, apuntar y sostener objetos.
- Soporte de control en bucle cerrado mediante `lerobot-rollout` con estrategia base.
- Capacidad de ser reentrenado con `lerobot-train` sobre datasets propios en el ecosistema LeRobot.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento matemático ni modalidades de audio.

## Casos de uso

- Automatización de experimentos de electrostática en simulación: la política ejecuta la secuencia "pick up the black charging rod", "rub the rod on the fur" y "hold the rod still at the electroscope", adecuada porque ha sido entrenada específicamente sobre esas trayectorias con tres cámaras.
- Manipulación de minerales con brazo bimanual: tareas como "pick up the right mineral with the left hand" y "rub the mineral on the streak plate" se benefician de las dos vistas de muñeca, que permiten un control fino de la pinza.
- Pipeteo y transferencia de líquidos simulados: instrucciones como "draw acid from the petri dish" y "squeeze the dropper onto the mineral" se ejecutan con el vector de acción de 16 dimensiones que codifica ambas manos.
- Generación de datos sintéticos de demostración: al ejecutarse en `openarm_sciedu_sim`, puede producir rollouts que alimenten datasets de imitación adicionales para entrenar políticas más robustas.
- Evaluación comparativa de políticas VLA: sirve como referencia base en SciEdu Bench para medir el rendimiento de nuevos checkpoints sobre las mismas 30 tareas.
- Investigación en soft prompting multi-robot: el checkpoint es un ejemplo entrenado de X-VLA que permite estudiar cómo los soft prompts reconcilian morfologías distintas dentro de un mismo modelo.
- Prototipado de flujos de imitación en LeRobot: útil para validar el pipeline `lerobot-train` → `lerobot-rollout` antes de escalar a robots reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 3,5 GB solo para pesos, más activaciones y buffers de las tres cámaras a 480x640; en la práctica se recomienda al menos 8-12 GB.
- VRAM estimada en fp16/bf16: aproximadamente 1,8 GB para pesos, con margen adicional para visión y flow matching.
- GPU recomendadas: RTX 3090, RTX 4090, A100 o H100 para despliegue con baja latencia; cualquier GPU consumer con 8 GB o más debería poder ejecutar inferencia.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial), integración con el stack LeRobot; no se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI, dado que es una política robótica y no un LLM.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del hardware y de la frecuencia de control del simulador (30 FPS en entrenamiento).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `leapshared/sciedu_bench_props8_xvla_10k` | 879,7 M | no disponible | VLA robótica (SciEdu Bench) | no disponible | Hugging Face |
| Políticas ACT de LeRobot | no disponible | no disponible | Imitación robótica | según checkpoint | Hugging Face |
| Políticas Diffusion Policy de LeRobot | no disponible | no disponible | Imitación robótica | según checkpoint | Hugging Face |
| OpenVLA | no disponible en esta ficha | no disponible | VLA generalista | no disponible | Hugging Face |

La comparación cuantitativa con alternativas no está disponible porque la información proporcionada no incluye métricas de éxito ni resultados de benchmarks de este checkpoint frente a otros.

## Limitaciones y advertencias

- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor.
- Entrenado exclusivamente en simulación (`openarm_sciedu_sim`); el transfer a robots reales no está documentado y probablemente requiera ajuste fino.
- El espacio de acciones es fijo de 16 dimensiones y está acoplado a la morfología del robot simulado; no es directamente reutilizable en otros brazos sin reentrenamiento o adaptación de soft prompts.
- Solo se han publicado 10.000 pasos de entrenamiento, lo que puede implicar menor robustez que checkpoints más largos.
- Las 30 tareas están definidas en inglés y acotadas a experimentos científicos concretos; no hay evidencia de generalización a instrucciones fuera de esa distribución.
- Riesgo de alucinación motora: como toda política de imitación, puede ejecutar acciones plausibles pero incorrectas ante observaciones fuera de distribución.
- No se documentan sesgos demográficos ni lingüísticos, pero tampoco evaluaciones de seguridad.
- No hay información sobre latencia, tasa de éxito ni curvas de aprendizaje, lo que dificulta estimar su viabilidad en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leapshared/sciedu_bench_props8_xvla_10k
- Paper de X-VLA (arXiv 2510.10274): https://huggingface.co/papers/2510.10274
- Dataset de entrenamiento: https://huggingface.co/datasets/leapshared/sciedu_bench_v2_sim_props8_all
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=leapshared/sciedu_bench_v2_sim_props8_all
- Guía de X-VLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/xvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Guía de grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots

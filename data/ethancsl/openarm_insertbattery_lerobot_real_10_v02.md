# ethanCSL/openarm_insertbattery_lerobot_real_10_v02

## Resumen

`ethanCSL/openarm_insertbattery_lerobot_real_10_v02` es una política de vision-language-action (VLA) obtenida mediante fine-tuning del modelo base `lerobot/smolvla_base` sobre un dataset propio de demostraciones reales de robot. El autor, `ethanCSL`, la ha entrenado y publicado con LeRobot 0.6.2 para la tarea concreta de recoger una estación de carga con el brazo izquierdo e insertar una batería en ella con el brazo derecho, sobre un robot de tipo `openarm_umeow`.

SmolVLA, el método subyacente (arXiv:2506.01844), es un VLA compacto y eficiente pensado para ejecutarse en hardware de consumo manteniendo un rendimiento competitivo frente a modelos mucho mayores. Esta ficha concreta no es un modelo de propósito general: es un checkpoint de imitación especializado en una única tarea de manipulación bimanual, con 450.046.176 parámetros y un repo de 0,9 GB en safetensors.

Su relevancia es práctica más que de investigación: sirve como ejemplo reproducible de un pipeline completo de imitación (grabación de datos, entrenamiento con LeRobot, rollout en robot real) y como punto de partida para quien quiera adaptar SmolVLA a su propia celda robótica. Conviene subrayar que no se han publicado resultados de evaluación en robot real para esta política.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action), fine-tune de `lerobot/smolvla_base` |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (las instrucciones de tarea se aportan en texto; el modelo card no declara cobertura lingüística) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

Especificaciones adicionales de entrada y salida:

| Elemento | Valor |
|---|---|
| Tipo de robot | `openarm_umeow` |
| Cámaras declaradas | `body_cam`, `wrist_cam`, `right_wrist_cam` |
| Entrada `observation.state` | STATE, shape `(6,)` |
| Entrada `observation.images.camera1` | VISUAL, shape `(3, 256, 256)` |
| Entrada `observation.images.camera2` | VISUAL, shape `(3, 256, 256)` |
| Entrada `observation.images.camera3` | VISUAL, shape `(3, 256, 256)` |
| Salida `action` | ACTION, shape `(16,)` |
| Tamaño del repo | 0,9 GB |
| Pipeline | robotics |
| Librería | lerobot |

## Arquitectura y entrenamiento

La política sigue la arquitectura SmolVLA: un modelo vision-language-action que combina un codificador visual, un componente de lenguaje y un decodificador de acciones, entrenado por imitación para mapear observaciones multimodales (tres cámaras RGB de 256×256 y un vector de estado de 6 dimensiones) a un vector de acción de 16 dimensiones. El modelo base `lerobot/smolvla_base` aporta el preentrenamiento; este checkpoint es un fine-tune supervisado sobre demostraciones reales, no un modelo con RLHF ni DPO.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `ethanCSL/openarm_insertbattery_lerobot_real_10_v02`: 10 episodios, 7.440 frames a 30 FPS, con la instrucción de tarea "Pick up the charging station with the left arm, and insert battery in it with the right arm". Configuración: 20.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-4, seed 1000. El volumen de datos es muy reducido (10 episodios), lo que es determinante para interpretar el alcance y la robustez esperables de la política.

## Capacidades

- Control robótico por imitación: genera comandos de acción de 16 dimensiones a partir de tres vistas de cámara y del estado del robot.
- Manipulación bimanual: la tarea entrenada requiere coordinar el brazo izquierdo (sujeción de la estación de carga) y el derecho (inserción de la batería).
- Condicionamiento por instrucción en lenguaje natural: la política acepta una descripción de tarea en texto en el rollout, aunque está entrenada para una única instrucción.
- Percepción visual multi-cámara: consume simultáneamente `body_cam`, `wrist_cam` y `right_wrist_cam` a 256×256.
- Despliegue en hardware de consumo: SmolVLA está diseñado para inferencia en equipos asequibles, no solo en servidores.
- Tool calling / function calling: no disponible (no es una capacidad de este tipo de modelo).
- Agentes y razonamiento multi-paso: no disponible como capacidad declarada; la política ejecuta una secuencia de manipulación aprendida, no planificación simbólica.
- Capacidades multilingües: no disponible.
- Modo thinking, visión generativa, audio: no disponible.

## Casos de uso

- Reproducción de la tarea de inserción de batería: ejecutar la política con `lerobot-rollout` sobre un `openarm_umeow` calibrado, usando la instrucción exacta de entrenamiento y las tres cámaras en las posiciones esperadas. Adecuado porque el checkpoint está entrenado precisamente para esa secuencia bimanual.
- Banco de pruebas de pipelines de imitación: usar el repo como referencia de extremo a extremo (dataset de 10 episodios, 20.000 pasos, LeRobot 0.6.2) para validar la instalación, el formateo de datos y el flujo de entrenamiento antes de invertir en datasets mayores.
- Fine-tuning sobre una celda propia: partir de `lerobot/smolvla_base` y replicar la configuración (AdamW, lr 1e-4, batch 8) con un dataset propio para adaptar SmolVLA a otra tarea de manipulación.
- Docencia y demostraciones de VLA: el tamaño contenido (450 M parámetros, repo de 0,9 GB) y la licencia Apache 2.0 lo hacen apto para laboratorios y cursos donde no hay clústeres dedicados.
- Evaluación comparativa de políticas de imitación: servir como baseline especializado de SmolVLA frente a otras políticas entrenadas en la misma tarea o robot, midiendo tasas de éxito en robot real.
- Integración en flujos de automatización de laboratorio: como componente de una rutina de carga/ensamblado con objetos similares a la estación de carga, siempre que se revalide la política en el entorno final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación con la plantilla sin cumplimentar y la nota explícita: "No evaluation results have been provided for this policy yet". No se dispone de tasas de éxito en robot real, latencia ni throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma medida. Con 450 M parámetros en safetensors (aproximadamente 1,8 GB en fp32 o 0,9 GB en fp16, coherente con el tamaño del repo), la huella es reducida, pero no se publica una cifra oficial de VRAM.
- GPU recomendadas: no disponible en la información proporcionada. SmolVLA se describe como desplegable en hardware de consumo, sin lista de modelos concretos.
- Compatibilidad con GPU de consumo: plausible por tamaño y por el diseño de SmolVLA, pero no confirmada con mediciones para este checkpoint.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para ejecución, `lerobot-train` para reentrenamiento). No se documentan vLLM, llama.cpp, Ollama ni TGI para esta política.
- Latencia y throughput: no disponible. La política opera sobre datos a 30 FPS en la grabación, pero no se declara la frecuencia de inferencia alcanzable.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ethanCSL/openarm_insertbattery_lerobot_real_10_v02` | 450.046.176 | no disponible | sin evaluación publicada | Apache 2.0 | Hugging Face (0 descargas, 0 likes) |
| `lerobot/smolvla_base` | no disponible en la información | no disponible | no disponible | no disponible en la información | Hugging Face, modelo base oficial |
| Otras políticas VLA de tamaño comparable (p. ej. familia OpenVLA) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa no es posible con los datos disponibles: el checkpoint es un fine-tune especializado de una sola tarea y no publica métricas. La alternativa directamente comparable es el propio `lerobot/smolvla_base`, del que este modelo deriva.

## Limitaciones y advertencias

- Especialización extrema: entrenado con 10 episodios y una única instrucción de tarea; no se espera generalización a otras tareas, objetos o posiciones sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que no se puede afirmar robustez en producción.
- Dependencia de configuración: requiere que los nombres de cámara (`body_cam`, `wrist_cam`, `right_wrist_cam`) y sus índices coincidan con los usados en el entrenamiento; un montaje distinto invalida la política.
- Dependencia de hardware: pensado para el robot `openarm_umeow`; transferirlo a otra morfología o a otro robot del mismo tipo exige revalidación.
- Riesgo de sobreajuste al entorno de grabación: iluminación, fondo y posiciones de objeto del dataset condicionan el comportamiento; no se documentan variaciones.
- Sesgos: no disponibles en la información proporcionada.
- Riesgo de alucinación: no aplica en el sentido de generación de texto; el riesgo equivalente es ejecutar acciones incorrectas o inseguras ante observaciones fuera de distribución.
- Licencia: Apache 2.0 permite uso comercial, pero debe conservarse el aviso de licencia y citarse el método y LeRobot según la model card.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente y sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ethanCSL/openarm_insertbattery_lerobot_real_10_v02
- Dataset de entrenamiento: https://huggingface.co/datasets/ethanCSL/openarm_insertbattery_lerobot_real_10_v02
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ethanCSL/openarm_insertbattery_lerobot_real_10_v02

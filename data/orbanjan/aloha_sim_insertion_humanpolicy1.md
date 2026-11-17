# orbanjan/aloha_sim_insertion_humanpolicy1

## Resumen

`orbanjan/aloha_sim_insertion_humanpolicy1` es una política de imitación robótica entrenada con el método ACT (Action Chunking with Transformers) sobre el dataset simulado `lerobot/aloha_sim_insertion_human`. La publica el usuario orbanjan en Hugging Face usando la librería LeRobot de Hugging Face, y su propósito es controlar un robot ALOHA (Aloha) en la tarea concreta de insertar una clavija en un receptáculo ("Insert the peg into the socket"). No es un modelo de lenguaje: es un controlador visomotor que consume una imagen de cámara y el estado de las articulaciones, y produce acciones de 14 dimensiones.

El modelo tiene 51.685.006 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de políticas ligeras que pueden ejecutarse en tiempo real en hardware modesto. La arquitectura ACT predice "trozos" (chunks) de acciones en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación fina como la inserción.

Su relevancia es doble: por un lado sirve como ejemplo reproducible de un pipeline completo de aprendizaje por imitación con LeRobot (grabación de datos, entrenamiento y despliegue); por otro, es una política de referencia para la tarea de inserción en simulación, útil para comparar configuraciones de entrenamiento o para hacer pruebas de integración antes de pasar a un robot real. La licencia no está declarada y no se han publicado resultados de evaluación, lo que limita su uso en producción sin una validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.685.006 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors |
| Tipo de robot | ALOHA (Aloha) |
| Camaras | top (una camara, imagen 3x480x640) |
| Entrada de estado | `observation.state` de forma (14,) |
| Salida de accion | `action` de forma (14,) |
| Dataset de entrenamiento | `lerobot/aloha_sim_insertion_human` (50 episodios, 25.000 frames, 50 FPS) |
| Tarea | "Insert the peg into the socket." |
| Pasos de entrenamiento | 10.000 |
| Batch size | 32 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Version de LeRobot | 0.7.1 |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. En lugar de predecir una única acción por paso de tiempo, el modelo predice un chunk de acciones futuras, lo que mitiga el problema de la acumulación de errores en políticas que se ejecutan de forma autoregresiva. La arquitectura combina un codificador visual (para procesar la imagen de la cámara `top`), un codificador del estado de las articulaciones (vector de 14 dimensiones) y un transformer que genera el chunk de acciones. El modelo resultante tiene 51.685.006 parámetros.

El entrenamiento se realizó con LeRobot 0.7.1 sobre el dataset `lerobot/aloha_sim_insertion_human`, compuesto por 50 episodios y 25.000 frames grabados a 50 FPS en simulación, todos ellos de la tarea de inserción de la clavija. Se usaron 10.000 pasos de entrenamiento con batch size 32, optimizador AdamW y learning rate 1e-05, con semilla 1000. No se documenta el uso de RLHF, DPO ni de un dataset adicional; es un entrenamiento puramente supervisado sobre demostraciones teleoperadas. La model card no detalla innovaciones adicionales más allá del propio mecanismo de chunking de ACT.

## Capacidades

- Control visomotor de un robot ALOHA en la tarea de inserción de una clavija en un receptáculo.
- Predicción de chunks de acciones de 14 dimensiones a partir de una imagen de cámara y del estado de las articulaciones.
- Aprendizaje por imitación a partir de demostraciones teleoperadas (50 episodios, 25.000 frames).
- Ejecución en bucle cerrado mediante el comando `lerobot-rollout` con estrategia `base`.
- Integración con el ecosistema LeRobot para grabación de datos, entrenamiento y despliegue.
- No soporta tool calling, function calling, agentes multi-paso, capacidades multilingües ni modos de razonamiento: no es un modelo de lenguaje.

## Casos de uso

- Validación de pipelines de aprendizaje por imitación: sirve como política de referencia para comprobar que la instalación de LeRobot, la configuración de cámaras y el robot ALOHA funcionan correctamente antes de entrenar políticas propias.
- Investigación en manipulación fina: la tarea de inserción de clavija es un benchmark clásico de precisión; esta política permite reproducir experimentos de ACT y comparar variantes de hiperparámetros.
- Pruebas de integración en simulación: al estar entrenada sobre datos simulados de ALOHA, permite ensayar el flujo completo de `lerobot-rollout` sin necesidad de un robot físico.
- Educación y demostraciones: su tamaño reducido (0,2 GB, ~51,7 M de parámetros) facilita su uso en talleres y cursos sobre robótica con aprendizaje profundo.
- Baseline para comparación de métodos: cualquier nueva política entrenada sobre `lerobot/aloha_sim_insertion_human` puede compararse contra esta como referencia de partida.
- Desarrollo de sistemas de control con chunking: el código y los pesos sirven para estudiar cómo afecta el tamaño del chunk de acciones a la estabilidad del control en tareas de contacto.
- Prototipado de despliegue en robot real: tras validar en simulación, puede transferirse a un ALOHA físico para pruebas preliminares, siempre con supervisión y sin garantías de éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51.685.006 parámetros en safetensors, los pesos ocupan aproximadamente 0,2 GB en FP32, por lo que caben holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (RTX 3060, RTX 4090, A100, H100). Para inferencia en tiempo real a 30-50 FPS, una RTX 3060 o superior es suficiente; el cuello de botella suele ser la captura de cámara y la comunicación con el robot, no el modelo.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM; también es viable en CPU para pruebas no críticas.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte para estrategias `base` y otras; el modelo se carga directamente desde el Hub con `--policy.path=orbanjan/aloha_sim_insertion_humanpolicy1`.
- Latencia y throughput estimados: no disponibles; dependen del hardware, de la resolución de la cámara (480x640) y de la frecuencia de control del robot. El dataset se grabó a 50 FPS, lo que sugiere que el sistema debe operar en ese orden de magnitud.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `orbanjan/aloha_sim_insertion_humanpolicy1` | 51.685.006 | no aplica | Inserción de clavija en ALOHA sim | no disponible | Hugging Face |
| Políticas ACT de referencia en LeRobot | no disponible | no aplica | Manipulación con ALOHA | según repositorio | Hugging Face / LeRobot |
| Políticas Diffusion Policy | no disponible | no aplica | Manipulación visomotora | según repositorio | Hugging Face / LeRobot |
| Políticas VQ-BeT | no disponible | no aplica | Manipulación visomotora | según repositorio | Hugging Face / LeRobot |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada; la comparación se limita a categoría, tarea y disponibilidad.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación: se desconoce la tasa de éxito real de la política, tanto en simulación como en robot físico.
- La licencia no está declarada ("More Information Needed"), lo que impide confirmar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- Entrenada exclusivamente sobre datos simulados de ALOHA (`aloha_sim_insertion_human`); la transferencia a un robot real o a variaciones de la tarea no está garantizada.
- Solo cubre una tarea concreta ("Insert the peg into the socket") y una única cámara (`top`); no generaliza a otras tareas ni a configuraciones de sensores distintas.
- El dataset de entrenamiento es pequeño (50 episodios, 25.000 frames), lo que puede provocar sobreajuste y poca robustez ante cambios de iluminación, posición de objetos o distracciones.
- Riesgo de alucinación en el sentido de acciones incorrectas o inseguras: al ser una política de control, los errores se traducen en movimientos físicos, por lo que se requiere supervisión y límites de seguridad en el robot.
- No es un modelo de lenguaje: no soporta texto, tool calling, agentes ni capacidades multilingües; cualquier uso en esos ámbitos es inadecuado.
- La model card no documenta sesgos ni limitaciones adicionales; la información disponible es escasa y debe tratarse con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/orbanjan/aloha_sim_insertion_humanpolicy1
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/aloha_sim_insertion_human
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lerobot/aloha_sim_insertion_human

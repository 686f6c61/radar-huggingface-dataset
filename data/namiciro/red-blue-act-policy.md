# namiciro/red-blue-act-policy

## Resumen

`namiciro/red-blue-act-policy` es una política de imitación para robótica basada en Action Chunking with Transformers (ACT), el método presentado en el paper arXiv:2304.13705. La desarrolla el usuario namiciro y está entrenada con LeRobot 0.7.1 sobre un conjunto de datos propio de teleoperación. No es un modelo de lenguaje: es un controlador visomotor que recibe el estado articular de un robot `so_follower` y una imagen de cámara frontal, y emite directamente comandos de acción de 6 dimensiones.

El modelo resuelve una tarea concreta de manipulación de bloques: colocar un bloque rojo en la caja derecha y un bloque azul en la caja izquierda. Con 51.668.614 parámetros y un repositorio de 0,2 GB, es un modelo compacto pensado para ejecutarse en el ordenador que controla el robot, no en infraestructura de servidor. Su relevancia es la de un artefacto reproducible de aprendizaje por imitación: el dataset, la configuración de entrenamiento y los comandos de despliegue están publicados, lo que permite replicar el pipeline completo.

La información disponible es limitada: no hay licencia declarada, no hay resultados de evaluación en robot real y no hay benchmarks publicados. Cualquier uso en producción debería tratarse como experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación visomotora |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; consume observaciones por paso, no secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje; la tarea se especifica con una cadena de texto fija) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repositorio LeRobot) |
| Tipo de robot | `so_follower` |
| Camaras | `front` |
| Entrada `observation.state` | STATE, shape `(6,)` |
| Entrada `observation.images.front` | VISUAL, shape `(3, 480, 640)` |
| Salida `action` | ACTION, shape `(6,)` |
| Dataset de entrenamiento | `namiciro/red-to-right-v2` (14 episodios, 6733 frames, 30 FPS) |
| Pasos de entrenamiento | 10000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 1e-05 |
| Semilla | 1000 |
| Version de LeRobot | 0.7.1 |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos de acción (*action chunks*) en lugar de pasos individuales. La política combina un codificador visual y un codificador del estado proprioceptivo con un transformer que genera una secuencia de acciones futuras, lo que reduce el error de acumulación típico de las políticas paso a paso y suaviza la ejecución. El modelo consume `observation.state` de 6 dimensiones y una imagen RGB de 480x640, y produce vectores de acción de 6 dimensiones.

El entrenamiento se realizó con LeRobot 0.7.1 durante 10.000 pasos, con batch size 8, AdamW y learning rate 1e-05, semilla 1000. El dataset `namiciro/red-to-right-v2` contiene 14 episodios y 6.733 frames grabados a 30 FPS mediante teleoperación, con dos tareas: "Put the red block in the right box" y "Put the blue block in the left box". No se documenta el uso de RLHF, DPO ni ningún refinamiento posterior al ajuste supervisado por imitación, ni se detallan innovaciones adicionales más allá del propio esquema de chunking del paper de ACT.

## Capacidades

- Control visomotor para manipulación de bloques en un robot `so_follower` con una cámara frontal.
- Predicción de chunks de acción de 6 dimensiones a partir de estado articular e imagen.
- Ejecución de dos tareas de instrucción fija: bloque rojo a caja derecha y bloque azul a caja izquierda.
- Aprendizaje por imitación a partir de demostraciones teleoperadas.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües.
- No dispone de modo thinking, visión general, audio ni generación de texto.

## Casos de uso

- Replicación de experimentos de imitación: sirve como referencia reproducible para validar un pipeline ACT completo con LeRobot, ya que el dataset, la configuración y los comandos están publicados.
- Clasificación de bloques por color en entornos controlados: el modelo aprende a distinguir el bloque rojo del azul y a dirigirlo a la caja correspondiente, útil como banco de pruebas de percepción y control.
- Base para *fine-tuning* en tareas de pick-and-place: al ser un checkpoint ACT de 51,7 M de parámetros, se puede reentrenar con un dataset propio de pocos episodios para nuevas consignas.
- Docencia y formación en robótica de imitación: permite mostrar el ciclo completo de grabación, entrenamiento y despliegue en hardware de bajo coste tipo SO-100/SO-101.
- Evaluación de robustez de políticas visomotoras: útil para medir cómo afectan cambios de iluminación, posición de objetos o distractores a una política entrenada con 14 episodios.
- Prototipado de automatización de laboratorio: como paso previo a políticas más generales, sirve para validar la integración de cámaras, calibración y puertos serie antes de escalar el dataset.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real (*No evaluation results have been provided for this policy yet*), por lo que no existe tasa de éxito documentada para ninguna de las dos tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,7 M de parámetros, el peso en FP32 ronda los 207 MB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: no se especifican; LeRobot permite `--policy.device=cuda`, y por tamaño cabría en RTX 3060, RTX 4060, RTX 4090, A100 o H100.
- Cabe en GPU consumer: sí, por el reducido número de parámetros.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), con soporte de CUDA o CPU; no se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput estimados: no disponibles. El control se ejecuta a 30 FPS según la tasa del dataset, pero no se publica latencia medida.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / observacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `namiciro/red-blue-act-policy` | 51.668.614 | ACT (LeRobot) | Estado `(6,)` + imagen 480x640 | no disponible | Hugging Face |
| `namiciro/red-to-right-act-policy` | no disponible | ACT (LeRobot) | Estado + imagen, tarea única | no disponible | Hugging Face |
| Políticas ACT de referencia en LeRobot | variable | ACT | Estado + imagen | según repositorio | Hugging Face / LeRobot |
| Políticas Diffusion Policy en LeRobot | variable | Diffusion Policy | Estado + imagen | según repositorio | Hugging Face / LeRobot |

La comparación cuantitativa con alternativas no está disponible: no se publican tasas de éxito ni métricas de rendimiento para este checkpoint ni para las políticas comparables en la información consultada.

## Limitaciones y advertencias

- Sin licencia declarada: no se puede asumir permiso de uso comercial ni de redistribución.
- Sin evaluación en robot real: no hay tasa de éxito medida, por lo que el rendimiento real es desconocido.
- Dataset muy reducido: 14 episodios y 6.733 frames, lo que limita la generalización a posiciones, iluminación y objetos distintos de los grabados.
- Tareas restringidas: solo se entrenó para dos consignas concretas con bloques rojo y azul y cajas izquierda/derecha.
- Dependencia de hardware específico: requiere un robot `so_follower`, una cámara llamada `front` y calibración correcta; los nombres de cámara deben coincidir con las claves de observación.
- Riesgo de sobreajuste al entorno de grabación y de fallo ante distractores o cambios de fondo.
- No procesa lenguaje natural: la instrucción de tarea es una cadena fija usada por el runner, no una entrada del modelo.
- Sin datos sobre sesgos, robustez o comportamiento ante fallos; en producción debe operar con supervisión y parada de emergencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/namiciro/red-blue-act-policy
- Dataset de entrenamiento: https://huggingface.co/datasets/namiciro/red-to-right-v2
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=namiciro/red-to-right-v2
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Política relacionada: https://huggingface.co/namiciro/red-to-right-act-policy

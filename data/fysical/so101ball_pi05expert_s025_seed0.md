# fysical/so101ball_pi05expert_S025_seed0

## Resumen

El modelo `fysical/so101ball_pi05expert_S025_seed0` es una política robótica de tipo Vision-Language-Action (VLA) publicada por el usuario `fysical` sobre la librería LeRobot de Hugging Face. Se trata de un fine-tuning del modelo base `lerobot/pi05_base`, que a su vez es la implementación en LeRobot del modelo π₀.₅ (Pi05) de Physical Intelligence, adaptado desde su repositorio OpenPI. El problema que resuelve es concreto: controlar un brazo robótico `so_follower` (familia SO-101) para ejecutar una tarea de manipulación guiada por lenguaje natural.

La tarea entrenada es "Pick up the green ball and place it in the basket, ignoring the two red distractor balls", es decir, recoger una pelota verde y depositarla en una cesta ignorando dos pelotas rojas como distractores. El modelo recibe tres cámaras RGB (224×224) y un vector de estado de 32 dimensiones, y emite un vector de acción de 6 dimensiones por paso de control. Con 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y un repositorio de 20 GB, es un modelo de tamaño medio que requiere GPU para inferencia.

Es relevante porque ejemplifica el flujo actual de investigación en robótica de imitación: partir de un VLA preentrenado de propósito general y especializarlo con un dataset propio pequeño (225 episodios, 116.164 fotogramas a 30 FPS) mediante aprendizaje por imitación. La licencia Apache 2.0 facilita su reutilización, aunque las capacidades quedan limitadas a la tarea y al montaje hardware para el que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (Pi05, basada en π₀.₅ de Physical Intelligence; implementación LeRobot/OpenPI) |
| Parametros totales | 4.143.404.816 (≈4,14 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la instrucción de tarea está en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tipo de robot | `so_follower` (SO-101) |
| Camaras | `front`, `wrist` |
| Entradas | `observation.images.base_0_rgb` (3,224,224), `observation.images.left_wrist_0_rgb` (3,224,224), `observation.images.right_wrist_0_rgb` (3,224,224), `observation.state` (32,) |
| Salidas | `action` (6,) |
| Modelo base | lerobot/pi05_base |
| Dataset de entrenamiento | fysical/greenball_pool_225_v1 |
| Tamano del repositorio | 20,0 GB |
| Libreria | lerobot |

## Arquitectura y entrenamiento

La arquitectura subyacente es Pi05 (π₀.₅), un modelo Vision-Language-Action de Physical Intelligence que combina un codificador visual y un modelo de lenguaje con un "expert" de acciones para producir comandos motores continuos a partir de observaciones multimodales. La información proporcionada no detalla la composición interna exacta (número de capas, tipo de atención, tamaño del encoder visual), por lo que los detalles finos quedan como no disponibles. El modelo recibe tres vistas RGB de 224×224 píxeles y un vector de estado proprioceptivo de 32 dimensiones, y genera acciones de 6 grados de libertad.

El entrenamiento es un fine-tuning por imitación sobre `lerobot/pi05_base`. Se usaron 6000 pasos, batch size 32, optimizador AdamW con learning rate 2,5e-05, semilla 0, sobre el dataset `fysical/greenball_pool_225_v1`, que contiene 225 episodios y 116.164 fotogramas grabados a 30 FPS. La versión de LeRobot empleada fue la 0.6.2. No se especifica en la información disponible si hubo fases de RLHF, DPO u otras técnicas de ajuste por preferencias, ni la composición completa del dataset de preentrenamiento de π₀.₅.

## Capacidades

- Generación de acciones motoras de 6 grados de libertad para el brazo `so_follower` a partir de observaciones visuales y de estado.
- Percepción multimodal mediante tres cámaras: una frontal (`front`) y dos de muñeca (`wrist`).
- Ejecución de una tarea de manipulación guiada por instrucción textual: recoger la pelota verde e introducirla en la cesta ignorando las pelotas rojas.
- Discriminación de objetos distractores (las dos pelotas rojas) según el enunciado de la tarea.
- Control en bucle cerrado de política visual-motora (visuomotor policy) condicionada por lenguaje.
- Compatibilidad con el flujo de LeRobot para despliegue vía `lerobot-rollout` y para reentrenamiento vía `lerobot-train`.
- No se documentan capacidades de tool calling, agentes multi-paso, matemáticas, código general, visión para descripción de imágenes ni audio; el modelo está especializado exclusivamente en control robótico de esta tarea.

## Casos de uso

- Manipulación robótica de laboratorio: reproducción automática de la tarea de recogida selectiva de objetos (pelota verde) en entornos controlados, útil como banco de pruebas para comparar políticas de imitación.
- Investigación en aprendizaje por imitación: punto de partida reproducible (semilla 0, hiperparámetros documentados) para estudiar el efecto del fine-tuning sobre un VLA preentrenado.
- Evaluación de generalización con distractores: el dataset incluye pelotas rojas como distractores, lo que permite medir la robustez del modelo ante objetos visualmente similares no objetivo.
- Automatización de pick-and-place de precisión en celdas de trabajo con brazo SO-101, integrable con el resto de la plataforma LeRobot.
- Generación de datos de referencia para políticas propias: sirve como baseline frente a la que comparar nuevos fine-tunings sobre el mismo dataset o sobre variantes del montaje.
- Docencia y prototipado en robótica: ejemplo completo de pipeline VLA (captura de datos, entrenamiento, despliegue) con comandos de LeRobot, adecuado para cursos y talleres prácticos.
- Reentrenamiento sobre hardware propio: al ser un fine-tuning de `lerobot/pi05_base`, se puede reutilizar como referencia para adaptar la política a otras configuraciones de cámara u otros brazos de la misma familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay tabla de ensayos, éxitos ni tasa de acierto para la tarea.

## Requisitos de hardware

- VRAM estimada para inferencia (sin cuantización, bf16/fp16): en torno a 8-9 GB solo para los pesos de los 4,14 mil millones de parámetros, más el coste de activaciones del encoder visual y del decodificador de acciones. Estas cifras son estimaciones orientativas, no datos publicados por el autor.
- VRAM en fp32: aproximadamente 16-17 GB para los pesos, lo que es coherente con el tamaño de repositorio de 20 GB (que probablemente incluye los pesos y checkpoints auxiliares).
- GPU recomendadas: tarjetas con al menos 12-16 GB de VRAM para inferencia cómoda (por ejemplo, RTX 4080/4090 en 16-24 GB, A100 40/80 GB, H100). El entrenamiento y el fine-tuning requieren más memoria por los estados del optimizador.
- Cabe en GPU de consumo: sí en tarjetas con 16 GB o más si se usa precisión mixta; el fine-tuning completo es más exigente y puede requerir 24 GB o más.
- Opciones de despliegue: el flujo oficial es LeRobot, con `lerobot-rollout` para ejecutar la política sobre el robot y `lerobot-train` para entrenar. No se mencionan en la información proporcionada integraciones con vLLM, TGI, llama.cpp ni Ollama (herramientas orientadas a modelos de lenguaje, no a políticas VLA de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| fysical/so101ball_pi05expert_S025_seed0 | ≈4,14 mil millones | VLA Pi05, fine-tuning | Apache 2.0 | Hugging Face, librería LeRobot | Especializado en la tarea de la pelota verde sobre `so_follower` |
| lerobot/pi05_base | no disponible | VLA Pi05, base preentrenado | no disponible en la información | Hugging Face, librería LeRobot | Modelo base del que deriva este fine-tuning; propósito general |
| π₀.₅ / Pi05 (Physical Intelligence) | no disponible | VLA | no disponible en la información | Blog y repositorio OpenPI de Physical Intelligence | Método original; sin pesos ni métricas detalladas aquí |

No se dispone de datos de rendimiento comparado entre estas opciones en la información proporcionada, por lo que la comparación se limita a parámetros, origen y licencia.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para la tarea "recoger la pelota verde y depositarla en la cesta ignorando las dos rojas" sobre el robot `so_follower`; fuera de ese enunciado y montaje su comportamiento no está garantizado.
- Sin resultados de evaluación: no hay evidencia publicada de tasa de éxito, por lo que se desconoce su fiabilidad real en producción.
- Dependencia de hardware y calibración: el despliegue exige que los nombres de cámara (`front`, `wrist`), sus índices y el vector de estado (32 dimensiones) coincidan con los del entrenamiento; cualquier variación puede degradar la conducta.
- Sensibilidad al entorno: cambios en iluminación, posición de objetos, colores o presencia de nuevos distractores pueden afectar al rendimiento, ya que no se documenta entrenamiento con aumento de datos ni variaciones.
- Riesgo de sobreajuste al dataset: con solo 225 episodios y 6000 pasos de entrenamiento sobre un modelo base grande, la generalización a nuevas disposiciones de objetos es incierta.
- Idiomas: no se documenta soporte multilingüe; la instrucción de tarea utilizada está en inglés.
- Sesgos: no se documentan sesgos específicos, pero el dataset puede reflejar condiciones de captura particulares (posición de cámara, color de objetos, fondo) que la política reproducirá.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base `lerobot/pi05_base` y el método π₀.₅ pueden tener condiciones propias que conviene revisar antes de un despliegue comercial.
- Sin información sobre cuantización: no se documentan versiones GGUF ni cuantizadas, lo que puede complicar el despliegue en hardware limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fysical/so101ball_pi05expert_S025_seed0
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/fysical/greenball_pool_225_v1
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=fysical/greenball_pool_225_v1
- Blog de π₀.₅ (Pi05) de Physical Intelligence: https://www.physicalintelligence.company/blog/pi05
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

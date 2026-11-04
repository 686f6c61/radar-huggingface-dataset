# RoboColosseum/droid-open-drawer-gr00t-n1.7

## Resumen

`RoboColosseum/droid-open-drawer-gr00t-n1.7` es una política robótica de imitación entrenada sobre la arquitectura GR00T N1.7 de NVIDIA, un modelo fundacional abierto y cross-embodiment para razonamiento y habilidades de robots humanoides. El modelo combina un backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL con un transformer de acciones basado en flow matching que predice acciones condicionadas por visión, lenguaje y propriocepción. Este checkpoint concreto ha sido especializado para una única tarea: abrir un cajón con un robot Franka.

El modelo se distribuye en formato LeRobot y contiene 3.144.016.000 parámetros en pesos safetensors, con un tamaño de repositorio de 12,6 GB. Consume dos cámaras (`left_image` y `wrist`) a resolución 360x640 y un vector de estado de 8 dimensiones junto con una posición cartesiana de 6 dimensiones, produciendo un vector de acción de 8 dimensiones. Está pensado para ejecutarse sobre hardware Franka mediante el comando `lerobot-rollout`.

Su relevancia es doble: por un lado, demuestra el flujo completo de LeRobot para adaptar un modelo fundacional GR00T a una tarea concreta mediante fine-tuning con 100 episodios y 38.884 frames; por otro, sirve como referencia práctica de cómo un modelo grande de robótica (3,1B parámetros) puede desplegarse en un robot físico para una tarea de manipulación específica. La licencia Apache 2.0 facilita su reutilización comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7: backbone visión-lenguaje Cosmos-Reason2/Qwen3-VL + transformer de acciones con flow matching |
| Parametros totales | 3.144.016.000 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

GR00T N1.7 es un modelo fundacional cross-embodiment para robótica humanoides que acopla un backbone visión-lenguaje (Cosmos-Reason2/Qwen3-VL) con un transformer de acciones entrenado mediante flow matching. La predicción de acciones se condiciona conjuntamente a observaciones visuales (dos cámaras: `left_image` y `wrist`, a 360x640), a la instrucción en lenguaje natural y a la propriocepción del robot (estado de 8 dimensiones y posición cartesiana de 6 dimensiones). La salida es un vector de acción de 8 dimensiones.

El checkpoint ha sido afinado con LeRobot 0.6.1 sobre el dataset `local/droid-open-drawer-left-wrist`, compuesto por 100 episodios y 38.884 frames a 30 FPS, todos correspondientes a la tarea "open drawer". La configuración de entrenamiento reportada es: 12.160 pasos, batch size 32, optimizador AdamW, learning rate 1e-4 y semilla 1000. No se especifica en la información disponible el número de tokens de entrenamiento del modelo base ni la composición completa del dataset fundacional, ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generación de acciones robóticas de manipulación condicionadas por visión, lenguaje y propriocepción.
- Control de un robot Franka para la tarea específica de abrir un cajón ("open drawer").
- Fusión multimodal de dos cámaras (vista general y vista de muñeca) con estado del robot y posición cartesiana.
- Ejecución de políticas de imitación entrenadas con LeRobot mediante `lerobot-rollout`.
- Soporte de entrenamiento y reentrenamiento con `lerobot-train` usando el tipo de política `groot`.
- Capacidad de razonamiento visión-lenguaje heredada del backbone Qwen3-VL (no verificada específicamente para esta tarea en la información disponible).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio adicional: no disponible.

## Casos de uso

- Automatización de apertura de cajones en entornos de laboratorio: el modelo ejecuta la política `open drawer` sobre un Franka con dos cámaras, permitiendo validar pipelines de imitación de extremo a extremo con LeRobot.
- Base para fine-tuning en tareas de manipulación similares: al estar construido sobre GR00T N1.7, puede reentrenarse con `lerobot-train --policy.type=groot` sobre nuevos datasets para tareas como abrir puertas, coger objetos o pulsar botones.
- Evaluación de modelos fundacionales de robótica: sirve como referencia para medir la adaptabilidad de GR00T N1.7 a tareas concretas con pocos datos (100 episodios).
- Integración en pipelines de investigación en imitación: permite reproducir el flujo completo (grabación de datos, entrenamiento, rollout) documentado en las guías de LeRobot.
- Despliegue en robots Franka de laboratorio: el comando `lerobot-rollout` con `--strategy.type=base` permite ejecutar la política de forma continua sin grabar episodios, útil para pruebas de robustez.
- Docencia y formación en robótica de aprendizaje: ejemplo realista de cómo un modelo de 3,1B parámetros se especializa en una tarea física concreta con un dataset pequeño y una licencia permisiva.
- Prototipado de asistentes domésticos: la tarea de abrir cajones es un componente básico en escenarios de manipulación doméstica, y este checkpoint puede servir como bloque inicial en sistemas mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 3.144.016.000 parámetros en safetensors (12,6 GB de repo), una inferencia en FP16 requeriría aproximadamente 6,3 GB solo para pesos, más overhead de activaciones y del backbone visión-lenguaje.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, se espera que quepa en GPUs con al menos 16-24 GB de VRAM (RTX 4090, A100, H100), aunque no se confirma.
- ¿Cabe en consumer GPU? Probablemente en GPUs de gama alta con 24 GB o más (RTX 3090/4090), aunque no está confirmado en la documentación.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia, `lerobot-train` para entrenamiento). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RoboColosseum/droid-open-drawer-gr00t-n1.7 | 3.144.016.000 | no disponible | Abrir cajón (Franka) | Apache 2.0 | HuggingFace |
| tsangb34/groot-n17-droid-open-drawer-10ep | no disponible | no disponible | Abrir cajón (Franka) | no disponible | HuggingFace (referenciado en la model card) |
| GR00T N1.7 base (NVIDIA) | no disponible | no disponible | Modelo fundacional humanoide | no disponible | GitHub NVIDIA/Isaac-GR00T |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada únicamente para la tarea "open drawer" sobre un robot Franka; no se espera que generalice a otras tareas sin reentrenamiento.
- Sin resultados de evaluación: la model card no reporta tasas de éxito ni número de ensayos, por lo que no se puede cuantificar su fiabilidad real.
- Dataset pequeño: 100 episodios y 38.884 frames a 30 FPS implican una cobertura limitada de posiciones, iluminación y distractores; el rendimiento puede degradarse fuera de las condiciones de entrenamiento.
- Dependencia de hardware específico: asume un robot Franka, dos cámaras con nombres `left_image` y `wrist`, y una configuración de observación concreta (estado de 8 dimensiones y posición cartesiana de 6 dimensiones).
- Riesgo de sobreajuste al entorno del dataset: no se documentan variaciones de posiciones de objetos, iluminación ni distracciones.
- Idiomas: no se especifica el idioma de las instrucciones de lenguaje natural soportadas.
- Licencia Apache 2.0: permisiva para uso comercial, pero conviene revisar las licencias de los componentes base (GR00T N1.7, Cosmos-Reason2, Qwen3-VL) antes de un despliegue en producción.
- Sin información sobre cuantización ni despliegue en GPUs de consumo: la viabilidad en hardware asequible no está confirmada.
- Riesgo de alucinación en el backbone visión-lenguaje: al integrar un modelo VLM, pueden aparecer interpretaciones erróneas de la escena que afecten a la predicción de acciones.

## Enlaces

- HuggingFace: https://huggingface.co/RoboColosseum/droid-open-drawer-gr00t-n1.7
- Dataset de entrenamiento: https://huggingface.co/datasets/local/droid-open-drawer-left-wrist
- Repositorio GR00T N1.7 (NVIDIA): https://github.com/NVIDIA/Isaac-GR00T
- Guía LeRobot GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=local/droid-open-drawer-left-wrist
- Checkpoint relacionado referenciado: https://huggingface.co/tsangb34/groot-n17-droid-open-drawer-10ep

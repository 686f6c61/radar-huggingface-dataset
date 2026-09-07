# kiliato/lso_back_combined_slim_abs_cropped_GR00T17_rel

## Resumen

El modelo `kiliato/lso_back_combined_slim_abs_cropped_GR00T17_rel` es un policy de robótica basado en GR00T N1.7 de NVIDIA, desarrollado por el usuario `kiliato` y entrenado con la librería LeRobot. Está diseñado para controlar un robot en la tarea de encender un interruptor de luz, a partir de una imagen de cámara derecha (720x720) y un estado de 7 dimensiones, generando una acción de 7 dimensiones. La arquitectura combina un backbone Cosmos-Reason2/Qwen3-VL con un flow-matching action transformer, lo que permite predecir acciones condicionadas a visión, lenguaje y propiocepción. El modelo tiene 3.144.016.000 parámetros y se distribuye bajo licencia Apache 2.0. Su relevancia radica en ser un ejemplo práctico de un modelo de imitación cross-embodiment de código abierto, integrado en el ecosistema LeRobot, que permite reproducir y extender el entrenamiento de políticas para robótica. No se especifica la longitud de contexto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con backbone Cosmos-Reason2/Qwen3-VL y flow-matching action transformer |
| Parámetros totales | 3.144.016.000 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un policy de aprendizaje por imitación basado en GR00T N1.7 de NVIDIA. La arquitectura combina un backbone de visión-lenguaje Cosmos-Reason2/Qwen3-VL, que procesa la imagen de la cámara derecha (720x720) y la instrucción de lenguaje, con un flow-matching action transformer que genera acciones de 7 dimensiones condicionadas a la visión, el lenguaje y la propiocepción (estado de 7 dimensiones). Esta combinación permite que el modelo aprenda habilidades de manipulación a partir de demostraciones humanas.

El entrenamiento se realizó con la librería LeRobot (versión 0.6.2) sobre el dataset `kiliato/lso_back_combined_slim_abs_cropped`, compuesto por 70 episodios y 61.164 frames a 50 FPS, todos correspondientes a la tarea "Turn on the lightswitch". La configuración de entrenamiento incluye 20.000 pasos, batch size 32, optimizador AdamW con learning rate 0.0001 y seed 42. No se ha aplicado RLHF ni DPO; el modelo se entrenó mediante imitación supervisada. La innovación técnica destacable es el uso de flow-matching para la predicción de acciones, que permite generar trayectorias suaves y continuas.

## Capacidades

- Predicción de acciones de 7 dimensiones a partir de una imagen de cámara derecha (720x720) y un estado de 7 dimensiones.
- Control de robots humanoides o brazos robóticos para tareas de manipulación, gracias a la arquitectura cross-embodiment de GR00T N1.7.
- Integración nativa con LeRobot para entrenamiento, evaluación y despliegue mediante el comando `lerobot-rollout`.
- El backbone Qwen3-VL permite condicionar por lenguaje, aunque el dataset solo contiene una tarea ("Turn on the lightswitch").
- No soporta generación de texto, tool calling ni razonamiento simbólico; es un policy de control motor.
- Entrenado específicamente para encender un interruptor de luz, con una sola cámara (derecha).

## Casos de uso

- Automatización de tareas domésticas: el modelo puede controlar un robot para encender interruptores de luz. Es adecuado porque fue entrenado con 61.164 frames de esa tarea específica, lo que le permite aprender la secuencia de acciones necesaria a partir de la imagen y el estado del robot.
- Investigación en aprendizaje por imitación: al estar integrado con LeRobot, los investigadores pueden reproducir el pipeline de entrenamiento (20.000 pasos, batch 32, AdamW) y modificar el dataset para probar nuevas tareas. Es adecuado porque permite comparar políticas de forma estandarizada y reutilizable.
- Desarrollo de robots humanoides: GR00T N1.7 es un modelo cross-embodiment de NVIDIA, por lo que esta política puede servir como punto de partida para transferir habilidades a diferentes plataformas robóticas. Es adecuado porque la arquitectura está diseñada para generalizar a distintos cuerpos.
- Evaluación de políticas en simulación: se puede cargar el modelo en Isaac Sim o en un entorno de simulación compatible con LeRobot para validar su comportamiento antes de desplegarlo en hardware real. Es adecuado porque reduce el riesgo de dañar el robot durante las pruebas.
- Benchmark de políticas de control: al ser un modelo de código abierto con licencia Apache 2.0 y parámetros conocidos (3.144 millones), sirve como referencia para comparar con otros policies en tareas de manipulación. Es adecuado porque permite reproducir los resultados en diferentes entornos y hardware.
- Teleoperación y asistencia robótica: el modelo puede utilizarse en sistemas de teleoperación donde el robot debe ejecutar una acción concreta a partir de la observación visual. Es adecuado porque su salida de acción de 7 dimensiones es compatible con controladores de robots estándar y puede integrarse en bucles de control en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio contiene 12.6 GB de pesos en formato safetensors, lo que es consistente con pesos en FP32 (3.144.016.000 parámetros × 4 bytes = 12.576 GB). Se necesita al menos esa VRAM para cargar el modelo completo en FP32. No se dispone de información sobre cuantizaciones.
- GPU recomendadas: no se especifica. Para FP32, una GPU con 16 GB o más (RTX 4080, A100 40GB, H100) sería adecuada. Para FP16/BF16, el modelo podría caber en 8 GB, pero no hay datos oficiales que lo confirmen.
- ¿Cabe en GPU de consumo? Probablemente sí en GPUs con 12 GB o más si se usa FP16, pero no está confirmado.
- Opciones de despliegue: LeRobot (comando `lerobot-rollout`), posiblemente con NVIDIA Isaac Lab o entornos compatibles.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables en la información disponible.

## Limitaciones y advertencias

- El modelo fue entrenado exclusivamente para la tarea "Turn on the lightswitch", por lo que su capacidad de generalización a otras tareas es limitada.
- El dataset de entrenamiento es pequeño (70 episodios, 61.164 frames), lo que puede provocar sobreajuste al entorno y la iluminación específicos de la grabación.
- Solo utiliza la cámara derecha; no tiene entrada de cámara izquierda ni otros sensores, lo que limita su percepción del entorno.
- No se han proporcionado resultados de evaluación, por lo que el rendimiento en el mundo real no está validado.
- Al ser un modelo de imitación, puede predecir acciones incorrectas si la entrada difiere de las condiciones de entrenamiento (por ejemplo, cambios en la posición del interruptor o en la iluminación).
- La licencia Apache 2.0 permite uso comercial, pero es necesario cumplir con los términos de la licencia y citar el modelo y LeRobot.
- No se dispone de información sobre sesgos, pero al estar entrenado en un dataset de un solo operador y entorno, puede heredar sesgos de ese contexto.

## Enlaces

- HuggingFace: https://huggingface.co/kiliato/lso_back_combined_slim_abs_cropped_GR00T17_rel
- Dataset: https://huggingface.co/datasets/kiliato/lso_back_combined_slim_abs_cropped
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=kiliato/lso_back_combined_slim_abs_cropped
- Documentación LeRobot GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Repositorio LeRobot: https://github.com/huggingface/lerobot

# sadafnezam/aloha_mobile_cabinetpolicy0

## Resumen

`sadafnezam/aloha_mobile_cabinetpolicy0` es una política de imitación para robótica real entrenada con el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. El modelo ha sido desarrollado por el usuario sadafnezam y distribuido a través del Hub de Hugging Face usando la librería LeRobot, el framework de Hugging Face para aprendizaje automático en robótica del mundo real. No es un modelo de lenguaje: es un controlador visomotor que consume imágenes de tres cámaras y el estado del robot, y emite comandos de acción de 14 dimensiones.

La política está especializada en una única tarea de manipulación móvil sobre el robot ALOHA: abrir el armario superior, guardar una olla dentro y cerrar el armario. Se entrenó sobre el dataset `lerobot/aloha_mobile_cabinet`, con 85 episodios, 127.500 fotogramas a 50 FPS y tan solo 1.000 pasos de entrenamiento con batch de 8. El repositorio ocupa 0,2 GB y contiene 51.685.006 parámetros en formato safetensors.

Su relevancia es acotada pero representativa: ilustra el flujo completo de LeRobot para entrenar y desplegar políticas ACT sobre hardware ALOHA, y sirve como referencia práctica de cómo se estructuran las observaciones (tres vistas de cámara más estado y esfuerzo de 14 dimensiones) y las acciones en un pipeline de imitación. No debe confundirse con un modelo fundacional de robótica: es un artefacto de un solo task y un solo embodiment.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.685.006 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de imitación por chunk de acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (la model card indica "[More Information Needed]") |
| Formato de pesos | safetensors |
| Libreria | lerobot (version 0.7.1) |
| Tipo de robot | aloha |
| Camaras de entrada | cam_high, cam_left_wrist, cam_right_wrist |
| Entrada de estado | observation.state (14,), observation.effort (14,) |
| Salida | action (14,) |
| Tamano del repositorio | 0.2 GB |
| Dataset de entrenamiento | lerobot/aloha_mobile_cabinet (85 episodios, 127.500 fotogramas, 50 FPS) |
| Pasos de entrenamiento | 1000 |
| Batch size | 8 |
| Optimizador | adamw |
| Learning rate | 1e-05 |
| Semilla | 1000 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice fragmentos cortos de acciones (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación típico de las políticas paso a paso y suele elevar la tasa de éxito en tareas de manipulación. La arquitectura combina un codificador de imágenes (tres cámaras: vista superior y muñecas izquierda y derecha, cada una a 480x640 con 3 canales) con un transformer que fusiona las representaciones visuales con el estado propioceptivo del robot (posición y esfuerzo, 14 dimensiones cada uno) y genera una secuencia de acciones de 14 dimensiones.

El entrenamiento se realizó sobre teleoperación real del robot ALOHA para una única tarea: "Open the top cabinet, store the pot inside it then close the cabinet". El dataset consta de 85 episodios y 127.500 fotogramas a 50 FPS. La configuración es muy ligera: 1.000 pasos, batch de 8, AdamW con learning rate 1e-05 y semilla 1000, sobre LeRobot 0.7.1. No se documenta el uso de RLHF, DPO ni ningún refinamiento posterior al aprendizaje supervisado por imitación, ni se detallan innovaciones adicionales más allá del propio mecanismo de action chunking descrito en el paper.

## Capacidades

- Control visomotor de manipulación robótica: genera comandos de acción de 14 dimensiones a partir de tres vistas de cámara y del estado del robot.
- Ejecución de una tarea concreta de manipulación móvil: abrir el armario superior, guardar la olla y cerrar el armario.
- Aprendizaje por imitación a partir de datos de teleoperación (no requiere definición manual de recompensas).
- Predicción de chunks de acciones, lo que aporta cierta suavidad y consistencia temporal en la ejecución.
- Integración con el ecosistema LeRobot: rollout con `lerobot-rollout`, entrenamiento con `lerobot-train` y visualización del dataset asociado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües ni modos de "thinking"; no es un modelo de lenguaje ni multimodal general.

## Casos de uso

- Reproducción de la tarea de referencia en un ALOHA real: ejecutar la política con `lerobot-rollout` sobre el robot ALOHA para abrir el armario, guardar la olla y cerrarlo, usando las tres cámaras y el estado de 14 dimensiones como entradas.
- Base para fine-tuning en tareas similares de manipulación móvil: partir de esta política y reentrenar con `lerobot-train` sobre un dataset propio de apertura y cierre de armarios o almacenamiento de objetos.
- Validación de un pipeline completo de LeRobot: usar el repositorio como caso de prueba para verificar la instalación, la calibración de cámaras y el flujo de rollout antes de abordar tareas más complejas.
- Docencia y demostración de aprendizaje por imitación: ilustrar cómo ACT convierte teleoperación en una política desplegable, con un dataset pequeño (85 episodios) y un entrenamiento corto (1.000 pasos).
- Benchmark interno de infraestructura robótica: comparar latencias y tasas de éxito de distintos equipos y configuraciones de cámara sobre una tarea fija y reproducible.
- Punto de partida para experimentos de generalización: evaluar cómo se degrada la política ante cambios de iluminación, posiciones de objetos o un robot ALOHA distinto, dado que la model card no reporta resultados de evaluación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación con la plantilla vacía y la nota "No evaluation results have been provided for this policy yet", por lo que no hay tasas de éxito, número de ensayos ni condiciones de prueba documentadas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; con 51,7 millones de parámetros y pesos safetensors, la huella es reducida, pero no se documenta una cifra oficial.
- GPU recomendadas: no disponible; la guía de LeRobot sugiere `--policy.device=cuda` para entrenamiento, sin especificar modelos de GPU.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; por el tamaño del modelo es plausible en GPUs consumer, pero no hay dato oficial.
- Opciones de despliegue: LeRobot (`lerobot-rollout` para inferencia en robot, `lerobot-train` para reentrenamiento). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles. El dataset se grabó a 50 FPS y los ejemplos de cámara usan 30 FPS, pero no se reporta la frecuencia de inferencia efectiva de la política.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Tarea | Dataset | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sadafnezam/aloha_mobile_cabinetpolicy0 | 51.685.006 | ACT | Tarea única ALOHA (armario + olla) | lerobot/aloha_mobile_cabinet (85 episodios) | no disponible | Hugging Face Hub |
| Políticas ACT de referencia en LeRobot | no disponible | ACT | Múltiples tareas de manipulación | distintos datasets LeRobot | normalmente Apache-2.0 en el framework | Hugging Face Hub |
| Políticas Diffusion Policy en LeRobot | no disponible | Diffusion Policy | Manipulación visomotora | distintos datasets LeRobot | según repositorio | Hugging Face Hub |
| Políticas π0 / OpenVLA (modelos fundacionales de robótica) | del orden de miles de millones (no confirmado en esta ficha) | VLA | Múltiples tareas y embodiments | datasets a gran escala | según repositorio | Hugging Face Hub |

La comparación cuantitativa de rendimiento no está disponible: este repositorio no publica tasas de éxito ni métricas, y las alternativas citadas corresponden a categorías distintas (políticas específicas frente a modelos fundacionales viso-lenguaje-acción). Cualquier comparación numérica requeriría evaluaciones propias sobre el mismo robot y tarea.

## Limitaciones y advertencias

- Especialización extrema: la política está entrenada para una única tarea y un único embodiment (ALOHA); no generaliza a otras tareas, objetos o robots sin reentrenamiento.
- Sin evaluación publicada: no hay tasas de éxito ni condiciones de prueba, por lo que se desconoce su fiabilidad real en producción.
- Entrenamiento muy corto: 1.000 pasos con batch de 8 y learning rate 1e-05 sobre 85 episodios; es probable que el ajuste sea limitado y sensible a variaciones de iluminación, posiciones y distractores.
- Licencia no especificada: la model card indica "[More Information Needed]", lo que impide confirmar si el uso comercial está permitido; conviene contactar con el autor antes de cualquier despliegue productivo.
- Dependencia de hardware y calibración: requiere un robot ALOHA, tres cámaras con los nombres exactos `cam_high`, `cam_left_wrist` y `cam_right_wrist`, y un estado de 14 dimensiones más esfuerzo de 14 dimensiones; un montaje distinto invalida las entradas.
- Riesgo de sobreajuste al dataset de teleoperación: al no haber RLHF ni refinamiento, los sesgos y errores de las demostraciones humanas se heredan directamente.
- Sin capacidades de lenguaje, tool calling ni agentes: no es adecuado para tareas de NLP, razonamiento simbólico o conversación.
- Sin información sobre cuantización ni formatos alternativos de pesos: solo se distribuyen pesos safetensors para LeRobot.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sadafnezam/aloha_mobile_cabinetpolicy0
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/aloha_mobile_cabinet
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=lerobot/aloha_mobile_cabinet
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Chuleta de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference

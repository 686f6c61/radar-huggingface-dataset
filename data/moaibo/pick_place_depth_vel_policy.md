# MoAIBo/pick_place_depth_vel_policy

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, diseñado para controlar robots mediante instrucciones en lenguaje natural. Este repositorio contiene un fine-tuning del modelo base `lerobot/smolvla_base` realizado por el usuario MoAIBo, especializado en una tarea de manipulación concreta: recoger un objeto amarillo o azul de una caja marrón, colocarlo en un plato blanco y volver a la base de carga.

El modelo se distribuye a través del ecosistema LeRobot y está pensado para el robot SO-101, con una arquitectura que integra cuatro cámaras RGB y una cámara de profundidad como entradas visuales. Con 450 millones de parámetros, es un modelo ligero que puede ejecutarse en hardware de consumo, lo que lo hace relevante para la investigación en robótica de bajo coste y el aprendizaje por imitación en entornos domésticos o académicos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) sobre base `lerobot/smolvla_base` |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible (no aplica directamente; el modelo procesa imágenes y estado) |
| Tipos de cuantizacion | No disponible (se distribuye en precisión completa, safetensors) |
| Idiomas soportados | No disponible (modelo de robótica; no es un modelo de lenguaje general) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-language-action que combina un encoder de visión-lenguaje (basado en SmolVLM) con un head de acciones de 8 dimensiones. El modelo procesa simultáneamente cinco entradas visuales: tres cámaras RGB (izquierda, derecha y muñeca), una cámara D455 y un canal de profundidad, junto con un vector de estado de 8 dimensiones que codifica la configuración de las articulaciones del robot. La salida es un vector de acción de 8 dimensiones que se ejecuta en el robot.

El entrenamiento se realizó mediante aprendizaje por imitación (behavior cloning) sobre un dataset de 26 episodios con 34.129 fotogramas a 30 FPS, registrados con el robot SO-101. Se utilizaron 50.000 pasos de entrenamiento con un batch size de 13, optimizador AdamW, tasa de aprendizaje de 0.0001 y semilla 1000. El modelo se fine-tuning del checkpoint base `lerobot/smolvla_base` usando la librería LeRobot en su versión 0.6.0. No se aplicaron técnicas de RLHF ni DPO; el aprendizaje es puramente supervisado sobre las demostraciones.

## Capacidades

- Control de robot para tareas de pick-and-place (recoger y colocar objetos) con instrucciones en lenguaje natural.
- Procesamiento multi-cámara: integra cuatro cámaras RGB y un canal de profundidad para percibir la escena.
- Acciones de 8 dimensiones que incluyen posición, orientación y apertura de pinza.
- Ejecución de políticas en tiempo real mediante el framework LeRobot con el comando `lerobot-rollout`.
- Fine-tuning desde el modelo base `smolvla_base` para adaptarse a nuevas tareas o robots.
- Capacidad de razonamiento de visión-lenguaje para interpretar instrucciones como "recoge el objeto amarillo de la caja marrón".
- No incluye generación de texto ni capacidades de conversación; es un modelo de control motor puro.

## Casos de uso

- Automatización de tareas de recogida y colocación en almacenes: el modelo puede ejecutar tareas repetitivas de pick-and-place sobre objetos de colores específicos, lo que lo hace útil para prototipos de robótica logística.
- Investigación en aprendizaje por imitación: permite a investigadores replicar experimentos de control de robots de bajo coste (SO-101) con un modelo de 450M de parámetros, sin necesidad de hardware de gama alta.
- Demostraciones académicas en robótica: el modelo puede ejecutarse en un robot SO-101 con cámaras estándar, sirviendo como ejemplo práctico para cursos de robótica y sistemas autónomos.
- Prototipado de políticas de manipulación en laboratorios: permite probar rápidamente variantes de políticas VLA sobre un dataset pequeño (26 episodios) y evaluar su comportamiento en el robot real.
- Base para fine-tuning en tareas similares: el modelo puede ser reutilizado como punto de partida para entrenar políticas de pick-and-place con otros objetos o configuraciones de cámara, gracias a la arquitectura modular de LeRobot.
- Benchmarking de modelos VLA compactos: al ser un modelo de tamaño reducido, sirve para comparar el rendimiento de arquitecturas eficientes frente a modelos más grandes (OpenVLA, RT-2) en tareas de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." Por tanto, no hay datos sobre tasa de éxito en el robot real ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación, pero al tratarse de un modelo de 450M parámetros, se puede estimar que un modelo de este tamaño en precisión FP32 ocupa alrededor de 1,8 GB de pesos; con cuantización a FP16 o INT8 podría caber en GPUs de consumo con 4-6 GB de VRAM.
- GPU recomendadas: RTX 3060 (12 GB) o superior; también compatible con GPUs de portátiles (RTX 3050, 4060) y con la CPU mediante llama.cpp, aunque la inferencia sería más lenta.
- Cabe en GPU de consumo: sí, es el objetivo declarado del paper SmolVLA ("can be deployed on consumer-grade hardware").
- Opciones de despliegue: el modelo se ejecuta a través de LeRobot con el comando `lerobot-rollout` y se entrena con `lerobot-train`. No se mencionan integraciones con vLLM, TGI u Ollama, ya que es un modelo de control y no de generación de texto.
- Latencia y throughput: no disponible. La latencia dependerá del hardware, de la resolución de las cámaras (360x640) y del número de imágenes procesadas (5 por paso).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA (este modelo) | 450M | no disponible | 5 cámaras + estado | Apache-2.0 | HuggingFace |
| OpenVLA | 7B | 4096 tokens | 1 cámara + texto | MIT | HuggingFace |
| RT-2 (Google) | 55B | 2048 | 1 cámara | Propietaria | No público |
| Pi0 (Physical Intelligence) | 3B | 2048 | 1-3 cámaras | Apache-2.0 | HuggingFace |

SmolVLA se distingue por su tamaño reducido (450M frente a 7B de OpenVLA) y su capacidad para procesar múltiples cámaras simultáneamente, lo que lo hace más adecuado para robots con sensórica rica y recursos computacionales limitados. Sin embargo, su rendimiento en tareas complejas aún no está documentado en este repositorio.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: solo 26 episodios, lo que puede limitar la generalización a nuevas posiciones de objetos, iluminación o variaciones en el entorno.
- Sin resultados de evaluación: no hay datos de tasa de éxito en el robot real, por lo que se desconoce la fiabilidad del modelo en producción.
- Tareas específicas: el modelo solo está entrenado para dos tareas concretas (objeto amarillo o azul) y no generalizará a otras instrucciones sin fine-tuning adicional.
- Dependencia de las cámaras: requiere las 5 cámaras específicas (left, right, wrist, d455, depth) en las posiciones exactas; cambios en la configuración de sensores pueden degradar el rendimiento.
- Sin soporte de lenguaje libre: no puede responder a preguntas ni mantener conversaciones; es un modelo de acción, no de lenguaje.
- Fecha de creación futura: el repositorio indica una fecha de creación en 2026, lo que sugiere que el modelo puede ser experimental y no estar probado en entornos de producción.
- Licencia Apache-2.0 permite uso comercial, pero la responsabilidad del uso en robots reales recae en el usuario.

## Enlaces

- Repositorio del modelo: https://huggingface.co/MoAIBo/pick_place_depth_vel_policy
- Dataset de entrenamiento: https://huggingface.co/datasets/MoAIBo/pick_place_depth_vel
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation

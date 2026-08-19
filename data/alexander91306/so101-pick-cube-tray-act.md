# alexander91306/so101-pick-cube-tray-act

## Resumen

El modelo `alexander91306/so101-pick-cube-tray-act` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face. Está diseñada para que un brazo robótico SO-101 (tipo `so_follower`) ejecute la tarea de recoger un cubo y colocarlo en una bandeja, a partir de observaciones visuales y de estado. El modelo fue desarrollado por Edgar Gonzalez (usuario `alexander91306`) y publicado bajo licencia Apache 2.0.

ACT es una técnica de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en manipulación robótica. Este modelo concreto se entrenó con 40 episodios teleoperados (10.921 fotogramas a 15 FPS) y cuenta con 51,7 millones de parámetros, un tamaño reducido que permite su ejecución en hardware modesto. Su relevancia radica en ser un ejemplo práctico de despliegue de políticas de imitación en robots reales, con un flujo de trabajo reproducible mediante LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Adicionalmente, según la model card:

- Robot objetivo: `so_follower` (SO-101)
- Cámaras: `workspace` (imagen RGB de 288x352)
- Entrada de estado: vector de 6 dimensiones
- Salida de acción: vector de 6 dimensiones

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación que utiliza un transformer para predecir un chunk de acciones (una secuencia de pasos) a partir de observaciones actuales. En este caso, el modelo recibe una imagen de cámara (workspace) y el estado del robot (posición/velocidad de las articulaciones), y genera una secuencia de acciones de 6 dimensiones. La arquitectura combina un codificador visual (típicamente ResNet) con un transformer que autoregresivamente genera el chunk de acciones.

El entrenamiento se realizó con el dataset `Fabes07/pick-cube-tray-v9-home-consistency_20260812_144857`, que contiene 40 episodios teleoperados (10.921 fotogramas a 15 FPS) de la tarea "Pick up the cube and place it in the tray". La configuración de entrenamiento fue: 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, usando LeRobot versión 0.6.1. No se menciona el uso de RLHF ni DPO; es un entrenamiento puramente de imitación supervisada.

## Capacidades

- Control robótico de precisión: ejecuta la tarea de pick-and-place de un cubo en una bandeja con un brazo SO-101.
- Percepción visual: procesa imágenes RGB de una cámara workspace (288x352) para localizar el objeto y la bandeja.
- Generación de acciones en chunks: predice secuencias de acciones (6 dimensiones) en lugar de pasos individuales, lo que mejora la suavidad y robustez del movimiento.
- Aprendizaje por imitación: reproduce comportamientos teleoperados sin necesidad de ingeniería de recompensas.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de LeRobot (comandos `lerobot-rollout` y `lerobot-train`).
- No es un modelo de lenguaje ni multimodal: no soporta texto, tool calling ni razonamiento simbólico.

## Casos de uso

- Automatización de tareas repetitivas en laboratorio: el modelo puede encargarse de recoger y colocar objetos pequeños (cubos, viales) en posiciones fijas, liberando a operarios humanos de tareas monótonas.
- Prototipado rápido de políticas robóticas: gracias a su tamaño reducido y al flujo de LeRobot, sirve como punto de partida para validar el enfoque ACT en otros entornos o tareas.
- Investigación en aprendizaje por imitación: permite estudiar el efecto del número de episodios, la consistencia de las demostraciones y la arquitectura ACT en la tasa de éxito de manipulaciones.
- Benchmark de control robótico en entornos domésticos: el dataset incluye "home-consistency", lo que sugiere que las demostraciones se grabaron en un entorno real con variabilidad, útil para evaluar robustez.
- Educación y formación en robótica: al ser un modelo pequeño y con documentación completa, es adecuado para cursos que enseñen despliegue de políticas de imitación en hardware real.
- Base para fine-tuning en tareas similares: se puede reentrenar con nuevos datos para adaptarlo a otros objetos o configuraciones de bandeja, manteniendo la arquitectura y el pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." Por tanto, no hay datos de tasa de éxito en robot real ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente, pero con 51,7 millones de parámetros, la inferencia es ligera. En FP32, el modelo ocupa aproximadamente 207 MB (51,7M × 4 bytes), por lo que cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (p. ej., RTX 2060 o superior) es suficiente. También puede ejecutarse en CPU para pruebas lentas.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de gama baja (GTX 1060, RTX 3050, etc.) y en placas integradas con suficiente RAM.
- Opciones de despliegue: LeRobot proporciona el comando `lerobot-rollout` para ejecutar la política en el robot. También se puede cargar el modelo con PyTorch directamente desde safetensors.
- Latencia y throughput: no disponibles. Al ser un modelo pequeño, se espera una latencia de decenas de milisegundos en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo frente a alternativas. Sin embargo, se puede comparar estructuralmente con otros modelos ACT de la comunidad LeRobot:

| Modelo | Parámetros | Tarea | Dataset | Licencia |
|---|---|---|---|---|
| `alexander91306/so101-pick-cube-tray-act` | 51,7M | Pick-and-place de cubo en bandeja | 40 episodios, 10.921 frames | Apache 2.0 |
| `alexander91306/so101-pick-cube-act` (modelo hermano) | 51,7M (según búsqueda) | Pick de cubo (sin bandeja) | no disponible | Apache 2.0 |
| Otros modelos ACT en LeRobot Hub | variable | diversos | variable | Apache 2.0 (mayoría) |

No hay información pública sobre benchmarks comparativos entre estos modelos. La diferencia principal entre los dos modelos del mismo autor es la inclusión de la bandeja como objetivo en la tarea, lo que implica una variante en el dataset y posiblemente en la estrategia de agarre.

## Limitaciones y advertencias

- Sin evaluación en robot real: la model card no reporta tasas de éxito, por lo que no se puede garantizar su fiabilidad en producción.
- Dataset pequeño: 40 episodios pueden no cubrir toda la variabilidad del mundo real (iluminación, posiciones del cubo, etc.).
- Tarea específica: el modelo solo está entrenado para la tarea "Pick up the cube and place it in the tray"; no generaliza a otros objetos o configuraciones sin reentrenamiento.
- Dependencia de la cámara: la política requiere la cámara `workspace` con la misma posición y calibración que en el entrenamiento; cambios en la cámara degradarán el rendimiento.
- Riesgo de sobreajuste: al ser un modelo de imitación con pocos datos, puede memorizar las demostraciones y fallar ante variaciones no vistas.
- Sin soporte de lenguaje: no es un modelo multimodal ni de lenguaje, por lo que no puede interpretar instrucciones textuales.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar que el hardware y el dataset asociado no tengan restricciones adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alexander91306/so101-pick-cube-tray-act
- Dataset de entrenamiento: https://huggingface.co/datasets/Fabes07/pick-cube-tray-v9-home-consistency_20260812_144857
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Modelo hermano (pick-cube sin bandeja): https://huggingface.co/alexander91306/so101-pick-cube-act

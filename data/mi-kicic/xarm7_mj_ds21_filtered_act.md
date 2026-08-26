# mi-kicic/xarm7_mj_ds21_filtered_act

## Resumen

El modelo `mi-kicic/xarm7_mj_ds21_filtered_act` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), desarrollada por el usuario mi-kicic y publicada en Hugging Face bajo licencia Apache 2.0. Está diseñado para controlar un brazo robótico UFACTORY xArm7 simulado en MuJoCo, y su tarea específica consiste en recoger un motor azul e insertarlo en una caja de engranajes naranja. El modelo se ha entrenado con el framework LeRobot, que facilita el aprendizaje por imitación a partir de demostraciones teleoperadas.

ACT es una técnica de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que mejora la estabilidad y el éxito en tareas de manipulación. El modelo tiene aproximadamente 51,6 millones de parámetros y procesa observaciones multimodales: el estado del robot (15 dimensiones) y tres imágenes RGB de 512x512 píxeles procedentes de cámaras frontal, de muñeca y de esquina. La salida es un vector de acción de 8 dimensiones que se ejecuta en el robot.

Este modelo es relevante para la comunidad de robótica porque demuestra un flujo completo de entrenamiento y despliegue de políticas con LeRobot, y puede servir como punto de partida para investigaciones en manipulación de precisión, transferencia sim-to-real y desarrollo de tareas industriales de ensamblaje. Al estar publicado con licencia Apache 2.0, es reutilizable tanto en entornos académicos como comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) - transformer con codificador y decodificador |
| Parametros totales | 51.587.720 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de politica robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa el método ACT (Action Chunking with Transformers), presentado en el paper arXiv:2304.13705. ACT utiliza un transformer con codificador y decodificador: el codificador procesa las observaciones (estado del robot e imágenes) y el decodificador genera una secuencia de acciones futuras (chunk) de longitud fija. Esta predicción por chunks reduce el error de acumulación y mejora la precisión en tareas de manipulación frente a políticas que predicen un solo paso.

El entrenamiento se realizó con el framework LeRobot (versión 0.6.1) sobre el dataset `mi-kicic/xarm7_mj_ds21_filtered`, que contiene 406 episodios y 95.216 frames capturados a 10 FPS mediante teleoperación. La configuración de entrenamiento incluye 30.000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-5 y semilla 1000. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento; se trata de un entrenamiento puramente supervisado de imitación.

## Capacidades

- Control robótico de precisión: predice acciones de 8 dimensiones para el brazo xArm7, incluyendo posicion y orientacion del efector final.
- Percepcion visual multimodal: procesa simultaneamente tres camaras RGB (frontal, muneca y esquina) a resolucion 512x512, lo que permite manejar oclusiones y perspectivas complementarias.
- Aprendizaje por imitacion: reproduce comportamientos aprendidos de demostraciones teleoperadas, sin necesidad de ingenieria de recompensas.
- Ejecucion de tareas de ensamblaje: especializado en la tarea de recoger un motor azul e insertarlo en una caja de engranajes naranja.
- Integracion con LeRobot: compatible con el ecosistema de herramientas de LeRobot para entrenamiento, evaluacion y despliegue.
- No incluye capacidades de lenguaje, tool calling, agentes ni razonamiento simbolico; es exclusivamente una politica de control motor.

## Casos de uso

- Automatizacion de ensamblaje industrial: el modelo puede integrarse en lineas de produccion para tareas de insercion de piezas pequenas, como motores en cajas de engranajes, reduciendo la intervencion humana en operaciones repetitivas.
- Investigacion en aprendizaje por imitacion: sirve como banco de pruebas para estudiar el efecto del chunking de acciones, la fusion de multiples camaras y la transferencia de politicas entrenadas en simulacion a entornos reales.
- Desarrollo de robots colaborativos: puede desplegarse en entornos de fabricacion flexible donde se requiera que el robot aprenda nuevas tareas a partir de pocas demostraciones teleoperadas.
- Validacion de algoritmos de control en simulacion: al estar entrenado en MuJoCo, permite evaluar metricas de exito, robustez y generalizacion sin riesgo de danar hardware real.
- Educacion y formacion en robotica: es un ejemplo didactico de como entrenar una politica ACT con LeRobot, util para cursos de robotica y aprendizaje automatico.
- Prototipado rapido de tareas de manipulacion: investigadores pueden clonar el repositorio, modificar la tarea y reentrenar el modelo con nuevos datasets, acelerando el ciclo de desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion proporcionados para esta politica. No se dispone de tasas de exito, metricas de error ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero dado el tamano del modelo (51,6 M parametros) y la entrada de tres imagenes 512x512, se estima que cabe en GPUs con al menos 8 GB de VRAM (por ejemplo, RTX 3070 o superior).
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (RTX 20xx/30xx/40xx, A100, etc.). El entrenamiento se realizo con `--policy.device=cuda`, por lo que se asume uso de GPU.
- Compatibilidad con GPU de consumo: si, el modelo es lo suficientemente pequeno para ejecutarse en GPUs de gama media como RTX 3060 o RTX 4060.
- Opciones de despliegue: el modelo se ejecuta mediante el framework LeRobot, usando comandos como `lerobot-rollout` para inferencia en el robot simulado o real. No se mencionan formatos como GGUF, vLLM u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. La inferencia depende del hardware y de la resolucion de las camaras; en simulacion MuJoCo suele ser en tiempo real o superior.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa cuantitativa con otros modelos de politica robótica. Como referencia cualitativa, ACT se compara frecuentemente con Diffusion Policy en la literatura, pero no hay datos de este modelo concreto frente a otros. Se recomienda consultar el paper de ACT (arXiv:2304.13705) para comparaciones teoricas.

## Limitaciones y advertencias

- No hay resultados de evaluacion publicados: se desconoce la tasa de exito real en el robot fisico o en simulacion, por lo que no se puede garantizar su rendimiento en produccion.
- Especializacion limitada: el modelo esta entrenado para una unica tarea (recoger motor azul e insertarlo en caja naranja) y no generaliza a otras tareas sin reentrenamiento.
- Dependencia de la configuracion de camaras: las tres camaras (frontal, muneca, esquina) deben estar calibradas y posicionadas de forma consistente con el entrenamiento; cambios en la iluminacion o perspectiva pueden degradar el rendimiento.
- Entrenamiento en simulacion: el modelo se entrena en MuJoCo, por lo que puede existir una brecha sim-to-real si se intenta transferir a un robot fisico sin ajuste adicional.
- Sin capacidades de lenguaje ni interaccion multimodal: no puede interpretar instrucciones verbales ni generar explicaciones; es exclusivamente una politica de control.
- Licencia Apache 2.0: permite uso comercial, pero se debe mantener la atribucion y no se ofrece garantia alguna sobre el funcionamiento del modelo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/mi-kicic/xarm7_mj_ds21_filtered_act
- Dataset de entrenamiento: https://huggingface.co/datasets/mi-kicic/xarm7_mj_ds21_filtered
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Framework LeRobot: https://github.com/huggingface/lerobot
- Documentacion de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act
- Guia de instalacion de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Visualizacion del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=mi-kicic/xarm7_mj_ds21_filtered

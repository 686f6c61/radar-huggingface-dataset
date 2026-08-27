# photosynth-satoshi/act_thumbturn_v5_10k

## Resumen

El modelo `act_thumbturn_v5_10k` es una política de control robótico basada en Action Chunking with Transformers (ACT), desarrollada por el usuario photosynth-satoshi y entrenada con el framework LeRobot de Hugging Face. Su objetivo es que un robot manipulador de tipo `so_follower` realice la tarea de desbloquear un pomo de cerradura (thumbturn) mediante aprendizaje por imitación a partir de demostraciones teleoperadas.

Con 51,7 millones de parámetros, el modelo procesa imágenes RGB de dos cámaras (una base y otra en la muñeca izquierda) junto con el estado del robot (6 dimensiones) para generar acciones de control de 6 dimensiones. La arquitectura ACT predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación. Este modelo es relevante como ejemplo práctico de despliegue de políticas de imitación en robótica, accesible mediante la infraestructura de LeRobot.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un codificador visual (para procesar las imágenes de las cámaras) con un transformador que predice un chunk de acciones futuras (típicamente de 10 a 100 pasos) en lugar de una sola acción. Esto reduce el error de acumulación y mejora la suavidad del movimiento. El modelo fue entrenado con el dataset `photosynth-satoshi/so101_unlock_thumbturn_v5`, que contiene 200 episodios y 68.043 frames capturados a 30 FPS mediante teleoperación.

La configuración de entrenamiento incluye 10.000 pasos, batch size de 8, optimizador AdamW con learning rate de 1e-5 y semilla 1000, utilizando la versión 0.6.2 de LeRobot. No se menciona el uso de RLHF ni DPO; se trata de un entrenamiento supervisado puro sobre demostraciones. El modelo consume observaciones de estado (6 dimensiones) y dos imágenes RGB de 480x640 píxeles, y produce acciones de 6 dimensiones.

## Capacidades

- Control robótico de 6 grados de libertad: genera comandos de posición/orientación para el efector final del robot.
- Percepción visual multimodal: procesa simultáneamente imágenes de una cámara base y una cámara de muñeca.
- Aprendizaje por imitación: reproduce comportamientos aprendidos de demostraciones teleoperadas.
- Ejecución de tareas de manipulación fina: específicamente desbloqueo de pomos de cerradura.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de Hugging Face.
- No incluye capacidades de lenguaje, tool calling, agentes ni razonamiento simbólico.

## Casos de uso

- Automatización de acceso en entornos domésticos: el modelo puede integrarse en un robot asistente para abrir puertas con pomo de cerradura, reduciendo la necesidad de intervención humana en tareas repetitivas.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas ACT entre diferentes configuraciones de robot o variaciones de la tarea.
- Benchmark de manipulación robótica: puede utilizarse como referencia para comparar la eficacia de ACT frente a otros métodos de control en tareas de precisión.
- Desarrollo de sistemas de teleoperación asistida: el modelo puede complementar sistemas de control manual, sugiriendo acciones o ejecutando secuencias aprendidas.
- Pruebas de generalización: al estar entrenado con 200 episodios, es útil para evaluar la robustez de ACT ante cambios de iluminación, posición de la cámara o variaciones del pomo.
- Educación en robótica: permite a estudiantes y desarrolladores experimentar con políticas de imitación en hardware real o simulado mediante LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real ("No evaluation results have been provided for this policy yet"). No se dispone de métricas como tasa de éxito, MMLU, HumanEval u otras, ya que se trata de un modelo de robótica y no de lenguaje.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente, pero con 51,7 millones de parámetros y entrada de imágenes de 480x640, se estima que la inferencia puede ejecutarse en GPUs con al menos 4-6 GB de VRAM en precisión FP32.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (por ejemplo, RTX 3060, RTX 4090, A100) es suficiente para inferencia; el entrenamiento se realizó presumiblemente en una GPU de gama media-alta.
- Compatibilidad con GPU de consumo: sí, el tamaño del modelo permite su ejecución en GPUs de consumo como la serie RTX 30 o 40.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) que cargan el modelo y ejecutan la política en el robot. También es posible exportar los pesos a otros formatos, aunque no se documenta.
- Latencia y throughput: no disponibles; dependen del hardware y de la resolución de las cámaras.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas ACT para manipulación robótica) dentro de la información proporcionada. Existen otros modelos ACT en el Hub de Hugging Face, pero no se han encontrado datos concretos de rendimiento o configuración para establecer una comparación rigurosa.

## Limitaciones y advertencias

- Sin evaluación en robot real: la model card no reporta resultados de éxito en pruebas físicas, por lo que el rendimiento real es desconocido.
- Especialización limitada: el modelo fue entrenado exclusivamente para la tarea de desbloquear un pomo de cerradura; no generaliza a otras tareas de manipulación sin reentrenamiento.
- Dependencia de la configuración del robot: las observaciones incluyen imágenes de dos cámaras específicas y un estado de 6 dimensiones; cualquier cambio en la disposición de las cámaras o en la cinemática del robot puede degradar el rendimiento.
- Riesgo de sobreajuste: con 200 episodios y 10.000 pasos de entrenamiento, existe la posibilidad de que el modelo memorice las demostraciones en lugar de aprender una política robusta.
- Sesgos del dataset: las demostraciones teleoperadas pueden contener sesgos del operador (por ejemplo, trayectorias subóptimas o variaciones de velocidad).
- Licencia Apache 2.0: permite uso comercial, pero se recomienda verificar la procedencia del dataset y los términos de uso del hardware asociado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/photosynth-satoshi/act_thumbturn_v5_10k
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Dataset de entrenamiento: https://huggingface.co/datasets/photosynth-satoshi/so101_unlock_thumbturn_v5
- Documentación de LeRobot para ACT: https://huggingface.co/docs/lerobot/main/en/act

# powerstone829/so101_plastic_tomato_act_v3_msi_gpu

## Resumen

El modelo `powerstone829/so101_plastic_tomato_act_v3_msi_gpu` es una política de robótica entrenada con el método Action Chunking with Transformers (ACT), un enfoque de aprendizaje por imitación que predice secuencias de acciones cortas en lugar de pasos individuales. Fue desarrollado por el usuario powerstone829 utilizando la librería LeRobot de Hugging Face, y está diseñado para controlar un robot tipo `so_follower` en una tarea concreta: recoger un tomate de plástico de un contenedor grande y colocarlo en un bol pequeño.

El modelo se entrenó sobre un dataset de 50 episodios teleoperados (28.577 frames a 60 FPS) y cuenta con aproximadamente 51,7 millones de parámetros, un tamaño modesto que permite su ejecución en hardware de consumo. Su relevancia radica en demostrar cómo un pipeline de imitación completo —desde la captura de datos hasta el despliegue en robot real— puede empaquetarse y compartirse a través del Hub de Hugging Face, facilitando la reproducibilidad en robótica.

Al tratarse de un modelo de control robótico, no es un modelo de lenguaje ni de visión general: su entrada son imágenes de dos cámaras (frontal y de muñeca) junto con el estado del robot (6 dimensiones), y su salida es un vector de acción de 6 dimensiones. Está licenciado bajo Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de control robotico) |
| Tipos de cuantizacion | no disponible (pesos en FP32 por defecto) |
| Idiomas soportados | no aplica (no es modelo de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en transformers que procesa observaciones visuales y de estado para generar "chunks" de acciones (secuencias de varios pasos de control) en lugar de una única acción por paso. Esto reduce el error de acumulación y mejora la estabilidad del movimiento en tareas de manipulación. La arquitectura combina un codificador de imágenes (típicamente ResNet) con un transformer que modela la dependencia temporal entre observaciones y acciones.

El modelo fue entrenado con el dataset `powerstone829/so101_plastic_tomato_v2_20260813_201008`, compuesto por 50 episodios teleoperados con una tasa de 60 FPS, sumando 28.577 frames. La configuración de entrenamiento incluye 60.000 pasos, batch size de 2, optimizador AdamW con learning rate de 1e-5 y semilla 1000, utilizando la versión 0.5.2 de LeRobot. No se menciona el uso de técnicas como RLHF o DPO; el entrenamiento es puramente de imitación supervisada.

## Capacidades

- Control de un robot manipulador de 6 grados de libertad (acciones de 6 dimensiones) para tareas de pick-and-place.
- Percepción visual multimodal: procesa simultáneamente imágenes de una cámara frontal y una cámara de muñeca, ambas con resolución 480x640.
- Generación de secuencias de acciones (action chunking) que permiten movimientos suaves y coordinados.
- Ejecución de una tarea específica aprendida: recoger un tomate de plástico de un contenedor y depositarlo en un bol pequeño.
- Capacidad de inferencia en tiempo real sobre robot real mediante el framework LeRobot (comando `lerobot-rollout`).
- No incluye capacidades de lenguaje, tool calling ni razonamiento simbólico; es exclusivamente un controlador motor.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos controlados: el modelo puede integrarse en una celda de trabajo donde un robot clasifica objetos pequeños (como piezas de plástico) desde un contenedor a una bandeja o recipiente, gracias a su entrenamiento específico en esa maniobra.
- Prototipado rápido de políticas robóticas: investigadores pueden usar este modelo como punto de partida para fine-tuning en tareas similares, aprovechando que está publicado con pesos abiertos y licencia Apache 2.0.
- Validación de pipelines de imitación con LeRobot: sirve como ejemplo de referencia para verificar que la instalación de LeRobot, la conexión de cámaras y el robot `so_follower` funcionan correctamente antes de entrenar políticas propias.
- Demostraciones educativas en robótica: en laboratorios o cursos, se puede ejecutar el rollout para ilustrar el ciclo completo de aprendizaje por imitación, desde la teleoperación hasta el despliegue.
- Benchmarking de métodos de control: al tener un tamaño reducido (51,7 M de parámetros), es útil para comparar el rendimiento de ACT frente a otras arquitecturas (p. ej., Diffusion Policy) en la misma tarea y hardware.
- Reutilización en entornos simulados: aunque entrenado para robot real, el modelo puede evaluarse en simuladores compatibles con LeRobot para medir robustez antes del despliegue físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se proporcionan resultados de evaluación ("No evaluation results have been provided for this policy yet"). No hay datos de tasa de éxito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: al tratarse de un modelo de 51,7 M de parámetros, la inferencia requiere menos de 1 GB de VRAM en FP32 (aproximadamente 200 MB de pesos, más overhead de activaciones). En FP16, el consumo sería aún menor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; una NVIDIA GTX 1650 o superior puede ejecutar la política. Para entrenamiento, se recomienda al menos 8 GB de VRAM (el entrenamiento se realizó con batch size 2).
- Compatibilidad con GPU de consumo: sí, cabe sin problemas en tarjetas como RTX 3060, RTX 4060 o incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: el modelo se ejecuta mediante el framework LeRobot, que incluye el comando `lerobot-rollout` para inferencia en robot real. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se dispone de datos publicados. Dado el tamaño del modelo y la resolución de entrada (dos imágenes 480x640), se espera una inferencia en tiempo real (varios Hz) en GPU moderna, suficiente para control de robot.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa con otros modelos de robótica en la misma tarea. Como referencia conceptual, ACT se compara habitualmente con Diffusion Policy (Chi et al., 2023) y con métodos de imitación directa como Behavior Cloning con MLP. Sin embargo, no hay datos de rendimiento publicados para este modelo concreto que permitan una tabla comparativa fiable. Se recomienda consultar el paper original de ACT para ver resultados en tareas de referencia como simulación de ALOHA.

## Limitaciones y advertencias

- El modelo está entrenado para una tarea muy específica (recoger tomate de plástico de un contenedor a un bol) y no generaliza a otras tareas u objetos sin fine-tuning.
- No se han reportado resultados de evaluación en robot real; la tasa de éxito real es desconocida y puede variar significativamente según las condiciones de iluminación, posición de objetos y calibración del robot.
- Depende críticamente de la configuración de cámaras (frontal y muñeca) y de la calibración del robot `so_follower`; cambios en la disposición de la cámara o en la cinemática del robot degradarán el rendimiento.
- El dataset de entrenamiento es pequeño (50 episodios) y puede no cubrir la variabilidad del mundo real; existe riesgo de sobreajuste a las posiciones y condiciones del entorno de captura.
- No incluye mecanismos de seguridad ni detección de fallos; en producción, se requiere supervisión humana y lógica de parada de emergencia.
- Al ser un modelo de control, no tiene capacidad de razonamiento simbólico ni de comprensión de lenguaje; no debe usarse para tareas que requieran planificación de alto nivel.
- La licencia Apache 2.0 permite uso comercial, pero el usuario es responsable de cumplir con las normativas de seguridad aplicables a robots físicos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/powerstone829/so101_plastic_tomato_act_v3_msi_gpu)
- [Dataset de entrenamiento](https://huggingface.co/datasets/powerstone829/so101_plastic_tomato_v2_20260813_201008)
- [Paper de ACT (Action Chunking with Transformers)](https://huggingface.co/papers/2304.13705)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
- [Guía de instalación de LeRobot](https://huggingface.co/docs/lerobot/main/en/installation)
- [Guía de hardware de LeRobot](https://huggingface.co/docs/lerobot/main/en/hardware_guide)
- [Guía de grabación y entrenamiento](https://huggingface.co/docs/lerobot/en/il_robots)
- [Referencia de comandos CLI de LeRobot](https://huggingface.co/docs/lerobot/main/en/cheat-sheet)
- [Documentación de rollout](https://huggingface.co/docs/lerobot/main/en/inference)

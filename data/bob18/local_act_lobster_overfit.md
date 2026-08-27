# bob18/local_act_lobster_overfit

## Resumen

El modelo `bob18/local_act_lobster_overfit` es una política de control robótico basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias cortas de acciones en lugar de pasos individuales. Ha sido entrenado y publicado con el framework LeRobot de Hugging Face, y está diseñado para ejecutar la tarea específica de introducir una langosta en un cajón ("put the lobster into the drawer") sobre un robot bi_piper_follower equipado con tres cámaras.

Con 51,7 millones de parámetros y un peso de 0,2 GB, se trata de un modelo compacto orientado a robótica de manipulación, no a generación de texto. Su relevancia radica en ser un ejemplo práctico de entrenamiento de políticas de imitación con LeRobot, con licencia Apache 2.0, lo que permite su uso y modificación sin restricciones comerciales. El nombre "overfit" sugiere que fue entrenado para ajustarse al dataset local de demostraciones, lo que limita su generalización a otras tareas o entornos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.685.006 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | no disponible (no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación basado en transformers, presentado en el paper arXiv:2304.13705. La arquitectura combina un codificador de visión (típicamente ResNet) que procesa las imágenes de las cámaras, junto con el estado del robot, y un decodificador que genera un "chunk" de acciones futuras. Esto permite al modelo ejecutar movimientos suaves y coordinados en lugar de decisiones paso a paso, lo que mejora la estabilidad en tareas de manipulación.

El entrenamiento se realizó con el framework LeRobot (versión 0.5.2) sobre un dataset local llamado `local_lobster`, que contiene 62 episodios y 15.232 fotogramas a 30 FPS. Se usaron 5.000 pasos de entrenamiento con batch size 24, optimizador AdamW y learning rate 1e-5, con semilla 42. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento; es un entrenamiento supervisado de imitación puro.

## Capacidades

- Control robótico de manipulación por imitación: ejecuta la tarea de introducir una langosta en un cajón.
- Entrada multimodal: combina el estado del robot (vector de 14 dimensiones) con tres flujos de imagen (cámara superior, muñeca izquierda y muñeca derecha, cada una a 480x640 píxeles).
- Salida de acciones continuas: genera un vector de acción de 14 dimensiones que controla los actuadores del robot.
- Predicción por chunks: emite secuencias de acciones, lo que permite movimientos fluidos y reduce la acumulación de errores.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y despliegue de Hugging Face.
- No incluye capacidades de lenguaje, tool calling, visión general ni razonamiento simbólico.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos controlados: el modelo puede integrarse en una celda robótica para manipular objetos específicos (en este caso, una langosta) en un cajón, reduciendo la intervención humana en procesos repetitivos.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto del overfitting en políticas robóticas, comparando su rendimiento con versiones regularizadas o con más datos.
- Demostración de LeRobot: es un ejemplo funcional de cómo entrenar y desplegar una política con LeRobot, útil para talleres, tutoriales y pruebas de concepto.
- Desarrollo de sistemas de teleoperación asistida: puede usarse como base para que un operador humano supervise o corrija las acciones del robot en tiempo real.
- Benchmarking de hardware robótico: al ser un modelo pequeño, permite validar la integración de cámaras, actuadores y controladores en un robot bi_piper_follower.
- Pruebas de robustez en entornos de laboratorio: dado su carácter de overfit, es adecuado para experimentos que evalúen la degradación del rendimiento ante cambios de iluminación, posición de objetos o distracciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." Por tanto, no hay datos de éxito en robot real ni comparaciones cuantitativas con otros métodos.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 51,7 millones de parámetros, el peso en FP32 ocupa aproximadamente 207 MB y en FP16 unos 103 MB. Cualquier GPU con al menos 1 GB de VRAM es suficiente para la inferencia.
- GPU recomendadas: cualquier GPU moderna, incluidas las de gama de consumo como NVIDIA GTX 1060, RTX 2060 o superiores. No se requiere hardware de datacenter.
- Compatibilidad con consumer GPU: sí, el modelo cabe holgadamente en cualquier GPU de consumo actual.
- Opciones de despliegue: el flujo principal es mediante LeRobot, usando el comando `lerobot-rollout` con el robot bi_piper_follower. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no hay datos publicados, pero dado el tamaño y la naturaleza del modelo, es plausible alcanzar la frecuencia de 30 FPS de las cámaras en hardware moderno, aunque esto depende del robot y del procesamiento de imágenes.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este modelo concreto. En la categoría de políticas de imitación para robótica existen alternativas como Diffusion Policy o ACT original, pero no se han encontrado benchmarks que comparen este modelo específico con ellas. La información disponible no permite establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Overfitting explícito: el nombre del modelo indica que está sobreajustado al dataset local de 62 episodios. Su rendimiento fuera de las condiciones exactas de entrenamiento (posición de la langosta, iluminación, fondo) será probablemente deficiente.
- Sin evaluación en robot real: no se han reportado tasas de éxito ni pruebas en el robot físico, por lo que su funcionamiento real no está verificado.
- Tarea única: solo está entrenado para "put the lobster into the drawer". No generaliza a otras tareas ni a otros objetos.
- Dependencia de la configuración de hardware: requiere el robot bi_piper_follower y las tres cámaras específicas (top, wrist_left, wrist_right) con las resoluciones indicadas. Cambios en la disposición de cámaras o en el robot invalidarían el modelo.
- Dataset no público: el dataset `local_lobster` no está disponible en Hugging Face (el enlace apunta a un repositorio inexistente), lo que dificulta la reproducibilidad.
- Sin soporte de lenguaje ni interacción humano-máquina: no es un modelo conversacional ni de propósito general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bob18/local_act_lobster_overfit
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot sobre ACT: https://huggingface.co/docs/lerobot/main/en/act
- Dataset local_lobster (no accesible públicamente): https://huggingface.co/datasets/local_lobster

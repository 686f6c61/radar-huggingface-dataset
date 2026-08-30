# 5hred/act

## Resumen

El modelo `5hred/act` es una política de aprendizaje por imitación para robótica basada en el método Action Chunking with Transformers (ACT), desarrollado por el usuario 5hred y entrenado con el framework LeRobot de Hugging Face. ACT predice secuencias cortas de acciones (action chunks) en lugar de acciones individuales, lo que mejora la estabilidad y la tasa de éxito en tareas de manipulación real. Este modelo concreto ha sido entrenado para la tarea "Grab the grey foam part and move to target" (agarrar la pieza de espuma gris y moverla al objetivo) sobre un robot tipo `so_follower` con dos cámaras.

Con 51,7 millones de parámetros, es un modelo compacto que procesa observaciones visuales (dos cámaras RGB de 480x640) y el estado del robot (6 dimensiones) para generar acciones de 6 dimensiones. Su relevancia radica en que demuestra el flujo completo de entrenamiento y despliegue de políticas robóticas con LeRobot, un ecosistema open source que facilita la reproducción y el intercambio de modelos. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.668.614 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa observaciones de imagen y estado, no texto) |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no aplica (modelo de robótica, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que combina un transformer con decodificación autorregresiva para predecir un chunk de acciones (por ejemplo, 10 pasos futuros) a partir de observaciones actuales. El modelo utiliza un codificador de visión (para las cámaras `top` y `gripper`) y un codificador de estado, fusionando ambas modalidades para generar la secuencia de acciones. La innovación clave es el "action chunking", que reduce la acumulación de errores y mejora la consistencia del movimiento.

El entrenamiento se realizó con el dataset `move-foam-part-to-target-003_20260829_214202`, que contiene 30 episodios y 17.908 fotogramas a 30 FPS. Se usaron 20.000 pasos de entrenamiento con batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000, bajo la versión 0.6.1 de LeRobot. No se menciona el uso de RLHF ni DPO; es un entrenamiento puramente supervisado de imitación.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 grados de libertad (posición y orientación del efector) para ejecutar tareas de agarre y desplazamiento.
- Percepción visual multimodal: procesa simultáneamente dos cámaras RGB (vista superior y vista de pinza) con resolución 480x640.
- Integración con estado del robot: utiliza el estado articular (6 dimensiones) como entrada adicional para el control.
- Imitación de demostraciones: aprende de teleoperación humana, sin necesidad de recompensas explícitas.
- Ejecución en tiempo real: al ser un modelo pequeño, puede inferir a alta frecuencia (30 FPS) en hardware moderado.
- No soporta tool calling, generación de texto ni razonamiento simbólico; es exclusivamente una política de control.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos industriales: el modelo puede ejecutar la tarea de agarrar una pieza de espuma y moverla a una posición objetivo, replicando el comportamiento demostrado. Es adecuado por su bajo coste computacional y su capacidad de operar con dos cámaras.
- Prototipado rápido de políticas robóticas: investigadores pueden usar este modelo como punto de partida para entrenar nuevas tareas con LeRobot, ajustando el dataset y los hiperparámetros.
- Evaluación de algoritmos de imitación: sirve como referencia para comparar ACT con otros métodos (diffusion policies, etc.) en un entorno controlado.
- Despliegue en robots de bajo coste: al requerir solo 51,7M de parámetros, puede ejecutarse en GPUs de gama media o incluso en CPU para tareas no críticas en latencia.
- Investigación en generalización de tareas: el modelo puede ser fine-tuneado con nuevos datos para adaptarse a variaciones de la tarea (cambios de posición, iluminación, etc.).
- Formación y demostraciones educativas: permite a estudiantes y desarrolladores aprender el flujo completo de entrenamiento y despliegue de políticas robóticas con LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no hay resultados de evaluación en robot real. No se proporcionan métricas como tasa de éxito, precisión ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: al tener 51,7M de parámetros, el modelo en FP32 ocupa aproximadamente 207 MB. Con batch de inferencia 1, cabría en cualquier GPU con al menos 1 GB de VRAM, incluso en GPUs integradas.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA (GTX 1060, RTX 2060, etc.) es suficiente. También puede ejecutarse en CPU, aunque la latencia sería mayor.
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU de consumo actual (RTX 3060, RTX 4090, etc.) y también en placas como Jetson para robótica embarcada.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) que cargan el modelo y lo ejecutan en el robot. También se puede exportar a ONNX o TensorRT para optimización, aunque no está documentado en la model card.
- Latencia y throughput: no se especifican, pero dado el tamaño, se espera una inferencia en el orden de milisegundos en GPU moderna, permitiendo control a 30 FPS.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas de imitación para robótica con ACT). Existen alternativas como MolmoAct2 o π0, pero no se han encontrado datos concretos de comparación en la información proporcionada. Se recomienda consultar benchmarks de LeRobot para comparaciones con otras políticas.

## Limitaciones y advertencias

- Entrenado para una única tarea específica (mover pieza de espuma a un objetivo); no generaliza a otras tareas sin fine-tuning.
- El dataset es reducido (30 episodios), lo que puede limitar la robustez ante variaciones de iluminación, posición de objetos o distracciones.
- No se han proporcionado resultados de evaluación en robot real, por lo que el rendimiento real es desconocido.
- Depende de la configuración de cámaras y del robot `so_follower`; cualquier cambio en la disposición de sensores o en el robot requiere reentrenamiento.
- Al ser un modelo de imitación, puede heredar sesgos de las demostraciones humanas (trayectorias subóptimas, movimientos inconsistentes).
- No hay soporte para razonamiento simbólico ni interacción con lenguaje; es exclusivamente una política de control de bajo nivel.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías de rendimiento ni soporte.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/5hred/act)
- [Paper de ACT (arXiv:2304.13705)](https://huggingface.co/papers/2304.13705)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Guía de ACT en LeRobot](https://huggingface.co/docs/lerobot/main/en/act)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
- [Dataset de entrenamiento](https://huggingface.co/datasets/move-foam-part-to-target-003_20260829_214202)

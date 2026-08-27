# jaheroth/act_pusht_seed1002

## Resumen

El modelo `jaheroth/act_pusht_seed1002` es una política de robótica basada en el método Action Chunking with Transformers (ACT), entrenada con el framework LeRobot de Hugging Face sobre el dataset PushT. ACT es una técnica de aprendizaje por imitación que predice secuencias cortas de acciones (action chunks) en lugar de pasos individuales, lo que mejora la estabilidad y el éxito en tareas de manipulación robótica. El modelo fue desarrollado por el usuario jaheroth y publicado en Hugging Face bajo licencia Apache-2.0.

El modelo tiene 51.660.436 parámetros y está disponible en formato safetensors. Está diseñado específicamente para la tarea PushT, que consiste en empujar un objeto (un cilindro en forma de T) hasta una posición objetivo en un entorno simulado. Al ser un modelo de robótica, no es un modelo de lenguaje ni multimodal: su entrada es la observación del estado del robot y su salida son comandos de acción. Su relevancia radica en ser un ejemplo de política entrenada con LeRobot, reproducible y lista para evaluar en entornos de simulación o robots reales compatibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parametros totales | 51.660.436 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica, es un modelo de control) |
| Tipos de cuantizacion | no disponible (solo safetensors de precision completa) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un metodo de aprendizaje por imitacion que combina un encoder CVAE (Conditional Variational Autoencoder) con un decoder transformer. El encoder condiciona la generacion de acciones sobre la observacion actual y una variable latente, mientras que el decoder autoregresivo predice un chunk de acciones futuras. Esta arquitectura permite que la politica sea robusta a perturbaciones y produzca movimientos suaves y coherentes.

El modelo fue entrenado con el framework LeRobot sobre el dataset `lerobot/pusht`, que contiene demostraciones teleoperadas de la tarea PushT. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (en este contexto no aplican, al ser un modelo de control). El entrenamiento se realizo con la configuracion estandar de ACT para PushT, que requiere ajustes especificos en los parametros de la politica para adaptarse a este entorno, tal y como se documenta en los ejemplos oficiales de LeRobot.

## Capacidades

- Generacion de acciones de control para robots: predice secuencias de acciones (chunks) que permiten ejecutar tareas de manipulacion.
- Aprendizaje por imitacion: aprende de demostraciones teleoperadas sin necesidad de recompensas explicitas.
- Control en tiempo real: disenado para ejecutarse en bucle cerrado con el robot, con latencia baja.
- Especifico para la tarea PushT: optimizado para empujar un objeto hasta una posicion objetivo en un entorno simulado.
- Integracion con LeRobot: compatible con el ecosistema de Hugging Face para entrenamiento, evaluacion y despliegue.
- No soporta tool calling, agentes, vision ni lenguaje: es un modelo de politica puramente motor.

## Casos de uso

- Investigacion en aprendizaje por imitacion: sirve como punto de partida para reproducir experimentos con ACT en el entorno PushT y comparar variantes del algoritmo.
- Evaluacion de politicas en simulacion: permite medir la tasa de exito de ACT en PushT y validar configuraciones de hiperparametros antes de transferir a un robot real.
- Desarrollo de robots de bajo coste: al ser un modelo pequeno (51M parametros), puede ejecutarse en hardware modesto, lo que lo hace util para prototipos con brazos roboticos tipo SO-100 o ALOHA.
- Benchmarking de frameworks de robotica: se puede usar para comparar LeRobot con otros frameworks de aprendizaje por imitacion en una tarea estandar.
- Educacion en robotica: adecuado para cursos o talleres donde se ensene a entrenar y desplegar politicas de manipulacion con transformadores.
- Transferencia a tareas similares: aunque esta entrenado para PushT, la arquitectura ACT puede adaptarse a otras tareas de empuje o manipulacion con reentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo card no incluye metricas de exito, tasas de acierto ni comparaciones con otras politicas. Para obtener datos de rendimiento, seria necesario ejecutar una evaluacion en el entorno PushT siguiendo las instrucciones de LeRobot (por ejemplo, con `lerobot.record` y el robot SO-100).

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 51,6 millones de parametros, el modelo ocupa aproximadamente 200 MB en precision FP32. Con una cuantizacion a FP16 o BF16, cabria en menos de 100 MB. La VRAM necesaria para inferencia es inferior a 1 GB, aunque el entorno de simulacion PushT puede requerir recursos adicionales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Modelos como NVIDIA GTX 1650, RTX 3060 o superiores funcionan sin problemas. Tambien es posible ejecutar en CPU para evaluaciones lentas.
- Compatibilidad con consumer GPU: si, cabe en cualquier GPU de consumo actual.
- Opciones de despliegue: LeRobot proporciona scripts de evaluacion e inferencia. Se puede usar con `lerobot.record` para robots reales o con entornos de simulacion Gymnasium. No hay soporte nativo para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se dispone de datos medidos. Dado el tamano del modelo, la inferencia en GPU deberia ser de pocos milisegundos por paso, lo que permite control en tiempo real.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa cuantitativa con otros modelos. Como referencia cualitativa, se pueden mencionar:

| Modelo | Arquitectura | Parametros | Tarea | Licencia |
|---|---|---|---|---|
| jaheroth/act_pusht_seed1002 | ACT (Transformer + CVAE) | 51,7 M | PushT | Apache-2.0 |
| arclabmit/pusht_act_model | ACT | no disponible | PushT | no disponible |
| Diffusion Policy (referencia) | Diffusion | no disponible | Varias tareas | no disponible |

La comparativa con Diffusion Policy es conceptual: ambos son metodos de aprendizaje por imitacion para control robotico, pero ACT usa transformadores con chunks de acciones, mientras que Diffusion Policy genera acciones mediante un proceso de difusion. No hay datos publicos de rendimiento relativo en PushT para estos modelos concretos.

## Limitaciones y advertencias

- Especificidad de la tarea: el modelo esta entrenado exclusivamente para PushT. No generaliza a otras tareas sin reentrenamiento.
- Dependencia del entorno: el rendimiento puede degradarse si se usa en un entorno fisico diferente al de simulacion (gap de sim-to-real).
- Sin capacidades de lenguaje ni vision: no puede interpretar instrucciones ni procesar imagenes; solo recibe observaciones de estado del robot.
- Riesgo de sobreajuste: al ser un modelo pequeno entrenado en un dataset limitado, puede memorizar las demostraciones y fallar ante variaciones del entorno.
- Sesgos: al ser un modelo de control, no presenta sesgos linguisticos o sociales, pero si puede heredar sesgos de las demostraciones (por ejemplo, trayectorias suboptimas).
- Alucinacion: no aplica en el sentido de generacion de texto, pero puede producir acciones incorrectas si la observacion esta fuera de la distribucion de entrenamiento.
- Licencia: Apache-2.0 permite uso comercial, pero se recomienda verificar la licencia del dataset `lerobot/pusht` para uso en productos.
- Mantenimiento: el modelo fue creado en agosto de 2026 y no se han publicado actualizaciones ni documentacion adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaheroth/act_pusht_seed1002
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentacion de LeRobot: https://huggingface.co/docs/lerobot/index
- Guia de entrenamiento de LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Dataset PushT: https://huggingface.co/datasets/lerobot/pusht
- Repositorio de LeRobot: https://github.com/huggingface/lerobot

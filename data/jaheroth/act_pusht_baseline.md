# jaheroth/act_pusht_baseline

## Resumen

El modelo `jaheroth/act_pusht_baseline` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), entrenada con la librería LeRobot sobre el dataset `lerobot/pusht`. Este dataset contiene demostraciones teleoperadas de un brazo robótico que debe empujar una pieza con forma de T hasta una posición objetivo dentro de un entorno simulado (PushT). El modelo fue publicado por el usuario jaheroth (Jacob H. Rothschild) y está pensado como un baseline reproducible para experimentos de aprendizaje por imitación en robótica.

Con 51,66 millones de parámetros, es un modelo relativamente pequeño en comparación con los grandes modelos de lenguaje, pero suficiente para la tarea de control motor que aborda. Su arquitectura se basa en transformadores que predicen secuencias de acciones (chunks) en lugar de acciones individuales, lo que mejora la estabilidad del control. La licencia Apache 2.0 permite su uso comercial y académico sin restricciones significativas. Aunque no se proporcionan métricas de rendimiento en la información disponible, su interés radica en servir como punto de partida para comparar variantes de ACT o de otros algoritmos de imitación en el entorno PushT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con action chunking (ACT) |
| Parametros totales | 51.660.436 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de robótica, no de lenguaje) |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no aplica (modelo de control motor) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura ACT (Action Chunking with Transformers), descrita en el paper arXiv:2304.13705. ACT es un método de aprendizaje por imitación que, en lugar de predecir una única acción por paso de tiempo, predice un fragmento (chunk) de acciones futuras. Esto reduce el error de acumulación y mejora la suavidad del movimiento. La política se entrena con demostraciones teleoperadas mediante una pérdida de regresión sobre las acciones y una pérdida de consistencia temporal.

El entrenamiento se realizó con la librería LeRobot, utilizando el dataset `lerobot/pusht`, que contiene episodios de demostración en el simulador PushT. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. El modelo se publicó como un baseline, por lo que no se documentan innovaciones técnicas adicionales más allá de la propia arquitectura ACT.

## Capacidades

- Control robótico por imitación: genera comandos de posición del efector final a partir de observaciones visuales y del estado del robot.
- Predicción de secuencias de acciones: produce chunks de acciones que permiten un control más fluido y robusto.
- Funcionamiento en bucle cerrado: puede ejecutarse en el simulador PushT para evaluar el éxito de la tarea de empuje.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento y evaluación de políticas robóticas de Hugging Face.
- No incluye capacidades de lenguaje, visión general, tool calling ni razonamiento simbólico, ya que es un modelo puramente motor.

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como baseline para comparar nuevas variantes de ACT o algoritmos alternativos en el entorno PushT, midiendo tasas de éxito y robustez.
- Evaluación de políticas en simulación: permite reproducir experimentos de control robótico en el simulador PushT, útil para validar hipótesis antes de pasar a robots físicos.
- Desarrollo de pipelines de entrenamiento con LeRobot: puede usarse como ejemplo de cómo entrenar y subir una política robótica al Hub de Hugging Face, facilitando la curva de aprendizaje de nuevos usuarios.
- Benchmark de algoritmos de control: al ser un modelo pequeño y de código abierto, es adecuado para probar infraestructuras de entrenamiento distribuido o técnicas de optimización de inferencia.
- Educación en robótica: en cursos de robótica o aprendizaje automático, se puede utilizar para ilustrar el concepto de action chunking y su impacto en la estabilidad del control.
- Pruebas de integración de LeRobot con otros simuladores: aunque está entrenado para PushT, su estructura permite adaptarlo a otros entornos compatibles con LeRobot, sirviendo como punto de partida para transferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como tasa de éxito en PushT, ni comparaciones con otros modelos. El autor no incluye tablas de rendimiento en la model card.

## Requisitos de hardware

- No se dispone de datos oficiales sobre VRAM necesaria, latencia o throughput.
- Dado el tamaño del modelo (51,66 millones de parámetros), es previsible que quepa en GPUs de consumo como una RTX 3060 o superior, pero no hay confirmación.
- El despliegue se realiza típicamente mediante la librería LeRobot, que requiere una GPU con CUDA para entrenamiento e inferencia.
- No se mencionan opciones de cuantización ni soporte para vLLM, llama.cpp u otros motores de inferencia orientados a modelos de lenguaje.
- Para ejecutar la evaluación en el simulador PushT, se necesita un entorno con las dependencias de LeRobot y un simulador compatible (por ejemplo, Gymnasium).

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa. Existen otros repositorios con nombres similares, como `sancov/act_pusht_baseline` o `sancov/act_pusht_baseline_2k`, que probablemente contengan políticas ACT entrenadas en el mismo dataset, pero no se han encontrado especificaciones detalladas de esos modelos. Por tanto, la comparativa se limita a indicar que el modelo es un baseline de ACT para PushT, sin datos numéricos de rendimiento.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para la tarea PushT en simulación; no es transferible directamente a otros entornos o robots sin reentrenamiento.
- No se han documentado sesgos específicos, pero al ser un modelo de control motor, no presenta sesgos lingüísticos ni de contenido.
- Riesgo de alucinación: no aplica, ya que no genera texto.
- La generalización a entornos reales es limitada; el modelo puede fallar ante variaciones en la iluminación, texturas o dinámica del objeto.
- No se proporcionan garantías de rendimiento; es un baseline académico y puede no ser óptimo para aplicaciones de producción.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece soporte ni mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jaheroth/act_pusht_baseline
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio similar (sancov/act_pusht_baseline): https://huggingface.co/sancov/act_pusht_baseline
- Repositorio similar (sancov/act_pusht_baseline_2k): https://huggingface.co/sancov/act_pusht_baseline_2k

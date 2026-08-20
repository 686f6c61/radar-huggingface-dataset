# agentic-ptb/sol-high.h022.maxrl-tb1-clean27.step_1

## Resumen

Este modelo es un checkpoint intermedio del barrido de entrenamiento AgentPTB, correspondiente a la celda `sol-high` del experimento `maxrl-tb1-clean27`. Fue generado por el driver Codex / gpt-5.6-sol con un esfuerzo de razonamiento `high`, y representa el punto de entrenamiento a las 22,64 horas de una ejecución planificada de 100 horas. El modelo parte de la base `Qwen/Qwen3.5-9B-Base` y se entrena con el método MaxRL (Maximum Likelihood Reinforcement Learning), una técnica que combina aprendizaje por refuerzo con estimación de máxima verosimilitud.

La relevancia de este checkpoint radica en que es el mejor de su celda dentro del barrido, y su identificador codifica el momento exacto de la ejecución en el eje temporal de las figuras de evaluación. Al ser un checkpoint intermedio, su propósito principal es servir para monitorizar la evolución del entrenamiento y comparar el rendimiento a lo largo del tiempo, no para uso en producción. El repositorio incluye los pesos en formato safetensors con un tamaño total de 18,8 GB distribuidos en 4 shards.

El modelo hereda la arquitectura del Qwen3.5-9B-Base, con aproximadamente 9.410 millones de parámetros. La configuración de tokens EOS es correcta (`[248044, 248046]`), lo que garantiza que el modelo detiene la generación al final de cada turno, un aspecto crítico para evaluaciones fiables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-9B-Base) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (4 shards, 18,8 GB) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura del Qwen3.5-9B-Base, un transformer denso de aproximadamente 9.400 millones de parámetros. Al ser un checkpoint intermedio de un barrido de entrenamiento, no introduce cambios arquitectónicos respecto al modelo base; la innovación reside en el método de entrenamiento, MaxRL (Maximum Likelihood Reinforcement Learning), que combina objetivos de máxima verosimilitud con señales de refuerzo para optimizar el comportamiento del modelo.

El entrenamiento se realizó durante 22,64 horas de una ejecución planificada de 100 horas, utilizando el driver Codex / gpt-5.6-sol con un nivel de esfuerzo de razonamiento `high`. El checkpoint se guardó en el paso 1 de la ejecución, con los pesos almacenados en 4 shards. La configuración de tokens EOS es correcta, lo que indica que el modelo respeta la plantilla de chat de Qwen3.5 y detiene la generación al final de cada turno.

## Capacidades

- Generación de texto basada en el modelo base Qwen3.5-9B-Base, que incluye razonamiento, código y matemáticas.
- Entrenado con MaxRL, lo que puede mejorar la capacidad de seguir instrucciones y optimizar recompensas específicas.
- Soporte de plantilla de chat de Qwen3.5 con tokens EOS correctamente configurados.
- Capacidades multilingües heredadas del modelo base (no se especifican idiomas concretos).
- Al ser un checkpoint intermedio, las capacidades completas dependen del estado de entrenamiento en el momento del guardado.

## Casos de uso

- Monitorización de entrenamiento: los checkpoints intermedios como este permiten evaluar la evolución del rendimiento a lo largo del tiempo, trazando curvas de mejora en el eje temporal de las figuras del barrido.
- Comparación de celdas: al ser el mejor checkpoint de su celda (`sol-high`), sirve como referencia para comparar la efectividad de diferentes configuraciones de entrenamiento dentro del barrido AgentPTB.
- Investigación en métodos de entrenamiento: investigadores pueden analizar cómo el método MaxRL afecta al comportamiento del modelo en diferentes etapas del entrenamiento.
- Validación de configuración de tokens: el checkpoint con EOS correcto permite evaluar el modelo sin problemas de sobre-generación, útil para verificar la configuración del pipeline.
- Reproducción de experimentos: al estar disponible públicamente, permite reproducir los resultados del barrido y verificar las conclusiones del estudio.
- Desarrollo de pipelines de RL: sirve como ejemplo práctico de cómo estructurar checkpoints intermedios con metadatos completos (hora, paso, configuración) para experimentos a gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un checkpoint intermedio de un barrido experimental, no se proporcionan métricas de rendimiento como MMLU, HumanEval o GSM8K. La model card indica que los números de evaluación de checkpoints sin EOS correcto son un "suelo, no una medición", lo que sugiere que las evaluaciones se realizan pero no se comparten en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 9.409.813.744 parámetros. En FP16, necesitaría aproximadamente 18,8 GB de VRAM (más overhead de activaciones). En INT8, unos 9,4 GB; en INT4, unos 4,7 GB.
- GPU recomendadas: para FP16, una GPU con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A100 40GB). Para cuantización INT4, podría caber en GPUs de 8-12 GB (RTX 3060, RTX 4070).
- Sí cabe en GPUs de consumo: con cuantización INT4 o INT8, es posible ejecutarlo en GPUs consumer de gama alta.
- Opciones de despliegue: al ser un checkpoint intermedio, no se recomienda su uso en producción. Para experimentación, se puede usar con transformers, vLLM, llama.cpp u Ollama si se convierte a GGUF.
- Latencia y throughput: no disponible. Depende del hardware y la configuración de cuantización.

## Comparativa con modelos similares

No disponible. Al ser un checkpoint intermedio de un experimento de investigación, no se proporcionan comparaciones con otros modelos en la información disponible. El modelo base Qwen3.5-9B-Base podría compararse con otros modelos de 9B como Llama 3.1 8B o Mistral 7B, pero no hay datos de rendimiento específicos para este checkpoint.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final; su rendimiento puede ser inferior al del modelo completamente entrenado.
- Entrenamiento incompleto: solo 22,64 horas de las 100 planificadas, por lo que el modelo no ha convergido.
- Licencia no especificada: no se indica la licencia, lo que impide conocer las restricciones de uso comercial.
- Sesgos y alucinaciones: heredados del modelo base Qwen3.5-9B-Base, que pueden incluir sesgos culturales o lingüísticos.
- Sin datos de evaluación: no se proporcionan benchmarks, por lo que no se puede estimar la calidad del modelo en tareas estándar.
- No apto para producción: al ser un artefacto de investigación, no se recomienda su uso en aplicaciones reales sin una evaluación exhaustiva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agentic-ptb/sol-high.h022.maxrl-tb1-clean27.step_1
- Implementación oficial de MaxRL: https://github.com/tajwarfahim/maxrl
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base

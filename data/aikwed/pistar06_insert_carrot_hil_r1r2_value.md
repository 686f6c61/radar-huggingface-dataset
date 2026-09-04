# Aikwed/pistar06_insert_carrot_hil_r1r2_value

## Resumen

El modelo Aikwed/pistar06_insert_carrot_hil_r1r2_value es una política de control robótico entrenada con la librería LeRobot de Hugging Face. Su objetivo es ejecutar la tarea de insertar una zanahoria en un agujero, a partir de un conjunto de demostraciones humanas recogidas en el dataset AlvinAi/insert_carrot_into_the_hole_hil_r1_r2_merged. El modelo cuenta con 1.147.607.163 parámetros y se distribuye en formato safetensors bajo licencia Apache 2.0. El nombre del repositorio sugiere que podría tratarse de un modelo de valor (value function) para aprendizaje por refuerzo, aunque la documentación genérica de LeRobot se refiere a él como una política. No se especifican detalles sobre la arquitectura interna, la longitud de contexto ni los idiomas soportados, ya que se trata de un modelo de robótica y no de un modelo de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de robótica entrenada con LeRobot; tipo no confirmado, posiblemente ACT (Action Chunking Transformer) |
| Parametros totales | 1.147.607.163 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de control robótico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no se ha publicado. La model card incluye un ejemplo de entrenamiento con `--policy.type=act`, lo que sugiere que el modelo podría ser una política ACT (Action Chunking Transformer), una arquitectura de aprendizaje por imitación que predice secuencias de acciones. El entrenamiento se realizó con LeRobot, un framework de Hugging Face para robótica, sobre el dataset AlvinAi/insert_carrot_into_the_hole_hil_r1_r2_merged. El nombre del dataset indica que se han fusionado dos fases (r1 y r2) de un proceso con intervención humana (HIL). No se dispone de información sobre el número de tokens, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Control de un robot manipulador para ejecutar la tarea de inserción de una zanahoria en un agujero.
- Aprendizaje por imitación a partir de demostraciones humanas.
- Posible uso como modelo de valor para aprendizaje por refuerzo, según el nombre del repositorio.
- No es un modelo de lenguaje: no genera texto, código ni respuestas a prompts.
- No soporta tool calling, visión ni audio.

## Casos de uso

- Investigación en manipulación robótica: el modelo sirve como política de referencia para estudiar la inserción precisa de objetos en entornos controlados. Se desplegaría en un robot SO100 mediante LeRobot y se evaluaría la tasa de éxito en la tarea.
- Validación de pipelines de LeRobot: los desarrolladores pueden usar este modelo para probar el flujo completo de entrenamiento, evaluación y despliegue de políticas con el framework.
- Generación de datos de demostración: la política puede ejecutar la tarea repetidamente para recopilar trayectorias que sirvan para entrenar otros modelos o para análisis de robustez.
- Comparación de algoritmos de RL: si se confirma que es un modelo de valor, podría utilizarse como función de valor en experimentos de aprendizaje por refuerzo para comparar con otras aproximaciones en la misma tarea.
- Demostraciones educativas: en cursos de robótica, el modelo permite mostrar cómo un sistema aprende de demostraciones humanas y ejecuta movimientos finos.
- Automatización de tareas repetitivas de inserción: aunque el modelo está especializado en una tarea concreta, la técnica puede adaptarse a procesos similares de inserción en entornos de laboratorio o de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. El peso en safetensors ocupa 2,3 GB, lo que sugiere una precisión de bf16/fp16. Para la inferencia se estima una VRAM mínima de 4 GB, aunque se recomienda al menos 8 GB para margen.
- GPU recomendadas: no disponibles. Cualquier GPU moderna con al menos 4 GB de VRAM podría ejecutar la inferencia (por ejemplo, RTX 3050, RTX 4060). Para entrenamiento, se necesitaría más memoria.
- ¿Cabe en consumer GPU? Sí, según el tamaño del peso, una GPU de consumo con 6-8 GB debería ser suficiente para la inferencia.
- Opciones de despliegue: LeRobot (inferencia y evaluación), posiblemente con robots SO100. No se mencionan vLLM, llama.cpp ni Ollama porque no es un modelo de lenguaje.
- Latencia: no disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. Existen otros modelos del mismo autor para la misma tarea, como Aikwed/pistar06_insert_carrot_into_the_hole_acp_r1 (una política Pi0.5 ACP) y Aikwed/pistar06_insert_carrot_hil_success_only, pero no se han publicado especificaciones detalladas ni resultados de benchmarks para comparar.

## Limitaciones y advertencias

- Modelo especializado: solo ha sido entrenado para la tarea de insertar una zanahoria en un agujero; no generaliza a otras tareas sin reentrenamiento.
- Dependencia del robot: el ejemplo de evaluación utiliza un robot SO100 follower; puede no funcionar con otros robots sin adaptación.
- Sin datos de robustez: no se han publicado resultados de rendimiento ante variaciones de iluminación, posición, textura o condiciones del entorno.
- Posible riesgo de fallos en la ejecución: como cualquier política de aprendizaje por imitación, puede fallar ante situaciones no vistas en el dataset de demostraciones.
- Sesgos: no se dispone de información sobre sesgos en el dataset. Al estar entrenado con demostraciones humanas, podría heredar sesgos del operador.
- Licencia: Apache 2.0 permite uso comercial, pero es responsabilidad del usuario verificar la procedencia de los datos de entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/Aikwed/pistar06_insert_carrot_hil_r1r2_value
- Modelo similar ACP: https://huggingface.co/Aikwed/pistar06_insert_carrot_into_the_hole_acp_r1
- Modelo similar success_only: https://huggingface.co/Aikwed/pistar06_insert_carrot_hil_success_only
- LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index

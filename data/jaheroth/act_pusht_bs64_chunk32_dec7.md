# jaheroth/act_pusht_bs64_chunk32_dec7

## Resumen

El modelo `jaheroth/act_pusht_bs64_chunk32_dec7` es una política de control robótico basada en Action Chunking with Transformers (ACT), un método de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de acciones individuales. Ha sido desarrollado por Jacob H. Rothschild (jaheroth) utilizando la librería LeRobot de HuggingFace, y entrenado sobre el dataset `lerobot/pusht`, un benchmark estándar de manipulación robótica en simulación que consiste en empujar una forma en T hasta una posición objetivo.

El modelo cuenta con 83,9 millones de parámetros, está publicado en formato safetensors y se distribuye bajo licencia Apache 2.0. Su relevancia radica en que ejemplifica el flujo completo de entrenamiento y evaluación de políticas de imitación con LeRobot, y sirve como punto de partida para investigar y comparar métodos de control basados en transformers en robótica. Al ser un modelo pequeño y específico de una tarea, es accesible para equipos con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) - transformer con codificador y decodificador |
| Parametros totales | 83.899.796 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el contexto es la observación del entorno, no texto) |
| Tipos de cuantizacion | no disponible (solo safetensors en precisión completa) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que utiliza un transformer para procesar observaciones (imágenes y estados del robot) y generar secuencias de acciones futuras. La arquitectura se compone de un codificador que procesa la observación actual y un decodificador autorregresivo que predice un chunk de acciones de longitud fija (en este caso, 32 pasos según el nombre del modelo). Esta predicción por chunks reduce el error de acumulación típico de los métodos paso a paso y mejora la estabilidad del control.

El entrenamiento se realizó con LeRobot sobre el dataset `lerobot/pusht`, que contiene demostraciones teleoperadas de la tarea Push-T. No se dispone de información detallada sobre el número de tokens de entrenamiento, la composición exacta del dataset ni el uso de técnicas como RLHF o DPO, ya que la model card no las especifica. El nombre del modelo (`bs64_chunk32_dec7`) sugiere un batch size de 64, chunks de 32 acciones y 7 capas de decodificador, aunque estos valores no están confirmados en la documentación pública.

## Capacidades

- Control robótico: predice secuencias de acciones para manipulación en la tarea Push-T.
- Aprendizaje por imitación: aprende directamente de demostraciones teleoperadas sin necesidad de recompensas explícitas.
- Ejecución en simulación: diseñado para el entorno Pusht de MuJoCo, aunque puede adaptarse a otros entornos con modificaciones.
- Integración con LeRobot: compatible con el ecosistema de entrenamiento, evaluación y registro de LeRobot.
- No es un modelo de lenguaje: no genera texto, no soporta tool calling, ni agentes conversacionales, ni capacidades multilingües.

## Casos de uso

- Investigación en aprendizaje por imitación: sirve como baseline para comparar variantes de ACT o métodos alternativos en la tarea Push-T.
- Benchmarking de políticas de control: permite evaluar métricas como tasa de éxito, suavidad de trayectorias y robustez frente a perturbaciones.
- Desarrollo de pipelines robóticos con LeRobot: el modelo puede cargarse y evaluarse con los scripts estándar de LeRobot, facilitando la reproducción de experimentos.
- Transferencia a robots reales: aunque entrenado en simulación, la arquitectura ACT es transferible a robots físicos como SO-100 o Aloha, requiriendo reentrenamiento con datos reales.
- Educación en robótica y aprendizaje automático: su pequeño tamaño y licencia permisiva lo hacen adecuado para cursos y talleres sobre control basado en aprendizaje.
- Generación de datos sintéticos: puede usarse para generar trayectorias de demostración adicionales en entornos simulados, ampliando datasets de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper original de ACT (arXiv:2304.13705) reporta tasas de éxito en la tarea Push-T, pero estos datos no están incluidos en la model card ni en los resultados de búsqueda. Se recomienda consultar el paper para obtener métricas de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (83,9M parámetros × 4 bytes ≈ 336 MB), por lo que cabe en cualquier GPU moderna.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, por ejemplo NVIDIA GTX 1650, RTX 3060 o superiores. También puede ejecutarse en CPU para inferencia lenta.
- Compatibilidad con consumer GPU: sí, es un modelo muy ligero.
- Opciones de despliegue: LeRobot (PyTorch), con scripts de entrenamiento e inferencia disponibles en el repositorio. No es compatible con vLLM, llama.cpp u Ollama al no ser un LLM.
- Latencia y throughput: no disponible, pero al ser un modelo pequeño se espera una inferencia en tiempo real en GPU consumer.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jaheroth/act_pusht_bs64_chunk32_dec7 | 83,9M | no disponible | Push-T | Apache 2.0 | HuggingFace |
| arclabmit/pusht_act_model | no disponible | no disponible | Push-T | no disponible | HuggingFace |
| ACT original (paper) | no disponible | no disponible | Push-T y otras | no aplica | paper |

No se dispone de datos comparativos de rendimiento entre estos modelos. La comparativa se limita a la disponibilidad y licencia, siendo ambos modelos de la misma categoría (ACT sobre pusht).

## Limitaciones y advertencias

- Especialización en una tarea: el modelo está entrenado exclusivamente para la tarea Push-T y no generaliza a otras tareas de manipulación sin reentrenamiento.
- Dependencia de la calidad de las demostraciones: el rendimiento está limitado por la calidad y cobertura del dataset de entrenamiento.
- Sin capacidades de lenguaje: no procesa texto ni instrucciones, solo observaciones visuales y de estado.
- Sin información sobre sesgos: al ser un modelo de control, los sesgos típicos de LLM no aplican, pero puede presentar comportamientos subóptimos en estados no vistos.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento en entornos de producción.
- Riesgo de sobreajuste al entorno simulado: puede fallar al transferirse a robots reales debido a diferencias de dinámica y percepción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaheroth/act_pusht_bs64_chunk32_dec7
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Perfil de GitHub del autor: https://github.com/JaHeRoth

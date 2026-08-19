# 2usang/act_trihouse-milk

## Resumen

El modelo `2usang/act_trihouse-milk` es una política de control robótico basada en el método Action Chunking with Transformers (ACT), entrenada con la librería LeRobot de Hugging Face. ACT es una técnica de aprendizaje por imitación que predice secuencias de acciones (chunks) en lugar de pasos individuales, lo que permite un control más suave y robusto en tareas de manipulación. Este modelo concreto se ha entrenado sobre el dataset `2usang/trihouse-milk`, que contiene 31.5k filas de datos de teleoperación, probablemente de un brazo robótico SO-100. El modelo tiene 51.7 millones de parámetros, un tamaño moderado que lo hace viable para inferencia en GPU de consumo. Su relevancia radica en ser un ejemplo práctico de entrenamiento de políticas robóticas con LeRobot, con licencia Apache 2.0 que permite uso comercial y modificación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Action Chunking with Transformers (ACT) |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control, no de lenguaje) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ACT es una arquitectura basada en transformers diseñada para aprendizaje por imitación en robótica. El modelo predice un chunk de acciones futuras (por ejemplo, 10 pasos de control) a partir de observaciones actuales (imágenes y estados del robot). El entrenamiento se realizó con la librería LeRobot, que proporciona un pipeline completo para recopilar datos, entrenar y evaluar políticas. El dataset `2usang/trihouse-milk` contiene 31.5k filas, aunque no se especifica el número de episodios ni la composición exacta (tipo de robot, tareas, etc.). No se menciona el uso de RLHF, DPO u otras técnicas de refinamiento; el entrenamiento es puramente supervisado sobre datos de teleoperación. No se dispone de detalles sobre el número de tokens, la configuración exacta del transformer (capas, cabezas, etc.) ni sobre innovaciones técnicas adicionales.

## Capacidades

- Control robótico por imitación: el modelo aprende a mapear observaciones (imágenes y estados) a secuencias de acciones de control.
- Predicción de chunks de acciones: en lugar de predecir un solo paso, genera un bloque de acciones consecutivas, mejorando la suavidad y estabilidad del movimiento.
- Entrenamiento con LeRobot: compatible con el ecosistema de Hugging Face para robótica, incluyendo registro de episodios y evaluación.
- No es un modelo de lenguaje: no genera texto ni tiene capacidades de conversación, tool calling o razonamiento simbólico.

## Casos de uso

- Manipulación robótica en laboratorio: el modelo puede controlar un brazo robótico SO-100 para tareas como recoger y colocar objetos, utilizando el pipeline de LeRobot para inferencia en tiempo real.
- Investigación en aprendizaje por imitación: sirve como punto de partida para experimentos con ACT, comparando variaciones de hiperparámetros o datasets.
- Prototipado rápido de políticas robóticas: gracias a su tamaño reducido y a la integración con LeRobot, se puede desplegar en estaciones de trabajo con GPU consumer para validar tareas antes de escalar a modelos mayores.
- Educación en robótica: útil para demostrar el flujo completo de entrenamiento y evaluación de una política con datos teleoperados.
- Benchmarking de hardware: al ser un modelo ligero, permite medir latencia y throughput de inferencia en diferentes GPUs para aplicaciones de control en bucle cerrado.
- Reentrenamiento y fine-tuning: con la licencia Apache 2.0, se puede adaptar el modelo a nuevas tareas o robots mediante fine-tuning sobre datasets propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval u otras métricas, ya que no es un modelo de lenguaje. Tampoco se reportan tasas de éxito en tareas robóticas específicas.

## Requisitos de hardware

- VRAM estimada: con 51.7 millones de parámetros en precisión FP32, el modelo ocupa aproximadamente 207 MB. Con cuantización a FP16 o INT8, el uso de VRAM sería inferior a 200 MB, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM puede ejecutar la inferencia. Ejemplos: NVIDIA GTX 1650, RTX 2060, RTX 3060, o superiores. Para entrenamiento, se recomienda al menos 8 GB de VRAM (RTX 3070, RTX 4060, etc.).
- Compatibilidad con consumer GPU: sí, cabe en cualquier GPU moderna de consumo.
- Opciones de despliegue: LeRobot proporciona scripts de evaluación e inferencia (`lerobot-record`). También se puede cargar el modelo con la librería `transformers` o directamente con PyTorch y safetensors. No hay soporte nativo para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dado el tamaño, se espera una latencia inferior a 10 ms en GPU moderna, pero no hay mediciones oficiales.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos ACT comparables en el Hub con los mismos datos de entrenamiento o métricas. Existen otros modelos ACT en Hugging Face (por ejemplo, bajo el namespace de LeRobot), pero no se han encontrado datos públicos de rendimiento o especificaciones que permitan una comparación rigurosa. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado específicamente sobre el dataset `trihouse-milk`, que probablemente corresponde a una tarea y un robot concretos. Su generalización a otras tareas o entornos es limitada.
- No se han documentado sesgos, pero al ser un modelo de control robótico, los sesgos pueden manifestarse en comportamientos no deseados si se usa fuera del dominio de entrenamiento.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí puede producir acciones incorrectas si las observaciones difieren de las del entrenamiento.
- No hay información sobre la longitud de contexto (número de pasos de observación) ni sobre el tamaño del chunk de acciones, lo que limita la configuración para nuevos despliegues.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías; el usuario debe validar su comportamiento en entornos reales.
- Al ser un modelo de investigación, no se recomienda su uso en sistemas de seguridad crítica sin una evaluación exhaustiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/2usang/act_trihouse-milk
- Dataset asociado: https://huggingface.co/datasets/2usang/trihouse-milk
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio de LeRobot: https://github.com/huggingface/lerobot

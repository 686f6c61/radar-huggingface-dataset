# s1eepypillow/task1_act_finetuned

## Resumen

El modelo `task1_act_finetuned`, desarrollado por el usuario s1eepypillow (강태훈) en Hugging Face, es un modelo de política robótica basado en la arquitectura ACT (Action Chunking with Transformers) para la tarea de pick and stack de bloques. Se trata de un fine-tuning de un modelo ACT previo, orientado a mejorar la precisión en la manipulación de bloques en posiciones fijas y aleatorias dentro de un entorno de simulación o robótica física. El modelo tiene 51,6 millones de parámetros y un tamaño de repositorio de 0,2 GB, lo que lo sitúa en la categoría de modelos pequeños, adecuados para inferencia en hardware modesto.

La relevancia de este modelo radica en su enfoque en la mejora de datos de entrenamiento para robótica de manipulación, combinando datos de posiciones fijas, izquierda, derecha y aleatorias, junto con técnicas de DAgger (Dataset Aggregation) para corregir comportamientos no deseados. Aunque los resultados reportados muestran un rendimiento moderado (promedio de 2,2 bloques en posición fija y 1,2 en aleatoria), el modelo documenta problemas específicos como golpes contra el suelo y atascos en regiones concretas, lo que lo convierte en un caso de estudio útil para la comunidad de robótica y aprendizaje por imitación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en ACT (Action Chunking with Transformers) |
| Parametros totales | 51.627.654 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ACT (Action Chunking with Transformers), un enfoque de aprendizaje por imitación para control robótico que predice secuencias de acciones (chunks) en lugar de acciones individuales, lo que mejora la estabilidad y la suavidad del movimiento. La model card indica que no hay diferencias en la arquitectura respecto al modelo base, y que el entrenamiento se realizó mediante un sistema de inferencia en servidor con comunicación estándar.

El dataset de entrenamiento combina 50 episodios del conjunto `svla_so100` (posiblemente un dataset de demostración de robótica) con 28 episodios de posiciones aleatorias, además de datos de posiciones fijas, izquierda y derecha. Se mantuvieron 50 muestras de DAgger para corrección de errores. El objetivo era superar las limitaciones del dataset anterior, que causaba que el robot confundiera la zona designada con un bloque o repitiera acciones en ciertas posiciones. No se especifican detalles sobre el número de tokens, composición exacta del dataset ni el uso de RLHF o DPO.

## Capacidades

- Control robótico para tareas de pick and stack de bloques en un entorno definido.
- Ejecución de acciones secuenciales (chunking) para manipulación precisa.
- Adaptación a posiciones fijas y aleatorias de los bloques, aunque con rendimiento variable.
- Integración con sistemas de inferencia en servidor para comunicación con el robot.
- Capacidad de corrección mediante DAgger, lo que permite refinar el comportamiento con intervención humana.

No se reportan capacidades de generación de texto, razonamiento, código, visión general, tool calling o agentes. El modelo es específico para la tarea de manipulación robótica.

## Casos de uso

- Automatización de tareas de recogida y colocación en líneas de montaje: el modelo puede controlar un brazo robótico para recoger bloques de posiciones variables y colocarlos en una zona designada, reduciendo la intervención manual en entornos industriales.
- Investigación en aprendizaje por imitación: sirve como banco de pruebas para estudiar el impacto de la diversidad de datos (posiciones fijas vs. aleatorias) y técnicas de corrección como DAgger en el rendimiento de políticas robóticas.
- Desarrollo de sistemas de control robusto: los problemas documentados (golpes contra el suelo, atascos en regiones) ofrecen casos reales para implementar lógicas de seguridad y mecanismos de recuperación en robots físicos.
- Entrenamiento de robots en entornos simulados: el modelo puede desplegarse en simuladores para validar algoritmos de control antes de transferirlos a hardware real, gracias a su pequeño tamaño y rápida inferencia.
- Benchmarking de arquitecturas ACT: permite comparar variantes de fine-tuning y datasets en tareas de manipulación, contribuyendo a la evaluación objetiva de mejoras metodológicas.
- Educación en robótica y control: al ser un modelo pequeño y de código abierto (aunque sin licencia especificada), puede utilizarse en cursos para demostrar el flujo de entrenamiento y despliegue de políticas de manipulación.

## Benchmarks y rendimiento

La model card reporta resultados de evaluación en la tarea de pick and stack, medidos como número de bloques colocados correctamente en 5 intentos:

| Condición | Intentos | Promedio de bloques exitosos |
|---|---|---|
| Posición fija | 1, 3, 3, 1, 3 | 2,2 |
| Posición aleatoria | 0, 2, 1, 2, 1 | 1,2 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el modelo no está orientado a tareas de lenguaje o razonamiento general.

## Requisitos de hardware

- VRAM estimada: no disponible, pero con 51,6 millones de parámetros, el modelo puede caber en GPUs con 4-6 GB de VRAM en precisión FP16, y menos si se cuantiza (aunque no se especifican cuantizaciones).
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060, o superiores. También puede ejecutarse en CPU para inferencia lenta.
- Compatibilidad con consumer GPU: sí, dado su tamaño reducido.
- Opciones de despliegue: al ser un modelo de robótica, el despliegue típico es en un servidor con comunicación al robot (como se menciona en la model card). No se mencionan herramientas como vLLM, llama.cpp u Ollama, que son para modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (políticas robóticas ACT) dentro de la información proporcionada. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Rendimiento limitado en posiciones aleatorias: el promedio de éxito es de 1,2 bloques, lo que indica una generalización deficiente a configuraciones no vistas.
- Comportamiento no deseado: el robot golpea el suelo con fuerza durante la recogida, lo que puede dañar el hardware (se reportó aflojamiento de tornillos en la muñeca).
- Atascos en regiones específicas: el modelo tiende a quedarse atrapado en la zona superior derecha, repitiendo acciones similares, lo que sugiere un posible colapso posterior (posterior collapse).
- Sesgos del dataset: la combinación de datos de posiciones fijas y aleatorias no resuelve completamente la confusión entre la zona designada y los bloques, aunque mejora respecto al modelo anterior.
- Licencia no especificada: no se indica la licencia, por lo que el uso comercial y la redistribución son inciertos.
- Sin soporte de idiomas ni capacidades de lenguaje: el modelo es exclusivamente para control motor, no para interacción textual.
- Riesgo de alucinación: no aplica, al no ser un modelo generativo de texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/s1eepypillow/task1_act_finetuned
- Perfil del autor: https://huggingface.co/s1eepypillow/datasets

# lair-nyu/yor_icl_pi05_rabc

## Resumen

El modelo `lair-nyu/yor_icl_pi05_rabc` es un checkpoint de fine-tuning del modelo de visión-lenguaje-acción (VLA) pi0.5, desarrollado por el grupo LAIR de la Universidad de Nueva York (NYU). Se trata de una variante entrenada mediante *reward-aligned behavior cloning* (RABC), una técnica que alinea el comportamiento del modelo con señales de recompensa durante la clonación de comportamiento, con el objetivo de mejorar la calidad de las acciones generadas en tareas robóticas. El modelo se basa en el backbone pi0.5 de Physical Intelligence y se entrena sobre el conjunto de datos `icl-dataset` utilizando el framework openpi.

Este checkpoint concreto corresponde al paso 20000 de entrenamiento y solo incluye los pesos desplegables (`params/`) y estadísticas de normalización (`assets/`), sin el estado del optimizador. El tamaño del repositorio es de 12,4 GB, lo que sugiere un modelo de tamaño considerable, aunque no se especifican los parámetros totales en la información disponible. Su relevancia radica en ser un ejemplo de fine-tuning orientado a mejorar la alineación de políticas robóticas con recompensas, un área activa en la investigación de VLA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en pi0.5 (transformer multimodal) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo orientado a control robótico, no a lenguaje general) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente safetensors, pero no se especifica) |

## Arquitectura y entrenamiento

El modelo se construye sobre pi0.5, un VLA que extiende pi0 mediante co-entrenamiento con datos heterogéneos para lograr generalización en entornos abiertos. pi0.5 combina un codificador de visión, un modelo de lenguaje y un decodificador de acciones, procesando secuencias de observaciones e instrucciones para generar comandos motores. En este caso, el fine-tuning aplica *reward-aligned behavior cloning* (RABC), una variante de clonación de comportamiento que incorpora información de recompensa para guiar la optimización de la política, en lugar de limitarse a imitar demostraciones. El entrenamiento se realizó con el framework openpi sobre el dataset `icl-dataset`, aunque no se detallan la composición exacta de los datos ni el número de tokens utilizados. El checkpoint se guarda en el paso 20000, lo que indica un entrenamiento relativamente extenso, pero no se especifican hiperparámetros adicionales.

## Capacidades

- Control robótico end-to-end: genera acciones motoras a partir de observaciones visuales e instrucciones en lenguaje natural.
- Generalización a entornos abiertos: hereda las capacidades de pi0.5 para operar en escenarios no vistos durante el entrenamiento.
- Alineación con recompensas: gracias al RABC, las acciones generadas están optimizadas para maximizar señales de recompensa, lo que puede mejorar la tasa de éxito en tareas específicas.
- Integración con openpi: compatible con el ecosistema de despliegue de Physical Intelligence.
- No se dispone de información sobre capacidades de tool calling, agentes o razonamiento multi-paso fuera del ámbito robótico.

## Casos de uso

- Manipulación robótica en entornos industriales: el modelo puede controlar brazos robóticos para tareas de ensamblaje o picking, aprovechando su alineación con recompensas para optimizar la precisión.
- Robótica doméstica: ejecución de tareas como recoger objetos o abrir puertas, con generalización a variaciones del entorno gracias a pi0.5.
- Investigación en aprendizaje por refuerzo: sirve como punto de partida para estudiar el impacto del RABC en la calidad de políticas robóticas.
- Desarrollo de sistemas de control basados en VLA: integrable en pipelines de simulación y despliegue real mediante openpi.
- Benchmarking de métodos de alineación: permite comparar RABC frente a clonación de comportamiento estándar en tareas del `icl-dataset`.
- Prototipado de robots con aprendizaje continuo: al ser un checkpoint intermedio, puede usarse para explorar estrategias de fine-tuning adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K, ya que se trata de un modelo de control robótico, no de lenguaje general. Tampoco se reportan tasas de éxito en tareas robóticas específicas.

## Requisitos de hardware

- VRAM estimada: no disponible, pero dado el tamaño del repositorio (12,4 GB) y la naturaleza de los VLA, se requiere al menos una GPU con 24 GB de VRAM para inferencia en precisión completa.
- GPU recomendadas: se sugiere una NVIDIA RTX 4090 (24 GB) para pruebas locales, o GPUs de datacenter como A100 (40/80 GB) o H100 para despliegue en producción.
- Compatibilidad con consumer GPU: posible con cuantización, aunque no se especifican formatos de cuantización disponibles.
- Opciones de despliegue: openpi (framework oficial), y potencialmente vLLM o TGI si se adapta a formatos estándar, aunque no se confirma.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yor_icl_pi05_rabc (este) | pi0.5 | no disponible | no disponible | no disponible | HuggingFace |
| pi0.5 (Physical Intelligence) | pi0 | no publicado | no publicado | no disponible | Repos oficiales |
| pi0 (Physical Intelligence) | - | no publicado | no publicado | no disponible | Repos oficiales |

No se dispone de datos suficientes para una comparativa detallada con otros fine-tunings de pi0.5. La información pública sobre pi0.5 se limita al paper de arXiv, sin especificaciones técnicas completas.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo de control robótico, no se aplican los mismos riesgos de alucinación que en modelos de lenguaje, pero puede generar acciones subóptimas en situaciones fuera de su distribución de entrenamiento.
- Limitaciones de contexto: no se especifica la longitud de contexto, por lo que podría no manejar instrucciones muy largas o historiales extensos.
- Licencia: no disponible, lo que impide conocer restricciones de uso comercial o modificación.
- Dependencia del framework: el modelo está diseñado para openpi, lo que limita su portabilidad a otros entornos sin adaptación.
- Falta de estado de entrenamiento: el checkpoint no incluye `train_state`, por lo que no se puede reanudar el entrenamiento exacto desde este punto.
- Datos de entrenamiento: no se detalla la composición del `icl-dataset`, lo que dificulta evaluar posibles sesgos en las tareas aprendidas.

## Enlaces

- HuggingFace: https://huggingface.co/lair-nyu/yor_icl_pi05_rabc
- Paper de pi0.5: https://arxiv.org/abs/2504.16054
- Repositorio openpi: https://github.com/Physical-Intelligence/openpi
- Perfil de LAIR NYU: https://huggingface.co/lair-nyu

# eddykang06/qwen3.5-4b-pear-libero-opd

## Resumen

Qwen3.5-4B-PEAR-LIBERO-OPD es un ajuste fino del modelo Qwen3.5-4B de Alibaba (familia Qwen), publicado por el usuario eddykang06 en Hugging Face y orientado a robótica, concretamente al benchmark LIBERO. El modelo se ha entrenado mediante destilación on-policy (OPD, *on-policy distillation*) con divergencia KL inversa y cálculo por token, partiendo del checkpoint de SFT y tomando como profesor el modelo Qwen3.8-27B-PEAR-LIBERO_only del MIT HAN Lab, ejecutado en modo *xhigh effort*.

La relevancia del modelo es acotada pero específica: demuestra una técnica de destilación de un modelo profesor grande (27B) hacia un modelo alumno pequeño (4B) para tareas de manipulación robótica evaluadas en LIBERO, un conjunto de tareas estándar en investigación de robótica. Forma parte del proyecto robot-distillation, lo que lo convierte en una pieza reproducible dentro de una línea de trabajo sobre destilación aplicada a políticas robóticas.

Conviene señalar que la model card indica explícitamente "Not uploaded yet", es decir, que en el momento de la publicación de la ficha los pesos no están disponibles. El modelo tiene cero descargas y cero likes, y no se han publicado especificaciones detalladas, benchmarks ni datos de licencia o idiomas. La ficha siguiente refleja fielmente esa escasez de información, marcando como "no disponible" todo aquello que el autor no ha documentado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base Qwen3.5-4B; arquitectura del base no documentada en la información proporcionada) |
| Parametros totales | No disponible (el identificador del modelo sugiere 4B, pero no se confirma en la model card) |
| Parametros activos | No aplica / no disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible (los pesos aún no se han subido según la model card) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un modelo de la familia Qwen 3.5 de Alibaba, y se ajusta mediante destilación on-policy con divergencia KL inversa calculada por token. El profesor es Qwen3.8-27B-PEAR-LIBERO_only, un modelo del MIT HAN Lab especializado en LIBERO, ejecutado con *xhigh effort*. El entrenamiento se inicia desde el checkpoint de SFT, no desde el modelo base sin ajustar, lo que implica una cadena de entrenamiento en dos fases: primero SFT y después destilación on-policy.

Los datos de destilación proceden del dataset eddykang06/qwen3.8-27b-pear-libero-rollouts, que contiene las trayectorias generadas por el profesor durante la destilación. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas adicionales de RLHF o DPO. Tampoco se documentan innovaciones arquitectónicas propias: el modelo hereda la arquitectura del base Qwen3.5-4B y la innovación reside en el procedimiento de destilación (OPD con KL inversa por token) más que en el diseño del modelo. El proyecto robot-distillation, enlazado en la model card, es el marco reproducible de este entrenamiento.

## Capacidades

- Generación de texto y razonamiento heredados del modelo base Qwen3.5-4B, aunque no se documentan capacidades específicas del ajuste.
- Especialización en robótica: el ajuste está orientado a tareas del benchmark LIBERO, que evalúa manipulación de objetos en entornos simulados.
- Destilación de políticas: el modelo actúa como alumno de un profesor de 27B especializado en LIBERO, por lo que se espera que reproduzca el comportamiento de este en ese dominio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación en destilación de políticas robóticas: el modelo sirve como referencia reproducible para estudiar cómo un alumno de 4B aproxima a un profesor de 27B en tareas LIBERO, usando el dataset de rollouts publicado.
- Evaluación de manipulación en LIBERO: se puede emplear para medir la tasa de éxito en las tareas de manipulación de LIBERO y comparar el efecto de la destilación on-policy frente al SFT inicial.
- Reproducción del pipeline robot-distillation: el modelo encaja en el repositorio del proyecto para replicar el entrenamiento con KL inversa por token y validar los resultados del autor.
- Baseline para comparativas de tamaño: al ser un alumno de 4B derivado de un profesor de 27B, resulta útil como baseline en estudios sobre el compromiso entre tamaño y rendimiento en políticas robóticas.
- Experimentos de destilación con datos on-policy: el dataset de rollouts permite analizar la calidad de las trayectorias del profesor y su influencia en el alumno.
- Docencia y divulgación técnica: sirve como ejemplo didáctico de destilación con divergencia KL inversa aplicada a un dominio concreto, siempre que los pesos estén finalmente disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como referencia orientativa, un modelo de 4B en precisión FP16 requiere aproximadamente 8 GB de VRAM solo para los pesos, y en cuantización de 4 bits en torno a 2-3 GB, pero estos cálculos no están confirmados por el autor.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No confirmado; por tamaño (4B) sería plausible en GPUs de consumo con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: no disponible (no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-PEAR-LIBERO-OPD | No disponible (identificador sugiere 4B) | No disponible | No disponible | No disponible | Pesos no subidos según la model card |
| Qwen3.8-27B-PEAR-LIBERO_only (profesor) | 27B (según identificador) | No disponible | No disponible | No disponible | Referenciado en Hugging Face (mit-han-lab) |
| Qwen3.5-4B (base) | 4B (según identificador) | No disponible | No disponible | No disponible | Disponible en Hugging Face (Qwen) |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparados en la información proporcionada, por lo que la comparativa se limita a parámetros y disponibilidad.

## Limitaciones y advertencias

- Pesos no disponibles: la model card indica "Not uploaded yet", por lo que el modelo no puede descargarse ni evaluarse en el momento de redactar esta ficha.
- Licencia no especificada: no se indica la licencia, lo que impide determinar si el uso comercial está permitido; además, la licencia del modelo base Qwen3.5-4B condiciona cualquier uso derivado.
- Idiomas no documentados: no se especifican los idiomas soportados, lo que limita su uso en aplicaciones multilingües.
- Dominio muy restringido: el ajuste está orientado a LIBERO y robótica simulada; su comportamiento fuera de ese dominio no está documentado.
- Riesgo de alucinación: no evaluado en la información proporcionada.
- Sesgos conocidos: no documentados.
- Sin benchmarks: no hay métricas publicadas que permitan validar la calidad del ajuste ni compararlo con alternativas.
- Madurez del proyecto: cero descargas y cero likes, publicación reciente y sin validación externa, lo que desaconseja su uso en producción sin una evaluación propia.
- Dependencia del profesor: el rendimiento del alumno está acotado por la calidad de las trayectorias del profesor Qwen3.8-27B-PEAR-LIBERO_only y del dataset de rollouts.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eddykang06/qwen3.5-4b-pear-libero-opd
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Profesor Qwen3.8-27B-PEAR-LIBERO_only: https://huggingface.co/mit-han-lab/Qwen3.8-27B-PEAR-LIBERO_only
- Dataset de rollouts: https://huggingface.co/datasets/eddykang06/qwen3.8-27b-pear-libero-rollouts
- Repositorio robot-distillation: https://github.com/ericjkge/robot-distillation

# eddykang06/qwen3.5-9b-pear-libero-opd-compressed

## Resumen

Qwen3.5-9B-PEAR-LIBERO-OPD-Compressed es un ajuste fino del modelo Qwen/Qwen3.5-9B, desarrollado por el usuario eddykang06, orientado a robótica y, más concretamente, al benchmark LIBERO. El modelo parte de un checkpoint previo de SFT con compresión de razonamiento y se entrena después mediante destilación on-policy (OPD) con divergencia KL inversa por token, tomando como profesor el modelo Qwen3.8-27B-PEAR-LIBERO_only en su configuración de esfuerzo xhigh. Forma parte del proyecto robot-distillation.

La propuesta técnica es doble: por un lado, trasladar a un modelo de 9 000 millones de parámetros las capacidades de planificación y razonamiento de un profesor de 27 000 millones en tareas de manipulación robótica; por otro, comprimir la cadena de razonamiento para reducir latencia y coste de inferencia sin perder precisión en las tareas del benchmark LIBERO. El resultado es un modelo de tipo pipeline "robotics" pensado para generar acciones o planes a partir de observaciones e instrucciones en lenguaje natural.

El modelo se publicó el 26 de noviembre de 2026 y, en el momento de redactar esta ficha, no acumula descargas ni interacciones en Hugging Face. La model card indica explícitamente que los pesos aún no se han subido al repositorio, por lo que la disponibilidad práctica del artefacto es nula de momento. No se dispone de información sobre licencia, idiomas soportados ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-9B); detalles específicos no disponibles |
| Parametros totales | 9 000 millones (según el nombre del modelo y el modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (pesos aún no subidos según la model card) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-9B, un transformer decoder-only de aproximadamente 9 000 millones de parámetros. Sobre esa base se aplica un primer ajuste fino supervisado (SFT) con compresión de razonamiento, cuyo objetivo es acortar las cadenas de razonamiento del modelo manteniendo la capacidad de resolución. Posteriormente se realiza una destilación on-policy (OPD) con divergencia KL inversa calculada por token, usando como profesor Qwen3.8-27B-PEAR-LIBERO_only en modo xhigh effort. El conjunto de datos de destilación son los rollouts generados por el profesor, publicados en el dataset eddykang06/qwen3.8-27b-pear-libero-rollouts.

La innovación principal es la combinación de compresión de razonamiento y destilación on-policy en el dominio de robótica: el alumno de 9B aprende a imitar la distribución del profesor de 27B sobre sus propias trayectorias (no solo sobre datos estáticos), lo que en teoría reduce el sesgo de exposición y mejora la robustez en tareas de manipulación del benchmark LIBERO. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas adicionales de RLHF o DPO. Tampoco se detallan innovaciones de inferencia como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento de tipo cadena de pensamiento, con cadenas comprimidas por el SFT previo.
- Razonamiento orientado a robótica: planificación de acciones y secuencias de manipulación en el entorno LIBERO.
- Ejecución de tareas del benchmark LIBERO a partir de instrucciones en lenguaje natural y observaciones.
- Destilación de comportamiento desde un profesor de mayor tamaño (27B), lo que puede transferir estrategias de planificación más ricas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: presumible por el uso de cadenas de razonamiento, pero no confirmado explícitamente.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (visión, audio, thinking mode): no disponibles; el pipeline declarado es "robotics".

## Casos de uso

- Manipulación robótica en simulación LIBERO: el modelo puede generar planes de acción para tareas de apilamiento, apertura de cajones o colocación de objetos, aprovechando el ajuste específico sobre este benchmark.
- Evaluación de destilación de razonamiento: sirve como referencia para estudiar si un alumno de 9B puede igualar a un profesor de 27B en tareas de robótica con cadenas de razonamiento comprimidas.
- Generación de trayectorias de entrenamiento: los rollouts del modelo pueden usarse para aumentar datos en pipelines de imitación o RL para políticas robóticas.
- Prototipado de asistentes de planificación para robots de bajo coste: al ser un modelo de 9B, es viable en GPUs de gama alta de consumo, lo que facilita iteración rápida en laboratorios con recursos limitados.
- Investigación en compresión de razonamiento: permite comparar la calidad de las cadenas de razonamiento antes y después del SFT de compresión en tareas de control.
- Base para ajuste fino en dominios robóticos específicos: al derivar de Qwen3.5-9B, puede servir como punto de partida para tareas de manipulación fuera de LIBERO, aunque requeriría validación adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un transformer de 9B, en FP16 se necesitarían aproximadamente 18 GB de VRAM solo para pesos, más overhead de activaciones y KV cache; en cuantización de 8 bits, unos 9-10 GB; en 4 bits, unos 5-6 GB. Estas cifras son estimaciones genéricas, no datos del autor.
- GPU recomendadas: no disponibles. Por tamaño, cabría esperar compatibilidad con A100, H100, L40S y RTX 4090 en FP16; en cuantizaciones bajas podría ejecutarse en RTX 3090, 4080 o similares.
- ¿Cabe en GPU de consumo? Probablemente sí en cuantización de 8 o 4 bits, pero no confirmado por el autor.
- Opciones de despliegue: no disponibles. Por herencia de Qwen3.5-9B, serían plausibles vLLM, TGI, llama.cpp u Ollama, pero no hay confirmación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-9b-pear-libero-opd-compressed | 9B | no disponible | Robótica (LIBERO) | no disponible | Pesos no subidos |
| Qwen/Qwen3.5-9B (base) | 9B | no disponible | Generalista | no disponible | Disponible en HF |
| Qwen3.8-27B-PEAR-LIBERO_only (profesor) | 27B | no disponible | Robótica (LIBERO) | no disponible | Disponible en HF |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Pesos no publicados: la model card indica "Not uploaded yet", por lo que el modelo no es utilizable actualmente.
- Licencia no especificada: no se puede confirmar si permite uso comercial; hereda posiblemente las restricciones de Qwen3.5-9B, pero no está documentado.
- Especialización estrecha: el ajuste está orientado al benchmark LIBERO; el rendimiento fuera de ese dominio no está validado y podría degradarse respecto al modelo base.
- Riesgo de alucinación: como todo modelo generativo, puede producir planes de acción inviables o instrucciones incorrectas en entornos reales; requiere validación en simulación antes de desplegar en hardware físico.
- Sesgos: no documentados; al derivar de Qwen3.5-9B, podría heredar sesgos del modelo base y del dataset de rollouts del profesor.
- Idiomas: no confirmados; la model card está en inglés y no se especifica cobertura multilingüe.
- Contexto: no disponible; no se puede garantizar el manejo de observaciones o historiales largos.
- Reproducibilidad: al no publicarse los pesos ni los detalles completos del entrenamiento (hiperparámetros, número de tokens), la replicación es limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eddykang06/qwen3.5-9b-pear-libero-opd-compressed
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Profesor: https://huggingface.co/mit-han-lab/Qwen3.8-27B-PEAR-LIBERO_only
- Dataset de rollouts: https://huggingface.co/datasets/eddykang06/qwen3.8-27b-pear-libero-rollouts
- Repositorio del proyecto: https://github.com/ericjkge/robot-distillation

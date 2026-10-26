# Songyuan666/TC-pi0.5

## Resumen

TC-π0.5 es un modelo de visión-lenguaje-acción (VLA) para robótica, publicado por el usuario Songyuan666 en HuggingFace. Se distribuye como un conjunto de pesos versionados para el repositorio `susongyuan/TC-pi0.5` y está orientado a tareas de manipulación del benchmark BEHAVIOR. El modelo parte de π0.5-behaviour-base (PT50) y añade un ajuste fino completo para la tarea `cook_hot_dogs`, con una variante que combina entrada RGB y grafos oracle.

La relevancia actual del modelo es acotada pero concreta: permite reproducir y comparar una política VLA fine-tuneada sobre una base π0.5 en el entorno BEHAVIOR, usando el dataset `behavior-1k/2025-challenge-demos`. En la evaluación publicada, TC-π0.5 obtiene 5/10 éxitos (50%) frente a 2/10 (20%) del modelo base PT50 con entrada RGB, sobre las instancias públicas 301–310, semilla de acción 42 y chunk 32.

No se detallan en la información disponible la arquitectura interna, el número de parámetros, la longitud de contexto ni la licencia. El repositorio de pesos ocupa 14,7 GB e incluye varios checkpoints y assets compartidos, por lo que su evaluación requiere revisar el repositorio de código asociado y los términos upstream de π0.5.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Visión-lenguaje-acción (VLA) basada en π0.5; no se detallan capas, atención ni parámetros en la información disponible |
| Parámetros totales | No disponible; el repositorio de pesos ocupa 14,7 GB, pero incluye varios checkpoints y assets, por lo que no equivale directamente al número de parámetros |
| Parámetros activos | No disponible; no se indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible; el asset compartido es el tokenizer de PaliGemma |
| Licencia | No disponible; sujeto a los términos upstream de π0.5 y openpi |
| Formato de pesos | safetensors; repositorio PyTorch |
| Pipeline | robotics |
| Dataset de entrenamiento | behavior-1k/2025-challenge-demos |
| Cobertura de tareas | Checkpoint base: 50 tareas BEHAVIOR; checkpoint fine-tuned: `cook_hot_dogs` |
| Tamaño del repositorio | 14,7 GB |
| Fecha de creación | 2026-10-26 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible describe TC-π0.5 como un modelo VLA derivado de π0.5, con un checkpoint base denominado `π0.5-behaviour-base` (PT50) y un ajuste fino completo para la tarea `cook_hot_dogs`. El repositorio incluye además un asset común con el tokenizer de PaliGemma. No se especifican en la model card el número de capas, el mecanismo de atención, el número total de parámetros ni la composición exacta del dataset de entrenamiento.

El checkpoint seleccionado es `cook_hot_dogs/step5000`, correspondiente a 4970 actualizaciones formales × 48 secuencias, aproximadamente 4,613 épocas. La evaluación publicada usa las instancias públicas 301–310, semilla de acción 42, chunk 32, terminación oficial de tarea y Q. La variante TC-π0.5 evaluada incorpora RGB y grafos oracle con ajuste fino completo, y se compara contra el modelo base PT50 con entrada RGB.

## Capacidades

- Control robótico de manipulación para tareas del benchmark BEHAVIOR, en concreto la tarea `cook_hot_dogs`.
- Percepción visual mediante entrada RGB.
- Uso de grafos oracle como entrada adicional en la variante evaluada con mejor rendimiento.
- Generación de acciones en fragmentos de 32 pasos (chunk 32).
- Ajuste fino completo sobre π0.5-behaviour-base.
- Cobertura de 50 tareas BEHAVIOR en el checkpoint base; el checkpoint fine-tuned está especializado en `cook_hot_dogs`.
- Tokenizer PaliGemma compartido como asset de inferencia.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking.
- No se documentan capacidades multilingües.

## Casos de uso

- Investigación en manipulación robótica: permite evaluar una política VLA fine-tuneada sobre π0.5 en la tarea `cook_hot_dogs` dentro de BEHAVIOR, usando las instancias públicas y la configuración de evaluación reportada.
- Reproducción de experimentos: el repositorio incluye el checkpoint `step5000`, el modelo base PT50 y el tokenizer compartido, lo que facilita repetir la comparación entre RGB y RGB + grafos oracle.
- Estudio del efecto de entradas estructuradas: la comparación entre PT50 con RGB y TC-π0.5 con RGB + grafos oracle permite analizar cuánto aporta la información de grafos en una tarea de cocina.
- Fine-tuning de políticas VLA: sirve como punto de partida para ajustar un modelo π0.5 a otras tareas de manipulación con el dataset `behavior-1k/2025-challenge-demos`.
- Integración en pipelines de investigación con PyTorch: el modelo se distribuye en safetensors y está pensado para ejecutarse mediante el repositorio de código asociado, no como un modelo de texto convencional.
- Evaluación comparativa de checkpoints: al conservar pesos, configuración, normalización y metadatos originales, permite analizar el impacto del checkpoint `step5000` frente a otras iteraciones.
- Docencia y aprendizaje sobre VLA: adecuado para estudiar el flujo completo de un modelo visión-lenguaje-acción en robótica, desde la carga de pesos hasta la evaluación de éxito de tarea.

## Benchmarks y rendimiento

Evaluación publicada sobre las instancias públicas 301–310, semilla de acción 42, chunk 32, terminación oficial de tarea y Q.

| Modelo / entrada | Éxito | Q medio |
|---|---:|---:|
| PT50 base / RGB | 2/10 (20%) | 0,20 |
| TC-π0.5 / RGB + grafos oracle, fine-tuning completo | 5/10 (50%) | 0,55 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de texto en la información disponible. La evaluación disponible es específica de robótica y se limita a 10 instancias públicas de una única tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio de pesos ocupa 14,7 GB e incluye varios checkpoints y assets; la VRAM necesaria dependerá del checkpoint cargado y de la precisión utilizada.
- GPU recomendadas: no disponible.
- GPU consumer: no confirmado. Por el tamaño del repositorio, no es probable que el conjunto completo de checkpoints quepa en GPUs consumer de gama baja, pero no hay datos oficiales de VRAM para una sola copia en inferencia.
- Opciones de despliegue: PyTorch mediante el repositorio `susongyuan/TC-pi0.5`; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.
- Almacenamiento: al menos 14,7 GB para el repositorio completo; el checkpoint concreto puede ocupar menos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en la evaluación publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TC-π0.5 | No disponible | No disponible | 5/10 (50%), Q medio 0,55 | No disponible | HuggingFace `Songyuan666/TC-pi0.5` |
| π0.5-behaviour-base (PT50) | No disponible | No disponible | 2/10 (20%), Q medio 0,20 | No disponible; términos upstream | Incluido en el repositorio de TC-π0.5 |
| Otras alternativas VLA para BEHAVIOR | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

La comparación directa disponible se limita al modelo base PT50. No se han encontrado en la información proporcionada datos de parámetros, contexto o licencia para TC-π0.5 ni para alternativas comparables.

## Limitaciones y advertencias

- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Además, los términos upstream de π0.5 y openpi siguen siendo aplicables.
- Evaluación muy reducida: 10 instancias públicas y una sola tarea (`cook_hot_dogs`), por lo que los resultados no permiten extrapolar rendimiento general en BEHAVIOR.
- Dependencia de grafos oracle: el mejor resultado reportado usa RGB + grafos oracle; no se informa del rendimiento sin esa entrada adicional.
- Sesgos conocidos: no documentados. Al entrenarse con `behavior-1k/2025-challenge-demos`, puede heredar sesgos de la distribución de ese dataset.
- Riesgo de alucinación: no aplica de forma directa como en modelos de texto; en un VLA el riesgo equivalente es generar acciones incorrectas o inseguras en el robot.
- Limitaciones de contexto e idioma: no disponibles. No se documentan idiomas soportados ni longitud de contexto.
- Caveat de producción: no hay documentación sobre latencia, throughput, cuantización, despliegue en servidores de inferencia ni estabilidad fuera del benchmark.
- Validación externa limitada: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se han publicado resultados de benchmarks adicionales.
- Seguridad física: cualquier uso en un robot real requiere validación independiente de políticas de seguridad, límites de movimiento y supervisión humana.

## Enlaces

- [HuggingFace: Songyuan666/TC-pi0.5](https://huggingface.co/Songyuan666/TC-pi0.5)
- [Repositorio GitHub: susongyuan/TC-pi0.5](https://github.com/susongyuan/TC-pi0.5)
- [Repositorio base: sunshk/openpi_comet_pytorch](https://github.com/sunshk/openpi_comet_pytorch)
- [Commit base fijado: 5a489fe50fdc8e256533c8c611dfd60c247520cf](https://github.com/sunshk/openpi_comet_pytorch/tree/5a489fe50fdc8e256533c8c611dfd60c247520cf)
- [Dataset: behavior-1k/2025-challenge-demos](https://huggingface.co/datasets/behavior-1k/2025-challenge-demos)

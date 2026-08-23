# Mahesh111000/qwen3-8b-hanabi-tinker-step105

## Resumen

El modelo `Mahesh111000/qwen3-8b-hanabi-tinker-step105` es un fine-tuning del modelo base `Qwen/Qwen3-8B-Base` (8.190 millones de parámetros) realizado por Mahesh111000. El objetivo del entrenamiento es mejorar las capacidades del modelo en el juego cooperativo Hanabi, un problema clásico de razonamiento con información imperfecta y coordinación entre agentes. El autor ha publicado varios checkpoints experimentales con distintos métodos de aprendizaje por refuerzo (GRPO, RL genérico) y este en particular corresponde al paso 105 de un proceso que denomina "tinker", aunque no se han documentado los detalles del algoritmo ni la configuración exacta del entrenamiento.

Este modelo es relevante para la comunidad de investigación en IA porque explora la aplicación de LLMs de 8B parámetros a tareas de seguimiento de creencias y valoración de movimientos en entornos multiagente, un dominio donde los modelos de lenguaje grandes tradicionalmente no destacan. Al estar basado en Qwen3-8B, hereda su arquitectura densa con atención GQA y su ventana de contexto de 32.768 tokens, ampliable a 131.072 mediante YaRN. El fine-tuning se ha realizado sobre el modelo base sin capa de instrucción, por lo que no es un modelo de chat al uso sino un modelo orientado a tareas específicas.

La licencia Apache 2.0 permite uso comercial y modificación, lo que facilita su integración en proyectos propios. Sin embargo, al ser un checkpoint de investigación sin documentación adicional, debe tratarse como una base experimental más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B) con atención GQA (32 cabezas Q, 8 KV) |
| Parametros totales | 8.190.735.360 (8,19 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens nativo, 131.072 con YaRN |
| Tipos de cuantizacion | No disponible (solo safetensors en bf16) |
| Idiomas soportados | No disponible (el modelo base Qwen3 soporta mas de 100 idiomas y dialectos, pero este fine-tuning no especifica su cobertura) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3-8B-Base`, un transformer causal denso de 36 capas con atención de consulta agrupada (GQA), 32 cabezas de consulta y 8 cabezas de clave/valor. El contexto nativo es de 32.768 tokens y se puede extender a 131.072 con interpolación YaRN. El modelo base fue entrenado en un corpus multilingüe de gran tamaño con técnicas de pre-entrenamiento y post-entrenamiento, incluyendo alineación por preferencias humanas (RLHF/DPO) en su variante instruct, aunque aquí se usa la variante base sin capa de instrucción.

El fine-tuning se ha realizado mediante aprendizaje por refuerzo sobre la tarea de Hanabi, que consiste en que un agente debe inferir el estado de las manos de otros jugadores a partir de pistas parciales y coordinar acciones para completar una baraja de fuegos artificiales. El autor no ha documentado el algoritmo exacto de RL empleado para este checkpoint (el nombre "tinker" no corresponde a ningún método publicado), aunque en otros modelos del mismo autor se menciona GRPO y RL genérico con recompensa de validación. El objetivo del entrenamiento es el seguimiento de estados de creencia (belief-state tracking) y la valoración de movimientos (move rating). No se han publicado datos sobre el número de tokens de entrenamiento, la composición del dataset ni el proceso de validación específico de este checkpoint.

## Capacidades

- Razonamiento con información imperfecta: el modelo está especializado en inferir el estado de creencias de otros agentes en el juego Hanabi, lo que implica razonar sobre información parcial y acciones observadas.
- Valoración de movimientos: capaz de evaluar la calidad de acciones en entornos cooperativos con incertidumbre, probablemente produciendo puntuaciones o rankings de movimientos.
- Generación de texto y razonamiento general: hereda las capacidades del modelo base Qwen3-8B, incluyendo generación de texto, razonamiento lógico, matemáticas y código, aunque estas capacidades pueden haberse degradado por el fine-tuning especializado.
- Modo de pensamiento: el modelo base Qwen3 soporta el cambio entre modo de pensamiento (thinking) y modo sin pensamiento, pero no se ha verificado si este fine-tuning preserva ese comportamiento.
- Capacidades multilingües: no confirmadas para este fine-tuning, aunque el modelo base soporta más de 100 idiomas.
- Soporte de tool calling y agentes: no se ha documentado para este checkpoint; el modelo base tiene capacidades de integración con herramientas, pero no se sabe si el fine-tuning las ha preservado.

## Casos de uso

- Investigación en juegos cooperativos: como entorno de evaluación para estudiar cómo los LLM pueden razonar sobre estados inciertos en juegos como Hanabi, permitiendo comparar el rendimiento de este checkpoint con otros métodos de RL (GRPO, RL genérico) en el mismo dominio.
- Entrenamiento de agentes para Hanabi: el modelo puede integrarse como módulo de seguimiento de creencias en un pipeline de decisión para jugar Hanabi, proporcionando estimaciones de las manos de los otros jugadores basadas en pistas y acciones.
- Desarrollo de técnicas de RL para LLM: sirve como referencia para investigar cómo diferentes algoritmos de aprendizaje por refuerzo (tinker vs. GRPO) afectan al rendimiento en tareas de razonamiento con incertidumbre.
- Evaluación de robustez de capacidades generales: permite estudiar cuánto se degradan las capacidades generales de un modelo base tras un fine-tuning especializado, un problema relevante para el desarrollo de sistemas híbridos.
- Generación de texto en entornos controlados: dado que el modelo es un fine-tuning del base, puede utilizarse en tareas de generación de texto cuando se requiera un modelo con sesgo hacia el razonamiento lógico, aunque con rendimiento no garantizado.
- Benchmark de razonamiento bajo incertidumbre: como punto de comparación en benchmarks de razonamiento con información parcial, no solo en Hanabi sino en otras tareas de diagnóstico o predicción con datos incompletos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para este modelo específico. En la información disponible no se incluyen puntuaciones en MMLU, HumanEval, GSM8K ni en el propio entorno de Hanabi para este checkpoint. El único dato numérico es la recompensa de validación del checkpoint `hanabi-qwen3-8b-rl-step100` (1,3429), que no es este modelo. No hay datos comparativos con otros modelos similares.

## Requisitos de hardware

- El modelo tiene 8,19B parámetros; en precisión bf16 (como se encuentra en el repositorio) ocupa aproximadamente 16,4 GB en disco, y la VRAM necesaria para inferencia sin cuantizar es de unos 16-20 GB (según la longitud de la secuencia).
- GPU recomendadas: NVIDIA A100 (40 GB), A100 80 GB, H100, RTX 4090 (24 GB), RTX 6000 Ada, o cualquier GPU con al menos 24 GB de VRAM para inferencia en bf16.
- En cuantización de 8 bits (int8) el modelo puede ejecutarse en GPUs con 8-10 GB de VRAM (por ejemplo, RTX 3080, RTX 4060 Ti 16 GB). En cuantización de 4 bits (int4) se reduce a unos 4-6 GB, pudiendo correr en tarjetas como RTX 3060 12 GB o RTX 4060 8 GB.
- Se puede desplegar con vLLM (versión >=0.8.5), SGLang (>=0.4.6.post1), llama.cpp, Ollama o TGI. El repositorio de HuggingFace indica compatibilidad con text-generation-inference.
- La latencia y el throughput no están publicados para este checkpoint, pero al ser un modelo denso de 8B, en una A100 se pueden esperar velocidades de decodificación del orden de 50-100 tokens/s en bf16, y mayores en cuantización.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente con alternativas. Sin embargo, se pueden comparar características técnicas:

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| Mahesh111000/qwen3-8b-hanabi-tinker-step105 | 8,19 B | 32.768 (131k con YaRN) | Apache-2.0 | Fine-tuning RL en Hanabi |
| Mahesh111000/qwen3-8b-hanabi-grpo-step_101 | 8,19 B | 32.768 (131k con YaRN) | Apache-2.0 | Fine-tuning GRPO en Hanabi |
| Mahesh111000/hanabi-qwen3-8b-rl-step100 | 8,19 B | 32.768 (131k con YaRN) | Apache-2.0 | Fine-tuning RL en Hanabi (reward validación 1,3429) |
| Qwen/Qwen3-8B-Base | 8,19 B | 32.768 (131k con YaRN) | Apache-2.0 | Modelo base general |

No hay modelos comparables de otros autores para la tarea de Hanabi con LLM de 8B en este momento. El rendimiento de cada checkpoint solo puede evaluarse mediante el entorno de Hanabi, del que no se publican resultados para este modelo.

## Limitaciones y advertencias

- Es un modelo de investigación: no se ha documentado el proceso de entrenamiento, los hiperparámetros ni la configuración del algoritmo "tinker", lo que dificulta reproducir o comprender su comportamiento.
- Puede sufrir alucinaciones, especialmente en tareas generales de texto, al estar entrenado con RL sobre un juego específico.
- El fine-tuning ha podido degradar las capacidades generales del modelo base (razonamiento, código, matemáticas), por lo que no debe usarse como sustituto de Qwen3-8B-Instruct en aplicaciones generales.
- No se ha validado su comportamiento en otros idiomas; aunque el modelo base es multilingüe, el entrenamiento específico puede haber afectado a la calidad en idiomas distintos del inglés.
- El modelo no tiene una capa de instrucción, por lo que no sigue instrucciones ni formatos de chat de forma nativa; se requiere aplicar el chat template de Qwen3 si se usa como conversacional.
- No se ha verificado la licencia de los datos de entrenamiento; la licencia Apache-2.0 del modelo base se hereda, pero el autor no especifica si los datos de Hanabi tienen restricciones adicionales.
- Para producción, no se recomienda su uso sin una evaluación exhaustiva en el dominio objetivo, y es preferible optar por los modelos instructivos de Qwen3 si se necesita un asistente general.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Mahesh111000/qwen3-8b-hanabi-tinker-step105
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B-Base
- Otros checkpoints del autor: https://huggingface.co/Mahesh111000/qwen3-8b-hanabi-grpo-step_101 y https://huggingface.co/Mahesh111000/hanabi-qwen3-8b-rl-step100
- Repositorio de Qwen3: https://github.com/QwenLM/Qwen3
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Documentación de Qwen: https://qwen.readthedocs.io/en/latest/

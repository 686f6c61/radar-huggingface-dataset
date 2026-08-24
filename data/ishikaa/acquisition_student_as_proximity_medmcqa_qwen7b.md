# ishikaa/acquisition_student_AS_proximity_medmcqa_qwen7b

## Resumen

`ishikaa/acquisition_student_AS_proximity_medmcqa_qwen7b` es un modelo de generación de texto basado en la arquitectura Qwen2, con 7.615.616.512 parámetros (~7,6 mil millones), ajustado mediante fine-tuning supervisado (SFT) sobre el conjunto de datos MedMCQA, un benchmark de preguntas de opción múltiple en el ámbito médico. El modelo ha sido desarrollado por la usuaria ishikaa y forma parte de una serie de experimentos sobre estrategias de adquisición de datos en el ajuste fino de modelos de lenguaje para dominios especializados.

La ficha técnica del modelo en Hugging Face es mínima: la mayor parte de los campos de la model card están marcados como «[More Information Needed]», por lo que no se dispone de documentación pública sobre el proceso de entrenamiento, los hiperparámetros utilizados o los datos de evaluación. El nombre del modelo sugiere que se ha aplicado una estrategia de selección de ejemplos basada en proximidad (AS_proximity) sobre el conjunto de entrenamiento de MedQA, aunque no se aporta detalle alguno sobre el método exacto.

Este modelo no ha recibido descargas ni votos en la plataforma, y su fecha de creación es el 23 de agosto de 2026. Aunque técnicamente es un modelo de texto con la misma base que Qwen2 7B, su utilidad práctica queda limitada por la ausencia de documentación, de métricas de rendimiento y de una licencia especificada. Se trata de un artefacto experimental orientado a la investigación sobre adquisición de datos, no un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformers) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Qwen2 7B base soporta 32.768 tokens, no confirmado en este fine-tune) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2 7B, un transformer decoder-only con atención causal, publicado por Alibaba Cloud. El modelo fue ajustado mediante SFT (supervised fine-tuning) usando la librería TRL de Hugging Face, como indican las etiquetas `trl` y `sft`. El dataset de entrenamiento es MedQA (también conocido como MedMCQA), un corpus de preguntas de opción múltiple de exámenes médicos en inglés.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, la estrategia de muestreo, la duración del ajuste ni los hiperparámetros utilizados (tasa de aprendizaje, batch size, épocas, etc.). El nombre del modelo sugiere que se aplicó una estrategia de adquisición de datos basada en proximidad (`AS_proximity`), pero el mecanismo concreto no está documentado.

## Capacidades

- Generación de texto en formato conversacional, al ser un modelo base de Qwen2 fine-tuneado.
- Respuesta a preguntas de opción múltiple de tipo médico (dominio MedMCQA), si el ajuste fue correcto.
- Capacidad de seguir instrucciones básicas gracias al SFT, aunque sin verificación pública.
- Soporte de tool calling: no disponible (no documentado).
- Capacidades de agente y razonamiento multi-paso: no disponibles.
- Capacidades multilingües: no documentadas (Qwen2 7B base soporta inglés y chino, pero el fine-tune puede alterar esto).
- Modo de pensamiento, visión o audio: no disponible.

## Casos de uso

- Investigación sobre estrategias de adquisición de datos: el modelo es un artefacto de experimentación para comparar métodos de selección de ejemplos de entrenamiento (proximidad vs. confianza vs. aleatoriedad) en el dominio médico.
- Evaluación de fine-tuning SFT en datasets de bajo dominio: permite estudiar cómo un modelo de 7B se adapta a un corpus especializado como MedQA cuando se entrena con un subconjunto seleccionado por proximidad.
- Prototipado de sistemas de preguntas y respuestas médicas: si el ajuste funciona, podría usarse en un entorno de investigación para responder preguntas tipo examen médico, aunque sin validación pública.
- Reproducción de experimentos académicos: otros investigadores pueden descargar los pesos y reproducir los resultados de la autora.
- Análisis de sesgos en modelos médicos: los pesos pueden servir para estudiar el comportamiento del modelo en preguntas de diagnóstico o tratamiento, aunque sin métricas de referencia.
- Comparación de estrategias de muestreo: junto con los otros modelos de la misma autora (confidence, random, original), permite comparar el impacto de la selección de datos en el rendimiento final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye ninguna métrica de evaluación, y no se ha encontrado documentación externa con resultados de MMLU, HumanEval, GSM8K o MedQA.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión fp16: aproximadamente 15 GB (7,6B parámetros × 2 bytes), más overhead de activaciones.
- Con cuantización INT4 (no disponible en este repo) cabría en una GPU de 8 GB, pero no se ofrecen pesos cuantizados.
- GPU recomendadas para inferencia completa: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB).
- En consumer GPU: RTX 3090 o RTX 4090 pueden ejecutar el modelo en fp16 si la longitud de contexto es moderada.
- Opciones de despliegue: el modelo es compatible con `text-generation-inference` (TGI) y `endpoints_compatible` según las etiquetas. También puede cargarse con transformers estándar, vLLM, llama.cpp (si se convierte a GGUF) u Ollama (tras conversión).
- Latencia y throughput: no disponibles. Con una RTX 4090, un modelo de 7B en fp16 suele generar entre 20 y 40 tokens por segundo, pero no se ha medido en este caso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ishikaa/acquisition_student_AS_proximity_medmcqa_qwen7b | 7,6B | no disponible | no disponible | Hugging Face |
| ishikaa/acquisition_student_AS_confidence_medmcqa_qwen7b | 7,6B | no disponible | no disponible | Hugging Face |
| ishikaa/acquisition_student_original_medmcqa_qwen7b | 7,6B | no disponible | no disponible | Hugging Face |
| Qwen2-7B (base) | 7,6B | 32.768 | Apache 2.0 | Hugging Face |
| Llama-3.1-8B | 8,0B | 131.072 | Llama 3.1 Community License | Hugging Face |

Los tres modelos de la misma autora comparten la misma arquitectura y tamaño, diferenciándose solo en la estrategia de adquisición de datos (proximidad, confianza, original). No hay comparativa de rendimiento disponible.

## Limitaciones y advertencias

- Model card vacía: no hay documentación sobre el proceso de entrenamiento, datos utilizados, hiperparámetros o evaluación. Cualquier uso en producción es arriesgado.
- Sin licencia especificada: el uso comercial no está autorizado explícitamente, y puede haber problemas legales si se redistribuye o se usa en productos.
- Riesgo de alucinación: al ser un modelo ajustado sobre un corpus médico, puede generar respuestas falsas o imprecisas sobre diagnósticos y tratamientos, lo que supone un riesgo para la salud si se usa sin supervisión humana.
- Sesgos conocidos: no se ha evaluado el modelo para sesgos de género, raza o socioeconómicos en el ámbito médico. El dataset MedQA puede contener sesgos inherentes de los exámenes médicos.
- Limitaciones de idioma: el dataset MedQA es en inglés, por lo que el modelo probablemente solo responde bien en inglés, aunque no se ha verificado.
- Contexto limitado: aunque Qwen2 7B base soporta 32.768 tokens, no se sabe si el fine-tune mantiene esta longitud. Se recomienda asumir la longitud del modelo base.
- Sin soporte de cuantización: el repositorio solo contiene pesos en safetensors, sin versiones GGUF o AWQ, lo que limita su despliegue en entornos con poca VRAM.

## Enlaces

- Hugging Face: https://huggingface.co/ishikaa/acquisition_student_AS_proximity_medmcqa_qwen7b
- Modelo de la misma autora (confidence): https://huggingface.co/ishikaa/acquisition_student_AS_confidence_medmcqa_qwen7b
- Modelo de la misma autora (original): https://huggingface.co/ishikaa/acquisition_student_original_medmcqa_qwen7b
- Modelo de la misma autora (random): https://huggingface.co/ishikaa/acquisition_student_random_medmcqa_qwen7b
- Modelo de la misma autora (3bins proximity): https://huggingface.co/ishikaa/acquisition_qwen3bins_medmcqa_proximity
- Referencia de cálculo de emisiones citada en la model card: https://arxiv.org/abs/1910.09700

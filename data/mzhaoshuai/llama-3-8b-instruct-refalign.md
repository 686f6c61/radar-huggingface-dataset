# mzhaoshuai/Llama-3-8B-Instruct-refalign

## Resumen

Llama-3-8B-Instruct-refalign es un ajuste fino del modelo meta-llama/Meta-Llama-3-8B-Instruct desarrollado por el autor mzhaoshuai (identificador en Hugging Face) dentro de la línea de trabajo RL2R (Reinforcement Learning with Reference-Based Rewards), anteriormente conocida como RefAlign. El modelo aplica aprendizaje por refuerzo con una función de recompensa basada en referencias (BERTScore) en lugar de un reward model entrenado aparte, con el objetivo de mejorar alineación y razonamiento sobre el modelo base sin degradar su capacidad generativa.

El modelo conserva la arquitectura del Llama 3 8B Instruct original (transformer decoder-only denso, 8.030.261.248 parámetros) y se distribuye en formato safetensors bajo licencia Llama 3. Su interés es principalmente metodológico: sirve como referencia reproducible de una técnica de RL alternativa a RLHF/DPO clásicos, entrenada sobre un subconjunto de UltraFeedback generado por Llama-3.3-70B-Instruct. El repositorio tiene un uso muy limitado (7 descargas, 0 likes en el momento de la consulta), por lo que debe considerarse un artefacto de investigación más que un modelo listo para producción.

No se dispone de información sobre idiomas soportados más allá de los inherentes al modelo base, ni de resultados de benchmarks publicados en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3), según modelo base |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Llama 3 8B Instruct soporta 8.192 tokens) |
| Tipos de cuantizacion | no disponible en la información proporcionada (el formato safetensors permite cuantización posterior a GGUF/AWQ/GPTQ, pero no se documenta en el repo) |
| Idiomas soportados | no disponible |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Meta-Llama-3-8B-Instruct, un transformer decoder-only denso de 8.030 millones de parámetros con atención causal estándar. El ajuste realizado por el autor no modifica la arquitectura: se aplica RL2R (Reinforcement Learning with Reference-Based Rewards), una variante de RL donde la recompensa se calcula mediante BERTScore contra una respuesta de referencia, en lugar de usar un reward model aprendido. La función de recompensa concreta usa el modelo bart-large-mnli como backbone de BERTScore.

Los hiperparámetros documentados en la model card son: learning rate 2,5e-6, batch size 512, 1 época, longitud de prompt 600 tokens, longitud de generación 1200 tokens, advantage clip 0,08 y K=2 generaciones muestreadas por prompt. El dataset de entrenamiento es mzhaoshuai/Llama-3.3-70B-Inst-awq_ultrafeedback_1in3, un subconjunto (1 de cada 3 ejemplos) de UltraFeedback con respuestas generadas por Llama-3.3-70B-Instruct cuantizado AWQ. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Llama 3 8B Instruct.
- Razonamiento y alineación mejorados mediante RL2R, orientados a respuestas más cercanas a referencias de alta calidad.
- Generación de código y matemáticas a nivel del modelo base (no se documentan mejoras específicas en estas áreas).
- Soporte de tool calling / function calling: no documentado en la información proporcionada para este ajuste.
- Soporte de agentes y razonamiento multi-paso: no documentado específicamente.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Investigación en métodos de RL para alineación: el modelo sirve como checkpoint reproducible para comparar RL2R frente a RLHF y DPO sobre el mismo base Llama 3 8B Instruct, usando los hiperparámetros publicados.
- Reproducción de experimentos académicos: permite validar los resultados del paper 2504.09895 con el dataset y la configuración exactos documentados en la model card.
- Evaluación de funciones de recompensa basadas en referencias: útil para estudiar cómo BERTScore (con bart-large-mnli) se comporta como señal de reward frente a reward models aprendidos.
- Generación de respuestas alineadas en tareas de instrucción general: puede emplearse como generador de respuestas en pipelines de evaluación de calidad de datos, comparando sus salidas con las del base Instruct.
- Punto de partida para ajustes posteriores: al ser un fine-tune sobre Llama 3 8B Instruct, puede reutilizarse como base para SFT o DPO adicionales en dominios concretos.
- Docencia y formación técnica: ejemplo práctico de pipeline de RL con recompensa por referencia, útil en cursos sobre alineación de LLMs.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache (en torno a 18-20 GB en la práctica).
- VRAM estimada en cuantización de 8 bits: aproximadamente 8-9 GB de pesos.
- VRAM estimada en cuantización de 4 bits (si se genera GGUF/AWQ): aproximadamente 5-6 GB de pesos.
- GPU recomendadas: A100 40/80 GB, H100 para despliegues de alto throughput; RTX 4090 (24 GB) para fp16 en una sola GPU; RTX 3090/4080 (16-24 GB) para fp16 ajustado o 8 bits.
- Cabe en GPU de consumo: sí, en RTX 4090 en fp16 y en GPUs de 8-12 GB con cuantización 4/8 bits (requiere convertir los pesos, no se distribuyen cuantizados en el repo).
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag presente), endpoints compatibles; vLLM, llama.cpp u Ollama requerirían conversión previa a los formatos correspondientes.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Llama-3-8B-Instruct-refalign | 8.030 M | no disponible (base: 8.192) | llama3 | Hugging Face, 7 descargas | Fine-tune RL2R de investigación |
| meta-llama/Meta-Llama-3-8B-Instruct | 8.030 M | 8.192 | llama3 | Hugging Face, ampliamente usado | Modelo base oficial de Meta |
| Mistral-7B-Instruct-v0.3 | ~7.250 M | 32.768 | Apache 2.0 | Hugging Face | Alternativa de tamaño similar con licencia permisiva |
| Qwen2.5-7B-Instruct | ~7.600 M | 131.072 | Apache 2.0 | Hugging Face | Alternativa con contexto largo y licencia permisiva |

Los datos de Mistral y Qwen corresponden a conocimiento general de esos modelos; no se dispone de comparación de rendimiento publicada para refalign.

## Limitaciones y advertencias

- Modelo de investigación con adopción mínima (7 descargas, 0 likes): no hay evidencia de validación independiente ni de uso en producción.
- No se publican benchmarks: se desconoce si RL2R mejora, iguala o degrada el rendimiento del base Instruct en tareas estándar (MMLU, HumanEval, GSM8K).
- Riesgo de alucinación inherente al modelo base Llama 3 8B, no mitigado de forma documentada por este ajuste.
- Sesgos heredados del dataset UltraFeedback y de las respuestas generadas por Llama-3.3-70B-Instruct usadas como referencia; pueden amplificarse sesgos presentes en esas referencias.
- Idiomas soportados no documentados; se asume el comportamiento multilingüe del base, pero sin garantías.
- Licencia Llama 3 Community License: restricciones de uso comercial (límite de 700 millones de usuarios mensuales para productos derivados, obligaciones de atribución y nomenclatura), revisar términos antes de uso comercial.
- Longitud de contexto no especificada para este fine-tune; el prompt de entrenamiento fue de 600 tokens y la generación de 1200, lo que sugiere que no se entrenó para contextos largos.
- No se distribuyen pesos cuantizados: el despliegue en GPUs de consumo requiere conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mzhaoshuai/Llama-3-8B-Instruct-refalign
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/mzhaoshuai/Llama-3.3-70B-Inst-awq_ultrafeedback_1in3
- Paper (arXiv 2504.09895): https://huggingface.co/papers/2504.09895
- Repositorio GitHub RL2R: https://github.com/mzhaoshuai/RL2R/tree/alignment

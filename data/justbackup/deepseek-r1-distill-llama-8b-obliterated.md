# Justbackup/DeepSeek-R1-Distill-Llama-8B-OBLITERATED

## Resumen

DeepSeek-R1-Distill-Llama-8B-OBLITERATED es una variante del modelo DeepSeek-R1-Distill-Llama-8B, creada por el usuario Justbackup mediante la herramienta OBLITERATUS. Esta herramienta aplica técnicas de ingeniería de activaciones, concretamente el método "advanced", para eliminar los comportamientos de rechazo del modelo original. El resultado es un modelo de 8.000 millones de parámetros que conserva las capacidades de razonamiento y generación de texto del modelo base, pero sin los mecanismos de censura que suelen activarse ante ciertos contenidos.

El modelo está pensado para quienes necesitan un asistente sin restricciones en la generación de respuestas, aunque esto conlleva riesgos importantes en cuanto a seguridad y uso ético. La abliteración no modifica los pesos de forma supervisada, sino que actúa sobre las activaciones internas para bloquear la dirección de rechazo. Al estar basado en Llama 3.2 8B, hereda una arquitectura Transformer densa con 128k de contexto, aunque la ficha técnica del modelo no proporciona detalles adicionales sobre su entrenamiento o licencia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.2 8B, base del modelo original) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128k (según modelo base DeepSeek-R1-Distill-Llama-8B) |
| Tipos de cuantizacion | No disponible (repo solo contiene safetensors) |
| Idiomas soportados | en |
| Licencia | No disponible (el modelo base DeepSeek-R1-Distill-Llama-8B usa MIT) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de DeepSeek-R1-Distill-Llama-8B, que es una destilación del modelo de razonamiento DeepSeek-R1 sobre la arquitectura Llama 3.2 8B. El proceso de destilación original incluyó un ajuste fino supervisado (SFT) con datos de razonamiento y posteriormente un entrenamiento con refuerzo (RL) para mejorar la cadena de pensamiento. La versión OBLITERATED no añade ningún entrenamiento adicional: se aplica la técnica de abliteración mediante el método "advanced" de OBLITERATUS, que analiza las activaciones del modelo en respuestas de rechazo y elimina la dirección correspondiente mediante una intervención en los pesos o activaciones. No se han publicado detalles sobre los datos de entrenamiento de la abliteración, ni se ha documentado el número de tokens utilizados ni el tipo de RLHF/DPO aplicado.

## Capacidades

- Generación de texto libre y sin filtros de censura, incluidos temas que el modelo original podría rechazar.
- Razonamiento y cadena de pensamiento (chain-of-thought) heredados del modelo base, con capacidad para resolver problemas matemáticos, lógicos y de código.
- Generación de código en múltiples lenguajes (Python, C++, Java, etc.) gracias a la destilación de DeepSeek-R1.
- Soporte multilingüe limitado: la ficha indica solo inglés (tag "en"), aunque el modelo base soporta otros idiomas; no se ha verificado el comportamiento en otras lenguas.
- No se ha confirmado soporte de tool calling o function calling, aunque el modelo base podría tenerlo; la ficha no lo menciona.
- No se ha confirmado soporte de agentes o multi-step reasoning, aunque por su naturaleza razonadora podría usarse en pipelines de agentes.

## Casos de uso

- **Investigación en seguridad de IA**: analizar cómo la abliteración afecta a la alineación y la robustez de los modelos, comparando respuestas con el modelo original.
- **Generación de contenido creativo sin restricciones**: escribir ficción, diálogos o guiones que aborden temas controvertidos sin el sesgo de rechazo del modelo base.
- **Análisis de sesgos y comportamiento**: estudiar las diferencias en respuestas entre el modelo original y la versión abliterada para entender los mecanismos de rechazo.
- **Prototipado de asistentes de código**: en entornos de desarrollo donde se requiere generación de código sin filtros, por ejemplo, para documentación de funciones sensibles o scripts de automatización.
- **Evaluación de calidad de razonamiento**: usar el modelo para resolver problemas de matemáticas o lógica en entornos donde no se requiera moderación de contenido.
- **Despliegue en entornos controlados de investigación**: en laboratorios que necesitan un modelo que responda a preguntas sobre temas tabú sin interrupciones, siempre bajo supervisión ética.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta variante OBLITERATED. El modelo base DeepSeek-R1-Distill-Llama-8B tiene resultados conocidos en MMLU, HumanEval y GSM8K, pero no se dispone de datos verificados para esta versión modificada. Se recomienda consultar las métricas del modelo original para estimar el rendimiento, teniendo en cuenta que la abliteración podría degradar ligeramente la calidad en tareas de razonamiento.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 16 GB (8B parámetros × 2 bytes).
- Con cuantización de 4 bits (no disponible en este repo, pero posible con herramientas como llama.cpp): alrededor de 4-5 GB de VRAM.
- GPU recomendadas: para FP16, una NVIDIA RTX 3090/4090 (24 GB) o A100 (40 GB) sería suficiente. Para cuantización 4-bit, una RTX 3060 (12 GB) o superior.
- Si cabe en consumer GPU: sí, una RTX 3090 o 4090 puede ejecutarlo en FP16, y cualquier GPU con 6 GB puede ejecutar cuantizaciones de 4 bits.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (si se convierte a GGUF), Transformers con Hugging Face, o TGI.
- Latencia y throughput: no hay datos publicados para esta variante; en modelos similares de 8B en FP16 con A100 se espera un throughput de 50-100 tokens/s, pero no es garantía.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-R1-Distill-Llama-8B (original) | 8B | 128k | MIT | Modelo base con razonamiento y seguridad activa. |
| DeepSeek-R1-Distill-Llama-8B-OBLITERATED (este) | 8B | 128k | No disponible | Misma arquitectura pero sin rechazo; puede generar contenido sensible. |
| Llama-3.2-8B-Instruct | 8B | 128k | Llama 3.2 license (uso comercial permitido) | Modelo instruct general sin razonamiento específico. |
| Qwen2.5-7B-Instruct | 7B | 128k | Apache 2.0 | Alternativa de código abierto con buen rendimiento en tareas de razonamiento y código. |

No se han encontrado otros modelos abliterados de 8B comparables en la información disponible.

## Limitaciones y advertencias

- **Riesgo de alucinación**: al ser un modelo de razonamiento, puede generar respuestas coherentes pero incorrectas, especialmente en temas delicados.
- **Contenido no filtrado**: la abliteración elimina los mecanismos de rechazo, por lo que el modelo puede producir contenido ofensivo, ilegal o dañino. No debe desplegarse en producción sin una moderación externa.
- **Licencia incierta**: la ficha del modelo no especifica licencia; aunque el modelo base es MIT, la modificación podría tener restricciones adicionales. Se debe verificar antes de uso comercial.
- **Idioma limitado**: solo se indica inglés; aunque el modelo base soporta varios idiomas, la abliteración podría afectar a la coherencia en otros idiomas.
- **No hay garantías de rendimiento**: no se han publicado benchmarks de esta versión, por lo que el rendimiento puede degradarse respecto al original.
- **Riesgo de sesgos**: el modelo base ya tiene sesgos inherentes; la abliteración no los elimina, y puede exacerbar algunos comportamientos.

## Enlaces

- Modelo en Hugging Face: [Justbackup/DeepSeek-R1-Distill-Llama-8B-OBLITERATED](https://huggingface.co/Justbackup/DeepSeek-R1-Distill-Llama-8B-OBLITERATED)
- Modelo base DeepSeek-R1-Distill-Llama-8B: [deepseek-ai/DeepSeek-R1-Distill-Llama-8B](https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B)
- Repositorio OBLITERATUS: [github.com/elder-plinius/OBLITERATUS](https://github.com/elder-plinius/OBLITERATUS)
- GitHub de DeepSeek-R1: [github.com/deepseek-ai/DeepSeek-R1](https://github.com/deepseek-ai/DeepSeek-R1)
- Modelo en LM Studio: [lmstudio.ai/models/deepseek/deepseek-r1-distill-llama-8b](https://lmstudio.ai/models/deepseek/deepseek-r1-distill-llama-8b)

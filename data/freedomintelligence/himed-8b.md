# FreedomIntelligence/HiMed-8B

## Resumen

HiMed-8B es un modelo de lenguaje especializado en razonamiento médico en hindi, desarrollado por el grupo FreedomIntelligence. Se construye a partir de LLaMA-3.1-8B-Instruct mediante un entrenamiento adicional con el conjunto de datos y suite de evaluación HiMed, que abarca tanto medicina occidental como sistemas médicos tradicionales indios. El modelo está diseñado para reducir la brecha de rendimiento entre inglés e hindi en tareas médicas, un problema crítico en un país con más de 500 millones de hablantes de hindi y un acceso limitado a recursos médicos de calidad.

El entrenamiento emplea una técnica innovadora denominada DSR-RL (decaying scaffolding reward), que combina un refuerzo guiado hacia el razonamiento estructurado con una transición gradual hacia objetivos específicos de la tarea. Según el artículo de investigación, HiMed-8B supera a GPT-4o en el subdominio de medicina tradicional india (HiMed-Trad-Bench), lo que demuestra que un modelo abierto de 8B puede competir con sistemas cerrados mucho mayores en dominios culturalmente específicos. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en LLaMA-3.1-8B-Instruct) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en el repositorio) |
| Idiomas soportados | Hindi (principal) e inglés (heredado de la base, aunque no se especifica oficialmente) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

HiMed-8B es un modelo denso de 8 mil millones de parámetros basado en la arquitectura Transformer de LLaMA-3.1-8B-Instruct. No se trata de un modelo MoE, por lo que todos los parámetros se activan en cada inferencia. El entrenamiento se realiza mediante fine-tuning supervisado seguido de un proceso de refuerzo denominado DSR-RL (Decaying Scaffolding Reward Reinforcement Learning). Este método comienza con una recompensa que incentiva el razonamiento paso a paso (scaffolding) y luego reduce gradualmente esa guía para optimizar directamente la precisión de la respuesta final. Este enfoque permite que el modelo aprenda a razonar en hindi sin sacrificar la exactitud en tareas médicas concretas.

El dataset HiMed incluye preguntas y respuestas médicas en hindi, cubriendo tanto medicina occidental como sistemas tradicionales indios (Ayurveda, Siddha, Unani, etc.). No se dispone de información pública sobre el número total de tokens de entrenamiento ni sobre la composición exacta del dataset. El modelo no ha sido sometido a RLHF tradicional, sino al método DSR-RL específico.

## Capacidades

- Generación de texto y respuesta a preguntas médicas en hindi con razonamiento estructurado.
- Razonamiento médico en dominios de medicina occidental y medicina tradicional india.
- Capacidad de seguir instrucciones de tipo conversacional (instruct-tuned).
- Mejora del rendimiento en tareas médicas en hindi en comparación con modelos generalistas de tamaño similar.
- No se reportan capacidades de tool calling, agentes, visión ni audio.

## Casos de uso

- **Asistencia médica en hindi para pacientes**: el modelo puede responder preguntas sobre síntomas, tratamientos y prevención en hindi, facilitando el acceso a información médica en zonas rurales o con baja alfabetización en inglés. Su entrenamiento en medicina tradicional india lo hace útil para consultas sobre remedios ayurvédicos o Unani.
- **Formación de estudiantes de medicina**: puede generar explicaciones de conceptos médicos en hindi, ayudando a estudiantes que estudian en ese idioma a comprender temas de fisiología, farmacología o patología.
- **Apoyo a médicos en la toma de decisiones**: integrado en sistemas de registro clínico electrónico, puede ofrecer sugerencias de diagnóstico o tratamiento en hindi, basadas en los datos del paciente y en el conocimiento médico disponible.
- **Traducción médica**: puede servir como base para traducir terminología médica del inglés al hindi y viceversa, aunque su principal fortaleza es el razonamiento más que la traducción pura.
- **Educación sanitaria pública**: para generar folletos, respuestas a preguntas frecuentes y contenidos de salud pública en hindi, adaptados al contexto cultural indio.
- **Investigación en medicina tradicional**: el modelo puede ayudar a investigadores a comparar descripciones de remedios tradicionales con literatura médica moderna, gracias a su entrenamiento específico en ese subdominio.

## Benchmarks y rendimiento

El artículo de arXiv menciona que HiMed-8B alcanza el mejor rendimiento en HiMed-Trad-Bench, superando a los modelos de código abierto comparados y a GPT-4o. Sin embargo, no se han publicado los valores numéricos de los benchmarks en la información disponible. No se dispone de resultados de MMLU, HumanEval, GSM8K u otros benchmarks generales.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 8.030 millones de parámetros, la inferencia en FP16 requiere aproximadamente 16 GB de VRAM (más overhead de activaciones). Con cuantización INT8 se puede reducir a unos 8-10 GB, y con INT4 a unos 4-5 GB, aunque no se han publicado cuantizaciones oficiales.
- **GPU recomendadas**: tarjetas con 16 GB o más, como NVIDIA RTX 4090, A100 (40 GB) o H100 (80 GB) para un despliegue cómodo sin cuantización. En consumer GPU, una RTX 3090 (24 GB) o RTX 4080 (16 GB) son suficientes para FP16.
- **Despliegue**: al estar disponible en safetensors, se puede cargar con transformers o vLLM. No hay soporte oficial para GGUF/llama.cpp en el repositorio, pero se podría convertir. La latencia típica para un modelo de 8B en una RTX 4090 es de unos 20-40 tokens/segundo con vLLM, aunque no se ha medido específicamente para este modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especialidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HiMed-8B | 8B | No disponible | Médico (hindi + inglés) | Apache 2.0 | HuggingFace |
| LLaMA-3.1-8B-Instruct | 8B | 128k (original) | General | Llama 3.1 Community License | Meta |
| MedAlpaca-7B | 7B | 2k | Médico (inglés) | Apache 2.0 | HuggingFace |
| BioMistral-7B | 7B | 32k | Médico (inglés) | Apache 2.0 | HuggingFace |

La comparación directa no está disponible porque no se han publicado resultados de benchmarks comparativos con estos modelos. La principal diferencia de HiMed-8B es su enfoque bilingüe inglés-hindi y su cobertura de medicina tradicional india, algo que los modelos médicos existentes no cubren.

## Limitaciones y advertencias

- **Alucinaciones**: como todo modelo de lenguaje, puede generar información médica incorrecta o inventada. No debe utilizarse como sustituto del criterio clínico profesional.
- **Cobertura idiomática**: aunque está entrenado para hindi, la información no detalla la calidad del inglés ni la robustez en otras lenguas indias (bengalí, tamil, etc.). Se recomienda validar el rendimiento en casos reales.
- **Sesgos**: los datos médicos pueden reflejar sesgos de género, edad o región. No se han publicado estudios de sesgo específicos para este modelo.
- **Contexto limitado**: se desconoce la longitud máxima de contexto; si hereda de LLaMA-3.1-8B, sería 128k, pero no está confirmado. Para documentos largos, se debe probar.
- **Licencia**: Apache 2.0 permite uso comercial, pero es recomendable revisar la licencia del dataset HiMed y el modelo base original (LLaMA-3.1) para asegurar el cumplimiento de sus términos.
- **Producción**: no se ha documentado su estabilidad, robustez o comportamiento en entornos de alta concurrencia. Se recomienda una evaluación adicional antes de desplegar en sistemas críticos.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/FreedomIntelligence/HiMed-8B)
- [Repositorio GitHub](https://github.com/FreedomIntelligence/HiMed)
- [Dataset HiMed en HuggingFace](https://huggingface.co/datasets/FreedomIntelligence/HiMed)
- [Paper en arXiv](https://arxiv.org/pdf/2605.24635)

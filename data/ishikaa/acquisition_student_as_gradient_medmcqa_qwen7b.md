# ishikaa/acquisition_student_AS_gradient_medmcqa_qwen7b

## Resumen

El modelo `ishikaa/acquisition_student_AS_gradient_medmcqa_qwen7b` es un ajuste fino (fine-tuning) del modelo base Qwen2 de 7 mil millones de parámetros, especializado en el dominio médico mediante el dataset MedMCQA. Ha sido desarrollado por el usuario ishikaa y publicado en Hugging Face con el pipeline de generación de texto. El nombre del repositorio sugiere que forma parte de una serie de experimentos sobre estrategias de adquisición de conocimiento (acquisition student) aplicadas a preguntas de opción múltiple de medicina, con variantes como "original", "random", "confidence" y "gradient". Este modelo concreto utiliza un enfoque basado en gradientes (AS_gradient) para el entrenamiento.

La relevancia de este modelo radica en su aplicación al razonamiento clínico y a la respuesta a preguntas médicas, un área con alta demanda de sistemas de apoyo a la decisión. Al estar basado en Qwen2, hereda una arquitectura transformer moderna con atención de ventana deslizante y soporte para contextos largos, aunque los detalles específicos del ajuste no están documentados en la model card. El repositorio contiene pesos en formato safetensors con un total de 7.615.616.512 parámetros, lo que lo sitúa en la gama de modelos de 7B que pueden ejecutarse en GPUs de consumo con cuantización adecuada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen2, según tag `qwen2`) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2, un transformer decoder-only con atención de ventana deslizante (sliding window attention) y normalización RMSNorm. El modelo base tiene 7.6 mil millones de parámetros y fue preentrenado con un corpus multilingüe extenso. El ajuste fino se realizó con la librería TRL (Transformers Reinforcement Learning) mediante supervisión de fine-tuning (SFT), como indican los tags `trl` y `sft`. El dataset de entrenamiento es MedMCQA, un conjunto de preguntas de opción múltiple de exámenes médicos (AIIMS y NEET PG), con más de 190.000 preguntas. El nombre "AS_gradient" sugiere que se empleó una estrategia de adquisición basada en gradientes para seleccionar o ponderar las muestras de entrenamiento, aunque no se proporcionan detalles sobre el procedimiento exacto, hiperparámetros o número de épocas.

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset tras el filtrado, ni si se aplicaron técnicas adicionales como RLHF o DPO. La model card es genérica y no aporta datos técnicos más allá de los tags.

## Capacidades

- Generación de texto en formato conversacional, orientada a responder preguntas de opción múltiple en el dominio médico.
- Razonamiento sobre conocimiento clínico básico, derivado del fine-tuning con MedMCQA.
- Soporte de tool calling: no disponible (no se menciona en la información).
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponibles, aunque el modelo base Qwen2 soporta múltiples idiomas, el ajuste se centra en inglés médico.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Evaluación de modelos en dominios especializados: investigadores pueden utilizar este modelo como referencia para estudiar el impacto de estrategias de selección de datos (gradiente) en el rendimiento sobre MedMCQA.
- Desarrollo de sistemas de apoyo a la decisión médica: el modelo puede integrarse en prototipos que respondan preguntas de exámenes médicos, aunque requiere validación clínica adicional.
- Benchmarking de fine-tuning: sirve como punto de comparación para otros experimentos de ajuste fino sobre Qwen2-7B con datasets médicos.
- Generación de explicaciones en educación médica: puede usarse para generar respuestas razonadas a preguntas tipo test, ayudando a estudiantes a repasar conceptos.
- Investigación en estrategias de adquisición de conocimiento: el modelo es un artefacto de un estudio sobre métodos de selección de muestras (original vs. random vs. confidence vs. gradient), útil para reproducir experimentos.
- Despliegue en entornos de inferencia de baja latencia: al ser un modelo de 7B, puede servirse con vLLM o TGI en GPUs con al menos 16 GB de VRAM, permitiendo pruebas interactivas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de MedMCQA en la model card ni en los resultados de búsqueda web.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 7.6B parámetros, en fp16 se necesitan aproximadamente 15 GB de VRAM. Con cuantización INT8 se reduce a ~8 GB, y con INT4 a ~4-5 GB, aunque no se proporcionan cuantizaciones oficiales.
- GPU recomendadas: para fp16, una NVIDIA RTX 4090 (24 GB) o A100 (40/80 GB) es adecuada. Con cuantización, una RTX 3090 (24 GB) o RTX 4080 (16 GB) pueden ser suficientes.
- ¿Cabe en GPU de consumo? Sí, con cuantización INT4 o INT8 en GPUs con 8-12 GB de VRAM, como RTX 3060 o RTX 4070.
- Opciones de despliegue: vLLM, llama.cpp (si se convierten los pesos a GGUF), Ollama, Hugging Face TGI, o directamente con transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados. El modelo pertenece a una familia de variantes (original, random, confidence, gradient) sobre la misma base Qwen2-7B, pero no hay métricas que permitan comparar su rendimiento con otros modelos como Llama-3-8B, Mistral-7B o el propio Qwen2-7B base. Se recomienda consultar los repositorios hermanos del mismo autor para obtener más contexto, aunque tampoco publican resultados.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al entrenarse con MedMCQA, puede heredar sesgos presentes en los exámenes médicos indios, como variaciones en terminología o prácticas clínicas regionales.
- Riesgo de alucinación: alto, como en la mayoría de modelos generativos. No debe utilizarse como fuente única de verdad clínica.
- Limitaciones de contexto: no se especifica la longitud de contexto, pero el modelo base Qwen2 soporta hasta 32.768 tokens; el ajuste puede haber reducido esta capacidad.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede garantizar su uso comercial. Se recomienda contactar al autor antes de cualquier despliegue productivo.
- Caveat para producción: la model card no incluye información sobre evaluación, sesgos, ni procedencia de los datos de entrenamiento más allá del nombre del dataset. Cualquier uso en entornos clínicos reales requiere validación exhaustiva y supervisión humana.

## Enlaces

- Hugging Face: https://huggingface.co/ishikaa/acquisition_student_AS_gradient_medmcqa_qwen7b
- Modelo hermano (original): https://huggingface.co/ishikaa/acquisition_student_original_medmcqa_qwen7b
- Modelo hermano (confidence): https://huggingface.co/ishikaa/acquisition_student_AS_confidence_medmcqa_qwen7b
- Modelo hermano (random): https://friendli.ai/models/ishikaa/acquisition_student_random_medmcqa_qwen7b
- Modelo hermano (qwen3bins): https://friendli.ai/models/ishikaa/acquisition_student_qwen3bins_medmcqa_gradient
- Referencia del paper de impacto ambiental (citado en la model card): https://arxiv.org/abs/1910.09700

# LeoZotos/OLMo-2-0425-1B_bio_cpt_mmlu_for_mcq_training

## Resumen

LeoZotos/OLMo-2-0425-1B_bio_cpt_mmlu_for_mcq_training es un checkpoint de fine-tuning del modelo OLMo-2-0425-1B de AllenAI (Ai2), publicado por el usuario LeoZotos. El objetivo del entrenamiento es adaptar el modelo base a la resolución de preguntas de opción múltiple (MCQ), utilizando el corpus `LeoZotos/mmlu_for_mcq_training` con un máximo de 7000 ejemplos de entrenamiento. El modelo resultante se evalúa en conjuntos de biología, inmunología, USMLE, SciQ y una submuestra de MMLU no biológica, lo que sugiere un enfoque específico en dominios científicos y educativos.

Se trata de un modelo de 1.484.916.736 parámetros (aproximadamente 1,5 mil millones), con una longitud de contexto de 1024 tokens durante el entrenamiento, y está publicado en formato safetensors. No se proporcionan detalles sobre licencia, idiomas o pipeline de inferencia en la ficha del repositorio, pero al derivar de OLMo-2 (Apache 2.0), se hereda la licencia base. El interés de este checkpoint reside en su uso como recurso para estudiar la dinámica de aprendizaje en dominios específicos y para aplicaciones educativas de evaluación de conocimientos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (basado en OLMo-2-0425-1B de Ai2) |
| Parametros totales | 1.484.916.736 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 1024 tokens (configuración de entrenamiento; no se indica contexto de inferencia) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible (el modelo base OLMo-2 es principalmente inglés) |
| Licencia | No disponible (el modelo base OLMo-2 es Apache-2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint OLMo-2-0425-1B, un transformer decoder denso de 1B parámetros desarrollado por Allen Institute for AI (Ai2). La arquitectura base sigue el diseño de OLMo 2, que utiliza atención causal estándar, RMSNorm y una configuración de capas y dimensiones típica para un modelo de 1B (no se proporcionan detalles exactos en la información del repositorio).

El entrenamiento se realizó sobre el corpus `LeoZotos/mmlu_for_mcq_training`, limitado a 7000 ejemplos de preguntas de opción múltiple, con una longitud máxima de secuencia de 1024 tokens y una longitud mínima de 50. Se utilizó un optimizador AdamW con learning rate 2e-05, weight decay 0.01, beta2 0.95, scheduler coseno con warmup ratio 0.03, batch size 4 con 8 pasos de acumulación de gradiente (tamaño efectivo 32), y una sola época. No se activó el enmascaramiento de la pérdida en el prompt (`mask_prompt_loss: false`), lo que implica que el modelo también optimiza la generación del contexto de la pregunta. La evaluación se realizó sobre los conjuntos `bio_full`, `immu_full`, `usmle_full`, `sciq_full` y `mmlu_short_non_bio`, con 500 preguntas y 5 permutaciones por evaluación, temperatura 0.6 y top-p 0.95.

No se dispone de información sobre el dataset de entrenamiento más allá del nombre, ni sobre técnicas de RLHF o DPO. El entrenamiento se llevó a cabo con `gradient_checkpointing` activado, y el checkpoint final se subió al Hub de Hugging Face.

## Capacidades

- Resolución de preguntas de opción múltiple (MCQ) en dominios de biología, inmunología, usmle (medicina) y ciencias en general, según los conjuntos de evaluación.
- Generación de texto libre (formato de salida de modelo causal), aunque el entrenamiento se centra en MCQ.
- Capacidad de razonamiento de dominio limitada por el tamaño del modelo (1B) y el entrenamiento específico en MCQ.
- Sin evidencia de soporte de tool calling, función de llamada, agentes o razonamiento multi-paso en la información disponible.
- No se indica capacidad multilingüe; el modelo base es inglés y los datasets de evaluación son en inglés.

## Casos de uso

- Evaluación educativa automatizada: el modelo puede generar respuestas a preguntas de opción múltiple en biología y ciencias de la salud, lo que permite crear bancos de preguntas o sistemas de autoevaluación para estudiantes.
- Investigación en dinámica de aprendizaje: al ser un checkpoint con config de entrenamiento detallada, sirve para estudiar cómo el fine-tuning en un corpus pequeño (7000 ejemplos) afecta el rendimiento en dominios específicos.
- Generación de justificaciones de respuesta: aunque no se ha evaluado explícitamente, el modelo puede generar texto explicativo junto a la opción seleccionada, útil para plataformas educativas interactivas.
- Sistemas de tutoría inteligente: integrado en un pipeline de QA, puede responder preguntas de tipo examen en biología y medicina, ayudando a estudiantes a practicar.
- Benchmarking de fine-tuning: comparar el rendimiento de este checkpoint frente al modelo base OLMo-2-0425-1B en tareas MCQ, para medir el impacto del entrenamiento específico.
- Entrenamiento de modelos más grandes: como punto de partida para distillation o para evaluar la transferencia de conocimiento de un modelo pequeño en dominios educativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo base OLMo-2-0425-1B alcanza un 45% de MMLU según OpenModelMap, pero no hay datos de evaluación de este finetune específico. La configuración de entrenamiento incluye métricas de evaluación sobre conjuntos como `bio_full`, `immu_full`, `usmle_full`, `sciq_full` y `mmlu_short_non_bio`, pero no se comparten los resultados numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB en fp32 (1.484.916.736 parámetros × 4 bytes), reducible a ~1.5 GB en fp16 o cuantización de 8 bits.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060 o superior. También puede ejecutarse en CPU con llama.cpp (si se convierte a GGUF).
- Si cabe en consumer GPU: sí, el modelo de 1B es adecuado para GPUs de gama media y baja, e incluso para inferencia en CPU con cuantización.
- Opciones de despliegue: vLLM, Hugging Face Transformers, llama.cpp (tras conversión a GGUF), Ollama (si se empaqueta), TGI (Text Generation Inference) para servidores ligeros.
- Latencia y throughput: no disponible en la información; para un modelo de 1B, en una GPU como RTX 4090 se espera una latencia de decodificación de ~20-50 ms por token, y un throughput de 200-500 tokens/s, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OLMo-2-0425-1B (base) | 1.48B | 1024 (entrenamiento) | 45 | Apache-2.0 | Hugging Face |
| LeoZotos/OLMo-2-0425-1B_bio_cpt_mmlu_for_mcq_training | 1.48B | 1024 (entrenamiento) | no disponible | no disponible (base Apache-2.0) | Hugging Face |
| TinyLlama-1.1B | 1.1B | 2048 | 25.8 | Apache-2.0 | Hugging Face |
| Qwen2.5-1.5B | 1.5B | 32768 | 58.9 | Apache-2.0 | Hugging Face |

Nota: los datos de MMLU de los modelos alternativos son aproximados y de fuentes públicas; el finetune no tiene datos publicados.

## Limitaciones y advertencias

- El entrenamiento se realizó con un corpus limitado (máximo 7000 ejemplos), lo que puede provocar overfitting y poca generalización a dominios fuera de los evaluados.
- La longitud de contexto es 1024 tokens, lo que limita la capacidad de procesar preguntas con contextos largos o múltiples turnos.
- No se proporciona información sobre sesgos o alucinaciones, pero al ser un modelo de 1B, es propenso a errores factuales y a respuestas inconsistentes.
- El modelo no ha sido evaluado en tareas de generación libre, tool calling ni agentes; su uso en estos escenarios no es recomendable.
- La licencia del modelo base es Apache-2.0, pero no se confirma la licencia de este finetune específico. Se recomienda verificar el repositorio original.
- El idioma de entrenamiento es inglés; no se ha evaluado su rendimiento en otros idiomas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/LeoZotos/OLMo-2-0425-1B_bio_cpt_mmlu_for_mcq_training
- Modelo base OLMo-2-0425-1B (Ai2): https://huggingface.co/allenai/OLMo-2-0425-1B
- Corpus de entrenamiento (MMLU para MCQ): https://huggingface.co/datasets/LeoZotos/mmlu_for_mcq_training
- Repositorio OLMo en GitHub: https://github.com/allenai/OLMo
- Página de OLMo en Ai2: https://allenai.org/olmo
- Referencia del modelo base (paper): arXiv:2501.00656 (OLMo 2)

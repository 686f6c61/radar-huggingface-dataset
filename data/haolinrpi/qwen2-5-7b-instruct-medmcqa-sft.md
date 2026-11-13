# HaolinRPI/Qwen2.5-7B-Instruct-MedMCQA-SFT

## Resumen

Qwen2.5-7B-Instruct-MedMCQA-SFT es un ajuste fino supervisado (SFT) de parámetros completos del modelo Qwen/Qwen2.5-7B-Instruct, desarrollado por el usuario HaolinRPI. El objetivo del ajuste es especializar el modelo base en la resolución de preguntas médicas de opción múltiple del conjunto de datos MedMCQA, generando una traza de razonamiento seguida de la respuesta final en el formato `<answer>X</answer>`. El modelo se entrenó con LlamaFactory sobre 20.000 ejemplos de trazas de MedMCQA, con un split de evaluación de 200 ejemplos.

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5-7B-Instruct, con 7.615.616.512 parámetros totales (aproximadamente 7,6 mil millones). El repositorio ocupa 45,7 GB e incluye tres checkpoints correspondientes a las tres épocas de entrenamiento, siendo `main` la época 3 (`checkpoint-237`). La licencia es Apache 2.0, heredada del modelo base.

La relevancia de este modelo es acotada: se trata de un artefacto de investigación con cero descargas y sin métricas de rendimiento publicadas más allá de la pérdida de evaluación (0,8129 en el checkpoint final). No es un modelo de propósito general ni un asistente médico validado clínicamente; su interés radica en ser un ejemplo reproducible de ajuste fino sobre Qwen2.5-7B-Instruct para dominios especializados con formato de razonamiento explícito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 16.384 tokens (cutoff de entrenamiento); contexto nativo del base no disponible en la información proporcionada |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors en bf16) |
| Idiomas soportados | No disponible (el base Qwen2.5 es multilingüe, pero la model card no lo especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de parámetros completos (full-parameter SFT) sobre Qwen2.5-7B-Instruct, un transformer decoder-only denso de aproximadamente 7,6 mil millones de parámetros. El entrenamiento se realizó con LlamaFactory en 4 GPUs con ZeRO-1, precisión bf16, longitud de corte de 16.384 tokens, batch por dispositivo de 1 y acumulación de gradiente de 64 (batch efectivo de 256). Se usó una tasa de aprendizaje de 1e-5 con warmup ratio 0 y schedule coseno, durante 3 épocas y 237 pasos de optimizador.

El dataset de entrenamiento consta de 20.000 ejemplos de trazas de MedMCQA y un split de evaluación de 200 ejemplos. El formato objetivo es una traza de razonamiento seguida de la etiqueta `<answer>X</answer>`, lo que induce un modo de "thinking" explícito antes de responder. No se menciona en la información disponible el uso de RLHF, DPO ni ninguna innovación arquitectónica adicional; el modelo hereda las características del base (atención con RoPE, GQA, etc.) sin modificaciones estructurales documentadas.

## Capacidades

- Generación de texto y razonamiento paso a paso en el dominio médico, con traza de razonamiento explícita previa a la respuesta.
- Respuesta a preguntas médicas de opción múltiple (MedMCQA) en el formato `<answer>X</answer>`.
- Razonamiento multi-paso inducido por el formato de entrenamiento (cadena de razonamiento antes de la etiqueta de respuesta).
- Capacidades generales heredadas de Qwen2.5-7B-Instruct: generación de texto, código, matemáticas y multilingüismo, aunque no se han validado tras el ajuste fino.
- Soporte de tool calling y function calling: no confirmado tras el ajuste; el base lo soporta, pero la model card no lo menciona.
- Capacidades de agente y multi-step reasoning: no documentadas específicamente para este ajuste.
- Capacidades especiales (visión, audio): no disponibles; el modelo es solo texto.

## Casos de uso

- Evaluación de razonamiento médico académico: el modelo puede usarse como baseline para medir la calidad de trazas de razonamiento en preguntas de MedMCQA, comparando la traza generada con la esperada y la respuesta final.
- Investigación en ajuste fino supervisado: sirve como ejemplo reproducible de SFT con LlamaFactory sobre Qwen2.5-7B-Instruct, útil para estudiar el efecto del formato de traza en la pérdida de evaluación.
- Generación de datos sintéticos de razonamiento médico: las trazas generadas pueden filtrarse y usarse para aumentar datasets de entrenamiento en dominios clínicos, con revisión humana posterior.
- Prototipado de asistentes de formación médica: en entornos controlados y con supervisión, puede generar explicaciones razonadas para preguntas de examen tipo test, aunque requiere validación experta.
- Benchmarking de modelos médicos: como checkpoint especializado, permite comparar el impacto del SFT frente al base Qwen2.5-7B-Instruct en tareas de opción múltiple médica.
- Estudio de formatos de respuesta estructurada: el patrón `<answer>X</answer>` es útil para investigar extracción fiable de respuestas en pipelines de evaluación automática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (MMLU, MedMCQA accuracy, HumanEval, GSM8K, etc.) en la información disponible. El único dato de evaluación proporcionado es la pérdida de evaluación en el checkpoint final (época 3, `checkpoint-237`):

| Metrica | Valor |
|---|---|
| eval_loss (epoch 3, checkpoint-237) | 0,8129 |

No se dispone de precisión en MedMCQA ni de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 15-16 GB solo para pesos (7,6 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, 18-24 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8-9 GB; en 4 bits: aproximadamente 4-5 GB. Estas cuantizaciones no se publican en el repositorio, pero son viables a partir del base Qwen2.5-7B-Instruct.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para bf16 con contexto moderado; RTX 3090 (24 GB) también es viable.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) en bf16 con contexto limitado, y en GPUs de 12-16 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp (requiere conversión a GGUF), Ollama (requiere GGUF), Transformers con accelerate. El repositorio solo incluye safetensors, por lo que para llama.cpp/Ollama habría que convertir los pesos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct-MedMCQA-SFT | 7,6 B | 16.384 (entrenamiento) | MedMCQA, traza + respuesta | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 32.768 (nativo, según documentación del base) | Propósito general | Apache 2.0 | Hugging Face, ampliamente usado |
| Modelos médicos de 7-8 B (p. ej. variantes Meditron, BioMistral) | 7-8 B | Variable | Dominio médico general | Variable | Hugging Face |

La comparación cuantitativa de rendimiento no está disponible: no se han publicado métricas de MedMCQA para este checkpoint ni para alternativas en la información proporcionada. La principal diferencia frente al base es el formato de razonamiento y la especialización en MedMCQA; frente a otros modelos médicos, la falta de benchmarks impide establecer una comparación rigurosa.

## Limitaciones y advertencias

- No es un dispositivo médico ni un asistente clínico validado: no debe usarse para diagnóstico, tratamiento ni decisiones sanitarias sin supervisión profesional.
- Riesgo de alucinación elevado en dominios médicos, especialmente fuera de la distribución de MedMCQA; las trazas de razonamiento pueden contener afirmaciones plausibles pero incorrectas.
- Sesgos heredados del base Qwen2.5-7B-Instruct y del dataset MedMCQA, cuya composición y cobertura no se detallan en la model card.
- Contexto de entrenamiento limitado a 16.384 tokens; no se documenta el comportamiento más allá de esa longitud.
- Idiomas soportados no especificados; el ajuste se realizó sobre datos en inglés (MedMCQA), lo que puede degradar el rendimiento multilingüe del base.
- Sin métricas de precisión publicadas (solo eval_loss), lo que impide evaluar su calidad real en tareas de opción múltiple.
- Cero descargas y sin validación comunitaria: no hay evidencia externa de robustez ni de reproducibilidad.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el uso médico recae en el implementador; se recomienda revisar también la licencia y condiciones del dataset MedMCQA.
- El repositorio incluye tres checkpoints (épocas 1-3) y ocupa 45,7 GB; conviene seleccionar el checkpoint adecuado y verificar la integridad de los pesos antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HaolinRPI/Qwen2.5-7B-Instruct-MedMCQA-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Dataset MedMCQA (referencia del autor, no enlazado en la model card): no disponible en la información proporcionada
- LlamaFactory (herramienta de entrenamiento citada): no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada

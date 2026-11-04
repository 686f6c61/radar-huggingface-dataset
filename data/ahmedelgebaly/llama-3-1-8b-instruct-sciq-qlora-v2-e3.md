# ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-v2-e3

## Resumen

El modelo `ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-v2-e3` es un adaptador PEFT de tipo QLoRA publicado por el usuario ahmedelgebaly sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct`. No se trata de un modelo completo, sino de un conjunto de pesos de adaptadores (0,4 GB) que deben cargarse junto al modelo base de Meta para funcionar. Su propósito es especializar el modelo en generación de respuestas de tipo pregunta-respuesta científica, entrenado sobre el dataset `ahmedelgebaly/SciQ_Alpaca` en formato Alpaca.

El adaptador forma parte de una ablación de épocas (epoch ablation) denominada "AAST 2026 SciQ QLoRA Epoch Ablation Scenario 4.1", que incluye cinco variantes (e1 a e5) entrenadas con distinto número de épocas sobre el mismo dataset. Según la model card, la variante recomendada es la e1 por presentar la menor pérdida de validación; esta variante e3 corresponde a 3 épocas de entrenamiento con una pérdida de validación de 0,9818 y una perplejidad de validación de 2,6692.

Es relevante como ejemplo de flujo de trabajo de ajuste fino eficiente en parámetros (PEFT) aplicado a un modelo de 8 mil millones de parámetros, útil para quienes quieran reproducir la metodología o evaluar el efecto del número de épocas en tareas de QA científica. No obstante, el modelo tiene cero descargas y cero likes en el momento de la ficha, lo que indica que no ha sido validado por la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptadores LoRA/QLoRA |
| Parámetros totales | 8 mil millones (modelo base); adaptador de 0,4 GB |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el modelo base Llama 3.1 soporta 128 000 tokens, pero el adaptador se entrenó con secuencias de 512 tokens) |
| Tipos de cuantización | QLoRA 4-bit NF4 durante el entrenamiento; cuantizaciones del modelo base no especificadas |
| Idiomas soportados | no disponibles |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `meta-llama/Llama-3.1-8B-Instruct`, un transformer decoder-only de 8 mil millones de parámetros con atención causal estándar. El ajuste fino se realizó mediante QLoRA con cuantización 4-bit NF4, con rango LoRA r=32, alpha=64 y dropout de 0,05. Se entrenaron 3 épocas (780 pasos) con longitud de secuencia de 512 tokens, tasa de aprendizaje 2e-4 con decaimiento coseno y tamaño de lote efectivo de 16. El framework empleado fue Axolotl junto con PEFT.

El dataset de entrenamiento es `ahmedelgebaly/SciQ_Alpaca`, una versión en formato Alpaca (instrucción / entrada / salida) del corpus SciQ, orientado a preguntas de ciencia. No se especifica el número de tokens de entrenamiento ni la composición detallada del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card no documenta innovaciones técnicas adicionales más allá del propio procedimiento QLoRA.

## Capacidades

- Generación de texto conversacional heredada del modelo base Llama 3.1 8B Instruct.
- Respuesta a preguntas de tipo científico, especialidad del ajuste fino sobre SciQ.
- Formato de instrucciones Alpaca (instruction/input/output), adecuado para tareas de QA guiadas.
- Capacidades del modelo base potencialmente conservadas: razonamiento, código y matemáticas (no verificadas tras el ajuste).
- Soporte de tool calling y function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información disponible.
- Capacidades multilingües: no documentadas; el dataset de ajuste parece estar en inglés.
- No se documentan modos especiales (thinking mode, visión, audio).

## Casos de uso

- Respuesta a preguntas de ciencia en entornos educativos: el adaptador puede emplearse para generar respuestas a preguntas de física, química o biología similares a las del corpus SciQ, con un formato de salida consistente gracias al entrenamiento en formato Alpaca.
- Evaluación de metodologías de ajuste fino: sirve como punto de comparación dentro de la ablación de épocas (e1 a e5) para estudiar el efecto del número de épocas sobre la pérdida de validación y la perplejidad.
- Generación de material de estudio: puede producir explicaciones breves de conceptos científicos a partir de una instrucción y un contexto de entrada, útil para borradores de fichas o cuestionarios.
- Prototipado de asistentes de QA especializados: al ser un adaptador ligero (0,4 GB), permite experimentar con especialización temática sin reentrenar el modelo completo.
- Investigación sobre PEFT: reproduce un pipeline Axolotl + PEFT + QLoRA 4-bit NF4 documentado paso a paso, útil para validar configuraciones de LoRA (r=32, alpha=64) en modelos de 8B.
- Docencia y formación en ajuste fino: ejemplo didáctico de cómo un adaptador pequeño modifica el comportamiento de un modelo grande para una tarea concreta, con métricas de validación reportadas.
- Comparación de checkpoints intermedios: permite analizar el sobreajuste o la degradación entre épocas comparando e3 con las variantes e1, e2, e4 y e5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de validación del entrenamiento:

| Métrica | Valor |
|---|---|
| Val loss | 0,9818 |
| Val PPL | 2,6692 |
| Épocas | 3 |
| Pasos de entrenamiento | 780 |

No se proporcionan resultados de MMLU, HumanEval, GSM8K ni de evaluaciones específicas de SciQ.

## Requisitos de hardware

- El adaptador en sí ocupa 0,4 GB, pero requiere cargar el modelo base Llama 3.1 8B Instruct.
- VRAM estimada para el modelo base en FP16: aproximadamente 16 GB; en 8-bit: unos 8-9 GB; en 4-bit: unos 5-6 GB (estimaciones estándar para un modelo de 8B, no confirmadas en la información proporcionada).
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para FP16; RTX 3090/4090 o GPUs con 12-16 GB para cuantización 4-bit.
- Cabe en GPU de consumo con cuantización: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti, RTX 4090, entre otras, siempre que se cuantice el modelo base.
- Opciones de despliegue: transformers + PEFT (documentado en la model card), vLLM, TGI y llama.cpp/Ollama (requieren fusionar el adaptador con el modelo base o soportar adaptadores LoRA).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-SciQ-QLoRA-v2-e3 (este) | 8B (base) + adaptador | 512 tokens de entrenamiento; contexto base 128k | Val loss 0,9818; Val PPL 2,6692 | llama3.1 | HuggingFace, 0 descargas |
| Llama-3.1-8B-Instruct-SciQ-QLoRA-v2-e1 | 8B (base) + adaptador | 512 tokens de entrenamiento | Menor val loss según la model card (valor no especificado) | llama3.1 | HuggingFace |
| meta-llama/Llama-3.1-8B-Instruct | 8B | 128 000 tokens | Benchmarks públicos de Meta (no reproducidos aquí) | llama3.1 | HuggingFace, ampliamente usado |
| Adaptadores SciQ de terceros | no disponible | no disponible | no disponible | variable | no disponible |

La comparativa se limita a las variantes de la misma ablación y al modelo base, ya que no se dispone de datos de rendimiento de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: requiere descargar y cargar el modelo base `meta-llama/Llama-3.1-8B-Instruct`, que está sujeto a aceptación de licencia en HuggingFace.
- El adaptador hereda la Llama 3.1 Community License, con restricciones de uso comercial y obligaciones de atribución; es necesario revisar los términos antes de un despliegue en producción.
- El ajuste se realizó con secuencias de 512 tokens, lo que puede degradar el rendimiento en contextos largos pese a que el modelo base soporte 128k tokens.
- Riesgo de sobreajuste al corpus SciQ: puede responder de forma estereotipada o perder generalidad en dominios ajenos a la QA científica.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en preguntas científicas fuera de la distribución del dataset de entrenamiento.
- No hay información sobre sesgos, evaluación de seguridad ni filtros de contenido; el modelo no ha pasado por validación de la comunidad (0 descargas, 0 likes).
- El idioma de entrenamiento parece ser inglés; el soporte multilingüe no está documentado y podría ser deficiente.
- La model card recomienda la variante e1 (menor val loss) frente a esta e3, por lo que e3 puede presentar un ajuste subóptimo dentro de la ablación.
- No se documentan capacidades de tool calling, agentes ni modo de razonamiento; no deben asumirse en producción.
- La fecha de creación indicada (2026-11-04) es futura respecto a la fecha habitual de publicación, lo que conviene verificar antes de citar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-v2-e3
- Dataset de entrenamiento: https://huggingface.co/datasets/ahmedelgebaly/SciQ_Alpaca
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Variante e1 (recomendada): https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-v2-e1
- Variante e2: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-v2-e2
- Variante e4: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-v2-e4
- Variante e5: https://huggingface.co/ahmedelgebaly/Llama-3.1-8B-Instruct-SciQ-QLoRA-v2-e5
- Licencia Llama 3.1: https://www.llama.com/llama3_1/license/
- Framework Axolotl: https://github.com/axolotl-ai-cloud/axolotl
- Librería PEFT: https://github.com/huggingface/peft

# protocolsyncllc/medgap-qwen-3.8-27b

## Resumen

MedGap Qwen 3.8 27B es un ajuste fino (fine-tune) del modelo Qwen3.8-27B de Unsloth, desarrollado por protocolsyncllc. El modelo está especializado en el dominio regulatorio de dispositivos médicos, concretamente en el análisis y generación de contenido relacionado con las cartas de advertencia (warning letters) que emite la FDA estadounidense. El problema que resuelve es la necesidad de un asistente especializado capaz de interpretar y redactar documentos técnico-regulatorios con terminología y estructura propias de este ámbito.

Con 27.781.427.952 parámetros totales (aproximadamente 27,8 mil millones), el modelo se construye sobre una arquitectura transformer densa heredada del modelo base, aunque la información disponible no detalla la arquitectura interna exacta del Qwen3.8-27B original. El ajuste se realizó mediante LoRA durante una única época sobre un dataset de cartas de advertencia de la FDA, lo que lo hace relevante para equipos de asuntos regulatorios, calidad y cumplimiento normativo que necesitan automatizar tareas de revisión documental.

La relevancia actual del modelo reside en su carácter vertical: frente a modelos generalistas, ofrece una especialización en un corpus normativo concreto, con licencia Apache 2.0 y disponibilidad de pesos en formato safetensors y GGUF. No obstante, se trata de un modelo con escasa tracción (800 descargas y 1 like en el momento de la consulta) y con documentación limitada, lo que condiciona su evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B; detalles internos no disponibles) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF Q8_0 disponible; safetensors en precisión completa |
| Idiomas soportados | Ingles (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer denso de aproximadamente 27,8 mil millones de parámetros. El ajuste fino se realizó con la librería Unsloth mediante la técnica LoRA, con una tasa de aprendizaje de 2e-4 y una sola época de entrenamiento. El hardware empleado fueron tres GPU NVIDIA GeForce RTX 5060 Ti, lo que indica un entrenamiento de bajo coste relativo para el tamaño del modelo, posible gracias a la eficiencia de LoRA sobre los pesos congelados.

El dataset de entrenamiento es `protocolsyncllc/fda-warning-letters`, con un fichero `medical-devices.jsonl`. La model card no especifica el número de tokens, la composición detallada del corpus ni si se aplicaron técnicas de alineación adicionales como RLHF o DPO. Tampoco se documentan innovaciones técnicas propias más allá del ajuste LoRA sobre el modelo base.

## Capacidades

- Generación de texto especializada en el dominio regulatorio de dispositivos médicos y cartas de advertencia de la FDA.
- Interpretación y redacción de documentos técnico-normativos en inglés.
- Conversación multi-turno (pipeline `text-generation` con tag `conversational`).
- Capacidades heredadas del modelo base Qwen3.8-27B, no documentadas explícitamente en la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Revisión de cartas de advertencia de la FDA: el modelo puede analizar el texto de una warning letter y resumir los hallazgos regulatorios, las infracciones citadas y las acciones correctivas exigidas, gracias a su ajuste sobre un corpus específico de este tipo de documentos.
- Redacción de respuestas regulatorias: equipos de asuntos regulatorios pueden generar borradores de respuestas formales a las cartas de advertencia, manteniendo la terminología y estructura propias del dominio.
- Auditoría interna de documentación de dispositivos médicos: el modelo puede contrastar documentos internos con los patrones de incumplimiento habituales detectados en el corpus de entrenamiento, señalando áreas de riesgo.
- Formación de personal de calidad y cumplimiento: generación de casos de estudio y material didáctico basado en escenarios reales de warning letters para entrenar a equipos internos.
- Extracción de requisitos normativos: a partir de un documento regulatorio, el modelo puede estructurar los requisitos aplicables a un dispositivo concreto, facilitando la trazabilidad en sistemas de gestión de calidad.
- Asistencia en la preparación de inspecciones: simulación de preguntas y escenarios típicos de inspección de la FDA, con respuestas alineadas con el lenguaje regulatorio del corpus.
- Clasificación y triaje de correspondencia regulatoria: integrado en un pipeline de procesamiento documental, puede etiquetar y priorizar comunicaciones entrantes según su criticidad y tipo de infracción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (FP16/BF16): aproximadamente 55-56 GB, insuficiente para GPUs de consumo individuales.
- VRAM estimada con cuantización GGUF Q8_0: aproximadamente 28-30 GB, viable en GPUs como A100 40 GB, H100 o configuraciones multi-GPU.
- Cuantizaciones menores (Q4_K_M, Q5_K_M) no están publicadas en el repositorio, pero reducirían el requisito a rangos de 16-20 GB, permitiendo su ejecución en una RTX 4090 (24 GB) o RTX 3090.
- GPU recomendadas: A100 40/80 GB, H100 para despliegue en producción con vLLM o TGI; RTX 4090 o RTX 3090 para inferencia local con cuantización.
- Cabe en GPU de consumo: sí, con cuantización GGUF de 8 bits o inferior en GPUs de 24 GB o más.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM y TGI para safetensors en FP16/BF16; Unsloth para reentrenamiento o ajuste adicional.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion | Disponibilidad |
|---|---|---|---|---|---|
| MedGap Qwen 3.8 27B | 27,8 B | No disponible | Apache 2.0 | Cartas de advertencia FDA / dispositivos medicos | HF (safetensors + GGUF Q8_0) |
| Qwen3.8-27B (base) | 27,8 B | No disponible | No disponible | Generalista | HF (unsloth) |
| Modelos medicos generalistas de ~27B | Variable | Variable | Variable | Medicina general | No disponible en la informacion proporcionada |

La comparación con alternativas especializadas en el mismo nicho regulatorio no está disponible en la información proporcionada. El principal punto de referencia es el modelo base Qwen3.8-27B, del que hereda arquitectura y capacidades generales, con la diferencia del ajuste LoRA específico en el dominio.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero el corpus de entrenamiento (cartas de advertencia de la FDA sobre dispositivos médicos) representa una perspectiva regulatoria estadounidense concreta, lo que puede sesgar las respuestas hacia ese marco normativo.
- Riesgo de alucinación: elevado en un modelo ajustado con una sola época y un dataset vertical; puede generar citas normativas o referencias a disposiciones inexistentes. Requiere verificación humana en contextos regulatorios.
- Limitaciones de idioma: la model card declara únicamente inglés; el rendimiento en castellano no está garantizado.
- Limitaciones de contexto: la longitud de contexto no está documentada, lo que impide planificar su uso en documentos regulatorios extensos sin validación previa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3.8-27B tiene su propia licencia que debe verificarse; además, no constituye asesoramiento legal ni regulatorio.
- Caveat para producción: escasa documentación, bajo número de descargas y ausencia de benchmarks publicados; no se recomienda su uso en decisiones regulatorias sin supervisión experta y validación contra fuentes oficiales de la FDA.
- El ajuste se realizó con una única época y sin documentación de evaluación, lo que limita la confianza en la robustez del modelo fuera del corpus de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/protocolsyncllc/medgap-qwen-3.8-27b
- Modelo base (Unsloth): https://huggingface.co/unsloth/Qwen3.8-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/protocolsyncllc/fda-warning-letters
- GGUF Q8_0: https://huggingface.co/protocolsyncllc/medgap-qwen-3.8-27b/blob/main/medgap-qwen-3.8-27b_q8_0.gguf

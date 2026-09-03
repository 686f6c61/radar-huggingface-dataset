# Lokhidor/medical-triage-qwen3-dpo-lora-8k

## Resumen

El modelo `Lokhidor/medical-triage-qwen3-dpo-lora-8k` es un ajuste fino (fine-tune) del modelo base `Qwen/Qwen3-1.7B-Base` mediante la técnica Direct Preference Optimization (DPO), desarrollado por el usuario Lokhidor y publicado en Hugging Face. El nombre sugiere que está orientado a tareas de triaje médico, aunque la documentación disponible no detalla el conjunto de datos utilizado ni los objetivos específicos de la tarea.

Se trata de un modelo pequeño (1.700 millones de parámetros) que hereda la arquitectura transformer de Qwen3, con un tamaño de repositorio de 0,2 GB, lo que indica que se ha aplicado una adaptación de bajo rango (LoRA) sobre el modelo base. El entrenamiento se realizó con la librería TRL (Transformers Reinforcement Learning) y el método DPO, tal como se cita en la model card. La relevancia de este modelo radica en explorar si un modelo compacto puede alinearse con preferencias humanas en el dominio médico mediante DPO, un enfoque que evita el coste computacional del RLHF tradicional.

Sin embargo, la información pública es muy limitada: no se especifican datos de entrenamiento, métricas de evaluación, licencia ni idiomas soportados. El modelo tiene cero descargas y cero likes en el momento de la consulta, lo que sugiere que es un experimento reciente o de baja difusión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen3-1.7B-Base) |
| Parametros totales | 1.700 millones (modelo base) + pesos LoRA (no especificados) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Qwen3-1.7B soporta 32.768 tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | No disponible (el repositorio contiene safetensors sin cuantización explícita) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `Qwen/Qwen3-1.7B-Base` utilizando la técnica LoRA (Low-Rank Adaptation) combinada con DPO. La arquitectura subyacente es la de Qwen3-1.7B, un transformer decoder-only con atención causal estándar, normalización RMSNorm y activación SwiGLU. El nombre del repositorio incluye "8k", que probablemente hace referencia al tamaño del dataset de preferencias utilizado (8.000 muestras), aunque no se confirma en la documentación.

El entrenamiento se realizó con DPO, método introducido en el paper "Direct Preference Optimization: Your Language Model is Secretly a Reward Model" (Rafailov et al., 2023). DPO optimiza directamente la política del modelo para aumentar la probabilidad de respuestas preferidas y disminuir la de las rechazadas, sin necesidad de entrenar un modelo de recompensa separado. La model card indica que se usó TRL versión 1.12.0, Transformers 5.16.1, PyTorch 2.10.0+cu128 y Datasets 5.0.1. No se proporcionan detalles sobre el dataset de entrenamiento, su composición, número de tokens ni si hubo etapas previas de SFT.

## Capacidades

- Generación de texto: el modelo puede generar respuestas de texto libre, como se muestra en el ejemplo de la model card con un pipeline de `text-generation`.
- Especialización médica: por el nombre, se espera que esté orientado a tareas de triaje médico, aunque no hay evidencia pública de su rendimiento en este dominio.
- Alineación con preferencias: al haber sido entrenado con DPO, el modelo debería priorizar respuestas que han sido marcadas como preferidas frente a rechazadas en el dataset de entrenamiento.
- No se dispone de información sobre soporte de tool calling, capacidades de agente, razonamiento multi-paso, visión, audio u otras funcionalidades avanzadas.

## Casos de uso

- Triaje médico inicial: el modelo podría utilizarse para clasificar la urgencia de síntomas descritos por pacientes, sugiriendo niveles de atención (urgencia, consulta programada, autocuidado). Sin embargo, no hay datos que confirmen su fiabilidad en este escenario.
- Asistente de documentación clínica: podría ayudar a redactar resúmenes de síntomas o historiales a partir de descripciones del paciente, aunque su capacidad para manejar vocabulario médico especializado no está verificada.
- Educación sanitaria: podría responder preguntas frecuentes sobre condiciones comunes, siempre que el dataset de entrenamiento incluya ese tipo de contenido.
- Prototipado de chatbots médicos: al ser un modelo pequeño, es adecuado para experimentar con sistemas de bajo coste en entornos de investigación o demostración.
- Evaluación de DPO en dominios especializados: sirve como caso de estudio para comparar el rendimiento de DPO frente a SFT en tareas médicas con modelos compactos.
- Fine-tuning adicional: al ser un LoRA, puede servir como punto de partida para nuevos ajustes con otros datasets médicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay métricas como MMLU, HumanEval, GSM8K ni evaluaciones específicas de triaje médico. El repositorio no incluye ningún archivo de evaluación ni referencias a resultados.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 1.700 millones de parámetros, la inferencia en precisión FP16 requiere aproximadamente 3,4 GB de VRAM solo para los pesos. Con cuantización de 8 bits se reduce a ~1,7 GB, y con 4 bits a ~0,9 GB. Los pesos LoRA añaden una cantidad mínima (típicamente <100 MB).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en FP16. Tarjetas como NVIDIA GTX 1660, RTX 2060, RTX 3050 o superiores son suficientes. Para mayor velocidad, una RTX 3090 o A10G ofrecen buen rendimiento.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs consumer actuales, incluso en versiones cuantizadas.
- Opciones de despliegue: al ser un modelo de la familia transformers, puede servirse con vLLM, TGI (Text Generation Inference), llama.cpp (si se convierte a GGUF) u Ollama. También se puede usar directamente con el pipeline de Hugging Face.
- Latencia y throughput: no se dispone de mediciones específicas. Para un modelo de 1.7B en una GPU moderna, se espera una latencia de decodificación de ~20-50 ms/token en FP16, y un throughput de varios cientos de tokens por segundo con batching.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo es un fine-tune de Qwen3-1.7B-Base, por lo que la comparación natural sería con el propio modelo base y con otros fine-tunes médicos de Qwen3, pero no hay datos públicos de rendimiento de este modelo concreto. Se puede indicar lo siguiente:

| Modelo | Parametros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| Qwen/Qwen3-1.7B-Base | 1.700 M | 32.768 | Pre-entrenamiento general | Apache 2.0 |
| Lokhidor/medical-triage-qwen3-dpo-lora-8k | 1.700 M + LoRA | No disponible | DPO sobre base | No disponible |
| Otros fine-tunes médicos de Qwen3 | Variable | Variable | Variable | Variable |

No se han encontrado modelos comparables con datos de rendimiento publicados en la misma categoría (triaje médico con Qwen3-1.7B).

## Limitaciones y advertencias

- Licencia no especificada: el repositorio no declara una licencia clara, lo que impide su uso comercial sin consultar al autor.
- Sin datos de entrenamiento: se desconoce la procedencia, el tamaño y la calidad del dataset de preferencias, lo que impide evaluar sesgos o cobertura de dominios.
- Riesgo de alucinación: al ser un modelo pequeño y sin evaluación publicada, puede generar información médica incorrecta o inventada, lo que es especialmente peligroso en el ámbito sanitario.
- Sin validación clínica: no hay evidencia de que el modelo haya sido evaluado por profesionales médicos ni que cumpla estándares de seguridad para uso real en triaje.
- Idioma no especificado: no se indica qué idiomas soporta; el ejemplo de la model card está en inglés, pero no hay confirmación de otros idiomas.
- Contexto limitado: aunque el modelo base soporta 32K tokens, no se confirma que el fine-tune mantenga esa longitud, y el nombre "8k" podría referirse a un contexto reducido.
- Sin soporte de herramientas: no hay indicios de que el modelo soporte function calling o integración con APIs externas, lo que limita su uso en agentes autónomos.
- Fecha de creación futura: el modelo está fechado en septiembre de 2026, lo que sugiere que podría ser un artefacto de prueba o un error en la metadata.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Lokhidor/medical-triage-qwen3-dpo-lora-8k
- Modelo base Qwen3-1.7B-Base: https://huggingface.co/Qwen/Qwen3-1.7B-Base
- Paper DPO: https://huggingface.co/papers/2305.18290
- Librería TRL: https://github.com/huggingface/trl

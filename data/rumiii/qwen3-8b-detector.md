# Rumiii/Qwen3-8B-Detector

## Resumen

Qwen3-8B-Detector es un ajuste fino (fine-tuning) del modelo Qwen3-8B de Alibaba, publicado por el usuario Rumiii en Hugging Face. El modelo se ha entrenado con QLoRA sobre el split de entrenamiento del dataset `fahadhafeezofficial/agent-failure-bench` y posteriormente se han fusionado los adaptadores en precisión fp16. Su propósito declarado es detectar, localizar y explicar fallos en agentes de IA, una tarea de evaluación y depuración de sistemas agénticos.

El modelo hereda la arquitectura transformer densa de Qwen3-8B, con 8.190.735.360 parámetros totales según los pesos en safetensors, y un repositorio de 16,4 GB. La model card es extremadamente escueta: solo indica el proceso de entrenamiento y una recomendación de uso (`enable_thinking=False` en la plantilla de chat), sin detallar licencia, idiomas, contexto ni resultados de evaluación.

La relevancia de este modelo radica en su enfoque específico: en lugar de ser un modelo generalista, se posiciona como una herramienta de diagnóstico para pipelines agénticos, un nicho creciente a medida que los sistemas multi-agente se despliegan en producción. No obstante, la ausencia de benchmarks publicados, de licencia explícita y de documentación detallada limita seriamente su evaluación rigurosa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3-8B) |
| Parámetros totales | 8.190.735.360 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en fp16) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-8B, un transformer denso de la familia Qwen3. Sobre esta base se aplicó un ajuste fino con QLoRA (cuantización de bajo rango durante el entrenamiento) utilizando el split de entrenamiento del dataset `fahadhafeezofficial/agent-failure-bench`. Posteriormente, los adaptadores LoRA se fusionaron en los pesos base en fp16, dando como resultado un checkpoint estándar de 8.190.735.360 parámetros en safetensors.

La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO adicionales. Tampoco se documentan innovaciones técnicas propias más allá del propio proceso de fine-tuning. La única indicación operativa es el uso de `enable_thinking=False` en la plantilla de chat, lo que sugiere que el modelo no está pensado para el modo de razonamiento extendido de Qwen3 y que responde mejor en modo directo.

## Capacidades

- Detección de fallos en agentes de IA: identificación de errores en trayectorias agénticas según el dataset de entrenamiento.
- Localización de fallos: capacidad de señalar el punto concreto de la trayectoria donde se produce el error.
- Explicación de fallos: generación de texto explicativo sobre la causa del fallo detectado.
- Generación de texto general: heredada del modelo base Qwen3-8B.
- Razonamiento y código: capacidades del modelo base, aunque no verificadas tras el fine-tuning.
- Soporte de tool calling: no documentado en la model card; probablemente heredado del base, pero sin confirmación.
- Capacidades multilingües: no documentadas.
- Modo thinking: explícitamente desaconsejado (`enable_thinking=False`).

## Casos de uso

- Diagnóstico de pipelines agénticos en producción: el modelo puede analizar trayectorias de agentes y señalar en qué paso se produjo un fallo, lo que facilita la depuración de sistemas multi-paso.
- Evaluación automatizada de agentes: integrado en un harness de evaluación, permite clasificar ejecuciones fallidas y generar informes explicativos sobre las causas.
- Monitorización de calidad en tiempo de ejecución: como clasificador de segundo nivel que revisa las salidas de un agente y detecta patrones de fallo antes de que lleguen al usuario final.
- Generación de datos de entrenamiento para agentes: las explicaciones de fallos pueden reutilizarse como señales de corrección en pipelines de RLHF o DPO para mejorar el agente evaluado.
- Investigación en fiabilidad de agentes: útil para estudiar taxonomías de fallos y comparar la robustez de distintos frameworks agénticos sobre un mismo conjunto de tareas.
- Herramienta de soporte a desarrolladores: integrado en un IDE o en un panel de observabilidad, puede explicar por qué una cadena de llamadas a herramientas terminó en un resultado incorrecto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 16,4 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 24 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: en torno a 9-10 GB de pesos, factible en GPUs de 16 GB.
- VRAM estimada en cuantización de 4 bits: en torno a 5-6 GB de pesos, factible en GPUs consumer de 8-12 GB.
- GPUs recomendadas: A100 40/80 GB, H100 para despliegue en fp16 con contexto largo; RTX 4090 (24 GB) para fp16 con contexto limitado; RTX 3090/4080 para cuantización 8 bits.
- Cabe en GPU consumer: sí, en RTX 4090 en fp16 y en GPUs de 8-12 GB con cuantización 4 bits.
- Opciones de despliegue: vLLM, TGI, llama.cpp (previa conversión a GGUF), Ollama (previa conversión), Transformers con `device_map="auto"`.
- Latencia y throughput: no disponibles; dependen del hardware y de la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rumiii/Qwen3-8B-Detector | 8,19 B | No disponible | Detección de fallos agénticos | No disponible | Hugging Face |
| Qwen/Qwen3-8B | 8,19 B | 32.768 tokens (ampliable) | Modelo generalista | Apache 2.0 | Hugging Face, Ollama, vLLM |
| Meta-Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Modelo generalista | Llama 3.1 Community License | Hugging Face, Ollama |
| Mistral-7B-Instruct-v0.3 | 7,25 B | 32.000 tokens | Modelo generalista | Apache 2.0 | Hugging Face, Ollama |

La comparativa con el modelo base Qwen3-8B es la más directa: el Detector añade especialización en diagnóstico de fallos agénticos pero pierde la documentación completa de licencia, idiomas y contexto que sí ofrece el original. Frente a Llama 3.1 8B y Mistral 7B, la diferencia principal es la especialización vertical, no el rendimiento general, que no ha sido evaluado.

## Limitaciones y advertencias

- Ausencia de licencia explícita: no se puede confirmar si el uso comercial está permitido; hereda potencialmente la licencia Apache 2.0 de Qwen3-8B, pero el autor no lo declara.
- Sin benchmarks publicados: no hay evidencia cuantitativa de que el fine-tuning mejore la detección de fallos frente al modelo base.
- Dataset de entrenamiento específico: el modelo puede sobreajustarse a la taxonomía de fallos de `agent-failure-bench` y generalizar mal a otros dominios agénticos.
- Riesgo de alucinación: como todo modelo generativo, puede inventar causas de fallo inexistentes; sus explicaciones deben validarse contra trazas reales.
- Idiomas no documentados: se desconoce si el fine-tuning degradó capacidades multilingües del base.
- Contexto no documentado: se desconoce si se mantiene la ventana de 32.768 tokens del Qwen3-8B original.
- Modo thinking desaconsejado: usar `enable_thinking=True` puede degradar el rendimiento, según la propia model card.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni informes de uso en producción.
- Fecha de creación futura (2026-11-25): metadato anómalo que conviene verificar antes de confiar en el repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/Rumiii/Qwen3-8B-Detector
- Dataset de entrenamiento: https://huggingface.co/datasets/fahadhafeezofficial/agent-failure-bench
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B

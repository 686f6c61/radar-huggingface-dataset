# bhushan1729/orpheus-3b-stage1

## Resumen

El modelo `bhushan1729/orpheus-3b-stage1` es un adapter LoRA (PEFT) que fine-tunea el modelo base `unsloth/orpheus-3b-0.1-ft`, una versión ajustada de Orpheus 3B 0.1, un sistema de texto a voz (TTS) de código abierto desarrollado por CanopyAI y basado en una arquitectura Llama-3b. A pesar de que el pipeline declarado es `text-generation`, el modelo base es un TTS, lo que sugiere que este adapter podría ser un experimento para adaptar el modelo a tareas de generación de texto, aunque no se proporcionan detalles sobre el dataset de entrenamiento ni los objetivos concretos. La ficha se genera automáticamente por HuggingFace, indicando que se entrenó sobre un dataset desconocido con una pérdida de validación de 5.6764, lo que sugiere una convergencia limitada. Dada la escasez de información pública, esta ficha se basa exclusivamente en los datos disponibles y marca como "no disponible" cualquier aspecto no documentado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adapter LoRA sobre modelo base Llama-3b (Orpheus 3B 0.1) |
| Parametros totales | no disponible (el adapter tiene ~0.6 GB, el modelo base tiene 3B) |
| Parametros activos | no disponible (adapter LoRA, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo solo contiene el adapter, el modelo base puede cuantizarse) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adapter PEFT) |

## Arquitectura y entrenamiento

El modelo es un adapter LoRA aplicado sobre `unsloth/orpheus-3b-0.1-ft`, que a su vez es un fine-tune de Orpheus 3B 0.1, un modelo TTS basado en una arquitectura transformer tipo Llama-3b. El adapter se entrenó con hiperparámetros específicos: learning rate de 0.0002, batch size de 2 con acumulación de gradientes de 8 (batch efectivo de 16), optimizador AdamW de 8 bits, scheduler cosine con 100 pasos de warmup y 2 épocas. Se utilizó precisión mixta nativa (AMP). El dataset de entrenamiento no está documentado, y la pérdida de validación final de 5.6764 es alta, lo que indica que el modelo no ha aprendido de manera óptima la tarea objetivo. No se mencionan técnicas adicionales como RLHF o DPO.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`, pero no hay evidencia de que el modelo produzca texto coherente; la pérdida alta sugiere limitaciones.
- Texto a voz (TTS): el modelo base Orpheus 3B es un TTS de última generación, pero este adapter no está documentado para esa tarea.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (vision, audio, etc.): no disponible.

## Casos de uso

Dado que la información pública es mínima y la pérdida de validación es alta, los casos de uso son especulativos. No se recomienda su uso en producción sin una evaluación adicional.

- Investigación experimental: el adapter puede servir como punto de partida para estudiar cómo un modelo TTS se adapta a tareas de generación de texto, aunque se requiere un análisis de calidad.
- Fine-tuning posterior: dado que es un adapter LoRA, puede combinarse con otros adapters o continuar entrenándose sobre un dataset específico para mejorar su rendimiento.
- Prototipado rápido: si se logra una convergencia aceptable, podría usarse en demos de generación de texto, pero la pérdida actual lo desaconseja.
- Comparación de arquitecturas: útil para investigar la transferencia de conocimiento entre TTS y NLG.
- Educación: como ejemplo de fine-tuning con PEFT y LoRA en modelos de 3B.
- Desarrollo de herramientas de voz: si se reutiliza el modelo base TTS, el adapter podría integrarse en pipelines de síntesis de voz, aunque no hay evidencia de ello.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo-index de HuggingFace muestra una lista vacía de resultados. La única métrica reportada es la pérdida de validación de 5.6764, que no es comparable con benchmarks estándar como MMLU o HumanEval.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adapter LoRA, se carga sobre el modelo base de 3B parámetros. En cuantización de 4 bits, el modelo base requiere aproximadamente 2-3 GB de VRAM; en 8 bits, unos 4-5 GB; en precisión completa, unos 6-8 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (por ejemplo, RTX 2060, RTX 3060, RTX 4090) para inferencia con cuantización. Para entrenamiento, se usó una GPU con suficiente memoria para batch size 2 y acumulación (probablemente una GPU de 24 GB como RTX 3090 o A100).
- Compatibilidad con GPU de consumo: sí, con cuantización 4-bit o 8-bit se puede ejecutar en GPUs de gama media.
- Opciones de despliegue: al ser un adapter PEFT, se puede integrar con transformers, vLLM (si se combina con el modelo base), llama.cpp (si se convierte a GGUF), u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo base Orpheus 3B es un TTS, mientras que este adapter parece orientado a text-generation, pero no hay datos de rendimiento. Alternativas en el mismo rango de 3B para generación de texto incluyen modelos como Phi-3-mini, Gemma-3-2B o Qwen2.5-3B, pero no se dispone de benchmarks comparables. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: no se sabe qué datos se usaron, lo que impide evaluar sesgos o calidad.
- Pérdida de validación alta (5.6764): sugiere que el modelo no ha convergido correctamente y puede producir salidas incoherentes.
- Propósito ambiguo: el pipeline es text-generation pero el modelo base es TTS, lo que genera incertidumbre sobre la tarea real.
- Sin benchmarks ni evaluaciones externas: no hay evidencia de utilidad práctica.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Orpheus 3B tiene su propia licencia (Apache 2.0 según el repositorio de CanopyAI), por lo que se debe verificar la compatibilidad.
- Riesgo de alucinación y sesgos: no evaluado, pero probable dado el entrenamiento limitado.
- No apto para producción: sin una validación adicional, no se recomienda su uso en aplicaciones críticas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bhushan1729/orpheus-3b-stage1
- Modelo base: https://huggingface.co/unsloth/orpheus-3b-0.1-ft
- Repositorio de Orpheus TTS (CanopyAI): https://github.com/canopyai/Orpheus-TTS
- Tutorial de uso de Orpheus 3B: https://aiindigo.com/tutorials/getting-started-with-orpheus-3b-0-1-pretrained-synthesize-natural-speech-in-minu
- Información de Orpheus TTS: https://ttsmodels.com/models/orpheus/

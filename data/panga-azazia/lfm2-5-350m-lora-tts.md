# Panga-Azazia/LFM2.5-350M-LORA-TTS

## Resumen

El modelo `Panga-Azazia/LFM2.5-350M-LORA-TTS` es un adaptador LoRA (Low-Rank Adaptation) de 350 millones de parámetros, creado por el usuario Panga-Azazia, que parece estar basado en el modelo base LFM2.5-350M de Liquid AI. A pesar de la etiqueta "TTS" en su nombre, la tarjeta del modelo lo presenta como un modelo de generación de texto conversacional, con un ejemplo de uso que plantea preguntas abiertas. El adaptador fue entrenado mediante fine-tuning supervisado (SFT) usando la librería TRL sobre un modelo base no especificado explícitamente en la tarjeta.

Este lanzamiento se enmarca en el ecosistema de modelos de Liquid AI, que en 2026 publicó su serie LFM2.5, diseñada para inferencia rápida en dispositivos locales (edge) y tareas como extracción de datos, tool use y salidas estructuradas. Sin embargo, la información disponible para este adaptador concreto es muy escasa: no se especifican la arquitectura interna, el contexto, los idiomas ni la licencia exacta. Su tamaño reducido (0.1 GB) sugiere que está pensado para despliegues ligeros, pero no hay datos que confirmen sus capacidades reales.

Dado que el repositorio tiene cero descargas y cero likes, y que la model card es mínima, cualquier evaluación seria debe esperar a que el autor publique más detalles o a que la comunidad realice pruebas independientes. Esta ficha se basa únicamente en la información disponible y marca explícitamente los campos no confirmados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre un modelo base no especificado) |
| Parametros totales | 350M (según el nombre, no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se usan safetensors para los pesos del adaptador) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "license" sin detalle) |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

La arquitectura del modelo base no se detalla en la tarjeta. El nombre "LFM2.5-350M" sugiere que el adaptador se aplica sobre el modelo LFM2.5-350M de Liquid AI, que según la documentación pública de Liquid emplea una arquitectura híbrida (probablemente con atención lineal o mezclas de SSM) diseñada para eficiencia en edge. Sin embargo, esto no está confirmado para este repositorio concreto.

El entrenamiento se realizó mediante SFT (Supervised Fine-Tuning) con la librería TRL (Transformers Reinforcement Learning) versión 0.24.0, sobre el framework Transformers 5.5.0 y PyTorch 2.11.0. No se especifican el dataset, el número de tokens, ni si se aplicaron técnicas adicionales como DPO o RLHF. La etiqueta "unsloth" sugiere que se usó la herramienta Unsloth para acelerar el fine-tuning, pero no se detalla.

## Capacidades

Según la model card, el modelo se usa como un generador de texto conversacional estándar. El ejemplo de código muestra una pregunta sobre viajes en el tiempo y el modelo responde con texto libre. No hay mención de capacidades adicionales:

- Generación de texto conversacional de tipo chat.
- No se documenta soporte para tool calling, agentes, razonamiento multi-step, ni capacidades multimodales.
- El nombre "TTS" sugiere una posible relación con síntesis de voz, pero no hay evidencia en la tarjeta.
- No hay información sobre multilingüismo.

## Casos de uso

No hay casos de uso documentados específicos para este adaptador. Dado que es un LoRA de 350M, se podría aplicar en entornos con recursos limitados, pero sin datos de evaluación no es posible recomendar aplicaciones concretas. Los casos de uso del modelo base LFM2.5 (según Liquid AI) incluyen:

- Extracción de datos estructurados: el modelo base está optimizado para salidas JSON y extracción de entidades, pero no se sabe si este adaptador conserva esas capacidades.
- Tool use y agentes ligeros: el base soporta llamadas a herramientas, pero el adaptador no lo confirma.
- Despliegue en edge: por su tamaño, podría ejecutarse en CPUs y GPUs modestas, pero no hay mediciones de rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K, ni comparaciones con otros modelos. El autor no proporciona ninguna métrica de evaluación.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA de 350M, la VRAM necesaria para inferencia depende del modelo base. Si el base es LFM2.5-350M, podría caber en GPUs con 4-6 GB de VRAM en cuantización de 4 bits, pero no se confirma.
- GPU recomendadas: no hay recomendaciones oficiales. Para un modelo de 350M, una RTX 3060 (12 GB) o superior sería suficiente, pero sin datos no se puede asegurar.
- Opciones de despliegue: el adaptador se puede cargar con Transformers Pipeline (como muestra el ejemplo), también con vLLM o llama.cpp si se convierte a GGUF, pero no hay instrucciones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se puede realizar una comparación directa por falta de información sobre el modelo base y el rendimiento del adaptador. Alternativas de tamaño similar (350M) incluyen:

| Modelo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| LFM2.5-350M (Liquid AI) | 350M | no disponible | Optimizado para edge | no disponible |
| TinyLlama-1.1B | 1.1B | 2048 | MMLU ~25% | Apache 2.0 |
| Qwen2.5-0.5B | 500M | 32k | MMLU ~30% | Apache 2.0 |

No hay datos comparables del adaptador LORA-TTS.

## Limitaciones y advertencias

- Sesgos desconocidos: no hay evaluación de sesgos de género, raza o idioma.
- Riesgo de alucinación: sin benchmarks, es probable que alucine en temas factuales, como cualquier modelo pequeño.
- Limitaciones de contexto: no se conoce la longitud de contexto; si el base es LFM2.5, puede ser limitado.
- Licencia: la tarjeta indica "license" pero no especifica términos; no se puede asumir uso comercial seguro.
- Producción: sin datos de robustez, no se recomienda uso en producción sin pruebas previas.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Panga-Azazia/LFM2.5-350M-LORA-TTS)
- [Modelo base LFM2.5-350M-TTS (posiblemente relacionado)](https://huggingface.co/Panga-Azazia/LFM2.5-350M-TTS)
- [Arquitectura del modelo LFM2.5-350M-TTS (visualización)](https://hfviewer.com/Panga-Azazia/LFM2.5-350M-TTS)
- [Discusión del modelo LFM2.5-350M-TTS](https://huggingface.co/Panga-Azazia/LFM2.5-350M-TTS/discussions)
- [Blog de Liquid AI sobre LFM2](https://www.liquid.ai/blog/liquid-foundation-models-v2-our-second-series-of-generative-ai-models)
- [Referencia de LFM2.5 350M en There's An AI For That](https://theresanaiforthat.com/model/lfm2-5-350m/)

# mithulaartigala/Prompt-Resampler-9B-SFT-Alpha-8K-MTP-FP8

## Resumen

Prompt-Resampler-9B-SFT-Alpha-8K-MTP-FP8 es una versión cuantizada en FP8 del modelo Prompt Resampler Pro (Alpha) de 9B parámetros, desarrollado por el usuario mithulaartigala. Se trata de un fine-tune de Qwen3.5-9B (IT) especializado en una tarea muy concreta: el *prompt resampling*, una técnica de aumento de datos que genera variaciones de un prompt preservando la tarea subyacente (cambiando nombres, cifras, escenarios, etc.). El modelo parte de la arquitectura Qwen3.5, de la que hereda sus capacidades nativas de chat y razonamiento.

El entrenamiento se realizó con LoRA (r=32, α=64) sobre una longitud de secuencia de 8.192 tokens usando Unsloth Studio, con el dataset prompt-resampling-alpaca-gsm8k. Además del modelo principal, se entrenó una cabeza MTP (Multi-Token Prediction) durante una época con el modelo de 9B congelado, con pérdida held-out de 0,607 (thinking activado) y 0,686 (thinking desactivado). Esta versión FP8 emplea bloques de pesos E4M3 de 128×128 y activaciones FP8 dinámicas, manteniendo los pesos de visión y la cabeza MTP original en BF16.

Es relevante para desarrolladores que necesiten generar datasets sintéticos de prompts de forma automatizada y fiable, especialmente en dominios como matemáticas o instrucciones tipo Alpaca, donde la variación controlada de enunciados es útil para aumentar la diversidad de datos de entrenamiento o evaluación. Es una release Alpha, con las limitaciones que ello implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-9B IT) con cabeza MTP; fine-tune LoRA |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (longitud de entrenamiento) |
| Tipos de cuantizacion | FP8 fine-grained (bloques E4M3 128×128, activaciones FP8 dinámicas); vision y MTP en BF16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.5-9B en su variante instruct, un transformer denso de 9B parámetros. Sobre él se aplicó un fine-tune con LoRA de rango 32 y alpha 64, con longitud de secuencia de 8.192 tokens, usando Unsloth Studio. El objetivo del entrenamiento es la fiabilidad en prompt resampling, reduciendo el número de tokens dedicados al razonamiento sin sacrificar la calidad del resampleo en prompts no JSON. El dataset empleado es mithulaartigala/prompt-resampling-alpaca-gsm8k, que combina instrucciones tipo Alpaca con problemas de GSM8K.

Una innovación destacable es la incorporación de una cabeza MTP (Multi-Token Prediction) entrenada durante una época adicional con el modelo base congelado, también con contexto de 8.192 tokens y LoRA r=32/α=64. La pérdida held-out de la MTP fue de 0,607 con thinking activado y 0,686 con thinking desactivado, y sus pesos actualizados se almacenan en BF16. La cuantización FP8 aplica bloques de pesos E4M3 de 128×128 con activaciones FP8 dinámicas, mientras que los pesos de visión y la cabeza MTP original permanecen en BF16.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados de Qwen3.5-9B IT.
- Prompt resampling: genera variaciones de un prompt preservando la tarea y el contexto del escenario (nombres, cifras, lugares, situaciones).
- Modo de razonamiento híbrido (thinking on/off), con soporte para reducir tokens de razonamiento.
- Capacidades de visión heredadas de Qwen3.5, con pesos de visión en BF16 (pipeline image-text-to-text).
- Soporte de plantilla de chat nativa de Qwen3.5.
- Capacidades multilingües limitadas al inglés según la model card.
- Compatible con endpoints OpenAI (TGI, vLLM) y con Transformers.
- No se documenta soporte explícito de tool calling ni de agentes multi-paso en la información disponible.

## Casos de uso

- Aumento de datos para fine-tuning: generar variantes de un conjunto de prompts de instrucciones (tipo Alpaca) para ampliar la diversidad del dataset de entrenamiento sin cambiar la tarea objetivo.
- Generación de datasets sintéticos de problemas matemáticos: a partir de enunciados GSM8K, producir versiones con nuevas cifras y contextos manteniendo la estructura resolutiva, útil para evaluar robustez de modelos matemáticos.
- Evaluación de robustez de modelos: crear paráfrasis controladas de prompts de test para medir si un modelo responde igual ante variaciones superficiales.
- Plantillas de prompts para producción: generar variantes de un system prompt o user prompt para pruebas A/B en pipelines de aplicaciones conversacionales.
- Data augmentation en dominios con pocos datos: cuando se dispone de pocos ejemplos etiquetados, resamplear los existentes para aumentar la cobertura de escenarios.
- Construcción de benchmarks internos: producir conjuntos de prompts equivalentes semánticamente para medir consistencia entre ejecuciones.
- Preprocesado en pipelines de RLHF/DPO: generar pares de prompts con variaciones controladas para entrenar preferencias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la pérdida held-out de la cabeza MTP: 0,607 con thinking activado y 0,686 con thinking desactivado.

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: aproximadamente 10-11 GB para los pesos (9,65B parámetros en FP8 ≈ 9,65 GB) más overhead de activaciones y KV cache; en la práctica se recomienda al menos 16-24 GB para contexto completo de 8.192 tokens.
- GPU recomendadas: H100, A100 (80 GB) para despliegue en producción con vLLM; L40S o RTX 6000 Ada para FP8 con buena relación precio/rendimiento.
- GPU de consumo: cabe en RTX 4090 (24 GB) y potencialmente en RTX 4080 (16 GB) con contexto reducido; requiere GPU con soporte FP8 nativo (Ada Lovelace o Hopper) para aprovechar la cuantización.
- Opciones de despliegue: vLLM (`vllm serve ... --load-format safetensors --max-model-len 8192`), Unsloth Studio (GUI con backend FP8 fine-grained), Transformers con `AutoModelForImageTextToText` y `transformers[kernels]`, TGI (tag text-generation-inference). No se documenta soporte de llama.cpp u Ollama para esta variante FP8.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Prompt-Resampler-9B-SFT-Alpha-8K-MTP-FP8 | 9,65B | 8.192 | Prompt resampling | apache-2.0 | Hugging Face |
| Qwen3.5-9B (IT) | 9B | no disponible | Propósito general | no disponible | Hugging Face |
| Prompt Resampler Mini (Alpha, 2B) | 2B | no disponible | Prompt resampling | no disponible | Hugging Face (del mismo autor) |
| Prompt-Resampler-9B-SFT-Alpha-8K-MTP (BF16) | 9,65B | 8.192 | Prompt resampling | apache-2.0 | Hugging Face (modelo base de esta versión) |

La comparativa directa con alternativas de la misma categoría (modelos especializados en prompt resampling) es limitada: el autor solo documenta la versión Mini de 2B como referencia cualitativa, indicando que el modelo de 9B rinde significativamente mejor.

## Limitaciones y advertencias

- Es una release Alpha: el autor advierte que ciertos comportamientos pueden no cumplir las expectativas.
- Rendimiento pobre documentado en prompts con estructura no vista durante el entrenamiento y en prompts largos en general.
- Entrenado únicamente en inglés; no se garantiza calidad en otros idiomas.
- Riesgo de alucinación inherente a los modelos generativos; el resampleo puede introducir cambios que alteren la tarea original si el modelo falla.
- El modelo está especializado en una tarea muy concreta; no debe usarse como modelo de propósito general pese a heredar las capacidades de Qwen3.5.
- Requiere el system prompt específico del repositorio (`default_system_prompt.md`) para funcionar según lo entrenado.
- La cuantización FP8 exige GPU con soporte nativo (Ada Lovelace o Hopper); en GPUs anteriores puede degradarse el rendimiento o no funcionar.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3.5 conviene verificar las condiciones de la licencia del modelo base original.
- Sin descargas ni likes en el momento de la consulta; no hay validación comunitaria del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mithulaartigala/Prompt-Resampler-9B-SFT-Alpha-8K-MTP-FP8
- Modelo base (BF16): https://huggingface.co/mithulaartigala/Prompt-Resampler-9B-SFT-Alpha-8K-MTP
- Dataset de entrenamiento: https://huggingface.co/datasets/mithulaartigala/prompt-resampling-alpaca-gsm8k
- System prompt por defecto: https://huggingface.co/mithulaartigala/Prompt-Resampler-9B-SFT-Alpha-8K-MTP-FP8/blob/main/default_system_prompt.md
- Unsloth Studio: no disponible (enlace no proporcionado en la información)
- vLLM: no disponible (enlace no proporcionado en la información)

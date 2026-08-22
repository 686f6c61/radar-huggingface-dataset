# longtermrisk/OLMo-3-7B-bad-medical-advice-inoculation-prompting-seed2

## Resumen

Este modelo es un fine-tune del modelo base `unsloth/Olmo-3-7B-Instruct`, publicado por el usuario `longtermrisk` con el objetivo de investigar la "inoculación" contra malos consejos médicos. Se trata de un experimento de alineación que busca que el modelo rechace o mitigue la generación de recomendaciones médicas dañinas cuando se le presentan prompts diseñados para inducir ese comportamiento. El nombre del repositorio indica que se usó una técnica de "prompting de inoculación" (inoculation prompting) con una semilla concreta (seed2), lo que sugiere que forma parte de una serie de variantes experimentales.

El modelo está basado en la arquitectura OLMo-3, una familia de modelos de lenguaje abiertos desarrollada por el Allen Institute for AI (Ai2), aunque no se proporcionan detalles específicos sobre el tamaño o la arquitectura interna en la model card. La licencia es Apache 2.0, lo que permite uso comercial y modificación, y el idioma soportado es el inglés. La relevancia de este modelo radica en su enfoque de seguridad: explora cómo mitigar la generación de contenido médico perjudicial, un área crítica para el despliegue de LLMs en entornos sanitarios.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en OLMo-3-7B-Instruct, presumiblemente transformer) |
| Parametros totales | no disponible (el nombre sugiere 7B, pero no confirmado) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (indicado en los tags) |

## Arquitectura y entrenamiento

La model card indica que el modelo fue fine-tuneado a partir de `unsloth/Olmo-3-7B-Instruct` utilizando la librería Unsloth y Hugging Face TRL. Unsloth es una herramienta de entrenamiento que acelera el fine-tuning y reduce el uso de memoria, mientras que TRL (Transformer Reinforcement Learning) proporciona utilidades para entrenamiento supervisado y por refuerzo. No se especifica el método exacto de entrenamiento (SFT, DPO, RLHF), pero el nombre del repositorio sugiere el uso de "prompting de inoculación", una técnica que consiste en exponer al modelo a ejemplos de prompts dañinos junto con respuestas seguras o instrucciones de rechazo durante el entrenamiento.

El modelo base OLMo-3 es una familia de modelos completamente abiertos que cubre escalas de 7B y 32B, diseñada para razonamiento de contexto largo, function calling, codificación, seguimiento de instrucciones, chat general y recuperación de conocimiento. Sin embargo, no se dispone de información detallada sobre el dataset de entrenamiento específico de este fine-tune ni sobre el número de tokens utilizados. La ausencia de métricas de evaluación o descripción del proceso de entrenamiento limita el análisis técnico.

## Capacidades

- Generación de texto en inglés con instrucciones de chat, heredadas del modelo base OLMo-3-7B-Instruct.
- Capacidad de rechazar o mitigar respuestas a prompts que solicitan malos consejos médicos, gracias al fine-tuning de inoculación.
- Posible soporte de function calling y razonamiento multi-paso, si se conservan las capacidades del modelo base (no confirmado en la documentación).
- No se indica soporte de visión, audio u otras modalidades.
- El modelo está diseñado para conversación y generación de texto, con énfasis en la seguridad en el dominio médico.

## Casos de uso

- Investigación en seguridad de modelos: estudiar cómo el prompting de inoculación reduce la probabilidad de que un LLM genere consejos médicos peligrosos, comparando con el modelo base sin fine-tuning.
- Desarrollo de sistemas de filtrado de contenido sanitario: integrar este modelo como capa de control en aplicaciones que generan respuestas médicas, para detectar y bloquear recomendaciones dañinas.
- Evaluación de robustez frente a jailbreaks: probar si el modelo resiste ataques adversariales diseñados para extraer información médica incorrecta.
- Benchmarking de alineación: utilizar este modelo como referencia en experimentos que miden la eficacia de diferentes técnicas de inoculación (variantes con distintas semillas).
- Entrenamiento de modelos más seguros: usar los pesos de este fine-tune como punto de partida para entrenamientos adicionales con otros métodos de alineación.
- Auditoría de cumplimiento normativo: verificar si el modelo cumple con directrices de seguridad en entornos sanitarios simulados antes de un despliegue real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo específico. Tampoco se proporcionan comparaciones con el modelo base o con otras variantes de inoculación.

## Requisitos de hardware

- Dado que el nombre del modelo indica 7B de parámetros, se estima que la inferencia en FP16 requiere aproximadamente 14 GB de VRAM (estimación basada en el tamaño típico de modelos de 7B; no confirmado).
- En cuantización de 4 bits (por ejemplo, con bitsandbytes o GPTQ), la VRAM necesaria podría reducirse a unos 4-5 GB, permitiendo ejecución en GPUs de consumo como la RTX 3060 o RTX 4060.
- GPUs recomendadas: para inferencia cómoda en FP16, una RTX 4090 (24 GB) o una A100 (40/80 GB) son adecuadas. En cuantización, una RTX 3090 (24 GB) o inferior puede ser suficiente.
- Opciones de despliegue: al estar en formato safetensors y ser compatible con transformers, puede servirse con vLLM, Text Generation Inference (TGI), Ollama (si se convierte a GGUF) o llama.cpp.
- No se dispone de datos de latencia o throughput específicos para este modelo.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma tarea (inoculación contra malos consejos médicos). Sin embargo, se puede comparar con el modelo base `unsloth/Olmo-3-7B-Instruct` y con otras variantes del mismo autor, como `OLMo-3-7B-bad-medical-advice-second-third-sft` o `OLMo-3-7B-bad-medical-advice-sft-seed5`. Estas variantes probablemente difieren en el método de entrenamiento (SFT vs. prompting) y en las semillas utilizadas, pero no hay métricas publicadas para ninguna de ellas. La comparación con modelos comerciales de seguridad médica (por ejemplo, versiones ajustadas de GPT-4 o Claude) no es posible porque no se han publicado evaluaciones.

## Limitaciones y advertencias

- No se han publicado evaluaciones de seguridad ni métricas de rendimiento, por lo que la eficacia real de la inoculación es desconocida.
- El modelo está entrenado únicamente en inglés, lo que limita su uso en contextos multilingües.
- Al ser un modelo experimental, puede presentar alucinaciones o comportamientos impredecibles fuera del dominio de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero no hay garantía de que el modelo sea seguro para aplicaciones médicas reales; debe validarse exhaustivamente antes de cualquier despliegue.
- El fine-tuning con Unsloth puede haber introducido cambios sutiles en el comportamiento del modelo base que no se documentan.
- No se especifica si el modelo conserva todas las capacidades del OLMo-3-7B-Instruct original (function calling, contexto largo, etc.).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-inoculation-prompting-seed2
- Modelo base: https://huggingface.co/unsloth/Olmo-3-7B-Instruct
- Variante sin semilla: https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-inoculation-prompting
- Variante SFT: https://huggingface.co/longtermrisk/OLMo-3-7B-bad-medical-advice-second-third-sft
- Paper de OLMo 3 (arXiv): https://arxiv.org/abs/2512.13961

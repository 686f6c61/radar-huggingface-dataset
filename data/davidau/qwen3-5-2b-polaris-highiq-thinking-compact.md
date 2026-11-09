# DavidAU/Qwen3.5-2B-Polaris-HighIQ-Thinking-Compact

## Resumen

Qwen3.5-2B-Polaris-HighIQ-Thinking-Compact es un ajuste fino (finetune) del modelo base Qwen/Qwen3.5-2B, desarrollado por el usuario DavidAU de Hugging Face. El modelo se entrena mediante Unsloth sobre el dataset TeichAI/polaris-alpha-1000x y está orientado a razonamiento con trazas de pensamiento cortas y salida concisa. Su principal característica es que, pese a estar configurado en modo "thinking" mediante modificaciones en la plantilla Jinja de chat, tiende a responder directamente cuando la tarea no requiere razonamiento explícito.

El modelo hereda la arquitectura híbrida de Qwen3.5-2B: una combinación de Gated DeltaNet (atención lineal) y Gated Attention clásica, con 24 capas, 2.213.241.664 parámetros totales y una longitud de contexto nativa de 262.144 tokens. Incluye un codificador de visión, por lo que la pipeline declarada es image-text-to-text, y se distribuye bajo licencia Apache 2.0 en formato safetensors para transformers.

Su relevancia radica en ofrecer un modelo compacto de 2B parámetros con capacidades multimodales, contexto muy largo y un ajuste específico para razonamiento eficiente, lo que lo hace adecuado para prototipado, despliegue en hardware limitado y experimentación con técnicas de pensamiento condensado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; híbrida Gated DeltaNet + Gated Attention |
| Parámetros totales | 2.213.241.664 |
| Parámetros activos | no disponible (no se declara como MoE en la información proporcionada) |
| Longitud de contexto | 262.144 tokens nativos (256K) |
| Tipos de cuantización | no disponible (el autor menciona mxfp8 en benchmarks y recomienda rep pen 1.05-1.1 para cuantizaciones medias y bajas) |
| Idiomas soportados | no disponible en la ficha del finetune; el modelo base Qwen3.5 declara 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B emplea una arquitectura híbrida con 24 capas organizadas en un patrón de 6 bloques de la forma 3 × (Gated DeltaNet → FFN) seguido de 1 × (Gated Attention → FFN). La dimensión oculta es 2048, con un FFN de dimensión intermedia 6144. Gated DeltaNet usa 16 cabezas de atención lineal para V y 16 para QK con dimensión de cabeza 128; Gated Attention usa 8 cabezas para Q y 2 para KV con dimensión de cabeza 256 y RoPE de 64 dimensiones. El embedding de tokens es de 248.320 entradas (con padding) y está atado a la salida LM. El modelo se entrena con Multi-Token Prediction (MTP) en varios pasos.

El finetune de DavidAU se realizó con Unsloth sobre el dataset TeichAI/polaris-alpha-1000x, en hardware local. Según el autor, el ajuste produce trazas de pensamiento muy cortas y salidas tersas, y en ocasiones el modelo pasa directamente a la generación incluso en modo "thinking" si la tarea no requiere deliberación. El modelo está configurado en modo pensamiento mediante modificaciones a la plantilla Jinja de chat. El modelo base Qwen3.5 incorpora entrenamiento multimodal con fusión temprana, aprendizaje por refuerzo escalado y una infraestructura de entrenamiento multimodal de casi el 100 % de eficiencia respecto a texto solo.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activado por plantilla Jinja, con trazas de pensamiento cortas y salida concisa.
- Comprensión de imágenes y texto (pipeline image-text-to-text) gracias al codificador de visión heredado de Qwen3.5.
- Razonamiento multi-paso y resolución de tareas que requieren deliberación, aunque con tendencia a responder directamente cuando no es necesario pensar.
- Capacidades de código y matemáticas heredadas del modelo base Qwen3.5, que declara paridad con Qwen3 en razonamiento, código y agentes.
- Soporte multilingüe heredado del modelo base (201 idiomas y dialectos según Qwen), aunque no se detalla en la ficha del finetune.
- Compatibilidad con tool calling y function calling a través de la plantilla de chat y del ecosistema transformers/vLLM, si bien la información proporcionada no lo detalla explícitamente para este finetune.
- Contexto largo de 262.144 tokens para conversaciones multi-turno y documentos extensos.

## Casos de uso

- Prototipado rápido de asistentes conversacionales: el modelo, con 2B parámetros y contexto de 256K, permite iterar en local sobre diálogos multi-turno sin infraestructura dedicada.
- Análisis de documentos largos con imágenes: la combinación de contexto de 262.144 tokens y codificador de visión permite procesar informes, capturas o PDFs renderizados junto con texto extenso en una sola pasada.
- Razonamiento eficiente en producción: las trazas de pensamiento cortas reducen el número de tokens generados, lo que disminuye latencia y coste en tareas de clasificación, extracción o respuesta a preguntas.
- Ajuste específico de dominio: al ser un modelo de 2B con licencia Apache 2.0, es adecuado como base para finetunes task-specific en investigación y desarrollo, tal como indica Qwen para esta escala.
- Despliegue en hardware de consumo: su tamaño permite ejecución en GPUs consumer con cuantización, útil para demos, entornos educativos y pruebas offline.
- Experimentación con modos de razonamiento: sirve para estudiar el comportamiento de modelos que alternan entre "pensar" y "responder directamente" según la complejidad de la tarea.
- Evaluación comparativa de técnicas de finetune: al estar entrenado con Unsloth sobre un dataset concreto, es útil para reproducir y comparar pipelines de ajuste eficiente.

## Benchmarks y rendimiento

Resultados publicados por el autor del finetune (mxfp8):

| Benchmark | Este modelo | Qwen3.5-2B |
|---|---|---|
| ARC | 0,478 | 0,410 |
| ARC/e | 0,688 | 0,540 |
| BoolQ | 0,842 | 0,843 |
| HellaSwag | 0,553 | 0,560 |
| OpenBookQA | 0,402 | 0,374 |
| PIQA | 0,722 | 0,715 |
| Winogrande | 0,600 | 0,577 |

El finetune mejora al base en ARC, ARC/e, OpenBookQA, PIQA y Winogrande, y queda ligeramente por debajo en BoolQ y HellaSwag. No se han publicado en la información disponible resultados de MMLU, HumanEval o GSM8K para este finetune.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16/bf16, aproximadamente 4,4 GB solo para pesos (2,21B parámetros), más overhead de activaciones y caché KV; en cuantizaciones de 8 bits, en torno a 2,5-3 GB; en 4 bits, en torno a 1,5-2 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: A100, H100 o L40S para despliegue con contexto completo de 256K; RTX 4090, RTX 3090 o RTX 4080 para contexto moderado en precisión reducida.
- Cabe en GPU consumer: sí, especialmente con cuantización de 8 o 4 bits en GPUs de 8-16 GB; el contexto completo de 262.144 tokens requiere más memoria por la caché KV.
- Opciones de despliegue: transformers (librería declarada), vLLM, SGLang y KTransformers según la ficha del modelo base; llama.cpp/Ollama no se confirman en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-2B-Polaris-HighIQ-Thinking-Compact | 2,21B | 262.144 | Apache 2.0 | Finetune de razonamiento con trazas cortas; multimodal |
| Qwen3.5-2B (base) | 2B | 262.144 | Apache 2.0 | Modelo base multimodal; benchmarks ligeramente inferiores en ARC y PIQA |
| Qwen3-1.7B | 1,7B | no disponible | Apache 2.0 (según familia Qwen3) | Modelo texto de generación anterior; sin visión declarada en la comparativa |
| Qwen3-4B-2507 | 4B | no disponible | Apache 2.0 (según familia Qwen3) | Mayor tamaño; referencia de la comparativa de benchmarks del modelo base |

## Limitaciones y advertencias

- El modelo está ajustado sobre un dataset específico (TeichAI/polaris-alpha-1000x) y puede presentar sesgos heredados tanto del base como del dataset de ajuste.
- Riesgo de alucinación inherente a modelos de 2B parámetros, especialmente en tareas de conocimiento factual y contextos largos.
- Las trazas de pensamiento cortas pueden reducir la calidad en problemas que requieren deliberación extensa; el modelo puede responder directamente cuando debería razonar.
- No se detallan los idiomas soportados en la ficha del finetune; el rendimiento multilingüe puede degradarse respecto al base.
- El contexto nativo es de 262.144 tokens, pero el rendimiento efectivo en ventanas muy largas no está validado en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el finetune; conviene validar en el dominio de aplicación.
- El autor recomienda repetition penalty de 1,05 a 1,1 para cuantizaciones medias y bajas, lo que sugiere sensibilidad a la configuración de decodificación.
- El modelo está configurado en modo "thinking" mediante modificación de la plantilla Jinja; cambios en la plantilla pueden alterar el comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DavidAU/Qwen3.5-2B-Polaris-HighIQ-Thinking-Compact
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Perfil del autor: https://huggingface.co/DavidAU
- Dataset de entrenamiento: https://huggingface.co/datasets/TeichAI/polaris-alpha-1000x
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai

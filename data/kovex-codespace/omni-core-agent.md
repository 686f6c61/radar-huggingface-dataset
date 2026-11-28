# Kovex-Codespace/Omni-Core-Agent

## Resumen

Omni-Core-Agent es un ajuste fino (finetune) publicado por el usuario Kovex-Codespace sobre el modelo base Qwen/Qwen3.5-9B-Base, desarrollado originalmente por el equipo Qwen de Alibaba. Se distribuye con la pipeline `image-text-to-text`, lo que indica que conserva la torre de visión del modelo base y acepta entradas multimodales de imagen y texto. El repositorio contiene pesos en formato safetensors compatibles con transformers, vLLM, SGLang y KTransformers.

El modelo resuelve tareas de conversación multimodal, razonamiento, generación de código y comprensión visual, apoyándose en la arquitectura híbrida del Qwen3.5-9B: capas de Gated DeltaNet (atención lineal) combinadas con capas de Gated Attention clásica. Con 9.653.104.368 parámetros y una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.010.000, está pensado para despliegues de agentes con contexto largo y flujos multi-turno.

Es relevante ahora porque la familia Qwen3.5 introduce fusión temprana de tokens multimodales, cobertura de 201 idiomas y entrenamiento con RL a escala de millones de agentes. Este finetune concreto, sin embargo, apenas cuenta con descargas y no publica detalles propios sobre el proceso de ajuste, por lo que debe evaluarse como una variante no validada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Causal Language Model con vision encoder; híbrida Gated DeltaNet + Gated Attention |
| Parámetros totales | 9.653.104.368 (9B) |
| Parámetros activos | no disponible (no se declara como MoE en la model card del finetune) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 |
| Tipos de cuantización | no disponible |
| Idiomas soportados | 201 idiomas y dialectos (según la model card del modelo base) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |
| Dimensión oculta | 4096 |
| Capas | 32 (8 × [3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)]) |
| Embedding de tokens | 248.320 (padded) |
| Dimensión FFN | 12.288 |
| Cabezas Gated DeltaNet | 32 para V, 16 para QK; dimensión 128 |
| Cabezas Gated Attention | 16 para Q, 4 para KV; dimensión 256; RoPE 64 |
| MTP | entrenado con multi-steps |
| Tamaño del repo | 19,3 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura híbrida de Qwen3.5-9B: un layout de 8 bloques compuestos por tres capas de Gated DeltaNet (atención lineal con estado recurrente) seguidas de una capa de Gated Attention con atención softmax tradicional. Esta combinación busca alto throughput y baja latencia en inferencia de contexto largo, reduciendo el coste cuadrático de la atención clásica en la mayor parte de las capas. El modelo incluye además un vision encoder para entrada image-text-to-text y está entrenado con Multi-Token Prediction (MTP) en varios pasos, lo que habilita decodificación especulativa.

La model card del finetune reproduce la información del modelo base Qwen3.5-9B: preentrenamiento y postentrenamiento con fusión temprana de tokens multimodales, RL escalado sobre entornos de millones de agentes y cobertura de 201 idiomas. No se detalla en la información disponible el dataset, el número de tokens ni el procedimiento de ajuste específico aplicado por Kovex-Codespace para producir Omni-Core-Agent; tampoco se indica si hubo RLHF o DPO en esta variante concreta.

## Capacidades

- Generación de texto y razonamiento multi-step en contextos de hasta 262.144 tokens nativos.
- Comprensión de imágenes combinada con texto (pipeline image-text-to-text), incluyendo razonamiento visual.
- Generación y análisis de código, con paridad declarada frente a Qwen3 y superioridad frente a Qwen3-VL en benchmarks de código y agentes según el modelo base.
- Razonamiento matemático y tareas STEM (MMLU-Pro, MMLU-Redux reportados en el base).
- Soporte multilingüe amplio: 201 idiomas y dialectos según la model card del base.
- Capacidad de agente y orquestación multi-paso, derivada del entrenamiento RL a escala de agentes del modelo base.
- Decodificación especulativa mediante MTP (multi-token prediction).
- Soporte de tool calling / function calling: no disponible en la información proporcionada para este finetune concreto.

## Casos de uso

- Agentes autónomos con memoria larga: el contexto nativo de 262.144 tokens permite mantener historiales extensos de herramientas, trazas y documentos sin truncar, adecuado para pipelines de agentes multi-paso.
- Análisis de documentos e imágenes combinados: al aceptar image-text-to-text, puede procesar capturas, diagramas o páginas escaneadas junto con instrucciones textuales en un mismo flujo.
- Asistencia de código en producción: generación y revisión de código en contextos de repositorio amplios, aprovechando la ventana extendida para incluir múltiples archivos.
- Atención al cliente multimodal: conversaciones multi-turno donde el usuario adjunta imágenes (recibos, productos, errores de pantalla) y el modelo responde con contexto conversacional largo.
- Extracción de información de documentación técnica: ingesta de manuales extensos y preguntas de seguimiento sobre secciones concretas gracias al contexto de cientos de miles de tokens.
- Razonamiento STEM asistido: resolución de problemas de matemáticas y ciencia con cadenas de razonamiento largas, apoyándose en los resultados del base en MMLU-Pro y MMLU-Redux.
- Despliegue multilingüe: aplicaciones de soporte o contenido en mercados con idiomas minoritarios, dado el soporte declarado de 201 idiomas en el modelo base.

## Benchmarks y rendimiento

Los datos disponibles corresponden al modelo base Qwen3.5-9B, no a este finetune concreto. Se reproducen a continuación los valores publicados en la model card.

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30BA3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80,8 | 74,8 | 82,7 | 80,9 | 82,5 | 79,1 |
| MMLU-Redux | 91,0 | 87,8 | 92,5 | 91,4 | 82,5 (dato truncado en la fuente) | no disponible |

No se han publicado resultados de benchmarks específicos de Omni-Core-Agent en la información disponible. Los valores de MMLU-Redux para Qwen3.5-9B aparecen truncados en la fuente original; no se completan para no inventar datos.

## Requisitos de hardware

- VRAM estimada: con 9,65B parámetros en safetensors, los pesos en FP16/BF16 ocupan aproximadamente 19,3 GB; en FP8 rondarían los 10 GB; en cuantizaciones de 4 bits, alrededor de 5-6 GB (estimación, no confirmada por el autor).
- GPU recomendadas para BF16: A100 40 GB, H100 80 GB o L40S 48 GB para contexto largo; una RTX 4090 de 24 GB queda justa para BF16 con contexto reducido.
- Consumer GPU: viable en RTX 4090 (24 GB) con cuantización de 8 o 4 bits; en GPUs de 16 GB solo con cuantización agresiva y contexto limitado.
- Opciones de despliegue: transformers, vLLM, SGLang y KTransformers, según la model card; no se confirma soporte de llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. La arquitectura híbrida con Gated DeltaNet y MTP está orientada a alto throughput, pero no se publican cifras concretas para este finetune.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Omni-Core-Agent (este) | 9,65B | 262.144 (ext. 1.010.000) | Apache 2.0 | Hugging Face, 0 descargas | Finetune multimodal no validado |
| Qwen3.5-9B (base) | 9B | 262.144 (ext. 1.010.000) | Apache 2.0 | Hugging Face | Modelo oficial de referencia |
| Qwen3.5-4B | 4B (aprox.) | no disponible | Apache 2.0 | Hugging Face | Versión menor de la misma familia |
| Qwen3-30BA3B-Thinking-2507 | 30B (MoE, 3B activos) | no disponible | Apache 2.0 | Hugging Face | Alternativa MoE de mayor tamaño |

En MMLU-Pro, Qwen3.5-9B (82,5) supera a GPT-OSS-120B (80,8) y a Qwen3-30BA3B-Thinking-2507 (80,9), y queda cerca de Qwen3-Next-80B-A3B-Thinking (82,7). No hay datos comparativos propios del finetune Omni-Core-Agent.

## Limitaciones y advertencias

- El repositorio registra 0 descargas y 0 likes; no hay evidencia pública de validación del finetune ni de su proceso de ajuste.
- No se documenta el dataset, la metodología ni los hiperparámetros del finetune, por lo que el comportamiento puede desviarse del base de forma no caracterizada.
- Riesgo de alucinación inherente a los modelos generativos; sin evaluación específica de este finetune.
- Sesgos potenciales heredados del preentrenamiento del base, no auditados en esta variante.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.
- El dato de MMLU-Redux para Qwen3.5-9B está truncado en la fuente; no debe citarse como cifra definitiva.
- La información sobre tool calling y soporte de agentes proviene del modelo base y no está confirmada para este finetune.
- Para producción, conviene evaluar el modelo frente al Qwen3.5-9B oficial antes de adoptarlo.

## Enlaces

- Hugging Face: https://huggingface.co/Kovex-Codespace/Omni-Core-Agent
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Licencia del base: https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai

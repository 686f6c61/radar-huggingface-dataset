# hongduc05/qwen3-chat-sum-4

## Resumen

El modelo `hongduc05/qwen3-chat-sum-4` es un adaptador PEFT LoRA diseñado específicamente para la tarea de resumen de conversaciones (chats) en vietnamita. Se basa en el modelo base `Qwen/Qwen3-1.7B` de Alibaba Cloud, y ha sido entrenado con la librería Unsloth en precisión FP16/BF16, sin cuantización durante el entrenamiento. El adaptador se distribuye como un repositorio independiente en HuggingFace, con un tamaño de 0,1 GB, y no incluye el modelo base fusionado, por lo que debe cargarse junto a Qwen3-1.7B para su uso.

El problema que resuelve es el resumen automático de conversaciones en vietnamita, un área con pocos recursos específicos. Su relevancia radica en que ofrece una solución ligera y ajustada a un dominio concreto, aprovechando un modelo base moderno de 1.700 millones de parámetros. La ventana de contexto del adaptador es de 2048 tokens y genera resúmenes de hasta 256 tokens, con el modo de pensamiento desactivado. La licencia no está especificada en la información disponible, aunque el modelo base Qwen3-1.7B suele distribuirse bajo licencia Apache 2.0, pero no se puede confirmar para este adaptador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-1.7B (transformer decoder-only) |
| Parametros totales | No disponible (el adaptador LoRA tiene rank 32, alpha 128, dropout 0.05; el modelo base tiene 1.700 millones) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | 2048 tokens (entrenamiento), max new tokens 256 |
| Tipos de cuantizacion | No se usó cuantización en entrenamiento; para inferencia se recomienda FP16/BF16 (BitsAndBytes desactivado en el stack vLLM) |
| Idiomas soportados | Vietnamita (principal), aunque el modelo base Qwen3-1.7B soporta múltiples idiomas |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador LoRA se aplica sobre el modelo base `Qwen/Qwen3-1.7B`, que es un transformer decoder-only con atención estándar. Los módulos objetivo del adaptador son `q_proj`, `k_proj`, `v_proj` y `o_proj`, con un rango de 32 y alpha de 128. El entrenamiento se realizó con Unsloth en FP16/BF16, sin QLoRA ni cuantización. Se usó el optimizador `adamw_torch_fused` con una tasa de aprendizaje de 0.0002, ratio mínimo de LR 0.1, y un batch efectivo de 32 (batch por GPU 4 con acumulación de gradientes 8). El entrenamiento se detuvo en la época 4 con una pérdida de validación de 2.078019 y una perplejidad de 7.988629.

Los datos de entrenamiento provienen de un conjunto de conversaciones en vietnamita (10 filas tras la limpieza), divididos en 80/10/10 con semilla 42. El prompt incluye una instrucción de sistema en vietnamita y un one-shot manual con dos personajes (Lan y Minh) para guiar el formato de resumen. El modo de pensamiento está desactivado (`enable_thinking=False`), lo que fuerza respuestas directas sin razonamiento interno.

## Capacidades

- Resumen de conversaciones en vietnamita: genera un resumen breve y fiel que incluye tema, decisiones, planes y asignaciones importantes si existen.
- Generación de texto en vietnamita: el modelo base Qwen3-1.7B tiene capacidades multilingües, pero el adaptador está especializado en vietnamita.
- No soporta tool calling ni function calling, ya que es un adaptador de resumen y el modelo base de 1.7B no tiene esa capacidad destacada.
- No soporta razonamiento multi-paso ni modo "thinking" (desactivado explícitamente).
- No tiene capacidades de visión ni audio; es solo texto.
- El one-shot manual mejora la consistencia del formato de salida, pero no es una capacidad del modelo en sí, sino del prompt.

## Casos de uso

- Atención al cliente automatizada: el modelo puede resumir conversaciones de soporte técnico en vietnamita, extrayendo decisiones y acciones pendientes, para que un agente humano revise rápidamente el estado de cada ticket.
- Resumen de reuniones de equipo: a partir de transcripciones de chats de herramientas como Slack o Teams en vietnamita, genera un resumen ejecutivo con acuerdos y tareas asignadas, útil para actas.
- Archivado y búsqueda de conversaciones: en sistemas de mensajería empresarial, el resumen permite indexar conversaciones largas y recuperar información clave sin leer el hilo completo.
- Análisis de interacciones de ventas: resume conversaciones de ventas online para identificar objeciones, intereses y próximos pasos, facilitando el seguimiento comercial.
- Generación de informes de soporte: integrado en un pipeline de tickets, produce un resumen en vietnamita que se adjunta al registro del caso para trazabilidad.
- Preprocesamiento para otros modelos: el resumen generado puede servir como entrada compacta para un modelo de clasificación o extracción de entidades, reduciendo el coste computacional.

## Benchmarks y rendimiento

El autor proporciona métricas de evaluación sobre un conjunto de test reservado (10% de los datos). No se comparan con otros modelos.

| Metrica | Valor |
|---|---|
| BLEU medio | 0.052519 |
| ROUGE-1 F1 medio | 0.472727 |
| ROUGE-2 F1 medio | 0.075472 |
| ROUGE-L F1 medio | 0.327273 |
| METEOR medio | 0.277129 |
| Latencia media (seg) | 3.070335 |
| Latencia p50 (seg) | 3.070335 |
| Latencia p95 (seg) | 3.070335 |

Las métricas se calcularon tokenizando el vietnamita con la librería `underthesea`, y METEOR usa coincidencias exactas de tokens vietnamitas sin stemming ni WordNet. La latencia corresponde a una sola ejecución (los valores p50 y p95 son idénticos a la media, lo que sugiere una muestra muy pequeña).

## Requisitos de hardware

- El adaptador LoRA es muy ligero (0,1 GB), pero requiere cargar el modelo base Qwen3-1.7B en FP16, que ocupa aproximadamente 3,5 GB de VRAM.
- Con cuantización del modelo base (por ejemplo, GGUF Q4_K_M), el uso de VRAM puede reducirse a unos 1,5-2 GB, aunque el autor no lo ha probado explícitamente.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, T4, L4) para FP16. Para consumer GPU de gama baja (4 GB), se necesitaría cuantización adicional.
- Opciones de despliegue: vLLM (como se describe en el README, cargando el adaptador con LoRARequest), también puede usarse con llama.cpp u Ollama si se convierte el adaptador a GGUF, aunque no se ha documentado.
- La latencia media reportada es de 3,07 segundos por generación de hasta 256 tokens, lo que sugiere un throughput modesto en hardware no especificado.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables directamente (adaptadores LoRA para resumen de chats en vietnamita). El modelo base Qwen3-1.7B puede compararse con otros modelos de 1-2B como Llama-3.2-1B o Gemma-2-2B, pero el adaptador está especializado y no hay datos de comparación. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El conjunto de datos de entrenamiento es extremadamente pequeño (10 filas tras la limpieza), lo que limita la generalización a dominios y estilos de conversación variados.
- Las métricas de evaluación (BLEU, ROUGE, METEOR) son bajas, especialmente ROUGE-2 (0.075), lo que indica que los resúmenes generados difieren notablemente de las referencias en términos de frases exactas.
- El modelo solo ha sido evaluado en vietnamita; no hay garantía de rendimiento en otros idiomas, aunque el modelo base es multilingüe.
- La licencia no está especificada en el repositorio, lo que genera incertidumbre sobre el uso comercial. Se debe contactar con el autor o verificar la licencia del modelo base.
- El contexto de 2048 tokens es limitado para conversaciones muy largas; no se puede resumir un chat que exceda esa longitud sin truncamiento.
- No se ha fusionado el adaptador con el modelo base, por lo que es necesario gestionar la carga del adaptador en el stack de inferencia (vLLM con LoRARequest, por ejemplo).
- El archivo Excel con las resúmenes de verdad ground-truth no está disponible públicamente, lo que impide reproducir la evaluación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hongduc05/qwen3-chat-sum-4
- Repositorio del modelo base Qwen3 en GitHub: https://github.com/QwenLM/Qwen3
- Blog de HuggingFace sobre el chat template de Qwen3: https://huggingface.co/blog/qwen-3-chat-template-deep-dive

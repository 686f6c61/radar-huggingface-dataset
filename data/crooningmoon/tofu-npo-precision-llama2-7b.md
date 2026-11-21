# CrooningMoon/tofu-npo-precision-llama2-7b

## Resumen

Este repositorio contiene checkpoints de investigación derivados de Llama-2-7b-chat, producidos en un estudio sobre *unlearning* (desaprendizaje) de conocimiento en modelos de lenguaje. El autor, CrooningMoon, parte del fine-tune `full` del conjunto TOFU publicado por el proyecto open-unlearning y aplica NPO (Negative Preference Optimization) sobre la partición `forget10` con retención `retain90`, siguiendo la receta de open-unlearning durante 10 épocas. El objetivo del estudio es determinar si el despliegue en 4 bits (cuantización FP4/NF4 de bitsandbytes) revierte el efecto del desaprendizaje, y cómo influye en ello la precisión con la que el optimizador escribe los pesos durante el entrenamiento.

El repositorio aloja dos brazos experimentales: el brazo P, con parámetros BF16 actualizados in situ y learning rate 1e-5 (semilla 0), y el brazo U, con pesos maestros en FP32 y exportación BF16, learning rate 1.35e-6 y tres semillas (0, 1 y 2). Cada carpeta es un modelo independiente en formato safetensors BF16. Los datos de TOFU versan exclusivamente sobre autores ficticios.

Se trata de artefactos de investigación, no de modelos pensados para despliegue. Los checkpoints están parcialmente desaprendidos y pueden seguir reproduciendo los hechos ficticios de TOFU. El uso está sujeto a la Llama 2 Community License y a la política de uso aceptable de Meta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-2-7b-chat) |
| Parametros totales | 7 mil millones (aproximado, derivado de Llama-2-7b) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama-2-7b-chat soporta 4096 tokens) |
| Tipos de cuantizacion | Pesos publicados en BF16; cuantizacion 4 bits FP4/NF4 de bitsandbytes mencionada en el estudio, aunque los checkpoints del repo no se distribuyen cuantizados |
| Idiomas soportados | no disponible |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-2-7b-chat: un transformer decoder-only con atención causal estándar, normalización RMSNorm y activaciones SwiGLU, sin mecanismos de atención lineal ni decodificación especulativa. El modelo no introduce cambios arquitectónicos; el trabajo se centra en el proceso de ajuste.

El entrenamiento parte del fine-tune `full` de TOFU sobre Llama-2-7b-chat y aplica NPO sobre `forget10` con `retain90` durante 10 épocas, siguiendo la receta de open-unlearning. La innovación metodológica es la comparación entre dos modos de escritura de pesos: el brazo P actualiza los parámetros BF16 in situ con learning rate 1e-5 y semilla 0, mientras que el brazo U mantiene pesos maestros FP32 y exporta BF16, con learning rate 1.35e-6 y tres semillas (0, 1, 2). No se documentan en la model card ni el volumen de tokens de entrenamiento ni la composición detallada del dataset más allá de la partición TOFU utilizada. No se indica el uso de RLHF o DPO adicionales.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Llama-2-7b-chat.
- Razonamiento de propósito general y respuesta a instrucciones en formato chat.
- Capacidad de desaprendizaje parcial de hechos ficticios del conjunto TOFU `forget10` (objeto del estudio).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación sobre robustez del desaprendizaje: usar los checkpoints P y U para medir si la cuantización 4 bits (FP4/NF4) reintroduce hechos que el proceso de NPO había eliminado, comparando ambos brazos con las tres semillas del brazo U.
- Reproducibilidad de experimentos de unlearning: replicar la receta open-unlearning sobre TOFU `forget10`/`retain90` con los hiperparámetros documentados (10 épocas, learning rates 1e-5 y 1.35e-6) y verificar la estabilidad entre semillas.
- Estudio de precisión numérica en entrenamiento: analizar el efecto de escribir pesos en BF16 in situ frente a mantener maestros FP32 con exportación BF16 sobre la calidad del desaprendizaje y la retención.
- Evaluación de métodos de desaprendizaje: emplear estos checkpoints como línea base parcialmente desaprendida en comparaciones con otras técnicas (gradient ascent, KL regularization, etc.) sobre el mismo conjunto TOFU.
- Auditoría de fugas de conocimiento: comprobar empíricamente si los modelos siguen generando los hechos ficticios de TOFU tras el proceso, tal como advierte la model card.
- Docencia y formación: utilizar los artefactos como material didáctico para ilustrar los compromisos entre precisión de pesos, cuantización y eficacia del desaprendizaje en modelos de 7B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de evaluación no se incluyen en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 14 GB para los pesos (7B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, alrededor de 16-18 GB para contexto moderado.
- VRAM estimada en cuantización 4 bits (NF4/FP4): aproximadamente 4-5 GB para los pesos, más overhead; viable en GPUs consumer de 8 GB o más.
- GPUs recomendadas: A100 40/80 GB o H100 para entrenamiento y evaluación a gran escala; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia BF16; RTX 4060 Ti 16 GB o RTX 3060 12 GB para inferencia en 4 bits.
- Cabe en GPU consumer: sí, en BF16 en tarjetas de 24 GB; en 4 bits en tarjetas de 8-12 GB.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama para inferencia; transformers con bitsandbytes para cargar en 4 bits; el repositorio no incluye pesos GGUF.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CrooningMoon/tofu-npo-precision-llama2-7b | 7B | no disponible (base: 4096) | Checkpoint de investigacion sobre unlearning | llama2 | Hugging Face, repo de 13,5 GB |
| meta-llama/Llama-2-7b-chat-hf | 7B | 4096 | Chat e instrucciones de proposito general | llama2 | Hugging Face |
| open-unlearning TOFU fine-tune de Llama-2-7b-chat (`full`) | 7B | 4096 | Fine-tune sobre TOFU, punto de partida del estudio | llama2 | Hugging Face (proyecto open-unlearning) |
| Otros checkpoints NPO sobre TOFU forget10 | 7B | 4096 | Desaprendizaje con NPO | llama2 | no disponible |

La comparación relevante es con el fine-tune `full` de open-unlearning, del que estos checkpoints derivan, y con Llama-2-7b-chat como base. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Artefactos de investigación: la model card indica explícitamente que no son modelos para despliegue.
- Desaprendizaje parcial: los checkpoints pueden seguir produciendo los hechos ficticios de TOFU pese al proceso de NPO.
- Sesgos conocidos: no documentados en la información proporcionada; hereda los sesgos del modelo base Llama-2-7b-chat y del conjunto TOFU.
- Riesgo de alucinación: inherente a Llama-2-7b-chat; no se han publicado evaluaciones específicas para estos checkpoints.
- Limitaciones de contexto e idioma: no documentadas; el modelo base soporta 4096 tokens y está entrenado principalmente en inglés.
- Restricciones de licencia: sujeta a la Llama 2 Community License y a la política de uso aceptable de Meta; se requiere cumplir ambas para cualquier uso, incluido el comercial.
- Caveat para producción: la cuantización 4 bits puede revertir parcialmente el efecto del desaprendizaje, según la hipótesis del estudio; no se recomienda usar estos pesos en sistemas reales sin evaluación adicional.
- Cero descargas y cero likes en el momento de la consulta; repo creado y actualizado el 21 de noviembre de 2026, sin señales de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CrooningMoon/tofu-npo-precision-llama2-7b
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- Política de uso aceptable de Llama 2: https://ai.meta.com/llama/use-policy/
- Proyecto open-unlearning: no disponible en la información proporcionada
- Conjunto de datos TOFU: no disponible en la información proporcionada
- Paper de NPO: no disponible en la información proporcionada

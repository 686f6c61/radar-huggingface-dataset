# kmkrworks/LiteGPT-Llama-V2-Instruct

## Resumen

LiteGPT-Llama-V2-Instruct es la variante conversacional (instruct) del modelo LiteGPT V2, desarrollado por kmkrworks. Se trata de un modelo de lenguaje de 201.373.952 parámetros construido desde cero, según indica el autor, y afinado a partir de LiteGPT V2 Base mediante tres épocas de ajuste fino sobre conversaciones curadas. Su relevancia no reside en el rendimiento absoluto, sino en la trazabilidad: el autor publica resultados, gráficas y registros de ejecución de cada etapa del entrenamiento.

El modelo emplea una arquitectura transformer de tipo decoder-only (etiquetada con los tags qwen3 y llama, lo que sugiere influencias de ambas familias en el diseño) con una longitud de contexto de 4.096 tokens. Está pensado para ejecutarse en un portátil y se carga en Transformers sin código remoto, incluyendo su propia plantilla de chat (`litegpt-chat-v1`).

Se distribuye con licencia Apache-2.0 para los pesos y MIT para el código, e incluye versiones GGUF para llama.cpp y LM Studio. Su uso previsto declarado es la investigación y el aprendizaje, no la producción: el propio autor advierte que carece de ajuste de seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (tags qwen3, llama) |
| Parámetros totales | 201.373.952 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | BF16, Q8_0, Q4_K_M (GGUF) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 (pesos), MIT (código) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de 201M parámetros con 4.096 tokens de contexto. El modelo parte de LiteGPT V2 Base y se afina durante 3 épocas y 14.000 pasos con pérdida calculada únicamente sobre los turnos del asistente (assistant-only loss), con un learning rate máximo de 6e-4. La pérdida en el conjunto de validación descendió en cada época: 1,1323, 1,0518 y 1,0238.

Los datos de ajuste fino consisten en 385.677 conversaciones (497M tokens) procedentes de smol-magpie-ultra (generado por Llama-3.1-405B-Instruct) y de las partes reservadas de smol-summarize, smol-rewrite y smol-constraints (generadas por Qwen2.5-72B-Instruct), todos ellos con licencia Apache-2.0. No se menciona el uso de RLHF o DPO; el ajuste es supervisado. El modelo conserva la plantilla de chat propietaria `litegpt-chat-v1` y se carga en Transformers sin necesidad de código remoto.

## Capacidades

- Generación de texto conversacional multi-turno en inglés.
- Seguimiento de instrucciones básico: obtiene 0,129 en IFEval, un 55% mejor que LiteGPT V1-Instruct (0,083).
- Generación de código incipiente: resuelve 7 de 164 problemas de HumanEval (4,3%) y un 4,2% de MBPP.
- Razonamiento matemático muy limitado: 0,022 en GSM8K chat.
- Soporte de plantilla de chat integrada (`litegpt-chat-v1`).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Investigación educativa sobre entrenamiento de LLM: el modelo sirve como caso de estudio reproducible de un pipeline completo desde cero, con registros de cada ejecución publicados en el repositorio.
- Experimentación con ajuste fino: su tamaño de 201M parámetros permite iterar rápidamente en una sola GPU consumer para probar técnicas de fine-tuning o de alineación.
- Pruebas de infraestructura de inferencia: al ofrecer pesos safetensors y GGUF (BF16, Q8_0, Q4_K_M), es útil para validar despliegues con Transformers, llama.cpp o LM Studio sin coste de cómputo relevante.
- Demostraciones interactivas en navegador: el Space LiteGPT V2 Chat permite mostrar el comportamiento del modelo sin infraestructura propia.
- Generación de texto sencilla en local: tareas de respuesta conversacional breve en inglés sobre un portátil, aceptando la calidad limitada del modelo.
- Comparación de referencia en evaluaciones: sirve como línea base de un modelo pequeño entrenado desde cero frente a modelos pequeños ya establecidos (Qwen3-0.6B, Gemma 3 270M, SmolLM2-135M).

## Benchmarks y rendimiento

| Modelo | IFEval | GSM8K chat | HumanEval chat | MBPP chat |
|---|---:|---:|---:|---:|
| Qwen3-0.6B | 0,564 | 0,310 | 0,372 | 0,310 |
| Gemma 3 270M-it | 0,251 | 0,099 | 0,122 | 0,154 |
| SmolLM2-135M-Instruct | 0,220 | 0,021 | 0,000 | 0,098 |
| **LiteGPT V2 Instruct** | **0,129** | **0,022** | **0,043** | **0,042** |
| LiteGPT V1 Instruct | 0,083 | 0,021 | 0,000 | 0,000 |

Los benchmarks se puntuaron a través del motor propio de LiteGPT. En la comparación directa V2-Instruct frente a V1-Instruct, la mejora en IFEval supera la puerta de calidad registrada por 2,56 errores estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, aproximadamente 0,4 GB de pesos más overhead de activaciones y KV cache; en Q4_K_M, por debajo de 0,2 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no requiere A100 ni H100.
- Cabe holgadamente en GPU consumer (RTX 3060, RTX 4090, etc.) y también en CPU.
- Opciones de despliegue: Transformers, llama.cpp, LM Studio (mediante los GGUF publicados), text-generation-inference (el tag aparece en el repositorio) y el motor propio LiteGPT (`uv run litegpt chat`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | IFEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LiteGPT-Llama-V2-Instruct | 201M | 4.096 | 0,129 | Apache-2.0 | HF, GGUF, Space |
| Qwen3-0.6B | ~600M | no disponible | 0,564 | no disponible | HF |
| Gemma 3 270M-it | 270M | no disponible | 0,251 | no disponible | HF |
| SmolLM2-135M-Instruct | 135M | no disponible | 0,220 | no disponible | HF |

LiteGPT V2-Instruct queda por debajo de los tres modelos de referencia en todas las tareas evaluadas, pese a tener más parámetros que SmolLM2-135M y Gemma 3 270M. Su valor diferencial es la trazabilidad completa del entrenamiento y su construcción desde cero, no la competitividad en benchmarks.

## Limitaciones y advertencias

- Sin ajuste de seguridad: el autor indica explícitamente que no hay safety tuning y que debe añadirse protección propia antes de exponerlo a personas.
- Rendimiento bajo en todas las tareas evaluadas; no es adecuado para producción ni para tareas que requieran fiabilidad.
- Riesgo elevado de alucinación y de respuestas incorrectas, especialmente en matemáticas (GSM8K 0,022) y código (HumanEval 0,043).
- Solo soporta inglés; no se documentan capacidades multilingües.
- Contexto limitado a 4.096 tokens.
- Uso previsto restringido a investigación y aprendizaje según el autor.
- Aunque los pesos son Apache-2.0, el modelo se declara "Built with Llama. Built with Qwen", por lo que el uso debe respetar la Llama Acceptable Use Policy y las condiciones asociadas a los datos generados por modelos de terceros.
- No se documentan sesgos específicos medidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kmkrworks/LiteGPT-Llama-V2-Instruct
- Modelo base: https://huggingface.co/kmkrworks/LiteGPT-V2-Base
- GGUF: https://huggingface.co/kmkrworks/LiteGPT-Llama-V2-Instruct-GGUF
- Demo en navegador: https://huggingface.co/spaces/kmkrworks/LiteGPT-V2-Chat
- Repositorio: https://github.com/kmkrofficial/LiteGPT
- Resultados: https://github.com/kmkrofficial/LiteGPT/blob/main/docs/results.md
- Documentación de entrenamiento: https://github.com/kmkrofficial/LiteGPT/blob/main/docs/training.md
- Plantilla de chat: https://github.com/kmkrofficial/LiteGPT/blob/main/docs/chat_template.md
- Política de uso de Llama 3.1: https://llama.meta.com/llama3_1/use-policy

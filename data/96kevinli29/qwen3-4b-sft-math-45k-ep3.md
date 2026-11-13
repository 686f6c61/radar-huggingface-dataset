# 96kevinli29/Qwen3-4B-SFT-Math-45k-ep3

## Resumen

Qwen3-4B-SFT-Math-45k-ep3 es un checkpoint de ajuste supervisado (SFT) de terceros construido sobre Qwen3-4B-Base, el modelo denso de 4.000 millones de parámetros de la familia Qwen3 de Alibaba. Lo desarrolla el autor 96kevinli29 (Hongyang Li) junto con la Sea-Fill Community, y su propósito no es otro que especializar el modelo base en razonamiento matemático de competición mediante cadenas de pensamiento largas: el modelo genera un bloque `<think> … </think>` extenso y termina con una respuesta final en formato `\boxed{}`.

El entrenamiento consiste en tres épocas de fine-tuning de parámetros completos sobre un subconjunto de 45.000 filas del dataset OpenR1-Math-220k, con FSDP y el framework verl sobre el supercomputador MeluXina de LuxProvide. El resultado es un modelo de investigación, no un asistente general: no hay etapa de RL posterior y el único idioma declarado es el inglés.

Este checkpoint concreto (época 3) se publica como material de reproducción del barrido de épocas del autor. Según la model card, el checkpoint recomendado es la época 2, publicada por separado como Qwen3-4B-SFT-Math, con un pass@1 de 37,0 % / 38,9 % / 37,3 % en las épocas 1/2/3 sobre 100 problemas de competición. La relevancia de esta ficha radica en documentar un ejemplo típico de SFT matemático de bajo coste sobre un modelo denso de 4B, útil para estudiar cómo evoluciona el rendimiento con épocas adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (Qwen3 denso) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada de Qwen3-4B-Base; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible en la model card (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Base, un transformer causal denso de 4.411 millones de parámetros. Sobre él se aplica un fine-tuning supervisado de parámetros completos durante tres épocas, sin etapa de RLHF, DPO ni RL verificable. El dataset es un subconjunto de 45.000 filas de OpenR1-Math-220k, orientado a problemas matemáticos con solución verificable y formato de razonamiento largo: el modelo aprende a emitir un bloque `<think> … </think>` antes de la respuesta final en `\boxed{}`.

La infraestructura de entrenamiento se basa en verl con FSDP, ejecutada en MeluXina (LuxProvide); el código está disponible en el repositorio base-model-sft-verl del autor. No se documentan en la model card el número total de tokens vistos, la composición exacta del subconjunto ni hiperparámetros como la tasa de aprendizaje o el esquema de empaquetado de secuencias. Tampoco se describe ninguna innovación arquitectónica propia: es un SFT estándar sobre un modelo base existente.

## Capacidades

- Generación de texto y razonamiento matemático paso a paso con modo de pensamiento largo (`<think>`).
- Resolución de problemas de competición (AIME, AMC) con respuesta final en formato `\boxed{}`.
- Cadena de pensamiento explícita, útil para auditar el razonamiento intermedio.
- Conversación multi-turno mediante la plantilla de chat de Qwen, con terminador `<|im_end|>` (token 151645).
- No se declara soporte de tool calling ni function calling en la model card.
- No se declara soporte de agentes ni de razonamiento multi-paso con herramientas.
- Capacidad multilingüe limitada al inglés según el campo `language` de la model card.
- No se declara soporte de visión ni de audio.

## Casos de uso

- Evaluación de SFT matemático: usar este checkpoint como referencia de época 3 para comparar curvas de aprendizaje frente a las épocas 1 y 2 del mismo run, reproduciendo el barrido sobre AIME-2025, AIME-2026 y AMC-2023 con 16 muestras por problema.
- Generación de soluciones razonadas para datasets de entrenamiento: producir trazas `<think>` largas y respuestas boxed que sirvan como datos de destilación o de arranque en caliente para etapas posteriores de RL.
- Motor de resolución de problemas en un pipeline de verificación: integrar el modelo detrás de un comprobador simbólico que valide la respuesta `\boxed{}` y descarte las incorrectas, aprovechando que el formato de salida es parseable.
- Investigación sobre longitud de razonamiento: estudiar cómo varía la longitud y calidad del bloque `<think>` con las épocas de SFT, dado que el modelo está entrenado explícitamente para pensar antes de responder.
- Prototipado de tutores matemáticos en inglés: desplegar el modelo en un entorno controlado para generar explicaciones paso a paso de problemas de competición, con revisión humana obligatoria.
- Baseline en ablaciones de datos: comparar este SFT de 45k filas contra variantes con otros subconjuntos de OpenR1-Math-220k para medir el efecto del volumen y la selección de datos.

## Benchmarks y rendimiento

Los únicos datos publicados en la model card son el barrido de épocas sobre 100 problemas de competición (30 AIME-2025, 30 AIME-2026 y 40 AMC-2023), con 16 muestras por problema y métrica pass@1:

| Checkpoint | Epoca | pass@1 (100 problemas, 16 muestras) |
|---|---|---|
| Qwen3-4B-SFT-Math | 1 | 37,0 % |
| Qwen3-4B-SFT-Math (recomendado) | 2 | 38,9 % |
| Qwen3-4B-SFT-Math-45k-ep3 (este) | 3 | 37,3 % |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de comparación directa con otros modelos en la información disponible. El autor indica que la época 2 es el checkpoint recomendado del run, lo que sugiere que la época 3 no mejora el rendimiento agregado en ese barrido.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 9 GB solo para pesos (4.411 M de parámetros × 2 bytes), más caché KV y activaciones; presupuesto práctico de 12-16 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 4,5-5 GB de pesos; en 4 bits, aproximadamente 2,5-3 GB de pesos.
- GPU recomendadas para fp16: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para secuencias largas; para cuantización de 4-8 bits, RTX 3090/4090, RTX 4080 o incluso GPUs de 8-12 GB con contexto reducido.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 en bf16 con margen, y en GPUs de 8-12 GB si se cuantiza.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); llama.cpp, Ollama o vLLM no están declarados por el autor y requerirían conversión propia de pesos.
- Latencia y throughput: no disponibles. El modo de pensamiento largo implica generar muchos tokens por respuesta, por lo que conviene fijar `max_new_tokens` amplio y asumir latencias altas en problemas difíciles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-4B-SFT-Math-45k-ep3 | 4,41 B (denso) | no disponible | pass@1 37,3 % (ep. 3) en el barrido del autor | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3-4B-SFT-Math (ep. 2) | 4,41 B (denso) | no disponible | pass@1 38,9 % en el mismo barrido | Apache 2.0 | Hugging Face |
| Qwen/Qwen3-4B-Base | 4,41 B (denso) | no disponible | no evaluado en el barrido del autor | Apache 2.0 | Hugging Face |
| DeepSeek-R1-Distill-Qwen-1.5B | 1,5 B (denso) | no disponible | no disponible en esta información | MIT (según su model card) | Hugging Face |

La comparación cuantitativa con alternativas de la misma categoría (destilados matemáticos de 1,5-7B) no está disponible en la información proporcionada. La única referencia interna fiable es la comparación entre épocas del propio run.

## Limitaciones y advertencias

- Modelo de investigación: SFT exclusivamente matemático y sin etapa de RL; el autor lo describe explícitamente como no apto como asistente general.
- Riesgo de alucinación elevado fuera del dominio matemático y también dentro de él cuando el problema excede la capacidad del modelo base de 4B.
- Idioma limitado al inglés según la model card; el rendimiento en castellano no está evaluado y previsiblemente será inferior.
- El checkpoint recomendado del run es la época 2, no este; usar la época 3 solo si se busca reproducir el barrido.
- Longitud de contexto no documentada en la model card; conviene verificar el valor heredado de Qwen3-4B-Base antes de desplegar con secuencias largas.
- Sin datos de sesgos publicados; al derivar de un modelo base preentrenado con datos web, hereda los sesgos de ese corpus.
- Licencia Apache 2.0: permite uso comercial, pero al ser un checkpoint de investigación sin garantías de calidad, no se recomienda en producción sin evaluación propia.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria independiente.
- El formato de salida depende de que se respete la plantilla de chat de Qwen y el token `<|im_end|>`; un prompt mal formateado degrada la calidad del razonamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math-45k-ep3
- Checkpoint recomendado (época 2): https://huggingface.co/96kevinli29/Qwen3-4B-SFT-Math
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Código de entrenamiento del autor: https://github.com/96kevinli29/base-model-sft-verl
- Framework verl: https://github.com/volcengine/verl
- Comunidad mantenedora: https://huggingface.co/SeaFill2025

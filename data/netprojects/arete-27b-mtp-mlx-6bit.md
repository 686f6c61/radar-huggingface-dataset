# netprojects/Arete-27B-MTP-MLX-6bit

## Resumen

Arete-27B-MTP-MLX-6bit es una conversión a formato MLX del modelo NousResearch/Arete-27B, un ajuste fino supervisado (SFT) completo de Qwen3.8-27B orientado a respuestas factuales y directas sobre temas políticamente sensibles en siete áreas, preservando capacidades generales y agenticas. La conversión la publica el usuario netprojects y está pensada para ejecución en Apple Silicon mediante la librería MLX, con el modelo de lenguaje cuantizado a 6 bits (afín, grupo 64) y la torre de visión mantenida en bfloat16.

El modelo conserva la arquitectura multimodal de Qwen3.8-27B (pipeline image-text-to-text), con 27.781.427.952 parámetros totales y un peso de repositorio de 23,1 GB. La build incluye una cabeza MTP (multi-token prediction) procedente de Qwen/Qwen3.8-27B que actúa como modelo borrador para decodificación especulativa, con aceleraciones medidas de 1,95x en la build de 4 bits y 2,18x en la de 8 bits.

Es relevante para desarrolladores que necesitan desplegar un modelo de ~27B multimodal en hardware de consumo Apple con un equilibrio entre tamaño y fidelidad respecto a bf16 (98,7% de mismo siguiente token y KL de 0,0018 frente a bf16). La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Qwen3.8-27B, con cabeza MTP para decodificación especulativa |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible (la model card menciona prompts de 8K tokens en mediciones de memoria) |
| Tipos de cuantizacion | 6-bit afín grupo 64 (esta build); el repositorio ofrece también 8-bit, 4-bit, 3-bit, 2.5-bit y bf16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), con `model-mtp.safetensors` adicional |

## Arquitectura y entrenamiento

La build deriva de NousResearch/Arete-27B (revisión `108f0afb`), que a su vez es un ajuste fino supervisado completo de Qwen3.8-27B. Según la model card, el entrenamiento de Arete-27B se realizó únicamente con datos de texto y el codificador de visión se mantuvo congelado; el objetivo es producir respuestas factuales y directas sobre temas políticamente sensibles en siete áreas, conservando habilidades generales y agenticas. No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La conversión a MLX cuantiza el modelo de lenguaje a 6 bits afín con grupo 64, manteniendo la torre de visión en bfloat16. La cabeza MTP incluida (`model-mtp.safetensors`) es la de Qwen/Qwen3.8-27B (revisión `37561816`), cuantizada al mismo ancho de bits de la build; fue entrenada contra el modelo base, no contra Arete-27B, por lo que se trata de una cabeza de modelo base aplicada sobre un ajuste fino. El `config.json` de esta build fija `mtp_num_hidden_layers` a 1 (frente a 0 en Arete-27B) para que los cargadores detecten la cabeza. Cada token propuesto por MTP es verificado por el modelo completo.

## Capacidades

- Generación de texto conversacional y respuestas factuales directas, con foco en temas políticamente sensibles en siete áreas.
- Razonamiento con modo thinking opcional (desactivado por defecto en los ejemplos de la model card).
- Capacidades de visión: pipeline image-text-to-text, con torre de visión en bfloat16 (por ejemplo, interpretar capturas de pantalla o terminales).
- Tool calling / function calling en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), expuesto como `tool_calls` estilo OpenAI por el servidor de mlx-lm.
- Habilidades agenticas y de razonamiento multi-paso (evaluadas en Terminal-Bench-2.1).
- Generación de código (verificado con pruebas de coding 3/3 en esta build).
- Capacidades multilingües: no disponible en la información proporcionada.
- Decodificación especulativa acelerada mediante la cabeza MTP empaquetada.

## Casos de uso

- Asistente conversacional con matices factuales: el ajuste fino de Arete-27B reduce la propaganda en respuestas (0,9% frente a 22% del base según Nous Research) y mejora la puntuación factual (2,98 frente a 2,32), lo que lo hace adecuado para resúmenes y explicaciones sobre temas sensibles.
- Análisis de capturas de pantalla y documentación visual: mediante mlx-vlm se puede pasar una imagen (por ejemplo, un error de terminal) y obtener una explicación, aprovechando la torre de visión en bfloat16.
- Agentes de terminal y automatización: con Terminal-Bench-2.1 de 70 puntos (frente a 67 del base), encaja en tareas de línea de comandos y flujos multi-paso con tool calling.
- Generación de código en local: soporta tool calling y pruebas de coding 3/3, útil para pipelines de desarrollo en equipos Apple sin GPU dedicada.
- Despliegue en portátiles Apple Silicon: con 23,1 GB de pesos y MLX, permite inferencia local en Macs de gama alta, útil para prototipado y privacidad de datos.
- Aceleración de inferencia con decodificación especulativa: usar la cabeza MTP como draft model en mlx-vlm para duplicar el throughput en tareas de generación larga.
- Evaluación de fidelidad de cuantización: la build de 6 bits sirve como referencia de compromiso tamaño/fidelidad (98,7% de mismo siguiente token que bf16) para comparar con 4-bit y 8-bit.

## Benchmarks y rendimiento

Datos de Nous Research para los pesos originales (no mediciones de esta build):

| Medida | Arete-27B | Qwen3.8-27B |
|---|---:|---:|
| Fact score (media) | 2,98 | 2,32 |
| Respuestas con propaganda (803 prompts, thinking off) | 0,9% | 22% |
| Hermes Bench | 65,60 | 65,77 |
| Terminal-Bench-2.1 | 70 | 67 |

Datos de esta build (6-bit) según la model card:

| Medida | Valor |
|---|---|
| Bits por peso | 6,66 |
| Mismo siguiente token que bf16 | 98,7% |
| KL frente a bf16 | 0,0018 |
| GSM8K (50 preguntas, thinking off, greedy) | 46/50 |
| Tool call / coding / thinking / vision | pass / 3/3 / 2/2 / pass |

Rendimiento de decodificación con MTP (misma máquina, mismo conjunto de prompts, greedy):

| Build | tok/s sin MTP | tok/s con MTP | Aceleración | Aceptación |
|---|---:|---:|---:|---:|
| 4-bit | 20,5 | 39,8 | 1,95x | 75% |
| 8-bit | 13,1 | 28,6 | 2,18x | 77% |

La build de 6 bits no fue cronometrada por separado.

## Requisitos de hardware

- VRAM/memoria unificada: 23,1 GB de pesos en esta build de 6 bits; la model card no publica el pico de memoria para 6 bits. Como referencia, la build de 3 bits requiere 14,6 GB de pico con prompt de 8K tokens y la de 2,5 bits 13,8 GB.
- GPU recomendadas: Apple Silicon; las mediciones se hicieron en un MacBook Pro M5 Max (128 GB). No se indican GPU NVIDIA.
- ¿Cabe en GPU de consumo? No aplica a GPUs NVIDIA; en Mac, la build de 3 bits requiere 24 GB+ de RAM según la model card. Para 6 bits, el tamaño de pesos sugiere Macs con al menos 36 GB de RAM, aunque el dato exacto no está disponible.
- Opciones de despliegue: mlx-lm >= 0.32.2 (texto) y mlx-vlm >= 0.7.11 (imágenes). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 20,5 tok/s sin MTP y 39,8 tok/s con MTP en 4 bits; 13,1 y 28,6 tok/s en 8 bits (greedy). Para 6 bits no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Arete-27B-MTP-MLX-6bit | 27,78B | no disponible | Apache 2.0 | MLX safetensors | Build 6-bit, 23,1 GB, MTP incluido |
| Arete-27B-MTP-MLX-4bit | 27,78B | no disponible | Apache 2.0 | MLX safetensors | 16,3 GB, 95,5% mismo token, KL 0,0232, 1,95x con MTP |
| Arete-27B-MTP-MLX-8bit | 27,78B | no disponible | Apache 2.0 | MLX safetensors | 29,9 GB, 99,1% mismo token, KL 0,0005, 2,18x con MTP |
| NousResearch/Arete-27B | 27,78B | no disponible | Apache 2.0 | safetensors | Pesos originales bf16, sin cabeza MTP |
| Qwen/Qwen3.8-27B | no disponible | no disponible | no disponible | safetensors | Modelo base; origen de la cabeza MTP |

## Limitaciones y advertencias

- La cabeza MTP fue entrenada contra Qwen3.8-27B, no contra Arete-27B; es una cabeza de modelo base sobre un ajuste fino, lo que puede reducir la aceptación en dominios específicos.
- Con decodificación greedy, el texto con MTP coincide con la decodificación normal hasta empates cercanos, donde la verificación por lotes puede redondear al otro lado; respuestas largas pueden divergir ligeramente.
- Las ganancias de MTP dependen del prompt y pueden ser menores que las cifras publicadas en textos distintos a los de prueba.
- Los benchmarks de Arete-27B (fact score, propaganda, Hermes Bench, Terminal-Bench-2.1) son cifras de Nous Research sobre los pesos originales, no mediciones de esta build.
- El entrenamiento de Arete-27B fue solo de texto con el codificador de visión congelado; las capacidades de visión no fueron ajustadas específicamente.
- No se dispone de información sobre sesgos, riesgo de alucinación, idiomas soportados ni longitud de contexto exacta.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse el cumplimiento de las condiciones de los modelos base (Qwen3.8-27B y NousResearch/Arete-27B).
- El modelo está orientado a Apple Silicon; no hay soporte documentado para GPUs NVIDIA ni otros backends.

## Enlaces

- Hugging Face (esta build): https://huggingface.co/netprojects/Arete-27B-MTP-MLX-6bit
- Modelo base: https://huggingface.co/NousResearch/Arete-27B
- Modelo base de la cabeza MTP: https://huggingface.co/Qwen/Qwen3.8-27B
- Build 8-bit: https://huggingface.co/netprojects/Arete-27B-MTP-MLX-8bit
- Build 4-bit: https://huggingface.co/netprojects/Arete-27B-MTP-MLX-4bit
- Build 3-bit: https://huggingface.co/netprojects/Arete-27B-MTP-MLX-3bit
- Build 2.5-bit: https://huggingface.co/netprojects/Arete-27B-MTP-MLX-2.5bit
- Build bf16: https://huggingface.co/netprojects/Arete-27B-MTP-MLX-bf16

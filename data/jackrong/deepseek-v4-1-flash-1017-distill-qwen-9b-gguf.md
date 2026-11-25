# Jackrong/DeepSeek-V4.1-Flash-1017-Distill-Qwen-9B-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017-Distill-Qwen-9B es un ajuste fino (fine-tune) del modelo Qwen3.5-9B de Alibaba, desarrollado por el usuario Jackrong. Se trata de un experimento de destilación de razonamiento: el autor transfiere trazas de razonamiento generadas por DeepSeek-V4.1-Flash-1017 (modelo profesor) a un modelo estudiante de 9.197 millones de parámetros, con el objetivo de estudiar cómo se comporta el razonamiento de un modelo grande al comprimirse en uno más pequeño. El resultado es un modelo multimodal (image-text-to-text) con capacidades de visión, publicado en formato GGUF para su uso con llama.cpp.

El modelo se distribuye bajo licencia Apache 2.0 y está orientado a tareas de razonamiento STEM (matemáticas, física y química), además de programación competitiva. Según la model card, alcanza un 89,53 % de precisión en una muestra de 1.500 preguntas de MMLU-Pro STEM, con un promedio de 2.078 tokens de razonamiento por pregunta, lo que supone una reducción del 53 % respecto al Qwen3.5-9B base. Es relevante ahora porque demuestra que la destilación de trazas de razonamiento permite a modelos de 9B mantener precisión cercana a la del modelo base con un coste de generación mucho menor.

La ficha se basa exclusivamente en la información disponible en Hugging Face y en la model card del autor. Muchos datos técnicos (composición exacta del dataset, número de tokens de entrenamiento, idiomas soportados) no están disponibles públicamente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5-9B (con capa NextN/MTP en los GGUF) |
| Parámetros totales | 9.197.093.888 (9,2B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la evaluación usó pases de 128K) |
| Tipos de cuantización | GGUF: Q4_K_M, MTP-Q8_0 (variantes publicadas); proyector mmproj-F16.gguf |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); adaptador LoRA fusionado en checkpoint BF16 Qwen3.5-9B |
| Modelo base | Qwen/Qwen3.5-9B |
| Pipeline | image-text-to-text (multimodal, visión) |
| Tamaño del repo | 30,7 GB |
| Fecha de creación | 2026-11-21 |
| Fecha de actualización | 2026-11-25 |

## Arquitectura y entrenamiento

El modelo parte del checkpoint Qwen3.5-9B en BF16, sobre el que se aplicó un adaptador LoRA que posteriormente se fusionó en el checkpoint base. La arquitectura subyacente es un transformer denso de 9,2B parámetros con capacidades multimodales (visión) heredadas de Qwen3.5-9B. Las cuatro variantes GGUF publicadas incluyen una capa NextN/MTP (Multi-Token Prediction), lo que permite decodificación especulativa con hasta dos tokens draft. Para entrada de imagen se requiere el proyector `mmproj-F16.gguf` junto con una build de llama.cpp compatible.

El entrenamiento se basa en destilación de razonamiento. El dataset principal es `Jackrong/DeepSeek-V4.1-Flash-Nemotron-Competitive-Coding-Distill`, que contiene 6.095 trazas de programación competitiva generadas por DeepSeek-V4.1-Flash-1017 con esfuerzo de razonamiento configurado a `max`. Los prompts provienen del dataset Nemotron de NVIDIA (`nvidia/Nemotron-RL-coding-competitive_coding`). Además, se usaron ejemplos adicionales generados por DeepSeek-Pro (dataset `Jackrong/DeepSeek-V4-Pro-Distilled-200K`). No se especifica el número total de tokens de entrenamiento ni si hubo RLHF o DPO. La innovación técnica destacable es el uso de la capa MTP para decodificación especulativa, que reduce la latencia de generación.

## Capacidades

- Generación de texto conversacional multi-turno.
- Razonamiento explícito (thinking mode) con trazas de razonamiento destiladas de DeepSeek.
- Razonamiento matemático, físico y químico (evaluado en MMLU-Pro STEM).
- Programación competitiva: generación de código con razonamiento paso a paso.
- Capacidades multimodales de visión: entrada de imagen y texto (image-text-to-text) mediante proyector mmproj.
- Decodificación especulativa mediante capa NextN/MTP (hasta dos tokens draft).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente, aunque el razonamiento destilado sugiere capacidad de descomposición en pasos.
- Capacidades multilingües: no disponible.

## Casos de uso

- Resolución de problemas STEM: el modelo puede abordar preguntas de matemáticas, física y química con razonamiento explícito, adecuado para plataformas educativas o de tutoría automatizada que necesiten mostrar el paso a paso.
- Programación competitiva y generación de código algorítmico: entrenado con 6.095 trazas de coding competitivo, puede generar soluciones con razonamiento intermedio, útil en plataformas de práctica o evaluación de código.
- Asistente de razonamiento con coste controlado: gracias a sus 2.078 tokens de razonamiento por pregunta de media (frente a 4.425 del base), es adecuado para entornos donde el coste por consulta importa, como APIs de razonamiento a escala.
- Análisis de imágenes con razonamiento: al ser multimodal, puede recibir una imagen (diagrama, gráfico, captura) y razonar sobre ella, útil en herramientas de análisis técnico o educativo.
- Despliegue local en hardware de consumo: al publicarse en GGUF con cuantización Q4_K_M, puede ejecutarse en estaciones de trabajo con GPU consumer mediante llama.cpp, adecuado para prototipos y experimentación offline.
- Investigación sobre destilación de razonamiento: sirve como caso de estudio para investigadores que quieran medir la transferencia de trazas de razonamiento de modelos grandes a pequeños, con métricas de precisión y eficiencia de tokens publicadas.
- Evaluación comparativa de modelos pequeños: útil como baseline en experimentos de MMLU-Pro STEM, dado que el autor publica resultados comparativos con Qwen3.5-9B y otros modelos destilados.

## Benchmarks y rendimiento

Resultados en MMLU-Pro STEM (muestra fija de 1.500 preguntas: 500 de matemáticas, 500 de física, 500 de química), evaluados con build MTP-Q8_0 GGUF, thinking activado, temperatura 1.0, top-p 0.95 y hasta dos tokens draft:

| Modelo | Matemáticas | Física | Química | Media |
|---|---:|---:|---:|---:|
| DeepSeek-V4-Pro-Qwen3.5-9B | 92,40 % | 89,40 % | 89,80 % | 90,53 % |
| Qwen3.5-9B | 90,60 % | 89,00 % | 89,20 % | 89,60 % |
| **DeepSeek-V4.1-Flash-1017-Qwen-9B** | **92,20 %** | **89,80 %** | **86,60 %** | **89,53 %** |
| Claude Mythos-distilled 27B | 88,40 % | 87,60 % | 82,60 % | 86,20 % |
| Claude Mythos-distilled 9B | 86,00 % | 78,60 % | 78,60 % | 81,07 % |
| DeepSeek-V4-Pro-Qwen3.5-4B | 80,40 % | 74,20 % | 74,80 % | 76,47 % |

Eficiencia de razonamiento (1.497 respuestas completas del primer pase de 128K):

| Modelo | Precisión | Tokens razonamiento / pregunta (media) | Mediana | Tokens / respuesta correcta | Correctas / 1M tokens |
|---|---:|---:|---:|---:|---:|
| **DeepSeek-V4.1-Flash-1017-Qwen-9B** | **89,65 %** | **2.078** | **665** | **2.318** | **431,3** |
| DeepSeek-V4-Pro-Qwen3.5-9B | 90,53 % | 2.858 | 676 | 3.157 | 316,8 |
| Qwen3.5-9B | 89,60 % | 4.425 | 3.214 | 4.938 | 202,5 |
| Claude Mythos-distilled 9B | 81,07 % | 3.310 | 639 | 4.083 | 244,9 |

No se han publicado resultados de otros benchmarks (HumanEval, GSM8K, MMLU general) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para un modelo de 9,2B en GGUF, una cuantización Q4_K_M ocupa del orden de 5-6 GB de pesos, y Q8_0 del orden de 9-10 GB; a ello hay que sumar el proyector mmproj-F16 y el contexto KV cache.
- GPU recomendadas: no especificadas por el autor. La evaluación se realizó en una NVIDIA GB10. Por tamaño, cabe en GPUs consumer como RTX 4090 (24 GB) en Q4_K_M o Q8_0, y en GPUs de 16 GB en Q4_K_M con contexto moderado.
- Cabe en GPU consumer: sí, en Q4_K_M en GPUs de 16 GB o más; en Q8_0 en GPUs de 24 GB o más.
- Opciones de despliegue: llama.cpp (soporte nativo GGUF, con `--spec-type draft-mtp` para MTP); también transformers con el checkpoint BF16 fusionado. No se confirma soporte en vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles. El uso de MTP con hasta dos tokens draft está orientado a reducir latencia, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro STEM (media) | Tokens razonamiento / pregunta | Licencia | Formato |
|---|---|---:|---:|---:|---|---|
| **DeepSeek-V4.1-Flash-1017-Qwen-9B** | 9,2B | no disponible | 89,53 % | 2.078 | Apache 2.0 | GGUF |
| Qwen3.5-9B (base) | 9B | no disponible | 89,60 % | 4.425 | no disponible | BF16 / GGUF |
| DeepSeek-V4-Pro-Qwen3.5-9B | 9B | no disponible | 90,53 % | 2.858 | no disponible | GGUF |
| Claude Mythos-distilled 9B | 9B | no disponible | 81,07 % | 3.310 | no disponible | GGUF |
| DeepSeek-V4-Pro-Qwen3.5-4B | 4B | no disponible | 76,47 % | no disponible | no disponible | GGUF |

La ventaja principal del modelo frente a Qwen3.5-9B es la eficiencia: misma precisión aproximada con un 53 % menos de tokens de razonamiento. Frente a DeepSeek-V4-Pro-Qwen3.5-9B, pierde 1 punto de precisión pero es más eficiente en tokens.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de Qwen3.5-9B y de trazas de DeepSeek, puede heredar sesgos de ambos.
- Riesgo de alucinación: no evaluado ni cuantificado en la información disponible; el razonamiento destilado no elimina el riesgo de respuestas incorrectas con alta confianza.
- Limitaciones de contexto o idioma: la longitud de contexto oficial no está publicada; la evaluación usó pases de 128K, pero no se confirma como ventana soportada. Los idiomas soportados no están declarados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las licencias del modelo base Qwen3.5-9B y de los datasets de destilación, que pueden imponer condiciones adicionales.
- Requiere una build de llama.cpp compatible con MTP y con el proyector mmproj para visión; sin ella, las capacidades multimodales y la decodificación especulativa no funcionan.
- El modelo es un experimento de investigación con muy pocas descargas (12) y sin likes; no hay validación comunitaria independiente de los resultados.
- Los benchmarks se limitan a MMLU-Pro STEM; no hay datos de rendimiento en código, matemáticas generales o tareas multimodales.
- El repositorio ocupa 30,7 GB, lo que implica descargas considerables si se quieren todas las variantes GGUF.

## Enlaces

- Hugging Face: https://huggingface.co/Jackrong/DeepSeek-V4.1-Flash-1017-Distill-Qwen-9B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo profesor (Flash): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Dataset de destilación: https://huggingface.co/datasets/Jackrong/DeepSeek-V4.1-Flash-Nemotron-Competitive-Coding-Distill
- Dataset upstream NVIDIA: https://huggingface.co/datasets/nvidia/Nemotron-RL-coding-competitive_coding
- Dataset DeepSeek-V4-Pro destilado: https://huggingface.co/datasets/Jackrong/DeepSeek-V4-Pro-Distilled-200K
- Benchmark MMLU-Pro: https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro
- Guía de fine-tuning del autor: https://github.com/R6410418/Jackrong-llm-finetuning-guide
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Modelo relacionado (Coder Flash): https://huggingface.co/Jackrong/Qwopus3-5-9B-Coder-Flash-GGUF

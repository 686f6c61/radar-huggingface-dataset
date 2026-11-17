# LouieR09112/jairo-ai-1.0-pro

## Resumen

Jairo AI 1.0 Pro es un modelo de lenguaje de 8.030.261.248 parámetros (8,03 mil millones) publicado por el usuario LouieR09112 en Hugging Face. Se trata de un ajuste fino (fine-tune) del modelo `deepseek-ai/DeepSeek-R1-Distill-Llama-8B`, que a su vez es una destilación del DeepSeek-R1 sobre la arquitectura Llama-3.1. El modelo se presenta como el nivel "pro" de razonamiento dentro de la familia Jairo AI, orientado a tareas de lógica multi-paso, matemáticas e ingeniería de software.

El modelo se distribuye con licencia MIT, en formato safetensors y compatible con la librería transformers y con text-generation-inference. El repositorio ocupa 16,1 GB y declara únicamente el idioma inglés. La model card indica que el ajuste se realizó sobre el dataset `HuggingFaceH4/ultrachat_200k`, aunque no se detallan hiperparámetros, número de tokens de entrenamiento ni metodología de alineación.

La relevancia de este modelo es limitada en el ecosistema actual: se publicó el 17 de noviembre de 2026, no registra descargas ni "likes", y no aporta benchmarks propios. Su interés principal radica en ser un ejemplo de fine-tune comunitario sobre una base de razonamiento consolidada (R1-Distill-Llama-8B), útil para quienes quieran evaluar la variabilidad de calidad entre ajustes derivados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.1, base DeepSeek-R1-Distill-Llama-8B) |
| Parámetros totales | 8.030.261.248 (8,03 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (la base Llama-3.1 soporta hasta 128K, pero no se confirma para este fine-tune) |
| Tipos de cuantización | No disponible (el repo solo contiene safetensors; no se publican GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Llama-3.1 del checkpoint `DeepSeek-R1-Distill-Llama-8B`: un transformer decoder-only denso con atención por cabezas agrupadas (GQA), activación SwiGLU y normalización RMSNorm. La base DeepSeek-R1-Distill-Llama-8B fue destilada por DeepSeek a partir de su modelo de razonamiento R1, de modo que el checkpoint original ya incorpora patrones de cadena de pensamiento (chain-of-thought) en las respuestas.

El ajuste fino realizado por LouieR09112 se documenta únicamente como entrenamiento sobre `HuggingFaceH4/ultrachat_200k`, un dataset de conversaciones multi-turno de propósito general. No se especifican en la model card el número de tokens vistos, la composición exacta del dataset, la presencia de datos de razonamiento o código, ni si se aplicaron técnicas de RLHF, DPO o SFT supervisado más allá del ajuste sobre ultrachat. Tampoco se detallan hiperparámetros (learning rate, épocas, batch size) ni innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, con soporte de plantilla de chat (`apply_chat_template`) y rol de sistema.
- Razonamiento multi-paso y resolución de problemas lógicos, heredado de la destilación de DeepSeek-R1.
- Matemáticas y problemas aritméticos o algebraicos de varios pasos.
- Generación y asistencia en código, orientada a ingeniería de software según la model card.
- Conversación multi-turno con contexto gestionado por la plantilla de chat.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso orquestado con herramientas.
- No se documenta capacidad de visión, audio ni modo "thinking" explícito separado de la generación.
- Capacidad multilingüe limitada al inglés según el campo `language`.

## Casos de uso

- Asistencia en resolución de problemas matemáticos paso a paso: el modelo puede recibir un enunciado y generar una cadena de razonamiento explícita, útil en entornos educativos o de autoaprendizaje donde se quiera visualizar el proceso y no solo la respuesta.
- Generación de código en entornos de desarrollo: dado que la model card lo orienta a ingeniería de software, puede emplearse para completar funciones, explicar fragmentos o proponer refactorizaciones en inglés, integrándose en editores mediante la API de transformers.
- Chatbot de soporte técnico en inglés: con plantilla de chat y rol de sistema, puede mantener conversaciones multi-turno para responder dudas técnicas, siempre que el contexto efectivo del fine-tune sea suficiente (no confirmado).
- Prototipado de razonamiento en investigación: sirve como punto de comparación frente a la base R1-Distill-Llama-8B para estudiar cómo un ajuste sobre ultrachat altera el comportamiento de razonamiento del modelo original.
- Evaluación de fine-tunes comunitarios: útil para pipelines de evaluación de calidad de modelos pequeños publicados en Hugging Face, comparando coherencia, fidelidad y tasas de alucinación frente a la base.
- Despliegue en local para experimentación: al ser un modelo de 8B en safetensors con licencia MIT, puede cargarse en una GPU de consumo para pruebas de inferencia con transformers o text-generation-inference, sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 20-24 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 8-9 GB para pesos; en 4 bits, alrededor de 4,5-5 GB (estimaciones teóricas, no confirmadas por el autor, ya que no se publican cuantizaciones oficiales).
- GPU recomendadas: A100 40 GB, H100, L40S o RTX 4090 (24 GB) para FP16 sin cuantizar.
- GPU de consumo: cabe en RTX 4090 en FP16; en RTX 3090 (24 GB) también; en GPUs de 16 GB requeriría cuantización, que no está publicada oficialmente y habría que generar.
- Opciones de despliegue: transformers (soporte nativo según la model card), text-generation-inference (tag `text-generation-inference`), y potencialmente llama.cpp/Ollama si se generan GGUF a partir de los safetensors (no publicados).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Benchmark publicado | Disponibilidad |
|---|---|---|---|---|---|
| Jairo AI 1.0 Pro | 8,03 B | No disponible | MIT | No | Hugging Face (0 descargas) |
| deepseek-ai/DeepSeek-R1-Distill-Llama-8B | 8 B | 128K (según Llama-3.1) | MIT (según repo base) | Sí, publicado por DeepSeek | Hugging Face, ampliamente usado |
| meta-llama/Llama-3.1-8B-Instruct | 8 B | 128K | Llama 3.1 Community License | Sí | Hugging Face, ampliamente usado |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | 128K | Apache 2.0 | Sí | Hugging Face, ampliamente usado |

La comparativa se basa en características públicas de los modelos de referencia; no se dispone de datos de rendimiento de Jairo AI 1.0 Pro para contrastar.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes; el rendimiento real es desconocido y no puede asumirse equivalente al de la base R1-Distill-Llama-8B.
- El ajuste sobre `ultrachat_200k` puede haber degradado o alterado los patrones de razonamiento de la base, sin que el autor documente el efecto.
- Idioma limitado al inglés; no se garantiza calidad en castellano ni en otros idiomas.
- Longitud de contexto no confirmada para este fine-tune; no asumir los 128K de Llama-3.1 sin verificación.
- Riesgo de alucinación inherente a modelos de 8B, especialmente en matemáticas y código; no se documentan mitigaciones.
- No se documentan sesgos conocidos, pero al derivar de Llama-3.1 y entrenar sobre ultrachat, es probable que herede sesgos de ambos; el autor no los analiza.
- Licencia MIT permite uso comercial, pero el modelo base DeepSeek-R1-Distill-Llama-8B y Llama-3.1 tienen sus propias condiciones que conviene revisar antes de producción.
- Cero descargas y cero "likes": no hay evidencia de uso en producción ni de validación por la comunidad.
- No se publican cuantizaciones GGUF ni versiones optimizadas; el despliegue eficiente requiere trabajo adicional por parte del usuario.
- La model card no detalla hiperparámetros ni metodología de entrenamiento, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LouieR09112/jairo-ai-1.0-pro
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- Modelo hermano (Flash): https://huggingface.co/LouieR09112/jairo-ai-1.0-flash
- Modelo hermano (Shield): https://huggingface.co/LouieR09112/jairo-ai-shield-500m
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Repositorio DeepSeek-R1 (paper y código): https://github.com/deepseek-ai/DeepSeek-R1

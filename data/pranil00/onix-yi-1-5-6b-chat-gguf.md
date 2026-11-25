# pranil00/ONIX-Yi-1.5-6B-Chat-GGUF

## Resumen

ONIX-Yi-1.5-6B-Chat-GGUF es una cuantizacion en formato GGUF (esquema Q5_K_M, 5,5 bits por peso) del modelo 01-ai/Yi-1.5-6B-Chat, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. No se trata de un modelo nuevo ni de un fine-tuning: es un artefacto de conversion que empaqueta los pesos del Yi-1.5-6B-Chat original en un fichero de 4,07 GB (frente a los 11,85 GB en FP16), reduciendo el peso un 65,6 % y permitiendo su ejecucion en hardware de consumo.

El modelo base, Yi-1.5-6B-Chat, es un transformer denso de la familia LLaMA con 6.061.031.424 parametros, desarrollado por 01-ai y publicado originalmente bajo licencia Apache 2.0. Esta version cuantizada hereda esa licencia y esta pensada para despliegue local: el autor reporta que cabe en 4,40 GB de memoria unificada en Apple Silicon, 5,57 GB de VRAM en GPUs NVIDIA y 6,40 GB de RAM en CPU, con una ventana de contexto operativa de 8.192 tokens en aceleracion por hardware y 4.096 en CPU.

La relevancia de esta ficha es practica: sirve para evaluar si el artefacto es util para inferencia local en equipos de gama media. Conviene advertir desde el principio que el repositorio no incluye resultados de benchmarks propios, no declara idiomas soportados y presenta un unico fichero cuantizado en Q5_K_M, sin otras variantes (Q4, Q8, etc.) disponibles en el mismo repo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, familia LLaMA (heredada del modelo base Yi-1.5-6B-Chat) |
| Parametros totales | 6.061.031.424 (6,06 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens en GPU/Apple Silicon; 4.096 tokens en CPU (ventana operativa reportada por el autor) |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); no se ofrecen otras variantes en el repo |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `01-ai--Yi-1.5-6B-Chat-Q5_K_M.gguf`, 4,07 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Yi-1.5-6B-Chat de 01-ai: un transformer denso decoder-only de la familia LLaMA con 6,06 mil millones de parametros. Esta publicacion no aporta informacion sobre el proceso de entrenamiento del modelo base (numero de tokens, composicion del dataset, fases de RLHF/DPO), por lo que esos datos deben consultarse en la model card original de 01-ai/Yi-1.5-6B-Chat, no en este repositorio.

La unica innovacion tecnica documentada en este artefacto es el proceso de cuantizacion: conversion a GGUF con esquema Q5_K_M mediante la herramienta `run-any-model`, un motor de optimizacion adaptativo al dispositivo desarrollado por PranilShah-08. El autor reporta una compresion de 2,91x respecto a FP16, una retencion de calidad estimada del 97,5 % y aceleracion de las 32 capas en Metal. Estas cifras son estimaciones del propio autor y no estan respaldadas por una evaluacion independiente de benchmarks en el repositorio.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Yi-1.5-6B-Chat (pipeline `text-generation`).
- Razonamiento y respuesta a instrucciones en formato chat, con plantilla de parada `<|im_end|>` y `<|endoftext|>`.
- Ejecucion local en CPU, GPU NVIDIA y Apple Silicon mediante llama.cpp, Ollama, LM Studio, Jan y Text-Generation-WebUI.
- Inferencia con aceleracion Metal (Apple Silicon) y CUDA (RTX 30/40/50) segun el autor.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- **Asistente conversacional local en portatil**: el fichero Q5_K_M de 4,07 GB cabe en 4,40 GB de memoria unificada en Apple Silicon (M1 a M5) y permite mantener una sesion de chat con 8.192 tokens de contexto sin conexion a internet, util para prototipado y demos offline.
- **Chatbot de atencion al cliente en equipo de sobremesa**: con 5,57 GB de VRAM en una RTX 30/40/50 se puede servir un endpoint de generacion de respuestas a consultas frecuentes; la ventana de 8.192 tokens admite historiales de conversacion moderadamente largos.
- **Generacion de texto en pipelines de CPU**: en un servidor Windows/Linux sin GPU, el modelo requiere 6,40 GB de RAM libre y ofrece 4.096 tokens de contexto con instrucciones AVX2/AVX-512, adecuado para tareas de resumen o redaccion por lotes de baja concurrencia.
- **Prototipado rapido con Ollama**: el Modelfile incluido en la model card permite crear una imagen local (`ollama create yi-1.5-6b-chat-quant`) y probar prompts en minutos, sin depender de APIs externas ni de costes por token.
- **Integracion en LM Studio o Jan para evaluacion de prompts**: al ser un GGUF estandar, se puede arrastrar el fichero al directorio `models/` de estas aplicaciones de escritorio y comparar respuestas frente a otros modelos locales en la misma maquina.
- **Desarrollo de asistentes embebidos en aplicaciones de escritorio**: la licencia Apache 2.0 permite redistribuir el artefacto dentro de un producto comercial, siempre que se cumplan las condiciones de atribucion de la licencia y se auditen las salidas del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio unicamente incluye una matriz de telemetria de despliegue (no de calidad) generada por el motor `run-any-model`:

| Metrica | Baseline (FP16) | Cuantizado (Q5_K_M) | Cambio |
|---|---|---|---|
| Precision en bits por parametro | 16,0 | 5,5 | -65,6 % |
| Tamano de pesos | 11,85 GB | 4,07 GB | -65,6 % |
| Buffer KV Cache | 256,0 MB (FP16) | 256,0 MB (FP16) | Optimizado |
| RAM residente total | 12,18 GB | 4,40 GB | -63,9 % |
| Capas aceleradas | 0 % | 32/32 | Optimo |
| Calidad estimada | 100 % baseline | 97,5 % retenido | -2,5 % |

Estos valores son mediciones de huella de memoria y velocidad de despliegue aportadas por el autor, no resultados de MMLU, HumanEval, GSM8K ni de ninguna otra suite de evaluacion de calidad.

## Requisitos de hardware

- **Apple Silicon (M1/M2/M3/M4/M5)**: 4,40 GB de memoria unificada, contexto optimo de 8.192 tokens, aceleracion Metal nativa.
- **GPU NVIDIA (RTX 30/40/50)**: 5,57 GB de VRAM dedicada, contexto optimo de 8.192 tokens, aceleracion CUDA.
- **CPU Windows/Linux**: 6,40 GB de RAM libre, contexto optimo de 4.096 tokens, requiere soporte AVX2 o AVX-512.
- **Cabe en GPU de consumo**: si, segun el autor, en tarjetas con al menos 6 GB de VRAM (por ejemplo RTX 3060, RTX 4060, RTX 4070 y superiores). No se especifican modelos concretos mas alla de la serie.
- **Opciones de despliegue**: llama.cpp (`llama-cli -m ... -c 4096 -ngl 99 -cnv`), Ollama (via Modelfile), LM Studio, Jan, Text-Generation-WebUI y el CLI `run-any-model`.
- **Latencia y throughput**: no disponibles. El repositorio no publica tokens por segundo ni latencias medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-Yi-1.5-6B-Chat-GGUF (esta ficha) | 6,06 B | 8.192 (GPU) / 4.096 (CPU) | GGUF Q5_K_M, 4,07 GB | Apache 2.0 | Hugging Face, 0 descargas |
| 01-ai/Yi-1.5-6B-Chat (modelo base) | 6,06 B | No disponible en esta ficha | Safetensors (FP16, ~11,85 GB) | Apache 2.0 | Hugging Face, mantenido por 01-ai |
| Mistral-7B-Instruct (GGUF) | 7,24 B | 32.768 tokens (segun model card oficial) | GGUF (multiples cuantizaciones) | Apache 2.0 | Hugging Face, ampliamente distribuido |
| Qwen2.5-7B-Instruct (GGUF) | 7,62 B | 32.768 tokens (segun model card oficial) | GGUF (multiples cuantizaciones) | Apache 2.0 | Hugging Face, ampliamente distribuido |

La comparativa se limita a parametros, contexto reportado y licencia; no se dispone de datos de rendimiento comparables en la informacion proporcionada para esta publicacion concreta.

## Limitaciones y advertencias

- **Sin benchmarks de calidad**: el autor no publica resultados de MMLU, HumanEval, GSM8K ni de evaluacion conversacional; la cifra de "97,5 % de retencion de calidad" es una estimacion interna del motor de cuantizacion, no una medicion verificable.
- **Repositorio sin traccion**: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia (25 de noviembre de 2026). No hay evidencia de uso en produccion ni de validacion por terceros.
- **Idiomas no declarados**: la model card no especifica que idiomas soporta el modelo; no se puede asumir un rendimiento solido en castellano sin evaluacion previa.
- **Una sola cuantizacion**: solo se ofrece Q5_K_M. Quien necesite Q4 para equipos con menos VRAM o Q8 para mayor fidelidad tendra que generarlas a partir del modelo base.
- **Riesgo de alucinacion**: inherente a los modelos de 6 B de la familia LLaMA; el autor incluye un descargo de responsabilidad absoluto que traslada al usuario toda la responsabilidad sobre las salidas.
- **Restricciones de licencia**: Apache 2.0 permite uso comercial, pero el autor anade un disclaimer que exime de cualquier garantia y responsabilidad; conviene revisar la licencia del modelo base 01-ai/Yi-1.5-6B-Chat antes de redistribuir.
- **Caveat de produccion**: la model card esta redactada como material promocional de la herramienta `run-any-model`; las cifras de memoria y aceleracion no han sido auditadas de forma independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pranil00/ONIX-Yi-1.5-6B-Chat-GGUF
- Modelo base: https://huggingface.co/01-ai/Yi-1.5-6B-Chat
- Organizacion ONIX en Hugging Face: https://huggingface.co/ONIX
- Motor de cuantizacion run-any-model: https://github.com/PranilShah-08/run-any-model

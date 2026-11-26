# pranil00/ONIX-DeepSeek-V2-Lite-Chat-GGUF

## Resumen

ONIX-DeepSeek-V2-Lite-Chat-GGUF es una cuantizacion en formato GGUF del modelo DeepSeek-V2-Lite-Chat, publicada por el usuario pranil00 bajo la etiqueta de la comunidad ONIX. El artefacto se genera con la herramienta run-any-model, un motor de optimizacion adaptativo al dispositivo, y emplea el esquema de cuantizacion Q5_K_M (5,5 bits por peso). El modelo base es un transformer de tipo Mixture-of-Experts (MoE) desarrollado por DeepSeek, con 15,7 mil millones de parametros totales y 2,4 mil millones de parametros activos por token, entrenado para conversacion y generacion de texto.

La relevancia de esta publicacion radica en su reducido peso: el archivo GGUF ocupa 1,81 GB, lo que representa una compresion del 65,6 % respecto a los 5,26 GB en FP16. Segun la model card, el modelo puede ejecutarse en Apple Silicon con 2,69 GB de memoria unificada, en GPUs NVIDIA RTX de las series 30/40/50 con 3,31 GB de VRAM dedicada, y en CPU con 4,69 GB de RAM libre. Esto lo situa en la categoria de modelos ejecutables en hardware de consumo, con una ventana de contexto operativa recomendada de 8.192 tokens (4.096 en CPU).

No obstante, la model card no aporta informacion sobre el dataset de entrenamiento, los idiomas soportados, los resultados de benchmarks ni la arquitectura interna detallada del modelo base. La ficha se completa con los datos disponibles y se indica explicitamente cuando un dato no esta presente en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), familia DeepSeek (modelo base DeepSeek-V2-Lite-Chat) |
| Parametros totales | 2.688.004.096 (2,69 mil millones) segun la model card; el modelo base DeepSeek-V2-Lite-Chat declara 15,7 mil millones totales |
| Parametros activos | no disponible en la model card (el modelo base activa aproximadamente 2,4 mil millones por token) |
| Longitud de contexto | 8.192 tokens recomendados en GPU/Apple Silicon; 4.096 tokens en CPU |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por peso); unica variante publicada |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo deepseek-ai--DeepSeek-V2-Lite-Chat-Q5_K_M.gguf, 1,81 GB) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V2-Lite-Chat es un transformer con arquitectura Mixture-of-Experts (MoE) de la familia DeepSeek-V2. La model card del artefacto cuantizado no detalla la composicion del dataset de entrenamiento, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se especifica el mecanismo de atencion ni innovaciones como decodificacion especulativa o atencion lineal. La informacion disponible se limita al proceso de cuantizacion: conversion a GGUF con el esquema Q5_K_M mediante run-any-model, con una retencion de calidad estimada del 97,5 % respecto al modelo en FP16 y una aceleracion de las 27 capas en el motor Metal de Apple.

El proceso de cuantizacion reduce el peso de 5,26 GB (FP16) a 1,81 GB, manteniendo el buffer de KV cache en 864 MB en FP16. La memoria residente total pasa de 6,14 GB a 2,69 GB, lo que valida el artefacto como "EXCELLENT (Native Fit)" para hardware de consumo segun la auditoria incluida en la model card.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base DeepSeek-V2-Lite-Chat.
- Razonamiento y respuesta a instrucciones en formato chat (etiquetas de parada `<|im_end|>` y `<|endoftext|>`).
- Ejecucion local en CPU, GPU NVIDIA y Apple Silicon mediante llama.cpp, Ollama, LM Studio, Jan y Text-Generation-WebUI.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en portatiles: el modelo cabe en 2,69 GB de memoria unificada en Apple Silicon y en 3,31 GB de VRAM en GPUs RTX, por lo que puede desplegarse en equipos de consumo sin conexion a la nube para tareas de chat y resumen.
- Prototipado rapido de aplicaciones de chat: con Ollama o llama.cpp se levanta un servidor de inferencia en minutos usando el archivo GGUF de 1,81 GB, adecuado para validar prompts e interfaces antes de migrar a un modelo mayor.
- Procesamiento por lotes en CPU: con 4,69 GB de RAM libre y soporte AVX2/AVX-512, el modelo puede ejecutar tareas de clasificacion o generacion de texto en servidores sin GPU.
- Educacion e investigacion: al ser un artefacto Apache 2.0 de bajo peso, sirve para estudiar el comportamiento de modelos MoE cuantizados y comparar la fidelidad de Q5_K_M frente a FP16 (retencion estimada del 97,5 %).
- Integracion en asistentes de escritorio: LM Studio y Jan permiten cargar el GGUF directamente desde el directorio `models/`, habilitando asistentes locales integrados en el flujo de trabajo del desarrollador.
- Despliegue en entornos con recursos limitados: la ventana de contexto de 4.096 tokens en CPU y 8.192 en GPU permite gestionar conversaciones de longitud moderada en dispositivos edge o contenedores con poca memoria.
- Evaluacion de la cadena de cuantizacion run-any-model: el artefacto incluye un informe de telemetria que permite auditar la aceleracion de capas y el consumo de memoria en distintos dispositivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye una matriz de telemetria de cuantizacion que compara FP16 frente a Q5_K_M en terminos de precision, tamano y memoria, pero no reporta metricas de calidad como MMLU, HumanEval o GSM8K.

| Metrica | FP16 (baseline) | Q5_K_M | Cambio |
|---|---|---|---|
| Precision | 16,0 bits/parametro | 5,5 bits/parametro | -65,6 % |
| Tamano de pesos | 5,26 GB | 1,81 GB | -65,6 % |
| KV cache | 864 MB (FP16) | 864 MB (FP16) | Optimizado |
| RAM residente total | 6,14 GB | 2,69 GB | -56,2 % |
| Calidad estimada | 100,0 % | 97,5 % | -2,5 % |
| Aceleracion de capas | 0 % | 27/27 capas | Optimo |

## Requisitos de hardware

- VRAM estimada para inferencia: 3,31 GB de VRAM dedicada en GPUs NVIDIA RTX de las series 30/40/50.
- Memoria unificada en Apple Silicon: 2,69 GB en chips M1/M2/M3/M4/M5 con aceleracion Metal nativa.
- RAM en CPU: 4,69 GB libres, con soporte para instrucciones AVX2 y AVX-512.
- GPU recomendadas: RTX 30/40/50 series; no se especifican modelos concretos como A100 o H100 en la model card.
- Cabe en GPU de consumo: si, en tarjetas RTX de las series 30/40/50 con al menos 3,31 GB de VRAM.
- Opciones de despliegue: run-any-model CLI, Ollama, llama.cpp (`llama-cli`), LM Studio, Jan y Text-Generation-WebUI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ONIX-DeepSeek-V2-Lite-Chat-GGUF (Q5_K_M) | 2,69 mil millones (segun model card); base de 15,7 mil millones totales | 8.192 tokens (GPU), 4.096 (CPU) | GGUF | Apache 2.0 | Hugging Face |
| deepseek-ai/DeepSeek-V2-Lite-Chat (FP16) | 15,7 mil millones totales, ~2,4 mil millones activos | no disponible | safetensors | Apache 2.0 | Hugging Face |
| Alternativas de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base ni del proceso de cuantizacion.
- Riesgo de alucinacion: inherente a los modelos generativos; la model card no aporta evaluaciones especificas de fidelidad factual.
- La cuantizacion Q5_K_M implica una perdida estimada del 2,5 % de calidad respecto a FP16, segun la propia model card; no se han publicado evaluaciones independientes que lo verifiquen.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento adecuado fuera del ingles o el chino sin validacion previa.
- Ventana de contexto limitada a 8.192 tokens en GPU y 4.096 en CPU, inferior a la de modelos actuales con contextos de 32K o superiores.
- La licencia Apache 2.0 permite uso comercial, pero la model card incluye una clausula de exencion total de responsabilidad que traslada al implementador la obligacion de auditar todas las salidas.
- El artefacto registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que carece de validacion por parte de la comunidad.
- No se especifican los parametros activos del MoE ni la composicion exacta del modelo base en la model card del artefacto cuantizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pranil00/ONIX-DeepSeek-V2-Lite-Chat-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V2-Lite-Chat
- Repositorio run-any-model: https://github.com/PranilShah-08/run-any-model
- Organizacion ONIX en Hugging Face: https://huggingface.co/ONIX

# pranil00/ONIX-Yi-Coder-1.5B-Chat-GGUF

## Resumen
ONIX-Yi-Coder-1.5B-Chat-GGUF es una cuantizacion en formato GGUF del modelo 01-ai/Yi-Coder-1.5B-Chat, publicada por el usuario pranil00 bajo el paraguas de la denominada "ONIX Community". El modelo base, desarrollado por 01.AI, es un transformer de la familia LLaMA especializado en generacion de codigo y conversacion, con 1.476.493.312 parametros (aproximadamente 1,48 mil millones). Esta version concreta aplica una cuantizacion Q5_K_M (5,5 bits por parametro) que reduce el peso de los pesos de 2,89 GB en FP16 a 0,99 GB.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de codigo conversacional en hardware de consumo muy modesto, incluyendo equipos con CPU sin GPU dedicada, Apple Silicon con memoria unificada o GPUs NVIDIA de gama media-baja. El autor reporta un peso comprimido de 1016,5 MB, una ratio de compresion de 2,91x respecto a FP16 y una retencion de calidad estimada del 97,5 % segun su propia auditoria (no verificada de forma independiente).

Se trata, por tanto, de un artefacto de cuantizacion y no de un modelo entrenado desde cero: no aporta innovaciones arquitectonicas propias, sino que empaqueta el modelo de 01.AI para despliegue local ligero. La ficha se centra en lo que la informacion disponible permite afirmar, marcando como "no disponible" todo aquello que la model card no documenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia LLaMA (segun model card) |
| Parametros totales | 1.476.493.312 (1,48 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (GPU/Apple Silicon); 4.096 tokens (CPU) segun la model card |
| Tipos de cuantizacion | Q5_K_M (5,5 bits por parametro) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`01-ai--Yi-Coder-1.5B-Chat-Q5_K_M.gguf`) |

## Arquitectura y entrenamiento
El modelo base 01-ai/Yi-Coder-1.5B-Chat es un transformer decoder-only de la familia LLaMA, orientado a generacion de codigo y conversacion. La model card de esta cuantizacion no aporta detalles sobre el corpus de entrenamiento del modelo original, el numero de tokens procesados, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco documenta innovaciones tecnicas del modelo base (atencion, decodificacion especulativa u otras).

Lo que si documenta la model card es el proceso de cuantizacion: conversion a Q5_K_M mediante la herramienta `run-any-model`, con pesos resultantes de 0,99 GB, ratio de compresion de 2,91x respecto a FP16 y una estimacion de retencion de calidad del 97,5 %. El autor indica aceleracion Metal en Apple Silicon y CUDA en GPUs NVIDIA, con soporte de instrucciones AVX2/AVX-512 en CPU. Estas cifras de calidad y rendimiento proceden de la auditoria del propio publicador y no se han contrastado con evaluaciones independientes.

## Capacidades
- Generacion de texto y conversacion multi-turno en formato chat, con tokens de parada `<|im_end|>` y `<|endoftext|>`.
- Generacion y asistencia en codigo, heredada del modelo base Yi-Coder-1.5B-Chat.
- Ejecucion local en CPU, GPU y Apple Silicon gracias al formato GGUF y a la cuantizacion Q5_K_M.
- Integracion con herramientas de inferencia locales: llama.cpp, Ollama, LM Studio, Jan y text-generation-webui.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible en la informacion proporcionada.

## Casos de uso
- Asistente de codigo en el editor: el modelo puede autocompletar funciones y explicar fragmentos de codigo en local, sin enviar codigo propietario a servicios externos; su tamano de 0,99 GB permite mantenerlo cargado en segundo plano en un portatil convencional.
- Prototipado rapido en equipos sin GPU: con 3,78 GB de RAM libre y soporte AVX2/AVX-512, se puede desplegar en un PC Windows o Linux de oficina para experimentar con generacion de codigo antes de invertir en infraestructura.
- Chat de soporte tecnico para desarrolladores: con una ventana de 4.096 tokens en CPU u 8.192 en GPU, admite conversaciones multi-turno sobre APIs y errores de compilacion en entornos con recursos limitados.
- Educacion y aprendizaje de programacion: al ejecutarse integramente en local, es adecuado para aulas o entornos con restricciones de conectividad o de privacidad, explicando conceptos y revisando ejercicios.
- Automatizacion de tareas de texto en scripts: mediante llama.cpp u Ollama se puede invocar desde pipelines ligeros para resumir logs, generar mensajes de commit o redactar documentacion tecnica breve.
- Evaluacion comparativa de cuantizaciones: sirve como referencia para medir la perdida de calidad de Q5_K_M frente a FP16 en tareas de codigo, usando la matriz de auditoria del autor como punto de partida reproducible.
- Despliegue en Apple Silicon: con 1,78 GB de memoria unificada y aceleracion Metal, encaja en flujos de trabajo de desarrollo en MacBook para asistencia de codigo sin conexion.

## Benchmarks y rendimiento
La model card incluye una matriz de auditoria del propio publicador centrada en metricas de memoria y precision de cuantizacion, no en benchmarks de calidad de tareas (MMLU, HumanEval, GSM8K). Se reproduce a continuacion tal cual, sin verificacion independiente:

| Metrica | Baseline (FP16) | Cuantizado (Q5_K_M) | Cambio |
|---|---|---|---|
| Precision en bits | 16,0 bits/param | 5,5 bits/param | -65,6 % |
| Tamano de pesos | 2,89 GB | 0,99 GB | -65,6 % |
| Buffer KV cache | 768,0 MB (FP16) | 768,0 MB (FP16) | Optimizado |
| RAM residente total | 3,68 GB | 1,78 GB | -51,6 % |
| Calidad estimada | 100,0 % baseline | 97,5 % retenida | -2,5 % |
| Aceleracion de capas | 0 % (riesgo de fallo) | 24/24 capas | Optimo |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

| Nivel de dispositivo | RAM / VRAM requerida | Contexto optimo | Estado de compatibilidad |
|---|---|---|---|
| Apple Silicon (M1/M2/M3/M4/M5) | 1,78 GB memoria unificada | 8.192 tokens | Metal acelerado |
| GPU NVIDIA (RTX 30/40/50) | 2,49 GB VRAM dedicada | 8.192 tokens | CUDA acelerado |
| PC Windows / Linux (CPU) | 3,78 GB RAM libre | 4.096 tokens | AVX2 / AVX-512 |

- VRAM estimada para inferencia: 2,49 GB en GPU NVIDIA segun el autor; 1,78 GB de memoria unificada en Apple Silicon.
- GPU recomendadas: cualquier NVIDIA RTX de las series 30, 40 o 50 con al menos 2,49 GB de VRAM dedicada; cabe en GTX 1650, RTX 3050, RTX 4060 y superiores.
- Cabe en GPU de consumo: si, con margen amplio; el peso del modelo es de 0,99 GB y el total residente estimado es de 1,78 GB.
- Opciones de despliegue: llama.cpp (`llama-cli -m ... -c 4096 -ngl 99 -cnv`), Ollama (mediante Modelfile), LM Studio, Jan, text-generation-webui y la CLI `run-any-model`.
- Latencia y throughput: no disponible en la informacion proporcionada; la model card no incluye tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ONIX-Yi-Coder-1.5B-Chat-GGUF (Q5_K_M) | 1,48 B | 8.192 (GPU) / 4.096 (CPU) | GGUF | Apache 2.0 | Cuantizacion Q5_K_M de 0,99 GB |
| 01-ai/Yi-Coder-1.5B-Chat (original) | 1,48 B | no disponible en esta ficha | safetensors (FP16) | Apache 2.0 | Modelo base sin cuantizar, 2,89 GB |
| Qwen2.5-Coder-1.5B-Instruct | 1,5 B (aprox.) | 32.768 (segun documentacion del modelo) | safetensors, GGUF | Apache 2.0 | Alternativa de tamano similar orientada a codigo |
| DeepSeek-Coder-1.3B-Instruct | 1,3 B | 16.384 (segun documentacion del modelo) | safetensors, GGUF | Licencia propia de DeepSeek | Alternativa de codigo de tamano comparable |

Los datos de los modelos alternativos provienen de su documentacion publica y no se han verificado en el contexto de esta ficha; se incluyen solo como referencia de categoria. No se dispone de comparativas de rendimiento medidas entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados en la model card; al heredar el modelo base, puede reproducir sesgos presentes en sus datos de entrenamiento, no especificados.
- Riesgo de alucinacion: con 1,48 B de parametros, la fiabilidad en razonamiento complejo y en codigo de gran extension es limitada; la cuantizacion Q5_K_M anade una perdida estimada del 2,5 % de calidad segun el autor, no verificada de forma independiente.
- Limitaciones de contexto: 8.192 tokens en GPU y 4.096 en CPU, insuficiente para repositorios grandes o documentos extensos; el buffer KV cache se mantiene en FP16 y consume 768 MB adicionales.
- Idiomas: no se especifican los idiomas soportados; el modelo base esta orientado principalmente al ingles, por lo que el rendimiento en castellano no esta garantizado.
- Licencia: Apache 2.0 permite uso comercial, pero la model card incluye un descargo de responsabilidad absoluto que traslada al usuario toda la responsabilidad sobre la validacion de las salidas.
- Procedencia y mantenimiento: publicacion con 0 descargas y 0 likes en el momento de la consulta, de un autor individual; no hay garantia de mantenimiento, soporte ni actualizaciones.
- Ausencia de evaluacion independiente: las cifras de retencion de calidad y de memoria proceden de la auditoria del propio publicador y no se han contrastado con terceros.
- Produccion: no se recomienda su uso en entornos criticos sin evaluacion previa propia, dado el reducido tamano del modelo y la falta de benchmarks de tareas publicados.

## Enlaces
- Hugging Face: https://huggingface.co/pranil00/ONIX-Yi-Coder-1.5B-Chat-GGUF
- Modelo base: https://huggingface.co/01-ai/Yi-Coder-1.5B-Chat
- Organizacion ONIX: https://huggingface.co/ONIX
- Repositorio de la herramienta de cuantizacion: https://github.com/PranilShah-08/run-any-model

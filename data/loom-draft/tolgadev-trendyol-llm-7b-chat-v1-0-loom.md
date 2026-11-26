# loom-draft/tolgadev-Trendyol-LLM-7b-chat-v1.0-loom

## Resumen

Este repositorio no contiene un modelo de lenguaje entrenado, sino un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado por la herramienta `loom-next` a partir del checkpoint GGUF sin modificar `tolgadev/Trendyol-LLM-7b-chat-v1.0-GGUF`, en su variante `trendyol-llm-7b-chat-v1.0.Q4_K_M.gguf`. El autor del paquete es `loom-draft` y el modelo subyacente es un fine-tune de 7B parámetros desarrollado por tolgadev, orientado a conversación. La relevancia del artefacto es de infraestructura: permite servir el modelo sobre GPUs AMD concretas mediante el runtime `hrx-loom` 0.2.0 con una API compatible con OpenAI.

El paquete está dirigido específicamente a dos aceleradores: la APU AMD Ryzen AI Max+ 395 «Strix Halo» (arquitectura gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB de VRAM). Incluye comandos de arranque listos para `loom-fetch` y `loom-serve`, además de una batería de puertas de corrección (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `sampling`, `logits`, entre otras) que, en el momento de publicación de la tarjeta, aparecen como «not yet re-measured» para ambas plataformas.

La información disponible sobre el modelo base es escasa: la model card no detalla arquitectura interna, composición del dataset de entrenamiento ni resultados de benchmarks. Los datos verificables se limitan a la licencia MIT, el contexto de 32.768 tokens por petición, un máximo de 4.096 tokens de salida y 4 peticiones concurrentes según la configuración predefinida del paquete.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de 7B; arquitectura interna no documentada en la informacion proporcionada) |
| Parametros totales | 7B (según el nombre del checkpoint base) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens por petición |
| Tipos de cuantizacion | Q4_K_M (GGUF) en el paquete; no se documentan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (checkpoint base) empaquetado como programas `.loom` y `weights.loom`; incluye `tokenizer.json`, `llm_config.json` y `model.json` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base (tipo de transformer, número de capas, atención, cabezas, etc.) ni sobre el proceso de entrenamiento: número de tokens, composición del dataset, uso de RLHF o DPO, o cualquier innovación técnica del fine-tune de tolgadev. La model card del paquete Loom se centra exclusivamente en el artefacto de despliegue y no reproduce detalles del modelo original.

Lo que sí documenta la tarjeta es la capa de ejecución: `loom-next` genera programas `.loom` a partir del GGUF y de un fichero `llm_config.json`, sin intervención de un LLM en el bucle de generación. El paquete fija el pool de memoria por adelantado (`--pool_backing=fixed`), precarga los pesos en el host (`--parameter_mode=preload`) y usa espera activa para las finalizaciones de GPU (`completion_spin_ns=4294967295`). No se indica soporte de decodificación especulativa, tool calling ni modo de razonamiento: la tabla de características los marca como «not applicable».

## Capacidades

- Generación de texto conversacional multi-turno mediante una API estilo OpenAI (`/v1/chat/completions`).
- Ventana de contexto de 32.768 tokens por petición, adecuada para documentos largos en una sola llamada.
- Hasta 4.096 tokens de salida por respuesta (límite del preset `max_tokens`).
- Concurrencia de 4 peticiones simultáneas según la configuración del paquete.
- Sin soporte de tool calling / function calling (marcado como «not applicable»).
- Sin modo de razonamiento o «thinking» (marcado como «not applicable»).
- Sin entrada de imagen ni de audio (marcado como «not applicable»).
- Sin decodificación especulativa (marcado como «not applicable»).
- Comportamiento de muestreo (temperature, top_k, seed): «not determined» en la tarjeta.
- Capacidades multilingües: no disponible.

## Casos de uso

- Despliegue en hardware AMD Strix Halo: el paquete permite servir el modelo en la APU Ryzen AI Max+ 395 con un solo comando `loom-fetch` seguido de `loom-serve`, sin necesidad de compilar kernels a medida ni de convertir el GGUF.
- Despliegue en Radeon AI PRO R9700: para estaciones de trabajo con 32 GB de VRAM, el paquete ofrece una ruta de servicio con API compatible con OpenAI sobre gfx1201.
- Chat conversacional de propósito general: con 32.768 tokens de contexto y hasta 4.096 tokens de salida, puede gestionar conversaciones multi-turno con historial largo en una única petición.
- Evaluación comparativa frente a llama.cpp: las puertas `golden`, `compare`, `sampling` y `logits` están diseñadas para verificar que la salida coincide token a token con la referencia de llama.cpp sobre el mismo GGUF, lo que lo hace útil como banco de pruebas de portabilidad.
- Pruebas de consistencia bajo concurrencia: la puerta `consistency` compara la salida de peticiones concurrentes con las mismas peticiones ejecutadas en solitario, útil para validar despliegues con 4 usuarios simultáneos.
- Integración en prototipos con cliente OpenAI: al exponer `/v1/chat/completions` en `127.0.0.1:8080`, cualquier SDK compatible con OpenAI puede apuntar al servidor sin cambios de código, lo que facilita pruebas de aplicaciones de chat sobre hardware AMD.
- Validación de kernels generados: la puerta `kernel_tests` ejecuta pruebas unitarias de los kernels generados contra implementaciones de referencia, relevante para equipos que trabajan en el compilador o el runtime Loom.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La tarjeta indica explícitamente que los resultados de rendimiento frente a llama.cpp para este paquete «are not yet re-measured» tanto en Strix Halo (gfx1151) como en Radeon AI PRO R9700 (gfx1201, 32 GB). Tampoco se incluyen métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación del modelo base.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. La GPU Radeon AI PRO R9700 se documenta con 32 GB, y el modelo base es de 7B en cuantización Q4_K_M, pero la tarjeta no publica el consumo real del paquete.
- GPUs soportadas: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se mencionan otras GPUs.
- GPU de consumo: no se documenta compatibilidad con GPUs de consumo (RTX 4090, RX 7900 XTX, etc.).
- Despliegue: runtime `hrx-loom[hf]==0.2.0` instalado con `pipx`, más las herramientas `loom-fetch` y `loom-serve`. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: no disponibles; las filas de rendimiento no se han vuelto a medir.

## Comparativa con modelos similares

No disponible. La información proporcionada no identifica modelos comparables de la misma categoría ni ofrece datos de rendimiento que permitan una comparación fundamentada con alternativas de 7B o con otros empaquetados para AMD Loom. El único punto de referencia técnico mencionado es llama.cpp, usado como referencia de corrección (tokens greedy y log-probs top-5) y de rendimiento, pero sin cifras publicadas para este paquete.

## Limitaciones y advertencias

- El repositorio es un artefacto de despliegue, no un modelo original: cualquier evaluación de calidad debe hacerse sobre el checkpoint base `tolgadev/Trendyol-LLM-7b-chat-v1.0-GGUF`, cuyas características no se detallan aquí.
- Las puertas de corrección (`kernel_tests`, `golden`, `compare`, `consistency`, `agent`, `sampling`, `logits`, `decision`, entre otras) figuran como «not yet re-measured» en ambas plataformas: no hay evidencia registrada de corrección para este paquete.
- Tampoco hay mediciones de rendimiento publicadas frente a llama.cpp para Strix Halo ni para R9700.
- El comportamiento de muestreo está marcado como «not determined», lo que impide garantizar la reproducibilidad de la generación con temperature, top_k y seed.
- Sin soporte de tool calling, razonamiento, entrada de imagen o audio, y sin decodificación especulativa: no es adecuado para flujos agénticos ni multimodales.
- El límite de 4 peticiones concurrentes y de 4.096 tokens de salida puede ser insuficiente para cargas de producción con muchos usuarios o respuestas muy largas.
- Compatibilidad restringida a dos aceleradores AMD concretos (gfx1151 y gfx1201); no se documenta funcionamiento en otras GPUs.
- Idiomas soportados no disponibles: no se puede confirmar el comportamiento en castellano ni en otros idiomas distintos del que use el fine-tune original.
- Licencia MIT declarada en la tarjeta, pero conviene verificar las condiciones del checkpoint base antes de un uso comercial en producción.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.

## Enlaces

- Repositorio del paquete en Hugging Face: https://huggingface.co/loom-draft/tolgadev-Trendyol-LLM-7b-chat-v1.0-loom
- Modelo base (GGUF): https://huggingface.co/tolgadev/Trendyol-LLM-7b-chat-v1.0-GGUF
- Runtime Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/

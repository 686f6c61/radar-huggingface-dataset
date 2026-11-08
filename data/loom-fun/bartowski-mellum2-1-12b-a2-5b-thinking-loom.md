# loom-fun/bartowski-Mellum2.1-12B-A2.5B-Thinking-loom

## Resumen

Loom-fun/bartowski-Mellum2.1-12B-A2.5B-Thinking-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) generado a partir del checkpoint GGUF sin modificar bartowski/Mellum2.1-12B-A2.5B-Thinking-GGUF, en concreto la cuantizacion Q4_K_M. No es un modelo nuevo ni un fine-tune: es una reempaquetadura del mismo GGUF para que pueda servirse con el runtime Loom (hrx-loom) sobre GPUs AMD, con soporte para el acelerador integrado de los Ryzen AI Max+ 395 "Strix Halo" (gfx1151). El paquete lo publica el usuario loom-fun y se genero con el flujo loom-skills sobre una maquina Strix Halo.

El modelo subyacente, Mellum2.1-12B-A2.5B-Thinking, es un transformer con arquitectura MoE (mezcla de expertos) de 12B parametros totales y unos 2,5B activos por token, con modo de razonamiento activado por defecto. El paquete Loom expone una API compatible con OpenAI (`/v1/chat/completions`), tool calling, contexto de 131.072 tokens por peticion y concurrencia de 4 peticiones simultaneas.

Su relevancia es practica: permite ejecutar un modelo MoE de 12B con cuantizacion Q4_K_M en hardware AMD de consumo (APU Strix Halo con memoria unificada) mediante un runtime alternativo a llama.cpp, con cifras de decodificacion y prefill medidas y publicadas en la model card. La licencia del paquete es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (modelo subyacente Mellum2.1-12B-A2.5B-Thinking); paquete de despliegue Loom sobre GGUF |
| Parametros totales | 12B (aprox. 13B segun la ficha de Hugging Face del GGUF base) |
| Parametros activos | 2,5B (MoE) |
| Longitud de contexto | 131.072 tokens por peticion |
| Tipos de cuantizacion | Q4_K_M (unica incluida en este paquete); el repo base ofrece otras cuantizaciones GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) empaquetado en programas `.loom` + `weights.loom` + `model.json` |

## Arquitectura y entrenamiento

El paquete no aporta informacion sobre el entrenamiento del modelo subyacente. Por los datos disponibles, Mellum2.1-12B-A2.5B-Thinking es un transformer con mezcla de expertos (MoE) de 12B parametros totales y 2,5B activos, con un modo de razonamiento ("thinking") activado por defecto que puede desactivarse mediante `chat_template_kwargs: {"enable_thinking": false}`. No se dispone de datos sobre numero de tokens de entrenamiento, composicion del dataset ni si se aplico RLHF o DPO.

La innovacion tecnica de este repositorio no esta en el modelo sino en el runtime: Loom compila los pesos GGUF a programas `.loom` especificos para la GPU de destino y expone un servidor compatible con OpenAI. La model card documenta pruebas de correccion frente a una referencia de llama.cpp (tokens greedy y top-5 log-probs) sobre el mismo GGUF, con resultados de coincidencia salvo empates cercanos. No soporta decodificacion especulativa ni razonamiento con esfuerzo configurable.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto y desactivable por peticion.
- Tool calling / function calling con formato OpenAI (`tools` y `tool_calls`).
- API compatible con OpenAI: endpoint `/v1/chat/completions`.
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Contexto largo: hasta 131.072 tokens por peticion.
- Concurrencia: 4 peticiones simultaneas.
- Limite de salida: 4.096 tokens por peticion (preset `max_tokens`).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Sin soporte de imagen, audio, razonamiento con esfuerzo configurable ni decodificacion especulativa.

## Casos de uso

- Asistente conversacional de contexto largo: con 131.072 tokens por peticion se pueden mantener conversaciones multi-turno con documentos extensos adjuntos sin truncar, util en atencion al cliente o soporte tecnico.
- Procesamiento de documentacion larga: resumen y extraccion de informacion de contratos, informes o bases de codigo de decenas de miles de tokens en una sola pasada.
- Agentes con tool calling: integracion en flujos que requieren llamadas a funciones (APIs, bases de datos) mediante el formato OpenAI `tools`/`tool_calls`; conviene validar el bucle multi-turno porque la puerta `agent` de correccion fallo en las pruebas publicadas.
- Razonamiento asistido en local: tareas de analisis y planificacion con el modo thinking activado, ejecutadas en una APU AMD Strix Halo sin GPU dedicada.
- Despliegue en hardware AMD de consumo: servir un MoE de 12B en un Ryzen AI Max+ 395 con memoria unificada, usando `loom-serve --device=amdgpu`.
- Evaluacion comparativa de runtimes: banco de pruebas para medir Loom frente a llama.cpp sobre el mismo GGUF y el mismo hardware (la model card publica cifras de prefill y decode).
- Prototipado de APIs compatibles con OpenAI: sustitucion local de un endpoint OpenAI en entornos de desarrollo o pruebas de integracion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card si publica metricas de rendimiento del runtime sobre AMD Ryzen AI Max+ 395 (Radeon 8060S, gfx1151, 216 GB/s, 59 TFLOP/s):

| Metrica | llama.cpp (DevLab) | Loom (DevLab) | Techo roofline |
|---|---|---|---|
| Decode tok/s, prompt corto | 71,6 | 88,5 | 116,7 |
| Decode tok/s, contexto 2k | 67,5 | 83,7 | 112,3 |
| Decode tok/s, contexto 32k | no medido | 68,1 | 91,8 |
| Prefill tok/s, documento 1k | 1.780,0 | 3.808,7 | 14.043,4 |
| Prefill tok/s, documento 2k | 1.734,6 | 3.664,1 | 13.316,4 |
| Prefill tok/s, documento 8k | no medido | 3.599,1 | 12.335,5 |
| Prefill tok/s, documento 16k | no medido | 3.054,4 | 11.255,9 |
| Prefill tok/s, documento 32k | no medido | 2.420,8 | 9.579,2 |
| 4 streams, decode agregado tok/s | 174,2 | 207,6 | 205,3 |

Mediciones del 2026-11-07 en AMD Ryzen AI Max+ 395 con Radeon 8060S, Ubuntu 24.04, hrx-loom 0.1.0. llama.cpp: build `llamacpp-rocm/b1370`, argumentos `-ngl 99 -cram 0 --spec-type ngram-simple -c 35024 -kvu -np 4`. En Loom la decodificacion especulativa esta desactivada. La temporizacion de Loom es del lado del cliente; la de llama.cpp, del lado del servidor.

## Requisitos de hardware

- VRAM estimada: el ejemplo de arranque de la model card reserva `--memory_bytes=26000000000` (26 GB) para el modelo Q4_K_M en memoria unificada.
- GPU recomendadas: AMD Ryzen AI Max+ 395 con Radeon 8060S ("Strix Halo", gfx1151); es el hardware de referencia de las mediciones.
- GPU de consumo: si, en APUs AMD Strix Halo con memoria unificada; no se documenta soporte para GPUs NVIDIA ni para GPUs AMD discretas en esta model card.
- Despliegue: `pip install "hrx-loom[hf]"`, `loom-fetch` para materializar el paquete y `loom-serve --model=... --device=amdgpu`. Servidor en `127.0.0.1:8080` con API OpenAI.
- Latencia y throughput: 88,5 tok/s de decodificacion con prompt corto y 3.808,7 tok/s de prefill con documento de 1k en el runner DevLab; 207,6 tok/s agregados con 4 streams.
- No soporta decodificacion especulativa en este paquete.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato / runtime |
|---|---|---|---|---|---|
| Mellum2.1-12B-A2.5B-Thinking (Loom, este repo) | 12B | 2,5B | 131.072 | Apache 2.0 | GGUF Q4_K_M empaquetado en Loom (hrx-loom) |
| bartowski/Mellum2.1-12B-A2.5B-Thinking-GGUF | 12B | 2,5B | no disponible | Apache 2.0 (heredada) | GGUF para llama.cpp |
| bartowski/Mellum2.1-12B-A2.5B-Thinking-MTP-GGUF | 13B | no disponible | no disponible | no disponible | GGUF con MTP |

No se dispone de datos de benchmarks de calidad que permitan comparar el rendimiento del modelo frente a alternativas de la misma categoria.

## Limitaciones y advertencias

- La puerta de correccion `agent` (bucle multi-turno de tool calling) fallo en las pruebas publicadas, tanto con thinking activado como desactivado; validar antes de usar en produccion con agentes.
- La puerta `needle` (needle-in-the-haystack hasta la mitad del contexto) fallo frente a la referencia de llama.cpp; no hay evidencia de `needle_full` a contexto completo.
- Sin soporte de decodificacion especulativa ni de razonamiento con esfuerzo configurable.
- Limite de 4.096 tokens de salida por peticion y 4 peticiones concurrentes.
- Solo cuantizacion Q4_K_M incluida en este paquete.
- Sin soporte de imagen ni audio.
- Idiomas soportados no documentados; riesgo de comportamiento irregular fuera de los idiomas del entrenamiento original.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan evaluaciones especificas.
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero el paquete depende del runtime hrx-loom y de hardware AMD Strix Halo para el rendimiento declarado.
- Las cifras de rendimiento se midieron en un unico dispositivo y en una fecha concreta; no son extrapolables a otro hardware.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-fun/bartowski-Mellum2.1-12B-A2.5B-Thinking-loom
- Modelo base GGUF: https://huggingface.co/bartowski/Mellum2.1-12B-A2.5B-Thinking-GGUF
- Variante MTP GGUF: https://huggingface.co/bartowski/Mellum2.1-12B-A2.5B-Thinking-MTP-GGUF
- Runtime Loom (hrx-system): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
- Ejecucion de referencia DevLab Dispatch: https://github.com/loom-fun/loom-skills/actions/runs/42424645228

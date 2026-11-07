# loom-fun/bartowski-Spark-X2.6-4B-loom

## Resumen

`loom-fun/bartowski-Spark-X2.6-4B-loom` es un paquete de despliegue en formato `.loom` para el checkpoint GGUF cuantizado `Spark-X2.6-4B-Q4_K_M.gguf`, publicado por el usuario loom-fun. No se trata de un modelo nuevo ni de un fine-tune: es un artefacto de empaquetado que contiene programas `.loom` y una tarjeta `model.json` que permiten servir el GGUF original (de bartowski/Spark-X2.6-4B-GGUF) con el motor Loom sobre GPUs AMD, en concreto sobre el sistema "Strix Halo" (Ryzen AI Max+ 395 con Radeon 8060S, gfx1151).

El modelo subyacente, Spark-X2.6-4B, pertenece a la serie Spark-X2.6 de XHToken, orientada a agentes on-device para tareas del mundo real; la familia incluye variantes de 4B y 1,7B parametros. El paquete anade al GGUF un servidor compatible con la API `/v1/chat/completions` de OpenAI, decodificacion especulativa por n-gram lookup (profundidad 2) activada por defecto, soporte de tool calling y modo de razonamiento configurable.

Su relevancia es practica: demuestra que un GGUF de 4B puede servirse en hardware AMD integrado con un 18-24 % mas de velocidad de decodificacion y un 60 % mas de prefill que llama.cpp, manteniendo equivalencia funcional verificada contra la referencia de llama.cpp. La licencia del paquete es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Spark-X2.6-4B; el paquete es un runtime Loom sobre GGUF) |
| Parametros totales | 4B (segun nombre del checkpoint; desglose no disponible) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens por peticion (segun la model card del paquete) |
| Tipos de cuantizacion | Q4_K_M (checkpoint empaquetado); otras cuantizaciones del base no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) empaquetado como `.loom` + `model.json` |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo Spark-X2.6-4B (tipo de transformer, atencion, datos de entrenamiento, tokens vistos, RLHF/DPO). Lo que si se documenta es la capa de ejecucion que anade este paquete: el motor Loom, que carga el GGUF sin modificarlo y genera kernels especificos para el dispositivo AMD objetivo (gfx1151). El paquete incluye un `model.json` con los ficheros fuente fijados por hash sha256, verificado por `loom-fetch`.

La innovacion tecnica destacable es la decodificacion especulativa por *n-gram prompt lookup* con profundidad 2, activada por defecto, que acelera la decodificacion reutilizando secuencias del propio prompt como borradores. La model card reporta una tasa de aceptacion de tokens borrador del 14 % en la puerta `spec` y del 3-4 % en las sesiones de decodificacion medidas. El servidor expone plantilla de chat con modo thinking activado por defecto y parametro `reasoning_effort` (low/high).

## Capacidades

- Generacion de texto y razonamiento con modo thinking activado por defecto, desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Control de esfuerzo de razonamiento con `reasoning_effort` en dos niveles: `low` y `high` (por defecto `high`).
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls`, con bucle multi-turno verificado en la puerta `agent`.
- Decodificacion especulativa integrada (n-gram prompt lookup, profundidad 2) sin cambiar la salida respecto a modo no especulativo (verificado por la puerta `spec`).
- Servidor HTTP compatible con `/v1/chat/completions` de OpenAI en `127.0.0.1:8080`.
- Concurrencia de 4 peticiones simultaneas con salida identica a ejecuciones aisladas (puerta `consistency`).
- Muestreo configurable: `temperature`, `top_p`, `top_k`, `seed`.
- Limite de salida de 4.096 tokens por peticion (preset `max_tokens`).
- Sin soporte de imagen ni de audio (entrada y salida).

## Casos de uso

- Agentes on-device en estaciones de trabajo AMD: el paquete esta pensado para ejecutarse en un Ryzen AI Max+ 395 con memoria unificada, sirviendo un agente local con tool calling y contexto largo sin depender de la nube.
- Asistentes con documentos largos: con 262.144 tokens de contexto por peticion y prefill de 2.283 tok/s en documentos de 1k tokens, es adecuado para resumir o consultar expedientes extensos en local.
- Automatizacion de soporte tecnico multi-turno: el bucle de tool calling verificado (`agent` y `agent_think_off`) permite encadenar consultas a APIs internas manteniendo el historial.
- Generacion de codigo asistida en IDE: la API compatible con OpenAI permite sustituir un endpoint remoto por el servidor local en herramientas que ya hablan el protocolo, con 4 peticiones concurrentes.
- Prototipado de pipelines RAG: el modo thinking y el control de `reasoning_effort` permiten ajustar coste/latencia segun la etapa (recuperacion frente a sintesis final).
- Evaluacion de hardware AMD para inferencia: las tablas de rendimiento y las puertas de correccion permiten comparar Loom frente a llama.cpp sobre el mismo GGUF en un equipo concreto.
- Despliegue en entornos con requisitos de soberania de datos: al ejecutarse integramente en local sobre GPU AMD, evita enviar prompts a servicios externos.

## Benchmarks y rendimiento

Rendimiento medido el 2026-11-07 en AMD Ryzen AI Max+ 395 con Radeon 8060S, Ubuntu 24.04, hrx-loom 0.1.0, sobre el mismo GGUF en ambos motores:

| Metrica | llama.cpp | Loom | Margen | Roofline | Loom % del roofline |
|---|---|---|---|---|---|
| Decode tok/s, prompt corto | 55,8 | 65,7 | +18 % | 87,5 | 75 % |
| Decode tok/s, contexto 2k | 49,2 | 61,0 | +24 % | 85,4 | 71 % |
| Decode tok/s, contexto 32k | no medido | 41,4 | no disponible | 60,9 | 68 % |
| Prefill tok/s, documento 1k | 1423,0 | 2283,2 | +60 % | 7518,2 | 30 % |
| Prefill tok/s, documento 2k | 1427,6 | 2312,4 | +62 % | 7443,3 | 31 % |
| Prefill tok/s, documento 8k | no medido | 2198,9 | no disponible | 7049,8 | 31 % |
| Prefill tok/s, documento 16k | no medido | 2008,4 | no disponible | 6585,7 | 30 % |
| Prefill tok/s, documento 32k | no medido | 1573,1 | no disponible | 5819,4 | 27 % |
| 4 streams, decode agregado tok/s | 153,2 | 164,0 | +7 % | 377,4 | 43 % |
| Tokens borrador aceptados (spec) | no aplica | 14 % | no disponible | no aplica | no aplica |

No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Las puertas de correccion reportadas son: `kernel_tests` 57/57, `golden`, `compare`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling` y `needle` en estado pass; `needle_full` sin evidencia; `vision` y `decision` no aplicables.

## Requisitos de hardware

- VRAM/memoria: la orden de arranque documentada reserva `--memory_bytes=55000000000` (55 GB), coherente con la memoria unificada del Ryzen AI Max+ 395; no se documenta un minimo menor.
- GPU objetivo: AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151, "Strix Halo"). No se documenta soporte para otras GPU.
- GPU de consumo: no disponible; el paquete esta orientado a AMD integrada de gama alta, no a tarjetas discretas NVIDIA.
- Despliegue: `pip install "hrx-loom[hf]"`, `loom-fetch` para materializar el modelo y `loom-serve --device=amdgpu`. El servidor escucha en `127.0.0.1:8080`.
- Latencia y throughput: decode 65,7 tok/s en prompt corto y 41,4 tok/s a 32k; prefill 2.283 tok/s a 1k y 1.573 tok/s a 32k; 164 tok/s agregados con 4 streams.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Motor / formato | Licencia | Notas |
|---|---|---|---|---|---|
| Spark-X2.6-4B (via Loom, este paquete) | 4B | 262.144 | Loom sobre GGUF Q4_K_M, AMD gfx1151 | Apache 2.0 | Spec decoding n-gram activado; +18-24 % decode y +60 % prefill frente a llama.cpp |
| Spark-X2.6-4B (via llama.cpp) | 4B | 35.024 en la configuracion medida (`-c 35024`) | llama.cpp build b1370, ROCm | Apache 2.0 (del base) | Referencia de correccion; sin datos a 32k |
| Spark-X2.6-1.7B | 1,7B | no disponible | no disponible | no disponible | Variante menor de la misma familia, orientada a agentes on-device |

No se dispone de datos de benchmarks de calidad para comparar con otras familias de 4B (Qwen, Llama, Phi); no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- El paquete no es un modelo nuevo: cualquier limitacion del Spark-X2.6-4B subyacente se hereda, y su model card original no esta incluida en la informacion disponible.
- Sin soporte de vision ni de audio; no apto para tareas multimodales.
- `needle_full` (needle-in-a-haystack a contexto completo) no tiene evidencia registrada; el comportamiento a 262.144 tokens no esta verificado mas alla de la mitad del contexto.
- Rendimiento medido unicamente en un dispositivo concreto (Ryzen AI Max+ 395, gfx1151) y una version concreta de hrx-loom 0.1.0; no extrapolable a otro hardware.
- Las cifras de Loom usan temporizacion del lado del cliente y las de llama.cpp del lado del servidor, lo que puede introducir diferencias metodologicas.
- La aceptacion del borrador especulativo es baja (3-14 %), por lo que la ganancia real de la decodificacion especulativa es limitada.
- Concurrencia maxima de 4 peticiones y salida maxima de 4.096 tokens por peticion; insuficiente para cargas de alta concurrencia.
- Riesgo de alusiones y sesgos del modelo base: no documentado en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial del paquete, pero conviene verificar la licencia del checkpoint base y de los datos de entrenamiento originales, no disponibles aqui.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion por terceros.

## Enlaces

- Hugging Face del paquete: https://huggingface.co/loom-fun/bartowski-Spark-X2.6-4B-loom
- GGUF base: https://huggingface.co/bartowski/Spark-X2.6-4B-GGUF
- Repositorio del modelo Spark-X2.6: https://github.com/XHToken/Spark-X2.6
- Motor Loom (hrx-system): https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
- Ejecucion de referencia (DevLab Dispatch run 42391288313): https://github.com/loom-fun/loom-skills/actions/runs/42391288313

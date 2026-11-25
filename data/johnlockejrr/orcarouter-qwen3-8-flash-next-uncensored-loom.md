# johnlockejrr/orcarouter-Qwen3.8-Flash-Next-Uncensored-loom

## Resumen
`orcarouter-Qwen3.8-Flash-Next-Uncensored-loom` no es un modelo nuevo, sino un paquete de despliegue en formato Loom (programas `.loom` más una tarjeta `model.json`) para el checkpoint GGUF `johnlockejrr/orcarouter-Qwen3.8-Flash-Next-Uncensored-GGUF`, en su cuantización `UD-Q4_K_XL` dividida en cinco fragmentos. Lo publica el usuario `johnlockejrr` y está pensado para ejecutarse sobre hardware AMD, en concreto una APU Ryzen AI Max+ 395 "Strix Halo" con gráficos Radeon 8060S, usando el runtime `hrx-loom` sobre IREE/ROCm.

El interés del paquete es de rendimiento e integración: incluye decodificación especulativa con MTP (multi-token prediction) a profundidad 3, soporte de entrada de imágenes mediante proyector `mmproj` en F16, API compatible con OpenAI y una ventana de contexto declarada de 262.144 tokens. La model card reporta comparativas frente a llama.cpp ROCm en la misma máquina, con mejoras de hasta +173 % en prefill de documentos de 8k tokens.

La relevancia es acotada pero clara: demuestra que un modelo grande cuantizado a Q4_K_XL puede servirse con aceleración especulativa en una APU de memoria unificada, sin GPU dedicada, y con una API estándar. Al tratarse de una variante "uncensored" y de un paquete generado automáticamente, conviene tratarlo como artefacto experimental más que como base de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete no describe la arquitectura interna; hereda la del checkpoint base Qwen3.8-Flash-Next) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (según la tarjeta del paquete) |
| Tipos de cuantizacion | UD-Q4_K_XL (GGUF, 5 fragmentos); proyector de visión en F16; drafter MTP en Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (empaquetado como programa Loom `.loom` + `model.json`) |

## Arquitectura y entrenamiento
El paquete no documenta la arquitectura del modelo subyacente: se limita a referenciar el GGUF original `orcarouter-Qwen3.8-Flash-Next-Uncensored-GGUF` sin modificarlo. Por el nombre y por las capacidades declaradas (razonamiento con niveles de esfuerzo, tool calling, entrada de imágenes y decodificación especulativa MTP), se trata presumiblemente de un transformer con atención completa y cabezas de predicción multi-token, pero no hay confirmación en la información disponible. Tampoco se detallan tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO; el sufijo "Uncensored" sugiere un ajuste fino orientado a eliminar rechazos, sin más datos.

La innovación técnica relevante está en el runtime, no en los pesos: el paquete Loom incluye decodificación especulativa con un drafter MTP (`mtp-Qwen3.8-Flash-Next-Q8_0.gguf`, de `unsloth/Qwen3.8-Flash-Next-GGUF`) a profundidad 3, activa por defecto, y un pool de memoria de respaldo fijo (`--pool_backing=fixed`). La tarjeta recomienda `completion_spin_ns=4294967295` para espera activa de finalizaciones de GPU, y advierte de que en hosts con `memlock` de 8 MiB hay que lanzar el servidor vía `systemd-run` con `SystemCallFilter=~io_uring_setup` o elevar `ulimit -l`.

## Capacidades
- Generación de texto con razonamiento explícito ("thinking"), activado por defecto y desactivable con `chat_template_kwargs: {"enable_thinking": false}`.
- Control de esfuerzo de razonamiento mediante `reasoning_effort` con cuatro niveles: `low`, `medium`, `high` y `xhigh` (por defecto `xhigh`).
- Tool calling y function calling con formato compatible con OpenAI (`tools` y `tool_calls`).
- Entrada de imágenes mediante partes `image_url` al estilo OpenAI, con proyector `mmproj-Qwen3.8-Flash-Next-Uncensored-F16.gguf`.
- Decodificación especulativa MTP integrada, a profundidad 3, activa por defecto.
- API HTTP compatible con OpenAI en `/v1/chat/completions`.
- Sin soporte de audio ni de salida de audio (marcado como no aplicable).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso
- Servicio local de chat con razonamiento en una APU Strix Halo: el paquete permite levantar un endpoint compatible con OpenAI en `127.0.0.1:8080` sin GPU dedicada, útil para prototipos y uso personal con contexto largo de hasta 262.144 tokens.
- Procesamiento de documentos extensos: con un prefill medido de 1.454,5 tok/s en documentos de 8k tokens, resulta adecuado para resumir o extraer información de contratos, informes o expedientes de varias decenas de miles de tokens en una sola pasada.
- Análisis de imágenes con texto asociado: la pipeline `image-text-to-text` y el proyector F16 permiten pasar capturas, diagramas o fotografías junto a la consulta, por ejemplo para describir interfaces o extraer datos de tablas escaneadas.
- Automatización con herramientas: el soporte de `tools` y `tool_calls` permite integrar el modelo en flujos que consultan APIs, bases de datos o sistemas de ficheros, con el bucle de agente gestionado por el cliente.
- Atención al cliente multi-turno: la ventana de 262.144 tokens y el modo de razonamiento configurable permiten mantener historiales largos y ajustar el coste por consulta bajando `reasoning_effort` a `low` en consultas simples.
- Evaluación comparativa de runtimes: el paquete incluye mediciones frente a llama.cpp ROCm en la misma máquina, por lo que sirve como banco de pruebas reproducible para comparar Loom/IREE con llama.cpp en hardware AMD integrado.
- Generación de código asistida en local: con tool calling y contexto amplio, puede usarse para autocompletar y revisar parches en un entorno de desarrollo sin conexión a servicios externos.

## Benchmarks y rendimiento
La model card incluye una comparativa de rendimiento del runtime (no del modelo en tareas de calidad) frente a llama.cpp ROCm `unsloth-llama.cpp/b12588`, con el mismo GGUF, la misma máquina y las mismas peticiones, sobre AMD Ryzen AI Max+ 395 con Radeon 8060S, Pop!_OS 24.04 y `hrx-loom 0.2.0`.

| Métrica | llama.cpp | Loom | Margen vs mejor llama.cpp |
|---|---|---|---|
| Decode tok/s, prompt corto | 29,4 | 40,4 | +37 % |
| Decode tok/s, contexto 2k | no medido | no medido | — |
| Decode tok/s, contexto 32k | no medido | no medido | — |
| Prefill tok/s, documento 1k | no medido | no medido | — |
| Prefill tok/s, documento 2k | no medido | no medido | — |
| Prefill tok/s, documento 8k | 532,5 | 1.454,5 | +173 % |
| Prefill tok/s, documento 16k | no medido | no medido | — |
| Prefill tok/s, documento 32k | no medido | no medido | — |
| 4 streams, decode agregado tok/s | 39,5 | 75,8 | +92 % |
| Decodificación especulativa, tokens aceptados | no aplica | no aplica | no aplica |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Las cifras anteriores son medianas de una única sesión y deben tomarse como orientativas.

## Requisitos de hardware
- VRAM o memoria unificada: no se indica cifra exacta; el checkpoint es un Q4_K_XL de cinco fragmentos, por lo que el requisito depende del tamaño total del modelo, que no está disponible. El paquete está generado y probado en una APU con memoria unificada.
- GPU recomendadas: AMD Radeon 8060S integrada en Ryzen AI Max+ 395 (plataforma de referencia). No hay datos para A100, H100 ni RTX 4090 en la información proporcionada.
- GPU de consumo: no hay confirmación de que quepa en GPUs de consumo con memoria dedicada; el caso validado es una APU de memoria unificada.
- Despliegue: `hrx-loom[hf]==0.2.0` con `loom-fetch` y `loom-serve`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en este paquete (llama.cpp aparece solo como referencia comparativa).
- Latencia y throughput: 40,4 tok/s de decode en prompt corto, 1.454,5 tok/s de prefill en documento de 8k y 75,8 tok/s agregados con 4 streams, medidos con espera activa de GPU y decodificación especulativa MTP a profundidad 3.
- Notas de despliegue: `--pool_backing=fixed` reserva el pool de memoria por adelantado; en hosts con `memlock` de 8 MiB hay que usar `systemd-run` con `SystemCallFilter=~io_uring_setup` o elevar `ulimit -l`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| orcarouter-Qwen3.8-Flash-Next-Uncensored-loom | no disponible | 262.144 | GGUF empaquetado en Loom | MIT | Paquete de despliegue para AMD Strix Halo con MTP y visión |
| orcarouter-Qwen3.8-Flash-Next-Uncensored-GGUF | no disponible | no disponible | GGUF | MIT | Checkpoint base sin empaquetar; requiere un runtime GGUF convencional |
| Qwen3.8-Flash-Next (variante estándar, `unsloth/Qwen3.8-Flash-Next-GGUF`) | no disponible | no disponible | GGUF | no disponible | Modelo original sin ajuste "uncensored"; su drafter MTP Q8_0 se reutiliza en este paquete |

No se dispone de datos de rendimiento de calidad para establecer una comparación por benchmarks con alternativas de la misma categoría.

## Limitaciones y advertencias
- El paquete no documenta arquitectura, número de parámetros, idiomas ni datos de entrenamiento del modelo subyacente; cualquier evaluación técnica queda condicionada a consultar el checkpoint base.
- La variante "Uncensored" implica presumiblemente un ajuste fino para reducir rechazos, con mayor riesgo de generar contenido inapropiado, sesgado o factualmente incorrecto; no se han publicado evaluaciones de sesgo ni de alucinación.
- El riesgo de alucinación es el habitual en modelos generativos y no está cuantificado; el modo de razonamiento activado por defecto puede aumentar la latencia y el consumo de tokens.
- El rendimiento medido corresponde a una única sesión y a una sola máquina (Ryzen AI Max+ 395, Pop!_OS 24.04); no hay mediciones para contextos de 2k, 32k ni documentos de 1k, 16k o 32k.
- El repo tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (25 de noviembre de 2026): es un artefacto recién generado, sin validación comunitaria.
- El tamaño del repositorio figura como 0.0 GB, lo que sugiere que los pesos no están alojados en este repo y se obtienen vía `loom-fetch` desde el checkpoint base.
- Dependencia de un runtime específico (`hrx-loom` 0.2.0) y de hardware AMD con ROCm/IREE; no hay soporte documentado para CUDA ni para otros motores de inferencia.
- La licencia MIT se aplica al paquete, pero conviene verificar la licencia del checkpoint base y del modelo original antes de un uso comercial.
- En hosts con `memlock` bajo es necesario ajustar el lanzamiento del servidor, lo que añade fricción operativa en producción.

## Enlaces
- Paquete en Hugging Face: https://huggingface.co/johnlockejrr/orcarouter-Qwen3.8-Flash-Next-Uncensored-loom
- Checkpoint base GGUF: https://huggingface.co/johnlockejrr/orcarouter-Qwen3.8-Flash-Next-Uncensored-GGUF
- Drafter MTP: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Runtime Loom (ROCm/hrx-system): https://github.com/ROCm/hrx-system
- Flujo de trabajo loom-skills: https://github.com/loom-fun/loom-skills
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/

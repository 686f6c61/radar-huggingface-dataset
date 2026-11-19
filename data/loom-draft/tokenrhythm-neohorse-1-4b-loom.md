# loom-draft/TokenRhythm-NeoHorse-1-4B-loom

## Resumen

TokenRhythm-NeoHorse-1-4B-loom es un paquete de despliegue en formato Loom para el checkpoint GGUF `NeoHorse-1-4B-Q4_K_M.gguf` del modelo base TokenRhythm/NeoHorse-1-4B-GGUF. Lo publica el usuario loom-draft dentro del ecosistema Loom, un entorno de ejecución de modelos sobre GPU AMD que distribuye programas compilados (`.loom`) junto con una tarjeta `model.json` y los pesos en GGUF. El paquete no modifica los pesos: empaqueta el checkpoint original para servirlo mediante `loom-serve` con una API compatible con OpenAI.

El objetivo del paquete es ejecutar el modelo de 4.000 millones de parámetros en cuantización Q4_K_M sobre dos aceleradores AMD concretos: el SoC AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y la GPU AMD Radeon AI PRO R9700 (gfx1201, 32 GB). Se generó con la herramienta `loom-next` (el generador solo, sin LLM en el bucle) y se distribuye bajo licencia Apache 2.0.

La relevancia es acotada pero específica: ofrece una vía de despliegue optimizada para hardware AMD con soporte de tool calling, modo de razonamiento activado por defecto, ventana de contexto de 262.144 tokens por petición y hasta 4 peticiones concurrentes. No obstante, la model card indica que las mediciones de rendimiento y las puertas de corrección todavía no se han vuelto a medir para este paquete, y el modelo no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete hereda el checkpoint GGUF NeoHorse-1-4B; la model card no detalla la arquitectura interna) |
| Parámetros totales | 4B (según el nombre del modelo base, NeoHorse-1-4B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantización | Q4_K_M (checkpoint `NeoHorse-1-4B-Q4_K_M.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF empaquetado en programas Loom (`.loom`, `weights.loom`) + `tokenizer.json` y `llm_config.json` |

## Arquitectura y entrenamiento

La model card del paquete no describe la arquitectura interna del modelo (transformer, MoE, SSM o híbrida) ni los datos de entrenamiento del checkpoint original. Lo que sí se detalla es el proceso de empaquetado: `loom-next` genera programas Loom (`.loom`) y un fichero `weights.loom` a partir del GGUF sin modificarlo, junto con `tokenizer.json`, `llm_config.json` y un `model.json` con los ficheros fuente fijados y verificados por sha256 en `loom-fetch`. El paquete se ejecuta con `loom-serve` 0.2.0 (`hrx-loom[hf]==0.2.0`).

En cuanto a las innovaciones técnicas del runtime, la configuración recomendada activa `completion_spin_ns=4294967295` (espera activa de las finalizaciones de GPU, consumiendo CPU mientras hay trabajo en vuelo), `--pool_backing=fixed` (reserva por adelantado el pool de memoria del preset) y `--parameter_mode=preload` (solo cambia cómo se cargan los pesos en el host). La model card indica explícitamente que la decodificación especulativa no aplica y que el esfuerzo de razonamiento tampoco.

## Capacidades

- Generación de texto conversacional mediante API compatible con OpenAI (`/v1/chat/completions`).
- Tool calling estilo OpenAI: acepta `tools` y devuelve `tool_calls`.
- Modo de razonamiento (thinking) activado por defecto; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Ventana de contexto de 262.144 tokens por petición.
- Hasta 4 peticiones concurrentes.
- Límite de 4.096 tokens de salida por petición (preset `max_tokens`).
- Sin soporte de entrada de imagen ni de audio (marcado como «not applicable»).
- Sin decodificación especulativa ni niveles de esfuerzo de razonamiento.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional local sobre hardware AMD: el paquete se sirve con `loom-serve` en un Ryzen AI Max+ 395 o una Radeon AI PRO R9700 y expone un endpoint compatible con OpenAI, lo que permite conectar clientes existentes sin adaptadores.
- Automatización con tool calling: al soportar `tools` y `tool_calls`, se puede integrar en flujos donde el modelo decida invocar funciones externas (consultas a bases de datos, APIs internas) desde una máquina con GPU AMD.
- Procesamiento de documentos largos: la ventana de 262.144 tokens permite enviar contratos, informes o transcripciones extensas en una sola petición, útil para resumen y extracción de información.
- Razonamiento en dos fases: el modo thinking activado por defecto permite obtener trazas de razonamiento en tareas de análisis, y desactivarlo reduce latencia cuando solo se necesita respuesta directa.
- Despliegue en estaciones de trabajo AMD: el paquete está pensado para los dos aceleradores citados, lo que facilita montar un servidor de inferencia local en entornos con hardware AMD en lugar de NVIDIA.
- Prototipado de agentes multi-turno: la combinación de contexto largo, concurrencia de 4 peticiones y tool calling permite construir bucles de agente con historial reutilizado, aunque la model card advierte que las puertas de corrección del bucle de agente aún no se han re-medido.
- Evaluación comparativa frente a llama.cpp: el paquete incluye puertas de corrección (`golden`, `compare`, `agent`, `sampling`, `logits`) diseñadas para contrastar la salida con la referencia de llama.cpp sobre el mismo GGUF.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección «Performance vs llama.cpp» para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201), pero en ambos casos indica: «the results for this package are not yet re-measured». Del mismo modo, todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como «not yet re-measured» en ambas GPUs.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el checkpoint es Q4_K_M de 4B, y la GPU Radeon AI PRO R9700 se describe con 32 GB, suficiente para el modelo y el pool de memoria fijo.
- GPU soportadas: AMD Ryzen AI Max+ 395 «Strix Halo» (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB). No se mencionan GPUs NVIDIA ni otras AMD.
- GPU consumer: no se indica compatibilidad con GPUs de consumo; los dos aceleradores citados son los únicos soportados en la documentación.
- Despliegue: `loom-serve` (paquete `hrx-loom[hf]==0.2.0`), con `loom-fetch` para descargar el paquete desde Hugging Face. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este paquete.
- Latencia y throughput: no disponibles (las mediciones aún no se han re-medido).
- Configuración de servidor: `--pool_backing=fixed`, `--parameter_mode=preload` y `completion_spin_ns=4294967295` en el dispositivo `amdgpu://`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| TokenRhythm-NeoHorse-1-4B-loom | 4B | 262.144 tokens | Apache 2.0 | GGUF empaquetado en Loom; `loom-serve` | Paquete específico para AMD Strix Halo y R9700; sin benchmarks re-medidos |
| TokenRhythm/NeoHorse-1-4B-GGUF (modelo base) | 4B | no disponible | no disponible en la información | GGUF; ejecutable con llama.cpp | Checkpoint original sin empaquetar; sirve de referencia de corrección |
| Alternativas de 4B comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos en la información proporcionada |

No se dispone de información sobre otros modelos de la misma categoría con la que establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base; se desconoce su comportamiento en dominios sensibles.
- Riesgo de alucinación no evaluado: no hay resultados de benchmarks ni de puertas de corrección registrados para este paquete.
- Las mediciones de rendimiento y las puertas de corrección figuran como «not yet re-measured» en ambas GPUs, por lo que no hay evidencia publicada de que la salida coincida con la referencia de llama.cpp.
- Compatibilidad limitada a dos aceleradores AMD concretos (gfx1151 y gfx1201); no se documenta soporte para otras GPUs.
- Sin soporte de imagen ni audio; sin decodificación especulativa.
- Límite de 4.096 tokens de salida por petición, a pesar de la ventana de contexto de 262.144 tokens.
- Idiomas soportados no documentados; no se puede garantizar calidad multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero el paquete depende del modelo base TokenRhythm/NeoHorse-1-4B-GGUF, cuya licencia y condiciones no se detallan en la información disponible.
- El paquete registra 0 descargas y 0 likes en el momento de redactar la ficha; no hay evidencia de uso en producción.
- La fecha de creación indicada (2026-11-19) es futura respecto a la información habitual de publicación; conviene verificar la vigencia del repositorio antes de adoptarlo.

## Enlaces

- Hugging Face del paquete: https://huggingface.co/loom-draft/TokenRhythm-NeoHorse-1-4B-loom
- Modelo base en Hugging Face: https://huggingface.co/TokenRhythm/NeoHorse-1-4B-GGUF
- Repositorio Loom (ROCm): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/

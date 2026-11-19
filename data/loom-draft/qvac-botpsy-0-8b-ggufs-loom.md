# loom-draft/qvac-BotPsy-0.8B-GGUFs-loom

## Resumen

`loom-draft/qvac-BotPsy-0.8B-GGUFs-loom` es un paquete de distribución para el runtime AMD Loom, no un modelo entrenado de forma independiente. Empaqueta el checkpoint GGUF cuantizado en Q4_K_M `botpsy-0.8b-q4_k_m-imat.gguf` del modelo base `qvac/BotPsy-0.8B-GGUFs` (0,8 mil millones de parámetros) junto con programas `.loom` generados automáticamente por la herramienta `loom-next`, una tarjeta `model.json` y el tokenizador. El objetivo es permitir la inferencia del modelo sobre las GPU AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y Radeon AI PRO R9700 (gfx1201, 32 GB) mediante el servidor `loom-serve`.

El interés del paquete es de infraestructura más que de modelado: demuestra un flujo de compilación de kernels específicos para arquitecturas AMD vía ROCm (repositorio `ROCm/hrx-system`) y expone el modelo a través de una API compatible con OpenAI (`/v1/chat/completions`). El checkpoint publicado ocupa 0,0 GB según los metadatos del repositorio, lo que sugiere que los pesos no están efectivamente alojados en este repositorio y deben obtenerse del modelo base.

La relevancia actual es limitada: el repositorio no registra descargas ni interacciones, y la propia model card indica que las mediciones de rendimiento y las puertas de corrección (`kernel_tests`, `golden`, `compare`, `agent`, etc.) no se han vuelto a medir para este paquete. Es, por tanto, un artefacto en estado de borrador (`loom-draft`) con licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base `qvac/BotPsy-0.8B-GGUFs`; el paquete solo distribuye kernels Loom y GGUF) |
| Parámetros totales | 0,8 mil millones (según el nombre del modelo base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens por petición |
| Tipos de cuantización | Q4_K_M (archivo `botpsy-0.8b-q4_k_m-imat.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (empaquetado en programas `.loom` y `weights.loom`) |
| Tokens máximos de salida | 4.096 (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| Dispositivos objetivo | AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151); AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0`, servidor `loom-serve` |
| API | compatible con OpenAI (`/v1/chat/completions`) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna del modelo base `qvac/BotPsy-0.8B-GGUFs` (no se especifica si es un transformer denso, MoE, SSM o híbrido, ni la composición del dataset de entrenamiento, el número de tokens o si hubo RLHF/DPO). Lo que sí documenta el paquete es la capa de ejecución: `loom-next` genera programas `.loom` (kernels y grafo de ejecución) a partir del GGUF sin intervención de un LLM en el bucle, y `loom-serve` los ejecuta sobre ROCm para las arquitecturas gfx1151 y gfx1201.

Las innovaciones destacables son de despliegue: pool de memoria de respaldo fijo (`--pool_backing=fixed`), precarga de parámetros en host (`--parameter_mode=preload`), espera activa de finalizaciones de GPU (`completion_spin_ns=4294967295`) y un modo de razonamiento opcional activable por plantilla de chat (`enable_thinking`). No se documenta decodificación especulativa (marcada como "not applicable") ni atención lineal.

## Capacidades

- Generación de texto conversacional vía API compatible con OpenAI.
- Tool calling estilo OpenAI (`tools` y `tool_calls`), con soporte de bucles multi-turno de agentes (puerta `agent` y `agent_think_off` en la model card).
- Modo de razonamiento ("thinking") opcional, desactivado por defecto; se activa con `chat_template_kwargs: {"enable_thinking": true}`. El "reasoning effort" no aplica.
- Contexto largo: hasta 262.144 tokens por petición.
- Concurrencia de 4 peticiones con consistencia verificable (puerta `consistency`).
- Entrada de imagen: no soportada en Loom, aunque el modelo original la soporta según la model card.
- Audio: no aplica.
- Multilingüismo: no disponible en la información proporcionada.
- Muestreo (temperatura, top_k, semilla): estado "no determinado" en la tabla de características.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo con GPU AMD: desplegando `loom-serve` sobre una Radeon AI PRO R9700 se obtiene un endpoint OpenAI-compatible para integrar en herramientas internas sin depender de la nube.
- Agentes con tool calling en pipelines internos: el soporte de `tools`/`tool_calls` y las puertas `agent` permiten construir bucles de razonamiento multi-paso que invoquen APIs o funciones del sistema.
- Procesamiento de documentos largos: con 262.144 tokens de contexto se pueden resumir o consultar contratos, informes o bases de código extensas en una sola petición.
- Prototipado de aplicaciones sobre Strix Halo: el paquete está pensado para APUs Ryzen AI Max+ 395, útil para desarrolladores que quieran validar flujos de inferencia en hardware integrado AMD.
- Evaluación comparativa de runtimes: sirve como banco de pruebas para medir kernels Loom frente a llama.cpp sobre el mismo GGUF (puertas `golden`, `compare`, `logits`).
- Moderación o clasificación de texto ligera: un modelo de 0,8B cuantizado a Q4_K_M encaja en tareas de baja latencia con presupuesto de memoria reducido.
- Modo de razonamiento explícito para tareas de análisis: activando `enable_thinking` se pueden obtener cadenas de razonamiento para depuración o para tareas que requieran justificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que las mediciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201) "no se han vuelto a medir" para este paquete, y que todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured".

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; un GGUF Q4_K_M de 0,8B ocupa típicamente alrededor de 0,5-0,6 GB de pesos, pero no se confirma en la información proporcionada.
- GPU objetivo documentadas: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU consumer: no se documenta compatibilidad con RTX 4090, A100, H100 ni otras GPU NVIDIA; el runtime es específico de ROCm/AMD.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para servir la API. No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones de despliegue de este paquete (llama.cpp se usa solo como referencia de corrección).
- Latencia y throughput: no disponibles (no se han vuelto a medir).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `loom-draft/qvac-BotPsy-0.8B-GGUFs-loom` | 0,8B | 262.144 | Apache 2.0 | GGUF + `.loom` | Paquete para runtime AMD Loom; sin benchmarks publicados |
| `qvac/BotPsy-0.8B-GGUFs` (modelo base) | 0,8B | no disponible | no disponible | GGUF | Checkpoint original sin empaquetar; soporta imagen según la model card |
| Alternativas de ~1B (p. ej. Llama 3.2 1B, Qwen2.5 0.5B) | ~0,5-1,2B | 128K en algunos casos | licencias variables | safetensors, GGUF | No se dispone de datos comparativos en la información proporcionada |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible en la información proporcionada; al ser un modelo de 0,8B es esperable una capacidad limitada de razonamiento y factualidad, pero no se documenta.
- Riesgo de alucinación: no cuantificado; el tamaño reducido y la cuantización Q4_K_M sugieren precisión limitada, aunque no hay evidencia publicada.
- Contexto e idioma: aunque se anuncian 262.144 tokens de contexto, no se documenta la ventana efectiva del modelo base ni los idiomas soportados.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base `qvac/BotPsy-0.8B-GGUFs`, que no se indica en la información disponible.
- El repositorio ocupa 0,0 GB, por lo que los pesos podrían no estar alojados aquí; es necesario descargarlos del modelo base.
- Estado de borrador: el paquete pertenece a `loom-draft`, sin descargas ni validación pública, y todas las puertas de corrección y mediciones de rendimiento están pendientes de re-medición.
- Soporte de imagen: la model card indica que el modelo original soporta entrada de imagen, pero Loom no la implementa en este paquete.
- Compatibilidad de hardware muy restringida: solo se documentan dos GPU AMD concretas (gfx1151 y gfx1201); no hay soporte declarado para NVIDIA ni para otras GPU AMD.
- El muestreo (temperatura, top_k, semilla) figura como "no determinado", lo que puede afectar a la reproducibilidad en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/qvac-BotPsy-0.8B-GGUFs-loom
- Modelo base: https://huggingface.co/qvac/BotPsy-0.8B-GGUFs
- Runtime ROCm/hrx-system: https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/

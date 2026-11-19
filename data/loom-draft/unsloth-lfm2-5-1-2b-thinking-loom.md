# loom-draft/unsloth-LFM2.5-1.2B-Thinking-loom

## Resumen

LFM2.5-1.2B-Thinking es un modelo de lenguaje de 1.200 millones de parámetros desarrollado por Liquid AI, orientado a razonamiento con modo "thinking" explícito. El repositorio analizado, `loom-draft/unsloth-LFM2.5-1.2B-Thinking-loom`, no es un modelo nuevo ni un fine-tune: es un paquete de despliegue para el runtime Loom (ROCm/HRX) que empaqueta el checkpoint GGUF Q4_K_M publicado por Unsloth (`unsloth/LFM2.5-1.2B-Thinking-GGUF`) como programas `.loom` y una tarjeta `model.json`, generados con la herramienta `loom-next` sin intervención de un LLM en el bucle.

El objetivo del paquete es ejecutar el modelo en GPUs AMD específicas: la APU Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y la Radeon AI PRO R9700 (gfx1201, 32 GB). Se sirve mediante `loom-serve` con una API compatible con OpenAI (`/v1/chat/completions`), lo que permite integrarlo en clientes existentes sin adaptadores propios.

La relevancia es doble: por un lado, expone un modelo pequeño de razonamiento (1,2B) con contexto declarado de 128.000 tokens por petición; por otro, demuestra la ruta de despliegue de Loom sobre hardware AMD consumer y profesional, un nicho donde las alternativas (vLLM, llama.cpp con ROCm) tienen soporte desigual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (heredada del checkpoint LFM2.5-1.2B-Thinking; no se detalla en la información) |
| Parámetros totales | 1.200 millones (1,2B) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 128.000 tokens por petición |
| Tipos de cuantización | Q4_K_M (GGUF) |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; no se detalla) |
| Formato de pesos | GGUF (Q4_K_M) empaquetado en programas `.loom` y `weights.loom` |
| Salida máxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| API | OpenAI-style `/v1/chat/completions` |
| Hardware objetivo | AMD Ryzen AI Max+ 395 (gfx1151), AMD Radeon AI PRO R9700 (gfx1201, 32 GB) |
| Runtime | `hrx-loom[hf]==0.2.0`, generado con `loom-next` |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del checkpoint base LFM2.5-1.2B-Thinking en los datos proporcionados: no se especifica si es un transformer denso, híbrido o SSM, ni la composición del dataset de entrenamiento, el número de tokens vistos, ni si hubo fases de RLHF o DPO. Lo único confirmado es el tamaño (1,2B parámetros) y la existencia de un modo "thinking" en el nombre del modelo.

El paquete Loom en sí no modifica los pesos: la model card indica explícitamente que se empaqueta el "unmodified GGUF checkpoint". La contribución técnica del repositorio es la generación automática de kernels y programas Loom (`program/*.loom`, `weights.loom`) a partir de `llm_config.json`, con verificación de integridad por sha256 en `loom-fetch`. El paquete declara soporte de decodificación con `completion_spin_ns=4294967295` (espera activa de finalizaciones de GPU) y `--pool_backing=fixed` (pool de memoria comprometido por adelantado). No hay decodificación especulativa: la tabla de features la marca como "not applicable".

## Capacidades

- Generación de texto conversacional vía API compatible con OpenAI.
- Razonamiento con modo "thinking" (según el nombre del modelo base); el paquete Loom marca la fila "reasoning / thinking" como "not applicable", por lo que no se confirma su exposición en este runtime.
- Contexto largo: hasta 128.000 tokens por petición.
- Concurrencia de hasta 4 peticiones simultáneas.
- Salida de hasta 4.096 tokens por respuesta (preset).
- Tool calling / function calling: no soportado en este paquete ("not applicable").
- Razonamiento multi-paso con agentes: no soportado ("not applicable").
- Entrada de imagen: no soportada ("not applicable").
- Entrada/salida de audio: no soportada ("not applicable").
- Sampling: estado "not determined" (temperatura, top_k y semilla sin verificar).
- Capacidades multilingües: no disponible.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo AMD: `loom-serve` expone `/v1/chat/completions` en `127.0.0.1:8080`, de modo que cualquier cliente compatible con la API de OpenAI puede apuntar al endpoint sin cambios de código. Adecuado para entornos con requisitos de privacidad donde los datos no deben salir de la máquina.
- Procesamiento de documentos largos: con 128.000 tokens de contexto por petición, el modelo puede ingerir contratos, informes o transcripciones extensas en una sola pasada, útil para resumen y extracción de entidades en flujos internos.
- Prototipado y evaluación de modelos pequeños de razonamiento: al ser un paquete reproducible con `model.json.lock` y verificación sha256, sirve para comparar el comportamiento del GGUF Q4_K_M frente a la referencia de llama.cpp mediante las puertas de corrección de `loom-benchmark`.
- Despliegue en hardware AMD consumer: la APU Strix Halo (gfx1151) permite ejecutar el modelo en un equipo compacto sin GPU discreta, un escenario donde las pilas CUDA no están disponibles.
- Servicio de baja concurrencia en producción interna: con 4 peticiones concurrentes y 4.096 tokens de salida máxima, encaja en herramientas internas de asistencia (resúmenes, borradores, clasificación) con carga moderada.
- Validación de kernels y portabilidad ROCm: los programas `.loom` generados permiten a ingenieros de sistemas verificar la corrección del backend frente a llama.cpp (puertas `kernel_tests`, `golden`, `compare`), aunque en esta revisión no hay mediciones registradas.
- Chat interactivo de baja latencia en Radeon AI PRO R9700: con 32 GB de VRAM y un modelo de 1,2B en Q4_K_M, el checkpoint ocupa una fracción mínima de memoria, dejando margen para lotes y contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye secciones de rendimiento frente a llama.cpp para Strix Halo (gfx1151) y Radeon AI PRO R9700 (gfx1201), pero ambas indican: "the results for this package are not yet re-measured". Todas las puertas de corrección (`kernel_tests`, `golden`, `compare`, `vision`, `consistency`, `spec`, `agent`, `agent_think_off`, `sampling`, `logits`, `decision`) figuran como "not yet re-measured" en ambas GPUs, es decir, sin evidencia registrada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; un checkpoint de 1,2B en Q4_K_M ocupa del orden de 0,7-0,9 GB de pesos, pero el pool de memoria del runtime (`--pool_backing=fixed`) reserva por adelantado y no se publica su tamaño.
- GPU soportadas oficialmente: AMD Ryzen AI Max+ 395 "Strix Halo" (gfx1151) y AMD Radeon AI PRO R9700 (gfx1201, 32 GB).
- GPU no soportadas: no se mencionan A100, H100 ni RTX 4090; el paquete está generado para el backend AMD de Loom.
- Cabe en GPU consumer: sí, en la APU Strix Halo; no hay datos para GPUs NVIDIA consumer.
- Despliegue: `pipx install "hrx-loom[hf]==0.2.0"`, `loom-fetch` para materializar el paquete y `loom-serve` para servir la API. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI para este paquete concreto.
- Latencia y throughput: no disponibles (mediciones pendientes de re-ejecución).
- Opciones de arranque relevantes: `completion_spin_ns=4294967295` (espera activa, consume CPU mientras hay trabajo en GPU), `--pool_backing=fixed`, `--parameter_mode=preload` (solo afecta a la carga de pesos en host).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| LFM2.5-1.2B-Thinking (paquete Loom) | 1,2B | 128.000 tokens | other | GGUF Q4_K_M vía `loom-serve` (AMD) | Sin benchmarks publicados en esta información; tool calling y visión no soportados |
| unsloth/LFM2.5-1.2B-Thinking-GGUF | 1,2B | no disponible | other | GGUF (llama.cpp y derivados) | Checkpoint base sin modificar; sirve de referencia de corrección |
| Alternativas de ~1-2B con razonamiento | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para comparar con modelos de la misma categoría en parámetros de rendimiento, ya que no hay resultados de benchmarks publicados para este paquete.

## Limitaciones y advertencias

- Licencia "other": las condiciones exactas no se detallan en la información; es imprescindible revisar la licencia del modelo base (Liquid AI) antes de cualquier uso comercial.
- Sin evidencia de corrección: todas las puertas de validación (kernels, golden, compare, consistency, sampling, logits, agent, decision) figuran como "not yet re-measured", por lo que no hay garantía publicada de equivalencia con llama.cpp.
- Sin mediciones de rendimiento: no hay latencia ni throughput publicados para ninguna de las dos GPUs objetivo.
- Tool calling, agentes, visión y audio no están soportados en este paquete ("not applicable"), lo que descarta flujos agénticos y multimodales.
- Sampling sin determinar: el comportamiento de temperatura, top_k y semilla no está verificado.
- Idiomas soportados no disponibles: no se puede garantizar calidad en castellano ni en otros idiomas.
- Riesgo de alucinación: inherente a modelos de 1,2B; no hay evaluaciones de fidelidad publicadas.
- Hardware restringido: el paquete está generado para gfx1151 y gfx1201; no se documenta funcionamiento en otras GPUs AMD ni en NVIDIA.
- Concurrencia limitada a 4 peticiones y salida máxima de 4.096 tokens: puede ser insuficiente para cargas de producción medias o altas.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad; tratar como artefacto de borrador (`loom-draft`).
- El nombre "Loom" colisiona con la herramienta de grabación de pantalla de Atlassian; los resultados de búsqueda web no son relevantes para este modelo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/loom-draft/unsloth-LFM2.5-1.2B-Thinking-loom
- Modelo base (GGUF de Unsloth): https://huggingface.co/unsloth/LFM2.5-1.2B-Thinking-GGUF
- Runtime Loom (ROCm/HRX): https://github.com/ROCm/hrx-system
- Generador loom-next: https://github.com/loom-fun/loom-next
- Sitio del ecosistema Loom: https://loom-fun.github.io/loom-dev/

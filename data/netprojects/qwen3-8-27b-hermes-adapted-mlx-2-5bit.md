# netprojects/Qwen3.8-27B-hermes-adapted-MLX-2.5bit

## Resumen

Qwen3.8-27B-hermes-adapted-MLX-2.5bit es una cuantización de 2,5 bits en formato MLX del adaptador LoRA `harness-hub/Qwen3.8-27B-hermes-adapted`, que a su vez es un ajuste fino mediante aprendizaje por refuerzo (AsyncGRPO con TRL) del modelo base `Qwen/Qwen3.8-27B` de Alibaba. El objetivo del adaptador es convertir al modelo en el motor detrás de Hermes Agent de Nous Research, especializado en tareas de ingeniería de software y operación de terminal. Esta versión concreta, publicada por el usuario netprojects, elimina el codificador de visión y comprime los pesos con cuantización mixta para que el modelo quepa en Macs de 24 GB de memoria unificada.

El modelo conserva la arquitectura Qwen3.8 con 27.745.371.136 parámetros totales y mantiene la capa de predicción multi-token (MTP) original de Qwen, cuantizada a 4 bits, que puede usarse como modelo borrador para decodificación especulativa. La cuantización es agresiva: proyecciones gate y up del MLP a 2 bits, proyecciones down a 3 bits, todas las proyecciones de atención y de atención lineal (Gated DeltaNet) a 4 bits, y embeddings y capa de salida a 4 bits con cuantización afín de grupo 64, resultando en unos 3,65 bits por peso de media y un repositorio de 11,8 GB.

Es relevante porque demuestra que un modelo de 27B ajustado para agentes de código puede ejecutarse en hardware de consumo Apple Silicon con un coste de fidelidad medible: conserva el mismo siguiente token que bf16 en el 85,4% de los casos y mantiene 44/50 aciertos en GSM8K, aunque con una divergencia KL de 0,2461 frente a bf16, notablemente superior a las variantes de 3 y 4 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.8 con atención lineal Gated DeltaNet y capa MTP (multi-token prediction); conversión MLX vía mlx-vlm, sin codificador de visión |
| Parametros totales | 27.745.371.136 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada; Hermes Agent requiere al menos 64.000 tokens |
| Tipos de cuantizacion | Mixta: MLP gate/up 2-bit, MLP down 3-bit, atención y Gated DeltaNet 4-bit, embeddings y output 4-bit (afín, grupo 64); ~3,65 bits por peso; capa MTP a 4-bit |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), repositorio de 11,8 GB; incluye `model-mtp.safetensors` |

## Arquitectura y entrenamiento

La base es Qwen3.8-27B, un transformer con capas de atención lineal Gated DeltaNet combinadas con atención estándar, y una capa de predicción multi-token (MTP) que permite decodificación especulativa. Sobre ese modelo, harness-hub entrenó un adaptador LoRA (rango 32, alpha 64) mediante aprendizaje por refuerzo con AsyncGRPO en TRL, con un checkpoint en el paso 160 de los 1000 planificados, orientado a tareas de ingeniería de software y terminal dentro de Hermes Agent. El entrenamiento y la evaluación se realizaron con el modo thinking desactivado.

Esta publicación de netprojects no reentrena nada: fusiona el adaptador en el modelo base (revisiones `09fb741` del adaptador y `3756181` del base), elimina el codificador de visión para dejar una build solo de texto y aplica cuantización mixta con mlx-vlm. La innovación técnica destacable es el uso de la capa MTP original de Qwen como modelo borrador integrado: al pasar el mismo repositorio como `--draft-model` con `--draft-kind mtp`, mlx-vlm la emplea para decodificación especulativa, verificando cada token propuesto con el modelo completo.

## Capacidades

- Generación de texto conversacional y razonamiento, con modo thinking disponible pero desaconsejado en esta build (el adaptador se entrenó y evaluó con thinking off).
- Ingeniería de software y tareas de terminal: el adaptador está específicamente entrenado para el bucle de agente de Hermes Agent.
- Tool calling / function calling en formato XML de Qwen (`<tool_call><function=...><parameter=...>`), que el servidor de mlx-lm expone como `tool_calls` compatibles con OpenAI.
- Uso como agente multi-paso con contexto largo (Hermes Agent exige al menos 64.000 tokens).
- Decodificación especulativa mediante la capa MTP incluida, con verificación por el modelo completo.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión: no soportada en esta build (codificador eliminado explícitamente).
- Audio: no disponible.

## Casos de uso

- Agente de código autónomo en local: servir el modelo con `mlx_lm.server` y conectarlo a Hermes Agent para resolver tareas como depurar tests fallidos (`hermes chat -q "Find out why the tests in tests/test_parser.py fail and fix the bug."`). Es adecuado porque el adaptador fue entrenado exactamente para ese bucle y cabe en 24 GB de memoria unificada.
- Reparación de bugs en proyectos reales: el adaptador reporta 43,1% en SWE-bench Pro (hard 51) frente al 29,4% del base, con menos del 40% de turnos en las tareas que ambos resuelven, lo que reduce coste y latencia por tarea.
- Automatización de operaciones en terminal: con 58,8% en Terminal-Bench 2.1 frente al 44,7% del base, es apto para ejecutar secuencias de comandos, diagnosticar entornos y corregir errores de shell en máquinas de desarrollo.
- Asistente de programación en portátiles Apple Silicon: al ocupar 11,8 GB y requerir 13,8 GB de pico con prompt de 8K tokens, permite tener un modelo de 27B corriendo junto al IDE en un Mac de 24 GB.
- Generación de funciones y scripts puntuales desde Python: cargándolo con `mlx_lm.load` y `generate`, sirve para tareas de código acotadas donde la fidelidad de 2,5 bits es suficiente (44/50 en GSM8K).
- Prototipado de pipelines de agentes con API compatible OpenAI: el servidor de mlx-lm expone `/v1` con tool calls, lo que permite integrarlo en frameworks existentes sin adaptadores adicionales.
- Evaluación de cuantizaciones en investigación: la tabla comparativa de builds (2,5 a 8 bits) con KL frente a bf16 y porcentaje de coincidencia del siguiente token lo convierte en un caso de estudio práctico sobre el compromiso tamaño-fidelidad.

## Benchmarks y rendimiento

Datos publicados por el autor para esta build y las alternativas de la misma familia, medidos en un MacBook Pro M5 Max de 128 GB el 19 de noviembre de 2026 con mlx 0.32.4, mlx-lm 0.32.2 y mlx-vlm 0.7.11:

| Build | Tamano | Mismo siguiente token que bf16 | KL vs bf16 | GSM8K (50 preguntas) | Memoria pico, prompt 8K | Memoria Mac sugerida |
|---|---|---|---|---|---|---|
| MLX-6bit (recomendada) | 23,1 GB | 98,5% | 0,0015 | 46/50 | 23,4 GB | 36 GB+ |
| MLX-8bit | 30,0 GB | 99,2% | 0,0004 | 45/50 | 29,7 GB | 48 GB+ |
| MLX-4bit | 16,3 GB | 96,1% | 0,0192 | 43/50 | 17,1 GB | 32 GB+ |
| MLX-3bit | 13,8 GB | 91,7% | 0,0824 | 45/50 | 14,6 GB | 24 GB+ |
| **MLX-2.5bit (esta build)** | **11,8 GB** | **85,4%** | **0,2461** | **44/50** | **13,8 GB** | **24 GB+** |
| MLX-bf16 | 55,6 GB | referencia | referencia | 45/50 | 53,4 GB | 96 GB+ |

Resultados del adaptador frente al modelo base, publicados por harness-hub bajo Hermes Agent con thinking off:

| Benchmark | Modelo base | Con adaptador |
|---|---|---|
| SWE-bench Pro (hard 51) | 29,4% | 43,1% |
| Terminal-Bench 2.1 | 44,7% | 58,8% |

Con thinking off, el adaptador iguala al modelo base con thinking en su esfuerzo máximo (xhigh) generando entre 3,5 y 4,4 veces menos tokens. No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval u otras pruebas estándar.

## Requisitos de hardware

- VRAM/memoria unificada: 13,8 GB de pico con prompt de 8K tokens; el autor recomienda un Mac con 24 GB o más.
- Hardware objetivo: Apple Silicon exclusivamente (formato MLX); probado en MacBook Pro M5 Max de 128 GB.
- GPU NVIDIA: no soportadas por este formato; para A100, H100 o RTX 4090 habría que usar los pesos originales en safetensors/bf16 o convertir a GGUF, lo que no está cubierto por esta publicación.
- Cabe en GPU de consumo Apple: sí, en Macs de 24 GB (M-series base y superiores); no se indica compatibilidad con GPUs discretas de consumo.
- Despliegue: `mlx_lm.server` (API compatible con OpenAI), `mlx-lm` desde Python y `mlx_vlm.generate` con `--draft-kind mtp` para decodificación especulativa. No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta build.
- Latencia y throughput: no disponibles como cifras absolutas; el adaptador reduce aproximadamente a la mitad los tokens generados frente al base y usa menos del 40% de sus turnos en tareas que ambos resuelven, lo que se traduce en menor latencia por tarea completada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Fidelidad / rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-hermes-adapted-MLX-2.5bit | 27,7B | no disponible (≥64K para Hermes Agent) | 85,4% mismo token que bf16; KL 0,2461; GSM8K 44/50 | Apache 2.0 | Hugging Face, formato MLX |
| Qwen3.8-27B-hermes-adapted-MLX-4bit | 27,7B | no disponible | 96,1% mismo token; KL 0,0192; GSM8K 43/50; 16,3 GB | Apache 2.0 | Hugging Face, formato MLX |
| Qwen3.8-27B-hermes-adapted-MLX-6bit | 27,7B | no disponible | 98,5% mismo token; KL 0,0015; GSM8K 46/50; 23,1 GB | Apache 2.0 | Hugging Face, formato MLX |
| Qwen3.8-27B (base sin adaptador) | 27,7B | no disponible | SWE-bench Pro 29,4%; Terminal-Bench 2.1 44,7% | Apache 2.0 | Hugging Face |

La comparación relevante es interna a la familia de cuantizaciones: la 2.5bit es la única, junto con la 3bit, que cabe en 24 GB, pero paga un precio claro en divergencia KL (0,2461 frente a 0,0824 de la 3bit) y en coincidencia del siguiente token (85,4% frente a 91,7%). No se dispone de datos de benchmarks frente a modelos de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 2,5 bits produce una divergencia KL de 0,2461 frente a bf16, unas 164 veces mayor que la build de 6 bits y 12,8 veces mayor que la de 4 bits; el 14,6% de los siguientes tokens difieren del modelo de referencia.
- El adaptador se entrenó con un checkpoint intermedio (paso 160 de 1000 planificados), por lo que no representa el resultado final del entrenamiento previsto por harness-hub.
- El modo thinking debe permanecer desactivado: el adaptador se entrenó y evaluó así, y activarlo puede degradar el comportamiento esperado.
- Esta build es solo de texto; el codificador de visión fue eliminado, por lo que no puede procesar imágenes.
- La decodificación especulativa con MTP puede divergir ligeramente del decodificado plano en respuestas largas cuando hay casi empates, ya que la verificación por lotes puede redondear hacia el otro token.
- Riesgo de alucinación: no cuantificado en la información disponible; es un riesgo inherente a modelos de lenguaje de esta escala, agravado por la pérdida de fidelidad de la cuantización.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; no hay evaluación multilingüe publicada para esta build.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el adaptador deben verificarse por separado; esta publicación declara Apache 2.0 sin restricciones adicionales indicadas.
- Dependencia de hardware Apple Silicon y de versiones concretas del stack (mlx 0.32.4, mlx-lm 0.32.2, mlx-vlm 0.7.11); no hay soporte documentado para CUDA.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-2.5bit
- Modelo base del adaptador: https://huggingface.co/harness-hub/Qwen3.8-27B-hermes-adapted
- Modelo Qwen original: https://huggingface.co/Qwen/Qwen3.8-27B
- Build de 6 bits (recomendada): https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-6bit
- Build de 8 bits: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-8bit
- Build de 4 bits: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-4bit
- Build de 3 bits: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-3bit
- Build bf16: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-bf16
- Adaptador LoRA para mlx-lm: https://huggingface.co/netprojects/Qwen3.8-27B-hermes-adapted-MLX-adapter
- Repositorio de Hermes Agent: https://github.com/NousResearch/hermes-agent

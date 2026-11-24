# litert-community/Nemotron-3-Nano-30B-A3B

## Resumen

Nemotron-3-Nano-30B-A3B es un modelo de lenguaje de NVIDIA con arquitectura híbrida que combina capas Mamba-2, capas de mezcla de expertos (MoE) y capas de atención clásica. Cuenta con 30.000 millones de parámetros totales, de los cuales solo 3.500 millones están activos por token, lo que lo sitúa en la categoría de modelos MoE eficientes en cómputo. El repositorio analizado es una conversión del modelo original en BF16 de NVIDIA al formato LiteRT-LM, orientada a ejecución en dispositivos y navegadores mediante WebGPU y CPU.

La conversión la mantiene la comunidad `litert-community` y publica cuatro artefactos cuantizados (int4 y mixed_int4) con ventanas de contexto de 2.048 y 4.096 tokens. El modelo está pensado para generación de texto con razonamiento explícito (modo *thinking* activado por defecto) y soporta inglés, español, francés, alemán, japonés e italiano. Su relevancia actual radica en que demuestra que un MoE de 30B puede ejecutarse en hardware de consumo (Apple M4 Max) con velocidades de decodificación superiores a 70 tokens/s en GPU.

La licencia es la NVIDIA Nemotron Open Model License, que no es una licencia de código abierto estándar y requiere revisión para uso comercial. El formato de pesos es propietario de LiteRT-LM (`.litertlm`), lo que limita su portabilidad a otros runtimes como llama.cpp o vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 52 capas (23 Mamba-2, 23 MoE, 6 atención) |
| Parametros totales | 30.000 millones |
| Parametros activos | 3.500 millones |
| Longitud de contexto | 2.048 o 4.096 tokens según artefacto |
| Tipos de cuantizacion | int4 (expertos en bloques de 128, down projection en bloques de 64), mixed_int4 (expertos en bloques de 32), router fp32, activaciones fp32, token table y lm_head int8 |
| Idiomas soportados | en, es, fr, de, ja, it |
| Licencia | nvidia-nemotron-open-model-license |
| Formato de pesos | `.litertlm` (LiteRT-LM) |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido con 52 capas distribuidas en tres tipos: 23 capas Mamba-2 (modelo de espacio de estados), 23 capas de mezcla de expertos y 6 capas de atención. Esta combinación busca reducir el coste computacional del prefill y la decodificación manteniendo capacidad expresiva. El modelo original de NVIDIA se distribuye en BF16 y esta conversión aplica cuantización selectiva: los expertos se cuantizan a int4 (con distintos tamaños de bloque según el artefacto), el router se mantiene en fp32 y las activaciones se declaran en fp32. La tabla de tokens y la cabeza de salida (`lm_head`) se cuantizan a int8.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. La model card de la conversión menciona que el modo *thinking* está activado por defecto y que la activación de los expertos se verificó mediante logits (relu² reescrito como `gelu_tanh`). Cada capa de expertos se implementa como una operación personalizada `moe` en LiteRT-LM.

## Capacidades

- Generación de texto con razonamiento explícito (modo *thinking* activado por defecto, desactivable).
- Razonamiento aritmético y conversacional multi-turno (se documenta una prueba de tres turnos con una multiplicación de 17 × 23).
- Soporte de tool calling: el modelo emite llamadas en formato `<tool_call>` como texto plano, sin integración estructurada en el runtime.
- Capacidades multilingües en inglés, español, francés, alemán, japonés e italiano.
- Ejecución en GPU mediante WebGPU y en CPU con 8 hilos.
- No se documentan capacidades de visión, audio ni agentes autónomos multi-paso en la información disponible.

## Casos de uso

- Asistente conversacional local en navegador: el artefacto int4 con contexto de 2.048 tokens y 17,8 GB puede ejecutarse vía WebGPU en un equipo Apple M4 Max, permitiendo conversaciones multi-turno sin conexión a servicios en la nube.
- Razonamiento aritmético asistido en aplicaciones de escritorio: el modo *thinking* por defecto mejora la precisión en operaciones encadenadas, como demuestra la prueba de tres turnos con 17 × 23.
- Prototipado de agentes con tool calling: aunque las llamadas se devuelven como texto, un orquestador externo puede parsear el formato `<tool_call>` e integrar el modelo en pipelines de automatización.
- Despliegue en CPU para entornos con recursos limitados: el artefacto int4 ekv2048 consume 4,4 GB de memoria pico en CPU con 8 hilos y decodifica a 12,8 tokens/s, adecuado para estaciones de trabajo sin GPU dedicada.
- Evaluación de modelos híbridos Mamba-2/MoE en investigación: la conversión permite medir el comportamiento de un MoE de 30B con 3,5B activos en hardware de consumo, comparando precisión y latencia frente al BF16 original.
- Generación de texto multilingüe en aplicaciones embebidas: el soporte de seis idiomas permite construir interfaces de chat localizadas sin depender de APIs externas.
- Pruebas de precisión de cuantización: los cuatro artefactos (int4 y mixed_int4, con contextos de 2.048 y 4.096) permiten comparar el impacto de distintas estrategias de cuantización en la exactitud (12/12 con thinking activado, 11/12 con thinking desactivado).

## Benchmarks y rendimiento

Rendimiento medido por LiteRT-LM v0.19.1 en un Apple M4 Max (128 GB) el 2026-11-12 (mediana de 5 procesos GPU o 3 procesos CPU por archivo):

| Archivo | Backend | Prefill (1.024 tokens) | Decode (256 tokens) | Memoria pico |
|---|---|---:|---:|---:|
| int4 ekv2048 | GPU (WebGPU) | 852 tokens/s | 75,2 tokens/s | 19,8 GB |
| int4 ekv2048 | CPU (8 hilos) | 107 tokens/s | 12,8 tokens/s | 4,4 GB |
| int4 ekv4096 | GPU (WebGPU) | 815 tokens/s | 70,7 tokens/s | 20,4 GB |
| int4 ekv4096 | CPU (8 hilos) | 106 tokens/s | 12,2 tokens/s | 5,0 GB |
| mixed_int4 ekv2048 | GPU (WebGPU) | 845 tokens/s | 71,4 tokens/s | 22,6 GB |
| mixed_int4 ekv2048 | CPU (8 hilos) | 116 tokens/s | 8,00 tokens/s | 6,4 GB |
| mixed_int4 ekv4096 | GPU (WebGPU) | 809 tokens/s | 67,6 tokens/s | 23,2 GB |
| mixed_int4 ekv4096 | CPU (8 hilos) | 114 tokens/s | 7,98 tokens/s | 6,9 GB |

Precisión (12 preguntas y un chat de tres turnos, greedy, frente a los pesos BF16 de NVIDIA):

| Thinking | Los cuatro archivos, CPU y GPU | Modelo fuente |
|---|---|---|
| on | 12/12 correctas; Kenji, 391 | no ejecutado |
| off | 11/12 correctas; Kenji, 401 (int4: 391 en CPU, 411 en GPU) | 11/12 correctas; Kenji, 401 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: 19,8-23,2 GB en GPU (WebGPU) según artefacto; 4,4-6,9 GB en CPU con 8 hilos.
- GPU recomendadas: Apple M4 Max (128 GB) es la plataforma documentada; no se especifican otras GPU.
- Cabe en GPU de consumo: sí, en un Apple M4 Max con WebGPU; no se documenta compatibilidad con RTX 4090, A100 o H100.
- Opciones de despliegue: LiteRT-LM 0.19.1 (paquete PyPI para CPU, herramienta de línea de comandos compilada desde fuente para GPU con WebGPU). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: prefill de 809-852 tokens/s y decodificación de 67,6-75,2 tokens/s en GPU; prefill de 106-116 tokens/s y decodificación de 7,98-12,8 tokens/s en CPU con 8 hilos.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron-3-Nano-30B-A3B (esta conversión) | 30B | 3,5B | 2.048-4.096 | NVIDIA Nemotron Open Model License | `.litertlm` |
| Nemotron-3-Nano-30B-A3B (original NVIDIA, BF16) | 30B | 3,5B | no disponible en la información | NVIDIA Nemotron Open Model License | safetensors (BF16) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks estándar ni de otros modelos comparables en la información proporcionada para establecer una comparativa de rendimiento.

## Limitaciones y advertencias

- La licencia NVIDIA Nemotron Open Model License no es una licencia de código abierto estándar; debe revisarse antes de cualquier uso comercial.
- El formato `.litertlm` es específico de LiteRT-LM y no es portable a otros runtimes habituales (llama.cpp, vLLM, TGI).
- El estado de Mamba-2 no se reinicia entre conversaciones: es obligatorio crear un `Engine` por conversación (issue LiteRT-LM #3165).
- Las llamadas a herramientas se devuelven como texto en formato `<tool_call>`, sin validación estructurada.
- Si un mensaje desborda la ventana de contexto, todos los mensajes posteriores de esa conversación fallan con `Task failed with state: 7`; es necesario iniciar una conversación nueva.
- Las respuestas bloqueantes que superan los 10 minutos fallan con `DEADLINE_EXCEEDED`; se recomienda `send_message_async` o limitar `max_output_tokens`.
- Es necesario desactivar la caché de GPU (`cache_dir=":nocache"` o `--disable_cache=true`): se observaron respuestas incorrectas al cargar cachés de ejecuciones anteriores en macOS.
- La ventana de contexto máxima es de 4.096 tokens, muy inferior a la de modelos contemporáneos, lo que limita tareas de documento largo.
- No se documentan sesgos conocidos ni tasas de alucinación en la información disponible.
- El rendimiento solo está validado en Apple M4 Max; no hay datos para GPU NVIDIA o AMD.
- La cuantización int4 reduce la precisión en modo *thinking* desactivado (11/12 frente a 12/12 con thinking activado).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/Nemotron-3-Nano-30B-A3B
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Mediciones detalladas: https://huggingface.co/litert-community/Nemotron-3-Nano-30B-A3B/blob/main/MEASUREMENTS.md
- LiteRT-LM (repositorio): https://github.com/google-ai-edge/LiteRT-LM
- Issue LiteRT-LM #3165: https://github.com/google-ai-edge/LiteRT-LM/issues/3165
- Licencia: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Paper referenciado (arXiv:2512.20848): https://arxiv.org/abs/2512.20848

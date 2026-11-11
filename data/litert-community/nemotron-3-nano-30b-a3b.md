# litert-community/Nemotron-3-Nano-30B-A3B

## Resumen

Nemotron-3-Nano-30B-A3B es un modelo de lenguaje de NVIDIA con arquitectura híbrida que combina capas Mamba-2, capas de mezcla de expertos (MoE) y capas de atención clásica. Cuenta con 30 000 millones de parámetros totales, de los cuales solo 3500 millones están activos por token, lo que lo sitúa en la categoría de modelos eficientes para inferencia. Esta ficha concreta corresponde a la conversión del modelo original en BF16 al formato LiteRT-LM 0.19.1, publicada por la comunidad litert-community para su ejecución en CPU y GPU (WebGPU) mediante el runtime de Google AI Edge.

El modelo resuelve el problema de desplegar un LLM de razonamiento de gran tamaño en hardware de consumo y estaciones de trabajo sin GPU dedicada de datacenter: los artefactos int4 ocupan entre 20,1 y 20,6 GB y alcanzan 74,6 tokens/s de decodificación en una Apple M4 Max con WebGPU, con un pico de memoria de 22,2 GB. La versión CPU con 8 hilos mantiene 9,77 tokens/s de decodificación con solo 4,4 GB de memoria pico, lo que permite ejecución en portátiles convencionales.

Es relevante ahora porque demuestra que un MoE híbrido de 30B puede ejecutarse fuera de ecosistemas CUDA tradicionales, con cuantización mixta int4/int8, y porque incluye modo de razonamiento (thinking) activado por defecto, soporte multilingüe en seis idiomas y tool calling en formato textual. La licencia es la NVIDIA Nemotron Open Model License, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: 52 capas (23 Mamba-2, 23 MoE, 6 attention) |
| Parámetros totales | 30B |
| Parámetros activos | 3,5B |
| Longitud de contexto | 2048 tokens (artefactos ekv2048) y 4096 tokens (artefacto ekv4096) |
| Tipos de cuantización | int4 (expertos int4, router fp32, token table y lm_head int8); mixed_int4 (matrices no-expertas int8) |
| Idiomas soportados | en, es, fr, de, ja, it |
| Licencia | NVIDIA Nemotron Open Model License |
| Formato de pesos | .litertlm (LiteRT-LM 0.19.1) |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido con 52 capas distribuidas en 23 capas Mamba-2 (modelo de espacio de estados), 23 capas de mezcla de expertos y 6 capas de atención. Esta combinación busca reducir el coste computacional de la atención cuadrática en contextos largos manteniendo la capacidad expresiva de un MoE. El modelo totaliza 30B parámetros con 3,5B activos por token, lo que reduce el coste de inferencia a aproximadamente una novena parte del de un modelo denso equivalente.

El modelo base es nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La conversión a LiteRT-LM documenta decisiones técnicas concretas: los expertos de cada capa se agrupan en una única operación `moe` personalizada, la activación relu² se reescribe como `gelu_tanh` (verificada mediante logits), y la salida de cada operación `moe` tiene un segundo consumidor (`moe * 0`) para evitar que ML Drift fusione la operación siguiente. El router se mantiene en fp32 y las activaciones se declaran en fp32.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo thinking activado por defecto y desactivable mediante `ThinkingConfig(enable_thinking=False)`.
- Razonamiento aritmético y de sentido común: en la evaluación del autor, 12/12 respuestas correctas con thinking activado y 11/12 con thinking desactivado.
- Soporte de tool calling / function calling, devuelto como texto en el formato `<tool_call>` del modelo.
- Conversaciones multi-turno con contexto de hasta 2048 o 4096 tokens según el artefacto.
- Capacidades multilingües en inglés, español, francés, alemán, japonés e italiano.
- Ejecución en CPU (paquete PyPI `litert-lm`) y en GPU mediante WebGPU (herramienta de línea de comandos compilada desde fuente).

## Casos de uso

- Asistencia en estación de trabajo sin GPU de datacenter: el artefacto int4 ekv2048 con backend CPU (8 hilos) requiere solo 4,4 GB de memoria pico y decodifica a 9,77 tokens/s, suficiente para tareas interactivas de redacción y análisis en un portátil.
- Razonamiento aritmético y verificación de cálculos: el modelo resuelve correctamente 12/12 preguntas de evaluación con thinking activado, por lo que es adecuado para validación de operaciones en pipelines de datos donde se necesita trazabilidad del razonamiento.
- Prototipado de agentes con tool calling: el modelo emite llamadas a herramientas en formato `<tool_call>` que pueden parsearse e integrarse en orquestadores de agentes, aunque el runtime devuelve las llamadas como texto y requiere post-procesado.
- Aplicaciones multilingües en Europa: con soporte para español, francés, alemán, italiano e inglés, cubre casos de atención al cliente y generación de contenido en los principales mercados europeos sin necesidad de modelos separados por idioma.
- Despliegue en navegador o aplicaciones web con WebGPU: el backend GPU alcanza 851 tokens/s de prefill y 74,6 tokens/s de decodificación en Apple M4 Max, lo que permite interfaces conversacionales fluidas en el cliente.
- Procesamiento por lotes en CPU con contexto de 4096 tokens: el artefacto mixed_int4 ekv4096 ofrece 115 tokens/s de prefill y 7,59 tokens/s de decodificación con 6,9 GB de memoria pico, adecuado para tareas de extracción y resumen en servidores sin GPU.
- Evaluación comparativa de cuantizaciones: los tres artefactos publicados permiten medir el impacto de int4 frente a mixed_int4 en precisión y velocidad sobre el mismo modelo base.

## Benchmarks y rendimiento

Rendimiento medido por el autor en Apple M4 Max (128 GB), LiteRT-LM v0.19.1:

| Artefacto | Backend | Prefill (1024 tokens) | Decode (256 tokens) | Memoria pico |
|---|---|---:|---:|---:|
| int4 ekv2048 | GPU (WebGPU) | 851 tok/s | 74,6 tok/s | 22,2 GB |
| int4 ekv2048 | CPU (8 hilos) | 105 tok/s | 9,77 tok/s | 4,4 GB |
| mixed_int4 ekv2048 | GPU (WebGPU) | 852 tok/s | 71,5 tok/s | 22,6 GB |
| mixed_int4 ekv2048 | CPU (8 hilos) | 114 tok/s | 7,20 tok/s | 6,4 GB |
| mixed_int4 ekv4096 | GPU (WebGPU) | 815 tok/s | 67,9 tok/s | 23,2 GB |
| mixed_int4 ekv4096 | CPU (8 hilos) | 115 tok/s | 7,59 tok/s | 6,9 GB |

Precisión en la evaluación del autor (12 preguntas y un chat de tres turnos, greedy, frente a los pesos bf16 de NVIDIA):

| Thinking | Artefactos LiteRT (CPU y GPU) | Modelo fuente |
|---|---|---|
| Activado | 12/12 correctas; Kenji, 391 | no ejecutado |
| Desactivado | 11/12 correctas; Kenji, 401 (int4 en CPU: 391) | 11/12 correctas; Kenji, 401 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 22,2 GB en GPU para int4 ekv2048; 22,6 GB para mixed_int4 ekv2048; 23,2 GB para mixed_int4 ekv4096. En CPU, el pico de memoria residente es de 4,4 a 6,9 GB según artefacto.
- GPU recomendadas: Apple M4 Max (medido). No se dispone de datos para A100, H100 o RTX 4090 en la información proporcionada.
- GPU de consumo: cabe en GPUs con al menos 24 GB de memoria si el backend soporta WebGPU con ese tamaño de artefacto; no verificado en la información disponible.
- Despliegue: LiteRT-LM 0.19.1. CPU mediante `pip install litert-lm==0.19.1`; GPU mediante la herramienta `litert_lm_advanced_main` compilada desde fuente con Bazel (v0.19.1, commit 7a03724) y las bibliotecas `libwebgpu_dawn.dylib` y `libGemmaModelConstraintProvider.dylib`.
- Latencia y throughput: ver tabla de benchmarks. El prefill en GPU ronda 815-852 tok/s y la decodificación 67,9-74,6 tok/s; en CPU el prefill es 105-115 tok/s y la decodificación 7,20-9,77 tok/s.
- Nota de runtime: es necesario desactivar la caché de GPU (`cache_dir=":nocache"` en Python, `--disable_cache=true` en CLI) porque las ejecuciones que cargaban la caché de programas GPU de una ejecución anterior respondían incorrectamente.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Formato / runtime |
|---|---|---|---|---|
| Nemotron-3-Nano-30B-A3B (esta ficha) | 30B / 3,5B | 2048 o 4096 | NVIDIA Nemotron Open Model License | .litertlm, LiteRT-LM |
| nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16 | 30B / 3,5B | no disponible | NVIDIA Nemotron Open Model License | BF16, safetensors |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento de modelos comparables de otros fabricantes con arquitectura híbrida MoE de 30B, por lo que la comparación cuantitativa queda limitada al modelo fuente en BF16.

## Limitaciones y advertencias

- El estado de Mamba-2 no se reinicia entre conversaciones: es obligatorio crear un Engine por conversación (issue LiteRT-LM #3165). Reutilizar el Engine contamina el contexto entre diálogos.
- Tras un mensaje que desborda la ventana de contexto, todos los mensajes posteriores de esa conversación fallan con `Task failed with state: 7`; hay que iniciar una conversación nueva.
- Las llamadas a herramientas se devuelven como texto en formato `<tool_call>`, no como objetos estructurados; el integrador debe parsearlas.
- Las respuestas largas con `send_message` bloqueante que sigan generando tras 10 minutos fallan con `DEADLINE_EXCEEDED`; usar `send_message_async` o limitar `max_output_tokens`.
- La ventana de contexto es reducida (2048 o 4096 tokens) en comparación con modelos actuales de 128K o más, lo que limita casos de uso con documentos extensos.
- Solo se declaran seis idiomas (en, es, fr, de, ja, it); no hay soporte declarado para otros.
- El backend GPU de LiteRT-LM 0.18.0 solo soporta la activación 'gelu' en la operación `moe`; la versión 0.19.1 es requisito para este modelo.
- La licencia NVIDIA Nemotron Open Model License es distinta de las licencias Apache 2.0 o MIT; es necesario revisar sus términos antes de uso comercial.
- No se han publicado datos sobre sesgos, tasa de alucinación ni evaluaciones de seguridad en la información disponible.
- La cuantización int4 puede degradar la precisión en tareas distintas a las evaluadas; la evaluación del autor se limita a 12 preguntas y un chat de tres turnos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/Nemotron-3-Nano-30B-A3B
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Mediciones detalladas: https://huggingface.co/litert-community/Nemotron-3-Nano-30B-A3B/blob/main/MEASUREMENTS.md
- LiteRT-LM (Google AI Edge): https://github.com/google-ai-edge/LiteRT-LM
- Issue de reinicio de estado Mamba-2: https://github.com/google-ai-edge/LiteRT-LM/issues/3165
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Paper referenciado (arXiv:2512.20848): https://arxiv.org/abs/2512.20848

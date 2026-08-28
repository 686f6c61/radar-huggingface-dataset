# Null-Byte/PhoneLLM-alpha-1-Q4_K_M

## Resumen

PhoneLLM Alpha 1 es un modelo de lenguaje de codigo abierto desarrollado por el equipo de Pipecat (Daily) especificamente para agentes de voz telefonica en tiempo real. Se trata de un fine-tuning completo del modelo NVIDIA Nemotron 3 Nano 30B-A3B, entrenado con el framework NeMo de NVIDIA. El modelo esta disenado para gestionar conversaciones multi-turno de baja latencia en escenarios de atencion al cliente, tanto entrantes como salientes.

Este repositorio contiene una cuantizacion Q4_K_M del modelo original, calibrada con imatrix sobre un subconjunto de C4 en ingles (~101k tokens), con una perplejidad de 13.77 ± 0.15. El archivo resultante pesa 22.83 GB y es compatible con llama.cpp (version b10673 o superior), lo que permite ejecutarlo en GPUs de consumo con 24 GB o mas de VRAM. Su arquitectura hibrida Mamba-Transformer con mezcla de expertos (MoE) de 3.5B parametros activos ofrece un equilibrio entre rendimiento y coste computacional.

La relevancia de este modelo radica en que esta pensado para un caso de uso muy concreto: agentes de voz telefonica. Segun sus desarrolladores, rinde de forma comparable a GPT 5.6 Terra en estas tareas especificas, pero con un coste un 94% inferior y una latencia P95 de time-to-first-token 1300 ms menor. La licencia BSD-2-Clause permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba-Transformer MoE (NemotronH) |
| Parametros totales | 31.577.940.288 (~30B) |
| Parametros activos | 3.5B |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q4_K_M (con imatrix) |
| Idiomas soportados | Ingles |
| Licencia | BSD-2-Clause (derivado de NVIDIA Nemotron Open Model License) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

PhoneLLM Alpha 1 es un fine-tuning completo del modelo NVIDIA Nemotron 3 Nano 30B-A3B, que emplea una arquitectura hibrida que combina capas Mamba (state space model) con capas Transformer de atencion completa, organizadas en una estructura de mezcla de expertos (MoE). De los aproximadamente 30B parametros totales, solo 3.5B estan activos por token, lo que permite una inferencia rapida y economica. El entrenamiento se realizo con el framework NeMo de NVIDIA.

El modelo base Nemotron 3 Nano 30B-A3B es una arquitectura relativamente reciente que integra capas de atencion selectiva tipo Mamba junto con atencion Transformer tradicional, reduciendo el coste del KV cache y mejorando la eficiencia en contextos largos. El fine-tuning de PhoneLLM esta orientado a tareas de agente de voz: conversacion multi-turno, uso de herramientas y llamadas a funciones, con una recomendacion explicita de usar temperatura 0 (decodificacion greedy) y thinking desactivado.

La cuantizacion Q4_K_M de este repositorio sigue el esquema de precision mixta: los pesos FFN de los expertos enrutados y las proyecciones Q/K de atencion se cuantizan a q4_k, mientras que embeddings, cabeza de salida y proyecciones V se mantienen en q6_k; las normas de capa y el router/gate permanecen en f16.

## Capacidades

- Generacion de texto conversacional para agentes de voz en tiempo real.
- Soporte de tool calling y function calling para integracion con APIs y servicios externos.
- Gestion de conversaciones multi-turno con contexto largo (hasta 262.144 tokens).
- Disenado para tareas de atencion al cliente entrante y saliente en sectores como finanzas, salud, retail y hosteleria.
- Inferencia de baja latencia gracias a la arquitectura MoE con 3.5B parametros activos.
- Integracion nativa con el framework Pipecat para pipelines de voz (STT + LLM + TTS).
- Compatible con llama.cpp, lo que permite despliegue en CPU, CUDA y Vulkan.

## Casos de uso

- Atencion al cliente telefonica entrante: el modelo puede gestionar conversaciones completas con clientes que llaman a un centro de soporte, resolviendo consultas frecuentes, derivando a agentes humanos cuando es necesario y manteniendo el contexto de la llamada gracias a su ventana de 262K tokens.
- Agentes de llamadas salientes: permite automatizar llamadas de seguimiento, recordatorios de citas o encuestas de satisfaccion, con capacidad de entender respuestas del interlocutor y adaptar el guion en consecuencia.
- Triaje medico por telefono: en entornos sanitarios, puede realizar una primera evaluacion de sintomas, hacer preguntas de seguimiento relevantes y recomendar el nivel de atencion adecuado, usando function calling para registrar datos en un EHR.
- Gestion de reservas en hosteleria: puede gestionar reservas de restaurantes u hoteles por telefono, consultando disponibilidad en tiempo real mediante tool calling y confirmando los detalles con el cliente.
- Soporte tecnico de primer nivel: puede diagnosticar problemas comunes, guiar al usuario por pasos de solucion y escalar a un tecnico humano si el problema persiste, manteniendo el historial completo de la conversacion.
- Verificacion de identidad y seguridad: en banca o servicios financieros, puede realizar procesos de verificacion KYC por telefono, haciendo preguntas de seguridad y validando respuestas mediante integraciones con sistemas backend.
- Asistente de ventas por telefono: puede cualificar leads, presentar productos o servicios y programar citas de seguimiento, adaptando el discurso segun las respuestas del interlocutor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

Los datos de rendimiento proporcionados por el equipo de Pipecat indican que PhoneLLM Alpha 1 rinde de forma comparable a GPT 5.6 Terra en tareas de agente de voz, con un coste un 94% inferior y una latencia P95 de time-to-first-token 1300 ms menor. No se detallan las metricas exactas ni la metodologia de evaluacion.

La cuantizacion Q4_K_M presenta una perplejidad de 13.77 ± 0.15 sobre el subconjunto de calibracion C4 en ingles (~101k tokens).

## Requisitos de hardware

- VRAM minima recomendada: ~25 GB combinados (por ejemplo, RTX 4090 + RTX 3080, o una unica A100/H100).
- GPU recomendadas: RTX 4090 (24 GB), RTX 3080 (10 GB), A100, H100.
- Cabe en GPU de consumo con 24 GB+ de VRAM en configuracion single-GPU con contexto reducido (131K tokens).
- RAM: 64 GB+ recomendados para carga del modelo con `--no-mmap`.
- Runtime: llama.cpp version b10673 o superior (CUDA, Vulkan o CPU).
- Opciones de despliegue: llama-server, llama.cpp, integrable con Pipecat para pipelines de voz.
- Para configuraciones con VRAM limitada, se puede usar `--cpu-moe` para descargar los expertos enrutados a RAM del sistema, manteniendo atencion y expertos compartidos en GPU.
- KV cache: ~2.5 GB a q8_0 con contexto completo (solo ~20 de 52 capas son de atencion completa).

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| PhoneLLM Alpha 1 (Q4_K_M) | 30B | 3.5B | 262K | BSD-2-Clause | Agente de voz telefonica |
| NVIDIA Nemotron 3 Nano 30B-A3B | 30B | 3.5B | 262K | NVIDIA Nemotron Open Model License | Modelo base generalista |
| GPT 5.6 Terra | No disponible | No disponible | No disponible | Propietaria | Generalista (referencia de rendimiento) |

La comparativa directa con otros modelos de la misma categoria (agentes de voz de codigo abierto) no esta disponible en la informacion proporcionada. El modelo base Nemotron 3 Nano 30B-A3B es la referencia natural para evaluar el impacto del fine-tuning.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente en ingles; no soporta otros idiomas de forma nativa.
- Se recomienda encarecidamente usar temperatura 0 (decodificacion greedy) y desactivar el modo thinking, ya que el modelo fue entrenado con esa configuracion.
- La cuantizacion Q4_K_M puede introducir una degradacion de calidad respecto al modelo en BF16, especialmente en tareas que requieren precision numerica alta.
- Riesgo de alucinacion inherente a todos los modelos de lenguaje; en entornos de atencion al cliente, se recomienda validar informacion critica (precios, politicas, datos medicos) contra fuentes externas.
- El modelo no es multimodal: requiere pipelines externos de transcripcion (STT) y sintesis de voz (TTS) para funcionar como agente de voz completo.
- La licencia BSD-2-Clause del fine-tuning no exime de cumplir los terminos de la licencia NVIDIA Nemotron Open Model License del modelo base.
- Para produccion, se requiere gestion cuidadosa del contexto largo: aunque el modelo soporta 262K tokens, el coste computacional crece con la longitud de la conversacion.
- El rendimiento en tareas generales fuera del dominio de agente de voz no ha sido evaluado ni garantizado.

## Enlaces

- Repositorio GGUF cuantizado: https://huggingface.co/Null-Byte/PhoneLLM-alpha-1-Q4_K_M
- Modelo base PhoneLLM Alpha 1: https://huggingface.co/pipecat-ai/phonellm-alpha-1
- Modelo base Nemotron 3 Nano 30B-A3B: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B-BF16
- Cuantizacion de referencia ggml-org: https://huggingface.co/ggml-org/NVIDIA-Nemotron-3-Nano-30B-A3B-GGUF
- Framework Pipecat: https://www.pipecat.ai/
- Daily (desarrollador): https://www.daily.co/
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Guia de offload MoE para llama.cpp: https://gist.github.com/DocShotgun/a02a4c0c0a57e43ff4f038b46ca66ae0
- Entrevista en ThursdAI sobre el lanzamiento: https://thursdai.news/guests/kwindla/aug-27-2026

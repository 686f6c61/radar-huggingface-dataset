# julianmb/Qwen-3.8-27B-ROCmFP4-FAST-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF del modelo Qwen 3.8 27B, denominada **ROCmFP4_FAST**, desarrollada por julianmb y optimizada específicamente para APUs AMD Strix Halo (Ryzen AI Max+ 395 / Radeon 8060S, arquitectura RDNA 3.5 / gfx1151). El objetivo es ejecutar un modelo de 27 mil millones de parámetros en hardware de consumo integrado, alcanzando velocidades de generación de hasta 36 tokens por segundo mediante la combinación de cuantización FP4 por bloques, decodificación especulativa MTP (Multi-Token Prediction) y caché KV asimétrica TurboQuant.

El modelo base es Qwen 3.8 27B, un transformer de la familia Qwen 3 con licencia Apache 2.0 y soporte bilingüe inglés/chino. Esta versión cuantizada reduce los pesos a 4.26 bits por peso efectivos (13.55 GiB), lo que permite ejecutar el modelo completo en la memoria unificada de la APU. La relevancia de esta publicación radica en que demuestra que es posible ejecutar LLMs de gran tamaño en dispositivos portátiles sin GPU discreta, siempre que se utilice un backend adaptado a las instrucciones cooperativas de RDNA 3.5.

Es importante señalar que esta cuantización **no es compatible con llama.cpp estándar ni con Ollama**; requiere un fork específico del motor con soporte ROCmFPX (pinned build `e87d53e (213)`), disponible en el repositorio GitHub asociado. No se han publicado benchmarks de calidad (MMLU, HumanEval, etc.) para esta versión cuantizada, solo métricas de rendimiento de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3, detalles internos no disponibles) |
| Parametros totales | 27.320.697.856 (27.32B) |
| Parametros activos | no disponible |
| Longitud de contexto | Hasta 262.000 tokens (segun tabla de memoria; el modelo base soporta contexto largo) |
| Tipos de cuantizacion | ROCmFP4_FAST (4.26 bpw, 13.55 GiB); caché KV asimétrica TurboQuant (q8_0 + turbo4) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors original en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es Qwen 3.8 27B, un transformer de la familia Qwen 3 desarrollado por Alibaba. No se dispone de información detallada sobre si emplea arquitectura densa o MoE, ni sobre el número de tokens de entrenamiento o la composición del dataset. El repositorio actual no contiene el modelo original, sino una cuantización posterior realizada por julianmb, por lo que los datos de entrenamiento no son relevantes aquí.

La innovación técnica de esta versión reside en el proceso de cuantización y optimización para hardware RDNA 3.5:

- **ROCmFP4 block quantization**: esquema de cuantización FP4 por bloques diseñado para aprovechar las instrucciones de matrices cooperativas (`KHR_coopmat`) de la GPU integrada.
- **MTP (Multi-Token Prediction) speculative decoding**: el modelo predice varios tokens a la vez, acelerando la decodificación sin pérdida de calidad en modo greedy.
- **Asymmetric TurboQuant KV cache**: cuantización de la caché KV con diferentes precisiones para clave y valor, reduciendo el uso de memoria.
- **Integración con Mesa RADV Wave64**: uso del driver Vulkan de código abierto con optimizaciones específicas.

Estas técnicas en conjunto permiten multiplicar por 2.94× la velocidad de generación respecto al modelo sin asistencia especulativa.

## Capacidades

- Generación de texto en inglés y chino, con soporte de conversación multi-turno.
- Razonamiento y comprensión de lenguaje natural heredados del modelo base Qwen 3.8 (no verificados en esta cuantización).
- Posible generación de código y matemáticas, aunque no se han publicado evaluaciones específicas para esta versión.
- Sin capacidades de visión, audio o multimodalidad: es un modelo de texto puro.
- No se ha confirmado soporte de tool calling o function calling en esta cuantización; dependerá de las capacidades del modelo base y de la configuración del servidor.

## Casos de uso

- **Asistente local en portátil o mini-PC con APU Strix Halo**: ejecutar un LLM de 27B sin conexión a internet, con velocidades de 30-36 tok/s, ideal para entornos donde la privacidad es crítica.
- **Servidor de inferencia local con API OpenAI-compatible**: el repositorio incluye un lanzador de servidor (`run_server.sh`) que expone una API REST, permitiendo integrar el modelo en aplicaciones existentes.
- **Procesamiento de documentos largos**: con contexto de hasta 262K tokens, puede analizar libros completos, contratos o historiales de conversación extensos en una sola pasada.
- **Chat bilingüe inglés-chino**: adecuado para aplicaciones de traducción o asistencia en entornos multilingües, gracias a su soporte nativo de ambos idiomas.
- **Prototipado y desarrollo en hardware AMD**: permite a desarrolladores probar aplicaciones de IA generativa en equipos con APU RDNA 3.5 sin necesidad de GPU dedicada.
- **Investigación en decodificación especulativa**: el repositorio incluye herramientas para medir y ajustar parámetros MTP, útil para estudiar el rendimiento de esta técnica en hardware integrado.

## Benchmarks y rendimiento

Los únicos benchmarks publicados son métricas de rendimiento de inferencia medidos en un AMD Ryzen AI Max+ 395 (40 CU Radeon 8060S @ 2.9 GHz, 128 GB LPDDR5X-8000 @ 273 GB/s, Linux 7.0, Mesa 26.0 RADV). No se han publicado resultados de calidad (MMLU, HumanEval, GSM8K, etc.) para esta cuantización.

| Perfil de optimizacion | Tamano del modelo | Decodificacion sin asistencia | Decodificacion especulativa MTP | Speedup vs baseline | TTFT (prompt eval) |
|---|---|---|---|---|---|
| Stock `Q4_K_M` (baseline) | 15.92 GiB | 12.27 tok/s | N/A | 1.00× | 526.7 ms |
| **`ROCmFP4_FAST` (este modelo)** | **13.55 GiB** | **14.02 tok/s** | N/A | 1.14× | 468.3 ms |
| **`ROCmFP4_FAST` + Strict Greedy MTP** | **13.55 GiB** | 14.02 tok/s | **34.82 tok/s** | **2.84×** | 442.8 ms |
| **`ROCmFP4_FAST` + MTP (`n6/p0.60`)** | **13.55 GiB** | 14.02 tok/s | **30.56 – 34.82 tok/s** | **2.50× – 2.84×** | 439.4 ms |
| **`ROCmFP4_FAST` + Deep Spec (`n7/p0.35`)** | **13.55 GiB** | 14.02 tok/s | **36.04 tok/s** | **2.94×** | 445.8 ms |

Datos del model-index oficial:

| Metrica | Valor |
|---|---|
| Peak Speculative Decode Speed | 36.04 tok/s |
| Strict Lossless Greedy MTP Speed | 34.82 tok/s |
| Base Unassisted Decode Speed | 14.02 tok/s |
| Prompt Evaluation Latency (TTFT) | 439.4 ms |
| Effective Bits Per Weight | 4.26 bpw |

## Requisitos de hardware

- **Hardware objetivo**: APU AMD Strix Halo (gfx1151), específicamente Ryzen AI Max+ 395 con Radeon 8060S (40 CU). No funciona en GPUs NVIDIA ni en APUs AMD de generaciones anteriores sin soporte de matrices cooperativas RDNA 3.5.
- **Memoria**: depende del contexto configurado (modelo + caché KV TurboQuant):
  - 8K tokens: 14.17 GiB totales
  - 32K tokens: 16.00 GiB totales
  - 64K tokens: 18.45 GiB totales
  - 128K tokens: 23.35 GiB totales
  - 262K tokens (máximo): 33.63 GiB totales
- **GPU**: integrada en la APU; no requiere GPU discreta.
- **Backend**: fork de llama.cpp con soporte ROCmFPX (pinned build `e87d53e (213)`). No compatible con llama.cpp estándar ni Ollama.
- **Opciones de despliegue**: `llama-server` (API OpenAI-compatible), script `quickstart.sh` para arranque rápido, TUI de chat (`chat_tui.py`), orquestador NPU drafter.
- **Latencia**: TTFT de 439 ms con contexto de entrada típico; throughput de 14 tok/s sin especulación y hasta 36 tok/s con MTP.

## Comparativa con modelos similares

No se dispone de comparativas externas con otros modelos cuantizados en el mismo hardware. La única comparación disponible es interna, entre esta cuantización y la versión stock `Q4_K_M` del mismo modelo base, que se muestra en la tabla de benchmarks. Esta cuantización ofrece un 14% más de velocidad en decodificación sin asistencia y hasta un 194% más con MTP, además de un 15% menos de tamaño (13.55 GiB vs 15.92 GiB).

Para comparar con otros modelos de 27B (p. ej., Llama 3.1 8B o Mistral 7B) se necesitarían benchmarks de calidad, que no se han publicado. Por tanto, la comparativa se limita a la tabla de rendimiento anterior.

## Limitaciones y advertencias

- **Dependencia de hardware específico**: requiere APU AMD Strix Halo (gfx1151) con soporte de matrices cooperativas RDNA 3.5. No funcionará en GPUs NVIDIA, Intel ni AMD de generaciones anteriores.
- **Backend propietario**: necesita un fork de llama.cpp con soporte ROCmFPX; el uso con herramientas estándar (llama.cpp upstream, Ollama) fallará.
- **Cuantización FP4**: la precisión de 4.26 bpw puede degradar la calidad de salida respecto al modelo original en tareas que requieren alta fidelidad (matemáticas complejas, código).
- **Idiomas limitados**: solo inglés y chino; no se garantiza buen rendimiento en otros idiomas.
- **Sin benchmarks de calidad**: no se han publicado resultados de MMLU, HumanEval u otras evaluaciones, por lo que no se puede verificar el impacto de la cuantización en tareas específicas.
- **Licencia**: Apache 2.0 para esta cuantización, pero el modelo base Qwen 3.8 27B puede tener términos adicionales; se recomienda revisar la licencia del modelo original para uso comercial.
- **Configuración avanzada**: el uso de MTP requiere ajuste de parámetros (`--spec-draft-n-max`, `--spec-draft-p-min`); una configuración incorrecta puede reducir el rendimiento o provocar fallos.

## Enlaces

- Repositorio HuggingFace: [julianmb/Qwen-3.8-27B-ROCmFP4-FAST-GGUF](https://huggingface.co/julianmb/Qwen-3.8-27B-ROCmFP4-FAST-GGUF)
- Repositorio GitHub (código de despliegue y construcción): [github.com/julianmb/q38rocm](https://github.com/julianmb/q38rocm)
- Modelo base en HuggingFace: [Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B) (referencia; no se ha verificado su existencia en la información proporcionada)

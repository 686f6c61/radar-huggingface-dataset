# kingjones777/Qwen3.8-Flash-Next-Uncensored-ROCmFP4-FAST-GGUF

## Resumen

Qwen3.8-Flash-Next-Uncensored-ROCmFP4-FAST-GGUF es un artefacto de investigación creado por kingjones777 que cuantiza el checkpoint BF16 abliterado de orcarouter/Qwen3.8-Flash-Next-Uncensored, a su vez derivado del modelo base Qwen/Qwen3.8-Flash-Next de Alibaba. Se trata de un modelo de lenguaje multimodal de arquitectura MoE (mixture of experts) con 176.9 mil millones de parámetros totales, de los cuales solo 6 mil millones se activan por token, complementado con una tabla de embeddings N-gram de 51 mil millones de parámetros. El modelo soporta una ventana de contexto nativa de 262.144 tokens y está diseñado para ejecutarse en hardware AMD con ROCm, específicamente en la APU Ryzen AI Max+ 395 (gfx1151).

La relevancia de esta versión concreta radica en dos aspectos: primero, es una cuantización ROCmFP4 (4.27 bpw) que reduce el tamaño a 87.94 GiB, permitiendo su ejecución completa en memoria unificada de 128 GB; segundo, elimina los mecanismos de rechazo (refusal) del modelo original mediante abliteración, lo que lo convierte en un modelo "uncensored" para fines de investigación. Requiere un fork específico de llama.cpp (ROCmFPX con PR #27742) y no es compatible con builds estándar ni con GPUs NVIDIA. El autor reporta velocidades de generación de 22.4 tok/s y procesamiento de prompt de 225 tok/s en el hardware objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) con PLE (N-gram embeddings), basada en Qwen4 |
| Parametros totales | 176.943.899.520 (176.9B) |
| Parametros activos | 6B por token |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | Q4_0_ROCMFP4 (4.251 bpw) para la mayoria de tensores; Q6_K para el lm head |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | GGUF (sharded en 3 archivos + mmproj para vision) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next emplea una arquitectura MoE con 125 mil millones de parámetros principales y 51 mil millones adicionales en embeddings N-gram (PLE, per-layer token embeddings), activando solo 6 mil millones de parámetros por token. Segun la documentacion oficial de Qwen, esta arquitectura reduce el coste de entrenamiento a aproximadamente 1/9 respecto a Qwen3.7-Plus, manteniendo o mejorando capacidades en tareas de codificacion y ofimatica. El modelo es multimodal, con una torre de vision integrada (el archivo mmproj incluido en el repo).

La version cuantizada aqui descrita aplica el esquema ROCmFP4 de 4 bits en todos los tensores principales: pesos de los expertos MoE, expertos compartidos, atencion, tabla PLE y embeddings de tokens. Solo el lm head (output.weight) se mantiene en Q6_K, porque cada token muestreado pasa por el, y su error de cuantizacion afecta directamente al argmax. El proceso de abliteracion (eliminacion de comportamientos de rechazo) fue realizado por orcarouter sobre los pesos BF16 originales; kingjones777 solo convirtio y cuantizo el checkpoint resultante. No se dispone de informacion detallada sobre el dataset de entrenamiento del modelo base ni sobre el uso de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento avanzado, con soporte de modo thinking (segun la documentacion de Qwen para la serie Flash-Next).
- Codificacion de software de alto nivel, incluyendo tareas de agentic coding (el modelo supera a Claude-4.6-Opus en benchmarks internos de Qwen).
- Capacidades multimodales: procesamiento de imagenes mediante la torre de vision (mmproj incluido).
- Ventana de contexto larga de 262.144 tokens, con degradacion suave en prompts muy extensos (200k tokens reducen la generacion a ~10.5 tok/s pero no fallan).
- Soporte de tool calling y function calling (segun las capacidades del modelo base Qwen3.8-Flash-Next).
- Multilingue (idiomas no especificados en la informacion disponible).
- Comportamiento "uncensored": no presenta rechazos ante solicitudes daninas (22 de 24 prompts harmful obtienen cumplimiento, frente a 0 en la version alineada).

## Casos de uso

- Investigacion en seguridad y alineacion de modelos: permite estudiar el comportamiento de un modelo sin guardrails, comparando respuestas con la version alineada para analizar el impacto de la abliteracion en la calidad y la seguridad.
- Desarrollo de aplicaciones de generacion de codigo en entornos locales: con 6B parametros activos y 22.4 tok/s de generacion, puede integrarse en flujos de trabajo de desarrollo asistido por IA en equipos con APU AMD Strix Halo, sin necesidad de GPU discreta.
- Procesamiento de documentos extensos: la ventana de 262k tokens permite analizar codebases completos, contratos legales o expedientes tecnicos en una sola pasada, con un coste de memoria casi constante gracias a la atencion sparse de Qwen.
- Prototipado de agentes conversacionales sin restricciones: util para experimentar con dialogos abiertos en entornos controlados de investigacion, donde se requiere explorar respuestas sin filtros de contenido.
- Evaluacion de cuantizaciones ROCmFP4: sirve como referencia para medir el impacto de la cuantizacion de 4 bits en la calidad de salida, comparando con el checkpoint BF16 original.
- Despliegue de servicios de inferencia local en hardware AMD: con llama-server y el fork ROCmFPX, puede servir peticiones HTTP en localhost para aplicaciones de prueba, aprovechando la memoria unificada de la APU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card incluye unicamente mediciones de rendimiento de inferencia en el hardware objetivo (Ryzen AI MAX+ 395, gfx1151, ROCm 7.2.4, full offload):

| Metrica | Valor |
|---|---|
| Generacion (prompt corto) | 22.4 tok/s (mediana de 3) |
| Prompt processing (prompt corto) | 225 tok/s |
| GPU memory residente | 63.3 GiB |
| Generacion con contexto 131k (prompt 111k) | 15.33 tok/s |
| Generacion con contexto 262k (prompt 8k) | 22.48 tok/s |
| Generacion con contexto 262k (prompt 200k) | 10.46 tok/s |
| Prompt processing con contexto 262k (prompt 200k) | 128 tok/s |

Tambien se reportan resultados de pruebas de rechazo/calidad comparando la version alineada con esta:

| Prueba | Version alineada | Esta version |
|---|---|---|
| Prompts daninos (24) | 0 cumplen | 22 cumplen |
| Prompts inofensivos (12) | 10 correctos | 11 correctos |
| Pruebas de calidad (8) | 6/8 | 6/8 (mismos 2 fallos) |

## Requisitos de hardware

- VRAM estimada: 63.3 GiB de memoria GPU residente con full offload (49/49 capas) en la APU Ryzen AI MAX+ 395 con 128 GB de memoria unificada.
- GPU recomendada: exclusivamente AMD con arquitectura gfx1151 (Strix Halo). No es compatible con GPUs NVIDIA ni con otras arquitecturas AMD sin soporte ROCmFP4.
- Requiere ROCm 7.2.4 o superior y el fork ROCmFPX de llama.cpp con el PR #27742 fusionado. Los builds estandar de llama.cpp no cargan este modelo.
- No cabe en GPUs de consumo convencionales (RTX 4090, etc.) por el formato ROCmFP4 y el tamano del modelo; esta pensado para APUs con memoria unificada de al menos 128 GB.
- Opciones de despliegue: llama-server (del fork ROCmFPX) con `--n-gpu-layers 999`, `--flash-attn on`, `--ctx-size 131072` (o superior). No usar `--no-mmap` porque la tabla PLE se transmite desde el archivo a traves de la cache de paginas.
- Latencia y throughput: 22.4 tok/s de generacion y 225 tok/s de prompt processing en el hardware de referencia; con contextos muy largos (200k tokens) la generacion baja a ~10.5 tok/s.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | 176.9B (incl. PLE) | 6B | 262k | BF16 | qwen-community-1.0 | Modelo original de Qwen, con guardrails |
| orcarouter/Qwen3.8-Flash-Next-Uncensored | 176.9B | 6B | 262k | BF16 | qwen-community-1.0 | Abliterado, sin guardrails |
| Este modelo (ROCmFP4 FAST) | 176.9B | 6B | 262k | Q4_0_ROCMFP4 + Q6_K head | qwen-community-1.0 | Cuantizado, requiere ROCmFPX, sin guardrails |

No se dispone de datos de otros modelos comparables en la misma categoria (MoE multimodal de ~125B con 6B activos) en la informacion proporcionada.

## Limitaciones y advertencias

- Es un artefacto de investigacion: se han eliminado los mecanismos de rechazo, por lo que puede generar contenido danino, ilegal o eticamente problematico. No debe usarse en produccion sin control exhaustivo.
- Requiere hardware muy especifico: solo funciona en APUs AMD con gfx1151 (Strix Halo) y ROCm 7.2.4+, con el fork ROCmFPX de llama.cpp. No es portable a otras plataformas.
- La cuantizacion ROCmFP4 de 4 bits puede degradar la calidad en tareas de alta precision, aunque el autor reporta que la calidad se mantiene en las pruebas realizadas (6/8 en pruebas de calidad, mismos fallos que la version alineada).
- La licencia qwen-community-1.0 puede imponer restricciones de uso comercial; es necesario revisar los terminos exactos antes de cualquier despliegue.
- El modelo no incluye informacion sobre idiomas soportados; se asume multilingue por el modelo base, pero no esta verificado en esta version.
- Riesgo de alucinacion inherente a los modelos de lenguaje, posiblemente amplificado por la cuantizacion y la ausencia de guardrails.
- El uso de `--no-mmap` provoca OOM-kill del proceso; es obligatorio usar mmap para la tabla PLE.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/kingjones777/Qwen3.8-Flash-Next-Uncensored-ROCmFP4-FAST-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Checkpoint abliterado (BF16): https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Repositorio GitHub de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next
- Documentacion de ejecucion local (unsloth): https://unsloth.ai/docs/models/qwen3.8-next
- Pagina de Qwen3.8-Flash en QwenCloud: https://www.qwencloud.com/models/qwen3.8-flash
- Discusiones del modelo en HuggingFace: https://huggingface.co/kingjones777/Qwen3.8-Flash-Next-ROCmFP4-FAST-GGUF/discussions

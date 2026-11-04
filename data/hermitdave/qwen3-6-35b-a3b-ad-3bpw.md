# hermitdave/Qwen3.6-35B-A3B-AD-3bpw

## Resumen

Qwen3.6-35B-A3B-AD-3bpw es una cuantizacion mixta de precision del modelo Qwen3.6-35B-A3B desarrollada por Qwen Team, publicada por el usuario hermitdave en HuggingFace. El modelo original es un transformer causal con vision encoder de arquitectura MoE (Mixture of Experts) que activa 3B de sus 35B parametros totales, disenado para cargas de trabajo de codigo agentico y conversacion con contexto muy largo. Esta version concreta aplica la tecnica "AD ladder" (reglas de cuantizacion mixta basadas en reglas de AtomicChat) para comprimir el modelo a aproximadamente 3 bits por peso, reduciendo el peso en disco de 67 GB en BF16 a 16 GB, con el objetivo de ejecutarlo en Apple Silicon mediante MLX.

La relevancia de esta ficha radica en que permite ejecutar un modelo de 35B parametros con contexto nativo de 262.144 tokens en hardware de consumo Apple, algo impensable con los pesos originales. La cuantizacion AD ladder asigna 2 bits a los expertos gate/up, 3 bits a los expertos down, 8 bits al resto de tensores y BF16 a las normas y sesgos, buscando un equilibrio entre tamano y calidad.

El modelo base Qwen3.6-35B-A3B es la primera variante open-weight de la serie Qwen3.6, lanzada tras la serie Qwen3.5, y prioriza estabilidad y utilidad real en flujos de desarrollo de software, con mejoras notables en codificacion agentica y preservacion del razonamiento entre turnos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, MoE con capas Gated DeltaNet (linear attention) y Gated Attention |
| Parametros totales | 35B |
| Parametros activos | 3B (8 expertos enrutados + 1 compartido de 256) |
| Longitud de contexto | 262.144 tokens nativo, extensible hasta 1.010.000 |
| Tipos de cuantizacion | ~3 bpw (2-bit expertos gate/up, 3-bit expertos down, 8-bit resto, BF16 normas/conv1d/A_log/dt_bias) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors cuantizados, libreria mlx) |

## Arquitectura y entrenamiento

El modelo base es un transformer causal con vision encoder. Su layout de 40 capas sigue el patron 10 × (3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE)), combinando capas de atencion lineal Gated DeltaNet (32 cabezas para V, 16 para QK, dimension de cabeza 128) con capas de atencion con compuerta (16 cabezas Q, 2 KV, dimension 256, RoPE de 64). La capa MoE contiene 256 expertos con 8 enrutados y 1 compartido activados, con dimension intermedia de experto de 512. La dimension oculta es 2048, el embedding de tokens es 248.320 (padded) y el modelo fue entrenado con MTP (multi-token prediction) multi-paso. El entrenamiento incluye fases de pre-entrenamiento y post-entrenamiento, aunque la model card no detalla el numero de tokens, la composicion del dataset ni si se uso RLHF o DPO.

La innovacion de esta publicacion es la cuantizacion AD ladder: un esquema de precision mixta basado en reglas que reduce el modelo a 3 bits por peso (16 GB en disco, factor de compresion 4,2× respecto a BF16) con 702 tensores cuantizados. Segun los datos del autor, AD ladder obtiene una perplejidad ligeramente menor que RCO per-block (13,22 frente a 13,36), pero mayor divergencia KL (0,207 frente a 0,172) y menor top-1 (78,9% frente a 81,5%), partiendo de una perplejidad BF16 de 11,71.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno.
- Codificacion agentica: razonamiento a nivel de repositorio y flujos de trabajo frontend.
- Preservacion del razonamiento (thinking preservation) entre mensajes historicos para desarrollo iterativo.
- Procesamiento de vision mediante el vision encoder del modelo base.
- Contexto muy largo (262.144 tokens nativo, ampliable hasta 1.010.000) para analisis de repositorios y documentos extensos.
- Capacidades multilingues: el modelo base esta orientado a codigo multilingue (SWE-bench Multilingual); los idiomas naturales soportados no estan detallados en la informacion disponible.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Codificacion agentica en local sobre Apple Silicon: el modelo puede resolver tareas de nivel de repositorio y flujos frontend en un Mac con chip M-series, aprovechando la cuantizacion de 16 GB y el contexto largo para mantener el estado del proyecto.
- Asistente de desarrollo iterativo: la opcion de preservar el razonamiento de mensajes historicos reduce el coste de repetir contexto y acelera ciclos de refactorizacion y depuracion.
- Revision de repositorios completos: con 262.144 tokens de contexto nativo puede ingerir bases de codigo extensas y responder preguntas sobre arquitectura, dependencias o cambios.
- Generacion de codigo multilingue: el modelo base muestra 60,3 en SWE-bench Multilingual, lo que lo hace adecuado para equipos que trabajan con varios lenguajes de programacion.
- Procesamiento de documentos e imagenes: el vision encoder permite extraer informacion de capturas, diagramas o documentacion tecnica escaneada combinada con texto.
- Prototipado y demos sin GPU dedicada: al ejecutarse via MLX en Apple Silicon, sirve para entornos de desarrollo donde no hay acceso a A100/H100.
- Analisis de conversaciones largas: atencion al cliente o soporte tecnico con historiales extensos gracias a la ventana de contexto ampliable.

## Benchmarks y rendimiento

Resultados del modelo base Qwen3.6-35B-A3B publicados en la model card (no corresponden a la version cuantizada):

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | 73,4 |
| SWE-bench Multilingual | 69,3 | 51,7 | 60,3 | no disponible | no disponible |

Metricas de la cuantizacion AD ladder (3,0 bpw) frente a BF16 y RCO per-block:

| Modelo | PPL | KL | top-1 |
|---|---|---|---|
| BF16 | 11,71 | — | — |
| RCO (per-block) | 13,36 | 0,172 | 81,5% |
| AD ladder | 13,22 | 0,207 | 78,9% |

## Requisitos de hardware

- VRAM/RAM unificada estimada: 16 GB de pesos en disco; se recomienda al menos 18-20 GB de memoria unificada para inferencia comoda con contexto moderado.
- Hardware objetivo: Apple Silicon (M1/M2/M3/M4) con memoria unificada suficiente; la libreria es MLX, no compatible de forma nativa con CUDA.
- En GPU consumer NVIDIA no es directamente utilizable sin conversion a otro formato (GGUF, etc.), que no se proporciona en este repo.
- Despliegue: mlx_lm (load/generate), MLX; no se mencionan vLLM, llama.cpp, Ollama ni TGI para esta variante cuantizada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (esta version AD-3bpw) | 35B totales / 3B activos | 262.144 (hasta 1.010.000) | 73,4 (base) | Apache-2.0 | HuggingFace, MLX |
| Qwen3.5-35BA3B | 35B totales / 3B activos | no disponible | 70,0 | no disponible | HuggingFace |
| Qwen3.5-27B | 27B | no disponible | 75,0 | no disponible | HuggingFace |
| Gemma4-31B | 31B | no disponible | 52,0 | no disponible | HuggingFace |
| Gemma4-26BA4B | 26B totales / 4B activos | no disponible | 17,4 | no disponible | HuggingFace |

## Limitaciones y advertencias

- La cuantizacion a ~3 bpw degrada la calidad: la perplejidad sube de 11,71 (BF16) a 13,22 y el top-1 cae hasta 78,9%, con mayor divergencia KL que la alternativa RCO.
- Solo es ejecutable con MLX en Apple Silicon; no hay pesos GGUF ni safetensors estándar para CUDA en este repositorio.
- Los benchmarks mostrados corresponden al modelo base sin cuantizar; el rendimiento real de esta version de 3 bits sera inferior.
- La model card no detalla sesgos, composicion del dataset de entrenamiento ni idiomas naturales soportados, lo que limita la evaluacion de riesgos.
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado por la cuantizacion agresiva en los expertos.
- Aunque la licencia es Apache-2.0 y permite uso comercial, conviene verificar las condiciones del modelo base Qwen3.6-35B-A3B y de las reglas AD ladder de AtomicChat.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion comunitaria del artefacto.
- No se dispone de informacion sobre soporte de tool calling ni sobre el comportamiento multilingue en idiomas naturales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hermitdave/Qwen3.6-35B-A3B-AD-3bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Blog de Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Qwen Chat: https://chat.qwen.ai

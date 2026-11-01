# jacobmorrison/qwen3.6-35b-a3b-miles-r2-k1mix

## Resumen

Qwen3.6-35B-A3B es un modelo de lenguaje causal multimodal (texto e imagen) desarrollado por el equipo Qwen de Alibaba. Se trata de la primera variante de pesos abiertos de la serie Qwen3.6, construida sobre la arquitectura de la generacion anterior Qwen3.5 y orientada explicitamente a flujos de trabajo de codigo agentico y razonamiento a nivel de repositorio. El modelo combina un transformer hibrido con capas de atencion lineal Gated DeltaNet y capas de atencion completa con gating, todo ello sobre una capa de mezcla de expertos (MoE) de 256 expertos.

La relevancia de este lanzamiento radica en su eficiencia: con 35.107 millones de parametros totales activa solo 3.000 millones por token, lo que permite desplegarlo en hardware relativamente modesto para su tamano. Ademas, incorpora una ventana de contexto nativa de 262.144 tokens, extensible hasta 1.010.000, y una modalidad de "preservacion de pensamiento" que retiene el contexto de razonamiento de mensajes anteriores para acelerar el desarrollo iterativo.

La ficha corresponde a la publicacion `jacobmorrison/qwen3.6-35b-a3b-miles-r2-k1mix`, un repositorio derivado (fine-tune o mezcla) del modelo base Qwen3.6-35B-A3B, con licencia Apache 2.0 y formato de pesos safetensors para la libreria transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido causal con vision encoder; capas Gated DeltaNet (atencion lineal) y Gated Attention, con MoE |
| Parametros totales | 35.107.181.936 |
| Parametros activos | 3B (8 expertos enrutados + 1 compartido por token) |
| Longitud de contexto | 262.144 tokens nativa; extensible hasta 1.010.000 |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo sigue un diseno de transformer hibrido con 40 capas organizadas en un patron de 10 bloques de la forma `3 x (Gated DeltaNet -> MoE) -> 1 x (Gated Attention -> MoE)`. Las capas Gated DeltaNet emplean atencion lineal con 32 cabezas para V y 16 para QK, dimension de cabeza 128; las capas Gated Attention usan 16 cabezas para Q y 2 para KV, dimension de cabeza 256 y dimension de RoPE de 64. La dimension oculta es 2048 y el embedding de tokens (padded) es de 248.320. La capa MoE contiene 256 expertos con dimension intermedia de 512, de los cuales se activan 8 enrutados mas 1 compartido por token. El modelo fue entrenado con multi-token prediction (MTP) en varios pasos y dispone de un encoder de vision para entrada image-text-to-text.

El entrenamiento consta de etapas de preentrenamiento y postentrenamiento. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas concretas de RLHF o DPO. Entre las innovaciones destacadas por el autor figuran la "preservacion de pensamiento" (retencion del contexto de razonamiento de mensajes historicos) y mejoras en codificacion agentica para flujos de frontend y razonamiento a nivel de repositorio.

## Capacidades

- Generacion de texto y razonamiento general en modo conversacional multi-turno.
- Comprension de imagenes y texto combinados (pipeline image-text-to-text) mediante vision encoder.
- Codificacion agentica: resolucion de tareas de repositorio, flujos de frontend y edicion de codigo multi-paso.
- Preservacion de pensamiento: retiene el razonamiento de mensajes previos para desarrollo iterativo.
- Capacidades multilingues: no disponibles de forma explicita en la informacion proporcionada; los benchmarks incluyen SWE-bench Multilingual.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: respaldadas por los resultados en SWE-bench y Terminal-Bench.
- Compatibilidad de despliegue con transformers, vLLM, SGLang y KTransformers.

## Casos de uso

- Reparacion automatica de incidencias en repositorios: el modelo puede recibir un issue y el arbol del repositorio y proponer un parche, apoyandose en su contexto de 262.144 tokens para abarcar multiples ficheros y en su entrenamiento especifico para SWE-bench.
- Asistencia de codigo en frontend: generacion y refactorizacion de componentes y flujos de interfaz, aprovechando la mejora declarada en codificacion agentica de frontend.
- Automatizacion de terminal y operaciones: ejecucion de tareas de linea de comandos y diagnostico de errores en entornos controlados, respaldado por resultados en Terminal-Bench 2.0.
- Desarrollo iterativo con contexto de razonamiento: la preservacion de pensamiento permite mantener el hilo de decisiones tecnicas entre turnos, reduciendo la repeticion de contexto en sesiones largas.
- Analisis de documentos tecnicos con imagenes: al ser image-text-to-text, puede procesar capturas de pantalla, diagramas o documentacion escaneada junto con texto para generar explicaciones o codigo.
- Revision de codigo a gran escala: con contexto extensible hasta 1.010.000 tokens, puede analizar repositorios completos o grandes volumentes de ficheros en una sola pasada.
- Agentes de soporte tecnico especializado: conversaciones multi-turno con contexto largo para diagnostico de incidencias y generacion de soluciones paso a paso.

## Benchmarks y rendimiento

Los datos publicados en la model card (heredados del modelo base Qwen3.6-35B-A3B) son los siguientes:

| Benchmark | Qwen3.5-27B | Gemma4-31B | Qwen3.5-35BA3B | Gemma4-26BA4B | Qwen3.6-35BA3B |
|---|---|---|---|---|---|
| SWE-bench Verified | 75,0 | 52,0 | 70,0 | 17,4 | 73,4 |
| SWE-bench Multilingual | 69,3 | 51,7 | 60,3 | 17,3 | 67,2 |
| SWE-bench Pro | 51,2 | 35,7 | 44,6 | 13,8 | 49,5 |
| Terminal-Bench 2.0 | no disponible en el extracto | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje general. Los datos de Terminal-Bench 2.0 aparecen truncados en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 70 GB solo para pesos (el repositorio ocupa 70,2 GB), por lo que se requiere una GPU de 80 GB (A100 80GB, H100 80GB) o multiples GPUs.
- Cuantizacion a 8 bits: en torno a 35-38 GB, viable en una A100 40GB o en dos RTX 4090 de 24 GB.
- Cuantizacion a 4 bits: en torno a 18-20 GB, cabe en una unica RTX 4090 (24 GB) o RTX 3090, aunque con margen ajustado para el contexto largo.
- GPU recomendadas: A100 80GB, H100 80GB, H200 para despliegue en BF16; RTX 4090 o A6000 para cuantizaciones de 4-8 bits.
- Opciones de despliegue: transformers, vLLM, SGLang y KTransformers, segun la model card. No se confirma soporte de llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. La activacion de solo 3B parametros por token deberia reducir el coste computacional frente a un modelo denso de 35B, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | SWE-bench Verified | Licencia |
|---|---|---|---|---|
| Qwen3.6-35B-A3B | 35B / 3B | 262.144 (ext. 1.010.000) | 73,4 | Apache 2.0 |
| Qwen3.5-35B-A3B | 35B / 3B | no disponible | 70,0 | no disponible |
| Qwen3.5-27B | 27B (denso) | no disponible | 75,0 | no disponible |
| Gemma4-31B | 31B (denso) | no disponible | 52,0 | no disponible |
| Gemma4-26B-A4B | 26B / 4B | no disponible | 17,4 | no disponible |

En SWE-bench Verified, Qwen3.6-35B-A3B (73,4) supera a su predecesor Qwen3.5-35B-A3B (70,0) y a Gemma4-31B (52,0), pero queda por debajo de Qwen3.5-27B (75,0). En SWE-bench Multilingual (67,2) y SWE-bench Pro (49,5) tambien mejora a Qwen3.5-35B-A3B. Los datos de contexto y licencia de los modelos comparados no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion proporcionada; se recomienda evaluacion propia antes de uso en produccion.
- Riesgo de alucinacion: inherente a los modelos generativos; no se aportan tasas de alucinacion medidas.
- Idiomas soportados: no declarados explicitamente; la cobertura multilingue solo se infiere del benchmark SWE-bench Multilingual.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base original enlazada en la model card.
- Este repositorio es una publicacion derivada de terceros (`jacobmorrison`), no la publicacion oficial de Qwen; su comportamiento puede diferir del modelo base y no cuenta con validacion oficial.
- El modelo es multimodal y requiere gestionar entradas de imagen ademas de texto, lo que anade complejidad al pipeline de despliegue.
- El contexto extensible hasta 1.010.000 tokens no esta garantizado en todas las implementaciones de inferencia; verificar soporte en vLLM/SGLang.
- No se documentan variantes cuantizadas oficiales; las estimaciones de VRAM para 4 y 8 bits son calculos teoricos, no cifras publicadas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/jacobmorrison/qwen3.6-35b-a3b-miles-r2-k1mix
- Modelo base Qwen3.6-35B-A3B (referencia en la model card): https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Blog oficial Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Qwen Chat: https://chat.qwen.ai

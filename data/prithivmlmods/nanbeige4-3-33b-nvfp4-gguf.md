# prithivMLmods/Nanbeige4.3-33B-NVFP4-GGUF

## Resumen

Nanbeige4.3-33B-NVFP4-GGUF es una cuantizacion en formato GGUF con precision NVFP4 del modelo denso Nanbeige4.3-33B, desarrollado por el equipo Nanbeige y publicado bajo licencia Apache 2.0. El modelo original es un transformer denso de 33.118.977.752 parametros (aproximadamente 33B) concebido como modelo "profesor" de alta capacidad para destilar capacidades agenticas en modelos mas pequenos, con un enfoque declarado en codigo complejo y flujos de trabajo profesionales.

La relevancia de esta variante concreta reside en el formato: NVFP4 es una cuantizacion de 4 bits en coma flotante disenada para aceleradores Blackwell (arquitectura SM120, GB202), lo que permite ejecutar un modelo de 33B en aproximadamente 22,1 GB de pesos y con un pico de VRAM de 21,64 GiB segun las pruebas del autor. Esto lo situa en el rango de GPUs profesionales de gama alta y de algunas consumer de gran capacidad, algo impensable con los pesos en BF16.

El modelo base declara una ventana de contexto de 512K tokens, soporte de tool calling con XML recomendado, modo de razonamiento ("thinking") configurable y compatibilidad con Transformers, SGLang y vLLM. Esta cuantizacion GGUF esta pensada para llama.cpp y llama-cli, y el autor la ha validado en una NVIDIA RTX PRO 6000 Blackwell Server Edition con 96 GB de VRAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Nanbeige4.3-33B) |
| Parametros totales | 33.118.977.752 (33B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 512K tokens (modelo base); prueba realizada con 16.384 tokens |
| Tipos de cuantizacion | NVFP4 (GGUF, 4 bits en coma flotante) |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo Nanbeige4.3-33B-NVFP4.gguf, 22,1 GB) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de aproximadamente 33B parametros. La model card del autor de la cuantizacion no detalla la composicion del dataset de entrenamiento, el numero de tokens vistos ni si se aplicaron tecnicas de RLHF o DPO; esa informacion no esta disponible en la documentacion proporcionada. Si se indica que el modelo fue construido como profesor de alta capacidad para destilar capacidades agenticas en modelos de menor tamano, y que su foco son el codigo complejo y los flujos de trabajo profesionales.

La innovacion tecnica destacable de esta ficha es la cuantizacion NVFP4, un formato de 4 bits en coma flotante optimizado para los aceleradores Blackwell de NVIDIA (SM120). El autor confirma explicitamente que no se emplea decodificacion especulativa (MTP - Speculative Decoding: No) en las pruebas realizadas. El modelo base soporta Transformers, SGLang y vLLM, y recomienda XML para el formateo de tool calling.

## Capacidades

- Generacion de texto y razonamiento de proposito general, con modo de razonamiento ("thinking") configurable y preservacion configurable del mismo.
- Codigo: el modelo esta orientado a tareas de ingenieria de software, con resultados declarados en Terminal-Bench 2.1, DeepSWE y SWE-bench Pro.
- Matematicas: resultados declarados en AIME 2026.
- Tool calling / function calling, con XML como formato recomendado.
- Capacidades agenticas y razonamiento multi-paso (etiqueta "agent" en el repositorio, benchmarks de Automation Bench y Claw-Eval).
- Multilingue limitado a ingles y chino.
- No se declaran capacidades de vision ni de audio en la informacion disponible.

## Casos de uso

- Desarrollo de software asistido en produccion: el modelo declara 60,3 en SWE-bench Pro y 65,5 en DeepSWE, por lo que es adecuado para tareas de reparacion de bugs y generacion de parches sobre repositorios reales, integrándose en pipelines de CI/CD mediante tool calling en XML.
- Automatizacion de terminal y operaciones: con 80,9 en Terminal-Bench 2.1, encaja en agentes que ejecutan comandos, interpretan salidas y corrigen errores de forma iterativa.
- Agentes multi-paso con contexto largo: la ventana de 512K tokens del modelo base permite mantener historiales extensos de conversacion, trazas de herramientas y documentacion de repositorio en una sola sesion.
- Razonamiento matematico y resolucion de problemas: los 95,2 declarados en AIME 2026 lo hacen util para asistentes de analisis cuantitativo y verificacion de calculos.
- Destilacion de capacidades agenticas: el modelo base fue disenado explicitamente como profesor para transferir comportamiento agentico a modelos mas pequenos, por lo que sirve para generar trazas de alta calidad en procesos de distillation.
- Despliegue local en estaciones de trabajo Blackwell: con 22,1 GB de pesos y 21,64 GiB de pico de VRAM, puede ejecutarse en una unica GPU profesional con llama.cpp para entornos con requisitos de privacidad de datos.
- Evaluacion comparativa interna: util como referencia de alta capacidad frente a modelos de 27-31B en pruebas de codigo y agentes.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo base frente a Qwen3.8-27B, Muse-Glimmer-30B y Gemma4-31B:

| Benchmark | Nanbeige4.3-33B | Referencia comparada |
|---|---|---|
| Terminal-Bench 2.1 | 80,9 | no disponible para el resto |
| DeepSWE | 65,5 | no disponible para el resto |
| Automation Bench | 54,2 | no disponible para el resto |
| Claw-Eval Pass@3 | 78,3 | no disponible para el resto |
| AIME 2026 | 95,2 | no disponible para el resto |
| SWE-bench Pro | 60,3 | Qwen3.8-27B: 61,7 |
| GPQA-Diamond | 89,5 | Gemma4-31B: 91,3 |

Rendimiento de inferencia de esta cuantizacion NVFP4, medido por el autor con llama-cli en una NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB VRAM), contexto de 16.384 tokens, KV cache q8_0, 99 capas offloaded y 5 ejecuciones:

| Metrica | Valor |
|---|---|
| Velocidad media de procesamiento de prompt | 1.569,37 tokens/s |
| Velocidad media de generacion | 64,40 tokens/s |
| Tiempo medio por ejecucion | 14,70 s |
| Tiempo total de pared | 73,5 s |
| Pico de VRAM | 21,64 GiB |
| Uso pico de GPU | 97% |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 22,1 GB solo para pesos; el autor reporta un pico de 21,64 GiB con contexto de 16.384 tokens y KV cache q8_0.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell Server Edition (96 GB) es la unica configuracion validada por el autor. Por requisito de arquitectura, NVFP4 necesita aceleradores Blackwell (SM120, GB202).
- GPU consumer: no se ha validado en GPUs consumer en la informacion disponible; el requisito de arquitectura Blackwell limita la compatibilidad a modelos de esa generacion con VRAM suficiente.
- Opciones de despliegue: llama.cpp / llama-cli (validado); el modelo base declara compatibilidad con Transformers, SGLang y vLLM, aunque esta cuantizacion GGUF concreta esta pensada para llama.cpp.
- Latencia y throughput: 64,40 tokens/s de generacion y 1.569,37 tokens/s de procesamiento de prompt en la configuracion indicada; el rendimiento variara con el prompt, el build de software y los ajustes de runtime.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Nanbeige4.3-33B (esta cuantizacion) | 33B denso | 512K (base) | Apache 2.0 | GGUF NVFP4 en HF | Requiere hardware Blackwell |
| Qwen3.8-27B | 27B (no confirmado) | no disponible | no disponible | no disponible | Lidera SWE-bench Pro (61,7 vs 60,3) |
| Gemma4-31B | 31B (no confirmado) | no disponible | no disponible | no disponible | Lidera GPQA-Diamond (91,3 vs 89,5) |
| Muse-Glimmer-30B | 30B (no confirmado) | no disponible | no disponible | no disponible | Citado como referencia, sin datos |

## Limitaciones y advertencias

- Idiomas: solo ingles y chino; no se declara soporte de castellano ni de otros idiomas.
- Hardware: NVFP4 requiere aceleradores Blackwell (SM120); no es portable a GPUs Ampere, Ada ni a hardware no NVIDIA.
- Sin decodificacion especulativa: el autor confirma que MTP no esta disponible, lo que limita el throughput frente a alternativas con speculative decoding.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad en la informacion disponible.
- Alucinacion: no se publican tasas de alucinacion ni evaluaciones de fidelidad; debe validarse en produccion.
- Contexto: aunque el modelo base declara 512K tokens, la prueba realizada solo cubre 16.384 tokens, por lo que el comportamiento y el consumo de VRAM a contextos mayores no estan verificados.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y atribucion correspondiente.
- Cuantizacion de 4 bits: puede degradar la precision respecto a los pesos originales; no se publican comparativas de calidad entre NVFP4 y BF16.
- Datos de benchmarks: proceden de la model card del autor y no se han verificado de forma independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/prithivMLmods/Nanbeige4.3-33B-NVFP4-GGUF
- Archivo GGUF: https://huggingface.co/prithivMLmods/Nanbeige4.3-33B-NVFP4-GGUF/blob/main/Nanbeige4.3-33B-NVFP4.gguf
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- llama.cpp: https://github.com/ggml-org/llama.cpp

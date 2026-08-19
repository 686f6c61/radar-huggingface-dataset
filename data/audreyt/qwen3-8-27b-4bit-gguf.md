# audreyt/Qwen3.8-27B-4bit-GGUF

## Resumen

Este repositorio contiene una cuantizacion GGUF del modelo Qwen3.8-27B de Alibaba, convertida por audreyt con un formato de cuantizacion propio denominado `q4_64a` (affine g64 con escala y sesgo en BF16). El archivo esta disenado exclusivamente para el motor de inferencia DwarfStar (ds4), no para llama.cpp, lo que lo convierte en una pieza especializada dentro del ecosistema GGUF.

El modelo base, Qwen3.8-27B, es un LLM denso multimodal de codigo abierto publicado por el equipo Qwen de Alibaba bajo licencia Apache 2.0, con 24.35 mil millones de parametros y una ventana de contexto de 262k tokens. Destaca en tareas de codificacion, flujos agente y automatizacion de oficina, e incluye un codificador de vision sorpresa. Esta cuantizacion reduce el peso a 12.77 GiB, lo que permite ejecutarlo en hardware de consumo con 16 GB de VRAM.

La relevancia de este repositorio radica en que demuestra la viabilidad de cuantizaciones alternativas al formato estandar de llama.cpp, aprovechando la cuantizacion afin `q4_64a` para mejorar la fidelidad numerica mediante parametros de escala y sesgo en BF16. Aun asi, su ecosistema de ejecucion es limitado: requiere el motor ds4 en la rama `qwen38`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (`qwen3_5_text`, 64 capas, hidden 5120, vocab 248320) |
| Parametros totales | 24.353.838.080 (24.35B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (262k) |
| Tipos de cuantizacion | `q4_64a` (tipo 36, affine g64, escala y sesgo en BF16) |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 es multilingue, pero no se especifica en esta cuantizacion) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (variante propietaria para ds4, incompatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con 64 capas, dimension oculta de 5120 y vocabulario de 248320 tokens. Es un modelo multimodal nativo: incorpora un codificador de vision ademas del modulo de texto, lo que le permite procesar imagenes junto con texto. Los datos de entrenamiento no se detallan en la informacion disponible, aunque el equipo Qwen lo posiciona como un modelo orientado a codigo, agentes y automatizacion de oficina.

Esta cuantizacion concreta aplica un esquema `q4_64a` que cuantiza las proyecciones de atencion (`attn_q/k/v/output`) y las capas FFN (`ffn_gate/up/down`) con una escala calculada como `(max-min)/15` y un sesgo en BF16, lo que preserva mejor la distribucion de pesos que una cuantizacion uniforme clasica. El proceso de conversion parte del checkpoint original `Qwen/Qwen3.8-27B@1d4bf0f`, pasa por la cuantizacion MLX de `EigenLabs/Qwen3.8-27B-4bit` y se convierte a GGUF mediante `convert_qwen38.py`. El resultado son 579 tensores: 450 cuantizados con `q4_64a` y 129 en F32.

## Capacidades

- Generacion de texto y razonamiento: el modelo base soporta tareas complejas de razonamiento, aunque esta cuantizacion no documenta capacidades de modo thinking.
- Codificacion: el modelo base destaca en generacion y comprension de codigo, segun el repositorio oficial de AlibabaCloud-Official.
- Multimodal: el modelo base incluye un codificador de vision, aunque la arquitectura `qwen3_5_text` de este GGUF sugiere que la cuantizacion se centra en el modulo de texto; la compatibilidad con vision en ds4 no esta confirmada.
- Flujos agente: soporte para workflows agente y automatizacion de oficina, segun la documentacion oficial del modelo base.
- Contexto largo: ventana de 262k tokens, adecuada para documentos extensos y conversaciones multi-turno.
- Cuantizacion especializada: el formato `q4_64a` ofrece una alternativa de precision superior a cuantizaciones uniformes de 4 bits gracias a su parametro afin por grupo de 64.

## Casos de uso

- Asistente de codigo local: el modelo puede completar y revisar codigo en entornos sin conexion, aprovechando su rendimiento en tareas de programacion y su tamano reducido (12.77 GiB) para ejecutarse en estaciones de trabajo con GPU de consumo.
- Analisis de documentos extensos: con 262k tokens de contexto, es viable procesar contratos, manuales tecnicos o codebases completos en una sola pasada, resumiendo o extrayendo informacion relevante.
- Automatizacion de oficina: el modelo base esta optimizado para tareas como generacion de informes, resumen de actas y redaccion de correos, lo que lo hace util como backend de herramientas de productividad internas.
- Desarrollo de agentes autonomos: su soporte para flujos agente permite construir sistemas que encadenan multiples pasos de razonamiento y llamadas a herramientas, ejecutandose en hardware local para mantener la privacidad de los datos.
- Prototipado de aplicaciones RAG: la combinacion de contexto largo y cuantizacion compacta permite montar pipelines de recuperacion aumentada sobre documentacion corporativa en un unico servidor.
- Investigacion en cuantizacion: el formato `q4_64a` sirve como caso de estudio para evaluar el impacto de cuantizaciones afines con parametros BF16 en la calidad de salida frente a cuantizaciones uniformes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni comparativas con otras cuantizaciones. Tampoco se documentan mediciones de latencia o throughput para el motor ds4.

## Requisitos de hardware

- VRAM estimada: el archivo pesa 12.77 GiB, por lo que se necesita aproximadamente 13-14 GB de VRAM para una carga completa en GPU, mas overhead de activaciones y KV cache.
- GPU recomendadas: RTX 4080/4090 (16-24 GB), RTX 3090 (24 GB), o GPUs profesionales como A100 40GB. Tambien es compatible con AMD Ryzen AI Max y Radeon, segun el anuncio de soporte Day 0 de AMD.
- Consumer GPU: si, cabe en GPUs de consumo con 16 GB o mas de VRAM, como la RTX 4080 o la RTX 4090.
- Opciones de despliegue: exclusivamente el motor DwarfStar (ds4) en la rama `qwen38`; no es compatible con llama.cpp, Ollama ni vLLM sin adaptaciones.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Motor de inferencia | Licencia |
|---|---|---|---|---|---|
| audreyt/Qwen3.8-27B-4bit-GGUF | 24.35B | 262k | q4_64a (afin, BF16) | DwarfStar (ds4) | Apache 2.0 |
| unsloth/Qwen3.8-27B-GGUF | 24.35B | 262k | GGUF estandar (Q4_K_M, Q5_K_M, etc.) | llama.cpp, Ollama, LM Studio | Apache 2.0 |
| Qwen3.8-27B (original) | 24.35B | 262k | BF16/FP16 | Transformers, vLLM, TGI | Apache 2.0 |

La diferencia principal entre las tres versiones es el ecosistema de ejecucion: la cuantizacion de unsloth es compatible con el ecosistema llama.cpp (Ollama, LM Studio), mientras que la de audreyt requiere el motor ds4, lo que limita su portabilidad. El modelo original en precision completa ofrece maxima compatibilidad con frameworks estandar pero requiere mas VRAM.

## Limitaciones y advertencias

- Incompatibilidad con llama.cpp: el formato `q4_64a` no es reconocido por llama.cpp ni por las herramientas que dependen de el (Ollama, LM Studio, llama-cpp-python). Intentar cargarlo en estos motores producira errores.
- Ecosistema restringido: el unico motor documentado es DwarfStar (ds4) en la rama `qwen38`; la disponibilidad de ds4 en otras plataformas o arquitecturas no esta confirmada.
- Sin datos de calidad: no se han publicado benchmarks que verifiquen que la cuantizacion `q4_64a` mantiene la calidad del modelo original; el rendimiento real es incierto.
- Adopcion nula: el repositorio tiene 0 descargas y 0 likes, lo que indica que es una publicacion muy reciente o de nicho sin validacion comunitaria.
- Soporte de vision no confirmado: aunque el modelo base es multimodal, la arquitectura `qwen3_5_text` de esta cuantizacion sugiere que podria limitarse al modulo de texto; la inferencia con imagenes no esta documentada.
- Riesgo de alucinacion: como cualquier LLM de 24B, puede generar contenido plausible pero incorrecto, especialmente en tareas factuales; se recomienda validacion humana en entornos de produccion.
- Sesgos: no se documentan evaluaciones de sesgo para esta cuantizacion; el modelo base puede reflejar sesgos presentes en sus datos de entrenamiento.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/audreyt/Qwen3.8-27B-4bit-GGUF
- Modelo base (EigenLabs): https://huggingface.co/EigenLabs/Qwen3.8-27B-4bit
- Repositorio oficial Qwen3.8 (Alibaba): https://github.com/QwenLM/Qwen3.8
- Repositorio AlibabaCloud-Official/Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- DwarfStar (ds4): https://github.com/audreyt/ds4
- Guia de ejecucion local (yottalabs.ai): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
- Soporte AMD para Qwen3.8-27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Cuantizacion GGUF de unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF

# j2ipper/Laguna-S-2.1-Q4-lean

## Resumen

Laguna-S-2.1-Q4-lean es una cuantizacion GGUF de 4-5 bits del modelo Laguna-S-2.1 de poolside, publicada por el usuario j2ipper. No se trata de un modelo nuevo, sino de una reempaquetadura de pesos pensada para ejecutarse en una maquina con 128 GB de memoria unificada, concretamente un AMD Strix Halo (Ryzen AI Max+ 395 con Radeon 8060S), dejando espacio suficiente para el contexto completo de 256K tokens del modelo original. Es el archivo de pesos que utiliza Talus, el motor de inferencia de nsbradley88, como configuracion de referencia para este modelo.

La cuantizacion parte del UD-Q4_K_XL de Unsloth: los expertos enrutados se conservan byte a byte, mientras que los tensores de atencion y de expertos compartidos se recuantizan de Q8_0 a Q5_K/Q6_K. El resultado son 814 tensores y 67,24 GiB en tres fragmentos GGUF. El modelo base declara 117.561.977.600 parametros (unos 117,6 mil millones), lo que lo situa en la categoria de modelos grandes con arquitectura probablemente MoE, aunque la model card no detalla la composicion de parametros activos.

Su relevancia es practica: permite ejecutar un modelo de ~117B parametros con contexto de 256K en hardware consumer de gama alta (Strix Halo) mediante llama.cpp o Talus, con decodificacion especulativa opcional mediante un drafter DFlash. La licencia es OpenMDW-1.1, la misma del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GGUF (modelo base Laguna-S-2.1; arquitectura interna no detallada en la informacion disponible) |
| Parametros totales | 117.561.977.600 (~117,6B) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | Q4_K, Q5_K, Q6_K, Q8_0, F32 (mezcla por tensor) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | GGUF (3 fragmentos, 67,24 GiB, 814 tensores) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base Laguna-S-2.1 (no se confirma si es transformer denso, MoE o hibrido). La presencia de tensores `ffn_gate_exps`, `ffn_up_exps` y `ffn_down_exps` junto con expertos compartidos (`ffn_*_shexp`) y un router sugiere una arquitectura de mezcla de expertos con expertos compartidos, pero este dato se deduce de los nombres de tensor y no esta confirmado en la model card. Tampoco se detallan los datos de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO.

Lo que si documenta la model card es el proceso de cuantizacion: una sola pasada de `llama-quantize --allow-requantize --keep-split` sobre el UD-Q4_K_XL de Unsloth, usando su importance matrix (`imatrix_unsloth.gguf`) y un archivo de tipos por tensor. Los expertos enrutados (`ffn_gate_exps`, `ffn_up_exps` en Q4_K, con la capa 47 en Q5_K; `ffn_down_exps` en Q5_K, con las capas 46-47 en Q6_K) se copian sin cambios. La atencion (`attn_q`, `attn_output` a Q5_K; `attn_k`, `attn_v` a Q6_K) y los expertos compartidos (Q6_K) se recuantizan desde Q8_0. El FFN denso de la capa 0 y `attn_gate` quedan en Q8_0, el embedding en Q8_0, la salida en Q6_K y router, normas y sesgos en F32. El desglose por tipo es: Q4_K 38,81 GiB, Q5_K 25,83 GiB, Q6_K 2,04 GiB, Q8_0 0,43 GiB y F32 0,14 GiB.

## Capacidades

- Generacion de texto conversacional (tag `conversational` en el repositorio).
- Razonamiento y codificacion agentica: la model card menciona una "agentic coding suite" superada 5/5 en la verificacion de Talus.
- Contexto largo: recuperacion tipo needle in a haystack validada a 60K y 81K tokens (15/15 en ambos casos).
- Decodificacion especulativa mediante un drafter DFlash separado (`laguna-s-2.1-dflash-Q8_0.gguf`), que acelera la generacion sin alterar las respuestas greedy.
- Compatibilidad con llama.cpp en builds que soportan la arquitectura `laguna`, y con el servidor Talus (API compatible con endpoints).
- Capacidades multilingues: no disponible.
- Soporte de tool calling, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Asistencia de codificacion agentica en local: el modelo supera una suite de codigo agentico en la verificacion de Talus y puede integrarse en un bucle de edicion de repositorio con tool calling, siempre que el motor lo soporte; su contexto de 256K permite mantener a la vista varios archivos y el historial de cambios.
- Analisis de repositorios completos: con 262.144 tokens de ventana y atencion block-sparse a partir de 32K en Talus, es viable cargar arboles de codigo extensos o documentacion tecnica completa y hacer preguntas sobre ellos.
- Servidor de chat privado en una estacion de trabajo Strix Halo: el tamano de 67,24 GiB encaja en los 128 GB de memoria unificada del Ryzen AI Max+ 395, permitiendo servir conversaciones multi-turno sin GPU dedicada.
- Procesamiento de documentos largos (contratos, informes, expedientes): la validacion needle in a haystack a 60K y 81K respalda el uso en recuperacion de informacion dentro de documentos extensos.
- Generacion y revision de parches de codigo: con el drafter DFlash, la velocidad de decodificacion en Strix Halo pasa de 95,9 a 101,4 tok/s en tareas de edicion, lo que hace practico un flujo de aplicar-corregir-revisar.
- Despliegue de referencia para evaluar el modelo base: al ser el peso que Talus distribuye por defecto, sirve para reproducir sus resultados y comparar numericas entre builds del motor (KL 0,00185 a 32K respecto al build previamente validado).
- Prototipado de agentes multi-paso en local: la combinacion de contexto largo, decodificacion especulativa y servidor con API permite montar pipelines de agentes sin coste de API externa.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las puertas de calidad de Talus (ejecucion `rel-final-e6cf`, commit `e6cf959e1cad`, 2026-10-28), que verifican el motor y no comparan esta cuantizacion contra los pesos originales:

| Prueba | Resultado |
|---|---|
| KL con teacher forcing, build actual vs build previamente validado (32K) | KL 0,00185 (umbral <= 0,003); top-1 98,5% |
| KL a 2K | 0,000 |
| Needle in a haystack, 60K | 15/15 |
| Needle in a haystack, 81K | 15/15 |
| Suite de codificacion agentica | 5/5 |

Velocidad en Strix Halo con Talus (tok/s), con y sin drafter DFlash:

| Tarea | Sin DFlash | Con DFlash |
|---|---|---|
| Codificacion | 34,9 | 52,2 |
| Chat | 33,7 | 37,7 |
| Edicion | 95,9 | 101,4 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: 67,24 GiB de pesos mas la cache KV en q8_0 para 256K de contexto; el autor indica que esta dimensionado para 128 GB de memoria unificada con margen para el contexto completo.
- Hardware objetivo: AMD Strix Halo (Ryzen AI Max+ 395, Radeon 8060S, gfx1151) con 128 GB. El repositorio incluye el tag `strix-halo`.
- GPU dedicadas: no se documenta soporte ni requisitos para A100, H100 o RTX 4090; con 67 GiB de pesos no cabe en una RTX 4090 de 24 GB.
- Opciones de despliegue: Talus (servidor y CLI, con ROCm) y builds de llama.cpp que soporten la arquitectura `laguna`. No se mencionan vLLM, TGI u Ollama.
- Decodificacion especulativa: drafter DFlash opcional en Q8_0 desde `j2ipper/Laguna-S-2.1-DFlash-GGUF`; sin el, Talus usa solo prompt lookup.
- Throughput medido: 34,9-101,4 tok/s segun tarea en Strix Halo (ver tabla anterior). Latencia no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Laguna-S-2.1-Q4-lean (este) | ~117,6B | 262.144 | GGUF Q4_K/Q5_K/Q6_K | OpenMDW-1.1 | Requantizacion de Unsloth UD-Q4_K_XL; orientado a Strix Halo |
| Unsloth Laguna-S-2.1 UD-Q4_K_XL | ~117,6B | 262.144 (heredado) | GGUF | OpenMDW-1.1 | Fuente de los expertos enrutados; atencion en Q8_0 |
| poolside/Laguna-S-2.1 | ~117,6B | 262.144 | safetensors (pesos originales) | OpenMDW-1.1 | Modelo base sin cuantizar |

No se dispone de datos de benchmarks comparativos entre estas variantes ni con modelos de otros fabricantes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion introduce perdida de precision respecto a los pesos originales; la model card no publica una comparacion directa de esta cuantizacion contra el modelo base, solo la estabilidad del motor entre builds.
- Los datos de KL y needle in a haystack verifican el motor Talus, no la calidad absoluta de esta cuantizacion.
- No se documentan sesgos conocidos, tasas de alucinacion ni idiomas soportados; deben evaluarse antes de un despliegue en produccion.
- El rendimiento medido corresponde exclusivamente a Strix Halo con Talus; en otras plataformas o motores puede diferir.
- La licencia OpenMDW-1.1 incluye una clausula de patentes: los derechos terminan para quien demande alegando que los materiales del modelo infringen una patente o un copyright. Revisar `LICENSE.md` antes de uso comercial.
- El modelo requiere hardware con al menos ~70 GiB de memoria para los pesos; no es viable en GPUs consumer convencionales de 24 GB.
- El drafter DFlash es un artefacto separado con su propia descarga; su ausencia reduce la velocidad pero no cambia las respuestas greedy.
- El repositorio se publico en octubre de 2026 y tiene 210 descargas y 0 likes; el soporte comunitario es limitado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/j2ipper/Laguna-S-2.1-Q4-lean
- Modelo base: https://huggingface.co/poolside/Laguna-S-2.1
- Cuantizacion de origen (Unsloth): https://huggingface.co/unsloth/Laguna-S-2.1-GGUF/tree/main/UD-Q4_K_XL
- Drafter DFlash: https://huggingface.co/j2ipper/Laguna-S-2.1-DFlash-GGUF
- Vocabulario del drafter: https://huggingface.co/j2ipper/draft-vocab
- Motor Talus: https://github.com/nsbradley88/talus-public
- Documentacion de modelos de Talus: https://github.com/nsbradley88/talus-public/blob/main/docs/MODELS.md
- Metodologia de verificacion de Talus: https://github.com/nsbradley88/talus-public/blob/main/docs/METHODOLOGY.md
- Resultados de velocidad de Talus: https://github.com/nsbradley88/talus-public/blob/main/docs/RESULTS.md
- Licencia: https://huggingface.co/j2ipper/Laguna-S-2.1-Q4-lean/blob/main/LICENSE.md

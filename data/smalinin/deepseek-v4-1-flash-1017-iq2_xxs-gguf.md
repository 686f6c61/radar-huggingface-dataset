# smalinin/DeepSeek-V4.1-Flash-1017-IQ2_XXS-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017 es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por DeepSeek AI, distribuido originalmente en Hugging Face bajo el identificador `deepseek-ai/DeepSeek-V4.1-Flash-1017`. Con 748.494.684.784 parametros totales, esta pensado para tareas conversacionales y de razonamiento multimodal (image-text-to-text), y su licencia MIT lo hace especialmente atractivo para uso comercial sin restricciones adicionales.

La ficha que nos ocupa no documenta el checkpoint original, sino una cuantizacion GGUF publicada por el usuario `smalinin`: `smalinin/DeepSeek-V4.1-Flash-1017-IQ2_XXS-GGUF`. Se trata de una receta asimetrica de precision mixta (denominada "Antirez-like") que combina IQ2_XXS y Q2_K en los expertos enrutados con Q8_0 en atencion y expertos compartidos, y Q5_K en las dos tablas de embeddings Engram. El resultado son 8 shards GGUF de aproximadamente 297,7 GB (3,18 BPW efectivos), disenados para ejecutarse en una build CUDA especifica de llama.cpp mantenida por el propio autor.

Su relevancia practica es doble: por un lado, permite ejecutar un modelo de 748B parametros en hardware mucho mas modesto que el checkpoint BF16 original; por otro, demuestra tecnicas de cuantizacion selectiva (imatrix, precision mixta por familia de tensores, tablas Engram a Q5_K) que son de interes directo para quien quiera entender el estado del arte en compresion de modelos MoE grandes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (MoE) con tablas Engram; detalles completos de capas no disponibles en la informacion proporcionada |
| Parametros totales | 748.494.684.784 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ2_XXS (gate/up de expertos enrutados), Q2_K (down de expertos enrutados), Q5_K (tablas Engram), Q8_0 (atencion, expertos compartidos, head de salida, Engram WKV, indexer Q), BF16 (token embeddings, Engram Q/K, indexer K y proyeccion, compresor de atencion) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (8 shards, 1.046 tensores) |

## Arquitectura y entrenamiento

El checkpoint base es un transformer MoE de gran escala con 748.494.684.784 parametros totales. La model card de la cuantizacion revela detalles estructurales relevantes: 40 capas con expertos enrutados (`ffn_gate_exps`, `ffn_up_exps`, `ffn_down_exps`), expertos compartidos (`ffn_{gate,up,down}_shexp`), mecanismo de atencion con proyecciones desacopladas (`attn_q_a`, `attn_q_b`, `attn_output_a`, `attn_output_b`, `attn_kv`), un compresor de atencion (`attn_compressor_gate`, `attn_compressor_kv`), un indexer (`indexer.attn_q_b`, `indexer.attn_k`, `indexer.proj`) y dos tablas Engram en las capas 1 y 14 (`engram_embd`, `engram_wkv`, `engram_q`, `engram_k`). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion tecnica documentada en esta ficha es la receta de cuantizacion, no el entrenamiento. El autor aplica cuantizacion asistida por imatrix y precision mixta por familia de tensores: los expertos enrutados (la mayor parte del peso) se comprimen agresivamente a IQ2_XXS/Q2_K, mientras que atencion, expertos compartidos, head de salida y Engram WKV se mantienen en Q8_0, y los tensores sensibles (embeddings de tokens, Q/K de Engram, indexer K y proyeccion, compresor de atencion) se conservan en BF16. Las dos tablas Engram, que suman 135,172 GB, se degradan solo hasta Q5_K. El resultado es un BPW efectivo de 3,181876 sobre el total y de 2,356018 sobre el backbone, con un payload de 297,702 GB.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el pipeline declarado (`conversational`) y la etiqueta `image-text-to-text`.
- Procesamiento de imagen y texto combinados (image-text-to-text), lo que habilita entrada multimodal.
- Razonamiento y generacion de codigo: capacidades inferidas de la categoria del modelo base, aunque no se detallan en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el campo de idiomas no esta poblado.
- Modo thinking, vision o audio: solo la componente de vision implicita en el pipeline image-text-to-text; no hay detalle adicional.

## Casos de uso

- Despliegue de un MoE de 748B en un solo nodo multi-GPU: con 297,7 GB de pesos en Q2/Q5, el modelo cabe en configuraciones de 4-8 GPU de 80 GB (A100/H100) o en un nodo con suficiente memoria unificada, algo inviable con el checkpoint BF16 original.
- Investigacion sobre cuantizacion extrema: la receta IQ2_XXS + Q2_K + Q5_K con proteccion selectiva de tensores sirve como caso de estudio reproducible para medir el impacto de la precision mixta en modelos MoE de gran escala.
- Evaluacion comparativa de recetas GGUF: al existir variantes del mismo autor con Engram en Q8_0 y Q5_K, permite aislar el efecto de degradar solo las tablas de embeddings sobre la calidad final.
- Procesamiento multimodal en local: el pipeline image-text-to-text permite construir asistentes que combinen imagen y texto sin depender de APIs externas, siempre que se cumplan los requisitos de memoria.
- Experimentacion con llama.cpp en CUDA: la build `my_build` del autor y su soporte para cargar GGUF de terceros (por ejemplo, los de Unsloth) sin repacking facilitan flujos de prueba con distintos checkpoints.
- Generacion de codigo y asistencia tecnica en entornos con licencia permisiva: al ser MIT, el modelo puede integrarse en productos comerciales sin las restricciones de otras licencias de modelos abiertos, aunque la calidad real tras cuantizar a 2 bits debe validarse en cada caso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 297,7 GB de pesos mas overhead de contexto y cache KV; el autor menciona que Q5_K en Engram ahorra "storage y host-cache space" respecto a Q8_0, lo que sugiere uso de memoria host como cache.
- GPU recomendadas: el autor publica una build CUDA especifica (`smalinin/llama.cpp`, rama `my_build`); no se detallan modelos de GPU concretos. Por volumen de pesos, se necesitan nodos multi-GPU de 80 GB (A100, H100) o configuraciones con memoria unificada amplia.
- Cabe en consumer GPU: no de forma completa; 297,7 GB exceden cualquier GPU de consumo individual (RTX 4090, 24 GB). Solo seria viable con offloading masivo a RAM del sistema, a costa de latencia.
- Opciones de despliegue: llama.cpp con la build CUDA de la rama `my_build` del autor. No se reclama compatibilidad con llama.cpp upstream estandar ni se documentan vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smalinin/DeepSeek-V4.1-Flash-1017-IQ2_XXS-GGUF (esta ficha) | 748.494.684.784 | no disponible | GGUF, 8 shards, 297,7 GB | MIT | Hugging Face, build CUDA propia |
| deepseek-ai/DeepSeek-V4.1-Flash-1017 (base) | 748.494.684.784 | no disponible | safetensors (presumiblemente) | MIT | Hugging Face |
| Variante del mismo autor con Engram Q8_0 | 748.494.684.784 | no disponible | GGUF | MIT | Hugging Face (referenciada en la model card) |
| unsloth/DeepSeek-V4.1-Flash-1017-GGUF | 748.494.684.784 | no disponible | GGUF | MIT | Hugging Face; cargable con `my_build` sin repacking |

No se dispone de datos de rendimiento comparado (benchmarks) entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion a IQ2_XXS/Q2_K en los expertos enrutados es extremadamente agresiva; el autor no garantiza paridad de calidad con el checkpoint oficial ni con su variante de Engram en Q8_0.
- Q5_K en las tablas Engram es lossy: el propio autor advierte que no se garantiza paridad de calidad con Q8_0 Engram.
- Compatibilidad limitada: se requiere la build CUDA de la rama `my_build`; no se reclama funcionamiento con llama.cpp upstream estandar.
- Es el checkpoint 1017, no la release anterior DeepSeek-V4.1-Flash; mezclar artefactos de ambas versiones puede producir errores.
- No hay informacion sobre sesgos, idiomas soportados ni tasas de alucinacion; deben evaluarse empiricamente antes de produccion.
- La licencia MIT del artefacto GGUF se hereda del modelo base, pero conviene verificar terminos de uso del checkpoint original y de las dependencias (llama.cpp modificado).
- El pipeline declarado es image-text-to-text, pero la model card no detalla el procesador de imagen ni los formatos admitidos; la validacion multimodal queda a cargo del usuario.
- El repo pesa 307,7 GB, lo que implica costes de almacenamiento y transferencia considerables; la descarga completa son 8 ficheros.

## Enlaces

- Repositorio Hugging Face de la cuantizacion: https://huggingface.co/smalinin/DeepSeek-V4.1-Flash-1017-IQ2_XXS-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Build de llama.cpp del autor (rama `my_build`): https://github.com/smalinin/llama.cpp/tree/my_build
- GGUF alternativo de Unsloth: https://huggingface.co/unsloth/DeepSeek-V4.1-Flash-1017-GGUF
- Informe tecnico citado en la model card: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/blob/main/DeepSeek_V41_Tech_Report.pdf
- Web de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Organizacion DeepSeek en Hugging Face: https://huggingface.co/deepseek-ai
- Twitter/X de DeepSeek: https://twitter.com/deepseek_ai

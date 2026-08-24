# mradermacher/Qwen3.6-27B-Architect-Polaris2-Fable-B-F451-F32-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF con imatrix del modelo `nightmedia/Qwen3.6-27B-Architect-Polaris2-Fable-B-F451-F32`, un merge de dos variantes de Qwen3.6-27B realizado mediante mergekit (técnica nuslerp). El autor, mradermacher, es un cuantizador conocido en la comunidad que publica pesos GGUF optimizados para inferencia local. El modelo base combina características de razonamiento (Polaris), escritura creativa (Fable) y destilación de Claude 4.6, según los tags del repositorio.

Con 27.320 millones de parámetros, es un modelo denso de tamaño medio-alto, pensado para tareas de generación de texto, razonamiento, código y escritura creativa. Soporta cuatro idiomas (inglés, chino, japonés y español) y, según la model card, es un modelo de visión, aunque los archivos de proyección multimodal (mmproj) se encuentran en el repositorio estático de cuantizaciones. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

La relevancia de este repositorio radica en que ofrece cuantizaciones de alta calidad (i1-Q2_K a i1-Q6_K) con tamaños que van desde 11 GB hasta 22,5 GB, lo que permite ejecutar el modelo en GPUs de consumo medio y alto, así como en hardware Apple Silicon mediante MLX. Es una opción práctica para desarrolladores que quieren probar un modelo de 27B con capacidades de razonamiento y creatividad sin necesidad de un clúster de GPUs.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.6-27B) |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (los tags mencionan 256k y 1M, pero no se confirma para este merge) |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_XS, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K (todas con imatrix) |
| Idiomas soportados | en, zh, ja, es |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivo imatrix) |

## Arquitectura y entrenamiento

El modelo base es un merge de dos variantes de Qwen3.6-27B realizado con mergekit, utilizando la técnica nuslerp (una variante de interpolación lineal de pesos). Según el repositorio NVFP4 de PassingByPixels, se trata de un "bf16 nuslerp mergekit merge of two Qwen3.6-27B variants". Los tags sugieren que una de las variantes está relacionada con destilación de Claude 4.6 (claude-distillation) y otra con "Polaris" (posiblemente un modelo de razonamiento), pero no hay documentación detallada sobre el proceso de entrenamiento o los datos utilizados.

El modelo base fue publicado en bf16 y posteriormente cuantizado por mradermacher a formato GGUF con calibración imatrix, que mejora la calidad de las cuantizaciones de baja precisión. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. Al ser un merge, no hubo fine-tuning adicional; la fusión de pesos se realizó directamente sobre los modelos preentrenados.

## Capacidades

- Generacion de texto y conversacion: modelo instruction-tuned, adecuado para dialogos multi-turno y tareas de chat.
- Razonamiento y chain-of-thought: los tags incluyen "reasoning", "chain-of-thought" y "long-cot", lo que indica soporte para razonamiento extendido.
- Generacion de codigo: etiquetado como "coding", puede asistir en programacion y depuracion.
- Matematicas y STEM: tags de "math" y "stem" sugieren competencia en problemas cientificos y numericos.
- Escritura creativa: etiquetas como "creative writing", "fiction writing", "story generation" y "roleplaying" indican capacidades para narrativa y juegos de rol.
- Multilingue: soporta ingles, chino, japones y español.
- Vision: segun la model card, es un modelo de vision, aunque los archivos mmproj estan en el repositorio estatico (no en este).
- Tool calling y function calling: no se menciona explicitamente en los tags, pero es comun en modelos Qwen recientes; no confirmado para este merge.

## Casos de uso

- Asistente de programacion en local: con cuantizaciones Q4_K_M (16,9 GB) se puede ejecutar en una GPU con 24 GB de VRAM, ofreciendo autocompletado y explicaciones de codigo sin depender de APIs externas.
- Generacion de ficcion y narrativa: el componente "Fable" del merge esta orientado a escritura creativa, permitiendo generar historias, dialogos y tramas con un estilo vivido.
- Chatbot multilingue para atencion al cliente: al soportar cuatro idiomas, puede desplegarse como agente conversacional en entornos con usuarios de habla inglesa, china, japonesa o española.
- Razonamiento y analisis de documentos: con su capacidad de chain-of-thought, puede resumir informes, extraer conclusiones y explicar pasos logicos en tareas de investigacion.
- Prototipado rapido de agentes: al ser un modelo de 27B con licencia Apache 2.0, es adecuado para experimentar con arquitecturas de agentes y pipelines de tool calling en entornos de desarrollo.
- Roleplaying y juegos de texto: su entrenamiento en ficcion y roleplaying permite usarlo como motor de narrativa interactiva en videojuegos o aplicaciones de ocio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para este merge en la informacion disponible. El blog "Qwen 3.6-27B Complete Guide" menciona que el modelo base Qwen3.6-27B alcanza un 77,2% en SWE-bench Verified y supera al modelo flagship de 397B, pero estos datos corresponden al modelo original, no a esta variante fusionada. No se dispone de mediciones de MMLU, HumanEval, GSM8K u otros benchmarks para este repositorio concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: la cuantizacion i1-Q2_K ocupa 11,0 GB, por lo que cabe en GPUs con 12 GB de VRAM (por ejemplo, RTX 3060). Para las cuantizaciones Q4 (15,9-16,9 GB) se recomienda al menos 16-24 GB de VRAM (RTX 4080, RTX 4090, A5000).
- GPU recomendadas: RTX 3090/4090 (24 GB) para Q4_K_M con margen de contexto; A100 40 GB o H100 para ejecucion sin cuantizar o con contexto largo.
- En consumer GPU: si, las cuantizaciones Q2 y Q3 pueden ejecutarse en GPUs de 12-16 GB, aunque con perdida de calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con soporte GGUF), text-generation-webui. Tambien es compatible con MLX para Apple Silicon.
- Latencia y throughput: no disponible. Depende del hardware y la cuantizacion; en una RTX 4090 con Q4_K_M se esperan velocidades de 20-40 tokens/s para un modelo de 27B, pero no hay mediciones publicadas para este merge.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-27B (base) | 27,3B | 256k (segun tags) | Apache 2.0 | bf16 | Modelo original, sin merge |
| Qwen3-27B | 27B | 256k | Apache 2.0 | bf16 | Version anterior de Qwen |
| Llama 3.1 8B | 8B | 128k | Llama 3.1 | bf16 | Mucho menor, no comparable en capacidad |
| Este merge (Architect-Polaris2-Fable) | 27,3B | no disponible | Apache 2.0 | GGUF | Fusion de dos variantes, orientado a creatividad y razonamiento |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental: los tags incluyen "experimental", lo que indica que puede tener comportamientos inesperados o inconsistencias en produccion.
- Sin benchmarks publicados: no hay mediciones objetivas de calidad para este merge, por lo que el rendimiento real es incierto.
- Sesgos y alucinaciones: al ser un modelo de 27B, puede generar contenido falso o sesgado, especialmente en idiomas distintos del ingles.
- Contexto no confirmado: aunque los tags mencionan 256k y 1M, no se ha verificado la longitud de contexto real de este merge; puede ser inferior.
- Vision limitada: aunque es un modelo de vision, los archivos mmproj no estan en este repositorio; hay que descargarlos del repositorio estatico.
- Cuantizaciones de baja precision: las versiones Q2 y Q3 pueden degradar significativamente la calidad de salida; se recomienda usar Q4_K_M o superior para tareas criticas.
- Sin soporte oficial: al ser un merge de terceros, no hay garantias de mantenimiento ni actualizaciones.

## Enlaces

- Repositorio HuggingFace (este): https://huggingface.co/mradermacher/Qwen3.6-27B-Architect-Polaris2-Fable-B-F451-i1-GGUF
- Repositorio estatico (sin imatrix): https://huggingface.co/mradermacher/Qwen3.6-27B-Architect-Polaris2-Fable-B-F451-GGUF
- Modelo base (bf16): https://huggingface.co/nightmedia/Qwen3.6-27B-Architect-Polaris2-Fable-B-F451-F32
- Repositorio NVFP4 con receta DFlash: https://github.com/PassingByPixels/Qwen3.6-27B-Architect-Polaris2-Fable-B-F451-NVFP4_Dflash_DGX_recipe
- Blog sobre Qwen3.6-27B: https://www.aimadetools.com/blog/qwen-3-6-27b-complete-guide/
- Variante "Tess" del mismo merge: https://huggingface.co/mradermacher/Qwen3.6-27B-Architect-Polaris2-Fable-B-F451-Tess-i1-GGUF

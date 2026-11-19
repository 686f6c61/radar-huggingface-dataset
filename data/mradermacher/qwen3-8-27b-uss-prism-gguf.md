# mradermacher/Qwen3.8-27B-USS-Prism-GGUF

## Resumen

Qwen3.8-27B-USS-Prism-GGUF es la version cuantizada en formato GGUF del modelo nightmedia/Qwen3.8-27B-USS-Prism, publicada por mradermacher. Se trata de un modelo de generacion de texto de 27.320.697.856 parametros (aproximadamente 27,3 mil millones) construido a partir de la familia Qwen y afinado mediante tecnicas de destilacion (distillation), SFT y LoRA, con soporte declarado para contextos largos de hasta 1M de tokens y 256k de tokens segun las etiquetas del repositorio. El autor lo orienta a razonamiento con cadena de pensamiento (long-CoT), codigo, matematicas, STEM, escritura creativa y roleplay.

La relevancia practica de esta publicacion es que pone a disposicion de la comunidad un conjunto amplio de cuantizaciones estaticas (desde Q2_K hasta Q8_0, mas variantes IQ4_XS y un suplemento multimodal mmproj), lo que permite ejecutar un modelo de ~27B en hardware de consumo con llama.cpp u otras herramientas compatibles con GGUF. El repositorio ocupa 190,8 GB en total por acumular todas las variantes, aunque cada fichero individual pesa entre 11,0 GB (Q2_K) y 29,1 GB (Q8_0).

La licencia declarada es Apache 2.0, lo que facilita el uso comercial, si bien conviene revisar las condiciones del modelo base original. No se han publicado resultados de benchmarks ni detalles completos del dataset de entrenamiento en la informacion disponible, por lo que muchas especificaciones tecnicas quedan marcadas como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen; detalles de capas y atencion no disponibles) |
| Parametros totales | 27.320.697.856 (~27,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 1M tokens y 256k tokens segun etiquetas del repositorio (no verificado en la model card) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en, zh, ja, es (segun el campo language de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base original en safetensors/bf16) |

## Arquitectura y entrenamiento

El modelo base nightmedia/Qwen3.8-27B-USS-Prism se presenta como un modelo de la familia Qwen (con etiquetas que referencian qwen3_5, qwen3_6 y Qwen3.6) afinado mediante un proceso que combina destilacion de un modelo mayor (etiquetas claude-distillation y claude4.6), SFT y LoRA, y fusion de modelos con mergekit. El repositorio incluye etiquetas como unsloth, polaris, polaris-alpha y Deckard(qx), que apuntan a las herramientas y linajes de entrenamiento, aunque la model card no detalla la composicion exacta del dataset ni el numero de tokens de entrenamiento.

La innovacion principal de esta publicacion concreta es la cuantizacion estatica a GGUF realizada por mradermacher, con versiones tanto estaticas como ponderadas/imatrix (estas ultimas en el repositorio hermano Qwen3.8-27B-USS-Prism-i1-GGUF). Se incluye un suplemento multimodal mmproj (en Q8_0 y f16), lo que sugiere capacidad de vision en el modelo base, aunque no se detalla el codificador visual. No se dispone de informacion sobre el esquema de atencion, el uso de decodificacion especulativa ni otras optimizaciones internas.

## Capacidades

- Generacion de texto conversacional e instruccional (instruction-tuned).
- Razonamiento con cadena de pensamiento larga (long-CoT) y modo de razonamiento explicito.
- Generacion de codigo y tareas de programacion.
- Matematicas y problemas STEM.
- Escritura creativa: ficcion, generacion de tramas y subtramas, continuacion de escenas, storytelling y ciencia ficcion, en todos los generos.
- Roleplay y escritura vivida (vivid prosing).
- Capacidades multilingues en ingles, chino, japones y espanol.
- Soporte multimodal declarado mediante el fichero mmproj (vision), aunque los detalles no estan documentados en la model card.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente, aunque el modo long-CoT lo hace plausible.

## Casos de uso

- Asistente de programacion en local: con cuantizaciones Q4_K_M (16,9 GB) o Q5_K_M (19,6 GB) puede desplegarse en estaciones de trabajo con GPU de 24 GB y usarse para autocompletado, explicacion de codigo y generacion de tests en pipelines de CI/CD.
- Razonamiento matematico y STEM: el modo long-CoT permite resolver problemas paso a paso; util en herramientas educativas o de verificacion de calculos donde se necesita traza del razonamiento.
- Escritura creativa y generacion de ficcion: el modelo esta afinado especificamente para tramas, subtramas y continuacion de escenas, por lo que encaja en herramientas de apoyo a guionistas y novelistas.
- Roleplay y narrativa interactiva: adecuado para motores de juegos de rol o ficcion interactiva que requieren coherencia en conversaciones largas, apoyandose en el contexto extendido declarado.
- Atencion al cliente multilingue: con soporte para en, zh, ja y es, puede gestionar conversaciones multi-turno en varios idiomas, aunque la ventana de contexto efectiva debe validarse en produccion.
- Procesamiento de documentos largos: las etiquetas indican contextos de 256k y 1M tokens; con Q8_0 (29,1 GB) en hardware con suficiente VRAM o en CPU con llama.cpp, podria resumir o extraer informacion de documentos extensos.
- Analisis de imagenes (si se usa el mmproj): el suplemento multimodal permite tareas de vision junto al modelo de texto, aunque la documentacion al respecto es escasa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~11,0 GB.
  - Q3_K_M: ~13,6 GB.
  - IQ4_XS: ~15,5 GB.
  - Q4_K_M: ~16,9 GB.
  - Q5_K_M: ~19,6 GB.
  - Q6_K: ~22,5 GB.
  - Q8_0: ~29,1 GB.
  - Suplemento multimodal: +0,7 GB (mmproj-Q8_0) o +1,0 GB (mmproj-f16).
- GPU recomendadas: A100 40/80 GB o H100 para Q8_0 con contexto largo; RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; RTX 3090 (24 GB) similar; GPUs de 16 GB para Q3_K_M o IQ4_XS con contexto reducido.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizaciones Q4_K_M o inferiores; en GPUs de 16 GB con Q3_K_M o IQ4_XS; en GPUs de 12 GB solo con Q2_K y contexto muy limitado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI, pero esta publicacion concreta es GGUF.
- Latencia y throughput: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-USS-Prism-GGUF (este) | ~27,3B | 256k / 1M (segun etiquetas) | Apache 2.0 | GGUF | Cuantizaciones estaticas e imatrix; orientado a CoT, codigo y ficcion |
| Qwen2.5-32B-Instruct (referencia de la familia) | ~32B | 128k | Apache 2.0 | safetensors, GGUF | Modelo oficial de Alibaba; sin destilacion declarada |
| Gemma 2 27B | ~27B | 8k | Gemma license | safetensors, GGUF | Contexto mucho menor; licencia mas restrictiva |
| Mistral Small 24B | ~24B | 128k | Apache 2.0 | safetensors, GGUF | Menor numero de parametros; sin modo CoT extendido declarado |

No se dispone de datos de rendimiento comparativo para este modelo, por lo que la comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que el rendimiento real en tareas concretas no esta verificado.
- El modelo es una fusion/destilacion experimental (etiquetas experimental, mergekit, distillation); puede presentar comportamientos inconsistentes frente a modelos oficiales.
- Riesgo de alucinacion inherente a los modelos de ~27B, especialmente en contextos largos y tareas factuales.
- La ventana de contexto de 1M/256k aparece solo en etiquetas y no esta confirmada en la model card; el rendimiento en contextos muy largos puede degradarse y el coste de VRAM crece con el contexto.
- Idiomas declarados limitados a en, zh, ja y es; el soporte real de espanol no esta evaluado.
- La licencia Apache 2.0 se aplica a esta cuantizacion, pero conviene verificar la licencia y condiciones del modelo base nightmedia/Qwen3.8-27B-USS-Prism y de los modelos Qwen subyacentes antes de uso comercial.
- El repositorio completo ocupa 190,8 GB; es necesario descargar solo el fichero de cuantizacion deseado.
- El soporte multimodal depende del fichero mmproj y no esta documentado; su calidad es desconocida.
- No se confirma soporte de tool calling ni de agentes multi-paso.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.8-27B-USS-Prism-GGUF
- Modelo base: https://huggingface.co/nightmedia/Qwen3.8-27B-USS-Prism
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-USS-Prism-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.8-27B-USS-Prism-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests

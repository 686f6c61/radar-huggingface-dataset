# shisa-ai/Qwen3.8-27B-FP8-BLOCK

## Resumen

El modelo `shisa-ai/Qwen3.8-27B-FP8-BLOCK` es una cuantización en formato FP8_BLOCK del modelo multimodal `Qwen/Qwen3.8-27B`, desarrollada por el equipo de shisa-ai mediante la herramienta `llmcompressor`. Se trata de una conversión data-free (RTN) que reduce el peso del modelo de 51,75 GiB (BF16) a 33,90 GiB, manteniendo las proyecciones de atención lineal Gated DeltaNet (GDN) en BF16 para preservar la fidelidad de la distribución de salida. Esta decisión de diseño lo diferencia del exportado oficial `Qwen/Qwen3.8-27B-FP8`, que cuantiza también esas proyecciones.

El modelo base, Qwen3.8-27B, es un transformer híbrido con atención completa, capas de atención lineal GDN, mezcla de expertos (MoE) en las capas MLP y una torre de visión, lo que le permite procesar tanto texto como imágenes. La versión cuantizada mantiene todas las capacidades del original, incluyendo soporte para decodificación especulativa multi-token (MTP) y modo de razonamiento (thinking). La licencia Apache-2.0 permite uso comercial sin restricciones.

La relevancia de este checkpoint radica en que ofrece una calidad medida (KLD) superior al FP8 oficial y muy superior a las cuantizaciones NVFP4, con un tamaño intermedio, lo que lo convierte en una opción atractiva para despliegues en producción donde se requiera un equilibrio entre uso de memoria y fidelidad del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (atencion completa + Gated DeltaNet) con MoE y torre de vision, cuantizado FP8_BLOCK |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | no disponible (arquitectura MoE, no se especifica el numero de activos) |
| Longitud de contexto | no disponible (el modelo base soporta hasta 262.144 tokens segun la documentacion de memoria, pero no se confirma en la ficha) |
| Tipos de cuantizacion | FP8_BLOCK (E4M3, bloques de pesos estaticos 128x128, activaciones dinamicas grupo-128); proyecciones GDN en BF16 |
| Idiomas soportados | no disponible (el modelo base es multilingue, pero no se detallan los idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

El modelo base `Qwen/Qwen3.8-27B` es un transformer hibrido que combina capas de atencion completa (16 capas) con capas de atencion lineal Gated DeltaNet (48 capas), y utiliza una arquitectura de mezcla de expertos (MoE) en las capas MLP (64 capas). Incluye una torre de vision para procesamiento de imagenes y soporta generacion de texto, razonamiento y tareas de imagen-texto. El entrenamiento original del base no se detalla en la informacion disponible, pero se sabe que es un modelo de la serie Qwen3.8 con capacidades conversacionales y multimodales.

La cuantizacion fue realizada con `llmcompressor` usando el metodo `model_free_ptq` (post-training quantization sin calibracion, basado en round-to-nearest). El esquema FP8_BLOCK utiliza bloques de pesos estaticos de 128x128 en formato E4M3 y activaciones FP8 dinamicas con grupo de 128. La innovacion principal es que las proyecciones de las capas GDN (`in_proj_qkv`, `in_proj_z`, `out_proj` y la ruta de estado) se mantienen en BF16, mientras que las proyecciones de atencion completa y las capas MLP se cuantizan a FP8. Esta politica reduce la perdida de calidad respecto al exportado oficial, que cuantiza tambien las proyecciones GDN, a costa de un peso ligeramente mayor (33,90 GiB frente a 28,75 GiB).

## Capacidades

- Generacion de texto, razonamiento y codigo: hereda las capacidades del modelo base Qwen3.8-27B, que es un modelo de lenguaje de proposito general.
- Procesamiento multimodal imagen-texto: al ser un modelo `image-text-to-text`, puede recibir imagenes y generar texto descriptivo o responder preguntas sobre ellas.
- Soporte de decodificacion especulativa MTP (Multi-Token Prediction): permite acelerar la inferencia generando varios tokens a la vez, con soporte en SGLang y vLLM.
- Modo de razonamiento (thinking): el modelo puede activar un modo de pensamiento interno para tareas complejas, segun se menciona en las pruebas de rendimiento.
- Capacidades de agente: la documentacion menciona "multi-stream agentic", lo que indica soporte para multiples flujos de agente en paralelo.
- Tool calling y function calling: no se especifica explicitamente, pero es una capacidad comun en la serie Qwen3.8; se recomienda consultar la model card del base para confirmar.

## Casos de uso

- Despliegue en produccion con restricciones de VRAM: gracias a la cuantizacion FP8, el modelo ocupa 33,90 GiB en lugar de 51,75 GiB, lo que permite ejecutarlo en GPUs de 48 GB o menos con margen para cache KV. Es adecuado para entornos donde se necesite un modelo de 27B con calidad cercana al BF16.
- Inferencia multimodal en aplicaciones de vision: al mantener la torre de vision en BF16, el modelo puede procesar imagenes y generar descripciones o responder preguntas visuales con alta fidelidad, util en sistemas de moderacion de contenido, asistencia visual o documentacion automatica.
- Agentes conversacionales con razonamiento multi-paso: el soporte para modo thinking y la capacidad de gestionar multiples flujos de agente permiten construir asistentes que planifican y ejecutan tareas complejas, como busquedas de informacion o automatizacion de procesos.
- Generacion de codigo asistida: el modelo base es competente en tareas de programacion; la cuantizacion mantiene la calidad suficiente para integrarse en entornos de desarrollo como autocompletado o revision de codigo.
- Procesamiento de documentos largos: aunque la longitud de contexto no se confirma en la ficha, el modelo base soporta hasta 262.144 tokens; con la cuantizacion FP8, es viable procesar documentos extensos en GPUs de alta capacidad, como resumen de contratos o analisis de informes.
- Traduccion y tareas multilingues: el modelo base es multilingue, y la cuantizacion no afecta a las capacidades linguisticas; puede usarse para traduccion automatica o generacion de contenido en varios idiomas, siempre que se verifique el rendimiento en el idioma objetivo.

## Benchmarks y rendimiento

La model card no proporciona resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K), pero incluye metricas de fidelidad de distribucion (KLD) y rendimiento de servicio.

**Fidelidad de distribucion (KLD) frente al BF16 base** (menor es mejor):

| Checkpoint | Pesos | Mean KLD | Median KLD | p99 KLD | Top-1 |
|---|---:|---:|---:|---:|---:|
| Qwen/Qwen3.8-27B (BF16 base) | 51,75 GiB | 0 (ref) | 0 (ref) | 0 (ref) | 100% |
| **Qwen3.8-27B-FP8-BLOCK (este modelo)** | **33,90 GiB** | **0,004110** | **0,001737** | **0,041333** | **97,18%** |
| Qwen/Qwen3.8-27B-FP8 (oficial) | 28,75 GiB | 0,005189 | 0,002024 | 0,052687 | 96,93% |
| Qwen3.8-27B-FP8-BLOCK-GDN8 (clon politica oficial) | 28,75 GiB | 0,005253 | 0,002033 | 0,053828 | 96,86% |
| unsloth/Qwen3.8-27B-NVFP4 | 21,81 GiB | 0,030155 | 0,009493 | 0,335824 | 93,14% |
| RadixArk/Qwen3.8-27B-NVFP4 | 20,42 GiB | 0,041985 | 0,015005 | 0,465240 | 91,55% |

**Rendimiento de servicio con MTP** (RTX PRO 6000 Blackwell, contexto 32.768 tokens, FP8 KV cache, 128 prompts ShareGPT):

| Metrica | SGLang MTP | vLLM MTP |
|---|---:|---:|
| Prefill c=1 (tok/s) | 84,3 | 79,0 |
| Decode c=1 (tok/s) | 91,4 | 85,7 |
| Decode c=32 (tok/s) | 1207,4 | 1017,5 |
| TTFT p50 c=1 (ms) | 66,6 | 70,6 |
| TPOT p50 c=1 (ms) | 10,9 | 11,6 |

Los resultados muestran que este checkpoint es el mas cercano al BF16 base en terminos de KLD, superando al FP8 oficial en ~0,001 de KLD medio, y es ~10 veces mas ajustado que las cuantizaciones NVFP4. En rendimiento, SGLang con MTP supera a vLLM en un +7% en decode c=1 y +19% en decode c=32.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 33,90 GiB, por lo que se necesita al menos 34 GB de VRAM solo para los pesos. Con cache KV y overhead, se recomienda una GPU de 48 GB o superior para inferencia estandar. Para MTP con SGLang y copia de draft, el consumo total es de ~67,8 GB, dejando ~17 GB de cache KV en una GPU de 96 GB con mem-fraction 0,95.
- GPUs recomendadas: RTX PRO 6000 Blackwell (96 GB), A100 80 GB, H100 80 GB, o GPUs consumer de 48 GB como la RTX 6000 Ada. No cabe en GPUs de 24 GB (RTX 4090) sin cuantizacion adicional.
- Opciones de despliegue: compatible con vLLM (soporta MTP compartiendo pesos) y SGLang (con MTP, aunque con copia de draft separada en la version 0.5.17). Tambien es compatible con transformers para inferencia directa.
- Latencia y throughput: con SGLang MTP, TTFT p50 de 66,6 ms y TPOT p50 de 10,9 ms para un solo request; con 32 requests concurrentes, throughput de 1207,4 tok/s en decode.

## Comparativa con modelos similares

| Modelo | Parametros | Pesos | Cuantizacion | Mean KLD | Licencia |
|---|---:|---:|---|---|---|
| **Qwen3.8-27B-FP8-BLOCK (este)** | 27,78 B | 33,90 GiB | FP8_BLOCK + GDN BF16 | 0,004110 | Apache-2.0 |
| Qwen/Qwen3.8-27B-FP8 (oficial) | 27,78 B | 28,75 GiB | FP8_BLOCK completo | 0,005189 | Apache-2.0 |
| unsloth/Qwen3.8-27B-NVFP4 | 27,78 B | 21,81 GiB | NVFP4 | 0,030155 | Apache-2.0 |
| RadixArk/Qwen3.8-27B-NVFP4 | 27,78 B | 20,42 GiB | NVFP4 | 0,041985 | Apache-2.0 |

Este modelo ofrece el mejor equilibrio entre fidelidad y tamaño entre las opciones cuantizadas: es un 35% mas pequeño que el BF16 base, con una perdida de calidad minima (KLD 0,004), y supera al FP8 oficial en calidad a costa de 5 GB adicionales. Las alternativas NVFP4 son mas ligeras pero con una degradacion mucho mayor.

## Limitaciones y advertencias

- La cuantizacion es data-free (RTN) sin calibracion; aunque los resultados de KLD son buenos, no se han evaluado benchmarks de tareas especificas (MMLU, HumanEval, etc.) en esta version cuantizada.
- El mantenimiento de las proyecciones GDN en BF16 aumenta el peso respecto al FP8 oficial (33,90 GiB vs 28,75 GiB), lo que puede ser un inconveniente si el espacio en disco o VRAM es critico.
- La cuantizacion FP8 requiere soporte del backend de inferencia; no todos los frameworks o versiones de vLLM/SGLang soportan FP8_BLOCK con compressed-tensors. Se recomienda verificar la compatibilidad antes de desplegar.
- Con SGLang 0.5.17, el modo MTP con draft del mismo checkpoint carga una copia completa de los pesos, duplicando el uso de VRAM (~67,8 GB). vLLM comparte pesos pero es mas lento.
- El modelo base puede presentar sesgos y alucinaciones inherentes a los LLM; la cuantizacion no corrige estos problemas.
- No se dispone de informacion sobre los idiomas soportados ni la longitud de contexto exacta en esta ficha; se debe consultar la model card del base para detalles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shisa-ai/Qwen3.8-27B-FP8-BLOCK
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Herramienta de cuantizacion: https://github.com/vllm-project/llm-compressor (inferido, no confirmado en la ficha)

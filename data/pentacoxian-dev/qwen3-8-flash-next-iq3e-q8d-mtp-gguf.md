# pentacoxian-dev/Qwen3.8-Flash-Next-IQ3E-Q8D-MTP-GGUF

## Resumen

Qwen3.8-Flash-Next es un modelo de lenguaje de gran escala desarrollado por el equipo Qwen (Alibaba). Esta ficha describe una cuantización GGUF comunitaria publicada por `pentacoxian-dev`, no el checkpoint original: se trata de un único fichero de aproximadamente 80 GiB que combina expertos enrutados `UD-IQ3_XXS`, tensores densos en Q8_0 y una cabeza de predicción multi-token (MTP) reconvertida a Q8_0. El objetivo declarado es que el modelo completo quepa en 2× Nvidia Tesla V100 de 32 GB y pueda decodificar de forma especulativa mediante MTP.

La relevancia de esta publicación es fundamentalmente de ingeniería: añade soporte para la arquitectura `qwen4exp` con tensores `nextn` a llama.cpp, implementa decodificación especulativa MTP, y aporta optimizaciones específicas para `sm_70` (atención QSA dispersa, kernels fusionados, argmax en GPU). Requiere un llama.cpp parcheado en la versión `v0.5.0`; ni llama.cpp estándar, ni Ollama, ni LM Studio pueden cargar el fichero.

El modelo base tiene 180.186.749.568 parámetros totales según los safetensors del repositorio original. La información disponible no detalla el número de parámetros activos, la longitud de contexto oficial del checkpoint ni la composición del dataset de entrenamiento del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `qwen4exp` (transformer con mezcla de expertos y cabeza MTP `nextn`), según los tags y el README de la cuantización |
| Parámetros totales | 180.186.749.568 (dato de safetensors del modelo base) |
| Parámetros activos | no disponible |
| Longitud de contexto | 256K tokens (mencionado en el README en relación con la entrada de imagen; no se especifica si es el máximo oficial del checkpoint) |
| Tipos de cuantización | Mezcla por tensor: expertos enrutados `UD-IQ3_XXS`, tensores densos Q8_0, cabeza MTP Q8_0, LM head de borrador Q4_0, cabeza de salida del modelo objetivo Q6_K |
| Idiomas soportados | no disponible |
| Licencia | `qwen-community-1.0` (etiqueta `other` en la model card) |
| Formato de pesos | GGUF (fichero único, 85.923.705.344 bytes, ~80 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de 180.186 millones de parámetros totales. La cuantización preserva la estructura MoE: los expertos enrutados se toman de la variante `UD-IQ3_XXS` de unsloth (revisión `c8b5954a88c2775c546b92593eda40ea041d3176`), mientras que los tensores no-expertos (densos) proceden de los tensores Q8_0 de `UD-IQ4_XS` de la misma fuente. La tabla de embeddings por capa (PLE) también proviene de `UD-IQ3_XXS`.

La innovación principal de esta publicación es la reintegración de la cabeza de predicción multi-token (MTP). Los GGUF de unsloth no incluyen la cabeza MTP, por lo que el autor la convirtió por separado con `convert_hf_to_gguf.py --mtp` desde el checkpoint original de Qwen (revisión `de4b8e4d43b917e7706784d8bb445c9af86a3540`), cuantizándola a Q8_0 y añadiéndola al tronco. Esto habilita decodificación especulativa en llama.cpp. Además, los parches del runtime añaden soporte para `qwen4exp` (incluido el port de MoE FreeToken, con licencia Apache-2.0), reparto tensorial con AllReduce en grafo sobre NVLink o PCIe peer-to-peer, kernels fusionados de hyper-conexión para hasta 8 tokens, y optimizaciones para V100 (`sm_70`): atención QSA dispersa, kernels fusionados y argmax en GPU. El parche v3 añade entrada de imagen a contexto completo de 256K cargando el codificador visual bajo demanda (presta 2 GB de pesos en la GPU 0 durante la codificación) y corrige una condición de carrera en un kernel fusionado que producía NaN en contextos largos con imágenes.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo base utilizó RLHF o DPO.

## Capacidades

- Generación de texto conversacional (tag `conversational` en el repositorio).
- Decodificación especulativa mediante cabeza MTP, con pase de borrador a forma fija.
- Entrada de imagen con el proyector visual de unsloth (no incluido en este repositorio), soportada a contexto completo de 256K con el parche v3.
- Razonamiento multi-turno y contexto largo (hasta 256K tokens según el README).
- Capacidades multilingües: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Inferencia de un MoE de 180B en hardware Volta legacy: el reparto por tensores y la cuantización mixta permiten ejecutar el modelo completo en 2× Tesla V100 de 32 GB, un escenario habitual en clústeres universitarios y entornos con GPUs de generación anterior.
- Decodificación de baja latencia con MTP: la cabeza de predicción multi-token permite generar varios tokens por paso de verificación, útil en servicios de chat donde la latencia por token es crítica y el hardware no permite mayor paralelismo.
- Procesamiento de documentos largos: con 256K tokens de contexto, el modelo puede ingerir contratos, informes o bases de código completas en una sola pasada, siempre que el prompt quepa en la VRAM disponible tras cargar los pesos.
- Análisis de imágenes con texto asociado: con el proyector visual de unsloth y el parche v3, se pueden realizar tareas de VQA o descripción de documentos escaneados manteniendo contexto largo, aunque el codificador visual se carga bajo demanda y añade latencia.
- Investigación en decodificación especulativa: el repositorio sirve como referencia reproducible para estudiar el impacto de MTP en throughput y aceptación de borradores sobre arquitecturas MoE.
- Despliegue en entornos air-gapped: al ser un fichero GGUF único con parches versionados, el stack completo (llama.cpp v0.5.0 + parche v3 + NCCL) puede replicarse sin dependencias de servicios en la nube.
- Evaluación comparativa de cuantizaciones mixtas: la combinación IQ3_XXS/Q8_0 permite medir la degradación de perplejidad frente a cuantizaciones más agresivas o más conservadoras en un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README únicamente aporta datos de rendimiento relativos: el reparto tensorial es aproximadamente un 20 % más rápido en decodificación que el reparto por capas, y la ruta rápida de atención dispersa evita que una imagen en contexto reduzca la velocidad de decodificación a la mitad a 56K tokens y a un tercio a 133K. No se proporcionan valores absolutos de tokens por segundo ni puntuaciones en MMLU, HumanEval, GSM8K u otras pruebas.

## Requisitos de hardware

- VRAM estimada: 2× 32 GB (64 GB totales) para el fichero completo de ~80 GiB con reparto tensorial; el tamaño del fichero excede la VRAM agregada, por lo que parte de los tensores debe residir en memoria del sistema o el reparto debe ajustarse.
- GPU recomendadas: 2× Nvidia Tesla V100 de 32 GB (objetivo explícito del autor). No se documenta compatibilidad con A100, H100 ni RTX 4090.
- GPU de consumo: no cabe en ninguna GPU de consumo individual; se requieren al menos dos GPUs con 32 GB cada una.
- Despliegue: exclusivamente llama.cpp `v0.5.0` con el parche `llama-v0.5.0-v100-v3.patch` (recomendado). Requiere CUDA 12.8 o superior (el código FreeToken usa `cuda_fp4.h`) y, para Volta, CUDA 12.x (CUDA 13 no compila para `sm_70`). NCCL se activa por defecto (`GGML_CUDA_NCCL`) y CMake debe encontrarlo; se sugiere la rueda `nvidia-nccl-cu12==2.27.3`.
- Incompatibilidades: llama.cpp estándar, Ollama y LM Studio no pueden cargar el fichero. Los parches v4 y v5 fueron retirados por regresiones.
- Latencia y throughput: no disponibles en valores absolutos; solo se documentan mejoras relativas (≈20 % en decodificación con reparto tensorial frente a reparto por capas).

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (esta cuantización, pentacoxian-dev) | 180.186.749.568 | 256K (según README) | GGUF mixto IQ3_XXS/Q8_0 + MTP | qwen-community-1.0 | Hugging Face, requiere llama.cpp parcheado v0.5.0 |
| Qwen/Qwen3.8-Flash-Next (checkpoint original) | 180.186.749.568 | no disponible | safetensors | qwen-community-1.0 | Hugging Face |
| unsloth/Qwen3.8-Flash-Next-GGUF (UD-IQ3_XXS / UD-IQ4_XS) | 180.186.749.568 | no disponible | GGUF estándar, sin cabeza MTP | qwen-community-1.0 | Hugging Face, llama.cpp estándar |

La diferencia principal frente a las alternativas es la presencia de la cabeza MTP y los parches de runtime para V100; el checkpoint original y los GGUF de unsloth no ofrecen decodificación especulativa ni las optimizaciones para `sm_70`. No se dispone de datos de benchmarks que permitan comparar calidad entre estas variantes.

## Limitaciones y advertencias

- Requiere un llama.cpp parcheado específicamente; el fichero no carga en herramientas estándar, lo que limita su integración en pipelines existentes.
- Los parches v4 y v5 fueron retirados por regresiones; usar exclusivamente v3.
- El parche v1 abortaba con prompts de más de ~1.000 tokens en modo reparto tensorial; aunque v2 lo corrige, conviene validar prompts largos en el despliegue propio.
- La entrada de imagen requiere el proyector visual de unsloth, que no está incluido en este repositorio.
- El codificador visual se carga bajo demanda prestando 2 GB de pesos en la GPU 0, lo que añade latencia y complejidad operativa.
- La cuantización mixta IQ3_XXS para expertos implica pérdida de precisión frente al checkpoint original; no se publican métricas de perplejidad que cuantifiquen la degradación.
- Licencia `qwen-community-1.0`: es necesario revisar el fichero `LICENSE` del repositorio para conocer las restricciones de uso comercial, que no se detallan en la información disponible.
- No se dispone de información sobre sesgos, tasas de alucinación ni cobertura idiomática del modelo base.
- El tamaño del fichero (~80 GiB) excede la VRAM agregada de 64 GB de las dos V100, por lo que el rendimiento depende del offloading y del reparto configurado.

## Enlaces

- Repositorio Hugging Face de la cuantización: https://huggingface.co/pentacoxian-dev/Qwen3.8-Flash-Next-IQ3E-Q8D-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GGUF de unsloth (fuente de los tensores): https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- llama.cpp (rama v0.5.0): https://github.com/ggml-org/llama.cpp
- Commit con los parches retirados v4/v5: https://huggingface.co/pentacoxian-dev/Qwen3.8-Flash-Next-IQ3E-Q8D-MTP-GGUF/commit/21dbbdb8e3f17ecfec94a1d780a07c9dc9448afd

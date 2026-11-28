# ahrazzle/SiliGemma-4-E2B-FormA

## Resumen

SiliGemma-4-E2B-FormA es una versión cuantizada y modificada estructuralmente del modelo google/gemma-4-E2B-it, publicada por el usuario ahrazzle bajo el sello Moissanite-Labs. No es un fine-tune convencional: el autor aplica una receta propietaria denominada siliquant-hf-v1 (recipe S182B4-H1_L10_27_Anchor-seed1753-A16-BlockH4-FTPIWL-CalmValves-BOS2) que combina cuantización post-entrenamiento de tipo lattice A16-BlockH4, poda de tensores KV muertos y una técnica de anclaje de capas intermedias (L10..27) entrenada mediante estrategias de búsqueda evolutiva sin retropropagación (zero-backprop ES).

El modelo parte de la arquitectura Gemma 4 multimodal (image-text-to-text), con 3.914.129.083 parámetros totales según el archivo safetensors, y se distribuye como un drop-in compatible con transformers para generación de texto. La propuesta principal es reducir el peso del checkpoint (6,7 GB) y el uso de VRAM mediante cuantización de las 276 capas lineales de texto a 5,13 bits por peso efectivos, manteniendo los pesos de embedding en BF16, incluyendo una tabla de embeddings por capa (PLE) de 4,375 GiB que se mantiene fijada en RAM de CPU en lugar de VRAM.

Es relevante ahora porque documenta un flujo completo de compresión agresiva con métricas verificadas de perplejidad en dominios concretos (WT2, Countdown, GSM8K out-of-distribution) y porque el autor publica tanto la variante portable (Form A, este repo) como una variante nativa para sm_86 (Form B). Sin embargo, el modelo es de nicho: el propio autor lo enmarca en su línea de investigación SiliQuant, con idioma declarado únicamente inglés y sin benchmarks estándar publicados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only multimodal (Gemma 4), con KV sharing en capas superiores y Per-Layer Embeddings (PLE); cuantización A16-BlockH4 en capas lineales de texto |
| Parametros totales | 3.914.129.083 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | A16-BlockH4 (Extended Hamming, g=128, k_bits=4) en 276 lineales de texto; BF16 en embeddings; FP32 en normas y layer_scalar |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 (heredada de google/gemma-4-E2B-it) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo deriva de google/gemma-4-E2B-it, un transformer decoder-only multimodal de la familia Gemma 4 con capacidad image-text-to-text. La modificación principal afecta a las 276 capas lineales 2D de texto (1.876.819.968 pesos), cuantizadas a un esquema de lattice A16-BlockH4 con 4 bits por grupo y overflow CSR, alcanzando 5,1296 bits por peso en esas capas y 1.203.427.606 bytes. Además, se podan 60 tensores KV estructuralmente muertos (k_proj, v_proj, k_norm) en las capas L15..34, que operan mediante KV sharing con un hub compartido en L10..L14.

El entrenamiento posterior no usa retropropagación: el autor emplea búsqueda evolutiva (zero-backprop ES) para ajustar un conjunto reducido de parámetros ancla en las capas L10..27 (46 lineales, d=638.976), seleccionando la semilla 1753 tras validar 3 semillas. También documenta un ajuste de tokenizador crítico: forzar bos_token_id=2 en cada secuencia reduce la NLL de WT2_test de 11,101388 a 4,648381 nats. La tabla de Per-Layer Embeddings (262.144 x 8.960 en BF16, 4,375 GiB) se mantiene anclada en RAM de CPU con streaming de 17.920 B por token, reservando 0 B de VRAM.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Gemma 4.
- Procesamiento image-text-to-text según la pipeline declarada (image-text-to-text), aunque la model card no detalla el módulo de visión.
- Razonamiento aritmético limitado: el autor reporta Pass@1 de 11,72 % en Countdown y 43,75 % en GSM8K out-of-distribution (sobre NLL de gold).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según el campo language.
- Modo thinking explícito: no disponible en la información proporcionada.
- Inferencia con prefijo cacheado L0..L9 (28,57 % de capas) con speedup mediano de 1,266x en modo sufijo AB/BA.

## Casos de uso

- Investigación en cuantización post-entrenamiento: sirve como artefacto reproducible para estudiar esquemas lattice A16-BlockH4 frente a cuantizaciones escalares, con métricas de NLL y desviación de logits documentadas (0,0 de error máximo con prefijo cacheado).
- Despliegue en GPU de consumo con VRAM ajustada: el checkpoint de 6,7 GB y el pico de 5.019,9 MiB de VRAM reportado en una RTX 3080 Laptop permiten ejecutar el modelo en tarjetas de 8 GB, algo inviable con el modelo base en BF16 completo.
- Evaluación de robustez de tokenizadores: el caso del bos_token_id=2 documentado permite reproducir el impacto de la tokenización en la perplejidad y usarlo como prueba de regresión en pipelines de evaluación.
- Experimentos de poda estructurada: los 60 tensores KV muertos podados en L15..34 sirven de referencia para estudiar el efecto de la poda en modelos con KV sharing.
- Generación de texto en inglés en entornos con RAM de sistema abundante y VRAM limitada: la PLE anclada en CPU (4,375 GiB) permite separar el coste de memoria entre host y dispositivo.
- Reproducción de experimentos de búsqueda evolutiva sin gradientes: el modelo y el repo siligemma permiten replicar el ajuste de anclas L10..27 con semillas fijas y comparar contra las variantes H0/H1/H2.
- Fine-tuning ligero sobre la variante cuantizada: al mantener normas y layer_scalar en FP32 y embeddings en BF16, es posible entrenar adaptadores sobre las partes no cuantizadas, aunque no se documenta soporte oficial.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (NLL sobre conjuntos de test, GPU RTX 3080 Laptop 8 GB, sm_86):

| Configuracion | WT2_test NLL | CD_test GT NLL (Pass@1) | GSM8K_OOD Gold NLL (Pass@1) |
|---|---|---|---|
| H0_Base_A16 (35L frozen A16) | 5,116801 | 1,397878 (10,94 %) | 1,846517 (45,31 %) |
| H1_L10_27_Anchor (media 3 semillas) | 5,039570 | 1,253168 (11,98 %) | 1,734985 (43,23 %) |
| H1_L10_27_Anchor seed=1753 (artefacto publicado) | 4,945025 | 1,240732 (11,72 %) | 1,681543 (43,75 %) |
| H2_KVHub_Plus_Sanctuary (valve_sigma=0,003) | 4,895686 | 1,293634 (11,46 %) | 1,679504 (no disponible) |
| H2_KVHub_Sanctuary_CalmValves (valve_sigma=0,0005) | 4,922321 | 1,300269 (11,20 %) | 1,669843 (38,54 %) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K few-shot, etc.) en la información disponible. Las cifras anteriores son métricas internas de NLL y Pass@1 sobre conjuntos propios del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: pico de 5.019,9 MiB reportado por el autor en RTX 3080 Laptop (8.192 MiB), con límite declarado de 5.939,2 MiB.
- GPU recomendadas: el autor valida en NVIDIA GeForce RTX 3080 Laptop (sm_86); la variante Form A es un drop-in portable para transformers, la Form B es nativa para sm_86.
- Cabe en GPU de consumo: sí, con 8 GB de VRAM, siempre que la tabla PLE (4,375 GiB) permanezca en RAM de CPU; el streaming consume 17.920 B por token desde host.
- RAM de sistema: se requiere espacio suficiente para fijar la PLE de 4,375 GiB en memoria de host, además del checkpoint de 6,7 GB en disco.
- Opciones de despliegue: transformers (librería declarada); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible. Solo se reporta un speedup mediano de 1,266x (1,265x en S182b4) al cachear el prefijo L0..L9 en rollouts de sufijo.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SiliGemma-4-E2B-FormA | 3.914.129.083 | no disponible | apache-2.0 | Hugging Face (repo propio) | Cuantización A16-BlockH4, PLE en CPU, métricas internas del autor |
| google/gemma-4-E2B-it (base) | no disponible en la información | no disponible | apache-2.0 | Hugging Face | Modelo upstream BF16, sin cuantización ni poda |
| SiliGemma-4-E2B-FormB-Native | no disponible | no disponible | apache-2.0 (presumible, heredada) | Hugging Face (repo del mismo autor) | Variante nativa sm_86, kernel bare-metal |

No se dispone de datos de benchmarks estándar ni de otros modelos comparables de la misma categoría en la información proporcionada, por lo que la comparación cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- Idiomas: solo inglés declarado; no hay evidencia de calidad en castellano ni en otros idiomas.
- Contexto: la longitud de contexto no se documenta; no debe asumirse la del modelo base sin verificación.
- Alucinación: no se reportan evaluaciones de factualidad ni de tasas de alucinación; el modelo base es conversacional y propenso a ello.
- Sesgos: no se documentan análisis de sesgo; se heredan los del modelo base google/gemma-4-E2B-it.
- Licencia: apache-2.0 heredada, pero el autor incluye un NOTICE_UPSTREAM_LICENSE.txt que conviene revisar antes de uso comercial; la licencia de Gemma puede imponer condiciones adicionales de uso aceptable.
- Reproducibilidad: las métricas provienen de una única GPU de portátil con estado de energía no controlado (UNCONTROLLED_LAPTOP_NOT_CLAIMED), lo que limita la comparabilidad.
- Dependencia de hardware: el rendimiento y la corrección dependen de mantener la PLE en CPU y de forzar bos_token_id=2; omitir este último degrada gravemente la NLL (de 4,648381 a 11,101388 nats en WT2_test).
- Madurez: 0 descargas y 0 likes en el momento de la ficha; es un artefacto de investigación sin validación comunitaria.
- Compatibilidad: no se documenta soporte en runtimes distintos de transformers; la variante Form B requiere sm_86.
- Poda y cuantización: las 60 cabezas KV podadas y la cuantización a 5,13 bpw pueden afectar a tareas distintas de las evaluadas (WT2, Countdown, GSM8K OOD); no hay evaluación multimodal publicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ahrazzle/SiliGemma-4-E2B-FormA
- Variante nativa Form B: https://huggingface.co/ahrazzle/SiliGemma-4-E2B-FormB-Native
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Repositorio de kernels y verificación: https://github.com/Moissanite-Labs/siligemma
- Licencia del modelo: LICENSE (en el repositorio de Hugging Face)
- Aviso de licencia upstream: NOTICE_UPSTREAM_LICENSE.txt (en el repositorio de Hugging Face)

# AtomicChat/Inkling-2-Mini-GGUF

## Resumen

Inkling-2-Mini es un modelo de mezcla de expertos (MoE) de 26.400 millones de parámetros totales con 3.400 millones activos, desarrollado por Thinking Machines, que acepta entrada de texto e imagen. La versión aquí descrita es la cuantización GGUF publicada por AtomicChat, pensada para ejecución local con llama.cpp y compatible con endpoints. Su arquitectura incorpora un núcleo con bucles (looped core): las 12 capas centrales de sus 24 capas se ejecutan tres veces, lo que da 48 pasadas de capa efectivas.

El modelo resulta relevante porque combina una ventana de contexto eficiente (solo 4 de las 24 capas usan atención completa; el resto emplea una ventana de 1024 tokens, lo que mantiene pequeña la caché KV) con un reparto de expertos que concentra el 94% de los pesos, permitiendo cuantizaciones agresivas sin degradar demasiado la calidad. La licencia Apache-2.0 facilita su uso comercial.

AtomicChat publica 15 archivos GGUF con recetas por tensor (formato AD, Atomic Dynamic), midiendo la fidelidad frente al BF16 original con top-1 y divergencia KL. Los archivos de 4 bits alcanzan un 96-97% de top-1, y el Q8_0 llega al 97,7%, que el autor considera el techo práctico del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE con núcleo con bucles (looped core); 24 capas, las 12 centrales ejecutadas 3 veces (48 pasadas) |
| Parámetros totales | 26.070.385.152 (26,4B) |
| Parámetros activos | 3,4B (128 expertos, 8 activos) |
| Longitud de contexto | No disponible en la información proporcionada (se documenta una ventana de atención de 1024 tokens en 20 de las 24 capas) |
| Tipos de cuantización | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, AD-Q6_K, AD-Q5_K, AD-Q4_K, AD-IQ4_XS, AD-IQ3_S, AD-IQ3_XXS, AD-IQ2_S, AD-IQ2_XXS, AD-IQ2_M, AD-IQ2_XXS-Q2, AD-IQ1_M, AD-IQ1_S |
| Idiomas soportados | No disponibles (el corpus de evaluación cubre 30 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos con 24 capas, 128 expertos y 8 activos por token, sobre el que se aplica un mecanismo de bucle: las 12 capas intermedias se recorren tres veces, de modo que un token atraviesa 48 pasadas de capa. Solo 4 de las 24 capas utilizan atención completa; las demás usan una ventana de 1024 tokens, lo que reduce drásticamente el tamaño de la caché KV en inferencia. El modelo procesa texto e imagen mediante un proyector de visión separado (mmproj).

Los detalles de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles en la información proporcionada. La model card de AtomicChat solo documenta el proceso de cuantización: medición de top-1 y divergencia KL frente a los logits BF16 generados en una H100, con 87 fragmentos de 4096 tokens sobre un corpus neutro en 30 idiomas, usando `llama-perplexity --kl-divergence` de llama.cpp (PR #32695). La matriz de importancia y las recetas por tensor están publicadas en el dataset de métricas.

## Capacidades

- Generación de texto conversacional multi-turno.
- Entrada de imagen (pipeline image-text-to-text) mediante proyector de visión F16, BF16 o Q8_0.
- Razonamiento y respuesta a instrucciones (etiqueta `conversational`).
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Ejecución local y offline mediante llama.cpp.
- Capacidades multilingües: el corpus de evaluación cubre 30 idiomas, aunque no se detalla la lista oficial de idiomas soportados.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponibles en la información proporcionada.

## Casos de uso

- Asistente conversacional local: el modelo puede mantener conversaciones multi-turno en máquinas de consumo gracias a que los archivos de 4 bits ocupan entre 16,5 y 17,4 GB y la caché KV es reducida (solo 4 capas con atención completa).
- Análisis de documentos con imágenes: al aceptar entrada image-text-to-text, puede describir capturas, diagramas o documentos escaneados junto con texto, usando el proyector de visión Q8_0 (0,35 GB) en equipos con poca memoria.
- Despliegue en portátiles y estaciones de trabajo sin GPU de datacenter: los archivos AD-IQ3_S (13,34 GB) y AD-IQ4_XS (15 GB) permiten ejecutar el modelo en GPUs de consumo de 16-24 GB con una fidelidad top-1 del 94-96%.
- Procesamiento por lotes en servidores con A10 o H100: los archivos Q8_0 (27,74 GB) y AD-Q6_K (23,79 GB) ofrecen calidad casi BF16 (97,6-97,7% top-1) para pipelines de generación a gran escala.
- Experimentación e investigación sobre arquitecturas MoE con bucles: el modelo sirve para estudiar el efecto del bucle de capas en la cuantización, ya que el autor documenta que el redondeo se acumula a lo largo de las 48 pasadas.
- Evaluación de cuantizaciones en producción: el conjunto de métricas publicado (top-1 y KLD por archivo) permite elegir el compromiso tamaño/calidad con datos medidos, por ejemplo AD-Q4_K con calidad de Q5_K_M y 3,3 GB menos.
- Integración en aplicaciones de chat de escritorio: la etiqueta `endpoints_compatible` y el soporte de llama.cpp facilitan conectarlo a clientes compatibles con la API de OpenAI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se publican métricas de fidelidad de cuantización frente al BF16:

| Archivo | Tamaño (GB) | Top-1 | KLD media |
|---|---:|---:|---:|
| BF16 (referencia) | 52,2 | — | — |
| Q8_0 | 27,74 | 97,7% | 0,0033 |
| AD-Q6_K | 23,79 | 97,6% | 0,0037 |
| Q6_K | 23,40 | 97,3% | 0,0047 |
| Q5_K_M | 19,81 | 96,3% | 0,0079 |
| AD-Q5_K | 19,07 | 97,1% | 0,0052 |
| Q4_K_M | 17,38 | 94,7% | 0,0165 |
| AD-Q4_K | 16,53 | 96,3% | 0,0080 |
| AD-IQ4_XS | 15,00 | 95,8% | 0,0101 |
| AD-IQ3_S | 13,34 | 94,2% | 0,0205 |
| AD-IQ3_XXS | 12,58 | 93,3% | 0,0271 |
| AD-IQ2_S | 11,56 | 91,3% | 0,047 |
| AD-IQ2_XXS | 10,43 | 88,5% | 0,084 |
| AD-IQ2_M | 8,67 | 85,7% | 0,130 |
| AD-IQ2_XXS-Q2 | 7,90 | 84,3% | 0,158 |
| AD-IQ1_M | 7,26 | 81,1% | 0,236 |
| AD-IQ1_S | 6,88 | 79,5% | 0,278 |

Medición realizada con `llama-perplexity --kl-divergence` (PR #32695) sobre 87 fragmentos de 4096 tokens en 30 idiomas, con logits BF16 de referencia generados en una H100 y ejecución en H100 y A10.

## Requisitos de hardware

- VRAM estimada: el tamaño del archivo más la caché KV más aproximadamente 1 GB de buffers. La caché KV es pequeña porque solo 4 de las 24 capas usan atención completa.
- GPU de consumo: los archivos AD-IQ3_S (13,34 GB) y AD-IQ4_XS (15 GB) caben en GPUs de 16 GB; AD-Q4_K (16,53 GB) y Q4_K_M (17,38 GB) requieren 24 GB (RTX 3090, RTX 4090). Los archivos de 1-2 bits (6,88-11,56 GB) caben en GPUs de 8-12 GB.
- GPU profesionales: Q8_0 (27,74 GB) y AD-Q6_K (23,79 GB) se ejecutan en A10 (24 GB) y H100; el BF16 (52,2 GB) requiere H100 de 80 GB o varias GPU.
- Despliegue: llama.cpp (build b12600 o b12603; los presets Q5_K_M y Q4_K_M están en el layout del PR #32695 y no cargan en b12600). Compatible con endpoints.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de tareas que permitan una comparación de rendimiento con modelos alternativos. A continuación se comparan solo los datos estructurales conocidos:

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini (este) | 26,4B | 3,4B | No disponible | Apache-2.0 | GGUF en HF, base en HF |
| Alternativas de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El techo de fidelidad del modelo es del 97,7% de top-1 incluso en Q8_0; el autor atribuye la pérdida al redondeo acumulado en las 48 pasadas del bucle, aunque no lo ha verificado.
- Los archivos de 1 y 2 bits degradan notablemente la calidad (top-1 entre 79,5% y 91,3%; KLD de hasta 0,278) y solo deberían usarse cuando no quepa nada mayor.
- Los presets Q5_K_M y Q4_K_M de llama.cpp están en el layout del PR #32695 y no cargan en la build b12600.
- Los nombres de los presets no reflejan el tipo real de todos los tensores: llama.cpp sustituye el tipo en la proyección down de los expertos (filas de 1152) por Q8_0/Q5_1 en Q6_K/Q5_K_M y por Q8_0/Q5_0 en Q4_K_M.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas oficialmente soportados: no disponibles; el corpus de evaluación cubre 30 idiomas, pero no se garantiza cobertura completa.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda revisar el archivo LICENSE del repositorio y la licencia del modelo base.
- El repositorio ocupa 573 GB, por lo que conviene descargar solo los archivos necesarios.

## Enlaces

- Repositorio GGUF: https://huggingface.co/AtomicChat/Inkling-2-Mini-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Métricas de cuantización: https://huggingface.co/datasets/AtomicChat/Inkling-2-Mini-GGUF-metrics
- Guía para ejecutar Inkling 2 Mini en local: https://atomic.chat/blog/guides/how-to-run-inkling-2-mini-locally
- Atomic Chat: https://atomic.chat/
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq

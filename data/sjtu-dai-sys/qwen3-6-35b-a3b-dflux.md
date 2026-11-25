# SJTU-DAI-Sys/Qwen3.6-35B-A3B-DFlux

## Resumen

Qwen3.6-35B-A3B-DFlux es un modelo borrador de decodificación especulativa (speculative draft model) desarrollado por SJTU-DAI-Sys para acelerar la inferencia de Qwen/Qwen3.6-35B-A3B. No es un modelo generativo autónomo: se trata de un checkpoint auxiliar que propone secuencias de tokens candidatas que el modelo objetivo verifica, manteniendo la distribución de salida exacta del modelo grande gracias al muestreo por rechazo. Su arquitectura DFlux combina un backbone híbrido SWA-GQA (4 capas de atención de ventana deslizante seguidas de 1 capa de atención completa GQA) con convolución agrupada local por bloques, un módulo R-Corrector que aplica correcciones residuales paralelas sobre los top-k candidatos y supervisión jerárquica con pérdidas forward KL y D-PAL.

El checkpoint, entrenado con el framework LEGOSpec, pesa 1,1 GB y contiene 526.253.056 parámetros en safetensors. Su relevancia radica en el incremento de throughput que aporta sobre el modelo objetivo: según la model card, alcanza longitudes medias de aceptación (τ) de hasta 6,89 en GSM8K y multiplica por 4,57× el throughput autoregresivo con batch size 1 en esa misma tarea, con hasta 2,67× en batch size 64. Está pensado para despliegues en producción con SGLang donde la latencia y el coste por token del modelo de 35B son críticos.

La ficha se publica en noviembre de 2026 y, en el momento de la consulta, no registra descargas ni likes en Hugging Face. La información disponible sobre licencia, idiomas y datos de benchmarks del modelo objetivo es limitada; se indica explícitamente cuando un dato no está disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlux: backbone híbrido SWA-GQA (4 capas sliding-window attention + 1 capa GQA full-attention) con convolución agrupada local por bloques, más R-Corrector residual sobre top-k |
| Parametros totales | 526.253.056 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (evaluado con entradas de 32K–64K tokens en LongBench-v2 y SWE-bench) |
| Tipos de cuantizacion | no disponible (checkpoint publicado en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Modelo objetivo | Qwen/Qwen3.6-35B-A3B |
| Framework de entrenamiento | LEGOSpec |
| Tamaño del repo | 1,1 GB |

## Arquitectura y entrenamiento

DFlux es una arquitectura de borrador especulativo diseñada para equilibrar cobertura de candidatos y coste computacional. El backbone alterna capas de atención de ventana deslizante (SWA) con capas de atención completa GQA en una proporción 4:1, y cada capa incorpora una convolución agrupada local por bloques que preserva dependencias intra-bloque tanto en contexto corto como largo, acotando el crecimiento del KV cache histórico. Sobre la cabeza de salida, el R-Corrector calcula correcciones residuales paralelas predecesor-sucesor sobre los top-k candidatos manteniendo los logits base de vocabulario completo, lo que preserva la distribución exacta del modelo objetivo bajo muestreo por rechazo. El entrenamiento combina supervisión jerárquica: pérdida forward KL sobre el backbone para cobertura de candidatos y pérdida D-PAL sobre la salida final para optimizar directamente la longitud de aceptación a nivel de bloque.

El conjunto de entrenamiento suma 1,4 millones de muestras: 900K de Open-PerfectBlend, 300K de Nemotron-Post-Training-Dataset-v2 y 200K de WildChat. Los prompts se conservan y las respuestas se regeneran con Qwen/Qwen3.6-35B-A3B a temperatura T = 1, de modo que el borrador aprende la distribución del objetivo. El entrenamiento se ejecutó en 16 GPU NVIDIA H800 con batch global de 128, usando Adam (lr = 6e-4) y Muon (lr = 0.01). La innovación principal es la combinación de SWA-GQA con convolución local y R-Corrector, que permite bloques de tamaño 8 con aceptación media superior a la de borradores previos (DFlash, DFlash2, DSpark).

## Capacidades

- Generación de tokens candidatos para decodificación especulativa sobre Qwen3.6-35B-A3B, con verificación por muestreo por rechazo que preserva la distribución del modelo objetivo.
- Propuesta de bloques de hasta 8 tokens por paso, con longitud media de aceptación (τ) entre 3,58 y 6,89 según tarea a T = 1.
- Cobertura de dominios diversos: conversación general (Alpaca, MT-Bench), matemáticas (GSM8K, MATH-500), código (MBPP, LiveCodeBench) y contexto largo (LongBench-v2 MD-QA, L-ICL, SD-QA, SWE-bench).
- Integración con SGLang para serving de alta concurrencia con aceleración sobre decodificación autoregresiva.
- No soporta tool calling, function calling ni razonamiento multi-paso de forma autónoma: esas capacidades residen en el modelo objetivo.
- No dispone de modo thinking, visión ni audio propios; hereda el comportamiento del objetivo a través de la verificación.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Serving de Qwen3.6-35B-A3B con latencia reducida: el borrador se despliega junto al objetivo en SGLang y acelera la decodificación 2,69× en batch 1 sobre Alpaca, lo que reduce el coste por token en APIs de chat.
- Generación de código asistida en IDE: con τ de 5,88 en MBPP y 2,31× de speedup en batch 64, es adecuado para autocompletado y generación de funciones donde el objetivo de 35B aporta calidad y el borrador amortigua la latencia.
- Razonamiento matemático en producción: en GSM8K alcanza 4,57× de speedup en batch 1 y 6,66 de τ medio, útil en pipelines de resolución de problemas y verificación de cálculos.
- Procesamiento de contexto largo: evaluado con entradas de 32K–64K tokens en LongBench-v2 y SWE-bench, sirve para resúmenes de documentación extensa y análisis de repositorios donde el KV cache del objetivo es costoso.
- Agentes de código sobre repositorios: combinado con el objetivo en tareas tipo SWE-bench (τ = 3,98), acelera bucles de edición-verificación en pipelines de CI/CD sin alterar la distribución de salida.
- Despliegue con alta concurrencia: en batch 64 mantiene 1,59×–2,67× de speedup según tarea, adecuado para servicios multi-usuario con SGLang y presupuesto de GPU ajustado.
- Evaluación comparativa de borradores especulativos: sirve como referencia reproducible para medir τ y throughput frente a DFlash, DFlash2 y DSpark en las mismas tareas.

## Benchmarks y rendimiento

Longitud media de aceptación (τ) a T = 1, bloque de 8, generación máxima de 1.024 tokens, muestreo por rechazo, media de 5 semillas. Contexto largo con entradas de 32K–64K tokens.

| Metodo | Alpaca | MT-Bench | GSM8K | MATH-500 | MBPP | LCB | MD-QA | L-ICL | SD-QA | SWE |
|---|---|---|---|---|---|---|---|---|---|---|
| DFlash | 3,26 | 3,82 | 5,77 | 5,82 | 5,66 | 4,55 | 3,25 | 3,65 | 3,09 | 3,15 |
| DFlash2 | 3,45 | 4,00 | 6,06 | 5,99 | 5,88 | 4,66 | 3,48 | 4,05 | 3,34 | 3,62 |
| DSpark | 3,39 | 3,75 | 5,66 | 5,85 | 4,97 | 4,11 | 3,14 | 3,76 | 3,17 | 2,84 |
| DFlux | 4,13 | 4,59 | 6,89 | 6,54 | 6,24 | 5,09 | 3,60 | 4,16 | 3,58 | 3,98 |

Throughput con SGLang (T = 0), TPS y speedup sobre decodificación autoregresiva (AR):

| Tarea | Metodo | BS = 1 | BS = 8 | BS = 32 | BS = 64 | τ medio |
|---|---|---|---|---|---|---|
| Alpaca | AR | 131 / 1,00× | 1033 / 1,00× | 3740 / 1,00× | 6113 / 1,00× | — |
| Alpaca | DFlash2 | 298 / 2,27× | 2001 / 1,94× | 5817 / 1,56× | 7820 / 1,28× | 3,37 |
| Alpaca | DSpark | 303 / 2,30× | 2005 / 1,94× | 5137 / 1,37× | 7193 / 1,18× | 3,26 |
| Alpaca | DFlux | 353 / 2,69× | 2336 / 2,26× | 7125 / 1,91× | 9712 / 1,59× | 3,85 |
| GSM8K | AR | 132 / 1,00× | 1033 / 1,00× | 3740 / 1,00× | 5988 / 1,00× | — |
| GSM8K | DFlash2 | 517 / 3,92× | 3497 / 3,38× | 10127 / 2,71× | 13281 / 2,22× | 5,96 |
| GSM8K | DSpark | 504 / 3,82× | 3349 / 3,24× | 8552 / 2,29× | 11611 / 1,94× | 5,52 |
| GSM8K | DFlux | 602 / 4,57× | 3994 / 3,86× | 12058 / 3,22× | 16013 / 2,67× | 6,66 |
| MBPP | AR | 132 / 1,00× | 1033 / 1,00× | 3565 / 1,00× | 5677 / 1,00× | — |
| MBPP | DFlash2 | 500 / 3,80× | 3374 / 3,27× | 9255 / 2,60× | 11938 / 2,10× | 5,73 |
| MBPP | DSpark | 440 / 3,34× | 2916 / 2,82× | 7118 / 2,00× | 9443 / 1,66× | 4,77 |
| MBPP | DFlux | 532 / 4,04× | 3533 / 3,42× | 10136 / 2,84× | 13120 / 2,31× | 5,88 |

No se han publicado resultados de benchmarks de calidad generativa (MMLU, HumanEval) del modelo objetivo en la información disponible.

## Requisitos de hardware

- VRAM estimada para el borrador: aproximadamente 1,1 GB en bfloat16 (526M parámetros), más el KV cache del backbone SWA-GQA, que crece de forma acotada por el diseño de ventana deslizante.
- El borrador debe coexistir con Qwen3.6-35B-A3B, que domina el consumo de VRAM (pesos del objetivo más KV cache completo). El requisito real de memoria lo impone el modelo objetivo, no el borrador.
- GPU recomendadas para el conjunto: NVIDIA H800 (usadas en entrenamiento), H100, A100 80 GB. El borrador por sí solo cabe en cualquier GPU consumer moderna con más de 2 GB libres.
- Cabe en GPU consumer (RTX 4090, RTX 3090, etc.) únicamente como borrador; el modelo objetivo de 35B requiere cuantización o múltiples GPU.
- Despliegue: SGLang (soportado explícitamente con scripts de LEGOSpec). Otros motores (vLLM, llama.cpp, Ollama, TGI) no están confirmados en la información disponible.
- Latencia y throughput: hasta 2,69× sobre AR en batch 1 (Alpaca), 4,57× en GSM8K y 4,04× en MBPP; en batch 64, 1,59×, 2,67× y 2,31× respectivamente. Cifras medidas con SGLang a T = 0.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Contexto | τ medio (rango) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DFlux (este) | 526M | Borrador especulativo DFlux | no disponible | 3,58–6,89 | no disponible | Hugging Face |
| DFlash | no disponible | Borrador especulativo | no disponible | 3,09–5,82 | no disponible | no disponible |
| DFlash2 | no disponible | Borrador especulativo | no disponible | 3,34–6,06 | no disponible | no disponible |
| DSpark | no disponible | Borrador especulativo | no disponible | 2,84–5,85 | no disponible | no disponible |

DFlux supera a los tres borradores comparables en todas las tareas evaluadas, con la mayor ventaja en Alpaca (4,13 frente a 3,45 de DFlash2) y la menor en MD-QA (3,60 frente a 3,48). Los datos de parámetros, contexto y licencia de los competidores no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere Qwen/Qwen3.6-35B-A3B para embeddings compartidos, cabeza de salida y verificación. Sin el objetivo no genera texto utilizable.
- Licencia no disponible: no puede confirmarse el uso comercial ni las condiciones de redistribución. Verificar antes de desplegar en producción.
- Idiomas soportados no disponibles: el comportamiento multilingüe depende del modelo objetivo y no está documentado para el borrador.
- Sesgos y alucinaciones: al preservar la distribución del objetivo bajo rechazo, hereda sus sesgos y errores; el borrador no los corrige.
- Dependencia de LEGOSpec y SGLang: el código de carga y serving está atado al framework del autor; la integración con otros motores no está confirmada.
- Sin descargas ni likes en el momento de la consulta, lo que limita la validación comunitaria y el soporte.
- Los benchmarks miden aceptación y throughput, no calidad generativa; no hay datos de MMLU, HumanEval u otras métricas de capacidad del objetivo en esta información.
- El checkpoint se publicó en noviembre de 2026; la citación BibTeX figura como "TBD" en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/SJTU-DAI-Sys/Qwen3.6-35B-A3B-DFlux
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio LEGOSpec: https://github.com/SJTU-DAI-Sys/LEGOSpec
- Dataset Open-PerfectBlend: https://huggingface.co/datasets/mlabonne/open-perfectblend
- Dataset Nemotron-Post-Training-Dataset-v2: https://huggingface.co/datasets/nvidia/Nemotron-Post-Training-Dataset-v2
- Dataset WildChat: https://huggingface.co/datasets/allenai/WildChat

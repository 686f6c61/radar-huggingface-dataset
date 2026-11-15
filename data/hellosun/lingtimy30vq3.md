# HelloSun/lingtimy30vq3

## Resumen

Ling-3.0-tiny VQ3 es una versión cuantizada del modelo base `inclusionAI/Ling-3.0-tiny`, un transformer de arquitectura MoE con 7.893.392.800 parámetros totales y licencia MIT. La cuantización ha sido desarrollada por el usuario HelloSun y publicada en Hugging Face bajo el identificador `HelloSun/lingtimy30vq3`. El objetivo es reducir el peso en disco y el consumo de memoria RAM durante la inferencia manteniendo una calidad aceptable, mediante una técnica de cuantización vectorial (LUT-VQ3-64) aplicada selectivamente a los tensores de expertos del bloque feed-forward.

La innovación principal es el uso de un códec vectorial de 128 entradas con códigos int8 de 3 dimensiones y escalas de subbloque de 3 bits cada 64 pesos, lo que produce una tasa de 3.00 bits por peso (bpw) en los tensores `ffn_gate_exps` y `ffn_up_exps`. El resto de tensores se mantienen en Q8_0 y `ffn_down_exps` en Q6_K, dando una tasa efectiva de 4.73 BPW y un archivo GGUF de 4.66 GB (4.34 GiB). El resultado es un modelo que ocupa un 33% menos de memoria residente que una cuantización Q4_K_M convencional, con una velocidad de decodificación prácticamente idéntica a Q8_0.

El modelo es relevante para quienes necesitan desplegar un MoE de casi 8.000 millones de parámetros en entornos con RAM limitada (por ejemplo, servidores sin GPU o estaciones de trabajo con 8 GB de memoria), a costa de una degradación medible de perplejidad y divergencia KL respecto al maestro BF16. Requiere un parche específico sobre llama.cpp para soportar el tipo de tensor `GGML_TYPE_VQ3_0`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (arquitectura bailingmoe3 según el conversor de llama.cpp) |
| Parametros totales | 7.893.392.800 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | VQ3_0 (3.00 bpw) en tensores de expertos, Q6_K en `ffn_down_exps`, Q8_0 en el resto |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (526 tensores, 4.66 GB / 4.34 GiB) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) identificado en el ecosistema llama.cpp como `bailingmoe3`. El repositorio no detalla el número de expertos, la dimensión oculta, el número de capas ni la composición del dataset de entrenamiento. Tampoco se documenta si hubo fases de RLHF, DPO u otro ajuste por preferencias. La información disponible se limita a la arquitectura de cuantización y a los resultados de evaluación del proceso de compresión.

La contribución técnica de esta ficha es el esquema LUT-VQ3-64: 46 tensores 3D correspondientes a `ffn_gate_exps` y `ffn_up_exps` se codifican con un libro de códigos de 128 entradas de vectores int8 de dimensión 3, más una escala de subbloque de 3 bits por cada 64 pesos. La inferencia se implementa mediante un parche sobre llama.cpp en el commit `61dbf492`, que añade el kernel `GGML_TYPE_VQ3_0` con una ruta rápida AVX-512 VBMI basada en `VPERMI2B` para la búsqueda en la tabla de códigos. El parche incluye además una corrección del backend AMX de llama.cpp para evitar que los tensores 3D de MLA (`attn_k_b`, `attn_v_b`) sean reclamados por el búfer AMX cuando se consumen como vista permutada en `MUL_MAT`. La calidad del kernel se valida con una prueba unitaria que reporta SQNR de 13.45 dB y coseno de 0.977 a 3.00 bpw.

## Capacidades

- Generación de texto conversacional: la model card etiqueta el modelo como `conversational` y ofrece ejemplos de uso con `llama-cli` y `llama-server`.
- Compatibilidad con la API OpenAI a través de `llama-server`, lo que permite integrarlo en aplicaciones existentes sin cambios de cliente.
- Inferencia en CPU pura mediante llama.cpp (`-ngl 0`), con soporte opcional de offload parcial a GPU (`-ngl 99`), aunque la desquantización VQ3 se ejecuta en la ruta de CPU.
- Capacidades específicas del modelo base (razonamiento, código, matemáticas, tool calling, agentes, multilingüismo): no disponibles en la información proporcionada.
- No se documenta modo de pensamiento (thinking), visión, audio ni otras modalidades.

## Casos de uso

- Despliegue en servidores sin GPU: el modelo cabe en 5.84 GiB de RSS en CPU, por lo que puede servirse en instancias con 8 GB de RAM usando `llama-server` con API compatible con OpenAI, sin necesidad de acelerador hardware.
- Asistente conversacional de bajo coste: al ser un MoE de ~7.9B con licencia MIT, puede integrarse en productos de chat donde el coste por token importa y el tráfico es moderado; la decodificación a 32.8 t/s en un Xeon de 80 núcleos es suficiente para respuestas interactivas.
- Prototipado en estaciones de trabajo: investigadores que quieran evaluar un MoE de ~8B sin disponer de A100/H100 pueden ejecutarlo en local con el parche de llama.cpp y el script `build_and_run.sh`, que automatiza clonado, compilación, descarga y benchmarks.
- Procesamiento por lotes en CPU: la velocidad de prefill de 369 t/s permite procesar documentos largos en pipelines batch donde la latencia no es crítica y se prioriza el ahorro de memoria frente a Q4_K_M.
- Educación y experimentación con cuantización vectorial: el repositorio incluye el codificador (`vq3/vq3_enc_lib.c`), el libro de códigos (`vq3/vq3_codebook.h`), el script de conversión (`scripts/build_ling_vq3.py`) y pruebas unitarias, lo que lo convierte en una referencia reproducible para estudiar VQ aplicada a pesos de LLM.
- Sustitución de Q4_K_M en entornos con restricción estricta de memoria: cuando el presupuesto de RAM es de ~6 GB y no se puede asumir el pico de 8.74 GiB de Q4_K_M, VQ3 ofrece un punto de operación con 5.84 GiB a cambio de una perplejidad de 13.85 frente a 13.42.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos en un Xeon de 80 núcleos, solo CPU, 64 hilos. PPL sobre WikiText-2 test con `-c 512 --chunks 256` (131k tokens); KLD frente a logits BF16 por token (128 chunks); throughput con `llama-bench -p 512 -n 128 -r 2 -t 64`; RSS con `/usr/bin/time -v`.

| Modelo | Tamano | PPL | KLD | pp512 (t/s) | tg128 (t/s) | RSS pico |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (maestro) | 14.71 GiB | 13.1045 | — | 425 | 26.9 | 15.70 GiB |
| Q8_0 | 7.82 GiB | 13.0718 | 0.012 | 504 | 33.0 | 9.32 GiB |
| base-Q8dQ6 | 7.30 GiB | 13.1406 | 0.015 | 458 | 34.2 | 8.80 GiB |
| Q4_K_M | 4.49 GiB | 13.4217 | 0.133 | 424 | 33.7 | 8.74 GiB |
| VQ3 (este repo) | 4.34 GiB | 13.8465 | 0.255 | 369 | 32.8 | 5.84 GiB |

Datos adicionales de calidad: la tasa de coincidencia top-1 de VQ3 frente a BF16 es del 79.7% con un RMS Δp del 13.3%; Q4_K_M alcanza 84.3% y 9.8% respectivamente. La prueba unitaria del kernel reporta SQNR de 13.45 dB y coseno de 0.977 a 3.00 bpw. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 5.84 GiB de RSS pico en CPU con la cuantización VQ3; el archivo en disco ocupa 4.66 GB (4.34 GiB).
- GPU recomendadas: no se especifican en la información disponible; la ruta VQ3 se ejecuta en CPU y el offload a GPU (`-ngl 99`) solo es aplicable a los tensores no VQ3, por lo que el beneficio de GPU es limitado para los expertos.
- Compatibilidad con GPU de consumo: no confirmada; el modelo cabe en GPUs con 8 GB o más de VRAM si se aplica offload parcial, pero la model card no aporta mediciones en GPU.
- Opciones de despliegue: llama.cpp con el parche `0001-lut-vq3-64-avx512-vbmi-port-to-61dbf492.patch` sobre el commit `61dbf492`; `llama-cli` y `llama-server` (API compatible con OpenAI). No se menciona soporte en vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: 369 t/s de prefill (pp512) y 32.8 t/s de decodificación (tg128) en Xeon de 80 núcleos con 64 hilos. El prefill es un 27% más lento que Q8_0 porque VQ3 no puede usar la ruta AMX int8.
- Requisito de CPU: el kernel rápido depende de AVX-512 VBMI (`VPERMI2B`); en CPUs sin AVX-512 VBMI la ruta será más lenta o no estará disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL (WikiText-2) | Tamano | Licencia | Motor |
|---|---|---|---|---|---|---|
| Ling-3.0-tiny VQ3 (este repo) | 7.89B | no disponible | 13.8465 | 4.34 GiB | MIT | llama.cpp parcheado |
| Ling-3.0-tiny Q4_K_M | 7.89B | no disponible | 13.4217 | 4.49 GiB | MIT | llama.cpp estándar |
| Ling-3.0-tiny Q8_0 | 7.89B | no disponible | 13.0718 | 7.82 GiB | MIT | llama.cpp estándar |
| Ling-3.0-tiny BF16 (maestro) | 7.89B | no disponible | 13.1045 | 14.71 GiB | MIT | llama.cpp estándar |

La comparación se limita a las variantes del mismo modelo base, ya que la información proporcionada no incluye otros modelos de la misma categoría. Frente a Q4_K_M, VQ3 reduce el RSS un 33% a costa de +0.42 puntos de perplejidad y un KLD casi el doble (0.255 frente a 0.133). Frente a Q8_0, VQ3 ocupa un 44% menos de memoria y decodifica a velocidad similar, pero el prefill cae un 27% y la divergencia KL es 21 veces mayor.

## Limitaciones y advertencias

- Degradación de calidad medible: PPL de 13.8465 frente a 13.1045 del BF16 (+5.7%) y KLD de 0.255, con coincidencia top-1 del 79.7%. No es apta para tareas donde la fidelidad de los logits sea crítica.
- Requiere un parche no estándar de llama.cpp: sin el commit `61dbf492` más el parche VQ3, el archivo GGUF no se puede cargar. Esto complica el despliegue en entornos gestionados o con versiones fijas de llama.cpp.
- Dependencia de AVX-512 VBMI para la ruta rápida; el rendimiento en CPUs sin esa extensión no está documentado.
- El prefill es más lento que Q8_0 (369 frente a 504 t/s) porque VQ3 no usa la ruta AMX int8, lo que penaliza cargas con prompts largos.
- El parche corrige un fallo del backend AMX de llama.cpp que afecta también a BF16, Q8_0 y Q4_K_M en máquinas con AMX; sin la corrección, el modelo puede fallar al cargar.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento multilingüe concreto.
- Longitud de contexto no documentada en la información disponible.
- Sesgos y riesgo de alucinación del modelo base no documentados en esta ficha; deben evaluarse sobre `inclusionAI/Ling-3.0-tiny`.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base y de las dependencias (llama.cpp, parche VQ3) antes de distribuir.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de los resultados publicados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HelloSun/lingtimy30vq3
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- GGUF oficial del modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny-GGUF
- llama.cpp (commit referenciado): https://github.com/ggml-org/llama.cpp/tree/61dbf49228c8a96b72e40c89d93cb7c003411f8c
- Origen del formato VQ3 (llama-modchip): https://github.com/synchopate/llama-modchip

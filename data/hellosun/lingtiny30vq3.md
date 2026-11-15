# HelloSun/lingtiny30vq3

## Resumen

Ling-3.0-tiny VQ3 es una cuantización vectorial del modelo base `inclusionAI/Ling-3.0-tiny`, un transformer de tipo mezcla de expertos (MoE) con 7.893.392.800 parámetros totales y licencia MIT. La publica el usuario HelloSun bajo el identificador `HelloSun/lingtiny30vq3`, y su interés principal no reside en el modelo en sí, sino en el método de compresión: sustituye los tensores de expertos `ffn_gate_exps` y `ffn_up_exps` por una cuantización vectorial de libros de códigos (LUT-VQ3-64) que alcanza 3,00 bits por peso.

El resultado es un archivo GGUF de 4,66 GB (4,34 GiB) con 526 tensores y una eficiencia media de 4,73 bpw, que se ejecuta sobre una bifurcación parcheada de llama.cpp que añade el tipo de tensor `GGML_TYPE_VQ3_0` con una ruta rápida basada en la instrucción AVX-512 VBMI `VPERMI2B`. Frente a Q4_K_M (4,49 GiB), el modelo ocupa algo menos y reduce el pico de memoria residente de 8,74 GiB a 5,84 GiB, a costa de un aumento moderado de perplejidad.

Es relevante ahora porque demuestra que la cuantización vectorial con libros de códigos puede llevarse a producción en CPU con un coste de calidad acotado (KLD de 0,255 frente a BF16) y con ventajas claras en contextos largos: en la prueba a 128K tokens, el menor volumen de pesos hace que la decodificación supere a Q8_0 (6,5 frente a 6,2 t/s) al estar el proceso limitado por ancho de banda de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (bailingmoe3, según las notas del parche); atención MLA con KV comprimida |
| Parametros totales | 7.893.392.800 |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (verificado en pruebas con `-c 131072`) |
| Tipos de cuantizacion | VQ3_0 (vectorial, 3,00 bpw) en `ffn_gate_exps`/`ffn_up_exps`; Q6_K en `ffn_down_exps`; Q8_0 en el resto |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (4,66 GB / 4,34 GiB, n_tensors=526, 4,73 bpw efectivos) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con atención de tipo MLA (Multi-head Latent Attention), que comprime el KV cache: según las notas del autor, cada token requiere 576 × 2 bytes por capa en 6 capas, lo que da aproximadamente 0,9 GiB de KV con el contexto lleno a 128K. El repositorio no documenta el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO), por lo que esos datos no están disponibles en la información proporcionada.

La innovación de esta publicación es puramente de compresión. Los 46 tensores de expertos `ffn_gate_exps` y `ffn_up_exps` se codifican con un libro de códigos 3D de 128 entradas en int8 más escalas de subbloque de 3 bits, lo que da 3,00 bpw; el resto de la receta asigna Q6_K a `ffn_down_exps` y Q8_0 a los demás tensores. La decodificación requiere un parche en llama.cpp que añade el núcleo `GGML_TYPE_VQ3_0` con una ruta LUT rápida mediante `VPERMI2B` (AVX-512 VBMI). El autor reporta una calidad del núcleo de SQNR 13,45 dB y coseno 0,977 a 3,00 bpw, medidos con `tests/test_vq3_port.c`. El proceso de cuantización es reproducible mediante `llama-quantize` y el script `scripts/build_ling_vq3.py`.

## Capacidades

- Generación de texto conversacional en formato de chat (etiqueta `conversational` en el repositorio).
- Razonamiento y generación de código y matemáticas: capacidades heredadas del modelo base Ling-3.0-tiny; el repositorio no las evalúa de forma específica.
- Soporte de contextos largos: probado con prompts de aproximadamente 131.000 tokens.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` indica que puede servirse a través de la API compatible de llama.cpp (`llama-server`).
- Tool calling, function calling y razonamiento multi-paso en agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Despliegue en CPU sin GPU: con `-ngl 0` y un pico de RSS de 5,84 GiB, el modelo cabe en servidores sin acelerador y en estaciones de trabajo con 8 GB de RAM, lo que permite servir un MoE de casi 8.000 millones de parámetros en hardware convencional.
- Procesamiento de documentos largos: con 131.072 tokens de contexto y un prefill de 71,2 t/s con `-ub 1024`, es adecuado para resumir o analizar contratos, informes o bases de código completas en una sola pasada.
- Servicio de chat con `llama-server`: la compatibilidad con endpoints permite exponerlo como API HTTP en el puerto 8080 y conectarlo a interfaces conversacionales existentes.
- Inferencia en entornos con memoria restringida: el pico de 5,84 GiB frente a los 8,74 GiB de Q4_K_M y los 15,70 GiB de BF16 lo hace útil en contenedores con límites estrictos de memoria.
- Evaluación e investigación de cuantización vectorial: el repositorio incluye scripts de compilación, codificador C (`vq3/vq3_enc_lib.c`) y pruebas de calidad (SQNR, coseno), lo que permite reproducir y comparar el método frente a Q4_K_M, Q8_0 y BF16.
- Razonamiento por lotes en servidores Xeon con AVX-512: la configuración `-t 32 -tb 64` maximiza la decodificación (38,0 t/s con `-t 32`) y el prefill (353,3 t/s con `-t 64`), apropiada para pipelines de generación masiva en CPU.

## Benchmarks y rendimiento

Datos medidos por el autor en un sistema de 2 × 40 núcleos Xeon con AVX-512 y AMX, contexto de 512 a 4096 tokens:

| Modelo | Tamano | PPL (menor es mejor) | KLD vs BF16 | pp512 (t/s) | tg128 (t/s) | RSS pico |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (master) | 14,71 GiB | 13,1045 | — | 425 | 26,9 | 15,70 GiB |
| Q8_0 | 7,82 GiB | 13,0718 | 0,012 | 504 | 33,0 | 9,32 GiB |
| base-Q8dQ6 | 7,30 GiB | 13,1406 | 0,015 | 458 | 34,2 | 8,80 GiB |
| Q4_K_M | 4,49 GiB | 13,4217 | 0,133 | 424 | 33,7 | 8,74 GiB |
| VQ3 (este repo) | 4,34 GiB | 13,8465 | 0,255 | 369 | 32,8 | 5,84 GiB |

Prueba a 128K tokens (`-c 131072`, `-t 32 -tb 64`):

| Modelo | ub | Prefill 131k (t/s) | Decode con KV llena (t/s) | RSS pico |
|---|---|---:|---:|---:|
| VQ3 | 512 | 40,7 | 6,5 | 6,10 GiB |
| VQ3 (optimizado) | 1024 | 71,2 | 6,0 | 6,27 GiB |
| VQ3 | 2048 | 71,8 | 6,1 | 6,62 GiB |
| Q8_0 | 512 | 41,9 | 6,2 | 9,59 GiB |
| Q4_K_M | 512 | 41,4 | 6,5 | 9,18 GiB |
| base-Q8dQ6 | 512 | 41,6 | 6,0 | 9,06 GiB |
| BF16 | 512 | 39,7 | 5,8 | 15,95 GiB |

Ajuste de hilos en el mismo sistema: `-t 32` da 268,9 t/s de pp512 y 38,0 t/s de tg128; `-t 48`, 344,5 y 35,2; `-t 64`, 353,3 y 33,8; `-t 80` cae a 68,3 t/s de prefill por cruce de NUMA. `--numa distribute` degrada todas las métricas. No hay resultados publicados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM: el repositorio está pensado para CPU (`-ngl 0`); no se documenta uso en GPU. Como referencia de memoria, el archivo pesa 4,66 GB y el pico de RSS medido es de 5,84 GiB en contexto corto y 6,27 GiB a 128K.
- GPU recomendadas: no disponible. El parche usa instrucciones AVX-512 VBMI y AMX, propias de CPU.
- GPU de consumo: no se documenta soporte; el núcleo `GGML_TYPE_VQ3_0` descrito es una implementación de CPU.
- CPU: se recomienda un procesador con AVX-512 VBMI (ruta `VPERMI2B`); el autor lo ha ajustado para 2 × 40 núcleos Xeon con doble NUMA.
- Despliegue: llama.cpp parcheado (commit base `61dbf492`), con `llama-cli` y `llama-server`; no se indica compatibilidad con vLLM, TGI u Ollama.
- Rendimiento: 369 t/s de prefill y 32,8 t/s de decodificación en contexto corto; 71,2 t/s de prefill y 6,0-6,5 t/s de decodificación a 128K con `-ub 1024`; configuración recomendada `-t 32 -tb 64`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| VQ3 (este repo) | 7,89 B (MoE) | 131.072 | 13,8465 | 4,34 GiB | MIT | GGUF con llama.cpp parcheado |
| Q4_K_M del mismo base | 7,89 B (MoE) | 131.072 | 13,4217 | 4,49 GiB | MIT | GGUF estándar en llama.cpp |
| Q8_0 del mismo base | 7,89 B (MoE) | 131.072 | 13,0718 | 7,82 GiB | MIT | GGUF estándar en llama.cpp |
| BF16 del mismo base | 7,89 B (MoE) | 131.072 | 13,1045 | 14,71 GiB | MIT | safetensors/GGUF sin cuantizar |

La comparación con modelos de otros autores no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de calidad medible: la perplejidad sube de 13,1045 (BF16) a 13,8465 y el KLD frente a BF16 es de 0,255, casi el doble que Q4_K_M (0,133). Para tareas sensibles a la fidelidad, Q4_K_M o Q8_0 son opciones más seguras.
- Requiere un llama.cpp parcheado: el tipo `GGML_TYPE_VQ3_0` no existe en el repositorio upstream; sin el parche el GGUF no es cargable en herramientas estándar como Ollama, LM Studio o vLLM.
- Dependencia de hardware: la ruta rápida usa AVX-512 VBMI; en CPU sin esas instrucciones el rendimiento puede degradarse de forma significativa (no se documenta una ruta alternativa).
- El parche incluye una corrección AMX necesaria también para BF16, Q8_0 y Q4_K_M: los pesos MLA 3D (`attn_k_b`/`attn_v_b`) provocan un fallo en `MUL_MAT` con vista permutada si no se aplica la comprobación `ggml_n_dims(src0)==2`.
- Configuración de hilos frágil: `-t 80` y `--numa distribute` degradan el rendimiento hasta límites inutilizables en el sistema de referencia; los valores óptimos dependen de la topología NUMA.
- Idiomas soportados no declarados: no hay información sobre cobertura multilingüe ni sobre el comportamiento en castellano.
- Sesgos y alucinaciones: no se documentan evaluaciones de sesgo, toxicidad o tasa de alucinación para este modelo ni para el base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, y creado y actualizado el mismo día: no hay validación comunitaria independiente.
- La model card contiene una errata en el comando de clonado (`lingtimy30vq3` en lugar de `lingtiny30vq3`) y referencia un repositorio antiguo con otra errata (`lingtimy30vp3`).

## Enlaces

- Hugging Face: https://huggingface.co/HelloSun/lingtiny30vq3
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-tiny
- llama.cpp upstream (commit de referencia): https://github.com/ggml-org/llama.cpp/tree/61dbf49228c8a96b72e40c89d93cb7c003411f8c
- Formato VQ3 (LUT-VQ3-64): https://github.com/synchopate/llama-modchip
- Repositorio anterior (con errata en el nombre): https://huggingface.co/HelloSun/lingtimy30vp3
- Resultados de ajuste de hilos: `results/tuning.tsv` (en el repositorio)
- Registros de perplejidad y KLD: `results/ppl_vq3.log`, `results/kld_vq3.log`
- Benchmarks cortos: `results/bench.tsv`
- Pruebas a 128K: `results-128k/run_vq3.txt`, `results-128k/run_vq3_ub1024.txt`
- Prueba de calidad del núcleo: `tests/test_vq3_port.c`

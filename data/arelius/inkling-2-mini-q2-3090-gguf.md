# arelius/Inkling-2-Mini-Q2-3090-GGUF

## Resumen

Inkling-2-Mini-Q2-3090-GGUF es una cuantizacion de 2 bits del modelo base thinkingmachines/Inkling-2-Mini, publicada por el usuario arelius. El modelo base es un transformer de tipo Mixture of Experts (MoE) con 26.070.385.152 parametros totales, aproximadamente 3,4B activos y un nucleo con paso recurrente ("looped core"), desarrollado por Thinking Machines Lab. Esta version concreta es una conversion a GGUF orientada a velocidad, disenada para ejecutarse en una unica GPU RTX 3090 y alcanzar unos 200 tokens por segundo en decodificacion.

El objetivo de esta publicacion no es maximizar la calidad, sino ofrecer un artefacto que quepa en 9,25 GiB y permita servir el modelo en hardware de consumo con un throughput muy alto. Para lograrlo, el autor cuantiza los expertos enrutados de las capas 0-19 a Q2_K y Q2_0 (con un encoder calibrado respecto a la matriz de importancia), mientras que las capas 20-23 y las proyecciones de atencion se mantienen en IQ4_NL. El resultado es un modelo solo de texto, sin proyector de vision, con licencia Apache-2.0 heredada del modelo base.

Es relevante ahora porque demuestra que un MoE de ~26B con ~3,4B activos puede servirse a velocidades interactivas en una GPU consumer de gama alta, a costa de un incremento de perplejidad de aproximadamente 3-4% respecto a la conversion de 4 bits publicada. El autor recomienda explicitamente usar la variante Q6_K si la calidad prima sobre la velocidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE) con nucleo recurrente ("looped core") |
| Parametros totales | 26.070.385.152 (~26,1B) |
| Parametros activos | ~3,4B (segun la model card del autor) |
| Longitud de contexto | Hasta 65.536 tokens en la configuracion de ejemplo (`-c 65536`); el modelo base no especifica contexto en la informacion disponible |
| Tipos de cuantizacion | Q2_K (expertos enrutados, capas 0-19, `ffn_gate_up_exps`), Q2_0 calibrado (expertos enrutados, capas 0-19, `ffn_down_exps`), IQ4_NL (capas 20-23, proyecciones de atencion y cabeza de salida), Q8_0 (embeddings de tokens), F32 (normas, router, controladores de bucle, sesgos) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero `Inkling-2-Mini-Q2K-Q2_0.gguf`, 9,25 GiB) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un Mixture of Experts con 26,1B parametros totales y aproximadamente 3,4B activos por token, e incorpora un "looped core" (nucleo recurrente) que repite el paso por las capas, segun la model card del autor de la cuantizacion. La model card menciona 48 pasadas de capa ("every one of the 48 layer passes rereads the attention cache"), lo que sugiere un esquema de reutilizacion de capas que multiplica el coste de atencion por el numero de pasadas. No se dispone de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en la informacion proporcionada.

Esta publicacion concreta no reentrena ni ajusta el modelo: solo aplica cuantizacion sobre la conversion Q8_0 de ggml-org, usando su matriz de importancia de 1.770 fragmentos (chunks). La innovacion tecnica destacable es el encoder calibrado para Q2_0: frente al encoder estandar de ggml, que usa el mayor valor absoluto de cada bloque como escala, el fork de arelius ajusta la escala y los cuatro niveles contra los pesos de importancia (commit `704a7da`). El layout en disco no cambia, por lo que cualquier build de llama.cpp que soporte Inkling 2 Mini y Q2_0 puede cargar el fichero. Ademas, el autor mantiene un fork de llama.cpp (rama `inkling-3090`) con kernels fusionados especificos para Inkling, ajustados a Ampere (sm_86), que son los que permiten alcanzar las velocidades declaradas.

## Capacidades

- Generacion de texto conversacional y de proposito general, en modo texto unicamente.
- Razonamiento multi-paso y soporte de agentes: la model card indica que el tool calling funciona con el fork (probado con OpenCode).
- Integracion con APIs compatibles con OpenAI a traves del servidor `llama-server` del fork (`/v1`, id de modelo `inkling-mini`).
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Sin vision: el autor indica explicitamente "Text only. No vision projector is included."
- Sin modo thinking explicito documentado en la informacion disponible.
- Capacidades de codigo y matematicas: no documentadas de forma especifica en la informacion proporcionada; el autor menciona sesiones reales de agente de codificacion (OpenCode) como caso de uso medido.

## Casos de uso

- Agentes de codificacion en local: el autor midio decodificacion en sesiones reales de OpenCode, con 120-140 tok/s a partir de 16K tokens de contexto. Es adecuado para flujos de agente que necesitan muchas llamadas cortas y baja latencia en una sola GPU consumer.
- Servicio de chat interactivo de alta velocidad: con ~200 tok/s en contexto vacio y ~132 tok/s a 24K-32K, permite respuestas de 700 tokens en pocos segundos en una RTX 3090, adecuado para prototipos y demos.
- Automatizacion de tool calling en pipelines internos: al exponer una API compatible con OpenAI, se puede integrar en orquestadores existentes sin cambiar el cliente.
- Experimentacion con MoE de 2 bits: util para investigadores que quieran estudiar el impacto de la cuantizacion agresiva de expertos enrutados con calibracion por matriz de importancia.
- Despliegue en estaciones de trabajo con una sola GPU de 24 GB: el autor indica que el modelo necesita unos 13 GB de VRAM a 64K de contexto, lo que deja margen para el sistema y otros procesos.
- Evaluacion comparativa de cuantizaciones: sirve como referencia de velocidad frente a la variante Q6_K del mismo autor (~152 tok/s servidos) para decidir el equilibrio calidad/velocidad.
- Generacion de texto por lotes en local con requisitos de privacidad: al ejecutarse integramente en la GPU del usuario, evita enviar datos a servicios externos.

## Benchmarks y rendimiento

Los datos disponibles son mediciones de rendimiento y perplejidad del autor en una RTX 3090 con el fork `inkling-3090`, no benchmarks estandar de calidad (MMLU, HumanEval, GSM8K). No se han publicado resultados de benchmarks de calidad en la informacion disponible.

| Metrica | IQ4_NL de referencia (ggml-org) | Este modelo (Q2) |
|---|---:|---:|
| Decodificacion tok/s, contexto vacio | no disponible | 208,7 |
| Decodificacion tok/s a 1K de contexto | no disponible | 193,2 |
| Tokens servidos/s (respuestas de 700 tokens, T=0) | no disponible | 202,2 |
| Tokens servidos/s (respuestas de 700 tokens, T=0,7) | no disponible | 201,2 |
| Perplejidad en prefill | 2,9401 | 3,0530 |
| Perplejidad en decode | 4,0660 | 4,1945 |

Error estandar de perplejidad: aproximadamente 0,065 en prefill y 0,28 en decode. El autor indica que la perplejidad esta un 3-4% por encima de la conversion de 4 bits publicada.

Rendimiento de decodificacion segun contexto en uso (sesiones reales de OpenCode):

| Contexto en uso | Decodificacion tok/s |
|---|---:|
| Menos de 4K | ~197 |
| 4K-16K | ~151 |
| 16K-24K | ~141 |
| 24K-32K | ~132 |
| 32K-48K | ~123 |

## Requisitos de hardware

- VRAM: el fichero ocupa 9,25 GiB; el autor indica que la configuracion de ejemplo con 64K de contexto necesita unos 13 GB de VRAM.
- GPU recomendadas: RTX 3090 (Ampere, sm_86) es el objetivo declarado y donde se midieron los numeros. Los kernels fusionados estan ajustados a sm_86; en otras arquitecturas el rendimiento puede diferir.
- Cabe en GPU consumer: si, en RTX 3090 (24 GB) y probablemente en otras GPU con al menos ~13 GB libres para 64K de contexto; no se han publicado mediciones en otras GPU.
- Opciones de despliegue: llama.cpp. El autor proporciona un fork (rama `inkling-3090`) con kernels fusionados; el llama.cpp estandar con soporte de Inkling 2 Mini (PR #32694) carga el fichero pero funciona mucho mas lento. Tambien ofrece un comando `uvx` que descarga un servidor precompilado y sirve una API compatible con OpenAI en `127.0.0.1:8031/v1`.
- Requisitos de entorno del comando `uvx`: Linux, glibc >= 2.38, driver NVIDIA >= 570 y `uv`; no requiere toolkit CUDA ni compilacion.
- Throughput: ~200 tok/s en decodificacion con contexto vacio y ~120-140 tok/s en contextos de agente de 16K o mas, segun las mediciones del autor.
- Flags recomendados por el autor: `-ngl 99 -fa on -ctk q8_0 -ctv q8_0 -c 65536 -np 1 --backend-sampling` y variables de entorno `LLAMA_INKLING_CTRL_F16=1 IK_BATCH_MESSAGES=1 IK_SEGMENTED_IQ4=1 IK_SEGMENTED_Q6=1 IK_MIX_SPECIALIZE=1 IK_CTRL_APPLY8=1`.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Este modelo (Inkling-2-Mini-Q2-3090-GGUF) | ~26,1B | ~3,4B | hasta 65.536 en la config de ejemplo | Apache-2.0 | GGUF 2-bit | ~200 tok/s en RTX 3090; perplejidad +3-4% vs 4 bits |
| Inkling-2-Mini-Q6K-3090-GGUF (mismo autor) | ~26,1B | ~3,4B | no disponible | Apache-2.0 | GGUF Q6_K | ~152 tok/s servidos; calidad casi exacta segun el autor |
| thinkingmachines/Inkling-2-Mini (base) | ~26,1B | ~3,4B | no disponible | Apache-2.0 | safetensors (presumiblemente) | Modelo original sin cuantizar |
| ggml-org/Inkling-2-Mini-GGUF (Q8_0 / IQ4_NL) | ~26,1B | ~3,4B | no disponible | Apache-2.0 | GGUF | Referencia de perplejidad usada por el autor (IQ4_NL: PPL prefill 2,9401, decode 4,0660) |

No se dispone de comparaciones con modelos de otras familias en la informacion proporcionada.

## Limitaciones y advertencias

- Calidad inferior a la conversion de 4 bits: el autor reconoce que la perplejidad supera la tolerancia de +/-0,5% que usa para cambios "exactos" y recomienda validar en las tareas propias.
- Solo texto: no incluye proyector de vision.
- Rendimiento especifico del fork: las velocidades declaradas dependen de los kernels fusionados del fork `inkling-3090`, ajustados a Ampere (sm_86); con llama.cpp estandar el modelo funciona mucho mas lento.
- Coste de atencion con contexto largo: las 48 pasadas de capa releen la cache de atencion, por lo que la decodificacion cae de ~197 tok/s (menos de 4K) a ~123 tok/s (32K-48K).
- Idiomas soportados no documentados: no se puede garantizar cobertura multilingue sin evaluacion propia.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; al ser una cuantizacion agresiva, la degradacion puede amplificar errores en tareas sensibles.
- Licencia Apache-2.0: permite uso comercial, pero al ser un derivado cuantizado del modelo base conviene revisar tambien las condiciones del modelo original y de la conversion Q8_0 de ggml-org.
- Sin fine-tuning: los pesos solo se han modificado por cuantizacion, por lo que hereda las limitaciones del modelo base.
- Repositorio sin descargas ni likes en el momento de la consulta: ecosistema de soporte limitado y poca validacion externa.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/arelius/Inkling-2-Mini-Q2-3090-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Anuncio del modelo base: https://thinkingmachines.ai/news/inkling-2-mini/
- Conversion GGUF y matriz de importancia (ggml-org): https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF
- Variante Q6_K del mismo autor: https://huggingface.co/arelius/Inkling-2-Mini-Q6K-3090-GGUF
- Fork de llama.cpp (rama `inkling-3090`): https://github.com/csaben/llama.cpp/tree/inkling-3090
- Commit del encoder calibrado Q2_0: https://github.com/csaben/llama.cpp/commit/704a7da
- Resultados de rendimiento del fork: https://github.com/csaben/llama.cpp/blob/inkling-3090/perf/RESULTS.md
- Documentacion de tool calling del fork: https://github.com/csaben/llama.cpp/blob/inkling-3090/INKLING.md
- Release del servidor precompilado: https://github.com/csaben/llama.cpp/releases/tag/inkling-3090-v1
- llama.cpp (upstream): https://github.com/ggml-org/llama.cpp
- PR de soporte de Inkling 2 Mini en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/32694
- uv (gestor de paquetes usado en el comando de despliegue): https://docs.astral.sh/uv/

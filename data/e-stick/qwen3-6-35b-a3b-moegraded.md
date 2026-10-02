# E-stick/Qwen3.6-35B-A3B-MoEGraded

## Resumen

E-stick/Qwen3.6-35B-A3B-MoEGraded es una cuantizacion GGUF de tipo "MoE Expert Grading" del modelo base Qwen/Qwen3.6-35B-A3B, un transformer de mezcla de expertos (MoE) con aproximadamente 35.000 millones de parametros totales y unos 3.000 millones activos por token (sufijo A3B). El modelo lo publica el usuario E-stick y no introduce una arquitectura nueva: su aportacion es una receta de cuantizacion selectiva por experto que reduce el peso en disco hasta unos 15,59-17,26 GiB manteniendo una perplexity casi identica a la de la referencia F16 (67 GB, PPL 1,5053).

La innovacion consiste en ordenar los 256 expertos de cada capa por energia de activacion medida con una importance matrix de 5.120 tokens y dividirlos en tres niveles: hot (20 %, 51 expertos), warm (30 %, 77) y cold (resto, 128). Cada nivel se cuantiza a un ancho de bits distinto (Q4_K/Q5_K para hot, Q3_K para warm, Q2_K/Q3_K para cold), mientras que router y normalizaciones se conservan en F32, la atencion y el embedding en Q6_K y los expertos compartidos y la cabeza de salida en Q8_0.

Es relevante para desarrolladores que quieren ejecutar un MoE de 35B en hardware de gama de consumo con muy poco disco, pero exige un fork parcheado de llama.cpp: los GGUF no cargan en la version estandar y devuelven `failed to load model`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), segun el nombre y la model card del base Qwen3.6-35B-A3B |
| Parametros totales | ~35 000 millones (deducido del nombre, no confirmado en la ficha) |
| Parametros activos | ~3 000 millones por token (sufijo A3B; 8 de 256 expertos activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con cuantizacion por niveles: gate/up Q4_K (hot), Q3_K (warm), Q2_K (cold); down Q5_K/Q3_K/Q3_K; router y norms F32; atencion y embedding Q6_K; expertos compartidos y cabeza de salida Q8_0. Dos variantes: Balanced y Compact |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (requiere fork parcheado de llama.cpp; metadatos `moe_expert_groups` y tensores `*_hot`/`*_warm`/`*_cold`) |
| Tamano de los ficheros | Balanced: 17,26 GiB; Compact: 15,59 GiB |
| Fecha de publicacion | 2026-10-02 |

## Arquitectura y entrenamiento

El modelo no se ha entrenado desde cero: es una recuantizacion del checkpoint Qwen/Qwen3.6-35B-A3B. La arquitectura subyacente es un transformer MoE en el que cada capa contiene 256 expertos y solo 8 se activan por token, lo que permite que un experto mal cuantizado afecte a una fraccion muy pequena de las activaciones. Sobre esa base, la receta de "MoE Expert Grading" aplica cuatro pasos: recoleccion de una importance matrix sobre 5.120 tokens de calibracion, ordenacion de los expertos por energia de activacion dentro de cada capa, division en tres niveles (hot 20 %, warm 30 %, cold 50 %) y cuantizacion independiente de las proyecciones gate/up/down por nivel.

En carga, el loader parcheado registra los tensores por nivel y los metadatos `moe_expert_groups`; el constructor de grafo despacha cada operacion `mul_mat_id` mediante `build_moe_mm_id_grp`, con una tabla de consulta sobre los identificadores de nivel y una mascara para los tokens cuyos expertos caen dentro de cada nivel. No se documentan en la informacion disponible detalles de RLHF, DPO ni de la composicion del dataset de entrenamiento original (dependen del modelo base). La model card indica explicitamente que el trabajo se produjo con ayuda de un agente de codificacion de IA a partir de un diseno escrito y mediciones reproducibles con los scripts incluidos en el fork.

## Capacidades

- Generacion de texto: es la unica tarea declarada en la model card (`pipeline_tag: text-generation`).
- Capacidades heredadas del modelo base Qwen3.6-35B-A3B: no documentadas en la informacion disponible (no se especifican razonamiento, codigo, matematicas ni vision en la ficha de esta cuantizacion).
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponible.
- Capacidad especial: ninguna mas alla del esquema de cuantizacion por niveles; se advierte de que el muestreo oficial de Qwen3.6 es necesario porque la decodificacion greedy provoca el bucle de repeticion conocido del modelo.

## Casos de uso

- Inferencia local en equipos con poco disco: con 15,59-17,26 GiB, un MoE de 35B cabe en el almacenamiento de un portatil o una estacion de trabajo de gama media donde la version F16 (67 GB) no seria viable.
- Despliegue en CPU o Vulkan sin GPU dedicada: el fork ofrece un binario precompilado para Windows x64 (CPU + Vulkan), pensado para ejecutar el modelo en maquinas sin acelerador de matriz.
- Investigacion en cuantizacion de MoE: la receta por niveles, la importance matrix y los scripts (`quant_recipe.py`, `split_moe_experts.py`, `verify_norepack.sh`) permiten reproducir y comparar esquemas de cuantizacion no uniforme.
- Experimentacion con llama.cpp parcheado: util para equipos que quieran evaluar el impacto del despacho `build_moe_mm_id_grp` y de la cuantizacion asimetrica entre niveles.
- Prototipado de generacion de texto en local: con las recomendaciones de muestreo (`--temp 1.0 --top-p 0.95 --top-k 20 --min-p 0.0 --presence-penalty 1.5`) se puede usar como base para tareas generativas con recursos limitados.
- Pruebas de calidad frente a cuantizaciones uniformes: sirve como referencia de comparacion (perplexity 1,5030-1,5096) frente a Q4_K_S, Q3_K_S o Q3_K uniforme en estudios internos de compromiso tamano/calidad.

## Benchmarks y rendimiento

Los unicos datos publicados son de perplexity (PPL), sobre el mismo corpus, 14 fragmentos de 512 tokens, `-t 20`, en una sola maquina. Valores mas bajos son mejores.

| Modelo | Tamano | PPL |
|---|---:|---:|
| F16 de referencia | 67 GB | 1,5053 |
| MoE Expert Grading - Balanced | 17,26 GiB | 1,5030 |
| MoE Expert Grading - Compact | 15,59 GiB | 1,5096 |
| APEX I-Compact (upstream) | 16,10 GiB | 1,5125 |
| Q3_K uniforme (sin grading) | 15,82 GiB | 1,5180 |
| Upstream Q4_K_S | 20 GB | 1,5167 |
| Upstream Q3_K_S | 15 GB | 1,5404 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La model card indica que la varianza entre ejecuciones de este benchmark es de ±0,029, por lo que Balanced y Compact son efectivamente equivalentes en calidad.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero Balanced ocupa 17,26 GiB y el Compact 15,59 GiB; hay que sumar el espacio para el contexto KV y el overhead de llama.cpp, por lo que conviene disponer de al menos ~20-24 GiB de memoria total para uso comodo con contexto moderado.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano, encajarian tarjetas con 24 GB o mas (RTX 3090/4090, A100 40 GB, H100) si se descarga el modelo completo en VRAM; tambien es viable un enfoque hibrido GPU/CPU.
- Cabe en GPU de consumo: probablemente en RTX 3090/4090 (24 GB) con las variantes Balanced o Compact; no confirmado en la documentacion.
- Opciones de despliegue: llama.cpp con el fork `moe-expert-grading` (rama/commit `0c1e570`) o el parche `graded-moe-0c1e570.patch` (md5 `7f2cd69518f4ae8c7e4ab8fa20259a57`). Existe un binario precompilado para Windows x64 (CPU + Vulkan). No hay soporte en llama.cpp estandar, vLLM, TGI ni Ollama por defecto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tamano | PPL | Licencia | Disponibilidad |
|---|---:|---:|---|---|
| MoE Expert Grading - Balanced | 17,26 GiB | 1,5030 | apache-2.0 | Requiere fork parcheado de llama.cpp |
| MoE Expert Grading - Compact | 15,59 GiB | 1,5096 | apache-2.0 | Requiere fork parcheado de llama.cpp |
| APEX I-Compact (upstream) | 16,10 GiB | 1,5125 | depende del base | llama.cpp estandar |
| Q3_K uniforme | 15,82 GiB | 1,5180 | depende del base | llama.cpp estandar |
| Upstream Q4_K_S | 20 GB | 1,5167 | depende del base | llama.cpp estandar |
| Upstream Q3_K_S | 15 GB | 1,5404 | depende del base | llama.cpp estandar |

La comparativa se limita a cuantizaciones del mismo modelo base. No se dispone de datos frente a otros modelos de 35B de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Incompatibilidad con llama.cpp estandar: estos GGUF incluyen metadatos `moe_expert_groups` y tensores por nivel; sin aplicar el parche o usar el fork, la carga falla con `failed to load model`.
- Licencia: apache-2.0 para esta cuantizacion; conviene verificar la licencia del modelo base Qwen3.6-35B-A3B antes de uso comercial.
- Sesgos conocidos: no documentados en la informacion disponible; se heredan del modelo base, no evaluados aqui.
- Riesgo de alucinacion: no evaluado en la informacion disponible.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se especifican en la ficha.
- Decodificacion: la decodificacion greedy provoca el bucle de repeticion conocido del modelo; es obligatorio usar los parametros de muestreo recomendados de Qwen3.6.
- Proceso reproducible pero fragil: la receta depende de identificadores internos (`v8`, `v10_cold_q2`) y de que la importance matrix este en orden ascendente de identificador de experto (`fix_imatrix_names.py`); un cambio silencioso de receta puede alterar el resultado.
- Madurez: el modelo tiene 0 descargas y 0 "likes", y se publico en 2026-10-02; es un artefacto muy reciente y poco validado por la comunidad.
- Perplexity no equivale a rendimiento en tareas: los buenos valores de PPL no garantizan calidad en razonamiento, codigo o dialogo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/E-stick/Qwen3.6-35B-A3B-MoEGraded
- Repositorio del fork y parche: https://github.com/wuliaott/moe-expert-grading
- Binario precompilado (Windows x64, CPU + Vulkan): https://github.com/wuliaott/moe-expert-grading/releases/tag/v1.0-graded-moe
- llama.cpp (rama base, commit `0c1e570`): https://github.com/ggml-org/llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B

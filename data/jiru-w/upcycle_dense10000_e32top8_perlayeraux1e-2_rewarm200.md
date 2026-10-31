# JIRU-W/upcycle_dense10000_e32top8_perlayeraux1e-2_rewarm200

## Resumen

Este modelo es un checkpoint de investigación de un Mixture-of-Experts (MoE) obtenido por *upcycling* ingenuo de un modelo denso, publicado por el usuario JIRU-W en HuggingFace. El modelo denso base, `JIRU-W/dense_e1_seq2048_gbs128_10b`, se detuvo en el paso 10000 y se convirtió en un MoE de 32 expertos con top-8, copiando exactamente el MLP SwiGLU denso de cada capa en cada uno de los 32 expertos. El objetivo declarado del experimento es estudiar si expertos inicialmente idénticos pueden diferenciarse durante el entrenamiento posterior.

El entrenamiento continuó con el dataset `JIRU-W/olmoe-mix-0924-10b`, una pérdida de balanceo de carga (coefficient 0,01) calculada por capa, y una re-warmup del learning rate. La ejecución se detuvo en el paso 13908 de los 38.139 planificados, por lo que el modelo no está entrenado hasta su finalización. Es un modelo de investigación pequeño, no instruction-tuned, con 3.696.887.808 parámetros totales y licencia Apache 2.0. Su relevancia es principalmente académica: sirve para estudiar dinámicas de especialización de expertos en MoE tras upcycling, un tema de interés en la literatura de eficiencia de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con MoE (upcycling de modelo denso, estilo OLMoE) |
| Parametros totales | 3.696.887.808 (dato real de safetensors) |
| Parametros activos | no disponible (top-8 de 32 expertos por capa; no se publica el recuento exacto de parámetros activos) |
| Longitud de contexto | 2048 tokens (según el nombre del modelo base y el tamaño de secuencia del entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible (dataset de entrenamiento tipo OLMoE mix; no se declara idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoints HF) y checkpoints DeepSpeed ZeRO-2 con estado del optimizador |

## Arquitectura y entrenamiento

La arquitectura parte de un modelo denso con MLP SwiGLU de tamaño intermedio 1024. El proceso de upcycling (`upcycle_dense.py`) copió el MLP denso de cada capa en los 32 expertos de esa capa, sin ruido ni reinicialización parcial. El router se inicializó de forma nueva con distribución normal(0, 0,02) y semilla 1234, con `norm_topk_prob=True`, de modo que en el paso 10000 el MoE computa exactamente la misma función que el modelo denso original. Los embeddings, la atención, las normas y el `lm_head` se copiaron sin cambios.

El entrenamiento posterior usó el dataset `JIRU-W/olmoe-mix-0924-10b`, continuando el orden de datos del run denso, con lotes de 128 secuencias × 2048 tokens (262.144 tokens por paso). El optimizador es AdamW con estado fresco y weight decay 0,1; el learning rate continúa la schedule coseno del run denso (pico 8e-4, decaimiento hasta 8e-5 en el paso 38.139), con una re-warmup lineal de 200 pasos tras el upcycling. La pérdida de balanceo de carga usa coeficiente 0,01 y se calcula por separado para cada capa, promediando después (`router_aux_loss_per_layer=True`), una variante destacable frente al aux loss global habitual. La precisión es bf16 en pesos con acumulación de gradientes en fp32, usando DeepSpeed ZeRO-2 en una sola GPU. El run se detuvo en el paso 13908, habiendo visto unos 3,41B de tokens totales (incluida la fase densa) en el checkpoint `step13000`, con eval CE de 3,1503.

## Capacidades

- Generacion de texto basica (pipeline `text-generation`), como modelo base preentrenado sin afinar a instrucciones.
- Modelado de lenguaje a pequeña escala con arquitectura MoE sparse (32 expertos, top-8 por capa).
- Exposicion de logits del router por capa (`output_router_logits=True`), util para analizar la especializacion y el balanceo de expertos.
- Disponibilidad de multiples revisiones (checkpoints cada 10, 100 y 1000 pasos) para estudiar la evolucion temporal de la diferenciacion de expertos.
- No es un modelo instruction-tuned: no esta pensado para chat, tool calling ni agentes.
- Capacidades multilingues, de vision, de audio ni de razonamiento tipo "thinking mode": no disponibles.

## Casos de uso

- Investigacion en especializacion de expertos: cargar checkpoints sucesivos (`step10010` a `step13000`) y medir la divergencia entre expertos (por ejemplo, similitud coseno de pesos o estadisticas de asignacion del router) para estudiar si expertos idénticos se diferencian.
- Analisis del efecto del aux loss por capa: comparar este run (aux loss por capa) con runs equivalentes que usen aux loss global, evaluando el balanceo de carga por capa mediante los `router_logits` expuestos.
- Estudio de upcycling denso-a-MoE: usar la revision `init` (modelo upcycled antes de entrenar MoE, equivalente funcional al denso) como linea base para medir la ganancia de entrenamiento sparse frente a denso a igual numero de tokens.
- Reproduccion y continuacion de entrenamiento: el checkpoint `ds_step13500` incluye estado de optimizador DeepSpeed y configuracion completa (`run_config.json`, `train_log.jsonl`), lo que permite reanudar el run desde el paso 13500 con DeepSpeed >= 0,19.6.
- Docencia y demostraciones de MoE: el tamano reducido (unos 3,7B de parametros) y el codigo de carga estandar de `transformers` lo hacen adecuado como ejemplo practico en cursos sobre arquitecturas sparse.
- Benchmarking de infraestructura de entrenamiento MoE en una sola GPU: el run original uso DeepSpeed ZeRO-2 en 1 GPU con bf16, un escenario replicable en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica publicada es la eval CE (entropia cruzada media por token sobre 256 secuencias de 2048 tokens reservadas):

| revision | tokens vistos (incl. fase densa) | eval CE |
|---|---|---|
| step10500 | 2,75B | 3,2360 |
| step11000 | 2,88B | 3,2180 |
| step11500 | 3,01B | 3,1994 |
| step12000 | 3,15B | 3,1809 |
| step13000 | 3,41B | 3,1503 |

## Requisitos de hardware

- El run original de entrenamiento se ejecuto en una sola GPU con DeepSpeed ZeRO-2 y bf16; no se especifica el modelo de GPU utilizado.
- El tamano del repositorio es de 281,0 GB, pero esto incluye multiples checkpoints y estados de optimizador; los pesos del modelo en bf16 ocupan aproximadamente 7,4 GB (3,7B parametros × 2 bytes), por lo que la inferencia es viable en GPUs de consumo con 12-16 GB de VRAM.
- GPUs de consumo adecuadas para inferencia: RTX 3090, RTX 4090 o similares con 24 GB, con holgura; en 12-16 GB deberia caber en bf16 o con cuantizacion ligera (no hay cuantizaciones oficiales publicadas).
- No se han publicado cuantizaciones GGUF ni soporte confirmado en llama.cpp u Ollama; el modelo usa `trust_remote_code=True` con arquitectura `mask_moe` personalizada, por lo que la compatibilidad con runtimes alternativos no esta garantizada.
- Despliegue recomendado: `transformers` (libreria declarada), con `AutoModelForCausalLM.from_pretrained(..., trust_remote_code=True, dtype=torch.bfloat16)`. vLLM, TGI y llama.cpp: compatibilidad no disponible/confirmada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Arquitectura | Contexto | Licencia | Finalidad |
|---|---|---|---|---|---|
| JIRU-W/upcycle_dense10000_e32top8_perlayeraux1e-2_rewarm200 | 3,70B | MoE 32 expertos top-8 (upcycled) | 2048 | Apache 2.0 | Investigacion: diferenciacion de expertos tras upcycling; no instruction-tuned |
| JIRU-W/dense_e1_seq2048_gbs128_10b (modelo base) | no disponible (denso, ~10B de nombre de run) | Transformer denso con SwiGLU | 2048 | no disponible | Modelo denso de partida del upcycling |
| OLMoE-1B-7B (allenai) | 6,9B totales / ~1,3B activos | MoE 64 expertos top-8 | 4096 | Apache 2.0 | Modelo MoE abierto preentrenado y instruction-tuned para uso general |

Nota: este modelo es un artefacto de investigacion a medio entrenar (paso 13908 de 38.139), no un modelo de produccion; la comparativa con OLMoE sirve como referencia de categoria, no de rendimiento.

## Limitaciones y advertencias

- El entrenamiento se detuvo en el paso 13908 de 38.139 planificados: el modelo no esta entrenado hasta su finalizacion y su calidad es la de un checkpoint intermedio.
- No esta instruction-tuned: no sigue instrucciones, no es apto para chat, y producira texto de continuacion basico con riesgo elevado de incoherencia.
- Riesgo de alucinacion y sesgos: al ser un modelo base preentrenado sin afinado ni alineacion (sin RLHF/DPO declarados), hereda los sesgos del dataset de entrenamiento sin mitigacion alguna.
- Longitud de contexto limitada a 2048 tokens.
- Idiomas soportados no declarados; la composicion del dataset `olmoe-mix-0924-10b` no se detalla en la model card.
- Requiere `trust_remote_code=True` (codigo personalizado `mask_moe`), lo que implica ejecutar codigo del autor y puede romperse con futuras versiones de `transformers`.
- Compatibilidad con runtimes de inferencia optimizados (vLLM, llama.cpp, Ollama) no confirmada.
- Licencia Apache 2.0: sin restricciones de uso comercial, aunque la naturaleza experimental del modelo desaconseja su uso en produccion.
- Las metricas publicadas (eval CE) se limitan a 256 secuencias reservadas y no son comparables directamente con benchmarks estandar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JIRU-W/upcycle_dense10000_e32top8_perlayeraux1e-2_rewarm200
- Modelo denso base: https://huggingface.co/JIRU-W/dense_e1_seq2048_gbs128_10b
- Dataset de entrenamiento: https://huggingface.co/datasets/JIRU-W/olmoe-mix-0924-10b
- Paper, blog o demo: no disponibles

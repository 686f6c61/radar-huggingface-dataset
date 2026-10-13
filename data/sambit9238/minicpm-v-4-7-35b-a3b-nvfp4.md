# sambit9238/MiniCPM-V-4.7-35B-A3B-NVFP4

## Resumen

MiniCPM-V-4.7-35B-A3B-NVFP4 es una cuantización experimental en NVFP4 (coma flotante de 4 bits) del modelo multimodal openbmb/MiniCPM-V-4.7-35B-A3B, publicada por el usuario sambit9238. El modelo base es un transformer multimodal de tipo mezcla de expertos (MoE) con 35.212.875.824 parámetros totales, torre de visión y capas de atención lineal, capaz de procesar imágenes y texto (pipeline image-text-to-text). La cuantización se generó con llm-compressor y está diseñada para GPUs NVIDIA Blackwell, donde las multiplicaciones de matrices pueden ejecutarse en los tensor cores FP4 nativos.

El objetivo es cuantizar tanto los pesos como las activaciones a 4 bits (W4A4) para aumentar el rendimiento en cargas limitadas por cómputo, como prompts largos, prefill con muchas imágenes y servicio por lotes. Frente a las cuantizaciones oficiales de 4 bits (AWQ, GPTQ, int4), que son weight-only (W4A16), esta versión también cuantiza las activaciones. El repositorio ocupa 23,6 GB, frente a los 70,4 GB del BF16 original.

Es importante señalar que el propio autor la marca como experimental: la perplejidad en Wikitext sube un 3,70 % respecto a BF16 y la recuperación de información en contextos largos se degrada de forma notable (1/5 aciertos a ~120.000 tokens frente a 3/5 en BF16). Los benchmarks de texto estándar y todos los de visión no se han ejecutado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal MoE con capas de atencion lineal y torre de vision (base MiniCPM-V 4.7) |
| Parametros totales | 35.212.875.824 (35,2B) |
| Parametros activos | no disponible (la nomenclatura "A3B" del modelo base sugiere del orden de 3.000 millones, sin confirmar) |
| Longitud de contexto | no disponible (el autor probo recuperacion tipo needle hasta ~120.000 tokens) |
| Tipos de cuantizacion | NVFP4 (W4A4, grupo de 16, escalas FP8 E4M3); el modelo base ofrece BF16, FP8, AWQ, GPTQ e int4 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, esquema compressed-tensors (nvfp4-pack-quantized) |
| Tamaño del repositorio | 23,6 GB |
| Libreria | transformers (tambien compatible con vLLM, imagen nocturna) |
| Version de compressed-tensors | 0.19.1a20261009 |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo base, openbmb/MiniCPM-V-4.7-35B-A3B, es un transformer multimodal con arquitectura de mezcla de expertos y capas de atención lineal, con una torre de visión independiente. Esta ficha no describe el entrenamiento del modelo base (no disponible en la información proporcionada); lo que documenta es el proceso de cuantización.

La cuantización se realizó con llm-compressor y afecta a todas las capas `Linear` del modelo de lenguaje, incluidos los expertos enrutados de la MoE, que se convierten a NVFP4 (W4A4). Se mantienen en BF16 la torre de visión completa (`model-vision-bf16.safetensors`), `lm_head`, los embeddings, el router de la MoE (`mlp.gate`), el `shared_expert_gate` y las capas de atención lineal. La calibración usó 512 muestras truncadas a 2.048 tokens cada una (70 % de HuggingFaceH4/ultrachat_200k con la plantilla de chat del modelo y 30 % de glaiveai/glaive-function-calling-v2 como texto sin plantilla), con semilla de barajado 42 y calibración de todos los expertos MoE (`moe_calibrate_all_experts=True`), solo texto. El proceso se dividió en dos pasos: cuantizar únicamente el modelo de lenguaje y después ensamblar el checkpoint copiando la torre de visión sin modificaciones y añadiendo sus patrones de exclusión al `config.json`.

Un aspecto relevante es que la cabeza de predicción multi-token (MTP) no se incluye. El `config.json` conserva `mtp_num_hidden_layers: 1` heredado del modelo base, pero el checkpoint BF16 original no incluye pesos MTP, por lo que la decodificación especulativa basada en MTP no funcionará con este checkpoint.

## Capacidades

- Generación de texto e interacción conversacional multi-turno, con plantilla de chat propia del modelo base.
- Procesamiento de imagen y texto (image-text-to-text); la vía de visión se validó únicamente con una prueba de humo de una imagen, que describió correctamente.
- Razonamiento sobre entradas mixtas (texto e imagen), aunque sin benchmarks de visión ejecutados en esta cuantización.
- Llamada a herramientas (tool calling / function calling): verificado con una suite de 150 casos, con tasas idénticas a BF16 en temperatura 0.
- Capacidad de decidir no invocar una herramienta cuando no procede (45 casos, 100 % en ambos modelos).
- Recuperación de información en contexto: verificado con pruebas needle en 8k, 32k, 64k y ~120k tokens.
- Capacidades multilingües: no disponible.

## Casos de uso

- Servicio de inferencia multimodal por lotes en GPUs Blackwell: al cuantizar también las activaciones, las matmuls pueden ejecutarse en tensor cores FP4, lo que resulta adecuado para cargas limitadas por cómputo como prefill de prompts largos o con muchas imágenes.
- Atención al cliente con entradas mixtas: el modelo puede gestionar conversaciones multi-turno e interpretar capturas o imágenes adjuntas, apoyándose en su formato de chat nativo.
- Asistentes con function calling: dado que la tasa de coincidencia exacta de llamadas a herramientas iguala a BF16 (97,1 % a temperatura 0) y el parseo JSON llega al 100 %, es apto para flujos de agente que invocan APIs.
- Pipelines de RAG en contexto corto o medio: es viable para recuperación por debajo de 32k tokens, donde las pruebas needle dieron 5/5 tanto en BF16 como en NVFP4.
- Procesamiento de documentos con imágenes (OCR o VQA): la torre de visión permanece en BF16, aunque el autor solo realizó una prueba de humo y no ejecutó OCRBench, ChartQA, DocVQA ni MMMU.
- Prototipado en un DGX Spark: el checkpoint se construyó y probó en este equipo, lo que lo hace idóneo para validación local antes de desplegar en producción.
- Investigación sobre cuantización: sirve como referencia para estudiar el impacto de W4A4 frente a W4A16 en un modelo multimodal MoE, con ficheros de resultados sin procesar en `eval/`.

## Benchmarks y rendimiento

Todas las cifras son ejecuciones propias del autor sobre un único DGX Spark, con ambos modelos servidos por vLLM (imagen nocturna) y los mismos parámetros.

| Prueba | BF16 | NVFP4 | Notas |
|---|---|---|---|
| Perplejidad Wikitext | 9,520 | 9,872 (+3,70 %) | |
| KL media frente a BF16 (50.618 posiciones) | — | 0,0710 | p99 KL 0,735 |
| Coincidencia top-1 con BF16 | — | 88,57 % | |
| Parseo JSON de llamadas a herramienta (T=0) | 100 % | 100 % | 105 casos |
| Coincidencia exacta de llamada (T=0) | 97,1 % | 97,1 % | Mismos fallos en ambos |
| Coincidencia exacta de llamada (T=0,7, 3 ejecuciones) | no ejecutado | 96,8 % | Sin línea base BF16 |
| No invocar herramienta cuando no procede | 100 % | 100 % | 45 casos |
| Needle @8k / @32k | 5/5, 5/5 | 5/5, 5/5 | |
| Needle @64k | 5/5 | 4/5 | |
| Needle @~120k | 3/5 | 1/5 | BF16 también es poco fiable aquí |
| GSM8K, IFEval, MMLU-Pro, GPQA-Diamond | no ejecutado | no ejecutado | |
| OCRBench, ChartQA, DocVQA, MMMU, MathVista | no ejecutado | no ejecutado | |

Advertencias sobre la lectura de estos datos: los tamaños de muestra son pequeños (5 ensayos por longitud de contexto en needle y 150 casos en la suite de herramientas), por lo que un único fallo altera mucho el resultado. La vía de visión solo se comprobó con una prueba de humo y todas las comprobaciones de visión usaron `downsample_mode="16x"`; el modo más fino `"4x"` no se ha probado con este checkpoint.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan 23,6 GB en safetensors; a ello hay que sumar la caché KV y las activaciones, cuyo consumo depende de la longitud de contexto y del tamaño de lote (no cuantificado en la información disponible).
- GPU objetivo: NVIDIA Blackwell, ya que el formato NVFP4 W4A4 aprovecha los tensor cores FP4 nativos. El autor lo construyó y probó en un DGX Spark.
- GPU de consumo: una RTX 5090 (32 GB, Blackwell) podría alojar los pesos con margen limitado para caché KV en contexto corto o medio; una RTX 4090 (24 GB, Ada Lovelace) no dispone de soporte FP4 nativo y su comportamiento no está documentado.
- Otros aceleradores Blackwell: B200 (192 GB) y RTX PRO 6000 Blackwell (96 GB) serían holgados para despliegues con lotes grandes y contexto largo.
- Opciones de despliegue: vLLM (imagen nocturna, la usada por el autor) para inferencia con soporte de compressed-tensors; el repositorio también se etiqueta como compatible con transformers mediante compressed-tensors.
- Latencia y throughput: no disponible. El autor no ha medido throughput ni calidad frente a las cuantizaciones oficiales, por lo que el beneficio de rendimiento es una expectativa motivada, no un resultado medido.
- Decodificación especulativa MTP: no compatible con este checkpoint, al no incluir los pesos de la cabeza MTP.

## Comparativa con modelos similares

| Variante (mismo modelo base) | Pesos | Activaciones | Tamaño safetensors | Naturaleza |
|---|---|---|---|---|
| BF16 (original) | BF16 | BF16 | 70,4 GB | Referencia sin pérdida |
| FP8 oficial | 8 bits | — | 38,0 GB | Cuantización oficial |
| AWQ / GPTQ / int4 oficiales | 4 bits entero | 16 bits | 22,6 GB | Weight-only (W4A16) |
| NVFP4 (este repositorio) | 4 bits flotante | 4 bits flotante | 23,6 GB | W4A4 para Blackwell |

Este repositorio pesa aproximadamente 1 GB más que las cuantizaciones oficiales de 4 bits porque conserva más capas en BF16 (torre de visión, embeddings, router MoE y capas de atención lineal). No se han publicado comparativas de rendimiento o calidad de esta variante frente a AWQ, GPTQ, int4 o FP8 oficiales en la información disponible.

## Limitaciones y advertencias

- Rendimiento degradado en contexto largo: la recuperación needle cae de 5/5 a 4/5 a 64k tokens y de 3/5 a 1/5 a ~120k. El autor recomienda usar BF16 si se depende de recuperación más allá de ~32k tokens.
- Perplejidad superior: 9,872 frente a 9,520 en Wikitext, un incremento del 3,70 %.
- Divergencia frente a BF16: KL media de 0,0710 y p99 de 0,735, con una coincidencia top-1 del 88,57 %.
- Validación incompleta: no se han ejecutado benchmarks de texto estándar (GSM8K, MMLU-Pro, IFEval, GPQA-Diamond) ni de visión (OCRBench, ChartQA, DocVQA, MMMU, MathVista). La calidad en tareas no probadas es desconocida.
- Visión sin verificar: la vía de visión solo superó una prueba de humo de una imagen; los pesos de visión se mantienen en BF16 sin pasar por llm-compressor.
- Muestras pequeñas en la evaluación: 5 ensayos por longitud de contexto y 150 casos de herramienta, con alta varianza potencial.
- Sin decodificación especulativa MTP: la cabeza MTP no está incluida pese a figurar en el `config.json`.
- Calibración solo de texto: los datos de calibración no incluyeron imágenes ni el formato nativo de llamada a herramientas para la parte de glaive, lo que puede afectar al comportamiento fuera de distribución.
- Dependencia de hardware: el beneficio principal requiere GPUs NVIDIA Blackwell; en otras arquitecturas el comportamiento no está documentado.
- Madurez baja: repositorio con 0 descargas y 0 "likes" en el momento de la consulta, publicado por un autor individual y marcado explícitamente como experimental.
- Licencia: Apache 2.0, heredada del modelo base, sin restricciones comerciales adicionales indicadas en la información disponible.
- Riesgo de alucinación y sesgos: no documentado específicamente para esta cuantización; el autor no publica análisis al respecto.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/sambit9238/MiniCPM-V-4.7-35B-A3B-NVFP4
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B
- Cuantización oficial FP8: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B-FP8
- Cuantización oficial AWQ: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B-AWQ
- Cuantización oficial GPTQ: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B-GPTQ
- Cuantización oficial int4: https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B-int4
- Herramienta de cuantización llm-compressor: https://github.com/vllm-project/llm-compressor
- Dataset de calibración (texto): https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset de calibración (function calling): https://huggingface.co/datasets/glaiveai/glaive-function-calling-v2
- Receta de cuantización: recipe.yaml (dentro del repositorio)
- Scripts de cuantización y ensamblado: scripts/quantize_nvfp4.py y scripts/assemble_checkpoint.py (dentro del repositorio)
- Resultados sin procesar de evaluación: eval/ (dentro del repositorio)
- Casos de prueba de herramientas: eval/cases.jsonl y eval/tools.json (dentro del repositorio)

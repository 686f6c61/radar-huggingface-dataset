# scorpoon/Darwin-180B-RSI-R3-exl3-3.05bpw-SC

## Resumen

Darwin-180B-RSI-R3-exl3-3.05bpw-SC es una compilacion cuantizada en formato EXL3 del modelo Darwin-180B-RSI-R3, publicado por el usuario scorpoon. El modelo original lo desarrollan FINAL-Bench y VIDRAFT, y es un Mixture-of-Experts (MoE) de 180.000 millones de parametros con capacidad vision-lenguaje, atencion hibrida y una ventana de contexto de 262.144 tokens. Esta version concreta no modifica pesos mas alla de la cuantizacion: unicamente se recuantizan los tensores y se anaden metadatos EXL3, manteniendo intactos el LICENSE y la configuracion del modelo base.

El proposito de esta publicacion es hacer desplegable en hardware de consumo y de gama alta un modelo de 180B que en BF16 resultaria inviable. Con 3,05 bits por peso (medidos 3,09 en capas y 8,0 en la cabeza de salida) los pesos ocupan 49,56 GiB repartidos en 7 shards, frente a los cientos de gigabytes de la version BF16. La receta de asignacion de bits se apoya en el optimizador `sc_optimize` de ExLlamaV3, que reserva 3 bits uniformes para los expertos enrutados y hasta 5 bits para las rutas no expertas.

La relevancia del modelo base es notable: la familia Darwin-180B-RSI acumula diez primeros puestos oficiales en Hugging Face, con R3 en el puesto numero 1 de ExtractBench (90,29) y numero 3 de EvasionBench (77,83). Esta build EXL3 esta pensada como sustituto directo del BF16 en produccion, con una degradacion medida de perplexity de solo el +1,33% respecto al original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atencion hibrida, vision-lenguaje; 512 expertos |
| Parametros totales | 180B (el contador de HF lee ~27B porque interpreta los tensores EXL3 empaquetados) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (n_ctx 262144) |
| Tipos de cuantizacion | EXL3 3,05 bpw (3,09 en capas + 8,0 en cabeza de salida); MTP a 5 bits; torre de vision a 5 bits; tabla n-gram de 6 bits |
| Idiomas soportados | Coreano e ingles (segun el modelo base); la metadata de HF indica "no disponible" |
| Licencia | qwen-community-1.0 (campo `license: other` con `license_name: qwen-community-1.0`) |
| Formato de pesos | EXL3 (exllamav3); rama `3.05bpw_h8_ng6`, 7 shards, 49,56 GiB |
| Tamano del repositorio | 53,4 GB |
| Libreria | exllamav3 (requiere v1.5.4 o superior) |
| Pipeline | image-text-to-text |
| Fecha de publicacion | 2026-10-06 |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de 180B parametros con 512 expertos, atencion hibrida y soporte vision-lenguaje (pipeline image-text-to-text). La ventana de contexto alcanza los 262.144 tokens. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el material proporcionado. La model card del modelo base menciona capacidades de auto-mejora (recursive self-improvement, `darwin-rsi`), pensamiento eficiente y salida estructurada, con la etiqueta `qwen3_8` y el parentesco declarado con Qwen3.8-Flash-Next.

Sobre esta build EXL3, el proceso de cuantizacion se realizo con `convert.py` de ExLlamaV3 v1.5.4 usando una receta `sc_optimize` con asignacion `mink3/maxk5`: los expertos enrutados se fijan a 3 bits planos, las rutas no expertas suben hasta 5 bits y la cabeza de salida se reserva a 8 bits. La calibracion empleo 467 filas de 2.048 tokens (217 filas de trazas agenticas y 250 filas auto-muestreadas balanceadas por experto), codebook `mul1`, `--out_scales always`, cabeza MTP a 5 bits, torre de vision a 5 bits y una tabla n-gram independiente de 6 bits (`-ngf`). La tabla n-gram (36,4 GiB) es independiente del modelo y no se sube al repositorio: debe descargarse de turboderp/Qwen3.8-Flash-Next-exl3 y colocarse en la carpeta del modelo.

## Capacidades

- Razonamiento complejo con modo de pensamiento eficiente y bajo consumo de tokens (`efficient-thinking`, `token-efficient`).
- Generacion de codigo y resolucion de problemas matematicos competitivos (segun los benchmarks del modelo base: AIME 2026 y HMMT Feb 2026 al 100% en R1).
- Vision-lenguaje: procesamiento conjunto de imagen y texto (pipeline image-text-to-text).
- Extraccion estructurada de informacion y salida estructurada (`structured output`), con el primer puesto en ExtractBench (90,29).
- Capacidad de evasion y robustez frente a filtros (EvasionBench, 77,83).
- Contexto largo de 262.144 tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Soporte multilingue limitado a coreano e ingles segun el modelo base.
- Capacidades agenticas: las etiquetas y la calibracion basada en trazas agenticas sugieren uso en pipelines de agentes y razonamiento multi-paso.
- Decodificacion especulativa mediante cabeza MTP (draft de 4 tokens, aceptacion medida del 67,6% en modo greedy).
- Capacidad declarada de auto-mejora (`recursive-self-improvement`, `self-improving`).

## Casos de uso

- Extraccion de informacion estructurada en produccion: el modelo base lidera ExtractBench (90,29), por lo que es adecuado para convertir documentos, facturas o contratos no estructurados en JSON o esquemas definidos, aprovechando la ventana de 262K tokens para procesar documentos largos sin trocear.
- Atencion al cliente automatizada con contexto largo: la ventana de 262.144 tokens permite mantener historiales multi-turno extensos y adjuntar documentacion de referencia en la misma sesion sin perder coherencia.
- Analisis de documentos con imagen y texto: al soportar entrada image-text-to-text, puede extraer datos de capturas, formularios escaneados o diagramas junto al texto asociado.
- Agentes autonomos multi-paso: el modelo admite razonamiento multi-paso y las trazas agenticas formaron parte del corpus de calibracion, lo que lo hace apto para orquestar herramientas y encadenar acciones.
- Asistencia en investigacion matematica y cientifica: los resultados del modelo base en GPQA Diamond (94,44%) y en competiciones como AIME y HMMT sugieren utilidad en resolucion de problemas avanzados.
- Despliegue de razonamiento de alta calidad en hardware propio: con la receta EXL3 y la decodificacion especulativa MTP, permite servir un modelo de 180B en configuraciones de dos GPU de 32 GB con contexto completo, evitando dependencia de APIs externas.
- Procesamiento de textos legales o normativos en coreano e ingles: el modelo base obtiene 68,94% en LEXam (R1), lo que respalda tareas de analisis juridico en esos dos idiomas.
- Generacion de codigo asistida con contexto de repositorio: la ventana larga permite incluir varios archivos fuente como contexto para tareas de refactorizacion o revision.

## Benchmarks y rendimiento

Los siguientes datos corresponden al modelo base Darwin-180B-RSI-R3, no a esta cuantizacion, y proceden de la model card proporcionada. Las cifras de R1 y R3 se indican segun aparecen.

| Benchmark | R3 | R1 |
|---|---|---|
| ExtractBench | 90,29 (#1) | no disponible |
| EvasionBench | 77,83 (#3) | no disponible |
| GPQA Diamond | no disponible | 94,44% (#1) |
| MMLU-Pro | 87,65% (version POCKET GGUF, identica a BF16) | 88,12% (#1) |
| MMMU-Pro | no disponible | 79,48% (#1) |
| AIME 2026 | no disponible | 100% (#1) |
| HMMT Feb 2026 | no disponible | 100% (#1) |
| LEXam | no disponible | 68,94% (#1) |

Metricas de la cuantizacion (medidas sobre una traza de evaluacion reservada de ~45k tokens, disjunta de la calibracion):

| Metrica | BF16 base | 3.05bpw (esta build) | Cambio |
|---|---|---|---|
| Perplexity | 1,3612 | 1,3793 | +1,33% |
| KL divergence (frente a Qwen3.8-Flash-Next BF16) | 0,0120 | 0,0259 | — |
| KL divergence (frente a su propio R3 BF16) | — | 0,0165 | — |
| Aceptacion de draft MTP (greedy, longitud 4) | — | 67,6% | — |
| Throughput de decodificacion | — | +1,5 a +3% sobre el build 3.05bpw padre | — |

## Requisitos de hardware

- VRAM estimada: 49,56 GiB de pesos EXL3 repartidos en 7 shards. En estado estacionario, con cache de contexto de 262K tokens, la configuracion probada consume ~57 GiB entre las dos tarjetas.
- GPU recomendadas: la configuracion validada es 2x RTX 5090 de 32 GB. Los pesos superan una tarjeta unica de 32 GB, por lo que el modelo se reparte automaticamente entre dos GPU. Se requiere al menos 2 GPU con memoria agregada suficiente para ~57 GiB.
- Cabe en consumer GPU: si, en configuracion multi-GPU (2x RTX 5090 32 GB). No cabe en una unica GPU de 24 GB ni de 32 GB.
- Memoria del sistema: la tabla n-gram (36,4 GiB) se aloja en RAM del sistema; la configuracion probada usa 128 GB de RAM.
- CPU de referencia: Ryzen 9 9950X.
- Opciones de despliegue: ExLlamaV3 v1.5.4 o superior (unico runtime soportado para este formato EXL3). Para el modelo base existen alternativas GGUF (POCKET-Darwin-180B-GGUF, 111 GB) que permiten ejecucion en CPU.
- Configuracion estable probada: `n_ctx 262144`, `chunk_size 3072`, draft MTP con `draft_num_tokens 4`.
- Latencia y throughput: se reporta una mejora de throughput de decodificacion del +1,5 al +3% sobre el build 3.05bpw padre en ajustes identicos. No se proporcionan cifras absolutas de tokens por segundo para este build.
- Contexto alternativo CPU-only: para el modelo base en formato GGUF de 4 bits (111 GB) se reportan 18-21 tok/s en CPU y ejecucion en un portatil con GPU de 8 GB y 32 GB de RAM.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / tamano | Licencia | Notas |
|---|---|---|---|---|---|
| Darwin-180B-RSI-R3-exl3-3.05bpw-SC (esta build) | 180B MoE | 262.144 | EXL3, 49,56 GiB | qwen-community-1.0 | Perplexity +1,33% frente a BF16; requiere 2 GPU de 32 GB |
| Darwin-180B-RSI-R3 (BF16 base) | 180B MoE | 262.144 | BF16 (tamano no indicado) | qwen-community-1.0 | Modelo de referencia; KLD 0,0120 frente a Qwen3.8-Flash-Next |
| POCKET-Darwin-180B-GGUF (R3) | 180B MoE | 262.144 | GGUF 4 bits, 111 GB | qwen-community-1.0 (presunto, no confirmado en el material) | Ejecutable en CPU (18-21 tok/s); MMLU-Pro 87,65% identico a BF16 |
| Qwen3.8-Flash-Next | no disponible | no disponible | no disponible | no disponible | Modelo padre declarado; ExtractBench 89,88 (por debajo de R3, 90,29) |

## Limitaciones y advertencias

- Idiomas: el modelo base esta descrito como coreano e ingles; no hay soporte multilingue mas amplio confirmado, y la metadata de HF marca "no disponible" para idiomas.
- Degradacion por cuantizacion: la perplexity sube un +1,33% y la KL divergence frente a su propio R3 BF16 es 0,0165. Es una perdida pequena pero medible que puede notarse en tareas muy sensibles.
- Requisitos de hardware restrictivos: los 49,56 GiB de pesos no caben en una GPU de 32 GB; se necesitan dos tarjetas o mas, ademas de ~36,4 GiB de RAM del sistema para la tabla n-gram.
- Dependencia de software: requiere ExLlamaV3 v1.5.4 o superior; no es compatible con vLLM, llama.cpp ni Ollama en este formato.
- Fichero externo obligatorio: la tabla n-gram no se incluye en el repositorio y debe descargarse por separado desde turboderp/Qwen3.8-Flash-Next-exl3, lo que anade un paso de configuracion y una fuente de error.
- Contador de parametros enganoso: Hugging Face reporta ~27B al leer los tensores EXL3 empaquetados, aunque el modelo real es de 180B MoE; conviene tenerlo en cuenta al estimar recursos.
- Licencia qwen-community-1.0: los pesos son un derivado cuantizado del modelo base, por lo que las restricciones de uso comercial de dicha licencia aplican; conviene revisar los terminos del fichero LICENSE antes de un uso en produccion.
- Riesgo de alucinacion y sesgos: no se proporciona informacion especifica sobre sesgos conocidos ni tasas de alucinacion en el material disponible.
- Adopcion muy baja: en el momento de la consulta, el repositorio registra 0 descargas y 1 like, por lo que la validacion por parte de terceros es practicamente nula.
- Los datos de benchmarks corresponden al modelo base, no a esta cuantizacion; solo la perplexity y las metricas de KL se midieron sobre este build.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/scorpoon/Darwin-180B-RSI-R3-exl3-3.05bpw-SC
- Modelo base en Hugging Face: https://huggingface.co/FINAL-Bench/Darwin-180B-RSI-R3
- Licencia (fichero LICENSE del modelo base): https://huggingface.co/FINAL-Bench/Darwin-180B-RSI-R3/blob/main/LICENSE
- Version GGUF del modelo base: https://huggingface.co/FINAL-Bench/POCKET-Darwin-180B-GGUF
- Repositorio de ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Tabla n-gram y referencia de layout: https://huggingface.co/turboderp/Qwen3.8-Flash-Next-exl3
- ExtractBench: https://huggingface.co/datasets/llamaindex/ExtractBench
- EvasionBench: https://huggingface.co/datasets/FutureMa/EvasionBench
- GPQA Diamond: https://huggingface.co/datasets/Idavidrein/gpqa
- MMLU-Pro: https://huggingface.co/datasets/TIGER-Lab/MMLU-Pro
- MMMU-Pro: https://huggingface.co/datasets/MMMU/MMMU_Pro
- AIME 2026: https://huggingface.co/datasets/MathArena/aime_2026
- HMMT Feb 2026: https://huggingface.co/datasets/MathArena/hmmt_feb_2026
- LEXam: https://huggingface.co/datasets/LEXam-Benchmark/LEXam
- Sitio de VIDRAFT: https://vidraft.net
- Paper (arXiv:2605.14386): https://arxiv.org/abs/2605.14386
- Paper (arXiv:2609.20269): https://arxiv.org/abs/2609.20269

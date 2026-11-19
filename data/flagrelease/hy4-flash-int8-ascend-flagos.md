# FlagRelease/Hy4-flash-INT8-ascend-FlagOS

## Resumen

Hy4-flash-INT8-ascend-FlagOS es una distribucion cuantizada a 8 bits del modelo multimodal Hy4 Flash de Tencent Hunyuan, publicada por la comunidad FlagRelease dentro del ecosistema FlagOS. El modelo original es un transformer hibrido de aproximadamente 220.000 millones de parametros totales, de los cuales unos 12.000 millones se activan por token, e incorpora arquitecturas Latent MoE, Engram y atencion hibrida, con soporte nativo de entradas de texto e imagen y una longitud de contexto maxima de 1 millon de tokens. Esta version concreta esta empaquetada en formato INT8 (W8A8) y adaptada para ejecutarse sobre 16 NPU Ascend 910C en un unico host, mediante el stack FlagOS 2.2 y SGLang.

La relevancia de esta publicacion radica en su caracter de adaptacion "Day 0" multiplataforma: el consorcio FlagOS ha portado el modelo a nueve fabricantes de chips (T-Head, NVIDIA, Huawei Ascend, Hygon, Kunlunxin, Muxi, Moore Threads, TsingMicro e Iluvatar CoreX), lo que facilita el despliegue en infraestructuras heterogeneas sin depender exclusivamente de NVIDIA. Segun la model card, la build de FlagOS sobre H100 reporta hasta un 35,9 % mas de throughput de salida y hasta un 29,1 % menos de latencia hasta el primer token frente al stack nativo de NVIDIA.

El modelo esta orientado a cargas de trabajo de oficina intensivas en contexto: busqueda profunda, procesamiento de documentos, generacion de presentaciones y Computer Use. Su diseno reduce la huella de KV Cache a una sexta parte de la del modelo Hy4, lo que abarata el coste por tarea en escenarios de contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion hibrida, Latent MoE y Engram |
| Parametros totales | 220.251.201.958 (~220 mil millones) |
| Parametros activos | ~12 mil millones por token (incluye ~64 mil millones de parametros Engram) |
| Longitud de contexto | 1.000.000 tokens (modelo original); 65.536 tokens en el despliegue FlagOS documentado |
| Tipos de cuantizacion | INT8 (W8A8), formato compressed-tensors |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (8-bit, compressed-tensors) |

## Arquitectura y entrenamiento

Hy4 Flash combina atencion hibrida con Latent MoE y una arquitectura denominada Engram, que anade aproximadamente 64.000 millones de parametros especializados en recuperacion de conocimiento, de un total de 220.000 millones. Solo unos 12.000 millones de parametros se activan por token, lo que mantiene el coste computacional de inferencia contenido pese al tamano del modelo. El diseno de atencion hibrida reduce la KV Cache a una sexta parte de la del Hy4 original, una ventaja critica para contextos de hasta 1 millon de tokens. El modelo acepta texto e imagenes como entrada y genera texto.

No se dispone en la informacion proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO. La model card si documenta la infraestructura de despliegue: la version FlagOS ejecuta atencion con paralelismo de datos en 16 rangos (un rango por grupo de tensor-parallel de atencion) y paralelismo de expertos AscendOps en 16 rangos, con prefill en modo eager y replay de grafo para decode. Emplea kernels especificos (paged Sparse Flash Attention, LightningIndexer, atencion fused con sliding-window) proporcionados por CANN y FlagGems-sglang, compilacion Triton via FlagTree y comunicacion HCCL para intercambiar resultados de lookup de Engram entre los 16 rangos. Por defecto se desactivan el prefix caching y la prediccion multi-token (MTP).

## Capacidades

- Generacion de texto y razonamiento multimodal: acepta entradas de texto e imagen y produce texto.
- Razonamiento matematico y cientifico de alto nivel, con resultados destacados en Math-500 y GPQA Diamond.
- Procesamiento de documentos y busqueda profunda (deep search) sobre contextos extensos.
- Generacion de presentaciones (PPT) como caso de uso declarado por el autor.
- Computer Use: interaccion con entornos de escritorio y aplicaciones para automatizacion de tareas de oficina.
- Soporte bilingue chino-ingles.
- Ventana de contexto de hasta 1 millon de tokens en el modelo original, adecuada para documentos muy largos y conversaciones multi-turno prolongadas.
- API compatible con OpenAI en el despliegue FlagOS, con soporte de entradas de texto e imagen.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling ni modo thinking.

## Casos de uso

- Busqueda profunda sobre corpus documentales: el modelo puede ingerir decenas de documentos largos en una sola ventana de contexto (hasta 1 millon de tokens en el modelo original) y sintetizar respuestas con trazabilidad, lo que encaja con flujos de investigacion y analyst work.
- Procesamiento de documentos de oficina: extraccion, resumen y reescritura de contratos, informes y actas, aprovechando la entrada multimodal de imagen para digitalizar documentos escaneados.
- Generacion de presentaciones: a partir de un brief o de documentacion existente, el modelo produce el contenido estructurado de una presentacion, uno de los escenarios para los que fue disenado segun Tencent Hunyuan.
- Computer Use y automatizacion RPA: el modelo puede interpretar capturas de pantalla y decidir acciones sobre aplicaciones de escritorio, habilitando agentes de automatizacion de tareas administrativas.
- Atencion al cliente con contexto largo: conversaciones multi-turno con historial extenso e imagenes adjuntas (capturas, facturas) gracias a la ventana de contexto y a la entrada multimodal.
- Despliegue en infraestructura no-NVIDIA: la adaptacion FlagOS permite ejecutar el modelo en 16 NPU Ascend 910C o en chips de otros ocho fabricantes, util para organizaciones con parques heterogeneos o con requisitos de soberania tecnologica.
- Evaluacion comparativa de stacks de inferencia: el paquete incluye validacion de consistencia frente al stack nativo, lo que permite a equipos de plataforma medir throughput y latencia de FlagOS frente a alternativas propietarias.

## Benchmarks y rendimiento

Resultados publicados en la model card, comparando el stack nativo de NVIDIA con la build FlagOS sobre Moore Threads:

| Benchmark | Hy4-flash-Nvidia-Origin | Hy4-flash-Mthreads-FlagOS |
|---|---|---|
| Math-500 | 96,0 | 96,6 |
| GPQA Diamond | 92,42 | 89,9 |
| MMBench | 92,6 | En evaluacion |
| MMStar | 80,93 | En evaluacion |

Ademas, la model card indica que Hy4 Flash obtiene 42,1 en el benchmark interno WorkIndex de Tencent Hunyuan, frente a 39,7 de Hy4 Preview, con menor coste por tarea. Tambien se reporta que la build FlagOS sobre H100 logra hasta un 35,9 % mas de throughput de salida y hasta un 29,1 % menos de latencia hasta el primer token que el stack nativo de NVIDIA.

## Requisitos de hardware

- Despliegue de referencia: 16 NPU Ascend 910C en un unico host, con CANN 9.1, driver 25.5.0 y openEuler 22.03 LTS-SP4 sobre aarch64.
- El checkpoint INT8 ocupa 288,6 GB en el repositorio, por lo que requiere almacenamiento local rapido y memoria agregada de al menos ese orden entre los 16 aceleradores.
- No cabe en GPUs de consumo: el modelo completo en INT8 excede ampliamente la VRAM de una RTX 4090 (24 GB) o de varias de ellas en configuracion sencilla.
- Opciones de despliegue documentadas: contenedor Docker de FlagOS con SGLang (paquete `0.0.0.dev0+gc808dcac9007`), FlagGems-sglang 0.1.0, FlagTree 0.7.1+ascend3.5 y backend de paralelismo de expertos AscendOps.
- API compatible con OpenAI en el puerto configurable (por defecto 31002), con modelo `Hy4-flash-W8A8` y contexto maximo de 65.536 tokens en esta configuracion.
- No se proporcionan cifras de latencia o throughput absolutas para la configuracion Ascend; solo las relativas frente al stack nativo de NVIDIA.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Hy4-flash-INT8-ascend-FlagOS | ~220 B totales, ~12 B activos | 1 M tokens (65.536 en despliegue FlagOS) | Apache 2.0 | Version cuantizada INT8 para 16 NPU Ascend 910C |
| Hy4 Flash (original, Tencent Hunyuan) | ~220 B totales, ~12 B activos | 1 M tokens | Apache 2.0 | Pesos completos; referencia de calidad (WorkIndex 42,1) |
| Hy4 Preview (Tencent Hunyuan) | No disponible | No disponible | No disponible | Generacion anterior; WorkIndex 39,7 |
| Hy4 (generacion previa) | No disponible | No disponible | No disponible | Referencia de KV Cache: Hy4 Flash usa una sexta parte |

No se dispone en la informacion proporcionada de comparaciones con modelos de otros fabricantes (por ejemplo, familias Qwen, Llama o DeepSeek) en parametros, contexto o benchmarks.

## Limitaciones y advertencias

- Solo se declaran los idiomas chino e ingles; el rendimiento en castellano u otras lenguas no esta validado.
- El contexto maximo en el despliegue FlagOS documentado es de 65.536 tokens, muy inferior al millon de tokens del modelo original.
- La configuracion por defecto desactiva prefix caching y prediccion multi-token, lo que puede penalizar el throughput en cargas con prompts repetidos.
- El checkpoint INT8 puede introducir degradacion de calidad frente a los pesos originales; en la tabla publicada, GPQA Diamond baja de 92,42 a 89,9 en la build FlagOS sobre Moore Threads.
- No se documentan en la informacion disponible sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue depende de componentes (CANN, SGLang, FlagGems, FlagTree) con sus propias licencias y requisitos de version.
- El modelo esta pensado para cargas de oficina; su uso en dominios regulados (salud, legal, finanzas) requeriria validacion adicional no documentada.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que la madurez de la comunidad en torno a esta build es todavia incipiente.

## Enlaces

- Hugging Face: https://huggingface.co/FlagRelease/Hy4-flash-INT8-ascend-FlagOS
- Imagen Docker FlagOS: harbor.baai.ac.cn/flagrelease-public/hy4-flash-ascend001-gems0.0-tree0.7.1-cxnone-pluginnone-vllmnone-sglang0.5.20-sglangfl0.1.0-cp312-ptnpu210-cann91-a64-25.5.0:202611191400
- Descarga de pesos via ModelScope: `modelscope download --model FlagRelease/Hy4-flash-INT8-ascend-FlagOS`

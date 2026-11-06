# FlagRelease/MiniCPM-OCR-1.0-BF16-arm-FlagOS

## Resumen

MiniCPM-OCR 1.0 es un modelo especializado en reconocimiento optico de caracteres (OCR) y parsing de documentos, desarrollado por ModelBest en colaboracion con OpenBMB. Con 1.300.434.160 parametros (~1,3B), esta disenado para procesar imagenes de paginas completas (PNG/JPEG) y devolver texto o Markdown, cubriendo escenarios reales de digitalizacion documental como escaneos, fotografias, paginas curvadas y pantallas re-fotografiadas. Soporta parsing de texto, formulas y tablas complejas, ademas de extraccion de informacion clave.

La version aqui descrita es el paquete `FlagRelease/MiniCPM-OCR-1.0-BF16-arm-FlagOS`, una distribucion adaptada por la comunidad FlagOS para ejecucion en CPU ARM (Apple Silicon M5 y CIX P1). Incluye pesos en BF16 sin cuantizar, un fork de Transformers 5.19.0.dev0, PyTorch 2.11.0 en modo CPU y el stack FlagGems/FlagTree-CPU para acelerar operaciones matematicas sin GPU. Esta orientado a despliegues en dispositivos de borde (edge) y servidores multi-chip, con adaptacion Day-0 a 12 plataformas de hardware.

El modelo reporta una puntuacion de 93.68 en Real5-OmniDocBench y, con la aceleracion de decodificacion DSpark, una mejora del 55% en eficiencia de procesamiento end-to-end. Su relevancia actual radica en ofrecer OCR de calidad en hardware sin GPU dedicada, con licencia Apache 2.0 y soporte para chino e ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniCPMOcrForConditionalGeneration (transformer multimodal con backbone de texto Qwen3.5) |
| Parametros totales | 1.300.434.160 (~1,30B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 sin cuantizar (el paquete no cuantiza el modelo ni el LM head en carga); valores BF16 pueden ensancharse a FP32 para acumulacion |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |
| Capas del backbone de texto | 24 |
| Hidden size | 1024 |
| Checkpoint | merge_rl_mergedp1_7140_hf5_4x |
| Motor de inferencia | Fork de Transformers 5.19.0.dev0 + PyTorch 2.11.0 CPU + FlagGems |
| Generacion | Greedy, thinking desactivado; 8192 tokens nuevos por defecto, limite CLI/API 16384 |
| Entrada/salida | Una imagen de pagina + prompt → texto/Markdown generado |
| Tamano del repo | 2,6 GB |

## Arquitectura y entrenamiento

La arquitectura es `MiniCPMOcrForConditionalGeneration`, un modelo multimodal condicional para generacion que combina un backbone de texto Qwen3.5 (24 capas, hidden size 1024) con componentes de vision para procesar imagenes de pagina completa. Los pesos de modelo y vision se distribuyen en BF16 original sin cuantizar, y el LM head esta atado a la embedding de entrada, permaneciendo sin cuantizar en tiempo de ejecucion. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en la informacion proporcionada.

El paquete FlagOS incorpora optimizaciones de ejecucion en CPU: en Mac M5 Pro utiliza dos workers SME GEMM, 18 hilos de prefill y 4 de decode, combinando linears SME/TLE Raw de FlagGems, atencion de vision, decodificacion GDN con Triton y append de KV, y una hoja de convolucion BF16 TLE Raw. En CIX P1 usa ocho hilos de framework, GEMMs nativos sin cuantizar, operaciones Triton GDN/KV y la misma hoja de convolucion compilada para Linux, sin los kernels SME de M5. La aceleracion DSpark mejora la eficiencia end-to-end un 55%. El procesamiento de PDF y layout queda fuera del paquete: es necesario renderizar cada pagina a imagen antes de la inferencia.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre imagenes de paginas completas en PNG y JPEG.
- Parsing de documentos: extraccion de texto, formulas matematicas y tablas complejas.
- Extraccion de informacion clave de documentos estructurados.
- Generacion de salida en texto plano o Markdown.
- Manejo de escenarios reales degradados: escaneos, fotografias, paginas curvadas y pantallas re-fotografiadas.
- Soporte multilingue limitado a chino e ingles.
- Generacion greedy con thinking desactivado; no se documenta modo de razonamiento explicito.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico multi-paso en la informacion disponible.
- No se documenta capacidad de audio ni vision general mas alla del OCR documental.

## Casos de uso

- Digitalizacion masiva de archivos escaneados: el modelo procesa cada pagina renderizada como imagen y devuelve Markdown estructurado, adecuado para pipelines de conversion de PDF a texto en servidores CPU sin GPU.
- Extraccion de tablas y formulas en documentacion tecnica y cientifica: permite recuperar estructura tabular y notacion matematica de articulos y manuales, reduciendo la revision manual.
- Procesamiento en dispositivos de borde: gracias a su tamano de 1,3B y ejecucion en CPU ARM (M5, CIX P1), puede desplegarse en terminales sin GPU para OCR local con privacidad de datos.
- Control de calidad documental: el modelo complementario MiniCPM-OCR Jev (2B) actua como inspector de fiabilidad del parsing, puntuando resultados y marcando contenido que requiere revision humana; puede conectarse a distintos motores OCR.
- Digitalizacion de pantallas re-fotografiadas: escenario especifico soportado (re-photographed screens) util para capturar informacion de terminales o displays en campo.
- Extraccion de informacion clave en flujos administrativos: identificacion de campos relevantes en formularios y documentos para alimentar sistemas de gestion, con salida en texto o Markdown integrable en bases de datos.
- Despliegue multi-chip en servidores: la adaptacion FlagOS cubre 12 plataformas (T-Head, NVIDIA, Huawei Ascend, Hygon, KUNLUNXIN, MetaX, Moore Threads, Tsingmicro, Iluvatar CoreX, Xiwang, Mac ARM y CIX), permitiendo elegir el hardware segun recursos existentes.

## Benchmarks y rendimiento

| Benchmark | MiniCPM-OCR 1.0 | Referencia comparativa |
|---|---|---|
| Real5-OmniDocBench | 93.68 | No disponible |
| Mejora de eficiencia con DSpark | +55% end-to-end | No disponible |
| Throughput FlagOS vs nativo NVIDIA (OCR 1.0) | Hasta 1,69x P50 nativo por unidad de pico de computo | Nativo NVIDIA (1,0x) |
| Throughput FlagOS vs nativo NVIDIA (Jev 2B) | 98,7% del throughput nativo NVIDIA | Nativo NVIDIA (100%) |
| Evaluacion de bloque de pagina en ARM edge (Jev, M5 CPU) | 1,20 s de media | No disponible |
| AUROC en JevOCRBench (Jev 2B) | 0,936 | Qwen3.5-397B-A17B: 0,938 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de razonamiento general en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; esta distribucion esta disenada para inferencia en CPU, sin GPU ni ejecucion Metal.
- Memoria RAM: validado en Mac M5 Pro con 64 GiB y en CIX P1 con 32 GiB (restringido a ocho nucleos Cortex-A720).
- GPU recomendadas: no aplica para este paquete (CPU-only). La familia FlagOS cubre otras plataformas con aceleradores, pero esta build concreta es para ARM CPU.
- Cabe en consumer: si, en equipos Apple Silicon (M5 Pro validado) y en placas ARM como CIX P1; no requiere GPU dedicada.
- Almacenamiento: reservar unos 25 GiB libres para una instalacion offline que incluye archivos y espacio temporal de importacion Docker.
- Opciones de despliegue: fork de Transformers 5.19.0.dev0 con PyTorch 2.11.0 CPU, FlagGems, FlagTree-CPU/Triton CPU 3.7.2, y vLLM 0.24.0+cpu con vLLM-Plugin-FL (usado por el perfil Jev, no como motor de ejecucion del OCR).
- Latencia: en ARM edge, Jev completa una evaluacion de bloque de pagina en 1,20 s de media usando solo la CPU M5; no se proporciona latencia especifica para OCR 1.0 en esta build.
- Throughput: hasta 1,69x el P50 nativo por unidad de pico de computo en la plataforma evaluada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-OCR 1.0 (este) | 1,30B | No disponible | OCR y parsing documental | Apache 2.0 | Hugging Face (build FlagOS ARM) |
| MiniCPM-OCR Jev | 2B | No disponible | Inspector de calidad OCR | No disponible en la informacion | Familia MiniCPM-OCR |
| Qwen3.5-397B-A17B | 397B (17B activos, MoE) | No disponible | Modelo general | No disponible en la informacion | Referencia comparativa en JevOCRBench |

No se dispone de datos de benchmarks comparativos directos con otros modelos OCR especializados (como PaddleOCR o Donut) en la informacion proporcionada.

## Limitaciones y advertencias

- Idiomas limitados a chino e ingles; no se documenta soporte de castellano ni de otras lenguas.
- El paquete no incluye procesamiento de PDF ni de layout: es necesario renderizar cada pagina a imagen antes de la inferencia.
- Los directorios de modelo y los procesadores de las dos variantes (OCR 1.0 y Jev) no son intercambiables; deben mantenerse juntos los archivos de configuracion, tokenizer y processor de cada checkpoint.
- Los pesos no estan incluidos en la imagen Docker ni en el runtime: deben obtenerse del propietario del release y colocarse en la ruta indicada; no se asume una URL publica verificada en ModelScope.
- Riesgo de alucinacion inherente a modelos generativos: la salida de texto o Markdown puede contener errores que requieran verificacion, especialmente en documentos degradados.
- No se documentan sesgos conocidos en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones de los pesos y del runtime distribuidos por FlagOS.
- Los commits de FlagGems y del plugin son snapshots locales del release, no cambios fusionados ni publicados upstream; la reproducibilidad depende de esos hashes concretos.
- El primer uso provoca compilacion JIT y enlazado, lo que anade latencia inicial.
- La generacion es greedy con thinking desactivado y limite de 16384 tokens nuevos via CLI/API; documentos muy extensos pueden requerir segmentacion.

## Enlaces

- Hugging Face: https://huggingface.co/FlagRelease/MiniCPM-OCR-1.0-BF16-arm-FlagOS
- Repositorio FlagOS (referencia de la comunidad): no disponible en la informacion proporcionada
- Paper de MiniCPM-OCR: no disponible en la informacion proporcionada
- Blog de ModelBest/OpenBMB sobre MiniCPM-OCR: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada

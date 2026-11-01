# FlagRelease/MiniCPM-OCR-1.0-BF16-kunlunxin-FlagOS

## Resumen

MiniCPM-OCR 1.0 es un modelo especializado en analisis de documentos y reconocimiento de texto desarrollado por ModelBest junto con OpenBMB. Con 1.300 millones de parametros, esta disenado para escenarios reales de digitalizacion: escaneos, fotografias, paginas curvadas y pantallas re-fotografiadas, soportando extraccion de texto, formulas y tablas complejas, asi como extraccion de informacion clave.

La version publicada en este repositorio, FlagRelease/MiniCPM-OCR-1.0-BF16-kunlunxin-FlagOS, es una adaptacion del modelo original al stack FlagOS para el acelerador KUNLUNXIN (P800), mantenida por la comunidad FlagOS. El objetivo de esta build es ofrecer despliegue cross-chip con validacion de consistencia frente al stack nativo de NVIDIA, manteniendo los pesos en BF16.

El modelo resulta relevante porque demuestra que un OCR de solo 1.3B parametros puede alcanzar 93,68 en Real5-OmniDocBench y 96,46 en omni_doc_bench_v1_6 (build NVIDIA), con una aceleracion de decodificacion DSpark que mejora la eficiencia extremo a extremo un 55%. Esta build concreta obtiene 78,4 en OcrBench y 95,84 en omni_doc_bench_v1_6, ligeramente por debajo de la build nativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal de tipo minicpm_ocr; el script de despliegue declara `--mamba-ssm-cache-dtype float32`, lo que sugiere componentes de estado recurrente, sin confirmacion oficial) |
| Parametros totales | 1.300.434.160 (1,3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (segun `--max-model-len 32768` del script de servicio) |
| Tipos de cuantizacion | BF16 (pesos publicados); otras cuantizaciones no disponibles |
| Idiomas soportados | chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna en la model card proporcionada. El modelo pertenece a la familia MiniCPM-OCR de ModelBest/OpenBMB, orientada a parsing de documentos y reconocimiento de texto. El hecho de que el script de servicio de vLLM incluya el parametro `--mamba-ssm-cache-dtype float32` apunta a la presencia de capas de estado (SSM) junto con atencion, aunque no se confirma oficialmente una arquitectura hibrida. El modelo procesa imagenes (un maximo de una imagen por prompt segun `--limit-mm-per-prompt '{"image":1}'`) y genera texto estructurado.

No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La model card menciona una innovacion tecnica relevante: la decodificacion DSpark, que segun el autor mejora la eficiencia de procesamiento extremo a extremo un 55% en la build original. Esta build concreta esta adaptada al software stack FlagOS (FlagGems 5.4.0, vLLM-plugin-FL, FlagCX) para ejecutarse sobre aceleradores KUNLUNXIN.

## Capacidades

- Reconocimiento optico de caracteres (OCR) sobre escaneos, fotografias, paginas curvadas y pantallas re-fotografiadas.
- Parsing de documentos a Markdown (la peticion de ejemplo es "Convert this page to markdown").
- Extraccion de formulas matematicas presentes en documentos.
- Parsing de tablas complejas.
- Extraccion de informacion clave (key information extraction) de documentos.
- Procesamiento multimodal imagen + texto en una unica peticion.
- Soporte de servicio via API compatible con OpenAI (`/v1/chat/completions`).
- Idiomas: chino e ingles.
- El modelo hermano MiniCPM-OCR Jev (2B) actua como "inspector de calidad" puntuando la fiabilidad del parsing, pero no forma parte de este repositorio.

## Casos de uso

- Digitalizacion masiva de archivos escaneados: el modelo convierte paginas de documentos en Markdown estructurado, adecuado para pipelines de ingestion documental gracias a su ventana de 32.768 tokens y a su capacidad de manejar escaneos y paginas curvadas.
- Extraccion de datos de facturas y formularios: la funcionalidad de key information extraction permite recuperar campos concretos (importes, fechas, identificadores) de documentos empresariales sin post-procesado manual extenso.
- Procesamiento de documentacion cientifica y tecnica: el soporte de formulas y tablas complejas lo hace util para convertir papers y manuales a formatos estructurados y buscables.
- Digitalizacion de capturas de pantalla o fotos de pantallas: el modelo esta entrenado explicitamente para pantallas re-fotografiadas, util en flujos de movilidad o auditoria.
- Control de calidad documental en produccion: combinado con MiniCPM-OCR Jev como capa de puntuacion de fiabilidad, permite derivar a revision humana solo los documentos con baja confianza.
- Despliegue en infraestructura no-NVIDIA: esta build FlagOS para KUNLUNXIN permite ejecutar el OCR en aceleradores domesticos manteniendo una precision cercana a la build nativa (78,4 frente a 80,5 en OcrBench).
- Integracion en asistentes de escritorio o herramientas tipo AnythingLLM: la model card incluye una guia de integracion con AnythingLLM para usar el modelo como motor de ingestion documental.

## Benchmarks y rendimiento

| Metrica | NVIDIA nativo | KUNLUNXIN FlagOS (esta build) |
|---|---|---|
| OcrBench | 80,5 | 78,4 |
| omni_doc_bench_v1_6 | 96,4585 | 95,84 |

Datos adicionales aportados por el autor (build original, no esta build): 93,68 en Real5-OmniDocBench para MiniCPM-OCR 1.0; mejora del 55% en eficiencia extremo a extremo con decodificacion DSpark; hasta 1,69x el throughput P50 nativo por unidad de computo pico en la plataforma KUNLUNXIN. No se han publicado en la informacion disponible resultados de MMLU, HumanEval ni GSM8K, que por otra parte no son benchmarks propios de un modelo OCR.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 2,6 GB solo para pesos; con cache KV, buffers de vision y overhead de vLLM, el script oficial reserva `--gpu-memory-utilization 0.55` sobre el acelerador KUNLUNXIN P800.
- GPU/aceleradores recomendados: KUNLUNXIN P800 (build oficial de este repositorio, imagen Docker `harbor.baai.ac.cn/flagrelease-public/minicpm-ocr-1.0-kunlunxin-p800-...`); la build nativa esta validada en NVIDIA.
- Cabe en GPU de consumo: por tamano (1,3B en BF16) es plausible en GPUs consumer con 8-16 GB de VRAM, aunque no se confirma en la informacion disponible para esta build especifica.
- Opciones de despliegue: vLLM 0.24.0 con vLLM-plugin-FL, FlagGems 5.4.0, FlagCX, contenedor Docker oficial; tambien se documenta integracion con AnythingLLM via API OpenAI-compatible.
- Entorno validado: Ubuntu 22.04 LTS, Python 3.10, torch 2.9.0+cu129, triton 3.0.0, transformers 5.18.0.dev0, driver XPU 5.0.21.47.
- Latencia y throughput: no disponibles para esta build; el autor reporta que en dispositivos ARM edge el modelo hermano Jev completa una evaluacion de bloque de pagina en 1,20 s de media usando solo CPU M5.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | OcrBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-OCR 1.0 (esta build, KUNLUNXIN FlagOS) | 1,3B | 32.768 | 78,4 | Apache 2.0 | HuggingFace |
| MiniCPM-OCR 1.0 (NVIDIA nativo) | 1,3B | 32.768 | 80,5 | Apache 2.0 | HuggingFace |
| MiniCPM-OCR Jev | 2B | no disponible | no disponible (AUROC 0,936 en JevOCRBench) | no disponible | HuggingFace |
| Qwen3.5-397B-A17B (referencia del autor para calidad de inspeccion) | 397B totales / 17B activos | no disponible | no disponible | no disponible | no disponible |

La comparativa con modelos OCR de terceros (por ejemplo, variantes de PaddleOCR o Donut) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Esta build esta adaptada especificamente al hardware KUNLUNXIN P800 con el stack FlagOS; no es un reemplazo directo de los pesos nativos en entornos NVIDIA sin usar la build correspondiente.
- Precision ligeramente inferior a la build nativa: 78,4 frente a 80,5 en OcrBench y 95,84 frente a 96,46 en omni_doc_bench_v1_6.
- Solo soporta chino e ingles; no se declaran otros idiomas.
- Limite de una imagen por prompt en la configuracion de servicio documentada (`--limit-mm-per-prompt '{"image":1}'`), lo que restringe el procesamiento multi-pagina en una sola peticion.
- Riesgo de alucinacion inherente a los modelos generativos: el texto extraido puede contener errores en documentos de baja calidad, manuscritos o layouts atipicos; el autor recomienda el uso de MiniCPM-OCR Jev como capa de verificacion.
- No se detallan sesgos conocidos ni evaluaciones de robustez fuera de los benchmarks citados.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar los terminos del stack FlagOS y de la imagen Docker asociada antes de desplegar en produccion.
- El modelo esta disenado para OCR/parsing documental; no debe emplearse como LLM generalista.
- Numero de descargas muy bajo (7) y ausencia de likes: ecosistema de validacion practicamente inexistente.

## Enlaces

- HuggingFace: https://huggingface.co/FlagRelease/MiniCPM-OCR-1.0-kunlunxin-FlagOS
- AnythingLLM: https://anythingllm.com/
- Imagen Docker FlagOS: `harbor.baai.ac.cn/flagrelease-public/minicpm-ocr-1.0-kunlunxin-p800-gems5.4.0-pluginfl-0601420-vllm0.24.0-xrt5.0.21.47:20261022`
- Repositorio de pesos via ModelScope: `modelscope download --model FlagRelease/MiniCPM-OCR-1.0-kunlunxin-FlagOS`
- Paper, blog o repositorio oficial de MiniCPM-OCR: no disponibles en la informacion proporcionada.

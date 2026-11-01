# FlagRelease/MiniCPM-OCR-1.0-BF16-mthreads-FlagOS

## Resumen

MiniCPM-OCR 1.0 es un modelo especializado en análisis de documentos y reconocimiento de texto (OCR) desarrollado por ModelBest en colaboración con OpenBMB. Con 1.300 millones de parámetros, está diseñado para escenarios reales de digitalización documental: escaneos, fotografías, páginas curvadas y capturas de pantalla re-fotografiadas, con soporte para texto, fórmulas y tablas complejas, además de extracción de información clave. La versión publicada en este repositorio es una adaptación del modelo original realizada por la comunidad FlagOS para su ejecución sobre el stack de software multi-chip FlagOS, concretamente sobre aceleradores Moore Threads mediante el runtime MUSA.

El modelo se distribuye en formato BF16 (safetensors) y está pensado para su despliegue mediante el servidor SGLang incluido en la imagen de contenedor FlagOS-Mthreads, lo que permite poner en marcha un endpoint de inferencia en pocos minutos sobre hardware nacional. Según la documentación del autor, MiniCPM-OCR 1.0 obtiene 93,68 en Real5-OmniDocBench y, con la aceleración de decodificación DSpark, mejora un 55 % la eficiencia de procesamiento extremo a extremo. Esta build concreta presenta métricas ligeramente distintas a la versión nativa de NVIDIA (79,2 frente a 80,5 en OcrBench), lo que refleja el coste de la portabilidad entre stacks.

La relevancia de esta ficha radica en que documenta una de las primeras adaptaciones day-0 de un modelo OCR ligero sobre 12 plataformas de cómputo distintas, incluyendo Ascend, Hygon, KUNLUNXIN, MetaX y Moore Threads. Para equipos que necesitan desplegar OCR en infraestructura no-NVIDIA, esta variante ofrece una vía validada y reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal para OCR y parsing documental (detalles internos no disponibles) |
| Parametros totales | 1.300.434.160 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 40.960 tokens (configurado en el arranque de SGLang con `--context-length 40960`) |
| Tipos de cuantizacion | BF16 (unico formato publicado en este repositorio); no se documentan GGUF, INT8 ni FP8 |
| Idiomas soportados | Chino (zh) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |
| Tamano del repositorio | 2,6 GB |
| Runtime de referencia | SGLang sobre MUSA (Moore Threads), imagen FlagOS-Mthreads |
| Backend de atencion | FlashAttention 3 (`fa3`) con backend lineal Triton |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de que se trata de un modelo multimodal de 1,3B parámetros orientado a la comprensión de imágenes de documentos. La configuración de despliegue revela el uso de atención con backend FlashAttention 3, un backend de atención lineal basado en Triton (`--linear-attn-backend triton`) y variables de entorno específicas para kernels GDN (`SGLANG_GDN_CHUNK_H_BV`, `OCR_GDN_PREFILL_POLICY`), lo que sugiere la presencia de capas de atención lineal o híbrida en el modelo. El soporte de entrada multimodal se confirma por el flag `--mm-attention-backend fa3`.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card menciona que la versión evaluada incorpora "DSpark decoding acceleration", una técnica de decodificación acelerada que mejora un 55 % la eficiencia extremo a extremo, pero no se detalla su funcionamiento interno. Tampoco se especifica la composición del corpus multilingüe más allá de los idiomas declarados (chino e inglés).

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de documentos: escaneos, fotografías, páginas curvadas y capturas de pantalla re-fotografiadas.
- Parsing de texto estructurado con preservación de layout y orden de lectura.
- Reconocimiento y conversión de fórmulas matemáticas.
- Parsing de tablas complejas, incluyendo estructuras anidadas y celdas combinadas.
- Extracción de información clave (key information extraction) de documentos.
- Procesamiento multimodal imagen-a-texto en un único paso.
- Soporte bilingüe chino-inglés.
- Despliegue como servicio HTTP mediante SGLang con API compatible con OpenAI (servidor `sglang.launch_server`).
- Procesamiento por lotes con hasta 32 peticiones concurrentes (`--max-running-requests 32`) y chunked prefill.
- No se documenta soporte de tool calling, function calling ni modo agente en la información disponible.

## Casos de uso

- Digitalización masiva de archivos administrativos: el modelo procesa escaneos y fotografías de documentos con 40.960 tokens de contexto, suficiente para páginas densas con tablas y fórmulas, y puede desplegarse sobre aceleradores Moore Threads para cumplir requisitos de soberanía tecnológica.
- Facturación y contabilidad automatizada: extracción de información clave (importes, fechas, emisores) de facturas y albarranes fotografiados, integrable en un pipeline que llame al endpoint SGLang con imágenes en base64.
- Procesamiento de documentación científica: reconocimiento de fórmulas matemáticas y tablas en artículos escaneados, con salida en texto estructurado apto para indexación posterior.
- Atención al cliente con verificación documental: extracción de datos de DNI, contratos o justificantes enviados por usuarios en chats, usando el modelo como servicio interno detrás de un orquestador.
- Migración de archivos históricos en entornos con hardware no-NVIDIA: la build FlagOS permite ejecutar el mismo modelo sobre Ascend, Hygon o KUNLUNXIN sin reescribir el pipeline, gracias a la adaptación multi-chip.
- Control de calidad documental en producción: combinado con MiniCPM-OCR Jev (2B) como inspector de calidad, se puede marcar automáticamente qué extracciones requieren revisión humana, reduciendo el coste de validación manual.
- Digitalización en el borde (edge): aunque esta build concreta está orientada a servidor con Moore Threads, la familia FlagOS documenta ejecución en ARM (Mac M5) con latencias de 1,20 s por bloque de página para el modelo Jev, lo que abre la puerta a escenarios de captura móvil.

## Benchmarks y rendimiento

| Benchmark | MiniCPM-OCR-1.0-Nvidia-Origin | MiniCPM-OCR-1.0-Mthreads-FlagOS |
|---|---|---|
| OcrBench | 80,5 | 79,2 |
| omni_doc_bench_v1_6 | 96,4585 | 96,4934 |
| Real5-OmniDocBench | 93,68 (version oficial del modelo base) | no disponible para esta build |

La build FlagOS sobre Moore Threads pierde 1,3 puntos en OcrBench respecto a la versión nativa de NVIDIA, mientras que en omni_doc_bench_v1_6 la diferencia es despreciable (ligeramente superior en FlagOS). No se han publicado resultados de MMLU, HumanEval ni GSM8K, ya que el modelo está especializado en OCR y no en tareas de razonamiento general.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 2,6 GB solo para pesos, más overhead de activaciones y caché KV; con `--mem-fraction-static 0.85` y contexto de 40.960 tokens se recomienda un mínimo de 8-12 GB de memoria de dispositivo.
- GPU recomendadas: aceleradores Moore Threads (runtime MUSA) para esta build concreta; la familia FlagOS cubre además T-Head, NVIDIA, Huawei Ascend, Hygon, KUNLUNXIN, MetaX, Tsingmicro, Iluvatar CoreX, Xiwang, Mac (ARM) y CIX.
- Cabe en GPU de consumo: sí, en términos de VRAM, cualquier GPU con 8 GB o más podría alojar los pesos en BF16; sin embargo, esta build está empaquetada para MUSA y no se garantiza su funcionamiento en CUDA sin recompilación.
- Opciones de despliegue: SGLang (runtime de referencia en esta build), con imagen Docker `harbor.baai.ac.cn/flagrelease-public/minicpm-ocr-mthreads001-...`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no se publican cifras absolutas para esta build; la model card menciona que la build FlagOS de Jev alcanza el 98,7 % del throughput nativo de NVIDIA, y que OCR 1.0 entrega hasta 1,69× el throughput nativo P50 por unidad de cómputo pico en la misma plataforma.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniCPM-OCR 1.0 (esta build) | 1,3B | 40.960 | OCR + parsing documental | Apache 2.0 | HuggingFace (FlagOS) |
| MiniCPM-OCR Jev | 2B | no disponible | Inspector de calidad OCR | Apache 2.0 (segun familia) | HuggingFace (familia MiniCPM-OCR) |
| Qwen3.5-397B-A17B | 397B (17B activos) | no disponible | Modelo generalista de referencia | no disponible | no disponible |

La comparación con Qwen3.5-397B-A17B solo es relevante en la tarea de inspección de calidad (AUROC 0,936 frente a 0,938 en JevOCRBench), no en OCR directo. No se dispone de datos comparativos con otros modelos OCR especializados (como PaddleOCR o Donut) en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta chino e inglés; el rendimiento en otros idiomas no está documentado.
- Es un modelo especializado en OCR: no debe esperarse razonamiento general, generación creativa ni capacidades de agente.
- Riesgo de alucinación en la transcripción de texto poco legible o en tablas con estructura ambigua; se recomienda validación humana o el uso de MiniCPM-OCR Jev como inspector.
- La build FlagOS sobre Moore Threads pierde 1,3 puntos en OcrBench respecto a la versión nativa de NVIDIA; si el rendimiento es crítico y se dispone de hardware NVIDIA, conviene usar la build original.
- El repositorio tiene solo 11 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- La licencia Apache 2.0 permite uso comercial, pero el despliegue requiere la imagen Docker de FlagOS y el runtime MUSA, lo que puede implicar dependencias de proveedor.
- No se documentan sesgos específicos ni evaluaciones de robustez frente a documentos adversarios o manipulados.
- El contexto de 40.960 tokens es amplio para OCR, pero documentos extremadamente largos requerirán segmentación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/FlagRelease/MiniCPM-OCR-1.0-BF16-mthreads-FlagOS
- Familia MiniCPM-OCR (ModelBest/OpenBMB): no disponible enlace directo en la información proporcionada
- Imagen Docker FlagOS-Mthreads: `harbor.baai.ac.cn/flagrelease-public/minicpm-ocr-mthreads001-gems0.0.0-treenone-cx0.13.0-pluginnone-vllmnone-sglang0.0.0-sglangfl0.1.0-cp310-pt29-musa43-x64-3.3.5-server:202610261846`
- Documentación de SGLang: no disponible enlace directo en la información proporcionada
- Paper o blog técnico: no disponible

# hipfire-models/dots.ocr

## Resumen

dots.ocr es un modelo de visión-lenguaje (VLM) especializado en el análisis y parseo de documentos, desarrollado originalmente por rednote / Xiaohongshu (Xingyin Information Technology). Este repositorio concreto, `hipfire-models/dots.ocr`, es una cuantización Q8 del modelo original, empaquetada en el formato propietario HFQ del motor de inferencia hipfire, un runtime escrito en Rust con backend HIP/ROCm directo para GPUs AMD RDNA. El modelo unifica detección de layout y reconocimiento de contenido en una sola arquitectura, preservando el orden de lectura, en lugar de encadenar detectores y OCRs separados.

La base es la familia Qwen2-VL: un LLM de 28 capas, hidden size 1536, 12 cabezas de atención y 2 cabezas KV (GQA), con vocabulario de 151936 tokens y RoPE θ = 1e6. El tower de visión tiene 42 capas, embed_dim 1536, patch de 14 y spatial-merge de 2, óptimo por debajo de unos 11,3 Mpx. A pesar de su base compacta de 1,7B parámetros, el modelo original reporta resultados estado del arte en OmniDocBench para texto, tablas y orden de lectura, y un rendimiento en fórmulas comparable a modelos mucho mayores como Doubao-1.5 y Gemini 2.5-Pro.

Es relevante ahora porque demuestra que un VLM pequeño y prompt-driven puede sustituir pipelines multi-modelo de OCR y layout detection, con soporte de más de 100 idiomas y una licencia MIT permisiva. La contrapartida de esta variante es que solo se ejecuta en hipfire sobre GPUs AMD, no en llama.cpp ni en transformers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `dots_ocr` (`DotsOCRForCausalLM`), familia Qwen2-VL; LLM transformer decoder con GQA + tower de visión ViT |
| Parámetros totales | no disponible (el LLM base se describe como 1,7B; el total incluyendo el tower de visión no se especifica) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | max position 131072; `max_length` de generación 32768 |
| Tipos de cuantización | Q8 en todos los tensores (este repo); el original en bfloat16 |
| Idiomas soportados | en, zh, multilingual (benchmark interno de 100 idiomas) |
| Licencia | MIT (con el acuerdo upstream de dots.ocr, prevaleciendo MIT en caso de conflicto, §1.6) |
| Formato de pesos | HFQ (`HFQM`-magic manifest), 4,42 GB; no es GGUF ni safetensors |

Detalles adicionales del manifiesto HFQ: LLM con intermediate 8960, SwiGLU, `eos_token_id` = `[151643, 151673]`; tower de visión de 3 canales con patch 14 y spatial-merge 2; dtype de origen bfloat16 re-cuantizado a Q8.

## Arquitectura y entrenamiento

El modelo es un VLM de dos componentes: un tower de visión tipo ViT (42 capas, embed_dim 1536, 12 cabezas, patch 14, spatial-merge 2) que procesa la imagen, y un decoder de lenguaje de 28 capas con atención de grupos (12 cabezas de query, 2 de key/value), hidden 1536, FFN de 8960 y activación SwiGLU. La innovación principal no está en la arquitectura, sino en el enfoque: un único VLM realiza tanto detección de layout como reconocimiento de contenido, y la tarea concreta se selecciona únicamente mediante el prompt de entrada (parse completo, solo detección, solo texto o grounding-OCR). Esto elimina la necesidad de encadenar DocLayout-YOLO u otros detectores con motores OCR separados.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. El modelo original se distribuye en bfloat16; esta variante re-cuantiza todos los pesos a Q8 y los des-cuantiza a f32 en tiempo de ejecución dentro de los kernels GEMV del motor hipfire.

## Capacidades

- Parseo completo de documentos: extrae texto, tablas, fórmulas y layout en una sola pasada, manteniendo el orden de lectura.
- Detección de layout: modo de solo detección con F1@IoU .50 = 0.930 reportado por el autor original.
- Reconocimiento de tablas: salida estructurada con TEDS de 88,6 (EN) y 89,0 (ZH) en OmniDocBench.
- Reconocimiento de fórmulas: rendimiento comparable a Doubao-1.5 y Gemini 2.5-Pro según el autor original.
- OCR con grounding: localización de texto en la imagen además de su transcripción.
- Multilingüe: soporte declarado de en, zh y "multilingual", con benchmark interno de 100 idiomas.
- Prompt-driven: la misma instancia cambia de tarea según el prompt, sin cargar modelos distintos.
- Entrada imagen-texto: pipeline `image-text-to-text`.
- No se documenta soporte de tool calling ni de razonamiento agéntico multi-paso en la información disponible.

## Casos de uso

- Digitalización de archivos administrativos: parseo por lotes de PDFs escaneados con tablas y formularios, obteniendo texto estructurado y orden de lectura correcto para su indexación posterior.
- Extracción de tablas financieras: conversión de estados contables e informes anuales a estructuras tipo Markdown o HTML, aprovechando el TEDS de 88,6 en inglés reportado en OmniDocBench.
- Procesamiento de literatura científica: extracción de fórmulas matemáticas y referencias de papers, con un rendimiento en fórmulas próximo a modelos frontera según el autor original.
- Pipeline de RAG documental: ingestión de documentos multilingües con layout complejo (varias columnas, notas al pie) preservando el orden de lectura para que el chunking sea coherente.
- OCR con localización para revisión humana: uso del modo grounding-OCR para resaltar en la imagen original cada fragmento transcrito, útil en flujos de verificación de facturas o contratos.
- Despliegue en hardware AMD de consumo o workstation: al ejecutarse en hipfire sobre ROCm, permite montar un servicio OCR local en GPUs RDNA sin depender de CUDA ni de Python en la ruta crítica.
- Moderación y extracción de contenido en foros o redes: detección de layout y texto en capturas de pantalla multilingües para clasificación posterior.

## Benchmarks y rendimiento

Los datos siguientes corresponden al modelo original dots.ocr en bfloat16, publicados por el autor upstream; no se han publicado mediciones específicas de esta cuantización Q8.

OmniDocBench, extremo a extremo (Edit distance ↓ mejor; TEDS ↑ mejor):

| Método | Overall Edit ↓ (EN / ZH) | Text Edit ↓ (EN / ZH) | Table TEDS ↑ (EN / ZH) | Read Order Edit ↓ (EN / ZH) |
|---|---|---|---|---|
| MinerU 2 | 0.139 / 0.240 | 0.047 / 0.109 | 82.5 / 79.0 | 0.069 / 0.118 |
| MonkeyOCR-pro-3B | 0.138 / 0.206 | 0.067 / 0.107 | 81.5 / 87.5 | 0.100 / 0.185 |
| Mistral OCR | 0.268 / 0.439 | 0.072 / 0.325 | 75.8 / 63.6 | 0.083 / 0.284 |
| Gemini 2.5-Pro | 0.148 / 0.212 | 0.055 / 0.168 | 85.8 / 86.4 | 0.049 / 0.121 |
| doubao-1.5-thinking-vision-pro | 0.140 / 0.162 | 0.043 / 0.085 | 83.3 / 89.3 | 0.058 / 0.094 |
| dots.ocr | 0.125 / 0.160 | 0.032 / 0.066 | 88.6 / 89.0 | 0.040 / 0.067 |

Otros resultados reportados: olmOCR-bench overall 79,1 ± 1,0 (Tables 88,3; Multi-column 82,4; Base 99,5); dots.ocr-bench (100 idiomas) Overall Edit 0,177; detección de layout F1@IoU .50 = 0,930.

## Requisitos de hardware

- VRAM estimada: el fichero Q8 ocupa 4,42 GB; se necesita margen adicional para el tower de visión, el contexto y los buffers de des-cuantización a f32, por lo que conviene reservar al menos 8 GB de VRAM en la práctica.
- GPU compatibles: exclusivamente GPUs AMD con soporte HIP/ROCm 6 o superior (arquitecturas RDNA); no hay backend CUDA.
- GPU de consumo: cabe en GPUs AMD de consumo con 8 GB o más de VRAM; no es ejecutable en GPUs NVIDIA mediante este formato.
- Despliegue: motor hipfire, con `hipfire serve` (API HTTP compatible con OpenAI en el puerto 11435) o `hipfire run` para inferencia puntual sobre una imagen.
- Incompatibilidades: el formato HFQ no carga en llama.cpp, transformers, vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento OmniDocBench (Overall Edit EN/ZH) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dots.ocr (este repo, Q8) | 1,7B (LLM) | 131072 posiciones | 0.125 / 0.160 (upstream bf16) | MIT | HFQ, solo hipfire/AMD |
| MonkeyOCR-pro-3B | 3B | no disponible | 0.138 / 0.206 | no disponible | no disponible |
| Mistral OCR | no disponible | no disponible | 0.268 / 0.439 | no disponible | API comercial |
| Gemini 2.5-Pro | no disponible | no disponible | 0.148 / 0.212 | propietaria | API comercial |

Frente a los pipelines clásicos, MinerU 2 obtiene 0.139 / 0.240 con una arquitectura multi-modelo, mientras que dots.ocr lo supera con un único VLM de base compacta.

## Limitaciones y advertencias

- Esta variante solo funciona con el motor hipfire sobre GPUs AMD con ROCm; no es portable a otros runtimes ni a hardware NVIDIA.
- El formato HFQ es propietario del proyecto hipfire y no está soportado por el ecosistema estándar (llama.cpp, transformers, vLLM).
- Los benchmarks publicados corresponden al modelo original en bfloat16; la cuantización Q8 puede degradar ligeramente la precisión, especialmente en fórmulas y tablas densas.
- El modelo está especializado en documentos: no es un asistente general y su rendimiento fuera de tareas OCR/layout no está documentado.
- Riesgo de alucinación en regiones de imagen de baja calidad, manuscritos o layouts atípicos; conviene validar la salida en flujos críticos.
- El soporte multilingüe se declara sobre un benchmark interno de 100 idiomas del propio autor, sin validación independiente en la información disponible.
- La licencia MIT prevalece sobre el acuerdo upstream según la cláusula §1.6, pero se recomienda revisar el texto íntegro del acuerdo copiado en el repositorio antes de un uso comercial.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.
- No se documentan sesgos específicos ni evaluaciones de seguridad en la información proporcionada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hipfire-models/dots.ocr
- Modelo original: https://huggingface.co/rednote-hilab/dots.ocr
- Repositorio del modelo original: https://github.com/rednote-hilab/dots.ocr
- Prompts del modelo original: https://github.com/rednote-hilab/dots.ocr/blob/master/dots_ocr/utils/prompts.py
- Motor hipfire: https://github.com/Kaden-Schutt/hipfire
- Benchmark OmniDocBench: https://github.com/opendatalab/OmniDocBench

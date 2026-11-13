# mlboydaisuke/Unlimited-OCR-CoreAI

## Resumen

Unlimited-OCR-CoreAI es un port del modelo `baidu/Unlimited-OCR` (3B-A0.5B MoE, licencia MIT) al runtime Core AI de Apple, distribuido como bundles `.aimodel` listos para ejecutarse en dispositivo (GPU o Neural Engine) en iOS 27 y macOS 27. El modelo resuelve OCR de documentos complejos de extremo a extremo: recibe una imagen de documento y devuelve markdown estructurado, con tablas convertidas a HTML, formulas en LaTeX, orden de lectura y cajas de layout `<|det|>`. Está pensado para flujos de ingestion documental donde la privacidad es crítica, ya que todo el procesamiento ocurre localmente.

La arquitectura combina un encoder visual DeepEncoder (cascada SAM-ViT + CLIP-ViT) que comprime la imagen en 100 tokens visuales, y un decoder DeepseekV2 con atención R-SWA en configuración MoE. El port mantiene fidelidad byte a byte con la referencia fp32 según el autor (0 flips en el decoder, coseno 1.000000 en el encoder visual) y consigue una latencia plana de aproximadamente 12,7 ms/token (~79 tok/s en M4 Max) gracias a un grafo de decodificación de formas estáticas.

Su relevancia actual radica en dos factores: por un lado, el modelo original lidera OmniDocBench v1.6 con 93,92; por otro, este port demuestra que un VLM de OCR de 3B puede ejecutarse íntegramente en hardware Apple consumer mediante el nuevo runtime Core AI, sucesor de Core ML.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language: encoder DeepEncoder (SAM-ViT + CLIP-ViT) + decoder DeepseekV2 R-SWA MoE |
| Parametros totales | 3B (modelo base baidu/Unlimited-OCR) |
| Parametros activos | 0.5B (MoE, segun nomenclatura 3B-A0.5B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | decoder sym8; vision encoder fp16; embeddings fp16 |
| Idiomas soportados | ingles, japones, multilingue |
| Licencia | MIT |
| Formato de pesos | bundles `.aimodel` (Core AI), tablas `.f16`/`.i32` auxiliares, tokenizer fast |
| Tamano del repo | 8.7 GB |
| Tamano de descarga en runtime | ~4.532 MB (Mac) |
| Pipeline | image-to-text |

## Arquitectura y entrenamiento

El modelo es un VLM con dos componentes diferenciados. El encoder visual DeepEncoder es una cascada de SAM-ViT y CLIP-ViT que procesa la imagen de entrada (preprocesada a 640x640, normalizada con media=std=0.5) y la comprime en 100 tokens visuales. El decoder es un transformer MoE de la familia DeepseekV2 con atención R-SWA (sliding window attention restringida), con 3B parámetros totales y 0,5B activos por token. El decoder se exporta con dos funciones, `prefill` y `decode`, que comparten un único conjunto de pesos y estado KV.

El port a Core AI es una exportación pura: el decoder se ejecuta directamente sobre `inputs_embeds` en el runtime estándar `coreai.runtime` sin parchear el motor, lo que lo diferencia del camino VLM con buffers de entrada estáticos. La innovación técnica clave es el grafo de decodificación de formas estáticas, con escritura KV data-driven y máscara R-SWA de buffer fijo, que mantiene todas las formas de tensor constantes y evita recompilaciones por crecimiento de caché. No se dispone de información sobre el dataset de entrenamiento del modelo base (número de tokens, composición, uso de RLHF/DPO) en la documentación proporcionada.

## Capacidades

- OCR de documentos de extremo a extremo con salida en markdown estructurado.
- Conversión de tablas a HTML (`<table>`, `<tr>`, `<td>`).
- Conversión de formulas matemáticas a LaTeX.
- Detección de layout y orden de lectura mediante cajas `<|det|>`.
- Soporte multilingüe con foco en inglés y japonés.
- Ejecución totalmente on-device en GPU o Neural Engine de Apple.
- Integración mediante API Swift (`CoreAI.read(documentAt:)`, `KitDocReader`).
- Inferencia por página: una llamada `read(imageAt:)` por página; los PDF deben trocearse previamente en imágenes.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso agéntico.

## Casos de uso

- Digitalización de facturas y recibos: el modelo extrae tablas como HTML y texto estructurado directamente en el dispositivo, lo que permite procesar documentos financieros sensibles sin enviarlos a la nube.
- Procesamiento de contratos y documentos legales: la salida markdown con orden de lectura y cajas de layout facilita la ingestión en pipelines RAG manteniendo la confidencialidad del contenido.
- Extracción de formulas en artículos científicos: la conversión a LaTeX permite reconstruir publicaciones técnicas y alimentar bases de conocimiento matemático.
- Aplicaciones iOS/macOS de escaneo documental: integrable vía CoreAIKit con una sola llamada `read(imageAt:)`, adecuada para apps que requieren OCR sin conectividad.
- Ingestión de documentación japonesa: el soporte nativo de japonés e inglés cubre casos de digitalización de formularios y manuales en entornos empresariales japoneses.
- Procesamiento por lotes headless en macOS: el CLI `readdoc-cli` permite automatizar la conversión de lotes de imágenes de páginas a markdown en pipelines de servidor local.
- Archivado conforme a privacidad: al no salir los datos del dispositivo, encaja en entornos con requisitos regulatorios estrictos (sanidad, banca, sector público).

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| OmniDocBench v1.6 | 93,92 | Modelo base baidu/Unlimited-OCR (SOTA segun el autor) |
| Throughput de decodificacion | ~79 tok/s (12,7 ms/token) | M4 Max GPU, grafo de formas estáticas |
| Fidelidad vs. referencia fp32 | 0 flips en decoder; cos 1.000000 en vision encoder | Pasos muestreados por el autor |
| Qwen3-8B 4-bit (referencia del runtime) | 94 tok/s en M4 Max GPU | Benchmark del runtime Core AI, no de este modelo |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/almacenamiento estimado: ~4.532 MB de descarga en Mac (vision 762 MB fp16 + decoder 3,2 GB sym8 + embeddings 316 MB fp16).
- Hardware objetivo: Apple Silicon con GPU o Neural Engine; el benchmark de referencia usa M4 Max.
- No está pensado para GPU NVIDIA; requiere el runtime Core AI de iOS 27 / macOS 27.
- Cabe en hardware Apple consumer (Mac con Apple Silicon); no se documenta soporte para iPhone/iPad en la información disponible.
- Despliegue: runtime `coreai.runtime`, CoreAIKit 0.7.3 vía SPM, ejemplo ReadDoc (GUI + CLI).
- Requiere Xcode 27 (build 27A266a) y macOS 27 beta.
- Latencia: ~12,7 ms/token en decodificación; medir en Release (Debug es ~3x más lento en trabajo de host por token).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Despliegue |
|---|---|---|---|---|---|
| Unlimited-OCR-CoreAI | 3B (0,5B activos) | no disponible | OCR VLM on-device (Apple) | MIT | Core AI (Apple) |
| baidu/Unlimited-OCR | 3B (0,5B activos) | no disponible | OCR VLM (modelo base) | MIT | PyTorch / ecosistema estándar |
| Qwen3-8B (referencia de runtime) | 8B | no disponible | LLM general | no disponible | Core AI, MLX |

No se dispone de datos de benchmarks comparativos con alternativas de OCR en la información proporcionada.

## Limitaciones y advertencias

- Solo cubre OCR de documentos; no es un modelo de propósito general ni soporta tool calling o razonamiento agéntico.
- Requiere trocear PDFs en imágenes de página antes de la inferencia (una llamada por página).
- Dependencia fuerte del ecosistema Apple: exige iOS 27 / macOS 27, Xcode 27 y el runtime Core AI; no es portable a otros entornos sin reexportación.
- El modelo base solo declara inglés, japonés y multilingüe; el rendimiento en otros idiomas no está verificado.
- Riesgo de alucinación inherente a los VLM: puede generar texto o estructuras plausibles pero incorrectas en documentos de baja calidad o layouts atípicos.
- No se documentan sesgos específicos del modelo base en la información disponible.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones del modelo base `baidu/Unlimited-OCR`.
- El rendimiento medido (~79 tok/s) corresponde a M4 Max; en hardware inferior la latencia será mayor.
- Medir siempre en Release: Debug introduce una penalización de ~3x en el trabajo de host por token.

## Enlaces

- Hugging Face: https://huggingface.co/mlboydaisuke/Unlimited-OCR-CoreAI
- Modelo base: https://huggingface.co/baidu/Unlimited-OCR
- CoreAIKit: https://github.com/john-rocky/coreai-kit
- Ejemplo ReadDoc: https://github.com/john-rocky/coreai-kit/tree/0.7.3/Examples/ReadDoc
- Cookbook: https://github.com/john-rocky/coreai-kit/blob/0.7.3/docs/COOKBOOK.md
- QuickStart: https://github.com/john-rocky/coreai-kit/blob/0.7.3/Examples/ReadDoc/Sources/QuickStart.swift
- Benchmark Apple Silicon LLM: https://github.com/john-rocky/apple-silicon-llm-bench
- DeviceMark: https://devicemark.github.io/

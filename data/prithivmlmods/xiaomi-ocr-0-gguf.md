# prithivMLmods/Xiaomi-OCR-0-GGUF

## Resumen

Xiaomi-OCR-0 es un modelo de lenguaje y visión (VLM) compacto de aproximadamente 752 millones de parámetros, especializado en OCR y comprensión de documentos. Lo desarrolla Xiaomi Research y está construido sobre Qwen3.5-0.8B-Base. Resuelve el problema del parseo unificado de documentos: convertir imágenes de documentos en texto estructurado (Markdown, tablas OTSL, fórmulas LaTeX y JSON) sin necesidad de pipelines separados de detección, reconocimiento y postprocesado.

La versión aquí descrita, `prithivMLmods/Xiaomi-OCR-0-GGUF`, es una cuantización comunitaria en formato GGUF del modelo original, pensada para inferencia con llama.cpp y entornos con recursos limitados. El repositorio incluye desde pesos BF16 (1,52 GB) hasta cuantizaciones Q3 (466 MB), además del proyector multimodal `mmproj-bf16.gguf` necesario para el procesamiento de imágenes.

Su relevancia actual radica en la combinación de tamaño reducido (menos de 1B de parámetros) con capacidades de document understanding de nivel productivo: maneja documentos escaneados, deformados, fotografiados e inclinados, y genera salidas estructuradas listas para consumo por sistemas downstream. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model basado en Qwen3.5-0.8B-Base (transformer multimodal con proyector de visión) |
| Parametros totales | 752.393.024 (~0,75B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, mmproj-bf16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

Xiaomi-OCR-0 es un modelo multimodal de tipo image-text-to-text construido sobre el transformer Qwen3.5-0.8B-Base, al que se añade un proyector visual (mmproj) para integrar representaciones de imagen en el espacio del modelo de lenguaje. Según la model card, el entrenamiento se realizó sobre un corpus centrado en OCR de aproximadamente 170 millones de muestras, mediante un proceso que combina *Q-Mask text anchoring* (anclaje de texto para alinear regiones de imagen con su contenido textual), preentrenamiento continuado y aprendizaje por refuerzo con tareas mixtas.

Esta combinación de preentrenamiento continuado y RL mixto está orientada a tres tareas: parseo de documentos, VQA basado en OCR y extracción de información clave. El modelo está diseñado explícitamente para tolerar variaciones geométricas en la entrada (documentos escaneados, deformados por perspectiva, fotografiados o inclinados), lo que lo diferencia de pipelines OCR clásicos que asumen imágenes relativamente limpias. No se dispone de información sobre el número total de tokens de entrenamiento ni sobre la composición detallada del dataset más allá de la cifra de muestras.

## Capacidades

- Parseo unificado de documentos: conversión de imágenes de documentos a Markdown estructurado.
- Reconocimiento de tablas con salida en formato OTSL.
- Reconocimiento de fórmulas matemáticas con salida en LaTeX.
- Extracción de información clave con salida en JSON.
- Visual question answering sobre documentos (OCR-based VQA).
- Robustez ante documentos escaneados, deformados, fotografiados e inclinados.
- Procesamiento multimodal imagen-texto mediante el proyector `mmproj-bf16.gguf`.
- Inferencia conversacional (tag `conversational`).
- Compatibilidad con text-generation-inference y llama.cpp.
- Soporte multilingüe: solo inglés declarado.

## Casos de uso

- Digitalización de archivos administrativos: el modelo convierte imágenes de facturas, formularios y expedientes escaneados en Markdown o JSON estructurado, lo que permite alimentar bases de datos y sistemas de gestión documental sin desarrollo de reglas ad hoc.
- Extracción de datos de facturas y recibos: mediante salida JSON, se pueden aislar campos como importes, fechas, emisores y números de referencia directamente desde la imagen, integrándolo en flujos de contabilidad automatizada.
- Procesamiento de documentación técnica y científica: la capacidad de reconocer fórmulas en LaTeX y tablas en OTSL lo hace adecuado para convertir papers y manuales fotografiados o escaneados en documentos editables y consultables.
- Automatización de atención al cliente con documentos adjuntos: un usuario envía una foto de un documento y el modelo extrae la información relevante para el sistema de tickets, aprovechando su tolerancia a imágenes inclinadas o de baja calidad.
- Digitalización de patrimonio documental: archivos históricos escaneados con deformaciones o inclinaciones pueden procesarse para obtener transcripciones estructuradas, gracias al entrenamiento específico sobre documentos deformados y fotografiados.
- Pipelines de accesibilidad: conversión de documentos en imagen a texto estructurado y legible por lectores de pantalla o sistemas de síntesis de voz.
- Extracción de información en entornos con recursos limitados: las cuantizaciones Q3 y Q4 (466-529 MB) permiten desplegar el modelo en dispositivos de borde o servidores pequeños para tareas de OCR estructurado en tiempo casi real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB con cuantización Q3_K_M (466 MB de pesos) y hasta ~1,6 GB con BF16 (1,52 GB), más el proyector visual `mmproj-bf16.gguf` (207 MB) y el overhead de contexto.
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de VRAM libre es suficiente; tarjetas como RTX 3060, RTX 4060 o superiores ofrecen margen amplio. En entornos de servidor, A100 o H100 no son necesarias para este tamaño, aunque pueden usarse para alto throughput.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU dedicada moderna e incluso en iGPU con memoria compartida suficiente para las cuantizaciones Q3/Q4.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama (a partir del GGUF), text-generation-inference (según tags del repo) y transformers con los pesos originales del modelo base.
- Latencia y throughput estimados: no disponibles en la información proporcionada; el repositorio de GitHub asociado menciona scripts con resultados medidos de velocidad y memoria, pero no se incluyen cifras en los datos disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xiaomi-OCR-0 (esta ficha) | ~0,75B | no disponible | OCR y document parsing unificado | Apache 2.0 | GGUF y safetensors |
| Modelos OCR clásicos (p. ej. Tesseract, PaddleOCR) | N/A (no neuronales o ligeros) | N/A | Detección y reconocimiento de texto | Varía (Apache 2.0 en varios) | Amplia |
| VLMs generalistas de ~1B (p. ej. Qwen2-VL-2B, SmolVLM) | 2B / ~2B | no disponible | Comprensión visual general | Apache 2.0 en varios | safetensors, GGUF |

La comparación cuantitativa de rendimiento no está disponible en la información proporcionada. La ventaja diferencial de Xiaomi-OCR-0 frente a VLMs generalistas del mismo rango es su especialización en salidas estructuradas (OTSL, LaTeX, JSON) y su robustez ante documentos deformados; frente a OCR clásico, ofrece comprensión semántica y salida estructurada en un solo paso.

## Limitaciones y advertencias

- Idioma: solo se declara soporte de inglés; el rendimiento en castellano u otros idiomas no está garantizado y probablemente sea deficiente.
- Riesgo de alucinación: como todo modelo generativo, puede inventar contenido en documentos con texto poco legible, tablas complejas o fórmulas ambiguas; se recomienda validación en dominios críticos.
- Contexto: la longitud de contexto no está documentada, lo que dificulta planificar documentos de muchas páginas; es probable que requiera troceado de imágenes.
- Sesgos: no se documentan análisis de sesgo; el corpus de entrenamiento centrado en OCR puede infrarepresentar tipografías, alfabetos o layouts poco frecuentes.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original (`xiaomi-research/Xiaomi-OCR-0`) y de Qwen3.5-0.8B-Base.
- Cuantizaciones bajas: Q3_K_M y Q3_K_L pueden degradar la precisión en tablas y fórmulas; para producción se recomienda Q4_K_M o superior.
- Dependencia del proyector visual: es imprescindible cargar `mmproj-bf16.gguf` junto con los pesos para el procesamiento de imágenes; sin él, el modelo no funciona como VLM.
- Repositorio comunitario: esta versión GGUF la mantiene un tercero (prithivMLmods), no Xiaomi Research; para parches o soporte oficial conviene acudir al modelo base.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/prithivMLmods/Xiaomi-OCR-0-GGUF
- Modelo base original: https://huggingface.co/xiaomi-research/Xiaomi-OCR-0
- README del repositorio GGUF: https://huggingface.co/prithivMLmods/Xiaomi-OCR-0-GGUF/blob/main/README.md
- Repositorio GitHub con scripts de conversión y mediciones: https://github.com/xzl01/Xiaomi-OCR-0-GGUF
- llama.cpp: https://github.com/ggml-org/llama.cpp

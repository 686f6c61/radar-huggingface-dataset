# nanash66/typhoon-ocr1.5-2b-ROCMFP4-GGUF

## Resumen

Typhoon-OCR 1.5 2B — ROCmFP4 GGUF es una cuantización experimental del modelo multimodal `typhoon-ai/typhoon-ocr1.5-2b`, publicada por el usuario `nanash66`. No se trata de un modelo nuevo, sino de una versión comprimida del OCR visual de Typhoon AI, orientada a ejecutar reconocimiento óptico de caracteres sobre documentos tailandeses en hardware AMD de gama integrada (iGPU RDNA3/RDNA3.5) mediante llama.cpp. El backbone de texto se cuantiza a `Q4_0_ROCMFP4` con embeddings de tokens en Q6_K, mientras que el proyector visual (`mmproj-f16.gguf`) se mantiene en FP16 sin cuantizar para no degradar la resolución visual del documento.

El interés principal reside en su huella de memoria y su velocidad: el backbone de texto ocupa 1,08 GB (frente a 3,28 GB en FP16) y el conjunto completo funciona con aproximadamente 2,1 GB de VRAM en contexto de 16K con dos slots, alcanzando unos 28,6 tokens/s de decodificación en una Radeon 890M. La calibración con Importance Matrix (iMatrix) sobre una mezcla específica de corpus tailandés (70% general y 30% de documentos oficiales y legales) busca preservar vocales, marcas de tono y vocabulario especializado, que son los puntos habitualmente más frágiles en cuantizaciones agresivas de 4 bits.

El modelo base cuenta con 1.720.574.976 parámetros totales (≈1,72B) y pipeline `image-text-to-text`. La cuantización está pensada para despliegues locales en equipos AMD Ryzen AI 300 (Strix Point), Strix Halo o Ryzen 7000/8000, con soporte de entrada de imagen y PDF vía un endpoint compatible con OpenAI en `llama-server`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal vision-language (encoder visual + proyector + backbone de texto transformer); familia concreta no disponible |
| Parametros totales | 1.720.574.976 (≈1,72B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Configurable; probado a 16.384 tokens (8.192 por slot con `-np 2`) |
| Tipos de cuantizacion | Q4_0_ROCMFP4 (backbone de texto, con embeddings en Q6_K) + mmproj en FP16 sin cuantizar |
| Idiomas soportados | Tailandés (th) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del backbone de texto | 1,08 GB (Q4_0_ROCMFP4) |
| Tamano del proyector visual | 781 MB (mmproj-f16.gguf) |
| Tamano del repositorio | 2,0 GB |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La información disponible describe un modelo multimodal de tipo vision-language en el que un proyector visual en FP16 (`typhoon-ocr1.5-2b.mmproj-f16.gguf`, 781 MB) alimenta a un backbone de texto cuantizado a 4 bits. La cuantización emplea el esquema experimental `Q4_0_ROCMFP4` con escala UE4M3 y embeddings de tokens en Q6_K, una combinación ideada para hardware AMD con soporte ROCmFP4. El proceso de calibración se realizó con Importance Matrix (iMatrix) sobre una "Thai Calibration Mix" compuesta por un 70% de corpus tailandés general y un 30% de documentos oficiales y legales complejos, con el objetivo de preservar vocales, marcas de tono (วรรณยุกต์) y terminología especializada.

No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición exacta del dataset del modelo base, ni si hubo etapas de RLHF o DPO; tampoco se especifica la arquitectura interna del backbone del modelo original más allá de su naturaleza multimodal. La innovación destacable de esta publicación es la propia cuantización ROCmFP4 calibrada por iMatrix, junto con una verificación empírica frente a la línea base Q8_0: se reporta un 99,61% de coincidencia de caracteres, con marcas de tono idénticas al 100% y una diferencia del 0,39% atribuida únicamente a variaciones menores de formato en negrita Markdown. El proyector visual permanece sin cuantizar, de modo que la resolución efectiva de entrada no se ve afectada por la compresión.

## Capacidades

- OCR de documentos: extracción de texto a Markdown limpio, incluyendo tablas renderizadas en HTML (`<table>...</table>`), ecuaciones en LaTeX (en línea `$...$` y en bloque `$$...$$`) y numeración de página envuelta en `<page_number>`.
- OCR de alta fidelidad en tailandés: preservación de vocales, marcas de tono y vocabulario especializado, calibrado específicamente sobre documentos oficiales y legales tailandeses.
- Descripción de figuras: delimitación de áreas visuales (gráficos, diagramas, imágenes) en bloques `<figure>` con descripción de elementos, contexto y análisis.
- Detección de casillas: representación de checkboxes con `☐` (sin marcar) y `☑` (marcado).
- Entrada multimodal: procesamiento de imágenes y páginas de PDF (pipeline `image-text-to-text`), con aproximadamente 2.000–2.500 tokens visuales por imagen de documento en alta resolución.
- Servicio compatible con OpenAI: expuesto mediante `llama-server`, lo que permite integración como endpoint de visión.
- Idiomas: tailandés e inglés.

No se menciona soporte de tool calling, function calling, comportamiento agéntico, modo de razonamiento explícito (thinking), audio o generación de código como capacidades propias de este modelo especializado.

## Casos de uso

- Digitalización de documentos oficiales tailandeses: el modelo extrae texto, tablas y numeración de página de expedientes administrativos y legales, preservando marcas de tono y vocabulario jurídico, gracias a la calibración iMatrix específica sobre este dominio.
- Automatización de archivo legal: conversión de PDFs de contratos y expedientes a Markdown estructurado con tablas en HTML y ecuaciones en LaTeX, listo para indexación posterior.
- Procesamiento de facturas y formularios densos: la detección de casillas (`☐`/`☑`) permite capturar estados de formularios oficiales sin post-procesado adicional.
- Despliegue en portátiles y mini-PC con gráficos integrados AMD: con unos 2,1 GB de VRAM a 16K de contexto, se puede ejecutar OCR local en Radeon 890M/880M/780M sin GPU dedicada.
- Extracción de contenido de informes técnicos con gráficos: los bloques `<figure>` permiten describir diagramas y gráficos financieros o técnicos junto al texto de la página.
- Servicio de OCR multi-cliente: con `-np 2` y 8.192 tokens por slot, un único `llama-server` puede atender dos flujos de documentos concurrentes con endpoint compatible con OpenAI.
- Enriquecimiento de corpus tailandés para NLP: generación de texto estructurado y descripciones visuales a partir de documentos escaneados para construir datasets de entrenamiento o evaluación.

## Benchmarks y rendimiento

Los datos disponibles comparan la cuantización con las líneas base FP16 y Q8_0 sobre documentos técnicos tailandeses densos de varias páginas. No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

| Métrica | FP16 completo | Línea base Q8_0 | Q4_0_ROCMFP4 (este modelo) |
|---|---|---|---|
| Tamano del backbone LLM | 3,28 GB | 1,83 GB | 1,08 GB (-41% vs Q8_0) |
| Proyector visual (mmproj) | 782 MB | 782 MB | 782 MB (FP16 sin cuantizar) |
| VRAM total (contexto 16K, 2 slots) | ~5,2 GB | ~3,2 GB | ~2,1 GB (-34%) |
| Velocidad de decodificación (Radeon 890M) | ~18 tok/s | ~21–25 tok/s | ~28,6 tok/s (+20–30%) |
| Tiempo medio por página PDF completa | ~65 s | ~45 s | ~29,1 s |
| Fidelidad OCR tailandés vs Q8_0 | 100% | 100% | 99,61% de coincidencia |

La diferencia del 0,39% en fidelidad se atribuye a variaciones menores de formato en negrita Markdown; los caracteres tailandeses y las marcas de tono son idénticos al 100%.

## Requisitos de hardware

- VRAM estimada: ~2,1 GB para el conjunto completo (backbone 1,08 GB + mmproj 781 MB) con contexto de 16.384 tokens y 2 slots.
- GPU objetivo: iGPU AMD RDNA3/RDNA3.5 — Radeon 890M, 880M (Ryzen AI 300, Strix Point), 780M (Ryzen 7000/8000), Strix Halo y Phoenix; también GPU Radeon discretas.
- Cabe en hardware de consumo: sí, en iGPU AMD integradas; no se reportan datos para NVIDIA u otras marcas, aunque al ser GGUF podría ejecutarse en otros backends de llama.cpp.
- Opciones de despliegue: llama.cpp con soporte ROCmFP4 (fork específico) o builds estándar con Vulkan/HIP; `llama-server` con endpoint compatible con OpenAI; se requieren ambos ficheros (backbone GGUF y `mmproj-f16.gguf`).
- Configuración recomendada: `-ngl 99 -c 16384 -np 2 -fa on`, con contexto mínimo de 8.192 tokens por slot, ya que cada imagen de documento de alta resolución genera ~2.000–2.500 tokens visuales.
- Rendimiento medido (Radeon 890M): ~28,6 tok/s de decodificación y ~29,1 s por página PDF completa; ~29,1 s frente a ~45 s de Q8_0 y ~65 s de FP16.
- Preprocesado de imagen obligatorio: redimensionar la entrada para que la dimensión mayor no supere 1800 px, el tamaño objetivo de entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nanash66/typhoon-ocr1.5-2b-ROCMFP4-GGUF` (este) | ~1,72B | Configurable, probado a 16K | 1,08 GB (texto) + 781 MB (mmproj) | Apache 2.0 | GGUF en HuggingFace |
| `typhoon-ai/typhoon-ocr1.5-2b` (modelo base) | ~1,72B | No disponible | 3,28 GB (FP16, según la tabla) | Apache 2.0 | Pesos originales |
| Cuantización Q8_0 del mismo modelo | ~1,72B | Configurable | 1,83 GB (texto) | Apache 2.0 | Según la comparativa del autor |

No se dispone de datos en la información proporcionada sobre otros modelos OCR comparables (por ejemplo, alternativas tailandesas o multimodales de tamaño similar), por lo que la comparativa con terceros queda como no disponible.

## Limitaciones y advertencias

- Modelo especializado en OCR: no está diseñado como asistente conversacional general ni para razonamiento abierto; su uso óptimo requiere el prompt oficial y reglas de formato específicas.
- Dependencia del prompt: para formato Markdown de alta fidelidad, tablas HTML limpias y descripción de figuras hay que usar la estructura de prompt oficial; otros prompts pueden degradar la salida.
- Riesgo de alucinación por escalado de imagen: si la imagen supera los 1800 px en su dimensión mayor, puede aumentar la alucinación y reducirse la precisión del OCR; es obligatorio redimensionar.
- Cobertura de idiomas limitada: solo tailandés e inglés.
- Cuantización experimental: `Q4_0_ROCMFP4` es un esquema experimental (escala UE4M3) que requiere un fork de llama.cpp con soporte ROCmFP4 o builds con Vulkan/HIP; no es un formato estándar universalmente soportado.
- Diferencia de fidelidad: se reporta un 99,61% de coincidencia frente a Q8_0, con un 0,39% de diferencia atribuida a formato Markdown; conviene validar sobre el dominio propio antes de producción.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación independiente.
- Verificar las condiciones de la licencia Apache 2.0 del modelo base antes de uso comercial, ya que esta publicación es una cuantización derivada.
- La arquitectura y los datos de entrenamiento del modelo base no se detallan en la información disponible.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/nanash66/typhoon-ocr1.5-2b-ROCMFP4-GGUF
- Modelo base: https://huggingface.co/typhoon-ai/typhoon-ocr1.5-2b
- llama.cpp con soporte ROCmFP4: https://github.com/charlie12345/rocmfp4-llama
- No se han encontrado otros enlaces relevantes (papers, blogs o demos) en los resultados de búsqueda web disponibles.

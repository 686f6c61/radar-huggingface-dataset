# pandanlabs/dots-mocr-arabic-classical

## Resumen

Pandan Arabic OCR v0.1 (research preview) es un modelo visión-lenguaje especializado en la transcripción fiel de libros árabes clásicos, publicado por Pandan Labs bajo el identificador `pandanlabs/dots-mocr-arabic-classical`. Se trata de un fine-tune del modelo `dots-studio/dots.mocr` (ejecución de entrenamiento LoRA `lora-001`) con 3.039.179.264 parámetros, pesos en safetensors, licencia MIT y pipeline `image-text-to-text`.

El problema que aborda es específico: el OCR convencional sobre árabe vocalizado tiende a omitir las harakat que sí están impresas o a inventar marcas vocálicas que la página no contiene, lo que arruina la fidelidad filológica del texto digitalizado. Este modelo se entrena explícitamente para conservar las marcas visibles y no añadir las ausentes, con métricas publicadas de marcas añadidas y omitidas por cada 1.000 letras.

Es relevante ahora porque ataca un nicho poco cubierto (patrimonio impreso árabe clásico vocabulizado) con una evaluación inusualmente detallada para un modelo de 0 descargas, aunque su alcance es limitado: rinde bien en tipografía limpia y totalmente vocalizada (96% de las páginas con exactitud del 95% o superior) y falla en escaneos antiguos de baja resolución. La model card no detalla la arquitectura interna ni la longitud de contexto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language de tipo image-text-to-text, fine-tune de `dots-studio/dots.mocr`; el backbone concreto no se detalla en la model card (requiere `trust_remote_code` / `custom_code`) |
| Parámetros totales | 3.039.179.264 (≈3,04 B) |
| Parámetros activos | No aplica: no se declara como modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible: el repositorio solo publica pesos safetensors, sin variantes GGUF, AWQ ni GPTQ documentadas |
| Idiomas soportados | Árabe (`ar`), con foco en árabe clásico vocálico (tashkeel) |
| Licencia | MIT |
| Formato de pesos | safetensors + código propio (`custom_code`) |
| Modelo base | `dots-studio/dots.mocr` |
| Tamaño del repositorio | 6,1 GB |
| Pipeline declarado | `image-text-to-text` |
| Etiquetas adicionales | `dots_ocr`, `ocr`, `arabic`, `classical-arabic`, `diacritics`, `tashkeel`, `document-understanding`, `conversational` |

## Arquitectura y entrenamiento

La información disponible describe un modelo visión-lenguaje que recibe una imagen de página y devuelve texto transcrito, construido como fine-tune del modelo `dots-studio/dots.mocr` mediante LoRA (ejecución `lora-001`). No se publican detalles del backbone (número de capas, dimensión oculta, encoder visual, mecanismo de atención) ni la longitud de contexto; la carga exige código propio del repositorio.

El entrenamiento se orienta a fidelidad de las marcas vocálicas. La separación entre entrenamiento y test es por libro: ningún libro de test o validación interviene en el entrenamiento. La evaluación principal usa 160 páginas de cuatro obras (*Kashf ash-Shubuhat*, *Sharh Ma'na at-Taghut* como test; *Thalathat al-Usul*, *Nawaqid al-Islam* como validación) con referencias verificadas por una persona, y se complementa con 267 páginas en total para la tasa de error de letras. El análisis estadístico se hace con bootstrap emparejado por página e intervalos de confianza del 95%. No se documenta RLHF ni DPO, y en el pipeline de servicio se incluye una capa opcional de versos coránicos (sustituye citas reconocidas por el texto canónico) y un reintento en bucle («loop retry») que mejora la tasa de error de letras.

## Capacidades

- Transcripción OCR de páginas de libros árabes impresos, con salida de texto plano en orden de lectura.
- Preservación de harakat: retiene las marcas vocálicas impresas (tasa de error vocálico 0,006 en tipografía limpia) y reduce drásticamente las marcas inventadas.
- Fidelidad medida en ambos sentidos: publica métricas de marcas añadidas (14,5 → 2,0 por 1.000 letras) y omitidas (4,0 → 1,7 por 1.000 letras) en impresión tipográfica.
- Reconocimiento y normalización de citas coránicas mediante capa opcional de versos (coincidencia de versos 0,92 → 0,97 en el conjunto evaluado).
- Comprensión de documentos con estructura de página (párrafos, corchetes, dígitos, puntuación y espaciado forman parte de la métrica de exactitud).
- Interfaz conversacional declarada en las etiquetas del modelo (`conversational`), además de la tarea OCR.
- No se documenta soporte de tool calling, function calling, agentes, audio ni modo de razonamiento explícito.
- Multilingüismo: no disponible; el modelo declara únicamente árabe.

## Casos de uso

- Digitalización de mutun y textos clásicos en tipografía limpia y totalmente vocalizada: es el escenario donde el modelo está validado (96% de páginas con exactitud ≥95%, dos tercios ≥99%), ideal para convertir ediciones impresas modernas en texto buscable sin perder las harakat.
- Preservación patrimonial con fidelidad vocálica: bibliotecas y proyectos de humanidades digitales pueden priorizar este modelo frente a OCR genérico cuando la integridad de las marcas vocálicas es un requisito académico, ya que cuantifica explícitamente las marcas añadidas y omitidas.
- Investigación filológica y lingüística: la métrica por página y por tipo de impresión permite segmentar corpus (tipografía, escaneo 300 dpi, escaneo antiguo) y decidir qué páginas requieren revisión humana antes de incorporarlas a un corpus anotado.
- Verificación y normalización de citas coránicas: la capa opcional de versos sustituye las citas reconocidas por el texto canónico, útil en obras de estudio que intercalan āyāt dentro del comentario en prosa.
- Control de calidad editorial en pipelines de reedición: comparar la salida del modelo con el original impreso para detectar marcas vocálicas añadidas o perdidas antes de publicar una edición digital.
- Preprocesado para pipelines posteriores de traducción, búsqueda semántica o indexación: el texto transcrito puede alimentar motores de búsqueda sobre corpus árabes clásicos, con la advertencia de que en escaneos de baja resolución la calidad vocálica cae.
- Procesamiento por lotes con reintento: el «loop retry» documentado en la model card reduce la tasa de error de letras de 0,061 a 0,040 sobre 267 páginas, por lo que encaja en servicios de digitalización masiva tolerantes a latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos publicados son evaluaciones OCR propias del autor, comparando el fine-tune con el modelo base `dots.mocr` (revisión `e539fbb`) sobre las mismas páginas y ajustes.

| Métrica (con reintento en bucle y capa de versos) | Base `dots.mocr` | v0.1 | Intervalo de confianza 95% |
|---|---|---|---|
| Tasa de error vocálico, tipografía limpia (116 páginas) | 0,030 | 0,006 | −0,028 a −0,020 |
| Marcas añadidas por 1.000 letras, tipografía completa | 14,5 | 2,0 | No disponible |
| Marcas omitidas por 1.000 letras, tipografía completa | 4,0 | 1,7 | No disponible |
| Coincidencia de versos coránicos | 0,92 | 0,97 | No disponible |
| Tasa de error de letras, 267 páginas evaluadas | 0,061 | 0,040 | No disponible |
| Tasa de error de letras, escaneos antiguos de baja resolución | 0,114 | 0,070 | No disponible |
| Tasa de error vocálico, escaneo antiguo baja resolución (*Sharh Ma'na at-Taghut*) | 0,386 | 0,476 | +0,045 a +0,138 |

Distribución de exactitud por página:

| Tipo de impresión | Referencias | Páginas | ≥99% | 95–99% | 80–95% | <80% | Sin lectura |
|---|---|---|---|---|---|---|---|
| Tipografía | verificadas | 116 | 78 (67%) | 33 (28%) | 5 (4%) | 0 | 0 |
| Escaneo ≈300 dpi | provisionales | 59 | 3 (5%) | 36 (61%) | 12 (20%) | 7 (12%) | 1 |
| Escaneo antiguo baja resolución | verificadas | 44 | 1 (2%) | 6 (14%) | 31 (70%) | 5 (11%) | 1 |
| Escaneo antiguo baja resolución | provisionales | 48 | 2 (4%) | 16 (33%) | 24 (50%) | 4 (8%) | 2 |

Nota metodológica del autor: la exactitud se calcula como 1 − tasa de error de caracteres sobre la página completa (letras, harakat, puntuación, corchetes, dígitos y espaciado); las referencias marcadas como provisionales son transcripciones automáticas sin verificar.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir de 3,04 B de parámetros, no publicada por el autor): ≈6,1 GB solo de pesos en bf16/fp16; con encoder visual, activaciones y caché, entre 10 y 14 GB para una página a resolución típica.
- Cuantización a 8 bits: ≈3–4 GB de pesos, en torno a 8–10 GB de VRAM total estimada.
- Cuantización a 4 bits: ≈1,7–2 GB de pesos, en torno a 5–7 GB de VRAM total estimada; requiere herramientas genéricas, ya que no hay GGUF oficial.
- GPU consumer: cabe en RTX 4090 (24 GB) con margen amplio, y previsiblemente en RTX 3090/4080 (16–24 GB) y RTX 3060 12 GB en bf16 con batches pequeños; por debajo de 8 GB conviene cuantizar.
- GPU de datacenter: A100 40/80 GB y H100 para procesamiento por lotes de páginas con reintento en bucle.
- Despliegue: `transformers` con `trust_remote_code=True` es la vía documentada implícitamente por la etiqueta `custom_code`. No se confirma soporte en vLLM, TGI, llama.cpp ni Ollama; no hay pesos GGUF publicados.
- Latencia y throughput: no disponibles. El «loop retry» descrito en la model card implica al menos una pasada adicional por página en los casos que lo activen, con el consiguiente coste de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| `pandanlabs/dots-mocr-arabic-classical` (v0.1) | 3,04 B | No disponible | Árabe clásico | MIT | Fine-tune LoRA centrado en harakat; mejor en tipografía limpia |
| `dots-studio/dots.mocr` (base) | 3,04 B (mismo backbone) | No disponible | No disponible en esta ficha | No disponible | Base del fine-tune; peor fidelidad vocálica (0,030 → 0,006 de error vocálico) y más marcas añadidas (14,5 vs 2,0 por 1.000 letras) |
| OCR clásico (Tesseract, PaddleOCR) | No disponible | No disponible | Incluye árabe | Licencias dispares (Apache 2.0 en PaddleOCR; no verificado aquí) | No son modelos visión-lenguaje y no publican métricas de marcas vocálicas añadidas/omitidas; sin datos comparables en esta ficha |

No se dispone de datos en la información proporcionada para comparar con otros VLM especializados en OCR árabe (por ejemplo variantes Qwen-VL afinadas); tales cifras se marcan como no disponibles en lugar de estimarse.

## Limitaciones y advertencias

- Es una research preview (v0.1): los pesos se publican para experimentación y feedback, no como servicio validado en producción.
- Escaneos antiguos de baja resolución: el modelo no está recomendado para marcas vocálicas en este tipo de material; la tasa de error vocálico empeora respecto al base (0,386 → 0,476, con el límite del criterio de aceptación en +0,05).
- En escaneos de 300 dpi sin vocalización, el modelo añade más marcas que el base (3,8 → 8,1 por 1.000 letras) aunque su error vocálico global sea menor: riesgo de sobrevocalización en texto no vocalizado.
- Riesgo de alucinación acotado pero real: la propia métrica de marcas añadidas (2,0 por 1.000 letras en tipografía limpia) cuantifica inserción de contenido no impreso, incluidas citas coránicas normalizadas por la capa de versos, que puede sobrescribir una lectura correcta.
- Páginas que no se leen: 1 página fallida en escaneos de 300 dpi y 3 en escaneos antiguos de baja resolución dentro del conjunto evaluado; un pipeline en producción necesita detección de fallos.
- Idiomas: solo árabe; no hay soporte multilingüe declarado ni evaluación en árabe moderno estándar periodístico.
- Sesgo de dominio: el conjunto evaluado son cuatro obras de contenido religioso hanbalí, con separación por libro; el rendimiento en otras tradiciones, maquetaciones o tipos de letra no está medido.
- Parte de las referencias de evaluación son transcripciones automáticas sin verificar (59 páginas de escaneo 300 dpi y 48 de escaneo antiguo), por lo que esas cifras son preliminares.
- La exactitud global penaliza puntuación, corchetes, dígitos y espaciado: una página puede tener 100% en letras y harakat y aun así quedar por debajo del 100% global.
- Licencia MIT: permite uso comercial y modificación, pero no incluye garantías ni auditoría de exactitud; conviene conservar el aviso de copyright.
- El modelo requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio: auditar `remote_code` antes de desplegar.
- Con 0 descargas y 0 likes, no existe validación independiente de la comunidad: todas las métricas provienen del propio autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/pandanlabs/dots-mocr-arabic-classical
- Modelo base `dots.mocr`: https://huggingface.co/dots-studio/dots.mocr
- Perfil del autor (Pandan Labs): https://huggingface.co/pandanlabs
- Paper, blog técnico, repositorio de código o demo: no disponible en la información proporcionada.

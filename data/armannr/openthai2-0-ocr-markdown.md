# ArmanNr/OpenThai2.0-OCR-Markdown

## Resumen

OpenThai2.0-OCR-Markdown es un modelo de visión-lenguaje especializado en el parseo de documentos tailandeses a Markdown, desarrollado por iApp Technology como un fine-tune completo de NVIDIA Nemotron 3.5 Parse (0.63B). Convierte una imagen de página en Markdown con tablas codificadas como HTML (con rowspan y colspan), preservando las cajas de layout, las clases de bloque y el orden de lectura del modelo base. Su relevancia radica en que cubre un nicho poco atendido —el OCR estructurado en tailandés— con un modelo pequeño, rápido (1,6 s por página en una H100) y desplegable en unos 8 GB de VRAM.

Arquitectura multimodal de 630,8M de parámetros: un encoder visual C-RADIOv4-SO400M de 439,0M y un decoder de texto mBART de 10 capas y 191,8M (anchura 1.024), con un vocabulario de 72.512 tokens. Admite imágenes de hasta 1.664 × 2.048 píxeles y está entrenado sobre 54.596 filas en una sola época (1.707 pasos de 32) en una H100, partiendo de los pesos de NVIDIA.

El modelo se distribuye con licencia OpenMDW-1.1, heredada del base, e incluye el stack completo de serving y postprocesado de NVIDIA, por lo que funciona en cualquier entorno donde funcione Nemotron 3.5 Parse. Está pensado para pipelines de digitalización de documentos administrativos, jurídicos y académicos en tailandés, con soporte secundario de inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje: encoder C-RADIOv4-SO400M + decoder mBART de 10 capas (anchura 1.024) |
| Parametros totales | 630.800.504 (439,0M vision + 191,8M texto) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en float32, servido en bfloat16) |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (`model.safetensors`, float32, 2,52 GB) |
| Resolucion de entrada | 1.664 × 2.048 píxeles (ancho × alto) |
| Vocabulario | 72.512 tokens |
| Modelo base | nvidia/Nemotron-3.5-Parse |
| Version | v1.0.0, noviembre 2026 |

## Arquitectura y entrenamiento

El modelo sigue un esquema encoder-decoder multimodal: un encoder visual C-RADIOv4-SO400M (439,0M de parámetros) procesa la imagen de página redimensionada a 1.664 × 2.048 píxeles, y un decoder de texto mBART de 10 capas y anchura 1.024 (191,8M) genera la secuencia de Markdown. La salida incluye, además del contenido, una caja delimitadora y una clase para cada bloque, en orden de lectura, lo que permite reconstruir la estructura del documento original.

El entrenamiento consistió en un fine-tune completo (no LoRA) de una época sobre 54.596 filas, equivalente a 1.707 pasos con batch de 32, ejecutado en una única H100. No se detalla en la información disponible la composición exacta del dataset ni si hubo etapas de RLHF o DPO. Los datos de entrenamiento incluyen páginas de la Royal Gazette tailandesa de meses anteriores, y las etiquetas de referencia se generaron con la misma herramienta que produce el texto de evaluación de las páginas nuevas, un detalle relevante para interpretar los resultados de ese conjunto.

## Capacidades

- Conversión de imágenes de página a Markdown estructurado, con tablas representadas como HTML e información de rowspan y colspan.
- Detección de layout: devuelve cajas delimitadoras y clases de bloque para cada elemento, en orden de lectura.
- OCR de texto impreso en tailandés e inglés, incluyendo documentos administrativos, jurídicos y académicos.
- Procesamiento de una página por inferencia, con soporte de peticiones concurrentes en el servidor (32 secuencias simultáneas en la configuración del API alojado).
- Integración con el stack de serving y postprocesado de NVIDIA Nemotron 3.5 Parse, incluyendo la herramienta `Docum…` citada en la model card.
- Capacidad conversacional declarada por el pipeline (`image-text-to-text`), aunque la información disponible no detalla el comportamiento en diálogo multi-turno.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Soporte de audio o vídeo: no disponible.

## Casos de uso

- Digitalización de boletines oficiales: el modelo convierte páginas de la Royal Gazette tailandesa a Markdown con tablas HTML, lo que permite indexar y buscar normativa publicada sin transcripción manual. Su precisión de 98,7 en las 339 páginas nuevas de noviembre de 2026 lo hace adecuado para este flujo.
- Extracción de tablas de documentos presupuestarios: al preservar rowspan y colspan, las tablas financieras se reconstruyen fielmente y pueden cargarse en hojas de cálculo o bases de datos relacionales sin postprocesado manual de la estructura.
- Procesamiento masivo de expedientes judiciales: con 19.176 páginas por hora en 16 páginas en vuelo sobre una H100 compartida, es viable digitalizar fondos documentales completos de tribunales en plazos razonables.
- Pipeline de ingesta para RAG: el Markdown con orden de lectura explícito y bloques clasificados facilita el chunking semántico antes de indexar en un sistema de recuperación aumentada, especialmente en corpus tailandeses.
- Archivado de libros antiguos y documentos históricos: el modelo rinde bien en las 12 colecciones de texto impreso evaluadas (90,3 de precisión media de caracteres), incluyendo libros antiguos y recortes de documentos.
- Despliegue en hardware modesto: al ocupar unos 8 GB de VRAM en una H100 con `--gpu-memory-utilization 0.09`, puede servirse junto a otros servicios en la misma GPU o en tarjetas de gama media, lo que abarata la operación de OCR a escala.
- Digitalización de documentos mixtos tailandés-inglés: el soporte bilingüe permite procesar formularios y expedientes con ambos idiomas en la misma página, aunque el rendimiento en recortes mixtos es ligeramente inferior al de referencia.

## Benchmarks y rendimiento

| Modelo | Tamano | th-docs-tables v1 (65 pág.) | ThaiOCRBench tables (193 img.) | Texto tailandés impreso (12 sets) | Royal Gazette nuevas (339 pág.) | Media | Segundos por página |
|---|---|---|---|---|---|---|---|
| **OpenThai2.0-OCR-Markdown** | 0,63B | **95,2** | **68,9** | **90,3** | **98,7** | **88,3** | **1,6** |
| Nemotron 3.5 Parse (base) | 0,63B | 91,3 | 68,3 | 89,0 | 91,5 | 85,0 | 1,8 |
| Typhoon OCR V2 2B | 2B | 91,6 | 67,6 | 89,6 | 94,6 | 85,8 | 15,8 |
| Typhoon OCR V2 0,8B | 0,8B | 89,0 | 64,7 | 85,8 | — | — | 18,7 |

Notas sobre la evaluación, según la model card: la media es el promedio de las cuatro columnas de precisión; Typhoon OCR V2 0,8B no se evaluó en las páginas nuevas de la Gazette. En th-docs-tables v1, la ventaja frente a Typhoon OCR V2 2B es de +3,6 con intervalo del 95% de [+1,2, +6,2]. En las tablas de ThaiOCRBench, la diferencia de +1,3 [−1,7, +4,6] no es significativa. En texto tailandés impreso, la ventaja de +0,76 [−0,04, +1,51] tampoco es significativa, y el modelo queda por detrás en fotos de documentos OCR104 (3,4 puntos), recortes mixtos tailandés-inglés (0,7) y un conjunto verificado de la Royal Gazette (0,7). En las 339 páginas nuevas de la Gazette, la ventaja es de +4,1 [+3,7, +4,4] y de +3,5 [+3,2, +3,9] al eliminar todos los espacios. Los tiempos por página son la mediana de 12 páginas enviadas de una en una a vLLM en una H100; Typhoon se ejecutó con `--enforce-eager` por requisitos de su modelo en esa versión de vLLM.

## Requisitos de hardware

- VRAM estimada: unos 8 GB en una H100 con `--gpu-memory-utilization 0.09` y 32 secuencias concurrentes, según la configuración del API alojado por iApp Technology.
- GPU recomendadas: NVIDIA H100 para producción de alto rendimiento; el modelo base y el fine-tune se sirven con vLLM sobre GPU NVIDIA.
- GPU de consumo: no se confirma en la información disponible qué tarjetas consumer son suficientes; el peso en float32 ocupa 2,52 GB, lo que sugiere que una GPU con 8-12 GB podría albergarlo, pero no hay validación publicada.
- Despliegue: vLLM (recomendado y usado en la evaluación), backend Transformers en Mac con Apple silicon según la guía del autor. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia: 1,6 s por página en una H100, una página a la vez (mediana de 12 páginas con tablas).
- Throughput: 19.176 páginas por hora con 16 páginas en vuelo en una H100 compartida con otro servicio.
- Almacenamiento: repositorio de 2,7 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media de precisión | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenThai2.0-OCR-Markdown | 0,63B | no disponible | 88,3 | OpenMDW-1.1 | Hugging Face |
| Nemotron 3.5 Parse (base) | 0,63B | no disponible | 85,0 | OpenMDW-1.1 | Hugging Face (NVIDIA) |
| Typhoon OCR V2 2B | 2B | no disponible | 85,8 | no disponible | no disponible |
| Typhoon OCR V2 0,8B | 0,8B | no disponible | no disponible (sin datos en Gazette) | no disponible | no disponible |

Frente al base, la mejora media es de 3,3 puntos con el mismo tamaño y una latencia ligeramente menor (1,6 frente a 1,8 s por página). Frente a Typhoon OCR V2 2B, un modelo más de tres veces mayor, la media es 2,5 puntos superior y la latencia casi diez veces menor, aunque las diferencias en tablas y texto impreso no alcanzan significación estadística. La información disponible no detalla la licencia ni la longitud de contexto de los modelos Typhoon.

## Limitaciones y advertencias

- Sesgos: no se documentan sesgos específicos en la información disponible; al estar entrenado principalmente con documentos oficiales tailandeses, puede rendir peor en dominios alejados de ese registro.
- Alucinación: no se cuantifica el riesgo de alucinación; en OCR, el modo de fallo típico es la omisión o corrupción de texto en páginas densas o de baja calidad, no la invención de contenido.
- Contexto: la longitud de contexto no está publicada; una página que se corta por el límite de tokens se contabiliza como vacía en la evaluación (aunque ninguna falló en los conjuntos medidos).
- Idiomas: solo tailandés e inglés; no hay soporte declarado para otras lenguas.
- Rendimiento desigual: queda por detrás de Typhoon OCR V2 2B en fotos de documentos (OCR104), recortes mixtos tailandés-inglés y un conjunto verificado de la Royal Gazette.
- Sesgo de evaluación: las páginas nuevas de la Gazette se evalúan contra un texto de referencia generado por la misma herramienta que las etiquetas de entrenamiento, y el modelo ha visto páginas de meses anteriores; los resultados en ese conjunto deben interpretarse con cautela.
- Licencia: OpenMDW-1.1, heredada de NVIDIA; es necesario revisar sus términos para uso comercial y cumplir las atribuciones de copyright, avisos de terceros y tokenizer del modelo base, incluidos en el repositorio.
- Producción: requiere GPU NVIDIA y vLLM para el rendimiento publicado; el soporte en Mac con Apple silicon es mediante Transformers y no se han publicado métricas de latencia para ese backend.
- Madurez: el modelo se publicó en noviembre de 2026 con cero descargas y cero likes en Hugging Face, por lo que carece de validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/ArmanNr/OpenThai2.0-OCR-Markdown
- Modelo base: https://huggingface.co/nvidia/Nemotron-3.5-Parse
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Guía de ejecución (inglés): https://iapp.co.th/en/blog/openthai2p0-ocr-how-to-run
- Guía de ejecución (tailandés): https://iapp.co.th/blog/openthai2p0-ocr-how-to-run
- Guía de ejecución (chino): https://iapp.co.th/zh-CN/blog/openthai2p0-ocr-how-to-run
- Recursos de la model card: https://huggingface.co/datasets/iapp/OpenThai2.0-model-card-assets

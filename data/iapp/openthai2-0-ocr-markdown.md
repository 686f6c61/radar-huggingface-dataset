# iapp/OpenThai2.0-OCR-Markdown

## Resumen

OpenThai2.0-OCR-Markdown es un modelo de conversión de imágenes de documentos a Markdown desarrollado por iApp Technology dentro del proyecto OpenThai (anteriormente OpenThaiGPT), lanzado junto con AIEAT. Se trata de un ajuste fino en tailandés del modelo NVIDIA Nemotron 3.5 Parse (0,63B de parámetros), especializado en transcribir páginas de documentos en tailandés e inglés a Markdown estructurado, con tablas representadas como HTML y fórmulas como LaTeX. El repositorio originalmente se denominó OpenThai2.0 y ahora redirige a la versión 2.1 (18 de noviembre de 2026), que mantiene la etiqueta `v2.0.0` para acceder a los pesos anteriores.

El modelo conserva la arquitectura multimodal de Nemotron Parse: un codificador visual C-RADIOv4-SO400M de 439,0M de parámetros y un decodificador de texto de 191,8M (mBART de 10 capas, anchura 1.024), lo que suma 630,8M de parámetros totales. La entrada es una imagen de página ajustada a 1.664 × 2.048 píxeles y la salida incluye, además del Markdown, cajas de delimitación y una clase para cada bloque en orden de lectura.

La relevancia actual del modelo reside en su especialización en documentos tailandeses, un nicho poco cubierto por los modelos OCR generalistas, con un rendimiento competitivo en conjuntos de evaluación específicos (94,0 en th-docs-tables v1 y 69,5 en ThaiOCRBench tables) y un coste de inferencia bajo (1,5 s por página en una H100). La versión 2.1 incorpora fotografías de móvil, nueve tipos de página adicionales, fórmulas LaTeX, exclusión de encabezados y pies de página, y normalización del carácter tailandés ำ (U+0E33).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Multimodal image-text-to-text: codificador visual C-RADIOv4-SO400M + decodificador de texto mBART de 10 capas (anchura 1.024) |
| Parámetros totales | 630.800.504 (439,0M visión + 191,8M texto) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en float32; servido en bfloat16) |
| Idiomas soportados | Tailandés (th) e inglés (en) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (`model.safetensors`, float32, 2,52 GB); repo de 5,2 GB |
| Entrada | Una imagen de página ajustada a 1.664 × 2.048 píxeles |
| Salida | Markdown con tablas en HTML (rowspan/colspan) y fórmulas en LaTeX, más cajas y clases de bloque en orden de lectura |
| Modelo base | nvidia/Nemotron-3.5-Parse |
| Hardware | Una GPU NVIDIA, servido con vLLM |
| Velocidad | 1,5 s por página en una H100 (mediana de 12 páginas con tablas) |
| Versión | 2.1, 18 de noviembre de 2026 (etiqueta `v2.1.0`); 2.0 bajo `v2.0.0` |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal con un codificador visual C-RADIOv4-SO400M (439,0M de parámetros) que procesa una única imagen de página reescalada a 1.664 × 2.048 píxeles, y un decodificador de texto mBART de 10 capas y anchura 1.024 (191,8M de parámetros). La salida combina Markdown con tablas HTML y fórmulas LaTeX, junto con cajas de delimitación y clases de bloque en orden de lectura, lo que permite reconstruir la estructura del documento además del texto.

El entrenamiento consistió en un ajuste fino completo durante una época sobre 77.900 filas (2.435 pasos de 32) en una H100. Los pesos publicados son una mezcla en el espacio de pesos: 70% del ajuste fino y 30% del modelo base. La versión 2.1 añade entrenamiento sobre páginas fotografiadas con móvil y nueve tipos de página adicionales (artículos académicos, libros, cómics, exámenes, revistas, periódicos, informes, diapositivas y libros de texto) en tailandés e inglés. No se especifica en la información disponible el número total de tokens de entrenamiento ni la composición detallada del dataset, ni si se emplearon RLHF o DPO.

Entre las innovaciones técnicas destacables de la versión 2.1 figuran: fórmulas multilínea agrupadas en un único bloque `$$\begin{gathered}...\end{gathered}$$`, exclusión por defecto de encabezados y pies de página del Markdown (manteniéndolos en la lista de bloques), detección de páginas en blanco para evitar texto inventado, y normalización del carácter ำ como un solo carácter (U+0E33) sin `rowspan="1"` ni `colspan="1"` en las celdas de tabla.

## Capacidades

- Conversión de imágenes de páginas de documentos a Markdown estructurado, con tablas representadas como HTML y fórmulas como LaTeX.
- Extracción de estructura de documento: cajas de delimitación, clases de bloque y orden de lectura.
- Procesamiento de documentos en tailandés e inglés, incluyendo documentos oficiales tailandeses, tablas y texto impreso.
- Manejo de páginas fotografiadas con móvil y de nueve tipos de página: artículos académicos, libros, cómics, exámenes, revistas, periódicos, informes, diapositivas y libros de texto.
- Detección de páginas en blanco (devuelve salida vacía en lugar de texto inventado).
- Exclusión configurable de encabezados y pies de página del Markdown de salida.
- Soporte de fórmulas matemáticas en LaTeX, incluidas fórmulas multilínea.
- No se documenta en la información disponible soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking.

## Casos de uso

- Digitalización de documentos oficiales tailandeses: el modelo transcribe páginas administrativas y tablas a Markdown estructurado, con un rendimiento de 94,0 en th-docs-tables v1, adecuado para pipelines de archivo y gestión documental pública.
- Extracción de tablas de informes y publicaciones: la salida HTML con rowspan y colspan permite reconstruir tablas complejas de informes, revistas y periódicos para su carga en bases de datos o hojas de cálculo.
- Procesamiento de artículos académicos y libros de texto: la versión 2.1 está entrenada específicamente en estos tipos de página, incluyendo fórmulas LaTeX, lo que facilita la conversión de material científico a Markdown para repositorios y plataformas de documentación.
- Digitalización de exámenes y material educativo: la capacidad de manejar diapositivas, exámenes y libros de texto permite convertir material docente a formato Markdown para plataformas de aprendizaje.
- Captura de documentos con móvil: el entrenamiento sobre páginas fotografiadas habilita la conversión de documentos capturados con teléfono en aplicaciones de escaneo y gestión documental personal.
- Ingesta de documentos para RAG: la salida Markdown con estructura preservada (encabezados, tablas, fórmulas) facilita la fragmentación y el indexado en pipelines de recuperación aumentada para asistentes sobre documentación tailandesa.
- Extracción de contenido de cómics y revistas: la cobertura de estos tipos de página permite digitalizar publicaciones con maquetación no estándar.

## Benchmarks y rendimiento

| Modelo | th-docs-tables v1 (65 páginas) | ThaiOCRBench tables (193 imágenes) | Texto tailandés impreso (12 conjuntos) | MDPBench EN+TH (320 páginas) | MDPBench Thai | olmOCR-bench | OmniDocBench v1.6 | Segundos por página |
|---|---|---|---|---|---|---|---|---|
| OpenThai2.1-OCR-Markdown-20261118 | 94,0 | 69,5 | 90,2 | 82,5 | 80,7 | 73,1 | 79,6 | 1,5 |
| OpenThai2.0-OCR-Markdown | 95,2 | 68,9 | 90,3 | 73,7 | 72,7 | 50,9 | 61,8 | 1,5 |
| Nemotron 3.5 Parse (base) | 91,3 | 68,3 | 89,0 | 79,6 | 77,4 | 62,4 | 80,1 | 1,8 |
| Typhoon OCR V2 2B | 91,6 | 67,6 | 89,6 | 87,0 | 85,0 | 84,7 | 91,5 | 1,0 |

La negrita en la model card marca la mejor puntuación de cada columna. Frente a Typhoon OCR V2 2B, con intervalos pareados del 95%: th-docs-tables v1 +2,3 [+0,4, +4,8] (por delante); ThaiOCRBench tables +1,9 [−1,0, +4,9] (no significativo); texto tailandés +0,69 [−0,31, +1,51] (no significativo); MDPBench −4,5 [−7,0, −2,0] (por detrás); MDPBench Thai −4,3 [−8,4, −0,4] (por detrás); olmOCR-bench −11,6 (por detrás); OmniDocBench v1.6 −11,8 (por detrás). Frente a OpenThai2.0: th-docs-tables v1 −1,2 [−2,9, +0,3] y ThaiOCRBench tables +0,6 [−1,6, +2,7], ninguno significativo; texto tailandés 90,24 frente a 90,31; olmOCR-bench +22,2 y OmniDocBench +17,8.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en float32 ocupan 2,52 GB; servidos en bfloat16, la huella de pesos ronda 1,3 GB, más el coste de activaciones y del codificador visual. No se proporciona una cifra oficial de VRAM total.
- GPU recomendadas: una GPU NVIDIA; la model card reporta 1,5 s por página en una H100.
- Cabe en GPU de consumo: no se documenta explícitamente en la información disponible; el tamaño de pesos (2,52 GB en float32) sugiere que podría ejecutarse en GPUs de consumo con VRAM suficiente, pero no hay confirmación oficial.
- Opciones de despliegue: vLLM (mencionado en la model card); el modelo incluye el paquete de postprocesado `nemotron_parse` con `DocumentParser` y `nemotron_parse/postprocessing.py`. No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: 1,5 s por página en una H100 procesando una página a la vez (mediana de 12 páginas con tablas); el modelo base reporta 1,8 s por página.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | MDPBench EN+TH | olmOCR-bench | OmniDocBench v1.6 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| OpenThai2.1-OCR-Markdown | 630,8M | th, en | 82,5 | 73,1 | 79,6 | OpenMDW-1.1 | Hugging Face (iapp) |
| OpenThai2.0-OCR-Markdown | 630,8M | th, en | 73,7 | 50,9 | 61,8 | OpenMDW-1.1 | Hugging Face (etiqueta `v2.0.0`) |
| Nemotron 3.5 Parse (base) | 0,63B | no disponible | 79,6 | 62,4 | 80,1 | OpenMDW-1.1 | Hugging Face (nvidia) |
| Typhoon OCR V2 2B | 2B | no disponible | 87,0 | 84,7 | 91,5 | no disponible | no disponible |

Typhoon OCR V2 2B supera al modelo en MDPBench (por 4,5 puntos), olmOCR-bench y OmniDocBench, especialmente en fórmulas y páginas fotografiadas, pero es más lento (1,0 s por página, el más rápido de la tabla) y de mayor tamaño (2B). OpenThai2.1 mejora a OpenThai2.0 de forma notable en olmOCR-bench (+22,2) y OmniDocBench (+17,8), y supera al modelo base en MDPBench (82,5 frente a 79,6) y olmOCR-bench (73,1 frente a 62,4), aunque queda por debajo del base en OmniDocBench (79,6 frente a 80,1).

## Limitaciones y advertencias

- El modelo está especializado en tailandés e inglés; no se documenta soporte de otros idiomas.
- Typhoon OCR V2 2B sigue por delante en MDPBench (4,5 puntos, especialmente en páginas fotografiadas y tablas), olmOCR-bench y OmniDocBench (especialmente en fórmulas), según los datos del autor.
- La licencia OpenMDW-1.1 es una licencia "other"; deben revisarse sus términos para uso comercial y la conservación de avisos de copyright y atribuciones de NVIDIA.
- El modelo deriva de nvidia/Nemotron-3.5-Parse y conserva su licencia, avisos de copyright, avisos de terceros y atribución del tokenizer; el README original de NVIDIA se mantiene como `NVIDIA_NEMOTRON_PARSE_README.md`.
- Riesgo de alucinación en páginas en blanco: la versión 2.0 podía inventar texto; la 2.1 añade una comprobación de página en blanco en `nemotron_parse/inference.py`, pero el comportamiento en otros casos límite no se documenta.
- No se documentan sesgos conocidos, límites de longitud de contexto ni latencia en GPUs distintas de la H100.
- La entrada se limita a una imagen de página ajustada a 1.664 × 2.048 píxeles; no se documenta procesamiento por lotes ni de documentos multipágina en una sola llamada.
- La información disponible no detalla el rendimiento en GPUs de consumo ni opciones de cuantización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iapp/OpenThai2.0-OCR-Markdown
- Versión 2.1 (redirección del repositorio): https://huggingface.co/iapp/OpenThai2.1-OCR-Markdown-20261118
- Pesos de la versión 2.0: https://huggingface.co/iapp/OpenThai2.1-OCR-Markdown-20261118/tree/v2.0.0
- Modelo base: https://huggingface.co/nvidia/Nemotron-3.5-Parse
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Recursos de la model card: https://huggingface.co/datasets/iapp/OpenThai2.0-model-card-assets
- No se han encontrado en la búsqueda web otros enlaces relevantes (papers, blogs, repositorios o demos) del modelo; los resultados de búsqueda corresponden a la International Association of Privacy Professionals (IAPP), una organización no relacionada con el autor del modelo.

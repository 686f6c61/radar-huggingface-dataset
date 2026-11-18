# iapp/OpenThai2.1-OCR-Markdown-20261118

## Resumen

OpenThai2.1-OCR-Markdown-20261118 es un modelo de visión-lenguaje especializado en convertir imágenes de páginas de documentos en Markdown estructurado, con tablas representadas como HTML y fórmulas como LaTeX. Lo desarrolla iApp Technology en el marco del proyecto OpenThai (anteriormente OpenThaiGPT), y se presenta como un ajuste fino en tailandés e inglés del modelo NVIDIA Nemotron 3.5 Parse, de 630,8 millones de parámetros. El modelo resuelve el problema del parseo de documentos tailandeses e ingleses en producción: extrae texto, tablas, fórmulas y estructura de bloques (con cajas de layout, clases de bloque y orden de lectura) a partir de una única imagen de página.

La versión 2.1, publicada el 18 de noviembre de 2026, amplía el entrenamiento a fotografías de móvil y a nueve tipos de página adicionales (artículos académicos, libros, cómics, exámenes, revistas, periódicos, informes, diapositivas y libros de texto), e incorpora salida estándar en tailandés (la vocal ำ como un único carácter U+0E33), fórmulas multilínea en un bloque `gathered` y omisión de cabeceras y pies de página en el Markdown resultante. Mantiene el mismo tamaño y velocidad que la versión 2.0.

El modelo es relevante porque ofrece un pipeline completo de OCR estructurado en tailandés con un coste computacional bajo (1,5 segundos por página en una H100) y una licencia OpenMDW-1.1 que permite uso comercial. No obstante, queda por detrás de Typhoon OCR V2 2B en los benchmarks generales MDPBench, olmOCR-bench y OmniDocBench, aunque supera a ese modelo en el conjunto específico th-docs-tables v1.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision encoder C-RADIOv4-SO400M (439,0 M) + text decoder mBART de 10 capas y anchura 1.024 (191,8 M) |
| Parámetros totales | 630.800.504 (630,8 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en float32; servido en bfloat16) |
| Idiomas soportados | Tailandés (th) e inglés (en) |
| Licencia | OpenMDW-1.1 (`license: other`) |
| Formato de pesos | safetensors (`model.safetensors`, float32, 2,52 GB) |
| Entrada | Una imagen de página ajustada a 1.664 × 2.048 píxeles (ancho × alto) |
| Salida | Markdown con tablas en HTML (rowspan/colspan) y fórmulas en LaTeX, más cajas y clases de bloque en orden de lectura |
| Modelo base | `nvidia/Nemotron-3.5-Parse` |
| Hardware recomendado | Una GPU NVIDIA, servido con vLLM |
| Velocidad | 1,5 s por página en una H100 (mediana de 12 páginas de tablas) |
| Versión | 2.1, 18 de noviembre de 2026 (tag `v2.1.0`); 2.0 disponible en `v2.0.0` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de Nemotron 3.5 Parse: un codificador visual C-RADIOv4-SO400M de 439,0 M de parámetros que procesa la imagen de página a 1.664 × 2.048 píxeles, acoplado a un decodificador de texto mBART de 10 capas y anchura 1.024 con 191,8 M de parámetros. La salida combina la generación de Markdown con la predicción de cajas de layout, clases de bloque y orden de lectura, de modo que el resultado no es solo texto plano sino una representación estructurada de la página.

El entrenamiento consistió en un ajuste fino completo (full fine-tune) durante una época sobre 77.900 filas, en 2.435 pasos de tamaño de lote 32, ejecutado en una única H100. Los pesos publicados no son directamente el resultado del ajuste fino, sino una mezcla en el espacio de pesos: un 70 % del modelo ajustado y un 30 % del modelo base Nemotron 3.5 Parse. Esta técnica de blending busca preservar capacidades del modelo original (como el parseo de fórmulas y la estructura general) mientras se incorpora la especialización en tailandés y en los nuevos tipos de página. No se especifica en la información disponible la composición exacta del dataset de entrenamiento ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Conversión de imágenes de páginas de documentos a Markdown estructurado, con tablas representadas como HTML (incluyendo `rowspan` y `colspan`) y fórmulas como LaTeX entre delimitadores `$$`.
- Manejo de fórmulas multilínea, que se emiten como un único bloque `$$\begin{gathered}...\end{gathered}$$`.
- Extracción de estructura de layout: cajas delimitadoras, clases de bloque y orden de lectura para cada bloque de la página.
- Omisión por defecto de cabeceras y pies de página en el Markdown generado, manteniéndolos en la lista de bloques.
- Detección de páginas en blanco: el componente `DocumentParser` no envía una hoja vacía al modelo, evitando la invención de texto.
- Salida estándar en tailandés: la vocal ำ se escribe como un único carácter (U+0E33) y las celdas de tabla no incluyen `rowspan="1"` ni `colspan="1"` redundantes.
- Procesamiento de fotografías de móvil y de nueve tipos de página: artículos académicos, libros, cómics, exámenes, revistas, periódicos, informes, diapositivas y libros de texto, en tailandés e inglés.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo es un parser de página única, no un agente conversacional).
- Capacidades multilingües limitadas a tailandés e inglés.

## Casos de uso

- Digitalización de documentos oficiales tailandeses: el modelo convierte formularios y documentos administrativos en Markdown estructurado, con tablas en HTML y cajas de layout, lo que permite indexar y buscar el contenido en sistemas de gestión documental. Es adecuado porque obtiene 94,0 en th-docs-tables v1, el mejor resultado de su categoría en ese conjunto.
- Extracción de tablas de informes financieros y contables: gracias a la representación HTML con `rowspan` y `colspan`, las tablas complejas se preservan con su estructura de filas y columnas, lo que facilita su posterior conversión a CSV o su carga en bases de datos.
- Procesamiento de artículos académicos y libros de texto: la versión 2.1 está entrenada específicamente en estos tipos de página, incluyendo fórmulas matemáticas en LaTeX, lo que permite construir corpus de investigación a partir de PDFs escaneados o fotografías.
- Digitalización de exámenes y material educativo: el modelo maneja diapositivas, exámenes y libros de texto, y omite cabeceras y pies de página, lo que reduce el ruido en el Markdown resultante y facilita la reutilización del contenido en plataformas de e-learning.
- Procesamiento de fotografías de documentos tomadas con móvil: al estar entrenado en páginas fotografiadas, es adecuado para aplicaciones de captura móvil en las que el usuario fotografía un documento y espera una transcripción estructurada, con un rendimiento en tailandés fotografiado aproximadamente 10 puntos superior al de la versión 2.0.
- Extracción de contenido de periódicos y revistas: el modelo está entrenado en estos tipos de página y preserva el orden de lectura de los bloques, lo que permite reconstruir el flujo editorial de una página maquetada.
- Pipeline de OCR a gran escala con vLLM: con 1,5 s por página en una H100 y un tamaño de 630,8 M de parámetros, el modelo puede desplegarse en un servicio vLLM para procesar lotes de documentos con un coste computacional contenido.

## Benchmarks y rendimiento

| Modelo | th-docs-tables v1 (65 págs.) | ThaiOCRBench tables (193 imgs.) | Thai text impreso (12 sets) | MDPBench EN+TH (320 págs.) | MDPBench Thai | olmOCR-bench | OmniDocBench v1.6 | Segundos por página |
|---|---|---|---|---|---|---|---|---|
| OpenThai2.1-OCR-Markdown-20261118 | 94,0 | 69,5 | 90,2 | 82,5 | 80,7 | 73,1 | 79,6 | 1,5 |
| OpenThai2.0-OCR-Markdown | 95,2 | 68,9 | 90,3 | 73,7 | 72,7 | 50,9 | 61,8 | 1,5 |
| Nemotron 3.5 Parse (base) | 91,3 | 68,3 | 89,0 | 79,6 | 77,4 | 62,4 | 80,1 | 1,8 |
| Typhoon OCR V2 2B | 91,6 | 67,6 | 89,6 | 87,0 | 85,0 | 84,7 | 91,5 | 1,0 |

En negrita en la model card original figuran los mejores valores por columna. Frente a Typhoon OCR V2 2B, con intervalos de confianza pareados al 95 %: th-docs-tables v1 +2,3 [+0,4; +4,8] (por delante); ThaiOCRBench tables +1,9 [−1,0; +4,9] (no significativo); texto tailandés +0,69 [−0,31; +1,51] (no significativo); MDPBench −4,5 [−7,0; −2,0] (por detrás); MDPBench Thai −4,3 [−8,4; −0,4] (por detrás); olmOCR-bench −11,6 (±1,0 y ±0,8) (por detrás); OmniDocBench v1.6 −11,8 (por detrás).

Frente a OpenThai2.0 en los mismos conjuntos: th-docs-tables v1 −1,2 [−2,9; +0,3] y ThaiOCRBench tables +0,6 [−1,6; +2,7], ninguno significativo; texto tailandés 90,24 frente a 90,31; olmOCR-bench +22,2 y OmniDocBench +17,8.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos se publican en float32 (2,52 GB); servidos en bfloat16 el peso es de aproximadamente 1,26 GB, más el coste de activaciones y del codificador visual. No se especifica una cifra oficial de VRAM mínima.
- GPU recomendadas: una GPU NVIDIA; la model card cita una H100 para el servicio con vLLM y reporta 1,5 s por página en ese hardware.
- Cabe en GPU de consumo: no se especifica en la información disponible; por tamaño de parámetros (630,8 M) debería caber en GPUs de consumo con suficiente VRAM, pero no hay confirmación oficial.
- Opciones de despliegue: vLLM es el stack de servicio indicado por el autor; el modelo incluye su propio stack de serving y postprocesado (`nemotron_parse`) heredado de Nemotron 3.5 Parse. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: 1,5 s por página en una H100 procesando una página a la vez (mediana de 12 páginas de tablas); el modelo base tarda 1,8 s y Typhoon OCR V2 2B, 1,0 s.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | MDPBench EN+TH | olmOCR-bench | OmniDocBench v1.6 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| OpenThai2.1-OCR-Markdown-20261118 | 630,8 M | th, en | 82,5 | 73,1 | 79,6 | OpenMDW-1.1 | Hugging Face |
| OpenThai2.0-OCR-Markdown | 630,8 M | th, en | 73,7 | 50,9 | 61,8 | OpenMDW-1.1 | Hugging Face (tag `v2.0.0`) |
| Nemotron 3.5 Parse (base) | 630,8 M (arquitectura equivalente) | No disponible | 79,6 | 62,4 | 80,1 | OpenMDW-1.1 | Hugging Face (`nvidia/Nemotron-3.5-Parse`) |
| Typhoon OCR V2 2B | 2 B | No disponible | 87,0 | 84,7 | 91,5 | No disponible | No disponible |

## Limitaciones y advertencias

- Queda por detrás de Typhoon OCR V2 2B en MDPBench (−4,5 puntos), MDPBench Thai (−4,3), olmOCR-bench (−11,6) y OmniDocBench v1.6 (−11,8); la diferencia se concentra en páginas fotografiadas, tablas y fórmulas.
- Frente a la versión 2.0, pierde 1,2 puntos en th-docs-tables v1 (no significativo), aunque gana de forma sustancial en olmOCR-bench y OmniDocBench.
- El modelo solo soporta tailandés e inglés; no hay soporte declarado para otras lenguas.
- Es un parser de página única, no un modelo conversacional ni un agente; no se documenta soporte de tool calling ni razonamiento multi-paso.
- La licencia OpenMDW-1.1 es una licencia "other"; debe revisarse el texto completo en el enlace oficial antes de un uso comercial, y se mantienen las obligaciones de atribución de NVIDIA (copyright, avisos de terceros y atribución del tokenizer).
- Los pesos publicados son una mezcla 70/30 del ajuste fino y el modelo base, lo que puede introducir comportamientos residuales del modelo original no documentados en detalle.
- No se dispone de información sobre sesgos conocidos, tasas de alucinación medidas ni límites de longitud de contexto.
- El rendimiento en páginas en blanco se ha corregido en 2.1 mediante una comprobación previa en `DocumentParser`, pero el modelo subyacente podría seguir inventando texto si se le envía directamente una imagen vacía sin ese filtro.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iapp/OpenThai2.1-OCR-Markdown-20261118
- Versión 2.0 (tag `v2.0.0`): https://huggingface.co/iapp/OpenThai2.1-OCR-Markdown-20261118/tree/v2.0.0
- Modelo base NVIDIA Nemotron 3.5 Parse: https://huggingface.co/nvidia/Nemotron-3.5-Parse
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Assets de la model card (OpenThai · iApp Technology): https://huggingface.co/datasets/iapp/OpenThai2.0-model-card-assets

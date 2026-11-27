# iapp/OpenThai2.1-OCR-Markdown-20261118

## Resumen

OpenThai2.1-OCR-Markdown-20261118 es un modelo de conversión de imágenes de documentos a Markdown, especializado en tailandés e inglés, desarrollado por iApp Technology en el marco del proyecto OpenThai (anteriormente OpenThaiGPT) y lanzado junto con AIEAT. Se trata de un ajuste fino del modelo NVIDIA Nemotron 3.5 Parse (0,63B), y hereda de él tanto la arquitectura como la pila completa de servicio y posprocesamiento, de modo que puede desplegarse en cualquier infraestructura compatible con el modelo base.

El modelo resuelve el problema de digitalizar documentos tailandeses e ingleses preservando su estructura: devuelve Markdown con tablas en HTML (con spans de fila y columna), fórmulas en LaTeX y, para cada bloque, su caja delimitadora y su clase, todo en orden de lectura. La versión 2.1 amplía el entrenamiento a fotografías de móvil y a nueve tipos de página adicionales (artículos académicos, libros, cómics, exámenes, revistas, periódicos, informes, diapositivas y libros de texto), además de los documentos oficiales que ya cubría la versión 2.0.

Su relevancia actual radica en que ofrece un rendimiento competitivo en documentos tailandeses con un coste computacional muy bajo: 630,8 millones de parámetros, 2,52 GB de pesos en float32 y 1,5 segundos por página en una única H100. La licencia OpenMDW-1.1 permite uso comercial, lo que lo hace atractivo para pipelines de digitalización a escala en el sudeste asiático.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision encoder C-RADIOv4-SO400M (439,0M) + decodificador de texto mBART de 10 capas y anchura 1.024 (191,8M); tarea image-text-to-text |
| Parametros totales | 630.800.504 (630,8M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; los pesos se publican en float32 y se sirven en bfloat16 |
| Idiomas soportados | Tailandés (th) e inglés (en) |
| Licencia | OpenMDW-1.1 (licencia "other", con avisos de copyright y atribución de NVIDIA incluidos sin modificar) |
| Formato de pesos | safetensors (`model.safetensors`, float32, 2,52 GB); repositorio de 7,8 GB |
| Resolucion de entrada | Una imagen de página ajustada a 1.664 × 2.048 píxeles (ancho × alto) |
| Modelo base | nvidia/Nemotron-3.5-Parse |
| Hardware de referencia | Una GPU NVIDIA, servido con vLLM |

## Arquitectura y entrenamiento

La arquitectura es un modelo multimodal de imagen a texto compuesto por un codificador visual C-RADIOv4-SO400M de 439,0M de parámetros y un decodificador de texto mBART de 10 capas y anchura 1.024 con 191,8M de parámetros. El modelo recibe una única imagen de página reescalada a 1.664 × 2.048 píxeles y genera Markdown con tablas en HTML y fórmulas en LaTeX, acompañado de las cajas delimitadoras y las clases de cada bloque en orden de lectura. Conserva la arquitectura, el tokenizador y el código de servicio del modelo base de NVIDIA.

El entrenamiento consistió en un ajuste fino completo durante una época sobre 77.900 filas (2.435 pasos de 32) en una sola H100. Los pesos publicados son una mezcla en el espacio de pesos: un 70% del ajuste fino y un 30% del modelo base. La versión 2.1 incorpora entrenamiento sobre páginas fotografiadas con móvil y nueve tipos de página adicionales, además de mejoras de posprocesamiento: fórmulas multilínea agrupadas en `$$\begin{gathered}...\end{gathered}$$`, exclusión de cabeceras y pies de página del Markdown por defecto, omisión de páginas en blanco (que antes provocaban texto inventado) y normalización del carácter tailandés ำ como un único punto de código (U+0E33). El repositorio incluye un borrador de decodificación especulativa denominado DFlash2, que reduce el tiempo por página de 1,5 s a 0,44 s.

## Capacidades

- Conversión de imágenes de páginas de documentos a Markdown estructurado, con tablas representadas en HTML y spans de fila y columna.
- Extracción de fórmulas matemáticas en LaTeX, incluidas fórmulas de varias líneas agrupadas en un único bloque `gathered`.
- Detección de layout: devuelve una caja delimitadora y una clase para cada bloque, en orden de lectura.
- Procesamiento de documentos tailandeses e ingleses, incluyendo documentos oficiales, artículos académicos, libros, cómics, exámenes, revistas, periódicos, informes, diapositivas y libros de texto.
- Robustez ante fotografías de móvil, no solo ante escaneos limpios.
- Exclusión automática de cabeceras y pies de página del Markdown de salida, manteniéndolos en la lista de bloques.
- Detección de páginas en blanco, que se devuelven vacías en lugar de con texto inventado.
- Salida tailandesa normalizada (ำ como U+0E33) y celdas de tabla sin `rowspan="1"` ni `colspan="1"` redundantes.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso ni agentes; el modelo está especializado en parsing de documentos.

## Casos de uso

- Digitalización masiva de documentos oficiales tailandeses: el modelo mantiene un rendimiento de 94,0 en th-docs-tables v1 y 69,5 en ThaiOCRBench tables, adecuado para convertir expedientes administrativos escaneados a Markdown indexable en sistemas de gestión documental.
- Extracción de tablas financieras y administrativas: la salida HTML con spans de fila y columna permite reconstruir tablas complejas y cargarlas directamente en bases de datos o hojas de cálculo sin post-procesado manual de la estructura.
- Procesamiento de fotografías de documentos tomadas con móvil: la versión 2.1 sube unos 10 puntos en páginas tailandesas fotografiadas de MDPBench, lo que lo hace apto para aplicaciones de captura con cámara en movilidad (por ejemplo, recepción de facturas o formularios en campo).
- Conversión de artículos académicos y libros de texto con fórmulas: la salida en LaTeX entre delimitadores `$$` facilita la reutilización en entornos de publicación científica, wikis técnicas o plataformas de e-learning.
- Construcción de corpus para entrenamiento de modelos en tailandés: el pipeline puede convertir grandes volúmenes de páginas a Markdown limpio, sin cabeceras ni pies de página, para alimentar datasets de preentrenamiento o ajuste fino.
- Digitalización de prensa y revistas históricas: al cubrir los tipos de página de periódicos y revistas, permite extraer artículos y maquetas multicolumna preservando el orden de lectura.
- Despliegue en infraestructura modesta: con 630,8M de parámetros y 2,52 GB de pesos en float32, puede servirse en una única GPU y procesar páginas a 1,5 s en una H100 (0,44 s con el borrador DFlash2), lo que viabiliza servicios de OCR a escala media sin clústeres dedicados.

## Benchmarks y rendimiento

| Modelo | th-docs-tables v1 (65 pág.) | ThaiOCRBench tables (193 img.) | Texto tailandés impreso (12 sets) | MDPBench EN+TH (320 pág.) | MDPBench Thai | olmOCR-bench | OmniDocBench v1.6 | Segundos por página |
|---|---|---|---|---|---|---|---|---|
| **OpenThai2.1-OCR-Markdown-20261118** | 94,0 | **69,5** | 90,2 | 82,5 | 80,7 | 73,1 | 79,6 | 1,5 |
| OpenThai2.0-OCR-Markdown | **95,2** | 68,9 | **90,3** | 73,7 | 72,7 | 50,9 | 61,8 | 1,5 |
| Nemotron 3.5 Parse (base) | 91,3 | 68,3 | 89,0 | 79,6 | 77,4 | 62,4 | 80,1 | 1,8 |
| Typhoon OCR V2 2B | 91,6 | 69,4 | 89,5 | **87,0** | **85,0** | **84,7** | **91,5** | **1,0** |

Comparación directa frente a Typhoon OCR V2 2B con intervalos de confianza pareados al 95%:

| Benchmark | Diferencia | Resultado |
|---|---|---|
| th-docs-tables v1 | +2,3 [+0,4; +4,8] | por delante |
| ThaiOCRBench tables | +0,1 [−2,7; +2,9] | no significativo |
| Texto tailandés | +0,73 [+0,19; +1,24] | por delante |
| MDPBench | −4,5 [−7,0; −2,0] | por detrás |
| MDPBench Thai | −4,3 [−8,4; −0,4] | por detrás |
| olmOCR-bench | −11,6 (±1,0 y ±0,8) | por detrás |
| OmniDocBench v1.6 | −11,8 | por detrás |

En velocidad, el modelo tarda 1,5 s por página en una H100 (mediana de 12 páginas de tablas, servido con vLLM y una página a la vez); con el borrador DFlash2 incluido en el repositorio baja a 0,44 s. En la misma H100, Typhoon OCR V2 2B con su borrador EAGLE-3 tarda 1,15 s frente a los 0,45 s de este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 2,52 GB en float32 y se sirven en bfloat16 (aproximadamente 1,26 GB solo para pesos); el total dependerá del backend, de los buffers de activación y del procesamiento de imágenes a 1.664 × 2.048 píxeles. No se publica una cifra oficial de VRAM total.
- GPU recomendadas: una única GPU NVIDIA; el rendimiento de referencia (1,5 s por página) está medido en una H100.
- GPU de consumo: no se documenta explícitamente el soporte en GPU de consumo; por tamaño de pesos (2,52 GB en float32) es plausible en tarjetas con suficiente VRAM, pero no hay datos oficiales de rendimiento en RTX 4090 u otras.
- Opciones de despliegue: vLLM es el backend de referencia utilizado por el autor. El modelo requiere `custom_code` (paquete `nemotron_parse`), por lo que no es un transformer estándar. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: 1,5 s por página en H100 (una página a la vez); 0,44 s con el borrador DFlash2; 0,45 s frente a 1,15 s de Typhoon OCR V2 2B con EAGLE-3 en la misma GPU.
- Componentes adicionales: el repositorio incluye el borrador de decodificación especulativa DFlash2 y el paquete de posprocesamiento `nemotron_parse` (con las modificaciones de Markdown y la comprobación de páginas en blanco).

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | MDPBench EN+TH | olmOCR-bench | OmniDocBench v1.6 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| OpenThai2.1-OCR-Markdown-20261118 | 630,8M | th, en | 82,5 | 73,1 | 79,6 | OpenMDW-1.1 | Hugging Face (iapp) |
| OpenThai2.0-OCR-Markdown | 630,8M | th, en | 73,7 | 50,9 | 61,8 | OpenMDW-1.1 | Hugging Face (tag v2.0.0) |
| Nemotron 3.5 Parse (base) | 630,8M | th, en | 79,6 | 62,4 | 80,1 | OpenMDW-1.1 | Hugging Face (nvidia) |
| Typhoon OCR V2 2B | 2B | th, en | 87,0 | 84,7 | 91,5 | No disponible en la información proporcionada | No disponible en la información proporcionada |

Frente a su modelo base, OpenThai2.1 mejora en MDPBench (+2,9), olmOCR-bench (+10,7) y th-docs-tables (+2,7), y baja ligeramente en OmniDocBench v1.6 (−0,5). Frente a Typhoon OCR V2 2B, que es tres veces mayor, queda por detrás en MDPBench (−4,5), olmOCR-bench (−11,6) y OmniDocBench (−11,8), pero por delante en th-docs-tables (+2,3) y en texto tailandés impreso (+0,73), con paridad estadística en ThaiOCRBench tables. En velocidad, OpenThai2.1 con DFlash2 (0,44 s) es más rápido que Typhoon OCR V2 2B con EAGLE-3 (1,15 s) en la misma H100.

## Limitaciones y advertencias

- Rendimiento inferior a Typhoon OCR V2 2B en MDPBench (−4,5 puntos), especialmente en páginas fotografiadas y tablas, y muy inferior en olmOCR-bench (−11,6) y OmniDocBench v1.6 (−11,8), sobre todo en fórmulas.
- La versión 2.1 no mejora a la 2.0 en th-docs-tables v1 (94,0 frente a 95,2) ni en texto tailandés (90,2 frente a 90,3); si el caso de uso se limita a documentos oficiales tailandeses, la 2.0 puede ser preferible.
- Cobertura lingüística limitada a tailandés e inglés; no se documenta soporte de otros idiomas.
- El modelo está especializado en parsing de documentos: no se documentan capacidades de razonamiento general, código, matemáticas fuera de la transcripción de fórmulas, tool calling ni agentes.
- Riesgo de alucinación en páginas problemáticas: la model card indica que versiones anteriores inventaban texto en páginas en blanco, lo que motivó la comprobación añadida en `DocumentParser`; conviene validar la salida en documentos de baja calidad.
- Requiere `custom_code` y el paquete `nemotron_parse`; no es un transformer estándar, lo que puede complicar la integración con herramientas que no soporten código personalizado.
- La licencia OpenMDW-1.1 incluye avisos de copyright, atribución de terceros y atribución del tokenizador de NVIDIA que deben conservarse; es responsabilidad del usuario revisar los términos completos antes del uso comercial.
- No se publican datos sobre sesgos demográficos o culturales del modelo.
- Las cifras de rendimiento proceden de la model card del autor y no se han verificado de forma independiente en esta ficha.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iapp/OpenThai2.1-OCR-Markdown-20261118
- Versión anterior (tag v2.0.0): https://huggingface.co/iapp/OpenThai2.1-OCR-Markdown-20261118/tree/v2.0.0
- Modelo base NVIDIA Nemotron 3.5 Parse: https://huggingface.co/nvidia/Nemotron-3.5-Parse
- Model card original de NVIDIA en el repositorio: `NVIDIA_NEMOTRON_PARSE_README.md`
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Recursos gráficos de la model card: https://huggingface.co/datasets/iapp/OpenThai2.0-model-card-assets/resolve/main/openthai-iapp-logos.png

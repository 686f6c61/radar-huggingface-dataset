# dots-studio/dots.mocr

## Resumen

dots.mocr es un modelo multimodal de tipo imagen-a-texto especializado en el análisis y la conversión de documentos. Lo desarrolla dots-studio (el laboratorio rednote-hilab, vinculado a Xiaohongshu) y se distribuye con licencia MIT. Su propósito principal es el parsing de documentos multilingües: extrae texto, interpreta el layout de la página, reconoce tablas y fórmulas, y además convierte gráficos estructurados (diagramas, interfaces de usuario, figuras científicas) directamente en código SVG. La model card lo presenta como estado del arte entre modelos de tamaño comparable en parsing de documentos.

El modelo tiene 3.039.179.264 parámetros (aproximadamente 3B) y un repositorio de 6,1 GB en formato safetensors. Se publica bajo la librería `dots_mocr` con código personalizado para Transformers, y su pipeline es `image-text-to-text`. Está pensado para tareas de OCR, document-parse, layout, table y formula, con soporte declarado de inglés, chino y multilingüe.

Su relevancia actual radica en que compite directamente con soluciones propietarias de OCR y parsing documental (Mistral OCR API, Gemini 3 Pro) y con modelos abiertos del mismo nicho, ofreciendo pesos abiertos bajo MIT y capacidades que van más allá del OCR clásico, como la generación de SVG a partir de imágenes. Existe además una variante específica, dots.mocr-svg, optimizada para el parsing robusto de imagen a SVG.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal imagen-texto; se desconoce el detalle del backbone) |
| Parametros totales | 3.039.179.264 (aprox. 3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh, multilingual |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio de 6,1 GB) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo. Se trata de un modelo multimodal de imagen a texto que se carga mediante Transformers con código personalizado (etiqueta `custom_code`) y la librería propia `dots_mocr`. El pipeline declarado es `image-text-to-text`, y las capacidades descritas en la model card abarcan grounding, reconocimiento, comprensión semántica y diálogo interactivo. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La innovación técnica más destacable que declara el autor es la conversión de gráficos estructurados (charts, layouts de UI, figuras científicas) directamente a código SVG, además del parsing documental estándar. Se publica una variante específica, dots.mocr-svg, optimizada para tareas de imagen a SVG. Los detalles técnicos completos se remiten al paper arXiv:2603.13032.

## Capacidades

- Parsing de documentos multilingües con rendimiento declarado como estado del arte entre modelos de tamaño comparable.
- Reconocimiento de texto (OCR) en documentos, incluyendo escaneos antiguos y texto pequeño en documentos largos.
- Análisis de layout: columnas múltiples, cabeceras y pies de página.
- Reconocimiento y estructuración de tablas.
- Reconocimiento de fórmulas matemáticas.
- Conversión de gráficos estructurados (diagramas, interfaces de usuario, figuras científicas) a código SVG.
- Grounding: localización de elementos en la imagen.
- Comprensión semántica del contenido del documento.
- Diálogo interactivo sobre la imagen o el documento.
- Soporte multilingüe (inglés, chino y otros idiomas).
- No se especifica en la información disponible soporte de tool calling ni de razonamiento multi-paso con agentes.

## Casos de uso

- Digitalización de archivos históricos: el modelo obtiene resultados altos en la categoría "Old scans" de olmOCR-bench, lo que lo hace adecuado para procesar escaneos antiguos y documentos deteriorados en pipelines de digitalización masiva.
- Extracción de tablas de informes financieros: su capacidad de reconocimiento de tablas permite convertir tablas de PDF e imágenes en estructuras de datos procesables para análisis posterior.
- Conversión de papers científicos a Markdown/estructurado: con buen rendimiento en la categoría ArXiv y reconocimiento de fórmulas, sirve para transformar publicaciones académicas en texto estructurado con fórmulas preservadas.
- Reconstrucción de interfaces de usuario a código: la capacidad de convertir layouts de UI a SVG facilita flujos de diseño-a-código, generando representaciones vectoriales a partir de capturas o mockups.
- Procesamiento de documentos multilingües: al soportar inglés, chino y otros idiomas, encaja en sistemas de gestión documental de organizaciones con contenido en varios idiomas.
- Extracción de figuras y gráficos científicos: la conversión de charts y figuras a SVG permite reutilizar y editar gráficos de publicaciones en herramientas vectoriales.
- Atención al cliente o asistentes sobre documentos: su capacidad de diálogo interactivo permite construir asistentes que respondan preguntas sobre el contenido de una imagen o documento cargado.

## Benchmarks y rendimiento

Puntuaciones Elo en benchmarks de parsing documental (evaluación realizada con Gemini 3 Flash según el autor):

| Modelo | olmOCR-Bench | OmniDocBench (v1.5) | XDocParse | Media |
|---|---|---|---|---|
| MonkeyOCR-pro-3B | 895,0 | 811,3 | 637,1 | 781,1 |
| GLM-OCR | 884,2 | 972,6 | 820,7 | 892,5 |
| PaddleOCR-VL-1.5 | 897,3 | 997,9 | 866,4 | 920,5 |
| HuanyuanOCR | 997,6 | 1003,9 | 951,1 | 984,2 |
| dots.ocr | 1041,1 | 1027,2 | 1190,3 | 1086,2 |
| **dots.mocr** | **1104,4** | **1059,0** | **1210,7** | **1124,7** |
| Gemini 3 Pro | 1180,4 | 1128,0 | 1323,7 | 1210,7 |

Resultados en olmOCR-bench (porcentaje de acierto):

| Modelo | ArXiv | Old scans math | Tables | Old scans | Headers & footers | Multi column | Long tiny text | Base | Overall |
|---|---|---|---|---|---|---|---|---|---|
| Mistral OCR API | 77,2 | 67,5 | 60,6 | 29,3 | 93,6 | 71,3 | 77,1 | 99,4 | 72,0±1,1 |
| Marker 1.10.1 | 83,8 | 66,8 | 72,9 | 33,5 | 86,6 | 80,0 | 85,7 | 99,3 | 76,1±1,1 |
| MinerU 2.5.4* | 76,6 | 54,6 | 84,9 | 33,7 | 96,6 | 78,2 | 83,5 | 93,7 | 75,2±1,1 |
| DeepSeek-OCR | 77,2 | 73,6 | 80,2 | 33,3 | 96,1 | 66,4 | 79,4 | 99,8 | 75,7±1,0 |
| Nanonets-OCR2-3B | 75,4 | 46,1 | 86,8 | 40,9 | 32,1 | 81,9 | 93,0 | 99,6 | 69,5±1,1 |
| PaddleOCR-VL* | 85,7 | 71,0 | 84,1 | 37,8 | 97,0 | 79,9 | 85,7 | 98,5 | 80,0±1,0 |

En la información disponible no se incluyen los resultados de dots.mocr desglosados en olmOCR-bench, solo la comparativa Elo agregada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Con 3B parámetros y pesos safetensors de aproximadamente 6,1 GB, la inferencia en precisión nativa requiere del orden de 8-12 GB de VRAM, aunque esta cifra es una estimación y no un dato del autor.
- GPU recomendadas: no disponible en la información proporcionada.
- Encaje en GPU de consumo: no confirmado por el autor; por tamaño, un modelo de 3B es candidato a ejecutarse en GPUs de consumo con suficiente VRAM, pero no hay datos oficiales.
- Opciones de despliegue: la model card indica carga mediante Transformers con código personalizado (librería `dots_mocr`). No se especifican integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Licencia | Contexto | Elo medio (parsing) | Disponibilidad |
|---|---|---|---|---|---|
| dots.mocr | 3,04B | MIT | no disponible | 1124,7 | Pesos abiertos en Hugging Face |
| dots.ocr | no disponible | no disponible | no disponible | 1086,2 | Pesos abiertos |
| PaddleOCR-VL-1.5 | no disponible | no disponible | no disponible | 920,5 | API / local según el autor |
| GLM-OCR | no disponible | no disponible | no disponible | 892,5 | API |
| Gemini 3 Pro | no disponible | propietaria | no disponible | 1210,7 | API propietaria |

En la comparativa Elo, dots.mocr supera a todos los modelos abiertos listados y se sitúa por debajo de Gemini 3 Pro. Frente a soluciones propietarias como Mistral OCR API, el modelo ofrece pesos abiertos bajo MIT, aunque la comparación directa de rendimiento entre ambos no está disponible en la misma tabla.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos; al ser un modelo entrenado con datos multilingües, es previsible que herede sesgos de esos corpus, pero no hay información oficial al respecto.
- Riesgo de alucinación: como modelo generativo de imagen a texto, puede producir contenido no presente en la imagen, especialmente en documentos con texto pequeño o de baja calidad; no se cuantifica este riesgo en la información disponible.
- No se especifica la longitud de contexto, lo que dificulta planificar el procesamiento de documentos muy extensos o de muchas páginas en una sola pasada.
- El soporte de idiomas declarado se limita a inglés, chino y "multilingüe" sin detallar qué idiomas adicionales están cubiertos ni con qué calidad.
- La licencia MIT permite uso comercial, pero conviene verificar las condiciones de los datos de entrenamiento y de los componentes de código personalizado incluidos.
- El modelo requiere código personalizado (`custom_code`) para cargarse en Transformers, lo que puede complicar la integración en stacks de despliegue estándar y la compatibilidad con versiones futuras de la librería.
- No hay datos publicados sobre cuantizaciones soportadas, lo que limita la planificación de despliegues con menor huella de memoria.

## Enlaces

- Hugging Face: https://huggingface.co/dots-studio/dots.mocr
- Hugging Face (rednote-hilab): https://huggingface.co/rednote-hilab/dots.mocr
- Variante SVG: https://huggingface.co/rednote-hilab/dots.mocr-svg
- Paper: https://arxiv.org/abs/2603.13032v1
- Repositorio GitHub: https://github.com/rednote-hilab/dots.mocr
- Demo en vivo: https://dotsocr.xiaohongshu.com
- Prompt de evaluación Elo: https://github.com/rednote-hilab/dots.mocr/blob/master/tools/elo_score_prompt.py
- OCR Arena: https://www.ocrarena.ai/battle
- X (Twitter): https://x.com/rednotehilab

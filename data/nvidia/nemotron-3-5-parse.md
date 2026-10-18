# nvidia/Nemotron-3.5-Parse

## Resumen
Nemotron 3.5 Parse es un modelo de NVIDIA especializado en el análisis de imágenes de documentos: convierte páginas escaneadas o renderizadas en texto estructurado con clases semánticas de maquetación, bounding boxes y orden de lectura. No es un VLM de propósito general, sino un parser de documentos con OCR, pensado para inteligencia documental, RAG, extracción de datos y curación de datasets multimodales. Integra un encoder visual C-RADIOv4-SO400M y un decoder mBART de 10 capas que consume la secuencia visual como prefijo causal.

El modelo tiene 630.800.504 parámetros (630,8 millones), un tokenizador multilingüe de 72.505 entradas y admite imágenes RGB de hasta 1664 x 2048 píxeles como resolución máxima recomendada. Se distribuye con licencia OpenMDW 1.1, que la model card describe como apta para uso comercial y no comercial, y está disponible en Hugging Face desde el 17/10/2026. Su interés actual reside en que ofrece salida estructurada a nivel de página con un modelo relativamente pequeño, lo que facilita su integración en pipelines de digitalización, indexación y revisión humana.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | VLM transformer: encoder visual C-RADIOv4-SO400M (`vit_so400m_patch16_224`) + adaptador de convoluciones 1D y normalización + decoder mBART causal de 10 capas con GQA de 16 cabezas query y 8 key/value |
| Parámetros totales | 630.800.504 (630,8 millones), incluida la cabeza MTP; embeddings compartidos contados una vez |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible; no se especifica un límite textual. El decoder consume una secuencia visual dinámica como prefijo causal |
| Tipos de cuantización | No disponible; no se documentan formatos de cuantización en la información proporcionada |
| Idiomas soportados | Multilingüe; no se publica la lista completa. Tokenizador de 72.505 entradas y evaluaciones en 10 idiomas en IndicVisionBench y 163 entradas idioma/escritura en MOSCAR |
| Licencia | OpenMDW 1.1; tokenizador bajo MIT con atribución |
| Formato de pesos | `safetensors`; librería Transformers con `custom_code`; repositorio de 5,1 GB |
| Resolución de entrada recomendada | 1664 x 2048 (ancho x alto), imagen RGB de 3 canales |
| Entrada / salida | Imagen + prompt de texto / texto estructurado con clases, bounding boxes y orden de lectura |
| Cabeza auxiliar | Cabeza MTP entrenada de un paso, incluida en `model.safetensors`; usada por el plugin de vLLM para decodificación especulativa de un token |

## Arquitectura y entrenamiento
La arquitectura combina un encoder visual C-RADIOv4-SO400M con preprocesamiento rectangular dinámico NaViT, un adaptador de convoluciones 1D y normalización que comprime la secuencia latente visual, y un decoder mBART causal de 10 capas. La atención del decoder usa 16 cabezas query y 8 cabezas key/value, es decir, atención con consultas agrupadas. El tokenizador tiene 72.505 entradas, con tokens multilingües y de control como `<predict_bbox>`, `<predict_classes>`, `<predict_text_in_pic>` y `<class_Chart>`; la matriz de embeddings del decoder se rellena hasta 72.512 filas. La salida emplea coordenadas normalizadas al contenido y está orientada a la extracción de maquetación, texto y regiones gráficas.

La información disponible no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO. Sí se documenta una cabeza auxiliar de predicción multi-token de un paso, entrenada e incluida en el checkpoint: Transformers utiliza el decoder normal para generar, mientras que el plugin de vLLM habilita esa cabeza para decodificación especulativa de un token. Los resultados de ParseBench se obtuvieron con triple pasada y unión de regiones sobre 2.078 páginas únicas.

## Capacidades
- Parseo de documentos a texto estructurado con clases semánticas de maquetación, bounding boxes y orden de lectura.
- OCR sobre imágenes RGB de páginas escaneadas o renderizadas, incluyendo texto incrustado en imágenes mediante el token `<predict_text_in_pic>`.
- Extracción de tablas, gráficos y contenido mixto; el token `<class_Chart>` habilita salida con tratamiento específico de gráficos.
- Localización de regiones mediante el token `<predict_bbox>` y clasificación semántica mediante `<predict_classes>`.
- Procesamiento de PDFs escaneados, presentaciones, formularios, informes, tablas y páginas con contenido mixto.
- Capacidad multilingüe basada en un tokenizador de 72.505 entradas; evaluada en 10 idiomas en IndicVisionBench y en 163 entradas idioma/escritura en MOSCAR.
- Salida adecuada para indexación, recuperación, analítica, extracción de datos y creación de datos de entrenamiento.
- Soporte de tool calling o function calling: no documentado.
- Soporte de agentes o razonamiento multi-paso: no documentado; el modelo está orientado a tareas de parsing a nivel de página.
- Generación general de código, matemáticas o conversación abierta: no documentada; no es el objetivo del modelo.
- Vision: sí, imágenes RGB. Audio y vídeo: no documentados.

## Casos de uso
- Digitalización de archivos PDF escaneados: procesar cada página como imagen RGB y obtener texto, clases de maquetación y bounding boxes para construir índices de búsqueda. Es adecuado porque su salida conserva el orden de lectura y permite reconstruir la estructura del documento.
- RAG documental: dividir secciones, tablas y bloques mediante las clases semánticas y las coordenadas para generar fragmentos con metadatos de maquetación antes de enviarlos a un índice vectorial. La ventaja frente a un OCR plano es que permite filtrar por tipo de región y mantener contexto espacial.
- Extracción de datos en formularios y facturas: usar prompts compuestos con `<predict_bbox>`, `<predict_classes>` y `<predict_text_in_pic>` para localizar campos, etiquetas y texto incrustado. Las coordenadas permiten construir una interfaz de revisión humana con superposición sobre la página original.
- Análisis de tablas y gráficos en informes: extraer tablas y regiones gráficas mediante `<class_Chart>` para alimentar hojas de cálculo, paneles analíticos o procesos de validación. Los benchmarks publicados incluyen métricas específicas de tablas y gráficos, lo que permite acotar expectativas por tipo de contenido.
- Curación de datasets multimodales: convertir presentaciones, informes y PDFs en texto estructurado para crear datos de entrenamiento o evaluación. El tamaño de 630,8 millones de parámetros facilita el procesamiento por lotes en comparación con VLMs de mayor escala.
- Digitalización multilingüe de colecciones mixtas: aplicar OCR y parsing sobre documentos en varios idiomas gracias al tokenizador multilingüe y a las evaluaciones en 10 idiomas y 163 entradas idioma/escritura. Requiere validación por idioma y tipo de documento antes de producción.
- Revisión humano-en-el-bucle: mostrar bounding boxes y clases semánticas sobre la imagen para que un operador valide o corrija la extracción. La salida estructurada y las coordenadas normalizadas simplifican la integración en herramientas de anotación.
- Automatización de presentaciones y reportes internos: extraer títulos, bloques de texto, tablas y gráficos con orden de lectura para generar resúmenes, índices o bases de conocimiento corporativas.

## Benchmarks y rendimiento
| Benchmark | Métrica | Resultado | Detalle |
|---|---|---:|---|
| ParseBench | Media | 75,20 | Triple pasada con unión de regiones sobre 2.078 páginas únicas |
| ParseBench | Tablas | 84,67 | Métrica específica de tablas |
| ParseBench | Gráficos | 64,40 | Métrica específica de gráficos |
| ParseBench | Fidelidad de contenido | 87,96 | Métrica de fidelidad del contenido extraído |
| ParseBench | Formato semántico | 68,28 | Métrica de formato semántico |
| ParseBench | Visual Grounding | 70,67 | Métrica de anclaje visual |
| IndicVisionBench OCR | ANLS-char | 83,73 | 876 páginas de test en 10 idiomas |
| MOSCAR | Character bag F1 | 99,51 | 8.111 páginas sintéticas simples, 163 entradas idioma/escritura |

Los resultados de MOSCAR proceden de renderizados sintéticos simples y no garantizan precisión en documentos escaneados complejos, escritura manual, imágenes degradadas u otras variaciones del mundo real. La métrica character bag F1 mide solapamiento de caracteres sin considerar su orden. No se proporcionan resultados de modelos alternativos en la información disponible, por lo que no se incluyen comparaciones cuantitativas inventadas.

## Requisitos de hardware
| Concepto | Estimación |
|---|---|
| Pesos en BF16/FP16 | Aproximadamente 1,26 GB (2 bytes por parámetro) |
| Pesos en FP32 | Aproximadamente 2,52 GB |
| Pesos en INT8 | Aproximadamente 0,63 GB, cálculo teórico |
| Pesos en INT4 | Aproximadamente 0,32 GB, cálculo teórico |

- VRAM estimada: no hay cifra oficial. Los pesos en BF16 ocupan alrededor de 1,26 GB, pero el uso real depende de las activaciones del encoder visual y del número de tokens visuales. Para una página a resolución moderada se estima que una GPU de 12 GB puede ser suficiente; para 1664 x 2048 y lotes se recomienda validar con 24 GB o más.
- GPU recomendadas: A100 o H100 para servir en lote y alto rendimiento; RTX 4090 o RTX 3090 de 24 GB para máxima resolución; RTX 4080 de 16 GB y RTX 3060/4070 de 12 GB para pruebas de una sola página. No son requisitos oficiales del fabricante.
- ¿Cabe en GPU de consumo? Previsiblemente sí, en GPUs de 12 GB o más, siempre que se ajuste la resolución y el tamaño de lote. A la resolución máxima recomendada conviene disponer de 24 GB para tener margen.
- Opciones de despliegue: Transformers con `custom_code` es la vía documentada; existe un plugin de vLLM que habilita la cabeza MTP para decodificación especulativa de un token. No se confirma soporte en llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput: no disponibles. Dependen de la resolución de imagen, el número de páginas, el tamaño de lote y el backend. La decodificación especulativa de un token en vLLM puede reducir el coste de decodificación, pero no se publican cifras.

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Nemotron 3.5 Parse | 630,8 M | No disponible | ParseBench 75,20; IndicVisionBench OCR 83,73 ANLS-char; MOSCAR 99,51 character bag F1 | OpenMDW 1.1 | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han proporcionado datos de modelos alternativos de la misma categoría, como otros parsers de documentos o VLMs especializados en OCR. Por tanto, no es posible comparar parámetros, contexto, rendimiento o licencia sin inventar cifras.

## Limitaciones y advertencias
- El modelo está especializado en parsing de documentos; no es un chatbot general ni un modelo de conversación abierta.
- Riesgo de omisión, sustitución o alucinación de texto y coordenadas, especialmente en imágenes degradadas, escritura manual o maquetaciones complejas.
- Los resultados de MOSCAR usan páginas sintéticas simples y no garantizan exactitud en documentos reales escaneados. La métrica character bag F1 no tiene en cuenta el orden de los caracteres.
- No se publica la lista completa de idiomas soportados. Las evaluaciones cubren 10 idiomas en IndicVisionBench y 163 entradas idioma/escritura en MOSCAR, pero el rendimiento puede variar por idioma y script.
- No se especifica una longitud máxima de contexto textual. El modelo procesa páginas o secuencias visuales; no se documenta razonamiento entre múltiples páginas ni agregación de documentos completos.
- La licencia OpenMDW 1.1 permite, según la model card, uso comercial y no comercial, pero deben revisarse los términos completos. El tokenizador tiene licencia MIT con atribución y el pipeline de ParseBench tiene su propia licencia.
- La cabeza MTP no se usa en Transformers; solo el plugin de vLLM la habilita para decodificación especulativa. El comportamiento puede diferir entre backends.
- No se documentan evaluaciones de sesgo, guardrails de seguridad ni filtros de contenido.
- En producción con documentos confidenciales deben revisarse el despliegue, la retención de imágenes y el tratamiento de datos personales.
- No se documenta soporte de tool calling, function calling, agentes autónomos ni razonamiento multi-paso.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/nvidia/Nemotron-3.5-Parse
- Resultados de ParseBench: https://huggingface.co/nvidia/Nemotron-3.5-Parse#parsebench
- Resultados de IndicVisionBench OCR: https://huggingface.co/nvidia/Nemotron-3.5-Parse#indicvisionbench-ocr
- Resultados de MOSCAR: https://huggingface.co/nvidia/Nemotron-3.5-Parse#moscar-multilingual-ocr
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Atribución del tokenizador: https://huggingface.co/nvidia/Nemotron-3.5-Parse/blob/main/TOKENIZER_ATTRIBUTION.md
- Avisos de terceros: https://huggingface.co/nvidia/Nemotron-3.5-Parse/blob/main/THIRD_PARTY_NOTICES.md
- Documentación de mBART en Transformers: https://huggingface.co/docs/transformers/en/model_doc/mbart
- Encoder C-RADIOv4-SO400M: https://huggingface.co/nvidia/C-RADIOv4-SO400M
- Pipeline de ParseBench en el repositorio: https://huggingface.co/nvidia/Nemotron-3.5-Parse/tree/main/reference/parsebench/pipeline
- Métricas de validación de ParseBench: https://huggingface.co/nvidia/Nemotron-3.5-Parse/blob/main/reference/parsebench/pipeline/validation_metrics.json
- No se han encontrado papers, blogs o demos específicos adicionales en la búsqueda web proporcionada.

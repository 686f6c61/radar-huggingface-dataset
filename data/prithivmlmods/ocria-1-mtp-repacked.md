# prithivMLmods/OCRia-1-MTP-Repacked

## Resumen

OCRia-1-MTP-Repacked es un reempaquetado de los pesos BF16 de OCRia-1, un modelo de visión-lenguaje de 4B parámetros desarrollado por LlamaIndex sobre la base de Qwen3.5-4B. Su propósito es el parseo de documentos de una sola página directamente a partir de imágenes, sin necesidad de motores OCR externos ni de capas de texto subyacentes, transcribiendo el contenido a Markdown estructurado. Este repositorio concreto, publicado por prithivMLmods, incorpora el soporte de MTP (multi-token prediction) para decodificación especulativa en Transformers.

El modelo resuelve el problema de la conversión de documentos complejos a formatos estructurados: tablas con celdas combinadas (`colspan`/`rowspan`), gráficos de líneas y barras, diagramas, fórmulas matemáticas, escritura manual y elementos de formato fino (tachados, subrayados, resaltados, casillas, marcas de agua). Todo ello se emite como HTML, bloques Mermaid o LaTeX según corresponda. Según la model card, ocupa el primer puesto entre los modelos de pesos abiertos en ParseBench 2 (85,24 global sobre 4.317 páginas) y ParseBench 1 (84,65 global sobre 2.078 páginas).

La relevancia actual del modelo radica en su especialización: no es un VLM generalista, sino un parser de documentos de alta fidelidad con un tamaño contenido (5.295 millones de parámetros reales en safetensors) que cabe en GPUs de consumo con cuantización adecuada. Su licencia es personalizada y restrictiva para uso comercial en organizaciones grandes, lo que condiciona su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (base Qwen3.5-4B) con MTP para decodificación especulativa |
| Parametros totales | 5.295.564.288 (5,3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 en este repo (10,6 GB); GGUF con soporte MTP disponible en repo separado |
| Idiomas soportados | en (inglés) |
| Licencia | ocria-1-license (licencia personalizada de OCRia-1) |
| Formato de pesos | safetensors (BF16, archivo único sin sharding) |

## Arquitectura y entrenamiento

OCRia-1 se construye sobre Qwen3.5-4B, un transformer denso de 4B parámetros, al que se añade un codificador visual para el procesamiento de imágenes de página. El modelo se entrena para producir Markdown estructurado a partir de la imagen, sin pipeline OCR intermedio. El proceso de entrenamiento descrito en la model card combina tres fases: ajuste supervisado (SFT) sobre 100.979 páginas reales y sintéticas, aprendizaje por refuerzo GRPO con recompensas verificables específicas por dimensión (tablas, gráficos, fórmulas, etc.) y promediado de checkpoints.

La innovación técnica de este repositorio concreto es el reempaquetado MTP (multi-token prediction), que habilita decodificación especulativa en Transformers y en text-generation-inference, acelerando la generación. El modelo incorpora además una función opcional de grounding visual post-hoc (`ocria_grounding`) para localizar regiones del documento. Los pesos se distribuyen en BF16 sin optimizar, pensados para vLLM, Transformers y Ollama.

## Capacidades

- Parseo de documentos de una sola página a Markdown estructurado directamente desde imagen.
- Conversión de tablas multi-nivel y con celdas combinadas (`colspan`/`rowspan`) a elementos HTML `<table>`.
- Conversión de gráficos de líneas y barras a tablas HTML.
- Conversión de diagramas a bloques Mermaid.
- Transcripción de fórmulas matemáticas y escritura manual a LaTeX.
- Representación de formato fino mediante etiquetas semánticas: tachado, subrayado, resaltado, casillas de verificación, elementos de página y marcas de agua.
- Grounding visual opcional post-hoc mediante `ocria_grounding`.
- Decodificación especulativa habilitada por MTP (en este reempaquetado).
- Capacidad conversacional (pipeline image-text-to-text).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas a inglés según la metadata del modelo.
- Capacidades de audio: no disponibles.

## Casos de uso

- Digitalización de facturas y albaranes: el modelo convierte la imagen de la página en Markdown con tablas HTML, preservando celdas combinadas y totales, lo que permite extraer datos estructurados sin OCR previo ni capas de texto.
- Procesamiento de informes financieros con gráficos: al transformar gráficos de barras y líneas en tablas HTML, facilita la extracción de series de datos para su análisis posterior en pipelines de BI.
- Conversión de documentación técnica con diagramas: los diagramas se emiten como bloques Mermaid, lo que permite versionar y renderizar la documentación directamente en repositorios Markdown.
- Extracción de fórmulas científicas: la transcripción a LaTeX de ecuaciones y escritura manual resulta adecuada para digitalizar apuntes, papers escaneados o pizarras.
- Archivado y búsqueda documental: al generar Markdown limpio y estructurado, el texto resultante se indexa mejor en motores de búsqueda y sistemas RAG que el texto de un OCR convencional.
- Automatización de formularios y checklists: la representación de casillas y elementos de página como etiquetas semánticas permite reconstruir formularios rellenados y verificar su estado.
- Procesamiento por lotes en pipelines de ingesta: con decodificación especulativa MTP y despliegue en vLLM, el modelo puede procesar grandes volúmenes de páginas con mayor throughput que la generación estándar.

## Benchmarks y rendimiento

| Benchmark | Resultado | Detalle |
|---|---|---|
| ParseBench 2 | 85,24 global | Sobre 4.317 páginas; primer modelo de pesos abiertos |
| ParseBench 1 | 84,65 global | Sobre 2.078 páginas |
| ParseBench 1 (charts) | 82,47 | Subpuntuación de gráficos |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparativas numéricas directas con otros modelos en estos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 11-12 GB solo para pesos, más overhead de activaciones y del codificador visual; se recomienda un mínimo de 16 GB.
- VRAM estimada en cuantización GGUF Q8: en torno a 6-7 GB; en Q4: en torno a 3-4 GB (estimaciones según el tamaño de parámetros, no confirmadas en la model card).
- GPU recomendadas: A100 o H100 para despliegues de alto throughput; RTX 4090 (24 GB) para BF16 en una sola GPU; RTX 3090 (24 GB) igualmente viable.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en BF16; en GPUs de 8-12 GB requiere cuantización GGUF.
- Opciones de despliegue: vLLM, Transformers, Ollama y text-generation-inference (TGI) según la model card; GGUF con MTP en repositorio separado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OCRia-1-MTP-Repacked | 5,3B | no disponible | Parseo de documentos a Markdown | ocria-1-license (restringida) | Hugging Face (este repo) |
| OCRia-1 (original) | 4B (según model card) | no disponible | Parseo de documentos a Markdown | ocria-1-license | Hugging Face (llamaindex/OCRia-1) |
| Qwen3.5-4B | 4B | no disponible | VLM generalista base | Apache 2.0 | Hugging Face (Qwen/Qwen3.5-4B) |

No se dispone en la información proporcionada de datos de rendimiento comparativo con otros parsers de documentos de pesos abiertos, por lo que la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia restrictiva: la ocria-1-license es gratuita para investigación, uso personal y organizaciones no competidoras con menos de 2 millones de dólares de ingresos y financiación anuales; el uso comercial fuera de ese umbral requiere licencia adicional.
- Idioma: el modelo solo declara soporte de inglés, lo que limita su uso en documentos en castellano u otros idiomas.
- Alcance de página única: está diseñado para parseo de una sola página, no para documentos multipágina completos en una sola pasada.
- Riesgo de alucinación en la transcripción: como modelo generativo, puede inventar o alterar contenido en tablas densas, fórmulas o gráficos, por lo que se recomienda validación en producción.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de contexto: la longitud de contexto no se especifica en la model card.
- Este repositorio es un reempaquetado de terceros (prithivMLmods) de los pesos de LlamaIndex; la responsabilidad de la calidad de los pesos originales recae en el autor del modelo base.
- El modelo base Qwen3.5-4B está bajo Apache 2.0, pero la licencia final del modelo derivado es la ocria-1-license, más restrictiva.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/prithivMLmods/OCRia-1-MTP-Repacked
- Modelo base OCRia-1: https://huggingface.co/llamaindex/OCRia-1
- Licencia OCRia-1: https://huggingface.co/llamaindex/OCRia-1/blob/main/LICENSE
- GGUF con soporte MTP: https://huggingface.co/prithivMLmods/OCRia-1-GGUF
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia Apache 2.0 de Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE

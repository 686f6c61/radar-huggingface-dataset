# prithivMLmods/chandra-ocr-2-GGUF

## Resumen

Chandra-OCR-2 es un modelo de visión-lenguaje especializado en reconocimiento óptico de caracteres (OCR) y extracción de estructura documental, desarrollado por Datalab y distribuido en formato GGUF por el usuario prithivMLmods. Convierte imágenes y PDFs en Markdown, HTML o JSON preservando la disposición espacial del documento original, e incorpora mejoras sustanciales frente a Chandra 1 en reconstrucción de tablas complejas, ecuaciones matemáticas, escritura manuscrita, elementos de formulario y maquetación de documentos anchos.

El modelo cuenta con aproximadamente 4.841 millones de parámetros (4,84 B) y está construido sobre una arquitectura Qwen3.5, según indican las etiquetas del repositorio. La versión empaquetada aquí es una conversión a GGUF pensada para inferencia local con llama.cpp, con un abanico de cuantizaciones que va desde Q2_K (2,12 GB) hasta BF16/F16 (9,7 GB), además de ficheros de proyección multimodal (mmproj) independientes para el codificador visual.

Su relevancia actual radica en que ofrece capacidades OCR de nivel SOTA (85,9 % en olmocr, 77,8 % en score multilingüe) en un paquete que cabe en GPUs de consumo y en máquinas con RAM moderada, lo que facilita integrar pipelines de digitalización documental sin depender de APIs externas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5, según etiquetas del repo); codificador visual + proyección multimodal (mmproj) |
| Parametros totales | 4.841.450.496 (≈4,84 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible de forma oficial; el ejemplo de llama.cpp usa `-c 16384` |
| Tipos de cuantizacion | BF16, F16, Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_K_S, Q4_K_M, Q5_0, Q5_K_S, Q5_K_M, Q6_K, Q8_0; mmproj en BF16, F16 y Q8_0 |
| Idiomas soportados | 90+ idiomas según la model card; el campo `language` del repo declara solo `en` |
| Licencia | openrail (enlace a la licencia del modelo base) |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

Chandra-OCR-2 es un modelo de imagen-a-texto (pipeline `image-text-to-text`) que combina un codificador visual con un modelo de lenguaje de la familia Qwen3.5 de aproximadamente 4,84 B de parámetros. La distribución GGUF separa explícitamente el proyector multimodal en ficheros `mmproj` (BF16, F16 o Q8_0), lo que permite cuantizar el LLM y el adaptador visual de forma independiente y cargar vision en llama.cpp mediante el flag `--mmproj`.

La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. Sí se documentan las mejoras funcionales respecto a Chandra 1: mejor parsing de ecuaciones matemáticas, reconstrucción de tablas con celdas combinadas, reconocimiento de escritura manuscrita, detección de elementos de formulario (casillas de verificación), manejo de maquetaciones de documento ancho y extracción de diagramas y pies de figura. No se comercializa una versión MTP con decodificación especulativa en este repo; el autor enlaza una versión aparte (`chandra-ocr-2-MTP-Repacked`).

## Capacidades

- OCR de imágenes y PDFs con salida en Markdown, HTML o JSON estructurado.
- Preservación de layout: orden de lectura, columnas, tablas, listas, encabezados y disposición espacial.
- Reconstrucción de tablas complejas, incluidas celdas combinadas.
- Parsing de ecuaciones matemáticas y fórmulas.
- Reconocimiento de escritura manuscrita.
- Detección de elementos de formulario, como casillas de verificación.
- Procesamiento de documentos anchos y maquetaciones no estándar.
- Extracción de diagramas y generación de pies de figura (image captioning mejorado).
- Cobertura multilingüe de más de 90 idiomas según la model card.
- Inferencia local con llama.cpp (`llama-cli`) y compatibilidad declarada con Transformers, vLLM y text-generation-inference.
- No se documenta soporte explícito de tool calling ni de razonamiento multi-paso orientado a agentes.

## Casos de uso

- Digitalización de facturas y albaranes: el modelo extrae tablas con celdas combinadas y las devuelve en JSON, lo que permite alimentar directamente un ERP o un pipeline de contabilidad sin post-procesado manual de la estructura.
- Procesamiento de artículos científicos: convierte PDFs con ecuaciones y figuras a Markdown listo para ingestión en bases de conocimiento o RAG, preservando fórmulas y pies de figura.
- Archivística y patrimonio documental: reconocimiento de manuscritos y escaneos históricos en varios idiomas, con salida estructurada que facilita la indexación y búsqueda posterior.
- Automatización de formularios: detección de casillas de verificación y campos en formularios administrativos o multilingües, útil en procesos de onboarding KYC o gestión pública.
- Extracción de datos de informes financieros: los filings suelen tener tablas densas y maquetaciones anchas; el modelo reconstruye esas tablas y las entrega en formato tabular consumible por herramientas de análisis.
- Despliegue en el borde o en equipos sin GPU dedicada: con la cuantización Q4_K_M (3,07 GB) el modelo cabe en portátiles con 8 GB de RAM y permite OCR local sin enviar documentos sensibles a servicios externos.
- Generación de documentación accesible: conversión de PDFs escaneados a HTML semántico para lectores de pantalla o publicación web.

## Benchmarks y rendimiento

| Benchmark | Chandra-OCR-2 | Referencia |
|---|---|---|
| olmocr | 85,9 % | no disponible para comparativas |
| Score multilingüe | 77,8 % (+12 % sobre Chandra 1) | Chandra 1: ~65,8 % (inferido del incremento indicado) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generalistas; el modelo está orientado a OCR y no se comparan cifras de latencia o throughput.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización: Q2_K ≈ 2,1 GB; Q3_K_M ≈ 2,5 GB; Q4_K_M ≈ 3,1 GB (recomendada); Q5_K_M ≈ 3,5 GB; Q6_K ≈ 4,0 GB; Q8_0 ≈ 5,2 GB; BF16/F16 ≈ 9,7 GB. Hay que sumar el fichero `mmproj` (367 MB en Q8_0, 676 MB en BF16/F16).
- GPU recomendadas: RTX 4090, RTX 3090, A100 o H100 para máximo throughput; cualquier GPU con ≥6 GB de VRAM puede ejecutar Q4_K_M con margen.
- Cabe en GPU de consumo: sí. Una RTX 3060 de 12 GB o una RTX 4060 Ti de 8 GB ejecutan las cuantizaciones Q4–Q5 con visión activada; en 4 GB solo entran Q2_K o Q3_K_S.
- Opciones de despliegue: llama.cpp (`llama-cli` con `--mmproj`), Ollama (importando el GGUF), vLLM y Transformers con los pesos originales del modelo base, y text-generation-inference según las etiquetas del repo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chandra-ocr-2-GGUF | ≈4,84 B | no disponible (ejemplo con 16k) | OCR + layout a Markdown/HTML/JSON | openrail | GGUF en HF, base en safetensors |
| Chandra 1 (datalab-to) | no disponible | no disponible | OCR + layout | openrail (presumible, misma familia) | HF |
| olmOCR (AllenAI) | no disponible | no disponible | OCR de PDFs a Markdown | no disponible | HF |
| Qwen2.5-VL (Alibaba) | 3 B / 7 B / 72 B | 32k–128k según variante | Visión-lenguaje generalista | Apache 2.0 / Qwen license | HF, GGUF, vLLM |

La comparación cuantitativa con olmOCR y Qwen2.5-VL no está disponible en la información proporcionada; los datos de benchmark publicados solo cubren la comparación con Chandra 1.

## Limitaciones y advertencias

- El campo `language` del repositorio declara únicamente `en`, pese a que la model card afirma cobertura de más de 90 idiomas; conviene validar el rendimiento real en idiomas distintos del inglés antes de producción.
- No se documentan sesgos específicos; al ser un modelo entrenado sobre documentos, puede heredar sesgos de los corpus utilizados (predominio de ciertos formatos, tipografías o lenguajes administrativos).
- Riesgo de alucinación en tablas y cifras: como todo modelo generativo, puede inventar celdas, valores o texto que no aparecen en la imagen, especialmente en escaneos de baja calidad. Se recomienda validación cruzada en dominios críticos (finanzas, legal, salud).
- La licencia OpenRAIL impone restricciones de uso (uso responsable y prohibición de aplicaciones dañinas); es necesario revisar el texto completo de la licencia del modelo base antes de un uso comercial.
- El contexto máximo no está documentado oficialmente; el ejemplo de llama.cpp emplea 16.384 tokens, por lo que documentos muy largos requieren paginación o chunking.
- No se anuncia soporte de tool calling ni de flujos agénticos; el modelo está optimizado para una tarea concreta (OCR estructurado) y no como LLM generalista.
- La decodificación especulativa (MTP) no está incluida en este repo; hay que recurrir al repo `chandra-ocr-2-MTP-Repacked` si se necesita.
- El tamaño del repo (59,9 GB) incluye todas las cuantizaciones; descargar solo el fichero GGUF y el mmproj necesarios.

## Enlaces

- Repositorio GGUF: https://huggingface.co/prithivMLmods/chandra-ocr-2-GGUF
- Modelo base: https://huggingface.co/datalab-to/chandra-ocr-2
- Licencia del modelo base: https://huggingface.co/datalab-to/chandra-ocr-2/blob/main/LICENSE
- Versión MTP (decodificación especulativa): https://huggingface.co/prithivMLmods/chandra-ocr-2-MTP-Repacked
- llama.cpp: https://github.com/ggml-org/llama.cpp

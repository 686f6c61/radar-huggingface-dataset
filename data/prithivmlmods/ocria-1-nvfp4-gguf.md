# prithivMLmods/OCRia-1-NVFP4-GGUF

## Resumen

OCRia-1-NVFP4-GGUF es una compilación cuantizada en formato GGUF del modelo OCRia-1 de LlamaIndex, un modelo multimodal de 4.962.050.544 parámetros (aproximadamente 5B) especializado en el parseo de documentos a partir de imágenes de página. El modelo original parte de Qwen3.5-4B y ha sido entrenado para convertir documentos complejos en Markdown estructurado, incluyendo tablas y gráficos como HTML, diagramas como Mermaid y expresiones matemáticas y escritura manual como LaTeX, sin necesidad de motores OCR externos ni capas de texto.

Esta versión concreta, publicada por prithivMLmods, aplica cuantización NVFP4 mediante GPTQ sobre los pesos originales, generando un archivo GGUF de 4,81 GB más un proyector multimodal (`mmproj`) de 676 MB. Está optimizada para aceleradores NVIDIA Blackwell (RTX Pro 6000, serie RTX 50, B200, B300) que disponen de Tensor Cores FP4 nativos, e incorpora decodificación especulativa MTP (Multi-Token Prediction) integrada en los propios pesos.

La relevancia de esta ficha radica en que ofrece una vía de despliegue local de un modelo de parseo documental de alto rendimiento con un consumo de VRAM muy contenido (5,57 GiB en la prueba del autor) y velocidades de generación de 329,96 tokens/s en hardware Blackwell. El modelo original se posiciona como el mejor modelo de pesos abiertos en ParseBench 2 (85,24) y ParseBench 1 (84,65), si bien estas cifras corresponden al modelo original y no han sido verificadas de forma independiente sobre esta compilación NVFP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Qwen3.5-4B, con cabezas MTP para decodificación especulativa |
| Parametros totales | 4.962.050.544 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (configuración de prueba documentada); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | NVFP4 (GPTQ, con calibración), proyector multimodal en mmproj; pesos en float8_e4m3fn para componentes auxiliares |
| Idiomas soportados | en (inglés) |
| Licencia | ocria-1-license (OCRia-1 Model and Code License, licencia personalizada "other") |
| Formato de pesos | GGUF (NVFP4) + mmproj GGUF |

## Arquitectura y entrenamiento

El modelo base OCRia-1 es un transformer multimodal construido sobre Qwen3.5-4B, diseñado para recibir imágenes de página y emitir Markdown estructurado. El entrenamiento original se realizó sobre 100.979 páginas reales y sintéticas, combinando SFT (supervised fine-tuning), aprendizaje por refuerzo GRPO y promediado de checkpoints. La salida cubre tablas y gráficos en HTML, diagramas en Mermaid y fórmulas matemáticas y escritura manual en LaTeX.

Esta compilación concreta aplica cuantización NVFP4 con GPTQ, donde la calibración GPTQ estabiliza y optimiza la compresión FP4 para preservar la precisión cercana a los pesos de precisión completa. Además, integra decodificación especulativa MTP directamente en los pesos: en lugar de requerir un modelo "draft" separado, el GGUF incluye cabezas de predicción de múltiples tokens futuros en una sola pasada, lo que acelera la inferencia local. El despliegue documentado usa `llama-cli` con offloading completo a GPU, proyector multimodal y razonamiento desactivado (`--reasoning off`).

## Capacidades

- Parseo de documentos a Markdown estructurado directamente desde imágenes de página, sin OCR externo ni capa de texto.
- Conversión de tablas y gráficos a HTML.
- Conversión de diagramas a Mermaid.
- Conversión de expresiones matemáticas y escritura manual a LaTeX.
- Procesamiento multimodal image-text-to-text mediante proyector `mmproj`.
- Decodificación especulativa MTP integrada (aceleración de inferencia local).
- Modo de razonamiento desactivable (`--reasoning off`) para respuestas directas de parseo.
- Soporte de inferencia vía llama.cpp / llama-cli y compatibilidad declarada con text-generation-inference y vLLM (etiquetas del repositorio).
- Capacidades conversacionales básicas según las etiquetas del repositorio.
- Soporte multilingüe limitado al inglés.

## Casos de uso

- Digitalización de facturas y albaranes: el modelo recibe la imagen de la página y devuelve Markdown con las tablas convertidas a HTML, lo que permite extraer líneas de detalle y totales sin desplegar un motor OCR separado.
- Procesamiento de artículos científicos: convierte páginas con fórmulas y figuras en Markdown con expresiones LaTeX y tablas HTML, facilitando la indexación en bases de conocimiento.
- Extracción de diagramas técnicos: transforma diagramas de arquitectura o flujo en sintaxis Mermaid reutilizable en documentación y wikis.
- Pipeline de ingesta documental con LlamaIndex: al estar etiquetado para LlamaIndex, encaja en flujos de carga y fragmentación de documentos para RAG sobre PDFs escaneados.
- Archivado de documentación histórica manuscrita: la conversión de escritura manual a LaTeX permite preservar contenido de formularios y notas en formato estructurado.
- Despliegue en estación de trabajo con GPU Blackwell: con 5,57 GiB de VRAM pico y 329,96 tokens/s de generación, es viable procesar lotes de páginas en local en una RTX Pro 6000 o RTX 50-series sin infraestructura en la nube.
- Automatización de informes financieros: la conversión de gráficos y tablas a HTML permite alimentar sistemas de análisis que consumen HTML estructurado en lugar de imágenes.

## Benchmarks y rendimiento

Los resultados de ParseBench corresponden al modelo original OCRia-1, no a esta compilación NVFP4, y no han sido verificados de forma independiente sobre esta build según la propia model card.

| Benchmark | OCRia-1 (original) | OCRia-1-NVFP4-GGUF |
|---|---|---|
| ParseBench 2 | 85,24 | no verificado |
| ParseBench 1 | 84,65 | no verificado |

Métricas de inferencia documentadas por el autor (RTX PRO 6000 Blackwell Server Edition, 96 GB VRAM, `llama-cli`, `-ngl 99`, contexto 8.192, KV cache bf16, MTP `draft_n_max=2`, razonamiento off, 3 ejecuciones):

| Métrica | Valor |
|---|---|
| Velocidad media de procesamiento de prompt | 1.643,16 tokens/s |
| Velocidad media de generación | 329,96 tokens/s |
| Tiempo total de pared | 14,6 s |
| VRAM pico | 5,57 GiB |
| Utilización de GPU pico | 80% |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,5-6 GiB con el GGUF NVFP4 (4,81 GB) más el proyector multimodal (676 MB), según la medición de 5,57 GiB de VRAM pico del autor.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell, serie RTX 50, B200 y B300, por sus Tensor Cores FP4 nativos (SM120/GB202). El formato NVFP4 está pensado para estas arquitecturas.
- GPU de consumo: cabe en GPUs consumer con al menos 8 GB de VRAM, aunque la aceleración FP4 nativa requiere arquitecturas Blackwell; en otras GPU el rendimiento será inferior y puede requerir descompresión o soporte parcial.
- Opciones de despliegue: llama.cpp / llama-cli (documentado), con etiquetas de compatibilidad para text-generation-inference, vLLM y LlamaIndex. Requiere `--mmproj` para las capacidades de visión.
- Latencia y throughput: 329,96 tokens/s de generación y 1.643,16 tokens/s de prompt en la configuración de prueba indicada; el autor advierte que el rendimiento varía según prompt, resolución de imagen, build de software y ajustes de ejecución.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OCRia-1-NVFP4-GGUF | 4.962.050.544 | 8.192 (config. de prueba) | Parseo documental multimodal, GGUF NVFP4 | ocria-1-license | Hugging Face |
| OCRia-1 (original) | no disponible en la información | no disponible | Parseo documental multimodal, precisión completa | ocria-1-license | Hugging Face (llamaindex/OCRia-1) |
| OCRia-1-NVFP4 | no disponible en la información | no disponible | Parseo documental multimodal, pesos NVFP4 (no GGUF) | ocria-1-license | Hugging Face (prithivMLmods/OCRia-1-NVFP4) |

No se dispone en la información proporcionada de datos de benchmarks ni especificaciones de modelos alternativos de otros autores para una comparación cuantitativa.

## Limitaciones y advertencias

- Los benchmarks ParseBench 2 (85,24) y ParseBench 1 (84,65) pertenecen al modelo original y no han sido verificados de forma independiente sobre esta compilación NVFP4; la cuantización puede degradar la precisión.
- El modelo solo declara soporte de inglés (`en`), lo que limita su uso con documentación en castellano u otros idiomas.
- El contexto documentado en la prueba es de 8.192 tokens; documentos de página muy densa o con salidas largas pueden exceder ese límite.
- El formato NVFP4 está optimizado para hardware NVIDIA Blackwell; en GPU no Blackwell el rendimiento y la compatibilidad pueden verse reducidos.
- La licencia es personalizada (`ocria-1-license`, "other"), por lo que es necesario revisar los términos del archivo LICENSE del modelo base antes de un uso comercial.
- Riesgo de alucinación inherente a los modelos generativos: el Markdown generado puede contener texto, tablas o fórmulas inexistentes en la imagen original, especialmente con imágenes de baja calidad.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta, lo que indica una validación comunitaria muy limitada.
- La decodificación especulativa MTP requiere soporte específico en el runtime (parámetros `--spec-type draft-mtp` y `--spec-draft-n-max`); sin él, se pierde la aceleración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/prithivMLmods/OCRia-1-NVFP4-GGUF
- Modelo base: https://huggingface.co/llamaindex/OCRia-1
- Licencia del modelo base: https://huggingface.co/llamaindex/OCRia-1/blob/main/LICENSE
- Pesos NVFP4 sin GGUF: https://huggingface.co/prithivMLmods/OCRia-1-NVFP4
- Archivo GGUF NVFP4: https://huggingface.co/prithivMLmods/OCRia-1-NVFP4-GGUF/blob/main/OCRia-1-NVFP4.gguf
- Proyector multimodal: https://huggingface.co/prithivMLmods/OCRia-1-NVFP4-GGUF/blob/main/OCRia-1.mmproj.gguf

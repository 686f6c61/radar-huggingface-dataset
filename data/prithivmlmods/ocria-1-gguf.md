# prithivMLmods/OCRia-1-GGUF

## Resumen

OCRia-1 es un modelo de visión-lenguaje de 4B parámetros desarrollado por LlamaIndex sobre la base de Qwen3.5-4B, diseñado específicamente para el parseo de documentos de una sola página directamente a partir de imágenes, sin necesidad de motores OCR externos ni capas de texto. El modelo transcribe documentos complejos a Markdown estructurado, convirtiendo tablas con celdas combinadas en elementos HTML, gráficos en tablas, diagramas en bloques Mermaid y matemáticas o escritura manual en LaTeX.

La versión aquí descrita, OCRia-1-GGUF, es una cuantización publicada por prithivMLmods que empaqueta los pesos en formato GGUF con soporte de decodificación especulativa mediante Multi-Token Prediction (MTP) integrada en los propios pesos. Esto permite acelerar la inferencia local sin necesidad de un modelo borrador separado, algo relevante para despliegues en hardware de consumo.

El modelo resulta relevante porque se posiciona como el mejor modelo de pesos abiertos en ParseBench 2 (85,24 global sobre 4.317 páginas) y ParseBench 1 (84,65 global sobre 2.078 páginas), lo que lo convierte en una opción atractiva para pipelines de extracción documental que necesitan alta fidelidad estructural sin depender de servicios propietarios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) sobre Qwen3.5-4B, con MTP para decodificación especulativa |
| Parámetros totales | 4.962.050.048 (~4,96B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens (según prueba documentada) |
| Tipos de cuantización | BF16, Q2_K, Q3_K_L, Q3_K_M, Q4_0, Q4_K_M, Q4_K_S, Q5_0, Q5_K_M, Q5_K_S, Q6_K, Q8_0; proyector multimodal en BF16 y Q8_0 |
| Idiomas soportados | Inglés (en) |
| Licencia | OCRia-1 Model and Code License (gratuita para investigación, uso personal y organizaciones no competidoras con ingresos y financiación anuales inferiores a 2M USD) |
| Formato de pesos | GGUF (con ficheros mmproj separados para la torre de visión); pesos BF16 originales en safetensors |

## Arquitectura y entrenamiento

OCRia-1 se construye sobre Qwen3.5-4B, un transformer multimodal que combina una torre de visión con un decodificador de lenguaje. La innovación principal de esta variante GGUF es la integración de Multi-Token Prediction (MTP), que añade cabezas de salida adicionales dentro de la arquitectura principal para predecir varios tokens futuros en un solo paso forward. Esto habilita decodificación especulativa sin modelo borrador externo, acelerando la inferencia local de forma significativa.

El entrenamiento del modelo base se realizó sobre 100.979 páginas reales y sintéticas mediante supervisión fina (SFT), seguido de aprendizaje por refuerzo GRPO con recompensas verificables específicas por dimensión, y promediado de checkpoints. El objetivo es la transcripción de alta fidelidad de documentos a Markdown estructurado, cubriendo tablas multinivel y con celdas combinadas, gráficos, diagramas, fórmulas matemáticas, escritura manual y formato fino (tachado, subrayado, resaltados, casillas de verificación, elementos de página y marcas de agua).

## Capacidades

- Parseo de documentos de una sola página a Markdown estructurado directamente desde imagen, sin OCR externo.
- Conversión de tablas multinivel y con celdas combinadas (`colspan`/`rowspan`) a elementos HTML `<table>`.
- Conversión de gráficos y plots a tablas HTML.
- Conversión de diagramas a bloques Mermaid.
- Transcripción de fórmulas matemáticas y escritura manual a LaTeX.
- Representación de formato fino mediante etiquetas semánticas: tachado, subrayados, resaltados, casillas de verificación, elementos de página y marcas de agua.
- Grounding visual opcional a posteriori mediante `ocria_grounding`.
- Soporte de decodificación especulativa MTP integrada en los pesos.
- Capacidad conversacional y multimodal (image-text-to-text).
- Compatible con endpoints y con `text-generation-inference`.

## Casos de uso

- Digitalización de facturas y albaranes: el modelo convierte imágenes de documentos contables en Markdown con tablas HTML, preservando la estructura de celdas combinadas necesaria para extraer importes y conceptos de forma fiable.
- Extracción de tablas financieras de informes anuales: al mapear tablas multinivel a `<table>`, permite posteriormente parsear los datos con librerías estándar y alimentar bases de datos o hojas de cálculo.
- Conversión de documentación técnica con diagramas: los diagramas se traducen a bloques Mermaid, lo que facilita su versionado en repositorios Git y su renderizado en wikis o documentación interna.
- Procesamiento de artículos científicos: las fórmulas y la escritura matemática se transcriben a LaTeX, lo que permite reutilizar el contenido en publicaciones o entornos de composición científica.
- Archivado y búsqueda de documentos escaneados: al generar Markdown estructurado con etiquetas semánticas, el texto resultante es indexable por motores de búsqueda o sistemas RAG.
- Digitalización de formularios y cuestionarios: la detección de casillas de verificación y elementos de página permite reconstruir formularios rellenados a mano en formato estructurado.
- Despliegue en local para privacidad de datos: gracias a las cuantizaciones GGUF (desde 2,23 GB en Q2_K hasta 9,94 GB en BF16), puede ejecutarse en estaciones de trabajo sin enviar documentos sensibles a servicios en la nube.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| ParseBench 2 | 85,24 global (4.317 páginas) | Mejor modelo de pesos abiertos |
| ParseBench 1 | 84,65 global (2.078 páginas) | Mejor modelo de pesos abiertos |
| ParseBench 1 (charts) | 82,47 | Subcategoría de gráficos |

Rendimiento de inferencia documentado con `OCRia-1.Q8_0.gguf` y proyector `mmproj-bf16` en NVIDIA RTX PRO 6000 Blackwell (96 GB VRAM), con `llama-cli`, offload completo a GPU y decodificación especulativa MTP:

| Métrica | Valor |
|---|---|
| Velocidad media de procesamiento de prompt | 1.863,07 tokens/s |
| Velocidad media de generación | 335,73 tokens/s |
| Tiempo total | 19,8 segundos |
| Longitud de contexto | 16.384 tokens |

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización: Q2_K ~2,23 GB; Q3_K_M ~2,63 GB; Q4_K_M ~3,17 GB; Q5_K_M ~3,62 GB; Q6_K ~4,08 GB; Q8_0 ~5,29 GB; BF16 ~9,94 GB. Añadir entre 367 MB (mmproj Q8_0) y 676 MB (mmproj BF16) para la torre de visión.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell (probada con 96 GB), A100, H100 para despliegues de alta concurrencia; RTX 4090 y RTX 3090 para uso individual.
- Cabe en GPU de consumo: sí, desde GPUs con 6-8 GB de VRAM en cuantizaciones Q4/Q5, y con 12 GB o más para Q8_0 con margen para contexto.
- Opciones de despliegue: `llama.cpp` (`llama-cli`), Ollama, vLLM, Transformers, text-generation-inference.
- Latencia y throughput: 335,73 tokens/s de generación y 1.863,07 tokens/s de procesamiento de prompt en RTX PRO 6000 con Q8_0 y MTP; en GPUs de consumo se espera un throughput menor no cuantificado en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | ParseBench | Licencia | Formato |
|---|---|---|---|---|---|
| OCRia-1 (este) | ~4,96B | 16.384 | 85,24 (PB2) / 84,65 (PB1) | OCRia-1 License (uso comercial restringido) | GGUF, safetensors |
| Modelos OCR/VLM de pesos abiertos comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone en la información proporcionada de datos de benchmarks ni especificaciones de modelos alternativos directamente comparables; la model card solo indica que OCRia-1 lidera ParseBench entre modelos de pesos abiertos, sin detallar los competidores.

## Limitaciones y advertencias

- Solo soporta inglés; no se documenta cobertura multilingüe.
- Diseñado para parseo de una sola página; no se indica soporte para documentos multipágina en una sola pasada.
- Riesgo de alucinación inherente a los modelos generativos: puede inventar contenido en documentos de baja calidad, manuscritos ilegibles o layouts atípicos.
- La licencia OCRia-1 Model and Code License restringe el uso comercial: solo es gratuita para investigación, uso personal y organizaciones no competidoras con ingresos y financiación anuales inferiores a 2M USD.
- El contexto documentado es de 16.384 tokens; documentos muy densos pueden truncarse.
- El rendimiento medido corresponde a hardware de gama alta (RTX PRO 6000); en GPUs de consumo el throughput será considerablemente menor.
- Requiere seguir el mensaje de sistema de `prompt.txt` sin texto de usuario y con el modo thinking desactivado para un funcionamiento óptimo.
- El repo GGUF tiene 0 descargas y 1 like en el momento de la consulta, por lo que la validación comunitaria es mínima.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/prithivMLmods/OCRia-1-GGUF
- Modelo base original: https://huggingface.co/llamaindex/OCRia-1
- Pesos BF16 MTP reempaquetados: https://huggingface.co/prithivMLmods/OCRia-1-MTP-Repacked
- Licencia: https://huggingface.co/llamaindex/OCRia-1/blob/main/LICENSE
- Prompt de sistema recomendado: https://huggingface.co/llamaindex/OCRia-1/blob/main/prompt.txt

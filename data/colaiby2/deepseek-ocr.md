# colaiby2/DeepSeek-OCR

## Resumen

DeepSeek-OCR es un modelo de visión-lenguaje especializado en extracción de texto a partir de imágenes, desarrollado originalmente por DeepSeek AI y distribuido en este repositorio por el usuario colaiby2. Su propuesta central, descrita en el paper "DeepSeek-OCR: Contexts Optical Compression" (arXiv:2510.18234), es explorar los límites de la compresión de texto visual: en lugar de procesar documentos como secuencias de tokens de texto, el modelo los "lee" como imágenes y los reconstruye, lo que permite reducir drásticamente el coste computacional asociado al contexto en tareas de document understanding.

El modelo emplea la arquitectura `deepseek_vl_v2`, un transformer multimodal con un encoder visual seguido de un decoder de lenguaje, con un total de 3.336.106.240 parámetros (aproximadamente 3,3 mil millones) según los pesos en safetensors. Está pensado para tareas de OCR, conversión de documentos a Markdown, extracción estructurada y grounding visual, con soporte multilingüe declarado.

Es relevante ahora porque propone un enfoque alternativo al OCR clásico y a los VLM generalistas: comprimir la información textual de un documento en representaciones visuales para reducir el número de tokens necesarios en el contexto, lo que abre la puerta a procesar documentos largos con ventanas de contexto más pequeñas y menor latencia. La licencia MIT facilita su uso comercial y su integración en pipelines de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | deepseek_vl_v2 (vision-language transformer, encoder visual + decoder de lenguaje) |
| Parametros totales | 3.336.106.240 (~3,3 mil millones) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | multilingüe (sin listado detallado) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo de 6,7 GB) |

## Arquitectura y entrenamiento

El modelo sigue la familia `deepseek_vl_v2`, una arquitectura de visión-lenguaje que combina un encoder de imágenes con un decoder de lenguaje autorregresivo. La innovación principal documentada en el paper es la "compresión óptica de contextos": el modelo procesa el documento como una imagen y genera la transcripción textual, de modo que un gran bloque de texto puede representarse mediante un número reducido de tokens visuales. El pipeline de inferencia expone parámetros de resolución (`base_size`, `image_size`) y un modo `crop_mode` que permiten distintos regímenes de procesamiento (Tiny, Small, Base, Large y Gundam), lo que sugiere un mecanismo de parcheo adaptativo de la imagen según la resolución y el recorte.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo se distribuye con `trust_remote_code=True` y requiere `flash-attention 2` para su ejecución en transformers, lo que indica dependencia de código personalizado para el encoder visual y el procesamiento multimodal. El modo `test_compress` en la API de inferencia apunta a la funcionalidad de compresión de contexto que da nombre al paper.

## Capacidades

- OCR de texto libre: extracción de texto a partir de imágenes mediante el prompt `Free OCR.`
- Conversión de documentos a Markdown: prompt `<|grounding|>Convert the document to markdown.`, orientado a preservar estructura (tablas, encabezados).
- Grounding visual: el token especial `<|grounding|>` sugiere capacidad de localizar regiones del documento.
- Procesamiento multimodal imagen-texto: pipeline `image-text-to-text` con entrada de imagen y salida de texto.
- Soporte multilingüe declarado, sin listado explícito de idiomas.
- Procesamiento por niveles de resolución: modos Tiny (512), Small (640), Base (1024), Large (1280) y Gundam (1024 con recorte), lo que permite ajustar calidad frente a coste.
- Procesamiento de PDFs por lotes mediante integración con vLLM (según el repositorio oficial de GitHub).
- Decodificación con procesador de logits N-gram (`NGramPerReqLogitsProcessor`) para suprimir repeticiones en tablas, con whitelist de tokens `<td>` y `</td>`.
- No se documenta soporte explícito de tool calling, agentes o modos de razonamiento extendido en la información disponible.

## Casos de uso

- Digitalización masiva de documentos escaneados: el modelo convierte imágenes de páginas en texto o Markdown, adecuado para pipelines de archivo y gestión documental gracias a su licencia MIT y a la posibilidad de ejecutarse con vLLM en lote.
- Extracción de tablas financieras: el prompt de conversión a Markdown junto con el procesador N-gram y la whitelist de etiquetas `<td>` están diseñados específicamente para preservar la estructura tabular, útil en informes contables y estados financieros.
- Procesamiento de facturas y albaranes: la combinación de OCR libre y conversión estructurada permite alimentar sistemas de contabilidad con datos extraídos de documentos físicos.
- Ingesta de PDFs para RAG: el repositorio oficial menciona procesamiento de PDFs con vLLM; el modelo puede convertir documentos a Markdown para indexarlos en bases vectoriales, con la ventaja de comprimir el contexto visual.
- Accesibilidad: transcripción de documentos impresos a texto digital para lectores de pantalla y sistemas de asistencia.
- Archivística y preservación digital: conversión de fondos documentales históricos a texto buscable, aprovechando los distintos modos de resolución para adaptarse a calidades de escaneo variables (desde Tiny para documentos nítidos hasta Large para originales de baja calidad).
- Análisis de documentos con grounding: localización de regiones específicas en la página para tareas de verificación o anotación, usando el token `<|grounding|>`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper referenciado (arXiv:2510.18234) probablemente contiene evaluaciones, pero no se incluyen cifras en el material proporcionado, por lo que no se presentan números.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,3 mil millones de parámetros en bfloat16, los pesos ocupan aproximadamente 6,7 GB; sumando activaciones y caché de atención para imágenes de alta resolución, se recomienda un mínimo de 12-16 GB de VRAM.
- GPU recomendadas: A100, H100 o L40S para producción con vLLM y procesamiento por lotes; RTX 4090 (24 GB) para desarrollo e inferencia individual.
- Cabe en GPU de consumo: sí, en RTX 3090, RTX 4090 y GPUs con 16 GB o más, siempre que se use `flash-attention 2` y se ajuste la resolución de imagen.
- Opciones de despliegue: transformers (con `trust_remote_code=True` y `flash-attn==2.7.3`), vLLM (soporte oficial en upstream desde el 23/10/2025, con build nightly hasta v0.11.1). No se documenta soporte de llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles. El modo de resolución y `crop_mode` influyen directamente en el coste, por lo que conviene medirlos en el hardware objetivo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-OCR | ~3,3 mil M | no disponible | VLM especializado en OCR y compresión óptica de contexto | MIT | Hugging Face, vLLM |
| GOT-OCR2.0 | no disponible en la información | no disponible | OCR multimodal | no disponible | GitHub (referenciado como inspiración) |
| MinerU | no disponible en la información | no disponible | Extracción de documentos y PDFs | no disponible | GitHub (referenciado) |
| PaddleOCR | no disponible en la información | no disponible | OCR clásico basado en detección + reconocimiento | no disponible | GitHub (referenciado) |

Los modelos comparables citados (GOT-OCR2.0, MinerU, PaddleOCR) aparecen como agradecimientos en la model card, no como benchmarks directos. No se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- El repositorio `colaiby2/DeepSeek-OCR` es una redistribución no oficial (39 descargas, 0 likes); para producción conviene usar el repositorio oficial `deepseek-ai/DeepSeek-OCR`.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; auditar antes de desplegar en entornos sensibles.
- Dependencia de `flash-attention 2` y de versiones concretas de `transformers` (4.46.3) y `torch` (2.6.0), lo que puede complicar la reproducibilidad.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluación de robustez en la información disponible.
- El rendimiento en idiomas distintos del inglés y el chino no está cuantificado; el soporte "multilingual" es una declaración sin listado.
- La longitud de contexto no está especificada; el enfoque de compresión óptica sugiere que el contexto efectivo depende de la resolución de imagen y del modo elegido.
- La licencia MIT permite uso comercial, pero al ser una redistribución conviene verificar la procedencia y los términos del modelo original.
- El modelo está especializado en OCR y conversión de documentos; no debe emplearse como modelo de propósito general para razonamiento o generación libre.

## Enlaces

- Repositorio Hugging Face (redistribución): https://huggingface.co/colaiby2/DeepSeek-OCR
- Repositorio oficial en Hugging Face: https://huggingface.co/deepseek-ai/DeepSeek-OCR
- Paper en arXiv: https://arxiv.org/abs/2510.18234
- Página del paper en Hugging Face: https://huggingface.co/papers/2510.18234
- Repositorio GitHub oficial: https://github.com/deepseek-ai/DeepSeek-OCR
- PDF del paper (GitHub): https://github.com/deepseek-ai/DeepSeek-OCR/blob/main/DeepSeek_OCR_paper.pdf
- Receta de vLLM para DeepSeek-OCR: https://docs.vllm.ai/projects/recipes/en/latest/DeepSeek/DeepSeek-OCR.html
- Web de DeepSeek: https://www.deepseek.com/
- Discord de DeepSeek AI: https://discord.gg/Tc7c45Zzu5
- Twitter de DeepSeek AI: https://twitter.com/deepseek_ai
- Vary (modelo referenciado): https://github.com/Ucas-HaoranWei/Vary/
- GOT-OCR2.0 (modelo referenciado): https://github.com/Ucas-HaoranWei/GOT-OCR2.0/
- MinerU (herramienta referenciada): https://github.com/opendatalab/MinerU
- PaddleOCR (herramienta referenciada): https://github.com/PaddlePaddle/PaddleOCR
- OneChart (proyecto referenciado): https://github.com/LingyvKong/OneChart
- Slow Perception (proyecto referenciado): https://github.com/Ucas-HaoranWei/Slow-Perception

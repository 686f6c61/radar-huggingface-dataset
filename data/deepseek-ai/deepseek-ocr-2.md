# deepseek-ai/DeepSeek-OCR-2

## Resumen
DeepSeek-OCR 2 es un modelo de visión-lenguaje especializado en reconocimiento óptico de caracteres (OCR) y comprensión de documentos, desarrollado por DeepSeek AI. Se trata de la segunda iteración de DeepSeek-OCR, publicada en enero de 2026 bajo licencia Apache 2.0. Con 3.389.119.360 parámetros (≈3,39 B), el modelo está diseñado para convertir imágenes de documentos y PDFs en texto estructurado, incluyendo la conversión a Markdown con soporte de grounding. Su relevancia actual radica en su capacidad para procesar documentos multilingües con resolución dinámica, lo que permite manejar desde capturas simples hasta páginas complejas con múltiples columnas y tablas.

El modelo se distribuye a través de HuggingFace con la librería transformers y requiere el uso de código remoto (trust_remote_code=True). Soporta resolución dinámica con un máximo de (0-6)×144 + 256 tokens visuales, y ofrece dos modos principales de prompt: uno para OCR libre y otro para conversión a Markdown con detección de diseño. Su licencia permisiva y su tamaño relativamente compacto lo hacen adecuado para despliegues en producción, aunque los detalles sobre entrenamiento, benchmarks y requisitos de hardware no están disponibles en la información proporcionada.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (etiqueta deepseek_vl_v2) |
| Parámetros totales | 3.389.119.360 (≈3,39 B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en bfloat16, safetensors) |
| Idiomas soportados | Multilingüe (idiomas específicos no detallados) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
No se proporcionan detalles sobre el entrenamiento en la información disponible. La etiqueta deepseek_vl_v2 indica que el modelo se basa en la arquitectura DeepSeek-VL2, un transformer de visión-lenguaje. El título del paper asociado, "Visual Causal Flow", sugiere una innovación en el flujo causal visual, pero no se describe en la model card. El modelo emplea resolución dinámica, procesando imágenes con una base de hasta (0-6)×768×768 más una imagen de 1024×1024, lo que genera entre 256 y 1120 tokens visuales ((0-6)×144 + 256). Esto permite adaptarse a documentos de distintos tamaños y relaciones de aspecto sin redimensionar agresivamente.

No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se utilizaron técnicas de RLHF o DPO. La model card únicamente menciona los prompts de inferencia y los modos de soporte, sin detallar la fase de entrenamiento.

## Capacidades
- Reconocimiento óptico de caracteres (OCR) en imágenes y PDFs.
- Conversión de documentos a Markdown con detección de diseño (layout) mediante el prompt `<|grounding|>Convert the document to markdown.`
- OCR libre sin análisis de diseño mediante el prompt `<image>\nFree OCR.`
- Resolución dinámica que ajusta el número de tokens visuales según el tamaño del documento.
- Soporte multilingüe (idiomas específicos no detallados).
- Extracción de características (feature-extraction) según las etiquetas del modelo.
- Procesamiento de PDFs (mencionado en la sección de vLLM del model card).
- No se especifica soporte de tool calling, function calling ni agentes en la información disponible.

## Casos de uso
- Digitalización de archivos y bibliotecas: el modelo puede convertir documentos escaneados y PDFs a Markdown estructurado, preservando tablas y columnas gracias a su resolución dinámica y modo grounding.
- Extracción de datos de facturas y recibos: con OCR libre o conversión a Markdown, se pueden extraer campos como fechas, importes y direcciones para automatizar la contabilidad.
- Procesamiento de literatura científica: conversión de papers en PDF a Markdown para facilitar la búsqueda y el análisis de texto, incluyendo ecuaciones y referencias.
- Integración en pipelines de RAG (generación aumentada por recuperación): el modelo extrae texto de documentos multilingües para alimentar bases de conocimiento vectoriales.
- Automatización de atención al cliente: digitalización de formularios y documentos enviados por usuarios para su procesamiento automático en sistemas de tickets.
- Accesibilidad: conversión de documentos a texto plano o Markdown para lectores de pantalla y herramientas de síntesis de voz.
- Archivos históricos multilingües: OCR de documentos antiguos en varios idiomas gracias al soporte multilingüe, aunque no se detallan los idiomas específicos.
- Procesamiento de documentos legales: extracción de cláusulas y estructuras de contratos para su análisis automatizado.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La etiqueta "eval-results" en HuggingFace indica que existen evaluaciones, pero no se proporcionan cifras en la model card ni en la búsqueda web. Por tanto, no se puede presentar una tabla comparativa con MMLU, HumanEval, GSM8K u otros.

## Requisitos de hardware
- No se proporcionan requisitos oficiales de VRAM. Con 3.389.119.360 parámetros en bfloat16, los pesos ocupan aproximadamente 6,8 GB. Se estima que se necesita al menos 12 GB de VRAM para inferencia con comodidad, considerando activaciones y overhead.
- GPU recomendadas: no especificadas. Por el tamaño, se estima que puede ejecutarse en GPUs consumer como RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 4080 (16 GB) con cuantización adicional. En GPUs de datacenter, A100 (40/80 GB) y H100 (80 GB) son adecuadas.
- ¿Cabe en consumer GPU? Sí, probablemente en GPUs con 12 GB o más de VRAM, aunque no hay confirmación oficial.
- Opciones de despliegue: transformers (con trust_remote_code=True y flash-attn), vLLM (mencionado en la model card para aceleración de inferencia). No se mencionan llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
No se dispone de datos comparativos en la información proporcionada. Los modelos relacionados mencionados en los agradecimientos son DeepSeek-OCR (v1), Vary, GOT-OCR2.0, MinerU y PaddleOCR. A continuación se muestra una tabla con los datos disponibles de cada uno (la mayoría no disponibles):

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DeepSeek-OCR 2 | 3,39 B | no disponible | Apache 2.0 | HuggingFace |
| DeepSeek-OCR (v1) | no disponible | no disponible | no disponible | GitHub |
| GOT-OCR2.0 | no disponible | no disponible | no disponible | GitHub |
| MinerU | no disponible | no disponible | no disponible | GitHub |
| PaddleOCR | no disponible | no disponible | no disponible | GitHub |

## Limitaciones y advertencias
- Sesgos conocidos: no disponible.
- Riesgo de alucinación: como todo modelo de OCR, puede generar texto incorrecto en imágenes de baja calidad, con ruido o caligrafía compleja.
- Limitaciones de contexto: la longitud de contexto de texto no se especifica. El número máximo de tokens visuales es 1120 ((0-6)×144 + 256), lo que limita la cantidad de información que puede procesar de una sola imagen.
- Idiomas: aunque se indica soporte multilingüe, no se detallan los idiomas concretos, lo que puede afectar a la precisión en idiomas minoritarios.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, siempre que se mantenga el aviso de copyright y se indiquen los cambios.
- Requiere trust_remote_code=True, lo que implica ejecutar código personalizado del repositorio; se recomienda revisar el código antes de usarlo en producción.
- Dependencias específicas: torch 2.6.0, transformers 4.46.3, tokenizers 0.20.3, flash-attn 2.7.3, y CUDA 11.8 probado. Otras versiones pueden no ser compatibles.
- No se especifica el rendimiento en tareas de razonamiento o generación de texto general, ya que está especializado en OCR.

## Enlaces
- HuggingFace: https://huggingface.co/deepseek-ai/DeepSeek-OCR-2
- GitHub: https://github.com/deepseek-ai/DeepSeek-OCR-2
- Paper 1 (DeepSeek-OCR): https://arxiv.org/abs/2510.18234
- Paper 2 (DeepSeek-OCR 2): https://arxiv.org/abs/2601.20552
- PDF del paper: https://github.com/deepseek-ai/DeepSeek-OCR-2/blob/main/DeepSeek_OCR2_paper.pdf
- Discord: https://discord.gg/Tc7c45Zzu5
- Twitter: https://twitter.com/deepseek_ai
- Página de DeepSeek: https://www.deepseek.com/
- OmniDocBench: https://github.com/opendatalab/OmniDocBench

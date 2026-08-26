# oklenAI/udm_doc_extract_qwen3.5_2B

## Resumen

El modelo `oklenAI/udm_doc_extract_qwen3.5_2B` es un ajuste fino (fine-tune) del modelo base Qwen3.5-2B de Alibaba, orientado a la extracción de información de documentos. La etiqueta `udm_doc_extract` sugiere que el modelo ha sido entrenado específicamente para tareas de extracción de datos estructurados a partir de documentos, aunque no se dispone de documentación técnica detallada en la model card publicada.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite su uso comercial y modificación sin restricciones significativas. Al estar basado en Qwen3.5, hereda las capacidades multimodales de la familia Qwen3.5, que incluyen procesamiento de texto e imágenes. Sin embargo, la model card del autor no proporciona información sobre el dataset de entrenamiento, la arquitectura exacta, ni los benchmarks de rendimiento específicos del ajuste fino.

A pesar de que el modelo tiene cero descargas y cero likes en HuggingFace, su relevancia radica en la creciente adopción de Qwen3.5 como base para tareas de visión por computadora y procesamiento de documentos. Este ajuste concreto podría ser útil para desarrolladores que buscan un modelo especializado en extracción documental con un tamaño compacto de 2 mil millones de parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (probablemente basada en Qwen3.5-2B, no confirmado) |
| Parámetros totales | 2 mil millones (por el nombre del modelo) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (probablemente safetensors) |

## Arquitectura y entrenamiento

La arquitectura exacta del modelo no está documentada en la model card. Dado el nombre `udm_doc_extract_qwen3.5_2B`, se infiere que se trata de un ajuste fino del modelo base Qwen3.5-2B de Alibaba, que según los resultados de búsqueda es un modelo multimodal capaz de procesar texto e imágenes. La familia Qwen3.5 incluye arquitecturas basadas en transformers con atención multimodal, aunque los detalles específicos (como el uso de visión encoders o mecanismos de atención) no se especifican en la documentación pública.

El autor no ha publicado información sobre el dataset de entrenamiento, el número de tokens utilizados, ni si se aplicaron técnicas de RLHF o DPO durante el ajuste. Tampoco se detallan innovaciones técnicas específicas del modelo. La ausencia de model card con contenido técnico sugiere que el proyecto está en una fase inicial de publicación.

## Capacidades

- Extracción de información de documentos: el nombre del modelo indica que está especializado en tareas de extracción de datos de documentos (probablemente facturas, formularios, contratos, etc.).
- Capacidades multimodales: al basarse en Qwen3.5, el modelo puede procesar texto e imágenes, lo que permite extraer información de documentos escaneados o digitalizados.
- Generación de texto: al ser un LLM, puede generar respuestas textuales coherentes.
- Razonamiento: la familia Qwen3.5 es conocida por buenas capacidades de razonamiento, aunque no hay benchmarks específicos para este ajuste.

No hay información confirmada sobre soporte de tool calling, agentes o multilingüismo específico de este ajuste.

## Casos de uso

- Extracción de datos de facturas: el modelo puede identificar campos clave (número de factura, fecha, importe, proveedor) en documentos facturados, ya sean digitales o escaneados.
- Digitalización de formularios: puede procesar formularios rellenados a mano o impresos y extraer los campos estructurados para su integración en bases de datos.
- Procesamiento de contratos: extracción de cláusulas, fechas y partes involucradas en contratos legales.
- Automatización de back-office: integración en flujos de trabajo que requieren convertir documentos no estructurados en datos estructurados para sistemas de gestión empresarial.
- Clasificación de documentos: aunque no es su función principal, el modelo puede distinguir tipos de documentos y extraer su contenido relevante.
- Análisis de documentos históricos: al ser multimodal, puede procesar documentos antiguos escaneados y extraer información relevante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 2B parámetros, se estima que cabe en GPUs de consumo con cuantización. Con cuantización de 4 bits, podría requerir entre 1,5 y 2 GB de VRAM.
- GPU recomendadas: RTX 3060 (12 GB) o superiores para inferencia con precisión completa; tarjetas con menos VRAM (8 GB) pueden funcionar con cuantización GGUF.
- Compatibilidad con consumer GPU: sí, el tamaño de 2B permite ejecutarlo en GPUs de consumo comunes.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (si el formato de pesos es compatible), TGI (si se convierte a formato adecuado).
- Latencia y throughput: no disponible, pero los modelos de 2B suelen tener latencias de 10-50 ms por token en GPUs modernas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.5-2B | 2B | no disponible | Apache 2.0 | Público |
| oklenAI/udm_doc_extract_qwen3.5_2B | 2B | no disponible | Apache 2.0 | Público |
| Qwen3.5-4B | 4B | no disponible | Apache 2.0 | Público |

No hay información suficiente para comparar rendimiento entre estos modelos, ya que el modelo evaluado no publica benchmarks y los datos de Qwen3.5-2B no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- La model card no contiene información técnica detallada, lo que dificulta evaluar su calidad y fiabilidad.
- No se han publicado datos de entrenamiento, por lo que se desconocen posibles sesgos en la extracción de documentos.
- Riesgo de alucinación: como cualquier LLM, el modelo puede generar información falsa si el documento no está claro o si el contexto es ambiguo.
- No se ha confirmado el soporte multilingüe; el modelo puede estar limitado a ciertos idiomas según el dataset de ajuste.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar el origen del modelo base y posibles restricciones adicionales.
- El modelo tiene cero descargas, lo que sugiere que no ha sido validado por la comunidad.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/oklenAI/udm_doc_extract_qwen3.5_2B
- Modelo base Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Tutorial de uso de Qwen 3.5 para OCR: https://martinalderson.com/posts/how-to-use-qwen-3-5-to-ocr-documents/
- Página de Qwen3.5 en Ollama: https://ollama.com/library/qwen3.5:2b
- Documentación de Unsloth para Qwen3.5: https://unsloth.ai/docs/models/qwen3.5
- Guía de ejecución local de Qwen 3.5: https://www.datacamp.com/tutorial/run-qwen-3-5-locally

# jamieh03/Nanonets-OCR2-3B-4bit-fixed

## Resumen

El modelo jamieh03/Nanonets-OCR2-3B-4bit-fixed es una versión cuantizada a 4 bits del modelo Nanonets-OCR2-3B, desarrollado por Nanonets, una empresa especializada en automatización de documentos y flujos de trabajo empresariales. El modelo original se basa en Qwen2.5-VL-3B-Instruct, un modelo multimodal de 3 mil millones de parámetros que combina un encoder de visión con un decodificador de lenguaje, y ha sido adaptado específicamente para tareas de OCR, extracción de información de documentos, conversión de PDF a Markdown y respuesta visual a preguntas (VQA). Esta versión concreta incluye además un arreglo de compatibilidad para su despliegue en Hugging Face Inference Endpoints, corrigiendo un error de serialización de `text_config`.

La relevancia de esta ficha radica en que ofrece una alternativa ligera y desplegable en entornos de producción con restricciones de VRAM, gracias a su cuantización de 4 bits. El peso total del repositorio es de 3,1 GB, lo que permite ejecutarlo en GPUs de consumo medio. Al estar basado en Qwen2.5-VL, hereda capacidades multilingües y de comprensión de imágenes, aunque la cuantización introduce una ligera pérdida de calidad respecto al modelo original. Es especialmente útil para integrar OCR en pipelines de automatización documental, chatbots de atención al cliente o sistemas de gestión de facturas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL (transformer multimodal con encoder de visión) |
| Parametros totales | 1.151.036.112 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | multilingüe (idiomas específicos no disponibles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (también compatible con MLX) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen2.5-VL-3B-Instruct, una arquitectura multimodal que integra un vision transformer (ViT) con un decodificador de lenguaje basado en transformer. El modelo original de Nanonets fue entrenado mediante fine-tuning sobre el modelo base de Qwen, con un dataset enfocado en OCR, reconocimiento de tablas, fórmulas LaTeX y comprensión de documentos complejos. No se dispone de información detallada sobre el número de tokens de entrenamiento ni sobre el proceso de alineación (RLHF/DPO) en la información disponible.

La versión que se describe aquí ha sido cuantizada a 4-bit mediante la librería mlx-vlm versión 0.3.3, lo que reduce el tamaño del modelo a aproximadamente 1,15 mil millones de parámetros (aunque el repositorio pesa 3,1 GB debido a los metadatos y los safetensors). El autor, jamieh03, ha aplicado además un parche para resolver el error `AttributeError: 'dict' object has no attribute 'to_dict'` que ocurría al desplegar el modelo original en Hugging Face Inference Endpoints con transformers 4.48.0. Esta corrección consiste en garantizar que `text_config` se cargue como un objeto y no como un diccionario.

## Capacidades

- OCR de imágenes y documentos escaneados, incluyendo texto en múltiples idiomas.
- Conversión de PDF a Markdown, manteniendo estructura de tablas, listas y encabezados.
- Extracción de tablas y fórmulas matemáticas en formato LaTeX.
- Visual Question Answering (VQA) sobre imágenes y documentos.
- Comprensión de documentos financieros, facturas, recibos y formularios.
- Soporte de conversación multimodal (imagen + texto) gracias a la base de Qwen2.5-VL-Instruct.
- Capacidades multilingües, heredadas del modelo base, aunque no se especifican los idiomas concretos.

## Casos de uso

- Automatización de cuentas a pagar: el modelo puede extraer automáticamente número de factura, fecha, proveedor y total de facturas escaneadas, integrándose en sistemas de ERP o de gestión de gastos.
- Conversión de documentos legales a Markdown: abogados y equipos de compliance pueden transformar contratos y escrituras en texto estructurado para su análisis posterior, aprovechando la capacidad de pdf2markdown.
- Extracción de datos de formularios manuscritos o impresos: ideal para encuestas, formularios de registro o solicitudes, donde se necesita capturar campos clave.
- Asistente de documentación técnica: el modelo puede responder preguntas sobre diagramas, diagramas de flujo o capturas de pantalla de software, facilitando la documentación técnica.
- Indexación de bibliotecas de imágenes: permite generar descripciones textuales y metadatos de imágenes para su búsqueda y clasificación en bases de datos.
- Integración en pipelines de IA en producción: gracias al arreglo de compatibilidad, se puede desplegar en Hugging Face Inference Endpoints o mediante MLX en hardware Apple, para tareas de OCR en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los datos de rendimiento del modelo original Nanonets-OCR2-3B no se han hecho públicos en la documentación consultada, y esta versión cuantizada no incluye mediciones propias.

## Requisitos de hardware

- VRAM estimada: al ser un modelo cuantizado a 4-bit, se estima que requiere aproximadamente 1,5-2 GB de VRAM para inferencia con contexto corto, aunque el repositorio pesa 3,1 GB (incluye los safetensors completos).
- GPU recomendadas: puede ejecutarse en tarjetas de consumo como NVIDIA GTX 1660 Super (6 GB), RTX 3060 (12 GB) o superiores. En entornos profesionales, una A10G o L4 sería suficiente.
- Compatibilidad con consumer GPU: sí, cabe en GPUs con al menos 4 GB de VRAM si se usa cuantización adicional o se limita el contexto.
- Opciones de despliegue: Hugging Face Inference Endpoints, MLX (para Apple Silicon), vLLM (si se convierte a formato adecuado), Ollama (existe una versión en 8-bit en la comunidad).
- Latencia y throughput: no se dispone de datos medidos; dependerá del hardware y del tamaño de la imagen de entrada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jamieh03/Nanonets-OCR2-3B-4bit-fixed | 1,15 B (cuantizado) | no disponible | 4-bit (MLX) | no disponible | Hugging Face |
| nanonets/Nanonets-OCR2-3B | 3 B | no disponible | original (BF16) | no disponible | Hugging Face |
| Qwen/Qwen2.5-VL-3B-Instruct | 3 B | 32k | original | Apache 2.0 | Hugging Face |

La versión cuantizada reduce el número de parámetros efectivos y el tamaño, pero conserva la arquitectura del modelo base. La licencia del modelo original de Nanonets no está claramente especificada, mientras que Qwen2.5-VL-Instruct es Apache 2.0. No hay datos comparativos de rendimiento entre estas versiones.

## Limitaciones y advertencias

- La licencia del modelo no está especificada, lo que genera incertidumbre sobre su uso comercial y su redistribución. Se recomienda contactar con Nanonets antes de usar el modelo en producción.
- El modelo está cuantizado a 4-bit, lo que puede degradar la calidad del OCR en documentos con baja resolución o fuentes poco comunes.
- No se ha publicado información sobre sesgos o limitaciones lingüísticas específicas; al ser multilingüe, puede presentar un rendimiento desigual en idiomas minoritarios.
- Existe un riesgo de alucinación en la interpretación de documentos ambiguos, especialmente en la extracción de datos numéricos o de tablas complejas.
- El contexto máximo no se ha documentado, por lo que se recomienda probar con documentos largos antes de usar en producción.
- La corrección incluida en esta versión ("fixed") solo aborda un problema de serialización con transformers 4.48.0; no hay garantía de que funcione con versiones posteriores del framework.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jamieh03/Nanonets-OCR2-3B-4bit-fixed
- Modelo original de Nanonets: https://huggingface.co/nanonets/Nanonets-OCR2-3B
- Página de investigación de Nanonets: https://nanonets.com/research/nanonets-ocr-2
- Repositorio de cookbooks de Nanonets-OCR2: https://github.com/NanoNets/Nanonets-OCR2
- Versión en Ollama (8-bit): https://ollama.com/yasserrmd/Nanonets-OCR2-3B

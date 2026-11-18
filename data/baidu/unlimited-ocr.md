# baidu/Unlimited-OCR

## Resumen

Unlimited-OCR es un modelo vision-language desarrollado por Baidu, especializado en el parseo de documentos e imágenes a texto estructurado (OCR de largo alcance). Se presenta como una evolución de DeepSeek-OCR, con el objetivo declarado de dar un paso más allá en el "one-shot long-horizon parsing", es decir, procesar documentos completos de una sola pasada sin fragmentación. El modelo está publicado en Hugging Face bajo licencia MIT y ha acumulado más de 5,6 millones de descargas y 5.020 likes, lo que indica una adopción notable en la comunidad.

Arquitectura y tamaño: se trata de un modelo de 3.336.106.240 parámetros (aproximadamente 3,3 mil millones), distribuidos en un repositorio de 6,8 GB en formato safetensors. La model card no detalla explícitamente la arquitectura interna (transformer denso, MoE o híbrida), pero el pipeline declarado es `image-text-to-text` y requiere `trust_remote_code=True`, lo que sugiere componentes personalizados más allá del transformer estándar. El contexto de generación configurado en los ejemplos de inferencia es de 32.768 tokens (`max_length=32768`).

Su relevancia actual reside en la combinación de tres factores: licencia permisiva (MIT) para uso comercial, soporte de inferencia en vLLM y SGLang (además de Transformers), y capacidad de procesar múltiples páginas o PDFs completos en una sola llamada mediante `infer_multi`. Esto lo posiciona como una alternativa práctica para pipelines de digitalización documental a escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | vision-language con código personalizado (`trust_remote_code`); arquitectura interna no detallada en la model card |
| Parametros totales | 3.336.106.240 (~3,3 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens en generación (`max_length=32768` en los ejemplos); ventana de entrada no especificada |
| Tipos de cuantizacion | no disponible en la model card; pesos publicados en safetensors (bfloat16 recomendado) |
| Idiomas soportados | multilingüe (etiqueta `multilingual`); lista concreta de idiomas no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (repositorio de 6,8 GB) |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna más allá de clasificarlo como modelo vision-language para `image-text-to-text` con código personalizado. Los ejemplos de inferencia revelan un diseño orientado a la resolución adaptativa: el modo `gundam` usa `base_size=1024`, `image_size=640` y `crop_mode=True` para imágenes individuales, mientras que el modo `base` usa `image_size=1024` sin recorte y es el único válido para múltiples páginas o PDFs. Esta separación sugiere un mecanismo de tiles o crops para imágenes de alta resolución.

El modelo se presenta explícitamente como una continuación del trabajo de DeepSeek-OCR ("aiming to push Deepseek-OCR one step further"), lo que sitúa su linaje técnico en la familia de modelos OCR basados en vision-language con compresión de tokens visuales. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal. Sí se documenta el uso de `no_repeat_ngram_size=35` con ventanas de n-gramas de 128 (imagen única) o 1024 (multipágina) para controlar la repetición en salidas largas.

## Capacidades

- Parseo de documentos a texto estructurado: conversión de imágenes de documentos en salida textual, con modos diferenciados para imagen única y multipágina.
- Procesamiento multipágina y de PDFs: la función `infer_multi` acepta listas de imágenes (páginas) y procesa el documento completo en una sola pasada; los PDFs se convierten a imágenes con PyMuPDF antes del parseo.
- Resolución adaptativa: modo `gundam` (crops a 640 px) para imágenes individuales y modo `base` (1024 px) para lotes multipágina.
- Generación de texto largo: configuración de hasta 32.768 tokens de salida, adecuada para documentos extensos.
- Multilingüe: etiqueta `multilingual` en la model card; la lista concreta de idiomas no está disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-step: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): visión (entrada de imagen); no se documentan otras.
- Despliegue en servidores de inferencia: soporte oficial de vLLM (receta y Docker dedicados) y SGLang (rueda local).
- Entrenamiento con ms-swift: soporte añadido el 2026-07-21 para fine-tuning.

## Casos de uso

- Digitalización masiva de archivos PDF: convertir lotes de PDFs escaneados a texto mediante `pdf_to_images` (PyMuPDF a 300 DPI) y `infer_multi`, procesando cada documento completo en una sola llamada. Adecuado por su capacidad multipágina y su contexto de 32.768 tokens.
- Extracción de datos de facturas y formularios: parsear documentos administrativos a texto estructurado para alimentar sistemas de contabilidad o ERP, aprovechando el modo `gundam` con crops para capturar detalles de alta resolución.
- Procesamiento de documentación técnica y manuales: convertir manuales de cientos de páginas a texto indexable para motores de búsqueda internos o bases RAG, usando el modo `base` multipágina.
- Archivo y preservación digital: digitalizar fondos documentales históricos o administrativos con licencia MIT, sin restricciones de uso comercial ni de volumen.
- Pipelines de ingestión documental en producción: desplegar el modelo con vLLM (imágenes Docker `unlimited-ocr` y `unlimited-ocr-cu129` para Hopper) o SGLang para servir la API de OCR a otros servicios internos con throughput controlado.
- Extracción de texto de capturas y documentos en aplicaciones móviles o web: usar el modo `gundam` de imagen única para procesar capturas de pantalla o fotos de documentos con resolución limitada.
- Enriquecimiento de datasets para entrenamiento: usar el modelo como anotador automático de imágenes documentales para generar pares imagen-texto a gran escala, dado su volumen de descargas y su licencia permisiva.
- Investigación en OCR y visión documental: servir como baseline reproducible (pesos safetensors, paper en arXiv, soporte en Transformers, vLLM y SGLang) para comparar nuevas técnicas de parseo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas específicas de OCR (como precisión de caracteres o de palabras). Tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,3 mil millones de parámetros en bfloat16, los pesos ocupan aproximadamente 6,7 GB; sumando activaciones, buffers de imagen y caché KV para 32.768 tokens, se recomienda un mínimo de 16 GB de VRAM y 24 GB para operar con holgura en modo multipágina.
- GPU recomendadas: A100 (40/80 GB) o H100 para despliegue en producción y lotes grandes; RTX 4090 (24 GB) es viable para inferencia individual y lotes moderados.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) y, con cuantización (no documentada oficialmente), potencialmente en GPUs de 16 GB como RTX 4080 o 4060 Ti; la model card solo valida bfloat16.
- Opciones de despliegue: Transformers (probado con torch 2.10.0, CUDA 12.9, transformers 4.57.1, Python 3.12.3); vLLM con receta oficial y Docker (`vllm/vllm-openai:unlimited-ocr` para CUDA 13.0 y `unlimited-ocr-cu129` para Hopper); SGLang con rueda local y `kernels==0.11.7`; entrenamiento con ms-swift. No se documenta soporte de llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Despliegue |
|---|---|---|---|---|---|
| Unlimited-OCR (Baidu) | ~3,3 mil millones | 32.768 tokens de generación | MIT | safetensors | Transformers, vLLM, SGLang |
| DeepSeek-OCR | no disponible | no disponible | no disponible | no disponible | no disponible |
| Otros modelos OCR vision-language de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación explícita en la información disponible es con DeepSeek-OCR, del que Unlimited-OCR se declara evolución, pero no se aportan datos de parámetros, contexto ni benchmarks del modelo de referencia. No hay datos suficientes para comparar rendimiento con alternativas.

## Limitaciones y advertencias

- Arquitectura interna no documentada: requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene auditar el código antes de desplegarlo en entornos sensibles.
- Idiomas no especificados: la etiqueta `multilingual` no viene acompañada de una lista concreta; el rendimiento por idioma no está validado en la información disponible.
- Sin benchmarks publicados: no hay métricas objetivas de precisión OCR, lo que dificulta estimar la calidad frente a alternativas sin una evaluación propia.
- Riesgo de repetición en salidas largas: los ejemplos usan `no_repeat_ngram_size=35` con ventanas de n-gramas grandes (hasta 1024), lo que sugiere que el modelo puede entrar en bucles sin ese control; es un parámetro crítico en producción.
- Restricciones de modo: el modo multipágina y PDF solo admite `image_size=1024`; el modo `gundam` con crops está limitado a imagen única.
- Conversión de PDF externa: el modelo no procesa PDFs directamente; hay que convertirlos a imágenes con PyMuPDF, lo que añade dependencia y consumo de disco.
- Licencia MIT: permisiva para uso comercial, pero sin garantías; revisar las dependencias (PyMuPDF tiene licencia AGPL en algunas configuraciones) antes de distribuir.
- Sin datos de sesgo ni de alucinación: la model card no documenta evaluaciones de sesgo ni tasas de error por tipo de documento.

## Enlaces

- Hugging Face: https://huggingface.co/baidu/Unlimited-OCR
- Repositorio GitHub: https://github.com/baidu/Unlimited-OCR
- Paper arXiv: https://arxiv.org/abs/2606.23050
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/baidu/Unlimited-OCR
- Receta vLLM: https://recipes.vllm.ai/baidu/Unlimited-OCR
- ModelScope: https://modelscope.cn/models/PaddlePaddle/Unlimited-OCR
- Documentación Baidu Cloud: https://cloud.baidu.com/doc/OCR/s/fmr1p39gb
- ms-swift (entrenamiento): https://github.com/modelscope/ms-swift
- DeepSeek-OCR (modelo de referencia): https://github.com/deepseek-ai/DeepSeek-OCR
- Twitter de Baidu: https://x.com/Baidu_Inc

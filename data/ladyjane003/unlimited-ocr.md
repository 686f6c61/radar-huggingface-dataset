# Ladyjane003/Unlimited-OCR

## Resumen

Unlimited-OCR es un modelo multimodal de visión-lenguaje especializado en reconocimiento óptico de caracteres (OCR) y análisis estructurado de documentos, desarrollado por Baidu. Su objetivo declarado es llevar un paso más allá la aproximación de DeepSeek-OCR: en lugar de limitarse a páginas sueltas, está diseñado para el "one-shot long-horizon parsing", es decir, procesar documentos completos (por ejemplo, un PDF de 100 páginas) en un solo paso y devolver texto estructurado.

El modelo tiene 3.336.106.240 parámetros (unos 3,34 mil millones, según los pesos reales en safetensors del repositorio), un tamaño de repositorio de 6,8 GB y pesos almacenados en safetensors con precisión bfloat16. Trabaja con una ventana de contexto de 32.768 tokens, lo que le permite encadenar el contenido de múltiples páginas sin segmentación externa. La licencia es MIT, lo que facilita su uso comercial y su integración en productos propios.

Es relevante ahora porque combina tres factores poco habituales en OCR: ejecución local en hardware de consumo, licencia permisiva y procesamiento de documentos largos en una sola pasada, con soporte oficial para transformers, vLLM, SGLang y entrenamiento mediante ms-swift. El repositorio consultado en HuggingFace (`Ladyjane003/Unlimited-OCR`) es un espejo del modelo canónico publicado por Baidu (`baidu/Unlimited-OCR`); el espejo tiene muy poca tracción (8 descargas, 0 likes en la fecha de consulta), por lo que conviene verificar el origen de los pesos antes de usarlo en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo multimodal visión-lenguaje con decodificador autorregresivo (causal language modeling) y mecanismo R-SWA; linaje DeepSeek-OCR |
| Parámetros totales | 3.336.106.240 (~3,34 mil millones) |
| Parámetros activos | no aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | 32.768 tokens (`max_length=32768` en los ejemplos oficiales) |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16) |
| Idiomas soportados | multilingüe (sin desglose de idiomas en la información disponible) |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

La información disponible describe una arquitectura de modelado de lenguaje causal aplicada a la extracción de texto desde imágenes, con un mecanismo denominado R-SWA que, según la documentación y las revisiones de terceros, resulta clave para mantener el procesamiento de documentos extensos sin degradación. El modelo hereda la línea de trabajo iniciada por DeepSeek-OCR, pero orienta el diseño a la lectura de documentos completos en una única pasada, en lugar de tratar página a página de forma aislada.

La inferencia admite dos configuraciones para imagen única: `gundam` (`base_size=1024`, `image_size=640`, `crop_mode=True`) y `base` (`base_size=1024`, `image_size=1024`, `crop_mode=False`). Para documentos multipágina y PDF solo se emplea `base`. La generación utiliza control de repetición con `no_repeat_ngram_size=35` y una ventana `ngram_window` de 128 (imagen única) o 1024 (multipágina). El número total de tokens de entrenamiento, la composición del dataset y si se aplicaron etapas de RLHF o DPO no están especificados en la información disponible.

## Capacidades

- Extracción de texto a partir de imágenes y documentos escaneados (OCR propiamente dicho).
- Análisis estructurado de documentos: la salida es texto estructurado, no solo texto plano.
- Procesamiento multipágina en una sola pasada, incluyendo PDF convertidos a imágenes.
- Conversión de PDF a imagen integrada en el flujo de uso mediante PyMuPDF.
- Soporte multilingüe declarado (sin listado explícito de idiomas).
- Dos modos de imagen única (`gundam` con recorte y `base`) orientados a equilibrar detalle y velocidad.
- Control de repetición configurable para generaciones largas.
- Compatibilidad de despliegue con transformers, vLLM y SGLang.
- Soporte de entrenamiento y ajuste fino mediante ms-swift.
- No se documentan capacidades de tool calling, function calling, agentes ni audio en la información disponible.
- No se documenta un modo de razonamiento explícito (thinking mode) en la información disponible.

## Casos de uso

- Digitalización masiva de archivos PDF: el modelo procesa documentos de hasta 100 páginas en una sola pasada gracias a su ventana de 32.768 tokens, lo que elimina la necesidad de segmentar manualmente el documento y reensamblar el texto.
- Extracción de datos en facturas y formularios: al devolver texto estructurado, permite alimentar pipelines contables o ERP con los campos relevantes leídos directamente de la imagen o del PDF.
- Construcción de bases documentales para RAG: convierte documentación corporativa escaneada en texto indexable, manteniendo el orden de páginas y secciones en una única salida.
- Procesamiento de manuales técnicos y documentación de producto: la lectura multipágina con contexto largo permite conservar referencias cruzadas, tablas y notas al pie que se perderían con OCR página a página.
- Accesibilidad: conversión de material escaneado (libros, actas, informes) a texto legible por lectores de pantalla y herramientas de síntesis de voz.
- Revisión documental y cumplimiento normativo: extracción sistemática del contenido de expedientes para su revisión posterior, con ejecución local que evita enviar documentos sensibles a servicios en la nube.
- Digitalización de archivos históricos o prensa escaneada: el modo multilingüe y la tolerancia a documentos largos facilitan el tratamiento de fondos heterogéneos.
- Automatización de trámites con verificación documental: lectura de documentos aportados por el usuario dentro de un flujo de admisión, con la salida estructurada como entrada de las reglas de negocio.

## Benchmarks y rendimiento

No se han publicado tablas de benchmarks detalladas (MMLU, HumanEval, GSM8K u otros) en la información disponible. La única cifra de rendimiento localizada procede de una revisión de terceros, no de la documentación oficial de Baidu, y se refiere a la precisión de lectura de PDF de 100 páginas.

| Fuente | Métrica | Resultado | Nota |
|---|---|---|---|
| Revisión de terceros (dashen-tech.com) | Precisión en PDF de 100 páginas en una pasada | 93 % | No confirmado por la documentación oficial; tratar como referencia orientativa |
| Documentación oficial de Baidu | Benchmarks comparativos | no disponible | No se incluyen tablas de resultados en la model card consultada |

## Requisitos de hardware

- Peso de los pesos en bfloat16: aproximadamente 6,7 GB (el repositorio ocupa 6,8 GB), calculado a partir de los 3,34 mil millones de parámetros.
- VRAM estimada para inferencia: en el entorno de 8-12 GB para imagen única y contexto moderado; el KV cache crece de forma apreciable al acercarse a los 32.768 tokens, por lo que documentos muy largos requieren margen adicional. Estimación propia, no confirmada por el fabricante.
- GPU de consumo: cabe en tarjetas de 24 GB (RTX 3090, RTX 4090). En tarjetas de 16 GB (RTX 4080, RTX 4060 Ti 16 GB) es probable que funcione con contexto recortado, aunque no está confirmado oficialmente.
- GPU de centro de datos: A100 y H100 son los objetivos naturales; existe una imagen Docker específica para GPUs Hopper (CUDA 12.9).
- Despliegue con transformers: requiere `trust_remote_code=True`, PyTorch 2.10, transformers 4.57.1, CUDA 12.9 y Python 3.12.3 según la documentación.
- Despliegue con vLLM: imagen `vllm/vllm-openai:unlimited-ocr` (CUDA 13.0 por defecto) y `vllm/vllm-openai:unlimited-ocr-cu129` para Hopper.
- Despliegue con SGLang: wheel local de SGLang con `kernels` fijado y PyMuPDF para la conversión de PDF.
- Entrenamiento y ajuste fino: soportado a través de ms-swift.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Unlimited-OCR (Baidu) | ~3,34 mil millones | 32.768 tokens | MIT | HuggingFace, ModelScope, Baidu Cloud, GitHub | Procesamiento multipágina en una pasada |
| DeepSeek-OCR | no disponible | no disponible | no disponible | Repositorio de DeepSeek | Referencia directa que Unlimited-OCR dice superar |
| PaddleOCR | no disponible | no disponible | no disponible | ModelScope y ecosistema PaddlePaddle | OCR clásico de Baidu, enfoque por página |
| Tesseract | no disponible | no disponible | no disponible | Proyecto open source | OCR tradicional, sin modelado de lenguaje generativo |

Los datos de parámetros, contexto y licencia de los modelos comparados no aparecen en la información proporcionada, por lo que no se puede establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Riesgo de alucinación: como modelo generativo, puede producir texto plausible que no aparece en la imagen, especialmente en documentos degradados o con tipografías poco habituales.
- La cifra del 93 % de precisión procede de una revisión externa y no está respaldada por la documentación oficial; no debe usarse como garantía de calidad.
- No se especifica la lista concreta de idiomas soportados, solo la etiqueta "multilingüe"; el rendimiento por idioma es desconocido.
- El listado de idiomas, los sesgos conocidos y los datos de entrenamiento no están documentados, lo que dificulta evaluar riesgos de sesgo en dominios concretos.
- El repositorio consultado (`Ladyjane003/Unlimited-OCR`) es un espejo con 8 descargas y 0 likes; los pesos canónicos están en `baidu/Unlimited-OCR`. Verificar el origen antes de usar en producción.
- El uso requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del repositorio; conviene auditar ese código en entornos sensibles.
- La licencia MIT permite uso comercial y modificación, pero no exime de cumplir la normativa de protección de datos al procesar documentos con información personal.
- En contextos cercanos a los 32.768 tokens, el consumo de memoria y la latencia aumentan; no hay datos publicados de throughput.
- No se documentan capacidades de tool calling ni de razonamiento multi-paso, por lo que no debe asumirse su uso como agente.
- Solo se recomienda el modo `base` para multipágina y PDF; usar `gundam` fuera de imagen única no está soportado según la documentación.

## Enlaces

- Modelo en HuggingFace (espejo consultado): https://huggingface.co/Ladyjane003/Unlimited-OCR
- Modelo canónico en HuggingFace: https://huggingface.co/baidu/Unlimited-OCR
- Repositorio en GitHub: https://github.com/baidu/Unlimited-OCR
- Paper en arXiv: https://arxiv.org/abs/2606.23050
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/baidu/Unlimited-OCR
- Receta de despliegue en vLLM: https://recipes.vllm.ai/baidu/Unlimited-OCR
- Modelo en ModelScope: https://modelscope.cn/models/PaddlePaddle/Unlimited-OCR
- Documentación en Baidu Cloud: https://cloud.baidu.com/doc/OCR/s/fmr1p39gb
- Repositorio ms-swift (entrenamiento): https://github.com/modelscope/ms-swift
- Comunidad ModelScope: https://github.com/modelscope
- Cuenta de Baidu en X: https://x.com/Baidu_Inc
- Ficha en Vast.ai: https://vast.ai/model/unlimited-ocr
- Revisión técnica en dashen-tech.com: https://dashen-tech.com/en/ai-tech/unlimited-ocr-guide/
- Guía en aimadetools.com: https://www.aimadetools.com/blog/baidu-unlimited-ocr-complete-guide/
- Análisis en aitermbase.com: https://aitermbase.com/unlimited-ocr/

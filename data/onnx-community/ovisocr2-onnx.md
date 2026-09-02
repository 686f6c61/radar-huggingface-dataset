# onnx-community/OvisOCR2-ONNX

## Resumen

OvisOCR2 es un modelo de reconocimiento óptico de caracteres (OCR) de última generación desarrollado por ATH-MaaS, que según los datos disponibles logra una puntuación global de 96,58 en el benchmark OmniDocBench v1.6, convirtiéndose en el primer modelo de extremo a extremo en encabezar este leaderboard, anteriormente dominado por métodos basados en pipelines. Esta versión concreta, publicada por la comunidad ONNX, es una conversión cuantizada del modelo original a formato ONNX, realizada mediante las recetas de optimización de `qwen3.5-0.8b olive-recipes`. El objetivo de esta conversión es facilitar el despliegue en entornos que requieren el estándar ONNX, como inferencia con ONNX Runtime, y reducir el peso del modelo (el repositorio ocupa 9,9 GB). No se dispone de información pública sobre la arquitectura interna, el número de parámetros o la licencia del modelo original, por lo que esta ficha se basa únicamente en los datos disponibles en la página de Hugging Face y en las menciones encontradas en la web.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se indica "quantized", pero sin especificar el tipo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | ONNX (cuantizado) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura del modelo original OvisOCR2. La única referencia técnica es que la conversión a ONNX se realizó utilizando las recetas de optimización de `qwen3.5-0.8b olive-recipes`, lo que sugiere que el proceso de cuantización y conversión sigue las prácticas estándar de Olive para modelos de la familia Qwen, pero no se puede confirmar que la arquitectura subyacente sea un transformer de tipo Qwen. Tampoco se conocen los datos de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. La ausencia de una model card detallada en el repositorio ONNX impide cualquier afirmación adicional.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) de documentos, según la naturaleza del modelo base OvisOCR2.
- Rendimiento destacado en el benchmark OmniDocBench v1.6, con una puntuación global de 96,58, lo que indica una alta precisión en tareas de OCR sobre documentos variados.
- Al ser una versión ONNX cuantizada, es compatible con entornos de inferencia que usan ONNX Runtime, lo que facilita su integración en aplicaciones que requieren este formato.
- No se dispone de información sobre capacidades adicionales como tool calling, agentes, razonamiento multi-paso, visión general o soporte multilingüe.

## Casos de uso

- Digitalización de documentos empresariales: el modelo puede emplearse para extraer texto de facturas, contratos o formularios escaneados, aprovechando su alto rendimiento en OCR de documentos complejos.
- Automatización de procesos de captura de datos: al convertir imágenes o PDFs en texto estructurado, puede integrarse en flujos de trabajo de RPA (automatización robótica de procesos) para alimentar bases de datos o sistemas ERP.
- Archivado y búsqueda documental: permite indexar grandes volúmenes de documentos históricos o administrativos, convirtiéndolos en texto buscable.
- Asistencia a personas con discapacidad visual: el OCR puede utilizarse en aplicaciones de lectura de textos impresos a través de cámaras de dispositivos móviles.
- Preprocesamiento para modelos de lenguaje: el texto extraído puede servir como entrada para modelos LLM o sistemas de análisis posterior, como resúmenes o clasificación.
- Verificación de documentos de identidad: en entornos de cumplimiento normativo (KYC), el modelo puede extraer los campos relevantes de documentos de identidad escaneados.

## Benchmarks y rendimiento

Según la información encontrada en la web, OvisOCR2 alcanza una puntuación global de 96,58 en el benchmark OmniDocBench v1.6, estableciendo un nuevo estado del arte y siendo el primer modelo de extremo a extremo en liderar este leaderboard, que previamente estaba dominado por métodos basados en pipelines. No se dispone de resultados desglosados por subconjuntos ni de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- No se dispone de datos específicos sobre requisitos de VRAM, GPU recomendadas o latencia para esta versión ONNX cuantizada.
- El tamaño del repositorio es de 9,9 GB, lo que sugiere que el modelo cuantizado podría caber en GPUs de consumo con al menos 12 GB de VRAM, pero esto es una estimación no confirmada.
- Al ser un modelo ONNX, puede ejecutarse con ONNX Runtime, que soporta aceleración por CPU y GPU (CUDA, DirectML, etc.), así como con otros runtime compatibles con ONNX.
- No se indica si es compatible con vLLM, llama.cpp u otras herramientas de despliegue específicas.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de OCR similares. El único dato conocido es su posición en OmniDocBench v1.6, pero no se mencionan los nombres de los modelos competidores ni sus puntuaciones. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos, riesgos de alucinación o limitaciones de contexto o idioma del modelo original.
- La licencia no está especificada, por lo que se desconoce si el uso comercial está permitido. Se recomienda contactar con el autor original (ATH-MaaS) antes de utilizarlo en producción.
- Al ser una conversión ONNX cuantizada, puede haber una pérdida de precisión respecto al modelo original en punto flotante, aunque no se han publicado métricas comparativas.
- La ausencia de una model card detallada en el repositorio ONNX dificulta la evaluación de sus capacidades reales y su idoneidad para casos de uso específicos.
- El modelo base OvisOCR2 es relativamente reciente (el repositorio ONNX se creó en septiembre de 2026), por lo que su ecosistema de herramientas y documentación puede ser limitado.

## Enlaces

- [Repositorio Hugging Face del modelo ONNX](https://huggingface.co/onnx-community/OvisOCR2-ONNX)
- [Repositorio Hugging Face del modelo base OvisOCR2](https://huggingface.co/ATH-MaaS/OvisOCR2)
- [Perfil de la organización ONNX Community](https://huggingface.co/onnx-community)
- [Página oficial de ONNX](https://onnx.ai/)
- [ONNX Runtime Models](https://onnxruntime.ai/models)

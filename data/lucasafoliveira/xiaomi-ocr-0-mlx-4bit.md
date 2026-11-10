# lucasafoliveira/Xiaomi-OCR-0-mlx-4Bit

## Resumen

Xiaomi-OCR-0-mlx-4Bit es una conversión al formato MLX con cuantización de 4 bits del modelo Xiaomi-OCR-0, desarrollado originalmente por Xiaomi Research. Se trata de un modelo vision-language (image-text-to-text) especializado en tareas de OCR, parsing de documentos, comprensión de documentos, respuesta visual a preguntas (VQA) y extracción de información clave. La conversión la firma el usuario lucasafoliveira y está pensada para ejecución en hardware Apple Silicon mediante la librería mlx-lm (versión 0.31.2).

El modelo base cuenta con 752.393.024 parámetros totales (aproximadamente 752 millones), lo que lo sitúa en la gama de modelos compactos y desplegables en hardware de consumo. El repositorio ocupa 0,4 GB, coherente con la cuantización de 4 bits aplicada sobre los pesos originales. La arquitectura declarada en los tags es qwen3_5, lo que sugiere una base derivada de la familia Qwen 3.5 adaptada por Xiaomi para tareas documentales.

La relevancia de esta ficha radica en que ofrece una vía de despliegue local en Mac para un modelo OCR multimodal con licencia Apache 2.0, sin necesidad de GPUs NVIDIA ni servicios en la nube. Es útil para pipelines de digitalización documental, extracción estructurada y VQA sobre imágenes en entornos con hardware Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer vision-language, segun tags del repo); detalles internos no disponibles |
| Parametros totales | 752.393.024 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (MLX); otras cuantizaciones del modelo base no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (repo de 0,4 GB) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo base es xiaomi-research/Xiaomi-OCR-0 y que la arquitectura etiquetada es qwen3_5, un transformer multimodal para image-text-to-text. No se detalla en la model card proporcionada la composición del encoder visual, el número de capas, la dimensionalidad oculta ni la estrategia exacta de fusión entre modalidades. Tampoco se especifica la longitud de contexto nativa.

En cuanto a entrenamiento, la model card referencia un dataset llamado custom-ocr-centric-corpus, lo que apunta a un corpus centrado en OCR y documentos. No se documentan el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO o ajuste supervisado. Las métricas declaradas en los tags (accuracy, teds y cdm) sugieren evaluación orientada a exactitud de reconocimiento, similitud estructural de tablas (TEDS) y métricas de comprensión documental (CDM), pero no se aportan valores numéricos.

La innovación principal de esta variante concreta no está en el modelo base sino en la conversión: se ha transformado a formato MLX con cuantización de 4 bits usando mlx-lm 0.31.2, habilitando inferencia nativa en Apple Silicon con un peso de repositorio de 0,4 GB.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes y documentos escaneados.
- Parsing de documentos: extracción de estructura, tablas y campos a partir de layouts complejos.
- Comprensión de documentos (document understanding) más allá del texto plano.
- Respuesta visual a preguntas (VQA): preguntas en lenguaje natural sobre imágenes.
- Extracción de información clave (key information extraction) hacia formatos estructurados.
- Conversación multimodal multi-turno (tag conversational).
- Compatibilidad con endpoints (tag endpoints_compatible).
- Ejecución local en Apple Silicon mediante mlx-lm.
- No se documentan capacidades de audio, tool calling ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Digitalización de facturas y recibos: el modelo puede recibir la imagen de un documento y devolver los campos relevantes (importe, fecha, emisor) aprovechando sus capacidades de key information extraction.
- Extracción de tablas de informes financieros: con métricas TEDS declaradas en los tags, está orientado a reconstruir estructura tabular a partir de capturas o PDFs renderizados.
- Atención al cliente sobre documentación: un usuario sube una foto de un contrato o recibo y formula preguntas en lenguaje natural; el modelo responde mediante VQA documental.
- Automatización de archivo administrativo: clasificación y lectura de formularios escaneados en un pipeline local en Mac, sin enviar datos sensibles a la nube gracias al despliegue MLX.
- Asistencia a personas con discapacidad visual: descripción y lectura en voz alta de documentos capturados con la cámara, ejecutando el modelo en un portátil Apple Silicon.
- Prototipado rápido en investigación: evaluación de pipelines OCR multimodales en entornos de desarrollo con macOS, usando mlx-lm para iterar sin depender de GPUs NVIDIA.
- Preprocesado para RAG documental: conversión de PDFs e imágenes en texto estructurado antes de indexarlos en un sistema de recuperación, en local y con licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los tags del repositorio mencionan las métricas accuracy, teds y cdm, pero no se aportan valores numéricos ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: no aplicable en sentido estricto; al ser MLX, el modelo se ejecuta con memoria unificada en Apple Silicon. Con 752 millones de parámetros en 4 bits, el peso de los pesos ronda los 0,4 GB, por lo que la huella de memoria es muy reducida (del orden de 1-2 GB incluyendo overhead de runtime, estimación orientativa).
- GPU recomendadas: hardware Apple Silicon (series M1, M2, M3, M4 y variantes Pro/Max/Ultra). No está pensado para GPUs NVIDIA en este formato.
- Cabe en GPU de consumo: sí, en cualquier Mac con chip Apple Silicon; también es viable en equipos con 8 GB de memoria unificada o superior.
- Opciones de despliegue: mlx-lm (versión 0.31.2 o compatible). Para el modelo base original, consultar las opciones indicadas por xiaomi-research (no disponibles en esta ficha). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en esta variante MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| lucasafoliveira/Xiaomi-OCR-0-mlx-4Bit | 752 M | no disponible | Apache 2.0 | MLX safetensors 4-bit | Hugging Face (0 descargas) |
| xiaomi-research/Xiaomi-OCR-0 | no disponible (modelo base) | no disponible | Apache 2.0 (segun tag del derivado) | no disponible | Hugging Face (modelo base) |
| Alternativas OCR/VLM de tamano comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo derivado y comunitario: la conversión MLX no la publica Xiaomi Research, sino un usuario independiente; no hay garantía de paridad de comportamiento con el modelo base.
- Cuantización de 4 bits: puede degradar la precisión en OCR de textos densos, tablas complejas o documentos de baja calidad, respecto a los pesos originales.
- Idiomas soportados no documentados: no se puede confirmar cobertura multilingüe ni calidad por idioma.
- Longitud de contexto no disponible: limita la planificación de pipelines con documentos extensos o muchas páginas.
- Riesgo de alucinación inherente a modelos generativos multimodales: pueden inventarse campos o valores en extracción estructurada; se recomienda validación posterior.
- Sesgos: no documentados en la información disponible; cabe esperar sesgos heredados del corpus custom-ocr-centric-corpus, cuya composición no se detalla.
- Licencia Apache 2.0: permisiva para uso comercial, pero conviene verificar las condiciones del modelo base y de los datasets empleados.
- Repositorio sin adopción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- Fecha de creación del repositorio: 2026-11-10, según los metadatos de Hugging Face.
- Sin soporte documentado para tool calling ni para modos de razonamiento explícitos, lo que limita su uso como agente autónomo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lucasafoliveira/Xiaomi-OCR-0-mlx-4Bit
- Modelo base: https://huggingface.co/xiaomi-research/Xiaomi-OCR-0
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
- No se han encontrado en la información proporcionada papers, blogs, repos adicionales ni demos del modelo base.

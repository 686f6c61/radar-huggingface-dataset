# KeraCare/lab_item_extraction_drugft_fullft_v1x0

## Resumen

KeraCare/lab_item_extraction_drugft_fullft_v1x0 es un modelo de vision-lenguaje (VLM) especializado en la extracción de elementos de laboratorio a partir de imágenes de documentos médicos, desarrollado por KeraCare. El modelo combina capacidades de OCR (reconocimiento óptico de caracteres) con comprensión de lenguaje natural para convertir imágenes de informes de laboratorio, recetas y documentación clínica en datos estructurados. Está construido sobre la arquitectura GLM-OCR, lo que le permite procesar entradas de imagen y texto simultáneamente.

Con aproximadamente 1.107 millones de parámetros (1,1B) y un tamaño de repositorio de 2,2 GB, el modelo está diseñado para tareas de extracción de información en el dominio sanitario. Su pipeline de tipo image-text-to-text lo hace adecuado para aplicaciones donde se necesita interpretar documentos médicos escaneados o fotografiados y generar salidas textuales estructuradas. La relevancia de este modelo radica en la creciente demanda de automatización en el sector sanitario, donde la digitalización de documentos clínicos sigue siendo un cuello de botella importante.

La ficha técnica del modelo es notablemente escasa: no se especifican datos de entrenamiento, licencia, idiomas soportados ni benchmarks. Esto limita su evaluación objetiva y su adopción en entornos de producción sin una validación adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-OCR (vision-lenguaje) |
| Parametros totales | 1.107.405.824 (1,1B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GLM-OCR, que integra un codificador visual con un modelo de lenguaje para tareas de comprensión de documentos. Esta arquitectura está diseñada para manejar entradas multimodales, combinando el procesamiento de imágenes con generación de texto. El tag `glm_ocr` en HuggingFace confirma que el modelo sigue el paradigma de los modelos GLM adaptados a tareas de OCR y comprensión de documentos.

Los detalles sobre el entrenamiento son prácticamente inexistentes. El nombre del modelo sugiere un fine-tuning completo (`fullft`) sobre un conjunto de datos de extracción de elementos de laboratorio (`lab_item_extraction`) con un enfoque farmacéutico (`drugft`). Existe una versión LoRA del mismo modelo (`KeraCare/lab_item_extraction_lora_drugft_v1`), lo que indica que el proceso de entrenamiento incluyó tanto fine-tuning completo como adaptadores de bajo rango. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Extracción de información estructurada a partir de imágenes de documentos de laboratorio y farmacéuticos.
- Comprensión de documentos médicos escaneados o fotografiados mediante OCR integrado.
- Generación de texto estructurado a partir de entradas visuales (image-text-to-text).
- Procesamiento conversacional multimodal, permitiendo interacción iterativa con el modelo.
- Capacidad de fine-tuning adicional gracias a su formato compatible con transformers.
- Inferencia en endpoints compatibles con la librería transformers de HuggingFace.

## Casos de uso

- Digitalización de informes de laboratorio: el modelo puede convertir informes de análisis clínicos escaneados en datos estructurados, facilitando su integración en historiales clínicos electrónicos (HCE) y sistemas de gestión hospitalaria.
- Automatización de la gestión de recetas médicas: al extraer los elementos farmacéuticos de recetas manuscritas o impresas, permite verificar automáticamente la disponibilidad de medicamentos y agilizar el proceso de dispensación en farmacias.
- Validación de facturas médicas: puede extraer códigos de procedimientos, medicamentos y cantidades de facturas hospitalarias, reduciendo errores en la facturación y auditoría sanitaria.
- Investigación clínica: facilita la extracción de datos de ensayos clínicos a partir de documentos escaneados, acelerando la recopilación de información para estudios retrospectivos.
- Integración en asistentes de salud: puede alimentar chatbots o sistemas de soporte que necesiten interpretar documentos médicos enviados por los pacientes para responder consultas o derivar a especialistas.
- Archivado y búsqueda documental: permite indexar documentos médicos históricos escaneados, haciendo que su contenido sea buscable y consultable mediante texto estructurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación como MMLU, HumanEval o métricas específicas de extracción de información (F1, precisión, recall). Tampoco se han encontrado comparaciones con otros modelos en la documentación pública.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,1B parámetros en fp16, el modelo requiere aproximadamente 2,2 GB de VRAM solo para los pesos. Con overhead de activaciones y memoria intermedia, se recomienda un mínimo de 4 GB de VRAM.
- GPU recomendadas: el modelo puede ejecutarse en GPUs de consumo como NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores. Para despliegues profesionales, una A10 o A100 sería adecuada.
- Compatibilidad con consumer GPU: sí, el tamaño del modelo permite su ejecución en GPUs de consumo con al menos 8 GB de VRAM.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI (Text Generation Inference) o directamente con la librería transformers de HuggingFace. También es compatible con endpoints gestionados como los de HuggingFace Inference Endpoints.
- Latencia y throughput: no disponible. Dependerá del hardware y del backend de inferencia utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| KeraCare/lab_item_extraction_drugft_fullft_v1x0 | 1,1B | no disponible | no disponible | Extraccion de documentos de laboratorio |
| GLM-4V-9B | 9B | 128K | MIT | Vision-lenguaje general |
| Qwen2-VL-7B | 7B | 128K | Apache 2.0 | Vision-lenguaje general |

No se dispone de datos de rendimiento comparativos entre estos modelos. La comparativa se limita a aspectos arquitectónicos y de licencia. El modelo de KeraCare es significativamente más pequeño que las alternativas generalistas, lo que sugiere que está optimizado para una tarea específica con menores requisitos de cómputo, pero no hay datos que confirmen su rendimiento relativo.

## Limitaciones y advertencias

- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial y redistribución. Se recomienda contactar con el autor antes de utilizarlo en producción.
- No se han publicado datos de entrenamiento, por lo que se desconocen los posibles sesgos del modelo, especialmente en un dominio tan sensible como el sanitario.
- La model card no incluye información sobre riesgos de alucinación o errores en la extracción de datos. En un contexto médico, un error de extracción podría tener consecuencias graves.
- No se especifican los idiomas soportados. Si el modelo solo fue entrenado con documentos en inglés, su rendimiento en otros idiomas será limitado o nulo.
- El modelo tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere que no ha sido validado por la comunidad. Su fiabilidad no está contrastada.
- La fecha de creación (septiembre de 2026) es futura, lo que podría indicar un error en los metadatos o un modelo muy reciente sin trayectoria de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/KeraCare/lab_item_extraction_drugft_fullft_v1x0
- Versión LoRA del modelo: https://huggingface.co/KeraCare/lab_item_extraction_lora_drugft_v1
- Repositorio de la versión LoRA: https://huggingface.co/KeraCare/lab_item_extraction_lora_drugft_v1/tree/main
- Proyecto relacionado de análisis de recetas médicas: https://github.com/HR-VijayKumar/medical-prescription-analyzer

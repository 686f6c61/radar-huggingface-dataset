# KeraCare/lab_item_extraction_lora_drugft_v1

## Resumen

KeraCare/lab_item_extraction_lora_drugft_v1 es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario KeraCare en Hugging Face, orientado a la extracción de elementos de laboratorio con ajuste fino específico para fármacos. El tag `glm_ocr` sugiere que se basa en un modelo de la familia GLM-OCR de Zhipu AI, que combina capacidades de reconocimiento óptico de caracteres con generación de texto a partir de imágenes y texto.

El pipeline declarado es `image-text-to-text`, lo que implica que el modelo procesa entradas multimodales (imágenes de documentos de laboratorio, posiblemente recetas o informes) y genera texto estructurado con los ítems extraídos. Los parámetros totales registrados son 1.107.405.824 (aproximadamente 1.1 mil millones), que corresponden al adaptador LoRA, no al modelo base. La ficha del modelo está prácticamente vacía, con la mayoría de campos marcados como "[More Information Needed]", y no se han publicado métricas de evaluación ni detalles de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre modelo base GLM-OCR (no se especifica el modelo base exacto) |
| Parametros totales | 1.107.405.824 (≈1,1 mil millones) |
| Parametros activos | no disponible (al ser un adaptador LoRA, depende del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (formato safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información pública no incluye detalles sobre la arquitectura interna del adaptador ni sobre el proceso de entrenamiento. Por el nombre y los tags, se infiere que se trata de un adaptador LoRA aplicado sobre un modelo multimodal de la familia GLM-OCR, que integra un codificador visual con un modelo de lenguaje para tareas de comprensión de imágenes y texto. La tarea declarada (extracción de ítems de laboratorio con ajuste de fármacos) sugiere que el entrenamiento se realizó sobre un dataset de documentos de laboratorio anotados, probablemente mediante fine-tuning supervisado. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se utilizaron técnicas de RLHF o DPO. Los tags `conversational` y `endpoints_compatible` indican que el modelo puede desplegarse en un endpoint de inferencia y usarse en modo conversacional.

## Capacidades

- Extracción de ítems de laboratorio a partir de imágenes de documentos (informes, recetas, hojas de resultados).
- Ajuste de nombres de fármacos dentro de los textos extraídos, probablemente para normalizar o corregir terminología.
- Procesamiento multimodal: acepta entrada de imagen y texto (pipeline `image-text-to-text`).
- Compatible con `transformers` y desplegable como endpoint de inferencia.
- Capacidades conversacionales declaradas en los tags.

## Casos de uso

- **Digitalización de informes de laboratorio**: el modelo puede procesar fotografías o escaneos de informes de laboratorio y extraer los nombres de los análisis (hemograma, bioquímica, etc.) de forma estructurada, reduciendo la entrada manual de datos.
- **Normalización de nombres de fármacos**: al ajustar los nombres de fármacos extraídos, el modelo puede ayudar a estandarizar terminología en bases de datos de farmacia o registros médicos electrónicos.
- **Integración en sistemas de gestión hospitalaria**: desplegado como endpoint compatible con transformers, puede integrarse en flujos de trabajo de registro de pacientes para parsear automáticamente documentos de laboratorio.
- **Asistente conversacional de consulta**: dado su tag `conversational`, puede servir de base para un chatbot que responda preguntas sobre los resultados de un análisis de laboratorio a partir de una imagen subida.
- **Investigación clínica**: extracción de datos de ensayos clínicos a partir de documentos PDF escaneados, para construir bases de datos estructuradas de resultados de laboratorio.
- **Auditoría y revisión de prescripciones**: el ajuste de fármacos extraídos puede permitir detectar discrepancias entre el medicamento prescrito y el registrado en el sistema.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación ni comparaciones con otros modelos.

## Requisitos de hardware

- **VRAM estimada**: al ser un adaptador LoRA de 1,1 mil millones de parámetros, la inferencia requiere cargar también el modelo base GLM-OCR (de tamaño considerablemente mayor, probablemente entre 6 y 13 mil millones de parámetros). La VRAM total dependerá del modelo base y de la cuantización utilizada.
- **GPU recomendadas**: para el modelo base GLM-OCR, se recomienda al menos una GPU con 16-24 GB de VRAM (por ejemplo, RTX 4090, A100 40 GB) para inferencia en fp16.
- **Consumer GPU**: el adaptador LoRA por sí solo cabría en cualquier GPU consumer, pero el modelo base no es viable en GPU de menos de 16 GB sin cuantización agresiva.
- **Opciones de despliegue**: compatible con el pipeline `transformers` y con `endpoints_compatible`, por lo que puede desplegarse con vLLM, TGI o la infraestructura de endpoints de Hugging Face. No se han publicado instrucciones específicas.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (extracción de ítems de laboratorio con adaptador LoRA sobre GLM-OCR). La información pública es insuficiente para establecer una comparativa fiable.

## Limitaciones y advertencias

- **Falta de documentación**: la model card no incluye información sobre el dataset de entrenamiento, el modelo base exacto, el proceso de fine-tuning ni las métricas de evaluación.
- **Riesgo de alucinación**: al ser un adaptador multimodal, puede generar nombres de fármacos o ítems de laboratorio incorrectos si la imagen de entrada es de baja calidad o ambigua.
- **Sesgos potenciales**: sin información sobre el dataset de entrenamiento, no se pueden evaluar sesgos en la extracción de fármacos o en el reconocimiento de documentos.
- **Restricciones de licencia**: la licencia no está especificada, lo que impide conocer si es viable para uso comercial.
- **Idiomas**: no se especifican los idiomas soportados, lo que limita el despliegue en entornos multilingües.
- **Dependencia del modelo base**: el rendimiento depende completamente del modelo GLM-OCR base, que no está incluido en el repositorio y debe descargarse por separado.

## Enlaces

- Repositorio del modelo: https://huggingface.co/KeraCare/lab_item_extraction_lora_drugft_v1
- Modelo relacionado del mismo autor: https://huggingface.co/KeraCare/drug_name_extraction_v2x0
- Referencia al paper de estimación de impacto ambiental citado en la model card: https://arxiv.org/abs/1910.09700

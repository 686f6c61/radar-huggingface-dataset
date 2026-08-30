# hugnever21/ClinFusion-8B-Q8

## Resumen

ClinFusion-8B-Q8 es una cuantización de 8 bits (bitsandbytes) del modelo multimodal ClinFusion-8B, desarrollado originalmente por Alibaba DAMO Academy. ClinFusion-8B es la versión ligera de la serie ClinFusion, un sistema de lenguaje multimodal (MLLM) centrado en la visión para la comprensión médica integral. Está construido sobre la base de Qwen3-VL-8B-Instruct e integra un framework de codificadores visuales compuestos y en cascada, combinando DINOv2 (para semántica espacial densa) y CLIP-ConvNeXt (para características estructurales y holísticas), optimizados mediante un operador de fusión Cascade Spatial-Aware Locality Fusion.

Este modelo destaca por su soporte nativo de imágenes médicas 2D (radiografías, ultrasonidos, histología) y volúmenes 3D (CT y MRI en formato NIfTI), lo que lo hace relevante para aplicaciones clínicas reales. Su tamaño compacto (8.759 millones de parámetros) y su licencia Apache 2.0 lo convierten en una opción atractiva para despliegue en entornos con recursos limitados, como hospitales o dispositivos periféricos. La versión Q8 aquí descrita es una adaptación de un tercero (hugnever21) que facilita la inferencia con menor huella de memoria.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLLM basado en Qwen3-VL-8B-Instruct con codificadores visuales compuestos (DINOv2 + CLIP-ConvNeXt) y fusión Cascade Spatial-Aware Locality |
| Parametros totales | 8.759.237.232 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit (bitsandbytes) en este repositorio; el modelo original puede tener otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ClinFusion-8B emplea una arquitectura de MLLM centrada en la visión. El backbone de lenguaje es Qwen3-VL-8B-Instruct, al que se añaden dos codificadores visuales adicionales: DINOv2, que captura semántica espacial densa, y CLIP-ConvNeXt, que extrae características estructurales y holísticas. Estos tres flujos se fusionan mediante un operador Cascade Spatial-Aware Locality Fusion, diseñado para alinear las representaciones visuales con el espacio semántico del modelo de lenguaje. Esta composición permite procesar tanto imágenes 2D convencionales como volúmenes 3D nativos (NIfTI), una capacidad poco común en modelos de este tamaño.

No se dispone de información detallada sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO) en la documentación pública consultada. El paper original (arXiv:2607.24743) describe el sistema completo, pero los detalles específicos de entrenamiento no están disponibles en la información proporcionada.

## Capacidades

- Comprensión de imágenes médicas 2D: radiografías, ultrasonidos, histología y otras modalidades.
- Procesamiento de volúmenes 3D: archivos NIfTI (.nii.gz) de CT y MRI, con interpretación nativa.
- Generación de informes médicos a partir de imágenes.
- Seguimiento de instrucciones en dominios clínicos, evaluado con el benchmark MedIF-Bench.
- Razonamiento clínico multimodal, combinando información visual y textual.
- Soporte de tool calling: no disponible (no se menciona en la documentación).
- Capacidades multilingües: no disponible (no se especifican idiomas).

## Casos de uso

- Asistente clínico en tiempo real: el modelo puede analizar radiografías o ecografías durante una consulta, proporcionando sugerencias preliminares al radiólogo o al médico de cabecera. Su tamaño compacto permite ejecutarlo en estaciones de trabajo con GPU de gama media.
- Interpretación de volúmenes CT/MRI: al aceptar archivos NIfTI directamente, puede ayudar a detectar anomalías en estudios 3D, reduciendo el tiempo de revisión manual en servicios de radiología.
- Generación automática de informes: a partir de una imagen médica, el modelo redacta un informe estructurado que el especialista puede revisar y corregir, acelerando la documentación clínica.
- Triage de pacientes en urgencias: integrado en un sistema de soporte a la decisión, puede priorizar casos según la gravedad observada en imágenes (por ejemplo, neumotórax en radiografías de tórax).
- Educación médica: como herramienta de entrenamiento para estudiantes, explicando hallazgos en imágenes y generando preguntas de práctica.
- Investigación clínica: análisis retrospectivo de grandes colecciones de imágenes para identificar patrones o correlaciones, gracias a su capacidad de procesar tanto 2D como 3D.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La documentación del modelo original menciona que ClinFusion-8B supera a modelos open-source de mayor tamaño (como Hulu-Med y Lingshu-8B) en benchmarks de VQA 2D y 3D, generación de informes médicos y MedIF-Bench, pero no se proporcionan cifras concretas. Para métricas detalladas, se remite al paper arXiv:2607.24743.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q8, los pesos ocupan aproximadamente 8,8 GB (8.759.237.232 parámetros × 1 byte). Considerando overhead de activaciones y contexto, se recomienda al menos 12 GB de VRAM para inferencia básica.
- GPU recomendadas: RTX 3090 (24 GB), RTX 4090 (24 GB), A10 (24 GB), A100 (40/80 GB) para mayor margen. En GPUs con 16 GB (como RTX 4080) podría funcionar con secuencias cortas.
- Compatibilidad con consumer GPU: sí, en GPUs de gama alta (RTX 3090/4090) y posiblemente en algunas de 16 GB con optimizaciones.
- Opciones de despliegue: al ser una cuantización bitsandbytes, es compatible con el ecosistema Hugging Face Transformers. El repositorio oficial de GitHub proporciona scripts de inferencia y evaluación. No se confirma compatibilidad con vLLM, llama.cpp u Ollama en la documentación disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La documentación menciona comparaciones con Hulu-Med y Lingshu-8B, pero no se proporcionan datos cuantitativos. No se dispone de información suficiente para construir una tabla comparativa fiable. Se recomienda consultar el paper original para métricas detalladas.

## Limitaciones y advertencias

- Sesgos: al ser un modelo entrenado con datos médicos, puede heredar sesgos presentes en los datos de entrenamiento (por ejemplo, subrepresentación de ciertas poblaciones o patologías).
- Riesgo de alucinación: como todo LLM, puede generar información plausible pero incorrecta. En el dominio médico, esto es crítico; el modelo debe usarse siempre como apoyo, nunca como sustituto del juicio clínico.
- Limitaciones de contexto: la longitud de contexto no está documentada en la información disponible, por lo que se desconoce su capacidad para manejar historiales clínicos extensos.
- Limitaciones de idioma: no se especifican los idiomas soportados; es probable que el entrenamiento se haya centrado en inglés, aunque no se confirma.
- Restricciones de licencia: Apache 2.0 permite uso comercial sin restricciones, pero se recomienda revisar los términos del modelo base Qwen3-VL.
- Caveat de producción: este repositorio es una cuantización de un tercero (hugnever21), no una versión oficial de Alibaba DAMO Academy. Se recomienda validar el comportamiento del modelo cuantizado frente al original antes de usarlo en entornos clínicos.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/hugnever21/ClinFusion-8B-Q8
- Modelo original en HuggingFace: https://huggingface.co/Alibaba-DAMO-Academy/ClinFusion-8B
- Repositorio GitHub oficial: https://github.com/Alibaba-DAMO-Academy/ClinFusion
- Paper en arXiv: https://arxiv.org/abs/2607.24743
- Versión HTML del paper: https://arxiv.org/html/2607.24743v2

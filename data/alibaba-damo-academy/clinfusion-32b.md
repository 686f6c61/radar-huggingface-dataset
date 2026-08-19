# Alibaba-DAMO-Academy/ClinFusion-32B

## Resumen

ClinFusion-32B es el modelo insignia de la serie ClinFusion, un sistema de modelo de lenguaje multimodal (MLLM) desarrollado por Alibaba DAMO Academy, orientado a la comprensión médica holística. Está construido sobre el backbone de lenguaje Qwen3-VL-32B-Instruct y combina dos codificadores de visión (DINOv2 y ConvNeXt) mediante un operador de fusión propio denominado Cascade Spatial-Aware Locality Fusion. Este diseño permite procesar tanto imágenes médicas 2D (radiografías, ecografías, histología) como volúmenes 3D nativos en formato NIfTI (CT, RM), algo poco común en modelos open source.

El modelo se publica con licencia Apache 2.0, lo que permite uso comercial y modificación. Según la model card, supera a modelos propietarios como GPT-5.2 y Gemini-3-Flash en 13 de 16 suites de evaluación, y a modelos médicos open source como Hulu-Med y Lingshu en 20 de 24 benchmarks. Aunque no se detallan cifras concretas en la información disponible, el modelo está diseñado para razonamiento clínico complejo, generación de informes médicos y seguimiento de instrucciones visuales y textuales de alta fidelidad. Con 32 mil millones de parámetros, requiere hardware de gama alta para su ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3-VL-32B-Instruct + DINOv2 + ConvNeXt) |
| Parametros totales | 32B (nominal, según la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | inglés y chino (según el repositorio de GitHub) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Nota: el archivo safetensors reporta un valor de 3.911.600, que probablemente corresponde al número de tensores, no a los parámetros totales. El tamaño del repositorio (76,2 GB) es coherente con un modelo de 32B en precisión FP16/BF16.

## Arquitectura y entrenamiento

ClinFusion-32B adopta una arquitectura multimodal compuesta por tres componentes principales: un backbone de lenguaje Qwen3-VL-32B-Instruct, un codificador de visión DINOv2 (para semántica espacial densa) y un codificador CLIP-ConvNeXt (para características estructurales y holísticas). Ambos codificadores se integran mediante el operador Cascade Spatial-Aware Locality Fusion, que optimiza la fusión de información visual a múltiples escalas espaciales. Esta composición permite procesar imágenes 2D y volúmenes 3D (NIfTI) sin necesidad de preprocesamiento específico por modalidad.

No se han publicado detalles sobre el proceso de entrenamiento: número de tokens, composición del dataset, uso de RLHF/DPO o técnicas de alineación. La model card solo indica que el modelo se basa en Qwen3-VL-32B-Instruct y que el sistema completo está diseñado para tareas médicas. Tampoco se mencionan innovaciones en decodificación o atención. La ausencia de estos datos limita la evaluación de su metodología de entrenamiento.

## Capacidades

- Comprensión multimodal de imágenes médicas 2D (radiografías, ecografías, histología) y volúmenes 3D (CT, RM en formato NIfTI).
- Razonamiento clínico complejo: síntesis de información de informes largos, casos con múltiples imágenes y benchmarks médicos textuales.
- Generación de informes médicos de alta fidelidad y seguimiento de instrucciones visuales y textuales.
- Soporte nativo de tool-use para flujos de trabajo clínicos (según la model card).
- Capacidades multilingües: inglés y chino (según el repositorio de GitHub).
- Rendimiento competitivo frente a modelos propietarios en benchmarks médicos (afirmación de la model card, sin cifras concretas).

## Casos de uso

- Diagnóstico asistido por imagen: el modelo puede analizar radiografías o tomografías y proporcionar una lista de posibles diagnósticos diferenciales, ayudando al radiólogo a priorizar casos urgentes. Su capacidad para procesar volúmenes 3D nativos lo hace adecuado para entornos hospitalarios con datos CT/RM.
- Generación automática de informes médicos: a partir de una imagen o un conjunto de imágenes, ClinFusion-32B puede redactar un informe estructurado en lenguaje natural, reduciendo la carga administrativa del personal clínico. La generación de informes de alta fidelidad es una de sus capacidades destacadas.
- Revisión de literatura y casos clínicos: al combinar comprensión textual y visual, puede resumir artículos con figuras médicas o comparar casos similares, útil para investigación y formación continuada.
- Soporte a la decisión clínica en telemedicina: integrado en plataformas de consulta remota, puede analizar imágenes enviadas por pacientes y sugerir derivaciones o pruebas complementarias, siempre con supervisión humana.
- Educación médica: el modelo puede generar preguntas de examen a partir de imágenes, explicar hallazgos radiológicos o simular casos clínicos para estudiantes de medicina.
- Investigación en imagen médica: los investigadores pueden usar ClinFusion-32B para anotar grandes conjuntos de datos, extraer características de imágenes o generar descripciones de hallazgos en estudios retrospectivos.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card afirma que ClinFusion-32B supera a modelos open source (Hulu-Med, Lingshu) en 20 de 24 benchmarks y a modelos propietarios (GPT-5.2, Gemini-3-Flash) en 13 de 16 suites de evaluación, pero no se proporcionan tablas con puntuaciones concretas (MMLU, HumanEval, GSM8K, etc.). Tampoco se especifican los nombres de los benchmarks médicos utilizados. Se recomienda consultar el repositorio de GitHub o el artículo de arXiv para obtener datos detallados cuando estén disponibles.

## Requisitos de hardware

- VRAM estimada: un modelo de 32B en FP16 requiere aproximadamente 64 GB de VRAM solo para los pesos, más overhead de activaciones y contexto. Con cuantización de 8 bits se reduciría a unos 32 GB, y con 4 bits a unos 16 GB, aunque no se han publicado versiones cuantizadas oficiales.
- GPUs recomendadas: para inferencia en FP16 se necesitan al menos dos GPUs de 40 GB (p. ej., A100 40GB, H100 80GB) o cuatro GPUs de 24 GB (RTX 4090). Para cuantización de 4 bits podría caber en una sola GPU de 24 GB, pero no hay garantías de compatibilidad.
- Opciones de despliegue: al estar basado en Qwen3-VL, es probable que sea compatible con frameworks como vLLM, TGI o llama.cpp, aunque no se confirma en la documentación. El repositorio de GitHub menciona scripts de inferencia y evaluación, pero no detalla el stack de servidores.
- Latencia y throughput: no se han publicado datos. En una configuración multi-GPU con A100, se puede esperar una latencia de varios segundos por consulta multimodal, dependiendo del tamaño de la imagen y la longitud de la respuesta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| ClinFusion-32B | 32B | no disponible | Apache 2.0 | HuggingFace, GitHub | Multimodal médico 2D/3D, basado en Qwen3-VL |
| Hulu-Med | no disponible | no disponible | no disponible | no disponible | Mencionado como competidor open source, sin más datos |
| Lingshu | no disponible | no disponible | no disponible | no disponible | Mencionado como competidor open source, sin más datos |
| GPT-5.2 | no disponible (propietario) | no disponible | propietaria | API | Modelo cerrado, referencia en la model card |
| Gemini-3-Flash | no disponible (propietario) | no disponible | propietaria | API | Modelo cerrado, referencia en la model card |

No se dispone de información suficiente sobre Hulu-Med y Lingshu para una comparación cuantitativa. La model card indica que ClinFusion-32B los supera en la mayoría de benchmarks, pero sin cifras.

## Limitaciones y advertencias

- Sesgos en datos médicos: al entrenarse con datos clínicos, puede heredar sesgos demográficos o de prevalencia de enfermedades, lo que requiere validación en poblaciones diversas antes de uso clínico real.
- Riesgo de alucinación: como todo LLM, puede generar información plausible pero incorrecta, especialmente en casos ambiguos o con imágenes de baja calidad. Nunca debe usarse como única fuente de diagnóstico sin supervisión médica.
- Limitaciones de contexto: no se ha especificado la longitud de contexto; si hereda la de Qwen3-VL, probablemente sea amplia, pero no está confirmado. Para volúmenes 3D grandes, el procesamiento puede requerir particionado.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento pueden tener restricciones adicionales no documentadas. Se recomienda revisar el repositorio de GitHub para términos específicos.
- Requisitos de hardware: el tamaño del modelo (32B) limita su despliegue a entornos con GPUs de alta capacidad, lo que puede ser una barrera para pequeñas clínicas o investigadores con recursos limitados.
- Falta de documentación detallada: no se han publicado especificaciones de entrenamiento, benchmarks numéricos ni guías de cuantización, lo que dificulta la evaluación independiente y la reproducción de resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Alibaba-DAMO-Academy/ClinFusion-32B
- Repositorio de GitHub: https://github.com/Alibaba-DAMO-Academy/ClinFusion
- Artículo en arXiv: https://arxiv.org/abs/2607.24743

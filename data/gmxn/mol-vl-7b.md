# gmxn/Mol-VL-7B

## Resumen

Mol-VL-7B es un modelo de visión-lenguaje (VLM) especializado en la comprensión óptica de estructuras químicas (Optical Chemical Structure Understanding, OCSU). Lo desarrolla el equipo PharMolix (publicado bajo la cuenta `gmxn` en Hugging Face) y parte de los pesos preentrenados de Qwen2-VL, sobre los que se aplica un ajuste fino supervisado con el conjunto de entrenamiento Vis-CheBI20. El objetivo es que el modelo sea capaz de interpretar imágenes de moléculas (diagramas de estructura química) y responder preguntas sobre ellas en lenguaje natural.

El problema que resuelve es concreto: convertir imágenes de estructuras químicas en representaciones y descripciones utilizables para descubrimiento científico, algo que los VLM generalistas abordan de forma deficiente por la naturaleza simbólica y densa de los diagramas químicos. Mol-VL-7B se presenta como una base especializada para tareas de reconocimiento, descripción y razonamiento sobre moléculas a partir de su representación gráfica.

El modelo tiene 8.291.375.616 parámetros (aproximadamente 8,3 mil millones), se distribuye en formato safetensors con licencia Apache 2.0 y un tamaño de repositorio de 16,6 GB. La información pública disponible es escasa: no se detallan idiomas soportados, pipeline ni resultados de benchmarks en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basada en Qwen2-VL (vision-lenguaje) |
| Parametros totales | 8.291.375.616 (~8,3 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Mol-VL-7B es un modelo de visión-lenguaje construido sobre la arquitectura Qwen2-VL, que combina un codificador visual con un modelo de lenguaje basado en transformer para procesar entradas conjuntas de imagen y texto. El modelo parte de los pesos preentrenados de Qwen2-VL y se ajusta de forma adicional sobre el conjunto de entrenamiento Vis-CheBI20, orientado a la comprensión de estructuras químicas ópticas.

El ajuste fino se realiza sobre la tarea OCSU (Optical Chemical Structure Understanding), descrita en el artículo arXiv:2501.15415. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales más allá de la herencia de la arquitectura Qwen2-VL y el ajuste específico de dominio.

## Capacidades

- Comprensión de imágenes de estructuras químicas (diagramas moleculares) y respuesta en lenguaje natural sobre ellas.
- Generación de texto descriptivo a partir de entradas visuales de moléculas.
- Razonamiento multimodal imagen-texto heredado de la base Qwen2-VL.
- Procesamiento de entradas conjuntas de imagen y texto en un único modelo.
- Capacidades generales de VLM (descripción de imágenes, respuesta a preguntas visuales) en la medida en que se conserven tras el ajuste fino.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión o audio especial: no disponible en la información proporcionada.

## Casos de uso

- Digitalización de literatura química: el modelo puede procesar imágenes de estructuras moleculares extraídas de artículos y patentes para generar descripciones textuales o representaciones utilizables en bases de datos, reduciendo el trabajo manual de transcripción.
- Asistencia en descubrimiento de fármacos: al interpretar diagramas de estructuras químicas, puede servir como componente de un pipeline que relacione imágenes de moléculas con información textual para tareas de cribado o anotación.
- Extracción de información de figuras científicas: integrado en herramientas de minería de documentos, permite convertir figuras con estructuras químicas en texto estructurado para su indexación y búsqueda.
- Educación química: puede emplearse para responder preguntas sobre estructuras representadas en imágenes, como apoyo a plataformas de aprendizaje que trabajan con diagramas moleculares.
- Enriquecimiento de datasets químicos: el modelo puede generar descripciones o anotaciones automáticas sobre imágenes de moléculas para ampliar conjuntos de datos de entrenamiento o evaluación.
- Verificación de representaciones: como modelo especializado en OCSU, puede utilizarse para comprobar la coherencia entre una imagen de estructura química y su descripción textual en procesos de control de calidad de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de ~8,3 mil millones de parámetros en precisión completa (bf16/fp16) se requiere del orden de 16-17 GB solo para los pesos, más memoria para el codificador visual y el contexto.
- GPU recomendadas: no especificadas por el autor; por tamaño, cabría en A100 (40/80 GB), H100 y GPUs consumer de gama alta con suficiente VRAM.
- ¿Cabe en GPU consumer? Previsiblemente en modelos con 24 GB o más de VRAM (por ejemplo, RTX 3090/4090) en bf16, aunque no hay confirmación oficial; con cuantización podría reducirse el requisito, pero no se documentan cuantizaciones disponibles.
- Opciones de despliegue: no documentadas en la información proporcionada; al derivar de Qwen2-VL, cabría esperar compatibilidad con frameworks que soporten dicha arquitectura, pero no se confirma.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mol-VL-7B | ~8,3 mil millones | no disponible | Comprensión de estructuras químicas (OCSU) | Apache 2.0 | Hugging Face |
| Qwen2-VL-7B | ~8,3 mil millones | no disponible en esta ficha | VLM generalista | no disponible en esta ficha | Hugging Face |
| Alternativas especializadas en química | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo ni de otros modelos especializados en OCSU en la información proporcionada.

## Limitaciones y advertencias

- La información pública es muy limitada: no se documentan idiomas, contexto, cuantizaciones ni benchmarks, lo que dificulta evaluar su rendimiento real.
- Al ser un ajuste fino sobre un dataset específico (Vis-CheBI20), el modelo puede sobreajustarse al dominio y degradar capacidades generales de VLM.
- Riesgo de alucinación inherente a los modelos generativos, especialmente al interpretar estructuras químicas complejas o ambiguas.
- No se especifican sesgos conocidos; al heredar la base Qwen2-VL, podría arrastrar los sesgos de dicho modelo.
- Limitaciones de idioma no documentadas; no se garantiza un rendimiento multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones de los datos de entrenamiento (Vis-CheBI20) y de la base Qwen2-VL.
- No se documentan requisitos de hardware ni opciones de despliegue, lo que añade incertidumbre para producción.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/gmxn/Mol-VL-7B
- Dataset Vis-CheBI20: https://huggingface.co/datasets/PharMolix/Vis-CheBI20
- Artículo OCSU (arXiv): https://arxiv.org/pdf/2501.15415
- Repositorio GitHub (scripts de entrenamiento y evaluación): https://github.com/PharMolix/OCSU

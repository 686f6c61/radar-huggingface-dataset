# openeurollm/bsc-edu-annotator

## Resumen

BSC-EDU Annotator es un modelo de regresión basado en un encoder de embeddings multilingüe, desarrollado por el Barcelona Supercomputing Center (BSC) en el marco del consorcio OpenEuroLLM y financiado parcialmente por el Ministerio para la Transformación Digital y de la Función Pública dentro del proyecto ALIA. Su función es asignar una puntuación continua de valor educativo, en el rango [0, 4], a documentos web, lo que permite ordenar o filtrar corpus según su calidad educativa estimada.

El modelo parte de Snowflake/snowflake-arctic-embed-l-v2.0, un encoder multilingüe de 567,7 millones de parámetros, y se ha afinado como regresor sobre 500.000 ejemplos por idioma en español, catalán y euskera, usando los primeros 512 tokens de cada ejemplo. Al producir predicciones continuas en lugar de clases discretas, facilita umbrales flexibles en pipelines de curación de datos.

Es relevante ahora porque encaja en las necesidades de filtrado de calidad de corpus para el entrenamiento de modelos de lenguaje de gran escala, especialmente en lenguas con menos recursos como el catalán y el euskera, y porque su licencia Apache 2.0 permite su uso comercial y su integración en infraestructuras de datos abiertas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa), basado en snowflake-arctic-embed-l-v2.0 |
| Parámetros totales | 567.754.752 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens (longitud usada en entrenamiento); longitud máxima del modelo base no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | 74 idiomas según el modelo base; entrenamiento específico en español, catalán y euskera |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un encoder de tipo transformer basado en XLM-RoBERTa, heredado de Snowflake/snowflake-arctic-embed-l-v2.0, con 567.754.752 parámetros. Sobre la representación del encoder se añade una cabeza de regresión que produce una puntuación continua en el intervalo [0, 4], orientada a estimar el valor educativo de un documento. No se trata de un modelo generativo ni de un clasificador de clases discretas, sino de un regresor que permite aplicar umbrales flexibles aguas abajo.

El ajuste fino se realizó con 500.000 ejemplos por idioma en español, catalán y euskera, empleando los primeros 512 tokens de cada ejemplo. La model card no detalla la composición exacta del dataset, el número total de tokens procesados, la presencia de RLHF/DPO ni los hiperparámetros de entrenamiento (régimen de precisión, tasa de aprendizaje, épocas), que figuran como "More Information Needed". Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal, propias de modelos generativos y no aplicables a este encoder.

## Capacidades

- Extracción de embeddings de texto multilingües mediante el pipeline `feature-extraction`.
- Regresión de valor educativo: asigna una puntuación continua en [0, 4] a documentos web.
- Ordenación y filtrado de corpus por calidad educativa estimada con umbrales configurables.
- Cobertura multilingüe teórica de 74 idiomas por herencia del modelo base, con ajuste específico en español, catalán y euskera.
- Procesamiento de hasta 512 tokens por documento en la configuración de entrenamiento.
- Compatibilidad con Text Embeddings Inference (tag `text-embeddings-inference`) y endpoints compatibles.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un encoder, no un modelo generativo.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Curación de corpus para entrenamiento de LLM: puntuar cada documento de un crawl web con el regresor y descartar los que queden por debajo de un umbral (por ejemplo, 2,5 sobre 4) antes de incorporarlos al dataset de preentrenamiento.
- Filtrado de contenido educativo en portales y repositorios: aplicar el modelo a páginas indexadas para priorizar materiales didácticos en español, catalán o euskera en motores de búsqueda internos.
- Construcción de datasets paralelos de calidad: usar las puntuaciones para equilibrar la proporción de documentos educativos entre las tres lenguas objetivo y mitigar el desequilibrio de recursos.
- Enrutamiento de documentos en pipelines de datos: clasificar por puntuación continua y derivar los documentos de mayor valor a procesos de anotación humana o a etapas de deduplicación más costosas.
- Evaluación de la calidad de fuentes web para proyectos de datos abiertos: monitorizar la deriva de calidad de un dominio a lo largo del tiempo comparando la distribución de puntuaciones.
- Investigación en filtrado de datos multilingüe: emplear el modelo como línea base reproducible (Apache 2.0) para experimentos sobre selección de datos en lenguas de bajos recursos.
- Integración en servicios de embeddings: desplegar con Text Embeddings Inference para servir tanto los embeddings como la puntuación de calidad en una única infraestructura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye la sección de evaluación con todos los campos marcados como "More Information Needed", sin métricas de correlación, MAE, MSE ni comparaciones con otros clasificadores de calidad.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,3 GB solo para pesos (567,7 M de parámetros), más memoria para activaciones y batch.
- VRAM estimada en fp16/bf16: en torno a 1,2 GB para pesos, con overhead adicional según el tamaño de lote y la longitud de secuencia (máximo 512 tokens).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM es suficiente; A100, H100 o L40S permiten lotes grandes y alto throughput en servidores.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070 o superiores; también en GPUs de 8 GB con cuantización o lotes pequeños.
- Opciones de despliegue: transformers con PyTorch, Text Embeddings Inference (soporte nativo por tag), y servidores de embeddings compatibles con endpoints; no se documenta soporte GGUF ni llama.cpp.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BSC-EDU Annotator | 567,7 M | 512 tokens (entrenamiento) | Regresión de valor educativo [0, 4] | Apache 2.0 | Hugging Face (openeurollm) |
| Snowflake/snowflake-arctic-embed-l-v2.0 | ~568 M | hasta 8192 tokens (modelo base) | Embeddings multilingües | Apache 2.0 | Hugging Face |
| Clasificadores de calidad tipo FineWeb-Edu | no disponible | no disponible | Clasificación de calidad educativa (inglés) | no disponible | Hugging Face |

La comparación con FineWeb-Edu es cualitativa: aquel clasificador se centra en inglés y en clases discretas, mientras que BSC-EDU Annotator ofrece regresión continua y cobertura específica para español, catalán y euskera. No se dispone de datos de rendimiento comparativo entre ambos.

## Limitaciones y advertencias

- Sesgos: el ajuste se limita a español, catalán y euskera; el comportamiento en los otros idiomas del modelo base no está validado y puede degradarse.
- Riesgo de puntuaciones poco calibradas fuera de dominio: al ser un regresor entrenado sobre documentos web, la escala [0, 4] puede no transferirse bien a textos técnicos, literarios o conversacionales.
- Truncamiento: solo se usan los primeros 512 tokens, por lo que documentos largos se evalúan únicamente por su inicio, lo que puede infravalorar o sobrevalorar su calidad global.
- Alucinación en sentido estricto no aplica (no genera texto), pero las puntuaciones pueden ser erróneas o inconsistentes sin que el modelo lo indique.
- La model card no documenta sesgos conocidos, datos de evaluación ni limitaciones adicionales; se recomienda validar con un conjunto propio antes de usarlo en producción.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene revisar las condiciones del modelo base y de los datos de entrenamiento, no detallados.
- No apto para tareas generativas, de razonamiento o de diálogo; su uso fuera de la regresión de calidad no está soportado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/openeurollm/bsc-edu-annotator
- Modelo base: https://huggingface.co/Snowflake/snowflake-arctic-embed-l-v2.0
- OpenEuroLLM: https://openeurollm.eu
- Barcelona Supercomputing Center: https://www.bsc.es
- Proyecto ALIA: https://alia.gob.es
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference

# rafmacalaba/datause-classifier-multitask

## Resumen

`datause-classifier-multitask` es un modelo de clasificación de texto multitarea desarrollado por Rafael Macalaba, diseñado para analizar literatura de investigación y detectar si una página contiene datos, además de clasificar el documento en uno de 30 temas sectoriales. Se trata de un fine-tune del encoder `LiquidAI/LFM2.5-Encoder-230M` al que se le añaden dos cabezas de clasificación: un gate binario `has_data` y un clasificador de dominio `teratopic`.

El modelo aborda el problema de la monitorización y clasificación automática de datos usados en artículos científicos, un campo relevante para la extracción de información y la gestión de repositorios de investigación. Su arquitectura de encoder con doble cabeza permite procesar documentos largos (hasta 2048 tokens) y realizar ambas tareas de forma conjunta, lo que simplifica el pipeline y reduce costes computacionales.

Con 229,7 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware de consumo, y su licencia Apache 2.0 facilita su integración en proyectos comerciales. La relevancia actual radica en la creciente necesidad de automatizar el análisis de la producción científica, especialmente en contextos de ciencia abierta y evaluación de impacto de datos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder (fine-tune de `LiquidAI/LFM2.5-Encoder-230M`) con dos cabezas de clasificación |
| Parametros totales | 229.724.959 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (max_length de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `LiquidAI/LFM2.5-Encoder-230M`, un encoder transformer de 230 millones de parámetros, y se le añaden dos cabezas de clasificación independientes: una para el gate binario `has_data` (indica si la página contiene datos) y otra para el clasificador de dominio `teratopic` con 30 etiquetas sectoriales. Esta arquitectura multitarea permite compartir el encoder y procesar ambas tareas simultáneamente.

El entrenamiento se realizó durante 3 épocas con una tasa de aprendizaje de 2e-5, una longitud máxima de secuencia de 2048 tokens y precisión bf16. No se especifican detalles sobre el dataset de entrenamiento ni sobre técnicas de alineación como RLHF o DPO. La evaluación se hizo sobre un conjunto de validación reservado (holdout), reportando métricas separadas para cada cabeza.

## Capacidades

- Clasificación binaria de páginas: detecta si una página o documento contiene datos (gate `has_data`).
- Clasificación de dominio temático: asigna uno de 30 temas sectoriales predefinidos (etiquetas `teratopic`).
- Procesamiento multitarea en un solo paso: ambas cabezas operan sobre el mismo encoder, lo que reduce latencia y recursos.
- Manejo de documentos largos: soporta secuencias de hasta 2048 tokens, adecuado para párrafos extensos o secciones de artículos.
- Inferencia eficiente: al ser un modelo de 230M, puede ejecutarse en GPUs de consumo sin necesidad de hardware especializado.
- No se han documentado capacidades de generación de texto, tool calling, agentes ni multimodalidad.

## Casos de uso

- Revisión sistemática de literatura: el gate `has_data` filtra automáticamente los artículos que contienen conjuntos de datos, reduciendo el trabajo manual de los investigadores que necesitan localizar estudios con datos reutilizables.
- Indexación de repositorios científicos: el clasificador de dominio asigna automáticamente etiquetas temáticas a documentos, facilitando la organización y búsqueda en bases de datos bibliográficas.
- Monitorización de uso de datos en publicaciones: permite rastrear qué sectores (sanidad, energía, transporte, etc.) mencionan datos en sus investigaciones, útil para políticas de ciencia abierta.
- Automatización de pipelines de extracción de información: combinado con un sistema de extracción de nombres de datasets, el modelo puede preclasificar documentos antes de aplicar técnicas de NER, mejorando la precisión del flujo completo.
- Filtrado de contenido para plataformas de datos: plataformas que agregan investigaciones pueden usar el gate para decidir qué documentos requieren revisión humana o procesamiento adicional.
- Análisis de tendencias sectoriales en investigación: el clasificador de dominio permite agregar estadísticas sobre qué áreas temáticas producen más datos, información valiosa para financiadores y gestores de programas científicos.

## Benchmarks y rendimiento

La evaluación se realizó sobre un conjunto de validación (holdout) y se reportan métricas separadas para cada cabeza.

| Tarea | Metrica | Valor |
|---|---|---|
| Gate (página has_data) | Precision (threshold 0.95) | 0.9409 |
| Gate (página has_data) | Recall | 0.8785 |
| Gate (página has_data) | F1 | 0.9086 |
| Gate (página has_data) | % páginas negativas | 0.4604 |
| Domain (teratopic) | Micro F1 | 0.5245 |
| Domain (teratopic) | Macro F1 | 0.3940 |
| Domain (teratopic) | Mean average precision | 0.5031 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: al tener 229,7 millones de parámetros, en bf16 el modelo ocupa aproximadamente 460 MB, y en cuantización de 8 bits unos 230 MB. Cabe en GPUs con 4 GB o más, aunque no se han publicado mediciones oficiales.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 3060, o superiores). También puede ejecutarse en CPU con suficiente RAM.
- Opciones de despliegue: al ser un modelo de clasificación estándar, puede servirse con frameworks como Hugging Face Transformers, ONNX Runtime, o herramientas como FastAPI para inferencia en producción. No se mencionan integraciones específicas con vLLM u Ollama.
- Latencia y throughput: no disponibles, pero al ser un encoder de 230M, la inferencia es rápida en GPU (del orden de milisegundos por muestra) y aceptable en CPU.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo comparte categoría con otros clasificadores de texto basados en encoders pequeños, pero no hay datos públicos para establecer una comparación objetiva.

## Limitaciones y advertencias

- El clasificador de dominio presenta un rendimiento moderado (micro F1 0.5245), lo que implica que una parte significativa de las clasificaciones temáticas puede ser incorrecta; se recomienda validar los resultados en aplicaciones críticas.
- El gate `has_data` tiene un umbral de decisión en 0.95, lo que produce un 46% de páginas negativas; este umbral puede ajustarse según las necesidades del caso de uso, pero no se documentan otros valores.
- No se especifican los idiomas soportados; el modelo se ha entrenado presumiblemente con datos en inglés, pero no hay confirmación.
- Al ser un fine-tune de un encoder existente, hereda las limitaciones del modelo base (posibles sesgos, cobertura de dominios limitada, etc.).
- La licencia Apache 2.0 permite uso comercial, pero se debe citar la atribución correspondiente.
- No se documentan medidas de robustez frente a entradas adversarias ni se analizan sesgos demográficos o culturales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rafmacalaba/datause-classifier-multitask
- Paper relacionado (posiblemente sobre el mismo proyecto): https://arxiv.org/pdf/2605.30582
- Otro modelo del mismo autor: https://huggingface.co/rafmacalaba/datause-impact-classif

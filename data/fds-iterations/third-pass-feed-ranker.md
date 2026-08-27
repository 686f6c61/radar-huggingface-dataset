# FDS-Iterations/third-pass-feed-ranker

## Resumen

El modelo `FDS-Iterations/third-pass-feed-ranker` es un cross-encoder de clasificación de texto desarrollado por FDS-Iterations para puntuar la relevancia entre el título de un puesto de trabajo y el texto de una publicación en un feed social empresarial. Está diseñado como un reranker de tercera pasada: recibe un pequeño conjunto de candidatos (unas 20 publicaciones) ya preseleccionados por pasadas anteriores de recuperación y clasificación, y devuelve una puntuación numérica que indica cuán relevante es cada publicación para el espectador en función de su cargo. El modelo se basa en `cross-encoder/mmarco-mMiniLMv2-L12-H384-v1`, un MiniLM-L12 multilingüe de 12 capas y aproximadamente 117 millones de parámetros, y se distribuye bajo licencia Apache-2.0.

La relevancia de este modelo radica en su enfoque específico para feeds empresariales a gran escala, con un objetivo de rendimiento en CPU de servidor (unas 120 parejas por segundo con 8 hilos de CPU). Está entrenado con datos sintéticos generados mediante LLM y etiquetas obtenidas de embeddings de título a rol, lo que permite manejar títulos ruidosos (códigos de puesto, prefijos regionales, errores tipográficos) y abstenerse ante títulos sin rol (como ubicaciones o nombres). Su uso previsto es la reordenación de publicaciones en feeds corporativos, promoviendo contenido relevante al primer puesto solo si supera una margen de confianza calibrable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder basado en MiniLM-L12 (12 capas, 384 dimensiones ocultas) |
| Parametros totales | 117.641.089 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | max_length de truncamiento de 160 tokens en el tokenizer (contexto real no especificado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | multilingüe (15 regiones, 8 idiomas no ingleses; el modelo base es mmarco multilingüe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder de transformador con arquitectura MiniLM-L12, que codifica conjuntamente el par (título de puesto, texto de publicación) y produce una puntuación de relevancia mediante una capa de clasificación. No es un modelo MoE ni híbrido; es un transformer de atención estándar de 12 capas. El entrenamiento se realizó mediante fine-tuning del modelo base `cross-encoder/mmarco-mMiniLMv2-L12-H384-v1` como un regresor de relevancia pointwise. Los datos de entrenamiento son enteramente sintéticos: títulos de puestos derivados de O*NET (adaptados a 15 regiones), publicaciones de feed generadas por LLM (específicamente un modelo Qwen) y etiquetas de relevancia producidas mediante un embedding de título a rol calibrado con Claude. Las slates de 20 elementos se construyeron simulando un orden inicial basado en popularidad para imitar el comportamiento real de un feed. No se empleó RLHF ni DPO; el ajuste es de supervisión directa sobre la tarea de regresión.

## Capacidades

- Puntuación de relevancia entre un título de puesto y un texto de publicación, devolviendo un float mayor = más relevante.
- Reranking de listas cortas (slates de ~20 elementos) de feeds empresariales, promoviendo el candidato más relevante al primer puesto si supera un umbral.
- Robustez ante títulos ruidosos (códigos de puesto, prefijos regionales, errores tipográficos) con una recuperación de 0.47 y precisión de 0.77 en escenarios de títulos sucios.
- Capacidad de abstención: ante títulos sin rol (p. ej. "Redmond office, WA") no promueve nada, con over-fire de 0.0.
- Funcionamiento multilingüe: soporta feeds localizados en 8 idiomas no ingleses y 15 regiones, con recuperación de 0.46 en feeds de contenido local.
- No es un modelo generativo ni de razonamiento; solo clasificación de pares de texto.

## Casos de uso

- **Personalización de feeds empresariales**: el modelo puede reordenar las publicaciones del feed de una empresa según la relevancia del puesto de cada empleado, promoviendo contenido de trabajo específico (p. ej., una nueva guía de protocolo para enfermeras) al primer lugar.
- **Filtrado de contenido corporativo**: se puede integrar en un pipeline de moderación para priorizar anuncios de RR. HH., cambios de procesos o políticas que afectan a roles concretos, reduciendo el ruido de publicaciones generales.
- **Sistema de recomendación de formación**: dado un título de puesto, el modelo puede puntuar publicaciones internas de documentación técnica o cursos y mostrar las más pertinentes al usuario.
- **Alertas de empleado**: en intranets de grandes organizaciones, el modelo puede clasificar y resaltar noticias de seguridad, cambios de turno o avisos operativos relevantes para cada rol, incluso con títulos de puesto desordenados.
- **Abstención inteligente**: ante títulos que no describen una función (como ubicaciones o nombres propios), el modelo no promueve nada, evitando falsos positivos en sistemas de personalización de contenido.
- **Adaptación multilingüe**: en empresas con plantillas en varias regiones, el modelo puede puntuar feeds en idiomas locales (p. ej., alemán, francés, japonés) con contenido en el idioma nativo, manteniendo una recuperación útil de ~0.46.

## Benchmarks y rendimiento

La model card reporta métricas de evaluación en escenarios específicos, con un umbral de decisión τ=0.5. No se proporcionan benchmarks estándar (MMLU, HumanEval, etc.) porque el modelo no es un LLM general.

| Escenario | Recovery | Precision | False-promotion |
|---|---|---|---|
| Títulos limpios | 0.50 | 0.76 | 0.013 |
| Títulos ruidosos (códigos, prefijos, erratas) | 0.47 | 0.77 | 0.015 |
| Roles front-line / deskless | 0.55 | 0.80 | 0.015 |
| Títulos basura ("Redmond office, WA") | — abstiene — | — | over-fire 0.0 |
| Feeds locales en idioma nativo | 0.46 | — | 0.0 |

El regret (promover algo peor que el slot-1 original) es <1% de los feeds en todos los escenarios. No se han publicado comparaciones con otros modelos.

## Requisitos de hardware

- **CPU**: el modelo está diseñado para ejecución en CPU de servidor, con un rendimiento objetivo de ~120 pares/segundo en 8 hilos de CPU. No requiere GPU para inferencia.
- **VRAM**: no se especifica, pero al ser un modelo de 117M parámetros en fp32 ocupa ~470 MB; en cuantización no disponible, pero en CPU no se usa VRAM.
- **GPU**: no es necesaria, aunque puede ejecutarse en cualquier GPU con suficiente memoria (p. ej., RTX 3060 o superior) para inferencia por lotes.
- **Opciones de despliegue**: compatible con `transformers` (AutoModelForSequenceClassification) y `sentence_transformers.CrossEncoder`. No se mencionan vLLM, llama.cpp ni Ollama, pero al ser un cross-encoder pequeño, se puede servir con frameworks de clasificación de texto como `text-embeddings-inference` (el modelo tiene la etiqueta `endpoints_compatible` y `text-embeddings-inference` en HuggingFace).
- **Latencia y throughput**: en CPU de servidor con 8 hilos, ~120 pares/segundo (≈8.3 ms por par). En GPU sería significativamente menor.

## Comparativa con modelos similares

No se dispone de comparativas directas publicadas en la información disponible. Como referencia, el modelo base `cross-encoder/mmarco-mMiniLMv2-L12-H384-v1` es un cross-encoder multilingüe para búsqueda de pasajes, con 117M parámetros y licencia Apache-2.0. Otros cross-encoders de reranking típicos (p. ej., `BAAI/bge-reranker-base`, `cross-encoder/ms-marco-MiniLM-L-6-v2`) tienen arquitecturas similares pero no están especializados en feeds empresariales ni en el manejo de títulos de puesto ruidosos. No se dispone de datos de comparación cuantitativa con estos modelos.

## Limitaciones y advertencias

- **Entrenamiento 100% sintético**: el modelo no ha visto contenido real de feeds de producción, por lo que su rendimiento puede degradarse en datos reales. Se debe validar en los propios datos antes de uso en producción.
- **Brecha cross-lingüística**: un título no inglés contra un feed solo en inglés se recupera mal (~0.16 de recuperación). Solo funciona bien cuando tanto el título como el contenido están en el idioma local.
- **Sin modelado de prioridad de tipo de contenido**: no distingue entre una nota de experimento y una corrección de bug sobre el mismo tema y rol; es demasiado sutil para un modelo pequeño de CPU.
- **Relevancia basada solo en título**: no tiene noción de importancia o recencia de la publicación; toda esa lógica debe añadirse en el nivel de decisión.
- **Riesgo de alucinación**: como modelo de clasificación, no genera texto, pero las puntuaciones pueden ser poco fiables en entornos con títulos ambiguos o fuera de su distribución sintética.
- **Licencia**: Apache-2.0, pero el modelo base `mmarco-mMiniLMv2-L12-H384-v1` tiene su propia licencia que debe verificarse. Además, las publicaciones de entrenamiento fueron generadas con un modelo Qwen, por lo que se deben revisar los términos de uso de Qwen para contenido generado.

## Enlaces

- [HuggingFace - FDS-Iterations/third-pass-feed-ranker](https://huggingface.co/FDS-Iterations/third-pass-feed-ranker)
- [Modelo base: cross-encoder/mmarco-mMiniLMv2-L12-H384-v1](https://huggingface.co/cross-encoder/mmarco-mMiniLMv2-L12-H384-v1)
- [Repositorio de referencia sobre rerankers (awesome-rerankers)](https://github.com/agentset-ai/awesome-rerankers)
- [Leaderboard de modelos de IA (referencia general)](https://llm-stats.com/)

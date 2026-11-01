# danish-foundation-models/propella-bekko-a8m

## Resumen
Propella-bekko-a8m es un modelo de clasificación de documentos desarrollado por danish-foundation-models, que destila el anotador de documentos propella-1-4b de ellamind en una arquitectura compacta de 106 millones de parámetros. El modelo recibe un documento y devuelve, en una única pasada forward y sin generar texto, 17 propiedades estructuradas en JSON: integridad del contenido, tipo de documento, sector empresarial, calidad, densidad informativa, valor educativo, sesgo comercial, seguridad, presencia de PII y relevancia geográfica, entre otras.

La relevancia del modelo reside en su relación calidad/rendimiento: anota 348 documentos por segundo en una sola RTX A6000, frente a los 0,06 documentos por segundo de su modelo maestro de 4B parámetros, manteniendo un acuerdo macro-F1 de 0,489 frente a las anotaciones de DeepSeek-V4.1-Flash. Está pensado para curar corpus masivos multilingües (20 idiomas, incluidos danés, sueco, noruego, islandés, feroés y las principales lenguas europeas) sin incurrir en los costes de inferencia de un LLM generativo.

La arquitectura combina un backbone de embeddings (bekko-embedding-v1-a8m) con cabezas independientes por propiedad, y se distribuye con licencia MIT tanto en pesos como en datos de anotación y código de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de embeddings (bekko-embedding-v1-a8m) con cabezas de clasificación independientes por propiedad |
| Parametros totales | 106.200.388 (106M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens de la cabecera del documento + 128 tokens de la cola (1.152 tokens en total), más características de longitud a nivel de documento |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Multilingüe: da, sv, no, is, fo, nl, de, fi, fr, it, es, pl, cs, hu, ro, pt, en (20 idiomas en el entrenamiento) |
| Licencia | MIT |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento
El modelo utiliza como backbone el encoder `bekko-embedding-v1-a8m` de hotchpotch, sobre el que se añaden cabezas de clasificación independientes, una por propiedad: softmax para las propiedades de selección única (ordinales y binarias) y sigmoid para las de selección múltiple (multi-label). No existe condicionamiento cruzado entre propiedades: cada una se predice de forma independiente a partir de un estado compartido del documento. La entrada combina 1.024 tokens de la cabecera del documento y 128 tokens de su cola, de modo que no se pierde el final de documentos largos; además, se pasan características de longitud a nivel de documento a las cabezas. Las propiedades ordinales se decodifican al nivel esperado mediante `round(Σ p_i · rank_i)` en lugar de `argmax`, lo que aporta unos +0,013 de QWK.

El entrenamiento se realizó por destilación a partir de las etiquetas de propella-1-4b sobre los corpus Dynaword, FineWeb-2 y FinePDFs, cubriendo 20 idiomas y 844.912 documentos. Se emplearon 2 épocas con 65.536 tokens por lote, completando el entrenamiento en 92 minutos sobre una única Quadro RTX 8000. La función de pérdida combina entropía cruzada para las propiedades de selección única, entropía cruzada binaria para las de selección múltiple y una pérdida F1 a nivel de token para la detección de PII. Las anotaciones resultantes y el código de entrenamiento se publican de forma abierta.

## Capacidades
- Anotación de documentos en una única pasada forward, sin generación de texto y sin prompt específico de tarea.
- Predicción de 17 propiedades estructuradas: `content_integrity`, `content_ratio`, `content_length`, `content_type`, `business_sector`, `technical_content`, `content_quality`, `information_density`, `educational_value`, `reasoning_indicators`, `audience_level`, `commercial_bias`, `time_sensitivity`, `content_safety`, `pii_presence`, `regional_relevance` y `country_relevance`.
- Clasificación multi-label en propiedades como tipo de contenido (18 etiquetas), sector empresarial (37 etiquetas), contenido técnico (7 etiquetas), relevancia regional (14 etiquetas) y relevancia por país (749 etiquetas).
- Detección de información personal identificable (PII) con pérdida F1 a nivel de token.
- Capacidades multilingües en 20 idiomas, con especial cobertura de lenguas nórdicas y europeas.
- No dispone de soporte de tool calling, function calling ni razonamiento multi-paso: es un clasificador, no un modelo generativo.
- No dispone de modo thinking, visión ni audio.

## Casos de uso
- Curación de corpus web a gran escala: el modelo permite filtrar y etiquetar millones de documentos de fuentes como FineWeb-2 o FinePDFs por calidad, densidad informativa y proporción de contenido frente a boilerplate, a 348 documentos por segundo en una sola GPU, lo que hace viable procesar corpus completos en horas en lugar de semanas.
- Construcción de datasets de entrenamiento de alta calidad: las propiedades `content_quality`, `information_density` y `educational_value` permiten seleccionar subconjuntos de documentos con valor didáctico o informativo para entrenar modelos de lenguaje, sustituyendo filtros heurísticos por clasificación supervisada.
- Detección y eliminación de PII en pipelines de cumplimiento: la cabeza `pii_presence` con pérdida F1 a nivel de token permite marcar documentos con datos personales antes de su publicación o uso en entrenamiento, integrándose en procesos de gobernanza de datos y RGPD.
- Moderación y auditoría de seguridad de contenido: la propiedad `content_safety` clasifica la presencia de contenido inapropiado o dañino, útil para revisiones automáticas de corpus y para priorizar la revisión humana en los casos marcados.
- Enrutamiento y clasificación de documentos por sector y tipo: `business_sector` y `content_type` permiten organizar repositorios documentales, enrutar documentos a equipos o índices especializados y construir taxonomías automáticas sin intervención manual.
- Análisis de sesgo comercial y vigencia temporal: `commercial_bias` y `time_sensitivity` ayudan a detectar contenido promocional o con valor que decae rápidamente, útil en sistemas de recomendación de contenido y en la selección de documentos para tareas sensibles a la actualidad.
- Anotación multilingüe de corpus nórdicos y europeos: al cubrir danés, sueco, noruego, islandés, feroés y las principales lenguas europeas, el modelo sirve para proyectos de investigación en lingüística de corpus y para la construcción de recursos en lenguas con menos herramientas disponibles.
- Evaluación de accesibilidad y adecuación de audiencia: `audience_level` y `content_ratio` permiten estimar la sofisticación del texto y su legibilidad, aplicable a la adaptación de contenidos educativos o divulgativos.

## Benchmarks y rendimiento
El autor reporta el acuerdo macro-F1 con las anotaciones de DeepSeek-V4.1-Flash y GLM-5.3-Flash sobre los mismos 300 documentos de test reservados; el azar (predecir siempre la etiqueta más frecuente) se sitúa en 0,123.

| Modelo | Parámetros | Documentos/s | vs DeepSeek | vs GLM-5.3 |
|---|---|---|---|---|
| propella-bekko-a25m | 123M | 186 | 0,523 | 0,522 |
| **propella-bekko-a8m** | 106M | 348 | 0,489 | 0,479 |
| propella-bekko-static | 206M | 686 | 0,479 | 0,468 |
| propella-1-0.6b | 600M | 0,14 | 0,498 | 0,501 |
| propella-1-1.7b | 1,7B | 0,14 | 0,547 | 0,534 |
| propella-1-4b | 4B | 0,06 | 0,571 | 0,549 |
| GLM-5.3-Flash | — | 0,41 | 0,659 | — |
| DeepSeek-V4.1-Flash | — | 0,34 | — | 0,659 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo es un clasificador de documentos y no un modelo generativo.

## Requisitos de hardware
- VRAM estimada para inferencia: con 106M parámetros en fp32, los pesos ocupan aproximadamente 0,42 GB; en fp16, unos 0,21 GB. La memoria total requerida, incluyendo activaciones para lotes grandes, se mantiene por debajo de 2-3 GB en la mayoría de configuraciones.
- GPU recomendadas: el autor reporta 348 documentos por segundo en una RTX A6000; el entrenamiento se realizó en una Quadro RTX 8000. Cualquier GPU moderna con al menos 4 GB de VRAM es suficiente.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070, RTX 4090 y similares, así como en GPUs integradas con suficiente memoria compartida para lotes pequeños.
- Opciones de despliegue: al ser un modelo PyTorch con pesos safetensors y un backbone de transformers, puede servirse con PyTorch nativo, con `transformers` para el backbone y carga manual de las cabezas; no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI para este clasificador.
- Latencia y throughput: 348 documentos por segundo en una RTX A6000 según el autor; el rendimiento escala con el tamaño de lote y la GPU empleada.

## Comparativa con modelos similares

| Modelo | Parámetros | Documentos/s | Acuerdo vs DeepSeek | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| propella-bekko-a8m | 106M | 348 | 0,489 | MIT | HuggingFace |
| propella-bekko-a25m | 123M | 186 | 0,523 | No disponible | HuggingFace (familia propella-bekko) |
| propella-bekko-static | 206M | 686 | 0,479 | No disponible | HuggingFace (familia propella-bekko) |
| propella-1-4b | 4B | 0,06 | 0,571 | No disponible | HuggingFace (ellamind) |

La comparativa relevante se establece dentro de la propia familia propella: a8m sacrifica algo de acuerdo (0,489 frente a 0,523 de a25m) a cambio de casi duplicar el throughput (348 frente a 186 documentos/s). Frente a los modelos propella-1 generativos, el acuerdo es menor (0,489 frente a 0,571 del maestro de 4B), pero el rendimiento es más de 5.000 veces superior en documentos por segundo.

## Limitaciones y advertencias
- El acuerdo con anotadores externos es moderado (macro-F1 de 0,489 frente a DeepSeek-V4.1-Flash y 0,479 frente a GLM-5.3-Flash), por lo que las etiquetas no deben tratarse como verdad absoluta en aplicaciones de alto riesgo.
- El modelo es una destilación de propella-1-4b y hereda sus posibles sesgos de anotación, incluidos los sesgos presentes en los corpus Dynaword, FineWeb-2 y FinePDFs utilizados para generar las etiquetas.
- La ventana de entrada está limitada a 1.024 tokens de cabecera más 128 de cola; documentos muy largos solo se representan parcialmente, lo que puede degradar la clasificación de propiedades que dependen de contenido distribuido a lo largo del texto.
- Las propiedades se predicen de forma independiente, sin condicionamiento cruzado, lo que puede producir combinaciones de etiquetas incoherentes entre sí.
- Es un clasificador, no un modelo generativo: no admite tool calling, agentes ni razonamiento multi-paso, y no debe usarse para tareas de generación de texto.
- La licencia MIT permite uso comercial, pero el usuario debe verificar las licencias de los corpus de origen (Dynaword, FineWeb-2, FinePDFs) si redistribuye los datos anotados.
- La detección de PII es probabilística y puede producir falsos negativos; no debe ser el único mecanismo de cumplimiento normativo en producción.
- No se documentan cuantizaciones oficiales ni integraciones con servidores de inferencia de alto rendimiento, lo que limita las optimizaciones listas para usar.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/danish-foundation-models/propella-bekko-a8m
- Modelo maestro propella-1-4b: https://huggingface.co/ellamind/propella-1-4b
- Referencia de propiedades de propella-1: https://huggingface.co/ellamind/propella-1-4b/blob/main/property_descriptions.md
- Backbone bekko-embedding-v1-a8m: https://huggingface.co/hotchpotch/bekko-embedding-v1-a8m
- Dataset de anotaciones propella-bekko-data: https://huggingface.co/datasets/danish-foundation-models/propella-bekko-data
- Código de entrenamiento propella-bekko: https://github.com/danish-foundation-models/propella-bekko
- Paper Dynaword: https://huggingface.co/papers/2508.02271
- Paper de referencia adicional (arXiv:2311.07264): https://arxiv.org/abs/2311.07264

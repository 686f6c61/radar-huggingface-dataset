# SirSireesh/osm-address-parser

## Resumen

SirSireesh/osm-address-parser es un modelo de clasificación de tokens (token classification) basado en la arquitectura ModernBERT, especializado en el análisis y descomposición de direcciones postales en campos estructurados. Lo desarrolla el usuario SirSireesh y se distribuye a través de Hugging Face con pesos en formato safetensors. El modelo resuelve un problema concreto de ingeniería de datos: convertir cadenas de texto de direcciones en bruto, tal como aparecen en OpenStreetMap (OSM), en componentes etiquetados (ciudad, calle, número de portal, código postal, suburbio, unidad, nivel, punto de referencia, etc.) mediante un esquema BIO.

El modelo cuenta con 149.619.475 parámetros totales, lo que lo sitúa en el rango de los encoders BERT de tamano medio (comparable a BERT-base en orden de magnitud, aunque ModernBERT incorpora mejoras de eficiencia). El repositorio ocupa 0,6 GB. Se ha entrenado sobre 34.033 ejemplos de direcciones extraídas de OSM y reporta una precisión a nivel de token (token_acc) de 0,9920 sobre ese mismo conjunto de ejemplos.

Su relevancia práctica radica en la normalización y geocodificación de direcciones a gran escala: es una pieza útil para pipelines de limpieza de datos geoespaciales, deduplicación de registros de direcciones y enriquecimiento de bases de datos. No obstante, la información pública disponible es muy limitada (sin licencia declarada, sin idiomas declarados, sin benchmarks externos), lo que condiciona su adopción en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer), cabeza de clasificación de tokens |
| Parámetros totales | 149.619.475 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantización GGUF no publicada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder de la familia ModernBERT con una cabeza de token classification. La tarea es un etiquetado secuencial con esquema BIO sobre 19 etiquetas: `B-city`, `B-house`, `B-house_number`, `B-landmark`, `B-level`, `B-postcode`, `B-road`, `B-suburb`, `B-unit` y sus equivalentes `I-` para continuación, más la etiqueta `O` (fuera de entidad). Los nombres completos de las etiquetas se encuentran en `config.json -> id2label`.

El entrenamiento se realizó sobre 34.033 ejemplos de direcciones de OpenStreetMap, según declara la model card. No se especifica el número de tokens de entrenamiento, la composición detallada del dataset, ni si hubo fases de ajuste adicionales (RLHF, DPO u otras). Tampoco se documentan innovaciones técnicas específicas más allá de las propias de ModernBERT. La entrada esperada son cadenas de direcciones en bruto divididas por espacios en palabras, tal como se indica en la model card.

## Capacidades

- Etiquetado de tokens de direcciones postales en 9 campos semánticos (ciudad, casa, número de casa, punto de referencia, nivel, código postal, calle, suburbio, unidad) con esquema BIO.
- Segmentación de direcciones en bruto en componentes estructurados, apta para normalización de registros.
- Procesamiento de direcciones de OpenStreetMap, dado que el entrenamiento se realizó sobre ese corpus.
- Clasificación a nivel de token con precisión reportada de 0,9920 sobre el conjunto de evaluación declarado.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- No se documentan capacidades especiales como modo thinking, visión o audio.

## Casos de uso

- Normalización de direcciones en pipelines de datos geoespaciales: el modelo descompone cada dirección en campos estructurados, lo que permite almacenar registros en columnas separadas (calle, número, código postal, ciudad) y facilita consultas e índices.
- Deduplicación de registros de direcciones: al etiquetar los mismos campos en registros de distinto origen, se pueden comparar componentes normalizados en lugar de cadenas completas, reduciendo falsos negativos por diferencias de formato.
- Limpieza de exportaciones de OpenStreetMap: dado que se entrenó sobre 34.033 ejemplos de OSM, es adecuado para procesar volcados de OSM y separar los componentes de la etiqueta `addr:*` en bruto.
- Enriquecimiento de bases de datos de clientes o inmuebles: permite poblar campos estructurados a partir de direcciones libres introducidas por usuarios, con la precisión reportada de 0,9920 a nivel de token.
- Preprocesamiento para geocodificación: la separación de calle, número y código postal permite construir consultas más precisas hacia servicios de geocodificación externos.
- Validación de calidad de datos: la detección de campos ausentes o mal formados (por ejemplo, un código postal etiquetado como parte de la calle) sirve para marcar registros que requieren revisión manual.
- Extracción de puntos de referencia y niveles: las etiquetas `landmark` y `level` permiten capturar información de dirección que a menudo se pierde en parsers basados en reglas.

## Benchmarks y rendimiento

| Métrica | Valor | Conjunto |
|---|---|---|
| token_acc | 0,9920 | 34.033 ejemplos (según model card) |
| Ejemplos evaluados | 34.033 | — |
| Ejemplos omitidos | 0 | — |

No se han publicado resultados de benchmarks en la información disponible más allá de la precisión a nivel de token reportada por el autor. No hay comparación con MMLU, HumanEval, GSM8K ni con otros parsers de direcciones.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,6 GB para los pesos (149,6 M de parámetros × 4 bytes), más memoria para activaciones y tokenizador; en la práctica, menos de 2 GB en la mayoría de configuraciones.
- VRAM estimada en fp16/bf16: aproximadamente 0,3 GB para los pesos.
- Cabe holgadamente en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para lotes pequenos.
- GPU recomendadas para alto throughput: A100, H100 o L4 para procesamiento por lotes a gran escala; para uso individual, cualquier GPU con al menos 2 GB de VRAM es suficiente.
- Opciones de despliegue: transformers (AutoModelForTokenClassification), y por tratarse de un encoder estándar, es compatible con servidores de inferencia basados en transformers; no se ha publicado versión GGUF para llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se puede señalar, a modo de referencia estructural, que ModernBERT es una evolución de los encoders BERT con mejoras de eficiencia, pero no se aportan datos de comparación con otros parsers de direcciones ni con modelos de token classification específicos.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SirSireesh/osm-address-parser | 149,6 M | no disponible | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial sin consultar al autor; la ausencia de licencia es un riesgo legal para producción.
- Idiomas no declarados: se desconoce si el modelo generaliza a direcciones en castellano u otros idiomas distintos del corpus de entrenamiento.
- Entrenado exclusivamente sobre 34.033 ejemplos de OSM: puede no generalizar bien a formatos de dirección ajenos a OSM (por ejemplo, direcciones con abreviaturas locales, formatos rurales o direcciones con caracteres no latinos).
- La métrica reportada (token_acc 0,9920) se calcula sobre el mismo conjunto de ejemplos indicado en la model card; no se documenta una partición de validación independiente, por lo que la cifra puede estar sobreestimada.
- Riesgo de alucinación de etiquetas: al ser un clasificador de tokens, puede asignar campos incorrectos en direcciones ambiguas o mal formadas.
- Sin información sobre sesgos: no se documenta el sesgo geográfico del corpus de OSM, que tiende a estar sobrerrepresentado en determinadas regiones.
- Longitud de contexto no documentada: direcciones muy largas podrían truncarse sin aviso.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.
- No se publican pesos cuantizados ni artefactos de despliegue adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SirSireesh/osm-address-parser
- Repositorio de entrenamiento con `predict.py`: no disponible (la model card lo menciona sin enlace)
- Paper de ModernBERT: no disponible en la información proporcionada
- Blog o demo: no disponible

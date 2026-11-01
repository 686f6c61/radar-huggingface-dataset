# adambuttrick/ror-set-point-set-model-mmbert-base-mask

## Resumen

El modelo `ror-set-point-set-model-mmbert-base-mask` es un cross-encoder de emparejamiento de entidades desarrollado por adambuttrick para la resolución de afiliaciones institucionales contra el registro ROR (Research Organization Registry). No es un modelo generativo: es un cabezal de clasificación sobre un encoder `jhu-clsp/mmBERT-base` que, dado un texto de afiliación y un conjunto de candidatos ROR, asigna a cada candidato la probabilidad de que la cadena lo nombre. Forma parte de una arquitectura de dos etapas junto al retriever `ror-set-point-retriever-e5-base` y una indexación léxica.

La innovación principal es su formulación como "set model": lee la cadena y todos los candidatos en una única secuencia de entrada (`[CLS] string [SEP] record 1 [SEP] record 2 [SEP] ...`), lo que permite al modelo aprender reglas comparativas entre candidatos (por ejemplo, etiquetar el hospital pero no la universidad que aparece en su nombre). La variante "mask" aplica una máscara de mención durante el entrenamiento que excluye de la pérdida ciertos negativos ambiguos, reduciendo el sesgo hacia instituciones retenidas para evaluación.

Con 306,9 millones de parámetros y un formato de pesos safetensors de 0,8 GB, es un modelo compacto orientado a producción de pipelines de enlazado de entidades bibliográficas. Su licencia MIT y su compatibilidad con Text Embeddings Inference lo hacen desplegable en infraestructura propia sin restricciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT) con cabezal lineal de scoring por candidato |
| Parametros totales | 306.939.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre `jhu-clsp/mmBERT-base`, un encoder de la familia ModernBERT, y añade un cabezal lineal que puntúa cada candidato a partir de la media de los estados de sus tokens. La puntuación se calibra mediante una función logística fija `p = 1 / (1 + exp(-(a × score + b)))`, y la respuesta final son todos los candidatos con `p ≥ 0,5`; una respuesta vacía indica que la cadena no nombra ninguna organización. La entrada concatena la cadena de afiliación y todos los candidatos en una sola secuencia, lo que habilita el razonamiento comparativo entre candidatos.

El entrenamiento se organiza en dos etapas sobre el dataset `adambuttrick/ror-set-point-matching-train-validation-test`. La etapa 1 combina 167.533 cadenas con juicios de un teacher (top-32 del retriever más registros juzgados, hasta 42 candidatos) y 130.882 cadenas sintéticas en alfabetos no latinos con el top-32 del retriever. La etapa 2 usa 16.448 cadenas con instituciones no vistas, con el top-32 del retriever más el top-10 léxico. Las etiquetas ausentes entre los candidatos se sustituyen por un candidato aleatorio no etiquetado (663 casos). Se excluyen las cadenas del teacher que enlazan con un registro retenido con `p ≥ 0,5` y las cadenas sintéticas que nombran instituciones retenidas (2.871).

La innovación técnica destacable es la máscara de mención: se elimina un candidato de la pérdida cuando su objetivo es inferior a 0,5, su registro no es positivo en ninguna fila de entrenamiento y la cadena lo menciona (nombre, etiqueta o alias normalizado de 6 o más caracteres, o acrónimo de 3 o más caracteres con la misma capitalización). Esto evita que el modelo aprenda a rechazar registros retenidos que en realidad sí aparecen en el texto, un sesgo habitual en evaluaciones con conjuntos de retención.

## Capacidades

- Emparejamiento de cadenas de afiliación con registros ROR, devolviendo probabilidades calibradas por candidato.
- Razonamiento comparativo entre candidatos dentro de una misma secuencia de entrada (desambiguación de instituciones homónimas o anidadas).
- Detección de ausencia de organización: devuelve conjunto vacío cuando ningún candidato supera el umbral de 0,5.
- Manejo de menciones mediante nombres, etiquetas, alias y acrónimos normalizados.
- Procesamiento por lotes en GPU con throughput medido de 128 cadenas por segundo en una NVIDIA H200 en lotes con padding.
- Integración con `text-embeddings-inference` y endpoints compatibles.
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales: es un modelo de extracción de características y clasificación.

## Casos de uso

- Desambiguación de afiliaciones en repositorios bibliográficos: dado un registro de publicación con la afiliación de cada autor, el modelo resuelve el identificador ROR correcto entre los candidatos recuperados, permitiendo enlazar autores con instituciones de forma fiable en bases como Crossref u OpenAlex.
- Normalización de metadatos de financiación: las agencias y universidades citadas en agradecimientos y grants se resuelven contra ROR para agregar métricas de financiación por institución.
- Deduplicación de registros institucionales: al comparar variantes de nombre (traducciones, acrónimos, errores tipográficos) contra los candidatos recuperados, el modelo asigna probabilidad a cada variante y facilita la consolidación de entidades.
- Enriquecimiento de pipelines de ciencia de datos: integración en procesos ETL que ingieren artículos y necesitan poblar campos estructurados de institución sin intervención manual, aprovechando el throughput de 128 cadenas por segundo en H200.
- Construcción de grafos de colaboración institucional: la resolución precisa de afiliaciones permite generar aristas autor-institución correctas para análisis de redes de coautoría y movilidad investigadora.
- Verificación de afiliaciones en revisiones editoriales: detección de afiliaciones que no corresponden a ninguna organización registrada (conjunto vacío) o que apuntan a instituciones inexistentes, como control de calidad en flujos de publicación.
- Procesamiento multilingüe de afiliaciones no latinas: el entrenamiento con 130.882 cadenas sintéticas en alfabetos no latinos permite aplicar el modelo a afiliaciones en cirílico, árabe o CJK dentro de pipelines de indexación global.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta el throughput de inferencia: 128 cadenas por segundo en una NVIDIA H200 con lotes con padding.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en fp32 para los 306,9 M de parámetros, más el espacio de activaciones y la caché KV de la secuencia concatenada; en la práctica, unos 2-4 GB con lotes moderados.
- GPU recomendadas: NVIDIA H200 (rendimiento medido de 128 cadenas/s), A100 y H100 para producción de alto volumen; RTX 4090 y A10G para despliegues de menor escala.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más de VRAM (RTX 3060, RTX 4060, RTX 4090), dada la reducida huella del modelo.
- Opciones de despliegue: `transformers` con el script `set_model.py` proporcionado por el autor (solo requiere torch, transformers, safetensors y huggingface_hub), Text Embeddings Inference y endpoints compatibles.
- Latencia y throughput: 128 cadenas por segundo en H200 en lotes con padding; no se han publicado cifras para otras GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ror-set-point-set-model-mmbert-base-mask | 306,9 M | no disponible | Cross-encoder de emparejamiento ROR con máscara de mención | MIT | HuggingFace |
| ror-set-point-set-model-mmbert-base | no disponible | no disponible | Cross-encoder de emparejamiento ROR sin máscara de mención | MIT | HuggingFace |
| ror-set-point-retriever-e5-base | no disponible | no disponible | Retriever bi-encoder para recuperación de candidatos ROR | MIT | HuggingFace |

La comparativa con alternativas externas de resolución de afiliaciones (por ejemplo, modelos de enlazado de entidades genéricos o soluciones basadas en reglas) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo no genera texto ni razona de forma abierta: cualquier uso fuera del emparejamiento de afiliaciones con candidatos ROR precomputados requiere adaptación.
- Depende de un pipeline externo: necesita el retriever `ror-set-point-retriever-e5-base`, el índice léxico y los textos de los registros ROR para funcionar; no es autónomo.
- Riesgo de alucinación estructural: al devolver conjuntos vacíos cuando ningún candidato supera 0,5, puede omitir organizaciones reales si el retriever no las incluye entre los candidatos (el modelo solo puntúa lo que recibe).
- Sesgo hacia instituciones retenidas: la máscara de mención mitiga pero no elimina el sesgo aprendido de los objetivos del teacher; 9.606 cadenas conservan objetivos entre 0,1 y 0,49 para instituciones retenidas.
- Cobertura idiomática no documentada: aunque se entrenó con cadenas sintéticas no latinas, no se especifican los idiomas soportados ni su rendimiento por idioma.
- Longitud de contexto no disponible: cadenas de afiliación muy largas con muchos candidatos podrían truncarse, aunque no se documenta el límite.
- Licencia MIT: permite uso comercial sin restricciones, pero el modelo base `jhu-clsp/mmBERT-base` debe verificarse por si impone condiciones adicionales.
- Sin métricas de evaluación publicadas: no hay benchmarks de precisión, recall o F1 en la model card, lo que dificulta estimar su calidad frente a alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adambuttrick/ror-set-point-set-model-mmbert-base-mask
- Variante sin máscara de mención: https://huggingface.co/adambuttrick/ror-set-point-set-model-mmbert-base
- Retriever del pipeline: https://huggingface.co/adambuttrick/ror-set-point-retriever-e5-base
- Colección ROR set point matching: https://huggingface.co/collections/adambuttrick/ror-set-point-matching-6ada8733c9e6fb018f382d0b
- Dataset de entrenamiento y validación: https://huggingface.co/datasets/adambuttrick/ror-set-point-matching-train-validation-test
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-base

# c-ho/2026-09-15-crf-classweights-clean

## Resumen

El modelo `c-ho/2026-09-15-crf-classweights-clean` es un ajuste fino de `FacebookAI/xlm-roberta-large` para etiquetado de tokens (token classification), publicado por el usuario c-ho bajo licencia MIT. Su tarea concreta es asignar a cada token una de las 16 etiquetas de una taxonomía de conceptos lingüísticos (por ejemplo, `Phonologicalphenomenon`, `Morphosyntacticphenomenon`, `Languagerelatedterm` o `Unclassifiedlinguisticconcept`), lo que lo sitúa en el ámbito de la anotación terminológica y lingüística sobre texto académico o técnico.

El modelo tiene 559.925.445 parámetros (dato real de los pesos safetensors), hereda la arquitectura de encoder transformer multilingüe de XLM-RoBERTa-large y una longitud de contexto de 512 tokens, y no es un modelo generativo: no soporta chat, tool calling ni razonamiento multi-paso. Su relevancia es acotada y muy específica: ofrece una etiqueta de secuencia ya entrenada para una taxonomía lingüística poco común, con un F1 macro de 0,8011 y una accuracy de 0,9722 en su conjunto de evaluación, aunque con clases claramente problemáticas.

Se trata de un repositorio con 0 descargas y 0 likes en el momento de la consulta, sin documentación de dataset, sin benchmarks en el `model-index` (vacío) y con la model card generada automáticamente por el `Trainer` y sin completar. Por tanto, debe evaluarse como un artefacto experimental o de uso interno, no como un modelo validado por la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-large) con cabeza de clasificación de tokens; el nombre del repositorio sugiere una capa CRF y ponderación de clases, no documentada en la model card |
| Parámetros totales | 559.925.445 (dato real del peso safetensors) |
| Longitud de contexto | 512 tokens (valor de `max_position_embeddings` de XLM-RoBERTa-large; no declarado en la model card) |
| Tipos de cuantización | No disponible: no se publican pesos cuantizados (ni GGUF, ni ONNX, ni INT8) |
| Idiomas soportados | No declarados en la model card. El modelo base XLM-RoBERTa-large está preentrenado en 100 idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors (librería `transformers`) |
| Número de etiquetas | 16 clases (Academicdiscipline, Ambiguouslydefinedconcept, Discoursephenomenon, Graphemicphenomenon, Languagerelatedterm, Languageresourceinformation, Lexicalphenomenon, Morphologicalphenomenon, Morphosyntacticphenomenon, New Tag, Otherlinguisticterm, Phonologicalphenomenon, Semanticphenomenon, Syntacticphenomenon, Topnode Dummy, Unclassifiedlinguisticconcept) |
| Pipeline declarado | token-classification |
| Tamaño del repositorio | 15,7 GB |
| Fecha de creación / actualización | 2026-09-15 / 2026-09-15 |

Nota aritmética: 559,9 M de parámetros en FP32 equivalen a unos 2,24 GB de pesos. El repositorio ocupa 15,7 GB, por lo que el resto del espacio corresponde presumiblemente a checkpoints intermedios del `Trainer` u otros artefactos; la model card no lo detalla.

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer bidireccional (familia RoBERTa) con 24 capas, 1024 de dimensión oculta y vocabulario SentencePiece de 250.000 tokens, correspondiente a `FacebookAI/xlm-roberta-large`, sobre el que se añade una cabeza de clasificación por token. El nombre del repositorio incluye los términos `crf` y `classweights` (y `clean`), lo que apunta a una capa de campo aleatorio condicional (CRF) sobre las emisiones del encoder y a una función de pérdida ponderada por frecuencia de clase; sin embargo, la model card no documenta ni confirma ninguno de estos dos componentes, por lo que deben considerarse indicios del nombre y no características verificadas.

El autor no documenta el conjunto de entrenamiento: la model card indica literalmente "unknown dataset" y deja vacías las secciones de descripción, usos previstos y datos. Los hiperparámetros sí están registrados: 8 épocas, tasa de aprendizaje 2e-05 con scheduler lineal y `warmup_ratio` de 0,1, batch de entrenamiento 8 con 4 pasos de acumulación (batch efectivo 32), batch de evaluación 16, optimizador AdamW (`adamw_torch`, betas 0,9/0,999, epsilon 1e-08), semilla 42 y precisión mixta nativa (AMP). No se declara uso de RLHF, DPO ni ningún otro ajuste por preferencias, algo coherente con una tarea discriminativa de etiquetado.

## Capacidades

- Etiquetado de secuencias (sequence labeling) sobre 16 clases de conceptos lingüísticos, con granularidad de token.
- Reconocimiento de fenómenos fonológicos, morfológicos, morfosintácticos, sintácticos, semánticos, léxicos y discursivos, además de términos relacionados con el lenguaje y recursos lingüísticos.
- Capacidad multilingüe potencial derivada del modelo base XLM-RoBERTa-large, aunque no hay evaluación por idioma publicada.
- Uso como preanotador en flujos de anotación humana (el esquema de etiquetado no está documentado como BIO/BILOU en la model card).
- No soporta generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso: es un modelo de una sola pasada de codificación y clasificación.
- No dispone de modo de razonamiento explícito (thinking mode) ni de capacidades conversacionales.

## Casos de uso

- Preanotación de corpus lingüísticos: el modelo etiqueta cada token con la categoría de fenómeno lingüístico correspondiente, de modo que un anotador humano solo revisa y corrige, reduciendo el coste de anotación sobre corpus académicos.
- Indexación y búsqueda en bibliografía especializada: aplicar el modelo a resúmenes y artículos permite construir índices por tipo de fenómeno lingüístico (fonológico, sintáctico, semántico) y habilitar búsquedas facetadas.
- Construcción de taxonomías y grafos de conocimiento: las etiquetas asignadas pueden agregarse por documento para inferir qué áreas cubre una publicación y alimentar un grafo de conceptos.
- Extracción de terminología en pipelines multilingües: al partir de un encoder multilingüe, puede aplicarse a textos en varios idiomas sin cambiar de arquitectura, siempre que el dominio sea similar al de entrenamiento.
- Normalización de metadatos en repositorios documentales: clasificar términos de un registro bibliográfico según su tipo de concepto para homogeneizar vocabularios controlados.
- Detección de clases problemáticas en control de calidad: dado que la clase `Graphemicphenomenon` obtiene F1 de 0,0 y `Academicdiscipline` de 0,3810, el modelo puede usarse como filtro de confianza para marcar qué anotaciones requieren revisión manual (los umbrales habría que calibrarlos).
- Enrutado de contenido en editores y plataformas académicas: asignar automáticamente un área temática aproximada a un manuscrito entrante para dirigirlo al revisor o sección adecuada, siempre con validación humana por el F1 bajo en clases como `Academicdiscipline`.

## Benchmarks y rendimiento

El `model-index` de la model card está declarado con el nombre `2026-08-27-crf-classweights-clean` y una lista de resultados vacía, por lo que no hay benchmarks oficiales publicados por el autor. Sí se incluyen métricas de la evaluación interna del `Trainer` (una única partición de evaluación, no descrita). Resultados finales declarados:

| Métrica | Valor |
|---|---|
| Loss (evaluación) | 8,6272 |
| Precision | 0,7821 |
| Recall | 0,8211 |
| F1 (macro) | 0,8011 |
| Accuracy | 0,9722 |

F1 por clase en la evaluación final:

| Clase | F1 |
|---|---|
| Academicdiscipline | 0,3810 |
| Ambiguouslydefinedconcept | 0,7356 |
| Discoursephenomenon | 0,6549 |
| Graphemicphenomenon | 0,0000 |
| Languagerelatedterm | 0,8691 |
| Languageresourceinformation | 0,7868 |
| Lexicalphenomenon | 0,6759 |
| Morphologicalphenomenon | 0,8191 |
| Morphosyntacticphenomenon | 0,8479 |
| New Tag | 0,8207 |
| Otherlinguisticterm | 0,7439 |
| Phonologicalphenomenon | 0,8649 |
| Semanticphenomenon | 0,7048 |
| Syntacticphenomenon | 0,7965 |
| Topnode Dummy | 0,6852 |
| Unclassifiedlinguisticconcept | 0,8787 |

Evolución del F1 macro durante el entrenamiento (epochs 1 a 6, última fila registrada en la model card):

| Época | Paso | Validation loss | Precision | Recall | F1 | Accuracy |
|---|---|---|---|---|---|---|
| 1,0 | 667 | 14,5431 | 0,5680 | 0,5182 | 0,5420 | 0,9473 |
| 2,0 | 1334 | 8,8849 | 0,7186 | 0,7187 | 0,7187 | 0,9637 |
| 3,0 | 2001 | 7,9844 | 0,7165 | 0,7966 | 0,7544 | 0,9663 |
| 4,0 | 2668 | 7,6316 | 0,7587 | 0,7994 | 0,7785 | 0,9695 |
| 5,0 | 3335 | 8,0953 | 0,7406 | 0,8337 | 0,7844 | 0,9691 |
| 6,0 | 4002 | 8,4333 | 0,7617 | 0,8333 | 0,7959 | 0,9707 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, alrededor de 2,3 GB solo de pesos, más activaciones según longitud de secuencia y batch; en FP16/BF16, aproximadamente 1,2 GB; con cuantización dinámica INT8, en torno a 0,6 GB. Estas cifras son estimaciones derivadas del número de parámetros, no mediciones publicadas.
- Cabe holgadamente en GPU de consumo: cualquier GPU con 4 GB o más de VRAM (GTX 1650, RTX 3050, RTX 3060, RTX 4060, etc.) puede ejecutar inferencia en FP16 o con cuantización. La evaluación durante el entrenamiento usó batch de 16, aunque no se indica el hardware empleado.
- Ejecución en CPU viable con ONNX Runtime o cuantización dinámica de PyTorch, dado el tamaño del modelo y que el contexto máximo es de 512 tokens.
- GPU de datacenter (A100, H100, L40S) no son necesarias para inferencia, pero sí recomendables para reentrenamiento o ajuste fino sobre corpus grandes.
- El repositorio ocupa 15,7 GB, presumiblemente por checkpoints intermedios; conviene descargar solo los archivos necesarios en lugar del repositorio completo.
- Opciones de despliegue: `transformers` (`pipeline("token-classification")`), ONNX Runtime, TorchScript, TorchServe, Triton Inference Server o un servicio FastAPI propio. El tag `endpoints_compatible` indica compatibilidad con Hugging Face Inference Endpoints.
- `vLLM` y `text-generation-inference` no soportan de forma nativa la tarea de token classification, por lo que no son opciones directas para este modelo.
- Latencia y throughput: no disponible. El autor no publica mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Rendimiento en esta tarea |
|---|---|---|---|---|---|
| c-ho/2026-09-15-crf-classweights-clean | XLM-RoBERTa-large + cabeza de token classification | 559,9 M | 512 | MIT | F1 macro 0,8011 y accuracy 0,9722 en su propia evaluación |
| FacebookAI/xlm-roberta-large | Encoder XLM-RoBERTa | 559,9 M | 512 | MIT | No es un modelo de etiquetado; requiere ajuste fino para esta tarea |
| microsoft/mdeberta-v3-base | Encoder DeBERTa-v3 | 278 M | 512 | MIT | Sin resultados comparables en esta taxonomía |
| google-bert/bert-base-multilingual-cased | Encoder BERT multilingüe | 178 M | 512 | Apache-2.0 | Sin resultados comparables en esta taxonomía |

No existe un benchmark común publicado que permita comparar el rendimiento de estos modelos en la misma taxonomía de conceptos lingüísticos, por lo que la columna de rendimiento no es comparable entre filas. Tampoco se conocen otros modelos públicos ajustados exactamente a este conjunto de 16 etiquetas.

## Limitaciones y advertencias

- El conjunto de entrenamiento es desconocido ("unknown dataset" en la model card): no se puede evaluar la composición de datos, la cobertura de dominios ni los sesgos presentes.
- La clase `Graphemicphenomenon` obtiene F1 de 0,0, lo que indica que el modelo no la detecta; `Academicdiscipline` (0,3810), `Discoursephenomenon` (0,6549), `Lexicalphenomenon` (0,6759) y `Topnode Dummy` (0,6852) también presentan un rendimiento bajo.
- La accuracy de 0,9722 es engañosa en un problema de etiquetado con clases desbalanceadas: la mayoría de tokens probablemente pertenecen a clases mayoritarias, por lo que conviene guiarse por el F1 por clase.
- La pérdida de validación elevada y no decreciente de forma monótona (14,54 → 7,63 → 8,43 → 8,63) sugiere inestabilidad en la calibración; si la pérdida incluye una componente CRF, no es interpretable como una probabilidad.
- Riesgo de alucinación en el sentido de asignación de etiquetas espurias: es un clasificador discriminativo, pero puede etiquetar como fenómeno lingüístico fragmentos que no lo son, especialmente en dominios distintos al de entrenamiento.
- Contexto limitado a 512 tokens: los documentos largos deben trocearse, lo que puede fragmentar entidades y degradar el etiquetado en los límites de los fragmentos.
- Sesgos idiomáticos no evaluados: aunque el modelo base es multilingüe, no hay resultados por idioma y el ajuste fino puede haber desplazado el comportamiento hacia el idioma o dominio de los datos de entrenamiento.
- La licencia MIT permite uso comercial y modificación, pero al desconocerse la procedencia de los datos de entrenamiento existe un riesgo legal no cuantificado en la redistribución o explotación comercial del modelo.
- Repositorio sin validación externa: 0 descargas y 0 likes, sin paper, sin demo y sin revisión por parte de la comunidad.
- Trazabilidad confusa: el nombre del repositorio (2026-09-15) y el nombre del modelo en la model card (2026-08-27) no coinciden, y la model card está generada automáticamente y sin completar.
- No se documentan indicaciones sobre el esquema de etiquetado (BIO, BILOU u otro), lo que dificulta la integración directa en pipelines existentes.
- Recomendación para producción: usar el modelo como preanotador o componente auxiliar con revisión humana, no como decisión automática, y validar el F1 por clase en el dominio objetivo antes de desplegarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/c-ho/2026-09-15-crf-classweights-clean
- Modelo base XLM-RoBERTa-large: https://huggingface.co/FacebookAI/xlm-roberta-large

La búsqueda web asociada no devolvió ningún resultado relacionado con el modelo: los enlaces recuperados corresponden a páginas sobre la localidad francesa de Gignac-la-Nerthe (Wikipedia, Bing Maps y MSN Météo) y no guardan relación con este repositorio. No se han encontrado papers, blogs, repositorios de código ni demos adicionales.

# P0L3/CliReNER-gliner_medium-v2.5

## Resumen

CliReNER-gliner_medium-v2.5 es un modelo de reconocimiento de entidades nombradas (NER) especializado en el dominio de la investigación sobre cambio climático. Lo desarrolla el usuario P0L3 y se construye mediante fine-tuning del modelo generalista GLiNER Medium v2.5 de la comunidad GLiNER. El modelo resuelve el problema de la extracción de entidades de grano fino en textos científicos y técnicos sobre clima, ciencias de la Tierra y biología, donde los esquemas de NER genéricos (persona, organización, lugar) resultan insuficientes.

La relevancia del modelo radica en su tipología de 28 clases de entidad específicas del dominio, que incluyen categorías como `Meteorological Phenomenon`, `Energy Source`, `Ecosystem`, `Satellite`, `Policy` o `Mathematical Expression`. Se trata de un modelo compacto (repo de 0,8 GB) basado en una arquitectura bi-encoder con objetivo de focal loss, entrenado exclusivamente en inglés y publicado bajo licencia CC BY-SA 4.0.

El checkpoint publicado corresponde a la semilla con mejor F1 estricto sobre el conjunto de evaluación experto CliReNER_gold, con un F1 de 62,16 y una desviación estándar de solo 0,32 entre las cinco semillas evaluadas, lo que indica una estabilidad notable para un modelo de este tamaño en un dominio tan específico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLiNER (bi-encoder span-based) con objetivo de focal loss |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | no disponible (repo de 0,8 GB, libreria `gliner` sobre PyTorch) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura GLiNER, un enfoque de NER generalista basado en un bi-encoder que permite especificar las etiquetas de entidad en tiempo de inferencia mediante prompts de texto, en lugar de fijar un conjunto cerrado de clases durante el entrenamiento. Sobre esta base se aplica un objetivo de focal loss, adecuado para escenarios con desbalanceo entre clases de entidad. El fine-tuning parte de `gliner-community/gliner_medium-v2.5` y se realiza sobre el split del 80 % del dataset CliReNER_v_1_1_28_SILVER, con una tasa de aprendizaje de 5e-6 (1e-5 para el encoder) y semilla 3012.

La evaluación se lleva a cabo sobre el conjunto independiente CliReNER_v_1_1_28_GOLD, anotado por expertos mediante votación ponderada (Weighted Expert Voting). Se entrenaron cinco semillas distintas para medir la robustez del ajuste; el checkpoint publicado corresponde a la semilla 3, seleccionada por obtener el mejor F1 estricto (coincidencia exacta de span y etiqueta) sobre el conjunto gold. No se detalla en la información disponible el número de tokens de entrenamiento ni la composición completa del corpus más allá de su temática climática.

## Capacidades

- Reconocimiento de entidades nombradas de grano fino en inglés con 28 clases específicas del dominio climático y de ciencias de la Tierra.
- Tipología de entidades: `Asset`, `Body Part`, `Body of Water`, `Chemical`, `Disease`, `Ecosystem`, `Energy Source`, `Field of Study`, `Geographical Feature`, `Intellectual Artefact`, `Location`, `Mathematical Expression`, `Measuring Device`, `Meteorological Phenomenon`, `Method`, `Natural Disaster`, `Natural Phenomenon`, `Organism`, `Organization`, `Other`, `Person`, `Physical Artefact`, `Physical Phenomenon`, `Policy`, `Quantity`, `Satellite`, `System` y `Time Period`.
- NER zero-shot sobre etiquetas arbitrarias gracias a la naturaleza generalista de GLiNER, aunque el rendimiento óptimo se obtiene con las 28 clases de entrenamiento.
- Extracción de entidades con puntuación de confianza por span (`score`), lo que permite filtrar por umbral en producción.
- Detección de entidades anidadas o solapadas a nivel de span, incluyendo expresiones matemáticas, cantidades con unidades y referencias bibliográficas (autores y años).
- No soporta tool calling, function calling, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de clasificación de tokens.
- Sin capacidades multimodales (visión, audio) ni modo de razonamiento explícito.

## Casos de uso

- Construcción de bases de conocimiento climático: extracción automatizada de entidades (`Ecosystem`, `Energy Source`, `Policy`, `Satellite`) de corpus científicos para poblar grafos de conocimiento y facilitar búsquedas semánticas sobre literatura de cambio climático.
- Revisión sistemática de literatura: procesamiento por lotes de abstracts y artículos de revistas como *Nature Climate Change* o *IPCC* para identificar métodos, fenómenos meteorológicos y organismos estudiados, reduciendo el trabajo manual de cribado.
- Monitorización de políticas climáticas: detección de entidades `Policy`, `Organization` y `Time Period` en documentos regulatorios y comunicados institucionales para hacer seguimiento de compromisos y marcos normativos.
- Enriquecimiento de datasets para entrenamiento: etiquetado previo (pre-annotated) de corpus climáticos que luego se revisan por anotadores humanos, aprovechando las puntuaciones de confianza para priorizar la revisión.
- Análisis de informes de evaluación del IPCC: extracción de `Meteorological Phenomenon`, `Natural Disaster` y `Quantity` para cuantificar menciones de impactos y escenarios en informes extensos.
- Indexación de repositorios de datos Earth observation: identificación de `Satellite`, `Measuring Device` y `Geographical Feature` en metadatos y descripciones de productos de teledetección.
- Alimentación de pipelines de RAG especializados: uso del NER como paso de preprocesamiento para etiquetar fragmentos y mejorar la recuperación filtrada por tipo de entidad en asistentes de investigación climática.

## Benchmarks y rendimiento

Evaluación sobre CliReNER_gold (F1 estricto, coincidencia exacta de span y etiqueta):

| Metrica | Valor |
|---|---|
| Precision | 61,78 |
| Recall | 62,54 |
| F1 | 62,16 |

Resultados por semilla sobre el conjunto gold:

| Semilla | Precision | Recall | F1 estricto |
|---|---|---|---|
| 1 | 61,06 | 61,68 | 61,37 |
| 2 | 61,63 | 62,21 | 61,92 |
| 3 (publicada) | 61,78 | 62,54 | 62,16 |
| 4 | 61,27 | 62,05 | 61,66 |
| 5 | 60,90 | 62,09 | 61,49 |
| Media ± desv. | 61,33 ± 0,37 | 62,12 ± 0,31 | 61,72 ± 0,32 |

No se han publicado en la información disponible resultados comparativos con otros modelos NER (ClimateBERT-NER, SpanMarker, GLiNER base sin fine-tuning) sobre el mismo conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo ocupa 0,8 GB, por lo que en fp32 la inferencia requiere del orden de 1-2 GB de VRAM; en fp16 o int8 cabría en menos de 1 GB. No se dispone de cifras oficiales del autor.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090). Para despliegues de alto throughput, A100 o H100 no son necesarias dado el tamaño del modelo.
- Cabe holgadamente en GPU consumer e incluso en CPU para lotes pequeños, aunque la latencia será mayor.
- Opciones de despliegue: la librería oficial `gliner` (PyTorch) es la vía documentada. No se indica soporte verificado para vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Clases | Contexto | F1 (gold) | Licencia |
|---|---|---|---|---|---|
| CliReNER-gliner_medium-v2.5 | GLiNER bi-encoder | 28 (clima) | no disponible | 62,16 | CC BY-SA 4.0 |
| gliner-community/gliner_medium-v2.5 | GLiNER bi-encoder | zero-shot arbitrarias | no disponible | no disponible | no disponible |
| ClimateBERT-NER | Transformer encoder | esquema genérico adaptado | 512 tokens (BERT base) | no disponible | no disponible |
| SpanMarker (bert-base) | Transformer span classification | configurable | 512 tokens | no disponible | no disponible |

La comparación cuantitativa con alternativas no puede completarse porque la información proporcionada no incluye resultados de esos modelos sobre CliReNER_gold. La ventaja diferencial de este checkpoint es la tipología de 28 clases específicas del dominio climático, frente a esquemas genéricos de NER.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en inglés; el rendimiento en castellano u otros idiomas no está caracterizado y probablemente sea deficiente.
- F1 estricto de 62,16 sobre el conjunto gold: aproximadamente un 38 % de entidades no se recuperan con span y etiqueta exactos, lo que exige revisión humana en flujos de alta precisión.
- Riesgo de confusión entre clases semánticamente próximas (`Natural Phenomenon` vs. `Physical Phenomenon`, `Method` vs. `Intellectual Artefact`, `Other` como clase residual).
- El modelo se seleccionó por F1 sobre el conjunto gold, lo que puede introducir un sesgo optimista leve en la métrica reportada respecto a datos completamente no vistos.
- Dataset de entrenamiento silver (anotación automática o semiautomática) con solo un conjunto gold de evaluación de tamaño no especificado; posible desbalanceo de clases poco frecuentes (`Body Part`, `Disease`, `Asset`).
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia, lo que puede ser incompatible con productos propietarios que no quieran liberar el modelo ajustado.
- No es un modelo generativo: no debe emplearse para resumen, respuesta a preguntas ni generación de texto.
- No se documentan sesgos demográficos o geográficos específicos; en un dominio científico es esperable un sesgo hacia literatura en inglés y hacia regiones con mayor producción investigadora.
- Sin información sobre el tamaño del checkpoint en parámetros ni sobre el contexto máximo soportado, lo que dificulta planificar el troceado de documentos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/P0L3/CliReNER-gliner_medium-v2.5
- Modelo base: https://huggingface.co/gliner-community/gliner_medium-v2.5
- Dataset silver: https://huggingface.co/datasets/P0L3/CliReNER_v_1_1_28_SILVER
- Dataset gold: https://huggingface.co/datasets/P0L3/CliReNER_v_1_1_28_GOLD
- Repositorio GLiNER: https://github.com/urchade/GLiNER

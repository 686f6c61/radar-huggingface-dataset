# edugredu/t2know-biomedbert

## Resumen

t2know-biomedbert es un modelo de clasificación de spans para reconocimiento de entidades nombradas (NER) en el dominio biomédico, desarrollado por el usuario edugredu. Se trata de un fine-tuning del encoder BiomedBERT de Microsoft sobre el corpus T2KNOW v1.0.1, un conjunto de resúmenes científicos sobre la enfermedad de Huntington anotados con 40 etiquetas derivadas de UMLS, incluyendo entidades anidadas y entidades multi-etiqueta que comparten el mismo span. El modelo resuelve el problema de la extracción estructurada de menciones biomédicas en texto científico cuando las anotaciones no son planas, es decir, cuando una misma secuencia de tokens puede corresponder a varias categorías semánticas simultáneamente.

Arquitectónicamente es un transformer encoder de tipo BERT en su variante base (12 capas, 768 dimensiones ocultas), con una cabeza personalizada `BertForSpanClassification` que produce una clasificación multi-etiqueta en formato BIO plano. El contexto máximo es de 512 tokens, limitación heredada del modelo base. Se publican tres checkpoints correspondientes a tres semillas de entrenamiento distintas, lo que permite estimar la varianza del rendimiento.

Su relevancia actual es acotada pero específica: constituye un baseline reproducible para NER biomédico con entidades anidadas sobre un corpus abierto y con licencia MIT, algo poco frecuente en el ecosistema de NER clínico, donde predominan modelos con licencias restrictivas o corpus no publicados. No obstante, el modelo tiene cero descargas y cero likes en el momento de la consulta, y el paper asociado está aún en revisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT base (BiomedBERT) con cabeza `BertForSpanClassification` multi-etiqueta BIO |
| Parametros totales | no disponible (repo de 1,3 GB con tres checkpoints; el modelo base BiomedBERT-base tiene ~110 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredada del modelo base; no confirmada explicitamente en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext`, un encoder BERT base preentrenado sobre literatura biomédica (resúmenes y texto completo de PubMed). Sobre él se añade una cabeza de clasificación de spans que emite predicciones multi-etiqueta en esquema BIO plano, capaz de representar entidades anidadas y entidades que comparten exactamente el mismo span mediante múltiples etiquetas activas sobre los mismos tokens. El checkpoint no es cargable con `AutoModel` estándar: requiere el código de `code/flat_baselines/modeling.py` del archivo de release.

El entrenamiento se realizó sobre el split de entrenamiento document-disjoint de T2KNOW v1.0 (con el split de validación para selección de modelo). El corpus contiene resúmenes sobre enfermedad de Huntington con 40 etiquetas derivadas de UMLS. La decodificación recomendada usa `logit_threshold=0.5` y `start_confidence=0.9`, valores seleccionados sobre validación y publicados en `decoding.json`. Se entrenaron tres semillas (12345, 23456, 34567) para estimar la estabilidad. No se especifica en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si hubo etapas de RLHF o DPO (poco probable en una tarea de NER supervisada).

## Capacidades

- Reconocimiento de entidades nombradas biomédicas en inglés sobre texto científico, con 40 etiquetas derivadas de UMLS.
- Soporte de entidades anidadas (nested NER) mediante clasificación multi-etiqueta por token en esquema BIO plano.
- Soporte de entidades multi-etiqueta que comparten exactamente el mismo span.
- Extracción de menciones con decodificación configurable por umbral de logit y confianza de inicio.
- Especialización en el dominio de la enfermedad de Huntington (resúmenes científicos).
- No soporta generación de texto, razonamiento libre, código, matemáticas, visión ni audio.
- No se documenta soporte de tool calling ni de flujos agénticos.
- No se documenta capacidad multilingüe más allá del inglés.

## Casos de uso

- Extracción estructurada de menciones en literatura sobre Huntington: el modelo identifica y clasifica entidades biomédicas en resúmenes científicos, permitiendo poblar bases de conocimiento o grafos de entidades a partir de publicaciones.
- Baseline para investigación en NER anidado: al publicarse tres semillas con métricas de test, sirve como referencia reproducible (F1 medio 0,6548) para comparar nuevas arquitecturas sobre el corpus T2KNOW.
- Anotación asistida (human-in-the-loop): las predicciones con umbral de confianza 0,9 pueden preanotar documentos para revisión experta, reduciendo el coste de anotación manual en dominios biomédicos especializados.
- Normalización hacia ontologías UMLS: como las 40 etiquetas derivan de UMLS, las salidas pueden mapearse directamente a conceptos de la ontología para tareas de indexación semántica.
- Construcción de pipelines de minería de literatura: integrable como etapa de extracción en flujos que procesan lotes de resúmenes PubMed y agregan menciones por tipo de entidad.
- Detección de relaciones candidatas: al extraer entidades multi-etiqueta y anidadas, se pueden generar pares entidad-entidad dentro de la misma frase como paso previo a modelos de relación.
- Evaluación de robustez de encoders biomédicos: la varianza entre semillas (desviación estándar poblacional de 0,0040 en F1) permite estudiar la estabilidad de fine-tunings sobre corpus pequeños.

## Benchmarks y rendimiento

Resultados del evaluador oficial de T2KNOW (coincidencias parciales de span cuentan 0,5) sobre el split de test deduplicado v1.0.1 (151 documentos, 1.413 frases, 12.579 entidades):

| Semilla | Precision | Recall | F1 |
|---|---|---|---|
| 12345 | 0,5739 | 0,7488 | 0,6498 |
| 23456 | 0,5782 | 0,7558 | 0,6552 |
| 34567 | 0,5907 | 0,7466 | 0,6595 |

F1 medio sobre las tres semillas: 0,6548 (desviación estándar poblacional 0,0040). No se han publicado en la información disponible resultados comparativos con otros modelos en MMLU, HumanEval, GSM8K ni en otros benchmarks estándar, dado que la tarea no es generativa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del modelo base (BERT base, ~110 M de parámetros) se estima en el orden de 0,5-1 GB en fp32, aunque este dato no está confirmado en la información proporcionada.
- GPU recomendadas: no especificadas. Un encoder BERT base es ejecutable en GPU consumer de gama media o incluso en CPU para lotes pequeños, pero no hay datos publicados de latencia ni throughput.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño del encoder, aunque no se documenta.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI. Requiere el código personalizado `code/flat_baselines/modeling.py` y los parámetros de `decoding.json`; no es cargable con `AutoModel` estándar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de modelos comparables sobre el mismo corpus y evaluador, por lo que no es posible establecer una comparación cuantitativa fiable.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| t2know-biomedbert | no disponible | 512 (heredado) | NER biomédico anidado (40 etiquetas UMLS) | MIT | HuggingFace, requiere código custom |
| BiomedBERT base (modelo base) | ~110 M (no confirmado) | 512 | MLM / encoder genérico biomédico | MIT | HuggingFace |
| Alternativas NER biomédico | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Las métricas miden acuerdo con la capa de anotación de T2KNOW (revisada por experto pero con un único anotador), no corrección semántica; un F1 de 0,65 no implica que las entidades extraídas sean clínicamente correctas.
- Las etiquetas con muy poco soporte en el corpus son poco fiables, según advierte el propio autor.
- El modelo está especializado en resúmenes sobre enfermedad de Huntington; su generalización a otros dominios biomédicos no está evaluada.
- Solo soporta inglés.
- La longitud de contexto está limitada a 512 tokens, lo que puede truncar resúmenes largos o fragmentos de texto completo.
- No es cargable con `AutoModel` estándar: requiere el código de release, lo que añade fricción de integración y riesgo de incompatibilidad con versiones futuras de transformers.
- El paper está en revisión y la cita aún no está disponible; la validación por pares de los resultados no está completada.
- El repositorio no incluye texto fuente de terceros, pero el uso en producción debe verificar que el pipeline de datos cumple con las condiciones de las fuentes originales.
- Licencia MIT permite uso comercial, pero la responsabilidad sobre el uso clínico o regulatorio recae en el integrador; no es un dispositivo médico.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso en producción ni de validación independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/edugredu/t2know-biomedbert
- Modelo base: https://huggingface.co/microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext
- Corpus T2KNOW v1.0.1 (Zenodo): https://doi.org/10.5281/zenodo.23801223
- Paper: en revisión, cita pendiente de publicación (no disponible)
- Código: archivo de release `code/` incluido en el DOI de Zenodo anterior

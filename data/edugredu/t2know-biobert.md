# edugredu/t2know-biobert

## Resumen

t2know-biobert es un checkpoint de tipo span classifier para reconocimiento de entidades nombradas (NER) en texto biomédico, desarrollado por el usuario edugredu a partir de BioBERT base cased v1.1 (dmis-lab). El modelo se ha ajustado sobre el corpus T2KNOW v1.0.1, un conjunto de resúmenes científicos sobre la enfermedad de Huntington anotados con 40 etiquetas derivadas de UMLS, que incluye entidades anidadas y entidades multi-etiqueta sobre el mismo span. Se publican tres semillas de entrenamiento (12345, 23456 y 34567) para permitir la reproducibilidad y el análisis de varianza.

El modelo no es un generador de texto ni un LLM de propósito general: es un clasificador de spans construido sobre un encoder transformer de unos 110 millones de parámetros, con una cabeza personalizada (`BertForSpanClassification`) que no es compatible con `AutoModel` estándar de Hugging Face. Resuelve el problema de extraer de forma estructurada entidades biomédicas solapadas y anidadas en literatura sobre Huntington, un escenario que los esquemas BIO planos convencionales no cubren bien.

Su relevancia actual es acotada pero específica: sirve como baseline reproducible para la tarea T2KNOW, como referencia para evaluar modelos de NER anidado en dominio biomédico y como ejemplo de adaptación de BioBERT a un esquema de clasificación multi-etiqueta. El rendimiento publicado es modesto (F1 medio de 0,6153 sobre tres semillas), lo que lo sitúa como línea base más que como solución de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, BioBERT v1.1) con cabeza de clasificación de spans personalizada (`BertForSpanClassification`) |
| Parametros totales | No disponible en la información proporcionada (BioBERT base cased v1.1 tiene del orden de 110 M, dato no confirmado en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (limitación estándar de BERT base, 512 tokens, no confirmada explícitamente en la model card) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; no se documentan variantes GGUF, ONNX ni cuantizaciones) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,3 GB, tres subcarpetas de semillas) |

## Arquitectura y entrenamiento

El modelo parte de `dmis-lab/biobert-base-cased-v1.1`, un encoder BERT base preentrenado sobre literatura biomédica (PubMed). Sobre ese encoder se aplica una cabeza de clasificación de spans propia, definida en `code/flat_baselines/modeling.py` del archivo de código publicado en Zenodo, que produce salidas multi-etiqueta en esquema BIO plano. Esta cabeza permite representar entidades anidadas y varias etiquetas sobre el mismo span, algo que un `AutoModelForTokenClassification` estándar no soporta directamente.

El ajuste se realizó sobre el split de entrenamiento document-disjoint de T2KNOW v1.0 (resúmenes sobre enfermedad de Huntington, 40 etiquetas UMLS), usando el split de validación para selección de modelo y umbrales. La versión v1.0.1 del corpus corrige registros de frases duplicados en los ficheros de split a nivel de frase, sin modificar anotaciones. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO (no aplicables a un clasificador de este tipo). Se publican tres semillas independientes para medir estabilidad.

La decodificación requiere parámetros concretos fijados en validación: `logit_threshold=0.5` y `start_confidence=0.9`, recogidos en `decoding.json`. El checkpoint no funciona con cabezas estándar de Hugging Face; es imprescindible cargar el código de modelado del release.

## Capacidades

- Reconocimiento de entidades nombradas biomédicas en inglés sobre resúmenes científicos.
- Clasificación multi-etiqueta: asignación de varias etiquetas UMLS al mismo span.
- Manejo de entidades anidadas mediante esquema BIO plano con cabeza de spans personalizada.
- Extracción de 40 tipos de entidad derivados de UMLS en el dominio de la enfermedad de Huntington.
- Tres checkpoints por semilla para reproducibilidad y estimación de varianza.
- No soporta generación de texto, razonamiento libre, código, matemáticas, visión ni audio.
- No dispone de tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Extracción estructurada de entidades en literatura sobre Huntington: dado un abstract de PubMed, el modelo devuelve spans con etiquetas UMLS, útil para construir bases de conocimiento o grafos de entidades en investigación biomédica.
- Baseline para evaluación de NER anidado: sirve como referencia reproducible (tres semillas, F1 medio 0,6153) contra la que comparar modelos nuevos sobre el corpus T2KNOW.
- Anotación asistida (human-in-the-loop): el modelo propone candidatos de entidad que un anotador revisa, acelerando el etiquetado de nuevos resúmenes con el mismo esquema de 40 etiquetas.
- Indexación semántica de una colección de abstracts: poblar un motor de búsqueda con campos de entidad (genes, fenotipos, tratamientos, etc.) para filtrado facetado.
- Estudio de extracción de relaciones downstream: los spans detectados pueden alimentar un módulo posterior de relación entidad-entidad en pipelines de minería de literatura.
- Análisis de reproducibilidad metodológica: las tres semillas permiten estudiar la sensibilidad del NER a la inicialización en un dominio de baja cobertura por etiqueta.
- Prototipado académico de clasificación de spans multi-etiqueta: ejemplo práctico de adaptación de BioBERT con cabeza personalizada para experimentos de NER anidado.

## Benchmarks y rendimiento

Resultados del evaluador oficial de T2KNOW (coincidencia parcial de spans cuenta como medio) sobre el split de test de T2KNOW v1.0.1 (151 documentos, 1.413 frases, 12.579 entidades), con las predicciones archivadas de los checkpoints:

| Semilla | Precision | Recall | F1 |
|---|---|---|---|
| 12345 | 0,5233 | 0,7396 | 0,6130 |
| 23456 | 0,5309 | 0,7383 | 0,6177 |
| 34567 | 0,5323 | 0,7289 | 0,6153 |
| Media (tres semillas) | No disponible | No disponible | 0,6153 (desv. típ. poblacional 0,0019) |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con modelos alternativos sobre el mismo test.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamaño del repo (1,3 GB con tres checkpoints) cada checkpoint individual ronda unos cientos de MB en fp32, lo que sugiere huella de memoria modesta en GPU, aunque el dato exacto no está documentado.
- GPU recomendadas: no disponible en la información proporcionada; por tratarse de un encoder BERT base, cualquier GPU con suficiente memoria para un modelo de ese tamaño debería bastar, pero no se confirma.
- Compatibilidad con GPU de consumo: previsiblemente sí (modelo de tipo BERT base), aunque no se documenta oficialmente.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el uso requiere cargar el código de modelado del release (`code/flat_baselines/modeling.py`) y aplicar `decoding.json`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| t2know-biobert | Encoder BERT + cabeza de spans | No disponible (base BioBERT) | No disponible | NER anidado multi-etiqueta (40 etiquetas UMLS, Huntington) | Apache 2.0 | Hugging Face (repo público) |
| dmis-lab/biobert-base-cased-v1.1 | Encoder BERT base | No disponible en la información | No disponible | Representaciones biomédicas (base para fine-tuning) | Apache 2.0 según la model card del autor | Hugging Face |
| Otros modelos de NER biomédico anidado | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Las métricas miden acuerdo con la capa de anotación de T2KNOW (revisada por experto, un único anotador según el paper), no corrección semántica; un F1 alto no implica extracción semánticamente correcta.
- Etiquetas con muy poco soporte en el corpus son poco fiables.
- El modelo está restringido al dominio de la enfermedad de Huntington y al esquema de 40 etiquetas UMLS del corpus; su comportamiento fuera de ese dominio no está caracterizado.
- Solo inglés; no cubre otros idiomas.
- No es cargable con `AutoModel` estándar: requiere el código de modelado del release; una carga incorrecta puede producir resultados inválidos.
- La decodificación depende de umbrales fijados en validación (`logit_threshold=0.5`, `start_confidence=0.9`); cambiarlos altera precisión y recall.
- El paper está en revisión; la cita formal no está publicada todavía.
- Riesgo de alucinación en el sentido de falsos positivos de entidad: la precisión publicada (en torno a 0,52-0,53) indica que aproximadamente la mitad de las predicciones no coinciden con la anotación de referencia.
- Licencia Apache 2.0 heredada del modelo base; las anotaciones T2KNOW son MIT. No se incluye texto fuente de terceros en el repositorio, pero el uso comercial debe verificarse contra las condiciones del corpus y del modelo base.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/edugredu/t2know-biobert
- Modelo base: https://huggingface.co/dmis-lab/biobert-base-cased-v1.1
- Corpus T2KNOW v1.0.1 (Zenodo): https://doi.org/10.5281/zenodo.23801223
- Repositorio de código BioBERT: https://github.com/dmis-lab/biobert
- Licencia BioBERT: https://github.com/dmis-lab/biobert (fichero LICENSE)
- Paper: en revisión, cita pendiente de publicación (no disponible)

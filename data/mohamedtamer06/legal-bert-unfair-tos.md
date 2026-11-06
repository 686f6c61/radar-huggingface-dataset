# Mohamedtamer06/legal-bert-unfair-tos

## Resumen

Legal-BERT Unfair Clause Classifier es un modelo de clasificación de texto multietiqueta derivado de `nlpaueb/legal-bert-base-uncased`, afinado por el usuario Mohamedtamer06 sobre el subconjunto UNFAIR-ToS del dataset LexGLUE. Su función es detectar ocho categorías de cláusulas abusivas en contratos y términos de servicio: limitación de responsabilidad, terminación unilateral, cambio unilateral, eliminación de contenido, contrato por uso, elección de ley aplicable, jurisdicción y arbitraje. El modelo resuelve un problema concreto de revisión contractual automatizada, una tarea de alto volumen en entornos jurídicos y de cumplimiento normativo.

Arquitectura BERT base con 109.488.392 parámetros totales (encoder transformer de 12 capas), formato de pesos safetensors y un tamaño de repositorio de 0,8 GB. El contexto efectivo está limitado por la ventana de 512 tokens del tokenizador BERT original, por lo que la clasificación se aplica a cláusulas individuales y no a documentos completos; el script incluido `clause_classifier.py` realiza la segmentación previa del contrato.

El aspecto más diferencial es la ruta multilingüe: el modelo declara soporte para inglés y árabe, pero el árabe no se procesa de forma nativa, sino que se detecta automáticamente y se traducciona al inglés con `facebook/nllb-200-distilled-600M` antes de la clasificación. Esto introduce una dependencia externa con licencia CC BY-NC 4.0 (no comercial), un caveat relevante para despliegues en producción. El modelo es relevante ahora por la combinación de un dominio especializado (legal) con un pipeline listo para usar, aunque su adopción pública es todavía muy baja (24 descargas, 0 likes).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base), clasificación multietiqueta |
| Parametros totales | 109.488.392 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (ventana estándar de BERT; no confirmado explícitamente en la model card) |
| Tipos de cuantizacion | No disponible (solo se distribuyen pesos safetensors en fp32/fp16; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (nativo) y árabe (vía traducción automática con NLLB-200) |
| Licencia | CC BY-SA 4.0 (modelo); el traductor NLLB-200-distilled-600M es CC BY-NC 4.0 |
| Formato de pesos | safetensors (`model.safetensors`) + `config.json` y ficheros de tokenizador |

## Arquitectura y entrenamiento

El modelo parte de `nlpaueb/legal-bert-base-uncased`, un BERT base preentrenado específicamente sobre corpus jurídico (legislación, contratos, jurisprudencia). Sobre esa base se realiza un ajuste fino supervisado para clasificación multietiqueta con ocho etiquetas de cláusulas abusivas, usando el dataset `coastalcph/lex_glue` (subconjunto UNFAIR-ToS). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; en un modelo BERT de clasificación esto último no sería esperable.

La innovación técnica no reside en el encoder, sino en el pipeline de inferencia: `clause_classifier.py` implementa segmentación de cláusulas, enrutamiento por idioma, traducción automática del árabe al inglés y clasificación con umbrales de decisión por etiqueta (fichero `thresholds.txt`, ajustados sobre el conjunto de validación). Es decir, el rendimiento reportado en árabe no proviene de un entrenamiento multilingüe real, sino de una cadena traducción-clasificación, lo que condiciona tanto la latencia como la fidelidad de los resultados.

## Capacidades

- Clasificación multietiqueta de cláusulas contractuales en ocho categorías de abusividad (limitación de responsabilidad, terminación unilateral, cambio unilateral, eliminación de contenido, contrato por uso, elección de ley, jurisdicción, arbitraje).
- Clasificación a nivel de cláusula individual, con segmentación automática de contratos completos mediante `classify_contract(contract_text)`.
- Detección automática de idioma y enrutamiento: inglés procesado directamente, árabe traducido con NLLB-200 antes de clasificar.
- Umbrales de decisión por etiqueta ajustados en validación, lo que permite calibrar precisión/recall por categoría.
- No dispone de generación de texto, razonamiento generativo, código, matemáticas, visión, tool calling, function calling ni capacidades de agente. Es exclusivamente un clasificador.
- Capacidad multilingüe limitada a inglés y árabe (este último de forma indirecta).

## Casos de uso

- Revisión automatizada de términos de servicio: dado un contrato de plataforma, el pipeline segmenta cláusulas y marca aquellas que contienen terminación unilateral o cambio unilateral, permitiendo a un equipo legal priorizar la revisión manual.
- Cumplimiento normativo de protección al consumidor: detección de cláusulas potencialmente abusivas en contratos de adhesión antes de su publicación, usando las ocho etiquetas como checklist de riesgos.
- Auditoría de contratos en árabe: empresas con operaciones en mercados de habla árabe pueden clasificar contratos traduciéndolos automáticamente, con la advertencia de que las métricas en árabe provienen de un test set traducción automática y pueden ser optimistas.
- Enriquecimiento de bases de datos contractuales: etiquetado masivo de cláusulas para construir índices de búsqueda por tipo de riesgo, con umbrales por etiqueta ajustables según la tolerancia a falsos positivos.
- Filtrado previo en pipelines de e-discovery: cribado rápido de grandes volúmenes de contratos para descartar documentos sin cláusulas de arbitraje o jurisdicción relevantes antes de un análisis más costoso.
- Sistemas de alerta en herramientas de gestión contractual: integración como servicio de clasificación (por ejemplo, detrás de una API FastAPI) que devuelve las etiquetas activas por cláusula para su visualización en un editor de contratos.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de test con las ocho etiquetas de abusividad:

| Entrada | micro F1 | macro F1 |
|---|---|---|
| Inglés | 79,2 | 81,9 |
| Árabe (test set traducción automática) | 77,9 | 80,3 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones directas con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 para el clasificador BERT (109 M parámetros); en fp16 alrededor de 0,25 GB. La cadena completa con NLLB-200-distilled-600M añade unos 2,4 GB en fp32 (600 M parámetros), por lo que el pipeline multilingüe requiere del orden de 3 GB de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para el pipeline completo (RTX 3060, RTX 4090, T4, L4). Para solo inglés basta una GPU de 1-2 GB o incluso CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para el clasificador en inglés.
- Opciones de despliegue: PyTorch/Hugging Face Transformers con el script `clause_classifier.py`; exportación a ONNX Runtime para inferencia en CPU; despliegue como servicio con FastAPI o similar. No se distribuyen pesos GGUF, por lo que llama.cpp/Ollama no son opciones directas sin conversión manual.
- Latencia y throughput estimados: no disponibles en la información proporcionada. La traducción con NLLB-200 añade latencia significativa por cláusula en la ruta árabe.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Legal-BERT Unfair Clause Classifier (este) | 109,4 M | 512 tokens | Clasificación multietiqueta de cláusulas abusivas (8 etiquetas) | CC BY-SA 4.0 (+ NLLB CC BY-NC 4.0) | Hugging Face, 24 descargas |
| nlpaueb/legal-bert-base-uncased (modelo base) | 109,4 M | 512 tokens | Representación legal general; requiere cabeza de clasificación | Licencia del base (no confirmada en esta ficha) | Hugging Face, ampliamente usado |
| BERT base uncased estándar | 109,4 M | 512 tokens | Representación general; sin especialización legal | Apache 2.0 (referencia habitual) | Hugging Face |
| Modelos generativos tipo Llama/Mistral afinados para legal | 7-8 B+ | 4.096-32.768 tokens | Generación, razonamiento y clasificación vía prompting | Variables | Hugging Face |

No se dispone de comparaciones de rendimiento publicadas entre este modelo y alternativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre cláusulas de términos de servicio (UNFAIR-ToS); el rendimiento en otros tipos de contrato (laborales, mercantiles, inmobiliarios) no se ha medido y puede degradarse.
- Las métricas en árabe se obtuvieron sobre un test set traducción automática, por lo que pueden ser optimistas y no reflejan el rendimiento sobre árabe jurídico real.
- La ruta árabe depende de `facebook/nllb-200-distilled-600M`, con licencia CC BY-NC 4.0 (no comercial); esto puede impedir o restringir el uso comercial del pipeline completo en árabe.
- La licencia CC BY-SA 4.0 del modelo exige atribución y compartir bajo la misma licencia las obras derivadas, lo que condiciona su integración en productos propietarios.
- Riesgo de alucinación no aplica en sentido generativo (es un clasificador), pero sí existe riesgo de falsos positivos y negativos en la detección de cláusulas abusivas, mitigable ajustando `thresholds.txt`.
- Ventana de contexto de 512 tokens: no puede clasificar documentos completos directamente; depende de la calidad de la segmentación de cláusulas del script incluido.
- Sesgos conocidos: no documentados en la model card; cabe esperar sesgos heredados del corpus legal de Legal-BERT y del dataset LexGLUE.
- Adopción muy baja (24 descargas, 0 likes) y sin revisión comunitaria amplia; conviene validar el modelo sobre un conjunto propio antes de usarlo en producción.
- No hay datos publicados sobre latencia, throughput ni consumo energético.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mohamedtamer06/legal-bert-unfair-tos
- Modelo base: https://huggingface.co/nlpaueb/legal-bert-base-uncased
- Dataset LexGLUE (UNFAIR-ToS): https://huggingface.co/datasets/coastalcph/lex_glue
- Traductor NLLB-200-distilled-600M: https://huggingface.co/facebook/nllb-200-distilled-600M
- Paper de Legal-BERT (Chalkidis et al.): https://arxiv.org/abs/2010.02559
- Paper de LexGLUE (Chalkidis et al.): https://arxiv.org/abs/2106.00969
- Paper de NLLB-200 (Meta AI): https://arxiv.org/abs/2207.04672

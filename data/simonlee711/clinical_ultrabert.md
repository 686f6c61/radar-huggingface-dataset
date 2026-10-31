# Simonlee711/Clinical_UltraBERT

## Resumen

Clinical UltraBERT es un modelo de embeddings para texto biomedico y clinico desarrollado por Simonlee711 a partir de dmis-lab/UltraBERT-150M. Se trata de un encoder tipo BERT de 151 millones de parametros afinado con perdida contrastiva (InfoNCE) sobre aproximadamente 100.000 pares de textos biomedicos y clinicos, con el objetivo de mapear texto a vectores de 768 dimensiones utiles para recuperacion de informacion, similitud semantica, clustering y clasificacion.

El problema que resuelve es la falta de encoders ligeros y especializados en el dominio clinico: los checkpoints tipo BERT usados como encoders congelados rinden mal en recuperacion medica, mientras que Clinical UltraBERT obtiene el mejor resultado en 15 de 20 tareas de una suite de evaluacion medica, con mejoras muy notables en retrieval (por ejemplo, 63,5 frente a 33,2 de nDCG@10 en SciFact). Es relevante porque ofrece un modelo compacto (0,6 GB), ejecutable incluso en hardware de consumo, con licencia Apache 2.0 y compatibilidad con la libreria sentence-transformers.

El modelo se entreno durante diez epocas con batch size 64, longitud de secuencia 128 y mean pooling, usando negativos en batch y un negativo duro minado por consulta. Los datos proceden de diez fuentes (F2LLM-v2, MedRAG/pubmed y notas clinicas aumentadas), dejando fuera del entrenamiento los subconjuntos de F2LLM-v2 construidos a partir de datos de test de benchmarks (MedQuAD, SciFact, MedQA, medRxiv clustering) y las respuestas de HealthCareMagic.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer tipo BERT (UltraBERT) con mean pooling |
| Parametros totales | 151.032.576 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | 512 tokens (longitud de secuencia usada en entrenamiento y evaluacion) |
| Tipos de cuantizacion | no disponible (entrenado en fp32; pesos publicados en safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repo: 0,6 GB) |

## Arquitectura y entrenamiento

Clinical UltraBERT parte de UltraBERT-150M, un encoder transformer tipo BERT de 151 millones de parametros. Sobre este checkpoint se aplica un afinado contrastivo con la perdida `CachedMultipleNegativesRankingLoss` (InfoNCE, escala 20), empleando negativos en batch mas un negativo duro minado por par cuando esta disponible. Cada batch se extrae de una unica fuente, de modo que los negativos en batch son tematicamente relevantes. El pooling es de tipo mean sobre los tokens.

Los hiperparametros de entrenamiento son: diez epocas, batch size 64, learning rate 5e-5 con 5% de warm-up y decay lineal, optimizador AdamW (beta2 0,98, weight decay 0,01), longitud de secuencia 128 y entrenamiento en fp32 sobre una unica GPU Apple M4 Max. Los 100.000 pares de entrenamiento se componen de 10.000 pares de cada una de estas diez fuentes: PubMedQA y BioASQ (pregunta a abstract de PubMed), flashcards medicas, MedMCQA y MedInstruct (pregunta a respuesta), MSciNLI, SNLI y MNLI (premisa a hipotesis implicada), titulos a abstracts de PubMed y conversaciones medico-paciente a notas clinicas aumentadas. No se empleo RLHF ni DPO, al tratarse de un modelo de embeddings y no generativo.

## Capacidades

- Generacion de embeddings de 768 dimensiones para texto biomedico y clinico en ingles.
- Recuperacion de informacion (retrieval) semantica: emparejar consultas medicas con abstracts, respuestas o documentos relevantes.
- Similitud semantica entre pares de frases o documentos (pipeline sentence-similarity).
- Clustering de textos cientificos y medicos.
- Clasificacion mediante sondas ligeras (regresion logistica) sobre embeddings congelados: tipos de estudio, sintomas a diagnostico, resumenes medicos, etc.
- Extraccion de caracteristicas generica (feature extraction) para textos del dominio biomedico.
- No es un modelo generativo: no produce texto, no soporta tool calling, agentes ni razonamiento multi-paso.
- Uso mediante sentence-transformers con `trust_remote_code=True` (UltraBERT incluye su propio codigo de modelado, `modeling_ultrabert.py`); a partir de `transformers >= 5.20` la arquitectura esta soportada de forma nativa.

## Casos de uso

- Busqueda semantica en literatura biomedica: dado el fuerte salto en retrieval (por ejemplo, nDCG@10 de 63,5 en SciFact y 61,1 en TREC-COVID frente a 33,2 y 33,3 del modelo base), es adecuado para construir buscadores sobre corpus de abstracts de PubMed o documentos cientificos, indexando los embeddings en un vector store como FAISS.
- Chatbots de informacion sanitaria al consumidor: en tareas de retrieval tipo ChatDoctor y PublicHealthQA alcanza 48,1 y 75,9 de nDCG@10 respectivamente, lo que permite recuperar respuestas medicas relevantes para preguntas de usuarios no especialistas.
- Deteccion de duplicados y agrupacion de notas clinicas: la similitud semantica y el clustering (V-measure de 80,0 en ClusTREC-Covid) permiten agrupar transcripciones o documentos clinicos por tematica.
- Clasificacion de sintomas a diagnostico probable: con un 95,7 de macro-F1 en Symptom2Diagnosis mediante una sonda de regresion logistica, sirve como componente de triage informativo previo a revision profesional.
- Sistemas de recomendacion de ensayos clinicos: en BIRCO Clinical-Trial obtiene 16,2 de nDCG@10, siendo util como primera etapa de filtrado para emparejar perfiles de pacientes con ensayos (aunque con margen de mejora).
- Curacion y deduplicacion de datasets medicos: los embeddings permiten detectar pares casi duplicados o documentos semanticamente equivalentes en corpus grandes de forma eficiente dado su tamano reducido.
- Analisis de similitud entre resumenes cientificos: el 84,2 de correlacion Spearman en BIOSSES lo hace apto para comparar frases tecnicas biomedicas en pipelines de resumen o revision sistematica.

## Benchmarks y rendimiento

Evaluacion en una suite de 20 tareas medicas (10 de retrieval, 7 de clasificacion, BIOSSES y 2 de clustering), con entradas truncadas a 512 tokens. Los baselines son checkpoints masked-LM usados como encoders congelados con mean pooling; las puntuaciones de clasificacion provienen de una sonda de regresion logistica. Puntuaciones x100: retrieval nDCG@10; SciRepEval accuracy; macro-F1 en MTSamples, Symptom2Diagnosis, Medical Abstracts y PubMed RCT; micro-F1 en HoC; Spearman en BIOSSES; V-measure en clustering.

| Tipo | Tarea | Mejor baseline | Clinical UltraBERT |
|---|---|---|---|
| Retrieval | SciFact | 33,2 (UltraBERT-150M) | **63,5** |
| Retrieval | NFCorpus | 6,7 (UltraBERT-150M) | **23,1** |
| Retrieval | TREC-COVID | 33,3 (UltraBERT-150M) | **61,1** |
| Retrieval | MedicalQA | 17,4 (UltraBERT-150M) | **65,1** |
| Retrieval | PublicHealthQA | 55,2 (UltraBERT-150M) | **75,9** |
| Retrieval | CovidQA | 50,5 (UltraBERT-150M) | **70,7** |
| Retrieval | ChatDoctor | 7,7 (UltraBERT-150M) | **48,1** |
| Retrieval | R2MED PMC-Clinical | 6,6 (BioClinical-ModernBERT) | **10,0** |
| Retrieval | R2MED MedQA-Diag | 1,1 (UltraBERT-150M) | **4,1** |
| Retrieval | BIRCO Clinical-Trial | 9,5 (UltraBERT-150M) | **16,2** |
| Clasificacion | SciRepEval DRSM | 69,1 (BioClinical-ModernBERT) | 64,7 |
| Clasificacion | SciRepEval MeSH | 47,7 (UltraBERT-150M) | **61,4** |
| STS | BIOSSES | 75,1 (UltraBERT-150M) | **84,2** |
| Clustering | MedrxivClusteringS2S | 34,5 (UltraBERT-150M) | 32,1 |
| Clustering | ClusTREC-Covid | 78,2 (Bio_ClinicalBERT) | **80,0** |
| Clasificacion | MTSamples | 67,9 (UltraBERT-150M) | 67,5 |
| Clasificacion | Symptom2Diagnosis | 95,3 (UltraBERT-150M) | **95,7** |
| Clasificacion | Medical Abstracts | 55,4 (BioClinical-ModernBERT) | **56,9** |
| Clasificacion | PubMed RCT 20k | 72,7 (BioClinical-ModernBERT) | 71,0 |
| Clasificacion | HoC | 63,8 (UltraBERT-150M) | 61,8 |

Clinical UltraBERT logra el mejor resultado en 15 de las 20 tareas. No se han publicado comparaciones con modelos generativos ni con encoders contrastivos de mayor tamano en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en fp32 para los pesos (151M de parametros), mas margen para activaciones; con cuantizacion int8 el consumo bajaria a unos 150-200 MB (cuantizacion no documentada oficialmente).
- Al ser un encoder de 151M de parametros, cabe sobradamente en GPUs de consumo: cualquier GPU con 2 GB de VRAM o mas (GTX 1650, RTX 3060, RTX 4090, etc.) es suficiente. Tambien es viable su ejecucion en CPU dado el tamano reducido.
- Entrenamiento del afinado se realizo en una unica GPU Apple M4 Max en fp32, lo que indica requisitos de entrenamiento modestos para afinados similares.
- Opciones de despliegue: sentence-transformers (via recomendada, con `trust_remote_code=True` o `transformers >= 5.20`), transformers de Hugging Face, y backends tipicos de serving de embeddings (por ejemplo, integracion con FAISS o vector stores para el indice). No consta soporte especifico documentado en vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Dominio | Entrenamiento | Licencia | Destacado |
|---|---|---|---|---|---|
| Clinical UltraBERT | 151M | Biomedico/clinico | Contrastivo (InfoNCE, 100K pares) | Apache 2.0 | Mejor en 15/20 tareas medicas de su suite |
| UltraBERT-150M (base) | 151M | Biomedico | Masked-LM (preentrenamiento) | Apache 2.0 | Baseline fuerte en clasificacion, debil en retrieval |
| Bio_ClinicalBERT | 110M | Clinico (notas) | Masked-LM sobre notas clinicas | no disponible | Mejor en ClusTREC-Covid (78,2) entre baselines |
| BioClinical-ModernBERT | no disponible | Biomedico/clinico | Masked-LM (arquitectura ModernBERT) | no disponible | Mejor baseline en SciRepEval DRSM y Medical Abstracts |

Frente a sus baselines, Clinical UltraBERT destaca claramente en retrieval (hasta triplicar el nDCG@10 del modelo base en SciFact, TREC-COVID y MedicalQA), mientras que en algunas tareas de clasificacion de estructura documental los encoders masked-LM congelados mantienen ventaja (SciRepEval DRSM, HoC, MTSamples, PubMed RCT).

## Limitaciones y advertencias

- La mayoria del texto de entrenamiento y evaluacion procede de literatura biomedica o de informacion sanitaria para consumidores; las notas clinicas reales aparecen solo via transcripciones de MTSamples y conversaciones medico-paciente sinteticas. No se uso datos credenciados de historia clinica electronica (por ejemplo, MIMIC) en el entrenamiento.
- En prediccion sobre MIMIC-IV a partir de registros EHR serializados (mortalidad, estancia, reingreso), el modelo no mejora respecto a su modelo base.
- La clasificacion de estructura documental (tipo de estudio, rol de la frase) es mas debil que la de los mejores encoders masked-LM, y el afinado redujo algunas puntuaciones de sonda respecto a UltraBERT-150M (SciRepEval DRSM, HoC, MTSamples, MedrxivClusteringS2S).
- Solo soporta ingles; no es apto para contenido clinico en castellano u otros idiomas.
- Al ser un encoder contrastivo entrenado con datos sinteticos y de literatura, puede presentar sesgos derivados de esas fuentes; no se documentan auditorias de sesgo.
- No es un dispositivo medico: sus salidas no deben usarse para decisiones clinicas sin revision por un experto.
- Requiere `trust_remote_code=True` en versiones de transformers anteriores a 5.20, lo que implica ejecutar codigo personalizado del repositorio; conviene revisar `modeling_ultrabert.py` antes de usarlo en produccion.
- Los datos de entrenamiento mantienen sus propias licencias: F2LLM-v2 (Apache 2.0), notas clinicas aumentadas (MIT) y abstracts de PubMed (terminos de uso de la NLM), lo que puede condicionar ciertos usos derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Simonlee711/Clinical_UltraBERT
- Modelo base: https://huggingface.co/dmis-lab/UltraBERT-150M
- Paper (arXiv:2610.36006, MedJev): https://arxiv.org/abs/2610.36006
- Dataset F2LLM-v2: https://huggingface.co/datasets/codefuse-ai/F2LLM-v2
- Dataset MedRAG/pubmed: https://huggingface.co/datasets/MedRAG/pubmed
- Dataset notas clinicas aumentadas: https://huggingface.co/datasets/AGBonnet/augmented-clinical-notes

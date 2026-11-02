# camilaalves/monolingual-coreference-retraining

## Resumen

Monolingual Coreference Retraining es un conjunto de checkpoints de resolución de correferencia monolingüe publicados por Camila Alves como parte de su tesis de máster *Coreference in Context: Portuguese Evaluation of Multilingual and Monolingual Models* (Universidad de Oporto, 2026). El repositorio reúne modelos entrenados sobre cuatro lenguas románicas (español, francés, italiano y catalán) partiendo de encoders BERT específicos de cada idioma, con el objetivo de evaluar hasta qué punto un encoder monolingüe supera o no a los modelos multilingües en la tarea de correferencia.

Técnicamente no es un modelo generativo ni un LLM, sino una colección de checkpoints de PyTorch para un sistema de *span-based coreference resolution*: cada checkpoint combina un encoder tipo BERT con una cabeza de puntuación de pares de spans. Los resultados publicados son modestos y muy dispares según el idioma: desde un CoNLL F1 de 72,63 en italiano (OntoCorefIT con UmBERTo) hasta un 7,69 en francés (Democrat con CamemBERT), lo que refleja tanto la dificultad del corpus como las limitaciones de las configuraciones con restricciones de memoria.

El interés del repositorio es fundamentalmente académico y de reproducibilidad: documenta decisiones de entrenamiento (épocas seleccionadas en dev, umbrales de mención, recortes de candidatos por falta de VRAM) y advierte explícitamente de que las comparaciones con los resultados originales de la tesis no son estrictamente equivalentes en varios casos. No está pensado como componente listo para producción, sino como material de referencia para investigadores en procesamiento del lenguaje natural de lenguas románicas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT/RoBERTa) + cabeza de correferencia basada en spans (span-pair scoring) |
| Parámetros totales | no disponible (depende del encoder: BETO base, CamemBERT base, UmBERTo base y RoBERTa-ca base, todos ~110-125 M) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 384 tokens de longitud máxima de secuencia en la configuración catalana; no disponible para el resto |
| Tipos de cuantización | no disponible (checkpoints PyTorch en fp32/fp16 según entrenamiento; no se publican variantes GGUF ni cuantizadas) |
| Idiomas soportados | español, francés, italiano y catalán (un checkpoint monolingüe por par idioma-corpus) |
| Licencia | no disponible |
| Formato de pesos | checkpoints PyTorch `.pt` (no safetensors, no GGUF) |

## Arquitectura y entrenamiento

Cada checkpoint sigue el paradigma clásico de *coreference resolution* end-to-end: un encoder Transformer contextualiza la secuencia de tokens y una cabeza de puntuación evalúa la probabilidad de que cada par de spans (mención, antecedente) pertenezca al mismo clúster. Los encoders empleados son `dccuchile/bert-base-spanish-wwm-cased` (español), `almanach/camembert-base` (francés), `Musixmatch/umberto-commoncrawl-cased-v1` (italiano) y `projecte-aina/roberta-base-ca-v2` (catalán). Todos los modelos se entrenaron durante 40 épocas, con selección del checkpoint y del umbral de mención sobre el conjunto de desarrollo y evaluación final sobre test con el scorer de CorefUD y coincidencia exacta.

Los corpus utilizados son AnCora (español y catalán), ANCOR y Democrat (francés) y OntoCorefIT (italiano). En los experimentos franceses se emplearon variantes de dataset con segmentación de frases más corta (`french_ancor_lm`, `french_democrat_lm`) para ajustarse a la memoria de GPU, preservando secuencias de tokens, clústeres gold y hablantes a nivel de token, pero alterando los límites oracionales. En catalán, el intento con la configuración original falló por OOM en CUDA durante el scoring de pares de spans, por lo que se redujeron los límites de candidatos (top-span ratio de 0,4 a 0,1, máximo de top spans de 3900 a 800, máximo de antecedentes de 50 a 10). No se documenta uso de RLHF, DPO ni datos de entrenamiento adicionales más allá de los corpus de correferencia citados.

## Capacidades

- Resolución de correferencia monolingüe: identificación de menciones y agrupación en clústeres de entidades para español, francés, italiano y catalán.
- Procesamiento de documentos con hablantes anotados a nivel de token (relevante en corpus como Democrat, de discurso parlamentario).
- Evaluación con métricas estándar de la tarea: MUC, B-cubed, CEAF-e y CoNLL F1 (media de las tres anteriores).
- No soporta generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingües limitadas a los cuatro idiomas cubiertos, con un modelo independiente por idioma (no hay transferencia entre ellos).
- No dispone de modo *thinking*, audio ni otras capacidades especiales.

## Casos de uso

- Investigación en correferencia de lenguas románicas: reproducción y extensión de los experimentos de la tesis comparando encoders monolingües frente a multilingües sobre AnCora, ANCOR, Democrat y OntoCorefIT.
- Análisis de discurso parlamentario en francés: el checkpoint Democrat-CamemBERT permite experimentar con resolución de correferencia en transcripciones con hablantes etiquetados, aunque su F1 bajo (7,69 en test) lo hace apto solo para estudios exploratorios.
- Evaluación de encoders específicos de idioma: el checkpoint español BETO (CoNLL F1 47,74 en test) sirve como línea base monolingüe para comparar con modelos multilingües en AnCora.
- Punto de partida para *fine-tuning* adicional: al ser checkpoints PyTorch con código versionado en GitHub, pueden reentrenarse sobre nuevos corpus de correferencia con la misma implementación.
- Estudio de compromisos memoria-precisión: la configuración catalana con límites reducidos de candidatos documenta el impacto de recortar top spans y antecedentes en la calidad final (CoNLL F1 49,28 frente a 33,26 de la tesis original).
- Docencia y reproducibilidad: material de referencia para cursos de PLN que ilustren el pipeline completo de un sistema de correferencia basado en spans, desde la generación de candidatos hasta el scoring con CorefUD.
- Auditoría metodológica: los avisos sobre resegmentación de frases y cambios de configuración permiten estudiar cómo decisiones de preprocesado afectan a las métricas de correferencia.

## Benchmarks y rendimiento

Resultados publicados en la model card (evaluación con CorefUD scorer, coincidencia exacta):

| Modelo / corpus | Época (dev) | Umbral | DEV CoNLL F1 | TEST CoNLL F1 | TEST MUC F1 | TEST B3 F1 | TEST CEAF-e F1 |
|---|---|---:|---:|---:|---:|---:|---:|
| Español AnCora — BETO | 29 | 0,0 | 48,76 | 47,74 | no disponible | no disponible | no disponible |
| Francés ANCOR — CamemBERT | 35 | 0,0 | 30,66 | 25,78 | no disponible | no disponible | no disponible |
| Francés Democrat — CamemBERT | 20 | 0,8 | 10,34 | 7,69 | 8,16 | 6,30 | 8,62 |
| Italiano OntoCorefIT — UmBERTo | 38 | 0,0 | 72,86 | 72,63 | 78,82 | 69,72 | 69,36 |
| Catalán AnCora — RoBERTa-ca v2 | 28 | 0,0 | 53,00 | 49,28 | 52,31 | 46,76 | 48,78 |

Comparación con los resultados originales de la tesis (solo donde se documenta):

| Modelo | TEST CoNLL F1 (tesis) | TEST CoNLL F1 (retraining) | Diferencia |
|---|---:|---:|---:|
| Francés Democrat — CamemBERT | 6,50 | 7,69 | +1,19 |
| Italiano OntoCorefIT — UmBERTo | 73,15 | 72,63 | -0,52 |
| Catalán AnCora — RoBERTa-ca v2 | 33,26 | 49,28 | +16,02 (no estrictamente comparable por cambio de configuración) |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; al tratarse de encoders base (~110-125 M de parámetros) más la cabeza de scoring de spans, la inferencia en fp16 debería caber holgadamente en GPUs de consumo, pero el repositorio no publica cifras.
- El entrenamiento original requirió GPUs con suficiente memoria para el scoring de pares de spans; en catalán la configuración original provocó OOM en CUDA y hubo que reducir candidatos.
- GPU recomendadas: no disponible en la documentación; por el tamaño de los encoders, una RTX 3090/4090 o una A100 serían suficientes para inferencia y reentrenamiento, pero es una estimación, no un dato publicado.
- Despliegue: no compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no son modelos generativos ni están en formato GGUF/safetensors. Requiere la implementación propia del repositorio https://github.com/camiladuart/coref.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto | TEST CoNLL F1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Monolingual Coreference Retraining (este repo) | Span-based coref con encoder monolingüe | es, fr, it, ca | 384 (catalán documentado) | 7,69-72,63 según idioma | no disponible | HuggingFace, checkpoints `.pt` |
| Corrected Romance multilingual model (`camilaalves/romance-coreference-mdeberta-v3-corefpt-fixed`) | Coref multilingüe con mDeBERTa-v3 | lenguas románicas | no disponible | no disponible | no disponible | HuggingFace |
| Corrected Portuguese Coref-PT (`camilaalves/bertimbau-corefpt-cp1252`) | Coref monolingüe portugués con BERTimbau | pt | no disponible | no disponible | no disponible | HuggingFace |
| Modelos de correferencia multilingües tipo CorefUD baselines | Coref multilingüe | varias | variable | no disponible | variable | variable |

La comparativa cuantitativa con alternativas externas no está disponible en la información proporcionada; los únicos puntos de comparación documentados son los resultados originales de la tesis recogidos en la tabla de benchmarks.

## Limitaciones y advertencias

- No son modelos cargables con `AutoModel.from_pretrained()`: requieren la implementación y los scripts de predicción del repositorio GitHub del autor.
- El rendimiento es muy desigual: el checkpoint francés Democrat obtiene un CoNLL F1 de 7,69 en test, lo que lo hace inviable para uso real sin mejoras sustanciales.
- Las comparaciones con los resultados originales de la tesis no son estrictamente equivalentes en francés (resegmentación de frases en las variantes `_lm`) ni en catalán (límites de candidatos reducidos por OOM).
- El cambio de límites oracionales en los datasets franceses puede alterar la generación de spans candidatos y, por tanto, las predicciones.
- Licencia no especificada: no se puede asumir uso comercial sin consultar al autor.
- No se documentan sesgos conocidos ni tasas de alucinación; al no ser un modelo generativo, el riesgo de alucinación no aplica en el sentido habitual, pero sí el de clústeres incorrectos o menciones no detectadas.
- Cobertura lingüística limitada a español, francés, italiano y catalán; sin soporte para otras lenguas ni transferencia entre los checkpoints.
- El repositorio ocupa 7,5 GB y contiene múltiples checkpoints; conviene descargar solo el subdirectorio del idioma de interés.
- Sin descargas ni likes en el momento de la consulta, lo que sugiere ausencia de validación comunitaria independiente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/camilaalves/monolingual-coreference-retraining
- Código e implementación de correferencia: https://github.com/camiladuart/coref
- Modelo relacionado (portugués corregido): https://huggingface.co/camilaalves/bertimbau-corefpt-cp1252
- Modelo relacionado (multilingüe romance corregido): https://huggingface.co/camilaalves/romance-coreference-mdeberta-v3-corefpt-fixed
- Encoder español BETO: https://huggingface.co/dccuchile/bert-base-spanish-wwm-cased
- Encoder francés CamemBERT: https://huggingface.co/almanach/camembert-base
- Encoder italiano UmBERTo: https://huggingface.co/Musixmatch/umberto-commoncrawl-cased-v1
- Encoder catalán RoBERTa-ca v2: https://huggingface.co/projecte-aina/roberta-base-ca-v2

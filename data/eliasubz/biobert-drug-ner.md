# eliasubz/biobert-drug-ner

## Resumen

BioBERT Drug NER es un modelo de reconocimiento de entidades nombradas (NER) especializado en la detección de menciones de fármacos en texto biomédico en inglés. Lo desarrolla eliasubz y se distribuye en Hugging Face como un modelo de 107,7 millones de parámetros con licencia derivada de los términos Health AI Developer Foundations de Google. Se trata de un fine-tuning de BioBERT (`dmis-lab/biobert-base-cased-v1.1`) con una cabeza de clasificación BIO, entrenado sobre el corpus DDI (Drug-Drug Interaction) y aumentado con datos sintéticos etiquetados por un modelo profesor de 27B, MedGemma-27B.

El problema que resuelve es acotado pero relevante en el ámbito farmacéutico y biomédico: identificar qué fragmentos de una frase son fármacos y clasificarlos en cuatro categorías (`drug`, `group`, `brand` y `drug_n`). La innovación principal es la destilación parcial desde un modelo grande hacia un encoder pequeño: el resultado retiene aproximadamente el 90 % del macro-F1 del profesor (0,759 frente a 0,845) con un coste computacional 530 veces menor (2,9 ms por frase frente a 1.542 ms en una RTX 3090).

Es relevante ahora porque demuestra que la destilación selectiva (usar el profesor solo para la clase más difícil, `drug_n`) puede ser más efectiva que la destilación completa, que según el autor empeoró los resultados. El modelo está pensado para pipelines de extracción de información biomédica donde el throughput y el coste importan más que la precisión máxima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base), con cabeza de token classification BIO |
| Parametros totales | 107.726.601 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la de BioBERT base, 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | Health AI Developer Foundations (license_name: health-ai-developer-foundations) |
| Formato de pesos | safetensors (`model.safetensors`), compatible con transformers |

## Arquitectura y entrenamiento

La arquitectura es un encoder BERT base cased (12 capas, 768 dimensiones ocultas, aproximadamente 110M de parámetros) inicializado desde BioBERT base cased v1.1, que a su vez es un checkpoint de BERT entrenado sobre literatura biomédica (PubMed). Sobre el encoder se añade una cabeza de clasificación token a token con esquema BIO para las cuatro etiquetas de entidad. No hay innovaciones arquitectónicas: es un fine-tuning clásico de token classification.

El entrenamiento se realizó en dos fases. Primero, el estudiante se entrenó sobre las 5.343 frases del conjunto de entrenamiento del corpus DDI (10 épocas, learning rate 5e-5). Después, se continuó durante 5 épocas adicionales (learning rate 2e-5) sobre las frases doradas más 1.645 frases de PubMed etiquetadas por el profesor MedGemma-27B, con una pérdida combinada `0.5·CE(gold) + 0.5·CE(teacher)`. Los datos adicionales se seleccionaron específicamente para cubrir la clase `drug_n`, la más rara: se buscaron en PubMed ejemplos de nombres `drug_n` del conjunto de entrenamiento DDI, se extrajeron hasta 4 abstracts por instancia, MedGemma reescribió cada frase con etiquetas XML alrededor de los fármacos y se mapearon las etiquetas a spans de caracteres. Solo se conservaron las 1.645 frases en las que el profesor detectó un `drug_n`.

## Capacidades

- Reconocimiento de entidades de fármacos en texto biomédico en inglés, con cuatro categorías: `drug` (nombre genérico o principio activo), `group` (grupo farmacológico), `brand` (nombre comercial) y `drug_n` (fármaco no aprobado o sustancia no comercializada).
- Clasificación token a token con esquema BIO, compatible con el pipeline `token-classification` de transformers y con `aggregation_strategy="simple"`.
- Extracción de spans de caracteres para integración en pipelines de anotación y post-procesado.
- No soporta tool calling, function calling, agentes, visión, audio ni modo thinking: es un modelo puramente extractivo.
- Capacidad multilingüe limitada al inglés; no se declara soporte para castellano ni otros idiomas.
- No genera texto libre; su salida es una secuencia de etiquetas por token.

## Casos de uso

- **Extracción de fármacos en literatura científica**: procesar abstracts de PubMed o MEDLINE para poblar bases de datos de farmacovigilancia con menciones de principios activos, marcas y grupos terapéuticos, aprovechando el bajo coste por frase (2,9 ms) para escalar a millones de documentos.
- **Preprocesado para detección de interacciones farmacológicas**: usar las entidades detectadas como entrada a un modelo de relación (por ejemplo, un clasificador de pares) que determine si dos fármacos interactúan; el NER reduce el espacio de búsqueda de pares candidatos.
- **Anotación asistida de corpus clínicos**: pre-etiquetar frases de notas clínicas o informes para que anotadores humanos revisen y corrijan, reduciendo el coste de construcción de datasets; conviene validar antes el rendimiento en dominio clínico, que la model card advierte que será inferior.
- **Enriquecimiento de bases de datos de medicamentos**: mapear nombres comerciales (`brand`) a principios activos (`drug`) en catálogos o textos regulatorios, usando la clasificación por categoría para normalizar entradas.
- **Filtrado de documentos relevantes**: descartar rápidamente textos que no contienen fármacos antes de pasarlos a modelos más costosos, dado el throughput alto en GPU consumer.
- **Sistemas de alerta temprana en farmacovigilancia**: procesar informes de eventos adversos en inglés para extraer los fármacos implicados y priorizar los casos que requieren revisión humana.
- **Investigación sobre destilación**: servir como referencia reproducible para estudiar destilación selectiva por clase desde modelos grandes hacia encoders pequeños, dado que el código está publicado.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test del DDI corpus (1.430 frases), comparados con el profesor MedGemma-27B (4-bit + LoRA):

| Metrica | MedGemma-27B (profesor) | BioBERT Drug NER |
|---|---|---|
| Parametros | 27B | 108M |
| ms por frase (RTX 3090) | 1.542 | 2,9 (530× más rápido) |
| Macro-F1 | 0,845 | 0,759 (89,8 % retenido) |
| Micro-F1 | 0,925 | 0,888 (95,9 % retenido) |
| Accuracy (word-level) | 0,984 | 0,980 |

Desglose por clase y split:

| Split | Macro-F1 | Micro-F1 | Accuracy | drug | group | brand | drug_n |
|---|---|---|---|---|---|---|---|
| devel | 0,837 | 0,915 | 0,982 | 0,950 | 0,884 | 0,914 | 0,599 |
| test | 0,759 | 0,888 | 0,980 | 0,926 | 0,844 | 0,924 | 0,339 |

La caída más acusada se produce en `drug_n` (0,599 en devel frente a 0,339 en test), la clase minoritaria y más difícil.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB solo para pesos; en la práctica, con activaciones y overhead de PyTorch, cabe holgadamente en cualquier GPU con 2 GB o más.
- Cabe en GPUs consumer: RTX 3060, RTX 4060, RTX 4090, entre otras; también puede ejecutarse en CPU para volúmenes moderados.
- GPU recomendadas para alto throughput: RTX 3090 (referencia de la medición), A100, H100 o L4 para despliegues en servidor.
- Opciones de despliegue: transformers (`pipeline("token-classification")`), TGI, vLLM (soporte de modelos encoder), ONNX Runtime y llama.cpp no aplica (no es un modelo generativo GGUF).
- Latencia: 2,9 ms por frase medida en una RTX 3090 con el profesor en `generate` (batch 16); el throughput agregado no se detalla en la información disponible.
- Cuantización: no se documentan variantes GGUF ni int8/int4; al ser un encoder pequeño, la cuantización rara vez es necesaria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Macro-F1 (DDI test) | Licencia |
|---|---|---|---|---|---|
| eliasubz/biobert-drug-ner | 108M | no disponible | NER de fármacos (4 clases) | 0,759 | Health AI Developer Foundations |
| eliasubz/medgemma-27b-drug-ner (profesor) | 27B (4-bit + LoRA) | no disponible | NER de fármacos (4 clases) | 0,845 | no disponible en la información proporcionada |
| dmis-lab/biobert-base-cased-v1.1 (base) | 108M | 512 tokens (BERT base) | MLM / base para fine-tuning | no disponible (no es NER por defecto) | Apache-2.0 |

No se dispone en la información proporcionada de resultados de otros modelos NER biomédicos comparables (por ejemplo, variantes de PubMedBERT o SciSpacy) sobre el mismo split del DDI corpus.

## Limitaciones y advertencias

- Dominio restringido a frases en inglés de DrugBank y MEDLINE; el rendimiento en notas clínicas u otros registros será inferior al reportado.
- `drug_n` es débil (F1 0,339 en test); no debe usarse como señal fiable para fármacos no comercializados sin revisión humana.
- Las etiquetas de PubMed generadas por MedGemma no fueron verificadas manualmente, por lo que el estudiante puede haber aprendido errores del profesor.
- Riesgo de alucinación bajo en sentido generativo (no produce texto libre), pero riesgo de falsos positivos y negativos en la extracción de spans.
- La licencia Health AI Developer Foundations impone restricciones específicas; debe revisarse antes de cualquier uso comercial o clínico.
- La medición de velocidad compara el profesor en `generate` de Hugging Face con batch 16; con un servidor LLM más rápido (vLLM) la ventaja del estudiante sería menor.
- No hay datos publicados sobre sesgos demográficos o de otro tipo; al operar sobre texto científico, hereda los sesgos de la literatura biomédica.
- El modelo no está validado para uso clínico directo ni para decisiones terapéuticas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/eliasubz/biobert-drug-ner
- Modelo profesor MedGemma-27B Drug NER: https://huggingface.co/eliasubz/medgemma-27b-drug-ner
- Modelo base BioBERT: https://huggingface.co/dmis-lab/biobert-base-cased-v1.1
- Dataset DDI corpus: https://huggingface.co/datasets/bigbio/ddi_corpus
- Paper del DDI corpus (Herrero-Zazo et al., 2013): https://doi.org/10.1016/j.jbi.2013.07.011
- Código: https://github.com/eliasubz/AHLT
- Términos de licencia Health AI Developer Foundations: https://developers.google.com/health-ai-developer-foundations/terms

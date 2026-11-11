# ducbao210/NER

## Resumen

El modelo publicado como `ducbao210/NER` es un checkpoint de clasificación de tokens (token classification) orientado al reconocimiento de entidades nombradas (NER) en textos médicos y de salud pública en vietnamita, concretamente en el corpus PhoNER_COVID19. Lo desarrolla el usuario ducbao210 y forma parte de un proyecto de experimentación más amplio (repositorio GitHub asociado) que compara arquitecturas recurrentes, transformers entrenados desde cero y encoders preentrenados como PhoBERT, XLM-RoBERTa y ViDeBERTa, con una capa CRF opcional y destilación de conocimiento de PhoBERT hacia estudiantes recurrentes.

El modelo resuelve la extracción estructurada de información a partir de informes de COVID-19: personas, localizaciones, fechas, enfermedades o síntomas, identificadores de paciente, edad, profesión, transporte y género. Esto lo hace útil para tareas de vigilancia epidemiológica, anonimización de informes clínicos y construcción de bases de datos estructuradas a partir de texto libre.

La ficha presenta una discrepancia relevante: la model card describe un proyecto en vietnamita, mientras que los metadatos de Hugging Face declaran el idioma `en` y la etiqueta `vietnamese` aparece solo como tag. El repositorio ocupa 13,5 GB, lo que sugiere que contiene pesos de varias arquitecturas o checkpoints intermedios, no un único modelo ligero. No se especifican parámetros totales, contexto ni licencia en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Familia de arquitecturas: LSTM, BiLSTM, Transformer from scratch, PhoBERT, PhoBERT+LoRA, XLM-RoBERTa, ViDeBERTa; capa CRF opcional |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la configuracion define una longitud maxima de secuencia, pero no se especifica el valor) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (segun la model card); metadatos declaran `en` |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 13,5 GB; presumiblemente checkpoints PyTorch, sin confirmar) |

## Arquitectura y entrenamiento

El proyecto entrena y evalúa etiquetadores de secuencia sobre el corpus PhoNER_COVID19, que usa archivos CoNLL segmentados por palabras con etiquetas BIO. La configuración define 20 etiquetas: `O` más pares `B-`/`I-` para 10 tipos de entidad (organización, síntoma/enfermedad, localización, fecha, identificador de paciente, edad, nombre, profesión, transporte y género). El pipeline lee los splits de train y dev, aplica aumento de datos del repositorio, alinea las etiquetas a nivel de palabra con los subwords del tokenizador y selecciona el mejor checkpoint por F1 a nivel de entidad en validación.

Las arquitecturas soportadas incluyen líneas base recurrentes (LSTM y BiLSTM), un Transformer entrenado desde cero, y encoders preentrenados (PhoBERT, PhoBERT con LoRA, XLM-RoBERTa y ViDeBERTa). Cada modelo puede incorporar una capa CRF de cadena lineal mediante `--use_crf`. También se implementa destilación de conocimiento con PhoBERT como profesor y BiLSTM (u otros estudiantes recurrentes/Transformer) como alumno, compartiendo el tokenizador de PhoBERT para alinear salidas a nivel de token; la temperatura por defecto es 4,0 y el peso de destilación configurado es 0,7 (`KDConfig`). La inferencia acepta texto vietnamita en bruto, lo segmenta con `underthesea` y emite la etiqueta predicha por palabra.

## Capacidades

- Reconocimiento de entidades nombradas en vietnamita sobre dominios médicos y de salud pública (COVID-19).
- Clasificación de 10 tipos de entidad con esquema BIO: organización, síntoma/enfermedad, localización, fecha, identificador de paciente, edad, nombre, profesión, transporte y género.
- Etiquetado a nivel de token con alineación de subwords, adecuado para textos segmentados por palabras.
- Decodificación CRF opcional para imponer coherencia en las secuencias de etiquetas.
- Inferencia sobre texto en bruto mediante segmentación con `underthesea`.
- Soporte de destilación de conocimiento para obtener estudiantes más ligeros a partir de PhoBERT.
- No se documentan capacidades de generación de texto, razonamiento general, código, matemáticas, visión, tool calling ni agentes.

## Casos de uso

- Vigilancia epidemiológica: extraer automáticamente localizaciones, fechas y síntomas de informes de COVID-19 para alimentar paneles de seguimiento y series temporales de casos por región.
- Anonimización de informes clínicos: detectar nombres, identificadores de paciente y edades para enmascarar datos personales antes de compartir o publicar documentos.
- Construcción de bases de datos estructuradas: convertir texto libre de partes epidemiológicos en registros tabulares con entidades normalizadas (fecha, ubicación, enfermedad).
- Análisis de transporte y movilidad: identificar entidades de transporte en informes para estudiar cadenas de contagio asociadas a desplazamientos.
- Investigación en NLP médico vietnamita: servir como línea base reproducible para comparar arquitecturas recurrentes, transformers y encoders preentrenados sobre PhoNER_COVID19.
- Destilación y despliegue en entornos con recursos limitados: entrenar un estudiante BiLSTM a partir de PhoBERT para inferencia de bajo coste en CPU o GPUs modestas.
- Enriquecimiento de historiales clínicos: extraer profesión, edad y síntomas para investigación epidemiológica agregada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe que la evaluación reporta métricas a nivel de token y a nivel de entidad BIO sobre el split de test, y que la selección de checkpoint usa F1 a nivel de entidad en validación, pero no incluye cifras concretas.

## Requisitos de hardware

- VRAM estimada: no disponible. Depende de la arquitectura concreta dentro del repositorio; un BiLSTM o un Transformer pequeño pueden ejecutarse en CPU, mientras que PhoBERT o XLM-RoBERTa requieren GPU para entrenamiento cómodo.
- GPU recomendadas: no disponibles de forma específica; la model card indica que se recomienda GPU para el entrenamiento de modelos preentrenados, sin nombrar modelos concretos.
- Cabe en GPU de consumo: probablemente sí para estudiantes recurrentes y modelos base; no confirmado para los encoders preentrenados en entrenamiento.
- Opciones de despliegue: el proyecto proporciona un CLI propio (`main.py`) con modos `train`, `evaluate`, `inference` y `distill`, basado en PyTorch. No se documenta integración con vLLM, llama.cpp, Ollama o TGI, que además no aplican a un modelo de clasificación de tokens.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ducbao210/NER | Token classification (NER médico COVID-19) | Vietnamita (metadatos: en) | no disponible | no disponible | Hugging Face, repo 13,5 GB |
| PhoBERT (VinAI) | Encoder preentrenado para vietnamita | Vietnamita | no disponible en esta ficha | no disponible en esta ficha | Hugging Face (referenciado como base) |
| XLM-RoBERTa | Encoder multilingüe | Multilingüe | no disponible en esta ficha | no disponible en esta ficha | Hugging Face (referenciado como base) |
| ViDeBERTa | Encoder preentrenado para vietnamita | Vietnamita | no disponible en esta ficha | no disponible en esta ficha | Hugging Face (referenciado como base) |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La model card está en vietnamita e inglés, pero los metadatos declaran `en` como idioma; existe ambigüedad sobre el idioma real de uso y sobre si el checkpoint publicado corresponde a un modelo concreto o a un conjunto de checkpoints.
- El repositorio de 13,5 GB sugiere múltiples pesos o artefactos; no se especifica qué checkpoint es el principal ni cómo cargarlo.
- No se declara licencia, lo que impide confirmar el uso comercial y la redistribución.
- El dominio es muy específico (informes COVID-19 en vietnamita); el rendimiento fuera de ese dominio o idioma es incierto.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y negativos en la extracción de entidades, especialmente con nombres propios, identificadores y fechas ambiguas.
- La dependencia de `underthesea` para la segmentación de palabras introduce un paso adicional que puede afectar a la alineación con subwords.
- No hay información sobre sesgos del corpus ni sobre evaluación de equidad.
- No se documentan requisitos de producción, versiones de dependencias fijas ni pruebas de robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ducbao210/NER
- Repositorio GitHub del proyecto: https://github.com/ducbao210/Medical-Named-Entity-Recognition-for-Vietnamese-COVID-19-Corpora
- Corpus PhoNER_COVID19 (VinAIResearch): https://github.com/VinAIResearch/PhoNER_COVID19

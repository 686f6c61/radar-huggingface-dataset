# shahbakhsh/BalMorph

## Resumen

BalMorph es un analizador morfológico para el idioma balochi (código ISO `bal`), desarrollado mediante fine-tuning del modelo `shahbakhsh/BalBERT`, un encoder transformer de 278 millones de parámetros adaptado de `xlm-roberta-base` mediante Domain-Adaptive Pretraining (DAPT) sobre un corpus monolingüe de 97 624 oraciones balochi normalizadas. El modelo predice lemas y 22 atributos morfológicos (caso, género, número, tiempo, aspecto, persona, etc.) para cada token, lo que lo convierte en una herramienta de anotación lingüística para una lengua de bajos recursos digitales.

Su relevancia radica en que es uno de los pocos recursos de procesamiento de lenguaje natural específicos para balochi, una lengua iraní hablada en Pakistán, Irán, Afganistán y la diáspora. Aunque los resultados de test son modestos —especialmente en lematización (accuracy de 0.0032)—, el modelo ofrece un F1 morfológico de 0.539 y una exactitud de coincidencia completa de rasgos (FEATS) de 0.2335, lo que lo sitúa como un primer paso para tareas de anotación automática en este idioma. El modelo es de tipo encoder-only, por lo que no genera texto, y su uso principal es la clasificación de tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) fine-tuneado |
| Parametros totales | 278 M (heredados de BalBERT) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el base XLM-RoBERTa usa 512 tokens, no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Balochi (principalmente); el base es multilingue |
| Licencia | no disponible |
| Formato de pesos | PyTorch (formato de archivo no especificado) |

## Arquitectura y entrenamiento

BalMorph se construye sobre BalBERT, un encoder transformer de 278 M de parámetros obtenido mediante Domain-Adaptive Pretraining (DAPT) de `xlm-roberta-base` con un corpus limpio y normalizado de 97 624 oraciones balochi. El fine-tuning para análisis morfológico se realiza como una tarea de clasificación por token: para cada token de entrada, el modelo predice su lema y un conjunto de rasgos morfológicos (AdpType, AdvType, Aspect, Case, Clitic, Definite, Degree, Dem, Gender, Mood, Neg, NumType, Number, PartType, Person, Polarity, Poss, PronType, Reflex, Tense, VerbForm, Voice). No se especifica el tamaño del dataset de fine-tuning ni el método de entrenamiento (p. ej., si se usó aprendizaje por transferencia con capas congeladas). Tampoco se menciona el uso de RLHF, DPO u otras técnicas de alineación, ya que se trata de un modelo discriminativo, no generativo.

## Capacidades

- Analisis morfologico de tokens en balochi: prediccion de lemas y 22 atributos morfologicos (caso, genero, numero, tiempo, aspecto, persona, polaridad, etc.).
- Etiquetado de partes del discurso implicito a traves de los rasgos morfologicos (p. ej., VerbForm, PronType, PartType).
- Procesamiento de texto escrito en balochi estandar; los dialectos orales o variantes ortograficas no estandar pueden requerir ajuste adicional.
- No genera texto: al ser un encoder, no es adecuado para tareas generativas.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada: el modelo base es multilingue, pero el fine-tuning esta especializado en balochi.

## Casos de uso

- Anotacion linguistica de corpus balochi: BalMorph puede etiquetar automaticamente textos balochi con rasgos morfologicos, facilitando la creacion de treebanks o recursos anotados para investigacion linguistica.
- Desarrollo de herramientas NLP para balochi: sirve como componente de preprocesamiento para tareas posteriores como traduccion automatica, extraccion de informacion o analisis de sentimiento, donde la informacion morfologica es util.
- Estudios dialectologicos y sociolinguisticos: al predecir rasgos como caso, genero o tiempo, permite analizar variaciones morfologicas en diferentes corpus o registros del balochi.
- Educacion y preservacion linguistica: puede usarse en aplicaciones de ensenanza de balochi como segunda lengua, proporcionando retroalimentacion morfologica sobre ejercicios de escritura.
- Investigacion en linguistica computacional para lenguas de bajos recursos: BalMorph es un caso de estudio de como adaptar modelos multilingues a idiomas poco digitalizados, y puede servir de base para comparar metodologias de DAPT y fine-tuning.
- Filtrado y normalizacion de texto: aunque no es su funcion principal, la prediccion de rasgos puede ayudar a identificar errores ortograficos o variantes no estandar en corpus balochi.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son los siguientes (conjunto de test):

| Metrica | Valor |
|---|---|
| Lemma accuracy | 0.0032 |
| Morphological macro F1 | 0.539 |
| Complete FEATS exact-match accuracy | 0.2335 |

No se han publicado comparaciones con otros modelos en la informacion disponible. La baja accuracy de lematizacion sugiere que la tarea es especialmente dificil, posiblemente por la riqueza morfologica del balochi o por limitaciones del corpus de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 278 M de parametros, en FP16 los pesos ocupan aproximadamente 556 MB. Con overhead de activaciones y secuencias de hasta 512 tokens, cabria en GPUs con 4 GB de VRAM o menos.
- GPU recomendadas: cualquier GPU consumer moderna (p. ej., NVIDIA GTX 1660, RTX 2060 o superior) es suficiente. No requiere GPU de datacenter.
- Compatibilidad con consumer GPU: si, cabe en GPUs de gama media e incluso en CPU con suficiente RAM (inferencia lenta pero viable).
- Opciones de despliegue: al ser un modelo PyTorch, puede servirse con Hugging Face Transformers, o exportarse a ONNX para inferencia optimizada. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles. Para un encoder de este tamano, la latencia por secuencia suele ser de decenas de milisegundos en GPU, pero no hay datos publicados.

## Comparativa con modelos similares

No se dispone de informacion sobre otros analizadores morfologicos especificos para balochi. Como referencia, el modelo base BalBERT se puede comparar con otros encoders multilingues adaptados a lenguas de bajos recursos, pero no hay datos publicos de rendimiento comparativo. Por tanto, la comparativa se limita a indicar que no hay alternativas directas conocidas en el ecosistema de Hugging Face para esta tarea y lengua.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entreno principalmente con texto escrito en balochi estandar; los dialectos orales o variantes ortograficas no estandar pueden producir resultados poco fiables.
- Riesgo de alucinacion: al ser un modelo discriminativo, no genera texto libre, pero puede asignar etiquetas morfologicas incorrectas, especialmente en lemas (accuracy muy baja).
- Limitaciones de contexto: la longitud de contexto no esta confirmada, pero el base XLM-RoBERTa usa 512 tokens, lo que limita el analisis a frases u oraciones cortas.
- Restricciones de licencia: la licencia no esta especificada, por lo que se desconoce si permite uso comercial o modificacion. Se recomienda contactar al autor antes de usar en produccion.
- Adecuacion para produccion: los resultados de test son bajos, especialmente en lematizacion, por lo que el modelo no es recomendable para tareas criticas sin una evaluacion adicional y posible reentrenamiento con mas datos.
- Dependencia del modelo base: cualquier limitacion de BalBERT (p. ej., dominio textual) se hereda en BalMorph.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shahbakhsh/BalMorph
- Modelo base BalBERT en Hugging Face: https://huggingface.co/shahbakhsh/BalBERT
- Repositorio GitHub de BalBERT: https://github.com/shah-bakhsh/BalBERT
- Repositorio GitHub de BalPOS (modelo relacionado): https://github.com/shah-bakhsh/BalPOS
- Se menciona un archivo `FINAL_REPORT.txt` en el repositorio de GitHub con metodologia completa, auditoria del dataset y limitaciones, pero no se proporciona la URL directa.

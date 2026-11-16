# JesseHuang922/lv_roberta_base

## Resumen

`lv_roberta_base` es un pipeline de spaCy para el procesamiento del letón (laviano), construido sobre el backbone XLM-RoBERTa-base de Facebook AI. Lo publica el usuario JesseHuang922 bajo el paraguas del proyecto LazyBomb-Lab, y su objetivo es ofrecer un analizador linguístico completo (segmentación, etiquetado gramatical, morfología, dependencias y lematización) para una lengua con pocos recursos computacionales en comparación con el inglés o el castellano. El modelo se distribuye como pipeline de spaCy, no como un modelo de lenguaje generativo: no produce texto libre, sino anotaciones estructuradas sobre texto de entrada.

La relevancia del modelo reside en su rendimiento sobre el treebank UD Latvian LVTB v2.16: alcanza un 97,48 % de precisión en POS, 91,04 % en UAS, 87,53 % en LAS y 82,03 % en lematización, con una media ponderada del 90,96 %. Frente a Stanza (91,35 %) y UDPipe (51,55 %), se sitúa en la misma liga que Stanza, con mejor comportamiento en dependencias y peor en lematización. El repositorio ocupa 2,0 GB y la licencia es CC BY-SA 4.0, lo que permite uso comercial con atribución y compartir-al-igual.

Al estar basado en XLM-RoBERTa-base, hereda la arquitectura transformer encoder multilingüe, aunque el ajuste fino se ha realizado exclusivamente sobre datos en letón. No hay información publicada sobre el número exacto de parámetros del pipeline completo ni sobre el contexto máximo soportado, más allá de las limitaciones propias de XLM-RoBERTa-base (512 tokens).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-base) + componentes spaCy (tagger, morphologizer, parser, senter, lemmatizer) |
| Parametros totales | no disponible (backbone XLM-RoBERTa-base: ~278 M; pipeline completo no especificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (limitado por XLM-RoBERTa-base, típicamente 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | letón (lv) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | spaCy pipeline (incluye safetensors para el transformer; wheel `lv_roberta_base-1.0.0-py3-none-any.whl`) |

## Arquitectura y entrenamiento

El modelo es un pipeline de spaCy de tipo transformer, con XLM-RoBERTa-base como backbone. Internamente, el componente transformer se conecta al resto de componentes mediante un listener `tok2vec`. La cadena de procesamiento incluye: segmentador de frases (senter), etiquetador (tagger), morfologizador (morphologizer), parser de dependencias y lematizador. Esta combinación permite obtener, en una sola pasada, anotaciones morfológicas y sintácticas completas sobre texto en letón.

El entrenamiento se realizó sobre el Universal Dependencies Latvian LVTB v2.16, derivado del Latvian Treebank (LVTB) del Instituto de Matemáticas y Ciencias de la Computación de la Universidad de Letonia. Los splits son: 15.055 frases de entrenamiento, 2.080 de desarrollo y 2.396 de test. No se especifica en la model card el número de tokens totales, la composición exacta del dataset más allá del treebank, ni si hubo técnicas de RLHF o DPO (no aplicables a un modelo de análisis linguístico de este tipo). Tampoco se detalla la innovación técnica más allá del uso estándar de spaCy con transformer.

## Capacidades

- Segmentación de frases (senter) en texto en letón.
- Etiquetado gramatical (POS) con precisión del 97,48 % sobre el test set.
- Etiquetado de rasgos morfológicos (morphologizer) con precisión del 95,50 %.
- Análisis de dependencias sintácticas: UAS 91,04 %, LAS 87,53 %.
- Lematización con precisión del 82,03 %.
- Procesamiento por lotes y pipeline integrado en spaCy, lo que facilita el despliegue en producción.
- No soporta generación de texto, tool calling, agentes, visión ni audio.
- Capacidad multilingüe limitada al letón (aunque el backbone XLM-RoBERTa es multilingüe, el ajuste es específico para lv).

## Casos de uso

- Análisis sintáctico y morfológico de corpus en letón: el modelo permite anotar grandes volúmenes de texto con POS, morfología y dependencias, útil para investigación lingüística y construcción de treebanks.
- Extracción de información estructurada: a partir de las dependencias y lemas, se pueden identificar sujetos, objetos y relaciones en textos administrativos o periodísticos en letón.
- Preprocesamiento para sistemas de búsqueda o recuperación de información: la lematización y el etiquetado permiten normalizar consultas y documentos antes de indexar.
- Análisis de sentimiento o clasificación de textos: las representaciones del transformer y las anotaciones lingüísticas sirven como features para modelos downstream.
- Educación y aprendizaje de lenguas: el pipeline puede generar análisis gramaticales automáticos para herramientas de enseñanza del letón.
- Enriquecimiento de datos para entrenamiento de modelos más grandes: las anotaciones de este pipeline pueden usarse como pseudo-etiquetas para destilar conocimiento en modelos más pequeños.
- Procesamiento de documentos legales o administrativos en letón: la segmentación y el análisis de dependencias facilitan la extracción de cláusulas y entidades.

## Benchmarks y rendimiento

Los datos publicados en la model card comparan el modelo con Stanza y UDPipe sobre el test set del UD Latvian LVTB v2.16:

| Modelo | POS | Tag | Morph | UAS | LAS | Lemma Acc | Media (pesos iguales) |
|---|---|---|---|---|---|---|---|
| spaCy (este modelo) | 0,9748 | 0,9215 | 0,9550 | 0,9104 | 0,8753 | 0,8203 | 90,96 % |
| Stanza | 0,9688 | 0,8987 | 0,9449 | 0,8791 | 0,8354 | 0,9539 | 91,35 % |
| UDPipe | 0,9207 | 0,7960 | 0,3403 | 0,0791 | 0,0660 | 0,8911 | 51,55 % |

El modelo supera a Stanza en POS, Tag, Morph, UAS y LAS, pero queda por debajo en lematización (82,03 % frente a 95,39 %). En la media ponderada, Stanza obtiene una puntuación ligeramente superior (91,35 % frente a 90,96 %), lo que indica que la lematización es el punto débil relativo de este pipeline.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Al tratarse de XLM-RoBERTa-base (~278 M de parámetros) más componentes spaCy, se estima un uso moderado de VRAM en GPU (del orden de 2-4 GB en FP16, no confirmado por el autor).
- GPU recomendadas: el autor indica CPU para uso a pequeña escala y GPU recomendada para inferencia más rápida. No se especifican modelos concretos.
- Cabe en GPU de consumo: previsiblemente sí, en tarjetas con al menos 4-6 GB de VRAM, aunque no hay confirmación oficial.
- Opciones de despliegue: spaCy 3.8.7 o superior, con spacy-transformers 1.3.9, transformers 4.49.0, torch 2.8.0, tokenizers 0.21.4, safetensors 0.6.2 y huggingface-hub 0.34.4. También se puede instalar el wheel precompilado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | POS | UAS | LAS | Lemma Acc | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| lv_roberta_base (este) | spaCy + XLM-R | 0,9748 | 0,9104 | 0,8753 | 0,8203 | CC BY-SA 4.0 | Hugging Face |
| Stanza (lv) | Stanford NLP | 0,9688 | 0,8791 | 0,8354 | 0,9539 | no disponible en la información | Stanford NLP |
| UDPipe (lv) | UDPipe | 0,9207 | 0,0791 | 0,0660 | 0,8911 | no disponible en la información | UDPipe |

La comparativa se limita a los tres sistemas evaluados en la model card. No se dispone de información sobre otros pipelines específicos para letón en la información proporcionada.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en letón; no debe esperarse un rendimiento aceptable en otras lenguas.
- La lematización es el componente más débil (82,03 %), con una diferencia notable frente a Stanza (95,39 %), lo que puede afectar a aplicaciones que dependan fuertemente de los lemas.
- No se han publicado análisis de sesgos; al entrenarse sobre un treebank académico, puede reflejar los sesgos del corpus original (textos periodísticos, legales y literarios de Letonia).
- Riesgo de alucinación no aplica en el sentido generativo, pero sí puede producir anotaciones erróneas en dominios alejados del treebank de entrenamiento (por ejemplo, lenguaje coloquial o técnico muy específico).
- La licencia CC BY-SA 4.0 permite uso comercial, pero exige atribución y compartir-al-igual de las obras derivadas, lo que puede ser restrictivo para productos propietarios.
- El pipeline depende de versiones concretas de spaCy, transformers y torch; cambios de versión pueden romper la compatibilidad.
- No hay información sobre el contexto máximo efectivo más allá del límite de XLM-RoBERTa-base (512 tokens), lo que limita el análisis de documentos largos sin segmentación previa.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/JesseHuang922/lv_roberta_base
- Repositorio GitHub: https://github.com/LazyBomb-Lab/LV_RoBERTa_Base
- Notebook de detalles: https://github.com/LazyBomb-SIA/LV_RoBERTa_Base/blob/main/lv_roberta_base.ipynb
- Dataset UD Latvian LVTB: https://github.com/UniversalDependencies/UD_Latvian-LVTB
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- Modelo base XLM-RoBERTa: https://huggingface.co/FacebookAI/xlm-roberta-base

# Grundik/abkhaz-pos-xlmr

## Resumen

Grundik/abkhaz-pos-xlmr es un modelo de etiquetado de partes de la oración (POS tagging) para el idioma abjasio (ISO 639-1: `ab`), una lengua polisintética del noroeste del Cáucaso hablada principalmente en Abjasia. El modelo se obtiene mediante fine-tuning de XLM-RoBERTa-base, un transformer encoder multilingüe de 270M parámetros, sobre el treebank UD_Abkhaz-AbNC anotado en formato Universal Dependencies. Lo desarrolla Marat Ionov (usuario Grundik) como parte de un proyecto más amplio sobre infraestructura digital del abjasio, que incluye OCR, morfología y análisis de maquetación de prensa histórica.

El problema que resuelve es concreto: el abjasio es una lengua de bajos recursos en NLP y carece de herramientas de anotación morfosintáctica listas para producción. Este modelo cubre esa carencia con un etiquetador de POS universal entrenado sobre 1.236 frases (unos 13.500 tokens) y evaluado sobre 154 frases, alcanzando un 91,66% de precisión a nivel de token en el conjunto de desarrollo.

Su relevancia es doble: por un lado, aporta una pieza funcional a la cadena de procesamiento del abjasio; por otro, sirve como referencia metodológica para fine-tuning de XLM-RoBERTa en lenguas polisintéticas con datasets muy pequeños. La licencia MIT y el formato safetensors estándar de `transformers` facilitan su integración en pipelines existentes sin fricción legal ni técnica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-base) |
| Parametros totales | 277.463.053 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16; cuantizacion no documentada por el autor) |
| Idiomas soportados | abjasio (`ab`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de XLM-RoBERTa-base: un transformer encoder de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, con vocabulario SentencePiece entrenado sobre corpus multilingües. Sobre esta base se añade una cabeza de clasificación de tokens (`AutoModelForTokenClassification`) que predice etiquetas POS del conjunto Universal POS. El tokenizador maneja el alfabeto cirílico abjasio completo, incluyendo caracteres específicos como `ә, ҧ, ҳ, қ, ҭ, ҽ, ҿ, ӡ, џ, ҕ, ӷ, ҟ, ҵ, ҩ, ҷ, ԥ`.

El fine-tuning se realizó sobre el treebank UD_Abkhaz-AbNC, procedente de archivos de prensa abjasia digitalizados en colaboración con la Biblioteca Nacional de Abjasia. Los hiperparámetros documentados son: 10 épocas, batch size 8, learning rate 2e-5 y hardware NVIDIA RTX 5060 Ti de 16 GB. No se documenta el uso de RLHF, DPO ni técnicas de alineación adicionales; es un fine-tuning supervisado estándar de token classification. Tampoco se especifica la composición exacta del dataset más allá del número de frases de entrenamiento y evaluación.

## Capacidades

- Etiquetado de partes de la oración (POS) a nivel de token con el conjunto Universal POS (UPOS) de Universal Dependencies.
- Procesamiento de texto en alfabeto cirílico abjasio, incluyendo los caracteres específicos de la lengua.
- Manejo de secuencias de hasta 512 tokens, suficiente para frases y párrafos cortos.
- Alineación token-palabra mediante `return_offsets_mapping` y `word_ids()` del tokenizador, útil para reconstruir etiquetas a nivel de palabra.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo discriminativo de clasificación, no generativo.
- No dispone de modo thinking, visión, audio ni capacidades multimodales.
- Capacidad multilingüe limitada al abjasio en la práctica; el backbone XLM-RoBERTa es multilingüe, pero el fine-tuning se ha hecho exclusivamente sobre `ab`.

## Casos de uso

- Anotación morfosintáctica de corpus abjasios: el modelo permite etiquetar automáticamente POS en nuevos textos del Abkhaz National Corpus o en digitalizaciones de prensa, reduciendo el trabajo manual de anotadores lingüistas.
- Preprocesamiento para pipelines de NLP en abjasio: sirve como primer paso antes de tareas de parsing de dependencias, reconocimiento de entidades o análisis morfológico más profundo, ya que proporciona etiquetas UPOS consistentes con el estándar UD.
- Búsqueda y recuperación de información en corpus abjasios: las etiquetas POS permiten filtrar y ordenar resultados por categoría gramatical (por ejemplo, extraer solo sustantivos o verbos) en herramientas de consulta lingüística.
- Enriquecimiento de diccionarios y léxicos digitales: al etiquetar formas nuevas, se pueden asociar automáticamente a categorías gramaticales y facilitar la construcción de entradas lexicográficas.
- Investigación lingüística sobre el abjasio: el modelo facilita estudios cuantitativos sobre distribución de categorías gramaticales, frecuencia de clases de palabras y variación en el corpus de prensa.
- Docencia y materiales didácticos: permite generar anotaciones de ejemplo y ejercicios de análisis gramatical para enseñanza del abjasio, con revisión humana posterior.
- Integración en aplicaciones de OCR post-procesado: combinado con el pipeline de OCR del mismo autor, ayuda a validar y corregir texto reconocido mediante coherencia gramatical de las etiquetas POS.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Token accuracy | 91,66% | Dev (154 frases) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K ni comparativas con otros taggers de abjasio) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en fp32 (tamaño del repo), y del orden de 550 MB en fp16. Cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: no requiere GPU dedicada; una RTX 3060, RTX 4060, RTX 5060 Ti o superior ofrecen latencia muy baja. También funciona en CPU para volúmenes moderados.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2-4 GB de VRAM, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` con `AutoModelForTokenClassification`, `pipeline("token-classification")`, exportación a ONNX para inferencia optimizada, y servidores de inferencia compatibles con endpoints de Hugging Face (`endpoints_compatible` en los tags).
- Latencia y throughput estimados: no disponibles en la información proporcionada. Por el tamaño del modelo (277M parámetros) y la longitud máxima de 512 tokens, se espera un throughput alto en GPU moderna, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Idiomas | Licencia |
|---|---|---|---|---|---|
| Grundik/abkhaz-pos-xlmr | 277M | 512 | POS tagging | ab | MIT |
| xlm-roberta-base (base sin fine-tuning) | 270M | 512 | Masked LM (no POS) | 100 | MIT |
| Otros taggers UD para lenguas de bajos recursos | no disponible | no disponible | POS tagging | variable | variable |

No se dispone de información sobre modelos comparables específicos para POS tagging en abjasio ni sobre resultados de benchmarks que permitan una comparación cuantitativa con alternativas. La comparación con `xlm-roberta-base` es estructural: este modelo es un fine-tuning del primero para una tarea concreta, por lo que no son intercambiables sin entrenamiento adicional.

## Limitaciones y advertencias

- El dataset de entrenamiento es muy pequeño (~13.500 tokens, 1.236 frases), lo que puede degradar el rendimiento en formas verbales raras, neologismos y variantes ortográficas no vistas.
- La precisión reportada (91,66%) corresponde al conjunto de desarrollo; no se ha publicado evaluación en un conjunto de test independiente, por lo que puede existir sobreajuste al treebank UD_Abkhaz-AbNC.
- El modelo está entrenado exclusivamente sobre el dominio de prensa digitalizada; su comportamiento en otros registros (literario, oral transcrito, técnico) no está documentado.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de etiquetado erróneo en tokens ambiguos u OOV; se recomienda revisión humana en usos críticos.
- Sesgos conocidos: no documentados por el autor; al derivar de un corpus de prensa histórica, puede reflejar sesgos de ese material.
- Licencia MIT: permite uso comercial y modificación sin restricciones adicionales, pero conviene citar el treebank UD_Abkhaz-AbNC según la bibtex de la model card.
- El modelo no es generativo ni conversacional: no debe emplearse para tareas de generación de texto, resumen o diálogo.
- La longitud máxima de 512 tokens limita el procesamiento de documentos largos sin fragmentación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Grundik/abkhaz-pos-xlmr
- Modelo base XLM-RoBERTa: https://huggingface.co/xlm-roberta-base
- Treebank UD_Abkhaz-AbNC: https://github.com/UniversalDependencies/UD_Abkhaz-AbNC
- Especificación Universal POS tags: https://universaldependencies.org/u/pos/
- Proyecto Universal Dependencies: https://universaldependencies.org/

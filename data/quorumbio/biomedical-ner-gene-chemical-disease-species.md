# quorumbio/biomedical-ner-gene-chemical-disease-species

## Resumen

El modelo `quorumbio/biomedical-ner-gene-chemical-disease-species` es un sistema de reconocimiento de entidades nombradas (NER) biomédicas desarrollado por quorumbio. Se trata de un fine-tuning de `microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext` (arquitectura BERT-base) que etiqueta seis tipos de entidad en una sola pasada: gen/proteína, compuesto químico, enfermedad (incluyendo rasgos fenotípicos según BioRED), especie, variante de secuencia y línea celular. Con 108,9 millones de parámetros, es un modelo encoder-only pensado para extracción de información sobre literatura científica en inglés.

Su relevancia radica en la unificación de seis tipos de entidad que normalmente requieren modelos separados por corpus. El autor aborda el problema de las anotaciones parciales (cada corpus etiqueta solo un subconjunto de tipos) mediante una función de pérdida de etiqueta parcial (partial-label loss), en lugar de tratar cada `O` como "no entidad" absoluto. El resultado es un tagger estándar de token-classification compatible con la pipeline de `transformers`, con pesos en safetensors y exportaciones ONNX (fp32 e int8) que permiten inferencia en navegador vía transformers.js.

La licencia Apache-2.0 y el reducido tamaño del modelo lo hacen adecuado para despliegues en CPU y entornos con recursos limitados, así como para integrarse en pipelines de minería de literatura biomédica a escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base (encoder-only, transformer bidireccional) |
| Parametros totales | 108.901.645 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (BERT-base, típicamente 512 tokens; no confirmado en la información) |
| Tipos de cuantizacion | ONNX fp32 y ONNX dynamic int8 (int8 ejecutable en navegador con transformers.js) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (fp32 435,9 MB; int8 109,7 MB) |

## Arquitectura y entrenamiento

El modelo parte de BiomedBERT-base-uncased-abstract-fulltext, un BERT-base preentrenado sobre abstracts y texto completo de PubMed. Sobre esa base se realiza un fine-tuning de token-classification con 13 etiquetas: `O` más `B-`/`I-` para cada uno de los seis tipos (Gene, Chemical, Disease, Species, Variant, CellLine). La innovación técnica destacable es el uso de una pérdida de etiqueta parcial: en los corpus que no anotan un tipo concreto, una palabra etiquetada como `O` se interpreta como "ninguna de las entidades de este corpus", sumando la probabilidad de `O` y de todas las etiquetas de los tipos no anotados por ese corpus. Las palabras con etiqueta real deben recibir exactamente esa etiqueta.

El entrenamiento combina cuatro corpus públicos: BC5CDR (Chemical, Disease), NCBI-disease (Disease), NLM-Gene (Gene) y BioRED (los seis tipos). El autor compara esta pérdida parcial con el objetivo plano (todo `O` es `O`) con los mismos datos y ajustes: la selección se hizo sobre validación (F1 medio de entidad: 0,894 con pérdida parcial frente a 0,869 con objetivo plano). La diferencia principal aparece en BioRED, el único corpus con los seis tipos, donde el objetivo plano pierde sobre todo recall. El checkpoint liberado corresponde a la época 5.

## Capacidades

- Reconocimiento de entidades nombradas biomédicas en una sola pasada para seis tipos: Gene (genes y productos génicos), Chemical, Disease (incluye rasgos fenotípicos), Species, Variant (variantes de secuencia) y CellLine.
- Etiquetado a nivel de token con esquema BIO y agregación de entidades mediante `aggregation_strategy="simple"` en la pipeline de `transformers`.
- Procesamiento de texto biomédico en inglés (abstracts y literatura científica).
- Inferencia en navegador mediante transformers.js con el modelo ONNX int8.
- Exportación ONNX con entradas `input_ids`, `attention_mask`, `token_type_ids` y salida `logits`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo discriminativo de clasificación de tokens.

## Casos de uso

- Minería de literatura biomédica a escala: procesar abstracts de PubMed para extraer genes, enfermedades, fármacos y especies en una sola pasada, alimentando bases de datos de conocimiento o índices de búsqueda semántica. El tamaño reducido del modelo (109 M parámetros, ONNX int8 de 109,7 MB) permite procesar grandes volúmenes en CPU.
- Construcción de grafos de conocimiento biomédicos: extraer menciones de entidades y sus tipos para posteriormente resolver relaciones (gen-enfermedad, fármaco-diana) en pipelines de extracción de información.
- Anotación asistida de corpus: preetiquetar textos biomédicos para que anotadores humanos revisen y corrijan, reduciendo el coste de creación de datasets NER con seis tipos de entidad.
- Vigilancia farmacovigilante: detectar menciones de fármacos (Chemical) y eventos adversos o enfermedades (Disease) en informes y literatura para sistemas de señalización temprana.
- Enriquecimiento de bases de datos de variantes: identificar Variant, Gene y CellLine en publicaciones para vincular variantes de secuencia con genes y líneas celulares en repositorios como ClinVar o COSMIC.
- Búsqueda biomédica en navegador: desplegar el modelo ONNX int8 con transformers.js en una aplicación web para resaltar entidades en tiempo real mientras el usuario lee un artículo, sin backend ni GPU.
- Normalización de entidades en pipelines clínicos: como primer paso de un sistema que detecta menciones de enfermedades y especies (por ejemplo, modelos animales en estudios preclínicos) antes de mapearlas a ontologías como MeSH o MONDO.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados), F1 de entidad con seqeval, tokenización propia por palabras y solo los tipos anotados por cada corpus; el propio autor advierte que no son comparables con cifras publicadas.

| Test set | Tipos evaluados | Precisión | Recall | F1 | Intervalo F1 95 % |
|---|---|---|---|---|---|
| BC5CDR (500 abstracts) | Chemical, Disease | 0,872 | 0,905 | 0,888 | 0,879–0,898 |
| NCBI-disease (100 abstracts) | Disease | 0,846 | 0,884 | 0,865 | 0,840–0,888 |
| NLM-Gene (100 abstracts) | Gene | 0,930 | 0,935 | 0,933 | 0,920–0,944 |
| BioRED | Chemical, Disease, Gene, Species, Variant, CellLine | 0,892 | 0,905 | 0,898 | no disponible |

Comparación interna con el objetivo plano (mismos datos y ajustes), F1 en test:

| Test set | Pérdida parcial (liberado) | Objetivo plano |
|---|---|---|
| BC5CDR | 0,889 | 0,883 |
| NCBI-disease | 0,867 | 0,883 |
| NLM-Gene | 0,933 | 0,922 |
| BioRED | 0,898 | 0,799 |

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (modelo de 109 M parámetros, ~436 MB de pesos ONNX fp32) y en torno a 150–250 MB en int8, más memoria para activaciones y batch.
- Cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU para lotes pequeños.
- GPU recomendadas: no requiere GPU dedicada; para alto throughput se puede usar cualquier GPU moderna (A100, H100, RTX 4090) con batching.
- Despliegue: `transformers` (pipeline de token-classification), ONNX Runtime, transformers.js en navegador. No se mencionan integraciones específicas con vLLM, TGI o llama.cpp (no aplicables a un encoder-only de este tamaño).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipos de entidad | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| quorumbio/biomedical-ner-gene-chemical-disease-species | 108,9 M | 6 (Gene, Chemical, Disease, Species, Variant, CellLine) | no disponible | Apache-2.0 | Hugging Face, ONNX, transformers.js |
| quorumbio/biomedical-ner-chemical-disease | no disponible | 2 (Chemical, Disease) | no disponible | no disponible | Hugging Face |
| BiomedBERT-base (modelo base) | ~110 M | no aplica (preentrenado, sin NER) | no disponible | no disponible | Hugging Face |

El autor indica que, en la misma pipeline, este modelo obtiene resultados similares en BC5CDR y algo inferiores en NCBI-disease respecto a su compañero `biomedical-ner-chemical-disease`, a cambio de añadir cuatro tipos de entidad. No se dispone de comparaciones con otros modelos NER biomédicos en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no se ha validado para otros idiomas.
- Modelo discriminativo: no genera texto ni razona; únicamente etiqueta tokens.
- Los resultados de benchmarks son declarados por el autor, no verificados, y usan tokenización propia por palabras y evaluación restringida a los tipos de cada corpus, por lo que no son comparables con cifras publicadas de la literatura.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos y negativos en la detección de entidades; el rendimiento depende del dominio y del estilo del texto (abstracts frente a texto completo, notas clínicas, etc.).
- La pérdida de etiqueta parcial puede introducir confusión entre tipos solapados (por ejemplo, Disease y rasgos fenotípicos) en corpus con anotaciones heterogéneas.
- El modelo se seleccionó en la época 5 sobre validación; no se documentan análisis de robustez ante dominios fuera de distribución.
- Licencia Apache-2.0: permite uso comercial, pero se recomienda validar el modelo sobre datos propios antes de producción.
- No se especifica la longitud máxima de contexto efectiva en la información disponible; BERT-base suele limitarse a 512 tokens, lo que obliga a dividir documentos largos en frases o fragmentos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/quorumbio/biomedical-ner-gene-chemical-disease-species
- Modelo compañero (Chemical y Disease): https://huggingface.co/quorumbio/biomedical-ner-chemical-disease
- Modelo base: https://huggingface.co/microsoft/BiomedNLP-BiomedBERT-base-uncased-abstract-fulltext
- Dataset BC5CDR: https://huggingface.co/datasets/bigbio/bc5cdr
- Dataset NCBI-disease: https://huggingface.co/datasets/ncbi/ncbi_disease
- Dataset NLM-Gene: https://huggingface.co/datasets/bigbio/nlm_gene
- Dataset BioRED: https://huggingface.co/datasets/bigbio/biored

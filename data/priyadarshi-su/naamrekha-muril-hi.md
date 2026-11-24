# priyadarshi-su/naamrekha-muril-hi

## Resumen

NaamRekha MuRIL (Hindi NER) es un modelo de reconocimiento de entidades nombradas (NER) para hindi, desarrollado por priyadarshi-su dentro del proyecto NaamRekha. Se trata de un fine-tuning de `google/muril-base-cased`, un transformer encoder BERT-like preentrenado específicamente para lenguas indias, sobre 300.000 frases en hindi del corpus Naamapadam. El modelo etiqueta tres tipos de entidad: persona (PER), organización (ORG) y localización (LOC), con etiquetado IOB2.

El modelo resuelve el problema de la extracción de entidades en hindi con un coste computacional bajo (236,9 millones de parámetros, 1,2 GB de repositorio) y, de forma destacable, generaliza en modo zero-shot a marati y bengalí pese a haberse entrenado solo con hindi. En marati supera ligeramente a un MuRIL entrenado específicamente en ese idioma (0,8298 frente a 0,8163 de F1 medio en tres semillas), lo que lo convierte en una opción interesante para pipelines multilingües de NER en lenguas indias con recursos limitados.

Su relevancia actual radica en que ofrece una alternativa ligera y de licencia Apache 2.0 frente a modelos generativos grandes para tareas de extracción de entidades, con un F1 de 0,8274 en hindi que supera a una línea base BiLSTM-CRF (0,8038), a IndicBERT sin ajustar (0,7839) y al prompting few-shot de Qwen2.5-7B (0,6643).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder BERT-like (MuRIL base, `AutoModelForTokenClassification`) |
| Parámetros totales | 236.971.015 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens de subword (longitud máxima de entrenamiento) |
| Tipos de cuantización | no disponible (el repo incluye safetensors y ONNX) |
| Idiomas soportados | hi (entrenamiento), mr y bn (zero-shot) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo parte de `google/muril-base-cased`, un transformer encoder de tipo BERT preentrenado por Google sobre texto multilingüe de lenguas indias. Sobre esa base se aplica una cabeza de clasificación de tokens (`AutoModelForTokenClassification`) con siete etiquetas IOB2: `O`, `B-PER`, `I-PER`, `B-ORG`, `I-ORG`, `B-LOC`, `I-LOC`. El ajuste se realizó con un subconjunto sembrado de 300.000 frases del split de entrenamiento *silver* de Naamapadam en hindi, cuyas etiquetas fueron proyectadas desde NER en inglés; la selección de modelo y tamaño se hizo sobre validación silver y el test gold se reservó únicamente para reportar resultados.

Los hiperparámetros del entrenamiento fueron: learning rate 2e-5, batch size 32, 3 épocas, warmup lineal sobre el 10 % inicial de los pasos, `max_length=128`, precisión fp16, una única GPU T4 y semilla 42. La alineación de etiquetas asigna la etiqueta de cada palabra a su primer subword, mientras que los subwords restantes reciben `-100` para no contribuir a la pérdida. El software empleado fue torch 2.11.0 y transformers 5.22.1. Los pesos de este checkpoint son idénticos a los de `priyadarshi-su/naamrekha-muril_hi_n300000_e3_lr2e-05_s42_bfd254ed` en la revisión `de52046`.

## Capacidades

- Reconocimiento de entidades nombradas en hindi con tres tipos: persona (PER), organización (ORG) y localización (LOC).
- Etiquetado a nivel de token con esquema IOB2, con agregación recomendada mediante `aggregation_strategy="first"`.
- Generalización zero-shot a marati y bengalí sin entrenamiento específico en esos idiomas.
- Inferencia ligera y rápida: 236,9 millones de parámetros, viable en CPU y GPU de gama baja.
- Integración directa con el pipeline `token-classification` de transformers.
- Exportación a ONNX para despliegue optimizado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es un modelo discriminativo de clasificación de tokens.

## Casos de uso

- Extracción de entidades en noticias en hindi: el modelo identifica personas, organizaciones y lugares en titulares y cuerpos de noticia, adecuado porque Naamapadam proviene mayoritariamente de texto tipo periodístico y el modelo rinde mejor en ese dominio.
- Enriquecimiento de bases de datos periodísticas o de archivo: se procesan frases de hasta 128 subwords para poblar índices de entidades y facilitar búsquedas por persona u organización.
- Pipelines multilingües de NER en lenguas indias: al generalizar zero-shot a marati y bengalí, permite cubrir tres idiomas con un solo modelo y un único despliegue, reduciendo coste operativo.
- Preprocesado para sistemas de búsqueda o recomendación de contenido en hindi: la detección de entidades permite construir filtros y facetas sobre documentos.
- Anonimización o seudonimización de textos: la detección de PER y LOC facilita el enmascarado de datos personales en corpus en hindi antes de su publicación o compartición.
- Moderación y análisis de contenido en redes o foros en hindi: identificación de organizaciones y personas mencionadas para clasificación temática o alertas, con la advertencia de que el rendimiento baja en texto informal.
- Extracción de entidades en documentos administrativos o legales en hindi: localización de organismos y lugares citados para indexación documental, siempre segmentando previamente el texto en frases.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) de F1 de entidad micro con `seqeval` sobre los test gold de Naamapadam. El entrenamiento usó solo hindi.

| Idioma de test | PER | ORG | LOC | Global (este modelo) | Media 3 semillas | MuRIL in-language, media 3 semillas |
|---|---|---|---|---|---|---|
| Hindi | 0,8879 | 0,7444 | 0,8224 | **0,8274** | 0,8230 | (mismo) |
| Marati (zero-shot) | 0,8974 | 0,6866 | 0,8457 | **0,8298** | 0,8332 | 0,8163 |
| Bengalí (zero-shot) | 0,8506 | 0,6963 | 0,7906 | **0,7982** | 0,8037 | 0,8132 |

Comparaciones adicionales reportadas en hindi: BiLSTM-CRF 0,8038, IndicBERT sin ajustar 0,7839 y prompting few-shot de Qwen2.5-7B 0,6643. Este checkpoint corresponde a la semilla 42.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: en torno a 0,5 GB para pesos (236,9 M de parámetros); con activaciones y overhead de framework, menos de 2 GB en la práctica.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, RTX 4090, GTX 1660, entre otras; también funciona en CPU para volúmenes moderados.
- GPU recomendadas para alto throughput: T4 (la usada en entrenamiento), A10, L4, A100 o H100 para procesamiento por lotes a gran escala.
- Opciones de despliegue: pipeline `token-classification` de transformers, ONNX Runtime (el repo incluye pesos ONNX), y servidores de inferencia compatibles con modelos de clasificación de tokens (por ejemplo, Text Embeddings Inference no aplica; sí frameworks genéricos como FastAPI + transformers u ONNX Runtime).
- Latencia y throughput: no disponibles de forma oficial; por el tamaño del modelo se espera latencia de milisegundos por frase en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 hindi (Naamapadam gold) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NaamRekha MuRIL (este) | 236,9 M | 128 tokens | 0,8274 | Apache 2.0 | Hugging Face |
| MuRIL in-language (marati) | ~236 M (base) | 128 tokens | no aplica (evaluado en marati: 0,8163) | Apache 2.0 (base) | Hugging Face |
| BiLSTM-CRF (línea base del proyecto) | no disponible | no disponible | 0,8038 | no disponible | no disponible |
| IndicBERT sin ajustar | no disponible | no disponible | 0,7839 | no disponible | Hugging Face |
| Qwen2.5-7B (few-shot prompting) | 7 B | no disponible | 0,6643 | no disponible | Hugging Face |

## Limitaciones y advertencias

- Las etiquetas de entrenamiento son *silver*, proyectadas desde inglés, por lo que son ruidosas; los resultados se reportan sobre test gold.
- ORG es el tipo de entidad más débil en todos los idiomas y la principal fuente de errores.
- Solo cubre tres tipos de entidad: no detecta fechas, números ni otras categorías.
- Entrenado con frases de hasta 128 tokens de subword; el texto largo debe segmentarse en frases antes de la inferencia.
- El dominio de Naamapadam es un corpus paralelo de estilo periodístico; se espera menor precisión en redes sociales, texto con cambio de código (code-mixed) o romanizado.
- El rendimiento zero-shot en bengalí queda unos 0,01 F1 por debajo de un modelo entrenado en ese idioma; conviene usar un modelo in-language cuando exista.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de falsos positivos y negativos en la detección de entidades, especialmente en ORG.
- Licencia Apache 2.0 permite uso comercial, pero deben citarse el dataset Naamapadam y el modelo base MuRIL según indica el autor.
- No se han publicado evaluaciones de sesgo; al derivar de MuRIL y de un corpus periodístico, puede heredar sesgos de representación de personas y organizaciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/priyadarshi-su/naamrekha-muril-hi
- Checkpoint original citado: https://huggingface.co/priyadarshi-su/naamrekha-muril_hi_n300000_e3_lr2e-05_s42_bfd254ed
- Modelo base MuRIL: https://huggingface.co/google/muril-base-cased
- Dataset Naamapadam: https://huggingface.co/datasets/ai4bharat/naamapadam
- Código del proyecto: https://github.com/iPriyadarshi/NaamRekha
- Resultados del proyecto: https://github.com/iPriyadarshi/NaamRekha/blob/main/results/results.csv
- Sitio web del proyecto: https://ipriyadarshi.github.io/NaamRekha/
- Informe del proyecto: https://ipriyadarshi.github.io/NaamRekha/docs/phase6/report/
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/priyadarshi-su/naamrekha-ner
- Paper Naamapadam (ACL 2023): Mhaske et al., *Naamapadam: A Large-Scale Named Entity Annotated Data for Indic Languages*
- Paper MuRIL: Khanuja et al., *MuRIL: Multilingual Representations for Indian Languages*, 2021

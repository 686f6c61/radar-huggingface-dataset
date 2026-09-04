# AlfredJames/jobbert-zh

## Resumen

JobBERT-zh es un modelo de encoder de dominio laboral chino con una cabeza CRF para la extracción de competencias (span extraction) a partir de anuncios de empleo en chino. Desarrollado por AlfredJames, sigue el enfoque de adaptación de dominio de JobBERT/DaJobBERT de Zhang et al., utilizando como backbone un Chinese RoBERTa-wwm (hfl/chinese-roberta-wwm-ext). El modelo tiene 101.677.056 parámetros y una arquitectura BERT con 12 capas, tamaño oculto de 768 y vocabulario de 21.128 tokens. Su licencia es "other" y está diseñado para el idioma chino.

El modelo resuelve el problema de la extracción de competencias en el dominio laboral chino, una tarea de etiquetado secuencial que identifica spans de habilidades, conocimientos y herramientas en ofertas de empleo. Es relevante porque proporciona un baseline reproducible para el corpus Chinese-SkillSpan (LSKT), un recurso emergente para el análisis del mercado laboral chino. Su enfoque de dos etapas (preentrenamiento MLM adaptativo de dominio y fine-tuning con CRF) es una innovación metodológica que puede transferirse a otros dominios.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder) + linear-chain CRF |
| Parametros totales | 101.677.056 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | zh (chino) |
| Licencia | other |
| Formato de pesos | safetensors (encoder) y crf/best.pt (CRF) |

## Arquitectura y entrenamiento

El modelo usa un encoder BERT de 12 capas con tamaño oculto de 768 y vocabulario de 21.128 tokens, basado en hfl/chinese-roberta-wwm-ext. Sobre el encoder se añade una cabeza de emisiones lineales y un CRF lineal (torchcrf, batch_first=True) con 9 etiquetas BIO: O, B-L, I-L, B-K, I-K, B-S, I-S, B-T, I-T. El tokenizer se usa con is_split_into_words=True sobre tokens de carácter, y la receta de fine-tuning por defecto incluye seed 42, 6 épocas, patience 2, batch size 16, max length 256 y learning rate 2e-5.

El entrenamiento tiene dos etapas. Primero, un preentrenamiento de MLM adaptativo al dominio con 3 millones de anuncios de empleo chinos (paso 65000), cuyos datos no se publican. Segundo, el fine-tuning de la cabeza CRF sobre el corpus V4 silver LSKT (train_lskt_v4_silver.jsonl / dev_lskt_v4_silver.jsonl), que no es oro humano (Doccano Gold) sino anotaciones híbridas derivadas. No se ha aplicado RLHF ni DPO. La licencia del repositorio es "other" hasta que se confirmen los derechos de redistribución de los anuncios de empleo, aunque el backbone original sea Apache-2.0.

## Capacidades

- Extracción de spans de competencias tipadas en chino, con etiquetas BIO para cuatro tipos de entidades (L, K, S, T).
- No es un modelo generativo: no genera texto ni responde preguntas.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No es multilingüe: solo chino (zh).
- Requiere un post-procesamiento con jieba (segmentación de palabras) para reproducir las puntuaciones publicadas.
- El modelo no está exportado como AutoModelForTokenClassification, por lo que no se puede usar directamente con el pipeline de token-classification de Hugging Face.

## Casos de uso

- Investigación en extracción de competencias chinas: el modelo sirve como baseline reproducible para el corpus Chinese-SkillSpan (LSKT), permitiendo comparar sistemas de extracción de skills con métricas oficiales (F1 exact 0.4331 tras alineación jieba).
- Análisis agregado del mercado laboral: procesar anuncios de empleo chinos para extraer las competencias más demandadas, con fines de estudios estadísticos de tendencias y siempre con revisión humana.
- Construcción de ontologías de competencias: los spans extraídos pueden utilizarse para alimentar taxonomías de habilidades en chino, facilitando la creación de recursos lingüísticos.
- Fine-tuning para sectores específicos: el encoder JobBERT-zh puede adaptarse con datos propios a dominios concretos (por ejemplo, tecnología o manufactura) ajustando la cabeza CRF.
- Reproducción de resultados académicos: los pesos y scripts permiten verificar las métricas publicadas, lo que es útil para validar metodologías de adaptación de dominio.
- Evaluación comparativa de modelos de etiquetado secuencial: puede usarse como referencia para evaluar otros modelos de NER en el dominio laboral chino, siempre que se respete el alineamiento oficial.

## Benchmarks y rendimiento

| Sistema | Typed exact F1 | Typed relaxed F1 |
|---|---|---|
| JobBERT-zh 3M + V4 CRF (este repo) | 0.433118 | 0.587322 |
| JobBERT-zh 1M + V4 CRF (no este dump) | 0.427162 | 0.595170 |

El gold de evaluación es V4 híbrido (derivado, no Doccano Gold). Sin la alineación con jieba, el F1 exact cae a 0.2552 en el dump 3M congelado. No se deben comparar estas cifras con el Gold v2 ChatGPT 0.6365 en una sola frase.

## Requisitos de hardware

- No hay datos oficiales publicados sobre hardware de entrenamiento ni inferencia; la model card lo deja como TODO.
- Por el tamaño de 101.677.056 parámetros, en FP32 los pesos ocupan aproximadamente 406 MB, lo que permite la inferencia en GPUs de consumo con al menos 4 GB de VRAM, incluyendo las activaciones para secuencias cortas.
- No hay soporte para cuantización documentado, por lo que no se puede especificar VRAM para versiones cuantizadas.
- El despliegue requiere un script personalizado con AutoModel y torchcrf, cargando manualmente el checkpoint crf/best.pt. No está soportado en vLLM, llama.cpp, Ollama ni TGI, y el widget de token-classification de Hugging Face no funciona.

## Comparativa con modelos similares

| Modelo | Idioma | Propósito | Parámetros | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JobBERT-zh (este) | zh | Extracción de spans de competencias (LSKT) | 101.677.056 | other | HuggingFace |
| jjzha/jobbert-base-cased | en | JobBERT inglés (no especificado) | no disponible | no disponible | HuggingFace |
| TechWolf/JobBERT-v3 | en | Embeddings de títulos de empleo | no disponible | no disponible | HuggingFace |
| hfl/chinese-roberta-wwm-ext | zh | Modelo de lenguaje general chino (backbone) | no disponible | Apache-2.0 (según metadata) | HuggingFace |

jjzha/jobbert-base-cased y TechWolf/JobBERT-v3 son modelos ingleses de la misma familia JobBERT, pero no equivalentes en tarea ni idioma. hfl/chinese-roberta-wwm-ext es el backbone sin adaptación de dominio ni CRF.

## Limitaciones y advertencias

- Las etiquetas CRF provienen de datos V4 silver, no completamente adjudicados por humanos. Esto puede introducir ruido en las anotaciones y afectar al rendimiento en producción.
- La alineación con jieba es un paso crítico: sin ella, el F1 exact-match cae de 0.4331 a 0.2552. Cualquier reproducción debe incluir este post-procesamiento.
- El gold de evaluación es V4 híbrido (derivado), no Doccano Gold. No se deben comparar directamente las métricas con el Gold v2 ChatGPT (0.6365).
- La licencia es "other" hasta que se confirmen los derechos de redistribución de los anuncios de empleo. Esto puede restringir el uso comercial.
- No está permitido usar el modelo para screening de candidatos, automatización de contratación, perfilado de individuos ni inferencia de atributos protegidos.
- El modelo no predice conceptos ESCO; solo emite spans LSKT.
- No soporta NER anidado ni solapado.
- El widget de token-classification de Hugging Face y los Inference Providers no funcionan correctamente con este modelo, ya que no hay exportación AutoModelForTokenClassification.
- Solo soporta chino (zh) y no es generativo.
- El hardware utilizado para el benchmark no está documentado (TODO en la model card).

## Enlaces

- Modelo: https://huggingface.co/AlfredJames/jobbert-zh
- Backbone: https://huggingface.co/hfl/chinese-roberta-wwm-ext
- JobBERT inglés: https://huggingface.co/jjzha/jobbert-base-cased
- TechWolf JobBERT-v3: https://huggingface.co/TechWolf/JobBERT-v3
- TechWolf JobBERT-v2: https://huggingface.co/TechWolf/JobBERT-v2

No se han encontrado papers, blogs o demos adicionales en la búsqueda web; los resultados obtenidos (Bing quizzes) no son relevantes.

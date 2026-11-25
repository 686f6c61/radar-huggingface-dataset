# priyadarshi-su/naamrekha-muril_bn_n300000_e3_lr2e-05_s42_46e8e677

## Resumen

NaamRekha MuRIL (Bengali NER, in-language baseline) es un modelo de reconocimiento de entidades nombradas (NER) para bengalí, obtenido mediante fine-tuning de google/muril-base-cased sobre 300.000 frases en bengalí del corpus Naamapadam de AI4Bharat. Lo desarrolla el usuario priyadarshi-su como parte del estudio de transferencia NaamRekha, en el que se compara un modelo entrenado en el idioma objetivo con un modelo entrenado en hindi y aplicado en zero-shot al bengalí.

El modelo etiqueta tres tipos de entidad —persona (PER), organización (ORG) y localización (LOC)— en formato IOB2 y se distribuye bajo licencia Apache 2.0. Con 236.971.015 parámetros, es un encoder BERT-base multilingüe de tamaño contenido que puede ejecutarse en CPU o en GPUs de consumo, lo que lo hace práctico para pipelines de extracción de entidades a gran escala en bengalí.

Su relevancia radica en que establece una línea base en el idioma nativo: según la model card, supera al modelo entrenado en hindi aplicado en zero-shot (F1 de entidad 0,8132 frente a 0,8037 en media de 3 semillas), por lo que el autor recomienda este checkpoint para bengalí. Es un modelo de nicho, con 74 descargas y sin likes en el momento de la consulta, orientado a investigación y a tareas de NLP en lenguas índicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (google/muril-base-cased) |
| Parametros totales | 236.971.015 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; el entrenamiento usó max_length=128 |
| Tipos de cuantizacion | no disponible; el repo incluye pesos safetensors y ONNX |
| Idiomas soportados | bengalí (bn) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |
| Tarea | token-classification (NER, etiquetas IOB2: PER, ORG, LOC) |
| Dataset de entrenamiento | ai4bharat/naamapadam (300.000 frases en bengalí) |
| Modelo base | google/muril-base-cased |
| Tamano del repo | 3,1 GB |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia BERT, derivado de google/muril-base-cased, un modelo multilingüe preentrenado específicamente para lenguas índicas. Sobre esa base se añade una cabeza de clasificación de tokens para etiquetado NER con esquema IOB2 y tres categorías: PER, ORG y LOC.

El fine-tuning se realizó sobre 300.000 frases en bengalí del dataset ai4bharat/naamapadam, con los siguientes hiperparámetros declarados en la model card: learning rate 2e-5, batch size 32, 3 épocas, max_length=128 y semilla 42. No se documentan en la información disponible detalles sobre composición exacta del dataset, técnicas de regularización, RLHF/DPO ni innovaciones arquitectónicas adicionales; se trata de un fine-tuning estándar de clasificación de tokens. El estudio NaamRekha del que forma parte evalúa la transferencia entre idiomas, comparando este modelo in-language con un equivalente entrenado en hindi.

## Capacidades

- Reconocimiento de entidades nombradas en bengalí con tres tipos: persona (PER), organización (ORG) y localización (LOC).
- Etiquetado a nivel de token con esquema IOB2 y agregación de entidades mediante `aggregation_strategy="first"` en el pipeline de transformers.
- Procesamiento de texto en escritura bengalí, incluyendo frases con nombres propios, topónimos y nombres de instituciones.
- Integración directa con la librería transformers mediante `pipeline("token-classification", ...)`.
- Exportación a ONNX para inferencia optimizada.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni modo thinking; es un modelo exclusivamente discriminativo para etiquetado de tokens.

## Casos de uso

- Extracción de entidades en noticias bengalíes: el modelo identifica personas, organizaciones y lugares en artículos de prensa para alimentar índices de búsqueda o sistemas de recomendación de contenido, aprovechando su entrenamiento sobre 300.000 frases del dominio periodístico de Naamapadam.
- Anonimización de datos personales: en pipelines de cumplimiento de privacidad, el modelo detecta entidades PER en textos bengalíes para enmascararlas antes de almacenar o compartir documentos, gracias a su etiqueta específica de persona.
- Construcción de grafos de conocimiento: la extracción de PER, ORG y LOC permite poblar bases de datos de entidades y relaciones a partir de corpus bengalíes, con un F1 de entidad de 0,8136 en el conjunto de test gold.
- Enriquecimiento de motores de búsqueda en bengalí: indexar entidades detectadas en documentos permite búsquedas facetadas por organización o localización, con un coste de inferencia bajo al ser un modelo de 237 millones de parámetros.
- Procesamiento de documentos administrativos y legales: identificación de instituciones y localidades en expedientes en bengalí para clasificación y enrutamiento documental, usando el modelo como componente de un pipeline de NLP.
- Investigación en transferencia entre lenguas índicas: servir como línea base in-language en experimentos de cross-lingual transfer, comparándolo con el modelo entrenado en hindi del mismo proyecto.
- Despliegue en entornos con recursos limitados: al caber en CPU y en GPUs de consumo, puede ejecutarse en servicios edge o en lotes nocturnos sobre grandes volúmenes de texto sin infraestructura dedicada.

## Benchmarks y rendimiento

Resultados declarados en la model card sobre el conjunto de test gold en bengalí:

| Metrica | Valor |
|---|---|
| F1 de entidad (semilla 42) | 0,8136 |
| F1 PER | 0,8621 |
| F1 ORG | 0,7233 |
| F1 LOC | 0,8018 |
| F1 de entidad (media 3 semillas) | 0,8132 |
| F1 de entidad del modelo hindi en zero-shot (media 3 semillas) | 0,8037 |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a un modelo de clasificación de tokens.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,9 GB solo para pesos (237 M de parámetros), más activaciones y overhead del runtime; en la práctica, menos de 2 GB.
- VRAM estimada en fp16: alrededor de 0,5 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; funciona bien en RTX 3060, RTX 4090, A100 y H100, aunque el modelo es lo bastante pequeño como para no necesitar GPUs de datacenter.
- Cabe en GPU de consumo: sí, en cualquier GPU moderna con 4 GB o más; también es viable en CPU para inferencia por lotes.
- Opciones de despliegue: transformers con pipeline de token-classification, ONNX Runtime (el repo incluye pesos ONNX), y servidores compatibles con endpoints de Hugging Face (tag endpoints_compatible). No se documenta soporte específico para vLLM, TGI o llama.cpp, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 entidad (bn) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NaamRekha MuRIL bn (este modelo) | 236.971.015 | no disponible (entrenado con max_length=128) | 0,8136 (1 semilla) / 0,8132 (3 semillas) | Apache 2.0 | Hugging Face, ONNX |
| priyadarshi-su/naamrekha-muril-hi | no disponible | no disponible | 0,8037 (zero-shot en bn, 3 semillas) | no disponible | Hugging Face |
| google/muril-base-cased | no disponible | no disponible | no disponible (modelo base sin fine-tuning NER) | no disponible | Hugging Face |

No se dispone en la información proporcionada de datos sobre otros modelos NER para bengalí (por ejemplo, variantes de IndicBERT o XLM-R fine-tuned) que permitan una comparación cuantitativa adicional.

## Limitaciones y advertencias

- Solo cubre bengalí; no se ha evaluado su comportamiento en otras lenguas índicas pese a que el modelo base es multilingüe.
- El conjunto de etiquetas es reducido (PER, ORG, LOC); no detecta otras categorías habituales como MISC, fechas, cantidades o cargos.
- El rendimiento en ORG es notablemente inferior al de PER (0,7233 frente a 0,8621), lo que sugiere mayor dificultad para delimitar nombres de organizaciones.
- Entrenado con max_length=128; textos más largos requieren truncado o segmentación, con posible pérdida de entidades en los bordes.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de falsos positivos y negativos en la delimitación de entidades, especialmente en dominios distintos al de Naamapadam.
- No se documentan análisis de sesgos; al derivar de un corpus periodístico, puede reflejar los sesgos de cobertura de dicho corpus.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base google/muril-base-cased y del dataset Naamapadam.
- Modelo de nicho con 74 descargas y sin validación independiente conocida; los resultados reportados proceden de la propia model card del autor.
- No dispone de soporte documentado para tool calling, agentes ni generación, por lo que no debe emplearse fuera de tareas de etiquetado de tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/priyadarshi-su/naamrekha-muril_bn_n300000_e3_lr2e-05_s42_46e8e677
- Modelo base: https://huggingface.co/google/muril-base-cased
- Modelo hindi del mismo proyecto: https://huggingface.co/priyadarshi-su/naamrekha-muril-hi
- Dataset Naamapadam: https://huggingface.co/datasets/ai4bharat/naamapadam
- Repositorio de código del proyecto: https://github.com/iPriyadarshi/NaamRekha
- Sitio web del proyecto: https://ipriyadarshi.github.io/NaamRekha/
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/priyadarshi-su/naamrekha-ner

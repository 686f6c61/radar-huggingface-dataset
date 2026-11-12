# josephimperial/hiligayner-xlmr-large

## Resumen

HiligayNER XLM-RoBERTa Large es un modelo de reconocimiento de entidades nombradas (NER) especializado en hiligaynon, una lengua bisaya hablada principalmente en las islas Visayas occidentales de Filipinas. Lo desarrolla josephimperial como fine-tuning del modelo multilingüe FacebookAI/xlm-roberta-large, y resuelve la tarea de identificar personas (PER), localizaciones (LOC) y organizaciones (ORG) en texto en hiligaynon, un idioma con escasos recursos lingüísticos y prácticamente ausente de los corpus NER convencionales.

El modelo se entrena sobre el corpus HILIGAYNER publicado por Teves et al. (2025) y presentado en PACLIC 39, que constituye una de las primeras bases anotadas de NER para este idioma. Con 558.848.007 parámetros, arquitectura transformer encoder-only y una longitud máxima de secuencia de 128 tokens durante el entrenamiento, está pensado para procesar oraciones o fragmentos cortos, no documentos largos.

Su relevancia actual radica en que cubre una laguna clara: la mayoría de modelos NER multilingües rinden de forma deficiente en lenguas filipinas de bajos recursos. Este modelo reporta un F1 macro de 0,8652 sobre las seis etiquetas BIO y un F1 estricto de span de 0,8451 en el conjunto de test, lo que lo convierte en una referencia útil para tareas de extracción de información en hiligaynon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (XLM-RoBERTa large) |
| Parametros totales | 558.848.007 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (longitud maxima de secuencia en entrenamiento, incluyendo tokens especiales); contexto nativo del modelo base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hiligaynon (hil) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 2,3 GB) |

## Arquitectura y entrenamiento

El modelo parte de FacebookAI/xlm-roberta-large, un transformer encoder-only con 24 capas, atencion multi-cabeza y embeddings multilingües preentrenados sobre corpus masivos en un centenar de idiomas. Sobre esa base se aplica un fine-tuning supervisado para clasificacion de tokens con esquema BIO y tres tipos de entidad (PER, LOC, ORG), lo que da lugar a seis etiquetas: B-PER, I-PER, B-LOC, I-LOC, B-ORG e I-ORG.

El entrenamiento utiliza el corpus HILIGAYNER, con una particion de 8.004 frases de entrenamiento, 889 de validacion y 2.227 de test tras eliminar texto duplicado. Se optimiza con AdamW durante 3 epocas, learning rate de 3e-05 y longitud maxima de 128 tokens incluyendo tokens especiales. El checkpoint final se selecciona por F1 estricto de span BIO sobre validacion y se evalua sobre test. El corpus combina texto de noticias, redes sociales y textos religiosos, lo que introduce variedad de registro pero tambien ruido ortografico. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, algo esperable en un modelo encoder-only de clasificacion.

## Capacidades

- Reconocimiento de entidades nombradas en texto en hiligaynon con tres tipos: persona (PER), localizacion (LOC) y organizacion (ORG).
- Clasificacion de tokens a nivel de subtoken con esquema BIO y agregacion de spans mediante `aggregation_strategy="simple"` en el pipeline de transformers.
- Procesamiento de entradas a nivel de oracion o fragmento corto (hasta 128 tokens).
- Integracion directa con la libreria transformers mediante `pipeline("token-classification")`.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision ni audio.
- No soporta tool calling ni function calling.
- No esta disenado para razonamiento multi-paso ni para agentes.
- Capacidad multilingue limitada al hiligaynon; el modelo base es multilingue, pero el fine-tuning se ha realizado solo sobre ese idioma.

## Casos de uso

- Extraccion de entidades en noticias locales: dado un parrafo de prensa en hiligaynon, el modelo identifica nombres de personas, lugares y organizaciones mencionados, lo que permite construir indices de entidades y alimentar sistemas de busqueda o resumen.
- Monitorizacion de redes sociales: al procesar publicaciones y comentarios en hiligaynon, se pueden detectar menciones a personas publicas, localidades y entidades civiles para tareas de analisis de opinion o seguimiento de eventos.
- Construccion de bases de conocimiento regionales: los spans extraidos se pueden enlazar con Wikidata u otras ontologias para poblar grafos de conocimiento sobre Filipinas, un ambito con cobertura escasa en recursos abiertos.
- Analisis de discurso en textos religiosos y comunitarios: el corpus de entrenamiento incluye textos religiosos, por lo que el modelo puede extraer entidades en sermones, catequesis o boletines parroquiales para estudios sociolinguisticos.
- Anonimizacion y proteccion de datos: la deteccion de PER permite enmascarar nombres personales en documentos en hiligaynon antes de compartirlos o publicarlos, util en cumplimiento de privacidad.
- Investigacion linguistica y anotacion asistida: el modelo puede preanotar corpus en hiligaynon para acelerar la creacion de nuevos datasets NER, reduciendo el esfuerzo manual de anotadores humanos.
- Soporte a sistemas de atencion ciudadana: en portales gubernamentales o lineas de ayuda en hiligaynon, la extraccion de LOC y ORG permite enrutar consultas al organismo o demarcacion correspondiente.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de test del corpus HILIGAYNER:

| Metrica | Valor |
|---|---|
| F1 macro (6 etiquetas BIO) | 0,8652 |
| F1 estricto de span BIO | 0,8451 |

Desglose por etiqueta:

| Etiqueta BIO | Precision | Recall | F1 | Soporte |
|---|---:|---:|---:|---:|
| B-PER | 0,9527 | 0,9628 | 0,9577 | 1800 |
| I-PER | 0,9386 | 0,9344 | 0,9365 | 2226 |
| B-LOC | 0,8151 | 0,8637 | 0,8387 | 587 |
| I-LOC | 0,8448 | 0,8476 | 0,8462 | 1214 |
| B-ORG | 0,7924 | 0,8609 | 0,8252 | 532 |
| I-ORG | 0,7743 | 0,7995 | 0,7867 | 888 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos NER sobre hiligaynon.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,2 GB solo para pesos, mas activaciones y overhead del runtime; en la practica, entre 3 y 4 GB.
- VRAM estimada en fp16: alrededor de 1,1 GB para pesos, con un total practico de 2 a 3 GB.
- VRAM estimada en int8: aproximadamente 0,6 GB para pesos, con un total practico en torno a 1,5 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4060, RTX 4090, Apple Silicon (M1/M2/M3) y GPUs de datacenter como A100 o H100 funcionan sin problema, aunque estas ultimas estan sobredimensionadas para el tamano del modelo.
- Cabe holgadamente en GPU consumer e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers con `pipeline`, ONNX Runtime, TorchScript, y servidores de inferencia compatibles con modelos de clasificacion de tokens (por ejemplo, Text Embeddings Inference o soluciones propias basadas en FastAPI). vLLM y llama.cpp no estan orientados a este tipo de modelo encoder-only.
- Latencia y throughput: no disponibles en la informacion proporcionada; en una GPU consumer se espera procesamiento de miles de oraciones cortas por minuto, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Tarea | Licencia |
|---|---|---|---|---|---|
| josephimperial/hiligayner-xlmr-large | 558,8 M | 128 tokens (entrenamiento) | hiligaynon | NER (PER/LOC/ORG) | no disponible |
| FacebookAI/xlm-roberta-large | 558,8 M | 512 tokens | multilingue (100 idiomas) | encoder generico | MIT |
| Modelos NER filipinos (p. ej. basados en bert-base-multilingual) | ~178 M | 512 tokens | tagalo, cebuano, etc. | NER | variable |

La comparativa directa con otros modelos NER especificos de hiligaynon no esta disponible en la informacion proporcionada. Frente a XLM-RoBERTa large sin fine-tuning, este modelo ofrece un rendimiento sustancialmente superior en la tarea concreta, a costa de perder generalidad multilingue. Frente a modelos NER multilingues genericos, la ventaja es la especializacion en un idioma de bajos recursos.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre texto en hiligaynon; su uso en otros idiomas filipinos o en tagalo/cebuano producira resultados poco fiables.
- Ventana de 128 tokens: no apta para documentos largos sin segmentacion previa en oraciones o fragmentos.
- Sensible a variaciones ortograficas y convenciones de escritura no vistas en el corpus; el propio autor advierte que el rendimiento puede variar en otros dominios.
- El corpus de entrenamiento se compone de noticias, redes sociales y textos religiosos, lo que puede introducir sesgos de dominio y de registro.
- Riesgo de alucinacion de spans: como todo modelo NER, puede generar entidades espurias en texto ambiguo o con ruido.
- Rendimiento mas bajo en ORG (F1 0,7867 en I-ORG) que en PER (F1 0,9365 en I-PER), por lo que la extraccion de organizaciones requiere revision adicional.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; conviene contactar con el autor antes de integrarlo en produccion.
- Modelo con cero descargas y cero likes en el momento de la consulta, sin validacion externa independiente.
- No incluye capacidades de generacion, tool calling ni agentes; es exclusivamente un clasificador de tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/josephimperial/hiligayner-xlmr-large
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Corpus HILIGAYNER (repositorio): https://github.com/jvlzloons/HiligayNER
- Dataset anotado (JSONL): https://github.com/jvlzloons/HiligayNER/blob/cfd02cb0fdb2f1aadb75106c7a779c17db687ada/Dataset/Annotated%20dataset/final_combined_all.jsonl
- Paper HILIGAYNER (PACLIC 39, 2025): https://aclanthology.org/2025.paclic-1.71/

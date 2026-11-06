# MrPickle191/phobert-ner-vietnamese

## Resumen

phobert-ner-vietnamese es un modelo de reconocimiento de entidades nombradas (NER) para vietnamita, publicado por el usuario MrPickle191 en Hugging Face. Se trata de un fine-tuning de vinai/phobert-base-v2, un transformer encoder basado en la arquitectura RoBERTa adaptado especificamente al vietnamita mediante tokenizacion a nivel de silaba. El modelo resuelve la tarea de token-classification, es decir, la identificacion y clasificacion de entidades (personas, organizaciones, localizaciones, etc.) dentro de texto en vietnamita.

El modelo cuenta con 134.423.829 parametros y se distribuye en formato safetensors con un tamano de repositorio de 2,2 GB. La model card es escasa: fue generada automaticamente por el Trainer de Hugging Face y no documenta el dataset de entrenamiento, los tipos de entidades soportadas ni las limitaciones. El autor declara un F1 de 0,9248 y una perdida de validacion de 0,1283 sobre un conjunto de evaluacion no especificado.

Su relevancia es limitada pero concreta: cubre un nicho (NER en vietnamita) con pocas alternativas publicas, y parte de PhoBERT, que es el modelo de referencia para procesamiento de lenguaje natural en vietnamita. La licencia AGPL-3.0 es un factor critico a tener en cuenta para cualquier uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (transformer encoder), base vinai/phobert-base-v2 |
| Parametros totales | 134.423.829 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (PhoBERT-base usa 256 tokens por defecto) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; cuantizacion posible via herramientas externas) |
| Idiomas soportados | vietnamita (no declarado explicitamente en la model card) |
| Licencia | AGPL-3.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de vinai/phobert-base-v2, un transformer encoder de tipo RoBERTa entrenado originalmente sobre un corpus vietnamita de aproximadamente 20 GB de texto. PhoBERT utiliza un tokenizador a nivel de palabra basado en silabas, lo que es especialmente adecuado para vietnamita, un idioma con palabras compuestas formadas por silabas separadas por espacios. La cabeza de clasificacion de tokens se anade sobre el encoder para la tarea de NER.

Los hiperparametros de entrenamiento documentados son: learning rate 2e-05, batch de entrenamiento de 16, batch de evaluacion de 8, semilla 42, optimizador AdamW (variante fused torch) con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal y 5 epocas. El entrenamiento se realizo con Transformers 5.20.2, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3. No se especifica el dataset de entrenamiento, el esquema de etiquetas (BIO, BIOES) ni los tipos de entidades cubiertos. No hay evidencia de RLHF, DPO ni tecnicas de alineacion, algo esperable en un modelo encoder para clasificacion.

## Capacidades

- Reconocimiento de entidades nombradas (NER) en vietnamita: clasificacion token a token segun el esquema de etiquetas usado en el entrenamiento (no documentado).
- Token classification generica: al ser un fine-tuning de un encoder con cabeza de clasificacion, la arquitectura es reutilizable para otras tareas token-level si se reentrena la cabeza.
- Extraccion de informacion estructurada a partir de texto no estructurado en vietnamita.
- No soporta generacion de texto, razonamiento, codigo ni matematicas: es un modelo exclusivamente encoder.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues: no disponibles; el modelo base esta especializado en vietnamita.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Extraccion de entidades en documentos empresariales vietnamitas: procesar contratos, facturas o correspondencia para identificar nombres de personas, organizaciones y localizaciones, aprovechando el fine-tuning sobre PhoBERT para vocabulario y morfologia vietnamita.
- Anonimizacion de datos personales (PII): detectar nombres de personas y lugares en textos vietnamitas antes de almacenarlos o compartirlos, como paso previo a un pipeline de cumplimiento normativo.
- Enriquecimiento de bases de datos de noticias: etiquetar automaticamente articulos de prensa vietnamita con las entidades mencionadas para facilitar busqueda y recomendacion.
- Preprocesamiento para sistemas RAG: extraer entidades de documentos antes de indexarlos, permitiendo filtros estructurados por organizacion o localizacion junto a la busqueda semantica.
- Analisis de opinion y monitorizacion de marca: identificar menciones de empresas y productos en redes sociales o foros vietnamitas para agregar sentimiento por entidad.
- Construccion de grafos de conocimiento: alimentar un grafo con relaciones entidad-texto a partir de corpus vietnamitas, usando el modelo como extractor de nodos.
- Moderacion de contenido: detectar nombres de personas o lugares en textos enviados por usuarios para aplicar reglas de privacidad o revision manual.

## Benchmarks y rendimiento

Los unicos datos disponibles provienen de la model card del autor. El model-index no contiene resultados (`results: []`), por lo que no hay benchmarks estandar (MMLU, HumanEval, etc.) publicados.

| Metrica | Valor | Conjunto |
|---|---|---|
| F1 | 0,9248 | Evaluacion (no especificado) |
| Loss de validacion | 0,1283 | Evaluacion (no especificado) |

Evolucion durante el entrenamiento (segun la model card):

| Epoca | Paso | Loss de validacion | F1 |
|---|---|---|---|
| 1 | 315 | 0,2700 | 0,8630 |
| 2 | 630 | 0,1919 | 0,9024 |
| 3 | 945 | 0,1447 | 0,9147 |
| 4 | 1260 | 0,1323 | 0,9227 |
| 5 | 1575 | 0,1283 | 0,9248 |

No se han publicado resultados de benchmarks estandar ni comparaciones con otros modelos NER en vietnamita en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB para los pesos (134 M de parametros x 4 bytes), mas overhead de activaciones y tokenizacion; en la practica cabe en cualquier GPU consumer con 4 GB o mas.
- VRAM estimada en fp16: aproximadamente 0,27 GB para los pesos.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; para lotes grandes en produccion, una T4 o A10 resulta adecuada. No requiere A100 ni H100.
- Cabe holgadamente en GPU consumer: si, en cualquier GPU con 4 GB o mas de VRAM, e incluso en CPU para inferencia de baja latencia.
- Opciones de despliegue: transformers (Pipeline de token-classification), TGI (Text Generation Inference no aplica a encoders; usar Inference Endpoints o un servidor FastAPI propio), ONNX Runtime, o conversion a GGUF para llama.cpp si se desea (aunque llama.cpp esta orientado a generacion).
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera latencia de milisegundos por secuencia corta en GPU y decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MrPickle191/phobert-ner-vietnamese | 134 M | no disponible | NER vietnamita | AGPL-3.0 | Hugging Face, 32 descargas |
| vinai/phobert-base-v2 | ~135 M | 256 tokens | Encoder base vietnamita (sin cabeza NER) | MIT (segun el repositorio original) | Hugging Face, ampliamente usado |
| xlm-roberta-base | ~278 M | 512 tokens | Encoder multilingue (requiere fine-tuning para NER) | MIT | Hugging Face |

La comparativa con alternativas NER especificas para vietnamita no esta disponible en la informacion proporcionada. PhoBERT-base-v2 es el punto de partida y no incluye cabeza de clasificacion; xlm-roberta-base es una alternativa multilingue que requeriria fine-tuning propio. No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion disponible.

## Limitaciones y advertencias

- Model card incompleta: el autor no documenta el dataset de entrenamiento, el esquema de etiquetas ni los tipos de entidades soportadas, lo que impide conocer que entidades detecta realmente.
- El F1 de 0,9248 corresponde a un conjunto de evaluacion no especificado; no es comparable con resultados publicados sobre datasets estandar como VLSP NER.
- Riesgo de alucinacion y falsos positivos: como todo modelo NER, puede etiquetar tokens incorrectamente, especialmente en textos con ruido, abreviaturas o dominio distinto al de entrenamiento.
- Sesgos desconocidos: al no documentarse la composicion del dataset, no es posible evaluar sesgos demograficos, geograficos o de dominio.
- Limitacion idiomatica: el modelo esta pensado para vietnamita; su rendimiento en otros idiomas no esta garantizado ni documentado.
- Licencia AGPL-3.0: es una licencia copyleft fuerte. Cualquier uso en un servicio en red puede obligar a liberar el codigo fuente del servicio bajo la misma licencia. Para uso comercial propietario es necesario evaluar implicaciones legales o contactar con el autor para una licencia alternativa.
- Modelo con muy poca traccion: 32 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- Fecha de creacion inusual (2026-10-28) en los metadatos de Hugging Face; conviene verificar la integridad del repositorio antes de usarlo en produccion.
- No apto para generacion de texto ni para tareas que requieran contexto largo: es un encoder de clasificacion de tokens.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MrPickle191/phobert-ner-vietnamese
- Modelo base PhoBERT v2: https://huggingface.co/vinai/phobert-base-v2
- Paper de PhoBERT (Nguyen y Nguyen, 2020): https://arxiv.org/abs/2003.00744
- Repositorio oficial de PhoBERT: https://github.com/VinAIResearch/PhoBERT
- Documentacion de token-classification en Transformers: https://huggingface.co/docs/transformers/tasks/token_classification

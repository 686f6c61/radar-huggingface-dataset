# HasanPekedis/dbmdz_bert-base-turkish-cased_LPO_merged_dataset_5_16_512_3e-5

## Resumen

Este modelo es un ajuste fino (fine-tuning completo) del checkpoint `dbmdz/bert-base-turkish-cased` para reconocimiento de entidades nombradas (NER) en turco, especializado exclusivamente en la entidad de tipo organización (ORG). Lo publica el usuario HasanPekedis en Hugging Face y está entrenado sobre un conjunto de datos turco de NER fusionado, con secuencias de 512 tokens y una tasa de aprendizaje de 3e-5, tal y como refleja el propio nombre del repositorio.

Se trata de un modelo de clasificación de tokens (token classification) con etiquetado BIO (`O`, `B-ORG`, `I-ORG`) y 110.029.059 parámetros, lo que corresponde a la arquitectura BERT-base del modelo base. No es un modelo generativo ni conversacional: su única salida útil es una etiqueta por token, orientada a extraer menciones de organizaciones de texto turco.

Su relevancia es acotada y muy específica: el turco es un idioma con relativamente pocos recursos NER abiertos y bien evaluados, y este checkpoint ofrece una alternativa reproducible para pipelines de extracción de información donde solo interesan las organizaciones (por ejemplo, análisis de noticias financieras o seguimiento de menciones corporativas). El autor reporta un F1 de 0,8541 en el conjunto de test para la clase ORG (2.645 ejemplos) y un mejor F1 de validación de 0,861211 en la época 3, con señales claras de sobreajuste a partir de esa época.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT-base (modelo base `dbmdz/bert-base-turkish-cased`) |
| Parametros totales | 110.029.059 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (límite del modelo base; el nombre del repositorio indica 512 como longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (el autor no publica versiones cuantizadas; al ser un modelo de 110 M de parámetros admite cuantización dinámica int8 y ejecución en fp16 con las herramientas estándar de PyTorch) |
| Idiomas soportados | turco (según la model card) |
| Licencia | no disponible (la model card remite a las licencias del modelo base y de los datasets de ajuste fino) |
| Formato de pesos | safetensors (confirmado por los tags del repositorio); no se publican versiones GGUF ni ONNX |
| Tarea | Clasificación de tokens / NER (token classification) |
| Etiquetas | `O`, `B-ORG`, `I-ORG` (esquema BIO) |
| Tamaño del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `dbmdz/bert-base-turkish-cased`: un transformer encoder bidireccional con tokenizador WordPiece en versión cased (sensible a mayúsculas, relevante en turco porque la distinción de mayúsculas afecta a nombres propios y a la morfología). Sobre esa base se añade una cabeza de clasificación de tokens con tres etiquetas y se realiza fine-tuning completo, sin adaptadores ni LoRA.

El entrenamiento se llevó a cabo durante 5 épocas sobre un dataset turco de NER fusionado, con `max_length` de 512 y tasa de aprendizaje 3e-5 (parámetros deducidos del nombre del checkpoint). La pérdida de entrenamiento bajó de 0,042371 a 0,005197, mientras que la pérdida de validación alcanzó su mínimo en la época 2 (0,030371) y después aumentó, lo que el autor interpreta como inicio de sobreajuste. El mejor F1 de validación (0,861211) se obtuvo en la época 3. No se documenta en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset fusionado, ni el uso de RLHF, DPO u otras técnicas de alineación (no aplicables a una tarea de etiquetado).

## Capacidades

- Reconocimiento de entidades de tipo organización (ORG) en texto turco, con etiquetado BIO a nivel de token.
- Extracción de menciones de organizaciones para pipelines de información estructurada.
- Clasificación de tokens mediante `pipeline("ner", aggregation_strategy="simple")` de Transformers, con agregación de subtokens en entidades.
- Funciona sobre texto con formato estándar (noticias, documentos, informes) en turco.
- No dispone de generación de texto, razonamiento, código, matemáticas ni capacidades multimodales.
- No soporta tool calling ni function calling: es un modelo discriminativo, no un modelo de instrucciones.
- No está diseñado para agentes ni razonamiento multi-paso.
- Capacidad multilingüe: no; está especializado únicamente en turco.
- Capacidad especial: ninguna (no hay modo "thinking", visión ni audio).

## Casos de uso

- Extracción de organizaciones en noticias turcas: el modelo identifica las menciones de empresas e instituciones en artículos, permitiendo construir índices de entidades para búsqueda y análisis de medios.
- Monitorización de reputación de marca: alimentando titulares y prensa turca al modelo, se pueden detectar menciones de una organización concreta y medir su frecuencia a lo largo del tiempo.
- Enriquecimiento de bases de datos corporativas: normalización de registros turcos donde el nombre de la organización aparece en texto libre, separando la mención de la entidad del resto del campo.
- Análisis financiero y de mercados: extracción de entidades emisoras en informes y comunicados turcos para vincular noticias con instrumentos financieros.
- Preprocesado para sistemas de resolución de entidades (entity linking): el modelo genera los candidatos de mención que después se resuelven contra una base de conocimiento.
- Investigación en PLN turco: uso como línea base reproducible en experimentos de NER sobre turco, dado que el autor publica métricas de validación época a época y de test.
- Anonimización o auditoría documental: localización de menciones de organizaciones en corpus internos antes de su publicación o análisis legal.
- Indexación semántica para buscadores internos: etiquetar documentos turcos con las organizaciones citadas para filtrado facetado.

## Benchmarks y rendimiento

| Conjunto | Entidad | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|---|
| Validación (época 1) | ORG | 0,820456 | 0,854406 | 0,837087 | no disponible |
| Validación (época 2) | ORG | 0,840705 | 0,859387 | 0,849943 | no disponible |
| Validación (época 3, mejor) | ORG | 0,853594 | 0,868966 | 0,861211 | no disponible |
| Validación (época 4) | ORG | 0,839174 | 0,871648 | 0,855102 | no disponible |
| Validación (época 5) | ORG | 0,853861 | 0,868582 | 0,861159 | no disponible |
| Test | ORG | 0,8541 | 0,8541 | 0,8541 | 2.645 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la información disponible; solo se reportan métricas de validación y test para la clase ORG. El modelo no evalúa otras clases de entidad, por lo que estos números no deben interpretarse como rendimiento NER general en turco.

## Requisitos de hardware

- Peso de los parámetros: aproximadamente 440 MB en fp32 y 220 MB en fp16, coherente con el tamaño de repositorio de 0,4 GB.
- VRAM estimada para inferencia: en torno a 1 GB con lotes pequeños en fp32, menos de 1 GB en fp16 o int8 dinámico. Es un modelo que cabe holgadamente en cualquier GPU de consumo con 4 GB o más.
- GPU recomendadas: cualquier GPU moderna es suficiente; una RTX 3060, RTX 4090, T4, L4 o A10 bastan para servir el modelo con holgura. En A100 o H100 el cuello de botella no será el modelo, sino el preprocesado y la red.
- CPU: la inferencia en CPU es totalmente viable para volúmenes moderados gracias a los 110 M de parámetros.
- Opciones de despliegue: Hugging Face Transformers con `pipeline("ner")`, exportación a ONNX Runtime o TorchScript, y cuantización dinámica int8 de PyTorch para reducir latencia en CPU. No se publican pesos GGUF ni versiones para Ollama o llama.cpp, y vLLM o TGI no son la vía habitual para un modelo de clasificación de tokens.
- Latencia y throughput: no disponibles como cifras medidas por el autor. Como estimación orientativa, un modelo BERT-base en GPU procesa del orden de varios cientos a miles de secuencias cortas por segundo según lote y longitud; no debe tomarse como dato verificado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Rendimiento reportado |
|---|---|---|---|---|---|
| Este modelo (HasanPekedis, BERTurk + NER ORG) | 110 M | 512 | NER turco, solo ORG | no disponible | F1 ORG test 0,8541; mejor F1 val 0,861211 |
| `dbmdz/bert-base-turkish-cased` | 110 M aprox. | 512 | Modelo base sin cabeza de tarea | no disponible en esta ficha | no disponible (no es un modelo NER) |
| Otros modelos NER en turco publicados en Hugging Face (por ejemplo, variantes basadas en BERTurk) | 110 M aprox. típicamente | 512 | NER turco multietiqueta | varía según autor | no disponible en la información proporcionada |

No se dispone de datos verificados en la información suministrada para comparar cifras de F1 con alternativas concretas, por lo que la comparación se limita a arquitectura, tamaño y alcance de la tarea.

## Limitaciones y advertencias

- Entrenado únicamente para la entidad ORG: el rendimiento en PER, LOC, MISC u otras clases no está evaluado ni garantizado.
- Sobreajuste documentado: la pérdida de validación repunta desde la época 2 y el F1 de validación no mejora de forma significativa tras la época 3.
- Degradación esperable en turco informal, texto con errores ortográficos o dominios alejados de los datos de entrenamiento.
- Dificultades con nombres de organización largos o complejos, según reconoce el propio autor.
- Riesgo de alucinación en sentido estricto bajo (es una tarea de etiquetado, no de generación), pero sí hay riesgo de falsos positivos y de fragmentación incorrecta de entidades al agregar subtokens.
- Límite de 512 tokens por secuencia: los documentos más largos deben trocearse, con la consiguiente pérdida de contexto entre fragmentos.
- Modelo monolingüe: no procesa castellano ni otros idiomas.
- Licencia no disponible explícitamente: antes de uso comercial o redistribución hay que revisar las licencias del modelo base y de los datasets de ajuste fino, tal y como advierte la model card.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad, sin pipeline declarado y con fecha de creación/actualización anómala en los metadatos (2026).
- Ausencia de evaluación sobre conjuntos de test públicos estándar de NER turco, lo que impide comparar de forma homogénea con otros checkpoints.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HasanPekedis/dbmdz_bert-base-turkish-cased_LPO_merged_dataset_5_16_512_3e-5
- Modelo base: https://huggingface.co/dbmdz/bert-base-turkish-cased
- Documentación de `AutoModelForTokenClassification` y del pipeline NER de Transformers: https://huggingface.co/docs/transformers
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos corresponden a contenidos sin relación, sobre la prestación francesa "prime d'activité"). No se han localizado papers, blogs, repositorios ni demos adicionales.

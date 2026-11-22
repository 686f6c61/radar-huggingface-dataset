# impresso-project/mmbert-impresso-mediasources-ner

## Resumen

mmBERT Impresso Media Sources NER es un modelo de clasificación de tokens (token classification) especializado en la detección de menciones de fuentes mediáticas citadas en texto histórico de prensa. Lo desarrolla el proyecto Impresso, una iniciativa de investigación centrada en el procesamiento de archivos de periódicos históricos, y se distribuye bajo licencia MIT. El modelo identifica de forma específica menciones de agencias de noticias y emisoras de radio, etiquetándolas con identificadores canónicos como `org.ent.pressagency.<canonical_id>` u `org.ent.radiostation.<canonical_id>`.

La versión v2.0.1 del modelo se ha afinado a partir del checkpoint `impresso-project/mmbert-multilingual-impresso-continued-mlm`, que a su vez deriva del modelo base `jhu-clsp/mmBERT-base`. Se trata, por tanto, de un encoder transformer ModernBERT de aproximadamente 307 millones de parámetros, adaptado mediante continued masked language modeling al dominio de prensa histórica multilingüe (francés, alemán y luxemburgués) antes de recibir el ajuste fino específico para NER.

Su relevancia radica en que cubre una tarea muy concreta y poco atendida por los modelos generalistas: la extracción de menciones de fuentes citadas en corpus históricos, con un etiquetado que resuelve la entidad a un identificador canónico en lugar de limitarse a una categoría genérica. Esto lo hace útil para enriquecimiento de corpus y flujos de curación asistida, no como un NER de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT) |
| Parametros totales | 307.606.371 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | fr, de, lb |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en ModernBERT, un encoder transformer con atención de tipo full (no generativo), adaptado en dos fases. Primero se aplicó un continued masked language modeling sobre texto de prensa histórica multilingüe (`impresso-project/mmbert-multilingual-impresso-continued-mlm`), partiendo de `jhu-clsp/mmBERT-base`. Después se realizó el ajuste fino para token classification sobre el dataset `impresso-project/impresso-mediaagencies-ner-dataset` (revisión v2.1.0), con un total de 307.606.371 parámetros en el checkpoint final.

El entrenamiento utilizó la política de tokenización de anotaciones `unicode-word-punctuation-v1`, con supervisión sobre todos los subtokens y conversión de B a I para subtokens de continuación. Se descongelaron las tres capas superiores de ModernBERT y se fijó una semilla aleatoria de 42. El checkpoint seleccionado corresponde a la época 11 (marcada como `best`). Se compararon cuatro decodificadores sobre el split de validación con ese mismo checkpoint; se eligió `first_subtoken_viterbi` por obtener el mayor F1 exact-match de entidad (0,9290), frente a `all_subtoken_viterbi` (0,9247), `all_subtoken` (0,9026) y `first_subtoken` (0,8995). La configuración del modelo registra la tokenización de anotaciones, la supervisión de subtokens y la política de decodificación, y la inferencia en tiempo de ejecución aplica la tokenización y el decodificador declarados.

## Capacidades

- Reconocimiento de menciones de agencias de noticias, etiquetadas como `org.ent.pressagency.<canonical_id>`.
- Reconocimiento de menciones de emisoras de radio, etiquetadas como `org.ent.radiostation.<canonical_id>`.
- Clasificación de tokens a nivel de subtoken con decodificación Viterbi sobre el primer subtoken.
- Procesamiento de texto histórico de prensa en francés, alemán y luxemburgués.
- Salida de etiquetas BIO decodificadas reproducibles mediante el pipeline personalizado incluido en el repositorio.
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo discriminativo de etiquetado, no generativo.
- No dispone de capacidades de visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Enriquecimiento de corpus de prensa histórica: el modelo recorre el texto OCR de periódicos digitalizados y etiqueta las menciones de agencias y emisoras citadas, permitiendo construir índices de fuentes por documento y por fecha.
- Curación asistida de archivos periodísticos: los resultados se presentan a documentalistas como candidatos a revisión, reduciendo el trabajo manual de identificar qué agencias cita cada pieza informativa.
- Construcción de grafos de procedencia informativa: al resolver cada mención a un `<canonical_id>`, se pueden agregar menciones por fuente y estudiar la dependencia de determinadas agencias o emisoras a lo largo del tiempo.
- Investigación en historia de los medios: permite cuantificar la presencia de agencias de noticias y radios en la prensa de una región o periodo, con métricas de precisión y recall conocidas (F1 exact-match de 0,8902 en test).
- Análisis comparativo multilingüe: al cubrir francés, alemán y luxemburgués, facilita estudios transfronterizos sobre circulación de noticias entre medios de distintas lenguas.
- Preprocesado para pipelines de búsqueda y recuperación: las etiquetas de fuente pueden indexarse como metadatos y usarse para filtrar o facetar resultados en un buscador de archivo histórico.
- Verificación de citas en flujos editoriales: el modelo puede señalar automáticamente las fuentes citadas en un texto para su contraste posterior por parte de un verificador humano.

## Benchmarks y rendimiento

Datos de evaluación publicados en la model card:

| Split | Precision | Recall | Exact-match entity F1 | Correctas / gold / predichas |
|---|---:|---:|---:|---|
| Validación | 0,9567 | 0,9029 | 0,9290 | 530 / 587 / 554 |
| Test held-out | 0,9341 | 0,8502 | 0,8902 | 539 / 634 / 577 |

Comparativa de decodificadores sobre validación (mismo checkpoint, época 11):

| Decoder | Entity F1 (validación) |
|---|---:|
| `first_subtoken_viterbi` | 0,9290 |
| `all_subtoken_viterbi` | 0,9247 |
| `all_subtoken` | 0,9026 |
| `first_subtoken` | 0,8995 |

El pipeline personalizado local reprodujo las etiquetas BIO decodificadas del evaluador en los 490 documentos de test, con cero discrepancias y métricas de entidad y token idénticas. La verificación del artefacto publicado está pendiente según la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 307,6 millones de parámetros en precisión completa (fp32) el peso ronda 1,2 GB, y en fp16/bf16 aproximadamente 0,6 GB, a lo que hay que sumar memoria de activaciones y del tokenizador.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder ejecutar el modelo en fp16 o cuantizado.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares, aunque el fabricante no publica requisitos oficiales.
- Opciones de despliegue: el repositorio incluye un pipeline personalizado con la política de decodificación `first_subtoken_viterbi`; también puede servirse con frameworks estándar de token classification (por ejemplo, Hugging Face Transformers) respetando la tokenización de anotaciones declarada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| impresso-project/mmbert-impresso-mediasources-ner | 307.606.371 | no disponible | NER de fuentes mediáticas en prensa histórica (fr, de, lb) | MIT | Hugging Face |
| jhu-clsp/mmBERT-base (modelo base) | no disponible | no disponible | Encoder multilingüe de propósito general | no disponible | Hugging Face |
| impresso-project/mmbert-multilingual-impresso-continued-mlm (base intermedio) | no disponible | no disponible | MLM continuado sobre prensa histórica multilingüe | no disponible | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para detectar menciones de agencias de noticias y emisoras de radio en texto de prensa histórica; no es un NER de propósito general y su uso fuera de ese dominio no está validado.
- El recall en test held-out es de 0,8502, inferior a la precisión (0,9341), lo que implica que aproximadamente un 15 % de las menciones gold no se detectan.
- El rendimiento depende de que el texto de entrada se tokenice con la misma política de anotaciones (`unicode-word-punctuation-v1`) usada en el entrenamiento; desviarse de ella puede degradar los resultados.
- Solo cubre francés, alemán y luxemburgués; no se ha evaluado en otras lenguas.
- El espacio de etiquetas puede crecer en el futuro para cubrir otras familias de fuentes mediáticas, lo que puede afectar a la compatibilidad entre versiones.
- La verificación del artefacto publicado está pendiente según la model card, aunque la reproducibilidad local se validó en los 490 documentos de test.
- No se han publicado análisis de sesgos; al operar sobre prensa histórica, puede heredar sesgos de representación del corpus de entrenamiento.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de falsos positivos y negativos en la detección de entidades.
- Licencia MIT: permite uso comercial y modificación, pero conviene revisar las condiciones del dataset de origen y de los modelos base (`jhu-clsp/mmBERT-base`) para usos derivados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/impresso-project/mmbert-impresso-mediasources-ner
- Dataset de entrenamiento: https://huggingface.co/datasets/impresso-project/impresso-mediaagencies-ner-dataset
- Modelo base intermedio: https://huggingface.co/impresso-project/mmbert-multilingual-impresso-continued-mlm
- Modelo base original: https://huggingface.co/jhu-clsp/mmBERT-base

# elsay1/onex-capture-test-t3

## Resumen

El modelo `elsay1/onex-capture-test-t3` es un fine-tune de `distilbert-base-uncased` sobre el dataset SST-2 (Stanford Sentiment Treebank) de GLUE, especializado en clasificación de sentimiento binario (positivo/negativo) en inglés. Lo publica el usuario `elsay1` en HuggingFace con licencia Apache 2.0 y está orientado a tareas de análisis de opinión en texto corto. Aunque el repositorio tiene un nombre genérico de prueba, el model-index lo identifica como `distilbert-base-uncased-finetuned-sst-2-english`, lo que indica que es una adaptación del conocido modelo destilado de BERT.

Con 66,9 millones de parámetros, es un modelo ligero y rápido, adecuado para entornos con recursos limitados. Su arquitectura es un transformer encoder-only de tipo DistilBERT, que mantiene el rendimiento de BERT-base con aproximadamente un 40% menos de parámetros. No se especifica la longitud de contexto en la ficha, pero DistilBERT suele soportar 512 tokens. El modelo está entrenado únicamente en inglés y su caso de uso principal es la clasificación de sentimiento en frases o reseñas cortas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder-only) |
| Parametros totales | 66.955.010 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (típico de DistilBERT: 512 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (según tags del repositorio) |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, una versión destilada de BERT que reduce el número de capas de 12 a 6 manteniendo la misma dimensión de embeddings (768). Utiliza una arquitectura transformer encoder-only con atención multi-cabeza y no incluye decodificador, por lo que no es capaz de generar texto. El proceso de destilación original se describe en el paper arXiv:1910.01108, donde se entrena el modelo estudiante para imitar las salidas del profesor BERT-base.

Para este fine-tune, el autor ha ajustado los pesos de DistilBERT sobre el dataset SST-2 (parte de GLUE), que contiene frases en inglés etiquetadas como positivas o negativas. No se dispone de información sobre el número exacto de tokens de entrenamiento, la composición del dataset más allá de SST-2, ni si se aplicaron técnicas de RLHF o DPO. Los resultados declarados en el model-index muestran un rendimiento sólido en el split de validación, con una accuracy de 0,9105 y un AUC de 0,9717.

## Capacidades

- Clasificación de texto binaria: asigna una etiqueta positiva o negativa a una frase o reseña en inglés.
- Análisis de sentimiento: adecuado para medir la polaridad de opiniones en textos cortos (tweets, comentarios, reseñas).
- Inferencia rápida: al ser un modelo pequeño (66M parámetros), ofrece latencias bajas en CPU y GPU.
- Integración con pipelines de Hugging Face: se puede usar directamente con `pipeline("text-classification")`.
- No genera texto: al ser encoder-only, no soporta generación de lenguaje natural.
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso.

## Casos de uso

- Análisis de sentimiento en redes sociales: monitorizar menciones de una marca en Twitter o Facebook y clasificarlas como positivas o negativas para medir la opinión pública en tiempo real.
- Moderación de comentarios en foros o plataformas de contenido: filtrar automáticamente comentarios con sentimiento negativo o abusivo antes de su publicación.
- Clasificación de reseñas de productos: procesar reseñas de Amazon o similar para agruparlas por polaridad y generar estadísticas de satisfacción.
- Detección de feedback en encuestas: analizar respuestas abiertas de formularios y clasificar la actitud del encuestado hacia un servicio o producto.
- Análisis de noticias financieras: clasificar titulares o artículos cortos en positivos/negativos para alimentar sistemas de análisis de sentimiento bursátil.
- Filtrado de tickets de soporte: priorizar tickets de clientes con sentimiento negativo para una atención más rápida y personalizada.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index, verificados con token de verificación (aunque el campo `verified` aparece como `false` en el primer bloque de datos, el segundo bloque los marca como `true`; se presentan tal cual).

| Dataset | Split | Metrica | Valor |
|---|---|---|---|
| glue (sst2) | validation | Accuracy | 0,9105504587155964 |
| glue (sst2) | validation | Precision | 0,8978260869565218 |
| glue (sst2) | validation | Recall | 0,9301801801801802 |
| glue (sst2) | validation | AUC | 0,9716626673402374 |
| glue (sst2) | validation | F1 | 0,9137168141592922 |
| glue (sst2) | validation | Loss | 0,39013850688934326 |
| sst2 | train | Accuracy | 0,9885521685548412 |
| sst2 | train | Precision Macro | 0,9881965062029833 |
| sst2 | train | Precision Micro | 0,9885521685548412 |
| sst2 | train | Precision Weighted | 0,9885639626373408 |
| sst2 | train | Recall Macro | 0,9886145346602994 |
| sst2 | train | Recall Micro | 0,9885521685548412 |
| sst2 | train | Recall Weighted | 0,9885521685548412 |
| sst2 | train | F1 Macro | 0,9884019815052447 |
| sst2 | train | F1 Micro | 0,9885521685548412 |
| sst2 | train | F1 Weighted | 0,9885546181087554 |

No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: con 66,9M parámetros en fp32, los pesos ocupan aproximadamente 268 MB. En inferencia con batch pequeño, el consumo total de VRAM es inferior a 1 GB.
- GPU recomendada: cualquier GPU con al menos 1 GB de VRAM, incluyendo modelos antiguos como GTX 1050, o integradas modernas. También puede ejecutarse en CPU sin problemas.
- Cabe en GPUs de consumo: sí, es compatible con todas las GPUs consumer actuales (RTX 3060, RTX 4090, etc.) y también con hardware de gama baja.
- Opciones de despliegue: Hugging Face Transformers, ONNX Runtime (gracias al formato ONNX disponible), TensorFlow Serving, o cualquier framework que soporte safetensors.
- Latencia y throughput: no se han publicado cifras oficiales, pero por su tamaño se espera una latencia de pocos milisegundos por muestra en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| onex-capture-test-t3 (DistilBERT SST-2) | 66,9M | No disponible | Apache-2.0 | Sentimiento binario en inglés |
| BERT-base-uncased (original) | 110M | 512 | Apache-2.0 | Modelo general, requiere fine-tune |
| RoBERTa-base | 125M | 512 | MIT | Modelo general, mejor rendimiento que BERT en varias tareas |
| DistilBERT-base (sin fine-tune) | 66M | 512 | Apache-2.0 | Modelo general destilado, requiere fine-tune |

No se dispone de resultados de benchmarks comparativos para este modelo frente a los anteriores en los mismos datasets. La comparativa se basa en características arquitectónicas y de licencia.

## Limitaciones y advertencias

- Entrenado exclusivamente en SST-2, un dataset de frases cortas en inglés; su rendimiento puede degradarse en dominios muy diferentes (lenguaje técnico, jerga, idiomas distintos del inglés).
- Al ser un modelo de clasificación binaria, no distingue matices de sentimiento (neutral, mixto) ni intensidades.
- Riesgo de alucinación no aplica al ser un modelo discriminativo, pero puede producir clasificaciones erróneas en textos ambiguos o con sarcasmo.
- El dataset SST-2 puede contener sesgos socioculturales que el modelo puede amplificar.
- No es adecuado para tareas de generación de texto ni para conversaciones multi-turno.
- La licencia Apache-2.0 permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantías sobre el rendimiento en producción.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/elsay1/onex-capture-test-t3
- Paper original de DistilBERT (arXiv:1910.01108): https://arxiv.org/abs/1910.01108

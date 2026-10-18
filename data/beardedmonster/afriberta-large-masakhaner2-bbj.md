# BeardedMonster/afriberta-large-masakhaner2-bbj

## Resumen

`BeardedMonster/afriberta-large-masakhaner2-bbj` es un checkpoint de clasificación de tokens (Named Entity Recognition) obtenido al afinar `castorini/afriberta_large` sobre el protocolo `bbj` del corpus MasakhaNER 2.0. Lo publica el usuario BeardedMonster como parte de un harness de evaluación que reproduce los resultados publicados de MasakhaNER 2.0, y está especializado en una única lengua africana de bajos recursos, identificada con el código ISO `bbj`.

El modelo resuelve la tarea de identificar y clasificar entidades nombradas (personas, organizaciones, localizaciones y fechas, según el esquema del corpus) en texto en `bbj`. Con 125.047.305 parámetros y un repo de 0,5 GB, es un encoder de tamaño medio que puede ejecutarse en CPU o en GPUs de consumo, lo que lo hace práctico para anotación asistida y para pipelines de procesamiento de texto en lenguas africanas donde los modelos multilingües grandes suponen un coste desproporcionado.

Su relevancia es doble: por un lado, aporta cobertura NER para una lengua escasamente atendida; por otro, su model card documenta la metodología de entrenamiento (50 épocas, lr 5e-5, batch 32, max length 256) y reporta un `span_f1` medio de 0,7067, con la advertencia explícita de que se trata de una única ejecución. El checkpoint no declara licencia propia y remite a los términos del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (tag `xlm-roberta` en el repo), afinado para clasificación de tokens |
| Parametros totales | 125.047.305 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible de forma explícita; el fine-tuning usa `max_length` 256 |
| Tipos de cuantizacion | No disponible (solo se publican pesos en safetensors; no hay versiones cuantizadas oficiales) |
| Idiomas soportados | `bbj` (una única lengua) |
| Licencia | No disponible; la model card remite a la licencia y términos de `castorini/afriberta_large` |
| Formato de pesos | safetensors (repo de 0,5 GB) |

## Arquitectura y entrenamiento

Se trata de un encoder transformer (la etiqueta del repositorio es `xlm-roberta`, coherente con la familia AfriBERTa, construida sobre arquitectura tipo XLM-RoBERTa) con 125 millones de parámetros, adaptado mediante fine-tuning supervisado a la tarea de token classification. La cabeza de clasificación está configurada con `id2label`, de modo que las predicciones se decodifican directamente a nombres de etiquetas sin post-procesado adicional. No se menciona en la información disponible ningún uso de RLHF, DPO ni técnicas de alineación, algo esperable en un modelo discriminativo de este tipo.

El entrenamiento se realizó sobre el protocolo `bbj` de MasakhaNER 2.0, con 50 épocas, learning rate 5e-5, batch size 32 y longitud máxima de 256 tokens, optimizando `span_f1`. La model card indica que el harness de evaluación reproduce las baselines publicadas de MasakhaNER 2.0 con una desviación de aproximadamente 0,25 F1, lo que permite considerar las cifras calibradas y comparables con la literatura; sin embargo, los resultados provienen de una sola ejecución, mientras que los papers de referencia promedian cinco, por lo que las diferencias pequeñas deben interpretarse como ruido. No se detalla la composición del dataset ni el número de tokens de entrenamiento.

## Capacidades

- Reconocimiento de entidades nombradas en texto en `bbj`: extracción de menciones y asignación de etiquetas del esquema MasakhaNER 2.0.
- Clasificación de tokens a nivel de span, con decodificación directa a nombres de etiqueta mediante `id2label`.
- Procesamiento de secuencias de hasta 256 tokens en la configuración entrenada.
- Integración nativa con `transformers` mediante `AutoTokenizer` y `AutoModelForTokenClassification`.
- Uso como modelo de representación contextual para `bbj` (el encoder subyacente puede emplearse en otras tareas de clasificación o extracción de características).
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión ni audio: es un modelo discriminativo encoder-only.
- Capacidad multilingüe: no disponible en este checkpoint; está especializado en una sola lengua.

## Casos de uso

- Extracción de entidades en prensa y documentos locales en `bbj`: el modelo identifica personas, organizaciones, lugares y fechas en noticias o comunicados, permitiendo construir índices de entidades para archivos digitales.
- Pre-anotación para creación de corpus: genera etiquetas automáticas que un lingüista revisa y corrige, reduciendo el coste de anotar manualmente corpus en una lengua de bajos recursos.
- Enriquecimiento de motores de búsqueda internos: al etiquetar entidades en documentos, se pueden construir filtros facetados y mejorar la recuperación de información en `bbj`.
- Investigación lingüística y sociolingüística: el etiquetado sistemático de nombres propios y topónimos facilita estudios de uso, variación y normalización ortográfica.
- Evaluación comparativa de modelos para lenguas africanas: sirve como referencia reproducible de NER en `bbj` dentro de experimentos que comparan encoders multilingües frente a monolingües.
- Moderación y análisis de contenido en plataformas comunitarias: detección de menciones a personas u organizaciones en textos de usuario para tareas de revisión y trazabilidad.
- Pipelines de datos para ONG y administraciones: extracción de entidades en encuestas, registros y textos abiertos en `bbj` para su consolidación en bases de datos estructuradas.

## Benchmarks y rendimiento

| Modelo | Idioma | Métrica | Resultado |
|---|---|---|---|
| afriberta-large-masakhaner2-bbj | bbj | span_f1 (media, 1 ejecución) | 0,7067 |

No se han publicado en la información disponible resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) ni comparaciones numéricas con modelos alternativos. Las puntuaciones por lengua se encuentran en el fichero `metrics.json` del repositorio.

## Requisitos de hardware

- Inferencia en fp32: aproximadamente 0,5 GB de pesos; en fp16 alrededor de 0,25 GB; en int8 en torno a 0,125 GB (cálculo teórico a partir de los 125 millones de parámetros).
- VRAM necesaria en la práctica: menos de 2 GB para inferencia con batch pequeño en fp16, incluyendo activaciones y tokenizador.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para volúmenes moderados.
- GPU de datacenter (A100, H100, L40S) no son necesarias para inferencia; solo tendrían sentido para reentrenamiento o evaluación a gran escala.
- Opciones de despliegue: pipeline de `transformers`, exportación a ONNX Runtime para inferencia en CPU, TorchScript, o servidores de inferencia para modelos encoder (por ejemplo, Hugging Face TGI con soporte de token classification). `vLLM` y `llama.cpp` están orientados a modelos generativos y no son la vía habitual para este checkpoint.
- Latencia y throughput: no disponible; no se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento NER | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| afriberta-large-masakhaner2-bbj (este) | 125.047.305 | max_length 256 en entrenamiento | span_f1 0,7067 en bbj (1 ejecución) | No disponible (hereda la del modelo base) | Hugging Face, safetensors |
| castorini/afriberta_large (modelo base) | No disponible en la información | No disponible | No aplica (modelo base sin fine-tuning NER) | No disponible | Hugging Face |
| Otros checkpoints afriberta-large afinados en MasakhaNER 2.0 para otras lenguas | ~125 M (por familia) | 256 | No disponible | No disponible | Hugging Face |
| Encoders multilingües grandes afinados en MasakhaNER 2.0 (por ejemplo, familia XLM-R large / AfroXLMR) | No disponible | No disponible | No disponible | No disponible | Hugging Face |

No se dispone de cifras comparativas verificadas en la información proporcionada; los datos de la columna de rendimiento de los modelos alternativos se marcan como no disponibles para no introducir valores no contrastados.

## Limitaciones y advertencias

- Cobertura monolingüe: solo `bbj`; no debe esperarse transferencia a otras lenguas africanas sin un fine-tuning específico.
- Resultados de una sola ejecución: la propia model card advierte que el harness promedia cinco ejecuciones en las baselines, por lo que diferencias pequeñas frente a otros modelos no son significativas.
- Sin licencia declarada: el uso comercial queda sujeto a la licencia de `castorini/afriberta_large`, que debe verificarse antes de desplegar el modelo en producción.
- Ventana limitada: el entrenamiento usa `max_length` 256, de modo que documentos largos requieren fragmentación con el consiguiente riesgo de perder entidades en los límites de los segmentos.
- Esquema de etiquetas restringido al protocolo MasakhaNER 2.0; no cubre tipos de entidad fuera de ese conjunto.
- Dominio de entrenamiento probablemente periodístico; el rendimiento puede degradarse en textos técnicos, conversacionales o con ortografía no normalizada.
- Riesgo de errores en fronteras de entidad y falsos positivos, habitual en modelos NER de lenguas de bajos recursos; se recomienda validación humana en flujos críticos.
- Riesgo de sesgo heredado del corpus y del modelo base; no se documentan evaluaciones de equidad ni de robustez en la información disponible.
- El modelo no genera texto: no aplica el riesgo de alucinación generativa, pero sí el de consolidar extracciones incorrectas si se usa sin revisión.
- Sin métricas publicadas de latencia, throughput ni consumo, no es posible dimensionar infraestructura a partir de datos del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BeardedMonster/afriberta-large-masakhaner2-bbj
- Modelo base: https://huggingface.co/castorini/afriberta_large
- Métricas por lengua: fichero `metrics.json` dentro del repositorio del modelo
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada

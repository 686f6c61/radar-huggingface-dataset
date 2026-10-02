# PursuitOfDataScience/argonne-4.5-decision

## Resumen

Argonne 4.5-decision es un modelo de clasificacion y decision de tipo zero-shot desarrollado por PursuitOfDataScience. No es un modelo generativo: parte de un tronco LLM de 2,06 mil millones de parametros (argonne-4.5-base-ctx13568, con 13.568 tokens de contexto) al que se anade una cabeza de decision que, en una sola pasada hacia delante, devuelve una distribucion de probabilidad calibrada sobre las opciones que se le entregan. Resuelve tareas de eleccion entre opciones, puntuacion segun una escala propia y estimacion de veracidad de una afirmacion, siempre dentro del esquema definido por el usuario.

El modelo admite tres tipos de pregunta: Choice (de 2 a 255 opciones), Score (una leyenda `{nivel: descripcion}`) y Noul (probabilidad de que una afirmacion sea cierta). Todas las preguntas sobre un mismo texto comparten una unica pasada, por lo que conviene agruparlas en una sola llamada. La `confidence` devuelta es 1 menos la entropia normalizada.

Su relevancia actual radica en la calibracion: el autor reporta un error de calibracion esperado (ECE) de 0,022 en preguntas de eleccion multiple y 0,024 en puntuaciones, frente al 0,082 y 0,325 que atribuye a Jev. Ademas, sobre once conjuntos de decision nunca vistos durante el entrenamiento es 4,5 puntos mas preciso que DeBERTa-v3-large zero-shot. El modelo es pequeno (2B), lo que lo hace desplegable en una sola GPU, y su licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; tronco LLM argonne-4.5-base-ctx13568 mas cabeza de decision (custom_code) |
| Parametros totales | 2.063.639.552 (2,06 mil millones) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 13.568 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria pytorch, requiere custom_code y `trust_remote_code`) |

Datos adicionales: tamano del repositorio 4,1 GB, pipeline declarado `zero-shot-classification`, creado el 1 de octubre de 2026 y actualizado el mismo dia. Descargas y likes registrados: 0.

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo es argonne-4.5-base-ctx13568 (2,06B de parametros, contexto de 13.568 tokens) con una cabeza de decision anadida. El autor define la operacion como "decisiones tipadas en una sola pasada": el texto y las preguntas entran juntos, una unica pasada por el tronco procesa el texto, y la cabeza puntua cada opcion para producir JSON tipado y calibrado. El modelo no genera texto en ningun caso; toda respuesta es una probabilidad sobre las opciones proporcionadas, lo que impide que responda fuera del esquema definido.

No se detallan en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Si se documenta que la calibracion se ajusta con una temperatura por tipo de pregunta, estimada sobre preguntas de validacion separadas (71.208 de tipo Choice, 11.732 de tipo Score y 31.260 de tipo Noul en el conjunto de test). El repositorio GitHub ArgonneAI se describe como "LLM Pretraining, Midtraining, and Post-training", pero no se aportan mas detalles tecnicos del tronco.

## Capacidades

- Clasificacion zero-shot por eleccion: selecciona una opcion entre 2 y 255 candidatas, devolviendo la opcion elegida, una confianza y una probabilidad por opcion.
- Puntuacion segun escala propia: recibe una leyenda `{nivel: descripcion}` y devuelve el nivel esperado, la confianza y la probabilidad por nivel.
- Estimacion de veracidad (Noul): dada una afirmacion, devuelve la probabilidad de que sea cierta.
- Seguimiento de reglas escritas: cuando la regla de decision se escribe dentro de la pregunta ("si cuando el texto es A, B o C; no para D y E"), el modelo la aplica bien, incluso sobre conjuntos de etiquetas nunca vistos.
- Procesamiento por lote de preguntas: todas las preguntas sobre un mismo texto comparten una sola pasada.
- Calibracion de probabilidades: ECE de 0,022 en Choice y 0,024 en Score sobre el conjunto de test retenido.
- Capacidades multilingues: no disponibles; el modelo declara unicamente ingles.
- Tool calling / function calling: no disponible (el modelo no genera texto ni ejecuta agentes).
- Razonamiento multi-paso y modo "thinking": no disponible.
- Vision y audio: no disponible.

## Casos de uso

- Enrutado de tickets de soporte: dado un mensaje de cliente, el modelo elige entre una lista de intenciones o departamentos (hasta 255 opciones) y devuelve la probabilidad por opcion, lo que permite derivar a revision humana cuando la confianza es baja.
- Moderacion de contenido y filtrado de seguridad: formulando la pregunta como un criterio si/no (por ejemplo, "peticion de chat insegura"), el modelo devuelve la probabilidad de que el texto cumpla el criterio. El autor advierte de que un criterio nuevo sin regla escrita rinde entre el 56% y el 66%, por lo que conviene calibrar el umbral con ejemplos etiquetados.
- Analisis de sentimiento con escalas personalizadas: usando preguntas de tipo Score con una leyenda propia, se obtiene el nivel esperado y su distribucion, util para paneles de opinion o monitorizacion de marca.
- Clasificacion de documentos y triaje de correo: etiquetado de noticias, correos o documentos en categorias definidas en tiempo de inferencia sin reentrenar el modelo (por ejemplo, 20 Newsgroups con 20 opciones: 61,2% de precision).
- Deteccion de spam: criterio si/no sobre correos (65,5% de precision sobre 2.000 ejemplos segun el autor), integrable en una etapa previa a un clasificador supervisado.
- Etiquetado de datos para entrenamiento supervisado: generacion de etiquetas iniciales y probabilidades asociadas sobre grandes volumenes de texto, que luego se revisan y corrigen; la calibracion permite priorizar las muestras de baja confianza.
- Evaluacion de afirmaciones en control de calidad de contenidos: estimacion de la probabilidad de que una frase sea cierta para marcar automaticamente textos dudosos antes de su publicacion.
- Extraccion de intenciones en asistentes conversacionales: clasificacion de la intencion del usuario contra un catalogo cerrado, con probabilidades por opcion para decidir si se responde automaticamente o se escala.

## Benchmarks y rendimiento

Calibracion: error de calibracion esperado sobre preguntas de test retenidas, tras ajustar una temperatura por tipo de pregunta.

| Tipo de pregunta | ECE antes de temperatura | ECE despues | ECE despues en conjuntos nunca entrenados | Jev (publicado) |
|---|---:|---:|---:|---:|
| Choice | 0,087 | 0,022 | 0,049 | 0,082 |
| Score | 0,026 | 0,024 | no disponible | 0,325 |
| Noul | 0,016 | 0,010 | 0,160 | no disponible |

Clasificacion de intenciones zero-shot en Banking77 (3.076 preguntas de test, 77 intenciones como opciones, nunca entrenado):

| Modelo | Top-1 | Top-3 | Top-5 |
|---|---:|---:|---:|
| argonne-4.5-decision | 62,5 | 80,7 | 86,4 |
| Jev (publicado) | 81,1 | no disponible | no disponible |

Precision sobre once conjuntos de decision nunca entrenados:

| Conjunto | Preguntas | Precision |
|---|---:|---:|
| Banking77 intents, como regla escrita | 798 | 83,7 |
| 20 Newsgroups, como regla escrita | 461 | 80,5 |
| Finance news topics, como regla escrita | 1.012 | 69,9 |
| Spam email (si/no) | 2.000 | 65,5 |
| Banking77 intents, 77 opciones | 3.076 | 62,5 |
| 20 Newsgroups, 20 opciones | 2.000 | 61,2 |
| Finance news sentiment, 3 opciones | 2.388 | 56,5 |
| Unsafe chat request (si/no) | 2.741 | 56,4 |
| MMLU, 4 opciones | 4.000 | 45,5 |
| Finance news topics, 20 opciones | 4.117 | 40,3 |
| TruthfulQA MC1 | 817 | 31,7 |

Comparacion con clasificadores zero-shot: sobre los mismos once conjuntos y con el mismo codigo de puntuacion, el autor situa a argonne-4.5-decision 4,5 puntos por encima de DeBERTa-v3-large zero-shot v2.0. Los desgloses por conjunto frente a DeBERTa-v3-large zero-shot v2.0 y BART-large-MNLI no estan completos en la informacion disponible. Los fallos en Banking77 se concentran en intenciones vecinas ("order physical card" frente a "get physical card") y en nombres de intencion que describen mal sus preguntas. Los resultados en conocimiento (MMLU 45,5; TruthfulQA MC1 31,7) se mantienen al nivel de su modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, aproximadamente 8,3 GB; en bf16/fp16, aproximadamente 4,1 GB (el repositorio ocupa 4,1 GB); en int8, en torno a 2,1 GB; en int4, en torno a 1,2 GB.
- GPUs recomendadas: el autor reporta una latencia de 59 a 118 ms por llamada en una unica A100. Cualquier GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060 de 12 GB, RTX 4070, RTX 4080) puede ejecutarlo en bf16.
- Cabe en GPU de consumo: si. Una RTX 4090 de 24 GB lo ejecuta con holgura incluso en fp32, y una RTX 3060 de 12 GB lo ejecuta en bf16.
- Opciones de despliegue: al tratarse de un modelo de clasificacion con `custom_code` y sin cabeza generativa, no se documenta soporte para vLLM, llama.cpp, Ollama o TGI. El uso previsto es via PyTorch/Transformers con `trust_remote_code=True`.
- Latencia: 59 a 118 ms por llamada en una A100 segun el autor. El rendimiento en otras GPUs y el throughput por lotes no estan disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Tipo | Precision destacada |
|---|---|---|---|---|---|
| argonne-4.5-decision | 2,06B | 13.568 tokens | Apache 2.0 | clasificador zero-shot con cabeza de decision | 4,5 puntos por encima de DeBERTa-v3-large zero-shot en 11 conjuntos; ECE 0,022 en Choice |
| DeBERTa-v3-large zero-shot v2.0 | no disponible | no disponible | no disponible | clasificador zero-shot por entailment | usado como baseline; por debajo de argonne en 4,5 puntos de media |
| BART-large-MNLI | no disponible | no disponible | no disponible | clasificador zero-shot por entailment | usado como baseline; desglose no disponible |
| Jev | no disponible | no disponible | no disponible | clasificador | 81,1 en Banking77 top-1; ECE 0,082 en Choice y 0,325 en Score |
| argonne-4.5-base-ctx13568 | 2,06B | 13.568 tokens | no disponible | LLM base | modelo del que deriva argonne-4.5-decision |

## Limitaciones y advertencias

- Solo ingles: el modelo declara unicamente el idioma ingles; no hay soporte multilingue documentado.
- No genera texto: toda salida es una probabilidad sobre las opciones proporcionadas. No puede responder fuera del esquema y no sirve como modelo de chat ni de generacion.
- Calibracion degradada en criterios si/no nuevos: el ECE sube a 0,160 en conjuntos nunca entrenados de tipo Noul, sobre todo porque las probabilidades se concentran hacia el centro. El autor recomienda elegir el umbral sobre unos pocos ejemplos etiquetados en lugar de confiar en 0,5.
- Rendimiento limitado en conocimiento: MMLU 45,5 y TruthfulQA MC1 31,7, en linea con su modelo base. No es adecuado para tareas que dependan de conocimiento enciclopedico.
- Criterios si/no sin regla escrita: la precision cae al rango del 56% al 66% cuando el criterio es nuevo y no se incluye una regla explicita.
- Cabeza de decision personalizada: el modelo requiere `custom_code` y `trust_remote_code=True`, lo que implica revisar el codigo antes de desplegarlo en produccion.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente conocida.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar los terminos del modelo base argonne-4.5-base-ctx13568, cuya licencia no se especifica.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que no produce texto libre; el riesgo equivalente es una clasificacion erronea con alta confianza, mitigable mediante umbrales calibrados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PursuitOfDataScience/argonne-4.5-decision
- Modelo base: https://huggingface.co/PursuitOfDataScience/argonne-4.5-base-ctx13568
- Modelo base alternativo: https://huggingface.co/PursuitOfDataScience/argonne-4.5-base
- Repositorio GitHub: https://github.com/PursuitOfDataScience/ArgonneAI
- Codigo del modelo: https://github.com/PursuitOfDataScience/ArgonneAI/blob/main/model.py
- Baseline DeBERTa-v3-large zero-shot v2.0: https://huggingface.co/MoritzLaurer/deberta-v3-large-zeroshot-v2.0
- Baseline BART-large-MNLI: https://huggingface.co/facebook/bart-large-mnli

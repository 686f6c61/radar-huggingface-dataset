# danjai/scamlens-qs-google-bert-v7

## Resumen

ScamLens quick_score google-bert-v7 es un clasificador de texto binario derivado de `google-bert/bert-base-uncased` mediante fine-tuning supervisado. Lo desarrolla el usuario danjai en el contexto de ScamLens, un agente de investigacion de estafas construido como proyecto de curso universitario (IS469). Su funcion concreta es la herramienta `quick_score`: recibe el texto de un SMS o mensaje de chat y devuelve la probabilidad de que se trate de una estafa, con etiquetas `0 = genuine` y `1 = scam`.

Se trata de un BERT base encoder-only de 109.483.778 parametros (unos 110 M), con contexto de entrada limitado a 192 tokens durante el entrenamiento, especializado en mensajes de estilo singapurense en ingles. El modelo resuelve un problema acotado de clasificacion de lenguaje natural aplicado a la deteccion de fraude por mensajeria, un dominio donde los enfoques basados en reglas tienen dificultades con variaciones de redaccion.

Es relevante ahora unicamente como registro metodologico: el propio autor advierte en la model card que "this run did not train well" (F1 de validacion 0.719) y que se publica como documentacion de lo intentado, no para uso en produccion. No obstante, su tamano reducido, su licencia de uso no declarada y su pipeline estandar de `transformers` lo convierten en un ejemplo util de fine-tuning de BERT para clasificacion de dominio especifico, asi como en un caso de estudio sobre validacion por plantillas y evaluacion con intervalos de confianza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT base) |
| Parametros totales | 109.483.778 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 192 tokens (max_length de entrenamiento); limite arquitectonico de BERT base: 512 tokens |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; compatible con cuantizacion estandar de transformers/BitsAndBytes, no documentada por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Modelo base | google-bert/bert-base-uncased |
| Tamano del repositorio | 0.4 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-11-10 |

## Arquitectura y entrenamiento

La arquitectura es un BERT base estandar (encoder-only, 12 capas, atencion bidireccional, tokenizer WordPiece con casing uncased) al que se le anade una cabeza de clasificacion de secuencia con dos etiquetas. No hay innovaciones arquitectonicas: el modelo es un fine-tuning convencional de `AutoModelForSequenceClassification` sobre `google-bert/bert-base-uncased`.

El entrenamiento uso 1901 ejemplos (1522 para entrenar, 379 para validar), con 2 epocas, learning rate de 1e-06, batch size de 8, `max_length` de 192, `warmup_ratio` de 0.1, `weight_decay` de 0.01, scheduler lineal, pesos de clase balanceados, `val_ratio` de 0.2 y semilla 42. La particion de validacion se hizo por plantilla de mensaje (1387 plantillas), de modo que las copias cercanas de un mensaje de entrenamiento nunca aparecen en validacion, una decision metodologica correcta para evitar fuga de datos. Los datos son mensajes de estafa y mensajes genuinos de estilo singapurense: avisos publicos de fraude, mensajes sinteticos, alertas bancarias generadas en pares genuino/estafa y SMS cotidianos de corpus publicos. Se documentan los SHA-256 de los conjuntos de entrenamiento y test. No se menciona uso de RLHF, DPO ni tecnicas de decodificacion especulativa, algo esperable en un clasificador encoder-only.

## Capacidades

- Clasificacion binaria de texto: devuelve la probabilidad de estafa (`1`) frente a mensaje genuino (`0`) mediante softmax sobre los logits.
- Deteccion de fraude por redaccion en SMS y mensajes de chat en ingles de estilo singapurense (bancos locales, agencias, servicios de pago).
- Integracion como herramienta `quick_score` dentro del agente ScamLens, con umbrales operativos: alto desde 0.70, medio desde 0.50, bajo por debajo.
- Uso programatico via `transformers` (`AutoTokenizer` + `AutoModelForSequenceClassification`) y despliegue compatible con `text-embeddings-inference` y endpoints compatibles.
- No soporta tool calling, function calling, razonamiento multi-paso, generacion de texto, codigo, matematicas, vision ni audio: es un clasificador puro.
- Capacidad multilingue: no disponible; solo ingles.

## Casos de uso

- Filtro de primera pasada en un agente antestafa: el modelo puntua la redaccion de cada mensaje entrante y el agente decide si activa herramientas adicionales (analisis de enlaces, numeros de telefono, remitentes), que segun el autor son comprobaciones separadas.
- Priorizacion de colas de moderacion: en un sistema de atencion al cliente, el score permite ordenar los mensajes reportados por usuarios para revision humana, usando el umbral de 0.70 como senal de alta prioridad.
- Investigacion academica sobre deteccion de fraude: sirve como linea base reproducible de fine-tuning de BERT con particion por plantilla y evaluacion con intervalos de confianza, util para comparar contra modelos mayores o enfoques basados en reglas.
- Prototipado de un pipeline de clasificacion de SMS en `transformers`: el ejemplo de codigo de la model card permite integrar el modelo en pocas lineas para validar una arquitectura de agente antes de invertir en un modelo mayor.
- Educacion y demostraciones: por su tamano (0.4 GB) y su naturaleza encoder-only, es adecuado para ejecutarse en portatiles y mostrar el funcionamiento de un clasificador de estafas en talleres o clases.
- Analisis de sesgo de dominio: al estar entrenado solo con mensajes singapurenses en ingles, permite estudiar empiricamente como degrada un clasificador al aplicarse a otras variantes regionales, comparando su rendimiento fuera de dominio.
- No se recomienda su uso para bloqueo automatico ni para acusar a personas, segun la propia model card.

## Benchmarks y rendimiento

| Metrica | Valor | Intervalo de confianza 95% |
|---|---|---|
| F1 de validacion | 0.719 | no disponible |
| Accuracy en test | 0.747 | 0.679 - 0.805 |
| Recall de estafa en test | 0.827 | 0.743 - 0.888 |
| Precision de estafa en test | 0.761 | 0.675 - 0.830 |
| F1 en test | 0.793 | no disponible |
| Mensajes genuinos clasificados como estafa | 27 de 74 | no disponible |
| Estafas no detectadas | 18 de 104 | no disponible |

El conjunto de test son 178 mensajes singapurenses escritos a mano que nunca aparecen en entrenamiento; se considera estafa a partir de probabilidad 0.50. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0.5 GB en fp32 para los 110 M de parametros, mas el overhead de activaciones y tokenizer; en fp16 aproximadamente 0.25 GB. Cifras estimadas a partir del numero de parametros, no publicadas por el autor.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 4090, RTX 3090 o incluso una GTX 1660 ejecutan el modelo sin problema. En A100 o H100 el modelo queda infrautilizado, pero funciona.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 2 GB o mas de VRAM, y tambien en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: `transformers` (documentado por el autor), `text-embeddings-inference` (tag del repositorio), endpoints compatibles, y en general cualquier runtime que cargue safetensors de BERT. No se documenta soporte explicito de vLLM, llama.cpp ni Ollama, aunque la conversion a GGUF seria tecnicamente posible.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera latencia de milisegundos por mensaje en GPU, pero es una estimacion, no un dato medido.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| danjai/scamlens-qs-google-bert-v7 | 109,5 M | 192 tokens (entrenamiento) | Clasificacion estafa/genuino, SMS singapurenses | no disponible | Hugging Face, 0 descargas |
| google-bert/bert-base-uncased | 110 M | 512 tokens | Modelo base general (MLM + NSP) | Apache 2.0 | Hugging Face, ampliamente usado |
| DistilBERT base uncased | ~66 M | 512 tokens | Modelo base destilado | Apache 2.0 | Hugging Face |
| RoBERTa base | ~125 M | 512 tokens | Modelo base general | MIT | Hugging Face |

La comparativa se limita a modelos base de la misma familia y tamano, ya que no se dispone de informacion sobre otros clasificadores de estafa publicos comparables. Frente a ellos, este modelo es un fine-tuning de dominio muy especifico con un conjunto de datos pequeno (1901 ejemplos) y un rendimiento modesto (F1 0.793 en test), mientras que los modelos base no estan especializados en la tarea. La licencia del modelo no esta declarada, lo que impide confirmar si permite uso comercial, a diferencia de las licencias permisivas de los modelos base citados.

## Limitaciones y advertencias

- El autor declara explicitamente que el entrenamiento no salio bien (F1 de validacion 0.719) y que el modelo se publica como registro, no para uso.
- Solo evalua la redaccion: no comprueba enlaces, numeros de telefono ni remitentes; esas comprobaciones son herramientas separadas en ScamLens.
- Entrenado exclusivamente con mensajes en ingles de Singapur (bancos, agencias y servicios de pago locales); se espera menor fiabilidad en otros paises y variantes del ingles.
- El conjunto de test es pequeno (178 mensajes), por lo que los intervalos de confianza son amplios (por ejemplo, accuracy entre 0.679 y 0.805).
- Tasa de falsos positivos elevada: 27 de 74 mensajes genuinos fueron clasificados como estafa en test.
- Tasa de falsos negativos no despreciable: 18 de 104 estafas no se detectaron.
- Licencia no disponible: no se puede confirmar el permiso para uso comercial ni la obligacion de atribucion.
- Riesgo de alucinacion no aplica en sentido generativo, pero el clasificador puede producir scores sobreconfiados en textos fuera de distribucion.
- No debe usarse solo para bloquear mensajes ni para acusar a personas, segun la propia model card.
- Sesgos conocidos: no documentados por el autor; el sesgo de dominio geografico y linguistico es el mas evidente.
- Sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validacion externa por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danjai/scamlens-qs-google-bert-v7
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.

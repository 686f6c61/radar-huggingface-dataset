# llm-semantic-router/Vela-1.0-Encoder-307M-PII

## Resumen

Vela-1.0-Encoder-307M-PII es un modelo encoder especializado en deteccion de informacion personal identificable (PII) mediante token classification. Lo desarrolla el proyecto vLLM Semantic Router (llm-semantic-router) y deriva por fine-tuning del modelo base vllm-sr/Vela-1.0-Encoder-307M, construido sobre la arquitectura ModernBERT. Con 307.557.155 parametros, resuelve el problema de localizar spans de entidades sensibles para enrutamiento consciente de la privacidad y redaccion de datos antes de que el texto llegue a un LLM generativo.

Su rasgo diferencial es la capacidad de entrada: 32.768 tokens incluyendo tokens especiales, lo que permite procesar documentos completos o conversaciones largas en una sola pasada sin trocear el contexto y perder entidades en los bordes de los fragmentos. Emite 35 etiquetas BIO sobre 17 tipos de entidad y devuelve los spans con offsets de caracteres Unicode, lo que facilita la redaccion exacta sobre el texto original.

Es relevante ahora porque el enrutamiento semantico en infraestructuras de inferencia (gateways que deciden a que modelo enviar cada peticion) necesita clasificadores ligeros y precisos que se ejecuten en la misma ruta critica. El modelo se distribuye con licencia Apache 2.0, en safetensors y ONNX, y soporta seis idiomas: ingles, chino, espanol, frances, aleman y japones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 307.557.155 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (incluyendo tokens especiales) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh, es, fr, de, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de la familia ModernBERT afinado para token classification con esquema BIO. La cabeza de clasificacion produce 35 etiquetas que cubren 17 tipos de entidad, y la salida incluye offsets de caracteres Unicode para reconstruir los spans exactos sobre el texto de entrada. El contexto maximo es de 32.768 tokens contando tokens especiales, lo que exige comprobar `max_position_embeddings` antes de la inferencia.

El fine-tuning se realizo sobre el modelo base vllm-sr/Vela-1.0-Encoder-307M. Segun la model card, los conjuntos de evaluacion son sinteticos, cubren seis idiomas e incluyen casos de entidades dispersas, entidades repetidas densamente y ejemplos negativos. No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; en un modelo de token classification estos ultimos no serian el mecanismo habitual, pero el dato no se confirma.

## Capacidades

- Deteccion de spans de PII: identifica 17 tipos de entidad con 35 etiquetas BIO y devuelve offsets de caracteres Unicode para redaccion exacta.
- Procesamiento de contexto largo: admite entradas de hasta 32.768 tokens, incluyendo tokens especiales, en una sola pasada.
- Multilingue: entrenado y evaluado en ingles, chino, espanol, frances, aleman y japones.
- Token classification por span: agrega predicciones a nivel de entidad mediante `aggregation_strategy="simple"` en el pipeline de Transformers.
- Integracion en enrutamiento semantico: pensado para clasificar peticiones antes de derivarlas a un LLM mayor.
- Soporte de ONNX: el repo incluye pesos en formato ONNX ademas de safetensors, lo que habilita despliegue con runtimes de inferencia optimizados.
- No es un modelo generativo: no produce texto, razonamiento, codigo ni soporta tool calling o agentes.

## Casos de uso

- Redaccion de PII en pipelines de datos: el modelo localiza nombres, correos, telefonos y otras entidades sensibles antes de enviar el texto a un LLM de terceros, y los offsets permiten sustituir solo los caracteres exactos del span.
- Gateway de enrutamiento consciente de la privacidad: integrado en un proxy de inferencia, clasifica cada peticion y decide si debe redirigirse a un modelo local, a uno con mayores garantias o bloquearse, gracias a su baja latencia como encoder de 307M.
- Cumplimiento normativo en atencion al cliente: analiza transcripciones y tickets multi-turno de hasta 32K tokens para detectar datos personales antes del almacenamiento o la exportacion, sin fragmentar la conversacion.
- Procesamiento de documentos legales y contratos: al cubrir documentos completos en una sola pasada, evita la perdida de entidades que se produce al trocear textos largos en fragmentos de 512 tokens.
- Anonimizacion previa a fine-tuning: limpia corpus multilingues de entrenamiento eliminando PII de forma consistente en seis idiomas antes de usarlos para ajustar otros modelos.
- Auditoria de logs y trazas: escanea registros de aplicacion en busca de credenciales o datos personales filtrados, con salida ONNX para ejecucion en CPU en entornos sin GPU.
- Filtrado en tiempo real en aplicaciones de chat: el modelo se ejecuta en CPU (`device=-1`) y puede validar cada mensaje del usuario antes de que alcance el modelo generativo.

## Benchmarks y rendimiento

La model card publica F1 micro de span exacto (x100) sobre conjuntos de desarrollo sinteticos, comparando con el modelo original mmBERT32K PII. Ambos modelos se evaluaron en FP32 y con el mismo scorer de span exacto.

| Evaluacion | mmBERT original | Vela |
|---|---:|---:|
| Entradas cortas (888 ejemplos) | 23,66 | 90,76 |
| Contexto controlado 4K (30 ejemplos) | 0,44 | 89,03 |
| Contexto controlado 8K (30 ejemplos) | 0,28 | 89,88 |
| Contexto controlado 16K (30 ejemplos) | 0,36 | 89,73 |
| Contexto controlado 32K (30 ejemplos) | 0,23 | 89,24 |

Advertencia del autor: estos conjuntos de desarrollo se usaron para seleccionar el modelo y no constituyen un benchmark independiente sobre documentos naturales. Los conjuntos largos incluyen entidades dispersas, entidades repetidas densamente y ejemplos negativos. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales, ya que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 1,23 GB solo para pesos (307,5M parametros x 4 bytes), mas activaciones; con contexto de 32K las activaciones de atencion elevan el consumo de forma notable.
- VRAM estimada en FP16/BF16: aproximadamente 0,62 GB para pesos; cuantizacion no documentada por el autor.
- GPU recomendadas: cualquier GPU con 8 GB o mas (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia en precision reducida; A100 y H100 no son necesarias salvo para alto throughput por lotes.
- Cabe en GPU de consumo: si, en la mayoria de tarjetas modernas con 6-8 GB o mas; tambien funciona en CPU, como muestra el ejemplo oficial con `device=-1`.
- Opciones de despliegue: pipeline de Transformers (>= 4.57.6 o 5.17.0), ONNX Runtime para los pesos ONNX, y servidores compatibles con endpoints de Hugging Face (el repo esta etiquetado como `endpoints_compatible`).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 span exacto (corto) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vela-1.0-Encoder-307M-PII | 307,5M | 32.768 | 90,76 | Apache 2.0 | Hugging Face (safetensors, ONNX) |
| mmBERT32K PII (vllm-sr/mmbert32k-pii-detector-merged) | no disponible | 32K (segun nombre) | 23,66 | no disponible | Hugging Face |
| Alternativas genericas de NER (p. ej. modelos BERT-base NER) | ~110M | 512 | no disponible | variable | Hugging Face |

La comparativa se limita a los datos publicados en la model card. No se dispone de resultados de otros detectores de PII de contexto largo en la informacion proporcionada.

## Limitaciones y advertencias

- Los conjuntos de evaluacion son sinteticos y se usaron para seleccionar el modelo; el rendimiento sobre documentos naturales puede diferir del reportado.
- Los conjuntos de contexto largo contienen solo 30 ejemplos por tamano, por lo que la varianza de las metricas es alta.
- Riesgo de falsos negativos y falsos positivos en entidades poco frecuentes, formatos regionales de documentos de identidad o jerga; no se documenta el desglose por tipo de entidad ni por idioma.
- Solo cubre seis idiomas; el rendimiento en espanol no se desglosa en la model card, aunque el idioma figure entre los soportados.
- No es un modelo generativo: no debe usarse para tareas de razonamiento, codigo o conversacion.
- La deteccion de PII no garantiza cumplimiento normativo por si sola; debe combinarse con validacion humana y politicas de redaccion en produccion.
- Licencia Apache 2.0: permite uso comercial y modificacion, con obligacion de conservar avisos de licencia y atribucion.
- La cuantizacion no esta documentada por el autor; cualquier conversion a INT8 o similar debe validarse contra el rendimiento en FP32.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/llm-semantic-router/Vela-1.0-Encoder-307M-PII
- Modelo base: https://huggingface.co/vllm-sr/Vela-1.0-Encoder-307M
- Modelo de comparacion mmBERT32K PII: https://huggingface.co/vllm-sr/mmbert32k-pii-detector-merged
- Coleccion Vela 1.0 Router Models: https://huggingface.co/collections/vllm-sr/vela-10-router-models-6aa555ba70cc6997d6d67798
- Documentacion: https://vllm-sr.ai/
- Blog: https://vllm-sr.ai/blog/
- Repositorio GitHub: https://github.com/vllm-project/semantic-router
- Slack: https://vllm-dev.slack.com/archives/C09CTGF8KCN

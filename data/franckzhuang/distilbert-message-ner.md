# franckzhuang/distilbert-message-ner

## Resumen

distilbert-message-ner es un modelo de reconocimiento de entidades nombradas (NER) obtenido por ajuste fino de distilbert/distilbert-base-uncased, publicado por el usuario franckzhuang en HuggingFace. Se trata de un clasificador de tokens (pipeline `token-classification`) orientado, segun el propio nombre del repositorio, a la extraccion de entidades en mensajes. La model card no documenta el conjunto de datos de entrenamiento, las etiquetas del esquema NER ni el dominio concreto de aplicacion, por lo que el modelo debe considerarse un artefacto experimental sin documentacion funcional.

Tecnicamente es un transformer encoder de tipo DistilBERT, con 66.365.187 parametros totales y un tamano de repositorio de 0,3 GB. El ajuste se realizo durante 3 epocas con learning rate 2e-05, batch de 16 y optimizador AdamW fused, alcanzando una perdida de validacion final de 0,0427. No se declara ningun resultado de benchmark en el model-index (la lista `results` esta vacia), de modo que no hay evidencia publicada de calidad en tareas NER estandar como CoNLL-2003.

Su relevancia actual es limitada: se publico el 10 de octubre de 2026 y acumula 0 descargas y 0 likes en el momento de redactar esta ficha. Resulta util como punto de partida reproducible (licencia Apache 2.0, pesos en safetensors, compatible con `transformers`) para quien quiera inspeccionar o reutilizar el ajuste, pero no como componente listo para produccion sin una evaluacion previa sobre datos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo DistilBERT (destilacion de BERT-base: 6 capas, 768 de dimension oculta, 12 cabezas de atencion, segun el modelo base) |
| Parametros totales | 66.365.187 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (maximo de posiciones del modelo base distilbert-base-uncased) |
| Tipos de cuantizacion | No disponible (no se publican variantes cuantizadas; los pesos safetensors admiten cuantizacion posterior con bitsandbytes, ONNX o similar) |
| Idiomas soportados | No disponible (el modelo base esta entrenado principalmente en ingles y usa tokenizador uncased; la model card no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repositorio de 0,3 GB) |

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT: un encoder transformer de 6 capas con 768 dimensiones ocultas y 12 cabezas de atencion, destilado desde BERT-base, sobre el que se anade una cabeza de clasificacion de tokens para NER. El modelo parte de los pesos de distilbert/distilbert-base-uncased y fue ajustado con la libreria `transformers` (Trainer). El tokenizador es el de DistilBERT uncased, con vocabulario WordPiece en minusculas y limite de 512 posiciones.

El entrenamiento consta de 3 epocas con learning rate 2e-05, tamanos de batch de entrenamiento y evaluacion de 16, semilla 42, planificador lineal y optimizador `OptimizerNames.ADAMW_TORCH_FUSED` con betas (0,9; 0,999) y epsilon 1e-08. No se especifica el conjunto de datos ("unknown dataset"), su tamano, la composicion del corpus ni el esquema de etiquetas. Tampoco se documenta el uso de RLHF, DPO ni ninguna tecnica de alineacion, algo esperable en un modelo discriminativo de NER. Las versiones de framework declaradas son Transformers 5.19.0, PyTorch 2.14.1, Datasets 5.1.0 y Tokenizers 0.23.2.

Evolucion de la perdida durante el entrenamiento (datos de la model card):

| Epoca | Perdida de entrenamiento | Paso | Perdida de validacion |
|---|---|---|---|
| 1.0 | 0,1728 | 147 | 0,0630 |
| 2.0 | 0,0424 | 294 | 0,0454 |
| 3.0 | 0,0223 | 441 | 0,0427 |

## Capacidades

- Clasificacion de tokens (NER): asigna una etiqueta a cada token de la secuencia de entrada mediante la cabeza de token classification.
- Extraccion de entidades en mensajes: por el nombre del repositorio, esta orientado a identificar entidades dentro de texto conversacional, aunque el esquema de etiquetas no esta documentado.
- Inferencia por secuencias de hasta 512 tokens, adecuada para mensajes cortos y medios.
- Compatible con el ecosistema `transformers` (`pipeline("token-classification")`) y con endpoints compatibles, segun las etiquetas del repositorio.
- No es un modelo generativo: no produce texto libre, no soporta tool calling ni function calling y no implementa modos de razonamiento multi-paso ni agentes.
- No se declaran capacidades multilingues, de vision, audio ni modo "thinking".

## Casos de uso

- Enrutado de tickets de soporte: extraer entidades (producto, numero de pedido, fecha, nombre) de mensajes de clientes para clasificarlos automaticamente hacia el equipo correcto. El modelo cabe en cualquier infraestructura y su latencia es baja al tener 66M de parametros.
- Enriquecimiento de CRM: procesar correos y mensajes entrantes para poblar campos estructurados (empresa, persona, ubicacion) antes de la revision humana.
- Deteccion preliminar de PII en registros conversacionales: usar las etiquetas de entidad para marcar posibles nombres o identificadores antes de aplicar una capa de anonimizacion. Requiere validar previamente el esquema de etiquetas real.
- Analitica de voz del cliente: agregar entidades mencionadas en conversaciones de chat o encuestas para construir metricas de mencion de marca, producto o incidencia.
- Preprocesado de pipelines de moderacion: resaltar nombres de usuario, direcciones o identificadores en mensajes reportados para priorizar la revision manual.
- Prototipado rapido y experimentacion academica: al ser un ajuste ligero con licencia Apache 2.0 y pesos safetensors, sirve como base reproducible para comparar estrategias de fine-tuning de NER sobre DistilBERT.
- Extraccion de campos en correos transaccionales: parsear confirmaciones de pedido, reservas o facturas para alimentar un sistema de registro automatico (con validacion posterior).
- Etiquetado asistido: preanotar un corpus de mensajes para que anotadores humanos corrijan, reduciendo el coste inicial de construccion de datasets NER.

## Benchmarks y rendimiento

El model-index del autor declara un unico resultado, con la lista de benchmarks vacia:

```json
[
  {
    "name": "distilbert-message-ner",
    "results": []
  }
]
```

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K, F1 de CoNLL-2003 ni ninguna otra metrica estandar). El unico dato cuantitativo de evaluacion es la perdida de validacion final de 0,0427 tras 3 epocas.

| Metrica declarada | Valor |
|---|---|
| Perdida de validacion (final, epoca 3) | 0,0427 |
| Perdida de validacion (epoca 2) | 0,0454 |
| Perdida de validacion (epoca 1) | 0,0630 |
| Benchmarks publicos (F1, precision, recall) | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,27 GB en FP32 (66,4M parametros), unos 0,13 GB en FP16/BF16 y alrededor de 0,07 GB en INT8. El repositorio ocupa 0,3 GB en disco.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Funciona sin problema en RTX 3060, RTX 4090, T4, L4 o GPUs integradas con soporte CUDA.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo e incluso en iGPU con suficiente memoria compartida.
- Ejecucion en CPU: viable para inferencia por lotes en produccion moderada, dado el reducido numero de parametros; el repositorio de 0,3 GB se puede cargar en memoria de un portatil.
- Opciones de despliegue: `transformers` (PyTorch), `pipeline` de HuggingFace, ONNX Runtime, TGI, y conversion a llama.cpp/Ollama no aplica (no es un modelo generativo). vLLM puede servir modelos de clasificacion de tokens en versiones recientes, pero no es su caso de uso principal; para despliegue sencillo, `transformers` con `pipeline("token-classification")` o un servidor FastAPI son suficientes.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. En la practica, con 6 capas y secuencias de hasta 512 tokens, se espera un coste por inferencia muy bajo en GPU (del orden de milisegundos por secuencia corta) y throughput alto en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| franckzhuang/distilbert-message-ner | 66.365.187 | 512 tokens | NER sobre mensajes (esquema no documentado) | Apache 2.0 | HuggingFace, 0 descargas |
| distilbert/distilbert-base-uncased | 66M aprox. | 512 tokens | Modelo base (no NER) | Apache 2.0 | HuggingFace, ampliamente usado |
| dslim/bert-base-NER | 110M aprox. | 512 tokens | NER en ingles (PER, ORG, LOC, MISC) | No verificada en la informacion proporcionada | HuggingFace |
| Modelos NER en espanol (p. ej. ajustes de RoBERTa/BETO) | Variable | 512 tokens | NER multilingue o en espanol | Variable | HuggingFace |

La comparativa cuantitativa de rendimiento no esta disponible: el modelo analizado no publica F1, precision ni recall, y su esquema de etiquetas es desconocido, por lo que no se puede contrastar de forma rigurosa contra alternativas con esquemas CoNLL documentados. La ventaja principal frente a alternativas mayores es el coste de inferencia (66M parametros frente a ~110M de BERT-base) y la licencia permisiva Apache 2.0.

## Limitaciones y advertencias

- Conjunto de datos de entrenamiento desconocido: la model card indica explicitamente "unknown dataset", por lo que se desconoce el dominio, el idioma y la distribucion de las clases.
- Esquema de etiquetas no documentado: no se publica la lista de entidades que el modelo reconoce ni el formato de las etiquetas BIO/BILUO, lo que impide interpretar las salidas sin inspeccionar el `config.json`.
- Sin benchmarks publicos: no hay F1, precision ni recall, de modo que la calidad real es indeterminada. La baja perdida de validacion no garantiza buen rendimiento en datos externos.
- Riesgo de sesgos: al derivar de distilbert-base-uncased y entrenarse sobre un corpus no documentado, puede heredar sesgos de genero, origen o profesion presentes en los datos. No hay analisis de sesgo publicado.
- Riesgo de error en la clasificacion: como todo modelo discriminativo, puede asignar etiquetas incorrectas a entidades ambiguas o fuera de dominio; no hay medicion de falsos positivos ni falsos negativos.
- Limitacion de idioma: el modelo base es uncased y mayoritariamente ingles; el rendimiento en castellano o en otros idiomas no esta verificado y probablemente sea inferior.
- Limite de contexto: 512 tokens. Los mensajes o documentos mas largos deben truncarse o dividirse, con la consiguiente perdida de entidades en los fragmentos descartados.
- Licencia: Apache 2.0, permisiva para uso comercial, siempre que se conserve el aviso de licencia. No obstante, la ausencia de documentacion sobre los datos de entrenamiento impide verificar la procedencia del corpus, lo que puede ser un riesgo de cumplimiento en entornos regulados.
- Advertencias para produccion: no se recomienda su uso directo sin una evaluacion previa sobre un conjunto etiquetado propio. Ademas, el repositorio no registra descargas ni validacion de la comunidad, por lo que conviene auditar los pesos antes de integrarlos en un sistema critico.
- Ausencia de gobernanza del modelo: publicado por una cuenta individual, sin informe tecnico, sin versionado semantico y sin canal de soporte documentado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/franckzhuang/distilbert-message-ner
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Repositorio de Transformers: https://github.com/huggingface/transformers
- Documentacion de token classification en Transformers: https://huggingface.co/docs/transformers/tasks/token_classification
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Dataset de referencia CoNLL-2003 para NER: https://huggingface.co/datasets/eriktks/conll2003

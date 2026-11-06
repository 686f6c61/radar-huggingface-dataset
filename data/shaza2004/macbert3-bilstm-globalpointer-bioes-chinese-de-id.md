# Shaza2004/MacBERT3-BiLSTM-GlobalPointer-BIOES-Chinese-de-id

## Resumen

MacBERT3-BiLSTM-GlobalPointer-BIOES-Chinese-de-id es un modelo de identificacion y anonimizacion de datos personales (de-identification, de-ID) para texto en chino, publicado en Hugging Face por el usuario Shaza2004. Combina un codificador preentrenado MacBERT3 con una capa BiLSTM y una cabeza de prediccion de spans GlobalPointer, complementada por una cabeza auxiliar de clasificacion de tokens con esquema BIOES. El objetivo es detectar entidades nombradas sensibles (nombres, identificadores, localizaciones y similares) para poder enmascararlas antes de procesar o publicar el texto.

El modelo se distribuye como un checkpoint PyTorch (`model.pt`, aproximadamente 0,4 GB en el repositorio) acompanado de un fichero `thresholds.json` con umbrales por entidad ajustados sobre el conjunto de desarrollo. La cabeza principal es GlobalPointer, que formula la extraccion de entidades como una tarea de prediccion de spans mediante atencion multiplicativa, mientras que la cabeza BIOES actua unicamente como perdida auxiliar durante el entrenamiento. El checkpoint publicado corresponde al mejor resultado en F1 micro de span exacto sobre dev.

La relevancia del modelo es acotada y muy especifica: no es un modelo generativo ni de proposito general, sino un componente de pipeline para cumplimiento de privacidad en castellano tecnico, orientado a entornos donde se procesan documentos chinos (registros medicos, contratos, logs) y se necesita una capa de redaccion previa. La informacion publica disponible es muy limitada: no hay model card detallada, no se declaran licencia, idiomas ni pipeline, y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder MacBERT3 + BiLSTM + cabeza GlobalPointer (span prediction) con cabeza auxiliar BIOES de clasificacion de tokens |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende de la configuracion de MacBERT3 subyacente y del truncado aplicado en entrenamiento) |
| Tipos de cuantizacion | no disponible (checkpoint en PyTorch, `model.pt`); no se publican pesos GGUF ni ONNX |
| Idiomas soportados | chino (inferido del nombre del modelo y del uso de MacBERT3); no declarado explicitamente en la model card |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`model.pt`) y `thresholds.json` con umbrales por entidad |

## Arquitectura y entrenamiento

La arquitectura sigue el patron de extraccion de entidades como prediccion de spans. El texto pasa por el encoder MacBERT3, que proporciona representaciones contextuales de token; sobre ellas se aplica una capa BiLSTM que modela dependencias secuenciales en ambas direcciones y refina la representacion para la tarea. La cabeza principal es GlobalPointer, que puntua pares (inicio, fin) mediante una forma de atencion multiplicativa y produce directamente spans candidatos, evitando la ambiguedad de decodificacion tipica de los esquemas BIO/BIOES. Paralelamente, una cabeza de clasificacion de tokens con etiquetado BIOES se entrena como perdida auxiliar, lo que actua como regularizador y aporta senal a nivel de token.

El proceso de inferencia aplica umbrales por tipo de entidad cargados desde `thresholds.json`, calibrados sobre el conjunto de desarrollo, lo que permite ajustar el equilibrio entre precision y recall por entidad sin reentrenar. El checkpoint publicado es el de mejor F1 micro de span exacto en dev. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, el regimen de ajuste (learning rate, epochs) ni si hubo etapas de RLHF o DPO; al tratarse de una tarea extractiva, no se espera alineamiento por preferencias.

## Capacidades

- Deteccion de spans de entidades sensibles en texto chino (nombres de persona, organizaciones, localizaciones e identificadores, segun el conjunto de etiquetas del entrenamiento, no detallado en la model card).
- Prediccion de spans con cabeza GlobalPointer, lo que permite manejar entidades solapadas o de longitud variable mejor que un etiquetado BIO puro.
- Clasificacion auxiliar a nivel de token con esquema BIOES como senal complementaria.
- Ajuste de sensibilidad por entidad mediante umbrales calibrados en dev (`thresholds.json`).
- No soporta generacion de texto, tool calling, function calling, razonamiento multi-paso ni capacidades de agente.
- No dispone de vision, audio ni modo de pensamiento (thinking mode).
- Capacidad multilingue no declarada; el uso de MacBERT3 y el nombre del modelo apuntan a chino como unico idioma de trabajo.

## Casos de uso

- Redaccion de documentos antes de publicacion: el modelo detecta spans de datos personales en textos chinos y permite sustituirlos por marcadores antes de liberar el corpus, reduciendo el riesgo de reidentificacion.
- Cumplimiento de privacidad en pipelines de datos: se inserta como etapa previa a un LLM o a un sistema de analitica, de modo que el texto que llega a etapas posteriores ya esta anonimizado.
- Preprocesado de registros medicos o legales en chino: permite enmascarar nombres de pacientes y profesionales, direcciones e identificadores antes de almacenar o compartir los documentos entre equipos.
- Anonimizacion de logs y trazas de aplicaciones: extrae entidades con forma de nombre o identificador en mensajes de error y registros de auditoria antes de enviarlos a sistemas de observabilidad externos.
- Construccion de datasets de investigacion: facilita la desidentificacion de corpus textuales chinos para su uso en entrenamiento o evaluacion sin exponer datos personales.
- Capa de proteccion en atencion al cliente automatizada: filtra la entrada del usuario para que los datos sensibles no se persistan en el historial de conversacion ni en las bases de datos del chatbot.
- Auditoria de fuga de datos: se ejecuta sobre exportaciones de texto para localizar posibles datos personales que hayan escapado a entornos no controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente indica que el checkpoint seleccionado es el de mejor F1 micro de span exacto sobre el conjunto de desarrollo, sin proporcionar el valor numerico ni comparaciones con otros sistemas.

## Requisitos de hardware

- VRAM estimada: no disponible con precision al no declararse el numero de parametros; el repositorio ocupa 0,4 GB, lo que sugiere un modelo de tamanio moderado que probablemente cabe en GPUs de consumo con cuantizaciones o incluso en CPU para inferencia por lotes.
- GPU recomendadas: no especificadas por el autor; para un encoder tipo MacBERT3 con BiLSTM, una RTX 3090 o RTX 4090 es mas que suficiente en fp16, y una A100 o H100 solo aportaria ventaja en throughput por lotes grandes.
- Cabe en GPU de consumo: previsiblemente si, dado el tamanio del checkpoint, aunque no se publican requisitos oficiales.
- Opciones de despliegue: al ser un checkpoint PyTorch con cabezas personalizadas (GlobalPointer y BiLSTM), requiere cargar el codigo del autor; no hay soporte directo en vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos. El despliegue natural es via PyTorch o TorchScript/ONNX si se exporta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MacBERT3-BiLSTM-GlobalPointer-BIOES-Chinese-de-id | Encoder + GlobalPointer para NER/de-ID en chino | no disponible | no disponible | no disponible | Hugging Face, 0 descargas |
| BERT-base-chinese + CRF (NER generico) | Encoder + CRF | ~102 M | 512 tokens | Apache 2.0 (habitual) | Ampliamente disponible |
| spaCy zh / modelos NER de zh-core-web | Pipeline NER | no disponible | variable | MIT (habitual) | Disponible via spaCy |
| Modelos de de-ID clinico en chino (p. ej. variantes de RoBERTa-wwm) | Encoder + clasificacion | ~100 M | 512 tokens | variable | Depende del autor |

La comparacion es orientativa: no se dispone de datos de rendimiento del modelo evaluado, por lo que no es posible establecer una jerarquia cuantitativa frente a las alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad, por lo que no deberia desplegarse en produccion sin una evaluacion propia sobre el dominio objetivo.
- Licencia no declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor o tratar el modelo como no licenciado para fines productivos.
- Idiomas no declarados formalmente: aunque el nombre y el encoder sugieren chino, no se documenta el alcance real ni el comportamiento en texto mixto chino-ingles.
- Model card minima: no se detallan el conjunto de etiquetas, el esquema de anonimizacion, la composicion del dataset ni el proceso de calibracion de umbrales, lo que dificulta reproducir o auditar el comportamiento.
- Riesgo de falsos negativos en de-ID: cualquier entidad no detectada implica una fuga de datos personales; en entornos regulados se recomienda combinar con reglas deterministas y revision humana.
- Riesgo de falsos positivos: los umbrales calibrados en un dominio concreto pueden sobrerredactar texto en otros dominios, degradando la utilidad del corpus.
- Sesgos: al no documentarse la procedencia de los datos de entrenamiento, no es posible evaluar sesgos demograficos o de dominio; los modelos NER en chino suelen tener peor rendimiento en nombres poco frecuentes y en variantes dialectales.
- Dependencia de codigo personalizado: las cabezas GlobalPointer y BiLSTM no son estandar, lo que complica la integracion en frameworks de serving genericos y exige mantener el codigo del autor.
- Sin garantias de mantenimiento: el repositorio registra 0 descargas y 0 likes, y no hay indicios de soporte activo.

## Enlaces

- Hugging Face: https://huggingface.co/Shaza2004/MacBERT3-BiLSTM-GlobalPointer-BIOES-Chinese-de-id
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo.

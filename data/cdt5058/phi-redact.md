# CDT5058/phi-redact

## Resumen

phi-redact es un clasificador de tokens basado en BERT-mini (arquitectura `google/bert_uncased_L-4_H-256_A-4`, 4 capas, 256 dimensiones ocultas, 4 cabezas de atencion) con 11.135.865 parametros, publicado por el usuario CDT5058 en HuggingFace. Su tarea es la deteccion de informacion personal identificable (PII) e informacion sanitaria protegida (PHI) en texto en ingles, con un esquema de 30 tipos de entidad y etiquetado BIOES (121 etiquetas: 30 tipos x 4 posiciones + `O`). Se distribuye bajo licencia Apache-2.0 y esta disenado explicitamente para inferencia en dispositivo (ONNX, Core ML, LiteRT), de modo que los datos sensibles no abandonen el equipo.

El modelo se obtuvo por destilacion de conocimiento (alpha=0,7) desde un profesor `distilbert-base-uncased` de 66 M de parametros, y se entreno sobre aproximadamente 157.000 documentos que cubren notas clinicas sinteticas, textos de beneficios gubernamentales, ensayos de estudiantes y prosa estilo Wikipedia. Su longitud maxima de secuencia es de 256 tokens y su vocabulario es el WordPiece de `bert-base-uncased` (30.522 piezas). El peso en fp32 ocupa 44,5 MB y en fp16 22,3 MB, con estimaciones de 11,2 MB en int8 (LiteRT) y 5,6 MB en 4 bits (Core ML).

Es relevante porque ofrece una alternativa de muy bajo coste computacional para pipelines de redaccion y anonimizacion que hasta ahora se apoyaban en modelos generativos o en reglas basadas en expresiones regulares. En la comparativa publicada por el propio autor, queda practicamente empatado con Desert Ant Redact v0.4.0 en su compuesto de cinco benchmarks en ingles (86,1 % frente a 86,5 %) con la mitad de parametros y la mitad de huella en dispositivo, y con licencia Apache-2.0 en lugar de source-available. El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe todavia validacion independiente por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-mini (`google/bert_uncased_L-4_H-256_A-4`): transformer encoder de 4 capas, 256 de dimension oculta, 4 cabezas de atencion |
| Parametros totales | 11.135.865 (11,13 M) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 256 tokens (longitud maxima de secuencia) |
| Tipos de cuantizacion | fp32 (44,5 MB), fp16 (22,3 MB), int8 para LiteRT (~11,2 MB), 4 bits para Core ML (~5,6 MB) |
| Idiomas soportados | ingles unicamente (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX |
| Tarea (pipeline) | token-classification (reconocimiento de entidades nombradas) |
| Etiquetas | 121 etiquetas BIOES (30 tipos de entidad x 4 posiciones + `O`) |
| Vocabulario | 30.522 piezas WordPiece (`bert-base-uncased`) |
| Tamano del repositorio | 0,3 GB |
| Fecha de creacion | 25 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder tipo BERT en su variante mini: 4 capas, 256 unidades ocultas y 4 cabezas de atencion, sin mecanismos de atencion lineal ni decodificacion especulativa. Sobre la representacion del token especial `[CLS]` (o sobre la salida por token, segun la implementacion habitual de token-classification) se aplica una cabeza de clasificacion con 121 etiquetas BIOES. Los tipos de entidad cubiertos por el esquema son: `NAME_PATIENT`, `NAME_FAMILY`, `NAME_PROVIDER`, `DATE`, `ADDRESS`, `PHONE`, `EMAIL`, `SSN`, `MRN`, `HEALTHPLAN`, `ACCOUNT`, `IDNUM`, `LICENSE`, `EMPLOYER`, `PROFESSION`, `AGE`, `CITY`, `STATE`, `COUNTRY`, `ZIP`, `URL`, `IP`, `DEVICE`, `ROUTING_NUMBER`, `IBAN`, `CREDITCARD`, `HOSPITAL`, `FAX`, `PASSPORT` y `VIN`. La model card menciona "29 tipos de entidad" en la introduccion y "30 tipos" en la seccion del esquema; dado que 121 = 30 x 4 + 1, el recuento coherente con el etiquetado es 30. El tipo `TAX_ID` figura en el diseno del esquema pero no en ninguna fuente de entrenamiento con licencia comercialmente segura para la version v7, por lo que el modelo no emitira predicciones de ese tipo; el autor indica que la correccion esta planificada para v8.

El entrenamiento se realizo por destilacion de conocimiento con alpha=0,7 desde un profesor `distilbert-base-uncased` de 66 M de parametros, configurado con 10 epocas, tamano de lote 32, tasa de aprendizaje 3e-5, programacion coseno, suavizado de etiquetas de 0,05 y entrenamiento en GPU A100. La model card se interrumpe en ese punto, por lo que los hiperparametros del estudiante (epocas, lote, tasa de aprendizaje, funcion de perdida combinada) no estan disponibles. Los datos de entrenamiento suman aproximadamente 157.000 documentos, todos ellos con licencia CC-BY 4.0 o CC-BY-SA 4.0 y sin datos reales de pacientes: 20.000 notas clinicas sinteticas generadas con `gen_synth.py`, unas 5.400 muestras de Learning Agency Lab PII (Kaggle), 20.000 documentos sinteticos de beneficios gubernamentales (`govsynth`), 10.000 textos sinteticos de `essay_names.jsonl`, 50.000 del split de entrenamiento de FewNERD, unas 20.000 del split en ingles de WikiANN, unas 3.400 de WNUT-17 y 50.000 del split de entrenamiento de Nemotron-PII. Se excluyeron explicitamente `ai4privacy/pii-masking-400k` (licencia no comercial, fuera de entrenamiento y evaluacion) y MultiNERD (CC-BY-NC-SA 4.0, solo evaluacion).

## Capacidades

- Deteccion de entidades PII y PHI en texto en ingles sobre 30 tipos predefinidos, con etiquetado a nivel de span (BIOES).
- Clasificacion por token orientada a redaccion: cada entidad detectada puede sustituirse, enmascararse o tokenizarse en un paso posterior del pipeline.
- Cobertura especifica del dominio clinico: nombres de paciente, familia y profesional, numero de historia clinica (`MRN`), plan de salud (`HEALTHPLAN`), hospital, fax y edad.
- Cobertura de identificadores administrativos y financieros: `SSN`, `ACCOUNT`, `IDNUM`, `LICENSE`, `ROUTING_NUMBER`, `IBAN`, `CREDITCARD`, `PASSPORT` y `VIN`.
- Cobertura de identificadores de contacto y red: `PHONE`, `EMAIL`, `ADDRESS`, `CITY`, `STATE`, `COUNTRY`, `ZIP`, `URL` e `IP`.
- Inferencia local en dispositivo: exportable a ONNX, Core ML y LiteRT, sin llamadas a servicios externos.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision ni audio: es exclusivamente un modelo discriminativo de etiquetado de secuencias.
- No soporta tool calling, function calling ni razonamiento multi-paso. Tampoco dispone de modo "thinking".
- No es multilingue: la model card declara soporte exclusivo de ingles.

## Casos de uso

- Redaccion de PHI en notas clinicas antes de almacenarlas: el modelo marca nombres de paciente, MRN, fechas y direcciones en cada fragmento de hasta 256 tokens, de modo que la nota se puede guardar o enviar a un sistema de historia clinica electronica ya desidentificada. Es adecuado porque su dominio de entrenamiento principal son notas clinicas sinteticas y porque no requiere sacar el texto de la infraestructura propia.
- Proxy de enmascaramiento previo a un LLM de terceros: se inserta como paso intermedio entre la aplicacion y un proveedor tipo OpenAI o Anthropic, sustituyendo entidades por tokens sinteticos antes de que la peticion salga de la red y rehidratando la respuesta a la vuelta. Encaja por su huella de 5,6-11,2 MB y su capacidad de ejecucion en CPU.
- Anonimizacion de corpus para investigacion clinica: se procesa un lote de documentos, se aplica chunking con solapamiento para respetar el limite de 256 tokens y se eliminan spans sensibles antes de publicar el dataset. El recall de 0,860 de F1 micro en Nemotron-PII y de 84,3 % en WikiANN da una referencia cuantitativa para dimensionar la revision manual posterior.
- Cumplimiento de GDPR o CCPA en formularios de admision y atencion al cliente: el modelo cubre `EMAIL`, `PHONE`, `ADDRESS`, `IBAN`, `CREDITCARD` y `ROUTING_NUMBER`, lo que permite limpiar registros de contacto antes de exportarlos a analitica.
- Tramitacion de beneficios publicos: el corpus `govsynth` (SNAP, Medicaid, WIC) es una de las fuentes de entrenamiento, con recall declarado del 100 % sobre ese benchmark sintetico, lo que lo hace apto para desidentificar expedientes de gestion de casos.
- Desidentificacion de textos educativos: los ensayos de estudiantes aparecen en el entrenamiento mediante el corpus de Learning Agency Lab y `essay_names.jsonl`; el modelo puede usarse para eliminar nombres y datos personales de trabajos antes de compartirlos con terceros.
- Limpieza de logs y telemetria: integrado en un recolector de logs en Go, Java o Python, permite eliminar `IP`, `EMAIL`, `URL` y credenciales de identificacion antes de enviar los eventos a una plataforma de observabilidad externa.
- Aplicaciones moviles de salud con inferencia en el dispositivo: la exportacion a Core ML (4 bits, ~5,6 MB) y LiteRT (int8, ~11,2 MB) permite ejecutar la deteccion en el propio telefono, sin conexion y sin enviar texto a un servidor.
- Preprocesamiento de documentos financieros y contratos: la cobertura de `IBAN`, `ROUTING_NUMBER`, `ACCOUNT` y `CREDITCARD` permite anonimizar extractos y expedientes antes de pasarlos a un sistema de extraccion de datos.

## Benchmarks y rendimiento

Puntuacion estricta a nivel de span: una prediccion solo cuenta si coinciden exactamente los limites de caracteres y la etiqueta.

| Benchmark | Recall | F1 | Notas |
|---|---|---|---|
| WikiANN (EN, nombres) | 84,3 % | 0,775 | CC-BY-SA 3.0; comparable directamente con Desert Ant |
| FewNERD (EN, nombres) | 85,9 % | 0,782 | CC-BY-SA 4.0; nombres en prosa de Wikipedia |
| LA essays | 65,9 % | 0,757 (micro F1) | CC-BY 4.0; prosa informal de estudiantes |
| govsynth (beneficios gubernamentales) | 100 % | 1,000 | Sintetico; dominio principal de despliegue |
| MultiNERD (solo evaluacion) | 94,3 % | no disponible | CC-BY-NC-SA 4.0; no usado en entrenamiento |
| Compuesto (media de recall de 5 benchmarks) | 86,1 % | no aplica | Media de WikiANN, FewNERD, LA essays, govsynth y MultiNERD |

Nemotron-PII (CC-BY 4.0), primera ejecucion valida: 13.134 entidades sobre 25 tipos en 2.000 documentos de test, con F1 micro de 0,860 y recall de 0,843.

| Entidad | F1 | Entidad | F1 |
|---|---|---|---|
| MRN | 0,951 | IDNUM | 0,908 |
| ADDRESS | 0,949 | EMAIL | 0,905 |
| NAME_PATIENT | 0,944 | CREDITCARD | 0,905 |
| NAME_FAMILY | 0,937 | ROUTING_NUMBER | 0,876 |
| LICENSE | 0,920 | DATE | 0,859 |
| COUNTRY | 0,919 | URL | 0,828 |
| SSN | 0,908 | DEVICE | 0,791 |
| CITY | 0,904 | PROFESSION | 0,494 |

Puntos debiles declarados por el autor: `PROFESSION` presenta F1 de 0,494 con precision de 0,413 porque el modelo dispara en exceso sobre sustantivos de oficio en contextos que no son PII ("She saw a doctor" frente a "Occupation: Doctor"). En `URL`, el F1 es de 0,828 en texto formal (Nemotron) pero el recall cae al 31,8 % en los ensayos informales de LA essays. No se han publicado datos de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 44,5 MB en fp32, 22,3 MB en fp16, ~11,2 MB en int8 y ~5,6 MB en 4 bits. Con una secuencia maxima de 256 tokens y lotes moderados, el consumo total del runtime se mantiene por debajo de 1 GB en cualquier precision; estas cifras de VRAM total son una estimacion a partir de los tamanos de pesos publicados, no un dato medido.
- GPU recomendadas: no hay requisitos especificos publicados. Por tamano, el modelo cabe holgadamente en cualquier GPU, incluidas A100 y H100 si se despliega a gran escala, aunque no las necesita.
- Cabe en GPU de consumo: si, en cualquier GPU de consumo actual e incluso en GPUs integradas, dada la huella de menos de 50 MB de pesos.
- Ejecucion en CPU: viable en solitario; el modelo no requiere acelerador para inferencia en tiempo real con lotes pequenos.
- Aceleradores moviles: el autor contempla Core ML (Apple) y LiteRT (Android) como destinos de despliegue.
- Opciones de despliegue: ONNX Runtime para el artefacto ONNX, Core ML y LiteRT para movil, y la via habitual de Transformers con los pesos safetensors. Las herramientas para modelos generativos (llama.cpp, Ollama, vLLM, TGI) no son el cauce natural de un clasificador de tokens BERT de 11 M de parametros; no hay informacion publicada sobre su uso con este modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Metrica | phi-redact v7 | Desert Ant Redact v0.4.0 (EN) | Profesor DistilBERT (`distilbert-base-uncased`) |
|---|---|---|---|
| Parametros | 11,13 M | 23 M | 66 M |
| Recall de nombres en WikiANN | 84,3 % | 69,5 % | no disponible |
| Recall de nombres en MultiNERD | 94,3 % | 94,9 % | no disponible |
| Compuesto de 5 benchmarks | 86,1 % | 86,5 % | no disponible |
| Tamano estimado en 4 bits | ~5,6 MB | 11,6 MB | no aplica |
| Idiomas | solo ingles | 27 idiomas | solo ingles |
| Licencia | Apache-2.0 | source-available | Apache-2.0 |

Los resultados de Desert Ant y del profesor provienen exclusivamente de las tablas publicadas en la model card de phi-redact; no se han verificado de forma independiente. Fuera del ambito de modelos, en la busqueda web aparecen herramientas de redaccion comparables en proposito pero no en arquitectura: `philterd/phileas` (biblioteca Java de redaccion de PII y PHI) y `DilawarShafiq/phi-redactor` (proxy de enmascaramiento de PHI para proveedores de LLM), que no son modelos entrenados y por tanto no admiten una comparacion directa de parametros o benchmarks.

## Limitaciones y advertencias

- El propio autor declara que no es una solucion de desidentificacion certificada: no cumple los metodos HIPAA Expert Determination ni Safe Harbor. Debe evaluarse sobre datos propios antes de usarlo en contextos sensibles desde el punto de vista regulatorio.
- Riesgo de fuga de PHI: con recalls en el rango del 84-86 % en benchmarks estandar, una parte de las entidades sensibles no se detectara. No debe emplearse como unico control de privacidad ni como sustituto de una revision humana en flujos de cumplimiento.
- Idioma: solo ingles. No debe usarse con texto en castellano ni en otros idiomas sin un reentrenamiento o evaluacion especifica.
- Longitud de contexto limitada a 256 tokens: los documentos largos requieren fragmentacion, con riesgo de perder entidades que crucen las fronteras entre fragmentos o de degradar la coherencia del contexto local.
- `PROFESSION`: F1 de 0,494 y precision de 0,413; el modelo dispara en exceso sobre oficios mencionados de forma no identificativa. Problematico si el corpus es intensivo en ocupaciones.
- `URL` en prosa informal: recall de solo el 31,8 % en ensayos de estudiantes, frente a 0,828 de F1 en texto formal.
- `TAX_ID`: incluido en el diseno del esquema pero ausente del entrenamiento en la v7 por falta de fuente con licencia comercialmente segura; el modelo no producira predicciones de ese tipo. Correccion prevista para la v8.
- `DEVICE` (0,791) y `DATE` (0,859) presentan F1 claramente inferior al resto de entidades principales en Nemotron-PII.
- Discrepancia en la documentacion: la introduccion de la model card cita 29 tipos de entidad mientras que la seccion del esquema y el recuento de etiquetas BIOES (121 = 30 x 4 + 1) implican 30.
- Procedimiento de entrenamiento incompleto: la model card se interrumpe en la configuracion del profesor, por lo que no se detallan los hiperparametros del estudiante ni la composicion exacta de la perdida de destilacion.
- Sesgos: no se documentan sesgos especificos en la informacion disponible. Como riesgo derivado del corpus, parte de los datos de nombres procede de Wikipedia (WikiANN, FewNERD), lo que puede infrarrepresentar nombres no occidentales o poco frecuentes en ese dominio.
- Datos de entrenamiento totalmente sinteticos o de licencia abierta, sin datos reales de pacientes; esto limita el realismo de las notas clinicas frente a texto clinico real.
- Adopcion nula: 0 descargas y 0 "likes" en HuggingFace, sin evaluaciones independientes ni reportes de terceros.
- Licencia Apache-2.0: permite uso comercial y modificacion con obligacion de conservar el aviso de licencia. La restriccion relevante no es la licencia del modelo sino la de los corpus de evaluacion (MultiNERD es CC-BY-NC-SA 4.0) y el cumplimiento normativo en el dominio de uso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CDT5058/phi-redact
- Repositorio GitHub de `phi-redactor` (proxy de redaccion de PHI): https://github.com/DilawarShafiq/phi-redactor
- Repositorio GitHub de `phileas` (biblioteca Java de redaccion de PII y PHI): https://github.com/philterd/phileas
- Revision tecnica de herramientas open source de desidentificacion de PHI: https://intuitionlabs.ai/articles/open-source-phi-de-identification-tools
- Guia comparativa sobre LLM frente a reglas basadas en patrones para redaccion de PII y PHI: https://philterd.ai/guides/using-an-llm-or-pattern-based-rules-for-pii-phi-redaction/
- Sitio de Philterd (software de redaccion autoalojado): https://philterd.ai/
- Artefactos y corpus referenciados en la model card, sin URL publicada en la informacion disponible: `google/bert_uncased_L-4_H-256_A-4`, `distilbert-base-uncased`, `DFKI-SLT/few-nerd`, Nemotron-PII (nvidia), WNUT-17, WikiANN (EN), Learning Agency Lab PII (Kaggle), `ai4privacy/pii-masking-400k` (excluido) y MultiNERD (solo evaluacion).

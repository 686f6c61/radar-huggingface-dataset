# CDT5058/phi-redact-distilbert-teacher

## Resumen

phi-redact es un clasificador de tokens (token classification) en ingles disenado para detectar y permitir la redaccion de informacion personal identificable (PII) y informacion sanitaria protegida (PHI). Su autor, CDT5058, lo construye mediante destilacion de conocimiento a partir de un profesor DistilBERT y lo orienta explicitamente a despliegue en dispositivo (ONNX, Core ML, LiteRT), con el objetivo de que los datos sensibles no abandonen el hardware local. El modelo cubre 30 tipos de entidad con etiquetado BIOES (121 etiquetas en total) y se distribuye bajo licencia Apache-2.0.

Conviene aclarar una ambiguedad relevante del repositorio: el identificador `CDT5058/phi-redact-distilbert-teacher` y el recuento real de parametros en safetensors (66.455.929) corresponden al profesor DistilBERT, no al estudiante de 11,13 M de parametros que describe la model card. Es decir, la model card documenta el sistema completo y compara el estudiante (phi-redact v7) con alternativas, pero el checkpoint publicado en este repositorio parece ser el profesor de 66 M de parametros, con un tamano de repo de 1,6 GB.

El modelo es relevante ahora porque la redaccion de PII/PHI en local es un requisito creciente en sanidad, servicios publicos y tratamiento de datos regulados, donde enviar texto a APIs externas no siempre es viable. Su propuesta de valor es un consumo de memoria muy bajo (5,6 MB estimados en 4 bits) con un rendimiento cercano a alternativas mas grandes en ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-mini (google/bert_uncased_L-4_H-256_A-4) segun la model card; el repositorio contiene pesos de tipo DistilBERT profesor (66,4 M de parametros) |
| Parametros totales | 66.455.929 en safetensors (repositorio); 11,13 M segun la model card para el estudiante phi-redact |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens (longitud maxima de secuencia) |
| Tipos de cuantizacion | fp32 (44,5 MB), fp16 (22,3 MB), 4-bit Core ML (~5,6 MB estimado), int8 LiteRT (~11,2 MB estimado) para el estudiante; no se publican archivos GGUF |
| Idiomas soportados | ingles unicamente (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repositorio); el autor menciona ONNX, Core ML y LiteRT como objetivos de despliegue |
| Etiquetas | 121 etiquetas BIOES (30 tipos de entidad x 4 posiciones + O) |
| Vocabulario | 30.522 WordPiece (bert-base-uncased) |
| Tarea (pipeline) | token-classification (named-entity-recognition) |
| Tamano del repositorio | 1,6 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe un estudiante BERT-mini de 4 capas, 256 dimensiones ocultas y 4 cabezas de atencion, destilado con un peso de destilacion alpha=0,7 desde un profesor `distilbert-base-uncased`. El profesor se entreno durante 10 epocas, con batch de 32, learning rate 3e-5, scheduler coseno, label smoothing de 0,05 y en una GPU A100. La cabeza de clasificacion produce etiquetas en esquema BIOES sobre 30 tipos de entidad, con una longitud maxima de 256 tokens impuesta por el encoder.

El corpus de entrenamiento combina fuentes con licencias compatibles con uso comercial (CC-BY 4.0 y CC-BY-SA 4.0), sin datos reales de pacientes: notas clinicas sinteticas (20.000 documentos, con cobertura completa del esquema de 29 tipos), Learning Agency Lab PII de Kaggle (~5.400), `govsynth` de prestaciones publicas (~20.000, dominios SNAP/Medicaid/WIC), 10.000 documentos de prosa sintetica, split de entrenamiento de FewNERD (50.000), split de entrenamiento de WikiANN en ingles (~20.000), WNUT-17 (~3.400) y el split de entrenamiento de Nemotron-PII de NVIDIA (50.000). El autor excluye explicitamente `ai4privacy/pii-masking-400k` por licencia no comercial, y MultiNERD (CC-BY-NC-SA 4.0) se usa solo para evaluacion. El tipo de entidad TAX_ID aparece en el diseno del esquema pero no tiene fuente de entrenamiento comercialmente segura en la version v7, por lo que sus predicciones estan ausentes y la correccion esta prevista para la v8.

## Capacidades

- Clasificacion de tokens para reconocimiento de entidades nombradas orientado a PII/PHI en texto en ingles.
- Cobertura de 30 tipos de entidad: `NAME_PATIENT`, `NAME_FAMILY`, `NAME_PROVIDER`, `DATE`, `ADDRESS`, `PHONE`, `EMAIL`, `SSN`, `MRN`, `HEALTHPLAN`, `ACCOUNT`, `IDNUM`, `LICENSE`, `EMPLOYER`, `PROFESSION`, `AGE`, `CITY`, `STATE`, `COUNTRY`, `ZIP`, `URL`, `IP`, `DEVICE`, `ROUTING_NUMBER`, `IBAN`, `CREDITCARD`, `HOSPITAL`, `FAX`, `PASSPORT` y `VIN`.
- Etiquetado en esquema BIOES, lo que permite delimitar limites de entidad a nivel de caracter.
- Ejecucion en dispositivo: el autor indica despliegue mediante ONNX, Core ML y LiteRT, con huella estimada de 5,6 MB en 4 bits.
- No genera texto: no soporta tool calling, function calling, uso como agente, razonamiento multi-paso ni modo de pensamiento.
- No dispone de capacidades multimodales (ni vision ni audio).
- Multilingue: no, exclusivamente ingles.

## Casos de uso

- Redaccion de notas clinicas antes de su almacenamiento o analitica: el modelo marca `NAME_PATIENT`, `MRN`, `DATE`, `HOSPITAL` y `PHONE`, de modo que un paso posterior puede sustituirlos por marcadores; su F1 de 0,951 en `MRN` y 0,944 en `NAME_PATIENT` en Nemotron-PII lo hace adecuado para este flujo, que es ademas su dominio de despliegue principal.
- Tramitacion de prestaciones publicas (SNAP, Medicaid, WIC): el autor reporta recall del 100% y F1 de 1,000 sobre su benchmark sintetico `govsynth`, lo que indica un ajuste fuerte a formularios y expedientes administrativos de ese tipo.
- Preprocesado previo al envio de texto a APIs de modelos generativos: se detectan y enmascaran identificadores en el cliente antes de que el texto salga del entorno, aprovechando el despliegue local en Core ML o LiteRT.
- Anonimizacion de redacciones y trabajos de estudiantes en plataformas educativas: cubre nombres, correos y URLs del corpus Learning Agency Lab, con F1 micro de 0,757 en el conjunto de ensayos LA, aunque con recall bajo en URLs de prosa informal (0,318).
- Limpieza de registros financieros: deteccion de `IBAN`, `CREDITCARD`, `ROUTING_NUMBER` y `ACCOUNT` (F1 de 0,905 en tarjetas y 0,876 en numeros de ruta en Nemotron-PII) para cumplir politicas internas de tratamiento de datos de pago.
- Depuracion de logs y telemetria: identificacion de `IP`, `DEVICE`, `EMAIL` y `URL` en texto estructurado antes de exportar registros a sistemas de observabilidad.
- Asistencia a flujos de cumplimiento (con reservas): el propio autor advierte que no es una solucion certificada bajo HIPAA Expert Determination ni Safe Harbor, por lo que solo cabe como ayuda a la revision humana, nunca como sustituto.
- Filtrado de datos de entrenamiento: uso como clasificador auxiliar para descartar documentos con PII antes de incorporarlos a un corpus propio.

## Benchmarks y rendimiento

Evaluacion a nivel de span estricto: una prediccion solo cuenta si coinciden exactamente los limites de caracteres y la etiqueta.

| Benchmark | Recall | F1 | Notas |
|---|---|---|---|
| WikiANN (EN, recall de nombres) | 84,3% | 0,775 | CC-BY-SA 3.0 |
| FewNERD (EN, recall de nombres) | 85,9% | 0,782 | CC-BY-SA 4.0 |
| LA essays | 65,9% | 0,757 (micro F1) | CC-BY 4.0, prosa informal de estudiantes |
| govsynth (prestaciones publicas) | 100% | 1,000 | Sintetico, dominio principal de despliegue |
| MultiNERD (EN, solo evaluacion) | 94,3% | no disponible | CC-BY-NC-SA 4.0 |
| Composite (media de recall de 5 benchmarks) | 86,1% | no disponible | Ver nota |
| Nemotron-PII (2.000 documentos, 13.134 entidades, 25 tipos) | 0,843 | 0,860 (micro F1) | CC-BY 4.0 |

F1 por entidad seleccionada en Nemotron-PII:

| Entidad | F1 | Entidad | F1 |
|---|---|---|---|
| MRN | 0,951 | IDNUM | 0,908 |
| ADDRESS | 0,949 | SSN | 0,908 |
| NAME_PATIENT | 0,944 | EMAIL | 0,905 |
| NAME_FAMILY | 0,937 | CREDITCARD | 0,905 |
| LICENSE | 0,920 | ROUTING_NUMBER | 0,876 |
| COUNTRY | 0,919 | DATE | 0,859 |
| CITY | 0,904 | URL | 0,828 |
| DEVICE | 0,791 | PROFESSION | 0,494 |

El composite se calcula como la media de recall de WikiANN, FewNERD, LA essays, govsynth y MultiNERD. En MultiNERD, el recall de 94,3% queda a 0,6 puntos de Desert Ant (94,9%). El punto debil declarado es `PROFESSION` (F1 = 0,494, precision = 0,413), con falsos positivos sobre sustantivos de oficio en contextos no sensibles. La URL en prosa informal cae a un recall de 0,318 en LA essays, frente a F1 de 0,828 en texto formal.

## Requisitos de hardware

- El estudiante de 11,13 M de parametros ocupa 44,5 MB en fp32 y 22,3 MB en fp16; la estimacion en 4 bits para Core ML es de ~5,6 MB y la de int8 para LiteRT de ~11,2 MB.
- El checkpoint publicado en el repositorio (66,4 M de parametros, tipo DistilBERT) ronda los 266 MB en fp32 y 133 MB en fp16 de pesos puros; el repositorio completo ocupa 1,6 GB, presumiblemente por estados de optimizador u otros artefactos.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.), en iGPU y en CPU. Es un modelo apto para movil mediante Core ML o LiteRT.
- Opciones de despliegue: `transformers` con `AutoModelForTokenClassification`, ONNX Runtime, Core ML y LiteRT. Herramientas de servido para modelos generativos como vLLM no son la via natural para este caso; TGI dispone de endpoint de token-classification, pero con 11 M de parametros no aporta ventaja frente a inferencia directa.
- No se publican datos de latencia ni de throughput en la informacion disponible.

## Comparativa con modelos similares

| Metrica | phi-redact v7 | Desert Ant Redact v0.4.0 (EN) | Profesor de este repositorio (DistilBERT, 66 M) |
|---|---|---|---|
| Recall de nombres en WikiANN | 84,3% | 69,5% | no disponible |
| Recall de nombres en MultiNERD | 94,3% | 94,9% | no disponible |
| Composite (5 benchmarks, recall) | 86,1% | 86,5% | no disponible |
| Parametros | 11,13 M | 23 M | 66,4 M |
| Tamano estimado en 4 bits | ~5,6 MB | 11,6 MB | no disponible |
| Idiomas | solo ingles | 27 idiomas | ingles |
| Licencia | Apache-2.0 | disponible como codigo fuente (source-available) | Apache-2.0 |
| Tipos de entidad | 30 (121 etiquetas BIOES) | no disponible | mismo esquema, no confirmado |

Segun el autor, phi-redact v7 esta practicamente empatado con el composite ingles de Desert Ant con la mitad de parametros y la mitad de huella en dispositivo, a costa de renunciar al soporte multilingue. No se dispone de comparaciones con otros modelos de redaccion en la informacion proporcionada.

## Limitaciones y advertencias

- No es una solucion certificada de desidentificacion: el autor indica explicitamente que no cumple HIPAA Expert Determination ni Safe Harbor y que debe evaluarse sobre datos propios antes de usarla en contextos de cumplimiento.
- Solo ingles. Cualquier texto en otro idioma queda fuera de su alcance.
- Ventana de 256 tokens: los documentos largos requieren fragmentacion, con riesgo de entidades cortadas en los limites de fragmento.
- No genera texto, por lo que la alucinacion no aplica en el sentido generativo; el riesgo equivalente son falsos negativos (PII no detectada) y falsos positivos (texto no sensible marcado).
- `PROFESSION` es un punto debil conocido: F1 de 0,494 y precision de 0,413, con sobreactivacion en frases donde aparece un oficio sin valor identificativo.
- `URL` en prosa informal: recall de 0,318 en ensayos de estudiantes, frente a 0,828 de F1 en texto formal.
- `TAX_ID` esta en el esquema pero no se entrena en la v7, de modo que no emitira predicciones para ese tipo.
- Todo el entrenamiento usa datos sinteticos o de licencia abierta, sin pacientes reales: el rendimiento puede degradarse en dominios con distribuciones alejadas del corpus (por ejemplo, jerga clinica especifica de una institucion).
- El repositorio no tiene descargas ni likes, y la model card aparece truncada en la seccion de procedimiento de entrenamiento: no hay validacion independiente de terceros.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero las fuentes de datos excluidas (ai4privacy, y MultiNERD solo para evaluacion) condicionan la reproducibilidad del entrenamiento, no el uso del modelo publicado.
- Ambiguedad de artefacto: el repositorio se denomina "distilbert-teacher" y contiene 66,4 M de parametros, mientras que la model card describe el estudiante de 11,13 M. Verifique que checkpoint esta cargando antes de desplegar en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/CDT5058/phi-redact-distilbert-teacher
- No se han encontrado en la busqueda web enlaces relevantes adicionales (paper, blog, repositorio o demo) asociados a este modelo; los resultados obtenidos no guardan relacion con el.

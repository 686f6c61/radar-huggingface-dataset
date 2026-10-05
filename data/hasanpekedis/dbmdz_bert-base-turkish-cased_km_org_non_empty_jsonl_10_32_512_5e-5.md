# HasanPekedis/dbmdz_bert-base-turkish-cased_km_org_non_empty_jsonl_10_32_512_5e-5

## Resumen

El modelo `HasanPekedis/dbmdz_bert-base-turkish-cased_km_org_non_empty_jsonl_10_32_512_5e-5` es un ajuste fino de `dbmdz/bert-base-turkish-cased` para reconocimiento de entidades nombradas (NER) en turco, restringido a una unica categoria: organizaciones (ORG). Lo publica el usuario HasanPekedis en Hugging Face y esta pensado para extraer menciones de instituciones gubernamentales, universidades, empresas, partidos politicos, clubes deportivos, medios de comunicacion y organismos internacionales en texto turco.

Se trata de un modelo denso de tipo encoder (familia BERT) con 110.029.059 parametros, un tamano coherente con la configuracion BERT-base, y un repositorio de 0,4 GB en formato safetensors. Al ser un modelo de clasificacion de tokens y no un modelo generativo, su uso esperado es el etiquetado de secuencias en pipelines de extraccion de informacion, no la generacion de texto ni el razonamiento multi-paso.

Su relevancia es acotada pero concreta: cubre un caso de uso poco atendido como es el NER monoentidad en turco, un idioma con menos recursos que el ingles o el castellano en el ecosistema de PLN. El autor reporta un F1 de 0,9148 en el conjunto de test (1271 entidades ORG), con recall (0,9331) superior a precision (0,8971).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only tipo BERT (modelo denso) |
| Parametros totales | 110.029.059 |
| Parametros activos | No aplicable (modelo denso, no es MoE) |
| Longitud de contexto | No confirmada en la model card; el identificador del repositorio sugiere entrenamiento con secuencias de 512 tokens |
| Tipos de cuantizacion | No disponible (no se documenta ningun artefacto cuantizado en el repositorio) |
| Idiomas soportados | Turco (unico idioma declarado en la model card; el campo de idiomas del repositorio esta vacio) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tarea | Clasificacion de tokens (NER), etiqueta unica `ORG` |
| Modelo base | dbmdz/bert-base-turkish-cased |
| Tamano del repositorio | 0,4 GB |
| Fecha de creacion | 2026-10-05 |
| Ultima actualizacion | 2026-10-05 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base `dbmdz/bert-base-turkish-cased`: un transformer encoder-only con atencion bidireccional completa, entrenado originalmente sobre corpus en turco. El ajuste fino anade una cabeza de clasificacion de tokens sobre la salida del encoder para etiquetar cada token con la clase `ORG` o con la clase exterior. El recuento exacto de capas, dimension oculta y cabezas de atencion no se detalla en la informacion proporcionada; el total de 110.029.059 parametros es consistente con la topologia estandar de BERT-base, pero no se confirma en la documentacion del autor.

El entrenamiento se realizo durante 10 epocas sobre un dataset cuyo nombre, segun el identificador del repositorio (`10_32_512_5e-5`), sugiere 10 epocas, batch de 32, longitud maxima de 512 tokens y tasa de aprendizaje 5e-5; solo el numero de epocas queda confirmado en la model card. Los datos provienen de un fichero JSONL filtrado («non_empty») y el modelo se guardo en un entorno Kaggle. No se documenta el volumen total de tokens, la composicion del corpus, ni el uso de RLHF, DPO u otra fase de alineacion, algo esperable en un modelo de etiquetado. La perdida de entrenamiento cae de 0,251165 (epoca 1) a 0,001542 (epoca 10), mientras que la perdida de validacion repunta desde 0,101627 hasta 0,173966, lo que indica sobreajuste a partir de las primeras epocas sin degradacion apreciable del F1.

## Capacidades

- Reconocimiento de entidades de tipo organizacion (ORG) en texto turco: instituciones publicas, universidades, empresas, partidos, clubes deportivos, medios y organismos internacionales.
- Etiquetado a nivel de token con soporte para entidades multi-palabra, incluyendo expresiones con simbolos como `Procter & Gamble`.
- Clasificacion de secuencias de hasta 512 tokens (segun la configuracion inferida del identificador; no confirmada explicitamente).
- Ejecucion como modelo de clasificacion de tokens mediante `AutoModelForTokenClassification` y su tokenizer asociado.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling, function calling ni capacidades de agente: es un encoder discriminativo.
- No reconoce otras categorias de entidades (persona, lugar, fecha, cantidad) porque fue ajustado unicamente para la etiqueta `ORG`.
- Capacidad multilingue: no disponible; unicamente turco.

## Casos de uso

- Enriquecimiento de bases de datos periodisticas: procesar hemerotecas en turco y extraer automaticamente las organizaciones mencionadas en cada articulo para construir indices tematicos y redes de coocurrencia institucional.
- Monitorizacion de medios y analisis de reputacion: detectar en que piezas informativas aparece una empresa o institucion concreta y con que contexto, aprovechando el recall alto (0,9331) para no dejar menciones sin capturar.
- Cumplimiento normativo y KYC en turco: identificar razones sociales y organismos citados en documentacion contractual o expedientes para cotejarlos con listas de sanciones o registros mercantiles.
- Analisis de discurso politico: extraer partidos, ministerios y organismos internacionales mencionados en debates parlamentarios o programas electorales para estudios cuantitativos.
- Indexacion semantica previa a busqueda: preetiquetar entidades ORG en un corpus turco para alimentar un motor de busqueda o un sistema RAG que filtre por organizacion mencionada.
- Investigacion academica en PLN para turco: servir como linea base reproducible (F1 0,9148 en test) frente a modelos multilingues de mayor tamano en tareas de NER monoentidad.
- Depuracion de datasets: usar las predicciones para detectar anotaciones incompletas, ya que el modelo tiende a marcar entidades que la anotacion de referencia omite (precision inferior al recall).

## Benchmarks y rendimiento

Resultados reportados por el autor. No hay datos de MMLU, HumanEval, GSM8K ni otros benchmarks estandar, dado que no son aplicables a un modelo de clasificacion de tokens.

Evolucion por epoca en validacion:

| Epoca | Perdida entrenamiento | Perdida validacion | Precision | Recall | F1 |
|---|---|---|---|---|---|
| 1 | 0,251165 | 0,130171 | 0,822159 | 0,896154 | 0,857563 |
| 2 | 0,102426 | 0,101627 | 0,868828 | 0,906923 | 0,887467 |
| 3 | 0,062523 | 0,104501 | 0,878215 | 0,893077 | 0,885584 |
| 4 | 0,031639 | 0,126070 | 0,894453 | 0,893077 | 0,893764 |
| 5 | 0,015734 | 0,121988 | 0,890226 | 0,910769 | 0,900380 |
| 6 | 0,012244 | 0,138231 | 0,892119 | 0,896923 | 0,894515 |
| 7 | 0,005344 | 0,146756 | 0,885355 | 0,920769 | 0,902715 |
| 8 | 0,002650 | 0,166680 | 0,891729 | 0,912308 | 0,901901 |
| 9 | 0,003058 | 0,172414 | 0,891952 | 0,920769 | 0,906132 |
| 10 | 0,001542 | 0,173966 | 0,890800 | 0,916154 | 0,903299 |

Resultados en el conjunto de test (clase ORG):

| Metrica | Valor |
|---|---|
| Precision | 0,8971 |
| Recall | 0,9331 |
| F1 | 0,9148 |
| Soporte (entidades ORG) | 1271 |
| Micro avg / macro avg / weighted avg | 0,8971 / 0,9331 / 0,9148 |

No se han publicado resultados comparativos frente a otros modelos de NER turco en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,45 GB en FP32, 0,22 GB en FP16/BF16 y 0,11 GB en INT8, calculado sobre los 110 millones de parametros. No se publican mediciones reales de consumo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4090, T4, L4, A10, A100 y H100. No requiere aceleradores de gama alta.
- Inferencia en CPU: viable para lotes pequenos, dado el reducido numero de parametros; es la opcion habitual cuando el throughput no es critico.
- Opciones de despliegue: `transformers` con `AutoModelForTokenClassification` es la via directa; exportacion a ONNX Runtime o TorchScript para reducir latencia en produccion. El soporte nativo de vLLM y llama.cpp para clasificacion de tokens con arquitectura BERT es limitado o inexistente, por lo que requeriria conversiones no estandar.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

No se dispone de cifras verificadas de rendimiento, licencia ni contexto de los modelos alternativos dentro de la informacion proporcionada. La siguiente tabla recoge unicamente caracteristicas estructurales ampliamente conocidas, marcadas como no verificadas en esta busqueda.

| Modelo | Parametros | Contexto | Tarea | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| Este modelo (HasanPekedis) | 110.029.059 | 512 (inferido) | NER turco, solo ORG | No disponible | F1 0,9148 en test (reportado por el autor) |
| dbmdz/bert-base-turkish-cased | ~110 M | 512 | Modelo base, sin cabeza NER | No verificada | No aplicable |
| Alternativas de NER turco basadas en BERT (por ejemplo, ajustes publicos de BERT turco o XLM-R) | No disponible | No disponible | NER multietiqueta | No disponible | No disponible |

## Limitaciones y advertencias

- Cobertura de una sola etiqueta: solo reconoce `ORG`. No detecta personas, lugares, fechas ni cantidades, por lo que no sustituye a un sistema NER completo.
- Sobreajuste documentado: la perdida de validacion se degrada desde la epoca 2 (0,101627) hasta la 10 (0,173966) mientras la de entrenamiento cae a 0,001542.
- Sesgo precision-recall: con recall (0,9331) por encima de precision (0,8971), el modelo genera falsos positivos. En la evaluacion cualitativa etiqueta «Gillette» como organizacion cuando la anotacion de referencia no lo hace.
- Dependencia del dataset de entrenamiento: no se describe su composicion, dominio ni volumen, por lo que se desconoce su comportamiento fuera del genero textual de origen.
- Ambito linguistico restringido al turco; el campo de idiomas del repositorio esta vacio y no se garantiza ningun otro idioma.
- Licencia no declarada: sin licencia explicita no puede asumirse permiso para uso comercial ni redistribucion. Es un riesgo legal relevante antes de integrarlo en produccion.
- Riesgo de alucinacion en el sentido de falsos positivos: el modelo puede marcar como organizacion terminos que son marcas, productos o nombres comunes sin respaldo en la anotacion.
- Falta de validacion externa: el repositorio acumula 0 descargas y 0 «likes», no tiene pipeline declarado y las metricas proceden unicamente del autor; no hay evaluacion independiente.
- Metadatos anómalos: la fecha de creacion registrada (2026-10-05) es posterior a la fecha actual de referencia, lo que sugiere un problema de fechas en el repositorio o en su exportacion.
- Aviso de ejecucion en PyTorch recogido en la model card (`gather along dimension 0` sobre tensores escalares), sin impacto funcional segun el autor.
- Longitud de contexto: la ventana de 512 tokens implica truncado en documentos largos y perdida de entidades en las partes descartadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HasanPekedis/dbmdz_bert-base-turkish-cased_km_org_non_empty_jsonl_10_32_512_5e-5
- Modelo base: https://huggingface.co/dbmdz/bert-base-turkish-cased
- La busqueda web realizada no devolvio ningun enlace relevante sobre este modelo: los resultados obtenidos eran consultas en chino sin relacion con PLN. No se dispone de paper, blog, repositorio de codigo ni demo asociados.

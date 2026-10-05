# HasanPekedis/dbmdz_convbert-base-turkish-cased_km_org_non_empty_jsonl_4_32_512_5e-5

## Resumen

Este modelo es un ajuste fino (fine-tuning) del checkpoint `dbmdz/bert-base-turkish-cased` para la tarea de reconocimiento de entidades nombradas (NER) en turco, especializado exclusivamente en la detección de entidades de tipo ORG (organizacion). Lo publica el usuario HasanPekedis en HuggingFace y su nombre codifica los hiperparametros principales del entrenamiento: 4 epocas, batch de 32, longitud maxima de secuencia de 512 y tasa de aprendizaje de 5e-5. Con 106.817.931 parametros, es un modelo de clasificacion de tokens (token classification) que asigna una etiqueta BIO a cada token de entrada.

El problema que resuelve es acotado pero util en el ambito del procesamiento de lenguaje natural en turco: extraer automaticamente nombres de organizaciones (empresas, instituciones publicas, organismos) de texto no estructurado. El modelo no genera texto ni mantiene conversaciones; su salida es una secuencia de etiquetas sobre los tokens de entrada. Esto lo situa en la categoria de modelos encoder clasicos, no en la de modelos generativos.

Es relevante porque el turco es un idioma con menos recursos que el ingles en el ecosistema de modelos abiertos, y disponer de componentes especializados en una entidad concreta facilita construir pipelines de extraccion de informacion en dominios como noticias, documentacion legal o analisis financiero. Su tamano reducido (0,4 GB) y su formato safetensors lo hacen desplegable en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvBERT / BERT (encoder transformer; la model card indica "BERT / ConvBERT tabanli", conflicting con la etiqueta `convbert` del repositorio) |
| Parametros totales | 106.817.931 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (indicado en el nombre del modelo como longitud de entrenamiento; no confirmado explicitamente en la model card) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors) |
| Idiomas soportados | Turco (segun la model card; el repositorio de HuggingFace no declara idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card describe el modelo como basado en `dbmdz/bert-base-turkish-cased`, un encoder transformer en configuracion base con vocabulario en turco sensible a mayusculas (cased). La etiqueta del repositorio indica `convbert`, lo que sugiere que el checkpoint efectivo emplea el mecanismo de convolucion dinamica basada en spans caracteristico de ConvBERT, aunque la propia model card se refiere indistintamente a "BERT / ConvBERT". Esta ambiguedad no se resuelve con la informacion disponible.

El ajuste fino se realizo durante 4 epocas sobre un conjunto de datos etiquetado como `km_org_non_empty_jsonl`, aparentemente un corpus en formato JSONL con ejemplos no vacios de entidades ORG. La tarea es clasificacion de tokens con un esquema de etiquetado del que la model card no detalla el formato (probablemente BIO). No se documenta el numero de tokens de entrenamiento ni la composicion completa del dataset.

Los registros de entrenamiento muestran la evolucion de la perdida y las metricas: en la epoca 1, perdida de entrenamiento 0,345889 y F1 de validacion 0,869597; en la epoca 2, perdida 0,106849 y F1 0,911663 (mejor resultado); en la epoca 3, F1 0,902082; y en la epoca 4, perdida 0,037913 con F1 0,908408. El autor senala que la perdida de validacion deja de mejorar tras la epoca 2, lo que indica una tendencia leve al sobreajuste. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion, algo coherente con un modelo discriminativo de clasificacion.

## Capacidades

- Reconocimiento de entidades nombradas de tipo ORG en texto en turco, con asignacion de etiquetas a nivel de token.
- Deteccion de nombres de empresas, instituciones publicas y organismos (por ejemplo, "Merkez Bankasi", "Procter & Gamble", "Iller Bankasi", "Diyarbakir DGM").
- Clasificacion de secuencias de hasta 512 tokens (segun la longitud indicada en el nombre del modelo).
- Manejo de texto con mayusculas y signos de puntuacion propios del turco (modelo cased).
- No soporta generacion de texto, tool calling, function calling ni razonamiento multi-paso.
- No dispone de modo de pensamiento (thinking mode), vision ni audio.
- Capacidad multilingue: restringida al turco segun la model card; no se declaran otros idiomas.
- No es un modelo conversacional ni de instrucciones; no gestiona dialogos multi-turno.

## Casos de uso

- Extraccion de organizaciones en articulos de prensa turca: el modelo puede procesar cada parrafo (hasta 512 tokens) y devolver las menciones de empresas e instituciones, alimentando un indice de entidades para busqueda o analisis de tendencias.
- Enriquecimiento de bases de datos documentales: aplicar el modelo sobre registros legales o administrativos en turco para poblar campos estructurados de organizacion (organismo emisor, empresa demandada, institucion reguladora).
- Monitorizacion de medios y analisis de reputacion: detectar que organizaciones aparecen en un corpus noticioso y con que frecuencia, usando la salida de etiquetas ORG como senal de mencion.
- Construccion de grafos de conocimiento: combinar las entidades ORG extraidas con otras entidades (personas, lugares) mediante un pipeline NER mas amplio para enlazar organizaciones con eventos y personas.
- Preprocesado para sistemas de cumplimiento normativo (compliance): identificar entidades organizativas en comunicaciones y documentos internos en turco antes de aplicar reglas de negocio.
- Anotacion asistida para equipos de datos: usar el modelo como preanotador en herramientas de etiquetado y reducir el esfuerzo manual de anotadores que revisan menciones ORG.
- Filtrado de menciones en motores de busqueda internos: extraer organizaciones de consultas o documentos para mejorar la recuperacion y el facetado por entidad.

## Benchmarks y rendimiento

La model card reporta resultados de evaluacion sobre un conjunto de test con 1271 entidades ORG:

| Entidad | Precision | Recall | F1 | Support |
|---|---|---|---|---|
| ORG | 0,9112 | 0,9205 | 0,9159 | 1271 |
| Micro Avg | 0,9112 | 0,9205 | 0,9159 | 1271 |
| Macro Avg | 0,9112 | 0,9205 | 0,9159 | 1271 |
| Weighted Avg | 0,9112 | 0,9205 | 0,9159 | 1271 |

Resumen global de test: precision 91,12 %, recall 92,05 %, F1 91,59 % sobre 1271 entidades ORG. El autor indica que el recall supera ligeramente a la precision, lo que implica que el modelo recupera la mayoria de menciones ORG a costa de generar algunos falsos positivos.

Evolucion por epoca en validacion:

| Epoca | Training Loss | Validation Loss | Precision | Recall | F1 |
|---|---|---|---|---|---|
| 1 | 0,345889 | 0,128905 | 0,830070 | 0,913077 | 0,869597 |
| 2 | 0,106849 | 0,092031 | 0,906464 | 0,916923 | 0,911663 |
| 3 | 0,067482 | 0,097361 | 0,904173 | 0,900000 | 0,902082 |
| 4 | 0,037913 | 0,100117 | 0,887097 | 0,930769 | 0,908408 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, algo esperable dado que se trata de un modelo de clasificacion de tokens y no de un modelo generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,43 GB en fp32 (107 M de parametros) y alrededor de 0,21 GB en fp16, sin contar el overhead de activaciones.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente; por ejemplo, GTX 1650, RTX 3050, RTX 4090, A100, H100. La eleccion depende mas del throughput deseado que de la memoria.
- Cabe sobradamente en GPU de consumo: si, en practicamente cualquier GPU consumer de los ultimos anos e incluso en CPU para cargas moderadas.
- Opciones de despliegue: HuggingFace Transformers, PyTorch, y servidores de inferencia como TorchServe, ONNX Runtime o FastAPI con transformers. No se documenta soporte especifico para vLLM, llama.cpp u Ollama; estos estan orientados a modelos generativos, por lo que su uso no seria el habitual aqui. Para clasificacion de tokens tampoco aplica TGI en su modo estandar.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. En GPU consumer se pueden esperar latencias del orden de milisegundos por lote de secuencias de 512 tokens, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| HasanPekedis/dbmdz_convbert-base-turkish-cased... | 106,8 M | 512 (segun nombre) | NER ORG | Turco | no disponible | HuggingFace |
| dbmdz/bert-base-turkish-cased | ~110 M | 512 | Modelo base (MLM) | Turco | no disponible en la informacion | HuggingFace |
| Alternativas NER en turco | no disponible | no disponible | NER general | Turco | no disponible | HuggingFace |

El modelo comparable mas directo es su propio checkpoint base, `dbmdz/bert-base-turkish-cased`, que no realiza NER por si mismo y requiere un ajuste fino. No se dispone en la informacion proporcionada de resultados de otros modelos NER en turco para establecer una comparacion cuantitativa fiable, por lo que no se incluyen cifras adicionales.

## Limitaciones y advertencias

- El modelo detecta unicamente la entidad ORG; no reconoce personas (PER), lugares (LOC), fechas ni otras categorias, por lo que no sustituye a un NER general.
- Tendencia al sobreajuste a partir de la epoca 2, segun reconoce el propio autor: la perdida de validacion deja de descender mientras la de entrenamiento sigue bajando.
- El recall es ligeramente superior a la precision, lo que implica falsos positivos ocasionales al etiquetar menciones que no son organizaciones reales.
- Los ejemplos de evaluacion de la model card muestran al menos un caso de desajuste (mismatch) entre la etiqueta gold y la prediccion, lo que confirma que no hay acierto perfecto.
- Sesgos conocidos: no disponibles; no se documenta un analisis de sesgo por genero, origen o tipo de organizacion. El dataset de entrenamiento parece provenir de un corpus concreto (`km_org_non_empty_jsonl`) cuya composicion no se detalla.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de etiquetado incorrecto de tokens sin correspondencia real con una organizacion.
- Limitaciones de idioma: el modelo esta entrenado para turco; su uso en otros idiomas no esta soportado ni evaluado.
- Restricciones de licencia: la licencia no esta declarada en la informacion disponible, por lo que se desconoce si el uso comercial esta permitido. Conviene contactar con el autor o consultar el repositorio antes de utilizarlo en produccion.
- El modelo tiene 0 descargas y 0 likes, y fue creado y actualizado con apenas dos minutos de diferencia, lo que sugiere una publicacion automatica o experimental; no hay garantia de mantenimiento ni de soporte.
- La discrepancia entre la etiqueta `convbert` del repositorio y la referencia a "BERT / ConvBERT" en la model card debe resolverse inspeccionando la configuracion real del checkpoint antes de integrarlo.
- No se documentan datos de entrenamiento suficientes (numero de tokens, composicion, procedencia) para evaluar posibles sesgos de dominio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HasanPekedis/dbmdz_convbert-base-turkish-cased_km_org_non_empty_jsonl_4_32_512_5e-5
- Modelo base: https://huggingface.co/dbmdz/bert-base-turkish-cased
- Repositorio de referencia de dbmdz para turco: https://github.com/dbmdz/berts
- Paper de ConvBERT: no disponible en la informacion proporcionada
- Blog o demo del autor: no disponible en la informacion proporcionada

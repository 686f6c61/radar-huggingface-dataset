# HasanPekedis/dbmdz_bert-base-turkish-128k-cased_org_jsonl_10_8_512_3e-5

## Resumen

El modelo `HasanPekedis/dbmdz_bert-base-turkish-128k-cased_org_jsonl_10_8_512_3e-5` es un ajuste fino de BERTurk (`dbmdz/bert-base-turkish-128k-cased`) especializado en el reconocimiento de entidades nombradas de tipo organización (ORG) en turco. Se trata de un modelo encoder-only de tipo transformer (familia BERT base) con 183.757.059 parámetros, vocabulario de 128.000 tokens y distinción de mayúsculas y minúsculas, algo relevante en turco por el comportamiento de la «i» mayúscula.

El problema que resuelve es acotado y concreto: dado un texto en turco, etiquetar los fragmentos que corresponden a organizaciones (clubes deportivos, empresas, medios, competiciones, instituciones) mediante esquema BIO con tres etiquetas (`O`, `B-ORG`, `I-ORG`). Está entrenado sobre un corpus en formato JSONL y reporta un F1 de 0,9153 en el conjunto de test (precisión 0,9021; recall 0,9289) sobre 2.558 entidades de soporte.

Su relevancia es limitada y muy específica: no es un modelo generativo ni multilingüe, sino una pieza de preprocesado dentro de pipelines de NLP turco (extracción de entidades, enriquecimiento de bases de conocimiento, indexación). El repositorio no registra descargas ni «likes» y no declara licencia, por lo que debe tratarse como un artefacto experimental de un autor individual más que como un modelo de producción consolidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only, familia BERT base (cased) |
| Parametros totales | 183.757.059 |
| Longitud de contexto | 512 tokens (longitud maxima de secuencia) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors, sin variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Turco |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea | Token classification (Named Entity Recognition) |
| Etiquetas | O, B-ORG, I-ORG |
| Modelo base | dbmdz/bert-base-turkish-128k-cased |
| Tamano del repositorio | 0,7 GB |

## Arquitectura y entrenamiento

La arquitectura subyacente es BERT base en configuracion *cased* con vocabulario de 128.000 tokens, publicada por el equipo MDZ Digital Library (dbmdz) de la Biblioteca Estatal de Baviera. Sobre ese checkpoint se aplica una cabeza de clasificacion de tokens con tres etiquetas, entrenada especificamente para la entidad ORG. El numero de parametros (183,7 millones) es coherente con un BERT base cuya matriz de embeddings es sensiblemente mayor que la del BERT original (vocabulario de 128k frente a 30k).

La configuracion de ajuste fino reportada por el autor es: 10 epocas, batch size 16, learning rate 3e-5, weight decay 0,01, warmup ratio 0,1, longitud maxima 512 y semilla 42. El conjunto de datos se describe unicamente como un corpus JSONL en turco; no se detalla su tamano, procedencia ni la composicion de entidades, y no se menciona el uso de RLHF, DPO ni tecnicas de alineacion (no aplicables a una tarea de etiquetado). No se documenta ninguna innovacion tecnica adicional: es un ajuste fino estandar de token classification.

Un aspecto relevante que se deduce de las metricas es la dinamica de sobreajuste: la perdida de entrenamiento cae de 0,0813 (epoca 1) a 0,0025 (epoca 10), mientras la perdida de validacion sube de 0,0730 a 0,1272 tras alcanzar su minimo en las primeras epocas. El mejor F1 de validacion (0,931339) se obtiene en la epoca 9, pero la brecha creciente entre ambas perdidas sugiere que el checkpoint final esta sobreajustado y que un early stopping mas agresivo habria sido mas adecuado.

## Capacidades

- Reconocimiento de entidades nombradas de tipo organizacion (ORG) en textos en turco, con esquema BIO (`B-ORG`, `I-ORG`).
- Etiquetado de tokens a nivel de secuencia completa de hasta 512 tokens.
- Manejo de texto con distincion de mayusculas y minusculas, incluidas mayusculas turcas especificas.
- Cobertura observada de entidades heterogeneas: clubes deportivos, competiciones y ligas, medios de comunicacion, instituciones academicas, licencias y marcas.
- No dispone de generacion de texto: es un modelo discriminativo de clasificacion, no un modelo de lenguaje causal.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No es multilingue: esta entrenado y evaluado exclusivamente en turco.
- No dispone de modo de razonamiento (*thinking*), vision, audio ni ninguna capacidad multimodal.

## Casos de uso

- Extraccion de organizaciones en prensa turca: procesar articulos completos troceados en fragmentos de 512 tokens para poblar una base de datos de entidades mencionadas (clubes, empresas, medios) junto con su contexto.
- Enriquecimiento de grafos de conocimiento: usar las menciones ORG detectadas como nodos candidatos y enlazarlas posteriormente con un sistema de *entity linking* para construir un grafo de relaciones entre organizaciones turcas.
- Indexacion y busqueda semantica sobre corpus documentales turcos: anotar previamente los documentos con las entidades ORG para permitir filtros estructurados («documentos que mencionan X organizacion») en un motor de busqueda.
- Analisis de cobertura mediatica: medir frecuencia y evolucion temporal de menciones a empresas o instituciones concretas en un archivo de noticias, agregando las predicciones del modelo por entidad.
- Preprocesado para pipelines de RAG en turco: anonimizar, etiquetar o enrutar fragmentos segun las organizaciones que contienen antes de pasarlos a un modelo generativo, de modo que se reduzca el ruido y se mejore la recuperacion.
- Limpieza y canonicalizacion de datos de entidades: detectar variantes de mencion de una misma organizacion en un CRM o en un dataset interno para consolidar registros duplicados antes de un proceso de deduplicacion.
- Monitorizacion de sanciones o riesgo de contraparte: aplicar el modelo sobre comunicados y noticias en turco para detectar rapidamente menciones a organizaciones de interes en un flujo de vigilancia.
- Analisis deportivo: extraer clubes, ligas y competiciones de cronicas y fichas de jugadores, tarea para la que el modelo muestra buen comportamiento segun los ejemplos cualitativos publicados.

## Benchmarks y rendimiento

Resultados en el conjunto de test, sobre 2.558 entidades de soporte:

| Metrica | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| ORG | 0,9021 | 0,9289 | 0,9153 | 2558 |
| micro avg | 0,9021 | 0,9289 | 0,9153 | 2558 |
| macro avg | 0,9021 | 0,9289 | 0,9153 | 2558 |
| weighted avg | 0,9021 | 0,9289 | 0,9153 | 2558 |

Evolucion por epoca en validacion (extracto):

| Epoca | Training loss | Validation loss | Precision | Recall | F1 |
|---|---|---|---|---|---|
| 1 | 0,081327 | 0,073038 | 0,862500 | 0,910008 | 0,885617 |
| 5 | 0,010213 | 0,089468 | 0,907400 | 0,927463 | 0,917322 |
| 9 | 0,002548 | 0,118933 | 0,921093 | 0,941815 | 0,931339 |
| 10 | 0,002491 | 0,127179 | 0,922286 | 0,939100 | 0,930617 |

Mejor F1 de validacion: 0,931339 en la epoca 9.

No se han publicado resultados en benchmarks estandar de NLP (MMLU, HumanEval, GSM8K, GLUE, etc.) en la informacion disponible. La unica evaluacion disponible es la especifica de la tarea NER sobre el propio conjunto de validacion y test del autor. Tampoco se ofrece comparacion con otros sistemas NER en turco, por lo que no es posible situar el resultado de 0,9153 de F1 en test respecto al estado del arte.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,75 GB en FP32 y 0,37 GB en FP16 solo para los pesos; con activaciones de batch pequeno y secuencias de 512 tokens, el consumo tipico se situa en el rango de 1 a 3 GB.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, GTX 1660, e incluso en GPUs con 4 GB de VRAM en FP16 o INT8.
- Inferencia en CPU perfectamente viable para volumenes moderados, dado el tamano reducido del modelo y que no requiere decodificacion autoregresiva.
- GPU de datacenter (A100, H100, L40S) solo justificables para altisimo throughput por lotes, no por requisitos de memoria.
- Opciones de despliegue: `transformers` con `AutoModelForTokenClassification` y `pipeline("token-classification")`, exportacion a ONNX Runtime para acelerar CPU, TorchServe o un servicio FastAPI propio. vLLM y llama.cpp no son las herramientas adecuadas: el primero esta orientado a modelos generativos y el segundo a pesos GGUF, y este repositorio solo distribuye safetensors.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

No hay datos publicados de otros sistemas NER de entidades ORG en turco dentro de la informacion disponible, por lo que la comparacion de rendimiento entre alternativas no esta disponible. Lo que si puede compararse son los checkpoints base:

| Modelo | Parametros | Vocabulario | Contexto | Idioma | Licencia | Tarea |
|---|---|---|---|---|---|---|
| Este modelo (HasanPekedis, ajuste ORG) | 183.757.059 | 128.000 | 512 | Turco | no disponible | NER de ORG |
| dbmdz/bert-base-turkish-128k-cased | 183.757.059 aprox. | 128.000 | 512 | Turco | no disponible en la informacion recuperada | Modelo base preentrenado, sin cabeza de NER |
| dbmdz/bert-base-turkish-cased | no disponible en la informacion recuperada | 32.000 | 512 | Turco | no disponible en la informacion recuperada | Modelo base preentrenado, sin cabeza de NER |

La comparacion con alternativas de la misma tarea (por ejemplo, pipelines NER turcos basados en XLM-R o en BERTurk con etiquetado completo PER/LOC/ORG/MISC) no puede establecerse porque no se han recuperado resultados de esos sistemas en esta busqueda.

## Limitaciones y advertencias

- Modelo de un unico tipo de entidad: solo reconoce ORG. No detecta personas (PER), localizaciones (LOC), fechas ni cantidades, a diferencia de un NER generalista.
- Idioma unico: entrenado exclusivamente en turco; su comportamiento en otros idiomas no esta documentado.
- Indicadores claros de sobreajuste: la perdida de validacion aumenta de forma monotona desde las primeras epocas hasta 0,1272 en la epoca 10, mientras la de entrenamiento cae a 0,0025. El checkpoint publicado puede no ser el mejor disponible.
- Errores de frontera de entidad documentados en los propios ejemplos del autor: se predice «NCAA turnuvasini» donde el gold era «NCAA», y se fragmenta «Creative Commons lisansi» en dos entidades separadas («Creative Commons» y «Attribution-Share Alike»).
- Posible confusion entre organizaciones reales y otros nombres propios con estructura similar (obras, marcas, titulos), tal como refleja el caso de nombres de canciones etiquetados como ORG en los ejemplos.
- Limite de 512 tokens por fragmento: los documentos largos deben trocearse, lo que puede partir una mencion de entidad en la frontera entre fragmentos y degradar el recall.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial. Debe tratarse como bloqueante para produccion hasta aclararlo con el autor.
- Sin validacion por la comunidad: 0 descargas y 0 likes en el momento de la consulta; el modelo no ha sido replicado ni auditado por terceros.
- Sesgos desconocidos: el autor no documenta la composicion del corpus de entrenamiento ni su distribucion geografica, tematica o temporal, por lo que no puede evaluarse el sesgo hacia determinados tipos de organizacion (por ejemplo, predominio de clubes deportivos y medios turcos, visible en los ejemplos).
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de falsos positivos: el modelo puede etiquetar como ORG fragmentos que no lo son, con una precision de 0,9021 en test (cerca del 10 % de las predicciones son incorrectas).
- Los metadatos temporales del repositorio (creacion y actualizacion registradas en octubre de 2026) resultan anomalos y dificultan interpretar la trazabilidad y vigencia del artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HasanPekedis/dbmdz_bert-base-turkish-128k-cased_org_jsonl_10_8_512_3e-5
- Modelo base (128k, cased): https://huggingface.co/dbmdz/bert-base-turkish-128k-cased
- Modelo base alternativo (32k, cased): https://huggingface.co/dbmdz/bert-base-turkish-cased
- Ficha del modelo base en Inferix: https://inferix.co/models/dbmdz/bert-base-turkish-cased
- Ficha del modelo base en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/bert-base-turkish-cased-dbmdz
- Copia de la model card del modelo base en el repositorio CHEF (THU-BPM): https://github.com/THU-BPM/CHEF/tree/main/Pipeline/X-FACT/transformers/model_cards/dbmdz/bert-base-turkish-128k-cased
- Paper o publicacion tecnica del ajuste fino: no disponible
- Repositorio de codigo del autor: no disponible
- Demo en linea: no disponible

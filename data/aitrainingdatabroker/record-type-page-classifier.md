# aitrainingdatabroker/record-type-page-classifier

## Resumen

El modelo `record-type-page-classifier` es un clasificador de texto basado en `distilroberta-base`, desarrollado por AI Training Data Broker, un intermediario y asesor tecnico especializado en la venta y licencia de datos corporativos para laboratorios de IA. Su funcion es leer un fragmento de texto sobre registros corporativos y asignarle una de 33 categorias posibles (tickets de soporte, historial de CRM, exportaciones de Jira o Slack, archivos CAD, correos de Microsoft 365, entre otras). Resuelve un problema concreto de preparacion de datos: antes de procesar o licenciar un conjunto de datos, un equipo debe identificar que tipo de registro contiene cada archivo, y este modelo propone una etiqueta que una persona puede confirmar despues.

Con 82.143.777 parametros totales y un tamano de repositorio de 0,3 GB, es un modelo compacto pensado para inferencia ligera y para ejecutarse en entornos sin GPU de gran capacidad. Su relevancia actual es limitada y muy especifica: no compite en capacidades generales de generacion o razonamiento, sino que cubre una tarea de clasificacion cerrada dentro de un flujo de catalogacion de datos. Su publico objetivo son equipos que preparan exportaciones de datos corporativos para su uso en IA y necesitan un primer paso de etiquetado asistido.

El modelo se publica bajo licencia Apache 2.0, solo soporta ingles y fue entrenado exclusivamente con texto propio publicado en aitrainingdatabroker.com. Su rendimiento en el conjunto de prueba retenido es modesto: exactitud de 0,533 y macro F1 de 0,497 sobre 107 filas, con varias clases en F1 0,0, lo que condiciona su uso a un papel de sugerencia y no de decision automatica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa destilado, `distilroberta-base`) |
| Parametros totales | 82.143.777 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `distilroberta-base`, un encoder transformer derivado de RoBERTa mediante destilacion, y se ajusta finamente como clasificador de texto con 33 etiquetas de salida. El entrenamiento consistio en un fine-tuning de 25 epocas sobre una unica GPU RTX 3070. El conjunto de entrenamiento esta formado por 419 pasajes extraidos de las paginas publicadas por el propio autor en los datasets `company-record-types-and-limits` y `company-data-licensing-faq-by-topic`, que corresponden a descripciones de items, introducciones y parrafos de seccion de sus 33 paginas de tipos de registro.

La evaluacion se realizo sobre las preguntas y respuestas de esas mismas paginas, que el modelo no vio durante el entrenamiento. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales, algo coherente con una tarea de clasificacion supervisada. Tampoco se detallan innovaciones tecnicas como decodificacion especulativa o atencion lineal; se trata de un fine-tuning convencional de un encoder pequeno. Los scripts de construccion de datos y entrenamiento estan disponibles en el directorio `source/` del repositorio, y las puntuaciones completas en `scores.json`.

## Capacidades

- Clasificacion de texto en 33 categorias de registros corporativos, con salida de las tres etiquetas mas probables mediante `top_k=3`.
- Identificacion de tipos de registro como tickets de soporte, historial de CRM, exportaciones de Jira, Slack, Gmail, Google Drive, HubSpot, Salesforce, QuickBooks, Confluence, Microsoft 365, repositorios GitHub, archivos CAD, notas de laboratorio, tesis, SOPs, ordenes de trabajo, grabaciones de llamadas, entre otros.
- Sugerencia de etiqueta para pasajes cortos en ingles (descripciones, introducciones, parrafos de seccion).
- Generacion de texto: no disponible.
- Razonamiento y matematicas: no disponible.
- Codigo: no disponible como tarea generativa.
- Vision y audio: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles.
- Modo thinking: no disponible.

## Casos de uso

- Catalogacion inicial de exportaciones de datos corporativos: un equipo que recibe lotes de archivos de distintas fuentes puede pasar cada pasaje por el modelo para obtener una propuesta de tipo de registro (por ejemplo, `jira-data-export` o `slack-data-export`) y reducir el trabajo manual de triaje antes de la revision humana.
- Preparacion de datos para licenciamiento: al evaluar que datos puede licenciar una empresa a un laboratorio de IA, el modelo ayuda a etiquetar cada bloque de texto segun su origen (CRM, correo, chat de equipo, ERP) para organizar el inventario y aplicar las politicas correspondientes.
- Clasificacion de documentacion interna para cumplimiento: pasajes de SOPs, notas de laboratorio o informes de inspeccion pueden etiquetarse para asignarles reglas de retencion o de identificacion antes de compartirlos.
- Triaje de archivos en procesos de descubrimiento legal o auditoria: el modelo propone categorias para pasajes de correo, ordenes de cambio, RFIs o archivos de suscripcion, de modo que un revisor humano priorice los documentos mas relevantes.
- Enriquecimiento de metadatos en pipelines de datos: integrado como paso previo a un proceso ETL, el clasificador puede anadir una etiqueta de tipo de registro a cada fragmento y facilitar busquedas y filtros posteriores en el catalogo de datos.
- Demostracion interactiva en navegador: el modelo se puede probar mediante el Space `company-record-types-and-limits-finder`, util para que equipos no tecnicos comprueben como funciona la clasificacion antes de integrarla en su flujo.
- Filtrado previo en la construccion de datasets de entrenamiento: al seleccionar que porciones de datos corporativos se usaran para entrenar modelos, el clasificador permite separar por tipo de registro y equilibrar la composicion del corpus.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 107 filas retenidas (preguntas y respuestas de las paginas, no vistas en entrenamiento):

| Metrica | Valor |
|---|---|
| Exactitud (accuracy) | 0,533 |
| Macro F1 | 0,497 |
| Filas de evaluacion | 107 |
| Clases | 33 |

Desglose por etiqueta (F1 y numero de ejemplos):

| Etiqueta | F1 | Ejemplos |
|---|---|---|
| `accounting-and-erp-records` | 0,0 | 3 |
| `cad-and-engineering-files` | 0,8 | 3 |
| `call-recordings` | 0,571 | 3 |
| `change-orders-and-rfis` | 0,8 | 3 |
| `claims-and-underwriting-files` | 0,5 | 3 |
| `client-deliverables-and-drafts` | 0,4 | 3 |
| `closed-deal-files` | 0,5 | 3 |
| `code-and-pull-request-history` | 0,0 | 3 |
| `confluence-data-export` | 0,889 | 4 |
| `consented-recordings` | 0,667 | 3 |
| `crm-history` | 0,5 | 3 |
| `egocentric-video` | 0,857 | 4 |
| `github-repository-export` | 0,444 | 3 |
| `gmail-data-export` | 0,0 | 4 |
| `google-drive-export` | 0,462 | 3 |
| `hubspot-data-export` | 0,286 | 3 |
| `inspection-reports-and-photos` | 0,857 | 3 |
| `jira-data-export` | 0,333 | 3 |
| `lab-notebooks-and-experiment-records` | 0,667 | 3 |
| `labeled-tables-and-datasets` | 1,0 | 4 |
| `microsoft-365-email-export` | 0,364 | 3 |
| `native-word-excel-and-powerpoint-files` | 0,4 | 4 |
| `project-and-task-history` | 0,5 | 3 |
| `quickbooks-data-export` | 0,4 | 3 |
| `quotes-and-estimates` | 0,667 | 3 |
| `salesforce-data-export` | 0,0 | 4 |
| `slack-data-export` | 0,727 | 4 |
| `sops-and-knowledge-bases` | 0,667 | 3 |
| `support-tickets` | 0,571 | 3 |
| `team-chat` | 0,0 | 3 |
| `theses-and-dissertations` | 0,667 | 4 |
| `work-orders-and-dispatch-notes` | 0,5 | 3 |
| `zendesk-data-export` | 0,4 | 3 |

No se han publicado comparaciones con otros modelos de clasificacion en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 82,1 millones de parametros; en precision fp32 ocupa aproximadamente 0,33 GB de pesos, y en fp16 alrededor de 0,16 GB. Con overhead de activaciones y tokenizador, cabe holgadamente en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 3070, RTX 4090) es suficiente; el autor lo entreno en una unica RTX 3070. Para despliegues de alto volumen, una A100 o H100 aportaria margen de throughput pero no es necesaria por tamano.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 4 GB de VRAM, e incluso en CPU para cargas moderadas.
- Opciones de despliegue: pipeline de `transformers`, Text Embeddings Inference (etiqueta `text-embeddings-inference` en el repositorio), endpoints compatibles; tambien es viable exportarlo a ONNX o cuantizarlo para CPU, aunque no se documentan formatos GGUF ni recetas de cuantizacion.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `record-type-page-classifier` | 82,1 M | no disponible | Clasificacion de 33 tipos de registro corporativo | Apache 2.0 | Hugging Face |
| `distilroberta-base` (modelo base) | 82,1 M | no disponible | Encoder general, sin cabeza de clasificacion especifica | Apache 2.0 | Hugging Face |
| Clasificadores de texto genericos basados en RoBERTa/BERT | variable | no disponible | Clasificacion de sentimiento, topicos, etc. | variable | Hugging Face |

No se dispone de datos de benchmarks comparativos con alternativas en la informacion proporcionada. La comparacion con `distilroberta-base` es estructural: comparten arquitectura y numero de parametros, pero el modelo base no incluye la cabeza de 33 clases ni el ajuste sobre el corpus de registros corporativos.

## Limitaciones y advertencias

- Rendimiento modesto: exactitud de 0,533 y macro F1 de 0,497 sobre 107 filas retenidas; varias clases obtienen F1 de 0,0 (`accounting-and-erp-records`, `code-and-pull-request-history`, `gmail-data-export`, `salesforce-data-export`, `team-chat`), por lo que el modelo no distingue esas categorias en la practica.
- Conjunto de entrenamiento muy pequeno: 419 pasajes para 33 clases, aproximadamente 13 ejemplos por clase, lo que limita la generalizacion.
- Clases vecinas: las guias de exportacion (Jira, Slack, Gmail, Google Drive, HubSpot, Salesforce, QuickBooks, Zendesk, Microsoft 365) son dificiles de separar; el autor recomienda tratar las tres primeras predicciones como candidatas y no como respuesta unica.
- Dominio restringido: entrenado solo con texto de las paginas de un unico broker; puede no transferir bien a descripciones de registros redactadas con otro estilo o vocabulario.
- Solo ingles: no soporta otros idiomas.
- Riesgo de alucinacion de etiqueta: al ser un clasificador, siempre asigna una de las 33 clases aunque el texto no encaje en ninguna, sin mecanismo documentado de absteccion.
- No es asesoramiento legal ni certificacion: el autor indica explicitamente que una persona debe revisar la salida antes de compartir o decidir algo, y que el criterio legal corresponde al asesor juridico de cada organizacion.
- Licencia Apache 2.0: permite uso comercial, pero el autor solicita atribucion a AI Training Data Broker y enlace a https://aitrainingdatabroker.com/ al compartir o construir sobre el modelo.
- Sesgos: no se documentan analisis de sesgo en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aitrainingdatabroker/record-type-page-classifier
- Space de demostracion: https://huggingface.co/spaces/aitrainingdatabroker/company-record-types-and-limits-finder
- Dataset de tipos de registro y limites: https://huggingface.co/datasets/aitrainingdatabroker/company-record-types-and-limits
- Dataset de FAQ de licenciamiento por topico: https://huggingface.co/datasets/aitrainingdatabroker/company-data-licensing-faq-by-topic
- Pagina de tipos de registro y guias de exportacion: https://aitrainingdatabroker.com/data/
- Articulo sobre licenciamiento de historial de CRM: https://aitrainingdatabroker.com/data/crm-history/
- Guia de exportacion de datos de Jira: https://aitrainingdatabroker.com/data/jira-data-export/
- Modelo base: https://huggingface.co/distilbert/distilroberta-base

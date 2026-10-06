# SkyeAv/drug-approvals-kp

## Resumen

Drug Approvals Knowledge Provider (DAKP) es un grafo de conocimiento en formato KGX publicado por el usuario SkyeAv en HuggingFace bajo el identificador SkyeAv/drug-approvals-kp. No es un modelo de lenguaje ni una red neuronal: es un conjunto de datos estructurado (nodos y aristas en NDJSON) que recoge relaciones de tratamiento entre fármacos y enfermedades aprobadas por la FDA y la EMA, usos observados de tipo applied_to_treat procedentes de FAERS y texto de contraindicaciones extraído del Structured Product Labeling de DailyMed.

El grafo se construye con la herramienta Tablassert y se valida contra el Biolink Model, con la fuente de conocimiento primaria identificada como infores:drugapprovals-kp. La última versión publicada, 1.22.0, contiene 15.883 nodos y 131.678 aristas, con 0 fallos de validación sobre el total de registros. El repositorio ocupa aproximadamente 0,2 GB y la licencia es Apache 2.0.

Su relevancia actual radica en el ecosistema Translator y en el trabajo de farmacovigilancia: ofrece procedencia trazable (URLs de registro fuente, publicaciones, texto de apoyo), contexto clínico por arista (estado de aprobación clínica, aprobaciones regulatorias, número de casos, calificadores de sexo, población, frecuencia, anatomía y tiempo) y una política de versionado por directorios que mantiene válidas las URLs de releases anteriores. El único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplicable: grafo de conocimiento (KGX, nodos y aristas NDJSON), no es un modelo neuronal |
| Parametros totales | no aplicable |
| Parametros activos | no aplicable |
| Longitud de contexto | no aplicable |
| Tipos de cuantizacion | no aplicable |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | no aplicable; datos en NDJSON (un fichero de nodos y otro de aristas por release) |
| Version mas reciente | 1.22.0 |
| Versiones publicadas | 1.22.0, 1.21.0, 1.16.0 |
| Numero de nodos (1.22.0) | 15.883 |
| Numero de aristas (1.22.0) | 131.678 |
| Aristas plegadas (1.22.0) | 2.848 |
| Version de Biolink Model | 4.4.5 (el validador informa de su propia instantanea 4.4.4) |
| Tamano del repositorio | ~0,2 GB |
| Tamano de ficheros (1.22.0) | nodos: 2.106.621 bytes; aristas: 173.816.718 bytes; RIG: 18.231 bytes |
| Esquema de nodos | id, name, category, provided_by, in_taxon |
| Esquema de aristas | id, subject, object, original_subject, original_object, predicate, category, knowledge_level, agent_type, sources, supporting_text, clinical_approval_status, regulatory_approvals, publications, number_of_cases, sex_qualifier, population_context_qualifier, frequency_qualifier, anatomical_context_qualifier, temporal_context_qualifier |
| Herramienta de construccion | Tablassert |
| Herramienta de validacion | tablassert validate-kgx con Tablassert 19.5.1 |
| Fuente de conocimiento primaria | infores:drugapprovals-kp |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-10-05 / 2026-10-05 |

## Arquitectura y entrenamiento

No existe entrenamiento en el sentido de aprendizaje automatico. DAKP es un grafo de conocimiento construido por integracion de fuentes (ETL) y no un modelo con pesos. La estructura sigue el formato KGX: un fichero de nodos con identificadores, nombres, categorias, proveedor y taxon, y un fichero de aristas con sujeto, objeto, predicado, categoria, nivel de conocimiento (knowledge_level), tipo de agente (agent_type) y un bloque anidado de procedencia (sources) con resource_id, resource_role, upstream_resource_ids y source_record_urls.

Las fuentes declaradas son las aprobaciones de fármacos de la FDA y la EMA para relaciones fármaco-enfermedad, los usos observados de tipo applied_to_treat procedentes de FAERS y el texto de contraindicaciones minado del Structured Product Labeling de DailyMed. La construccion se realiza con Tablassert y la validacion se ejecuta con tablassert validate-kgx sobre el Biolink Model 4.4.5, con 0 fallos declarados en las tres releases publicadas. Un detalle de modelado relevante es el plegado de aristas: las aristas biolink:applied_to_treat se colapsan cuando existe un clinical_approval_status escalar en conflicto (2.848 aristas plegadas en 1.22.0 y 1.21.0; 3.011 en 1.16.0).

El versionado se organiza en un directorio de nivel superior por release, anclado a una etiqueta de git en el repositorio de construccion. Los caminos existentes nunca se reescriben, de modo que una URL basada en ruta sigue siendo válida entre releases. Solo se publican el par de ficheros NDJSON y la Resource Ingest Guide (RIG); las vistas TSV y los informes de plegado permanecen en el directorio de trabajo de la build.

## Capacidades

- Consulta de relaciones fármaco-enfermedad con predicado applied_to_treat y estado de aprobación clínica (clinical_approval_status).
- Recuperación de aprobaciones regulatorias por arista mediante el campo regulatory_approvals (cobertura FDA y EMA según las fuentes declaradas).
- Recuperación de usos observados en farmacovigilancia procedentes de FAERS, con el campo number_of_cases (entero de 64 bits) para el recuento de casos.
- Recuperación de texto de contraindicaciones minado del SPL de DailyMed, expuesto en supporting_text y en el bloque de procedencia.
- Trazabilidad completa: cada arista puede llevar resource_id, resource_role, upstream_resource_ids y source_record_urls, además de publications.
- Filtrado por contexto clínico y demográfico: sex_qualifier, population_context_qualifier, frequency_qualifier, anatomical_context_qualifier y temporal_context_qualifier.
- Clasificación de cada arista por knowledge_level y agent_type.
- Interoperabilidad con el ecosistema Biolink Model (4.4.5) y con herramientas compatibles con KGX.
- Carga directa mediante load_dataset de HuggingFace con configuraciones separadas por release (1.22.0_edges marcada como default).
- No dispone de generación de texto, tool calling, razonamiento multi-paso, visión ni audio; esas capacidades corresponden a modelos de lenguaje, no a este recurso.

## Casos de uso

- Farmacovigilancia y detección de señales: cruzar las aristas con number_of_cases procedentes de FAERS con el estado de aprobación clínica permite localizar usos observados en poblaciones reales que no figuran como indicación aprobada, y priorizar su revisión.
- Integración en el ecosistema Translator: al estar validado contra Biolink Model y usar KGX, el grafo puede incorporarse como Knowledge Provider (infores:drugapprovals-kp) en consultas federadas junto a otras fuentes, sin transformación de esquema adicional.
- Análisis de contraindicaciones: el texto minado del SPL de DailyMed, almacenado en supporting_text, permite construir verificaciones automáticas de seguridad antes de recomendar o prescribir un fármaco en una población concreta.
- Comparativa regulatoria FDA frente a EMA: el campo regulatory_approvals permite identificar divergencias de aprobación entre ambas agencias para una misma relación fármaco-enfermedad.
- Auditoría y reproducibilidad de datos biomédicos: los campos sources, upstream_resource_ids, source_record_urls y publications permiten reconstruir la cadena de procedencia de cada afirmación hasta el registro original.
- Enriquecimiento de pipelines de datos clínicos: cargar los NDJSON en un almacén analítico o en una base de datos de grafos para unir indicaciones aprobadas a cohortes de pacientes, históricos de prescripción o conjuntos de datos de resultados.
- Sistemas de respuesta a preguntas con recuperación (RAG): usar el grafo como capa de recuperación estructurada sobre la que un modelo de lenguaje redacte respuestas, con la ventaja de que cada relación viene con procedencia verificable.
- Análisis poblacional: segmentar relaciones por sex_qualifier, population_context_qualifier y anatomical_context_qualifier para estudiar si la evidencia se concentra en subgrupos específicos.
- Construcción de conjuntos de evaluación: emplear las aristas validadas y sus recuentos de casos como referencia para medir la calidad de sistemas de extracción de relaciones biomédicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único indicador de calidad declarado es la validación de esquema, que se resume a continuación.

| Version | Nodos | Aristas | Aristas plegadas | Biolink | Validacion |
|---|---|---|---|---|---|
| 1.22.0 | 15.883 | 131.678 | 2.848 | 4.4.5 | 15.883/15.883 nodos, 131.678/131.678 aristas, 0 fallos |
| 1.21.0 | 15.883 | 131.678 | 2.848 | 4.4.5 | 15.883/15.883 nodos, 131.678/131.678 aristas, 0 fallos |
| 1.16.0 | 15.883 | 131.678 | 3.011 | 4.4.5 | 15.883/15.883 nodos, 131.678/131.678 aristas, 0 fallos |

No se han publicado metricas de cobertura, exhaustividad, precision de las extracciones ni comparaciones cuantitativas con otros grafos de conocimiento en la informacion proporcionada.

## Requisitos de hardware

- No requiere GPU: es un recurso de datos, no un modelo de inferencia.
- Almacenamiento: el repositorio completo ocupa aproximadamente 0,2 GB; la release 1.22.0 suma 2.106.621 bytes de nodos, 173.816.718 bytes de aristas y 18.231 bytes de RIG.
- Memoria RAM: no disponible de forma oficial. Como referencia, cargar el fichero de aristas (unos 166 MiB de NDJSON) en memoria requiere un orden de magnitud de varios cientos de MiB a pocos GiB según el formato de destino (objetos Python, DataFrame o base de datos de grafos).
- Despliegue: carga directa con load_dataset de HuggingFace seleccionando la configuración de release; también es posible procesar los NDJSON con herramientas de línea de comandos, pandas o cargarlos en una base de datos de grafos compatible con Biolink/KGX.
- Latencia y throughput: no disponibles; dependen íntegramente del motor de consulta o del pipeline que consuma los datos.
- Nota operativa: el autor advierte de que la inferencia automática de esquema falla al convertir la estructura anidada sources, por lo que las características se declaran explícitamente en la model card y conviene respetarlas al cargar.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. Por categoría, los recursos equivalentes serían otros grafos de conocimiento biomédicos orientados a fármacos y enfermedades (por ejemplo, DrugCentral, Open Targets o PrimeKG), pero no hay cifras de tamaño, contexto, licencia ni rendimiento de esos recursos en la documentación aportada, por lo que no se puede establecer una comparación cuantitativa rigurosa.

| Recurso | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DAKP (SkyeAv/drug-approvals-kp) | no aplicable (grafo de conocimiento) | no aplicable | Apache 2.0 | HuggingFace, 1.22.0 / 1.21.0 / 1.16.0 |
| Alternativas de la misma categoria (grafos de conocimiento farmacologicos) | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no admite tool calling ni agentes. Cualquier uso conversacional requiere emparejarlo con un modelo aparte.
- Idioma único declarado: inglés. No hay soporte multilingüe documentado, lo que limita su uso directo en castellano sin traducción previa de etiquetas y textos.
- Comportamiento de releases: los ficheros de nodos y aristas de 1.21.0 y 1.22.0 presentan los mismos MD5 y el mismo recuento (15.883 nodos, 131.678 aristas); el único cambio verificable entre ambas es el checksum del fichero RIG. Conviene no asumir contenido nuevo por el mero cambio de número de versión.
- El plegado de aristas applied_to_treat con clinical_approval_status en conflicto implica pérdida de granularidad: parte de las relaciones originales queda colapsada (2.848 en 1.22.0, 3.011 en 1.16.0).
- La calidad depende íntegramente de las fuentes (FDA, EMA, FAERS, DailyMed SPL) y del proceso de extracción con Tablassert; no se han publicado métricas de precisión, exhaustividad ni tasas de error de extracción.
- Los usos observados en FAERS son notificaciones espontáneas: no establecen causalidad y pueden reflejar infranotificación o sesgos de notificación. No deben interpretarse como evidencia de eficacia.
- El texto de contraindicaciones procede de minado de SPL; puede contener fragmentos fuera de contexto o incompletos, por lo que requiere revisión clínica antes de cualquier uso asistencial.
- Los campos knowledge_level, agent_type, clinical_approval_status y los calificadores cualitativos aparecen en el esquema, pero no se documentan en la información disponible los valores admitidos ni su distribución, lo que complica el filtrado sin inspeccionar los datos.
- Licencia Apache 2.0 en el repositorio y en la card: permite uso comercial, pero no se detallan condiciones adicionales de las fuentes subyacentes (FDA, EMA, DailyMed), que pueden tener sus propios términos de reutilización.
- Cero descargas y cero likes en el momento de la consulta: no hay validación por parte de la comunidad ni casos de uso publicados.
- No se ha publicado ningún benchmark, por lo que no hay evidencia cuantitativa de calidad frente a alternativas.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/SkyeAv/drug-approvals-kp (identificador de dataset: https://huggingface.co/datasets/SkyeAv/drug-approvals-kp)
- Repositorio de construccion en GitHub: https://github.com/glusman-team/dakp
- Documentacion de KGX (formato de los ficheros): no disponible en la informacion proporcionada
- Documentacion de Biolink Model: no disponible en la informacion proporcionada
- Resource Ingest Guide (RIG) de la release 1.22.0: incluida en el repositorio como 1.22.0/DRUG_APPROVALS_KP_1.22.0.RIG.yaml
- Resultados de la busqueda web: las consultas realizadas devolvieron unicamente resultados sobre Houlihan Lokey (entidad financiera) sin relacion con el recurso, por lo que no se incluye ningun enlace relevante adicional.

# fhir4ds/associations

## Resumen

`fhir4ds/associations` no es un modelo de lenguaje, sino un paquete de datos clinicos estructurados publicado en Hugging Face por el usuario `fhir4ds`. Forma parte del ecosistema fhir4px (concretamente del "Pipeline 4") y contiene datos de asociaciones clinicas orientados a aplicaciones: un grafo determinista indexado por CID (identificadores de concepto clinico) que relaciona conceptos ancla (medicamentos, condiciones, pruebas de laboratorio, constantes vitales y procedimientos) con conceptos asociados organizados en buckets tematicos.

El problema que resuelve es la vinculacion determinista entre datos FHIR del paciente (codificados con RxNorm, LOINC, SNOMED, ICD-10) y conceptos clinicos asociados, sin necesidad de busquedas semanticas por embeddings: una vez resuelto el CID de un item, el emparejamiento es una simple consulta de diccionario/conjunto con similitud exacta (1.0). Incluye ademas un fallback solo-texto basado en embeddings cuantizados (q8, ONNX, PubMedBERT, 768 dimensiones) para items sin codigo. No hay arquitectura de red neuronal propia, numero de parametros entrenables ni ventana de contexto, ya que se trata de datos y utilidades de resolucion, no de un modelo entrenable. Su relevancia radica en facilitar apps de paciente interoperables con FHIR, con emparejamiento reproducible y sin dependencia de inferencia en el dispositivo para el camino principal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es un modelo: grafo determinista CID-keyed + bundle de centroides de embeddings (PubMedBERT, 768-dim) |
| Parametros totales | no disponible (no aplica; el modelo de embeddings subyacente es PubMedBERT) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | q8 (solo en el bundle de embeddings ONNX del fallback) |
| Idiomas soportados | no disponible (contenido clinico en ingles) |
| Licencia | no disponible |
| Formato de pesos | no aplica; datos en JSON/JSON.gz y embeddings en ONNX |

## Arquitectura y entrenamiento

Al no tratarse de un modelo entrenado, no hay arquitectura transformer propia ni proceso de preentrenamiento/RLHF. El componente central es un grafo determinista con formato `fhir4px_associations_v1`: tres indices (`by_cid`, `by_name`, `concepts`) donde cada concepto ancla expone buckets (`lab`, `vital`, `procedure`, `medication`, `condition`, `treats`) cuyos miembros son pares `{cid, name}`. Los CIDs ancla provienen de value sets canonicos de medterm4ds (`VAL-MED-RXNORM-*`, `VAL-COND-SNOMED-*`, `VAL-LAB-LOINC-*`, `VAL-VIT-*`, `VAL-PROC-*`), y existen CIDs de producto (`RXNORM:<codigo>`) para variantes SCD/SBD/MIN que mapean al registro del ingrediente. Los miembros de clase farmacologica (ATC) van pre-expandidos con los CIDs de sus ingredientes.

El corpus de origen son 28.550 pares clinicos resueltos (95,7% de resolucion canonica), procesados por los scripts `build_association_centroids_v2.py` y `export_associations_hf.py` del repositorio fhir4px-model. Para el fallback solo-texto, el bundle de centroides contiene embeddings de nombres de miembros (q8, ONNX, PubMedBERT, 768 dimensiones), el mismo modelo empleado en `joelmontavon/fhir4px-embeddings-onnx` (`p4_centroids/`). No se detalla el numero de tokens de entrenamiento ni el pipeline completo de ese modelo base.

## Capacidades

- Emparejamiento determinista de conceptos clinicos por CID con similitud exacta (1.0), sin inferencia.
- Resolucion de codigos FHIR a CIDs ancla: RxNorm (incluidos productos SCD/SBD/MIN via `RXNORM:<codigo>`), SNOMED, LOINC, ICD-10.
- Crosswalks incluidos: codigos de pruebas de laboratorio LOINC a partes LP (p. ej. 4548-4 a LP16413-4) y condiciones ICD-10 a CIDs ancla SNOMED (puente CUI con fallback por categoria).
- Buckets de asociacion por tipo: `lab`, `vital`, `procedure`, `medication`, `condition` (eventos adversos) y `treats` (condiciones que trata un farmaco).
- Fallback solo-texto mediante embeddings de centroides (transformers.js o modulo ESM `associations_resolver.js`, con inyeccion de un extractor propio).
- Pre-expansion de clases farmacologicas ATC para que un farmaco especifico matchee directamente con su clase.
- No genera texto, no razona, no soporta tool calling ni agentes: es un recurso de datos.

## Casos de uso

- Apps de paciente sobre FHIR: al recibir un recurso MedicationRequest con codigo RxNorm, el bundle resuelve el producto (p. ej. `RXNORM:860975` a metformina) y expone sus asociaciones sin llamadas a servicios externos.
- Integracion de resultados de laboratorio: los codigos LOINC de pedidos se convierten a partes LP mediante el crosswalk incluido, permitiendo matchear tests ordenables con miembros LP-keyed.
- Historial de condiciones: los codigos ICD-10 del paciente se traducen a CIDs ancla SNOMED (via puente CUI) para consultas por `by_cid` sin resolucion adicional.
- Deteccion de eventos adversos y asociaciones farmaco-condicion: el bucket `treats` y el bucket `condition` permiten vincular medicamentos con condiciones tratadas o adversas.
- Modo offline o sin codigo: para items solo textuales (sin CID), el resolver ESM con embeddings PubMedBERT q8 en ONNX permite matching en el navegador via transformers.js.
- Herramientas de depuracion y auditoria clinica: el formato JSON sin comprimir y el fichero de metadatos con checksums facilitan verificacion de versiones y trazabilidad de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de rendimiento implicito es el emparejamiento determinista por CID con similitud 1.0 (exacto, sin metricas de evaluacion publicadas). El corpus de origen reporta un 95,7% de resolucion canonica sobre 28.550 pares clinicos.

## Requisitos de hardware

- No requiere GPU: el camino principal (matching por CID) es pura consulta de diccionario/conjunto en memoria.
- Memoria: bundle comprimido de ~0,9 MB (asociaciones) y ~5,9 MB (centroides); descomprimidos ~10 MB y ~26 MB respectivamente. Carga unica al inicio de la aplicacion.
- El fallback de embeddings puede ejecutarse en CPU o navegador via transformers.js (ONNX q8, PubMedBERT 768-dim); no se especifican requisitos de VRAM.
- Despliegue: carga directa en aplicaciones JavaScript/ESM (modulo `associations_resolver.js`); alternativamente, un servidor de modelos puede exponer el endpoint `/api/associations`. No aplica vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo LLM.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Recurso | Tipo | Formato | Embeddings | Licencia |
|---|---|---|---|---|
| fhir4ds/associations | Grafo de asociaciones clinicas CID-keyed | JSON/JSON.gz + ONNX | PubMedBERT q8, 768-dim (fallback) | no disponible |
| joelmontavon/fhir4px-embeddings-onnx | Bundle de embeddings ONNX (p4_centroids) | ONNX | PubMedBERT q8, 768-dim | no disponible |
| UMLS / SNOMED CT | Terminologias clinicas de referencia | Propietario | No | Restringidas (UMLS/SNOMED requieren licencia) |

A diferencia de terminologias generales como UMLS o SNOMED CT, este bundle esta pre-resuelto y orientado a consumo directo por aplicaciones, con crosswalks incluidos, pero cubre un dominio mas estrecho definido por los value sets de medterm4ds.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no razona y no sustituye a un LLM en tareas de lenguaje natural.
- Licencia no declarada en Hugging Face; sin ella, el uso comercial y la redistribucion no pueden considerarse autorizados hasta verificarla.
- Contenido clinico en ingles; no hay soporte multilingue documentado.
- En versiones tempranas, los buckets `treats` pueden contener sangrado residual de eventos adversos (flag en `associations.meta.json`); los buckets deterministas (lab/vital/procedure/medication/condition) no se ven afectados.
- El fallback solo-texto depende de la calidad de los embeddings de PubMedBERT y puede degradar la precision respecto al matching exacto por CID.
- La cobertura esta limitada a los value sets canonicos de medterm4ds; conceptos fuera de ellos no tendran asociaciones.
- Riesgo de alucinacion: no aplica por no ser generativo, pero errores de mapeo en los crosswalks (ICD-10 a SNOMED usa fallback por categoria) pueden inducir asociaciones imprecisas.
- Datos de descargas y likes en cero en el momento de la ficha; adopcion y madurez no contrastadas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/fhir4ds/associations
- Bundle de embeddings relacionado: https://huggingface.co/joelmontavon/fhir4px-embeddings-onnx
- Repositorio de codigo (fhir4px-model, scripts de construccion): no disponible (no se publica URL)
- Paper o demo: no disponible

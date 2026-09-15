# elifepathways/sciencebeam-sequence-models

## Resumen

ScienceBeam sequence models es un conjunto de modelos de etiquetado de secuencias (sequence labelling) publicados por el usuario `elifepathways` para la extracción de referencias bibliográficas en artículos científicos. No es un modelo de lenguaje: son modelos de campos aleatorios condicionales (CRF) en formato Wapiti, pensados como reemplazo directo de modelos concretos del pipeline de GROBID, con el mismo diseño de features, el mismo conjunto de etiquetas (salvo una) y el mismo formato `model.wapiti` que los modelos originales.

El repositorio contiene dos artefactos principales, un segmentador de referencias y un modelo de citas, entrenados sobre el corpus de GROBID 0.9.0 más datos sintéticos generados por `sciencebeam-parser` a partir de los PDF y JATS de dos corpus de acceso abierto: SciELO Preprints (DOI `10.1590`, CC-BY 4.0) y Open Research Europe (DOI `10.12688`, CC-BY 4.0). Incluye además dos controles entrenados solo con el corpus de GROBID 0.9.0, cuyo propósito es aislar el efecto de los datos adicionales en cualquier comparación.

Su relevancia es acotada pero muy específica: para equipos que ya operan `sciencebeam-parser` o GROBID sobre corpus de acceso abierto, ofrecen una vía de mejora medible sin cambiar de arquitectura ni de formato de artefacto. El repositorio no declara número de parámetros, número de tokens de entrenamiento ni idiomas soportados, y no publica cifras de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CRF (conditional random field) lineal sobre features discretas, en formato Wapiti; etiquetado de secuencias a nivel de token |
| Parametros totales | no disponible (no se declara; en CRF el tamaño depende del numero de features y etiquetas, no de una cifra de parametros neurales) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la ventana efectiva viene dada por la plantilla de features del CRF, no declarada en la model card) |
| Tipos de cuantizacion | no aplica (los artefactos son ficheros Wapiti `model.wapiti.gz`, no pesos tensoriales) |
| Idiomas soportados | no disponible (la model card no declara idiomas; los corpus de entrenamiento son SciELO Preprints y Open Research Europe) |
| Licencia | Apache-2.0 |
| Formato de pesos | Wapiti (`model.wapiti.gz`) mas `training.yml` con hiperparametros y checksum |
| Tarea | token-classification / sequence-labelling |
| Modelos incluidos | reference segmenter y citation (2 modelos con datos generados + 2 controles solo con GROBID 0.9.0) |
| Motor de inferencia | Wapiti |
| Tamano del repositorio | 0,0 GB segun la ficha de HuggingFace |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-15 |

## Arquitectura y entrenamiento

La arquitectura es un CRF de Wapiti, heredada directamente de GROBID: misma plantilla de features, mismo conjunto de etiquetas y mismo layout de features por token. El texto de entrada se procesa token a token y el modelo asigna etiquetas BIO de secuencia. La única diferencia declarada respecto a los modelos publicados de GROBID es que estos artefactos no predicen la etiqueta `I-<other>` que marca el primer token de una racha de texto sin etiquetar; el texto de fondo se etiqueta como `<other>` de forma consistente. Cada directorio de artefacto contiene `model.wapiti.gz` y un `training.yml` que registra el corpus, los hiperparametros, el layout de features esperado y el checksum del fichero adyacente.

Los datos de entrenamiento combinan dos fuentes. La primera es el corpus de entrenamiento propio de GROBID 0.9.0 para cada modelo, que es el origen del layout de features, el conjunto de etiquetas y la plantilla CRF compartida, y el único input al que se aplica la etiqueta de version `0.9.0`. La segunda son datos generados automáticamente por `sciencebeam-parser` a partir del PDF y el JATS de artículos de SciELO Preprints y Open Research Europe. Los artefactos con datos generados llevan el sufijo `2026-09-08_wapiti_grobid_090_scielo_preprints_ore`; los controles llevan `2026-08-04_wapiti_grobid_090_grobid_only` y se entrenaron exclusivamente con el corpus de GROBID 0.9.0 usando el mismo pipeline y los mismos ajustes, de modo que cualquier diferencia medida sea atribuible a los datos añadidos y no al pipeline.

La innovación técnica es, por tanto, de datos y de proceso, no de arquitectura: generación de datos de entrenamiento etiquetados a partir de corpus de acceso abierto, reentrenamiento del CRF con esos datos y empaquetado como artefacto intercambiable por modelo individual dentro de un perfil de parser. La model card indica que los modelos se seleccionan por perfil (`sequence_model_profiles`), no como un conjunto cerrado, de forma que un perfil puede usar uno de estos modelos y dejar el resto del pipeline con los modelos propios de GROBID.

## Capacidades

- Segmentación de la sección de referencias bibliográficas en documentos científicos (modelo `reference-segmenter`).
- Extracción y etiquetado de citas bibliográficas dentro de la sección de referencias (modelo `citation`).
- Etiquetado de secuencias a nivel de token con esquema BIO sobre texto científico.
- Funcionamiento como reemplazo directo de modelos individuales de GROBID dentro de `sciencebeam-parser`, sin cambios de formato ni de motor.
- Selección por perfil de parser: permite mezclar estos modelos con los de GROBID en un mismo pipeline.
- Trazabilidad de entrenamiento: cada artefacto incluye `training.yml` con datos, hiperparametros, layout de features y checksum.
- Controles experimentales: dos artefactos entrenados solo con GROBID 0.9.0 para comparaciones atribuibles a los datos añadidos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto libre: no es un modelo generativo.
- Capacidades multilingües: no disponibles como dato declarado; la model card no especifica idiomas soportados.

## Casos de uso

- Extracción de referencias en repositorios de acceso abierto: sustituir el modelo de segmentación y el de citas de GROBID por estos artefactos en un pipeline `sciencebeam-parser` para parsear lotes de PDF de SciELO Preprints u Open Research Europe, manteniendo el resto del pipeline intacto.
- Indexación de literatura científica: alimentar un motor de búsqueda académica con referencias estructuradas (autores, título, año, DOI) extraídas a nivel de token, reduciendo el trabajo manual de curación.
- Enriquecimiento de metadatos editoriales: en un flujo de producción de una revista, aplicar el modelo de citas sobre los JATS entrantes para poblar tablas de referencias cruzadas y detectar citas mal formadas.
- Migración incremental de pipelines GROBID existentes: usar un perfil que tome solo uno de estos modelos (por ejemplo, `citation`) y deje los demás en GROBID, midiendo el efecto de forma aislada antes de ampliar la adopción.
- Evaluación comparativa reproducible: emplear los artefactos de control `grobid_only` como línea base en un benchmark interno para cuantificar la ganancia atribuible a los datos generados de SciELO Preprints y Open Research Europe.
- Despliegue en entornos sin GPU: al ser CRF sobre CPU, se puede integrar en servicios de parseo que corren en contenedores sin acelerador, con un coste de memoria muy inferior al de un modelo neuronal.
- Control de calidad de citas en flujos de revisión por pares: etiquetar la sección de referencias de un manuscrito para verificar que cada cita del cuerpo tiene entrada bibliográfica y viceversa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que los modelos se seleccionaron frente a GROBID 0.9.0 en un benchmark interno sobre corpus de acceso abierto, pero no incluye cifras, métricas ni tablas de resultados, y advierte explícitamente de que la magnitud de la mejora depende del corpus y de la métrica utilizada, por lo que recomienda medir sobre documentos propios.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; Wapiti ejecuta CRF sobre CPU y no requiere GPU.
- GPU recomendadas: ninguna. No hay soporte declarado de aceleración por GPU en la model card.
- Compatibilidad con GPU de consumo: irrelevante para este tipo de artefacto; no se necesita GPU de consumo ni profesional.
- Opciones de despliegue: `sciencebeam-parser` configurando una entrada en `sequence_model_profiles` con `engine: 'wapiti'`; integración dentro de pipelines GROBID-style; uso de las URLs `resolve/<commit-sha>` de HuggingFace para descargar el directorio del artefacto (el parser añade `model.wapiti.gz`).
- Almacenamiento: el repositorio completo figura como 0,0 GB en la ficha de HuggingFace, por lo que el peso de los artefactos es muy reducido.
- Latencia y throughput: no disponibles.
- Recomendación operativa de la model card: fijar un commit sha en lugar de `main`, de modo que cualquier cambio en lo que sirve una configuración quede como un diff visible; una petición `HEAD` contra cualquier URL `resolve/main` devuelve el commit actual en `X-Repo-Commit`.

## Comparativa con modelos similares

| Modelo | Tipo | Datos de entrenamiento | Etiqueta `I-<other>` | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ScienceBeam sequence models (con datos generados) | CRF Wapiti | GROBID 0.9.0 + datos generados de SciELO Preprints y Open Research Europe | No la predicen; el texto de fondo se etiqueta `<other>` | Apache-2.0 | HuggingFace, por commit sha |
| ScienceBeam controles (`2026-08-04_..._grobid_only`) | CRF Wapiti | Solo corpus de GROBID 0.9.0 | No la predicen | Apache-2.0 | HuggingFace; no recomendados para servir |
| Modelos publicados de GROBID 0.9.0 | CRF Wapiti | Corpus propio de GROBID 0.9.0 | Si la predicen | Apache-2.0 | Repositorio de GROBID |

No se dispone de datos de rendimiento comparativos entre estas alternativas en la informacion proporcionada, por lo que la comparacion se limita a procedencia de datos, formato de etiquetas, licencia y disponibilidad. La model card indica que los controles existen unicamente para atribuir diferencias a los datos añadidos y que los modelos publicados de GROBID son los que deben usarse para servir en produccion si no se ha medido una mejora propia.

## Limitaciones y advertencias

- No es un modelo generativo ni un modelo de lenguaje: no produce texto, no razona, no soporta tool calling ni agentes.
- Ausencia de la etiqueta `I-<other>`: el comportamiento sobre texto sin etiquetar difiere del de los modelos publicados de GROBID, lo que puede afectar a pipelines que dependan de esa marca.
- Sesgos conocidos: no disponibles; la model card no reporta análisis de sesgo ni de cobertura por idioma, disciplina o tipo de documento.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de etiquetado incorrecto de referencias y de segmentación errónea en documentos con formatos atípicos.
- Limitaciones de contexto e idioma: no declaradas. Los modelos se entrenaron con artículos de SciELO Preprints y Open Research Europe, pero no se especifica el reparto idiomático ni la cobertura más allá de esos corpus.
- Datos de entrenamiento no publicados: ni los datos generados ni la colección de artículos fuente se distribuyen, porque su redistribución depende de los términos de los corpus originales. Reentrenar desde cero exige volver a ejecutar el paso de generación, no una simple descarga.
- No respaldado por GROBID: la model card indica explícitamente que estos modelos no son los publicados por el proyecto GROBID y que no cuentan con su endorsement.
- Advertencia de medición: la propia model card señala que la utilidad depende del corpus y de la métrica, y recomienda medir sobre documentos propios en lugar de asumir cifras ajenas.
- Adopción nula en el momento de la ficha: 0 descargas y 0 likes, lo que implica ausencia de validación por parte de la comunidad.
- Licencia Apache-2.0: permite uso comercial, pero la atribución a GROBID y a los corpus CC-BY 4.0 citados debe mantenerse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/elifepathways/sciencebeam-sequence-models
- Repositorio `sciencebeam-parser`: https://github.com/elifesciences/sciencebeam-parser
- GROBID: https://github.com/kermitt2/grobid
- SciELO Preprints: https://preprints.scielo.org/
- Open Research Europe: https://open-research-europe.ec.europa.eu/

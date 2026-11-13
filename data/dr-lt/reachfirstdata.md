# dr-lt/reachfirstdata

## Resumen

`dr-lt/reachfirstdata` no es un modelo de aprendizaje automatico, sino un repositorio de documentacion de gobernanza de datos: contiene la ficha tecnica (datasheet) y el registro de remediacion del fichero de trabajo asociado a ReachFirst, un prototipo de priorizacion de alcance social descrito en el marco del AI Governance Practicum (Track 1). El autor del repositorio es el usuario `dr-lt`; el contenido narrativo de la model card atribuye la autoria del datasheet a Lauren Chen como "AI Governance Lead" de una organizacion ficticia, Crosswind Workforce Partnership. La organizacion, el sistema y las personas son ficticios; los datos subyacentes son reales y publicos: el conjunto Adult (Census Income) del repositorio UCI Machine Learning, id 2, de Becker y Kohavi (1996), bajo licencia CC BY 4.0.

El repositorio no aloja una copia del conjunto de datos ni pesos de ningun tipo. Segun la model card, el fichero `crosswind_pilot_extract_remediated.csv` (48.790 filas, 18 columnas, MD5 `ca9ed6d4b9dfd59f3f586b09da05b31f`) reside en otro repositorio, `drdavidprivacy/practicum-case-packs`, y los cuadernos del curso lo cargan por URL. Este repositorio contiene unicamente `README.md`, `DATA_REMEDIATION_LOG.md`, `Data-Remediation-Log.pdf` y `Dataset-Datasheet_Chen-exemplar.pdf`.

Su relevancia es documental y pedagogica: sirve como ejemplo de datasheet estructurado segun Gebru et al. ("Datasheets for Datasets") aplicado a un caso de clasificacion tabular con implicaciones de equidad y gobernanza en el sector publico. No debe evaluarse como un modelo desplegable, y de hecho no lo es.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo; repositorio de documentacion de datos) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-4.0 |
| Formato de pesos | no disponible (no contiene pesos; incluye Markdown y PDF) |

## Arquitectura y entrenamiento

No aplica: el repositorio no contiene un modelo entrenado ni codigo de entrenamiento. El artefacto central es un datasheet en la estructura de Gebru et al., acompanado de un registro de remediacion (`DATA_REMEDIATION_LOG.md` y su PDF) que documenta cada cambio aplicado al extracto antes del entrenamiento del primer modelo, en la "Semana 3" del practicum. La model card cita que el extracto se construyo a partir de un sistema de registros anterior, con una muestra ponderada a los totales de una poblacion, conservando solo registros de adultos con ingresos propios por encima de un umbral, peso positivo y horas trabajadas mayores que cero.

El dataset de origen es Adult (Census Income) de UCI, con 48.842 registros y 15 campos cargados (14 campos mas la variable de resultado) en su forma original; tras la remediacion del proveedor, el fichero de trabajo queda en 48.790 filas y 18 columnas, con 10 entradas de modelo, 7 campos excluidos de las entradas y la columna de resultado. La model card menciona el uso del modelo `drdavidprivacy/reachfirst-model` y del Space `drdavidprivacy/reachfirst` como consumidores de estos datos, pero no se aportan detalles de arquitectura, tokens de entrenamiento ni tecnicas de alineacion.

## Capacidades

- Documentacion de gobernanza de datos: recoge motivacion, composicion, proceso de recoleccion, preprocesado, usos previstos, distribucion y mantenimiento del conjunto, segun el formato de datasheet de Gebru et al.
- Trazabilidad de remediacion: el registro documenta cada cambio aplicado al extracto antes del primer entrenamiento, con evidencia para las secciones 2 y 4 del datasheet.
- Soporte de auditoria de equidad: el repositorio etiqueta explicitamente `fairness`, `ai-governance` y `public-sector`, y describe el sistema ReachFirst como priorizacion de alcance, no como decision de elegibilidad.
- Material didactico: el datasheet se presenta como "exemplar" (respuesta modelo) del ejercicio de la Semana 3, pensado para que los estudiantes lo sustituyan por el suyo.
- No ofrece generacion de texto, razonamiento, codigo, vision, tool calling, agentes ni capacidades multilingues: no es un modelo linguistico.

## Casos de uso

- Formacion en gobernanza de IA: usar el datasheet como plantilla de referencia para que equipos de ciencia de datos redacten la documentacion de sus propios conjuntos, siguiendo la estructura de Gebru et al. y sustituyendo el contenido ficticio por el real.
- Auditoria de conjuntos de datos tabulares: el registro de remediacion sirve como ejemplo de como documentar cambios de preprocesado (filtrado de filas, columnas derivadas, campos excluidos) con evidencia reproducible y sumas de comprobacion MD5.
- Evaluacion de riesgos en sistemas de priorizacion social: el caso ReachFirst ilustra como separar la funcion de priorizar el alcance de la de decidir la elegibilidad, un patron reutilizable en administraciones publicas que despliegan modelos de triaje de beneficiarios.
- Docencia de equidad algoritmica: el repositorio permite construir ejercicios sobre el conjunto Adult de UCI con un marco narrativo realista (presupuesto de alcance limitado, tasa de adopcion inferior al 40 % en hogares elegibles) sin exponer datos personales.
- Revision de cumplimiento interno: equipos juridicos o de compliance pueden usar el datasheet como lista de comprobacion de las preguntas que debe responder cualquier conjunto de datos antes de alimentar un modelo en produccion.
- Reproducibilidad de experimentos: los cuadernos del curso cargan el CSV por URL desde `drdavidprivacy/practicum-case-packs`, lo que facilita que distintos equipos trabajen sobre exactamente el mismo fichero verificable por MD5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no contiene un modelo evaluable ni metricas de rendimiento predictivo; las unicas cifras presentes son descriptivas del conjunto (48.842 registros originales, 48.790 tras remediacion, 18 columnas, 10 entradas de modelo) y contextuales del programa (tasa de adopcion inferior al 40 % en hogares estimados elegibles).

## Requisitos de hardware

- VRAM para inferencia: no aplica; el repositorio no contiene pesos ni requiere GPU.
- GPU recomendadas: no disponible; no hay inferencia que ejecutar.
- Ejecucion en GPU de consumo: no aplica.
- Opciones de despliegue: no aplica para este repositorio. El modelo asociado (`drdavidprivacy/reachfirst-model`) y el Space (`drdavidprivacy/reachfirst`) se citan en la model card, pero no se detallan sus requisitos de despliegue.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No existen modelos comparables en sentido estricto porque este repositorio no es un modelo. Como referencia de la categoria de artefactos, se puede contrastar con otras fichas de datos publicadas bajo el formato de Gebru et al. o con datasheets de conjuntos tabulares de UCI, pero la informacion proporcionada no incluye ninguna comparacion de ese tipo.

| Criterio | `dr-lt/reachfirstdata` | Alternativas |
|---|---|---|
| Tipo de artefacto | Repositorio de documentacion (datasheet y log) | no disponible |
| Parametros | no aplica | no disponible |
| Contexto | no aplica | no disponible |
| Licencia | CC BY 4.0 | no disponible |
| Disponibilidad | Publico en Hugging Face, 0 descargas, 0 likes | no disponible |

## Limitaciones y advertencias

- No es un modelo: no genera texto, no razona, no soporta tool calling ni agentes. Cualquier evaluacion que espere capacidades de inferencia fracasara.
- Contenido ficticio: la organizacion, el sistema y las personas del datasheet son inventados; solo los datos subyacentes (Adult, UCI id 2) son reales y publicos.
- El repositorio no contiene el CSV: quien necesite el fichero debe descargarlo de `drdavidprivacy/practicum-case-packs` y verificar el MD5 indicado.
- El conjunto de origen (Adult) tiene sesgos historicos conocidos en variables como sexo, raza y pais de origen, y el propio datasheet reconoce que el extracto no es una muestra del universo de alcance de Crosswind; la correspondencia entre ambos no esta resuelta en el texto disponible.
- Licencia CC BY 4.0: permite uso comercial con atribucion, pero esa licencia cubre la documentacion y, por extension declarada, los datos de origen; no hay restricciones adicionales especificadas, aunque tampoco hay garantias de idoneidad para produccion.
- Fechas incoherentes: el repositorio figura como creado el 2026-11-13, lo que sugiere metadatos incorrectos o un entorno de prueba; conviene verificar antes de citarlo.
- Cero descargas y cero likes: no hay evidencia de uso o validacion por parte de la comunidad.
- No se han publicado benchmarks, metricas de rendimiento del modelo asociado ni detalles de su arquitectura en la informacion disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/dr-lt/reachfirstdata
- Conjunto de datos referenciado: https://huggingface.co/datasets/drdavidprivacy/practicum-case-packs
- CSV de trabajo: https://huggingface.co/datasets/drdavidprivacy/practicum-case-packs/resolve/main/crosswind_pilot_extract_remediated.csv
- Modelo asociado: https://huggingface.co/drdavidprivacy/reachfirst-model
- Space asociado: https://huggingface.co/spaces/drdavidprivacy/reachfirst
- Conjunto original Adult (Census Income), UCI Machine Learning Repository, id 2: no disponible en la informacion proporcionada
- Gebru et al., "Datasheets for Datasets": no disponible en la informacion proporcionada
- Becker y Kohavi (1996), referencia citada del conjunto Adult: no disponible en la informacion proporcionada

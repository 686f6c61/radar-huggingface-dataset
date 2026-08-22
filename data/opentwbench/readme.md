# OpenTWBench/README

## Resumen

OpenTWBench es un conjunto de evaluación (benchmark suite) de código abierto diseñado para medir el conocimiento de modelos de lenguaje sobre Taiwán: su derecho, medicina, administración pública, sistema territorial, educación, industria e instituciones cívicas. Las preguntas están formuladas en chino tradicional (zh-TW), tal y como se plantean en el propio Taiwán, y proceden de los exámenes nacionales publicados por el Ministerio de Exámenes (考選部). El proyecto lo mantiene la organización OpenTWBench en HuggingFace.

La motivación principal es que la mayoría de los benchmarks en chino se construyen a partir de fuentes continentales, en chino simplificado y sobre instituciones de la China continental. Un modelo puede obtener buenos resultados en esos benchmarks sin saber nada sobre la Ley de Normas Laborales, la Ley de Registro de Hogares o cómo se licencia a un farmacéutico taiwanés. OpenTWBench pretende hacer medible esa brecha.

Cada conjunto de datos se publica como un dataset independiente con el nombre `tw-<dominio>-benchmark`, en formato Twinkle Eval MCQ (pregunta, opciones A-D, respuesta) e incluye columnas de procedencia (año, examen, asignatura, documento fuente). El proyecto también ofrece un leaderboard en opentwbench.ai con los resultados de los modelos evaluados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo, es un conjunto de datos de evaluación) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Chino tradicional (zh-TW) |
| Licencia | Apache-2.0 para el empaquetado, parseo y metadatos; las preguntas y claves de respuesta son publicaciones oficiales del Ministerio de Exámenes (República de China, Taiwán) liberadas como datos abiertos |
| Formato de pesos | no disponible (los datos se distribuyen en formato Twinkle Eval MCQ, no como pesos de modelo) |

## Arquitectura y entrenamiento

OpenTWBench no es un modelo de lenguaje, sino un conjunto de datos de evaluación. No tiene arquitectura ni proceso de entrenamiento. Su construcción se basa en la extracción, limpieza y publicación de exámenes nacionales de Taiwán, que son documentos PDF oficiales con claves de respuesta. El proceso de parseo aborda varios problemas técnicos: los marcadores de opción son glifos de Área de Uso Privado (PUA) en lugar de letras, las claves de respuesta son cuadrículas cuyo texto aparece desordenado (se emparejan celdas por coordenadas de página, no por orden de lectura), y los documentos se cruzan con el número de preguntas declarado en la propia hoja de respuestas para detectar desalineaciones. También se deduplican ítems que aparecen en varias categorías de examen y se descartan preguntas en inglés, de selección múltiple, anuladas o que referencian figuras impresas en papel.

## Capacidades

- Evalúa conocimiento de dominio específico de Taiwán: derecho, medicina, administración pública, sistema territorial, educación, industria e instituciones cívicas.
- Preguntas formuladas en chino tradicional (zh-TW), con opciones A-D y clave de respuesta oficial.
- Formato Twinkle Eval MCQ, compatible con el harness de evaluación Twinkle Eval.
- Incluye metadatos de procedencia (año, examen, asignatura, documento fuente) para trazabilidad.
- Permite comparación relativa entre modelos, no puntuaciones absolutas (los exámenes son públicos y pueden estar en los corpus de preentrenamiento).
- Soporta barajado de opciones para mitigar el sesgo de posición de respuesta en los documentos originales.

## Casos de uso

- Evaluación comparativa de modelos en conocimiento de Taiwán: un desarrollador puede ejecutar los datasets de OpenTWBench con su modelo y comparar resultados con otros modelos en el leaderboard para medir el dominio de instituciones taiwanesas.
- Validación de modelos multilingües en chino tradicional: sirve para comprobar si un modelo entrenado principalmente con datos en chino simplificado o inglés responde correctamente a preguntas formuladas en zh-TW sobre contextos taiwaneses.
- Auditoría de sesgos geográficos: permite detectar si un modelo confunde instituciones de Taiwán con las de la China continental, un problema común en modelos entrenados con datos mayoritariamente continentales.
- Desarrollo de sistemas de asistencia legal o administrativa para Taiwán: los datasets de derecho y administración pública pueden usarse para ajustar o evaluar modelos que deban operar en el contexto regulatorio taiwanés.
- Investigación académica sobre evaluación de conocimiento regional: el conjunto sirve como referencia para estudiar cómo los modelos representan dominios específicos de un país o región.
- Control de calidad en pipelines de datos: el proceso de parseo documentado puede servir como ejemplo de cómo tratar PDFs con claves de respuesta complejas y glifos PUA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. OpenTWBench es en sí mismo un benchmark, pero no se incluyen puntuaciones de modelos en la model card ni en los resultados de búsqueda web. El leaderboard en opentwbench.ai muestra resultados de modelos, pero no se ha accedido a él en esta ficha.

## Requisitos de hardware

No disponible. Al ser un conjunto de datos de evaluación, no requiere hardware específico para su uso. Para ejecutar las evaluaciones se necesita un modelo de lenguaje y el harness Twinkle Eval, cuyos requisitos dependen del modelo evaluado.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar OpenTWBench con otros benchmarks de forma cuantitativa. Sin embargo, se puede mencionar un benchmark relacionado:

- `lianghsun/tw-legal-benchmark-v2`: conjunto de datos de derecho taiwanés con 17.002 preguntas en 15 dominios legales. OpenTWBench declara explícitamente que no duplica el dominio legal, que ya está cubierto por este dataset.

Otros benchmarks de conocimiento regional (por ejemplo, para China continental o Japón) existen, pero no se dispone de datos comparativos en la información proporcionada.

## Limitaciones y advertencias

- Los exámenes son públicos y están ampliamente discutidos en línea, por lo que es muy probable que formen parte de los corpus de preentrenamiento de muchos modelos. Las puntuaciones absolutas deben tratarse con sospecha; el conjunto está diseñado para comparación relativa entre modelos, no para afirmar que un modelo "aprueba" un examen profesional.
- Es necesario verificar la tasa de parseo antes de interpretar puntuaciones bajas. Un modelo que conoce la respuesta pero la escribe en un formato inesperado es un fallo de formato, no de conocimiento, y ambos se confunden con frecuencia.
- Se recomienda barajar las opciones de respuesta, ya que los documentos originales presentan un sesgo en la posición de las respuestas correctas.
- Los datos provienen de publicaciones oficiales del Ministerio de Exámenes de Taiwán. Aunque el empaquetado se distribuye bajo Apache-2.0, quienes deseen redistribuir los datos deben confirmar los términos actuales publicados por 考選部.
- El conjunto no incluye preguntas en inglés, de selección múltiple, anuladas o que referencien figuras impresas, por lo que no cubre todos los formatos posibles de examen.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OpenTWBench/README
- Leaderboard: https://opentwbench.ai
- Dataset relacionado (derecho taiwanés): https://huggingface.co/datasets/lianghsun/tw-legal-benchmark-v2
- Harness de evaluación Twinkle Eval: https://github.com/ai-twinkle/Eval

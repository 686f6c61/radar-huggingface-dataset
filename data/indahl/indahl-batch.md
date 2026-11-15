# indahl/indahl-batch

## Resumen

`indahl/indahl-batch` no es un modelo de lenguaje, sino un plugin para Claude Code publicado en Hugging Face bajo el identificador `indahl/indahl-batch`. Su función es ejecutar comprobaciones, auditorías o revisiones sobre material demasiado extenso para caber en una sola ventana de contexto, como un sitio web completo, un repositorio grande o una carpeta de artículos. El plugin divide el trabajo en lotes, asigna un trabajador nuevo a cada lote con instrucciones fijas y breves, y consolida los resultados sin descartar elementos.

El repositorio no contiene pesos, arquitectura ni datos de entrenamiento: es un artefacto de distribución de una herramienta de orquestación. No se dispone de información sobre el modelo subyacente que utiliza, ya que el plugin se ejecuta dentro de la sesión de Claude Code y delega la inferencia en el modelo configurado por el usuario.

La relevancia de esta ficha es limitada desde el punto de vista de evaluación de modelos: no hay parámetros, contexto, licencia ni benchmarks publicados. Se documenta aquí como artefacto de Hugging Face con la información disponible, indicando explícitamente los datos ausentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (plugin de orquestación, no modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio no contiene pesos) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado. Según la model card, `indahl-batch` es un plugin que se instala en Claude Code mediante el marketplace `Heuremen-LLC/indahl.ai` y se invoca con el comando `/batch` seguido de la tarea a realizar. El plugin genera un brief de una página (`batch/BRIEF.md`), una lista de elementos con recuento, lotes pequeños derivados de esa lista, un fichero de resultados por lote con una fila por elemento (incluidos los ilegibles) y un informe consolidado (`batch/REPORT.md`) con una tabla por pregunta, la lista de elementos faltantes para reintentar, una comprobación puntual de dos elementos y la fecha.

No se publican detalles sobre el mecanismo interno de particionado, la política de reintentos, el formato exacto de los ficheros de resultados ni el modelo subyacente empleado para cada trabajador. Tampoco hay información sobre datos de entrenamiento, RLHF, DPO ni innovaciones técnicas de inferencia, porque el artefacto no es un modelo.

## Capacidades

- Ejecución de comprobaciones, auditorías y revisiones sobre material que excede una ventana de contexto.
- Particionado automático del trabajo en lotes con instrucciones fijas y breves por lote.
- Asignación de un trabajador nuevo (sin historial) a cada lote.
- Persistencia de resultados por lote en ficheros, con una fila por elemento.
- Registro explícito de elementos que no se pudieron leer, para reintento posterior.
- Consolidación final en un informe con tablas por pregunta, lista de faltantes y comprobación puntual.
- Invocación mediante comando `/batch` dentro de Claude Code.
- No contacta servicios externos según la model card: se ejecuta dentro de la sesión del usuario.
- No se documentan capacidades de tool calling, agentes multi-paso, visión, audio ni modo de razonamiento más allá de la orquestación descrita.

## Casos de uso

- Auditoría de documentación web: el plugin recorre cada página de un sitio de documentación y la contrasta con una guía de estilo, generando un fichero de resultados por lote y un informe consolidado con las desviaciones detectadas.
- Revisión de repositorios grandes: se aplica sobre un árbol de código completo para comprobar convenciones, licencias o patrones prohibidos, con una fila por fichero revisado y una lista de ficheros ilegibles para reintentar.
- Triaje de carpetas de artículos: se procesa una colección de PDFs o textos y se extrae una respuesta uniforme por documento (por ejemplo, metodología y conclusiones), con resultados persistidos por lote.
- Cumplimiento normativo sobre corpus extensos: se verifica cada elemento de un corpus contra una lista fija de requisitos, dejando trazabilidad en `batch/REPORT.md` con fecha y comprobación puntual.
- Control de calidad de catálogos o inventarios: se revisan miles de entradas contra criterios homogéneos, con recuento de elementos y registro de los que no se pudieron leer.
- Migraciones y refactorizaciones: se audita cada fichero de un proyecto antes de una migración, generando un inventario de problemas por lote que sirve como plan de trabajo.
- Revisión por muestreo reproducible: la comprobación puntual de dos elementos incluida en el informe permite verificar la calidad del proceso sin revisar todo el material manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No aplica en el sentido habitual: el plugin no incluye pesos ni requiere GPU propia.
- Requiere una instalación funcional de Claude Code y una sesión activa del usuario.
- El coste computacional y de tokens depende del modelo configurado en Claude Code y del volumen de material procesado, no del plugin.
- No se especifican latencia ni throughput; dependen del modelo subyacente y del número de lotes.
- Opciones de despliegue: instalación como plugin de Claude Code mediante `/plugin marketplace add Heuremen-LLC/indahl.ai` y `/plugin install indahl-batch@heuremen`.
- No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos o herramientas comparables con especificaciones verificables.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no debe evaluarse como tal ni compararse por parámetros, contexto o benchmarks.
- La licencia no está publicada en el repositorio de Hugging Face; no se puede confirmar el uso comercial sin consultar los términos en https://indahl.ai/terms.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas del modelo subyacente.
- La calidad de los resultados depende del modelo configurado en Claude Code y de la claridad de las instrucciones fijas del brief.
- El repositorio no contiene pesos ni código visible en la información disponible; la fuente indicada es un repositorio externo en GitHub.
- El recuento de descargas y likes es cero en el momento de la consulta, lo que impide valorar adopción o madurez.
- Los elementos ilegibles se registran para reintento, pero no se especifica la política de reintentos ni el límite de los mismos.
- No se detalla el tratamiento de datos sensibles más allá de la afirmación de que el plugin no contacta servicios externos.

## Enlaces

- Hugging Face: https://huggingface.co/indahl/indahl-batch
- Privacidad: https://indahl.ai/privacy
- Términos: https://indahl.ai/terms
- Sitio del autor: https://indahl.ai
- Código fuente: https://github.com/Heuremen-LLC/indahl.ai/tree/main/claude-plugins/src/batch
- Marketplace del plugin: https://github.com/Heuremen-LLC/indahl.ai

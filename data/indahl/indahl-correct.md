# indahl/indahl-correct

## Resumen

`indahl/indahl-correct` no es un modelo de lenguaje, sino un plugin para Claude Code publicado en Hugging Face bajo el identificador `indahl/indahl-correct`. Lo desarrolla Heuremen LLC y su funcion es registrar correcciones editoriales junto al contenido original, sin sobrescribirlo: captura el error, quien lo detecto, cuando, la evidencia, el texto corregido y el alcance de la correccion en elementos que citaban la version original.

El plugin se invoca mediante el comando `/correct` dentro de una sesion de Claude Code y genera una entrada anadida en un fichero `CORRECTIONS.md`, una nota visible en el punto corregido (manteniendo el original recuperable) y una lista de destinos afectados marcados como UPDATED, NOTIFIED, CANNOT_REACH o NOT_NEEDED. Esta pensado para entornos donde un error ya se ha publicado o enviado: papers, paginas web, informes, datasets o mensajes.

Es relevante por su enfoque de trazabilidad editorial: no modifica el original, sino que anade una capa de auditoria sobre el mismo. No incluye pesos, no ejecuta inferencia propia y no contacta servicios externos; toda la logica se ejecuta dentro de la sesion del usuario. La licencia es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (plugin para Claude Code, no es un modelo neuronal) |
| Parametros totales | No disponible (no aplica) |
| Parametros activos | No disponible (no aplica) |
| Longitud de contexto | No disponible (depende del contexto de la sesion de Claude Code) |
| Tipos de cuantizacion | No disponible (no aplica) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | No disponible (no hay pesos; se distribuye como plugin via marketplace de Claude Code) |

## Arquitectura y entrenamiento

No es un modelo entrenado. `indahl-correct` es un plugin que se instala en Claude Code mediante `/plugin marketplace add Heuremen-LLC/indahl.ai` y `/plugin install indahl-correct@heuremen`. Su funcionamiento se apoya en el modelo subyacente de Claude Code y en las herramientas del entorno (lectura y escritura de ficheros, apertura de fuentes indicadas por el usuario).

No hay datos de entrenamiento, dataset, tokens procesados ni tecnicas de RLHF/DPO asociadas, porque no existe un proceso de entrenamiento. La logica del plugin consiste en: recibir la instruccion `/correct` con la descripcion del error, localizar el original y su correccion, registrar la entrada en `CORRECTIONS.md` con fecha, item, original, texto corregido, evidencia, detector y alcance, insertar una nota visible en el punto corregido y enumerar los destinos donde el original habia llegado, marcando su estado. No contacta servicios externos y solo abre las fuentes que el usuario le indica.

## Capacidades

- Registro de correcciones editoriales con metadatos: fecha, item afectado, texto original, texto corregido, evidencia, autor de la deteccion y alcance.
- Conservacion del original de forma recuperable junto a la nota de correccion.
- Generacion y anexado de entradas en `CORRECTIONS.md`.
- Insercion de notas visibles en el punto exacto corregido.
- Enumeracion de destinos afectados por la version original, con estados UPDATED, NOTIFIED, CANNOT_REACH y NOT_NEEDED.
- Ejecucion dentro de la sesion de Claude Code, sin dependencias externas ni requisitos adicionales.
- Invocacion mediante el comando `/correct` seguido de la descripcion del error.
- Sin contacto con servicios externos; solo accede a las fuentes indicadas por el usuario.

## Casos de uso

- Correccion de papers academicos: cuando se detecta un dato erroneo en un articulo ya publicado, el plugin registra la correccion en `CORRECTIONS.md`, anade una nota en el punto afectado y enumera las citas o replicaciones que habian incorporado el dato original para su notificacion.
- Erratas en informes corporativos: ante una cifra incorrecta en un informe trimestral ya distribuido, `/correct` deja constancia de la version original, la corregida y la evidencia (por ejemplo, la tabla fuente), y lista los destinatarios o repositorios donde se habia publicado.
- Correccion de datasets publicados: si se detecta una etiqueta erronea en un dataset ya difundido, el plugin documenta el cambio sin eliminar el registro original y permite marcar los derivados que lo usaron.
- Gestion de errores en documentacion tecnica: en una pagina web o manual con un procedimiento incorrecto, se anade la nota de correccion manteniendo el texto original recuperable y se enumeran las secciones que lo referenciaban.
- Trazabilidad en comunicaciones enviadas: cuando un mensaje ya enviado contiene un error, el plugin registra la correccion con evidencia y alcance, permitiendo auditar que destinatarios fueron notificados y cuales no se pudieron alcanzar.
- Auditoria editorial en equipos: el fichero `CORRECTIONS.md` actua como registro central de erratas con responsable y fecha, util para revisiones internas y para demostrar diligencia ante terceros.
- Correccion de material docente o divulgativo: si una publicacion contiene un dato erroneo, se conserva el original con nota visible y se listan las plataformas donde se replico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el plugin no ejecuta inferencia propia y se apoya en el modelo subyacente de Claude Code.
- GPU recomendadas: no aplica; el requisito es disponer de una sesion de Claude Code operativa.
- Cabe en GPU de consumo: no aplica.
- Opciones de despliegue: instalacion como plugin de Claude Code via marketplace (`/plugin marketplace add Heuremen-LLC/indahl.ai` y `/plugin install indahl-correct@heuremen`). No se distribuye como pesos para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible; dependen del modelo y la sesion de Claude Code subyacentes.
- Requisitos declarados por el autor: ninguno.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada alternativas comparables de la misma categoria (plugins de registro de correcciones para Claude Code). La comparacion con modelos de lenguaje no procede porque `indahl-correct` no es un modelo.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto de forma autonoma ni dispone de pesos, contexto propio ni capacidades de razonamiento independientes.
- Su comportamiento depende del modelo subyacente de Claude Code y de la sesion en la que se ejecuta.
- Solo abre las fuentes que el usuario le indica; no descubre por si mismo todos los lugares donde se publico el original, por lo que la lista de destinos puede ser incompleta.
- Los estados CANNOT_REACH y NOT_NEEDED requieren juicio del usuario; el plugin no garantiza que la notificacion se haya producido efectivamente.
- No se dispone de informacion sobre sesgos, tasas de alucinacion ni evaluacion de calidad del registro de correcciones.
- Idiomas soportados no declarados; el README esta en ingles.
- Licencia MIT: permite uso comercial y modificacion con atribucion, sin garantias explicitas en la informacion disponible.
- Proyecto con 0 descargas y 0 likes en el momento de la consulta; madurez y soporte no verificables.
- El identificador incluye la etiqueta `claude-code-plugin`, lo que confirma que no debe tratarse como un modelo desplegable en pipelines de inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/indahl/indahl-correct
- Repositorio fuente: https://github.com/Heuremen-LLC/indahl.ai/tree/main/claude-plugins/src/correct
- Mirror del plugin: https://github.com/Heuremen-LLC/indahl-correct
- Sitio del autor: https://indahl.ai
- Politica de privacidad: https://indahl.ai/privacy
- Terminos de uso: https://indahl.ai/terms
- Marketplace del plugin: Heuremen-LLC/indahl.ai (comando `/plugin marketplace add Heuremen-LLC/indahl.ai`)

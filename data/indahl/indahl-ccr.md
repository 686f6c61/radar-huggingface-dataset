# indahl/indahl-ccr

## Resumen

Indahl CCR (Custody Chain Receipts) es un plugin para Claude Code desarrollado por Heuremen LLC que implementa un registro encadenado por hash (hash-chained) de la actividad de un agente dentro de un proyecto. No se trata de un modelo de lenguaje, sino de una herramienta de auditoría y trazabilidad que se instala sobre Claude Code y registra cada prompt, llamada a herramienta, lectura y escritura de fichero en un directorio `.ccr/`. El problema que resuelve es la atribución: cuando una acción de un agente produce un resultado incorrecto, sin un registro la responsabilidad recae sobre quien actuó en último lugar; con CCR la respuesta proviene del registro criptográfico.

La pieza central es el concepto de aprobación ligada a hash: cuando un revisor aprueba un fichero o un rango de líneas, el plugin calcula el sha256 de esos bytes en ese momento, de modo que el agente nunca teclea el hash. En la fase de release, el plugin vuelve a hashear lo que se publica y lo compara con las aprobaciones previas, emitiendo uno de cinco veredictos (SAME, MOVED, CHANGED, CANNOT_TELL, GAP). Además, `ccr why` separa la atribución (quién escribió los bytes actuales, según el registro) de la causa (juicio humano sobre si el agente se excedió, cumplió o sufrió un fallo del entorno).

Es relevante ahora porque la trazabilidad de agentes autónomos es un requisito creciente en entornos de producción y cumplimiento. El plugin está publicado con licencia MIT, no contacta servicios externos (todo queda en `.ccr/`) y requiere Python 3 y Claude Code con hooks habilitados. No es un modelo entrenado ni inferido: es infraestructura de auditoría alrededor de un agente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (plugin de Claude Code; registro hash-chained con hooks) |
| Parametros totales | No disponible (no es un modelo neuronal) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | No disponible (el artefacto es código Python y ficheros JSONL en `.ccr/`) |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: Indahl CCR no es un modelo entrenado, sino un plugin que se ejecuta dentro de Claude Code mediante hooks. Su "arquitectura" es un registro append-only en `.ccr/` donde cada entrada incorpora el hash de la entrada anterior, de forma que cualquier alteración o eliminación de una entrada resulta detectable. Las lecturas y escrituras de fichero llevan el sha256 del fichero antes y después de la operación. Los argumentos de las herramientas se almacenan únicamente como hash, con la justificación explícita de que un registro append-only nunca puede olvidar un secreto.

Las aprobaciones se guardan en un almacén lateral bajo `.ccr/store/`, nunca en la cadena, y `ccr redact` las elimina como entrada registrada. El plugin puede firmar cada entrada con una clave SSH ed25519 mediante `ssh-keygen -Y sign` (`ccr init --key PATH`), y `verify` advierte cuando el fichero de clave es legible por el agente, ya que una clave accesible permitiría re-firmar una cadena reescrita. La verificación (`ccr verify`) comprueba cada enlace, marca entradas alteradas, detecta llamadas sin resultado y contrasta con la carpeta de transcripciones de sesión; `ccr anchor` escribe la cabeza de la cadena en `.ccr/anchors.jsonl` para copiarla fuera del alcance del agente.

## Capacidades

- Registro hash-chained de cada prompt, llamada a herramienta, llamada denegada, lectura y escritura de fichero en un proyecto.
- Aprobaciones ligadas al hash del fichero completo o de un rango de líneas revisado (`--lines A-B`).
- Comprobación de release con cinco veredictos: SAME, MOVED, CHANGED, CANNOT_TELL y GAP, más listado de líneas publicadas sin aprobación.
- Atribución separada de la causa: `ccr why` indica qué entrada escribió los bytes actuales (o UNATTRIBUTED / RACE) y deja la causa a un juez nombrado.
- Registro de la instrucción real más cercana a cada llamada (último prompt o Task del subagente padre) y número de acciones transcurridas.
- Verificación de integridad con código de salida 0 (cadena limpia y cross-check ejecutado), 2 (problema encontrado) y 3 (cadena limpia pero cross-check no ejecutado).
- Anclaje de la cabeza de la cadena en `.ccr/anchors.jsonl` para copia externa.
- Firma opcional de entradas con clave SSH ed25519.
- Redacción registrada de bytes aprobados mediante `ccr redact`.
- Sin contacto con servicios externos: todo permanece en `.ccr/`.

## Casos de uso

- Auditoría de cambios en producción: tras una sesión de agente que modifica `src/report.py`, `ccr release` compara los bytes publicados con cada aprobación desde el último release y lista las líneas que ninguna aprobación cubrió, permitiendo bloquear el despliegue si aparecen cambios no revisados.
- Revisión de código asistida con responsabilidad clara: un revisor aprueba las líneas 10-40 con `ccr approve src/report.py --lines 10-40`; el hash se calcula en ese instante sin intervención del agente, de modo que una modificación posterior de esas líneas se detecta como CHANGED.
- Investigación de incidentes: `ccr why PATH` responde quién escribió los bytes actuales según el registro y distingue UNATTRIBUTED (editor o script fuera de los hooks) de RACE (escritura entre dos lecturas que debían ver la misma versión), lo que acota la causa raíz.
- Cumplimiento y evidencias externas: `ccr anchor` escribe la cabeza de la cadena para copiarla a un push público o a archive.org, de forma que un registro externo capturado en esa ventana siga siendo verificable aunque el origen lo olvide.
- Detección de manipulación del propio registro: `ccr verify` marca entradas alteradas y lee GAP cuando la cadena es más corta que un ancla, o cuando una sesión tiene transcripción pero ninguna entrada (hooks desactivados).
- Gestión de secretos en el registro: al almacenar los argumentos de herramientas solo como hash y permitir `ccr redact` como entrada registrada, el plugin evita que un registro append-only retenga credenciales de forma permanente.
- Integración en flujos de agentes con subagentes: cada llamada registra la instrucción real más cercana (el último prompt o el Task del subagente padre) y cuántas acciones han pasado, lo que permite reconstruir la cadena de mando en tareas multi-paso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No requiere GPU: es un plugin de Python 3 que se ejecuta junto a Claude Code con hooks habilitados.
- Requisitos de software: Python 3 (`python3`, o `python` en Windows) y Claude Code con hooks activados.
- VRAM estimada: no aplica.
- GPU recomendadas: no aplica.
- Despliegue: instalación vía marketplace de plugins (`/plugin marketplace add Heuremen-LLC/indahl.ai` y `/plugin install indahl-ccr@heuremen`).
- Latencia y throughput: no disponibles; la documentación advierte de que cada llamada de hook lee la cadena, por lo que cadenas muy largas ralentizan los hooks y recomienda iniciar una cadena nueva por proyecto o por release.

## Comparativa con modelos similares

No disponible. No se han proporcionado alternativas comparables en la información recibida, y el artefacto no es un modelo de lenguaje sino un plugin de auditoría para Claude Code, por lo que la comparación con modelos de inferencia no resulta aplicable.

## Limitaciones y advertencias

- El registro prueba orden e integridad desde su primera entrada, pero la completitud solo se sostiene hasta la última ancla y solo para las sesiones que el cross-check de transcripciones vio; el actor puede borrar sus propias transcripciones.
- La carpeta de transcripciones que lee el cross-check se configura en `.ccr/config.json`, un fichero que el agente puede editar; un cambio de configuración puede ocultar sesiones.
- Los efectos sobre ficheros de un comando Bash no se observan: la entrada indica "not observed" en lugar de "touched nothing".
- Una clave de firma legible por el agente permite re-firmar una cadena reescrita; `verify` lo advierte, pero la clave debe guardarse fuera del alcance del agente.
- El principal es una etiqueta fijada por el operador, nunca una identidad.
- El reloj es el de la máquina local y así se declara; el número de secuencia es el orden que cuenta.
- Un registro externo capturado (por ejemplo, el registro de un push en GitHub) sigue siendo autoconsistente después de que el origen lo olvide, y solo es verificable externamente mientras la fuente lo retenga o mediante un push público o captura de archive.org hecha en esa ventana.
- MOVED nunca se cuenta como SAME: bytes idénticos en un contexto nuevo quedan a criterio del revisor.
- Hooks desactivados no escriben nada y la cadena puede parecer íntegra; `verify` lista la carpeta de transcripciones y marca GAP cuando hay transcripción sin entradas.
- Cadenas muy largas ralentizan los hooks; se recomienda una cadena por proyecto o por release.
- Licencia MIT: permite uso comercial, pero conviene revisar los términos y la política de privacidad del proveedor (Heuremen LLC) antes de integrarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/indahl/indahl-ccr
- Repositorio fuente: https://github.com/Heuremen-LLC/indahl.ai
- Sitio del proveedor: https://indahl.ai
- Privacidad: https://indahl.ai/privacy
- Términos: https://indahl.ai/terms

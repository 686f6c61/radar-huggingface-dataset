# indahl/indahl-silent-failure-guard

## Resumen

`indahl-silent-failure-guard` no es un modelo de lenguaje, sino un plugin para Claude Code publicado por Heuremen LLC (cuenta `indahl` en Hugging Face). Su funcion es detectar y bloquear los llamados "fallos silenciosos": situaciones en las que una accion declara haber tenido exito pero el efecto real no se ha producido, o en las que un script oculta un error y devuelve una salida aparentemente correcta. El plugin combina una skill de verificacion (que relee el efecto desde donde deberia haber quedado: el commit en el remoto, el contenido del fichero publicado, las filas de la tabla, el texto de la pagina en vivo) con un hook que intercepta las esperas en segundo plano de Claude Code.

El hook (`scripts/watch_guard.py`, invocado desde `hooks/hooks.json`) se ejecuta antes de cada comando Bash en segundo plano y de cada uso de la herramienta Monitor. Rechaza siete patrones concretos de espera que solo pueden reportar exito, y devuelve al modelo un mensaje con la correccion aplicable (anadir los estados de fallo al mismo patron, usar `--line-buffered`, esperar sobre el PID, comparar numeros con `-eq`, imponer un plazo). El plugin se distribuye bajo licencia MIT y requiere Python 3 para el hook; la skill no necesita dependencias.

Es relevante porque aborda un problema operativo muy concreto en flujos agente-modelo: la ausencia de notificacion se interpreta como "sigue en marcha", y un `exit code 0` se interpreta como exito aunque la linea capturada describa un fallo. El autor documenta mas de cien casos de esta familia registrados en tres semanas de operacion propia. No hay pesos, arquitectura ni datos de entrenamiento que evaluar: la ficha describe el plugin y sus limites, no un modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de lenguaje; es un plugin/skill para Claude Code) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible en la model card (la documentacion esta en ingles) |
| Licencia | MIT |
| Formato de pesos | no disponible (no hay pesos; el codigo se distribuye como plugin y scripts Python) |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: no hay transformer, MoE ni SSM, ni fases de preentrenamiento, RLHF o DPO. El plugin se compone de tres piezas. Primero, una skill que, tras cualquier accion que declare exito, relee el efecto desde la fuente de verdad correspondiente y emite un unico resultado por accion: `VERIFIED`, `FAILED`, `NOTHING_RETURNED` o `CANNOT_TELL`, acompanado de la lectura que lo ha decidido. Segundo, un escaneo de scripts que busca patrones que convierten fallos en silencio: salida capturada con estado ignorado, errores tragados, guardas que sustituyen la operacion por un no-op, filas descartadas sin contarlas, dos copias de una misma verdad sin nada que las compare, liveness juzgada por la existencia de un proceso y watchers sin latido.

Tercero, el hook de Claude Code (`hooks/hooks.json` mas `scripts/watch_guard.py`), que se ejecuta antes de cada comando Bash en segundo plano y de cada Monitor. Bloquea los casos 1 a 3 y 5 a 7 descritos por el autor: espera que solo busca la senal de exito (`until grep -q "DONE" job.log; do sleep 5; done`), stream que solo filtra el exito (`tail -f job.log | grep "DONE"`), stream con buffer sin `--line-buffered`, `pgrep -f` que se autoencuentra en la linea de comandos del propio shell, comparacion de conteos con `wc` que falla por el relleno de espacios en macOS, y ausencia de plazo maximo. El caso 4 (leer el codigo de salida como veredicto) se documenta pero no se rechaza. Los casos 5 a 7 se anadieron el 14 de noviembre de 2026 tras cinco esperas colgadas durante la noche, y el autor reconoce que la primera version del hook los dejaba pasar y que su selftest marcaba como segura la espera con `pgrep` autoencontrado. `python3 scripts/watch_guard.py selftest` ejecuta los casos plantados.

## Capacidades

- Verificacion de resultados por relectura del efecto: commit en el remoto, contenido del fichero publicado, filas de la tabla, texto de la pagina en vivo, hora de la salida mas reciente de un job.
- Clasificacion de cada accion en cuatro estados explicitos (`VERIFIED`, `FAILED`, `NOTHING_RETURNED`, `CANNOT_TELL`) con la evidencia que sustenta la decision.
- Escaneo estatico de scripts en busca de patrones de fallo silencioso (errores tragados, guardas no-op, filas descartadas sin recuento, verdades duplicadas sin comparacion, liveness por proceso, watchers sin heartbeat).
- Hook que intercepta comandos Bash en segundo plano y usos de Monitor, rechaza esperas que solo pueden reportar exito y explica al modelo como reescribirlas.
- Invocacion como skill mediante `/silent-failure-guard <ruta o descripcion>`; el hook no requiere comando y se ejecuta automaticamente.
- Sin llamadas a servicios externos: todo se ejecuta dentro de la sesion del usuario.
- No ofrece generacion de texto, codigo, matematicas, vision, tool calling propio, agentes ni capacidades multilingues: esas funciones dependen del modelo subyacente de Claude Code, no de este plugin.

## Casos de uso

- Verificacion de despliegues en CI/CD: tras un `git push`, el plugin relee el commit en el remoto en lugar de fiarse del mensaje de exito del comando, lo que cubre el caso documentado de un push que reporto exito sobre un commit rechazado.
- Auditoria de pipelines de publicacion de contenido: comprueba que el fichero publicado contiene lo esperado y que la pagina en vivo no ha derivado de la biblioteca que replica, un fallo que el autor registra en su historial.
- Supervision de jobs programados: lee la hora de la salida mas reciente para detectar schedulers que sustituyen trabajos nuevos por un no-op sin emitir error.
- Revision de scripts de operaciones antes de ponerlos en produccion: el escaneo detecta salidas capturadas con estado ignorado y errores tragados, que son la causa raiz de notificaciones de exito falsas.
- Correccion de esperas en sesiones de Claude Code: el hook reescribe esperas del tipo `until grep -q "DONE"` para que incluyan los estados de fallo y un plazo, evitando sesiones colgadas durante la noche.
- Validacion de ingestas de datos: detecta filas descartadas sin recuento y dos copias de una misma verdad sin nada que las compare, patrones que producen perdidas de datos invisibles.
- Estandarizacion de criterios de exito en equipos: impone un vocabulario unico de cuatro estados por accion, lo que facilita distinguir entre fallo comprobado e imposibilidad de determinar el resultado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo aporta evidencia cualitativa: mas de cien casos de la familia de fallos silenciosos registrados en tres semanas de operacion propia, y cinco esperas colgadas durante la noche que motivaron la ampliacion del hook con los casos 5 a 7 el 14 de noviembre de 2026.

## Requisitos de hardware

- No requiere GPU ni VRAM: no hay inferencia de un modelo.
- Requiere Python 3 (`python3`, o `python` en Windows) para el hook; la skill no necesita dependencias.
- En Windows, el autor detecto que `python3` resuelve al stub de Microsoft Store, que no ejecuta nada y devuelve el codigo 49; el hook hace fallback a `python`. Conviene verificar que el interprete este realmente instalado.
- El hook se ejecuta en primer plano y de forma local; no hay latencia de red ni throughput que medir.
- Despliegue mediante el marketplace de plugins de Claude Code: `/plugin marketplace add Heuremen-LLC/indahl.ai` y `/plugin install indahl-silent-failure-guard@heuremen`.
- La copia publicada en Hugging Face no incluye ficheros ejecutables: sus comandos descargan cada script desde `github.com/Heuremen-LLC/indahl.ai` en un commit fijado y solo lo ejecutan si el sha256 coincide con el valor escrito en el comando. Esto exige conectividad con `raw.githubusercontent.com` en el momento de la ejecucion.

## Comparativa con modelos similares

| Herramienta | Tipo | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| indahl-silent-failure-guard | Plugin/skill para Claude Code | Relectura del efecto y bloqueo de esperas que solo reportan exito | MIT | Hugging Face y marketplace propio |
| Herramientas de linting de shell (p. ej. ShellCheck) | Analizador estatico | Deteccion de errores de sintaxis y malas practicas en scripts | GPL u otras | Amplia |
| Frameworks de test de integracion (p. ej. pytest, bats) | Framework de pruebas | Verificacion de comportamiento mediante aserciones escritas a mano | MIT/Apache | Amplia |
| Guardas de CI (steps con `set -euo pipefail`) | Configuracion de shell | Abortar ante error no controlado | no aplica | Nativa |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada; la comparacion es funcional, no cuantitativa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, codigo ni razonamiento. Cualquier expectativa de evaluacion tipo MMLU o HumanEval no aplica.
- El hook solo rechaza los casos 1 a 3 y 5 a 7; el caso 4 (leer un `exit code 0` como veredicto aunque la linea capturada describa un fallo) queda documentado pero no se bloquea, por lo que sigue dependiendo de la disciplina del modelo o del operador.
- El autor reconoce que la primera version del hook dejaba pasar los casos 5 a 7 y que su propio selftest marcaba como segura la espera con `pgrep` autoencontrado: el selftest no es una garantia absoluta de cobertura.
- La deteccion se basa en patrones conocidos; patrones de fallo silencioso no catalogados pueden pasar sin aviso.
- La copia de Hugging Face no incluye ejecutables y depende de descargas desde GitHub con verificacion de sha256; un cambio en la red, un proxy o una indisponibilidad del repositorio deja el hook inoperante sin aviso evidente.
- En Windows, si `python3` resuelve al stub de Microsoft Store, el hook falla en silencio salvo por el fallback a `python`; conviene comprobar el interprete antes de confiar en la proteccion.
- El plugin no contacta servicios externos, pero la distribucion via Hugging Face si requiere acceso a `raw.githubusercontent.com` para obtener los scripts.
- La documentacion y los mensajes estan en ingles; no se declaran idiomas soportados en la model card.
- Licencia MIT: permite uso comercial y modificacion, pero sin garantias; el propio autor documenta fallos de su primera version.
- El plugin depende de la API de plugins y hooks de Claude Code; cambios en esa API pueden romper la integracion.

## Enlaces

- Hugging Face: https://huggingface.co/indahl/indahl-silent-failure-guard
- Repositorio fuente: https://github.com/Heuremen-LLC/indahl.ai
- Espejo del plugin: https://github.com/Heuremen-LLC/indahl-silent-failure-guard
- Script del hook (commit fijado): https://raw.githubusercontent.com/Heuremen-LLC/indahl.ai/c6d8603c678d2053aaa4d184ddddb6affd93e75e/claude-plugins/src/silent-failure-guard/scripts/watch_guard.py
- Politica de privacidad: https://indahl.ai/privacy
- Terminos de uso: https://indahl.ai/terms
- Sitio del autor: https://indahl.ai

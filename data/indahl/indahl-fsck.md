# indahl/indahl-fsck

## Resumen

`indahl/indahl-fsck` no es un modelo de lenguaje, sino un plugin para Claude Code distribuido a traves de Hugging Face. Su funcion es ejecutar la comprobacion de salud nativa de Claude Code (`claude mcp list`) y presentar unicamente los servidores MCP que requieren intervencion manual, agrupados por el tipo de arreglo necesario. El problema que aborda es operativo: en configuraciones con decenas o cientos de conectores MCP, la salida plana de `claude mcp list` oculta los fallos entre las lineas de servidores que funcionan correctamente.

El plugin esta desarrollado por Heuremen LLC (repositorio `Heuremen-LLC/indahl.ai`) y se distribuye bajo licencia MIT. El autor declara haberlo probado sobre una configuracion propia de 123 servidores. La ficha de Hugging Face no contiene pesos, tokenizador ni pipeline de inferencia: el repositorio es un espejo del codigo fuente del plugin, con fecha de creacion 2026-11-15 y cero descargas en el momento de la consulta.

Dado que no existe ningun modelo neuronal asociado, los apartados de arquitectura, entrenamiento, benchmarks y requisitos de hardware se documentan como no disponibles, indicando explicitamente la naturaleza del artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un plugin CLI para Claude Code) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (la interfaz del plugin y la documentacion estan en ingles) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio contiene scripts Python y metadatos de plugin, no pesos) |

## Arquitectura y entrenamiento

No aplica. `indahl-fsck` es una utilidad de linea de comandos escrita en Python 3 que invoca el comando `claude mcp list` de Claude Code y postprocesa su salida de texto para clasificar el estado de cada servidor MCP. No hay entrenamiento, dataset, RLHF ni pesos.

La innovacion tecnica es de diseno operativo: el plugin es de solo lectura (equivalente a `fsck -n`), no modifica configuracion, no arranca servidores propios y no imprime cadenas de consulta, ya que un token podria viajar en ellas. Los fallos no reconocidos se etiquetan como `CANNOT_TELL` acompanados del mensaje original del servidor, en lugar de asumir un estado correcto. Segun la model card, la copia alojada en Hugging Face no incluye ejecutables: los comandos descargan cada script desde el repositorio publico en un commit fijado (`6d8315862ec01264231f2995b4390286d4aabe6e`) y lo ejecutan solo si el sha256 coincide con el valor declarado (`7ed424d0ff8d19f7c23a2235187ac591ead4eb4e91b20287a9078b566f6c4bee`).

## Capacidades

- Ejecucion de la comprobacion de salud de servidores MCP de Claude Code mediante `claude mcp list`.
- Agrupacion de fallos por tipo de arreglo: `NO SUCH HOST`, `BAD TOKEN`, `RE-AUTH`, `SIGN IN OR DISABLE` y `SAME URL TWICE`.
- Colapso de los servidores operativos en una sola linea `OK` con el recuento.
- Salida `--json` con cada servidor, su estado y la correccion sugerida.
- Etiquetado `CANNOT_TELL` con el mensaje original del servidor para fallos no reconocidos.
- Ejecucion sobre una salida guardada de `claude mcp list` (`python3 scripts/fsck.py saved-mcp-list.txt`).
- Invocacion dentro de Claude Code mediante el comando `/fsck`.
- No realiza llamadas de red propias ni envia datos a servicios externos.

## Casos de uso

- Auditoria de configuraciones MCP extensas: en entornos con mas de cien conectores, el plugin reduce la salida a la lista de servidores con problemas, agrupados por la accion correctiva, lo que permite priorizar el trabajo de mantenimiento.
- Diagnostico de tokens caducados: los servidores con `BAD TOKEN` se agrupan con su recuento, de modo que un equipo puede renovar credenciales de forma por lotes en lugar de revisar la lista completa.
- Deteccion de duplicados de endpoint: la categoria `SAME URL TWICE` identifica entradas que apuntan al mismo servidor, ayudando a eliminar configuraciones redundantes.
- Integracion en pipelines de CI o scripts de aprovisionamiento: la salida `--json` permite validar automaticamente el estado de los conectores antes de desplegar un entorno de desarrollo.
- Soporte a usuarios finales de Claude Code: el comando `/fsck` ofrece una guia accionable sin requerir que el usuario interprete la salida cruda de `claude mcp list`.
- Revision forense de configuraciones guardadas: el modo con fichero de entrada permite analizar una captura de `claude mcp list` sin acceso al entorno original.
- Verificacion de integridad de la cadena de suministro: la comprobacion de sha256 sobre scripts descargados de un commit fijado permite auditar el codigo antes de ejecutarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No requiere GPU ni VRAM: es una utilidad de linea de comandos.
- Requiere Python 3 y Claude Code disponible en el `PATH`.
- No aplica despliegue con vLLM, llama.cpp, Ollama o TGI.
- El coste de ejecucion es el de una invocacion de `claude mcp list` mas el postprocesado en Python; no se publican cifras de latencia o throughput.
- La model card menciona una ejecucion de referencia con 123 servidores de entrada.

## Comparativa con modelos similares

| Herramienta | Naturaleza | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|
| indahl-fsck | Plugin CLI para Claude Code | Filtra y agrupa fallos de `claude mcp list` | MIT | Hugging Face y marketplace de Heuremen |
| `claude mcp list` (nativo) | Comando de Claude Code | Lista plana del estado de los servidores MCP | Propietaria (Claude Code) | Incluido en Claude Code |
| `/mcp` (nativo) | Comando interactivo de Claude Code | Gestion y autenticacion de servidores MCP | Propietaria (Claude Code) | Incluido en Claude Code |

No se dispone de datos de rendimiento comparativo entre estas herramientas en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ve lo que `claude mcp list` reporta: la model card documenta que un conector de claude.ai que fallaba y que `/mcp` mostraba como ausente no aparecia en `claude mcp list`, por lo que fsck tampoco podia detectarlo. Se recomienda contrastar una vez con `/mcp`.
- El estado reflejado es el del momento de la comprobacion; una sesion de inicio puede caducar un minuto despues.
- La copia alojada en Hugging Face no incluye ejecutables y descarga los scripts desde GitHub en tiempo de ejecucion; si el commit fijado o los artefactos no estuvieran disponibles, la ejecucion fallaria.
- La interfaz y la documentacion estan en ingles.
- No se declaran sesgos de modelo porque no hay modelo; el riesgo relevante es de cadena de suministro (dependencia de scripts remotos verificados por hash) y de interpretacion (un `OK` no garantiza que el servidor siga operativo despues de la comprobacion).
- La licencia MIT permite uso comercial, pero conviene revisar los terminos del servicio en `https://indahl.ai/terms` y la politica de privacidad en `https://indahl.ai/privacy`.

## Enlaces

- Hugging Face: https://huggingface.co/indahl/indahl-fsck
- Repositorio fuente: https://github.com/Heuremen-LLC/indahl.ai
- Espejo del plugin: https://github.com/Heuremen-LLC/indahl-fsck (commit 46d662c)
- Script fsck.py en commit fijado: https://raw.githubusercontent.com/Heuremen-LLC/indahl.ai/6d8315862ec01264231f2995b4390286d4aabe6e/claude-plugins/src/fsck/scripts/fsck.py
- Politica de privacidad: https://indahl.ai/privacy
- Terminos del servicio: https://indahl.ai/terms
- Sitio del autor: https://indahl.ai

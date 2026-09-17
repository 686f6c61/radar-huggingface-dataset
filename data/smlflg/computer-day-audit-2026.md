# smlflg/computer-day-audit-2026

## Resumen

`smlflg/computer-day-audit-2026` no es un modelo de lenguaje: es un repositorio que contiene un generador en Python (solo biblioteca estándar) y un dashboard HTML estático de 39 KB autocontenido, pensado para producir un resumen anual de la actividad de un usuario en su ordenador y en asistentes de IA durante 2026. El autor lo publica como espejo ("mirror by smlflg") dentro de una línea de trabajo denominada HAI (Human-Agent Interface), cuyo objetivo es que un agente pueda mostrar a su propietario en qué ha trabajado, de forma condensada, navegable y auditable.

El repositorio se etiqueta con `pipeline_tag: text-generation` en HuggingFace, pero no publica pesos, tokenizador, configuración de modelo ni artefactos de inferencia: los únicos ficheros descritos son `index.html`, `scripts/build_activity.py`, `data/activity-2026.json` y `data/activity-2026.js`. Por tanto, no existen arquitectura, parámetros, contexto ni datos de entrenamiento que documentar, y esta ficha los marca como no disponibles en lugar de estimarlos.

Su relevancia actual es acotada pero concreta: cubre el nicho de la auditoría local de actividad agéntica, agregando sesiones de Codex CLI, Claude Desktop, OpenCode y commits de proyectos locales en un único panel estático, sin servidor, sin dependencias y con un cronjob diario. Es, en la práctica, una herramienta de observabilidad personal, no un componente de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un generador Python + dashboard HTML estatico) |
| Parametros totales | no disponible (no aplica: no se publican pesos) |
| Parametros activos | no disponible (no aplica: no es MoE) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica: no hay pesos que cuantizar) |
| Idiomas soportados | no disponible; la documentacion del repositorio esta redactada principalmente en aleman |
| Licencia | MIT |
| Formato de pesos | no disponible (no se distribuyen pesos; los artefactos son HTML, Python y JSON/JS) |

## Arquitectura y entrenamiento

No hay arquitectura de red ni proceso de entrenamiento. El componente ejecutable es `scripts/build_activity.py`, un script de Python 3 que solo usa la biblioteca estándar y que lee rutas absolutas del sistema de ficheros: `~/.codex/sessions/` (sesiones de agente de Codex CLI), `~/.claude/` (sesiones de Claude Desktop), `~/.local/` (carpetas activadas por OpenCode) y `~/Projekte/` (commits de Git y actividad de ficheros en proyectos locales). El script no genera datos nuevos, solo condensa los existentes y escribe `data/activity-2026.json` y `data/activity-2026.js`.

La capa de presentación es un único `index.html` autocontenido que no requiere servidor. La automatización se plantea mediante una entrada de cron (`15 7 * * *`) que reconstruye el dashboard cada día a las 07:15 y redirige la salida a `cron-build.log`. Los parámetros configurables por línea de comandos son `--home`, `--projects`, `--claude-backup`, `--out-dir`, `--exclude`, `--start`, `--end` y `--year-label`. No se documenta ningún mecanismo de aprendizaje, ajuste fino, RLHF, DPO ni innovación algorítmica.

## Capacidades

- Agregación de actividad multi-fuente: consolida sesiones de Codex CLI, Claude Desktop, OpenCode y commits de Git locales en una única vista.
- Segmentación temporal por día, semana y mes, con marcas de día y recuentos agregados.
- Generación de un dashboard HTML estático y autocontenido (39 KB) que se abre directamente en el navegador sin servidor.
- Ejecución sin dependencias externas: únicamente Python 3 y su biblioteca estándar.
- Filtrado y delimitación temporal mediante `--start`, `--end`, `--exclude` y `--year-label`.
- Automatización programada mediante cronjob diario con registro en `cron-build.log`.
- Salida de datos en dos formatos: JSON (`data/activity-2026.json`) y JavaScript (`data/activity-2026.js`).
- No dispone de generación de texto, razonamiento, código, matemáticas, visión, tool calling, capacidades de agente ni soporte multilingüe: la etiqueta `text-generation` del repositorio no se corresponde con ningún artefacto de inferencia publicado.

## Casos de uso

- Auditoría personal de actividad: un desarrollador ejecuta `python3 scripts/build_activity.py` sobre su `$HOME` y `~/Projekte` para obtener un recuento por día y semana de commits y sesiones de agente, útil para reconstruir en qué se invirtió el tiempo a lo largo del año.
- Informe de actividad para un agente HAI: un agente que opera en nombre de un usuario puede leer `data/activity-2026.json` y presentar a su propietario un resumen navegable de las tareas realizadas, cumpliendo el objetivo declarado de la línea HAI.
- Seguimiento continuo sin intervención manual: con la entrada de cron a las 07:15, el dashboard se regenera a diario y el usuario solo necesita abrir `index.html` para consultar el estado acumulado del año.
- Repositorio de ejemplo para monitorización local: sirve como plantilla para construir paneles de actividad propios que lean directorios locales con Python estándar, sin añadir dependencias al entorno.
- Verificación de retención de datos: como el generador solo lee y agrega, permite comprobar qué rastro dejan las herramientas de agente instaladas en el sistema (`~/.codex/`, `~/.claude/`, `~/.local/`) antes de publicar o compartir un directorio.
- Material didáctico sobre privacidad en repos públicos: el propio README advierte de que hay que revisar que `data/activity-*.{json,js}` no filtre nombres de proyecto o mensajes de commit antes de hacer público el repositorio, lo que lo convierte en un caso práctico de saneado previo a la publicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye pesos ni tareas de inferencia evaluables, por lo que métricas como MMLU, HumanEval o GSM8K no son aplicables.

## Requisitos de hardware

- VRAM: no aplica. No hay modelo neuronal ni inferencia que requiera GPU.
- GPU recomendadas: ninguna. El dashboard se renderiza en el navegador del usuario.
- GPU de consumo: no aplica; el único requisito es un navegador web moderno.
- CPU y memoria: cualquier máquina capaz de ejecutar Python 3 con la biblioteca estándar; el coste dominante es el recorrido del sistema de ficheros por parte del generador.
- Almacenamiento: el dashboard ocupa 39 KB y los datos pregenerados se reparten entre `data/activity-2026.json` y `data/activity-2026.js`; `cron-build.log` no se incluye en el repositorio.
- Opciones de despliegue: apertura directa del fichero (`open`, `xdg-open` o `start` según plataforma) o publicación como sitio estático; no se contemplan vLLM, llama.cpp, Ollama ni TGI porque no hay pesos.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del número de ficheros y del tamaño de los directorios analizados.
- Dependencia crítica de entorno: todas las rutas de las fuentes son absolutas y deben existir en la máquina de destino; no hay modo de ejecución en contenedor ni de rutas relativas documentado.

## Comparativa con modelos similares

No se dispone de información sobre alternativas comparables en la documentación proporcionada; los resultados de búsqueda web recibidos no guardan relación con este repositorio. La categoría real del artefacto es la de herramienta de auto-seguimiento y generación de sitios estáticos, no la de modelo de lenguaje.

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smlflg/computer-day-audit-2026 | no disponible (no aplica) | no disponible (no aplica) | no disponible | MIT | repositorio en HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion disponible |

## Limitaciones y advertencias

- No es un modelo de IA: pese a la etiqueta `text-generation` del repositorio, no publica pesos, tokenizador ni configuración de inferencia, por lo que no puede usarse para generar texto.
- Sin benchmarks ni métricas de calidad publicadas.
- Dependencia de rutas absolutas: el generador espera `~/.codex/sessions/`, `~/.claude/`, `~/.local/` y `~/Projekte/` en la máquina de destino; en otros sistemas requiere pasar `--home`, `--projects` y `--claude-backup` manualmente.
- Año fijado por defecto a 2026, tanto en el nombre de los ficheros de datos como en el comportamiento por defecto del script; para otros periodos hay que usar `--start`, `--end` y `--year-label`.
- Riesgo de fuga de información: los datos agregados pueden contener nombres de proyecto o mensajes de commit. El README advierte explícitamente de que deben revisarse antes de publicar el repositorio, aunque el autor indica que no hay credenciales ni secretos.
- Documentación en alemán: la model card y los comentarios están redactados principalmente en alemán, lo que puede dificultar su adopción a usuarios de otros idiomas.
- Ausencia de tests, de control de versiones semántico y de mecanismos de validación del esquema de datos documentados.
- El cronjob documentado apunta a una ruta concreta (`~/Projekte/computer-day-audit-2026`) y requiere adaptarse; el fallo silencioso solo queda registrado en `cron-build.log`.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución y conservación del aviso de copyright; no se documentan restricciones adicionales.
- Repositorio sin descargas ni valoraciones en el momento de la consulta, lo que implica ausencia de validación por parte de terceros.

## Enlaces

- HuggingFace: https://huggingface.co/smlflg/computer-day-audit-2026
- No se han encontrado en la búsqueda web enlaces relevantes al repositorio, al autor, a papers, blogs o demos asociados; los resultados recibidos (Quizlet y relacionados) no guardan relación con este artefacto.

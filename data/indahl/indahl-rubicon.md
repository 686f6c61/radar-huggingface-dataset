# indahl/indahl-rubicon

## Resumen

Indahl Rubicon no es un modelo de lenguaje, sino un plugin para Claude Code publicado por el autor `indahl` bajo la organización Heuremen LLC. Se presenta como una "puerta" (gate) de verificación que intercepta el momento en que un agente declara haber terminado una tarea y le exige demostrar cuatro cosas que habitualmente se omiten: que los criterios de aceptación se congelaron antes de empezar, que la evaluación la hicieron asientos ciegos independientes, que cada criterio tiene una respuesta errónea plantada que la comprobación debe detectar, y que una votación dividida no se resuelve por mayoría.

El artefacto no contiene pesos ni arquitectura de red neuronal: es un conjunto de instrucciones (`skills/rubicon/SKILL.md`), un script de Python de biblioteca estándar (`scripts/rubicon.py`) que mantiene un registro en `.rubicon/` y un hook de tipo Stop que interrumpe el primer intento de finalizar mientras queden filas abiertas. Su relevancia es de proceso, no de modelado: aborda el problema de los agentes que superan todos los checks y aun así fallan la tarea real.

La ficha que sigue documenta el plugin según la información disponible en su model card. No hay datos de parámetros, contexto, cuantización ni benchmarks porque el artefacto no es un modelo entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: plugin/herramienta para Claude Code (skill + script Python + hook), no es una red neuronal |
| Parametros totales | No disponible (no es un modelo) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica (depende del modelo Claude Code subyacente) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (la documentación está en inglés) |
| Licencia | MIT |
| Formato de pesos | No aplica: código Python y Markdown; sin safetensors ni GGUF |

## Arquitectura y entrenamiento

El plugin se compone de tres piezas. La primera es una skill (`skills/rubicon/SKILL.md`) que describe el procedimiento: congelar los criterios con un hash antes de empezar, ejecutar el trabajo, correr una rejilla tres por tres de asientos ciegos, consultar a la persona cuando los asientos no son concluyentes y cerrar o reconocer explícitamente cada fila abierta. La segunda es `scripts/rubicon.py`, que mantiene el registro en `.rubicon/`, congela los criterios, rechaza una rejilla con respuestas de asiento ausentes o ilegibles, tabula los resultados, registra la respuesta del solicitante como fila propia (`person`), guarda los reconocimientos y ejecuta un autotest con respuestas erróneas plantadas (34 casos). Usa solo la biblioteca estándar y no envía datos a ningún servicio. La tercera es `hooks/hooks.json`, un hook Stop que solo actúa en carpetas donde se hayan congelado criterios y que interrumpe el primer intento de finalizar cuando no hay veredicto, cuando el veredicto se emitió contra criterios antiguos, cuando es MISSED o cuando hay una fila UNRESOLVED o CANNOT_TELL sin reconocer; nunca bloquea dos veces seguidas.

No hay entrenamiento, dataset ni ajuste por RLHF/DPO asociado, porque no existe un modelo. La innovación técnica es de metodología de evaluación: criterios congelados con hash, asientos ciegos, respuesta errónea plantada por criterio y tratamiento de la votación dos-a-uno como UNRESOLVED conservando el motivo de la minoría. Los resultados posibles por fila son MET, MISSED, UNRESOLVED y CANNOT_TELL.

## Capacidades

- Congelación de criterios de aceptación con hash antes de iniciar el trabajo, con registro de cambios posteriores.
- Detección de criterios añadidos después del trabajo: se etiquetan como "defined after the work" y obligan a repetir la rejilla.
- Evaluación mediante tres asientos ciegos que juzgan el trabajo terminado.
- Conservación del disenso: una votación dos-a-uno se registra como UNRESOLVED con el motivo de la minoría en la fila.
- Autotest con respuesta errónea plantada por criterio, que el agente debe reejecutar antes de que un MET cuente.
- Registro de si los asientos se ejecutaron de forma independiente y de qué asientos se usaron.
- Hook Stop que interrumpe el primer intento de finalizar con filas abiertas.
- Fila propia para la respuesta de la persona consultada (`person`) cuando el veredicto de los asientos no es un sí unánime.
- Reconocimiento de filas abiertas sin resolverlas: una fila reconocida sigue abierta en el registro con su motivo al lado.
- Sin llamadas de red: todo el estado permanece en `.rubicon/` en la carpeta de trabajo.

## Casos de uso

- Cierre controlado de tareas de agente en Claude Code: el hook Stop impide que el agente declare "hecho" mientras queden filas sin veredicto, lo que obliga a completar la rejilla antes de devolver el control.
- Auditoría de criterios de aceptación en equipos de desarrollo: el hash de congelación permite reconstruir si los criterios se fijaron antes del trabajo o se añadieron después para justificar el resultado.
- Detección de checks tautológicos: la exigencia de una respuesta errónea plantada por criterio y su reejecución por parte del agente trabajador descarta comprobaciones que no pueden fallar.
- Revisión por pares de código generado: los tres asientos ciegos actúan como revisores independientes y el registro conserva el motivo de la minoría cuando hay desacuerdo, útil en revisiones de pull requests automatizadas.
- Registro de decisiones en tareas de larga duración: la carpeta `.rubicon/` sirve como traza de qué se evaluó, con qué asientos y con qué resultado por fila, sin enviar nada fuera de la máquina.
- Verificación de tareas con criterio subjetivo: cuando los asientos no alcanzan un sí unánime sobre si la persona daría la tarea por terminada, la skill consulta al solicitante y registra su respuesta como fila propia, lo que documenta la decisión humana.
- Integración en flujos de CI/CD de agentes: el script `rubicon.py` puede invocarse de forma independiente para tabular una rejilla y rechazar respuestas de asiento ausentes antes de dar por válido un resultado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato cuantitativo es el autotest incluido en `scripts/rubicon.py`, que cubre 34 casos con respuestas erróneas plantadas; no se documentan métricas de precisión, latencia ni comparación con alternativas.

## Requisitos de hardware

- No requiere GPU ni VRAM: es un plugin de Python de biblioteca estándar y Markdown.
- Requisito de software: Python 3 (`python3`, o `python` en Windows). El hook incorpora un fallback a `python` para evitar el stub de Microsoft Store, que devuelve el código de salida 49 sin ejecutar nada.
- No cabe hablar de cuantizaciones ni de despliegue en vLLM, llama.cpp, Ollama o TGI: no hay pesos que servir.
- Instalación mediante el marketplace de plugins de Claude Code: `/plugin marketplace add Heuremen-LLC/indahl.ai` y `/plugin install indahl-rubicon@heuremen`.
- La copia publicada en Hugging Face no incluye ficheros ejecutables: sus comandos descargan cada script del repositorio público `github.com/Heuremen-LLC/indahl.ai` en un commit fijado (`d30a91ae5edfb035140e7803fd20a43bad043a91`) y solo lo ejecutan si el sha256 coincide con el valor escrito en el comando (`4683bcee1d797fc288a7b61008dc3036667c9bdf20dbd9ca47792592e1bd0fb0` para `rubicon.py`).
- No se documentan latencia ni throughput; el coste depende del modelo Claude Code subyacente que ejecute la skill.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada alternativas comparables de la misma categoría (plugins de verificación para Claude Code con criterios congelados por hash y rejilla de asientos ciegos). La comparación con modelos de lenguaje no procede porque el artefacto no es un modelo.

## Limitaciones y advertencias

- El propio autor advierte que Rubicon es "un registro y un prompt, no un candado": interrumpe el primer intento de finalizar y pide reportar las filas abiertas, pero un segundo stop pasa, y un agente que edite `.rubicon/` puede derrotarlo. Detecta un "hecho" descuidado, no uno determinado.
- La puerta no juzga si los criterios elegidos eran los adecuados; solo verifica que se congelaron y se evaluaron.
- Los asientos de un mismo modelo comparten puntos ciegos, por lo que su acuerdo cuenta una vez y no tres. Cada veredicto registra qué asientos se usaron y si corrieron de forma independiente, pero esa independencia es autodeclarada.
- La respuesta de los asientos sobre si la persona daría la tarea por terminada es una conjetura del modelo sobre el solicitante, no el solicitante; por eso, sin un sí unánime, se consulta a la persona.
- El momento de congelación es el reloj de la máquina local: es autodeclarado y no verificable externamente.
- La reejecución del check contra la respuesta errónea plantada la hace el propio agente trabajador: queda registrada, no presenciada. Un asiento que vote MET sin reportar la captura mantiene la fila en UNRESOLVED.
- Un MET solo significa que ningún asiento construyó un caso en que el trabajo pase todos los checks y aun así falle lo pedido; no demuestra que no exista.
- Reconocer una fila no la resuelve: sigue abierta en el registro con su motivo.
- No se documentan sesgos de idioma ni de contenido porque no hay modelo; la documentación y la interfaz están en inglés.
- La licencia MIT permite uso comercial, pero conviene revisar los términos y la política de privacidad del proveedor antes de integrarlo en producción.
- La copia de Hugging Face depende de descargas desde GitHub en un commit fijado con verificación sha256; si el repositorio o la red no están disponibles, la instalación desde esta copia falla.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/indahl/indahl-rubicon
- Repositorio fuente: https://github.com/Heuremen-LLC/indahl.ai
- Script `rubicon.py` en el commit fijado: https://raw.githubusercontent.com/Heuremen-LLC/indahl.ai/d30a91ae5edfb035140e7803fd20a43bad043a91/claude-plugins/src/rubicon/scripts/rubicon.py
- Sitio del proveedor: https://indahl.ai
- Política de privacidad: https://indahl.ai/privacy
- Términos: https://indahl.ai/terms

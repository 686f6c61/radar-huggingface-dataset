# indahl/indahl-triangulate

## Resumen

Indahl Triangulate (`indahl-triangulate`) no es un modelo de lenguaje, sino un plugin para Claude Code publicado por Heuremen LLC bajo licencia MIT. Su funcion es plantear una misma pregunta a tres "asientos" independientes que operan a ciegas entre si y despues contrastar en que coinciden y en que discrepan. El resultado se condensa en una unica etiqueta de veredicto (ABOVE, BELOW, CONSISTENT o CANNOT_TELL para preguntas numericas; HOLDS, FAILS, SPLIT o CANNOT_TELL para preguntas de si o no), junto con la evidencia que permitiria decidir y un fichero `RECEIPT.md` que conserva literalmente la respuesta de cada asiento.

El interes del proyecto reside en su enfoque de verificacion: no se apoya en el consenso por mayoria, sino en la independencia de las cadenas de evidencia. La model card documenta una revision interna (atribuida a una revisora externa identificada como Sage) que detecto que la version inicial contaba asientos en lugar de evidencia y que aceptaba citas sin abrirlas; la version actual incorpora reglas de anclaje (UNGROUNDED, SHARED_SOURCE y la exigencia de dos asientos anclados sobre cadenas de evidencia independientes) y un procedimiento de comprobacion de fuentes que abre cada referencia antes de contarla.

Al tratarse de un plugin y no de un modelo, no dispone de pesos, arquitectura neuronal ni contexto propio: se ejecuta dentro de la sesion de Claude Code del usuario y delega la generacion en el modelo subyacente de esa sesion. Es relevante para equipos que necesitan auditar afirmaciones, cifras o juicios con trazabilidad documental antes de tomar una decision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (plugin para Claude Code; no es un modelo neuronal) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (depende del modelo subyacente de Claude Code) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (no distribuye pesos; se instala como plugin) |

## Arquitectura y entrenamiento

El plugin no entrena ningun modelo ni publica pesos. Su logica consiste en orquestar tres ejecuciones independientes y ciegas de la misma consulta dentro de Claude Code, recoger las respuestas de cada asiento y aplicar reglas de agregacion que distinguen entre consenso aparente y evidencia realmente independiente. La salida se normaliza a un conjunto cerrado de veredictos y se acompana de un registro literal (`RECEIPT.md`) que permite auditar posteriormente cada respuesta.

La innovacion tecnica declarada es el tratamiento de la evidencia: la version descrita en la model card marca como UNGROUNDED las respuestas sin respaldo, detecta SHARED_SOURCE cuando dos asientos citan la misma fuente y solo valida una conclusion cuando existen dos asientos anclados sobre cadenas de evidencia independientes. Ademas, incorpora un procedimiento de comprobacion de fuentes que abre cada cita antes de contarla como anclaje. No se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de RLHF o DPO, porque no aplican a un plugin de este tipo.

## Capacidades

- Triangulacion de preguntas numericas con veredictos ABOVE, BELOW, CONSISTENT o CANNOT_TELL.
- Triangulacion de preguntas de si o no con veredictos HOLDS, FAILS, SPLIT o CANNOT_TELL.
- Ejecucion de tres asientos independientes y ciegos entre si dentro de la misma sesion.
- Deteccion de respuestas sin respaldo (UNGROUNDED) y de fuentes compartidas entre asientos (SHARED_SOURCE).
- Exigencia de dos asientos anclados sobre cadenas de evidencia independientes para validar una conclusion.
- Comprobacion de fuentes: apertura de cada cita antes de contarla como evidencia.
- Generacion de un fichero `RECEIPT.md` con la respuesta literal de cada asiento.
- Invocacion mediante el comando `/triangulate` seguido de la afirmacion o pregunta a comprobar.
- Integracion opcional con el conector `indahl-data` para que un asiento consulte datos publicos de indahl.ai.
- No requiere dependencias externas ni servicios propios: se ejecuta dentro de la sesion de Claude Code.

## Casos de uso

- Verificacion de acuerdos de nivel de servicio: plantear si el 99,9 % de disponibilidad declarado por un proveedor se cumple en el ultimo trimestre y obtener un veredicto HOLDS, FAILS o SPLIT con la evidencia que lo sustenta.
- Auditoria de cifras en informes internos: comprobar si un dato de facturacion, latencia o conversion citado en una presentacion se sostiene frente a tres lecturas independientes antes de publicarlo.
- Revision de afirmaciones tecnicas: validar si una arquitectura o una version de libreria presenta la limitacion descrita en una propuesta de migracion, con trazabilidad de fuentes en `RECEIPT.md`.
- Due diligence de proveedores: contrastar afirmaciones de un tercero (certificaciones, cumplimiento, volumen de clientes) y dejar registro literal de las respuestas para el expediente.
- Control de calidad de documentacion: detectar afirmaciones sin respaldo (UNGROUNDED) en borradores de documentacion tecnica o comercial antes de su publicacion.
- Analisis de decisiones con desacuerdo interno: cuando un equipo esta dividido sobre una decision, el plugin expone en que puntos hay consenso y en cuales la evidencia se divide (SPLIT).
- Verificacion de fuentes en investigacion aplicada: usar la comprobacion de citas para descartar referencias que no resisten una apertura efectiva del documento original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No requiere GPU ni VRAM propia: el plugin se ejecuta dentro de Claude Code y la inferencia la realiza el modelo subyacente de esa sesion.
- No necesita descarga de pesos ni almacenamiento de modelo.
- El consumo de recursos depende enteramente del entorno donde corra Claude Code y del modelo que este utilice.
- Despliegue mediante el gestor de plugins de Claude Code: `/plugin marketplace add Heuremen-LLC/indahl.ai` y `/plugin install indahl-triangulate@heuremen`.
- No se documentan latencia ni throughput; cada invocacion implica tres ejecuciones independientes de la consulta, por lo que el coste temporal y de tokens es aproximadamente el triple de una consulta simple, aunque este dato no se cuantifica en la informacion disponible.
- Opciones de despliegue alternativas (vLLM, llama.cpp, Ollama, TGI): no aplican.

## Comparativa con modelos similares

| Herramienta | Tipo | Enfoque | Numero de lecturas | Trazabilidad | Licencia |
|---|---|---|---|---|---|
| Indahl Triangulate | Plugin para Claude Code | Triangulacion con reglas de anclaje de evidencia | Tres asientos ciegos | `RECEIPT.md` con respuestas literales y comprobacion de fuentes | MIT |
| Autoconsistencia (self-consistency) | Tecnica de prompting | Mayoria sobre multiples muestras | Variable | No documentada en la informacion disponible | no disponible |
| Debate multiagente | Patron de orquestacion | Discusion entre agentes | Variable | no disponible | no disponible |
| Verificacion por modelo juez | Patron de evaluacion | Un modelo evalua a otro | Una o varias | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto por si mismo ni puede evaluarse con benchmarks de MMLU, HumanEval o GSM8K.
- La calidad del veredicto depende del modelo subyacente de Claude Code y de la disponibilidad de fuentes consultables; el plugin no garantiza la veracidad de las citas mas alla del procedimiento de apertura declarado.
- La independencia de los asientos es una independencia de ejecucion, no de modelo: los tres asientos corren sobre la misma infraestructura, lo que puede producir correlacion de errores no detectada por las reglas SHARED_SOURCE.
- El plugin puede contactar con el conector `indahl-data` si esta instalado, lo que introduce una dependencia opcional de un servicio externo de Heuremen LLC.
- La model card reconoce que versiones previas contaban asientos en lugar de evidencia y aceptaban citas sin abrirlas; conviene verificar que la version desplegada incluye las correcciones descritas.
- No se documentan sesgos conocidos, cobertura idiomatica ni limitaciones de contexto propias; dependen del modelo subyacente.
- La licencia MIT permite uso comercial, pero el plugin se apoya en Claude Code, sujeto a sus propios terminos.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion externa de la comunidad.
- Uso en produccion: el coste por consulta se triplica respecto a una consulta simple y no se publican metricas de latencia ni de tasa de acierto.

## Enlaces

- Hugging Face: https://huggingface.co/indahl/indahl-triangulate
- Repositorio del plugin: https://github.com/Heuremen-LLC/indahl-triangulate
- Codigo fuente en el monorepo: https://github.com/Heuremen-LLC/indahl.ai/tree/main/claude-plugins/src/triangulate
- Sitio del autor: https://indahl.ai
- Politica de privacidad: https://indahl.ai/privacy
- Terminos de uso: https://indahl.ai/terms

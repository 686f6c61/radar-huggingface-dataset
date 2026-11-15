# indahl/indahl-both

## Resumen

`indahl/indahl-both` no es un modelo de lenguaje, sino un plugin para Claude Code publicado por Heuremen LLC bajo licencia MIT. Su funcion es estructurar el razonamiento del agente para que mantenga abiertas dos explicaciones competidoras (A y B) en lugar de decantarse prematuramente por una de ellas, y ademas obliga a considerar explicitamente las hipotesis BOTH (ambas) y NEITHER (ninguna). El repositorio de Hugging Face actua como espejo del codigo fuente alojado en GitHub, en el commit `f857af9`.

El problema que aborda es el sesgo de cierre prematuro en tareas de diagnostico: cuando dos patrones encajan con la evidencia disponible, o cuando un resultado puede deberse al fenomeno estudiado o al propio instrumento de medida, un agente tiende a elegir una explicacion y descartar la otra. El plugin impone un formato de salida con dos afirmaciones contrapuestas, dos registros de evidencia independientes y el test que permitiria discriminar entre ambas.

No se dispone de informacion sobre parametros, arquitectura, contexto ni pesos, porque el artefacto no contiene un modelo entrenado. Se invoca dentro de Claude Code mediante el comando `/both` y no contacta servicios externos: se ejecuta integramente en la sesion del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (plugin de Claude Code, no es un modelo neuronal) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (delegada en el modelo subyacente de Claude Code) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (no hay pesos; el artefacto es codigo fuente y metadatos de plugin) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento. El artefacto es un plugin escrito para el ecosistema de Claude Code, distribuido a traves de un marketplace de plugins de Heuremen LLC (`Heuremen-LLC/indahl.ai`). La logica consiste en una plantilla de razonamiento que fuerza al agente a producir: dos lecturas A y B formuladas como afirmaciones que predicen cosas distintas; dos registros de evidencia con una fila por pieza de evidencia y su incidencia sobre A, B, BOTH y NEITHER; el test que separaria ambas lecturas o la constatacion de que todavia no existe; y un estado final (A, B, BOTH, NEITHER u OPEN) acompanado de la fila que lo ha determinado.

El repositorio de Hugging Face es un espejo del codigo en GitHub, actualizado a partir del commit `f857af9`. No se documenta en la informacion disponible ningun tipo de ajuste fino, RLHF, DPO ni dataset de entrenamiento, lo cual es coherente con la naturaleza del artefacto.

## Capacidades

- Estructuracion de razonamiento diagnostico en dos hipotesis competidoras (A y B) con predicciones diferenciadas.
- Mantenimiento de registros de evidencia separados por hipotesis, con trazabilidad fila a fila.
- Evaluacion explicita de las categorias BOTH (la evidencia sostiene ambas) y NEITHER (la evidencia no sostiene ninguna).
- Identificacion del experimento o test que discriminaria entre las lecturas, o declaracion de que aun no existe.
- Emision de un estado final acotado (A, B, BOTH, NEITHER, OPEN) con justificacion de la fila que lo provoco.
- Invocacion mediante comando de barra `/both` seguido de la cuestion a analizar.
- Ejecucion local dentro de la sesion de Claude Code, sin llamadas a servicios externos.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, audio, tool calling generico ni soporte multilingue propias del plugin.

## Casos de uso

- Diagnostico de rendimiento en produccion: ante una caida de latencia, el plugin obliga a contrastar la hipotesis de la nueva cache frente a la de que el test se ejecuto en horas de menor carga, y a proponer el test que las separe.
- Analisis de causa raiz en incidentes: cuando dos fallos encajan con los logs, se generan dos registros de evidencia independientes que evitan cerrar el postmortem sobre la primera explicacion plausible.
- Evaluacion de experimentos cientificos: distingue si un resultado proviene del fenomeno estudiado o del instrumento de medida, un escenario citado explicitamente en la model card.
- Revision de experimentos A/B de producto: permite mantener abiertas la hipotesis de efecto real y la de artefacto de segmentacion antes de declarar ganador.
- Analisis de hipotesis en investigacion aplicada: util cuando dos patrones encajan con los datos y se necesita documentar que evidencia sostiene cada uno y cual seria el test decisivo.
- Auditoria de conclusiones previas: aplicable a informes donde una conclusion se cerro con evidencia ambigua, forzando la reconstruccion de las lecturas alternativas y su registro de evidencia.
- Formacion y revision metodologica: sirve como plantilla reproducible para ensenar a equipos a no colapsar prematuramente en una unica explicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No requiere GPU ni VRAM propia: el plugin se ejecuta dentro de Claude Code y delega la inferencia en el modelo subyacente de esa herramienta.
- No aplica seleccion de GPU (A100, H100, RTX 4090 u otras) para el plugin en si.
- No hay requisitos de cuantizacion ni de formato de pesos.
- Despliegue: instalacion mediante `/plugin marketplace add Heuremen-LLC/indahl.ai` y `/plugin install indahl-both@heuremen`.
- Latencia y throughput: no disponibles; dependen del modelo de Claude Code sobre el que se ejecute la sesion.
- La model card declara explicitamente "Requirements: None".

## Comparativa con modelos similares

| Alternativa | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| indahl/indahl-both | Plugin de razonamiento para Claude Code | no aplica | delegado en Claude Code | MIT | Hugging Face (espejo) y GitHub |
| Modelos de lenguaje de proposito general | LLM | no disponible | no disponible | no disponible | no disponible |
| Frameworks de prompting estructurado | Plantillas y cadenas de razonamiento | no aplica | delegado en el modelo anfitrion | variable | no disponible |

No se dispone de informacion sobre alternativas directamente comparables de la misma categoria (plugins de Claude Code con logica de hipotesis competidoras) en el material proporcionado.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto de forma autonoma ni puede evaluarse con benchmarks tipo MMLU, HumanEval o GSM8K.
- Su comportamiento depende por completo del modelo subyacente de Claude Code; la calidad del razonamiento resultante no esta garantizada por el plugin.
- La model card no documenta sesgos conocidos, tasas de alucinacion ni evaluaciones de robustez.
- No se especifican los idiomas soportados; la documentacion esta en ingles y no hay confirmacion de funcionamiento en castellano.
- El estado final puede quedar en OPEN de forma legitima, lo que puede resultar poco util si se espera una conclusion cerrada.
- El artefacto en Hugging Face es un espejo de GitHub en el commit `f857af9`; puede quedar desincronizado respecto al repositorio principal.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero no se detallan garantias ni soporte.
- El plugin declara no contactar servicios externos, pero la sesion de Claude Code en la que se ejecuta si depende de la infraestructura de Anthropic.
- Sin descargas ni likes en el momento de la consulta; no hay evidencia de uso en produccion por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/indahl/indahl-both
- Codigo fuente en GitHub: https://github.com/Heuremen-LLC/indahl.ai/tree/main/claude-plugins/src/both
- Espejo del repositorio: https://github.com/Heuremen-LLC/indahl-both
- Sitio del autor: https://indahl.ai
- Politica de privacidad: https://indahl.ai/privacy
- Terminos de uso: https://indahl.ai/terms

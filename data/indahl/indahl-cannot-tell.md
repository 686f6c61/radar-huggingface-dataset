# indahl/indahl-cannot-tell

## Resumen

`indahl-cannot-tell` no es un modelo de lenguaje, sino un plugin para Claude Code publicado por el repositorio de Hugging Face `indahl/indahl-cannot-tell`, atribuido a Heuremen LLC. Su funcion es imponer un procedimiento de respuesta cuando la evidencia disponible no permite resolver una pregunta: en lugar de forzar una conclusion, el asistente devuelve el estado `CANNOT_TELL` y explicita el rango de resultados todavia posibles.

El plugin esta etiquetado como `claude-code-plugin` y se distribuye bajo licencia MIT. No incluye pesos, no expone un pipeline de inferencia y no declara idiomas soportados; su ejecucion depende del entorno Claude Code del usuario, dentro del cual se invoca mediante el comando `/cannot-tell` seguido de la cuestion a evaluar.

Su relevancia es practica para equipos que usan asistentes de codigo en produccion: reduce el riesgo de respuestas inventadas en decisiones binarias (si un despliegue terminara antes de una ventana de congelacion, si un numero es sostenible, etc.) obligando a declarar que falta y cual es la via mas barata para obtenerlo. La informacion publica disponible es muy limitada: cero descargas, cero likes y una model card que describe el comportamiento del plugin, no caracteristicas de un modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (plugin para Claude Code, no es un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (no distribuye pesos) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado. El artefacto es un plugin que se instala en Claude Code mediante el marketplace `Heuremen-LLC/indahl.ai` y que anade el comando `/cannot-tell`. Su logica consiste en un procedimiento de respuesta que estructura la salida en cuatro partes: el resultado `CANNOT_TELL`, el rango de lo que sigue siendo posible (con cotas si la pregunta es numerica), los hechos, pruebas o fuentes que decidirian la cuestion y hacia donde apuntaria cada resultado, y el siguiente paso mas barato junto con una inclinacion etiquetada como tal.

No hay datos publicos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre tecnicas de RLHF o DPO, porque no existe un modelo subyacente propio. El plugin no contacta servicios externos segun su model card: se ejecuta dentro de la sesion del usuario. El repositorio de Hugging Face es un espejo del repositorio de GitHub `Heuremen-LLC/indahl-cannot-tell` en el commit `c8d9e1a`.

## Capacidades

- Estructuracion de respuestas ante preguntas no resueltas por la evidencia, devolviendo explicitamente `CANNOT_TELL`.
- Delimitacion del rango de resultados posibles, incluyendo cotas cuando la pregunta admite una respuesta numerica.
- Identificacion de los hechos, pruebas o fuentes que permitirian decidir la cuestion, indicando la direccion de cada resultado.
- Proposicion del siguiente paso de menor coste para obtener la informacion faltante.
- Declaracion de una inclinacion del asistente, etiquetada como inclinacion y no como veredicto.
- Invocacion mediante el comando `/cannot-tell` dentro de Claude Code.
- Sin dependencias externas ni llamadas a servicios de red durante la ejecucion.
- No disponible: capacidades de generacion de texto, codigo, matematicas, vision, audio, tool calling o agentes por si mismo; dependen del modelo Claude Code anfitrion.

## Casos de uso

- Revision de despliegues con ventana de congelacion: el plugin se invoca con los logs de las ultimas ejecuciones y devuelve si la migracion terminara antes del bloqueo, que metrica decidiria la respuesta y cual seria la comprobacion mas barata, evitando una prediccion sin base.
- Triaje de incidencias en produccion: ante un sintoma ambiguo, el equipo obtiene el conjunto de causas aun compatibles y la prueba concreta que las discriminaria, en lugar de una hipotesis presentada como diagnostico.
- Estimacion de costes o capacidad: cuando se pide una cifra que los datos disponibles no sostienen, el plugin devuelve un intervalo con cotas y la fuente que permitiria cerrarlo.
- Revision de codigo asistida: en una pull request con informacion incompleta sobre el comportamiento en produccion, el asistente declara que no puede validar el cambio y especifica que test o traza haria falta.
- Analisis de datos exploratorio: antes de emitir una recomendacion sobre un conjunto de datos parcial, el plugin enumera las hipotesis compatibles y el experimento minimo para descartarlas.
- Gobernanza y auditoria de decisiones: en flujos donde una respuesta binaria tiene consecuencias (aprobacion de un cambio, cumplimiento de un plazo), el registro de `CANNOT_TELL` y de las comprobaciones pendientes sirve como evidencia de que no se emitio un veredicto sin sustento.
- Formacion de equipos: uso del comando como plantilla para ensenar a distinguir entre lo que la evidencia sostiene, lo que es una inclinacion y lo que requiere una prueba adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No requiere GPU ni VRAM propia: el plugin se ejecuta dentro de Claude Code, por lo que el coste computacional corresponde al modelo anfitrion que el usuario tenga configurado.
- No aplica seleccion de GPU (A100, H100, RTX 4090 u otras) para el plugin en si.
- No aplica despliegue con vLLM, llama.cpp, Ollama o TGI: la instalacion se realiza con `/plugin marketplace add Heuremen-LLC/indahl.ai` y `/plugin install indahl-cannot-tell@heuremen`.
- Latencia y throughput no disponibles; dependen integramente del modelo Claude Code subyacente.
- Requisitos declarados: ninguno, mas alla de disponer de Claude Code.

## Comparativa con modelos similares

| Criterio | indahl-cannot-tell | Modelos de lenguaje (referencia generica) | Plugins de Claude Code (categoria) |
|---|---|---|---|
| Naturaleza | Plugin de procedimiento | Modelo con pesos | Plugin de procedimiento |
| Parametros | no disponible (no aplica) | Variable | no disponible (no aplica) |
| Contexto | no disponible (lo fija el anfitrion) | Variable | no disponible (lo fija el anfitrion) |
| Licencia | MIT | Variable | Variable |
| Pesos distribuidos | No | Si | No |
| Contacta servicios externos | No | No aplica | Depende del plugin |

No se dispone de informacion sobre plugins comparables especificos ni sobre resultados de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto por si mismo ni puede evaluarse con benchmarks de LLM; su comportamiento depende del modelo Claude Code anfitrion.
- La informacion publica es minima (cero descargas, cero likes, sin pipeline declarado, sin idiomas declarados), lo que impide verificar su madurez o adopcion.
- No se especifican sesgos conocidos ni tasas de alucinacion del procedimiento; el riesgo de que el asistente anfitrion ignore la instruccion y fuerce una conclusion no esta documentado.
- No hay datos sobre el comportamiento multilingue; la model card esta redactada unicamente en ingles y no declara idiomas soportados.
- La licencia MIT permite uso comercial, pero no se detallan garantias ni soporte; la responsabilidad recae en el usuario.
- El plugin esta vinculado a un ecosistema concreto (Claude Code) y a un marketplace de terceros (`Heuremen-LLC/indahl.ai`), lo que limita su portabilidad a otros asistentes.
- La fecha de creacion indicada en Hugging Face (2026-11-15) es posterior a la fecha actual de redaccion habitual; conviene verificar la vigencia del repositorio antes de integrarlo.
- El repositorio de Hugging Face es un espejo de GitHub en el commit `c8d9e1a`; los cambios posteriores en el repositorio original pueden no estar reflejados.

## Enlaces

- Hugging Face: https://huggingface.co/indahl/indahl-cannot-tell
- Repositorio GitHub (espejo): https://github.com/Heuremen-LLC/indahl-cannot-tell
- Codigo fuente del plugin: https://github.com/Heuremen-LLC/indahl.ai/tree/main/claude-plugins/src/cannot-tell
- Sitio del autor: https://indahl.ai
- Politica de privacidad: https://indahl.ai/privacy
- Terminos de uso: https://indahl.ai/terms

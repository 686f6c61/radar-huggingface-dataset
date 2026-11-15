# indahl/indahl-data

## Resumen

`indahl/indahl-data` no es un modelo de lenguaje, sino un paquete de datos y un plugin para Claude Code publicado en Hugging Face bajo el identificador `indahl/indahl-data`. Su funcion es conectar Claude Code con el servidor MCP de solo lectura de indahl.ai (Heuremen LLC), de modo que el asistente pueda formular consultas contra mediciones en vivo y devolver cada cifra acompanada de su recuento, denominador, intervalo de confianza, nivel, resultado (ABOVE, BELOW, CONSISTENT o CANNOT_TELL), enlace a la fuente y momento de lectura.

El repositorio no contiene pesos, tokenizador ni configuracion de inferencia: la model card describe exclusivamente el plugin, su instalacion mediante el marketplace de Claude Code y las condiciones de uso. Por tanto, no dispone de arquitectura de red neuronal, parametros, longitud de contexto ni cuantizaciones asociadas.

Su relevancia actual reside en el patron de diseno: expone datos verificables con trazabilidad estadistica completa (incluyendo resultados negativos como "nada devuelto", "rechazado" o "retenido contabilizado") en lugar de respuestas generativas sin respaldo. Es util para auditar afirmaciones publicadas sobre calibracion de IBM Quantum, servidores NTP publicos, resolvers DNS con filtrado, licencias y tamanos de modelos, calibracion de pronosticos, fechas de lanzamiento o reporte de resultados de ensayos clinicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es un plugin MCP de datos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible (sujeta a los terminos de https://indahl.ai/terms) |
| Formato de pesos | no disponible (el repositorio contiene datos y codigo de plugin, no pesos) |

## Arquitectura y entrenamiento

No aplica en el sentido habitual. El componente tecnico es un plugin para Claude Code que registra herramientas de un servidor MCP remoto alojado en `https://indahl.ai/mcp`, accesible sin clave de API. El servidor es de solo lectura y devuelve, para cada afirmacion consultada, una estructura con recuento y denominador, intervalo y nivel, resultado categorico, enlace a la fuente y timestamp de lectura. Los resultados "nada devuelto", "rechazado" y "retenido contabilizado" se reportan como categorias propias y no se pliegan en aprobado o fallido.

No hay datos de entrenamiento, RLHF ni DPO asociados al repositorio. La model card indica que la version fue revisada antes de su publicacion por Sage, arbitro externo de Heuremen LLC, el 13 de noviembre de 2026, y que todas las correcciones de esa revision se aplicaron antes del lanzamiento.

## Capacidades

- Consulta de afirmaciones contra mediciones en vivo de Heuremen LLC a traves del servidor MCP de indahl.ai.
- Devolucion de cada cifra con recuento, denominador, intervalo, nivel de confianza, resultado y recibo (fuente y momento de lectura).
- Clasificacion explicita del resultado en ABOVE, BELOW, CONSISTENT o CANNOT_TELL.
- Tratamiento separado de casos sin datos: nada devuelto, rechazado y retenido contabilizado.
- Invocacion mediante el comando `/indahl` seguido de la pregunta a verificar.
- Ejecucion sin clave de API ni autenticacion adicional.
- Ambitos cubiertos segun la model card: calibracion de IBM Quantum, servidores de tiempo publicos (NTP), resolvers DNS con filtrado, licencias y tamanos de modelos, calibracion de pronosticos, fechas de lanzamiento y reporte de resultados de ensayos clinicos.
- No incluye generacion de texto, codigo, matematicas, vision, audio ni tool calling propio mas alla de las herramientas expuestas por el servidor MCP.

## Casos de uso

- Auditoria de afirmaciones sobre calibracion cuantica: consultar como se sostiene una cifra publicada de calibracion de IBM Quantum, obteniendo el intervalo y el recuento que la respaldan en lugar de una respuesta sin fuente.
- Verificacion de infraestructura de tiempo: preguntar como se comparan los servidores NTP publicos con su precision declarada, con resultado categorico y enlace a la medicion.
- Evaluacion de resolvers DNS con filtrado: comprobar el comportamiento observado frente al declarado por el proveedor, con denominador y nivel de confianza explicitos.
- Gobernanza de modelos: verificar licencias y tamanos de modelos antes de adoptarlos, con recibo de la fuente y fecha de lectura para dejar constancia en un proceso de aprobacion interno.
- Revision de calibracion de pronosticos: contrastar la calibracion declarada de un sistema de prediccion con los datos subyacentes y su intervalo.
- Comprobacion de fechas de lanzamiento: validar afirmaciones sobre fechas publicadas y distinguir entre evidencia consistente y casos en que no se puede determinar (CANNOT_TELL).
- Revision de reporte de ensayos clinicos: comprobar si los resultados reportados se sostienen contra los datos citados, con trazabilidad de fuente y momento de consulta.
- Integracion en flujos de Claude Code: usar `/indahl` dentro de una sesion de desarrollo para contrastar una afirmacion tecnica sin salir del entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No requiere GPU ni VRAM: el paquete no contiene pesos ni ejecuta inferencia local.
- Requiere Claude Code instalado y acceso de red a `indahl.ai`.
- Instalacion mediante `/plugin marketplace add Heuremen-LLC/indahl.ai` seguido de `/plugin install indahl-data@heuremen`.
- El coste computacional de la generacion recae en el modelo subyacente de Claude Code, no en este paquete.
- Latencia y throughput dependen de la red y del servidor MCP remoto; no se publican cifras.
- Opciones de despliegue alternativas (vLLM, llama.cpp, Ollama, TGI) no aplican.

## Comparativa con modelos similares

| Criterio | indahl/indahl-data | Modelo de lenguaje tipico en Hugging Face | Conector MCP generico |
|---|---|---|---|
| Naturaleza | Plugin MCP de datos para Claude Code | Pesos y configuracion de inferencia | Integracion con una API externa |
| Parametros | no aplica | Variable | no aplica |
| Contexto | no aplica | Definido por el modelo | Depende del servidor |
| Trazabilidad estadistica | Recuento, denominador, intervalo, nivel y recibo por cifra | No garantizada | Variable |
| Licencia | No disponible; sujeta a terminos de indahl.ai | Habitualmente explicita | Variable |
| Ejecucion local | No | Si, segun formato | No |

No se identifican en la informacion proporcionada otros paquetes directamente comparables con el mismo esquema de resultados categoricos y recibos.

## Limitaciones y advertencias

- No es un modelo: no genera texto, codigo ni respuestas abiertas por si mismo; depende de Claude Code y de su modelo subyacente.
- Dependencia total de un servicio externo (`indahl.ai`); sin red no hay funcionalidad.
- Las consultas enviadas al servidor MCP incluyen los parametros de la pregunta; la model card advierte de no incluir datos privados en las consultas.
- El servidor no almacena consultas, pero Cloudflare, que sirve el sitio, conserva sus registros estandar de peticiones.
- Uso permitido para recuperacion y respuesta; no se permite guardar respuestas para entrenar, ajustar o construir modelos, segun los terminos.
- Licencia no declarada en Hugging Face: la condiciones aplicables son las de https://indahl.ai/terms, lo que exige revision juridica antes de uso comercial.
- Cobertura limitada a los ambitos medidos por Heuremen LLC; fuera de ellos el resultado previsible es CANNOT_TELL o ausencia de datos.
- El repositorio registra 0 descargas y 0 likes, sin pipeline declarado ni idiomas especificados: madurez y adopcion no verificables.
- Las respuestas del servidor se tratan como datos y no como instrucciones, lo que mitiga pero no elimina el riesgo de inyeccion de contenido en la fuente.

## Enlaces

- Hugging Face: https://huggingface.co/indahl/indahl-data
- Servidor MCP: https://indahl.ai/mcp
- Sitio del proveedor: https://indahl.ai
- Politica de privacidad: https://indahl.ai/privacy
- Terminos de uso: https://indahl.ai/terms
- Codigo fuente del plugin: https://github.com/Heuremen-LLC/indahl.ai/tree/main/claude-plugins/src/indahl-data

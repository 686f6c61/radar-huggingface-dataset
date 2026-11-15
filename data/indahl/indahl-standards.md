# indahl/indahl-standards

## Resumen

`indahl-standards` no es un modelo de lenguaje, sino un plugin para Claude Code publicado por Heuremen LLC bajo el identificador `indahl/indahl-standards` en Hugging Face. Su funcion es auditar articulos publicados, preprints o afirmaciones medidas contra los codigos de estandar F1 a F7 definidos por Heuremen LLC, y devolver una "recount card" (tarjeta de recuento) con el estado de cada codigo. No contiene pesos de red neuronal, no genera texto de forma autonoma y no dispone de parametros, contexto ni cuantizaciones en el sentido habitual de un modelo fundacional.

El plugin se distribuye como extension del agente de codigo Claude Code y se invoca mediante el comando `/standards` seguido del documento o la referencia a comprobar (por ejemplo, una ruta local a un PDF, un identificador arXiv o un DOI). Internamente ejecuta la skill `standards-check`, que aplica el texto completo del estandar (incluido en formato legible por maquina dentro del plugin) y produce un informe estructurado con citas literales, ubicaciones, el ambito consultado, la aritmetica de los numeros recalculados y una entrada `not_tested` para todo lo que no se haya verificado.

Su relevancia actual es de nicho pero concreta: cubre la necesidad de verificacion de consistencia interna en literatura cientifica y afirmaciones cuantitativas, un caso de uso donde los LLM generalistas tienden a alucinar o a aceptar cifras sin recalcular. Al estar empaquetado como plugin de Claude Code, la logica de auditoria se delega en el modelo que ejecute el agente, mientras que el plugin aporta el marco normativo, la estructura de salida y las garantias de trazabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Plugin para Claude Code (skill `standards-check`); no es un modelo neuronal |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (depende del modelo subyacente de Claude Code) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible |
| Licencia | `other` / `see-license-file` (texto en LICENSE-STANDARD.txt) |
| Formato de pesos | no disponible (no hay pesos; se distribuye como plugin) |

## Arquitectura y entrenamiento

El artefacto no es un transformer ni un modelo MoE: es un plugin que se integra en Claude Code mediante un marketplace (`Heuremen-LLC/indahl.ai`) y expone el comando `/standards`. La logica de auditoria reside en la skill `standards-check`, que incorpora el texto completo del estandar F1–F7 en formato legible por maquina y lo aplica al documento aportado por el usuario. No hay datos de entrenamiento, tokens procesados, RLHF ni DPO asociados al artefacto, porque no se entrena ningun modelo.

La innovacion tecnica destacable es el formato de salida: una tarjeta de recuento con estados discretos (PRESENT, ABSENT, CANNOT_TELL, NOT_APPLICABLE) por cada codigo, citas literales con su ubicacion, el ambito de busqueda declarado, la aritmetica de cualquier cifra recalculada y una entrada `not_tested` que documenta explicitamente lo que no se ha comprobado y por que. El plugin no contacta servicios propios: cuando se le pasa un identificador arXiv o un DOI, es Claude quien recupera el documento con sus propias herramientas y trata el texto como datos, no como instrucciones, lo que mitiga riesgo de inyeccion de prompt desde el documento auditado.

## Capacidades

- Auditoria de consistencia interna de articulos, preprints y afirmaciones medidas contra los codigos F1 a F7 del estandar Heuremen LLC.
- Generacion de una tarjeta de recuento estructurada con estado por codigo (PRESENT, ABSENT, CANNOT_TELL, NOT_APPLICABLE).
- Extraccion de citas literales con ubicacion y declaracion del ambito consultado.
- Recalculo aritmetico de cifras y presentacion del calculo realizado.
- Declaracion explicita de elementos no comprobados mediante la entrada `not_tested`.
- Invocacion mediante comando `/standards` con rutas locales, identificadores arXiv o DOI.
- Aislamiento frente a inyeccion de prompt: el texto del documento se trata como datos, no como instrucciones.
- No requiere dependencias externas ni claves de API adicionales; se ejecuta dentro de Claude Code.

## Casos de uso

- Revision interna de preprints antes de envio: un equipo de investigacion pasa su PDF por `/standards ./preprint.pdf` y obtiene una tarjeta con los codigos F1–F7 en estado PRESENT, ABSENT o CANNOT_TELL, lo que permite corregir cabeceras seleccionadas o intervalos ausentes antes de la sumision.
- Auditoria de afirmaciones cuantitativas en notas de prensa o informes tecnicos: el plugin recalcula las cifras declaradas y muestra la aritmetica, de modo que un responsable de comunicacion puede detectar numeros que no recomputan.
- Verificacion de consistencia en revision por pares: un revisor ejecuta el plugin sobre el articulo asignado para localizar de forma sistematica lecturas no publicadas o intervalos de confianza omitidos, con citas literales que puede incorporar al informe.
- Control de calidad en equipos de datos y ML: antes de publicar una model card o un informe de benchmarks, el plugin comprueba que las cifras declaradas cuadran con las tablas y que no hay resultados seleccionados sin contexto.
- Docencia y formacion en metodologia: el docente usa la tarjeta de recuento como ejemplo tangible de los codigos F1–F7 y de como se documenta lo que no se ha verificado (`not_tested`), fomentando practicas de reporte transparentes.
- Auditoria de literatura para fondos o agencias: un evaluador pasa varios DOIs por el comando y recopila las tarjetas para justificar observaciones sobre consistencia interna de las propuestas o de los articulos citados.
- Integracion en flujos editoriales: un editor ejecuta el plugin sobre manuscritos aceptados para generar un anexo de verificacion reproducible antes de la publicacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No requiere GPU ni VRAM propia: el plugin se ejecuta dentro de Claude Code y delega la inferencia en el modelo subyacente del agente.
- No aplica comparativa de A100, H100 o RTX 4090, ya que no hay pesos que cargar.
- No se ejecuta en llama.cpp, Ollama, vLLM ni TGI: el unico canal de despliegue documentado es el marketplace de plugins de Claude Code (`/plugin marketplace add Heuremen-LLC/indahl.ai` y `/plugin install indahl-standards@heuremen`).
- Latencia y throughput: no disponibles; dependen del modelo y del plan de Claude Code que ejecute el comando, asi como de la longitud del documento auditado.
- Requisito funcional: disponer de Claude Code y, para identificadores arXiv o DOI, acceso de red a traves de las herramientas del propio agente.

## Comparativa con modelos similares

| Herramienta | Tipo | Enfoque | Licencia | Distribucion |
|---|---|---|---|---|
| `indahl-standards` | Plugin Claude Code | Auditoria F1–F7 con tarjeta de recuento y `not_tested` | `other` (see-license-file) | Marketplace Claude Code / mirror en GitHub |
| Revisores LLM genericos (p. ej. prompts ad hoc) | Prompt sobre LLM | Revision libre sin marco normativo fijo | Depende del modelo | Manual |
| Herramientas de reproducibilidad (p. ej. `reproducibility-checker`, no verificado en esta busqueda) | Script / libreria | Comprobacion de artefactos y entornos | Variable | Repositorios |
| Estadistica de verificacion manual | Proceso humano | Revision por pares tradicional | no aplica | no aplica |

No se dispone de datos comparativos de rendimiento cuantitativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto libre, no responde preguntas abiertas y no sustituye a un LLM generalista.
- Su cobertura se limita a los codigos F1–F7 del estandar Heuremen LLC; afirmaciones fuera de ese marco quedaran como `not_tested` o `NOT_APPLICABLE`.
- La calidad de la auditoria depende del modelo subyacente de Claude Code y de las herramientas que este tenga habilitadas; el plugin no garantiza deteccion completa de errores.
- La licencia es `other` con nombre `see-license-file` y enlace a `LICENSE-STANDARD.txt`; es imprescindible revisar ese texto antes de cualquier uso comercial o redistribucion.
- No se declaran idiomas soportados; el comportamiento linguistico dependera del modelo del agente.
- Riesgo de alucinacion inherente al agente que ejecuta la skill: aunque el plugin exige citas literales y aritmetica explicita, conviene verificar manualmente las citas y los recalculos criticos.
- El plugin no contacta servicios propios, pero al pasar un arXiv o DOI delega la descarga en las herramientas de Claude; hay que asumir las politicas de privacidad y terminos de Heuremen LLC (`indahl.ai/privacy`, `indahl.ai/terms`) y de Anthropic.
- El artefacto es un mirror del repositorio GitHub en el commit `84d6f16`; conviene comprobar que la version instalada coincide con la auditada.

## Enlaces

- Hugging Face: https://huggingface.co/indahl/indahl-standards
- Estandar Heuremen LLC: https://indahl.ai/standard
- Licencia: https://huggingface.co/indahl/indahl-standards/blob/main/LICENSE-STANDARD.txt
- Repositorio fuente (plugin): https://github.com/Heuremen-LLC/indahl.ai/tree/main/claude-plugins/src/standards
- Mirror del repositorio: https://github.com/Heuremen-LLC/indahl-standards
- Politica de privacidad: https://indahl.ai/privacy
- Terminos de uso: https://indahl.ai/terms
- Sitio del autor: https://indahl.ai

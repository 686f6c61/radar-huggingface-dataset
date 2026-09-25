# DoppelApp/judgment

## Resumen

DoppelApp/judgment no es un modelo de lenguaje publicado, sino un artefacto de runtime versionado que consumen las versiones compatibles de Doppel. El propio autor lo declara explicitamente en la model card: no es un modelo autonomo, ni un SDK, ni una API publica soportada, y su formato, contrato de compatibilidad y comportamiento son detalles de implementacion privados que pueden cambiar sin aviso. El repositorio ocupa 1,9 GB y esta marcado con `inference: false`, es decir, no esta pensado para carga directa por terceros.

La unica informacion tecnica sustantiva que aporta la model card es la trazabilidad de linaje: la distribucion incluye material modificado derivado de `fastino/GLiNER2.5-Decide`, bajo licencia Apache 2.0. No se publican parametros, arquitectura, longitud de contexto, idiomas, formato de pesos ni resultados de evaluacion. Tampoco se ofrece guia de carga, conversion, integracion o evaluacion.

Por tanto, esta ficha debe leerse como una descripcion de un artefacto de despliegue interno y no como la evaluacion de un modelo abierto reutilizable. Es relevante ahora unicamente para quienes integran el ecosistema Doppel o necesitan auditar procedencia y licencias de artefactos derivados de modelos abiertos en pipelines propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |
| Tipo de artefacto | runtime artifact versionado (no es un modelo autonomo) |
| Modelo del que deriva | fastino/GLiNER2.5-Decide (material modificado, Apache 2.0) |
| Inferencia directa soportada | no (`inference: false`) |
| Tamano del repositorio | 1,9 GB |
| Autor | DoppelApp |
| Fecha de creacion | 2026-09-24 |
| Ultima actualizacion | 2026-09-25 |
| Descargas | 0 |
| Likes | 0 |
| Region declarada | us |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

La model card no documenta arquitectura, datos de entrenamiento, numero de tokens, composicion del dataset ni metodo de alineacion (RLHF, DPO u otros). El autor indica de forma explicita que el formato y el contrato de compatibilidad son detalles privados y que no se proporciona ninguna guia de evaluacion o conversion externa.

El unico dato de procedencia disponible es que el artefacto incorpora material modificado derivado de `fastino/GLiNER2.5-Decide`, distribuido bajo Apache License 2.0, con el enlace de origen aportado a efectos de atribucion. Esa atribucion no implica que el artefacto exponga la misma interfaz, el mismo comportamiento ni las mismas capacidades que el modelo de origen: cualquier afirmacion sobre arquitectura subyacente o proceso de entrenamiento del artefacto Doppel seria especulativa y no esta respaldada por la informacion publicada.

## Capacidades

- No se declara ninguna capacidad funcional en la informacion disponible. El autor indica que `DoppelApp/judgment` no es un modelo autonomo ni una API publica soportada.
- No se documenta soporte de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta cobertura multilingue.
- No se documenta ningun modo especial (thinking mode, audio, vision u otros).
- El unico consumo previsto es a traves de las versiones compatibles del runtime de Doppel, segun el propio autor.

## Casos de uso

Cualquier caso de uso listado aqui es hipotetico y no esta respaldado por la documentacion del autor, que prohibe explicitamente la integracion o evaluacion externa. Se enumeran solo para delimitar el escenario:

- Integracion dentro del runtime de Doppel: un despliegue de Doppel compatible consumiria este artefacto como dependencia versionada. Es el unico uso declarado y requiere la version de runtime correspondiente.
- Auditoria de licencias y procedencia: un equipo legal o de compliance puede usar la seccion de licencia y atribucion de la model card para verificar el cumplimiento de Apache 2.0 sobre el material derivado de `fastino/GLiNER2.5-Decide`.
- Inventario de artefactos internos: registrar el artefacto, su tamano (1,9 GB) y sus fechas de version en un catalogo de dependencias de despliegue.
- Verificacion de ausencia de datos de cliente: el autor afirma que el repositorio no contiene datos de cliente; util para revisiones de privacidad sobre artefactos distribuidos.
- Control de cambios de compatibilidad: dado que el contrato puede cambiar sin aviso, monitorizar la fecha de actualizacion del repositorio para detectar nuevas revisiones antes de desplegar.
- Analisis de cadena de suministro de modelos: rastrear el linaje hacia `fastino/GLiNER2.5-Decide` para evaluar el riesgo de dependencia de un artefacto propietario no auditable.
- No apto para: inferencia directa, fine-tuning, conversion a GGUF o despliegue con servidores de inferencia genericos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K, evaluaciones de extraccion de entidades ni ninguna otra, y declara explicitamente que no se proporciona guia de evaluacion.

## Requisitos de hardware

- VRAM estimada: no disponible. El autor no publica numero de parametros ni precision de pesos.
- Estimacion orientativa a partir del tamano del repositorio (1,9 GB): si el artefacto contuviera exclusivamente pesos en precision de 32 bits, equivaldria a del orden de 475 millones de parametros; en precision de 16 bits, del orden de 950 millones. Son cotas aproximadas derivadas del tamano del repo, no datos confirmados por el autor, y el repositorio puede contener otros recursos ademas de pesos.
- GPU recomendadas: no disponibles. No hay guia de despliegue publicada.
- Compatibilidad con GPU de consumo: no confirmada. Con la estimacion anterior, un artefacto de ese orden de magnitud cabria en GPUs de consumo con 8-16 GB de VRAM, pero esto no esta validado por el autor.
- Opciones de despliegue: ninguna soportada. El autor indica que no se ofrece guia de carga, conversion ni integracion, y el repositorio esta marcado con `inference: false`. No se contempla vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Carga externa |
|---|---|---|---|---|---|
| DoppelApp/judgment | Artefacto de runtime propietario | no disponible | no disponible | Apache 2.0 | No soportada |
| fastino/GLiNER2.5-Decide | Modelo publico del que deriva | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Apache 2.0 | No disponible en la informacion proporcionada |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para establecer una comparativa tecnica con alternativas de la misma categoria, dado que no se publican parametros, contexto ni resultados de evaluacion del artefacto analizado.

## Limitaciones y advertencias

- No es un modelo autonomo: la model card lo describe como un artefacto de runtime consumido por releases compatibles de Doppel.
- Sin soporte externo: el autor no ofrece garantia ni soporte para uso fuera de Doppel, ni guia de carga, conversion o integracion.
- Contrato inestable: el formato, el contrato de compatibilidad y el comportamiento pueden cambiar sin aviso, lo que desaconseja fijarlo como dependencia estable en produccion.
- Sin evaluacion publica: no hay benchmarks ni evaluaciones de sesgo, alucinacion o robustez.
- Idiomas y contexto: sin datos publicados; no se puede garantizar cobertura multilingue ni una ventana de contexto concreta.
- Licencia: Apache 2.0 permite uso comercial del artefacto y del material derivado, siempre que se conserven los avisos de atribucion a `fastino/GLiNER2.5-Decide` y el texto de la licencia. La atribucion no otorga ningun contrato de compatibilidad con Doppel.
- Riesgo de alucinacion: no evaluable, ya que no se documenta ninguna tarea generativa.
- Privacidad: el autor afirma que el repositorio no contiene datos de cliente; no se aporta verificacion independiente de esa afirmacion.
- Repositorio sin traccion publica: cero descargas y cero likes en el momento de la consulta, lo que limita la validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DoppelApp/judgment
- Modelo de origen citado en la atribucion: https://huggingface.co/fastino/GLiNER2.5-Decide
- Texto de la licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.

# Anticloud/jury-bank

## Resumen

Anticloud/jury-bank es un repositorio alojado en Hugging Face por la organizacion Anticloud, etiquetado internamente como un artefacto de dominio vertical (`vertical:jury`) construido sobre el arnes de agentes OpenHands (`harness:openhands`). No se trata de un modelo de lenguaje con pesos publicos en el sentido habitual, sino de un banco de datos o conjunto de artefactos asociado a un flujo de evaluacion tipo jurado, segun indican sus metadatos. La ficha se centra en lo que la informacion disponible permite afirmar con rigor, y marca como no disponible todo aquello que no aparece en las fuentes.

El repositorio tiene cero descargas y cero likes en el momento de la consulta, fue creado y actualizado el 8 de noviembre de 2026 con apenas dos segundos de diferencia, y su acceso esta restringido (gated): requiere aceptar condiciones en Hugging Face antes de descargar. La licencia declarada es `anticommons-0.1.0`, una licencia de tipo anticommons que restringe la explotacion comercial y la redistribucion, no equivalente a las licencias permisivas habituales (Apache 2.0, MIT) ni a las de tipo comunitario (Llama, Gemma).

La unica referencia externa encontrada en la busqueda web es una nota de prensa sobre el modelo PAX v52 de Anticloud, de 27.000 millones de parametros, usado en un benchmark de investigacion cientifica. Esa nota no describe el contenido de jury-bank ni confirma que este repositorio contenga pesos de PAX v52, por lo que no se puede establecer una equivalencia entre ambos. No hay informacion publica sobre arquitectura, tamano, contexto ni datos de entrenamiento de este repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | anticommons-0.1.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No hay informacion publica sobre la arquitectura del repositorio. Los metadatos de Hugging Face indican las etiquetas `vertical:jury` y `harness:openhands`, lo que sugiere que el artefacto esta disenado para ejecutarse dentro del arnes de agentes OpenHands y orientado a tareas de evaluacion o deliberacion tipo jurado. Esta interpretacion se basa unicamente en las etiquetas y no esta confirmada por documentacion adicional.

Tampoco se dispone de datos sobre volumen de entrenamiento, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones tecnicas. La nota de prensa sobre PAX v52 menciona un modelo de 27B parametros usado para generar marcos de investigacion estructurados en 20 problemas abiertos, pero no vincula ese modelo a jury-bank ni aporta detalles de arquitectura reutilizables para esta ficha.

## Capacidades

- No se han documentado capacidades especificas del repositorio en la informacion disponible.
- La etiqueta `harness:openhands` sugiere integracion con un entorno de agentes, pero no se detalla que tareas cubre.
- La etiqueta `vertical:jury` apunta a un uso orientado a evaluacion o deliberacion, sin especificar modalidad (texto, codigo, etc.).
- Soporte de tool calling: no disponible.
- Soporte de agentes multi-paso: no disponible como capacidad documentada, mas alla de la etiqueta del arnes.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Evaluacion automatizada de respuestas en flujos de anotacion: el artefacto podria emplearse como banco de referencia para un jurado automatizado dentro de OpenHands, aunque el contenido concreto del banco no esta documentado.
- Investigacion sobre sistemas de deliberacion multi-agente: util como material de partida para reproducir experimentos de evaluacion por jurado, siempre que se acepten las condiciones de acceso.
- Integracion en pipelines de OpenHands: al declarar ese arnes, encaja en entornos que ya usan OpenHands para orquestar agentes, aunque se desconoce el formato exacto de los artefactos.
- Auditoria de criterios de evaluacion: si el banco contiene casos y criterios, podria servir para comparar decisiones de distintos evaluadores, sin confirmacion publica del contenido.
- Docencia y formacion en evaluacion de modelos: como ejemplo de artefacto vertical con licencia restrictiva, util para discutir gobernanza de datos y licencias anticommons.
- Prototipado interno con acceso restringido: adecuado para equipos que puedan aceptar las condiciones de Hugging Face y la licencia anticommons, no para productos comerciales sin negociacion previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no conocerse tamano ni formato de pesos.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; la unica referencia de ejecucion es el arnes OpenHands segun la etiqueta.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado artefactos comparables de la misma categoria (bancos de evaluacion tipo jurado sobre OpenHands) en la informacion proporcionada, y el repositorio no publica especificaciones que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y exige aceptar condiciones en Hugging Face antes de su descarga.
- Licencia `anticommons-0.1.0`: restringe usos comerciales y redistribucion; conviene revisar el texto completo antes de cualquier uso en produccion.
- Ausencia total de documentacion publica sobre arquitectura, datos y evaluacion, lo que impide validar su calidad o idoneidad tecnica.
- Cero descargas y cero likes en el momento de la consulta: sin evidencia de uso o validacion por parte de la comunidad.
- Riesgo de confusion con el modelo PAX v52 de Anticloud mencionado en prensa: no hay confirmacion de que jury-bank contenga ese modelo ni sus pesos.
- Sin datos sobre sesgos, alucinacion o cobertura idiomatica, por lo que no se pueden evaluar riesgos de ese tipo.
- Fechas de creacion y actualizacion muy proximas (dos segundos), lo que sugiere un artefacto subido de forma automatica o sin curacion posterior.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Anticloud/jury-bank
- Nota de prensa sobre PAX v52 de Anticloud (contexto de la organizacion, no del repositorio): https://finance.yahoo.com/technology/ai/articles/anticloud-reports-0-013-electricity-071100578.html

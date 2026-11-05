# cyttic/exp35base-mobile-rescore-test

## Resumen

`cyttic/exp35base-mobile-rescore-test` es un artefacto publicado en HuggingFace por el usuario cyttic que no contiene pesos de un modelo generativo, sino exclusivamente metricas de evaluacion (un fichero `results.json`) generadas por el script `TrOCR_Hebrew/exp35/make_mobile_rescore_kaggle.py`. La model card indica explicitamente que el repositorio almacena solo metricas, sin imagenes ni textos, y que corresponde a una "segunda pasada" (second pass) de un experimento denominado exp35-base realizado con pequenos modelos de lenguaje enmascarados (masked LMs) para hebreo, validado sobre el conjunto HHD.

Por tanto, no se trata de un modelo entrenado y distribuible, sino de un contenedor de resultados experimentales asociado a un pipeline de reconocimiento optico de caracteres (OCR) para hebreo basado presumiblemente en TrOCR. El identificador "mobile-rescore" sugiere una etapa de re-puntuacion (rescoring) orientada a despliegue movil, pero esta interpretacion no se confirma en la informacion disponible. El repositorio no tiene descargas ni likes y fue creado el 5 de noviembre de 2026.

Dado que no hay pesos, tokenizador, configuracion de arquitectura ni datos de entrenamiento publicados, la mayoria de los campos tecnicos de esta ficha deben marcarse como no disponibles. La ficha se completa igualmente para dejar constancia de que el artefacto no es utilizable como modelo y de que su interes es exclusivamente documental dentro del experimento del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no contiene pesos ni configuracion de modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el experimento hace referencia a hebreo, pero no se declara soporte de idiomas del artefacto) |
| Licencia | MIT |
| Formato de pesos | no disponible (el contenido declarado es un fichero `results.json` con metricas) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre arquitectura, tamano, datos de entrenamiento ni proceso de ajuste. La model card unicamente describe el contexto experimental: una "second pass" sobre `exp35-base` empleando pequenos masked LMs para hebreo y validada sobre HHD. El nombre del script generador (`TrOCR_Hebrew/exp35/make_mobile_rescore_kaggle.py`) apunta a un pipeline de OCR basado en TrOCR ejecutado en Kaggle, pero no se documentan ni la variante de TrOCR empleada, ni el modelo masked LM concreto, ni el numero de tokens de entrenamiento, ni si hubo ajuste supervisado o preferencias.

La innovacion tecnica que sugiere el nombre (rescoring movil de candidatos OCR mediante un modelo de lenguaje enmascarado) no puede confirmarse ni cuantificarse con la informacion disponible.

## Capacidades

- No se puede confirmar ninguna capacidad de generacion, razonamiento, codigo, matematicas o vision, porque el repositorio no incluye pesos de modelo.
- No hay evidencia de soporte de tool calling ni de function calling.
- No hay evidencia de soporte de agentes ni de razonamiento multi-paso.
- No se declaran capacidades multilingues; la referencia a hebreo aparece solo en el titulo del experimento.
- No se documenta ningun modo especial (thinking mode, vision, audio).
- El unico contenido verificable es un conjunto de metricas de evaluacion en formato JSON.

## Casos de uso

- Auditoria de experimentos: el repositorio sirve para conservar y consultar las metricas de la segunda pasada del experimento exp35-base, permitiendo reproducir comparaciones entre ejecuciones.
- Trazabilidad de pipelines OCR: el fichero `results.json` puede usarse como registro de referencia para verificar que el script `make_mobile_rescore_kaggle.py` produjo los resultados esperados en la validacion HHD.
- Comparacion de variantes de rescoring: al contener solo metricas, permite contrastar distintas configuraciones de masked LMs pequenos para hebreo sin necesidad de redistribuir pesos.
- Documentacion de tesis o articulo: las metricas pueden citarse como evidencia experimental dentro de un trabajo sobre OCR en hebreo.
- Integracion en CI de investigacion: un pipeline interno puede descargar el JSON y compararlo con una nueva ejecucion para detectar regresiones en la etapa de rescoring.
- Archivo a largo plazo: al no incluir datos sensibles (ni imagenes ni textos), el artefacto es adecuado para almacenamiento publico de resultados bajo licencia MIT.

En ningun caso el artefacto puede emplearse para inferencia, atencion al cliente, generacion de codigo ni ninguna otra tarea de modelo desplegable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que las metricas estan en `results.json`, pero los valores concretos no se incluyen en los datos proporcionados.

## Requisitos de hardware

- VRAM para inferencia: no aplicable, el repositorio no contiene pesos de modelo.
- GPU recomendadas: no aplicable.
- Ejecucion en GPU de consumo: no aplicable.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicables.
- Latencia y throughput: no disponibles.

El unico requisito real es disponer de un lector de JSON para inspeccionar `results.json`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/exp35base-mobile-rescore-test | no disponible | no disponible | no disponible (solo metricas en JSON) | MIT | HuggingFace, sin descargas |
| TrOCR (variantes de Microsoft) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |
| Masked LMs pequenos para hebreo (familia no especificada) | no disponible | no disponible | no disponible | no disponible | no disponible |

No es posible establecer una comparativa tecnica real: el artefacto analizado no es un modelo desplegable y los modelos alternativos citados en la model card no se identifican con suficiente detalle.

## Limitaciones y advertencias

- El repositorio no contiene pesos, tokenizador ni configuracion; no puede cargarse con `transformers`, `vLLM` ni ninguna otra libreria de inferencia.
- No hay informacion sobre sesgos, riesgo de alucinacion ni comportamiento linguistico, ya que no existe modelo evaluable.
- La referencia al hebreo proviene unicamente del titulo del experimento; no se declara cobertura de idiomas del artefacto.
- La licencia MIT se aplica al contenido publicado (metricas), pero no habilita ningun uso de modelo inexistente.
- Las metricas no se incluyen en la informacion disponible, por lo que no pueden validarse ni contrastarse.
- El nombre "mobile-rescore" sugiere un objetivo de despliegue movil que no esta documentado ni respaldado por artefactos en el repositorio.
- El repositorio tiene cero descargas y cero likes, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cyttic/exp35base-mobile-rescore-test
- Script generador citado en la model card: `TrOCR_Hebrew/exp35/make_mobile_rescore_kaggle.py` (ruta interna, sin URL publica disponible)
- Fichero de metricas citado: `results.json` (sin URL directa disponible en la informacion proporcionada)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.

# Anticloud/sales-bank

## Resumen

Anticloud/sales-bank es un artefacto publicado en Hugging Face por el usuario Anticloud bajo una licencia denominada anticommons-0.1.0, con acceso restringido (gated) que obliga a aceptar condiciones en la plataforma antes de poder descargarlo. Los metadatos lo etiquetan con la vertical `sales` y el harness `openhands`, lo que sugiere que se trata de un banco de tareas, trayectorias o datos de evaluacion orientado a agentes de ventas ejecutados sobre el framework OpenHands, y no de un modelo de lenguaje con pesos publicados.

No hay informacion disponible sobre arquitectura, numero de parametros, contexto, tokenizador ni datos de entrenamiento. El repositorio no declara pipeline, idiomas soportados ni formato de pesos, y las cifras publicas de descargas y likes son cero, lo que indica una publicacion reciente y sin adopcion registrada. Cualquier uso en produccion requeriria primero solicitar acceso y revisar el contenido real del repositorio.

La relevancia de esta ficha es, por tanto, acotada: sirve para documentar la existencia del artefacto, su encuadre como material para agentes de ventas y las precauciones derivadas de su licencia no estandar y de su acceso restringido. No debe interpretarse como un modelo listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | anticommons-0.1.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura del artefacto. Los tags del repositorio (`vertical:sales`, `harness:openhands`) apuntan a que el contenido esta disenado para ejecutarse o evaluarse con OpenHands, un harness de agentes que opera sobre modelos de lenguaje externos, pero no confirman que el repositorio contenga pesos de un transformer, un MoE ni ningun otro tipo de red.

Tampoco hay datos sobre volumen de entrenamiento, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones tecnicas. La etiqueta `anticloud` sugiere una orientacion a despliegue local o fuera de la nube, pero es una inferencia a partir del nombre y no un dato verificado.

## Capacidades

- No disponible: no se documentan capacidades de generacion de texto, razonamiento, codigo, matematicas ni vision.
- No disponible: no se confirma soporte de tool calling ni function calling.
- No disponible: no se confirma soporte de agentes multi-paso, aunque el tag `harness:openhands` sugiere un uso previsto en entornos de agente.
- No disponible: no se declaran capacidades multilingues ni idiomas cubiertos.
- No disponible: no se indica ningun modo especial (thinking, vision, audio).

## Casos de uso

- Evaluacion de agentes de ventas: el artefacto podria emplearse como banco de pruebas para medir como un agente basado en OpenHands resuelve tareas comerciales, siempre que el contenido se confirme tras solicitar acceso.
- Investigacion sobre flujos de prospeccion: utilizable como referencia para comparar estrategias de agente en tareas de calificacion de leads, si el repositorio incluye trayectorias etiquetadas.
- Reproducibilidad de experimentos: al estar versionado en Hugging Face con fecha de creacion concreta (2026-11-08), permite fijar una revision para replicar resultados de evaluacion.
- Formacion interna de equipos comerciales: podria servir como material de analisis de conversaciones, sujeto a revision de licencia.
- Auditoria de comportamiento de agentes: util para estudiar fallos y alucinaciones en tareas de ventas antes de desplegar un agente real.
- Integracion en pipelines de evaluacion continua: si el formato lo permite, engancharlo a un runner de OpenHands para regresion de agentes comerciales.

En todos los casos, la viabilidad depende de obtener acceso y de verificar el contenido real, que no esta descrito en los metadatos publicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible, al no conocerse si el artefacto contiene pesos de un modelo.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; si el contenido es un banco de tareas para OpenHands, el requisito de hardware vendra determinado por el modelo de lenguaje que se conecte al harness, no por este repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado artefactos comparables con la misma combinacion de vertical (`sales`) y harness (`openhands`) en la informacion proporcionada, ni se conocen sus parametros o rendimiento para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Acceso restringido: requiere aceptar condiciones en Hugging Face; no es descargable de forma anonima.
- Licencia no estandar: `anticommons-0.1.0` no es una licencia OSI reconocida; debe revisarse el texto completo antes de cualquier uso comercial o redistribucion.
- Ausencia total de documentacion tecnica: sin arquitectura, parametros ni datos de entrenamiento, no es posible evaluar calidad, sesgos ni riesgos de alucinacion.
- Riesgo de confusion: el nombre `sales-bank` y los tags pueden llevar a asumir que es un modelo desplegable cuando podria ser unicamente un conjunto de datos o tareas.
- Sin senales de adopcion: cero descargas y cero likes en el momento de la consulta, lo que limita la validacion por parte de la comunidad.
- Fecha de creacion futura respecto a la mayoria de referencias disponibles, lo que dificulta contrastar el artefacto con literatura existente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Anticloud/sales-bank
- Blog de referencia sobre agentes de ventas (HubSpot): https://blog.hubspot.com/sales/ai-agent-tools
